/* ================= Combat fixes from playtest 2 (docs/playtest/PLAYTEST_2_COMBAT.md) =================
   1  You never lose your character: when an enemy, a boss, a hazard or a canopy covers you, a see-through
      copy of the player is drawn on top (canopies also fade much more, f_render.js).
   2  Spacing: enemies push apart and keep a small ring around you instead of stacking on your pixel; bosses
      are solid and can't stand on you; at most two ordinary enemies wind up at the same time. Swings always
      hit an enemy overlapping you (x_action.js).
   3  Attacking never walks you (no click-to-move with a weapon unless you clicked a resource and nothing is
      near); the character keeps facing the mouse for a moment after each attack; the dash goes the way your
      movement keys point, or toward the mouse when none are held.
   4  HUD: the ability bar and the enemy panel moved out of the play area (pc.css); the boss bar shows the boss
      you're fighting (the last one hit, else the nearest); only bosses use the boss bar.
   5  Bosses get 1.8 s of grace when they first wake (no attacks, can't be hurt yet) and don't open with ground
      effects under you. Combat test: a knockout just puts you back on your feet at full health. No single hit
      takes more than 20% of your max health. Regional bosses hit 45% softer.
   6  The Pale Lich's teleport is now a move with a tell (it fades, a marker shows where it reappears, then a
      punish window) and comes up less often; the Hollow King walks to you instead of standing still.
   7  Projectiles: player arrows and bolts are bigger and glow, enemy projectiles get a glow, staff bolts fly
      further and puff out at the end, the bow uses plain arrows before fire arrows. Skill hits no longer
      refill Focus. Skill tuning (Whirlwind, Chain Lightning and Meteor down; Ground Slam and Piercing Shot up;
      Blade Dash stops at the mouse). Chain Lightning starts on a boss when one is in range.
      Each weapon type keeps its own Z/X/C loadout. Q parries (Guard) any time. Equipping a weapon selects it.
   8  Small: one "backpack full" / "recharging" toast at a time, the Combat test Heal also puts out burns,
      breastplates get a breastplate icon, the locked-node label only shows with a tool, the skill slot
      buttons don't jump. */

/* ---------- 1 the player stays visible ---------- */
let playerCovered = () => {
  if (!cur) return false;
  for (const e of cur.ents) { if (e.type !== 'enemy' || e.dead) continue; const E = EN[e.k]; if (Math.abs(e.x - S.p.x) < E.r + 8 && e.y > S.p.y - 2 && e.y - S.p.y < E.r * 2 + 30) return true; }
  if (typeof HAZ !== 'undefined' && HAZ.some(h => Math.hypot(h.x - S.p.x, h.y - S.p.y) < (h.r || 40) + 10)) return true;
  const tx = Math.floor(S.p.x / 16), ty = Math.floor(S.p.y / 16);
  for (let j = 1; j <= 3; j++) for (let i = -2; i <= 2; i++) { const o = getO(cur, tx + i, ty + j); if (o && OBJ[o.k] && (OBJ[o.k].tree || OBJ[o.k].tall)) return true; }
  return false;
};
const _pcCursorDrawCF = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawCF(m);
  if (TITLE || !S || !S.p || (typeof KO !== 'undefined' && KO) || !playerCovered()) return;
  g.save(); g.globalAlpha = .55; try { drawPlayer(); } catch (e) {} g.restore();
};

/* ---------- 2 spacing and solid bodies ---------- */
const nudge = (m, e, dx, dy) => { if (!boxFree(m, e.x, e.y, 4)) { e.x += dx; e.y += dy; } else moveEnt(m, e, dx, dy, 4); }; // an enemy stuck in something solid can still be pushed out
function separate(m, dt) {
  const L = m.ents.filter(e => e.type === 'enemy' && !e.dead);
  for (let i = 0; i < L.length; i++) {
    const a = L[i], A = EN[a.k];
    for (let j = i + 1; j < L.length; j++) {
      const b = L[j], B = EN[b.k], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || .01, want = (A.r + B.r) * .9 + 4;
      if (d < want) { const push = (want - d) / 2, nx = dx / d, ny = dy / d; if (!A.boss) nudge(m, a, -nx * push, -ny * push); if (!B.boss) nudge(m, b, nx * push, ny * push); }
    }
    const dx = a.x - S.p.x, dy = a.y - S.p.y, d = Math.hypot(dx, dy) || .01, ring = A.r + (A.boss ? 10 : 7);
    if (d < ring) { const push = ring - d; nudge(m, a, dx / d * push, dy / d * push); if (A.boss && Math.hypot(a.x - S.p.x, a.y - S.p.y) < ring - 2) moveEnt(m, S.p, -dx / d * push * .6, -dy / d * push * .6, 5); }
  }
}
const _enemyAttackAICF = enemyAttackAI;
enemyAttackAI = function (m, dt) {
  // two wind-ups at a time among ordinary enemies; the others wait their turn
  const winding = m.ents.filter(e => e.type === 'enemy' && !e.dead && e.wind > 0 && !EN[e.k].boss).length;
  const held = []; if (winding >= 2) for (const e of m.ents) if (e.type === 'enemy' && !e.dead && !(e.wind > 0) && !EN[e.k].boss && (e.atkCd || 0) <= 0) { e.atkCd = .25 + Math.random() * .4; held.push(e); }
  for (const e of m.ents) if (e.type === 'enemy' && e.shield > 0) e.atkCd = Math.max(e.atkCd || 0, .3); // shielded (grace, roar): no melee either
  return _enemyAttackAICF(m, dt);
};

/* ---------- 3 attacking doesn't walk you; facing; dash direction ---------- */
let LAST_ATK = -9;
const _actionAttackCF = actionAttack;
actionAttack = function () { LAST_ATK = gameT; stopWalk(); return _actionAttackCF(); };
const _primaryUseCF = primaryUse;
primaryUse = function () {
  if (ACTION() && !PAUSED && !TITLE && !fishing && S && cur && selKind() === 'weapon') {
    const [tx, ty] = clickTarget(), o = getO(cur, tx, ty), res = o && OBJ[o.k] && OBJ[o.k].drop && OBJ[o.k].tool && OBJ[o.k].tool !== 'any';
    const anyNear = cur.ents.some(e => e.type === 'enemy' && !e.dead && Math.hypot(e.x - S.p.x, e.y - S.p.y) < 200);
    if (!res || anyNear) { actionAttack(); return; }
  }
  return _primaryUseCF();
};
const _dodgeCF = dodge;
dodge = function () {
  const before = pl.roll; _dodgeCF();
  if (!ACTION() || !(pl.roll > 0) || before > 0) return;
  const [ix, iy] = keyVec(); let a;
  if (Math.hypot(ix, iy) > .2) a = Math.atan2(iy, ix); else a = aimAngle();
  pl.rdx = Math.cos(a); pl.rdy = Math.sin(a); faceAngle(a);
  ACT.dashTrail = { x: S.p.x, y: S.p.y, t: .25 };
};

/* ---------- per frame: spacing, facing, boss bar, grace ---------- */
const _updateCF = update;
update = function (dt) {
  _updateCF(dt);
  if (PAUSED || TITLE || !cur || !ACTION()) return;
  separate(cur, dt);
  if (gameT - LAST_ATK < .45) faceAngle(aimAngle());
  if (ACT.dashTrail) { ACT.dashTrail.t -= dt; if (ACT.dashTrail.t <= 0) ACT.dashTrail = null; }
  for (const e of cur.ents) {
    if (e.type !== 'enemy' || e.dead || !EN[e.k].boss) continue;
    if (e.woke && !e.graced) { e.graced = 1; e.shield = Math.max(e.shield || 0, 1.8); e.ai = e.ai || {}; e.ai.t = 0; if (typeof HAZ !== 'undefined') for (const h of HAZ) if (Math.hypot(h.x - S.p.x, h.y - S.p.y) < 60) h.dead = 1; }
  }
};
const _hudTickCF = hudTick;
hudTick = function (dt) {
  _hudTickCF(dt); if (!S || TITLE || !cur) return;
  const bb = document.getElementById('bossbar'); if (!bb) return;
  const bosses = cur.ents.filter(e => e.type === 'enemy' && !e.dead && EN[e.k].boss && Math.hypot(e.x - S.p.x, e.y - S.p.y) < 340);
  const boss = (TARGET && bosses.includes(TARGET)) ? TARGET : bosses.sort((a, b) => Math.hypot(a.x - S.p.x, a.y - S.p.y) - Math.hypot(b.x - S.p.x, b.y - S.p.y))[0];
  if (boss) { bb.hidden = false; document.getElementById('bossname').textContent = EN[boss.k].n + (bosses.length > 1 ? ' (+' + (bosses.length - 1) + ')' : '') + (boss.shield > 0 ? ' · shielded' : ''); document.getElementById('bosshp').style.width = Math.max(0, boss.hp / boss.mhp * 100) + '%'; }
};

/* ---------- 5 damage cap, regional bosses, combat-test knockouts ---------- */
const _hurtPlayerCF = hurtPlayer;
hurtPlayer = function (dmg, sx, sy, elem) { const cap = PS.def + maxHP() * .2; return _hurtPlayerCF(Math.min(dmg, cap), sx, sy, elem); };
for (const k of ['stonetyrant', 'rimequeen', 'cinderdrake', 'drownedcaptain', 'forgeking', 'glacierheart', 'ashmother', 'tidecaller']) if (EN[k]) EN[k].atk = Math.round(EN[k].atk * .55);
const _faintCF = faint;
faint = function (msg) {
  if (window.COMBAT_TEST) { recalc(); S.p.hp = maxHP(); S.p.st = maxST(); pl.inv = 2; pl.burn = 0; pl.chill = 0; toast('Knocked out. (Combat test: you get straight back up.)', 'bad'); return; }
  return _faintCF(msg);
};

/* ---------- 6 Lich teleport with a tell; the Hollow King walks to you ---------- */
KIT.blink2 = function (m, e, A, E) {
  if (!A.dest) { let x = e.x, y = e.y; for (let k = 0; k < 16; k++) { const a = Math.random() * 6.283, d = 60 + Math.random() * 40, tx = S.p.x + Math.cos(a) * d, ty = S.p.y + Math.sin(a) * d * .7; if (boxFree(m, tx, ty, 6)) { x = tx; y = ty; break; } } A.dest = [x, y]; hz({ k: 'circle', x, y: y - 4, r: 16, T: .7, life: .05, dmg: 0, elem: 'void' }); }
  e.fade = A.t < .7 ? A.t / .7 : 0;
  if (A.t >= .7 && !A.did) { A.did = 1; e.x = A.dest[0]; e.y = A.dest[1]; for (let i = 0; i < 12; i++) PARTS.push({ x: e.x, y: e.y - 10, vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, t: .4, c: '#9a6aff' }); }
};
KIT_DUR.blink2 = 2;
if (EN.lich) EN.lich.moves = ['volley', 'summon:skeleton', 'ring', 'blink2', 'spiral', 'volley'];
if (EN.hollowking) EN.hollowking.moves = ['walk', 'charge', 'slam', 'walk', 'volley', 'quake', 'summon:voidknight'];
const _drawEntCF = drawEnt;
drawEnt = function (e) { if (e.type === 'enemy' && e.fade > 0) { g.save(); g.globalAlpha = Math.max(.15, 1 - e.fade); _drawEntCF(e); g.restore(); return; } if (e.type === 'proj') { g.save(); g.globalAlpha = .45; g.fillStyle = e.k === 'fire' ? '#ff8a2a' : e.k === 'ice' ? '#9ad8ff' : e.k === 'void' ? '#b07aff' : '#e8d8b8'; g.beginPath(); g.arc(e.x, e.y, 5, 0, 6.283); g.fill(); g.restore(); } return _drawEntCF(e); };
const _bossAICF = bossAI;
bossAI = function (m, e, dt, dx, dy, d) { if (e.fade > 0 && (e.ai.move || '') !== 'blink2') e.fade = 0; return _bossAICF(m, e, dt, dx, dy, d); };

/* ---------- 7 projectiles, Focus, skills, loadouts, parry ---------- */
const _pcCursorDrawProj = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawProj(m); if (TITLE) return;
  for (const p of PSHOTS) { g.save(); g.globalAlpha = .5; g.strokeStyle = p.fire ? '#ffb040' : '#fff6e0'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * .04, p.y - p.vy * .04); g.stroke(); g.restore(); }
  for (const p of (typeof SKP !== 'undefined' ? SKP : [])) if (p.kind === 'bolt' || p.kind === 'pierce') { g.save(); g.globalAlpha = .4; g.fillStyle = p.kind === 'bolt' ? '#b08aff' : '#bfe8ff'; g.beginPath(); g.arc(p.x, p.y, 7, 0, 6.283); g.fill(); g.restore(); }
  const t = ACT.dashTrail; if (t) { g.save(); g.globalAlpha = t.t * 2; g.strokeStyle = '#e8f4ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(t.x, t.y - 12); g.lineTo(S.p.x, S.p.y - 12); g.stroke(); g.restore(); }
};
// staff bolts fly further and puff at the end; bows use plain arrows before fire arrows
const _actionAttackStaff = actionAttack;
actionAttack = function () {
  const n0 = SKP.length, fire = PS.wt === 'bow' && cnt('arrow') > 0 && cnt('fire_arrow') > 0;
  let hidden = 0; if (fire) { const i = S.pack.findIndex(s => s && s.k === 'fire_arrow'); if (i >= 0) { hidden = S.pack[i]; S.pack[i] = null; touched(); } }
  try { _actionAttackStaff(); } finally { if (hidden) { const i = S.pack.indexOf(null); S.pack[i] = hidden; touched(); } }
  for (let i = n0; i < SKP.length; i++) if (SKP[i].kind === 'bolt' || SKP[i].kind === 'fireball') { SKP[i].life = 1.4; SKP[i].puff = 1; }
};
const _updateSkillsCF = updateSkills;
updateSkills = function (dt) { for (const p of SKP) if (p.puff && p.t + dt > p.life && !p.dead) burst(p.x, p.y, 8, '#c8b0ff', 50); return _updateSkillsCF(dt); };
// skill hits don't refill Focus (area skills go through hitArea; skill projectiles pass { skill: 1 })
let SKILL_HIT = 0;
const _hitAreaCF = hitArea;
hitArea = function (x, y, r, mult, kb, opts) { SKILL_HIT++; try { return _hitAreaCF(x, y, r, mult, kb, opts); } finally { SKILL_HIT--; } };
const _actionHitCF = actionHit;
actionHit = function (e, mult, a, kb, opts) { if (!SKILL_HIT && !(opts && opts.skill)) return _actionHitCF(e, mult, a, kb, opts); const f = PS.fgain; PS.fgain = 0; try { return _actionHitCF(e, mult, a, kb, opts); } finally { PS.fgain = f; } };
// skill tuning
const tune = (id, f) => { const s = CSKILLS.find(s => s[0] === id); if (s) f(s); };
const SKILL_MULT = { whirlwind: .7, chain: .75, meteor: .75, groundslam: 1.35, piercing: 1.35 };
const _rankKCF = rankK;
rankK = function (id) { return _rankKCF(id) * (SKILL_MULT[id] || 1); };
tune('bladedash', s => { const f = s[7]; s[7] = () => { const [mx, my] = mouseWorld(), d = Math.hypot(mx - S.p.x, my - S.p.y), keep = moveEnt; let steps = 0; const max = Math.max(3, Math.min(14, Math.round(d / 5))); moveEnt = (m, e, dx, dy, hw) => (e === S.p && ++steps > max ? false : keep(m, e, dx, dy, hw)); try { return f(); } finally { moveEnt = keep; } };
  ABIL.bladedash.fn = function () { if (!CTREES.blade.need(PS.wt)) { toast('Blade Dash needs a melee weapon.', 'bad'); return false; } LAST_FIGHT = gameT; return s[7]() !== false; }; }); // stops at the mouse
// Chain Lightning starts on a boss when one is in range
const _useAbilityAim = useAbility;
useAbility = function (slot) {
  if (S && S.abil[slot] === 'chain' && cur) window.__chainBoss = cur.ents.find(e => e.type === 'enemy' && !e.dead && EN[e.k].boss && Math.hypot(e.x - S.p.x, e.y - S.p.y) < 160) || null;
  return _useAbilityAim(slot);
};
tune('chain', s => { const f = s[7]; s[7] = () => { if (window.__chainBoss && !window.__chainBoss.dead) TARGET = window.__chainBoss; window.__chainBoss = null; return f(); }; ABIL.chain.fn = function () { if (!CTREES.arcane.need(PS.wt)) { toast('Chain Lightning needs a staff.', 'bad'); return false; } LAST_FIGHT = gameT; return s[7]() !== false; }; });
// a Z/X/C loadout per weapon type
const wgroup = () => PS && PS.wt === 'bow' ? 'bow' : PS && PS.wt === 'staff' ? 'staff' : 'melee';
const _recalcCF = recalc;
recalc = function () {
  _recalcCF(); if (!S || !PS || !S.abil) return;
  S.abilSets = S.abilSets || {}; const g2 = wgroup();
  if (!S.abilGroup) S.abilGroup = g2;
  if (S.abilGroup !== g2) { S.abilSets[S.abilGroup] = S.abil.slice(); S.abil = (S.abilSets[g2] || ['cleave', 'lunge', 'guard']).slice(); S.abilGroup = g2; hudKey = ''; }
};
// Q: parry any time (Guard), on a short cooldown
let PARRY_CD = 0;
addEventListener('keydown', e => {
  if (TITLE || !S || MODAL || e.repeat || (e.target && /input|textarea/i.test(e.target.tagName))) return;
  if (e.key.toLowerCase() !== 'q' || !ACTION()) return;
  if (gameT < PARRY_CD) return; PARRY_CD = gameT + 1.2; ACT.parry = .5; GUARD = Math.max(GUARD, 2); LAST_FIGHT = gameT;
  floatText(S.p.x, S.p.y - 34, 'Guard', '#9ad8ff'); snd(700, .06, 'square', .03);
}, true);
ACTIONS.splice(ACTIONS.findIndex(a => a[0] === 'abil3') + 1, 0, ['parry', 'Parry (Guard)', 'q']); buildKeymap();
// equipping a weapon selects it on the hotbar
const _equipCF = equip;
equip = function (id) { _equipCF(id); const it = IT[id]; if (it && it.slot === 'weapon' && S.eq.weapon === id) { const w = S.hot.indexOf('weapon'); if (w >= 0) { S.sel = w; hudKey = ''; } } };

/* ---------- 8 small ---------- */
const QUIET = [/backpack is full/i, /is recharging/i, /Not enough Focus/i];
const _toastCF = toast; const _lastQ = {};
toast = function (msg, kind) { if (typeof msg === 'string') { const q = QUIET.find(r => r.test(msg)); if (q) { const k = q.source, t = performance.now(); if (t - (_lastQ[k] || 0) < 4000) return; _lastQ[k] = t; } } return _toastCF(msg, kind); };
for (const k in IT) { const it = IT[k]; if (it.t === 'armor' && it.slot === 'body' && it.sh === 'chest') it.sh = 'plate'; }
const _combatPanelCF = typeof combatPanel === 'function' ? combatPanel : null;
if (_combatPanelCF) combatPanel = function () { _combatPanelCF(); const b = [...document.querySelectorAll('#ctpanel button')].find(x => x.textContent === 'Heal'); if (b) b.addEventListener('click', () => { pl.burn = 0; pl.chill = 0; }); };

/* ---------- lives: 3 hearts that put you straight back on your feet ---------- */
/* When your health hits 0 and you have a life left, you lose one and get up on the spot with full health,
   2 s of invulnerability and a shockwave that pushes nearby enemies back. With no lives left a knockout works
   as before (home, a new day). Lives come back one at a time after 60 s out of combat, and refill every
   morning. They show as hearts under your health bar. S.lives, S.lifeT. */
const MAX_LIVES = 3;
const _faintLives = faint;
faint = function (msg) {
  if (window.COMBAT_TEST) return _faintLives(msg);
  if (S.lives === undefined) S.lives = MAX_LIVES;
  if (S.lives > 0 && cur && !cur.indoor) {
    S.lives--; recalc(); S.p.hp = maxHP(); pl.inv = 2; pl.burn = 0; pl.chill = 0; LAST_FIGHT = gameT; S.lifeT = 0;
    for (const e of cur.ents) { if (e.type !== 'enemy' || e.dead) continue; const d = Math.hypot(e.x - S.p.x, e.y - S.p.y) || 1; if (d < 90) { e.kb = .3; e.vx = (e.x - S.p.x) / d * 260; e.vy = (e.y - S.p.y) / d * 260; e.wind = 0; e.atkCd = 1.5; } }
    if (typeof HAZ !== 'undefined') for (const h of HAZ) if (Math.hypot(h.x - S.p.x, h.y - S.p.y) < 70) h.dead = 1;
    SHAKE = .4; SFX.boom(); if (typeof ring === 'function') ring(S.p.x, S.p.y - 4, 70, '#ffe8a0', .5, 3);
    toast(S.lives ? 'You lost a life! ' + S.lives + ' left. They come back when you rest out of combat.' : 'Last life used! Get to safety: the next knockout sends you home.', 'bad');
    return;
  }
  return _faintLives(msg);
};
const _endDayLives = endDay;
endDay = function (f) { _endDayLives(f); if (S) { S.lives = MAX_LIVES; S.lifeT = 0; } };
const _hudTickLives = hudTick;
hudTick = function (dt) {
  _hudTickLives(dt); if (!S || TITLE) return;
  if (S.lives === undefined) S.lives = MAX_LIVES;
  if (S.lives < MAX_LIVES && !PAUSED && gameT - LAST_FIGHT > 8) { S.lifeT = (S.lifeT || 0) + dt; if (S.lifeT >= 60) { S.lifeT = 0; S.lives++; toast('A life came back (' + S.lives + '/' + MAX_LIVES + ').', 'lvl'); SFX.ok(); } }
  let el_ = document.getElementById('lives'); const bars = document.getElementById('bars');
  if (!el_ && bars) { el_ = el('div', { id: 'lives', title: 'Lives: lose one instead of being knocked out; they come back out of combat' }); bars.append(el_); }
  if (el_) { const k = S.lives + ':' + Math.floor((S.lifeT || 0) / 6); if (el_.dataset.k !== k) { el_.dataset.k = k; el_.innerHTML = ''; for (let i = 0; i < MAX_LIVES; i++) el_.append(el('span', { class: i < S.lives ? 'on' : i === S.lives ? 'fill' : '' }, '♥')); if (S.lives < MAX_LIVES) el_.lastChild.style.setProperty('--f', ((S.lifeT || 0) / 60 * 100) + '%'); } }
};
