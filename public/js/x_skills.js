/* ================= Combat skill trees and magic (docs/COMBAT_OVERHAUL.md, D5 + D6) =================
   SKILL TREES (Satchel → Combat skills, or V): three trees of five active skills, one per combat style:
     Blade (Melee, any melee weapon): Whirlwind, Ground Slam, Blade Dash, Leaping Strike, Blade Storm
     Marksman (Ranged, a bow): Piercing Shot, Multishot, Rain of Arrows, Snare Trap, Hunter's Mark
     Arcane (Magic, a staff): Fireball, Frost Nova, Chain Lightning, Arcane Orbs, Meteor
   Each tree earns a point per 5 levels of its style. A skill needs its style level and the skill before it;
   ranks 1-3 (each rank +30% power). Unlocked skills go into the Z / X / C slots (choose them in this tab
   or in the passive tree), cost Focus and have cooldowns. Every skill has its own effects (VFX).
   MAGIC: staffs for every metal tier (Melee weapons' Magic twin): the basic attack fires a magic bolt toward
   the mouse, damage from your Magic level. Robes and hats (Apprentice, Adept, Mystic, Arcanist, Starweave)
   add magic damage and Focus regeneration; they need Magic to wear. Staffs and robes are learned with the
   matching smithing patterns. */

/* ---------- magic gear ---------- */
WTYPE.staff = { n: 'Staff', m: .95, cd: .42, reach: 15, arc: .6, cost: 3 };
TIERS.forEach(([tk, tn, col], t) => {
  if (tk === 'leather') return;
  const atk = Math.round(TIER_ATK[t] * .95), gem = ['#8a6aff', '#ff8a2a', '#5ad8ff', '#7aff8a', '#ff5a8a'][t % 5];
  I(tk + '_staff', tn + ' Staff', 'weapon', atk * 32 + 30, 'staff', gem, col, { slot: 'weapon', atk, wt: 'staff', tier: tk, ti: t, cd: .42, desc: 'Fires magic bolts toward the mouse. Uses Magic.' });
  RC.push(tk === 'wood' ? ['wood_staff', 1, { wood: 14, fiber: 3 }, 'bench'] : [tk + '_staff', 1, { [TIERS[t][3]]: 3, haft: 1, cave_crystal: 1 }, 'anvil', ['smithing', Math.max(1, Math.min(10, t))]]);
});
const ROBES = [['apprentice', 'Apprentice', 'copper', '#5a7ac8', .08, null], ['adept', 'Adept', 'silver', '#7a4aa8', .14, 'silver_bar'], ['mystic', 'Mystic', 'gold', '#2a8a7a', .2, 'gold_bar'],
  ['arcanist', 'Arcanist', 'mythril', '#2a3a8a', .28, 'mythril_bar'], ['starweave', 'Starweave', 'star', '#e8d888', .36, 'starmetal']];
ROBES.forEach(([k, n, tk, col, mg, bar], i) => {
  const ti = TIERS.findIndex(t => t[0] === tk);
  I(k + '_robe', n + ' Robe', 'armor', 300 + i * 900, 'robe', col, '#ffd040', { slot: 'body', def: 1 + i * 2, tier: tk, ti, magic: mg, fregen: 1 + i, desc: '+' + Math.round(mg * 100) + '% magic damage, Focus slowly refills.' });
  I(k + '_hat', n + ' Hat', 'armor', 200 + i * 600, 'hat', col, '#ffd040', { slot: 'helm', def: i + 1, tier: tk, ti, magic: mg / 2, desc: '+' + Math.round(mg * 50) + '% magic damage.' });
  RC.push([k + '_robe', 1, Object.assign({ cloth: 3 + i, padding: 1 }, bar ? { [bar]: 2 } : {}), i ? 'anvil' : 'bench'], [k + '_hat', 1, Object.assign({ cloth: 2 + i }, bar ? { [bar]: 1 } : {}), i ? 'anvil' : 'bench']);
});
const _recalcSk = recalc;
recalc = function () {
  _recalcSk(); if (!S || !PS) return;
  PS.magicBonus = 0; PS.fregen = 0;
  for (const s of ['helm', 'body', 'boots', 'shield', 'ring1', 'ring2']) { const it = S.eq[s] && IT[S.eq[s]]; if (it) { PS.magicBonus += it.magic || 0; PS.fregen += it.fregen || 0; } }
};
WPN.staff = { cd: .42, ranged: 1, bolt: 1, mult: 1, combo: [1, 1, 1.5] };

/* ---------- effects ---------- */
const VFX = [];
const vfx = (draw, T, extra) => VFX.push(Object.assign({ t: 0, T, draw }, extra || {}));
const enemiesNear = (x, y, r) => cur.ents.filter(e => e.type === 'enemy' && !e.dead && Math.hypot(e.x - x, e.y - EN[e.k].r - y) < r + EN[e.k].r);
function hitArea(x, y, r, mult, kb, opts = {}) { let n = 0; for (const e of enemiesNear(x, y, r)) { actionHit(e, mult, Math.atan2(e.y - y, e.x - x), kb, opts); if (opts.slow) e.st.slow = opts.slow; if (opts.burn) e.st.burn = opts.burn; if (opts.freeze) e.stun = Math.max(e.stun || 0, opts.freeze); n++; } return n; }
let rankK = id => 1 + .3 * (((S.cskill || {})[id] || 1) - 1);
const burst = (x, y, n, c, sp = 90) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = sp * (.4 + Math.random() * .6); PARTS.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: .35 + Math.random() * .25, c }); } };
const ring = (x, y, r, col, T = .35, w = 2) => vfx(k => { g.globalAlpha = 1 - k; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.ellipse(x, y, r * (.3 + .7 * k), r * .7 * (.3 + .7 * k), 0, 0, 6.283); g.stroke(); g.globalAlpha = 1; }, T);
const SKP = []; // skill projectiles: { x, y, vx, vy, t, life, kind, pierce, hit:Set }
const after = (s, fn) => vfx(() => {}, s, { done: fn });

/* ---------- the skills ---------- */
const CTREES = {
  blade: { n: 'Blade', style: 'melee', need: w => w && w !== 'bow' && w !== 'staff', needN: 'a melee weapon' },
  marks: { n: 'Marksman', style: 'ranged', need: w => w === 'bow', needN: 'a bow' },
  arcane: { n: 'Arcane', style: 'magic', need: w => w === 'staff', needN: 'a staff' },
};
const CSKILLS = [
  ['whirlwind', 'blade', 5, 'Whirlwind', 30, 8, 'Spin with your weapon, hitting everything around you five times.', () => { const id = 'whirlwind'; for (let i = 0; i < 5; i++) after(i * .15, () => { hitArea(S.p.x, S.p.y - 6, 30, .55 * rankK(id), 80); });
    vfx(k => { g.save(); g.translate(S.p.x, S.p.y - 6); g.rotate(k * 14); g.strokeStyle = 'rgba(255,246,224,' + (1 - k * .6) + ')'; g.lineWidth = 2; for (let a = 0; a < 3; a++) { g.beginPath(); g.arc(0, 0, 26, a * 2.09, a * 2.09 + 1.2); g.stroke(); } g.restore(); }, .8); }],
  ['groundslam', 'blade', 15, 'Ground Slam', 35, 10, 'Smash the ground in front of you: a cone of rock that hits hard and stuns.', () => { const a = aimAngle(), x = S.p.x + Math.cos(a) * 22, y = S.p.y - 4 + Math.sin(a) * 22; SHAKE = .3; SFX.boom();
    for (const e of enemiesNear(S.p.x, S.p.y - 6, 52)) if (angDiff(Math.atan2(e.y - S.p.y, e.x - S.p.x), a) < .9) { actionHit(e, 1.6 * rankK('groundslam'), a, 200, { stagger: 1 }); e.stun = Math.max(e.stun || 0, 1); }
    burst(x, y, 18, '#a89880', 110); ring(x, y, 44, '#d8c8a8', .4, 3); vfx(k => { g.strokeStyle = 'rgba(60,40,30,' + (1 - k) + ')'; g.lineWidth = 1; for (let i = -2; i <= 2; i++) { const b = a + i * .3; g.beginPath(); g.moveTo(S.p.x, S.p.y - 4); g.lineTo(S.p.x + Math.cos(b) * 50, S.p.y - 4 + Math.sin(b) * 50); g.stroke(); } }, .6); }],
  ['bladedash', 'blade', 25, 'Blade Dash', 30, 9, 'Dash through enemies toward the mouse, cutting everything on the way.', () => { const a = aimAngle(), x0 = S.p.x, y0 = S.p.y, hit = new Set();
    for (let s = 0; s < 14; s++) { moveEnt(cur, S.p, Math.cos(a) * 5, Math.sin(a) * 5, 5); for (const e of enemiesNear(S.p.x, S.p.y - 6, 14)) if (!hit.has(e)) { hit.add(e); actionHit(e, 1.3 * rankK('bladedash'), a, 120); } }
    pl.inv = Math.max(pl.inv, .3); const x1 = S.p.x, y1 = S.p.y; vfx(k => { for (let i = 0; i < 5; i++) { const f = i / 5; g.fillStyle = 'rgba(200,230,255,' + (.5 - k * .5) * (1 - f) + ')'; g.fillRect(x1 + (x0 - x1) * f - 4, y1 + (y0 - y1) * f - 28, 8, 26); } g.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0 - 10); g.lineTo(x1, y1 - 10); g.stroke(); }, .35); SFX.swing(); }],
  ['leap', 'blade', 40, 'Leaping Strike', 40, 12, 'Leap to the mouse (up to 6 tiles) and crash down on everything there.', () => { const [mx, my] = mouseWorld(), a = Math.atan2(my - S.p.y, mx - S.p.x), d = Math.min(96, Math.hypot(mx - S.p.x, my - S.p.y)), tx = S.p.x + Math.cos(a) * d, ty = S.p.y + Math.sin(a) * d;
    pl.inv = Math.max(pl.inv, .5); const sx = S.p.x, sy = S.p.y; let landed = 0;
    vfx(k => { if (k < 1) { S.p.x = sx + (tx - sx) * k; S.p.y = sy + (ty - sy) * k; } g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(tx, ty, 14 * k, 5 * k, 0, 0, 6.283); g.fill(); }, .35, { done: () => { if (!boxFree(cur, tx, ty, 5)) { S.p.x = sx; S.p.y = sy; } hitArea(S.p.x, S.p.y - 6, 40, 2 * rankK('leap'), 220, { stagger: 1 }); SHAKE = .35; SFX.boom(); burst(S.p.x, S.p.y, 22, '#d8c8a8', 130); ring(S.p.x, S.p.y, 46, '#fff0c0', .45, 3); } }); }],
  ['bladestorm', 'blade', 60, 'Blade Storm', 60, 30, 'Six spectral blades circle you for 4 seconds, cutting whatever they touch.', () => { let acc = 0;
    vfx(k => { const T = gameT * 6; for (let i = 0; i < 6; i++) { const a = T + i * 1.047, x = S.p.x + Math.cos(a) * 26, y = S.p.y - 8 + Math.sin(a) * 18; g.save(); g.translate(x, y); g.rotate(a + 1.57); g.fillStyle = 'rgba(190,230,255,.85)'; g.fillRect(-1, -6, 2, 10); g.fillStyle = '#fff'; g.fillRect(-1, -6, 1, 4); g.restore(); } }, 4, { tick: dt => { acc += dt; if (acc > .3) { acc = 0; hitArea(S.p.x, S.p.y - 6, 30, .5 * rankK('bladestorm'), 40); } } }); }],
  ['piercing', 'marks', 5, 'Piercing Shot', 25, 7, 'A glowing arrow that flies through every enemy in a line.', () => { const a = aimAngle(); SKP.push({ x: S.p.x, y: S.p.y - 10, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, t: 0, life: .9, kind: 'pierce', mult: 2 * rankK('piercing'), hit: new Set(), a }); SFX.bow(); }],
  ['multishot', 'marks', 15, 'Multishot', 30, 8, 'Five arrows in a fan.', () => { const a = aimAngle(); for (let i = -2; i <= 2; i++) { const b = a + i * .17; SKP.push({ x: S.p.x, y: S.p.y - 10, vx: Math.cos(b) * 300, vy: Math.sin(b) * 300, t: 0, life: .8, kind: 'arrow', mult: .8 * rankK('multishot'), hit: new Set(), a: b }); } SFX.bow(); }],
  ['rain', 'marks', 25, 'Rain of Arrows', 40, 12, 'Arrows rain on the spot under the mouse for 2 seconds.', () => { const [x, y] = mouseWorld(); let acc = 0;
    vfx(k => { g.fillStyle = 'rgba(255,220,160,.12)'; g.beginPath(); g.ellipse(x, y, 38, 26, 0, 0, 6.283); g.fill(); g.strokeStyle = '#e8dcc0'; g.lineWidth = 1; for (let i = 0; i < 7; i++) { const ax = x + Math.sin(i * 7.3 + gameT * 3) * 34, ay = y + Math.cos(i * 4.1 + gameT * 2) * 22 - ((gameT * 300 + i * 40) % 60); g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax - 2, ay - 9); g.stroke(); } }, 2, { tick: dt => { acc += dt; if (acc > .18) { acc = 0; hitArea(x, y, 38, .45 * rankK('rain'), 20); } } }); }],
  ['trap', 'marks', 40, 'Snare Trap', 30, 14, 'Set a snare under the mouse: the first enemy to step on it is rooted and it explodes.', () => { const [x, y] = mouseWorld(); const T = { x, y, armed: 1 };
    vfx(k => { if (!T.armed) return;
      g.strokeStyle = '#8a6a3a'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 6, 0, 6.283); g.stroke(); g.fillStyle = Math.floor(gameT * 3) % 2 ? '#ffd040' : '#8a6a3a'; g.fillRect(x - 1, y - 1, 2, 2); }, 30, { tick: () => { if (!T.armed) return; const e = enemiesNear(x, y, 10)[0]; if (e) { T.armed = 0; e.stun = Math.max(e.stun || 0, 2); hitArea(x, y, 32, 1.8 * rankK('trap'), 150); burst(x, y, 20, '#ffb040', 120); ring(x, y, 34, '#ffd040', .4, 3); SFX.boom(); } } }); }],
  ['mark', 'marks', 60, 'Hunter\'s Mark', 25, 15, 'Mark the enemy nearest your aim: it takes 40% more damage for 8 seconds.', () => { const e = TARGET; if (!e) { toast('No enemy near your aim.', 'bad'); return false; } e.marked = gameT + 8; SFX.ok();
    vfx(() => { if (e.dead || gameT > e.marked) return; g.save(); g.translate(e.x, e.y - EN[e.k].r * 2 - 10); g.rotate(gameT * 2); g.strokeStyle = '#ff5a3a'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 5, 0, 6.283); g.stroke(); for (let i = 0; i < 4; i++) { g.rotate(1.57); g.fillStyle = '#ff5a3a'; g.fillRect(4, -.5, 3, 1); } g.restore(); }, 8); }],
  ['fireball', 'arcane', 5, 'Fireball', 25, 6, 'A ball of fire that bursts where it hits, burning everything nearby.', () => { const a = aimAngle(); SKP.push({ x: S.p.x, y: S.p.y - 10, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, t: 0, life: 1.4, kind: 'fireball', mult: 1.6 * rankK('fireball'), hit: new Set(), a }); SFX.fire(); }],
  ['frostnova', 'arcane', 15, 'Frost Nova', 35, 10, 'A ring of frost bursts from you: it hits, freezes enemies for a moment and slows them.', () => { hitArea(S.p.x, S.p.y - 6, 46, .9 * rankK('frostnova'), 90, { slow: 3, freeze: .8 }); ring(S.p.x, S.p.y - 4, 50, '#bfe8ff', .45, 3); burst(S.p.x, S.p.y - 6, 26, '#d8f2ff', 140); snd(1200, .2, 'sine', .04, -800); }],
  ['chain', 'arcane', 25, 'Chain Lightning', 35, 8, 'Lightning strikes the enemy nearest your aim and jumps to four more.', () => { let e = TARGET; if (!e) { toast('No enemy near your aim.', 'bad'); return false; } const seen = new Set(), pts = [[S.p.x, S.p.y - 14]]; let m = 1.2 * rankK('chain');
    for (let j = 0; j < 5 && e; j++) { seen.add(e); actionHit(e, m, 0, 30); e.st.slow = 1; pts.push([e.x, e.y - EN[e.k].r]); m *= .8; e = cur.ents.filter(x => x.type === 'enemy' && !x.dead && !seen.has(x) && Math.hypot(x.x - e.x, x.y - e.y) < 70).sort((p, q) => Math.hypot(p.x - e.x, p.y - e.y) - Math.hypot(q.x - e.x, q.y - e.y))[0]; }
    snd(1600, .15, 'sawtooth', .03, -1200); vfx(k => { g.strokeStyle = 'rgba(200,230,255,' + (1 - k) + ')'; g.lineWidth = 1.5; g.beginPath(); for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; g.moveTo(x0, y0); for (let s = 1; s < 5; s++) g.lineTo(x0 + (x1 - x0) * s / 5 + (Math.random() - .5) * 8, y0 + (y1 - y0) * s / 5 + (Math.random() - .5) * 8); g.lineTo(x1, y1); } g.stroke(); }, .3); }],
  ['orbs', 'arcane', 40, 'Arcane Orbs', 45, 20, 'Three arcane orbs circle you for 6 seconds and burn through what they touch.', () => { let acc = 0;
    vfx(k => {
      for (let i = 0; i < 3; i++) { const a = gameT * 3 + i * 2.09, x = S.p.x + Math.cos(a) * 34, y = S.p.y - 8 + Math.sin(a) * 24; g.fillStyle = 'rgba(160,110,255,.35)'; g.beginPath(); g.arc(x, y, 6, 0, 6.283); g.fill(); g.fillStyle = '#e0c8ff'; g.beginPath(); g.arc(x, y, 2.5, 0, 6.283); g.fill(); } }, 6, { tick: dt => { acc += dt; if (acc > .35) { acc = 0; for (let i = 0; i < 3; i++) { const a = gameT * 3 + i * 2.09; hitArea(S.p.x + Math.cos(a) * 34, S.p.y - 8 + Math.sin(a) * 24, 9, .6 * rankK('orbs'), 30); } } } }); }],
  ['meteor', 'arcane', 60, 'Meteor', 60, 30, 'Call a meteor down on the spot under the mouse: a huge burning blast after a moment.', () => { const [x, y] = mouseWorld();
    vfx(k => { g.fillStyle = 'rgba(255,90,30,' + (.12 + k * .3) + ')'; g.beginPath(); g.ellipse(x, y, 56, 38, 0, 0, 6.283); g.fill(); const my = y - 160 * (1 - k), mx = x + 60 * (1 - k); g.fillStyle = '#ff8a2a'; g.beginPath(); g.arc(mx, my, 7, 0, 6.283); g.fill(); g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(mx, my, 3.5, 0, 6.283); g.fill(); }, 1, { done: () => { hitArea(x, y, 56, 3.5 * rankK('meteor'), 260, { burn: 4, stagger: 1 }); SHAKE = .5; SFX.boom(); burst(x, y, 40, '#ff8a2a', 180); burst(x, y, 20, '#ffe08a', 120); ring(x, y, 60, '#ffb040', .5, 4); } }); }],
];
const CSKI = Object.fromEntries(CSKILLS.map(s => [s[0], s]));
for (const [id, tree, lvl, n, cost, cd, desc, fn] of CSKILLS) ABIL[id] = { n, cost, cd, desc, tree, fn() { const T = CTREES[tree]; if (!T.need(PS.wt)) { toast(n + ' needs ' + T.needN + '.', 'bad'); return false; } LAST_FIGHT = gameT; return fn() !== false; } };
function abilPoolX() { return abilPool().concat(CSKILLS.filter(s => (S.cskill || {})[s[0]] > 0).map(s => s[0])); }

/* ---------- skill projectiles, effects, focus regen, marks ---------- */
function updateSkills(dt) {
  for (const p of SKP) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.t > p.life || solidAt(cur, p.x, p.y + 6)) { if (p.kind === 'fireball') blowFire(p); p.dead = 1; continue; }
    for (const e of cur.ents) { if (e.type !== 'enemy' || e.dead || p.hit.has(e)) continue; if (Math.hypot(e.x - p.x, e.y - EN[e.k].r - p.y) < EN[e.k].r + 5) {
      p.hit.add(e); if (p.kind === 'fireball') { blowFire(p); p.dead = 1; break; } actionHit(e, p.mult, p.a, p.kind === 'pierce' ? 90 : 50, { skill: p.kind !== 'bolt' }); if (p.kind !== 'pierce') { p.dead = 1; break; } } }
  }
  for (let i = SKP.length - 1; i >= 0; i--) if (SKP[i].dead) SKP.splice(i, 1);
  for (const v of VFX) { v.t += dt; if (v.tick && !v.ended) v.tick(dt); if (v.t >= v.T && !v.ended) { v.ended = 1; if (v.done) v.done(); } }
  for (let i = VFX.length - 1; i >= 0; i--) if (VFX[i].ended) VFX.splice(i, 1);
  if (PS.fregen && !PAUSED) { S.focusAcc = (S.focusAcc || 0) + dt; if (S.focusAcc > 1) { S.focusAcc = 0; gainFocus(PS.fregen); } }
}
function blowFire(p) { hitArea(p.x, p.y, 30, p.mult, 140, { burn: 3 }); burst(p.x, p.y, 20, '#ff8a2a', 120); ring(p.x, p.y, 32, '#ffb040', .35, 3); SFX.boom(); }
const _actionHitSk = actionHit;
actionHit = function (e, mult, a, kb, opts) {
  let m = mult; if (e.marked && gameT < e.marked) m *= 1.4;
  if (PS.style === 'magic') m *= 1 + (PS.magicBonus || 0);
  return _actionHitSk(e, m, a, kb, opts);
};
const _updateSk = update;
update = function (dt) { _updateSk(dt); if (!PAUSED && !TITLE && cur) updateSkills(dt); };
EVT.on('map', () => { VFX.length = 0; SKP.length = 0; });
const _pcCursorDrawSk = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawSk(m); if (TITLE) return;
  for (const v of VFX) { g.save(); if (v.cols && typeof tintedDraw === 'function') tintedDraw(v.cols, () => v.draw(Math.min(1, v.t / v.T))); else v.draw(Math.min(1, v.t / v.T)); g.restore(); } // a skill's effects take its colours (x_fix5.js)
  for (const p of SKP) {
    if (typeof drawSkp === 'function') { drawSkp(p); continue; } // pixel arrows, fireballs and bolts (x_fix5.js)
    if (p.kind === 'fireball') { g.fillStyle = 'rgba(255,120,40,.4)'; g.beginPath(); g.arc(p.x, p.y, 6, 0, 6.283); g.fill(); g.fillStyle = '#ffd060'; g.beginPath(); g.arc(p.x, p.y, 3, 0, 6.283); g.fill(); if (Math.random() < .6) PARTS.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 20, vy: -10, t: .25, c: '#ff8a2a' }); }
    else { g.strokeStyle = p.cols ? p.cols[0] : p.kind === 'pierce' ? '#bfe8ff' : '#e8dcc0'; g.lineWidth = p.kind === 'pierce' ? 2.5 : 1.5; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); g.stroke(); }
  }
};

/* ---------- the staff's basic attack: magic bolts ---------- */
const _actionAttackSk = actionAttack;
actionAttack = function () {
  if (PS.wt !== 'staff') return _actionAttackSk();
  if (ACT.cd > 0 || pl.roll > 0 || PAUSED || TITLE) return;
  const w = WPN.staff, a = aimAngle(); ACT.combo = ACT.comboT > 0 ? (ACT.combo + 1) % 3 : 0; ACT.comboT = w.cd + .4; ACT.cd = w.cd / (1 + (PS.aspd || 0));
  faceAngle(a); pl.swing = .22; pl.swingT = .22; LAST_FIGHT = gameT; snd(900 + ACT.combo * 120, .08, 'sine', .04, -300);
  const big = ACT.combo === 2; SKP.push({ x: S.p.x + Math.cos(a) * 8, y: S.p.y - 12 + Math.sin(a) * 8, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, t: 0, life: .9, kind: big ? 'fireball' : 'bolt', mult: w.combo[ACT.combo], hit: new Set(), a });
};
const _pcCursorDrawBolt = pcCursorDraw;
pcCursorDraw = function (m) { _pcCursorDrawBolt(m); if (typeof drawSkp === 'function') return; for (const p of SKP) if (p.kind === 'bolt') { g.fillStyle = 'rgba(160,120,255,.45)'; g.beginPath(); g.arc(p.x, p.y, 5, 0, 6.283); g.fill(); g.fillStyle = '#efe4ff'; g.beginPath(); g.arc(p.x, p.y, 2, 0, 6.283); g.fill(); } };

/* ---------- the Combat skills tab ---------- */
const treePts = t => Math.floor(clv(CTREES[t].style) / 5) - CSKILLS.filter(s => s[1] === t).reduce((a, s) => a + ((S.cskill || {})[s[0]] || 0), 0);
function renderCSkills(b) {
  S.cskill = S.cskill || {};
  b.append(el('p', { class: 'note' }, 'Each tree earns a point every 5 levels of its combat style. Learn a skill, then put it in a slot (Z, X or C); each extra rank (up to 3) makes it 30% stronger. Skills cost Focus, which you build by hitting enemies.'));
  const cols = el('div', { class: 'cstrees' });
  for (const t in CTREES) {
    const T = CTREES[t], pts = treePts(t), col = el('div', { class: 'cstree f-panel' }, el('h3', null, T.n), el('small', { class: 'note' }, CSKN[T.style] + ' ' + clv(T.style) + ' · ' + pts + ' point' + (pts === 1 ? '' : 's') + ' · needs ' + T.needN));
    CSKILLS.filter(s => s[1] === t).forEach(([id, , lvl, n, cost, cd, desc], i, arr) => {
      const r = S.cskill[id] || 0, prev = i === 0 || (S.cskill[arr[i - 1][0]] || 0) > 0, okLvl = clv(T.style) >= lvl, can = r < 3 && pts > 0 && prev && okLvl;
      const card = el('div', { class: 'cscard' + (r ? ' on' : '') }, el('b', null, n + ' ' + '●'.repeat(r) + '○'.repeat(3 - r)), el('small', null, desc), el('small', { class: 'note' }, 'Focus ' + cost + ' · cooldown ' + (cd * .6).toFixed(1) + ' s'),
        r ? el('small', { class: 'csreq' }, 'Learned' + (r < 3 ? ' · rank up with a ' + T.n + ' point' : '') + ' · used with ' + T.needN) : el('div', { class: 'csreq' }, el('b', null, 'To unlock:'), ...[[okLvl, CSKN[T.style] + ' level ' + lvl + ' (you: ' + clv(T.style) + ')'], [prev, i === 0 ? 'First skill of the ' + T.n + ' tree' : 'Learn ' + arr[i - 1][3] + ' first'], [pts > 0, 'A free ' + T.n + ' point (one per 5 ' + CSKN[T.style] + ' levels; ' + pts + ' left)'], [T.need(PS.wt), 'Hold ' + T.needN + ' to use it']].map(([ok, t]) => el('span', { class: ok ? 'ok' : 'no' }, (ok ? '✓ ' : '✗ ') + t))));
      const acts = el('div', { class: 'acts wrap' });
      if (r >= 3) acts.append(el('button', { class: 'btn off' }, 'Max rank')); // keeps the Z X C buttons in place
      if (r < 3) acts.append(el('button', { class: 'btn' + (can ? '' : ' off'), on: () => { if (!can) { toast(!okLvl ? 'You need ' + CSKN[T.style] + ' ' + lvl + '.' : !prev ? 'Learn the skill above first.' : 'No points left in this tree.', 'bad'); return; } S.cskill[id] = r + 1; SFX.lvl(); refresh(); } }, r ? 'Rank up' : 'Learn'));
      if (r) ['Z', 'X', 'C'].forEach((key, k) => acts.append(el('button', { class: 'btn ghost' + (S.abil[k] === id ? ' on' : '') + (T.need(PS.wt) ? '' : ' off'), title: T.need(PS.wt) ? '' : 'Hold ' + T.needN + ' to put this in its loadout', on: () => { if (!T.need(PS.wt)) { toast('Equip ' + T.needN + ' first: each weapon type keeps its own Z X C loadout.', 'bad'); return; } S.abil[k] = id; hudKey = ''; refresh(); } }, key)));
      card.append(acts); col.append(card);
    });
    cols.append(col);
  }
  b.append(cols);
}
const _openModalSk = openModal;
openModal = function (title, tabs, start, opts) {
  if (title === 'Satchel' && !tabs.some(t => t.id === 'cskills')) { tabs = tabs.slice(); const i = tabs.findIndex(t => t.id === 'tree'); tabs.splice(i < 0 ? 3 : i + 1, 0, { id: 'cskills', label: 'Combat skills', render: renderCSkills }); }
  return _openModalSk(title, tabs, start, opts);
};
MENU_KEYS.v = 'cskills'; TAB_KEY.cskills = 'V';
ACTIONS.splice(ACTIONS.findIndex(a => a[0] === 'tree') + 1, 0, ['cskills', 'Combat skills', 'v']); buildKeymap();

/* tree skills don't need a clicked target: aim at the enemy nearest the mouse direction if there is one */
const _useAbilitySk = useAbility;
useAbility = function (slot) {
  const id = S && S.abil[slot]; if (!CSKI[id]) return _useAbilitySk(slot);
  if (PAUSED || TITLE) return; ensureCombat(); const A = ABIL[id];
  if ((ABCD[id] || 0) > 0) { toast(A.n + ' is recharging.', 'bad'); return; }
  if ((S.focus || 0) < A.cost) { toast('Not enough Focus for ' + A.n + ' (' + A.cost + ').', 'bad'); return; }
  const a = aimAngle(); let best = null, bs = 1e9;
  for (const e of cur.ents) { if (e.type !== 'enemy' || e.dead) continue; const d = Math.hypot(e.x - S.p.x, e.y - S.p.y); if (d > 160) continue; const sc = d + angDiff(Math.atan2(e.y - S.p.y, e.x - S.p.x), a) * 60; if (sc < bs) { bs = sc; best = e; } }
  TARGET = best;
  if (A.fn()) { S.focus -= A.cost; ABCD[id] = Math.ceil(A.cd * (1 - ((PS.tree || {}).abCd || 0))); }
};
