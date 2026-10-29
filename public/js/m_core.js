/* ================= Core: game tick, event bus, click-to-move, item-on-item =================
   GAME TICK: gameplay that should feel RuneScape-like (combat rounds, skilling actions,
   growth timers in later phases) subscribes to EVT 'tick', fired every 0.6 s of unpaused
   game time. Rendering and movement stay per-frame.
   EVENT BUS: EVT.on(name, fn) / EVT.emit(name, ...args). Fired so far: 'tick' (n),
   'map' (id), 'arrive' (tx, ty).
   CLICK-TO-MOVE: clicking a tile out of reach walks there along an A* path over the tile
   grid (8 directions, no corner cutting), then acts on what you clicked: left click uses
   the selected tool/item/weapon on it, right click interacts. WASD cancels the path.
   ITEM-ON-ITEM: in the backpack, Use an item, then click another one; if a Field-kit
   recipe takes exactly those two items, it's crafted. */

const EVT = {
  h: {},
  on(e, f) { (this.h[e] = this.h[e] || []).push(f); return f; },
  off(e, f) { this.h[e] = (this.h[e] || []).filter(x => x !== f); },
  emit(e, ...a) { for (const f of this.h[e] || []) { try { f(...a); } catch (err) { console.error(err); } } },
};
const TICK = { len: .6, acc: 0, n: 0 };

/* ---- pathfinding ---- */
function passable(m, x, y) {
  if (!inb(m, x, y)) return false; const i = y * m.w + x, t = m.t[i];
  if (TER[t].solid || m.solidB[i]) return false;
  let o = m.o[i]; if (o && o.k === 'part') o = getO(m, o.ax, o.ay);
  return !(o && OBJ[o.k] && OBJ[o.k].solid);
}
function findPath(m, sx, sy, gx, gy, maxN = 6000) {
  if (!passable(m, gx, gy)) return null;
  const W = m.w, key = (x, y) => y * W + x, open = [[0, sx, sy]], g = new Map([[key(sx, sy), 0]]), from = new Map();
  const h = (x, y) => { const dx = Math.abs(x - gx), dy = Math.abs(y - gy); return Math.max(dx, dy) + .41 * Math.min(dx, dy); };
  let n = 0;
  while (open.length && n++ < maxN) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (open[i][0] < open[bi][0]) bi = i;
    const [, x, y] = open.splice(bi, 1)[0];
    if (x === gx && y === gy) { const p = [[x, y]]; let k = key(x, y); while (from.has(k)) { k = from.get(k); p.unshift([k % W, (k / W) | 0]); } return p; }
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
      if (!passable(m, nx, ny) || (dx && dy && (!passable(m, x + dx, y) || !passable(m, x, y + dy)))) continue; // no corner cutting
      const ng = g.get(key(x, y)) + (dx && dy ? 1.41 : 1), k = key(nx, ny);
      if (g.has(k) && g.get(k) <= ng) continue;
      g.set(k, ng); from.set(k, key(x, y)); open.push([ng + h(nx, ny), nx, ny]);
    }
  }
  return null;
}

/* ---- walking a path ---- */
let WALK = null; // { path, i, goal: [tx, ty], target: [tx, ty] | null, then: 'use' | 'interact' | null, stuck, last }
const playerTile = () => [Math.floor(S.p.x / 16), Math.floor((S.p.y - 2) / 16)];
function walkTo(tx, ty, then) {
  const m = cur, [px, py] = playerTile();
  // acting on something: stand on a side (not diagonal) neighbour so you face it; plain walking: go to the tile itself
  let goals = !then && passable(m, tx, ty) ? [[tx, ty]] : [];
  if (!goals.length) for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) if (passable(m, tx + dx, ty + dy)) goals.push([tx + dx, ty + dy]);
  goals.sort((a, b) => Math.hypot(a[0] - px, a[1] - py) - Math.hypot(b[0] - px, b[1] - py));
  for (const [gx, gy] of goals) {
    const path = findPath(m, px, py, gx, gy);
    if (path) { WALK = { path, i: 1, goal: [gx, gy], target: [tx, ty], then, stuck: 0, last: [S.p.x, S.p.y] }; return true; }
  }
  toast("You can't reach that.", 'bad'); return false;
}
function stopWalk() { WALK = null; INPUT.x = INPUT.y = 0; }
function faceTileAt(tx, ty) {
  const dx = (tx + .5) * 16 - S.p.x, dy = (ty + .5) * 16 - (S.p.y - 6);
  S.p.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); if (S.p.dir === 1 || S.p.dir === 2) S.p.lastH = S.p.dir;
}
function walkTick(dt) {
  if (!WALK) return;
  const K = INPUT.keys; if (K.w || K.a || K.s || K.d || K.arrowup || K.arrowdown || K.arrowleft || K.arrowright || cur.id !== WALK.map && WALK.map) { stopWalk(); return; }
  WALK.map = cur.id;
  const node = WALK.path[WALK.i];
  if (!node) { const w = WALK; stopWalk(); arrive(w); return; }
  const wx = (node[0] + .5) * 16, wy = (node[1] + .75) * 16, dx = wx - S.p.x, dy = wy - S.p.y, d = Math.hypot(dx, dy);
  if (d < 2.5) { WALK.i++; return; }
  INPUT.x = dx / d; INPUT.y = dy / d;
  WALK.stuck = Math.hypot(S.p.x - WALK.last[0], S.p.y - WALK.last[1]) < .05 ? WALK.stuck + dt : 0; WALK.last = [S.p.x, S.p.y];
  if (WALK.stuck > .6) stopWalk();
}
function arrive(w) {
  EVT.emit('arrive', w.target[0], w.target[1]);
  if (!w.then || !w.target) return;
  faceTileAt(w.target[0], w.target[1]);
  if (w.then === 'interact') { const it = findInteract(); if (it) it.fn(); }
  else if (w.then === 'use') { if (selKind() === 'weapon') attack(); else act(); }
}

/* ---- mouse: near = act in place, far = walk there first ---- */
function mouseTile() { const [wx, wy] = mouseWorld(); return [Math.floor(wx / 16), Math.floor(wy / 16)]; }
function inReach(tx, ty) { const [px, py] = playerTile(); return Math.max(Math.abs(tx - px), Math.abs(ty - py)) <= 1; }
function clickTarget() {
  // snap to a creature or NPC under the cursor so clicking them works even off-grid
  const [wx, wy] = mouseWorld();
  for (const n of cur.npcs || []) if (Math.abs(n.x - wx) < 8 && wy < n.y + 2 && wy > n.y - 30) return [Math.floor(n.x / 16), Math.floor((n.y - 2) / 16)];
  for (const e of cur.ents) if (e.type === 'enemy' && Math.abs(e.x - wx) < 10 && wy < e.y + 2 && wy > e.y - 24) return [Math.floor(e.x / 16), Math.floor((e.y - 2) / 16)];
  return mouseTile();
}
primaryUse = function () {
  if (PAUSED || TITLE) return;
  if (fishing) { INPUT.act = true; act(); return; }
  const [tx, ty] = clickTarget();
  if (inReach(tx, ty)) { stopWalk(); faceMouse(); if (selKind() === 'weapon') { INPUT.atk = true; attack(); } else act(); return; }
  walkTo(tx, ty, hasTarget(tx, ty) ? 'use' : null); // far: walk over, then use it on whatever you clicked
};
/* something worth acting on: an object, crop soil, water, a creature or a person */
function hasTarget(tx, ty) {
  const m = cur, i = ty * m.w + tx; if (!inb(m, tx, ty)) return false;
  if (m.o[i] || m.soil[i] || TER[m.t[i]].water || TER[m.t[i]].lava) return true;
  const on = e => Math.floor(e.x / 16) === tx && Math.floor((e.y - 2) / 16) === ty;
  return cur.ents.some(e => e.type === 'enemy' && on(e)) || (cur.npcs || []).some(on) || (m.id === 'farm' && S.animals.some(on));
}
interact = function () {
  if (PAUSED || TITLE) return;
  if (fishing) { act(); return; }
  const [tx, ty] = clickTarget();
  if (inReach(tx, ty)) { stopWalk(); faceMouse(); const it = findInteract(); if (it) it.fn(); return; }
  walkTo(tx, ty, 'interact');
};

/* hook the frame update: path following + the 0.6 s tick */
const _updateCore = update;
update = function (dt) {
  if (!PAUSED && !TITLE && S && S.p) {
    walkTick(dt);
    TICK.acc += dt; while (TICK.acc >= TICK.len) { TICK.acc -= TICK.len; TICK.n++; EVT.emit('tick', TICK.n); }
  } else if (WALK) stopWalk();
  _updateCore(dt);
};
const _goMapCore = goMap;
goMap = function (id, x, y, dir) { stopWalk(); _goMapCore(id, x, y, dir); EVT.emit('map', id); };
/* holding LMB re-uses a tool only on tiles in reach (never while walking) */
const _faceMouse = faceMouse;
faceMouse = function () { if (WALK) return; _faceMouse(); };

/* destination marker + cursor */
const _pcCursorDraw = pcCursorDraw;
pcCursorDraw = function (m) {
  if (WALK && WALK.target) {
    const [tx, ty] = WALK.target, X = tx * 16 + 8, Y = ty * 16 + 8, k = 3 + Math.sin(gameT * 8);
    g.fillStyle = '#ffd25a';
    for (let i = -2; i <= 2; i++) { g.fillRect(X + i * k / 2 - .5, Y + i * k / 2 - .5, 1, 1); g.fillRect(X + i * k / 2 - .5, Y - i * k / 2 - .5, 1, 1); }
    return;
  }
  const [tx, ty] = mouseTile();
  if (MOUSE.in && !PAUSED && !TITLE && S && S.p && !inReach(tx, ty) && inb(m, tx, ty)) { // far tile: show where a click would walk to
    g.fillStyle = 'rgba(255,246,220,.35)'; g.fillRect(tx * 16 + 7, ty * 16 + 7, 2, 2); return;
  }
  _pcCursorDraw(m);
};

/* ---- item-on-item ---- */
function comboRecipe(a, b) { return RC.find(r => r[3] === 'bench' && Object.keys(r[2]).length === 2 && r[2][a] && r[2][b] && a !== b); }
const _slotPrimary = slotPrimary;
slotPrimary = function (i) {
  const u = MODAL && MODAL.opts.useSel;
  if (u !== undefined && u !== null && u !== i && S.pack[u] && S.pack[i]) {
    const a = parseK(S.pack[u].k)[0], b = parseK(S.pack[i].k)[0], r = comboRecipe(a, b);
    MODAL.opts.useSel = null;
    if (!r) { toast('Nothing interesting happens when you use the ' + IT[a].n.toLowerCase() + ' on the ' + IT[b].n.toLowerCase() + '.'); refresh(); return; }
    const why = canCraft(r); if (why) { toast(why, 'bad'); refresh(); return; }
    doCraft(r, 1); refresh(); return;
  }
  MODAL.opts.useSel = null; _slotPrimary(i);
};
const _packMenu = packMenu;
packMenu = function (e, i) {
  _packMenu(e, i);
  const m = $('#ctxmenu'), use = [...m.querySelectorAll('button')].find(b => b.textContent === 'Use');
  if (use) use.onclick = () => { m.hidden = true; MODAL.opts.useSel = i; MODAL.opts.sel = i; refresh(); toast('Use ' + IT[parseK(S.pack[i].k)[0]].n + ' with… (click another item)'); };
};
