/* ================= Boss mechanics (docs/COMBAT_OVERHAUL.md, D4) =================
   Every boss gets its own kit (BOSS_KIT) built from the old moves plus signature attacks, all telegraphed on
   the ground before they hurt:
     quake        expanding shockwave rings from the boss (dash through the ring)
     rockfall     5 marked circles around you, then rocks fall
     firepool     burning pools spat at you that linger for 4 s
     icelane      3 lanes from the boss toward you, then ice spikes along them
     spiral       a rotating spiral of projectiles
     triplecharge three quick charges, each with a short wind-up
     tidewave     a wave sweeping across the arena from one side, with a gap to stand in
     anvil        the Forge King's three hammer slams that follow you
   At half health a boss enters phase 2: a roar, a short shield, faster moves and its phase-2 move added.
   Hazards live in HAZ and are drawn on the ground (marker first, then the hit). */

const BOSS_KIT = {
  warden: [['slam', 'quake', 'walk', 'rockfall', 'ring'], 'rockfall'],
  wyrm: [['volley', 'firepool', 'circle', 'ring', 'summon:magma'], 'spiral'],
  snapper: [['triplecharge', 'tidewave', 'summon:crab', 'walk'], 'ring'],
  frostgiant: [['slam', 'icelane', 'volley', 'summon:icewolf'], 'icelane'],
  colossus: [['slam', 'rockfall', 'firepool', 'ring', 'summon:imp'], 'quake'],
  stonetyrant: [['quake', 'rockfall', 'slam', 'summon:stonetroll'], 'quake'],
  cinderdrake: [['firepool', 'volley', 'circle', 'summon:cinderimp'], 'spiral'],
  forgeking: [['anvil', 'firepool', 'ring', 'summon:magma'], 'quake'],
  glacierheart: [['spiral', 'icelane', 'ring', 'summon:iceslime'], 'icelane'],
  ashmother: [['firepool', 'circle', 'spiral', 'summon:cinderimp'], 'firepool'],
  tidecaller: [['tidewave', 'ring', 'slam', 'summon:tideslime'], 'spiral'],
};
for (const k in EN) { const E = EN[k]; if (!E.boss || !E.moves) continue;
  if (BOSS_KIT[k]) E.moves = BOSS_KIT[k][0].slice();
  else E.moves = E.moves.concat([E.elem === 'fire' ? 'firepool' : E.elem === 'ice' ? 'icelane' : E.undead ? 'spiral' : 'rockfall']); }
const KIT_DUR = { quake: 2.4, rockfall: 2.1, firepool: 1.8, icelane: 2.2, spiral: 2.6, triplecharge: 3.3, tidewave: 2.8, anvil: 3 };
const HAZ = [];
const hz = (o) => HAZ.push(Object.assign({ t: 0, hit: 0 }, o));
const pIn = (x, y, r) => Math.hypot(S.p.x - x, S.p.y - 4 - y) < r;
const bossPK = E => E.elem === 'fire' ? 'fire' : E.elem === 'ice' ? 'ice' : E.undead ? 'void' : 'rock';

const KIT = {
  quake(m, e, A, E) { for (const at of [.5, 1.2, 1.9]) if (A.t >= at && !(A.q = A.q || {})[at]) { A.q[at] = 1; hz({ k: 'ring', x: e.x, y: e.y - 4, r0: 6, r1: 150, T: .45, life: 1.1, dmg: e.atk * 1.1, elem: E.elem }); } },
  rockfall(m, e, A, E) { if (!A.did) { A.did = 1; for (let i = 0; i < 5; i++) { const a = Math.random() * 6.28, r = i ? 20 + Math.random() * 50 : 0; hz({ k: 'circle', x: S.p.x + Math.cos(a) * r, y: S.p.y - 4 + Math.sin(a) * r, r: 18, T: 1 + i * .12, life: .25, dmg: e.atk * 1.2, elem: E.elem, rock: 1 }); } } },
  firepool(m, e, A, E) { for (const at of [.3, .8, 1.3]) if (A.t >= at && !(A.q = A.q || {})[at]) { A.q[at] = 1; hz({ k: 'pool', x: S.p.x + (Math.random() - .5) * 16, y: S.p.y - 4 + (Math.random() - .5) * 12, r: 20, T: .7, life: 4, dmg: e.atk * .45, tick: .5, elem: 'fire' }); SFX.fire(); } },
  icelane(m, e, A, E) { if (!A.did) { A.did = 1; const a0 = Math.atan2(S.p.y - e.y, S.p.x - e.x); for (const da of [-.45, 0, .45]) hz({ k: 'lane', x: e.x, y: e.y - 4, a: a0 + da, len: 210, w: 14, T: 1, life: .35, dmg: e.atk * 1.15, elem: 'ice' }); } },
  spiral(m, e, A, E, dt) { if (A.t > .4) { A.vc = (A.vc || 0) + dt; if (A.vc > .09) { A.vc = 0; A.sa = (A.sa || 0) + .52; for (const k of [0, Math.PI]) proj(m, e.x, e.y - E.r, A.sa + k, 95, e.atk * .6, bossPK(E)); } } },
  triplecharge(m, e, A, E, dt) {
    const seg = Math.floor(A.t / 1.1), lt = A.t - seg * 1.1; if (seg > 2) return;
    if (lt < .45) { e.tele2 = 1; const d = Math.hypot(S.p.x - e.x, S.p.y - e.y) || 1; A.cx = (S.p.x - e.x) / d; A.cy = (S.p.y - e.y) / d; }
    else if (lt < .9) { e.tele2 = 0; moveEnt(m, e, A.cx * E.spd * 4.5 * dt, A.cy * E.spd * 4.5 * dt, 8); if (pIn(e.x, e.y - 4, E.r + 8) && !A['h' + seg]) { A['h' + seg] = 1; hurtPlayer(e.atk * 1.1, e.x + .1, e.y + .1, E.elem); } }
  },
  tidewave(m, e, A, E) { if (!A.did) { A.did = 1; const left = Math.random() < .5, gap = S.p.y - 4 + (Math.random() - .5) * 60; hz({ k: 'wave', x: S.p.x + (left ? -170 : 170), y: S.p.y - 4, dir: left ? 1 : -1, h: 170, gap, gw: 26, T: 1, life: 1.6, dmg: e.atk * 1.1, elem: 'ice' }); } },
  anvil(m, e, A, E) { for (const at of [.3, 1.2, 2.1]) if (A.t >= at && !(A.q = A.q || {})[at]) { A.q[at] = 1; hz({ k: 'circle', x: S.p.x, y: S.p.y - 4, r: 30, T: .75, life: .25, dmg: e.atk * 1.4, elem: 'fire', anvil: 1 }); } },
};

const _bossAIK = bossAI;
bossAI = function (m, e, dt, dx, dy, d) {
  const E = EN[e.k], A = e.ai;
  if (!e.phase2 && e.hp < e.mhp / 2) { // phase 2: a roar, a short shield, the phase move joins the rotation
    e.phase2 = 1; e.shield = 1.2; SHAKE = .5; SFX.boom(); toast(E.n + ' is enraged!', 'bad');
    const extra = (BOSS_KIT[e.k] || [])[1]; if (extra && !E.moves.includes(extra)) e.extraMoves = E.moves.concat([extra]);
    for (let i = 0; i < 24; i++) PARTS.push({ x: e.x, y: e.y - E.r, vx: (Math.random() - .5) * 200, vy: (Math.random() - .5) * 200, t: .7, c: E.col || '#ff6a3a' });
  }
  if (e.shield > 0) { e.shield -= dt; return; }
  const saved = E.moves; if (e.extraMoves) E.moves = e.extraMoves;
  try { _bossAIK(m, e, dt, dx, dy, d); } finally { E.moves = saved; }
  const mv = (A.move || '').split(':')[0], f = KIT[mv]; if (!f) return;
  if (A._sel !== A.i + ':' + A.move) { A._sel = A.i + ':' + A.move; A.dur = KIT_DUR[mv] * (e.phase2 ? .85 : 1); A.q = {}; A.did = 0; A.vc = 0; for (let s = 0; s < 3; s++) delete A['h' + s]; }
  f(m, e, A, E, dt);
};
// a shielded boss (the phase-2 roar) takes no damage
const _actionHitB = actionHit;
actionHit = function (e, mult, a, kb, opts) { if (e.shield > 0) { splat(e.x, e.y - EN[e.k].r * 2 - 4, 0, 'miss'); return 0; } return _actionHitB(e, mult, a, kb, opts); };

function updateHazards(dt) {
  for (const h of HAZ) {
    h.t += dt; const live = h.t >= h.T, end = h.T + h.life; if (h.t > end) { h.dead = 1; continue; }
    if (!live) continue;
    if (!h.boom) { h.boom = 1; if (h.rock || h.anvil) { SFX.boom(); SHAKE = Math.max(SHAKE, .2); for (let i = 0; i < 8; i++) PARTS.push({ x: h.x, y: h.y, vx: (Math.random() - .5) * 120, vy: -Math.random() * 90, t: .4, c: h.anvil ? '#ffb040' : '#a8a294' }); } }
    if (pl.roll > 0 || pl.inv > 0) continue;
    let inside = false; const px = S.p.x, py = S.p.y - 4;
    if (h.k === 'circle') inside = !h.hit && pIn(h.x, h.y, h.r);
    else if (h.k === 'pool') { h.tk = (h.tk || 0) - dt; inside = h.tk <= 0 && pIn(h.x, h.y, h.r); if (inside) h.tk = h.tick; }
    else if (h.k === 'ring') { const r = h.r0 + (h.r1 - h.r0) * Math.min(1, (h.t - h.T) / h.life), d = Math.hypot(px - h.x, py - h.y); inside = !h.hit && Math.abs(d - r) < 7; }
    else if (h.k === 'lane') { const cx = px - h.x, cy = py - h.y, along = cx * Math.cos(h.a) + cy * Math.sin(h.a), off = Math.abs(-cx * Math.sin(h.a) + cy * Math.cos(h.a)); inside = !h.hit && along > 0 && along < h.len && off < h.w / 2; }
    else if (h.k === 'wave') { const x = h.x + h.dir * 340 * Math.min(1, (h.t - h.T) / h.life); inside = !h.hit && Math.abs(px - x) < 10 && Math.abs(py - h.y) < h.h / 2 && Math.abs(py - h.gap) > h.gw / 2; }
    if (inside) { if (h.k !== 'pool') h.hit = 1; hurtPlayer(h.dmg, h.x + .3, h.y + .3, h.elem); LAST_FIGHT = gameT; }
  }
  for (let i = HAZ.length - 1; i >= 0; i--) if (HAZ[i].dead) HAZ.splice(i, 1);
}
function drawHazards() {
  for (const h of HAZ) {
    const live = h.t >= h.T, k = Math.min(1, h.t / h.T), col = h.elem === 'fire' ? [255, 110, 40] : h.elem === 'ice' ? [120, 210, 255] : [230, 70, 50];
    const rgba = a => `rgba(${col[0]},${col[1]},${col[2]},${a})`;
    g.save();
    if (h.k === 'circle' || h.k === 'pool') {
      g.fillStyle = rgba(live ? (h.k === 'pool' ? .45 + Math.sin(gameT * 8) * .1 : .7) : .12 + k * .25); g.beginPath(); g.ellipse(h.x, h.y, h.r, h.r * .7, 0, 0, 6.283); g.fill();
      if (!live) { g.strokeStyle = rgba(.9); g.lineWidth = 1; g.beginPath(); g.ellipse(h.x, h.y, h.r * k, h.r * .7 * k, 0, 0, 6.283); g.stroke(); }
      if (h.rock && !live) { const y = h.y - 90 * (1 - k); g.fillStyle = '#8a8478'; g.fillRect(h.x - 4, y - 4, 8, 7); g.fillStyle = '#b0aa9e'; g.fillRect(h.x - 4, y - 4, 8, 2); }
    } else if (h.k === 'ring') {
      if (!live) { g.strokeStyle = rgba(.3 + k * .4); g.lineWidth = 2; g.beginPath(); g.ellipse(h.x, h.y, 18 * k + 4, 13 * k + 3, 0, 0, 6.283); g.stroke(); }
      else { const r = h.r0 + (h.r1 - h.r0) * Math.min(1, (h.t - h.T) / h.life); g.strokeStyle = rgba(.85); g.lineWidth = 4; g.beginPath(); g.ellipse(h.x, h.y, r, r * .7, 0, 0, 6.283); g.stroke(); }
    } else if (h.k === 'lane') {
      g.translate(h.x, h.y); g.rotate(h.a); g.fillStyle = rgba(live ? .75 : .12 + k * .25); g.fillRect(0, -h.w / 2, h.len * (live ? 1 : k), h.w);
      if (live) { g.fillStyle = '#e8f6ff'; for (let s = 10; s < h.len; s += 14) { g.beginPath(); g.moveTo(s, h.w / 2); g.lineTo(s + 4, -h.w / 2 - 6); g.lineTo(s + 8, h.w / 2); g.fill(); } }
    } else if (h.k === 'wave') {
      const x = live ? h.x + h.dir * 340 * Math.min(1, (h.t - h.T) / h.life) : h.x;
      g.fillStyle = rgba(live ? .7 : .15 + k * .2);
      g.fillRect(x - (live ? 8 : 4), h.y - h.h / 2, live ? 16 : 8, h.gap - h.gw / 2 - (h.y - h.h / 2)); g.fillRect(x - (live ? 8 : 4), h.gap + h.gw / 2, live ? 16 : 8, h.y + h.h / 2 - h.gap - h.gw / 2);
      if (!live) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x - 2, h.gap - h.gw / 2, 4, h.gw); }
    }
    g.restore();
  }
}
const _updateBoss = update;
update = function (dt) { _updateBoss(dt); if (!PAUSED && !TITLE && cur) updateHazards(dt); };
EVT.on('map', () => { HAZ.length = 0; });
const _pcCursorDrawB2 = pcCursorDraw;
pcCursorDraw = function (m) { if (!TITLE && HAZ.length) drawHazards(); _pcCursorDrawB2(m); };
