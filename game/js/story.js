// ===== Nammude Naadu — story: Prologue, Chapter 1 (Veettilekku), Chapter 2 (A Morning in Kerala) =====

// ---------- Shared interaction logic ----------
async function shedAct() {
  let got = false;
  if (active('feed') && !has('feed')) { give('feed'); done('feed'); got = true; }
  if (active('line') && !has('line')) { give('line'); done('line'); got = true; await think('An old spool of nylon line, still good.', 1800); }
  if (active('bamboo') && !has('knife') && !has('bamboo')) { give('knife'); got = true; await think("Appachan's vettukathi, wrapped in cloth and oiled. He always looked after his tools.", 2600); }
  if (active('sickle') && !has('sickle') && !S.sickleSharp) { give('sickle'); got = true; await think("Appachan's arivaal. The blade is blunt and spotted with rust. It needs a good sharpening.", 2800); }
  if ((active('beds') || active('sapling')) && !has('mammatti')) { give('mammatti'); got = true; }
  if (active('compost') && !has('planks') && !has('compostbin') && !S.compostBin) { give('planks', 2); got = true; }
  if (active('cutting') && !has('cutting')) { give('cutting'); done('cutting'); got = true; await think('A bundle of kappa stems, tied with coir. Appachan always kept cuttings for the next season.', 2800); }
  if (!got) await think(S.night ? 'Sacks, rope, the old scooter under a tarpaulin... nothing else.' : 'Rusted tools, coir rope, an old bicycle wheel and Appachan’s scooter under a tarpaulin.', 2600);
}
async function wellAct() {
  if (active('clean')) {
    if (!has('fish', 2)) { await think('I need two fish first.'); return; }
    await hold('Cleaning the fish', 2200, AudioSys.sfx.splash); take('fish', 2); give('cleanfish', 2); done('clean'); return;
  }
  if (active('sickle') && has('sickle') && !S.sickleSharp) { await hold('Sharpening on the well stone', 2000, AudioSys.sfx.sweep); S.sickleSharp = true; done('sickle'); return; }
  if (active('waterBeds') && !has('water')) { await hold('Drawing water — two buckets on a pole', 1700, AudioSys.sfx.knock); AudioSys.sfx.splash(); give('water', 3); return; }
  if ((active('water') || active('waterHen')) && !has('water')) {
    await hold('Drawing water', 1700, AudioSys.sfx.knock); AudioSys.sfx.splash(); give('water'); done('water'); return;
  }
  await think('The well water is as cool and sweet as I remember.');
}
async function grocerAct() {
  if (active('rice')) {
    if (!S.metGrocer) { S.metGrocer = true; await say('c1_gro1'); }
    await say('c1_gro2'); G.cash -= 180; toast('− ₹180'); give('rice'); done('rice'); return;
  }
  if (active('seeds')) { await think('Vasu Chettan wraps cheera, chilli and tomato seeds in newspaper cones. Sixty-five rupees.', 2600); G.cash -= 65; toast('− ₹65'); give('seed_cheera', 1, true); give('seed_chilli', 1, true); give('seed_tomato'); done('seeds'); return; }
  if (active('compost') && !has('nails') && !has('compostbin') && !S.compostBin) { await think('A paper bag of nails. Thirty rupees.', 1800); G.cash -= 30; toast('− ₹30'); give('nails'); return; }
  if (active('line') && !has('line')) { await think('Vasu Chettan pulls a spool of fishing line from a drawer. Forty rupees.', 2400); G.cash -= 40; toast('− ₹40'); give('line'); done('line'); return; }
  await think('Vasu Chettan waves, busy weighing sugar for a customer.', 2000);
}
async function fishAct() { await fishingGame(); }

// ---------- Crafting (C) ----------
const RECIPES = [
  { id: 'rod', out: 'rod', name: 'Bamboo fishing rod', mats: { bamboo: 1, line: 1, hook: 1 }, unlocked: () => S.rodRecipe && !has('rod'), work: 'Whittling the bamboo, tying the line, fixing the hook', after: () => done('craft') },
  { id: 'compostbin', out: 'compostbin', name: 'Compost bin', mats: { planks: 2, nails: 1, leaves: 1 }, unlocked: () => S.compostRecipe && !S.compostBin && !has('compostbin'), work: 'Nailing the planks together' },
  { name: 'Canoe repair kit', note: 'Chapter 6' },
  { name: 'Dog shelter', note: 'Chapter 6' }, { name: 'Pookalam', note: 'Chapter 7' },
];
function openCrafting() {
  if (G.locked) return;
  G.locked++;
  const el = $('panel'); el.style.display = 'block';
  const draw = (msg = '') => {
    el.innerHTML = `<h2>Crafting</h2>` + RECIPES.map(r => {
      if (!r.mats || !r.unlocked()) return `<div class="rec locked"><b>${r.name}</b><div class="mat">Unlocks later${r.note ? ' · ' + r.note : ''}</div></div>`;
      const mats = Object.entries(r.mats).map(([k, n]) => `<span class="${has(k, n) ? 'ok' : 'no'}">${ITEM[k]} ${Math.min(G.inv[k] || 0, n)}/${n}</span>`).join(' · ');
      return `<div class="rec"><b>${r.name}</b><div class="mat">${mats}</div></div>`;
    }).join('') + `<div class="foot">${msg || 'E — craft · C / Esc — close'}</div>`;
  };
  draw();
  const close = () => { keyListeners.delete(l); el.style.display = 'none'; setTimeout(() => { G.locked = Math.max(0, G.locked - 1); }, 0); };
  const l = async k => {
    if (k === 'c' || k === 'escape') return close();
    if (!INTERACT.includes(k)) return;
    const open = RECIPES.filter(r => r.mats && r.unlocked());
    if (!open.length) return draw('Nothing to craft right now.');
    const r = open.find(r => Object.entries(r.mats).every(([m, n]) => has(m, n)));
    if (!r) return draw('Missing materials.');
    keyListeners.delete(l);
    for (let i = 0; i <= 10; i++) { draw(`${r.work}... ${'▮'.repeat(i)}${'▯'.repeat(10 - i)}`); AudioSys.sfx.knock(); await sleep(150); }
    for (const [m, n] of Object.entries(r.mats)) take(m, n);
    give(r.out); r.after && r.after(); draw(`Crafted: ${r.name}!`);
    await sleep(900); el.style.display = 'none'; G.locked = Math.max(0, G.locked - 1);
  };
  keyListeners.add(l);
}

// ---------- Fishing minigame ----------
function fishingGame() {
  return new Promise(resolve => {
    const box = $('mini'), mc = $('mc'), m = mc.getContext('2d'); box.style.display = 'flex'; G.locked++;
    let st = 'ready', t = 0, wait = 0, nib = 0, prog = 0, ten = 0, pull = 0, msg = 'Press E to cast  ·  Esc to stop fishing', last = performance.now(), fin = false, catchName = '';
    const FISH = ['Karimeen (pearl spot)', 'Paral', 'Kari (murrel)', 'Varaal'];
    const finish = () => { keyListeners.delete(key); box.style.display = 'none'; fin = true; G.locked--; resolve(); };
    const key = k => {
      if (k === 'escape' || k === 'q') return finish();
      if (!INTERACT.includes(k)) return;
      if (st === 'ready') {
        if (!has('worm')) { for (const i of [0, 1, 2]) S['soil' + i] = false; msg = 'No worms left — dig more near the banana trees.  (Esc)'; return; }
        take('worm'); st = 'wait'; wait = rnd(2.2, 5); t = 0; msg = 'Watch the float...'; AudioSys.sfx.splash();
      } else if (st === 'wait') { st = 'ready'; give('worm', 1, true); msg = 'Too early! The fish darted away. Press E to cast again.'; }
      else if (st === 'bite') { st = 'reel'; prog = 0.15; ten = 0.15; t = 0; msg = 'Hold E to reel · let go when the fish pulls!'; }
      else if (st === 'result') { if ((G.inv.fish || 0) >= 2) finish(); else { st = 'ready'; msg = 'Press E to cast  ·  Esc to stop fishing'; } }
    };
    G._fish = () => ({ st, pull, ten, prog });
    keyListeners.add(key);
    function step(now) {
      if (fin) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      if (st === 'wait') { wait -= dt; if (Math.random() < dt * 1.1) nib = 0.3; if (wait <= 0) { st = 'bite'; t = 0; AudioSys.sfx.splash(); msg = 'BITE! Press E now!'; } }
      else if (st === 'bite') { if (t > 0.9) { st = 'result'; msg = 'Too slow — it stole the worm. Press E.'; } }
      else if (st === 'reel') {
        pull = (Math.sin(t * 2.1) + Math.sin(t * 3.3 + 1)) > 1.05 ? 1 : 0;
        if (holding()) { prog += dt * (pull ? 0.03 : 0.24); ten += dt * (pull ? 0.95 : 0.1); }
        else { prog -= dt * 0.05; ten -= dt * 0.65; }
        ten = clamp(ten, 0, 1); prog = clamp(prog, 0, 1);
        if (ten >= 1) { st = 'result'; msg = 'SNAP! It broke free. Press E.'; AudioSys.sfx.splash(); }
        else if (prog <= 0) { st = 'result'; msg = 'It slipped away. Press E.'; }
        else if (prog >= 1) {
          catchName = FISH[(Math.random() * FISH.length) | 0]; give('fish', 1, true); AudioSys.sfx.done();
          const n = G.inv.fish; setObjText('fish', `Catch two fish at the pond (${Math.min(2, n)}/2)`); if (n >= 2) done('fish');
          st = 'result'; msg = `Caught a ${catchName}! Press E.`;
        }
      }
      nib = Math.max(0, nib - dt);
      drawFish();
      requestAnimationFrame(step);
    }
    function drawFish() {
      const W = 560, H = 360;
      const g = m.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#3f7f6c'); g.addColorStop(1, '#1f4a44');
      m.fillStyle = g; m.fillRect(0, 0, W, H);
      for (let i = 0; i < 12; i++) { m.fillStyle = '#4f8f45'; m.beginPath(); m.arc(40 + hash(i) * 480, 60 + hash(i + 4) * 260, 14 + hash(i + 8) * 8, 0.4, 6); m.lineTo(40 + hash(i) * 480, 60 + hash(i + 4) * 260); m.fill(); }
      const fx = 300, fy = 190;
      let dip = 0; if (st === 'wait' && nib > 0) dip = Math.sin(nib * 40) * 3; if (st === 'bite') dip = 12 + Math.sin(t * 30) * 3; if (st === 'reel') dip = 6 + Math.sin(t * 9) * (pull ? 6 : 2);
      if (st !== 'ready' && st !== 'result') {
        for (let r = 0; r < 3; r++) { const ph = (t * 0.7 + r / 3) % 1; m.strokeStyle = `rgba(230,245,240,${0.4 * (1 - ph)})`; m.beginPath(); m.ellipse(fx, fy + 6, 8 + ph * 40, (8 + ph * 40) * 0.35, 0, 0, 6.28); m.stroke(); }
        m.strokeStyle = 'rgba(240,240,230,.7)'; m.lineWidth = 1; m.beginPath(); m.moveTo(20, 20); m.quadraticCurveTo(160, 60 + (st === 'reel' ? 60 : 0), fx, fy + dip - 8); m.stroke();
        m.fillStyle = '#e63a2a'; m.beginPath(); m.ellipse(fx, fy + dip - 4, 5, 7, 0, Math.PI, 0); m.fill(); m.fillStyle = '#fff'; m.beginPath(); m.ellipse(fx, fy + dip - 4, 5, 6, 0, 0, Math.PI); m.fill();
      }
      m.fillStyle = '#8a6a3a'; m.lineWidth = 5; m.strokeStyle = '#a3bf55'; m.beginPath(); m.moveTo(-10, 120); m.lineTo(20, 20); m.stroke();
      m.fillStyle = 'rgba(0,0,0,.55)'; m.fillRect(0, 0, W, 34); m.fillStyle = '#f5efe3'; m.font = '600 14px Inter'; m.textAlign = 'center'; m.fillText(msg, W / 2, 22);
      m.textAlign = 'left'; m.font = '12px Inter'; m.fillStyle = '#e8dcc0'; m.fillText(`Worms: ${G.inv.worm || 0}   Fish: ${G.inv.fish || 0}/2`, 12, H - 12);
      m.font = `600 13px ${ML_FONT}`; m.textAlign = 'right'; m.fillText('പുഴക്കര കുളം · Puzhakkara pond', W - 12, H - 12);
      if (st === 'reel') {
        const bx = W - 70; m.fillStyle = 'rgba(0,0,0,.5)'; rr(m, bx - 10, 60, 64, 240, 8);
        m.fillStyle = '#333'; m.fillRect(bx, 70, 16, 210); m.fillRect(bx + 26, 70, 16, 210);
        m.fillStyle = '#7fd36a'; m.fillRect(bx, 70 + 210 * (1 - prog), 16, 210 * prog);
        m.fillStyle = ten > 0.75 ? '#ff4a3a' : '#e8b65a'; m.fillRect(bx + 26, 70 + 210 * (1 - ten), 16, 210 * ten);
        m.fillStyle = '#ddd'; m.font = '10px Inter'; m.textAlign = 'center'; m.fillText('reel', bx + 8, 294); m.fillText('strain', bx + 34, 294);
        if (pull) { m.fillStyle = '#ff6a5a'; m.font = '700 16px Inter'; m.fillText('THE FISH IS PULLING!', W / 2, 70); }
      }
    }
    requestAnimationFrame(step);
  });
}

// ---------- Cooking minigame: meen curry in a manchatti ----------
function cookingGame() {
  return new Promise(resolve => {
    const box = $('mini'), mc = $('mc'), m = mc.getContext('2d'); box.style.display = 'flex';
    const STAGES = [
      ['Splutter mustard seeds & curry leaves in coconut oil', 0.68, 0.88, '#c9a24a'],
      ['Sauté shallots, ginger and green chilli', 0.5, 0.7, '#b8863a'],
      ['Add chilli, kudampuli and ground coconut — simmer', 0.3, 0.5, '#c8502e'],
      ['Slide in the fish and cook gently', 0.14, 0.32, '#b8442a'],
    ];
    let heat = 0.2, si = 0, inZone = 0, last = performance.now(), t = 0, fin = false, flash = '';
    G._cook = () => ({ heat, lo: (STAGES[si] || [0, 0, 0])[1], hi: (STAGES[si] || [0, 0, 0])[2] });
    function step(now) {
      if (fin) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      heat = clamp(heat + (holding() ? 0.55 : -0.38) * dt, 0, 1);
      const [label, lo, hi, col] = STAGES[si];
      if (heat >= lo && heat <= hi) inZone += dt; else if (heat > hi + 0.12) { flash = 'Too hot! Ease off.'; }
      if (inZone >= 2.4) { si++; inZone = 0; AudioSys.sfx.sizzle(); flash = ''; if (si >= STAGES.length) { fin = true; setTimeout(() => { box.style.display = 'none'; resolve(); }, 900); } }
      if (Math.random() < heat * dt * 1.2) AudioSys.sfx.sizzle();
      const W = 560, H = 360;
      m.fillStyle = '#2a1a12'; m.fillRect(0, 0, W, H);
      m.fillStyle = '#6a3a24'; rr(m, 120, 220, 320, 120, 20);
      const fl = heat * 60 + Math.sin(t * 20) * 4;
      for (let i = 0; i < 5; i++) { m.fillStyle = `rgba(255,${120 + i * 20},40,${0.5 + heat * 0.4})`; m.beginPath(); m.moveTo(220 + i * 30, 240); m.quadraticCurveTo(232 + i * 30, 240 - fl - hash(i) * 20, 244 + i * 30, 240); m.fill(); }
      m.fillStyle = '#4a2a1a'; m.beginPath(); m.ellipse(280, 190, 120, 52, 0, 0, 6.28); m.fill();
      m.fillStyle = '#3a1e12'; m.beginPath(); m.ellipse(280, 178, 104, 38, 0, 0, 6.28); m.fill();
      m.fillStyle = si < STAGES.length ? col : '#b8442a'; m.beginPath(); m.ellipse(280, 182, 94, 30, 0, 0, 6.28); m.fill();
      if (si >= 1) { m.fillStyle = '#2e6a2a'; for (let i = 0; i < 8; i++) { m.beginPath(); m.ellipse(220 + hash(i) * 120, 170 + hash(i + 2) * 24, 6, 2.5, hash(i) * 3, 0, 6.28); m.fill(); } }
      if (si >= 3) { m.fillStyle = '#e8c8a8'; for (let i = 0; i < 4; i++) { m.beginPath(); m.ellipse(230 + i * 34, 182 + (i % 2) * 8, 14, 7, 0.3, 0, 6.28); m.fill(); } }
      for (let i = 0; i < heat * 10; i++) { m.fillStyle = 'rgba(255,240,200,.5)'; m.beginPath(); m.arc(200 + hash(i + Math.floor(t * 8)) * 160, 172 + hash(i * 3 + Math.floor(t * 8)) * 22, 2, 0, 6.28); m.fill(); }
      const gx = 40, gy = 60, gh = 240;
      m.fillStyle = '#111'; rr(m, gx, gy, 22, gh, 6);
      if (si < STAGES.length) { m.fillStyle = 'rgba(127,211,106,.45)'; m.fillRect(gx, gy + gh * (1 - hi), 22, gh * (hi - lo)); }
      m.fillStyle = '#e8b65a'; m.fillRect(gx - 6, gy + gh * (1 - heat) - 2, 34, 4);
      m.fillStyle = '#ddd'; m.font = '11px Inter'; m.textAlign = 'center'; m.fillText('heat', gx + 11, gy + gh + 16);
      m.fillStyle = 'rgba(0,0,0,.5)'; m.fillRect(0, 0, W, 50); m.fillStyle = '#f5efe3'; m.font = '600 15px Inter';
      m.fillText(si < STAGES.length ? `${si + 1}/4 · ${label}` : 'Meen curry is ready!', W / 2, 22);
      m.font = '12px Inter'; m.fillStyle = '#cfc4aa'; m.fillText(flash || 'Hold E to raise the flame, release to lower it. Keep the marker in the green band.', W / 2, 40);
      if (si < STAGES.length) { m.fillStyle = '#333'; m.fillRect(140, 330, 280, 6); m.fillStyle = '#7fd36a'; m.fillRect(140, 330, 280 * inZone / 2.4, 6); }
      m.font = `600 13px ${ML_FONT}`; m.fillStyle = '#e8dcc0'; m.textAlign = 'right'; m.fillText('മീൻ കറി · മൺചട്ടി', W - 14, H - 14);
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ---------- helpers ----------
function hud(on) { $('pauseBtn').style.display = on ? 'block' : 'none'; $('status').style.display = on ? 'block' : 'none'; if (!on) { $('obj').style.display = 'none'; $('inv').style.display = 'none'; $('prompt').style.display = 'none'; } else { renderObj(); renderInv(); } }
const waitAll = () => until(() => allDone() && G.locked === 0);
function gate(name, label, ok, fail, fn) {
  setHook(name, label, async () => { if (!ok()) { await think(fail, 2600); return; } clearHook(name); await fn(); }, true);
}
function resetWorld() {
  for (const k of Object.keys(S)) delete S[k];
  letterbox(false); G.cine = null; S.hooks = {}; Obj.items = []; G.day = 0; G.waiters = []; G.timers.forEach(clearInterval); G.timers = []; G.timeRate = 0; renderObj(); G.inv = {}; G.hens = []; G.entities = []; G.camTarget = null; G.player.hidden = false; G.player.sit = false; G.flashlight = false; G.speaking = null;
  restoreHomes(); G.zoomTo = 1; G.talkTo = null; G.riding = false; G.radioMute = false;
}
// Everyone and everything goes back to where it started, so any chapter can be replayed at any time.
let HOMES = null;
function rememberHomes() { HOMES = []; for (const m of Object.values(G.maps)) for (const o of m.objs) { const d = Object.getOwnPropertyDescriptor(o, 'x'); if (o.life || !d || d.get) continue; HOMES.push([o, o.x, o.y, o.w, o.h, o.dir, o.sitting]); } }
function restoreHomes() {
  for (const m of Object.values(G.maps)) for (const o of m.objs) if (o.path) o.path = null;
  if (HOMES) for (const [o, x, y, w, h, dir, sitting] of HOMES) { o.x = x; o.y = y; if (w !== undefined) { o.w = w; o.h = h; } if (dir !== undefined) o.dir = dir; o.sitting = sitting; o.moving = false; }
}
const COOP_ZONE = [27.5, 16.8, 6, 4.5], GROVE_ZONE = [2, 30.5, 7, 10];

// ======================= PROLOGUE =======================
async function prologue() {
  save('prologue');
  G.chapter = 'Prologue · Dubai'; G.time = 7; G.timeRate = 0; G.rain = 0; G.cash = 2000;
  AudioSys.setRain(0); AudioSys.setHum(1); AudioSys.setAmbience({ night: false, birds: false, frogs: false });
  G.player.outfit = 'home';
  await goto('flat', 2.8, 4.9, 'down', false); hud(true); await fadeIn(1400);
  S.phoneGlow = true;
  const alarm = every(() => AudioSys.sfx.alarm(), 1100); AudioSys.sfx.alarm();
  setObj('Prologue — One Last Phone Call', [['alarm', 'Switch off the alarm (phone on the nightstand)']]);
  toast('WASD / Arrows to walk · Shift to run · E to interact');
  setHook('phone', 'Switch off the alarm', async () => { clearInterval(alarm); S.phoneGlow = false; done('alarm'); await say('p_alarm'); });
  await waitAll();
  setObj('Prologue — One Last Phone Call', [['photo', 'Look at the photograph by your bed']]);
  setHook('photo', 'Look at the photograph', async () => { done('photo'); await say('p_photo'); });
  await waitAll();
  await sleep(700);
  S.phoneGlow = true; AudioSys.sfx.ring(); const ring = every(() => AudioSys.sfx.ring(), 1700);
  setObj('Prologue — One Last Phone Call', [['phone1', 'Answer the phone — “Appachan calling”']]);
  setHook('phone', 'Answer — Appachan', async () => { clearInterval(ring); S.phoneGlow = false; done('phone1'); await sayAll(['p_app1', 'p_arj1', 'p_app2', 'p_arj2']); await think('Call ended · 0:41', 1500); });
  await waitAll();
  setObj('Prologue — One Last Phone Call', [['dress', 'Get dressed for work (wardrobe)'], ['eat', "Clear last night's takeaway boxes"], ['door', 'Leave for work (front door)']]);
  setHook('wardrobe', 'Get dressed', async () => { await hold('Changing', 1000, AudioSys.sfx.rustle); G.player.outfit = 'work'; done('dress'); });
  setHook('table', 'Clear the takeaway boxes', async () => { await hold('Clearing up', 900, AudioSys.sfx.rustle); S.boxesCleared = true; done('eat'); await think('Biryani again. Ammachi would be horrified.'); });
  gate('door', 'Leave for work', () => isDone('dress') && isDone('eat'), 'Not like this. Get dressed and tidy up first.', async () => done('door'));
  await waitAll();
  AudioSys.setHum(0.6); G.time = 11.6;
  await goto('office', 8.9, 8.7, 'up');
  G.chapter = 'Prologue · Business Bay';
  setObj('Prologue — Business Bay', [['shibu', 'Talk to Shibu'], ['work', 'Finish the report at your desk']]);
  setHook('shibu', 'Talk to Shibu', async () => { await sayAll(['p_col1', 'p_arj3']); done('shibu'); });
  gate('desk', 'Work on the report', () => isDone('shibu'), 'Shibu is waving at me. Better see what he wants first.', async () => { S.typing = true; await hold('Typing the report', 3000, AudioSys.sfx.knock); S.typing = false; done('work'); });
  await waitAll();
  await fadeOut(900); clearObj(); await card('', '7:40 PM', '', 'The same evening', 2200);
  G.time = 19.7; G.chapter = 'Prologue · Dubai';
  await goto('flat', 8, 8.3, 'up', false); AudioSys.setHum(1); await fadeIn(900);
  await sleep(1800);
  S.phoneGlow = true; AudioSys.sfx.ring(); const ring2 = every(() => AudioSys.sfx.ring(), 1700);
  setObj('Prologue — One Last Phone Call', [['phone2', 'Answer the phone — “Jomon calling”']]);
  setHook('phone', 'Answer — Jomon', async () => { clearInterval(ring2); S.phoneGlow = false; done('phone2'); await sayAll(['p_jom1', 'p_arj4']); });
  await waitAll();
  clearObj();
  await scene(async () => {
    await fadeOut(1000); hud(false); letterbox(true); Music.set('sad'); AudioSys.setHum(0.4);
    painted(sceneAfterCall, 0); await fadeIn(1600);
    await caption('He sat there until the city lights came on.', 3800);
    await caption('Eight years. Every call ended with “next month”.', 3600);
    await fadeOut(2000); endPainted(); AudioSys.setHum(0);
  });
  await cinematicJourney();
  return chapter1();
}

async function cinematicJourney() {
  G.locked++; hud(false); letterbox(true);
  AudioSys.setAircraft(1);
  painted(sceneFlight, 0); await fadeIn(1500);
  await caption('Dubai → Kochi', 3000, 'Night flight · 4 hours');
  await caption('I told him I would call.', 3400);
  await fadeOut(1500); AudioSys.setAircraft(0.4);
  painted(sceneDescent, 0); await fadeIn(1500);
  await caption('Kochi', 3200, '6:10 AM · Monsoon');
  await fadeOut(1300); AudioSys.setAircraft(0); endPainted();
  Music.set('title'); await card('', 'NAMMUDE NAADU', 'നമ്മുടെ നാട്', 'The Things We Left Behind', 6200);
  AudioSys.setRain(0.7);
  painted(sceneBus, 0); await fadeIn(1200);
  await caption('The 2 PM bus to Puzhakkara', 3400, 'Three hours inland');
  await caption('Paddy fields. Coconut palms. Rain on the window. Nothing here had changed.', 3800);
  await fadeOut(1300); endPainted(); letterbox(false); G.locked--;
}

// ======================= CHAPTER 1 — VEETTILEKKU =======================
async function chapter1(part = 0) {
  save('ch1'); Object.assign(G.maps.house.objs.find(o => o.id === 'rag'), { x: 12.3 * T, y: 15.4 * T });
  G.day = 1; G.chapter = 'Chapter 1 · Veettilekku'; G.time = 17.3; G.timeRate = 0.005; G.timeMax = 19.2; G.rain = 0.25;
  AudioSys.setRain(0.4); AudioSys.setHum(0); AudioSys.setAmbience({ birds: true, night: false, frogs: true });
  G.player.outfit = 'travel';
  S.jomonOn = true; S.cocoOn = 1; S.houseLights = true;
  G.hens = [makeHen(28.5, 18, COOP_ZONE), makeHen(30.5, 19, COOP_ZONE, '#e8dcc6'), makeHen(32, 17.8, COOP_ZONE), makeHen(29.4, 20, COOP_ZONE, '#b5532e', true)];
  AUTO.x = 56 * T; AUTO.y = 6.05 * T; AUTO.heading = Math.PI; AUTO.hidden = false; AUTO.passenger = false;
  CANOE.x = 62.9 * T; CANOE.y = 25.4 * T; CANOE.rower = false;
  G.entities = [AUTO, CANOE];
  hud(false); await fadeOut(10);
  if (part < 1) {
  await card('Chapter 1', 'Veettilekku', 'വീട്ടിലേക്ക്', 'Back Home', 3800);
  await goto('village', 60.6, 4.3, 'down', false); hud(true); Music.set('sad'); await fadeIn(1500);
  await scene(() => think('Eight years. I always thought I would come back for a happier reason.', 3400));
  setObj('Chapter 1 — Back Home', [['jomon', "Find Jomon — his auto-rickshaw is by the bus stop"]]);
  setHook('jomon', 'Talk to Jomon', async () => { done('jomon'); G.player.dir = 'left'; letterbox(true); await sayAll(['c1_jom1', 'c1_arj1', 'c1_jom2']); await think('Jomon takes the suitcase without another word and puts a hand on his shoulder.', 3000); });
  await waitAll();
  await scene(async () => {
    await fadeOut(400); S.jomonOn = false; G.player.hidden = true; AUTO.passenger = true; G.camTarget = AUTO; snapCam(); await fadeIn(400);
    const eng = every(() => AudioSys.sfx.engine(), 1100); AudioSys.sfx.engine();
    await Promise.all([
      (async () => { await sleep(2400); await say('c1_arj2'); await say('c1_jom3'); await say('c1_arj2b'); await say('c1_jom4'); })(),
      (async () => { await moveTo(AUTO, 36, 6.05, 80); await moveTo(AUTO, 36, 25, 80); await moveTo(AUTO, 35.2, 25, 50); })(),
    ]);
    clearInterval(eng);
    await fadeOut(500); AUTO.hidden = true; AUTO.passenger = false; G.camTarget = null;
    G.player.hidden = false; G.player.x = 33.4 * T; G.player.y = 25.1 * T; G.player.dir = 'left'; S.ammVeranda = true; snapCam();
    await fadeIn(600);
    await caption('The house. The veranda. The chair where he always sat.', 3400);
    letterbox(false);
  });
  setObj('Chapter 1 — Back Home', [['ammachi', 'Go to Ammachi on the veranda']]);
  setHook('ammV', 'Ammachi', async () => {
    done('ammachi'); G.player.dir = 'right'; letterbox(true);
    await think('She does not say anything at first. She simply holds his hand, and holds it for a long time.', 4000);
    await say('c1_amm1'); await say('c1_arj3b');
    await think('Ammachi looks at the empty space beside her chair.', 2600);
    await say('c1_ammd1'); await sleep(900); await say('c1_ammd2');
    await caption('The rain fills the silence.', 3000);
    await say('c1_arj4b'); await sleep(700); await say('c1_amm2');
    letterbox(false);
  });
  await waitAll();
  await scene(async () => { await fadeOut(500); S.ammVeranda = false; setAmm('kitchen'); Music.set('evening'); await fadeIn(500); });
  S.memOn = true;
  }
  await checkpoint('ch1', 1, part);
  if (part < 2) {
  setObj('Mission 1 — Settle into your old home', [['unpack', 'Unpack your suitcase'], ['windows', 'Open the bedroom windows'], ['sweep', 'Sweep the bedroom floor (0/3)'], ['bedsheet', 'Find a bedsheet and make the bed'], ['bulb', 'Replace the broken light bulb'], ['bathroom', 'Locate the bathroom']], () => `Memories: ${S.mems || 0}/4 (optional) — look at old things in the house`);
  toast('Your room is on the left side of the hall.');
  await waitAll();

  // Mission 2
  G.time = Math.max(G.time, 18.1); G.timeMax = 19.5;
  await scene(() => say('c1_amm3'));
  S.cocoOn = 1;
  setObj("Mission 2 — Ammachi's dinner", [['coconut', 'Collect fallen coconuts (0/2)'], ['curry', 'Pluck curry leaves (plant by the kitchen side)'], ['water', 'Draw water from the well'], ['rice', 'Buy rice at Vasu Stores (junction)'], ['deliver', 'Bring everything to Ammachi in the kitchen']]);
  // Coconuts picked up earlier still count
  { const n = G.inv.coconut || 0; if (n) { setObjText('coconut', `Collect fallen coconuts (${Math.min(2, n)}/2)`); if (n >= 2) done('coconut'); } }
  gate('amm', 'Give Ammachi the groceries', () => ['coconut', 'curry', 'water', 'rice'].every(isDone), 'Coconuts, curry leaves, water and rice. I still need a few things.', async () => {
    take('coconut', 2); take('curry'); take('water'); take('rice'); done('deliver');
  });
  await waitAll();

  // Dinner
  await scene(async () => {
    await fadeOut(900); Music.set('night'); G.time = 19.75; G.timeRate = 0; G.rain = 0.1; AudioSys.setRain(0.2); AudioSys.setAmbience({ night: true, birds: false, frogs: true });
    S.mealOnTable = true; setAmm('table'); await goto('house', 14.3, 11.15, 'down', false); G.player.sit = true;
    await fadeIn(900);
    await say('c1_amm4');
    await think('Kanji, cherupayar, chammanthi and pappadam. The best meal in eight years.', 3000);
    await say('c1_amm5');
    await fadeOut(600); S.mealOnTable = false; G.player.sit = false; G.player.y = 10.75 * T; setAmm('hall'); await fadeIn(600);
  });
  S.verandaLight = true; S.night = true; G.hens.forEach(h => h.hidden = true);
  }
  await checkpoint('ch1', 2, part);
  setObj('Before bed', [['light', 'Switch off the outside light (by the front door)'], ['coop', 'Lock the chicken coop']]);
  await waitAll();
  setObj('Before bed', [['appa', "Look in on Appachan's room"]]);
  setHook('appaBed', "Appachan's bed", async () => {
    done('appa');
    await think('His bed is made, as if he will be back any moment. Something is pushed underneath...', 3200);
    await hold('Pulling it out', 1000); S.boxFound = true; give('note', 1, true);
    await think("A locked wooden box. A folded note sits on top, in Appachan's handwriting.", 3000);
    Music.set('tension'); await say('c1_note');
    await think('There is no key.', 1800);
  });
  await waitAll();
  setObj('Before bed', [['ask', 'Ask Ammachi about the box (hall)']]);
  setHook('amm', 'Ask Ammachi about the box', async () => { done('ask'); await sayAll(['c1_arj3', 'c1_amm6']); });
  await waitAll();
  await scene(async () => { await sleep(300); await fadeOut(400); setAmm('none'); await fadeIn(400); });
  setObj('Before bed', [['sleep', 'Go to sleep (your bed)']]);
  setHook('sleep', 'Sleep', async () => done('sleep'));
  await waitAll();

  // Night
  await scene(async () => {
    await fadeOut(1300); S.houseLights = false; S.verandaLight = false; G.time = 1.2; G.rain = 0.06; AudioSys.setRain(0.12);
    if (G.map.id !== 'house') await goto('house', 2, 4.3, 'down', false);
    G.player.x = 2 * T; G.player.y = 4.3 * T; G.player.dir = 'down'; snapCam();
    await card('', '1:12 AM', '', '', 1800); await fadeIn(1300);
    await sleep(700); AudioSys.sfx.rustle(); await sleep(700); AudioSys.sfx.creak(); await sleep(600); AudioSys.sfx.knock(); await sleep(500);
    await say('c1_arj4');
  });
  S.shedOpen = true;
  setObj('Something outside', [['flash', "Take the flashlight from Appachan's cupboard"], ['investigate', 'Investigate the backyard — near the storage shed (F: flashlight)']]);
  setHook('cupboard', 'Take the flashlight', async () => { give('flashlight'); G.flashlight = false; done('flash'); toast('Press F to switch the flashlight on/off'); });
  await until(() => G.map.id === 'village' && near(G.player, 14, 17, 75) && G.locked === 0);
  done('investigate');
  await scene(async () => { G.player.dir = 'up'; await sleep(500); await say('c1_arj5'); await think('Only the wind and the frogs. But I closed that door myself this evening.', 3400); });
  await fadeOut(2200); clearObj(); hud(false);
  return chapter2();
}

// ======================= FUNERAL & MORNING MONTAGE =======================
async function funeral() {
  G.time = 7.6; G.timeRate = 0; G.rain = 0.55; AudioSys.setRain(0.7); AudioSys.setAmbience({ birds: false, night: false, frogs: false });
  G.day = 2; G.player.outfit = 'white'; give('flowers', 1, true);
  const cm = G.maps.church, jom = cm.objs.find(o => o.id === 'cJom'); jom.x = 8.2 * T; jom.y = 10.9 * T; jom.dir = 'right';
  await goto('church', 10, 13.6, 'up', false);
  await scene(async () => {
    letterbox(true); Music.set('sad');
    await pan([[10, 3.4], [10, 9.5]], [6]); await fadeIn(1800);
    await caption("St. George's Church, Puzhakkara", 3400, 'The next morning');
    G.camTarget = null;
    await caption('The whole village came, in white, under black umbrellas.', 3400);
    letterbox(false);
  });
  AudioSys.sfx.bell();
  hud(true);
  setObj('Appachan', [['flowers', 'Place the flowers on Appachan’s grave']]);
  await until(() => S.flowersPlaced && G.locked === 0);
  done('flowers');
  await scene(async () => {
    letterbox(true); G.player.dir = 'up'; clearObj();
    await sleep(800); await say('c2_fun1');
    await sleep(800); await say('c2_fun2');
    await moveTo(jom, 9.4, 10.6, 40); jom.dir = 'right';
    await say('c2_fun3');
    await caption('He stayed a little longer, after everyone had gone.', 3600);
    await fadeOut(2200); letterbox(false);
  });
  hud(false); AudioSys.setRain(0); G.player.outfit = 'mundu'; G.day = 5;
}
async function morningMontage() {
  G.locked++; hud(false); letterbox(true);
  G.day = 5; G.time = 5.95; G.rain = 0; AudioSys.setRain(0); AudioSys.setAmbience({ birds: true, night: false, frogs: false }); Music.set(null);
  CANOE.x = 64 * T; CANOE.y = 14 * T; CANOE.rower = true; S.kunOn = false;
  await goto('village', 22, 26, 'down', false);
  const songOn = playMorningSong();
  pan([[64, 14], [64, 28]], [10]); moveTo(CANOE, 64.5, 30, 30);
  await fadeIn(2500);
  const ok = await Promise.race([songOn, sleep(5500).then(() => false)]);
  if (!ok) Music.set('morning');
  await caption('Puzhakkara', 3400, '5:52 AM');
  await pan([[64, 28], [48, 14], [41, 6.5]], [7, 6]);
  G.time = 6.2;
  await caption('The tea shop opens before the sun does.', 3200);
  await pan([[41, 6.5], [30, 16], [22, 22]], [6, 5]);
  await caption('And somewhere, a grandmother is already awake.', 3200);
  await fadeOut(1600);
  CANOE.x = 62.9 * T; CANOE.y = 25.4 * T; CANOE.rower = false; S.kunOn = true;
  G.camTarget = null; G.time = 6.4; letterbox(false); G.locked--;
}

// ======================= CHAPTER 2 — A MORNING IN KERALA =======================
async function chapter2(part = 0) {
  save('ch2');
  const wasCash = G.cash; resetWorld(); G.cash = wasCash < 2000 ? wasCash : 1820;
  G.day = part ? 5 : 2; G.chapter = 'Chapter 2 · A Morning in Kerala'; G.time = 6.4; G.timeRate = 0.005; G.timeMax = 12.6; G.rain = 0;
  AudioSys.setRain(0); AudioSys.setHum(0); AudioSys.setAmbience({ birds: true, night: false, frogs: false });
  Object.assign(S, { houseLights: true, bedMade: true, bulbFixed: true, unpacked: true, boxFound: true, win0: true, win1: true, dust0: true, dust1: true, dust2: true, kunOn: true, eggsInNest: true, cocoOn: 2, ammLoc: 'kitchen', swept: true });
  G.player.outfit = 'mundu';
  const RED = makeHen(5, 37.5, GROVE_ZONE, '#b5532e', true);
  G.hens = [makeHen(28.5, 18, COOP_ZONE), makeHen(30.5, 19, COOP_ZONE, '#e8dcc6'), makeHen(32, 17.8, COOP_ZONE), RED];
  CANOE.x = 62.9 * T; CANOE.y = 25.4 * T; CANOE.rower = false; G.entities = [CANOE];
  const kun = G.maps.village.objs.find(o => o.id === 'kun'); kun.x = 54.6 * T; kun.y = 26.6 * T; kun.sitting = true; kun.dir = 'down';
  const vobjs = G.maps.village.objs;
  const henObj = { id: 'redhen', npc: true, get x() { return RED.x; }, get y() { return RED.y; }, label: 'Show her some feed', when: () => active('findHen'), act: async () => { if (!has('feed')) { await think('She will not come for nothing. I need some feed.'); return; } RED.follow = true; done('findHen'); AudioSys.sfx.rustle(); toast('She is following you — lead her back to the coop.'); } };
  const hi = vobjs.findIndex(o => o.id === 'redhen'); if (hi >= 0) vobjs.splice(hi, 1, henObj); else vobjs.push(henObj);
  setAmm('kitchen');
  hud(false); await fadeOut(10);
  if (part < 1) {
  if (!S.skipFuneral) await funeral();
  await card('Chapter 2', 'A Morning in Kerala', 'കേരളത്തിലെ ഒരു പ്രഭാതം', 'Three days later', 3800);
  await morningMontage();
  G.player.outfit = 'mundu';
  await goto('house', 2, 4.3, 'down', false); hud(true); await fadeIn(1500);
  await scene(async () => { await sleep(600); await say('c2_amm1'); fadeSong(5000).then(() => Music.set('morning')); await say('c2_amm2'); });

  setObj('Mission 3 — Collect chicken eggs', [['feed', 'Get the chicken feed from the storage shed'], ['feeder', 'Fill the feeding container at the coop'], ['waterHen', "Refill the hens' water pot (water from the well)"], ['eggs', 'Search the nesting boxes']]);
  await waitAll();
  await scene(async () => { await say('c2_arj1'); await say('c2_amm3'); });
  setObj('Mission 3 — The runaway hen', [['findHen', 'Find the red hen in the banana grove (west of the compound)'], ['lureHen', 'Lead her back to the coop']]);
  await until(() => RED.follow && Math.hypot(RED.x - 30.5 * T, RED.y - 18.5 * T) < 80);
  RED.follow = false; RED.zone = COOP_ZONE; RED.tx = 30 * T; RED.ty = 18.5 * T; done('lureHen');
  await idle();
  S.keyGlint = true;
  await scene(() => think('She trots straight to the others as if nothing happened. Wait — something is glinting near the shed.', 3400));
  setObj('Mission 3 — Collect chicken eggs', [['key', 'Check what is glinting near the shed'], ['giveEggs', 'Bring the eggs to Ammachi (kitchen)']]);
  setHook('amm', 'Give Ammachi the eggs', async () => { take('eggs', 3); done('giveEggs'); await say('c2_amm4'); await say('c2_arj3'); });
  await waitAll();

  }
  // Mission 4
  await checkpoint('ch2', 1, part);
  if (part < 2) {
  S.rodRecipe = true; for (const i of [0, 1, 2]) S['soil' + i] = false;
  setObj('Mission 4 — Catch fish for lunch', [['bamboo', "Cut a bamboo branch at the riverbank (Appachan's knife is in the shed)"], ['line', 'Find fishing line (shed, or Vasu Stores)'], ['hook', 'Ask Kunjumon for a hook (hut by the river)'], ['worms', 'Dig up earthworms near the bananas (0/3)'], ['craft', 'Craft a fishing rod (press C)'], ['fish', 'Catch two fish at the pond (0/2)']]);
  setHook('kunjumon', 'Talk to the old fisherman', async () => { await say('c2_kun0'); give('hook'); done('hook'); await think('He goes back to mending his net without another word. But he keeps glancing at me.', 3000); });
  await waitAll();

  // Kunjumon
  await scene(async () => {
    kun.sitting = false; G.player.dir = 'right'; Music.set('tension'); letterbox(true);
    await moveTo(kun, 50.9, 29.6, 70); kun.dir = 'left';
    await think('Kunjumon has walked over from his hut. He looks at Arjun for a long time.', 3000);
    await say('c2_kun1'); await say('c2_arj4'); await say('c2_kun2');
    const leave = (async () => { await moveTo(kun, 61, 28.6, 80); await moveTo(kun, 62.7, 25.8, 60); S.kunOn = false; CANOE.rower = true; await moveTo(CANOE, 66.5, 34, 45); await moveTo(CANOE, 67, 58, 60); })();
    await sleep(1600); await say('c2_arj5');
    await sleep(2500);
    await think('For the first time in years, Arjun begins to question what he was told about his father.', 3800);
    letterbox(false); Music.set('day');
  });

  }
  // Mission 5
  await checkpoint('ch2', 2, part);
  S.cocoOn = 2; S.coco0 = false;
  setObj('Mission 5 — Prepare lunch', [['clean', 'Clean the fish at the well'], ['kudampuli', 'Pick kudampuli from the tree by the south fence'], ['curry2', 'Pluck curry leaves'], ['grate', 'Grate a coconut in the kitchen (fallen coconut under the palms)'], ['cook', 'Cook meen curry with Ammachi (hearth)']]);
  gate('grate', 'Grate the coconut', () => has('coconut'), 'I need a coconut first — there is usually one fallen under the palms near the mango tree.', async () => {
    S.grating = true; await hold('Grating on the chirava', 2000, AudioSys.sfx.sweep); S.grating = false; take('coconut'); give('grated'); done('grate');
  });
  gate('hearth', 'Cook with Ammachi', () => ['clean', 'kudampuli', 'curry2', 'grate'].every(isDone), 'Ammachi: fish, kudampuli, curry leaves and coconut first. I am missing something.', async () => {
    await say('c2_amm5'); await cookingGame(); take('cleanfish', 2); take('kudampuli'); take('curry'); take('grated'); await say('c2_amm6'); done('cook');
  });
  await waitAll();

  // Lunch
  await scene(async () => {
    await fadeOut(900); Music.set('evening'); letterbox(true); G.time = 13; G.timeRate = 0; S.mealOnTable = true; setAmm('table');
    await goto('house', 14.3, 11.15, 'down', false); G.player.sit = true; await fadeIn(900);
    await say('c2_arj6'); await say('c2_amm7');
    await think('She changes the subject. Just as she did about the box.', 2600);
    await say('c2_arj7');
    letterbox(false);
  });
  await fadeOut(2200); clearObj(); hud(false);
  return chapter3();
}

// ======================= CHAPTER 3 — APPACHAN'S FARM =======================
async function bedAct(i) {
  const b = S.beds[i], info = CROP_INFO[i];
  if (active('beds') && !b.dug) {
    if (!has('mammatti')) { await think("I need Appachan's mammatti from the shed to turn this soil."); return; }
    await hold('Turning the soil with the mammatti', 1500, AudioSys.sfx.dig); b.dug = true;
    { const bx = FARM_BEDS[i] * T, p = G.player; if (p.x > bx - 8 && p.x < bx + 1.4 * T + 8 && p.y > 40 * T && p.y < 43.4 * T) { p.y = 43.55 * T; p.dir = 'up'; } }
    const n = S.beds.filter(x => x.dug).length; setObjText('beds', `Dig planting beds with the mammatti (${n}/5)`); if (n === 5) done('beds'); return;
  }
  if (active('plant') && !b.crop) {
    const missing = info.needs.filter(k => !has(k));
    if (missing.length) { await think(`To plant ${info.name} I still need: ${missing.map(k => ITEM[k]).join(', ')}.`, 2600); return; }
    await hold(`Planting ${info.name}`, 1300, AudioSys.sfx.dig); info.needs.forEach(k => take(k)); b.crop = info.crop; b.stage = 0;
    const n = S.beds.filter(x => x.crop).length; setObjText('plant', `Plant all five beds (${n}/5)`); if (n === 5) done('plant'); return;
  }
  if (active('waterBeds') && b.crop && !b.water) {
    if (!has('water')) { await think('The bucket is empty. Back to the well.'); return; }
    await hold('Watering', 800, AudioSys.sfx.splash); take('water'); b.water = true;
    const n = S.beds.filter(x => x.water).length; setObjText('waterBeds', `Water the beds (${n}/5)`); if (n === 5) done('waterBeds');
  }
}
async function chapter3(part = 0) {
  save('ch3');
  const wasCash = G.cash; resetWorld(); G.cash = wasCash < 2000 ? wasCash : 1780;
  G.chapter = "Chapter 3 · Appachan's Farm"; G.day = 6; G.time = 7; G.timeRate = 0.005; G.timeMax = 17.5; G.rain = 0;
  AudioSys.setRain(0); AudioSys.setHum(0); AudioSys.setAmbience({ birds: true, night: false, frogs: false });
  Object.assign(S, { houseLights: true, bedMade: true, bulbFixed: true, unpacked: true, boxFound: true, win0: true, win1: true, dust0: true, dust1: true, dust2: true, kunOn: true, cocoOn: 0, swept: true, beds: [0, 1, 2, 3, 4].map(() => ({})) });
  G.player.outfit = 'mundu'; give('knife', 1, true); give('key', 1, true); give('rod', 1, true);
  G.hens = [makeHen(28.5, 18, COOP_ZONE), makeHen(30.5, 19, COOP_ZONE, '#e8dcc6'), makeHen(32, 17.8, COOP_ZONE), makeHen(29.4, 20, COOP_ZONE, '#b5532e', true)];
  CANOE.x = 62.9 * T; CANOE.y = 25.4 * T; CANOE.rower = false; G.entities = [CANOE];
  const kun = G.maps.village.objs.find(o => o.id === 'kun'); kun.x = 54.6 * T; kun.y = 26.6 * T; kun.sitting = true; kun.dir = 'down';
  const sasi = G.maps.village.objs.find(o => o.id === 'sasi'); sasi.x = 55.1 * T; sasi.y = 4.4 * T; sasi.dir = 'down';
  setAmm('none');
  hud(false); await fadeOut(10);
  if (part < 1) {
  await card('Chapter 3', "Appachan's Farm", 'അപ്പച്ചന്റെ പറമ്പ്', '', 3800);
  S.ammVeranda = true;
  await goto('village', 23.6, 24.4, 'right', false); hud(true); Music.set('morning'); await fadeIn(1500);
  await scene(async () => {
    give('notice', 1, true); await think('A brown envelope lies on the veranda chair, under Ammachi’s spectacles.', 2600);
    await say('c3_arj2'); S.debt = 85000; await say('c3_amm2'); await say('c3_arj3'); await say('c3_amm3');
  });
  setObj("Chapter 3 — Appachan's Farm", [['visit', 'Go to the farm through the back gate (south of the compound)']]);
  await until(() => G.map.id === 'village' && G.player.y > 36.6 * T && G.player.x > 18 * T && G.player.x < 26 * T && G.locked === 0);
  done('visit');
  await scene(async () => {
    G.player.dir = 'down'; letterbox(true); Music.set('sad');
    await pan([[22, 36.4], [22, 41.5]], [3.5]);
    await say('c3_arj1');
    await pan([[22, 41.5], [30.5, 39]], [3.5]);
    await caption('The pump house, swallowed by weeds.', 2800);
    await pan([[30.5, 39], [13.5, 41]], [4.5]);
    await caption('A fallen fence. Waist-high grass. Months of silence.', 3200);
    await pan([[13.5, 41], [22, 37.6]], [3]);
    G.camTarget = null; letterbox(false); Music.set('day');
  });

  // Mission 6
  S.compostRecipe = true;
  setObj('Mission 6 — Restore the farmland', [['sickle', "Find Appachan's sickle (shed) and sharpen it at the well"], ['weeds', 'Clear the weeds (0/6)'], ['branches', 'Collect fallen branches (0/4)'], ['fence', 'Repair the broken fence (0/3)'], ['compost', 'Make a compost bin (planks: shed · nails: Vasu Stores · dry leaves: mango tree), craft it (C), set it by the pit'], ['beds', 'Dig planting beds with the mammatti (0/5)']]);
  await waitAll();

  }
  // Mission 7
  await checkpoint('ch3', 1, part);
  if (part < 2) {
  await scene(() => think('Clean ground, a mended fence, five beds of dark turned soil. Now, what to grow?', 2800));
  setObj('Mission 7 — Plant your first crops', [['seeds', 'Buy cheera, chilli and tomato seeds (Vasu Stores)'], ['stake', 'Cut a bamboo stake for the tomato (riverbank)'], ['cutting', 'Find tapioca stem cuttings (shed)'], ['sapling', 'Dig up a banana sucker in the banana grove'], ['plant', 'Plant all five beds (0/5)'], ['waterBeds', 'Water the beds (0/5) — draw water at the well']], () => 'Chilli and banana need compost. Rain waters crops for you; too much rain can damage them.');
  await waitAll();
  G.time = Math.max(G.time, 17.2);
  await scene(async () => { // Ammachi has walked down to see the farm
    const av = G.maps.village.objs.find(o => o.npc && o.voice === 'ammachi'), home = [av.x, av.y, av.dir, av.sitting]; await fadeOut(600);
    if (G.map.id !== 'village') await goto('village', 22, 38.6, 'down', false);
    av.sitting = false; av.x = G.player.x + 1.2 * T; av.y = G.player.y; av.dir = 'left'; S.ammVeranda = true; G.player.dir = 'right'; await fadeIn(700);
    await think('Ammachi has come down the path on her own, one hand on the fence. She bends and touches the soil.', 3000);
    await say('c3_amm4'); await fadeOut(600); [av.x, av.y, av.dir, av.sitting] = home; await fadeIn(600);
  });
  setObj('Evening', [['sleep', 'Rest — sleep in your room']]);
  setHook('sleep', 'Sleep', async () => done('sleep'));
  await waitAll();

  // Day 4
  await scene(async () => {
    await fadeOut(1300); G.day = 7; G.time = 6.8; G.timeMax = 17.8; S.ammVeranda = false; setAmm('kitchen');
    S.beds.forEach(b => { b.stage = 1; b.water = false; });
    if (G.map.id !== 'house') await goto('house', 2, 4.3, 'down', false);
    G.player.x = 2 * T; G.player.y = 4.3 * T; snapCam();
    await card('', 'Day 7', '', 'Small green shoots have appeared in every bed.', 2600); await fadeIn(1300);
    AudioSys.sfx.bell(); await sleep(900); await say('c3_amm5');
  });
  }
  await checkpoint('ch3', 2, part);

  // Mission 8
  setObj('Mission 8 — Repair the water pump', [['inspect', 'Inspect the old pump house at the farm'], ['pumpweeds', 'Clear the weeds choking the pump'], ['sasi', 'Ask Sasi Chettan for help (workshop at the junction)'], ['parts', 'Buy the replacement parts (₹650)'], ['repair', 'Repair the pump with Sasi Chettan']]);
  setHook('pump', 'Inspect the pump', async () => { done('inspect'); await think('The impeller is cracked, the washer has rotted away, and the intake is buried in weeds.', 3200); }, false);
  setHook('sasi', 'Talk to Sasi Chettan', async () => {
    if (!isDone('inspect')) { await think('I should look at the pump first so I can tell him what is wrong.'); setHook('sasi', 'Talk to Sasi Chettan', S.hooks.__sasi); return; }
    await say('c3_sas1'); done('sasi');
    setHook('sasi', 'Buy the parts (₹650)', async () => {
      if (G.cash < 650) { await think('Not enough cash.'); return; }
      G.cash -= 650; toast('− ₹650'); give('parts'); done('parts'); await say('c3_sas2');
      await fadeOut(500); sasi.x = 29.6 * T; sasi.y = 39.4 * T; sasi.dir = 'right'; await fadeIn(500);
    });
  });
  S.hooks.__sasi = S.hooks.sasi.fn;
  await until(() => isDone('parts') && isDone('pumpweeds') && G.locked === 0);
  gate('pump', 'Repair the pump with Sasi Chettan', () => has('parts'), 'I need the parts first.', async () => {
    G.player.dir = 'up'; await hold('Fitting the impeller and washer', 3000, AudioSys.sfx.knock); take('parts');
    S.pumpFixed = true; AudioSys.sfx.engine(); setTimeout(() => AudioSys.sfx.engine(), 1000); setTimeout(() => AudioSys.sfx.engine(), 2000);
    done('repair'); await say('c3_sas3');
    await think('Water runs down the channel into every bed. Part of the farm now waters itself.', 3000);
  });
  await waitAll();

  // The unexpected visitor
  await scene(async () => {
    await fadeOut(1200); sasi.x = 55.1 * T; sasi.y = 4.4 * T; sasi.dir = 'down';
    G.time = 18.9; G.timeRate = 0; AudioSys.setAmbience({ night: true, birds: false, frogs: true });
    S.photoOnTable = true; setAmm('hall'); for (const k of ['photo1996', 'sickle', 'mammatti', 'branch', 'water', 'leaves', 'compost']) G.inv[k] = 0; renderInv();
    await goto('house', 15.5, 14.1, 'left', false);
    const rag = G.maps.house.objs.find(o => o.id === 'rag'); rag.x = 12.3 * T; rag.y = 15.5 * T; rag.dir = 'up';
    await card('', 'That evening', '', '', 1800); await fadeIn(1000);
    AudioSys.sfx.doorknock(); await sleep(1500);
    letterbox(true); Music.set('tension'); S.ragOn = true; await moveTo(rag, 13.6, 14.3, 50); rag.dir = 'right';
    await say('c3_rag1');
    await think('Raghavan. Former cooperative president, the man who paid for the new school roof. He sits without being asked.', 3400);
    await say('c3_rag2'); await say('c3_rag3');
    G.player.dir = 'right'; await say('c3_amm6');
    await say('c3_rag4');
    rag.dir = 'up'; await think('He stands to leave, and his eyes fall on the photograph lying on the table.', 2800);
    await say('c3_rag5'); G.player.dir = 'left'; await say('c3_arj6'); await say('c3_rag6');
    rag.dir = 'down'; await moveTo(rag, 12.3, 15.6, 70); S.ragOn = false;
    await sleep(600); G.player.dir = 'right';
    await say('c3_arj7'); await say('c3_amm7');
    await think('August 17, 1996. Raghavan was there. And he knows something about that day.', 3400);
  });
  await fadeOut(2200); clearObj(); hud(false);
  return chapter4();
}

// ======================= TITLE =======================
// Checkpoints: a snapshot of the world saved part-way through a chapter. Loading one runs the chapter's set-up, skips the
// parts already played, then restores the snapshot.
const SNAP_NPCS = ['kun', 'sasi', 'jomon', 'meera', 'latha', 'kabeer'];
function saveSnap(key, n) {
  try {
    const flags = {}; for (const k in S) { if (k === 'hooks') continue; const v = S[k]; if (v === null || ['boolean', 'number', 'string'].includes(typeof v) || k === 'beds' || k === 'scooter') flags[k] = v; }
    const npc = {}; for (const id of SNAP_NPCS) { const o = G.maps.village.objs.find(q => q.id === id); if (o) npc[id] = { x: o.x, y: o.y, dir: o.dir, sitting: !!o.sitting }; }
    const snap = { key, n, flags, npc, inv: G.inv, cash: G.cash, time: G.time, timeRate: G.timeRate, timeMax: G.timeMax, day: G.day, rain: G.rain, outfit: G.player.outfit, map: G.map.id, x: G.player.x / T, y: G.player.y / T, dir: G.player.dir, music: Music.mood, amb: Object.assign({}, AudioSys.flags), chapter: G.chapter,
      hens: G.hens.map(h => ({ x: h.x, y: h.y, zone: h.zone, color: h.color, red: h.red, hidden: !!h.hidden })), auto: { x: AUTO.x, y: AUTO.y, hidden: !!AUTO.hidden, on: G.entities.includes(AUTO) } };
    localStorage.setItem('nn_snap', JSON.stringify(snap)); toast('Checkpoint saved');
  } catch (e) { console.warn('checkpoint', e.message); }
}
function readSnap() { try { const s = JSON.parse(localStorage.getItem('nn_snap') || 'null'); return s && s.key && s.n ? s : null; } catch (e) { return null; } }
async function checkpoint(key, n, part) {
  if (n < part) return; // already past this one
  if (part !== n) { saveSnap(key, n); return; }
  const s = readSnap(); if (!s || s.key !== key || s.n !== n) return;
  const hooks = S.hooks; Object.assign(S, s.flags); S.hooks = hooks; G.inv = s.inv || {}; G.cash = s.cash; G.time = s.time; G.timeRate = s.timeRate; G.timeMax = s.timeMax; G.day = s.day; G.rain = s.rain; G.chapter = s.chapter; G.player.outfit = s.outfit; G.player.hidden = false; G.player.sit = false;
  for (const id in s.npc) { const o = G.maps.village.objs.find(q => q.id === id); if (o) Object.assign(o, s.npc[id], { path: null }); }
  if (s.hens.length) { const keep = G.hens; G.hens = s.hens.map((h, i) => Object.assign(keep[i] || makeHen(0, 0, h.zone, h.color, h.red), h, { tx: h.x, ty: h.y, follow: false })); }
  AUTO.x = s.auto.x; AUTO.y = s.auto.y; AUTO.hidden = s.auto.hidden; AUTO.passenger = false; G.entities = G.entities.filter(e => e !== AUTO); if (s.auto.on) G.entities.push(AUTO);
  AudioSys.setAmbience(s.amb); AudioSys.setRain(s.amb.rain || 0); if (S.ammLoc) setAmm(S.ammLoc);
  await goto(s.map, s.x, s.y, s.dir, false); letterbox(false); hud(true); renderInv(); Music.set(s.music); await fadeIn(1200); toast('Continuing from your last checkpoint');
}
const CHAPTERS = [
  { key: 'prologue', name: 'Prologue', sub: 'One Last Phone Call', ml: 'അവസാനത്തെ ഫോൺ വിളി', fn: () => prologue() },
  { key: 'ch1', name: 'Chapter 1', sub: 'Veettilekku · Back Home', ml: 'വീട്ടിലേക്ക്', fn: p => chapter1(p) },
  { key: 'ch2', name: 'Chapter 2', sub: 'A Morning in Kerala', ml: 'കേരളത്തിലെ ഒരു പ്രഭാതം', fn: p => chapter2(p) },
  { key: 'ch3', name: 'Chapter 3', sub: "Appachan's Farm", ml: 'അപ്പച്ചന്റെ പറമ്പ്', fn: p => chapter3(p) },
  { key: 'ch4', name: 'Chapter 4', sub: 'Pazhaya Koottukaar · Old Friends', ml: 'പഴയ കൂട്ടുകാർ', fn: p => chapter4(p) },
  { key: 'ch5', name: 'Chapter 5', sub: 'The Locked Room', ml: 'പൂട്ടിയ മുറി', fn: p => chapter5(p) },
  { key: 'ch6', name: 'Chapter 6', sub: 'A Village Full of Stories', ml: 'കഥകളുടെ ഗ്രാമം', fn: null },
];
function unlockedIndex() {
  let u = +(localStorage.getItem('nn_unlocked') || 0);
  const saved = CHAPTERS.findIndex(c => c.key === localStorage.getItem('nn_chapter'));
  return Math.max(u, saved, 0);
}
function save(ch) {
  try {
    localStorage.setItem('nn_chapter', ch); const sn = readSnap(); if (!sn || sn.key !== ch) localStorage.removeItem('nn_snap');
    const i = CHAPTERS.findIndex(c => c.key === ch);
    if (i > +(localStorage.getItem('nn_unlocked') || 0)) { localStorage.setItem('nn_unlocked', i); if (i > 0) toast(`Unlocked: ${CHAPTERS[i].name} — ${CHAPTERS[i].sub}`); }
  } catch (e) { }
}
async function startChapter(i, part = 0) {
  G.run++; keyListeners.clear(); G.locked = 0; G.paused = false; hideSub(); G.pauseKey = null; AudioSys.init(); $('title').style.display = 'none'; resetWorld(); G.cash = 2000; $('fade').style.opacity = 1; G.running = true; Music.set(null);
  if (!part) { const sn = readSnap(); if (sn && sn.key === CHAPTERS[i].key) localStorage.removeItem('nn_snap'); }
  try { await CHAPTERS[i].fn(part); } catch (e) { console.error(e); }
}
function showTitle() {
  G.running = false; hud(false); letterbox(false);
  const t = $('title'); t.style.display = 'flex';
  const b = $('btns'); b.innerHTML = '';
  const savedKey = localStorage.getItem('nn_chapter'), savedI = CHAPTERS.findIndex(c => c.key === savedKey);
  const btn = (label, fn, cls = '') => { const el = document.createElement('button'); el.innerHTML = label; el.className = cls; el.onclick = () => { AudioSys.init(); AudioSys.sfx.blip(); fn(); }; b.appendChild(el); return el; };
  const main = () => {
    b.innerHTML = '';
    const sn = readSnap(), part = savedI >= 0 && sn && sn.key === savedKey ? sn.n : 0;
    if (savedI >= 0) btn(`Continue <span class="bsub">${CHAPTERS[savedI].name} · ${CHAPTERS[savedI].sub}${part ? ' · checkpoint' : ''}</span>`, () => startChapter(savedI, part), 'primary');
    btn('New Game', () => { if (savedI > 0 && !confirm('Start again from the Prologue? Unlocked chapters stay unlocked.')) return; startChapter(0); }, savedI < 0 ? 'primary' : '');
    btn('Chapters', chapters);
    btn('Settings', settings);
    btn('Credits', credits);
  };
  const chapters = () => {
    b.innerHTML = '<div class="menuh">Chapters</div>';
    const u = unlockedIndex();
    CHAPTERS.forEach((c, i) => {
      const locked = i > u || !c.fn;
      const el = btn(`${locked ? '🔒 ' : ''}${c.name} <span class="bsub">${c.sub}</span><span class="bml">${c.ml}</span>`, () => { if (!locked) startChapter(i); }, 'chap' + (locked ? ' locked' : ''));
      if (locked) el.title = c.fn ? 'Finish the previous chapter to unlock' : 'Coming soon';
    });
    btn('← Back', main, 'back');
  };
  const settings = () => {
    b.innerHTML = `<div class="menuh">Settings</div><div class="setbox">
      <label>Voices <input id="tsv" type="range" min="0" max="1" step="0.05" value="${G.settings.voice}"></label>
      <label>Music <input id="tsm" type="range" min="0" max="1" step="0.05" value="${G.settings.music ?? 0.6}"></label>
      <label>Ambience & effects <input id="tsa" type="range" min="0" max="1" step="0.05" value="${G.settings.amb}"></label>
      <label>Subtitles <select id="tss"><option value="both">Malayalam + English</option><option value="en">English only</option><option value="ml">Malayalam only</option><option value="off">Off</option></select></label>
      <label>Objective marker <input id="tsk" type="checkbox" ${G.settings.marker ? 'checked' : ''}></label></div>`;
    $('tss').value = G.settings.subs;
    $('tsv').oninput = e => { G.settings.voice = +e.target.value; saveSettings(); };
    $('tsm').oninput = e => { G.settings.music = +e.target.value; saveSettings(); };
    $('tsa').oninput = e => { G.settings.amb = +e.target.value; saveSettings(); };
    $('tss').onchange = e => { G.settings.subs = e.target.value; saveSettings(); };
    $('tsk').onchange = e => { G.settings.marker = e.target.checked; saveSettings(); };
    btn('← Back', main, 'back');
  };
  const credits = () => {
    b.innerHTML = `<div class="menuh">Credits</div><div class="credits">
      Story & design — from the Nammude Naadu design document<br>
      Malayalam voices — generated with ElevenLabs (eleven_v3)<br>
      Village soundscapes and effects — generated with ElevenLabs Sound Effects<br>
      Radio: old film songs — Saregama Carvaan Malayalam &amp; Saregama Malayalam, streamed via YouTube<br>
      Radio: <i>Nammude Naadu</i> — original song made for this game<br>
      Morning song — <i>Sri Venkateswara Suprabhatham</i>, M.S. Subbulakshmi (Saregama), played via YouTube<br>
      Score, ambience and art — generated in code, inspired by Kerala ragas and villages</div>`;
    btn('← Back', main, 'back');
  };
  main();
}
// First click anywhere on the title starts the title music
$('title').addEventListener('pointerdown', () => { AudioSys.init(); if (typeof saveSettings === 'function') saveSettings(); if ($('title').style.display !== 'none' && !Music.mood) Music.set('title'); });
showTitle();
