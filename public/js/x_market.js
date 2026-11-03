/* Markets, trade and caravans (asked 2026-11-03).
   Every place you trade is a market: the village (with your stall), Kingsbridge, Greyhelm, Ashford, Saltmere and the four
   region towns. A market keeps a stock of every trade good (crops, fruit, forage, fish, ore, gems, bars, materials,
   artisan goods, food, loot): how much it has against how much it normally holds (`mktT`) sets the price.
     - Its own production and consumption pull a stock back to that normal level, 20% of the gap a day.
     - What the town makes is cheaper there and what it lacks is dearer (`pf`): Greyhelm ore, Saltmere fish, Ashford timber.
     - Traders carry goods along the roads between linked markets each morning, from where a stock is high to where it's
       low (`LINKS`), so a glut spreads out and a shortage fills. Big loads go as caravans that take hours to arrive and can
       be looted by bandits; in the Wilds you see some of them roll by with two guards.
     - Goods no town makes come in slowly "from afar": the level a stock returns to never lets it vanish.
     - Now and then a market has a shortage or a glut of one kind of goods (a bad catch, a rich seam), in the news.
   Buying from a shop takes from its market's stock and selling adds to it, unit by unit. The price stays between half and
   double the base. Shops still charge their markup over what they pay, so buying and reselling in one place never pays.
   The shipping bin always pays a fixed 80% of the base price (`MKT_BIN`, `BIN_K`), so selling in person usually pays more. Your stall sells at the price you set against the village market;
   passers-by buy fast when it's cheap and rarely when it's dear, and traders call twice a day to buy what a town is short of.
   Gear, seeds, saplings, placeables and tools keep the shops' old stock and weekly drift (q_land.js). State: `S.mkt`. */
const MKT_TYPES = new Set(['crop', 'fruit', 'forage', 'mat', 'ore', 'bar', 'gem', 'loot', 'animal', 'fish', 'artisan', 'food']);
const mktTracks = id => { const it = IT[id]; return !!(it && MKT_TYPES.has(it.t) && it.p > 0); };
let MKT_BIN = false, MKT_RAW = false;
const BIN_K = .8;
const MARKETS = {
  village: { n: 'Emberhollow', R: 1, hold: { farm: 2.5, food: 1.5 }, pf: { mine: 1.1, metal: 1.1, sea: 1.05 } },
  kingsbridge: { n: 'Kingsbridge', R: 1.6, hold: { farm: 1.5, food: 1.5 }, pf: { farm: 1.1, food: 1.1, luxury: 1.15, mine: 1.1, wood: 1.05, fish: 1.1, craft: .95 } },
  greyhelm: { n: 'Greyhelm', R: 1, pf: { mine: .8, metal: .85, food: 1.2, farm: 1.15, wood: 1.1, fish: 1.15 } },
  ashford: { n: 'Ashford', R: .8, pf: { wood: .8, forage: .85, craft: .9, metal: 1.1, mine: 1.1, fish: 1.05 } },
  saltmere: { n: 'Saltmere', R: .8, pf: { fish: .8, sea: .75, wood: 1.15, farm: 1.1, metal: 1.1, food: 1.05 } },
};
for (const id in REGIONS) MARKETS[id] = { n: REGIONS[id].town.n, R: .7, region: 1, own: new Set(REGIONS[id].trade.map(t => t[0])), pf: { farm: 1.25, food: 1.25, luxury: 1.15, metal: 1.1, mine: 1.05 } };
// the roads traders use, and how many game minutes a caravan takes on them
const LINKS = [['village', 'kingsbridge', 300], ['village', 'ashford', 600], ['village', 'saltmere', 840], ['kingsbridge', 'greyhelm', 480], ['kingsbridge', 'ashford', 600],
  ['kingsbridge', 'saltmere', 660], ['greyhelm', 'ashford', 540], ['greyhelm', 'highmarch', 900], ['ashford', 'frostmere', 900], ['greyhelm', 'emberwaste', 1000], ['saltmere', 'saltreach', 900]]
  .filter(([a, b]) => MARKETS[a] && MARKETS[b]);
const mktName = m => (MARKETS[m] && MARKETS[m].n) || m;
function mktCat(id) {
  const t = IT[id].t;
  if (/salt|kelp|clam|oyster|mussel|shell|pearl|coral|seaweed/.test(id) && t !== 'fish') return 'sea';
  if (t === 'crop' || t === 'fruit' || t === 'animal') return 'farm';
  if (t === 'forage') return 'forage';
  if (t === 'fish') return 'fish';
  if (t === 'ore' || t === 'gem') return 'mine';
  if (t === 'bar') return 'metal';
  if (t === 'artisan') return 'luxury';
  if (t === 'food') return 'food';
  if (t === 'loot') return 'loot';
  if (/wood|log|sap|resin/.test(id)) return 'wood';
  if (/salt|kelp|shell|pearl|coral/.test(id)) return 'sea';
  if (/stone|clay|coal|sand|flint|obsidian/.test(id)) return 'mine';
  return 'craft';
}
const CAT_N = { farm: 'farm produce', forage: 'forage', fish: 'fish', mine: 'ore and stone', metal: 'metal bars', luxury: 'wine, cheese and fine goods', food: 'food', loot: 'curios', wood: 'timber', sea: 'salt and sea goods', craft: 'cloth, leather and fibre' };
// the stock a market normally holds: more of cheap goods than dear ones, more in a big town, more of what it makes; the village
// (the farmers' market, where your crops go) and Kingsbridge hold a lot of produce
function mktT(m, id) {
  const M = MARKETS[m], p = IT[id].p, q = p < 15 ? 4 : p < 60 ? 2 : p < 250 ? 1 : p < 1000 ? .6 : .35;
  return Math.max(3, Math.round(30 * M.R * q * (M.own && M.own.has(id) ? 1.5 : 1) * ((M.hold && M.hold[mktCat(id)]) || 1)));
}
const mktPf = (m, id) => { const M = MARKETS[m]; return M.own && M.own.has(id) ? .8 : (M.pf[mktCat(id)] || 1); };
function mktState() { if (!S.mkt || !S.mkt.s) S.mkt = { s: {}, cv: [], news: [] }; return S.mkt; }
function mktStock(m, id) { const st = mktState().s[m]; return st && st[id] !== undefined ? st[id] : mktT(m, id); }
function mktSet(m, id, v) { const s = mktState().s; (s[m] = s[m] || {})[id] = Math.max(0, Math.round(v * 10) / 10); }
// price factor against the base: what the town makes or lacks, times how full its stock is
function mktF(m, id, s) {
  if (s === undefined) s = mktStock(m, id);
  const T = mktT(m, id), k = clamp(Math.pow(T / Math.max(.5, s), .6), .55, 1.8);
  return clamp(mktPf(m, id) * k, .5, 2);
}
// which market you're trading in: the region you're in, the town whose shop or streets you're in, else the village
function mktHere() {
  if (!cur) return 'village';
  if (cur.region && MARKETS[cur.region]) return cur.region;
  if (cur.id.startsWith('in_')) { const T = typeof TOWN_ACTS !== 'undefined' && TOWN_ACTS[cur.id.slice(3)]; return T && MARKETS[T.town] ? T.town : 'village'; }
  if (cur.id === 'wilds' && cur.towns) { const px = S.p.x / 16, py = S.p.y / 16; let best = null, bd = 40; for (const T of cur.towns) { const d = dist(px, py, T.cx, T.cy); if (d < bd && MARKETS[T.id]) { bd = d; best = T.id; } } if (best) return best; }
  return 'village';
}
const mktSellPrice = (id, p) => (MKT_BIN || MKT_RAW || !S) ? p : Math.max(1, Math.round(p * mktF(mktHere(), id)));
// selling n at once: each unit adds to the stock and lowers the next unit's price
function mktBulk(id, each, n) {
  const m = mktHere(), s0 = mktStock(m, id), f0 = mktF(m, id, s0); let t = 0;
  for (let i = 0; i < n; i++) t += each * mktF(m, id, s0 + i) / f0;
  mktSet(m, id, s0 + n);
  return Math.round(t);
}
function mktNote(m, id) {
  const r = mktStock(m, id) / mktT(m, id);
  return r < .45 ? '▲ Very scarce here' : r < .8 ? '▲ Scarce here' : r > 1.8 ? '▼ A glut here' : r > 1.25 ? '▼ Plentiful here' : '';
}
// sell rows say so too: a scarce good pays well here, a glut pays badly
const mktSellNote = id => { if (!S || MKT_BIN || !mktTracks(id)) return ''; const n = mktNote(mktHere(), id); return n ? ' · ' + n : ''; };
// shop rows: the shop's own price follows the market, and the stock is the market's
function mktBuyRow(base, id, price, label, cb, sub) {
  const m = mktHere(), stock = () => Math.floor(mktStock(m, id)), p = Math.max(1, Math.round(price * mktF(m, id))), note = mktNote(m, id);
  const row = base(id, p, label, cb, (stock() > 0 ? stock() + ' in stock' + (note ? ' · ' + note : '') + '. ' : 'Sold out: traders will bring more. ') + (sub || ''));
  row.querySelectorAll('.acts button').forEach(btn => {
    const n = +(btn.textContent.replace('×', '')) || 1, orig = btn.onclick;
    if (stock() < n) btn.classList.add('off');
    btn.onclick = e => {
      if (stock() < n) { toast(stock() ? 'Only ' + stock() + ' left.' : 'Sold out. Traders will bring more.', 'bad'); SFX.bad(); return; }
      const s0 = mktStock(m, id), f0 = mktF(m, id, s0); let extra = 0;
      for (let i = 1; i < n; i++) extra += Math.round(p * mktF(m, id, s0 - i) / f0) - p;
      if (S.gold < p * n + extra) { toast('Not enough gold: ' + n + ' cost ' + (p * n + extra).toLocaleString() + 'g as the stock runs down.', 'bad'); SFX.bad(); return; }
      const g0 = S.gold; mktSet(m, id, s0 - n); orig(e);   // the stock first: the shop redraws inside orig
      if (S.gold >= g0) mktSet(m, id, s0); else if (extra) { S.gold -= extra; if (MODAL) refresh(); }
    };
  });
  return row;
}

/* ---- the day: production and consumption, events, traders and caravans ---- */
let MKT_IDS = null;
const mktIds = () => MKT_IDS || (MKT_IDS = Object.keys(IT).filter(mktTracks));
function mktNews(t) { const N = mktState().news; N.unshift({ d: dayIndex(), t }); N.length = Math.min(N.length, 10); }
// a load bound along a road: cheap loads arrive at once, the rest join that road's caravan of the day, which takes hours
const cvGoods = c => Object.entries(c.goods).sort((x, y) => y[1] * IT[y[0]].p - x[1] * IT[x[0]].p);
const cvValue = c => Object.entries(c.goods).reduce((t, [id, q]) => t + q * IT[id].p, 0);
const cvSay = c => {
  const G = cvGoods(c), [id, q] = G[0]; if (G.length === 1) return q + ' ' + IT[id].n.toLowerCase();
  const cats = new Set(G.map(([k]) => mktCat(k))), n = G.reduce((t, [, q]) => t + q, 0);
  return (cats.size === 1 ? CAT_N[mktCat(id)] : IT[id].n.toLowerCase() + ' and other goods') + ' (' + n + ' loads)';
};
function mktShip(id, q, a, b, mins) {
  if (q * IT[id].p < 300 || mins === undefined) { mktSet(b, id, mktStock(b, id) + q); return; }
  const M = mktState(), day = dayIndex();
  let c = M.cv.find(c => c.from === a && c.to === b && c.day === day && !c.seen);
  if (!c) { c = { from: a, to: b, day, at: worldMin() + mins, goods: {}, lost: day >= 7 && Math.random() < .04 ? 1 : 0 }; M.cv.push(c); }
  c.goods[id] = (c.goods[id] || 0) + q;
}
function mktDaily() {
  const M = mktState(), st = M.s;
  // production and consumption: every stock moves a fifth of the way back to its normal level
  for (const m in st) for (const id in st[m]) {
    if (!IT[id] || !MARKETS[m]) { delete st[m][id]; continue; }
    const T = mktT(m, id), s = st[m][id] + (T - st[m][id]) * .2;
    if (Math.abs(s / T - 1) < .03) delete st[m][id]; else st[m][id] = Math.round(s * 10) / 10;
  }
  // a shortage or a glut somewhere
  if (Math.random() < .3) {
    const m = pickR(Object.keys(MARKETS)), c = pickR(['farm', 'fish', 'mine', 'metal', 'wood', 'food', 'forage', 'luxury']), k = Math.random() < .55 ? .4 : 1.8;
    for (const id of mktIds()) if (mktCat(id) === c && IT[id].p <= 600) mktSet(m, id, mktStock(m, id) * k);   // everyday goods, not legendary fish or rare gems
    mktNews(mktName(m) + (k < 1 ? ' is short of ' : ' has more ' + CAT_N[c] + ' than it can use: ') + (k < 1 ? CAT_N[c] + ': prices are up there.' : 'prices are down there.'));
  }
  // traders: along each road, goods go from where the stock is high to where it's low (up to three loads per good)
  const ids = new Set(); for (const m in st) for (const id in st[m]) ids.add(id);
  for (const id of ids) for (let it = 0; it < 3; it++) {
    let best = null, gap = .3;
    for (const [a, b, mins] of LINKS) {
      const ra = mktStock(a, id) / mktT(a, id), rb = mktStock(b, id) / mktT(b, id);
      if (ra - rb > gap) { gap = ra - rb; best = [a, b, mins]; } else if (rb - ra > gap) { gap = rb - ra; best = [b, a, mins]; }
    }
    if (!best) break;
    const [a, b, mins] = best, Ta = mktT(a, id), Tb = mktT(b, id), q = Math.floor(.35 * gap / (1 / Ta + 1 / Tb));
    if (q < 1) break;
    mktSet(a, id, mktStock(a, id) - q); mktShip(id, q, a, b, mins);
  }
  // the day's caravans in the news: the biggest two, and any the bandits took
  const today = M.cv.filter(c => c.day === dayIndex());
  for (const c of today.filter(c => c.lost)) mktNews('Bandits took a caravan of ' + cvSay(c) + ' on the road to ' + mktName(c.to) + '.');
  today.filter(c => !c.lost && cvValue(c) >= 2500).sort((x, y) => cvValue(y) - cvValue(x)).slice(0, 2).forEach(c => mktNews('A caravan of ' + cvSay(c) + ' left ' + mktName(c.from) + ' for ' + mktName(c.to) + '.'));
}
// caravans arrive when their time is up
EVT.on('tick', n => {
  if (!S || !S.mkt || n % 10 || !S.mkt.cv.length) return;
  const now = worldMin();
  S.mkt.cv = S.mkt.cv.filter(c => { if (c.at > now) return true; if (!c.lost && c.goods) for (const id in c.goods) if (IT[id]) mktSet(c.to, id, mktStock(c.to, id) + c.goods[id]); return false; });
});
econDaily = (f => function () { f.apply(this, arguments); try { mktDaily(); } catch (e) { console.error(e); } })(econDaily);

/* ---- your stall: you set the price; passers-by and traders buy ---- */
const MKT_STALL = 1;
const stallMul = k => (S.stall.mul && S.stall.mul[k]) || 1;
const stallEach = k => Math.max(1, Math.round(mktSellPrice(parseK(k)[0], valBase(k)) * stallMul(k)));
function valBase(k) { const was = MKT_RAW; MKT_RAW = true; try { return valK(k); } finally { MKT_RAW = was; } }
// the chance a try sells: 70% of the village price always, 100% half the time, 130% one in eight, 160% hardly ever
const stallChance = mul => clamp(.5 * Math.pow(2, (1 - mul) / .15), .02, 1);
const stallPace = mul => { const c = stallChance(mul); return c >= .9 ? 'sells fast' : c >= .45 ? 'sells steadily' : c >= .2 ? 'sells slowly' : c >= .08 ? 'sells now and then' : 'hardly sells'; };
openStall = function () {
  S.stall = S.stall || { goods: {}, earned: 0 }; S.stall.mul = S.stall.mul || {}; stallClean();
  openModal('Market Stall', [{ id: 's', label: 'Stall', render: b => {
    b.append(el('p', { class: 'note' }, 'Open 8:00 to 18:00. Set each price against what the village pays: the cheaper, the faster it sells. Traders call at 10:00 and 15:00 for what a town is short of. Earned so far: ' + S.stall.earned.toLocaleString() + 'g.'));
    const on = el('div', { class: 'list' });
    for (const k in S.stall.goods) {
      const [id, q] = parseK(k), mul = stallMul(k), set = d => { S.stall.mul[k] = clamp(Math.round((mul + d) * 100) / 100, .7, 1.6); refresh(); };
      on.append(el('div', { class: 'rrow' }, icon(id, 32, q), el('div', { class: 'rtxt' }, el('b', null, IT[id].n + ' ×' + S.stall.goods[k]),
        el('small', null, stallEach(k) + 'g each (' + Math.round(mul * 100) + '% of the village price) · ' + stallPace(mul) + '. ' + stallOffer(k))),
        el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => set(-.05) }, '−'), el('button', { class: 'btn ghost', on: () => set(.05) }, '+'),
          el('button', { class: 'btn ghost', on: () => { GIVE_NO_DROP = true; const left = give(id, S.stall.goods[k], q, true); GIVE_NO_DROP = false; if (left) S.stall.goods[k] = left; else delete S.stall.goods[k]; refresh(); } }, 'Take back'))));
    }
    b.append(el('h3', null, 'On display'), on.children.length ? on : el('p', { class: 'note' }, 'Nothing on display.'));
    const ks = sortedInv().filter(k => valK(k) > 0 && !IT[parseK(k)[0]].slot), add = el('div', { class: 'grid' });
    for (const k of ks) { const [id, q] = parseK(k); add.append(el('button', { class: 'cell f-slot', title: IT[id].n, on: () => { const n = S.inv[k]; takeK(k, n); S.stall.goods[k] = (S.stall.goods[k] || 0) + n; refresh(); } }, icon(id, 32, q), el('b', null, S.inv[k]))); }
    b.append(el('h3', null, 'Put out from your backpack'), add);
  } }]);
};
// what the traders would pay: the town that's short of it, and the most they'd give (its price less their 15%)
function stallOffer(k) {
  const [id] = parseK(k); if (!mktTracks(id)) return '';
  let best = null;
  for (const m in MARKETS) { if (mktStock(m, id) / mktT(m, id) > .85) continue; const pays = Math.round(valBase(k) * mktF(m, id) * .85); if (!best || pays > best[1]) best = [m, pays]; }
  if (!best) return 'No town is short of it now.';
  return mktName(best[0]) + ' is short: a trader pays up to ' + best[1] + 'g' + (stallEach(k) <= best[1] ? ' and would take it.' : ', under your price.');
}
// goods whose item no longer exists are dropped from the stall (an unknown key threw on every tick)
const stallClean = () => { if (S && S.stall && S.stall.goods) for (const k in S.stall.goods) if (!IT[parseK(k)[0]]) delete S.stall.goods[k]; };
const stallBuilt = () => S && S.stall && S.structures && S.structures.some(s => s.k === 'stall' && s.stage >= 4) && (stallClean(), true);
function stallSell(k, n, each, who) {
  const [id] = parseK(k); n = Math.min(n, S.stall.goods[k] || 0); if (!n) return 0;
  S.stall.goods[k] -= n; if (S.stall.goods[k] <= 0) delete S.stall.goods[k];
  S.gold += each * n; S.stall.earned += each * n; S.stats.shipped[id] = (S.stats.shipped[id] || 0) + n;
  if (!who) mktSet('village', id, mktStock('village', id) + n);
  return each * n;
}
let stallHr2 = -1;
EVT.on('tick', () => {
  if (!stallBuilt() || PAUSED) return;
  const hr = Math.floor(S.time / 60); if (hr === stallHr2) return; stallHr2 = hr;
  if (hr < 8 || hr >= 18 || !Object.keys(S.stall.goods).length) return;
  if (hr === 10 || hr === 15) stallTrader();
  const weekend = (dayIndex() - 1) % 7 >= 5; let earned = 0; const sold = [];
  for (let i = 0; i < (weekend ? 6 : 3); i++) {
    const ks = Object.keys(S.stall.goods); if (!ks.length) break;
    const k = pickR(ks), mul = stallMul(k); if (Math.random() > stallChance(mul)) continue;
    const n = 1 + Math.floor(Math.random() * 3), g = stallSell(k, n, stallEach(k)); if (g) { earned += g; sold.push(IT[parseK(k)[0]].n.toLowerCase()); }
  }
  if (earned) { toast('Your stall sold ' + [...new Set(sold)].join(', ') + ' for ' + earned + 'g.'); SFX.coin(); }
});
// a trader looks for goods some town is short of, and buys them if your price leaves them a margin there
function stallTraderDeal() {
  let deal = null;
  for (const k in S.stall.goods) {
    const [id] = parseK(k); if (!mktTracks(id)) continue;
    const each = stallEach(k);
    for (const m in MARKETS) {
      const s = mktStock(m, id), T = mktT(m, id); if (s / T > .85) continue;
      const pays = Math.round(valBase(k) * mktF(m, id) * .85); if (each > pays) continue;
      const q = Math.min(S.stall.goods[k], Math.ceil(T - s)), gain = (pays - each) * q;
      if (q > 0 && (!deal || gain > deal.gain)) deal = { k, id, m, q, each, gain };
    }
  }
  return deal;
}
function stallTrader() {
  if (TRADER.n) return;   // one already on the way
  const d = stallTraderDeal(); if (!d) return;
  if (cur && cur.id === 'farm' && !TRADER.n) { traderWalk(d); return; }
  stallTraderBuy(d);
}
function stallTraderBuy(d) {
  if (!S.stall.goods[d.k]) return;
  const g = stallSell(d.k, d.q, d.each, 'trader'), n = Math.round(g / d.each); if (!g) return;
  const L = LINKS.find(([a, b]) => (a === 'village' && b === d.m) || (b === 'village' && a === d.m));
  mktShip(d.id, n, 'village', d.m, L ? L[2] : 600);
  toast('A trader bound for ' + mktName(d.m) + ' bought ' + n + ' ' + IT[d.id].n.toLowerCase() + ' at your stall for ' + g.toLocaleString() + 'g. ' + mktName(d.m) + ' is short of them.', 'lvl'); SFX.coin();
}
// on the farm you see the trader walk up the road to the stall, buy, and leave
Object.defineProperty(NPCS, 'mkt_trader', { value: { n: 'Travelling trader', role: 'Trader', shop: 'k_trader', P: HP(0, { skin: '#d8a880', hair: '#4a3020', hs: 'short', shirt: '#6a4a8a', pants: '#3a3028', hat: '#5a3a20', beard: '#4a3020' }), love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
const TRADER = { n: null, path: null, pi: 0, deal: null, phase: 0, wait: 0 };
function traderWalk(d) {
  const m = MAPS.farm, s = S.structures.find(s => s.k === 'stall' && s.stage >= 4); if (!m || !s) { stallTraderBuy(d); return; }
  const sx = m.w - 2, sy = 18, gx = s.x + 1, gy = s.y + BP.stall.h;
  const path = findPath(m, sx, sy, gx, gy, 8000); if (!path) { stallTraderBuy(d); return; }
  TRADER.n = { id: 'mkt_trader', x: (sx + .5) * 16, y: (sy + .8) * 16, hx: (sx + .5) * 16, hy: (sy + .8) * 16, dir: 1, walk: true, t: 1e9, vx: 0 };
  Object.assign(TRADER, { path, pi: 1, deal: d, phase: 1, wait: 0 }); m.npcs = (m.npcs || []).filter(n => n.id !== 'mkt_trader'); m.npcs.push(TRADER.n);
}
function traderFrame(dt) {
  const n = TRADER.n, m = MAPS.farm; if (!n) return;
  if (!m || cur !== m || !m.npcs.includes(n)) { if (TRADER.phase === 1 && TRADER.deal) stallTraderBuy(TRADER.deal); traderGone(); return; }
  if (TRADER.wait > 0) { TRADER.wait -= dt; n.walk = false; if (TRADER.wait <= 0) { const p = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), m.w - 2, 18, 8000); if (!p) { traderGone(); return; } TRADER.path = p; TRADER.pi = 1; TRADER.phase = 2; } return; }
  const node = TRADER.path && TRADER.path[TRADER.pi];
  if (!node) { if (TRADER.phase === 1) { stallTraderBuy(TRADER.deal); TRADER.deal = null; TRADER.wait = 2.5; n.dir = 3; } else traderGone(); return; }
  const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
  if (d < 2) { TRADER.pi++; return; }
  const sp = 38 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.hx = n.x; n.hy = n.y; n.walk = true;
  n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
}
function traderGone() { const m = MAPS.farm; if (m && m.npcs) m.npcs = m.npcs.filter(q => q.id !== 'mkt_trader'); TRADER.n = null; TRADER.deal = null; TRADER.phase = 0; }
update = (f => function (dt) { f(dt); if (S && !TITLE) { traderFrame(dt); caravanFrame(dt); } })(update);
doorAction = (f => function (act, who) {
  if (act !== 'k_trader') return f(act, who);
  storyDialog([['narr', pickR(['"Good stock you keep. I\'ll be back when the towns are hungry again."', '"Prices are up wherever the roads are bad. Mind the bandits."', '"Cheaper than the village, and I\'ll take it off your hands. Fair?"'])]], { title: 'Travelling trader' });
})(doorAction);

/* ---- caravans you can see: now and then one of the loads on the road passes you in the Wilds. The wagon is a map entity
   (`cvwagon`), so it's drawn in depth order with everything else; a guard leads it and one walks behind. Its road is
   extended while you can see it, so it never ends in view; a looted wagon stands for a while, then fades. ---- */
let CARAVAN = null, CARAVAN_T = 30;
const CV_SEEN = 520;
// carry the escort's road on to the road end farthest from you
function cvExtend(m, P) {
  const last = P.path[P.path.length - 1], px = S.p.x / 16, py = S.p.y / 16; let best = null, bd = 45;
  for (const r of m.roads) for (const e of r) { const d = dist(px, py, e[0], e[1]); if (d > bd && dist(last[0], last[1], e[0], e[1]) > 20) { bd = d; best = e; } }
  if (!best) return false;
  const more = findPath(m, last[0], last[1], Math.round(best[0]), Math.round(best[1]), 60000); if (!more || more.length < 3) return false;
  P.path = P.path.concat(more.slice(1)); P.age = 0; return true;
}
function caravanFrame(dt) {
  const m = cur;
  if (!m || m.id !== 'wilds' || !m.roads || typeof spawnPatrol !== 'function') { CARAVAN = null; return; }
  if (CARAVAN) {
    const C = CARAVAN, P = C.P, W = C.w, near = dist(W.x, W.y, S.p.x, S.p.y) < CV_SEEN;
    if (!m.ents.includes(W)) m.ents.push(W);
    if (W.fade) { W.alpha = Math.max(0, (W.alpha || 1) - dt / 1.5); if (W.alpha <= 0) { m.ents = m.ents.filter(e => e !== W); CARAVAN = null; } return; }
    if (W.lost) { W.t -= dt; if (W.t <= 0 && !near) W.fade = 1; return; }
    if (near && P.path && P.pi > P.path.length - 6 && !P.ext) P.ext = cvExtend(m, P) ? 0 : 1;
    const alive = P.members.filter(a => !a.gone);
    if (!alive.length || !PATROLS.includes(P)) { W.fade = 1; return; }
    const lead = alive.find(a => a.slot === 0) || alive[0], spr = PIX.get('wagon_supply.0'), half = spr ? spr.ww / 2 : 24;
    // the wagon keeps a step behind the leading guard, facing the way it rolls
    const dirx = lead.dir === 1 ? -1 : lead.dir === 2 ? 1 : 0, diry = lead.dir === 0 ? 1 : lead.dir === 3 ? -1 : 0;
    const tx = lead.x - dirx * (half + 14), ty = lead.y - diry * 22, dx = tx - W.x, dy = ty - W.y, d = Math.hypot(dx, dy);
    if (d > 300) { W.x = tx; W.y = ty; } else if (d > 2) { const st = Math.min(d, 46 * dt); W.x += dx / d * st; W.y += dy / d * st; if (Math.abs(dx) > 1) W.dir = dx < 0 ? -1 : 1; W.f += dt; }
    // the second guard walks behind the wagon (not on the horse's head) unless it's fighting
    const rear = alive.find(a => a !== lead);
    if (rear && !rear.tgt && !(rear.down > 0)) { const rx = W.x - W.dir * (half + 10), ry = W.y + 4, rd = Math.hypot(rx - rear.x, ry - rear.y); if (rd > 2) { const st = Math.min(rd, 50 * dt); rear.x += (rx - rear.x) / rd * st; rear.y += (ry - rear.y) / rd * st; rear.walk = true; rear.dir = W.dir < 0 ? 1 : 2; } }
    // bandits at the wagon with every guard down: the load is gone
    const guards = P.members.some(a => !a.gone && !(a.down > 0));
    if (!guards && m.ents.some(e => e.type === 'enemy' && !e.dead && /bandit|archer/.test(e.k) && dist(e.x, e.y, W.x, W.y) < 40)) {
      W.lost = 1; W.t = 25; const c = C.c; if (c) { c.lost = 1; mktNews('Bandits looted a caravan of ' + cvSay(c) + ' bound for ' + mktName(c.to) + '.'); }
      toast('Bandits are looting the caravan!', 'bad'); P.members.forEach(a => a.gone = true);
    }
    return;
  }
  CARAVAN_T -= dt; if (CARAVAN_T > 0) return; CARAVAN_T = 60 + Math.random() * 60;
  const lowland = new Set(['kingsbridge', 'greyhelm', 'ashford', 'saltmere', 'village']);
  const c = S.mkt && pickR(S.mkt.cv.filter(c => !c.lost && !c.seen && c.goods && lowland.has(c.from) && lowland.has(c.to)) || []);
  if (!c) return;
  const n0 = PATROLS.length; spawnPatrol(m); if (PATROLS.length === n0) return;
  const P = PATROLS[PATROLS.length - 1]; P.caravan = 1; c.seen = 1;
  while (P.members.length > 2) { const a = P.members.pop(); a.gone = true; }
  // a road that ends close by is carried on, so the caravan rolls past and out of sight
  { const px = S.p.x / 16, py = S.p.y / 16, e = P.path[P.path.length - 1]; if (dist(px, py, e[0], e[1]) < 40) cvExtend(m, P); }
  const a0 = P.members[0], W = { type: 'cvwagon', x: a0.x - 30, y: a0.y, dir: 1, f: 0, alpha: 1 };
  m.ents.push(W); CARAVAN = { P, c, w: W };
  if (dist(S.p.x, S.p.y, a0.x, a0.y) < 600) toast('A trade caravan is on the road: ' + cvSay(c) + ' bound for ' + mktName(c.to) + ', with two guards.');
}
EVT.on('map', () => { CARAVAN = null; CARAVAN_T = 20; });
drawEnt = (f => function (e) {
  if (e.type !== 'cvwagon') return f(e);
  const spr = PIX.get('wagon_supply.' + (e.lost ? 0 : Math.floor((e.f || 0) * 5) % 2)); if (!spr) return;
  g.save(); g.globalAlpha *= (e.alpha === undefined ? 1 : e.alpha);
  shadow(e.x, e.y, spr.ww * .4);
  if (e.dir === 1) { g.translate(Math.round(e.x + spr.ww / 2), Math.round(e.y - spr.wh)); g.scale(-1, 1); D(spr, 0, 0); }
  else D(spr, Math.round(e.x - spr.ww / 2), Math.round(e.y - spr.wh));
  g.restore();
})(drawEnt);

/* ---- the news: the farm notice board gets a Markets tab, inns pass on market talk ---- */
function renderMarkets(b) {
  const N = (S.mkt && S.mkt.news) || [];
  b.append(el('h3', null, 'Trade news'), N.length ? el('div', { class: 'list' }, ...N.slice(0, 8).map(x => el('p', { class: 'note' }, (dayIndex() - x.d <= 0 ? 'Today: ' : dayIndex() - x.d === 1 ? 'Yesterday: ' : (dayIndex() - x.d) + ' days ago: ') + x.t))) : el('p', { class: 'note' }, 'Quiet on the roads.'));
  b.append(el('h3', null, 'Where prices stand'), el('p', { class: 'note' }, 'Prices are shown against the usual price (100%).'));
  const L = el('div', { class: 'list' }), here = mktHere();
  for (const m of [here, ...Object.keys(MARKETS).filter(m => m !== here)]) {
    const st = (S.mkt && S.mkt.s[m]) || {}, rows = Object.keys(st).filter(id => IT[id]).map(id => [id, st[id] / mktT(m, id)]);
    // the same thresholds as the shop notes (scarce under 80% of the normal stock, plentiful over 125%), with the price against normal
    const pct = id => IT[id].n + ' ' + Math.round(mktF(m, id) * 100) + '%';
    const short = rows.filter(r => r[1] < .8).sort((a, b) => a[1] - b[1]).slice(0, 4).map(r => pct(r[0])), glut = rows.filter(r => r[1] > 1.25).sort((a, b) => b[1] - a[1]).slice(0, 4).map(r => pct(r[0]));
    L.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, mktName(m) + (m === here ? ' (here)' : '')), el('small', null, (short.length ? 'Short of ' + short.join(', ') + ' (dear). ' : '') + (glut.length ? 'Plenty of ' + glut.join(', ') + ' (cheap). ' : '') + (!short.length && !glut.length ? 'Prices as usual.' : '')))));
  }
  b.append(L);
}
farmNotices = (f => function () {
  f.apply(this, arguments);
  if (MODAL && MODAL.tabs && !MODAL.tabs.some(t => t.id === 'mkt')) { MODAL.tabs.push({ id: 'mkt', label: 'Markets', render: renderMarkets }); if (typeof drawModal === 'function') drawModal(); }
})(farmNotices);
// and in every town: the town board, the inns (the Drowsy Drake too) and the region markets and inns get the same tab
openModal = (f => function (title) {
  const r = f.apply(this, arguments);
  try {
    if (!S || !cur || !MODAL || MODAL.tabs.some(t => t.id === 'mkt')) return r;
    const act = cur.id.startsWith('in_') ? cur.id.slice(3) : null, T = act && typeof TOWN_ACTS !== 'undefined' && TOWN_ACTS[act];
    const rg = cur.region && REGIONS[cur.region];
    const show = (T && title === T.name && ['inn', 'hall'].includes(actType(act))) || (act === 'tavern' && title === 'The Drowsy Drake') || (rg && (title === rg.town.n + ' inn' || title === rg.town.n + ' market'));
    if (show) { MODAL.tabs.push({ id: 'mkt', label: 'Markets', render: renderMarkets }); drawModal(); }
  } catch (e) { console.error(e); }
  return r;
})(openModal);

