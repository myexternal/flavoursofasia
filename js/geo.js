// Builds 3D products from a real packshot and its silhouette (media/shapes.json).
// pouch: a pillow-shaped packet; box: a flat-sided carton; lathe: a tin, jar or bottle turned from the outline.
import * as THREE from 'three';

const lerp = (a, b, t) => a + (b - a) * t;

function smoothRows(rows) {
  return rows.map((r, i) => {
    const a = rows[Math.max(0, i - 1)], c = rows[Math.min(rows.length - 1, i + 1)];
    return [r[0], (a[1] + 2 * r[1] + c[1]) / 4, (a[2] + 2 * r[2] + c[2]) / 4];
  });
}

export function pouchGeometry(sh, { height, depth, flat = false, edge = 0.14, C = 18 }) {
  const rows = smoothRows(sh.rows), R = rows.length, W = sh.W, H = sh.H;
  const top = rows[0][0], bot = rows[R - 1][0], s = height / (bot - top);
  let minx = 1e9, maxx = -1e9;
  rows.forEach(r => { minx = Math.min(minx, r[1]); maxx = Math.max(maxx, r[2]); });
  const cx = (minx + maxx) / 2, cy = (top + bot) / 2;
  const zf = (u, v) => flat ? depth / 2 : depth / 2 * (edge + (1 - edge) *
    Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(2 * u - 1), 3))) * Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(2 * v - 1), 5))));
  const pos = [], uv = [], idx = [];
  const P = (i, j) => { const r = rows[i], u = j / C; return [lerp(r[1], r[2], u), r[0], u, i / (R - 1)]; };
  for (const side of [1, -1]) {
    const base = pos.length / 3;
    for (let i = 0; i < R; i++) for (let j = 0; j <= C; j++) {
      const [x, y, u, v] = P(i, j);
      pos.push((x - cx) * s, (cy - y) * s, side * zf(u, v)); uv.push(x / W, 1 - y / H);
    }
    for (let i = 0; i < R - 1; i++) for (let j = 0; j < C; j++) {
      const a = base + i * (C + 1) + j, b = a + 1, c = a + C + 1, d = c + 1;
      if (side > 0) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
    }
  }
  // side wall around the outline
  const loop = [];
  for (let j = 0; j <= C; j++) loop.push([0, j]);
  for (let i = 1; i < R; i++) loop.push([i, C]);
  for (let j = C - 1; j >= 0; j--) loop.push([R - 1, j]);
  for (let i = R - 2; i > 0; i--) loop.push([i, 0]);
  const base = pos.length / 3;
  loop.forEach(([i, j]) => {
    const [x, y, u, v] = P(i, j), z = zf(u, v);
    pos.push((x - cx) * s, (cy - y) * s, z, (x - cx) * s, (cy - y) * s, -z);
    uv.push(x / W, 1 - y / H, x / W, 1 - y / H);
  });
  const N = loop.length;
  for (let k = 0; k < N; k++) {
    const F = base + 2 * k, B = F + 1, F2 = base + 2 * ((k + 1) % N), B2 = F2 + 1;
    idx.push(F, F2, B, F2, B2, B);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return { geo: g, w: (maxx - minx) * s, h: height, d: depth, kind: 'box' };
}

export function latheGeometry(sh, { height, K = 40 }) {
  const rows = smoothRows(sh.rows), R = rows.length, W = sh.W, H = sh.H;
  const top = rows[0][0], bot = rows[R - 1][0], s = height / (bot - top), cy = (top + bot) / 2;
  const centers = rows.map(r => (r[1] + r[2]) / 2).sort((a, b) => a - b), cx = centers[R >> 1];
  const pos = [], uv = [], idx = [];
  let rmax = 0;
  for (let i = 0; i < R; i++) {
    const r = rows[i], rp = (r[2] - r[1]) / 2, y = (cy - r[0]) * s; rmax = Math.max(rmax, rp * s);
    for (let k = 0; k <= K; k++) {
      const t = 2 * Math.PI * k / K;
      pos.push(rp * s * Math.sin(t), y, rp * s * Math.cos(t));
      uv.push((cx + rp * Math.sin(t) * 0.985) / W, 1 - r[0] / H);
    }
  }
  for (let i = 0; i < R - 1; i++) for (let k = 0; k < K; k++) {
    const a = i * (K + 1) + k, b = a + 1, c = a + K + 1, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const bodyCount = idx.length;
  const cap = (i, up) => {
    const r = rows[i], rp = (r[2] - r[1]) / 2 * s, y = (cy - r[0]) * s, c0 = pos.length / 3;
    pos.push(0, y, 0); uv.push(cx / W, 1 - r[0] / H);
    for (let k = 0; k <= K; k++) { const t = 2 * Math.PI * k / K; pos.push(rp * Math.sin(t), y, rp * Math.cos(t)); uv.push(cx / W, 1 - r[0] / H); }
    for (let k = 0; k < K; k++) up ? idx.push(c0, c0 + 1 + k, c0 + 2 + k) : idx.push(c0, c0 + 2 + k, c0 + 1 + k);
  };
  cap(0, true); const topEnd = idx.length; cap(R - 1, false);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  g.addGroup(0, bodyCount, 0); g.addGroup(bodyCount, topEnd - bodyCount, 1); g.addGroup(topEnd, idx.length - topEnd, 2);
  return { geo: g, w: rmax * 2, h: height, d: rmax * 2, r: rmax, kind: 'cyl' };
}

const texCache = new Map();
export function loadTex(url, renderer) {
  if (texCache.has(url)) return texCache.get(url);
  const t = new THREE.TextureLoader().load(url);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texCache.set(url, t); return t;
}

// spec: {f:'p16', type:'pouch'|'box'|'lathe', h: height (1 unit = 10 cm), d: depth, mat:'tin'|'glass'|'paper'}
export function makeProduct(spec, shapes, renderer, base = (window.__base||'') + 'media/p/') {
  const sh = shapes[spec.f];
  const map = loadTex(base + spec.f + '.jpg', renderer);
  let built, mesh;
  if (spec.type === 'lathe') {
    built = latheGeometry(sh, { height: spec.h });
    const body = new THREE.MeshStandardMaterial({ map, roughness: spec.mat === 'tin' ? 0.32 : 0.18, metalness: spec.mat === 'tin' ? 0.25 : 0.05 });
    const capTop = spec.mat === 'tin'
      ? new THREE.MeshStandardMaterial({ color: '#cfd0cf', roughness: 0.3, metalness: 0.85 })
      : new THREE.MeshStandardMaterial({ color: sh.topc, roughness: 0.4, metalness: 0.2 });
    const capBot = spec.mat === 'tin' ? capTop : new THREE.MeshStandardMaterial({ color: sh.botc, roughness: 0.3 });
    mesh = new THREE.Mesh(built.geo, [body, capTop, capBot]);
  } else {
    built = pouchGeometry(sh, { height: spec.h, depth: spec.d, flat: spec.type === 'box' });
    const m = new THREE.MeshStandardMaterial({ map, roughness: spec.type === 'box' ? 0.7 : 0.46, metalness: 0, side: THREE.DoubleSide });
    mesh = new THREE.Mesh(built.geo, m);
  }
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData.size = built;
  return mesh;
}
