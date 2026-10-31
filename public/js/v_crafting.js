/* ================= Crafting happens at stations =================
   The old "field kit" let you make half the recipes anywhere. Now:
   - WORKBENCH: what the field kit made (fences, sprinklers, parts, belts, most machines) needs a
     workbench within reach: one you place on your farm, or Hale's and the farmhouse's indoors.
     Every farm gets one beside the tent or house (once, S.flags.wb). Using it opens its recipes.
   - Furnace, anvil, kitchen and tanning rack work as before: use the station to craft there.
   - BY HAND: only the workbench itself and the campfire can be made anywhere.
   - The backpack's crafting tab (B) is now a recipe book: every recipe, what it needs and where
     it's made. Only by-hand recipes have a Make button there. Item-on-item combining also needs
     a workbench nearby, since those are workbench recipes. */

STATION_N.bench = 'Workbench'; STATION_N.hand = 'By hand';
I('workbench', 'Workbench', 'place', 150, 'obj', null, null, { place: 'workbench', desc: 'Most things are made here.' });
OBJ.workbench = { solid: 1, place: 1, w: 2, tall: 1 };
RC.push(['workbench', 1, { wood: 25, stone: 10 }, 'hand']);
for (const r of RC) if (r[0] === 'campfire') r[3] = 'hand';

const _stationNearWB = stationNear;
stationNear = function (st) {
  if (st === 'hand') return true;
  if (st !== 'bench') return _stationNearWB(st);
  if (MODAL && MODAL.opts.station === 'bench') return true;
  const m = cur; if (!m) return false;
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o || (o.k !== 'workbench' && o.k !== 'furn_workbench')) continue;
    const x = i % m.w, y = i / m.w | 0; for (const dx of [0, 1]) if (dist(S.p.x, S.p.y, (x + dx + .5) * 16, (y + .5) * 16) < 2.8 * 16) return true; }
  return false;
};
const _objSpriteWB = objSprite;
objSprite = function (o, season) { if (o.k === 'workbench') return PIX.get('furn_workbench') || SPR.board; return _objSpriteWB(o, season); };
const _objInteractWB = objInteract;
objInteract = function (m, x, y, o) {
  if (o.k === 'workbench' || (o.k === 'furn_workbench' && !o.act)) return { label: 'Craft', fn: () => openMenu('craft', 'bench') };
  return _objInteractWB(m, x, y, o);
};

/* the backpack tab is a recipe book; a station's window is where you make things */
let CRAFT_AT = null;
const _openMenuWB = openMenu;
openMenu = function (tab, station, focus) {
  CRAFT_AT = tab === 'craft' && station && station !== 'all' ? (station === 'forge' ? 'furnace' : station) : null;
  _openMenuWB(tab, station, focus);
  if (MODAL) { MODAL.opts.station = CRAFT_AT || MODAL.opts.station; if (CRAFT_AT) MODAL.opts.st = CRAFT_AT; const t = MODAL.tabs.find(t => t.id === 'craft'); if (t) { t.label = CRAFT_AT ? STATION_N[CRAFT_AT] || 'Crafting' : 'Recipes'; drawModal(); } }
};
const _closeModalWB = closeModal;
closeModal = function () { CRAFT_AT = null; return _closeModalWB(); };
const _renderCraftWB = renderCraft;
renderCraft = function (b) {
  if (CRAFT_AT) { // at a station: only its recipes, all makeable
    MODAL.opts.st = CRAFT_AT; _renderCraftWB(b);
    const bar = b.querySelector('.chips'); if (bar) [...bar.children].forEach(c => { if (!/Can make/.test(c.textContent)) c.remove(); });
    b.insertBefore(el('p', { class: 'note' }, 'You are at ' + (/^[aeiou]/i.test(STATION_N[CRAFT_AT]) ? 'an ' : 'a ') + STATION_N[CRAFT_AT].toLowerCase() + '.'), b.firstChild.nextSibling);
    return;
  }
  if (MODAL.opts.station) { // a shop's own forge window (Brann, the regional forges) is a station too: furnace and anvil
    if (MODAL.opts.station === 'forge' && !['furnace', 'anvil'].includes(MODAL.opts.st)) MODAL.opts.st = 'furnace';
    _renderCraftWB(b);
    const bar = b.querySelector('.chips'); if (bar) [...bar.children].forEach(c => { if (!/^(Furnace|Anvil|Can make)/.test(c.textContent)) c.remove(); });
    return;
  }
  const st = MODAL.opts.st || 'all', ready = MODAL.opts.ready;
  _renderCraftWB(b);
  const shown = RC.filter(r => (st === 'all' || r[3] === st) && (!ready || !canCraft(r))), rows = [...b.querySelectorAll('.list > .rrow')];
  rows.forEach((row, i) => { const r = shown[i]; if (!r || r[3] === 'hand') return; const acts = row.querySelector('.acts'); if (acts) acts.replaceWith(el('small', { class: 'where' }, 'Made at a ' + STATION_N[r[3]].toLowerCase())); const why = row.querySelector('.why'); if (why && /^Needs a /.test(why.textContent)) why.remove(); });
  b.insertBefore(el('p', { class: 'note' }, 'Your recipe book. Things are made at a workbench, furnace, anvil, kitchen or tanning rack: use the station to craft there. Only the workbench and the campfire can be made by hand, here.'), b.firstChild.nextSibling);
};

/* every farm gets a workbench by the tent or house, once (checked on the tick, after the farm and its structures exist) */
function placeStarterBench() {
  S.flags = S.flags || {}; if (S.flags.wb) return;
  const m = MAPS.farm, h = m && m.bHouse; if (!m || !h) return;
  const bx = h.x + h.w + 1, by = h.y + h.h;
  for (let r = 0; r < 8 && !S.flags.wb; r++) for (let j = -r; j <= r && !S.flags.wb; j++) for (let i = -r; i <= r && !S.flags.wb; i++) {
    const x = bx + i, y = by + j, [px, py] = cur === m ? playerTile() : [-9, -9]; if (Math.abs(x - px) <= 2 && Math.abs(y - py) <= 2 || !areaFree(m, x, y - 1, 2, 3) || m.soil[y * m.w + x] || m.soil[y * m.w + x + 1] || TER[getT(m, x, y)].water || TER[getT(m, x + 1, y)].water) continue;
    putObj(m, x, y, { k: 'workbench' }); S.flags.wb = 1;
  }
}
EVT.on('tick', n => { if (S && !TITLE && n % 5 === 0) placeStarterBench(); });

/* recipes that were a single raw material now take a second ingredient; processing steps
   (wheat -> flour, hide -> straps, a bar -> rivets or gears) stay single on purpose */
{
  const need = (id, st, n) => { for (const r of RC) if (r[0] === id && r[3] === st) r[2] = n; };
  need('fence', 'bench', { wood: 4, fiber: 1 }); need('storage', 'bench', { wood: 25, fiber: 5 }); need('compostbin', 'bench', { wood: 15, fiber: 5 });
  need('channel', 'bench', { stone: 6, clay: 2 }); need('chute', 'bench', { wood: 6, fiber: 2 }); need('stone_path', 'bench', { stone: 3, clay: 1 });
  for (const r of RC) if (r[0] === 'wood_sword' || r[0] === 'wood_spear') r[2].fiber = 2;
  need('leather', 'tanning', { hide: 1, salt: 1 });
  for (const r of RC) { if (r[0] === 'leather_helm') r[2].padding = 1; if (r[0] === 'leather_body') r[2].straps = 2; if (r[0] === 'leather_boots') r[2].straps = 1; }
  need('grilled_fish', 'kitchen', { $fish: 1 }); /* one dish needs nothing you can't catch on day one (playtest) */ need('mushroom_skewer', 'kitchen', { $mush: 2, herb: 1 });
}
