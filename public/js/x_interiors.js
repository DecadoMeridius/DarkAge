/* Insides for every building (asked 2026-11-07: "insides for all buildings, also those in other regions and the wild").
   Before, town and region houses, the village cottages and the frozen cabin only "knocked", the region inns and forges and
   Lord Ashcombe's manor opened a window from the door, and the tent was a menu. Now each door walks you in.
   - Rooms are laid out on entry by a builder per door action (`IN_GEN`), styled for the town or region the building stands
     in (`IN_STYLE`: walls, floor, the trade's furniture, residents' names and lines), and their exit leads back to the very
     door you used (`genInterior` wrapper), so the 24 town houses can share one act. A room in a region keeps the region
     (`m.region`), so the inn and forge menus inside work as they did from the door (`m.inRegion`, lent as `cur.region` only while a menu opens).
   - Homes (k_house, r_house, the village cottages) have one of three layouts, picked from the building's place, and one or
     two residents (runtime `homefolk` NPCs, hidden from Friends) who talk (`k_home`). Their doors are barred 22:00-6:00.
   - Region inns and forges have a keeper behind the counter; the manor has Lord Ashcombe at his desk (Deeds); the frozen
     cabin is abandoned, with a journal to read; the farm tent holds your bedroll (Rest).
   Market stalls, mine and dungeon mouths, the greenhouse and the keep keep their own ways in. */
const IN_STYLE = {
  village: { wall: 'plaster', floor: 'f', big: ['bookshelf', 'table_cloth'], small: ['barrel', 'crate', 'plant'], names: ['Agnes', 'Wat', 'Bess', 'Rolf', 'Tilda', 'Hob'],
    lines: ['Mind the cat, she bites.', 'The fountain was dry for nine years, you know. Then one spring it ran again.', 'Mara gives credit, Brann doesn\'t. That\'s all you need to know about this village.', 'We heard you\'ve taken the old farm. Good. It was sad to see it empty.'] },
  kingsbridge: { wall: 'plaster', floor: 'f', big: ['bookshelf', 'table_cloth', 'shelf_store'], small: ['plant', 'lamp', 'barrel'], names: ['Aldric', 'Rosamund', 'Edwin', 'Cecily', 'Hugh', 'Isabeau'],
    lines: ['Wipe your boots. These rugs came from the Saltreach.', 'My husband sits on the council. He says nothing is decided. That means something is.', 'The regent hasn\'t slept in the palace since the king died. Everyone says so.', 'You\'re the farmer from the vale? You look less muddy than I imagined.'] },
  greyhelm: { wall: 'stone', floor: 'fl', big: ['workbench', 'weapons'], small: ['coal', 'crate', 'barrel'], names: ['Dagna', 'Thrain', 'Brokk', 'Hild', 'Orvar', 'Sigga'],
    lines: ['Shift starts at the bell. Ends when the seam says so.', 'Don\'t touch the lamp. It\'s my grandfather\'s, and it still works.', 'Stew\'s on. There\'s always stew on.', 'Iron in the walls, iron in the blood. That\'s Greyhelm.'] },
  ashford: { wall: 'plank', floor: 'f', big: ['lumber', 'workbench'], small: ['crate', 'barrel', 'sack'], names: ['Ewan', 'Maud', 'Coll', 'Nessa', 'Bran', 'Elspeth'],
    lines: ['Sawdust in everything. You get used to it.', 'The hunters say the wolves are bolder this year.', 'Sit, sit. The kettle won\'t be long.', 'My boy wants to join the Lodge. I want him to be a carpenter. We\'ll see who wins.'] },
  saltmere: { wall: 'plank', floor: 'f', big: ['nets', 'kegs'], small: ['tub', 'barrel', 'crate'], names: ['Morwen', 'Jory', 'Tamsin', 'Pasco', 'Wenna', 'Kitto'],
    lines: ['Tide\'s turning. Can you smell it?', 'Don\'t mind the nets. They dry best indoors in this weather.', 'My father sailed for the isles and came back with a pearl and a cough.', 'There\'s always a gull on the roof. Always the same gull, I swear.'] },
  highmarch: { wall: 'stone', floor: 'f', big: ['weapons', 'bookshelf'], small: ['barrel', 'crate', 'sack'], names: ['Halla', 'Ketil', 'Ragna', 'Ulf', 'Sigrun', 'Eyvind'],
    lines: ['Close the door, the wind comes straight off the peaks.', 'Raiders took my brother\'s goats last spring. We took them back.', 'The pine smoke keeps the cold out. Mostly.', 'Lowlanders always look surprised that we have chairs.'] },
  frostmere: { wall: 'plank', floor: 'f', big: ['lumber', 'shelf_store'], small: ['barrel', 'sack', 'crate'], names: ['Ylva', 'Aki', 'Saga', 'Torbjorn', 'Inga', 'Eskil'],
    lines: ['Furs on the bed, furs on the floor, and still my feet are cold.', 'The glacier groans at night. You learn to sleep through it.', 'Have some broth. Everyone who comes in from the ice gets broth.', 'The ice fish only bite when you can\'t feel your fingers.'] },
  emberwaste: { wall: 'hide', floor: 's', big: ['kegs', 'weapons'], small: ['sack', 'barrel', 'tub'], names: ['Zahra', 'Kadir', 'Ashka', 'Ruun', 'Tefi', 'Morra'],
    lines: ['Water first. Then talk.', 'The ash storms come without warning. The tent comes down in the time it takes to say so.', 'We move camp when the cinder fields shift.', 'The forge never goes out here. The ground keeps it warm for us.'] },
  saltreach: { wall: 'plaster', floor: 'f', big: ['nets', 'shelf_store'], small: ['tub', 'plant', 'barrel'], names: ['Marisol', 'Teo', 'Ilaria', 'Nico', 'Paloma', 'Rafe'],
    lines: ['Whitewash every spring, or the salt eats the walls.', 'The ferry brings news once a week, and gossip every day.', 'Try the paella at the inn. Then try mine. Mine is better.', 'On a clear night you can see the lights of the isles.'] },
};
WALLPAL.hide = { face: ['#7a5a3a', '#a07a50', '#c09a68', '#d8b888'], trim: ['#3a2416', '#5a3a22', '#7a5434', '#9a7048'] };
const inHash = (b, k = 1) => Math.abs(hsh((b ? b.x : 0) + 31 * k, (b ? b.y : 0) - 17 * k, 9));
function inStyleKey(src, b) {
  if (src && src.region && IN_STYLE[src.region]) return src.region;
  const T = typeof townAt === 'function' && b ? townAt(src, b.door.x, b.door.y, 6) : null;
  return T && IN_STYLE[T.id] ? T.id : 'village';
}
function inLook(seed) {
  const r = i => Math.abs(hsh(seed, i, 13)), pick = (a, i) => a[Math.floor(r(i) * a.length) % a.length];
  return HP(0, { skin: pick(['#f0c8a0', '#e0b088', '#c89070', '#a8704a', '#7a4a32', '#f4dcc8'], 1), hair: pick(['#3a2a1a', '#7a4426', '#c8a050', '#1a1210', '#a8a8a8', '#c0562a'], 2),
    hs: pick(['short', 'long', 'bun', 'pony', 'spiky', 'bald'], 3), shirt: pick(['#6a8a5a', '#8a5a4a', '#5a6a8a', '#a8844a', '#7a5a7a', '#c8b898'], 4), pants: pick(['#4a3a2a', '#3a3a4a', '#5a4a3a'], 5),
    apron: r(6) < .3 ? '#e8dcc0' : undefined });
}
// furniture layouts for homes: [kind, x, y]; 'BIG' and 'SMALL' are the style's trade pieces
const HOME_PLANS = [
  { w: 12, h: 9, f: [['bed', 1, 4], ['dresser', 3, 3], ['fireplace', 5, 3], ['BIG', 8, 3], ['lamp', 10, 3], ['table', 5, 5], ['stool', 4, 5], ['stool', 7, 5], ['SMALL', 10, 6], ['SMALL', 10, 7], ['plant', 1, 7]],
    d: [['dec_window', 3, 1, 0, 6], ['dec_window', 8, 1, 0, 6], ['dec_rug_red', 4, 6, 0, 8]], folk: [[2, 6], [9, 5]] },
  { w: 11, h: 8, f: [['bed', 1, 4], ['bed', 8, 4], ['stove', 3, 3], ['BIG', 5, 3], ['table', 6, 5], ['stool', 5, 5], ['SMALL', 1, 6], ['SMALL', 9, 6], ['lamp', 7, 3]],
    d: [['dec_window', 3, 1, 0, 6], ['dec_painting', 6, 1, 0, 10], ['dec_rug_small', 6, 6, 0, 8]], folk: [[3, 5], [8, 6]] },
  { w: 12, h: 10, f: [['bed', 9, 4], ['fireplace', 1, 3], ['BIG', 3, 3], ['bookshelf', 6, 3], ['lamp', 8, 3], ['table', 2, 6], ['stool', 1, 6], ['stool', 4, 6], ['SMALL', 10, 7], ['SMALL', 10, 8], ['plant', 1, 8]],
    d: [['dec_window', 4, 1, 0, 6], ['dec_window', 9, 1, 0, 6], ['dec_rug_green', 5, 6, 0, 8]], folk: [[3, 7], [8, 6]] },
];
const BLD_NAME = { k_house: 'house', r_house: 'house', cottage: 'cottage' };
function homeRoom(src, b) {
  const sk = inStyleKey(src, b), St = IN_STYLE[sk], P = HOME_PLANS[Math.floor(inHash(b) * HOME_PLANS.length) % HOME_PLANS.length];
  const tent = /tent/.test(b && b.kind || ''), pickS = (a, i) => a[Math.floor(inHash(b, i) * a.length) % a.length];
  const f = P.f.map(([k, x, y], i) => [k === 'BIG' ? pickS(St.big, i) : k === 'SMALL' ? pickS(St.small, i) : (tent && k === 'fireplace' ? 'stove' : k), x, y]);
  const d = tent ? P.d.filter(e => !/window|painting/.test(e[0])) : P.d;
  const n = 1 + (inHash(b, 7) < .55 ? 1 : 0), folk = [];
  for (let i = 0; i < n; i++) { const nm = pickS(St.names, 11 + i * 5), id = 'hf_' + (b ? b.x + '_' + b.y : 'x') + '_' + i; folk.push({ id, n: nm, at: P.folk[i], P: inLook(strSeed(id)), lines: St.lines, style: sk }); }
  const owner = folk[0].n.replace(/s$/, 's\'').replace(/([^'])$/, '$1\'s');
  return { name: owner + ' ' + (tent ? 'tent' : BLD_NAME[b && b.act] || 'house'), w: P.w, h: P.h, floor: St.floor, wall: St.wall, dark: .3, f, d, folk };
}
// region inns and forges: the town room layouts with the region's walls and a keeper
const R_KEEP = {};
function regionKeeper(rid, kind) {
  const id = 'rk_' + rid + '_' + kind; if (R_KEEP[id]) return id;
  const St = IN_STYLE[rid] || IN_STYLE.village, nm = St.names[kind === 'inn' ? 0 : 3];
  Object.defineProperty(NPCS, id, { value: { n: nm, role: kind === 'inn' ? 'Innkeeper' : 'Smith', shop: kind === 'inn' ? 'r_inn' : 'r_smith', P: inLook(strSeed(id)), love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
  return R_KEEP[id] = id;
}
function regionRoom(src, b, kind) {
  const rid = src.region, St = IN_STYLE[rid] || IN_STYLE.village, Rg = REGIONS[rid], k = regionKeeper(rid, kind);
  if (kind === 'inn') return { name: (Rg ? Rg.town.n : 'The') + ' inn', w: 14, h: 10, floor: St.floor, wall: St.wall, dark: .3, keeper: [k, 3, 4],
    f: [['shelf_tavern', 1, 3], ['shelf_tavern', 3, 3], ['kegs', 5, 3], ['bar', 2, 5, 'r_inn', 'Order'], ['fireplace', 10, 3], ['table', 6, 7], ['stool', 5, 7], ['stool', 8, 7], ['table', 10, 7], ['stool', 9, 7], ['stool', 12, 7], ['bench', 1, 8], ['lamp', 8, 3], ['lamp', 12, 4]],
    d: [['dec_rug_red', 9, 6, 0, 8], ['dec_window', 12, 1, 0, 6], ['dec_painting', 9, 1, 16, 10]] };
  return { name: (Rg ? Rg.town.n : 'The') + ' forge', w: 12, h: 9, floor: 'fl', wall: St.wall === 'plaster' ? 'stone' : St.wall, dark: .4, keeper: [k, 7, 5],
    f: [['coal', 3, 3], ['coal', 4, 3], ['forge', 5, 3, 'r_smith', 'Forge'], ['weapons', 8, 3], ['lamp', 1, 3], ['anvil', 6, 5, 'r_smith', 'Forge'], ['tub', 8, 6], ['barrel', 10, 6], ['crate', 10, 7], ['workbench', 1, 6], ['stool', 3, 6]],
    d: [['dec_banner_red', 2, 1, 4, 2], ['dec_banner_red', 10, 1, 4, 2]] };
}
Object.defineProperty(NPCS, 'ashcombe', { value: { n: 'Lord Ashcombe', role: 'Landowner', shop: 'landowner', P: HP(0, { skin: '#e8c0a0', hair: '#a8a8a8', hs: 'short', shirt: '#2a3a5a', pants: '#2a2a2a', beard: '#a8a8a8', cape: '#5a1a2a' }), love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
const IN_GEN = {
  k_house: homeRoom, r_house: homeRoom, cottage: homeRoom,
  r_inn: (src, b) => regionRoom(src, b, 'inn'), r_smith: (src, b) => regionRoom(src, b, 'smith'),
  landowner: () => ({ name: 'Ashcombe Manor', w: 14, h: 10, floor: 'mb', wall: 'plaster', dark: .25, keeper: ['ashcombe', 7, 4],
    f: [['counter', 6, 5, 'landowner', 'Deeds'], ['bookshelf', 1, 3], ['bookshelf', 3, 3], ['fireplace', 10, 3], ['lamp', 9, 3], ['plant', 12, 3], ['table_cloth', 2, 7], ['stool', 1, 7], ['stool', 4, 7], ['plant', 12, 8], ['dresser', 10, 7]],
    d: [['dec_rug_purple', 5, 6, 16, 8], ['dec_painting', 6, 1, 0, 10], ['dec_banner_red', 5, 1, 4, 2], ['dec_banner_red', 8, 1, 4, 2], ['dec_window', 2, 1, 0, 6], ['dec_window', 11, 1, 0, 6]] }),
  cabin: () => ({ name: 'Frozen cabin', w: 10, h: 8, floor: 'f', wall: 'plank', dark: .5,
    f: [['bed', 1, 4], ['fireplace', 4, 3], ['bookshelf', 7, 3, 'cabin_note', 'Read'], ['table', 4, 5], ['stool', 3, 5], ['crate', 8, 6], ['barrel', 1, 6]], d: [['dec_window', 3, 1, 0, 6]] }),
  tent: () => ({ name: 'Your tent', w: 8, h: 6, floor: 'd', wall: 'hide', dark: .35, f: [['bed', 1, 4, 'tent', 'Rest'], ['crate', 6, 3], ['lamp', 5, 3], ['sack', 6, 4]], d: [] }),
};
const nearestB = (m, act) => { let best = null, bd = 1e9; for (const b of (m && m.bld) || []) if (b.act === act) { const d = Math.hypot(b.door.x * 16 - S.p.x, b.door.y * 16 - S.p.y); if (d < bd) { bd = d; best = b; } } return best; };
genInterior = (f => function (act) {
  const G = IN_GEN[act]; if (!G) return f(act);
  const src = cur, b = nearestB(src, act), R = G(src, b); ROOMS[act] = R;
  const m = f(act);
  if (b) Object.assign(m.warps[0], { to: src.id, tx: (b.door.x + .5) * 16, ty: (b.door.y + 1.7) * 16 });
  if (src && src.region) m.inRegion = src.region;   // not m.region: region systems (townsfolk, fishing, banners, the map) would run in the room
  m.npcs = m.npcs || [];
  for (const F of R.folk || []) {
    if (!F.at) continue;
    Object.defineProperty(NPCS, F.id, { value: { n: F.n, role: 'Resident', shop: 'k_home', P: F.P, love: [], like: [], hate: [], lines: [[]], gifts: [], home: F }, enumerable: false, writable: true, configurable: true });
    m.npcs.push({ id: F.id, homefolk: 1, x: (F.at[0] + .5) * 16, y: (F.at[1] + .5) * 16, hx: (F.at[0] + .5) * 16, hy: (F.at[1] + .5) * 16, dir: 0, walk: false, t: 1e9, vx: 0, vy: 0 });
  }
  return m;
})(genInterior);
for (const act in IN_GEN) { if (!ROOMS[act]) ROOMS[act] = { name: '', w: 8, h: 6, floor: 'f', wall: 'plaster', f: [] }; DOORL[act] = act === 'tent' ? 'Enter' : act === 'landowner' ? (DOORL[act] || 'Enter') : 'Enter'; }
const CABIN_NOTE = ['A journal, its last pages stiff with frost.', '"Third week. The flame in the crown came to me again in the snow. Wren says the old seal is breaking, that the shards remember."',
  '"The pilgrims passed the ridge today. I did not go with them. Someone must watch the ice."', 'The rest is blank.'];
doorAction = (f => function (act, who) {
  if (IN_GEN[act] && !who && !(cur && cur.id === 'in_' + act)) {
    if ((act === 'k_house' || act === 'r_house' || act === 'cottage') && (S.time >= 1320 || S.time < 360)) { toast('The door is barred for the night. Everyone inside is asleep.'); return; }
    const H = typeof HOURS !== 'undefined' && HOURS[act]; if (H && (S.time < H[0] || S.time >= H[1])) return f(act, who);   // shut: the usual "opens at" notice
    return goMap('in_' + act);
  }
  if (act === 'k_home') { const N = NPCS[who], F = N && N.home; if (!F) return; F.li = ((F.li === undefined ? Math.floor(Math.abs(strSeed(who)) % F.lines.length) : F.li) + 1) % F.lines.length; storyDialog([[who, F.lines[F.li]]], { title: N.n + ' · at home' }); return; }
  if (act === 'cabin_note') { storyDialog(CABIN_NOTE.map(t => ['narr', t]), { title: 'Frozen cabin' }); return; }
  // the region's inn and forge menus read cur.region: lend it to them while they open
  if (cur && cur.inRegion && /^r_/.test(act)) { const was = cur.region; cur.region = cur.inRegion; try { return f(act, who); } finally { cur.region = was; } }
  return f(act, who);
})(doorAction);
