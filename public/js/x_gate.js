/* Fence gates and fenced fields (asked 2026-11-03).
   - Fence Gate (workbench: 6 wood, 2 fiber): an open gateway two tiles wide (wide enough for a horse with a plough),
     a post at each end and a lintel across, joined into the fence run like fence pieces (fenceMasks treats it as
     fence), not solid. Placing one fills the next tile along the run too (a fence piece there comes back to you);
     picking either half up removes both. Drawn in code (gateSpr) per half: o.gs L/R across an east-west run, T/B
     along a north-south one, S for a lone half.
   - Fenced fields: each morning, tilled soil that isn't shut in by fences and gates (and buildings, cliffs or water)
     has a 4% chance per tile that the meadow grass creeps in: the crop on it is lost and the tile is tall grass
     again (fieldsOvergrown). The morning report says how many tiles. */
I('fence_gate', 'Fence Gate', 'place', 30, 'obj', '#8a5a32', null, { place: 'fgate', desc: 'An open gateway for fences: walk or ride straight through. Fields shut in by fences and gates keep the meadow grass out' });
OBJ.fgate = { solid: 0, place: 1 };
RC.push(['fence_gate', 1, { wood: 6, fiber: 2 }, 'bench']);

// fences join gates as if they were fence pieces, and gates know which way their run goes
fenceMasks = (f => function (m) {
  f.apply(this, arguments); if (!m || !m.o) return;
  const isF = (x, y) => { const o = inb(m, x, y) && m.o[y * m.w + x]; return !!(o && (o.k === 'fence' || o.k === 'fgate')); };
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o || (o.k !== 'fence' && o.k !== 'fgate')) continue;
    const x = i % m.w, y = (i / m.w) | 0;
    o.fm = (isF(x, y - 1) ? 1 : 0) | (isF(x + 1, y) ? 2 : 0) | (isF(x, y + 1) ? 4 : 0) | (isF(x - 1, y) ? 8 : 0);
  }
})(fenceMasks);

const GATEC = {};
function gateSpr(gs) {
  const key = gs + '|' + SETTINGS.artStyle; if (GATEC[key]) return GATEC[key];
  const c = mk(32, 64, x => {
    const P = (X, Y, w, h, col) => { x.fillStyle = col; x.fillRect(X, Y, w, h); };
    const post = (X, Y, h) => { P(X, Y, 6, h, '#6a4228'); P(X, Y, 2, h, '#8a5a36'); P(X + 5, Y, 1, h, '#4a2c18'); P(X - 1, Y - 3, 8, 4, '#7a4c2c'); P(X - 1, Y - 3, 8, 1, '#9a6a42'); };
    const lintel = (X0, X1) => { P(X0, 24, X1 - X0, 5, '#7a4c2c'); P(X0, 24, X1 - X0, 1, '#a07048'); P(X0, 28, X1 - X0, 1, '#4a2c18'); };
    if (gs === 'L') { post(0, 30, 32); lintel(0, 32); P(4, 29, 2, 3, '#4a2c18'); }          // left half: its post on the left, the lintel runs on into the right half
    else if (gs === 'R') { post(26, 30, 32); lintel(0, 32); P(26, 29, 2, 3, '#4a2c18'); }   // right half
    else if (gs === 'T') { post(13, 14, 22); P(12, 10, 8, 4, '#7a4c2c'); P(12, 10, 8, 1, '#a07048'); }   // along a north-south run: a post at the far ends only
    else if (gs === 'B') { post(13, 50, 14); }
    else { post(0, 30, 32); post(26, 30, 32); lintel(0, 32); }   // a lone half
  });
  c.ww = 16; c.wh = 32;
  return GATEC[key] = (SETTINGS.artStyle !== 'pixel' && typeof gpuUp === 'function') ? gpuUp(c, 4) : c;
}
objSprite = (f => function (o, season) { if (o.k === 'fgate') return gateSpr(o.gs || 'S'); return f(o, season); })(objSprite);

// which half each gate tile is (from its gate neighbours), kept fresh with the fence masks
fenceMasks = (f => function (m) {
  f.apply(this, arguments); if (!m || !m.o) return;
  const isG = (x, y) => { const o = inb(m, x, y) && m.o[y * m.w + x]; return !!(o && o.k === 'fgate'); };
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o || o.k !== 'fgate') continue; const x = i % m.w, y = i / m.w | 0;
    o.gs = isG(x + 1, y) ? 'L' : isG(x - 1, y) ? 'R' : isG(x, y + 1) ? 'T' : isG(x, y - 1) ? 'B' : 'S'; }
})(fenceMasks);
// placing a gate fills the next tile along the run as well; picking one half up takes both
putObj = (f => function (m, x, y, o) {
  const r = f.apply(this, arguments);
  if (o && o.k === 'fgate' && !o.half && m && m.o) {
    const at = (X, Y) => inb(m, X, Y) && m.o[Y * m.w + X], fenceish = (X, Y) => { const q = at(X, Y); return q && (q.k === 'fence' || q.k === 'fgate'); };
    const free = (X, Y) => { if (!inb(m, X, Y) || m.solidB[Y * m.w + X] || TER[getT(m, X, Y)].solid || TER[getT(m, X, Y)].water) return false; const q = at(X, Y); return !q || q.k === 'fence'; };
    const vert = (fenceish(x, y - 1) || fenceish(x, y + 1)) && !(fenceish(x - 1, y) || fenceish(x + 1, y));
    const cand = vert ? [[x, y + 1], [x, y - 1]] : [[x + 1, y], [x - 1, y]];
    const spot = cand.find(([X, Y]) => free(X, Y) && at(X, Y) && at(X, Y).k === 'fence') || cand.find(([X, Y]) => free(X, Y));
    if (spot) { const [X, Y] = spot; if (at(X, Y) && at(X, Y).k === 'fence') { m.o[Y * m.w + X] = null; if (typeof give === 'function') give('fence', 1); } delete m.soil[Y * m.w + X]; f.call(this, m, X, Y, { k: 'fgate', half: 1 }); }
    if (typeof fenceMasks === 'function') fenceMasks(m);
  }
  return r;
})(putObj);
delObj = (f => function (m, x, y) {
  const o = inb(m, x, y) && m.o[y * m.w + x], r = f.apply(this, arguments);
  if (o && o.k === 'fgate') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const q = inb(m, x + dx, y + dy) && m.o[(y + dy) * m.w + x + dx]; if (q && q.k === 'fgate') { m.o[(y + dy) * m.w + x + dx] = null; break; } }
  if (o && o.k === 'fgate' && typeof fenceMasks === 'function') fenceMasks(m);
  return r;
})(delObj);

/* ---- fields left open to the meadow ---- */
let OVERGROWN_NEWS = 0;
function enclosedTiles(m) {
  // flood the open ground from the map edge; everything it can't reach is shut in
  const W = m.w, H = m.h, out = new Uint8Array(W * H), q = [];
  const wall = i => { const o = m.o[i], t = TER[m.t[i]]; return (o && (o.k === 'fence' || o.k === 'fgate')) || m.solidB[i] || (t && (t.solid || t.water)); };
  for (let x = 0; x < W; x++) for (const y of [0, H - 1]) { const i = y * W + x; if (!wall(i) && !out[i]) { out[i] = 1; q.push(i); } }
  for (let y = 0; y < H; y++) for (const x of [0, W - 1]) { const i = y * W + x; if (!wall(i) && !out[i]) { out[i] = 1; q.push(i); } }
  while (q.length) { const i = q.pop(), x = i % W, y = i / W | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const n = ny * W + nx; if (!out[n] && !wall(n)) { out[n] = 1; q.push(n); } } }
  return out;   // 1 = open to the meadow
}
function fieldsOvergrown() {
  for (const m of farmMaps()) {
    if (!m.soil || m.indoor) continue;
    const open = enclosedTiles(m);
    for (const k in m.soil) {
      const i = +k, s = m.soil[k]; if (!s || !open[i] || getO(m, i % m.w, i / m.w | 0)) continue;
      if (Math.random() < .04) { delete m.soil[k]; m.o[i] = { k: 'tgrass' }; if (m.id === 'farm') OVERGROWN_NEWS++; }
    }
  }
}
endDay = (f => function () { const r = f.apply(this, arguments); try { fieldsOvergrown(); if (typeof CHUNK !== 'undefined') CHUNK.clear(); } catch (e) { console.error(e); } return r; })(endDay);
if (typeof showDayReport === 'function') showDayReport = (f => function (lines) {
  if (OVERGROWN_NEWS && Array.isArray(lines)) lines.push(['bad', 'Meadow grass crept into ' + (OVERGROWN_NEWS === 1 ? 'a tile' : OVERGROWN_NEWS + ' tiles') + ' of your fields and choked what grew there. Fence your fields in (gates let you through) to keep it out.']);
  OVERGROWN_NEWS = 0; return f.apply(this, arguments);
})(showDayReport);
