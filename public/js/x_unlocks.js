/* ================= Recipe knowledge: patterns, cookbook pages and workshop plans =================
   Only the basics can be made at first: parts, bars, wooden, leather and copper gear, simple meals
   (grilled fish, skewers, bread, salad, omelette), fences, paths, compost and the stations.
   Everything else is learned once by buying it:
     SMITHING PATTERNS, one per gear tier (all its weapons and armour): Brann's smithy for the
       lowland tiers (iron ... starforged), each region's forge for its own metal.
     COOKBOOK PAGES, one per dish: Pip at the tavern; regional dishes at that region's inn.
     WORKSHOP PLANS, one per item (sprinklers, artisan machines, fertilisers, special items): Hale.
   Machines stay gated by the automation tier plans (v_tiers.js). Known recipes are S.known.
   Unknown recipes are left out of station windows and the recipe book, which says where to learn
   more. Saves from before this know every recipe for things they have made or own. */

const BASIC_FOOD = new Set(['grilled_fish', 'mushroom_skewer', 'bread', 'salad', 'omelette', 'sugar', 'butter', 'salt', 'flour']);
const BASIC_TIERS = new Set(['wood', 'leather', 'copper']);
const REGION_DISH = { highland_stew: 'highmarch', edelweiss_tea: 'highmarch', lotus_broth: 'frostmere', lichen_bread: 'frostmere', dragon_chili: 'emberwaste', melon_sorbet: 'emberwaste', pearl_chowder: 'saltreach', saffron_paella: 'saltreach' };
const PATTERN_GOLD = { iron: 800, steel: 2000, silver: 3500, gold: 5000, mythril: 9000, frost: 14000, obsidian: 20000, adamant: 28000, dragon: 40000, star: 60000, cobalt: 12000, tide: 18000, rime: 26000, cinder: 45000 };
const TIER_REGION = { cobalt: 'highmarch', tide: 'saltreach', rime: 'frostmere', cinder: 'emberwaste' };
const WORKSHOP = { lantern: 300, growth_tonic: 600, rich_compost: 900, fire_arrow: 700, sprinkler: 800, beehive: 1200, jar: 1200, keg: 1500, cheese_press: 1500, loom: 1500, smoker: 1500, oilpress: 2000, warp_totem: 1500, staircase: 2500, qsprinkler: 3000, isprinkler: 9000 };
for (const k in WORKSHOP) if (!RC.some(r => r[0] === k)) delete WORKSHOP[k];

const gearTier = r => { const it = IT[r[0]]; return it && (it.t === 'weapon' || it.t === 'armor') && it.tier ? it.tier : null; };
const tierName = tk => (TIERS.find(t => t[0] === tk) || [])[1] || tk;
function recipeKnown(r) {
  if (!S || (typeof SANDBOX !== 'undefined' && SANDBOX) || !S.known) return true;
  const out = r[0];
  if (typeof AUTOTIER !== 'undefined' && AUTOTIER[out]) return true; // machines: automation tiers
  const t = gearTier(r); if (t) return BASIC_TIERS.has(t) || !!S.known['tier:' + t];
  if (r[3] === 'kitchen') return BASIC_FOOD.has(out) || !!S.known[out];
  if (WORKSHOP[out]) return !!S.known[out];
  return true;
}
const _canCraftK = canCraft;
canCraft = function (r, n = 1) { if (!recipeKnown(r)) return 'Recipe not learned yet'; return _canCraftK(r, n); };

/* station windows and the recipe book only list what you know */
const _renderCraftK = renderCraft;
renderCraft = function (b) {
  const all = RC.slice(), hidden = all.filter(r => !recipeKnown(r)).length;
  RC.length = 0; for (const r of all) if (recipeKnown(r)) RC.push(r);
  try { _renderCraftK(b); } finally { RC.length = 0; RC.push(...all); }
  if (hidden) b.append(el('p', { class: 'note' }, hidden + ' more recipes to learn: smithing patterns at Brann\'s and the regional forges, cookbook pages at the tavern and the regional inns, workshop plans at Hale\'s.'));
};

/* new games start with the basics; older saves keep what they've made or carry */
const _newStateK = newState;
newState = function (seed) { const o = _newStateK(seed); o.known = {}; return o; };
function migrateKnown() {
  if (!S || S.known) return;
  S.known = {};
  const owned = new Set(Object.keys(S.inv || {}).map(k => parseK(k)[0]).concat(Object.keys(S.bank || {}).map(k => parseK(k)[0]), Object.values(S.eq || {}).filter(Boolean).map(k => parseK(k)[0]),
    Object.keys((S.stats && S.stats.crafted) || {}), Object.keys((S.stats && S.stats.forged) || {})));
  for (const r of RC) { if (!owned.has(r[0])) continue; const t = gearTier(r); if (t) S.known['tier:' + t] = 1; else S.known[r[0]] = 1; }
}
const _startGameK = startGame;
startGame = function (isNew) { _startGameK(isNew); migrateKnown(); };

/* learning */
function learnRow(key, label, sub, gold, iconId) {
  const known = !!S.known[key];
  return el('div', { class: 'rrow' + (known ? ' done' : '') }, icon(iconId, 32), el('div', { class: 'rtxt' }, el('b', null, label), el('small', null, sub)),
    known ? el('small', { class: 'note' }, 'Learned') : el('button', { class: 'btn' + (S.gold >= gold ? '' : ' off'), on: () => {
      if (S.gold < gold) { toast('Not enough gold.', 'bad'); return; }
      S.gold -= gold; S.known[key] = 1; SFX.lvl(); toast('Learned: ' + label + '.', 'lvl'); refresh();
    } }, gold.toLocaleString() + 'g'));
}
function patternsTab(tiers) {
  return { id: 'patterns', label: 'Patterns', render: b => {
    b.append(el('p', { class: 'note' }, 'A smithing pattern teaches every weapon and piece of armour of one metal. You still need the Smithing level and the materials.'));
    const L = el('div', { class: 'list' });
    for (const tk of tiers) {
      const items = RC.filter(r => gearTier(r) === tk), sw = items.find(r => /_sword$/.test(r[0])) || items[0]; if (!items.length) continue;
      L.append(learnRow('tier:' + tk, tierName(tk) + ' smithing pattern', items.length + ' recipes: ' + items.slice(0, 6).map(r => IT[r[0]].n).join(', ') + (items.length > 6 ? '…' : ''), PATTERN_GOLD[tk], sw[0]));
    }
    b.append(L);
  } };
}
function cookbookTab(dishes, intro) {
  return { id: 'cookbook', label: 'Cookbook', render: b => {
    b.append(el('p', { class: 'note' }, intro));
    const L = el('div', { class: 'list' });
    for (const k of dishes) { const r = RC.find(r => r[0] === k); if (!r) continue;
      L.append(learnRow(k, IT[k].n, 'Needs ' + Object.entries(r[2]).map(([i, n]) => n + ' ' + (i[0] === '$' ? CATN[i] : IT[i].n)).join(', ') + '.', Math.max(150, Math.round(IT[k].p * 2.5 / 50) * 50), k)); }
    b.append(L);
  } };
}
const workshopTab = { id: 'wplans', label: 'Item plans', render: b => {
  b.append(el('p', { class: 'note' }, 'Plans for the workbench: sprinklers, artisan machines, fertilisers and special items.'));
  const L = el('div', { class: 'list' });
  for (const k in WORKSHOP) { const r = RC.find(r => r[0] === k);
    L.append(learnRow(k, IT[k].n + ' plan', (IT[k].desc ? IT[k].desc + ' ' : '') + 'Needs ' + Object.entries(r[2]).map(([i, n]) => n + ' ' + (i[0] === '$' ? CATN[i] : IT[i].n)).join(', ') + '.', WORKSHOP[k], k)); }
  b.append(L);
} };
const _openModalK = openModal;
openModal = function (title, tabs, start, opts) {
  if (S && !TITLE && S.known) {
    const lowTiers = TIERS.map(t => t[0]).filter(tk => !BASIC_TIERS.has(tk) && !TIER_REGION[tk] && PATTERN_GOLD[tk]);
    const pip = RC.filter(r => r[3] === 'kitchen' && IT[r[0]].t === 'food' && !BASIC_FOOD.has(r[0]) && !REGION_DISH[r[0]]).map(r => r[0]);
    if (title === 'Brann\'s Smithy') tabs = tabs.concat([patternsTab(lowTiers)]);
    else if (title === 'The Drowsy Drake') tabs = tabs.concat([cookbookTab(pip, 'Pip will write down any dish for a price. You still need the ingredients and a kitchen.')]);
    else if (title === 'Hale\'s Workshop') tabs = tabs.concat([workshopTab]);
    else if (cur && cur.region && / forge$/.test(title)) tabs = tabs.concat([patternsTab(Object.keys(TIER_REGION).filter(tk => TIER_REGION[tk] === cur.region))]);
    else if (cur && cur.region && / inn$/.test(title)) tabs = tabs.concat([cookbookTab(Object.keys(REGION_DISH).filter(k => REGION_DISH[k] === cur.region), 'The cook shares the local dishes with paying guests.')]);
  }
  return _openModalK(title, tabs, start, opts);
};
