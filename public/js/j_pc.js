/* ================= PC controls and HUD =================
   Mouse: the character faces the cursor. Left click uses the selected tool, item or
   weapon (hold to repeat); right click interacts (talk, open, harvest, enter).
   Wheel or 1-0 picks a hotbar slot. Keys: WASD move, Space use, E/F interact,
   Shift dodge, R ride, I/Tab bag, C crafting, K skills, N animals, M map, J quests,
   Esc closes a window or opens options. */

const MOUSE = { x: 0, y: 0, down: false, right: false, in: false };
const MENU_KEYS = { i: 'bag', tab: 'bag', c: 'craft', k: 'skills', n: 'animals', m: 'map', j: 'quests', o: 'coll', p: 'friends' };
const TAB_KEY = { bag: 'I', craft: 'C', skills: 'K', animals: 'N', friends: 'P', coll: 'O', map: 'M', quests: 'J', opts: 'Esc' };

function mouseWorld() {
  const Z = pixZoom(cv.height);
  return [camX + MOUSE.x * DPR / Z, camY + MOUSE.y * DPR / Z];
}
function faceMouse() {
  if (!S || !S.p || pl.swing > 0) return;
  const [wx, wy] = mouseWorld(), dx = wx - S.p.x, dy = wy - (S.p.y - 10);
  if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
  S.p.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  if (S.p.dir === 1 || S.p.dir === 2) S.p.lastH = S.p.dir;
}
function primaryUse() {
  if (PAUSED || TITLE) return;
  faceMouse();
  if (fishing) { INPUT.act = true; act(); return; }
  if (selKind() === 'weapon') { INPUT.atk = true; attack(); return; }
  act();
}
function interact() {
  if (PAUSED || TITLE) return;
  faceMouse();
  if (fishing) { act(); return; }
  const it = findInteract(); if (it) it.fn();
}

setupInput = function () {
  $('#mclose').onclick = closeModal;
  const c = cv;
  c.addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('mousemove', e => { MOUSE.x = e.clientX; MOUSE.y = e.clientY; });
  c.addEventListener('mouseenter', () => MOUSE.in = true); c.addEventListener('mouseleave', () => MOUSE.in = false);
  c.addEventListener('mousedown', e => {
    unlockAudio(); MOUSE.in = true;
    if (e.button === 0) { MOUSE.down = true; primaryUse(); }
    if (e.button === 2) { MOUSE.right = true; interact(); }
  });
  addEventListener('mouseup', e => { if (e.button === 0) { MOUSE.down = false; INPUT.act = false; INPUT.atk = false; } if (e.button === 2) MOUSE.right = false; });
  c.addEventListener('wheel', e => { if (PAUSED || !S) return; e.preventDefault(); const n = S.hot.length; S.sel = (S.sel + (e.deltaY > 0 ? 1 : -1) + n) % n; hudKey = ''; }, { passive: false });
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase(); unlockAudio();
    if (k === 'tab') e.preventDefault();
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    INPUT.keys[k] = true;
    if (TITLE) return;
    if (k === 'escape') { if (MODAL) closeModal(); else if (fishing) { fishing = null; showFishUI(false); } else openMenu('opts'); return; }
    if (MENU_KEYS[k] && !e.repeat) { const tab = MENU_KEYS[k]; if (MODAL && MODAL.tabs && MODAL.tabs.some(t => t.id === tab) && MODAL.cur === tab) closeModal(); else if (MODAL && MODAL.tabs && MODAL.tabs.some(t => t.id === tab)) { MODAL.cur = tab; MODAL.opts.sel = null; drawModal(); } else if (!MODAL && !PAUSED) openMenu(tab); return; }
    if (MODAL) return;
    if (k === ' ' && !e.repeat) { INPUT.act = true; act(); }
    if ((k === 'e' || k === 'f') && !e.repeat) { const it = !PAUSED && findInteract(); if (it) it.fn(); else if (fishing) act(); }
    if (k === 'shift' && !e.repeat) dodge();
    if (k === 'r' && !PAUSED && !e.repeat) toggleRide();
    if (/^[0-9]$/.test(k) && !PAUSED) { S.sel = k === '0' ? 9 : +k - 1; hudKey = ''; }
    if (k === 'h') $('#keyhelp').classList.toggle('min');
  });
  addEventListener('keyup', e => { const k = e.key.toLowerCase(); INPUT.keys[k] = false; if (k === ' ') INPUT.act = false; });
  addEventListener('blur', () => { INPUT.keys = {}; MOUSE.down = false; INPUT.act = INPUT.atk = false; });
};

/* hold left mouse to keep using a tool; aim follows the cursor while it's held */
const _update = update;
update = function (dt) {
  if (!PAUSED && !TITLE && S && S.p) {
    if (MOUSE.down || MOUSE.right) faceMouse();
    if (MOUSE.down && !WALK && !fishing && selKind() !== 'weapon' && pl.cd <= 0 && isTool(selKind()) && inReach(...mouseTile())) useTool();
  }
  _update(dt);
};

/* ---- HUD additions: numbers on the bars, menu buttons with key hints, action prompt, key help, tooltips ---- */
const _buildHUD = buildHUD;
buildHUD = function () {
  _buildHUD();
  for (const id of ['#hpb', '#stb']) if (!$(id + ' s')) $(id).append(el('s'));
  const tr = $('#topr'); tr.innerHTML = '';
  [['🎒', 'bag', 'I'], ['⚒', 'craft', 'B'], ['★', 'skills', 'K'], ['🗺', 'map', 'M'], ['📜', 'quests', 'J'], ['⚙', 'opts', 'Esc']].forEach(([ic, tab, key]) =>
    tr.append(el('button', { class: 'sq f-dark', title: tab, on: () => { if (!PAUSED) openMenu(tab); } }, ic, el('kbd', null, key))));
  if (!$('#prompt')) document.body.append(el('div', { id: 'prompt' }, el('span', { id: 'pL' }), el('span', { id: 'pR' })));
  if (!$('#keyhelp')) document.body.append(el('div', { id: 'keyhelp', html: '<kbd>WASD</kbd>move &nbsp; <kbd>LMB</kbd>use / attack &nbsp; <kbd>RMB</kbd> or <kbd>E</kbd>interact<br><kbd>Shift</kbd>dodge &nbsp; <kbd>R</kbd>ride &nbsp; <kbd>1-0</kbd> / wheel hotbar &nbsp; <kbd>H</kbd>hide' }));
  setTimeout(() => $('#keyhelp') && $('#keyhelp').classList.add('min'), 20000);
  S.hot.forEach((k, i) => { const s = $('#hs' + i); if (s) s.addEventListener('mouseenter', () => showTip(s, hotId(i))); if (s) s.addEventListener('mouseleave', hideTip); });
};
function hotId(i) { const k = S.hot[i]; return k === 'weapon' ? S.eq.weapon : isTool(k) ? 'tool:' + k + ':' + S.tools[k] : k; }
const TOOLV = { hoe: 'Till', can: 'Water', axe: 'Chop', pick: 'Mine', rod: 'Cast', weapon: 'Attack' };
const _hudTick = hudTick;
hudTick = function (dt) {
  _hudTick(dt);
  if (!S || TITLE || !$('#pL')) return;
  const hp = $('#hpb s'), st = $('#stb s');
  if (hp) { hp.textContent = Math.ceil(S.p.hp) + ' / ' + maxHP(); st.textContent = Math.ceil(S.p.st) + ' / ' + maxST(); }
  $('#hpb i').style.height = ''; $('#stb i').style.height = '';
  $('#hpb i').style.width = 'calc(' + clamp(S.p.hp / maxHP() * 100, 0, 100) + '% - 4px)'; $('#stb i').style.width = 'calc(' + clamp(S.p.st / maxST() * 100, 0, 100) + '% - 4px)';
  let L = '', Rt = '';
  if (!PAUSED && cur) {
    if (fishing) L = fishing.phase === 'reel' ? 'Hold to reel' : fishing.phase === 'bite' ? 'Hook!' : 'Waiting…';
    else { const k = selKind(); L = TOOLV[k] || (k && IT[k] ? (IT[k].t === 'seed' ? 'Plant' : IT[k].t === 'place' ? 'Place' : IT[k].eat ? 'Eat' : 'Use') : ''); const it = findInteract(); if (it) Rt = it.label; }
  }
  $('#pL').innerHTML = L ? '<kbd>LMB</kbd>' + L : ''; $('#pR').innerHTML = Rt ? '<kbd>RMB</kbd>' + Rt : '';
};

/* tooltips: hotbar slots and any element with data-item */
function showTip(anchor, id) {
  if (!id) return hideTip();
  let name, desc = '';
  if (id.startsWith('tool:')) { const [, t, l] = id.split(':'); name = (TIER_TOOL[+l] || '') + ' ' + (TOOLN[t] || t); }
  else { const it = IT[id]; if (!it) return hideTip(); name = it.n; try { const d = itemDesc(id); desc = typeof d === 'string' ? d : d && d.textContent || ''; } catch (e) { } }
  let t = $('#tip'); if (!t) { t = el('div', { id: 'tip' }); document.body.append(t); }
  t.innerHTML = ''; t.append(el('b', null, name)); if (desc) t.append(el('div', null, desc)); t.hidden = false;
  const r = anchor.getBoundingClientRect(); t.style.left = Math.min(innerWidth - 310, Math.max(8, r.left)) + 'px'; t.style.top = (r.top - t.offsetHeight - 10) + 'px';
}
function hideTip() { const t = $('#tip'); if (t) t.hidden = true; }

/* window tabs show their hotkey */
const _drawModal = drawModal;
drawModal = function () {
  _drawModal(); hideTip();
  if (MODAL && MODAL.title === 'Satchel') document.querySelectorAll('#mtabs .tab').forEach((b, i) => { const t = MODAL.tabs[i]; if (t && TAB_KEY[t.id]) b.append(el('kbd', null, TAB_KEY[t.id])); });
};
/* the satchel opens as a window; Esc on the game opens the options tab */
const _openMenu = openMenu;
openMenu = function (tab, station, focus) { _openMenu(tab || 'bag', station, focus); };

/* ---- cursor: highlight the tile your next action will hit ---- */
function pcCursorDraw(m) {
  if (TITLE || PAUSED || !MOUSE.in || !S || !S.p || fishing) return;
  faceMouse();
  const [tx, ty] = faceTile(); if (!inb(m, tx, ty)) return;
  const X = tx * 16, Y = ty * 16, a = .55 + Math.sin(gameT * 6) * .2;
  g.fillStyle = `rgba(255,246,220,${a})`;
  for (const [x0, y0, w, h] of [[X, Y, 4, 1], [X, Y, 1, 4], [X + 12, Y, 4, 1], [X + 15, Y, 1, 4], [X, Y + 15, 4, 1], [X, Y + 12, 1, 4], [X + 12, Y + 15, 4, 1], [X + 15, Y + 12, 1, 4]]) g.fillRect(x0, y0, w, h);
}
