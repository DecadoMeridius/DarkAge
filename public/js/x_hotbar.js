/* ================= Hotbar in the backpack: drag and drop =================
   The backpack window (I) shows the 10 hotbar slots under the bag. Drag between them:
     bag item → hotbar slot   puts it on the hotbar (the item stays in the bag; the hotbar points at it)
     hotbar → hotbar          swaps the two slots (tools too)
     hotbar → bag             takes it off the hotbar; a TOOL (hoe, can, axe, pickaxe, rod, scythe,
                              weapon slot) becomes a backpack item ("tool_<kind>") so it is never lost
     bag tool → hotbar        puts the tool back on the hotbar (and out of the bag)
   Tools in the bag can't be used until they're back on the hotbar; they can't be dropped or sold.
   Equipping a weapon no longer overwrites hotbar slot 6 (it did, which knocked the scythe off):
   ensureToolRefs puts any tool that is nowhere back into a free hotbar slot or the bag. */

const TOOL_KINDS = ['hoe', 'can', 'axe', 'pick', 'rod', 'scythe', 'weapon'];
const toolItem = k => 'tool_' + k;
for (const k of TOOL_KINDS) I(toolItem(k), k === 'weapon' ? 'Weapon slot' : TOOLN[k], 'tool', 0, 'obj', '#a8a8a8', null, { tool: k, desc: k === 'weapon' ? 'Your equipped weapon. Drag it onto the hotbar to fight with it.' : 'Drag it onto the hotbar to use it.' });
SINGLE.add('tool');
const _itemIconH = itemIcon;
itemIcon = function (id) {
  const it = IT[id];
  if (it && it.t === 'tool' && it.tool) return it.tool === 'weapon' ? (S && S.eq && S.eq.weapon ? itemIcon(S.eq.weapon) : _itemIconH('tool:weapon:1')) : _itemIconH('tool:' + it.tool + ':' + ((S && S.tools && S.tools[it.tool]) || 1));
  return _itemIconH(id);
};
function ensureToolRefs() {
  if (!S || !S.hot || !S.pack) return;
  for (const k of TOOL_KINDS) {
    if (k !== 'weapon' && !S.tools[k]) continue;
    if (S.hot.includes(k) || S.pack.some(s => s && s.k === toolItem(k)) || (S.bank && S.bank[toolItem(k)] > 0)) continue;
    const h = S.hot.indexOf(null); if (h >= 0) { S.hot[h] = k; continue; }
    const p = S.pack.indexOf(null); if (p >= 0) S.pack[p] = { k: toolItem(k), n: 1 };
  }
  hudKey = '';
}
const _equipH = equip;
equip = function (id) { const hot = S.hot.slice(); _equipH(id); S.hot = hot; ensureToolRefs(); }; // keep the hotbar as the player arranged it
const _startGameH = startGame;
startGame = function (isNew) { _startGameH(isNew); ensureToolRefs(); };

/* tools in the bag stay put */
const _dropSlotH = dropSlot;
dropSlot = function (i, n) { const s = S.pack[i]; if (s && IT[parseK(s.k)[0]] && IT[parseK(s.k)[0]].t === 'tool') { toast('Tools can\'t be dropped. Put it on the hotbar or in the bank.'); return; } return _dropSlotH(i, n); };
const _slotPrimaryH = slotPrimary;
slotPrimary = function (i) {
  const s = S.pack[i], it = s && IT[parseK(s.k)[0]];
  if (it && it.t === 'tool' && !MODAL.opts.giftTo) { const h = S.hot.indexOf(null); if (h >= 0) { S.hot[h] = it.tool; S.pack[i] = null; touched(); hudKey = ''; refresh(); } else toast('Drag it onto a hotbar slot.'); return; }
  return _slotPrimaryH(i);
};

/* moving things */
function packToHot(i, h) {
  const s = S.pack[i]; if (!s) return;
  const [id] = parseK(s.k), it = IT[id], old = S.hot[h];
  if (it.slot && it.t !== 'tool') { toast('Wear or wield it instead: weapons and armour go in your equipment.'); return; }
  if (it.t === 'tool') { S.pack[i] = null; S.hot = S.hot.map(x => (x === it.tool ? null : x)); S.hot[h] = it.tool; }
  else { S.hot = S.hot.map(x => (x === id ? null : x)); S.hot[h] = id; }
  if (old && isTool(old) && old !== S.hot[h]) { const p = S.pack[i] === null ? i : S.pack.indexOf(null); if (p >= 0) S.pack[p] = { k: toolItem(old), n: 1 }; else { S.hot[h] = old; if (it.t === 'tool') S.pack[i] = s; toast('No room in the bag for the ' + (TOOLN[old] || 'tool').toLowerCase() + '.', 'bad'); } }
  S.sel = h; touched(); hudKey = ''; refresh();
}
function hotToPack(h, i) {
  const k = S.hot[h]; if (!k) return;
  if (isTool(k)) {
    const p = i !== undefined && !S.pack[i] ? i : S.pack.indexOf(null);
    if (p < 0) { toast('Your bag is full.', 'bad'); return; }
    S.pack[p] = { k: toolItem(k), n: 1 }; touched();
  }
  S.hot[h] = null; hudKey = ''; refresh();
}
function hotSwap(a, b) { if (a === b) return; [S.hot[a], S.hot[b]] = [S.hot[b], S.hot[a]]; if (S.sel === a) S.sel = b; else if (S.sel === b) S.sel = a; hudKey = ''; refresh(); }

const _renderBagH = renderBag;
renderBag = function (b) {
  _renderBagH(b);
  const grid = b.querySelector('.pack'); if (!grid) return;
  const cells = [...grid.querySelectorAll('.cell')];
  cells.forEach((c, i) => { const orig = c.ondrop; c.ondrop = e => { const d = e.dataTransfer.getData('text'); if (d.startsWith('h:')) { e.preventDefault(); hotToPack(+d.slice(2), i); return; } if (orig) orig(e); }; });
  grid.ondragover = e => e.preventDefault();
  grid.ondrop = e => { const d = e.dataTransfer.getData('text'); if (d.startsWith('h:') && e.target === grid) { e.preventDefault(); hotToPack(+d.slice(2)); } };
  const row = el('div', { class: 'hotrow' });
  S.hot.forEach((k, h) => {
    const id = k ? (k === 'weapon' ? S.eq.weapon : isTool(k) ? toolItem(k) : k) : null;
    const c = el('div', { class: 'cell f-slot' + (S.sel === h ? ' on' : ''), draggable: k ? 'true' : 'false', title: '' });
    c.append(el('i', { class: 'hk' }, String(h === 9 ? 0 : h + 1)));
    if (k) {
      const ic = k === 'weapon' && !S.eq.weapon ? itemIcon('tool:weapon:1') : itemIcon(id) ; if (ic) { const cv = el('canvas', { width: ic.width, height: ic.height }); cv.getContext('2d').drawImage(ic, 0, 0); cv.className = 'hic'; c.append(cv); }
      if (!isTool(k)) c.append(el('b', null, cnt(k) || '0'));
      if (id && IT[id]) { c.addEventListener('mouseenter', () => showTip(c, id)); c.addEventListener('mouseleave', hideTip); }
    }
    c.onclick = () => { S.sel = h; hudKey = ''; refresh(); };
    c.oncontextmenu = e => { e.preventDefault(); if (k) hotToPack(h); };
    c.ondragstart = e => { e.dataTransfer.setData('text', 'h:' + h); hideTip(); };
    c.ondragover = e => e.preventDefault();
    c.ondrop = e => { e.preventDefault(); const d = e.dataTransfer.getData('text'); if (d.startsWith('h:')) hotSwap(+d.slice(2), h); else if (d !== '' && !isNaN(+d)) packToHot(+d, h); };
    row.append(c);
  });
  b.prepend(el('div', { class: 'hotwrap f-panel' }, el('h3', null, 'Hotbar'), el('p', { class: 'note' }, 'Drag items and tools here from the bag, drag slots to rearrange, drag a slot back into the bag (or right click it) to take it off.'), row));
};
