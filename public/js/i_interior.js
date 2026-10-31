/* ================= Building exteriors + interiors =================
   Exteriors: atlas sprites bld_<kind>_<w>x<h> replace the painted buildingSpr.
   Interiors: every shop, the farmhouse and the farm animal buildings have a room
   (map id 'in_<act>'). The door walks you inside; the counter, bed or trough inside
   opens the menu the door used to open. Rooms are rebuilt on entry, never saved. */

const _buildingSpr = buildingSpr;
buildingSpr = function (w, h, kind) {
  const lv = typeof S !== 'undefined' && S && S.build && ['coop', 'barn', 'stable'].includes(kind) ? S.build[kind] || 1 : 1; // upgraded farm buildings look better
  let name = `bld_${kind}_${w}x${h}`; if (lv > 1 && PIX.map[name + '_l' + lv]) name += '_l' + lv;
  const c = PIX.get(name); if (!c) return _buildingSpr(w, h, kind);
  const f = PIX.map[name];
  c.chim = f.meta && f.meta.chim ? [f.meta.chim[0] / 2, f.meta.chim[1] / 2] : null;
  return c;
};

/* furniture: footprint w x h tiles; act = door action opened by interacting with it */
const FURN = {
  bed: { w: 2, h: 2 }, table: { w: 2 }, table_cloth: { w: 2 }, chair: {}, stool: {}, stove: {}, fireplace: { w: 2, light: 70 },
  bookshelf: { w: 2 }, dresser: { w: 2 }, plant: {}, barrel: {}, crate: {}, sack: {}, shelf_store: { w: 2 }, shelf_tavern: { w: 2 },
  shelf_museum: { w: 2 }, counter: { w: 3 }, bar: { w: 3 }, kegs: { w: 2 }, display: { w: 2 }, pedestal: {}, hay: {}, trough: { w: 2 },
  nestbox: { w: 2 }, saddle: {}, workbench: { w: 2 }, lumber: { w: 2 }, anvil: {}, tub: {}, weapons: { w: 2 }, coal: {},
  forge: { w: 2, light: 84 }, nets: { w: 2 }, lamp: { light: 1 }, bench: { w: 2 },
};
for (const k in FURN) OBJ['furn_' + k] = { solid: 1, fixed: 1, w: FURN[k].w || 1, h: FURN[k].h || 1, light: FURN[k].light };
OBJ.keeper = { solid: 1, fixed: 1 };

/* Room layouts. Walls fill rows 0-2 (top + a two-tile wall face) and the sides; the
   bottom row is wall except the 2-tile doorway. f: [kind, x, y(bottom row of footprint), act?, label?].
   d: decals [name, tileX, tileY, offX, offY] painted on the wall or floor. */
const ROOMS = {
  house: { name: 'Hollowmere Cottage', w: 12, h: 10, floor: 'f', wall: 'plaster', dark: .28,
    f: [['bed', 1, 4, 'house', 'Rest'], ['dresser', 3, 3], ['fireplace', 5, 3], ['plant', 7, 3], ['stove', 8, 3, 'kitchen', 'Cook'], ['bookshelf', 9, 3],
      ['table_cloth', 5, 6], ['stool', 4, 6], ['stool', 7, 6], ['barrel', 10, 7], ['crate', 10, 8], ['lamp', 1, 7], ['plant', 1, 8]],
    d: [['dec_rug_red', 4, 5, 0, 8], ['dec_window', 3, 1, 0, 6], ['dec_painting', 8, 1, 0, 10], ['dec_window', 10, 1, 0, 6]] },
  store: { name: "Mara's General Store", w: 12, h: 9, floor: 'f', wall: 'plaster', dark: .22, keeper: ['mara', 5, 4],
    f: [['shelf_store', 1, 3], ['plant', 3, 3], ['shelf_store', 7, 3], ['shelf_store', 9, 3], ['counter', 4, 5, 'store', 'Shop'],
      ['barrel', 1, 6], ['barrel', 1, 7], ['sack', 10, 6], ['sack', 10, 7], ['crate', 9, 7], ['lamp', 10, 5]],
    d: [['dec_rug_green', 4, 6, 0, 8], ['dec_window', 4, 1, 0, 6], ['dec_shelf', 5, 1, 0, 4]] },
  smith: { name: "Brann's Smithy", w: 12, h: 9, floor: 'p', wall: 'stone', dark: .40, keeper: ['brann', 7, 5],
    f: [['coal', 3, 3], ['coal', 4, 3], ['forge', 5, 3, 'smith', 'Smithy'], ['weapons', 8, 3], ['lamp', 1, 3], ['anvil', 6, 5, 'smith', 'Smithy'],
      ['tub', 8, 6], ['barrel', 10, 6], ['crate', 10, 7], ['workbench', 1, 6], ['stool', 3, 6]],
    d: [['dec_banner_red', 2, 1, 4, 2], ['dec_banner_red', 10, 1, 4, 2]] },
  tavern: { name: 'The Drowsy Drake', w: 14, h: 10, floor: 'f', wall: 'plaster', dark: .33, keeper: ['pip', 3, 4],
    f: [['shelf_tavern', 1, 3], ['shelf_tavern', 3, 3], ['kegs', 5, 3], ['bar', 2, 5, 'tavern', 'Order'], ['fireplace', 10, 3],
      ['table', 6, 7], ['stool', 5, 7], ['stool', 8, 7], ['table', 10, 7], ['stool', 9, 7], ['stool', 12, 7], ['bench', 1, 8], ['lamp', 8, 3], ['lamp', 12, 4], ['barrel', 12, 3]],
    d: [['dec_rug_red', 9, 6, 0, 8], ['dec_banner_blue', 7, 1, 4, 2], ['dec_window', 12, 1, 0, 6], ['dec_painting', 9, 1, 16, 10]] },
  stablemaster: { name: "Odile's Stables", w: 12, h: 9, floor: 'f', wall: 'plank', dark: .25, keeper: ['odile', 5, 4],
    f: [['saddle', 1, 3], ['saddle', 2, 3], ['counter', 4, 5, 'stablemaster', 'Stables'], ['hay', 9, 3], ['hay', 10, 3], ['hay', 10, 4],
      ['trough', 8, 6], ['barrel', 1, 6], ['sack', 1, 7], ['lamp', 7, 3]],
    d: [['dec_window', 4, 1, 0, 6], ['dec_banner_blue', 7, 1, 4, 2], ['dec_rug_small', 4, 6, 16, 8]] },
  carpenter: { name: "Hale's Workshop", w: 12, h: 9, floor: 'f', wall: 'plank', dark: .25, keeper: ['hale', 8, 5],
    f: [['workbench', 1, 3], ['workbench', 3, 3], ['lumber', 8, 3], ['lumber', 10, 3], ['counter', 7, 6, 'carpenter', 'Carpenter'],
      ['stool', 2, 5], ['crate', 1, 7], ['crate', 2, 7], ['barrel', 10, 7], ['lamp', 5, 3]],
    d: [['dec_window', 6, 1, 0, 6], ['dec_shelf', 1, 1, 0, 4]] },
  museum: { name: 'Emberhollow Museum', w: 14, h: 10, floor: 'st', wall: 'stone', dark: .25, keeper: ['elias', 11, 6],
    f: [['pedestal', 1, 3], ['pedestal', 4, 3], ['shelf_museum', 6, 3], ['pedestal', 9, 3], ['pedestal', 12, 3],
      ['display', 2, 6], ['display', 6, 6], ['counter', 10, 7, 'museum', 'Museum'], ['plant', 1, 8], ['plant', 12, 8], ['lamp', 8, 3]],
    d: [['dec_rug_purple', 4, 7, 0, 8], ['dec_painting', 2, 1, 0, 10], ['dec_painting', 11, 1, 0, 10], ['dec_banner_blue', 8, 1, 4, 2]] },
  fisher: { name: "Corwin's Hut", w: 10, h: 8, floor: 'f', wall: 'plank', dark: .28, keeper: ['corwin', 5, 4],
    f: [['nets', 1, 3], ['counter', 4, 5, 'fisher', 'Sell fish'], ['barrel', 8, 3], ['tub', 8, 5], ['crate', 1, 6], ['lamp', 7, 3]],
    d: [['dec_window', 4, 1, 0, 6], ['dec_rug_small', 4, 6, 0, 8]] },
  coop: { name: 'Coop', w: 10, h: 8, floor: 'd', wall: 'plank', dark: .25,
    f: [['nestbox', 1, 3, 'coop', 'Animals'], ['nestbox', 3, 3, 'coop', 'Animals'], ['hay', 7, 3], ['hay', 8, 3], ['trough', 5, 5, 'coop', 'Animals'], ['sack', 8, 6], ['lamp', 6, 3]],
    d: [['dec_window', 5, 1, 0, 6]] },
  barn: { name: 'Barn', w: 12, h: 9, floor: 'd', wall: 'plank', dark: .28,
    f: [['hay', 1, 3], ['hay', 2, 3], ['hay', 1, 4], ['trough', 4, 5, 'barn', 'Animals'], ['trough', 7, 5, 'barn', 'Animals'], ['hay', 10, 3], ['barrel', 10, 6], ['sack', 1, 7], ['lamp', 6, 3]],
    d: [['dec_window', 4, 1, 0, 6], ['dec_window', 8, 1, 0, 6]] },
  stable: { name: 'Stable', w: 12, h: 9, floor: 'd', wall: 'plank', dark: .28,
    f: [['saddle', 1, 3], ['saddle', 2, 3], ['hay', 9, 3], ['hay', 10, 3], ['trough', 4, 5, 'stable', 'Animals'], ['trough', 7, 5, 'stable', 'Animals'], ['barrel', 10, 6], ['lamp', 6, 3]],
    d: [['dec_window', 4, 1, 0, 6], ['dec_banner_blue', 8, 1, 4, 2]] },
};

function findBuilding(act) { for (const id of ['farm', 'village', 'wilds']) { const m = MAPS[id]; if (!m) continue; const b = m.bld.find(b => b.act === act); if (b) return [id, b]; } return [null, null]; }
function genInterior(act) {
  const R0 = ROOMS[act], W = R0.w, H = R0.h, m = newMap('in_' + act, W, H, R0.floor);
  m.outdoor = false; m.indoor = true; m.noSeason = true; m.name = R0.name; m.theme = 'indoor'; m.wall = R0.wall; m.inDark = R0.dark; m.decals = R0.d || [];
  const dx = Math.floor(W / 2) - 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (y < 3 || x === 0 || x === W - 1 || (y === H - 1 && x !== dx && x !== dx + 1)) setT(m, x, y, 'x');
  for (const [k, x, y, act2, label] of R0.f) putObj(m, x, y, { k: 'furn_' + k, fixed: 1, act: act2, label });
  if (R0.keeper) { const [npc, x, y] = R0.keeper; setO(m, x, y, { k: 'keeper', npc, fixed: 1 }); }
  const [src, b] = findBuilding(act);
  m.warps.push({ x: dx, y: H - 1, w: 2, h: 1, to: src || 'farm', tx: b ? (b.door.x + .5) * 16 : 9.5 * 16, ty: b ? (b.door.y + 1.7) * 16 : 10.5 * 16, dir: 0 });
  m.start = { x: (dx + 1) * 16, y: (H - 1.6) * 16 };
  return m;
}

const _goMap = goMap;
goMap = function (id, x, y, dir) {
  SMOKE.length = 0;
  if (id.startsWith('in_')) { const m = MAPS[id] = genInterior(id.slice(3)); return _goMap(id, m.start.x, m.start.y, dir === undefined ? 3 : dir); }
  return _goMap(id, x, y, dir);
};
const _doorAction = doorAction;
doorAction = function (act, who) {
  if (ROOMS[act] && !who && !(cur && cur.id === 'in_' + act)) return goMap('in_' + act);
  return _doorAction(act, who);
};
const _objInteract = objInteract;
objInteract = function (m, x, y, o) {
  if (o.k === 'keeper') { const room = ROOMS[m.id.slice(3)], fur = room && room.f.find(f => f[3]); return { label: 'Talk', fn: () => fur ? doorAction(fur[3], o.npc) : talkNPC(o.npc) }; }
  if (o.act === 'kitchen') return { label: o.label, fn: () => openMenu('craft', 'kitchen') };
  if (o.act) return { label: o.label || 'Use', fn: () => doorAction(o.act) };
  return _objInteract(m, x, y, o);
};
const _stationNear = stationNear;
stationNear = function (st) {
  const want = st === 'forge' ? ['furn_forge', 'furn_anvil'] : st === 'kitchen' ? ['furn_stove', 'furn_fireplace'] : null;
  if (want && cur.indoor) for (let i = 0; i < cur.o.length; i++) { const o = cur.o[i]; if (o && want.includes(o.k) && dist(S.p.x, S.p.y, (i % cur.w + .5) * 16, ((i / cur.w | 0) + .5) * 16) < 48) return true; }
  return _stationNear(st);
};
const _objSprite = objSprite;
objSprite = function (o, season) {
  if (o.k === 'keeper') { const N = NPCS[o.npc]; return humanSpr('npc' + o.npc, N.P, 0, 0); }
  return _objSprite(o, season);
};
const _buildObjectsI = buildObjects;
buildObjects = function () { _buildObjectsI(); for (const k in FURN) SPR['furn_' + k] = PIX.get('furn_' + k); };

/* ---- wall painting for rooms: back wall face (two tiles tall), dark wall tops with a timber lip, then decals ---- */
const WALLPAL = {
  plaster: { face: ['#c8b48e', '#e2d0aa', '#f0e2c0', '#fff4da'], trim: ['#4a2e1a', '#6a4426', '#8a5a34', '#a8743f'] },
  stone: { face: ['#3e3c48', '#56545e', '#6e6c74', '#8a8890'], trim: ['#2a1a12', '#3a2218', '#5a3622', '#7a4c2c'] },
  plank: { face: ['#4a2e1a', '#6a4426', '#8a5a34', '#a8743f'], trim: ['#2a1a10', '#3a2218', '#5a3622', '#7a4c2c'] },
};
function pixRoomWalls(x, m, cx, cy, M) {
  const P = (X, Y, W, H, col) => { x.fillStyle = col; x.fillRect(X, Y, W, H); };
  const pal = WALLPAL[m.wall] || WALLPAL.plaster, isX = (X, Y) => inb(m, X, Y) && getT(m, X, Y) === 'x';
  for (let j = -1; j <= CH; j++) for (let i = -1; i <= CH; i++) {
    const X = cx * CH + i, Y = cy * CH + j; if (!isX(X, Y)) continue;
    const bx = M + i * 32, by = M + j * 32;
    const face = Y >= 1 && Y <= 2 && X > 0 && X < m.w - 1;
    if (face) {
      for (let yy = 0; yy < 32; yy++) for (let xx = 0; xx < 32; xx++) {
        const ay = (Y - 1) * 32 + yy, ax = X * 32 + xx; let c;
        if (m.wall === 'stone') { const row = ay / 6 | 0, j2 = ay % 6 === 5 || (ax + row * 5) % 12 === 0; c = j2 ? pal.face[0] : ay % 6 === 0 ? pal.face[3] : pal.face[1 + (hsh((ax + row * 5) / 12 | 0, row, 3) > .6 ? 1 : 0)]; }
        else if (m.wall === 'plank') c = ax % 8 === 0 ? pal.face[0] : ax % 8 === 1 ? pal.face[3] : pal.face[2 - (hsh(ax >> 3, ay >> 2, 5) > .8 ? 1 : 0)];
        else c = hsh(ax >> 1, ay >> 1, 7) > .93 ? pal.face[1] : pal.face[2];
        P(bx + xx, by + yy, 1, 1, c);
      }
      if (m.wall === 'plaster') { // timber posts every 3 tiles, a rail, and wainscot boards
        if (X % 3 === 1) { P(bx, by, 4, 32, pal.trim[1]); P(bx, by, 1, 32, pal.trim[3]); }
        if (Y === 1) { P(bx, by + 2, 32, 3, pal.trim[1]); P(bx, by + 2, 32, 1, pal.trim[3]); }
        if (Y === 2) { for (let xx = 0; xx < 32; xx++) P(bx + xx, by + 14, 1, 18, (X * 32 + xx) % 6 === 0 ? pal.trim[0] : pal.trim[2]); P(bx, by + 13, 32, 2, pal.trim[3]); }
      }
      if (Y === 2) { P(bx, by + 28, 32, 4, pal.trim[0]); P(bx, by + 28, 32, 1, pal.trim[2]); } // skirting
      if (Y === 1) P(bx, by, 32, 2, 'rgba(10,6,8,.35)');
      continue;
    }
    P(bx, by, 32, 32, '#221a20'); // wall top
    for (let k = 0; k < 6; k++) P(bx + ((hsh(X, Y, k) * 30) | 0), by + ((hsh(Y, X, k) * 30) | 0), 2, 1, '#2c2228');
    const open = (dx, dy) => inb(m, X + dx, Y + dy) && !isX(X + dx, Y + dy);
    if (open(0, 1)) { P(bx, by + 28, 32, 4, pal.trim[1]); P(bx, by + 28, 32, 1, pal.trim[3]); }
    if (open(1, 0) || (Y >= 3 && X === 0)) { P(bx + 28, by, 4, 32, pal.trim[1]); P(bx + 28, by, 1, 32, pal.trim[3]); }
    if (open(-1, 0) || (Y >= 3 && X === m.w - 1)) { P(bx, by, 4, 32, pal.trim[1]); P(bx + 3, by, 1, 32, pal.trim[0]); }
    if (open(0, -1)) P(bx, by, 32, 2, pal.trim[2]);
  }
  for (const [n, tx, ty, ox, oy] of m.decals || []) {
    const c = PIX.get(n); if (!c) continue;
    x.drawImage(c, M + (tx - cx * CH) * 32 + (ox || 0), M + (ty - cy * CH) * 32 + (oy || 0));
  }
  // soft shadow along the foot of the back wall
  if (cy === 0) for (let i = -1; i <= CH; i++) { const X = cx * CH + i; if (X > 0 && X < m.w - 1) { P(M + i * 32, M + 3 * 32, 32, 3, 'rgba(20,10,8,.35)'); P(M + i * 32, M + 3 * 32 + 3, 32, 2, 'rgba(20,10,8,.15)'); } }
}
const _paintChunkPx = paintChunk;
paintChunk = function (m, cx, cy) {
  const c = _paintChunkPx(m, cx, cy);
  if (m.indoor && m.theme === 'indoor' && c.m !== undefined) pixRoomWalls(c.getContext('2d'), m, cx, cy, c.m);
  return c;
};

/* an upgrade at Hale's swaps the building's sprite straight away */
const _renderBuildI = renderBuild;
renderBuild = function (b) {
  for (const m of [MAPS.farm].filter(Boolean)) for (const B of m.bld || []) if (['coop', 'barn', 'stable'].includes(B.kind)) { const c = buildingSpr(B.w, B.h, B.kind); B.spr = c; }
  return _renderBuildI(b);
};

/* front-gabled roofs leave the footprint's top corners empty: tiles a building sprite
   barely covers stay walkable, so there are no invisible walls behind the eaves */
const _addBI = addB;
addB = function (m, x, y, w, h, kind, act) {
  const b = _addBI(m, x, y, w, h, kind, act), c = b.spr;
  if (c && c.getContext && c.width === w * 32 && c.height === h * 32) {
    if (!c.openTiles) {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; c.openTiles = [];
      for (let j = 0; j < h - 1; j++) for (let i = 0; i < w; i++) { let n = 0; for (let yy = j * 32; yy < j * 32 + 32; yy++) for (let xx = i * 32; xx < i * 32 + 32; xx++) if (d[(yy * c.width + xx) * 4 + 3] > 0) n++; if (n < 32 * 32 * .2) c.openTiles.push([i, j]); }
    }
    for (const [i, j] of c.openTiles) m.solidB[(y + j) * m.w + x + i] = 0;
  }
  return b;
};
