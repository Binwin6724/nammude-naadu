// ===== Nammude Naadu — cinematics: letterbox, captions, painted scenes, camera pans, the morning song =====

// ---------- Letterbox & captions ----------
function letterbox(on) {
  for (const id of ['lbTop', 'lbBot']) $(id).style.height = on ? '11vh' : '0';
  for (const id of ['obj', 'status', 'inv']) $(id).style.opacity = on ? 0 : 1;
}
async function caption(text, ms = 3200, sub = '') {
  const c = $('cap'); c.innerHTML = `<div>${text}</div>${sub ? `<div class="cs">${sub}</div>` : ''}`;
  c.style.opacity = 1; await sleep(ms); c.style.opacity = 0; await sleep(700);
}
// Smoothly move the camera through points (tiles) — the player stays put.
async function pan(points, secs) {
  const cam = { x: points[0][0] * T, y: points[0][1] * T + 16 };
  G.camTarget = cam; snapCam();
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = [cam.x, cam.y], bx = points[i][0] * T, by = points[i][1] * T + 16, dur = (secs[i - 1] || 4) * 1000, t0 = performance.now();
    await new Promise(r => { const f = now => { const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; cam.x = ax + (bx - ax) * e; cam.y = ay + (by - ay) * e; k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
  }
}
// Full-screen painted scene (replaces the world render while it runs)
async function painted(drawFn, ms) {
  const t0 = performance.now();
  G.cine = (c, w, h) => drawFn(c, w, h, (performance.now() - t0) / 1000);
  await sleep(ms);
}
function endPainted() { G.cine = null; }

// ---------- Painted scenes ----------
function sceneAfterCall(c, W, H, t) {
  // dark Dubai flat, Arjun on the edge of the bed, the city glittering outside
  const z = 1 + t * 0.006;
  c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2);
  c.fillStyle = '#0b0d14'; c.fillRect(0, 0, W, H);
  const wx = W * 0.12, wy = H * 0.12, ww = W * 0.76, wh = H * 0.5;
  const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#0a1030'); sky.addColorStop(1, '#2a2350'); c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 26; i++) {
    const bw = ww / 26 * (0.7 + hash(i) * 0.6), bh = wh * (0.25 + hash(i + 3) * 0.55), bx = wx + (i / 26) * ww;
    c.fillStyle = '#121729'; c.fillRect(bx, wy + wh - bh, bw, bh);
    for (let k = 0; k < 14; k++) if (hash(i * 13 + k) > 0.45) { c.fillStyle = `rgba(255,${200 + hash(k) * 40 | 0},140,${0.5 + 0.5 * Math.sin(t * (0.5 + hash(i + k)) + k)})`; c.fillRect(bx + 3 + hash(k + i) * (bw - 6), wy + wh - bh + 6 + (k / 14) * (bh - 10), 2.5, 2.5); }
  }
  // Burj silhouette
  const bx = wx + ww * 0.62, by = wy + wh; c.fillStyle = '#161c33'; c.beginPath(); c.moveTo(bx - 22, by); c.lineTo(bx - 8, by - wh * 0.7); c.lineTo(bx, by - wh * 0.98); c.lineTo(bx + 8, by - wh * 0.7); c.lineTo(bx + 22, by); c.fill();
  if (Math.sin(t * 2.5) > 0.6) { c.fillStyle = '#ff5a5a'; c.beginPath(); c.arc(bx, by - wh * 0.98, 3, 0, 6.28); c.fill(); }
  c.strokeStyle = '#1d2230'; c.lineWidth = 8; c.strokeRect(wx, wy, ww, wh); c.beginPath(); c.moveTo(wx + ww / 3, wy); c.lineTo(wx + ww / 3, wy + wh); c.moveTo(wx + 2 * ww / 3, wy); c.lineTo(wx + 2 * ww / 3, wy + wh); c.stroke();
  // window light spill on the floor
  c.fillStyle = 'rgba(120,110,180,.08)'; c.beginPath(); c.moveTo(wx, wy + wh); c.lineTo(wx + ww, wy + wh); c.lineTo(wx + ww * 1.1, H); c.lineTo(wx - ww * 0.1, H); c.fill();
  // bed
  const bedY = H * 0.78; c.fillStyle = '#1a1c24'; c.fillRect(W * 0.18, bedY, W * 0.64, H * 0.25); c.fillStyle = '#262a36'; c.fillRect(W * 0.18, bedY - H * 0.02, W * 0.64, H * 0.04);
  // Arjun silhouette, seated, head bowed
  const ax = W * 0.5, ay = bedY - H * 0.005, s = H / 500;
  c.fillStyle = '#05060a';
  c.beginPath(); c.ellipse(ax, ay - 70 * s, 28 * s, 46 * s, 0, 0, 6.28); c.fill();
  c.beginPath(); c.ellipse(ax + 4 * s, ay - 128 * s + Math.sin(t * 0.8) * 0.6 * s, 15 * s, 17 * s, 0.35, 0, 6.28); c.fill();
  c.fillRect(ax - 30 * s, ay - 20 * s, 60 * s, 26 * s);
  c.beginPath(); c.moveTo(ax - 24 * s, ay - 70 * s); c.quadraticCurveTo(ax - 34 * s, ay - 30 * s, ax - 6 * s, ay - 26 * s); c.lineWidth = 11 * s; c.strokeStyle = '#05060a'; c.stroke();
  // phone glow in his hands
  const pg = c.createRadialGradient(ax - 4 * s, ay - 28 * s, 0, ax - 4 * s, ay - 28 * s, 70 * s); pg.addColorStop(0, 'rgba(150,200,255,.55)'); pg.addColorStop(1, 'rgba(150,200,255,0)');
  c.fillStyle = pg; c.beginPath(); c.arc(ax - 4 * s, ay - 28 * s, 70 * s, 0, 6.28); c.fill();
  c.fillStyle = '#bfe0ff'; c.fillRect(ax - 9 * s, ay - 33 * s, 10 * s, 15 * s);
  c.restore();
  vignette(c, W, H);
}
function sceneFlight(c, W, H, t) {
  // inside the cabin at night, window looking out
  c.fillStyle = '#0d0f14'; c.fillRect(0, 0, W, H);
  const cx0 = W / 2, cy0 = H / 2, rw = Math.min(W, H) * 0.26, rh = rw * 1.35;
  c.save(); c.beginPath(); c.ellipse(cx0, cy0, rw, rh, 0, 0, 6.28); c.clip();
  const g = c.createLinearGradient(0, cy0 - rh, 0, cy0 + rh); g.addColorStop(0, '#05081a'); g.addColorStop(0.7, '#1a1f3a'); g.addColorStop(1, '#3a2a40');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + hash(i) * 0.6})`; c.fillRect(cx0 - rw + hash(i + 3) * rw * 2, cy0 - rh + hash(i + 7) * rh, 1.5, 1.5); }
  for (let i = 0; i < 14; i++) { const x = ((hash(i) * 2 * rw - t * 60 * (0.5 + hash(i + 2))) % (2 * rw) + 2 * rw) % (2 * rw) + cx0 - rw; c.fillStyle = `rgba(160,170,200,${0.12 + hash(i + 5) * 0.12})`; c.beginPath(); c.ellipse(x, cy0 + rh * 0.35 + hash(i + 9) * rh * 0.5, 60 + hash(i) * 80, 14 + hash(i + 1) * 10, 0, 0, 6.28); c.fill(); }
  c.fillStyle = '#2a2d36'; c.beginPath(); c.moveTo(cx0 - rw, cy0 + rh * 0.15); c.lineTo(cx0 + rw * 0.9, cy0 + rh * 0.42); c.lineTo(cx0 + rw, cy0 + rh * 0.5); c.lineTo(cx0 - rw, cy0 + rh * 0.4); c.fill();
  if (Math.sin(t * 3) > 0.85) { c.fillStyle = '#ff4040'; c.beginPath(); c.arc(cx0 + rw * 0.85, cy0 + rh * 0.44, 4, 0, 6.28); c.fill(); }
  c.restore();
  c.strokeStyle = '#3a3d46'; c.lineWidth = rw * 0.12; c.beginPath(); c.ellipse(cx0, cy0, rw * 1.06, rh * 1.04, 0, 0, 6.28); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.04)'; c.beginPath(); c.ellipse(cx0 - rw * 0.3, cy0 - rh * 0.4, rw * 0.3, rh * 0.15, -0.6, 0, 6.28); c.fill();
}
function sceneDescent(c, W, H, t) {
  // dawn over Kerala from the aircraft window: coconut canopy to the horizon, backwaters, red roofs, mist
  const sky = c.createLinearGradient(0, 0, 0, H * 0.42); sky.addColorStop(0, '#6f86a8'); sky.addColorStop(0.6, '#f0b98a'); sky.addColorStop(1, '#f6d6a8');
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  const hz = H * 0.38, drift = t * 0.035;
  c.fillStyle = 'rgba(255,236,200,.9)'; c.beginPath(); c.arc(W * 0.72, hz - H * 0.03, H * 0.045, 0, 6.28); c.fill();
  c.fillStyle = '#6f8a86'; c.beginPath(); c.moveTo(0, hz); for (let x = 0; x <= W; x += W / 12) c.lineTo(x, hz - H * (0.02 + hash(x) * 0.035)); c.lineTo(W, hz); c.fill();
  c.fillStyle = '#4f6e48'; c.fillRect(0, hz, W, H - hz);
  // backwater: one continuous meandering band in perspective
  const rows = 30, rx = k => W * (0.45 + Math.sin(k * 5 + 1.2) * 0.22) - drift * W * k * 0.6, ry = k => hz + Math.pow(k, 1.8) * (H - hz) * 1.05, rwid = k => W * (0.02 + k * 0.14);
  c.fillStyle = '#86b3b0'; c.beginPath();
  for (let i = 0; i <= 40; i++) { const k = i / 40; c.lineTo(rx(k) - rwid(k) / 2, ry(k)); }
  for (let i = 40; i >= 0; i--) { const k = i / 40; c.lineTo(rx(k) + rwid(k) / 2, ry(k)); }
  c.fill();
  c.strokeStyle = 'rgba(255,240,220,.35)'; c.lineWidth = 2; for (let i = 2; i < 40; i += 3) { const k = i / 40; c.beginPath(); c.moveTo(rx(k) - rwid(k) * 0.2, ry(k)); c.lineTo(rx(k) + rwid(k) * 0.15, ry(k)); c.stroke(); }
  { const k = 0.8, bx = rx(k), by = ry(k); c.fillStyle = '#3a2414'; c.beginPath(); c.ellipse(bx, by, W * 0.03, W * 0.006, -0.3, 0, 6.28); c.fill(); }
  // rows of coconut crowns, far (small) to near (large)
  for (let r = 0; r < rows; r++) {
    const k = r / rows, y = ry(k), sc = (0.25 + k * 2.6) * H / 900, n = Math.floor(10 + (1 - k) * 34);
    for (let i = 0; i < n; i++) {
      const x = ((i / n) * W * 1.25 + hash(r * 31 + i) * 50 * sc - drift * W * (0.3 + k)) % (W * 1.25) - W * 0.12, yy = y + (hash(i * 5 + r) - 0.5) * 14 * sc;
      if (Math.abs(x - rx(k)) < rwid(k) * 0.6) continue;
      if (hash(r * 7 + i * 3) < 0.035) { c.fillStyle = '#b2513a'; c.fillRect(x - 20 * sc, yy - 12 * sc, 40 * sc, 24 * sc); c.fillStyle = '#8a3a28'; c.fillRect(x - 20 * sc, yy - 12 * sc, 40 * sc, 6 * sc); continue; }
      const g = 60 + hash(i + r) * 60 | 0;
      c.fillStyle = 'rgba(20,40,20,.25)'; c.beginPath(); c.ellipse(x + 8 * sc, yy + 10 * sc, 30 * sc, 12 * sc, 0, 0, 6.28); c.fill();
      c.fillStyle = `rgb(${38 + g * 0.25 | 0},${g + 45},${34 + g * 0.2 | 0})`;
      c.strokeStyle = c.fillStyle; c.lineCap = 'round';
      for (let f = 0; f < 12; f++) { const ang = f / 12 * 6.28 + i * 0.7, L = (34 + hash(f + i) * 12) * sc, ex = x + Math.cos(ang) * L, ey = yy + Math.sin(ang) * L * 0.5 + 8 * sc, mx = x + Math.cos(ang) * L * 0.5, my = yy + Math.sin(ang) * L * 0.22 - 3 * sc;
        c.lineWidth = 2.2 * sc; c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(mx, my, ex, ey); c.stroke();
        c.lineWidth = 1.1 * sc; for (let j = 2; j < 9; j++) { const tt = j / 9, px = (1 - tt) * (1 - tt) * x + 2 * (1 - tt) * tt * mx + tt * tt * ex, py = (1 - tt) * (1 - tt) * yy + 2 * (1 - tt) * tt * my + tt * tt * ey, nx = -Math.sin(ang), ny = Math.cos(ang) * 0.5, l = 7 * sc * (1 - tt * 0.5); c.beginPath(); c.moveTo(px + nx * l, py + ny * l + 2 * sc); c.lineTo(px, py); c.lineTo(px - nx * l, py - ny * l + 2 * sc); c.stroke(); } }
      c.fillStyle = '#6a6a2a'; c.beginPath(); c.arc(x, yy, 3 * sc, 0, 6.28); c.fill();
    }
  }
  // morning mist bands
  for (let i = 0; i < 4; i++) { const y = hz + H * (0.04 + i * 0.06); const mg = c.createLinearGradient(0, y - 20, 0, y + 20); mg.addColorStop(0, 'rgba(255,245,230,0)'); mg.addColorStop(0.5, `rgba(255,245,230,${0.28 - i * 0.05})`); mg.addColorStop(1, 'rgba(255,245,230,0)'); c.fillStyle = mg; c.fillRect(0, y - 20, W, 40); }
  // rain streaks on the window, and the window frame
  c.strokeStyle = 'rgba(230,240,250,.35)'; c.lineWidth = 1.5; for (let i = 0; i < 26; i++) { const x = (hash(i) * W + t * 120 * (1 + hash(i + 2))) % W, y = hash(i + 5) * H; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y + 4); c.stroke(); }
  c.save(); c.fillStyle = '#1d2026'; c.beginPath(); c.rect(0, 0, W, H); c.roundRect(W * 0.08, H * 0.06, W * 0.84, H * 0.88, H * 0.18); c.fill('evenodd'); c.restore();
  c.strokeStyle = '#3a3e48'; c.lineWidth = H * 0.02; c.beginPath(); c.roundRect(W * 0.08, H * 0.06, W * 0.84, H * 0.88, H * 0.18); c.stroke();
}
function sceneBus(c, W, H, t) {
  // KSRTC bus window: rain, paddy fields and palms streaming past
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9aa6ac'); g.addColorStop(1, '#c9ccc0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const hz = H * 0.5;
  c.fillStyle = '#6a8a50'; c.fillRect(0, hz, W, H - hz);
  c.fillStyle = '#8dbb4f'; c.fillRect(0, hz + H * 0.06, W, H * 0.25);
  c.strokeStyle = 'rgba(70,110,50,.5)'; c.lineWidth = 1; for (let y = hz + H * 0.07; y < hz + H * 0.31; y += 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  const layer = (speed, n, base, sc, col) => { for (let i = 0; i < n; i++) { const x = ((i / n) * W * 1.5 - t * speed) % (W * 1.5); const X = x < -W * 0.25 ? x + W * 1.5 : x; palmSil(c, X, base, sc * (0.8 + hash(i) * 0.4), col, i); } };
  layer(60, 10, hz + 4, H / 600, '#4d6a46'); layer(260, 6, H * 0.98, H / 260, '#2a3a26');
  // window frame and rain
  c.fillStyle = '#c8402e'; c.fillRect(0, 0, W, H * 0.08); c.fillRect(0, H * 0.92, W, H * 0.08);
  c.fillStyle = '#9a2e22'; c.fillRect(W * 0.49, 0, W * 0.02, H);
  c.fillStyle = 'rgba(220,230,240,.35)'; for (let i = 0; i < 70; i++) { const x = (hash(i) * W - t * 90 * (1 + hash(i + 1))) % W; c.fillRect((x + W) % W, (hash(i + 4) * H + t * 30) % H, 2, 10 + hash(i) * 14); }
  vignette(c, W, H);
}
function palmSil(c, x, y, s, col, seed, sway = 0) {
  const lean = 14 * s, top = [x + lean, y - 120 * s];
  c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round';
  c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 2 * s, y - 60 * s, top[0], top[1]); c.stroke();
  for (let k = 0; k < 9; k++) {
    const side = k % 2 ? 1 : -1, spread = (Math.floor(k / 2) + 0.5) / 4.5, ang = side * (0.25 + spread * 1.35) + Math.sin(seed + k) * 0.08 + sway;
    const len = (46 + hash(seed + k) * 16) * s, ex = top[0] + Math.sin(ang) * len, ey = top[1] - Math.cos(ang) * len * 0.35 + spread * len * 0.75;
    const mx = top[0] + Math.sin(ang) * len * 0.55, my = top[1] - len * 0.32;
    c.beginPath(); c.moveTo(top[0], top[1]); c.quadraticCurveTo(mx, my - 4 * s, ex, ey); c.quadraticCurveTo(mx, my + 5 * s, top[0], top[1] + 2 * s); c.fill();
    c.lineWidth = 1.2 * s; for (let j = 1; j < 7; j++) { const tt = j / 7, px = (1 - tt) * (1 - tt) * top[0] + 2 * (1 - tt) * tt * mx + tt * tt * ex, py = (1 - tt) * (1 - tt) * top[1] + 2 * (1 - tt) * tt * my + tt * tt * ey; c.beginPath(); c.moveTo(px, py); c.lineTo(px + side * 3 * s, py + 9 * s * (1 - tt * 0.4)); c.stroke(); }
  }
}
function vignette(c, W, H) { const v = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.9); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = v; c.fillRect(0, 0, W, H); }

// ---------- The morning song (YouTube embed, official player) ----------
// Sri Venkateswara Suprabhatham by M.S. Subbulakshmi — the devotional that drifts from temple
// loudspeakers across Kerala villages at dawn. Played through YouTube's own embedded player.
const SONG = { id: 'krGYd5tZe0A', start: 0, seconds: 48, volume: 24, title: 'Sri Venkateswara Suprabhatham · M.S. Subbulakshmi' };
let ytPlayer = null, ytReady = null;
function loadYT() {
  if (ytReady) return ytReady;
  ytReady = new Promise(res => {
    window.onYouTubeIframeAPIReady = () => res(true);
    const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => res(false); document.head.appendChild(s);
    setTimeout(() => res(!!(window.YT && YT.Player)), 6000);
  });
  return ytReady;
}
async function playMorningSong() {
  const ok = await loadYT(); if (!ok || !window.YT || !YT.Player) return false;
  const np = $('np'); np.dataset.song = '1'; np.classList.add('yt'); np.querySelector('.k').textContent = '♪ From the temple'; np.querySelector('.t').textContent = SONG.title;
  return new Promise(res => {
    const startAt = performance.now();
    const make = () => new YT.Player('ytp', {
      width: 200, height: 200, videoId: SONG.id,
      playerVars: { start: SONG.start, autoplay: 1, controls: 0, disablekb: 1, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: e => { e.target.setVolume(SONG.volume * (G.settings.music ?? 0.6) / 0.6); e.target.playVideo(); },
        onStateChange: e => { if (e.data === 1) { np.style.opacity = 1; res(true); } },
        onError: () => res(false),
      },
    });
    if (ytPlayer && ytPlayer.loadVideoById) { ytPlayer.loadVideoById({ videoId: SONG.id, startSeconds: SONG.start }); ytPlayer.setVolume(SONG.volume * (G.settings.music ?? 0.6) / 0.6); np.style.opacity = 1; } else ytPlayer = make();
    setTimeout(() => { if (performance.now() - startAt > 4900) res(ytPlayer && ytPlayer.getPlayerState && ytPlayer.getPlayerState() === 1); }, 5000);
  });
}
async function fadeSong(ms = 4000) {
  if (!ytPlayer || !ytPlayer.getVolume) return;
  const v0 = ytPlayer.getVolume(), steps = 20;
  for (let i = 1; i <= steps; i++) { await sleep(ms / steps); try { ytPlayer.setVolume(v0 * (1 - i / steps)); } catch (e) { } }
  try { ytPlayer.stopVideo(); } catch (e) { }
  $('np').style.opacity = 0; $('np').dataset.song = ''; $('np').classList.remove('yt');
}

// ---------- Title-screen background ----------
const titleBg = $('tbg'), tbx = titleBg.getContext('2d');
function drawTitleBg(now) {
  if ($('title').style.display === 'none') return requestAnimationFrame(drawTitleBg);
  const W = titleBg.width = innerWidth * DPR, H = titleBg.height = innerHeight * DPR, t = now / 1000, c = tbx;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1b2440'); g.addColorStop(0.45, '#c27a52'); g.addColorStop(0.62, '#f0b878'); g.addColorStop(0.63, '#5a6e5a'); g.addColorStop(1, '#16221a');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const hz = H * 0.62;
  c.fillStyle = 'rgba(255,220,160,.85)'; c.beginPath(); c.arc(W * 0.68, hz - H * 0.02, H * 0.07, Math.PI, 0); c.fill();
  // river reflection
  const rg = c.createLinearGradient(0, hz, 0, H); rg.addColorStop(0, 'rgba(240,184,120,.55)'); rg.addColorStop(1, 'rgba(20,30,25,.9)'); c.fillStyle = rg; c.fillRect(0, hz, W, H - hz);
  c.strokeStyle = 'rgba(255,230,190,.35)'; c.lineWidth = 2 * DPR; for (let i = 0; i < 18; i++) { const y = hz + 8 + i * i * 2.2 * DPR, w = (40 + i * 10) * DPR, x = W * 0.68 + Math.sin(t + i) * 10 * DPR; c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke(); }
  // far bank and palms
  c.fillStyle = '#18241a'; c.fillRect(0, hz - H * 0.025, W, H * 0.03);
  for (let i = 0; i < 16; i++) palmSil(c, (i / 16) * W * 1.1 - W * 0.04 + hash(i) * 40, hz - H * 0.02, H / 900 * (0.8 + hash(i + 3) * 0.6), '#121c14', i, Math.sin(t * 0.6 + i) * 0.035);
  // canoe gliding
  const bx = ((t * 18 * DPR) % (W * 1.3)) - W * 0.15, by = hz + H * 0.12;
  c.fillStyle = '#0b120c'; c.beginPath(); c.moveTo(bx - 50 * DPR, by); c.quadraticCurveTo(bx, by + 10 * DPR, bx + 50 * DPR, by); c.lineTo(bx + 44 * DPR, by + 4 * DPR); c.quadraticCurveTo(bx, by + 12 * DPR, bx - 44 * DPR, by + 4 * DPR); c.fill();
  c.fillRect(bx - 3 * DPR, by - 26 * DPR, 7 * DPR, 26 * DPR); c.beginPath(); c.arc(bx, by - 30 * DPR, 5 * DPR, 0, 6.28); c.fill();
  c.strokeStyle = '#0b120c'; c.lineWidth = 2 * DPR; const a = Math.sin(t * 1.5) * 0.4; c.beginPath(); c.moveTo(bx - 20 * DPR * Math.cos(a), by - 20 * DPR); c.lineTo(bx + 24 * DPR * Math.cos(a), by + 6 * DPR); c.stroke();
  // birds
  c.strokeStyle = 'rgba(20,20,30,.7)'; c.lineWidth = 1.5 * DPR; for (let i = 0; i < 5; i++) { const x = ((t * 25 + i * 90) * DPR) % (W + 200) - 100, y = H * (0.25 + hash(i) * 0.12) + Math.sin(t * 2 + i) * 6, w = Math.sin(t * 6 + i) * 5 * DPR; c.beginPath(); c.moveTo(x - 8 * DPR, y - w); c.quadraticCurveTo(x, y, x + 8 * DPR, y - w); c.stroke(); }
  // foreground palm
  palmSil(c, W * 0.06, H * 1.02, H / 300, '#070b08', 3, Math.sin(t * 0.5) * 0.025);
  vignette(c, W, H);
  requestAnimationFrame(drawTitleBg);
}
requestAnimationFrame(drawTitleBg);
