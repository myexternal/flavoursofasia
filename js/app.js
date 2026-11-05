import { SHOP, P, SOLID, HERO_DESK, HERO_PHONE, DISHES, STAPLES, NAMES, FINNISH, COLS, ODD, ZONES } from './data.js';

const $ = s => document.querySelector(s);
const eur = n => '€' + n.toFixed(2);
const num = n => n.toFixed(2);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PHONE = matchMedia('(max-width: 700px)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const REC = new URLSearchParams(location.search).has('rec');
const STILL = new URLSearchParams(location.search).has('still');
const cut = k => `media/cut/${P[k].f}.webp`;
const url = h => `${SHOP}/products/${h}`;
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};

/* ============ catalogue snapshot (for search and for anything not in P) ============ */
let CAT = [];
const catReady = fetch('media/catalogue.json').then(r => r.json()).then(d => { CAT = d; }).catch(() => {});
// extra items added from search: id -> {n,p,v,h,img}
const EXTRA = store.get('foa2-extra', {});

/* ============ the box (bag) ============ */
let bag = store.get('foa2-bag', {});   // key -> qty   (key = P key or 'v<variant id>')
let zone = store.get('foa2-zone', 'tre');
const item = k => P[k] || EXTRA[k];
function bagLines() { return Object.entries(bag).filter(([k, q]) => q > 0 && item(k)).map(([k, q]) => ({ k, q, it: item(k) })); }
function subtotal() { return bagLines().reduce((s, l) => s + l.q * l.it.p, 0); }
function count() { return bagLines().reduce((s, l) => s + l.q, 0); }
function fee(sub, z = zone) { const Z = ZONES[z]; return sub >= Z.free ? 0 : Z.fee; }
function save() { store.set('foa2-bag', bag); store.set('foa2-extra', EXTRA); store.set('foa2-zone', zone); }
const listeners = [];
function changed() { save(); listeners.forEach(f => f()); }

function add(k, from) {
  const it = item(k); if (!it || !it.a) return;
  bag[k] = (bag[k] || 0) + 1; changed();
  if (from) fly(it.img || (P[k] ? cut(k) : ''), from);
  toast(`${it.n} is in your box`);
}
function fly(src, from) {
  const btn = $('#boxbtn');
  const bump = () => { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); };
  if (REDUCED || !src) return bump();
  const r = btn.getBoundingClientRect(), tx = r.left + r.width / 2 - 45, ty = r.top + r.height / 2 - 45;
  const img = new Image(); img.src = src; img.className = 'fly'; document.body.appendChild(img);
  const x0 = from.x - 45, y0 = from.y - 45, mx = (x0 + tx) / 2, my = Math.min(y0, ty) - 120;
  img.animate([
    { transform: `translate(${x0}px,${y0}px) scale(1) rotate(0deg)`, opacity: 1 },
    { transform: `translate(${mx}px,${my}px) scale(.8) rotate(-12deg)`, opacity: 1, offset: .5 },
    { transform: `translate(${tx}px,${ty}px) scale(.2) rotate(-20deg)`, opacity: .2 },
  ], { duration: 620, easing: 'cubic-bezier(.45,0,.2,1)' }).onfinish = () => { img.remove(); bump(); };
}
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 1800); }

function permalink() {
  const l = bagLines(); if (!l.length) return `${SHOP}/collections/all`;
  return `${SHOP}/cart/` + l.map(x => `${x.it.v}:${x.q}`).join(',');
}
function renderReceipt() {
  const l = bagLines(), sub = subtotal(), f = l.length ? fee(sub) : 0;
  $('#boxn').textContent = count();
  $('#lines').innerHTML = l.length ? l.map(x => `<div class="line"><span>${x.it.n}</span><span class="amt">${num(x.q * x.it.p)}</span>
    <span class="q"><button data-d="-1" data-k="${x.k}" aria-label="One less">−</button>${x.q} × ${num(x.it.p)}<button data-d="1" data-k="${x.k}" aria-label="One more">+</button></span><span></span></div>`).join('')
    : `<p class="empty">Your box is empty.<br>Pick something off the heap,<br>or search for it.</p>`;
  $('#rsub').textContent = num(sub);
  $('#rdl').textContent = `Delivery, ${ZONES[zone].n}` + (zone === 'eu' ? ' (from)' : '');
  $('#rdel').textContent = l.length ? (f ? num(f) : 'FREE') : '0.00';
  $('#rtot').textContent = num(sub + f);
  const go = $('#rgo'); go.href = permalink(); go.setAttribute('aria-disabled', l.length ? 'false' : 'true');
  document.querySelectorAll('#rz button').forEach(b => b.setAttribute('aria-pressed', b.dataset.z === zone));
}
listeners.push(renderReceipt);
$('#lines').addEventListener('click', e => {
  const b = e.target.closest('button[data-k]'); if (!b) return;
  const k = b.dataset.k; bag[k] = Math.max(0, (bag[k] || 0) + +b.dataset.d); if (!bag[k]) delete bag[k]; changed();
});
$('#rz').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { zone = b.dataset.z; changed(); } });
function openBox(on) {
  $('#receipt').classList.toggle('on', on); $('#scrim').classList.toggle('on', on);
  $('#receipt').setAttribute('aria-hidden', !on);
  if (on) setTimeout(() => $('#rx').focus({ preventScroll: true }), 50);
}
window.__openBox = openBox;
$('#boxbtn').addEventListener('click', () => openBox(true));
$('#rx').addEventListener('click', () => openBox(false));
$('#scrim').addEventListener('click', () => openBox(false));
addEventListener('keydown', e => { if (e.key === 'Escape') { openBox(false); hideTag(); } });
$('#rdate').textContent = new Date().toLocaleDateString('fi-FI');

/* ============ 1. the heap ============ */
const tag = $('#tag');
let tagKey = null, hero = null;
function showTag(k, at) {
  const it = P[k]; tagKey = k;
  tag.innerHTML = `${it.si ? `<span class="si" lang="si">${it.si}</span>` : ''}<h3>${it.n}</h3><span class="s">${it.s}</span>
    <div class="row"><span class="pr">${eur(it.p)}</span>${it.a ? `<button class="add press" data-add="${k}">+ Add to box</button>` : `<button class="add" disabled>Sold out</button>`}</div>
    <a class="more" href="${url(it.h)}">Open in the shop ↗</a>`;
  placeTag(at); tag.classList.add('on');
}
function placeTag(at) {
  const w = innerWidth, x = Math.round(Math.max(130, Math.min(w - 130, at.x))), y = Math.round(Math.max(250, at.y));
  if (Math.abs(x - (placeTag.x || 0)) < 2 && Math.abs(y - (placeTag.y || 0)) < 2) return;
  placeTag.x = x; placeTag.y = y; tag.style.left = x + 'px'; tag.style.top = y + 'px';
}
function hideTag() { tag.classList.remove('on'); tagKey = null; }
tag.addEventListener('click', e => {
  const b = e.target.closest('[data-add]'); if (!b) return;
  const r = b.getBoundingClientRect(); add(b.dataset.add, { x: r.left + r.width / 2, y: r.top });
  hero && hero.hop(b.dataset.add); hideTag();
});
document.addEventListener('pointerdown', e => { if (tagKey && !e.target.closest('.tag') && !e.target.closest('#hero')) hideTag(); });

async function startHero() {
  const [{ initHero }, shapes] = await Promise.all([import('./hero.js'), fetch('media/shapes.json').then(r => r.json())]);
  const specs = {}; for (const k in SOLID) specs[k] = { ...SOLID[k], f: P[k].f };
  const host = $('#hero');
  hero = initHero({
    canvas: $('#heap'), host, keys: PHONE ? HERO_PHONE : HERO_DESK, specs, shapes, reduced: REDUCED || STILL, phone: PHONE,
    onTap: (k, at) => { host.classList.add('touched'); tagKey === k ? hideTag() : showTag(k, at); },
    onDragStart: () => { host.classList.add('touched'); hideTag(); },
  });
  hero.onFrame = () => { if (tagKey) placeTag(hero.screenOf(tagKey)); };
  window.__hero = hero;
  if (REC) { hero.step(0); return; }
  let vis = true;
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; vis ? hero.start() : hero.stop(); }, { threshold: 0.01 }).observe(host);
  hero.start();
}

/* ============ 2. say it your way ============ */
const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const SUG = ['කළු කුඩු', 'curry leaves', 'kookosmaito', 'රම්පේ කොළ', 'jackfruit', 'kikherneitä', 'හාල්මැස්සන්', 'kithul'];
function search(q) {
  const t = fold(q.trim()).split(/\s+/).filter(Boolean); if (!t.length) return [];
  return CAT.filter(p => { const s = fold(p[0] + ' ' + p[1]); return t.every(w => s.includes(w)); })
    .sort((a, b) => b[4] - a[4]).slice(0, 12);
}
const qel = $('#q'), res = $('#res'), meta = $('#qmeta');
function runSearch() {
  const q = qel.value; $('#qclear').hidden = !q;
  qel.classList.toggle('si-in', /[඀-෿]/.test(q));
  if (!q.trim()) { res.innerHTML = ''; meta.innerHTML = metaDefault; return; }
  const r = search(q);
  meta.textContent = r.length ? `${r.length === 12 ? '12+' : r.length} match${r.length === 1 ? '' : 'es'} for “${q.trim()}”. Swipe through.` : `Nothing for “${q.trim()}” in this snapshot. Their full shop search may still find it.`;
  res.innerHTML = r.map((p, i) => {
    const id = 'v' + p[2];
    EXTRA[id] = EXTRA[id] || { n: p[0].split(' / ')[0].replace(/\s*\(.*?\)\s*/g, ' ').trim(), p: p[3], v: p[2], h: p[1], a: p[4], img: p[5] ? p[5] + '?width=300' : '' };
    return `<div class="card${p[4] ? '' : ' out'}" style="animation-delay:${i * 40}ms"><a class="im" href="${url(p[1])}" style="background-image:url('${p[5]}?width=360')" aria-label="${p[0].replace(/"/g, '')}"></a>
      <h4>${p[0]}</h4><div class="row"><span class="pr">${eur(p[3])}</span>${p[4] ? `<button class="add press" data-x="${id}">+ Add</button>` : `<span class="mono">Sold out</span>`}</div></div>`;
  }).join('');
}
const metaDefault = $('#qmeta').innerHTML + ' ' + SUG.map(s => `<button class="chip press" data-s="${s}" style="margin:6px 4px 0 0;${/[඀-෿]/.test(s) ? 'font-family:var(--si);font-weight:800;font-size:16px' : ''}">${s}</button>`).join('');
meta.innerHTML = metaDefault;
let qT; qel.addEventListener('input', () => { clearTimeout(qT); qT = setTimeout(async () => { await catReady; runSearch(); }, 120); });
$('#qclear').addEventListener('click', () => { qel.value = ''; runSearch(); qel.focus(); });
document.addEventListener('click', async e => {
  const s = e.target.closest('[data-s]'); if (s) { qel.value = s.dataset.s; await catReady; runSearch(); if (!REC) qel.focus({ preventScroll: true }); return; }
  const x = e.target.closest('[data-x]'); if (x) { const r = x.getBoundingClientRect(); const v = +x.dataset.x.slice(1), pk = Object.keys(P).find(k => P[k].v === v); add(pk || x.dataset.x, { x: r.left + r.width / 2, y: r.top }); }
});
// placeholder cycles through the three languages
let ph = 0; const PH = ['කළු කුඩු', 'curry leaves', 'kookosmaito', 'තැඹිලි වතුර', 'red rice', 'kikherneitä'];
if (!REDUCED) setInterval(() => { if (document.activeElement !== qel && !qel.value) { ph = (ph + 1) % PH.length; qel.placeholder = PH[ph]; qel.classList.toggle('si-in', /[඀-෿]/.test(PH[ph])); } }, 2200);
qel.classList.add('si-in');
const names = NAMES.map(([si, en]) => `<button data-s="${si}"><span class="si" lang="si">${si}</span><em>${en}</em></button>`).join('');
$('#run1').innerHTML = names + names;
const fin = FINNISH.map(f => `<span>${f}</span><span aria-hidden="true">·</span>`).join('');
$('#run2').innerHTML = fin + fin;

/* ============ 3. tonight i'm making ============ */
let di = 0;
const ROT = [-6, 4, -2, 7, -4, 3];
function renderDish(first) {
  const d = DISHES[di], w = $('#dishw');
  const swap = () => { w.textContent = d.k; };
  if (first || REDUCED) swap();
  else { w.classList.add('out'); setTimeout(() => { swap(); w.classList.remove('out'); w.classList.add('pre'); requestAnimationFrame(() => requestAnimationFrame(() => w.classList.remove('pre'))); }, 180); }
  $('#dishd').textContent = d.d;
  document.querySelectorAll('#chips .chip').forEach((c, i) => c.setAttribute('aria-pressed', i === di));
  const kn = $('#knoll');
  kn.innerHTML = d.need.map((k, i) => { const it = P[k]; return `<div class="ki${it.a ? '' : ' out'}" style="--r:${ROT[i % 6]}deg">
    <div class="ph"><img src="${cut(k)}" alt="${it.n}" loading="lazy"></div>${it.a ? '' : '<span class="stamp">Sold out</span>'}
    <div class="lb"><b>${it.n}</b><span>${it.s}</span><div class="pr">${eur(it.p)}${it.a ? `<button class="plus press" data-add2="${k}" aria-label="Add ${it.n}">+</button>` : ''}</div></div></div>`; }).join('');
  const items = [...kn.children];
  items.forEach((el, i) => setTimeout(() => el.classList.add('on'), REDUCED ? 0 : 60 + i * 55));
  const ins = d.need.filter(k => P[k].a), sum = ins.reduce((s, k) => s + P[k].p, 0), outN = d.need.length - ins.length;
  $('#dtot').innerHTML = `<b>${ins.length} of ${d.need.length}</b> in stock, ${eur(sum)} together.${outN ? ` ${outN === 1 ? 'One is' : outN + ' are'} sold out right now and won't be added.` : ''}`;
  $('#dall').textContent = `Put the ${ins.length} in my box`;
}
$('#chips').innerHTML = DISHES.map((d, i) => `<button class="chip press" data-di="${i}">${d.k}</button>`).join('');
$('#chips').addEventListener('click', e => { const b = e.target.closest('[data-di]'); if (b && +b.dataset.di !== di) { di = +b.dataset.di; renderDish(); } });
$('#dish').addEventListener('click', e => { e.preventDefault(); di = (di + 1) % DISHES.length; renderDish(); });
$('#knoll').addEventListener('click', e => { const b = e.target.closest('[data-add2]'); if (b) { const r = b.closest('.ki').querySelector('img').getBoundingClientRect(); add(b.dataset.add2, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); } });
$('#dall').addEventListener('click', () => {
  const d = DISHES[di]; const imgs = [...document.querySelectorAll('#knoll .ki:not(.out) img')];
  d.need.filter(k => P[k].a).forEach((k, i) => setTimeout(() => { const r = imgs[i] && imgs[i].getBoundingClientRect(); bag[k] = (bag[k] || 0) + 1; changed(); r && fly(cut(k), { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }, i * 90));
  setTimeout(() => toast(`${d.k[0].toUpperCase() + d.k.slice(1)}: ${d.need.filter(k => P[k].a).length} things in your box`), 500);
});
renderDish(true);

/* ============ 4. staples board ============ */
$('#rows').innerHTML = STAPLES.map(k => { const it = P[k]; return `<div class="br${it.a ? '' : ' out'}" data-k="${k}">
  <span class="th"><img src="${cut(k)}" alt="" loading="lazy"></span><div><b>${it.si ? `<span class="si" lang="si" style="color:var(--turmeric);margin-right:10px;font-size:22px">${it.si}</span>` : ''}${it.n}</b><span class="s">${it.s}</span></div><span class="dots"></span>
  <span class="pr">${eur(it.p)}</span>${it.a ? `<button class="plus press" data-add3="${k}" aria-label="Add ${it.n}">+</button>` : '<span class="soon">Back soon</span>'}</div>`; }).join('');
$('#rows').addEventListener('click', e => { const b = e.target.closest('[data-add3]'); if (b) { const r = b.getBoundingClientRect(); add(b.dataset.add3, { x: r.left + r.width / 2, y: r.top }); } });
if (FINE) { // the packet follows the cursor down the board, on a spring
  const fl = $('#float'), fi = fl.querySelector('img');
  let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, on = false, raf = 0;
  const tick = () => { const k = 0.16, dmp = 0.74; vx = (vx + (tx - x) * k) * dmp; vy = (vy + (ty - y) * k) * dmp; x += vx; y += vy;
    fl.style.transform = `translate(${x - 85}px,${y - 85}px) rotate(${Math.max(-14, Math.min(14, vx * 0.8))}deg)`;
    raf = (on || Math.abs(vx) + Math.abs(vy) > .1) ? requestAnimationFrame(tick) : 0; };
  $('#rows').addEventListener('pointermove', e => {
    const row = e.target.closest('.br'); tx = e.clientX + 110; ty = e.clientY;
    if (row) { const src = cut(row.dataset.k); if (!fi.src.endsWith(src)) fi.src = src; if (!on) { on = true; if (!x) { x = tx; y = ty; } fl.classList.add('on'); } }
    if (!raf) raf = requestAnimationFrame(tick);
  });
  $('#rows').addEventListener('pointerleave', () => { on = false; fl.classList.remove('on'); });
}

/* ============ 5. the box being packed ============ */
let pack = null;
const packSec = $('#pack'), steps = [...document.querySelectorAll('#steps li')];
function packKeys() {
  const mine = bagLines().filter(l => P[l.k] && SOLID[l.k]).sort((a, b) => b.q - a.q).map(l => l.k);
  const def = ['shflour', 'cmilk', 'mackerel', 'chilli', 'leaves', 'kithul'];
  return [...new Set([...mine, ...def])].slice(0, 6);
}
function packProgress() {
  const r = packSec.getBoundingClientRect(); const h = packSec.offsetHeight - innerHeight;
  return Math.max(0, Math.min(1, -r.top / h));
}
function packStep(p) {
  const s = p < 0.3 ? 0 : p < 0.5 ? 1 : p < 0.78 ? 2 : 3;
  steps.forEach((li, i) => { li.classList.toggle('on', i === s || (!PHONE && i < s)); li.classList.toggle('done', i < s); });
}
async function startPack() {
  const [{ initPack }, shapes] = await Promise.all([import('./pack.js'), fetch('media/shapes.json').then(r => r.json())]);
  const specs = {}; for (const k in SOLID) specs[k] = { ...SOLID[k], f: P[k].f };
  pack = initPack({ canvas: $('#boxcv'), host: $('#boxcv').parentElement, specs, shapes, keys: packKeys(), phone: PHONE, label: labelText() });
  window.__pack = pack;
  const loop = () => { if (!packVis) return; const p = packProgress(); packStep(p); pack.render(p); requestAnimationFrame(loop); };
  let packVis = false;
  new IntersectionObserver(([e]) => { packVis = e.isIntersecting; if (packVis) { pack.setItems(packKeys()); pack.setLabel(labelText()); if (!REC) requestAnimationFrame(loop); } }, { threshold: 0 }).observe(packSec);
  window.__packFrame = () => { const p = packProgress(); packStep(p); pack.render(p); };
}
function s1() {
  const c = count(); $('#s1').textContent = c ? `Online, any time. Your box so far: ${c} item${c === 1 ? '' : 's'}, ${eur(subtotal())}. Those are the ones being packed here.` : 'Online, any time. Add something and you will see it go in this box.';
}
listeners.push(s1);

/* ============ 6. the label ============ */
let pcode = store.get('foa2-pc', '');
function zoneOf(pc) { if (!/^\d{5}$/.test(pc)) return null; return pc.startsWith('33') ? 'tre' : 'fin'; }
function labelText() {
  const z = ZONES[zone]; return { pc: pcode || 'YOU', zone: pcode ? z.n : 'Anywhere in ' + (zone === 'eu' ? 'Europe' : 'Finland'), n: count(), sub: subtotal() };
}
function renderLabel() {
  const sub = subtotal(), Z = ZONES[zone], f = fee(sub), c = count();
  $('#pc').value = pcode;
  $('#pcz').textContent = pcode.length === 5 ? (zone === 'tre' ? 'Tampere area (33xxx). The cheapest zone.' : 'Elsewhere in Finland.') : zone === 'eu' ? 'Europe: the rate is set at checkout.' : 'Type a Finnish postcode.';
  $('#slipc').innerHTML = c ? `${c} item${c === 1 ? '' : 's'} · ${eur(sub)}<br><a href="#" id="slipopen">See the receipt</a>` : 'Nothing in your box yet. Prices below assume an empty box.';
  $('#slipf').textContent = f ? eur(f) : 'Free';
  const pct = Z.free === Infinity ? 0 : Math.min(100, sub / Z.free * 100);
  $('#meter').style.width = pct + '%';
  $('#slipm').textContent = Z.free === Infinity ? 'Europe is a flat rate from €12, set at checkout.' : f ? `${eur(Z.free - sub)} more and delivery to ${Z.n} is free.` : `Delivery to ${Z.n} is free for this box.`;
  document.querySelectorAll('#zones li').forEach(li => li.classList.toggle('on', li.dataset.z === zone));
  pack && pack.setLabel(labelText());
}
listeners.push(renderLabel);
$('#pc').addEventListener('input', e => {
  pcode = e.target.value.replace(/\D/g, '').slice(0, 5); e.target.value = pcode; store.set('foa2-pc', pcode);
  const z = zoneOf(pcode); if (z && z !== zone) { zone = z; changed(); } else renderLabel();
});
$('#zones').addEventListener('click', e => { const li = e.target.closest('li'); if (li) { zone = li.dataset.z; changed(); } });
$('#slip').addEventListener('click', e => { if (e.target.id === 'slipopen') { e.preventDefault(); openBox(true); } });
document.querySelectorAll('#zones li').forEach(li => { li.style.cursor = 'pointer'; li.tabIndex = 0; li.setAttribute('role', 'button'); li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); } }); });
new IntersectionObserver(([e], o) => { if (e.isIntersecting) { $('#oiva').classList.add('in'); $('#slip').classList.add('thud'); o.disconnect(); } }, { threshold: 0.6 }).observe($('#slip'));

/* ============ 7. aisles ============ */
$('#shelf').innerHTML = COLS.map(([h, n, c], i) => `<a href="${SHOP}/collections/${h}" class="press"><span class="mono">Aisle ${String(i + 1).padStart(2, '0')}</span><span class="ct"><b>${n.replace(' & ', '<br>& ')}</b><em>${c}</em></span></a>`).join('');
$('#oddrow').innerHTML = ODD.map(o => `<a href="${url(o.h)}" class="${o.a ? '' : 'out'}"><img src="${o.img}" alt="${o.n}" loading="lazy"><b>${o.n}</b><span>${eur(o.p)}</span>${o.a ? '' : '<em class="mono">Sold out</em>'}</a>`).join('');

/* ============ live prices when running on their own domain ============ */
if (/flavoursofasia\.fi$/.test(location.hostname)) {
  Object.entries(P).forEach(([k, it]) => fetch(`/products/${it.h}.js`).then(r => r.ok ? r.json() : null).then(j => {
    if (!j) return; const v = j.variants.find(x => x.id === it.v) || j.variants[0];
    it.p = v.price / 100; it.a = v.available ? 1 : 0; it.v = v.id;
  }).catch(() => {}));
}

/* ============ nav colour over dark sections ============ */
{ const dark = [...document.querySelectorAll('[data-dark]')];
  const check = () => { const on = dark.some(el => { const r = el.getBoundingClientRect(); return r.top < 40 && r.bottom > 40; }); document.body.classList.toggle('on-dark', on); };
  addEventListener('scroll', check, { passive: true }); check(); }

/* ============ boot ============ */
listeners.forEach(f => f());
startHero();
const lazyPack = new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); startPack(); } }, { rootMargin: '120% 0px' });
lazyPack.observe(packSec);
window.__add = add;
