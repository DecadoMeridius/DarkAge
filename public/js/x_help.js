/* Feature guides (asked 2026-11-03): every window that has a guide gets an "i" button in its title bar, next to the close
   button. It opens a short popup on what the feature is and how to use it. `helpKey()` works out which guide fits the
   window that's open (by its title, the Satchel tab, the station, the town building or the machine), `HELP` holds the
   texts. Add a guide by adding an entry to `HELP` and, if the window's title isn't fixed, a line to `helpKey`. */
const HELP = {
  stall: ['Market stall', [
    'Put goods out from your backpack. They sell from 8:00 to 18:00 while you work elsewhere, faster at weekends.',
    'Set each price with − and +, against what the village pays today. 70% always sells, 100% about half the time, 130% now and then, 160% hardly ever.',
    'Passers-by are villagers, so they compare your price with the village price.',
    'At 10:00 and 15:00 a travelling trader may call. He buys anything some town pays more for than your price, after his 15% cut; each row says the best town and the most he would pay.',
    'Take back returns unsold goods to your backpack.',
    'Buy orders: name an item, your top price and how many. The same traders buy it in a town whose shop sells it under your price and bring it at 10:00 or 15:00; you pay when it arrives, and it waits in the stall until you take it.',
    'The Log tab lists every sale and every delivered order of the last year, by day, with totals.']],
  bin: ['Shipping bin', [
    'Anything in the bin is sold overnight, wherever you are.',
    'It always pays a fixed 80% of the base price: no markets, no gluts.',
    'Selling in person at a shop usually pays more, unless that market has a glut of the good.',
    'Take 1 or Take all gives back what you put in before the night.']],
  notices: ['Notice boards', [
    'Today: the weather, festivals coming up, birthdays and the day\'s request.',
    'Markets: trade news (caravans, shortages, gluts, raids) and what each town is short of or has plenty of, with prices against normal (100%).']],
  markets: ['Markets', [
    'Every town keeps a stock of each trade good. A scarce good costs more, a glut less: from half to double the usual price.',
    'Selling lowers the price there unit by unit; buying raises it. Stocks drift back over a few days as the town makes and uses goods.',
    'Each town is cheap in what it makes (Greyhelm ore, Saltmere fish and salt, Ashford timber) and dear in what it lacks; region towns pay well for lowland food.',
    'Traders carry goods along the roads each morning; big loads go as caravans that bandits can loot.',
    'Rows say "Scarce here" or "Plentiful here". Gear, seeds, saplings, tools and placeables keep fixed prices.']],
  shop: ['Shops', [
    'Buy shows the price and how many are in stock; Sell lists what this shop buys from your backpack.',
    'Trade goods follow this town\'s market: "Scarce here" pays and costs more, "Plentiful here" less. Selling many at once lowers the price per unit.',
    'Gear, seeds and placeables restock each morning with a small weekly price drift.',
    'Shops keep opening hours; the door tells you when they open.']],
  smith: ['The forge', [
    'Buy bars, ore and arms; sell bars, ore, weapons and armour.',
    'The Forge tab works the furnace (ore to bars) and the anvil (bars and parts to gear). You need the recipe\'s skill level and pattern.',
    'Smithing patterns for each metal tier are bought here; at the village smithy Brann also upgrades your tools.']],
  inn: ['Inns', [
    'A hot meal at the table restores your health and half your energy, once a day.',
    'Take-away food goes into your backpack for the road.',
    'Rest two hours (once a day) or, after 18:00, sleep until morning and wake here.',
    'The Markets tab shows trade news and prices in every town; the Job board appears where the town has no hall.']],
  hall: ['Town hall', [
    'The town board lists jobs: kill monsters around the town or deliver goods.',
    'Take a job, do it, then hand it in here for gold and standing. At 50 standing the town\'s shops give you friend prices.',
    'Delivery jobs always pay more than the goods are worth.']],
  bank: ['Bank', ['Your bank is the same everywhere: unlimited storage, searchable, sorted by category.', 'Save up to three equipment loadouts as presets and swap between them here.']],
  temple: ['Temple', ['Ask for a blessing once a day to restore health and lives.', 'Giving to the poor raises the town\'s standing.']],
  barracks: ['Barracks', ['Captain Vey\'s knights patrol the roads. The patrol job sends a squad to ride with you.']],
  guild: ['Guilds', [
    'Join, then work through five ranks by finishing each rank\'s tasks: bring goods, reach skill levels, beat bosses or win fights.',
    'Ranks pay gold and items, upgrade a tool, open more of the guild store and give titles.',
    'Choose the title you go by in the Titles tab; guildmasters greet you by it.']],
  mara: ['Mara\'s General Store', [
    'Seeds for the season, field seeds (meadow grass for hay, flax for fibre) and saplings; the Pantry sells salt, sugar, butter and flour.',
    'Sell crops, fruit, forage and more here; prices follow the village market.',
    'The bank chest in the store opens your bank.']],
  brann: ['Brann\'s Smithy', [
    'The forge: smelt bars at the furnace and smith gear at the anvil.',
    'Tool upgrades: copper, iron, gold, mythril, then the Ember Multitool. Upgraded tools work faster and give extra.',
    'Patterns teach you to smith each metal tier. Coal and ore are for sale; more ore the deeper you have mined.']],
  hale: ['Hale\'s Workshop', [
    'Buy building plans, then make the blueprint at a workbench and place it on your farm.',
    'A build site needs its materials delivered, then you hammer it up in stages (it costs a little energy).',
    'Materials for sale: wood, stone, hardwood, clay and fibre. Item plans unlock workbench extras.',
    'Upgrades improve coops, barns and stables; the old greenhouse can be repaired here.']],
  tavern: ['The Drowsy Drake', ['Meals to eat or take away; prices follow the village market.', 'Pip sells cookbook pages that teach you new dishes.', 'Villagers gather here in the evening.']],
  corwin: ['Corwin\'s Hut', ['Corwin buys fish for 10% over the village price.', 'His ferry at the coast dock takes you to Saltreach once that region is open.']],
  odile: ['Odile\'s Stables', [
    'Buy animals (a pair comes as male and female) and horses; each lives in its building (coop, barn or stable).',
    'Breed: pick one animal, then Pair it with a mate. The young average their parents\' genes plus luck.',
    'Greyed buttons say what\'s missing.']],
  manor: ['Ashcombe Manor', [
    'Lord Ashcombe sells three plots beside your farm. Each deed shows its soil, resources, features and price.',
    'Buy outright, or lease for 25% down and 6% a week (miss a payment and the plot closes). A survey reveals hidden features.']],
  museum: ['The Museum', ['Donate artifacts, minerals and gems you find. Donations fill the display cases and count toward collections.']],
  altar: ['The Ember Altar', ['Respec your combat passive tree here for 250g a point.']],
  waystones: ['Waystones', ['Walk up to a waystone to attune it. From any attuned stone you can travel to the others.']],
  merchant: ['Wandering merchant', ['Zephyr wanders the Wilds with rare goods from far roads. His wares and prices are his own, not the markets’.']],
  request: ['Request board', ['One villager\'s request each day: bring the item for gold and friendship.']],
  elevator: ['Mine elevator', ['Ride down to any floor you have reached in steps of five.']],
  silo: ['Silo', ['Each silo holds 240 hay. Store hay from your bag or take it out.', 'In winter your animals eat from the silos first.']],
  crate: ['Storage', [
    'Click takes 10, right click takes 1, Shift-click takes all.',
    'Belts pointing into a crate fill it; it pushes its goods onto belts pointing away.']],
  site: ['Build site', [
    'Deliver the materials from your backpack (missing ones are taken from your bank).',
    'Then Hammer: the building rises through foundation, frame, walls and roof. Each stroke costs a little energy, and moving stops the work.',
    'The building hammer can move or remove it; an unfinished site gives everything back, the blueprint too.']],
  artisan: ['Artisan machines', [
    'Put a raw good in and collect the finished one later: keg (wine, ale, mead), jar (jam, pickles), cheese press, loom (cloth), oil press, smoker (smoked fish).',
    'Finished goods sell for well over their input. Belts can load and empty them.']],
  machine: ['Machines', [
    'The window shows input, fuel and output. If it stands idle it says why: no power, no input, output full or no fuel.',
    'Power comes from a windmill, waterwheel, treadwheel, tide mill or ember core within reach; fuel is wood, charcoal or coal.',
    'Belts feed machines and carry their output on. Pick a machine up with the pickaxe; its contents come with it.',
    'Use the next tier\'s piece on a placed one to upgrade it in place.']],
  station: ['Crafting at a station', [
    'Each station has its own recipes: workbench, furnace, anvil, kitchen, tanning rack.',
    '"Can make" shows only what your materials cover; click it to see every recipe. The search and chips filter the list.',
    'Make, ×5, ×10 or ×100 starts a timed batch. Keep the window open or stay close; walking away stops it.',
    'Recipes you don\'t know yet are bought: patterns from smiths, cookbook pages from cooks, item plans from Hale.']],
  bag: ['Backpack', [
    'Your backpack has 28 slots; the top row is your hotbar. Drag items onto the hotbar or off it.',
    'Right click an item for Use, Drop or Sell. Use on another item combines them at a workbench.',
    'Worn gear sits on the left. A full backpack drops extra loot on the ground instead of losing it.']],
  craft: ['Recipe book', ['Every recipe you know and where it is made. Crafting itself happens at the station: a workbench, furnace, anvil, kitchen or tanning rack.']],
  skills: ['Skills', [
    'Life skills go from 1 to 99 and train by doing: farming, mining, fishing, cooking and the rest.',
    'Every 10 levels you pick one of three passives. Higher levels open better nodes, recipes and gear.']],
  tree: ['Passive tree', [
    'Spend combat points (one per combat level above 3) on Might, Precision and Arcana, and life points on the Life branch.',
    'Notables and keystones change how you play; respec at the Ember Altar.']],
  cskills: ['Combat skills', [
    'Blade, Marksman and Arcane trees, five skills each, ranks 1-3. Points come from your Melee, Ranged and Magic levels.',
    'Put learned skills in the Z, X and C slots. Each weapon type keeps its own set.']],
  animals: ['Animals', ['Your animals with their products, age and genes. Buy and breed them at Odile’s.']],
  friends: ['Friends', ['Hearts with every villager. Talk daily and give gifts; birthdays count triple. The next festival and birthdays are listed here.']],
  family: ['Family', [
    'Court a villager or a suitor: dates at 8 hearts, a proposal at 10 with an Ember Pendant and a built cottage.',
    'Children grow from baby to adult and learn the skill you teach them. When you die, your heir carries on with +10% XP per generation.']],
  coll: ['Collections', ['Everything you have shipped, caught, cooked, found and donated.']],
  map: ['Map', ['Your place in the world and the regions. Press and drag to pan, scroll to zoom in the Wilds and regions.', 'Waystones, towns, camps and your tracked quest are marked.']],
  quests: ['Quests', ['Stories first: their chapter, what to do and where. Track one for an arrow over your head.', 'Click a story to read it so far. Town jobs and milestones are listed below.']],
  ency: ['Encyclopedia', ['Every item in the game: what it does, where it comes from and what uses it. Search by name.']],
  opts: ['Options', ['Sound, zoom, art style (pixel or painted), particles, cursor, combat mode, key bindings, saving and loading.']],
};
const HELP_ARTISAN = new Set(['keg', 'jar', 'cheese_press', 'loom', 'oilpress', 'smoker']);
function helpKey() {
  if (!MODAL) return null;
  const t = MODAL.title || '';
  if (t === 'Satchel') return MODAL.opts && MODAL.opts.station && MODAL.opts.station !== 'all' && MODAL.cur === 'craft' ? 'station' : HELP[MODAL.cur] ? MODAL.cur : null;
  if (MODAL.cur === 'mkt') return 'markets';
  const fixed = { 'Market Stall': 'stall', 'Market stall': 'stall', 'Shipping bin': 'bin', 'Farm notices': 'notices', 'Mara\'s General Store': 'mara', 'Brann\'s Smithy': 'brann',
    'Hale\'s Workshop': 'hale', 'The Drowsy Drake': 'tavern', 'Corwin\'s Hut': 'corwin', 'Odile\'s Stables': 'odile', 'Ashcombe Manor': 'manor', 'Emberhollow Museum': 'museum',
    'The Ember Altar': 'altar', 'Waystones': 'waystones', 'Wandering Merchant': 'merchant', 'Request board': 'request', 'Mine elevator': 'elevator', 'Silo': 'silo',
    'Storage Crate': 'crate', 'Crate': 'crate', 'Storage': 'crate', 'Storehouse Ledger': 'crate' };
  if (fixed[t]) return fixed[t];
  if (/ — build site$/.test(t)) return 'site';
  // a town building: the guild, else by the kind of building (inn, hall, bank, forge, shop)
  const act = cur && cur.id.startsWith('in_') ? cur.id.slice(3) : null;
  if (act && typeof GUILDS !== 'undefined' && GUILDS[act]) return 'guild';
  if (act && typeof TOWN_ACTS !== 'undefined' && TOWN_ACTS[act] && t === TOWN_ACTS[act].name) { const ty = actType(act); return ty === 'fish' ? 'shop' : HELP[ty] ? ty : 'shop'; }
  if (cur && cur.region && REGIONS[cur.region]) { const n = REGIONS[cur.region].town.n; if (t === n + ' market') return 'shop'; if (t === n + ' inn') return 'inn'; if (t === n + ' forge') return 'smith'; }
  // a machine window is titled with the machine's name
  const mk = Object.keys(IT).find(k => IT[k].t === 'place' && IT[k].n === t);
  if (mk) return HELP_ARTISAN.has(mk) ? 'artisan' : 'machine';
  return null;
}
function helpOpen(key) {
  helpClose(); const H = HELP[key]; if (!H) return;
  const box = el('div', { id: 'helppop', class: 'f-panel' }, el('div', { class: 'ph' }, el('h2', null, H[0]), el('button', { class: 'btn ghost', 'aria-label': 'Close', on: helpClose }, '✕')),
    ...H[1].map(p => el('p', null, p)));
  document.body.append(box);
}
function helpClose() { const b = document.getElementById('helppop'); if (b) b.remove(); }
drawModal = (f => function () {
  const r = f.apply(this, arguments);
  try {
    const ph = document.querySelector('#modal .ph'); if (!ph) return r;
    let btn = document.getElementById('mhelp');
    if (!btn) { btn = el('button', { id: 'mhelp', class: 'btn ghost', title: 'How this works', 'aria-label': 'How this works' }, 'i'); ph.insertBefore(btn, document.getElementById('mclose')); }
    const key = helpKey(); btn.hidden = !key; btn.onclick = () => { if (document.getElementById('helppop')) helpClose(); else helpOpen(key); };
  } catch (e) { console.error(e); }
  return r;
})(drawModal);
closeModal = (f => function () { helpClose(); return f.apply(this, arguments); })(closeModal);
// Esc closes the guide first, then the window as usual
addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('helppop')) { helpClose(); e.stopImmediatePropagation(); e.preventDefault(); } }, true);
document.head.append(el('style', null, `
#mhelp { width: 30px; min-width: 30px; height: 30px; padding: 0; margin-left: auto; margin-right: 6px; border-radius: 50%; font: italic 700 17px Georgia, serif; line-height: 1; }
#mhelp + #mclose { margin-left: 0; }
#helppop { position: fixed; z-index: 2000; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(460px, calc(100vw - 32px)); max-height: 80vh; overflow: auto; padding: 14px 18px 10px; }
#helppop .ph { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
#helppop .ph h2 { flex: 1; margin: 0; font-size: 20px !important; }
#helppop p { margin: 0 0 9px; line-height: 1.4; }
`));
