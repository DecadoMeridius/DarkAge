/* ================= Playtest 1 fixes (docs/playtest/BACKLOG.md, section A) =================
   A1 The farm's way to the village was a 2-tile gap at the very edge, hidden under the canopies of the
      border trees. Both ends now get a wide opening (6 tiles), a wider exit, a widened road and a signpost,
      and the north exits to the Wilds get a signpost too. Only natural things are cleared (trees, rocks,
      weeds...), never anything the player placed. */

const NATURAL = new Set(['tree', 'rock', 'stone', 'twig', 'weed', 'tgrass', 'bush', 'log', 'boulder', 'flower', 'fern']);
function clearNatural(m, x0, y0, x1, y1) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!inb(m, x, y)) continue; const [ax, ay, o] = mainOf(m, x, y); if (o && NATURAL.has(o.k)) delObj(m, ax, ay); }
}
function signAt(m, x, y, text) { if (inb(m, x, y) && !getO(m, x, y) && !m.solidB[y * m.w + x]) setO(m, x, y, { k: 'sign', fixed: 1, text }); }
function widenExit(m, to, y0, h) { const w = m.warps.find(w => w.to === to && w.h <= 2); if (w) { w.y = y0; w.h = h; } }

const _genFarmF = genFarm;
genFarm = function () {
  const m = _genFarmF(), W = m.w;
  clearNatural(m, W - 9, 13, W - 1, 24);
  for (let x = W - 9; x < W; x++) for (let y = 17; y <= 20; y++) if (!m.soil[y * W + x] && !getO(m, x, y)) setT(m, x, y, 'd');
  widenExit(m, 'village', 16, 6);
  signAt(m, W - 5, 21, 'East → Emberhollow Village: Mara\'s seeds, the smithy, the carpenter, the tavern.');
  clearNatural(m, 24, 0, 30, 3); signAt(m, 29, 3, 'North → The Wilds: forests, the old mine, and monsters. Bring food.');
  return m;
};
const _genVillageF = genVillage;
genVillage = function () {
  const m = _genVillageF();
  clearNatural(m, 0, 13, 8, 24);
  for (let x = 0; x < 4; x++) for (let y = 17; y <= 20; y++) setT(m, x, y, 'p');
  widenExit(m, 'farm', 16, 6);
  signAt(m, 3, 21, 'West → Hollowmere Farm');
  clearNatural(m, 22, 0, 28, 3); signAt(m, 27, 3, 'North → The Wilds');
  return m;
};

/* A2 The map (M) on the farm, the village and other small places drew the Wilds chart, which is blank
      until explored. Small maps now get their own map: ground, trees and rocks, buildings with their
      names, exits with where they lead, signposts, and a "You" marker. The Wilds chart is a button away. */
const BLD_N = { store: 'Mara\'s Store', smith: 'Brann\'s Smithy', carpenter: 'Hale\'s Carpentry', tavern: 'Tavern', stablemaster: 'Odile\'s Stables', museum: 'Museum',
  landowner: 'Manor (land)', house: 'Your house', tent: 'Your tent', coop: 'Coop', barn: 'Barn', stable: 'Stable', greenhouse: 'Greenhouse', bank: 'Storage shed', silo: 'Silo', stall: 'Market stall', site: 'Build site', fisher: 'Fisher\'s hut', cottage: 'Cottage', mine: 'Mine' };
const MAP_N = { farm: 'Hollowmere Farm', village: 'Emberhollow Village', wilds: 'The Wilds', greenhouse: 'Greenhouse' };
const placeName = id => MAP_N[id] || (typeof REGIONS !== 'undefined' && REGIONS[id] ? REGIONS[id].n : (MAPS[id] && MAPS[id].name) || id);
function localMapCanvas(m) {
  const k = Math.max(6, Math.min(14, Math.floor(900 / m.w))), W = m.w * k, H = m.h * k;
  const c = el('canvas', { width: W, height: H }), x = c.getContext('2d');
  const COL = { g: '#7cb04c', d: '#c8a070', p: '#b8aa98', s: '#e6d29a', w: '#4a92c4', r: '#8a8070', x: '#6a6258', sn: '#e8eef4', a: '#7a6a5a', st: '#9a9284' };
  for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
    const t = getT(m, i, j), D = TER[t] || {}; x.fillStyle = m.soil[j * m.w + i] ? '#7a5434' : COL[t] || (D.water ? '#4a92c4' : D.solid ? '#7a7266' : '#8ab85a'); x.fillRect(i * k, j * k, k, k);
    const o = getO(m, i, j); if (!o) continue;
    const oc = o.k === 'tree' || o.k === 'ancient' ? '#2e5a26' : /rock|stone|boulder|ore/.test(o.k) ? '#5a5650' : o.k === 'sign' ? '#ffd040' : OBJ[o.k] && OBJ[o.k].place ? '#d8a050' : null;
    if (oc) { x.fillStyle = oc; x.beginPath(); x.arc(i * k + k / 2, j * k + k / 2, o.k === 'sign' ? k * .5 : k * .38, 0, 6.283); x.fill(); }
  }
  x.font = '600 ' + Math.max(10, k + 1) + 'px Fredoka, sans-serif'; x.textAlign = 'center'; x.lineWidth = 3;
  const label = (t, X, Y, col) => { x.strokeStyle = 'rgba(42,28,24,.9)'; x.strokeText(t, X, Y); x.fillStyle = col || '#fff6e0'; x.fillText(t, X, Y); };
  for (const b of m.bld) { x.fillStyle = '#a8744a'; x.fillRect(b.x * k, b.y * k, b.w * k, b.h * k); x.strokeStyle = '#4a2e1a'; x.lineWidth = 2; x.strokeRect(b.x * k + 1, b.y * k + 1, b.w * k - 2, b.h * k - 2); x.lineWidth = 3;
    label(BLD_N[b.act] || BLD_N[b.kind] || DOORL[b.act] || '', (b.x + b.w / 2) * k, (b.y + b.h / 2) * k + 4); }
  for (const w of m.warps) { const X = (w.x + w.w / 2) * k, Y = (w.y + w.h / 2) * k; x.fillStyle = '#ffd040'; x.fillRect(w.x * k, w.y * k, Math.max(k, w.w * k), Math.max(k, w.h * k));
    const east = w.x >= m.w - 2, west = w.x <= 1, ty = Math.min(H - 8, Math.max(16, Y + (w.y === 0 ? 20 : w.y >= m.h - 2 ? -10 : -(w.h * k) / 2 - 6)));
    x.textAlign = east ? 'right' : west ? 'left' : 'center'; label((east ? '' : west ? '← ' : '↑ ') + placeName(w.to) + (east ? ' →' : ''), east ? W - 4 : west ? 4 : X, ty, '#ffe08a'); x.textAlign = 'center'; }
  if (cur === m) { const px = S.p.x / 16 * k, py = S.p.y / 16 * k; x.fillStyle = '#e8342a'; x.beginPath(); x.arc(px, py, Math.max(5, k * .6), 0, 6.283); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); x.lineWidth = 3; label('You', px, py - k - 2, '#ffb0a0'); }
  return c;
}
const _renderMapF = renderMap;
renderMap = function (b) {
  const small = cur && !cur.region && cur.id !== 'wilds' && !cur.dark && !(cur.id || '').startsWith('in_') && MODAL.opts.mapView !== 'wilds';
  if (!small) { _renderMapF(b); if (cur && cur.id !== 'wilds' && !cur.region) b.prepend(el('button', { class: 'btn ghost', on: () => { MODAL.opts.mapView = 'local'; refresh(); } }, 'Back to the map of ' + placeName(cur.id))); return; }
  b.append(el('div', { class: 'acts' }, el('b', null, placeName(cur.id)), el('span', { style: 'flex:1' }), el('button', { class: 'btn ghost', on: () => { MODAL.opts.mapView = 'wilds'; refresh(); } }, 'Map of the Wilds and regions')));
  const c = localMapCanvas(cur); c.className = 'wmap localmap'; b.append(el('div', { class: 'mapbox' }, c), el('p', { class: 'note' }, 'Yellow: exits and signposts. Brown: buildings. Red: you.'));
};

/* A3 Actions hit the tile under the mouse when it's next to you (diagonals too), not only the tile in
      front of you; after walking to something you clicked, the action hits exactly that tile; and with
      the rod, clicking water a few tiles away casts toward it. */
let AIM = null;
const _faceTileA = faceTile;
faceTile = function () {
  if (AIM) return AIM;
  if (S && S.p && MOUSE.in && !TITLE && !WALK && !(typeof PLACING !== 'undefined' && PLACING) && cur) {
    const [tx, ty] = mouseTile(), [px, py] = playerTile();
    if (Math.max(Math.abs(tx - px), Math.abs(ty - py)) === 1) return [tx, ty];
  }
  return _faceTileA();
};
const _arriveA = arrive;
arrive = function (w) {
  const t = w && w.target, [px, py] = playerTile();
  if (t && Math.max(Math.abs(t[0] - px), Math.abs(t[1] - py)) === 1) AIM = t;
  try { _arriveA(w); } finally { AIM = null; }
};
const _primaryUseA = primaryUse;
primaryUse = function () {
  if (!PAUSED && !TITLE && !fishing && S && cur && selKind() === 'rod') {
    const [tx, ty] = clickTarget(), [px, py] = playerTile(), D = TER[getT(cur, tx, ty)] || {};
    if ((D.water || D.lava) && Math.max(Math.abs(tx - px), Math.abs(ty - py)) <= 6) {
      stopWalk(); faceTileAt(tx, ty); const d = DIRV[S.p.dir], [fx, fy] = _faceTileA();
      const wt = [0, 1, 2].map(k => [fx + d[0] * k, fy + d[1] * k]).find(([x, y]) => { const T = TER[getT(cur, x, y)] || {}; return T.water || T.lava; });
      if (wt) { AIM = wt; try { act(); } finally { AIM = null; } return; } // water up to 3 tiles ahead: cast
    }
  }
  return _primaryUseA();
};

/* A6 Getting stuck. Walking straight into the corner of a trunk or a wall now slides you around it
      (up to 6 px of nudge), and if something solid ever ends up on top of you (a placed object, the
      starter workbench) you can walk out of it in any direction. The workbench also keeps clear of you. */
const _moveEntA = moveEnt;
moveEnt = function (m, e, dx, dy, hw) {
  if (e === S.p && !boxFree(m, e.x, e.y, hw)) { e.x += dx; e.y += dy; return true; } // inside something: let the player out
  const moved = _moveEntA(m, e, dx, dy, hw);
  if (e !== S.p) return moved;
  const ax = Math.abs(dx), ay = Math.abs(dy);
  if (ax > ay * 2 && !boxFree(m, e.x + dx, e.y, hw)) { for (let k = 1; k <= 6; k++) for (const s of [-1, 1]) if (boxFree(m, e.x + dx, e.y + s * k, hw)) { _moveEntA(m, e, 0, s * Math.min(ax, k), hw); return true; } }
  if (ay > ax * 2 && !boxFree(m, e.x, e.y + dy, hw)) { for (let k = 1; k <= 6; k++) for (const s of [-1, 1]) if (boxFree(m, e.x + s * k, e.y + dy, hw)) { _moveEntA(m, e, s * Math.min(ay, k), 0, hw); return true; } }
  return moved;
};

/* A7 Placing things on top of yourself. A building ghost turns red where it would cover you, and a chest,
      machine or fence that would end up inside your body is refused (the item stays in your bag). */
const _placeOkA = placeOk;
placeOk = function (m, x, y, B, ignoreTent) {
  if (!_placeOkA(m, x, y, B, ignoreTent)) return false;
  if (m !== cur) return true;
  const x0 = S.p.x - 6, x1 = S.p.x + 6, y0 = S.p.y - 6, y1 = S.p.y + 2; // the player's body box
  return !(x1 > x * 16 && x0 < (x + B.w) * 16 && y1 > y * 16 && y0 < (y + B.h + 1) * 16);
};
const _useItemTrap = useItem;
useItem = function (id) {
  const it = IT[id], m = cur;
  if (!it || (it.t !== 'place' && it.t !== 'path') || !m) return _useItemTrap(id);
  const [tx, ty] = faceTile(), before = getO(m, tx, ty), n = cnt(id);
  _useItemTrap(id);
  const o = getO(m, tx, ty);
  if (o && o !== before && OBJ[o.k] && OBJ[o.k].solid && !boxFree(m, S.p.x, S.p.y, 5)) { delObj(m, tx, ty); if (cnt(id) < n) give(id, 1, 0, true); toast('Step back a little first: that would trap you.', 'bad'); }
};

/* A8 Options: "Save and quit to title" and "Load another save" (both save first; in the sandbox they
      just leave). Going back to the title reloads the page; the load list then opens by itself. */
function quitToTitle(openLoad) {
  const ok = (typeof SANDBOX !== 'undefined' && SANDBOX) || saveGame();
  if (!ok) { toast('Could not save, so you stay in the game.', 'bad'); return; }
  try { if (openLoad) sessionStorage.setItem('emberhollow_openload', '1'); } catch (e) {}
  location.reload();
}
const _renderOptsQ = renderOpts;
renderOpts = function (b) {
  _renderOptsQ(b);
  b.prepend(el('div', { class: 'acts wrap' }, el('button', { class: 'btn', on: () => quitToTitle(true) }, 'Load another save'), el('button', { class: 'btn ghost', on: () => quitToTitle(false) }, 'Save and quit to title')));
};
const _bootQ = boot;
boot = function () {
  _bootQ();
  let open = false; try { open = sessionStorage.getItem('emberhollow_openload') === '1'; sessionStorage.removeItem('emberhollow_openload'); } catch (e) {}
  if (open && typeof showSlots === 'function') setTimeout(showSlots, 300);
};

/* A9 Demolishing. Hale's Buildings tab lists your buildings and build sites with a Demolish button
      (click twice). A finished building refunds half its materials; a build site returns everything
      delivered. A coop, barn or stable with animals in it, and your only house, can't be demolished. */
function demolish(s) {
  const B = BP[s.k], m = MAPS.farm; if (!B || !m) return;
  if (s.stage >= 4 && B.build && S.animals.some(a => ANIMAL[a.sp].house === B.build)) { toast('Move or sell the animals living there first.', 'bad'); return; }
  if (s.k === 'cottage' && s.stage >= 4) { toast('You can\'t demolish the house you live in.', 'bad'); return; }
  const back = s.stage >= 4 ? Object.fromEntries(Object.entries(B.cost).map(([i, n]) => [i, Math.floor(n / 2)])) : Object.assign({}, s.delivered || {});
  S.structures = S.structures.filter(x => x !== s);
  const b = m.bld.find(b => b.struct === s); if (b) removeB(m, b);
  if (B.obj) { const o = getO(m, s.x, s.y + B.h - 1); if (o && o.k === B.obj) delObj(m, s.x, s.y + B.h - 1); }
  if (s.stage >= 4 && B.build && !S.structures.some(x => x.k === s.k && x.stage >= 4)) S.build[B.build] = 0;
  if (s.k === 'silo' && typeof siloSync === 'function') siloSync();
  for (const [i, n] of Object.entries(back)) if (n > 0) give(i, n, 0, true);
  CHUNK.clear(); SFX.chop(); toast(B.n + ' demolished.' + (Object.values(back).some(n => n > 0) ? ' Materials returned: ' + Object.entries(back).filter(([, n]) => n > 0).map(([i, n]) => n + ' ' + IT[i].n).join(', ') + '.' : ''), 'lvl');
}
const _renderBuildD = renderBuild;
renderBuild = function (b) {
  _renderBuildD(b);
  const mine = S.structures.filter(s => BP[s.k]); if (!mine.length) return;
  const L = el('div', { class: 'list' });
  for (const s of mine) { const B = BP[s.k]; let sure = 0;
    L.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, B.n + (s.stage >= 4 ? '' : ' (build site)')), el('small', null, s.stage >= 4 ? 'Demolishing returns half its materials.' : 'Demolishing returns everything delivered so far.')),
      el('button', { class: 'btn ghost', on: e => { if (++sure < 2) { e.target.textContent = 'Demolish? Click again'; return; } demolish(s); refresh(); } }, 'Demolish'))); }
  b.append(el('h3', null, 'Your buildings'), L);
};

/* A10/A11 Leashing. Every enemy remembers where it was spawned. When you're far away (15 tiles; bosses 20)
      it stops chasing, walks home and heals up, and a boss stops attacking altogether (no slams or rock
      rings across the map) and clears any attack it was winding up. */
const _updateEnemiesL = updateEnemies;
updateEnemies = function (m, dt) {
  for (const e of m.ents) {
    if (e.type !== 'enemy' || e.dead) continue;
    const E = EN[e.k] || {}; if (!e.home) e.home = [e.x, e.y];
    const d = Math.hypot(S.p.x - e.x, S.p.y - e.y), far = E.boss ? 280 : 240, hd = Math.hypot(e.home[0] - e.x, e.home[1] - e.y);
    if (E.boss && !e.woke) { if (d < 190) { e.woke = 1; toast((E.n || 'The boss') + ' notices you!', 'bad'); } else { e.stun = Math.max(e.stun || 0, dt * 1.01); continue; } } // bosses wait until you come close
    if (d > far || (e.leash && d > far * .6)) {
      e.leash = 1; e.stun = Math.max(e.stun || 0, dt * 1.01); // the normal AI skips it this frame
      for (const k of ['tele', 'tele2', 'tel', 'charging']) if (e[k]) e[k] = 0; if (e.ai && e.ai.c) e.ai.c = 0;
      if (hd > 6) { const s = (E.spd || 30) * dt; moveEnt(m, e, (e.home[0] - e.x) / hd * Math.min(hd, s), (e.home[1] - e.y) / hd * Math.min(hd, s), 4); }
      e.hp = Math.min(e.mhp || e.hp, e.hp + (e.mhp || 0) * .08 * dt);
      if (typeof TARGET !== 'undefined' && TARGET === e && d > far) TARGET = null;
    } else if (e.leash && hd < 8) { e.leash = 0; if (E.boss) e.woke = 0; }
  }
  return _updateEnemiesL(m, dt);
};

/* A12 Loot from kills flies to you (it used to lie where the enemy fell, far away when you use a bow), and an
      enemy brought to 0 health by any route (arrows, burning, bleeding) always dies properly and drops loot. */
const _killEnemyL = killEnemy;
killEnemy = function (m, e) {
  const n0 = m.ents.length; _killEnemyL(m, e);
  for (let i = n0; i < m.ents.length; i++) { const d = m.ents[i]; if (d && d.type === 'drop') { d.home = 1; d.vx = (Math.random() - .5) * 50; d.vy = (Math.random() - .5) * 30; } }
};
const _updateEnemiesK = updateEnemies;
updateEnemies = function (m, dt) { for (const e of m.ents) if (e.type === 'enemy' && !e.dead && e.hp <= 0) killEnemy(m, e); return _updateEnemiesK(m, dt); };

/* A13 small fixes */
// the flame glow is drawn over everything after the colour grade: skip it while you stand in front of that fire
const _flameAtF = flameAt;
flameAt = function (o, x, y) {
  const p = _flameAtF(o, x, y); if (!p || !S || !S.p) return p;
  return S.p.y > (y + 1) * 16 - 2 && Math.abs(S.p.x - p[0]) < 12 && p[1] > S.p.y - 36 ? null : p;
};
// the same toast twice within 1.5 s is shown once
let _lastToast = ['', 0];
const _toastF = toast;
toast = function (msg, kind) { const t = performance.now(); if (msg === _lastToast[0] && t - _lastToast[1] < 1500) return; _lastToast = [msg, t]; return _toastF(msg, kind); };
// tooltips never stick after a drag
addEventListener('dragend', () => typeof hideTip === 'function' && hideTip(), true);
addEventListener('drop', () => typeof hideTip === 'function' && hideTip(), true);
// villages: no trees growing out of roofs
const _genVillageT = genVillage;
genVillage = function () { const m = _genVillageT(); for (const b of m.bld) clearNatural(m, b.x - 1, b.y - 3, b.x + b.w, b.y - 1); return m; };
// one toast per finished craft, "1 item", plural requests, desktop wording
const _toastW = toast;
toast = function (msg, kind) {
  if (typeof msg === 'string') {
    if (/^Crafted .*\.$/.test(msg) && typeof JOB !== 'undefined' && JOB_RUN) return; // the batch's "done" toast says it
    msg = msg.replace(/\b1 items\b/g, '1 item').replace(/\.\.(\s|$)/g, '.$1').replace(/tapping/g, 'clicking');
  }
  return _toastW(msg, kind);
};
// the new-game slot is saved once the arrival letter is closed, not before the character exists
const _openModalN = openModal;
openModal = function (title, tabs, start, opts) { const r = _openModalN(title, tabs, start, opts); if ((title === 'Hollowmere Farm' || title === 'Who are you?') && MODAL && !(typeof SANDBOX !== 'undefined' && SANDBOX)) { const cb = MODAL.opts.onClose; MODAL.opts.onClose = () => { if (cb) cb(); saveGame(); }; } return r; };
// the character creator has no gold counter or close button
const _openModalC = openModal;
openModal = function (title, tabs, start, opts) { const r = _openModalC(title, tabs, start, opts); const creator = title === 'Who are you?'; for (const id of ['mgold', 'mclose']) { const e = document.getElementById(id); if (e) e.style.visibility = creator ? 'hidden' : ''; } return r; };
// a new game isn't saved until the character exists and the letter is read (no empty slots from backing out)
const _startGameNS = startGame;
startGame = function (isNew) { if (!isNew) return _startGameNS(isNew); const sg = saveGame; saveGame = () => true; try { return _startGameNS(isNew); } finally { saveGame = sg; } };
// the sandbox starts with full health and energy
const _setupSandboxF = setupSandbox;
setupSandbox = function () { _setupSandboxF(); recalc(); S.p.hp = maxHP(); S.p.st = maxST(); hudKey = ''; };
