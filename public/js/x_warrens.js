/* The Warrens under Briarholt: a broken hole in the Wine Cellar floor drops into three floors of rat tunnels.
   Cellar rats, plague rats, giant rats and roaches live there, and the Rat King holds the nest on the
   third floor. He comes back a week after you beat him.
   - Maps `warren_1` to `warren_3` are rebuilt on every visit (like the mine) and never saved; loading
     a save made down there puts you on the farm, as for any unsaved map.
   - Art: `art/sprites/vermin.py` (en_rat, en_bigrat, en_roach, en_ratking; furn_hole and furn_ropeup). */

Object.assign(EN, {
  rat: { n: 'Cellar Rat', art: 'rat', col: '#6e5e56', hp: 30, atk: 7, def: 1, spd: 48, xp: 8, ai: 'chase', drops: [['rat_tail', .5, 1, 1], ['bone', .15, 1, 1]], r: 5 },
  plaguerat: { n: 'Plague Rat', art: 'rat', col: '#6a7448', eye: '#c8e85a', hp: 46, atk: 9, def: 1, spd: 52, xp: 12, ai: 'chase', drops: [['rat_tail', .6, 1, 1], ['slime_goo', .3, 1, 2]], r: 5 },
  bigrat: { n: 'Giant Rat', art: 'bigrat', col: '#5a4a44', hp: 95, atk: 13, def: 3, spd: 40, xp: 22, ai: 'charge', drops: [['rat_tail', .8, 1, 2], ['hide', .4, 1, 1], ['fang', .3, 1, 1]], r: 8 },
  roach: { n: 'Cellar Roach', art: 'roach', col: '#5a3a26', hp: 40, atk: 8, def: 5, spd: 58, xp: 10, ai: 'chase', drops: [['bug_shell', .5, 1, 1]], r: 6 },
  ratking: { n: 'The Rat King', art: 'ratking', col: '#4e423e', eye: '#ff4a2a', hp: 900, atk: 18, def: 6, spd: 34, xp: 280, ai: 'boss', boss: 1, r: 22,
    moves: ['charge', 'summon:rat', 'walk', 'summon:plaguerat', 'circle'],
    drops: [['rat_crown', 1, 1, 1], ['gold_ore', 1, 6, 10], ['ruby', .5, 1, 1], ['cheese', 1, 3, 5], ['ember_shard', .4, 1, 1]] },
});
if (typeof BOSS_KIT !== 'undefined') BOSS_KIT.ratking = [['charge', 'summon:rat', 'walk', 'summon:plaguerat', 'circle'], 'triplecharge'];
I('rat_tail', 'Rat Tail', 'loot', 6, 'root', '#d89a8a');
I('bug_shell', 'Roach Shell', 'loot', 14, 'scale', '#6a4a2a');
I('rat_crown', 'Rat King\'s Crown', 'loot', 2500, 'crown', '#e8b830', '#d8342a', { desc: 'A crown the Rat King stole from somewhere. It still smells of him' });
Object.assign(FURN, { hole: {}, ropeup: {} });
OBJ.furn_hole = { solid: 1, fixed: 1, w: 1, h: 1 }; OBJ.furn_ropeup = { solid: 1, fixed: 1, w: 1, h: 1 };
if (typeof FLAT !== 'undefined') FLAT.add('furn_hole');
// the hole in the Wine Cellar floor, beside the kegs
if (typeof KEEP_PLANS !== 'undefined') KEEP_PLANS.castle_down.f.push(['hole', 17, 9, 'k_warren', 'Climb down']);

const WARREN_N = { 1: 'The Warrens', 2: 'The Warrens, deeper', 3: 'The Rat King\'s Nest' };
function ratKingHome() { const t = S.flags && S.flags.ratKing; return t === undefined || dayIndex() - t >= 7; }
function genWarren(n) {
  const boss = n === 3, W = boss ? 30 : 36, H = boss ? 24 : 26, m = newMap('warren_' + n, W, H, 'x');
  m.warren = n; m.dark = true; m.outdoor = false; m.theme = 'earth'; m.name = WARREN_N[n];
  caveCore(m, W, H, n * 7919 + dayIndex() * 13 + (S.seed || 1), boss);
  const floors = []; for (let i = 0; i < W * H; i++) if (m.t[i] === 'c') floors.push(i);
  const startI = boss ? (H - 4) * W + Math.floor(W / 2) : floors[Math.floor(R() * floors.length)];
  const sx = startI % W, sy = (startI / W) | 0; m.t[startI] = 'c'; setT(m, sx, sy + 1, 'c');
  setO(m, sx, sy, { k: 'furn_ropeup', fixed: 1, act: 'k_wup', label: 'Climb up' }); m.start = { x: (sx + .5) * 16, y: (sy + 1.6) * 16 };
  const [D, far] = bfsFar(m, startI);
  if (!boss) setO(m, far % W, (far / W) | 0, { k: 'furn_hole', fixed: 1, act: 'k_wdown', label: 'Climb down' });
  m.hole = boss ? null : [far % W, (far / W) | 0];
  // the rats' leavings: straw nests, gnawed bones, a few rocks and the odd crate dragged down from the cellar
  for (const i of floors) { if (m.o[i] || D[i] < 3) continue; const r = R();
    if (r < .012) m.o[i] = { k: 'furn_hay', fixed: 1 }; else if (r < .016) m.o[i] = { k: 'furn_crate', fixed: 1 }; else if (r < .06) m.o[i] = { k: 'rock', cave: 1 }; else if (r < .066) m.o[i] = { k: 'ore_copper', cave: 1 }; }
  if (n === 2 || (boss && !S.flags.ratChest)) { const c = floors.filter(i => !m.o[i] && D[i] > 8); if (c.length) { const i = c[Math.floor(R() * c.length)]; m.o[i] = { k: 'chest', tier: boss ? 4 : 3, mine: 1, warren: n }; } }
  const lvl = [0, 4, 7, 10][n];
  if (boss) { if (ratKingHome()) spawnEnemy(m, 'ratking', W / 2 * 16, H / 2 * 16 - 8, lvl); }
  else { const pool = n === 1 ? [['rat', 6], ['roach', 3], ['plaguerat', 1]] : [['rat', 4], ['plaguerat', 3], ['bigrat', 2], ['roach', 2]], cnt = n === 1 ? 9 : 13;
    for (let k = 0; k < cnt; k++) { const c = floors[Math.floor(R() * floors.length)]; if (D[c] < 7 || m.o[c]) continue; spawnEnemy(m, wpick(pool, R()), (c % W + .5) * 16, (((c / W) | 0) + .8) * 16, lvl); } }
  return m;
}
function enterWarren(n, up) {
  const m = MAPS['warren_' + n] = genWarren(n);
  const at = up && m.hole ? [(m.hole[0] + .5) * 16, (m.hole[1] + 1.8) * 16] : [m.start.x, m.start.y];
  goMap('warren_' + n, at[0], at[1], 0); showBanner(m.name);
  if (n === 3 && ratKingHome()) toast('Something huge shifts in the dark. A crown glints.', 'bad');
}
objInteract = (f => function (m, x, y, o) {
  if (o && o.act === 'k_warren') return { label: 'Climb down', fn: () => { if (!(S.flags && S.flags.warrenSeen)) { S.flags.warrenSeen = 1; toast('Scratching and squeaking come up out of the broken floor. Something has been eating the cheese.'); } enterWarren(1); } };
  if (o && o.act === 'k_wdown') return { label: 'Climb down', fn: () => enterWarren(m.warren + 1) };
  if (o && o.act === 'k_wup') return { label: 'Climb up', fn: () => { if (m.warren === 1) goMap('castle_down', 17.5 * 16, 10.8 * 16, 0); else enterWarren(m.warren - 1, true); } };
  return f(m, x, y, o);
})(objInteract);
killEnemy = (f => function (m, e) {
  const r = f.apply(this, arguments);
  if (e && e.k === 'ratking') { S.flags.ratKing = dayIndex(); toast('The Rat King falls. His crown rolls across the nest. He\'ll be back in a week, they always are.', 'good'); }
  return r;
})(killEnemy);
// the chest in the nest is only there the first time
openChest = (f => function (m, x, y, o) { if (o && o.warren === 3) S.flags.ratChest = 1; return f.apply(this, arguments); })(openChest);
MAP_N.castle_down = MAP_N.castle_down || 'Briarholt Keep · Cellars';
for (const n of [1, 2, 3]) MAP_N['warren_' + n] = WARREN_N[n];
