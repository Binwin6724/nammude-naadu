// ===== Nammude Naadu — Chapter 4: Pazhaya Koottukaar (Old Friends) =====
// Meera at the school, Appachan's scooter (rideable), a football match, Balan's tea shop, the panchayat library.

// ---------- Looks ----------
Object.assign(LOOKS, {
  meera:  { skin: '#bf855c', hair: '#120c09', plait: true, shirt: '#7a2a3a', lower: 'mundu', lowerColor: '#e2bf5e', neriyathu: '#e2bf5e', border: '#7a2a3a' },
  balan:  { skin: '#a46c46', hair: '#dcd8d0', bald: true, shirt: '#f2efe6', lower: 'mundu', lowerColor: '#f4f0e4', mustache: true, towel: '#d94a3a' },
  shaji:  { skin: '#9e6a46', hair: '#16100c', shirt: '#d9443a', lower: 'pants', lowerColor: '#2a2a30', mustache: true },
  binu:   { skin: '#c48e66', hair: '#1c140f', shirt: '#2f5fa8', lower: 'pants', lowerColor: '#d8d0bc' },
});
const JERSEY = { us: '#2f6fc0', them: '#c8402e' };
Object.assign(ITEM, {
  petrol: 'Bottle of petrol', plug: 'Spark plug', football: 'Old football', hammer: 'Hammer & nails',
  books0: 'Story books (കഥകൾ)', books1: 'History books (ചരിത്രം)', books2: 'Science books (ശാസ്ത്രം)', books3: 'Poetry books (കവിത)',
});

// ---------- small helpers ----------
function addObj(mapId, o) {
  const m = G.maps[mapId];
  const out = o.npc ? o : Object.assign({}, o, { x: o.x * T, y: o.y * T, w: (o.w || 1) * T, h: (o.h || 1) * T });
  m.objs.push(out); return out;
}
const vObj = id => G.maps.village.objs.find(o => o.id === id);

// ======================= APPACHAN'S SCOOTER =======================
function drawScooter(c, x, y, dir, opt = {}) {
  const side = dir === 'left' || dir === 'right', sx = dir === 'left' ? -1 : 1;
  const body = opt.dusty ? '#9aa4a0' : '#7fb3c9', dark = opt.dusty ? '#6f7672' : '#4f8aa3';
  c.save(); c.translate(Math.round(x), Math.round(y));
  shade(c, 0, 1, side ? 20 : 9, 4);
  if (side) {
    c.scale(sx, 1);
    for (const wx of [-12, 12]) { c.fillStyle = '#16161a'; circle(c, wx, -5, 5.2); c.fillStyle = '#9a9a9a'; circle(c, wx, -5, 2); }
    if (opt.flat) { c.fillStyle = '#16161a'; c.fillRect(8, -2, 9, 2); }
    c.fillStyle = body; c.beginPath(); c.moveTo(-18, -6); c.quadraticCurveTo(-19, -17, -9, -18); c.lineTo(1, -17); c.lineTo(2, -6); c.closePath(); c.fill();
    c.fillStyle = dark; c.fillRect(-4, -7, 13, 3);
    c.fillStyle = body; c.beginPath(); c.moveTo(8, -5); c.lineTo(10, -24); c.lineTo(14, -24); c.lineTo(15, -5); c.closePath(); c.fill();
    c.fillStyle = '#2a2a2e'; rr(c, -15, -21, 15, 4, 2);
    c.strokeStyle = '#555'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(12, -24); c.lineTo(11, -29); c.moveTo(7, -29); c.lineTo(16, -29); c.stroke();
    c.fillStyle = opt.lights ? '#fff2b0' : '#d8d8d0'; circle(c, 14.5, -26, 2.4);
    if (!opt.rider) { c.strokeStyle = '#444'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-2, -5); c.lineTo(-5, 0); c.stroke(); }
  } else {
    c.fillStyle = '#16161a'; rr(c, -2.6, -9, 5.2, 10, 2);
    c.fillStyle = body; rr(c, -8, -26, 16, 20, 5);
    if (dir === 'down') { c.fillStyle = opt.lights ? '#fff2b0' : '#d8d8d0'; circle(c, 0, -27, 3); }
    else { c.fillStyle = body; rr(c, -9, -21, 18, 12, 5); c.fillStyle = '#c8302a'; rr(c, -2.5, -12, 5, 2.4, 1); }
    c.strokeStyle = '#555'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-11, -29); c.lineTo(11, -29); c.stroke();
    c.fillStyle = '#888'; circle(c, -11, -31, 1.6); circle(c, 11, -31, 1.6);
  }
  if (opt.dusty) { c.fillStyle = 'rgba(120,110,90,.35)'; for (let i = 0; i < 9; i++) circle(c, (hash(i) - 0.5) * 26, -6 - hash(i + 3) * 18, 1.6); }
  c.restore();
}
function drawRider(c, p) {
  const sc = S.scooter, side = p.dir === 'left' || p.dir === 'right', sx = p.dir === 'left' ? -1 : 1;
  const bump = p.moving ? Math.sin(G.t * 30) * 0.4 : 0;
  c.save(); c.translate(0, bump);
  if (p.dir === 'up') { drawScooter(c, p.x, p.y, 'up', { rider: true, lights: sc.lights }); drawPerson(c, p.x, p.y - 9, outfitFor(p), 'up', 0, false, G.speaking === 'arjun', true); }
  else if (p.dir === 'down') { drawPerson(c, p.x, p.y - 10, outfitFor(p), 'down', 0, false, G.speaking === 'arjun', true); drawScooter(c, p.x, p.y, 'down', { rider: true, lights: sc.lights }); }
  else { drawScooter(c, p.x, p.y, p.dir, { rider: true, lights: sc.lights }); drawPerson(c, p.x - sx * 4, p.y - 8, outfitFor(p), p.dir, 0, false, G.speaking === 'arjun', true); }
  c.restore();
}
let rideSnd = null;
// Appachan's scooter: one recorded engine loop, its pitch following the throttle
function rideSound(on, speed = 0) {
  if (!isFinite(speed)) speed = 0;
  const ctx = AudioSys.ctx(); if (!ctx) return;
  if (on && !rideSnd) {
    const r = rideSnd = { g: ctx.createGain(), lp: ctx.createBiquadFilter() }; r.lp.type = 'lowpass'; r.lp.frequency.value = 900; r.g.gain.value = 0; r.lp.connect(r.g); r.g.connect(AudioSys._dbg().master);
    AudioSys.getLoop('bike', 'sfx').then(b => { if (!b || rideSnd !== r) return; r.s = ctx.createBufferSource(); r.s.buffer = b; r.s.loop = true; r.s.connect(r.lp); r.s.start(); });
  } else if (!on && rideSnd) {
    const r = rideSnd; rideSnd = null; r.g.gain.setTargetAtTime(0, ctx.currentTime, 0.2); setTimeout(() => { try { r.s.stop(); } catch (e) { } }, 1200);
  }
  if (rideSnd) { const k = Math.min(1, speed / 250), t = ctx.currentTime; rideSnd.g.gain.setTargetAtTime(0.55 + 0.35 * k, t, 0.25); rideSnd.lp.frequency.setTargetAtTime(900 + 1600 * k, t, 0.3); if (rideSnd.s) rideSnd.s.playbackRate.setTargetAtTime(0.85 + 0.5 * k, t, 0.3); }
}
setInterval(() => { if (rideSnd && G.riding && !G.player.moving) rideSound(true, 0); if (rideSnd && !G.riding) rideSound(false); }, 250);
function horn() { AudioSys.sfx.horn(); }
function rideSpeed() { const sc = S.scooter; if (!sc || sc.fuel <= 0) return 60; return keys['shift'] ? 250 : 200; }
function onRide(dist) {
  const sc = S.scooter; if (!sc) return;
  const before = sc.fuel; sc.fuel = Math.max(0, sc.fuel - dist / (T * 450));
  if (before > 0.15 && sc.fuel <= 0.15) toast('Petrol is running low — Sasi Motors sells petrol.');
  if (before > 0 && sc.fuel <= 0) toast('Out of petrol! Push it to Sasi Motors at the junction.');
}
function mountScooter() {
  const sc = S.scooter; G.riding = true; G.player.x = sc.x; G.player.y = sc.y; G.flashlight = false;
  AudioSys.sfx.engine(); rideSound(true);
  if (!S.rideHint) { S.rideHint = true; toast('V — get off · H — horn · L — headlight · Shift — faster'); }
}
function dismount() {
  const sc = S.scooter; if (!G.riding) return;
  G.riding = false; sc.x = G.player.x; sc.y = G.player.y; sc.map = G.map.id; rideSound(false);
  // step off to whichever side is free
  const sol = solidsNow(), box = (x, y) => ({ x: x - 7, y: y - 5, w: 14, h: 7 });
  for (const [dx, dy] of [[0, 16], [-20, 0], [20, 0], [0, -16]]) { if (!sol.some(s => hit(box(sc.x + dx, sc.y + dy), s))) { G.player.x = sc.x + dx; G.player.y = sc.y + dy; break; } }
}
function onKey4(k) {
  if (G.locked) return;
  if (k === 'v') {
    if (G.riding) { dismount(); AudioSys.sfx.knock(); return; }
    const sc = S.scooter;
    if (sc && sc.fixed && sc.map === G.map.id && Math.hypot(G.player.x - sc.x, G.player.y - sc.y) < 40) mountScooter();
  }
  if (k === 'h' && G.riding) horn();
  if (k === 'l' && G.riding) { S.scooter.lights = !S.scooter.lights; AudioSys.sfx.blip(); }
}
// Leaving the village while riding parks the scooter where you were.
{
  const _goto = goto;
  goto = async function (id, tx, ty, dir, fade) { if (G.riding && G.map && id !== G.map.id) dismount(); return _goto(id, tx, ty, dir, fade); };
  const _reset = resetWorld;
  resetWorld = function () { if (G.riding) { G.riding = false; } rideSound(false); G.carry = null; return _reset(); };
  const _shed = shedAct;
  shedAct = async function () {
    if (active('scooterclean') && S.scooter && !S.scooter.out) {
      await hold('Dragging the scooter out from under the tarpaulin', 2000, AudioSys.sfx.rustle);
      Object.assign(S.scooter, { out: true, dusty: true, flat: true, x: 14.3 * T, y: 17.7 * T, map: 'village' });
      await think('Dust, cobwebs and a flat tyre. But it is all there, just as he left it.', 2800); return;
    }
    if (active('ball') && !has('football')) {
      give('football'); done('ball');
      await think('My old football, in a sack behind the coir rope. Appachan kept it all these years. It still holds air... mostly.', 3400); return;
    }
    return _shed();
  };
}
// Headlight + parked-scooter on the village map
{
  const vm = G.maps.village, baseLights = vm.lights;
  vm.lights = () => {
    const L = baseLights();
    if (G.riding && S.scooter && S.scooter.lights && G.map === vm) {
      const off = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[G.player.dir], p = G.player;
      L.push({ x: p.x + off[0] * 70, y: p.y - 8 + off[1] * 70, r: 105, a: 1 }); L.push({ x: p.x + off[0] * 20, y: p.y - 10 + off[1] * 20, r: 50, a: 0.9, warm: true });
    }
    if (S.libOpen && darkness() > 0.2) L.push({ x: 42.8 * T, y: 26 * T, r: 60, a: 0.6, warm: true });
    return L;
  };
}

// ======================= VILLAGE ADDITIONS =======================
// the library sits east of the lane; move the palm that stood there
{ const pi = PALMS.findIndex(p => p[0] === 39.6 && p[1] === 22.5); if (pi >= 0) { const objs = G.maps.village.objs; const o = objs.find(o => o.solid && Math.abs(o.x - (39.6 - 0.15) * T) < 1 && Math.abs(o.y - (22.5 - 0.12) * T) < 1); if (o) objs.splice(objs.indexOf(o), 1); } }
G.maps.village.solidsPx.push({ x: 39.6 * T, y: 23.6 * T, w: 6 * T, h: 2.2 * T });
{
  const vp = G.maps.village.paint;
  G.maps.village.paint = (c, m) => {
    vp(c, m);
    c.fillStyle = '#b5653f'; c.fillRect(37 * T, 25.8 * T, 6 * T, 1.1 * T); grain(c, 37 * T, 25.8 * T, 6 * T, 1.1 * T, ['#a3583a', '#c37450', '#8f4a2f'], 110, 3, 77);
    c.fillStyle = '#4f7a35'; for (let i = 0; i < 26; i++) circle(c, 39.4 * T + hash(i + 900) * 6.4 * T, 25.9 * T + hash(i + 950) * 0.5 * T, 3 + hash(i) * 3);
  };
}
addObj('village', { x: 39.6, y: 21.2, w: 6, h: 4.6, sortY: 25.8, occ: [39.2, 20.6, 6.8, 5], draw(c, o) {
  const X = o.x, Y = o.y, W = o.w, H = o.h;
  wallFace(c, X + 4, Y + H * 0.45, W - 8, H * 0.55, '#e2d4b0');
  c.fillStyle = 'rgba(70,95,50,.35)'; for (let i = 0; i < 9; i++) c.fillRect(X + 8 + i * 21, Y + H - 8 - hash(i) * 10, 9, 8 + hash(i) * 10);
  woodWindow(c, X + 18, Y + H * 0.6, 20, 22, !!S.libOpen); woodWindow(c, X + W - 40, Y + H * 0.6, 20, 22, !!S.libOpen);
  const dx = X + 2.55 * T, dy = Y + 3.05 * T;
  c.fillStyle = '#4a2e1a'; c.fillRect(dx - 3, dy - 3, 1.3 * T + 6, 1.55 * T + 3);
  if (S.libOpen) { c.fillStyle = '#1a120c'; c.fillRect(dx, dy, 1.3 * T, 1.55 * T); c.fillStyle = '#6a4428'; c.fillRect(dx - 6, dy, 6, 1.55 * T); }
  else { c.fillStyle = '#6a4428'; c.fillRect(dx, dy, 1.3 * T, 1.55 * T); c.strokeStyle = '#4a2e1a'; c.beginPath(); c.moveTo(dx + 0.65 * T, dy); c.lineTo(dx + 0.65 * T, dy + 1.55 * T); c.stroke(); c.fillStyle = '#b08a3a'; c.fillRect(dx + 0.65 * T - 3, dy + 22, 6, 7); c.fillStyle = '#e8e0c8'; c.fillRect(dx + 4, dy + 6, 10, 13); c.fillStyle = '#c94a3a'; c.fillRect(dx + 4, dy + 6, 10, 3); }
  tileRoof(c, X - 6, Y, W + 12, H * 0.5, 0.12, '#9a4a35');
  sign(c, X + 16, Y + H * 0.5 - 8, W - 32, 'പഞ്ചായത്ത് ലൈബ്രറി', 'PANCHAYAT LIBRARY · 1962', '#5a3a22');
  c.fillStyle = '#3f7a2e'; for (let i = 0; i < 14; i++) circle(c, X + 4 + hash(i + 40) * 14, Y + H * 0.4 + hash(i + 41) * H * 0.55, 3 + hash(i + 42) * 2);
} });
addObj('village', { x: 42.1, y: 25.8, w: 1.6, h: 0.7, label: () => S.hooks.libDoor ? S.hooks.libDoor.label : S.libOpen ? 'Enter the library' : 'Library door', act: async () => {
  if (S.hooks.libDoor) { const h = S.hooks.libDoor; delete S.hooks.libDoor; return h.fn(); }
  if (S.libOpen) return goto('library', 9, 10.7, 'up');
  await think('Locked. A rusted padlock and ten years of election posters.', 2400);
} });
addObj('village', { x: 40.3, y: 4.0, w: 1.4, h: 0.6, label: "Enter Balan's tea shop", when: () => !!S.teaOpen, act: () => goto('teashop', 6, 7.1, 'up') });
// Meera's exhibition easel at the school gate
addObj('village', { x: 30.5, y: 3.7, w: 1.3, h: 0.8, sortY: 4.5, visible: () => !!S.exhibit, draw(c, o) {
  c.strokeStyle = '#6a4428'; c.lineWidth = 2; c.beginPath(); c.moveTo(o.x + 4, o.y + o.h + 4); c.lineTo(o.x + 12, o.y - 18); c.lineTo(o.x + o.w - 4, o.y + o.h + 4); c.stroke();
  c.fillStyle = '#e9dfc6'; rr(c, o.x, o.y - 24, o.w, 26, 2);
  for (let i = 0; i < 6; i++) { c.fillStyle = ['#8a7a60', '#6f6550', '#9a8a6a'][i % 3]; c.fillRect(o.x + 3 + (i % 3) * 13, o.y - 21 + Math.floor(i / 3) * 11, 10, 8); }
  c.fillStyle = '#7a2a3a'; c.font = '600 5px Inter'; c.fillText('75 വർഷം', o.x + 6, o.y - 26);
} });
addObj('village', Object.assign(hooked('meera'), { id: 'meera', npc: true, x: 28.6 * T, y: 4.45 * T, dir: 'down', voice: 'meera', visible: () => !!S.meeraV, draw: npcDraw('meera') }));
addObj('village', Object.assign(hooked('shaji'), { id: 'shaji', npc: true, x: 42.9 * T, y: 4.5 * T, dir: 'left', voice: 'shaji', visible: () => !!S.shajiV, draw: npcDraw('shaji') }));
addObj('village', Object.assign(hooked('binu'), { id: 'binu', npc: true, x: 12.6 * T, y: 2.8 * T, dir: 'right', voice: 'binu', visible: () => !!S.binuV, draw: npcDraw('binu') }));
// the scooter, parked
addObj('village', { id: 'scooter', npc: true, get x() { return S.scooter ? S.scooter.x : -999; }, set x(v) { }, get y() { return S.scooter ? S.scooter.y : -999; }, set y(v) { }, dir: 'right',
  visible: () => !!(S.scooter && S.scooter.out && !G.riding && S.scooter.map === 'village'),
  draw: (c, o) => drawScooter(c, o.x, o.y, 'right', { dusty: S.scooter.dusty, flat: S.scooter.flat }),
  label: () => { const sc = S.scooter; if (active('scooterclean') && sc.dusty) return 'Clean the scooter'; if (active('fix')) return 'Repair the scooter with Sasi Chettan'; if (sc.fixed) return 'Get on the scooter (V)'; return 'Look at the scooter'; },
  act: async () => {
    const sc = S.scooter;
    if (active('scooterclean') && sc.dusty) {
      await hold('Washing off eight years of dust', 2600, AudioSys.sfx.splash); sc.dusty = false; done('scooterclean');
      await say('c4_arj6'); return;
    }
    if (active('fix')) {
      if (!S.sasiHere) { await think('I need Sasi Chettan for the tyres and the engine.'); return; }
      if (!has('petrol') || !has('plug')) { await think(`Sasi Chettan: 'Bring the ${!has('plug') ? 'spark plug' : 'petrol'} first, mone.'`, 2400); return; }
      await hold('Fitting the spark plug, patching the tyres', 3200, AudioSys.sfx.knock);
      take('petrol'); take('plug'); Object.assign(sc, { fixed: true, flat: false, fuel: 1 });
      AudioSys.sfx.engine(); setTimeout(() => AudioSys.sfx.engine(), 900);
      done('fix'); await say('c4_sas5'); return;
    }
    if (sc.fixed) { mountScooter(); return; }
    await think('It needs petrol, a new spark plug and someone who knows engines.', 2400);
  } });
// petrol from Jomon's auto, and from Sasi Motors
addObj('village', { id: 'autoFuel', npc: true, get x() { return AUTO.x; }, set x(v) { }, get y() { return AUTO.y; }, set y(v) { }, label: "Take petrol from Jomon's auto", when: () => active('fuel') && G.entities.includes(AUTO) && !AUTO.hidden,
  act: async () => { await say('c4_jom5'); await hold('Filling a bottle from the auto', 1200, AudioSys.sfx.splash); give('petrol'); done('fuel'); } });
addObj('village', { x: 52.5, y: 3.9, w: 0.8, h: 0.6, sortY: 4.5, draw(c, o) { c.fillStyle = '#2f6a3a'; rr(c, o.x + 4, o.y - 12, 18, 30, 3); c.fillStyle = '#e8c040'; c.fillRect(o.x + 4, o.y - 2, 18, 3); c.fillStyle = '#222'; c.fillRect(o.x + 10, o.y - 15, 6, 4); },
  label: 'Buy petrol (₹80 a litre)', when: () => !!(S.scooter && S.scooter.fixed && S.scooter.fuel < 1.9),
  act: async () => { if (G.cash < 80) { await think('Not enough cash.'); return; } await hold('Filling the tank', 1200, AudioSys.sfx.splash); G.cash -= 80; toast('− ₹80'); S.scooter.fuel = Math.min(2, S.scooter.fuel + 1); toast(`Petrol: ${S.scooter.fuel.toFixed(1)} L`); } });

// ======================= BALAN'S TEA SHOP (interior) =======================
defMap('teashop', {
  w: 12, h: 8, bg: '#120d09',
  indoorDark: () => 0.1,
  lights: () => [{ x: 6 * T, y: 3 * T, r: 170, a: 0.85, warm: true }, { x: 2 * T, y: 5.5 * T, r: 110, a: 0.7, warm: true }, { x: 10 * T, y: 5.5 * T, r: 110, a: 0.7, warm: true }],
  solids: [[0, 0, 12, 1.3], [3, 1.9, 6, 0.8], [1.6, 4.2, 4, 0.8], [6.6, 4.2, 4, 0.8], [0, 7.7, 5.4, 0.3], [6.6, 7.7, 5.4, 0.3]],
  paint(c) {
    c.fillStyle = '#8a7a62'; c.fillRect(0, 0, 12 * T, 8 * T); grain(c, 0, 0, 12 * T, 8 * T, ['#7d6e57', '#968770', '#857560'], 1800, 2, 31);
    c.fillStyle = '#4f7a5a'; c.fillRect(0, 0, 12 * T, 1.3 * T); c.fillStyle = '#c9a36a'; c.fillRect(0, 0, 12 * T, 0.55 * T);
    c.fillStyle = '#5a3a22'; c.fillRect(0.4 * T, 0.6 * T, 2.4 * T, 4); c.fillRect(9.2 * T, 0.6 * T, 2.4 * T, 4);
    for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(220,235,240,.55)'; rr(c, 0.5 * T + i * 14, 0.6 * T - 14, 11, 14, 2); c.fillStyle = ['#e8b04a', '#d9602a', '#f0e0a0', '#a05a2a', '#e8c86a'][i]; c.fillRect(0.5 * T + i * 14 + 2, 0.6 * T - 9, 7, 8); }
    c.fillStyle = '#f0ead8'; c.fillRect(9.4 * T, 0.12 * T, 26, 30); c.fillStyle = '#c94a3a'; c.fillRect(9.4 * T, 0.12 * T, 26, 7); c.fillStyle = '#555'; c.font = '600 5px Inter'; c.fillText('2018', 9.4 * T + 6, 0.12 * T + 20);
    c.fillStyle = '#6a4428'; rr(c, 10.6 * T, 0.7 * T - 10, 22, 14, 3); c.fillStyle = '#3a2a1a'; circle(c, 10.6 * T + 7, 0.7 * T - 3, 4); c.fillStyle = '#d8c8a0'; c.fillRect(10.6 * T + 13, 0.7 * T - 7, 7, 3);
    c.strokeStyle = '#7a5a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(4.2 * T, 0); c.lineTo(4.2 * T, 0.5 * T); c.stroke();
    c.fillStyle = '#e8c040'; for (let i = 0; i < 7; i++) { c.save(); c.translate(4.2 * T + (i - 3) * 4, 0.6 * T + Math.abs(i - 3) * 1.5); c.rotate((i - 3) * 0.15); rr(c, -2, 0, 4, 12, 2); c.restore(); }
    c.fillStyle = '#5a3a22'; c.fillRect(0.3 * T, 5.8 * T, 0.7 * T, 1.7 * T); c.fillStyle = '#6b4428'; c.fillRect(0.35 * T, 5.85 * T, 0.6 * T, 1.6 * T);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, 7.6 * T, 12 * T, 0.4 * T); c.fillStyle = '#3c3e41'; c.fillRect(5.4 * T, 7.7 * T, 1.2 * T, 0.3 * T);
  },
  drawTop(c) { for (let i = 0; i < 3; i++) { const ph = (G.t * 0.5 + i / 3) % 1; c.fillStyle = `rgba(255,255,255,${0.28 * (1 - ph)})`; circle(c, 7.6 * T + Math.sin(ph * 6 + i) * 5, 1.7 * T - 14 - ph * 30, 4 + ph * 6); } },
  objs: [
    { id: 'tBalan', npc: true, x: 6 * T, y: 1.75 * T, dir: 'down', voice: 'balan', draw: npcDraw('balan') },
    { x: 3, y: 1.9, w: 6, h: 0.8, sortY: 2.7, draw(c, o) {
      c.fillStyle = '#6b4428'; c.fillRect(o.x, o.y, o.w, o.h); c.fillStyle = '#7d5232'; c.fillRect(o.x, o.y, o.w, 5);
      c.fillStyle = 'rgba(210,230,235,.45)'; rr(c, o.x + 8, o.y - 16, 64, 20, 2); c.fillStyle = '#d9962a'; for (let i = 0; i < 7; i++) ellipse(c, o.x + 16 + i * 8, o.y - 3, 4, 2.2);
      c.fillStyle = '#b8702a'; for (let i = 0; i < 4; i++) circle(c, o.x + 20 + i * 12, o.y - 10, 3.4);
      c.fillStyle = '#c99a3a'; rr(c, o.x + 4.3 * T, o.y - 22, 20, 26, 6); c.fillStyle = '#e8c060'; rr(c, o.x + 4.3 * T + 4, o.y - 26, 12, 6, 2); c.fillStyle = '#9a7020'; c.fillRect(o.x + 4.3 * T + 19, o.y - 6, 6, 3);
      c.fillStyle = 'rgba(230,240,240,.6)'; for (let i = 0; i < 5; i++) rr(c, o.x + 5.2 * T + i * 6, o.y - 9, 4, 9, 1);
    } },
    ...[[1.6, 4.2], [6.6, 4.2]].map(([x, y], i) => ({ x, y, w: 4, h: 0.8, sortY: 4.9, draw(c, o) {
      c.fillStyle = '#5a3a22'; c.fillRect(o.x + 2, o.y - 14, o.w - 4, 6); c.fillRect(o.x + 2, o.y + o.h + 10, o.w - 4, 6);
      c.fillStyle = '#7d5232'; rr(c, o.x, o.y, o.w, o.h, 2); c.fillStyle = '#e9e2cc'; rr(c, o.x + 4, o.y + 3, o.w - 8, o.h - 6, 2);
      if (i === 0 && S.teaServed) {
        for (let k = 0; k < 4; k++) { const gx = o.x + 14 + k * 26; c.fillStyle = 'rgba(230,240,240,.7)'; rr(c, gx, o.y + 6, 7, 12, 1); c.fillStyle = '#c8945a'; c.fillRect(gx + 1, o.y + 9, 5, 8); }
        c.fillStyle = '#eeeeea'; ellipse(c, o.x + 62, o.y + 16, 14, 6); c.fillStyle = '#d9962a'; for (let k = 0; k < 5; k++) ellipse(c, o.x + 54 + k * 4, o.y + 15, 4, 2);
      }
    } })),
    { x: 0.3, y: 6.2, w: 0.7, h: 0.6, draw(c, o) { c.fillStyle = 'rgba(230,240,240,.55)'; rr(c, o.x + 6, o.y + 2, 6, 10, 1); } },
    { x: 5.4, y: 7.3, w: 1.2, h: 0.6, label: 'Go outside', act: () => goto('village', 41, 4.85, 'down') },
  ],
});

// ======================= PANCHAYAT LIBRARY (interior) =======================
const SHELF_CAT = [['കഥകൾ', 'Stories', '#b8402e'], ['ചരിത്രം', 'History', '#2f5f9a'], ['ശാസ്ത്രം', 'Science', '#3f8a4a'], ['കവിത', 'Poetry', '#d9a83a']];
const LIB_SHELVES = [1.2, 5.4, 9.6, 13.8];
const LIB_HEAPS = [[2.2, 4.4, 2.2, 7.0], [7.4, 5.5, 7.4, 7.0], [13.2, 4.6, 12.6, 7.0]];
const LIB_WEBS = [[0.4, 2.6], [4.55, 1.1], [13.05, 1.1], [17.0, 2.8]];
const LIB_PILES = [[15.4, 9.8, 0], [1.6, 10.1, 1], [11.6, 10.3, 2], [5.4, 10.0, 3]];
const PILE_NOTE = [
  'Novels — Basheer, Thakazhi, M.T. Vasudevan Nair. These go on the Stories (കഥകൾ) shelf.',
  'Kerala history, the freedom struggle, old temple records. The History (ചരിത്രം) shelf.',
  'Science textbooks and a 1985 physics guide. The Science (ശാസ്ത്രം) shelf.',
  'Kumaran Asan, Changampuzha, Sugathakumari. The Poetry (കവിത) shelf.',
];
function libCount(prefix, n, id, text) { const k = [...Array(n).keys()].filter(i => S[prefix + i]).length; setObjText(id, `${text} (${k}/${n})`); if (k === n) done(id); }
defMap('library', {
  w: 18, h: 12, bg: '#120d09',
  indoorDark: () => (S.libClean ? 0.12 : 0.3),
  lights: () => [[3.4, 2], [9, 2], [14.6, 2]].map(([x, y]) => ({ x: x * T, y: y * T + 40, r: 150, a: 0.8 })).concat([{ x: 9 * T, y: 9 * T, r: 130, a: 0.6 }]),
  solids: [[0, 0, 18, 1.55], [0, 0, 0.25, 12], [17.75, 0, 0.25, 12], [0, 11.65, 8.3, 0.35], [9.7, 11.65, 8.3, 0.35]],
  paint(c) {
    c.fillStyle = '#6f7a68'; c.fillRect(0, 0, 18 * T, 12 * T);
    c.strokeStyle = 'rgba(40,50,40,.25)'; c.lineWidth = 1; for (let x = 0; x < 18 * T; x += T) { c.beginPath(); c.moveTo(x, 1.5 * T); c.lineTo(x, 12 * T); c.stroke(); } for (let y = 1.5 * T; y < 12 * T; y += T) { c.beginPath(); c.moveTo(0, y); c.lineTo(18 * T, y); c.stroke(); }
    grain(c, 0, 1.5 * T, 18 * T, 10.5 * T, ['#66705f', '#7a8573', '#5f6858'], 2600, 2, 12);
    c.fillStyle = '#d6caa6'; c.fillRect(0, 0, 18 * T, 1.55 * T); c.fillStyle = '#b8a880'; c.fillRect(0, 1.35 * T, 18 * T, 0.2 * T);
    for (const wx of [3.4, 9, 14.6]) { c.fillStyle = '#5a3a22'; c.fillRect(wx * T - 18, 4, 36, 30); c.fillStyle = '#bcd8e0'; c.fillRect(wx * T - 15, 7, 30, 24); c.strokeStyle = '#5a3a22'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(wx * T - 15 + k * 7.5, 7); c.lineTo(wx * T - 15 + k * 7.5, 31); c.stroke(); } }
    c.fillStyle = '#8a6a4a'; c.fillRect(6.6 * T, 0.25 * T, 40, 20); c.fillStyle = '#e8dfc8'; c.font = '600 6px Inter'; c.fillText('വായനശാല', 6.6 * T + 4, 0.25 * T + 13);
    c.fillStyle = '#b5653f'; c.fillRect(8.3 * T, 11.65 * T, 1.4 * T, 0.35 * T);
  },
  drawTop(c) {
    // light shafts and dust motes from the windows
    for (const wx of [3.4, 9, 14.6]) {
      const g = c.createLinearGradient(0, 1.2 * T, 0, 6 * T); g.addColorStop(0, `rgba(255,240,200,${S.libClean ? 0.1 : 0.16})`); g.addColorStop(1, 'rgba(255,240,200,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(wx * T - 15, 1.2 * T); c.lineTo(wx * T + 15, 1.2 * T); c.lineTo(wx * T + 60, 6 * T); c.lineTo(wx * T + 10, 6 * T); c.closePath(); c.fill();
      if (!S.libClean) for (let i = 0; i < 10; i++) { const ph = (G.t * 0.05 + hash(i + wx)) % 1; c.fillStyle = 'rgba(255,245,220,.5)'; circle(c, wx * T - 5 + hash(i * 3 + wx) * 50 + ph * 20, 1.4 * T + ph * 4.2 * T, 0.9); }
    }
  },
  objs: [
    ...LIB_SHELVES.map((x, cat) => ({ x, y: 1.55, w: 3.2, h: 0.75, solid: true, sortY: 2.3,
      label: () => (cat === 3 && !S.shelfFixed && active('shelf')) ? 'Repair the broken shelf' : `Shelve the books — ${SHELF_CAT[cat][1]}`,
      when: () => (cat === 3 && !S.shelfFixed && active('shelf')) || (G.carry != null && active('books')),
      draw(c, o) {
        const broken = cat === 3 && !S.shelfFixed, full = S['shelved' + cat];
        c.save(); if (broken) { c.translate(o.x + o.w / 2, o.y + o.h); c.rotate(0.06); c.translate(-(o.x + o.w / 2), -(o.y + o.h)); }
        c.fillStyle = '#5a3a22'; c.fillRect(o.x, o.y - 1.25 * T, o.w, 1.25 * T + o.h); c.fillStyle = '#3a2414'; c.fillRect(o.x + 3, o.y - 1.25 * T + 3, o.w - 6, 1.25 * T + o.h - 6);
        for (let r = 0; r < 3; r++) {
          const sy = o.y - 1.25 * T + 4 + r * 16; c.fillStyle = '#6b4428'; c.fillRect(o.x + 3, sy + 13, o.w - 6, 3);
          if (broken && r === 2) continue;
          const n = full ? 15 : 4 + ((cat + r) % 3);
          for (let k = 0; k < n; k++) { const bw = 4 + hash(k + r * 9 + cat * 31) * 2.5; c.fillStyle = full ? (k % 4 ? SHELF_CAT[cat][2] : '#8a7a5a') : ['#7a6a52', '#6a5a46', '#8a7658'][k % 3]; c.fillRect(o.x + 6 + k * 6.3, sy + 13 - (9 + hash(k + r) * 3), bw, 9 + hash(k + r) * 3); }
        }
        c.restore();
        if (broken) { c.fillStyle = '#6b4428'; c.save(); c.translate(o.x + 30, o.y + o.h + 6); c.rotate(0.4); c.fillRect(0, 0, 40, 4); c.restore(); }
        c.fillStyle = '#efe6cc'; rr(c, o.x + o.w / 2 - 22, o.y - 1.25 * T - 10, 44, 11, 2); c.fillStyle = SHELF_CAT[cat][2]; c.font = '700 7px Inter'; c.textAlign = 'center'; c.fillText(SHELF_CAT[cat][0], o.x + o.w / 2, o.y - 1.25 * T - 1.5); c.textAlign = 'left';
      },
      act: async () => {
        if (cat === 3 && !S.shelfFixed && active('shelf')) {
          if (!has('hammer')) { await think('I need a hammer and some nails.'); return; }
          await hold('Hammering the shelf back together', 2300, AudioSys.sfx.knock); S.shelfFixed = true; done('shelf'); return;
        }
        if (G.carry == null) return;
        if (G.carry !== cat) { await think(`These are ${SHELF_CAT[G.carry][1].toLowerCase()} books. They go on the ${SHELF_CAT[G.carry][1]} (${SHELF_CAT[G.carry][0]}) shelf.`, 2600); return; }
        if (cat === 3 && !S.shelfFixed) { await think('The poetry shelf is broken. I have to repair it first.', 2400); return; }
        await hold('Shelving the books', 900, AudioSys.sfx.rustle); take('books' + cat); G.carry = null; S['shelved' + cat] = true;
        libCount('shelved', 4, 'books', 'Sort the books onto the right shelves');
      } })),
    ...LIB_HEAPS.map(([x, y, tx, ty], i) => ({ id: 'heap' + i, x, y, w: 2.8, h: 1.2, solid: true,
      label: 'Move the benches into a row', when: () => active('benches') && !S['heap' + i],
      draw(c, o) {
        if (S['heap' + i]) {
          c.fillStyle = '#5a3a22'; c.fillRect(o.x + 4, o.y - 12, o.w - 8, 6); c.fillRect(o.x + 4, o.y + o.h + 6, o.w - 8, 6);
          c.fillStyle = '#7d5232'; rr(c, o.x, o.y, o.w, o.h, 2); c.fillStyle = '#8a6040'; c.fillRect(o.x + 3, o.y + 3, o.w - 6, 3);
          if (S.libClean && i === 1) { c.fillStyle = '#e8dcb8'; c.save(); c.translate(o.x + 40, o.y + 12); c.rotate(-0.1); c.fillRect(0, 0, 24, 16); c.restore(); }
          return;
        }
        c.fillStyle = 'rgba(0,0,0,.22)'; ellipse(c, o.x + o.w / 2, o.y + o.h, o.w / 2 + 6, 8);
        const plank = (px, py, w, a, col) => { c.save(); c.translate(px, py); c.rotate(a); c.fillStyle = col; c.fillRect(-w / 2, -4, w, 8); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-w / 2, 2, w, 2); c.restore(); };
        plank(o.x + 30, o.y + 30, 70, 0.3, '#6b4428'); plank(o.x + 55, o.y + 22, 80, -0.25, '#7d5232'); plank(o.x + 40, o.y + 10, 60, 0.6, '#5a3a22'); plank(o.x + 62, o.y + 4, 46, -0.9, '#6b4428');
        c.fillStyle = 'rgba(200,195,180,.25)'; for (let k = 0; k < 8; k++) circle(c, o.x + hash(k + i * 7) * o.w, o.y + hash(k + 3 + i) * o.h, 2);
      },
      act: async o => {
        await hold('Dragging the benches into a row', 1600, AudioSys.sfx.knock);
        S['heap' + i] = true; o.x = tx * T; o.y = ty * T; o.h = 0.9 * T;
        const p = G.player; if (p.x > o.x - 8 && p.x < o.x + o.w + 8 && p.y > o.y - 4 && p.y < o.y + o.h + 6) p.y = o.y + o.h + 0.75 * T;
        libCount('heap', 3, 'benches', 'Move the jumbled benches back into rows');
      } })),
    ...LIB_WEBS.map(([x, y], i) => ({ x, y, w: 0.8, h: 0.7, sortY: 12, reach: 8, visible: () => !S['web' + i],
      label: 'Sweep away the cobweb', when: () => active('cobwebs'),
      draw(c, o) {
        const cxw = o.x + o.w / 2, cyw = o.y + o.h / 2; c.strokeStyle = 'rgba(235,235,230,.55)'; c.lineWidth = 0.8;
        for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; c.beginPath(); c.moveTo(cxw, cyw); c.lineTo(cxw + Math.cos(a) * 16, cyw + Math.sin(a) * 12); c.stroke(); }
        for (const r of [5, 10, 15]) { c.beginPath(); for (let k = 0; k <= 8; k++) { const a = k / 8 * 6.28; const px = cxw + Math.cos(a) * r, py = cyw + Math.sin(a) * r * 0.75; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); }
        c.fillStyle = '#222'; circle(c, cxw + 3, cyw + 2 + Math.sin(G.t * 2 + i) * 1.5, 1.6);
      },
      act: async () => { if (!has('broom')) { await think('I need the broom.'); return; } await hold('Sweeping the cobweb down', 900, AudioSys.sfx.sweep); S['web' + i] = true; libCount('web', 4, 'cobwebs', 'Sweep away the cobwebs'); } })),
    ...LIB_PILES.map(([x, y, cat], j) => ({ x: x - 0.45, y: y - 0.3, w: 0.9, h: 0.6, visible: () => !S['pile' + j],
      label: 'Pick up the books', when: () => active('books') && G.carry == null,
      draw(c, o) { shade(c, o.x + o.w / 2, o.y + o.h, 14, 4); for (let k = 0; k < 5; k++) { c.fillStyle = k % 2 ? SHELF_CAT[cat][2] : '#8a7a5a'; c.save(); c.translate(o.x + o.w / 2, o.y + o.h - 3 - k * 4); c.rotate((hash(k + j * 5) - 0.5) * 0.5); c.fillRect(-10, -2, 20, 4); c.restore(); } },
      act: async () => { await hold('Picking up the pile', 700, AudioSys.sfx.rustle); S['pile' + j] = true; G.carry = cat; give('books' + cat); await think(PILE_NOTE[cat], 3000); } })),
    { x: 16.5, y: 4.3, w: 1.1, h: 1.9, solid: true, sortY: 6.2,
      label: 'Search the newspaper cupboard', when: () => active('papers'),
      draw(c, o) { c.fillStyle = '#4a4e52'; rr(c, o.x, o.y - 20, o.w, o.h + 20, 2); c.fillStyle = '#5c6166'; c.fillRect(o.x + 3, o.y - 17, o.w / 2 - 4, o.h + 14); c.fillRect(o.x + o.w / 2 + 1, o.y - 17, o.w / 2 - 4, o.h + 14); c.fillStyle = '#c9a24a'; c.fillRect(o.x + o.w / 2 - 3, o.y + 14, 2, 8); c.fillStyle = '#e8dcb8'; c.font = '600 5px Inter'; c.fillText('1990–99', o.x + 3, o.y - 22); },
      act: async () => { await hold('Untying the 1996 bundles', 2000, AudioSys.sfx.rustle); done('papers'); } },
    Object.assign(hooked('lmeera'), { id: 'lmeera', npc: true, x: 9.2 * T, y: 3.4 * T, dir: 'down', voice: 'meera', draw: npcDraw('meera') }),
    { x: 8.3, y: 11.3, w: 1.4, h: 0.6, label: 'Go outside', act: () => goto('village', 42.9, 26.7, 'down') },
  ],
});

// ======================= FOOTBALL MATCH (minigame) =======================
function footballGame() {
  return new Promise(resolve => {
    const box = $('mini'), mc = $('mc'), m = mc.getContext('2d'); box.style.display = 'flex'; G.locked++;
    const W = 560, H = 360, X0 = 28, X1 = 532, Y0 = 62, Y1 = 344, GY0 = 168, GY1 = 238, MIDX = (X0 + X1) / 2, MIDY = (Y0 + Y1) / 2;
    const look = (base, team) => Object.assign({}, base, { shirt: JERSEY[team], lower: 'pants', lowerColor: '#1d1d24' });
    const arj = outfitFor(G.player);
    const P = (name, team, role, hx, hy, L, human = false) => ({ name, team, role, hx, hy, x: hx, y: hy, L, human, dir: team === 'us' ? 'right' : 'left', walk: 0, moving: false, cd: 0, fx: team === 'us' ? 1 : -1, fy: 0 });
    const kid = i => ({ skin: ['#9a6644', '#b07a52', '#8a5a3c', '#c48a60'][i], hair: '#16100c', mustache: i === 1 });
    const players = [
      P('Arjun', 'us', 'fw', 220, MIDY + 20, look(arj, 'us'), true),
      P('Jomon', 'us', 'fw', 230, MIDY - 70, look(LOOKS.jomon, 'us')),
      P('Shaji', 'us', 'def', 140, MIDY + 60, look(LOOKS.shaji, 'us')),
      P('Binu', 'us', 'gk', X0 + 14, MIDY, Object.assign(look(LOOKS.binu, 'us'), { shirt: '#e8c040' })),
      P('', 'them', 'fw', 340, MIDY - 40, look(kid(0), 'them')),
      P('', 'them', 'fw', 350, MIDY + 60, look(kid(1), 'them')),
      P('', 'them', 'def', 430, MIDY, look(kid(2), 'them')),
      P('', 'them', 'gk', X1 - 14, MIDY, Object.assign(look(kid(3), 'them'), { shirt: '#2a2a2a' })),
    ];
    const me = players[0];
    const ball = { x: MIDX, y: MIDY, vx: 0, vy: 0, owner: null, hold: 0 };
    let score = { us: 0, them: 0 }, clock = 80, msg = '', msgT = 0, st = 'kickoff', stT = 1.4, fin = false, last = performance.now(), kickWant = false, passWant = false;
    const goalX = team => team === 'us' ? X1 : X0;
    const mates = p => players.filter(q => q.team === p.team && q !== p);
    const foes = p => players.filter(q => q.team !== p.team);
    function kickoff(toTeam) {
      for (const p of players) { p.x = p.hx; p.y = p.hy; p.cd = 0; }
      ball.x = MIDX; ball.y = MIDY; ball.vx = ball.vy = 0; ball.owner = null;
      const taker = players.find(p => p.team === toTeam && p.role === 'fw' && (toTeam === 'them' || p.human));
      taker.x = MIDX + (toTeam === 'us' ? -12 : 12); taker.y = MIDY; st = 'kickoff'; stT = 1.2;
    }
    function kick(p, tx, ty, power) {
      const dx = tx - ball.x, dy = ty - ball.y, d = Math.hypot(dx, dy) || 1;
      ball.owner = null; ball.vx = dx / d * power; ball.vy = dy / d * power; p.cd = 0.35; AudioSys.sfx.knock();
    }
    function shoot(p) { const gx = goalX(p.team), spread = p.team === 'them' ? 30 : p.human ? Math.max(0, (Math.abs(gx - p.x) - 110) * 0.25) : 14, gy = GY0 + 10 - spread + Math.random() * (GY1 - GY0 - 20 + spread * 2); kick(p, gx, gy, p.team === 'them' ? 340 + Math.random() * 60 : 380 + Math.random() * 60); }
    function pass(p, to) { const d = Math.hypot(to.x - ball.x, to.y - ball.y); kick(p, to.x + (to.team === 'us' ? 18 : -18), to.y, clamp(d * 1.7, 200, 380)); }
    function bestMate(p) {
      let best = null, bs = -1e9;
      for (const q of mates(p)) { if (q.role === 'gk') continue; const ahead = (q.x - p.x) * (p.team === 'us' ? 1 : -1); const press = Math.min(...foes(p).map(f => Math.hypot(f.x - q.x, f.y - q.y))); const s = ahead * 0.6 + press - Math.hypot(q.x - p.x, q.y - p.y) * 0.2 + (q.human ? 40 : 0); if (s > bs) { bs = s; best = q; } }
      return best;
    }
    const key = k => {
      if (k === 'escape') { msg = 'Match abandoned'; return end(); }
      if (st === 'over') { if (INTERACT.includes(k) || k === 'click') end(); return; }
      if (INTERACT.includes(k)) kickWant = true;
      if (k === 'q') passWant = true;
    };
    keyListeners.add(key);
    function end() { if (fin) return; fin = true; keyListeners.delete(key); box.style.display = 'none'; G.locked--; resolve(score); }
    function moveTowards(p, tx, ty, sp, dt) {
      const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
      if (d < 3) { p.moving = false; return; }
      const s = Math.min(d, sp * dt); p.x = clamp(p.x + dx / d * s, X0 + 4, X1 - 4); p.y = clamp(p.y + dy / d * s, Y0 + 6, Y1 - 4); p.moving = true; p.walk += dt * 11;
      p.fx = dx / d; p.fy = dy / d; p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    }
    function step(now) {
      if (fin) return;
      const dt = Math.min(0.04, (now - last) / 1000); last = now;
      if (st === 'kickoff') { stT -= dt; if (stT <= 0) st = 'play'; }
      else if (st === 'goal') { stT -= dt; if (stT <= 0) kickoff(msg.includes('Kadavu') ? 'us' : 'them'); }
      else if (st === 'play') {
        clock -= dt; if (clock <= 0) { clock = 0; st = 'over'; AudioSys.sfx.done(); }
        for (const p of players) { p.cd = Math.max(0, p.cd - dt); p.tk = Math.max(0, (p.tk || 0) - dt); }
        // human
        let dx = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0), dy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
        if (dx || dy) { const l = Math.hypot(dx, dy); moveTowards(me, me.x + dx / l * 40, me.y + dy / l * 40, keys['shift'] ? 150 : 124, dt); } else me.moving = false;
        if (kickWant) {
          if (ball.owner === me) { const gx = goalX('us'); const towards = (dx || dy) ? [ball.x + me.fx * 200, ball.y + me.fy * 200] : [gx, (GY0 + GY1) / 2]; if (me.x > X1 - 200 && !(dx < 0)) shoot(me); else kick(me, towards[0], towards[1], 400); }
          else if (Math.hypot(ball.x - me.x, ball.y - me.y) < 18) { if (ball.owner && ball.owner.team !== 'us') { if ((me.tk || 0) <= 0) { me.tk = 0.6; if (Math.random() < 0.4) { ball.owner.cd = 0.6; ball.owner = me; AudioSys.sfx.knock(); } } } else if (!ball.owner) kick(me, ball.x + me.fx * 100, ball.y + me.fy * 100, 300); }
        }
        if (passWant && ball.owner === me) { const q = bestMate(me); if (q) pass(me, q); }
        kickWant = passWant = false;
        // AI
        for (const team of ['us', 'them']) {
          const field = players.filter(p => p.team === team && p.role !== 'gk' && !p.human);
          const chaser = (ball.owner && ball.owner.team === team) ? null : field.slice().sort((a, b) => Math.hypot(a.x - ball.x, a.y - ball.y) - Math.hypot(b.x - ball.x, b.y - ball.y))[0];
          for (const p of field) {
            const sp = team === 'them' ? 116 : 112;
            if (ball.owner === p) {
              const gx = goalX(team), gy = MIDY + Math.sin(now / 600 + p.hx) * 40;
              moveTowards(p, gx, gy, sp * (team === 'them' ? 0.9 : 0.9), dt);
              const pressed = foes(p).some(f => Math.hypot(f.x - p.x, f.y - p.y) < 26);
              p.hold = (p.hold || 0) + dt;
              if (Math.abs(gx - p.x) < (team === 'them' ? 125 : 150) && p.hold > 0.3) shoot(p);
              else if (pressed && p.hold > 0.5 && Math.random() < dt * 3) { const q = bestMate(p); if (q) pass(p, q); }
            } else {
              p.hold = 0;
              if (p === chaser) moveTowards(p, ball.x, ball.y, sp, dt);
              else if (p.role === 'def' && ball.owner && ball.owner.team !== team) { const own = team === 'us' ? X0 : X1; moveTowards(p, own + (ball.x - own) * 0.45, MIDY + (ball.y - MIDY) * 0.7, sp, dt); }
              else { const dir = team === 'us' ? 1 : -1; const tx = clamp(p.hx + (ball.x - MIDX) * 0.6 + (ball.owner && ball.owner.team === team ? dir * 50 : 0), X0 + 30, X1 - 30), ty = clamp(p.hy * 0.6 + ball.y * 0.4, Y0 + 10, Y1 - 10); moveTowards(p, tx, ty, sp * 0.8, dt); }
            }
          }
        }
        // keepers
        for (const k of players.filter(p => p.role === 'gk')) {
          if (ball.owner === k) { k.hold = (k.hold || 0) + dt; if (k.hold > 0.8) { const q = bestMate(k); if (q) pass(k, q); } continue; }
          k.hold = 0; moveTowards(k, k.hx + (k.team === 'us' ? 6 : -6), clamp(ball.y, GY0 + 4, GY1 - 4), 90, dt);
        }
        // ball
        if (ball.owner) {
          const o = ball.owner; ball.x = o.x + o.fx * 9; ball.y = o.y + o.fy * 6 + 2; ball.vx = ball.vy = 0;
          for (const f of foes(o)) { if (f.human || f.role === 'gk') continue; if (Math.hypot(f.x - ball.x, f.y - ball.y) < 12 && Math.random() < dt * (o.human ? 2.2 : f.team === 'us' ? 2.4 : 1.5)) { o.cd = 0.6; ball.owner = f; break; } }
        } else {
          ball.x += ball.vx * dt; ball.y += ball.vy * dt; const f = Math.exp(-1.15 * dt); ball.vx *= f; ball.vy *= f;
          if (ball.y < Y0 + 4) { ball.y = Y0 + 4; ball.vy = Math.abs(ball.vy) * 0.7; } if (ball.y > Y1 - 4) { ball.y = Y1 - 4; ball.vy = -Math.abs(ball.vy) * 0.7; }
          const inGoal = ball.y > GY0 && ball.y < GY1;
          if (ball.x < X0) { if (inGoal) { score.them++; msg = 'GOAL — Kadavu boys'; st = 'goal'; stT = 2; AudioSys.sfx.splash(); } else { ball.x = X0; ball.vx = Math.abs(ball.vx) * 0.6; } }
          if (ball.x > X1) { if (inGoal) { score.us++; msg = 'GOAL — Puzhakkara!'; st = 'goal'; stT = 2; AudioSys.sfx.done(); } else { ball.x = X1; ball.vx = -Math.abs(ball.vx) * 0.6; } }
          const spd = Math.hypot(ball.vx, ball.vy);
          for (const p of players) {
            if (p.cd > 0) continue; const d = Math.hypot(p.x - ball.x, p.y - ball.y);
            const reach = p.role === 'gk' ? 15 : 11;
            if (d < reach && (spd < 330 || d < 7 || (p.role === 'gk' && Math.random() < (p.team === 'us' ? 0.7 : 0.62)))) { ball.owner = p; break; }
            if (p.role === 'gk' && d < reach) p.cd = 0.4;
          }
        }
      }
      if (msgT > 0) msgT -= dt;
      draw();
      requestAnimationFrame(step);
    }
    function draw() {
      m.fillStyle = '#1a2a18'; m.fillRect(0, 0, W, H);
      for (let i = 0; i < 10; i++) { m.fillStyle = i % 2 ? '#5f9a3e' : '#68a445'; m.fillRect(X0 + i * (X1 - X0) / 10, Y0, (X1 - X0) / 10 + 1, Y1 - Y0); }
      m.fillStyle = 'rgba(180,150,100,.35)'; m.beginPath(); m.ellipse(MIDX, MIDY, 60, 34, 0, 0, 6.28); m.fill(); m.beginPath(); m.ellipse(X0 + 40, MIDY, 40, 50, 0, 0, 6.28); m.fill(); m.beginPath(); m.ellipse(X1 - 40, MIDY, 40, 50, 0, 0, 6.28); m.fill();
      m.strokeStyle = 'rgba(255,255,255,.7)'; m.lineWidth = 2; m.strokeRect(X0, Y0, X1 - X0, Y1 - Y0); m.beginPath(); m.moveTo(MIDX, Y0); m.lineTo(MIDX, Y1); m.stroke(); m.beginPath(); m.arc(MIDX, MIDY, 34, 0, 6.28); m.stroke();
      m.strokeRect(X0, GY0 - 34, 62, GY1 - GY0 + 68); m.strokeRect(X1 - 62, GY0 - 34, 62, GY1 - GY0 + 68);
      for (const gx of [X0, X1]) { const s = gx === X0 ? -1 : 1; m.fillStyle = 'rgba(255,255,255,.15)'; m.fillRect(Math.min(gx, gx + s * 14), GY0, 14, GY1 - GY0); m.strokeStyle = '#f4f4f0'; m.lineWidth = 3; m.beginPath(); m.moveTo(gx, GY0); m.lineTo(gx + s * 14, GY0); m.lineTo(gx + s * 14, GY1); m.lineTo(gx, GY1); m.stroke(); }
      // coconut palms and spectators at the edge
      for (let i = 0; i < 9; i++) { m.fillStyle = '#2f5a22'; m.beginPath(); m.arc(40 + i * 60, Y0 - 2, 10, Math.PI, 0); m.fill(); }
      const list = players.slice().sort((a, b) => a.y - b.y);
      m.fillStyle = 'rgba(0,0,0,.3)'; m.beginPath(); m.ellipse(ball.x, ball.y + 2, 4.5, 2, 0, 0, 6.28); m.fill();
      for (const p of list) {
        m.save(); m.translate(p.x, p.y); m.scale(0.8, 0.8); drawPerson(m, 0, 0, p.L, p.dir, p.walk, p.moving); m.restore();
        if (p.human) { m.fillStyle = '#f5e14a'; m.beginPath(); m.moveTo(p.x - 4, p.y - 40); m.lineTo(p.x + 4, p.y - 40); m.lineTo(p.x, p.y - 35); m.fill(); }
        else if (p.name) { m.fillStyle = 'rgba(255,255,255,.75)'; m.font = '600 8px Inter, sans-serif'; m.textAlign = 'center'; m.fillText(p.name, p.x, p.y - 36); }
      }
      const bz = ball.owner ? 0 : Math.min(6, Math.hypot(ball.vx, ball.vy) / 80);
      m.fillStyle = '#f4f2ea'; m.beginPath(); m.arc(ball.x, ball.y - bz, 3.8, 0, 6.28); m.fill(); m.fillStyle = '#333'; m.beginPath(); m.arc(ball.x + 0.8, ball.y - bz - 0.6, 1.3, 0, 6.28); m.fill();
      // header
      m.fillStyle = 'rgba(10,14,10,.92)'; m.fillRect(0, 0, W, 50);
      m.textAlign = 'left'; m.font = '700 15px Inter, sans-serif'; m.fillStyle = JERSEY.us; m.fillText('PUZHAKKARA', 18, 22); m.fillStyle = '#f5efe3'; m.font = '800 20px Inter, sans-serif'; m.textAlign = 'center'; m.fillText(`${score.us}  –  ${score.them}`, W / 2, 26);
      m.textAlign = 'right'; m.font = '700 15px Inter, sans-serif'; m.fillStyle = '#e8705a'; m.fillText('KADAVU BOYS', W - 18, 22);
      m.textAlign = 'center'; m.font = '500 10px Inter, sans-serif'; m.fillStyle = '#b8b0a0';
      const mm = Math.floor(clock / 60), ss = Math.floor(clock % 60);
      m.fillText(`${mm}:${String(ss).padStart(2, '0')}   ·   WASD move · Shift sprint · E shoot / tackle · Q pass · Esc stop`, W / 2, 43);
      if (st === 'kickoff') banner('Kick-off!');
      if (st === 'goal') banner(msg);
      if (st === 'over') banner(`Full time · ${score.us} – ${score.them}`, score.us > score.them ? 'Puzhakkara win! Press E' : score.us === score.them ? 'A draw. Press E' : 'Kadavu boys win. Press E');
    }
    function banner(t, s) { m.fillStyle = 'rgba(0,0,0,.55)'; m.fillRect(0, MIDY - 30, W, s ? 62 : 44); m.fillStyle = '#f5efe3'; m.textAlign = 'center'; m.font = '800 22px Inter, sans-serif'; m.fillText(t, W / 2, MIDY); if (s) { m.font = '500 12px Inter, sans-serif'; m.fillStyle = '#e8b65a'; m.fillText(s, W / 2, MIDY + 22); } }
    G._fb = { ball, players, score: () => score };
    kickoff('us');
    requestAnimationFrame(step);
  });
}

// ======================= NEWSPAPER REVEAL (painted) =======================
const NEWS = { step: 0, t0: 0 };
function sceneNewspaper(c, W, H, t) {
  const k = Math.min(W / 1000, H / 600); c.save(); c.translate(W / 2, H / 2); c.scale(k * (1 + t * 0.004), k * (1 + t * 0.004)); c.translate(-500, -300);
  c.fillStyle = '#2e1e12'; c.fillRect(-400, -300, 1800, 1200);
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let i = 0; i < 30; i++) { c.beginPath(); c.moveTo(-400, i * 24); c.bezierCurveTo(200, i * 24 + 8, 600, i * 24 - 8, 1400, i * 24 + 4); c.stroke(); }
  const st = NEWS.step, since = (performance.now() - NEWS.t0) / 1000;
  const paper = (x, y, w, h, rot, date, head, sub, photo, cap, extra) => {
    c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(rot); c.translate(-w / 2, -h / 2);
    c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(8, 10, w, h);
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#eadfbe'); g.addColorStop(1, '#d6c79c'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(150,110,50,.16)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(hash(i + x) * w, hash(i + y) * h, 20 + hash(i) * 30, 0, 6.28); c.fill(); }
    c.fillStyle = '#1c1812'; c.textAlign = 'center'; c.font = '800 34px "Noto Serif Malayalam", serif'; c.fillText('പുഴക്കര വാർത്ത', w / 2, 46);
    c.fillRect(20, 58, w - 40, 2); c.font = '600 13px "Noto Sans Malayalam", Inter, sans-serif'; c.fillText(date, w / 2, 76); c.fillRect(20, 84, w - 40, 1);
    c.textAlign = 'left'; c.font = '800 25px "Noto Serif Malayalam", serif'; let yy = wrap(head, 22, 118, w - 44, 32);
    c.font = '600 13px "Noto Sans Malayalam", Inter, sans-serif'; c.fillStyle = '#3a3226'; yy = wrap(sub, 22, yy + 26, w - 44, 17);
    const py = yy + 16, ph = Math.min(170, h - py - 120); c.fillStyle = '#9a8e72'; c.fillRect(22, py, 150, ph); photo(22, py, 150, ph);
    c.fillStyle = '#3a3226'; c.font = '600 11px "Noto Sans Malayalam", Inter, sans-serif'; c.fillText(cap, 22, py + ph + 16);
    c.fillStyle = 'rgba(40,34,24,.5)'; const rows = Math.floor(ph / 13); for (let r = 0; r < rows; r++) c.fillRect(188, py + r * 13, w - 210 - (r % 4 === 3 ? 60 : 0), 5);
    const ty = py + ph + 30; for (let r = 0; r < 3; r++) c.fillRect(22, ty + r * 13, w - 44 - (r === 2 ? 120 : 0), 5);
    extra && extra(ty + 3 * 13 + 14, w);
    c.restore();
    function wrap(s, x0, y0, mw, lh) { const words = s.split(' '); let line = '', yy = y0; for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (c.measureText(tst).width > mw && line) { c.fillText(line, x0, yy); line = wd; yy += lh; } else line = tst; } c.fillText(line, x0, yy); return yy; }
  };
  const man = (x, y, w, h) => {
    c.fillStyle = '#7a705a'; c.fillRect(x, y, w, h);
    c.fillStyle = '#d8d0b8'; c.beginPath(); c.moveTo(x + 14, y + h); c.quadraticCurveTo(x + w / 2, y + h * 0.58, x + w - 14, y + h); c.fill();
    c.fillStyle = '#b8ae94'; c.beginPath(); c.moveTo(x + w / 2 - 12, y + h * 0.66); c.lineTo(x + w / 2, y + h * 0.8); c.lineTo(x + w / 2 + 12, y + h * 0.66); c.fill();
    c.fillStyle = '#5a5240'; c.fillRect(x + w / 2 - 9, y + h * 0.5, 18, h * 0.16);
    c.fillStyle = '#6a6250'; c.beginPath(); c.ellipse(x + w / 2, y + h * 0.4, 28, 34, 0, 0, 6.28); c.fill();
    c.fillStyle = '#26211a'; c.beginPath(); c.ellipse(x + w / 2, y + h * 0.3, 30, 20, 0, Math.PI, 0); c.fill(); c.fillRect(x + w / 2 - 30, y + h * 0.3 - 2, 6, 16); c.fillRect(x + w / 2 + 24, y + h * 0.3 - 2, 6, 16);
    c.fillStyle = '#26211a'; c.fillRect(x + w / 2 - 13, y + h * 0.39, 8, 3); c.fillRect(x + w / 2 + 5, y + h * 0.39, 8, 3); c.fillRect(x + w / 2 - 12, y + h * 0.5, 24, 5);
    c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 300; i++) c.fillRect(x + hash(i) * w, y + hash(i + 7) * h, 1.5, 1.5);
  };
  const mill = (x, y, w, h) => {
    c.fillStyle = '#8a8270'; c.fillRect(x, y, w, h); c.fillStyle = '#5a5444'; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + 30 + i * 30, y + h * 0.35 - i * 8, 24, 0, 6.28); c.fill(); }
    c.fillStyle = '#2a261e'; c.fillRect(x + 20, y + h * 0.56, w - 40, h * 0.44); c.beginPath(); c.moveTo(x + 14, y + h * 0.58); c.lineTo(x + w / 2, y + h * 0.43); c.lineTo(x + w - 14, y + h * 0.58); c.fill(); c.fillRect(x + w - 44, y + h * 0.3, 12, h * 0.28);
    c.fillStyle = '#6a604c'; c.fillRect(x + 40, y + h * 0.7, 18, 20); c.fillRect(x + 92, y + h * 0.7, 18, 20);
  };
  const slide = st >= 1 ? Math.min(1, since * 1.6) : 0;
  const complaint = (ly, w) => {
    c.font = '700 14px "Noto Sans Malayalam", Inter, sans-serif'; c.textAlign = 'left';
    const txt = 'പരാതി നൽകിയത്: സംഘം പ്രസിഡന്റ് കെ. രാഘവൻ', tw = c.measureText(txt).width;
    if (st >= 2) { const p = Math.min(1, since * 0.8); c.fillStyle = 'rgba(255,236,140,.6)'; c.fillRect(18, ly - 15, (tw + 8) * p, 21); c.strokeStyle = 'rgba(190,30,30,.85)'; c.lineWidth = 3; c.beginPath(); c.ellipse(22 + tw / 2, ly - 5, tw / 2 + 16, 18, -0.02, -1.6, -1.6 + 6.4 * p); c.stroke(); }
    c.fillStyle = '#1c1812'; c.fillText(txt, 22, ly);
  };
  paper(250 - 170 * slide, 46, 500, 520, -0.02 - slide * 0.03, '1996 ഓഗസ്റ്റ് 19, തിങ്കൾ', 'സഹകരണ ഫണ്ട് കാണാനില്ല; ജീവനക്കാരൻ മുങ്ങി', 'കാർഷിക സഹകരണ സംഘത്തിൽ നിന്ന് ലക്ഷങ്ങൾ നഷ്ടപ്പെട്ടു', man, 'രവി (34), സംഘം അക്കൗണ്ടന്റ്', complaint);
  if (st >= 1) paper(1100 - 560 * slide, 86, 440, 456, 0.04, '1996 ഓഗസ്റ്റ് 17, ശനി', 'അരി മില്ലിൽ ദുരൂഹ തീപിടുത്തം', 'വെള്ളിയാഴ്ച രാത്രി; ഓഫീസിലെ രേഖകൾ കത്തിനശിച്ചു', mill, 'കത്തിനശിച്ച മിൽ ഓഫീസ്');
  if (st >= 2) {
    const a = Math.min(1, since * 0.7); c.globalAlpha = a;
    c.fillStyle = 'rgba(10,8,6,.88)'; rr(c, 150, 2, 700, 38, 8); c.fillStyle = '#f5efe3'; c.font = '600 16px Inter, sans-serif'; c.textAlign = 'center';
    c.fillText('Aug 16 — mill fire, records burned   ·   Aug 18 — the "theft"   ·   reported by K. Raghavan', 500, 27); c.globalAlpha = 1;
  }
  const vg = c.createRadialGradient(500, 300, 200, 500, 300, 700); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)'); c.fillStyle = vg; c.fillRect(-400, -300, 1800, 1200);
  c.restore();
}

// ======================= OBJECTIVE TARGETS =======================
function targetFor4(id) {
  const sc = S.scooter, L = (x, y) => ['library', x, y], VV = (x, y) => ['village', x, y];
  switch (id) {
    case 'school': return VV(28.6, 5.3);
    case 'scooterclean': return sc && sc.out ? VV(sc.x / T, sc.y / T) : VV(14, 16.2);
    case 'fuel': return VV(AUTO.x / T, AUTO.y / T + 0.5);
    case 'plug': return VV(55.1, 4.6);
    case 'fix': return S.sasiHere ? VV(sc.x / T, sc.y / T) : VV(55.1, 4.6);
    case 'ride': return G.riding ? VV(28.6, 5.6) : sc ? VV(sc.x / T, sc.y / T) : null;
    case 'ball': return VV(14, 16.2);
    case 'shaji': return VV(42.9, 4.6);
    case 'binu': return VV(12.6, 2.9);
    case 'match': return VV(16.4, 3.1);
    case 'library': return VV(42.9, 26.3);
    case 'benches': { const h = LIB_HEAPS.map(([x, y], i) => [x + 1.4, y + 1.6, i]).filter(([, , i]) => !S['heap' + i]); return h.length ? L(h[0][0], h[0][1]) : null; }
    case 'cobwebs': { const w = LIB_WEBS.map(([x, y], i) => [x + 0.4, y + 1, i]).filter(([, , i]) => !S['web' + i]); return w.length ? nearestOf(w.map(([x, y]) => [x, y]), 'library') : null; }
    case 'shelf': return L(15.4, 2.7);
    case 'books': if (G.carry != null) return L(LIB_SHELVES[G.carry] + 1.6, 2.7); { const p = LIB_PILES.filter((_, j) => !S['pile' + j]); return p.length ? nearestOf(p.map(([x, y]) => [x, y]), 'library') : null; }
    case 'papers': return L(16.2, 6.6);
  }
  return null;
}

// ======================= CHAPTER 4 — PAZHAYA KOOTTUKAAR =======================
async function chapter4(part = 0) {
  save('ch4');
  LIB_HEAPS.forEach(([x, y], i) => { const o = G.maps.library.objs.find(q => q.id === 'heap' + i); if (o) Object.assign(o, { x: x * T, y: y * T, h: 1.2 * T }); });
  Object.assign(DOORS, { 'library>village': [9, 11.5], 'village>library': [42.9, 26.2], 'teashop>village': [6, 7.6], 'house>library': [12.25, 15.7] });
  const wasCash = G.cash; resetWorld(); G.cash = wasCash < 2000 ? wasCash : 1035;
  G.chapter = 'Chapter 4 · Old Friends'; G.day = 8; G.time = 7.4; G.timeRate = 0.004; G.timeMax = 16.7; G.rain = 0;
  AudioSys.setRain(0); AudioSys.setHum(0); AudioSys.setAmbience({ birds: true, night: false, frogs: false });
  Object.assign(S, { houseLights: true, bedMade: true, bulbFixed: true, unpacked: true, boxFound: true, win0: true, win1: true, dust0: true, dust1: true, dust2: true, kunOn: true, cocoOn: 0, swept: true,
    compostBin: true, pumpFixed: true, pumpWeeds: true, sickleSharp: true, debt: 85000,
    beds: CROP_INFO.map(ci => ({ dug: true, crop: ci.crop, stage: 2, water: true })) });
  for (let i = 0; i < 6; i++) S['weed' + i] = true; for (let i = 0; i < 4; i++) S['br' + i] = true; for (let i = 0; i < 3; i++) S['fence' + i] = true;
  S.scooter = { out: false, x: 0, y: 0, map: 'village', fuel: 0, fixed: false, lights: false };
  G.player.outfit = 'mundu'; give('photo1996', 1, true); give('key', 1, true); give('knife', 1, true);
  G.hens = [makeHen(28.5, 18, COOP_ZONE), makeHen(30.5, 19, COOP_ZONE, '#e8dcc6'), makeHen(32, 17.8, COOP_ZONE), makeHen(29.4, 20, COOP_ZONE, '#b5532e', true)];
  CANOE.x = 62.9 * T; CANOE.y = 25.4 * T; CANOE.rower = false;
  AUTO.x = 56.2 * T; AUTO.y = 6.05 * T; AUTO.heading = Math.PI; AUTO.hidden = false; AUTO.passenger = false;
  G.entities = [CANOE, AUTO];
  const kun = vObj('kun'); kun.x = 54.6 * T; kun.y = 26.6 * T; kun.sitting = true; kun.dir = 'down';
  const sasi = vObj('sasi'); sasi.x = 55.1 * T; sasi.y = 4.4 * T; sasi.dir = 'down';
  const jom = vObj('jomon'), mee = vObj('meera');
  setAmm('kitchen');
  hud(false); await fadeOut(10);
  if (part < 1) {
  await card('Chapter 4', 'Pazhaya Koottukaar', 'പഴയ കൂട്ടുകാർ', 'Old Friends', 3800);

  // Jomon arrives
  await goto('village', 22, 26.2, 'down', false);
  S.jomonOn = true; jom.x = 22.2 * T; jom.y = 31 * T; jom.dir = 'up';
  hud(true); Music.set('morning'); await fadeIn(1400);
  await scene(async () => {
    letterbox(true); await moveTo(jom, 22.2, 27.6, 70); jom.dir = 'up';
    await say('c4_jom1'); await say('c4_arj1'); await say('c4_jom2');
    // a walk around the village
    await fadeOut(900); G.time = 8.3; Music.set('day');
    S.meeraV = true; S.exhibit = true; mee.x = 28.6 * T; mee.y = 4.45 * T; mee.dir = 'down';
    G.player.x = 27.4 * T; G.player.y = 5.7 * T; G.player.dir = 'right'; jom.x = 26.2 * T; jom.y = 5.75 * T; jom.dir = 'right';
    pan([[41, 6.4], [41, 5.4]], [3]); await fadeIn(900);
    await caption("Balan's Tea Shop", 2800, 'The village newspaper since 1979');
    await pan([[41, 5.4], [42.6, 23.5]], [4]);
    await caption('The Panchayat Library', 2800, 'Locked for ten years');
    await pan([[42.6, 23.5], [16, 3]], [4.5]);
    await caption('The football ground', 2800, 'Every evening of their childhood');
    await pan([[16, 3], [28, 5.2]], [3]);
    G.camTarget = null;
    await say('c4_jom3'); G.player.dir = 'up';
    await say('c4_mee1'); await say('c4_arj2'); await say('c4_mee2'); await say('c4_arj3'); await say('c4_mee3');
    await think('Arjun takes the photograph out of his shirt pocket and hands it to her.', 2600);
    await say('c4_mee4'); await say('c4_arj4'); await say('c4_mee5'); await say('c4_arj5');
    G.player.dir = 'left'; await say('c4_jom4');
    letterbox(false);
  });
  (async () => { await moveTo(jom, 36, 5.8, 80); jom.x = 57.6 * T; jom.y = 6.25 * T; jom.dir = 'left'; })();
  setHook('meera', 'Talk to Meera', async () => think("Meera: 'Get that scooter running first. I will ask the panchayat office for the library key.'", 3000), true);

  // Mission 9 — the scooter
  setObj("Mission 9 — Repair Appachan's scooter", [['scooterclean', 'Pull the scooter out of the shed and clean it'], ['fuel', "Get petrol from Jomon's auto (junction)"], ['plug', 'Buy a spark plug at Sasi Motors (₹120)'], ['fix', 'Repair the tyres and engine with Sasi Chettan']]);
  setHook('sasi', 'Talk to Sasi Chettan', async () => {
    if (G.cash < 120) { await think('Not enough cash.'); setHook('sasi', 'Talk to Sasi Chettan', S.hooks.__s4); return; }
    G.cash -= 120; toast('− ₹120'); give('plug'); done('plug'); await say('c4_sas4');
  });
  S.hooks.__s4 = S.hooks.sasi.fn;
  await until(() => isDone('plug') && isDone('scooterclean') && G.locked === 0);
  await scene(async () => { await fadeOut(500); sasi.x = S.scooter.x + 1.1 * T; sasi.y = S.scooter.y + 6; sasi.dir = 'left'; S.sasiHere = true; await fadeIn(500); await think('Sasi Chettan has cycled over with a bag of tools hanging from the handlebar.', 2600); });
  await waitAll();
  await scene(async () => { await fadeOut(500); sasi.x = 55.1 * T; sasi.y = 4.4 * T; sasi.dir = 'down'; S.sasiHere = false; await fadeIn(500); });
  setObj("Mission 9 — Repair Appachan's scooter", [['ride', 'Ride the scooter to the school (V — get on/off · H — horn · L — headlight)']]);
  await until(() => G.riding && G.map.id === 'village' && near(G.player, 28.6, 5.6, 70) && G.locked === 0);
  done('ride'); horn();
  await scene(() => think("Meera laughs and waves from the school gate. 'Mathachan's scooter, alive again!'", 3000));
  await idle();
  setHook('meera', 'Talk to Meera', async () => think("Meera: 'A match at five? I can see the ground from the staff room window. I will be counting your goals.'", 3000), true);
  }

  // Mission 10 — football
  await checkpoint('ch4', 1, part);
  if (part === 1) setHook('meera', 'Talk to Meera', async () => think("Meera: 'A match at five? I can see the ground from the staff room window. I will be counting your goals.'", 3000), true);
  if (part < 2) {
  await scene(async () => { AudioSys.sfx.ring(); toast('📱 Jomon calling'); await sleep(1200); await say('c4_jom6'); });
  S.shajiV = true; S.binuV = true; jom.x = 16.4 * T; jom.y = 3.1 * T; jom.dir = 'down';
  AUTO.x = 20.5 * T; AUTO.y = 6.05 * T;
  setObj('Mission 10 — A football match', [['ball', 'Find your old football (storage shed)'], ['shaji', "Find Shaji (Balan's tea shop)"], ['binu', 'Find Binu (football ground)'], ['match', 'Meet the team at the ground (5 PM)']]);
  setHook('shaji', 'Talk to Shaji', async () => { await say('c4_sha1'); done('shaji'); });
  setHook('binu', 'Talk to Binu', async () => { await say('c4_bin1'); done('binu'); });
  gate('jomon', 'Start the match', () => ['ball', 'shaji', 'binu'].every(isDone), "Jomon: 'Ball? Team? We can't play two-a-side, da.'", async () => { done('match'); });
  await waitAll();
  if (G.riding) dismount();
  let result;
  await scene(async () => {
    await fadeOut(800); G.time = 17.0; G.timeRate = 0; Music.set(null); take('football');
    S.shajiV = false; S.binuV = false;
    await card('', 'Five o’clock', '', 'Puzhakkara vs. the boys from the jetty', 2200);
    G.player.x = 15.4 * T; G.player.y = 2.6 * T; G.player.dir = 'right'; jom.x = 16.6 * T; jom.y = 2.5 * T; jom.dir = 'left'; snapCam();
    await fadeIn(600); await say('c4_jom7');
    result = await footballGame();
    S.friendship = (S.friendship || 0) + 1 + (result.us > result.them ? 1 : 0);
    Music.set('evening');
    await say(result.us > result.them ? 'c4_jom8w' : 'c4_jom8l');
  });

  // Balan's tea shop
  await scene(async () => {
    await fadeOut(900); letterbox(true); G.time = 17.7; S.jomonOn = false;
    const tm = G.maps.teashop; if (!tm.static) buildStatic(tm);
    const bal = tm.objs.find(o => o.id === 'tBalan');
    const seat = (id, look, voice, x, y, dir) => { let o = tm.objs.find(q => q.id === id); if (!o) { o = { id, npc: true, voice, draw: npcDraw(look) }; tm.objs.push(o); } Object.assign(o, { x: x * T, y: y * T, dir, sitting: true }); return o; };
    seat('tJom', 'jomon', 'jomon', 5.95, 4.8, 'left'); seat('tSha', 'shaji', 'shaji', 2.6, 3.95, 'down'); seat('tBin', 'binu', 'binu', 4.2, 3.95, 'down');
    await goto('teashop', 1.25, 4.8, 'right', false); G.player.sit = true;
    await fadeIn(900);
    await caption("Balan's Tea Shop", 2400, 'Chaya and pazhampori, after the match');
    await say('c4_bal1');
    await moveTo(bal, 9.6, 1.75, 60); await moveTo(bal, 9.6, 3.3, 60); await moveTo(bal, 5.9, 3.3, 60); bal.dir = 'down';
    AudioSys.sfx.knock(); S.teaServed = true; await sleep(500);
    await say('c4_sha2'); await say('c4_arj7');
    await say('c4_bal2'); await say('c4_bin2'); await say('c4_arj8'); await say('c4_jom9');
    await caption('The whole shop laughs. For a moment, it is 1998 again.', 3000);
    bal.dir = 'left'; await say('c4_bal3');
    await think('Nobody looks at the empty bench in the corner. Arjun cannot stop looking at it.', 3200);
    await moveTo(bal, 9.6, 3.3, 60); await moveTo(bal, 9.6, 1.75, 60); await moveTo(bal, 6, 1.75, 60); bal.dir = 'down';
    for (const id of ['tJom', 'tSha', 'tBin']) { const o = tm.objs.find(q => q.id === id); tm.objs.splice(tm.objs.indexOf(o), 1); }
    await fadeOut(1600); letterbox(false); G.player.sit = false; S.teaServed = false; S.teaOpen = true;
  });

  // Two days later — the library
  G.day = 9; G.time = 8; G.timeRate = 0.004; G.timeMax = 16; S.meeraV = true; mee.x = 41.6 * T; mee.y = 26.7 * T; mee.dir = 'right'; S.exhibit = false;
  if (S.scooter.fixed) { Object.assign(S.scooter, { x: 25.4 * T, y: 25.9 * T, map: 'village' }); }
  await goto('village', 22, 24.9, 'down', false); Music.set('morning');
  await card('', 'Day 9', '', 'Meera has the library key.', 2600); await fadeIn(1300);
  }
  await checkpoint('ch4', 2, part);
  setObj('Mission 11 — Search the library', [['library', 'Meet Meera at the library (east of the lane, past the paddy fields)']]);
  clearHook('meera');
  setHook('libDoor', 'Open the library with Meera', async () => {
    done('library');
    await scene(async () => {
      mee.dir = 'right'; G.player.dir = 'up';
      await think('Meera turns the key. The padlock gives way with a crunch of rust.', 2600); AudioSys.sfx.knock(); S.libOpen = true;
      await goto('library', 9, 10.7, 'up');
      const lm = G.maps.library.objs.find(o => o.id === 'lmeera'); lm.x = 9.6 * T; lm.y = 9.4 * T; lm.dir = 'up';
      S.meeraV = false; Music.set('day');
      await say('c4_mee6');
      await think('Meera hands over a broom, a hammer and a fistful of nails.', 2400);
      give('broom', 1, true); give('hammer');
    });
  });
  await until(() => isDone('library') && G.map.id === 'library' && G.locked === 0);
  const lm = G.maps.library.objs.find(o => o.id === 'lmeera');
  setHook('lmeera', 'Talk to Meera', async () => think("Meera: 'Benches, cobwebs, the poetry shelf, then the books. The newspapers are in that steel cupboard.'", 3000), true);
  setObj('Mission 11 — Clean the library', [['benches', 'Move the jumbled benches back into rows (0/3)'], ['cobwebs', 'Sweep away the cobwebs (0/4)'], ['shelf', 'Repair the broken poetry shelf'], ['books', 'Sort the books onto the right shelves (0/4)']]);
  await waitAll();
  S.libClean = true; take('broom'); take('hammer');
  await scene(async () => { lm.dir = G.player.x < lm.x ? 'left' : 'right'; await say('c4_mee7'); });
  setObj('Mission 11 — Search the library', [['papers', 'Search the newspaper cupboard for August 1996']]);
  await waitAll();

  // The newspapers
  await scene(async () => {
    letterbox(true); Music.set('tension');
    await moveTo(lm, G.player.x / T + 0.8, G.player.y / T + 0.1, 60); lm.dir = 'left';
    await fadeOut(700); letterbox(false); NEWS.step = 0; NEWS.t0 = performance.now(); G.cine = (c, w, h) => sceneNewspaper(c, w, h, (performance.now() - NEWS.t0) / 1000); await fadeIn(900);
    await sleep(1200); await say('c4_arj10');
    NEWS.step = 1; NEWS.t0 = performance.now(); await sleep(1400); await say('c4_mee8'); await say('c4_arj11');
    NEWS.step = 2; NEWS.t0 = performance.now(); await sleep(600); await say('c4_mee9'); await sleep(1600); await say('c4_arj12');
    await sleep(2600); await fadeOut(1400); endPainted(); letterbox(false); await fadeIn(900);
    await think('August 16, the mill burns with all its records. August 18, my father "steals" the money. And the man who reported it is the man who wants to buy our house.', 4600);
  });
  await fadeOut(2200); clearObj(); hud(false);
  return chapter5();
}
