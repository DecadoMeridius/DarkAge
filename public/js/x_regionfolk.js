/* Townsfolk in the region towns (round 3: Port Saltreach and the others had nobody about, and their market stall no vendor).
   Runtime only, like the Wilds' townsfolk: on entering a region map, a stallholder stands at the market stall by day and
   five people dressed for the place walk between spots in the town (two stay out at night, near the inn). They're hidden
   NPCS entries (`rf_<region>_<i>`), drawn and talked to like villagers (`k_rfolk`), never saved. */
const RF_DRESS = {
  highmarch: { roles: ['Shepherd', 'Herder', 'Stonecutter', 'Hunter', 'Weaver'], cloth: ['#5a6a3a', '#7a5a3a', '#4a5a6a', '#8a3a2a'], hat: '#6a5a3a' },
  frostmere: { roles: ['Trapper', 'Ice fisher', 'Woodsman', 'Furrier', 'Sledder'], cloth: ['#d8d0c0', '#6a4a3a', '#3a4a6a', '#8a8a8a'], hat: '#e8e0d0', hood: 1 },
  emberwaste: { roles: ['Ash miner', 'Smelter', 'Nomad', 'Glassblower', 'Scout'], cloth: ['#8a3a1a', '#3a2a2a', '#a86a3a', '#5a3a2a'], hat: '#3a2a1a' },
  saltreach: { roles: ['Sailor', 'Net mender', 'Dock hand', 'Salt boiler', 'Pearl diver'], cloth: ['#2a4a7a', '#e8e0d0', '#3a6a7a', '#8a5a3a'], hat: '#2a3a5a' },
};
const RF_LINES = {
  highmarch: ['The passes close early this year, mark me.', 'Cobalt pays well, if you don\'t mind the climb.', 'The raiders wear our colours now. Shameful.'],
  frostmere: ['Keep your fire high and your boots dry.', 'The glacier groans at night. You get used to it.', 'Rimesteel takes patience. And a great deal of coal.'],
  emberwaste: ['Drink before you\'re thirsty out here.', 'The cinder fields hum when the wind turns.', 'Charwood burns twice as long. Worth the trip.'],
  saltreach: ['Tide\'s turning. Always is.', 'Bring us lowland bread and we\'ll pay you in pearls. Nearly.', 'The shallows are full of sea grapes this season.'],
};
const RF_SKINS = ['#f0c8a0', '#e0b090', '#c89070', '#a87050', '#7a5038', '#f4d4b4'], RF_HAIRS = ['#2a1a10', '#5a3a22', '#8a5a2a', '#c89a50', '#d8d0c0', '#3a2a2a', '#a8402a'];
for (const rid in RF_DRESS) for (let i = 0; i < 6; i++) {
  const id = 'rf_' + rid + '_' + i, h = k => Math.abs(strSeed(id + k)), D = RF_DRESS[rid], fem = h('f') % 2;
  const P = { shoe: '#3a2a1a', skin: RF_SKINS[h('s') % RF_SKINS.length], hair: RF_HAIRS[h('h') % RF_HAIRS.length], hs: fem ? ['long', 'bun', 'pony'][h('y') % 3] : ['short', 'short', 'spiky', 'bald'][h('y') % 4],
    shirt: D.cloth[h('c') % D.cloth.length], pants: D.cloth[(h('p') + 1) % D.cloth.length] };
  if (!fem && h('b') % 3 === 0) P.beard = P.hair;
  if (h('a') % 3 === 0) P.hat = D.hat;
  if (D.hood && h('o') % 2 === 0) P.hood = D.hat;
  const vendor = i === 5; if (vendor) P.apron = '#e8dcc0';
  const role = vendor ? 'Stallholder' : D.roles[h('r') % D.roles.length];
  Object.defineProperty(NPCS, id, { value: { n: role, role, shop: 'k_rfolk', P, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
}
const RF = { m: null, list: [] };
function rfTown(m) {   // the town's rectangle, as genRegion lays it out (u_regions.js)
  const tx = Math.floor(m.w / 2), ty = m.h - 26;
  return { tx, ty, x0: tx - 15, x1: tx + 15, y0: ty - 1, y1: ty + 7 };
}
function rfSpot(m, T) {
  for (let n = 0; n < 30; n++) { const x = T.x0 + Math.floor(Math.random() * (T.x1 - T.x0)), y = T.y0 + Math.floor(Math.random() * (T.y1 - T.y0)); if (!solidAt(m, (x + .5) * 16, (y + .8) * 16) && !solidAt(m, (x + .5) * 16, (y + .3) * 16)) return [(x + .5) * 16, (y + .8) * 16]; }
  return null;
}
function rfSync() {
  const m = cur; if (!m || !m.region || !RF_DRESS[m.region]) { RF.m = null; return; }
  const day = S.time >= 420 && S.time < 1230, T = rfTown(m), want = [];
  for (let i = 0; i < 5; i++) if (day || i < 2) want.push(i);
  const stall = m.bld.find(b => b.act === 'r_trade'); if (day && stall) want.push(5);
  if (RF.m !== m) { RF.m = m; RF.list = []; }
  m.npcs = (m.npcs || []).filter(n => !n.rfolk || want.includes(n.i));
  for (const i of want) {
    if (m.npcs.some(n => n.rfolk && n.i === i)) continue;
    let p = null;
    if (i === 5) p = [(stall.x + stall.w / 2) * 16, (stall.y + stall.h + .8) * 16];
    else if (!day) { const inn = m.bld.find(b => b.act === 'r_inn'); if (inn) p = [(inn.door.x + (i ? 1.5 : -.5)) * 16, (inn.door.y + 1.8) * 16]; }
    p = p || rfSpot(m, T); if (!p) continue;
    m.npcs.push({ id: 'rf_' + m.region + '_' + i, i, rfolk: 1, x: p[0], y: p[1], hx: p[0], hy: p[1], dir: 0, walk: false, t: 1e9, vx: 0, wait: Math.random() * 4, stay: i === 5 || !day });
  }
}
function rfFrame(dt) {
  const m = cur; if (!m || !m.region || RF.m !== m) return;
  const T = rfTown(m);
  for (const n of m.npcs || []) {
    if (!n.rfolk || n.stay) continue;
    if (n.wait > 0) { n.wait -= dt; n.walk = false; continue; }
    if (!n.to) { n.to = rfSpot(m, T); if (!n.to) { n.wait = 2; continue; } }
    const dx = n.to[0] - n.x, dy = n.to[1] - n.y, d = Math.hypot(dx, dy);
    if (d < 2) { n.to = null; n.wait = 2 + Math.random() * 6; n.walk = false; continue; }
    const st = Math.min(d, 22 * dt), nx = n.x + dx / d * st, ny = n.y + dy / d * st;
    if (solidAt(m, nx, ny - 2)) { n.to = null; n.wait = 1; n.walk = false; continue; }
    n.x = nx; n.y = ny; n.hx = nx; n.hy = ny; n.walk = true; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  }
}
EVT.on('map', () => { RF.m = null; rfSync(); });
EVT.on('tick', n => { if (S && !TITLE && n % 10 === 0) rfSync(); });
update = (f => function (dt) { f(dt); if (S && !TITLE) rfFrame(dt); })(update);
doorAction = (f => function (act, who) {
  if (act !== 'k_rfolk') return f(act, who);
  const rid = cur && cur.region, n = who && NPCS[who];
  const line = n && n.role === 'Stallholder' ? 'The market\'s just behind me. We pay well for lowland food.' : pickR(RF_LINES[rid] || ['Fair travels.']);
  storyDialog([[who, line]], n && n.role === 'Stallholder' ? { title: n.n, last: 'Browse the market', done: () => doorAction('r_trade') } : { title: n ? n.n : 'Townsfolk' });
})(doorAction);
