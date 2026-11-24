// ===== Nammude Naadu — Chapter 5: Poottiya Muri (The Locked Room) =====
// The overgrown mill path, the burned rice mill, the locked room, Thomas Chettan's radio shop, the cassette, the envelope.

Object.assign(LOOKS, {
  thomas: { skin: '#a8724e', hair: '#e4e1da', shirt: '#b8c4a0', lower: 'mundu', lowerColor: '#f4f1e8', mustache: true, beard: '#e8e5df' },
  kabeer: { skin: '#9e6a46', hair: '#f2f0ea', shirt: '#e6e2d4', lower: 'mundu', lowerColor: '#2f7a5a', check: true, beard: '#4a4038' },
  latha:  { skin: '#b37a55', hair: '#17110d', bun: true, shirt: '#f6f6f2', lower: 'mundu', lowerColor: '#7aa8c8', neriyathu: '#7aa8c8', border: '#2f5f8a' },
});
Object.assign(ITEM, {
  torch: 'Flashlight (no batteries)', batteries: 'Batteries', husk: 'Coconut husk', rope: 'Coir rope', crowbar: 'Crowbar', firstaid: 'First-aid kit',
  recorder: 'Cassette recorder (broken)', ledger: 'Original ledger', fatherphoto: "Achan's photograph", oldbelt: 'Old rubber belt (sample)', belt: 'Flat rubber belt', millphoto: 'Photograph of Arjun at the mill',
});
RECIPES.unshift({ id: 'rope', out: 'rope', name: 'Coir rope', mats: { husk: 3 }, unlocked: () => active('k_rope') && !has('rope'), work: 'Beating the husk, twisting the fibre', after: () => done('k_rope') });

// ======================= VILLAGE ADDITIONS =======================
G.maps.village.solidsPx.push(...[[33.9, 2, 3.7, 2], [38.6, 29.2, 4.6, 2], [38.6, 35, 5, 2]].map(([x, y, w, h]) => ({ x: x * T, y: y * T, w: w * T, h: h * T })));
{
  const vp = G.maps.village.paint;
  G.maps.village.paint = (c, m) => {
    vp(c, m);
    const dirt = (x, y, w, h, s) => { c.fillStyle = '#b5653f'; c.fillRect(x * T, y * T, w * T, h * T); grain(c, x * T, y * T, w * T, h * T, ['#a3583a', '#c37450', '#8f4a2f'], w * h * 16, 3, s); };
    dirt(37, 31.2, 6.2, 1, 81);
    // scrap yard ground
    c.fillStyle = '#8d7a5c'; c.fillRect(37 * T, 36.8 * T, 7.4 * T, 4.6 * T); grain(c, 37 * T, 36.8 * T, 7.4 * T, 4.6 * T, ['#7d6c50', '#9a876a', '#6a5a44', '#a0522d'], 700, 3, 83);
    // the old mill road, half swallowed by grass
    dirt(35.2, 44, 1.7, 10, 85);
    c.fillStyle = '#5c8c3c'; for (let i = 0; i < 70; i++) circle(c, (35 + hash(i + 840) * 2) * T, (45 + hash(i + 860) * 9) * T, 3 + hash(i) * 6);
  };
}
// pharmacy
addObj('village', { x: 33.9, y: 0.3, w: 3.7, h: 3.7, sortY: 4, occ: [33.6, 0, 4.3, 4], draw(c, o) { drawShop(c, o.x, o.y, o.w, o.h, '#4f7f6a', '#eef2ea', 'ലത മെഡിക്കൽസ്', 'LATHA MEDICALS', '#1f7a4a'); c.fillStyle = '#2f9a55'; c.fillRect(o.x + o.w / 2 - 2, o.y + 10, 4, 14); c.fillRect(o.x + o.w / 2 - 7, o.y + 15, 14, 4); } });
addObj('village', Object.assign(hooked('latha'), { id: 'latha', npc: true, x: 35.75 * T, y: 4.4 * T, dir: 'down', voice: 'latha', draw: npcDraw('latha') }));
// Thomas Chettan's radio shop
addObj('village', { x: 38.6, y: 27.6, w: 4.6, h: 3.6, sortY: 31.2, occ: [38.2, 27.4, 5.4, 3.8], draw(c, o) {
  drawShop(c, o.x, o.y, o.w, o.h, '#8a4a38', '#d8cfb4', 'തോമസ് റേഡിയോ സർവീസ്', 'THOMAS RADIO SERVICE · 1968', '#3a2a5a');
  c.strokeStyle = '#777'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(o.x + 20, o.y + 14); c.lineTo(o.x + 20, o.y - 30); c.moveTo(o.x + 8, o.y - 28); c.lineTo(o.x + 32, o.y - 28); c.moveTo(o.x + 11, o.y - 22); c.lineTo(o.x + 29, o.y - 22); c.stroke();
  for (let i = 0; i < 3; i++) { c.fillStyle = ['#8a5a36', '#5a4a3a', '#a08a5a'][i]; rr(c, o.x + 14 + i * 40, o.y + o.h - 26, 28, 16, 3); c.fillStyle = '#e8dcb0'; c.fillRect(o.x + 18 + i * 40, o.y + o.h - 22, 12, 4); c.fillStyle = '#222'; circle(c, o.x + 36 + i * 40, o.y + o.h - 17, 3); }
} });
addObj('village', { x: 40.1, y: 31.1, w: 1.6, h: 0.7, label: "Enter Thomas Chettan's radio shop", act: async () => { if (!S.radioOpen) { await think('A board hangs on the door: "Gone for lunch". A radio is still playing inside.', 2400); return; } await goto('radioshop', 5, 6.9, 'up'); } });
// Kabeer's scrap yard
addObj('village', { x: 38.6, y: 33.6, w: 5, h: 3.4, sortY: 37, occ: [38.2, 33.4, 5.8, 3.6], draw(c, o) {
  shade(c, o.x + o.w / 2, o.y + o.h, o.w / 2, 5);
  c.fillStyle = '#8a8f92'; c.fillRect(o.x + 4, o.y + 34, o.w - 8, o.h - 34); c.fillStyle = 'rgba(150,70,30,.35)'; for (let i = 0; i < 12; i++) c.fillRect(o.x + 6 + i * 13, o.y + 40 + hash(i) * 20, 7, 24 + hash(i + 4) * 20);
  c.fillStyle = '#2a1e14'; c.fillRect(o.x + 24, o.y + 52, o.w - 48, o.h - 52);
  c.fillStyle = '#7a8288'; c.fillRect(o.x - 4, o.y + 14, o.w + 8, 24); c.strokeStyle = '#5c6468'; for (let i = 0; i < 28; i++) { c.beginPath(); c.moveTo(o.x - 2 + i * 6, o.y + 14); c.lineTo(o.x - 2 + i * 6, o.y + 38); c.stroke(); }
  c.fillStyle = 'rgba(150,70,30,.4)'; for (let i = 0; i < 7; i++) c.fillRect(o.x + hash(i + 12) * o.w, o.y + 15, 10, 20);
  sign(c, o.x + 20, o.y + 36, o.w - 40, 'കബീർ ആക്രിക്കട', 'KABEER SCRAP', '#5a2a1a');
} });
addObj('village', Object.assign(hooked('kabeer'), { id: 'kabeer', npc: true, x: 37.8 * T, y: 38.4 * T, dir: 'right', voice: 'kabeer', draw: npcDraw('kabeer') }));
const SCRAP = [[39.3, 38.2], [41.2, 37.9], [43.2, 38.3], [40.1, 40.1], [42.4, 40.2]];
const SCRAP_NOTE = [
  'A sewing machine with its belt still on. Too long, and round like a rope.',
  'Bicycle tubes, a burst pressure cooker, the back half of a ceiling fan. No belt.',
  'A grinder belt. The right length, but as thick as my thumb. Thomas Chettan said thin.',
  'An old television with a nest of baby squirrels inside. I put it back gently.',
  'A Walkman, crushed on one side. Inside, a small rubber belt. Flat, thin, and the same size as the sample!',
];
SCRAP.forEach(([x, y], i) => addObj('village', { x: x - 0.7, y: y - 0.4, w: 1.4, h: 0.8, solid: true, draw(c, o) {
  const X = o.x + o.w / 2, Y = o.y + o.h; shade(c, X, Y, 24, 6);
  for (let k = 0; k < 11; k++) { c.save(); c.translate(X + (hash(k + i * 11) - 0.5) * 36, Y - 4 - hash(k + i * 5) * 18); c.rotate(hash(k * 3 + i) * 3); c.fillStyle = ['#8a4a2a', '#6a7076', '#9aa2a8', '#4a4e52', '#a86a3a'][(k + i) % 5]; if (k % 3) c.fillRect(-8, -2.5, 16, 5); else { c.beginPath(); c.arc(0, 0, 6, 0, 6.28); c.lineWidth = 2; c.strokeStyle = c.fillStyle; c.stroke(); } c.restore(); }
  if (i === 1) { c.strokeStyle = '#333'; c.lineWidth = 2; c.beginPath(); c.arc(X - 8, Y - 18, 9, 0, 6.28); c.stroke(); }
  if (i === 3) { c.fillStyle = '#4a3a2a'; rr(c, X - 14, Y - 26, 26, 20, 3); c.fillStyle = '#2a3a3a'; rr(c, X - 11, Y - 23, 17, 14, 4); }
}, label: 'Search the scrap heap', when: () => active('k_belt') && !S['scrap' + i] && !!S.metKabeer, act: async () => {
  await hold('Digging through the scrap', 1500, AudioSys.sfx.knock); S['scrap' + i] = true;
  // the Walkman always turns up by the fourth heap at the latest
  const tried = SCRAP.filter((_, k) => S['scrap' + k]).length, win = tried >= 4 || (tried >= 2 && Math.random() < 0.4);
  if (win) { await think(SCRAP_NOTE[4], 3400); give('belt'); G.cash -= 40; toast('− ₹40'); done('k_belt'); await say('c5_kab2'); clearHook('kabeer'); }
  else await think(SCRAP_NOTE[(S.scrapN = (S.scrapN || 0) + 1) - 1], 3000);
} }));
// coconut husks by the well, and the old mill road
addObj('village', { x: 14.6, y: 21.6, w: 1.1, h: 0.6, visible: () => !!S.huskOn && !S.huskTaken, draw(c, o) { shade(c, o.x + 17, o.y + 18, 18, 5); for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#8a6238' : '#6f4c2a'; ellipse(c, o.x + 4 + hash(k) * 28, o.y + 16 - hash(k + 3) * 14, 8, 5); } },
  label: 'Take soaked coconut husks', when: () => active('k_rope'), act: async () => { S.huskTaken = true; give('husk', 3); toast('Press C to craft coir rope'); } });
addObj('village', { x: 34.2, y: 44.4, w: 0.6, h: 0.5, sortY: 44.9, draw(c, o) { c.fillStyle = '#6a4d30'; c.fillRect(o.x + 8, o.y - 26, 4, 42); c.save(); c.translate(o.x + 10, o.y - 18); c.rotate(0.08); c.fillStyle = '#8a6a44'; rr(c, -24, -7, 44, 13, 2); c.fillStyle = '#2a1a0e'; c.font = `600 7px ${ML_FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('മിൽ റോഡ് ↓', -2, 0); c.restore(); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; } });
addObj('village', { x: 35, y: 53, w: 2, h: 0.8, label: 'Take the old mill road', act: async () => {
  if (!S.millRoad) { await think('The old mill road. Fallen trees, thorns, and nobody has walked it in years. I would need proper tools.', 3000); return; }
  await goto('millpath', 1.2, 8.6, 'right');
} });
// the envelope on the doorstep
addObj('village', Object.assign(hooked('envelope', { visible: () => !!S.envelopeOn }), { x: 21.75, y: 24.0, w: 0.6, h: 0.5, sortY: 23.4, draw(c, o) { shade(c, o.x + 9, o.y + 12, 10, 3); c.fillStyle = '#d8c08a'; c.fillRect(o.x, o.y, 20, 13); c.strokeStyle = '#a88a52'; c.lineWidth = 1; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x + 10, o.y + 7); c.lineTo(o.x + 20, o.y); c.stroke(); } }));

// ======================= THE MILL PATH =======================
const K_VEG = [[4.6, 1], [9.8, 2], [17.2, 3], [29.6, 4]], K_TREES = [[13.2, 'lever'], [26, 'rope']];
function kCount(prefix, n, id, text) { const k = [...Array(n).keys()].filter(i => S[prefix + i]).length; setObjText(id, `${text} (${k}/${n})`); if (k === n) done(id); }
function fallenTree(c, x, y, len, rot, seed) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.fillStyle = 'rgba(0,0,0,.22)'; ellipse(c, 6, 6, 18, len / 2);
  c.fillStyle = '#5a4230'; rr(c, -9, -len / 2, 18, len, 7); c.fillStyle = '#6d523c'; rr(c, -7, -len / 2, 7, len, 4);
  c.strokeStyle = 'rgba(30,18,8,.5)'; c.lineWidth = 1; for (let i = 0; i < 12; i++) { const yy = -len / 2 + 8 + i * (len - 16) / 11; c.beginPath(); c.moveTo(-7, yy); c.lineTo(5 + hash(i + seed) * 3, yy + 3); c.stroke(); }
  c.fillStyle = '#3f7a32'; for (let i = 0; i < 5; i++) ellipse(c, -9 + hash(i + seed) * 16, -len / 2 + hash(i * 3 + seed) * len, 5, 3);
  c.strokeStyle = '#5a4230'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { const s = i % 2 ? 1 : -1, yy = -len * 0.35 + i * len * 0.17; c.beginPath(); c.moveTo(0, yy); c.lineTo(s * 26, yy - 14); c.stroke(); }
  c.fillStyle = '#4f7a35'; for (let i = 0; i < 5; i++) { const s = i % 2 ? 1 : -1, yy = -len * 0.35 + i * len * 0.17; circle(c, s * 28, yy - 16, 8 + hash(i + seed) * 5); }
  c.restore();
}
function tallTree(c, x, y, seed) { const r = 34 + hash(seed) * 16; drawMango(c, x, y, r); }
defMap('millpath', {
  w: 48, h: 16, outdoor: true, bg: '#22361a',
  solids: [[0, 0, 32, 5], [0, 12, 32, 4], [32, 0, 3, 5.4], [35, 0, 11, 7.6], [46, 0, 2, 16], [32, 13.6, 16, 2.4], [21, 0, 3, 7.4], [21, 9.6, 3, 6.4]],
  paint(c) {
    const W = 48 * T, Hh = 16 * T;
    c.fillStyle = '#47702f'; c.fillRect(0, 0, W, Hh); grain(c, 0, 0, W, Hh, ['#3f662a', '#527d37', '#3a5f27', '#5d8a40'], 9000, 3, 51);
    c.fillStyle = '#9a5a3a'; c.fillRect(0, 7.2 * T, 36 * T, 2.6 * T); grain(c, 0, 7.2 * T, 36 * T, 2.6 * T, ['#8a4f34', '#a86848', '#7a4630', '#5c8c3c'], 2600, 3, 52);
    c.fillStyle = '#47702f'; for (let i = 0; i < 150; i++) circle(c, hash(i + 10) * 34 * T, (hash(i + 20) > 0.5 ? 7.2 : 9.8) * T + (hash(i + 30) - 0.5) * 20, 5 + hash(i) * 8);
    // deep forest shade on both sides
    for (const [y0, y1] of [[6.2, 1.5], [10.8, 15]]) { const g = c.createLinearGradient(0, y0 * T, 0, y1 * T); g.addColorStop(0, 'rgba(10,24,8,0)'); g.addColorStop(1, 'rgba(10,24,8,.72)'); c.fillStyle = g; c.fillRect(0, Math.min(y0, y1) * T - 3 * T * (y1 < y0), 34 * T, Math.abs(y1 - y0) * T + 3 * T); }
    c.fillStyle = 'rgba(10,24,8,.55)'; c.fillRect(34 * T, 14 * T, 14 * T, 2 * T); c.fillRect(46.4 * T, 0, 1.6 * T, Hh);
    // yard
    c.fillStyle = '#8a7a5c'; c.beginPath(); c.ellipse(40 * T, 10 * T, 7 * T, 3.4 * T, 0, 0, 6.28); c.fill(); grain(c, 33.5 * T, 7.4 * T, 12.4 * T, 5.8 * T, ['#7d6e52', '#968668', '#5c8c3c', '#6a5a44'], 1600, 3, 53);
    c.fillStyle = 'rgba(20,16,12,.35)'; for (let i = 0; i < 10; i++) ellipse(c, (36 + hash(i + 70) * 9) * T, (7.8 + hash(i + 71) * 1.2) * T, 20 + hash(i) * 16, 7);
    // stream
    const g = c.createLinearGradient(21 * T, 0, 24 * T, 0); g.addColorStop(0, '#5a4a30'); g.addColorStop(0.12, '#2f6a68'); g.addColorStop(0.88, '#2f6a68'); g.addColorStop(1, '#5a4a30'); c.fillStyle = g; c.fillRect(21 * T, 0, 3 * T, Hh);
    c.fillStyle = '#7d7a70'; for (let i = 0; i < 26; i++) ellipse(c, (i % 2 ? 21.1 : 23.9) * T + (hash(i) - 0.5) * 12, hash(i + 5) * Hh, 6 + hash(i + 2) * 5, 4);
    for (let i = 0; i < 70; i++) drawBushStatic(c, hash(i + 100) * 32 * T, hash(i + 110) * 4.8 * T, i);
    for (let i = 0; i < 60; i++) drawBushStatic(c, hash(i + 120) * 46 * T, (13 + hash(i + 130) * 3) * T, i);
  },
  drawDynamicGround(c) {
    c.strokeStyle = 'rgba(210,240,235,.3)'; c.lineWidth = 1;
    for (let i = 0; i < 18; i++) { const y = ((hash(i) * 16 * T + G.t * 34) % (16 * T)), x = 21.4 * T + hash(i + 9) * 2.1 * T; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2, y + 10); c.stroke(); }
  },
  drawTop(c) {
    // drifting light and a few leaves
    for (let i = 0; i < 6; i++) { const x = (3 + i * 7.5) * T, g = c.createLinearGradient(x, 0, x + 90, 10 * T); g.addColorStop(0, 'rgba(255,245,200,.10)'); g.addColorStop(1, 'rgba(255,245,200,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 50, 0); c.lineTo(x + 150, 12 * T); c.lineTo(x + 60, 12 * T); c.fill(); }
    for (let i = 0; i < 12; i++) { const ph = (G.t * 0.06 + hash(i)) % 1; c.fillStyle = i % 2 ? '#a89a3a' : '#6f9a38'; c.save(); c.translate(hash(i + 7) * 46 * T + Math.sin(ph * 12 + i) * 16, ph * 15 * T); c.rotate(ph * 9 + i); c.fillRect(-2.5, -1, 5, 2); c.restore(); }
  },
  objs: [
    { x: 0, y: 7, w: 0.6, h: 3, label: 'Back to the village', act: () => goto('village', 36, 52.4, 'up') },
    ...[...Array(12).keys()].map(i => ({ x: 1 + i * 2.9 + hash(i + 3), y: 4.2 + hash(i) * 0.5, w: 0.4, h: 0.3, occ: [0.2 + i * 2.9, 1.4, 2.6, 3], visible: () => Math.abs(1 + i * 2.9 - 22.4) > 2, draw: (c, o) => tallTree(c, o.x, o.y, i) })),
    ...[...Array(13).keys()].map(i => ({ x: 0.4 + i * 2.6, y: 2.6 + hash(i + 40) * 0.5, w: 0.4, h: 0.3, visible: () => Math.abs(0.4 + i * 2.6 - 22.4) > 2, draw: (c, o) => tallTree(c, o.x, o.y, i + 50) })),
    ...[...Array(12).keys()].map(i => ({ x: 0.2 + i * 3.1, y: 15.4, w: 0.4, h: 0.3, occ: [-1.2 + i * 3.1, 12.2, 3.2, 3], visible: () => Math.abs(0.2 + i * 3.1 - 22.4) > 2, draw: (c, o) => tallTree(c, o.x, o.y, i + 70) })),
    ...[...Array(9).keys()].map(i => ({ x: 2 + i * 3.6, y: 13.6 + hash(i + 8) * 0.6, w: 0.4, h: 0.3, occ: [0.4 + i * 3.6, 10.6, 3.2, 3], visible: () => Math.abs(2 + i * 3.6 - 22.4) > 2, draw: (c, o) => tallTree(c, o.x, o.y, i + 20) })),
    ...K_VEG.map(([x, sd], i) => ({ x, y: 5, w: 1.6, h: 7, solid: true, sortY: 9, visible: () => !S['kv' + i],
      draw(c, o) { for (let k = 0; k < 24; k++) { const px = o.x + hash(k + sd * 9) * o.w, py = o.y + 8 + k * (o.h / 24); k % 3 ? drawWeed(c, px, py, 1.25, k + sd * 31) : drawBush(c, px, py, k % 2 ? '#2f5f28' : '#3a6f30', 11); } c.strokeStyle = '#3f5f2a'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(o.x - 4, o.y + k * 50 + 10); c.quadraticCurveTo(o.x + o.w / 2, o.y + k * 50 + 48, o.x + o.w + 6, o.y + k * 50 + 14); c.stroke(); } },
      label: 'Cut through the thicket', act: async () => { if (!has('sickle')) { await think('I need the sickle.'); return; } await hold('Cutting through the thicket', 2200, AudioSys.sfx.cut); AudioSys.sfx.rustle(); S['kv' + i] = true; kCount('kv', 4, 'k_veg', 'Cut through the thick vegetation'); } })),
    ...K_TREES.map(([x, how], i) => ({ x, y: 5, w: 1.1, h: 7, solid: true, sortY: () => (S['kt' + i] ? 5 * T : 9.4 * T), solidRect() { return S['kt' + i] ? { x: -999, y: -999, w: 0, h: 0 } : { x: this.x, y: this.y, w: this.w, h: this.h }; },
      draw(c, o) { if (S['kt' + i]) fallenTree(c, o.x + 40, 4.4 * T, 190, 1.35, i + 2); else fallenTree(c, o.x + o.w / 2, 8.5 * T, 236, i ? 0.12 : -0.1, i + 2); },
      when: () => !S['kt' + i],
      label: how === 'lever' ? 'Lever the fallen tree aside' : 'Drag the fallen tree away',
      act: async () => {
        if (how === 'lever') { if (!has('crowbar')) { await think('I need the crowbar.'); return; } await hold('Levering the trunk with the crowbar', 2800, AudioSys.sfx.knock); }
        else { if (!has('rope')) { await think('I need a rope.'); return; } await hold('Tying the coir rope and pulling', 2800, AudioSys.sfx.rustle); }
        AudioSys.sfx.dig(); S['kt' + i] = true; kCount('kt', 2, 'k_trees', 'Move the fallen trees');
      } })),
    { x: 20.8, y: 7.4, w: 3.4, h: 2.2, sortY: 0, solid: true, solidRect() { return S.bridgeDone ? { x: -999, y: -999, w: 0, h: 0 } : { x: 21 * T, y: 7.4 * T, w: 3 * T, h: 2.2 * T }; },
      draw(c, o) {
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(o.x, o.y + o.h, o.w, 5);
        c.fillStyle = '#4a3420'; c.fillRect(o.x, o.y + 4, o.w, 6); c.fillRect(o.x, o.y + o.h - 10, o.w, 6);
        for (let k = 0; k < 9; k++) { if (!S.bridgeTied && (k === 2 || k === 4 || k === 5)) continue; if (S.bridgeDone && k === 8) continue; c.save(); c.translate(o.x + 8 + k * 11.6, o.y + o.h / 2); c.rotate((hash(k + 5) - 0.5) * 0.14); c.fillStyle = k % 2 ? '#7a5a3a' : '#6b4e32'; c.fillRect(-4.6, -o.h / 2, 9.2, o.h); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(3, -o.h / 2, 1.6, o.h); c.restore(); }
        if (S.bridgeTied) { c.strokeStyle = '#c8a468'; c.lineWidth = 2.2; for (const yy of [o.y + 2, o.y + o.h - 2]) { c.beginPath(); c.moveTo(o.x - 6, yy); c.quadraticCurveTo(o.x + o.w / 2, yy + 8, o.x + o.w + 6, yy); c.stroke(); } }
        c.fillStyle = '#5a3f28'; for (const px of [o.x - 4, o.x + o.w]) { c.fillRect(px, o.y - 14, 5, 22); c.fillRect(px, o.y + o.h - 14, 5, 20); }
      },
      when: () => !S.bridgeDone, label: () => S.bridgeTied ? 'Cross the bridge, carefully' : 'Lash the broken planks with rope',
      act: async () => {
        if (!S.bridgeTied) { if (!has('rope')) { await think('Half the planks are gone. I need rope to lash what is left.'); return; } await hold('Lashing the planks with coir rope', 2600, AudioSys.sfx.knock); S.bridgeTied = true; await think('It might hold. One step at a time.', 2000); return; }
        await bridgeGame();
        S.bridgeDone = true; G.player.x = 24.7 * T; G.player.y = 8.6 * T; G.player.dir = 'right'; snapCam(); done('k_bridge');
        AudioSys.sfx.knock(); await think('The last plank splits under his foot. He grabs the post. A rusted nail is sticking out of it.', 3000);
        await say('c5_arj6');
        if (Obj.items.length) { setObj(Obj.title, Obj.items.filter(i => !i.done).map(i => [i.id, i.text])); Obj.items.unshift({ id: 'k_aid', text: 'Sit on the log and dress the cut (first-aid kit)', done: false }); renderObj(); }
      } },
    { x: 24.6, y: 10.6, w: 1.2, h: 0.7, solid: true, sortY: 11.3, draw(c, o) { shade(c, o.x + 20, o.y + 20, 24, 5); c.fillStyle = '#5f4530'; rr(c, o.x - 4, o.y + 4, 48, 16, 7); c.fillStyle = '#b89a70'; ellipse(c, o.x + 42, o.y + 12, 5, 8); },
      label: 'Dress the cut', when: () => active('k_aid'), act: async () => { if (!has('firstaid')) { await think('I need the first-aid kit.'); return; } await hold('Cleaning the cut, winding the bandage', 2200, AudioSys.sfx.rustle); take('firstaid'); S.bandaged = true; done('k_aid'); await think('Good thing I listened to Latha Chechi. And I will get that injection.', 2400); } },
    // the mill
    { x: 35, y: 0.4, w: 11, h: 7.2, sortY: 7.6, occ: [34.6, 0.2, 11.8, 7.2], draw(c, o) {
      const X = o.x, Y = o.y, W = o.w, Hh = o.h;
      c.fillStyle = '#6a5a4a'; c.fillRect(X + W - 64, Y - 24, 26, 110); c.fillStyle = '#3a2f28'; c.fillRect(X + W - 64, Y - 24, 26, 14); c.strokeStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(X + W - 64, Y - 8 + i * 8); c.lineTo(X + W - 38, Y - 8 + i * 8); c.stroke(); }
      wallFace(c, X + 4, Y + Hh * 0.45, W - 8, Hh * 0.55, '#a89a80');
      c.fillStyle = 'rgba(15,10,8,.6)'; for (let i = 0; i < 26; i++) { const bx = X + 8 + hash(i + 30) * (W - 40), bh = 14 + hash(i + 31) * 60; c.beginPath(); c.ellipse(bx, Y + Hh * 0.46 + bh * 0.4, 8 + hash(i) * 14, bh * 0.6, 0, 0, 6.28); c.fill(); }
      for (const wx of [0.9, 2.8, 7.2, 9.1]) { c.fillStyle = '#17110c'; c.fillRect(X + wx * T, Y + Hh * 0.58, 30, 34); c.strokeStyle = '#4a3a2a'; c.lineWidth = 2; c.strokeRect(X + wx * T, Y + Hh * 0.58, 30, 34); c.beginPath(); c.moveTo(X + wx * T + 4, Y + Hh * 0.58); c.lineTo(X + wx * T + 22, Y + Hh * 0.58 + 34); c.stroke(); }
      // roof with a burned-through hole
      tileRoof(c, X - 6, Y, W + 12, Hh * 0.46, 0.1, '#7a4a3a');
      c.fillStyle = '#16100c'; c.beginPath(); c.moveTo(X + 1.6 * T, Y + 70); c.lineTo(X + 2.4 * T, Y + 22); c.lineTo(X + 4.6 * T, Y + 14); c.lineTo(X + 5.6 * T, Y + 50); c.lineTo(X + 4.9 * T, Y + 88); c.lineTo(X + 3 * T, Y + 92); c.fill();
      c.strokeStyle = '#2a1c14'; c.lineWidth = 4; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(X + (2 + i * 0.75) * T, Y + 20); c.lineTo(X + (2.2 + i * 0.7) * T, Y + 92); c.stroke(); }
      sign(c, X + 2.6 * T, Y + Hh * 0.46 - 4, 6 * T, 'പുഴക്കര അരി മിൽ', 'PUZHAKKARA RICE MILL · P.R.M. · 1971', '#4a4438', '#b8ac90');
      const dx = X + 5 * T, dy = Y + Hh - 1.75 * T; c.fillStyle = '#2a1c12'; c.fillRect(dx - 3, dy - 3, 1.4 * T + 6, 1.75 * T + 3); c.fillStyle = S.millOpen ? '#080605' : '#5a3f2a'; c.fillRect(dx, dy, 1.4 * T, 1.75 * T);
      if (!S.millOpen) { c.fillStyle = '#7a5f42'; for (const [a, oy] of [[0.2, 12], [-0.18, 28], [0.1, 44]]) { c.save(); c.translate(dx + 0.7 * T, dy + oy); c.rotate(a); c.fillRect(-32, -4, 64, 8); c.fillStyle = '#333'; circle(c, -26, 0, 1.4); circle(c, 26, 0, 1.4); c.fillStyle = '#7a5f42'; c.restore(); } }
      c.fillStyle = '#3f7a2e'; for (let i = 0; i < 26; i++) circle(c, X + W - 30 + hash(i + 40) * 34, Y + Hh * 0.2 + hash(i + 41) * Hh * 0.78, 4 + hash(i + 42) * 4); for (let i = 0; i < 14; i++) circle(c, X + hash(i + 50) * 26, Y + Hh * 0.5 + hash(i + 51) * Hh * 0.5, 4 + hash(i) * 4);
    } },
    { x: 39.9, y: 7.4, w: 1.7, h: 0.7, label: () => S.millOpen ? 'Go into the mill' : 'Pry off the boards', act: async () => {
      if (!S.millOpen) { if (!has('crowbar')) { await think('Boards nailed across the door. I need the crowbar.'); return; } await hold('Prying the boards off', 2600, AudioSys.sfx.knock); S.millOpen = true; AudioSys.sfx.knock(); done('k_mill'); await say('c5_arj5'); return; }
      if (!has('flashlight')) { await think('It is pitch dark in there.'); return; }
      const first = !S.millIn; S.millIn = true;
      if (first) { AudioSys.sfx.rustle(); await sleep(350); cameraClick(); await think('A leaf rustles behind him, and something clicks. He turns. Nobody. A bird, perhaps.', 2800); }
      G.flashlight = true; await goto('mill', 11, 12.7, 'up');
    } },
    { x: 32.6, y: 11.6, w: 1.4, h: 0.8, sortY: 12.4, draw(c, o) { drawBush(c, o.x + 8, o.y + 22, '#2f5f28', 14); drawBush(c, o.x + 34, o.y + 24, '#3a6f30', 15); if (S.millLeft) { c.fillStyle = 'rgba(50,32,18,.7)'; for (let i = 0; i < 5; i++) { c.save(); c.translate(o.x + 48 + i * 9, o.y + 18 + (i % 2) * 6); c.rotate(0.3); ellipse(c, 0, 0, 4.5, 2.2); c.restore(); } } },
      label: 'Look at the marks behind the bush', when: () => !!S.millLeft && !S.sawTracks, act: async () => { S.sawTracks = true; await think('Shoe prints in the wet mud. Not mine. And the grass behind this bush is pressed flat, as if someone stood here a long time.', 3800); } },
  ],
});
function cameraClick() { AudioSys.sfx.shutter(); }

// ---------- Crossing the bridge (hold to step, let go when it creaks) ----------
function bridgeGame() {
  return new Promise(resolve => {
    const box = $('mini'), mc = $('mc'), m = mc.getContext('2d'); box.style.display = 'flex'; G.locked++;
    const N = 8; let pos = 0, strain = 0, step = 0, t = 0, last = performance.now(), fin = false, msg = 'Hold E to step  ·  let go when the plank creaks', slip = 0, creakT = 0;
    const weak = [...Array(N)].map((_, i) => 0.55 + hash(i + 3) * 0.5);
    G._bridge = { state: () => ({ pos, strain, step }) };
    const end = () => { fin = true; box.style.display = 'none'; G.locked--; resolve(); };
    function frame(now) {
      if (fin) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt; slip = Math.max(0, slip - dt); creakT -= dt;
      if (slip <= 0) {
        if (holding()) { step += dt * 0.95; strain += dt * weak[Math.min(N - 1, pos)] * 1.25; if (strain > 0.6 && creakT <= 0) { creakT = 0.35; AudioSys.sfx.creak(); } }
        else strain -= dt * 1.5;
        strain = clamp(strain, 0, 1);
        if (step >= 1) { step = 0; pos++; AudioSys.sfx.step('plank'); if (pos >= N) { return end(); } }
        if (strain >= 1) { slip = 0.9; strain = 0; step = 0; pos = Math.max(0, pos - 2); AudioSys.sfx.splash(); msg = 'Too fast! The plank dips and he jumps back.'; setTimeout(() => { msg = 'Hold E to step  ·  let go when the plank creaks'; }, 1400); }
      }
      draw(); requestAnimationFrame(frame);
    }
    function draw() {
      const W = 560, Hh = 360, g = m.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, '#6f9a78'); g.addColorStop(0.5, '#3f6a4a'); g.addColorStop(1, '#1f4040'); m.fillStyle = g; m.fillRect(0, 0, W, Hh);
      for (let i = 0; i < 14; i++) { m.fillStyle = i % 2 ? '#2c5030' : '#355d38'; m.beginPath(); m.arc(i * 44, 110 + hash(i) * 30, 36 + hash(i + 3) * 18, 0, 6.28); m.fill(); }
      m.fillStyle = '#2f6a68'; m.fillRect(0, 290, W, 70); m.strokeStyle = 'rgba(220,245,240,.4)'; for (let i = 0; i < 12; i++) { const x = (hash(i) * W + t * 60) % W; m.beginPath(); m.moveTo(x, 300 + hash(i + 2) * 50); m.lineTo(x + 24, 300 + hash(i + 2) * 50); m.stroke(); }
      m.fillStyle = '#5a4632'; m.fillRect(0, 222, 62, 138); m.fillRect(W - 62, 222, 62, 138); m.fillStyle = '#4f7f35'; m.fillRect(0, 216, 62, 9); m.fillRect(W - 62, 216, 62, 9);
      const px = i => 62 + (i + 0.5) * (436 / N), sag = x => Math.sin((x - 62) / 436 * Math.PI) * 20;
      for (let i = 0; i < N; i++) { const x = px(i), here = i === pos ? strain * 14 : 0; m.save(); m.translate(x, 222 + sag(x) + here); m.rotate(i === pos ? Math.sin(t * 40) * strain * 0.04 : 0); m.fillStyle = i === pos && strain > 0.6 ? '#a8562f' : '#7a5a3a'; m.fillRect(-24, 0, 48, 9); m.fillStyle = 'rgba(0,0,0,.25)'; m.fillRect(-24, 7, 48, 2); if (weak[i] > 0.85) { m.strokeStyle = '#2a1a0e'; m.beginPath(); m.moveTo(-8, 0); m.lineTo(-2, 5); m.lineTo(4, 2); m.lineTo(9, 9); m.stroke(); } m.restore(); }
      m.strokeStyle = '#c8a468'; m.lineWidth = 3; m.beginPath(); m.moveTo(56, 168); m.quadraticCurveTo(W / 2, 206, W - 56, 168); m.stroke(); m.fillStyle = '#4a3420'; m.fillRect(52, 160, 8, 66); m.fillRect(W - 60, 160, 8, 66);
      const ax = px(Math.min(N - 1, pos)) + (step - 0.5) * 40, ay = 222 + sag(ax) + strain * 14 + (slip > 0 ? -12 * Math.sin(slip * 3.4) : 0);
      m.save(); m.translate(ax, ay); m.scale(1.9, 1.9); drawPerson(m, 0, 0, outfitFor(G.player), 'right', step * 12, holding() && slip <= 0); m.restore();
      m.fillStyle = 'rgba(0,0,0,.6)'; m.fillRect(0, 0, W, 36); m.fillStyle = '#f5efe3'; m.font = '600 14px Inter, sans-serif'; m.textAlign = 'center'; m.fillText(msg, W / 2, 23);
      m.fillStyle = 'rgba(0,0,0,.5)'; m.fillRect(150, 48, 260, 14); m.fillStyle = strain > 0.75 ? '#e0503a' : strain > 0.5 ? '#e8b65a' : '#7ac06a'; m.fillRect(152, 50, 256 * strain, 10); m.fillStyle = '#e8dcc0'; m.font = '11px Inter, sans-serif'; m.fillText(`Strain   ·   plank ${Math.min(N, pos + 1)} of ${N}`, W / 2, 78);
      m.textAlign = 'left';
    }
    requestAnimationFrame(frame);
  });
}

// ======================= INSIDE THE MILL =======================
const K_SACKS = [[15.9, 1.7], [17.3, 2.0], [18.7, 1.7]];
function sackStack(c, x, y, seed) { shade(c, x, y + 4, 26, 7, 0.35); for (let k = 0; k < 5; k++) { const px = x + (k % 2 ? 11 : -11) * (k < 4 ? 1 : 0), py = y - Math.floor(k / 2) * 13; c.fillStyle = k % 2 ? '#8a7650' : '#9a8660'; ellipse(c, px, py - 5, 15, 9); c.strokeStyle = 'rgba(40,28,12,.4)'; c.lineWidth = 1; c.beginPath(); c.arc(px, py - 5, 9, 0.4, 2.4); c.stroke(); } c.fillStyle = 'rgba(40,28,12,.7)'; c.font = `600 5px ${ML_FONT}`; c.fillText('സംഘം 96', x - 14, y - 4); }
defMap('mill', {
  w: 22, h: 14, bg: '#050403',
  dark: 0.85,
  lights: () => [{ x: 5.2 * T, y: 7 * T, r: 95, a: 0.55 }, { x: 13.6 * T, y: 8.6 * T, r: 80, a: 0.45 }, { x: 11 * T, y: 13.4 * T, r: 90, a: 0.6 }],
  solids: [[0, 0, 22, 1.5], [0, 0, 0.3, 14], [21.7, 0, 0.3, 14], [0, 13.6, 10.2, 0.4], [11.8, 13.6, 10.2, 0.4]],
  paint(c) {
    c.fillStyle = '#5c554a'; c.fillRect(0, 0, 22 * T, 14 * T); grain(c, 0, 0, 22 * T, 14 * T, ['#524b41', '#665e52', '#474038', '#3a342c'], 4200, 3, 61);
    c.strokeStyle = 'rgba(20,16,12,.4)'; c.lineWidth = 1.2; for (let i = 0; i < 18; i++) { let x = hash(i) * 22 * T, y = 2 * T + hash(i + 4) * 11 * T; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (hash(i * 7 + k) - 0.5) * 50; y += (hash(i * 5 + k) - 0.3) * 30; c.lineTo(x, y); } c.stroke(); }
    c.fillStyle = 'rgba(8,6,5,.5)'; for (let i = 0; i < 9; i++) ellipse(c, (11 + hash(i + 14) * 7) * T, (2.6 + hash(i + 15) * 4) * T, 40 + hash(i) * 40, 18 + hash(i + 2) * 14);
    c.fillStyle = '#8a7f6a'; c.fillRect(0, 0, 22 * T, 1.5 * T); c.fillStyle = 'rgba(10,8,6,.65)'; for (let i = 0; i < 24; i++) { c.beginPath(); c.ellipse((8 + hash(i + 24) * 12) * T, 0.4 * T + hash(i) * 20, 26 + hash(i + 2) * 22, 24, 0, 0, 6.28); c.fill(); }
    // fallen tiles, weeds growing under the hole in the roof
    for (let i = 0; i < 46; i++) { c.save(); c.translate((3.4 + hash(i + 80) * 4) * T, (5.4 + hash(i + 81) * 3) * T); c.rotate(hash(i + 82) * 6); c.fillStyle = i % 2 ? '#8a4a38' : '#6f3a2c'; c.fillRect(-6, -3, 12, 6); c.restore(); }
    for (let i = 0; i < 14; i++) { const x = (3.8 + hash(i + 90) * 3) * T, y = (6 + hash(i + 91) * 2) * T; c.strokeStyle = '#5f8a3a'; c.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + k * 3, y - 8, x + k * 5, y - 12); c.stroke(); } }
    // the locked door in the back wall
    c.fillStyle = '#26221e'; c.fillRect(16.8 * T, 0.1 * T, 1.4 * T, 1.4 * T); c.fillStyle = '#5a5f62'; c.fillRect(16.88 * T, 0.16 * T, 1.24 * T, 1.34 * T); c.strokeStyle = '#3a3e40'; c.lineWidth = 2; c.strokeRect(17.0 * T, 0.28 * T, 1 * T, 1.1 * T); c.fillStyle = '#8a4a2a'; c.fillRect(17.75 * T, 0.75 * T, 8, 10); c.fillStyle = '#d8c8a0'; c.font = '700 6px Inter'; c.fillText('P.R.M.', 17.12 * T, 0.55 * T);
    c.fillStyle = '#8a7a5c'; c.fillRect(10.2 * T, 13.6 * T, 1.6 * T, 0.4 * T);
  },
  drawTop(c) {
    // sun through the holes in the roof, dust, bats
    for (const [x, y, w] of [[5.2, 7, 60], [13.6, 8.6, 34]]) { const g = c.createLinearGradient(0, 0, 0, y * T); g.addColorStop(0, 'rgba(255,240,200,.22)'); g.addColorStop(1, 'rgba(255,240,200,.05)'); c.fillStyle = g; c.beginPath(); c.moveTo((x - 1.6) * T, 0); c.lineTo((x - 1.6) * T + w * 0.7, 0); c.lineTo(x * T + w, y * T); c.lineTo(x * T - w * 0.6, y * T); c.fill(); for (let i = 0; i < 12; i++) { const ph = (G.t * 0.06 + hash(i + x)) % 1; c.fillStyle = 'rgba(255,245,220,.5)'; circle(c, (x - 1) * T + hash(i * 3) * 46 + ph * 22, ph * y * T, 0.9); } }
    for (let i = 0; i < 5; i++) { const a = G.t * (0.7 + hash(i) * 0.5) + i * 1.7, bx = (11 + Math.cos(a) * (5 + i)) * T, by = (4 + Math.sin(a * 1.3) * 2.4) * T, f = Math.sin(G.t * 18 + i) * 5; c.fillStyle = '#0c0a09'; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx - 9, by - f); c.lineTo(bx - 3, by + 3); c.lineTo(bx + 3, by + 3); c.lineTo(bx + 9, by - f); c.fill(); }
  },
  objs: [
    { x: 10.2, y: 13.2, w: 1.6, h: 0.6, label: 'Go outside', act: async () => { if (S.roomDone) S.millLeft = true; G.flashlight = false; await goto('millpath', 40.75, 8.6, 'down'); } },
    // huller
    { x: 2.6, y: 2.6, w: 4, h: 2.2, solid: true, sortY: 4.8, label: 'Look at the machinery', when: () => active('k_mach'), draw(c, o) {
      shade(c, o.x + o.w / 2, o.y + o.h, 66, 8, 0.4);
      c.fillStyle = '#4a4e4c'; rr(c, o.x, o.y + 10, o.w, o.h - 10, 4); c.fillStyle = '#5c625e'; rr(c, o.x + 6, o.y - 26, 50, 60, 4); c.fillStyle = '#3a3e3c'; c.beginPath(); c.moveTo(o.x + 2, o.y - 40); c.lineTo(o.x + 60, o.y - 40); c.lineTo(o.x + 46, o.y - 14); c.lineTo(o.x + 16, o.y - 14); c.fill();
      c.strokeStyle = '#2a2a28'; c.lineWidth = 5; c.beginPath(); c.arc(o.x + 94, o.y + 18, 24, 0, 6.28); c.stroke(); c.lineWidth = 2.5; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; c.beginPath(); c.moveTo(o.x + 94, o.y + 18); c.lineTo(o.x + 94 + Math.cos(a) * 23, o.y + 18 + Math.sin(a) * 23); c.stroke(); }
      c.fillStyle = 'rgba(150,70,30,.5)'; for (let k = 0; k < 16; k++) circle(c, o.x + hash(k) * o.w, o.y + hash(k + 8) * o.h, 2 + hash(k + 3) * 4);
      c.strokeStyle = '#6a4a30'; c.lineWidth = 4; c.beginPath(); c.moveTo(o.x + 94, o.y - 6); c.lineTo(o.x + 190, o.y - 6); c.stroke();
    }, act: async () => { await hold('Wiping soot off the nameplate', 1200, AudioSys.sfx.sweep); done('k_mach'); await think('A rice huller, rusted solid. The fire barely touched it. The machines were at the far end from the flames.', 3200); } },
    { x: 8.4, y: 2.4, w: 1.8, h: 1.4, solid: true, sortY: 3.8, draw(c, o) { shade(c, o.x + 28, o.y + 44, 30, 6, 0.4); c.fillStyle = '#5a4632'; c.fillRect(o.x + 4, o.y + 6, 6, 40); c.fillRect(o.x + 48, o.y + 6, 6, 40); c.strokeStyle = '#3a3a38'; c.lineWidth = 6; c.beginPath(); c.arc(o.x + 29, o.y + 2, 24, 0, 6.28); c.stroke(); c.lineWidth = 3; for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28 + 0.4; c.beginPath(); c.moveTo(o.x + 29, o.y + 2); c.lineTo(o.x + 29 + Math.cos(a) * 22, o.y + 2 + Math.sin(a) * 22); c.stroke(); } } },
    // burned office corner
    { x: 12.2, y: 2.4, w: 2.6, h: 1.2, solid: true, sortY: 3.6, label: 'Look at the burnt account books', when: () => active('k_books'), draw(c, o) {
      shade(c, o.x + 42, o.y + 38, 44, 7, 0.4); c.fillStyle = '#1e1712'; rr(c, o.x, o.y, o.w, o.h, 2); c.fillStyle = '#2c2119'; c.fillRect(o.x + 2, o.y + 2, o.w - 4, 8); c.fillStyle = '#15100c'; c.fillRect(o.x + 4, o.y + o.h, 6, 14); c.fillRect(o.x + o.w - 10, o.y + o.h, 6, 14);
      for (let k = 0; k < 6; k++) { const burn = k === 2 || k === 3; c.fillStyle = burn ? '#0c0908' : ['#6a3a2a', '#4a5a6a', '#6a5a3a'][k % 3]; c.save(); c.translate(o.x + 12 + k * 12, o.y + 14 - (k % 2) * 4); c.rotate((hash(k) - 0.5) * 0.4); c.fillRect(-5, -14, 10, 18); if (!burn) { c.fillStyle = '#d8c89a'; c.fillRect(-4, -10, 8, 4); } c.restore(); }
      c.fillStyle = 'rgba(210,205,195,.5)'; for (let k = 0; k < 20; k++) c.fillRect(o.x + hash(k + 3) * o.w, o.y + o.h + hash(k + 5) * 16, 3, 2);
    }, act: async () => { await hold('Turning the charred covers', 1600, AudioSys.sfx.rustle); done('k_books'); await say('c5_arj7'); } },
    { x: 13.2, y: 9.6, w: 1.2, h: 0.9, solid: true, draw(c, o) { shade(c, o.x + 18, o.y + 28, 20, 5, 0.4); c.fillStyle = '#4a4a46'; c.fillRect(o.x, o.y + 16, 38, 10); c.fillRect(o.x + 30, o.y - 18, 5, 36); c.fillStyle = '#6a6a64'; c.fillRect(o.x + 16, o.y - 20, 24, 6); c.fillStyle = '#b8a050'; circle(c, o.x + 22, o.y - 17, 3); } },
    // grain sacks
    { x: 3.2, y: 10.2, w: 3.4, h: 1.4, solid: true, sortY: 11.6, label: 'Look at the old grain sacks', when: () => active('k_grain'), draw(c, o) { sackStack(c, o.x + 26, o.y + 34, 1); sackStack(c, o.x + 78, o.y + 38, 2); c.fillStyle = '#c8b070'; for (let k = 0; k < 40; k++) c.fillRect(o.x + hash(k) * o.w, o.y + o.h - 4 + hash(k + 2) * 14, 2, 1.4); },
      act: async () => { await hold('Checking the sacks', 1300, AudioSys.sfx.rustle); done('k_grain'); await think('Stamped with the cooperative seal, 1996. But there are drag marks in the dust. Someone moved sacks from here to the back wall, and not long ago.', 4000); } },
    { x: 8.2, y: 8.4, w: 3.6, h: 0.6, solid: true, sortY: 9, draw(c, o) { c.save(); c.translate(o.x + o.w / 2, o.y + 10); c.rotate(-0.09); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-66, 4, 132, 9); c.fillStyle = '#1c1511'; c.fillRect(-66, -8, 132, 14); c.fillStyle = '#2e231b'; c.fillRect(-66, -8, 132, 4); c.restore(); } },
    { x: 18.6, y: 6.6, w: 1.6, h: 1.2, solid: true, sortY: 7.8, draw(c, o) { shade(c, o.x + 26, o.y + 38, 28, 6, 0.4); c.fillStyle = '#54463a'; c.fillRect(o.x, o.y - 8, o.w, o.h + 8); c.strokeStyle = '#3a2e26'; c.lineWidth = 2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(o.x, o.y - 6 + k * 12); c.lineTo(o.x + o.w, o.y - 6 + k * 12); c.stroke(); } } },
    // sacks hiding the door
    ...K_SACKS.map(([x, y], i) => ({ x: x - 0.1, y, w: 1.3, h: 0.9, solid: true, sortY: () => (y + 0.9) * T, solidRect() { return S['ks' + i] ? { x: -999, y: -999, w: 0, h: 0 } : { x: this.x, y: this.y, w: this.w, h: this.h }; },
      draw(c, o) { if (S['ks' + i]) sackStack(c, (19.6 + i * 0.7) * T, (3.6 + i * 0.9) * T, i + 5); else { sackStack(c, o.x + 20, o.y + 24, i + 5); sackStack(c, o.x + 20, o.y + 4, i + 9); } },
      when: () => active('k_sacks') && !S['ks' + i], label: 'Drag the sacks aside',
      act: async () => { await hold('Dragging the sacks aside', 1700, AudioSys.sfx.dig); S['ks' + i] = true; kCount('ks', 3, 'k_sacks', 'Drag the sacks away from the back wall'); } })),
    { x: 16.8, y: 1.4, w: 1.4, h: 0.5, when: () => S.ks0 && S.ks1 && S.ks2 && (active('k_key') || S.roomOpen), label: () => S.roomOpen ? 'Enter the locked room' : 'Try the rusted key', act: async () => {
      if (!S.roomOpen) { Music.set(null); await hold('Turning the rusted key', 3000, AudioSys.sfx.knock); await say('c5_arj8'); AudioSys.sfx.knock(); S.roomOpen = true; done('k_key'); Music.set('tension'); }
      await goto('millroom', 4.5, 6.1, 'up');
    } },
  ],
});

// ======================= THE LOCKED ROOM =======================
defMap('millroom', {
  w: 9, h: 7, bg: '#050403',
  dark: 0.72,
  lights: () => [{ x: 7.4 * T, y: 1.6 * T, r: 80, a: 0.5 }, { x: 4.5 * T, y: 6.6 * T, r: 60, a: 0.5 }],
  solids: [[0, 0, 9, 1.4], [0, 0, 0.3, 7], [8.7, 0, 0.3, 7], [0, 6.6, 3.8, 0.4], [5.2, 6.6, 3.8, 0.4]],
  paint(c) {
    c.fillStyle = '#6a6152'; c.fillRect(0, 0, 9 * T, 7 * T); grain(c, 0, 0, 9 * T, 7 * T, ['#5f5749', '#756b5b', '#554d40'], 1400, 3, 66);
    c.fillStyle = '#a89a7c'; c.fillRect(0, 0, 9 * T, 1.4 * T); c.fillStyle = 'rgba(20,14,10,.35)'; c.fillRect(0, 0, 9 * T, 5);
    // barred ventilator, calendar
    c.fillStyle = '#c8dce0'; c.fillRect(7 * T, 0.2 * T, 28, 16); c.strokeStyle = '#3a3028'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(7 * T + k * 7, 0.2 * T); c.lineTo(7 * T + k * 7, 0.2 * T + 16); c.stroke(); }
    c.fillStyle = '#e8dcb8'; c.fillRect(2.3 * T, 0.15 * T, 26, 34); c.fillStyle = '#b8402e'; c.fillRect(2.3 * T, 0.15 * T, 26, 9); c.fillStyle = '#4a4032'; c.font = '700 5px Inter'; c.fillText('AUG 1996', 2.3 * T + 2, 0.15 * T + 6.5); for (let k = 0; k < 15; k++) c.fillRect(2.3 * T + 3 + (k % 5) * 4.6, 0.15 * T + 13 + Math.floor(k / 5) * 6, 2, 2); c.strokeStyle = '#c02a20'; c.lineWidth = 1.5; c.beginPath(); c.arc(2.3 * T + 13, 0.15 * T + 26, 4, 0, 6.28); c.stroke();
    c.fillStyle = '#8a7a5c'; c.fillRect(3.8 * T, 6.6 * T, 1.4 * T, 0.4 * T);
    // footprints and stick marks in the dust
    c.fillStyle = 'rgba(40,32,24,.55)'; for (let i = 0; i < 6; i++) { c.save(); c.translate((4.4 + (i % 2) * 0.4) * T, (5.9 - i * 0.6) * T); ellipse(c, 0, 0, 3.2, 5.5); c.restore(); if (i % 2) circle(c, 5.2 * T, (5.7 - i * 0.6) * T, 2); }
  },
  objs: [
    { x: 3.8, y: 6.3, w: 1.4, h: 0.5, label: 'Leave the room', act: () => goto('mill', 17.5, 2.6, 'down') },
    { x: 3.3, y: 1.7, w: 2.4, h: 0.9, solid: true, sortY: 2.6, label: 'Take the cassette recorder', when: () => active('k_rec'), draw(c, o) {
      shade(c, o.x + 38, o.y + 30, 42, 6, 0.4); c.fillStyle = '#5a3f28'; rr(c, o.x, o.y, o.w, o.h, 2); c.fillStyle = '#6b4e32'; c.fillRect(o.x + 2, o.y + 2, o.w - 4, 6); c.fillStyle = '#3f2a1a'; c.fillRect(o.x + 4, o.y + o.h, 5, 10); c.fillRect(o.x + o.w - 9, o.y + o.h, 5, 10);
      if (!S.gotRec) { c.fillStyle = '#26282c'; rr(c, o.x + 22, o.y - 8, 36, 20, 3); c.fillStyle = '#8a8f94'; c.fillRect(o.x + 25, o.y - 5, 16, 10); c.fillStyle = '#1a1c1e'; circle(c, o.x + 29, o.y, 2.6); circle(c, o.x + 37, o.y, 2.6); c.fillStyle = '#c8302a'; c.fillRect(o.x + 45, o.y + 4, 4, 4); c.fillStyle = '#b8b8b0'; c.fillRect(o.x + 50, o.y + 4, 4, 4); }
      c.fillStyle = '#b8a050'; circle(c, o.x + 66, o.y + 10, 4);
    }, act: async () => { await hold('Wiping off the dust', 1200, AudioSys.sfx.sweep); S.gotRec = true; give('recorder'); done('k_rec'); await say('c5_arj11'); } },
    { x: 1, y: 2.4, w: 1.6, h: 1, solid: true, sortY: 3.4, label: 'Open the ledger', when: () => active('k_led'), draw(c, o) { shade(c, o.x + 26, o.y + 32, 28, 6, 0.4); c.fillStyle = '#3f4a44'; rr(c, o.x, o.y, o.w, o.h, 3); c.fillStyle = '#2f3833'; c.fillRect(o.x, o.y + 12, o.w, 3); c.fillStyle = '#b8a050'; c.fillRect(o.x + 22, o.y + 10, 8, 8); if (!S.gotLed) { c.fillStyle = '#6a2a20'; rr(c, o.x + 10, o.y - 6, 30, 12, 1); c.fillStyle = '#e0d2a6'; c.fillRect(o.x + 12, o.y + 4, 28, 3); } },
      act: async () => {
        S.gotLed = true; await fadeOut(500); const t0 = performance.now(); G.cine = (c, w, h) => sceneLedger(c, w, h, (performance.now() - t0) / 1000); await fadeIn(600);
        await sleep(1800); await say('c5_arj10'); await sleep(900); await fadeOut(600); endPainted(); await fadeIn(500); give('ledger'); done('k_led');
      } },
    { x: 5.9, y: 1.1, w: 0.9, h: 0.6, label: 'Look at the photograph', when: () => active('k_photo'), draw(c, o) { if (S.gotPhoto) { c.fillStyle = 'rgba(230,215,180,.35)'; c.fillRect(o.x + 2, o.y - 26, 22, 28); return; } c.fillStyle = '#5a3a22'; c.fillRect(o.x, o.y - 28, 26, 32); c.fillStyle = '#d8cca8'; c.fillRect(o.x + 3, o.y - 25, 20, 26); c.fillStyle = '#6a5a44'; circle(c, o.x + 11, o.y - 15, 4); c.fillRect(o.x + 6, o.y - 10, 11, 11); circle(c, o.x + 17, o.y - 9, 3); },
      act: async () => {
        S.gotPhoto = true; await fadeOut(600); const t0 = performance.now(); Music.set('sad'); G.cine = (c, w, h) => sceneFatherPhoto(c, w, h, (performance.now() - t0) / 1000); await fadeIn(900);
        await sleep(2000); await say('c5_arj9'); await sleep(1800); await fadeOut(800); endPainted(); Music.set('tension'); await fadeIn(500); give('fatherphoto'); done('k_photo');
      } },
    { x: 4, y: 3.6, w: 1.4, h: 1.2, label: 'Look at the marks in the dust', when: () => active('k_marks'), act: async () => { done('k_marks'); await say('c5_arj12'); } },
    { x: 7, y: 4.4, w: 1, h: 0.8, solid: true, draw(c, o) { shade(c, o.x + 16, o.y + 26, 16, 5, 0.4); c.fillStyle = '#6b4e32'; c.fillRect(o.x + 4, o.y + 6, 24, 6); c.fillRect(o.x + 4, o.y + 12, 4, 14); c.fillRect(o.x + 24, o.y + 12, 4, 14); c.fillRect(o.x + 4, o.y - 14, 4, 20); c.fillRect(o.x + 4, o.y - 14, 24, 5); } },
  ],
});

// ======================= THOMAS CHETTAN'S RADIO SHOP =======================
defMap('radioshop', {
  w: 10, h: 8, bg: '#120d09',
  indoorDark: () => 0.14,
  lights: () => [{ x: 5 * T, y: 2.8 * T, r: 150, a: 0.9, warm: true }, { x: 2 * T, y: 5 * T, r: 110, a: 0.7, warm: true }, { x: 8.4 * T, y: 5 * T, r: 110, a: 0.7, warm: true }],
  solids: [[0, 0, 10, 1.4], [0, 0, 0.25, 8], [9.75, 0, 0.25, 8], [0, 7.6, 4.3, 0.4], [5.7, 7.6, 4.3, 0.4], [0.2, 3.4, 0.9, 3], [8.9, 3, 0.9, 3.4]],
  paint(c) {
    c.fillStyle = '#7d6a50'; c.fillRect(0, 0, 10 * T, 8 * T); planks(c, 0, 1.4 * T, 10 * T, 6.6 * T, '#7d6a50', 'rgba(50,34,18,.35)', 14);
    c.fillStyle = '#8fa08a'; c.fillRect(0, 0, 10 * T, 1.4 * T);
    const radio = (x, y, w, h, s) => { c.fillStyle = ['#7a4a2a', '#4a3a2e', '#a0825a', '#5a6a6a', '#8a3a2a'][s % 5]; rr(c, x, y, w, h, 3); c.fillStyle = '#e8dcb0'; c.fillRect(x + 3, y + 3, w * 0.45, h * 0.35); c.fillStyle = '#2a2420'; for (let k = 0; k < 3; k++) c.fillRect(x + 3, y + h * 0.55 + k * 3, w * 0.45, 1.4); circle(c, x + w * 0.75, y + h * 0.35, 3); circle(c, x + w * 0.75, y + h * 0.72, 2.2); };
    for (const sy of [0.55, 1.15]) { c.fillStyle = '#5a3a22'; c.fillRect(0.4 * T, sy * T, 9.2 * T, 4); }
    for (let i = 0; i < 11; i++) { radio(0.5 * T + i * 26, 0.55 * T - 15, 22, 15, i); if (i < 10) radio(0.7 * T + i * 28, 1.15 * T - 13, 20, 13, i + 2); }
    c.fillStyle = '#5a3a22'; c.fillRect(0.2 * T, 3.4 * T, 0.9 * T, 3 * T); c.fillRect(8.9 * T, 3 * T, 0.9 * T, 3.4 * T);
    for (let i = 0; i < 5; i++) { radio(0.25 * T, 3.5 * T + i * 18, 26, 15, i + 1); radio(8.95 * T, 3.2 * T + i * 19, 26, 16, i + 3); }
    c.fillStyle = 'rgba(30,20,10,.5)'; for (let i = 0; i < 26; i++) { const x = (1.6 + hash(i) * 6.8) * T, y = (4.6 + hash(i + 5) * 2.6) * T; c.fillRect(x, y, 4, 1.5); }
    c.strokeStyle = '#b8402e'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(2 * T, 5.6 * T); c.bezierCurveTo(3 * T, 5 * T, 3 * T, 6.6 * T, 4 * T, 6 * T); c.stroke();
    c.fillStyle = '#3c3e41'; c.fillRect(4.3 * T, 7.6 * T, 1.4 * T, 0.4 * T);
  },
  drawTop(c) { const g = c.createRadialGradient(5 * T, 2.4 * T, 2, 5 * T, 2.4 * T, 40); g.addColorStop(0, 'rgba(255,220,150,.3)'); g.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g; circle(c, 5 * T, 2.4 * T, 40); },
  objs: [
    { x: 4.3, y: 7.2, w: 1.4, h: 0.6, label: 'Go outside', act: () => goto('village', 40.9, 32, 'down') },
    Object.assign(hooked('thomas'), { id: 'thomas', npc: true, reach: 22, x: 5 * T, y: 2.35 * T, dir: 'down', voice: 'thomas', visible: () => !S.thomasOut, draw: npcDraw('thomas') }),
    { x: 3.2, y: 2.6, w: 3.6, h: 0.9, solid: true, sortY: 3.5, draw(c, o) {
      shade(c, o.x + o.w / 2, o.y + o.h + 4, 60, 6); c.fillStyle = '#6b4428'; rr(c, o.x, o.y, o.w, o.h, 2); c.fillStyle = '#7d5232'; c.fillRect(o.x + 2, o.y + 2, o.w - 4, 6); c.fillStyle = '#4a2e1a'; c.fillRect(o.x + 4, o.y + o.h, 6, 12); c.fillRect(o.x + o.w - 10, o.y + o.h, 6, 12);
      c.fillStyle = '#888'; c.fillRect(o.x + 92, o.y - 26, 2.4, 32); c.fillRect(o.x + 70, o.y - 26, 24, 2.4); c.fillStyle = '#2f6a3a'; c.beginPath(); c.moveTo(o.x + 62, o.y - 16); c.lineTo(o.x + 70, o.y - 28); c.lineTo(o.x + 78, o.y - 16); c.fill();
      for (let k = 0; k < 9; k++) { c.fillStyle = ['#b8a050', '#c8302a', '#2f6a8a'][k % 3]; circle(c, o.x + 8 + hash(k) * 40, o.y + 10 + hash(k + 2) * 14, 1.6); }
      if (S.recOnBench) { c.fillStyle = '#26282c'; rr(c, o.x + 46, o.y + 2, 34, 18, 3); c.fillStyle = '#8a8f94'; c.fillRect(o.x + 49, o.y + 5, 15, 9); c.fillStyle = '#1a1c1e'; circle(c, o.x + 53, o.y + 9, 2.3); circle(c, o.x + 60, o.y + 9, 2.3); }
    } },
    { x: 6.9, y: 4.6, w: 0.7, h: 0.6, solid: true, label: "The stool by the bench", when: () => !!S.metThomas && !S.sawStool, draw(c, o) { shade(c, o.x + 11, o.y + 18, 12, 4); c.fillStyle = '#5a3a22'; c.fillRect(o.x + 2, o.y + 4, 4, 14); c.fillRect(o.x + 16, o.y + 4, 4, 14); c.fillStyle = '#7d5232'; ellipse(c, o.x + 11, o.y + 4, 12, 6); }, act: async () => { S.sawStool = true; await think('The seat is worn smooth. My father sat here once, with a screwdriver and a dead radio, learning how to make it talk.', 3600); } },
  ],
});

// ---------- Aligning the tape head ----------
let tapeHiss = null;
function setHiss(v) {
  const ctx = AudioSys.ctx(); if (!ctx) return;
  if (!tapeHiss && v > 0) { const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = AudioSys.noise(); s.loop = true; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.5; g.gain.value = 0; s.connect(f); f.connect(g); g.connect(AudioSys._dbg().master); s.start(); tapeHiss = { s, g }; }
  if (!tapeHiss) return;
  tapeHiss.g.gain.setTargetAtTime(v, ctx.currentTime, 0.08);
  if (v <= 0) { const h = tapeHiss; tapeHiss = null; setTimeout(() => { try { h.s.stop(); } catch (e) { } }, 600); }
}
function tapeGame() {
  return new Promise(resolve => {
    const box = $('mini'), mc = $('mc'), m = mc.getContext('2d'); box.style.display = 'flex'; G.locked++;
    let ang = 0.12, target = 0.68, lock = 0, t = 0, last = performance.now(), fin = false, won = 0;
    G._tape = { state: () => ({ ang, target, lock }) };
    const end = () => { fin = true; setHiss(0); box.style.display = 'none'; G.locked--; resolve(); };
    function frame(now) {
      if (fin) return; const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (!won) {
        const d = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0); ang = clamp(ang + d * dt * (keys['shift'] ? 0.08 : 0.22), 0, 1);
        const tgt = target + Math.sin(t * 0.7) * 0.02, q = clamp(1 - Math.abs(ang - tgt) / 0.28, 0, 1);
        setHiss(0.006 + 0.03 * (1 - q)); lock = q > 0.78 ? lock + dt : Math.max(0, lock - dt * 1.5);
        if (lock >= 1.8) { won = 0.01; setHiss(0.004); AudioSys.sfx.done(); }
        draw(q);
      } else { won += dt; draw(1); if (won > 1.1) return end(); }
      requestAnimationFrame(frame);
    }
    function draw(q) {
      const W = 560, Hh = 360; m.fillStyle = '#2a1e14'; m.fillRect(0, 0, W, Hh); m.strokeStyle = 'rgba(255,220,160,.05)'; for (let i = 0; i < 20; i++) { m.beginPath(); m.moveTo(0, i * 19); m.bezierCurveTo(200, i * 19 + 8, 380, i * 19 - 8, W, i * 19 + 3); m.stroke(); }
      m.fillStyle = '#3a3e42'; m.beginPath(); m.roundRect(70, 60, 420, 190, 12); m.fill(); m.fillStyle = '#23262a'; m.beginPath(); m.roundRect(96, 78, 368, 120, 8); m.fill();
      for (const x of [190, 370]) { m.fillStyle = '#4a3a30'; m.beginPath(); m.arc(x, 136, 44, 0, 6.28); m.fill(); m.fillStyle = '#d8d4c8'; m.beginPath(); m.arc(x, 136, 18, 0, 6.28); m.fill(); m.fillStyle = '#23262a'; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + t * (x < 250 ? 1.6 : 2); m.fillRect(x + Math.cos(a) * 13 - 2.5, 136 + Math.sin(a) * 13 - 2.5, 5, 5); } }
      m.strokeStyle = '#5a4436'; m.lineWidth = 2; m.beginPath(); m.moveTo(150, 152); m.lineTo(280, 196); m.lineTo(410, 152); m.stroke();
      // head + screw
      m.save(); m.translate(280, 206); m.rotate((ang - 0.5) * 0.5); m.fillStyle = '#a8acb0'; m.fillRect(-22, -10, 44, 26); m.fillStyle = '#c8ccd0'; m.fillRect(-14, -14, 28, 8); m.restore();
      m.save(); m.translate(332, 220); m.fillStyle = '#c8a850'; m.beginPath(); m.arc(0, 0, 11, 0, 6.28); m.fill(); m.rotate(ang * 9); m.fillStyle = '#4a3a10'; m.fillRect(-9, -1.6, 18, 3.2); m.restore();
      // signal trace
      m.fillStyle = '#0e1410'; m.fillRect(70, 264, 420, 60); m.strokeStyle = q > 0.78 ? '#8ae07a' : '#c8b050'; m.lineWidth = 1.6; m.beginPath(); for (let x = 0; x <= 416; x += 3) { const voice = Math.sin(x * 0.09 + t * 9) * Math.sin(x * 0.021 + t * 2) * 22 * q, n = (Math.random() - 0.5) * 48 * (1 - q); m.lineTo(72 + x, 294 + voice + n); } m.stroke();
      m.fillStyle = '#f5efe3'; m.font = '600 14px Inter, sans-serif'; m.textAlign = 'center'; m.fillText(won ? 'Clear. A voice, under the hiss.' : 'A / D — turn the screw  ·  Shift — fine  ·  find the clear voice and hold it', W / 2, 32);
      m.fillStyle = 'rgba(255,255,255,.12)'; m.fillRect(170, 336, 220, 8); m.fillStyle = '#8ae07a'; m.fillRect(170, 336, 220 * Math.min(1, lock / 1.8), 8); m.textAlign = 'left';
    }
    requestAnimationFrame(frame);
  });
}
async function sayTape(id) {
  const L = LINES[id], V5 = VOICES[L.who]; showSub(`${V5.name} · ${V5.ml}`, V5.color, stripTags(L.ml), L.en);
  let skipped = false; const k = waitKey(); k.then(() => { skipped = true; AudioSys.stopVoice(); });
  await Promise.race([AudioSys.voice(id, 'tape'), k]); k.cancel();
  if (!skipped) { const k2 = waitKey(); await Promise.race([sleep(1100), k2]); k2.cancel(); }
  hideSub(); await sleep(200);
}

// ======================= PAINTED SCENES =======================
function tableTop(c, W, Hh, t) {
  const k = Math.min(W / 1000, Hh / 600); c.translate(W / 2, Hh / 2); c.scale(k * (1 + t * 0.004), k * (1 + t * 0.004)); c.translate(-500, -300);
  c.fillStyle = '#2a1c12'; c.fillRect(-600, -400, 2200, 1400); c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = 2; for (let i = -8; i < 40; i++) { c.beginPath(); c.moveTo(-600, i * 24); c.bezierCurveTo(200, i * 24 + 8, 600, i * 24 - 8, 1600, i * 24 + 4); c.stroke(); }
}
function torchLight(c, x, y, t, r0 = 150, r1 = 560, dark = 0.86) { const fx = x + Math.sin(t * 0.9) * 10, fy = y + Math.cos(t * 0.7) * 7, g = c.createRadialGradient(fx, fy, r0, fx, fy, r1); g.addColorStop(0, 'rgba(255,220,150,.06)'); g.addColorStop(1, `rgba(0,0,0,${dark})`); c.fillStyle = g; c.fillRect(-600, -400, 2200, 1400); }
function sceneLedger(c, W, Hh, t) {
  c.save(); tableTop(c, W, Hh, t);
  c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(158, 62, 700, 500); c.fillStyle = '#4a1e18'; c.fillRect(140, 46, 720, 504);
  for (const x of [152, 502]) { const g = c.createLinearGradient(x, 0, x + 346, 0); g.addColorStop(0, x < 300 ? '#e6d9b4' : '#cbbd94'); g.addColorStop(1, x < 300 ? '#cbbd94' : '#e6d9b4'); c.fillStyle = g; c.fillRect(x, 56, 346, 484); }
  c.strokeStyle = 'rgba(60,90,140,.35)'; c.lineWidth = 1; for (let i = 0; i < 17; i++) { c.beginPath(); c.moveTo(160, 120 + i * 25); c.lineTo(490, 120 + i * 25); c.moveTo(510, 120 + i * 25); c.lineTo(840, 120 + i * 25); c.stroke(); }
  c.strokeStyle = 'rgba(180,50,40,.5)'; for (const x of [232, 400, 582, 750]) { c.beginPath(); c.moveTo(x, 70); c.lineTo(x, 530); c.stroke(); }
  c.fillStyle = '#2a2a4a'; c.textAlign = 'left'; c.font = `700 15px ${ML_FONT}`; c.fillText('പുഴക്കര കാർഷിക സഹകരണ സംഘം', 170, 92); c.font = '600 16px Inter, sans-serif'; c.fillText('August 1996', 700, 92);
  c.font = 'italic 17px Georgia, serif';
  const rows = [['2/8', 'Paddy procurement', '12,400'], ['5/8', 'Fertiliser', '8,750'], ['7/8', 'Loan repayments', '31,200'], ['9/8', 'Members deposits', '54,000'], ['12/8', 'Wages', '9,600']];
  rows.forEach(([d, n, a], i) => { c.fillStyle = '#34345a'; c.fillText(d, 168, 140 + i * 50); c.fillText(n, 242, 140 + i * 50); c.fillText(a, 410, 140 + i * 50); });
  c.fillStyle = '#34345a'; c.fillText('13/8', 518, 140); c.fillText('Kisan loans', 592, 140); c.fillText('22,000', 760, 140);
  const p = clamp(t - 1.2, 0, 1); c.fillStyle = `rgba(255,230,120,${0.5 * p})`; c.fillRect(508, 168, 334, 60);
  c.fillStyle = '#1a1a3a'; c.font = 'italic 700 17px Georgia, serif'; c.fillText('14/8', 518, 194); c.fillText('Transferred out', 592, 194); c.fillText('6,40,000', 757, 194); c.font = 'italic 15px Georgia, serif'; c.fillText('by order, President', 592, 219);
  c.fillStyle = 'rgba(90,60,30,.55)'; c.beginPath(); c.ellipse(680, 262, 70, 22, 0.1, 0, 6.28); c.fill(); c.fillStyle = 'rgba(60,40,20,.5)'; c.beginPath(); c.ellipse(690, 258, 48, 14, 0, 0, 6.28); c.fill();
  c.fillStyle = '#7a2018'; c.font = 'italic 17px Georgia, serif'; c.fillText('Not approved by members.', 560, 340); c.fillText('I will not sign this.', 560, 366); c.font = `italic 700 20px ${ML_FONT}`; c.fillText('— രവി, അക്കൗണ്ടന്റ്', 590, 398);
  torchLight(c, 640, 240, t, 170, 600, 0.82); c.restore();
}
function sceneFatherPhoto(c, W, Hh, t) {
  c.save(); tableTop(c, W, Hh, t); c.translate(500, 300); c.rotate(-0.03); c.translate(-240, -268);
  c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(12, 14, 480, 536); c.fillStyle = '#efe6cc'; c.fillRect(0, 0, 480, 536);
  c.save(); c.beginPath(); c.rect(24, 24, 432, 430); c.clip();
  const g = c.createLinearGradient(0, 24, 0, 454); g.addColorStop(0, '#cdbb92'); g.addColorStop(1, '#8a7550'); c.fillStyle = g; c.fillRect(24, 24, 432, 430);
  // mango tree and the house behind
  c.fillStyle = '#7a6746'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(80 + hash(i) * 180, 70 + hash(i + 4) * 80, 40 + hash(i + 2) * 22, 0, 6.28); c.fill(); } c.fillRect(140, 120, 22, 250);
  c.fillStyle = '#a8946a'; c.fillRect(300, 190, 180, 160); c.fillStyle = '#6a5438'; c.beginPath(); c.moveTo(280, 196); c.lineTo(380, 130); c.lineTo(480, 196); c.fill(); c.fillStyle = '#6f5c3c'; c.fillRect(24, 350, 432, 110);
  // father
  c.fillStyle = '#e8dcbc'; c.beginPath(); c.moveTo(150, 460); c.quadraticCurveTo(154, 262, 236, 252); c.quadraticCurveTo(322, 262, 326, 460); c.fill();
  c.fillStyle = '#6a4c34'; c.fillRect(220, 226, 34, 34); c.beginPath(); c.ellipse(237, 190, 43, 52, 0, 0, 6.28); c.fill(); c.fillStyle = '#1f1812'; c.beginPath(); c.ellipse(237, 166, 46, 32, 0, Math.PI, 0); c.fill(); c.fillRect(191, 162, 9, 26); c.fillRect(274, 162, 9, 26);
  c.fillRect(218, 184, 9, 4); c.fillRect(248, 184, 9, 4); c.beginPath(); c.ellipse(237, 210, 18, 5, 0, 0, 6.28); c.fill(); c.strokeStyle = '#3a2418'; c.lineWidth = 2.4; c.beginPath(); c.arc(237, 214, 13, 0.3, 2.84); c.stroke();
  // little Arjun in his arms
  c.fillStyle = '#c8b48a'; c.beginPath(); c.ellipse(310, 330, 44, 60, 0.25, 0, 6.28); c.fill(); c.fillStyle = '#7a5a40'; c.beginPath(); c.ellipse(322, 254, 30, 33, 0.1, 0, 6.28); c.fill(); c.fillStyle = '#1f1812'; c.beginPath(); c.ellipse(323, 240, 32, 22, 0.1, Math.PI, 0); c.fill(); c.beginPath(); c.arc(312, 254, 3, 0, 6.28); c.arc(333, 255, 3, 0, 6.28); c.fill(); c.strokeStyle = '#3a2418'; c.beginPath(); c.arc(322, 264, 9, 0.2, 2.94); c.stroke();
  c.strokeStyle = '#6a4c34'; c.lineCap = 'round'; c.lineWidth = 24; c.beginPath(); c.moveTo(176, 320); c.quadraticCurveTo(210, 400, 316, 372); c.stroke(); c.lineWidth = 12; c.strokeStyle = '#7a5a40'; c.beginPath(); c.moveTo(292, 306); c.quadraticCurveTo(268, 282, 262, 262); c.stroke();
  c.fillStyle = 'rgba(255,240,200,.12)'; for (let i = 0; i < 500; i++) c.fillRect(24 + hash(i) * 432, 24 + hash(i + 9) * 430, 1.6, 1.6); c.strokeStyle = 'rgba(255,250,230,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(24, 130); c.lineTo(160, 152); c.lineTo(456, 118); c.stroke();
  c.restore();
  c.fillStyle = '#4a3a6a'; c.font = `italic 600 22px ${ML_FONT}`; c.textAlign = 'center'; c.fillText('രവിയും അർജുനും · 1995', 240, 502); c.textAlign = 'left';
  c.translate(240 - 500, 268 - 300); torchLight(c, 500, 270, t, 220, 640, 0.8); c.restore();
}
const TAPE = { spin: true };
function sceneTape(c, W, Hh, t) {
  c.save(); tableTop(c, W, Hh, t);
  c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.roundRect(206, 130, 620, 372, 22); c.fill(); const g = c.createLinearGradient(0, 110, 0, 480); g.addColorStop(0, '#3c4046'); g.addColorStop(1, '#22252a'); c.fillStyle = g; c.beginPath(); c.roundRect(190, 110, 620, 372, 22); c.fill();
  c.fillStyle = '#16181b'; c.beginPath(); c.roundRect(224, 146, 340, 200, 12); c.fill(); c.fillStyle = '#d8ccae'; c.beginPath(); c.roundRect(244, 164, 300, 164, 10); c.fill(); c.fillStyle = '#efe6cc'; c.fillRect(258, 176, 272, 42); c.fillStyle = '#3a3226'; c.font = `italic 600 20px ${ML_FONT}`; c.fillText('12 · 8 · 2018  — അർജുന്', 272, 204);
  c.fillStyle = '#2a2622'; c.beginPath(); c.roundRect(284, 232, 220, 72, 34); c.fill(); for (const [x, r] of [[326, 27], [462, 20]]) { c.fillStyle = '#4a362a'; c.beginPath(); c.arc(x, 268, r + 4, 0, 6.28); c.fill(); c.fillStyle = '#e8e4d8'; c.beginPath(); c.arc(x, 268, 16, 0, 6.28); c.fill(); c.fillStyle = '#2a2622'; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + (TAPE.spin ? t * 1.4 : TAPE.a || 0); if (!k && TAPE.spin) TAPE.a = a; c.fillRect(x + Math.cos(a) * 11 - 2.5, 268 + Math.sin(a) * 11 - 2.5, 5, 5); } }
  c.fillStyle = '#101214'; c.beginPath(); c.roundRect(592, 146, 190, 200, 12); c.fill(); c.fillStyle = '#2e3236'; for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) { c.beginPath(); c.arc(606 + x * 16, 162 + y * 17, 4, 0, 6.28); c.fill(); }
  ['■', '◀◀', '▶', '▶▶', '●'].forEach((s, i) => { const down = i === 2 && TAPE.spin; c.fillStyle = down ? '#8a8e92' : '#b4b8bc'; c.beginPath(); c.roundRect(230 + i * 112, down ? 382 : 374, 96, 52, 6); c.fill(); c.fillStyle = i === 4 ? '#b02a22' : '#2a2c2e'; c.font = '700 20px Inter, sans-serif'; c.textAlign = 'center'; c.fillText(s, 278 + i * 112, (down ? 382 : 374) + 33); }); c.textAlign = 'left';
  c.fillStyle = TAPE.spin && Math.sin(t * 5) > -0.6 ? '#ff5a3a' : '#4a1a14'; c.beginPath(); c.arc(786, 456, 6, 0, 6.28); c.fill();
  const v = c.createRadialGradient(500, 290, 230, 500, 290, 720); v.addColorStop(0, 'rgba(255,200,120,.06)'); v.addColorStop(1, 'rgba(0,0,0,.8)'); c.fillStyle = v; c.fillRect(-600, -400, 2200, 1400); c.restore();
}
const ENV = { flip: 0 };
function sceneEnvelope(c, W, Hh, t) {
  c.save(); tableTop(c, W, Hh, t);
  c.save(); c.translate(330, 420); c.rotate(-0.14); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(-210, -120, 440, 260); c.fillStyle = '#c9ae74'; c.fillRect(-220, -130, 440, 260); c.strokeStyle = '#9a8050'; c.lineWidth = 2; c.beginPath(); c.moveTo(-220, -130); c.lineTo(0, 10); c.lineTo(220, -130); c.stroke(); c.restore();
  const f = clamp(ENV.flip, 0, 1), sx = Math.max(0.02, Math.abs(Math.cos(f * Math.PI)));
  c.save(); c.translate(530, 280); c.rotate(0.04); c.scale(sx, 1); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(-270, -186, 560, 392); c.fillStyle = '#f2efe6'; c.fillRect(-280, -196, 560, 392);
  if (f < 0.5) {
    c.save(); c.beginPath(); c.rect(-262, -178, 524, 356); c.clip();
    c.fillStyle = '#5a7a48'; c.fillRect(-262, -178, 524, 356); c.fillStyle = '#8f8468'; c.fillRect(-262, 60, 524, 118);
    c.fillStyle = '#9a8c74'; c.fillRect(-180, -60, 420, 160); c.fillStyle = '#6a4438'; c.beginPath(); c.moveTo(-200, -56); c.lineTo(-150, -150); c.lineTo(210, -150); c.lineTo(260, -56); c.fill(); c.fillStyle = 'rgba(15,10,8,.55)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.ellipse(-160 + hash(i) * 380, -30 + hash(i + 2) * 40, 26, 34, 0, 0, 6.28); c.fill(); }
    c.fillStyle = '#4a4438'; c.fillRect(-80, -64, 210, 24); c.fillStyle = '#c8bc9c'; c.font = `600 14px ${ML_FONT}`; c.textAlign = 'center'; c.fillText('പുഴക്കര അരി മിൽ', 25, -47); c.textAlign = 'left';
    c.fillStyle = '#080605'; c.fillRect(-12, 6, 68, 94);
    c.save(); c.translate(24, 112); c.scale(2.4, 2.4); drawPerson(c, 0, 0, LOOKS.arjun_mundu, 'up', 1, true); c.restore();
    // leaves in the foreground: taken from hiding
    for (let i = 0; i < 26; i++) { c.fillStyle = i % 2 ? 'rgba(24,44,18,.94)' : 'rgba(34,58,24,.9)'; c.save(); const L5 = i % 2 === 0; c.translate(L5 ? -262 + hash(i) * 90 : 190 + hash(i) * 90, -178 + hash(i + 7) * 370); c.rotate(hash(i + 3) * 6); c.beginPath(); c.ellipse(0, 0, 44, 13, 0, 0, 6.28); c.fill(); c.restore(); }
    c.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 400; i++) c.fillRect(-262 + hash(i) * 524, -178 + hash(i + 5) * 356, 1.5, 1.5); c.restore();
  } else {
    c.scale(-1, 1); c.scale(-1, 1); c.fillStyle = '#e8e3d4'; c.fillRect(-280, -196, 560, 392); c.fillStyle = 'rgba(120,110,90,.14)'; for (let i = 0; i < 5; i++) { c.save(); c.rotate(-0.4); c.font = '600 14px Inter'; c.fillText('COLOUR LAB', -260 + (i % 3) * 190, -120 + i * 76); c.restore(); }
    c.fillStyle = '#16181c'; c.textAlign = 'center'; c.font = '700 58px "Bradley Hand", "Marker Felt", "Comic Sans MS", cursive'; c.save(); c.rotate(-0.035); c.fillText('GO BACK', 0, -18); c.fillText('TO DUBAI.', 4, 56); c.restore(); c.textAlign = 'left';
  }
  c.restore();
  const v = c.createRadialGradient(520, 290, 180, 520, 290, 660); v.addColorStop(0, 'rgba(255,190,100,.08)'); v.addColorStop(1, 'rgba(0,0,0,.85)'); c.fillStyle = v; c.fillRect(-600, -400, 2200, 1400); c.restore();
}

// ======================= WRAPPERS: shed, grocer, objective targets =======================
{
  const _shed5 = shedAct;
  shedAct = async function () {
    if (active('k_sickle') && !has('sickle')) { give('sickle'); done('k_sickle'); await think('The arival, still sharp from the farm. It hangs where he always hung it.', 2400); return; }
    return _shed5();
  };
  const _groc5 = grocerAct;
  grocerAct = async function () {
    const pay = async (n, k) => { if (G.cash < n) { await think('Not enough cash.'); return false; } G.cash -= n; toast(`− ₹${n}`); give(k); return true; };
    if (active('k_batt') && !has('batteries')) { await say('c5_gro1'); if (await pay(60, 'batteries')) { done('k_batt'); await torchReady(); } return; }
    if (active('k_rope') && !has('rope')) { if (await pay(90, 'rope')) done('k_rope'); return; }
    if (active('k_batt2') && !has('batteries')) { await think("Vasu Chettan: 'Again batteries? That torch of yours must be eating them!'", 2400); if (await pay(60, 'batteries')) done('k_batt2'); return; }
    return _groc5();
  };
  const _t4 = targetFor4;
  targetFor4 = function (id) { return targetFor5(id) || _t4(id); };
}
async function torchReady() {
  if (has('flashlight') || !has('torch') || !has('batteries')) return;
  take('torch'); take('batteries'); give('flashlight'); await think('He drops the batteries into Appachan’s torch. It flickers, then holds. (F — flashlight)', 2600);
}
function targetFor5(id) {
  if (!id.startsWith('k_')) return null;
  const VV = (x, y) => ['village', x, y], M = (x, y) => ['millpath', x, y], I = (x, y) => ['mill', x, y], R = (x, y) => ['millroom', x, y], N5 = (list, map) => list.length ? nearestOf(list, map) : null;
  switch (id) {
    case 'k_flash': return ['house', 15, 2.1];
    case 'k_batt': case 'k_batt2': return VV(49, 4.4);
    case 'k_sickle': return VV(14, 16.2);
    case 'k_rope': return has('husk', 3) ? null : VV(15.1, 22.2);
    case 'k_crow': return VV(55.1, 4.6);
    case 'k_aidkit': return VV(35.75, 4.6);
    case 'k_go': return VV(36, 53.2);
    case 'k_veg': case 'k_trees': case 'k_bridge': { // always point at the next obstacle along the path
      const left = K_VEG.map(([x], i) => [x - 0.3, S['kv' + i]]).concat(K_TREES.map(([x], i) => [x - 0.3, S['kt' + i]]), [[20.6, S.bridgeDone]]).filter(o => !o[1]).sort((p, q) => p[0] - q[0]);
      return left.length ? M(left[0][0], 8.5) : null; }
    case 'k_aid': return M(25.2, 10.8);
    case 'k_mill': return M(40.75, 8);
    case 'k_mach': return I(4.6, 5.2);
    case 'k_books': return I(13.5, 4);
    case 'k_grain': return I(4.9, 12);
    case 'k_sacks': return N5(K_SACKS.map(([x, y]) => [x + 0.5, y + 1.2]).filter((_, i) => !S['ks' + i]), 'mill');
    case 'k_key': return I(17.5, 2.1);
    case 'k_rec': return R(4.5, 2.9);
    case 'k_led': return R(1.8, 3.7);
    case 'k_photo': return R(6.3, 1.9);
    case 'k_marks': return R(4.7, 4.4);
    case 'k_thomas': return ['radioshop', 5, 3.8];
    case 'k_belt': return S.metKabeer ? N5(SCRAP.filter((_, i) => !S['scrap' + i]), 'village') : VV(37.8, 38.6);
    case 'k_repair': return ['radioshop', 5, 3.8];
    case 'k_door': return VV(22.05, 24.4);
  }
  return null;
}
function doors5() {
  const D = {}, out = {
    house: [12.25, 15.7], library: [9, 11.5], teashop: [6, 7.6], radioshop: [5, 7.5], millroom: [4.5, 6.5], mill: [11, 13.4], millpath: [0.6, 8.5],
  };
  const maps = ['village', 'house', 'library', 'teashop', 'radioshop', 'millpath', 'mill', 'millroom'];
  const fromVillage = { house: [22, 23.2], library: [42.9, 26.2], teashop: [41, 4.4], radioshop: [40.9, 31.5], millpath: [36, 53.2], mill: [36, 53.2], millroom: [36, 53.2] };
  for (const a of maps) for (const b of maps) {
    if (a === b) continue;
    let p = a === 'village' ? fromVillage[b] : out[a];
    if (a === 'millpath' && (b === 'mill' || b === 'millroom')) p = [40.75, 7.8];
    if (a === 'mill' && b === 'millroom') p = [17.5, 1.9];
    D[a + '>' + b] = p;
  }
  return D;
}

// ======================= CHAPTER 5 — THE LOCKED ROOM =======================
async function chapter5() {
  save('ch5'); G.radioMute = false;
  Object.assign(DOORS, doors5());
  const wasCash = G.cash; resetWorld(); G.cash = wasCash < 2000 ? Math.max(wasCash, 200) : 480;
  G.chapter = 'Chapter 5 · The Locked Room'; G.day = 7; G.time = 7.6; G.timeRate = 0; G.timeMax = 12.5; G.rain = 0;
  AudioSys.setRain(0); AudioSys.setHum(0); AudioSys.setAmbience({ birds: true, night: false, frogs: false });
  Object.assign(S, { houseLights: true, bedMade: true, bulbFixed: true, unpacked: true, boxFound: true, win0: true, win1: true, dust0: true, dust1: true, dust2: true, kunOn: true, cocoOn: 0, swept: true, sawShirts: true,
    compostBin: true, pumpFixed: true, pumpWeeds: true, sickleSharp: true, debt: 85000, libOpen: true, libClean: true, shelfFixed: true, teaOpen: true, meeraV: true, exhibit: true, huskOn: true,
    beds: CROP_INFO.map(ci => ({ dug: true, crop: ci.crop, stage: 2, water: true })) });
  for (let i = 0; i < 6; i++) S['weed' + i] = true; for (let i = 0; i < 4; i++) { S['br' + i] = true; S['web' + i] = true; S['pile' + i] = true; S['shelved' + i] = true; } for (let i = 0; i < 3; i++) S['fence' + i] = true;
  LIB_HEAPS.forEach(([, , tx, ty], i) => { S['heap' + i] = true; const o = G.maps.library.objs.find(q => q.id === 'heap' + i); if (o) { o.x = tx * T; o.y = ty * T; o.h = 0.9 * T; } });
  S.scooter = { out: true, x: 25.4 * T, y: 25.9 * T, map: 'village', fuel: 1, fixed: true, lights: false, dusty: false, flat: false };
  G.player.outfit = 'mundu'; give('key', 1, true); give('photo1996', 1, true); give('knife', 1, true);
  G.hens = [makeHen(28.5, 18, COOP_ZONE), makeHen(30.5, 19, COOP_ZONE, '#e8dcc6'), makeHen(32, 17.8, COOP_ZONE), makeHen(29.4, 20, COOP_ZONE, '#b5532e', true)];
  CANOE.x = 62.9 * T; CANOE.y = 25.4 * T; CANOE.rower = false;
  AUTO.x = 24.4 * T; AUTO.y = 31.4 * T; AUTO.heading = Math.PI; AUTO.hidden = false; AUTO.passenger = false; G.entities = [CANOE, AUTO];
  const kun = vObj('kun'); kun.x = 54.6 * T; kun.y = 26.6 * T; kun.sitting = true; kun.dir = 'down';
  const sasi = vObj('sasi'); sasi.x = 55.1 * T; sasi.y = 4.4 * T; sasi.dir = 'down';
  const mee = vObj('meera'); mee.x = 28.6 * T; mee.y = 4.45 * T; mee.dir = 'down';
  const jom = vObj('jomon'); const lm = G.maps.library.objs.find(o => o.id === 'lmeera'); if (lm) { lm.x = 9.2 * T; lm.y = 3.4 * T; }
  setAmm('kitchen');
  hud(false); await fadeOut(10);
  await card('Chapter 5', 'Poottiya Muri', 'പൂട്ടിയ മുറി', 'The Locked Room', 3800);

  // Morning, the veranda: whose key is this?
  await goto('village', 21.4, 25.2, 'right', false);
  S.jomonOn = true; jom.x = 22.7 * T; jom.y = 25.2 * T; jom.dir = 'left';
  hud(true); Music.set('morning'); await fadeIn(1400);
  await scene(async () => {
    letterbox(true);
    await think('Arjun could not sleep. All night, one thing kept turning in his hand: the rusted key.', 3200);
    await say('c5_arj1'); await say('c5_jom1'); await say('c5_arj2');
    await think('Jomon looks toward the south, where the lane disappears into the trees.', 2400);
    await say('c5_jom2'); await say('c5_jom3'); await say('c5_arj3');
    letterbox(false);
    toast("Ammachi sold the cheera and chillies: + ₹650"); G.cash += 650;
  });
  (async () => { await moveTo(jom, 23.8, 30.6, 80); S.jomonOn = false; AUTO.passenger = false; AudioSys.sfx.engine(); await moveTo(AUTO, 24.4, 34.5, 60); AUTO.hidden = true; })();
  G.timeRate = 0.003;

  // Mission 12 — preparation
  setObj('Mission 12 — Prepare for the mill', [['k_flash', "Flashlight (Appachan's cupboard)"], ['k_sickle', 'Sickle (storage shed)'], ['k_rope', 'Coir rope — craft (C) from husks by the well, or buy at Vasu Stores (₹90)'], ['k_aidkit', 'First-aid kit (Latha Medicals, ₹150)'], ['k_batt', 'Batteries (Vasu Stores, ₹60)'], ['k_crow', 'Crowbar (borrow from Sasi Chettan)']]);
  setHook('cupboard', 'Take the flashlight', async () => { give('torch'); done('k_flash'); if (S.ammLoc !== 'none') { await say('c5_amm1'); await say('c5_arj4'); await think('He hates lying to her. But she has lost enough sleep already.', 2400); } await torchReady(); });
  setHook('sasi', 'Borrow a crowbar', async () => { await say('c5_sas1'); give('crowbar'); done('k_crow'); });
  const lathaHook = () => setHook('latha', 'Buy a first-aid kit (₹150)', async () => { if (G.cash < 150) { await think('Not enough cash.'); lathaHook(); return; } G.cash -= 150; toast('− ₹150'); await say('c5_lat1'); give('firstaid'); done('k_aidkit'); });
  lathaHook();
  setHook('meera', 'Talk to Meera', async () => think("Meera: 'The exhibition opens next week. If you find anything about the mill, anything at all, show me first.'", 3000), true);
  await waitAll();
  await torchReady();
  S.millRoad = true;
  setObj('Mission 12 — Reach the abandoned mill', [['k_go', 'Take the old mill road (south end of the lane)']]);
  await until(() => G.map.id === 'millpath' && G.locked === 0);
  done('k_go'); Music.set('tension');
  await scene(async () => { await caption('The old mill road', 2600, 'Nobody has walked it since 1996. Almost nobody.'); });
  setObj('Mission 12 — Reach the abandoned mill', [['k_veg', 'Cut through the thick vegetation (0/4)'], ['k_trees', 'Move the fallen trees (0/2)'], ['k_bridge', 'Cross the damaged bridge'], ['k_mill', 'Open the mill door']]);
  await waitAll();
  setObj('Mission 12 — The abandoned mill', [['k_books', 'Look at the burnt account books'], ['k_mach', 'Look at the machinery'], ['k_grain', 'Look at the old grain sacks']]);
  await waitAll();
  setObj('Mission 12 — The abandoned mill', [['k_sacks', 'Drag the sacks away from the back wall (0/3)'], ['k_key', 'Try the rusted key']]);
  await until(() => isDone('k_key') && G.map.id === 'millroom' && G.locked === 0);
  await scene(async () => { await caption('The locked room', 2600, 'Twenty-two years of dust. And footprints.'); });
  setObj('The locked room', [['k_marks', 'Look at the marks in the dust'], ['k_led', 'Open the ledger'], ['k_photo', 'Look at the photograph on the wall'], ['k_rec', 'Take the cassette recorder']]);
  await waitAll();
  S.roomDone = true; take('key');
  await scene(async () => { await think('The recorder is dead. But Appachan walked all this way, with his bad knee, to hide it here. It must say something.', 3600); });

  // Mission 13 — the recorder
  S.radioOpen = true; G.timeMax = 16.8;
  setObj('Mission 13 — Repair the cassette recorder', [['k_thomas', "Take the recorder to Thomas Chettan's radio shop (by the lane, south of the library)"]]);
  setHook('thomas', 'Talk to Thomas Chettan', async () => {
    S.metThomas = true; await say('c5_tho1'); await say('c5_arj13'); S.recOnBench = true; await say('c5_tho2'); await say('c5_tho3'); give('oldbelt'); await say('c5_tho4'); take('recorder'); done('k_thomas');
  });
  await until(() => isDone('k_thomas') && G.locked === 0); Music.set('day');
  setObj('Mission 13 — Repair the cassette recorder', [['k_batt2', 'Buy batteries (Vasu Stores, ₹60)'], ['k_belt', "Find a matching belt in Kabeer's scrap yard (₹40)"], ['k_repair', 'Repair the recorder with Thomas Chettan']]);
  setHook('kabeer', 'Talk to Kabeer', async () => { S.metKabeer = true; await say('c5_kab1'); });
  gate('thomas', 'Give Thomas Chettan the parts', () => has('belt') && has('batteries'), "Thomas: 'Batteries and the belt, mone. Both. Then we will wake it up.'", async () => {
    await say('c5_tho5'); await hold('Fitting the belt over the pulleys', 1800, AudioSys.sfx.knock); await hold('Putting in the batteries', 1000, AudioSys.sfx.knock); take('belt'); take('batteries'); take('oldbelt');
    await tapeGame(); await say('c5_tho6'); done('k_repair');
  });
  await waitAll();

  // Appachan's voice
  await scene(async () => {
    const th = G.maps.radioshop.objs.find(o => o.id === 'thomas');
    await moveTo(th, 2.6, 2.4, 60); await moveTo(th, 2.6, 6.6, 70); await moveTo(th, 5, 7.2, 70); S.thomasOut = true; th.x = 5 * T; th.y = 2.35 * T; th.dir = 'down';
    letterbox(true); Music.set(null); await fadeOut(800); TAPE.spin = true; const t0 = performance.now(); G.cine = (c, w, h) => sceneTape(c, w, h, (performance.now() - t0) / 1000); letterbox(false); await fadeIn(900);
    G.radioMute = true; AudioSys.sfx.tape(); setHiss(0.012); await sleep(1600);
    await sayTape('c5_tape1'); await sayTape('c5_tape2'); await sayTape('c5_tape3'); await sayTape('c5_tape4');
    AudioSys.sfx.tape(); TAPE.spin = false; setHiss(0); await sleep(2200);
    await fadeOut(800); endPainted(); S.recOnBench = false; give('recorder', 1, true); ITEM.recorder = 'Cassette recorder'; renderInv(); G.player.dir = 'down'; letterbox(true); Music.set('sad'); await fadeIn(900);
    await say('c5_arj14'); await say('c5_arj16');
    await think('Kunjumon saw. And somewhere, in a place only Arjun would remember, there is more.', 3400);
    letterbox(false);
  });
  await fadeOut(1400); clearObj(); if (G.riding) dismount();

  // That evening
  G.time = 19.4; G.timeRate = 0; AudioSys.setAmbience({ night: true, birds: false, frogs: true });
  S.kunOn = false; S.jomonOn = false; S.meeraV = false; S.verandaLight = true; S.thomasOut = false; setAmm('kitchen'); G.flashlight = false;
  if (S.scooter) Object.assign(S.scooter, { x: 25.4 * T, y: 25.9 * T, map: 'village' });
  await goto('house', 13, 12.4, 'down', false); Music.set('night');
  await card('', 'That evening', '', '', 1800); await fadeIn(1200);
  G.radioMute = false;
  await scene(async () => {
    await think('He has hidden the ledger and the recorder under his bed, wrapped in Appachan’s old towel.', 3000);
    AudioSys.sfx.doorknock(); await sleep(1900);
    await say('c5_amm2'); Music.set('tension');
  });
  S.envelopeOn = true;
  setObj('A knock at the door', [['k_door', 'See who is at the door']]);
  setHook('envelope', 'Pick up the envelope', async () => {
    done('k_door'); AudioSys.sfx.rustle(); S.envelopeOn = false; G.player.dir = 'down';
    await scene(async () => {
      await think('Nobody. Only a motorbike, far away on the road. And a brown envelope on the step.', 3000);
      await fadeOut(700); ENV.flip = 0; const t0 = performance.now(); G.cine = (c, w, h) => sceneEnvelope(c, w, h, (performance.now() - t0) / 1000); await fadeIn(900);
      await sleep(1600); await say('c5_arj18'); await sleep(700);
      const f0 = performance.now(); await new Promise(r => { const id = setInterval(() => { ENV.flip = clamp((performance.now() - f0) / 900, 0, 1); if (ENV.flip >= 1) { clearInterval(id); r(); } }, 16); });
      AudioSys.sfx.knock(); await sleep(3200);
      await fadeOut(900); endPainted(); G.player.dir = 'up'; await fadeIn(700);
      await say('c5_amm2'); await say('c5_arj17');
      await think('He slides the photograph into his shirt pocket, and looks once more into the dark.', 3200);
    });
    S.envDone = true;
  });
  await until(() => S.envDone && G.locked === 0);
  await fadeOut(2200); clearObj(); hud(false); G.running = false; G.day = 0; ITEM.recorder = 'Cassette recorder (broken)';
  AudioSys.setAmbience({ night: false, frogs: false }); Music.set('title');
  await card('End of Chapter 5', 'തുടരും', 'To be continued', 'Chapter 6 — A Village Full of Stories', 6000);
  showTitle();
}
