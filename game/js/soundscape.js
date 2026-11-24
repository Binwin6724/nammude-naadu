// ===== Nammude Naadu — living soundscapes =====
// Every place has its own sound. Beds fade in and out with distance, time of day, weather and walls.
const Soundscape = (() => {
  const beds = {}, WANT = {};
  // trim per recording (dB, relative to the common -30 dB RMS reference)
  const TRIM = { river: 1, garden: 0, paddy: -1, street: 4, teashop: 2, forest: 0, night: -2, frogs: -4, mill: 8, house: 9, kitchen: 4, rain: 2, school: 0, hens: -2, pond: -1 };
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const fall = (d, r) => Math.pow(clamp01(1 - d / r), 1.7);
  const rectDist = (x, y, [rx, ry, rw, rh]) => Math.hypot(Math.max(rx - x, 0, x - rx - rw), Math.max(ry - y, 0, y - ry - rh));

  function bed(name) {
    if (beds[name]) return beds[name];
    const b = beds[name] = { ready: false }; const ctx = AudioSys.ctx();
    b.lp = ctx.createBiquadFilter(); b.lp.type = 'lowpass'; b.lp.frequency.value = 12000; b.lp.Q.value = -3; b.pan = ctx.createStereoPanner(); b.g = ctx.createGain(); b.g.gain.value = 0;
    b.lp.connect(b.pan); b.pan.connect(b.g); b.g.connect(AudioSys.ambBus());
    AudioSys.getLoop(name).then(buf => { if (!buf) return; // two copies at slightly different speeds, so the loop never audibly repeats
      [[1, 0], [0.93, buf.duration * 0.47]].forEach(([rate, off]) => { const s = ctx.createBufferSource(), h = ctx.createGain(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate; h.gain.value = 0.7; s.connect(h); h.connect(b.lp); s.start(0, off); }); b.ready = true; });
    return b;
  }
  const want = (name, g, o = {}) => { const w = WANT[name]; if (!w || g > w.g) WANT[name] = { g, lp: o.lp || 12000, pan: o.pan || 0 }; };
  const panTo = (x, tx, w = 12) => Math.max(-0.75, Math.min(0.75, (tx - x) / w));
  function dayness() { const h = G.time; if (AudioSys.flags.night) return 0; return clamp01(Math.min((h - 5.3) / 1.2, (19 - h) / 1.4)); }

  function compute() {
    for (const k in WANT) delete WANT[k];
    let verb = 0.02;
    if (!G.running || !G.map) { if ($('title').style.display !== 'none') { want('river', 0.5, { pan: 0.2 }); want('frogs', 0.2); want('night', 0.25); } return verb; }
    const m = G.map.id, x = G.player.x / T, y = G.player.y / T, d = dayness(), n = 1 - d, rain = AudioSys.flags.rain || 0, dry = 1 - 0.75 * rain;
    if (G.cine) { if (rain > 0.1) want('rain', rain * 0.4, { lp: 2500 }); else want(n > 0.5 ? 'night' : 'paddy', 0.25); return verb; }
    if (m === 'village') {
      want('river', 0.95 * fall(Math.max(0, 61.5 - x), 17), { pan: panTo(x, 64, 14), lp: 2500 + 9000 * fall(Math.max(0, 61.5 - x), 10) });
      want('pond', 0.9 * fall(Math.max(0, Math.hypot((x - 49) / 1.15, y - 34) - 4), 7), { pan: panTo(x, 49) });
      const gd = Math.min(rectDist(x, y, [10, 12, 24, 24]), rectDist(x, y, [12, 37, 21, 8.6]), rectDist(x, y, [1, 30, 8, 12]));
      want('garden', (0.16 + 0.84 * fall(gd, 10)) * d * dry);
      want('paddy', 0.9 * fall(Math.min(rectDist(x, y, [0, 8, 9.5, 19]), rectDist(x, y, [38.5, 8, 19.5, 12])), 8) * (0.35 + 0.65 * d) * dry);
      want('street', 0.85 * fall(Math.hypot(Math.max(0, 38 - x, x - 58), (y - 5) * 1.0), 13) * d * dry, { pan: panTo(x, 48, 16) });
      if (G.time > 8.5 && G.time < 16) want('school', 0.9 * fall(Math.hypot(x - 28.5, (y - 2) * 1.1), 13) * dry, { pan: panTo(x, 28.5) });
      const sh = fall(Math.hypot(x - 41, y - 3.6), 8) * (G.time > 6 && G.time < 20.5 ? 1 : 0); want('teashop', 0.5 * sh, { lp: 1100, pan: panTo(x, 41, 9) });
      let hd = 99, hx = x; for (const h of G.hens) if (!h.hidden) { const q = Math.hypot(h.x / T - x, h.y / T - y); if (q < hd) { hd = q; hx = h.x / T; } } want('hens', 0.75 * fall(hd, 6) * d, { pan: panTo(x, hx, 6) });
      want('forest', 0.85 * clamp01((y - 45) / 6) * (0.4 + 0.6 * d));
      want('night', 0.8 * n * dry); const wet = Math.max(fall(Math.max(0, Math.hypot(x - 49, y - 34) - 4), 14), fall(rectDist(x, y, [0, 8, 9.5, 19]), 10), fall(rectDist(x, y, [38.5, 8, 19.5, 12]), 10)); want('frogs', (0.18 + 0.7 * wet) * n);
      if (rain > 0.02) want('rain', rain);
    } else if (m === 'millpath') {
      const s = fall(Math.max(0, Math.abs(x - 22.5) - 1.5), 12); want('forest', 0.9 * dry); want('garden', 0.2 * d); want('river', 0.85 * s, { pan: panTo(x, 22.5, 8), lp: 3000 + 8000 * s }); want('mill', 0.35 * fall(Math.hypot(x - 40.7, y - 7), 7), { lp: 900 }); if (n > 0.2) want('night', 0.7 * n);
    } else if (m === 'mill') { want('mill', 1); want('forest', 0.28 * fall(Math.hypot(x - 11, y - 13.5), 7), { lp: 1800 }); verb = 0.3; }
    else if (m === 'millroom') { want('mill', 0.5, { lp: 600 }); verb = 0.2; }
    else if (m === 'house') {
      want('house', 0.75); want('garden', 0.5 * d * dry, { lp: 800 }); want('night', 0.45 * n, { lp: 1000 }); want('frogs', 0.2 * n, { lp: 700 });
      if (S.ammLoc === 'kitchen' || S.ammLoc === 'table' || active('cook')) want('kitchen', 0.9 * fall(Math.hypot(x - 18.2, y - 1.6), 8), { pan: panTo(x, 18.2, 7) });
      if (rain > 0.02) want('rain', rain * 0.75, { lp: 1300 }); verb = 0.05;
    } else if (m === 'teashop') { want('teashop', 1); want('street', 0.3 * d, { lp: 900, pan: panTo(x, 6, 8) }); if (rain > 0.02) want('rain', rain * 0.6, { lp: 1200 }); verb = 0.04; }
    else if (m === 'library') { want('house', 0.8); want('garden', 0.28 * d, { lp: 900 }); verb = 0.13; }
    else if (m === 'radioshop') { want('house', 0.55); want('paddy', 0.25 * d, { lp: 800 }); verb = 0.04; }
    else if (m === 'church') { if (rain > 0.02) want('rain', Math.min(1, rain * 1.1)); else want('garden', 0.4); verb = 0.06; }
    return verb;
  }
  function tick() {
    if (!AudioSys.live()) return;
    const verb = compute(), t = AudioSys.ctx().currentTime; AudioSys.setReverb(verb);
    for (const name of new Set([...Object.keys(beds), ...Object.keys(WANT)])) {
      const w = WANT[name]; if (!w || w.g < 0.012) { if (beds[name]) beds[name].g.gain.setTargetAtTime(0, t, 0.6); continue; }
      const b = bed(name); b.g.gain.setTargetAtTime(w.g * AudioSys.db(TRIM[name] || 0), t, 0.5); b.lp.frequency.setTargetAtTime(w.lp, t, 0.4); b.pan.pan.setTargetAtTime(w.pan, t, 0.3);
    }
    Radio.tick();
  }
  setInterval(tick, 180);
  return { state: () => Object.fromEntries(Object.entries(WANT).filter(([, w]) => w.g >= 0.012).map(([k, w]) => [k, +w.g.toFixed(2)])), tick, compute, beds };
})();

// ======================= THE RADIOS =======================
// Balan's tea shop: old Malayalam film songs streamed from the record label's own YouTube uploads (in YouTube's player),
// or the bundled original song. Thomas Chettan's shop plays the bundled song softly among the old sets.
const Radio = (() => {
  const STATIONS = [
    { name: 'പഴയ പാട്ടുകൾ · Old film songs', yt: 'yjAE_deDh8U', sub: 'Prem Nazir · K. J. Yesudas hits (Saregama Carvaan Malayalam)' },
    { name: 'ചെമ്മീൻ · Chemmeen (1965)', yt: 'NQv9PsOglSI', sub: 'Film songs jukebox (Saregama Malayalam)' },
    { name: 'നമ്മുടെ നാട് · 1968', file: 'nammude-naadu-1968', sub: 'Original song made for this game' },
    { name: 'Off', off: true, sub: '' },
  ];
  let st = +(localStorage.getItem('nn_station') || 0), failed = false, cur = '', vol = -1, pos = {}, node = null, ytOn = false, trying = false, retryAt = 0;
  if (!STATIONS[st]) st = 0;
  // how well the tea shop radio can be heard from where Arjun stands: 0 to 1
  function heard() {
    if (!G.running || !G.map || G.cine || G.radioMute) return 0;
    if (G.map.id === 'teashop') return 1;
    if (G.map.id !== 'village' || G.time < 6 || G.time > 20.5) return 0;
    const d = Math.hypot(G.player.x / T - 41, G.player.y / T - 3.8); return d > 9 ? 0 : 0.42 * Math.pow(1 - d / 9, 1.4);
  }
  // ---- bundled song, played through a small wooden radio ----
  async function ensureFile() {
    if (node) return node; node = { g: null }; const ctx = AudioSys.ctx(), n = node;
    const el = new Audio('audio/music/nammude-naadu-1968.mp3'); el.loop = true; el.preload = 'auto'; n.el = el;
    const s = ctx.createMediaElementSource(el), h = ctx.createBiquadFilter(), l = ctx.createBiquadFilter(), p = ctx.createBiquadFilter(); n.g = ctx.createGain(); n.pan = ctx.createStereoPanner(); n.lp = l; n.g.gain.value = 0;
    h.type = 'highpass'; h.frequency.value = 260; l.type = 'lowpass'; l.frequency.value = 3600; p.type = 'peaking'; p.frequency.value = 1300; p.gain.value = 3; p.Q.value = 0.8;
    s.connect(h); h.connect(p); p.connect(l); l.connect(n.pan); n.pan.connect(n.g); n.g.connect(AudioSys.radioBus());
    // a little valve hiss and mains warmth
    const z = ctx.createBufferSource(), zf = ctx.createBiquadFilter(), zg = ctx.createGain(); z.buffer = AudioSys.noise(); z.loop = true; zf.type = 'bandpass'; zf.frequency.value = 1500; zf.Q.value = 0.4; zg.gain.value = 0.004; z.connect(zf); zf.connect(zg); zg.connect(n.g); z.start();
    return n;
  }
  function fileLevel(v, lp, pan) {
    if (v < 0.01) { if (node && node.g) { node.g.gain.setTargetAtTime(0, AudioSys.ctx().currentTime, 0.4); if (!node.el.paused && node.quietAt && performance.now() - node.quietAt > 2500) node.el.pause(); node.quietAt = node.quietAt || performance.now(); } return; }
    ensureFile().then(n => { n.quietAt = 0; if (n.el.paused) n.el.play().catch(() => { }); const t = AudioSys.ctx().currentTime; n.g.gain.setTargetAtTime(v * 0.28, t, 0.4); n.lp.frequency.setTargetAtTime(lp, t, 0.4); n.pan.pan.setTargetAtTime(pan, t, 0.3); });
  }
  // ---- YouTube stations ----
  async function startYT(id) {
    if (trying || performance.now() < retryAt) return; trying = true;
    const ok = await loadYT(); if (!ok || !window.YT || !YT.Player) { failed = true; trying = false; return; }
    const go = p => { try { p.setVolume(0); p.loadVideoById({ videoId: id, startSeconds: pos[id] || 0 }); } catch (e) { failed = true; } };
    if (ytPlayer && ytPlayer.loadVideoById) go(ytPlayer);
    else ytPlayer = new YT.Player('ytp', { width: 200, height: 200, videoId: id, playerVars: { autoplay: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
      events: { onReady: e => { e.target.setVolume(0); e.target.playVideo(); }, onError: () => { failed = true; } } });
    cur = id; ytOn = true; trying = false; const t0 = performance.now();
    const chk = setInterval(() => { let s = -2; try { s = ytPlayer.getPlayerState(); } catch (e) { } if (s === 1 || s === 3) { clearInterval(chk); failed = false; } else if (performance.now() - t0 > 9000) { clearInterval(chk); if (cur === id && ytOn) failed = true; } }, 400);
  }
  function stopYT() { if (!ytOn) return; try { if (cur) pos[cur] = ytPlayer.getCurrentTime(); ytPlayer.pauseVideo(); } catch (e) { } ytOn = false; vol = -1; card(false); }
  function card(on, s) { const np = $('np'); if (on) { np.querySelector('.k').textContent = "📻 Balan's radio"; np.querySelector('.t').textContent = s.name; np.classList.add('yt'); np.style.opacity = 1; } else if (np.dataset.song !== '1') { np.style.opacity = 0; np.classList.remove('yt'); } }
  function tick() {
    const v = heard(), s = STATIONS[st], V = AudioSys.vols(); let out = 0;
    AudioSys.setMusicDuck(v > 0.02 && !s.off ? 1 - Math.min(1, v * 2.6) : G.map && G.map.id === 'radioshop' && G.running ? 0.35 : 1);
    const useFile = s.file || (s.yt && failed);
    if (v > 0.015 && !s.off && !useFile) {
      if (!ytOn || cur !== s.yt) { if (ytOn) stopYT(); startYT(s.yt); }
      else { const want = Math.round(34 * v * V.a * (V.duck < 1 ? 0.35 : 1)); if (vol < 0) vol = 0; vol += Math.max(-4, Math.min(4, want - vol)); try { ytPlayer.setVolume(Math.max(0, Math.round(vol))); if (ytPlayer.getPlayerState() === 2 || ytPlayer.getPlayerState() === 5) ytPlayer.playVideo(); } catch (e) { } card(true, s); }
    } else if (ytOn) { if (vol > 3) { vol -= 4; try { ytPlayer.setVolume(Math.round(vol)); } catch (e) { } } else stopYT(); }
    if (useFile && v > 0.015) out = v;
    if (G.running && G.map && G.map.id === 'radioshop' && !G.radioMute && !G.cine) fileLevel(0.5, 2600, 0.25);
    else fileLevel(out, G.map && G.map.id === 'teashop' ? 3600 : 1100, G.map && G.map.id === 'village' ? Math.max(-0.7, Math.min(0.7, (41 - G.player.x / T) / 8)) : 0.35);
  }
  function next() { if (ytOn) stopYT(); st = (st + 1) % STATIONS.length; failed = false; localStorage.setItem('nn_station', st); AudioSys.sfx.tape(); toast(`📻 ${STATIONS[st].name}`); }
  function hush() { try { if (ytOn) ytPlayer.pauseVideo(); } catch (e) { } if (node && node.el) node.el.pause(); }
  return { tick, next, hush, STATIONS, get station() { return STATIONS[st]; }, set: i => { if (ytOn) stopYT(); st = i; failed = false; localStorage.setItem('nn_station', i); }, dbg: () => ({ st, failed, ytOn, vol, cur, heard: heard(), file: node && node.el && !node.el.paused }) };
})();
// the radio on Balan's shelf
addObj('teashop', { x: 10.4, y: 1.2, w: 1.2, h: 0.5, reach: 10, label: () => `Change the radio station (${Radio.station.name})`, act: async () => Radio.next() });
document.addEventListener('visibilitychange', () => { if (document.hidden) Radio.hush(); });

// doors open and close as you move between places
{
  const _gotoS = goto, OUT = { village: 1, millpath: 1, church: 1 };
  goto = async function (id, ...a) { if (G.map && G.running && G.map.id !== id && !G.cine && (OUT[id] ? 1 : 0) !== (OUT[G.map.id] ? 1 : 0) && a[3] !== false) AudioSys.sfx.door(); return _gotoS(id, ...a); };
}
