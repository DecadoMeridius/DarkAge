/* ================= Settings (Phase 15 polish) =================
   Stored once for the whole game (localStorage 'emberhollow_settings'), not per save:
   - AUDIO: master, music, effects and ambience volumes (four gain nodes; a_core routes every
     sound through audioOut()). AMBIENCE is new: birdsong on spring and summer days, crickets on
     warm nights, wind in winter and in the high places, rain on the roof, a crackle near fires.
   - GRAPHICS: zoom (auto, or a fixed even zoom so pixels stay crisp), particles (full, low, off),
     an FPS counter, fullscreen.
   - CONTROLS: every action can be rebound. A rebound key is translated into the action's default
     key before the game sees it (KEYMAP), so all the modules keep reading their default keys.
   The Options tab (Esc) shows all of it. */

const SET_KEY = 'emberhollow_settings';
const SETTINGS = Object.assign({ master: 80, music: 60, sfx: 80, amb: 60, zoom: 'auto', particles: 'full', fps: false, binds: {} }, (() => { try { return JSON.parse(localStorage.getItem(SET_KEY) || '{}'); } catch (e) { return {}; } })());
const saveSettings = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(SETTINGS)); } catch (e) {} };
let PARTICLE_K = 1;

/* ---- audio buses ---- */
let BUS = null, BUS_MODE = 'sfx';
function buildBus() {
  if (!AC || BUS) return;
  const master = AC.createGain(); master.connect(AC.destination);
  BUS = { master };
  for (const k of ['music', 'sfx', 'amb']) { BUS[k] = AC.createGain(); BUS[k].connect(master); }
  applyVolumes();
}
function applyVolumes() { if (!BUS) return; BUS.master.gain.value = SETTINGS.master / 100; BUS.music.gain.value = SETTINGS.music / 100 * 1.2; BUS.sfx.gain.value = SETTINGS.sfx / 100; BUS.amb.gain.value = SETTINGS.amb / 100; }
function AUDIO_BUS() { if (!AC) return null; if (!BUS) buildBus(); return BUS[BUS_MODE] || BUS.sfx; }
const _musicTickS = musicTick;
musicTick = function (dt, mode) { BUS_MODE = 'music'; try { _musicTickS(dt, mode); } finally { BUS_MODE = 'sfx'; } };

/* ---- ambience: small procedural sounds on a timer, by place, season, time and weather ---- */
let AMB_T = 0;
function ambientTick(dt) {
  if (!S || TITLE || !SOUND_ON || !AC || PAUSED || SETTINGS.amb <= 0 || !cur) return;
  AMB_T -= dt; if (AMB_T > 0) return; AMB_T = .35 + Math.random() * .5;
  BUS_MODE = 'amb';
  try {
    const t = S.time, night = t >= 1200 || t < 330, b = cur.bio ? BIOMES[cur.bio[Math.floor(S.p.y / 16) * cur.w + Math.floor(S.p.x / 16)]] : null;
    if (cur.dark) { if (Math.random() < .15) snd(1800 + Math.random() * 600, .05, 'sine', .006, -900); return; } // drips in the mines
    if (cur.indoor) return;
    if (S.weather === 'rain') { noiseBurst(.5, .016, 1500); return; }
    const cold = S.season === 3 || ['frost', 'tundra', 'glacier', 'peaks'].includes(b);
    if (cold && Math.random() < .5) noiseBurst(.9, .01 + Math.random() * .008, 300);
    if (!night && S.season < 2 && !cold && Math.random() < .35) { // birdsong: two or three quick slides
      const f = 2200 + Math.random() * 1600, n = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) snd(f + i * 140, .07, 'sine', .012, Math.random() < .5 ? 600 : -500, i * .09);
    }
    if (night && S.season > 0 && S.season < 3 && Math.random() < .6) for (let i = 0; i < 3; i++) snd(4200, .025, 'square', .0025, 0, i * .05); // crickets
    if (b === 'coast' || b === 'isles' || b === 'reef') noiseBurst(1.1, .012, 500); // surf
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) { const o = getO(cur, Math.floor(S.p.x / 16) + x, Math.floor(S.p.y / 16) + y); if (o && (o.k === 'campfire' || (o.on && /forge|furnace|smelter|kiln|oven/.test(o.k)))) { noiseBurst(.06, .02, 2500); return; } }
  } finally { BUS_MODE = 'sfx'; }
}
const _updateS = update;
update = function (dt) { _updateS(dt); ambientTick(dt); if (PARTS.length > 400 * PARTICLE_K) PARTS.splice(0, PARTS.length - Math.floor(400 * PARTICLE_K)); };

/* ---- graphics ---- */
const _pixZoomS = pixZoom;
pixZoom = function (H) { return SETTINGS.zoom === 'auto' ? _pixZoomS(H) : +SETTINGS.zoom; };
function applyGraphics() {
  PARTICLE_K = { full: 1, low: .4, off: 0 }[SETTINGS.particles] ?? 1;
  let f = document.getElementById('fpsbox');
  if (SETTINGS.fps && !f) { f = el('div', { id: 'fpsbox' }); Object.assign(f.style, { position: 'fixed', left: '8px', bottom: '8px', zIndex: 60, font: '600 12px Fredoka, sans-serif', color: '#fff6e0', background: 'rgba(42,28,24,.7)', padding: '2px 6px', pointerEvents: 'none' }); document.body.append(f); }
  if (!SETTINGS.fps && f) f.remove();
}
{ let n = 0, t0 = performance.now(); const tick = () => { n++; const t = performance.now(); if (t - t0 >= 1000) { const f = document.getElementById('fpsbox'); if (f) f.textContent = Math.round(n * 1000 / (t - t0)) + ' fps'; n = 0; t0 = t; } requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
applyGraphics();

/* ---- controls: rebinding ---- */
const ACTIONS = [['up', 'Move up', 'w'], ['left', 'Move left', 'a'], ['down', 'Move down', 's'], ['right', 'Move right', 'd'], ['use', 'Use tool', ' '], ['interact', 'Interact', 'e'],
  ['dodge', 'Dodge', 'shift'], ['ride', 'Ride', 'r'], ['abil1', 'Ability 1', 'z'], ['abil2', 'Ability 2', 'x'], ['abil3', 'Ability 3', 'c'], ['bag', 'Backpack', 'i'], ['craft', 'Recipes', 'b'],
  ['skills', 'Skills', 'k'], ['tree', 'Passive tree', 't'], ['animals', 'Animals', 'n'], ['friends', 'Friends', 'p'], ['family', 'Family', 'f'], ['coll', 'Collections', 'o'], ['map', 'Map', 'm'], ['quests', 'Quests', 'j'], ['help', 'Key help', 'h']];
const KEYNAME = k => k === ' ' ? 'Space' : k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1);
let KEYMAP = {}, SUPPRESS = new Set();
function buildKeymap() {
  KEYMAP = {}; SUPPRESS = new Set();
  for (const [id, , def] of ACTIONS) { const k = SETTINGS.binds[id]; if (k && k !== def) { KEYMAP[k] = def; SUPPRESS.add(def); } }
  for (const k in KEYMAP) SUPPRESS.delete(k); // a key that now does another action isn't swallowed
}
buildKeymap();
const DEF_EVENT_KEY = k => k === ' ' ? ' ' : k === 'shift' ? 'Shift' : k === 'tab' ? 'Tab' : k;
let REBIND = null;
for (const type of ['keydown', 'keyup']) addEventListener(type, e => {
  if (e.__mapped) return;
  const k = e.key.toLowerCase();
  if (REBIND && type === 'keydown') { e.preventDefault(); e.stopImmediatePropagation(); if (k !== 'escape') { for (const id in SETTINGS.binds) if (SETTINGS.binds[id] === k) delete SETTINGS.binds[id]; SETTINGS.binds[REBIND] = k; saveSettings(); buildKeymap(); } REBIND = null; if (MODAL) refresh(); return; }
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (KEYMAP[k]) { e.preventDefault(); e.stopImmediatePropagation(); const ev = new KeyboardEvent(type, { key: DEF_EVENT_KEY(KEYMAP[k]), bubbles: true, repeat: e.repeat }); ev.__mapped = 1; dispatchEvent(ev); return; }
  if (SUPPRESS.has(k)) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);

/* ---- the Options tab ---- */
const _renderOptsSet = renderOpts;
renderOpts = function (b) {
  _renderOptsSet(b);
  const slider = (key, label) => { const inp = el('input', { type: 'range', min: 0, max: 100, value: SETTINGS[key] }); inp.style.width = '160px';
    inp.oninput = () => { SETTINGS[key] = +inp.value; applyVolumes(); saveSettings(); lab.textContent = label + ' ' + inp.value; if (key === 'sfx' || key === 'master') SFX.pop(); };
    const lab = el('span', null, label + ' ' + SETTINGS[key]); lab.style.cssText = 'display:inline-block;width:120px'; return el('div', { class: 'acts' }, lab, inp); };
  const choice = (key, label, opts) => el('div', { class: 'acts wrap' }, el('span', { style: 'display:inline-block;width:120px' }, label), ...opts.map(([v, n]) => el('button', { class: 'btn' + (String(SETTINGS[key]) === String(v) ? '' : ' ghost'), on: () => { SETTINGS[key] = v; saveSettings(); applyGraphics(); refresh(); } }, n)));
  const sec = el('div', { class: 'f-panel' }); sec.style.cssText = 'padding:10px;margin-top:10px';
  sec.append(el('h3', null, 'Sound'), slider('master', 'Master'), slider('music', 'Music'), slider('sfx', 'Effects'), slider('amb', 'Ambience'));
  sec.append(el('h3', null, 'Graphics'), choice('zoom', 'Zoom', [['auto', 'Auto'], [2, '2×'], [4, '4×'], [6, '6×'], [8, '8×']]), choice('particles', 'Particles', [['full', 'Full'], ['low', 'Low'], ['off', 'Off']]),
    choice('fps', 'FPS counter', [[false, 'Off'], [true, 'On']]),
    el('div', { class: 'acts' }, el('span', { style: 'display:inline-block;width:120px' }, 'Window'), el('button', { class: 'btn ghost', on: () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(() => {}); } }, 'Toggle fullscreen')));
  const keys = el('div', { class: 'list' });
  for (const [id, n, def] of ACTIONS) { const cur_ = SETTINGS.binds[id] || def;
    keys.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, n)), el('div', { class: 'acts' },
      el('button', { class: 'btn' + (REBIND === id ? '' : ' ghost'), on: () => { REBIND = id; refresh(); } }, REBIND === id ? 'Press a key… (Esc cancels)' : KEYNAME(cur_)),
      cur_ !== def ? el('button', { class: 'btn ghost', on: () => { delete SETTINGS.binds[id]; saveSettings(); buildKeymap(); refresh(); } }, 'Reset') : null))); }
  sec.append(el('h3', null, 'Controls'), el('p', { class: 'note' }, 'Click an action, then press the key you want for it. Esc always closes windows.'), keys);
  b.prepend(sec);
};
