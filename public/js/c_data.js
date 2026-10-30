/* ================= Data ================= */
const IT = {};
function I(id, n, t, p, sh_, c, c2, ex) { IT[id] = Object.assign({ id, n, t, p, sh: sh_, c, c2 }, ex || {}); return IT[id]; }
const QUAL_T = new Set(['crop', 'fruit', 'forage', 'fish', 'animal']);
const QMULT = [1, 1.25, 1.5, 2], QNAME = ['', 'Silver', 'Gold', 'Ember'];
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'], WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
/* crops: id, name, days, seasons, price, shape, color, color2, regrow, yield, kind */
const CROPS = {};
[['turnip', 'Turnip', 4, [0], 45, 'root', '#f1e6f0', '#7cb342', 0, 1, 'veg'], ['potato', 'Potato', 6, [0], 90, 'round', '#c79a5b', '#6a8f3a', 0, 1, 'veg'], ['garlic', 'Garlic', 4, [0], 60, 'round', '#f2ead8', '#8ab060', 0, 1, 'veg'],
['kale', 'Kale', 6, [0], 110, 'leaf', '#4a8a4a', 0, 0, 1, 'veg'], ['cabbage', 'Cabbage', 10, [0], 190, 'round', '#a8d878', '#5a9a4a', 0, 1, 'veg'], ['strawberry', 'Strawberry', 8, [0], 100, 'berry', '#e2394a', 0, 4, 1, 'fruit'],
['peapod', 'Pea Pod', 9, [0], 60, 'long', '#7cc04a', 0, 3, 1, 'veg'], ['rhubarb', 'Rhubarb', 12, [0], 240, 'long', '#d84a6a', 0, 0, 1, 'fruit'], ['tulip', 'Tulip', 6, [0], 40, 'flower', '#ff6a8a', 0, 0, 1, 'flower'],
['tomato', 'Tomato', 9, [1], 60, 'round', '#e5432f', 0, 4, 1, 'fruit'], ['corn', 'Corn', 12, [1, 2], 120, 'long', '#f2cf3a', 0, 4, 1, 'veg'], ['melon', 'Melon', 12, [1], 260, 'round', '#7fc85a', '#2f6b2a', 0, 1, 'fruit'],
['blueberry', 'Blueberry', 13, [1], 50, 'berry', '#4a5ae0', 0, 4, 3, 'fruit'], ['pepper', 'Hot Pepper', 5, [1], 45, 'long', '#e8342a', 0, 3, 1, 'fruit'], ['radish', 'Radish', 6, [1], 90, 'root', '#e04a6a', 0, 0, 1, 'veg'],
['wheat', 'Wheat', 4, [1, 2], 25, 'long', '#e3c058', 0, 0, 1, 'grain'], ['sunflower', 'Sunflower', 8, [1, 2], 80, 'flower', '#ffd040', 0, 0, 1, 'flower'], ['hops', 'Hops', 11, [1], 25, 'berry', '#9ad84a', 0, 1, 1, 'grain'],
['redcabbage', 'Red Cabbage', 9, [1], 260, 'round', '#8a2a6a', '#5a8a4a', 0, 1, 'veg'], ['poppy', 'Poppy', 7, [1], 140, 'flower', '#e8342a', 0, 0, 1, 'flower'], ['sunberry', 'Sunberry', 10, [1], 150, 'berry', '#ffb703', 0, 3, 1, 'fruit'],
['pumpkin', 'Pumpkin', 13, [2], 320, 'round', '#ea8a22', '#5a7a2a', 0, 1, 'veg'], ['carrot', 'Carrot', 5, [2], 70, 'root', '#ef8a2c', 0, 0, 1, 'veg'], ['eggplant', 'Eggplant', 5, [2], 60, 'round', '#6a3a8a', '#4a8a3a', 5, 1, 'veg'],
['cranberry', 'Cranberries', 7, [2], 75, 'berry', '#c8183a', 0, 5, 2, 'fruit'], ['yam', 'Yam', 10, [2], 160, 'root', '#c86a3a', 0, 0, 1, 'veg'], ['grape', 'Grape', 10, [2], 80, 'berry', '#7a3a9a', 0, 3, 1, 'fruit'],
['beet', 'Beet', 6, [2], 100, 'root', '#8a1a3a', 0, 0, 1, 'veg'], ['artichoke', 'Artichoke', 8, [2], 160, 'leaf', '#6a9a5a', 0, 0, 1, 'veg'], ['bokchoy', 'Bok Choy', 4, [2], 80, 'leaf', '#8ac86a', 0, 0, 1, 'veg'],
['amaranth', 'Amaranth', 7, [2], 150, 'long', '#c83a6a', 0, 0, 1, 'veg'], ['frostleek', 'Frostleek', 7, [3], 160, 'root', '#cfe8ef', '#5fa0b0', 0, 1, 'veg'], ['snowpea', 'Snow Pea', 6, [3], 70, 'long', '#bfe6c8', 0, 3, 1, 'veg'],
['glacier', 'Glacier Squash', 14, [3], 420, 'round', '#9fd8f0', '#5a8ab8', 0, 1, 'veg'], ['starbloom', 'Starbloom', 10, [3], 300, 'flower', '#c8d8ff', 0, 0, 1, 'flower'],
['emberfruit', 'Ember Fruit', 14, [0, 1, 2], 900, 'round', '#ff6a1a', '#ffd040', 7, 1, 'fruit', 1], ['moonblossom', 'Moonblossom', 10, [0, 1, 2, 3], 600, 'flower', '#d8c8ff', 0, 0, 1, 'flower', 1]]
  .forEach(([id, n, d, s, p, shp, c, c2, re, y, kind, secret]) => { CROPS[id] = { n, d, s, p, sh: shp, c, c2: c2 || null, re, y, kind, secret }; I(id + '_seed', n + (kind === 'flower' ? ' Bulbs' : ' Seeds'), 'seed', Math.round(p * (re ? .6 : .45)), 'seed', c, null, { crop: id }); I(id, n, 'crop', p, shp, c, c2 || null, { eat: kind === 'flower' ? null : [Math.round(p / 12) + 3, Math.round(p / 7) + 6], kind }); });
const FTREES = { apple: ['Apple', [2], 100, '#d8342a'], cherry: ['Cherry', [0], 80, '#c4183a'], peach: ['Peach', [1], 140, '#ffaa70'], orange: ['Orange', [1], 100, '#ff9a1a'], plum: ['Plum', [0], 90, '#7a2a8a'], pomegranate: ['Pomegranate', [2], 140, '#c0182a'] };
for (const k in FTREES) { const [n, s, p, c] = FTREES[k]; I(k, n, 'fruit', p, 'round', c, '#3d7a2f', { eat: [Math.round(p / 10), Math.round(p / 6)], kind: 'fruit' }); I(k + '_sapling', n + ' Sapling', 'sapling', p * 8, 'leaf', '#5a9c3a', null, { tree: k }); }
/* forage */
[['wild_leek', 'Wild Leek', 60, 'root', '#e8f2d8', '#5aa040'], ['dandelion', 'Dandelion', 40, 'flower', '#ffd840'], ['morel', 'Morel', 150, 'mush', '#9a7a52'], ['spice_berry', 'Spice Berry', 80, 'berry', '#e8402a'],
['sweet_pea', 'Sweet Pea', 50, 'flower', '#e88ae0'], ['blackberry', 'Blackberry', 25, 'berry', '#4a1a6a'], ['hazelnut', 'Hazelnut', 90, 'nut', '#9a6a3a'], ['chanterelle', 'Chanterelle', 160, 'mush', '#f0b040'],
['red_cap', 'Red Cap', 75, 'mush', '#d8452a'], ['snow_yam', 'Snow Yam', 100, 'root', '#c9b0e8', '#8a7aa8'], ['winter_root', 'Winter Root', 70, 'root', '#c8a87a', '#8a6a4a'], ['crystal_fruit', 'Crystal Fruit', 150, 'gem', '#bfe8ff'],
['holly', 'Holly', 80, 'berry', '#d8243a'], ['clam', 'Clam', 50, 'egg', '#e8d8c8'], ['coral', 'Coral', 80, 'leaf', '#ff7a7a'], ['sea_urchin', 'Sea Urchin', 160, 'mush', '#5a3a7a'], ['nautilus', 'Nautilus Shell', 400, 'egg', '#f8d8b8'],
['ice_bloom', 'Ice Bloom', 220, 'flower', '#bfe8ff'], ['cinderbloom', 'Cinderbloom', 260, 'flower', '#ff6a2a'], ['ember_moss', 'Ember Moss', 180, 'leaf', '#c84a1a'], ['cave_crystal', 'Cave Crystal', 90, 'gem', '#9fe7ff'],
['purple_shroom', 'Purple Mushroom', 250, 'mush', '#9a4ad8'], ['herb', 'Wild Herb', 35, 'leaf', '#5cb85c'], ['moon_mushroom', 'Moon Mushroom', 500, 'mush', '#c8d8ff']]
  .forEach(([id, n, p, shp, c, c2]) => I(id, n, 'forage', p, shp, c, c2 || null, { eat: ['flower', 'egg'].includes(shp) || id === 'cave_crystal' ? null : [Math.round(p / 10) + 2, Math.round(p / 6) + 6] }));
const FORAGE = {
  meadow: [['wild_leek', 'dandelion', 'herb'], ['spice_berry', 'sweet_pea', 'herb'], ['hazelnut', 'red_cap', 'blackberry'], ['winter_root', 'holly', 'snow_yam']],
  forest: [['morel', 'wild_leek', 'herb'], ['spice_berry', 'red_cap', 'herb'], ['chanterelle', 'hazelnut', 'red_cap'], ['snow_yam', 'winter_root', 'holly']],
  highlands: [['herb', 'dandelion', 'wild_leek'], ['herb', 'spice_berry'], ['hazelnut', 'herb'], ['winter_root', 'crystal_fruit']],
  coast: [['clam', 'coral', 'clam'], ['clam', 'coral', 'sea_urchin'], ['clam', 'coral', 'sea_urchin'], ['clam', 'coral']], frost: [['ice_bloom', 'crystal_fruit', 'snow_yam']], ash: [['cinderbloom', 'ember_moss']],
};
/* materials */
const MATS = [['hay', 'Hay', 'feed', 10, 'hay', '#e0c060'], ['fiber', 'Fiber', 'mat', 2, 'fiber', '#6fae4f'], ['wood', 'Wood', 'mat', 3, 'log', '#a8743f'], ['hardwood', 'Hardwood', 'mat', 20, 'log', '#6a3d22'],
['stone', 'Stone', 'mat', 2, 'stone', '#9a948a'], ['clay', 'Clay', 'mat', 15, 'stone', '#c8784a'], ['coal', 'Coal', 'mat', 18, 'ore', '#1e1a18', '#4a4440'], ['sap', 'Amber Sap', 'mat', 30, 'goo', '#e8a030'],
['copper_ore', 'Copper Ore', 'ore', 6, 'ore', '#e8853e'], ['iron_ore', 'Iron Ore', 'ore', 12, 'ore', '#d8b8a8', '#6a625a'], ['silver_ore', 'Silver Ore', 'ore', 22, 'ore', '#eef4fa'], ['gold_ore', 'Gold Ore', 'ore', 30, 'ore', '#ffd040'],
['mythril_ore', 'Mythril Ore', 'ore', 65, 'ore', '#4fe0c8', '#4a4a5a'], ['frost_ore', 'Frostsilver Ore', 'ore', 80, 'ore', '#8fd8ff', '#8aa0b8'], ['obsidian', 'Obsidian Shard', 'ore', 90, 'shard', '#6a4aa8'],
['adamant_ore', 'Adamantite Ore', 'ore', 120, 'ore', '#ff5a8a', '#4a3a4a'], ['starmetal', 'Starmetal', 'ore', 400, 'ore', '#fff6a8', '#2a2230'],
['copper_bar', 'Copper Bar', 'bar', 60, 'bar', '#e8853e'], ['iron_bar', 'Iron Bar', 'bar', 120, 'bar', '#c8d0d8'], ['steel_bar', 'Steel Bar', 'bar', 220, 'bar', '#8fa3b8'], ['silver_bar', 'Silver Bar', 'bar', 200, 'bar', '#eef4fa'],
['gold_bar', 'Gold Bar', 'bar', 260, 'bar', '#ffd040'], ['mythril_bar', 'Mythril Bar', 'bar', 600, 'bar', '#4fe0c8'], ['frost_bar', 'Frostsilver Bar', 'bar', 700, 'bar', '#8fd8ff'], ['obsidian_plate', 'Obsidian Plate', 'bar', 800, 'bar', '#5a3a8a'],
['adamant_bar', 'Adamantite Bar', 'bar', 1000, 'bar', '#ff5a8a'], ['star_ingot', 'Starforged Ingot', 'bar', 2500, 'bar', '#fff6a8'],
['amethyst', 'Amethyst', 'gem', 110, 'gem', '#a855f7'], ['topaz', 'Topaz', 'gem', 90, 'gem', '#ffb43a'], ['aquamarine', 'Aquamarine', 'gem', 180, 'gem', '#4ad8e8'], ['emerald', 'Emerald', 'gem', 260, 'gem', '#10b981'],
['ruby', 'Ruby', 'gem', 260, 'gem', '#e11d48'], ['diamond', 'Diamond', 'gem', 800, 'gem', '#e8faff'], ['prismatic', 'Prismatic Shard', 'gem', 2000, 'gem', '#ff7af0'],
['slime_goo', 'Slime Goo', 'loot', 5, 'goo', '#7ccf5a'], ['bat_wing', 'Bat Wing', 'loot', 15, 'wing', '#5a3a6a'], ['hide', 'Hide', 'loot', 35, 'hide', '#9a7a5a'], ['fang', 'Fang', 'loot', 25, 'fang', '#f0ead8'],
['bone', 'Old Bone', 'loot', 20, 'bone', '#ece6d6'], ['raptor_feather', 'Raptor Feather', 'loot', 45, 'feather', '#8a5a3a'], ['chitin', 'Chitin', 'loot', 40, 'shard', '#d8642a'], ['ectoplasm', 'Ectoplasm', 'loot', 70, 'goo', '#9af0ff'],
['yeti_fur', 'Yeti Fur', 'loot', 120, 'wool', '#e8f0fa'], ['ice_shard', 'Ice Shard', 'loot', 50, 'shard', '#bfe8ff'], ['imp_horn', 'Imp Horn', 'loot', 90, 'fang', '#8a1a10'], ['magma_shard', 'Magma Shard', 'loot', 70, 'shard', '#ff7a1a'],
['void_essence', 'Void Essence', 'loot', 150, 'goo', '#6a4aa8'], ['warden_heart', 'Warden Heart', 'loot', 600, 'heart', '#5ee0ff'], ['dragon_scale', 'Dragon Scale', 'loot', 900, 'scale', '#e0562a'],
['phylactery', 'Lich Phylactery', 'loot', 1500, 'core', '#9a6aff'], ['hollow_crown', 'Hollow Crown', 'loot', 3000, 'core', '#ffd040'], ['warlord_banner', 'Warlord Banner', 'loot', 800, 'cloth', '#a8342a'],
['snapper_shell', 'Snapper Shell', 'loot', 800, 'shard', '#d8642a'], ['giant_heart', 'Frost Giant Heart', 'loot', 900, 'heart', '#8fd8ff'], ['colossus_core', 'Colossus Core', 'loot', 1000, 'core', '#ff6a1a'],
['ember_shard', 'Ember Shard', 'special', 0, 'shard', '#ff8a3a'], ['treasure_map', 'Treasure Map', 'special', 0, 'map', '#ecd8a8'], ['golden_oats', 'Golden Oats', 'special', 500, 'oats', '#ffd040'],
['compost', 'Compost', 'fert', 30, 'fert', '#6a4a2a', '#5aa040'], ['growth_tonic', 'Growth Tonic', 'fert', 60, 'bottle', '#7ac0ff', '#3a8ad8'], ['rich_compost', 'Rich Compost', 'fert', 120, 'fert', '#3a2a1a', '#ffd040'],
['arrow', 'Arrow', 'ammo', 2, 'arrow', '#b8c0c8'], ['fire_arrow', 'Fire Arrow', 'ammo', 8, 'arrow', '#ff6a1a'], ['staircase', 'Staircase', 'special', 0, 'stone', '#8a8274'], ['warp_totem', 'Warp Totem', 'special', 0, 'artifact', '#4fe0c8'],
];
MATS.forEach(([id, n, t, p, shp, c, c2]) => I(id, n, t, p, shp, c, c2));
/* animal products */
[['egg', 'Egg', 50, 'egg', '#f6efe0'], ['duck_egg', 'Duck Egg', 95, 'egg', '#c8e0c8'], ['duck_feather', 'Duck Feather', 250, 'feather', '#f8f6f0'], ['rabbit_wool', 'Rabbit Wool', 340, 'wool', '#f4f0ea'],
['rabbit_foot', 'Rabbit\'s Foot', 565, 'foot', '#f4f0ea'], ['goat_milk', 'Goat Milk', 225, 'bottle', '#f8f8f0'], ['milk', 'Milk', 125, 'bottle', '#fafafa'], ['wool', 'Wool', 340, 'wool', '#f0ece2'],
['truffle', 'Truffle', 625, 'truffle', '#6a4e3a'], ['golden_egg', 'Golden Egg', 500, 'egg', '#ffd040'], ['golden_fleece', 'Golden Fleece', 1200, 'wool', '#ffd878'], ['honey', 'Honey', 130, 'jar', '#f2a516', '#f2a516']]
  .forEach(([id, n, p, shp, c, c2]) => I(id, n, 'animal', p, shp, c, c2 || null, { eat: ['egg', 'duck_egg', 'milk', 'goat_milk', 'honey'].includes(id) ? [Math.round(p / 8), Math.round(p / 5)] : null }));
/* fish: id,name,price,color,locs,seasons,time,diff,weight,motion */
const FISH = [
  ['carp', 'Carp', 30, '#8a8a5a', ['pond', 'lake'], [0, 1, 2, 3], 'any', 1, 30, 'smooth'], ['sunfish', 'Sunfish', 40, '#f2b84b', ['pond'], [0, 1], 'day', 1, 25, 'smooth'],
  ['bream', 'Bream', 45, '#9a8a6a', ['river', 'lake'], [0, 1, 2, 3], 'night', 2, 18, 'smooth'], ['perch', 'Perch', 55, '#7aa35a', ['lake', 'pond'], [2, 3], 'any', 2, 20, 'dart'],
  ['chub', 'Chub', 50, '#7a8aa0', ['river'], [0, 1, 2, 3], 'any', 1, 25, 'dart'], ['trout', 'Rainbow Trout', 65, '#d88fa0', ['river'], [0, 1, 2], 'day', 2, 20, 'smooth'],
  ['pike', 'Pike', 100, '#6e8a5a', ['river', 'lake'], [1, 2, 3], 'any', 3, 12, 'dart'], ['salmon', 'Salmon', 95, '#ef7f6a', ['river'], [2], 'any', 3, 18, 'smooth'],
  ['catfish', 'Catfish', 200, '#5e5650', ['river', 'pond'], [0, 1, 2], 'rain', 4, 12, 'sinker'], ['walleye', 'Walleye', 105, '#a8a06a', ['lake'], [2, 3], 'night', 3, 12, 'smooth'],
  ['sardine', 'Sardine', 40, '#a8b8c8', ['ocean'], [0, 1, 2, 3], 'day', 1, 30, 'dart'], ['anchovy', 'Anchovy', 30, '#8aa0b8', ['ocean'], [0, 2], 'any', 1, 28, 'dart'],
  ['tuna', 'Tuna', 120, '#3a5a8a', ['ocean'], [1, 3], 'any', 3, 15, 'smooth'], ['snapper', 'Red Snapper', 85, '#e8543a', ['ocean'], [1, 2], 'rain', 2, 18, 'smooth'],
  ['halibut', 'Halibut', 110, '#a89a8a', ['ocean'], [0, 1, 3], 'day', 3, 14, 'sinker'], ['eel', 'Eel', 150, '#4a4a3a', ['ocean'], [0, 2], 'night', 3, 12, 'dart'],
  ['octopus', 'Octopus', 300, '#c86a8a', ['ocean'], [1], 'day', 4, 6, 'sinker'], ['puffer', 'Pufferfish', 260, '#e8d86a', ['ocean'], [1], 'day', 4, 8, 'floater'],
  ['icefish', 'Icefish', 90, '#bfe6f5', ['ice'], [0, 1, 2, 3], 'any', 2, 25, 'smooth'], ['frostpike', 'Frost Pike', 220, '#8ac0e8', ['ice'], [0, 1, 2, 3], 'any', 3, 12, 'dart'],
  ['lavaeel', 'Lava Eel', 700, '#ff5a1a', ['lava', 'minelava'], [0, 1, 2, 3], 'any', 4, 12, 'dart'], ['ghostfin', 'Ghostfin', 160, '#d8d0e8', ['mine'], [0, 1, 2, 3], 'any', 3, 25, 'floater'],
  ['stonefish', 'Stonefish', 120, '#8a8274', ['mine'], [0, 1, 2, 3], 'any', 2, 25, 'sinker'], ['icepip', 'Ice Pip', 400, '#9fe7ff', ['mineice'], [0, 1, 2, 3], 'any', 4, 25, 'dart'],
  ['voidsalmon', 'Void Salmon', 450, '#5a3a8a', ['minevoid'], [0, 1, 2, 3], 'any', 4, 25, 'smooth'],
  ['moonfin', 'Moonfin', 1500, '#cdd9ff', ['river'], [3], 'night', 5, 3, 'dart', 1], ['tidemother', 'Tidemother', 1800, '#3ad8c8', ['ocean'], [2], 'rain', 5, 3, 'sinker', 1],
  ['glacierking', 'Glacier King', 2000, '#e8faff', ['ice'], [3], 'night', 5, 3, 'floater', 1], ['emberkoi', 'Ember Koi', 2500, '#ff8a1a', ['lava'], [0, 1, 2, 3], 'night', 5, 3, 'dart', 1],
  ['hollowangler', 'Hollow Angler', 3000, '#2a2040', ['minevoid'], [0, 1, 2, 3], 'any', 5, 2, 'sinker', 1],
];
FISH.forEach(f => I(f[0], f[1], 'fish', f[2], 'fish', f[3], null, { eat: [Math.round(f[2] / 8) + 4, Math.round(f[2] / 6) + 6], fish: { loc: f[4], s: f[5], time: f[6], diff: f[7], w: f[8], mot: f[9], legend: f[10] } }));
/* artisan goods (generated) */
const MACH = {
  keg: { n: 'Keg', desc: 'Fruit → wine, wheat → ale, hops → pale ale, honey → mead' }, jar: { n: 'Preserves Jar', desc: 'Fruit → jam, vegetables → pickles' },
  cheese: { n: 'Cheese Press', desc: 'Milk → cheese, goat milk → goat cheese' }, loom: { n: 'Loom', desc: 'Wool, rabbit wool or fleece → cloth' },
  oilpress: { n: 'Oil Press', desc: 'Truffle → truffle oil, sunflower → oil' }, smoker: { n: 'Smoker', desc: 'Any fish → smoked fish' },
};
function artisanFor(m, id) {
  const it = IT[id]; if (!it) return null;
  if (m === 'keg') { if (it.kind === 'fruit') return ['wine_' + id, 1800]; if (id === 'wheat') return ['ale', 900]; if (id === 'hops') return ['pale_ale', 1200]; if (id === 'honey') return ['mead', 900]; }
  if (m === 'jar') { if (it.kind === 'fruit') return ['jam_' + id, 1200]; if (it.kind === 'veg') return ['pickles_' + id, 1200]; }
  if (m === 'cheese') { if (id === 'milk') return ['cheese', 200]; if (id === 'goat_milk') return ['goat_cheese', 200]; }
  if (m === 'loom') { if (id === 'wool') return ['cloth', 240]; if (id === 'rabbit_wool') return ['fine_cloth', 300]; if (id === 'golden_fleece') return ['royal_cloth', 600]; if (id === 'yeti_fur') return ['frost_cloth', 400]; }
  if (m === 'oilpress') { if (id === 'truffle') return ['truffle_oil', 360]; if (id === 'sunflower') return ['oil', 120]; }
  if (m === 'smoker') { if (it.t === 'fish') return ['smoked_' + id, 300]; }
  return null;
}
for (const k in CROPS) { const C = CROPS[k]; if (C.kind === 'fruit') { I('wine_' + k, C.n + ' Wine', 'artisan', C.p * 3, 'bottle', '#8a1a3a', C.c); I('jam_' + k, C.n + ' Jam', 'artisan', C.p * 2 + 50, 'jar', C.c, '#f2e6c4', { eat: [30, 60] }); } if (C.kind === 'veg') I('pickles_' + k, 'Pickled ' + C.n, 'artisan', C.p * 2 + 50, 'jar', '#9ab84a', C.c, { eat: [25, 55] }); }
for (const k in FTREES) { const [n, , p, c] = FTREES[k]; I('wine_' + k, n + ' Wine', 'artisan', p * 3, 'bottle', '#8a1a3a', c); I('jam_' + k, n + ' Jam', 'artisan', p * 2 + 50, 'jar', c, '#f2e6c4', { eat: [30, 60] }); }
FISH.forEach(f => I('smoked_' + f[0], 'Smoked ' + f[1], 'artisan', f[2] * 2, 'fish', sh(f[3], -1.5), '#5a3a20', { eat: [Math.round(f[2] / 5), Math.round(f[2] / 4)] }));
[['ale', 'Ale', 200, 'bottle', '#c8902a'], ['pale_ale', 'Pale Ale', 300, 'bottle', '#e8c050'], ['mead', 'Mead', 300, 'bottle', '#f2a516'], ['cheese', 'Cheese', 230, 'wheel', '#f2d24a'], ['goat_cheese', 'Goat Cheese', 400, 'wheel', '#f2ead8'],
['cloth', 'Cloth', 470, 'cloth', '#e8e0d0'], ['fine_cloth', 'Fine Cloth', 680, 'cloth', '#f8f0ff'], ['royal_cloth', 'Royal Cloth', 2600, 'cloth', '#ffd040'], ['frost_cloth', 'Frostweave', 900, 'cloth', '#bfe8ff'],
['truffle_oil', 'Truffle Oil', 1065, 'bottle', '#c8a84a'], ['oil', 'Sunflower Oil', 100, 'bottle', '#f2d24a']].forEach(([id, n, p, shp, c]) => I(id, n, 'artisan', p, shp, c, null, ['cheese', 'goat_cheese'].includes(id) ? { eat: [40, 80] } : null));
/* food */
const FOODS = [
  ['grilled_fish', 'Grilled Fish', 90, 'food', '#c98a4a', [35, 45]], ['mushroom_skewer', 'Mushroom Skewer', 140, 'food', '#c4553a', [35, 55]], ['bread', 'Country Bread', 100, 'bread', '#d9a44a', [25, 55]],
  ['omelette', 'Omelette', 200, 'food', '#f2d24a', [45, 70]], ['salad', 'Garden Salad', 160, 'food', '#6ac04a', [40, 75]], ['veggie_stew', 'Veggie Stew', 260, 'food', '#c8743a', [65, 90]],
  ['berry_tart', 'Berry Tart', 180, 'pie', '#6a2a8a', [40, 80]], ['hunters_brew', 'Hunter\'s Brew', 150, 'bottle', '#5cb85c', [30, 60], { spd: .25, dur: 180 }], ['fish_stew', 'Fisher\'s Stew', 380, 'food', '#d9732a', [90, 110], { fish: 1, dur: 240 }],
  ['corn_chowder', 'Corn Chowder', 360, 'food', '#f2cf3a', [80, 110]], ['pumpkin_pie', 'Pumpkin Pie', 520, 'pie', '#ea8a22', [100, 130]], ['honey_cake', 'Honey Cake', 420, 'bread', '#f2a516', [70, 150]],
  ['frost_soup', 'Frost Soup', 420, 'food', '#bfe6f5', [90, 90], { def: 8, dur: 240 }], ['miners_pie', 'Miner\'s Pie', 380, 'pie', '#8a6a4a', [70, 90], { mine: 1, dur: 300 }], ['spicy_eel', 'Spicy Eel', 450, 'food', '#e8342a', [60, 80], { crit: .1, spd: .1, dur: 240 }],
  ['pancakes', 'Pancakes', 180, 'bread', '#f2c070', [45, 90]], ['cheese_toast', 'Cheese Toast', 280, 'bread', '#f2d24a', [60, 100]], ['lucky_lunch', 'Lucky Lunch', 400, 'food', '#5ad8a0', [60, 90], { luck: 1, dur: 360 }],
  ['sushi', 'Sushi Roll', 300, 'food', '#f0f0e8', [60, 80], { fish: 1, dur: 300 }], ['truffle_risotto', 'Truffle Risotto', 1400, 'food', '#d8c890', [150, 200], { luck: 2, dur: 480 }], ['roast_feast', 'Harvest Roast', 900, 'food', '#a8542a', [180, 180], { maxhp: 30, dur: 480 }],
  ['ember_curry', 'Ember Curry', 700, 'food', '#ff7a1a', [120, 120], { atk: 8, fireres: 1, dur: 300 }], ['knights_feast', 'Knight\'s Feast', 1600, 'food', '#a33e2e', [240, 240], { atk: 12, def: 6, dur: 360 }],
  ['dragon_stew', 'Dragonfire Stew', 2400, 'food', '#d8342a', [300, 300], { atk: 18, crit: .1, fireres: 1, dur: 420 }], ['crystal_sorbet', 'Crystal Sorbet', 600, 'food', '#bfe8ff', [80, 200], { spd: .2, regen: 1, dur: 300 }],
];
FOODS.forEach(f => I(f[0], f[1], 'food', f[2], f[3], f[4], null, { eat: f[5], buff: f[6] }));
/* gear tiers */
const TIERS = [
  ['wood', 'Wooden', '#a8794a', 'wood', 1], ['leather', 'Leather', '#8a5a32', 'hide', 2], ['copper', 'Copper', '#e8853e', 'copper_bar', 3], ['iron', 'Iron', '#c8d0d8', 'iron_bar', 3],
  ['steel', 'Steel', '#8fa3b8', 'steel_bar', 3], ['silver', 'Silver', '#eef4fa', 'silver_bar', 3], ['gold', 'Golden', '#ffd040', 'gold_bar', 3], ['mythril', 'Mythril', '#4fe0c8', 'mythril_bar', 3],
  ['frost', 'Frostsilver', '#8fd8ff', 'frost_bar', 3], ['obsidian', 'Obsidian', '#6a4aa8', 'obsidian_plate', 3], ['adamant', 'Adamant', '#ff5a8a', 'adamant_bar', 3], ['dragon', 'Dragonscale', '#e0562a', 'dragon_scale', 3], ['star', 'Starforged', '#fff6a8', 'star_ingot', 3],
];
const TIER_ATK = [4, 6, 9, 13, 17, 20, 23, 29, 35, 40, 47, 55, 66];
const WTYPE = { sword: { n: 'Sword', m: 1, cd: .32, reach: 15, arc: 1.3, cost: 4 }, spear: { n: 'Spear', m: 1.05, cd: .4, reach: 24, arc: .45, cost: 3 }, hammer: { n: 'Warhammer', m: 1.65, cd: .62, reach: 16, arc: 1.7, cost: 6, kb: 2 }, dagger: { n: 'Dagger', m: .68, cd: .17, reach: 12, arc: 1, cost: 2, crit: .15 }, bow: { n: 'Bow', m: .95, cd: .5, reach: 0, arc: 0, cost: 3, bow: 1 } };
const ASLOT = { helm: ['Helm', 'helm', 1, 1.2, 4], body: ['Plate', 'chest', 2, 2.2, 7], boots: ['Boots', 'boots', 1, 1, 4], shield: ['Shield', 'shield', 1, 1.5, 5] };
const SETB = { leather: ['+8% move speed', { spd: .08 }], copper: ['+15 max health', { maxhp: 15 }], iron: ['+3 defense', { def: 3 }], steel: ['+6% critical hits', { crit: .06 }], silver: ['+25% damage to undead and spirits', { holy: .25 }], gold: ['+25% gold from monsters', { gold: .25 }],
  mythril: ['+12% attack speed', { aspd: .12 }], frost: ['Hits slow enemies', { slow: 1 }], obsidian: ['Immune to burning, +10% damage', { fireres: 1, dmg: .1 }], adamant: ['+8 defense, +30 health', { def: 8, maxhp: 30 }], dragon: ['Hits burn enemies, fire immunity', { burn: 1, fireres: 1 }], star: ['+20% damage, slow regeneration', { dmg: .2, regen: 1 }] };
TIERS.forEach(([tk, tn, col, mat], t) => {
  const rawT = t;
  if (tk !== 'leather') for (const wk in WTYPE) { const W = WTYPE[wk]; if (tk === 'wood' && wk !== 'sword' && wk !== 'bow' && wk !== 'spear') continue; const atk = Math.round(TIER_ATK[rawT] * W.m); I(tk + '_' + wk, tn + ' ' + W.n, 'weapon', atk * 30 + 20, wk, col, wk === 'bow' ? '#f2e6c4' : '#5a3a22', { slot: 'weapon', atk, wt: wk, tier: tk, ti: rawT, cd: W.cd }); }
  if (tk !== 'wood') for (const sk in ASLOT) { const [an, shp, base, mul] = ASLOT[sk]; const def = Math.round(base + (rawT - 1) * mul); I(tk + '_' + sk, tn + ' ' + an, 'armor', def * 60 + 40, shp, col, null, { slot: sk, def, tier: tk, ti: rawT, block: sk === 'shield' ? .05 + rawT * .018 : 0 }); }
});
const RINGS = [['ring_ruby', 'Ruby Ring', 'ruby', { atk: 5 }, '+5 attack'], ['ring_topaz', 'Topaz Ring', 'topaz', { spd: .08 }, '+8% speed'], ['ring_aqua', 'Aquamarine Ring', 'aquamarine', { def: 4 }, '+4 defense'],
['ring_emerald', 'Emerald Ring', 'emerald', { regen: 1 }, 'Slowly regenerate health'], ['ring_amethyst', 'Amethyst Ring', 'amethyst', { magnet: 1 }, 'Larger pickup radius'], ['ring_diamond', 'Diamond Ring', 'diamond', { crit: .08 }, '+8% critical hits'],
['ring_prism', 'Prismatic Ring', 'prismatic', { atk: 4, def: 4, spd: .05, crit: .05, luck: 1 }, 'A little of everything'], ['ring_lucky', 'Clover Ring', null, { luck: 2 }, '+2 luck'], ['ring_ember', 'Ember Signet', null, { atk: 6, fireres: 1 }, '+6 attack, fire immunity']];
RINGS.forEach(([id, n, gem, b, d]) => I(id, n, 'ring', 400, 'ring', gem ? IT[gem].c : '#5ad85a', '#ffd040', { slot: 'ring', bonus: b, desc: d }));
/* placeables & machines */
[['fence', 'Fence', 4], ['sprinkler', 'Sprinkler', 150], ['qsprinkler', 'Gold Sprinkler', 450], ['isprinkler', 'Mythril Sprinkler', 1200], ['campfire', 'Campfire', 40], ['forge', 'Forge', 200], ['beehive', 'Beehive', 250],
['scarecrow', 'Scarecrow', 60], ['lantern', 'Lantern', 80], ['keg', 'Keg', 300], ['jar', 'Preserves Jar', 200], ['cheese', 'Cheese Press', 300], ['loom', 'Loom', 400], ['oilpress', 'Oil Press', 400], ['smoker', 'Smoker', 300]]
  .forEach(([id, n, p]) => I(id, n, 'place', p, 'obj', null, null, { place: id }));
/* artifacts */
const ARTIFACTS = [['ember_idol', 'Ember Idol', '#ff7a2a', 'meadow'], ['rusted_crown', 'Rusted Crown', '#a8742a', 'forest'], ['knights_seal', 'Knight\'s Seal', '#c8a040', 'meadow'], ['dragon_tooth', 'Dragon Tooth', '#f0e6d0', 'ash'],
['elven_brooch', 'Elven Brooch', '#4fe0c8', 'forest'], ['bone_flute', 'Bone Flute', '#e8e0c8', 'highlands'], ['ancient_coin', 'Ancient Coin', '#ffd040', 'any'], ['amphora', 'Chipped Amphora', '#c8784a', 'coast'],
['star_chart', 'Star Chart', '#3a4a8a', 'highlands'], ['frozen_rose', 'Frozen Rose', '#bfe8ff', 'frost'], ['obsidian_mask', 'Obsidian Mask', '#3a2a4a', 'ash'], ['wyrm_shell', 'Wyrm Eggshell', '#d8642a', 'mine']];
ARTIFACTS.forEach(([id, n, c]) => I(id, n, 'artifact', 300, 'artifact', c));
const MINERALS = ['amethyst', 'topaz', 'aquamarine', 'emerald', 'ruby', 'diamond', 'prismatic', 'cave_crystal', 'obsidian', 'starmetal'];
/* recipes: [out, qty, needs, station, [skill,lvl]] */
const RC = [
  ['fence', 4, { wood: 4 }, 'bench'], ['campfire', 1, { wood: 10, stone: 5 }, 'bench'], ['lantern', 1, { wood: 5, coal: 2, copper_bar: 1 }, 'bench'], ['forge', 1, { stone: 40, coal: 10, copper_ore: 10 }, 'bench', ['smithing', 2]],
  ['scarecrow', 1, { wood: 15, fiber: 15, coal: 1 }, 'bench', ['farming', 2]], ['compost', 2, { fiber: 10, slime_goo: 2 }, 'bench', ['farming', 2]], ['growth_tonic', 2, { herb: 1, slime_goo: 4, sap: 1 }, 'bench', ['farming', 4]],
  ['rich_compost', 2, { compost: 2, bone: 2, truffle: 1 }, 'bench', ['farming', 7]], ['sprinkler', 1, { copper_bar: 1, iron_bar: 1 }, 'bench', ['farming', 3]], ['qsprinkler', 1, { iron_bar: 1, gold_bar: 1, aquamarine: 1 }, 'bench', ['farming', 6]],
  ['isprinkler', 1, { gold_bar: 1, mythril_bar: 1, diamond: 1 }, 'bench', ['farming', 9]], ['beehive', 1, { wood: 40, coal: 5, iron_bar: 1 }, 'bench', ['husbandry', 3]],
  ['keg', 1, { wood: 30, copper_bar: 1, iron_bar: 1, sap: 1 }, 'bench', ['farming', 5]], ['jar', 1, { wood: 40, stone: 30, coal: 6 }, 'bench', ['farming', 3]], ['cheese', 1, { wood: 45, stone: 40, hardwood: 6, copper_bar: 1 }, 'bench', ['husbandry', 4]],
  ['loom', 1, { wood: 60, fiber: 30, sap: 1 }, 'bench', ['husbandry', 5]], ['oilpress', 1, { hardwood: 10, iron_bar: 2, gold_bar: 1 }, 'bench', ['husbandry', 7]], ['smoker', 1, { stone: 50, coal: 10, iron_bar: 1 }, 'bench', ['fishing', 4]],
  ['arrow', 20, { wood: 4, stone: 4 }, 'bench'], ['fire_arrow', 15, { arrow: 15, magma_shard: 1 }, 'bench', ['combat', 6]], ['staircase', 1, { stone: 99 }, 'bench', ['mining', 4]], ['warp_totem', 1, { hardwood: 2, prismatic: 0, sap: 2, fiber: 20 }, 'bench', ['foraging', 6]],
  ['copper_bar', 1, { copper_ore: 5, coal: 1 }, 'forge'], ['iron_bar', 1, { iron_ore: 5, coal: 1 }, 'forge', ['smithing', 2]], ['steel_bar', 1, { iron_bar: 2, coal: 3 }, 'forge', ['smithing', 3]],
  ['silver_bar', 1, { silver_ore: 5, coal: 1 }, 'forge', ['smithing', 3]], ['gold_bar', 1, { gold_ore: 5, coal: 1 }, 'forge', ['smithing', 4]], ['mythril_bar', 1, { mythril_ore: 5, coal: 2 }, 'forge', ['smithing', 5]],
  ['frost_bar', 1, { frost_ore: 5, coal: 2, ice_shard: 1 }, 'forge', ['smithing', 6]], ['obsidian_plate', 1, { obsidian: 4, magma_shard: 2 }, 'forge', ['smithing', 7]], ['adamant_bar', 1, { adamant_ore: 5, coal: 3 }, 'forge', ['smithing', 8]],
  ['star_ingot', 1, { starmetal: 3, adamant_bar: 1, diamond: 1 }, 'forge', ['smithing', 10]],
];
RC.find(r => r[0] === 'warp_totem')[2] = { hardwood: 2, sap: 2, fiber: 20 };
TIERS.forEach(([tk, tn, col, mat], t) => {
  const lvl = Math.max(0, Math.min(10, Math.round((t - 2) * .9))), st = tk === 'wood' || tk === 'leather' ? 'bench' : 'forge', sk = lvl ? ['smithing', lvl] : undefined;
  const boss2 = { mythril: 'warden_heart', obsidian: 'magma_shard', dragon: 'dragon_scale', star: 'diamond', frost: 'ice_shard', adamant: 'ruby', silver: 'bone', gold: 'topaz' }[tk];
  for (const wk in WTYPE) { const id = tk + '_' + wk; if (!IT[id]) continue; const W = WTYPE[wk], need = {}; need[mat] = tk === 'wood' ? W.cost * 4 : W.cost; if (wk === 'spear' || wk === 'bow') need[t > 4 ? 'hardwood' : 'wood'] = 4; if (wk === 'bow') need.fiber = 10; if (wk === 'sword' && t > 6 && boss2) need[boss2] = 1; RC.push([id, 1, need, st, sk]); }
  for (const sk2 in ASLOT) { const id = tk + '_' + sk2; if (!IT[id]) continue; const need = {}; need[mat] = ASLOT[sk2][4] * (tk === 'leather' ? 1 : 1); if (sk2 === 'body' && t > 6 && boss2) need[boss2] = 1; if (sk2 === 'shield' && t < 6) need.wood = 6; RC.push([id, 1, need, st, sk]); }
});
RINGS.forEach(([id, , gem]) => { if (gem) RC.push([id, 1, { [gem]: gem === 'prismatic' ? 1 : 3, gold_bar: 1, silver_bar: 1 }, 'forge', ['smithing', gem === 'prismatic' ? 8 : 4]]); });
[['grilled_fish', { $fish: 1 }], ['mushroom_skewer', { $mush: 2 }], ['bread', { wheat: 3 }], ['salad', { $veg: 2, herb: 1 }], ['omelette', { $egg: 1, milk: 1 }, 2], ['pancakes', { wheat: 2, $egg: 1 }, 2],
['berry_tart', { $berry: 3, wheat: 1 }], ['hunters_brew', { herb: 2, $berry: 1 }, 2], ['veggie_stew', { potato: 1, carrot: 1, $veg: 1 }, 3], ['fish_stew', { $fish: 2, potato: 1, tomato: 1 }, 3],
['corn_chowder', { corn: 1, milk: 1, potato: 1 }, 4], ['cheese_toast', { bread: 1, cheese: 1 }, 4], ['miners_pie', { $mush: 1, wheat: 1, coal: 1, potato: 1 }, 4], ['sushi', { $fish: 1, clam: 1, kale: 1 }, 5],
['pumpkin_pie', { pumpkin: 1, wheat: 1, $egg: 1 }, 5], ['honey_cake', { honey: 1, wheat: 1, $egg: 1 }, 5], ['spicy_eel', { eel: 1, pepper: 1 }, 5], ['frost_soup', { frostleek: 1, snow_yam: 1 }, 6],
['lucky_lunch', { $fish: 1, tortilla: 0, rabbit_foot: 0, herb: 2, nautilus: 1 }, 6], ['crystal_sorbet', { crystal_fruit: 2, milk: 1, ice_shard: 1 }, 6], ['ember_curry', { pepper: 2, cinderbloom: 1, $veg: 1 }, 7],
['roast_feast', { pumpkin: 1, yam: 1, truffle: 1, cheese: 1 }, 7], ['truffle_risotto', { truffle: 1, truffle_oil: 1, cheese: 1, $mush: 1 }, 8], ['knights_feast', { salmon: 1, pumpkin: 1, golden_egg: 1, honey: 1 }, 8],
['dragon_stew', { dragon_scale: 1, emberfruit: 1, pepper: 3, $fish: 2 }, 10]].forEach(([id, need, l]) => { for (const k in need) if (!need[k]) delete need[k]; RC.push([id, 1, need, 'kitchen', l ? ['cooking', l] : undefined]); });
const STATION_N = { bench: 'Field kit', forge: 'Forge', kitchen: 'Kitchen' };
const CATN = { $fish: 'Any fish', $mush: 'Any mushroom', $veg: 'Any vegetable', $egg: 'Any egg', $berry: 'Any berry' };
const CATF = { $fish: k => IT[k].t === 'fish', $mush: k => IT[k].sh === 'mush', $veg: k => IT[k].kind === 'veg', $egg: k => ['egg', 'duck_egg', 'golden_egg'].includes(k), $berry: k => IT[k].sh === 'berry' && IT[k].t !== 'seed' };
const CATI = { $fish: 'carp', $mush: 'red_cap', $veg: 'turnip', $egg: 'egg', $berry: 'blackberry' };

/* skills & perks */
const SK = ['farming', 'husbandry', 'foraging', 'woodcutting', 'mining', 'fishing', 'cooking', 'combat', 'smithing'];
const SKN = { farming: 'Farming', husbandry: 'Husbandry', foraging: 'Foraging', woodcutting: 'Woodcutting', mining: 'Mining', fishing: 'Fishing', cooking: 'Cooking', combat: 'Combat', smithing: 'Smithing' };
const PERKS = {
  farming: [[['tiller', 'Tiller', 'Crops sell for 15% more.'], ['agronomist', 'Agronomist', 'Much better chance of silver and gold crops.']], [['artisan', 'Artisan', 'Artisan goods sell for 30% more.'], ['abundance', 'Abundance', '25% chance of a double harvest.']]],
  husbandry: [[['shepherd', 'Shepherd', 'Animal products sell for 20% more.'], ['breeder', 'Breeder', 'Pregnancies take 1 day less; traits mutate more often.']], [['rancher', 'Rancher', 'Animals sometimes give a second product.'], ['whisperer', 'Horse Whisperer', 'Foals roll higher stats and horses race 6% faster.']]],
  foraging: [[['gatherer', 'Gatherer', '25% chance to double forage.'], ['botanist', 'Botanist', 'Forage is always gold quality or better.']], [['treasure', 'Treasure Hunter', 'Dig spots and chests give richer loot.'], ['tracker', 'Tracker', 'Secrets and dig spots show on your map nearby.']]],
  woodcutting: [[['forester', 'Forester', '+25% wood from trees.'], ['lumberjack', 'Lumberjack', 'Any tree can drop hardwood.']], [['arborist', 'Arborist', 'Chopping costs no energy.'], ['tapper', 'Tapper', 'Trees often drop amber sap.']]],
  mining: [[['miner', 'Miner', '+1 ore from every ore node.'], ['geologist', 'Geologist', 'Gem nodes give double gems.']], [['prospector', 'Prospector', 'More ladders, chests and shards underground.'], ['blacksmith', 'Blacksmith', 'Bars sell for 50% more.']]],
  fishing: [[['angler', 'Angler', 'Fish sell for 25% more.'], ['patient', 'Patient', 'Catch zone is 25% larger.']], [['diver', 'Treasure Diver', 'Treasure chests appear far more often.'], ['legend', 'Legend Seeker', 'Legendary fish bite far more often.']]],
  cooking: [[['chef', 'Chef', 'Food restores 30% more.'], ['gourmet', 'Gourmet', 'Cooked food sells for 50% more.']], [['feast', 'Feastmaster', 'Food buffs last twice as long.'], ['ironstomach', 'Iron Stomach', 'Eating also grants +2 max health permanently (up to +40).']]],
  combat: [[['fighter', 'Fighter', '+10% damage and +15 max health.'], ['scout', 'Scout', '+15% critical chance.']], [['brute', 'Brute', '+15% damage.'], ['acrobat', 'Acrobat', 'Dodge rolls recharge twice as fast.']]],
  smithing: [[['efficient', 'Efficient', '20% chance to save one bar when smithing.'], ['alloyist', 'Alloyist', '25% chance to smelt two bars.']], [['master', 'Master Smith', 'All your gear is 10% stronger.'], ['tinker', 'Tinker', 'Tool upgrades cost half.']]],
};
const xpNeed = l => Math.round(70 * Math.pow(l, 1.65));

/* animals & genetics */
const GENES = { fer: 'Fertility', vig: 'Vigor', tem: 'Temperament', yld: 'Yield', qlt: 'Quality', spd: 'Speed', sta: 'Stamina', str: 'Strength', agi: 'Agility' };
const ANIMAL = {
  chicken: { n: 'Chicken', price: 400, adult: 3, preg: 3, litter: [1, 3], prod: 'egg', every: 1, house: 'coop', golden: 'golden_egg', genes: ['yld', 'qlt', 'fer', 'vig', 'tem'] },
  duck: { n: 'Duck', price: 900, adult: 4, preg: 3, litter: [1, 2], prod: 'duck_egg', every: 2, extra: ['duck_feather', .25], house: 'coop', genes: ['yld', 'qlt', 'fer', 'vig', 'tem'] },
  rabbit: { n: 'Rabbit', price: 1200, adult: 3, preg: 2, litter: [2, 4], prod: 'rabbit_wool', every: 4, extra: ['rabbit_foot', .04], house: 'coop', genes: ['yld', 'qlt', 'fer', 'vig', 'tem'] },
  goat: { n: 'Goat', price: 2000, adult: 5, preg: 4, litter: [1, 2], prod: 'goat_milk', every: 2, house: 'barn', genes: ['yld', 'qlt', 'fer', 'vig', 'tem'] },
  sheep: { n: 'Sheep', price: 2400, adult: 5, preg: 4, litter: [1, 2], prod: 'wool', every: 3, house: 'barn', golden: 'golden_fleece', genes: ['yld', 'qlt', 'fer', 'vig', 'tem'] },
  cow: { n: 'Cow', price: 1500, adult: 5, preg: 5, litter: [1, 1], prod: 'milk', every: 1, house: 'barn', genes: ['yld', 'qlt', 'fer', 'vig', 'tem'] },
  pig: { n: 'Pig', price: 5000, adult: 6, preg: 4, litter: [2, 5], prod: 'truffle', every: 1, house: 'barn', genes: ['yld', 'qlt', 'fer', 'vig', 'tem'] },
  horse: { n: 'Horse', price: 0, adult: 6, preg: 6, litter: [1, 1], house: 'stable', genes: ['spd', 'sta', 'str', 'agi', 'fer', 'tem'] },
};
const TRAITS = {
  prolific: ['Prolific', 'Larger litters'], golden: ['Golden', 'Chance of golden produce'], hardy: ['Hardy', 'Never suffers from hunger or cold'], gentle: ['Gentle', 'Gains affection twice as fast'],
  twin: ['Twin-blood', 'Often bears twins'], giant: ['Giant', '+1 product and bigger body'], swift: ['Swift', '+8 effective speed in races'], tireless: ['Tireless', 'Never slows late in a race'],
  lucky: ['Lucky', 'Finds rare extras'], radiant: ['Radiant', 'A rare shimmering coat'],
};
const TRAIT_SP = { horse: ['swift', 'tireless', 'hardy', 'gentle', 'radiant', 'prolific'], other: ['prolific', 'golden', 'hardy', 'gentle', 'twin', 'giant', 'lucky', 'radiant'] };
const grade = v => v >= 90 ? 'S' : v >= 75 ? 'A' : v >= 60 ? 'B' : v >= 45 ? 'C' : 'D';
const NAMES = {
  chicken: ['Pip', 'Nugget', 'Clover', 'Biscuit', 'Henrietta', 'Pepper', 'Saffron', 'Dot', 'Marigold', 'Toffee', 'Sir Cluckalot', 'Wren', 'Penny', 'Custard'],
  duck: ['Puddles', 'Quincy', 'Drake', 'Waddles', 'Mallory', 'Bubbles', 'Ripple'], rabbit: ['Thumper', 'Clover', 'Bun', 'Hazel', 'Pippin', 'Mochi', 'Velvet', 'Juniper'],
  goat: ['Billy', 'Nanny', 'Gruff', 'Pepita', 'Bramble', 'Clementine', 'Hops'], sheep: ['Fleecy', 'Cumulus', 'Wooliam', 'Lamberta', 'Bo', 'Cotton', 'Nimbus', 'Puff', 'Dolly'],
  cow: ['Bluebell', 'Daisy', 'Maple', 'Buttercup', 'Clementine', 'Moodred', 'Hazel', 'Tilly', 'Bramble'], pig: ['Truffles', 'Hamlet', 'Pumpernickel', 'Rosie', 'Snout', 'Bacon', 'Wilbur'],
  horse: ['Gallant', 'Thistle', 'Arrow', 'Tempest', 'Sable', 'Mistral', 'Comet', 'Valor', 'Nimue', 'Briar', 'Seraph', 'Rowan', 'Halcyon', 'Ironhoof', 'Willow', 'Cinder', 'Aster', 'Dusk', 'Lancer', 'Gawain', 'Percival', 'Morrow'],
};
const RACES = [['sprint', 'Sprint', { spd: .7, sta: .05, str: .1, agi: .15 }], ['classic', 'Classic', { spd: .45, sta: .3, str: .1, agi: .15 }], ['endurance', 'Endurance', { spd: .2, sta: .6, str: .15, agi: .05 }], ['steeple', 'Steeplechase', { spd: .25, sta: .15, str: .25, agi: .35 }]];
const CUPS = [['Bronze', 100, 400, 38], ['Silver', 300, 1100, 55], ['Gold', 800, 2800, 72], ['Royal', 2000, 7500, 88]];

/* enemies */
const HP = (s, o) => Object.assign({ skin: '#f0c8a0', hair: '#3a2a1a', shirt: '#7a5a3a', pants: '#4a3a2a', shoe: '#2a1a10' }, o);
const EN = {
  slime: { n: 'Slime', art: 'slime', col: '#6cc24a', hp: 22, atk: 6, def: 0, spd: 26, xp: 5, ai: 'hop', drops: [['slime_goo', .8, 1, 2]], r: 6 },
  blueslime: { n: 'Blue Slime', art: 'slime', col: '#4a9ae8', hp: 40, atk: 9, def: 1, spd: 30, xp: 9, ai: 'hop', drops: [['slime_goo', .9, 1, 3]], r: 6 },
  crow: { n: 'Crow', art: 'bird', col: '#3a3a4a', hp: 18, atk: 7, def: 0, spd: 60, xp: 7, ai: 'swoop', drops: [['raptor_feather', .25, 1, 1]], r: 5 },
  wolf: { n: 'Grey Wolf', art: 'wolf', col: '#7a7470', hp: 55, atk: 11, def: 2, spd: 52, xp: 14, ai: 'chase', drops: [['hide', .6, 1, 1], ['fang', .35, 1, 1]], r: 7 },
  boar: { n: 'Wild Boar', art: 'boar', col: '#7a5a3e', hp: 70, atk: 14, def: 3, spd: 40, xp: 16, ai: 'charge', drops: [['hide', .8, 1, 2]], r: 7 },
  goblin: { n: 'Goblin', art: 'human', P: HP(0, { skin: '#6aa04a', hair: '#3a5a2a', shirt: '#7a5a3a', eye: '#ff3a2a', hs: 'spiky' }), hp: 60, atk: 12, def: 3, spd: 38, xp: 16, ai: 'ranged', shot: 'rock', drops: [['copper_ore', .4, 1, 3], ['$', .8, 10, 40]], r: 6 },
  bandit: { n: 'Bandit', art: 'human', P: HP(0, { shirt: '#5a4a6a', pants: '#3a3040', hood: '#4a3a2a', eye: '#2b1810' }), hp: 90, atk: 17, def: 5, spd: 44, xp: 22, ai: 'chase', drops: [['$', 1, 20, 70], ['iron_ore', .3, 1, 3], ['treasure_map', .03, 1, 1]], r: 6 },
  archer: { n: 'Bandit Archer', art: 'human', P: HP(0, { shirt: '#4a6a3a', pants: '#3a3040', hood: '#3a5a2a' }), hp: 70, atk: 15, def: 3, spd: 36, xp: 22, ai: 'ranged', shot: 'arrow', drops: [['$', 1, 20, 60], ['arrow', .6, 3, 8]], r: 6 },
  hawk: { n: 'Cliff Raptor', art: 'bird', col: '#8a5a3a', hp: 45, atk: 14, def: 2, spd: 70, xp: 18, ai: 'swoop', drops: [['raptor_feather', .6, 1, 2]], r: 6 },
  rockcrab: { n: 'Rock Crab', art: 'crab', col: '#8a8478', hp: 80, atk: 15, def: 12, spd: 30, xp: 20, ai: 'ambush', drops: [['chitin', .5, 1, 1], ['iron_ore', .5, 1, 3], ['silver_ore', .3, 1, 2]], r: 6 },
  crab: { n: 'Shore Crab', art: 'crab', col: '#d8542a', hp: 55, atk: 12, def: 6, spd: 40, xp: 14, ai: 'chase', drops: [['chitin', .7, 1, 2]], r: 6 },
  seaslime: { n: 'Sea Slime', art: 'slime', col: '#3ad8c8', hp: 60, atk: 13, def: 2, spd: 32, xp: 14, ai: 'hop', drops: [['slime_goo', .9, 1, 3], ['clam', .2, 1, 1]], r: 6 },
  pirate: { n: 'Drowned Pirate', art: 'human', P: HP(0, { skin: '#d8dcc8', hair: '#d8dcc8', shirt: '#3a5a8a', pants: '#5a4a3a', ribs: 1, hat: '#2a2a3a', eye: '#3ad8c8' }), hp: 110, atk: 20, def: 6, spd: 40, xp: 26, ai: 'chase', undead: 1, drops: [['$', 1, 30, 90], ['bone', .6, 1, 2], ['treasure_map', .05, 1, 1]], r: 6 },
  icewolf: { n: 'Frost Wolf', art: 'wolf', col: '#c8dcec', hp: 120, atk: 22, def: 6, spd: 58, xp: 30, ai: 'chase', elem: 'ice', drops: [['hide', .6, 1, 2], ['ice_shard', .4, 1, 1]], r: 7 },
  wraith: { n: 'Frost Wraith', art: 'ghost', col: '#c8e8ff', hp: 90, atk: 22, def: 4, spd: 34, xp: 30, ai: 'ghost', elem: 'ice', undead: 1, drops: [['ectoplasm', .6, 1, 1], ['ice_shard', .3, 1, 1]], r: 6 },
  yeti: { n: 'Yeti', art: 'yeti', col: '#e8f0fa', hp: 260, atk: 30, def: 10, spd: 32, xp: 55, ai: 'chase', drops: [['yeti_fur', .7, 1, 2], ['frost_ore', .5, 2, 4]], r: 10 },
  iceslime: { n: 'Ice Slime', art: 'slime', col: '#9fe7ff', hp: 100, atk: 20, def: 5, spd: 30, xp: 24, ai: 'hop', elem: 'ice', drops: [['ice_shard', .6, 1, 2]], r: 6 },
  imp: { n: 'Fire Imp', art: 'imp', col: '#c8341a', hp: 120, atk: 28, def: 6, spd: 50, xp: 40, ai: 'ranged', shot: 'fire', elem: 'fire', drops: [['imp_horn', .5, 1, 1], ['magma_shard', .4, 1, 2]], r: 6 },
  ashgolem: { n: 'Ash Golem', art: 'golem', col: '#5a4f4a', eye: '#ff7a2a', hp: 380, atk: 36, def: 16, spd: 26, xp: 70, ai: 'chase', drops: [['obsidian', .6, 1, 3], ['adamant_ore', .3, 1, 2]], r: 10 },
  magma: { n: 'Magma Slime', art: 'slime', col: '#ff7a1a', hp: 150, atk: 30, def: 8, spd: 30, xp: 34, ai: 'hop', elem: 'fire', drops: [['magma_shard', .6, 1, 2], ['gold_ore', .3, 1, 3]], r: 7 },
  shade: { n: 'Shade', art: 'ghost', col: '#4a3a6a', eye: '#ff4aff', hp: 180, atk: 36, def: 8, spd: 40, xp: 48, ai: 'ghost', undead: 1, drops: [['void_essence', .5, 1, 2], ['ectoplasm', .4, 1, 1]], r: 6 },
  bat: { n: 'Cave Bat', art: 'bat', col: '#4a2f5a', hp: 20, atk: 8, def: 0, spd: 44, xp: 7, ai: 'fly', drops: [['bat_wing', .45, 1, 1]], r: 5 },
  frostbat: { n: 'Frost Bat', art: 'bat', col: '#5a8ab8', hp: 70, atk: 20, def: 2, spd: 52, xp: 20, ai: 'fly', elem: 'ice', drops: [['bat_wing', .5, 1, 2], ['ice_shard', .2, 1, 1]], r: 5 },
  firebat: { n: 'Fire Bat', art: 'bat', col: '#a8341a', hp: 110, atk: 28, def: 4, spd: 56, xp: 30, ai: 'fly', elem: 'fire', drops: [['bat_wing', .5, 1, 2], ['magma_shard', .3, 1, 1]], r: 5 },
  voidbat: { n: 'Void Bat', art: 'bat', col: '#2a1a40', hp: 160, atk: 38, def: 6, spd: 60, xp: 44, ai: 'fly', drops: [['void_essence', .4, 1, 1]], r: 5 },
  skeleton: { n: 'Skeleton', art: 'human', P: HP(0, { skin: '#ece8dc', hair: '#ece8dc', shirt: '#d0ccc0', pants: '#b8b4a8', shoe: '#8a867a', eye: '#2a1a40', ribs: 1, belt: '#6a665a', hs: 'bald' }), hp: 95, atk: 18, def: 5, spd: 34, xp: 22, ai: 'chase', undead: 1, drops: [['bone', .7, 1, 2], ['iron_ore', .3, 1, 3]], r: 6 },
  voidknight: { n: 'Void Knight', art: 'human', P: HP(0, { skin: '#2a1a40', hair: '#2a1a40', shirt: '#3a2a5a', pants: '#2a2040', helm: '#4a3a6a', glow: '#ff4aff', hs: 'bald' }), hp: 280, atk: 44, def: 18, spd: 38, xp: 70, ai: 'chase', undead: 1, drops: [['void_essence', .7, 1, 2], ['adamant_ore', .4, 1, 3]], r: 6 },
  /* bosses */
  warden: { n: 'Stone Warden', art: 'golem', col: '#7a736a', scale: 1.6, hp: 1100, atk: 26, def: 10, spd: 28, xp: 300, ai: 'boss', boss: 1, moves: ['slam', 'ring', 'walk'], drops: [['warden_heart', 1, 1, 1], ['mythril_ore', 1, 4, 6], ['gold_ore', 1, 8, 12], ['amethyst', 1, 1, 2], ['ember_shard', .5, 1, 1]], r: 18 },
  wyrm: { n: 'Ember Wyrm', art: 'dragon', col: '#c2410c', hp: 2600, atk: 36, def: 14, spd: 40, xp: 800, ai: 'boss', boss: 1, elem: 'fire', moves: ['volley', 'ring', 'circle', 'summon:magma'], drops: [['dragon_scale', 1, 3, 4], ['diamond', 1, 1, 2], ['ruby', 1, 2, 3], ['ember_shard', 1, 1, 1]], r: 20 },
  lich: { n: 'The Pale Lich', art: 'human', P: HP(0, { skin: '#ece8dc', hair: '#ece8dc', shirt: '#4a2a6a', pants: '#3a1a5a', robe: 1, crown: 1, eye: '#9a6aff', glow: '#9a6aff', ribs: 0, hs: 'bald' }), scale: 2, hp: 4200, atk: 46, def: 16, spd: 34, xp: 1400, ai: 'boss', boss: 1, undead: 1, moves: ['volley', 'summon:skeleton', 'ring', 'blink'], drops: [['phylactery', 1, 1, 1], ['void_essence', 1, 4, 6], ['diamond', 1, 2, 3], ['ember_shard', 1, 1, 1]], r: 14 },
  hollowking: { n: 'The Hollow King', art: 'human', P: HP(0, { skin: '#1a1028', hair: '#1a1028', shirt: '#2a1a40', pants: '#1a1028', helm: '#3a2a5a', crown: 1, glow: '#ff4aff', cape: '#5a1a3a', hs: 'bald' }), scale: 2.5, hp: 8000, atk: 60, def: 22, spd: 46, xp: 3000, ai: 'boss', boss: 1, undead: 1, moves: ['charge', 'slam', 'volley', 'ring', 'summon:voidknight'], drops: [['hollow_crown', 1, 1, 1], ['starmetal', 1, 4, 6], ['prismatic', 1, 1, 1], ['ember_shard', 1, 2, 2]], r: 18 },
  warlord: { n: 'Bandit Warlord', art: 'human', P: HP(0, { shirt: '#8a2a2a', pants: '#3a3040', helm: '#8a8a92', plume: '#d8342a', beard: '#6a3a1a' }), scale: 2, hp: 1600, atk: 32, def: 12, spd: 46, xp: 500, ai: 'boss', boss: 1, moves: ['charge', 'slam', 'summon:bandit', 'walk'], drops: [['warlord_banner', 1, 1, 1], ['$', 1, 800, 1200], ['steel_bar', 1, 3, 5], ['ember_shard', 1, 1, 1]], r: 14 },
  snapper: { n: 'Old Snapper', art: 'crab', col: '#c84a2a', scale: 3, hp: 2000, atk: 34, def: 20, spd: 34, xp: 600, ai: 'boss', boss: 1, moves: ['charge', 'ring', 'summon:crab', 'walk'], drops: [['snapper_shell', 1, 1, 1], ['aquamarine', 1, 2, 3], ['nautilus', 1, 1, 2], ['ember_shard', 1, 1, 1]], r: 18 },
  frostgiant: { n: 'Frost Giant', art: 'yeti', col: '#d8e8f8', scale: 2, hp: 3200, atk: 44, def: 16, spd: 30, xp: 900, ai: 'boss', boss: 1, elem: 'ice', moves: ['slam', 'volley', 'ring', 'summon:icewolf'], drops: [['giant_heart', 1, 1, 1], ['frost_ore', 1, 8, 12], ['diamond', 1, 1, 1], ['ember_shard', 1, 1, 1]], r: 20 },
  colossus: { n: 'Ash Colossus', art: 'golem', col: '#4a403a', eye: '#ff7a2a', scale: 2.2, hp: 5000, atk: 54, def: 22, spd: 26, xp: 1600, ai: 'boss', boss: 1, elem: 'fire', moves: ['slam', 'ring', 'volley', 'summon:imp'], drops: [['colossus_core', 1, 1, 1], ['dragon_scale', 1, 1, 2], ['adamant_ore', 1, 6, 10], ['ember_shard', 1, 1, 1]], r: 22 },
};
const BIOME_EN = {
  meadow: { day: [['slime', 5], ['crow', 2], ['blueslime', 1]], night: [['slime', 3], ['wolf', 2], ['blueslime', 2]], lvl: 0 },
  forest: { day: [['wolf', 3], ['goblin', 3], ['boar', 2], ['slime', 2]], night: [['wolf', 5], ['goblin', 2], ['boar', 2]], lvl: 2 },
  highlands: { day: [['bandit', 3], ['archer', 2], ['hawk', 2], ['rockcrab', 2]], night: [['bandit', 2], ['wolf', 3], ['rockcrab', 2]], lvl: 5 },
  coast: { day: [['crab', 4], ['seaslime', 3], ['crow', 1]], night: [['pirate', 4], ['crab', 2], ['seaslime', 2]], lvl: 6 },
  frost: { day: [['icewolf', 3], ['iceslime', 3], ['yeti', 1]], night: [['wraith', 4], ['icewolf', 3], ['yeti', 1]], lvl: 10 },
  ash: { day: [['imp', 3], ['magma', 3], ['ashgolem', 1]], night: [['imp', 3], ['shade', 3], ['ashgolem', 2]], lvl: 15 },
};
const WBOSS = { highlands: 'warlord', coast: 'snapper', frost: 'frostgiant', ash: 'colossus' };
const MINE_THEME = n => n < 10 ? 'earth' : n < 20 ? 'ice' : n < 30 ? 'magma' : 'void';
const MINE_EN = { earth: [['slime', 3], ['bat', 3], ['skeleton', 2], ['rockcrab', 1]], ice: [['iceslime', 3], ['frostbat', 3], ['wraith', 2]], magma: [['magma', 3], ['firebat', 3], ['imp', 2]], void: [['shade', 3], ['voidbat', 3], ['voidknight', 2]] };
const MINE_BOSS = { 10: 'warden', 20: 'wyrm', 30: 'lich', 40: 'hollowking' };

/* objects */
const OBJ = {
  tree: { solid: 1, tall: 1, hp: 6, tool: 'axe', drop: [['wood', 4, 6]], xp: ['woodcutting', 8], becomes: 'stump', tree: 1 },
  stump: { solid: 1, hp: 4, tool: 'axe', drop: [['wood', 2, 3]], xp: ['woodcutting', 3] },
  ancient: { solid: 1, tall: 1, hp: 40, tool: 'axe', tlvl: 3, drop: [['hardwood', 6, 10], ['sap', 2, 3]], xp: ['woodcutting', 40], tree: 1 },
  log: { solid: 1, w: 2, hp: 14, tool: 'axe', tlvl: 2, drop: [['hardwood', 6, 8]], xp: ['woodcutting', 25] },
  bramble: { solid: 1, hp: 12, tool: 'axe', tlvl: 3, drop: [['fiber', 4, 6]], xp: ['woodcutting', 10] },
  rock: { solid: 1, hp: 4, tool: 'pick', drop: [['stone', 2, 3]], xp: ['mining', 3] },
  boulder: { solid: 1, w: 2, h: 2, hp: 18, tool: 'pick', tlvl: 2, drop: [['stone', 12, 18], ['clay', 1, 3]], xp: ['mining', 25] },
  cracked: { solid: 1, w: 2, h: 2, hp: 24, tool: 'pick', tlvl: 2, drop: [['stone', 8, 12]], xp: ['mining', 30], reveal: 1 },
  obsboulder: { solid: 1, w: 2, h: 2, hp: 50, tool: 'pick', tlvl: 4, drop: [['obsidian', 6, 10]], xp: ['mining', 60], reveal: 1 },
  iceboulder: { solid: 1, w: 2, h: 2, hp: 34, tool: 'pick', tlvl: 3, drop: [['ice_shard', 4, 6], ['frost_ore', 2, 4]], xp: ['mining', 40], reveal: 1 },
  meteor: { solid: 1, w: 2, h: 2, hp: 60, tool: 'pick', tlvl: 4, drop: [['starmetal', 4, 6], ['coal', 2, 4]], xp: ['mining', 80] },
  ore_coal: { solid: 1, hp: 6, tool: 'pick', drop: [['coal', 1, 2]], xp: ['mining', 6], ore: 1 }, ore_copper: { solid: 1, hp: 6, tool: 'pick', drop: [['copper_ore', 1, 3]], xp: ['mining', 6], ore: 1 },
  ore_iron: { solid: 1, hp: 10, tool: 'pick', drop: [['iron_ore', 1, 3]], xp: ['mining', 10], ore: 1 }, ore_silver: { solid: 1, hp: 12, tool: 'pick', drop: [['silver_ore', 1, 3]], xp: ['mining', 12], ore: 1 },
  ore_gold: { solid: 1, hp: 15, tool: 'pick', drop: [['gold_ore', 1, 3]], xp: ['mining', 15], ore: 1 }, ore_mythril: { solid: 1, hp: 22, tool: 'pick', drop: [['mythril_ore', 1, 2]], xp: ['mining', 22], ore: 1 },
  ore_frost: { solid: 1, hp: 26, tool: 'pick', tlvl: 3, drop: [['frost_ore', 1, 2]], xp: ['mining', 26], ore: 1 }, ore_obsidian: { solid: 1, hp: 30, tool: 'pick', tlvl: 3, drop: [['obsidian', 1, 2]], xp: ['mining', 30], ore: 1 },
  ore_adamant: { solid: 1, hp: 40, tool: 'pick', tlvl: 4, drop: [['adamant_ore', 1, 2]], xp: ['mining', 40], ore: 1 }, ore_gem: { solid: 1, hp: 12, tool: 'pick', drop: [['gem', 1, 1]], xp: ['mining', 18], ore: 1 },
  ore_star: { solid: 1, hp: 60, tool: 'pick', tlvl: 4, drop: [['starmetal', 1, 2]], xp: ['mining', 60], ore: 1 },
  crystalnode: { solid: 1, hp: 8, tool: 'pick', drop: [['cave_crystal', 1, 2], ['ice_shard', 0, 1]], xp: ['mining', 8] },
  stone: { solid: 1, hp: 1, tool: 'pick', drop: [['stone', 1, 1]], xp: ['mining', 1] }, weed: { solid: 1, hp: 1, tool: 'any', drop: [['fiber', 0, 1]], xp: ['foraging', 1] },
  twig: { solid: 1, hp: 1, tool: 'axe', drop: [['wood', 1, 2]], xp: ['woodcutting', 1] }, bush: { solid: 1, hp: 3, tool: 'axe', drop: [['wood', 1, 2]], xp: ['woodcutting', 2] },
  tgrass: { grass: 1 }, flower: {}, fern: {}, cattail: {}, shell: {}, mushroom: {},
  fence: { solid: 1, place: 1 }, sprinkler: { solid: 1, place: 1 }, qsprinkler: { solid: 1, place: 1 }, isprinkler: { solid: 1, place: 1 }, campfire: { solid: 1, place: 1, light: 1 },
  forge: { solid: 1, place: 1, tall: 1 }, beehive: { solid: 1, place: 1, tall: 1 }, scarecrow: { solid: 1, place: 1, tall: 1 }, lantern: { solid: 1, place: 1, tall: 1, light: 1 },
  keg: { solid: 1, place: 1, tall: 1, mach: 1 }, jar: { solid: 1, place: 1, tall: 1, mach: 1 }, cheese: { solid: 1, place: 1, tall: 1, mach: 1 }, loom: { solid: 1, place: 1, tall: 1, mach: 1 }, oilpress: { solid: 1, place: 1, tall: 1, mach: 1 }, smoker: { solid: 1, place: 1, tall: 1, mach: 1 },
  ftree: { solid: 1, tall: 1 }, bin: { solid: 1 }, board: { solid: 1, tall: 1 }, sign: { solid: 1, tall: 1 }, grave: { solid: 1, tall: 1 }, statue: { solid: 1, tall: 1 }, ruinwall: { solid: 1, tall: 1 },
  shrine: { solid: 1, tall: 1, w: 2 }, altar: { solid: 1, tall: 1, w: 2 }, well: { solid: 1, tall: 1, w: 2 }, tent: { solid: 1, tall: 1, w: 2 }, cart: { solid: 1, tall: 1, w: 2 }, wreck: { solid: 1, tall: 1, w: 4, h: 2 }, cave: { solid: 1, tall: 1, w: 2 },
  chest: { solid: 1 }, page: {}, shard: {}, dig: {}, buried: {}, fairy: {}, ladder: {}, upladder: {}, fg: {}, part: { solid: 1 },
};
/* NPCs */
const NPCS = {
  mara: { n: 'Mara', role: 'Shopkeeper', shop: 'store', P: { skin: '#f0c098', hair: '#c0562a', hs: 'long', shirt: '#4f8a5a', pants: '#5a4a3a', shoe: '#3a2a1a', apron: '#f2e6c4' }, love: ['strawberry', 'tulip', 'honey_cake', 'jam_strawberry'], like: ['egg', 'bread', 'dandelion', 'sunflower'], hate: ['slime_goo', 'bone'],
    lines: [['Seeds are seasonal, love. Plant what the weather allows.', 'Strawberries keep giving once they ripen.', 'Rain saves you a whole morning of watering.'], ['You look like you\'re settling in. The farm suits you.', 'My mother used to say the valley rewards patience.'], ['I keep a jar of your honey behind the counter. Don\'t tell anyone.', 'You\'ve brought this town back to life, you know.']], gifts: [[3, 'growth_tonic', 5], [6, 'rich_compost', 5], [9, 'emberfruit_seed', 3]] },
  brann: { n: 'Brann', role: 'Blacksmith', shop: 'smith', P: { skin: '#d8a070', hair: '#3a2a22', hs: 'short', shirt: '#6e6862', pants: '#3a3550', shoe: '#2a1a10', beard: '#3a2a22', apron: '#5a3a22' }, love: ['ruby', 'diamond', 'ale', 'dragon_scale'], like: ['iron_bar', 'gold_bar', 'coal', 'pale_ale'], hate: ['tulip', 'herb'],
    lines: [['Bring me ore and coal and I\'ll make you something sharp.', 'A better pickaxe chews through gold and mythril far quicker.', 'The Warden guards floor ten. Bring armor.'], ['Steel\'s just iron that\'s been through enough fire. Like people.', 'Frostsilver only comes from the peaks. Cold work, that.'], ['I\'d trust you with my own hammer now.', 'The old smiths spoke of starmetal. Falls from the sky, some nights.']], gifts: [[3, 'steel_bar', 3], [6, 'ring_ruby', 1], [9, 'star_ingot', 1]] },
  pip: { n: 'Pip', role: 'Tavern keeper', shop: 'tavern', P: { skin: '#f0c8a0', hair: '#e8d070', hs: 'pony', shirt: '#a33e2e', pants: '#4a3a2a', shoe: '#2a1a10', apron: '#e8dcc0' }, love: ['wine_grape', 'mead', 'truffle', 'cheese'], like: ['wheat', 'hops', 'milk', 'pumpkin'], hate: ['stone', 'fiber'],
    lines: [['A hot meal before the mines is worth three potions.', 'Moonfin only bite on winter nights in the river. Or so the old fishers say.', 'Cook at your house or any campfire, friend.'], ['Corwin out on the coast knows every fish by name.', 'There\'s a wandering merchant who parks in the meadow on Fridays and Sundays.'], ['You ever hear the story of the grove nobody can find? Old trees, older than the town.', 'Have a drink on me. You\'ve earned it.']], gifts: [[3, 'lucky_lunch', 2], [6, 'knights_feast', 2], [9, 'ring_lucky', 1]] },
  odile: { n: 'Odile', role: 'Stable master', shop: 'stablemaster', P: { skin: '#c88a60', hair: '#1a1210', hs: 'bun', shirt: '#6a4a8a', pants: '#3a2a22', shoe: '#2a1a10' }, love: ['golden_oats', 'apple', 'carrot', 'golden_fleece'], like: ['hay', 'wheat', 'corn', 'cloth'], hate: ['fang', 'bat_wing'],
    lines: [['A horse is four numbers and a heart. Breed for both.', 'Foals take after the average of their parents, plus a little luck.', 'Pet your animals daily. Happy mares foal faster.'], ['Traits run in bloodlines. Pair two carriers and you\'ll nearly always see it.', 'Speed wins sprints. Stamina wins the long road.'], ['I\'ve never seen a horse like the ones you raise.', 'Golden oats can push a horse past what its blood allows. A little.']], gifts: [[3, 'golden_oats', 2], [6, 'golden_oats', 5], [9, 'ring_topaz', 1]] },
  hale: { n: 'Hale', role: 'Carpenter', shop: 'carpenter', P: { skin: '#e0b088', hair: '#8a5a2a', hs: 'short', shirt: '#c87a3a', pants: '#3a4a6a', shoe: '#3a2a1a', beard: '#8a5a2a' }, love: ['hardwood', 'sap', 'truffle_oil', 'mead'], like: ['wood', 'stone', 'clay', 'ale'], hate: ['slime_goo', 'ectoplasm'],
    lines: [['Need a bigger barn? I\'ve got the timber.', 'Hardwood comes from the big logs in the forest. You\'ll want a copper axe.'], ['That greenhouse of your grandmother\'s, I could fix it. For a price.', 'Silos keep cut grass as hay. Saves a fortune in winter.'], ['You\'ve got a builder\'s eye. Ever think of taking an apprentice?', 'I carved my first fence post the year the wyrm stirred.']], gifts: [[3, 'hardwood', 20], [6, 'keg', 1], [9, 'isprinkler', 2]] },
  elias: { n: 'Elias', role: 'Curator', shop: 'museum', P: { skin: '#f0d0b0', hair: '#c8c8c8', hs: 'short', shirt: '#4a64a0', pants: '#3a3a52', shoe: '#1a1a1a', beard: '#c8c8c8' }, love: ['star_chart', 'diamond', 'prismatic', 'moon_mushroom'], like: ['amethyst', 'topaz', 'cave_crystal', 'nautilus'], hate: ['hay', 'slime_goo'],
    lines: [['Every artifact you dig up is a page of our history.', 'Look for wiggling worms in the soil. Dig there.'], ['The lost pages tell of a knight who sealed the wyrm. I want to know how it ends.', 'Four shrines, four elements. The old faith was very tidy.'], ['You\'ve done more for this museum than three generations of my family.', 'If you ever find the Ember Idol\'s twin, bring it here first.']], gifts: [[3, 'treasure_map', 2], [6, 'ring_amethyst', 1], [9, 'prismatic', 1]] },
  corwin: { n: 'Corwin', role: 'Old fisher', shop: 'fisher', P: { skin: '#c89070', hair: '#e8e8e8', hs: 'short', shirt: '#3a6a8a', pants: '#4a3a2a', shoe: '#2a1a10', beard: '#e8e8e8', hat: '#c8a04a' }, love: ['tidemother', 'smoked_salmon', 'fish_stew', 'sushi'], like: ['carp', 'sardine', 'tuna', 'clam'], hate: ['hay', 'stone'],
    lines: [['Patience is a fisher\'s only bait.', 'Some fish only bite when it rains. Others only by moonlight.', 'There are legends in these waters. Five of them, if you believe my grandfather.'], ['Lava eels? Aye, they swim in fire. Don\'t ask me how.', 'A better rod gives you a wider net, so to speak.'], ['You\'re the best I\'ve seen, and I\'ve seen my share.', 'Take this. My grandfather\'s. It\'s brought me luck.']], gifts: [[3, 'smoked_tuna', 2], [6, 'sushi', 3], [9, 'ring_aqua', 1]] },
};
const QUESTS = [
  ['First harvest', 'Harvest 15 crops', () => S.stats.harvest >= 15, 300], ['Barnyard', 'Buy your first animal', () => S.stats.bought >= 1, 300], ['Into the Wilds', 'Explore 10% of the Wilds', () => explorePct() >= 10, 500],
  ['Into the deep', 'Reach mine floor 5', () => S.stats.deepest >= 5, 500], ['Angler', 'Catch 15 fish', () => S.stats.fish >= 15, 600], ['Smith\'s apprentice', 'Forge any steel gear', () => Object.keys(S.stats.forged).some(k => k.startsWith('steel_')), 800],
  ['Lost pages', 'Find 3 lost journal pages', () => Object.keys(S.pages).length >= 3, 600], ['The Stone Warden', 'Defeat the boss on mine floor 10', () => S.bosses.warden > 0, 1500], ['Bandit Warlord', 'Defeat the warlord in the highlands', () => S.bosses.warlord > 0, 1500],
  ['Bloodlines', 'Breed an animal with a trait', () => S.stats.traitBred >= 1, 1200], ['Old Snapper', 'Defeat the giant crab on the coast', () => S.bosses.snapper > 0, 2000], ['Golden gallop', 'Win any Gold cup race', () => S.stats.cupMax >= 3, 2500],
  ['The Ember Wyrm', 'Defeat the boss on mine floor 20', () => S.bosses.wyrm > 0, 5000], ['Frost Giant', 'Defeat the giant on Frostpeak', () => S.bosses.frostgiant > 0, 4000], ['Shrinekeeper', 'Restore all four shrines', () => Object.keys(S.shrines).length >= 4, 6000],
  ['The Pale Lich', 'Defeat the boss on mine floor 30', () => S.bosses.lich > 0, 7000], ['Ash Colossus', 'Defeat the colossus in the Ashen Wastes', () => S.bosses.colossus > 0, 7000], ['Curator', 'Donate 15 items to the museum', () => Object.keys(S.museum).length >= 15, 4000],
  ['Royal Cup', 'Win any Royal cup race', () => S.stats.cupMax >= 4, 8000], ['The perfect steed', 'Breed a horse rated 95 or higher', () => S.stats.bestBred >= 95, 10000], ['Starforged', 'Forge any Starforged gear', () => Object.keys(S.stats.forged).some(k => k.startsWith('star_')), 10000],
  ['The Hollow King', 'Defeat the boss on mine floor 40', () => S.bosses.hollowking > 0, 25000], ['Ember-bright', 'Collect all 30 ember shards', () => S.shardsTotal >= 30, 20000], ['Master of Emberhollow', 'Reach level 10 in every skill', () => SK.every(k => S.sk[k].l >= 10), 30000],
];
const PAGES = [
  'Day one. Father says the hill hums at night. Mother says that is the wind. I think they are both lying to me.',
  'Sir Aldren came through the village today in black armor. He asked for the way to the old mine and paid in coin nobody recognised.',
  'They say there are four shrines, one for each wind. Leaf, tide, frost and flame. Offer each what it hungers for and the hill sleeps easier.',
  'The forest shrine asks for wood older than the town. Hardwood, I think, and something lucky.',
  'The tide shrine wants the sea\'s own treasure. The fishers say it means something the sea gives up only rarely.',
  'Sir Aldren did not come back. His squire buried a chest by the old ruins and wept. I watched from the hedge.',
  'Grandmother planted a grove in the forest, ringed with ancient oaks so that only an iron axe could find it. She would not tell me why.',
  'The frost shrine is a hungry thing. Bring it a frozen heart. The giant on the peak keeps one, they say.',
  'The flame shrine wants fire that does not burn out. Only the deepest beast carries such a thing.',
  'Stars fell over the Wastes last night. Brann\'s father ran out with a cart and a pickaxe and came back laughing.',
  'Thirty shards of ember, scattered when the wyrm was sealed. Gather them and the altar remembers its purpose.',
  'If you are reading this, the farm is yours now. Go down, child. Past the wyrm, past the lich, to the one who wears the hollow crown. Finish what Aldren started.',
];
const SHRINES = {
  forest: { n: 'Shrine of Leaves', need: { hardwood: 30, rabbit_foot: 1 }, reward: 'maxhp', desc: '+25 max health permanently' },
  coast: { n: 'Shrine of Tides', need: { nautilus: 1, tuna: 3, aquamarine: 2 }, reward: 'fishzone', desc: 'Your catch zone is permanently larger' },
  frost: { n: 'Shrine of Frost', need: { giant_heart: 1, frost_bar: 3 }, reward: 'stamina', desc: '+40 max energy permanently' },
  ash: { n: 'Shrine of Flame', need: { dragon_scale: 2, colossus_core: 1 }, reward: 'fireres', desc: 'Permanent immunity to burning and +5 attack' },
};
const SHARD_REWARDS = [[5, 'ring_lucky', 1, 'Clover Ring'], [10, 'emberfruit_seed', 5, '5 Ember Fruit seeds'], [15, 'golden_oats', 5, '5 Golden Oats'], [20, 'prismatic', 1, 'Prismatic Shard'], [25, 'moonblossom_seed', 5, '5 Moonblossom bulbs'], [30, 'ring_ember', 1, 'Ember Signet']];
const BUILD = {
  coop: { n: 'Coop', lv: [[0, {}, 4], [4000, { wood: 200, stone: 100 }, 8], [10000, { wood: 300, hardwood: 40, iron_bar: 5 }, 14], [20000, { hardwood: 100, gold_bar: 5, cloth: 2 }, 20]], what: 'chickens, ducks, rabbits' },
  barn: { n: 'Barn', lv: [[0, {}, 4], [6000, { wood: 300, stone: 150 }, 8], [12000, { wood: 400, hardwood: 60, iron_bar: 6 }, 14], [25000, { hardwood: 120, gold_bar: 6, cloth: 3 }, 20]], what: 'cows, goats, sheep, pigs' },
  stable: { n: 'Stable', lv: [[0, {}, 3], [8000, { wood: 300, hardwood: 30 }, 6], [18000, { hardwood: 80, iron_bar: 8, cloth: 2 }, 10]], what: 'horses' },
  silo: { n: 'Silo', lv: [[0, {}, 0], [1500, { stone: 100, clay: 10, copper_bar: 5 }, 240]], what: 'hay from cut grass' },
  greenhouse: { n: 'Greenhouse', lv: [[0, {}, 0], [15000, { wood: 300, hardwood: 50, iron_bar: 10, aquamarine: 3 }, 1]], what: 'crops in any season' },
};
const RUMORS = ['The deeper the mine, the richer the ore. Gold shows up past floor nine.', 'Beehives make honey every few days, except in winter.', 'Gold sprinklers water a 5×5 square every morning.', 'Wolves prowl the Wilds after dark.',
  'Every fifth mine floor, the elevator remembers you.', 'Rain waters every crop on your farm.', 'Cut tall grass with your scythe: it gives fibre and hay. Store the hay in a silo for winter.', 'Wiggling worms in the soil mean something is buried there.',
  'They say a meteor falls on clear nights now and then. You need a gold pickaxe to crack one.', 'Ancient oaks only yield to an iron axe.', 'The bandits on the highlands keep a camp with a chest full of loot.', 'Frostsilver ore only grows in the far north.'];
