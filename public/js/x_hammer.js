/* The building hammer (workbench: 6 wood, 4 stone). With it in hand, interact with one of your buildings
   (E / right click, or left click on it) to Move or Remove it.
   Remove: demolish() from x_fixes.js (half the materials back; a build site returns everything delivered).
   Move: the building is lifted and its ghost follows the cursor like a blueprint; left click sets it down
   (green where it fits), right click or Esc puts it back where it was. Hale's old Demolish list is gone. */
I('build_hammer', 'Building Hammer', 'buildtool', 120, 'obj', '#7e8492', null, { desc: 'Hold it and interact with one of your buildings to move or remove it' });
SINGLE.add('buildtool');
RC.push(['build_hammer', 1, { wood: 6, stone: 4 }, 'bench']);
recipeKnown = (f => function (r) { return r[0] === 'build_hammer' || f(r); })(recipeKnown);

let MOVING = null;
const hammerIn = () => selKind() === 'build_hammer';
function bldAt(m, tx, ty) { return m && m.farm ? m.bld.find(b => b.struct && BP[b.struct.k] && tx >= b.x && tx < b.x + b.w && ty >= b.y && ty <= b.y + b.h) : null; }
function hammerMenu(b) {
  const s = b.struct, B = BP[s.k];
  openModal(B.n, [{ id: 'h', label: 'Building', render: x => {
    x.append(el('p', { class: 'note' }, s.stage >= 4 ? 'Move it somewhere else on the farm, or take it down for half its materials.' : 'A build site. Move it, or take it down and get back everything delivered.'));
    let sure = 0;
    x.append(el('div', { class: 'acts wrap' },
      el('button', { class: 'btn', on: () => { closeModal(); startMove(b); } }, 'Move'),
      el('button', { class: 'btn ghost', on: e => { if (++sure < 2) { e.target.textContent = 'Remove? Click again'; return; } closeModal(); demolish(s); } }, 'Remove'),
      el('button', { class: 'btn ghost', on: closeModal }, 'Cancel')));
  } }]);
  const p = document.querySelector('#modal'); if (p) p.classList.add('small');
}
function startMove(b) {
  const m = cur, s = b.struct, B = BP[s.k];
  removeB(m, b);
  if (B.obj) { const o = getO(m, s.x, s.y + B.h - 1); if (o && o.k === B.obj) delObj(m, s.x, s.y + B.h - 1); }
  MOVING = { s, x: s.x, y: s.y }; PLACING = s.k; CHUNK.clear();
  toast('Moving the ' + B.n.toLowerCase() + ': left click to set it down, right click to put it back.');
}
function endMove(x, y) {
  const m = MAPS.farm, s = MOVING.s; s.x = x; s.y = y;
  if (BP[s.k].obj && s.stage < 4) { const b = addB(m, x, y, BP[s.k].w, BP[s.k].h, 'site', 'site'); b.struct = s; b.spr = siteSprite(s); } else placeStructure(m, s);
  MOVING = null; PLACING = null; CHUNK.clear(); if (typeof placeAnimals === 'function') placeAnimals();
}
placeNow = (f => function () {
  if (!MOVING) return f();
  const m = cur, B = BP[PLACING], [x, y] = placeAt();
  if (!placeOk(m, x, y, B)) { toast("It doesn't fit there.", 'bad'); SFX.bad(); return; }
  const n = BP[MOVING.s.k].n; endMove(x, y); SFX.ok(); toast(n + ' moved.', 'lvl');
})(placeNow);
const cancelMove = () => { if (!MOVING) return false; const { x, y } = MOVING; endMove(x, y); toast('Put back where it was.'); return true; };
interact = (f => function () {
  if (MOVING) { cancelMove(); return; }
  return f();
})(interact);
addEventListener('keydown', e => { if (e.key === 'Escape' && MOVING) { e.stopImmediatePropagation(); cancelMove(); } }, true);
EVT.on('map', () => { if (MOVING) { const { x, y } = MOVING; endMove(x, y); } });

// with the hammer in hand, the building in front of you (or under the cursor nearby) offers Move / Remove
findInteract = (f => function () {
  if (S && cur && cur.farm && hammerIn() && !PLACING) {
    const [tx, ty] = faceTile(); const b = bldAt(cur, tx, ty);
    if (b) return { label: 'Move or remove', fn: () => hammerMenu(b) };
  }
  return f();
})(findInteract);
primaryUse = (f => function () {
  if (S && cur && cur.farm && hammerIn() && !PLACING && !PAUSED && !TITLE) {
    const [mx, my] = mouseTile(), b = bldAt(cur, mx, my);
    if (b) { const [px, py] = playerTile(); if (Math.max(Math.abs(mx - px), Math.abs(my - py)) <= 4 || (px >= b.x - 1 && px <= b.x + b.w && py >= b.y - 1 && py <= b.y + b.h + 1)) { hammerMenu(b); return; } walkTo(b.door.x, b.door.y + 1); return; }
  }
  return f();
})(primaryUse);

// Hale's Buildings tab: no more Demolish list, a pointer to the hammer instead
renderBuild = (f => function (b) {
  f(b);
  const h = [...b.querySelectorAll('h3')].find(x => x.textContent === 'Your buildings');
  if (h) { const L = h.nextElementSibling; if (L) L.remove(); h.remove(); }
  b.append(el('p', { class: 'note' }, 'To move or take down a building, make a Building Hammer at a workbench, hold it, and interact with the building.'));
})(renderBuild);
