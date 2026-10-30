/* Playtest 4 fixes (docs/playtest/PLAYTEST_4.md), in the report's order.
   1 critical: no placing from an empty hotbar slot, animals you can find
   2 clicks and input
   3 getting stuck and seeing things
   4 the clock stops in windows
   5 combat test and balance
   6 stories, the tracker, villagers
   7 canoe and fishing
   8 art and UI (see also pc.css) */

/* ---------- 1 critical ---------- */
// an implement is only set down when you still have one (the dupe came from a hotbar slot at 0)
useItem = (f => function (id) {
  const it = IT[id];
  if (it && it.t === 'implement' && !has(id)) { S.hot[S.sel] = null; hudKey = ''; toast('You have no ' + it.n.toLowerCase() + ' left.'); return; }
  return f(id);
})(useItem);
// hotbar slots let go of items you no longer have
EVT.on('tick', () => {
  if (!S || !S.hot || TITLE) return;
  for (let i = 0; i < S.hot.length; i++) { const k = S.hot[i]; if (k && !isTool(k) && IT[k] && !has(k)) { S.hot[i] = null; hudKey = ''; } }
});
// a store-bought pair is a breeding pair
function balanceSex(a) {
  const same = S.animals.filter(o => o !== a && o.sp === a.sp);
  if (same.length && same.every(o => o.sex === same[0].sex)) a.sex = same[0].sex === 'F' ? 'M' : 'F';
}
// animals show inside their own building too, standing around the floor
const ROOM_SPOT = new WeakMap();
function animalsOn(m) {
  if (m.id === 'farm') return S.animals;
  const h = (m.id || '').startsWith('in_') && m.id.slice(3);
  if (!h || !['coop', 'barn', 'stable'].includes(h)) return [];
  const out = [], list = S.animals.filter(a => ANIMAL[a.sp].house === h && !(S.mounted && a.id === S.rideId));
  for (const a of list) {
    let p = ROOM_SPOT.get(a);
    if (!p || p.m !== m) {
      let x = 0, y = 0;
      for (let t = 0; t < 60; t++) { x = 1 + ri(0, m.w - 3); y = 4 + ri(0, m.h - 6); if (passable(m, x, y) && !getO(m, x, y)) break; }
      p = Object.create(a); p.m = m; p.x = (x + .5) * 16; p.y = (y + .85) * 16; p.vx = p.vy = 0; p.dir = Math.random() < .5 ? 1 : -1; ROOM_SPOT.set(a, p);
    }
    out.push(p);
  }
  return out;
}
// in the room, petting works on the animal you face
findInteract = (f => function () {
  const r = f(); if (r || !cur || !(cur.id || '').startsWith('in_')) return r;
  const [fx, fy] = facePt();
  for (const p of animalsOn(cur)) if (dist(p.x, p.y - 8, fx, fy) < 16) { const a = Object.getPrototypeOf(p); return { label: a.pet ? 'Info' : 'Pet', fn: () => petAnimal(a) }; }
  return null;
})(findInteract);
// the sandbox pasture is mown, so chickens aren't lost in the grass
if (typeof setupSandbox === 'function') setupSandbox = (f => function () {
  f(); const m = MAPS.farm, P = m.pasture;
  for (let y = Math.floor(P.y0 / 16); y <= Math.floor(P.y1 / 16); y++) for (let x = Math.floor(P.x0 / 16); x <= Math.floor(P.x1 / 16); x++) { const o = getO(m, x, y); if (o && (o.k === 'tgrass' || o.k === 'weed' || o.k === 'grass')) delObj(m, x, y); }
  CHUNK.clear();
})(setupSandbox);
// the Animals tab says how hearts and breeding work
renderAnimals = (f => function (b) {
  f(b);
  if (MODAL.opts.breedA || !S.animals.length) return;
  b.prepend(el('p', { class: 'note' }, 'Your animals graze in the pasture north-east of the tent and sleep in their building. Pet each one once a day (right click) for hearts; breeding needs 2 ♥, a grown pair of opposite sexes and room in the building.'));
})(renderAnimals);

/* ---------- 2 clicks and input ---------- */
let CLICK_T = 0, INPUT_GAP = 0;
addEventListener('mousedown', e => {
  if (performance.now() < INPUT_GAP && e.target === cv) { e.stopImmediatePropagation(); e.preventDefault(); return; }
  CLICK_T = performance.now();
}, true);
// a key held over from a minigame (Space, E) doesn't reach the world as it closes
fgClose = (f => function () { f(); INPUT_GAP = performance.now() + 350; })(fgClose);
addEventListener('keydown', e => {
  if (performance.now() < INPUT_GAP && !MODAL) { e.stopImmediatePropagation(); e.preventDefault(); return; }
  // Esc in a search box closes the window like anywhere else
  if (e.key === 'Escape' && e.target && /input|textarea/i.test(e.target.tagName) && MODAL) { e.target.blur(); closeModal(); e.preventDefault(); }
}, true);
// the recipe search takes your typing straight away, so letters don't fire hotkeys
drawModal = (f => function () {
  const r = f.apply(this, arguments);
  if (MODAL && MODAL.cur === 'craft' && (MODAL.opts.station || (typeof CRAFT_AT !== 'undefined' && CRAFT_AT)) && !MODAL.opts._focused) {
    const inp = document.querySelector('#modal input[type=search]'); if (inp) { MODAL.opts._focused = 1; setTimeout(() => inp.focus({ preventScroll: true }), 0); }
  }
  return r;
})(drawModal);

// tall things are clickable over their whole picture, not just the tile at their foot
const _clickTargetF5 = clickTarget;
clickTarget = function () {
  const [tx, ty] = _clickTargetF5(); const m = cur; if (!m || !S) return [tx, ty];
  const [wx, wy] = mouseWorld(), fresh = performance.now() - CLICK_T < 20;
  // a villager you click stops and waits for you
  for (const n of m.npcs || []) if (Math.abs(n.x - wx) < 9 && wy < n.y + 3 && wy > n.y - 32) {
    if (fresh) n.waitT = 6;
    // in a shop, the keeper is reached across the counter
    if ((m.id || '').startsWith('in_')) { const c = counterNear(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16)); if (c) return c; }
    return [Math.floor(n.x / 16), Math.floor((n.y - 2) / 16)];
  }
  if (inb(m, tx, ty) && !m.o[ty * m.w + tx] && !m.soil[ty * m.w + tx]) {
    for (let dy = 1; dy <= 3; dy++) {
      const y = ty + dy; if (!inb(m, tx, y)) break; const [ax, ay, o] = mainOf(m, tx, y); if (!o) continue;
      const spr = objSprite(o, S.season), D = OBJ[o.k] || {};
      if (spr && spr.wh && (y + 1) * 16 - spr.wh <= wy && (D.solid || o.k === 'board' || D.tall)) return [ax, ay];
      break;
    }
  }
  return [tx, ty];
};
function counterNear(m, x, y) {
  for (let dy = 0; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const [, , o] = mainOf(m, x + dx, y + dy); if (o && /counter|bar/.test(o.k)) return [x + dx, y + dy]; }
  return null;
}
npcWalk = (f => function (dt) {
  const v = MAPS.village, held = [];
  if (v && v.npcs) for (const n of v.npcs) if (n.waitT > 0) {
    n.waitT -= dt; held.push([n, n.path]); n.path = null; n.walk = false;
    if (S && cur === v) { const dx = S.p.x - n.x, dy = S.p.y - n.y; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); }
  }
  f(dt);
  for (const [n, p] of held) n.path = p;
})(npcWalk);
const openAt = (act, t) => { const H = HOURS[act]; return !H || (H[1] > 1440 ? (t >= H[0] || t < H[1] - 1440) : (t >= H[0] && t < H[1])); };
// keepers leave the counter when the shop closes, even if you're inside
EVT.on('tick', () => {
  if (!cur || !(cur.id || '').startsWith('in_') || !cur.npcs || !cur.npcs.length) return;
  const act = cur.id.slice(3); if (!HOURS[act] || openAt(act, S.time)) return;
  const n = cur.npcs.length; cur.npcs = cur.npcs.filter(p => !(NPCS[p.id] && NPCS[p.id].shop === act));
  if (cur.npcs.length < n) toast('The shop is closing for the day.');
});
// the farm notice board shows the day's news
objInteract = (f => function (m, x, y, o) {
  if (o.k === 'board' && o.farmboard) return { label: 'Notices', fn: farmNotices };
  return f(m, x, y, o);
})(objInteract);
function farmNotices() {
  openModal('Farm notices', [{ id: 'n', label: 'Today', render: b => {
    const W = { sun: 'Clear skies', rain: 'Rain: the crops water themselves', storm: 'Storms', snow: 'Snow', wind: 'Windy' };
    const lines = [SEASONS[S.season] + ' ' + S.day + '. ' + (W[S.weather] || 'Fair weather') + '.'];
    const F = typeof FEST !== 'undefined' && FEST[S.season]; if (F && F.day >= S.day) lines.push(F.n + (F.day === S.day ? ' is today in the village.' : ' in ' + (F.day - S.day) + ' days.'));
    if (typeof BDAY !== 'undefined') for (const id in BDAY) { const [s, d] = BDAY[id]; if (s === S.season && d >= S.day && d - S.day <= 7) lines.push(NPCS[id].n + "'s birthday " + (d === S.day ? 'is today.' : 'is on day ' + d + '.')); }
    if (S.board && !S.board.done) lines.push('The village board wants ' + S.board.n + ' ' + IT[S.board.id].n + ' for ' + S.board.rew + 'g.');
    for (const l of lines) b.append(el('p', null, l));
    const left = S.animals.filter(a => !a.pet).length; if (left) b.append(el('p', { class: 'note' }, left + (left > 1 ? ' animals haven\'t' : ' animal hasn\'t') + ' been petted today.'));
  } }]);
  const p = document.querySelector('#modal'); if (p) p.classList.add('small');
}
// clicking far ground with the hoe, the can, a seed or fertiliser walks there and uses it;
// clicking far water with the can or rod walks to the nearest shore
const WALK_USE = new Set(['hoe', 'can', 'rod']);
const _primaryUseF5 = primaryUse;
primaryUse = function () {
  if (!PAUSED && !TITLE && !fishing && S && cur && !(typeof PLACING !== 'undefined' && PLACING)) {
    const k = selKind(), it = k && IT[k], [tx, ty] = clickTarget();
    if ((WALK_USE.has(k) || (it && (it.t === 'seed' || it.t === 'fert'))) && inb(cur, tx, ty) && !inReach(tx, ty)) {
      const T = TER[getT(cur, tx, ty)];
      if (T.water && (k === 'can' || k === 'rod')) { const w = shoreWater(cur, tx, ty); if (w) { if (inReach(w[0], w[1])) { stopWalk(); faceTileAt(w[0], w[1]); AIM = [w[0], w[1]]; try { act(); } finally { AIM = null; } } else walkTo(w[0], w[1], 'use'); return; } }
      else if (k !== 'rod' && !T.solid) { walkTo(tx, ty, 'use'); return; }
    }
  }
  return _primaryUseF5();
};
// the water tile nearest the click that has walkable land beside it
function shoreWater(m, tx, ty) {
  const [px, py] = playerTile(); let best = null, bd = 1e9;
  for (let r = 0; r <= 10; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) {
    if (Math.max(Math.abs(x - tx), Math.abs(y - ty)) !== r || !inb(m, x, y) || !TER[getT(m, x, y)].water) continue;
    if (![[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => passable(m, x + dx, y + dy))) continue;
    const d = r * 4 + Math.hypot(x - px, y - py) * .5; if (d < bd) { bd = d; best = [x, y]; }
  }
  return best;
}
// the auto tool switch leaves a watering can or rod you picked yourself alone
toolFor = (f => function (m, tx, ty) { const h = selKind(); if (h === 'can' || h === 'rod') return null; return f(m, tx, ty); })(toolFor);

/* villagers: Chat says something new and counts once a day, the gift picker is just the bag, and a street shop is shut outside its hours */
const CHAT = {
  mara: ['Strawberries sell best in late spring. Plant them early.', 'If you see Pip, tell him the flour order came in.', 'My grandmother kept this shop. The shelves still creak the same.', 'Rain tomorrow, my knee says. My knee is never wrong.'],
  brann: ['Copper first. Everyone wants to skip to iron.', 'A good edge is patience, not muscle.', 'The mine gets mean below floor ten. Bring bread.', 'Hale owes me a door hinge. Has for two years.'],
  pip: ['Bread needs salt. Folks forget the salt.', 'Come by at night, the tavern is warm and the stew is cheap.', 'Corwin tells the same fish story every week. It gets bigger.', 'I tried a pumpkin pie once. The goats ate it.'],
  odile: ['Pet them every day. They remember.', 'A gentle horse is worth more than a fast one, most days.', 'Chickens lay better with a full trough.', 'Breed the best with the best, and be patient.'],
  hale: ['Measure twice. I say it to myself, mostly.', 'Plans are cheap. Timber is not.', 'Stone paths keep the weeds off. Mostly.', 'A good roof is quiet in the rain.'],
  elias: ['The museum has room for everything you dig up.', 'Old coins turn up in the riverbank after rain.', 'The Hollow Crown is older than the village.', 'Bring me anything with writing on it.'],
  corwin: ['The fish bite at dawn and at dusk.', 'Out past the shallows, the big ones roam.', 'A trap in the river pays while you sleep.', 'Mind the tide in the Saltreach.'],
};
const _talkNPCF5 = talkNPC;
talkNPC = function (id) {
  const N = NPCS[id];
  if (N && N.shop && cur && cur.id === 'village' && HOURS[N.shop] && !openAt(N.shop, S.time)) { N._closed = 1; try { return _talkNPCF5(id); } finally { N._closed = 0; MODAL && (MODAL.opts.closedShop = N.shop); } }
  return _talkNPCF5(id);
};
drawModal = (f => function () {
  if (MODAL && MODAL.opts.giftTo && MODAL.tabs && MODAL.tabs.length > 1) { MODAL.tabs = MODAL.tabs.filter(t => t.id === 'bag'); MODAL.cur = 'bag'; } // the gift picker shows only the bag
  const r = f.apply(this, arguments);
  const box = document.querySelector('#modal'); if (!MODAL || !box || !box.classList.contains('small')) return r;
  // street chat window: a real Chat button, and the shop greyed while it's closed
  const id = Object.keys(NPCS).find(k => NPCS[k].n === MODAL.title); if (!id) return r;
  const shut = MODAL.opts.closedShop === NPCS[id].shop || (NPCS[id].shop && HOURS[NPCS[id].shop] && !openAt(NPCS[id].shop, S.time) && cur && cur.id === 'village');
  for (const btn of box.querySelectorAll('.acts button')) {
    if (btn.textContent === 'Chat') { const nb = btn.cloneNode(true); nb.addEventListener('click', () => chatWith(id)); btn.replaceWith(nb); }
    else if (shut && btn.textContent === (SHOP_WORD[NPCS[id].shop] || 'Shop')) { const nb = btn.cloneNode(true); nb.classList.add('off'); nb.addEventListener('click', () => toast(NPCS[id].n + ': "We open at ' + fmtHM(HOURS[NPCS[id].shop][0]) + '. Come back then."')); btn.replaceWith(nb); }
  }
  return r;
})(drawModal);
function chatWith(id) {
  const N = NPCS[id], f = fr(id), h = hearts(id), pool = (CHAT[id] || []).concat(N.lines ? N.lines[h >= 7 ? 2 : h >= 3 ? 1 : 0] : []);
  f.ci = ((f.ci || 0) + 1) % Math.max(1, pool.length);
  const p = document.querySelector('#modal .greet p'); if (p && pool.length) p.textContent = '"' + pool[f.ci] + '"';
  if (f.c !== dayIndex()) { f.c = dayIndex(); addFriend(id, 15); toast('A good chat with ' + N.n + ' (+15 friendship).'); }
}

/* ---------- 3 getting stuck and seeing things ---------- */
// walking into a corner, a fence gap or a tree line slides you along it (any direction, up to 9 px);
// stuck inside something (after getting off the horse) moves you to the nearest free spot
moveEnt = (f => function (m, e, dx, dy, hw) {
  if (e !== S.p || (!dx && !dy)) return f(m, e, dx, dy, hw);
  const x0 = e.x, y0 = e.y, r = f(m, e, dx, dy, hw);
  if (e.x !== x0 || e.y !== y0) { e.stuckT = 0; return r; }
  if (!boxFree(m, e.x, e.y, hw)) { e.stuckT = (e.stuckT || 0) + Math.hypot(dx, dy); if (e.stuckT > 4) { freeSpot(m, e, hw); e.stuckT = 0; } return r; }
  const d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
  for (let k = 1; k <= 9; k++) for (const s of [-1, 1]) { // try sidestepping across the way you push
    const px = -uy * s * k, py = ux * s * k;
    if (boxFree(m, e.x + px, e.y + py, hw) && boxFree(m, e.x + px + ux * 1.5, e.y + py + uy * 1.5, hw)) { const st = Math.min(d, k); f(m, e, -uy * s * st, ux * s * st, hw); return true; }
  }
  return r;
})(moveEnt);
function freeSpot(m, e, hw) {
  for (let r = 2; r <= 24; r += 2) for (let a = 0; a < 16; a++) { const x = e.x + Math.cos(a / 16 * 6.283) * r, y = e.y + Math.sin(a / 16 * 6.283) * r; if (boxFree(m, x, y, hw)) { e.x = x; e.y = y; return true; } }
  return false;
}
// riding: the plough, drill and harrow work across the way the horse moves (not where the mouse is),
// and say so when something blocks them
{
  let lastX = 0, lastY = 0, snagT = 0;
  implementTick = (f => function () {
    if (!S || !S.mounted || !S.hitch) return f();
    const vx = S.p.x - lastX, vy = S.p.y - lastY; lastX = S.p.x; lastY = S.p.y;
    if (Math.abs(vx) + Math.abs(vy) < .01) return f();
    const d = S.p.dir; S.p.dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 1 : 2) : (vy < 0 ? 3 : 0);
    try { return f(); } finally { S.p.dir = d; }
  })(implementTick);
  EVT.on('tick', () => {
    if (!S || !S.mounted || !S.hitch || !S.hitch.on || !cur || !cur.farm || !pl.moving) { snagT = 0; return; }
    const moved = Math.hypot(S.p.x - (S.p._hx || 0), S.p.y - (S.p._hy || 0)); S.p._hx = S.p.x; S.p._hy = S.p.y;
    if (moved > .5) { snagT = 0; return; }
    if (++snagT === 2) { const [tx, ty] = faceTile(), o = getO(cur, tx, ty); toast('The ' + IT[S.hitch.k].n.toLowerCase() + ' is caught' + (o ? ' on a ' + ((IT[o.k] && IT[o.k].n) || o.k).toLowerCase() : '') + '. Back up, or clear the way on foot.'); }
  });
}
// damage numbers and floating text are drawn after the night grade, so they stay bright
{
  let fxHold = null;
  render = (f => function (dt) {
    fxHold = FX; FX = [];
    try { return f(dt); } finally {
      const live = FX; FX = fxHold.concat(live); fxHold = null;
      if (!TITLE && S && cur && FX.length) {
        g.save(); g.setTransform(LAST_WT || g.getTransform()); g.textAlign = 'center'; g.lineJoin = 'round';
        for (const q of FX) { q.t -= dt; q.y -= dt * 16; g.globalAlpha = Math.min(1, q.t * 2); g.font = '600 ' + (q.big ? '11' : '8') + 'px Fredoka, sans-serif'; g.strokeStyle = 'rgba(40,26,18,.95)'; g.lineWidth = 2.4; g.strokeText(q.txt, q.x, q.y); g.fillStyle = q.c; g.fillText(q.txt, q.x, q.y); }
        g.restore(); g.globalAlpha = 1; FX = FX.filter(q => q.t > 0);
      }
    }
  })(render);
}
// the world transform, remembered from the cursor pass (which draws in world space) for the late FX pass
let LAST_WT = null;
pcCursorDraw = (f => function (m) { LAST_WT = g.getTransform(); return f(m); })(pcCursorDraw);
// the menu dock and key prompt fade when you walk underneath them at a map's edge
{
  const fade = () => {
    if (!S || TITLE || !cur) return;
    const r = cv.getBoundingClientRect(), T = LAST_WT; if (!T) return;
    const sx = (T.a * S.p.x + T.e) / (cv.width / r.width) + r.left, sy = (T.d * (S.p.y - 16) + T.f) / (cv.height / r.height) + r.top;
    for (const id of ['topr', 'iprompt']) { const n = document.getElementById(id); if (!n || n.hidden) continue; const b = n.getBoundingClientRect(), over = sx > b.left - 12 && sx < b.right + 12 && sy > b.top - 20 && sy < b.bottom + 20; n.style.opacity = over ? '.3' : ''; }
  };
  hudTick = (f => function (dt) { const r = f(dt); fade(); return r; })(hudTick);
}
// bosses can't hurt you during their grace when they first wake
hurtPlayer = (f => function (dmg, sx, sy, elem) {
  if (cur && cur.ents.some(e => e.type === 'enemy' && EN[e.k].boss && e.shield > 0 && Math.hypot(e.x - (sx || 0), e.y - (sy || 0)) < 140)) return;
  return f(dmg, sx, sy, elem);
})(hurtPlayer);

/* ---------- 4 time ---------- */
// the clock waits while you place or move a building
updateTime = (f => function (dt) { if ((typeof PLACING !== 'undefined' && PLACING) || (typeof MOVING !== 'undefined' && MOVING)) return; return f(dt); })(updateTime);
// a window closing doesn't let the same click land in the world
closeModal = (f => function () { const r = f.apply(this, arguments); INPUT_GAP = Math.max(INPUT_GAP, performance.now() + 200); return r; })(closeModal);

/* ---------- 6 stories ---------- */
// a story that begins today is in this morning's report (not a toast after it, not again tomorrow)
{
  let reporting = false;
  storyState = (f => function () {
    const T = S.story || {}, before = new Set(Object.keys(T.q || {}));
    const r = f();
    if (!reporting && cur) for (const sid in r.q) if (!before.has(sid)) r.q[sid].announced = 1; // the toast told you
    return r;
  })(storyState);
  showDayReport = (f => function (lines) {
    reporting = true; const tt = toast; toast = (msg, k) => (/^New story/.test(msg) ? null : tt(msg, k));
    try { storyState(); } finally { toast = tt; reporting = false; }
    return f(lines);
  })(showDayReport);
}

/* ---------- 5 combat test and balance ---------- */
// clicks and the wheel only reach the world when the world is what's under the mouse
primaryUse = (f => function () { const t = document.elementFromPoint(MOUSE.x, MOUSE.y); if (t && t !== cv && !TITLE) { MOUSE.down = false; return; } return f(); })(primaryUse);
addEventListener('wheel', e => { if (e.target !== cv && document.getElementById('ctpanel') && document.getElementById('ctpanel').contains(e.target)) e.stopImmediatePropagation(); }, true);
if (typeof startCombatTest === 'function') {
  startCombatTest = (f => function () {
    f();
    setTimeout(() => {
      // on dry land, with room to move
      const m = cur, onLand = () => !TER[getT(m, Math.floor(S.p.x / 16), Math.floor((S.p.y - 2) / 16))].water && boxFree(m, S.p.x, S.p.y, 5);
      for (let r = 1; r < 30 && !onLand(); r++) for (let a = 0; a < 12; a++) { const x = S.p.x + Math.cos(a / 12 * 6.283) * r * 16, y = S.p.y + Math.sin(a / 12 * 6.283) * r * 16, tx = Math.floor(x / 16), ty = Math.floor((y - 2) / 16); if (inb(m, tx, ty) && !TER[getT(m, tx, ty)].water && boxFree(m, x, y, 5)) { S.p.x = x; S.p.y = y; break; } }
      // a lighter bag: the spare armour and robes wait in the bank
      for (let i = 0; i < S.pack.length; i++) { const s = S.pack[i]; if (!s) continue; const it = IT[parseK(s.k)[0]]; if (it && (it.t === 'armor' || (it.slot && it.slot !== 'weapon'))) { S.bank[s.k] = (S.bank[s.k] || 0) + s.n; S.pack[i] = null; } }
      hudKey = '';
    }, 450);
  })(startCombatTest);
  checkQuests = (f => function () { if (window.COMBAT_TEST) return; return f(); })(checkQuests);
  showPerk = (f => function () { if (window.COMBAT_TEST) { if (S.pendingPerk) S.pendingPerk.length = 0; return; } return f(); })(showPerk);
  // packs come in from a distance; a boss arrives to one side, on screen
  spawnNear = (f => function (k, n, d, lvl) { return f(k, n, Math.max(d, 100), lvl); })(spawnNear);
  spawnEnemy = (f => function (m, k, x, y, lvl) {
    const e = f(m, k, x, y, lvl);
    if (window.COMBAT_TEST && e && EN[k] && EN[k].boss && m === cur) {
      for (const s of [1]) for (let r = 0; r < 6; r++) for (const side of [s, -s]) { // the right first: the test panel sits on the left
        const nx = S.p.x + side * (95 - r * 8), ny = S.p.y + (r % 2 ? 12 : -12); if (boxFree(m, nx, ny, 8)) { e.x = nx; e.y = ny; e.home = [nx, ny]; e.hx = nx; e.hy = ny; r = 9; break; } }
    }
    return e;
  })(spawnEnemy);
  combatPanel = (f => function () {
    f(); const p = document.getElementById('ctpanel'); if (!p) return;
    const ranged = Object.keys(EN).filter(k => EN[k].ai === 'ranged' && !EN[k].boss && ['goblin', 'archer'].includes(k));
    for (const b of p.querySelectorAll('button')) {
      if (b.textContent === 'Ranged') b.replaceWith(el('button', { class: 'btn ghost', on: () => spawnNear(pickR(ranged.length ? ranged : ['goblin']), 3, 110, 10) }, 'Ranged'));
      if (b.textContent === 'Clear') b.replaceWith(el('button', { class: 'btn ghost', on: () => {
        for (const m of [cur]) m.ents = m.ents.filter(e => e.type !== 'enemy' && e.type !== 'proj');
        if (typeof HAZ !== 'undefined') HAZ.length = 0; if (typeof VFX !== 'undefined') VFX.length = 0; if (typeof SKP !== 'undefined') SKP.length = 0; if (typeof PSHOTS !== 'undefined') PSHOTS.length = 0;
        if (typeof CORPSES !== 'undefined' && CORPSES.length) CORPSES.length = 0;
        pl.burn = 0; pl.chill = 0; pl.bleed = 0; pl.inv = 0; pl.kbx = pl.kby = 0; TARGET = null; recalc(); S.p.hp = maxHP();
        toast('Cleared.');
      } }, 'Clear'));
    }
    p.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
  })(combatPanel);
}
// the knockout flash in the combat test doesn't leave the screen red
// one hit is at most 14% of your health plus your defence (was 20%)
hurtPlayer = (f => function (dmg, sx, sy, elem) { if (S && PS) dmg = Math.min(dmg, PS.def + maxHP() * .14); return f(dmg, sx, sy, elem); })(hurtPlayer);
// Focus builds more slowly (5 a hit before the tree, was 8); each weapon type starts with its own loadout
recalc = (f => function () {
  f(); if (!S || !PS) return;
  PS.fgain = Math.max(2, (PS.fgain || 8) - 3);
  S.abilSets = S.abilSets || {};
  if (!S.abilSets.bow) S.abilSets.bow = ['volley', 'guard', 'secondwind'];
  if (!S.abilSets.staff) S.abilSets.staff = ['guard', 'secondwind', 'volley'];
  if (S.abilGroup === 'bow' && S.abil && S.abil[0] === 'cleave' && S.abil[1] === 'lunge') { S.abil = S.abilSets.bow.slice(); hudKey = ''; }
})(recalc);

// passing out is explained in the morning report
{
  let fainted = null;
  faint = (f => function (msg) {
    if (/exhaustion/.test(msg)) S.lives = 0; // lives are for fights: staying up past 2 am always ends the day (they refill in the morning)
    fainted = { msg, at: S.time, t: performance.now(), lost: Math.min(2500, Math.round(S.gold * .1)) }; return f(msg);
  })(faint);
  showDayReport = (f => function (lines) {
    if (fainted && performance.now() - fainted.t < 8000) {
      const F = fainted, hm = Math.floor(F.at / 60) % 24; fainted = null;
      lines = [['coin', (/exhaustion/.test(F.msg) ? 'You stayed up past 2 am and collapsed' : 'You were knocked out') + ' (around ' + ((hm % 12) || 12) + (hm < 12 ? ' am' : ' pm') + '). Someone carried you home' + (F.lost > 0 ? ' and took ' + F.lost.toLocaleString() + 'g for the trouble' : '') + '. Sleep in your tent before 2 am next time.']].concat(lines);
    }
    fainted = null; return f(lines);
  })(showDayReport);
}
// the tracker finds villagers inside their shop (a marker over them in the room, the door from the street)
stepWhere = (f => function (sid, st) {
  const who = st && st.who, N = who && NPCS[who];
  if (N && N.shop) {
    if (cur && cur.id === 'in_' + N.shop) { const n = (cur.npcs || []).find(p => p.id === who); if (n) return { map: cur.id, x: Math.floor(n.x / 16), y: Math.floor((n.y - 2) / 16) }; }
    const inV = MAPS.village && (MAPS.village.npcs || []).some(p => p.id === who && !p.home);
    if (!inV && typeof schedPlace === 'function' && schedPlace(who) === 'shop') { const b = (MAPS.village.bld || []).find(b => b.act === N.shop); if (b) return { map: 'village', x: b.door.x, y: b.door.y }; }
  }
  return f(sid, st);
})(stepWhere);
// the first nights in the Wilds come with a warning
EVT.on('map', id => {
  if (!S || TITLE || id !== 'wilds' || dayIndex() > 14) return;
  if ((S.time >= 1200 || S.time < 330) && S.flags) { const k = 'nightWarn' + dayIndex(); if (S.flags[k]) return; S.flags[k] = 1; toast('Night in the Wilds: stronger creatures roam until dawn. Stay near the road, or come back in daylight.', 'bad'); }
});
// the map: a Centre button, and zooming keeps your marker in view
renderMap = (f => function (b) {
  f(b);
  const box = b.querySelector('.mapbox'), c = box && box.querySelector('canvas.wmap:not(.localmap)'); if (!c || !cur) return;
  const centre = () => { const k = c.clientWidth / c.width; if (cur.id === 'wilds' || (typeof REGIONS !== 'undefined' && REGIONS[cur.id])) { box.scrollLeft = S.p.x / 16 * 3 * k - box.clientWidth / 2; box.scrollTop = S.p.y / 16 * 3 * k - box.clientHeight / 2; } };
  const acts = b.querySelector('.acts'); if (acts) acts.prepend(el('button', { class: 'btn ghost', on: centre }, 'Centre on me'));
  for (const btn of (acts ? acts.querySelectorAll('button') : [])) if (/Zoom/.test(btn.textContent)) btn.addEventListener('click', () => setTimeout(centre, 0));
})(renderMap);

/* ---------- 7 canoe and fishing ---------- */
// out on the water you're out of reach: creatures lose track of you until you come ashore
{
  const away = (f) => function (m, dt) {
    if (!S || !S.p || !S.p.boat) return f(m, dt);
    const x = S.p.x, y = S.p.y; S.p.x = -9999; S.p.y = -9999;
    try { return f(m, dt); } finally { S.p.x = x; S.p.y = y; }
  };
  updateEnemies = away(updateEnemies);
  if (typeof enemyAttackAI === 'function') enemyAttackAI = away(enemyAttackAI);
}
// climbing in and out says so
{
  let was = false, cueT = 0;
  EVT.on('tick', () => {
    if (!S || !S.p || TITLE) return; const b = !!S.p.boat;
    if (b !== was && performance.now() > cueT) { toast(b ? 'You push off in the canoe. Only fishing works on the water.' : 'You step ashore.'); cueT = performance.now() + 8000; }
    was = b;
  });
}
// in the canoe: sat lower in the hull, and a rod, line and bobber while fishing
drawPlayer = (f => function () {
  if (!S || !S.p || !S.p.boat || TITLE) return f();
  const D0 = D; let n = 0;
  D = function (img, x, y, w, h) { n++; if (n === 2 && w === 16 && h === 32) return D0(img, x, y + 3, w, h); return D0.apply(this, arguments); }; // the rider (second image) sits 3 px deeper, the gunwale hides the rest
  if (fishing) { const m0 = pl.moving; pl.moving = false; try { f(); } finally { D = D0; pl.moving = m0; } if (typeof drawFishing === 'function') drawFishing(S.p); return; }
  try { return f(); } finally { D = D0; }
})(drawPlayer);
// a rod or harpoon in the canoe acts where you click instead of paddling off to a shore
primaryUse = (f => function () {
  if (S && S.p && S.p.boat && !fishing && !PAUSED && !TITLE) { const k = selKind(); if (k === 'rod' || k === 'harpoon' || k === 'crab_trap') { stopWalk(); faceMouse(); act(); return; } }
  return f();
})(primaryUse);

// sandbox Get buttons fetch for the row they sit on (they matched rows by position, which search and chips change)
renderCraft = (f => function (b) {
  f(b);
  if (typeof SANDBOX === 'undefined' || !SANDBOX) return;
  for (const row of b.querySelectorAll('.list > .rrow')) {
    const t = (row.querySelector('.rtxt b') || {}).textContent || ''; let r = null, best = 0;
    for (const q of RC) { const n = IT[q[0]] && IT[q[0]].n; if (n && t.startsWith(n) && n.length > best) { best = n.length; r = q; } }
    if (!r) continue;
    for (const btn of row.querySelectorAll('.acts button')) {
      const k = btn.textContent === 'Get' ? 1 : btn.textContent === 'Get ×5' ? 5 : 0; if (!k) continue;
      const nb = btn.cloneNode(true); nb.addEventListener('click', () => { sandboxGet(r, k); refresh(); }); btn.replaceWith(nb);
    }
  }
})(renderCraft);

/* placement: every tile of the ghost is green or red on its own, and a refusal says why */
let PLACE_WHY = null;
function tileWhy(m, i, j, B, x, y) {
  if (i < 1 || j < 1 || i >= m.w - 1 || j >= m.h - 2) return 'Too close to the edge of the farm.';
  const idx = j * m.w + i, t = m.t[idx], o = m.o[idx];
  if (TER[t].water) return 'Not on water.';
  if (TER[t].solid) return 'Not on rock or cliffs.';
  if (m.soil[idx]) return 'Not on tilled soil.';
  if (m.solidB[idx]) return 'Another building is in the way.';
  if (o && !(j === y + B.h && !(OBJ[o.k] || {}).solid)) return j === y + B.h ? 'Keep the row in front of the door clear (a ' + (((IT[o.k] || {}).n) || o.k).toLowerCase() + ' is there).' : 'Clear the ' + (((IT[o.k] || {}).n) || o.k).toLowerCase() + ' first.';
  if (m === cur) { const x0 = S.p.x - 6, x1 = S.p.x + 6, y0 = S.p.y - 6, y1 = S.p.y + 2; if (x1 > i * 16 && x0 < (i + 1) * 16 && y1 > j * 16 && y0 < (j + 1) * 16) return 'Step out of the way first.'; }
  return null;
}
placeOk = (f => function (m, x, y, B, ignoreTent) {
  const ok = f(m, x, y, B, ignoreTent);
  if (!ok && m === cur) { PLACE_WHY = null; for (let j = y; j < y + B.h + 1 && !PLACE_WHY; j++) for (let i = x; i < x + B.w && !PLACE_WHY; i++) PLACE_WHY = tileWhy(m, i, j, B, x, y); }
  return ok;
})(placeOk);
toast = (f => function (msg, k) { if (msg === "It doesn't fit there." && PLACE_WHY) msg = "It doesn't fit there: " + PLACE_WHY.charAt(0).toLowerCase() + PLACE_WHY.slice(1); return f(msg, k); })(toast);
pcCursorDraw = (f => function (m) {
  if (typeof PLACING === 'undefined' || !PLACING || !BP[PLACING] || m.id !== 'farm' || PAUSED) return f(m);
  const B = BP[PLACING], [x, y] = placeAt(), ok = placeOk(m, x, y, B), spr = B.obj ? (PIX.get('well') || SPR.well) : buildingSpr(B.w, B.h, B.kind);
  g.globalAlpha = .6; D(spr, x * 16, y * 16, B.w * 16, B.h * 16);
  for (let j = y; j < y + B.h + 1; j++) for (let i = x; i < x + B.w; i++) { const bad = !ok && tileWhy(m, i, j, B, x, y); g.globalAlpha = bad ? .5 : .22; g.fillStyle = bad ? '#e8402a' : '#5ad85a'; g.fillRect(i * 16 + .5, j * 16 + .5, 15, 15); }
  g.globalAlpha = 1; g.strokeStyle = ok ? '#5ad85a' : '#e8402a'; g.lineWidth = 1; g.strokeRect(x * 16 + .5, y * 16 + .5, B.w * 16 - 1, (B.h + 1) * 16 - 1);
})(pcCursorDraw);
// an implement in the bag has a Set down button
renderBag = (f => function (b) {
  f(b);
  const sel = MODAL.opts.sel, s = sel !== null && sel !== undefined && S.pack[sel], id = s && parseK(s.k)[0], it = id && IT[id];
  if (!it || it.t !== 'implement') return;
  const acts = b.querySelector('.detail .acts'); if (!acts || acts.querySelector('.setdown')) return;
  acts.prepend(el('button', { class: 'btn setdown', on: () => { closeModal(); useItem(id); } }, 'Set down'));
})(renderBag);

/* ---------- 9 UI ---------- */
// short windows are small windows, not full-screen panels
const SMALL_WIN = new Set(['Home', 'A lost page', 'Request board', 'Sandbox', 'Farm notices', 'Shipping bin']);
openModal = (f => function () { const box = document.querySelector('#modal'); if (box) box.classList.remove('small'); return f.apply(this, arguments); })(openModal);
drawModal = (f => function () { const r = f.apply(this, arguments); const box = document.querySelector('#modal'); if (MODAL && box && SMALL_WIN.has(MODAL.title)) box.classList.add('small'); return r; })(drawModal);
// getting off the horse leaves it standing beside you instead of back in the pasture
toggleRide = (f => function () {
  const was = S && S.mounted, h = was && typeof rideHorse === 'function' && rideHorse(); const r = f.apply(this, arguments);
  if (was && !S.mounted && h && cur && cur.id === 'farm') { h.x = S.p.x + (S.p.lastH === 1 ? 18 : -18); h.y = S.p.y; h.vx = h.vy = 0; }
  return r;
})(toggleRide);

/* ---------- 8 art ---------- */
// the Pale Lich is its own hand-drawn sprite (art/sprites/handdrawn.py lich_f), not a doubled-up villager
if (EN.lich) { Object.assign(EN.lich, { art: 'lich', col: '#4a2a6a', eye: '#9a6aff' }); delete EN.lich.scale; delete EN.lich.P; }
// street lanterns are dark by day and lit from dusk
objSprite = (f => function (o, season) {
  if (o.k === 'lantern' && typeof darkness === 'function' && darkness() < .12 && cur && cur.outdoor) return PIX.get('lantern_off') || f(o, season);
  return f(o, season);
})(objSprite);
// mythril armour: a deeper teal so it shades instead of reading as a flat mint silhouette
for (const id in IT) if (/^mythril_/.test(id) && IT[id].t === 'armor') IT[id].c = '#2f8f88';
if (typeof GEAR_ACC !== 'undefined') GEAR_ACC.mythril = '#bff4e8';

// icons that differ: every artifact and mineral its own shape, seed packets that show their crop,
// horse implements drawn as themselves
{
  const SHAPE = { ember_idol: 'artifact', rusted_crown: 'crown', knights_seal: 'ring', dragon_tooth: 'fang', elven_brooch: 'brooch', bone_flute: 'flute', ancient_coin: 'coin', amphora: 'amphora',
    star_chart: 'map', frozen_rose: 'flower', obsidian_mask: 'mask', wyrm_shell: 'egg',
    amethyst: 'crystal', topaz: 'gem', aquamarine: 'shard', emerald: 'stepcut', ruby: 'gem', diamond: 'brilliant', prismatic: 'brilliant', cave_crystal: 'crystal', obsidian: 'shard', starmetal: 'ore' };
  let shaped = false; // the atlas isn't loaded yet when this file runs, so the shapes are set on first use
  const PACKET = { paper: '#efe2c0', shade: '#d6c49a', ink: '#5a3a22', crimp: '#c8b088' };
  itemIcon = (f => function (id) {
    if (!shaped && PIX.has('ic_gem')) { shaped = true; for (const k in SHAPE) if (IT[k] && PIX.has('ic_' + SHAPE[k])) { IT[k].sh = SHAPE[k]; delete ICACHE[k]; } }
    if (ICACHE[id]) return ICACHE[id];
    const it = IT[id];
    if (it && it.t === 'seed' && it.crop) {
      const C = CROPS[it.crop], out = C && (C.as ? C.as[0] : it.crop), crop = out && IT[out] ? f(out) : null;
      if (crop) {
        const c = mk(32, 32, x => {
          x.imageSmoothingEnabled = false;
          x.fillStyle = PACKET.ink; x.fillRect(5, 3, 22, 27);
          x.fillStyle = PACKET.paper; x.fillRect(6, 4, 20, 25); x.fillStyle = PACKET.shade; x.fillRect(23, 4, 3, 25);
          x.fillStyle = PACKET.crimp; for (let i = 6; i < 26; i += 2) x.fillRect(i, 4, 1, 2);
          x.fillStyle = typeof it.c === 'string' ? it.c : '#8ab05a'; x.fillRect(6, 25, 20, 3);   // a band in the crop's colour
          x.drawImage(crop, 0, 0, crop.width, crop.height, 8, 7, 16, 16);                         // the crop at half size, crisp
        });
        c.ww = c.wh = 16; return ICACHE[id] = c;
      }
    }
    if (it && it.t === 'implement' && PIX.has('impl_' + id + '.0')) {
      const o = PIX.get('impl_' + id + '.0'), k = Math.min(32 / o.width, 32 / o.height, 1);
      const c = mk(32, 32, x => { x.imageSmoothingEnabled = false; x.drawImage(o, Math.round((32 - o.width * k) / 2), Math.round((32 - o.height * k) / 2), Math.round(o.width * k), Math.round(o.height * k)); });
      c.ww = c.wh = 16; return ICACHE[id] = c;
    }
    return f(id);
  })(itemIcon);
}

// the plaza pond is a stone fountain (props_hand.py fountain), drawn over the water tiles
OBJ.fountain = { w: 4, solid: 0, fixed: 1 };
EVT.on('map', id => {
  const m = MAPS.village; if (!m || id !== 'village' || !PIX.has('fountain')) return;
  if (m.o.some(o => o && o.k === 'fountain') || !TER[getT(m, 23, 21)].water) return;
  for (let y = 18; y <= 21; y++) for (let x = 23; x <= 26; x++) { setT(m, x, y, 'p'); m.solidB[y * m.w + x] = 1; } // paved under the basin, and solid
  setO(m, 23, 21, { k: 'fountain', fixed: 1 }); CHUNK.clear();
});
objSprite = (f => function (o, season) { return o.k === 'fountain' ? PIX.get('fountain') : f(o, season); })(objSprite);
// museum cases show what you've donated, two pieces each, and stand empty before that
objSprite = (f => function (o, season) {
  if (o.k === 'furn_display' && cur && cur.id === 'in_museum' && PIX.has('furn_display_empty')) return PIX.get('furn_display_empty');
  return f(o, season);
})(objSprite);
pcCursorDraw = (f => function (m) {
  f(m);
  if (!m || m.id !== 'in_museum' || !S || !S.museum) return;
  const got = Object.keys(S.museum).filter(k => S.museum[k] && IT[k]); let n = 0;
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o || o.k !== 'furn_display') continue;
    const x = (i % m.w) * 16, top = ((i / m.w | 0) + 1) * 16 - 26;
    for (const sx of [4, 18]) { const id = got[n++]; if (!id) continue; const ic = itemIcon(id); if (ic) D(ic, x + sx, top + 3, 10, 10); }
  }
})(pcCursorDraw);

/* combat telegraphs drawn on the art-pixel grid (hard edges, no smooth vector arcs) */
const PXQ = .5, pq = v => Math.round(v / PXQ) * PXQ;
function pxSpan(x0, x1, y) { x0 = pq(x0); x1 = pq(x1); if (x1 > x0) g.fillRect(x0, pq(y), x1 - x0, PXQ); }
function pxEll(cx, cy, rx, ry) { if (rx <= 0 || ry <= 0) return; for (let y = -ry; y <= ry; y += PXQ) { const w = rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))); pxSpan(cx - w, cx + w, cy + y); } }
function pxBand(cx, cy, rxo, ryo, rxi, ryi) {
  for (let y = -ryo; y <= ryo; y += PXQ) {
    const wo = rxo * Math.sqrt(Math.max(0, 1 - (y * y) / (ryo * ryo)));
    if (rxi > 0 && ryi > 0 && Math.abs(y) < ryi) { const wi = rxi * Math.sqrt(Math.max(0, 1 - (y * y) / (ryi * ryi))); pxSpan(cx - wo, cx - wi, cy + y); pxSpan(cx + wi, cx + wo, cy + y); }
    else pxSpan(cx - wo, cx + wo, cy + y);
  }
}
const pxLine = (cx, cy, rx, ry) => pxBand(cx, cy, rx, ry, rx - 1, ry - .7);
// a pie wedge (angle span under 180 degrees) filled row by row
function pxWedge(cx, cy, r, a1, a2) {
  const d1x = Math.cos(a1), d1y = Math.sin(a1), d2x = Math.cos(a2), d2y = Math.sin(a2);
  for (let vy = -r; vy <= r; vy += PXQ) {
    const w = Math.sqrt(Math.max(0, r * r - vy * vy)); let lo = -w, hi = w;
    for (const [a, b] of [[-d1y, d1x * vy], [d2y, -d2x * vy]]) { // a*vx + b >= 0
      if (Math.abs(a) < 1e-6) { if (b < 0) { lo = 1; hi = 0; } } else if (a > 0) lo = Math.max(lo, -b / a); else hi = Math.min(hi, -b / a);
    }
    if (hi > lo) pxSpan(cx + lo, cx + hi, cy + vy);
  }
}
drawHazards = function () {
  for (const h of HAZ) {
    const live = h.t >= h.T, k = Math.min(1, h.t / h.T), col = h.elem === 'fire' ? [255, 110, 40] : h.elem === 'ice' ? [120, 210, 255] : [230, 70, 50];
    const rgba = a => `rgba(${col[0]},${col[1]},${col[2]},${a})`;
    g.save();
    if (h.k === 'circle' || h.k === 'pool') {
      if (live) { g.fillStyle = rgba(h.k === 'pool' ? (Math.floor(gameT * 4) % 2 ? .5 : .4) : .75); pxEll(h.x, h.y, h.r, h.r * .7); }
      else { g.fillStyle = rgba(.16); pxEll(h.x, h.y, h.r, h.r * .7); g.fillStyle = rgba(.3 + Math.round(k * 3) / 10); pxEll(h.x, h.y, h.r * k, h.r * .7 * k); g.fillStyle = rgba(.95); pxLine(h.x, h.y, h.r, h.r * .7); }
      if (h.rock && !live) { const y = pq(h.y - 90 * (1 - k)); g.fillStyle = '#8a8478'; g.fillRect(pq(h.x - 4), y - 4, 8, 7); g.fillStyle = '#b0aa9e'; g.fillRect(pq(h.x - 4), y - 4, 8, 2); }
    } else if (h.k === 'ring') {
      if (!live) { g.fillStyle = rgba(.1); pxEll(h.x, h.y, h.r1, h.r1 * .7); g.fillStyle = rgba(.35 + Math.round(k * 3) / 10); pxEll(h.x, h.y, 22 * k + 3, 16 * k + 2); }
      else {
        const r = h.r0 + (h.r1 - h.r0) * Math.min(1, (h.t - h.T) / h.life);
        g.fillStyle = rgba(.6); pxBand(h.x, h.y, r + 7, (r + 7) * .7, Math.max(0, r - 7), Math.max(0, r - 7) * .7);
        g.fillStyle = 'rgba(255,240,220,.9)'; pxLine(h.x, h.y, r + 7, (r + 7) * .7);
      }
    } else if (h.k === 'lane') {
      // lanes run along their angle: drawn as a chain of pixel squares so the edge stays stepped
      const ca = Math.cos(h.a), sa = Math.sin(h.a), len = live ? h.len : h.len, fill = live ? h.len : h.len * k;
      for (let s = 0; s < len; s += 2) {
        const x = h.x + ca * s, y = h.y + sa * s, on = s <= fill;
        g.fillStyle = live ? rgba(.75) : rgba(on ? .3 + Math.round(k * 3) / 10 : .14);
        g.fillRect(pq(x - h.w / 2), pq(y - h.w / 2), pq(h.w), pq(h.w) * .5 + 1);
      }
      if (live) { g.fillStyle = '#e8f6ff'; for (let s = 10; s < h.len; s += 14) { const x = h.x + ca * s, y = h.y + sa * s; g.fillRect(pq(x - 1), pq(y - h.w / 2 - 5), 2, h.w / 2 + 5); } }
    } else if (h.k === 'wave') {
      const x = pq(live ? h.x + h.dir * 340 * Math.min(1, (h.t - h.T) / h.life) : h.x);
      g.fillStyle = rgba(live ? .7 : .2 + Math.round(k * 3) / 10);
      g.fillRect(x - 8, pq(h.y - h.h / 2), 16, pq(h.gap - h.gw / 2 - (h.y - h.h / 2))); g.fillRect(x - 8, pq(h.gap + h.gw / 2), 16, pq(h.y + h.h / 2 - h.gap - h.gw / 2));
      if (!live) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x - 3, pq(h.gap - h.gw / 2), 6, pq(h.gw)); }
    }
    g.restore();
  }
};
// the wind-up wedge under an enemy, in pixels (the older smooth wedges are switched off for that draw)
drawEnt = (f => function (e) {
  if (!(typeof ACTION === 'function' && ACTION() && e.type === 'enemy' && e.wind > 0 && !e.dead)) return f(e);
  const E = EN[e.k], k = 1 - e.wind / (e.windT || .5), r = E.r + 16;
  g.save(); g.fillStyle = k > .75 ? 'rgba(255,58,42,.6)' : 'rgba(232,64,42,.32)'; pxWedge(e.x, e.y - 2, r, e.windA - 1.1, e.windA + 1.1);
  g.fillStyle = 'rgba(255,90,60,.55)'; pxWedge(e.x, e.y - 2, r * k, e.windA - 1.1, e.windA + 1.1); g.restore();
  const arc = g.arc; g.arc = function () {};
  try { return f(e); } finally { g.arc = arc; }
})(drawEnt);
// under plate: mail sleeves and dark padded trousers, so the cuirass and helm stand out (every tier)
playerPal = (f => function () { const P = f(); if (P && P.armS) { P.shirt = '#7a7e8a'; P.pants = '#3e3a46'; } return P; })(playerPal);
// the south-row buildings face south: a path runs from the plaza round their side to the front door
EVT.on('map', id => {
  const m = MAPS.village; if (id !== 'village' || !m || m._frontPaths) return; m._frontPaths = 1;
  for (const b of m.bld) {
    if (b.y <= 14 || !b.act) continue;
    const side = b.x - 1, yEnd = b.door.y + 1;
    for (let y = 27; y <= yEnd; y++) if (inb(m, side, y) && !m.solidB[y * m.w + side] && getT(m, side, y) === 'g') { setT(m, side, y, 'p'); const o = getO(m, side, y); if (o && !o.fixed) delObj(m, side, y); else if (o && o.k === 'bush') delObj(m, side, y); }
    for (let x = side; x <= b.door.x; x++) if (inb(m, x, yEnd) && !m.solidB[yEnd * m.w + x] && getT(m, x, yEnd) === 'g') { setT(m, x, yEnd, 'p'); const o = getO(m, x, yEnd); if (o && (o.k === 'bush' || !o.fixed)) delObj(m, x, yEnd); }
  }
  CHUNK.clear();
});

/* ---------- the rest of the open list ---------- */
// signposts where the farm and village roads enter the Wilds: which way to the Old Mine and the coast
{
  const dirWord = (dx, dy) => { const a = Math.atan2(-dy, dx) * 180 / Math.PI, k = Math.round(((a + 360) % 360) / 45) % 8; return ['east', 'north-east', 'north', 'north-west', 'west', 'south-west', 'south', 'south-east'][k]; };
  const placeSigns = () => {
    const m = MAPS.wilds; if (!m || m._guideSigns || !m.bio) return; m._guideSigns = 1;
    let cx = 0, cy = 0, n = 0; for (let y = 0; y < m.h; y += 3) for (let x = 0; x < m.w; x += 3) if (BIOMES[m.bio[y * m.w + x]] === 'coast') { cx += x; cy += y; n++; }
    const coast = n ? [cx / n, cy / n] : null, mine = m.mineDoor ? [m.mineDoor.x, m.mineDoor.y] : null;
    for (const [ex, ey] of [[60, 146], [100, 146]]) {
      let spot = null; for (let r = 2; r < 7 && !spot; r++) for (const [dx, dy] of [[r, -2], [-r, -2], [r, -3], [-r, -3]]) { const x = ex + dx, y = ey + dy; if (inb(m, x, y) && passable(m, x, y) && !getO(m, x, y) && !m.solidB[y * m.w + x]) { spot = [x, y]; break; } }
      if (!spot) continue;
      const parts = []; if (mine) parts.push('Old Mine: ' + dirWord(mine[0] - spot[0], mine[1] - spot[1])); if (coast) parts.push('the coast: ' + dirWord(coast[0] - spot[0], coast[1] - spot[1]));
      setO(m, spot[0], spot[1], { k: 'sign', fixed: 1, text: parts.join(' · ') + '.', guide: 1 });
    }
  };
  EVT.on('map', id => { if (id === 'wilds') placeSigns(); });
  // their words float over them when you're close, so you don't have to read every post
  pcCursorDraw = (f => function (m) {
    f(m);
    if (!m || m.id !== 'wilds' || TITLE) return;
    const px = Math.floor(S.p.x / 16), py = Math.floor(S.p.y / 16);
    for (let y = py - 5; y <= py + 5; y++) for (let x = px - 6; x <= px + 6; x++) {
      const o = inb(m, x, y) && m.o[y * m.w + x]; if (!o || !o.guide) continue;
      g.save(); g.font = '600 6px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2; g.strokeStyle = 'rgba(42,28,24,.9)'; g.fillStyle = '#fff2c8';
      g.strokeText(o.text, (x + .5) * 16, y * 16 - 8); g.fillText(o.text, (x + .5) * 16, y * 16 - 8); g.restore();
    }
  })(pcCursorDraw);
}
// low creatures (slimes) sort a little behind you when you overlap, so they don't draw over the player
render = (f => function (dt) {
  if (!cur || !S || TITLE) return f(dt);
  const moved = [];
  for (const e of cur.ents) if (e.type === 'enemy' && EN[e.k] && EN[e.k].art === 'slime' && Math.abs(e.x - S.p.x) < 14 && e.y > S.p.y && e.y - S.p.y < 8) { moved.push([e, e.y]); e.y = S.p.y - .5; }
  try { return f(dt); } finally { for (const [e, y] of moved) e.y = y; }
})(render);
// the LMB hint says Walk where a tool has nothing to work on
hudTick = (f => function (dt) {
  const r = f(dt);
  if (!S || TITLE || PAUSED || !cur || fishing || !$('#pL') || !MOUSE.in) return r;
  const k = selKind(); if (!['axe', 'pick', 'hoe', 'can', 'rod', 'scythe'].includes(k)) return r;
  const [tx, ty] = clickTarget(); if (!inb(cur, tx, ty)) return r;
  const idle = !hasTarget(tx, ty) && !(k === 'hoe' && (cur.farm || cur.id === 'greenhouse')) && k !== 'scythe' && !(k === 'can' && cur.soil[ty * cur.w + tx]);
  if (idle && !inReach(tx, ty)) { const h = '<kbd>LMB</kbd>Walk'; if ($('#pL').innerHTML !== h) $('#pL').innerHTML = h; }
  return r;
})(hudTick);
// the sandbox's Next day keeps you where you were
endDay = (f => function (fainted) {
  if (typeof SANDBOX === 'undefined' || !SANDBOX || fainted || !cur) return f(fainted);
  const id = cur.id, x = S.p.x, y = S.p.y; const r = f(fainted);
  if (MAPS[id] && id !== 'farm') goMap(id, x, y); else { S.p.x = x; S.p.y = y; }
  return r;
})(endDay);
// early money: cheap crops sell a quarter higher, and a new farm starts with some fibre for the first workbench recipes
sellPrice = (f => function (id) { const p = f(id), it = IT[id]; return p && it && it.t === 'crop' && it.p < 60 ? Math.round(p * 1.25) : p; })(sellPrice);
startGame = (f => function (isNew) { const r = f(isNew); if (isNew && !(typeof SANDBOX !== 'undefined' && SANDBOX) && S) give('fiber', 20, 0, true); return r; })(startGame);

/* ---------- cliffs, spawns, damage and skill colours (after 0.5.3) ---------- */
// cliff blocks can be broken with the pickaxe: it takes a good number of swings, gives stone,
// and leaves the ground of the biome (never the outer edge of a map, rooms, mines or towns)
const CLIFF_T = new Set(['r', 'x', 'mo']), CLIFF_HITS = 14;
const cliffAt = (m, x, y) => m && m.outdoor && !m.mine && m.id !== 'village' && !(m.id || '').startsWith('in_') && inb(m, x, y) && x > 1 && y > 1 && x < m.w - 2 && y < m.h - 2
  && CLIFF_T.has(getT(m, x, y)) && !m.solidB[y * m.w + x] && !getO(m, x, y) && !(m.safe && Math.hypot(x - m.safe[0], y - m.safe[1]) < 18); // towns keep their walls
useTool = (f => function () {
  const k = selKind();
  if ((k === 'pick' || k === 'multi') && pl.cd <= 0 && cur && !fishing) {
    const [tx, ty] = faceTile(), m = cur;
    if (cliffAt(m, tx, ty)) {
      if (S.p.st <= 0) { toast('Too tired to work. Eat or sleep.', 'bad'); SFX.bad(); return; }
      pl.cd = .28; pl.anim = .25; pl.tool = k; useStamina(2);
      const lvl = k === 'multi' ? 6 : (S.tools.pick || 1), i = ty * m.w + tx; m.cliffHits = m.cliffHits || {};
      m.cliffHits[i] = (m.cliffHits[i] || 0) + 1 + (lvl - 1) * .35;
      SHAKE = .06; snd(160 + Math.random() * 40, .06, 'square', .05);
      for (let n = 0; n < 4; n++) PARTS.push({ x: (tx + .5) * 16 + (Math.random() - .5) * 10, y: (ty + .6) * 16, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 40, t: .5, c: Math.random() < .5 ? '#8a8070' : '#5a5246' });
      const left = Math.max(0, Math.ceil(CLIFF_HITS - m.cliffHits[i]));
      if (left > 0) { floatText((tx + .5) * 16, ty * 16, left + '', '#e8dcc0'); return; }
      delete m.cliffHits[i]; setT(m, tx, ty, typeof baseFor === 'function' ? baseFor(m, tx, ty) : 'g'); m.cv = (m.cv || 0) + 1;
      give('stone', ri(3, 6)); addXP('mining', 12); SFX.boom && SFX.boom(); toast('The rock gives way.');
      return;
    }
  }
  return f();
})(useTool);
hasTarget = (f => function (tx, ty) { const k = selKind(); return f(tx, ty) || ((k === 'pick' || k === 'multi') && cliffAt(cur, tx, ty)); })(hasTarget);
// nothing spawns on top of the cliff blocks: objects there are cleared, enemies and dropped items are moved down to open ground
function openTileNear(m, x, y) {
  for (let r = 0; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const X = x + dx, Y = y + dy;
    if (inb(m, X, Y) && passable(m, X, Y) && !TER[getT(m, X, Y)].water) return [X, Y];
  }
  return null;
}
EVT.on('map', id => {
  const m = cur; if (!m || !m.outdoor || m._cliffClean) return; m._cliffClean = 1;
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && !o.fixed && !o.id && o.k !== 'part' && o.k !== 'chest' && CLIFF_T.has(m.t[i]) && !m.solidB[i]) m.o[i] = null; }
});
spawnEnemy = (f => function (m, k, x, y, lvl) {
  const e = f(m, k, x, y, lvl);
  if (e && m && !(EN[k] && (EN[k].ai === 'fly' || EN[k].ai === 'swoop')) && solidAt(m, e.x, e.y - 2)) { const t = openTileNear(m, Math.floor(e.x / 16), Math.floor((e.y - 2) / 16)); if (t) { e.x = (t[0] + .5) * 16; e.y = (t[1] + .8) * 16; e.hx = e.x; e.hy = e.y; if (e.home) e.home = [e.x, e.y]; } }
  return e;
})(spawnEnemy);
EVT.on('tick', () => {
  const m = cur; if (!m || TITLE) return;
  for (const e of m.ents) if (e.type === 'drop' && !e.z && solidAt(m, e.x, e.y)) { const t = openTileNear(m, Math.floor(e.x / 16), Math.floor(e.y / 16)); if (t) { e.x = (t[0] + .5) * 16; e.y = (t[1] + .5) * 16; } }
});
// your hits are softer (action combat dealt up to 18 with a wooden sword: slimes and crows fell in one swing)
actionHit = (f => function (e, mult, a, kb, opts) { return f(e, mult * .6, a, kb, opts); })(actionHit);
// skills have their own colours: a burst of motes and a coloured ring when you use one, and coloured sparks on what it hits
const SKILL_FX = {
  cleave: ['#ffd890', '#ff9a3a', '#fff4d0'], lunge: ['#ffe8a0', '#e8c060', '#ffffff'], rend: ['#ff5a4a', '#a8201a', '#ffb0a0'], volley: ['#c8ff8a', '#7ad84a', '#f0ffe0'], secondwind: ['#7affb0', '#2ad870', '#e0fff0'], guard: ['#9ad8ff', '#4a8aff', '#ffffff'],
  whirlwind: ['#ffe8a0', '#ff9a3a', '#ffffff'], groundslam: ['#c8a070', '#8a6040', '#ffd890'], bladedash: ['#9ad8ff', '#4a8aff', '#ffffff'], leap: ['#ffb040', '#ff6a2a', '#fff0b0'], bladestorm: ['#8ae8ff', '#4ab0ff', '#e0f8ff'],
  piercing: ['#7affb0', '#2ad870', '#e0fff0'], multishot: ['#c8ff8a', '#7ad84a', '#f0ffe0'], rain: ['#ffe08a', '#e8a040', '#fff4c8'], trap: ['#ffd040', '#8a6a3a', '#fff0a0'], mark: ['#ff5a3a', '#ffb08a', '#ffe0d0'],
  fireball: ['#ff8a2a', '#ff3a1a', '#ffe08a'], frostnova: ['#bfe8ff', '#6ab8ff', '#ffffff'], chain: ['#c8a0ff', '#8ad8ff', '#ffffff'], orbs: ['#b07aff', '#e0c8ff', '#7a3ad8'], meteor: ['#ff6a1a', '#ffd040', '#8a2a10'],
};
let SKILL_COL = null, SKILL_COL_T = 0;
const motes = (x, y, cols, n, sp) => { for (let i = 0; i < n * (typeof PARTICLE_K !== 'undefined' ? Math.max(.3, PARTICLE_K) : 1); i++) { const a = Math.random() * 6.283, v = sp * (.4 + Math.random() * .6); PARTS.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .7 - 30, t: .35 + Math.random() * .35, c: cols[i % cols.length] }); } };
for (const id in SKILL_FX) {
  const A = ABIL[id]; if (!A || A._fx) continue; const fn = A.fn, cols = SKILL_FX[id]; A._fx = 1;
  A.fn = function () {
    const ok = fn.apply(this, arguments);
    if (ok !== false && S && S.p) {
      SKILL_COL = cols; SKILL_COL_T = gameT + 1.2;
      motes(S.p.x, S.p.y - 14, cols, 18, 90);
      vfx(k => { g.save(); g.globalAlpha = (1 - k) * .8; g.fillStyle = cols[0]; pxBand(S.p.x, S.p.y - 2, 10 + k * 26, (10 + k * 26) * .55, 8 + k * 26, (8 + k * 26) * .55); g.restore(); }, .35);
    }
    return ok;
  };
}
actionHit = (f => function (e, mult, a, kb, opts) {
  const r = f(e, mult, a, kb, opts);
  if (SKILL_COL && gameT < SKILL_COL_T && e && (opts && (opts.skill || opts.ability) || typeof SKILL_HIT !== 'undefined' && SKILL_HIT)) motes(e.x, e.y - EN[e.k].r * 1.4, SKILL_COL, 7, 70);
  return r;
})(actionHit);
// no stun-locking: an enemy that has started winding up finishes its attack (hits don't knock it back or
// cancel it; only a parry does), and a combo finisher staggers the same enemy at most once every 2.5 s
actionHit = (f => function (e, mult, a, kb, opts) {
  if (!e || e.type !== 'enemy' || e.dead) return f(e, mult, a, kb, opts);
  const parry = (e.stun || 0) >= 1.1; let o = opts;
  if (o && o.stagger && !parry) { if (gameT < (e.poiseT || 0) || e.wind > 0) { o = Object.assign({}, o); delete o.stagger; } else e.poiseT = gameT + 2.5; }
  if (e.wind > 0 && !parry) {
    const w = [e.wind, e.windT, e.windA], r = f(e, mult, a, 0, o);
    if (!e.dead) { e.wind = w[0]; e.windT = w[1]; e.windA = w[2]; e.kb = 0; e.vx = e.vy = 0; }
    return r;
  }
  return f(e, mult, a, kb, o);
})(actionHit);
