// ===== Nammude Naadu — audio engine =====
// One mixer for everything. Every voice and recording is measured when it loads and brought to the same loudness,
// then passes through a limiter with a fixed ceiling, so nothing in the game can ever jump out of the speakers.
//   voice ─┐
//   sfx   ─┼─► mix ─► limiter ─► ceiling (-3 dB) ─► fade ─► speakers        voice + sfx also feed a room reverb
//   amb   ─┤  (amb, music and radio duck under dialogue)
//   music ─┘
const AudioSys = (() => {
  let ctx, mix, fade, voiceBus, sfxBus, ambVol, ambBus, musicVol, musicBus, radioBus, revIn, revGain, noiseBuf, hum, air;
  let vVol = 1, aVol = 0.9, mVol = 0.6, duck = 1, musicDuck = 1;
  const amb = { night: false, birds: false, rain: 0, frogs: false };
  const db = x => Math.pow(10, x / 20);
  const CEIL = db(-3);
  const live = () => !!ctx && ctx.state === 'running';

  function init() {
    if (ctx) { if (ctx.state !== 'running') ctx.resume(); return; }
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mix = ctx.createGain();
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 32; hp.Q.value = -3;
    const air1 = ctx.createBiquadFilter(); air1.type = 'highshelf'; air1.frequency.value = 7000; air1.gain.value = -3; // softer top end, kinder on headphones
    const lim = ctx.createDynamicsCompressor(); lim.threshold.value = -9; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.2;
    const post = ctx.createGain(); post.gain.value = db(-5.13); // cancels the make-up gain browsers add inside the compressor
    const ceil = ctx.createWaveShaper(); const cv = new Float32Array(4097);
    for (let i = 0; i < 4097; i++) { const x = i / 2048 - 1, a = Math.abs(x), y = a < 0.5 ? a : 0.5 + (CEIL - 0.5) * Math.tanh((a - 0.5) / (CEIL - 0.5)); cv[i] = Math.sign(x) * y; } ceil.curve = cv;
    fade = ctx.createGain(); fade.gain.value = 0;
    mix.connect(hp); hp.connect(air1); air1.connect(lim); lim.connect(post); post.connect(ceil); ceil.connect(fade); fade.connect(ctx.destination);
    // buses
    voiceBus = ctx.createGain();
    const vhp = ctx.createBiquadFilter(); vhp.type = 'highpass'; vhp.frequency.value = 75;
    const vc = ctx.createDynamicsCompressor(); vc.threshold.value = -20; vc.knee.value = 0; vc.ratio.value = 2.5; vc.attack.value = 0.008; vc.release.value = 0.18;
    const vpost = ctx.createGain(); vpost.gain.value = db(-0.6 * 12);
    voiceBus.connect(vhp); vhp.connect(vc); vc.connect(vpost); vpost.connect(mix);
    sfxBus = ctx.createGain(); sfxBus.connect(mix);
    ambVol = ctx.createGain(); ambBus = ctx.createGain(); ambBus.connect(ambVol); ambVol.connect(mix);
    musicVol = ctx.createGain(); musicBus = ctx.createGain(); musicBus.connect(musicVol); musicVol.connect(mix);
    radioBus = ctx.createGain(); radioBus.connect(mix);
    // room reverb
    revIn = ctx.createGain(); const conv = ctx.createConvolver(); conv.buffer = impulse(1.9); revGain = ctx.createGain(); revGain.gain.value = 0;
    revIn.connect(conv); conv.connect(revGain); revGain.connect(mix); vpost.connect(revIn); sfxBus.connect(revIn);
    // noise source, with no DC so filters and feedback loops stay centred
    const len = ctx.sampleRate * 3; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate); const d = noiseBuf.getChannelData(0); let last = 0, dc = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = last * 0.985 + w * 0.03; const x = w * 0.5 + last * 2; dc += (x - dc) * 0.002; d[i] = x - dc; }
    hum = drone(180); air = drone(260);
    ctx.onstatechange = () => { if (ctx.state === 'running') wake(); };
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) { ramp(fade, 0, 0.25); setTimeout(() => { if (document.hidden) ctx.suspend(); }, 350); } else ctx.resume().then(wake); });
    for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { if (ctx.state !== 'running' && !document.hidden) ctx.resume(); });
    applyVolumes(); wake(); loadSfx();
  }
  function wake() { if (!ctx) return; fade.gain.cancelScheduledValues(ctx.currentTime); fade.gain.setValueAtTime(0, ctx.currentTime); fade.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.9); }
  function impulse(s) { const n = ctx.sampleRate * s, b = ctx.createBuffer(2, n, ctx.sampleRate); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { lp = lp * 0.6 + (Math.random() * 2 - 1) * 0.4; d[i] = lp * Math.pow(1 - i / n, 3); } } return b; }
  function loopNoise() { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.start(); return s; }
  function drone(f) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = f; lp.Q.value = -3; const g = ctx.createGain(); g.gain.value = 0; loopNoise().connect(lp); lp.connect(g); g.connect(ambBus); return g; }
  function ramp(g, v, t = 1) { if (ctx && isFinite(v)) g.gain.setTargetAtTime(v, ctx.currentTime, Math.max(0.01, t / 3)); }
  function applyVolumes() { if (!ctx) return; ramp(sfxBus, aVol, 0.1); ramp(voiceBus, vVol, 0.1); ramp(ambVol, aVol * duck, 0.4); ramp(musicVol, mVol * 1.5 * duck * musicDuck, 0.8); ramp(radioBus, aVol * duck, 0.4); }
  function setDuck(on) { duck = on ? 0.5 : 1; applyVolumes(); }

  // ---------- loading & loudness ----------
  async function fetchBuf(url, tries = 3) {
    for (let i = 1; ; i++) {
      try { const r = await fetch(url); if (!r.ok) throw Object.assign(new Error(url + ' ' + r.status), { fatal: r.status === 404 }); return await ctx.decodeAudioData(await r.arrayBuffer()); }
      catch (e) { if (i >= tries || e.fatal) throw e; await new Promise(r => setTimeout(r, 400 * i)); } // slow or patchy connection: try again
    }
  }
  // gated loudness of a recording (RMS of the parts that are actually sounding) and its peak
  function measure(b) {
    const d = b.getChannelData(0), w = Math.floor(b.sampleRate * 0.2), bl = []; let peak = 0;
    for (let i = 0; i < d.length; i += w) { let e = 0, n = 0; for (let j = i; j < Math.min(d.length, i + w); j += 2) { const v = d[j]; e += v * v; n++; const a = v < 0 ? -v : v; if (a > peak) peak = a; } if (n) bl.push(e / n); }
    const top = Math.max(...bl, 1e-9), ok = bl.filter(e => e > top * 0.01), m = ok.reduce((a, c) => a + c, 0) / Math.max(1, ok.length);
    return { rms: Math.sqrt(m), peak };
  }
  // turn a recording into a seamless loop by folding its tail into its head
  function makeLoop(b, x = 0.8) {
    const n = Math.floor(Math.min(x, b.duration / 4) * b.sampleRate), L = b.length - n, ch = matchMedia('(pointer: coarse)').matches ? 1 : b.numberOfChannels, o = ctx.createBuffer(ch, L, b.sampleRate); // phones keep one channel, half the memory
    for (let c = 0; c < ch; c++) { const s = b.getChannelData(c), d = o.getChannelData(c); for (let i = 0; i < L; i++) d[i] = s[i]; for (let i = 0; i < n; i++) { const k = i / n; d[i] = s[i] * Math.sqrt(k) + s[L + i] * Math.sqrt(1 - k); } }
    return o;
  }
  const loopCache = {};
  // returns a looping recording at a known level: 0 dB here = -30 dB RMS, peaks never above -14 dB
  function getLoop(name, dir = 'amb') {
    const key = dir + '/' + name;
    return loopCache[key] || (loopCache[key] = (async () => {
      const raw = await fetchBuf(`audio/${dir}/${name}.mp3`), b = makeLoop(raw), m = measure(b), g = Math.min(db(-30) / Math.max(m.rms, 1e-4), 4), cap = db(-14);
      for (let c = 0; c < b.numberOfChannels; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) { const x = d[i] * g, a = Math.abs(x); d[i] = a < cap * 0.6 ? x : Math.sign(x) * cap * (0.6 + 0.4 * Math.tanh((a / cap - 0.6) / 0.4)); } }
      return b;
    })().catch(e => { console.warn('loop', key, e.message); return null; }));
  }

  // ---------- effects ----------
  // peak level of each effect in dB; recordings are scaled to it when they load
  const SFX = { auto: -20, horn: -20, splash: -20, knock: -20, door: -24, doorknock: -15, sweep: -24, dig: -20, rustle: -24, cut: -22, creak: -20, bell: -20, shutter: -22, tape: -18, phone: -22 };
  const bufs = {}, lastPlay = {};
  function loadSfx() { for (const [k, lv] of Object.entries(SFX)) fetchBuf(`audio/sfx/${k}.mp3`).then(b => { const m = measure(b), d = b.getChannelData(0); let s = 0; const th = m.peak * 0.04; while (s < d.length && Math.abs(d[s]) < th) s++; bufs[k] = { b, g: db(lv) / Math.max(m.peak, 1e-4), at: Math.max(0, s / b.sampleRate - 0.01) }; }).catch(e => console.warn('sfx', k, e.message)); }
  function gap(k, ms) { const n = performance.now(); if (n - (lastPlay[k] || -1e9) < ms) return false; lastPlay[k] = n; return true; }
  function play(k, opt = {}) {
    if (!live() || !gap(k, opt.gap || 90)) return !!bufs[k]; const s = bufs[k]; if (!s) return false;
    const src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime; src.buffer = s.b; src.playbackRate.value = (opt.rate || 1) * (0.96 + Math.random() * 0.08); g.gain.value = s.g * (opt.vol || 1) * (0.88 + Math.random() * 0.12);
    const dur = Math.min(s.b.duration - s.at, opt.max || 9); g.gain.setValueAtTime(g.gain.value, t + Math.max(0, dur - 0.12)); g.gain.linearRampToValueAtTime(0, t + dur);
    let out = g; if (opt.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = opt.pan; g.connect(p); out = p; }
    src.connect(g); out.connect(sfxBus); src.start(t, s.at, dur); return true;
  }
  function tone(type, f, t0, a, peak, dec, dest) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0); const g = ctx.createGain(); g.gain.value = 0;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(peak, t0 + a); g.gain.setTargetAtTime(0, t0 + a, dec / 4);
    o.connect(g); g.connect(dest || sfxBus); o.start(t0); o.stop(t0 + a + dec * 1.6); return o;
  }
  function burst(freq, q, peak, dur) {
    if (!live()) return; const t = ctx.currentTime, s = ctx.createBufferSource(); s.buffer = noiseBuf; const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = Math.min(freq, 2200); f.Q.value = q;
    const g = ctx.createGain(); g.gain.value = 0; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.012); g.gain.setTargetAtTime(0, t + 0.014, dur / 3);
    s.connect(f); f.connect(g); g.connect(sfxBus); s.start(t, Math.random() * 2); s.stop(t + dur * 2.5);
  }
  const STEP = { floor: [420, 1, 0.06, 0.05], road: [700, 0.9, 0.075, 0.05], dirt: [480, 0.8, 0.08, 0.07], grass: [1300, 0.6, 0.05, 0.09], sand: [900, 0.5, 0.06, 0.11], wet: [800, 0.6, 0.07, 0.12], plank: [260, 1.4, 0.13, 0.07] };
  const sfx = {
    blip() { if (live() && gap('blip', 60)) tone('sine', 620, ctx.currentTime, 0.006, 0.05, 0.09); },
    pickup() { if (!live() || !gap('pickup', 120)) return; const t = ctx.currentTime; tone('sine', 587, t, 0.008, 0.055, 0.16); tone('sine', 880, t + 0.07, 0.008, 0.05, 0.24); },
    done() { if (!live() || !gap('done', 250)) return; const t = ctx.currentTime; [440, 554, 659].forEach((f, i) => tone('sine', f, t + i * 0.1, 0.012, 0.05, 0.5)); },
    splash() { play('splash') || burst(900, 0.7, 0.1, 0.3); }, sweep() { play('sweep', { gap: 350 }) || burst(1300, 0.8, 0.05, 0.2); }, dig() { play('dig', { gap: 250 }) || burst(300, 1, 0.1, 0.12); },
    knock() { play('knock') || burst(220, 2, 0.16, 0.06); }, rustle() { play('rustle', { gap: 250 }) || burst(1300, 0.7, 0.06, 0.35); }, cut() { play('cut', { gap: 300 }) || sfx.sweep(); },
    creak() { play('creak', { gap: 260 }) || sfx.knock(); }, door() { play('door', { gap: 900, max: 1.1 }); }, doorknock() { play('doorknock', { gap: 600 }) || sfx.knock(); },
    bell() { play('bell', { gap: 1500 }) || (live() && tone('sine', 300, ctx.currentTime, 0.02, 0.05, 2.5)); }, shutter() { play('shutter'); }, tape() { play('tape') || sfx.knock(); },
    alarm() { if (!live() || !gap('alarm', 400)) return; const t = ctx.currentTime; for (let i = 0; i < 4; i++) tone('sine', 880, t + i * 0.18, 0.01, 0.045, 0.1); },
    ring() { play('phone', { gap: 900 }) || (live() && tone('sine', 440, ctx.currentTime, 0.02, 0.05, 0.4)); }, horn() { play('horn', { gap: 250 }); }, engine() { play('auto', { gap: 700 }); },
    sizzle() { burst(1900, 0.6, 0.022, 0.5); }, step(s) { if (!live() || !gap('step', 110)) return; const a = STEP[s] || STEP.dirt; burst(a[0] * (0.88 + Math.random() * 0.24), a[1], a[2] * (0.85 + Math.random() * 0.3), a[3]); },
  };

  // ---------- voices ----------
  const vCache = new Map(); let vNow = null, vTok = 0;
  function voiceBuf(id) {
    if (!vCache.has(id)) { vCache.set(id, fetchBuf(`audio/voice/${id}.mp3`).then(b => { const m = measure(b); return { b, g: Math.min(db(-17) / Math.max(m.rms, 1e-3), db(-2) / Math.max(m.peak, 1e-3), 3) }; })); if (vCache.size > 24) vCache.delete(vCache.keys().next().value); }
    return vCache.get(id);
  }
  function stopVoice() { vTok++; const v = vNow; vNow = null; if (v) { v.g.gain.setTargetAtTime(0, ctx.currentTime, 0.02); try { v.s.stop(ctx.currentTime + 0.12); } catch (e) { } setDuck(false); v.res(); } }
  async function voice(id, style) {
    stopVoice(); const tok = ++vTok; if (!ctx) return new Promise(r => setTimeout(r, 1800));
    let L; try { L = await voiceBuf(id); } catch (e) { vCache.delete(id); console.warn('voice', id, e.message); return new Promise(r => setTimeout(r, 1800)); }
    if (tok !== vTok) return;
    return new Promise(res => {
      const s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = L.b; g.gain.value = L.g; s.connect(g);
      if (style === 'tape') { // an old cassette through a small speaker
        const h = ctx.createBiquadFilter(), l = ctx.createBiquadFilter(), ws = ctx.createWaveShaper(), o = ctx.createGain(); h.type = 'highpass'; h.frequency.value = 340; l.type = 'lowpass'; l.frequency.value = 2900; const c = new Float32Array(1025); for (let i = 0; i < 1025; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 1.7) / Math.tanh(1.7); } ws.curve = c; o.gain.value = 1.15;
        const wow = ctx.createOscillator(), wg = ctx.createGain(); wow.frequency.value = 0.9; wg.gain.value = 7; wow.connect(wg); wg.connect(s.detune); wow.start(); g.connect(h); h.connect(l); l.connect(ws); ws.connect(o); o.connect(voiceBus); s.addEventListener('ended', () => { try { wow.stop(); } catch (e) { } });
      } else if (style === 'phone') { const h = ctx.createBiquadFilter(), l = ctx.createBiquadFilter(), o = ctx.createGain(); h.type = 'highpass'; h.frequency.value = 420; l.type = 'lowpass'; l.frequency.value = 3300; o.gain.value = 1.25; g.connect(h); h.connect(l); l.connect(o); o.connect(voiceBus); }
      else g.connect(voiceBus);
      vNow = { s, g, res }; setDuck(true); s.onended = () => { if (vNow && vNow.s === s) { vNow = null; setDuck(false); } res(); }; s.start();
      setTimeout(() => { if (ctx.state !== 'running' && !document.hidden) res(); }, L.b.duration * 1000 + 800); // sound blocked: never leave a scene stuck
    });
  }

  return {
    init, sfx, voice, stopVoice, play, live, getLoop, measure, ramp, db, preload: ids => { if (ctx) ids.forEach(id => voiceBuf(id).catch(() => vCache.delete(id))); },
    music() { }, speaking: () => !!vNow, holdVoice: on => { if (vNow) vNow.s.playbackRate.value = on ? 0 : 1; },
    setRain(v) { amb.rain = v; }, setHum(v) { if (ctx) ramp(hum, v * 0.16, 2); }, setAircraft(v) { if (ctx) ramp(air, v * 0.13, 3); }, setAmbience(o) { Object.assign(amb, o); }, flags: amb,
    setReverb(v) { if (ctx) ramp(revGain, v, 1); }, setMusicDuck(v) { if (Math.abs(v - musicDuck) < 0.02) return; musicDuck = v; applyVolumes(); },
    setVolumes(v, a, mu) { vVol = v; aVol = a; if (mu !== undefined) mVol = mu; applyVolumes(); },
    ctx: () => ctx, musicBus: () => musicBus, ambBus: () => ambBus, radioBus: () => radioBus, noise: () => noiseBuf, vols: () => ({ v: vVol, a: aVol, m: mVol, duck }),
    _dbg: () => ({ master: sfxBus, musicBus, ambBus, mix, fade }),
  };
})();
