/* ================= Guides tab (asked 2026-11-05) =================
   A Guides tab in the Satchel and the menu dock (key Y): topic guides on how everything works and how things are made
   (GUIDES: title + paragraphs, in order), then every window's own "i" guide (HELP, by name) so all of them can be read in one
   place. Also brings the "i" guides up to date with forging, cooking, tournaments, bounties, companions and pins. */
const GUIDES = [
  ['First days on the farm', [
    'Cut weeds and long grass with the scythe for hay and fibre. Till soil with the hoe, plant seeds, and water them every day with the can; rain waters for you.',
    'Crops grow one day each morning they were watered, only in their seasons (the greenhouse grows anything). Vegetables, grains and field crops are cut with the scythe; fruit and flowers by hand.',
    'Fence your fields. Every morning tilled soil the open meadow can reach has a 4% chance a tile to go back to tall grass, crop and all. Fences, fence gates (2 tiles wide, you and a horse walk through), buildings, solid ground, water and water channels all close a side.',
    'Sleep before 4:00 in your tent or bed. The day ends, crops grow, machines catch up overnight and the game saves.']],
  ['How crafting works', [
    'Things are made at stations: the workbench (fences, parts, belts, machines, blueprints), the furnace (ore to bars), the anvil (weapons, armour and tools), the kitchen (a stove, fireplace or campfire: food), and the tanning rack (leather). Only the workbench and the campfire can be made anywhere.',
    'Walk up to a station and press E. "Can make" shows what your materials cover; the chips and search filter the list. Make starts one, ×5, ×10 and ×100 a batch; it runs while the window is open or you stay close.',
    'Once you have a Storage Shed, crafting at a station uses your bank as well as your backpack (the backpack first), even below the shed’s Keep amounts.',
    'Recipes you don’t know yet are bought: smithing patterns per metal from the smiths, cookbook pages from cooks (Pip and the inns), item plans from Hale. The Recipes tab (B) lists everything you know and where it’s made.',
    'Pin a recipe with 📌 and a panel on the left shows what you have and still need, counting your Storage Shed. Up to 3 at a time.']],
  ['Forging weapons and armour', [
    'Make (one piece) at an anvil opens the forge: 10 hits on the anvil. A glowing mark moves over the work and shrinks as its ring runs out; click its centre. A centre hit counts 1, a hit elsewhere on the mark ½; a click beside it or a mark that runs out counts nothing.',
    'The total sets the quality: under 4 Crude (−10% stats), under 6.5 Standard, under 8.5 Fine (+8%), under 9.5 Masterwork (+16%), 9.5 or more Legendary (+25%). Masterwork needs Smithing 20 and Legendary Smithing 40. Better quality also sells for more. A higher Smithing level gives each mark more time and size; better metals give less.',
    'Fine pieces get 1 trait, Masterwork 2, Legendary 3. Weapons: Keen, Balanced, Heavy, Sharp, Vampiric, Swift, Lucky, and Frostbite, Burning or Holy on some metals. Armour: Sturdy, Vital, Featherweight, Thorned, Warded, Regenerating, Lucky, and Fireproof on some metals.',
    'A catalyst steers the first trait: pick a monster part you carry (a fang for Keen or Sturdy, troll hide for Heavy, ectoplasm for Vampiric or Warded…) before you start. It’s used up on a Fine or better result.',
    'Quick forge skips the game and makes a Standard piece; so do batches and the trip and power hammers.',
    'Forge work at the anvil: Temper raises a piece one quality step (bars and gold; it can fail but the piece is kept), Reforge rerolls one trait.',
    'Pieces you forge carry your maker’s mark. Kept by your heirs they become heirlooms: +3% stats a generation, up to +30%.']],
  ['Cooking and meal buffs', [
    'Cooking at a kitchen opens a short game at the hearth for the whole batch: for each ingredient a needle swings over the heat dial; click while it’s in the green band to drop the ingredient into the pot. The centre of the band counts fully, the rest of the band half.',
    'The batch comes out Plain, Tasty, Delicious or Exquisite. Delicious needs Cooking 20 and Exquisite Cooking 40. Better dishes restore more, sell for more, and their buff lasts 1.5×, 2× or 3× as long. Quick cook makes Plain dishes.',
    'Every dish gives a buff: fish dishes easier fishing, meat attack, stews regeneration, pies better mining, cakes and sweets luck, salads speed, bread and eggs defence. Eating a dish again refreshes its buff.']],
  ['Building', [
    'Buy a building’s plans from Hale, make its blueprint at a workbench, then use the blueprint on your farm: a green ghost shows where it fits.',
    'Deliver the materials to the build site (missing ones come from your bank), then hammer it up: foundation, frame, walls, roof. Each stroke costs a little energy and trains Construction.',
    'The building hammer (workbench) moves or removes your buildings, wells, the shipping bin and campfires.']],
  ['Machines and belts', [
    'Machines turn inputs into goods on the game tick, even while you’re away: smelters and furnaces (ore to bars, fuel), the kiln (charcoal), the bread oven, the mill (power), the compost bin, the butter churn, trip and power hammers (power), and the artisan machines (keg, jar, cheese press, loom, oil press, smoker).',
    'Fuel is wood, hardwood, charcoal or coal. Power comes from a treadwheel (hay), windmill, waterwheel, tide mill or ember core within reach.',
    'Belts carry items between machines and crates; a belt can pull chosen items from what’s behind it, and a belt into the Storage Shed fills your bank. Sorters, splitters and mergers route the flow. Each machine’s and belt’s "i" button gives its exact recipes, times and settings.',
    'Better tiers (iron, cobalt, tide and rime, ember) are opened with plans from Hale and the regional forges.']],
  ['Animals, your pet and your horse', [
    'Buy animals at Odile’s; each lives in its coop, barn or stable. Pet them daily, feed them, collect their goods, and breed them for better genes.',
    'Your pet’s hearts (10 points of affection each) grow when you pet it and when you give it a fish or meat treat, once a day each. More hearts mean more nightly digs and rarer finds: gems, truffles, gold, even diamonds.',
    'Your horse gains stamina as you ride it: 10 levels, each 2.5% faster. The Animals tab shows both under Companions.']],
  ['Fishing', [
    'Cast with the rod into water and wait for a bite, then click: you look under the water, where the fish that live in that spot swim about (what you can catch depends on the water, the season, the time and your Fishing level). Steer the hook with the mouse to a fish’s mouth; shy fish dart away from it, easy ones come for the bait.',
    'Once it’s hooked, hold the mouse or Space to lift the net and keep the fish inside it until the catch bar fills. Now and then a treasure chest floats in the gauge: keep the net over it too.',
    'The canoe lets you fish deep water; the harpoon catches big fish (aim at its shadow, then keep the line’s tension in the band); crab traps fill overnight (pull when the marker is in the green).',
    'Once a season, on day 20, Saltmere holds a fishing tournament at Finn’s Fish (sign up the day before or on the day, 50g). From 8 am to 4 pm every fish you catch is weighed; your heaviest counts against four rivals. Prizes: 2,500g, the Angler’s Cup and the title Champion Angler; 1,000g; 400g.']],
  ['Money and markets', [
    'Shops buy and sell at their town’s market price: towns that are short of a good pay and charge more. Selling many at once lowers the price unit by unit.',
    'The shipping bin always pays 80% of the base price overnight. Your market stall sells to villagers and travelling traders at the price you set, and fills buy orders.',
    'Odo Fenn at your stall sells market news by the month: what every town is short of and what traders would pay.']],
  ['Fighting', [
    'Left click attacks toward the mouse; Shift dodges; Q parries. Z, X and C use your combat skills (V). Weapons need Melee, Ranged or Magic levels, armour Defence.',
    'You have 3 lives: losing all your health uses one and gets you up on the spot; they come back out of combat and every morning.',
    'Bounties at the Kingsbridge barracks: three named elites each week, each in its own lair in the Wilds. Take one and an arrow points to it. Kill it and claim gold and a Fine or Masterwork piece with traits.']],
  ['Exploring', [
    'The Wilds are full of biomes, towns, camps, ruins and bosses. Walk up to a waystone to attune it, then travel between attuned stones.',
    'Beating the Wilds’ world bosses opens the four regions (Highmarch, Frostmere, Emberwaste, Saltreach), each with a town, a dungeon, a boss and its own ores, woods and crops.',
    'A sailboat from Perrin’s Chandlery in Saltmere sails to five mystical isles with rare goods, strong creatures and guardians.']],
  ['Guilds and hired hands', [
    'Join a guild in its town and rise through five ranks by finishing tasks. Ranks pay gold and items, open the guild store and give titles.',
    'Guild members can hire hands at the farm notice board: woodcutter and forager (Hunters’ Lodge), miner (Miners’ Guild), fisher (Anglers’ Guild), farmhand (Growers’ Guild). Higher ranks open higher levels.']],
  ['Family', [
    'Befriend villagers with chats and gifts. At 8 hearts you can ask someone out, at 10 propose with an Ember Pendant (you need a cottage).',
    'Children grow up and learn the skill you teach them. When you die, your heir carries on with the farm, your gold and your heirlooms, and +10% XP a generation.']],
];
HELP.forgework = HELP.forgework || ['Forge work', []];
// the "i" guides, up to date with the new systems
if (HELP.station) { HELP.station[1] = HELP.station[1].filter(p => !/^Cooking opens a short minigame/.test(p)); HELP.station[1].push('At an anvil, Make forges one weapon or armour piece by hand: 10 hits on a moving mark (centre hits count most) set its quality (Crude to Legendary; Masterwork needs Smithing 20, Legendary 40) and Fine or better pieces get traits. Forge work tempers and reforges.', 'At a kitchen, a heat-dial game (drop each ingredient in when the needle is in the green) sets the whole batch’s quality: Plain, Tasty, Delicious or Exquisite (longer buffs).', 'Pin a recipe (📌) to keep what it needs on screen.'); }
if (HELP.craft) HELP.craft[1].push('Pin a recipe (📌) and what you still need shows on the left, counting your Storage Shed.');
if (HELP.animals) HELP.animals[1].push('Companions at the top: your pet’s hearts (pet it and give it a treat daily for more digs and rarer finds) and your horse’s stamina level (it rides faster as you ride it).');
if (HELP.barracks) HELP.barracks[1].push('In Kingsbridge, the Bounties tab posts three named elites a week: take one, hunt it in the Wilds, claim gold and a fine piece of gear.');
if (HELP.smith) HELP.smith[1].push('Forging at an anvil yourself sets the quality and traits of what you make; the "i" in Forge work explains tempering and reforging.');
if (typeof HELP_TOWN !== 'undefined') {
  HELP_TOWN.sm_fish += ' Once a season (day 20) Finn holds a fishing tournament: the Tournament tab.';
  HELP_TOWN.kb_barracks += ' The Bounties tab posts three named elites each week.';
}
function renderGuides(b) {
  const o = MODAL.opts, sel = o.gsel || 0, q = (o.gq || '').toLowerCase();
  const all = GUIDES.map(([t, ps], i) => ({ k: 'g' + i, t, ps })).concat(Object.keys(HELP).sort((a, c) => HELP[a][0].localeCompare(HELP[c][0])).map(k => ({ k: 'h:' + k, t: HELP[k][0], ps: HELP[k][1], win: 1 })));
  const shown = all.filter(x => !q || x.t.toLowerCase().includes(q) || x.ps.some(p => p.toLowerCase().includes(q)));
  const cur = shown.find(x => x.k === o.gk) || shown[0];
  const inp = el('input', { type: 'search', placeholder: 'Search the guides…', value: o.gq || '', class: 'gsearch' });
  inp.oninput = () => { o.gq = inp.value; o.gk = null; refresh(); setTimeout(() => { const i = document.querySelector('#modal .gsearch'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 0); };
  const list = el('div', { class: 'glist' });
  let head = null;
  for (const x of shown) {
    if (x.win && !head) { head = 1; list.append(el('div', { class: 'ghead' }, 'Window guides')); }
    list.append(el('button', { class: 'gitem' + (cur && x.k === cur.k ? ' on' : ''), on: () => { o.gk = x.k; refresh(); } }, x.t));
  }
  const body = el('div', { class: 'gbody' });
  if (cur) { body.append(el('h3', null, cur.t)); for (const p of cur.ps) body.append(el('p', null, p)); } else body.append(el('p', { class: 'note' }, 'Nothing found.'));
  b.append(inp, el('div', { class: 'gwrap' }, list, body));
}
openModal = (f => function (title, tabs, start, opts) {
  if (title === 'Satchel' && tabs && !tabs.some(t => t.id === 'guide')) { const i = tabs.findIndex(t => t.id === 'opts'); tabs = tabs.slice(); tabs.splice(i < 0 ? tabs.length : i, 0, { id: 'guide', label: 'Guides', render: renderGuides }); }
  return f.call(this, title, tabs, start, opts);
})(openModal);
if (typeof MENU_KEYS !== 'undefined') { MENU_KEYS.y = 'guide'; TAB_KEY.guide = 'Y'; }
if (typeof ACTIONS !== 'undefined') { ACTIONS.splice(ACTIONS.findIndex(a => a[0] === 'help'), 0, ['guide', 'Guides', 'y']); if (typeof buildKeymap === 'function') buildKeymap(); }
if (typeof DOCK !== 'undefined' && !DOCK.some(d => d[0] === 'guide')) DOCK.splice(DOCK.findIndex(d => d[0] === 'opts'), 0, ['guide', 'Guides', 'y']);
// the dock icon: an open book with a question mark, drawn in code
uiIcon = (f => function (id, px) {
  if (id !== 'guide') return f.apply(this, arguments);
  const c = el('canvas', { width: 16, height: 16, class: 'uiic' }), x = c.getContext('2d'), P = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  P('#3a2418', 1, 3, 14, 11); P('#f2e6c8', 2, 4, 5, 9); P('#f2e6c8', 9, 4, 5, 9); P('#c8b890', 7, 4, 2, 10); P('#a87a3a', 1, 13, 14, 1);
  P('#3a6ab0', 10, 5, 3, 1); P('#3a6ab0', 12, 6, 1, 2); P('#3a6ab0', 11, 8, 1, 2); P('#3a6ab0', 11, 11, 1, 1);
  for (let i = 0; i < 4; i++) P('#a89878', 3, 6 + i * 2, 3, 1);
  c.style.width = c.style.height = (px || 32) + 'px'; return c;
})(uiIcon);
if (typeof S !== 'undefined' && S && typeof buildDock === 'function' && $('#topr')) buildDock();
HELP.guide = ['Guides', ['Topic guides first: how to farm, craft, forge, cook, build, automate, fish, trade, fight, explore and more. Then every window’s own guide (the "i" buttons). Search finds a word in any of them.']];
helpKey = (f => function () { if (MODAL && MODAL.title === 'Satchel' && MODAL.cur === 'guide') return 'guide'; return f.apply(this, arguments); })(helpKey);
document.head.append(el('style', null, `
#modal .gsearch { width: 100%; margin-bottom: 8px; }
#modal .gwrap { display: grid; grid-template-columns: 220px 1fr; gap: 12px; min-height: 360px; }
#modal .glist { display: flex; flex-direction: column; gap: 2px; max-height: 62vh; overflow: auto; padding-right: 4px; }
#modal .gitem { text-align: left; background: none; border: 0; padding: 4px 8px; border-radius: 4px; cursor: pointer; font: inherit; }
#modal .gitem:hover { background: rgba(120,80,40,.12); } #modal .gitem.on { background: rgba(160,100,40,.25); font-weight: 700; }
#modal .ghead { margin: 8px 0 2px; font-weight: 700; opacity: .7; font-size: 13px; }
#modal .gbody { max-height: 62vh; overflow: auto; } #modal .gbody p { line-height: 1.45; margin: 0 0 10px; }
@media (max-width: 700px) { #modal .gwrap { grid-template-columns: 1fr; } }
`));
