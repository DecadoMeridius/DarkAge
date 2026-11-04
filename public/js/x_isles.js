/* ================= The sailboat and the mystical isles (asked 2026-11-04) =================
   - The sailboat: commissioned at Perrin's Chandlery in Saltmere (a Shipwright tab: gold, hardwood, mangrove wood, cloth,
     iron bars), ready the next morning, moored at the end of Saltmere's pier (`sailboat` object on the Wilds, drawn with
     the ferry's sprite). Using it opens the sea chart; sailing takes an hour or two of the day.
   - Five isles off the coast (ISLES), each its own small map 'isle_<id>' generated from the world seed and saved with the
     game (in PERSIST): a theme of ground, trees, rocks and ores, its own forage, its own fish (loc 'isle_<id>'), ruins with
     treasure (tier-6 chests '<map>_c<n>' that restock a week after opening, x_wildregrow.js), strong monsters (a biome
     each, levels 42-52, palette swaps of existing art) and a guardian in an arena that returns a week after it falls.
     A moored boat at each isle's pier sails on or home.
   - Atmosphere: soft motes drift over the isles in their colour. */

/* ---- goods ---- */
const ISLE_ITEMS = [   // id, name, type, price, shape, colour, extra
  ['moonpearl', 'Moonpearl', 'gem', 950, 'gem', '#e8e8ff'], ['star_coral', 'Star Coral', 'forage', 260, 'leaf', '#ff9ad0'], ['moon_kelp', 'Moon Kelp', 'forage', 140, 'leaf', '#9ad8ff'],
  ['ember_coral', 'Ember Coral', 'forage', 280, 'leaf', '#ff6a2a'], ['flamefruit', 'Flamefruit', 'forage', 320, 'gem', '#ff8a1a'], ['glowcap', 'Glowcap', 'forage', 340, 'mush', '#7affd8'],
  ['mistwood_branch', 'Mistwood Branch', 'mat', 150, 'log', '#a8a8c8'], ['sea_glass', 'Sea Glass', 'forage', 230, 'gem', '#7ad8c8'], ['frost_pearl', 'Frost Pearl', 'gem', 1150, 'gem', '#bfe8ff'],
  ['relic_coin', 'Relic Coin', 'loot', 600, 'coin', '#d8b040'], ['crown_shard', 'Crown Shard', 'loot', 1500, 'shard', '#ffd040'],
  ['siren_scale', 'Siren Scale', 'loot', 380, 'shard', '#6ad8c8'], ['coral_core', 'Coral Core', 'loot', 520, 'gem', '#ff7a9a'], ['cinder_scale', 'Cinder Scale', 'loot', 420, 'shard', '#ff5a2a'],
  ['wisp_essence', 'Wisp Essence', 'loot', 450, 'bottle', '#c8f0ff'], ['frost_fang', 'Frost Fang', 'loot', 400, 'shard', '#d8f0ff'], ['drowned_crest', 'Drowned Crest', 'loot', 800, 'artifact', '#4a8a8a'],
  ['leviathan_eye', 'Leviathan Eye', 'loot', 6000, 'gem', '#9a9aff'], ['atoll_heart', 'Atoll Heart', 'loot', 6500, 'gem', '#ff5a1a'], ['mist_crown', 'Mist Crown', 'loot', 6200, 'crown', '#c8e0e8'],
  ['glass_heart', 'Glass Heart', 'loot', 6800, 'gem', '#bfe8ff'], ['drowned_crown', 'Drowned Crown', 'loot', 9000, 'crown', '#d8b040'],
];
for (const [id, n, t, p, sh, c] of ISLE_ITEMS) if (!IT[id]) I(id, n, t, p, sh, c, null, t === 'forage' ? { eat: [Math.round(p / 9), Math.round(p / 5)] } : {});
const ISLE_FISH = [   // id, name, price, colour, isle, difficulty, motion
  ['moonray', 'Moonray', 240, '#c8c8ff', 'moonreef', 3, 'smooth'], ['starfin', 'Starfin', 300, '#ffd0ff', 'moonreef', 4, 'dart'],
  ['magma_snapper', 'Magma Snapper', 280, '#ff6a3a', 'emberwhorl', 3, 'dart'], ['ash_eel', 'Ash Eel', 320, '#5a4a4a', 'emberwhorl', 4, 'sinker'],
  ['mist_carp', 'Mist Carp', 220, '#b8c8d8', 'mistveil', 3, 'smooth'], ['ghost_pike', 'Ghost Pike', 330, '#d8e8f0', 'mistveil', 4, 'dart'],
  ['glass_eel', 'Glass Eel', 280, '#bfe8ff', 'glasswater', 3, 'dart'], ['crystal_cod', 'Crystal Cod', 260, '#a8d8f0', 'glasswater', 3, 'smooth'],
  ['crowned_grouper', 'Crowned Grouper', 360, '#d8b040', 'sunkencrown', 4, 'sinker'], ['sunken_angler', 'Sunken Angler', 420, '#3a5a6a', 'sunkencrown', 4, 'smooth'],
];
for (const [id, n, p, c, isle, diff, mot] of ISLE_FISH) {
  if (IT[id]) continue;
  FISH.push([id, n, p, c, ['isle_' + isle], [0, 1, 2, 3], 'any', diff, 15, mot]);
  I(id, n, 'fish', p, 'fish', c, null, { eat: [Math.round(p / 8) + 4, Math.round(p / 6) + 6], fish: { loc: ['isle_' + isle], s: [0, 1, 2, 3], time: 'any', diff, w: 15, mot } });
  I('smoked_' + id, 'Smoked ' + n, 'artisan', p * 2, 'fish', sh(c, -1.5), '#5a3a20', { eat: [Math.round(p / 5), Math.round(p / 4)] });
}

/* ---- monsters: palette swaps of existing creatures, stronger ---- */
const isleFoe = (k, from, o) => { if (!EN[from]) return; EN[k] = Object.assign({}, EN[from], o); EN[k].drops = (o.drops || []).filter(d => d[0] === '$' || IT[d[0]]); };
isleFoe('reefstalker', 'reefcrab', { n: 'Reef Stalker', col: '#c8c8ff', hp: 420, atk: 52, def: 26, xp: 150, drops: [['coral_core', .5, 1, 1], ['moonpearl', .05, 1, 1]] });
isleFoe('moonsiren', 'harpy', { n: 'Moon Siren', col: '#9ad8ff', hp: 340, atk: 56, def: 14, xp: 150, drops: [['siren_scale', .8, 1, 2]] });
isleFoe('starjelly', 'tideslime', { n: 'Star Jelly', col: '#ffd0ff', hp: 300, atk: 48, def: 12, xp: 130, drops: [['siren_scale', .4, 1, 1], ['star_coral', .3, 1, 1]] });
isleFoe('magmacrab', 'crab', { n: 'Magma Crab', col: '#ff5a2a', scale: 1.4, hp: 520, atk: 56, def: 30, spd: 34, xp: 170, elem: 'fire', drops: [['cinder_scale', .7, 1, 2], ['obsidian', .4, 1, 2]] });
isleFoe('atollsalamander', 'cinderimp', { n: 'Atoll Salamander', col: '#ff8a1a', hp: 380, atk: 58, def: 18, xp: 160, drops: [['cinder_scale', .6, 1, 1], ['flamefruit', .2, 1, 1]] });
isleFoe('lavaspirit', 'flameslime', { n: 'Lava Spirit', col: '#ff4a1a', hp: 420, atk: 60, def: 20, xp: 170, drops: [['ember_coral', .4, 1, 2], ['cinder_ore', .3, 1, 2]] });
isleFoe('mistwraith', 'wraith', { n: 'Mist Wraith', col: '#c8d8e8', hp: 380, atk: 54, def: 16, xp: 160, drops: [['wisp_essence', .6, 1, 1]] });
isleFoe('thornwisp', 'frostwraith', { n: 'Thorn Wisp', col: '#7affd8', hp: 320, atk: 56, def: 14, xp: 150, elem: null, drops: [['wisp_essence', .5, 1, 1], ['glowcap', .2, 1, 1]] });
isleFoe('mossbear', 'cavebear', { n: 'Moss Bear', col: '#5a7a4a', hp: 640, atk: 62, def: 24, xp: 190, drops: [['hide', 1, 2, 3], ['mistwood_branch', .4, 1, 2]] });
isleFoe('glasswolf', 'rimewolf', { n: 'Glass Wolf', col: '#bfe8ff', hp: 420, atk: 58, def: 20, xp: 170, drops: [['frost_fang', .7, 1, 2]] });
isleFoe('glassling', 'iceelemental', { n: 'Glassling', col: '#a8f0ff', hp: 460, atk: 60, def: 28, xp: 180, drops: [['sea_glass', .6, 1, 2], ['frost_pearl', .03, 1, 1]] });
isleFoe('frostmammoth', 'icetroll', { n: 'Frost Mammoth', col: '#d8f0ff', hp: 820, atk: 66, def: 28, xp: 230, drops: [['frost_fang', .8, 1, 3], ['rime_ore', .5, 2, 4]] });
isleFoe('drownedknight', 'highbandit', { n: 'Drowned Knight', P: HP(0, { skin: '#6a9a9a', shirt: '#3a5a6a', pants: '#2a3a44', helm: '#6a8a8a', eye: '#bfffe8' }), hp: 520, atk: 62, def: 30, xp: 200, drops: [['drowned_crest', .3, 1, 1], ['relic_coin', .5, 1, 2], ['$', 1, 120, 300]] });
isleFoe('tidewraith', 'wraith', { n: 'Tide Wraith', col: '#4a8a8a', hp: 420, atk: 60, def: 18, xp: 180, drops: [['wisp_essence', .4, 1, 1], ['relic_coin', .4, 1, 1]] });
isleFoe('coralgolem', 'obsidiangolem', { n: 'Coral Golem', col: '#ff7a9a', hp: 760, atk: 64, def: 36, xp: 220, drops: [['coral_core', .8, 1, 2], ['star_coral', .4, 1, 2]] });
// the guardians: bosses with the moves of the ones they're drawn from, summoning their isle's creatures
const isleBoss = (k, from, o, summon) => {
  isleFoe(k, from, o); if (!EN[k]) return; EN[k].boss = 1; EN[k].ai = 'boss';
  const kit = typeof BOSS_KIT !== 'undefined' && BOSS_KIT[from];
  if (kit) BOSS_KIT[k] = [kit[0].map(mv => mv.startsWith('summon:') ? 'summon:' + summon : mv), kit[1]];
  if (EN[k].moves) EN[k].moves = EN[k].moves.map(mv => mv.startsWith('summon:') ? 'summon:' + summon : mv);
};
isleBoss('moonleviathan', 'tidecaller', { n: 'The Moon Leviathan', col: '#9a9aff', hp: 7000, atk: 34, def: 24, xp: 2600, drops: [['leviathan_eye', 1, 1, 1], ['moonpearl', 1, 2, 3], ['ember_shard', 1, 1, 1]] }, 'starjelly');
isleBoss('atolldrake', 'cinderdrake', { n: 'The Atoll Drake', col: '#ff6a1a', hp: 9500, atk: 42, def: 30, xp: 3200, drops: [['atoll_heart', 1, 1, 1], ['ember_coral', 1, 3, 5], ['ember_shard', 1, 1, 1]] }, 'atollsalamander');
isleBoss('mistqueen', 'rimequeen', { n: 'The Mist Queen', col: '#c8e0e8', hp: 8200, atk: 38, def: 26, xp: 2900, drops: [['mist_crown', 1, 1, 1], ['glowcap', 1, 3, 5], ['ember_shard', 1, 1, 1]] }, 'mistwraith');
isleBoss('glassheart', 'glacierheart', { n: 'The Glass Heart', col: '#bfe8ff', hp: 9000, atk: 40, def: 32, xp: 3100, drops: [['glass_heart', 1, 1, 1], ['frost_pearl', 1, 1, 2], ['ember_shard', 1, 1, 1]] }, 'glassling');
isleBoss('drownedking', 'drownedcaptain', { n: 'The Drowned King', col: '#d8b040', hp: 11000, atk: 46, def: 34, xp: 4000, drops: [['drowned_crown', 1, 1, 1], ['crown_shard', 1, 2, 3], ['relic_coin', 1, 4, 8], ['ember_shard', 1, 1, 1]] }, 'drownedknight');

/* ---- the isles ---- */
const ISLES = {
  moonreef: { n: 'Moonreef Isle', lvl: 42, col: '#c8c8ff', ground: 's', land: 'g', pool: 'w', hint: 'Pale sands and glowing reefs. Moonpearls, star coral and moon fish.',
    day: [['reefstalker', 3], ['moonsiren', 2], ['starjelly', 2]], night: [['moonsiren', 3], ['starjelly', 3], ['reefstalker', 2]], boss: 'moonleviathan',
    trees: ['palm', 'palm', 'mangrove'], nodes: [['ore_tide', 4], ['ore_gem', 1], ['rock', 3]], forage: ['moonpearl', 'star_coral', 'moon_kelp', 'moon_kelp', 'star_coral'] },
  emberwhorl: { n: 'Emberwhorl Atoll', lvl: 46, col: '#ff7a3a', ground: 's', land: 'a', pool: 'l', hint: 'Black sand and lava. Ember coral, flamefruit and obsidian.',
    day: [['magmacrab', 3], ['atollsalamander', 3], ['lavaspirit', 2]], night: [['lavaspirit', 3], ['atollsalamander', 3], ['magmacrab', 2]], boss: 'atolldrake',
    trees: ['charwood', 'dead'], nodes: [['ore_obsidian', 4], ['ore_cinder', 3], ['ore_star', 1], ['rock', 2]], forage: ['ember_coral', 'flamefruit', 'flamefruit', 'ember_coral'] },
  mistveil: { n: 'Mistveil Key', lvl: 44, col: '#9ae8d0', ground: 's', land: 'g', pool: 'w', hint: 'Misty woods. Glowcaps, wisp essence and mistwood.',
    day: [['mossbear', 2], ['thornwisp', 3], ['mistwraith', 2]], night: [['mistwraith', 4], ['thornwisp', 3], ['mossbear', 1]], boss: 'mistqueen',
    trees: ['mangrove', 'birch', 'pine', 'mangrove'], nodes: [['rock', 3], ['ore_mythril', 2], ['ore_gold', 2]], forage: ['glowcap', 'glowcap', 'mistwood_branch', 'mistwood_branch'] },
  glasswater: { n: 'Glasswater Cay', lvl: 48, col: '#bfe8ff', ground: 's', land: 'sn', pool: 'i', hint: 'Ice and snow on a clear sea. Sea glass and frost pearls.',
    day: [['glasswolf', 3], ['glassling', 2], ['frostmammoth', 1]], night: [['glasswolf', 4], ['glassling', 3]], boss: 'glassheart', snow: 1,
    trees: ['frostwood', 'pine'], nodes: [['ore_rime', 3], ['crystalnode', 3], ['ore_frost', 2]], forage: ['sea_glass', 'sea_glass', 'frost_pearl', 'sea_glass'] },
  sunkencrown: { n: 'The Sunken Crown', lvl: 52, col: '#e8c860', ground: 's', land: 'g', pool: 'st', hint: 'Stone ruins rising from the sea. Old relics and crown shards.',
    day: [['drownedknight', 3], ['coralgolem', 2], ['tidewraith', 2]], night: [['tidewraith', 4], ['drownedknight', 3]], boss: 'drownedking',
    trees: ['palm', 'oak'], nodes: [['rock', 3], ['ore_gold', 2], ['ore_adamant', 1]], forage: ['relic_coin', 'sea_glass', 'star_coral', 'relic_coin'] },
};
for (const id in ISLES) { const D = ISLES[id], b = 'isle_' + id; BIOMES.push(b); BIONAME[b] = D.n; BIOCOL[b] = D.col; BIOME_EN[b] = { day: D.day.filter(e => EN[e[0]]), night: D.night.filter(e => EN[e[0]]), lvl: D.lvl }; }
const ISLE_W = 72, ISLE_H = 54;
function genIsle(id) {
  const D = ISLES[id], W = ISLE_W, H = ISLE_H, m = newMap('isle_' + id, W, H, 'w'), seed = (S.seed * 37 + strSeed('isle_' + id)) | 0, sd = Math.abs(seed) % 100000;
  R = rng(seed);
  m.name = D.n; m.wild = true; m.isle = id; m.bio = new Uint8Array(W * H).fill(BIOMES.indexOf('isle_' + id));
  // the shape: a rough round island with its own coast, a beach rim and inland pools (water, lava, ice or old paving)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - W / 2) / (W * .42), dy = (y - H / 2) / (H * .4), d = Math.hypot(dx, dy), e = fbm(x * .08, y * .08, sd) * .7 + (1 - d) * .9, pool = fbm(x * .11, y * .11, sd + 40);
    const i = y * W + x; if (x < 2 || y < 2 || x > W - 3 || y > H - 3) continue;
    m.t[i] = e > .66 ? (pool > .72 ? D.pool : D.land) : e > .59 ? D.ground : 'w';
  }
  const land = (x, y) => inb(m, x, y) && !TER[getT(m, x, y)].water && !TER[getT(m, x, y)].solid && !TER[getT(m, x, y)].lava;
  // the dock: the southernmost beach on the middle line, a pier of four planks out to sea, the boat at its end
  let dx0 = W >> 1, dy0 = -1; for (let y = H - 3; y > H / 2; y--) if (land(dx0, y)) { dy0 = y; break; }
  if (dy0 < 0) dy0 = Math.round(H * .8);
  for (let k = 1; k <= 4; k++) for (const ox of [0, 1]) setT(m, dx0 + ox, dy0 + k, 'b');
  m.dock = [dx0, dy0 + 4]; m.entry = { x: (dx0 + .5) * 16, y: (dy0 + 1.8) * 16 };
  // scatter: trees inland, nodes, forage, shells on the beach
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    if (!land(x, y) || getO(m, x, y)) continue; const t = getT(m, x, y), r = R(), i = y * W + x;
    if (Math.abs(x - dx0) < 3 && y > dy0 - 4) continue;   // keep the landing clear
    let o = null;
    if (t === D.ground) o = r < .05 ? { k: 'shell' } : r < .062 ? { k: 'fg', item: pickR(D.forage) } : r < .07 ? { k: 'tree', kind: 'palm' } : null;
    else o = r < .07 ? { k: 'tree', kind: pickR(D.trees), snow: D.snow ? 1 : undefined } : r < .095 ? { k: wpick(D.nodes, R()), v: D.snow ? 'S' : undefined } : r < .108 ? { k: 'fg', item: pickR(D.forage) } : r < .13 && !D.snow && D.land === 'g' ? { k: 'tgrass' } : null;
    if (o && (o.k === 'tree' || o.k === 'fg' || OBJ[o.k]) && (o.k !== 'fg' || IT[o.item])) m.o[i] = o;
  }
  // a spot of land far from the dock, cleared around
  // (asks for less room and less distance from the dock step by step until something fits)
  const spot = (minD, r = 3) => { for (let tryR = r, tryD = minD; tryR >= 1; tryR--, tryD = Math.max(4, tryD - 5)) { const p = spot1(tryD, tryR); if (p) return p; } return null; };
  const spot1 = (minD, r) => { for (let n = 0; n < 500; n++) { const x = 6 + Math.floor(R() * (W - 12)), y = 5 + Math.floor(R() * (H - 12)); if (Math.hypot(x - dx0, y - dy0) < minD) continue; let ok = true; for (let j = -r; j <= r && ok; j++) for (let k = -r; k <= r && ok; k++) if (!land(x + k, y + j)) ok = false; if (ok) return [x, y]; } return null; };
  const clear = (x, y, r) => { for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) if (getO(m, x + k, y + j)) delObj(m, x + k, y + j); };
  // the ruins: a broken ring of walls on old paving, a statue and the main chest
  const ru = spot(14, 4);
  if (ru) {
    const [rx, ry] = ru; clear(rx, ry, 4);
    for (let j = -3; j <= 3; j++) for (let k = -4; k <= 4; k++) setT(m, rx + k, ry + j, 'st');
    for (let k = -4; k <= 4; k++) for (const j of [-3, 3]) if (R() < .7 && !(j === 3 && Math.abs(k) < 2)) setO(m, rx + k, ry + j, { k: 'ruinwall' });
    for (let j = -2; j <= 2; j++) for (const k of [-4, 4]) if (R() < .7) setO(m, rx + k, ry + j, { k: 'ruinwall' });
    setO(m, rx, ry - 1, { k: 'statue' }); setO(m, rx + 2, ry, { k: 'chest', id: m.id + '_c0', tier: 6 });
  }
  // two more chests, and the guardian's arena
  for (const n of [1, 2]) { const p = spot(10, 1); if (p) { clear(p[0], p[1], 1); setO(m, p[0], p[1], { k: 'chest', id: m.id + '_c' + n, tier: n === 2 ? 6 : 5 }); } }
  const ar = spot(22, 3); if (ar && EN[D.boss]) { clear(ar[0], ar[1], 3); m.arenas.push({ bio: 'isle_' + id, boss: D.boss, x: ar[0], y: ar[1] }); }
  m.o[m.dock[1] * W + m.dock[0]] = { k: 'sailboat', isle: 1 };
  return m;
}
initMaps = (f => function () {
  for (const id in ISLES) MAPS['isle_' + id] = genIsle(id);   // before the saves are put back on them (inside f)
  return f.apply(this, arguments);
})(initMaps);
for (const id in ISLES) PERSIST.push('isle_' + id);
fishLocs = (f => function () { const m = cur; if (m && m.isle) return ['isle_' + m.isle, 'ocean']; return f.apply(this, arguments); })(fishLocs);

/* ---- the sailboat ---- */
OBJ.sailboat = { solid: 1 };
objSprite = (f => function (o, season) { if (o && o.k === 'sailboat') return PIX.get('ferry') || SPR.wreck; return f.apply(this, arguments); })(objSprite);
const BOAT_COST = { gold: 15000, hardwood: 80, mangrove_wood: 40, cloth: 12, iron_bar: 10 };
const boatReady = () => !!(S.boat && dayIndex() >= S.boat.ready);
// Saltmere's pier end on the Wilds, where the boat is moored
function saltmerePier() { const W = MAPS.wilds, T = W && (W.towns || []).find(t => t.id === 'saltmere'); return T ? [T.x + 31, T.y + 12] : null; }
function mooring() {
  const W = MAPS.wilds, p = saltmerePier(); if (!W || !p) return;
  const o = getO(W, p[0], p[1]);
  if (boatReady()) { if (!o) setO(W, p[0], p[1], { k: 'sailboat' }); }
  else if (o && o.k === 'sailboat') setO(W, p[0], p[1], null);
}
initMaps = (f => function () { const r = f.apply(this, arguments); try { mooring(); } catch (e) { console.error(e); } return r; })(initMaps);
EVT.on('map', () => { try { if (S) mooring(); } catch (e) { } });
function seaChart(fromIsle) {
  openModal('Sea chart', [{ id: 'sea', label: 'Sea chart', render: b => {
    b.append(el('p', { class: 'note' }, 'The isles lie a few hours off the Saltmere coast. Their creatures are strong, and each has a guardian that rises again a week after it falls.'));
    const L = el('div', { class: 'list' });
    const go = (label, sub, hours, fn, here) => L.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, label), el('small', null, sub)),
      el('div', { class: 'acts' }, el('button', { class: 'btn' + (here ? ' off' : ''), on: () => { if (here) return; closeModal(); S.time += hours * 60; toast('You sail for ' + hours + ' hour' + (hours > 1 ? 's' : '') + '…'); SFX.splash && SFX.splash(); fn(); } }, here ? 'You are here' : 'Set sail'))));
    if (fromIsle) go('Saltmere', 'Home port on the coast.', 2, () => { const p = saltmerePier(); goMap('wilds', (p[0] - .5) * 16, (p[1] + .8) * 16, 1); });
    for (const id in ISLES) {
      const D = ISLES[id], bk = D.boss, done = S.bosses && S.bosses[bk], back = done && dayIndex() - ((S.bossDay || {})[bk] || 0) < 7;
      go(D.n, D.hint + ' Creatures around level ' + D.lvl + '. ' + (EN[bk] ? EN[bk].n + (back ? ' was beaten; back in ' + (7 - (dayIndex() - ((S.bossDay || {})[bk] || 0))) + ' days.' : done ? ' has risen again.' : ' guards it.') : ''),
        fromIsle ? 1 : 2, () => { const m = MAPS['isle_' + id]; goMap('isle_' + id, m.entry.x, m.entry.y, 3); }, cur && cur.id === 'isle_' + id);
    }
    b.append(L);
  } }]);
}
objInteract = (f => function (m, x, y, o) {
  if (o && o.k === 'sailboat') return { label: 'Sail', fn: () => seaChart(!!m.isle) };
  return f.apply(this, arguments);
})(objInteract);
// the Shipwright tab at Perrin's Chandlery
function renderShipwright(b) {
  if (S.boat) { b.append(el('p', null, boatReady() ? 'Your sailboat is moored at the end of the pier. Climb aboard and open the sea chart to sail to the isles.' : 'Perrin\'s crew is fitting her out. She\'ll be at the end of the pier tomorrow morning.')); return; }
  b.append(el('p', { class: 'note' }, 'A sailboat that can reach the isles off the coast: Moonreef, Emberwhorl, Mistveil, Glasswater and the Sunken Crown. Perrin\'s crew builds it overnight from your materials.'));
  const have = id => cnt(id), L = el('div', { class: 'list' });
  let ok = S.gold >= BOAT_COST.gold;
  L.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, BOAT_COST.gold.toLocaleString() + 'g'), el('small', null, 'You have ' + S.gold.toLocaleString() + 'g'))));
  for (const id in BOAT_COST) { if (id === 'gold' || !IT[id]) continue; const n = BOAT_COST[id], h = have(id); if (h < n) ok = false; L.append(el('div', { class: 'rrow' }, icon(id, 24), el('div', { class: 'rtxt' }, el('b', null, n + ' ' + IT[id].n), el('small', { class: h >= n ? '' : 'bad' }, 'You have ' + h)))); }
  b.append(L, el('div', { class: 'acts' }, el('button', { class: 'btn big' + (ok ? '' : ' off'), on: () => {
    if (!ok) { toast('You need everything listed, in your backpack.', 'bad'); return; }
    S.gold -= BOAT_COST.gold; for (const id in BOAT_COST) if (id !== 'gold' && IT[id]) take(id, BOAT_COST[id]);
    S.boat = { ready: dayIndex() + 1 }; SFX.ok(); toast('Perrin shakes your hand. "She\'ll be at the pier in the morning."', 'lvl'); refresh();
  } }, 'Commission the sailboat')));
}
townMenu = (f => function (act, who) {
  const r = f.apply(this, arguments);
  if (act === 'sm_chandler' && MODAL && MODAL.tabs && !MODAL.tabs.some(t => t.id === 'ship')) { MODAL.tabs.push({ id: 'ship', label: 'Shipwright', render: renderShipwright }); drawModal(); }
  return r;
})(townMenu);

/* ---- atmosphere: motes drifting over the isles ---- */
pcCursorDraw = (f => function (m) {
  const r = f.apply(this, arguments);
  if (!m || !m.isle || !S || TITLE) return r;
  const D = ISLES[m.isle], t = gameT, x0 = Math.floor(camX / 16) - 2, y0 = Math.floor(camY / 16) - 2;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let y = y0; y < y0 + 44; y++) for (let x = x0; x < x0 + 64; x++) {
    const h = ((x * 73856093) ^ (y * 19349663)) >>> 0; if (h % 23) continue;
    const ph = (h % 1000) / 1000 * 6.28, mx = x * 16 + 8 + Math.sin(t * .6 + ph) * 6, my = y * 16 + 8 + Math.cos(t * .45 + ph) * 5 - ((t * 4 + ph * 10) % 16);
    g.globalAlpha = .35 + .3 * Math.sin(t * 2 + ph); g.fillStyle = D.col; g.fillRect(Math.round(mx), Math.round(my), 1.5, 1.5);
  }
  g.restore();
  return r;
})(pcCursorDraw);

if (typeof HELP !== 'undefined') {
  HELP.ship = ['Shipwright', ['Perrin builds a sailboat overnight from gold, hardwood, mangrove wood, cloth and iron bars. It’s moored at the end of Saltmere’s pier.', 'Board it to open the sea chart and sail to the isles. Each has its own forage, fish, ruins with treasure, strong creatures and a guardian that rises again a week after it falls.']];
  HELP.sea = ['Sea chart', ['Pick an isle and set sail; the crossing takes an hour or two of the day. Every isle’s pier has your boat to sail on or home to Saltmere.']];
  helpKey = (f => function () { if (MODAL && MODAL.cur === 'ship') return 'ship'; if (MODAL && MODAL.title === 'Sea chart') return 'sea'; return f.apply(this, arguments); })(helpKey);
}
