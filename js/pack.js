// The box: scroll-scrubbed. Products drop in, flaps fold, red tape runs over, the label lands, the box leaves.
import * as THREE from 'three';
import { RoomEnvironment } from '../vendor/jsm/environments/RoomEnvironment.js';
import { makeProduct } from './geo.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const eo = t => 1 - Math.pow(1 - t, 3);
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const back = t => { const c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

function kraftCanvas(w, h, seed = 3) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = '#c69c6c'; g.fillRect(0, 0, w, h);
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 40; i++) { g.fillStyle = r() < .5 ? 'rgba(90,60,30,.07)' : 'rgba(255,235,200,.08)'; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  g.lineWidth = 1;
  for (let i = 0; i < w / 3; i++) { g.strokeStyle = r() < .5 ? 'rgba(100,65,30,.08)' : 'rgba(255,240,210,.09)'; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - .5) * 60, y + (r() - .5) * 8); g.stroke(); }
  // corrugation hint
  for (let x = 0; x < w; x += 9) { g.fillStyle = 'rgba(80,50,20,.025)'; g.fillRect(x, 0, 4, h); }
  return c;
}
function tex(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

export function initPack({ canvas, host, specs, shapes, keys, phone, label }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
  const sun = new THREE.DirectionalLight('#fff3e2', 2.3); sun.position.set(-5, 12, 7); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 5; sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -9, right: 14, top: 9, bottom: -9, near: 1, far: 40 });
  scene.add(sun, new THREE.HemisphereLight('#fff8ee', '#a88e74', 0.65));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.ShadowMaterial({ opacity: 0.17 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 100);

  // ---- the box
  const W = 5.4, D = 3.8, H = 2.3, T = 0.07;
  const kraft = tex(kraftCanvas(512, 512));
  kraft.wrapS = kraft.wrapT = THREE.RepeatWrapping;
  const kMat = new THREE.MeshStandardMaterial({ map: kraft, roughness: 0.92 });
  const inMat = new THREE.MeshStandardMaterial({ color: '#a87f52', roughness: 0.95 });
  // printed front panel
  const fc = kraftCanvas(1024, 512, 9), fg = fc.getContext('2d');
  const printed = tex(fc);
  async function printFront() {
    try { await document.fonts.load('900 120px Anybody'); await document.fonts.load('800 60px "Abhaya Libre"'); } catch (e) {}
    fg.drawImage(kraftCanvas(1024, 512, 9), 0, 0);
    fg.fillStyle = 'rgba(40,22,10,.86)'; fg.strokeStyle = 'rgba(40,22,10,.86)';
    fg.beginPath(); fg.arc(150, 256, 92, 0, Math.PI * 2); fg.lineWidth = 10; fg.stroke();
    fg.font = '800 110px "Abhaya Libre", serif'; fg.textAlign = 'center'; fg.textBaseline = 'middle'; fg.fillText('ෆ', 150, 262);
    fg.textAlign = 'left'; fg.font = '900 112px Anybody, sans-serif'; fg.fillText('FLAVOURS', 280, 200); fg.fillText('OF ASIA', 280, 312);
    fg.font = '600 30px "Martian Mono", monospace'; fg.fillText('RIIPUKSENKATU 3 · TAMPERE', 284, 400);
    fg.font = '900 44px Anybody, sans-serif'; fg.fillText('↑↑', 930, 90);
    printed.needsUpdate = true;
  }
  printFront();
  const pMat = new THREE.MeshStandardMaterial({ map: printed, roughness: 0.92 });
  const box = new THREE.Group(); scene.add(box);
  const part = (geo, mats, x, y, z, parent = box) => { const m = new THREE.Mesh(geo, mats); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  part(new THREE.BoxGeometry(W, T, D), kMat, 0, T / 2, 0);
  // front wall gets the print on its outside (+z face is material index 4)
  part(new THREE.BoxGeometry(W, H, T), [kMat, kMat, kMat, kMat, pMat, inMat], 0, H / 2, D / 2);
  part(new THREE.BoxGeometry(W, H, T), [kMat, kMat, kMat, kMat, inMat, kMat], 0, H / 2, -D / 2);
  part(new THREE.BoxGeometry(T, H, D), [kMat, inMat, kMat, kMat, kMat, kMat], -W / 2, H / 2, 0);
  part(new THREE.BoxGeometry(T, H, D), [inMat, kMat, kMat, kMat, kMat, kMat], W / 2, H / 2, 0);
  const flap = (px, py, pz, gw, gd, mx, mz) => { const g = new THREE.Group(); g.position.set(px, py, pz); box.add(g); part(new THREE.BoxGeometry(gw, T * 0.9, gd), [kMat, kMat, kMat, inMat, kMat, kMat], mx, 0, mz, g); return g; };
  const fF = flap(0, H + T, D / 2, W, D / 2, 0, -D / 4);
  const fB = flap(0, H + T, -D / 2, W, D / 2, 0, D / 4);
  const fL = flap(-W / 2, H, 0, D / 2, D, D / 4, 0);
  const fR = flap(W / 2, H, 0, D / 2, D, -D / 4, 0);
  const OPEN = THREE.MathUtils.degToRad(128);
  let dirty = true, lastP = -1;

  // ---- tape and label
  const tc = document.createElement('canvas'); tc.width = 2048; tc.height = 160; const tg = tc.getContext('2d');
  const tapeTex = tex(tc);
  async function drawTape() {
    try { await document.fonts.load('900 90px Anybody'); } catch (e) {}
    tg.fillStyle = '#d32f1e'; tg.fillRect(0, 0, 2048, 160); tg.fillStyle = 'rgba(255,255,255,.08)'; tg.fillRect(0, 12, 2048, 4); tg.fillRect(0, 144, 2048, 4);
    tg.fillStyle = '#f7efe2'; tg.font = '900 80px Anybody, sans-serif'; tg.textBaseline = 'middle';
    let x = 20; while (x < 2048) { tg.fillText('FLAVOURS OF ASIA · TAMPERE ·', x, 84); x += tg.measureText('FLAVOURS OF ASIA · TAMPERE · ').width; }
    tapeTex.needsUpdate = true;
  }
  drawTape();
  const tapeMat = new THREE.MeshStandardMaterial({ map: tapeTex, roughness: 0.35, metalness: 0, transparent: false });
  const TW = 0.95;
  const topTapeG = new THREE.BoxGeometry(TW, 0.02, D + 0.02); topTapeG.translate(0, 0, (D + 0.02) / 2); // grows from the back edge
  // rotate texture so the text runs along the tape (z)
  const uv = topTapeG.attributes.uv; for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); uv.setXY(i, 1 - v, u); }
  const topTape = part(topTapeG, tapeMat, 0, H + T * 2 + 0.012, -D / 2 - 0.01); topTape.castShadow = false;
  const frontTapeG = new THREE.BoxGeometry(TW, 1.1, 0.02); frontTapeG.translate(0, -0.55, 0);
  { const a = frontTapeG.attributes.uv; for (let i = 0; i < a.count; i++) { const u = a.getX(i), v = a.getY(i); a.setXY(i, v * 0.32, 1 - u); } }
  const frontTape = part(frontTapeG, tapeMat, 0, H + T * 2 + 0.012, D / 2 + T / 2 + 0.012); frontTape.castShadow = false;
  const backTape = part(frontTapeG.clone(), tapeMat, 0, H + T * 2 + 0.012, -D / 2 - T / 2 - 0.012); backTape.castShadow = false;

  const lc = document.createElement('canvas'); lc.width = 1000; lc.height = 640; const lg = lc.getContext('2d');
  const labelTex = tex(lc);
  let lastLabel = '';
  async function drawLabel(L) {
    const sig = JSON.stringify(L); if (sig === lastLabel) return; lastLabel = sig;
    try { await document.fonts.load('600 30px "Martian Mono"'); await document.fonts.load('900 90px Anybody'); } catch (e) {}
    lg.fillStyle = '#fffdf8'; lg.fillRect(0, 0, 1000, 640);
    lg.strokeStyle = '#1a1511'; lg.lineWidth = 8; lg.strokeRect(14, 14, 972, 612);
    lg.fillStyle = '#1a1511'; lg.textBaseline = 'top';
    lg.font = '600 26px "Martian Mono", monospace'; lg.fillText('FROM', 44, 44); lg.fillText('TO', 44, 220);
    lg.font = '600 34px "Martian Mono", monospace'; lg.fillText('Flavours of Asia', 200, 40); lg.fillText('Riipuksenkatu 3, Tampere', 200, 92);
    lg.fillRect(14, 170, 972, 6);
    lg.font = '900 150px Anybody, sans-serif'; lg.fillText(L.pc, 196, 206);
    lg.font = '600 30px "Martian Mono", monospace'; lg.fillText(L.zone.toUpperCase(), 200, 370);
    lg.fillRect(14, 440, 972, 6);
    lg.font = '600 30px "Martian Mono", monospace';
    lg.fillText(L.n ? `${L.n} ITEM${L.n === 1 ? '' : 'S'} · €${L.sub.toFixed(2)}` : 'YOUR BOX', 44, 490);
    lg.fillText('HANDLE WITH CARE', 44, 548);
    lg.fillStyle = '#d32f1e'; lg.font = '900 110px Anybody, sans-serif'; lg.textAlign = 'right'; lg.fillText('1/1', 950, 470); lg.textAlign = 'left';
    labelTex.needsUpdate = true; dirty = true;
  }
  const labelMesh = part(new THREE.BoxGeometry(3.1, 0.015, 1.98), [new THREE.MeshStandardMaterial({ color: '#fffdf8' }), null, new THREE.MeshStandardMaterial({ map: labelTex, roughness: 0.6 }), null, null, null].map(m => m || new THREE.MeshStandardMaterial({ color: '#fffdf8' })), 0, 0, 0);
  labelMesh.castShadow = true;
  const LREST = new THREE.Vector3(-1.05, H + T * 2 + 0.03, 0.62);
  drawLabel(label);

  // ---- products going in
  let items = [], curKeys = '';
  const SLOTS = [[-1.7, 0], [0, 0.05], [1.7, -0.05], [-0.9, 0.1], [0.85, 0], [0, -0.1]];
  function setItems(keys) {
    const sig = keys.join(); if (sig === curKeys) return; curKeys = sig;
    items.forEach(i => box.remove(i.mesh)); items = [];
    keys.slice(0, 6).forEach((k, i) => {
      const mesh = makeProduct({ ...specs[k] }, shapes, renderer); const sz = mesh.userData.size;
      const cyl = sz.kind === 'cyl';
      // fit the slot: lying down, at most 1.6 wide and 2.4 long
      const s = Math.min(1.6, 3.3 / sz.h, (i > 2 ? 1.5 : 1.65) / sz.w); mesh.scale.setScalar(s);
      const restQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, (i % 2 ? 0.06 : -0.05)));
      const thick = (cyl ? sz.r * 2 : sz.d) * s;
      const rest = new THREE.Vector3(SLOTS[i][0], T + thick / 2 + 0.02 + (i > 2 ? 0.75 : 0), SLOTS[i][1]);
      const start = new THREE.Vector3(SLOTS[i][0] * 1.15, 7.5 + i * 0.4, SLOTS[i][1] + 0.4);
      const startQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.4 + i * 0.3, i * 0.9, 0.5 - i * 0.2));
      mesh.position.copy(start); box.add(mesh);
      items.push({ mesh, rest, start, restQ, startQ });
    });
    dirty = true;
  }
  setItems(keys);

  function fit() {
    const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
    const d = phone ? 34 : 21;
    camera.position.set(-0.38 * d, 0.72 * d, 0.58 * d); camera.lookAt(phone ? -0.2 : 0.8, phone ? 0.4 : 1.1, 0);
    camera.updateProjectionMatrix(); dirty = true;
  }
  lastP = -1;
  fit(); new ResizeObserver(fit).observe(host);
  THREE.DefaultLoadingManager.onLoad = () => { dirty = true; };

  const q = new THREE.Quaternion();
  function render(p) {
    if (!dirty && Math.abs(p - lastP) < 1e-4) return; lastP = p; dirty = false;
    // 1. products drop in
    items.forEach((it, i) => {
      const t = seg(p, 0.02 + i * 0.038, 0.17 + i * 0.038);
      const m = it.mesh;
      m.position.x = THREE.MathUtils.lerp(it.start.x, it.rest.x, eo(t));
      m.position.z = THREE.MathUtils.lerp(it.start.z, it.rest.z, eo(t));
      m.position.y = it.rest.y + (it.start.y - it.rest.y) * (1 - t * t) + Math.sin(Math.min(1, t * 1.25) * Math.PI) * 0.0;
      q.slerpQuaternions(it.startQ, it.restQ, eo(t)); m.quaternion.copy(q);
      m.visible = p < 0.56;
    });
    // 2. flaps: ends first, then the long ones
    fL.rotation.z = OPEN * (1 - eio(seg(p, 0.30, 0.38)));
    fR.rotation.z = -OPEN * (1 - eio(seg(p, 0.33, 0.41)));
    fB.rotation.x = -OPEN * (1 - eio(seg(p, 0.39, 0.47)));
    fF.rotation.x = OPEN * (1 - eio(seg(p, 0.43, 0.51)));
    // 3. tape over the back, the seam and the front
    const tb = eo(seg(p, 0.52, 0.56)), tt = seg(p, 0.555, 0.62), tf = eo(seg(p, 0.615, 0.655));
    backTape.visible = tb > 0.001; backTape.scale.y = Math.max(0.001, tb);
    topTape.visible = tt > 0.001; topTape.scale.z = Math.max(0.001, eio(tt));
    frontTape.visible = tf > 0.001; frontTape.scale.y = Math.max(0.001, tf);
    // 4. the label lands
    const tl = seg(p, 0.66, 0.74);
    labelMesh.visible = tl > 0;
    labelMesh.position.set(LREST.x - 0.5 * (1 - tl), LREST.y + 3.2 * (1 - eo(tl)), LREST.z + 0.8 * (1 - tl));
    labelMesh.rotation.set(0, -0.12 + 0.9 * (1 - eo(tl)), 0);
    const sl = tl < 1 ? 1 + 0.08 * (1 - tl) : 1; labelMesh.scale.set(sl, 1, sl);
    // 5. out the door
    const to = seg(p, 0.82, 1);
    box.position.x = (phone ? 9 : 13) * eio(to);
    box.position.y = 0.6 * Math.sin(Math.PI * to);
    box.rotation.y = -0.35 * eio(to); box.rotation.z = -0.05 * Math.sin(Math.PI * to);
    camera.position.x = -0.38 * (phone ? 34 : 21) + 2.4 * eio(to);
    camera.lookAt((phone ? -0.2 : 0.8) + 4 * eio(to), phone ? 0.4 : 1.1, 0);
    renderer.render(scene, camera);
  }
  return {
    render, setItems, setLabel: L => { drawLabel(L); },
  };
}
