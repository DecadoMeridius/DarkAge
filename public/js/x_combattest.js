/* ================= Combat test (title screen) =================
   A throwaway game (nothing is saved, like the Test sandbox) for trying the action combat:
   - Melee, Ranged, Magic, Defence and Constitution at 60, so the skill trees have points to spend.
   - Every weapon type in steel and mythril, 999 arrows, a staff, robes and hats, 40 meals.
   - Starts in an open meadow in the Wilds, with a Combat test panel at the top left:
       spawn a wolf pack, a mixed pack, ranged enemies or any boss; heal; clear enemies.
   Bosses spawn five tiles away and fight as in the game (kits, telegraphs, phase 2). */

function startCombatTest() {
  SANDBOX = true; window.COMBAT_TEST = true;
  startGame(true);
  setTimeout(() => {
    while (MODAL) { MODAL.lock = false; closeModal(); } while (typeof DIALOG !== 'undefined' && DIALOG) DIALOG.close(true);
    ensureCombat(); for (const k of ['melee', 'ranged', 'magic', 'defence', 'constitution']) S.csk[k].xp = Math.max(S.csk[k].xp || 0, XPT[60] + 10);
    S.look = Object.assign({}, DEFAULT_LOOK, S.look || {}, { name: 'Tester' }); S.gold = 100000;
    for (const id of ['steel_sword', 'steel_dagger', 'steel_spear', 'steel_hammer', 'steel_bow', 'mythril_sword', 'mythril_hammer', 'mythril_bow', 'mythril_staff', 'gold_staff', 'mystic_robe', 'mystic_hat', 'mythril_body', 'mythril_helm', 'mythril_boots', 'mythril_shield'])
      if (IT[id]) give(id, 1, 0, true);
    give('arrow', 999, 0, true); give('fire_arrow', 200, 0, true); give('steak', 20, 0, true); give('meat_stew', 20, 0, true);
    for (const s of ['body', 'helm', 'boots', 'shield']) { const id = 'mythril_' + s; if (IT[id] && cnt(id)) equip(id); }
    if (cnt('mythril_sword')) equip('mythril_sword');
    S.known = S.known || {}; for (const t of TIERS) S.known['tier:' + t[0]] = 1;
    recalc(); S.p.hp = maxHP(); S.p.st = maxST(); S.focus = 50;
    { const c = MAPS.wilds.poi.find(p => p.type === 'cross'); goMap('wilds', (c.x - 4) * 16, (c.y + 4) * 16, 3); } S.time = 600;
    combatPanel(); toast('Combat test: nothing here is saved. Spend skill points in Combat skills (V), then spawn enemies from the panel.', 'lvl');
  }, 300);
}
function spawnNear(k, n, dist, lvl) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, d = dist + Math.random() * 20;
    let x = S.p.x + Math.cos(a) * d, y = S.p.y + Math.sin(a) * d;
    for (let t = 0; t < 12 && !boxFree(cur, x, y, 6); t++) { const b = Math.random() * 6.283; x = S.p.x + Math.cos(b) * d; y = S.p.y + Math.sin(b) * d; }
    const e = spawnEnemy(cur, k, x, y, lvl); e.woke = 1; e.home = [x, y];
  }
}
function combatPanel() {
  let p = document.getElementById('ctpanel'); if (p) p.remove();
  const bosses = Object.keys(EN).filter(k => EN[k].boss), packs = {
    'Wolf pack': () => spawnNear('wolf', 4, 70, 12), 'Slimes': () => spawnNear('slime', 6, 60, 6),
    'Mixed pack': () => { const pool = Object.keys(EN).filter(k => !EN[k].boss && EN[k].ai !== 'ambush'); for (let i = 0; i < 5; i++) spawnNear(pickR(pool), 1, 80, 15); },
    'Ranged': () => { const r = Object.keys(EN).filter(k => EN[k].ai === 'ranged'); spawnNear(r.length ? pickR(r) : 'slime', 3, 90, 15); },
  };
  const sel = el('select'); for (const k of bosses) sel.append(el('option', { value: k }, EN[k].n));
  p = el('div', { id: 'ctpanel', class: 'f-panel' }, el('b', null, 'Combat test'),
    ...Object.entries(packs).map(([n, f]) => el('button', { class: 'btn ghost', on: () => { f(); p.blur && p.blur(); } }, n)),
    sel, el('button', { class: 'btn', on: () => { const k = sel.value, a = Math.random() * 6.283; const e = spawnEnemy(cur, k, S.p.x + Math.cos(a) * 80, S.p.y + Math.sin(a) * 80, 20); e.home = [e.x, e.y]; toast(EN[k].n + ' appears!', 'bad'); SFX.boom(); } }, 'Spawn boss'),
    el('button', { class: 'btn ghost', on: () => { recalc(); S.p.hp = maxHP(); S.p.st = maxST(); S.focus = PS.focusMax || 100; } }, 'Heal'),
    el('button', { class: 'btn ghost', on: () => { cur.ents = cur.ents.filter(e => e.type !== 'enemy' && e.type !== 'proj'); if (typeof HAZ !== 'undefined') HAZ.length = 0; } }, 'Clear'));
  p.addEventListener('mousedown', e => e.stopPropagation()); document.body.append(p);
}
{ const acts = document.querySelector('#title .acts'); if (acts && !document.getElementById('tcombat')) acts.append(el('button', { id: 'tcombat', class: 'btn ghost', on: () => startCombatTest() }, 'Combat test')); }
