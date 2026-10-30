/* ================= Save slots and autosave =================
   Up to 8 saves, each in its own localStorage key (emberhollow_slot_<id>), with an index
   (emberhollow_slots) of name, in-game date, gold, generation and when it was saved. The
   title screen has Continue (the most recent save), Load game (the list, with delete) and
   New game (a fresh slot; nothing is overwritten).
   AUTOSAVE: into the current slot every 5 minutes of play on a map that can be saved, and
   every morning; the previous save of that slot is kept as a backup (..._bak) in case a write
   goes wrong.
   MIGRATION: the old single save (emberhollow_v2) is copied into slot 1 the first time and left
   in place, untouched, as a backup. */

const SLOT_MAX = 8, SLOT_IDX = 'emberhollow_slots', slotKey = id => 'emberhollow_slot_' + id;
function slotIndex() { try { return JSON.parse(localStorage.getItem(SLOT_IDX) || '[]'); } catch (e) { return []; } }
function writeIndex(L) { try { localStorage.setItem(SLOT_IDX, JSON.stringify(L)); } catch (e) {} }
function slotInfo(o, id) {
  const p = o.look && o.look.name || 'Farmer';
  return { id, name: p, day: o.day, season: o.season, year: o.year, gold: Math.round(o.gold || 0), gen: (o.fam && o.fam.me && o.fam.me.gen) || 1, at: Date.now() };
}
(function migrate() { // the old single save becomes slot 1 (the original key is kept as a backup)
  if (slotIndex().length) return;
  try { const s = localStorage.getItem(SAVE_KEY); if (!s) return; const o = JSON.parse(s); if (!o || o.v !== 2) return; o.slot = 1; localStorage.setItem(slotKey(1), JSON.stringify(o)); writeIndex([slotInfo(o, 1)]); } catch (e) { console.error(e); }
})();
saveGame = function () {
  if (!S) return false;
  ensurePack();
  if (!S.slot) { const L = slotIndex(); S.slot = (L.reduce((a, s) => Math.max(a, s.id), 0) || 0) + 1; }
  for (const id of PERSIST) { const m = MAPS[id]; if (m) S.mapsave[id] = m.baseJ ? { d: diffO(m), soil: m.soil, w: m.w, h: m.h } : { o: packO(m.o), soil: m.soil, w: m.w, h: m.h }; }
  S.explored = EXPL.join('');
  try {
    const key = slotKey(S.slot), prev = localStorage.getItem(key);
    if (prev) localStorage.setItem(key + '_bak', prev);
    localStorage.setItem(key, JSON.stringify(S));
  } catch (e) { toast('Could not save: ' + e.message, 'bad'); return false; }
  const L = slotIndex().filter(s => s.id !== S.slot); L.push(slotInfo(S, S.slot)); writeIndex(L);
  return true;
};
function loadSlot(id) { try { const o = JSON.parse(localStorage.getItem(slotKey(id)) || 'null'); if (o && o.v === 2) { o.slot = id; return o; } } catch (e) {}
  try { const o = JSON.parse(localStorage.getItem(slotKey(id) + '_bak') || 'null'); if (o && o.v === 2) { o.slot = id; toast('That save was damaged; loaded its backup.', 'bad'); return o; } } catch (e) {} return null; }
loadGame = function () { const L = slotIndex().sort((a, b) => b.at - a.at); return L.length ? loadSlot(L[0].id) : null; };
function deleteSlot(id) { localStorage.removeItem(slotKey(id)); localStorage.removeItem(slotKey(id) + '_bak'); writeIndex(slotIndex().filter(s => s.id !== id)); }

/* autosave */
let AUTOSAVE_T = 0;
EVT.on('tick', n => {
  if (!S || TITLE || (typeof SANDBOX !== 'undefined' && SANDBOX)) return;
  if (++AUTOSAVE_T >= 500 && cur && PERSIST.includes(cur.id) && !MODAL) { AUTOSAVE_T = 0; if (saveGame()) toast('Autosaved.'); } // 500 ticks = 5 minutes
});

/* the title screen: Continue, Load game, New game */
const SEAS = ['Spring', 'Summer', 'Fall', 'Winter'];
function slotRow(s, onPick) {
  const when = new Date(s.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  const row = el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, s.name + (s.gen > 1 ? ' (generation ' + s.gen + ')' : '')),
    el('small', null, SEAS[s.season || 0] + ' ' + (s.day || 1) + ', year ' + (s.year || 1) + ' · ' + (s.gold || 0).toLocaleString() + 'g · saved ' + when)));
  let sure = 0;
  row.append(el('div', { class: 'acts' }, el('button', { class: 'btn', on: () => onPick(s) }, 'Load'),
    el('button', { class: 'btn ghost', on: e => { if (++sure < 2) { e.target.textContent = 'Delete? Click again'; return; } deleteSlot(s.id); showSlots(); } }, 'Delete')));
  return row;
}
function showSlots() {
  let box = document.getElementById('tslots'); if (!box) { box = el('div', { id: 'tslots', class: 'f-panel' }); Object.assign(box.style, { maxWidth: '560px', margin: '12px auto 0', maxHeight: '46vh', overflow: 'auto', padding: '10px' }); document.querySelector('#title .acts').after(box); }
  box.innerHTML = ''; const L = slotIndex().sort((a, b) => b.at - a.at);
  if (!L.length) { box.append(el('p', { class: 'note' }, 'No saves yet.')); return; }
  const list = el('div', { class: 'list' }); L.forEach(s => list.append(slotRow(s, s2 => { const o = loadSlot(s2.id); if (!o) { toast('That save could not be read.', 'bad'); return; } S = o; box.remove(); startGame(false); }))); box.append(list);
}
const _bootX = boot;
boot = function () {
  _bootX();
  const L = slotIndex();
  $('#tcont').hidden = !L.length;
  $('#tnew').textContent = 'New game'; delete $('#tnew').dataset.sure;
  $('#tnew').onclick = () => { if (slotIndex().length >= SLOT_MAX) { toast('All ' + SLOT_MAX + ' save slots are used. Delete one under Load game first.', 'bad'); showSlots(); return; } startGame(true); };
  if (!document.getElementById('tload')) $('#tcont').after(el('button', { id: 'tload', class: 'btn ghost', on: showSlots }, 'Load game'));
  document.getElementById('tload').hidden = !L.length;
};
const _startGameX = startGame;
startGame = function (isNew) {
  if (isNew) { const L = slotIndex(); window.__newSlot = (L.reduce((a, s) => Math.max(a, s.id), 0) || 0) + 1; }
  _startGameX(isNew);
  if (isNew && S && !(typeof SANDBOX !== 'undefined' && SANDBOX)) { S.slot = window.__newSlot; saveGame(); }
};
/* Options: save says which slot; delete removes only this slot */
const _renderOptsS = renderOpts;
renderOpts = function (b) {
  _renderOptsS(b);
  [...b.querySelectorAll('button')].forEach(x => { if (/^Delete save$/.test(x.textContent)) { let n = 0; x.onclick = null; x.addEventListener('click', e => { e.stopImmediatePropagation(); if (++n < 3) { toast(n === 1 ? 'Click again to delete this save slot.' : 'Last chance. Click once more.', 'bad'); return; } deleteSlot(S.slot); location.reload(); }, true); } });
  if (S && S.slot) b.prepend(el('p', { class: 'note' }, 'Save slot ' + S.slot + ' (' + ((S.look && S.look.name) || 'Farmer') + '). The game autosaves every 5 minutes and every morning.'));
};
