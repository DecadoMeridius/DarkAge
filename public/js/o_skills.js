/* ================= Phase 3: skilling on ticks, levels 1-99, stations =================
   LEVELS: every life skill keeps total XP in S.sk[k].tx and a 1-99 level S.sk[k].L on the
   RuneScape curve (XPT from n_combat.js). S.sk[k].l is still the old 1-10 scale, derived
   as 1 + floor(L / 10), so every older check (recipe and tool gates, perks) keeps working;
   requirements are shown to the player on the 1-99 scale (old N = level (N - 1) x 10).
   XP grants from the old game are multiplied by XP_MULT so 99 is a long grind.
   PASSIVE PICKS: every 10 levels choose 1 of 3 passives for that skill (9 per skill).
   GATHERING: using an axe or pickaxe on a tree, log or rock starts an action that rolls
   success every tick (level, tool tier, the node's difficulty). Each success puts one
   unit in the backpack; the node depletes after a few. Rocks and ores in the Wilds respawn
   after a day; trees already regrow from stumps. Nodes have level requirements
   (NODE_REQ). Moving cancels.
   STATIONS: furnace (bars), anvil (weapons and armour), tanning rack (leather), kitchen
   (stove, fireplace, campfire), field kit (anywhere). Making things at a station runs as a
   timed batch on ticks; moving cancels. Anvils and tanning racks can be built. */

const XP_MULT = 1; // Phase 9: the original XP amounts already pace a 1-99 curve (level 10 in ~an hour of a skill)
const LIFE = ['farming', 'husbandry', 'foraging', 'woodcutting', 'mining', 'fishing', 'cooking', 'smithing', 'crafting'];
SKN.crafting = 'Crafting'; if (!SK.includes('crafting')) SK.push('crafting'); // S.sk.combat stays: it mirrors the combat level for older code
const oldToRS = l => l <= 1 ? 1 : (l - 1) * 10;
function ensureLife(s = S) {
  if (!s || !s.sk) return;
  for (const k of LIFE) {
    const v = s.sk[k] = s.sk[k] || { l: 1, xp: 0 };
    if (v.tx === undefined) { const L0 = oldToRS(v.l), frac = v.l >= 10 ? 0 : (v.xp || 0) / xpNeed(v.l); v.tx = XPT[L0] + Math.floor(frac * ((XPT[Math.min(99, L0 + 10)] || XPT[99]) - XPT[L0])); }
    v.L = lvlFor(v.tx); v.l = Math.min(10, 1 + Math.floor(v.L / 10));
  }
}
const lifeL = k => (S.sk[k] && S.sk[k].L) || 1;

/* ---- passive picks ---- */
const GEN = (k, t) => [[`${k}_swift${t}`, 'Swift Hands', 'Actions in this skill are 8% more likely to succeed.'], [`${k}_bounty${t}`, 'Bountiful', '+6% chance to get a double yield.'], [`${k}_study${t}`, 'Studious', '+6% XP in this skill.']];
function pickOpts(k, tier) {
  const old = PERKS[k] && tier <= 2 ? PERKS[k][tier - 1].slice() : []; // the original specialties come first
  const gen = GEN(k, tier); while (old.length < 3) old.push(gen[old.length === 2 ? 2 : old.length]);
  return old.slice(0, 3);
}
const perkCount = (k, kind) => Object.keys(S.perks).filter(p => p.startsWith(k + '_' + kind)).length;
showPerk = function () {
  let [sk, tier] = S.pendingPerk[0]; if (typeof tier === 'number') tier = tier + 1; else tier = +String(tier).slice(1); // old saves stored 0/1
  const opts = pickOpts(sk, tier);
  openModal(SKN[sk] + ' level ' + tier * 10, [{ id: 'p', label: 'Choose', render: b => {
    b.append(el('p', { class: 'note' }, 'Choose a passive for ' + SKN[sk] + '. You get a new choice every 10 levels.'));
    const row = el('div', { class: 'perkpick' });
    opts.forEach(([id, n, d]) => row.append(el('button', { class: 'perkcard f-panel', on: () => { S.perks[id] = 1; S.pendingPerk.shift(); MODAL.lock = false; closeModal(); recalc(); toast(n + ' learned.', 'lvl'); } }, el('b', null, n), el('p', null, d))));
    b.append(row);
  } }]);
  MODAL.lock = true;
};

/* ---- XP ---- */
addXP = function (k, n) {
  if (k === 'combat' || !S.sk[k]) return; ensureLife();
  const s = S.sk[k], before = s.L, mult = XP_MULT * (1 + perkCount(k, 'study') * .06);
  s.tx = Math.min(200e6, s.tx + n * mult); s.L = lvlFor(s.tx); s.l = Math.min(10, 1 + Math.floor(s.L / 10));
  if (s.L > before) {
    toast(SKN[k] + ' is now level ' + s.L + '!', 'lvl'); SFX.lvl();
    for (let L = before + 1; L <= s.L; L++) if (L % 10 === 0 && L <= 90) S.pendingPerk.push([k, 't' + L / 10]);
    recalc();
  }
};
renderSkills = function (b) {
  ensureLife(); if (typeof renderCombatSkills === 'function') renderCombatSkills(b);
  const list = el('div', { class: 'list' });
  for (const k of LIFE) {
    const s = S.sk[k], L = s.L, lo = XPT[L], hi = XPT[L + 1] || s.tx, picks = Object.keys(S.perks).filter(p => p.startsWith(k + '_') || (PERKS[k] || []).flat().some(q => q[0] === p));
    const names = picks.map(p => { const o = (PERKS[k] || []).flat().find(q => q[0] === p); if (o) return o[1]; const g = GEN(k, 1).find(q => p.startsWith(q[0].replace(/\d+$/, ''))); return g ? g[1] : p; });
    list.append(el('div', { class: 'srow' }, el('div', { class: 'slv' }, L), el('div', { class: 'rtxt' }, el('b', null, SKN[k]), el('div', { class: 'sbar' }, el('i', { style: 'width:' + (L >= 99 ? 100 : (s.tx - lo) / (hi - lo) * 100) + '%' })),
      el('small', null, Math.floor(s.tx).toLocaleString() + ' xp' + (L < 99 ? ' · ' + (hi - Math.floor(s.tx)).toLocaleString() + ' to level ' + (L + 1) : ' · mastered') + ' · next passive at ' + Math.min(90, (Math.floor(L / 10) + 1) * 10)),
      names.length ? el('div', { class: 'perks' }, ...names.map(n => el('span', { class: 'perk' }, n))) : null)));
  }
  b.append(list);
};

/* ---- recipes: stations, requirements shown 1-99, crafting skill ---- */
STATION_N.furnace = 'Furnace'; STATION_N.anvil = 'Anvil'; STATION_N.tanning = 'Tanning rack';
for (const r of RC) {
  const it = IT[r[0]]; if (!it) continue;
  if (r[3] === 'forge') r[3] = it.t === 'bar' ? 'furnace' : 'anvil';
  if (it.tier === 'leather' && (it.t === 'armor' || it.t === 'weapon')) r[3] = 'tanning';
}
I('leather', 'Leather', 'mat', 60, 'hide', '#a8703e', null, {});
RC.push(['leather', 1, { hide: 2 }, 'tanning', ['crafting', 1]]);
for (const r of RC) if (IT[r[0]] && IT[r[0]].tier === 'leather' && r[3] === 'tanning') { if (r[2].hide) { r[2].leather = r[2].hide; delete r[2].hide; } }
// build your own stations at the field kit
I('anvil', 'Anvil', 'place', 300, 'obj', null, null, { place: 'anvil' }); I('tanrack', 'Tanning Rack', 'place', 120, 'obj', null, null, { place: 'tanrack' });
OBJ.anvil = { solid: 1, place: 1, tall: 1 }; OBJ.tanrack = { solid: 1, place: 1, tall: 1 };
RC.push(['anvil', 1, { iron_bar: 4, stone: 10 }, 'bench', ['smithing', 2]], ['tanrack', 1, { wood: 12, fiber: 6 }, 'bench']);
const _canCraftS = canCraft;
canCraft = function (r, n = 1) { ensureLife(); const w = _canCraftS(r, n); return w && r[4] && w.startsWith('Needs ' + SKN[r[4][0]]) ? 'Needs ' + SKN[r[4][0]] + ' ' + oldToRS(r[4][1]) : w; };
const _stationNearS = stationNear;
stationNear = function (st) {
  if (st === 'furnace' || st === 'anvil' || st === 'tanning') {
    const m = cur, want = { furnace: ['forge', 'furn_forge'], anvil: ['anvil', 'furn_anvil'], tanning: ['tanrack'] }[st];
    for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && want.includes(o.k) && dist(S.p.x, S.p.y, (i % m.w + .5) * 16, ((i / m.w | 0) + .5) * 16) < 48) return true; }
    if (st !== 'tanning') for (const b of m.bld) if (b.act === 'smith' && dist(S.p.x, S.p.y, (b.door.x + .5) * 16, (b.door.y + .5) * 16) < 45) return true;
    if (MODAL && (MODAL.opts.station === st || (MODAL.opts.station === 'forge' && st !== 'tanning'))) return true;
    return false;
  }
  return _stationNearS(st);
};
const _objInteractS = objInteract;
objInteract = function (m, x, y, o) {
  if (o.k === 'anvil' || o.k === 'furn_anvil') return { label: 'Smith', fn: () => openMenu('craft', 'anvil') };
  if (o.k === 'tanrack') return { label: 'Tan', fn: () => openMenu('craft', 'tanning') };
  if (o.k === 'forge' || o.k === 'furn_forge') return { label: 'Smelt', fn: () => openMenu('craft', 'furnace') };
  return _objInteractS(m, x, y, o);
};
const _buildObjectsS = buildObjects;
buildObjects = function () { _buildObjectsS(); SPR.anvil = PIX.get('furn_anvil') || SPR.forge; SPR.tanrack = PIX.get('tanrack') || SPR.forge; };

/* ---- timed batches at stations ---- */
const JOB_TICKS = { furnace: 3, anvil: 4, tanning: 3, kitchen: 3 };
let JOB = null, JOB_RUN = false;
let _doCraftS = doCraft; // reassigned below to fix Smithing XP
doCraft = function (r, n = 1) {
  if (JOB_RUN || !JOB_TICKS[r[3]]) { const before = S.stats.crafted; _doCraftS(r, n); if (S.stats.crafted > before && (r[3] === 'tanning' || r[3] === 'bench' || (IT[r[0]] && IT[r[0]].t === 'ring'))) addXP('crafting', 4 + Math.round(IT[r[0]].p / 50)); return; }
  const why = canCraft(r); if (why) { toast(why, 'bad'); return; }
  JOB = { r, left: n, done: 0, total: n, t: 0, need: JOB_TICKS[r[3]], at: [S.p.x, S.p.y] };
  if (MODAL) { MODAL.lock = false; closeModal(); }
  toast(({ furnace: 'Smelting', anvil: 'Smithing', tanning: 'Tanning', kitchen: 'Cooking' })[r[3]] + ' ' + IT[r[0]].n + (n > 1 ? ' ×' + n : '') + '…');
};
function jobTick() {
  if (!JOB) return;
  if (Math.hypot(S.p.x - JOB.at[0], S.p.y - JOB.at[1]) > 3) { toast('You stop working.'); JOB = null; return; }
  pl.anim = .25; pl.tool = JOB.r[3] === 'anvil' ? 'pick' : 'axe'; if (JOB.r[3] === 'anvil') snd(880, .05, 'square', .03); else noiseBurst(.05, .02, 1200);
  if (++JOB.t < JOB.need) return;
  JOB.t = 0;
  const why = canCraft(JOB.r); if (why) { toast(why, 'bad'); JOB = null; return; }
  JOB_RUN = true; doCraft(JOB.r, 1); JOB_RUN = false; JOB.done++;
  if (--JOB.left <= 0) JOB = null;
}

/* ---- gathering on ticks ---- */
const NODE_REQ = {
  ore_copper: 1, ore_coal: 10, ore_iron: 15, ore_gem: 20, ore_silver: 30, ore_gold: 40, ore_mythril: 55, ore_frost: 70, ore_obsidian: 75, ore_adamant: 85, ore_star: 99,
  rock: 1, rockS: 1, rockA: 1, rockC: 1, boulder: 10, cracked: 15, iceboulder: 60, obsboulder: 75, meteor: 90,
  stump: 1, bramble: 15, log: 30, ancient: 60,
};
const TREE_REQ = { oak: 1, birch: 1, dead: 1, pine: 1, maple: 10, palm: 15 }; // common trees stay open to new players
const nodeReq = o => o.k === 'tree' ? TREE_REQ[o.kind || 'oak'] || 1 : NODE_REQ[o.k] || 1;
let GATHER = null;
const _useToolS = useTool;
useTool = function () {
  const k = selKind();
  if (k === 'axe' || k === 'pick') {
    const m = cur, [tx, ty] = faceTile(), [ax, ay, o] = mainOf(m, tx, ty), D = o && OBJ[o.k];
    if (o && D && D.tool === k && !D.place && D.drop && o.k !== 'ftree') {
      ensureLife(); const skill = D.xp ? D.xp[0] : k === 'axe' ? 'woodcutting' : 'mining', need = nodeReq(o);
      if (D.tlvl && (S.tools[k] || 1) < D.tlvl) return _useToolS();
      if (lifeL(skill) < need) { toast('You need ' + SKN[skill] + ' level ' + need + '.', 'bad'); SFX.bad(); o.shake = .2; pl.cd = .3; return; }
      if (GATHER && GATHER.o === o) return;
      GATHER = { m, x: ax, y: ay, o, k, skill, at: [S.p.x, S.p.y], dir: S.p.dir };
      if (o.left === undefined) { const [, a, b] = D.drop[0]; o.left = ri(a, b) + (D.ore && hasPerk('miner') ? 1 : 0); }
      pl.anim = .25; pl.tool = k; pl.cd = .3; return;
    }
  }
  return _useToolS();
};
function gatherTick() {
  const G = GATHER; if (!G) return;
  const [ix, iy] = keyVec();
  if (cur !== G.m || G.m.o[G.y * G.m.w + G.x] !== G.o || Math.hypot(S.p.x - G.at[0], S.p.y - G.at[1]) > 3 || Math.abs(ix) + Math.abs(iy) > .2 || WALK) { GATHER = null; return; }
  if (S.p.st <= 0) { toast('Too tired to work. Eat or sleep.', 'bad'); GATHER = null; return; }
  const D = OBJ[G.o.k];
  pl.anim = .25; pl.tool = G.k; G.o.shake = .2; D.tool === 'pick' ? SFX.pick() : SFX.chop();
  for (let i = 0; i < 4; i++) PARTS.push({ x: (G.x + .5) * 16, y: (G.y + .5) * 16, vx: (Math.random() - .5) * 60, vy: -Math.random() * 60, t: .4, c: D.tool === 'axe' ? '#9a6a3a' : '#8e8a84' });
  if (!(G.skill === 'woodcutting' && hasPerk('arborist'))) useStamina(.6);
  const chance = clamp(.3 + (lifeL(G.skill) - nodeReq(G.o)) * .015 + (S.tools[G.k] || 1) * .07 + perkCount(G.skill, 'swift') * .08, .08, .95);
  if (Math.random() > chance) return;
  const [id] = D.drop[0], units = Math.max(1, G.o.left);
  let n = 1; if (Math.random() < perkCount(G.skill, 'bounty') * .06 || (id === 'wood' && hasPerk('forester') && Math.random() < .12)) n = 2;
  give(id, n); if (D.xp) addXP(D.xp[0], D.xp[1] / (G.o.total || (G.o.total = units)));
  if (--G.o.left > 0) return;
  // depleted: run the original break-up for its extras (hardwood, sap, ladders, stumps...) without the main drop or XP again
  const saveDrop = D.drop, saveXp = D.xp; D.drop = saveDrop.slice(1); D.xp = null;
  try { hitObj(G.m, G.x, G.y, G.o, 1e9); } finally { D.drop = saveDrop; D.xp = saveXp; }
  if (G.m.wild && D.tool === 'pick') (S.respawn = S.respawn || []).push({ map: G.m.id, x: G.x, y: G.y, o: { k: G.o.k, v: G.o.v, cave: G.o.cave }, at: worldMin() + 1440 });
  GATHER = null;
}
const worldMin = () => dayIndex() * 1440 + S.time;
function respawnTick() {
  if (!S.respawn || !S.respawn.length) return;
  const now = worldMin();
  S.respawn = S.respawn.filter(r => { if (now < r.at) return true; const m = MAPS[r.map]; if (!m) return false; if (getO(m, r.x, r.y) || Math.hypot(S.p.x / 16 - r.x, S.p.y / 16 - r.y) < 2 && cur === m) return true; putObj(m, r.x, r.y, r.o); return false; });
}

EVT.on('tick', n => { if (!S || PAUSED) return; ensureLife(); gatherTick(); jobTick(); if (n % 10 === 0) respawnTick(); });
const _hudTickS = hudTick;
hudTick = function (dt) {
  _hudTickS(dt); if (!S || TITLE || !$('#pL')) return;
  if (JOB) $('#pL').innerHTML = '<kbd>' + (JOB.done + 1) + '/' + JOB.total + '</kbd>' + IT[JOB.r[0]].n + ' (move to stop)';
  else if (GATHER) $('#pL').innerHTML = '<kbd>' + SKN[GATHER.skill] + ' ' + lifeL(GATHER.skill) + '</kbd>' + (GATHER.k === 'axe' ? 'Chopping' : 'Mining') + '… (move to stop)';
};

/* the crafting window gets the new station filters */
const _renderCraftS = renderCraft;
renderCraft = function (b) {
  _renderCraftS(b);
  const bar = b.querySelector('.chips'); if (!bar) return;
  [...bar.querySelectorAll('.chip')].forEach(c => { if (/^Forge/.test(c.textContent)) c.remove(); });
  const st = MODAL.opts.st || 'all', ready = bar.lastChild;
  for (const [k, n] of [['furnace', 'Furnace'], ['anvil', 'Anvil'], ['tanning', 'Tanning rack']]) bar.insertBefore(el('button', { class: 'chip' + (st === k ? ' on' : '') + (stationNear(k) ? '' : ' dim'), on: () => { MODAL.opts.st = k; refresh(); } }, n + (stationNear(k) ? ' ✓' : '')), ready);
};
const _openMenuS = openMenu;
openMenu = function (tab, station, focus) { _openMenuS(tab, station, focus); if (MODAL && station && ['furnace', 'anvil', 'tanning'].includes(station)) { MODAL.opts.st = station; MODAL.opts.station = station; refresh(); } };

const _startGameS = startGame;
startGame = function (isNew) { _startGameS(isNew); ensureLife(); GATHER = JOB = null; recalc(); };
const _recalcS = recalc;
recalc = function () { ensureLife(); _recalcS(); }; // loaded saves may predate the crafting skill

/* the old crafting code only knew the 'forge' station: give Smithing (not Foraging) XP for furnace and anvil work */
const _doCraftS2 = _doCraftS;
_doCraftS = function (r, n) {
  const before = S.stats.crafted; _doCraftS2(r, n); const made = S.stats.crafted - before;
  if (made > 0 && (r[3] === 'furnace' || r[3] === 'anvil')) { S.sk.foraging.tx = Math.max(0, S.sk.foraging.tx - made * 2 * XP_MULT); ensureLife(); addXP('smithing', made * (6 + Math.round(IT[r[0]].p / 40))); }
};

/* hold the equipped weapon in hand (the old art only showed it mid-swing) */
const _drawPlayerS = drawPlayer;
drawPlayer = function () {
  const back = S.p.dir === 3, id = S.eq.weapon, show = id && !S.mounted && pl.swing <= 0 && !(pl.anim > 0 && isTool(pl.tool) && pl.tool !== 'weapon') && pl.roll <= 0;
  const draw = () => { const ic = itemIcon(id); if (!ic) return; const side = S.p.dir === 1 ? -1 : S.p.dir === 2 ? 1 : S.p.dir === 0 ? 1 : -1; g.save(); g.translate(S.p.x + side * 6, S.p.y - 9); if (side < 0) g.scale(-1, 1); g.rotate(-.35); D(ic, -2, -9, 10, 10); g.restore(); };
  if (show && back) draw();
  _drawPlayerS();
  if (show && !back) draw();
};
