/* ================= Encyclopedia (U, or the Encyclopedia tab) =================
   Every item in the game by category (resources, ingredients, food, weapons, armour, rings,
   seeds, machines and placeables, other), with a search box. Clicking an item shows its card:
   what it is, its stats or effects, where it comes from (made at a station, grown, caught,
   foraged, mined, dropped by which creatures, sold in shops) and what it's used in.
   Items you've never owned are shown dimmed but still readable. Also: the satchel window is
   wider, and its tab row scrolls sideways with the mouse wheel. */

const ENCY_CAT = [
  ['res', 'Resources', it => ['ore', 'bar', 'mat', 'gem', 'loot'].includes(it.t)],
  ['ing', 'Ingredients', it => ['crop', 'fruit', 'fish', 'animal', 'artisan', 'forage', 'feed'].includes(it.t)],
  ['food', 'Food', it => it.t === 'food'],
  ['weapon', 'Weapons', it => it.t === 'weapon' || it.t === 'ammo'],
  ['armor', 'Armour', it => it.t === 'armor'],
  ['ring', 'Rings', it => it.t === 'ring'],
  ['seed', 'Seeds & saplings', it => it.t === 'seed' || it.t === 'sapling'],
  ['place', 'Machines & placeables', it => ['place', 'implement', 'path', 'fert', 'blueprint'].includes(it.t)],
  ['other', 'Other', () => true],
];
const encyCat = it => (ENCY_CAT.find(([, , f]) => f(it)) || ENCY_CAT[ENCY_CAT.length - 1])[0];
const SEASON_N = ['Spring', 'Summer', 'Autumn', 'Winter'];
let ENCY = { cat: 'res', q: '', sel: null };
const everOwned = id => S && ((S.inv && Object.keys(S.inv).some(k => parseK(k)[0] === id)) || (S.bank && Object.keys(S.bank).some(k => parseK(k)[0] === id)) ||
  (S.stats && ((S.stats.shipped || {})[id] || (S.stats.crafted || {})[id] || (S.stats.forged || {})[id] || (S.stats.caught || {})[id])) || Object.values(S.eq || {}).some(k => k && parseK(k)[0] === id));
const nm = k => k[0] === '$' ? CATN[k] : (IT[k] ? IT[k].n : k);

function encySources(id) {
  const it = IT[id], out = [];
  for (const r of RC.filter(r => r[0] === id)) out.push('Made at a ' + (STATION_N[r[3]] || r[3]).toLowerCase() + (r[1] > 1 ? ' (' + r[1] + ' at a time)' : '') + ' from ' + Object.entries(r[2]).map(([k, n]) => n + ' ' + nm(k)).join(', ') + (typeof recipeKnown === 'function' && !recipeKnown(r) ? ' (recipe not learned yet)' : '') + '.');
  if (CROPS[id]) out.push('Grown from ' + IT[id + '_seed'].n.toLowerCase() + ' in ' + CROPS[id].s.map(s => SEASON_N[s]).join(', ').toLowerCase() + ' (' + CROPS[id].d + ' days' + (CROPS[id].re ? ', then every ' + CROPS[id].re : '') + ').');
  for (const k of Object.getOwnPropertyNames(CROPS)) { const C = CROPS[k]; if (C.as && C.as[0] === id) out.push('Harvested from ' + C.n.toLowerCase() + ' (' + C.as[1] + '–' + C.as[2] + ' each).'); }
  if (it.t === 'seed' && it.crop && CROPS[it.crop]) out.push('Grows into ' + (CROPS[it.crop].as ? IT[CROPS[it.crop].as[0]].n.toLowerCase() : CROPS[it.crop].n.toLowerCase()) + ' in ' + CROPS[it.crop].s.map(s => SEASON_N[s]).join(', ').toLowerCase() + '.' + (CROPS[it.crop].secret ? ' Sold only in its region\'s market.' : ' Sold at Mara\'s store in season.'));
  if (it.t === 'fish') out.push('Caught by fishing.');
  if (it.t === 'forage') out.push('Foraged in the wild.');
  if (it.t === 'ore' || it.t === 'gem') out.push('Mined from rocks and ore veins.');
  if (/_log$|^wood$|^hardwood$/.test(id)) out.push('Chopped from trees.');
  if (it.t === 'animal') out.push('Produced by your animals.');
  if (it.t === 'artisan') out.push('Made in an artisan machine (keg, jar, cheese press, loom, oil press or smoker).');
  const drops = Object.keys(EN).filter(k => (EN[k].drops || []).some(d => d[0] === id)).map(k => EN[k].n);
  if (drops.length) out.push('Dropped by ' + drops.slice(0, 8).join(', ') + (drops.length > 8 ? ' and ' + (drops.length - 8) + ' more' : '') + '.');
  if (it.t === 'weapon' || it.t === 'armor') { const tk = it.tier; if (tk && typeof BASIC_TIERS !== 'undefined' && !BASIC_TIERS.has(tk) && PATTERN_GOLD[tk]) out.push('Needs the ' + tierName(tk).toLowerCase() + ' smithing pattern (' + (TIER_REGION[tk] ? 'the ' + TIER_REGION[tk][0].toUpperCase() + TIER_REGION[tk].slice(1) + ' forge' : 'Brann\'s smithy') + ').'); }
  if (!out.length) out.push('Found while exploring, in chests, or from quests and shops.');
  return out;
}
function encyUses(id) {
  const uses = RC.filter(r => Object.keys(r[2]).some(k => k === id || (k[0] === '$' && CATF[k] && CATF[k](id))));
  return [...new Set(uses.map(r => IT[r[0]].n))];
}

function encyCard(id) {
  const it = IT[id], box = el('div', { class: 'encycard f-panel' });
  const c = icon(id, 48); box.append(el('div', { class: 'acts' }, c, el('div', null, el('h3', { style: 'margin:0' }, it.n), el('small', { class: 'note' }, ENCY_CAT.find(x => x[0] === encyCat(it))[1] + (it.tier ? ' · ' + tierName(it.tier) : '')))));
  const d = typeof itemDesc === 'function' ? itemDesc(id) : ''; if (d) box.append(el('p', null, typeof d === 'string' ? d : ''));
  if (it.desc && !(typeof d === 'string' && d.includes(it.desc))) box.append(el('p', null, it.desc));
  box.append(el('h4', null, 'Where it comes from')); const ul = el('ul'); encySources(id).forEach(s => ul.append(el('li', null, s))); box.append(ul);
  const uses = encyUses(id); if (uses.length) { box.append(el('h4', null, 'Used in (' + uses.length + ')')); box.append(el('p', { class: 'note' }, uses.slice(0, 30).join(', ') + (uses.length > 30 ? '…' : ''))); }
  return box;
}
function renderEncy(b) {
  const q = el('input', { type: 'search', placeholder: 'Search…', value: ENCY.q }); q.style.cssText = 'width:200px;padding:4px 8px';
  q.oninput = () => { ENCY.q = q.value; const p = q.selectionStart; refresh(); const n = document.querySelector('#modal input[type=search]'); if (n) { n.focus(); n.setSelectionRange(p, p); } };
  const chips = el('div', { class: 'chips' }, q, ...ENCY_CAT.map(([k, n]) => el('button', { class: 'chip' + (ENCY.cat === k && !ENCY.q ? ' on' : ''), on: () => { ENCY.cat = k; ENCY.q = ''; refresh(); } }, n)));
  b.append(chips);
  const ql = ENCY.q.toLowerCase(), ids = Object.keys(IT).filter(id => { const it = IT[id]; if (!it || !it.n || it.t === 'special' && /^\$/.test(id)) return false; return ql ? it.n.toLowerCase().includes(ql) : encyCat(it) === ENCY.cat; }).sort((a, b) => IT[a].n.localeCompare(IT[b].n));
  const wrap = el('div', { class: 'encywrap' }), grid = el('div', { class: 'encygrid' });
  for (const id of ids) { const cell = el('button', { class: 'encycell slot f-slot' + (ENCY.sel === id ? ' on' : '') + (everOwned(id) ? '' : ' dim'), title: IT[id].n, on: () => { ENCY.sel = id; refresh(); } }, icon(id, 32)); grid.append(cell); }
  if (!ENCY.sel || !IT[ENCY.sel] || !ids.includes(ENCY.sel)) ENCY.sel = ids[0] || null;
  wrap.append(grid, ENCY.sel ? encyCard(ENCY.sel) : el('p', { class: 'note' }, 'Nothing matches.'));
  b.append(el('p', { class: 'note' }, ids.length + ' entries. Dimmed ones you haven\'t owned yet.'), wrap);
}
const _openModalE = openModal;
openModal = function (title, tabs, start, opts) {
  if (title === 'Satchel' && !tabs.some(t => t.id === 'ency')) { const i = tabs.findIndex(t => t.id === 'opts'); tabs = tabs.slice(); tabs.splice(i < 0 ? tabs.length : i, 0, { id: 'ency', label: 'Encyclopedia', render: renderEncy }); }
  const r = _openModalE(title, tabs, start, opts);
  const bar = document.getElementById('mtabs'); if (bar && !bar._wheel) { bar._wheel = 1; bar.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { bar.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false }); }
  return r;
};
MENU_KEYS.u = 'ency'; TAB_KEY.ency = 'U';
ACTIONS.splice(ACTIONS.findIndex(a => a[0] === 'help'), 0, ['ency', 'Encyclopedia', 'u']); buildKeymap();
