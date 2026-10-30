/* ================= World content, section C (docs/playtest/BACKLOG.md) =================
   C1 A PET. From your second morning Odile has a stray at the stables; bring her 2 fish (any) and you
      choose a dog or a cat and name it. It follows you around the farm, sits when you stop, and can be
      petted once a day (right click). Each morning there's a chance (more with affection) it dug
      something up: clay, stones, forage, an old bone, coins, sometimes an artifact or a gem. It's
      listed in the morning report. S.pet = { kind, name, aff, x, y, pet (day last petted) }.
   C2 Wild FLOWERS and MUSHROOMS can be picked (right click) in the Wilds and the regions: a seasonal
      flower or forage item from that biome, or a mushroom. They grow back elsewhere a couple of days later.
   C3 Basic-resource nodes: CLAY MOUNDS on sand beside water and SALT CRUSTS on coasts (Wilds coast,
      Saltreach), mined with the pickaxe. Spawned once per map (older saves get them too) and they
      regrow elsewhere like rocks.
   C4 SLAUGHTER: in the Animals tab every animal except horses has a Slaughter button (click twice). It
      gives meat (Raw Poultry, Raw Red Meat, Raw Pork, Rabbit Meat), and hide, feathers, wool or a bone.
      New kitchen recipes use meat: Roast Poultry, Grilled Steak and Roast Pork (basic), and Meat Stew
      and Sausages (cookbook pages from Pip). "Any meat" works in recipes. */

/* ---------- items and recipes ---------- */
const MEATS = [['poultry', 'Raw Poultry', 60, '#f0c8a8'], ['red_meat', 'Raw Red Meat', 90, '#c8423a'], ['pork', 'Raw Pork', 80, '#f0a0a0'], ['rabbit_meat', 'Rabbit Meat', 70, '#d8908a']];
for (const [id, n, p, c] of MEATS) I(id, n, 'animal', p, 'food', c, '#f8e8e0', { meat: 1, desc: 'Raw meat. Cook it at a kitchen or campfire.' });
CATF.$meat = k => !!(IT[k] && IT[k].meat); CATN.$meat = 'Any meat'; CATI.$meat = 'red_meat';
I('roast_poultry', 'Roast Poultry', 160, 'food', 'food', '#d8a050', null, { eat: [50, 60] });
I('steak', 'Grilled Steak', 220, 'food', 'food', '#8a3a22', null, { eat: [70, 60] });
I('roast_pork', 'Roast Pork', 200, 'food', 'food', '#c87a5a', null, { eat: [60, 65] });
I('meat_stew', 'Meat Stew', 420, 'food', 'food', '#9a5a2a', null, { eat: [110, 100] });
I('sausage', 'Sausages', 300, 'food', 'food', '#a84a32', null, { eat: [70, 80], buff: { atk: 3, dur: 180 } });
RC.push(['roast_poultry', 1, { poultry: 1, salt: 1 }, 'kitchen'], ['steak', 1, { red_meat: 1, salt: 1 }, 'kitchen'], ['roast_pork', 1, { pork: 1, salt: 1 }, 'kitchen'],
  ['meat_stew', 1, { $meat: 2, potato: 1, carrot: 1 }, 'kitchen'], ['sausage', 2, { pork: 1, salt: 1, herb: 1 }, 'kitchen']);
['roast_poultry', 'steak', 'roast_pork'].forEach(k => BASIC_FOOD.add(k));
OBJ.clay_mound = { solid: 1, hp: 2, tool: 'pick', drop: [['clay', 1, 3]], xp: ['mining', 3] };
OBJ.salt_crust = { solid: 1, hp: 2, tool: 'pick', drop: [['salt', 1, 3]], xp: ['mining', 3] };
const _buildObjectsW = buildObjects;
buildObjects = function () { _buildObjectsW(); for (const k of ['clay_mound', 'salt_crust']) { const c = PIX.get(k); if (c) SPR[k] = c; } };

/* ---------- C4 slaughter ---------- */
const BUTCHER = { chicken: [['poultry', 1, 2], ['raptor_feather', 0, 0], ['bone', 0, 1]], duck: [['poultry', 1, 2], ['duck_feather', 1, 2]], rabbit: [['rabbit_meat', 1, 2], ['rabbit_foot', 0, 0]],
  goat: [['red_meat', 2, 3], ['hide', 1, 1], ['bone', 1, 1]], sheep: [['red_meat', 2, 3], ['wool', 1, 2], ['bone', 1, 1]], cow: [['red_meat', 3, 5], ['hide', 1, 2], ['bone', 1, 2]], pig: [['pork', 3, 5], ['hide', 1, 1], ['bone', 1, 1]] };
function slaughter(a) {
  const B = BUTCHER[a.sp]; if (!B) return;
  S.animals = S.animals.filter(o => o !== a); const got = [];
  for (const [id, lo, hi] of B) { if (!IT[id]) continue; const n = ri(lo, hi) + (a.age >= ANIMAL[a.sp].adult ? 0 : -1); if (n > 0) { give(id, n, 0, true); got.push(n + ' ' + IT[id].n); } }
  addXP('husbandry', 15); SFX.chop(); toast(a.name + ' was slaughtered. ' + (got.length ? 'You got ' + got.join(', ') + '.' : ''), 'lvl');
}
const _animalCardW = animalCard;
animalCard = function (a, acts) {
  if (acts && BUTCHER[a.sp]) { let sure = 0; acts.append(el('button', { class: 'btn ghost', on: e => { if (++sure < 2) { e.target.textContent = 'Slaughter ' + a.name + '? Click again'; return; } slaughter(a); refresh(); } }, 'Slaughter')); }
  return _animalCardW(a, acts);
};

/* ---------- C3 clay mounds and salt crusts ---------- */
function spawnNodes(m) {
  S.flags = S.flags || {}; if (!m || S.flags['nodes_' + m.id]) return;
  const coast = b => b === 'coast' || b === 'isles' || b === 'reef' || m.region === 'saltreach';
  let clay = 0, salt = 0;
  for (let k = 0; k < 6000 && (clay < 28 || salt < 14); k++) {
    const x = 3 + Math.floor(Math.random() * (m.w - 6)), y = 3 + Math.floor(Math.random() * (m.h - 6)), t = getT(m, x, y);
    if (t !== 's' || getO(m, x, y) || m.solidB[y * m.w + x] || (m.safe && dist(x, y, m.safe[0], m.safe[1]) < 18)) continue;
    const wet = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (TER[getT(m, x + dx, y + dy)] || {}).water);
    const b = m.bio ? BIOMES[m.bio[y * m.w + x]] : null;
    if (coast(b) && salt < 14 && Math.random() < .5) { setO(m, x, y, { k: 'salt_crust' }); salt++; }
    else if (wet && clay < 28) { setO(m, x, y, { k: 'clay_mound' }); clay++; }
  }
  S.flags['nodes_' + m.id] = 1;
}
EVT.on('map', id => { const m = MAPS[id]; if (m && m.wild && S && !TITLE) spawnNodes(m); });

/* ---------- C2 wild flowers and mushrooms ---------- */
function pickWild(m, x, y, o) {
  const bio = m.bio ? BIOMES[m.bio[y * m.w + x]] : 'meadow';
  let id;
  if (o.k === 'mushroom') id = pickR(['red_cap', 'morel'].filter(k => IT[k]));
  else { const L = ((FORAGE[bio] || FORAGE.meadow || [])[S.season] || []).filter(k => IT[k]); id = L.find(k => IT[k].sh === 'flower') || pickR(L.length ? L : ['dandelion']); }
  if (!id || !IT[id]) return;
  setO(m, x, y, null); give(id, 1, forageQ()); addXP('foraging', 3); SFX.pop(); sparkle(x, y, '#f5e08a');
  (S.respawn = S.respawn || []).push({ map: m.id, x, y, o: { k: o.k, v: o.v }, at: worldMin() + 2 * 1440 });
}
const _objInteractWild = objInteract;
objInteract = function (m, x, y, o) {
  if ((o.k === 'flower' || o.k === 'mushroom') && m.wild) return { label: 'Pick', fn: () => pickWild(m, x, y, o) };
  return _objInteractWild(m, x, y, o);
};

/* ---------- C1 the pet ---------- */
function petEnt() { const m = MAPS.farm; return m && m.ents.find(e => e.type === 'pet'); }
function ensurePetEnt() {
  const m = MAPS.farm; if (!S.pet || !m) return;
  let e = petEnt(); if (!e) { e = { type: 'pet', x: S.pet.x || 12 * 16, y: S.pet.y || 12 * 16, t: 0, f: 0, sit: 0, flip: 0 }; m.ents.push(e); }
  return e;
}
const _drawEntW = drawEnt;
drawEnt = function (e) {
  if (e.type !== 'pet') return _drawEntW(e);
  const fr = e.sit > 1.2 ? 2 : (e.moving ? Math.floor(e.t * 8) % 2 : 0), spr = PIX.get('pet_' + S.pet.kind + '_' + fr); if (!spr) return;
  shadow(e.x, e.y, 5);
  if (e.flip) { g.save(); g.translate(e.x, 0); g.scale(-1, 1); D(spr, -8, e.y - 15, 16, 16); g.restore(); } else D(spr, e.x - 8, e.y - 15, 16, 16);
  if (e.heart > 0) { e.heart -= 1 / 60; g.fillStyle = '#e84a6a'; g.fillRect(e.x - 1, e.y - 20 - (1 - e.heart) * 6, 3, 2); g.fillRect(e.x - 2, e.y - 21 - (1 - e.heart) * 6, 2, 1); g.fillRect(e.x + 1, e.y - 21 - (1 - e.heart) * 6, 2, 1); }
};
const _updateW = update;
update = function (dt) {
  _updateW(dt);
  if (!S || !S.pet || TITLE) return; const e = ensurePetEnt(); if (!e) return;
  e.t += dt; const onFarm = cur && cur.id === 'farm', tx = onFarm ? S.p.x - 14 : e.x, ty = onFarm ? S.p.y + 4 : e.y, d = Math.hypot(tx - e.x, ty - e.y);
  if (onFarm && d > 22) { const sp = d > 90 ? 95 : 60; e.moving = moveEnt(MAPS.farm, e, (tx - e.x) / d * sp * dt, (ty - e.y) / d * sp * dt, 4); if (Math.abs(tx - e.x) > 2) e.flip = tx < e.x ? 1 : 0; e.sit = 0; if (d > 260) { e.x = tx; e.y = ty; } }
  else { e.moving = false; e.sit += dt; }
  S.pet.x = e.x; S.pet.y = e.y;
};
const _findInteractW = findInteract;
findInteract = function () {
  const e = S && S.pet && cur && cur.id === 'farm' && petEnt();
  if (e) { const [fx, fy] = facePt(); if (Math.hypot(fx - e.x, fy - (e.y - 6)) < 16 || Math.hypot(S.p.x - e.x, S.p.y - e.y) < 14) return { label: 'Pet ' + S.pet.name, fn: () => {
    if (S.pet.pet === dayIndex()) { toast(S.pet.name + ' wags happily.'); e.heart = 1; return; }
    S.pet.pet = dayIndex(); S.pet.aff = Math.min(100, (S.pet.aff || 0) + 5); e.heart = 1; SFX.ok(); toast('You pet ' + S.pet.name + '. (affection ' + S.pet.aff + ')');
  } }; }
  return _findInteractW();
};
const DIGS = [['clay', 1, 3, 30], ['stone', 2, 5, 20], ['bone', 1, 1, 14], ['$', 20, 120, 14], ['herb', 1, 2, 10], ['wild_leek', 1, 2, 8], ['geode', 1, 1, 3], ['amethyst', 1, 1, 1]];
const _showDayReportW = showDayReport;
showDayReport = function (lines) {
  if (S.pet) {
    if (Math.random() < .14 + (S.pet.aff || 0) * .0012) {
      const pool = DIGS.filter(([id]) => id === '$' || IT[id]); let r = Math.random() * pool.reduce((a, d) => a + d[3], 0), pick = pool[0];
      for (const d of pool) { r -= d[3]; if (r <= 0) { pick = d; break; } }
      if (Math.random() < .04) { const arts = Object.keys(IT).filter(k => IT[k].t === 'artifact'); if (arts.length) pick = [pickR(arts), 1, 1]; }
      const n = ri(pick[1], pick[2]); give(pick[0], n, 0, true);
      lines = lines.concat([['heart', S.pet.name + ' dug something up overnight: ' + (pick[0] === '$' ? n + 'g' : n + ' ' + IT[pick[0]].n) + '!']]);
    }
    if (S.pet.pet !== dayIndex() - 1 && S.pet.aff > 0) S.pet.aff = Math.max(0, S.pet.aff - 1);
  } else if (S.day >= 2 || S.season > 0 || S.year > 1) { S.flags = S.flags || {}; if (!S.flags.petHint) { S.flags.petHint = 1; lines = lines.concat([['animal', 'Odile at the stables says a stray has been hanging around. Maybe it needs a home?']]); } }
  return _showDayReportW(lines);
};
const _openModalW = openModal;
openModal = function (title, tabs, start, opts) {
  if (title === 'Odile\'s Stables' && !S.pet && (S.day >= 2 || S.season > 0 || S.year > 1)) tabs = tabs.concat([{ id: 'stray', label: 'The stray', render: b => {
    b.append(el('p', null, '"A stray\'s been sleeping in my hay for a week. Skittish thing, but sweet. Bring me two fish so I can coax it out, and it\'s yours. It\'ll need a farm, and a friend."'));
    const fish = catCount('$fish');
    if (fish < 2) { b.append(el('p', { class: 'note' }, 'Bring 2 fish (any kind). You have ' + fish + '.')); return; }
    const nameIn = el('input', { placeholder: 'Name it', maxlength: 14 }); nameIn.style.cssText = 'padding:4px 8px;width:160px';
    const adopt = kind => { catTake('$fish', 2); S.pet = { kind, name: nameIn.value.trim() || (kind === 'dog' ? 'Biscuit' : 'Ember'), aff: 10, x: 12 * 16, y: 12 * 16 }; SFX.lvl(); toast(S.pet.name + ' the ' + kind + ' is coming home with you!', 'lvl'); closeModal(); };
    b.append(el('div', { class: 'acts wrap' }, nameIn, el('button', { class: 'btn', on: () => adopt('dog') }, 'Adopt the dog'), el('button', { class: 'btn', on: () => adopt('cat') }, 'Adopt the cat')));
  } }]);
  return _openModalW(title, tabs, start, opts);
};
