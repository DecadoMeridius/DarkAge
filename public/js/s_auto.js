/* ================= Phase 8: automation and production =================
   PIECES (all built at the field kit or anvil, placed on farm maps):
   - Conveyor: placed facing the way you face; interact to rotate. Carries one item per
     tile, moving one tile per tick. Needs power: a windmill or waterwheel within 7 tiles.
   - Sorter: a conveyor with a gate. Interact while holding an item to set its filter:
     matching items go straight on, everything else turns right. Empty hands rotate it.
   - Storage crate: holds anything. Belts pointing in fill it; belts leading away empty it.
   - Smelter (ore -> bars) and charcoal kiln (wood -> charcoal) burn fuel; the mill (power,
     no fuel) grinds wheat to flour and hay to fibre; the compost bin turns fibre into compost.
     A station takes inputs and fuel from belts or by hand, works on the tick, holds its
     output, and pushes it onto any belt leading away.
   - Windmill (works anywhere) and waterwheel (must touch water) power everything nearby.
   FUEL: burn ticks per item in FUEL. A station only works while it has fuel.
   Farm maps keep running while you are elsewhere and catch up overnight.
   HORSE TOOLS: ride a horse (R) with a plough, seed drill or harrow selected; every tile
   you cross is worked three wide (till / sow the first seed you carry / clear weeds and grass). */

/* ---- items and recipes ---- */
I('charcoal', 'Charcoal', 'mat', 30, 'ore', '#2a2624', null, {}); I('flour', 'Flour', 'mat', 40, 'bread', '#f0e6cc', null, {});
const AUTO_PLACE = [['conveyor', 'Conveyor', 20], ['sorter', 'Sorter', 60], ['splitter', 'Splitter', 60], ['oven', 'Bread Oven', 300], ['triphammer', 'Trip Hammer', 900], ['treadwheel', 'Treadwheel', 400], ['channel', 'Water Channel', 15], ['storage', 'Storage Crate', 80], ['smelter', 'Smelter', 400], ['kiln', 'Charcoal Kiln', 200], ['mill', 'Mill', 500], ['compostbin', 'Compost Bin', 80], ['windmill', 'Windmill', 900], ['waterwheel', 'Waterwheel', 700]];
for (const [id, n, p] of AUTO_PLACE) { I(id, n, 'place', p, 'obj', null, null, { place: id }); OBJ[id] = { solid: ['conveyor', 'sorter', 'splitter', 'channel'].includes(id) ? 0 : 1, place: 1, tall: !['conveyor', 'sorter', 'splitter', 'channel', 'storage', 'compostbin'].includes(id), auto: id !== 'channel' }; }
FLAT.add('conveyor'); FLAT.add('sorter'); FLAT.add('splitter'); FLAT.add('channel');
for (const [id, n, sh_, c] of [['cart', 'Horse Cart', 'chest', '#a8743f'], ['plough', 'Horse Plough', 'hoe', '#8a8a94'], ['seeddrill', 'Seed Drill', 'seed', '#b07c4c'], ['harrow', 'Harrow', 'pick', '#7a5030']]) I(id, n, 'implement', 600, sh_, c, '#5a3a22', { desc: 'Select it while riding a horse on your farm.' });
SINGLE.add('implement');
RC.push(['conveyor', 4, { wood: 3, fiber: 4 }, 'bench'], ['sorter', 2, { wood: 3, fiber: 4, copper_bar: 1 }, 'bench'], ['storage', 1, { wood: 25 }, 'bench'],
  ['kiln', 1, { stone: 20, clay: 15 }, 'bench'], ['compostbin', 1, { wood: 15 }, 'bench'], ['smelter', 1, { stone: 40, clay: 10, iron_bar: 2 }, 'anvil'],
  ['mill', 1, { stone: 30, wood: 30, iron_bar: 2 }, 'anvil'], ['windmill', 1, { wood: 60, cloth: 2, iron_bar: 4 }, 'anvil'], ['waterwheel', 1, { wood: 40, iron_bar: 3 }, 'anvil'],
  ['plough', 1, { iron_bar: 3, wood: 10 }, 'anvil'], ['cart', 1, { wood: 40, iron_bar: 2 }, 'anvil'], ['splitter', 2, { wood: 3, fiber: 4, copper_bar: 1 }, 'bench'], ['oven', 1, { stone: 25, clay: 20 }, 'bench'], ['triphammer', 1, { wood: 40, iron_bar: 8 }, 'anvil'], ['treadwheel', 1, { wood: 50, iron_bar: 2 }, 'anvil'], ['channel', 5, { stone: 6 }, 'bench'], ['seeddrill', 1, { iron_bar: 2, wood: 15 }, 'anvil'], ['harrow', 1, { iron_bar: 2, wood: 10 }, 'anvil']);

const FUEL = { wood: 8, hardwood: 14, charcoal: 24, coal: 36 };
// station recipes: in {item: n}, out [item, n], ticks
const SMELT = RC.filter(r => r[3] === 'furnace' && IT[r[0]] && IT[r[0]].t === 'bar').map(r => ({ in: Object.fromEntries(Object.entries(r[2]).filter(([k]) => k !== 'coal')), out: [r[0], r[1]], ticks: 10 })).filter(r => Object.keys(r.in).length);
const STATIONS = {
  smelter: { fuel: 1, recipes: SMELT },
  kiln: { fuel: 1, recipes: [{ in: { wood: 4 }, out: ['charcoal', 1], ticks: 8 }] },
  mill: { power: 1, recipes: [{ in: { wheat: 2 }, out: ['flour', 1], ticks: 6 }, { in: { hay: 1 }, out: ['fiber', 2], ticks: 4 }] },
  compostbin: { recipes: [{ in: { fiber: 5 }, out: ['compost', 1], ticks: 30 }] },
  oven: { fuel: 1, recipes: [{ in: { flour: 2 }, out: ['bread', 1], ticks: 8 }] },
  triphammer: { power: 1, recipes: [] }, // set per hammer: o.recipe = index into RC
};
const CAP = 40; // per input stack, per output stack, per fuel stack
const isAuto = o => o && OBJ[o.k] && OBJ[o.k].auto;
const BELTS = new Set(['conveyor', 'sorter', 'splitter']), BELT_SPEED = {}, BELT_FREE = new Set(), STORE = new Set(['storage']), ACCEPT = {}, DIRPLACE = new Set(['conveyor', 'sorter', 'splitter', 'channel']); // extended by v_tiers.js
const isBelt = o => o && BELTS.has(o.k);
const isMach = o => o && OBJ[o.k] && OBJ[o.k].mach; // the artisan machines (keg, jar, loom...)
const hammerRecipe = o => { const r = RC[o.recipe]; return r ? { in: r[2], out: [r[0], r[1]], ticks: 12 } : null; };
const recipesOf = o => o.k === 'triphammer' || o.k === 'powerhammer' ? [hammerRecipe(o)].filter(Boolean) : STATIONS[o.k] ? STATIONS[o.k].recipes : [];
const usesInput = (o, id) => recipesOf(o).some(r => r.in[id]);
const sum = o => Object.values(o || {}).reduce((a, b) => a + b, 0);

/* ---- accepting items ---- */
function accept(o, id, n = 1, dry) {
  if (ACCEPT[o.k]) return ACCEPT[o.k](o, id, n, dry);
  if (STORE.has(o.k)) { if (!dry) { o.inv = o.inv || {}; o.inv[id] = (o.inv[id] || 0) + n; } return true; }
  if (isMach(o)) { if (o.out || o.item) return false; const r = artisanFor(o.k, id); if (!r) return false; if (!dry) { o.item = id; o.out = r[0]; o.left = r[1]; } return true; }
  if (o.k === 'treadwheel') { if (id !== 'hay' || ((o.fuel || {}).hay || 0) >= CAP) return false; if (!dry) { o.fuel = o.fuel || {}; o.fuel.hay = (o.fuel.hay || 0) + n; } return true; }
  const st = STATIONS[o.k]; if (!st) return false;
  if (usesInput(o, id) && ((o.in || {})[id] || 0) + n <= CAP) { if (!dry) { o.in = o.in || {}; o.in[id] = (o.in[id] || 0) + n; } return true; }
  if (st.fuel && FUEL[id] && ((o.fuel || {})[id] || 0) + n <= CAP) { if (!dry) { o.fuel = o.fuel || {}; o.fuel[id] = (o.fuel[id] || 0) + n; } return true; }
  return false;
}

/* ---- power ---- */
function powered(m, x, y) {
  for (const p of m.power || []) if (Math.max(Math.abs(p[0] - x), Math.abs(p[1] - y)) <= (p[2] || 7)) return true;
  return false;
}
function scanPower(m) {
  m.power = [];
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue; const x = i % m.w, y = i / m.w | 0;
    if (o.k === 'windmill') m.power.push([x, y, 7]);
    if (o.k === 'treadwheel' && (o.burn > 0 || (o.fuel || {}).hay)) m.power.push([x, y, 5]);
    if (o.k === 'waterwheel' && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inb(m, x + dx, y + dy) && TER[getT(m, x + dx, y + dy)].water)) m.power.push([x, y, 9]); }
  if (typeof scanPowerExtra === 'function') scanPowerExtra(m);
}

/* ---- one simulation tick for a map ---- */
function autoTick(m) {
  if (!m || !m.o) return;
  if (!m.power || TICK.n % 10 === 0) scanPower(m);
  const W = m.w, moved = new Set();
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (isMach(o) && o.out && !(o.left > 0)) pushMach(m, o, i % W, i / W | 0); }
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!isAuto(o)) continue; const x = i % W, y = i / W | 0;
    if (STATIONS[o.k]) stationTick(m, o, x, y);
    if (o.k === 'treadwheel') { if (!(o.burn > 0) && (o.fuel || {}).hay) { o.fuel.hay--; if (!o.fuel.hay) delete o.fuel.hay; o.burn = 20; } if (o.burn > 0) o.burn--; o.on = o.burn > 0 ? 1 : 0; }
    if ((STORE.has(o.k) && sum(o.inv)) || sum(o.out)) pushOut(m, o, x, y);
  }
  // belts: move from the far end backwards so a full line advances together
  // faster belts get extra rounds; a wooden chute only moves every other tick
  for (let round = 0; round < 3; round++) { if (round) moved.clear();
  const belts = []; for (let i = 0; i < m.o.length; i++) { const b = m.o[i]; if (isBelt(b) && b.item && (BELT_SPEED[b.k] || 1) > round && (b.k !== 'chute' || TICK.n % 2 === 0)) belts.push(i); }
  for (let pass = 0; pass < 2; pass++) for (const i of belts) {
    const o = m.o[i]; if (!o || !o.item || moved.has(i)) continue; const x = i % W, y = i / W | 0;
    if (!BELT_FREE.has(o.k) && !powered(m, x, y)) continue;
    let d = o.d; if (o.k === 'sorter' && o.filter && o.item !== o.filter) d = RIGHT[o.d];
    if (o.k === 'splitter') { if (o.next === undefined) o.next = 0; d = o.next ? RIGHT[o.d] : o.d; }
    const nx = x + DIRV[d][0], ny = y + DIRV[d][1]; if (!inb(m, nx, ny)) continue;
    const ni = ny * W + nx, n = m.o[ni];
    if (isBelt(n)) { if (!n.item && !moved.has(ni)) { n.item = o.item; o.item = null; moved.add(ni); n.slideFrom = d; n.slideT = TICK.n; if (o.k === 'splitter') o.next = 1 - o.next; } }
    else if ((isAuto(n) || isMach(n)) && accept(n, o.item)) { o.item = null; if (o.k === 'splitter') o.next = 1 - o.next; }
  }
  }
}
const RIGHT = [1, 3, 0, 2]; // turning right from facing down/left/right/up (DIRV order)
function pushMach(m, o, x, y) {
  for (let d = 0; d < 4; d++) { const b = getO(m, x + DIRV[d][0], y + DIRV[d][1]); if (isBelt(b) && b.d === d && !b.item) { b.item = o.out; o.out = null; o.item = null; o.left = 0; return; } }
}
function stationTick(m, o, x, y) {
  const st = STATIONS[o.k];
  if (st.power && !powered(m, x, y)) { o.on = 0; return; }
  const r = recipesOf(o).find(r => Object.entries(r.in).every(([k, n]) => ((o.in || {})[k] || 0) >= n) && ((o.out || {})[r.out[0]] || 0) + r.out[1] <= CAP);
  if (!r) { o.on = 0; o.prog = 0; return; }
  if (st.fuel && !(o.burn > 0)) { const f = Object.keys(o.fuel || {}).find(k => o.fuel[k] > 0); if (!f) { o.on = 0; return; } o.fuel[f]--; if (!o.fuel[f]) delete o.fuel[f]; o.burn = Math.round(FUEL[f] * (st.fuelx || 1)); }
  o.on = 1; if (st.fuel) o.burn--;
  o.prog = (o.prog || 0) + 1;
  if (o.prog < Math.max(1, Math.round(r.ticks * (st.mult || 1)))) return; // faster stations have a lower mult
  o.prog = 0; for (const [k, n] of Object.entries(r.in)) { o.in[k] -= n; if (!o.in[k]) delete o.in[k]; }
  o.out = o.out || {}; o.out[r.out[0]] = (o.out[r.out[0]] || 0) + r.out[1] * (st.yield || 1);
}
function pushOut(m, o, x, y) {
  for (let d = 0; d < 4; d++) { // a belt next to it whose direction points away from it
    const bx = x + DIRV[d][0], by = y + DIRV[d][1]; if (!inb(m, bx, by)) continue; const b = getO(m, bx, by);
    if (!isBelt(b) || b.d !== d || b.item) continue;
    const src = STORE.has(o.k) ? o.inv : o.out, keys = Object.keys(src || {}).filter(k => src[k] > 0); if (!keys.length) return;
    const k = keys[(o.rr = ((o.rr || 0) + 1) % keys.length)]; // round-robin, so a mixed crate (ore + fuel) sends both
    b.item = k; src[k]--; if (!src[k]) delete src[k];
  }
}
const farmMaps = () => ['farm', ...(typeof ownedPlots === 'function' ? ownedPlots() : [])].map(id => MAPS[id]).filter(Boolean);
EVT.on('tick', () => { if (!S || PAUSED) return; for (const m of farmMaps()) autoTick(m); });
const _endDayA = endDay;
endDay = function (f) { for (let n = 0; n < 300; n++) for (const m of farmMaps()) autoTick(m); _endDayA(f); }; // the night's work

/* ---- placing, rotating, removing ---- */
const _useItemA = useItem;
useItem = function (id) {
  const it = IT[id];
  if (it && it.t === 'implement') { toast(S.mounted ? 'Ride over your field to use the ' + it.n.toLowerCase() + '.' : 'Ride a horse (R) to pull the ' + it.n.toLowerCase() + '.'); return; }
  if (it && it.t === 'place' && DIRPLACE.has(it.place) && has(id)) {
    const m = cur, [tx, ty] = faceTile();
    if (!m.farm) { toast('Place that on your farm.'); return; }
    if (getO(m, tx, ty) || m.solidB[ty * m.w + tx] || TER[getT(m, tx, ty)].solid || TER[getT(m, tx, ty)].water) { toast('Something is in the way.'); return; }
    setO(m, tx, ty, it.place === 'channel' ? { k: 'channel', v: S.p.dir === 0 || S.p.dir === 3 ? 1 : 0 } : { k: it.place, d: S.p.dir }); take(id); SFX.ok(); if (it.place === 'channel') waterChannels(m); return;
  }
  return _useItemA(id);
};
const _delObjA = delObj;
delObj = function (m, x, y) {
  const [, , o] = mainOf(m, x, y);
  if (isAuto(o)) { for (const bag of [o.inv, o.in, o.fuel, o.out]) for (const k in bag || {}) { const [id, q] = parseK(k); give(id, bag[k], q, true); } if (o.item) give(o.item, 1, 0, true); }
  return _delObjA(m, x, y);
};
const _objInteractA = objInteract;
objInteract = function (m, x, y, o) {
  if (isBelt(o)) {
    const k = selKind(), holding = k && IT[k] && !isTool(k);
    if (o.k === 'sorter' && holding) return { label: 'Filter', fn: () => { o.filter = k; toast('Sorter: ' + IT[k].n + ' goes straight, everything else turns right.'); } };
    return { label: 'Rotate', fn: () => { o.d = [1, 3, 0, 2][o.d]; SFX.pop(); } }; // clockwise: down, left, up, right
  }
  if (o.k === 'storage') return { label: S.mounted && selKind() === 'cart' ? 'Unload cart' : 'Open', fn: () => S.mounted && selKind() === 'cart' ? unloadCart(o) : openCrate(o) };
  if (o.k === 'triphammer') return { label: 'Set up', fn: () => openHammer(o, m, x, y) };
  if (o.k === 'treadwheel') return { label: 'Feed', fn: () => { let n = 0; while (has('hay') && accept(o, 'hay', 1, true) && n < 40) { take('hay'); accept(o, 'hay'); n++; } toast(n ? 'Fed ' + n + ' hay. It powers things within 7 tiles while it has hay.' : 'The treadwheel runs on hay.'); } };
  if (o.k === 'channel') return { label: 'Turn', fn: () => { o.v = o.v ? 0 : 1; waterChannels(m); } };
  if (STATIONS[o.k]) return { label: 'Open', fn: () => openStation(o, m, x, y) };
  if (o.k === 'windmill' || o.k === 'waterwheel') return { label: 'Inspect', fn: () => { scanPower(m); toast(m.power.some(p => p[0] === x && p[1] === y) ? 'Turning. Powers everything within 7 tiles.' : 'Not turning: a waterwheel must touch water.'); } };
  return _objInteractA(m, x, y, o);
};

/* ---- windows ---- */
function slotList(title, bag, onClick, empty) {
  const box = el('div', null, el('h3', null, title)), g = el('div', { class: 'grid' });
  for (const k in bag || {}) { const [id, q] = parseK(k), c = el('button', { class: 'cell f-slot', title: IT[id].n, on: () => onClick(k) }, icon(id, 40, q), el('b', null, bag[k])); g.append(c); }
  box.append(g.children.length ? g : el('p', { class: 'note' }, empty)); return box;
}
function packPicker(filter, onPick) {
  const g = el('div', { class: 'grid' });
  S.pack.forEach((s, i) => { if (!s) return; const [id, q] = parseK(s.k); if (filter && !filter(id)) return; g.append(el('button', { class: 'cell f-slot', title: IT[id].n, on: () => onPick(i, s) }, icon(id, 40, q), el('b', null, s.n))); });
  return g.children.length ? g : el('p', { class: 'note' }, 'Nothing in your backpack fits here.');
}
function openStation(o, m, x, y) {
  const st = STATIONS[o.k];
  openModal(IT[o.k].n, [{ id: 's', label: 'Station', render: b => {
    const need = st.recipes.map(r => Object.entries(r.in).map(([k, n]) => n + ' ' + IT[k].n.toLowerCase()).join(' + ') + ' → ' + r.out[1] + ' ' + IT[r.out[0]].n.toLowerCase()).join(' · ');
    b.append(el('p', { class: 'note' }, need + '.' + (st.fuel ? ' Burns wood, hardwood, charcoal or coal.' : '') + (st.power ? (powered(m, x, y) ? ' Powered.' : ' Needs a windmill or waterwheel within 7 tiles.') : '') + ' ' + (o.on ? 'Working…' : 'Idle.')));
    const row = el('div', { class: 'stationrow' });
    row.append(slotList('Input', o.in, k => { const [id, q] = parseK(k); GIVE_NO_DROP = true; const left = give(id, o.in[k], q, true); GIVE_NO_DROP = false; if (left) o.in[k] = left; else delete o.in[k]; refresh(); }, 'Empty'));
    if (st.fuel) row.append(slotList('Fuel' + (o.burn > 0 ? ' (burning)' : ''), o.fuel, k => { GIVE_NO_DROP = true; const left = give(k, o.fuel[k], 0, true); GIVE_NO_DROP = false; if (left) o.fuel[k] = left; else delete o.fuel[k]; refresh(); }, 'No fuel'));
    row.append(slotList('Output', o.out, k => { const [id, q] = parseK(k); GIVE_NO_DROP = true; const left = give(id, o.out[k], q, true); GIVE_NO_DROP = false; if (left) o.out[k] = left; else delete o.out[k]; refresh(); }, 'Nothing made yet'));
    b.append(row, el('h3', null, 'Put in from your backpack'), packPicker(id => usesInput(o, id) || (st.fuel && FUEL[id]), (i, s) => { const [id] = parseK(s.k); let n = 0; while (S.pack[i] && accept(o, id, 1, true)) { accept(o, id, 1); packRemove(s.k, 1); n++; if (n > 99) break; } if (!n) toast('That slot is full.', 'bad'); refresh(); }));
  } }]);
}
function openCrate(o) {
  o.inv = o.inv || {};
  openModal('Storage Crate', [{ id: 'c', label: 'Crate', render: b => {
    b.append(slotList('In the crate (click to take)', o.inv, k => { const [id, q] = parseK(k); GIVE_NO_DROP = true; const left = give(id, o.inv[k], q, true); GIVE_NO_DROP = false; if (left) o.inv[k] = left; else delete o.inv[k]; refresh(); }, 'Empty'));
    b.append(el('h3', null, 'Your backpack (click to store)'), packPicker(null, (i, s) => { o.inv[s.k] = (o.inv[s.k] || 0) + s.n; S.pack[i] = null; touched(); refresh(); }));
  } }]);
}

/* ---- sprites and belt items ---- */
const _objSpriteA = objSprite;
objSprite = function (o, season) {
  const f = Math.floor(gameT * 4) % 2;
  if (isBelt(o)) return beltSprite(o, cur && (cur.power || []).length ? f : 0); // belts scroll while the farm has power
  if (o.k === 'channel') return PIX.get('channel_' + (o.v ? 'v' : 'h') + '.' + (o.wet ? 1 : 0));
  if (o.k === 'oven' || o.k === 'triphammer' || o.k === 'treadwheel') return PIX.get(o.k + '.' + (o.on ? (o.k === 'oven' ? 1 : f) : 0));
  if (o.k === 'smelter' || o.k === 'kiln') return PIX.get(o.k + '.' + (o.on ? 1 : 0));
  if (o.k === 'mill') return PIX.get('mill.' + (o.on ? f : 0));
  if (o.k === 'windmill' || o.k === 'waterwheel') return PIX.get(o.k + '.' + f);
  if (o.k === 'storage' || o.k === 'compostbin') return PIX.get(o.k);
  return _objSpriteA(o, season);
};
const BELTC = {};
function beltSprite(o, f) { // the belt with its item baked in, cached per direction/frame/item, so it draws on the floor layer under the player
  const key = o.k + o.d + f + (o.item || ''); if (BELTC[key]) return BELTC[key];
  const base = PIX.get(o.k + '_' + (o.d || 0) + '.' + f); if (!base || !o.item) return base;
  const ic = itemIcon(parseK(o.item)[0]), c = mk(32, 32, x => { x.drawImage(base, 0, 0); if (ic) x.drawImage(ic, 7, 7, 18, 18); }); c.ww = c.wh = 16;
  return BELTC[key] = c;
}

/* ---- horse-drawn tools ---- */
let lastHorseTile = null;
function implementTick() {
  const k = selKind(), m = cur;
  if (!S.mounted || !m || !m.farm || !['plough', 'seeddrill', 'harrow'].includes(k)) { lastHorseTile = null; return; }
  let tx = Math.floor(S.p.x / 16), ty = Math.floor((S.p.y - 2) / 16);
  if (k === 'harrow') { tx += DIRV[S.p.dir][0]; ty += DIRV[S.p.dir][1]; } // weeds are solid: the harrow clears the strip ahead so the horse can pass
  const key = tx + ',' + ty;
  if (key === lastHorseTile && k !== 'harrow') return; lastHorseTile = key;
  const side = S.p.dir === 1 || S.p.dir === 2 ? [0, 1] : [1, 0], tiles = [-1, 0, 1].map(s => [tx + side[0] * s, ty + side[1] * s]);
  let did = 0;
  for (const [x, y] of tiles) {
    if (!inb(m, x, y)) continue; const i = y * m.w + x, t = getT(m, x, y), o = getO(m, x, y);
    if (k === 'plough' && (t === 'g' || t === 'd') && !o && !m.solidB[i] && !m.soil[i]) { m.soil[i] = { wet: S.weather === 'rain' && m.outdoor, crop: null }; did++; }
    if (k === 'harrow' && o && (o.k === 'weed' || o.k === 'tgrass')) { cutGrass(m, x, y, o); did++; }
    if (k === 'seeddrill' && m.soil[i] && !m.soil[i].crop) {
      const seed = S.pack.find(s => s && IT[parseK(s.k)[0]] && IT[parseK(s.k)[0]].t === 'seed' && (m.noSeason || CROPS[IT[parseK(s.k)[0]].crop].s.includes(S.season)));
      if (seed) { m.soil[i].crop = { k: IT[parseK(seed.k)[0]].crop, age: 0 }; packRemove(seed.k, 1); did++; }
    }
  }
  if (did) { addXP('farming', did * .5); if (k !== 'seeddrill') noiseBurst(.05, .03, 300); }
}
const _updateA = update;
update = function (dt) { if (!PAUSED && !TITLE && S && S.p) implementTick(); _updateA(dt); };

/* ---- trip hammer: a powered anvil that makes one chosen recipe from bars ---- */
function openHammer(o, m, x, y) {
  openModal('Trip Hammer', [{ id: 'h', label: 'Hammer', render: b => {
    const r = RC[o.recipe];
    b.append(el('p', { class: 'note' }, (powered(m, x, y) ? 'Powered. ' : 'Needs a windmill, waterwheel or treadwheel within 7 tiles. ') + (r ? 'Making ' + IT[r[0]].n + ' from ' + Object.entries(r[2]).map(([k, n]) => n + ' ' + IT[k].n.toLowerCase()).join(' + ') + '. Feed it by belt or by hand; finished pieces go onto a belt leading away.' : 'Choose what it should make.')));
    const row = el('div', { class: 'stationrow' });
    row.append(slotList('Input', o.in, k => { GIVE_NO_DROP = true; const left = give(k, o.in[k], 0, true); GIVE_NO_DROP = false; if (left) o.in[k] = left; else delete o.in[k]; refresh(); }, 'Empty'));
    row.append(slotList('Output', o.out, k => { const [id, q] = parseK(k); GIVE_NO_DROP = true; const left = give(id, o.out[k], q, true); GIVE_NO_DROP = false; if (left) o.out[k] = left; else delete o.out[k]; refresh(); }, 'Nothing made yet'));
    b.append(row);
    if (r) b.append(el('h3', null, 'Put in from your backpack'), packPicker(id => usesInput(o, id), (i, sl) => { const [id] = parseK(sl.k); let n = 0; while (S.pack[i] && accept(o, id, 1, true) && n < 99) { accept(o, id); packRemove(sl.k, 1); n++; } refresh(); }));
    const sel = el('select'); sel.append(el('option', { value: '' }, '— choose —'));
    RC.forEach((rc, i) => { if (rc[3] === 'anvil' && IT[rc[0]]) { const op = el('option', { value: i }, IT[rc[0]].n); if (o.recipe === i) op.selected = true; sel.append(op); } });
    sel.onchange = () => { o.recipe = sel.value === '' ? undefined : +sel.value; o.prog = 0; refresh(); };
    b.append(el('div', { class: 'acts' }, el('b', null, 'Make: '), sel));
  } }]);
}

/* ---- water channels: a channel touching water (or a well) carries it along connected
   channels; soil next to a wet channel is watered each morning ---- */
function waterChannels(m) {
  const W = m.w, wet = new Set(), q = [];
  const isCh = (x, y) => inb(m, x, y) && m.o[y * W + x] && m.o[y * W + x].k === 'channel';
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o || o.k !== 'channel') continue; o.wet = 0; const x = i % W, y = i / W | 0;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => inb(m, x + dx, y + dy) && (TER[getT(m, x + dx, y + dy)].water || ['fwell', 'well'].includes((mainOf(m, x + dx, y + dy)[2] || {}).k)))) { wet.add(i); q.push([x, y]); }
  }
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, ni = ny * W + nx; if (isCh(nx, ny) && !wet.has(ni)) { wet.add(ni); q.push([nx, ny]); } } }
  for (const i of wet) m.o[i].wet = 1;
  return wet;
}
function waterFromChannels() {
  for (const m of farmMaps()) {
    const wet = waterChannels(m), W = m.w;
    for (const i of wet) { const x = i % W, y = i / W | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const s = m.soil[(y + dy) * W + x + dx]; if (s && !s.wet) s.wet = true; } }
  }
}
const _endDayA2 = endDay;
endDay = function (f) { _endDayA2(f); try { waterFromChannels(); } catch (e) { console.error(e); } };

/* ---- horse cart: while riding with the cart selected, what you pick up goes in the cart;
   interact with a storage crate to unload it ---- */
const CART_CAP = 400;
const _giveA = give;
give = function (id, n = 1, q = 0, quiet) {
  if (S && S.mounted && selKind() === 'cart' && id !== '$' && IT[id] && !GIVE_NO_DROP) {
    S.cart = S.cart || {}; const room = CART_CAP - sum(S.cart), put = Math.min(room, n), k = keyOf(id, QUAL_T.has(IT[id].t) ? q : 0);
    if (put > 0) { S.cart[k] = (S.cart[k] || 0) + put; if (!quiet) floatText(S.p.x, S.p.y - 34, '+' + put + ' ' + IT[id].n + ' (cart)', '#fff6d8'); }
    return put < n ? _giveA(id, n - put, q, quiet) : 0;
  }
  return _giveA(id, n, q, quiet);
};
function unloadCart(o) { o.inv = o.inv || {}; let n = 0; for (const k in S.cart || {}) { o.inv[k] = (o.inv[k] || 0) + S.cart[k]; n += S.cart[k]; } S.cart = {}; toast(n ? 'Unloaded ' + n + ' items into the crate.' : 'The cart is empty.'); SFX.ok(); }
const _hudTickA = hudTick;
hudTick = function (dt) { _hudTickA(dt); if (S && !TITLE && $('#pL') && S.mounted && selKind() === 'cart') $('#pL').innerHTML = '<kbd>Cart</kbd>' + sum(S.cart) + ' / ' + CART_CAP + ' (interact with a storage crate to unload)'; };
