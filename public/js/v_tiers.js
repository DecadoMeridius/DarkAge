/* ================= Automation tiers and combined recipes =================
   AUTOMATION TIERS (S.autoTier; plans unlock the next tier, Construction level gates them):
     1 Hand-built  start            chute (no power, slow), stone furnace, crate, kiln, oven, compost bin, treadwheel
     2 Iron        Hale, 1500g      conveyor, sorter, splitter, smelter, mill, windmill, waterwheel, trip hammer,
                   Construction 5   butter churn, seed hopper, horse tools
     3 Cobalt      Highmarch forge  fast belt (2 tiles a tick), lever crane, blast furnace (twice as fast, fuel
                   6000g, Constr 25 lasts twice as long), reaper (harvests ripe crops into belts)
     4 Tide/Rime   Saltreach or     filter crane, tide mill (power 13 tiles), power hammer (twice a trip hammer),
                   Frostmere forge  storehouse ledger (every crate on the farm in one window)
                   15000g, Constr 40
     5 Ember       Emberwaste forge rune belt (3 tiles a tick, no power), ember forge (no fuel, smelts anything),
                   40000g, Constr 55 ember core (power 18 tiles), ember golem (harvests, waters and replants 6 tiles)
   A placed piece is upgraded in place by using the next one on it (UPG); contents are kept.
   COMBINED RECIPES: food needs real ingredients (flour, sugar, butter, salt, eggs, milk), gear needs
   parts (grips, hafts, bowstrings, rivets, straps, padding), machines need gears, cogs, firebricks and
   the regional valves, coils and runes. */

/* ---- parts and ingredients ---- */
[['sugar', 'Sugar', 25, 'goo', '#f4f0e8'], ['butter', 'Butter', 60, 'wheel', '#f2d870'], ['salt', 'Salt', 8, 'goo', '#f4f4f4'],
 ['grip', 'Cord Grip', 12, 'fiber', '#8a6a4a'], ['haft', 'Haft', 20, 'log', '#9a6a40'], ['bowstring', 'Bowstring', 18, 'fiber', '#e8e0c8'],
 ['rivets', 'Rivets', 6, 'ore', '#a8a8b8'], ['straps', 'Leather Straps', 20, 'hide', '#8a5a32'], ['padding', 'Padding', 25, 'cloth', '#e8dcc0'],
 ['gear', 'Iron Gear', 60, 'ore', '#8a8a98'], ['cobalt_gear', 'Cobalt Cog', 260, 'ore', '#3a6ad8'], ['firebrick', 'Firebrick', 18, 'stone', '#b8603a'],
 ['tide_valve', 'Tide Valve', 600, 'core', '#2ae8c8'], ['rime_coil', 'Rime Coil', 800, 'core', '#c8f4ff'], ['ember_rune', 'Ember Rune', 1500, 'shard', '#ff8a2a']]
  .forEach(([id, n, p, shp, c]) => I(id, n, 'mat', p, shp, c));
I('layer_cake', 'Layer Cake', 'food', 1300, 'pie', '#f8d8e0', null, { eat: [170, 230], buff: { maxhp: 20, regen: 1, dur: 360 } }); FOODS.push(['layer_cake', 'Layer Cake', 1300, 'pie', '#f8d8e0', [170, 230], { maxhp: 20, regen: 1, dur: 360 }]);
RC.push(['grip', 1, { fiber: 3 }, 'bench'], ['haft', 1, { wood: 4 }, 'bench'], ['haft', 1, { hardwood: 1 }, 'bench'], ['bowstring', 1, { fiber: 6 }, 'bench'],
  ['straps', 3, { hide: 1 }, 'bench'], ['padding', 4, { wool: 1 }, 'bench'], ['padding', 1, { fiber: 12 }, 'bench'],
  ['rivets', 8, { copper_bar: 1 }, 'anvil'], ['rivets', 20, { iron_bar: 1 }, 'anvil'], ['gear', 3, { iron_bar: 1 }, 'anvil', ['smithing', 2]], ['cobalt_gear', 3, { cobalt_bar: 1 }, 'anvil', ['smithing', 6]],
  ['firebrick', 4, { clay: 2, stone: 2 }, 'furnace'], ['tide_valve', 1, { tide_bar: 1, reef_shell: 2 }, 'anvil', ['smithing', 7]], ['rime_coil', 1, { rime_bar: 1, rime_essence: 1 }, 'anvil', ['smithing', 8]],
  ['ember_rune', 2, { cinder_bar: 1, magma_shard: 3, sunstone: 1 }, 'anvil', ['smithing', 9]],
  ['sugar', 1, { beet: 2 }, 'kitchen'], ['butter', 1, { milk: 2 }, 'kitchen'], ['salt', 4, { clam: 1 }, 'kitchen'], ['flour', 1, { wheat: 3 }, 'kitchen'],
  ['layer_cake', 1, { flour: 2, $egg: 2, milk: 1, sugar: 2, butter: 1 }, 'kitchen', ['cooking', 7]]);

/* food: real ingredients */
const setNeed = (id, need, st = 'kitchen') => { for (const r of RC) if (r[0] === id && r[3] === st) r[2] = need; };
setNeed('bread', { flour: 2, salt: 1 }); setNeed('pancakes', { flour: 1, $egg: 1, milk: 1, butter: 1 }); setNeed('honey_cake', { flour: 2, $egg: 1, milk: 1, honey: 1, butter: 1 });
setNeed('berry_tart', { $berry: 3, flour: 1, butter: 1, sugar: 1 }); setNeed('pumpkin_pie', { pumpkin: 1, flour: 1, $egg: 1, sugar: 1, butter: 1 }); setNeed('omelette', { $egg: 2, milk: 1, salt: 1 });
setNeed('cheese_toast', { bread: 1, cheese: 1, butter: 1 }); setNeed('miners_pie', { flour: 1, potato: 1, $mush: 1, butter: 1 }); setNeed('corn_chowder', { corn: 1, milk: 1, potato: 1, butter: 1 });
setNeed('veggie_stew', { potato: 1, carrot: 1, $veg: 1, salt: 1 }); setNeed('fish_stew', { $fish: 2, potato: 1, tomato: 1, salt: 1 }); setNeed('truffle_risotto', { truffle: 1, truffle_oil: 1, cheese: 1, butter: 1 });
setNeed('roast_feast', { pumpkin: 1, yam: 1, truffle: 1, cheese: 1, butter: 1, salt: 1 }); setNeed('ember_curry', { pepper: 2, cinderbloom: 1, $veg: 1, salt: 1 });
setNeed('highland_stew', { alpine_barley: 2, mountain_thyme: 1, potato: 1, salt: 1 }); setNeed('pearl_chowder', { pearl_oyster: 2, milk: 1, potato: 1, butter: 1 });
setNeed('saffron_paella', { saffron: 1, kelp: 1, $fish: 1, flour: 1, salt: 1 }); setNeed('lichen_bread', { frost_lichen: 2, flour: 2, salt: 1 }); setNeed('dragon_chili', { dragon_pepper: 2, ashroot: 1, $veg: 1, salt: 1 });
setNeed('melon_sorbet', { cinder_melon: 1, ice_shard: 1, sugar: 1 });

/* gear: parts */
for (const r of RC) {
  const it = IT[r[0]]; if (!it || !(it.t === 'weapon' || it.t === 'armor') || r[3] !== 'anvil' || ['wood', 'leather'].includes(it.tier)) continue;
  const n = r[2];
  if (it.t === 'weapon') {
    if (it.wt === 'sword' || it.wt === 'dagger') n.grip = 1;
    if (it.wt === 'spear' || it.wt === 'hammer') { delete n.wood; delete n.hardwood; n.haft = 1; }
    if (it.wt === 'bow') { delete n.fiber; n.bowstring = 1; }
  } else {
    if (it.slot === 'helm') n.padding = 2;
    if (it.slot === 'body') { n.straps = 2; n.rivets = 6; n.padding = 2; }
    if (it.slot === 'boots') n.straps = 2;
    if (it.slot === 'shield') n.rivets = 4;
  }
}

/* ---- the new pieces ---- */
const AUTO2 = [ // id, name, price, tier, flat (on the floor), directional
  ['chute', 'Wooden Chute', 10, 1, 1, 1], ['stonefurnace', 'Stone Furnace', 120, 1], ['churn', 'Butter Churn', 160, 2], ['seedhopper', 'Seed Hopper', 300, 2],
  ['fastbelt', 'Cobalt Belt', 200, 3, 1, 1], ['crane', 'Lever Crane', 900, 3, 0, 1], ['blastfurnace', 'Blast Furnace', 3200, 3], ['reaper', 'Reaper', 2800, 3],
  ['filtercrane', 'Filter Crane', 2400, 4, 0, 1], ['tidemill', 'Tide Mill', 6000, 4], ['powerhammer', 'Power Hammer', 7000, 4], ['ledger', 'Storehouse Ledger', 4000, 4],
  ['runebelt', 'Rune Belt', 1500, 5, 1, 1], ['emberforge', 'Ember Forge', 16000, 5], ['embercore', 'Ember Core', 20000, 5], ['golem', 'Ember Golem', 24000, 5],
];
for (const [id, n, p, tier, flat, dir] of AUTO2) {
  I(id, n, 'place', p, 'obj', null, null, { place: id, desc: 'Automation tier ' + tier + '.' });
  OBJ[id] = { solid: flat ? 0 : 1, place: 1, tall: !flat && id !== 'seedhopper', auto: 1 };
  if (flat) FLAT.add(id); if (dir) DIRPLACE.add(id);
}
for (const [k, sp, free] of [['chute', 1, 1], ['fastbelt', 2, 0], ['runebelt', 3, 1]]) { BELTS.add(k); BELT_SPEED[k] = sp; if (free) BELT_FREE.add(k); }
STORE.add('ledger');
RC.push(['chute', 2, { wood: 6 }, 'bench'], ['stonefurnace', 1, { stone: 30, clay: 10 }, 'bench'], ['churn', 1, { wood: 20, gear: 1 }, 'bench'], ['seedhopper', 1, { wood: 20, gear: 2, iron_bar: 1 }, 'anvil'],
  ['fastbelt', 2, { conveyor: 2, cobalt_gear: 1 }, 'anvil'], ['crane', 1, { cobalt_gear: 2, wood: 10, iron_bar: 1 }, 'anvil'], ['blastfurnace', 1, { firebrick: 20, cobalt_bar: 4, cobalt_gear: 2 }, 'anvil'],
  ['reaper', 1, { cobalt_bar: 2, cobalt_gear: 2, iron_bar: 4 }, 'anvil'], ['filtercrane', 1, { crane: 1, rime_coil: 1 }, 'anvil'], ['tidemill', 1, { waterwheel: 1, tide_valve: 2, tide_bar: 4 }, 'anvil'],
  ['powerhammer', 1, { triphammer: 1, rime_coil: 2, rime_bar: 4 }, 'anvil'], ['ledger', 1, { storage: 1, rime_coil: 1, gold_bar: 2 }, 'anvil'], ['runebelt', 2, { fastbelt: 2, ember_rune: 1 }, 'anvil'],
  ['emberforge', 1, { firebrick: 20, cinder_bar: 4, ember_rune: 3 }, 'anvil'], ['embercore', 1, { ember_rune: 4, sunstone: 2, cinder_bar: 4 }, 'anvil'], ['golem', 1, { ember_rune: 3, stone: 60, cinder_bar: 2 }, 'anvil']);
/* the first machines now need parts too */
const setRC = (id, need, qty) => { for (const r of RC) if (r[0] === id && (r[3] === 'bench' || r[3] === 'anvil')) { r[2] = need; if (qty) r[1] = qty; } };
setRC('conveyor', { wood: 3, straps: 1, gear: 1 }, 4); setRC('sorter', { conveyor: 2, gear: 1, copper_bar: 1 }, 2); setRC('splitter', { conveyor: 2, gear: 1, copper_bar: 1 }, 2);
setRC('smelter', { firebrick: 12, iron_bar: 2, gear: 1 }); setRC('mill', { stone: 30, wood: 30, gear: 3 }); setRC('windmill', { wood: 60, cloth: 2, gear: 3 }); setRC('waterwheel', { wood: 40, gear: 2, iron_bar: 1 });
setRC('oven', { firebrick: 10, stone: 10 }); setRC('triphammer', { wood: 40, iron_bar: 4, gear: 3 }); setRC('treadwheel', { wood: 50, fiber: 20 });
setRC('plough', { iron_bar: 3, haft: 2, rivets: 8 }); setRC('cart', { wood: 40, straps: 4, rivets: 12 });

const AUTOTIER = { chute: 1, stonefurnace: 1, storage: 1, kiln: 1, compostbin: 1, channel: 1, oven: 1, treadwheel: 1,
  conveyor: 2, sorter: 2, splitter: 2, smelter: 2, mill: 2, windmill: 2, waterwheel: 2, triphammer: 2, churn: 2, seedhopper: 2, plough: 2, seeddrill: 2, harrow: 2, cart: 2,
  fastbelt: 3, crane: 3, blastfurnace: 3, reaper: 3, filtercrane: 4, tidemill: 4, powerhammer: 4, ledger: 4, runebelt: 5, emberforge: 5, embercore: 5, golem: 5 };
const TIERN = ['', 'Hand-built', 'Iron', 'Cobalt', 'Tide & Rime', 'Ember'];
const PLANS = { 2: { n: 'Ironworks plans', gold: 1500, con: 5, where: 'carpenter' }, 3: { n: 'Highmarch engineering', gold: 6000, con: 25, where: 'highmarch' },
  4: { n: 'Tidewright & rime engineering', gold: 15000, con: 40, where: 'saltreach frostmere' }, 5: { n: 'Ember arcana', gold: 40000, con: 55, where: 'emberwaste' } };
const autoTier = () => (S && S.autoTier) || 1;
const _canCraftV = canCraft;
canCraft = function (r, n = 1) { const t = AUTOTIER[r[0]]; if (t && t > autoTier()) return 'Needs the ' + PLANS[t].n + ' (tier ' + t + ')'; return _canCraftV(r, n); };

/* ---- stations ---- */
const smeltFor = maxT => RC.filter(r => r[3] === 'furnace' && IT[r[0]] && IT[r[0]].t === 'bar').map(r => ({ in: Object.fromEntries(Object.entries(r[2]).filter(([k]) => k !== 'coal')), out: [r[0], r[1]], ticks: 10, bar: r[0] }))
  .filter(r => Object.keys(r.in).length && (BAR_T[r.bar] || 2) <= maxT);
const BAR_T = { copper_bar: 1, iron_bar: 1, steel_bar: 2, silver_bar: 2, gold_bar: 2, mythril_bar: 3, frost_bar: 3, obsidian_plate: 3, cobalt_bar: 3, tide_bar: 3, adamant_bar: 3, rime_bar: 3, cinder_bar: 5, star_ingot: 5 };
STATIONS.stonefurnace = { fuel: 1, mult: 1.6, recipes: smeltFor(1).concat([{ in: { clay: 2, stone: 2 }, out: ['firebrick', 4], ticks: 8 }]) };
STATIONS.smelter.recipes = smeltFor(2).concat([{ in: { clay: 2, stone: 2 }, out: ['firebrick', 4], ticks: 6 }]);
STATIONS.blastfurnace = { fuel: 1, mult: .5, fuelx: 2, recipes: smeltFor(3) };
STATIONS.emberforge = { fuel: 0, mult: .3, recipes: smeltFor(5) };
STATIONS.churn = { recipes: [{ in: { milk: 1 }, out: ['butter', 1], ticks: 10 }] };
STATIONS.powerhammer = { power: 1, mult: .5, recipes: [] };
STATIONS.mill.recipes.push({ in: { beet: 1 }, out: ['sugar', 2], ticks: 6 });
STATIONS.kiln.recipes.push({ in: { clay: 2, stone: 2 }, out: ['firebrick', 4], ticks: 10 });
for (const r of STATIONS.oven.recipes) if (r.out[0] === 'bread') r.in = { flour: 2, salt: 1 };
STATIONS.oven.recipes.push({ in: { flour: 2, egg: 2, milk: 1, sugar: 2, butter: 1 }, out: ['layer_cake', 1], ticks: 20 }); // belts can't pick 'any egg', so the oven takes hen's eggs

/* power: tide mill (needs water) and the ember core */
function scanPowerExtra(m) {
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue; const x = i % m.w, y = i / m.w | 0;
    if (o.k === 'tidemill' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inb(m, x + dx, y + dy) && TER[getT(m, x + dx, y + dy)].water)) m.power.push([x, y, 13]);
    if (o.k === 'embercore') m.power.push([x, y, 18]); }
}

/* seeds go into hoppers and golems; nothing else does */
const seedIn = (o, id, n, dry) => { if (!IT[id] || IT[id].t !== 'seed' || sum(o.inv) + n > 200) return false; if (!dry) { o.inv = o.inv || {}; o.inv[id] = (o.inv[id] || 0) + n; } return true; };
ACCEPT.seedhopper = seedIn; ACCEPT.golem = seedIn;

/* ---- cranes: lift one item a tick from behind and set it down in front ---- */
function craneTick(m) {
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o || (o.k !== 'crane' && o.k !== 'filtercrane')) continue; const x = i % m.w, y = i / m.w | 0, d = DIRV[o.d || 0];
    if (o.k === 'crane' && !powered(m, x, y)) { o.on = 0; continue; }
    const src = getO(m, x - d[0], y - d[1]), dst = getO(m, x + d[0], y + d[1]); o.on = 0; if (!src || !dst) continue;
    const bag = isBelt(src) ? null : STORE.has(src.k) ? src.inv : src.out && typeof src.out === 'object' ? src.out : null;
    let keys = isBelt(src) ? (src.item ? [src.item] : []) : Object.keys(bag || {}).filter(k => bag[k] > 0);
    if (isMach(src) && src.out && !(src.left > 0) && typeof src.out === 'string') keys = [src.out];
    if (o.filter) keys = keys.filter(k => parseK(k)[0] === o.filter);
    for (const k of keys) {
      const id = parseK(k)[0], ok = isBelt(dst) ? !dst.item : (isAuto(dst) || isMach(dst)) && accept(dst, id, 1, true); if (!ok) continue;
      if (isBelt(dst)) dst.item = k; else accept(dst, id, 1);
      if (isBelt(src)) src.item = null; else if (isMach(src) && typeof src.out === 'string') { src.out = null; src.item = null; src.left = 0; } else { bag[k]--; if (!bag[k]) delete bag[k]; }
      o.on = 1; break;
    }
  }
}

/* ---- the farm hands: hopper sows in the morning, reaper cuts on the tick, golem does everything ---- */
const CROPOK = (k, m) => CROPS[k] && (m.id === 'greenhouse' || CROPS[k].s.includes(S.season));
function sowAround(m, o, x, y, r) {
  let n = 0;
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const s = m.soil[(y + j) * m.w + x + i]; if (!s || s.crop) continue;
    const seed = Object.keys(o.inv || {}).find(k => o.inv[k] > 0 && CROPOK(IT[k].crop, m)); if (!seed) return n;
    s.crop = { k: IT[seed].crop, age: 0 }; o.inv[seed]--; if (!o.inv[seed]) delete o.inv[seed]; n++;
  }
  return n;
}
let CAPTURE = null; // while a machine harvests, what would go to your backpack goes into it
const _giveV = give;
give = function (id, n = 1, q = 0, quiet) { if (CAPTURE && id !== '$') { const k = keyOf(id, QUAL_T.has((IT[id] || {}).t) ? q : 0); CAPTURE.out = CAPTURE.out || {}; CAPTURE.out[k] = (CAPTURE.out[k] || 0) + n; return 0; } return _giveV(id, n, q, quiet); };
function reapAround(m, o, x, y, r, max) {
  let n = 0;
  for (let j = -r; j <= r && n < max; j++) for (let i = -r; i <= r && n < max; i++) {
    const tx = x + i, ty = y + j, s = m.soil[ty * m.w + tx]; if (!s || !s.crop || !CROPS[s.crop.k] || s.crop.age < CROPS[s.crop.k].d) continue;
    CAPTURE = o; try { harvest(m, tx, ty); } finally { CAPTURE = null; } n++;
  }
  return n;
}
EVT.on('tick', () => {
  if (!S || PAUSED) return;
  for (const m of farmMaps()) { craneTick(m); for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && o.k === 'reaper') { const x = i % m.w, y = i / m.w | 0; o.on = powered(m, x, y) && sum(o.out) < CAP * 2 ? (reapAround(m, o, x, y, 3, 1) ? 1 : 0) : 0; } } }
});
const _endDayV = endDay;
endDay = function (f) {
  for (let n = 0; n < 300; n++) for (const m of farmMaps()) craneTick(m);
  _endDayV(f);
  for (const m of farmMaps()) for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue; const x = i % m.w, y = i / m.w | 0;
    if (o.k === 'reaper' && powered(m, x, y)) reapAround(m, o, x, y, 3, 99);
    if (o.k === 'seedhopper') sowAround(m, o, x, y, 3);
    if (o.k === 'golem') { reapAround(m, o, x, y, 6, 999); sowAround(m, o, x, y, 6); for (let j = -6; j <= 6; j++) for (let k = -6; k <= 6; k++) { const s = m.soil[(y + j) * m.w + x + k]; if (s) s.wet = true; } } }
};

/* ---- upgrades in place, filters, ledgers, sprites ---- */
const UPG = { chute: 'conveyor', conveyor: 'fastbelt', fastbelt: 'runebelt', stonefurnace: 'smelter', smelter: 'blastfurnace', blastfurnace: 'emberforge', waterwheel: 'tidemill', triphammer: 'powerhammer', crane: 'filtercrane', storage: 'ledger', seedhopper: 'golem' };
const _objInteractV = objInteract;
objInteract = function (m, x, y, o) {
  const k = selKind();
  if (UPG[o.k] && k === UPG[o.k] && has(k)) return { label: 'Upgrade', fn: () => { take(k, 1); o.k = UPG[o.k]; if (o.k === 'golem' && !o.inv) o.inv = {}; SFX.lvl(); toast('Upgraded to ' + IT[o.k].n + '. Everything inside was kept.', 'lvl'); } };
  if (o.k === 'crane' || o.k === 'filtercrane') {
    if (o.k === 'filtercrane' && k && IT[k] && !isTool(k)) return { label: 'Filter', fn: () => { o.filter = k; toast('Filter crane: only moves ' + IT[k].n + '.'); } };
    return { label: 'Rotate', fn: () => { o.d = [1, 3, 0, 2][o.d || 0]; SFX.pop(); } };
  }
  if (o.k === 'powerhammer') return { label: 'Set up', fn: () => openHammer(o, m, x, y) };
  if (o.k === 'seedhopper' || o.k === 'golem') return { label: 'Open', fn: () => openSeedBin(o) };
  if (o.k === 'reaper') return { label: 'Open', fn: () => openSeedBin(o, true) };
  if (o.k === 'ledger') return { label: 'Ledger', fn: () => openLedger(m) };
  if (o.k === 'tidemill' || o.k === 'embercore') return { label: 'Inspect', fn: () => { scanPower(m); const p = m.power.find(p => p[0] === x && p[1] === y); toast(p ? 'Running. Powers everything within ' + p[2] + ' tiles.' : 'Not running: a tide mill must touch water.'); } };
  return _objInteractV(m, x, y, o);
};
function openSeedBin(o, reaper) {
  openModal(IT[o.k].n, [{ id: 's', label: IT[o.k].n, render: b => {
    b.append(el('p', { class: 'note' }, reaper ? 'Cuts one ripe crop within 3 tiles every tick while powered, and the rest overnight. Crops go onto a belt leading away, or wait here.' : o.k === 'golem' ? 'Every morning it harvests, waters and replants everything within 6 tiles. Load it with seeds; the harvest goes onto a belt leading away, or waits here.' : 'Every morning it sows its seeds into empty tilled soil within 3 tiles (in-season seeds only).'));
    const bag = reaper ? o.out : o.inv;
    b.append(slotList(reaper ? 'Harvest' : 'Seeds', bag, k2 => { const [id, q] = parseK(k2); GIVE_NO_DROP = true; const left = give(id, bag[k2], q, true); GIVE_NO_DROP = false; if (left) bag[k2] = left; else delete bag[k2]; refresh(); }, 'Empty'));
    if (o.k === 'golem' && sum(o.out)) b.append(slotList('Harvest', o.out, k2 => { const [id, q] = parseK(k2); GIVE_NO_DROP = true; const left = give(id, o.out[k2], q, true); GIVE_NO_DROP = false; if (left) o.out[k2] = left; else delete o.out[k2]; refresh(); }, 'Empty'));
    if (!reaper) b.append(el('h3', null, 'Seeds from your backpack'), packPicker(id => IT[id].t === 'seed', (i, s) => { const [id] = parseK(s.k); o.inv = o.inv || {}; o.inv[id] = (o.inv[id] || 0) + s.n; S.pack[i] = null; touched(); refresh(); }));
  } }]);
}
function openLedger(m) {
  const crates = []; for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && STORE.has(o.k)) { o.inv = o.inv || {}; crates.push(o); } }
  openModal('Storehouse Ledger', [{ id: 'l', label: 'Ledger', render: b => {
    const all = {}; for (const c of crates) for (const k in c.inv) all[k] = (all[k] || 0) + c.inv[k];
    b.append(el('p', { class: 'note' }, crates.length + ' crates on this farm, linked by rime coil. Take from any of them here; what you store goes to the emptiest crate.'));
    b.append(slotList('Everything in storage', all, k => { let want = all[k]; for (const c of crates) { const n = c.inv[k] || 0; if (!n) continue; const [id, q] = parseK(k); GIVE_NO_DROP = true; const left = give(id, n, q, true); GIVE_NO_DROP = false; if (left) c.inv[k] = left; else delete c.inv[k]; if (left) break; } refresh(); }, 'Empty'));
    b.append(el('h3', null, 'Your backpack (click to store)'), packPicker(null, (i, s) => { const c = crates.slice().sort((a, b2) => sum(a.inv) - sum(b2.inv))[0]; c.inv[s.k] = (c.inv[s.k] || 0) + s.n; S.pack[i] = null; touched(); refresh(); }));
  } }]);
}
const _objSpriteV = objSprite;
objSprite = function (o, season) {
  const f = Math.floor(gameT * 4) % 2;
  if (o.k === 'crane' || o.k === 'filtercrane') return PIX.get(o.k + '_' + (o.d || 0) + '.' + (o.on ? f : 0));
  if (o.k === 'stonefurnace' || o.k === 'blastfurnace' || o.k === 'emberforge') return PIX.get(o.k + '.' + (o.on ? 1 : 0));
  if (o.k === 'tidemill' || o.k === 'embercore') return PIX.get(o.k + '.' + f);
  if (o.k === 'powerhammer' || o.k === 'reaper') return PIX.get(o.k + '.' + (o.on ? f : 0));
  if (o.k === 'golem') return PIX.get('golem.' + (Math.floor(gameT * 1.5) % 2));
  if (o.k === 'seedhopper' || o.k === 'ledger' || o.k === 'churn') return PIX.get(o.k);
  return _objSpriteV(o, season);
};

/* ---- plans: Hale sells tier 2, the regional forges sell the rest ---- */
function plansTab(tiers) {
  return { id: 'plans', label: 'Plans', render: b => {
    b.append(el('p', { class: 'note' }, 'Automation tier ' + autoTier() + ' (' + TIERN[autoTier()] + '). Plans unlock the next tier of machines; building them takes some Construction skill.'));
    const L = el('div', { class: 'list' });
    for (const t of tiers) { const P = PLANS[t], con = (S.sk.construction || {}).L || 1, have = autoTier() >= t, ready = autoTier() >= t - 1;
      const items = Object.keys(AUTOTIER).filter(k => AUTOTIER[k] === t && IT[k]).map(k => IT[k].n).join(', ');
      L.append(el('div', { class: 'rrow' + (have ? ' done' : '') }, el('div', { class: 'qck' }, 'T' + t), el('div', { class: 'rtxt' }, el('b', null, P.n + ' (' + P.gold.toLocaleString() + 'g)'), el('small', null, items + '. Needs Construction ' + P.con + (ready ? '' : ' and tier ' + (t - 1) + ' first') + '.')),
        el('button', { class: 'btn' + (have || !ready || con < P.con || S.gold < P.gold ? ' off' : ''), on: () => { if (have) return; if (!ready) { toast('Learn tier ' + (t - 1) + ' first.'); return; } if (con < P.con) { toast('You need Construction ' + P.con + '.'); return; } if (S.gold < P.gold) { toast('Not enough gold.'); return; } S.gold -= P.gold; S.autoTier = t; SFX.lvl(); toast('New machines: ' + items + '.', 'lvl'); refresh(); } }, have ? 'Learned' : 'Buy'))); }
    b.append(L);
  } };
}
const _openModalV = openModal;
openModal = function (title, tabs, start, opts) {
  if (title === 'Hale\'s Workshop') tabs = tabs.concat([plansTab([2])]);
  if (cur && cur.region && / forge$/.test(title)) { const t = Object.entries(PLANS).filter(([, P]) => P.where.includes(cur.region)).map(([t]) => +t); if (t.length) tabs = tabs.concat([plansTab(t)]); }
  if (title === 'Mara\'s General Store') tabs = tabs.concat([{ id: 'pantry', label: 'Pantry', render: b => { const L = el('div', { class: 'list' }); [['salt', 10], ['sugar', 45], ['butter', 90], ['flour', 70]].forEach(([id, p]) => L.append(buyRow(id, p))); b.append(el('p', { class: 'note' }, 'Baking needs flour, butter, sugar and salt. They\'re cheaper to make yourself.'), L); } }]);
  return _openModalV(title, tabs, start, opts);
};
if (REGIONS.saltreach) REGIONS.saltreach.trade.push(['salt', 5]);

/* older saves that already run machines start at the iron tier */
const _initMapsV = initMaps;
initMaps = function () { _initMapsV(); if (!S.autoTier) { const m = MAPS.farm, iron = m && m.o.some(o => o && AUTOTIER[o.k] === 2); S.autoTier = iron || Object.keys(S.stats.forged || {}).length > 3 ? 2 : 1; } };
