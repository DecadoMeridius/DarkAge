/* Fence gates and fenced fields (asked 2026-11-03).
   - Fence Gate (workbench: 6 wood, 2 fiber): an open gateway between two posts with a lintel, joined into the fence
     run like a fence piece (fenceMasks treats it as fence), but not solid, so you, a horse and a hitched implement
     pass straight through. Drawn in code (gateSpr), across a run that goes east-west or north-south.
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
function gateSpr(vert) {
  const key = (vert ? 'v' : 'h') + '|' + SETTINGS.artStyle; if (GATEC[key]) return GATEC[key];
  const W = 32, H = 64, c = mk(W, H, x => {
    const P = (X, Y, w, h, col) => { x.fillStyle = col; x.fillRect(X, Y, w, h); };
    const post = (X, Y, h) => { P(X, Y, 6, h, '#6a4228'); P(X, Y, 2, h, '#8a5a36'); P(X + 5, Y, 1, h, '#4a2c18'); P(X - 1, Y - 3, 8, 4, '#7a4c2c'); P(X - 1, Y - 3, 8, 1, '#9a6a42'); };
    if (!vert) {   // across the run: a post at each side, a lintel over the top, the opening between
      post(0, 30, 32); post(26, 30, 32);
      P(0, 24, 32, 5, '#7a4c2c'); P(0, 24, 32, 1, '#a07048'); P(0, 28, 32, 1, '#4a2c18');
      P(4, 29, 2, 3, '#4a2c18'); P(26, 29, 2, 3, '#4a2c18');   // brackets
    } else {       // along a north-south run: posts at the top and bottom of the tile, rails only at the ends
      post(13, 14, 22); post(13, 50, 14);
      P(12, 10, 8, 4, '#7a4c2c'); P(12, 10, 8, 1, '#a07048');
    }
  });
  c.ww = 16; c.wh = 32;
  return GATEC[key] = (SETTINGS.artStyle !== 'pixel' && typeof gpuUp === 'function') ? gpuUp(c, 4) : c;
}
objSprite = (f => function (o, season) { if (o.k === 'fgate') return gateSpr(((o.fm || 0) & 5) && !((o.fm || 0) & 10)); return f(o, season); })(objSprite);

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
