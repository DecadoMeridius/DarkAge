/* ================= Phase 5: land and economy =================
   PLOTS: three plots border the farm (west, south, south-west). Each is generated from
   the world seed plus its grid position: a terrain type (meadow, woodland, rocky,
   lakeside, hillside, marsh), a soil quality that scales crop growth, resources, and
   0-2 special features (ruin with a chest, hot spring, fairy ring, ancient tree), some
   hidden until surveyed. Owned plots are their own farm maps (id 'plot_<dir>'), saved
   like the farm, and open into the farm through a gap in the tree line.
   LANDOWNER: Lord Ashcombe's manor in the village sells deeds: buy outright, lease
   (a quarter up front, then a weekly fee; missing a payment ends the lease and closes
   the plot again), or survey (a small fee reveals hidden features).
   SHOPS: every shop list has stock that restocks each morning and prices that drift
   week to week. Selling lowers that item's price (about 0.6% per item sold, down to
   half), recovering 15% a day.
   MARKET STALL: a blueprint from Hale. Stock it with goods; between 8:00 and 18:00 it
   sells to passers-by for 30% over the going price, twice as fast on weekends. */

const PLOTS = { W: { dx: -1, dy: 0, n: 'West plot' }, S: { dx: 0, dy: 1, n: 'South plot' }, SW: { dx: -1, dy: 1, n: 'South-west plot' } };
const PLOT_TYPES = ['meadow', 'woodland', 'rocky', 'lakeside', 'hillside', 'marsh'];
const PTYPE_N = { meadow: 'Meadow', woodland: 'Woodland', rocky: 'Rocky ground', lakeside: 'Lakeside', hillside: 'Hillside', marsh: 'Marsh' };
const FEAT_N = { ruin: 'An old ruin with a chest', spring: 'A hot spring (restores energy)', fairy: 'A fairy ring', ancient: 'An ancient tree' };
const PW = 44, PH = 36;
for (const k in PLOTS) PERSIST.push('plot_' + k);

/* deterministic description of a plot: what the deed shows */
function plotInfo(k) {
  const P = PLOTS[k], r = rng((S.seed || 1) * 7919 + (P.dx + 5) * 131 + (P.dy + 5) * 17);
  const type = k === 'W' ? 'lakeside' : PLOT_TYPES[Math.floor(r() * PLOT_TYPES.length)]; // the west plot is always lakeside, so every farm can get a pond
  const soil = Math.round((({ meadow: 1.1, woodland: 1, rocky: .8, lakeside: 1.05, hillside: .9, marsh: 1.2 })[type] + (r() - .5) * .2) * 100) / 100;
  const res = { meadow: ['tall grass', 'flowers', 'a few trees'], woodland: ['oak, birch and maple trees', 'mushrooms'], rocky: ['stone', 'copper and iron ore', 'coal'], lakeside: ['a fishing pond', 'sand', 'reeds'], hillside: ['rock ledges', 'pines', 'stone'], marsh: ['shallow pools', 'reeds and ferns', 'mushrooms'] }[type];
  const feats = []; for (const f of ['ruin', 'spring', 'fairy', 'ancient']) if (r() < .28) feats.push({ f, hidden: r() < .5 });
  const price = Math.round((6000 + soil * 4000 + feats.length * 1500 + (type === 'lakeside' ? 1500 : 0)) / 100) * 100;
  return { type, soil, res, feats, price };
}
const ownedPlots = () => Object.keys(PLOTS).filter(k => S.land && S.land[k]).map(k => 'plot_' + k);
const ownsPlot = k => !!(S.land && S.land[k]);

/* ---- plot maps ---- */
function genPlot(k) {
  const I = plotInfo(k), m = newMap('plot_' + k, PW, PH, 'g'); R = rng((S.seed || 1) + 991 + k.length * 37 + k.charCodeAt(0));
  m.farm = true; m.name = PLOTS[k].n + ' — ' + PTYPE_N[I.type]; m.soilQ = I.soil; m.plot = k;
  const gaps = [];
  if (k === 'W') gaps.push((x, y) => x > PW - 3 && y >= 18 && y <= 19, (x, y) => y > PH - 3 && x >= 20 && x <= 22);
  if (k === 'S') gaps.push((x, y) => y < 2 && x >= 20 && x <= 22, (x, y) => x < 2 && y >= 16 && y <= 17);
  if (k === 'SW') gaps.push((x, y) => y < 2 && x >= 20 && x <= 22, (x, y) => x > PW - 3 && y >= 16 && y <= 17);
  border(m, gaps);
  const rnd = () => R(), at = () => [3 + Math.floor(rnd() * (PW - 6)), 3 + Math.floor(rnd() * (PH - 6))];
  const scatter = (n, f) => { for (let i = 0; i < n; i++) { const [x, y] = at(); if (!getO(m, x, y) && getT(m, x, y) === 'g') f(x, y); } };
  if (I.type === 'lakeside') { pond(m, 16, 16, 9, 6); scatter(14, (x, y) => { if (TER[getT(m, x, y + 1)].water) setO(m, x, y, { k: 'cattail' }); }); scatter(10, (x, y) => setO(m, x, y, { k: 'tree', kind: 'birch' })); }
  if (I.type === 'meadow') { scatter(60, (x, y) => setO(m, x, y, rnd() < .5 ? { k: 'tgrass' } : { k: 'flower', v: Math.floor(rnd() * 5) })); scatter(8, (x, y) => setO(m, x, y, { k: 'tree', kind: 'oak' })); }
  if (I.type === 'woodland') { scatter(70, (x, y) => setO(m, x, y, { k: 'tree', kind: pickR(['oak', 'birch', 'maple']) })); scatter(10, (x, y) => setO(m, x, y, { k: 'mushroom' })); }
  if (I.type === 'rocky') { scatter(40, (x, y) => setO(m, x, y, rnd() < .5 ? { k: 'rock' } : { k: pickR(['ore_copper', 'ore_copper', 'ore_iron', 'ore_coal']) })); scatter(3, (x, y) => putObj(m, x, y, { k: 'boulder' })); }
  if (I.type === 'hillside') { for (let i = 0; i < 4; i++) { const [x, y] = at(); for (let j = 0; j < 6; j++) setT(m, Math.min(PW - 3, x + j), y, 'r'); } scatter(30, (x, y) => setO(m, x, y, rnd() < .5 ? { k: 'tree', kind: 'pine' } : { k: 'rock' })); }
  if (I.type === 'marsh') { for (let i = 0; i < 5; i++) { const [x, y] = at(); pond(m, x, y, 2 + Math.floor(rnd() * 2), 2); } scatter(30, (x, y) => setO(m, x, y, { k: pickR(['cattail', 'fern', 'mushroom']) })); }
  for (const { f } of I.feats) {
    const [x, y] = [6 + Math.floor(rnd() * (PW - 14)), 6 + Math.floor(rnd() * (PH - 14))];
    if (f === 'ruin') { clearR(m, x, y, 3, 'st'); for (let i = -2; i <= 2; i++) if (i !== 0) setO(m, x + i, y - 2, { k: 'ruinwall' }); setO(m, x, y, { k: 'chest', id: 'plot_' + k + '_ruin', loot: 1 }); }
    if (f === 'spring') { clearR(m, x, y, 3); pond(m, x, y, 2, 2); m.spring = [x, y]; }
    if (f === 'fairy') { clearR(m, x, y, 3); for (let a = 0; a < 8; a++) setO(m, x + Math.round(Math.cos(a / 8 * 6.283) * 2), y + Math.round(Math.sin(a / 8 * 6.283) * 2), { k: 'mushroom' }); setO(m, x, y, { k: 'fairy' }); }
    if (f === 'ancient') { clearR(m, x, y, 2); setO(m, x, y, { k: 'ancient' }); }
  }
  // warps (only used once owned)
  if (k === 'W') { m.warps.push({ x: PW - 1, y: 18, w: 1, h: 2, to: 'farm', tx: 2.5 * 16, ty: 19 * 16, dir: 2 }); m.warps.push({ x: 20, y: PH - 1, w: 3, h: 1, to: 'plot_SW', tx: 21.5 * 16, ty: 2.8 * 16, dir: 0, need: 'SW' }); }
  if (k === 'S') { m.warps.push({ x: 20, y: 0, w: 3, h: 1, to: 'farm', tx: 27.5 * 16, ty: 41.2 * 16, dir: 3 }); m.warps.push({ x: 0, y: 16, w: 1, h: 2, to: 'plot_SW', tx: (PW - 2.5) * 16, ty: 17 * 16, dir: 1, need: 'SW' }); }
  if (k === 'SW') { m.warps.push({ x: 20, y: 0, w: 3, h: 1, to: 'plot_W', tx: 21.5 * 16, ty: (PH - 2.5) * 16, dir: 3, need: 'W' }); m.warps.push({ x: PW - 1, y: 16, w: 1, h: 2, to: 'plot_S', tx: 2.5 * 16, ty: 17 * 16, dir: 2, need: 'S' }); }
  m.allWarps = m.warps.slice();
  return m;
}
/* a plot's exits lead only into land you own; the rest are closed off with trees */
function plotExits(m) {
  m.warps = (m.allWarps || m.warps).filter(w => !w.need || ownsPlot(w.need));
  for (const w of m.allWarps || []) if (w.need && !ownsPlot(w.need)) for (let j = 0; j < w.h; j++) for (let i = 0; i < w.w; i++) if (!getO(m, w.x + i, w.y + j)) setO(m, w.x + i, w.y + j, { k: 'tree', kind: 'pine' });
}
function openFarmEdge(m) {
  if (ownsPlot('W')) { for (const y of [18, 19]) for (const x of [0, 1]) { setO(m, x, y, null); setT(m, x, y, 'd'); } m.warps.push({ x: 0, y: 18, w: 1, h: 2, to: 'plot_W', tx: (PW - 2.5) * 16, ty: 19 * 16, dir: 1 }); }
  if (ownsPlot('S')) { for (const x of [26, 27, 28]) for (const y of [m.h - 2, m.h - 1]) { setO(m, x, y, null); setT(m, x, y, 'd'); } m.warps.push({ x: 26, y: m.h - 1, w: 3, h: 1, to: 'plot_S', tx: 21.5 * 16, ty: 2.8 * 16, dir: 0 }); }
}
const _initMapsL = initMaps;
initMaps = function () { S.land = S.land || {}; for (const k in PLOTS) { MAPS['plot_' + k] = genPlot(k); plotExits(MAPS['plot_' + k]); } _initMapsL(); };
const _genFarmL = genFarm;
genFarm = function () { const m = _genFarmL(); if (S.land) openFarmEdge(m); return m; };

/* ---- the manor and the landowner ---- */
const _genVillageL = genVillage;
genVillage = function () {
  const m = _genVillageL();
  const b = addB(m, 26, 28, 7, 5, 'manor', 'landowner');
  for (let y = b.door.y + 1; y <= 27; y++) setT(m, b.door.x, y, 'p');
  return m;
};
DOORL.landowner = 'Manor';
function openLandowner() {
  openModal('Ashcombe Manor', [{ id: 'd', label: 'Deeds', render: b => {
    b.append(el('div', { class: 'greet f-panel' }, el('div', null, el('b', null, 'Lord Ashcombe'), el('p', null, '"Land is the only thing they are not making more of. Buy it outright, or lease it if your purse is thin. A surveyor will tell you what lies beneath the brambles."'))));
    const L = el('div', { class: 'list' });
    for (const k in PLOTS) {
      const I = plotInfo(k), own = S.land[k], surveyed = S.surveyed && S.surveyed[k];
      const feats = I.feats.filter(f => !f.hidden || surveyed).map(f => FEAT_N[f.f]), hidden = I.feats.some(f => f.hidden) && !surveyed;
      const prev = el('canvas', { width: PW * 2, height: PH * 2, class: 'plotprev' }); drawPlotPreview(prev, k);
      const row = el('div', { class: 'rrow deed' }, prev, el('div', { class: 'rtxt' },
        el('b', null, PLOTS[k].n + ' — ' + PTYPE_N[I.type] + (own ? (own.lease ? ' (leased)' : ' (yours)') : '')),
        el('small', null, 'Soil quality ' + Math.round(I.soil * 100) + '% · ' + I.res.join(', ') + '.'),
        el('small', null, feats.length ? 'Features: ' + feats.join('; ') + '.' : 'No notable features known.'),
        hidden ? el('small', { class: 'note' }, 'The surveyor suspects more is hidden here.') : null,
        el('small', null, 'Price ' + I.price.toLocaleString() + 'g · lease ' + Math.round(I.price * .25).toLocaleString() + 'g down + ' + Math.round(I.price * .06).toLocaleString() + 'g a week')));
      const acts = el('div', { class: 'acts col' });
      if (!own) {
        acts.append(el('button', { class: 'btn' + (S.gold >= I.price ? '' : ' off'), on: () => buyPlot(k, false) }, 'Buy'),
          el('button', { class: 'btn ghost' + (S.gold >= I.price * .25 ? '' : ' off'), on: () => buyPlot(k, true) }, 'Lease'));
        if (!surveyed) acts.append(el('button', { class: 'btn ghost', on: () => { const c = Math.round(I.price * .04); if (S.gold < c) { toast('A survey costs ' + c + 'g.', 'bad'); return; } S.gold -= c; (S.surveyed = S.surveyed || {})[k] = 1; toast('The surveyor reports back.'); refresh(); } }, 'Survey ' + Math.round(I.price * .04) + 'g'));
      } else if (own.lease) acts.append(el('button', { class: 'btn' + (S.gold >= I.price * .75 ? '' : ' off'), on: () => { const c = Math.round(I.price * .75); if (S.gold < c) { toast('Buying out the lease costs ' + c + 'g.', 'bad'); return; } S.gold -= c; own.lease = 0; toast('The ' + PLOTS[k].n.toLowerCase() + ' is yours outright.', 'lvl'); refresh(); } }, 'Buy out ' + Math.round(I.price * .75).toLocaleString() + 'g'));
      row.append(acts); L.append(row);
    }
    b.append(L);
  } }]);
}
function buyPlot(k, lease) {
  const I = plotInfo(k), cost = lease ? Math.round(I.price * .25) : I.price;
  if (S.gold < cost) { toast('Not enough gold.', 'bad'); SFX.bad(); return; }
  S.gold -= cost; S.land[k] = { lease: lease ? 1 : 0, since: dayIndex() };
  refreshLand(); SFX.lvl(); toast('The ' + PLOTS[k].n.toLowerCase() + ' joins your farm! The fence line has opened.', 'lvl'); refresh();
}
function refreshLand() {
  for (const k in PLOTS) plotExits(MAPS['plot_' + k]);
  const f = MAPS.farm; f.warps = f.warps.filter(w => !String(w.to).startsWith('plot_')); openFarmEdge(f); CHUNK.clear();
}
function drawPlotPreview(cvs, k) {
  const m = MAPS['plot_' + k], x = cvs.getContext('2d');
  for (let y = 0; y < PH; y++) for (let i = 0; i < PW; i++) {
    const t = getT(m, i, y), o = getO(m, i, y);
    x.fillStyle = TER[t].water ? '#4a92c4' : t === 'r' ? '#8a7e68' : t === 's' ? '#e0cc98' : t === 'st' ? '#a8a294' : o && (o.k === 'tree' || o.k === 'ancient') ? '#3e6a2e' : o && /rock|ore|boulder/.test(o.k) ? '#9a948a' : '#74b048';
    x.fillRect(i * 2, y * 2, 2, 2);
  }
}
const _doorActionL = doorAction;
doorAction = function (act, who) { if (act === 'landowner') return openLandowner(); return _doorActionL(act, who); };

/* ---- hot spring + ruin chest on plots ---- */
const _objInteractL = objInteract;
objInteract = function (m, x, y, o) {
  if (o.k === 'chest' && o.loot && !S.flags['c_' + o.id]) return { label: 'Open', fn: () => { S.flags['c_' + o.id] = 1; o.opened = 1; give('$', 800 + Math.floor(Math.random() * 800)); give(pickR(['topaz', 'aquamarine', 'emerald', 'ruby']), 1); give('hardwood', 5); SFX.secret(); } };
  return _objInteractL(m, x, y, o);
};
EVT.on('tick', () => { if (!S || PAUSED || !cur || !cur.spring) return; const [sx, sy] = cur.spring; if (dist(S.p.x / 16, S.p.y / 16, sx, sy) < 3.5 && S.p.st < maxST()) S.p.st = Math.min(maxST(), S.p.st + 2); });

/* ---- crops on plots grow too, scaled by soil quality (patched into endDay's loop via ownedPlots) ---- */

/* ---- economy: stock, restock, drifting and demand-driven prices ---- */
const demandOf = id => { const D = S.demand || {}, shipped = (S.stats.shipped || {})[id] || 0, snap = (S.shipSnap || {})[id] || 0; return clamp((D[id] || 0) + (shipped - snap) * .006, 0, .5); };
const _sellPriceL = sellPrice;
sellPrice = function (id) { const p = _sellPriceL(id); return p ? Math.max(1, Math.round(p * (1 - demandOf(id)))) : p; };
const weekDrift = id => 0.9 + hsh(id.length * 31 + id.charCodeAt(0), Math.floor(dayIndex() / 7), 77) * 0.2; // 0.9-1.1, changes weekly
const STOCK0 = id => { const t = IT[id] && IT[id].t; return t === 'seed' ? 40 : t === 'weapon' || t === 'armor' || t === 'ring' ? 2 : t === 'place' || t === 'sapling' ? 4 : 15; };
const _buyRowL = buyRow;
buyRow = function (id, price, label, cb, sub) {
  const shop = MODAL ? MODAL.title : 'shop', st = (S.stock = S.stock || {})[shop] = S.stock[shop] || {};
  if (st[id] === undefined) st[id] = STOCK0(id);
  const p = Math.max(1, Math.round(price * weekDrift(id))), left = st[id];
  const row = _buyRowL(id, p, label, cb, (left > 0 ? left + ' in stock. ' : 'Sold out until tomorrow. ') + (sub || ''));
  row.querySelectorAll('.acts button').forEach(btn => {
    const n = +(btn.textContent.replace('×', '')) || 1, orig = btn.onclick;
    if (st[id] < n) btn.classList.add('off');
    btn.onclick = e => { if (st[id] < n) { toast(st[id] ? 'Only ' + st[id] + ' left.' : 'Sold out until tomorrow.', 'bad'); SFX.bad(); return; } const g0 = S.gold; st[id] -= n; orig(e); if (S.gold >= g0) st[id] += n; }; // take stock first: the shop redraws inside orig
  });
  return row;
};
function econDaily() {
  S.stock = {}; // shops restock overnight
  const D = S.demand = S.demand || {}, shipped = S.stats.shipped || {};
  for (const id in shipped) { const d = demandOf(id); if (d > .001) D[id] = d * .85; else delete D[id]; }
  S.shipSnap = Object.assign({}, shipped);
  // leases: pay weekly or lose the plot
  for (const k in S.land) { const L = S.land[k]; if (!L.lease || (dayIndex() - L.since) % 7 !== 0) continue; const fee = Math.round(plotInfo(k).price * .06); if (S.gold >= fee) { S.gold -= fee; toast('Lease paid on the ' + PLOTS[k].n.toLowerCase() + ': ' + fee + 'g.'); } else { delete S.land[k]; refreshLand(); toast("You couldn't pay the lease. The " + PLOTS[k].n.toLowerCase() + ' is closed off again.', 'bad'); } }
}
const _endDayL = endDay;
endDay = function (f) { _endDayL(f); try { econDaily(); } catch (e) { console.error(e); } };

/* ---- market stall ---- */
BP.stall = { n: 'Market Stall', kind: 'stall', act: 'stall', w: 3, h: 2, gold: 1200, cost: { wood: 60, cloth: 2 }, work: 25, desc: 'Stock it with goods; passers-by pay 30% over the going price, more on weekends.' };
const _buildingSprL = buildingSpr;
buildingSpr = function (w, h, kind) { if (kind === 'stall') { const c = PIX.get('bld_stall_3x2'); if (c) return c; } return _buildingSprL(w, h, kind); };
const _doorActionL2 = doorAction;
doorAction = function (act, who) { if (act === 'stall') return openStall(); return _doorActionL2(act, who); };
function openStall() {
  S.stall = S.stall || { goods: {}, earned: 0 };
  openModal('Market Stall', [{ id: 's', label: 'Stall', render: b => {
    b.append(el('p', { class: 'note' }, 'Open 8:00 to 18:00. Goods sell for 30% over the going price, twice as fast on Saturdays and Sundays. Earned so far: ' + S.stall.earned.toLocaleString() + 'g.'));
    const on = el('div', { class: 'list' });
    for (const k in S.stall.goods) { const [id, q] = parseK(k); on.append(el('div', { class: 'rrow' }, icon(id, 32, q), el('div', { class: 'rtxt' }, el('b', null, IT[id].n + ' ×' + S.stall.goods[k]), el('small', null, Math.round(valK(k) * 1.3) + 'g each')), el('button', { class: 'btn ghost', on: () => { GIVE_NO_DROP = true; const left = give(id, S.stall.goods[k], q, true); GIVE_NO_DROP = false; if (left) S.stall.goods[k] = left; else delete S.stall.goods[k]; refresh(); } }, 'Take back'))); }
    b.append(el('h3', null, 'On display'), on.children.length ? on : el('p', { class: 'note' }, 'Nothing on display.'));
    const ks = sortedInv().filter(k => valK(k) > 0 && !IT[parseK(k)[0]].slot), add = el('div', { class: 'grid' });
    for (const k of ks) { const [id, q] = parseK(k); add.append(el('button', { class: 'cell f-slot', title: IT[id].n, on: () => { const n = S.inv[k]; takeK(k, n); S.stall.goods[k] = (S.stall.goods[k] || 0) + n; refresh(); } }, icon(id, 32, q), el('b', null, S.inv[k]))); }
    b.append(el('h3', null, 'Put out from your backpack'), add);
  } }]);
}
let stallHour = -1;
EVT.on('tick', () => {
  if (!S || PAUSED || !S.stall || !S.structures || !S.structures.some(s => s.k === 'stall' && s.stage >= 4)) return;
  const hr = Math.floor(S.time / 60); if (hr === stallHour) return; stallHour = hr;
  if (hr < 8 || hr >= 18) return;
  const keys = Object.keys(S.stall.goods); if (!keys.length) return;
  const weekend = (dayIndex() - 1) % 7 >= 5, sales = (weekend ? 4 : 2); let earned = 0, sold = [];
  for (let i = 0; i < sales; i++) { const ks = Object.keys(S.stall.goods); if (!ks.length) break; const k = pickR(ks), [id] = parseK(k); const n = Math.min(S.stall.goods[k], 1 + Math.floor(Math.random() * 3)); S.stall.goods[k] -= n; if (S.stall.goods[k] <= 0) delete S.stall.goods[k]; const p = Math.round(valK(k) * 1.3) * n; earned += p; S.stats.shipped[id] = (S.stats.shipped[id] || 0) + n; sold.push(n + ' ' + IT[id].n.toLowerCase()); }
  if (earned) { S.gold += earned; S.stall.earned += earned; toast('Your stall sold ' + sold.join(', ') + ' for ' + earned + 'g.'); SFX.coin(); }
});
