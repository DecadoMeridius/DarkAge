/* Goblin tribes and the zombie (asked for 2026-10-31: "the goblin resembles a zombie: keep it as a zombie, and make a
   separate goblin enemy with real goblin/ogre sprites; they live in the wild in little shacks with small tribes,
   hostile as well").
   - zombie: the old green humanoid, now a slow shambler that comes out in the forest at night.
   - goblin (spear), goblin_slinger (throws rocks) and ogre: their own templates in art/sprites/goblins.py.
   - Camps: 6 per Wilds (forest, meadow, highlands), each a clearing with 1-3 shacks, a totem, a spit over a fire
     and a stash. A tribe (3-5 goblins, a slinger, sometimes an ogre) turns up when you come near and stays round
     its camp; a wiped-out tribe is back two days later.
   - They're ordinary monsters, so knights, guards and bandits all fight them too. */

EN.zombie = Object.assign({}, EN.goblin, { n: 'Zombie', ai: 'chase', spd: 24, hp: 70, atk: 11, xp: 15, shot: undefined,
  P: Object.assign({}, EN.goblin.P || {}, { skin: '#8a9a7a', hair: '#3a3a30', shirt: '#4a4440', pants: '#3a3430', eye: '#d8f090', vest: undefined, belt: undefined }),
  drops: [['bone', .5, 1, 2], ['$', .5, 3, 12]] });
EN.goblin = { n: 'Goblin', art: 'goblin', col: '#6a9a3a', eye: '#ffd040', hp: 48, atk: 9, def: 2, spd: 52, xp: 14, ai: 'chase', r: 6,
  drops: [['copper_ore', .3, 1, 2], ['$', .7, 4, 16], ['bone', .2, 1, 1], ['leather', .15, 1, 1]] };
EN.goblin_slinger = { n: 'Goblin Slinger', art: 'goblin', col: '#7a8a3a', eye: '#ffd040', hp: 38, atk: 8, def: 1, spd: 46, xp: 14, ai: 'ranged', shot: 'rock', r: 6,
  drops: [['stone', .5, 1, 3], ['$', .7, 4, 16]] };
EN.ogre = { n: 'Ogre', art: 'ogre', col: '#8a9a6a', eye: '#ff8a2a', hp: 300, atk: 14, def: 6, spd: 26, /* it took 240 HP in 5 s (round 3) */ xp: 80, ai: 'charge', r: 14,
  drops: [['hide', .8, 1, 3], ['fang', .5, 1, 2], ['gold_ore', .4, 1, 3], ['$', 1, 30, 80]] };
// the forest's day goblins move into the camps; zombies walk the forest at night
if (BIOME_EN.forest) { BIOME_EN.forest.day = BIOME_EN.forest.day.filter(([k]) => k !== 'goblin'); BIOME_EN.forest.night = BIOME_EN.forest.night.map(([k, w]) => [k === 'goblin' ? 'zombie' : k, w]); }

Object.assign(FURN, { gshack: { w: 2 }, gtotem: {}, gspit: { w: 2, light: 1 } });
for (const k of ['gshack', 'gtotem', 'gspit']) OBJ['furn_' + k] = { solid: 1, fixed: 1, tall: 1, w: FURN[k].w || 1, h: 1 };
if (typeof FLAMES !== 'undefined') FLAMES.furn_gspit = 'furn_gspit';

// camps are laid out when the Wilds are generated (part of the map's base, so saves only store changes)
const CAMP_BIO = () => new Set(['forest', 'meadow', 'highlands'].map(b => BIOMES.indexOf(b)));
function campOk(m, x, y) {
  const W = m.w; for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) { const X = x + i, Y = y + j; if (!inb(m, X, Y)) return false; const t = TER[getT(m, X, Y)]; if (t.solid || t.water || m.solidB[Y * W + X] || (m.roadT && m.roadT.has(Y * W + X))) return false; }
  if ((m.towns || []).some(T => x > T.x - 20 && x < T.x + T.w + 20 && y > T.y - 20 && y < T.y + T.h + 20)) return false;
  if ((m.gcamps || []).some(c => Math.hypot(c.x - x, c.y - y) < 45) || (m.poi || []).some(p => Math.hypot(p.x - x, p.y - y) < 14)) return false;
  return CAMP_BIO().has(m.bio[y * W + x]);
}
function buildCamp(m, x, y, n) {
  for (let j = -4; j <= 4; j++) for (let i = -5; i <= 5; i++) { const X = x + i, Y = y + j; if (getO(m, X, Y)) delObj(m, X, Y); if (Math.abs(i) + Math.abs(j) < 6) setT(m, X, Y, 'd'); }
  const spots = [[x - 4, y - 2], [x + 2, y - 3], [x - 1, y + 3]];
  for (let s = 0; s < n; s++) putObj(m, spots[s][0], spots[s][1], { k: 'furn_gshack', fixed: 1 });
  putObj(m, x, y, { k: 'furn_gspit', fixed: 1 }); putObj(m, x + 3, y + 1, { k: 'furn_gtotem', fixed: 1 });
  setO(m, x - 3, y + 2, { k: 'chest', tier: 2, gcamp: 1 });
}
// a cleared camp, left alone two days, is struck: its huts, spit, totem and chest go and the ground grows back
function strikeCamp(m, C) {
  for (let j = -5; j <= 5; j++) for (let i = -6; i <= 6; i++) {
    const X = C.x + i, Y = C.y + j; if (!inb(m, X, Y)) continue;
    const [mx, my, o] = typeof mainOf === 'function' ? mainOf(m, X, Y) : [X, Y, getO(m, X, Y)];
    if (o && (/^furn_g(shack|spit|totem)$/.test(o.k) || (o.k === 'chest' && o.gcamp))) delObj(m, mx, my);
    if (Math.abs(i) + Math.abs(j) < 6 && getT(m, X, Y) === 'd') setT(m, X, Y, typeof baseFor === 'function' ? baseFor(m, X, Y) : 'g');
  }
}
function placeCamps(m) {
  m.gcamps = [];
  for (let k = 0; k < 4000 && m.gcamps.length < 6; k++) {
    const x = 8 + Math.floor(R() * (m.w - 16)), y = 10 + Math.floor(R() * (m.h - 60));
    if (!campOk(m, x, y)) continue;
    const n = 1 + Math.floor(R() * 3); buildCamp(m, x, y, n);
    m.gcamps.push({ x, y, i: m.gcamps.length, size: n });
  }
  return m;
}
genWilds = (f => function () { return placeCamps(f.apply(this, arguments)); })(genWilds);

// tribes: they turn up as you come near a camp and keep round it
function campTick() {
  const m = cur; if (!m || m.id !== 'wilds' || !m.gcamps) return;
  S.gcamp = S.gcamp || {};
  for (const C of m.gcamps) {
    const st = S.gcamp[C.i] || (S.gcamp[C.i] = {});
    if (st.pos && (C.x !== st.pos[0] || C.y !== st.pos[1])) { C.x = st.pos[0]; C.y = st.pos[1]; C.size = st.pos[2]; }   // moved camps (the map itself comes back from the save's changes)
    let d = dist(S.p.x / 16, S.p.y / 16, C.x, C.y);
    // cleared two days ago and out of sight: the tribe moves on and sets up somewhere new (playtest: camps should come and go)
    if (st.cleared && !st.here && dayIndex() - st.cleared >= 2 && d > 60) {
      let spot = null;
      for (let k = 0; k < 600 && !spot; k++) { const x = 8 + Math.floor(Math.random() * (m.w - 16)), y = 10 + Math.floor(Math.random() * (m.h - 60)); if (dist(S.p.x / 16, S.p.y / 16, x, y) > 60 && campOk(m, x, y)) spot = [x, y]; }
      if (spot) { strikeCamp(m, C); const n = 1 + Math.floor(Math.random() * 3); buildCamp(m, spot[0], spot[1], n); C.x = spot[0]; C.y = spot[1]; C.size = n; st.pos = [C.x, C.y, n]; st.cleared = 0; st.seen = 0; if (typeof CHUNK !== 'undefined') CHUNK.clear(); d = dist(S.p.x / 16, S.p.y / 16, C.x, C.y); }
    }
    const live = m.ents.filter(e => e.camp === C.i && !e.dead);
    // the first four days the camps stand empty, so a new player's first trips into the Wilds aren't a tribe and an ogre
    if (d < 34 && !live.length && !st.here && dayIndex() >= 5 && (!st.cleared || dayIndex() - st.cleared >= 2)) {
      const kinds = ['goblin', 'goblin', 'goblin_slinger'], extra = Math.floor(Math.random() * (C.size + 1)); /* small tribes: 3-6 */
      for (let i = 0; i < extra; i++) kinds.push(Math.random() < .35 ? 'goblin_slinger' : 'goblin');
      if (C.size >= 2 || Math.random() < .35) kinds.push('ogre');
      kinds.forEach((k, i) => { const a = i / kinds.length * 6.283, t = openTileNear(m, Math.round(C.x + Math.cos(a) * 3), Math.round(C.y + Math.sin(a) * 2.5));
        if (!t) return; window.SPAWN_RAW = true; const e = spawnEnemy(m, k, (t[0] + .5) * 16, (t[1] + .8) * 16, 2 + C.size); window.SPAWN_RAW = false; e.camp = C.i; e.home = [e.x, e.y]; e.pack = e; });
      st.here = 1; if (!st.seen) { st.seen = 1; toast('Smoke and shrieking ahead: a goblin camp!', 'bad'); }
    }
    const now = m.ents.filter(e => e.camp === C.i && !e.dead);
    // the dead are already out of m.ents, so "all gone while you're near" means cleared (the old test never fired)
    if (st.here && !now.length && d < 30) { st.here = 0; st.cleared = dayIndex(); m.ents = m.ents.filter(e => e.camp !== C.i); toast('The goblin camp is cleared. They\'ll be back in a couple of days.', 'good'); }
    if (st.here && d > 70) { st.here = 0; m.ents = m.ents.filter(e => e.camp !== C.i); }   // gone home for now
  }
}
EVT.on('tick', k => { if (k % 2 === 0 && S && !TITLE) campTick(); });
// moved camps keep their new place after loading a save (the map marker reads m.gcamps)
const campPlaces = () => { const m = MAPS.wilds; if (!m || !m.gcamps || !S || !S.gcamp) return; for (const C of m.gcamps) { const st = S.gcamp[C.i]; if (st && st.pos) { C.x = st.pos[0]; C.y = st.pos[1]; C.size = st.pos[2]; } } };
EVT.on('map', id => { campPlaces(); if (id === 'wilds' && S && S.gcamp) for (const k in S.gcamp) S.gcamp[k].here = 0; });
// the tribe stays near camp: kept out of the 36-tile despawn while you're about, and they never wander off
wildSpawns = (f => function (m, dt) { const keep = m.ents.filter(e => e.camp !== undefined && !e.dead); const r = f.apply(this, arguments); for (const e of keep) if (!m.ents.includes(e)) m.ents.push(e); return r; })(wildSpawns);
