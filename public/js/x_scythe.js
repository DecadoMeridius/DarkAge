/* ================= The scythe =================
   A new tool on the hotbar (key kind 'scythe', upgraded at Brann's like the others). Left click
   sweeps the area in front of you: every weed and tuft of tall grass it cuts always gives one
   fibre and one hay, straight into the bag (better scythes sometimes give an extra fibre), and every ripe crop it touches is harvested.
   Vegetables, grains and field crops can only be harvested with the scythe; fruit and flowers
   are still picked by hand. The swath grows with the tool: basic 1 tile, copper 3 wide,
   iron 3x2, gold 5x2, mythril 5x3. Older saves get a scythe in a free (or the last) hotbar slot. */

const SCYTHE_AREA = [null, [1, 1], [3, 1], [3, 2], [5, 2], [5, 3]]; // [width, depth] per tool level
const needsScythe = C => !!C && (C.kind === 'veg' || C.kind === 'grain' || !!C.as);
function scytheTiles(tx, ty, lvl) {
  const [w, dep] = SCYTHE_AREA[Math.min(SCYTHE_AREA.length - 1, Math.max(1, lvl))], d = DIRV[S.p.dir], px = -d[1], py = d[0], out = [], h = (w - 1) / 2;
  for (let i = 0; i < dep; i++) for (let j = -h; j <= h; j++) out.push([tx + d[0] * i + px * j, ty + d[1] * i + py * j]);
  return out;
}
function scytheSwing(m, tx, ty, lvl) {
  SFX.swing(); let fib = 0, hay = 0, crops = 0;
  for (const [x, y] of scytheTiles(tx, ty, lvl)) {
    if (!inb(m, x, y)) continue;
    const o = getO(m, x, y), i = y * m.w + x, s = m.soil[i];
    if (o && (o.k === 'weed' || o.k === 'tgrass')) {
      setO(m, x, y, null); fib++; if (Math.random() < (lvl - 1) * .1) fib++;
      hay++;
      if (Math.random() < .015) dropItem(m, (x + .5) * 16, (y + .5) * 16, pickR(['herb', 'wild_leek', 'turnip_seed', 'wheat_seed']), 1);
      for (let k = 0; k < 4; k++) PARTS.push({ x: (x + .5) * 16, y: (y + .6) * 16, vx: (Math.random() - .5) * 50, vy: -Math.random() * 50, t: .4, c: GRASS[Math.min(2, S.season)][0] });
      continue;
    }
    if (s && s.crop) {
      const C = CROPS[s.crop.k];
      if (s.crop.dead) { s.crop = null; continue; }
      if (C && s.crop.age >= C.d) { harvest(m, x, y); crops++; }
    }
  }
  const [fx, fy] = facePt(); if (fib) popTo(m, fx, fy, 'fiber', fib); if (hay) popTo(m, fx, fy, 'hay', hay);
  if (fib || hay) { addXP('foraging', fib * .5); noiseBurst(.07, .04, 2500); CHUNK.clear(); }
  return fib + crops > 0;
}

/* older saves: give them the scythe */
const _startGameSc = startGame;
startGame = function (isNew) {
  _startGameSc(isNew);
  if (!S.tools.scythe) S.tools.scythe = 1;
  if (!S.hot.includes('scythe')) {
    let i = S.hot.indexOf(null); if (i < 0) for (let k = S.hot.length - 1; k >= 0; k--) if (!isTool(S.hot[k])) { i = k; break; }
    if (i >= 0) { S.hot[i] = 'scythe'; hudKey = ''; toast('Hale left you a scythe: it\'s on your hotbar. Cut grass and weeds for fibre and hay, and harvest vegetables with it.', 'lvl'); }
  }
};
