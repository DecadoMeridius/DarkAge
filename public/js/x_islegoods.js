/* What the isles' goods are for (asked 2026-11-07: moonpearls, coral, flamefruit, relic coins and the rest only sold).
   - Rings at an anvil: each guardian's trophy makes the best ring of its kind, and the pearls, coins and scales make lesser ones.
   - Dishes and two elixirs at any kitchen from the isles' fish and forage, with strong buffs. Each isle's recipes are
     learned the first time you land there (`ISLE_COOK`, S.known), so sailing out is how you get them.
   - Forging catalysts: cinder scales and coral cores join the frost fangs, siren scales, wisps and relic coins.
   - Mistwood branches burn long in a furnace or kiln. */
const ISLE_RINGS = [   // id, name, ingredients, bonus, description, smithing (old scale)
  ['ring_leviathan', 'Leviathan Ring', { leviathan_eye: 1, tide_bar: 3, moonpearl: 1 }, { def: 8, luck: 3, magnet: 1, regen: 1 }, '+8 defence, +3 luck, larger pickup radius, slow regeneration', 9],
  ['ring_atoll', 'Atoll Heart Ring', { atoll_heart: 1, cinder_bar: 2, ember_coral: 2 }, { atk: 14, burn: 1, fireres: 1 }, '+14 attack, hits burn, fire immunity', 10],
  ['ring_mistqueen', 'Mist Queen\'s Circlet', { mist_crown: 1, mythril_bar: 2, glowcap: 2 }, { spd: .15, crit: .1 }, '+15% speed, +10% critical hits', 9],
  ['ring_glassheart', 'Glass Heart Ring', { glass_heart: 1, rime_bar: 2, frost_pearl: 1 }, { def: 12, maxhp: 60, slow: 1 }, '+12 defence, +60 health, hits slow', 10],
  ['ring_drowned', 'Drowned King\'s Seal', { drowned_crown: 1, gold_bar: 3, crown_shard: 1 }, { atk: 10, def: 10, luck: 2, gold: .1 }, '+10 attack, +10 defence, +2 luck, +10% gold', 10],
  ['ring_moonpearl', 'Moonpearl Ring', { moonpearl: 1, gold_bar: 1 }, { luck: 2, maxst: 30 }, '+2 luck, +30 energy', 7],
  ['ring_frostpearl', 'Frost Pearl Ring', { frost_pearl: 1, gold_bar: 1, sea_glass: 2 }, { def: 6, regen: 1 }, '+6 defence, slow regeneration', 7],
  ['ring_sunken', 'Sunken Signet', { relic_coin: 3, drowned_crest: 1, gold_bar: 1 }, { gold: .1, luck: 1, magnet: 1 }, '+10% gold, +1 luck, larger pickup radius', 8],
  ['ring_siren', 'Siren\'s Band', { siren_scale: 3, tide_bar: 1 }, { aspd: .08, spd: .08 }, '+8% attack speed, +8% speed', 8],
  ['ring_mistwood', 'Mistwood Band', { mistwood_branch: 4, moon_kelp: 2, gold_bar: 1 }, { maxst: 40, magnet: 1 }, '+40 energy, larger pickup radius', 7],
];
for (const [id, n, need, b, d, sl] of ISLE_RINGS) {
  if (IT[id] || !Object.keys(need).every(k => IT[k])) continue;
  const lead = IT[Object.keys(need)[0]];
  I(id, n, 'ring', Math.round(Object.entries(need).reduce((a, [k, q]) => a + IT[k].p * q, 0) * 1.2), 'ring', lead.c, '#ffd040', { slot: 'ring', bonus: b, desc: d });
  RC.push([id, 1, need, 'anvil', ['smithing', sl]]);
}

const ISLE_DISHES = [   // id, name, price, shape, colour, eat [energy, health], buff, ingredients, cooking (old scale), isle that teaches it
  ['moonlit_sashimi', 'Moonlit Sashimi', 620, 'food', '#d8d8ff', [150, 170], { luck: 2, magnet: 1, dur: 420 }, { moonray: 1, moon_kelp: 1, salt: 1 }, 7, 'moonreef'],
  ['starfin_skewers', 'Starfin Skewers', 700, 'food', '#ffb0e0', [150, 160], { crit: .08, aspd: .06, dur: 360 }, { starfin: 1, star_coral: 1 }, 8, 'moonreef'],
  ['flamefruit_tart', 'Flamefruit Tart', 820, 'food', '#ff8a1a', [160, 200], { atk: 12, fireres: 1, dur: 420 }, { flamefruit: 2, flour: 1, butter: 1 }, 8, 'emberwhorl'],
  ['ember_snapper', 'Ember-Grilled Snapper', 760, 'food', '#e0502a', [170, 180], { atk: 8, burn: 1, dur: 360 }, { magma_snapper: 1, ember_coral: 1 }, 8, 'emberwhorl'],
  ['ash_eel_stew', 'Ash Eel Stew', 780, 'food', '#7a5a4a', [180, 200], { maxhp: 40, regen: 1, dur: 420 }, { ash_eel: 1, flamefruit: 1, potato: 1 }, 8, 'emberwhorl'],
  ['glowcap_risotto', 'Glowcap Risotto', 740, 'food', '#9affd8', [200, 160], { regen: 2, maxst: 40, dur: 420 }, { glowcap: 2, wheat: 1, butter: 1 }, 8, 'mistveil'],
  ['mist_carp_soup', 'Mist Carp Soup', 680, 'food', '#c8d8e8', [160, 170], { def: 8, regen: 1, dur: 420 }, { mist_carp: 1, glowcap: 1, moon_kelp: 1 }, 7, 'mistveil'],
  ['ghost_pike_pie', 'Ghost Pike Pie', 800, 'bread', '#e0e8f0', [170, 170], { spd: .15, dur: 360 }, { ghost_pike: 1, flour: 1, butter: 1 }, 8, 'mistveil'],
  ['wisp_draught', 'Wisp Draught', 650, 'bottle', '#c8f0ff', [80, 120], { spd: .2, dur: 300 }, { wisp_essence: 1, moon_kelp: 1 }, 7, 'mistveil'],
  ['crystal_cod_chowder', 'Crystal Cod Chowder', 720, 'food', '#d8f0ff', [170, 190], { def: 10, maxhp: 30, dur: 420 }, { crystal_cod: 1, milk: 1, potato: 1 }, 8, 'glasswater'],
  ['glass_eel_jelly', 'Glass Eel Jelly', 740, 'food', '#bfe8ff', [140, 160], { aspd: .1, dur: 360 }, { glass_eel: 1, sea_glass: 1, sugar: 1 }, 8, 'glasswater'],
  ['siren_tonic', 'Siren Tonic', 690, 'bottle', '#6ad8c8', [90, 140], { regen: 2, def: 6, dur: 360 }, { siren_scale: 1, sea_glass: 1, honey: 1 }, 8, 'glasswater'],
  ['kings_feast', 'Sunken King\'s Feast', 2400, 'food', '#d8b040', [260, 260], { atk: 12, def: 12, regen: 2, luck: 2, dur: 600 }, { crowned_grouper: 1, sunken_angler: 1, flamefruit: 1, glowcap: 1, star_coral: 1 }, 10, 'sunkencrown'],
];
const ISLE_COOK = {};
for (const [id, n, p, shp, c, eat, buff, need, l, isle] of ISLE_DISHES) {
  if (IT[id] || !Object.keys(need).every(k => IT[k])) continue;
  FOODS.push([id, n, p, shp, c, eat, buff]); I(id, n, 'food', p, shp, c, null, { eat, buff });
  RC.push([id, 1, need, 'kitchen', ['cooking', l]]);
  (ISLE_COOK[isle] = ISLE_COOK[isle] || []).push(id);
}
// landing on an isle teaches its dishes (the islanders' recipes, copied down at the pier)
EVT.on('map', id => {
  try {
    const m = /^isle_(\w+)$/.exec(id || ''); if (!S || !m || !ISLE_COOK[m[1]]) return;
    S.known = S.known || {}; const fresh = ISLE_COOK[m[1]].filter(k => !S.known[k]); if (!fresh.length) return;
    for (const k of fresh) S.known[k] = 1;
    setTimeout(() => toast('You copy down the islanders\' recipes: ' + fresh.map(k => IT[k].n).join(', ') + '.', 'lvl'), 1200);
  } catch (e) { console.error(e); }
});

if (typeof CATALYST !== 'undefined') Object.assign(CATALYST, { cinder_scale: ['burning', 'fireproof'], coral_core: ['sturdy', 'vital'] });
if (typeof FUEL !== 'undefined') FUEL.mistwood_branch = 20;
