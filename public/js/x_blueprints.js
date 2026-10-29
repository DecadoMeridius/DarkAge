/* ================= Blueprints as items, the silo, field seeds, waking at home =================
   BLUEPRINTS: buying a building from Hale now buys its PLANS (S.blue[k], kept for good). A plan
   adds a recipe to the workbench: "<Building> Blueprint" for 1 wood and 1 fibre. Use the
   blueprint from the hotbar or backpack on the farm: the green/red ghost appears, left click
   places a build site (the blueprint is used up), right click or Esc cancels and keeps it.
   Wells, storage sheds and silos can be built as often as you like; the cottage, coop, barn,
   stable and market stall once each (one blueprint at a time).
   SILO: a real building now (3x4, bld_silo_3x4). Each silo stores 240 hay; nothing goes in on its own:
   interact to store hay from your bag or take it out. Animals eat from the silos first in winter. It is
   no longer an instant upgrade in Hale's list; a silo bought that way in an older save (no building)
   becomes free silo plans, and any hay it held is put in your bag (or the bank).
   FIELD SEEDS (Mara's Pantry tab): Meadow Grass (spring to autumn, regrows, harvests into hay) and
   Flax (spring and summer, harvests into fibre). They aren't counted as crops in Collections.
   HOME: once the cottage is built you wake up next to your bed, and a game loaded on the farm's
   default spot starts there too. The tent is packed away when the cottage is finished. */

BP.silo = { n: 'Silo', kind: 'silo', act: 'silo', w: 3, h: 4, gold: 1500, cost: { stone: 100, wood: 60, copper_bar: 5 }, work: 40, desc: 'Stores 240 hay from cut grass for the winter. Build as many as you need.' };
const BP_MULTI = new Set(['shed', 'well', 'silo']);
DOORL.silo = 'Silo';
for (const k in BP) {
  I('bp_' + k, BP[k].n + ' Blueprint', 'blueprint', 1, 'scroll', '#e8d8a8', '#8a5a34', { bp: k, desc: 'Use it on your farm to place a ' + BP[k].n.toLowerCase() + ' build site.' });
  RC.push(['bp_' + k, 1, { wood: 1, fiber: 1 }, 'bench']);
}
const bpSingleTaken = k => !BP_MULTI.has(k) && (S.structures.some(s => s.k === k) || cnt('bp_' + k) > 0 || (S.bank && Object.keys(S.bank).some(i => i === 'bp_' + k && S.bank[i] > 0)));

const _recipeKnownBP = recipeKnown;
recipeKnown = function (r) { if (r[0].startsWith('bp_') && S && !SANDBOX) return !!(S.blue && S.blue[r[0].slice(3)]); return _recipeKnownBP(r); };
const _canCraftBP = canCraft;
canCraft = function (r, n = 1) { if (r[0].startsWith('bp_') && S && bpSingleTaken(r[0].slice(3))) return 'You only need one ' + BP[r[0].slice(3)].n.toLowerCase(); return _canCraftBP(r, n); };

/* placing from the item */
let BP_ITEM = null;
const _useItemBP = useItem;
useItem = function (id) {
  const it = IT[id];
  if (it && it.t === 'blueprint' && has(id)) {
    const k = it.bp;
    if (cur.id !== 'farm') { toast('Blueprints are placed on your farm.'); return; }
    if (!BP_MULTI.has(k) && S.structures.some(s => s.k === k)) { toast('You already have a ' + BP[k].n.toLowerCase() + '.'); return; }
    BP_ITEM = id; startPlacing(k); return;
  }
  return _useItemBP(id);
};
const _placeNowBP = placeNow;
placeNow = function () {
  const k = PLACING, n = S.structures.length, known = S.blue[k];
  _placeNowBP();
  if (known) S.blue[k] = known; // plans are kept; the blueprint item is what gets used up
  if (S.structures.length > n && BP_ITEM) { take(BP_ITEM, 1); BP_ITEM = null; }
};
const _interactBP = interact;
interact = function () { if (PLACING) BP_ITEM = null; return _interactBP(); };

/* Hale: plans instead of placing */
const _renderBuildBP = renderBuild;
renderBuild = function (b) {
  const silo = BUILD.silo; delete BUILD.silo; // the silo is a building site now, not an instant upgrade
  try { _renderBuildBP(b); } finally { if (silo) BUILD.silo = silo; }
  const note = b.querySelector('p.note'); if (note) note.textContent = 'Buy a building\'s plans once. Then make its blueprint at a workbench (1 wood, 1 fibre), use it on your farm to place the site, deliver the materials and hammer it up. Wells, sheds and silos can be built again and again. Construction level ' + lifeL('construction') + '.';
  b.querySelectorAll('.list .rrow button.btn').forEach(btn => {
    if (btn.textContent === 'Place') btn.replaceWith(el('small', { class: 'note' }, 'Plans known: make the blueprint at a workbench'));
    else if (/^Buy \d/.test(btn.textContent)) btn.textContent = 'Buy plans ' + btn.textContent.slice(4);
  });
};

/* the silo */
const siloCount = () => S.structures.filter(s => s.k === 'silo' && s.stage >= 4).length;
function siloSync() { // only built silos count; a silo bought the old way (no building) becomes free plans, and its hay comes back
  if (!S || !S.structures) return;
  if (S.siloOld) { S.blue.silo = 1; delete S.siloOld; }
  if (S.build.silo > 0 && !siloCount()) S.blue.silo = 1;
  S.build.silo = siloCount();
  if (!S.build.silo && S.silo > 0) { const n = S.silo; S.silo = 0; GIVE_NO_DROP = true; const left = give('hay', n) || 0; GIVE_NO_DROP = false; if (left) S.bank.hay = (S.bank.hay || 0) + left; toast(n + ' hay from the old silo store was put in your ' + (left ? 'bag and bank' : 'bag') + '.'); }
}
const _finishSiteBP = finishSite;
finishSite = function (b) { const k = b.struct && b.struct.k; _finishSiteBP(b); if (k === 'silo') { siloSync(); toast('Store hay in it from your bag; animals eat from it in winter.'); } };
function openSilo() {
  siloSync(); const cap = 240 * S.build.silo;
  openModal('Silo', [{ id: 's', label: 'Hay', render: b => {
    b.append(el('p', { class: 'note' }, 'Your silos hold ' + S.silo + ' / ' + cap + ' hay. Store hay from your bag here; animals eat from the silos first in winter.'));
    const sb = el('div', { class: 'sbar' }, el('i', { style: 'width:' + Math.round(S.silo / Math.max(1, cap) * 100) + '%' })); b.append(sb);
    const mv = (n, out) => { if (out) { n = Math.min(n, S.silo); if (n <= 0) return; const left = give('hay', n) || 0; S.silo -= n - left; } else { n = Math.min(n, cnt('hay'), cap - S.silo); if (n <= 0) return; take('hay', n); S.silo += n; } SFX.pop(); refresh(); };
    b.append(el('div', { class: 'acts wrap' }, el('button', { class: 'btn', on: () => mv(10, 1) }, 'Take 10'), el('button', { class: 'btn ghost', on: () => mv(100, 1) }, 'Take 100'),
      el('button', { class: 'btn ghost', on: () => mv(9999, 0) }, 'Store all hay (' + cnt('hay') + ')')));
  } }]);
}
const _doorActionBP = doorAction;
doorAction = function (act, who) { if (act === 'silo') return openSilo(); return _doorActionBP(act, who); };

/* field seeds: hidden from the crop lists (Collections, Mara's seasonal seeds) and sold in the Pantry */
const FIELD = {
  meadowgrass: { n: 'Meadow Grass', d: 5, s: [0, 1, 2], p: 20, sh: 'leaf', c: '#7cc04a', c2: null, re: 4, y: 1, kind: 'grain', as: ['hay', 2, 4], seed: 25 },
  flax: { n: 'Flax', d: 6, s: [0, 1], p: 30, sh: 'flower', c: '#6a8ad8', c2: null, re: 0, y: 1, kind: 'grain', as: ['fiber', 3, 6], seed: 30 },
};
for (const k in FIELD) {
  Object.defineProperty(CROPS, k, { value: FIELD[k], enumerable: false, writable: true, configurable: true });
  I(k + '_seed', FIELD[k].n + ' Seeds', 'seed', Math.round(FIELD[k].seed / 2), 'seed', FIELD[k].c, null, { crop: k, desc: 'Grows into ' + IT[FIELD[k].as[0]].n.toLowerCase() + '. ' + ['Spring', 'Summer', 'Autumn', 'Winter'].filter((_, i) => FIELD[k].s.includes(i)).join(', ') + '.' + (FIELD[k].re ? ' Regrows.' : '') });
}
const _harvestBP = harvest;
harvest = function (m, tx, ty) {
  const s = m.soil[ty * m.w + tx], C = s && s.crop && CROPS[s.crop.k];
  if (!C || !C.as) return _harvestBP(m, tx, ty);
  const n = ri(C.as[1], C.as[2]) + (Math.random() < lifeL('farming') * .004 ? 1 : 0);
  give(C.as[0], n); addXP('farming', 3); SFX.pick(); floatText((tx + .5) * 16, ty * 16, '+' + n + ' ' + IT[C.as[0]].n.toLowerCase(), '#e0c060');
  if (C.re) s.crop.age = C.d - C.re; else { s.crop = null; s.fert = null; }
  sparkle(tx, ty, '#f5e08a');
};
const _openModalBP = openModal;
openModal = function (title, tabs, start, opts) {
  if (title === 'Mara\'s General Store') tabs = tabs.concat([{ id: 'field', label: 'Field seeds', render: b => {
    b.append(el('p', { class: 'note' }, 'Fodder and fibre: grow your own hay for the animals and fibre for the workbench.'));
    const L = el('div', { class: 'list' }); for (const k in FIELD) L.append(buyRow(k + '_seed', FIELD[k].seed)); b.append(L);
  } }]);
  return _openModalBP(title, tabs, start, opts);
};

/* home */
const hasCottage = () => S && S.structures && S.structures.some(s => s.k === 'cottage' && s.stage >= 4);
function wakeHome() {
  if (!hasCottage()) return;
  goMap('in_house');
  const m = cur, spot = freeNear(m, 2, 5, 1, 4) || freeNear(m, 4, 5, 0, 6);
  if (spot) { S.p.x = (spot[0] + .5) * 16; S.p.y = (spot[1] + .8) * 16; S.p.dir = 0; }
}
const _endDayBP = endDay;
endDay = function (fainted) { _endDayBP(fainted); wakeHome(); };
const _startGameBP = startGame;
startGame = function (isNew) {
  _startGameBP(isNew); siloSync();
  if (!isNew && cur && cur.id === 'farm' && Math.abs(S.p.x - 9.5 * 16) < 1 && Math.abs(S.p.y - 10.5 * 16) < 1) wakeHome(); // loaded from indoors
};
