// ===== Nammude Naadu — maps: Dubai flat, office, the ancestral house, Puzhakkara village =====
S.hooks = {};
function setHook(name, label, fn, keep = false) { S.hooks[name] = { label, fn, keep }; }
function clearHook(name) { delete S.hooks[name]; }
function hooked(name, extra = {}) {
  return Object.assign({
    label: () => S.hooks[name] && (typeof S.hooks[name].label === 'function' ? S.hooks[name].label() : S.hooks[name].label),
    when: () => !!S.hooks[name],
    act: async () => { const h = S.hooks[name]; if (!h) return; if (!h.keep) delete S.hooks[name]; await h.fn(); },
  }, extra);
}
const P = (x, y) => ({ x: x * T, y: y * T });
const near = (a, tx, ty, r) => Math.hypot(a.x - tx * T, a.y - ty * T) < r;

function grain(c, x, y, w, h, cols, n, sz = 2, seed = 1) {
  for (let i = 0; i < n; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(x + hash(i * 1.3 + seed) * w, y + hash(i * 7.7 + seed * 3) * h, sz, sz * 0.6); }
}
function planks(c, x, y, w, h, base, line, gap = 10) {
  c.fillStyle = base; c.fillRect(x, y, w, h);
  c.strokeStyle = line; c.lineWidth = 1;
  for (let yy = y; yy < y + h; yy += gap) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + w, yy); c.stroke(); const off = (yy / gap) % 2 ? 40 : 0; for (let xx = x + off; xx < x + w; xx += 80) { c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx, yy + gap); c.stroke(); } }
}
function skyline(c, x, y, w, h) {
  const hr = G.time;
  const sky = c.createLinearGradient(0, y, 0, y + h);
  if (hr > 18.5 || hr < 5.5) { sky.addColorStop(0, '#0d1330'); sky.addColorStop(1, '#2a2a55'); }
  else if (hr > 16.5) { sky.addColorStop(0, '#3b3f78'); sky.addColorStop(1, '#f08a55'); }
  else { sky.addColorStop(0, '#8ec3ea'); sky.addColorStop(1, '#f2e6cf'); }
  c.fillStyle = sky; c.fillRect(x, y, w, h);
  const night = hr > 18.5 || hr < 5.5;
  for (let i = 0; i < 18; i++) {
    const bw = 8 + hash(i) * 14, bh = h * (0.35 + hash(i + 3) * 0.6), bx = x + (i / 18) * w;
    c.fillStyle = night ? '#141a2c' : '#8892a6'; c.fillRect(bx, y + h - bh, bw, bh);
    if (i === 9) { c.fillRect(bx + bw / 2 - 1.5, y + h - bh - 26, 3, 26); }
    if (night) { c.fillStyle = '#ffd98a'; for (let k = 0; k < 6; k++) if (hash(i * 9 + k) > 0.4) c.fillRect(bx + 2 + hash(k + i) * (bw - 4), y + h - bh + 3 + k * (bh / 7), 1.5, 1.5); }
  }
  c.strokeStyle = '#d8dde4'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
  for (let xx = x + w / 3; xx < x + w; xx += w / 3) { c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + h); c.stroke(); }
}

// ======================= DUBAI FLAT =======================
defMap('flat', {
  w: 16, h: 10, bg: '#0b0d12',
  indoorDark: () => (G.time > 19 ? 0.35 : 0.05),
  lights: () => G.time > 19 ? [{ x: 8 * T, y: 4 * T, r: 220, a: 0.75, warm: true }, ...(S.phoneGlow ? [{ x: 5.1 * T, y: 1.6 * T, r: 40, a: 1 }] : [])] : [],
  solids: [[0, 0, 16, 1.2]],
  paint(c) {
    planks(c, 0, 0, 16 * T, 10 * T, '#cfc6b8', 'rgba(120,100,80,.25)', 12);
    c.fillStyle = '#e9e6e0'; c.fillRect(0, 0, 16 * T, 1.2 * T);
    c.fillStyle = '#bdb7ad'; c.fillRect(0, 1.2 * T - 3, 16 * T, 3);
    c.fillStyle = '#7a8796'; rr(c, 6 * T, 6.5 * T, 6 * T, 2.3 * T, 6); // rug
    c.fillStyle = '#8693a2'; rr(c, 6.2 * T, 6.7 * T, 5.6 * T, 1.9 * T, 5);
  },
  objs: [
    { x: 5.6, y: 0.05, w: 5.6, h: 1.05, draw: (c, o) => skyline(c, o.x, o.y, o.w, o.h) },
    { x: 1, y: 1.2, w: 3.4, h: 3, solid: true, draw(c, o) { c.fillStyle = '#3b3a40'; rr(c, o.x - 3, o.y - 3, o.w + 6, o.h + 6, 4); c.fillStyle = '#f4f4f2'; rr(c, o.x, o.y, o.w, o.h, 4); c.fillStyle = '#9aa7b8'; rr(c, o.x, o.y + o.h * 0.42, o.w, o.h * 0.58, 4); c.fillStyle = '#fff'; rr(c, o.x + 8, o.y + 6, o.w - 16, 22, 6); } },
    hooked('phone', { x: 4.6, y: 1.25, w: 1, h: 0.9, solid: true, draw(c, o) { c.fillStyle = '#5b4636'; rr(c, o.x, o.y, o.w, o.h, 3); const ring = S.phoneGlow && Math.sin(G.t * 16) > 0; c.fillStyle = '#111'; rr(c, o.x + 9, o.y + 7, 10, 16, 2); c.fillStyle = ring ? '#8fd0ff' : '#223'; rr(c, o.x + 10, o.y + 8, 8, 13, 1.5); if (ring) { c.strokeStyle = 'rgba(140,210,255,.7)'; c.lineWidth = 1; c.beginPath(); c.arc(o.x + 14, o.y + 15, 14 + Math.sin(G.t * 8) * 2, 0, 6.28); c.stroke(); } } }),
    hooked('photo', { x: 5.75, y: 1.25, w: 0.8, h: 0.8, solid: true, draw(c, o) { c.fillStyle = '#5b4636'; rr(c, o.x, o.y, o.w, o.h, 3); c.fillStyle = '#6b4a2e'; c.fillRect(o.x + 5, o.y - 6, 16, 18); c.fillStyle = '#d9c9a5'; c.fillRect(o.x + 7, o.y - 4, 12, 14); c.fillStyle = '#8a6a4a'; circle(c, o.x + 10.5, o.y + 1, 2.4); circle(c, o.x + 15.5, o.y + 1, 2.4); } }),
    hooked('table', { x: 8, y: 4.6, w: 2.6, h: 1.4, solid: true, draw(c, o) { c.fillStyle = '#e6e2dc'; rr(c, o.x, o.y, o.w, o.h, 4); c.fillStyle = '#c9c3ba'; c.fillRect(o.x, o.y + o.h - 4, o.w, 4); if (!S.boxesCleared) { c.fillStyle = '#d14a34'; rr(c, o.x + 8, o.y + 8, 18, 12, 2); c.fillStyle = '#f0f0ee'; rr(c, o.x + 30, o.y + 10, 16, 14, 2); c.fillStyle = '#c6a76e'; rr(c, o.x + 52, o.y + 6, 14, 12, 2); c.fillStyle = '#4b8fd0'; rr(c, o.x + 70, o.y + 20, 5, 12, 2); } } }),
    hooked('wardrobe', { x: 12, y: 1.15, w: 3, h: 1.1, solid: true, draw(c, o) { c.fillStyle = '#8a6f55'; rr(c, o.x, o.y - 10, o.w, o.h + 10, 2); c.fillStyle = '#6f5843'; c.fillRect(o.x + o.w / 2 - 1, o.y - 8, 2, o.h + 6); c.fillStyle = '#c9b18c'; c.fillRect(o.x + o.w / 2 - 6, o.y + 8, 3, 8); c.fillRect(o.x + o.w / 2 + 3, o.y + 8, 3, 8); } }),
    { x: 12.4, y: 5.6, w: 3.2, h: 1.3, solid: true, draw(c, o) { c.fillStyle = '#4c5563'; rr(c, o.x, o.y - 6, o.w, o.h + 6, 6); c.fillStyle = '#5f6a7a'; rr(c, o.x + 4, o.y, o.w - 8, o.h - 6, 4); } },
    { x: 0.4, y: 7.6, w: 1, h: 1, solid: true, draw(c, o) { c.fillStyle = '#d8d2c6'; rr(c, o.x + 6, o.y + 14, 20, 16, 3); drawBush(c, o.x + 16, o.y + 16, '#4c8a3e', 12); } },
    hooked('door', { x: 7, y: 9.55, w: 1.6, h: 0.45, draw(c, o) { c.fillStyle = '#5a4535'; c.fillRect(o.x, o.y, o.w, o.h); c.fillStyle = '#c8a97a'; c.fillRect(o.x + o.w - 8, o.y + 4, 4, 4); } }),
  ],
});

// ======================= OFFICE =======================
const officeWorkers = [[11.2, 3.2, 'up'], [3.5, 7.2, 'up'], [13.8, 7.2, 'up'], [9, 7.2, 'up']];
defMap('office', {
  w: 18, h: 10, bg: '#0b0d12',
  indoorDark: () => 0.05,
  solids: [[0, 0, 18, 1.2]],
  paint(c) {
    c.fillStyle = '#5b6370'; c.fillRect(0, 0, 18 * T, 10 * T);
    grain(c, 0, 0, 18 * T, 10 * T, ['#535b67', '#646d7a'], 2500, 2);
    c.fillStyle = '#e6e8ec'; c.fillRect(0, 0, 18 * T, 1.2 * T);
  },
  objs: [
    { x: 0.5, y: 0.05, w: 17, h: 1.05, draw: (c, o) => skyline(c, o.x, o.y, o.w, o.h) },
    ...[[2, 3], [6.5, 3], [11, 3], [2, 6], [6.5, 6], [11, 6], [14.6, 6]].map(([x, y], i) => ({
      x, y, w: 3.2, h: 1.1, solid: true, ...(i === 0 ? hooked('desk') : {}),
      draw(c, o) { c.fillStyle = '#e9e6df'; rr(c, o.x, o.y, o.w, o.h, 3); c.fillStyle = '#2a2d33'; rr(c, o.x + o.w / 2 - 14, o.y + 2, 28, 18, 2); c.fillStyle = i === 0 && S.typing ? '#9fd3ff' : '#3c5370'; rr(c, o.x + o.w / 2 - 12, o.y + 4, 24, 13, 1); c.fillStyle = '#cfcac0'; rr(c, o.x + o.w / 2 - 10, o.y + 24, 20, 6, 1); },
    })),
    ...officeWorkers.map(([x, y, d], i) => ({ npc: true, x: x * T, y: y * T + 18, dir: d, draw: (c, o) => drawPerson(c, o.x, o.y, { skin: ['#b8805a', '#d6a27a', '#8a5a3c', '#c58e66'][i], hair: '#1a1410', shirt: ['#d77', '#7a9', '#99c', '#cb8'][i], lower: 'pants', lowerColor: '#333' }, 'up', 0, false, false, true) })),
    hooked('shibu', { npc: true, x: 9.2 * T, y: 4.9 * T, dir: 'left', voice: 'colleague', draw: npcDraw('shibu') }),
    { x: 15.5, y: 1.2, w: 1.2, h: 1, solid: true, draw(c, o) { drawBush(c, o.x + 18, o.y + 26, '#4c8a3e', 13); } },
    { x: 8, y: 9.55, w: 1.8, h: 0.45, draw(c, o) { c.fillStyle = '#8fa3b8'; c.fillRect(o.x, o.y, o.w, o.h); } },
  ],
});

// ======================= THE ANCESTRAL HOUSE (interior) =======================
const AMM_POS = { kitchen: [18.6, 2.9, 'down'], hall: [17.6, 14.2, 'left'], table: [16.1, 13.75, 'up'], none: null };
function setAmm(loc) {
  S.ammLoc = loc; const o = G.maps.house.objs.find(o => o.id === 'amm'); const p = AMM_POS[loc];
  if (p) { o.x = p[0] * T; o.y = p[1] * T; o.dir = p[2]; o.sitting = loc === 'table'; }
}
function houseLit() { return S.houseLights !== false; }
function bedDraw(made, colorA = '#3e6aa8') {
  return (c, o) => {
    c.fillStyle = '#5a3a22'; rr(c, o.x - 3, o.y - 3, o.w + 6, o.h + 6, 3);
    c.fillStyle = '#e8e2d2'; rr(c, o.x, o.y, o.w, o.h, 3);
    if (made()) { c.fillStyle = colorA; rr(c, o.x + 2, o.y + o.h * 0.3, o.w - 4, o.h * 0.7 - 2, 3); c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 6; i++) circle(c, o.x + 12 + i * 15, o.y + o.h * 0.6, 3); }
    else { c.fillStyle = 'rgba(120,100,70,.25)'; for (let i = 0; i < 5; i++) circle(c, o.x + 15 + i * 17, o.y + 40 + hash(i) * 30, 5); }
    c.fillStyle = '#fffaf0'; rr(c, o.x + 8, o.y + 5, o.w - 16, 16, 6);
  };
}
function cupboardDraw(c, o) { c.fillStyle = '#6b4428'; rr(c, o.x, o.y - 14, o.w, o.h + 14, 2); c.fillStyle = '#7d5232'; c.fillRect(o.x + 3, o.y - 11, o.w / 2 - 4, o.h + 8); c.fillRect(o.x + o.w / 2 + 1, o.y - 11, o.w / 2 - 4, o.h + 8); c.fillStyle = '#d8b56a'; c.fillRect(o.x + o.w / 2 - 4, o.y + 4, 2, 6); c.fillRect(o.x + o.w / 2 + 2, o.y + 4, 2, 6); }
function bulbDraw(key) { return (c, o) => { const cxp = o.x + o.w / 2, cyp = o.y + o.h / 2; c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath(); c.moveTo(cxp, cyp - 14); c.lineTo(cxp, cyp - 3); c.stroke(); const on = key() && houseLit() && darkness() > 0.05; c.fillStyle = on ? '#fff3c4' : key() ? '#efe6c8' : '#5a564c'; circle(c, cxp, cyp, 4); }; }
const memObj = (id, x, y, draw) => ({ id: 'mem_' + id, x, y, w: 0.7, h: 0.8, reach: 4, draw, label: () => 'Look', when: () => S.memOn && !S['m_' + id], act: async () => { S['m_' + id] = true; S.mems = (S.mems || 0) + 1; renderObj(); await say('mem_' + id); } });

defMap('house', {
  w: 24, h: 16, bg: '#120d09',
  indoorDark: () => (houseLit() ? 0.28 : 0.9),
  lights: () => {
    if (!houseLit()) return [];
    const L = [{ x: 12 * T, y: 4.5 * T, r: 150 }, { x: 8 * T, y: 13 * T, r: 170 }, { x: 18 * T, y: 13 * T, r: 170 }, { x: 20 * T, y: 3.5 * T, r: 150 }, { x: 22 * T, y: 8.5 * T, r: 80 }];
    if (S.bulbFixed) L.push({ x: 4 * T, y: 4.2 * T, r: 150 });
    return L.map(l => Object.assign(l, { a: 0.85, warm: true }));
  },
  solids: [[0, 0, 24, 0.9], [0, 9.85, 3.4, 0.35], [5.1, 9.85, 6.3, 0.35], [13.1, 9.85, 3.8, 0.35], [19, 9.85, 2.4, 0.35], [23.1, 9.85, 0.9, 0.35], [7.85, 0, 0.3, 9.85], [15.85, 0, 0.3, 9.85], [16, 6.85, 1, 0.3], [19, 6.85, 5, 0.3], [19.85, 7, 0.3, 2.85]],
  paint(c) {
    // red-oxide floor
    c.fillStyle = '#93382a'; c.fillRect(0, 0, 24 * T, 16 * T);
    const g = c.createLinearGradient(0, 0, 24 * T, 16 * T); g.addColorStop(0, 'rgba(255,255,255,.06)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.05)');
    c.fillStyle = g; c.fillRect(0, 0, 24 * T, 16 * T);
    grain(c, 0, 0, 24 * T, 16 * T, ['rgba(0,0,0,.08)', 'rgba(255,255,255,.05)'], 1800, 3);
    c.fillStyle = '#a7a39a'; c.fillRect(16.2 * T, 0.9 * T, 7.8 * T, 5.95 * T); // kitchen floor
    grain(c, 16.2 * T, 0.9 * T, 7.8 * T, 5.95 * T, ['rgba(0,0,0,.08)'], 400, 3);
    c.fillStyle = '#7d9aa6'; c.fillRect(20.2 * T, 7.15 * T, 3.8 * T, 2.7 * T); // bathroom tiles
    c.strokeStyle = 'rgba(255,255,255,.2)'; for (let x = 20.2 * T; x < 24 * T; x += 12) { c.beginPath(); c.moveTo(x, 7.15 * T); c.lineTo(x, 9.85 * T); c.stroke(); } for (let y = 7.15 * T; y < 9.85 * T; y += 12) { c.beginPath(); c.moveTo(20.2 * T, y); c.lineTo(24 * T, y); c.stroke(); }
    // walls
    c.fillStyle = '#efe3c8'; c.fillRect(0, 0, 24 * T, 0.9 * T);
    c.fillStyle = '#5a3a22'; c.fillRect(0, 0.9 * T - 4, 24 * T, 4);
    c.fillStyle = '#d9c9a6';
    for (const [x, y, w, h] of G.maps.house.solids.slice(1)) c.fillRect(x * T, y * T, w * T, h * T);
    c.fillStyle = 'rgba(0,0,0,.18)';
    for (const [x, y, w, h] of G.maps.house.solids.slice(1)) c.fillRect(x * T, (y + h) * T, w * T, 3);
    // charupady bench & mat in hall
    c.fillStyle = '#c9a86a'; rr(c, 3 * T, 12.5 * T, 3.5 * T, 2 * T, 4); c.fillStyle = '#b8955a'; for (let i = 0; i < 9; i++) c.fillRect(3 * T + 4, 12.5 * T + 6 + i * 6, 3.5 * T - 8, 1);
    c.font = `600 10px ${ML_FONT}`; c.fillStyle = 'rgba(255,240,210,.25)'; c.textAlign = 'center';
    c.fillText('അർജുന്റെ മുറി', 4 * T, 9.5 * T); c.fillText('അപ്പച്ചന്റെ മുറി', 12 * T, 9.5 * T); c.fillText('അടുക്കള', 20 * T, 6.5 * T);
  },
  objs: [
    // ---------- Arjun's room ----------
    { id: 'abed', x: 0.5, y: 1.1, w: 3, h: 2.6, solid: true, draw: bedDraw(() => S.bedMade),
      label: () => active('bedsheet') && has('bedsheet') ? 'Spread the bedsheet' : S.hooks.sleep ? S.hooks.sleep.label : 'Bed',
      when: () => (active('bedsheet') && has('bedsheet')) || !!S.hooks.sleep,
      act: async () => {
        if (active('bedsheet') && has('bedsheet')) { await hold('Spreading the bedsheet', 1200); take('bedsheet'); S.bedMade = true; done('bedsheet'); return; }
        const h = S.hooks.sleep; if (h) { delete S.hooks.sleep; await h.fn(); }
      } },
    ...[3.75, 5.15].map((x, i) => ({ x, y: 0.05, w: 1.1, h: 0.85, reach: 10, draw: (c, o) => { woodWindow(c, o.x + 4, o.y + 3, o.w - 8, o.h - 8, S['win' + i]); if (S['win' + i]) { c.fillStyle = '#4b2e1c'; c.fillRect(o.x - 6, o.y + 3, 8, o.h - 8); c.fillRect(o.x + o.w - 2, o.y + 3, 8, o.h - 8); c.fillStyle = 'rgba(255,220,150,.10)'; c.beginPath(); c.moveTo(o.x + 4, o.y + o.h); c.lineTo(o.x + o.w - 4, o.y + o.h); c.lineTo(o.x + o.w + 20, o.y + o.h + 70); c.lineTo(o.x - 16, o.y + o.h + 70); c.fill(); } },
      label: 'Open the window', when: () => active('windows') && !S['win' + i],
      act: async () => { AudioSys.sfx.knock(); S['win' + i] = true; if (S.win0 && S.win1) done('windows'); else toast('One more window.'); } })),
    { x: 6.3, y: 1, w: 1.4, h: 1, solid: true, draw: cupboardDraw, label: 'Search the cupboard', when: () => active('bedsheet') && !has('bedsheet') && !S.bedMade,
      act: async () => { give('bedsheet'); await think('An old bedsheet with blue flowers. Ammachi must have washed and kept it for whenever I came back.'); } },
    { x: 5, y: 7.6, w: 1.3, h: 0.9, solid: true, visible: () => !S.unpacked, draw(c, o) { c.fillStyle = '#26303d'; rr(c, o.x, o.y, o.w, o.h, 4); c.fillStyle = '#3a4757'; rr(c, o.x + 3, o.y + 3, o.w - 6, o.h - 6, 3); c.fillStyle = '#999'; c.fillRect(o.x + o.w / 2 - 6, o.y - 2, 12, 3); },
      label: 'Unpack the suitcase', when: () => active('unpack'),
      act: async () => { await hold('Unpacking', 1600, AudioSys.sfx.rustle); S.unpacked = true; G.player.outfit = 'mundu'; done('unpack'); await think('Shirts on the shelf, the gifts for Ammachi on the table... and a mundu. It feels strange, and right.'); } },
    ...[[2.2, 5.2], [5.4, 4.6], [3.4, 7.7]].map(([x, y], i) => ({ x, y, w: 1.3, h: 0.8, visible: () => !S['dust' + i] && !!S.memOn, draw(c, o) { c.fillStyle = 'rgba(110,90,60,.45)'; for (let k = 0; k < 9; k++) ellipse(c, o.x + hash(k + i * 9) * o.w, o.y + hash(k * 3 + i) * o.h, 6, 3); c.fillStyle = 'rgba(200,190,170,.5)'; for (let k = 0; k < 5; k++) ellipse(c, o.x + hash(k * 5 + i) * o.w, o.y + hash(k * 2 + i) * o.h, 4, 1.5); },
      label: 'Sweep the dust', when: () => active('sweep'),
      act: async () => { if (!has('broom')) { await think('I need a broom. Ammachi always keeps the choolu by the door in the hall.'); return; } await hold('Sweeping', 1100, AudioSys.sfx.sweep); S['dust' + i] = true; const n = [0, 1, 2].filter(k => S['dust' + k]).length; setObjText('sweep', `Sweep the bedroom floor (${n}/3)`); if (n === 3) { done('sweep'); S.swept = true; take('broom'); } } })),
    { x: 3.6, y: 3.8, w: 0.8, h: 0.8, draw: bulbDraw(() => S.bulbFixed), reach: 6, label: 'Replace the fused bulb', when: () => active('bulb'),
      act: async () => { if (!has('bulb')) { await think('The bulb is fused. There were always spares in the almirah in the hall.'); return; } await hold('Changing the bulb', 1200); take('bulb'); S.bulbFixed = true; done('bulb'); AudioSys.sfx.blip(); } },
    memObj('toy', 0.1, 5.0, (c, o) => { c.fillStyle = '#6b4428'; c.fillRect(o.x, o.y, 8, 76); c.fillStyle = '#c8402e'; c.beginPath(); c.moveTo(o.x + 4, o.y + 6); c.lineTo(o.x + 10, o.y + 12); c.lineTo(o.x + 4, o.y + 20); c.lineTo(o.x - 2, o.y + 12); c.fill(); }),
    memObj('photo', 0.1, 6.2, (c, o) => { c.fillStyle = '#4a3020'; c.fillRect(o.x + 1, o.y + 4, 9, 14); c.fillStyle = '#d9c9a5'; c.fillRect(o.x + 2.5, o.y + 6, 6, 10); }),
    memObj('trophy', 0.1, 7.4, (c, o) => { c.fillStyle = '#e0b84a'; rr(c, o.x + 1, o.y + 4, 8, 7, 2); c.fillRect(o.x + 4, o.y + 11, 2, 5); c.fillRect(o.x + 1.5, o.y + 16, 7, 3); }),
    // ---------- Appachan's room ----------
    { id: 'pbed', x: 9, y: 1.1, w: 3, h: 2.6, solid: true, draw: bedDraw(() => true, '#e9e1cf'), ...hooked('appaBed') },
    { x: 14.3, y: 1, w: 1.4, h: 1, solid: true, draw: cupboardDraw, label: () => S.hooks.cupboard ? S.hooks.cupboard.label : "Appachan's cupboard",
      act: async () => { const h = S.hooks.cupboard; if (h) { if (!h.keep) delete S.hooks.cupboard; await h.fn(); return; } if (!S.sawShirts) { S.sawShirts = true; await think("Appachan's shirts, folded the way he always folded them. They still smell of him.", 3400); } else await think('Shirts, a torch-shaped gap on the shelf, some old receipts.'); } },
    { x: 12.4, y: 0.05, w: 1.2, h: 0.85, draw(c, o) { c.fillStyle = '#3a2618'; c.fillRect(o.x + 6, o.y + 2, o.w - 12, o.h - 6); c.fillStyle = '#cfc2a2'; c.fillRect(o.x + 9, o.y + 5, o.w - 18, o.h - 12); drawPerson(c, o.x + o.w / 2, o.y + o.h - 1, LOOKS.appachan, 'down'); c.strokeStyle = '#f3a3c8'; c.lineWidth = 2; c.beginPath(); c.arc(o.x + o.w / 2, o.y + 6, 13, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); c.strokeStyle = '#fff'; c.setLineDash([2, 2]); c.stroke(); c.setLineDash([]); }, label: "Appachan's photograph", reach: 12,
      act: async () => { await think(S.night ? 'His photo with a fresh garland. Ammachi must change it every morning.' : 'Mathachan. Appachan. The garland is fresh. Ammachi changes it every morning.', 3200); } },
    { x: 12.6, y: 6.3, w: 1, h: 0.9, solid: true, draw(c, o) { c.fillStyle = '#6b4428'; rr(c, o.x, o.y, o.w, o.h, 3); c.fillStyle = '#7d5232'; rr(c, o.x + 3, o.y - 8, o.w - 6, 10, 2); } },
    { x: 9.2, y: 4, w: 1.6, h: 0.9, visible: () => !!S.boxFound, draw(c, o) { c.fillStyle = '#5b3a20'; rr(c, o.x, o.y, o.w, o.h, 3); c.fillStyle = '#3f2814'; c.fillRect(o.x, o.y + 8, o.w, 3); c.fillStyle = '#c9a24a'; c.fillRect(o.x + o.w / 2 - 3, o.y + 6, 6, 8); } },
    // ---------- Kitchen ----------
    { x: 16.6, y: 1, w: 3.2, h: 1.1, solid: true, ...hooked('hearth'), draw(c, o) { c.fillStyle = '#7a3a28'; rr(c, o.x, o.y - 10, o.w, o.h + 10, 4); c.fillStyle = '#5a2a1c'; for (let i = 0; i < 2; i++) { circle(c, o.x + 24 + i * 46, o.y + 6, 12); } const fl = 0.6 + Math.sin(G.t * 12) * 0.2; c.fillStyle = `rgba(255,140,40,${fl})`; circle(c, o.x + 24, o.y + 6, 7); c.fillStyle = '#2e2a28'; circle(c, o.x + 70, o.y + 4, 11); c.fillStyle = '#4a3c30'; circle(c, o.x + 24, o.y + 2, 10); } },
    { x: 21, y: 0.9, w: 2.8, h: 0.6, solid: true, draw(c, o) { c.fillStyle = '#6b4428'; c.fillRect(o.x, o.y, o.w, o.h); ['#c9b07a', '#8d5a2c', '#d8d0c0', '#a23a2a', '#e2c35a'].forEach((col, i) => { c.fillStyle = col; rr(c, o.x + 4 + i * 16, o.y - 10, 12, 16, 3); }); } },
    { x: 22.2, y: 4, w: 1.1, h: 0.8, solid: true, ...hooked('grate'), draw(c, o) { c.fillStyle = '#6b4428'; rr(c, o.x, o.y + 6, o.w, o.h - 6, 2); c.fillStyle = '#999'; c.beginPath(); c.arc(o.x + 6, o.y + 6, 5, Math.PI, 0); c.fill(); if (S.grating) { c.fillStyle = '#fff'; for (let i = 0; i < 8; i++) circle(c, o.x + 4 + hash(i + G.t) * 12, o.y + 18 + hash(i) * 6, 1.2); } } },
    { x: 23, y: 5.4, w: 0.8, h: 0.9, solid: true, draw(c, o) { c.fillStyle = '#9a5a36'; circle(c, o.x + 12, o.y + 16, 11); c.fillStyle = '#7a4226'; circle(c, o.x + 12, o.y + 12, 6); } },
    // Ammachi (position set by setAmm)
    Object.assign(hooked('amm'), { id: 'amm', npc: true, x: 18.6 * T, y: 2.9 * T, dir: 'down', voice: 'ammachi', visible: () => S.ammLoc && S.ammLoc !== 'none', draw: npcDraw('ammachi') }),
    { id: 'rag', npc: true, x: 12.3 * T, y: 15.4 * T, dir: 'up', voice: 'raghavan', visible: () => !!S.ragOn, draw: npcDraw('raghavan') },
    // ---------- Bathroom ----------
    { x: 21.6, y: 7.5, w: 1.6, h: 0.9, draw(c, o) { c.fillStyle = '#2f68b8'; ellipse(c, o.x + 14, o.y + 18, 10, 6); c.fillStyle = '#244f8c'; ellipse(c, o.x + 14, o.y + 16, 8, 4); c.fillStyle = '#e04a4a'; rr(c, o.x + 32, o.y + 10, 8, 10, 2); c.fillStyle = '#bbb'; c.fillRect(o.x + 20, o.y - 2, 3, 10); },
      label: 'Bathroom', when: () => active('bathroom'), act: async () => { done('bathroom'); await think('Same blue bucket. Same red mug. Some things never change.'); } },
    // ---------- Hall ----------
    { x: 13.6, y: 11.4, w: 3.4, h: 1.6, solid: true, ...hooked('table'), draw(c, o) { c.fillStyle = '#5a3a22'; rr(c, o.x, o.y, o.w, o.h, 3); c.fillStyle = '#6e482a'; rr(c, o.x + 3, o.y + 3, o.w - 6, o.h - 6, 2); if (S.photoOnTable) { c.fillStyle = '#f2ead8'; c.save(); c.translate(o.x + 60, o.y + 22); c.rotate(-0.2); c.fillRect(-9, -7, 18, 14); c.fillStyle = '#8a7a60'; c.fillRect(-7, -5, 14, 8); c.restore(); }
      if (S.mealOnTable) { c.fillStyle = '#eee'; circle(c, o.x + 24, o.y + 24, 9); circle(c, o.x + 84, o.y + 26, 9); c.fillStyle = '#c8402e'; circle(c, o.x + 54, o.y + 24, 8); c.fillStyle = '#e8d6b8'; circle(c, o.x + 24, o.y + 24, 6); circle(c, o.x + 84, o.y + 26, 6); } } },
    { x: 7, y: 10.3, w: 1.4, h: 0.9, solid: true, draw: (c, o) => { c.fillStyle = '#8a8f96'; rr(c, o.x, o.y - 10, o.w, o.h + 10, 2); c.fillStyle = '#9da3ab'; c.fillRect(o.x + 3, o.y - 7, o.w - 6, o.h + 4); c.fillStyle = '#555'; c.fillRect(o.x + o.w / 2 - 1, o.y, 2, 8); },
      label: 'Open the almirah', when: () => (active('bulb') && !has('bulb') && !S.bulbFixed) || !S.almirahSeen,
      act: async () => { if (active('bulb') && !has('bulb') && !S.bulbFixed) { give('bulb'); return; } S.almirahSeen = true; await think("Old newspapers, a 2009 calendar, and Appachan's reading glasses folded on top."); } },
    { x: 0.5, y: 10.3, w: 0.7, h: 0.9, visible: () => !has('broom') && !S.swept, draw(c, o) { c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(o.x + 10, o.y); c.lineTo(o.x + 12, o.y + 18); c.stroke(); c.fillStyle = '#c9b070'; c.beginPath(); c.moveTo(o.x + 6, o.y + 16); c.lineTo(o.x + 18, o.y + 16); c.lineTo(o.x + 20, o.y + 28); c.lineTo(o.x + 4, o.y + 28); c.fill(); },
      label: 'Take the broom (choolu)', act: async () => give('broom') },
    memObj('stick', 10.5, 14.6, (c, o) => { c.strokeStyle = '#4a2e18'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(o.x + 6, o.y + 2); c.lineTo(o.x + 12, o.y + 26); c.stroke(); c.beginPath(); c.arc(o.x + 3, o.y + 3, 4, 0, Math.PI); c.stroke(); }),
    { x: 20.4, y: 10.3, w: 1.6, h: 0.9, solid: true, draw(c, o) { c.fillStyle = '#6b4428'; rr(c, o.x, o.y, o.w, o.h, 2); c.fillStyle = '#2a2a2a'; rr(c, o.x + 8, o.y - 14, 34, 24, 3); c.fillStyle = '#3d4a4a'; rr(c, o.x + 11, o.y - 11, 26, 17, 2); } },
    { x: 11.4, y: 15.6, w: 1.8, h: 0.4, draw(c, o) { c.fillStyle = '#5a3a22'; c.fillRect(o.x, o.y, o.w, o.h); c.fillStyle = '#d8b56a'; c.fillRect(o.x + o.w / 2 - 1, o.y + 2, 2, 6); }, ...hooked('frontDoor', { label: () => S.hooks.frontDoor ? S.hooks.frontDoor.label : 'Go outside', when: () => true,
      act: async () => { const h = S.hooks.frontDoor; if (h) { if (!h.keep) delete S.hooks.frontDoor; await h.fn(); return; } await goto('village', 22, 24.9, 'down'); } }) },
  ],
});

// ======================= PUZHAKKARA VILLAGE =======================
const PALMS = [[12.8, 27, 14, 1], [14.6, 33.4, -10, 2], [27.6, 34.2, 12, 3], [32.4, 29.4, -8, 4], [12.8, 23.6, 10, 5], [38.6, 10, 10, 6], [38.4, 16.5, -12, 7], [39.6, 22.5, 8, 8], [58.6, 10.4, -10, 9], [59.4, 18.6, 12, 10], [60.4, 30, -6, 11], [59.4, 36.6, 10, 12], [43.8, 29.2, 9, 13], [55.2, 30.4, -9, 14], [33.2, 9.6, 8, 15], [9.4, 9, -10, 16], [5, 26.8, 10, 17], [47, 40, -12, 18], [40.5, 46, 8, 19], [26, 48.6, -10, 20], [20, 46, 11, 21], [11, 48, -9, 22], [53, 46.5, 10, 23], [66, 3, -10, 24], [70, 9, 9, 25]];
const BANANAS = [[2.5, 31], [5, 30.6], [7.6, 31.2], [2.4, 33.8], [5.1, 33.4], [7.8, 34], [2.6, 36.6], [5.2, 36.2], [7.5, 36.8], [2.5, 39.2], [5, 39], [7.7, 39.4]];
const SOIL = [[2.8, 42], [5.6, 42.8], [8.2, 41.8]];
const FARM_WEEDS = [[13.8, 39], [14.6, 43.8], [23.6, 38.3], [29.2, 41], [30.6, 43.8], [19.4, 44.6]];
const FARM_BRANCHES = [[13.4, 41.4], [21.4, 44.9], [27.8, 44.6], [31.4, 42]];
const FARM_FENCE = [[11.6, 40, 0.8, 2, true], [24, 45.2, 2, 0.8, false], [32.6, 39, 0.8, 2, true]];
const FARM_BEDS = [17.2, 19.4, 21.6, 23.8, 26.0];
const CROP_INFO = [
  { crop: 'cheera', name: 'cheera', needs: ['seed_cheera'] },
  { crop: 'chilli', name: 'green chilli', needs: ['seed_chilli', 'compost'] },
  { crop: 'tomato', name: 'tomato', needs: ['seed_tomato', 'stake'] },
  { crop: 'tapioca', name: 'tapioca (kappa)', needs: ['cutting'] },
  { crop: 'banana', name: 'banana', needs: ['sapling', 'compost'] },
];
function fenceSegs() { return [[10, 12, 24, 0], [10, 36, 11, 0], [23, 36, 11, 0], [10, 12, 0, 18], [10, 32, 0, 4], [34, 12, 0, 12], [34, 26, 0, 10]]; }

defMap('village', {
  w: 72, h: 54, outdoor: true, bg: '#2c4a22',
  lights: () => {
    const L = [];
    const night = darkness() > 0.2;
    if (!night) return L;
    for (const x of [36, 46, 56, 25]) L.push({ x: x * T, y: 7.6 * T, r: 120, a: 0.85, warm: true });
    L.push({ x: 36.4 * T, y: 24 * T, r: 100, a: 0.75, warm: true });
    if (houseLit()) { for (const x of [17.6, 26.2]) L.push({ x: x * T, y: 23.4 * T, r: 60, a: 0.6, warm: true }); }
    if (S.verandaLight) L.push({ x: 22 * T, y: 24 * T, r: 150, a: 0.95, warm: true });
    if (G.time < 21) for (const x of [41, 49]) L.push({ x: x * T, y: 4.4 * T, r: 110, a: 0.8, warm: true });
    L.push({ x: 54.6 * T, y: 26.4 * T, r: 60, a: 0.6, warm: true });
    return L;
  },
  solids: [
    // buildings (lower part)
    [3, 2, 5, 2], [24, 1.9, 9, 2.3], [38, 2, 6, 2], [46, 2, 6, 2], [52.6, 2, 5, 2], [30.2, 37.6, 2.4, 1.2], [58.2, 2.4, 4.6, 1],
    [16, 16, 12, 7.3], [16.3, 23.4, 0.4, 0.9], [27.3, 23.4, 0.4, 0.9],
    [12, 13.5, 4, 2.2], [11.6, 18.5, 2, 1.8], [29.4, 13.6, 3.4, 2.2],
    [52, 23.5, 5.5, 2.3],
    // water
    [62, 7, 10, 47], [44.6, 30.4, 9, 7.4],
    // fence
    ...fenceSegs().map(([x, y, w, h]) => w ? [x, y - 0.1, w, 0.25] : [x - 0.12, y, 0.25, h]),
  ],
  paint(c) {
    const W = 72 * T, H = 54 * T;
    c.fillStyle = '#5c8c3c'; c.fillRect(0, 0, W, H);
    grain(c, 0, 0, W, H, ['#527f35', '#679a45', '#4d7a31', '#73a24c'], 26000, 3, 2);
    // paddy fields
    const paddy = (x, y, w, h) => { c.fillStyle = '#86b84a'; c.fillRect(x * T, y * T, w * T, h * T); c.fillStyle = 'rgba(80,140,150,.18)'; c.fillRect(x * T, y * T, w * T, h * T); c.strokeStyle = '#6ea23d'; c.lineWidth = 1.2; for (let yy = y * T + 3; yy < (y + h) * T; yy += 5) { c.beginPath(); for (let xx = x * T; xx < (x + w) * T; xx += 4) { c.moveTo(xx, yy); c.lineTo(xx + 1, yy - 3); } c.stroke(); } c.fillStyle = '#7d8a4a'; for (let xx = x; xx <= x + w; xx += 5) c.fillRect(xx * T - 3, y * T, 6, h * T); for (let yy = y; yy <= y + h; yy += 5) c.fillRect(x * T, yy * T - 3, w * T, 6); };
    paddy(0, 8, 9.5, 19); paddy(38.5, 8, 19.5, 12);
    // football ground
    c.fillStyle = '#b59a68'; c.fillRect(9.5 * T, 0.4 * T, 13 * T, 3.9 * T); grain(c, 9.5 * T, 0.4 * T, 13 * T, 3.9 * T, ['#a88d5c', '#c2a876'], 900, 3);
    c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.strokeRect(10 * T, 0.7 * T, 12 * T, 3.3 * T); c.beginPath(); c.moveTo(16 * T, 0.7 * T); c.lineTo(16 * T, 4 * T); c.stroke();
    c.strokeStyle = '#eee'; c.lineWidth = 3; c.strokeRect(9.7 * T, 1.7 * T, 0.5 * T, 1.3 * T); c.strokeRect(21.8 * T, 1.7 * T, 0.5 * T, 1.3 * T);
    // tar road
    c.fillStyle = '#3c3e41'; c.fillRect(0, 4.6 * T, W, 2.4 * T); grain(c, 0, 4.6 * T, W, 2.4 * T, ['#45474a', '#333538'], 3000, 2);
    c.fillStyle = '#e9e6da'; c.fillRect(0, 4.7 * T, W, 2); c.fillRect(0, 6.9 * T - 2, W, 2); for (let x = 0; x < W; x += 40) c.fillRect(x, 5.8 * T - 1, 20, 2);
    // laterite lanes
    const lane = (x, y, w, h) => { c.fillStyle = '#b5653f'; c.fillRect(x * T, y * T, w * T, h * T); grain(c, x * T, y * T, w * T, h * T, ['#a3583a', '#c37450', '#8f4a2f'], w * h * 16, 3, x + y); };
    lane(35, 7, 2, 37); lane(34, 24, 1.2, 2); lane(37, 42, 23, 2); lane(48, 28, 2, 1.2);
    // compound
    c.fillStyle = 'rgba(120,150,60,.25)'; c.fillRect(10 * T, 12 * T, 24 * T, 24 * T);
    c.fillStyle = '#cdb184'; c.beginPath(); c.ellipse(22 * T, 26.6 * T, 9 * T, 3.2 * T, 0, 0, 6.28); c.fill();
    c.fillRect(22 * T, 24.2 * T, 12 * T, 1.6 * T);
    grain(c, 13 * T, 23.4 * T, 21 * T, 6.4 * T, ['#c0a374', '#d9bf94'], 2200, 2, 5);
    c.strokeStyle = 'rgba(150,120,80,.35)'; c.lineWidth = 1; for (let i = 0; i < 40; i++) { const a = hash(i) * 6.28, r = hash(i + 4) * 7 * T; c.beginPath(); c.arc(22 * T + Math.cos(a) * r, 26.6 * T + Math.sin(a) * r * 0.35, 12, a, a + 0.8); c.stroke(); }
    // Appachan's farm (south of the compound)
    c.fillStyle = '#7d7444'; c.fillRect(12 * T, 37.2 * T, 21 * T, 8.4 * T);
    grain(c, 12 * T, 37.2 * T, 21 * T, 8.4 * T, ['#6f6a3a', '#8a7c4a', '#5f7a35', '#6c8a3c'], 5000, 3, 9);
    c.fillStyle = '#c9ad80'; c.fillRect(21.2 * T, 29.5 * T, 1.6 * T, 8 * T); grain(c, 21.2 * T, 29.5 * T, 1.6 * T, 8 * T, ['#b89c70', '#d6bc90'], 300, 2, 3);
    c.strokeStyle = '#7a5b3a'; c.lineWidth = 2; c.fillStyle = '#6a4d30';
    const farmPosts = (x0, y0, x1, y1, skip) => { const n = Math.round(Math.hypot(x1 - x0, y1 - y0) * 2); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; if (skip(x, y)) continue; c.fillRect(x * T - 1.5, y * T - 9, 3, 10); if (i < n && !skip(x0 + (x1 - x0) * (i + 1) / n, y0 + (y1 - y0) * (i + 1) / n)) { c.beginPath(); c.moveTo(x * T, y * T - 5); c.lineTo((x0 + (x1 - x0) * (i + 1) / n) * T, (y0 + (y1 - y0) * (i + 1) / n) * T - 5); c.stroke(); } } };
    farmPosts(12, 37.2, 33, 37.2, x => x > 20.9 && x < 23.1);
    farmPosts(12, 45.6, 33, 45.6, x => x > 23.9 && x < 26.1);
    farmPosts(12, 37.2, 12, 45.6, (x, y) => y > 39.9 && y < 42.1);
    farmPosts(33, 37.2, 33, 45.6, (x, y) => y > 38.9 && y < 41.1);
    // sand banks + river
    c.fillStyle = '#d7c08c'; c.fillRect(60 * T, 7 * T, 2.2 * T, 47 * T); grain(c, 60 * T, 7 * T, 2.2 * T, 47 * T, ['#c9b07c', '#e3cfa0'], 1500, 2);
    const rg = c.createLinearGradient(62 * T, 0, 72 * T, 0); rg.addColorStop(0, '#3e8186'); rg.addColorStop(1, '#2c6470');
    c.fillStyle = rg; c.fillRect(62 * T, 7 * T, 10 * T, 47 * T);
    c.fillStyle = '#3c3e41'; c.fillRect(62 * T, 4.6 * T, 10 * T, 2.4 * T); // road bridge
    c.fillStyle = '#bdb6a6'; c.fillRect(62 * T, 4.4 * T, 10 * T, 4); c.fillRect(62 * T, 7 * T - 2, 10 * T, 4);
    // pond
    c.fillStyle = '#7a6a45'; c.beginPath(); c.ellipse(49 * T, 34 * T, 5 * T, 4.1 * T, 0, 0, 6.28); c.fill();
    const pg = c.createRadialGradient(49 * T, 34 * T, 10, 49 * T, 34 * T, 4.6 * T); pg.addColorStop(0, '#2d6058'); pg.addColorStop(1, '#3f7f6c');
    c.fillStyle = pg; c.beginPath(); c.ellipse(49 * T, 34 * T, 4.7 * T, 3.8 * T, 0, 0, 6.28); c.fill();
    for (let i = 0; i < 9; i++) { const a = hash(i + 50) * 6.28, r = (0.5 + hash(i + 60) * 0.4) * 4 * T; c.fillStyle = '#4f8f45'; c.beginPath(); c.arc(49 * T + Math.cos(a) * r, 34 * T + Math.sin(a) * r * 0.8, 6, 0.3, 6); c.lineTo(49 * T + Math.cos(a) * r, 34 * T + Math.sin(a) * r * 0.8); c.fill(); if (i % 3 === 0) { c.fillStyle = '#f3a6c6'; circle(c, 49 * T + Math.cos(a) * r + 3, 34 * T + Math.sin(a) * r * 0.8 - 3, 2.5); } }
    // jetty plank
    c.fillStyle = '#7a5a3a'; c.fillRect(48.2 * T, 29.6 * T, 1.6 * T, 1.2 * T); c.strokeStyle = '#5a3f28'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(48.2 * T, 29.6 * T + i * 10); c.lineTo(49.8 * T, 29.6 * T + i * 10); c.stroke(); }
    // fence
    c.strokeStyle = '#7a5b3a'; c.lineWidth = 2;
    for (const [x, y, w, h] of fenceSegs()) {
      c.beginPath(); if (w) { c.moveTo(x * T, y * T - 6); c.lineTo((x + w) * T, y * T - 6); c.moveTo(x * T, y * T - 1); c.lineTo((x + w) * T, y * T - 1); } else { c.moveTo(x * T, y * T); c.lineTo(x * T, (y + h) * T); } c.stroke();
      c.fillStyle = '#6a4d30'; const n = Math.max(w, h) * 2; for (let i = 0; i <= n; i++) { const px = (x + (w ? i / 2 : 0)) * T, py = (y + (h ? i / 2 : 0)) * T; c.fillRect(px - 1.5, py - 10, 3, 11); }
    }
    // flowers (chembarathi, thechi)
    for (let i = 0; i < 70; i++) { const x = hash(i + 200) * W, y = 8 * T + hash(i + 300) * (H - 8 * T); if (x > 60 * T) continue; c.fillStyle = ['#e33a3a', '#f28a2a', '#f5e14a', '#ffffff'][i % 4]; circle(c, x, y, 1.8); circle(c, x + 3, y + 1, 1.5); }
    // bushes border
    for (let i = 0; i < 40; i++) drawBushStatic(c, hash(i + 400) * 60 * T, 46 * T + hash(i + 500) * 8 * T, i);
    for (let i = 0; i < 10; i++) drawBushStatic(c, hash(i + 600) * 9 * T, 27.5 * T + hash(i + 700) * 2 * T, i);
  },
  drawDynamicGround(c) {
    // ripples
    c.strokeStyle = 'rgba(200,235,235,.22)'; c.lineWidth = 1;
    for (let i = 0; i < 30; i++) { const y = 7 * T + ((hash(i) * 47 * T + G.t * 22) % (47 * T)); const x = 62.4 * T + hash(i + 9) * 9 * T; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y); c.stroke(); }
    for (let i = 0; i < 5; i++) { const ph = (G.t * 0.5 + i / 5) % 1; c.strokeStyle = `rgba(220,240,235,${0.3 * (1 - ph)})`; c.beginPath(); c.ellipse(46 * T + hash(i) * 6 * T, 32 * T + hash(i + 3) * 4 * T, 4 + ph * 14, (4 + ph * 14) * 0.45, 0, 0, 6.28); c.stroke(); }
  },
  objs: [
    // ----- junction buildings -----
    { x: 3, y: 0.3, w: 5, h: 3.7, sortY: 4, occ: [2.6, 0, 5.8, 4], draw: (c, o) => drawShop(c, o.x, o.y, o.w, o.h, '#9a4a36', '#d8e2c8', 'തയ്യൽക്കട', 'TAILOR', '#6a2a6a') },
    { x: 24, y: 0.1, w: 9, h: 4.1, sortY: 4.2, occ: [23.6, 0, 9.8, 4.2], draw(c, o) { wallFace(c, o.x, o.y + o.h * 0.42, o.w, o.h * 0.58, '#f1d78c'); for (let i = 0; i < 5; i++) woodWindow(c, o.x + 14 + i * 52, o.y + o.h * 0.55, 18, 16); tileRoof(c, o.x - 6, o.y, o.w + 12, o.h * 0.45, 0.1, '#a84a35'); sign(c, o.x + 40, o.y + o.h * 0.45 - 8, o.w - 80, 'ഗവ. എൽ.പി. സ്കൂൾ, പുഴക്കര', 'GOVT. L.P. SCHOOL PUZHAKKARA', '#204a2a'); } },
    { x: 38, y: 0.3, w: 6, h: 3.7, sortY: 4, occ: [37.6, 0, 6.8, 4], draw(c, o) { drawShop(c, o.x, o.y, o.w, o.h, '#8a4030', '#e8d2a8', 'ബാലന്റെ ചായക്കട', "BALAN'S TEA SHOP", '#8a2a1a'); for (let i = 0; i < 3; i++) { const ph = (G.t * 0.6 + i / 3) % 1; c.fillStyle = `rgba(255,255,255,${0.35 * (1 - ph)})`; circle(c, o.x + 30 + Math.sin(ph * 6 + i) * 4, o.y + o.h * 0.6 - ph * 30, 3 + ph * 4); } c.fillStyle = '#6b4428'; c.fillRect(o.x + 10, o.y + o.h + 6, o.w - 20, 6); drawPerson(c, o.x + 30, o.y + o.h + 12, { skin: '#8a5a3c', hair: '#ddd', shirt: '#e8e2d0', lower: 'mundu', lowerColor: '#f3efe2', mustache: true }, 'down', 0, false, false, true); drawPerson(c, o.x + 70, o.y + o.h + 12, { skin: '#a8724e', hair: '#222', shirt: '#7a9ac0', lower: 'mundu', lowerColor: '#f3efe2', mustache: true }, 'down', 0, false, false, true); } },
    { x: 46, y: 0.3, w: 6, h: 3.7, sortY: 4, occ: [45.6, 0, 6.8, 4], draw(c, o) { drawShop(c, o.x, o.y, o.w, o.h, '#9a4a36', '#cfe0e8', 'വാസു സ്റ്റോഴ്സ് — പലചരക്ക്', 'VASU STORES · GROCERY', '#1f4f7a'); for (let i = 0; i < 6; i++) { c.fillStyle = ['#e8c35a', '#c8402e', '#6a9a3a', '#d8d0c0', '#8d5a2c', '#e0e0e0'][i]; rr(c, o.x + 14 + i * 26, o.y + o.h - 14, 18, 8, 2); } c.fillStyle = '#d0b060'; for (let i = 0; i < 4; i++) ellipse(c, o.x + 20 + i * 8, o.y + o.h * 0.57, 3, 5); } },
    { x: 58, y: 0.6, w: 5, h: 3, sortY: 3.6, occ: [57.6, 0.4, 5.8, 3.2], draw(c, o) { c.fillStyle = '#6a7a8a'; c.fillRect(o.x + 4, o.y + 12, 4, o.h - 12); c.fillRect(o.x + o.w - 8, o.y + 12, 4, o.h - 12); c.fillStyle = '#9aa8b0'; c.fillRect(o.x + 10, o.y + o.h - 16, o.w - 20, 6); c.fillStyle = '#3d7a8a'; rr(c, o.x - 4, o.y, o.w + 8, 26, 3); c.fillStyle = '#2d5a6a'; c.fillRect(o.x - 4, o.y + 22, o.w + 8, 4); sign(c, o.x + 30, o.y + 4, o.w - 60, 'ബസ് സ്റ്റോപ്പ്', 'BUS STOP · PUZHAKKARA', '#c8a020', '#222'); } },
    // street lights
    ...[36, 46, 56, 25].map(x => ({ x: x - 0.1, y: 7, w: 0.2, h: 0.4, solid: true, draw(c, o) { c.fillStyle = '#555'; c.fillRect(o.x + 1, o.y - 40, 3, 52); c.fillRect(o.x + 1, o.y - 40, 12, 3); c.fillStyle = darkness() > 0.2 ? '#fff2c0' : '#ccc'; rr(c, o.x + 9, o.y - 38, 7, 3, 1); } })),
    // ----- the house -----
    // veranda floor + steps (ground level, always under people)
    { x: 16, y: 23.3, w: 12, h: 1.3, sortY: 0, draw(c, o) {
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(o.x + 6, 24.6 * T - 4, o.w, 10);
      c.fillStyle = '#8e2f22'; c.fillRect(o.x, o.y, o.w, o.h); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(o.x, o.y, o.w, 4);
      c.fillStyle = '#9a9184'; c.fillRect(21 * T, 24.6 * T, 2 * T, 6); c.fillStyle = '#8a8174'; c.fillRect(21.2 * T, 24.6 * T + 6, 1.6 * T, 5);
    } },
    ...[16.3, 20.2, 23.8, 27.3].map(px => ({ x: px, y: 21.2, w: 0.4, h: 3.2, sortY: 24.4, occ: [px - 0.3, 21, 1, 3.4], draw(c, o) { c.fillStyle = '#e9dfca'; c.fillRect(o.x, o.y, o.w, o.h); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(o.x + o.w - 3, o.y, 3, o.h); c.fillStyle = '#c9bca2'; c.fillRect(o.x, 24.2 * T, o.w, 4); } })),
    { x: 16, y: 16, w: 12, h: 8, sortY: 23.35, occ: [15.2, 13.4, 13.6, 9.9], draw(c, o) {
      const X = o.x, Y = o.y, W = o.w;
      wallFace(c, X, 21 * T, W, 2.3 * T, '#f2e8d3');
      // door
      c.fillStyle = '#4a2c18'; c.fillRect(21.4 * T, 21.5 * T, 1.2 * T, 1.8 * T); c.fillStyle = '#6a4024'; c.fillRect(21.45 * T, 21.55 * T, 0.55 * T, 1.7 * T); c.fillRect(22.02 * T, 21.55 * T, 0.55 * T, 1.7 * T); c.fillStyle = '#d8b56a'; c.fillRect(21.98 * T, 22.3 * T, 2, 6);
      // windows (lit at night)
      const lit = darkness() > 0.2 && houseLit();
      for (const wx of [17.2, 19.2, 24.2, 26.2]) { woodWindow(c, wx * T, 21.6 * T, 22, 20, lit); }
      // bulb
      c.fillStyle = S.verandaLight ? '#fff3c4' : '#ddd'; circle(c, 22 * T, 21.3 * T, 2.6);
      tileRoof(c, X - 0.8 * T, 13.6 * T, W + 1.6 * T, 7.7 * T, 0.22, '#b2513a');
      c.fillStyle = '#d9c9a5'; c.fillRect(20 * T, 13.7 * T, 4 * T, 1.0 * T); // ridge ornament (mukhappu)
      c.fillStyle = '#b2513a'; c.beginPath(); c.moveTo(19.8 * T, 14.7 * T); c.lineTo(22 * T, 13.3 * T); c.lineTo(24.2 * T, 14.7 * T); c.fill();
      c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(20.6 * T, 14.6 * T); c.lineTo(22 * T, 13.7 * T); c.lineTo(23.4 * T, 14.6 * T); c.fill();
    } },
    { x: 21.3, y: 22.9, w: 1.4, h: 0.6, label: 'Enter the house', act: async () => { await goto('house', 12.3, 15.1, 'up'); } },
    { x: 23.0, y: 22.6, w: 0.5, h: 0.6, reach: 8, sortY: 23.4, draw(c, o) { c.fillStyle = '#efe9dc'; c.fillRect(o.x + 2, o.y + 2, 10, 12); c.fillStyle = '#333'; c.fillRect(o.x + 5, o.y + (S.verandaLight ? 4 : 8), 4, 4); }, label: 'Switch off the outside light', when: () => active('light'), act: async () => { AudioSys.sfx.knock(); S.verandaLight = false; done('light'); } },
    // chair + Ammachi on veranda
    { x: 24.8, y: 23.5, w: 0.9, h: 0.7, sortY: 23.9, draw(c, o) { c.fillStyle = '#6b4428'; rr(c, o.x, o.y, o.w, o.h, 2); c.fillStyle = '#c9a86a'; rr(c, o.x + 2, o.y - 10, o.w - 4, 12, 2); } },
    Object.assign(hooked('ammV'), { npc: true, x: 25.25 * T, y: 24.3 * T, dir: 'down', sitting: true, voice: 'ammachi', visible: () => S.ammVeranda, draw: npcDraw('ammachi') }),
    // ----- shed -----
    { x: 12, y: 12.7, w: 4, h: 3, sortY: 15.7, occ: [11.6, 12.4, 4.8, 3.3], draw(c, o) { wallFace(c, o.x, o.y + 1.3 * T, o.w, 1.7 * T, '#cdbf9f'); c.fillStyle = S.shedOpen ? '#120c08' : '#5a3a22'; c.fillRect(13.4 * T, 14.3 * T, 1.2 * T, 1.4 * T); if (S.shedOpen) { c.fillStyle = '#6a4428'; c.save(); c.translate(13.4 * T, 14.3 * T); c.transform(1, 0, -0.4, 1, 0, 0); c.fillRect(-10, 0, 12, 1.4 * T); c.restore(); } tileRoof(c, o.x - 6, o.y - 4, o.w + 12, 1.5 * T + 4, 0.12, '#a24a34'); } },
    { x: 13.2, y: 15.5, w: 1.6, h: 0.7, label: 'Search the storage shed', act: () => shedAct() },
    // ----- well -----
    { x: 11.6, y: 18.4, w: 2, h: 2, sortY: 20.3, occ: [11.4, 17.2, 2.4, 3.1], draw(c, o) { const X = o.x + T, Y = o.y + T; shade(c, X, Y + 22, 30, 8); c.fillStyle = '#9a8f80'; ellipse(c, X, Y + 6, 28, 16); c.fillStyle = '#7d7366'; ellipse(c, X, Y + 12, 28, 14); c.fillStyle = '#163a40'; ellipse(c, X, Y + 6, 20, 10); c.fillStyle = 'rgba(160,220,230,.25)'; ellipse(c, X - 4, Y + 4, 7, 3); c.fillStyle = '#6b4428'; c.fillRect(X - 26, Y - 30, 4, 38); c.fillRect(X + 22, Y - 30, 4, 38); c.fillRect(X - 26, Y - 32, 52, 5); c.fillStyle = '#555'; circle(c, X, Y - 26, 5); c.strokeStyle = '#c9b070'; c.lineWidth = 1; c.beginPath(); c.moveTo(X, Y - 22); c.lineTo(X, Y + 2); c.stroke(); } },
    { x: 11.4, y: 20.1, w: 2.4, h: 0.7, label: () => active('clean') ? 'Clean the fish' : (active('sickle') && has('sickle') && !S.sickleSharp) ? 'Sharpen the sickle on the well stone' : 'Draw water from the well', act: () => wellAct() },
    // ----- chicken coop -----
    { x: 29.4, y: 12.9, w: 3.4, h: 3, sortY: 15.9, occ: [29, 12.6, 4.2, 3.3], draw(c, o) { c.fillStyle = '#7a5a3a'; c.fillRect(o.x, o.y + 1.2 * T, o.w, 1.8 * T); c.strokeStyle = '#5a3f28'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(o.x + i * 14, o.y + 1.2 * T); c.lineTo(o.x + i * 14, o.y + 3 * T); c.stroke(); } c.strokeStyle = 'rgba(220,220,220,.6)'; c.lineWidth = 0.6; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(o.x + 4 + i * 8, o.y + 1.3 * T); c.lineTo(o.x + 12 + i * 8, o.y + 2.2 * T); c.stroke(); } c.lineWidth = 1; c.fillStyle = '#4a2f1a'; c.fillRect(32 * T, 15.4 * T, 0.8 * T, 0.5 * T); if (S.coopLocked) { c.fillStyle = '#c9a24a'; c.fillRect(32.3 * T, 15.55 * T, 6, 7); } tileRoof(c, o.x - 6, o.y - 4, o.w + 12, 1.3 * T + 6, 0.12, '#a24a34'); c.fillStyle = '#c9a86a'; for (let i = 0; i < 3; i++) rr(c, 29.8 * T + i * 20, 14.9 * T, 16, 10, 2); if (S.eggsInNest) { c.fillStyle = '#f4ead8'; for (let i = 0; i < 3; i++) ellipse(c, 29.8 * T + 8 + i * 20, 15.05 * T + 3, 3, 2.4); } } },
    { x: 29.7, y: 15.7, w: 1.8, h: 0.7, label: 'Search the nesting boxes', when: () => active('eggs'), act: async () => { await hold('Checking the nests', 900); S.eggsInNest = false; give('eggs', 3); done('eggs'); } },
    { x: 32, y: 15.7, w: 0.9, h: 0.6, label: 'Lock the chicken coop', when: () => active('coop'), act: async () => { await hold('Latching the coop door', 900, AudioSys.sfx.knock); S.coopLocked = true; done('coop'); } },
    { x: 27.9, y: 16.6, w: 1, h: 0.6, draw(c, o) { c.fillStyle = '#8a8f96'; rr(c, o.x + 2, o.y + 4, o.w - 4, o.h - 6, 3); if (S.feederFull) { c.fillStyle = '#d9b04a'; rr(c, o.x + 5, o.y + 6, o.w - 10, o.h - 11, 2); } }, label: 'Fill the feeding container', when: () => active('feeder'), act: async () => { if (!has('feed')) { await think('The feed sack must be in the storage shed.'); return; } await hold('Pouring feed', 900, AudioSys.sfx.rustle); S.feederFull = true; done('feeder'); } },
    { x: 33, y: 16.6, w: 0.8, h: 0.6, draw(c, o) { c.fillStyle = '#9a5a36'; ellipse(c, o.x + 12, o.y + 10, 10, 6); c.fillStyle = S.henWater ? '#5aa0b8' : '#5a3a22'; ellipse(c, o.x + 12, o.y + 9, 7, 3.5); }, label: 'Refill the water pot', when: () => active('waterHen'), act: async () => { if (!has('water')) { await think('The pot is dry. I need water from the well.'); return; } take('water'); S.henWater = true; AudioSys.sfx.splash(); done('waterHen'); } },
    // ----- plants & trees -----
    { x: 30.6, y: 24.4, w: 1.2, h: 0.9, sortY: 25.3, draw: (c, o) => drawCurryPlant(c, o.x + 18, o.y + 26), label: 'Pluck curry leaves', when: () => (active('curry') || active('curry2')) && !has('curry'), act: async () => { await hold('Plucking', 700); give('curry'); done('curry'); if (active('curry2')) done('curry2'); } },
    ...PALMS.map(([x, y, lean, seed]) => ({ x: x - 0.15, y: y - 0.12, w: 0.3, h: 0.2, solid: true, occ: [x + lean / T - 1.4, y - (78 + hash(seed) * 26) / T - 1.1, 2.8, 2.1], draw: (c, o) => drawPalm(c, x * T, y * T, 78 + hash(seed) * 26, lean, seed) })),
    ...[[13.6, 27.6], [32.9, 29.9], [15.2, 33.8]].map(([x, y], i) => ({ x: x - 0.3, y: y - 0.3, w: 0.6, h: 0.6, visible: () => S.cocoOn && !S['coco' + i] && !(S.cocoOn === 2 && i > 0), draw(c, o) { shade(c, o.x + 9, o.y + 14, 8, 3); c.fillStyle = '#6a6a2a'; ellipse(c, o.x + 9, o.y + 9, 8, 7); c.fillStyle = '#87853a'; ellipse(c, o.x + 7, o.y + 7, 4, 3); }, label: 'Pick up the coconut',
      act: async () => { S['coco' + i] = true; give('coconut'); if (active('coconut')) { const n = G.inv.coconut; setObjText('coconut', `Collect fallen coconuts (${Math.min(2, n)}/2)`); if (n >= 2) done('coconut'); } } })),
    { x: 19.35, y: 30.4, w: 0.4, h: 0.3, solid: true, occ: [17.2, 26.6, 4.6, 3.7], draw: (c, o) => drawMango(c, 19.5 * T, 30.5 * T, 56) },
    { x: 29.3, y: 33.4, w: 0.4, h: 0.3, solid: true, occ: [28, 30.8, 3, 2.6], draw(c, o) { drawMango(c, 29.5 * T, 33.5 * T, 34); c.fillStyle = '#e8c040'; for (let i = 0; i < 7; i++) circle(c, 29.5 * T - 26 + hash(i) * 52, 33.5 * T - 70 + hash(i + 3) * 40, 3); } },
    { x: 28.6, y: 33.3, w: 1.8, h: 0.9, label: 'Pick kudampuli (Malabar tamarind)', when: () => active('kudampuli'), act: async () => { await hold('Picking ripe kudampuli', 900); give('kudampuli'); done('kudampuli'); await think('Ammachi dries these on the roof every summer. The whole yard used to smell sour.'); } },
    ...BANANAS.map(([x, y], i) => ({ x: x - 0.15, y: y - 0.1, w: 0.3, h: 0.2, solid: true, occ: [x - 1.1, y - 2.2, 2.2, 2], draw: (c, o) => drawBanana(c, x * T, y * T, i, 1 + hash(i) * 0.25) })),
    ...SOIL.map(([x, y], i) => ({ x: x - 0.5, y: y - 0.3, w: 1, h: 0.6, draw(c, o) { c.fillStyle = S['soil' + i] ? '#4a3020' : '#5e3f28'; ellipse(c, o.x + 16, o.y + 10, 16, 7); c.fillStyle = '#4a3020'; for (let k = 0; k < 5; k++) circle(c, o.x + 6 + hash(k + i) * 20, o.y + 6 + hash(k * 2 + i) * 8, 2); },
      label: 'Dig for earthworms', when: () => (active('worms') || (active('fish') && !has('worm'))) && !S['soil' + i],
      act: async () => { await hold('Digging in the damp soil', 1100, AudioSys.sfx.dig); S['soil' + i] = true; give('worm', 1); if (active('worms')) { setObjText('worms', `Dig up earthworms near the bananas (${Math.min(3, G.inv.worm)}/3)`); if (G.inv.worm >= 3) done('worms'); } } })),
    { x: 59.2, y: 46.2, w: 1.4, h: 0.6, solid: true, occ: [58.8, 43.2, 2.2, 3.3], draw: (c, o) => drawBamboo(c, 59.9 * T, 46.8 * T), label: () => active('stake') ? 'Cut a bamboo stake' : 'Cut a bamboo branch', when: () => active('bamboo') || (active('stake') && !has('stake')), reach: 10,
      act: async () => { if (!has('knife')) { await think("Too thick to snap by hand. Appachan's knife should still be in the storage shed."); return; } await hold('Cutting with the vettukathi', 1500, AudioSys.sfx.knock); if (active('stake')) { give('stake'); done('stake'); return; } give('bamboo'); done('bamboo'); } },
    { x: 15.3, y: 16.4, w: 0.6, h: 0.5, visible: () => S.keyGlint, draw(c, o) { const s = (Math.sin(G.t * 5) + 1) / 2; c.fillStyle = `rgba(255,240,180,${0.4 + s * 0.6})`; circle(c, o.x + 9, o.y + 8, 2 + s * 2); c.strokeStyle = `rgba(255,240,180,${s})`; c.beginPath(); c.moveTo(o.x + 1, o.y + 8); c.lineTo(o.x + 17, o.y + 8); c.moveTo(o.x + 9, o.y); c.lineTo(o.x + 9, o.y + 16); c.stroke(); }, label: 'Something is glinting in the mud', act: async () => { S.keyGlint = false; give('key'); done('key'); await say('c2_arj2'); } },
    // ----- Kunjumon's hut -----
    { x: 52, y: 21.4, w: 5.5, h: 4.4, sortY: 25.8, occ: [51.6, 21.2, 6.3, 4.6], draw(c, o) { wallFace(c, o.x + 6, o.y + 2.2 * T, o.w - 12, 2.2 * T, '#b8a07a'); c.fillStyle = '#2a1a10'; c.fillRect(54 * T, 23.6 * T, 1.1 * T, 1.6 * T); c.fillStyle = '#c4a45a'; c.beginPath(); c.moveTo(o.x - 8, o.y + 2.6 * T); c.lineTo(o.x + o.w + 8, o.y + 2.6 * T); c.lineTo(o.x + o.w - 20, o.y); c.lineTo(o.x + 20, o.y); c.closePath(); c.fill(); c.strokeStyle = '#a4843a'; c.lineWidth = 1; for (let y = o.y + 6; y < o.y + 2.6 * T; y += 4) { c.beginPath(); c.moveTo(o.x, y); c.lineTo(o.x + o.w, y); c.stroke(); } c.lineWidth = 1; } },
    { x: 57.4, y: 25.6, w: 1.6, h: 1, sortY: 26.6, draw(c, o) { c.strokeStyle = '#6b4428'; c.lineWidth = 2; c.beginPath(); c.moveTo(o.x, o.y + o.h); c.lineTo(o.x, o.y - 10); c.lineTo(o.x + o.w, o.y - 10); c.lineTo(o.x + o.w, o.y + o.h); c.stroke(); c.strokeStyle = 'rgba(230,230,220,.6)'; c.lineWidth = 0.6; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(o.x + i * 5, o.y - 10); c.lineTo(o.x + i * 5 + 3, o.y + o.h - 4); c.stroke(); } c.lineWidth = 1; } },
    Object.assign(hooked('kunjumon'), { id: 'kun', npc: true, x: 54.6 * T, y: 26.6 * T, dir: 'down', sitting: true, voice: 'kunjumon', visible: () => !!S.kunOn, draw: npcDraw('kunjumon') }),
    // ----- fishing spot -----
    { x: 48.2, y: 29.4, w: 1.6, h: 1.2, label: 'Fish here', when: () => active('fish') && has('rod'), act: () => fishAct() },
    { x: 52.6, y: 0.3, w: 5, h: 3.7, sortY: 4, occ: [52.2, 0, 5.8, 4], draw(c, o) { drawShop(c, o.x, o.y, o.w, o.h, '#7a7f86', '#d8d4c8', 'ശശി മോട്ടോഴ്സ്', "SASI MOTORS · WORKSHOP", '#2a2a2a'); c.fillStyle = '#1a1a1a'; for (let i = 0; i < 3; i++) { circle(c, o.x + 12, o.y + o.h * T / T - 4 - i * 6, 7); } c.fillStyle = '#444'; for (let i = 0; i < 3; i++) circle(c, o.x + 12, o.y + o.h - 4 - i * 6, 3); } },
    Object.assign(hooked('sasi'), { id: 'sasi', npc: true, x: 55.1 * T, y: 4.4 * T, dir: 'down', voice: 'sasi', draw: npcDraw('sasi') }),
    // ----- Appachan's farm -----
    { x: 12, y: 37.2, w: 21, h: 8.4, sortY: 37.2, draw(c) { const left = 6 - [0, 1, 2, 3, 4, 5].filter(i => S['weed' + i]).length; if (!left) return; for (let i = 0; i < 46; i++) { if (hash(i + 77) * 6 > left) continue; const x = (12.6 + hash(i + 11) * 20) * T, y = (37.8 + hash(i + 31) * 7.4) * T; c.strokeStyle = i % 2 ? '#5f8a30' : '#7a9a3a'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + k * 2, y); c.lineTo(x + k * 2 + Math.sin(G.t + i + k) * 2 - 3 + k * 2, y - 10 - hash(i + k) * 6); c.stroke(); } } } },
    ...FARM_WEEDS.map(([x, y], i) => ({ x: x - 0.6, y: y - 0.4, w: 1.2, h: 0.8, visible: () => !S['weed' + i], draw: (c, o) => drawWeed(c, x * T, y * T, 1.1, i * 7), label: 'Clear the weeds', when: () => active('weeds'),
      act: async () => { if (!S.sickleSharp) { await think(has('sickle') ? 'This blunt sickle just bends the grass. I should sharpen it on the stone by the well.' : "I can't pull this by hand. Appachan's sickle should be in the shed."); return; } await hold('Cutting with the arival', 1200, AudioSys.sfx.sweep); S['weed' + i] = true; const n = [0, 1, 2, 3, 4, 5].filter(k => S['weed' + k]).length; setObjText('weeds', `Clear the weeds (${n}/6)`); if (n === 6) done('weeds'); } })),
    ...FARM_BRANCHES.map(([x, y], i) => ({ x: x - 0.5, y: y - 0.4, w: 1, h: 0.6, visible: () => !S['br' + i], draw: (c, o) => drawBranch(c, x * T, y * T, i), label: 'Pick up the fallen branch', when: () => active('branches'),
      act: async () => { S['br' + i] = true; give('branch'); const n = [0, 1, 2, 3].filter(k => S['br' + k]).length; setObjText('branches', `Collect fallen branches (${n}/4)`); if (n === 4) done('branches'); } })),
    ...FARM_FENCE.map(([x, y, w, h, vert], i) => ({ x, y, w, h, draw(c, o) { if (S['fence' + i]) { c.fillStyle = '#8a6a44'; const n = Math.round((vert ? h : w) * 2); for (let k = 0; k <= n; k++) { const px = vert ? o.x + o.w / 2 : o.x + k * T / 2, py = vert ? o.y + k * T / 2 : o.y + o.h / 2; c.fillRect(px - 1.5, py - 9, 3, 10); } c.strokeStyle = '#a07a4a'; c.lineWidth = 2; c.beginPath(); if (vert) { c.moveTo(o.x + o.w / 2, o.y - 5); c.lineTo(o.x + o.w / 2, o.y + o.h - 5); } else { c.moveTo(o.x, o.y + o.h / 2 - 5); c.lineTo(o.x + o.w, o.y + o.h / 2 - 5); } c.stroke(); } else { c.fillStyle = '#5a3f28'; for (let k = 0; k < 3; k++) { c.save(); c.translate(o.x + (vert ? o.w / 2 : 10 + k * 20), o.y + (vert ? 10 + k * 20 : o.h / 2)); c.rotate(0.9 + k); c.fillRect(-1.5, -6, 3, 12); c.restore(); } } },
      label: 'Repair the fallen fence', when: () => active('fence') && !S['fence' + i],
      act: async () => { if (!has('branch')) { await think('I need sturdy branches to use as new posts.'); return; } await hold('Driving in posts, tying coir', 1500, AudioSys.sfx.knock); take('branch'); S['fence' + i] = true; const n = [0, 1, 2].filter(k => S['fence' + k]).length; setObjText('fence', `Repair the broken fence (${n}/3)`); if (n === 3) done('fence'); } })),
    { x: 13.4, y: 37.6, w: 1.6, h: 1, draw(c, o) { c.fillStyle = '#3a2818'; ellipse(c, o.x + 26, o.y + 18, 22, 10); c.fillStyle = '#4a3420'; ellipse(c, o.x + 26, o.y + 16, 17, 7); if (S.compostBin) { c.fillStyle = '#8a6a44'; rr(c, o.x + 30, o.y - 6, 22, 22, 2); c.strokeStyle = '#6a4a2c'; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(o.x + 30, o.y - 2 + k * 5); c.lineTo(o.x + 52, o.y - 2 + k * 5); c.stroke(); } c.fillStyle = '#a0782c'; ellipse(c, o.x + 41, o.y - 6, 9, 3); } },
      label: 'Set up the compost bin by the pit', when: () => active('compost') && has('compostbin'),
      act: async () => { await hold('Setting it up, filling with leaves', 1300, AudioSys.sfx.rustle); take('compostbin'); S.compostBin = true; done('compost'); give('compost', 2); await think("Appachan's old pit beside it is full of dark, ready compost. Two basketfuls for the beds.", 3000); } },
    { x: 30.2, y: 37.2, w: 2.4, h: 1.7, sortY: 38.9, occ: [29.9, 36.9, 3, 2], draw(c, o) { wallFace(c, o.x, o.y + 16, o.w, o.h - 16, '#cfc6b0'); c.fillStyle = '#8a9098'; c.fillRect(o.x - 4, o.y + 4, o.w + 8, 14); c.strokeStyle = '#6a7078'; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(o.x - 4 + k * 7, o.y + 4); c.lineTo(o.x - 4 + k * 7, o.y + 18); c.stroke(); } c.fillStyle = S.pumpFixed ? '#2f7ab0' : '#6a4a3a'; rr(c, o.x + 22, o.y + o.h - 18, 26, 14, 4); c.fillStyle = '#444'; circle(c, o.x + 35, o.y + o.h - 11, 4 + (S.pumpFixed ? Math.sin(G.t * 30) * 0.6 : 0)); } },
    Object.assign(hooked('pump'), { x: 30.4, y: 38.9, w: 2, h: 0.6 }),
    { x: 28.8, y: 37.8, w: 1.2, h: 1, visible: () => !S.pumpWeeds, draw: (c, o) => drawWeed(c, 29.4 * T, 38.6 * T, 1.4, 91), label: 'Clear the weeds around the pump', when: () => active('pumpweeds'),
      act: async () => { await hold('Hacking through the weeds', 1500, AudioSys.sfx.sweep); S.pumpWeeds = true; await think('Under the roots there is a flat stone... and something metal beneath it.', 2800); await hold('Lifting the stone', 1000, AudioSys.sfx.dig); give('photo1996'); await say('c3_arj4'); await say('c3_arj5'); done('pumpweeds'); } },
    { x: 16.4, y: 39.2, w: 15, h: 0.6, sortY: 0, draw(c) { c.strokeStyle = '#5a4028'; c.lineWidth = 4; c.beginPath(); c.moveTo(30.4 * T, 39.5 * T); c.lineTo(16.6 * T, 39.5 * T); c.stroke(); if (S.pumpFixed) { c.strokeStyle = '#5aa0c8'; c.lineWidth = 2.5; c.setLineDash([6, 4]); c.lineDashOffset = G.t * 30; c.beginPath(); c.moveTo(30.4 * T, 39.5 * T); c.lineTo(16.6 * T, 39.5 * T); c.stroke(); c.setLineDash([]); } } },
    ...FARM_BEDS.map((x, i) => ({ x, y: 40, w: 1.4, h: 3, sortY: 43, solid: true, solidRect() { const b = (S.beds || [])[i]; return b && b.dug ? { x: this.x + 3, y: this.y + 2, w: this.w - 6, h: this.h - 2 } : { x: -999, y: -999, w: 0, h: 0 }; }, draw(c, o) { const b = (S.beds || [])[i] || {}; if (!b.dug) { c.strokeStyle = 'rgba(240,230,200,.35)'; c.setLineDash([3, 3]); c.strokeRect(o.x, o.y, o.w, o.h); c.setLineDash([]); return; } c.fillStyle = b.water || S.pumpFixed ? '#3e2a1a' : '#5e4028'; rr(c, o.x, o.y, o.w, o.h, 5); c.fillStyle = 'rgba(0,0,0,.15)'; for (let k = 0; k < 3; k++) c.fillRect(o.x + 4, o.y + 12 + k * 30, o.w - 8, 3); if (b.crop) for (let k = 0; k < 3; k++) drawCrop(c, o.x + o.w / 2, o.y + 22 + k * 30, b.crop, b.stage || 0, b.water || S.pumpFixed); },
      label: () => { const b = (S.beds || [])[i] || {}; if (!b.dug) return 'Dig a planting bed'; if (!b.crop) return `Plant ${CROP_INFO[i].name}`; return `Water the ${CROP_INFO[i].name}`; },
      when: () => { const b = (S.beds || [])[i]; if (!b) return false; return (active('beds') && !b.dug) || (active('plant') && b.dug && !b.crop) || (active('waterBeds') && b.crop && !b.water); },
      act: async () => bedAct(i) })),
    { x: 18.4, y: 30.8, w: 2.2, h: 0.9, label: 'Rake up dry mango leaves', when: () => active('compost') && !has('leaves') && !has('compostbin') && !S.compostBin, act: async () => { await hold('Raking leaves', 1000, AudioSys.sfx.rustle); give('leaves'); } },
    { x: 5.8, y: 37.5, w: 1.1, h: 0.8, label: 'Dig up a banana sucker', when: () => active('sapling') && !has('sapling'), act: async () => { if (!has('mammatti')) { await think("I'll need the mammatti for this. It is in the shed."); return; } await hold('Digging out the sucker', 1500, AudioSys.sfx.dig); give('sapling'); done('sapling'); } },
    // ----- people at the junction -----
    Object.assign(hooked('grocer', { label: () => S.hooks.grocer ? S.hooks.grocer.label : 'Talk to Vasu Chettan', when: () => true, act: () => grocerAct() }), { npc: true, x: 49 * T, y: 4.4 * T, dir: 'down', voice: 'grocer', draw: npcDraw('grocer') }),
    Object.assign(hooked('jomon'), { id: 'jomon', npc: true, x: 57.6 * T, y: 6.2 * T, dir: 'left', voice: 'jomon', visible: () => !!S.jomonOn, draw: npcDraw('jomon') }),
  ],
});
function drawBushStatic(c, x, y, i) { drawBush(c, x, y, i % 2 ? '#3d7330' : '#457d36', 8 + hash(i) * 6); }

// ---------- Vehicles (entities) ----------
const AUTO = { map: 'village', x: 56.2 * T, y: 6.0 * T, heading: Math.PI, draw(c, o) {
  c.save(); c.translate(o.x, o.y); const flip = Math.cos(o.heading) < -0.3; const down = Math.abs(Math.sin(o.heading)) > 0.7;
  shade(c, 0, 2, 22, 7);
  if (down) {
    c.fillStyle = '#111'; rr(c, -12, -6, 5, 10, 2); rr(c, 7, -6, 5, 10, 2); rr(c, -2.5, 10, 5, 8, 2);
    c.fillStyle = '#f2c230'; rr(c, -12, -20, 24, 32, 7); c.fillStyle = '#1a1a1a'; rr(c, -13, -32, 26, 22, 6); c.fillStyle = '#a8c8d8'; rr(c, -9, -8, 18, 8, 2);
  } else {
    if (flip) c.scale(-1, 1);
    c.fillStyle = '#111'; circle(c, -12, 0, 5); circle(c, 13, 0, 5);
    c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(-20, -2); c.lineTo(18, -2); c.quadraticCurveTo(24, -10, 18, -16); c.lineTo(-18, -16); c.closePath(); c.fill();
    c.fillStyle = '#1a1a1a'; rr(c, -21, -36, 34, 22, 6); c.fillStyle = '#a8c8d8'; c.fillRect(10, -30, 6, 13);
    c.fillStyle = '#1c6a3a'; c.fillRect(-20, -8, 38, 3);
    if (o.passenger) { drawPerson(c, -6, -2, outfitFor(G.player), 'right', 0, false, G.speaking === 'arjun', true); drawPerson(c, 8, -2, LOOKS.jomon, 'right', 0, false, G.speaking === 'jomon', true); }
    c.fillStyle = '#e8e2c0'; c.font = `600 5px Inter`; c.fillText('KL-05', -6, -7);
  }
  c.restore(); } };
const CANOE = { map: 'village', x: 62.9 * T, y: 25.4 * T, draw(c, o) { c.save(); c.translate(o.x, o.y); c.fillStyle = 'rgba(0,0,0,.2)'; ellipse(c, 2, 3, 8, 30); c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(11, 0, 0, 32); c.quadraticCurveTo(-11, 0, 0, -32); c.fill(); c.fillStyle = '#3a2414'; c.beginPath(); c.moveTo(0, -26); c.quadraticCurveTo(7, 0, 0, 26); c.quadraticCurveTo(-7, 0, 0, -26); c.fill(); if (o.rower) { drawPerson(c, 0, 8, LOOKS.kunjumon, 'down', 0, false, G.speaking === 'kunjumon', true); c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; const a = Math.sin(G.t * 3) * 0.5; c.beginPath(); c.moveTo(-14 * Math.cos(a), -4); c.lineTo(14 * Math.cos(a), 6); c.stroke(); } c.restore(); } };

// ======================= ST. GEORGE'S CHURCH (funeral) =======================
Object.assign(LOOKS, {
  priest:  { skin: '#a8724e', hair: '#2a2420', shirt: '#fbfbf8', lower: 'mundu', lowerColor: '#fbfbf8', beard: '#3a302a' },
  mournerA:{ skin: '#b37a55', hair: '#1b1410', shirt: '#f4f1e8', lower: 'mundu', lowerColor: '#f4f1e8', mustache: true },
  mournerB:{ skin: '#9a6644', hair: '#d8d4cc', bun: true, shirt: '#f8f5ee', lower: 'mundu', lowerColor: '#fbf8f0', neriyathu: '#f3ecd8', border: '#c9c3b0' },
  mournerC:{ skin: '#c48a60', hair: '#1b1410', shirt: '#e8e6e0', lower: 'pants', lowerColor: '#3a3d44' },
});
function umbrella(c, x, y) { c.fillStyle = '#16161a'; c.beginPath(); c.ellipse(x, y - 44, 17, 8, 0, Math.PI, 0); c.fill(); c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.ellipse(x - 4, y - 47, 8, 3, 0, Math.PI, 0); c.fill(); c.strokeStyle = '#333'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y - 44); c.lineTo(x + 2, y - 26); c.stroke(); }
const MOURNERS = [[6.2, 9.2, 'mournerA', 'right', true], [6.8, 11.4, 'mournerB', 'right', false], [13.6, 9.6, 'mournerC', 'left', true], [14.4, 11.2, 'mournerA', 'left', true], [12.6, 12, 'mournerB', 'up', false], [7.6, 12.6, 'mournerC', 'up', true]];
defMap('church', {
  w: 20, h: 15, outdoor: true, bg: '#24331f',
  solids: [[0, 0, 20, 4.6], [9.2, 8.5, 1.8, 1]],
  paint(c) {
    c.fillStyle = '#4e7a38'; c.fillRect(0, 0, 20 * T, 15 * T);
    grain(c, 0, 0, 20 * T, 15 * T, ['#46702f', '#5a8a42', '#3f662c'], 5000, 3, 4);
    c.fillStyle = '#b5653f'; c.fillRect(9.2 * T, 4.6 * T, 1.6 * T, 10.4 * T); grain(c, 9.2 * T, 4.6 * T, 1.6 * T, 10.4 * T, ['#a3583a', '#c37450'], 400, 3, 2);
    // old graves
    for (const [gx, gy] of [[2.5, 6.5], [4.5, 6.5], [2.5, 9], [4.5, 9.4], [2.5, 12], [15.5, 6.5], [17.5, 6.6], [15.6, 13.4], [17.6, 9], [17.5, 12]]) {
      c.fillStyle = '#9a958a'; c.fillRect(gx * T - 14, gy * T - 4, 28, 30); c.fillStyle = '#b8b2a6'; c.fillRect(gx * T - 14, gy * T - 4, 28, 4);
      c.fillStyle = '#d8d2c6'; c.fillRect(gx * T - 2, gy * T - 26, 4, 24); c.fillRect(gx * T - 9, gy * T - 20, 18, 4);
    }
    c.fillStyle = '#6a6458'; c.fillRect(0, 14.6 * T, 20 * T, 0.4 * T);
  },
  objs: [
    { x: 4, y: 0, w: 12, h: 4.6, sortY: 4.6, draw(c, o) {
      wallFace(c, o.x + 1.4 * T, o.y + 1.4 * T, o.w - 2.8 * T, 3.2 * T, '#f6f2ea');
      tileRoof(c, o.x, o.y + 0.6 * T, 3 * T, 2.4 * T, 0.2, '#a84a35'); tileRoof(c, o.x + 9 * T, o.y + 0.6 * T, 3 * T, 2.4 * T, 0.2, '#a84a35');
      c.fillStyle = '#fbf8f2'; c.beginPath(); c.moveTo(o.x + 3 * T, o.y + 1.6 * T); c.lineTo(o.x + 6 * T, o.y - 0.4 * T); c.lineTo(o.x + 9 * T, o.y + 1.6 * T); c.fill();
      c.fillStyle = '#e8e0d0'; c.fillRect(o.x + 3 * T, o.y + 1.5 * T, 6 * T, 3.1 * T);
      c.fillStyle = '#c9a24a'; c.fillRect(o.x + 6 * T - 2, o.y - 1.2 * T, 4, 0.9 * T); c.fillRect(o.x + 6 * T - 9, o.y - 1 * T, 18, 4);
      c.fillStyle = '#5a3a22'; c.beginPath(); c.moveTo(o.x + 5.3 * T, o.y + 4.6 * T); c.lineTo(o.x + 5.3 * T, o.y + 3.2 * T); c.arc(o.x + 6 * T, o.y + 3.2 * T, 0.7 * T, Math.PI, 0); c.lineTo(o.x + 6.7 * T, o.y + 4.6 * T); c.fill();
      c.fillStyle = '#8fb0c8'; for (const wx of [4, 8]) { c.beginPath(); c.arc(o.x + wx * T, o.y + 2.6 * T, 0.35 * T, Math.PI, 0); c.lineTo(o.x + (wx + 0.35) * T, o.y + 3.4 * T); c.lineTo(o.x + (wx - 0.35) * T, o.y + 3.4 * T); c.fill(); }
      c.fillStyle = '#efe8da'; c.beginPath(); c.arc(o.x + 6 * T, o.y + 1.4 * T, 0.35 * T, 0, 6.28); c.fill(); c.fillStyle = '#7a9ac0'; c.beginPath(); c.arc(o.x + 6 * T, o.y + 1.4 * T, 0.25 * T, 0, 6.28); c.fill();
    } },
    { x: 9.2, y: 8.5, w: 1.8, h: 1, sortY: 9.4, draw(c, o) {
      c.fillStyle = '#6a4a2c'; c.beginPath(); c.ellipse(o.x + o.w / 2, o.y + 18, 30, 13, 0, 0, 6.28); c.fill();
      c.fillStyle = '#7d5834'; c.beginPath(); c.ellipse(o.x + o.w / 2, o.y + 15, 25, 9, 0, 0, 6.28); c.fill();
      c.fillStyle = '#f0ebe0'; c.fillRect(o.x + o.w / 2 - 2, o.y - 24, 4, 34); c.fillRect(o.x + o.w / 2 - 10, o.y - 16, 20, 4);
      const wreath = ['#f4f1e8', '#e33a3a', '#f5e14a', '#ffffff', '#f28a2a'];
      for (let i = 0; i < 12; i++) { c.fillStyle = wreath[i % 5]; c.beginPath(); c.arc(o.x + o.w / 2 - 20 + i * 3.6, o.y + 12 + Math.sin(i) * 4, 3, 0, 6.28); c.fill(); }
      if (S.flowersPlaced) { c.fillStyle = '#f3a6c6'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(o.x + o.w / 2 - 6 + i * 3, o.y + 24, 2.6, 0, 6.28); c.fill(); } }
      for (const dx of [-24, 24]) { c.fillStyle = '#efe6cc'; c.fillRect(o.x + o.w / 2 + dx - 2, o.y + 14, 4, 10); const f = 0.7 + Math.sin(G.t * 14 + dx) * 0.3; c.fillStyle = `rgba(255,190,80,${f})`; c.beginPath(); c.ellipse(o.x + o.w / 2 + dx, o.y + 11, 2, 4, 0, 0, 6.28); c.fill(); }
    }, label: 'Place the flowers on the grave', when: () => !S.flowersPlaced && has('flowers'), act: async () => { await hold('Kneeling', 1600); take('flowers'); S.flowersPlaced = true; } },
    ...MOURNERS.map(([x, y, look, dir, umb]) => ({ npc: true, x: x * T, y: y * T, dir, draw(c, o) { drawPerson(c, o.x, o.y, LOOKS[look], o.dir); if (umb) umbrella(c, o.x, o.y); } })),
    { id: 'priest', npc: true, x: 10.1 * T, y: 7.8 * T, dir: 'down', draw(c, o) { drawPerson(c, o.x, o.y, LOOKS.priest, 'down'); c.fillStyle = '#2a2a2a'; c.fillRect(o.x - 5, o.y - 20, 10, 8); } },
    { id: 'cAmm', npc: true, x: 11.9 * T, y: 9.9 * T, dir: 'left', voice: 'ammachi', draw: (c, o) => { drawPerson(c, o.x, o.y, LOOKS.ammachi, o.dir, 0, false, G.speaking === 'ammachi'); } },
    { id: 'cJom', npc: true, x: 8.2 * T, y: 10.9 * T, dir: 'right', voice: 'jomon', draw: (c, o) => { drawPerson(c, o.x, o.y, LOOKS.jomon, o.dir, o.walk || 0, !!o.moving, G.speaking === 'jomon'); umbrella(c, o.x, o.y); } },
  ],
});
