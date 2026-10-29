/* ================= Phase 11b: what each region is made of =================
   Every region has its own ore (and the gear tier smelted from it), wood, forage, fish,
   crops, food, monster parts and boss trophies, so going further out is how you get
   better things. The tiers slot into the old ladder by strength:
     gold < COBALT (Highmarch, Melee/Defence 35) < mythril < TIDESTEEL (Saltreach, 45)
     < frostsilver < obsidian < RIMESTEEL (Frostmere, 57) < adamant < dragonscale
     < CINDERSTEEL (Emberwaste, 75) < starforged.
   Loaded before u_regions.js, which places these things in the regions. */

/* ---- materials ---- */
[['cobalt_ore', 'Cobalt Ore', 'ore', 90, 'ore', '#3a7aff', '#4a4a5a'], ['tide_ore', 'Tidestone', 'ore', 110, 'ore', '#2ae8c8', '#3a4a48'],
 ['rime_ore', 'Rimestone', 'ore', 140, 'ore', '#c8f4ff', '#5a7a98'], ['cinder_ore', 'Cinderite', 'ore', 190, 'ore', '#ff3a0a', '#2a2224'],
 ['cobalt_bar', 'Cobalt Bar', 'bar', 680, 'bar', '#3a7aff'], ['tide_bar', 'Tidesteel Bar', 'bar', 820, 'bar', '#2ae8c8'],
 ['rime_bar', 'Rimesteel Bar', 'bar', 1150, 'bar', '#c8f4ff'], ['cinder_bar', 'Cindersteel Bar', 'bar', 1900, 'bar', '#ff5a1a'],
 ['stonepine_log', 'Stonepine Log', 'mat', 45, 'log', '#5a6a74'], ['mangrove_wood', 'Mangrove Wood', 'mat', 50, 'log', '#7a5a3a'],
 ['frostwood_log', 'Frostwood Log', 'mat', 65, 'log', '#c8e6f6'], ['charwood_log', 'Charwood Log', 'mat', 85, 'log', '#2a2020'],
 ['garnet', 'Garnet', 'gem', 320, 'gem', '#a8102a'], ['pearl', 'Pearl', 'gem', 700, 'gem', '#f4ece0'], ['glacite', 'Glacite', 'gem', 950, 'gem', '#9ae8ff'], ['sunstone', 'Sunstone', 'gem', 1300, 'gem', '#ff9a1a'],
 ['griffin_feather', 'Griffin Feather', 'loot', 160, 'feather', '#c8a050'], ['troll_hide', 'Troll Hide', 'loot', 150, 'hide', '#6a7a6a'], ['bear_pelt', 'Bear Pelt', 'loot', 120, 'hide', '#5a3a22'],
 ['harpy_plume', 'Harpy Plume', 'loot', 150, 'feather', '#8a6ab8'], ['reef_shell', 'Reef Shell', 'loot', 120, 'shard', '#d86a8a'], ['jelly_gel', 'Moon Jelly', 'loot', 110, 'goo', '#8a7ad8'],
 ['mammoth_tusk', 'Mammoth Tusk', 'loot', 300, 'fang', '#f0e8d0'], ['rime_essence', 'Rime Essence', 'loot', 260, 'goo', '#9ad8ff'],
 ['hound_ember', 'Hound Ember', 'loot', 260, 'shard', '#ff6a1a'], ['salamander_scale', 'Salamander Scale', 'loot', 300, 'scale', '#c8401a'], ['basalt_core', 'Basalt Core', 'loot', 420, 'core', '#3a2430'],
 ['tyrant_heart', 'Heart of the Tyrant', 'loot', 3000, 'heart', '#7affd8'], ['forge_ember', 'Undying Forge-Ember', 'loot', 2000, 'core', '#ffb04a'],
 ['rime_crown', 'Rime Crown', 'loot', 3200, 'core', '#9ad8ff'], ['glacier_core', 'Glacier Core', 'loot', 2200, 'core', '#3a8aff'],
 ['drake_heart', 'Drake Heart', 'loot', 4000, 'heart', '#ff3a0a'], ['brood_egg', 'Ash Brood Egg', 'loot', 2400, 'egg', '#5a1a0a'],
 ['captain_compass', 'Captain\'s Compass', 'loot', 3000, 'artifact', '#d8b84a'], ['kraken_ink', 'Kraken Ink', 'loot', 2000, 'bottle', '#2a1a40'],
].forEach(([id, n, t, p, shp, c, c2]) => I(id, n, t, p, shp, c, c2));
MINERALS.push('garnet', 'pearl', 'glacite', 'sunstone');

/* ---- forage ---- */
[['edelweiss', 'Edelweiss', 180, 'flower', '#f4f4ec'], ['mountain_thyme', 'Mountain Thyme', 120, 'leaf', '#7a9a5a'], ['kelp', 'Kelp', 70, 'leaf', '#3a7a4a'], ['pearl_oyster', 'Pearl Oyster', 160, 'egg', '#c8c0b8'],
 ['snowcap', 'Snowcap Mushroom', 220, 'mush', '#e8f0f8'], ['frost_lichen', 'Frost Lichen', 160, 'leaf', '#9ad0c0'], ['ashroot', 'Ashroot', 240, 'root', '#5a2a1a', '#ff6a1a'], ['fire_pepper', 'Fire Pepper', 280, 'berry', '#ff3a1a']]
  .forEach(([id, n, p, shp, c, c2]) => I(id, n, 'forage', p, shp, c, c2 || null, { eat: shp === 'flower' || shp === 'egg' ? null : [Math.round(p / 10) + 2, Math.round(p / 6) + 6] }));
const RFORAGE = { pinevale: ['mountain_thyme', 'edelweiss'], peaks: ['edelweiss', 'mountain_thyme'], highlands: ['mountain_thyme'], isles: ['kelp'], reef: ['pearl_oyster', 'kelp'],
  tundra: ['frost_lichen', 'snowcap'], glacier: ['snowcap'], badlands: ['ashroot', 'fire_pepper'], cinder: ['fire_pepper'] };

/* ---- fish: [id, name, price, colour, locs, seasons, time, difficulty, weight, motion] ---- */
const RFISH = [
  ['alpine_char', 'Alpine Char', 260, '#d86a5a', ['alpine'], [0, 1, 2], 'any', 3, 22, 'dart'], ['stone_loach', 'Stone Loach', 180, '#7a7a6a', ['alpine'], [0, 1, 2, 3], 'any', 2, 26, 'smooth'],
  ['swordfish', 'Swordfish', 520, '#4a6a9a', ['deepsea'], [1, 2], 'day', 4, 14, 'dart'], ['moonfish', 'Moonfish', 640, '#e8e0f8', ['deepsea'], [0, 1, 2, 3], 'night', 4, 12, 'smooth'],
  ['ice_pike', 'Ice Pike', 480, '#9ad0f0', ['glacial'], [0, 1, 2, 3], 'any', 4, 16, 'dart'], ['glacier_cod', 'Glacier Cod', 360, '#c8d8e8', ['glacial'], [2, 3], 'any', 3, 20, 'smooth'],
  ['cinder_eel', 'Cinder Eel', 720, '#ff5a1a', ['cinderlava'], [0, 1, 2, 3], 'any', 5, 12, 'dart'], ['obsidian_ray', 'Obsidian Ray', 900, '#3a2a4a', ['cinderlava'], [0, 1, 2, 3], 'night', 5, 10, 'smooth'],
];
for (const f of RFISH) { FISH.push(f); I(f[0], f[1], 'fish', f[2], 'fish', f[3], null, { eat: [Math.round(f[2] / 8) + 4, Math.round(f[2] / 6) + 6], fish: { loc: f[4], s: f[5], time: f[6], diff: f[7], w: f[8], mot: f[9] } }); I('smoked_' + f[0], 'Smoked ' + f[1], 'artisan', f[2] * 2, 'fish', sh(f[3], -1.5), '#5a3a20', { eat: [Math.round(f[2] / 5), Math.round(f[2] / 4)] }); }

/* ---- crops sold only in their region's market (secret keeps them out of Mara's store) ---- */
const RCROPS = {
  highmarch: [['alpine_barley', 'Alpine Barley', 6, [0, 1, 2], 150, 'long', '#e8d080', 0, 0, 1, 'grain'], ['mountain_berry', 'Mountain Berry', 9, [1, 2], 110, 'berry', '#4a3a8a', 0, 3, 2, 'fruit']],
  saltreach: [['sea_grape', 'Sea Grape', 8, [1], 100, 'berry', '#5ab87a', 0, 3, 2, 'fruit'], ['saffron', 'Saffron', 9, [2], 380, 'flower', '#b05ad8', 0, 0, 1, 'flower']],
  frostmere: [['ice_turnip', 'Ice Turnip', 5, [3], 170, 'root', '#e0f4ff', '#6aa0c8', 0, 1, 'veg'], ['snow_lotus', 'Snow Lotus', 12, [3], 540, 'flower', '#f4f8ff', 0, 0, 1, 'flower']],
  emberwaste: [['dragon_pepper', 'Dragon Pepper', 7, [1], 200, 'long', '#c8101a', 0, 3, 1, 'fruit'], ['cinder_melon', 'Cinder Melon', 14, [1, 2], 720, 'round', '#3a2a2a', '#ff5a1a', 0, 1, 'fruit']],
};
for (const r in RCROPS) for (const [id, n, d, s, p, shp, c, c2, re, y, kind] of RCROPS[r]) {
  CROPS[id] = { n, d, s, p, sh: shp, c, c2: c2 || null, re, y, kind, secret: 1, region: r };
  I(id + '_seed', n + (kind === 'flower' ? ' Bulbs' : ' Seeds'), 'seed', Math.round(p * (re ? .7 : .55)), 'seed', c, null, { crop: id });
  I(id, n, 'crop', p, shp, c, c2 || null, { eat: kind === 'flower' ? null : [Math.round(p / 12) + 3, Math.round(p / 7) + 6], kind });
}

/* ---- food: regional dishes with strong buffs ---- */
[['highland_stew', 'Highland Stew', 520, 'food', '#a8743f', [120, 140], { def: 8, maxhp: 20, dur: 360 }, { alpine_barley: 2, mountain_thyme: 1, potato: 1 }, 6],
 ['edelweiss_tea', 'Edelweiss Tea', 380, 'bottle', '#f4f4ec', [60, 120], { regen: 1, dur: 300 }, { edelweiss: 1, honey: 1 }, 5],
 ['pearl_chowder', 'Pearl Chowder', 640, 'food', '#f0e8d8', [130, 150], { luck: 2, magnet: 1, dur: 360 }, { pearl_oyster: 2, milk: 1, potato: 1 }, 6],
 ['saffron_paella', 'Saffron Paella', 900, 'food', '#f2b030', [170, 190], { atk: 10, crit: .06, dur: 360 }, { saffron: 1, kelp: 1, $fish: 1, wheat: 1 }, 7],
 ['lotus_broth', 'Lotus Broth', 980, 'food', '#e8f4ff', [180, 200], { regen: 2, def: 6, dur: 420 }, { snow_lotus: 1, snowcap: 1 }, 8],
 ['lichen_bread', 'Lichen Bread', 420, 'bread', '#9ad0c0', [90, 140], { def: 6, dur: 300 }, { frost_lichen: 2, wheat: 2 }, 6],
 ['dragon_chili', 'Dragon Chili', 1100, 'food', '#c8101a', [190, 200], { atk: 14, fireres: 1, dur: 420 }, { dragon_pepper: 2, ashroot: 1, $veg: 1 }, 9],
 ['melon_sorbet', 'Cinder Melon Sorbet', 1300, 'food', '#ff7a3a', [160, 220], { spd: .2, aspd: .1, dur: 360 }, { cinder_melon: 1, ice_shard: 1, honey: 1 }, 9],
].forEach(([id, n, p, shp, c, eat, buff, need, l]) => { FOODS.push([id, n, p, shp, c, eat, buff]); I(id, n, 'food', p, shp, c, null, { eat, buff }); RC.push([id, 1, need, 'kitchen', ['cooking', l]]); });

/* ---- gear tiers: appended to TIERS (requirements by index) but with stats where they belong ---- */
const RTIERS = [ // key, name, colour, bar, stat tier (fractional index into the old ladder), Melee/Defence, old combat level, smithing (1-10), wood, set bonus, extra part
  ['cobalt', 'Cobalt', '#3a7aff', 'cobalt_bar', 6.5, 35, 6, 6, 'stonepine_log', ['+10% damage, +20 health', { dmg: .1, maxhp: 20 }], 'troll_hide'],
  ['tide', 'Tidesteel', '#2ae8c8', 'tide_bar', 7.6, 45, 7, 6, 'mangrove_wood', ['+12% move speed, +6% attack speed', { spd: .12, aspd: .06 }], 'reef_shell'],
  ['rime', 'Rimesteel', '#c8f4ff', 'rime_bar', 9.5, 57, 8, 8, 'frostwood_log', ['Hits slow enemies, +6 defence', { slow: 1, def: 6 }], 'mammoth_tusk'],
  ['cinder', 'Cindersteel', '#ff5a1a', 'cinder_bar', 11.5, 75, 10, 9, 'charwood_log', ['Hits burn, fire immunity, +15% damage', { burn: 1, fireres: 1, dmg: .15 }], 'salamander_scale'],
];
const atkAt = t => { const a = Math.floor(t), f = t - a; return TIER_ATK[a] + (TIER_ATK[Math.min(TIER_ATK.length - 1, a + 1)] - TIER_ATK[a]) * f; };
for (const [tk, tn, col, mat, eff, rq, cl, sl, wood, setb, part] of RTIERS) {
  const ti = TIERS.length; TIERS.push([tk, tn, col, mat, 3]); SETB[tk] = setb;
  TIER_REQ_RS[ti] = rq; TIER_REQ[ti] = cl; TIER_ATK[ti] = Math.round(atkAt(eff));
  for (const wk in WTYPE) {
    const W = WTYPE[wk], atk = Math.round(atkAt(eff) * W.m), id = tk + '_' + wk;
    I(id, tn + ' ' + W.n, 'weapon', atk * 30 + 20, wk, col, wk === 'bow' ? '#f2e6c4' : '#5a3a22', { slot: 'weapon', atk, wt: wk, tier: tk, ti, cd: W.cd });
    const need = { [mat]: W.cost }; if (wk === 'spear' || wk === 'bow') need[wood] = 4; if (wk === 'bow') need.fiber = 10; if (wk === 'sword' || wk === 'hammer') need[part] = 1;
    RC.push([id, 1, need, 'anvil', ['smithing', sl]]);
  }
  for (const sk in ASLOT) {
    const [an, shp, base, mul] = ASLOT[sk], def = Math.round(base + (eff - 1) * mul), id = tk + '_' + sk;
    I(id, tn + ' ' + an, 'armor', def * 60 + 40, shp, col, null, { slot: sk, def, tier: tk, ti, block: sk === 'shield' ? .05 + eff * .018 : 0 });
    const need = { [mat]: ASLOT[sk][4] }; if (sk === 'body') need[part] = 2; if (sk === 'shield') need[wood] = 6;
    RC.push([id, 1, need, 'anvil', ['smithing', sl]]);
  }
}
RC.push(['cobalt_bar', 1, { cobalt_ore: 5, coal: 2 }, 'furnace', ['smithing', 6]], ['tide_bar', 1, { tide_ore: 5, coal: 2, kelp: 1 }, 'furnace', ['smithing', 6]],
  ['rime_bar', 1, { rime_ore: 5, coal: 3, rime_essence: 1 }, 'furnace', ['smithing', 8]], ['cinder_bar', 1, { cinder_ore: 5, coal: 4, hound_ember: 1 }, 'furnace', ['smithing', 9]]);

/* ---- trophy rings: each boss part becomes a ring worth chasing ---- */
[['ring_tyrant', 'Tyrant Band', 'tyrant_heart', { def: 6, maxhp: 40 }, '+6 defence, +40 health', 'cobalt_bar', 7],
 ['ring_forge', 'Forgefire Ring', 'forge_ember', { atk: 6, aspd: .08 }, '+6 attack, +8% attack speed', 'cobalt_bar', 6],
 ['ring_captain', 'Captain\'s Compass Ring', 'captain_compass', { spd: .12, luck: 2 }, '+12% speed, +2 luck', 'tide_bar', 7],
 ['ring_tide', 'Tidecaller\'s Ring', 'kraken_ink', { magnet: 1, regen: 1 }, 'Larger pickup radius, slow regeneration', 'tide_bar', 6],
 ['ring_rime', 'Rime Circlet', 'rime_crown', { crit: .1, slow: 1 }, '+10% critical hits, hits slow', 'rime_bar', 8],
 ['ring_glacier', 'Glacier Ring', 'glacier_core', { def: 9 }, '+9 defence', 'rime_bar', 8],
 ['ring_drake', 'Drakeheart Signet', 'drake_heart', { atk: 12, fireres: 1, burn: 1 }, '+12 attack, hits burn, fire immunity', 'cinder_bar', 10],
 ['ring_brood', 'Brood Ring', 'brood_egg', { maxhp: 50, regen: 1 }, '+50 health, slow regeneration', 'cinder_bar', 9],
].forEach(([id, n, troph, b, d, bar, sl]) => { I(id, n, 'ring', IT[troph].p * 1.5, 'ring', IT[troph].c, '#ffd040', { slot: 'ring', bonus: b, desc: d }); RC.push([id, 1, { [troph]: 1, [bar]: 2 }, 'anvil', ['smithing', sl]]); });

/* ---- ore rocks and woods in the world ---- */
Object.assign(OBJ, {
  ore_cobalt: { solid: 1, hp: 18, tool: 'pick', tlvl: 3, drop: [['cobalt_ore', 1, 3]], xp: ['mining', 34], ore: 1 },
  ore_tide: { solid: 1, hp: 22, tool: 'pick', tlvl: 3, drop: [['tide_ore', 1, 3]], xp: ['mining', 42], ore: 1 },
  ore_rime: { solid: 1, hp: 30, tool: 'pick', tlvl: 4, drop: [['rime_ore', 1, 2]], xp: ['mining', 55], ore: 1 },
  ore_cinder: { solid: 1, hp: 40, tool: 'pick', tlvl: 4, drop: [['cinder_ore', 1, 2]], xp: ['mining', 75], ore: 1 },
});
Object.assign(NODE_REQ, { ore_cobalt: 35, ore_tide: 45, ore_rime: 57, ore_cinder: 72 });
Object.assign(TREE_REQ, { stonepine: 30, mangrove: 40, frostwood: 55, charwood: 70 });
const RWOOD = { stonepine: ['stonepine_log', 40], mangrove: ['mangrove_wood', 50], frostwood: ['frostwood_log', 70], charwood: ['charwood_log', 95] };
const _gatherTickRD = gatherTick;
gatherTick = function () { // regional trees give their own wood (and more xp) instead of plain wood
  const G = GATHER, w = G && G.o && G.o.k === 'tree' && RWOOD[G.o.kind];
  if (!w) return _gatherTickRD();
  const D = OBJ.tree, saveDrop = D.drop, saveXp = D.xp;
  D.drop = [[w[0], 3, 5]]; D.xp = ['woodcutting', w[1]];
  try { _gatherTickRD(); } finally { D.drop = saveDrop; D.xp = saveXp; }
};
const _buildObjectsRD = buildObjects;
buildObjects = function () { _buildObjectsRD(); for (const k of ['ore_cobalt', 'ore_tide', 'ore_rime', 'ore_cinder']) { const c = PIX.get(k); if (c) SPR[k] = c; } };
