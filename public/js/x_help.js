/* Feature guides (asked 2026-11-03): every window that has a guide gets an "i" button in its title bar, next to the close
   button. It opens a short popup on what the feature is and how to use it. `helpKey()` works out which guide fits the
   window that's open (by its title, the Satchel tab, the station, the town building or the machine), `HELP` holds the
   texts. Add a guide by adding an entry to `HELP` and, if the window's title isn't fixed, a line to `helpKey`. */
const HELP = {
  stall: ['Market stall', [
    'Put goods out from your backpack. They sell from 8:00 to 18:00 while you work elsewhere, faster at weekends.',
    'Set each price with − and +, against what the village pays today; there is no top limit (the steps grow as the price rises). To villagers 70% always sells, 100% about half the time, 130% now and then, 160% hardly ever, and above double no villager buys.',
    'Passers-by are villagers, so they compare your price with the village price.',
    'A travelling trader may call three times a day: at 9:00, 13:00 and 17:00. He buys anything some town pays more for than your price, after his 15% cut. Towns that are badly short can pay two or three times the usual price.',
    'Market news: hire Odo Fenn for a month (400g) to get the trade news, every town’s market (click a town for its full lists), and on each row the best town and the most a trader would pay, with a Trader price button that sets your price to it.',
    'With market news hired, tick "Match the trader price every day" and every good on display is set to the most a trader would pay each morning, after the markets move; goods you put out later are priced at once, and a − / + change holds until the next morning.',
    'Take back returns unsold goods to your backpack.',
    'Buy orders: name an item, your top price and how many. The same traders buy it in a town whose shop sells it under your price and bring it on one of those visits; you pay when it arrives, and it waits in the stall until you take it.',
    'The Log tab lists every sale and every delivered order of the last year, by day, with totals.']],
  bin: ['Shipping bin', [
    'Anything in the bin is sold overnight, wherever you are.',
    'It always pays a fixed 80% of the base price: no markets, no gluts.',
    'Selling in person at a shop usually pays more, unless that market has a glut of the good.',
    'Take 1 or Take all gives back what you put in before the night.']],
  notices: ['Notice boards', [
    'Today: the weather, festivals coming up, birthdays and the day\'s request.']],
  markets: ['Markets', [
    'Every town keeps a stock of each trade good and wants a certain stock of it, which changes from day to day. With less than it wants a good costs more, with more it costs less; there is no limit either way.',
    'Each day every good is made in only one or two towns, most often where it is the trade (Greyhelm ore, Saltmere fish and salt, Ashford timber), and every town uses up what it needs. Selling lowers the price there unit by unit; buying raises it.',
    'Click a town for everything it is short of and has plenty of, with its stock against the stock it wants. This news comes from Odo Fenn, hired at your market stall by the month.',
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
    'The Job board appears where the town has no hall.']],
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
    'Drag stacks between your backpack and the input, fuel and output slots, or click them. Move sets how many (Shift: half, Ctrl: one). Drag wood onto Fuel to burn it in a kiln.',
    'Make: pick one recipe and the machine only takes and makes that one, from belts too. Any lets it choose.',
    'Power comes from a windmill, waterwheel, treadwheel, tide mill or ember core within reach; fuel is wood, charcoal or coal.',
    'Belts feed machines and carry their output on. Pick a machine up with the pickaxe; its contents come with it.',
    'Use the next tier\'s piece on a placed one to upgrade it in place.']],
  station: ['Crafting at a station', [
    'Each station has its own recipes: workbench, furnace, anvil, kitchen, tanning rack.',
    'Once you’ve built a Storage Shed, recipes use your bank too: the backpack first, then the bank.',
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
  if (act && typeof GUILDS !== 'undefined' && GUILDS[act]) return 'g:' + act;
  if (act && typeof TOWN_ACTS !== 'undefined' && TOWN_ACTS[act] && t === TOWN_ACTS[act].name) return 't:' + act;
  if (cur && cur.region && REGIONS[cur.region]) { const n = REGIONS[cur.region].town.n; if (t === n + ' market') return 'shop'; if (t === n + ' inn') return 'inn'; if (t === n + ' forge') return 'smith'; }
  // a machine window is titled with the machine's name
  const mk = Object.keys(IT).find(k => IT[k].t === 'place' && IT[k].n === t);
  if (mk) return HELP_ARTISAN.has(mk) ? 'artisan' : typeof BELTS !== 'undefined' && BELTS.has(mk) ? 'b:' + mk : 'm:' + mk;
  if (t === 'Home') return 'home';
  if (t === 'Royal Bedchamber') return 'bedchamber';
  if (t === 'Farewell') return 'farewell';
  if (t === 'Trip Hammer') return 'm:triphammer';
  const tab = MODAL.tabs && MODAL.tabs[0] ? MODAL.tabs[0].label : '';
  if (tab === 'Building') return 'hammer';
  if (tab === 'The story so far') return 'recap';
  if (typeof SHRINES !== 'undefined') for (const bio in SHRINES) if (SHRINES[bio].n === t) return 'shrine:' + bio;
  if (typeof FEST !== 'undefined' && Object.values(FEST).some(F => F.n === t)) return 'fest:' + t;
  if (typeof REGIONS !== 'undefined' && Object.values(REGIONS).some(R => R.dg && R.dg.n === t)) return 'dungeon';
  if (S && S.fam && (S.fam.kids || []).some(k => k.name === t)) return 'child';
  return null;
}
function helpOpen(key) {
  helpClose(); let H = HELP[key]; if (!H) try { H = helpGen(key); } catch (e) { console.error(e); } if (!H) return;
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

/* ---- guides written from the game's own data (2026-11-05): each machine, belt, town building and guild gets its own,
   so the numbers stay true when recipes, fuel or ranks change ---- */
const helpS = t => { const s = Math.round(t * 6) / 10; return (s % 1 ? s.toFixed(1) : s) + ' s'; };
const helpN = (id, n) => n + ' ' + (IT[id] ? IT[id].n.toLowerCase() : id);
const helpList = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const HELP_TIER = ['', 'hand-built (tier 1)', 'iron (tier 2)', 'cobalt (tier 3)', 'tide and rime (tier 4)', 'ember (tier 5)'];
const HELP_POWER = 'Power comes from a treadwheel (5 tiles, while it has hay), windmill (7), waterwheel (9, touching water), tide mill (13) or ember core (18) within reach.';
const HELP_HOW = [
  'Drag stacks between your backpack and the input, fuel and output slots, or click them. Move sets how many (Shift: half, Ctrl: one).',
  'Make: pick one recipe and the machine only takes and makes that one, from belts too. Any lets it choose. A belt pointing in loads it; a belt pointing away takes what it made.',
  'It keeps working while you’re away, even off the farm, and overnight. The window counts what it has made. Pick it up with the pickaxe: its contents come with it.'];
const HELP_MACH = {
  treadwheel: ['Treadwheel', ['Powers every machine and belt within 5 tiles while it runs. It eats 1 hay every 20 ticks (12 s); put hay in its slot, or lead a belt of hay into it.', 'A silo or the Storage Shed can feed it by a pulling belt. When the hay runs out, everything it powered stops and says “no power”.']],
  windmill: ['Windmill', ['Powers machines and belts within 7 tiles, always, with no fuel.']],
  waterwheel: ['Waterwheel', ['Powers machines and belts within 9 tiles, but only while it touches water. Use a tide mill on it to upgrade it (13 tiles).']],
  tidemill: ['Tide mill', ['Powers everything within 13 tiles while it touches water. Inspect says whether it’s running.']],
  embercore: ['Ember core', ['Powers everything within 18 tiles, always, with no fuel. The strongest power source.']],
  seedhopper: ['Seed Hopper', ['Every morning it sows its seeds into empty tilled soil within 3 tiles: in-season seeds only, one seed a tile. Load it with seeds by hand or by belt.', 'Use an Ember Golem on it to upgrade it in place; the seeds stay.']],
  golem: ['Ember Golem', ['Every morning it harvests, waters and replants everything within 6 tiles, using the seeds you load into it.', 'The harvest goes onto a belt leading away, or waits inside for you.']],
  reaper: ['Reaper', ['While powered it cuts one ripe crop within 3 tiles every tick (0.6 s), and the rest overnight.', 'Crops go onto a belt leading away, or wait inside.']],
};
const HELP_BELT = {
  conveyor: 'Moves one tile every tick (0.6 s) and needs power.',
  chute: 'Hand-built: needs no power but moves only every other tick (one tile per 1.2 s). Use a Conveyor on it to upgrade it.',
  fastbelt: 'Moves two tiles every tick and needs power. Use a Rune Belt on it to upgrade it.',
  runebelt: 'Moves three tiles every tick and needs no power: the fastest belt.',
  sorter: 'Needs power. Interact holding an item to set its filter: that item goes straight on, everything else turns right.',
  splitter: 'Needs power. It alternates straight and right, or follows its settings: how many of every N go straight, left and right, and chosen items sent a set way (they wait until that way is free).',
  merger: 'Takes from its back and both sides strictly in turn and sends everything out the front, so a full line shares evenly; a plain belt lets one input win. Switch sides off in its window.',
};
function helpMachine(k) {
  if (HELP_MACH[k]) return HELP_MACH[k];
  const st = STATIONS[k]; if (!st) return HELP.machine;
  const it = IT[k] || { n: k }, mult = st.mult || 1, yl = st.yield || 1, ps = [];
  const rec = (st.recipes || []).filter(r => IT[r.out[0]]);
  if (st.desc && rec.length > 8) ps.push(st.desc + ' (' + helpS(Math.max(1, Math.round(rec[0].ticks * mult))) + ' each).');
  else if (rec.length) ps.push('Makes: ' + rec.map(r => helpList(Object.entries(r.in).filter(([i]) => IT[i]).map(([i, n]) => helpN(i, n))) + ' → ' + helpN(r.out[0], r.out[1] * yl) + ' (' + helpS(Math.max(1, Math.round(r.ticks * mult))) + ')').join('; ') + '.');
  if (k === 'triphammer' || k === 'powerhammer') ps.push('Set it up with any anvil recipe you know; it smiths that from the bars and parts put in, ' + (k === 'powerhammer' ? 'twice as fast as a trip hammer' : 'one at a time') + '. It needs power.');
  if (mult !== 1) ps.push(mult < 1 ? 'Works ' + Math.round(1 / mult * 10) / 10 + '× as fast as the standard machine.' : 'A hand-built piece: slower than the iron one (' + mult + '× the time).');
  if (st.fuel) ps.push('Burns fuel while it works: wood ' + helpS(FUEL.wood * (st.fuelx || 1)) + ', hardwood ' + helpS(FUEL.hardwood * (st.fuelx || 1)) + ', charcoal ' + helpS(FUEL.charcoal * (st.fuelx || 1)) + ', coal ' + helpS(FUEL.coal * (st.fuelx || 1)) + ' each' + (st.fuelx ? ' (fuel lasts ' + st.fuelx + '× as long here)' : '') + '. The fuel bar shows how long the fire in it and the fuel in the slot will last. Belts load inputs first, then fuel.');
  else if (k === 'emberforge') ps.push('Needs no fuel and no power.');
  if (st.power) ps.push(HELP_POWER);
  const sk = typeof STATION_SKILL !== 'undefined' && STATION_SKILL[k];
  if (sk) ps.push('Everything it makes gives you ' + (SKN[sk] || sk) + ' XP, at a share of what making it by hand gives.');
  const tr = typeof AUTOTIER !== 'undefined' && AUTOTIER[k], nx = typeof UPG !== 'undefined' && UPG[k];
  if (tr || nx) ps.push((tr ? 'Automation tier: ' + HELP_TIER[tr] + '. ' : '') + (nx && IT[nx] ? 'Use a ' + IT[nx].n + ' on it to upgrade it in place; what’s inside is kept.' : ''));
  return [it.n, ps.concat(HELP_HOW)];
}
const HELP_TOWN = {
  kb_market: 'Wynna sells seeds and saplings for every season and buys crops, fruit, artisan goods, animal products and food, paying 5% over the market for goods she doesn’t sell herself.',
  kb_smith: 'Garrick sells copper to gold bars and iron and steel arms, and buys bars, ore, weapons and armour.',
  gh_forge: 'Borek sells iron, steel and cobalt bars, hammers, daggers and plate, and buys bars, ore, weapons and armour. Cobalt patterns are bought here.',
  gh_supply: 'Coal, ore, stone and lanterns for miners. It buys ore, gems and materials, paying 10% over the market for what it doesn’t sell itself.',
  af_trader: 'Wood, hardwood, sap, fruit saplings and wild mushrooms. It buys forage and materials.',
  af_saw: 'Wood, hardwood, fences, workbenches and paths. The sawmill buys timber, paying 15% over the market.',
  sm_fish: 'Finn sells sea fish, clams, kelp, crab traps and the harpoon, and buys fish, paying 15% over the market for kinds he doesn’t sell.',
  sm_chandler: 'Salt, fibre, lanterns, canoes, crab traps and kelp. Perrin buys monster loot and forage. The Shipwright tab builds the sailboat to the isles.',
  kb_bank: 'Kingsbridge Bank opens the same bank as your Storage Shed and Mara’s chest.',
  kb_temple: 'The Temple of the Ember gives one blessing a day.',
  kb_barracks: 'Captain Vey’s barracks: the patrol job sends knights along the roads with you, a squad every 10 s while it’s on, and kills with a knight near count for the job.',
};
function helpTown(act) {
  const T = TOWN_ACTS[act], ty = actType(act), base = HELP[ty === 'fish' ? 'shop' : HELP[ty] ? ty : 'shop'], ps = [];
  if (HELP_TOWN[act]) ps.push(HELP_TOWN[act]);
  if (ty === 'inn' && typeof mealsAt !== 'undefined' && mealsAt[T.town]) ps.push('Cooked here: ' + helpList(mealsAt[T.town].filter(k => IT[k]).map(k => IT[k].n)) + '. At 6 hearts with the keeper, the rest is free.');
  if (ty === 'shop' || ty === 'fish') ps.push('Town shops charge 1.25× the market price (1.15× at 50 standing). Selling a stack lowers the price unit by unit, and what you sell adds to this town’s stock.');
  return [T.name, ps.concat(base[1])];
}
function helpGuild(act) {
  const G = GUILDS[act], ps = [];
  if (G.blurb) ps.push(G.blurb);
  ps.push('Joining costs ' + G.fee + 'g. Five ranks: ' + G.ranks.map(r => r.title).join(', ') + '. Each rank’s tasks are listed in the Ranks tab; bring goods are taken when you’re promoted.');
  const hands = typeof HIRE !== 'undefined' ? Object.values(HIRE).filter(h => h.g === act).map(h => h.n.toLowerCase()) : [];
  if (hands.length) ps.push('Members can hire a ' + helpList(hands) + ' at the farm notice board. Each rank opens the next level of hand (up to 4) and adds 5% to what they bring.');
  if (G.store && G.store.length) ps.push('Guild store: ' + helpList(G.store.filter(s => IT[s[0]]).map(s => IT[s[0]].n + ' (rank ' + s[2] + ')')) + '.');
  if (act === 'gh_guild') ps.push('From Hewer, the Guild Seam in Greyhelm’s north-east corner is yours to mine: a cave thick with ore, rebuilt every day and full on your first visit of the day.');
  ps.push('Choose the title you go by in the Titles tab; guildmasters greet you by it.');
  return [G.name, ps];
}
function helpGen(key) {
  const [a, b] = key.split(/:(.*)/);
  if (a === 'm') return helpMachine(b);
  if (a === 'b') return [IT[b] ? IT[b].n : 'Belt', [HELP_BELT[b] || ''].concat(HELP.belt ? HELP.belt[1].slice(1) : [])];
  if (a === 't' && TOWN_ACTS[b]) return helpTown(b);
  if (a === 'g' && GUILDS[b]) return helpGuild(b);
  if (a === 'shrine') { const D = SHRINES[b]; return [D.n, ['Each of the Wilds’ four shrines asks for an offering: ' + helpList(Object.entries(D.need).map(([k, n]) => helpN(k, n))) + '.', 'Give it once and its blessing is yours for good: ' + D.desc + '.', 'The items are taken from your backpack.']]; }
  if (a === 'fest') { const F = Object.values(FEST).find(F => F.n === b); return [F.n, [F.desc, 'Shops close for the day (the tavern stays open) and everyone gathers in the plaza from 9:00. Talk to any villager there for the festival’s activity.']]; }
  return null;
}
Object.assign(HELP, {
  home: ['Home', ['Sleep until morning ends the day: crops grow, machines catch up overnight, the morning report comes, and the game saves.', 'Go to bed before 4:00. Past it you pass out where you stand and wake with less energy.', 'Once the cottage is built you wake beside your bed; the tent is only for the first weeks.']],
  bedchamber: ['Royal Bedchamber', ['Your bed in Briarholt’s keep. Sleeping here ends the day like your farm bed, and you wake in the keep.', 'Any day that ends in the castle grounds wakes you here.']],
  farewell: ['Farewell', ['Your life ends here. Choose your heir: your spouse or a grown child.', 'They keep the farm, gold, buildings, land and items, all titles and guild ranks, and take their own skills on; each generation adds 10% to all XP. The others in the family go their own ways.']],
  hammer: ['Building hammer', ['Move lifts the building and lets you set it down anywhere it fits on the farm (right click or Esc puts it back).', 'Remove takes it down: a finished building gives back half its materials, an unfinished site everything delivered and its blueprint.']],
  recap: ['The story so far', ['Every chapter reached, each finished step with what was said, and what to do now.', 'Track a story in the Quests tab for an arrow to the next place.']],
  dungeon: ['Region dungeon', ['Five floors, rebuilt every visit. The boss and a tier-6 chest wait on floor 5.', 'Once you’ve reached floor 3 or 5 you can start there.']],
  child: ['Your child', ['Babies grow into children at 4, teens at 13 and adults at 18 (5 years a game year).', 'Children bring forage now and then. Teens learn the skill you pick here: each day 2% of your XP in it. Grown children do chores and can inherit the farm.']],
});
HELP.notices = ['Notice boards', [
  'Today: the weather, festivals coming up, birthdays and the day’s request.',
  'Hire: hired hands from your guilds (see their own guide in that tab). Seeds: the Seed book of your crop strains.']];
