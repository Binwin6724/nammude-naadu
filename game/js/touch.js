// ===== Nammude Naadu — on-screen controls for phones and tablets =====
(() => {
  if (!('ontouchstart' in window || navigator.maxTouchPoints > 0) || !matchMedia('(pointer: coarse)').matches) return;
  document.body.classList.add('touch');
  const el = document.createElement('div'); el.id = 'touch';
  el.innerHTML = '<div id="stick"><div id="nub"></div></div><div id="tbtns"><button data-k="c">✂</button><button data-k="f">🔦</button><button data-k="v" class="ride">🛵</button><button data-k="h" class="riding">📯</button><button data-k="shift" data-hold="1">Run</button><button data-k="q" class="mini">Pass</button><button data-k="e" data-hold="1" class="big">E</button></div><button id="tpause">❚❚</button><div id="turn"><div>↻</div>Turn your phone sideways to play</div>';
  document.body.appendChild(el);
  const fire = (t, k) => dispatchEvent(new KeyboardEvent(t, { key: k })), dn = k => { if (!keys[k]) fire('keydown', k); }, up = k => { if (keys[k]) fire('keyup', k); };
  for (const b of el.querySelectorAll('#tbtns button')) { const k = b.dataset.k, st = e => { e.preventDefault(); b.classList.add('on'); AudioSys.init && AudioSys.ctx() && AudioSys.ctx().state !== 'running' && AudioSys.ctx().resume(); dn(k); if (!b.dataset.hold) setTimeout(() => up(k), 60); }, en = e => { e.preventDefault(); b.classList.remove('on'); up(k); }; b.addEventListener('touchstart', st, { passive: false }); b.addEventListener('touchend', en, { passive: false }); b.addEventListener('touchcancel', en, { passive: false }); }
  el.querySelector('#tpause').addEventListener('touchstart', e => { e.preventDefault(); openPause(); }, { passive: false });
  const stick = el.querySelector('#stick'), nub = el.querySelector('#nub'); let id = null;
  const set = (dx, dy) => { const d = Math.hypot(dx, dy), m = 42, k = d > m ? m / d : 1; nub.style.transform = `translate(${dx * k}px,${dy * k}px)`; const th = 14; dx > th ? (dn('d'), up('a')) : dx < -th ? (dn('a'), up('d')) : (up('a'), up('d')); dy > th ? (dn('s'), up('w')) : dy < -th ? (dn('w'), up('s')) : (up('w'), up('s')); };
  const mv = e => { for (const t of e.changedTouches) if (t.identifier === id) { const r = stick.getBoundingClientRect(); set(t.clientX - r.left - r.width / 2, t.clientY - r.top - r.height / 2); e.preventDefault(); } };
  stick.addEventListener('touchstart', e => { id = e.changedTouches[0].identifier; mv(e); e.preventDefault(); }, { passive: false }); stick.addEventListener('touchmove', mv, { passive: false });
  for (const n of ['touchend', 'touchcancel']) stick.addEventListener(n, e => { for (const t of e.changedTouches) if (t.identifier === id) { id = null; set(0, 0); } });
  // tap anywhere on the scene to move dialogue on
  $('c').addEventListener('touchstart', () => { if (G.running && !G.paused && $('sub').style.display === 'block') { dn('enter'); setTimeout(() => up('enter'), 50); } }, { passive: true });
  setInterval(() => { el.style.display = G.running && !G.paused && $('panel').style.display !== 'block' ? 'block' : 'none'; const sc = S.scooter; el.classList.toggle('canride', !!(sc && sc.fixed)); el.classList.toggle('isriding', !!G.riding); el.classList.toggle('ismini', $('mini').style.display === 'flex'); }, 200);
})();
