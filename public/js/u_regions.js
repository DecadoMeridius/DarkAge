/* ================= Phase 11: world regions =================
   The Wilds stay the heart of the Hollow Vale. Beyond them, four regions are generated
   from the world seed, each a 180x140 map with its own biomes, a town, a dungeon of five
   floors and a world boss:
     Highmarch  (north, past the Old Mine)   pine valleys and snow peaks     opens after the Bandit Warlord
     Frostmere  (north-west, past Frostpeak) tundra and glaciers              opens after the Frost Giant
     Emberwaste (north-east, past the ash)   badlands and cinder fields      opens after the Ash Colossus
     Saltreach  (Corwin's ferry)             islands and reefs               opens after Old Snapper
   regionOpen(id) is the single gate; Phase 12 storylines can open regions by setting
   S.regions[id]. Waystones (farm, village, Wilds crossroads, every town and dungeon
   mouth) fast-travel between the ones you've attuned to. */

/* ---- biomes ---- */
const RBIO = {
  pinevale: { n: 'Pinevale', col: '#4a7a3a', lvl: 20, day: [['direwolf', 3], ['cavebear', 2], ['highbandit', 2]], night: [['direwolf', 4], ['cavebear', 2], ['shade', 1]] },
  peaks: { n: 'The Snow Peaks', col: '#c8c8d0', lvl: 24, day: [['stonetroll', 2], ['griffin', 3], ['highbandit', 2]], night: [['stonetroll', 3], ['griffin', 2], ['wraith', 2]] },
  tundra: { n: 'Rime Tundra', col: '#e0ecf4', lvl: 26, day: [['rimewolf', 4], ['icetroll', 1], ['iceslime', 2]], night: [['rimewolf', 3], ['frostwraith', 3], ['icetroll', 1]] },
  glacier: { n: 'The Glacier', col: '#bfe0f0', lvl: 30, day: [['iceelemental', 2], ['icetroll', 2], ['frostbat', 2]], night: [['frostwraith', 4], ['iceelemental', 2]] },
  badlands: { n: 'The Badlands', col: '#7a5a4a', lvl: 30, day: [['hellhound', 3], ['cinderimp', 2], ['ashgolem', 1]], night: [['hellhound', 4], ['shade', 2], ['cinderimp', 2]] },
  cinder: { n: 'Cinder Fields', col: '#4a3a3a', lvl: 34, day: [['flameslime', 3], ['obsidiangolem', 2], ['cinderimp', 2]], night: [['obsidiangolem', 2], ['cinderimp', 3], ['firebat', 2]] },
  isles: { n: 'The Saltreach Isles', col: '#d8c890', lvl: 22, day: [['reefcrab', 3], ['tideslime', 3], ['harpy', 2]], night: [['drowned', 4], ['reefcrab', 2], ['harpy', 1]] },
  reef: { n: 'The Shallows', col: '#8ad0c8', lvl: 25, day: [['reefcrab', 3], ['tideslime', 3]], night: [['drowned', 3], ['tideslime', 2]] },
};
for (const k in RBIO) { BIOMES.push(k); BIONAME[k] = RBIO[k].n; BIOCOL[k] = RBIO[k].col; BIOME_EN[k] = { day: RBIO[k].day, night: RBIO[k].night, lvl: RBIO[k].lvl }; }

/* ---- creatures (palette swaps of the existing templates) ---- */
Object.assign(EN, {
  direwolf: { n: 'Dire Wolf', art: 'wolf', col: '#4a4a52', hp: 220, atk: 34, def: 10, spd: 58, xp: 60, ai: 'chase', drops: [['hide', .8, 1, 2], ['fang', .5, 1, 2]], r: 8 },
  cavebear: { n: 'Cave Bear', art: 'boar', col: '#5a3a22', scale: 1.4, hp: 420, atk: 42, def: 14, spd: 40, xp: 90, ai: 'charge', drops: [['hide', 1, 2, 3], ['fang', .5, 1, 2]], r: 10 },
  highbandit: { n: 'Highmarch Raider', art: 'human', P: HP(0, { shirt: '#3a4a5a', pants: '#2a2a34', helm: '#8a8a92', beard: '#5a3a1a', eye: '#2b1810' }), hp: 260, atk: 38, def: 14, spd: 44, xp: 70, ai: 'chase', drops: [['$', 1, 60, 180], ['mythril_ore', .2, 1, 2], ['treasure_map', .04, 1, 1]], r: 6 },
  stonetroll: { n: 'Stone Troll', art: 'golem', col: '#6a7a6a', eye: '#d8ff7a', scale: 1.2, hp: 520, atk: 46, def: 22, spd: 28, xp: 110, ai: 'chase', drops: [['mythril_ore', .5, 1, 3], ['gold_ore', .5, 2, 4], ['stone', 1, 4, 8]], r: 10 },
  griffin: { n: 'Griffin', art: 'bird', col: '#c8a050', scale: 1.5, hp: 240, atk: 38, def: 8, spd: 76, xp: 70, ai: 'swoop', drops: [['raptor_feather', 1, 1, 3]], r: 8 },
  rimewolf: { n: 'Rime Wolf', art: 'wolf', col: '#e8f0fa', hp: 280, atk: 40, def: 12, spd: 62, xp: 80, ai: 'chase', elem: 'ice', drops: [['hide', .7, 1, 2], ['ice_shard', .6, 1, 2]], r: 8 },
  icetroll: { n: 'Ice Troll', art: 'yeti', col: '#a8c8e8', scale: 1.3, hp: 640, atk: 52, def: 20, spd: 30, xp: 140, ai: 'chase', elem: 'ice', drops: [['yeti_fur', .8, 1, 3], ['frost_ore', .8, 2, 5]], r: 12 },
  frostwraith: { n: 'Rime Wraith', art: 'ghost', col: '#9ad8ff', eye: '#ffffff', hp: 300, atk: 46, def: 10, spd: 40, xp: 90, ai: 'ghost', elem: 'ice', undead: 1, drops: [['ectoplasm', .7, 1, 2], ['ice_shard', .5, 1, 2]], r: 6 },
  iceelemental: { n: 'Ice Elemental', art: 'golem', col: '#a8d8f8', eye: '#ffffff', hp: 560, atk: 50, def: 26, spd: 26, xp: 130, ai: 'chase', elem: 'ice', drops: [['frost_ore', 1, 2, 4], ['diamond', .04, 1, 1]], r: 10 },
  hellhound: { n: 'Hellhound', art: 'wolf', col: '#a8341a', hp: 360, atk: 50, def: 14, spd: 64, xp: 110, ai: 'chase', elem: 'fire', drops: [['fang', .7, 1, 2], ['magma_shard', .6, 1, 2]], r: 8 },
  cinderimp: { n: 'Cinder Imp', art: 'imp', col: '#ff5a1a', hp: 300, atk: 52, def: 12, spd: 54, xp: 110, ai: 'ranged', shot: 'fire', elem: 'fire', drops: [['imp_horn', .6, 1, 2], ['magma_shard', .6, 1, 2]], r: 6 },
  flameslime: { n: 'Flame Slime', art: 'slime', col: '#ffb01a', hp: 340, atk: 48, def: 14, spd: 32, xp: 100, ai: 'hop', elem: 'fire', drops: [['magma_shard', .8, 1, 3], ['gold_ore', .5, 2, 4]], r: 7 },
  obsidiangolem: { n: 'Obsidian Golem', art: 'golem', col: '#2a2430', eye: '#ff3a1a', scale: 1.3, hp: 800, atk: 60, def: 32, spd: 24, xp: 180, ai: 'chase', drops: [['obsidian', 1, 2, 4], ['adamant_ore', .6, 1, 3]], r: 12 },
  reefcrab: { n: 'Reef Crab', art: 'crab', col: '#d86a8a', hp: 240, atk: 36, def: 20, spd: 40, xp: 70, ai: 'chase', drops: [['chitin', .9, 1, 3], ['clam', .3, 1, 2]], r: 7 },
  tideslime: { n: 'Tide Slime', art: 'slime', col: '#2ab8c8', hp: 220, atk: 34, def: 8, spd: 34, xp: 60, ai: 'hop', drops: [['slime_goo', 1, 1, 3], ['aquamarine', .05, 1, 1]], r: 7 },
  harpy: { n: 'Harpy', art: 'bird', col: '#8a6ab8', scale: 1.3, hp: 200, atk: 38, def: 8, spd: 72, xp: 70, ai: 'swoop', drops: [['raptor_feather', .8, 1, 2]], r: 7 },
  drowned: { n: 'The Drowned', art: 'human', P: HP(0, { skin: '#9ab8a8', hair: '#3a5a4a', shirt: '#2a4a5a', pants: '#3a3a3a', ribs: 1, eye: '#7affe8', hs: 'long' }), hp: 300, atk: 42, def: 12, spd: 38, xp: 85, ai: 'chase', undead: 1, drops: [['$', 1, 80, 200], ['bone', .6, 1, 2], ['nautilus', .1, 1, 1], ['treasure_map', .05, 1, 1]], r: 6 },
  /* world bosses */
  stonetyrant: { n: 'The Stone Tyrant', art: 'golem', col: '#5a6458', eye: '#7affd8', scale: 2.6, hp: 6500, atk: 62, def: 26, spd: 26, xp: 2000, ai: 'boss', boss: 1, moves: ['slam', 'ring', 'volley', 'summon:stonetroll'], drops: [['mythril_ore', 1, 10, 16], ['adamant_ore', 1, 4, 8], ['diamond', 1, 1, 2], ['ember_shard', 1, 1, 1]], r: 22 },
  rimequeen: { n: 'The Rime Queen', art: 'human', P: HP(0, { skin: '#d8ecfa', hair: '#f4faff', shirt: '#6aa8d8', pants: '#3a6a9a', robe: 1, crown: 1, eye: '#7ae8ff', glow: '#9ad8ff', hs: 'long' }), scale: 2.2, hp: 7000, atk: 66, def: 24, spd: 36, xp: 2200, ai: 'boss', boss: 1, elem: 'ice', undead: 1, moves: ['volley', 'ring', 'circle', 'summon:frostwraith'], drops: [['frost_ore', 1, 12, 18], ['diamond', 1, 1, 3], ['aquamarine', 1, 2, 4], ['ember_shard', 1, 1, 1]], r: 18 },
  cinderdrake: { n: 'The Cinder Drake', art: 'dragon', col: '#8a1a0a', scale: 1.3, hp: 9000, atk: 72, def: 28, spd: 42, xp: 2800, ai: 'boss', boss: 1, elem: 'fire', moves: ['volley', 'ring', 'circle', 'summon:cinderimp'], drops: [['dragon_scale', 1, 4, 6], ['ruby', 1, 2, 4], ['adamant_ore', 1, 6, 10], ['ember_shard', 1, 1, 1]], r: 24 },
  drownedcaptain: { n: 'The Drowned Captain', art: 'human', P: HP(0, { skin: '#9ab8a8', hair: '#2a3a3a', shirt: '#1a3a5a', pants: '#2a2a3a', hat: '#1a1a2a', cape: '#2a4a5a', eye: '#7affe8', glow: '#7affe8', beard: '#2a3a3a' }), scale: 2.2, hp: 6000, atk: 60, def: 22, spd: 44, xp: 1900, ai: 'boss', boss: 1, undead: 1, moves: ['charge', 'volley', 'slam', 'summon:drowned'], drops: [['nautilus', 1, 2, 4], ['aquamarine', 1, 3, 5], ['$', 1, 2000, 4000], ['ember_shard', 1, 1, 1]], r: 18 },
  /* dungeon bosses */
  forgeking: { n: 'The Forge King', art: 'golem', col: '#8a5a3a', eye: '#ffb04a', scale: 2, hp: 4000, atk: 56, def: 24, spd: 28, xp: 1400, ai: 'boss', boss: 1, elem: 'fire', moves: ['slam', 'ring', 'summon:magma'], drops: [['mythril_bar', 1, 4, 6], ['gold_bar', 1, 6, 10], ['ember_shard', 1, 1, 1]], r: 18 },
  glacierheart: { n: 'Heart of the Glacier', art: 'golem', col: '#cfeefa', eye: '#3a8aff', scale: 2, hp: 4600, atk: 58, def: 28, spd: 24, xp: 1600, ai: 'boss', boss: 1, elem: 'ice', moves: ['ring', 'volley', 'summon:iceslime'], drops: [['frost_ore', 1, 10, 14], ['diamond', 1, 1, 2], ['ember_shard', 1, 1, 1]], r: 18 },
  ashmother: { n: 'The Ash Mother', art: 'imp', col: '#5a1a0a', scale: 2.4, hp: 5200, atk: 64, def: 24, spd: 40, xp: 1800, ai: 'boss', boss: 1, elem: 'fire', moves: ['volley', 'circle', 'summon:cinderimp'], drops: [['obsidian', 1, 8, 12], ['ruby', 1, 1, 3], ['ember_shard', 1, 1, 1]], r: 16 },
  tidecaller: { n: 'The Tidecaller', art: 'slime', col: '#1a7a9a', scale: 3, hp: 3800, atk: 52, def: 18, spd: 34, xp: 1300, ai: 'boss', boss: 1, moves: ['ring', 'slam', 'summon:tideslime'], drops: [['aquamarine', 1, 2, 4], ['nautilus', 1, 1, 2], ['ember_shard', 1, 1, 1]], r: 18 },
});
/* every regional creature has its own art (creatures2.py) and drops that region's materials */
const RART = {
  direwolf: ['warg', '#4a4a52', 9, [['hide', .8, 1, 2], ['fang', .5, 1, 2]]],
  cavebear: ['bear', '#5a3a22', 11, [['bear_pelt', .8, 1, 1], ['fang', .4, 1, 2]]],
  stonetroll: ['troll', '#6a7a6a', 10, [['troll_hide', .7, 1, 1], ['cobalt_ore', .5, 1, 3], ['garnet', .08, 1, 1]]],
  griffin: ['griffin', '#c8a050', 9, [['griffin_feather', .8, 1, 2]]],
  stonetyrant: ['tyrant', '#5a6458', 26, [['tyrant_heart', 1, 1, 1], ['cobalt_ore', 1, 10, 16], ['garnet', 1, 2, 4], ['ember_shard', 1, 1, 1]]],
  forgeking: ['forgeking', '#5a5a66', 20, [['forge_ember', 1, 1, 1], ['cobalt_bar', 1, 3, 5], ['ember_shard', 1, 1, 1]]],
  rimewolf: ['icewarg', '#e8f0fa', 9, [['hide', .7, 1, 2], ['rime_essence', .2, 1, 1]]],
  icetroll: ['mammoth', '#8a6a4a', 14, [['mammoth_tusk', .6, 1, 1], ['yeti_fur', .6, 1, 2]], 'Rime Mammoth'],
  frostwraith: ['wisp', '#9ad8ff', 7, [['rime_essence', .6, 1, 1], ['ectoplasm', .4, 1, 1]]],
  iceelemental: ['shardling', '#a8d8f8', 10, [['rime_ore', .7, 1, 2], ['glacite', .05, 1, 1]], 'Shardling'],
  rimequeen: ['queen', '#6aa8d8', 16, [['rime_crown', 1, 1, 1], ['rime_ore', 1, 10, 16], ['glacite', 1, 1, 2], ['ember_shard', 1, 1, 1]]],
  glacierheart: ['glacierheart', '#cfeefa', 22, [['glacier_core', 1, 1, 1], ['rime_bar', 1, 3, 5], ['ember_shard', 1, 1, 1]]],
  hellhound: ['hound', '#3a1a1a', 8, [['hound_ember', .7, 1, 1], ['fang', .4, 1, 2]]],
  cinderimp: ['salamander', '#c8401a', 8, [['salamander_scale', .6, 1, 1], ['magma_shard', .4, 1, 2]], 'Cinder Salamander'],
  flameslime: ['elemental', '#ff6a1a', 7, [['hound_ember', .3, 1, 1], ['sunstone', .03, 1, 1]], 'Flame Spirit', 'ghost'],
  obsidiangolem: ['basalt', '#2a2430', 12, [['basalt_core', .5, 1, 1], ['cinder_ore', .6, 1, 2], ['sunstone', .05, 1, 1]], 'Basalt Golem'],
  cinderdrake: ['drake', '#8a1a0a', 30, [['drake_heart', 1, 1, 1], ['cinder_ore', 1, 8, 12], ['sunstone', 1, 1, 2], ['ember_shard', 1, 1, 1]]],
  ashmother: ['ashmother', '#5a1a0a', 24, [['brood_egg', 1, 1, 1], ['cinder_bar', 1, 3, 5], ['ember_shard', 1, 1, 1]]],
  reefcrab: ['lobster', '#d86a8a', 8, [['reef_shell', .8, 1, 2], ['pearl', .04, 1, 1]], 'Reef Lobster'],
  tideslime: ['jelly', '#8a7ad8', 7, [['jelly_gel', .8, 1, 2], ['tide_ore', .2, 1, 1]], 'Moon Jelly', 'ghost'],
  harpy: ['harpy', '#8a6ab8', 8, [['harpy_plume', .8, 1, 2]]],
  drownedcaptain: ['captain', '#2a6a6a', 18, [['captain_compass', 1, 1, 1], ['tide_ore', 1, 10, 16], ['pearl', 1, 1, 2], ['ember_shard', 1, 1, 1]]],
  tidecaller: ['kraken', '#6a2a5a', 26, [['kraken_ink', 1, 1, 1], ['pearl', 1, 1, 2], ['tide_bar', 1, 3, 5], ['ember_shard', 1, 1, 1]]],
};
for (const k in RART) { const [art, col, r, drops, n, ai] = RART[k], E = EN[k]; E.art = art; E.col = col; E.r = r; E.drops = drops; delete E.scale; delete E.P; if (n) E.n = n; if (ai) E.ai = ai; }
EN.highbandit.drops.push(['cobalt_ore', .3, 1, 2]); EN.drowned.drops.push(['tide_ore', .3, 1, 2]);
for (const k of ['direwolf', 'cavebear', 'highbandit', 'stonetroll', 'griffin', 'rimewolf', 'icetroll', 'frostwraith', 'iceelemental', 'hellhound', 'cinderimp', 'flameslime', 'obsidiangolem', 'reefcrab', 'tideslime', 'harpy', 'drowned', 'stonetyrant', 'rimequeen', 'cinderdrake', 'drownedcaptain', 'forgeking', 'glacierheart', 'ashmother', 'tidecaller'])
  EN[k].drops = EN[k].drops.filter(d => d[0] === '$' || IT[d[0]]); // only drop items the game knows

/* ---- regions ---- */
const REGIONS = {
  highmarch: { code: 'hm', n: 'The Highmarch', bios: [['pinevale', 5], ['peaks', 6], ['highlands', 2]], hard: 'peaks', boss: 'stonetyrant', gate: 'warlord', gx: 120,
    town: { n: 'Highmarch Hold', ground: 'g', b: [['hm_hall', 7, 6, 'r_inn'], ['hm_forge', 6, 5, 'r_smith'], ['hm_house', 5, 4, 'r_house'], ['hm_stall', 3, 2, 'r_trade']] },
    trade: [['alpine_barley_seed', 0], ['mountain_berry_seed', 0], ['stonepine_log', 90], ['cobalt_ore', 260], ['mountain_thyme', 220], ['coal', 45]],
    meals: [['highland_stew', 900], ['edelweiss_tea', 650], ['bread', 180]],
    dg: { n: 'The Sunken Forge', theme: 'magma', lvl: 28, boss: 'forgeking', pool: [['skeleton', 2], ['stonetroll', 2], ['firebat', 2], ['magma', 2]], ores: [['rock', 6], ['ore_gold', 3], ['ore_mythril', 3], ['ore_adamant', 1], ['ore_gem', 1]] } },
  frostmere: { code: 'fm', n: 'The Frostmere', bios: [['tundra', 6], ['glacier', 5]], hard: 'glacier', boss: 'rimequeen', gate: 'frostgiant', gx: 40,
    town: { n: 'Rimehold', ground: 'sn', b: [['fm_lodge', 6, 5, 'r_inn'], ['fm_forge', 5, 4, 'r_smith'], ['fm_house', 4, 3, 'r_house'], ['fm_house', 4, 3, 'r_house'], ['fm_stall', 3, 2, 'r_trade']] },
    trade: [['ice_turnip_seed', 0], ['snow_lotus_seed', 0], ['frostwood_log', 130], ['rime_ore', 380], ['snowcap', 400], ['frost_ore', 260]],
    meals: [['lotus_broth', 1600], ['lichen_bread', 700], ['frost_soup', 700]],
    dg: { n: 'Hall of Rime', theme: 'ice', lvl: 32, boss: 'glacierheart', pool: [['frostwraith', 3], ['frostbat', 2], ['iceslime', 2], ['iceelemental', 1]], ores: [['rock', 6], ['ore_frost', 4], ['crystalnode', 3], ['ore_gem', 1.2]] } },
  emberwaste: { code: 'ew', n: 'The Emberwaste', bios: [['badlands', 6], ['cinder', 5]], hard: 'cinder', boss: 'cinderdrake', gate: 'colossus', gx: 176,
    town: { n: 'Cinder Camp', ground: 'a', b: [['ew_hall', 6, 5, 'r_inn'], ['ew_forge', 6, 5, 'r_smith'], ['ew_tent', 4, 3, 'r_house'], ['ew_tent', 4, 3, 'r_house'], ['ew_stall', 3, 2, 'r_trade']] },
    trade: [['dragon_pepper_seed', 0], ['cinder_melon_seed', 0], ['charwood_log', 170], ['cinder_ore', 520], ['fire_pepper', 500], ['obsidian', 240]],
    meals: [['dragon_chili', 1900], ['melon_sorbet', 2100], ['ember_curry', 1100]],
    dg: { n: 'The Molten Vault', theme: 'magma', lvl: 36, boss: 'ashmother', pool: [['cinderimp', 3], ['firebat', 2], ['flameslime', 2], ['obsidiangolem', 1]], ores: [['rock', 6], ['ore_obsidian', 4], ['ore_adamant', 3], ['ore_star', .6], ['ore_gem', 1.4]] } },
  saltreach: { code: 'sr', n: 'The Saltreach', bios: [['isles', 7], ['reef', 4]], hard: 'reef', boss: 'drownedcaptain', gate: 'snapper', ferry: 1,
    town: { n: 'Port Saltreach', ground: 's', b: [['sr_inn', 7, 6, 'r_inn'], ['sr_house', 4, 4, 'r_house'], ['sr_forge', 5, 4, 'r_smith'], ['sr_house', 4, 4, 'r_house'], ['sr_stall', 3, 2, 'r_trade']] },
    trade: [['sea_grape_seed', 0], ['saffron_seed', 0], ['mangrove_wood', 100], ['tide_ore', 300], ['kelp', 140], ['treasure_map', 900]],
    meals: [['pearl_chowder', 1100], ['saffron_paella', 1500], ['sushi', 500]],
    dg: { n: 'The Drowned Grotto', theme: 'ice', lvl: 26, boss: 'tidecaller', pool: [['drowned', 3], ['tideslime', 2], ['reefcrab', 2], ['bat', 1]], ores: [['rock', 6], ['ore_silver', 3], ['ore_gold', 2], ['ore_gem', 1.4]] } },
};
for (const id in REGIONS) { const Rg = REGIONS[id]; Rg.trade = Rg.trade.filter(t => IT[t[0]]).map(([k, p]) => [k, p || IT[k].p]); Rg.meals = Rg.meals.filter(t => IT[t[0]]); WBOSS[Rg.hard] = Rg.boss; }
const REG_W = 180, REG_H = 140;
function regionOpen(id) { return !!(S && ((S.regions || {})[id] || (S.bosses || {})[REGIONS[id].gate])); }
const strSeed = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);

function genRegion(id) {
  const Rg = REGIONS[id], W = REG_W, H = REG_H, m = newMap(id, W, H, 'g'), seed = (S.seed * 31 + strSeed(id)) | 0, sd = Math.abs(seed) % 100000;
  R = rng(seed);
  m.name = Rg.n; m.wild = true; m.region = id; m.bio = new Uint8Array(W * H); m.secrets = [];
  const C = [];
  for (let i = 0; i < 16; i++) C.push([BIOMES.indexOf(wpick(Rg.bios, R())), 10 + R() * (W - 20), 8 + R() * (H - 40)]);
  C.push([BIOMES.indexOf(Rg.bios[0][0]), W / 2, H - 22]); C.push([BIOMES.indexOf(Rg.hard), W / 2 + (R() - .5) * 60, 18]);
  const N = (x, y) => ({ elev: fbm(x * .03, y * .03, sd + 5), ridge: 1 - Math.abs(2 * fbm(x * .055, y * .055, sd + 50) - 1), lake: fbm(x * .07, y * .07, sd + 70) });
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const wx = x + (fbm(x * .025, y * .025, sd + 11) - .5) * 40, wy = y + (fbm(x * .025, y * .025, sd + 23) - .5) * 40;
    let best = 0, bd = 1e9; for (const [b, cx, cy] of C) { const d = (wx - cx) ** 2 + (wy - cy) ** 2; if (d < bd) { bd = d; best = b; } }
    m.bio[y * W + x] = best; const n = N(x, y), b = BIOMES[best];
    m.t[y * W + x] = b === 'pinevale' ? (n.lake > .73 ? 'w' : 'g')
      : b === 'peaks' ? (n.ridge > .86 ? 'r' : n.elev > .58 ? 'sn' : 'st')
        : b === 'highlands' ? (n.ridge > .88 ? 'r' : n.elev > .6 ? 'st' : 'g')
          : b === 'tundra' ? (n.lake > .72 ? 'i' : 'sn')
            : b === 'glacier' ? (n.ridge > .88 ? 'r' : n.elev > .5 ? 'i' : 'sn')
              : b === 'badlands' ? (n.ridge > .87 ? 'r' : n.elev > .62 ? 'st' : 'a')
                : b === 'cinder' ? (n.lake > .68 ? 'l' : n.ridge > .9 ? 'r' : 'a')
                  : b === 'isles' ? (n.elev > .53 ? 'g' : n.elev > .47 ? 's' : 'w')
                    : (n.elev > .44 ? 's' : 'w');
  }
  const B = (x, y) => BIOMES[m.bio[y * W + x]];
  // borders: rock, trees, or open water around the isles
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 2 || y < 2 || x > W - 3 || y > H - 3) { const t = getT(m, x, y); if (t === 'w') continue; const b = B(x, y); if (b === 'pinevale') setO(m, x, y, { k: 'tree', kind: 'pine' }); else if (b === 'isles' || b === 'reef') setT(m, x, y, 'w'); else setT(m, x, y, 'r'); }
  // scatter
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
    const t = getT(m, x, y); if (TER[t].solid || TER[t].water || TER[t].lava || getO(m, x, y)) continue; const b = B(x, y), r = R(), i = y * W + x;
    const dense = fbm(x * .09, y * .09, sd + 90), gr = fbm(x * .12, y * .12, sd + 95);
    let o = null;
    if (RFORAGE[b] && r > .995) o = { k: 'fg', item: pickR(RFORAGE[b]) };
    else if (b === 'pinevale') o = (dense > .5 && r < .4) || r < .05 ? { k: 'tree', kind: pickR(['pine', 'stonepine', 'stonepine', 'pine', 'birch']) } : r < .07 ? { k: 'fern' } : r < .08 ? { k: 'bush', ripe: 0 } : r < .086 ? { k: 'mushroom' } : r < .092 ? { k: 'rock' } : (gr > .58 && r < .3) ? { k: 'tgrass' } : null;
    else if (b === 'peaks' || b === 'highlands') o = r < .032 ? { k: wpick([['rock', 30], ['ore_iron', 10], ['ore_silver', 10], ['ore_gold', 10], ['ore_coal', 10], ['ore_mythril', 4], ['ore_cobalt', b === 'peaks' ? 26 : 12], ['ore_gem', 2]], R()), v: t === 'sn' ? 'S' : undefined } : r < .05 ? { k: 'tree', kind: 'stonepine' } : (t === 'g' && gr > .6 && r < .3) ? { k: 'tgrass' } : null;
    else if (b === 'tundra') o = r < .05 ? { k: 'tree', kind: R() < .6 ? 'frostwood' : 'pine', snow: 1 } : r < .056 ? { k: 'ore_rime' } : r < .06 ? { k: 'ore_frost' } : r < .064 ? { k: 'crystalnode' } : r < .074 ? { k: 'rock', v: 'S' } : null;
    else if (b === 'glacier') o = t === 'i' ? (r < .006 ? { k: 'crystalnode' } : null) : r < .012 ? { k: 'crystalnode' } : r < .024 ? { k: 'ore_rime' } : r < .03 ? { k: wpick([['ore_frost', 2], ['ore_mythril', 1], ['rock', 3]], R()), v: 'S' } : r < .036 ? { k: 'tree', kind: 'frostwood' } : null;
    else if (b === 'badlands') o = r < .02 ? { k: 'tree', kind: R() < .6 ? 'charwood' : 'dead' } : r < .03 ? { k: 'ore_obsidian' } : r < .036 ? { k: 'ore_cinder' } : r < .04 ? { k: 'ore_adamant' } : r < .046 ? { k: 'ore_gold' } : r < .066 ? { k: 'rock', v: 'A' } : null;
    else if (b === 'cinder') o = r < .012 ? { k: 'ore_obsidian' } : r < .024 ? { k: 'ore_cinder' } : r < .027 ? { k: 'ore_star' } : r < .036 ? { k: 'tree', kind: 'charwood' } : r < .05 ? { k: 'rock', v: 'A' } : null;
    else if (b === 'isles') o = t === 's' ? (r < .02 ? { k: 'tree', kind: 'palm' } : r < .03 ? { k: 'ore_tide' } : r < .045 ? { k: 'shell' } : null) : (r < .06 ? { k: 'tree', kind: pickR(['palm', 'mangrove', 'mangrove']) } : r < .066 ? { k: 'ore_tide' } : r < .07 ? { k: 'bush', ripe: 0 } : (gr > .55 && r < .35) ? { k: 'tgrass' } : r < .075 ? { k: 'flower', v: ri(0, 4) } : null);
    else if (b === 'reef') o = r < .03 ? { k: 'shell' } : r < .042 ? { k: 'ore_tide' } : r < .05 ? { k: 'rock' } : r < .056 ? { k: 'fg', item: 'clam' } : null;
    if (o && o.k && (OBJ[o.k] || o.k === 'tree' || o.k === 'fg') && (o.k !== 'fg' || IT[o.item])) m.o[i] = o;
  }
  // ---- places ----
  const spot = (bio, r, tries = 900, near) => { for (let k = 0; k < tries; k++) { let x, y; if (near) { x = near[0] + ri(-near[2], near[2]); y = near[1] + ri(-near[2], near[2]); } else { x = ri(r + 4, W - r - 5); y = ri(r + 4, H - r - 26); } if (!inb(m, x, y) || (bio && B(x, y) !== bio)) continue; if (m.poi.some(p => Math.abs(p.x - x) < r + 8 && Math.abs(p.y - y) < r + 8)) continue; let ok = true, wet = 0; for (let j = -r; j <= r && ok; j++) for (let i = -r; i <= r && ok; i++) { const tt = getT(m, x + i, y + j); if (TER[tt].lava) ok = false; if (TER[tt].water) wet++; } if (ok && wet < (r * 2 + 1) ** 2 * .35) return [x, y]; } return null; };
  const poi = (type, x, y, extra) => { const p = Object.assign({ type, x, y }, extra || {}); m.poi.push(p); return p; };
  const ground = Rg.town.ground;
  const flat = (x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!inb(m, x, y)) continue; if (getO(m, x, y)) delObj(m, x, y); setT(m, x, y, t); } };
  // town just north of the road in
  const tx = Math.floor(W / 2), ty = H - 26;
  flat(tx - 16, ty - 10, tx + 16, ty + 8, ground); flat(tx - 16, ty - 2, tx + 16, ty - 1, 'p'); flat(tx - 4, ty, tx + 4, ty + 3, 'p'); // a street along the house fronts and a small square
  let bx = tx - 15;
  const doors = [];
  for (const [kind, w, h, act] of Rg.town.b) {
    if (kind.endsWith('stall')) { const b = addB(m, tx + 7, ty + 3, w, h, kind, act); doors.push([b.door.x, b.door.y + 1]); continue; }
    const b = addB(m, bx, ty - 2 - h, w, h, kind, act); doors.push([b.door.x, b.door.y + 1]); bx += w + 2;
  }
  m.safe = [tx, ty]; poi('town', tx, ty, { n: Rg.town.n });
  // the road in from the south edge
  const gate = [tx, H - 1];
  for (let y = H - 3; y < H; y++) for (let x = tx - 2; x <= tx + 2; x++) { if (getO(m, x, y)) delObj(m, x, y); setT(m, x, y, 'd'); }
  m.warps.push({ x: tx - 2, y: H - 1, w: 5, h: 1, to: Rg.ferry ? 'wilds_dock' : 'wilds_' + id, tx: 0, ty: 0, dir: 0 });
  m.entry = { x: (tx + .5) * 16, y: (H - 4) * 16 };
  // dungeon mouth in the hard biome
  const dgS = spot(Rg.hard, 5) || spot(null, 5) || [W / 2, 30];
  flat(dgS[0] - 4, dgS[1] - 5, dgS[0] + 4, dgS[1] + 3, Rg.hard === 'cinder' || Rg.hard === 'badlands' ? 'a' : Rg.hard === 'reef' ? 's' : 'st');
  const db = addB(m, dgS[0] - 2, dgS[1] - 4, 5, 4, 'dg_' + Rg.code, 'r_dg'); m.dgDoor = db.door; poi('dungeon', db.door.x, db.door.y, { n: Rg.dg.n });
  // world boss territory
  const ar = spot(Rg.hard, 7) || spot(null, 7) || [W / 2, 40];
  flat(ar[0] - 6, ar[1] - 6, ar[0] + 6, ar[1] + 6, Rg.hard === 'cinder' ? 'a' : Rg.hard === 'reef' ? 's' : Rg.hard === 'glacier' ? 'sn' : 'st');
  m.arenas.push({ bio: Rg.hard, boss: Rg.boss, x: ar[0], y: ar[1] }); poi('arena', ar[0], ar[1], { boss: Rg.boss });
  // treasure: chests ringed by the land, one hidden ember shard
  const chests = [];
  for (const [k, [b]] of Rg.bios.entries()) { const p = spot(b, 2); if (!p) continue; flat(p[0] - 1, p[1] - 1, p[0] + 1, p[1] + 1, getT(m, p[0], p[1]) === 'w' ? 's' : getT(m, p[0], p[1])); setO(m, p[0], p[1], { k: 'chest', id: id + '_c' + k, tier: 5 + (b === Rg.hard ? 1 : 0) }); poi('chest', p[0], p[1], { hidden: 1 }); chests.push(p); }
  const sh = spot(Rg.hard, 2); if (sh) { const [x, y] = sh; for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) { if (getO(m, x + k, y + j)) delObj(m, x + k, y + j); if (j || k) setO(m, x + k, y + j, { k: 'rock', v: Rg.hard === 'cinder' || Rg.hard === 'badlands' ? 'A' : 'S' }); } setO(m, x, y, { k: 'shard', id: 'sh_' + id }); m.secrets.push([x, y]); }
  // roads
  const P = p => [p[0], p[1]];
  [[gate, [tx, ty + 4]], [[tx, ty - 1], [m.dgDoor.x, m.dgDoor.y + 1]], [[tx, ty - 1], [ar[0], ar[1] + 7]], ...chests.map(c => [[tx, ty], [c[0], c[1] + 2]])].forEach(([a, b]) => carvePath(m, P(a), P(b)));
  for (const [x, y] of doors) for (let k = 0; k < 2; k++) if (getO(m, x, y + k)) delObj(m, x, y + k);
  // waystones and the town sign go in last, so no road clears them away
  for (const [x, y, wid] of [[tx, ty + 1, id + '_town'], [m.dgDoor.x + 3, m.dgDoor.y + 2, id + '_dg']]) { if (getO(m, x, y)) delObj(m, x, y); setT(m, x, y, getT(m, x, y) === 'w' ? 's' : getT(m, x, y)); putObj(m, x, y, { k: 'waystone', id: wid }); }
  if (getO(m, tx - 3, ty + 5)) delObj(m, tx - 3, ty + 5); setO(m, tx - 3, ty + 5, { k: 'sign', text: Rg.town.n + '. South: the road back to the Wilds.' });
  return m;
}

/* ---- dungeons: five generated floors, a boss on the last, rebuilt each visit ---- */
function genDungeon(id, n) {
  const Rg = REGIONS[id], G = Rg.dg, boss = n >= 5, W = boss ? 30 : 36, H = boss ? 24 : 26, m = newMap('dg_' + id, W, H, 'x');
  m.dg = id; m.dgFloor = n; m.dark = true; m.outdoor = false; m.theme = G.theme; m.name = G.n + ', floor ' + n; m.fishLoc = G.theme === 'magma' ? 'minelava' : G.theme === 'ice' ? 'mineice' : 'mine';
  caveCore(m, W, H, (S.seed + strSeed(id) * 13 + n * 977 + dayIndex() * 31) | 0, boss);
  const floors = []; for (let i = 0; i < W * H; i++) if (m.t[i] === 'c') floors.push(i);
  const startI = boss ? (H - 4) * W + Math.floor(W / 2) : floors[Math.floor(R() * floors.length)], sx = startI % W, sy = (startI / W) | 0;
  setT(m, sx, sy + 1, 'c'); setO(m, sx, sy, { k: 'upladder' }); m.start = { x: (sx + .5) * 16, y: (sy + 1.6) * 16 };
  const [D, far] = bfsFar(m, startI), lvl = G.lvl + n * 2;
  if (boss) {
    spawnEnemy(m, G.boss, W / 2 * 16, H / 2 * 16 - 8, lvl);
    setO(m, Math.floor(W / 2), 3, { k: 'chest', id: 'dg_' + id, tier: 6 });
    return m;
  }
  setO(m, far % W, (far / W) | 0, { k: 'ladder' });
  for (const i of floors) { if (m.o[i] || D[i] < 3) continue; if (R() < .18) m.o[i] = { k: wpick(G.ores, R()), cave: 1 }; }
  if (n % 2 === 0) { const i = floors.find(i => D[i] > 10 && !m.o[i]); if (i !== undefined) m.o[i] = { k: 'chest', tier: 5, mine: 1 }; }
  const cnt = 6 + n * 2; for (let i = 0; i < cnt; i++) { const c = floors[Math.floor(R() * floors.length)]; if (D[c] < 7 || m.o[c]) continue; spawnEnemy(m, wpick(G.pool, R()), (c % W + .5) * 16, (((c / W) | 0) + .8) * 16, lvl); }
  return m;
}

/* ---- the Wilds side: gates on the north edge, Corwin's ferry, waystones ---- */
function regionGateX(id) { return REGIONS[id].gx; }
function hookWilds() {
  const m = MAPS.wilds; if (!m) return; const W = m.w;
  R = rng(S.seed * 13 + 5);
  const from = m.mineDoor ? [m.mineDoor.x, m.mineDoor.y + 1] : [100, 80];
  for (const id of ['highmarch', 'frostmere', 'emberwaste']) {
    const gx = regionGateX(id);
    for (let y = 0; y < 4; y++) for (let x = gx - 2; x <= gx + 2; x++) { if (getO(m, x, y)) delObj(m, x, y); if (!m.solidB[y * W + x]) setT(m, x, y, 'd'); }
    carvePath(m, from, [gx, 3]);
    m.warps.push({ x: gx - 2, y: 0, w: 5, h: 1, to: id, tx: 0, ty: 0, dir: 3, lock: id });
    if (!getO(m, gx + 3, 4)) setO(m, gx + 3, 4, { k: 'sign', text: 'North: ' + REGIONS[id].n + '.' });
  }
  if (m.dock) { const [x, y] = m.dock; if (!getO(m, x, y)) setO(m, x, y, { k: 'ferry' }); }
}
function putWaystone(m, id, near) {
  S.wayPos = S.wayPos || {};
  if (S.wayPos[id]) { const [x, y] = S.wayPos[id], o = getO(m, x, y); if (!o || o.k !== 'waystone') { if (o) delObj(m, x, y); putObj(m, x, y, { k: 'waystone', id }); } return; }
  for (let r = 0; r < 8; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const x = near[0] + i, y = near[1] + j;
    if (!inb(m, x, y) || getO(m, x, y) || getO(m, x, y + 1) || TER[getT(m, x, y)].solid || TER[getT(m, x, y)].water || m.solidB[y * m.w + x] || m.warps.some(w => Math.abs(w.x - x) < 4 && Math.abs(w.y - y) < 3)) continue;
    putObj(m, x, y, { k: 'waystone', id }); S.wayPos[id] = [x, y]; return;
  }
}
const _initMapsR = initMaps;
initMaps = function () {
  if ((S.regionVer || 0) < 2) { for (const id in REGIONS) delete S.mapsave[id]; S.regionVer = 2; } // regions gained their own resources and towns
  for (const id in REGIONS) MAPS[id] = genRegion(id);
  _initMapsR();
  hookWilds();
  putWaystone(MAPS.farm, 'farm', [24, 4]);
  putWaystone(MAPS.village, 'village', [21, 4]);
  const cross = MAPS.wilds.poi.find(p => p.type === 'cross'); if (cross) putWaystone(MAPS.wilds, 'wilds', [cross.x + 3, cross.y + 2]);
};
for (const id in REGIONS) PERSIST.push(id);

/* travel targets that depend on generated positions */
function regionEntry(id) { const m = MAPS[id]; return m.entry; }
const _goMapR = goMap;
goMap = function (id, x, y, dir) {
  if (id.startsWith('dg_')) {
    const rid = id.slice(3); S.dgFloor = S.dgFloor || {};
    cur = genDungeon(rid, S.dgFloor[rid] || 1); S.p.x = cur.start.x; S.p.y = cur.start.y; S.p.map = REGIONS[rid] ? rid : 'farm';
    if (S.mounted) { S.mounted = false; toast('Your horse waits outside.'); }
    fishing = null; showFishUI(false); WEATHER.length = 0; SFX.door(); showBanner(cur.name); return;
  }
  if (id.startsWith('wilds_')) { // back from a region onto the Wilds side of its gate
    const rid = id.slice(6), wm = MAPS.wilds;
    if (rid === 'dock') { const [dx, dy] = wm.dock; return _goMapR('wilds', (dx - 1.5) * 16, (dy + .8) * 16, 2); }
    return _goMapR('wilds', (regionGateX(rid) + .5) * 16, 3.8 * 16, 0);
  }
  if (REGIONS[id] && !x && !y) { const e = regionEntry(id); return _goMapR(id, e.x, e.y, 3); }
  return _goMapR(id, x, y, dir);
};

/* ---- interactions ---- */
OBJ.waystone = { solid: 1, tall: 1 }; OBJ.ferry = { solid: 1 };
const _objSpriteR = objSprite;
objSprite = function (o, season) {
  if (o.k === 'waystone') return PIX.get('waystone.' + ((S.ways || {})[o.id] ? 1 : 0)) || SPR.statue;
  if (o.k === 'ferry') return PIX.get('ferry') || SPR.wreck;
  return _objSpriteR(o, season);
};
const WAYN = { farm: 'Your farm', village: 'Emberhollow village', wilds: 'The Wilds crossroads' };
function wayName(id) { if (WAYN[id]) return WAYN[id]; const [r, k] = id.split('_'); return REGIONS[r] ? (k === 'town' ? REGIONS[r].town.n : REGIONS[r].dg.n) : id; }
function wayWhere(id) { if (WAYN[id]) return id; return id.split('_')[0]; }
function openWaystones(here) {
  openModal('Waystones', [{ id: 'w', label: 'Travel', render: b => {
    b.append(el('p', { class: 'note' }, 'Touch a waystone to attune to it. From any waystone you can step to another you\'ve attuned.'));
    const L = el('div', { class: 'list' });
    for (const id of Object.keys(S.ways || {})) {
      const mid = wayWhere(id), m = MAPS[mid]; if (!m) continue; let pos = (S.wayPos || {})[id];
      if (!pos) for (let i = 0; i < m.o.length; i++) if (m.o[i] && m.o[i].k === 'waystone' && m.o[i].id === id) { pos = [i % m.w, (i / m.w) | 0]; break; }
      if (!pos) continue;
      L.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, wayName(id)), el('small', null, id === here ? 'You are here.' : (m.name || ''))),
        el('button', { class: 'btn' + (id === here ? ' off' : ''), on: () => { if (id === here) return; closeModal(); const m2 = S.mounted; _goMapR(mid, (pos[0] + .5) * 16, (pos[1] + 1.8) * 16, 0); S.mounted = m2 && cur.outdoor; SFX.secret(); } }, 'Travel')));
    }
    b.append(L);
  } }]);
}
const _objInteractR = objInteract;
objInteract = function (m, x, y, o) {
  if (o.k === 'waystone') return { label: (S.ways || {})[o.id] ? 'Waystone' : 'Attune', fn: () => { S.ways = S.ways || {}; if (!S.ways[o.id]) { S.ways[o.id] = 1; SFX.secret(); toast('The rune wakes under your hand: ' + wayName(o.id) + '.', 'lvl'); return; } openWaystones(o.id); } };
  if (o.k === 'ferry') return { label: 'Ferry', fn: () => { if (!regionOpen('saltreach')) { toast('Corwin shakes his head. "Not while Old Snapper rules the shore. Nothing gets past those claws."'); return; } goMap('saltreach'); toast('Corwin rows you out to the Saltreach.'); } };
  if (m.dg && o.k === 'ladder') return { label: 'Descend', fn: () => { S.dgFloor = S.dgFloor || {}; S.dgFloor[m.dg] = m.dgFloor + 1; S.dgBest = S.dgBest || {}; S.dgBest[m.dg] = Math.max(S.dgBest[m.dg] || 1, m.dgFloor + 1); goMap('dg_' + m.dg); } };
  if (m.dg && o.k === 'upladder') return { label: 'Climb', fn: () => { const d = MAPS[m.dg].dgDoor; _goMapR(m.dg, (d.x + .5) * 16, (d.y + 1.7) * 16, 0); } };
  return _objInteractR(m, x, y, o);
};
const _doorActionR = doorAction;
doorAction = function (act, who) {
  const rid = cur && cur.region, Rg = rid && REGIONS[rid];
  if (!Rg || !act.startsWith('r_')) return _doorActionR(act, who);
  if (act === 'r_dg') {
    const best = (S.dgBest || {})[rid] || 1, fl = [1]; if (best >= 3) fl.push(3); if (best >= 5) fl.push(5);
    return openModal(Rg.dg.n, [{ id: 'd', label: 'Descend', render: b => {
      b.append(el('p', { class: 'note' }, 'Five floors down, something old keeps watch. Floors you\'ve reached (3 and 5) can be taken straight from here.'));
      const g2 = el('div', { class: 'acts wrap' }); fl.forEach(f => g2.append(el('button', { class: 'btn', on: () => { closeModal(); S.dgFloor = S.dgFloor || {}; S.dgFloor[rid] = f; goMap('dg_' + rid); } }, 'Floor ' + f))); b.append(g2);
    } }]);
  }
  if (act === 'r_trade') return openModal(Rg.town.n + ' market', [
    { id: 'buy', label: 'Buy', render: b => { b.append(el('p', { class: 'note' }, 'Seeds, timber and ore you won\'t find in Emberhollow.')); const L = el('div', { class: 'list' }); Rg.trade.forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L); } },
    { id: 'sell', label: 'Sell', render: b => { b.append(el('p', { class: 'note' }, 'Traders up here pay well for food from the lowlands.')); sellList(b, 'shop', id => ['crop', 'food', 'artisan', 'animal'].includes(IT[id].t)); } }]);
  if (act === 'r_inn') return openModal(Rg.town.n + ' inn', [{ id: 'eat', label: 'Meals', render: b => {
    b.append(el('p', { class: 'note' }, 'Rumor: ' + pickR(RUMORS)));
    const L = el('div', { class: 'list' }); Rg.meals.forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L);
    b.append(el('div', { class: 'acts' }, el('button', { class: 'btn', on: () => { if (S.gold < 300) { toast('A room is 300g.'); return; } S.gold -= 300; S.p.hp = maxHP(); S.p.st = maxST(); SFX.ok(); toast('You rest by the fire. Health and energy restored.'); refresh(); } }, 'Rest (300g)')));
  } }]);
  if (act === 'r_smith') return openModal(Rg.town.n + ' forge', [{ id: 'forge', label: 'Forge', render: b => { if (!MODAL.opts.st || MODAL.opts.st === 'forge') MODAL.opts.st = 'furnace'; MODAL.opts.station = 'forge'; renderCraft(b); } }]);
  toast(pickR(['Smoke rises from the chimney, but no one answers.', 'A voice calls through the door: "Come back when the road\'s safer."', 'The shutters are closed against the wind.']));
};
DOORL.r_dg = 'Descend'; DOORL.r_trade = 'Market'; DOORL.r_inn = 'Inn'; DOORL.r_smith = 'Forge'; DOORL.r_house = 'Knock';

/* ---- spawns, fishing, discovery ---- */
const _wildSpawnsR = wildSpawns;
wildSpawns = function (m, dt) {
  _wildSpawnsR(m, dt);
  if (m.safe) m.ents = m.ents.filter(e => !(e.type === 'enemy' && !EN[e.k].boss && dist(e.x / 16, e.y / 16, m.safe[0], m.safe[1]) < 18));
};
const _fishLocsR = fishLocs;
fishLocs = function () {
  const m = cur; if (!m.region) return _fishLocsR();
  const [tx, ty] = faceTile(), t = getT(m, tx, ty);
  const b = BIOMES[m.bio[ty * m.w + tx] || 0];
  if (TER[t].lava) return ['cinderlava', 'lava'];
  return { pinevale: ['alpine', 'river', 'lake'], peaks: ['alpine'], highlands: ['alpine', 'river'], tundra: ['glacial', 'ice'], glacier: ['glacial', 'ice'], badlands: ['cinderlava', 'lava'], cinder: ['cinderlava', 'lava'], isles: ['deepsea', 'ocean'], reef: ['deepsea', 'ocean'] }[b] || ['lake'];
};
const _checkPOIsR = checkPOIs;
checkPOIs = function () {
  const m = cur; if (!m.region) return _checkPOIsR();
  const tx = S.p.x / 16, ty = S.p.y / 16; S.rpoi = S.rpoi || {};
  const b = BIOMES[m.bio[Math.floor(ty) * m.w + Math.floor(tx)]]; if (b !== m.lastBio) { m.lastBio = b; showBanner(BIONAME[b]); }
  m.poi.forEach((p, i) => { const k = m.id + i; if (!S.rpoi[k] && dist(tx, ty, p.x, p.y) < 7) { S.rpoi[k] = 1; const nm = p.n || (p.type === 'arena' ? EN[p.boss].n + '\'s territory' : p.type === 'chest' ? 'A hidden cache' : ''); if (nm) showBanner(nm); } });
};

/* ---- the map: a region shows its own chart; the Wilds chart lists the roads out ---- */
const RMAPC = {};
function regionMapCanvas(m) {
  if (!RMAPC[m.id]) RMAPC[m.id] = mk(m.w, m.h, x => { const d = x.createImageData(m.w, m.h); for (let i = 0; i < m.w * m.h; i++) { const t = m.t[i]; let c = BIOCOL[BIOMES[m.bio[i]]]; if (t === 'w') c = '#2f74b8'; else if (t === 'l') c = '#e8541a'; else if (t === 'r') c = '#6a6258'; else if (t === 'd' || t === 'b') c = '#c8a878'; else if (t === 'i') c = '#bfe6f5'; else if (t === 'p') c = '#d8c8a8'; const v = hx2(c); d.data.set([v[0], v[1], v[2], 255], i * 4); } for (const b of m.bld) for (let j = 0; j < b.h; j++) for (let i = 0; i < b.w; i++) d.data.set([138, 74, 50, 255], ((b.y + j) * m.w + b.x + i) * 4); x.putImageData(d, 0, 0); });
  return mk(m.w * 3, m.h * 3, x => {
    x.imageSmoothingEnabled = false; x.drawImage(RMAPC[m.id], 0, 0, m.w * 3, m.h * 3);
    x.font = '14px Fredoka, sans-serif'; x.textAlign = 'center';
    const ic = { town: '⌂', dungeon: '⛏', arena: '☠', chest: '✕' };
    m.poi.forEach((p, i) => { if (!(S.rpoi || {})[m.id + i]) return; x.fillStyle = OUT; x.fillText(ic[p.type] || '•', p.x * 3 + 1, p.y * 3 + 6); x.fillStyle = p.type === 'arena' && S.bosses[p.boss] ? '#7ac04a' : '#fff6d8'; x.fillText(ic[p.type] || '•', p.x * 3, p.y * 3 + 5); });
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(S.p.x / 16 * 3, S.p.y / 16 * 3, 5, 0, 6.283); x.fill(); x.fillStyle = '#e8342a'; x.beginPath(); x.arc(S.p.x / 16 * 3, S.p.y / 16 * 3, 3, 0, 6.283); x.fill();
  });
}
const hx2 = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const _renderMapR = renderMap;
renderMap = function (b) {
  if (cur.region) {
    const c = regionMapCanvas(cur); c.className = 'wmap'; const box = el('div', { class: 'mapbox' }, c);
    b.append(el('p', { class: 'note' }, REGIONS[cur.region].n + '. ⌂ town  ⛏ dungeon  ☠ world boss  ✕ cache'), box);
    setTimeout(() => { box.scrollLeft = S.p.x / 16 * 3 * (c.clientWidth / c.width) - box.clientWidth / 2; box.scrollTop = S.p.y / 16 * 3 * (c.clientHeight / c.height) - box.clientHeight / 2; }, 0);
  } else _renderMapR(b);
  const L = el('div', { class: 'list' });
  for (const id in REGIONS) { const Rg = REGIONS[id], open = regionOpen(id);
    L.append(el('div', { class: 'rrow' + (open ? '' : ' done') }, el('div', { class: 'qck' }, open ? '✓' : '–'), el('div', { class: 'rtxt' }, el('b', null, Rg.n),
      el('small', null, open ? (Rg.ferry ? 'Corwin\'s ferry from the dock on the coast.' : 'The road north from the Wilds.') + ' Town: ' + Rg.town.n + '. Dungeon: ' + Rg.dg.n + '.' : 'Closed. ' + EN[Rg.gate].n + ' still holds the way.')))); }
  b.append(el('h3', null, 'Regions'), L);
};

/* the north gates: locked roads turn you back */
function regionLocked(w) {
  const Rg = REGIONS[w.lock]; S.p.y += 20; S.p.dir = 0;
  toast('The road to ' + Rg.n + ' is closed. Travellers say no one gets through while ' + EN[Rg.gate].n + ' still rules these lands.');
}

/* cliffs take the ground of their biome (snow, ash, bare rock), not grass */
const RCLIFF = { peaks: 'st', tundra: 'sn', glacier: 'sn', badlands: 'a', cinder: 'a', isles: 's', reef: 's' };
const _paintKeyR = paintKey;
paintKey = function (m, x, y) {
  if (m.region) { const X = clamp(x, 0, m.w - 1), Y = clamp(y, 0, m.h - 1), i = Y * m.w + X, t = m.t[i]; if (t === 'r' || t === 'mo') return RCLIFF[BIOMES[m.bio[i]]] || 'g'; }
  return _paintKeyR(m, x, y);
};
