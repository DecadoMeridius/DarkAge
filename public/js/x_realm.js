/* ================= The realm: a bigger Wilds, its towns, roads, guards and knight patrols =================
   (plan in docs/IDEAS_KINGDOMS.md)
   THE WILDS are WK (2.2) times the old size each way (d_world.js). Saves made before that get a
   new Wilds once (S.wildsVer 2): the old map, its waystone spot, story places and regrowth timers
   there are dropped. Big generated maps are saved as their changes (DELTA_MAP in d_world.js).
   TOWNS: four hand-laid plans (TOWNS) placed per world in a fitting biome, joined by roads with
   signposts: the walled city of Kingsbridge, the walled mining town of Greyhelm, the fenced
   woodcutters' village of Ashford and the fishing village of Saltmere. Every shop has a room
   (ROOMS, made from ROOM_KIT) and a keeper (TOWN_NPCS, in NPCS: friendship, gifts, Friends tab)
   who keeps opening hours (HOURS, SCHED) and walks the streets outside them. Town halls keep a
   board of town jobs (TOWN_JOBS, S.realm.q) and each town keeps your standing (S.realm.rep).
   ALLIES: town guards hold posts and knight patrols of 2-4 ride the roads between towns. They
   are friendly to you and fight monsters: they pick the nearest monster in reach, close in and
   strike; monsters next to them hurt them back; a beaten ally falls back and returns later. */

/* ---- moving old saves onto the bigger Wilds ---- */
initMaps = (f => function () {
  if ((S.wildsVer || 1) < 2) {
    if (S.mapsave) delete S.mapsave.wilds;
    if (S.story && S.story.places) for (const k in S.story.places) if (S.story.places[k][0] === 'wilds') delete S.story.places[k];
    if (S.wayPos) delete S.wayPos.wilds;
    if (S.respawn) S.respawn = S.respawn.filter(r => r.map !== 'wilds');
    if (S.restock) S.restock = S.restock.filter(r => r.map !== 'wilds');
    S.poiSeen = {}; S.explored = ''; S.tmap = null;
    if (S.p && S.p.map === 'wilds') { S.p.map = 'farm'; S.p.x = 9.5 * 16; S.p.y = 10.5 * 16; }
    S.wildsVer = 2;
  }
  S.realm = S.realm || { q: {}, rep: {} };
  f();
  const m = MAPS.wilds;
  for (const T of m.towns || []) putWaystone(m, 'wilds_' + T.id, [T.cx, T.cy + 3]);
  townLife(true);
})(initMaps);

/* ---- the towns: hand-laid plans, placed per world in a fitting biome ----
   b: [kind, x, y, w, h, act, name]  (door on the bottom row, middle tile, as addB)
   st: street rectangles [x, y, w, h, tile]; props: [k, x, y]; guards: posts; spots: where villagers spend the day. */
const TOWNS = {
  kingsbridge: { n: 'Kingsbridge', kind: 'City', bio: 'meadow', w: 56, h: 46, ground: 'g', walls: 'stone',
    gates: { N: [27, 0], S: [27, 45], W: [0, 22], E: [55, 22] },
    towers: [[0, 1], [54, 1], [0, 45], [54, 45], [25, 1], [29, 1], [25, 45], [29, 45], [0, 20], [54, 20]], // only above the side gates: a tower below one would hide the gateway
    st: [[26, 1, 4, 44, 'p'], [1, 21, 54, 4, 'p'], [12, 3, 2, 40, 'p'], [42, 3, 2, 40, 'p'], [3, 11, 50, 2, 'p'], [3, 33, 50, 2, 'p'], [3, 41, 50, 2, 'p'], [19, 15, 18, 15, 'st']],
    b: [['kb_temple', 16, 4, 8, 7, 'kb_temple', 'Temple of the Ember'], ['kb_hall', 31, 4, 9, 7, 'kb_hall', 'Town Hall'], ['kb_house_a', 4, 6, 5, 5, 'k_house'], ['kb_house_c', 45, 6, 5, 5, 'k_house'],
      ['kb_inn', 4, 15, 7, 6, 'kb_inn', 'The Crowned Stag'], ['kb_market', 14, 16, 6, 5, 'kb_market', 'Wynna\'s Emporium'], ['kb_bank', 36, 16, 6, 5, 'kb_bank', 'Kingsbridge Bank'], ['kb_smith', 45, 16, 6, 5, 'kb_smith', 'Garrick\'s Forge'],
      ['kb_barracks', 4, 28, 7, 5, 'kb_barracks', 'The Barracks'], ['kb_house_b', 15, 29, 4, 4, 'k_house'], ['kb_house_a', 20, 28, 5, 5, 'k_house'], ['kb_house_c', 31, 28, 5, 5, 'k_house'],
      ['kb_house_b', 37, 29, 4, 4, 'k_house'], ['kb_house_a', 45, 28, 5, 5, 'k_house'], ['kb_house_c', 4, 36, 5, 5, 'k_house'], ['kb_house_b', 15, 37, 4, 4, 'k_house'], ['kb_house_a', 20, 36, 5, 5, 'k_house'],
      ['kb_house_b', 32, 37, 4, 4, 'k_house'], ['kb_house_c', 36, 36, 5, 5, 'k_house'], ['kb_house_a', 45, 36, 5, 5, 'k_house'],
      ['stall', 20, 17, 3, 2, 'kb_stall', 'Market stall'], ['stall', 33, 17, 3, 2, 'kb_stall', 'Market stall'], ['stall', 20, 26, 3, 2, 'kb_stall', 'Market stall'], ['stall', 33, 26, 3, 2, 'kb_stall', 'Market stall']],
    props: [['fountain', 26, 23], ['statue', 14, 9], ['statue', 30, 9], ['statue', 41, 9], ['tree', 2, 4], ['tree', 10, 3], ['tree', 52, 4], ['tree', 2, 14], ['tree', 52, 14], ['tree', 2, 30], ['tree', 52, 30], ['tree', 11, 38], ['tree', 41, 38],
      ['furn_bench', 23, 20], ['furn_bench', 30, 20], ['furn_bench', 23, 25], ['furn_bench', 30, 25],
      ...[5, 9, 13, 31, 37, 43].flatMap(y => [['lantern', 25, y], ['lantern', 30, y]]), ['lantern', 11, 20], ['lantern', 44, 20], ['lantern', 11, 25], ['lantern', 44, 25]],
    guards: [[24, 42], [31, 42], [26, 3], [29, 3], [3, 21], [3, 24], [52, 21], [52, 24], [8, 35]],
    spots: [[24, 19], [31, 27], [20, 13], [17, 22], [35, 13], [47, 23], [8, 23], [38, 23]] },
  greyhelm: { n: 'Greyhelm', kind: 'Town', bio: 'highlands', w: 40, h: 30, ground: 'st', walls: 'stone', // stony ground, a mine mouth, rails, carts and spoil (art round: 'nothing says mining town')
    gates: { N: [19, 0], S: [19, 29] },
    towers: [[0, 1], [38, 1], [0, 29], [38, 29], [17, 1], [21, 1], [17, 29], [21, 29]],
    st: [[18, 1, 4, 28, 'p'], [1, 13, 38, 3, 'p']],
    b: [['hm_hall', 3, 4, 7, 6, 'gh_hall', 'The Longhouse'], ['gh_inn', 24, 5, 7, 5, 'gh_inn', 'The Iron Kettle'], ['hm_house', 12, 6, 5, 4, 'k_house'], ['hm_house', 32, 5, 5, 4, 'k_house'],
      ['hm_forge', 3, 18, 6, 5, 'gh_forge', 'Borek\'s Forge'], ['gh_supply', 24, 18, 6, 5, 'gh_supply', 'Miners\' Supply'], ['hm_house', 11, 19, 5, 4, 'k_house'], ['hm_house', 31, 19, 5, 4, 'k_house'],
      ['hm_house', 3, 24, 5, 4, 'k_house'], ['hm_house', 11, 24, 5, 4, 'k_house'], ['hm_house', 24, 24, 5, 4, 'k_house'], ['hm_house', 31, 24, 5, 4, 'k_house'], ['mine', 31, 9, 5, 4, null]],
    props: [['furn_crate', 14, 16], ['furn_coal', 10, 22], ['furn_crate', 30, 22], ['furn_barrel', 35, 18], ['well', 22, 11], ...[4, 9, 18, 24].flatMap(y => [['lantern', 17, y], ['lantern', 22, y]]), ['tree', 2, 11],
      ...[13, 14, 15, 16].map(y => ['furn_rails_v', 33, y]), ...[27, 28, 29, 30, 31, 32, 33].map(x => ['furn_rails', x, 17]), ['furn_minecart', 34, 15], ['furn_minecart', 27, 16], ['furn_slag', 37, 13], ['furn_slag', 36, 16], ['furn_coal', 9, 22], ['furn_anvil', 9, 20], ['furn_coal', 29, 12]],
    guards: [[16, 26], [23, 26], [18, 3], [21, 3]],
    spots: [[20, 12], [8, 16], [28, 12], [23, 26], [14, 14]] },
  ashford: { n: 'Ashford', kind: 'Village', bio: 'forest', w: 34, h: 26, ground: 'g', walls: 'fence',
    gates: { W: [0, 12], E: [33, 12], N: [16, 0], S: [16, 25] },
    st: [[0, 12, 34, 2, 'd'], [16, 0, 2, 26, 'd']],
    b: [['af_tavern', 3, 6, 7, 5, 'af_tavern', 'The Felled Oak'], ['cottage', 10, 6, 5, 5, 'k_house'], ['af_trader', 20, 6, 6, 5, 'af_trader', 'Ashford Trading Post'], ['af_hut', 27, 7, 4, 4, 'k_house'],
      ['cottage', 3, 15, 5, 5, 'k_house'], ['af_hut', 10, 16, 4, 4, 'k_house'], ['af_saw', 20, 15, 6, 5, 'af_saw', 'Ashford Sawmill'], ['af_hut', 27, 16, 4, 4, 'k_house']],
    props: [['well', 12, 22], ['furn_lumber', 27, 21], ['furn_lumber', 21, 22], ['tree', 2, 2], ['tree', 8, 2], ['tree', 29, 2], ['tree', 2, 22], ['tree', 30, 22], ['tree', 24, 3],
      ['lantern', 15, 11], ['lantern', 18, 11], ['lantern', 15, 14], ['lantern', 18, 14], ['furn_barrel', 9, 11], ['flower', 6, 11], ['flower', 7, 11], ['flower', 12, 11],
      ['furn_logpile', 5, 22], ['furn_logpile', 23, 11], ['furn_logpile', 29, 21], ['stump', 8, 23], ['stump', 25, 23], ['furn_hay', 31, 11]],
    guards: [[1, 11], [32, 14]],
    spots: [[14, 19], [8, 13], [24, 21], [19, 11]] },
  saltmere: { n: 'Saltmere', kind: 'Village', bio: 'coast', w: 32, h: 24, ground: 's', walls: null, sea: 1,
    gates: { W: [0, 11], N: [10, 0], S: [10, 23] },
    st: [[0, 11, 24, 2, 'd'], [10, 0, 2, 24, 'd']],
    water: [[24, 0, 8, 24]], bridge: [[20, 11, 12, 2]],
    b: [['sm_tavern', 2, 4, 6, 5, 'sm_tavern', 'The Salty Gull'], ['sm_fish', 13, 5, 5, 4, 'sm_fish', 'Finn\'s Fish'], ['sr_house', 19, 4, 4, 4, 'k_house'],
      ['sm_chandler', 2, 15, 5, 4, 'sm_chandler', 'Perrin\'s Chandlery'], ['sr_house', 13, 14, 4, 4, 'k_house'], ['sr_house', 19, 15, 4, 4, 'k_house']],
    props: [['furn_nets', 6, 14], ['furn_barrel', 12, 14], ['furn_crate', 13, 10], ['furn_rowboat', 13, 20], ['furn_rowboat', 3, 21], ['furn_fishrack', 14, 2], ['furn_fishrack', 3, 10], ['furn_nets', 18, 10], ['lantern', 21, 10], ['lantern', 25, 10], ['lantern', 29, 10], ['tree', 1, 1], ['tree', 1, 21], ['tree', 7, 21], ['tree', 22, 21]],
    guards: [[1, 10], [1, 13]],
    spots: [[27, 12], [8, 10], [21, 20], [16, 10]] },
};
const TOWN_ORDER = ['kingsbridge', 'greyhelm', 'ashford', 'saltmere'];
const TREEK = { meadow: 'oak', forest: 'oak', highlands: 'pine', coast: 'palm', frost: 'pine', ash: 'dead' };

/* ---- the people (in NPCS: friendship, gifts and the Friends tab) ---- */
const TP = o => Object.assign({ shoe: '#3a2a1a' }, o);
const TOWN_NPCS = {
  hollis: { town: 'kingsbridge', n: 'Hollis', role: 'Innkeeper', shop: 'kb_inn', P: TP({ skin: '#e8b890', hair: '#6a4a2a', hs: 'short', shirt: '#8a3a2a', pants: '#3a2a22', apron: '#e8dcc0', beard: '#6a4a2a' }), love: ['knights_feast', 'roast_feast', 'wine_grape'], like: ['bread', 'cheese', 'pork'], hate: ['slime_goo'],
    lines: [['Welcome to the Crowned Stag. Best beds this side of the capital.', 'Knights drink here on their way north. Keep your voice down near the corner table.'], ['The patrols have doubled since spring. Something has the council nervous.', 'Try the roast. My grandmother\'s recipe. She was a terrible woman but a great cook.'], ['You\'re practically family now. Your mug has its own hook.', 'If you ever need a room, it\'s yours. No charge for friends.']], gifts: [[3, 'roast_feast', 2], [6, 'knights_feast', 3], [9, 'ring_lucky', 1]] },
  wynna: { town: 'kingsbridge', n: 'Wynna', role: 'Merchant', shop: 'kb_market', P: TP({ skin: '#c8906a', hair: '#1a1210', hs: 'bun', shirt: '#2a64a0', pants: '#e8dcc0' }), love: ['pearl', 'emerald', 'wine_peach'], like: ['honey', 'jam_cherry', 'cheese'], hate: ['bone', 'fang'],
    lines: [['Everything from four provinces under one roof. Mostly under one roof.', 'Seeds from every season. The capital pays a premium for fruit out of season.'], ['Kingsbridge was a toll bridge before it was a town. My family collected the tolls.', 'Saltmere fish, Greyhelm iron, Ashford timber. Everything flows through here.'], ['For you, the good shelf. The one behind the counter.']], gifts: [[3, 'growth_tonic', 4], [6, 'rich_compost', 6], [9, 'ring_emerald', 1]] },
  garrick: { town: 'kingsbridge', n: 'Garrick', role: 'Master smith', shop: 'kb_smith', P: TP({ skin: '#8a5a3a', hair: '#2a1a10', hs: 'short', shirt: '#5a5650', pants: '#3a3550', apron: '#4a2e1a', beard: '#2a1a10' }), love: ['mythril_bar', 'adamant_bar', 'star_ingot'], like: ['iron_bar', 'steel_bar', 'coal'], hate: ['tulip'],
    lines: [['I shoe the knights\' horses and mend their mail. Busy year.', 'Brann in Emberhollow? We apprenticed together. He still owes me a hammer.'], ['A blade is only as good as the hands that fold it.', 'The royal armoury is empty. Half of it walked off with the Hollow King.'], ['If you ever need a knight\'s sword, come to me first.']], gifts: [[3, 'steel_bar', 4], [6, 'mythril_bar', 3], [9, 'ring_ruby', 1]] },
  aurelia: { town: 'kingsbridge', n: 'Aurelia', role: 'Banker', shop: 'kb_bank', P: TP({ skin: '#f0d0b0', hair: '#e8d090', hs: 'long', shirt: '#2e3a5a', pants: '#2a2a30' }), love: ['diamond', 'ancient_coin', 'gold_bar'], like: ['ruby', 'topaz', 'silver_bar'], hate: ['hay', 'fiber'],
    lines: [['Your vault here is the same one you keep at home. Banking is magic, darling.', 'Gold sleeps safer behind three locks and a very large guard.'], ['The council borrowed heavily this year. Armies are expensive.'], ['You\'re the only client who brings me presents. Keep doing it.']], gifts: [[3, 'gold_bar', 3], [6, 'diamond', 1], [9, 'ring_diamond', 1]] },
  tam: { town: 'kingsbridge', n: 'Brother Tam', role: 'Priest of the Ember', shop: 'kb_temple', P: TP({ skin: '#e0b48e', hair: '#d8d0c0', hs: 'bald', shirt: '#c8601a', pants: '#8a3a1a', robe: '#c8601a', beard: '#d8d0c0' }), love: ['ember_shard', 'cinderbloom', 'honey'], like: ['bread', 'herb', 'honey_cake'], hate: ['bat_wing'],
    lines: [['The Ember burns in every hearth. Even the cold ones, if you look.', 'Rest a while. The temple heals those who ask.'], ['Sister Wren writes to me. She says you\'ve walked the pilgrims\' road.'], ['The flame knows you now. I see it when you walk in.']], gifts: [[3, 'growth_tonic', 3], [6, 'ember_shard', 1], [9, 'ring_ember', 1]] },
  osric: { town: 'kingsbridge', n: 'Mayor Osric', role: 'Mayor', shop: 'kb_hall', P: TP({ skin: '#e8c0a0', hair: '#a8a8a8', hs: 'short', shirt: '#4a2470', pants: '#2a2a2a', cape: '#e8b830', beard: '#a8a8a8' }), love: ['wine_grape', 'truffle_risotto', 'knights_seal'], like: ['cheese', 'jam_plum', 'roast_feast'], hate: ['slime_goo', 'hay'],
    lines: [['Kingsbridge stands where the royal road crosses the river. That makes it important. And me, by extension.', 'The board has work for anyone with a strong arm.'], ['The regent\'s men came asking about a missing girl. I said I\'d never heard of her. Which was true, at the time.'], ['Kingsbridge owes you. I\'ll have a statue made. A small one.']], gifts: [[3, 'knights_feast', 2], [6, 'gold_bar', 5], [9, 'ring_topaz', 1]] },
  vey: { town: 'kingsbridge', n: 'Captain Vey', role: 'Captain of the Watch', shop: 'kb_barracks', P: TP({ skin: '#c88a60', hair: '#3a2a1a', hs: 'pony', shirt: '#6a3a9a', pants: '#2a2a32', helm: '#a8b0c0', helmS: 'steel', armS: 'steel', armor: '#8a92a4', trim: '#6a3a9a', cape: '#4a2470' }), love: ['steel_sword', 'knights_feast', 'griffin_feather'], like: ['bread', 'iron_bar', 'leather'], hate: ['wine_strawberry'],
    lines: [['My knights ride the roads in twos, threes and fours. If you see them, they\'ll have your back.', 'Wolves, bandits, worse. The Wilds grew teeth while the crown was hollow.'], ['More of us are in the saddle than in fifty years. Someone is expecting trouble.'], ['If you ever want to take the oath, I\'ll stand witness.']], gifts: [[3, 'iron_body', 1], [6, 'steel_shield', 1], [9, 'ring_tyrant', 1]] },
  nell: { town: 'kingsbridge', n: 'Nell', role: 'Errand girl', shop: 'k_talk', P: TP({ skin: '#f0c8a0', hair: '#c8642a', hs: 'pony', shirt: '#5a7a3a', pants: '#5a4a3a' }), love: ['honey_cake', 'blackberry', 'berry_tart'], like: ['apple', 'strawberry', 'egg'], hate: ['coal', 'stone'],
    lines: [['I know every alley in Kingsbridge. Two coppers and I\'ll show you. One copper and I\'ll show you most of them.', 'The knights let me feed their horses. The grey one bites.'], ['I saw a lady in a purple cloak buy bread at dawn and run off toward the woods. Very suspicious.'], ['When I grow up I\'m going to be a knight. Or a pirate. Whichever pays.']], gifts: [[3, 'blackberry', 6], [6, 'honey_cake', 2], [9, 'rabbit_foot', 1]] },
  dagna: { town: 'greyhelm', n: 'Dagna', role: 'Innkeeper', shop: 'gh_inn', P: TP({ skin: '#d8a070', hair: '#a83a1a', hs: 'bun', shirt: '#5a6a4a', pants: '#3a3a40', apron: '#8a6a4a' }), love: ['miners_pie', 'highland_stew'], like: ['potato', 'red_meat', 'cheese'], hate: ['tulip', 'sea_urchin'],
    lines: [['Boots off the table. Pie\'s hot. Ale\'s cold. In that order.', 'Miners pay in ore half the time. I\'ve a cellar full of copper.'], ['The old king\'s silver came out of these hills. Now look at us.'], ['You\'re a Greyhelmer now, whether you like it or not.']], gifts: [[3, 'miners_pie', 3], [6, 'highland_stew', 3], [9, 'ring_topaz', 1]] },
  borek: { town: 'greyhelm', n: 'Borek', role: 'Smith', shop: 'gh_forge', P: TP({ skin: '#c8906a', hair: '#5a3a22', hs: 'bald', shirt: '#6e6862', pants: '#3a3550', apron: '#3a2416', beard: '#8a5a3a' }), love: ['adamant_ore', 'mythril_ore', 'diamond'], like: ['iron_ore', 'coal', 'gold_ore'], hate: ['tulip'],
    lines: [['Bring ore, I make bars. Bring bars, I make swords. Bring complaints, I make noise.', 'Mountain iron folds better. Ask anyone.'], ['My father forged a gate for Briarholt. An iron stag on every bar.'], ['That last blade I made you? Best work of my life. Don\'t tell anyone.']], gifts: [[3, 'iron_bar', 6], [6, 'gold_bar', 3], [9, 'ring_forge', 1]] },
  kessa: { town: 'greyhelm', n: 'Kessa', role: 'Supplier', shop: 'gh_supply', P: TP({ skin: '#f0d0b0', hair: '#2a2a2a', hs: 'short', shirt: '#7a6a3a', pants: '#3a2a22', hat: '#5a3a22' }), love: ['amethyst', 'garnet'], like: ['coal', 'leather', 'salt'], hate: ['slime_goo'],
    lines: [['Picks, lamps, rope. If it goes underground, I sell it.', 'Prices go up when the knights pass through. Supply and demand, love.'], ['Something moves in the deep shafts at night. The miners won\'t go below the third level.'], ['I set aside the best for you. Don\'t tell the miners.']], gifts: [[3, 'coal', 15], [6, 'amethyst', 2], [9, 'ring_amethyst', 1]] },
  halvard: { town: 'greyhelm', n: 'Chief Halvard', role: 'Town chief', shop: 'gh_hall', P: TP({ skin: '#e0b090', hair: '#d8d8d0', hs: 'long', shirt: '#4a6a8a', pants: '#3a3a40', cape: '#5a3a22', beard: '#d8d8d0' }), love: ['mammoth_tusk', 'giant_heart', 'highland_stew'], like: ['red_meat', 'leather'], hate: ['wine_strawberry'],
    lines: [['Greyhelm answers to no regent. We answer to the mountain.', 'Raiders took three wagons on the north road last week. The board has the bounty.'], ['When the king went hollow, we kept the roads open ourselves.'], ['Stand in the longhouse anytime. Your seat is by the fire.']], gifts: [[3, 'highland_stew', 3], [6, 'cobalt_bar', 3], [9, 'ring_tyrant', 1]] },
  rudd: { town: 'ashford', n: 'Rudd', role: 'Tavern keeper', shop: 'af_tavern', P: TP({ skin: '#e8b890', hair: '#8a5a2a', hs: 'short', shirt: '#4a6a3a', pants: '#4a3a2a', apron: '#d8c8a8', beard: '#8a5a2a' }), love: ['hunters_brew', 'chanterelle', 'truffle'], like: ['bread', 'hazelnut', 'blackberry'], hate: ['coal'],
    lines: [['Sit. Eat. Don\'t mind the sawdust, it gets in everything.', 'Hunters\' brew warms you to your toes. Tastes like toes, too.'], ['Wolves have been bold this year. Ashford\'s fences aren\'t what they were.'], ['A friend of Ashford drinks free on festival days.']], gifts: [[3, 'hunters_brew', 3], [6, 'truffle', 2], [9, 'ring_emerald', 1]] },
  elsie: { town: 'ashford', n: 'Elsie', role: 'Trader', shop: 'af_trader', P: TP({ skin: '#f0c8a0', hair: '#e8d070', hs: 'long', shirt: '#8a5a8a', pants: '#4a3a2a' }), love: ['morel', 'apple_sapling', 'honey'], like: ['wood', 'hardwood', 'mushroom_skewer'], hate: ['bat_wing'],
    lines: [['Timber, saplings, a bit of everything the forest gives.', 'I\'ll buy your mushrooms. All of them. Don\'t ask why.'], ['The old woman in the woods taught me which mushrooms kill you. Most of them, it turns out.'], ['You\'ve been good to Ashford. Here, the good saplings.']], gifts: [[3, 'apple_sapling', 2], [6, 'cherry_sapling', 2], [9, 'ring_aqua', 1]] },
  jorund: { town: 'ashford', n: 'Jorund', role: 'Sawyer', shop: 'af_saw', P: TP({ skin: '#c88a60', hair: '#3a2a22', hs: 'short', shirt: '#8a3a2a', pants: '#3a3a40', beard: '#3a2a22' }), love: ['hardwood', 'frostwood_log', 'stonepine_log'], like: ['wood', 'sap', 'iron_bar'], hate: ['tulip'],
    lines: [['Logs in, planks out. The mill wheel does most of the work.', 'Hardwood from the big trees. Bring me some and I\'ll pay fair.'], ['My father built half of Kingsbridge\'s roofs.'], ['Need beams for that castle of yours? I\'ll cut them myself.']], gifts: [[3, 'hardwood', 10], [6, 'stonepine_log', 8], [9, 'ring_topaz', 1]] },
  mags: { town: 'saltmere', n: 'Mags', role: 'Tavern keeper', shop: 'sm_tavern', P: TP({ skin: '#c8906a', hair: '#d8d8d0', hs: 'bun', shirt: '#2a5a8a', pants: '#e8e0d0', apron: '#8a6a4a' }), love: ['fish_stew', 'pearl_chowder'], like: ['sardine', 'clam', 'kelp'], hate: ['coal'],
    lines: [['Chowder\'s on. It\'s always on. That pot hasn\'t been empty in twenty years.', 'Sailors say the Drowned Captain\'s ship still sails on foggy nights.'], ['Corwin? Old goat. We were sweet on each other once. Don\'t tell him I said that.'], ['You\'ve a sailor\'s heart. I can always tell.']], gifts: [[3, 'fish_stew', 3], [6, 'pearl_chowder', 2], [9, 'ring_aqua', 1]] },
  finn: { town: 'saltmere', n: 'Finn', role: 'Fishmonger', shop: 'sm_fish', P: TP({ skin: '#e8c0a0', hair: '#e8d070', hs: 'spiky', shirt: '#4a8a9a', pants: '#3a3a40' }), love: ['tuna', 'swordfish', 'octopus'], like: ['sardine', 'anchovy', 'salmon'], hate: ['wool'],
    lines: [['Fresh this morning! Mostly this morning.', 'I pay extra for sea fish. The city folk can\'t get enough.'], ['There\'s a shark out past the reef. Ate my best net.'], ['You can fish better than my father. Don\'t tell him either.']], gifts: [[3, 'crab_trap', 1], [6, 'harpoon', 1], [9, 'ring_aqua', 1]] },
  perrin: { town: 'saltmere', n: 'Perrin', role: 'Chandler', shop: 'sm_chandler', P: TP({ skin: '#d8a070', hair: '#5a3a22', hs: 'short', shirt: '#e8e0d0', pants: '#2a4a6a', hat: '#2a4a6a' }), love: ['nautilus', 'coral', 'kraken_ink'], like: ['fiber', 'salt', 'kelp'], hate: ['fang'],
    lines: [['Rope, salt, lamp oil, tar. Everything a boat needs.', 'Salt from the pans out back. The best in four provinces.'], ['The smugglers used to buy from me. I didn\'t ask. Now I wish I had.'], ['Any friend of the sea is a friend of mine.']], gifts: [[3, 'salt', 10], [6, 'crab_trap', 2], [9, 'ring_aqua', 1]] },
};
for (const id in TOWN_NPCS) {
  const N = TOWN_NPCS[id], ok = k => !!IT[k];
  NPCS[id] = { n: N.n, role: N.role, shop: N.shop, P: N.P, love: N.love.filter(ok), like: N.like.filter(ok), hate: N.hate.filter(ok), lines: N.lines, gifts: N.gifts.filter(g => IT[g[1]]), town: N.town };
}
/* guards and knights: hidden from the Friends tab */
const ALLY_KINDS = {
  guard_kb: { n: 'City Guard', P: { skin: '#e0b48e', hair: '#3a2a1a', hs: 'short', shirt: '#6a3a9a', pants: '#2a2a32', helm: '#8a92a4', helmS: 'iron', armS: 'iron', armor: '#8a92a4', trim: '#6a3a9a', plume: '#e8b830', cape: '#4a2470' }, hp: 160, atk: 14 },
  guard_gh: { n: 'Greyhelm Warden', P: { skin: '#d8a070', hair: '#5a3a22', hs: 'short', shirt: '#5a6a4a', pants: '#3a3a40', helm: '#8a92a4', helmS: 'iron', armS: 'iron', armor: '#7a7a78', trim: '#8a6a3a', plume: '#c8a040', beard: '#5a3a22' }, hp: 160, atk: 14 },
  guard_v: { n: 'Village Watch', P: { skin: '#e8c0a0', hair: '#8a5a2a', hs: 'short', shirt: '#6a4a2a', pants: '#3a3a40', helm: '#8a5a3a', helmS: 'leather', armS: 'leather', armor: '#8a5a3a', trim: '#4a3020', plume: '#5a7a3a' }, hp: 110, atk: 10 },
  knight_a: { n: 'Knight of the Realm', P: { skin: '#e8c0a0', hair: '#5a3a22', hs: 'short', shirt: '#6a3a9a', pants: '#2a2a32', helm: '#a8b0c0', helmS: 'steel', armS: 'steel', armor: '#a8b0c0', trim: '#e8b830', plume: '#6a3a9a', cape: '#4a2470' }, hp: 220, atk: 20 },
  knight_b: { n: 'Knight of the Realm', P: { skin: '#c88a60', hair: '#1a1210', hs: 'short', shirt: '#6a3a9a', pants: '#2a2a32', helm: '#a8b0c0', helmS: 'steel', armS: 'steel', armor: '#a8b0c0', trim: '#e8b830', plume: '#e8e0d0', cape: '#4a2470' }, hp: 220, atk: 20 },
  knight_c: { n: 'Knight-Captain', P: { skin: '#f0d0b0', hair: '#e8d090', hs: 'long', shirt: '#6a3a9a', pants: '#2a2a32', helm: '#d8b860', helmS: 'gold', armS: 'steel', armor: '#c8ccd8', trim: '#e8b830', plume: '#d8342a', cape: '#6a1a2a' }, hp: 280, atk: 24 },
};
for (const id in ALLY_KINDS) Object.defineProperty(NPCS, id, { value: { n: ALLY_KINDS[id].n, role: 'Guard', shop: 'k_guard', P: ALLY_KINDS[id].P, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
const ALLY_LINES = {
  guard: ['Keep to the roads after dark. The Wilds bite.', 'Move along, citizen. Well, stay if you like, it\'s a free town.', 'Any trouble, shout. We\'ll come running. Well, walking briskly.', 'Captain Vey says we\'re to watch for strangers. You\'re not strange. Probably.'],
  knight: ['For the realm! ...Sorry. Habit.', 'We ride the royal road from Kingsbridge to Greyhelm and back. Wolves don\'t like us much.', 'Stay close if you\'re heading our way. Safer in numbers.', 'The council sends us farther out every month. Something is stirring.', 'You fight well, farmer. Have you thought about the oath?'],
};

/* ---- shops, rooms and hours ---- */
const TOWN_ACTS = {};
for (const id in TOWNS) for (const b of TOWNS[id].b) if (b[5] && b[5] !== 'k_house' && b[5] !== 'kb_stall') TOWN_ACTS[b[5]] = { town: id, kind: b[0], name: b[6] || b[0] };
const keeperOf = act => Object.keys(TOWN_NPCS).find(k => TOWN_NPCS[k].shop === act);
const actType = act => /inn|tavern/.test(act) ? 'inn' : /bank/.test(act) ? 'bank' : /temple/.test(act) ? 'temple' : /hall/.test(act) ? 'hall' : /barracks/.test(act) ? 'barracks' : /smith|forge/.test(act) ? 'smith' : act === 'sm_fish' ? 'fish' : 'shop';
const TOWN_HOURS = { inn: [0, 1440], shop: [540, 1080], smith: [540, 1080], fish: [480, 1080], bank: [540, 1020], temple: [360, 1320], hall: [480, 1260], barracks: [360, 1380] };
const CITY_WALL = { kingsbridge: 'plaster', greyhelm: 'stone', ashford: 'plank', saltmere: 'plank' };
function roomFor(act) {
  const T = TOWN_ACTS[act], ty = actType(act), k = keeperOf(act), wall = ty === 'temple' || ty === 'bank' || ty === 'barracks' ? 'stone' : CITY_WALL[T.town];
  const K = (x, y) => k ? [k, x, y] : null;
  const L = {
    inn: { w: 14, h: 10, floor: 'f', keeper: K(3, 4), f: [['shelf_tavern', 1, 3], ['shelf_tavern', 3, 3], ['kegs', 5, 3], ['bar', 2, 5, act, 'Order'], ['fireplace', 10, 3], ['table', 6, 7], ['stool', 5, 7], ['stool', 8, 7], ['table', 10, 7], ['stool', 9, 7], ['stool', 12, 7], ['bench', 1, 8], ['lamp', 8, 3], ['lamp', 12, 4], ['barrel', 12, 3]],
      d: [['dec_rug_red', 9, 6, 0, 8], ['dec_window', 12, 1, 0, 6], ['dec_painting', 9, 1, 16, 10], ['dec_banner_' + (T.town === 'kingsbridge' ? 'royal' : 'red'), 7, 1, 4, 2]] },
    shop: { w: 12, h: 9, floor: 'f', keeper: K(5, 4), f: [['shelf_store', 1, 3], ['plant', 3, 3], ['shelf_store', 7, 3], ['shelf_store', 9, 3], ['counter', 4, 5, act, 'Shop'], ['barrel', 1, 6], ['barrel', 1, 7], ['sack', 10, 6], ['sack', 10, 7], ['crate', 9, 7], ['lamp', 10, 5]],
      d: [['dec_rug_green', 4, 6, 0, 8], ['dec_window', 4, 1, 0, 6], ['dec_shelf', 5, 1, 0, 4]] },
    smith: { w: 12, h: 9, floor: 'fl', keeper: K(7, 5), f: [['coal', 3, 3], ['coal', 4, 3], ['forge', 5, 3, act, 'Forge'], ['weapons', 8, 3], ['lamp', 1, 3], ['anvil', 6, 5, act, 'Forge'], ['tub', 8, 6], ['barrel', 10, 6], ['crate', 10, 7], ['workbench', 1, 6], ['stool', 3, 6]],
      d: [['dec_banner_red', 2, 1, 4, 2], ['dec_banner_red', 10, 1, 4, 2]] },
    fish: { w: 10, h: 8, floor: 'f', keeper: K(5, 4), f: [['nets', 1, 3], ['counter', 4, 5, act, 'Fish'], ['barrel', 8, 3], ['tub', 8, 5], ['crate', 1, 6], ['lamp', 7, 3]], d: [['dec_window', 4, 1, 0, 6], ['dec_rug_small', 4, 6, 0, 8]] },
    bank: { w: 12, h: 9, floor: 'mb', keeper: K(5, 4), f: [['chest', 1, 3], ['chest', 9, 3], ['counter', 4, 5, act, 'Vault'], ['candles', 3, 3], ['candles', 8, 3], ['plant', 1, 7], ['plant', 10, 7], ['armour', 1, 5], ['armour', 10, 5]],
      d: [['dec_rug_blue', 4, 6, 0, 8], ['dec_banner_royal', 5, 1, 4, 4], ['dec_painting', 8, 1, 0, 10]] },
    temple: { w: 14, h: 11, floor: 'mb', keeper: K(7, 5), f: [['altar', 6, 4, act, 'Pray'], ['candles', 4, 3], ['candles', 9, 3], ['candles', 2, 6], ['candles', 11, 6], ['bench', 2, 8], ['bench', 5, 8], ['bench', 7, 8], ['bench', 10, 8], ['plant', 1, 3], ['plant', 12, 3]],
      d: [['dec_glass', 3, 1, 0, 2], ['dec_glass', 6, 1, 16, 2], ['dec_glass', 10, 1, 0, 2], ['dec_runner_s', 6, 5, 16, 0]] },
    hall: { w: 14, h: 10, floor: T.town === 'kingsbridge' ? 'mb' : 'f', keeper: K(7, 4), f: [['counter', 5, 5, act, 'Town board'], ['bookshelf', 1, 3], ['bookshelf', 11, 3], ['banquet', 4, 7], ['bench', 4, 8], ['bench', 6, 8], ['fireplace', 8, 3], ['candles', 3, 3], ['candles', 11, 6], ['plant', 1, 8], ['plant', 12, 8]],
      d: [['dec_tapestry', 5, 1, 0, 0], ['dec_banner_' + (T.town === 'kingsbridge' ? 'royal' : 'blue'), 3, 1, 4, 4], ['dec_rug_purple', 5, 6, 0, 0]] },
    barracks: { w: 14, h: 10, floor: 'fl', keeper: K(7, 4), f: [['counter', 5, 5, act, 'Captain'], ['weapons', 1, 3], ['weapons', 3, 3], ['armour', 9, 3], ['armour', 10, 3], ['armour', 11, 3], ['bed', 1, 8], ['bed', 11, 8], ['table', 6, 8], ['stool', 5, 8], ['stool', 8, 8], ['lamp', 12, 4]],
      d: [['dec_banner_royal', 6, 1, 4, 4], ['dec_banner_royal', 8, 1, 4, 4], ['dec_painting', 12, 1, 0, 10]] },
  }[ty];
  return Object.assign({ name: T.name, wall, dark: .3 }, L);
}
for (const act in TOWN_ACTS) {
  const k = keeperOf(act), ty = actType(act), H = TOWN_HOURS[ty];
  ROOMS[act] = roomFor(act);
  if (H[0] > 0 || H[1] < 1440) HOURS[act] = H;
  if (k) SCHED[k] = [[H[0], 'shop'], [H[1], 'home']];
  DOORL[act] = { inn: 'Enter', temple: 'Enter', hall: 'Enter', barracks: 'Enter', bank: 'Enter' }[ty] || 'Shop'; // the prompt adds the building's own name
  BLD_N[act] = TOWN_ACTS[act].name;
}
DOORL.k_house = 'Knock'; DOORL.kb_stall = 'Browse';
const mealsAt = { kingsbridge: ['roast_feast', 'knights_feast', 'cheese_toast', 'pancakes', 'bread', 'layer_cake'], greyhelm: ['miners_pie', 'highland_stew', 'veggie_stew', 'bread', 'hunters_brew'],
  ashford: ['hunters_brew', 'mushroom_skewer', 'berry_tart', 'bread', 'omelette'], saltmere: ['fish_stew', 'pearl_chowder', 'grilled_fish', 'sushi', 'corn_chowder'] };
const price = (id, k) => Math.max(5, Math.round((IT[id].p || 20) * k));
const listOf = ids => ids.filter(id => IT[id]);
const SHOP_STOCK = {
  kb_market: () => [...Object.keys(CROPS).filter(k => CROPS[k].s.includes(S.season) && !CROPS[k].secret && IT[k + '_seed']).map(k => k + '_seed'), ...listOf(['apple_sapling', 'cherry_sapling', 'peach_sapling', 'orange_sapling', 'compost', 'growth_tonic', 'rich_compost', 'flour', 'sugar', 'salt', 'butter', 'lantern'])],
  kb_stall: () => listOf(['apple', 'cherry', 'peach', 'orange', 'plum', 'honey', 'goat_cheese', 'jam_cherry', 'jam_plum', 'wine_grape', 'egg', 'milk']),
  kb_smith: () => listOf(['copper_bar', 'iron_bar', 'steel_bar', 'silver_bar', 'gold_bar', 'iron_sword', 'steel_sword', 'steel_spear', 'steel_bow', 'steel_shield', 'steel_helm', 'arrow']),
  af_trader: () => listOf(['wood', 'hardwood', 'sap', 'apple_sapling', 'cherry_sapling', 'plum_sapling', 'morel', 'chanterelle', 'hazelnut', 'blackberry', 'leather']),
  af_saw: () => listOf(['wood', 'hardwood', 'fence', 'workbench', 'stone_path', 'gravel_path']),
  sm_fish: () => listOf(['sardine', 'anchovy', 'tuna', 'clam', 'kelp', 'crab_trap', 'harpoon']),
  sm_chandler: () => listOf(['salt', 'fiber', 'lantern', 'canoe', 'crab_trap', 'kelp']),
  gh_supply: () => listOf(['coal', 'copper_ore', 'iron_ore', 'silver_ore', 'staircase', 'warp_totem', 'lantern', 'stone']),
  gh_forge: () => listOf(['iron_bar', 'steel_bar', 'cobalt_bar', 'iron_hammer', 'steel_hammer', 'steel_dagger', 'iron_body', 'steel_body']),
};
const SELL_TO = { kb_market: id => ['crop', 'fruit', 'artisan', 'animal', 'food'].includes(IT[id].t), kb_stall: id => ['fruit', 'artisan'].includes(IT[id].t), kb_smith: id => ['bar', 'ore', 'weapon', 'armor'].includes(IT[id].t),
  af_trader: id => ['forage', 'mat'].includes(IT[id].t), af_saw: id => /wood|log/.test(id), sm_fish: id => IT[id].t === 'fish', sm_chandler: id => ['loot', 'forage'].includes(IT[id].t),
  gh_supply: id => ['ore', 'gem', 'mat'].includes(IT[id].t), gh_forge: id => ['bar', 'ore', 'weapon', 'armor'].includes(IT[id].t) };
const BONUS = { sm_fish: 1.15, af_saw: 1.15, gh_supply: 1.1, kb_market: 1.05 };
function sellTab(act) {
  return { id: 'sell', label: 'Sell', render: b => {
    b.append(el('p', { class: 'note' }, BONUS[act] ? 'Pays ' + Math.round((BONUS[act] - 1) * 100) + '% over the usual price for what they deal in.' : 'Buys what it deals in.'));
    const ks = sortedInv().filter(k => valK(k) > 0 && SELL_TO[act](parseK(k)[0])), list = el('div', { class: 'list' });
    if (!ks.length) b.append(el('p', { class: 'note' }, 'Nothing to sell here.'));
    for (const k of ks) { const [id, q] = parseK(k), each = Math.round(valK(k) * (BONUS[act] || 1)), sell = n => { n = Math.min(n, S.inv[k] || 0); if (!n) return; takeK(k, n); S.gold += each * n; S.stats.shipped[id] = (S.stats.shipped[id] || 0) + n; SFX.coin(); refresh(); };
      list.append(el('div', { class: 'rrow' }, icon(id, 32, q), el('div', { class: 'rtxt' }, el('b', null, (q ? QNAME[q] + ' ' : '') + IT[id].n + ' ×' + S.inv[k]), el('small', null, each + 'g each')),
        el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => sell(1) }, 'Sell 1'), el('button', { class: 'btn', on: () => sell(S.inv[k]) }, 'All')))); }
    b.append(list);
  } };
}
function buyTab(act, note) {
  return { id: 'buy', label: 'Buy', render: b => { const k = keeperOf(act); if (k) greet(b, k); if (note) b.append(el('p', { class: 'note' }, note)); const L = el('div', { class: 'list' }); for (const id of SHOP_STOCK[act]()) L.append(buyRow(id, price(id, rep(TOWN_ACTS[act] ? TOWN_ACTS[act].town : 'kingsbridge') >= 50 ? 1.15 : 1.3))); b.append(L); } };
}
const rep = t => (S.realm && S.realm.rep[t]) || 0;
function addRep(t, n) { S.realm.rep[t] = Math.min(100, rep(t) + n); for (const id in TOWN_NPCS) if (TOWN_NPCS[id].town === t) addFriend(id, n * 2); }
const RUMORS_T = {
  kingsbridge: ['They say the regent hasn\'t slept in the palace since the king died.', 'A wagon of royal silver went missing on the Greyhelm road.', 'Duke Morcant is gathering riders in the north. Nobody knows why.'],
  greyhelm: ['The deep shafts hum at night. The old miners say it\'s the mountain breathing.', 'Raiders wear the Highmarch colours now. Bold.', 'A drake was seen over the peaks. Big one.'],
  ashford: ['Wolves took two sheep from the Hartley farm last night.', 'There\'s a lady living rough in the woods. Gives the trappers the shivers.', 'The old woodcutters\' shrine has gone dark.'],
  saltmere: ['Fog boats on the water again. Smugglers, or ghosts. Same thing, some nights.', 'Finn swears the shark has a scar shaped like a crown.', 'A ship from Kingsbridge came in with no cargo and a lot of soldiers.'],
};
function townMenu(act, who) {
  const T = TOWN_ACTS[act], ty = actType(act), k = who || keeperOf(act), town = T.town, title = T.name;
  const G = b => { if (k && NPCS[k]) greet(b, k); };
  if (ty === 'inn') return openModal(title, [{ id: 'eat', label: 'Meals', render: b => {
    G(b); b.append(el('p', { class: 'note' }, 'Rumour: ' + pickR(RUMORS_T[town])));
    // a hot meal at the table: eaten on the spot, health and energy back (playtest: meals only went into the bag, at 1.6x)
    const hot = 40 + 10 * TOWN_ORDER.indexOf(town);
    b.append(el('div', { class: 'acts' }, el('button', { class: 'btn', on: () => { if (S.gold < hot) { toast('A hot meal is ' + hot + 'g.'); return; } S.gold -= hot; S.p.hp = maxHP(); if (typeof maxST === 'function') S.p.st = maxST(); SFX.ok(); toast('A bowl of the house stew and fresh bread. Health and energy restored.'); refresh(); } }, 'Eat a hot meal here (' + hot + 'g)')));
    b.append(el('h3', null, 'To take away')); b.append(el('p', { class: 'note' }, 'Plain fare for the road. The feasts are only served at the table.'));
    const L = el('div', { class: 'list' }); listOf(mealsAt[town]).filter(id => IT[id].p <= 400).forEach(id => L.append(buyRow(id, price(id, 1.1)))); /* feasts at 1,000g+ read as a rip-off beside a 40g hot meal (playtest night #143) */ b.append(L);
    const free = k && hearts(k) >= 6, cost = free ? 0 : 120;
    const night = S.time >= 1080 || S.time < 300;
    b.append(el('div', { class: 'acts' }, night
      // after six in the evening: a bed for the night, and you wake here (playtest: resting at 1 am still meant collapsing at 2)
      ? el('button', { class: 'btn', on: () => { if (S.gold < cost) { toast('A room is ' + cost + 'g.'); return; } S.gold -= cost; S.flags = S.flags || {}; S.flags.innWake = act; closeModal(); endDay(false); } }, free ? 'Sleep here until morning (free for a friend)' : 'Sleep here until morning (' + cost + 'g)')
      : el('button', { class: 'btn', on: () => { if (S.gold < cost) { toast('A room is ' + cost + 'g.'); return; } S.gold -= cost; S.p.hp = maxHP(); if (typeof maxST === 'function') S.p.st = maxST(); if (typeof S.lives === 'number') S.lives = 3; S.time = Math.min(S.time + 120, 1500); closeModal(); SFX.ok(); toast('You sleep a couple of hours in a warm bed upstairs. Health, energy and lives restored.', 'lvl'); } }, free ? 'Rest two hours (free for a friend)' : 'Rest two hours (' + cost + 'g)')));
  } }]);
  if (ty === 'bank') return openBank();
  if (ty === 'smith') return openModal(title, [buyTab(act, 'Bars and arms, forged here.'), sellTab(act), { id: 'forge', label: 'Forge', render: b => { if (!MODAL.opts.st || MODAL.opts.st === 'forge') MODAL.opts.st = 'furnace'; MODAL.opts.station = 'forge'; renderCraft(b); } }]);
  if (ty === 'temple') return openModal(title, [{ id: 't', label: 'Temple', render: b => {
    G(b); b.append(el('p', { class: 'note' }, 'Candles burn in rows before the ember altar. The air smells of resin and warm stone.'));
    b.append(el('div', { class: 'acts wrap' },
      el('button', { class: 'btn', on: () => { if (S.realm.pray === dayIndex()) { toast('You\'ve already been blessed today.'); return; } S.realm.pray = dayIndex(); S.p.hp = maxHP(); if (typeof S.lives === 'number') S.lives = 3; SFX.lvl(); toast('The ember flares. You feel restored.', 'lvl'); refresh(); } }, 'Ask for a blessing'),
      el('button', { class: 'btn ghost' + (S.gold < 100 ? ' off' : ''), on: () => { if (S.gold < 100) return; S.gold -= 100; addRep(town, 1); SFX.coin(); toast('The town remembers your gift.'); refresh(); } }, 'Give 100g to the poor')));
  } }]);
  if (ty === 'hall') return openModal(title, [{ id: 'board', label: 'Town board', render: b => { G(b); renderJobs(b, town); } }]);
  if (ty === 'barracks') return openModal(title, [{ id: 'cap', label: 'Captain', render: b => { G(b); b.append(el('p', { class: 'note' }, 'The watch keeps the gates and rides the roads in patrols of two to four. If you see them in a fight, help, and they\'ll help you.')); renderJobs(b, town, true); } }]);
  if (ty === 'fish') return openModal(title, [sellTab(act), buyTab(act)]);
  return openModal(title, [buyTab(act), sellTab(act)]);
}

/* ---- town jobs: the board in each hall (kill monsters around the town, or bring goods) ---- */
const TOWN_JOBS = [
  { id: 'kb_wolves', town: 'kingsbridge', n: 'Wolves on the royal road', t: 'kill', bio: 'meadow', need: 10, gold: 700, rep: 10, d: 'Clear 10 monsters from the meadows around Kingsbridge.' },
  { id: 'kb_grain', town: 'kingsbridge', n: 'Bread for the garrison', t: 'bring', items: { wheat: 20 }, gold: 600, rep: 8, d: 'The barracks bakery needs 20 wheat.' },
  { id: 'kb_iron', town: 'kingsbridge', n: 'Mail for the knights', t: 'bring', items: { iron_bar: 10 }, gold: 1100, rep: 10, d: 'Garrick needs 10 iron bars to mend the patrols\' mail.' },
  { id: 'kb_patrol', town: 'kingsbridge', n: 'Ride with a patrol', t: 'assist', need: 5, gold: 900, rep: 12, d: 'Fight beside a knight patrol until they\'ve felled 5 monsters with your help.', barracks: 1 },
  { id: 'gh_raiders', town: 'greyhelm', n: 'Raiders on the north road', t: 'kill', bio: 'highlands', need: 12, gold: 1000, rep: 10, d: 'Clear 12 monsters from the highlands around Greyhelm.' },
  { id: 'gh_coal', town: 'greyhelm', n: 'Coal for the forges', t: 'bring', items: { coal: 30 }, gold: 500, rep: 8, d: 'Bring 30 coal for Borek\'s forge.' },
  { id: 'gh_pie', town: 'greyhelm', n: 'A miner\'s lunch', t: 'bring', items: { miners_pie: 3 }, gold: 650, rep: 8, d: 'The deep crew want 3 miner\'s pies.' },
  { id: 'af_wolves', town: 'ashford', n: 'Wolves at the fences', t: 'kill', bio: 'forest', need: 8, gold: 550, rep: 10, d: 'Clear 8 monsters from the woods around Ashford.' },
  { id: 'af_hard', town: 'ashford', n: 'Hardwood for the mill', t: 'bring', items: { hardwood: 15 }, gold: 650, rep: 8, d: 'Jorund needs 15 hardwood.' },
  { id: 'sm_crabs', town: 'saltmere', n: 'Trouble on the shore', t: 'kill', bio: 'coast', need: 8, gold: 550, rep: 10, d: 'Clear 8 monsters from the coast around Saltmere.' },
  { id: 'sm_salt', town: 'saltmere', n: 'Kelp for the salt pans', t: 'bring', items: { kelp: 10 }, gold: 350, rep: 6, d: 'Perrin uses kelp ash in the pans. Bring 10 kelp.' },
].filter(j => !j.items || Object.keys(j.items).every(k => IT[k]));
const jobState = id => S.realm.q[id] || (S.realm.q[id] = { n: 0 });
function renderJobs(b, town, barracks) {
  b.append(el('h3', null, (barracks ? 'Watch' : 'Town') + ' jobs · standing ' + rep(town) + '/100'));
  if (!barracks) b.append(el('p', { class: 'note' }, 'At 50 standing the shops here sell to you at a friend\'s price.'));
  const L = el('div', { class: 'list' });
  for (const j of TOWN_JOBS.filter(j => j.town === town && !!j.barracks === !!barracks)) {
    const s = jobState(j.id), prog = j.t === 'bring' ? Object.entries(j.items).map(([k, n]) => cnt(k) + '/' + n + ' ' + IT[k].n).join(', ') : s.n + '/' + j.need;
    const ready = s.on && (j.t === 'bring' ? Object.entries(j.items).every(([k, n]) => cnt(k) >= n) : s.n >= j.need);
    const btn = s.done ? el('span', { class: 'note' }, 'Done') : !s.on ? el('button', { class: 'btn', on: () => { s.on = 1; s.n = 0; toast('Job taken: ' + j.n); refresh(); } }, 'Take') :
      el('button', { class: 'btn' + (ready ? '' : ' off'), on: () => { if (!ready) return; if (j.t === 'bring') for (const k in j.items) take(k, j.items[k]); s.done = 1; s.on = 0; S.gold += j.gold; addRep(town, j.rep); SFX.lvl(); toast(j.n + ' done! +' + j.gold + 'g', 'lvl'); refresh(); } }, 'Hand in');
    L.append(el('div', { class: 'rrow' + (s.done ? ' done' : '') }, el('div', { class: 'qck' }, s.done ? '✓' : '!'), el('div', { class: 'rtxt' }, el('b', null, j.n + ' (' + j.gold + 'g)'), el('small', null, j.d + (s.on ? ' Progress: ' + prog + '.' : ''))), btn));
  }
  b.append(L);
}
killEnemy = (f => function (m, e) {
  const was = e.dead; f(m, e);
  if (was || !e.dead || !S || !S.realm || !m || m.id !== 'wilds' || !m.bio) return;
  const b = BIOMES[m.bio[Math.floor(e.y / 16) * m.w + Math.floor(e.x / 16)]];
  for (const j of TOWN_JOBS) {
    const s = S.realm.q[j.id]; if (!s || !s.on || s.done) continue; const T = (m.towns || []).find(t => t.id === j.town);
    const near = T && dist(e.x / 16, e.y / 16, T.cx, T.cy) < 60; // the land round a town is mixed: a kill near it counts too (playtest)
    if ((j.t === 'kill' && (j.bio === b || near)) || (j.t === 'assist' && ((e.allyHit && gameT - e.allyHit < 10) || ALLIES.some(al => !al.down && !al.gone && dist(al.x, al.y, e.x, e.y) < 120)))) {
      s.n++; const need = j.need; toast(j.n + ': ' + Math.min(s.n, need) + '/' + need + (s.n >= need ? '. Done: hand it in at ' + (TOWNS[j.town] ? TOWNS[j.town].n : 'town') + '.' : ''), s.n >= need ? 'lvl' : undefined);
    }
  }
})(killEnemy);

/* ---- placing the towns, their roads and signposts ---- */
/* the royal roads: long straight runs that only turn on dry land, so bridges cross water in a straight
   line (playtest: diagonal roads made staircase-shaped plank bridges), and no tree canopy hangs over them */
function realmRoad(m, a, b) {
  let [x, y] = a.map(Math.round); const [tx, ty] = b.map(Math.round); let n = 0, horiz = Math.abs(tx - x) >= Math.abs(ty - y), run = 0;
  const wet = (X, Y) => inb(m, X, Y) && (TER[getT(m, X, Y)].water || getT(m, X, Y) === 'b');
  const KEEP = ['shrine', 'cave', 'chest', 'page', 'shard', 'sign', 'tent', 'wreck', 'statue', 'campfire', 'waystone'];
  const RT = m.roadT || (m.roadT = new Set());
  const lay = (x, y) => {
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const X = x + i, Y = y + j; if (!inb(m, X, Y) || m.solidB[Y * m.w + X]) continue; const t = getT(m, X, Y); RT.add(Y * m.w + X);
      if (t === 'w' || t === 'l') setT(m, X, Y, 'b'); else if (t !== 'i' && t !== 'b' && t !== 's' && t !== 'p') setT(m, X, Y, 'd');
      const o = getO(m, X, Y); if (o && !KEEP.includes(mainOf(m, X, Y)[2].k)) delObj(m, X, Y);
    }
    for (let j = 2; j <= 4; j++) for (let i = -1; i <= 2; i++) { const X = x + i, Y = y + j, o = inb(m, X, Y) && getO(m, X, Y); if (o && (o.k === 'tree' || o.k === 'ancient')) delObj(m, X, Y); } // canopies overhanging from the south
  };
  lay(x, y);
  while ((x !== tx || y !== ty) && n++ < 4000) {
    if (run <= 0 && !wet(x, y) && !wet(x + 1, y + 1)) { horiz = x === tx ? false : y === ty ? true : !horiz; run = 6 + Math.floor(R() * 14); }
    if (horiz && x !== tx) x += Math.sign(tx - x); else if (!horiz && y !== ty) y += Math.sign(ty - y); else { horiz = !horiz; run = 0; continue; }
    run--; lay(x, y);
  }
}
function townSpot(m, T, avoid, near) {
  const W = m.w, want = BIOMES.indexOf(T.bio); let best = null, bs = -1e9;
  for (let k = 0; k < 9000; k++) {
    if (k === 6000 && best) return best; // no ideal spot (some worlds): the best one seen still gets the town
    const x = 8 + Math.floor(R() * (W - T.w - 16)), y = 10 + Math.floor(R() * (m.h - T.h - 40));
    if (near && k < 4000 && (Math.hypot(x + T.w / 2 - near[0], y + T.h / 2 - near[1]) > near[2] || Math.hypot(x + T.w / 2 - near[0], y + T.h / 2 - near[1]) < near[3])) continue;
    if (avoid.some(a => x < a[0] + a[2] + 14 && x + T.w + 14 > a[0] && y < a[1] + a[3] + 14 && y + T.h + 14 > a[1])) continue;
    if (m.poi.some(p => p.x > x - 8 && p.x < x + T.w + 8 && p.y > y - 8 && p.y < y + T.h + 8)) continue;
    if (m.arenas.some(a => a.x > x - 12 && a.x < x + T.w + 12 && a.y > y - 12 && a.y < y + T.h + 12)) continue;
    let ok = 0, bad = 0, n = 0;
    for (let j = 0; j < T.h; j += 2) for (let i = 0; i < (T.sea ? T.w - 8 : T.w); i += 2) { n++; const X = x + i, Y = y + j, t = getT(m, X, Y); if (m.bio[Y * W + X] === want) ok++; if (TER[t].water || TER[t].lava) bad++; }
    const seaOk = !T.sea || (TER[getT(m, x + T.w + 2, y + (T.h >> 1))].water && TER[getT(m, x + T.w - 4, y + (T.h >> 1))].water);
    if (seaOk && bad / n <= (T.sea ? .3 : .12)) { const sc = ok / n - bad / n * 3; if (sc > bs) { bs = sc; best = [x, y]; } }
    if (ok / n < .85 || bad / n > (T.sea ? .2 : .06)) continue;
    if (!seaOk) continue;
    return [x, y];
  }
  return best;
}
function stampTown(m, id, T, ox, oy) {
  const W = m.w, G = (x, y) => [ox + x, oy + y];
  for (let y = oy - 1; y <= oy + T.h; y++) for (let x = ox - 1; x <= ox + T.w; x++) { if (!inb(m, x, y)) continue; if (getO(m, x, y)) delObj(m, x, y); if (m.solidB[y * W + x]) continue; setT(m, x, y, T.ground); }
  for (const [x, y, w, h, t] of T.st || []) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setT(m, ox + x + i, oy + y + j, t);
  for (const [x, y, w, h] of T.water || []) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setT(m, ox + x + i, oy + y + j, 'w');
  for (const [x, y, w, h] of T.bridge || []) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setT(m, ox + x + i, oy + y + j, 'b');
  // the wall: stone pieces with towers and gate arches, or a split-rail fence with gaps
  const gate = (x, y) => Object.values(T.gates || {}).some(([gx, gy]) => (gy === 0 || gy === T.h - 1) ? (y === gy && (x === gx || x === gx + 1)) : (x === gx && (y === gy || y === gy + 1)));
  const ring = new Set(), key = (x, y) => y * T.w + x;
  if (T.walls) for (let y = 0; y < T.h; y++) for (let x = 0; x < T.w; x++) if ((x === 0 || y === 0 || x === T.w - 1 || y === T.h - 1) && !gate(x, y)) ring.add(key(x, y));
  for (const [tx, ty] of T.towers || []) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) ring.delete(key(tx + i, ty - j));
  for (const k of ring) {
    const x = k % T.w, y = (k / T.w) | 0, [X, Y] = G(x, y);
    if (T.walls === 'stone') { const fm = (ring.has(key(x, y - 1)) ? 1 : 0) | (ring.has(key(x + 1, y)) ? 2 : 0) | (ring.has(key(x, y + 1)) ? 4 : 0) | (ring.has(key(x - 1, y)) ? 8 : 0); setO(m, X, Y, { k: 'cwall', fm, fixed: 1 }); }
    else setO(m, X, Y, { k: 'fence', fixed: 1 });
  }
  for (const [tx, ty] of T.towers || []) putObj(m, ox + tx, oy + ty, { k: 'ctower', fixed: 1 });
  if (T.walls === 'stone') for (const [gx, gy] of Object.values(T.gates)) if (gy === 0 || gy === T.h - 1) { putObj(m, ox + gx, oy + gy, { k: 'cgate', fixed: 1 }); setO(m, ox + gx + 1, oy + gy, { k: 'gpart' }); }
  for (const [kind, x, y, w, h, act] of T.b) addB(m, ox + x, oy + y, w, h, kind, act);
  for (const [k, x, y] of T.props) {
    const [X, Y] = G(x, y); if (getO(m, X, Y) || m.solidB[Y * W + X]) continue;
    if (k === 'tree') setO(m, X, Y, { k: 'tree', kind: TREEK[T.bio] || 'oak', fixed: 1, town: 1 });
    else if (k === 'flower') setO(m, X, Y, { k: 'flower', v: (x + y) % 5 });
    else if (k === 'fountain') { for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { setT(m, X + i, Y - j, 'p'); m.solidB[(Y - j) * W + X + i] = 1; } setO(m, X, Y, { k: 'fountain', fixed: 1 }); } // like the village's: paved and solid under the basin, no loose water
    else putObj(m, X, Y, { k, fixed: 1 });
  }
  // the gateways are paved through to the road outside (the stamp above grassed over the road's last tiles)
  for (const [s, [x, y]] of Object.entries(T.gates || {})) for (let k = -1; k <= 6; k++) for (let w = 0; w < 2; w++) {
    const X = s === 'N' || s === 'S' ? ox + x + w : s === 'W' ? ox + x - k : ox + x + k, Y = s === 'N' ? oy + y - k : s === 'S' ? oy + y + k : oy + y + w;
    if (!inb(m, X, Y) || m.solidB[Y * W + X]) continue; const t = getT(m, X, Y); if (TER[t].water) setT(m, X, Y, 'b'); else setT(m, X, Y, 'p'); // through cliffs too: a gate never opens into rock (round 5)
    const o = getO(m, X, Y); if (o && !['cgate', 'gpart', 'ctower', 'cwall', 'fence'].includes(o.k)) delObj(m, X, Y);
  }
  const gx = Object.fromEntries(Object.entries(T.gates || {}).map(([s, [x, y]]) => [s, s === 'N' ? [ox + x, oy - 2] : s === 'S' ? [ox + x, oy + T.h + 1] : s === 'W' ? [ox - 2, oy + y] : [ox + T.w + 1, oy + y]]));
  return { id, n: T.n, kind: T.kind, x: ox, y: oy, w: T.w, h: T.h, cx: ox + (T.w >> 1), cy: oy + (T.h >> 1), exits: gx };
}
const ARROWS = ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'];
const arrowTo = (dx, dy) => ARROWS[Math.round(((Math.atan2(-dy, dx) * 180 / Math.PI + 360) % 360) / 45) % 8];
function signNear(m, x, y, text, side) {
  // beside a gate's road, never in the gateway: across the road for N/S gates, above or below it for W/E
  const offs = side === 'W' || side === 'E' ? r => [[0, -r], [0, r], [-1, -r], [-1, r], [1, -r], [1, r]] : side ? r => [[r, 0], [-r, 0], [r, side === 'N' ? -1 : 1], [-r, side === 'N' ? -1 : 1]] : r => [[r, 0], [-r, 0], [r, -1], [-r, -1], [r, 1], [-r, 1]];
  for (let r = side ? 2 : 1; r < 6; r++) for (const [dx, dy] of offs(r)) { const X = x + dx, Y = y + dy; if (inb(m, X, Y) && !getO(m, X, Y) && !m.solidB[Y * m.w + X] && !TER[getT(m, X, Y)].solid && !TER[getT(m, X, Y)].water && getT(m, X, Y) !== 'p' && getT(m, X, Y) !== 'd') { setO(m, X, Y, { k: 'sign', fixed: 1, text, guide: 1 }); return; } }
}
genWilds = (f => function () {
  const m = f(), R0 = R; R = rng((S.seed || 1) * 91 + 7);
  const cross = m.poi.find(p => p.type === 'cross'), spots = {}, avoid = [];
  for (const id of TOWN_ORDER) {
    const T = TOWNS[id], near = id === 'kingsbridge' && cross ? [cross.x, cross.y - 40, 75, 25] : null;
    const s = townSpot(m, T, avoid, near); if (!s) continue;
    spots[id] = s; avoid.push([s[0], s[1], T.w, T.h]);
  }
  m.towns = []; m.roads = [];
  const exitOf = (id, side) => { const T = TOWNS[id], [x, y] = spots[id], g = T.gates[side]; if (!g) return null; return side === 'N' ? [x + g[0], y - 2] : side === 'S' ? [x + g[0], y + T.h + 1] : side === 'W' ? [x - 2, y + g[1]] : [x + T.w + 1, y + g[1]]; };
  const road = (a, b) => { if (!a || !b) return; realmRoad(m, a, b); m.roads.push([a, b]); };
  const near = (id, pt) => { const T = TOWNS[id]; return Object.keys(T.gates).map(s => exitOf(id, s)).sort((p, q) => Math.hypot(p[0] - pt[0], p[1] - pt[1]) - Math.hypot(q[0] - pt[0], q[1] - pt[1]))[0]; };
  if (spots.kingsbridge && cross) road([cross.x, cross.y], near('kingsbridge', [cross.x, cross.y]));
  const mine = m.mineDoor ? [m.mineDoor.x, m.mineDoor.y + 1] : null;
  const pairs = [['kingsbridge', 'greyhelm'], ['kingsbridge', 'ashford'], ['kingsbridge', 'saltmere'], ['ashford', 'greyhelm']];
  // the towns join the network like branches of a tree: each road runs from the town's gate nearest Kingsbridge
  // to the closest road already laid (art round: parallel roads braided across the map)
  const kbC = spots.kingsbridge ? [spots.kingsbridge[0] + TOWNS.kingsbridge.w / 2, spots.kingsbridge[1] + TOWNS.kingsbridge.h / 2] : null;
  const order = ['greyhelm', 'ashford', 'saltmere'].filter(id => spots[id]).sort((p, q) => kbC ? Math.hypot(spots[p][0] - kbC[0], spots[p][1] - kbC[1]) - Math.hypot(spots[q][0] - kbC[0], spots[q][1] - kbC[1]) : 0);
  for (const id of order) {
    if (!kbC) { for (const [a, b] of pairs) if (spots[a] && spots[b] && b === id) road(near(a, spots[b]), near(b, spots[a])); continue; }
    const g = near(id, kbC); let to = near('kingsbridge', g), bd = Math.hypot(to[0] - g[0], to[1] - g[1]);
    for (const i of m.roadT || []) { const x = i % m.w, y = (i / m.w) | 0; if (x > spots.kingsbridge[0] - 3 && x < spots.kingsbridge[0] + TOWNS.kingsbridge.w + 3 && y > spots.kingsbridge[1] - 3 && y < spots.kingsbridge[1] + TOWNS.kingsbridge.h + 3) continue; const d = Math.hypot(x - g[0], y - g[1]); if (d < bd - 4) { bd = d; to = [x, y]; } }
    road(g, to);
  }
  if (spots.greyhelm && mine) road(near('greyhelm', mine), mine);
  const hut = m.poi.find(p => p.type === 'hut'); if (spots.saltmere && hut) road(near('saltmere', [hut.x, hut.y]), [hut.x, hut.y + 2]);
  if (spots.ashford) { const sh = m.poi.find(p => p.type === 'shrine' && p.bio === 'forest'); if (sh) road(near('ashford', [sh.x, sh.y]), [sh.x, sh.y + 2]); }
  for (const id of TOWN_ORDER) if (spots[id]) m.towns.push(stampTown(m, id, TOWNS[id], spots[id][0], spots[id][1]));
  // signposts outside every way out, and at the crossroads
  const home = [WIN_F, m.h - 4];
  for (const T of m.towns) for (const s in T.exits) {
    const [x, y] = T.exits[s], parts = m.towns.filter(o => o !== T).map(o => o.n + ' ' + arrowTo(o.cx - x, o.cy - y));
    parts.push('Emberhollow ' + arrowTo(home[0] - x, home[1] - y)); signNear(m, x, y, parts.join(' · '), s);
  }
  if (cross) signNear(m, cross.x + 2, cross.y + 3, m.towns.map(o => o.n + ' ' + arrowTo(o.cx - cross.x, o.cy - cross.y)).concat(['Emberhollow ' + arrowTo(home[0] - cross.x, home[1] - cross.y)]).join(' · '));
  R = R0;
  return m;
})(genWilds);
const townAt = (m, tx, ty, pad = 0) => (m && m.towns || []).find(T => tx >= T.x - pad && tx < T.x + T.w + pad && ty >= T.y - pad && ty < T.y + T.h + pad);
/* no monsters spawn in or next to a town */
spawnEnemy = (f => function (m, k, x, y, lvl) {
  if (m && m.id === 'wilds' && m.towns && EN[k] && !EN[k].boss && townAt(m, x / 16, y / 16, 10)) return { type: 'enemy', k, x, y, dead: true, hp: 0, mhp: 1, st: {}, ai: { cd: {} } };
  return f(m, k, x, y, lvl);
})(spawnEnemy);
/* town trees are part of the town */
useTool = (f => function () { const [tx, ty] = typeof faceTile === 'function' ? faceTile() : [0, 0], o = cur && getO(cur, tx, ty); if (o && o.town && o.k === 'tree') { toast('That tree belongs to the town.'); return; } return f.apply(this, arguments); })(useTool);
wayName = (f => function (id) { if (id && id.startsWith('wilds_') && TOWNS[id.slice(6)]) return TOWNS[id.slice(6)].n; return f(id); })(wayName);

/* ---- doors ---- */
const TOWNS_AT_ME = () => { const T = cur && cur.towns && townAt(cur, S.p.x / 16, S.p.y / 16, 4); return T ? T.n : cur && cur.wild ? 'On the road' : ''; }; // the dialog's title line: where, not the name again
const KNOCK = {
  kingsbridge: ['A maid opens the door a crack. "The master is out. The master is always out."', 'Laughter and the clink of cups inside. Nobody hears you.', 'A sign on the door: "No hawkers, no knights, no geese."'],
  greyhelm: ['A gruff voice: "If you\'re selling, we\'re not buying. If you\'re buying, we\'re not selling."', 'The smell of stew. Someone calls "Shift\'s not over!" through the door.'],
  ashford: ['An old woodcutter waves through the window and goes back to whittling.', 'A dog barks. A child shushes it. Nobody comes.'],
  saltmere: ['Nets hang from the door. "Out fishing," says a chalked slate.', 'A woman shouts "Tide\'s in, come back later!" through the shutters.'],
};
doorAction = (f => function (act, who) {
  if (act === 'k_house') { const T = townAt(cur, S.p.x / 16, S.p.y / 16, 2); toast(pickR(KNOCK[T ? T.id : 'kingsbridge'])); return; }
  if (act === 'kb_stall') return openModal('Market stall', [buyTab('kb_stall', 'Fresh from the farms around Kingsbridge.'), sellTab('kb_stall')]);
  if (act === 'k_guard') { const kind = (ALLY_KINDS[who] || {}).n || 'Guard'; storyDialog([[who, pickR(/knight/.test(who) ? ALLY_LINES.knight : ALLY_LINES.guard)]], { title: (TOWNS_AT_ME() || kind) }); return; }
  if (act === 'k_talk' && storyTalk(who)) return;
  if (act === 'k_talk') return openModal(NPCS[who] ? NPCS[who].n : 'Talk', [{ id: 't', label: 'Talk', render: b => greet(b, who) }]);
  if (TOWN_ACTS[act] && (who || (cur && cur.id === 'in_' + act))) {
    if (storyTalk(who || keeperOf(act))) return; // a story waiting on this keeper speaks first
    const H = HOURS[act]; if (!who && H && (S.time < H[0] || S.time >= H[1])) { toast('Closed. Open ' + fmtHM(H[0]) + ' to ' + fmtHM(H[1]) + '.'); return; }
    return townMenu(act, who);
  }
  return f(act, who);
})(doorAction);
/* the rooms' way out leads back to the town door */
findBuilding = (f => function (act) { const r = f(act); if (r[0] || !TOWN_ACTS[act]) return r; const m = MAPS.wilds, b = m && m.bld.find(b => b.act === act); return b ? ['wilds', b] : r; })(findBuilding);

/* ---- townsfolk on the streets: keepers between closing time and nightfall, everyone else by day ---- */
function townLife(snap) {
  const m = MAPS.wilds; if (!m || !m.towns) return;
  const want = [];
  for (const id in TOWN_NPCS) {
    const N = TOWN_NPCS[id], T = m.towns.find(t => t.id === N.town); if (!T) continue;
    const H = HOURS[N.shop], inShop = H && S.time >= H[0] && S.time < H[1], night = S.time >= 1260 || S.time < 420;
    if (inShop || night || (festToday && festToday())) continue;
    const sp = TOWNS[N.town].spots, s = sp[Math.abs(strSeed(id)) % sp.length];
    want.push({ id, x: T.x + s[0], y: T.y + s[1] });
  }
  m.npcs = (m.npcs || []).filter(n => !n.tn || want.some(w => w.id === n.id));
  for (const w of want) {
    let n = m.npcs.find(n => n.id === w.id), gx = (w.x + .5) * 16, gy = (w.y + .8) * 16;
    if (!n) { const b = m.bld.find(b => b.act === TOWN_NPCS[w.id].shop), sx = b ? (b.door.x + .5) * 16 : gx, sy = b ? (b.door.y + 1.8) * 16 : gy; n = { id: w.id, tn: 1, x: snap ? gx : sx, y: snap ? gy : sy, hx: snap ? gx : sx, hy: snap ? gy : sy }; m.npcs.push(n); }
    if (dist(n.x, n.y, gx, gy) < 20) { n.path = null; continue; }
    if (!n.path && cur === m && dist(S.p.x, S.p.y, n.x, n.y) < 500) { const p = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), w.x, w.y, 3000); if (p) { n.path = p; n.pi = 1; } else { n.x = n.hx = gx; n.y = n.hy = gy; } }
    else if (!n.path) { n.x = n.hx = gx; n.y = n.hy = gy; }
  }
}
function townWalk(dt) {
  const m = MAPS.wilds; if (!m || cur !== m) return;
  for (const n of m.npcs) {
    if (!n.tn || !n.path) continue; const node = n.path[n.pi]; if (!node) { n.path = null; n.walk = false; continue; }
    const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
    if (d < 2) { n.pi++; continue; }
    const sp = 24 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.walk = true; n.t = 3; n.vx = 0;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); n.hx = n.x; n.hy = n.y;
  }
}
EVT.on('tick', n => { if (n % 5 === 0 && S && !TITLE) townLife(false); });
EVT.on('map', id => { if (id === 'wilds') townLife(true); });

/* ---- allies: town guards at their posts and knight patrols on the roads ---- */
const ALLIES = [];   // runtime only: { id, x, y, hp, mhp, atk, post, patrol, cd, tgt, down }
let PATROLS = [], PATROL_T = 0;
function spawnGuards(m) {
  ALLIES.length = 0; PATROLS = [];
  for (const T of m.towns || []) {
    const kind = T.id === 'kingsbridge' ? 'guard_kb' : T.id === 'greyhelm' ? 'guard_gh' : 'guard_v';
    for (const [x, y] of TOWNS[T.id].guards) { const A = ALLY_KINDS[kind], px = (T.x + x + .5) * 16, py = (T.y + y + .8) * 16; ALLIES.push({ id: kind, x: px, y: py, hp: A.hp, mhp: A.hp, atk: A.atk, post: [px, py], cd: 0, dir: 0 }); }
  }
}
function spawnEscort(m) {
  const t = typeof openTileNear === 'function' && openTileNear(m, Math.floor(S.p.x / 16) + 6, Math.floor(S.p.y / 16) + 3); if (!t) return;
  const P = { path: [t], pi: 0, members: [], escort: true };
  ['knight_c', 'knight_a', 'knight_b'].forEach((kind, i) => { const A = ALLY_KINDS[kind], al = { id: kind, x: (t[0] + .5) * 16 + i * 10, y: (t[1] + .8) * 16, hp: A.hp, mhp: A.hp, atk: A.atk, patrol: P, slot: i, cd: 0, dir: 1 }; P.members.push(al); ALLIES.push(al); });
  PATROLS.push(P); toast('Three knights ride up: "Captain Vey sent us. Lead on, we will keep at your side."', 'lvl');
}
function spawnPatrol(m) {
  if (!m.roads || !m.roads.length) return;
  // a road whose one end is out of sight but not too far (25-90 tiles): the patrol rides in from there, past you (playtest: none were ever seen)
  const px = S.p.x / 16, py = S.p.y / 16, cand = [];
  for (const r of m.roads) for (const k of [0, 1]) { const d = dist(px, py, r[k][0], r[k][1]), d2 = dist(px, py, r[1 - k][0], r[1 - k][1]); if (d > 25 && d < 90 && d2 < d + 40) cand.push([r[k], r[1 - k], d]); }
  const far = m.roads.map(r => [r, Math.min(dist(px, py, r[0][0], r[0][1]), dist(px, py, r[1][0], r[1][1]))]).filter(([, d]) => d > 30);
  let a, b;
  if (cand.length) [a, b] = cand[Math.floor(Math.random() * cand.length)];
  else { if (!far.length) return; const [rd] = far[Math.floor(Math.random() * far.length)], rev = Math.random() < .5; a = rev ? rd[1] : rd[0]; b = rev ? rd[0] : rd[1]; }
  const path = findPath(m, Math.round(a[0]), Math.round(a[1]), Math.round(b[0]), Math.round(b[1]), 60000); if (!path) return;
  { // start about 24 tiles before the point of the road nearest you, so they come by within a minute (off screen)
    let j = 0, bd = 1e9; path.forEach((p, i) => { const d = dist(px, py, p[0], p[1]); if (d < bd) { bd = d; j = i; } });
    if (bd < 45) { let i = j; while (i > 0 && dist(px, py, path[i][0], path[i][1]) < 24) i--; if (i > 0) { path.splice(0, i); a = path[0]; } }
  }
  const P = { path, pi: 1, members: [], wait: 0 }, n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) { const kind = i === 0 && n >= 3 ? 'knight_c' : pickR(['knight_a', 'knight_b']), A = ALLY_KINDS[kind];
    const al = { id: kind, x: (a[0] + .5) * 16 + (i % 2) * 14 - 7, y: (a[1] + .8) * 16 + Math.floor(i / 2) * 14, hp: A.hp, mhp: A.hp, atk: A.atk, patrol: P, slot: i, cd: 0, dir: 0 }; P.members.push(al); ALLIES.push(al); }
  PATROLS.push(P);
}
const allyFoes = (m, x, y, r) => m.ents.filter(e => e.type === 'enemy' && !e.dead && !(EN[e.k] && EN[e.k].boss) && dist(e.x, e.y, x, y) < r);
function allyStrike(m, al, e) {
  const E = EN[e.k] || {}, dmg = Math.max(1, Math.round(al.atk * (.75 + Math.random() * .5) - (E.def || 0) * .5));
  e.hp -= dmg; e.flash = .12; e.allyHit = gameT; const a = Math.atan2(e.y - al.y, e.x - al.x); e.vx = Math.cos(a) * 110; e.vy = Math.sin(a) * 110; e.kb = .12;
  floatText(e.x, e.y - (E.r || 6) * 2 - 6, dmg, '#e8e0ff'); al.swing = .3; al.dir = Math.abs(e.x - al.x) > Math.abs(e.y - al.y) ? (e.x < al.x ? 1 : 2) : (e.y < al.y ? 3 : 0);
  for (let i = 0; i < 4; i++) PARTS.push({ x: e.x, y: e.y - 8, vx: (Math.random() - .5) * 60, vy: -20 - Math.random() * 30, t: .3, c: '#fff2c8' });
  if (e.hp <= 0) {
    if (dist(S.p.x, S.p.y, e.x, e.y) < 140) killEnemy(m, e); // you were in the fight: your kill
    else { e.dead = true; if (typeof CORPSES !== 'undefined') CORPSES.push({ m: m.id, spr: enemySpr(e.k, 0), x: e.x, y: e.y, flip: e.dir < 0, t: 0, T: .6 }); }
  }
}
function allyMove(m, al, tx, ty, sp, dt) {
  if (al.path && al.goal && Math.hypot(al.goal[0] - tx, al.goal[1] - ty) < 40) { // walking round something on a path
    const node = al.path[al.pi]; if (node) { const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16; if (Math.hypot(wx - al.x, wy - al.y) < 3) al.pi++; else { tx = wx; ty = wy; } } else al.path = null;
  } else al.path = null;
  const dx = tx - al.x, dy = ty - al.y, d = Math.hypot(dx, dy); if (d < 2) { al.walk = false; return true; }
  const s = Math.min(sp * dt, d), ox = al.x, oy = al.y, nx = al.x + dx / d * s, ny = al.y + dy / d * s;
  if (!solidAt(m, nx, al.y - 2)) al.x = nx; if (!solidAt(m, al.x, ny - 2)) al.y = ny;
  const moved = Math.hypot(al.x - ox, al.y - oy); al.walk = moved > .01; al.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  al.stuck = moved < s * .3 ? (al.stuck || 0) + dt : 0;
  if (al.stuck > .5 && !al.path) { al.stuck = 0; const p = findPath(m, Math.floor(al.x / 16), Math.floor((al.y - 2) / 16), Math.floor(tx / 16), Math.floor((ty - 2) / 16), 4000); if (p) { al.path = p; al.pi = 1; al.goal = [tx, ty]; } }
  return false;
}
function alliesFrame(dt) {
  const m = cur; if (!m || m.id !== 'wilds' || !m.towns) return;
  if (!ALLIES.length && m.towns.length) spawnGuards(m);
  PATROL_T -= dt; PATROLS = PATROLS.filter(P => P.members.some(a => !a.gone));
  { // the patrol job: a squad of three rides up to you and stays (round 6: map patrols were too far and too fast to join)
    const j = S.realm && S.realm.q.kb_patrol, on = j && j.on && !j.done, E = PATROLS.find(P => P.escort);
    if (on && !E && !(m.towns || []).some(T => townAt(m, S.p.x / 16, S.p.y / 16, 2) === T)) spawnEscort(m);
    if (!on && E) E.members.forEach(a => a.gone = true);
  }
  if (PATROL_T <= 0) { const job = S.realm && S.realm.q.kb_patrol && S.realm.q.kb_patrol.on && !S.realm.q.kb_patrol.done; PATROL_T = job ? 10 : 20; if (PATROLS.length < (job ? 4 : 3)) spawnPatrol(m); } // with the patrol job on, they come by far more often (playtest)
  for (const al of ALLIES) {
    if (al.gone) continue;
    if (al.down > 0) { al.down -= dt; if (al.down <= 0) { al.hp = al.mhp; if (al.post) { al.x = al.post[0]; al.y = al.post[1]; } } continue; }
    al.cd -= dt; if (al.swing > 0) al.swing -= dt;
    const home = al.post || (al.patrol ? [al.patrol.members[0].x, al.patrol.members[0].y] : [al.x, al.y]);
    if (!al.tgt || al.tgt.dead || dist(al.tgt.x, al.tgt.y, home[0], home[1]) > 200) al.tgt = allyFoes(m, al.x, al.y, al.post ? 150 : 130).sort((a, b) => dist(a.x, a.y, al.x, al.y) - dist(b.x, b.y, al.x, al.y))[0] || null;
    if (al.tgt) {
      const e = al.tgt, d = dist(e.x, e.y, al.x, al.y);
      if (d > 16) allyMove(m, al, e.x, e.y, 46, dt); else if (al.cd <= 0) { al.cd = 1.1; allyStrike(m, al, e); }
      for (const e2 of allyFoes(m, al.x, al.y, 18)) { e2.allyCd = (e2.allyCd || 0) - dt; if (e2.allyCd <= 0) { e2.allyCd = 1.4; const dmg = Math.max(1, Math.round((e2.atk || 5) * .5)); al.hp -= dmg; floatText(al.x, al.y - 34, '-' + dmg, '#ff8a6a'); } }
      if (al.hp <= 0) { al.down = 45; al.tgt = null; toast((ALLY_KINDS[al.id] || {}).n + ' falls back to tend their wounds.'); for (let i = 0; i < 8; i++) PARTS.push({ x: al.x, y: al.y - 10, vx: (Math.random() - .5) * 80, vy: -30, t: .5, c: '#d8d4c8' }); }
      continue;
    }
    if (al.hp < al.mhp) al.hp = Math.min(al.mhp, al.hp + 6 * dt);
    if (al.post) { if (allyMove(m, al, al.post[0], al.post[1], 40, dt)) al.dir = 0; continue; }
    const P = al.patrol;
    if (P.escort) { // Vey's squad keeps by you while the patrol job is on
      const off = [[-18, 12], [18, 12], [0, 24]][al.slot % 3], tx = S.p.x + off[0], ty = S.p.y + off[1];
      if (dist(al.x, al.y, tx, ty) > 420) { al.x = tx; al.y = ty; } else if (dist(al.x, al.y, tx, ty) > 10) allyMove(m, al, tx, ty, 52, dt); else al.walk = false;
      continue;
    }
    if (al.slot === 0) {
      const node = P.path[P.pi]; P.age = (P.age || 0) + dt; if (!node || P.age > 360) { al.gone = true; P.members.forEach(a => a.gone = true); continue; }
      // a patrol never stalls (round 5: one stood jammed against a forge for hours, and blocked new ones): stragglers
      // catch up after 3 s, and a leader making no headway for 3 s steps on to the next point of the road
      const lag = P.members.filter(a => a !== al && !a.gone && !a.down && dist(a.x, a.y, al.x, al.y) > 60);
      if (lag.length) { al.walk = false; P.wt = (P.wt || 0) + dt; if (P.wt > 3) { P.wt = 0; for (const a of lag) { a.x = al.x + (Math.random() - .5) * 20; a.y = al.y + 8; } } continue; } P.wt = 0;
      const nd = Math.hypot((node[0] + .5) * 16 - al.x, (node[1] + .8) * 16 - al.y);
      if (P.bestD === undefined || nd < P.bestD - 3) { P.bestD = nd; P.st = 0; } else if ((P.st = (P.st || 0) + dt) > 3) { P.st = 0; P.bestD = undefined; P.pi = Math.min(P.path.length - 1, P.pi + 2); const n2 = P.path[P.pi]; al.x = (n2[0] + .5) * 16; al.y = (n2[1] + .8) * 16; }
      if (allyMove(m, al, (node[0] + .5) * 16, (node[1] + .8) * 16, 30, dt)) { P.pi++; P.bestD = undefined; }
    } else {
      const L = P.members[0], off = [[0, 0], [-14, 10], [14, 10], [0, 20]][al.slot];
      if (L.gone || L.down) { const nx = P.members.find(a => !a.gone && !a.down); if (nx && nx !== al) allyMove(m, al, nx.x + off[0], nx.y + off[1], 34, dt); continue; }
      if (dist(al.x, al.y, L.x, L.y) > 300) { al.x = L.x + off[0]; al.y = L.y + off[1]; } else allyMove(m, al, L.x + off[0], L.y + off[1], 34, dt);
    }
  }
  for (let i = ALLIES.length - 1; i >= 0; i--) if (ALLIES[i].gone) ALLIES.splice(i, 1);
  // the allies are drawn and talked to like villagers
  m.npcs = (m.npcs || []).filter(n => !n.ally).concat(ALLIES.filter(a => !a.down && !a.gone).map(a => Object.assign(a._n || (a._n = { ally: 1 }), { id: a.id, x: a.x, y: a.y, hx: a.x, hy: a.y, dir: a.dir, walk: a.walk, t: 1e9, vx: 0, src: a })));
}
EVT.on('map', id => { if (id !== 'wilds') { ALLIES.length = 0; PATROLS = []; } else { ALLIES.length = 0; PATROLS = []; PATROL_T = 2; } });
update = (f => function (dt) { f(dt); if (S && !TITLE) { townWalk(dt); alliesFrame(dt); } })(update);
/* a sword in hand, a swing when they strike, and a health bar when hurt */
pcCursorDraw = (f => function (m) {
  f(m);
  if (!m || m.id !== 'wilds' || TITLE) return;
  const ic = typeof itemIcon === 'function' ? itemIcon('steel_sword') : null;
  for (const al of ALLIES) {
    if (al.down > 0 || al.gone || dist(al.x, al.y, S.p.x, S.p.y) > 420) continue;
    if (ic && typeof heldIcon === 'function' && !(typeof behindTall === 'function' && behindTall(m, al.x, al.y))) { const side = al.dir === 1 ? -1 : 1, sw = al.swing > 0 ? (1 - al.swing / .3) : 0, ang = -1.2 + sw * 2.4; heldIcon(ic, al.x + side * 6, al.y - 14, side < 0 ? Math.PI - ang : ang, 12); }
    if (al.hp < al.mhp) { const w = 16, k = Math.max(0, al.hp / al.mhp); g.fillStyle = '#2a1c18'; g.fillRect(Math.round(al.x - w / 2) - 1, Math.round(al.y - 40) - 1, w + 2, 4); g.fillStyle = '#4ac850'; g.fillRect(Math.round(al.x - w / 2), Math.round(al.y - 40), Math.round(w * k), 2); }
  }
  // a town's name when you walk in
  const T = townAt(m, S.p.x / 16, S.p.y / 16);
  if (T && T !== LAST_TOWN) showBanner(T.n + ' · ' + T.kind); LAST_TOWN = T;
})(pcCursorDraw);
let LAST_TOWN = null;

/* the map shows the towns */
worldMapCanvas = (f => function () {
  const c = f(), m = MAPS.wilds; if (!m || !m.towns) return c; const x = c.getContext('2d');
  if (m.roadT) { x.fillStyle = '#d8b878'; for (const i of m.roadT) x.fillRect((i % m.w) * 3, ((i / m.w) | 0) * 3, 3, 3); } // the roads are known, explored or not
  for (const P of PATROLS) { const L = P.members.find(a => !a.gone); if (!L) continue; const X = L.x / 16 * 3, Y = L.y / 16 * 3; x.fillStyle = '#2a1c18'; x.fillRect(X - 5, Y - 5, 10, 10); x.fillStyle = '#9a66cc'; x.fillRect(X - 4, Y - 4, 8, 8); x.fillStyle = '#ffe080'; x.fillRect(X - 1, Y - 3, 2, 6); x.fillRect(X - 3, Y - 1, 6, 2); } // knight patrols on the road
  for (const T of m.towns) { x.strokeStyle = T.kind === 'City' || TOWNS[T.id].walls === 'stone' ? '#8a8478' : '#8a6a3a'; x.lineWidth = 3; x.strokeRect(T.x * 3, T.y * 3, T.w * 3, T.h * 3); x.fillStyle = 'rgba(216,200,168,.35)'; x.fillRect(T.x * 3, T.y * 3, T.w * 3, T.h * 3); } // each town's walls or fence
  { // each town building by what it is (playtest: nobody could find the barracks)
    const TAG = { inn: 'Inn', shop: 'Shop', smith: 'Forge', fish: 'Fish', bank: 'Bank', temple: 'Temple', hall: 'Hall', barracks: 'Barracks' };
    x.font = '700 10px Fredoka, sans-serif'; x.textAlign = 'center'; x.lineWidth = 3; x.strokeStyle = '#2a1c18'; x.fillStyle = '#ffe8a8';
    for (const b of m.bld) { if (!TOWN_ACTS[b.act]) continue; const t = TAG[actType(b.act)] || 'Shop', X = (b.x + b.w / 2) * 3, Y = (b.y + b.h / 2) * 3 + 4; x.strokeText(t, X, Y); x.fillText(t, X, Y); }
  }
  x.font = '700 18px Fredoka, sans-serif'; x.textAlign = 'center'; x.lineWidth = 4; x.strokeStyle = '#2a1c18'; x.fillStyle = '#fff2c8'; // the home labels again, over the roads
  for (const [t, X] of [['Farm', WIN_F], ['Village', WIN_V]]) { x.strokeText(t, X * 3, (m.h - 3) * 3); x.fillText(t, X * 3, (m.h - 3) * 3); }
  for (const T of m.towns) {
    const X = T.cx * 3, Y = T.cy * 3, big = T.kind === 'City' ? 1 : 0;
    x.fillStyle = '#2a1c18'; x.fillRect(X - 8 - big * 3, Y - 6 - big * 3, 16 + big * 6, 12 + big * 6); x.fillStyle = big ? '#e8b830' : '#d8c8a8'; x.fillRect(X - 7 - big * 3, Y - 5 - big * 3, 14 + big * 6, 10 + big * 6);
    x.font = '700 ' + (big ? 18 : 15) + 'px Fredoka, sans-serif'; x.textAlign = 'center'; x.lineWidth = 4; x.strokeStyle = '#2a1c18'; x.strokeText(T.n, X, Y - 12 - big * 3); x.fillStyle = '#fff2c8'; x.fillText(T.n, X, Y - 12 - big * 3);
  }
  return c;
})(worldMapCanvas);

/* ---- the herald's procession: knights, the herald and two wagons roll in along the village road
   and stop by your home; the herald then waits as the story's speaker. After you've spoken to him
   they head back out the way they came. ---- */
Object.defineProperty(NPCS, 'herald_w', { value: { n: 'Royal Herald', role: 'Herald', shop: 'k_guard', P: SCAST.herald.P, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
OBJ.wagon = { solid: 1, fixed: 1, w: 4 };
objSprite = (f => function (o, season) {
  if (o.k === 'wagon') return PIX.get('wagon_' + (o.v || 'royal') + '.0');
  if (o.k === 'storynpc' && o.c === 'herald' && !(S.story && S.story.flags.heraldHere)) return null;
  return f(o, season);
})(objSprite);
objInteract = (f => function (m, x, y, o) {
  if (o.k === 'storynpc' && o.c === 'herald' && !(S.story && S.story.flags.heraldHere)) return { label: 'Riders are coming…', fn: () => toast('Riders in purple and gold are coming up the village road. Wait for them here.') };
  if (o.k === 'wagon') return { label: 'Look', fn: () => toast(o.v === 'royal' ? 'A royal wagon, purple and gold, with the stag of Valdmark on its cover.' : 'A supply wagon heavy with crates and the knights\' kit.') };
  return f(m, x, y, o);
})(objInteract);
let PROC = null;
const inPasture = (m, x, y) => { const P = m.pasture; return P && (x + 5) * 16 > P.x0 - 16 && x * 16 < P.x1 + 16 && (y + 1) * 16 > P.y0 - 16 && (y - 2) * 16 < P.y1 + 16; };
const heraldStep = () => { const st = typeof stepOf === 'function' && stepOf('throne'); return st && st.who === 'herald' ? st : null; };
function procStart(snap) {
  const m = MAPS.farm, w = storyWhere('farm:home'); if (!w) return;
  const ex = m.w + 1, ey = 19, hx = w.x, hy = w.y;
  const slots = [['knight_c', hx - 2, hy + 1], ['knight_a', hx + 2, hy + 1], ['herald_w', hx, hy], ['knight_b', hx - 2, hy + 2], ['knight_a', hx + 2, hy + 2]];
  PROC = { m, walkers: [], wagons: [], leaving: false };
  const used = []; // each rider gets a tile of their own, never right against something (the campfire, the tent)
  const roomy = (x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = x + i, Y = y + j; if (!inb(m, X, Y) || getO(m, X, Y) || m.solidB[Y * m.w + X] || TER[getT(m, X, Y)].solid || TER[getT(m, X, Y)].water) return false; } return !used.some(u => Math.abs(u[0] - x) < 2 && Math.abs(u[1] - y) < 2); };
  const spot = (tx, ty) => { for (let r = 0; r <= 7; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (Math.max(Math.abs(i), Math.abs(j)) === r && roomy(tx + i, ty + j)) return [tx + i, ty + j]; return freeNear(m, tx, ty, 0, 6); };
  slots.forEach(([id, tx, ty], i) => { const d = (id === 'herald_w' ? [tx, ty + 1] : spot(tx, ty)) || [tx, ty]; used.push(d); /* the herald stops just in front of his story spot: that tile holds him once he's arrived */ const al = { id, x: (m.w - 1.5) * 16, y: (ey + .8 + (i % 2)) * 16, dest: [(d[0] + .5) * 16, (d[1] + .8) * 16], delay: i * .9, dir: 1 }; if (snap) { al.x = al.dest[0]; al.y = al.dest[1]; al.delay = 0; } PROC.walkers.push(al); });
  // two wagons park beside the road
  // (weeds, stones, twigs and grass under a parking spot are cleared away: a new farm is full of them)
  const LIGHT = new Set(['weed', 'stone', 'twig', 'tgrass', 'flower', 'grass', 'bush']);
  const clearable = (x, y) => { if (!inb(m, x, y) || m.solidB[y * m.w + x] || m.soil[y * m.w + x]) return false; const t = TER[getT(m, x, y)]; if (t.solid || t.water) return false; const o = getO(m, x, y); return !o || (LIGHT.has(o.k) && !o.fixed); };
  const park = [];
  for (const y of [17, 22, 16, 23, 15, 24]) for (let x = m.w - 7; x > m.w - 36 && park.length < 2; x--) {
    let ok = !inPasture(m, x, y) && !park.some(p => Math.abs(p[0] - x) < 6 && Math.abs(p[1] - y) < 3) && !used.some(u => u[0] >= x - 1 && u[0] <= x + 4 && Math.abs(u[1] - y) < 3);
    for (let j = 0; ok && j < 2; j++) for (let i = 0; ok && i < 4; i++) ok = clearable(x + i, y - j);
    if (ok) { for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) if (getO(m, x + i, y - j)) setO(m, x + i, y - j, null); park.push([x, y]); }
  }
  park.forEach(([x, y], i) => PROC.wagons.push({ v: i ? 'supply' : 'royal', x: (ex + 6 + i * 6) * 16, y: (y + 1) * 16, px: x, py: y, parked: false, delay: 2 + i * 2.5 }));
  if (snap) for (const W of PROC.wagons) { W.x = W.px * 16; W.parked = true; putObj(m, W.px, W.py, { k: 'wagon', v: W.v, fixed: 1, proc: 1 }); }
}
function procClear() {
  if (!PROC) return; const m = PROC.m;
  for (let i = 0; i < m.o.length; i++) if (m.o[i] && m.o[i].k === 'wagon' && m.o[i].proc) delObj(m, i % m.w, (i / m.w) | 0);
  m.npcs = (m.npcs || []).filter(n => !n.proc); PROC = null;
}
function procFrame(dt) {
  if (!S || !S.story || cur !== MAPS.farm) return;
  const st = heraldStep(), F = S.story.flags;
  if (!PROC && st && !F.heraldGone) { procStart(!!F.heraldHere); if (PROC && !F.heraldHere) { toast('Horns on the village road! Riders in purple and gold are coming to your farm.', 'lvl'); if (SFX.lvl) SFX.lvl(); } }
  if (!PROC) return;
  const m = PROC.m;
  if (!st && !PROC.leaving) { PROC.leaving = true; F.heraldGone = 1; for (const W of PROC.wagons) { if (W.parked) { delObj(m, W.px, W.py); W.parked = false; W.x = W.px * 16; } W.delay = 0; } }
  const ex = (m.w + 2) * 16;
  for (const al of PROC.walkers) {
    if (al.gone) continue; if (al.delay > 0) { al.delay -= dt; continue; }
    if (PROC.leaving) { if (al.id === 'herald_w' && !al.left) { al.left = 1; F.heraldHere = 1; } if (allyMove(m, al, (m.w - 1) * 16, 19.8 * 16, 34, dt) || al.x > (m.w - 1.5) * 16) al.gone = true; continue; }
    // never stall the story on a rider who can't get through: no progress for 5 s (or 50 s on the road) and they step to their place
    al.rt = (al.rt || 0) + dt; const dd = Math.hypot(al.dest[0] - al.x, al.dest[1] - al.y); if (al.best === undefined || dd < al.best - 4) { al.best = dd; al.bt = 0; } else al.bt = (al.bt || 0) + dt;
    if (al.bt > 5 || al.rt > 50) { al.x = al.dest[0]; al.y = al.dest[1]; }
    if (allyMove(m, al, al.dest[0], al.dest[1], 30, dt) || dd < 6) { al.dir = 0; if (al.id === 'herald_w' && !F.heraldHere) { F.heraldHere = 1; al.gone = true; toast('The royal herald has arrived. He waits by your door.'); } }
  }
  for (const W of PROC.wagons) {
    if (W.gone || W.parked) continue; if (W.delay > 0) { W.delay -= dt; continue; }
    W.f = (W.f || 0) + dt;
    if (PROC.leaving) { W.x += 30 * dt; W.dir = 1; if (W.x > ex + 40) W.gone = true; continue; }
    W.x -= 30 * dt; if (W.x <= W.px * 16) { W.x = W.px * 16; W.parked = true; putObj(m, W.px, W.py, { k: 'wagon', v: W.v, fixed: 1, proc: 1 }); }
  }
  m.npcs = (m.npcs || []).filter(n => !n.proc).concat(PROC.walkers.filter(a => !a.gone && a.delay <= 0 && !(a.id === 'herald_w' && F.heraldHere && !PROC.leaving)).map(a => Object.assign(a._n || (a._n = { proc: 1 }), { id: a.id, x: a.x, y: a.y, hx: a.x, hy: a.y, dir: a.dir, walk: a.walk, t: 1e9, vx: 0 })));
  if (PROC.leaving && PROC.walkers.every(a => a.gone) && PROC.wagons.every(W => W.gone)) procClear();
}
EVT.on('map', id => { if (id !== 'farm' && PROC) procClear(); });
update = (f => function (dt) { f(dt); procFrame(dt); })(update);
/* rolling wagons are drawn over the road until they park */
pcCursorDraw = (f => function (m) {
  f(m);
  if (!PROC || m !== PROC.m) return;
  for (const W of PROC.wagons) { if (W.gone || W.parked || W.delay > 0) continue; const spr = PIX.get('wagon_' + W.v + '.' + (Math.floor((W.f || 0) * 5) % 2)); if (!spr) continue;
    if (W.dir === 1) { g.save(); g.translate(Math.round(W.x + spr.ww), Math.round(W.y - spr.wh)); g.scale(-1, 1); D(spr, 0, 0); g.restore(); } else D(spr, Math.round(W.x), Math.round(W.y - spr.wh)); }
})(pcCursorDraw);

/* story steps can name townsfolk: they're found at their shop door, or wherever they're walking */
npcWhere = (f => function (id) {
  if (!TOWN_NPCS[id]) return f(id);
  const m = MAPS.wilds, n = m && (m.npcs || []).find(n => n.id === id); if (n) return { map: 'wilds', x: Math.floor(n.x / 16), y: Math.floor((n.y - 2) / 16) };
  if (cur && cur.id === 'in_' + TOWN_NPCS[id].shop) { const i = cur.o.findIndex(o => o && o.k === 'keeper'); if (i >= 0) return { map: cur.id, x: i % cur.w, y: (i / cur.w) | 0 }; }
  const b = m && m.bld.find(b => b.act === TOWN_NPCS[id].shop); return b ? { map: 'wilds', x: b.door.x, y: b.door.y + 1 } : null;
})(npcWhere);
/* places in the towns for story steps: 'town:<id>:<spot index>' or 'town:<id>:gate' */
storyWhere = (f => function (role) {
  const p = role.split(':'); if (p[0] !== 'town') return f(role);
  const PL = S.story && S.story.places; if (PL && PL[role]) { const [map, x, y] = PL[role]; return { map, x, y }; }
  const m = MAPS.wilds, T = m && (m.towns || []).find(t => t.id === p[1]); if (!T) return null;
  const sp = p[2] === 'gate' ? [T.exits.S || Object.values(T.exits)[0]].map(([x, y]) => [x - T.x, y - T.y])[0] : TOWNS[p[1]].spots[+p[2] || 0];
  const at = freeNear(m, T.x + sp[0], T.y + sp[1], 0, 5) || [T.x + sp[0], T.y + sp[1]];
  if (PL) PL[role] = ['wilds', at[0], at[1]];
  return { map: 'wilds', x: at[0], y: at[1] };
})(storyWhere);
/* a gentle ring: within 28 tiles of a town, and along the south edge where the farm and village roads come
   in, the Wilds only send meadow creatures (playtest: a newcomer met a level-11 boar beside Kingsbridge) */
spawnEnemy = (f => function (m, k, x, y, lvl) {
  if (m && m.id === 'wilds' && EN[k] && !EN[k].boss && typeof BIOME_EN !== 'undefined') {
    const tx = x / 16, ty = y / 16, near = townAt(m, tx, ty, 28) || ty > m.h - 45, M = { day: [['slime', 5], ['blueslime', 1]], night: [['slime', 3], ['blueslime', 2]] }, night = S && (S.time >= 1200 || S.time < 360); // only slimes here: crows circled out of reach and over the walls (round 3)
    if (near && !(night ? M.night : M.day).some(([id]) => id === k)) { k = wpick(night ? M.night : M.day); lvl = 0; }
    else if (near) lvl = Math.min(lvl || 0, 1);
  }
  return f(m, k, x, y, lvl);
})(spawnEnemy);

/* ---- townsfolk: people walking each town's streets by day, and vendors behind the Kingsbridge stalls
   (playtest: "Kingsbridge feels empty, the village is livelier"). Runtime only; hidden from Friends. ---- */
const CIT_N = { kingsbridge: 12, greyhelm: 6, ashford: 4, saltmere: 5 };
const CIT_ROLE = { kingsbridge: ['Citizen', 'Merchant', 'Washerwoman', 'Apprentice', 'Scholar', 'Lamplighter', 'Courier', 'Noblewoman'], greyhelm: ['Miner', 'Miner', 'Smelter', 'Hauler'], ashford: ['Woodcutter', 'Forager', 'Trapper'], saltmere: ['Fisher', 'Net mender', 'Sailor', 'Salt raker'] };
const CIT_LINES = {
  kingsbridge: ['Mind the carts. They don\'t stop for anyone, not even the mayor.', 'Fresh bread at the inn before nine. After nine, fresh opinions.', 'They say the regent hasn\'t slept since the princess vanished.', 'Knights everywhere this year. My aunt says it means a war. My aunt says that every year.', 'The bridge toll was abolished forty years ago. The toll collector never got the message.'],
  greyhelm: ['Shift starts at dawn. Ale starts at dusk. Everything in between is rock.', 'Don\'t go below the third level. We don\'t, and we live here.', 'Borek\'s forge never goes cold. Neither does Borek.'],
  ashford: ['Watch for wolves past the fence. They\'ve been bold.', 'Best mushrooms in the valley grow by the old shrine. Second best grow everywhere else.', 'The sawmill wheel sings when the river\'s high.'],
  saltmere: ['Tide\'s turning. Always is.', 'Finn\'s fish is fresh. Finn\'s jokes are not.', 'Seen the shark past the reef? Big as a boat. Bigger than my boat.'],
};
const HAIRS = ['#1a1210', '#3a2a1a', '#6a4a2a', '#a83a1a', '#c8642a', '#e8d090', '#a8a8a8', '#d8d8d0'], SKINS = ['#f0d0b0', '#e8c0a0', '#e0b48e', '#c8906a', '#a8724e', '#8a5a3a'];
const CLOTH = ['#6a3a9a', '#2a64a0', '#8a3a2a', '#5a7a3a', '#a87a3a', '#4a4a5a', '#2a6a7a', '#7a5a3a', '#a83a5a', '#d8c8a8'];
const CITS = [];
for (const town in CIT_N) for (let i = 0; i < CIT_N[town] + (town === 'kingsbridge' ? 4 : 0); i++) {
  const id = 'cz_' + town + '_' + i, h = k => Math.abs(strSeed(id + k)), vendor = town === 'kingsbridge' && i >= CIT_N[town];
  const fem = h('f') % 2, P = { shoe: '#3a2a1a', skin: SKINS[h('s') % SKINS.length], hair: HAIRS[h('h') % HAIRS.length], hs: fem ? ['long', 'bun', 'pony'][h('y') % 3] : ['short', 'short', 'spiky', 'bald'][h('y') % 4],
    shirt: CLOTH[h('c') % CLOTH.length], pants: CLOTH[h('p') % CLOTH.length] };
  if (!fem && h('b') % 3 === 0) P.beard = P.hair;
  if (vendor || h('a') % 4 === 0) P.apron = '#e8dcc0';
  if (town === 'kingsbridge' && !vendor && h('r') % 5 === 0) { P.robe = P.shirt; P.cape = CLOTH[h('k') % CLOTH.length]; }
  if (town === 'greyhelm' && h('m') % 2 === 0) P.hat = '#8a6a3a';
  if (town === 'saltmere' && h('m') % 2 === 0) P.hat = '#2a4a6a';
  let role = vendor ? 'Stallholder' : CIT_ROLE[town][h('o') % CIT_ROLE[town].length];
  if (!fem) role = { Washerwoman: 'Washer', Noblewoman: 'Nobleman' }[role] || role; // the role matches the look (playtest: a bearded "Noblewoman")
  Object.defineProperty(NPCS, id, { value: { n: role, role, shop: 'k_cit', P, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
  CITS.push({ id, town, vendor, si: i - CIT_N[town] });
}
const CITST = {};
function citSync() {
  const m = MAPS.wilds; if (!m || !m.towns || cur !== m) return;
  const day = S.time >= 420 && S.time < 1230, stalls = m.bld.filter(b => b.act === 'kb_stall');
  m.npcs = (m.npcs || []).filter(n => !n.cit || (day && dist(n.x, n.y, S.p.x, S.p.y) < 1400));
  if (!day) return;
  for (const C of CITS) {
    const T = m.towns.find(t => t.id === C.town); if (!T || m.npcs.some(n => n.id === C.id)) continue;
    if (dist((T.x + T.w / 2) * 16, (T.y + T.h / 2) * 16, S.p.x, S.p.y) > 1200) continue;
    let at;
    if (C.vendor) { const b = stalls[C.si]; if (!b) continue; at = [b.x + b.w, b.y + b.h - 1]; } // beside the counter, not behind the awning (art round)
    else at = citSpot(m, T);
    if (!at) continue;
    const x = (at[0] + .5) * 16, y = (at[1] + .8) * 16;
    m.npcs.push({ id: C.id, cit: 1, x, y, hx: x, hy: y, dir: 0, walk: false, t: 1e9, vx: 0 });
    CITST[C.id] = { wait: Math.random() * 6, T, vendor: C.vendor };
  }
}
function citSpot(m, T) { // a street or square tile in the town
  for (let k = 0; k < 40; k++) { const x = T.x + 2 + Math.floor(Math.random() * (T.w - 4)), y = T.y + 2 + Math.floor(Math.random() * (T.h - 4)), t = getT(m, x, y); if ((t === 'p' || t === 'st' || t === 'd') && !getO(m, x, y) && !m.solidB[y * m.w + x]) return [x, y]; }
  return null;
}
function citFrame(dt) {
  const m = MAPS.wilds; if (!m || cur !== m || !m.npcs) return;
  for (const n of m.npcs) {
    if (!n.cit) continue; const st = CITST[n.id]; if (!st) continue;
    if (n.waitT > 0) { n.waitT -= dt; n.walk = false; continue; }
    if (st.vendor) { n.dir = 0; continue; }
    if (st.path) {
      const node = st.path[st.pi]; if (!node) { st.path = null; n.walk = false; st.wait = 3 + Math.random() * 8; continue; }
      const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
      if (d < 2) { st.pi++; continue; }
      const sp = 21 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.hx = n.x; n.hy = n.y; n.walk = true;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); continue;
    }
    st.wait -= dt; if (st.wait > 0) continue;
    const to = citSpot(m, st.T); if (!to) { st.wait = 3; continue; }
    const p = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), to[0], to[1], 2500); if (p) { st.path = p; st.pi = 1; } else st.wait = 2;
  }
}
EVT.on('tick', k => { if (k % 4 === 0 && S && !TITLE) citSync(); });
EVT.on('map', id => { if (id === 'wilds') citSync(); });
update = (f => function (dt) { f(dt); if (S && !TITLE) citFrame(dt); })(update);
doorAction = (f => function (act, who) {
  if (act !== 'k_cit') return f(act, who);
  const C = CITS.find(c => c.id === who), pool = C && C.vendor ? ['Apples, cherries, honey from the hill farms! Browse the stall, friend.', 'Best prices in Kingsbridge. Second-best prices too, if you haggle.'] : CIT_LINES[C ? C.town : 'kingsbridge'];
  storyDialog([[who, pickR(pool)]], C && C.vendor ? { title: TOWNS_AT_ME() || 'On the road', last: 'Browse the stall', done: () => doorAction('kb_stall') } : { title: TOWNS_AT_ME() || 'On the road' });
})(doorAction);

/* the Wilds' own paths (to the farm, the village, the mine) are laid like the royal roads: straight bridges */
carvePath = (f => function (m, a, b) { if (m && m.id === 'wilds' && typeof realmRoad === 'function') return realmRoad(m, a, b); return f(m, a, b); })(carvePath);

/* waking at the inn you slept in */
endDay = (f => function (fainted) {
  const r = f(fainted), act = S && S.flags && S.flags.innWake;
  if (act && !fainted) { S.flags.innWake = null; const b = MAPS.wilds && MAPS.wilds.bld.find(b => b.act === act); if (b) { goMap('wilds', (b.door.x + .5) * 16, (b.door.y + 1.8) * 16, 0); toast('You wake rested at ' + (TOWN_ACTS[act] ? TOWN_ACTS[act].name : 'the inn') + '.'); } }
  else if (S && S.flags) S.flags.innWake = null;
  return r;
})(endDay);

/* town jobs you've taken are in the journal, with their progress */
renderQuests = (f => function (b) {
  f(b);
  if (!S || !S.realm) return;
  const on = TOWN_JOBS.filter(j => { const s = S.realm.q[j.id]; return s && s.on && !s.done; }); if (!on.length) return;
  const L = el('div', { class: 'list' });
  for (const j of on) { const s = S.realm.q[j.id], prog = j.t === 'bring' ? Object.entries(j.items).map(([k, n]) => cnt(k) + '/' + n + ' ' + IT[k].n).join(', ') : Math.min(s.n, j.need) + '/' + j.need;
    L.append(el('div', { class: 'rrow' }, el('div', { class: 'qck' }, '!'), el('div', { class: 'rtxt' }, el('b', null, j.n + ' · ' + (TOWNS[j.town] ? TOWNS[j.town].n : '') + ' (' + j.gold + 'g)'), el('small', null, j.d + ' Progress: ' + prog + '. Hand it in at the ' + (j.barracks ? 'barracks' : 'town hall') + '.')))); }
  const h = [...b.querySelectorAll('h3')].find(x => /milestones/i.test(x.textContent));
  const head = el('h3', null, 'Town jobs'); if (h) { b.insertBefore(head, h); b.insertBefore(L, h); } else b.append(head, L);
})(renderQuests);
