/* ================= World ================= */
let S = null; const MAPS = {}; let cur = null;
const SAVE_KEY = 'emberhollow_v2';
const BIOMES = ['meadow', 'forest', 'highlands', 'coast', 'frost', 'ash'];
const BIONAME = { meadow: 'Amber Meadow', forest: 'Whisperwood', highlands: 'Greystone Highlands', coast: 'Saltmarsh Coast', frost: 'Frostpeak', ash: 'Ashen Wastes' };
const BIOCOL = { meadow: '#8cc04a', forest: '#3f7a34', highlands: '#a89a7a', coast: '#e8d498', frost: '#e8f0fa', ash: '#5a4f4a' };
const dayIndex = () => (S.year - 1) * 112 + S.season * 28 + S.day;
function newState(seed) {
  const sk = {}; SK.forEach(k => sk[k] = { l: 1, xp: 0 });
  return {
    v: 2, seed: seed || (Math.floor(Math.random() * 1e9) | 1), day: 1, season: 0, year: 1, time: 360, weather: 'sun', gold: 500,
    p: { map: 'farm', x: 9.5 * 16, y: 10.5 * 16, dir: 0, hp: 100, st: 120 },
    inv: { turnip_seed: 15, potato_seed: 5, wood: 15, arrow: 0 }, invQ: {}, hot: ['hoe', 'can', 'axe', 'pick', 'rod', 'scythe', 'weapon', 'turnip_seed', 'potato_seed', null], sel: 0,
    eq: { weapon: 'wood_sword', helm: null, body: null, boots: null, shield: null, ring1: null, ring2: null },
    tools: { hoe: 1, can: 1, axe: 1, pick: 1, rod: 1, scythe: 1 }, water: 20, sk, perks: {}, pendingPerk: [],
    animals: [], nid: 1, rideId: null, mounted: false,
    stats: { harvest: 0, bought: 0, deepest: 0, fish: 0, forged: {}, bestBred: 0, cupMax: 0, kills: 0, crafted: 0, traitBred: 0, shipped: {}, caught: {}, randShards: 0 },
    qdone: {}, board: null, bin: {}, horseShop: [], buffs: [], build: { coop: 1, barn: 1, stable: 1, silo: 0, greenhouse: 0 }, silo: 0,
    friends: {}, museum: {}, pages: {}, shardsTotal: 0, shardsGiven: 0, shardRew: {}, shrines: {}, bosses: {}, flags: {}, explored: '', meteor: null, tmap: null,
    bonus: { maxhp: 0, maxst: 0, fishzone: 0, fireres: 0, atk: 0, eatHp: 0 }, mapsave: {}, music: true, sound: true, mineFloor: 1, cupWins: {},
  };
}
function newMap(id, w, h, fill) { return { id, w, h, t: new Array(w * h).fill(fill), o: new Array(w * h).fill(null), soil: {}, warps: [], bld: [], ents: [], solidB: new Uint8Array(w * h), outdoor: true, dark: false, npcs: [], poi: [], arenas: [] }; }
const inb = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;
function setT(m, x, y, t) { if (inb(m, x, y)) { m.t[y * m.w + x] = t; m.cv = (m.cv || 0) + 1; } }
function getT(m, x, y) { return inb(m, x, y) ? m.t[y * m.w + x] : 'r'; }
function getO(m, x, y) { return inb(m, x, y) ? m.o[y * m.w + x] : null; }
function setO(m, x, y, o) { if (inb(m, x, y)) m.o[y * m.w + x] = o; }
function mainOf(m, x, y) { const o = getO(m, x, y); if (o && o.k === 'part') return [o.ax, o.ay, getO(m, o.ax, o.ay)]; return [x, y, o]; }
/* multi-tile: anchor = bottom-left tile */
function putObj(m, x, y, o) {
  const D = OBJ[o.k] || {}, w = D.w || 1, h = D.h || 1;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { if (!inb(m, x + i, y - j)) return false; }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const X = x + i, Y = y - j; if (i || j) setO(m, X, Y, { k: 'part', ax: x, ay: y }); }
  setO(m, x, y, o); return true;
}
function delObj(m, x, y) { const [ax, ay, o] = mainOf(m, x, y); if (!o) return; const D = OBJ[o.k] || {}, w = D.w || 1, h = D.h || 1; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setO(m, ax + i, ay - j, null); }
function areaFree(m, x, y, w, h) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const X = x + i, Y = y - j; if (!inb(m, X, Y) || getO(m, X, Y) || TER[getT(m, X, Y)].solid || m.solidB[Y * m.w + X]) return false; } return true; }
function addB(m, x, y, w, h, kind, act) {
  const b = { x, y, w, h, kind, act, door: { x: x + Math.floor(w / 2), y: y + h - 1 } }; b.spr = buildingSpr(w, h, kind); m.bld.push(b);
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) { m.solidB[j * m.w + i] = 1; m.o[j * m.w + i] = null; }
  for (let i = -1; i <= 1; i++) { setO(m, b.door.x + i, b.door.y + 1, null); }
  return b;
}
function clearR(m, cx, cy, r, tile) { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) { if (!inb(m, x, y) || (x - cx) ** 2 + (y - cy) ** 2 > r * r + r) continue; if (getO(m, x, y)) delObj(m, x, y); if (tile && !TER[getT(m, x, y)].water) setT(m, x, y, tile); else if (TER[getT(m, x, y)].solid && !TER[getT(m, x, y)].water) setT(m, x, y, baseFor(m, x, y)); } }
function baseFor(m, x, y) { if (!m.bio) return 'g'; const b = BIOMES[m.bio[y * m.w + x]]; return b === 'frost' ? 'sn' : b === 'ash' ? 'a' : b === 'highlands' ? 'g' : 'g'; }
function border(m, gaps, kind) {
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (x < 2 || y < 2 || x > m.w - 3 || y > m.h - 3) { if (gaps.some(gp => gp(x, y))) continue; if (kind === 'r') setT(m, x, y, 'r'); else setO(m, x, y, { k: 'tree', kind: R() < .5 ? 'pine' : 'oak' }); }
}
function pond(m, cx, cy, rx, ry, water = 'w', rim = 's') {
  for (let y = cy - ry - 2; y <= cy + ry + 2; y++) for (let x = cx - rx - 2; x <= cx + rx + 2; x++) { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + (vnoise(x * .4, y * .4, 9) - .5) * .5; if (d <= 1) { setT(m, x, y, water); setO(m, x, y, null); } else if (rim && d <= 1.5 && getT(m, x, y) === 'g') { setT(m, x, y, rim); setO(m, x, y, null); } }
}
/* ---------------- Farm ---------------- */
function genFarm() {
  const W = 56, H = 44, m = newMap('farm', W, H, 'g'); R = rng(S.seed + 11); m.farm = true; m.name = 'Hollowmere Farm';
  border(m, [(x, y) => x > W - 3 && y >= 18 && y <= 19, (x, y) => y < 2 && x >= 26 && x <= 28]);
  m.bHouse = addB(m, 6, 4, 7, 5, 'house', 'house');
  addB(m, 33, 3, 6, 5, 'coop', 'coop'); addB(m, 40, 2, 7, 6, 'barn', 'barn'); addB(m, 48, 3, 6, 5, 'stable', 'stable');
  m.bGH = addB(m, 16, 3, 6, 5, 'greenhouse', 'greenhouse');
  setO(m, 14, 8, { k: 'bin', fixed: 1 }); setO(m, 23, 7, { k: 'board', fixed: 1, farmboard: 1 });
  const path = (x0, y0, x1, y1) => { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) for (let k = 0; k < 2; k++) setT(m, x, y0 + k, 'd'); for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) for (let k = 0; k < 2; k++) setT(m, x1 + k, y, 'd'); };
  path(9, 10, 9, 18); path(9, 18, W - 1, 18); path(26, 0, 26, 18); for (let x = 33; x < 54; x++) { setT(m, x, 9, 'd'); }
  // pasture
  const P = { x0: 32, y0: 10, x1: 53, y1: 16 }; m.pasture = { x0: (P.x0 + 1) * 16, y0: (P.y0 + 1) * 16, x1: P.x1 * 16, y1: P.y1 * 16 };
  for (let x = P.x0; x <= P.x1; x++) for (let y = P.y0; y <= P.y1; y++) { setO(m, x, y, null); setT(m, x, y, 'g'); if ((x === P.x0 || x === P.x1 || y === P.y0 || y === P.y1) && !((x === 42 || x === 43) && (y === P.y1 || y === P.y0))) setO(m, x, y, { k: 'fence', fixed: 1 }); else if (R() < .25) setO(m, x, y, { k: 'tgrass' }); }
  pond(m, 44, 32, 5, 4);
  for (let y = 21; y < 41; y++) for (let x = 3; x < 36; x++) {
    if (getT(m, x, y) !== 'g') continue; const r = R(), n = fbm(x * .15, y * .15, S.seed % 997);
    setO(m, x, y, r < .14 ? { k: 'weed' } : r < .19 ? { k: 'stone' } : r < .23 ? { k: 'twig' } : r < .25 ? { k: 'rock' } : r < .27 ? { k: 'tree', kind: R() < .5 ? 'oak' : 'maple' } : n > .62 && r < .5 ? { k: 'tgrass' } : null);
  }
  for (let i = 0; i < 3; i++) { const x = ri(4, 30), y = ri(24, 38); if (areaFree(m, x, y, 2, 1)) putObj(m, x, y, { k: 'log' }); }
  for (let i = 0; i < 2; i++) { const x = ri(4, 30), y = ri(24, 38); if (areaFree(m, x, y, 2, 2)) putObj(m, x, y, { k: 'boulder' }); }
  for (let y = 22; y < 41; y++) for (let x = 37; x < 53; x++) if (getT(m, x, y) === 'g' && !getO(m, x, y) && R() < .1) setO(m, x, y, R() < .5 ? { k: 'tgrass' } : { k: 'tree', kind: R() < .5 ? 'oak' : 'birch' });
  m.warps.push({ x: W - 1, y: 18, w: 1, h: 2, to: 'village', tx: 1.8 * 16, ty: 19 * 16, dir: 2 });
  m.warps.push({ x: 26, y: 0, w: 3, h: 1, to: 'wilds', tx: 60.5 * 16, ty: 146 * 16, dir: 3 });
  return m;
}
/* ---------------- Village ---------------- */
function genVillage() {
  const W = 50, H = 38, m = newMap('village', W, H, 'g'); R = rng(4321); m.name = 'Emberhollow Village';
  border(m, [(x, y) => x < 2 && y >= 18 && y <= 19, (x, y) => y < 2 && x >= 24 && x <= 26]);
  for (let y = 14; y <= 26; y++) for (let x = 4; x <= 45; x++) setT(m, x, y, 'p');
  for (let x = 0; x < 5; x++) { setT(m, x, 18, 'd'); setT(m, x, 19, 'd'); } for (let y = 0; y < 14; y++) { setT(m, 24, y, 'd'); setT(m, 25, y, 'd'); setT(m, 26, y, 'd'); }
  [[4, 6, 6, 5, 'store'], [11, 6, 6, 5, 'smith'], [28, 5, 7, 6, 'tavern'], [36, 6, 6, 5, 'stablemaster'], [4, 28, 6, 5, 'carpenter'], [36, 28, 8, 6, 'museum']].forEach(([x, y, w, h, k]) => {
    const b = addB(m, x, y, w, h, k, k); if (y < 14) for (let yy = b.door.y + 1; yy < 14; yy++) setT(m, b.door.x, yy, 'p'); else for (let yy = 27; yy < b.door.y + 2 && yy <= b.door.y + 1; yy++) setT(m, b.door.x, yy, 'p');
  });
  addB(m, 18, 6, 5, 5, 'cottage', 'cottage'); addB(m, 17, 29, 5, 5, 'cottage', 'cottage');
  for (let y = 18; y <= 21; y++) for (let x = 23; x <= 26; x++) setT(m, x, y, 'w');
  putObj(m, 30, 17, { k: 'altar', fixed: 1 }); putObj(m, 18, 17, { k: 'well', fixed: 1 }); setO(m, 33, 22, { k: 'board', fixed: 1 });
  [[5, 14], [45, 14], [5, 26], [45, 26], [21, 15], [28, 15]].forEach(([x, y]) => setO(m, x, y, { k: 'lantern', fixed: 1 }));
  for (let x = 6; x < 44; x += 3) if (!m.solidB[27 * W + x] && getT(m, x, 27) === 'g') setO(m, x, 27, { k: 'bush', fixed: 1 });
  for (let i = 0; i < 26; i++) { const x = ri(3, 46), y = ri(2, 35); if (getT(m, x, y) === 'g' && !getO(m, x, y) && !m.solidB[y * W + x] && (y < 13 || y > 27)) setO(m, x, y, R() < .3 ? { k: 'flower', v: ri(0, 4) } : { k: 'tree', kind: pickR(['oak', 'maple', 'birch']), fixed: 1 }); }
  m.npcs = [['mara', 7], ['brann', 14], ['pip', 31.5], ['odile', 39]].map(([id, x]) => ({ id, x: (x + .5) * 16, y: 13 * 16, hx: (x + .5) * 16, hy: 13 * 16 }))
    .concat([{ id: 'hale', x: 7.5 * 16, y: 34.5 * 16, hx: 7.5 * 16, hy: 34.5 * 16 }, { id: 'elias', x: 40.5 * 16, y: 35.5 * 16, hx: 40.5 * 16, hy: 35.5 * 16 }]);
  m.warps.push({ x: 0, y: 18, w: 1, h: 2, to: 'farm', tx: 54 * 16, ty: 19 * 16, dir: 1 });
  m.warps.push({ x: 24, y: 0, w: 3, h: 1, to: 'wilds', tx: 100.5 * 16, ty: 146 * 16, dir: 3 });
  return m;
}
/* ---------------- The Wilds (procedural) ---------------- */
function genWilds() {
  const W = 200, H = 150, m = newMap('wilds', W, H, 'g'), sd = S.seed % 100000; R = rng(S.seed * 7 + 1);
  m.name = 'The Wilds'; m.wild = true; m.bio = new Uint8Array(W * H); m.secrets = [];
  const J = (x, y) => [x + (R() - .5) * 24, y + (R() - .5) * 18];
  const C = [[0, 95, 128], [0, 62, 134], [1, 28, 108], [1, 34, 70], [1, 58, 98], [2, 100, 82], [2, 128, 60], [2, 80, 55], [3, 178, 100], [3, 172, 132], [3, 182, 66], [4, 60, 20], [4, 100, 16], [4, 26, 28], [5, 166, 26], [5, 146, 40]].map(([b, x, y]) => { const [a, c] = J(x, y); return [b, a, c]; });
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const wx = x + (fbm(x * .025, y * .025, sd + 11) - .5) * 46, wy = y + (fbm(x * .025, y * .025, sd + 23) - .5) * 46;
    let best = 0, bd = 1e9; for (const [b, cx, cy] of C) { const d = (wx - cx) ** 2 + (wy - cy) ** 2; if (d < bd) { bd = d; best = b; } }
    if (y > H - 16 && ((x > 44 && x < 76) || (x > 84 && x < 116))) best = 0;
    m.bio[y * W + x] = best; m.t[y * W + x] = best === 4 ? 'sn' : best === 5 ? 'a' : 'g';
    if (best === 2 && fbm(x * .07, y * .07, sd + 31) > .6) m.t[y * W + x] = 'st';
  }
  const B = (x, y) => BIOMES[m.bio[y * W + x]];
  // ocean
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (B(x, y) !== 'coast') continue; const edge = W - (13 + fbm(x * .05, y * .05, sd + 41) * 18); if (x > edge) setT(m, x, y, 'w'); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (B(x, y) !== 'coast' || getT(m, x, y) === 'w') continue; let near = false; for (let k = 1; k <= 6 && !near; k++) if (getT(m, x + k, y) === 'w' || getT(m, x, y + (k % 3)) === 'w') near = true; if (near) setT(m, x, y, 's'); }
  // cliffs
  for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) { const b = B(x, y); if (b !== 'highlands' && b !== 'frost' && b !== 'ash') continue; const e = fbm(x * .055, y * .055, sd + 50), rid = 1 - Math.abs(2 * e - 1); if (rid > (b === 'highlands' ? .88 : .91)) setT(m, x, y, 'r'); }
  // lakes
  for (let y = 4; y < H - 4; y++) for (let x = 4; x < W - 4; x++) { const b = B(x, y), n = fbm(x * .07, y * .07, sd + 70); if (n < .7) continue; if (b === 'meadow' || b === 'forest') setT(m, x, y, 'w'); else if (b === 'frost') setT(m, x, y, n > .78 && hsh(x, y, sd) < .25 ? 'w' : 'i'); else if (b === 'ash' && n > .72) setT(m, x, y, 'l'); }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (getT(m, x, y) === 'w' && B(x, y) !== 'coast') for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const t = getT(m, x + dx, y + dy); if (t === 'g' && R() < .5) setT(m, x + dx, y + dy, 's'); }
  // river
  let rx = 30 + R() * 30, phase = R() * 6; for (let y = 0; y < H; y++) { rx += Math.sin(y / 9 + phase) * .9 + (R() - .5) * .8; rx = clamp(rx + (y > 90 ? -.18 : 0), 8, 90); const w = 2 + (y % 17 < 9 ? 1 : 0); for (let k = 0; k < w; k++) { const x = Math.round(rx) + k; if (!inb(m, x, y)) continue; setT(m, x, y, B(x, y) === 'frost' ? 'i' : 'w'); } }
  m.river = true;
  // borders
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 2 || y < 2 || x > W - 3 || y > H - 3) { if (getT(m, x, y) === 'w') continue; if (y > H - 3 && ((x >= 58 && x <= 62) || (x >= 98 && x <= 102))) { setT(m, x, y, 'd'); continue; } const b = B(x, y); if (b === 'meadow' || b === 'forest' || b === 'coast') setO(m, x, y, { k: 'tree', kind: b === 'coast' ? 'palm' : R() < .5 ? 'pine' : 'oak' }); else setT(m, x, y, 'r'); }
  // scatter
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const t = getT(m, x, y); if (TER[t].solid || t === 'i' || getO(m, x, y)) continue; const b = B(x, y), r = R(), i = y * W + x;
    const dense = fbm(x * .09, y * .09, sd + 90), gr = fbm(x * .12, y * .12, sd + 95);
    let o = null;
    if (b === 'meadow') o = r < .03 ? { k: 'tree', kind: pickR(['oak', 'oak', 'maple', 'birch']) } : r < .042 ? { k: 'bush', ripe: 0 } : r < .08 ? { k: 'flower', v: ri(0, 4) } : (gr > .58 && r < .6) ? { k: 'tgrass' } : r < .09 ? { k: 'rock' } : r < .095 ? { k: 'twig' } : null;
    else if (b === 'forest') o = (dense > .47 && r < .42) || r < .05 ? { k: 'tree', kind: pickR(['oak', 'maple', 'birch', 'pine', 'pine']) } : r < .07 ? { k: 'bush', ripe: 0 } : r < .1 ? { k: 'fern' } : r < .11 ? { k: 'mushroom' } : (gr > .55 && r < .35) ? { k: 'tgrass' } : r < .115 ? { k: 'stump' } : null;
    else if (b === 'highlands') o = r < .028 ? { k: wpick([['rock', 50], ['ore_copper', 20], ['ore_iron', 15], ['ore_silver', 10], ['ore_coal', 8], ['ore_gold', 4], ['ore_gem', 1.5]], R()) } : r < .05 ? { k: 'tree', kind: 'pine' } : (gr > .6 && r < .4) ? { k: 'tgrass' } : r < .055 ? { k: 'flower', v: ri(0, 4) } : null;
    else if (b === 'coast') o = t === 's' ? (r < .02 ? { k: 'tree', kind: 'palm' } : r < .03 ? { k: 'shell' } : r < .034 ? { k: 'rock' } : null) : (r < .03 ? { k: 'tree', kind: pickR(['palm', 'oak']) } : (gr > .55 && r < .4) ? { k: 'tgrass' } : null);
    else if (b === 'frost') o = r < .06 ? { k: 'tree', kind: 'pine', snow: 1 } : r < .068 ? { k: 'crystalnode' } : r < .078 ? { k: 'ore_frost' } : r < .086 ? { k: wpick([['ore_iron', 2], ['ore_silver', 2], ['rock', 3]], R()), v: 'S' } : null;
    else if (b === 'ash') o = r < .03 ? { k: 'tree', kind: 'dead' } : r < .042 ? { k: 'ore_obsidian' } : r < .045 ? { k: 'ore_adamant' } : r < .05 ? { k: 'ore_gold' } : r < .06 ? { k: 'rock', v: 'A' } : null;
    if (o) m.o[i] = o;
  }
  for (let n = 0; n < 60; n++) { const x = ri(4, W - 6), y = ri(4, H - 6), b = B(x, y); if ((b === 'forest' || b === 'meadow') && areaFree(m, x, y, 2, 1)) putObj(m, x, y, { k: 'log' }); else if ((b === 'highlands' || b === 'meadow') && areaFree(m, x, y, 2, 2)) putObj(m, x, y, { k: 'boulder' }); }
  // ---- POIs ----
  const spot = (bio, r, tries = 600, near) => { for (let k = 0; k < tries; k++) { let x, y; if (near) { x = near[0] + ri(-near[2], near[2]); y = near[1] + ri(-near[2], near[2]); } else { x = ri(r + 4, W - r - 5); y = ri(r + 4, H - r - 18); } if (!inb(m, x, y) || B(x, y) !== bio) continue; if (m.poi.some(p => Math.abs(p.x - x) < r + 7 && Math.abs(p.y - y) < r + 7)) continue; let ok = true; for (let j = -r; j <= r && ok; j++) for (let i = -r; i <= r && ok; i++) { const t = getT(m, x + i, y + j); if (TER[t].water || TER[t].lava || B(x + i, y + j) !== bio) ok = false; } if (ok) return [x, y]; } return null; };
  const poi = (type, x, y, extra) => { const p = Object.assign({ type, x, y }, extra || {}); m.poi.push(p); return p; };
  const entF = [60, H - 3], entV = [100, H - 3];
  const cross = spot('meadow', 3, 800, [82, 128, 10]) || [82, 128]; clearR(m, cross[0], cross[1], 3); setO(m, cross[0] + 1, cross[1] - 1, { k: 'sign', text: 'North: Greystone Highlands and the Old Mine. West: Whisperwood. East: Saltmarsh Coast.' }); poi('cross', cross[0], cross[1]);
  const merch = spot('meadow', 3, 800) || [cross[0] - 12, cross[1] - 4]; clearR(m, merch[0], merch[1], 3); poi('merchant', merch[0], merch[1]); m.merchant = merch;
  // mine entrance
  const mineS = spot('highlands', 4) || [100, 80]; clearR(m, mineS[0], mineS[1], 4); const mb = addB(m, mineS[0] - 2, mineS[1] - 4, 5, 4, 'mine', 'mine'); m.mineDoor = mb.door; poi('mine', mb.door.x, mb.door.y);
  for (let x = mineS[0] - 4; x <= mineS[0] + 4; x++) for (let y = mineS[1] - 7; y <= mineS[1] - 5; y++) if (!m.solidB[y * W + x]) setT(m, x, y, 'r');
  // arenas
  const arenas = {};
  for (const b of ['highlands', 'coast', 'frost', 'ash']) {
    const s = spot(b, 7) || spot(b, 5) || [W / 2, H / 2]; clearR(m, s[0], s[1], 7, b === 'coast' ? 's' : b === 'frost' ? 'sn' : b === 'ash' ? 'a' : 'st'); arenas[b] = s; m.arenas.push({ bio: b, boss: WBOSS[b], x: s[0], y: s[1] }); poi('arena', s[0], s[1], { boss: WBOSS[b] });
    if (b === 'highlands') { [[-5, -4], [4, -4], [-6, 3], [5, 3]].forEach(([dx, dy]) => putObj(m, s[0] + dx, s[1] + dy, { k: 'tent' })); setO(m, s[0], s[1] - 5, { k: 'campfire', fixed: 1 }); setO(m, s[0] + 1, s[1] - 6, { k: 'chest', id: 'camp', tier: 3 }); }
    if (b === 'ash') { for (let a = 0; a < 6.28; a += .35) { const x = Math.round(s[0] + Math.cos(a) * 8), y = Math.round(s[1] + Math.sin(a) * 7); if (R() < .6) setT(m, x, y, 'l'); } }
    if (b === 'frost') for (let a = 0; a < 6.28; a += .7) setO(m, Math.round(s[0] + Math.cos(a) * 6), Math.round(s[1] + Math.sin(a) * 6), { k: 'crystalnode' });
  }
  // shrines
  for (const b of ['forest', 'coast', 'frost', 'ash']) { const s = spot(b, 3) || [W / 2, H / 2]; clearR(m, s[0], s[1], 3, b === 'forest' ? 'p' : null); putObj(m, s[0], s[1], { k: 'shrine', bio: b }); poi('shrine', s[0], s[1], { bio: b }); if (b === 'forest') { setO(m, s[0] - 2, s[1] + 1, { k: 'flower', v: 1 }); setO(m, s[0] + 3, s[1] + 1, { k: 'flower', v: 2 }); } }
  // hidden caves
  const caveDef = { forest: ['bramble', 1], highlands: ['cracked', 2], frost: ['iceboulder', 2], ash: ['obsboulder', 2] };
  for (const b in caveDef) {
    const s = spot(b, 4) || spot(b, 3); if (!s) continue; const [cx, cy] = s;
    for (let y = cy - 4; y <= cy + 4; y++) for (let x = cx - 4; x <= cx + 4; x++) { if (getO(m, x, y)) delObj(m, x, y); const d = Math.max(Math.abs(x - cx), Math.abs(y - cy)); if (d >= 3) { if (b === 'forest') { setT(m, x, y, 'g'); setO(m, x, y, { k: 'tree', kind: 'pine' }); } else setT(m, x, y, 'r'); } else setT(m, x, y, baseFor(m, x, y)); }
    putObj(m, cx, cy - 1, { k: 'cave', id: 'cave_' + b, bio: b });
    const [bk, sz] = caveDef[b];
    if (sz === 2) { for (let x = cx; x <= cx + 1; x++) for (let y = cy + 2; y <= cy + 4; y++) { setT(m, x, y, baseFor(m, x, y)); setO(m, x, y, null); } putObj(m, cx, cy + 3, { k: bk }); }
    else { for (let x = cx; x <= cx + 1; x++) for (let y = cy + 2; y <= cy + 4; y++) { setT(m, x, y, 'g'); setO(m, x, y, { k: 'bramble' }); } }
    poi('cave', cx, cy, { bio: b, hidden: 1 });
  }
  // secret grove
  const gv = spot('forest', 5, 800);
  if (gv) {
    const [gx, gy] = gv; for (let y = gy - 5; y <= gy + 5; y++) for (let x = gx - 5; x <= gx + 5; x++) { if (getO(m, x, y)) delObj(m, x, y); setT(m, x, y, 'g'); const d = Math.max(Math.abs(x - gx), Math.abs(y - gy)); if (d === 5 || d === 4) setO(m, x, y, { k: d === 4 && (x + y) % 2 ? 'ancient' : 'tree', kind: 'oak' }); else if (R() < .25) setO(m, x, y, { k: 'flower', v: ri(0, 4) }); }
    for (let y = gy - 5; y <= gy + 5; y++) for (let x = gx - 5; x <= gx + 5; x++) { const d = Math.max(Math.abs(x - gx), Math.abs(y - gy)); if (d === 5 && getO(m, x, y)) setO(m, x, y, { k: 'ancient', kind: 'oak' }); }
    setO(m, gx, gy, { k: 'chest', id: 'grove', tier: 4 }); setO(m, gx - 2, gy + 1, { k: 'shard', id: 'sh_grove' }); setO(m, gx + 2, gy - 1, { k: 'page', id: 11 }); setO(m, gx, gy - 2, { k: 'ftree', tree: 'cherry', age: 30 });
    poi('grove', gx, gy, { hidden: 1 });
  }
  // ruins + buried chest
  const ru = spot('meadow', 5) || spot('highlands', 5);
  if (ru) { const [x0, y0] = ru; clearR(m, x0, y0, 5, 'g'); for (let i = -4; i <= 4; i++) { if (R() < .7) setO(m, x0 + i, y0 - 4, { k: 'ruinwall' }); if (R() < .6) setO(m, x0 + i, y0 + 4, { k: 'ruinwall' }); if (R() < .6) setO(m, x0 - 4, y0 + i, { k: 'ruinwall' }); if (R() < .6) setO(m, x0 + 4, y0 + i, { k: 'ruinwall' }); } setO(m, x0, y0 - 1, { k: 'statue', text: 'A knight, sword lowered. The plaque reads: ALDREN, WHO WENT DOWN.' }); setO(m, x0 + 2, y0 + 2, { k: 'buried', id: 'ruins' }); setO(m, x0 - 2, y0 + 1, { k: 'page', id: 5 }); setO(m, x0 - 3, y0 - 2, { k: 'grave' }); poi('ruins', x0, y0); }
  // hut + dock
  const hut = spot('coast', 4, 900); if (hut) { const [hx, hy] = hut; clearR(m, hx, hy, 4, 's'); const hb = addB(m, hx - 2, hy - 3, 4, 3, 'hut', 'fisher'); m.npcs.push({ id: 'corwin', x: (hx + 2.5) * 16, y: (hy + 1) * 16, hx: (hx + 2.5) * 16, hy: (hy + 1) * 16 }); let dx = hx + 2; while (dx < W - 2 && getT(m, dx, hy) !== 'w') dx++; for (let k = 0; k < 6 && dx + k < W; k++) { setT(m, dx + k, hy, 'b'); setT(m, dx + k, hy + 1, 'b'); } m.dock = [dx + 5, hy]; poi('hut', hx, hy); setO(m, hx - 3, hy + 1, { k: 'page', id: 4 }); }
  // wreck
  const wk = spot('coast', 4, 900); if (wk) { const [x, y] = wk; clearR(m, x, y, 4, 's'); putObj(m, x - 2, y, { k: 'wreck' }); setO(m, x + 3, y + 1, { k: 'chest', id: 'wreck', tier: 3 }); setO(m, x - 3, y + 2, { k: 'shard', id: 'sh_wreck' }); poi('wreck', x, y); }
  // frost cabin
  const cab = spot('frost', 4, 900); if (cab) { const [x, y] = cab; clearR(m, x, y, 4, 'sn'); addB(m, x - 2, y - 3, 4, 3, 'cabin', 'cabin'); setO(m, x + 2, y + 1, { k: 'chest', id: 'cabin', tier: 4 }); setO(m, x - 2, y + 1, { k: 'page', id: 7 }); setO(m, x, y + 2, { k: 'campfire', fixed: 1 }); poi('cabin', x, y); }
  // fairy ring
  const fr = spot('forest', 3, 900); if (fr) { const [x, y] = fr; clearR(m, x, y, 3, 'g'); setO(m, x, y, { k: 'fairy', id: 'fairy' }); poi('fairy', x, y, { hidden: 1 }); }
  // pages scattered
  const pagePlaces = [[0, cross, 2], [1, [mb.door.x + 3, mb.door.y + 1], 1], [2, null, 0, 'forest'], [3, null, 0, 'forest'], [6, null, 0, 'meadow'], [8, null, 0, 'ash'], [9, null, 0, 'ash']];
  pagePlaces.forEach(([id, at, off, bio]) => { let p = at ? [at[0] + off, at[1] + off] : spot(bio, 1); if (p) { if (getO(m, p[0], p[1])) delObj(m, p[0], p[1]); setO(m, p[0], p[1], { k: 'page', id }); } });
  // hidden shards (in tight places: ringed by trees/rocks)
  const shardB = ['meadow', 'forest', 'forest', 'highlands', 'coast', 'frost', 'ash', 'highlands'];
  shardB.forEach((b, i) => { const p = spot(b, 2, 900); if (!p) return; const [x, y] = p; for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { if (getO(m, x + k, y + j)) delObj(m, x + k, y + j); if (j || k) setO(m, x + k, y + j, b === 'highlands' || b === 'ash' ? { k: 'rock', v: b === 'ash' ? 'A' : null } : b === 'frost' ? { k: 'crystalnode' } : b === 'coast' ? { k: 'tree', kind: 'palm' } : { k: 'bush', ripe: 0 }); } setO(m, x, y, { k: 'shard', id: 'sh_h' + i }); m.secrets.push([x, y]); });
  // scattered chests
  ['meadow', 'forest', 'highlands', 'coast', 'frost', 'ash'].forEach((b, i) => { const p = spot(b, 2, 600); if (p) { clearR(m, p[0], p[1], 1); setO(m, p[0], p[1], { k: 'chest', id: 'w' + i, tier: [1, 2, 3, 3, 4, 5][i] }); for (let k = 0; k < 4; k++) { const a = k / 4 * 6.28 + .4; const X = Math.round(p[0] + Math.cos(a) * 2), Y = Math.round(p[1] + Math.sin(a) * 2); if (!getO(m, X, Y) && !TER[getT(m, X, Y)].solid) setO(m, X, Y, { k: b === 'ash' ? 'rock' : 'bush', v: b === 'ash' ? 'A' : null, ripe: 0 }); } } });
  // paths
  const P = k => m.poi.find(p => p.type === k);
  const links = [[entV, cross], [entF, cross], [cross, merch], [cross, [mb.door.x, mb.door.y + 1]], [[mb.door.x, mb.door.y + 1], arenas.highlands], [cross, P('ruins') ? [P('ruins').x, P('ruins').y + 5] : cross],
  [cross, P('hut') ? [P('hut').x, P('hut').y + 2] : cross], [P('hut') ? [P('hut').x, P('hut').y + 2] : cross, arenas.coast], [P('hut') ? [P('hut').x, P('hut').y + 2] : cross, P('wreck') ? [P('wreck').x, P('wreck').y + 3] : cross],
  [[mb.door.x, mb.door.y + 1], P('cabin') ? [P('cabin').x, P('cabin').y + 3] : arenas.frost], [P('cabin') ? [P('cabin').x, P('cabin').y + 3] : arenas.frost, arenas.frost], [[mb.door.x, mb.door.y + 1], arenas.ash]];
  m.poi.filter(p => p.type === 'shrine').forEach(p => links.push([p.bio === 'forest' || p.bio === 'coast' ? cross : [mb.door.x, mb.door.y + 1], [p.x, p.y + 2]]));
  links.forEach(([a, b]) => a && b && carvePath(m, a, b));
  m.warps.push({ x: 58, y: H - 1, w: 5, h: 1, to: 'farm', tx: 27 * 16, ty: 2.2 * 16, dir: 0 });
  m.warps.push({ x: 98, y: H - 1, w: 5, h: 1, to: 'village', tx: 25.5 * 16, ty: 2.2 * 16, dir: 0 });
  return m;
}
function carvePath(m, a, b) {
  let [x, y] = a.map(Math.round); const [tx, ty] = b.map(Math.round); let n = 0;
  while ((x !== tx || y !== ty) && n++ < 2000) {
    const dx = tx - x, dy = ty - y, wob = vnoise(x * .2, y * .2, 333) - .5;
    if (Math.abs(dx) > 0 && (Math.abs(dy) === 0 || R() < Math.abs(dx) / (Math.abs(dx) + Math.abs(dy)) + wob * .3)) x += Math.sign(dx); else if (dy) y += Math.sign(dy);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const X = x + i, Y = y + j; if (!inb(m, X, Y) || m.solidB[Y * m.w + X]) continue; const t = getT(m, X, Y);
      if (t === 'w' || t === 'l') setT(m, X, Y, 'b'); else if (t === 'i' || t === 'b') { } else if (t === 'r') setT(m, X, Y, 'd'); else if (t !== 's' && t !== 'p') setT(m, X, Y, 'd');
      const o = getO(m, X, Y); if (o && !['shrine', 'cave', 'chest', 'page', 'shard', 'sign', 'tent', 'wreck', 'statue', 'campfire'].includes(mainOf(m, X, Y)[2].k)) delObj(m, X, Y);
    }
  }
}
/* ---------------- Greenhouse interior ---------------- */
function genGreenhouse() {
  const m = newMap('greenhouse', 16, 13, 'f'); m.farm = true; m.noSeason = true; m.outdoor = false; m.indoor = true; m.name = 'Greenhouse';
  for (let x = 0; x < 16; x++) { setT(m, x, 0, 'x'); setT(m, x, 1, 'x'); } for (let y = 0; y < 13; y++) { setT(m, 0, y, 'x'); setT(m, 15, y, 'x'); }
  for (let y = 3; y < 10; y++) for (let x = 2; x < 14; x++) setT(m, x, y, 'g');
  m.theme = 'earth'; m.warps.push({ x: 7, y: 12, w: 2, h: 1, to: 'farm', tx: 19.5 * 16, ty: 9.4 * 16, dir: 0 }); m.start = { x: 8 * 16, y: 11 * 16 };
  return m;
}
/* ---------------- Mines & caves ---------------- */
function caveCore(m, W, H, seed, boss) {
  R = rng(seed);
  if (boss) { for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const d = ((x - W / 2) / (W / 2 - 1.5)) ** 2 + ((y - H / 2) / (H / 2 - 1.5)) ** 2; if (d < 1) setT(m, x, y, 'c'); } return; }
  let a = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) a.push((x === 0 || y === 0 || x === W - 1 || y === H - 1) ? 1 : (R() < .44 ? 1 : 0));
  for (let it = 0; it < 4; it++) { const b = a.slice(); for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { let c = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) c += a[(y + j) * W + x + i]; b[y * W + x] = c >= 5 ? 1 : 0; } a = b; }
  const seen = new Int32Array(W * H).fill(-1); let best = -1, bestN = 0, reg = 0;
  for (let i = 0; i < W * H; i++) if (!a[i] && seen[i] < 0) { let q = [i], cnt = 0; seen[i] = reg; while (q.length) { const c = q.pop(); cnt++; const cx = c % W, cy = (c / W) | 0;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = cx + dx, ny = cy + dy, ni = ny * W + nx; if (nx >= 0 && ny >= 0 && nx < W && ny < H && !a[ni] && seen[ni] < 0) { seen[ni] = reg; q.push(ni); } }); } if (cnt > bestN) { bestN = cnt; best = reg; } reg++; }
  for (let i = 0; i < W * H; i++) m.t[i] = (!a[i] && seen[i] === best) ? 'c' : 'x';
}
function bfsFar(m, start) { const W = m.w, D = new Int32Array(m.w * m.h).fill(-1); let q = [start], far = start; D[start] = 0; while (q.length) { const nq = []; for (const c of q) { const cx = c % W, cy = (c / W) | 0;[[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const ni = (cy + dy) * W + cx + dx; if (m.t[ni] === 'c' && D[ni] < 0) { D[ni] = D[c] + 1; nq.push(ni); if (D[ni] > D[far]) far = ni; } }); } q = nq; } return [D, far]; }
function genMine(n) {
  const bossK = MINE_BOSS[n], th = n > 40 ? pickR(['earth', 'ice', 'magma', 'void']) : MINE_THEME(n), W = bossK ? 28 : 32, H = bossK ? 22 : 24, m = newMap('mine', W, H, 'x');
  m.mine = n; m.dark = true; m.outdoor = false; m.theme = th; m.name = 'The Deep, floor ' + n;
  caveCore(m, W, H, n * 9973 + dayIndex() * 31, !!bossK);
  if (bossK && th === 'magma') for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const d = ((x - W / 2) / (W / 2 - 1.5)) ** 2 + ((y - H / 2) / (H / 2 - 1.5)) ** 2; if (d > .8 && d < 1) setT(m, x, y, 'l'); }
  const floors = []; for (let i = 0; i < W * H; i++) if (m.t[i] === 'c') floors.push(i);
  const startI = bossK ? (H - 4) * W + Math.floor(W / 2) : floors[Math.floor(R() * floors.length)];
  const sx = startI % W, sy = (startI / W) | 0; m.t[startI] = 'c'; setT(m, sx, sy + 1, 'c'); setO(m, sx, sy, { k: 'upladder' }); m.start = { x: (sx + .5) * 16, y: (sy + 1.6) * 16 };
  const [D, far] = bfsFar(m, startI);
  if (!bossK) setO(m, far % W, (far / W) | 0, { k: 'ladder' });
  const w = n < 10 ? [['rock', 10], ['ore_coal', 2.5], ['ore_copper', 5], ['ore_iron', n >= 4 ? 3 : 0], ['ore_gem', .5]] : n < 20 ? [['rock', 9], ['ore_coal', 3], ['ore_iron', 3], ['ore_silver', 3], ['ore_frost', n >= 14 ? 2 : 0], ['crystalnode', 2], ['ore_gem', .8]]
    : n < 30 ? [['rock', 9], ['ore_coal', 3], ['ore_gold', 3], ['ore_mythril', 2.5], ['ore_obsidian', n >= 24 ? 2 : 0], ['ore_gem', 1]] : [['rock', 8], ['ore_mythril', 2], ['ore_adamant', 3], ['ore_obsidian', 2], ['ore_gem', 1.4], ['ore_star', n >= 35 ? .6 : 0]];
  if (!bossK) for (const i of floors) { if (m.o[i] || D[i] < 3) continue; if (R() < .21) m.o[i] = { k: wpick(w, R()), cave: 1 }; else if (R() < .004) m.o[i] = { k: 'fg', item: th === 'void' ? 'purple_shroom' : 'cave_crystal' }; }
  if (!bossK && (R() < .12 + (hasPerk('prospector') ? .15 : 0) || n % 5 === 3)) { const i = floors[Math.floor(R() * floors.length)]; if (!m.o[i] && D[i] > 6) m.o[i] = { k: 'chest', tier: Math.min(6, 1 + Math.floor(n / 8)), mine: 1 }; }
  if (!bossK && n % 3 === 0) { for (let tries = 0; tries < 40; tries++) { const i = floors[Math.floor(R() * floors.length)], x = i % W, y = (i / W) | 0; if (D[i] < 5) continue; let ok = true; for (let j = 0; j < 2; j++) for (let k = 0; k < 3; k++) if (getT(m, x + k, y + j) !== 'c' || getO(m, x + k, y + j)) ok = false; if (ok) { for (let j = 0; j < 2; j++) for (let k = 0; k < 3; k++) setT(m, x + k, y + j, th === 'magma' ? 'l' : 'w'); break; } } }
  m.fishLoc = th === 'ice' ? 'mineice' : th === 'magma' ? 'minelava' : th === 'void' ? 'minevoid' : 'mine';
  if (bossK) spawnEnemy(m, bossK, W / 2 * 16, H / 2 * 16 - 8, n);
  else { const pool = MINE_EN[th], cnt = 5 + Math.floor(n / 3); for (let i = 0; i < cnt; i++) { const c = floors[Math.floor(R() * floors.length)]; if (D[c] < 7 || m.o[c]) continue; spawnEnemy(m, wpick(pool, R()), (c % W + .5) * 16, (((c / W) | 0) + .8) * 16, n); } }
  return m;
}
function genCave(id, bio) {
  const W = 30, H = 22, m = newMap(id, W, H, 'x'), th = { forest: 'earth', highlands: 'earth', frost: 'ice', ash: 'magma' }[bio];
  m.cave = 1; m.dark = true; m.outdoor = false; m.theme = th; m.name = 'Hidden Cave'; m.fishLoc = 'mine';
  caveCore(m, W, H, S.seed + id.length * 991, false);
  const floors = []; for (let i = 0; i < W * H; i++) if (m.t[i] === 'c') floors.push(i);
  R = rng(S.seed + id.length * 7); const startI = floors[Math.floor(R() * floors.length)], sx = startI % W, sy = (startI / W) | 0; setT(m, sx, sy + 1, 'c'); setO(m, sx, sy, { k: 'upladder', back: bio }); m.start = { x: (sx + .5) * 16, y: (sy + 1.6) * 16 };
  const [D, far] = bfsFar(m, startI); setO(m, far % W, (far / W) | 0, { k: 'chest', id: id, tier: { forest: 3, highlands: 4, frost: 5, ash: 6 }[bio] });
  const fx = far % W, fy = (far / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (getT(m, fx + dx, fy + dy) === 'c' && !getO(m, fx + dx, fy + dy)) { setO(m, fx + dx, fy + dy, { k: 'shard', id: 'sh_' + id }); break; }
  if (bio === 'forest' || bio === 'ash') { const i = floors.find(i => D[i] > 8 && !m.o[i]); if (i !== undefined) m.o[i] = { k: 'page', id: bio === 'forest' ? 3 : 10 }; }
  const ores = { forest: [['ore_copper', 3], ['ore_iron', 2], ['ore_gem', 1]], highlands: [['ore_silver', 3], ['ore_gold', 2], ['ore_gem', 1]], frost: [['ore_frost', 3], ['crystalnode', 2], ['ore_gem', 1]], ash: [['ore_adamant', 2], ['ore_obsidian', 3], ['ore_star', .5], ['ore_gem', 1]] }[bio];
  for (const i of floors) if (!m.o[i] && D[i] > 3 && R() < .12) m.o[i] = { k: wpick(ores, R()), cave: 1 };
  const pool = { forest: [['slime', 2], ['bat', 2], ['skeleton', 2]], highlands: [['skeleton', 3], ['bat', 2], ['rockcrab', 2]], frost: [['iceslime', 2], ['frostbat', 2], ['wraith', 2]], ash: [['imp', 2], ['firebat', 2], ['shade', 2]] }[bio];
  for (let i = 0; i < 9; i++) { const c = floors[Math.floor(R() * floors.length)]; if (D[c] > 6 && !m.o[c]) spawnEnemy(m, wpick(pool, R()), (c % W + .5) * 16, (((c / W) | 0) + .8) * 16, { forest: 4, highlands: 8, frost: 14, ash: 22 }[bio]); }
  return m;
}
function spawnEnemy(m, k, x, y, lvl) {
  const E = EN[k], sc = 1 + (lvl || 0) * .045;
  const e = { type: 'enemy', k, x, y, hp: Math.round(E.hp * sc), mhp: Math.round(E.hp * sc), atk: Math.round(E.atk * sc), lvl: lvl || 0, t: Math.random() * 2, vx: 0, vy: 0, kb: 0, dir: 1, ai: { t: Math.random() * 2, phase: 0, cd: {} }, st: {}, hx: x, hy: y };
  m.ents.push(e); return e;
}
/* ---------------- persistence ---------------- */
const PERSIST = ['farm', 'village', 'wilds', 'greenhouse'];
function packO(o) { const out = []; for (let i = 0; i < o.length; i++) if (o[i]) out.push(i, o[i]); return out; }
function unpackO(m, arr) { m.o = new Array(m.w * m.h).fill(null); for (let i = 0; i < arr.length; i += 2) m.o[arr[i]] = arr[i + 1]; }
function initMaps() {
  MAPS.farm = genFarm(); MAPS.village = genVillage(); MAPS.wilds = genWilds(); MAPS.greenhouse = genGreenhouse();
  for (const id of PERSIST) { const ms = S.mapsave[id]; if (ms) { unpackO(MAPS[id], ms.o); if (ms.soil) MAPS[id].soil = ms.soil; } }
  if (!S.explored || S.explored.length !== 50 * 38) S.explored = '0'.repeat(50 * 38);
  EXPL = S.explored.split('').map(Number);
}
let EXPL = [];
function explorePct() { if (!EXPL.length) return 0; return Math.round(EXPL.reduce((a, b) => a + b, 0) / EXPL.length * 100); }
function saveGame() {
  if (!S) return false;
  for (const id of PERSIST) S.mapsave[id] = { o: packO(MAPS[id].o), soil: MAPS[id].soil };
  S.explored = EXPL.join('');
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch (e) { return false; }
}
function loadGame() { try { const s = localStorage.getItem(SAVE_KEY); if (!s) return null; const o = JSON.parse(s); return o && o.v === 2 ? o : null; } catch (e) { return null; } }
window.__save = () => { if (S && cur && PERSIST.includes(cur.id)) saveGame(); };
