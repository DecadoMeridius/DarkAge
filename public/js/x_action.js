/* ================= Action combat, phase 1 (docs/COMBAT_OVERHAUL.md, D1-D3) =================
   Options → Combat: Action (default) or Classic (the old click-a-target tick combat).
   ACTION MODE
   - Left click (hold to keep swinging) attacks right now toward the mouse with the weapon's own range, arc,
     speed and knockback; three hits in a row make a combo whose last hit is heavier and staggers. No
     misses: weak rolls are just weaker hits. Bows fire real arrows toward the mouse. Clicking an enemy
     while holding a tool switches to your weapon first.
   - Shift dashes: invulnerable, quick, 0.45 s cooldown.
   - Feedback: hit-stop, knockback, flash, sparks, shake, damage numbers; the target frame shows the last
     enemy you hit.
   - Enemies attack in real time: a wind-up with a red marker on the ground toward you, a strike you can
     dash through or step out of, then a recovery. Guard (C by default) opens a 0.5 s parry window: a hit
     in it does nothing and stuns the attacker.
   - Abilities aim with the mouse (Lunge, Rend and Volley pick the enemy nearest your aim).
   Progression is unchanged: levels and gear set the damage (PS.maxHit) and defence. */

SETTINGS.combat = SETTINGS.combat || 'action';
const ACTION = () => SETTINGS.combat !== 'classic';
const WPN = {
  dagger: { cd: .2, range: 17, arc: 1.6, kb: 70, mult: .75, combo: [1, 1, 1.7] },
  sword: { cd: .3, range: 22, arc: 2.2, kb: 110, mult: 1, combo: [1, 1.1, 1.7] },
  spear: { cd: .38, range: 32, arc: .9, kb: 150, mult: 1.05, combo: [1, 1.05, 1.8] },
  hammer: { cd: .52, range: 22, arc: 2.8, kb: 230, mult: 1.5, combo: [1, 1.2, 2] },
  bow: { cd: .42, ranged: 1, mult: 1, combo: [1, 1, 1.4] },
};
const ACT = { cd: 0, combo: 0, comboT: 0, hitstop: 0, parry: 0, slash: null };
const PSHOTS = [];
const aimAngle = () => { const [wx, wy] = mouseWorld(); return Math.atan2(wy - (S.p.y - 8), wx - S.p.x); };
const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };
const faceAngle = a => { S.p.dir = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? (Math.cos(a) < 0 ? 1 : 2) : (Math.sin(a) < 0 ? 3 : 0); if (S.p.dir === 1 || S.p.dir === 2) S.p.lastH = S.p.dir; };

function actionHit(e, mult, a, kb, opts = {}) {
  const E = EN[e.k]; if (!E || e.dead) return 0;
  let dmg = PS.maxHit * (.55 + .45 * Math.random()) * mult;
  if (E.undead) dmg *= 1 + (PS.holy || 0);
  if (PS.tree && PS.tree.exec && e.hp < e.mhp * .3) dmg *= 1.3;
  const crit = Math.random() < PS.crit; if (crit) { dmg *= PS.wt === 'dagger' ? 2.2 : 1.8; if (PS.tree && PS.tree.critFocus) gainFocus(15); }
  dmg = Math.max(1, Math.round(dmg - E.def * .4));
  e.hp -= dmg; e.flash = .14; splat(e.x, e.y - E.r * 2 - 4, dmg, crit ? 'crit' : 'hit');
  const k = (E.boss ? .25 : 1) * kb; e.kb = .14; e.vx = Math.cos(a) * k; e.vy = Math.sin(a) * k;
  if (opts.stagger && !E.boss) { e.wind = 0; e.atkCd = Math.max(e.atkCd || 0, .8); e.stun = Math.max(e.stun || 0, .35); }
  if (PS.slow || PS.elem === 'ice') e.st.slow = 2; if (PS.burn || PS.elem === 'fire') e.st.burn = 3;
  cxp(PS.style, dmg * .6); cxp('constitution', dmg * .2); gainFocus(PS.fgain);
  TARGET = e; ACT.hitstop = Math.max(ACT.hitstop, crit || opts.stagger ? .07 : .04); SHAKE = Math.max(SHAKE, PS.wt === 'hammer' || opts.stagger ? .14 : .06);
  for (let i = 0; i < 6; i++) PARTS.push({ x: e.x, y: e.y - E.r, vx: Math.cos(a) * 60 + (Math.random() - .5) * 80, vy: Math.sin(a) * 60 + (Math.random() - .5) * 80, t: .25, c: crit ? '#ffd040' : '#fff0c0' });
  SFX.hit();
  if (e.hp <= 0) killEnemy(cur, e);
  return dmg;
}
function actionAttack() {
  if (ACT.cd > 0 || pl.roll > 0 || PAUSED || TITLE) return;
  const w = WPN[PS.wt] || WPN.sword, a = aimAngle();
  ACT.combo = ACT.comboT > 0 ? (ACT.combo + 1) % 3 : 0; ACT.comboT = w.cd + .4;
  const fin = ACT.combo === 2, m = w.combo[ACT.combo] * w.mult;
  ACT.cd = w.cd * (fin ? 1.35 : 1) / (1 + (PS.aspd || 0));
  faceAngle(a); pl.swing = .22; pl.swingT = .22; LAST_FIGHT = gameT;
  if (w.ranged) {
    const ammo = has('fire_arrow') ? 'fire_arrow' : has('arrow') ? 'arrow' : null;
    if (!ammo) { toast('Out of arrows. Craft some at a workbench.', 'bad'); ACT.cd = .5; return; }
    take(ammo); SFX.bow();
    PSHOTS.push({ x: S.p.x + Math.cos(a) * 8, y: S.p.y - 10 + Math.sin(a) * 8, vx: Math.cos(a) * 280, vy: Math.sin(a) * 280, t: 0, mult: m, fire: ammo === 'fire_arrow', a });
    return;
  }
  SFX.swing(); moveEnt(cur, S.p, Math.cos(a) * 4, Math.sin(a) * 4, 5); // a small step into the swing
  ACT.slash = { a, t: .14, T: .14, r: w.range + 4, arc: w.arc, fin };
  const cx = S.p.x, cy = S.p.y - 6;
  for (const e of cur.ents) {
    if (e.type !== 'enemy' || e.dead) continue; const E = EN[e.k]; if (E.ai === 'ambush' && !e.awake) continue;
    const ex = e.x, ey = e.y - E.r, d = Math.hypot(ex - cx, ey - cy);
    if (d > w.range + E.r + 2 || (d > E.r + 8 && angDiff(Math.atan2(ey - cy, ex - cx), a) > w.arc / 2)) continue; // an enemy overlapping you is always in the swing
    actionHit(e, m, Math.atan2(ey - cy, ex - cx), w.kb * (fin ? 1.6 : 1), { stagger: fin });
  }
  // swings still cut grass and weeds in front of you
  const [tx, ty] = [Math.floor((cx + Math.cos(a) * 14) / 16), Math.floor((cy + Math.sin(a) * 14) / 16)], o = getO(cur, tx, ty);
  if (o && (o.k === 'tgrass' || o.k === 'weed')) cutGrass(cur, tx, ty, o);
}
function updateShots(dt) {
  for (const s of PSHOTS) {
    s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt;
    if (s.t > 1.2 || solidAt(cur, s.x, s.y + 6)) { s.dead = 1; continue; }
    for (const e of cur.ents) { if (e.type !== 'enemy' || e.dead) continue; const E = EN[e.k]; if (Math.hypot(e.x - s.x, e.y - E.r - s.y) < E.r + 4) { actionHit(e, s.mult, s.a, 60); if (s.fire) e.st.burn = 3; s.dead = 1; break; } }
  }
  for (let i = PSHOTS.length - 1; i >= 0; i--) if (PSHOTS[i].dead) PSHOTS.splice(i, 1);
}

/* enemies: wind-up, strike, recover (bosses keep their own telegraphed moves; their plain melee uses this too) */
function enemyAttackAI(m, dt) {
  for (const e of m.ents) {
    if (e.type !== 'enemy' || e.dead || e.leash) continue; const E = EN[e.k]; if (E.ai === 'ambush' && !e.awake) continue;
    e.atkCd = (e.atkCd || .6) - dt;
    const d = Math.hypot(S.p.x - e.x, S.p.y - e.y), reach = E.r + 16;
    if (e.wind > 0) {
      e.wind -= dt; e.stun = Math.max(e.stun || 0, dt * 1.01); // stands still while winding up
      if (e.wind <= 0) {
        e.lunge = .3; e.atkCd = (E.boss ? 2.2 : 1.1) + Math.random() * .6;
        const hit = d < reach + 4 && angDiff(Math.atan2(S.p.y - e.y, S.p.x - e.x), e.windA) < 1.1;
        if (hit && ACT.parry > 0) { ACT.parry = 0; e.stun = 1.2; e.kb = .15; e.vx = -Math.cos(e.windA) * 140; e.vy = -Math.sin(e.windA) * 140; floatText(S.p.x, S.p.y - 34, 'Parry!', '#9ad8ff'); SFX.ok(); actionHit(e, 1.2, e.windA + Math.PI, 0, { stagger: 1 }); continue; }
        if (hit && pl.roll <= 0 && pl.inv <= 0) {
          let dmg = 1 + e.atk * (.6 + Math.random() * .7) * (E.boss ? .8 : 1);
          if (GUARD > 0) dmg *= .5;
          hurtPlayer(dmg + PS.def * .65, e.x, e.y, E.elem); cxp('defence', dmg); LAST_FIGHT = gameT;
        } else if (hit) { cxp('defence', 1); }
      }
      continue;
    }
    if (e.atkCd <= 0 && d < reach && !(e.stun > 0)) { e.wind = E.boss ? .65 : .45 + Math.random() * .15; e.windT = e.wind; e.windA = Math.atan2(S.p.y - e.y, S.p.x - e.x); LAST_FIGHT = gameT; }
  }
}
const _enemyTickA = enemyTick;
enemyTick = function (m) {
  if (!ACTION()) return _enemyTickA(m);
  for (const e of m.ents) { // only bleeding still runs on the tick
    if (e.type !== 'enemy' || e.dead || !(e.bleed > 0)) continue; e.bleed--; const E = EN[e.k], b = Math.max(1, Math.round(PS.maxHit * .25)); e.hp -= b; splat(e.x, e.y - E.r * 2 - 4, b, 'bleed'); if (e.hp <= 0) killEnemy(m, e);
  }
};
const _autoAttackA = autoAttack;
autoAttack = function () { if (ACTION()) return; return _autoAttackA(); };

/* hooks: input, update, drawing */
const _primaryUseAct = primaryUse;
primaryUse = function () {
  if (ACTION() && !PAUSED && !TITLE && !fishing && S && cur) {
    const [wx, wy] = mouseWorld(), onEnemy = enemyAt(wx, wy), near = cur.ents.some(e => e.type === 'enemy' && !e.dead && Math.hypot(e.x - S.p.x, e.y - S.p.y) < 130);
    if (selKind() === 'weapon' && (near || onEnemy || !hasTarget(...clickTarget()))) { stopWalk(); actionAttack(); return; }
    if (onEnemy) { const w = S.hot.indexOf('weapon'); if (w >= 0) { S.sel = w; hudKey = ''; } stopWalk(); actionAttack(); return; }
  }
  return _primaryUseAct();
};
const _dodgeA = dodge;
dodge = function () { const before = pl.roll; _dodgeA(); if (ACTION() && pl.roll > 0 && before <= 0) { pl.roll = .2; pl.rollCd = hasPerk('acrobat') ? .3 : .45; pl.inv = Math.max(pl.inv, .22); } };
const _useAbilityA = useAbility;
useAbility = function (slot) {
  if (ACTION() && S && cur) { // aim: the enemy nearest the mouse direction within reach
    const a = aimAngle(); let best = null, bs = 1e9;
    for (const e of cur.ents) { if (e.type !== 'enemy' || e.dead) continue; const d = Math.hypot(e.x - S.p.x, e.y - S.p.y); if (d > 140) continue; const sc = d + angDiff(Math.atan2(e.y - S.p.y, e.x - S.p.x), a) * 60; if (sc < bs) { bs = sc; best = e; } }
    if (best) TARGET = best;
    if (S.abil[slot] === 'guard') ACT.parry = .5;
    LAST_FIGHT = gameT;
  }
  return _useAbilityA(slot);
};
const _updateAct = update;
update = function (dt) {
  if (ACTION() && ACT.hitstop > 0 && !PAUSED) { ACT.hitstop -= dt; return; } // hit-stop: the world freezes for a moment
  if (!ACTION()) return _updateAct(dt);
  ACT.cd -= dt; ACT.comboT -= dt; ACT.parry -= dt; if (ACT.slash) { ACT.slash.t -= dt; if (ACT.slash.t <= 0) ACT.slash = null; }
  if (TARGET && (TARGET.dead || !cur.ents.includes(TARGET))) TARGET = null;
  const t = TARGET; TARGET = null; // no auto-chasing in action mode
  try { _updateAct(dt); } finally { if (t && !t.dead) TARGET = t; }
  if (!PAUSED && !TITLE && cur) {
    if (MOUSE.down && selKind() === 'weapon' && !fishing && !MODAL) actionAttack();
    updateShots(dt); enemyAttackAI(cur, dt);
  }
};
const _drawEntA = drawEnt;
drawEnt = function (e) {
  if (ACTION() && e.type === 'enemy' && e.wind > 0 && !e.dead) { // the wind-up marker on the ground
    const E = EN[e.k], k = 1 - e.wind / (e.windT || .5), r = E.r + 16;
    g.save(); g.globalAlpha = .25 + k * .4; g.fillStyle = k > .75 ? '#ff3a2a' : '#e8402a';
    g.beginPath(); g.moveTo(e.x, e.y - 2); g.arc(e.x, e.y - 2, r, e.windA - 1.1, e.windA + 1.1); g.closePath(); g.fill();
    g.globalAlpha = .7; g.strokeStyle = '#ffd0c0'; g.lineWidth = 1; g.beginPath(); g.arc(e.x, e.y - 2, r * k, e.windA - 1.1, e.windA + 1.1); g.stroke(); g.restore();
  }
  return _drawEntA(e);
};
const _pcCursorDrawAct = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawAct(m);
  if (!ACTION() || TITLE) return;
  const s = ACT.slash;
  if (s) { const k = 1 - s.t / s.T, cx = S.p.x, cy = S.p.y - 6; g.save(); g.globalAlpha = .75 * (1 - k); g.strokeStyle = s.fin ? '#ffd040' : '#fff6e0'; g.lineWidth = s.fin ? 3 : 2;
    g.beginPath(); g.arc(cx, cy, s.r * (.7 + .3 * k), s.a - s.arc / 2 + s.arc * k * .2, s.a + s.arc / 2 - s.arc * (1 - k) * .2); g.stroke(); g.restore(); }
  for (const p of PSHOTS) { g.strokeStyle = p.fire ? '#ff8a2a' : '#e8dcc0'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * .025, p.y - p.vy * .025); g.stroke(); g.fillStyle = '#9aa2b4'; g.fillRect(p.x - .75, p.y - .75, 1.5, 1.5); }
};

/* Options: combat style */
const _renderOptsAct = renderOpts;
renderOpts = function (b) {
  _renderOptsAct(b);
  const row = el('div', { class: 'acts wrap' }, el('span', { style: 'display:inline-block;width:120px' }, 'Combat'),
    ...[['action', 'Action (aim and swing)'], ['classic', 'Classic (target and auto-attack)']].map(([v, n]) => el('button', { class: 'btn' + (SETTINGS.combat === v ? '' : ' ghost'), on: () => { SETTINGS.combat = v; saveSettings(); TARGET = null; refresh(); } }, n)));
  b.prepend(row);
};
