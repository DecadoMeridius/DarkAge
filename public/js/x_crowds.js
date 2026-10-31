/* Crowds: people who make places feel lived in (art-and-feel playtest, 2026-10-31:
   "the village plaza is empty at noon", "the tavern has only Pip", "the inns have no patrons").
   - Village folk walk the village's streets and plaza by day.
   - Patrons sit at the tables and stand at the bar of the village tavern and every town inn.
   - Brann and Hale spend their evenings inside the tavern instead of standing at its wall.
   Runtime only: m.npcs entries flagged `crowd`, NPCS entries hidden from Friends, nothing saved. */

const CROWD_LOOK = id => { // a look made from the id, like the townsfolk in x_realm.js
  const h = k => Math.abs(strSeed(id + k)), fem = h('f') % 2;
  const P = { shoe: '#3a2a1a', skin: SKINS[h('s') % SKINS.length], hair: HAIRS[h('h') % HAIRS.length], hs: fem ? ['long', 'bun', 'pony'][h('y') % 3] : ['short', 'short', 'spiky', 'bald'][h('y') % 4],
    shirt: CLOTH[h('c') % CLOTH.length], pants: CLOTH[h('p') % CLOTH.length] };
  if (!fem && h('b') % 3 === 0) P.beard = P.hair;
  if (h('a') % 4 === 0) P.apron = '#e8dcc0';
  if (h('t') % 5 === 0) P.hat = ['#8a6a3a', '#5a3a22', '#3a4a2a'][h('u') % 3];
  return { P, fem };
};
const VILLAGE_FOLK = [['Old Bertram', 'Retired shepherd', 'bald'], ['Nell', 'Washerwoman'], ['Tam', 'Farmhand'], ['Rosie', 'Flower seller'], ['Gil', 'Tinker'], ['Maud', 'Grandmother', 'bun'], ['Corin', 'Traveller'], ['Ada', 'Weaver']];
const VILLAGE_LINES = [
  'Lovely day for it. Whatever "it" is, I\'m for it.', 'Mara\'s got fresh seed in. Says that every week. Is it ever stale?',
  'Pip waters the ale. Don\'t tell him I said. Don\'t tell him anything, actually.', 'Your grandmother used to walk this way every morning. Same pace as you.',
  'The fountain was dry for nine years. Then one spring it just ran again. Nobody asks why.', 'If you see a goat on the roof, it\'s Odile\'s. It\'s always Odile\'s.',
  'Brann works that forge from dawn till supper. Then he works the tavern.', 'Herald riders on the road this month. Something\'s stirring up at the old castle.'];
const PATRON_LINES = [
  'Another round! No, wait, that\'s my last coin. Half a round!', 'Best stew this side of the river. Only stew this side of the river.',
  'I heard the princess is alive. My cousin heard it from a knight. The knight heard it from a horse.', 'Sit down, friend. The fire\'s warm and the stories are mostly true.',
  'Don\'t play dice with the miller. Don\'t play anything with the miller.', 'Long day in the fields. Longer night in here, if I\'m lucky.',
  'They say the Wilds roads are safer with the knights riding. They say a lot of things.', 'Mind the bench, it wobbles. So do I, after the third.'];

const CROWD = [];
const crowdAdd = (id, n, role, extra) => {
  const L = CROWD_LOOK(id); if (extra && extra.hs) L.P.hs = extra.hs;
  Object.defineProperty(NPCS, id, { value: { n, role, shop: 'k_crowd', P: L.P, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
  CROWD.push(Object.assign({ id, n, role }, extra || {}));
};
VILLAGE_FOLK.forEach(([n, role, hs], i) => crowdAdd('vf_' + i, n, role, { map: 'village', walk: 1, from: 450 + i * 25, to: 1110 - (i % 3) * 30, hs, lines: VILLAGE_LINES }));
// patrons: a stool, a bench or the bar front, facing their table or the bar (same layout in the tavern and every inn)
const SEATS = [[5, 7, 2], [8, 7, 1], [9, 7, 2], [12, 7, 1], [3, 6, 3], [1, 8, 3], [4, 6, 3]];
const INN_ROOMS = () => ['tavern', ...Object.keys(typeof TOWN_ACTS !== 'undefined' ? TOWN_ACTS : {}).filter(a => actType(a) === 'inn')];
for (const room of INN_ROOMS()) SEATS.forEach(([x, y, dir], i) => {
  const busy = i < 2 ? [660, 840] : null; // the first two come for lunch as well as the evening
  const pid = 'pt_' + room + '_' + i, PN = ['Hob', 'Wyn', 'Ferris', 'Joss', 'Edda', 'Brom', 'Lise', 'Osk', 'Perrin', 'Tilda', 'Ulf', 'Merry', 'Dunstan', 'Greta'];
  crowdAdd(pid, PN[Math.abs(strSeed(pid)) % PN.length], 'Patron', { map: 'in_' + room, post: [x, y], dir, shifts: busy ? [busy, [1050 + i * 20, 1440]] : [[1050 + i * 25, 1440]], lines: PATRON_LINES });
});
const CROWD_BY = Object.fromEntries(CROWD.map(C => [C.id, C]));

// Brann and Hale drink in the tavern of an evening (they used to stand facing its wall: art round)
if (typeof SCHED !== 'undefined') { if (SCHED.brann) SCHED.brann[2] = [1080, 'tavern']; if (SCHED.hale) SCHED.hale[2] = [1020, 'tavern']; }
const REGULARS = [['brann', 10, 6, 0], ['hale', 6, 6, 0]];

function crowdOn(C) {
  const t = S.time;
  if (typeof festToday === 'function' && festToday() && C.map === 'village') return false; // the festival has its own crowd
  if (C.walk) return t >= C.from && t < C.to && S.weather !== 'storm';
  return C.shifts.some(([a, b]) => t >= a && t < b);
}
const CRST = {};
function crowdSync() {
  const m = cur; if (!m || !m.npcs && !m.id) return; m.npcs = m.npcs || [];
  const want = CROWD.filter(C => C.map === m.id && crowdOn(C));
  m.npcs = m.npcs.filter(n => !n.crowd || want.some(C => C.id === n.id));
  if (m.id === 'in_tavern') { // the regulars
    m.npcs = m.npcs.filter(n => !n.regular || schedPlace(n.id) === 'tavern');
    for (const [id, x, y, dir] of REGULARS) if (NPCS[id] && schedPlace(id) === 'tavern' && !m.npcs.some(n => n.id === id))
      m.npcs.push({ id, regular: 1, x: (x + .5) * 16, y: (y + .8) * 16, hx: (x + .5) * 16, hy: (y + .8) * 16, dir, walk: false, t: 1e9, vx: 0 });
  }
  for (const C of want) {
    if (m.npcs.some(n => n.id === C.id)) continue;
    const at = C.post || villageSpot(m); if (!at) continue;
    const x = (at[0] + .5) * 16, y = (at[1] + .8) * 16;
    m.npcs.push({ id: C.id, crowd: 1, x, y, hx: x, hy: y, dir: C.dir || 0, walk: false, t: 1e9, vx: 0 });
    CRST[C.id] = { wait: Math.random() * 6 };
  }
}
let VSPOTS = null;
function villageSpot(m) { // a street, path or plaza tile in the village, away from doors
  if (!VSPOTS || VSPOTS.m !== m) { VSPOTS = { m, l: [] }; for (let y = 3; y < m.h - 3; y++) for (let x = 3; x < m.w - 3; x++) { const t = getT(m, x, y); if ((t === 'p' || t === 'st' || t === 'd') && !getO(m, x, y) && !m.solidB[y * m.w + x]) VSPOTS.l.push([x, y]); } }
  for (let k = 0; k < 20; k++) { const s = VSPOTS.l[Math.floor(Math.random() * VSPOTS.l.length)]; if (s && !getO(m, s[0], s[1]) && !(m.npcs || []).some(n => Math.abs(n.x / 16 - s[0] - .5) < 1 && Math.abs(n.y / 16 - s[1] - .8) < 1)) return s; }
  return null;
}
function crowdFrame(dt) {
  const m = cur; if (!m || !m.npcs) return;
  for (const n of m.npcs) {
    if (!n.crowd) continue; const C = CROWD_BY[n.id], st = CRST[n.id] || (CRST[n.id] = { wait: 2 });
    if (n.waitT > 0) { n.waitT -= dt; n.walk = false; continue; }
    if (C.post) { n.dir = C.dir; n.walk = false; continue; }
    if (dist(n.x, n.y, S.p.x, S.p.y) < 26) { n.walk = false; continue; } // they let you pass and talk
    if (st.path) {
      const node = st.path[st.pi]; if (!node) { st.path = null; n.walk = false; st.wait = 4 + Math.random() * 10; if (Math.random() < .5) n.dir = Math.floor(Math.random() * 4); continue; }
      const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
      if (d < 2) { st.pi++; continue; }
      const sp = 19 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.hx = n.x; n.hy = n.y; n.walk = true;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); continue;
    }
    st.wait -= dt; if (st.wait > 0) continue;
    const to = villageSpot(m); if (!to) { st.wait = 3; continue; }
    const p = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), to[0], to[1], 3000); if (p && p.length < 40) { st.path = p; st.pi = 1; } else st.wait = 2;
  }
}
// village folk live alongside the villagers lifeTick keeps in v.npcs, so put them back after each of its passes
if (typeof lifeTick === 'function') lifeTick = (f => function () { const v = MAPS.village, keep = v && v.npcs ? v.npcs.filter(n => n.crowd) : []; f.apply(this, arguments); if (v && v.npcs) for (const n of keep) if (!v.npcs.includes(n)) v.npcs.push(n); })(lifeTick);
EVT.on('map', () => { if (S && !TITLE) crowdSync(); });
EVT.on('tick', k => { if (k % 4 === 0 && S && !TITLE) crowdSync(); });
update = (f => function (dt) { f(dt); if (S && !TITLE) crowdFrame(dt); })(update);

doorAction = (f => function (act, who) {
  if (act !== 'k_crowd') return f(act, who);
  const C = CROWD_BY[who]; if (!C) return; const st = CRST[who] || (CRST[who] = {});
  st.li = ((st.li === undefined ? Math.abs(strSeed(who)) : st.li) + 1) % C.lines.length;
  storyDialog([[who, C.lines[st.li]]], { title: C.role + (C.map === 'village' ? ' · Emberhollow' : '') });
})(doorAction);

/* torches by the keep door and inside the gate, so Briarholt glows at night (art round: "nothing lights up") */
genCastle = (f => function () {
  const m = f.apply(this, arguments);
  for (const [x, y] of [[33, 20], [40, 20], [GATE - 2, 42], [GATE + 3, 42]]) if (inb(m, x, y) && !getO(m, x, y) && !m.solidB[y * m.w + x] && !TER[getT(m, x, y)].solid) setO(m, x, y, { k: 'lantern', fixed: 1 });
  return m;
})(genCastle);
