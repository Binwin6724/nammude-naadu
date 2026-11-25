// ===== Nammude Naadu — polish: objective marker, pause menu & settings, footsteps =====

// ---------- Settings ----------
G.settings = Object.assign({ voice: 1, amb: 0.9, music: 0.6, subs: 'both', marker: true }, (() => { try { return JSON.parse(localStorage.getItem('nn_settings') || '{}') || {}; } catch (e) { return {}; } })());
function saveSettings() { localStorage.setItem('nn_settings', JSON.stringify(G.settings)); AudioSys.setVolumes(G.settings.voice, G.settings.amb, G.settings.music); try { if ($('np').dataset.song === '1' && ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(SONG.volume * G.settings.music / 0.6); } catch (e) { } }

// ---------- Objective targets (map, tile x, tile y) ----------
const DOORS = { 'house>village': [12.25, 15.7], 'village>house': [22, 23.2] };
const V = (x, y) => ['village', x, y], H = (x, y) => ['house', x, y];
function nearestOf(list, map) {
  const p = G.player; let best = null, bd = Infinity;
  for (const [x, y] of list) { const d = map === G.map.id ? Math.hypot(p.x - x * T, p.y - y * T) : 0; if (d < bd) { bd = d; best = [map, x, y]; } }
  return best;
}
const AMM_TARGET = () => { const p = AMM_POS[S.ammLoc]; return p ? H(p[0], p[1]) : null; };
function targetFor(id) {
  const kun = G.maps.village.objs.find(o => o.id === 'kun'), sasi = G.maps.village.objs.find(o => o.id === 'sasi');
  switch (id) {
    // Prologue
    case 'alarm': case 'phone1': case 'phone2': return ['flat', 5.1, 1.8];
    case 'photo': return ['flat', 6.15, 1.7];
    case 'dress': return ['flat', 13.5, 2.3];
    case 'eat': return ['flat', 9.3, 6.1];
    case 'door': return ['flat', 7.8, 9.8];
    case 'shibu': return ['office', 9.2, 4.9];
    case 'work': return ['office', 3.6, 4.2];
    // Chapter 1
    case 'jomon': return V(57.6, 6.2);
    case 'ammachi': return V(25.25, 24.3);
    case 'unpack': return H(5.6, 8.5);
    case 'windows': return H(S.win0 ? 5.7 : 4.3, 1);
    case 'sweep': return has('broom') ? nearestOf([[2.85, 5.6], [6.05, 5], [4.05, 8.1]].filter((_, i) => !S['dust' + i]), 'house') : H(0.85, 11.2);
    case 'bedsheet': return has('bedsheet') ? H(2, 3.8) : H(7, 2.1);
    case 'bulb': return has('bulb') ? H(4, 4.7) : H(7.7, 11.3);
    case 'bathroom': return H(22.4, 8.5);
    case 'coconut': return nearestOf([[13.6, 27.6], [32.9, 29.9], [15.2, 33.8]].filter((_, i) => !S['coco' + i]), 'village');
    case 'curry': case 'curry2': return V(31.2, 25.4);
    case 'water': return V(12.6, 20.8);
    case 'rice': case 'seeds': return V(49, 4.4);
    case 'deliver': case 'giveEggs': case 'ask': return AMM_TARGET();
    case 'light': return V(23.25, 23.2);
    case 'coop': return V(32.4, 16.3);
    case 'appa': return H(10.5, 3.8);
    case 'sleep': return H(2, 3.8);
    case 'flash': return H(15, 2.1);
    case 'investigate': return V(14, 16.4);
    // Chapter 2
    case 'feed': case 'line': case 'cutting': return V(14, 16.2);
    case 'feeder': return V(28.4, 17.2);
    case 'waterHen': return has('water') ? V(33.4, 17.2) : V(12.6, 20.8);
    case 'eggs': return V(30.6, 16.4);
    case 'findHen': { const r = G.hens.find(h => h.red); return r ? V(r.x / T, r.y / T) : null; }
    case 'lureHen': return V(30.5, 18.5);
    case 'flowers': return ['church', 10.1, 9.9];
    case 'key': return V(15.6, 16.9);
    case 'bamboo': case 'stake': return has('knife') ? V(59.9, 46.9) : V(14, 16.2);
    case 'hook': return V(kun.x / T, kun.y / T);
    case 'worms': return nearestOf(SOIL.filter((_, i) => !S['soil' + i]), 'village');
    case 'fish': return has('rod') ? V(49, 30.6) : null;
    case 'clean': return V(12.6, 20.8);
    case 'kudampuli': return V(29.5, 34.2);
    case 'grate': return has('coconut') ? H(22.75, 4.9) : V(13.6, 27.6);
    case 'cook': return H(18.2, 2.2);
    // Chapter 3
    case 'visit': return V(22, 37.6);
    case 'sickle': return has('sickle') ? V(12.6, 20.8) : V(14, 16.2);
    case 'weeds': return S.sickleSharp ? nearestOf(FARM_WEEDS.filter((_, i) => !S['weed' + i]), 'village') : V(14, 16.2);
    case 'branches': return nearestOf(FARM_BRANCHES.filter((_, i) => !S['br' + i]), 'village');
    case 'fence': return nearestOf(FARM_FENCE.map(([x, y, w, h]) => [x + w / 2, y + h / 2]).filter((_, i) => !S['fence' + i]), 'village');
    case 'compost':
      if (has('compostbin')) return V(14.2, 38.6);
      if (!has('planks', 2)) return V(14, 16.2);
      if (!has('nails')) return V(49, 4.4);
      if (!has('leaves')) return V(19.5, 31.7);
      return null; // craft it with C
    case 'beds': return has('mammatti') ? nearestOf(FARM_BEDS.map(x => [x + 0.7, 43.2]).filter((_, i) => !S.beds[i].dug), 'village') : V(14, 16.2);
    case 'sapling': return has('mammatti') ? V(6.35, 38.3) : V(14, 16.2);
    case 'plant': return nearestOf(FARM_BEDS.map(x => [x + 0.7, 43.2]).filter((_, i) => !S.beds[i].crop), 'village');
    case 'waterBeds': return has('water') ? nearestOf(FARM_BEDS.map(x => [x + 0.7, 43.2]).filter((_, i) => !S.beds[i].water), 'village') : V(12.6, 20.8);
    case 'inspect': case 'repair': return V(31.4, 39.5);
    case 'pumpweeds': return V(29.4, 38.8);
    case 'sasi': case 'parts': return V(sasi.x / T, sasi.y / T);
  }
  return typeof targetFor4 === 'function' ? targetFor4(id) : null;
}
function currentGoal() {
  for (const it of Obj.items) { if (it.done) continue; const t = targetFor(it.id); if (t) return t; }
  return null;
}
function drawMarker() {
  if (!G.settings.marker || !G.running || G.locked || !G.map || $('sub').style.display === 'block') return;
  const goal = currentGoal(); if (!goal) return;
  let [map, x, y] = goal;
  if (map !== G.map.id) { const d = DOORS[G.map.id + '>' + map]; if (!d) return; [x, y] = d; }
  const sx = (x * T - G.cam.x) * SCALE, sy = (y * T - G.cam.y) * SCALE;
  const m = 46 * DPR, W = cv.width, Hh = cv.height;
  cx.setTransform(1, 0, 0, 1, 0, 0);
  const onScreen = sx > m && sx < W - m && sy > m && sy < Hh - m;
  const pulse = (Math.sin(G.t * 4) + 1) / 2;
  if (onScreen) {
    const dist = Math.hypot(G.player.x - x * T, G.player.y - y * T);
    if (dist < 26) return;
    const by = sy - (42 + pulse * 6) * DPR, s = 7 * DPR;
    cx.fillStyle = 'rgba(0,0,0,.35)'; cx.beginPath(); cx.ellipse(sx, sy, 9 * DPR, 3.5 * DPR, 0, 0, 6.28); cx.fill();
    cx.fillStyle = '#e8b65a'; cx.strokeStyle = 'rgba(40,25,5,.8)'; cx.lineWidth = 1.5 * DPR;
    cx.beginPath(); cx.moveTo(sx, by - s); cx.lineTo(sx + s * 0.7, by); cx.lineTo(sx, by + s * 1.4); cx.lineTo(sx - s * 0.7, by); cx.closePath(); cx.fill(); cx.stroke();
  } else {
    const ccx = W / 2, ccy = Hh / 2, a = Math.atan2(sy - ccy, sx - ccx);
    const k = Math.min((W / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (Hh / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
    const ex = ccx + Math.cos(a) * k, ey = ccy + Math.sin(a) * k;
    cx.save(); cx.translate(ex, ey); cx.rotate(a);
    cx.fillStyle = `rgba(232,182,90,${0.75 + pulse * 0.25})`; cx.strokeStyle = 'rgba(40,25,5,.8)'; cx.lineWidth = 1.5 * DPR;
    const s = 11 * DPR; cx.beginPath(); cx.moveTo(s, 0); cx.lineTo(-s * 0.7, s * 0.75); cx.lineTo(-s * 0.35, 0); cx.lineTo(-s * 0.7, -s * 0.75); cx.closePath(); cx.fill(); cx.stroke();
    cx.restore();
    const meters = Math.round(Math.hypot(G.player.x - x * T, G.player.y - y * T) / T * 1.5);
    cx.font = `600 ${11 * DPR}px Inter, sans-serif`; cx.textAlign = 'center'; cx.fillStyle = '#f5efe3';
    cx.fillText(`${meters} m`, ex - Math.cos(a) * 22 * DPR, ey - Math.sin(a) * 22 * DPR + 4 * DPR);
  }
}

// ---------- Footsteps ----------
function onStep() {
  if (!G.map) return;
  const p = G.player;
  let surf = 'floor'; const mid = G.map.id;
  if (mid === 'millpath') { const px = p.x / T, py = p.y / T; return AudioSys.sfx.step(px > 20.8 && px < 24.2 ? 'plank' : py > 7.2 && py < 9.8 || px > 34 ? 'dirt' : 'grass'); }
  if (mid === 'mill' || mid === 'millroom') return AudioSys.sfx.step('dirt');
  if (mid === 'radioshop') return AudioSys.sfx.step('plank');
  if (mid === 'church') return AudioSys.sfx.step(G.rain > 0.15 ? 'wet' : 'grass');
  if (G.map.outdoor) {
    const tx = p.x / T, ty = p.y / T;
    if (tx > 60 && ty > 7.2) return AudioSys.sfx.step(tx > 48 && ty < 7 ? 'road' : 'sand');
    if (tx > 48 && tx < 50 && ty > 29.4 && ty < 31) return AudioSys.sfx.step('plank');
    const onRoad = ty > 4.6 && ty < 7; const onLane = (tx > 35 && tx < 37 && ty > 7 && ty < 44) || (ty > 42 && ty < 44 && tx > 37 && tx < 60);
    const onMuttam = tx > 13 && tx < 34 && ty > 23.4 && ty < 30 || (tx > 21 && tx < 23 && ty > 29 && ty < 37.5);
    surf = onRoad ? 'road' : onLane || onMuttam ? 'dirt' : 'grass';
    if (G.rain > 0.15) surf = 'wet';
  }
  AudioSys.sfx.step(surf);
}

// ---------- Pause menu ----------
const miniOpen = () => $('mini').style.display === 'flex';
function openPause() {
  if (!G.running || G.paused || miniOpen() || $('panel').style.display === 'block') return;
  G.paused = true; document.body.classList.add('paused'); AudioSys.holdVoice(true); for (const k in keys) keys[k] = false;
  const el = $('panel'); el.style.display = 'block'; $('pauseBtn').style.display = 'none';
  const row = (label, inner) => `<div class="rec" style="display:flex;justify-content:space-between;align-items:center;gap:16px"><b style="font-size:13px">${label}</b>${inner}</div>`;
  el.innerHTML = `<h2>Paused</h2>
    ${row('Voices', `<input id="sv" type="range" min="0" max="1" step="0.05" value="${G.settings.voice}">`)}
    ${row('Music', `<input id="sx" type="range" min="0" max="1" step="0.05" value="${G.settings.music}">`)}
    ${row('Ambience & effects', `<input id="sa" type="range" min="0" max="1" step="0.05" value="${G.settings.amb}">`)}
    ${row('Tea shop radio', `<select id="sr">${Radio.STATIONS.map((s, i) => `<option value="${i}">${s.name}</option>`).join('')}</select>`)}
    ${row('Subtitles', `<select id="ss"><option value="both">Malayalam + English</option><option value="en">English only</option><option value="ml">Malayalam only</option><option value="off">Off</option></select>`)}
    ${row('Objective marker', `<input id="sm" type="checkbox" ${G.settings.marker ? 'checked' : ''}>`)}
    <div style="display:flex;gap:8px;margin-top:12px"><button id="pr" class="pbtn">Resume (Esc)</button><button id="pt" class="pbtn">Quit to title</button></div>
    <div class="foot">Progress is saved at the start of each chapter and at checkpoints along the way. Quitting returns you to the last one.</div>`;
  $('sr').value = Radio.dbg().st; $('sr').onchange = e => Radio.set(+e.target.value);
  $('ss').value = G.settings.subs;
  $('sv').oninput = e => { G.settings.voice = +e.target.value; saveSettings(); };
  $('sa').oninput = e => { G.settings.amb = +e.target.value; saveSettings(); };
  $('sx').oninput = e => { G.settings.music = +e.target.value; saveSettings(); };
  $('ss').onchange = e => { G.settings.subs = e.target.value; saveSettings(); };
  $('sm').onchange = e => { G.settings.marker = e.target.checked; saveSettings(); };
  const close = () => { G.pauseKey = null; el.style.display = 'none'; G.paused = false; document.body.classList.remove('paused'); AudioSys.holdVoice(false); if (G.running) $('pauseBtn').style.display = 'block'; };
  G.pauseKey = k => { if (k === 'escape' || k === 'p') close(); };
  $('pr').onclick = close;
  $('pt').onclick = async () => {
    close(); G.run++; keyListeners.clear(); G.running = false; G.locked = 0; $('mini').style.display = 'none'; hud(false); hideSub(); $('hold').style.display = 'none'; AudioSys.stopVoice(); AudioSys.radioStop && AudioSys.radioStop(); Music.set(null); letterbox(false); resetWorld();
    if (typeof Radio !== 'undefined') Radio.hush(); try { if (ytPlayer && ytPlayer.stopVideo) ytPlayer.stopVideo(); } catch (e) { } $('np').style.opacity = 0; $('np').dataset.song = ''; $('np').classList.remove('yt');
    $('cap').style.opacity = 0; $('card').style.opacity = 0; if (typeof setHiss === 'function') setHiss(0);
    AudioSys.setRain(0); AudioSys.setHum(0); AudioSys.setAircraft(0); AudioSys.setAmbience({ night: false, birds: false, frogs: false }); await fadeOut(400); showTitle();
  };
}
saveSettings();
rememberHomes();
$('pauseBtn').onclick = () => openPause();
