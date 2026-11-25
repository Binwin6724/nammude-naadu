// Nammude Naadu — QA player bot. Plays the game through the real keyboard controls (pathfinding + key presses) on a sped-up clock,
// and records what a player would notice: stuck spots, missing prompts, speakers who are not on screen, overlapping UI, errors.
// Load it in the running game (see docs/QA.md), then: QA.start(chapterIndex, speed)
(() => {
  const QA = window.QA = { log: [], issues: [], errs: [], lines: [], speed: 1, frames: [], on: false };
  const note = (k, t) => { const key = k + '|' + t; if (QA.issues.some(i => i.key === key)) return; QA.issues.push({ key, k, t, ch: G.chapter, obj: (Obj.items.find(i => !i.done) || {}).id }); };
  QA.note = note;
  for (const n of ['warn', 'error']) { const o = console[n]; console[n] = (...a) => { QA.errs.push(a.map(x => x && x.stack || x).join(' ').slice(0, 300)); o(...a); }; }
  addEventListener('error', e => QA.errs.push('E ' + e.message)); addEventListener('unhandledrejection', e => QA.errs.push('R ' + (e.reason && e.reason.stack || e.reason)));
  // ---- clock ----
  const rNow = performance.now.bind(performance), rST = window.setTimeout.bind(window), rSI = window.setInterval.bind(window); let base = rNow(), virt = rNow();
  QA.clock = k => { const n = performance.now(); virt = n; base = rNow(); QA.speed = k; };
  performance.now = () => virt + (rNow() - base) * QA.speed;
  window.setTimeout = (f, ms, ...a) => rST(f, (ms || 0) / QA.speed, ...a); window.setInterval = (f, ms, ...a) => rSI(f, Math.max(4, (ms || 0) / QA.speed), ...a);
  const mc = new MessageChannel(); let q = []; mc.port1.onmessage = () => { const c = q; q = []; const t = performance.now(); for (const f of c) f(t); };
  let lastF = 0; window.requestAnimationFrame = f => { q.push(f); if (q.length === 1) { const w = Math.max(0, 16 / Math.max(1, QA.speed) - (rNow() - lastF)); rST(() => { lastF = rNow(); mc.port2.postMessage(0); }, w); } return q.length; };
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  requestAnimationFrame(frame);
  // ---- voices: real durations are not needed for logic, use an estimate ----
  const look = { arjun: () => G.player.hidden ? null : G.player };
  function speakerPos(who) { if (look[who]) return look[who](); const l = G.map && G.map.objs.filter(o => o.voice === who && objVisible(o)); return l && l[0]; }
  QA.muteVoices = () => { AudioSys.voice = id => { const L = LINES[id]; QA.lines.push(id); return new Promise(r => setTimeout(r, Math.max(700, stripTags(L.ml).length * 60))); }; };
  const _say = say; say = async id => {
    const L = LINES[id]; if (!L) { note('missing-line', id); return; }
    if (G.map && !G.cine) { const s = speakerPos(L.who); if (!s) note('speaker-absent', `${id} (${L.who}) not on map ${G.map.id}`); else { const sx = (s.x - G.cam.x), sy = s.y - G.cam.y; if (sx < -10 || sy < -10 || sx > VW + 10 || sy > VH + 30) note('speaker-offscreen', `${id} (${L.who}) at ${(s.x / T).toFixed(1)},${(s.y / T).toFixed(1)}`); else { const p = G.player; if (s !== p && !p.hidden && Math.hypot(s.x - p.x, s.y - p.y) < 90) { const dx = p.x - s.x, dy = p.y - s.y, f = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[s.dir || 'down']; if (f[0] * dx + f[1] * dy < -8) note('speaker-faces-away', `${id} (${L.who}) dir ${s.dir}`); } } } }
    QA.log.push('SAY ' + id); return _say(id);
  };
  const _think = think; think = async (t, ms) => { QA.log.push('THINK ' + t.slice(0, 70)); if (ms && t.length > ms / 1000 * 26) note('think-too-fast', `${Math.round(t.length / (ms / 1000))} chars/s: "${t.slice(0, 60)}"`); return _think(t, ms); };
  const _card = card; card = async (...a) => { QA.log.push('CARD ' + a.slice(0, 4).filter(Boolean).join(' | ')); return _card(...a); };
  const _so = setObj; setObj = (t, i, o) => { QA.log.push('OBJ ' + t + ' :: ' + i.map(x => x[0])); return _so(t, i, o); };
  // ---- UI overlap watcher ----
  rSI(() => {
    if (!QA.on || !G.running) return; const vis = {};
    for (const id of ['obj', 'status', 'inv', 'prompt', 'sub', 'hold', 'np', 'toast', 'panel', 'pauseBtn', 'cap']) { const e = document.getElementById(id), cs = getComputedStyle(e); if (cs.display === 'none' || +cs.opacity < 0.3 || (id === 'toast' && !e.children.length)) continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; vis[id] = r; if (r.left < -1 || r.right > innerWidth + 1 || r.top < -1 || r.bottom > innerHeight + 1) note('ui-offscreen', id); }
    const k = Object.keys(vis); for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) { const a = vis[k[i]], b = vis[k[j]]; const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ox > 4 && oy > 4) note('ui-overlap', k[i] + ' / ' + k[j]); }
  }, 120);
  // ---- keys ----
  const fire = (t, k) => dispatchEvent(new KeyboardEvent(t, { key: k, bubbles: true })); const down = k => { if (!keys[k]) fire('keydown', k); }, up = k => { if (keys[k]) fire('keyup', k); };
  const press = k => { fire('keydown', k); rST(() => fire('keyup', k), 25); }; QA.press = press;
  const allUp = () => ['w', 'a', 's', 'd', 'shift', 'e'].forEach(up);
  // ---- pathfinding on the game's own collision boxes ----
  const ST = 8;
  function path(gx, gy, accept) {
    const sol = solidsNow(), W = G.map.w * T, Hh = G.map.h * T, p = G.player, free = (x, y) => x >= 9 && y >= 15 && x <= W - 9 && y <= Hh - 5 && !sol.some(s => hit({ x: x - 8, y: y - 6, w: 16, h: 9 }, s));
    const sx = Math.round(p.x / ST), sy = Math.round(p.y / ST), key = (a, b) => a * 4096 + b, prev = new Map(), qq = [[sx, sy]]; prev.set(key(sx, sy), -1); let best = null, bd = 1e9;
    for (let i = 0; i < qq.length && i < 60000; i++) { const [a, b] = qq[i], x = a * ST, y = b * ST, d = Math.hypot(x - gx, y - gy); if (d < bd) { bd = d; best = [a, b]; } if (d < 7 || (accept && d < 60 && accept(x, y))) { best = [a, b]; break; } for (const [u, v] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const na = a + u, nb = b + v, kk = key(na, nb); if (prev.has(kk) || !free(na * ST, nb * ST) || (u && v && (!free((a + u) * ST, y) || !free(x, (b + v) * ST)))) continue; prev.set(kk, [a, b]); qq.push([na, nb]); } }
    const out = []; let c = best; while (c && c !== -1) { out.unshift([c[0] * ST, c[1] * ST]); c = prev.get(key(c[0], c[1])); } return { pts: out, dist: bd };
  }
  QA.path = path;
  async function walk(gx, gy, o = {}) {
    let P = path(gx, gy).pts, i = 1, t0 = performance.now(), lx = G.player.x, ly = G.player.y, lm = t0; const m0 = G.map;
    while (i < P.length && G.running && G.map === m0) {
      await new Promise(r => requestAnimationFrame(r)); if (G.locked) { ['w', 'a', 's', 'd'].forEach(up); return 'locked'; }
      const p = G.player, [x, y] = P[i], dx = x - p.x, dy = y - p.y; if (Math.hypot(dx, dy) < (G.riding ? 14 : 9)) { i++; continue; }
      dx > 3 ? (down('d'), up('a')) : dx < -3 ? (down('a'), up('d')) : (up('a'), up('d')); dy > 3 ? (down('s'), up('w')) : dy < -3 ? (down('w'), up('s')) : (up('w'), up('s')); o.run === false ? up('shift') : down('shift');
      if (Math.hypot(p.x - lx, p.y - ly) > 6) { lx = p.x; ly = p.y; lm = performance.now(); } else if (performance.now() - lm > 2200) { note('walk-blocked', `${G.map.id} ${(p.x / T).toFixed(1)},${(p.y / T).toFixed(1)} → ${(gx / T).toFixed(1)},${(gy / T).toFixed(1)}`); break; }
      if (performance.now() - t0 > 90000) break;
    }
    ['w', 'a', 's', 'd', 'shift'].forEach(up); return 'ok';
  }
  QA.walk = walk;
  const label = o => typeof o.label === 'function' ? o.label() : o.label;
  // ---- mini games ----
  async function mini() {
    const b = G._bridge && QA.mode === 'bridge', box = () => document.getElementById('mini').style.display === 'flex';
    const t0 = performance.now(); let on = false;
    while (box() && G.running && performance.now() - t0 < 240000) {
      await new Promise(r => requestAnimationFrame(r));
      if (QA.mini === 'bridge') { const s = G._bridge.state(); on = on ? s.strain < 0.65 : s.strain < 0.1; on ? down('e') : up('e'); }
      else if (QA.mini === 'tape') { const s = G._tape.state(); s.ang < s.target - 0.015 ? (down('d'), up('a')) : s.ang > s.target + 0.015 ? (down('a'), up('d')) : (up('a'), up('d')); }
      else if (QA.mini === 'fish') { const s = G._fish ? G._fish() : null; if (s) { if (s.st === 'ready' || s.st === 'bite' || s.st === 'result') { up('e'); press('e'); await new Promise(r => setTimeout(r, 400)); } else if (s.st === 'reel') { !s.pull && s.ten < 0.7 ? down('e') : up('e'); } } }
      else if (QA.mini === 'cook') { const s = G._cook ? G._cook() : null; if (s) s.heat < (s.lo + s.hi) / 2 ? down('e') : up('e'); }
      else if (QA.mini === 'ball') { if (performance.now() - t0 > 4000) { press('escape'); press('e'); await new Promise(r => setTimeout(r, 1200)); } }
    } allUp();
  }
  for (const [n, k] of [['bridgeGame', 'bridge'], ['tapeGame', 'tape'], ['fishingGame', 'fish'], ['cookingGame', 'cook'], ['footballGame', 'ball']]) { const f = window[n] || eval(n); const w = (...a) => { QA.mini = k; QA.log.push('MINI ' + k); rST(mini, 60); return f(...a); }; eval(n + ' = w'); }
  // ---- main loop: do what the HUD asks ----
  QA.start = async (i, speed = 8) => {
    QA.on = true; QA.muteVoices(); if (i != null) { resetWorld(); startChapter(i); } QA.clock(speed); let miss = 0, same = 0, lastSig = '', tObj = performance.now();
    while (QA.on) {
      await new Promise(r => requestAnimationFrame(r));
      if (!G.running) { await new Promise(r => rST(r, 60)); if (document.getElementById('title').style.display !== 'none' && QA.log.length > 4) { QA.log.push('TITLE'); QA.on = false; break; } continue; }
      if (document.getElementById('hold').style.display === 'block') { down('e'); continue; }
      if (document.getElementById('mini').style.display === 'flex') { await new Promise(r => rST(r, 40)); continue; }
      if (G.locked) { if (!document.getElementById('mini').style.display.includes('flex')) up('e'); await new Promise(r => rST(r, 12)); if (performance.now() - tObj > 600000) { note('locked-forever', Obj.title); tObj = performance.now(); } continue; }
      up('e'); const sig = Obj.title + Obj.items.filter(x => !x.done).map(x => x.id) + JSON.stringify(G.inv); if (sig !== lastSig) { lastSig = sig; tObj = performance.now(); }
      if (performance.now() - tObj > 400000) { note('no-progress', sig.slice(0, 140) + ' @' + G.map.id + ' ' + (G.player.x / T).toFixed(1) + ',' + (G.player.y / T).toFixed(1)); tObj = performance.now(); }
      if (active('ride') && !G.riding) { await walk(S.scooter.x, S.scooter.y); press('v'); await new Promise(r => setTimeout(r, 400)); continue; }
      if ((active('craft') && has('bamboo') && has('line') && has('hook')) || (active('compost') && has('planks', 2) && has('nails') && has('leaves')) || (active('k_rope') && has('husk', 3))) { press('c'); await new Promise(r => setTimeout(r, 400)); press('e'); await new Promise(r => setTimeout(r, 3500)); if (document.getElementById('panel').style.display === 'block') { press('escape'); await new Promise(r => setTimeout(r, 300)); } continue; }
      const g = currentGoal(); if (!g) { await new Promise(r => rST(r, 40)); miss++; if (miss > 60 && Obj.items.some(x => !x.done)) { note('no-marker', Obj.items.filter(x => !x.done).map(x => x.id).join() + ' on ' + G.map.id); miss = 0; } continue; } miss = 0;
      let [m, x, y] = g; if (m !== G.map.id) { const d = DOORS[G.map.id + '>' + m]; if (!d) { note('no-door-marker', G.map.id + '>' + m); if (G.map.id !== 'village' && G.map.id !== 'house') { const ex = G.map.objs.find(o => o.label && /outside|Leave|Back/.test(label(o))); if (ex) { await walk(ex.x + ex.w / 2, ex.y); press('e'); } } await new Promise(r => setTimeout(r, 800)); continue; } [x, y] = d; }
      const r = await walk(x * T, y * T); if (r === 'locked' || !G.running) continue; await new Promise(r => setTimeout(r, 120)); if (G.locked) continue;
      const t = findTarget(), d = Math.hypot(G.player.x - x * T, G.player.y - y * T); if (!t) { if (d > 34 && !G.riding) note('goal-unreachable', `${Obj.items.filter(q => !q.done).map(q => q.id)[0]} ${G.map.id} goal ${x.toFixed(1)},${y.toFixed(1)} stopped ${(G.player.x / T).toFixed(1)},${(G.player.y / T).toFixed(1)}`); same++; if (same > 8) { note('no-prompt', `${Obj.items.filter(q => !q.done).map(q => q.id)[0]} at ${G.map.id} ${x.toFixed(1)},${y.toFixed(1)}`); same = 0; G.player.x = clamp(G.player.x + rnd(-30, 30), 20, G.map.w * T - 20); } await new Promise(r => setTimeout(r, 300)); continue; }
      const before = sig; QA.log.push('E ' + label(t)); press('e'); await new Promise(r => setTimeout(r, 350));
      if (!G.locked) { same++; if (same > 12) { note('e-no-effect', label(t) + ' for ' + Obj.items.filter(q => !q.done).map(q => q.id)[0]); same = 0; const a = Math.random() * 6.28; await walk(G.player.x + Math.cos(a) * 60, G.player.y + Math.sin(a) * 60); } } else { same = lastSig === before ? same + 0.5 : 0; if (same > 12) { note('loops', label(t) + ' for ' + Obj.items.filter(q => !q.done).map(q => q.id)[0]); same = 0; const a = Math.random() * 6.28; await walk(G.player.x + Math.cos(a) * 60, G.player.y + Math.sin(a) * 60); } }
    }
    allUp();
  };
  QA.report = () => ({ title: Obj.title, left: Obj.items.filter(i => !i.done).map(i => i.id), map: G.map && G.map.id, pos: [(G.player.x / T).toFixed(1), (G.player.y / T).toFixed(1)], locked: G.locked, issues: QA.issues.map(i => `[${i.k}] ${i.t} {${i.obj || ''}}`), errs: QA.errs, log: QA.log.slice(-14) });
})();
// Loads every saved checkpoint in turn and checks the game really continues from it.
window.QACP = async (secs = 9) => {
  const snaps = JSON.parse(localStorage.getItem('qa_snaps') || '{}'), out = []; QA.muteVoices(); QA.on = false;
  for (const k of Object.keys(snaps)) {
    const s = JSON.parse(snaps[k]), i = CHAPTERS.findIndex(c => c.key === s.key); localStorage.setItem('nn_chapter', s.key); localStorage.setItem('nn_snap', snaps[k]); QA.log = []; QA.errs = [];
    QA.clock(8); startChapter(i, s.n); const t = Date.now(); while (Date.now() - t < 3000 && !(G.running && Obj.items.length && !G.locked)) await new Promise(r => requestAnimationFrame(r));
    const at = `${G.map && G.map.id}`, first = Obj.title, n0 = QA.log.length; QA.on = true; const p = QA.start(null, 10); await new Promise(r => requestAnimationFrame(r)); const t2 = Date.now(); while (Date.now() - t2 < secs * 1000) await new Promise(r => requestAnimationFrame(r)); QA.on = false; await new Promise(r => requestAnimationFrame(r));
    out.push(`${k}: started on ${at} "${first}" day ${G.day} cash ${G.cash} → now "${Obj.title}" left [${Obj.items.filter(x => !x.done).map(x => x.id)}] actions ${QA.log.length - n0} errs ${QA.errs.length}${QA.errs[0] ? ' ' + QA.errs[0].slice(0, 90) : ''}`); window.__cp = out; G.run++; keyListeners.clear();
  } return out;
};
