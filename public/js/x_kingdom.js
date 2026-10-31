/* ================= Kingdom phase K1: Briarholt Castle and The Empty Throne =================
   (design and later phases in docs/IDEAS_KINGDOMS.md)
   BRIARHOLT: the old royal summer castle on its own plot through the farm's south-east tree line
   (map 'castle', saved like the farm). Curtain walls of joined wall pieces (cwall, mask 1 N 2 E
   4 S 8 W), round towers, a gate arch, the keep (bld_castle_18x10) and two greenhouses
   (maps cgh_W / cgh_E, crops in any season). The way in opens with Briarholt's key
   (S.story.flags.briarOpen); once the deed is bought (flags.castleOwned) the grounds and the
   greenhouses are farmland like an owned plot (castleLand, read by ownedPlots in q_land.js).
   THE KEEP: one interior map 'castle_in' with seven rooms behind inner walls and doorways (great
   hall, throne room, library, royal bedchamber, kitchen, armoury, chapel). Walls are painted by
   a general pixRoomWalls (a wall face wherever wall meets floor below it); the room you're in
   is named as you enter it (ROOMZ). Rebuilt on every load, never saved.
   THE EMPTY THRONE: the second main story. It starts once The Hollow Crown is complete; the
   Hollow Crown itself now hints at it (Margit's seal, King Oswin, Briarholt). Chapters: the
   herald, Margit's seal and the key, the princess hiding at Briarholt, the deed. Chapter 4 (the
   siege) arrives with phase K2. Story steps can cost gold (st.pay, st.payFlag). */

/* ---- state ---- */
const castleOpen = () => !!(S && S.story && S.story.flags && (S.story.flags.briarOpen || S.story.flags.castleOwned));
const castleOwned = () => !!(S && S.story && S.story.flags && S.story.flags.castleOwned);
function castleLand() { return castleOwned() ? ['castle', 'cgh_W', 'cgh_E'] : []; }
PERSIST.push('castle', 'cgh_W', 'cgh_E');
MAP_N.castle = 'Briarholt Castle'; MAP_N.castle_in = 'Briarholt Keep'; MAP_N.cgh_W = 'West Glasshouse'; MAP_N.cgh_E = 'East Glasshouse';
DOORL.castle = 'Enter'; DOORL.cgh_W = 'Enter'; DOORL.cgh_E = 'Enter';
BLD_N.castle = 'Briarholt Keep'; BLD_N.cgh_W = 'West Glasshouse'; BLD_N.cgh_E = 'East Glasshouse';

/* ---- castle pieces ---- */
OBJ.cwall = { solid: 1, fixed: 1 };
OBJ.ctower = { solid: 1, fixed: 1, tall: 1, w: 2, h: 2 };
OBJ.cgate = { fixed: 1, w: 2 }; OBJ.gpart = {};
TER.fl = { pri: 9 }; TER.mb = { pri: 9 }; // castle flagstones and marble (ground_fl, ground_mb in ground.py)
const KSNOW = () => S && S.season === 3;
objSprite = (f => function (o, season) {
  if (o.k === 'cwall') return PIX.get('cwall_' + (o.fm || 0) + (KSNOW() ? '_w' : '')) || PIX.get('cwall_' + (o.fm || 0));
  if (o.k === 'ctower') return PIX.get(KSNOW() ? 'ctower_w' : 'ctower');
  if (o.k === 'cgate') return PIX.get(KSNOW() ? 'cgate_w' : 'cgate');
  if (o.k === 'resident') { const W = who(o.c); return W ? (SCACHE['res' + o.c] || (SCACHE['res' + o.c] = humanSpr('st' + o.c, W.P, 0, 0))) : null; }
  return f(o, season);
})(objSprite);

/* ---- the grounds ---- */
const KEEP_X = 27, KEEP_W = 18;
const CW = 68, CH2 = 52, WX0 = 14, WX1 = 58, WY0 = 6, WY1 = 44, GATE = 36;
function genCastle() {
  const m = newMap('castle', CW, CH2, 'g'), R0 = R; R = rng((S.seed || 1) * 31 + 4049);
  m.name = 'Briarholt Castle'; m.soilQ = 1.15; m.farm = castleOwned(); m.castle = true;
  border(m, [(x, y) => y < 2 && x >= 6 && x <= 8]);
  const walls = new Set(), key = (x, y) => y * CW + x;
  for (let x = WX0; x <= WX1; x++) { walls.add(key(x, WY0)); walls.add(key(x, WY1)); }
  for (let y = WY0; y <= WY1; y++) { walls.add(key(WX0, y)); walls.add(key(WX1, y)); }
  const towers = [[WX0, WY0 + 1], [WX1 - 1, WY0 + 1], [WX0, WY1], [WX1 - 1, WY1], [GATE - 2, WY1], [GATE + 2, WY1], [WX0, 25], [WX1 - 1, 25]];
  for (const [tx, ty] of towers) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) walls.delete(key(tx + i, ty - j));
  walls.delete(key(GATE, WY1)); walls.delete(key(GATE + 1, WY1));
  // the road: in from the farm, down the west side, along the south front and up through the gate to the keep
  const road = (x, y) => { if (inb(m, x, y)) setT(m, x, y, 'p'); };
  for (let y = 0; y <= 48; y++) { road(7, y); road(8, y); }
  for (let x = 7; x <= GATE + 1; x++) { road(x, 47); road(x, 48); }
  for (let y = 19; y <= 48; y++) { road(GATE, y); road(GATE + 1, y); }
  for (let x = 16; x <= 56; x++) { road(x, 32); }                       // the cross path to the glasshouses
  road(21, 31); road(52, 31);
  // the courtyard: lawns, beds and lanterns
  const scatter = (n, x0, y0, x1, y1, f) => { for (let i = 0; i < n; i++) { const x = x0 + Math.floor(R() * (x1 - x0)), y = y0 + Math.floor(R() * (y1 - y0)); if (!getO(m, x, y) && getT(m, x, y) === 'g') f(x, y); } };
  // the fountain plaza before the keep: paved, lanterns at its corners, the road runs on to the gate
  for (let y = 21; y <= 30; y++) for (let x = 31; x <= 42; x++) setT(m, x, y, 'p');
  for (const [x, y] of [[31, 21], [42, 21], [31, 30], [42, 30], [GATE - 1, 34], [GATE + 2, 34], [GATE - 1, 39], [GATE + 2, 39]]) setO(m, x, y, { k: 'lantern', fixed: 1 });
  for (let x = 17; x <= 25; x++) for (const y of [21, 22]) if (R() < .8) setO(m, x, y, { k: 'flower', v: Math.floor(R() * 5) });
  for (let x = 47; x <= 56; x++) for (const y of [21, 22]) if (R() < .8) setO(m, x, y, { k: 'flower', v: Math.floor(R() * 5) });
  for (const [x, y] of [[17, 11], [22, 9], [51, 10], [55, 13], [17, 40], [55, 40]]) setO(m, x, y, { k: 'tree', kind: 'oak' });
  putObj(m, 26, 40, { k: 'statue', fixed: 1 }); putObj(m, 46, 40, { k: 'statue', fixed: 1 });
  putObj(m, 28, 23, { k: 'well', fixed: 1 });
  // the training yard (south-west), the stores (south-east) and benches before the keep
  const yard = (k, x, y) => putObj(m, x, y, { k: 'furn_' + k, fixed: 1 });
  for (const x of [18, 21, 24]) yard('dummy', x, 35);
  for (const x of [19, 23]) yard('target', x, 39);
  yard('haybale', 17, 38); yard('haybale', 25, 38); yard('haybale', 25, 39); yard('weapons', 16, 35);
  for (const [k, x, y] of [['barrel', 49, 35], ['barrel', 50, 35], ['barrel', 49, 36], ['crate', 53, 35], ['crate', 54, 35], ['crate', 53, 36], ['sack', 51, 38], ['sack', 52, 38], ['hay', 56, 35], ['hay', 56, 36], ['haybale', 55, 38]]) yard(k, x, y);
  yard('sbench', 32, 25); yard('sbench', 41, 25); yard('sbench', 32, 28); yard('sbench', 41, 28);
  // the royal gardens: hedged flower beds with topiaries, banner poles along the road, knights' pavilions
  for (let x = 17; x <= 25; x++) yard('hedge', x, 23); for (let x = 47; x <= 56; x++) yard('hedge', x, 23);
  for (const x of [16, 26, 46, 57]) yard('topiary', x, 23);
  for (const [x, y] of [[34, 31], [39, 31], [34, 36], [39, 36], [32, 19], [41, 19], [16, 19], [57, 19]]) yard('bpole', x, y);
  for (const x of [19, 22, 48, 51]) yard('pavilion', x, 41);
  // outside the walls: meadow, an orchard row, a pond and the edge of the woods
  pond(m, 63, 22, 2, 5);
  scatter(60, 2, 2, CW - 2, CH2 - 2, (x, y) => { const inside = x >= WX0 && x <= WX1 && y >= WY0 && y <= WY1; if (!inside) setO(m, x, y, R() < .55 ? { k: 'tgrass' } : R() < .5 ? { k: 'flower', v: Math.floor(R() * 5) } : { k: 'tree', kind: pickR(['oak', 'birch', 'maple']) }); });
  for (let y = 10; y <= 40; y += 4) { if (!getO(m, 11, y) && getT(m, 11, y) === 'g') setO(m, 11, y, { k: 'tree', kind: 'birch' }); }
  // the curtain wall: clear what's under it, then the pieces with their joins
  for (const k of walls) { const x = k % CW, y = (k / CW) | 0; setT(m, x, y, 'g'); setO(m, x, y, null); }
  for (const [tx, ty] of towers) { for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) setO(m, tx + i, ty - j, null); putObj(m, tx, ty, { k: 'ctower', fixed: 1 }); }
  for (const k of walls) { const x = k % CW, y = (k / CW) | 0, fm = (walls.has(key(x, y - 1)) ? 1 : 0) | (walls.has(key(x + 1, y)) ? 2 : 0) | (walls.has(key(x, y + 1)) ? 4 : 0) | (walls.has(key(x - 1, y)) ? 8 : 0); setO(m, x, y, { k: 'cwall', fm, fixed: 1 }); }
  putObj(m, GATE, WY1, { k: 'cgate', fixed: 1 }); setO(m, GATE + 1, WY1, { k: 'gpart' }); // the arch's right half stays open
  // the keep and the glasshouses
  m.bKeep = addB(m, KEEP_X, 9, KEEP_W, 10, 'castle', 'castle');
  addB(m, 17, 25, 8, 6, 'greenhouse', 'cgh_W'); addB(m, 48, 25, 8, 6, 'greenhouse', 'cgh_E');
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && m.solidB[i] && o.k !== 'cwall') m.o[i] = null; }
  for (let y = 24; y <= 27; y++) for (let x = 35; x <= 38; x++) m.solidB[y * m.w + x] = 1; // the basin
  setO(m, 35, 27, { k: 'fountain', fixed: 1 });
  m.warps.push({ x: 6, y: 0, w: 3, h: 1, to: 'farm', tx: 45.5 * 16, ty: 41.6 * 16, dir: 3 });
  m.start = { x: 7.5 * 16, y: 3 * 16 };
  R = R0;
  return m;
}
/* the glasshouses: soil beds that grow anything in any season */
function genCastleGH(side) {
  const id = 'cgh_' + side, W = 18, H = 14, m = newMap(id, W, H, 'f');
  m.farm = castleOwned(); m.noSeason = true; m.outdoor = false; m.indoor = true; m.name = side === 'W' ? 'West Glasshouse' : 'East Glasshouse'; m.theme = 'earth'; m.soilQ = 1.2;
  for (let x = 0; x < W; x++) { setT(m, x, 0, 'x'); setT(m, x, 1, 'x'); } for (let y = 0; y < H; y++) { setT(m, 0, y, 'x'); setT(m, W - 1, y, 'x'); }
  for (let y = 3; y < 11; y++) for (let x = 2; x < W - 2; x++) setT(m, x, y, 'g');
  const dx = side === 'W' ? 21 : 52;
  m.warps.push({ x: 8, y: H - 1, w: 2, h: 1, to: 'castle', tx: (dx + .5) * 16, ty: 31.7 * 16, dir: 0 }); m.start = { x: 9 * 16, y: (H - 2) * 16 };
  return m;
}

/* the farm's south-east corner: a sign, and the way through once the gate is open */
function openCastleEdge(f) {
  if (!f) return;
  signAt(f, 47, f.h - 3, castleOpen() ? 'Briarholt Castle ↓ (through the gap in the trees)' : 'Through these trees stands Briarholt, an old royal castle. Crown land; the gate is locked.');
  const s = getO(f, 47, f.h - 3); if (s && s.k === 'sign') s.text = castleOpen() ? 'Briarholt Castle ↓ (through the gap in the trees)' : 'Through these trees stands Briarholt, an old royal castle. Crown land; the gate is locked.';
  f.warps = f.warps.filter(w => w.to !== 'castle');
  if (!castleOpen()) return;
  for (const x of [44, 45, 46]) for (const y of [f.h - 2, f.h - 1]) { const o = getO(f, x, y); if (o && !o.fixed) setO(f, x, y, null); if (!f.solidB[y * f.w + x]) setT(f, x, y, 'd'); }
  f.warps.push({ x: 44, y: f.h - 1, w: 3, h: 1, to: 'castle', tx: 7.5 * 16, ty: 3 * 16, dir: 0 });
}
function refreshCastle() {
  openCastleEdge(MAPS.farm);
  for (const id of ['castle', 'cgh_W', 'cgh_E']) if (MAPS[id]) MAPS[id].farm = castleOwned();
  if (typeof CHUNK !== 'undefined') CHUNK.clear();
}
genFarm = (f => function () { const m = f(); if (S) openCastleEdge(m); return m; })(genFarm);

/* ---- the keep's interior: three floors ----
   Ground floor (castle_in): entrance hall with the grand stair up and the stair down, the great hall,
   the throne room with its pillars, library, chapel, kitchen, pantry, armoury and guard room.
   Upper floor (castle_up): your bedchamber, the solar, Isolde's chamber, the bath, the portrait
   gallery and the map room. Cellar (castle_down): wine cellar, treasury vault, dungeon and the crypt
   of the old kings. Each floor: outer wall, inner walls 3 thick across and 1 thick up and down,
   doorways cut through them; rooms named as you enter (KEEP_PLANS[id].rooms). */
Object.assign(FURN, { throne: { w: 2 }, royalbed: { w: 3, h: 2 }, banquet: { w: 4 }, armour: {}, altar: { w: 2 }, candles: { light: 1 }, chest: { w: 2 }, harp: {},
  pillar: {}, throne_h: { w: 2 }, wardrobe: { w: 2 }, wartable: { w: 3 }, bath: { w: 2 }, hearth: { w: 3, light: 90 }, winerack: { w: 2 }, cell: {}, tomb: { w: 2 }, hoard: { w: 2 }, stairup: { w: 2 }, stairdown: { w: 2 }, dummy: {}, target: {}, haybale: {}, sbench: {}, hedge: {}, topiary: {}, bpole: {}, pavilion: { w: 2 } });
for (const k of ['throne', 'royalbed', 'banquet', 'armour', 'altar', 'candles', 'chest', 'harp', 'pillar', 'throne_h', 'wardrobe', 'wartable', 'bath', 'hearth', 'winerack', 'cell', 'tomb', 'hoard', 'stairup', 'stairdown', 'dummy', 'target', 'haybale', 'sbench', 'hedge', 'topiary', 'bpole', 'pavilion'])
  OBJ['furn_' + k] = { solid: 1, fixed: 1, w: FURN[k].w || 1, h: FURN[k].h || 1, light: FURN[k].light };
const KEEP_PLANS = {
  castle_in: { n: 'Briarholt Keep', w: 64, h: 46, dark: .3,
    walls: [['v', 15, 3, 44], ['v', 48, 3, 44], ['h', 0, 63, 15], ['h', 0, 63, 34]],
    doors: [[30, 15, 4, 3], [30, 34, 4, 3], [15, 25, 1, 2], [48, 25, 1, 2], [15, 8, 1, 2], [48, 8, 1, 2], [6, 34, 2, 3], [55, 34, 2, 3], [15, 40, 1, 2], [48, 40, 1, 2], [31, 45, 2, 1]],
    rooms: [['Library', 1, 3, 14, 14, 'f'], ['Throne Room', 16, 3, 47, 14, 'mb'], ['Chapel', 49, 3, 62, 14, 'mb'], ['Kitchen', 1, 18, 14, 33, 'fl'], ['Great Hall', 16, 18, 47, 33, 'mb'],
      ['Armoury', 49, 18, 62, 33, 'fl'], ['Pantry', 1, 37, 14, 44, 'fl'], ['Entrance Hall', 16, 37, 47, 44, 'mb'], ['Guard Room', 49, 37, 62, 44, 'fl']],
    f: [// throne room: the throne on its dais, pillars down both sides
      ['throne_h', 31, 7, 'k_throne', 'Sit'], ['candles', 27, 5], ['candles', 36, 5], ['armour', 23, 5], ['armour', 40, 5],
      ['pillar', 19, 6], ['pillar', 19, 10], ['pillar', 19, 14], ['pillar', 44, 6], ['pillar', 44, 10], ['pillar', 44, 14], ['plant', 16, 3], ['plant', 47, 3],
      // library
      ['bookshelf', 1, 3, 'k_lore', 'Read'], ['bookshelf', 3, 3, 'k_lore', 'Read'], ['bookshelf', 5, 3, 'k_lore', 'Read'], ['bookshelf', 9, 3, 'k_lore', 'Read'], ['bookshelf', 11, 3, 'k_lore', 'Read'],
      ['bookshelf', 2, 8, 'k_lore', 'Read'], ['bookshelf', 10, 8, 'k_lore', 'Read'], ['table', 5, 12], ['chair', 4, 12], ['chair', 7, 12], ['lamp', 13, 5], ['harp', 13, 13, 'k_harp', 'Play'], ['plant', 1, 14], ['candles', 7, 4],
      // chapel
      ['altar', 55, 5, 'k_altar', 'Pray'], ['candles', 53, 5], ['candles', 58, 5], ['bench', 51, 9], ['bench', 54, 9], ['bench', 57, 9], ['bench', 51, 12], ['bench', 54, 12], ['bench', 57, 12], ['plant', 49, 14], ['plant', 62, 14],
      // kitchen: the great hearth, stoves, a long table, barrels
      ['hearth', 5, 18, 'kitchen', 'Cook'], ['stove', 1, 18, 'kitchen', 'Cook'], ['stove', 12, 18, 'kitchen', 'Cook'], ['kegs', 9, 18], ['table', 3, 25], ['table', 7, 25], ['stool', 2, 26], ['stool', 5, 26], ['stool', 9, 26],
      ['barrel', 1, 30], ['barrel', 1, 31], ['barrel', 2, 31], ['sack', 13, 31], ['sack', 13, 32], ['crate', 12, 32], ['lamp', 13, 23],
      // great hall: two rows of banquet tables either side of the aisle
      ...[18, 22, 26, 34, 38, 42].flatMap(x => [['banquet', x, 23], ['bench', x, 24], ['bench', x + 2, 24], ['banquet', x, 29], ['bench', x, 30], ['bench', x + 2, 30]]),
      ['fireplace', 20, 18], ['fireplace', 42, 18], ['candles', 16, 21], ['candles', 47, 21], ['candles', 16, 33], ['candles', 47, 33], ['armour', 28, 18], ['armour', 35, 18], ['harp', 46, 26, 'k_harp', 'Play'],
      // armoury
      ['weapons', 49, 18], ['weapons', 52, 18], ['weapons', 55, 18], ['armour', 58, 18], ['armour', 59, 18], ['armour', 60, 18], ['armour', 61, 18], ['workbench', 50, 24], ['anvil', 54, 24], ['tub', 57, 24],
      ['chest', 60, 28, 'bank', 'Treasury'], ['crate', 49, 32], ['crate', 50, 32], ['barrel', 62, 32], ['lamp', 62, 22],
      // entrance hall: the grand stair up and the stair down
      ['stairup', 18, 39, 'k_up', 'Go upstairs'], ['stairdown', 44, 39, 'k_down', 'Go down'], ['armour', 29, 44], ['armour', 34, 44], ['candles', 24, 38], ['candles', 39, 38], ['plant', 16, 44], ['plant', 47, 44],
      ['pillar', 23, 43], ['pillar', 40, 43],
      // pantry
      ['shelf_store', 1, 37], ['shelf_store', 4, 37], ['kegs', 7, 37], ['barrel', 11, 37], ['barrel', 12, 37], ['sack', 1, 42], ['sack', 2, 42], ['sack', 1, 43], ['crate', 12, 43], ['crate', 13, 43], ['crate', 13, 42],
      // guard room
      ['weapons', 55, 37], ['table', 54, 41], ['stool', 53, 41], ['stool', 57, 41], ['bed', 49, 44], ['bed', 61, 44], ['lamp', 58, 38], ['barrel', 62, 38]],
    d: [['dec_dais', 29, 5, 0, 8], ['dec_tapestry', 31, 1, 0, 0], ['dec_banner_royal', 24, 1, 4, 4], ['dec_banner_royal', 39, 1, 4, 4], ['dec_portrait_king', 21, 1, 0, 6], ['dec_portrait_lady', 42, 1, 0, 6], ['dec_runner', 31, 8, 0, 0],
      ['dec_window', 4, 1, 0, 6], ['dec_window', 8, 1, 0, 6], ['dec_glass', 51, 1, 0, 2], ['dec_glass', 55, 1, 0, 2], ['dec_glass', 59, 1, 0, 2],
      ['dec_banner_royal', 25, 16, 4, 4], ['dec_banner_royal', 38, 16, 4, 4], ['dec_runner', 31, 19, 0, 0], ['dec_runner_s', 31, 26, 0, 16], ['dec_rug_red', 4, 27, 0, 8],
      ['dec_banner_red', 52, 16, 4, 2], ['dec_banner_blue', 58, 16, 4, 2], ['dec_shelf', 2, 16, 0, 4], ['dec_shelf', 8, 35, 0, 4],
      ['dec_banner_royal', 22, 35, 4, 4], ['dec_banner_royal', 41, 35, 4, 4], ['dec_runner_s', 31, 40, 0, 0], ['dec_painting', 50, 35, 0, 10]],
    exit: [31, 45], links: { k_up: ['castle_up', 26, 31], k_down: ['castle_down', 9, 6] } },
  castle_up: { n: 'Briarholt Keep · Upper floor', w: 52, h: 34, dark: .28,
    walls: [['v', 17, 3, 32], ['v', 34, 3, 32], ['h', 0, 51, 15]],
    doors: [[25, 15, 2, 3], [17, 24, 1, 2], [34, 24, 1, 2], [17, 8, 1, 2], [34, 8, 1, 2]],
    rooms: [['Royal Bedchamber', 1, 3, 16, 14, 'f'], ['Solar', 18, 3, 33, 14, 'f'], ['Isolde\'s Chamber', 35, 3, 50, 14, 'f'], ['Bath', 1, 18, 16, 32, 'mb'],
      ['Portrait Gallery', 18, 18, 33, 32, 'mb'], ['Map Room', 35, 18, 50, 32, 'f']],
    f: [['royalbed', 7, 6, 'k_bed', 'Rest'], ['wardrobe', 2, 7, 'k_wardrobe', 'Change clothes'], ['dresser', 12, 4], ['candles', 5, 5], ['candles', 11, 5], ['chair', 14, 11], ['plant', 1, 14], ['plant', 16, 14],
      ['fireplace', 24, 3], ['harp', 19, 6, 'k_harp', 'Play'], ['table_cloth', 24, 9], ['chair', 23, 9], ['chair', 27, 9], ['bookshelf', 30, 3, 'k_lore', 'Read'], ['plant', 18, 14], ['plant', 33, 14], ['candles', 21, 4],
      ['bed', 39, 6], ['wardrobe', 47, 7], ['dresser', 43, 4], ['candles', 37, 5], ['plant', 50, 14], ['chair', 42, 11],
      ['bath', 6, 22, 'k_bath', 'Bathe'], ['tub', 2, 21], ['candles', 11, 20], ['candles', 3, 26], ['plant', 15, 31], ['dresser', 12, 20],
      ['stairdown', 25, 32, 'k_down', 'Go downstairs'], ['armour', 19, 21], ['armour', 32, 21], ['pillar', 21, 28], ['pillar', 30, 28], ['plant', 18, 32], ['plant', 33, 32],
      ['wartable', 41, 25, 'k_map', 'Study the map'], ['chair', 40, 26], ['chair', 44, 26], ['bookshelf', 35, 18, 'k_lore', 'Read'], ['bookshelf', 48, 18, 'k_lore', 'Read'], ['candles', 38, 22], ['candles', 47, 22], ['armour', 50, 30]],
    d: [['dec_portrait_king', 4, 1, 0, 6], ['dec_window', 9, 1, 0, 6], ['dec_window', 14, 1, 0, 6], ['dec_rug_purple', 6, 9, 0, 0], ['dec_window', 20, 1, 0, 6], ['dec_portrait_lady', 28, 1, 0, 6], ['dec_rug_red', 23, 7, 0, 0],
      ['dec_window', 39, 1, 0, 6], ['dec_painting', 46, 1, 0, 10], ['dec_rug_green', 40, 9, 0, 0], ['dec_rug_blue', 5, 24, 0, 0],
      ['dec_portrait_king', 19, 16, 0, 2], ['dec_portrait_lady', 22, 16, 0, 2], ['dec_portrait_king', 28, 16, 16, 2], ['dec_portrait_lady', 31, 16, 0, 2], ['dec_runner_s', 25, 25, 0, 0],
      ['dec_banner_royal', 38, 16, 4, 4], ['dec_banner_royal', 46, 16, 4, 4], ['dec_tapestry', 41, 16, 0, -12]],
    links: { k_down: ['castle_in', 19, 41] } },
  castle_down: { n: 'Briarholt Keep · Cellars', w: 44, h: 30, dark: .5,
    walls: [['v', 21, 3, 28], ['h', 0, 43, 13]],
    doors: [[21, 7, 1, 2], [10, 13, 2, 3], [31, 13, 2, 3], [21, 22, 1, 2]],
    rooms: [['Wine Cellar', 1, 3, 20, 12, 'fl'], ['Treasury Vault', 22, 3, 42, 12, 'fl'], ['Dungeon', 1, 16, 20, 28, 'fl'], ['Crypt of the Kings', 22, 16, 42, 28, 'fl']],
    f: [['stairup', 8, 4, 'k_up', 'Go upstairs'], ['winerack', 2, 4], ['winerack', 12, 4], ['winerack', 15, 4], ['winerack', 18, 4], ['barrel', 1, 9], ['barrel', 2, 9], ['barrel', 1, 10], ['kegs', 6, 11], ['kegs', 14, 11], ['crate', 19, 11], ['lamp', 10, 8],
      ['hoard', 30, 7, 'k_hoard', 'Search'], ['chest', 24, 4, 'bank', 'Vault'], ['chest', 38, 4, 'bank', 'Vault'], ['candles', 28, 4], ['candles', 35, 4], ['hoard', 37, 10], ['armour', 22, 11], ['armour', 42, 11],
      ...[2, 3, 4, 5, 6, 7, 8, 12, 13, 14, 15, 16, 17, 18].map(x => ['cell', x, 20]), ['hay', 4, 17], ['hay', 15, 17], ['table', 8, 24], ['stool', 7, 24], ['lamp', 19, 24], ['barrel', 1, 28], ['crate', 19, 28],
      ['tomb', 25, 20, 'k_tomb', 'Read'], ['tomb', 31, 20, 'k_tomb', 'Read'], ['tomb', 37, 20, 'k_tomb', 'Read'], ['tomb', 31, 26, 'k_margit', 'Read'], ['candles', 24, 26], ['candles', 40, 26], ['pillar', 23, 23], ['pillar', 41, 23]],
    d: [['dec_banner_royal', 30, 1, 4, 4], ['dec_banner_royal', 34, 1, 4, 4], ['dec_rug_purple', 29, 8, 0, 0], ['dec_glass', 31, 14, 16, 2], ['dec_shelf', 3, 1, 0, 4]],
    links: { k_up: ['castle_in', 45, 42] } },
};
function genKeepFloor(id) {
  const P = KEEP_PLANS[id], m = newMap(id, P.w, P.h, 'fl');
  m.outdoor = false; m.indoor = true; m.noSeason = true; m.name = P.n; m.theme = 'indoor'; m.wall = 'stone'; m.inDark = P.dark; m.multiRoom = true; m.decals = P.d;
  const X = (x, y) => setT(m, x, y, 'x');
  for (let y = 0; y < P.h; y++) for (let x = 0; x < P.w; x++) if (y < 3 || x === 0 || x === P.w - 1 || y === P.h - 1) X(x, y);
  for (const [k, a, b, c] of P.walls) { if (k === 'v') for (let y = b; y <= c; y++) X(a, y); else for (let x = a; x <= b; x++) for (let y = c; y <= c + 2; y++) X(x, y); }
  for (const [n, x0, y0, x1, y1, fl] of P.rooms) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (getT(m, x, y) !== 'x') setT(m, x, y, fl);
  for (const [x, y, w, h] of P.doors) for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setT(m, x + i, y + j, 'fl'); // flagstones, not 'st' (natural rock: doorways looked like rubble)
  for (const [k, x, y, act, label] of P.f) putObj(m, x, y, { k: 'furn_' + k, fixed: 1, act, label });
  if (P.exit) m.warps.push({ x: P.exit[0], y: P.exit[1], w: 2, h: 1, to: 'castle', tx: (KEEP_X + KEEP_W / 2 + .5) * 16, ty: 19.7 * 16, dir: 0 });
  m.start = P.exit ? { x: (P.exit[0] + 1) * 16, y: (P.exit[1] - .6) * 16 } : { x: 8 * 16, y: 8 * 16 };
  placeResidents(m);
  return m;
}
const genKeep = () => genKeepFloor('castle_in');
const KI_H = KEEP_PLANS.castle_in.h;
const ROOMZ = KEEP_PLANS.castle_in.rooms.map(([n, x0, y0, x1, y1]) => ({ n, x0, y0, x1, y1 }));

/* walls for rooms with inner walls: a two-tile wall face wherever a wall has floor just below it */
pixRoomWalls = (f => function (x, m, cx, cy, M) {
  if (!m.multiRoom) return f(x, m, cx, cy, M);
  const P = (X, Y, W, H, col) => { x.fillStyle = col; x.fillRect(X, Y, W, H); };
  const pal = WALLPAL[m.wall] || WALLPAL.stone, isX = (X, Y) => inb(m, X, Y) && getT(m, X, Y) === 'x', open = (X, Y) => inb(m, X, Y) && !isX(X, Y);
  for (let j = -1; j <= CH; j++) for (let i = -1; i <= CH; i++) {
    const X = cx * CH + i, Y = cy * CH + j; if (!isX(X, Y)) continue;
    const bx = M + i * 32, by = M + j * 32, low = open(X, Y + 1), up = !low && isX(X, Y + 1) && open(X, Y + 2);
    if ((low || up) && X > 0 && X < m.w - 1) {
      for (let yy = 0; yy < 32; yy++) for (let xx = 0; xx < 32; xx++) {
        const ay = (up ? 0 : 32) + yy, ax = X * 32 + xx, row = ay / 6 | 0, j2 = ay % 6 === 5 || (ax + row * 5) % 12 === 0;
        P(bx + xx, by + yy, 1, 1, j2 ? pal.face[0] : ay % 6 === 0 ? pal.face[3] : pal.face[1 + (hsh((ax + row * 5) / 12 | 0, row + Y, 3) > .6 ? 1 : 0)]);
      }
      if (low) { P(bx, by + 28, 32, 4, pal.trim[0]); P(bx, by + 28, 32, 1, pal.trim[2]); P(bx, by + 32, 32, 3, 'rgba(20,10,8,.35)'); P(bx, by + 35, 32, 2, 'rgba(20,10,8,.15)'); }
      if (up) P(bx, by, 32, 2, 'rgba(10,6,8,.35)');
      if (open(X - 1, Y) || (low ? false : open(X - 1, Y + 1))) { P(bx, by, 2, 32, pal.face[3]); }
      if (open(X + 1, Y) || (low ? false : open(X + 1, Y + 1))) { P(bx + 30, by, 2, 32, pal.face[0]); }
      continue;
    }
    // the wall top: dark stone coping in 16 px blocks, lit on the top-left edges (art round: the walls between rooms read as black voids)
    for (let yy = 0; yy < 32; yy++) for (let xx = 0; xx < 32; xx++) {
      const ax = X * 32 + xx, ay = Y * 32 + yy, row = ay >> 4, bxk = (ax + (row & 1) * 8) >> 4, jx = (ax + (row & 1) * 8) & 15, jy = ay & 15;
      P(bx + xx, by + yy, 1, 1, jx === 15 || jy === 15 ? '#1c1820' : jx === 0 || jy === 0 ? '#4a4450' : hsh(bxk, row, 9) > .7 ? '#3a3440' : '#332e38');
    }
    if (open(X + 1, Y)) { P(bx + 28, by, 4, 32, pal.trim[1]); P(bx + 28, by, 1, 32, pal.trim[3]); }
    if (open(X - 1, Y)) { P(bx, by, 4, 32, pal.trim[1]); P(bx + 3, by, 1, 32, pal.trim[0]); }
    if (open(X, Y - 1)) P(bx, by, 32, 2, pal.trim[2]);
  }
  for (const [n, tx, ty, ox, oy] of m.decals || []) { const c = PIX.get(n); if (c) x.drawImage(c, M + (tx - cx * CH) * 32 + (ox || 0), M + (ty - cy * CH) * 32 + (oy || 0)); }
})(pixRoomWalls);

/* the room you walk into is named */
let KROOM = null;
EVT.on('map', () => { KROOM = null; });
function keepRoomTick() {
  const P = cur && KEEP_PLANS[cur.id]; if (!P) return;
  const tx = S.p.x / 16, ty = S.p.y / 16 - .2, r = P.rooms.find(([, x0, y0, x1, y1]) => tx >= x0 && tx < x1 + 1 && ty >= y0 && ty < y1 + 1);
  if (r && r !== KROOM) { KROOM = r; showBanner(r[0]); }
}

/* ---- the princess at home ---- */
OBJ.resident = { solid: 1, tall: 1, fixed: 1 };
function placeResidents(m) {
  for (let i = 0; i < m.o.length; i++) if (m.o[i] && m.o[i].k === 'resident') m.o[i] = null;
  const T = S && S.story, met = T && (T.flags.isoldeHome || (T.q.throne && (T.q.throne.c >= 2 || T.q.throne.done)));
  if (!met) return;
  { const st = typeof stepOf === 'function' && stepOf('throne'); if (st && st.who === 'isolde' && st.t === 'meet') return; } // the story places her for her scenes
  const night = S.time >= 1260 || S.time < 420, at = night ? ['castle_up', 42, 10] : (S.time < 720 ? ['castle_in', 34, 10] : S.time < 960 ? ['castle_up', 43, 28] : ['castle_in', 9, 11]);
  if (m.id !== at[0]) return; const [, x, y] = at;
  if (!getO(m, x, y)) m.o[y * m.w + x] = { k: 'resident', c: 'isolde', fixed: 1 };
}
const ISOLDE_CHAT = [
  'Margit grew oranges in the east glasshouse every winter. I used to steal them.',
  'Morcant\'s riders were seen on the Kingsholt road. They\'ll come here eventually. We should be ready.',
  'The walls are sound, mostly. A few ballistae on the towers wouldn\'t hurt.',
  'I read every book in that library when I was nine. Most of them twice. The one about drakes three times.',
  'You farm, you fight, you fix things. Margit would be unbearable about how proud she was.',
  'If you ever want to talk about the throne, I\'m listening. If not, that\'s fine too.',
  'The chapel bell still works. Don\'t ring it unless you want the whole valley to know I\'m here.',
];
const placeAllRes = () => { for (const id of ['castle_in', 'castle_up']) if (MAPS[id]) placeResidents(MAPS[id]); };
function chatIsolde() {
  const T = S.story; T.flags.isoldeChat = ((T.flags.isoldeChat || 0) + 1) % ISOLDE_CHAT.length;
  storyDialog([['isolde', ISOLDE_CHAT[T.flags.isoldeChat]]], { title: 'Briarholt' });
}

/* ---- the story ---- */
Object.assign(SCAST, {
  isolde: { n: 'Princess Isolde', P: HP(0, { skin: '#f0d0b0', hair: '#c8642a', hs: 'long', shirt: '#6a3a9a', pants: '#4a2470', robe: '#6a3a9a', cape: '#e8b830', crown: 1 }) },
  herald: { n: 'Royal Herald', P: HP(0, { skin: '#e0b48e', hair: '#3a2a1a', hs: 'short', shirt: '#6a3a9a', pants: '#2a2a32', hat: '#4a2470', cape: '#e8b830' }) },
});
I('briar_key', 'Briarholt Key', 'special', 0, 'artifact', '#c8a040', null, { quest: 1, desc: 'A heavy iron key with a stag on the bow. It opens the gate of Briarholt Castle' });
I('silver_hairpin', 'Silver Hairpin', 'special', 0, 'ring', '#d8dee4', null, { quest: 1, desc: 'Found in Briarholt\'s kitchen, beside a still-warm pot of stew' });
SOBJ.hearth = 'furn_stove';
STORIES.throne = {
  n: 'The Empty Throne', blurb: 'A princess in hiding, a realm without a king, and the castle where your grandmother was born.',
  start: () => !!(S.story && S.story.q.hollow && S.story.q.hollow.done), how: 'A royal herald is waiting at your farm.',
  ch: [
    { n: 'A Rider from Kingsholt', steps: [
      { t: 'meet', who: 'herald', at: 'farm:home', hint: 'A royal herald is waiting outside your home.', lines: L('herald', 'You are the farmer who walked out of the mine with the Hollow King\'s crown in pieces? Good.', 'The Regent Council of Valdmark sends the realm\'s thanks. King Oswin\'s curse is broken at last.', 'And a question. Princess Isolde, the late king\'s ward, vanished from Kingsholt a month ago.', 'If you hear anything, send word. Quietly. Some people want her found for the wrong reasons.', 'I ride on to Kingsholt, the capital, three days north of here. Your curator, Elias, served the old royal house. Tell him I came. He will want to know.') },
      { t: 'talk', who: 'elias', hint: 'Tell Elias at the museum about the herald.', lines: L('elias', 'A herald? Then it\'s time I showed you this. The last page of your grandmother\'s journal. I found it pressed inside a book of hers.', 'That seal in the corner is the stag and crown of King Oswin\'s house. Margit wasn\'t just a farmer. She was the king\'s younger daughter.', 'She fled the court when the crown began to hollow him out, and hid here as a farmer\'s wife.', 'She was born at Briarholt, the old summer castle beyond your south-east trees. Lord Ashcombe keeps its keys for the crown. Ask him.') },
      { t: 'talk', who: 'ashcombe', hint: 'Ask Lord Ashcombe about Briarholt.', give: { briar_key: 1 }, lines: L('ashcombe', 'So the curator finally worked it out. Yes. I\'ve kept Briarholt\'s keys for forty years. Margit made me promise.', 'Odd thing: my gamekeeper swears he saw smoke from the castle chimneys last week. Nobody has lived there since the old king.', 'Take the key. The way in is through the trees at the south-east corner of your farm. Mind the brambles.') },
    ], reward: { flag: 'briarOpen' } },
    { n: 'Smoke over Briarholt', steps: [
      { t: 'go', at: 'castle:gate', r: 90, hint: 'Go through the gap in the south-east trees of your farm to Briarholt Castle.' },
      { t: 'use', at: 'castle:hearth', obj: 'hearth', hint: 'Search the keep for whoever lit the fires. Try the kitchen.', give: { silver_hairpin: 1 }, lines: L('narr', 'The kitchen stove is still warm. A pot of stew, a single bowl, and beside it a silver hairpin with a stag on it.', 'Someone is living here, and they left in a hurry when they heard you at the gate.') },
      { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Find whoever is hiding in the keep. The throne room, perhaps.', lines: L('isolde', 'Stop right there! ...Oh. You\'re not one of Morcant\'s hunters. Hunters don\'t knock things over in kitchens.', 'And that\'s my hairpin. Wait. Those eyes. You\'re Margit\'s grandchild, aren\'t you?', 'She taught me my letters. Every summer, here at Briarholt, until the king forbade it.', 'I\'m Isolde. The council means to marry me to Duke Morcant and rule through him. I would rather eat this hairpin.', 'I need somewhere to hide, and someone who can swing a sword. Will you keep my secret?'),
        choices: [['I\'ll keep your secret.', { flag: 'isoldeTrust', v: 1, line: ['isolde', 'Thank you. Truly. Margit would have said yes too, and then made me weed her beans.'] }],
          ['The council is looking for you.', { flag: 'isoldeTrust', v: 0, line: ['isolde', 'I know. That\'s rather the point. Don\'t tell them, please. Not yet.'] }]] },
    ], reward: { gold: 1500 } },
    { n: 'A Castle for a Princess', steps: [
      { t: 'talk', who: 'ashcombe', pay: 30000, payFlag: 'castleOwned', ask: 'Thirty thousand for Briarholt: walls, glasshouses, the keep and all its keys.', hint: 'Buy Briarholt\'s deed from Lord Ashcombe (30,000g).', wait: 'Thirty thousand for Briarholt, walls, glasshouses and all. Come back when you have it.',
        lines: L('ashcombe', 'The princess? At Briarholt? ...I didn\'t hear that. My hearing is terrible these days.', 'The deed belongs to the crown, but the crown owes your family more than it can pay. There. Briarholt is yours.', 'Look after her. I mean the castle. Obviously.') },
      { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Tell Isolde that Briarholt is yours.', lines: L('isolde', 'It\'s yours? Then it\'s ours to defend.', 'The glasshouses still work: Margit grew oranges in the middle of winter. Plant anything you like in them, in any season.', 'Sleep in the royal bed if you want, it\'s far too big for me. The armoury chest is a fine place for valuables.', 'And Morcant\'s hunters will come for me. When they do, we\'ll be ready for them.') },
    ], reward: { gold: 2000, flag: 'isoldeHome' } },
    { n: 'The Hunters', steps: [
      { t: 'cond', test: () => false, hint: 'Isolde expects Duke Morcant\'s hunters to come for her. (This chapter arrives with the next update.)' },
    ] },
  ],
};
STORY_WHEN.throne = 'once The Hollow Crown is complete';

/* roles at Briarholt */
const CROLE = { 'castle:gate': ['castle', GATE, WY1 - 3], 'castle:hearth': ['castle_in', 8, 21], 'castle:throne': ['castle_in', 34, 9], 'castle:maproom': ['castle_up', 43, 28], 'castle:crypt': ['castle_down', 33, 25], 'castle:hall': ['castle_in', 32, 27] };
storyWhere = (f => function (role) { if (CROLE[role]) { const [map, x, y] = CROLE[role]; return MAPS[map] ? { map, x, y } : null; } return f(role); })(storyWhere);
npcWhere = (f => function (id) { if (id === 'isolde' && MAPS.castle_in) { for (const fl of ['castle_in', 'castle_up']) { const m = MAPS[fl], i = m.o.findIndex(o => o && o.k === 'resident'); if (i >= 0) return { map: fl, x: i % m.w, y: (i / m.w) | 0 }; } return { map: 'castle_in', x: 34, y: 10 }; } return f(id); })(npcWhere);

/* a story step can cost gold */
storyTalk = (f => function (npc) {
  storyState();
  for (const sid in STORIES) {
    const st = stepOf(sid); if (!st || st.who !== npc || !st.pay) continue;
    if (S.gold < st.pay) { storyDialog([[npc, st.wait || 'Come back with ' + st.pay.toLocaleString() + 'g.']], { title: STORIES[sid].n }); return true; }
    if (!st._sure) { // ask first: the gold goes only when you say so (playtest: 30,000g went on his first line)
      storyDialog([[npc, (st.ask || 'The price is ' + st.pay.toLocaleString() + 'g.') + ' Shall we settle it?']], { title: STORIES[sid].n,
        choices: [['Pay ' + st.pay.toLocaleString() + 'g', () => { st._sure = 1; storyTalk(npc); }], ['Not yet', () => {}]] });
      return true;
    }
    st._sure = 0; S.gold -= st.pay; if (st.payFlag) S.story.flags[st.payFlag] = 1; refreshCastle(); break;
  }
  return f(npc);
})(storyTalk);
storyAdvance = (f => function (sid) { const r = f(sid); refreshCastle(); placeAllRes(); return r; })(storyAdvance);

/* ---- doors and furniture ---- */
doorAction = (f => function (act, who_) {
  if (act === 'castle') {
    if (!castleOpen()) { toast('The great doors are barred from the inside.'); return; }
    return goMap('castle_in', 32 * 16, (KI_H - 1.6) * 16, 3);
  }
  if (act === 'cgh_W' || act === 'cgh_E') {
    if (!castleOwned()) { toast('The glasshouse is locked. Its beds are green with weeds.'); return; }
    const m = MAPS[act]; return goMap(act, m.start.x, m.start.y, 3);
  }
  return f(act, who_);
})(doorAction);
const KEEP_LORE = [
  'A History of Valdmark, vol. II: "Five provinces, one crown. When the crown failed, the provinces drifted like boats with their ropes cut."',
  'A pressed flower falls out of a book of hours. In the margin, in a child\'s hand: "Margit, aged 9. Isolde\'s grandmother\'s book. Do not touch."',
  'The Lineage of Oswin: a family tree. One branch has been scratched out with a knife, the name beneath it still just readable: Margit.',
  'Drakes of the Greyfang, a bestiary: "The great drakes nest above the snowline. Their eggs are warm to the touch for a hundred years."',
  'Siegecraft for the Careful Castellan: "A wall is only as good as the ballista on top of it and the cook who feeds the crew."',
  'The Tourney Rolls of Kingsholt list the champions of the Seven Banners. Sir Aldren\'s name appears three years running.',
  'A ledger of Briarholt\'s glasshouses: oranges, lemons, winter melons. "Never let the stove go out in Winter," underlined twice.',
];
objInteract = (f => function (m, x, y, o) {
  if (o.k === 'resident') return { label: 'Talk', fn: () => { if (!storyTalk(o.c)) chatIsolde(); } };
  if (o.act === 'k_bed') return { label: 'Rest', fn: () => openModal('Royal Bedchamber', [{ id: 'h', label: 'Rest', render: b => { b.append(el('p', { class: 'note' }, 'A canopy bed fit for a queen. The sheets smell of lavender.')); b.append(el('div', { class: 'acts wrap' }, el('button', { class: 'btn', on: () => { closeModal(); S.flags.wakeKeep = 1; endDay(false); } }, 'Sleep until morning'))); } }]) };
  if (o.act === 'k_lore') return { label: 'Read', fn: () => { S.flags.kLore = ((S.flags.kLore || 0) + 1) % KEEP_LORE.length; storyDialog([['narr', KEEP_LORE[S.flags.kLore]]], { title: 'Briarholt Library' }); } };
  if (o.act === 'k_throne') return { label: 'Sit', fn: () => storyDialog([['narr', castleOwned() ? 'You sit on the throne of Briarholt. It is very uncomfortable. Thrones are meant to be.' : 'You shouldn\'t. Not yet.']], { title: 'Throne Room' }) };
  if (o.act === 'k_up' || o.act === 'k_down') return { label: o.label, fn: () => { const L = KEEP_PLANS[m.id] && KEEP_PLANS[m.id].links[o.act]; if (L) { if (SFX.door) SFX.door(); goMap(L[0], (L[1] + .5) * 16, (L[2] + .8) * 16, o.act === 'k_up' ? 3 : 0); } } };
  if (o.act === 'k_bath') return { label: 'Bathe', fn: () => { if (S.flags.kBath === dayIndex()) { toast('The water has gone cold. Tomorrow.'); return; } S.flags.kBath = dayIndex(); S.p.st = maxST(); S.p.hp = maxHP(); toast('A hot bath. You feel like royalty. Energy restored.', 'lvl'); } };
  if (o.act === 'k_map') return { label: 'Study the map', fn: () => { storyDialog([['narr', 'Pins and painted markers cover the map of Valdmark: Kingsbridge, Greyhelm, Ashford, Saltmere, and far to the north, the capital. Someone has circled Briarholt in red ink.']], { title: 'Map Room', done: () => { if (typeof openMenu === 'function') openMenu('map'); } }); } };
  if (o.act === 'k_hoard') return { label: 'Search', fn: () => { if (S.flags.kHoard) { toast('Old coins and a few dull gems. You’ve already taken what matters.'); return; } S.flags.kHoard = 1; S.gold += 5000; give('ancient_coin', 3); give('ruby', 2); SFX.lvl(); toast('Beneath the coins: Margit’s old purse. +5000g, 3 ancient coins, 2 rubies.', 'lvl'); } };
  if (o.act === 'k_tomb') return { label: 'Read', fn: () => storyDialog([['narr', pickR(['"Here lies King Edric the Fair, who built the bridge at Kingsbridge and never once crossed it."', '"Queen Aveline. She held Briarholt through a winter siege and sent the besiegers soup."', '"King Oswin’s father, Aldous. The carving of his face has been chiselled away."'])]], { title: 'Crypt of the Kings' }) };
  if (o.act === 'k_margit') return { label: 'Read', fn: () => storyDialog([['narr', 'A newer tomb, carved with a stag and a sheaf of wheat. "Margit of Valdmark, Princess, who chose the field over the crown." The lid has never been sealed. The tomb is empty.']], { title: 'Crypt of the Kings' }) };
  if (o.act === 'k_harp') return { label: 'Play', fn: () => { if (typeof SFX !== 'undefined' && SFX.secret) SFX.secret(); toast('You pluck a few notes. The hall answers with an echo.'); } };
  if (o.act === 'k_altar') return { label: 'Pray', fn: () => {
    if (S.flags.kPray === dayIndex()) { toast('You\'ve already prayed today. The ember on the altar glows softly.'); return; }
    S.flags.kPray = dayIndex(); S.p.hp = maxHP(); if (typeof S.lives === 'number') S.lives = 3; SFX.lvl(); toast('The ember on the altar flares. You feel restored.', 'lvl'); } };
  return f(m, x, y, o);
})(objInteract);
/* sleeping in the royal bed wakes you there */
endDay = (f => function (fainted) {
  const r = f(fainted);
  for (const id of castleLand()) { const m = MAPS[id]; if (!m) continue; for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; const rr = o && { sprinkler: 1, qsprinkler: 2, isprinkler: 3 }[o.k]; if (rr) { const x = i % m.w, y = (i / m.w) | 0; for (let j = -rr; j <= rr; j++) for (let k = -rr; k <= rr; k++) { const s = m.soil[(y + j) * m.w + x + k]; if (s) s.wet = true; } } } }
  if (S.flags.wakeKeep && !fainted) { S.flags.wakeKeep = 0; goMap('castle_up', 8.5 * 16, 9 * 16, 0); }
  placeAllRes();
  return r;
})(endDay);

/* ---- maps: generated before the save is unpacked, the keep after the stories are placed ---- */
initMaps = (f => function () {
  MAPS.castle = genCastle(); MAPS.cgh_W = genCastleGH('W'); MAPS.cgh_E = genCastleGH('E');
  MAPS.castle_in = genKeep(); MAPS.castle_up = genKeepFloor('castle_up'); MAPS.castle_down = genKeepFloor('castle_down');
  f();
  refreshCastle();
})(initMaps);
EVT.on('tick', n => { if (n % 2 === 0) keepRoomTick(); if (n % 50 === 0 && cur && !KEEP_PLANS[cur.id]) placeAllRes(); });
/* rooms use theme 'indoor', which the plain ground fallback (drawn while a big room's chunks are still painting) doesn't know */
groundStyle = (f => function (k, sea, theme) { if (k === 'fl') return { base: '#8e8678', d: '#7e766a', dd: '#4e4840', l: '#b4ac9a', kind: 'stone' }; if (k === 'mb') return { base: '#d8d0c4', d: '#aaa29c', dd: '#7e7670', l: '#f4f0e6', kind: 'stone' }; return f(k, sea, theme && !CAVE[theme] && (k === 'c' || k === 'xw') ? 'earth' : theme); })(groundStyle);
