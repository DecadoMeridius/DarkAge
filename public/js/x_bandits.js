/* Bandit patrols (asked for 2026-10-31: "bandit patrols like our knights, but hostile to the other patrols,
   guards, monsters and you").
   - Groups of 3-5 roam the Wilds roads, away from the farm end, from day 3. A Bandit Chief leads the bigger ones.
   - They're ordinary enemies (`bandit`, `archer`, `banditchief`), so near you they fight with the normal
     combat AI, drop loot and count as your kills. When you're not close, they hunt knights and town guards
     in reach and brawl with any monster they meet; both sides strike back. Knights and guards already
     go for them, since they're monsters to the allies.
   - Runtime only (BANDIT_PATROLS); they show on the Wilds map as red marks. */

EN.banditchief = Object.assign({}, EN.bandit, { n: 'Bandit Chief', hp: 170, atk: 22, def: 4, xp: 60, P: Object.assign({}, EN.bandit.P || {}, { cape: '#6a1a1a', helm: '#5a5a62', helmS: 'iron', plume: '#d8342a' }),
  drops: [['gold_ore', .5, 1, 3], ['leather', .6, 1, 2], ['ruby', .08, 1, 1]].concat(EN.bandit.drops || []) });
let BANDIT_PATROLS = [], BANDIT_T = 30;
const isBandit = e => e && e.bandit;
function spawnBandits(m) {
  if (!m.roads || !m.roads.length) return;
  const px = S.p.x / 16, py = S.p.y / 16, homeEnd = y => y > m.h - 45;   // not on the roads that come up from the farm and village
  const cand = [];
  for (const r of m.roads) for (const k of [0, 1]) { const a = r[k], b = r[1 - k], d = dist(px, py, a[0], a[1]); if (d > 26 && d < 60 && !homeEnd(a[1]) && !homeEnd(b[1])) cand.push([a, b]); }
  if (!cand.length) return;
  const [a, b] = cand[Math.floor(Math.random() * cand.length)];
  const path = findPath(m, Math.round(a[0]), Math.round(a[1]), Math.round(b[0]), Math.round(b[1]), 60000); if (!path || path.length < 25) return;
  const n = 3 + Math.floor(Math.random() * 3), P = { path, pi: 1, members: [], age: 0 };
  for (let i = 0; i < n; i++) {
    const k = i === 0 && n >= 4 ? 'banditchief' : i % 3 === 2 ? 'archer' : 'bandit';
    window.SPAWN_RAW = true; const e = spawnEnemy(m, k, (a[0] + .5) * 16 + (i % 2) * 14 - 7, (a[1] + .8) * 16 + Math.floor(i / 2) * 14, 3); window.SPAWN_RAW = false;
    e.bandit = P; e.slot = i; P.members.push(e);
  }
  BANDIT_PATROLS.push(P);
}
function bMove(m, e, tx, ty, sp, dt) {
  const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy); if (d < 2) return true;
  const s = Math.min(sp * dt, d); moveEnt(m, e, dx / d * s, dy / d * s, 4); e.dir = dx < 0 ? -1 : 1; e.hx = e.x; e.hy = e.y; e.home = [e.x, e.y]; return false;
}
function bHitAlly(e, al) {
  const dmg = Math.max(1, Math.round(e.atk * (.6 + Math.random() * .4))); al.hp -= dmg; floatText(al.x, al.y - 34, '-' + dmg, '#ff8a6a'); e.lunge = .25;
  if (al.hp <= 0 && !al.down) { al.down = 45; al.tgt = null; toast((ALLY_KINDS[al.id] || {}).n + ' is driven off by bandits.', 'bad'); }
}
function bHitMonster(m, e, t) {
  const E = EN[t.k] || {}, dmg = Math.max(1, Math.round(e.atk * (.6 + Math.random() * .4) - (E.def || 0) * .5)); t.hp -= dmg; t.flash = .12; e.lunge = .25;
  floatText(t.x, t.y - (E.r || 6) * 2 - 6, dmg, '#ffb08a');
  if (t.hp <= 0 && !t.dead) { t.dead = true; if (typeof CORPSES !== 'undefined') CORPSES.push({ m: m.id, spr: enemySpr(t.k, 0), x: t.x, y: t.y, flip: t.dir < 0, t: 0, T: .6 }); }
}
function banditsFrame(dt) {
  const m = cur; if (!m || m.id !== 'wilds' || !m.towns) return;
  const day = (S.year - 1) * 112 + S.season * 28 + S.day;
  BANDIT_T -= dt;
  BANDIT_PATROLS = BANDIT_PATROLS.filter(P => P.members.some(e => !e.dead && m.ents.includes(e)));
  if (BANDIT_T <= 0) { BANDIT_T = 40; if (day >= 3 && BANDIT_PATROLS.length < 2) spawnBandits(m); }
  const monsters = m.ents.filter(e => e.type === 'enemy' && !e.dead && !e.bandit && !(EN[e.k] && EN[e.k].boss));
  for (const P of BANDIT_PATROLS) {
    P.age += dt; const live = P.members.filter(e => !e.dead && m.ents.includes(e));
    if (P.age > 420) { for (const e of live) if (dist(e.x, e.y, S.p.x, S.p.y) > 300) e.dead = true; continue; }   // a patrol moves on after 7 minutes
    if (!P.warned && live.some(e => dist(e.x, e.y, S.p.x, S.p.y) < 260)) { P.warned = 1; toast('Bandits on the road! Rough men with blades, and they don\'t like anyone.', 'bad'); }
    for (const e of live) {
      e.hx = e.x; e.hy = e.y; e.home = [e.x, e.y]; e.leash = 0; e.cdB = (e.cdB || 0) - dt;   // their home walks with them, so the leash never drags them back
      if (dist(e.x, e.y, S.p.x, S.p.y) < 130) continue;            // you're close: the normal enemy AI fights you
      // a target: a knight or guard, else a monster
      const al = ALLIES.filter(a => !a.down && !a.gone && dist(a.x, a.y, e.x, e.y) < 160).sort((p, q) => dist(p.x, p.y, e.x, e.y) - dist(q.x, q.y, e.x, e.y))[0];
      const mo = !al && monsters.filter(t => dist(t.x, t.y, e.x, e.y) < 140).sort((p, q) => dist(p.x, p.y, e.x, e.y) - dist(q.x, q.y, e.x, e.y))[0];
      const T = al || mo;
      if (T) {
        if (dist(T.x, T.y, e.x, e.y) > 16) { bMove(m, e, T.x, T.y, 44, dt); e.stun = Math.max(e.stun || 0, dt * 1.01); }   // the normal AI sits this frame out
        else { e.stun = Math.max(e.stun || 0, dt * 1.01); if (e.cdB <= 0) { e.cdB = 1.2; if (al) bHitAlly(e, al); else bHitMonster(m, e, mo); } }
        continue;
      }
      // on the road: the leader walks the path, the rest keep formation
      e.stun = Math.max(e.stun || 0, dt * 1.01);
      const lead = live[0];
      if (e === lead) { let node = P.path[P.pi]; if (!node) { // the end of this road: on along another one
          const tx = Math.floor(e.x / 16), ty = Math.floor(e.y / 16), ends = m.roads.flat().filter(p => { const d = dist(tx, ty, p[0], p[1]); return d > 30 && d < 120 && p[1] < m.h - 45; });
          const to = ends[Math.floor(Math.random() * ends.length)], p2 = to && findPath(m, tx, ty, Math.round(to[0]), Math.round(to[1]), 40000);
          if (!p2) { P.age = 1e9; continue; } P.path = p2; P.pi = 1; node = p2[1]; if (!node) continue; } if (bMove(m, e, (node[0] + .5) * 16, (node[1] + .8) * 16, 28, dt)) P.pi++; }
      else { const off = [[0, 0], [-14, 10], [14, 10], [0, 20], [-14, 24]][live.indexOf(e) % 5]; if (dist(e.x, e.y, lead.x, lead.y) > 300) { e.x = lead.x + off[0]; e.y = lead.y + off[1]; } else bMove(m, e, lead.x + off[0], lead.y + off[1], 32, dt); }
    }
    // monsters strike back at bandits beside them
    for (const t of monsters) { const b = live.find(e => dist(e.x, e.y, t.x, t.y) < 18); if (!b || dist(t.x, t.y, S.p.x, S.p.y) < 130) continue; t.cdB = (t.cdB || 0) - dt;
      if (t.cdB <= 0) { t.cdB = 1.4; const dmg = Math.max(1, Math.round((t.atk || 5) * .6)); b.hp -= dmg; floatText(b.x, b.y - 30, dmg, '#ffb08a'); if (b.hp <= 0 && !b.dead) { b.dead = true; if (typeof CORPSES !== 'undefined') CORPSES.push({ m: m.id, spr: enemySpr(b.k, 0), x: b.x, y: b.y, flip: b.dir < 0, t: 0, T: .6 }); } } }
  }
}
update = (f => function (dt) { f(dt); if (S && !TITLE && !PAUSED) banditsFrame(dt); })(update);
EVT.on('map', () => { BANDIT_PATROLS = []; BANDIT_T = 30; });

/* packs: the weaker wild monsters (slimes and other jellies, wolves, crows, bats) come in packs of 2-5 (asked
   for 2026-10-31). A wild spawn of one of them brings 1-4 more of its kind round it. */
const PACKS = new Set(['slime', 'blueslime', 'seaslime', 'iceslime', 'wolf', 'icewolf', 'rimewolf', 'crow', 'bat', 'frostbat', 'jelly', 'goblin']);
let WILD_SPAWN = false;
wildSpawns = (f => function (m, dt) { WILD_SPAWN = true; try { return f.apply(this, arguments); } finally { WILD_SPAWN = false; } })(wildSpawns);
spawnEnemy = (f => function (m, k, x, y, lvl) {
  const e = f.apply(this, arguments);
  if (WILD_SPAWN && e && !e.dead && PACKS.has(e.k) && !e.pack) {
    WILD_SPAWN = false; const n = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, r = 14 + Math.random() * 26; const t = typeof openTileNear === 'function' ? openTileNear(m, Math.floor((e.x + Math.cos(a) * r) / 16), Math.floor((e.y + Math.sin(a) * r) / 16)) : null;
      const q = t ? f(m, e.k, (t[0] + .5) * 16, (t[1] + .8) * 16, lvl) : null; if (q) q.pack = e; }
    e.pack = e; WILD_SPAWN = true;
  }
  return e;
})(spawnEnemy);
