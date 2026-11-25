// ===== Nammude Naadu — engine: input, camera, rendering, dialogue, objectives, inventory =====
const T = 32;
const $ = id => document.getElementById(id);
const cv = $('c'), cx = cv.getContext('2d');
let VW = 0, VH = 0, SCALE = 1, DPR = 1, BASE = 1, ZOOM = 1;
const lightCv = document.createElement('canvas'), lx = lightCv.getContext('2d');

function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); // more than 2x costs a lot and nobody can see it
  cv.width = Math.max(2, Math.round(innerWidth * DPR)); cv.height = Math.max(2, Math.round(innerHeight * DPR));
  lightCv.width = cv.width; lightCv.height = cv.height;
  BASE = Math.max(1.3, Math.min(2.3, innerHeight / 460)) * DPR; applyZoom();
}
function applyZoom() { SCALE = BASE * ZOOM; VW = cv.width / SCALE; VH = cv.height / SCALE; }
addEventListener('resize', resize); resize();

// Story timers run on the game clock: they stop while the game is paused or the tab is hidden, and they die when the
// player quits a chapter (G.run changes), so an abandoned chapter can never carry on behind the title screen.
const sleepers = [];
const sleep = ms => new Promise(r => sleepers.push({ left: ms, r, run: G.run }));
function tickSleepers(ms) { if (!sleepers.length) return; const due = []; for (let i = sleepers.length - 1; i >= 0; i--) { const s = sleepers[i]; if (s.run !== G.run) sleepers.splice(i, 1); else if ((s.left -= ms) <= 0) { sleepers.splice(i, 1); due.unshift(s); } } for (const s of due) s.r(); }
const NEVER = new Promise(() => { });
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- Global state ----------
const G = {
  map: null, maps: {},
  player: { x: 0, y: 0, dir: 'down', walk: 0, moving: false, outfit: 'home', hidden: false, sit: false },
  cam: { x: 0, y: 0 }, camTarget: null,
  time: 8, timeRate: 0, timeMax: 24, rain: 0,
  flashlight: false, cash: 2000, inv: {}, locked: 0, chapter: '', running: false,
  waiters: [], hens: [], entities: [], t: 0, run: 0, paused: false, emotion: null,
};
const S = {}; // story flags
G.timers = [];
function every(fn, ms) { const id = setInterval(() => { if (!G.paused) fn(); }, ms); G.timers.push(id); return id; }

// ---------- Input ----------
const keys = {};
const keyListeners = new Set();
const INTERACT = ['e', ' ', 'enter'];
// physical keys, so WASD works with a Malayalam (or any other) keyboard layout switched on
const keyOf = e => /^Key[A-Z]$/.test(e.code || '') ? e.code[3].toLowerCase() : e.code === 'Space' ? ' ' : (e.key || '').toLowerCase();
const typing = e => e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName || '');
addEventListener('keydown', e => {
  const k = keyOf(e); if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (G.paused) { if (G.pauseKey) G.pauseKey(k, e); return; }
  if (typing(e)) return;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  if (keys[k]) return;
  keys[k] = true;
  const modal = $('mini').style.display === 'flex' || $('panel').style.display === 'block'; // the key that closes a window must not also open the pause menu
  for (const l of [...keyListeners]) l(k);
  if (!modal) onKey(k);
});
addEventListener('keyup', e => { keys[keyOf(e)] = false; });
// never leave a key stuck down when the window loses focus
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
addEventListener('mousedown', e => { if (G.paused || (e.target && e.target.closest && e.target.closest('button,input,select,#panel,#touch'))) return; for (const l of [...keyListeners]) l('click'); });
function waitKey(ks = INTERACT.concat('click')) {
  let l; const run = G.run;
  const p = new Promise(r => { l = k => { if (run !== G.run) { keyListeners.delete(l); return; } if (ks.includes(k)) { keyListeners.delete(l); r(k); } }; keyListeners.add(l); });
  p.cancel = () => keyListeners.delete(l);
  return p;
}
const holding = () => keys['e'] || keys[' '] || keys['enter'];
let wantInteract = false;
function onKey(k) {
  if (!G.running) return;
  if (INTERACT.includes(k) && G.locked === 0) wantInteract = true;
  if (k === 'f' && G.locked === 0) {
    if (G.inv.flashlight) { G.flashlight = !G.flashlight; AudioSys.sfx.blip(); }
    else toast('You have no flashlight.');
  }
  if (k === 'c' && G.locked === 0) openCrafting();
  if (typeof onKey4 === 'function') onKey4(k);
  if (k === 'escape' || k === 'p') openPause();
}

// ---------- Wait-until helper (checked every frame) ----------
function until(fn) { return new Promise(r => G.waiters.push({ fn, r })); }
function checkWaiters() {
  if (!G.waiters.length) return;
  const keep = [];
  for (const w of G.waiters) { let ok = false; try { ok = w.fn(); } catch (e) { } ok ? w.r() : keep.push(w); }
  G.waiters = keep;
}
const idle = () => until(() => G.locked === 0);
async function scene(fn) { const run = G.run; G.locked++; try { return await fn(); } finally { if (run === G.run) G.locked = Math.max(0, G.locked - 1); } }

// ---------- HUD ----------
function toast(msg) { const d = document.createElement('div'); d.textContent = msg; $('toast').appendChild(d); setTimeout(() => d.remove(), 2700); }
function fmtTime(h) { h = ((h % 24) + 24) % 24; let hh = Math.floor(h), mm = Math.floor((h - hh) * 60); const ap = hh >= 12 ? 'PM' : 'AM'; hh = hh % 12 || 12; return `${hh}:${String(mm).padStart(2, '0')} ${ap}`; }
function renderStatus() {
  const s = $('status'), html = `<div class="ch">${G.chapter}</div><div class="big">${G.day ? 'Day ' + G.day + ' · ' : ''}${fmtTime(G.time)}</div><div>₹${G.cash.toLocaleString('en-IN')}</div>${S.debt ? `<div style="color:#e09a8a;font-size:12px">Bank debt ₹${S.debt.toLocaleString('en-IN')}</div>` : ''}${S.scooter && S.scooter.fixed ? `<div style="font-size:12px;color:${S.scooter.fuel < 0.2 ? '#e09a8a' : '#cfe3c0'}">Scooter petrol ${S.scooter.fuel.toFixed(1)} L${G.riding && S.scooter.lights ? ' · light on' : ''}</div>` : ''}`;
  if (s._html !== html) { s._html = html; s.innerHTML = html; }
}
const ITEM = {
  suitcase: 'Suitcase', broom: 'Broom', bedsheet: 'Bedsheet', bulb: 'Light bulb', coconut: 'Coconut', curry: 'Curry leaves',
  water: 'Bucket of water', rice: 'Matta rice (5 kg)', flashlight: 'Flashlight', feed: 'Chicken feed', eggs: 'Eggs', key: 'Rusted key',
  knife: "Appachan's knife", bamboo: 'Bamboo branch', line: 'Fishing line', hook: 'Fishing hook', worm: 'Earthworm', rod: 'Bamboo fishing rod',
  fish: 'Fish', flowers: 'Flowers for Appachan', sickle: 'Sickle (arivaal)', mammatti: 'Mammatti (hoe)', branch: 'Branch', planks: 'Wooden planks', nails: 'Nails', leaves: 'Dry leaves', compostbin: 'Compost bin', compost: 'Compost',
  seed_cheera: 'Cheera seeds', seed_chilli: 'Chilli seeds', seed_tomato: 'Tomato seeds', stake: 'Bamboo stake', cutting: 'Tapioca stem cuttings', sapling: 'Banana sucker', parts: 'Pump impeller & washer', photo1996: 'Photograph (Aug 1996)', notice: 'Bank notice', kudampuli: 'Kudampuli', cleanfish: 'Cleaned fish', grated: 'Grated coconut', note: "Appachan's note",
};
function renderInv() {
  const el = $('inv'); const ks = Object.keys(G.inv).filter(k => G.inv[k] > 0);
  el.style.display = ks.length && G.running ? 'flex' : 'none';
  el.innerHTML = ks.map(k => `<div class="chip">${ITEM[k] || k}${G.inv[k] > 1 ? ' × ' + G.inv[k] : ''}</div>`).join('');
  document.documentElement.style.setProperty('--invh', (el.style.display === 'flex' ? el.offsetHeight : 0) + 'px');
}
function give(k, n = 1, quiet) { G.inv[k] = (G.inv[k] || 0) + n; if (!quiet) { AudioSys.sfx.pickup(); toast(`+ ${ITEM[k] || k}${n > 1 ? ' × ' + n : ''}`); } renderInv(); }
const has = (k, n = 1) => (G.inv[k] || 0) >= n;
function take(k, n = 1) { G.inv[k] = Math.max(0, (G.inv[k] || 0) - n); renderInv(); }

// Objectives
const Obj = { title: '', items: [], opt: null };
function setObj(title, items, opt) {
  Obj.title = title; Obj.items = items.map(([id, text]) => ({ id, text, done: false })); Obj.opt = opt || null; renderObj();
}
function done(id) { const it = Obj.items.find(i => i.id === id); if (it && !it.done) { it.done = true; AudioSys.sfx.done(); renderObj(); } }
const active = id => { const it = Obj.items.find(i => i.id === id); return !!(it && !it.done); };
const isDone = id => { const it = Obj.items.find(i => i.id === id); return !!(it && it.done); };
const allDone = () => Obj.items.length > 0 && Obj.items.every(i => i.done);
function setObjText(id, text) { const it = Obj.items.find(i => i.id === id); if (it) { it.text = text; renderObj(); } }
function renderObj() {
  const el = $('obj');
  if (!Obj.items.length) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const doneN = Obj.items.filter(i => i.done).length;
  el.innerHTML = `<h3>${Obj.title}</h3>` + (doneN && doneN < Obj.items.length ? `<div class="donecount">✓ ${doneN} done</div>` : '') + Obj.items.filter(i => !i.done || doneN === Obj.items.length).map(i => `<div class="it ${i.done ? 'done' : ''}"><div class="bx"></div><div>${i.text}</div></div>`).join('') + (Obj.opt ? `<div class="opt">${Obj.opt()}</div>` : '');
}
const clearObj = () => { Obj.items = []; renderObj(); };

// ---------- Fades & cards ----------
async function fadeOut(ms = 700) { const f = $('fade'); f.style.transition = `opacity ${ms}ms`; f.style.opacity = 1; await sleep(ms); }
async function fadeIn(ms = 700) { const f = $('fade'); f.style.transition = `opacity ${ms}ms`; f.style.opacity = 0; await sleep(ms); }
async function card(k, t, m, s, ms = 3500) {
  const run = G.run; G.locked++; try { return await showCard(k, t, m, s, ms); } finally { if (run === G.run) G.locked = Math.max(0, G.locked - 1); }
}
async function showCard(k, t, m, s, ms) {
  const c = $('card'); c.querySelector('.k').textContent = k || ''; c.querySelector('.t').textContent = t || ''; c.querySelector('.m').textContent = m || ''; c.querySelector('.s').textContent = s || '';
  c.style.zIndex = 30; c.style.opacity = 1; await sleep(ms); c.style.opacity = 0; await sleep(1400);
}

// ---------- Dialogue ----------
const stripTags = s => s.replace(/\[[^\]]+\]\s*/g, '');
function showSub(who, color, ml, en) {
  const s = $('sub'); s.style.display = 'block'; s._decide = 3; if (G.cine) s.classList.remove('top');
  const w = s.querySelector('.who'); w.textContent = who; w.style.color = color || '#e8b65a';
  const mode = (G.settings && G.settings.subs) || 'both';
  if (mode === 'off' && who) { s.style.display = 'none'; return; }
  const showMl = ml && (mode === 'both' || mode === 'ml'), showEn = !(who && mode === 'ml');
  s.querySelector('.ml').textContent = ml || ''; s.querySelector('.ml').style.display = showMl ? 'block' : 'none';
  s.querySelector('.en').textContent = en || ''; s.querySelector('.en').style.display = showEn ? 'block' : 'none';
}
const hideSub = () => { $('sub').style.display = 'none'; };
G.speaking = null;
// Where the voice comes from, when its owner is not in front of us
const VIA = { p_app1: 'on the phone', p_app2: 'on the phone', p_jom1: 'on the phone', c4_jom6: 'on the phone', c1_note: 'the letter', c5_amm1: 'from the kitchen', c5_amm2: 'from inside', c2_amm1: 'from the kitchen', c2_amm2: 'from the kitchen', c2_amm3: 'from the house', c1_amm3: 'from the kitchen', c1_amm5: '', c3_amm5: 'from the kitchen' };
// The acting direction in a line also drives the face of whoever says it
function emotionOf(ml) { const t = (ml.match(/\[([^\]]+)\]/g) || []).join(' ').toLowerCase(); if (/cry|sob|breaking/.test(t)) return 'cry'; if (/laugh|cheer|happy|chuckle|warm/.test(t)) return 'happy'; if (/shock|surpris|scared|shaken|pained/.test(t)) return 'shock'; if (/sad|tired|sigh|grave|hesitant/.test(t)) return 'sad'; return 'talk'; }
const LINE_IDS = Object.keys(LINES);
async function say(id) {
  const L = LINES[id]; if (!L) { console.warn('missing line', id); return; }
  const V = VOICES[L.who], run = G.run;
  G.speaking = L.who; G.emotion = emotionOf(L.ml);
  { const o = G.map && !G.player.hidden && G.map.objs.find(q => q.npc && q.voice === L.who && objVisible(q)); if (o && Math.hypot(o.x - G.player.x, o.y - G.player.y) < 130) G.talkTo = o; if (G.talkTo && !G.camTarget) { G.zoomTo = G.map.id === 'village' || G.map.outdoor ? 1.28 : 1.16; clearTimeout(say.t); } }
  // nobody talks to Arjun with their back to him
  if (L.who !== 'arjun' && G.map && !G.cine && !G.player.hidden) { const o = G.map.objs.find(q => q.npc && q.voice === L.who && q.dir && objVisible(q)), p = G.player; if (o && !o.path && Math.hypot(o.x - p.x, o.y - p.y) < 120) { const f = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[o.dir]; if (f[0] * (p.x - o.x) + f[1] * (p.y - o.y) < 0) o.dir = faceDir(o, p); } }
  { const i = LINE_IDS.indexOf(id); if (AudioSys.preload) AudioSys.preload(LINE_IDS.slice(i + 1, i + 4)); } // have the next lines ready, so conversations flow
  showSub(`${V.name} · ${V.ml}${VIA[id] ? ` (${VIA[id]})` : ''}`, V.color, stripTags(L.ml), L.en);
  let skipped = false;
  const k = waitKey(); k.then(() => { skipped = true; AudioSys.stopVoice(); });
  await Promise.race([AudioSys.voice(id, VIA[id] === 'on the phone' ? 'phone' : undefined), k]);
  k.cancel(); if (run !== G.run) return NEVER;
  if (!skipped) { const k2 = waitKey(); await Promise.race([sleep(650), k2]); k2.cancel(); }
  G.speaking = null; G.emotion = null; hideSub(); clearTimeout(say.t); say.t = setTimeout(() => { if (!G.speaking) { G.zoomTo = 1; G.talkTo = null; } }, 1500); await sleep(140);
}
async function sayAll(ids) { for (const id of ids) await say(id); }
async function think(en, ms = 2800) {
  ms = Math.max(ms, 1300 + en.length * 48); // always long enough to read
  showSub('', '', '', en);
  await sleep(250);
  const run = G.run, k = waitKey(); await Promise.race([sleep(ms), k]); k.cancel(); if (run !== G.run) return NEVER; hideSub(); await sleep(120);
}

// ---------- Hold-to-do action ----------
async function hold(label, ms, tickSfx) {
  const h = $('hold'); h.style.display = 'block'; h.querySelector('.lbl').textContent = `Hold E — ${label}`;
  const fill = h.querySelector('.fill'); let p = 0, last = performance.now(), acc = 0;
  const run = G.run;
  await new Promise(r => {
    const step = now => {
      const dt = G.paused ? 0 : Math.min(0.05, (now - last) / 1000); last = now; if (run !== G.run) { h.style.display = 'none'; return; }
      if (holding()) { p += dt * 1000 / ms; acc += dt; if (tickSfx && acc > 0.6) { acc = 0; tickSfx(); } G.player.walk += dt * 6; }
      else p = Math.max(0, p - dt * 0.5);
      fill.style.width = `${Math.min(100, p * 100)}%`;
      if (p >= 1) return r();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  h.style.display = 'none';
}

// ---------- Maps ----------
function defMap(id, d) {
  d.id = id; d.objs = (d.objs || []).map(o => {
    if (o.npc) return o;
    return Object.assign({}, o, { x: o.x * T, y: o.y * T, w: (o.w || 1) * T, h: (o.h || 1) * T });
  });
  d.solidsPx = (d.solids || []).map(([x, y, w, h]) => ({ x: x * T, y: y * T, w: w * T, h: h * T }));
  G.maps[id] = d;
}
function buildStatic(m) {
  const c = document.createElement('canvas'); c.width = m.w * T; c.height = m.h * T;
  const x = c.getContext('2d'); m.paint(x, m); m.static = c;
}
async function goto(id, tx, ty, dir = 'down', fade = true) {
  if (fade) await fadeOut(500);
  const m = G.maps[id]; if (!m.static) buildStatic(m);
  if (G.map !== m) { G.zoomTo = 1; G.talkTo = null; ZOOM = 1; applyZoom(); }
  G.map = m; G.player.x = tx * T; G.player.y = ty * T; G.player.dir = dir; G.player.sit = false;
  m.onEnter && m.onEnter();
  snapCam();
  if (fade) await fadeIn(500);
}
function objVisible(o) { return o.visible ? o.visible() : true; }
function objRect(o) { return o.npc ? { x: o.x - 10, y: o.y - 8, w: 20, h: 12 } : o; }
function solidsNow() {
  const out = G.map.solidsPx.slice();
  for (const o of G.map.objs) {
    if (o.solid && objVisible(o)) out.push(o.solidRect ? o.solidRect() : objRect(o));
    else if (o.npc && o.voice && !o.path && objVisible(o)) out.push({ x: o.x - 9, y: o.y - 6, w: 18, h: 9 }); // people take up space
  }
  return out;
}
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// ---------- Player movement ----------
function updatePlayer(dt) {
  const p = G.player;
  p.moving = false;
  if (G.locked || p.hidden || p.sit) return;
  let dx = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
  let dy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
  if (!dx && !dy) return;
  const len = Math.hypot(dx, dy); dx /= len; dy /= len;
  if (dt <= 0) return;
  const sp = (G.riding ? rideSpeed() : keys['shift'] ? 170 : 100) * dt;
  p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  const W = G.map.w * T, H = G.map.h * T;
  const box = (x, y) => ({ x: x - 7, y: y - 5, w: 14, h: 7 });
  const here = box(p.x, p.y), sol = solidsNow().filter(s => !hit(here, s)); // if something closes on top of you, you can always walk out
  const free = (x, y) => !sol.some(s => hit(box(x, y), s));
  const ox = p.x, oy = p.y;
  let nx = clamp(p.x + dx * sp, 8, W - 8), ny = clamp(p.y + dy * sp, 14, H - 4);
  const okx = free(nx, p.y); if (okx) p.x = nx;
  const oky = free(p.x, ny); if (oky) p.y = ny;
  // slide round small corners instead of catching on them
  if (dx && !dy && !okx) for (const o of [4, -4, 8, -8, 11, -11]) if (free(nx, p.y + o) && free(p.x, p.y + Math.sign(o) * sp * 0.7)) { p.y += Math.sign(o) * sp * 0.7; break; }
  if (dy && !dx && !oky) for (const o of [4, -4, 8, -8, 11, -11]) if (free(p.x + o, ny) && free(p.x + Math.sign(o) * sp * 0.7, p.y)) { p.x += Math.sign(o) * sp * 0.7; break; }
  if (G.riding) { onRide(Math.hypot(p.x - ox, p.y - oy)); if (typeof rideSound === 'function') rideSound(true, sp / dt); }
  p.moving = true; const ph = Math.floor(p.walk / Math.PI); p.walk += dt * (keys['shift'] ? 14 : 10); if (Math.floor(p.walk / Math.PI) !== ph && typeof onStep === 'function' && !G.riding) onStep();
}

// ---------- Interaction ----------
let currentTarget = null;
function findTarget() {
  const p = G.player; let best = null, bd = 30;
  if (G.locked || p.hidden || p.sit) return null;
  for (const o of G.map.objs) {
    if (!o.label || !objVisible(o)) continue;
    if (o.when && !o.when()) continue;
    const r = objRect(o);
    const qx = clamp(p.x, r.x, r.x + r.w), qy = clamp(p.y - 6, r.y, r.y + r.h);
    const d = Math.hypot(p.x - qx, p.y - 6 - qy) - (o.reach || 0);
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
function faceDir(a, b) { const dx = b.x - a.x, dy = b.y - a.y; return Math.abs(dx) > Math.abs(dy) * 1.1 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
async function runInteract(o) {
  const run = G.run, p = G.player; G.locked++;
  // turn to what you are doing, and people turn to you
  if (!G.riding) { const c = o.npc ? o : { x: o.x + o.w / 2, y: o.y + o.h / 2 }; p.dir = faceDir(p, c); if (o.npc && o.voice && o.dir) o.dir = faceDir(o, p); }
  try { await o.act(o); } catch (e) { console.error(e); } finally { if (run === G.run) G.locked = Math.max(0, G.locked - 1); }
}

// ---------- Moving things (NPCs, vehicles) ----------
function moveTo(o, tx, ty, speed = 70) {
  return new Promise(r => { o.path = { tx: tx * T, ty: ty * T, speed, r }; });
}
function updateMovers(dt) {
  const list = G.map.objs.concat(G.entities);
  for (const o of list) {
    if (!o.path) { if (o.npc) o.moving = false; continue; }
    const { tx, ty, speed, r } = o.path; const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy);
    if (d < 2) { o.x = tx; o.y = ty; o.path = null; o.moving = false; r(); continue; }
    const s = Math.min(d, speed * dt); o.x += dx / d * s; o.y += dy / d * s; o.moving = true;
    o.walk = (o.walk || 0) + dt * 9;
    if (o.npc) o.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    if (o.heading !== undefined) o.heading = Math.atan2(dy, dx);
  }
}

// ---------- Hens ----------
function makeHen(x, y, zone, color = '#f4efe6', red = false) {
  return { kind: 'hen', x: x * T, y: y * T, zone, color, red, tx: x * T, ty: y * T, wait: rnd(0, 2), peck: 0, follow: false, flip: false, home: false };
}
function updateHens(dt) {
  if (G.map.id !== 'village') return;
  for (const h of G.hens) {
    if (h.hidden) continue;
    if (h.follow) {
      const p = G.player, dx = p.x - h.x, dy = p.y - h.y, d = Math.hypot(dx, dy);
      if (d > 34) { const s = Math.min(d - 30, 120 * dt); h.x += dx / d * s; h.y += dy / d * s; h.flip = dx < 0; h.walk = (h.walk || 0) + dt * 12; }
      continue;
    }
    if (h.wait > 0) { h.wait -= dt; h.peck += dt; continue; }
    const dx = h.tx - h.x, dy = h.ty - h.y, d = Math.hypot(dx, dy);
    if (d < 2) {
      const [zx, zy, zw, zh] = h.zone;
      h.tx = (zx + Math.random() * zw) * T; h.ty = (zy + Math.random() * zh) * T; h.wait = rnd(0.8, 3.5); continue;
    }
    const s = Math.min(d, 38 * dt); h.x += dx / d * s; h.y += dy / d * s; h.flip = dx < 0; h.walk = (h.walk || 0) + dt * 12;
  }
}

// ---------- Camera ----------
function camFocus() {
  const t = G.camTarget || G.player; if (!G.camTarget && G.talkTo && G.zoomTo > 1) return { x: (t.x + G.talkTo.x) / 2, y: (t.y + G.talkTo.y) / 2 - 16 };
  return { x: t.x, y: t.y - 16 };
}
// conversations: the camera leans in a little, and settles between the two people
function updateZoom(dt) { const want = G.zoomTo || 1; if (Math.abs(want - ZOOM) < 0.002) { if (ZOOM !== want) { ZOOM = want; applyZoom(); } return; } ZOOM += (want - ZOOM) * (1 - Math.exp(-dt * 2.6)); applyZoom(); }
function camWanted() {
  const f = camFocus(), W = G.map.w * T, H = G.map.h * T;
  let x = f.x - VW / 2, y = f.y - VH / 2;
  x = W <= VW ? (W - VW) / 2 : clamp(x, 0, W - VW);
  y = H <= VH ? (H - VH) / 2 : clamp(y, 0, H - VH);
  return { x, y };
}
function snapCam() { const w = camWanted(); G.cam.x = w.x; G.cam.y = w.y; }
function updateCam(dt) { const w = camWanted(); const k = 1 - Math.exp(-dt * 6); G.cam.x += (w.x - G.cam.x) * k; G.cam.y += (w.y - G.cam.y) * k; }

// ---------- Lighting ----------
function darkness() {
  const h = G.time;
  let d;
  if (h >= 6.5 && h < 17) d = 0;
  else if (h >= 17 && h < 19.5) d = (h - 17) / 2.5 * 0.76;
  else if (h >= 5 && h < 6.5) d = (6.5 - h) / 1.5 * 0.76;
  else d = 0.76;
  if (G.map.dark !== undefined) d = G.map.dark;
  else if (!G.map.outdoor) d = G.map.indoorDark ? Math.min(d, G.map.indoorDark()) : Math.min(d, 0.3);
  return d;
}
function tintColor() {
  const h = G.time;
  if (h >= 5 && h < 8) return `rgba(255,190,140,${0.14 * (1 - Math.abs(h - 6.5) / 1.5)})`;
  if (h >= 16 && h < 19) return `rgba(255,140,70,${0.18 * (1 - Math.abs(h - 17.7) / 1.5)})`;
  if (G.rain > 0) return `rgba(120,140,160,${G.rain * 0.18})`;
  return null;
}
function drawLighting() {
  const d = darkness();
  if (d <= 0.01) return;
  lx.setTransform(1, 0, 0, 1, 0, 0);
  lx.globalCompositeOperation = 'source-over';
  lx.clearRect(0, 0, lightCv.width, lightCv.height);
  lx.fillStyle = G.map.outdoor ? `rgba(6,10,28,${d})` : `rgba(20,14,8,${d})`;
  lx.fillRect(0, 0, lightCv.width, lightCv.height);
  lx.globalCompositeOperation = 'destination-out';
  const lights = (G.map.lights ? G.map.lights() : []).slice();
  const p = G.player;
  if (G.flashlight) {
    const off = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[p.dir];
    lights.push({ x: p.x + off[0] * 60, y: p.y - 10 + off[1] * 60, r: 95, a: 1 });
    lights.push({ x: p.x, y: p.y - 10, r: 45, a: 0.7 });
  } else lights.push({ x: p.x, y: p.y - 12, r: 40, a: 0.5 });
  for (const L of lights) {
    const sx = (L.x - G.cam.x) * SCALE, sy = (L.y - G.cam.y) * SCALE, r = L.r * SCALE;
    const g = lx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, `rgba(0,0,0,${L.a ?? 1})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    lx.fillStyle = g; lx.beginPath(); lx.arc(sx, sy, r, 0, Math.PI * 2); lx.fill();
  }
  if (lightCv.width < 2) return;
  cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.drawImage(lightCv, 0, 0);
  // warm glow on top of lamps
  cx.globalCompositeOperation = 'lighter';
  for (const L of lights) {
    if (!L.warm) continue;
    const sx = (L.x - G.cam.x) * SCALE, sy = (L.y - G.cam.y) * SCALE, r = L.r * 0.7 * SCALE;
    const g = cx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, `rgba(255,180,90,${0.18 * d})`); g.addColorStop(1, 'rgba(255,180,90,0)');
    cx.fillStyle = g; cx.beginPath(); cx.arc(sx, sy, r, 0, Math.PI * 2); cx.fill();
  }
  cx.globalCompositeOperation = 'source-over';
}

// ---------- Rain ----------
const drops = [];
function drawRain(dt) {
  const want = G.map.outdoor ? Math.floor(G.rain * 420) : 0;
  while (drops.length < want) drops.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, v: rnd(900, 1400), l: rnd(10, 22) });
  if (drops.length > want) drops.length = want;
  if (!want) return;
  cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.strokeStyle = 'rgba(200,215,235,0.45)'; cx.lineWidth = 1 * DPR; cx.beginPath();
  for (const d of drops) {
    d.y += d.v * dt * DPR; d.x -= d.v * 0.12 * dt * DPR;
    if (d.y > cv.height) { d.y = -20; d.x = Math.random() * cv.width * 1.1; }
    cx.moveTo(d.x, d.y); cx.lineTo(d.x + d.l * 0.12 * DPR, d.y - d.l * DPR);
  }
  cx.stroke();
  cx.fillStyle = 'rgba(220,230,245,0.35)';
  for (let i = 0; i < want / 25; i++) { cx.beginPath(); cx.ellipse(Math.random() * cv.width, Math.random() * cv.height, 3 * DPR, 1.2 * DPR, 0, 0, Math.PI * 2); cx.fill(); }
}

// ---------- Main loop ----------
let lastT = performance.now();
function frame(now) {
  try { tick(now); } catch (e) { if (!frame.err || now - frame.err > 5000) { frame.err = now; console.error('frame', e); } } // one bad frame must never stop the game
  requestAnimationFrame(frame);
}
function tick(now) {
  const real = Math.max(0, now - lastT), dt = Math.min(0.05, real / 1000); lastT = now;
  if (G.paused) return;
  G.t += dt; tickSleepers(Math.min(real, 250));
  if (G.cine) {
    cx.setTransform(1, 0, 0, 1, 0, 0); G.cine(cx, cv.width, cv.height);
  } else if (G.running && G.map) {
    if (G.timeRate) G.time = Math.min(G.timeMax, G.time + G.timeRate * dt);
    updatePlayer(dt); updateMovers(dt); updateHens(dt); updateZoom(dt); updateCam(dt);
    currentTarget = findTarget();
    if (wantInteract) { wantInteract = false; if (currentTarget && G.locked === 0) runInteract(currentTarget); }
    render(dt);
    const pr = $('prompt');
    if (currentTarget && !G.locked) {
      const lab = typeof currentTarget.label === 'function' ? currentTarget.label() : currentTarget.label;
      if (pr._lab !== lab) { pr._lab = lab; pr.innerHTML = `<kbd>E</kbd>${lab}`; } pr.style.display = 'block';
    } else pr.style.display = 'none';
    renderStatus(); hudGhost();
  } else { wantInteract = false; }
  checkWaiters();
}
requestAnimationFrame(frame);

// Fade HUD panels that sit on top of the player or the current objective
function hudGhost() {
  const pts = [];
  const toCss = (wx, wy) => [(wx - G.cam.x) * SCALE / DPR, (wy - G.cam.y) * SCALE / DPR];
  // never let the dialogue box sit on top of the people who are talking
  const sub = $('sub'); if (sub._decide && sub.style.display === 'block' && G.map) {
    sub._decide--; const h = sub.offsetHeight || 110, lowTop = innerHeight - (parseFloat(getComputedStyle(sub).bottom) || 110) - h - 8; let low = false;
    for (const q of [G.player.hidden ? null : G.player, G.talkTo || (G.speaking && G.map.objs.find(o => o.npc && o.voice === G.speaking && objVisible(o)))]) if (q) { const [x, y] = toCss(q.x, q.y); if (y > lowTop && y < innerHeight + 30 && Math.abs(x - innerWidth / 2) < sub.offsetWidth / 2 + 20) low = true; }
    if (sub._decide === 0 || low) sub.classList.toggle('top', low);
  }
  if (!G.player.hidden) { pts.push(toCss(G.player.x, G.player.y - 16)); pts.push(toCss(G.player.x, G.player.y - 40)); }
  if (typeof currentGoal === 'function') { const gl = currentGoal(); if (gl && gl[0] === G.map.id) pts.push(toCss(gl[1] * T, gl[2] * T)); }
  for (const id of ['obj', 'status']) {
    const el = $(id); if (el.style.display === 'none') continue;
    const r = el.getBoundingClientRect(), m = 24;
    const over = pts.some(([x, y]) => x > r.left - m && x < r.right + m && y > r.top - m && y < r.bottom + m);
    el.classList.toggle('ghost', over);
  }
}
function render(dt) {
  const m = G.map;
  cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.fillStyle = m.bg || '#000'; cx.fillRect(0, 0, cv.width, cv.height);
  const camX = Math.round(G.cam.x * SCALE) / SCALE, camY = Math.round(G.cam.y * SCALE) / SCALE;
  cx.setTransform(SCALE, 0, 0, SCALE, -camX * SCALE, -camY * SCALE);
  cx.drawImage(m.static, 0, 0);
  m.drawDynamicGround && m.drawDynamicGround(cx);
  // y-sorted drawables
  const list = [];
  // people who might be hidden behind something tall
  const watchers = [];
  if (!G.player.hidden) watchers.push(G.player);
  for (const o of m.objs) if (o.npc && o.draw && objVisible(o) && o.voice) watchers.push(o);
  for (const o of m.objs) if (o.draw && objVisible(o)) {
    const sy = o.sortY !== undefined ? (typeof o.sortY === 'function' ? o.sortY() : o.sortY * T) : (o.npc ? o.y : o.y + o.h);
    let f = () => o.draw(cx, o);
    if (o.occ) {
      const [ox, oy, ow, oh] = o.occ;
      const hidden = watchers.some(w => w.y < sy && w.x > ox * T && w.x < (ox + ow) * T && w.y - 16 > oy * T && w.y - 30 < (oy + oh) * T);
      o._a = lerp(o._a ?? 1, hidden ? 0.32 : 1, Math.min(1, dt * 10));
      if (o._a < 0.99) f = () => { cx.save(); cx.globalAlpha = o._a; o.draw(cx, o); cx.restore(); };
    }
    list.push({ y: sy, f });
  }
  for (const e of G.entities) if (e.map === m.id && e.draw && !e.hidden) list.push({ y: e.y, f: () => e.draw(cx, e) });
  if (m.id === 'village') for (const h of G.hens) if (!h.hidden) list.push({ y: h.y, f: () => drawHen(cx, h) });
  const p = G.player;
  if (!p.hidden) list.push({ y: p.y, f: () => G.riding ? drawRider(cx, p) : drawPerson(cx, p.x, p.y, outfitFor(p), p.dir, p.walk, p.moving || holding() && G.locked > 0 && $('hold').style.display === 'block', G.speaking === 'arjun' && (G.emotion || true), p.sit) });
  list.sort((a, b) => a.y - b.y);
  for (const d of list) d.f();
  m.drawTop && m.drawTop(cx);
  // tint
  const tc = tintColor();
  if (tc) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.fillStyle = tc; cx.fillRect(0, 0, cv.width, cv.height); }
  drawLighting();
  drawRain(dt);
  if (typeof drawMarker === 'function') drawMarker();
}
