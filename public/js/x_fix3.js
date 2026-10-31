/* ================= Playtest 3 fixes (docs/playtest/PLAYTEST_3.md) ================= */

/* ---------- 1 visibility ---------- */
// enemies keep a wider ring around you; villagers step aside instead of standing inside you
const _separateF3 = separate;
separate = function (m, dt) {
  _separateF3(m, dt);
  for (const e of m.ents) { if (e.type !== 'enemy' || e.dead) continue; const E = EN[e.k], dx = e.x - S.p.x, dy = e.y - S.p.y, d = Math.hypot(dx, dy) || .01, ring = E.r + (E.boss ? 14 : 11); if (d < ring) nudge(m, e, dx / d * (ring - d) * .5, dy / d * (ring - d) * .5); }
};
const _updateF3a = update;
update = function (dt) {
  _updateF3a(dt);
  if (PAUSED || TITLE || !cur) return;
  for (const n of cur.npcs || []) { const dx = n.x - S.p.x, dy = n.y - S.p.y, d = Math.hypot(dx, dy) || .01; if (d < 11) { n.x += dx / d * (11 - d) * .3; n.y += dy / d * (11 - d) * .3; } }
  if (S.p.shieldT > 0) S.p.shieldT -= dt;
};
// the see-through player also shows behind roofs and villagers
const _playerCoveredF3 = playerCovered;
playerCovered = function () {
  if (_playerCoveredF3()) return true;
  for (const b of cur.bld || []) if (S.p.x > b.x * 16 - 4 && S.p.x < (b.x + b.w) * 16 + 4 && S.p.y < (b.y + b.h) * 16 && S.p.y > b.y * 16 - 8) return true;
  return (cur.npcs || []).some(n => Math.abs(n.x - S.p.x) < 12 && n.y > S.p.y && n.y - S.p.y < 30);
};
// after losing a life: a visible shield while you're invulnerable
const _faintF3 = faint;
faint = function (msg) { const lives = S.lives; _faintF3(msg); if (S.lives < lives) S.p.shieldT = 2; };
const _pcCursorDrawF3 = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawF3(m);
  if (TITLE || !S || !(S.p.shieldT > 0)) return;
  const k = S.p.shieldT / 2; g.save(); g.globalAlpha = .25 + .25 * Math.sin(gameT * 12) * k + .2 * k; g.strokeStyle = '#ffe8a0'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(S.p.x, S.p.y - 14, 13, 18, 0, 0, 6.283); g.stroke(); g.fillStyle = 'rgba(255,240,180,.12)'; g.fill(); g.restore();
};

/* ---------- 2 click rules ---------- */
// clicking a building's wall or roof means its door
const _clickTargetF3 = clickTarget;
clickTarget = function () {
  const [tx, ty] = _clickTargetF3(); if (!cur) return [tx, ty];
  for (const b of cur.bld || []) if (b.act && tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return [b.door.x, b.door.y];
  return [tx, ty];
};
// a weapon in hand: clicking open ground with no enemy around walks you there
const _primaryUseF3 = primaryUse;
primaryUse = function () {
  if (!PAUSED && !TITLE && !fishing && S && cur) {
    const k = selKind(), [tx, ty] = clickTarget();
    if (k === 'weapon' && typeof ACTION === 'function' && ACTION()) {
      const [wx, wy] = mouseWorld(), onEnemy = enemyAt(wx, wy), ranged = typeof PS !== 'undefined' && (PS.wt === 'bow' || PS.wt === 'staff'), far = Math.hypot(wx - S.p.x, wy - S.p.y) > 140, near = cur.ents.some(e => e.type === 'enemy' && !e.dead && Math.hypot(e.x - S.p.x, e.y - S.p.y) < 200); // round 3: walking on far clicks made aimed swings drift, so a foe within 200 px means you attack
      if (!onEnemy && !near && !inReach(tx, ty)) { walkTo(tx, ty, hasTarget(tx, ty) ? 'use' : null); return; }
    }
    if (!k) { if (!inReach(tx, ty)) walkTo(tx, ty, hasTarget(tx, ty) ? 'interact' : null); return; } // an empty slot never opens the satchel
  }
  return _primaryUseF3();
};
// clicking somewhere you can't reach: a small red cross where you clicked
let NOPATH = null;
const _walkToF3 = walkTo;
walkTo = function (tx, ty, then) { const r = _walkToF3(tx, ty, then); if (r === false) NOPATH = { x: tx, y: ty, t: .6 }; return r; };
const _pcCursorDrawNP = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawNP(m);
  if (NOPATH && NOPATH.t > 0) { NOPATH.t -= 1 / 60; const x = NOPATH.x * 16 + 8, y = NOPATH.y * 16 + 8; g.save(); g.globalAlpha = Math.min(1, NOPATH.t * 3); g.strokeStyle = '#e8402a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y - 4); g.lineTo(x + 4, y + 4); g.moveTo(x + 4, y - 4); g.lineTo(x - 4, y + 4); g.stroke(); g.restore(); }
};
// getting out of something solid only allows moves that don't push you further in (no walking onto water)
const _moveEntF3 = moveEnt;
moveEnt = function (m, e, dx, dy, hw) {
  if (e === S.p && !boxFree(m, e.x, e.y, hw)) {
    const bad = (x, y) => [[-hw, -4], [hw, -4], [-hw, 1], [hw, 1]].filter(([ox, oy]) => solidAt(m, x + ox, y + oy)).length;
    if (bad(e.x + dx, e.y + dy) <= bad(e.x, e.y)) { e.x += dx; e.y += dy; return true; }
    return false;
  }
  return _moveEntF3(m, e, dx, dy, hw);
};

/* ---------- 3 terrain: no 1-tile pockets, no trees plugging a gap ---------- */
const CLIFF = new Set(['r', 'x', 'mo']);
function openPockets(m) {
  for (let pass = 0; pass < 2; pass++) for (let y = 2; y < m.h - 2; y++) for (let x = 2; x < m.w - 2; x++) {
    const t = getT(m, x, y); if (TER[t].solid || m.solidB[y * m.w + x]) continue;
    const N = [[1, 0], [-1, 0], [0, 1], [0, -1]], walls = N.filter(([dx, dy]) => CLIFF.has(getT(m, x + dx, y + dy)));
    if (walls.length >= 3) { const [dx, dy] = walls[Math.floor((x * 7 + y) % walls.length)]; setT(m, x + dx, y + dy, t); }
    const o = getO(m, x, y);
    if (o && (o.k === 'tree' || o.k === 'bush' || o.k === 'boulder' || o.k === 'rock') && ((CLIFF.has(getT(m, x - 1, y)) && CLIFF.has(getT(m, x + 1, y))) || (CLIFF.has(getT(m, x, y - 1)) && CLIFF.has(getT(m, x, y + 1))))) { const [ax, ay] = mainOf(m, x, y); delObj(m, ax, ay); }
  }
  return m;
}
const _genWildsF3 = genWilds;
genWilds = function () { return openPockets(_genWildsF3()); };
const _genRegionF3 = genRegion;
genRegion = function (id) { return openPockets(_genRegionF3(id)); };

/* ---------- 4 crates: search, names on hover, a grid that doesn't shift, take 1 / 10 / all ---------- */
openCrate = function (o) {
  o.inv = o.inv || {}; let order = null, q = '';
  const take = (k, n) => { const [id, ql] = parseK(k); n = Math.min(n, o.inv[k] || 0); if (!n) return; GIVE_NO_DROP = true; const left = give(id, n, ql, true); GIVE_NO_DROP = false; o.inv[k] -= n - left; if (o.inv[k] <= 0) delete o.inv[k]; if (left) toast('Your backpack is full.', 'bad'); SFX.pop(); refresh(); };
  openModal('Crate', [{ id: 'c', label: 'Crate', render: b => {
    if (!order) order = Object.keys(o.inv).sort((a, c) => { const A = IT[parseK(a)[0]], B = IT[parseK(c)[0]]; return (TORD.indexOf(A.t) - TORD.indexOf(B.t)) || A.n.localeCompare(B.n); });
    for (const k in o.inv) if (!order.includes(k)) order.push(k);
    const inp = el('input', { type: 'search', placeholder: 'Search the crate…', value: q }); inp.style.cssText = 'width:200px;padding:3px 8px';
    inp.oninput = () => { q = inp.value; const p = inp.selectionStart; refresh(); const n = document.querySelector('#modal input[type=search]'); if (n) { n.focus(); n.setSelectionRange(p, p); } };
    b.append(el('div', { class: 'acts wrap' }, inp, el('small', { class: 'note' }, 'Click: take 10 · right click: take 1 · Shift+click: take all')));
    const grid = el('div', { class: 'grid' }), ql = q.toLowerCase();
    for (const k of order) {
      const [id, qq] = parseK(k), it = IT[id]; if (!it || (ql && !it.n.toLowerCase().includes(ql))) continue;
      const n = o.inv[k] || 0, c = el('button', { class: 'cell f-slot' + (n ? '' : ' dim') }, icon(id, 40, qq), el('b', null, n));
      c.addEventListener('mouseenter', () => showTip(c, id)); c.addEventListener('mouseleave', hideTip);
      c.addEventListener('click', e => take(k, e.shiftKey ? Infinity : 10)); c.addEventListener('contextmenu', e => { e.preventDefault(); take(k, 1); });
      grid.append(c);
    }
    b.append(el('h3', null, 'In the crate'), grid.children.length ? grid : el('p', { class: 'note' }, ql ? 'Nothing matches.' : 'Empty'));
    b.append(el('h3', null, 'Your backpack (click to store)'), packPicker(null, (i, s) => { o.inv[s.k] = (o.inv[s.k] || 0) + s.n; S.pack[i] = null; touched(); refresh(); }));
  } }]);
};

/* ---------- 5 quests ---------- */
// tracking: a "find pages" step points at the nearest page you haven't picked up; people are pointed at where they stand
const _stepWhereF3 = stepWhere;
stepWhere = function (sid, st) {
  const hint = typeof st.hint === 'function' ? st.hint() : st.hint || '';
  if (/journal pages/i.test(hint) && MAPS.wilds) {
    const m = MAPS.wilds; let best = null, bd = 1e9; const px = cur === m ? S.p.x / 16 : 60, py = cur === m ? S.p.y / 16 : 146;
    for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o || o.k !== 'page' || (S.pages && S.pages[o.id])) continue; const x = i % m.w, y = (i / m.w) | 0, d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; best = { map: 'wilds', x, y }; } }
    if (best) return best;
  }
  if (st.who) for (const id of ['village', 'farm']) { const n = (MAPS[id] && MAPS[id].npcs || []).find(n => n.id === st.who && !n.home); if (n) return { map: id, x: Math.floor(n.x / 16), y: Math.floor(n.y / 16) }; }
  return _stepWhereF3(sid, st);
};
// a bigger arrow at your feet, and it points to the right exit when the target is on another map
function exitToward(m, map) {
  const W = m.warps || []; let w = W.find(x => x.to === map);
  if (!w && typeof REGIONS !== 'undefined' && (REGIONS[map] || (map || '').startsWith('dg_'))) w = W.find(x => x.to === 'wilds');
  if (!w) w = W.find(x => x.to === 'farm' || x.to === 'village' || x.to === 'wilds') || W[0];
  return w ? { x: w.x + w.w / 2, y: w.y + w.h / 2 } : null;
}
const _pcCursorDrawTrack = pcCursorDraw, TRK = {};
pcCursorDraw = function (m) {
  _pcCursorDrawTrack(m);
  const w = typeof trackTarget === 'function' && trackTarget(); if (!w || TITLE) return;
  let tx, ty; if (w.map === m.id) { tx = (w.x + .5) * 16; ty = (w.y + .5) * 16; } else { const e = exitToward(m, w.map); if (!e) return; tx = e.x * 16; ty = e.y * 16; }
  // on the same map the arrow follows the walking route, not a straight line through walls (playtest: it pointed into Briarholt's curtain wall)
  let ax = tx, ay = ty;
  if (typeof findPath === 'function') { // also toward an exit; targets are usually solid (a person, a door, the tree border), so aim for a free tile beside them (round 5)
    const key = m.id + ':' + Math.floor(tx / 16) + ',' + Math.floor(ty / 16), now = performance.now();
    if (TRK.key !== key || now - (TRK.at || 0) > 900) {
      TRK.key = key; TRK.at = now; TRK.pt = null; const gx = Math.floor(tx / 16), gy = Math.floor(ty / 16), sx = Math.floor(S.p.x / 16), sy = Math.floor((S.p.y - 2) / 16);
      for (const [ox, oy] of [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0], [0, 2], [0, -2], [2, 0], [-2, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const X = gx + ox, Y = gy + oy; if (!inb(m, X, Y) || solidAt(m, (X + .5) * 16, (Y + .5) * 16)) continue;
        const p = findPath(m, sx, sy, X, Y, 6000); if (p) { TRK.pt = p.length > 6 ? p[Math.min(p.length - 1, 5)] : null; break; }
      }
    }
    if (TRK.pt) { ax = (TRK.pt[0] + .5) * 16; ay = (TRK.pt[1] + .5) * 16; }
  }
  const dx = ax - S.p.x, dy = ay - S.p.y, dd = Math.hypot(tx - S.p.x, ty - S.p.y); if (dd < 60) return;
  // above your head, clear of the body: an arrow that turns smoothly, with the distance and the target's name
  const want = Math.atan2(dy, dx); TRK.a = TRK.a === undefined ? want : TRK.a + Math.atan2(Math.sin(want - TRK.a), Math.cos(want - TRK.a)) * .12;
  const a = TRK.a, cx = Math.round(S.p.x), cy = Math.round(S.p.y - 48);
  // the name and distance show for 4 s when the target changes and while you stand still, so they don't sit over signs and titles as you walk (playtest night)
  const now2 = performance.now(), tk = (S.story.track || '') + w.map + w.x + ',' + w.y; if (TRK.tk !== tk) { TRK.tk = tk; TRK.shown = now2; }
  if (TRK.px !== S.p.x || TRK.py !== S.p.y) { TRK.px = S.p.x; TRK.py = S.p.y; TRK.still = now2; }
  const showLbl = now2 - TRK.shown < 4000 || now2 - TRK.still > 900;
  if (showLbl && w.map === m.id) { const sid = S.story.track, st = stepOf(sid), W = st && st.who && (NPCS[st.who] || (typeof SCAST !== 'undefined' && SCAST[st.who])), who = W ? W.n : st && st.t === 'use' ? 'Search here' : st && st.t === 'go' && typeof placeName === 'function' ? placeName(w.map) : STORIES[sid].n;
    g.save(); g.font = '600 6px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2; g.strokeStyle = '#2a1c18'; const t = who + ' · ' + Math.round(dd / 16) + ' m'; g.strokeText(t, cx, cy - 9); g.fillStyle = '#ffe08a'; g.fillText(t, cx, cy - 9); g.restore(); }
  g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = '#2a1c18'; g.beginPath(); g.moveTo(8, 0); g.lineTo(-5, -6); g.lineTo(-2, 0); g.lineTo(-5, 6); g.closePath(); g.fill();
  g.fillStyle = '#ffd040'; g.beginPath(); g.moveTo(6, 0); g.lineTo(-4, -4.5); g.lineTo(-1.5, 0); g.lineTo(-4, 4.5); g.closePath(); g.fill(); g.restore();
  if (showLbl && w.map !== m.id) { g.save(); g.font = '600 7px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2; g.strokeStyle = '#2a1c18'; const t = (m.indoor || /^in_/.test(m.id)) && (m.warps || []).some(x => x.to === w.map) ? 'Go outside' : 'to ' + (typeof placeName === 'function' ? placeName(w.map) : w.map); g.strokeText(t, cx, cy - 9); g.fillStyle = '#ffe08a'; g.fillText(t, cx, cy - 9); g.restore(); }
};
// the journal says when each story begins; new stories are announced in the morning report
const STORY_WHEN = { hollow: 'on your second morning', lanterns: 'on day 3', smugglers: 'on day 4', ashcombe: 'on day 5', pilgrims: 'on day 6, or as soon as you find an ember shard' };
const _renderQuestsF3 = renderQuests;
renderQuests = function (b) {
  _renderQuestsF3(b);
  for (const row of b.querySelectorAll('.rrow.done')) { const t = row.querySelector('small'); if (!t || t.textContent !== 'Not begun yet.') continue; const n = row.querySelector('b').textContent, sid = Object.keys(STORIES).find(k => STORIES[k].n === n); if (sid && STORY_WHEN[sid]) t.textContent = 'Begins ' + STORY_WHEN[sid] + '. ' + (STORIES[sid].how || ''); }
};
const _showDayReportF3 = showDayReport;
showDayReport = function (lines) {
  const extra = [];
  if (S.story && S.story.q) for (const sid in S.story.q) { const q = S.story.q[sid]; if (q && !q.announced) { q.announced = 1; extra.push(['star', 'New story: ' + STORIES[sid].n + '. ' + (STORIES[sid].how || '') + ' (Quests, J)']); } }
  return _showDayReportF3(lines.concat(extra));
};
// Enter presses the window's main button (the arrival letter, the morning report)
addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !MODAL || (e.target && /input|textarea|select/i.test(e.target.tagName)) || (typeof DIALOG !== 'undefined' && DIALOG)) return;
  const btn = document.querySelector('#modal .btn.big'); if (btn) { e.preventDefault(); btn.click(); }
});

/* ---------- 6 farming ---------- */
// the getting-started steps stay ticked once done
{
  const steps = START_STEPS.map(s => s[1]);
  START_STEPS.forEach((s, i) => { s[1] = () => { S.flags = S.flags || {}; if (S.flags['gs' + i]) return true; let ok = false; try { ok = !!steps[i](); } catch (e) {} if (ok) S.flags['gs' + i] = 1; return ok; }; });
}
// crop info: in the shop rows and when you point at a crop
const _buyRowF3 = buyRow;
buyRow = function (id, price, label, cb, sub) {
  const it = IT[id], C = it && it.crop && CROPS[it.crop];
  if (C && !sub) sub = 'Grows in ' + C.d + ' days in ' + C.s.map(s => ['spring', 'summer', 'autumn', 'winter'][s]).join(', ') + (C.re ? ', then every ' + C.re + ' days' : '') + (C.as ? '. Gives ' + IT[C.as[0]].n.toLowerCase() : IT[it.crop] ? '. Sells for about ' + sellPrice(it.crop) + 'g' : '') + '.';
  return _buyRowF3(id, price, label, cb, sub);
};
const _pcCursorDrawCrop = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawCrop(m);
  if (TITLE || PAUSED || !MOUSE.in || !m || !m.soil) return;
  const [tx, ty] = mouseTile(), s = m.soil[ty * m.w + tx]; if (!s || !s.crop) return;
  const C = CROPS[s.crop.k]; if (!C) return;
  const t = C.n + ' · ' + (s.crop.dead ? 'dead' : s.crop.age >= C.d ? 'ready!' : 'day ' + Math.min(C.d, s.crop.age) + '/' + C.d) + (s.wet ? ' · watered' : s.crop.age < C.d ? ' · needs water' : '');
  g.save(); g.font = '600 6px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2; g.strokeStyle = 'rgba(42,28,24,.95)'; g.strokeText(t, (tx + .5) * 16, ty * 16 + 23); g.fillStyle = s.wet || s.crop.age >= C.d ? '#e8f4d8' : '#ffd0a0'; g.fillText(t, (tx + .5) * 16, ty * 16 + 23); g.restore();
};
// economy: a cheap Well plan (water near your field, and the first building to learn on), no free money from the starting food or hafts
I('trail_bread', 'Trail Bread', 'food', 8, 'bread', '#c8944a', null, { eat: [25, 55], desc: 'Dry but filling. Your starting food' });
if (BP.well) { BP.well.gold = 250; BP.well.cost = { stone: 30, wood: 10 }; if (typeof BP_GOLD !== 'undefined') BP_GOLD.well = 250; }
if (IT.haft) IT.haft.p = 8; if (IT.grip) IT.grip.p = Math.min(IT.grip.p, 8);
if (ANIMAL.goat) ANIMAL.goat.price = 1200;
const _newStateF3 = newState;
newState = function (seed) { const o = _newStateF3(seed); if (o.inv && o.inv.bread) { o.inv.trail_bread = (o.inv.trail_bread || 0) + o.inv.bread; delete o.inv.bread; } return o; };
// a signpost where the paddock road ends, and a few weeds, stones and twigs near the tent on a new farm
const _genFarmF3 = genFarm;
genFarm = function () {
  const m = _genFarmF3();
  if (typeof signAt === 'function') signAt(m, 31, 8, 'The road east ends at the paddock. To the village: take the lower road, south of the fence.');
  S.flags = S.flags || {};
  if (!S.flags.tentDebris && S.freshFarm) { S.flags.tentDebris = 1; const R2 = rng(S.seed + 77);
    for (let k = 0; k < 40; k++) { const x = 3 + Math.floor(R2() * 22), y = 11 + Math.floor(R2() * 7); if (getT(m, x, y) !== 'g' || getO(m, x, y) || m.solidB[y * m.w + x] || (Math.abs(x - 10) < 3 && y < 12)) continue; setO(m, x, y, R2() < .45 ? { k: 'weed' } : R2() < .6 ? { k: 'stone' } : R2() < .8 ? { k: 'twig' } : { k: 'tgrass' }); } }
  return m;
};

/* ---------- 7 building and animals ---------- */
// building sites take materials from the bank too
const _openSiteF3 = openSite;
openSite = function (b) {
  const s = b.struct, B = BP[s.k];
  if (S.bank) for (const [i, n] of Object.entries(B.cost)) { const need = n - (s.delivered[i] || 0); if (need <= 0) continue; const fromBag = Math.min(cnt(i), need), fromBank = Math.min(S.bank[i] || 0, need - fromBag); if (fromBank > 0) { S.bank[i] -= fromBank; if (S.bank[i] <= 0) delete S.bank[i]; s.delivered[i] = (s.delivered[i] || 0) + fromBank; toast('Took ' + fromBank + ' ' + IT[i].n.toLowerCase() + ' from your storage.'); } }
  return _openSiteF3(b);
};
// a used-up blueprint leaves the hotbar; blueprints get a Place button in the bag
const _hudTickF3 = hudTick;
hudTick = function (dt) { _hudTickF3(dt); if (!S || TITLE) return; for (let i = 0; i < S.hot.length; i++) { const k = S.hot[i]; if (k && IT[k] && IT[k].t === 'blueprint' && !cnt(k)) { S.hot[i] = null; hudKey = ''; } } };
const _renderBagF3 = renderBag;
renderBag = function (b) {
  _renderBagF3(b);
  const sel = MODAL.opts.sel, s = sel !== null && sel !== undefined && S.pack[sel]; if (!s) return;
  const id = parseK(s.k)[0]; if (IT[id].t !== 'blueprint') return;
  const acts = b.querySelector('.detail .acts'); if (acts) acts.prepend(el('button', { class: 'btn', on: () => { closeModal(); useItem(id); } }, 'Place'));
};

/* ---------- 8 combat tuning and HUD ---------- */
// enemies of the first areas hit softer (a new player with a wooden sword should survive a slime group)
{ const early = new Set(); for (const b of ['meadow', 'forest']) { const T = BIOME_EN[b]; if (T) for (const [k] of (T.day || []).concat(T.night || [])) early.add(k); }
  for (const k of early) if (EN[k] && !EN[k].boss) EN[k].atk = Math.max(1, Math.round(EN[k].atk * .6)); }
// the skill screen says which loadout you are editing
const _renderCSkillsF3 = renderCSkills;
renderCSkills = function (b) {
  _renderCSkillsF3(b);
  const g2 = typeof wgroup === 'function' ? wgroup() : 'melee', n = { melee: 'melee weapon', bow: 'bow', staff: 'staff' }[g2];
  b.prepend(el('p', { class: 'note', style: 'font-weight:600' }, 'Editing the Z / X / C loadout for your ' + n + ' (' + (IT[S.eq.weapon] ? IT[S.eq.weapon].n : 'none') + '). Each weapon type keeps its own loadout; skills from another tree do not work with it.'));
};

/* ---------- 9 text ---------- */
for (const k in IT) { const it = IT[k]; if (typeof it.desc === 'string') it.desc = it.desc.replace(/\.\s*$/, ''); }
