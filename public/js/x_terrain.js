/* Terrain passes run after a wild map is generated (art-and-feel playtest, 2026-10-31).
   connectCliffs: every open area of 12+ tiles is joined to the rest of the map. The cliff plateaus west of
   Kingsbridge and around Greyhelm were boxy mazes, and a tester was walled in eight times. A pass two tiles
   wide is cut through the cliffs from the open ground already reached to the nearest walled-off pocket,
   and the cut takes the ground of the open tile beside it, so the painted cliff edges wrap round it like a ramp. */
const CUTTABLE = new Set(['r', 'x', 'mo']);
function connectCliffs(m) {
  const W = m.w, H = m.h, N = W * H, t = m.t;
  const open = new Uint8Array(N), cut = new Uint8Array(N);
  for (let i = 0; i < N; i++) { const D = TER[t[i]]; open[i] = D && !D.solid && !D.water && !m.solidB[i] ? 1 : CUTTABLE.has(t[i]) && !m.solidB[i] ? 2 : 0; }
  const comp = new Int32Array(N).fill(-1), sizes = [];
  for (let i = 0; i < N; i++) { // label the open areas
    if (open[i] !== 1 || comp[i] >= 0) continue; const id = sizes.length, q = [i]; comp[i] = id; let n = 0;
    while (q.length) { const c = q.pop(); n++; const x = c % W, y = (c / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 1 || Y < 1 || X >= W - 1 || Y >= H - 1) continue; const j = Y * W + X; if (open[j] === 1 && comp[j] < 0) { comp[j] = id; q.push(j); } } }
    sizes.push(n);
  }
  if (!sizes.length) return m;
  let main = 0; for (let k = 1; k < sizes.length; k++) if (sizes[k] > sizes[main]) main = k;
  const joined = new Uint8Array(sizes.length); joined[main] = 1;
  const left = () => sizes.some((n, k) => !joined[k] && n >= 12);
  for (let pass = 0; pass < 300 && left(); pass++) {
    // one breadth-first search from all the joined ground, through cliffs only, to the nearest pocket
    const prev = new Int32Array(N).fill(-2), q = new Int32Array(N); let qh = 0, qt = 0, hit = -1;
    for (let i = 0; i < N; i++) if (open[i] === 1 && joined[comp[i]]) { prev[i] = -1; q[qt++] = i; }
    while (qh < qt && hit < 0) { const c = q[qh++], x = c % W, y = (c / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 2 || Y < 2 || X >= W - 2 || Y >= H - 2) continue; const j = Y * W + X; if (prev[j] !== -2) continue;
        if (open[j] === 1 && !joined[comp[j]]) { if (sizes[comp[j]] >= 12) { prev[j] = c; hit = j; break; } continue; }
        if (open[j] === 2 || (open[j] === 1 && joined[comp[j]])) { prev[j] = c; q[qt++] = j; } } }
    if (hit < 0) break;
    const k = comp[hit]; joined[k] = 1; let c = prev[hit], last = hit;
    while (c >= 0 && open[c] === 2) { // carve back to the joined ground: this tile and the one beside it
      const x = c % W, y = (c / W) | 0, ground = t[last] && !CUTTABLE.has(t[last]) ? t[last] : baseFor(m, x, y);
      const vert = Math.abs(last - c) === W, side = vert ? c + 1 : c + W;
      for (const j of [c, side]) if (open[j] === 2) { t[j] = ground; open[j] = 1; comp[j] = k; cut[j] = 1; }
      last = c; c = prev[c];
    }
    for (let i = 0; i < N; i++) if (comp[i] === k) comp[i] = main; // the pocket is part of the joined ground now
  }
  // shortcuts: a thin cliff wall (1-2 tiles) between open ground gets a 2-wide gap, at most one each way per 20x20 cell,
  // so ridges don't make long detours
  const isOpen = j => open[j] === 1, cell = {};
  const gap = (tiles, ground, key) => { if (cell[key]) return; cell[key] = 1; for (const j of tiles) if (open[j] === 2) { t[j] = ground; open[j] = 1; cut[j] = 1; } };
  for (let y = 3; y < H - 4; y++) for (let x = 3; x < W - 4; x++) {
    const i = y * W + x; if (open[i] !== 2 || hsh(x, y, 41) > .5) continue;
    for (const L of [1, 2]) {
      // north-south crossing: open above, L cliff tiles, open below, and the column beside it the same
      const up = i - W, dn = i + L * W, upR = up + 1, dnR = dn + 1;
      if (isOpen(up) && isOpen(dn) && isOpen(upR) && isOpen(dnR) && [...Array(L).keys()].every(k => open[i + k * W] === 2 && open[i + k * W + 1] === 2)) {
        const ts = []; for (let k = 0; k < L; k++) ts.push(i + k * W, i + k * W + 1); gap(ts, t[up], 'v' + ((x / 20) | 0) + ',' + ((y / 20) | 0)); break; }
      const lf = i - 1, rt = i + L, lfD = lf + W, rtD = rt + W;
      if (isOpen(lf) && isOpen(rt) && isOpen(lfD) && isOpen(rtD) && [...Array(L).keys()].every(k => open[i + k] === 2 && open[i + k + W] === 2)) {
        const ts = []; for (let k = 0; k < L; k++) ts.push(i + k, i + k + W); gap(ts, t[lf], 'h' + ((x / 20) | 0) + ',' + ((y / 20) | 0)); break; }
    }
  }
  // loose things standing in a new pass are cleared
  for (let i = 0; i < N; i++) if (cut[i] && m.o[i] && !m.o[i].fixed) m.o[i] = null;
  return m;
}
genWilds = (f => function () { return connectCliffs(f.apply(this, arguments)); })(genWilds);
genRegion = (f => function () { return connectCliffs(f.apply(this, arguments)); })(genRegion);

/* Roads: one clean road per route (art round: "braids of parallel, stair-stepped strips; on the map they
   look like circuit traces"). A road now goes in a Z: along its long axis to a turning point, across, then on
   to the end, turning only on dry land so bridges stay straight. While it runs it merges onto an older road
   within 3 tiles beside it instead of running parallel to it. Laying (2 wide, bridges over water, clearing
   objects and overhanging canopies) is the same as before. */
realmRoad = function (m, a, b) {
  let [x, y] = a.map(Math.round); const [tx, ty] = b.map(Math.round);
  const wet = (X, Y) => inb(m, X, Y) && (TER[getT(m, X, Y)].water || getT(m, X, Y) === 'b');
  const KEEP = ['shrine', 'cave', 'chest', 'page', 'shard', 'sign', 'tent', 'wreck', 'statue', 'campfire', 'waystone'];
  const RT = m.roadT || (m.roadT = new Set()), old = new Set(RT), road = (X, Y) => old.has(Y * m.w + X);
  const lay = (x, y) => {
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const X = x + i, Y = y + j; if (!inb(m, X, Y) || m.solidB[Y * m.w + X]) continue; const t = getT(m, X, Y); RT.add(Y * m.w + X);
      if (t === 'w' || t === 'l') setT(m, X, Y, 'b'); else if (t !== 'i' && t !== 'b' && t !== 's' && t !== 'p') setT(m, X, Y, 'd');
      const o = getO(m, X, Y); if (o && !KEEP.includes(mainOf(m, X, Y)[2].k)) delObj(m, X, Y);
    }
    for (let j = 2; j <= 4; j++) for (let i = -1; i <= 2; i++) { const X = x + i, Y = y + j, o = inb(m, X, Y) && getO(m, X, Y); if (o && (o.k === 'tree' || o.k === 'ancient')) delObj(m, X, Y); }
  };
  const horizFirst = Math.abs(tx - x) >= Math.abs(ty - y);
  const turnAt = horizFirst ? Math.round(x + (tx - x) * (.35 + R() * .3)) : Math.round(y + (ty - y) * (.35 + R() * .3));
  let phase = 0, n = 0; lay(x, y);
  while ((x !== tx || y !== ty) && n++ < 4000) {
    const dry = !wet(x, y) && !wet(x + 1, y + 1);
    // phase 0: the long leg to the turning point; 1: across to the target's line; 2: the rest of the way
    if (phase === 0 && (horizFirst ? x === turnAt || x === tx : y === turnAt || y === ty) && dry) phase = 1;
    if (phase === 1 && (horizFirst ? y === ty : x === tx) && dry) phase = 2;
    let goH = horizFirst ? phase !== 1 : phase === 1;
    if (goH && x === tx) goH = false; else if (!goH && y === ty) goH = true;
    if (goH) {
      x += Math.sign(tx - x);
      // merge: an older road 1-3 tiles to the side, heading the same way, pulls this one onto it
      if (!road(x, y) && y !== ty) for (let k = 1; k <= 3; k++) { const s = Math.sign(ty - y) || 1, Y = y + s * k; if (road(x, Y) && road(x + Math.sign(tx - x), Y)) { for (let q = 1; q <= k; q++) lay(x, y + s * q); y = Y; break; } }
    } else {
      y += Math.sign(ty - y);
      if (!road(x, y) && x !== tx) for (let k = 1; k <= 3; k++) { const s = Math.sign(tx - x) || 1, X = x + s * k; if (road(X, y) && road(X, y + Math.sign(ty - y))) { for (let q = 1; q <= k; q++) lay(x + s * q, y); x = X; break; } }
    }
    lay(x, y);
  }
};
// side paths (to shrines, ruins, arenas, the hut...) branch off the nearest road already laid instead of all
// running back to the crossroads, so the network grows like a tree, not a grid
carvePath = (f => function (m, a, b) {
  if (m && m.id === 'wilds' && m.roadT && m.roadT.size && a && b) {
    let best = null, bd = Math.hypot(a[0] - b[0], a[1] - b[1]) * .8;
    for (const i of m.roadT) { const x = i % m.w, y = (i / m.w) | 0, d = Math.hypot(x - b[0], y - b[1]); if (d < bd) { bd = d; best = [x, y]; } }
    if (best) a = best;
  }
  return f(m, a, b);
})(carvePath);

/* each town's trade in its props (townprops.py): Greyhelm's rails, carts and slag, Ashford's log piles,
   Saltmere's boats and drying racks. Rails are walked over. */
Object.assign(FURN, { rails: {}, rails_v: {}, minecart: {}, slag: {}, logpile: { w: 2 }, rowboat: { w: 2 }, fishrack: { w: 2 } });
for (const k of ['rails', 'rails_v', 'minecart', 'slag', 'logpile', 'rowboat', 'fishrack']) OBJ['furn_' + k] = { solid: k.startsWith('rails') ? 0 : 1, fixed: 1, w: FURN[k].w || 1, h: 1 };
if (typeof FLAT !== 'undefined') { FLAT.add('furn_rails'); FLAT.add('furn_rails_v'); } // drawn on the ground, under feet

/* walls run on into the towers and gate arches beside them: a wall piece next to a tower or gate counts that
   side as joined, so it isn't drawn as a wall's end (end parapet, cast shadow) with a gap before the tower */
const JOINS = new Set(['ctower', 'cgate', 'gpart']);
function joinTowers(m) {
  if (!m || !m.o) return m;
  const joinAt = (x, y) => { if (!inb(m, x, y)) return false; const o = getO(m, x, y); if (!o) return false; if (JOINS.has(o.k)) return true; const mo = mainOf(m, x, y); return !!(mo && mo[2] && JOINS.has(mo[2].k)); };
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o || o.k !== 'cwall') continue; const x = i % m.w, y = (i / m.w) | 0;
    let fm = o.fm || 0; if (joinAt(x, y - 1)) fm |= 1; if (joinAt(x + 1, y)) fm |= 2; if (joinAt(x, y + 1)) fm |= 4; if (joinAt(x - 1, y)) fm |= 8; o.fm = fm;
  }
  return m;
}
genWilds = (f => function () { return joinTowers(f.apply(this, arguments)); })(genWilds);
if (typeof genCastle === 'function') genCastle = (f => function () { return joinTowers(f.apply(this, arguments)); })(genCastle);
// Kingsbridge's west and east gates go: a gap in a north-south wall can't read with walls this tall (the wall
// south of the gap is drawn over the passage and you vanish under it; style audit round 2). Roads come in at
// the north and south gatehouses instead.
if (typeof TOWNS !== 'undefined' && TOWNS.kingsbridge) { delete TOWNS.kingsbridge.gates.W; delete TOWNS.kingsbridge.gates.E; }

// is someone at (x, y) standing behind something tall (a tower, wall, gate or building in the rows below)?
// Things drawn in the overlay pass (guards' swords) skip them, so a sword doesn't float on a tower's face
function behindTall(m, x, y) {
  const tx = Math.floor(x / 16), ty = Math.floor((y - 2) / 16);
  for (const b of m.bld || []) if (tx >= b.x && tx < b.x + b.w && ty < b.y + b.h && ty >= b.y - 3) return true;
  for (let j = 1; j <= 5; j++) for (let i = -1; i <= 1; i++) { if (!inb(m, tx + i, ty + j)) continue; const o = getO(m, tx + i, ty + j); if (!o) continue; const mo = mainOf(m, tx + i, ty + j), k = mo && mo[2] ? mo[2].k : o.k;
    if ((k === 'ctower' && j <= 5) || ((k === 'cwall' || k === 'cgate' || k === 'gpart') && j <= 3 && i === 0)) return true; }
  return false;
}
