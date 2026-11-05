// The heap: their real products as 3D objects with physics. Drag to throw, tap for the price tag.
import * as THREE from 'three';
import * as CANNON from '../vendor/cannon-es.min.js';
import { RoomEnvironment } from '../vendor/jsm/environments/RoomEnvironment.js';
import { makeProduct } from './geo.js';

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function initHero({ canvas, host, keys, specs, shapes, onTap, onDragStart, reduced, phone }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const sun = new THREE.DirectionalLight('#fff4e6', 2.4); sun.position.set(-7, 18, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(phone ? 1024 : 2048, phone ? 1024 : 2048); sun.shadow.radius = 6; sun.shadow.bias = -0.0004;
  Object.assign(sun.shadow.camera, { near: 1, far: 60 });
  scene.add(sun, new THREE.HemisphereLight('#fff8ee', '#b89f86', 0.6));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 120);
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -28, 0), allowSleep: true });
  world.defaultContactMaterial.friction = 0.42; world.defaultContactMaterial.restitution = 0.18;
  world.solver.iterations = 12;
  const ground = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() }); ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0); world.addBody(ground);
  const walls = [0, 1, 2, 3].map(() => { const b = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() }); world.addBody(b); return b; });
  let DEPTH = 4, halfW = 10, viewH = 12, zFront = 4;
  const target = new THREE.Vector3();
  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const wantW = phone ? 10.5 : 25;
    const d = wantW / (2 * t * camera.aspect);
    viewH = 2 * d * t; halfW = wantW / 2;
    const tilt = THREE.MathUtils.degToRad(phone ? 58 : 50);
    // the visible floor runs from roughly z = -floorDepth to +floorDepth around the target
    const floorHalf = viewH / 2 / Math.sin(tilt);
    target.set(0, 0, 0);
    camera.position.set(0, Math.sin(tilt) * d, Math.cos(tilt) * d); camera.lookAt(target);
    camera.updateProjectionMatrix();
    DEPTH = floorHalf * 0.9; zFront = floorHalf * 0.82;
    const xw = halfW * (phone ? 0.84 : 0.93);
    walls[0].position.set(-xw, 0, 0); walls[0].quaternion.setFromEuler(0, Math.PI / 2, 0);
    walls[1].position.set(xw, 0, 0); walls[1].quaternion.setFromEuler(0, -Math.PI / 2, 0);
    walls[2].position.set(0, 0, -DEPTH); walls[2].quaternion.setFromEuler(0, 0, 0);
    walls[3].position.set(0, 0, zFront); walls[3].quaternion.setFromEuler(0, Math.PI, 0);
    sun.shadow.camera.left = -halfW - 2; sun.shadow.camera.right = halfW + 2; sun.shadow.camera.top = DEPTH + 2; sun.shadow.camera.bottom = -DEPTH - 2;
    sun.shadow.camera.updateProjectionMatrix();
  }
  fit();

  const R = rng(7);
  const items = keys.map((k, i) => {
    const mesh = makeProduct({ f: specs[k].f, ...specs[k] }, shapes, renderer);
    const sz = mesh.userData.size;
    const shape = sz.kind === 'cyl'
      ? new CANNON.Cylinder(sz.r * 0.98, sz.r * 0.98, sz.h, 12)
      : new CANNON.Box(new CANNON.Vec3(sz.w / 2, sz.h / 2, Math.max(0.12, sz.d * 0.42)));
    const body = new CANNON.Body({ mass: 0.4 + sz.w * sz.h * Math.max(sz.d, 0.3) * 0.35, shape, linearDamping: 0.08, angularDamping: 0.12, sleepSpeedLimit: 0.25 });
    body.allowSleep = true;
    mesh.userData.key = k; mesh.userData.body = body;
    scene.add(mesh);
    return { k, mesh, body, sz, i };
  });

  // where the heap lands: phone = lower half of the screen, desktop = right two thirds
  const zone = () => phone ? { x0: -0.7, x1: 0.7, z0: 0.15, z1: 0.9 } : { x0: 0.02, x1: 0.84, z0: -0.4, z1: 0.85 };
  function drop(it, t, y0) {
    const b = it.body, Z = zone();
    const x = (Z.x0 + (Z.x1 - Z.x0) * R()) * (halfW - it.sz.w / 2), z = (Z.z0 + (Z.z1 - Z.z0) * R()) * (DEPTH * 0.8);
    b.position.set(x, y0 + R() * 3, z);
    const cyl = it.sz.kind === 'cyl';
    const lie = cyl ? (R() < 0.5 ? Math.PI / 2 : 0) : (R() < 0.85 ? -Math.PI / 2 : 0);
    b.quaternion.setFromEuler(lie + (R() - 0.5) * 0.5, (R() - 0.5) * 1.6, (R() - 0.5) * 0.5);
    b.velocity.set((R() - 0.5) * 2, -6 - R() * 4, (R() - 0.5) * 2); b.angularVelocity.set((R() - 0.5) * 2, (R() - 0.5) * 3, (R() - 0.5) * 2);
    b.wakeUp(); it.dropAt = t;
  }
  const pending = [];
  // biggest first so the small things sit on top and stay visible
  const order = items.slice().sort((a, b) => b.sz.h * b.sz.w - a.sz.h * a.sz.w);
  order.forEach((it, n) => { it.body.position.set(0, -50 - n * 5, 0); it.body.type = CANNON.Body.KINEMATIC; pending.push([n * 0.085, it]); });

  let clock = 0;
  function spawnDue() {
    while (pending.length && pending[0][0] <= clock) {
      const [, it] = pending.shift(); it.body.type = CANNON.Body.DYNAMIC; it.body.mass = it.body.mass || 1; it.body.updateMassProperties();
      if (!world.bodies.includes(it.body)) world.addBody(it.body);
      drop(it, clock, 9);
    }
  }
  items.forEach(it => world.addBody(it.body));
  if (reduced) { // settle offline, show a still heap
    for (let s = 0; s < 60 * 6; s++) { clock += 1 / 60; spawnDue(); world.step(1 / 60); }
  }

  // ---- interaction
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const jointBody = new CANNON.Body({ mass: 0 }); jointBody.collisionFilterGroup = 0; jointBody.collisionFilterMask = 0; world.addBody(jointBody);
  let joint = null, drag = null, idle = 0;
  const plane = new THREE.Plane(), hitP = new THREE.Vector3();
  const meshes = items.map(i => i.mesh);
  function pick(e) {
    const r = host.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObjects(meshes, false)[0];
  }
  function grab(h, x, y, id) {
    const it = items.find(i => i.mesh === h.object), b = it.body;
    plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, h.point.y + 1.2, 0));
    const local = b.pointToLocalFrame(new CANNON.Vec3(h.point.x, h.point.y, h.point.z));
    jointBody.position.set(h.point.x, h.point.y, h.point.z);
    joint = new CANNON.PointToPointConstraint(b, local, jointBody, new CANNON.Vec3(0, 0, 0), 60); world.addConstraint(joint);
    b.wakeUp(); b.angularDamping = 0.6; idle = 0;
    drag = { it, x, y, t: performance.now(), moved: 0, id };
    try { host.setPointerCapture(id); } catch (err) {}
    host.classList.add('grabbing');
    onDragStart && onDragStart(it.k);
  }
  // touch: a quick tap shows the tag, a short hold picks the packet up, a swipe still scrolls the page
  let hold = null;
  host.addEventListener('pointerdown', e => {
    if (e.button && e.button !== 0) return;
    if (e.target.closest('a,button,input,.tag')) return;
    const h = pick(e); if (!h) return;
    if (e.pointerType === 'touch') {
      const it = items.find(i => i.mesh === h.object);
      hold = { h, it, x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, timer: setTimeout(() => { if (hold) { const q = hold; hold = null; grab(q.h, q.x, q.y, q.id); drag.t = 0; } }, 170) };
      return;
    }
    grab(h, e.clientX, e.clientY, e.pointerId);
    e.preventDefault();
  });
  host.addEventListener('touchmove', e => {
    if (drag) { e.preventDefault(); return; }
    if (hold) { const t = e.touches[0]; if (Math.hypot(t.clientX - hold.x, t.clientY - hold.y) > 10) { clearTimeout(hold.timer); hold = null; } }
  }, { passive: false });
  host.addEventListener('pointermove', e => {
    if (!drag) {
      if (e.pointerType === 'mouse') host.classList.toggle('grab', !!pick(e));
      return;
    }
    drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
    const r = host.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hitP)) {
      hitP.y = THREE.MathUtils.clamp(hitP.y, 0.4, 7); hitP.x = THREE.MathUtils.clamp(hitP.x, -halfW * 0.92, halfW * 0.92);
      jointBody.position.set(hitP.x, hitP.y, THREE.MathUtils.clamp(hitP.z, -DEPTH * 0.85, zFront * 0.9));
    }
  });
  const end = e => {
    if (hold) { const q = hold; hold = null; clearTimeout(q.timer); if (e.type === 'pointerup') onTap && onTap(q.it.k, screenOf(q.it)); return; }
    if (!drag) return;
    const d = drag; drag = null;
    world.removeConstraint(joint); joint = null; d.it.body.angularDamping = 0.12;
    host.classList.remove('grabbing');
    if (d.moved < 7 && performance.now() - d.t < 450) onTap && onTap(d.it.k, screenOf(d.it));
  };
  host.addEventListener('pointerup', end); host.addEventListener('pointercancel', end);

  const v3 = new THREE.Vector3();
  function screenOf(it) {
    const r = host.getBoundingClientRect();
    v3.copy(it.mesh.position); v3.y += it.sz.h * 0.35; v3.project(camera);
    return { x: (v3.x + 1) / 2 * r.width, y: (1 - v3.y) / 2 * r.height };
  }
  function hop(k) {
    const it = items.find(i => i.k === k); if (!it) return;
    it.body.wakeUp(); it.body.velocity.set((Math.random() - 0.5) * 2, 11, 0); it.body.angularVelocity.set(0, 6, (Math.random() - 0.5) * 4);
  }
  // nudge the whole heap (used when someone scrolls back up to it)
  function shake(power = 1) {
    items.forEach(it => { it.body.wakeUp(); it.body.velocity.y += (3 + Math.random() * 4) * power; it.body.angularVelocity.x += (Math.random() - 0.5) * 4 * power; });
  }

  let running = false, last = 0, acc = 0;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    step(dt);
    requestAnimationFrame(frame);
  }
  function step(dt) {
    // when everything has come to rest, stop simulating and rendering until someone touches the heap
    const asleep = !drag && !pending.length && items.every(it => it.body.sleepState === CANNON.Body.SLEEPING || it.body.type !== CANNON.Body.DYNAMIC);
    idle = asleep ? idle + 1 : 0;
    if (idle > 20 && !api.force) return;
    acc += dt;
    while (acc >= 1 / 60) { clock += 1 / 60; spawnDue(); world.step(1 / 60); acc -= 1 / 60; }
    items.forEach(it => {
      const b = it.body;
      if (b.position.y < -20 || Math.abs(b.position.x) > halfW + 6) { if (b.type === CANNON.Body.DYNAMIC) drop(it, clock, 9); }
      it.mesh.position.copy(b.position); it.mesh.quaternion.copy(b.quaternion);
    });
    renderer.render(scene, camera);
    api.onFrame && api.onFrame();
  }
  const api = {
    start() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } },
    stop() { running = false; },
    step, fit, hop, shake,
    screenOf: k => screenOf(items.find(i => i.k === k)),
    get dragging() { return !!drag; },
    force: false,
  };
  THREE.DefaultLoadingManager.onLoad = () => { if (!running) renderer.render(scene, camera); api.ready = true; api.onReady && api.onReady(); };
  new ResizeObserver(() => { fit(); if (!running) renderer.render(scene, camera); }).observe(host);
  return api;
}
