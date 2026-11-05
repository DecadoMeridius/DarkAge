/* ================= Pet and horse progression (asked 2026-11-05) =================
   - Horse stamina: every horse counts the tiles it's ridden (a.rode, on the tick while you're mounted) and gains stamina
     levels 1-10 (HORSE_LV); each level above 1 rides 2.5% faster (horseSpd, used for the riding speed in g_ui.js update).
   - Pet hearts: affection (S.pet.aff, 0-100) is hearts × 10. Petting gives 5 a day as before; a treat (any fish or meat dish
     in hand) gives 4 more once a day. The morning dig is likelier with more hearts and reaches rarer finds (PET_FINDS, by the
     hearts each needs; the dig in x_world.js uses petFinds()).
   - The Animals tab shows both at the top (Companions). */
const HORSE_LV = [0, 150, 400, 800, 1400, 2200, 3200, 4500, 6000, 8000];
const horseLv = a => { let l = 1; for (let i = 1; i < HORSE_LV.length; i++) if ((a.rode || 0) >= HORSE_LV[i]) l = i + 1; return l; };
const horseSpd = a => a ? 1 + (horseLv(a) - 1) * .025 : 1;
let RIDE_AT = null;
EVT.on('tick', () => {
  if (!S || !S.mounted || typeof rideHorse !== 'function') { RIDE_AT = null; return; }
  const h = rideHorse(); if (!h) { RIDE_AT = null; return; }
  const at = [S.p.x, S.p.y, cur && cur.id]; if (RIDE_AT && RIDE_AT[2] === at[2]) {
    const d = Math.hypot(at[0] - RIDE_AT[0], at[1] - RIDE_AT[1]) / 16;
    if (d > 0 && d < 12) { const l0 = horseLv(h); h.rode = (h.rode || 0) + d; const l1 = horseLv(h);
      if (l1 > l0) { toast(h.name + '’s stamina grows: level ' + l1 + ' (' + Math.round((horseSpd(h) - 1) * 100) + '% faster).', 'lvl'); SFX.lvl(); } }
  }
  RIDE_AT = at;
});
const petHearts = () => S && S.pet ? Math.floor((S.pet.aff || 0) / 10) : 0;
// [item, min, max, weight, hearts needed]
const PET_FINDS = [['clay', 1, 3, 30, 0], ['stone', 2, 5, 20, 0], ['bone', 1, 1, 14, 0], ['$', 20, 120, 14, 0], ['herb', 1, 2, 10, 0], ['wild_leek', 1, 2, 8, 0], ['geode', 1, 1, 3, 0], ['amethyst', 1, 1, 1, 0],
  ['garnet', 1, 1, 5, 3], ['truffle', 1, 2, 5, 3], ['$', 80, 260, 6, 4], ['topaz', 1, 1, 3, 5], ['gold_ore', 2, 4, 4, 5], ['ruby', 1, 1, 3, 7], ['emerald', 1, 1, 3, 7], ['aquamarine', 1, 1, 3, 7], ['ancient_coin', 1, 1, 2, 7],
  ['diamond', 1, 1, 1, 9], ['sunstone', 1, 1, 1, 9], ['$', 250, 600, 2, 9]];
const petFinds = () => { const h = petHearts(); return PET_FINDS.filter(([id, , , , need]) => h >= need && (id === '$' || IT[id])); };
const petDigChance = () => .14 + (S.pet.aff || 0) * .003;
const isTreat = id => { const it = id && IT[id]; return !!(it && (it.t === 'fish' || (it.t === 'food' && /meat|steak|bacon|sausage|jerky|roast|fish|chop/.test(id)))); };
findInteract = (f => function () {
  try {
    const e = S && S.pet && cur && cur.id === 'farm' && typeof petEnt === 'function' && petEnt(), k = typeof selKind === 'function' ? selKind() : null;
    if (e && isTreat(k) && S.pet.fed !== dayIndex()) { const [fx, fy] = facePt(); if (Math.hypot(fx - e.x, fy - (e.y - 6)) < 16 || Math.hypot(S.p.x - e.x, S.p.y - e.y) < 14)
      return { label: 'Give ' + S.pet.name + ' a treat', fn: () => { if (!take(k, 1)) return; S.pet.fed = dayIndex(); S.pet.aff = Math.min(100, (S.pet.aff || 0) + 4); e.heart = 1; SFX.ok(); toast(S.pet.name + ' gobbles it up. (' + petHearts() + ' ♥)'); } }; }
  } catch (err) { console.error(err); }
  return f.apply(this, arguments);
})(findInteract);
renderAnimals = (f => function (b) {
  const r = f.apply(this, arguments);
  try {
    const box = el('div', { class: 'greet f-panel', style: 'flex-direction:column;align-items:stretch;gap:2px;margin-bottom:6px' }, el('b', null, 'Companions'));
    if (S.pet) { const h = petHearts(); box.append(el('small', null, S.pet.name + ' the ' + S.pet.kind + ': ' + '♥'.repeat(h) + '♡'.repeat(10 - h) + ' (' + (S.pet.aff || 0) + '/100). Pet daily, and a fish or meat treat once a day. More hearts: more digs and rarer finds (' + Math.round(petDigChance() * 100) + '% a night).')); }
    for (const a of S.animals.filter(a => a.sp === 'horse')) { const l = horseLv(a), nx = HORSE_LV[l];
      box.append(el('small', null, a.name + ': stamina ' + l + '/10, +' + Math.round((horseSpd(a) - 1) * 100) + '% speed' + (nx !== undefined ? ' · ' + Math.round(nx - (a.rode || 0)) + ' tiles to level ' + (l + 1) : ' (full)'))); }
    if (box.children.length > 1) b.prepend(box);
  } catch (e) { console.error(e); }
  return r;
})(renderAnimals);
