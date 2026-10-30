/* ================= Phase 2: RuneScape-style combat on the 0.6 s tick =================
   COMBAT SKILLS (S.csk): melee, ranged, magic, defence, constitution, levels 1-99 on the
   RuneScape XP curve. Combat level = (sum of the five) / 3. Constitution starts at 10 and
   sets max health (x10). Hits give XP to the weapon's style and Constitution; taking hits
   trains Defence. The old 1-10 'combat' skill is migrated into these once.
   TARGETING: click (or right click) an enemy to target it. You walk into weapon range and
   auto-attack every N ticks (dagger 3, sword 4, bow 4, spear 5, warhammer 6). Each hit rolls
   accuracy (your level + bonuses vs the enemy's defence) then damage from 1 to max hit.
   Red splat = damage, blue splat = miss/blocked. Getting hit with no target targets the
   attacker (auto-retaliate). Enemies in melee range also attack on ticks; boss telegraphs
   (slams, rings, volleys) stay real-time and dodgeable.
   FOCUS (0-100) builds from your hits and pays for abilities in three slots (Z, X, C).
   PASSIVE PTREE (S.tree): about 40 nodes in three regions, one point per combat level
   above 3. Opened with Tab or T. Respec costs gold at the village altar. */

/* ---------- skills ---------- */
const CSK = ['melee', 'ranged', 'magic', 'defence', 'constitution'];
const CSKN = { melee: 'Melee', ranged: 'Ranged', magic: 'Magic', defence: 'Defence', constitution: 'Constitution' };
const XPT = [0, 0]; for (let L = 2, p = 0; L <= 100; L++) { p += Math.floor(L - 1 + 300 * Math.pow(2, (L - 1) / 7)); XPT[L] = Math.floor(p / 4); } // RuneScape curve: XPT[L] = xp needed for level L
const lvlFor = xp => { let L = 1; while (L < 99 && xp >= XPT[L + 1]) L++; return L; };
function ensureCombat(s = S) {
  if (!s || s.csk) return;
  const old = s.sk && s.sk.combat ? s.sk.combat.l : 1, base = XPT[Math.min(99, 1 + (old - 1) * 4)] || 0; // carry old progress over
  s.csk = { melee: { xp: base }, ranged: { xp: 0 }, magic: { xp: 0 }, defence: { xp: Math.floor(base * .6) }, constitution: { xp: Math.max(XPT[10], Math.floor(base * .8)) } };
  s.tree = s.tree || { taken: ['root'] }; s.abil = s.abil || ['cleave', 'lunge', 'guard']; s.focus = 0;
}
const clv = k => lvlFor(S.csk[k].xp);
const combatLevel = () => Math.floor(CSK.reduce((a, k) => a + clv(k), 0) / 3);
function cxp(k, n) {
  ensureCombat(); const before = clv(k); S.csk[k].xp = Math.min(200e6, S.csk[k].xp + n); const after = clv(k);
  if (after > before) { toast(CSKN[k] + ' is now level ' + after + '! (Combat ' + combatLevel() + ')', 'lvl'); SFX.lvl(); recalc(); }
}
const _addXP = addXP;
addXP = function (k, n) { if (k === 'combat') return; _addXP(k, n); }; // combat XP now comes from hits

/* ---------- passive tree ---------- */
// node: [id, x, y, name, stats, kind] kind: s small, n notable, k keystone, a ability unlock. Links in PTREE_LINKS.
const PTREE = [
  ['root', 0, 0, 'Start', {}, 'r'],
  // Might (left): damage, health, warhammers
  ['m1', -1, 0, '+5% damage', { dmg: .05 }, 's'], ['m2', -2, 0, '+20 health', { maxhp: 20 }, 's'], ['m3', -3, -1, '+5% damage', { dmg: .05 }, 's'], ['m4', -3, 1, '+3 defence', { def: 3 }, 's'],
  ['m5', -4, 0, 'Heavy Hands', { dmg: .12, maxhp: 20 }, 'n', '+12% damage and +20 health'], ['m6', -5, -1, '+5% damage', { dmg: .05 }, 's'], ['m7', -5, 1, '+30 health', { maxhp: 30 }, 's'],
  ['m8', -6, 0, 'Rend', {}, 'a', 'Unlocks Rend: a strike that bleeds the target for 4 ticks'], ['m9', -6, -2, '+5% damage', { dmg: .05 }, 's'], ['m10', -7, -2, 'Executioner', { exec: 1 }, 'n', '+30% damage to enemies below 30% health'],
  ['m11', -6, 2, '+4 defence', { def: 4 }, 's'], ['m12', -7, 2, 'Iron Skin', { def: 10, maxhp: 30 }, 'n', '+10 defence, +30 health'], ['m13', -8, 0, 'Berserker', { dmg: .4, noGuard: 1 }, 'k', '+40% damage, but you cannot use Guard'],
  // Precision (right): accuracy, crit, speed, bows
  ['p1', 1, 0, '+4 accuracy', { acc: 4 }, 's'], ['p2', 2, 0, '+3% critical', { crit: .03 }, 's'], ['p3', 3, -1, '+4 accuracy', { acc: 4 }, 's'], ['p4', 3, 1, '+4% move speed', { spd: .04 }, 's'],
  ['p5', 4, 0, 'Keen Eye', { crit: .08, acc: 6 }, 'n', '+8% critical, +6 accuracy'], ['p6', 5, -1, '+3% critical', { crit: .03 }, 's'], ['p7', 5, 1, '+4 accuracy', { acc: 4 }, 's'],
  ['p8', 6, 0, 'Volley', {}, 'a', 'Unlocks Volley: three quick shots (bow) or three quick strikes'], ['p9', 6, -2, '+3% critical', { crit: .03 }, 's'], ['p10', 7, -2, 'Quick Hands', { haste: 1 }, 'n', 'Attacks are 1 tick faster (minimum 2)'],
  ['p11', 6, 2, '+5% move speed', { spd: .05 }, 's'], ['p12', 7, 2, 'Bloodletter', { critFocus: 1 }, 'n', 'Critical hits give +15 Focus'], ['p13', 8, 0, 'Deadeye', { crit: .25, maxhpPct: -.2 }, 'k', '+25% critical chance, -20% max health'],
  // Arcana (up): focus, sustain
  ['a1', 0, -1, '+2 Focus per hit', { fgain: 2 }, 's'], ['a2', 0, -2, '+15 health', { maxhp: 15 }, 's'], ['a3', -1, -3, '+2 Focus per hit', { fgain: 2 }, 's'], ['a4', 1, -3, '+1 health regen', { regen: 1 }, 's'],
  ['a5', 0, -4, 'Flow', { fgain: 4, abCd: .15 }, 'n', '+4 Focus per hit, abilities recharge 15% faster'], ['a6', -1, -5, '+2 Focus per hit', { fgain: 2 }, 's'], ['a7', 1, -5, '+20 health', { maxhp: 20 }, 's'],
  ['a8', 0, -6, 'Second Wind', {}, 'a', 'Unlocks Second Wind: heal 25% of your health'], ['a9', -2, -6, 'Refund', { refund: .2 }, 'n', 'Abilities refund 20% Focus when they kill'], ['a10', 2, -6, 'Warded', { def: 8, regen: 1 }, 'n', '+8 defence, +1 health regen'],
  ['a11', 0, -7, 'Overflow', { focusMax: 50, fgain: 3 }, 'k', 'Focus can reach 150, +3 Focus per hit; you start fights with none'],
];
const PTREE_LINKS = [['root', 'm1'], ['m1', 'm2'], ['m2', 'm3'], ['m2', 'm4'], ['m3', 'm5'], ['m4', 'm5'], ['m5', 'm6'], ['m5', 'm7'], ['m6', 'm8'], ['m7', 'm8'], ['m6', 'm9'], ['m9', 'm10'], ['m7', 'm11'], ['m11', 'm12'], ['m8', 'm13'],
  ['root', 'p1'], ['p1', 'p2'], ['p2', 'p3'], ['p2', 'p4'], ['p3', 'p5'], ['p4', 'p5'], ['p5', 'p6'], ['p5', 'p7'], ['p6', 'p8'], ['p7', 'p8'], ['p6', 'p9'], ['p9', 'p10'], ['p7', 'p11'], ['p11', 'p12'], ['p8', 'p13'],
  ['root', 'a1'], ['a1', 'a2'], ['a2', 'a3'], ['a2', 'a4'], ['a3', 'a5'], ['a4', 'a5'], ['a5', 'a6'], ['a5', 'a7'], ['a6', 'a8'], ['a7', 'a8'], ['a6', 'a9'], ['a7', 'a10'], ['a8', 'a11'], ['m3', 'a3'], ['p3', 'a4']];
const PNODE = Object.fromEntries(PTREE.map(n => [n[0], n]));
const treePoints = () => Math.max(0, combatLevel() - 3) - (S.tree.taken.length - 1);
const treeStats = () => { const b = {}; for (const id of S.tree.taken) for (const [k, v] of Object.entries(PNODE[id][4])) b[k] = (b[k] || 0) + v; return b; };
const linked = id => PTREE_LINKS.some(([a, b]) => (a === id && S.tree.taken.includes(b)) || (b === id && S.tree.taken.includes(a)));

/* ---------- stats ---------- */
const WSPEED = { dagger: 3, sword: 4, bow: 4, spear: 5, hammer: 6 };
const _recalcC = recalc;
recalc = function () {
  if (!S) return; ensureCombat();
  const save = S.sk.combat.l; S.sk.combat.l = 1; _recalcC(); S.sk.combat.l = save; // old formula without its 1-10 level bonuses
  const T = treeStats(); PS.tree = T;
  PS.dmg += T.dmg || 0; PS.def += T.def || 0; PS.crit += T.crit || 0; PS.spd += T.spd || 0; PS.regen += T.regen || 0;
  PS.maxhp += clv('constitution') * 10 - 100 + (T.maxhp || 0); if (T.maxhpPct) PS.maxhp = Math.round(PS.maxhp * (1 + T.maxhpPct));
  PS.acc = T.acc || 0; PS.fgain = 8 + (T.fgain || 0); PS.focusMax = 100 + (T.focusMax || 0);
  PS.ticks = Math.max(2, (WSPEED[PS.wt] || 4) - (T.haste ? 1 : 0));
  const style = PS.wt === 'bow' ? 'ranged' : PS.wt === 'staff' ? 'magic' : 'melee';
  PS.style = style; PS.maxHit = Math.max(2, Math.round((PS.atk + 4) * (1 + (clv(style) - 1) * .03) * (1 + PS.dmg) * 2.2));
  S.sk.combat.l = combatLevel();
};

/* gear requirements by tier: weapons need Melee (bows Ranged), armour needs Defence */
const TIER_REQ_RS = [1, 1, 1, 10, 20, 25, 30, 40, 50, 55, 60, 70, 80]; // wood, leather, copper are starter tiers
const _equipC = equip;
equip = function (id) {
  const it = IT[id]; ensureCombat();
  if (it && it.ti !== undefined && (it.t === 'weapon' || it.t === 'armor')) {
    const sk = it.magic ? 'magic' : it.t === 'armor' ? 'defence' : it.wt === 'bow' ? 'ranged' : it.wt === 'staff' ? 'magic' : 'melee', need = TIER_REQ_RS[it.ti] || 1;
    if (clv(sk) < need) { toast('You need ' + CSKN[sk] + ' level ' + need + ' to use ' + it.n + '.', 'bad'); SFX.bad(); return; }
    const L = S.sk.combat.l; S.sk.combat.l = 99; _equipC(id); S.sk.combat.l = L; return; // skip the old combat-level check
  }
  _equipC(id);
};
const _itemDescC = itemDesc;
itemDesc = function (id) {
  const it = IT[id]; let d = _itemDescC(id).replace(/ Requires Combat \d+\./, '');
  if (it && it.ti !== undefined && (it.t === 'weapon' || it.t === 'armor')) d += ' Requires ' + CSKN[it.magic ? 'magic' : it.t === 'armor' ? 'defence' : it.wt === 'bow' ? 'ranged' : it.wt === 'staff' ? 'magic' : 'melee'] + ' ' + (TIER_REQ_RS[it.ti] || 1) + '.' + (it.t === 'weapon' ? (typeof ACTION === 'function' && ACTION() && typeof WPN !== 'undefined' && WPN[it.wt] ? ' ' + (1 / WPN[it.wt].cd).toFixed(1) + ' swings a second.' : ' Attacks every ' + (WSPEED[it.wt] || 4) + ' ticks.') : '');
  return d;
};

/* ---------- hit splats ---------- */
const SPLATS = [];
function splat(x, y, n, kind) { SPLATS.push({ x: x + (Math.random() - .5) * 6, y, n, kind, t: 1.1 }); }
function drawSplats(dt) {
  for (const s of SPLATS) {
    s.t -= dt; const X = Math.round(s.x * 2) / 2, Y = Math.round((s.y - (1.1 - s.t) * 4) * 2) / 2, w = String(s.n).length * 3.5 + 4;
    g.globalAlpha = Math.min(1, s.t * 3);
    g.fillStyle = '#2a1410'; g.fillRect(X - w / 2 - .5, Y - 4.5, w + 1, 9);
    g.fillStyle = s.kind === 'miss' ? '#3a6ad8' : s.kind === 'crit' ? '#e8a020' : s.kind === 'heal' ? '#3aa04a' : s.kind === 'bleed' ? '#8a1a3a' : '#c8241a';
    g.fillRect(X - w / 2, Y - 4, w, 8); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(X - w / 2, Y - 4, w, 1.5);
    g.font = '700 7px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(s.n, X, Y + 2.5);
  }
  g.globalAlpha = 1; for (let i = SPLATS.length - 1; i >= 0; i--) if (SPLATS[i].t <= 0) SPLATS.splice(i, 1);
}

/* ---------- targeting and auto-attack ---------- */
let TARGET = null, ATK_WAIT = 0, GUARD = 0, CHASE_T = 0;
const ABCD = {};
function setTarget(e) { if (!e || e.dead) return; TARGET = e; if (typeof stopWalk === 'function') stopWalk(); }
function clearTarget() { TARGET = null; INPUT.x = INPUT.y = 0; }
const reachOf = e => (PS.wt === 'bow' ? 92 : PS.wt === 'spear' ? 24 : 15) + EN[e.k].r;
const distTo = e => dist(e.x, e.y - 4, S.p.x, S.p.y - 4);
function enemyAt(wx, wy) { let best = null, bd = 14; for (const e of cur.ents) if (e.type === 'enemy' && !e.dead) { const d = dist(e.x, e.y - EN[e.k].r, wx, wy); if (d < bd + EN[e.k].r) { bd = d; best = e; } } return best; }

function rollHit(e, mult = 1, opts = {}) {
  const E = EN[e.k], lvl = clv(PS.style);
  const chance = clamp(.68 + (lvl + PS.acc + (opts.acc || 0) - E.def * 1.2 - e.lvl) * .012, .2, .97);
  if (Math.random() > chance) { splat(e.x, e.y - E.r * 2 - 4, 0, 'miss'); return 0; }
  let dmg = 1 + Math.floor(Math.random() * PS.maxHit * mult);
  if (E.undead) dmg *= 1 + (PS.holy || 0);
  if (PS.tree.exec && e.hp < e.mhp * .3) dmg *= 1.3;
  const crit = Math.random() < PS.crit; if (crit) { dmg *= PS.wt === 'dagger' ? 2.2 : 1.8; if (PS.tree.critFocus) gainFocus(15); }
  dmg = Math.max(1, Math.round(dmg - E.def * .4));
  e.hp -= dmg; e.flash = .12; splat(e.x, e.y - E.r * 2 - 4, dmg, crit ? 'crit' : 'hit');
  if (PS.slow || PS.elem === 'ice') e.st.slow = 2; if (PS.burn || PS.elem === 'fire') e.st.burn = 3;
  cxp(PS.style, dmg * .6); cxp('constitution', dmg * .2); // Phase 9 pacing
  gainFocus(PS.fgain);
  if (e.hp <= 0) { killEnemy(cur, e); if (opts.ability && PS.tree.refund) gainFocus(Math.round((PS.focusMax || 100) * PS.tree.refund * .3)); }
  return dmg;
}
function gainFocus(n) { S.focus = clamp((S.focus || 0) + n, 0, PS.focusMax || 100); }
function swingAnim() { pl.swing = .22; pl.swingT = .22; if (TARGET) faceTileAt(Math.floor(TARGET.x / 16), Math.floor((TARGET.y - 4) / 16)); }

function autoAttack() {
  const e = TARGET; if (!e || e.dead || e.hp <= 0) { clearTarget(); return; }
  if (PS.wt === 'bow') { const ammo = has('fire_arrow') ? 'fire_arrow' : has('arrow') ? 'arrow' : null; if (!ammo) { toast('Out of arrows. Craft some at a workbench.', 'bad'); clearTarget(); return; } take(ammo); SFX.bow(); }
  else SFX.swing();
  swingAnim(); const d = rollHit(e); if (d) { SFX.hit(); SHAKE = PS.wt === 'hammer' ? .12 : .05; }
  ATK_WAIT = PS.ticks;
}

/* ---------- abilities ---------- */
const ABIL = {
  cleave: { n: 'Cleave', cost: 30, cd: 8, desc: 'Hit every enemy around you for up to 1.4× max hit.', fn() { let n = 0; for (const e of cur.ents) if (e.type === 'enemy' && !e.dead && distTo(e) < reachOf(e) + 8) { rollHit(e, 1.4, { ability: 1 }); n++; } swingAnim(); SFX.swing(); return n > 0; } },
  lunge: { n: 'Lunge', cost: 25, cd: 10, desc: 'Dash to your target and strike for up to 2× max hit.', fn() { const e = TARGET; if (!e) return false; const a = Math.atan2(e.y - S.p.y, e.x - S.p.x), d = Math.max(0, distTo(e) - EN[e.k].r - 8); for (let s = 0; s < d; s += 2) { const nx = S.p.x + Math.cos(a) * 2, ny = S.p.y + Math.sin(a) * 2; if (!boxFree(cur, nx, ny, 5)) break; S.p.x = nx; S.p.y = ny; } swingAnim(); rollHit(e, 2, { ability: 1, acc: 10 }); SFX.swing(); return true; } },
  guard: { n: 'Guard', cost: 20, cd: 12, desc: 'Block 50% of damage for 3 ticks, then counter for up to 1.2× max hit.', fn() { if (PS.tree.noGuard) { toast('Berserkers cannot Guard.', 'bad'); return false; } GUARD = 3; floatText(S.p.x, S.p.y - 32, 'Guard', '#c8d8f0'); return true; } },
  rend: { n: 'Rend', cost: 25, cd: 9, desc: 'Strike, then the target bleeds for 4 ticks.', fn() { const e = TARGET; if (!e) return false; swingAnim(); if (rollHit(e, 1, { ability: 1 })) e.bleed = 4; return true; } },
  volley: { n: 'Volley', cost: 35, cd: 10, desc: 'Three quick attacks on your target.', fn() { const e = TARGET; if (!e) return false; let k = 0; const go = () => { if (e.dead || k++ >= 3) return; swingAnim(); rollHit(e, .9, { ability: 1 }); SFX.swing(); setTimeout(go, 200); }; go(); return true; } },
  secondwind: { n: 'Second Wind', cost: 40, cd: 30, desc: 'Heal 25% of your health.', fn() { const h = Math.round(maxHP() * .25); S.p.hp = Math.min(maxHP(), S.p.hp + h); splat(S.p.x, S.p.y - 34, h, 'heal'); SFX.ok(); return true; } },
};
const ABIL_UNLOCK = { m8: 'rend', p8: 'volley', a8: 'secondwind' };
const abilPool = () => ['cleave', 'lunge', 'guard', ...Object.entries(ABIL_UNLOCK).filter(([n]) => S.tree.taken.includes(n)).map(([, a]) => a)];
function useAbility(slot) {
  if (PAUSED || TITLE) return; ensureCombat();
  const id = S.abil[slot], A = ABIL[id]; if (!A) return;
  if ((ABCD[id] || 0) > 0) { toast(A.n + ' is recharging.', 'bad'); return; }
  if ((S.focus || 0) < A.cost) { toast('Not enough Focus for ' + A.n + ' (' + A.cost + ').', 'bad'); return; }
  if (!TARGET && id !== 'cleave' && id !== 'guard' && id !== 'secondwind') { toast('Target an enemy first.', 'bad'); return; }
  if (A.fn()) { S.focus -= A.cost; ABCD[id] = Math.ceil(A.cd * (1 - (PS.tree.abCd || 0))); }
}

/* ---------- enemies on ticks ---------- */
function enemyTick(m) {
  for (const e of m.ents) {
    if (e.type !== 'enemy' || e.dead) continue; const E = EN[e.k];
    if (e.bleed > 0) { e.bleed--; const b = Math.max(1, Math.round(PS.maxHit * .25)); e.hp -= b; splat(e.x, e.y - E.r * 2 - 4, b, 'bleed'); if (e.hp <= 0) { killEnemy(m, e); continue; } }
    if (E.ai === 'ambush' && !e.awake) continue;
    const d = dist(e.x, e.y - 4, S.p.x, S.p.y - 4);
    if (d > E.r + 10 || pl.roll > 0) continue;
    e.atkW = (e.atkW || 0) - 1; if (e.atkW > 0) continue; e.atkW = E.boss ? 5 : 4; e.lunge = .3; // the attack animation (y_anim.js) // bosses mostly hurt you with their telegraphed moves
    const chance = clamp(.6 + (e.lvl * 1.5 + e.atk * .3 - clv('defence') - PS.def * .5) * .015, .12, .92);
    if (!TARGET) setTarget(e); // auto-retaliate
    if (Math.random() > chance) { splat(S.p.x, S.p.y - 34, 0, 'miss'); cxp('defence', 2); continue; }
    let dmg = 1 + Math.floor(Math.random() * e.atk * (E.boss ? .8 : 1.3));
    if (S.eq.shield && Math.random() < IT[S.eq.shield].block) dmg *= .3;
    if (GUARD > 0) dmg *= .5;
    dmg = Math.max(1, Math.round(dmg - PS.def * .35));
    S.p.hp -= dmg; splat(S.p.x, S.p.y - 34, dmg, 'hit'); SFX.hurt(); SHAKE = .1; cxp('defence', dmg);
    if (E.elem === 'fire' && !PS.fireres) pl.burn = 3; if (E.elem === 'ice') pl.chill = 2.5;
    if (S.p.hp <= 0) { S.p.hp = 0; faint('You were knocked out…'); return; }
  }
}
// enemies no longer deal touch damage every frame; projectiles and boss telegraphs still do
const _updateEnemies = updateEnemies;
updateEnemies = function (m, dt) {
  const real = hurtPlayer; // the original AI calls hurtPlayer(atk, e.x, e.y) on contact every frame: drop those, keep projectiles and boss slams
  hurtPlayer = (dmg, sx, sy, elem) => { for (const e of m.ents) if (e.type === 'enemy' && e.x === sx && e.y === sy) return; real(dmg, sx, sy, elem); };
  try { _updateEnemies(m, dt); } finally { hurtPlayer = real; }
};

/* ---------- per-frame: chase target; per-tick: attacks ---------- */
EVT.on('tick', () => {
  if (!S || !PS || PAUSED) return; ensureCombat();
  for (const k in ABCD) if (ABCD[k] > 0) ABCD[k]--;
  if (GUARD > 0) { GUARD--; if (GUARD === 0 && TARGET && distTo(TARGET) < reachOf(TARGET) + 6) { swingAnim(); rollHit(TARGET, 1.2, { ability: 1 }); } }
  if (ATK_WAIT > 0) ATK_WAIT--;
  if (TARGET && !TARGET.dead && distTo(TARGET) <= reachOf(TARGET) && ATK_WAIT <= 0 && pl.roll <= 0) autoAttack();
  enemyTick(cur);
  if (PS.regen && S.p.hp < maxHP() && TICK.n % 5 === 0) S.p.hp = Math.min(maxHP(), S.p.hp + PS.regen);
});
const _updateC = update;
update = function (dt) {
  if (TARGET && !PAUSED && !TITLE) {
    const K = INPUT.keys, manual = K.w || K.a || K.s || K.d || K.arrowup || K.arrowdown || K.arrowleft || K.arrowright;
    if (TARGET.dead || TARGET.hp <= 0 || !cur.ents.includes(TARGET) || distTo(TARGET) > 300) clearTarget();
    else if (manual) { if (distTo(TARGET) > reachOf(TARGET) + 40) clearTarget(); }
    else if (!WALK) {
      const d = distTo(TARGET), r = reachOf(TARGET) - 3;
      if (d > r) { const dx = TARGET.x - S.p.x, dy = TARGET.y - S.p.y, n = Math.hypot(dx, dy) || 1; INPUT.x = dx / n; INPUT.y = dy / n; CHASE_T += dt; if (CHASE_T > .8) { CHASE_T = 0; INPUT.x = INPUT.y = 0; walkTo(Math.floor(TARGET.x / 16), Math.floor((TARGET.y - 2) / 16), null); } }
      else { INPUT.x = INPUT.y = 0; CHASE_T = 0; faceTileAt(Math.floor(TARGET.x / 16), Math.floor((TARGET.y - 4) / 16)); }
    }
  }
  _updateC(dt);
};

/* ---------- input: clicking enemies targets them; Z X C fire abilities; T / Tab open the tree ---------- */
const _primaryUseC = primaryUse;
primaryUse = function () { if (!PAUSED && !TITLE && !fishing) { const [wx, wy] = mouseWorld(), e = enemyAt(wx, wy); if (e) { setTarget(e); return; } } _primaryUseC(); };
const _interactC = interact;
interact = function () { if (!PAUSED && !TITLE && !fishing) { const [wx, wy] = mouseWorld(), e = enemyAt(wx, wy); if (e) { setTarget(e); return; } } _interactC(); };
// free swings (no target) still cut grass but no longer hurt enemies outside the tick system
const _attackC = attack;
attack = function () { const e = cur.ents.find(x => x.type === 'enemy' && !x.dead && distTo(x) < reachOf(x)); if (e) { setTarget(e); return; } if (PS.wt === 'bow') return; const dm = damageEnemy; damageEnemy = () => { }; try { _attackC(); } finally { damageEnemy = dm; } };
addEventListener('keydown', e => {
  if (TITLE || !S || (e.target && /input|textarea/i.test(e.target.tagName))) return; const k = e.key.toLowerCase();
  if (!MODAL && !e.repeat && (k === 'z' || k === 'x' || k === 'c')) { e.stopImmediatePropagation(); useAbility('zxc'.indexOf(k)); }
  if (!e.repeat && (k === 't' || k === 'tab')) { e.preventDefault(); e.stopImmediatePropagation(); if (MODAL && MODAL.cur === 'tree') closeModal(); else if (MODAL && MODAL.tabs.some(t => t.id === 'tree')) { MODAL.cur = 'tree'; drawModal(); } else if (!MODAL && !PAUSED) openMenu('tree'); }
}, true);
MENU_KEYS.b = 'craft'; delete MENU_KEYS.c; delete MENU_KEYS.tab; TAB_KEY.craft = 'B'; TAB_KEY.tree = 'T';

/* ---------- UI: ability bar + focus, target frame, tree tab, combat skills ---------- */
const _buildHUDC = buildHUD;
buildHUD = function () {
  _buildHUDC(); ensureCombat();
  if (!$('#abil')) document.body.append(el('div', { id: 'abil' }));
  const a = $('#abil'); a.innerHTML = '';
  a.append(el('div', { id: 'focus' }, el('i'), el('s', null, 'Focus')));
  ['Z', 'X', 'C'].forEach((key, i) => { const b = el('button', { class: 'ab', id: 'ab' + i, on: () => useAbility(i) }, el('span'), el('kbd', null, key), el('u')); b.addEventListener('mouseenter', () => { const A = ABIL[S.abil[i]]; if (!A) return; let t = $('#tip'); if (!t) { t = el('div', { id: 'tip' }); document.body.append(t); } t.innerHTML = ''; t.append(el('b', null, A.n), el('div', null, A.desc + ' Costs ' + A.cost + ' Focus, recharges in ' + A.cd + ' ticks.')); t.hidden = false; const r = b.getBoundingClientRect(); t.style.left = r.left + 'px'; t.style.top = (r.top - t.offsetHeight - 10) + 'px'; }); b.addEventListener('mouseleave', hideTip); a.append(b); });
  if (!$('#tframe')) document.body.append(el('div', { id: 'tframe', hidden: '' }, el('b'), el('div', { class: 'tb' }, el('i')), el('small')));
};
const _hudTickC = hudTick;
hudTick = function (dt) {
  _hudTickC(dt); if (!S || TITLE || !$('#abil') || !PS) return;
  $('#focus i').style.width = clamp((S.focus || 0) / (PS.focusMax || 100) * 100, 0, 100) + '%'; $('#focus s').textContent = 'Focus ' + Math.floor(S.focus || 0);
  for (let i = 0; i < 3; i++) { const A = ABIL[S.abil[i]], b = $('#ab' + i); if (!b || !A) continue; b.querySelector('span').textContent = A.n; const cd = ABCD[S.abil[i]] || 0; b.querySelector('u').style.height = (cd / A.cd * 100) + '%'; b.classList.toggle('off', (S.focus || 0) < A.cost); }
  const tf = $('#tframe'), t = TARGET;
  if (t && !t.dead && !EN[t.k].boss) { tf.hidden = false; tf.querySelector('b').textContent = EN[t.k].n + ' (level ' + (EN[t.k].hp / 10 + t.lvl * 2 | 0) + ')'; tf.querySelector('i').style.width = clamp(t.hp / t.mhp * 100, 0, 100) + '%'; tf.querySelector('small').textContent = Math.max(0, Math.ceil(t.hp)) + ' / ' + t.mhp; } else tf.hidden = true;
  if ($('#pL') && TARGET) $('#pL').innerHTML = '<kbd>Z X C</kbd>abilities';
};
const _openMenuC = openMenu;
openMenu = function (tab, station, focus) {
  _openMenuC(tab === 'tree' ? 'skills' : tab, station, focus);
  if (MODAL && MODAL.title === 'Satchel' && !MODAL.tabs.some(t => t.id === 'tree')) { MODAL.tabs.splice(3, 0, { id: 'tree', label: 'Passive tree', render: renderTree }); if (tab === 'tree') MODAL.cur = 'tree'; drawModal(); }
};
const _renderSkillsC = renderSkills;
function renderCombatSkills(b) {
  ensureCombat(); b.append(el('h3', null, 'Combat — level ' + combatLevel()));
  const list = el('div', { class: 'list' });
  for (const k of CSK) { const L = clv(k), xp = S.csk[k].xp, lo = XPT[L], hi = XPT[L + 1] || xp; list.append(el('div', { class: 'srow' }, el('div', { class: 'slv' }, L), el('div', { class: 'rtxt' }, el('b', null, CSKN[k]), el('div', { class: 'sbar' }, el('i', { style: 'width:' + (L >= 99 ? 100 : (xp - lo) / (hi - lo) * 100) + '%' })), el('small', null, Math.floor(xp).toLocaleString() + ' xp' + (L < 99 ? ' · ' + (hi - Math.floor(xp)).toLocaleString() + ' to level ' + (L + 1) : ''))))); }
  b.append(list, el('h3', null, 'Life skills'));
}
renderSkills = function (b) { renderCombatSkills(b); _renderSkillsC(b); };
function renderTree(b) {
  ensureCombat(); const pts = treePoints();
  b.append(el('div', { class: 'acts' }, el('b', null, pts + ' point' + (pts === 1 ? '' : 's') + ' to spend'), el('small', { class: 'note' }, ' · one per combat level above 3 · click a node next to one you have'), el('span', { style: 'flex:1' }),
    el('button', { class: 'btn ghost' + (nearAltar() ? '' : ' off'), on: () => { const cost = (S.tree.taken.length - 1) * 250; if (!nearAltar()) { toast('Respec at the village altar.', 'bad'); return; } if (S.gold < cost) { toast('Respec costs ' + cost + 'g.', 'bad'); return; } S.gold -= cost; S.tree.taken = ['root']; S.abil = ['cleave', 'lunge', 'guard']; recalc(); refresh(); } }, 'Respec (' + (S.tree.taken.length - 1) * 250 + 'g, at the altar)')));
  const W = 900, H = 470, c = el('canvas', { width: W, height: H, class: 'treecv' }), x = c.getContext('2d'), sc = 52, ox = W / 2, oy = H - 70;
  const P = n => [ox + n[1] * sc, oy + n[2] * sc], col = n => n[0][0] === 'm' ? '#d8543a' : n[0][0] === 'p' ? '#5aa040' : n[0][0] === 'a' ? '#4a7ad8' : '#e8c040';
  x.fillStyle = '#1e1814'; x.fillRect(0, 0, W, H);
  for (const [a, bb] of PTREE_LINKS) { const A = P(PNODE[a]), B = P(PNODE[bb]), on = S.tree.taken.includes(a) && S.tree.taken.includes(bb); x.strokeStyle = on ? '#e8c07a' : '#4a3a2e'; x.lineWidth = on ? 4 : 3; x.beginPath(); x.moveTo(...A); x.lineTo(...B); x.stroke(); }
  for (const n of PTREE) {
    const [px, py] = P(n), r = n[5] === 'k' ? 15 : n[5] === 'n' || n[5] === 'a' ? 12 : n[5] === 'r' ? 14 : 8, on = S.tree.taken.includes(n[0]), can = !on && linked(n[0]) && pts > 0;
    x.fillStyle = on ? col(n) : can ? '#6a5a48' : '#3a2e26'; x.strokeStyle = on ? '#fff0c0' : can ? '#e8c07a' : '#5a4a3a'; x.lineWidth = n[5] === 'k' ? 4 : 2;
    x.beginPath(); if (n[5] === 'k' || n[5] === 'a') { x.moveTo(px, py - r); x.lineTo(px + r, py); x.lineTo(px, py + r); x.lineTo(px - r, py); x.closePath(); } else x.arc(px, py, r, 0, 6.283); x.fill(); x.stroke();
  }
  x.font = '600 13px Fredoka'; x.fillStyle = '#e8d8b8'; x.textAlign = 'center'; x.fillText('MIGHT', ox - 6 * sc, H - 18); x.fillText('PRECISION', ox + 6 * sc, H - 18); x.fillText('ARCANA', ox, 22);
  const at = ev => { const r = c.getBoundingClientRect(), mx = (ev.clientX - r.left) * W / r.width, my = (ev.clientY - r.top) * H / r.height; return PTREE.find(n => Math.hypot(P(n)[0] - mx, P(n)[1] - my) < 16); };
  c.onmousemove = ev => { const n = at(ev); if (!n) return hideTip(); let t = $('#tip'); if (!t) { t = el('div', { id: 'tip' }); document.body.append(t); } t.innerHTML = ''; t.append(el('b', null, n[3]), el('div', null, n[6] || ({ s: 'Small passive', n: 'Notable', k: 'Keystone', a: 'Ability', r: 'Your starting point' })[n[5]])); t.hidden = false; t.style.left = (ev.clientX + 14) + 'px'; t.style.top = (ev.clientY + 14) + 'px'; };
  c.onmouseleave = hideTip;
  c.onclick = ev => { const n = at(ev); if (!n || S.tree.taken.includes(n[0])) return; if (!linked(n[0])) { toast('Take a connected node first.', 'bad'); return; } if (treePoints() <= 0) { toast('No points left. Gain combat levels.', 'bad'); return; } S.tree.taken.push(n[0]); SFX.ok(); recalc(); refresh(); };
  b.append(c);
  const pool = abilPool(), row = el('div', { class: 'acts wrap' }, el('b', null, 'Ability slots: '));
  ['Z', 'X', 'C'].forEach((key, i) => { const s = el('select'); for (const id of pool) { const o = el('option', { value: id }, ABIL[id].n); if (S.abil[i] === id) o.selected = true; s.append(o); } s.onchange = () => { S.abil[i] = s.value; hudKey = ''; }; row.append(el('span', null, key + ' '), s); });
  b.append(row);
}
function nearAltar() { if (cur.id !== 'village') return false; for (let i = 0; i < cur.o.length; i++) { const o = cur.o[i]; if (o && o.k === 'altar' && dist(S.p.x, S.p.y, (i % cur.w + 1) * 16, ((i / cur.w | 0)) * 16) < 64) return true; } return false; }

/* draw splats after entities */
const _pcCursorDrawC = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawC(m);
  if (TARGET && !TARGET.dead) { const E = EN[TARGET.k], X = TARGET.x, Y = TARGET.y; g.fillStyle = 'rgba(232,64,40,.85)'; for (let i = -6; i <= 6; i += 2) { g.fillRect(X + i - .5, Y + 1.5, 1, .5); } g.fillRect(X - 7, Y + 1, 1, 1.5); g.fillRect(X + 6, Y + 1, 1, 1.5); }
  drawSplats(1 / 60);
};
const _startGameC = startGame;
startGame = function (isNew) { _startGameC(isNew); ensureCombat(); recalc(); S.focus = PS.tree && PS.tree.focusMax ? 0 : S.focus || 0; clearTarget(); };

/* boss health was tuned for the old rapid-swing combat; on ticks a fight would take minutes */
const BOSS_HP_MULT = .5;
const _spawnEnemyC = spawnEnemy;
spawnEnemy = function (m, k, x, y, lvl) { const e = _spawnEnemyC(m, k, x, y, lvl); if (EN[k].boss) { e.hp = e.mhp = Math.round(e.mhp * BOSS_HP_MULT); } return e; };
