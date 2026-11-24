// ===== Nammude Naadu — procedural stylized art =====
const ML_FONT = "'Noto Sans Malayalam','Malayalam Sangam MN','Kartika',sans-serif";
function ellipse(c, x, y, rx, ry) { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
function rr(c, x, y, w, h, r = 3) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); }
function shade(c, x, y, rx, ry, a = 0.22) { c.fillStyle = `rgba(0,0,0,${a})`; ellipse(c, x, y, rx, ry); }
function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }

// ---------- Characters ----------
const LOOKS = {
  arjun_home:  { skin: '#c48a60', hair: '#17110d', shirt: '#4a6fa5', lower: 'pants', lowerColor: '#30384f', mustache: false },
  arjun_work:  { skin: '#c48a60', hair: '#17110d', shirt: '#eef2f7', lower: 'pants', lowerColor: '#262a33', collar: '#c7ced8' },
  arjun_travel:{ skin: '#c48a60', hair: '#17110d', shirt: '#3d6f8f', lower: 'pants', lowerColor: '#34405c' },
  arjun_mundu: { skin: '#c48a60', hair: '#17110d', shirt: '#6f8f5a', lower: 'mundu', lowerColor: '#f6f2e6' },
  ammachi:  { skin: '#b37a55', hair: '#dcd8d0', bun: true, shirt: '#f8f5ee', lower: 'mundu', lowerColor: '#fbf8f0', border: '#d9b45a', neriyathu: '#f3ecd8' },
  jomon:    { skin: '#a96f48', hair: '#120d0a', shirt: '#b59a66', lower: 'pants', lowerColor: '#9c8455', mustache: true },
  kunjumon: { skin: '#83553a', hair: '#d9d6d0', shirt: null, lower: 'mundu', lowerColor: '#3d6a9a', check: true, beard: '#e8e5df', towel: '#e9e1cc' },
  grocer:   { skin: '#ab744d', hair: '#3a3530', shirt: '#ece6d6', lower: 'mundu', lowerColor: '#f3efe2', mustache: true, bald: true },
  shibu:    { skin: '#b8805a', hair: '#1a1410', shirt: '#93add0', lower: 'pants', lowerColor: '#333846', mustache: true },
  appachan: { skin: '#a8724e', hair: '#e4e1da', shirt: '#f4f1e8', lower: 'mundu', lowerColor: '#f4f1e8', mustache: true },
};
function outfitFor(p) { return LOOKS['arjun_' + p.outfit] || LOOKS.arjun_home; }

function drawPerson(c, x, y, L, dir = 'down', walk = 0, moving = false, talking = false, sitting = false) {
  const sw = moving ? Math.sin(walk) * 3 : 0;
  const bob = moving ? Math.abs(Math.sin(walk)) * 1.2 : 0;
  const side = dir === 'left' || dir === 'right', sx = dir === 'left' ? -1 : 1;
  c.save(); c.translate(Math.round(x), Math.round(y));
  shade(c, 0, 0, 10, 4);
  c.translate(0, -bob + (sitting ? 5 : 0));
  // lower body
  if (!sitting) {
    c.fillStyle = '#2a1f18';
    if (moving) { ellipse(c, -3 + (side ? sw : 0), -1 + (side ? 0 : sw * 0.4), 2.6, 1.6); ellipse(c, 3 - (side ? sw : 0), -1 - (side ? 0 : sw * 0.4), 2.6, 1.6); }
    else { ellipse(c, -3, -1, 2.6, 1.6); ellipse(c, 3, -1, 2.6, 1.6); }
  }
  if (L.lower === 'pants') {
    c.fillStyle = L.lowerColor;
    if (side) { rr(c, -3 + sw, -14, 5, 13, 2); rr(c, -2 - sw, -14, 5, 13, 2); }
    else { rr(c, -6, -14, 5.5, 13 + (moving ? sw * 0.3 : 0), 2); rr(c, 0.5, -14, 5.5, 13 - (moving ? sw * 0.3 : 0), 2); }
  } else {
    c.fillStyle = L.lowerColor;
    c.beginPath(); c.moveTo(-7, -15); c.lineTo(7, -15); c.lineTo(8.5, -1.5); c.lineTo(-8.5, -1.5); c.closePath(); c.fill();
    if (L.check) { c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; for (let i = -6; i <= 6; i += 4) { c.beginPath(); c.moveTo(i, -15); c.lineTo(i * 1.2, -2); c.stroke(); } c.beginPath(); c.moveTo(-8, -8); c.lineTo(8, -8); c.stroke(); }
    if (L.border) { c.fillStyle = L.border; c.fillRect(-8.5, -3.2, 17, 1.6); }
  }
  // arms (behind)
  const arm = (ax, oy) => { c.fillStyle = L.shirt || L.skin; rr(c, ax, -25 + oy, 4, 6, 2); c.fillStyle = L.skin; rr(c, ax + 0.3, -20 + oy, 3.4, 8, 2); };
  if (side) arm(-2 - sw * 0.8 * sx, 0);
  else { arm(-11, sw * 0.6); arm(7, -sw * 0.6); }
  // long plait (seen from the side, behind the body)
  if (L.plait && side) { c.fillStyle = L.hair; for (let i = 0; i < 5; i++) circle(c, -sx * 5.5, -30 + i * 3.6, 2.6 - i * 0.22); }
  // torso
  c.fillStyle = L.shirt || L.skin; rr(c, -8, -27, 16, 14, 4);
  if (L.chain) { c.strokeStyle = '#e8c040'; c.lineWidth = 1; c.beginPath(); c.arc(0, -27, 4, 0.2, Math.PI - 0.2); c.stroke(); }
  if (L.grease) { c.fillStyle = 'rgba(20,20,20,.35)'; ellipse(c, 3, -18, 3, 2); ellipse(c, -4, -22, 2, 1.4); }
  if (L.collar) { c.fillStyle = L.collar; c.fillRect(-3, -27, 6, 2); }
  if (L.neriyathu) { c.fillStyle = L.neriyathu; c.beginPath(); c.moveTo(-8, -26); c.lineTo(-4, -27); c.lineTo(8, -14); c.lineTo(3, -13); c.closePath(); c.fill(); c.fillStyle = L.border; c.fillRect(4, -16, 4, 1.4); }
  if (L.towel) { c.fillStyle = L.towel; c.beginPath(); c.moveTo(-8, -27); c.lineTo(-3, -27); c.lineTo(7, -15); c.lineTo(3, -14); c.closePath(); c.fill(); }
  if (side) arm(-2 + sw * 0.8 * sx, 0);
  if (L.plait && dir === 'up') { c.fillStyle = L.hair; for (let i = 0; i < 6; i++) circle(c, 0, -30 + i * 3.4, 2.8 - i * 0.25); c.fillStyle = '#f7f3e6'; for (let i = 0; i < 5; i++) circle(c, -3 + i * 1.5, -36.5 + Math.abs(i - 2) * 0.6, 1); }
  // head
  const hx = side ? sx * 0.8 : 0;
  if (L.bun && dir !== 'up') { c.fillStyle = L.hair; circle(c, side ? -sx * 6 : 0, -38.5, 3.8); }
  c.fillStyle = L.skin; circle(c, hx, -33, 7.6);
  c.fillStyle = L.hair;
  if (dir === 'up') { circle(c, hx, -33.5, 7.9); if (L.bun) circle(c, 0, -36, 4); }
  else if (L.bald) { c.beginPath(); c.arc(hx, -33, 7.9, Math.PI * 0.95, Math.PI * 1.15); c.arc(hx, -33, 7.9, Math.PI * 1.85, Math.PI * 2.05); c.fill(); }
  else if (side) { c.beginPath(); c.arc(hx - sx * 0.8, -34, 7.9, Math.PI, 0); c.fill(); c.beginPath(); c.arc(hx - sx * 3, -32, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = L.skin; circle(c, hx + sx * 2, -31.5, 5.6); }
  else { c.beginPath(); c.arc(hx, -34.2, 7.9, Math.PI, 0); c.fill(); c.fillRect(hx - 7.9, -34.5, 2.2, 4); c.fillRect(hx + 5.7, -34.5, 2.2, 4); }
  if (dir !== 'up') {
    c.fillStyle = '#1b1210';
    if (side) circle(c, hx + sx * 4.2, -32.5, 1.05);
    else { circle(c, hx - 2.8, -32.5, 1.05); circle(c, hx + 2.8, -32.5, 1.05); }
    if (L.beard) { c.fillStyle = L.beard; c.beginPath(); c.arc(hx + (side ? sx * 2 : 0), -30, 5.5, 0.1 * Math.PI, 0.9 * Math.PI); c.fill(); }
    if (L.mustache) { c.fillStyle = L.hair === '#e4e1da' ? '#cfcac0' : '#1b1210'; c.fillRect(hx + (side ? sx * 2 : -2.6), -29.6, side ? 3.4 : 5.2, 1.3); }
    if (talking) { const o = (Math.sin(G.t * 22) + 1) * 0.6 + 0.3; c.fillStyle = '#5a2620'; ellipse(c, hx + (side ? sx * 3.5 : 0), -27.8, 1.5, o); }
  }
  c.restore();
}
function npcDraw(lookKey) { return (c, o) => drawPerson(c, o.x, o.y, LOOKS[lookKey], o.dir || 'down', o.walk || 0, !!o.moving, G.speaking === o.voice, !!o.sitting); }

function drawHen(c, h) {
  const step = h.walk ? Math.sin(h.walk) * 1.5 : 0;
  const peck = !h.follow && h.wait > 0 ? Math.max(0, Math.sin(h.peck * 7)) * 3 : 0;
  c.save(); c.translate(Math.round(h.x), Math.round(h.y)); if (h.flip) c.scale(-1, 1);
  shade(c, 0, 0, 7, 2.5);
  c.strokeStyle = '#d8902a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-1, -3); c.lineTo(-1 + step, 0); c.moveTo(2, -3); c.lineTo(2 - step, 0); c.stroke();
  c.fillStyle = h.red ? '#8a3a1e' : '#d9d2c4'; c.beginPath(); c.moveTo(-6, -7); c.lineTo(-10, -13); c.lineTo(-4, -9); c.fill();
  c.fillStyle = h.color; ellipse(c, 0, -6, 7, 4.8);
  c.fillStyle = h.red ? '#9c4424' : '#e8e1d4'; ellipse(c, -1, -6.5, 3.8, 2.6);
  c.fillStyle = h.color; circle(c, 5, -10 + peck, 3);
  c.fillStyle = '#d6332a'; ellipse(c, 5, -13.3 + peck, 1.8, 1.4); ellipse(c, 6.5, -8.6 + peck, 0.9, 1.2);
  c.fillStyle = '#e8a33a'; c.beginPath(); c.moveTo(7.5, -10.5 + peck); c.lineTo(10, -9.5 + peck); c.lineTo(7.5, -9 + peck); c.fill();
  c.fillStyle = '#111'; circle(c, 5.8, -10.6 + peck, 0.7);
  c.restore();
}
function drawDog(c, x, y) { c.save(); c.translate(x, y); shade(c, 0, 0, 9, 3); c.fillStyle = '#b07a44'; ellipse(c, 0, -6, 9, 4.5); circle(c, 8, -10, 4); c.fillStyle = '#6e4826'; ellipse(c, 9, -13, 2, 3); c.restore(); }

// ---------- Plants ----------
function drawPalm(c, x, y, h = 80, lean = 12, seed = 1) {
  const sway = Math.sin(G.t * 0.9 + seed) * 2.2;
  const tx = x + lean + sway * 0.4, ty = y - h;
  c.save();
  c.fillStyle = 'rgba(0,0,0,.13)'; ellipse(c, x + lean * 0.8 + 18, y + 4, 28, 9);
  shade(c, x, y, 5, 2, 0.25);
  // trunk
  c.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const t0 = i / 10, t1 = (i + 1) / 10;
    const p = t => [x + (lean * 0.15) * 2 * t * (1 - t) * 4 + (tx - x) * t * t, y - h * t];
    const [ax, ay] = p(t0), [bx, by] = p(t1);
    c.strokeStyle = i % 2 ? '#7d654e' : '#6c5642'; c.lineWidth = 6.5 - t0 * 2.5;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
  }
  // fronds
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + seed;
    const len = 34 + hash(seed * 10 + i) * 8;
    const ex = tx + Math.cos(a) * len + sway * (1 + hash(i)), ey = ty + Math.sin(a) * len * 0.5 + 12;
    const mx = tx + Math.cos(a) * len * 0.5, my = ty + Math.sin(a) * len * 0.25 - 8;
    const nx = -Math.sin(a), ny = Math.cos(a) * 0.5;
    c.fillStyle = i % 2 ? '#3f7a32' : '#4f8f3a';
    c.beginPath(); c.moveTo(tx, ty);
    c.quadraticCurveTo(mx + nx * 7, my + ny * 7, ex, ey);
    c.quadraticCurveTo(mx - nx * 7, my - ny * 7, tx, ty); c.fill();
    c.strokeStyle = '#2f5d25'; c.lineWidth = 1; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
  }
  c.fillStyle = '#5b6b2a'; circle(c, tx - 3, ty + 3, 3.2); circle(c, tx + 3, ty + 4, 3.2); c.fillStyle = '#6a7a30'; circle(c, tx, ty + 6, 3.2);
  c.restore();
}
function drawBanana(c, x, y, seed = 1, scale = 1) {
  const sway = Math.sin(G.t * 1.2 + seed) * 0.08;
  c.save(); c.translate(x, y); c.scale(scale, scale);
  shade(c, 0, 0, 14, 5, 0.18);
  c.fillStyle = '#86995a'; rr(c, -3.5, -30, 7, 30, 3);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * 0.55 + sway + (hash(seed + i) - 0.5) * 0.3;
    c.save(); c.translate(0, -30); c.rotate(a);
    c.fillStyle = i % 2 ? '#6fae44' : '#82bd4f';
    c.beginPath(); c.ellipse(16, 0, 18, 6.5, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#4e8a2e'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(33, 0); c.stroke();
    c.restore();
  }
  c.restore();
}
function drawMango(c, x, y, r = 50) {
  c.save();
  c.fillStyle = 'rgba(0,0,0,.16)'; ellipse(c, x + 10, y + 2, r * 0.95, r * 0.35);
  c.fillStyle = '#5a412c'; rr(c, x - 5, y - 40, 10, 40, 3);
  const blobs = [[0, -62, 1], [-r * 0.55, -48, 0.7], [r * 0.55, -50, 0.72], [-r * 0.3, -82, 0.7], [r * 0.32, -80, 0.68], [0, -40, 0.6]];
  c.fillStyle = '#2b5426'; for (const [bx, by, s] of blobs) circle(c, x + bx, y + by, r * 0.55 * s + 6);
  c.fillStyle = '#376a2e'; for (const [bx, by, s] of blobs) circle(c, x + bx - 3, y + by - 4, r * 0.48 * s);
  c.fillStyle = '#4a8139'; for (const [bx, by, s] of blobs) circle(c, x + bx - 7, y + by - 9, r * 0.26 * s);
  c.restore();
}
function drawBush(c, x, y, col = '#3f7a32', r = 9) { shade(c, x, y + 1, r, 3, 0.15); c.fillStyle = col; circle(c, x - r * 0.5, y - r * 0.6, r * 0.7); circle(c, x + r * 0.5, y - r * 0.6, r * 0.7); circle(c, x, y - r, r * 0.75); c.fillStyle = 'rgba(255,255,255,.08)'; circle(c, x - 2, y - r * 1.2, r * 0.35); }
function drawCurryPlant(c, x, y) { drawBush(c, x, y, '#2f6b2a', 11); c.fillStyle = '#4c9a3a'; for (let i = 0; i < 14; i++) { const a = hash(i) * 6.28, d = hash(i + 9) * 9; ellipse(c, x + Math.cos(a) * d, y - 10 + Math.sin(a) * d * 0.7, 2, 1.1); } }
function drawBamboo(c, x, y) { shade(c, x, y, 18, 5, 0.18); for (let i = 0; i < 7; i++) { const bx = x - 14 + i * 4.5, h = 70 + hash(i) * 30, lean = (i - 3) * 4 + Math.sin(G.t + i) * 1.5; c.strokeStyle = i % 2 ? '#8fae4a' : '#a3bf55'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, y); c.quadraticCurveTo(bx, y - h / 2, bx + lean, y - h); c.stroke(); c.fillStyle = '#6a9a3a'; for (let k = 1; k < 5; k++) { ellipse(c, bx + lean * k / 5 + 4, y - h * k / 5, 6, 1.6); } } }

// ---------- Buildings ----------
function tileRoof(c, x, y, w, h, inset = 0.28, col = '#b2513a') {
  // hipped roof seen from above at an angle
  const ix = w * inset;
  c.fillStyle = col;
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + w, y + h); c.lineTo(x + w - ix, y + h * 0.35); c.lineTo(x + ix, y + h * 0.35); c.closePath(); c.fill();
  c.fillStyle = shadeCol(col, -18);
  c.beginPath(); c.moveTo(x, y + h); c.lineTo(x + ix, y + h * 0.35); c.lineTo(x + ix, y); c.lineTo(x, y + h * 0.1); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(x + w, y + h); c.lineTo(x + w - ix, y + h * 0.35); c.lineTo(x + w - ix, y); c.lineTo(x + w, y + h * 0.1); c.closePath(); c.fill();
  c.fillStyle = shadeCol(col, -8); c.fillRect(x + ix, y, w - ix * 2, h * 0.35);
  // tile rows
  c.strokeStyle = 'rgba(60,20,10,.35)'; c.lineWidth = 1;
  for (let yy = y + 5; yy < y + h; yy += 5) { c.beginPath(); c.moveTo(x + 2, yy); c.lineTo(x + w - 2, yy); c.stroke(); }
  c.strokeStyle = 'rgba(255,200,170,.12)';
  for (let xx = x + 4; xx < x + w; xx += 7) { c.beginPath(); c.moveTo(xx, y + h * 0.35); c.lineTo(xx, y + h); c.stroke(); }
  c.fillStyle = '#6e2c1f'; c.fillRect(x + ix, y + h * 0.35 - 2, w - ix * 2, 3);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x, y + h, w, 4);
}
function shadeCol(hex, amt) { const n = parseInt(hex.slice(1), 16); const r = clamp((n >> 16) + amt, 0, 255), g = clamp(((n >> 8) & 255) + amt, 0, 255), b = clamp((n & 255) + amt, 0, 255); return `rgb(${r},${g},${b})`; }
function sign(c, x, y, w, text, en, bg = '#1f4f7a', fg = '#fff') {
  c.fillStyle = '#2a2018'; c.fillRect(x + 2, y - 2, w - 4, 2);
  c.fillStyle = bg; rr(c, x, y, w, 15, 2);
  c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `600 9px ${ML_FONT}`; c.fillText(text, x + w / 2, y + 6);
  if (en) { c.font = `600 5px Inter, sans-serif`; c.fillText(en, x + w / 2, y + 12.2); }
}
function wallFace(c, x, y, w, h, col = '#efe5cf') {
  c.fillStyle = col; c.fillRect(x, y, w, h);
  c.fillStyle = '#9b4b33'; c.fillRect(x, y + h - 6, w, 6);
  c.fillStyle = 'rgba(0,0,0,.06)'; for (let i = 0; i < w; i += 9) c.fillRect(x + i, y, 1, h - 6);
}
function woodWindow(c, x, y, w = 14, h = 14, open = false) {
  c.fillStyle = '#4b2e1c'; c.fillRect(x - 1, y - 1, w + 2, h + 2);
  c.fillStyle = open ? '#f3d58f' : '#2a1b12'; c.fillRect(x, y, w, h);
  c.fillStyle = '#6a4127'; for (let i = 2; i < w; i += 3) c.fillRect(x + i, y, 1.2, h);
}
function drawShop(c, x, y, w, h, roofCol, wallCol, text, en, signBg) {
  shade(c, x + w / 2, y + h + 2, w / 2 + 4, 5, 0.18);
  wallFace(c, x, y + h * 0.45, w, h * 0.55, wallCol);
  // shutter / open front
  c.fillStyle = '#3b2a1e'; c.fillRect(x + 6, y + h * 0.55, w - 12, h * 0.45 - 6);
  c.fillStyle = 'rgba(255,220,150,.25)'; c.fillRect(x + 7, y + h * 0.56, w - 14, 4);
  tileRoof(c, x - 4, y, w + 8, h * 0.48, 0.15, roofCol);
  sign(c, x + 6, y + h * 0.48 - 8, w - 12, text, en, signBg);
}

// ---------- Chapter 3 additions ----------
Object.assign(LOOKS, {
  raghavan: { skin: '#b07a52', hair: '#221c18', shirt: '#fbfaf5', lower: 'mundu', lowerColor: '#fbf8f0', border: '#d9b45a', mustache: true, chain: true },
  sasi:     { skin: '#9a6644', hair: '#1a1410', shirt: '#3e5f8a', lower: 'pants', lowerColor: '#2e3a4a', mustache: true, grease: true },
});
function drawWeed(c, x, y, s = 1, seed = 1) {
  shade(c, x, y, 14 * s, 4 * s, 0.15);
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI / 2 + (hash(seed + i) - 0.5) * 1.8 + Math.sin(G.t * 1.5 + i) * 0.05, l = (14 + hash(i * 3 + seed) * 14) * s;
    c.strokeStyle = i % 3 ? '#4f7f2a' : '#6f9a38'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x + (hash(i + seed) - 0.5) * 10 * s, y); c.quadraticCurveTo(x + Math.cos(a) * l * 0.4, y + Math.sin(a) * l * 0.6, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
  }
  c.fillStyle = '#d8c060'; for (let i = 0; i < 3; i++) circle(c, x - 6 + hash(i + seed) * 12, y - 18 * s - hash(i) * 6, 1.6);
}
function drawBranch(c, x, y, seed = 1) {
  shade(c, x, y + 2, 14, 3, 0.15);
  c.strokeStyle = '#6a4a2c'; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - 14, y + 2); c.lineTo(x + 14, y - 3); c.stroke();
  c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 2, y); c.lineTo(x + 4, y - 9); c.moveTo(x + 6, y - 1); c.lineTo(x + 12, y + 5); c.stroke();
  c.fillStyle = '#8a7a3a'; ellipse(c, x + 4, y - 10, 3, 1.5);
}
function drawCrop(c, x, y, crop, stage, watered) {
  c.fillStyle = watered ? '#3e2a1a' : '#6a4a2e'; ellipse(c, x, y, 13, 5);
  if (stage === 0) { c.fillStyle = '#4a3020'; ellipse(c, x, y - 1, 6, 2.5); if (crop === 'tapioca') { c.strokeStyle = '#7a5a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y - 10); c.stroke(); } if (crop === 'tomato' || crop === 'banana') stake(); return; }
  const g = stage >= 2 ? 1.6 : 1;
  if (crop === 'cheera') { for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#a8324a' : '#6a9a3a'; ellipse(c, x - 7 + i * 3.5, y - 4 * g, 2.5 * g, 1.6 * g); } }
  else if (crop === 'chilli') { c.strokeStyle = '#3f7a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 9 * g); c.stroke(); c.fillStyle = '#4f9a38'; ellipse(c, x - 3, y - 8 * g, 3, 1.6); ellipse(c, x + 3, y - 6 * g, 3, 1.6); if (stage >= 2) { c.fillStyle = '#d6332a'; ellipse(c, x + 2, y - 3 * g, 1, 2.5); } }
  else if (crop === 'tomato') { stake(); c.fillStyle = '#4f9a38'; ellipse(c, x - 2, y - 7 * g, 3, 2); ellipse(c, x + 2, y - 11 * g, 3, 2); }
  else if (crop === 'tapioca') { c.strokeStyle = '#7a5a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y - 12 * g); c.stroke(); c.fillStyle = '#5aa040'; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; ellipse(c, x + 1 + Math.cos(a) * 5 * g, y - 12 * g + Math.sin(a) * 4 * g, 3, 1.2); } }
  else if (crop === 'banana') { drawBanana(c, x, y, 7, 0.3 * g); }
  function stake() { c.strokeStyle = '#a3bf55'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 4, y); c.lineTo(x + 4, y - 22); c.stroke(); }
}
