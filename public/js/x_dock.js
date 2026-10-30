/* The menu dock (top right): a labelled tile for every tab, with its hand-pixelled icon (ui_<tab> in
   art/sprites/ui_icons.py), its name and its key; the tile of the open tab is lit. The Satchel's tab row
   shows the same icons. */
const DOCK = [['bag', 'Bag', 'i'], ['craft', 'Recipes', 'b'], ['skills', 'Skills', 'k'], ['tree', 'Tree', 't'], ['cskills', 'Combat', 'v'], ['animals', 'Animals', 'n'],
  ['friends', 'Friends', 'p'], ['family', 'Family', 'f'], ['coll', 'Collect', 'o'], ['ency', 'Lore', 'u'], ['map', 'Map', 'm'], ['quests', 'Quests', 'j'], ['opts', 'Options', 'Escape']];
function uiIcon(id, px = 32) {
  const t = PIX.get('ui_' + id); const c = el('canvas', { width: 16, height: 16, class: 'uiic' });
  if (t) { const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(t, 0, 0, 16, 16); }
  c.style.width = c.style.height = px + 'px'; return c;
}
function buildDock() {
  const tr = $('#topr'); if (!tr) return;
  tr.innerHTML = ''; tr.classList.add('dock');
  for (const [tab, name, key] of DOCK) {
    const k = typeof bindKey === 'function' ? bindKey(tab === 'opts' ? 'x' : tab, key) : key;
    tr.append(el('button', { class: 'dk f-dark', 'data-tab': tab, title: name + ' (' + (tab === 'opts' ? 'Esc' : k) + ')', on: () => { if (PAUSED && !MODAL) return; if (MODAL && MODAL.title === 'Satchel' && MODAL.cur === tab) { closeModal(); return; } openMenu(tab); } },
      uiIcon(tab, 22), el('span', { class: 'dkn' }, name), el('kbd', null, tab === 'opts' ? 'Esc' : k.length === 1 ? k.toUpperCase() : k)));
  }
}
buildHUD = (f => function () { f(); buildDock(); })(buildHUD);
drawModal = (f => function () {
  f();
  const open = MODAL && MODAL.title === 'Satchel' ? MODAL.cur : null;
  document.querySelectorAll('#topr .dk').forEach(b => b.classList.toggle('on', b.dataset.tab === open));
  if (MODAL && MODAL.title === 'Satchel') document.querySelectorAll('#mtabs .tab').forEach((b, i) => { const t = MODAL.tabs[i]; if (t && PIX.has('ui_' + t.id) && !b.querySelector('.uiic')) b.prepend(uiIcon(t.id, 16)); });
})(drawModal);
closeModal = (f => function () { const r = f.apply(this, arguments); document.querySelectorAll('#topr .dk.on').forEach(b => b.classList.remove('on')); return r; })(closeModal);
if (typeof S !== 'undefined' && S && $('#topr')) buildDock();
