// ===== Nammude Naadu — procedural background score =====
// Calm, slow and spacious (in the spirit of gentle rain-and-piano sleep music), with a Kerala voice:
// tanpura drone, soft piano-like notes, warm pads, bansuri phrases with meend (glides) and gamaka
// (grace notes) in Carnatic ragas, occasional veena, a soft edakka (Kerala temple drum) heartbeat,
// and a distant temple chime in the morning. All synthesized, nothing downloaded.
const Music = (() => {
  const SA = 146.83; // D3
  const RAGA = {
    mohanam:     [0, 2, 4, 7, 9],          // bright, auspicious — mornings
    hindolam:    [0, 3, 5, 8, 10],         // night, introspective
    sivaranjani: [0, 2, 3, 7, 9],          // grief, longing
    kalyani:     [0, 2, 4, 6, 7, 9, 11],   // warm evenings
    revathi:     [0, 1, 5, 7, 10],         // mystery, unease
    madhyamavati:[0, 2, 5, 7, 10],         // calm daytime, very Kerala
  };
  // tempo = seconds per step
  const MOODS = {
    title:   { raga: 'mohanam',      tempo: 1.6, piano: 0.55, flute: 0.5, veena: 0.12, pad: 0.6, drone: 0.45, edakka: 0,    chime: 0.04 },
    morning: { raga: 'mohanam',      tempo: 1.5, piano: 0.6,  flute: 0.45, veena: 0.15, pad: 0.45, drone: 0.35, edakka: 0,   chime: 0.06 },
    day:     { raga: 'madhyamavati', tempo: 1.4, piano: 0.6,  flute: 0.3,  veena: 0.2,  pad: 0.4,  drone: 0.3,  edakka: 0,   chime: 0 },
    evening: { raga: 'kalyani',      tempo: 1.7, piano: 0.5,  flute: 0.45, veena: 0.12, pad: 0.6,  drone: 0.4,  edakka: 0.5, chime: 0 },
    sad:     { raga: 'sivaranjani',  tempo: 1.9, piano: 0.45, flute: 0.5,  veena: 0.05, pad: 0.6,  drone: 0.35, edakka: 0,   chime: 0 },
    night:   { raga: 'hindolam',     tempo: 2.0, piano: 0.4,  flute: 0.2,  veena: 0.08, pad: 0.5,  drone: 0.35, edakka: 0,   chime: 0 },
    tension: { raga: 'revathi',      tempo: 1.6, piano: 0.35, flute: 0.15, veena: 0.1,  pad: 0.65, drone: 0.55, edakka: 0.8, chime: 0 },
  };
  let cur = null, bus = null, timer = null, droneNodes = [], padNodes = [], deg = 2, step = 0, fluteVoice = null, phraseTimers = [];
  const C = () => AudioSys.ctx();
  const hz = (semi, oct = 0) => SA * Math.pow(2, semi / 12 + oct);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  function ensureBus() {
    const ctx = C(); if (!ctx) return null;
    if (!bus) {
      bus = ctx.createGain(); bus.gain.value = 0;
      const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3800; tone.Q.value = -6;
      const verb = ctx.createConvolver(); verb.buffer = impulse(ctx, 4.5);
      const wet = ctx.createGain(); wet.gain.value = 0.55;
      bus.connect(tone); tone.connect(AudioSys.musicBus()); tone.connect(verb); verb.connect(wet); wet.connect(AudioSys.musicBus());
    }
    return bus;
  }
  function impulse(ctx, secs) {
    const len = ctx.sampleRate * secs, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let lp = 0; for (let i = 0; i < len; i++) { lp = lp * 0.7 + (Math.random() * 2 - 1) * 0.3; d[i] = lp * Math.pow(1 - i / len, 2.2); } }
    return b;
  }
  function stopNodes(list, t = 2) { const ctx = C(); for (const n of list) { try { n.g.gain.setTargetAtTime(0, ctx.currentTime, t / 3); n.o.forEach(o => o.stop(ctx.currentTime + t + 0.5)); } catch (e) { } } }

  // ---- tanpura drone (Pa-Sa-Sa-Sa) ----
  function startDrone(m) {
    const ctx = C(); const nodes = [];
    for (const [semi, oct, gain] of [[7, -1, 0.35], [0, 0, 0.3], [0, -1, 0.5], [0, -2, 0.3]]) {
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.type = 'triangle'; o2.type = 'triangle';
      o1.frequency.value = hz(semi, oct); o2.frequency.value = hz(semi, oct) * 1.0025;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 480; f.Q.value = -3;
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.06 + Math.random() * 0.05; lg.gain.value = 70; lfo.connect(lg); lg.connect(f.frequency);
      const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(0.028 * gain * m.drone, ctx.currentTime, 2);
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(bus); o1.start(); o2.start(); lfo.start();
      nodes.push({ g, o: [o1, o2, lfo] });
    }
    return nodes;
  }
  // ---- warm pad, slow swells ----
  function pad(m, scale) {
    const ctx = C(); stopNodes(padNodes, 5); padNodes = [];
    const i0 = Math.floor(Math.random() * Math.min(3, scale.length));
    for (const semi of [scale[i0], scale[(i0 + 2) % scale.length], scale[(i0 + 3) % scale.length] + (i0 + 3 >= scale.length ? 12 : 0)]) {
      const os = [-5, 0, 5].map(dt => { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz(semi, 0); o.detune.value = dt; return o; });
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = -3;
      const g = ctx.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(0.02 * m.pad, ctx.currentTime, 3.5);
      os.forEach(o => { o.connect(f); o.start(); }); f.connect(g); g.connect(bus);
      padNodes.push({ g, o: os });
    }
  }
  // ---- soft piano-like note ----
  function piano(freq, vel = 1) {
    const ctx = C(), t = ctx.currentTime;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06 * vel, t + 0.012); g.gain.exponentialRampToValueAtTime(0.02 * vel, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(700, t + 2.5); f.Q.value = -3;
    const os = [[1, 'sine', 1], [2, 'sine', 0.22], [3, 'sine', 0.06], [1.003, 'triangle', 0.25]].map(([mul, type, amp]) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq * mul; const a = ctx.createGain(); a.gain.value = amp; o.connect(a); a.connect(f); o.start(t); o.stop(t + 4.8); return o; });
    f.connect(g); g.connect(bus);
  }
  // ---- veena: plucked string (stable feedback loop) ----
  function veena(freq, vel = 1) {
    const ctx = C(), t = ctx.currentTime;
    const d = ctx.createDelay(); d.delayTime.value = Math.max(1 / freq, 128 / ctx.sampleRate);
    const fb = ctx.createGain(); fb.gain.value = 0.92;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = -12;
    const src = ctx.createBufferSource(); src.buffer = AudioSys.noise();
    const eg = ctx.createGain(); eg.gain.setValueAtTime(0.2 * vel, t); eg.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    const out = ctx.createGain(); out.gain.setValueAtTime(0.12 * vel, t); out.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    const dc = ctx.createBiquadFilter(); dc.type = 'highpass'; dc.frequency.value = 90; src.connect(eg); eg.connect(dc); dc.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(out); out.connect(bus);
    src.start(t, Math.random() * 2); src.stop(t + 0.04);
    fb.gain.setValueAtTime(0.92, t + 2.2); fb.gain.linearRampToValueAtTime(0, t + 2.5);
    setTimeout(() => { try { out.disconnect(); fb.disconnect(); d.disconnect(); lp.disconnect(); } catch (e) { } }, 3000);
  }
  // ---- bansuri with meend (glide) and gamaka (grace note) ----
  function fluteNote(freq, dur, from) {
    const ctx = C(), t = ctx.currentTime;
    if (!fluteVoice) {
      const o = ctx.createOscillator(); o.type = 'sine';
      const o2 = ctx.createOscillator(); o2.type = 'sine'; const og2 = ctx.createGain(); og2.gain.value = 0.12;
      const vib = ctx.createOscillator(), vg = ctx.createGain(); vib.frequency.value = 5; vg.gain.value = 0;
      vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.detune);
      const br = ctx.createBufferSource(); br.buffer = AudioSys.noise(); br.loop = true;
      const bf = ctx.createBiquadFilter(); bf.type = 'bandpass'; bf.Q.value = 6;
      const bg = ctx.createGain(); bg.gain.value = 0.035;
      const g = ctx.createGain(); g.gain.value = 0;
      o.connect(g); o2.connect(og2); og2.connect(g); br.connect(bf); bf.connect(bg); bg.connect(g); g.connect(bus);
      o.start(); o2.start(); vib.start(); br.start();
      fluteVoice = { o, o2, vg, bf, g };
    }
    const F = fluteVoice;
    if (from) { F.o.frequency.setValueAtTime(from, t); F.o2.frequency.setValueAtTime(from * 2, t); }
    F.o.frequency.setTargetAtTime(freq, t + 0.02, 0.14); F.o2.frequency.setTargetAtTime(freq * 2, t + 0.02, 0.14);
    F.bf.frequency.setTargetAtTime(freq * 1.5, t, 0.1);
    F.g.gain.setTargetAtTime(0.045, t, 0.15);
    F.vg.gain.setValueAtTime(0, t); F.vg.gain.setTargetAtTime(freq * 0.01, t + dur * 0.45, 0.4);
    F.g.gain.setTargetAtTime(0.0, t + dur, 0.35);
  }
  function flutePhrase(m, scale, tempo) {
    let d = Math.floor(Math.random() * scale.length), prev = null;
    const n = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const at = i * tempo * 0.75 * 1000;
      phraseTimers.push(setTimeout(() => {
        if (!cur || !AudioSys.live()) return;
        d = clamp(d + pick([-1, -1, 1, 1, 2, -2, 0]), 0, scale.length * 2 - 1);
        const f = hz(scale[d % scale.length], 1 + Math.floor(d / scale.length));
        // gamaka: sometimes slide in from the note above
        const from = prev && Math.random() < 0.6 ? prev : (Math.random() < 0.35 ? f * Math.pow(2, 2 / 12) : null);
        fluteNote(f, tempo * (i === n - 1 ? 1.8 : 0.7), from); prev = f;
      }, at));
    }
  }
  // ---- edakka: soft pitched temple drum, its pitch bends as it's squeezed ----
  function edakka(vel = 1, bend = 1) {
    const ctx = C(), t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(150 * (1 + 0.35 * bend), t + 0.09); o.frequency.exponentialRampToValueAtTime(140, t + 0.4);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07 * vel, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + 0.5);
  }
  // ---- distant temple chime ----
  function chime() {
    const ctx = C(), t = ctx.currentTime;
    for (const [m, a] of [[1, 1], [2.4, 0.35], [3.9, 0.12]]) { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 880 * m; const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012 * a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5); o.connect(g); g.connect(bus); o.start(t); o.stop(t + 3.6); }
  }

  function tick() {
    if (!cur || !AudioSys.live()) return; // never queue notes while the browser has audio paused
    const m = MOODS[cur], scale = RAGA[m.raga];
    step++;
    if (step % 8 === 1 && m.pad > 0) pad(m, scale);
    // gentle piano line: slow random walk, resting at phrase ends
    if (step % 8 < 6 && Math.random() < m.piano) {
      deg = clamp(deg + pick([-2, -1, -1, 0, 1, 1, 2]), 0, scale.length * 2 - 1);
      const f = hz(scale[deg % scale.length], Math.floor(deg / scale.length));
      piano(f, 0.75 + Math.random() * 0.25);
      if (Math.random() < 0.25) setTimeout(() => cur && piano(f / 2, 0.5), 120); // soft octave below
    }
    if (step % 12 === 5 && Math.random() < m.flute * 1.6) flutePhrase(m, scale, m.tempo);
    if (Math.random() < m.veena) veena(hz(pick(scale), Math.random() < 0.5 ? 0 : 1), 0.7);
    if (m.edakka && step % 2 === 0 && Math.random() < m.edakka) { edakka(0.8, 1); if (Math.random() < 0.5) setTimeout(() => cur && edakka(0.5, 0.6), m.tempo * 380); }
    if (m.chime && Math.random() < m.chime) chime();
  }
  function set(name) {
    if (!C()) return;
    if (name === cur) return;
    const b = ensureBus(); const ctx = C();
    clearInterval(timer); timer = null; phraseTimers.forEach(clearTimeout); phraseTimers = [];
    stopNodes(droneNodes); droneNodes = []; stopNodes(padNodes); padNodes = [];
    if (fluteVoice) fluteVoice.g.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    cur = name || null;
    if (!cur) { b.gain.setTargetAtTime(0, ctx.currentTime, 1); return; }
    const m = MOODS[cur];
    b.gain.setTargetAtTime(1, ctx.currentTime, 2);
    droneNodes = startDrone(m);
    step = 0; deg = 2;
    timer = setInterval(tick, m.tempo * 1000);
    setTimeout(tick, 400);
  }
  return { set, get mood() { return cur; } };
})();
