/* ================= Phase 9: balancing pass =================
   The game is meant to be played slowly, a bit at a time, over months. Targets
   (BALANCE_TARGETS below, also in docs/GDD.md) were checked with the pacing simulation
   in this file (window.simPacing). What changed and why:
   - QUALITY is worth a modest premium (silver 1.15x, gold 1.35x, ember 1.7x) and every
     quality roll uses one curve on the 1-99 skill level (qualityRoll): gold tops out
     around a quarter of harvests at level 99 with the best fertiliser; ember is rare.
     Before, high-level players got gold or better on almost everything at up to 2x price.
   - PERKS that raised prices now give +10-20% (were +25-50%); double-harvest chances halved.
   - ANIMALS paid for themselves in about a week (pigs in 8 days); products are cut so a
     new animal pays back in roughly 3-4 weeks and is a long-term earner.
   - CROPS sell for 20% less (regrowing crops 32% less, they out-earned replanted ones 2-4x)
     and seeds cost 15% more; sunberry, the outlier, drops further.
   - COSTS: buildings ~1.6x (cottage 1600, coop 2400, barn 5000, stable 6000), tool upgrades
     iron 2000 / gold 5000 / mythril 12000, so year-one goals take the seasons they should.
   Simulation (40 tiles, best crops, an hour of odd jobs a day): ~7k by the end of spring,
   ~19k by the end of summer, ~39k by the end of year one.
   - XP: life skills use the original XP amounts (XP_MULT 1, was 40); combat XP per damage
     is cut (melee/ranged 0.6, constitution 0.2, defence 1 per damage taken, were 4/1.33/2).
     Above level 10, XP scales with the level (xpScale) so 99 is ~200 hours of one skill:
     about 1h to 10, 5h to 30, 18h to 50, 50h to 70. */

const BALANCE_TARGETS = [
  ['Spring, year 1', 'tent, a field of 20-40 tiles, first tool upgrade or two, 5-8k earned'],
  ['Summer, year 1', 'cottage built, coop with a few chickens, ~15k earned in total, mine floor 10'],
  ['Fall, year 1', 'barn or first plot (13k), first automation line (smelter + belts)'],
  ['Winter, year 1', 'mine floor 20, combat ~30, a horse'],
  ['Year 2', 'two or three plots, full barn, artisan goods as the main income, skills 40-60'],
  ['Year 3+', 'regions and storylines, skills 70+, 99s are long-term goals'],
];

/* ---- quality ---- */
QMULT[1] = 1.15; QMULT[2] = 1.35; QMULT[3] = 1.7;
function qualityRoll(L, bonus = 0) { // L: 1-99 skill level; bonus: fertiliser/perk (0-0.4)
  const r = Math.random(), ember = L >= 80 && bonus >= .3 ? .02 : 0, gold = .01 + L * .0015 + bonus * .25, silver = .08 + L * .0035 + bonus * .6;
  return r < ember ? 3 : r < ember + gold ? 2 : r < ember + gold + silver ? 1 : 0;
}
const lv = k => (S.sk[k] && S.sk[k].L) || 1;
harvest = function (m, tx, ty) {
  const s = m.soil[ty * m.w + tx], C = CROPS[s.crop.k], L = lv('farming');
  const bonus = (s.fert === 'rich_compost' ? .3 : s.fert === 'compost' ? .12 : 0) + (hasPerk('agronomist') ? .1 : 0);
  const q = qualityRoll(L, bonus);
  let n = C.y > 1 ? ri(1, C.y) : 1; if (Math.random() < L * .002 + (hasPerk('abundance') ? .1 : 0)) n++;
  give(s.crop.k, n, q); S.stats.harvest += n; addXP('farming', Math.max(3, Math.round(C.p / 10))); SFX.pick();
  if (C.re) s.crop.age = C.d - C.re; else { s.crop = null; s.fert = null; }
  sparkle(tx, ty, '#f5e08a');
};
forageQ = function () { return qualityRoll(lv('foraging'), hasPerk('botanist') ? .2 : 0); };
animalQ = function (qlt, aff) { const sc = qlt * .35 + aff * .2 + lv('husbandry') * .15 + Math.random() * 30; return sc > 95 ? 3 : sc > 78 ? 2 : sc > 55 ? 1 : 0; };
const fishQ = () => qualityRoll(lv('fishing'));
const fruitQ = age => qualityRoll(lv('foraging'), age > 56 ? .15 : age > 28 ? .07 : 0); // old trees bear better fruit, but not always gold

/* ---- prices ---- */
const PRICE = { sunberry: 110, egg: 35, duck_egg: 70, truffle: 280, milk: 85, goat_milk: 150, rabbit_wool: 220, wool: 250 };
for (const id in PRICE) if (IT[id]) IT[id].p = PRICE[id];
// crops pay less and seeds cost more: first-season income was ~60% above the pacing target
// regrowing crops (strawberry, corn, hops, grape...) earned 2-4x a replanted crop, so they drop a little more
for (const k in CROPS) { if (IT[k]) IT[k].p = Math.round(IT[k].p * (CROPS[k].re ? .68 : .8)); if (IT[k + '_seed']) IT[k + '_seed'].p = Math.round(IT[k + '_seed'].p * 1.15); }
// buildings and tool upgrades were a small share of income, so the year-one goals came too fast
const BP_GOLD = { cottage: 1600, coop: 2400, barn: 5000, stable: 6000, shed: 1200, well: 700, stall: 1600 };
for (const k in BP_GOLD) if (BP[k]) BP[k].gold = BP_GOLD[k];
UPC[3][2] = 2000; UPC[4][2] = 5000; UPC[5][2] = 12000;
// keep the perk descriptions honest
const PERK_TXT = { tiller: 'Crops sell for 10% more.', agronomist: 'Better odds of silver and gold crops.', artisan: 'Artisan goods sell for 15% more.', abundance: '10% chance of a double harvest.',
  shepherd: 'Animal products sell for 10% more.', gatherer: '12% chance to double forage.', botanist: 'Better odds of high-quality forage.', forester: '12% chance of an extra log.',
  geologist: 'Gem nodes give double gems.', blacksmith: 'Bars sell for 20% more.', angler: 'Fish sell for 10% more.', gourmet: 'Cooked food sells for 20% more.' };
for (const k in PERKS) for (const tier of PERKS[k]) for (const p of tier) if (PERK_TXT[p[0]]) p[2] = PERK_TXT[p[0]];

/* ---- XP curve: the 1-99 table assumes XP rates that climb with level, but our rates stay
   fairly flat (a tree is 8 xp, an ancient tree 40), which made 70+ take thousands of hours.
   XP is multiplied by (xp to next level / xp from 10 to 11)^0.5 above level 10, so one skill
   takes ~1h to 10, ~5h to 30, ~18h to 50, ~50h to 70 and ~200h to 99. ---- */
const xpScale = L => L < 10 ? 1 : Math.sqrt((XPT[L + 1] - XPT[L]) / (XPT[11] - XPT[10]));
const _addXPB = addXP;
addXP = function (k, n) { const s = S && S.sk && S.sk[k]; _addXPB(k, s && n > 0 ? n * xpScale(s.L || 1) : n); };
const _cxpB = cxp;
cxp = function (k, n) { ensureCombat(); _cxpB(k, n > 0 ? n * xpScale(clv(k)) : n); };

/* ---- pacing simulation: window.simPacing(days) estimates income and skill levels for a
   steady player (planting what's in season, foraging, chopping, a little mining). ---- */
window.simPacing = function (days = 28, opts = {}) {
  const tiles = opts.tiles || 30, hoursPerDay = opts.hours || 1;
  let gold = 500, xp = { farming: 0, foraging: 0, woodcutting: 0 }, log = [];
  for (let d = 1; d <= days; d++) {
    const season = Math.floor((d - 1) / 28) % 4, crops = Object.entries(CROPS).filter(([k, C]) => !C.secret && C.s.includes(season));
    const net = ([k, C]) => { const seed = IT[k + '_seed'] ? IT[k + '_seed'].p : 0, y = C.y > 1 ? (1 + C.y) / 2 : 1, h = C.re ? 1 + Math.floor((28 - C.d) / C.re) : Math.floor(28 / C.d); return (h * y * IT[k].p - (C.re ? seed : h * seed)) / 28; };
    const best = crops.map(c => [c[0], net(c)]).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const farmTiles = Math.min(tiles, 10 + d * 1.2), avgQ = 1 + .1 * Math.min(1, lvlFor(xp.farming) / 99);
    gold += farmTiles * best.reduce((a, b) => a + b[1], 0) / best.length * .75 * avgQ; // real profit after seeds; ~75% of days watered and replanted on time
    gold += hoursPerDay * 80; // forage, fish, odd jobs per in-game day of play
    xp.farming += farmTiles * 1.2; xp.foraging += 40 * hoursPerDay; xp.woodcutting += 200 * hoursPerDay;
    if (d % 7 === 0) log.push('day ' + d + ': ' + Math.round(gold).toLocaleString() + 'g · farming ' + lvlFor(xp.farming) + ' · woodcutting ' + lvlFor(xp.woodcutting));
  }
  return log;
};
