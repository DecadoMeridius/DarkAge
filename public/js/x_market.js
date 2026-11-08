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
/* ---- the markets live (asked 2026-11-04): what each town makes (PROD, how much when it produces) and uses up (USE, the
   share of its stock it uses a day; MKT.use0 elsewhere). Each day every good is made in only one or two towns, drawn at
   random with the makers far likelier (two towns land halibut, the others sardines or wood), every stock drifts a few percent, and 1-2 shortages or gluts strike.
   Regional goods are made only in their region. Goods nobody makes (curios, rare finds) drift back to normal instead. ---- */
const PROD = {
  village: { farm: 1.5, food: .5, forage: .5, craft: .3 },
  kingsbridge: { food: 1.2, luxury: 1, craft: .8, metal: .5, farm: .5 },
  greyhelm: { mine: 1.5, metal: 1.2 },
  ashford: { wood: 1.5, forage: 1, craft: .8, farm: .3 },
  saltmere: { fish: 1.5, sea: 1.5, food: .3 },
  highmarch: { mine: .8, wood: .6, forage: .5 }, frostmere: { fish: .6, forage: .6 }, emberwaste: { mine: .8 }, saltreach: { fish: 1, sea: 1 },
};
const USE = {
  village: { food: .12, craft: .1, wood: .1, metal: .08 },
  kingsbridge: { food: .15, farm: .14, luxury: .14, wood: .1, metal: .1, fish: .1, craft: .08 },
  greyhelm: { food: .14, farm: .12, wood: .14, fish: .1, luxury: .06 },
  ashford: { food: .12, farm: .1, metal: .12, mine: .08, fish: .08 },
  saltmere: { wood: .14, farm: .12, food: .12, mine: .06, metal: .1 },
  highmarch: { farm: .14, food: .14, metal: .1, craft: .08 }, frostmere: { farm: .14, food: .14, metal: .1, wood: .1 },
  emberwaste: { farm: .14, food: .14, metal: .1, wood: .12 }, saltreach: { farm: .14, food: .14, metal: .1, wood: .1 },
};
const MKT = { k: .22, chance: .5, makers: [1, 2], side: .2, useK: .3, use0: .01, drift: .12, relax: .04, gap: .5, load: .15, loads: 4, events: [1, 2], yield: [.4, 1.6], wobble: .3, wantBack: .85, wantStep: .3 };   // k: share of normal stock made on a making day; useK scales USE; relax: the daily pull back to normal
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
// what a town normally holds of a good (its supply side: where stocks settle with nothing going on)
function mktT0(m, id) {
  const M = MARKETS[m], p = IT[id].p, q = p < 15 ? 4 : p < 60 ? 2 : p < 250 ? 1 : p < 1000 ? .6 : .35;
  return Math.max(3, Math.round(30 * M.R * q * (M.own && M.own.has(id) ? 1.5 : 1) * ((M.hold && M.hold[mktCat(id)]) || 1)));
}
// what it wants to hold today (asked 2026-11-04: demand moves too): the normal level times the town's want for that kind of
// good, a slow random walk per town and kind (S.mkt.want, mktWantDay), times a small wobble per good that changes daily
// (worked out from the day, so it needs no saving). Prices come from wanted stock against real stock
const mktHash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
function mktWant(m, id) {
  if (!S || !S.mkt) return 1;
  const w = (S.mkt.want && S.mkt.want[m] && S.mkt.want[m][mktCat(id)]) || 1;
  return w * (1 + (mktHash(m + id + dayIndex()) - .5) * MKT.wobble);
}
const mktT = (m, id) => mktT0(m, id) * mktWant(m, id);
function mktWantDay() {
  const W = mktState().want = mktState().want || {};
  for (const m in MARKETS) {
    const w = W[m] = W[m] || {};
    for (const c of ['farm', 'fish', 'mine', 'metal', 'wood', 'food', 'forage', 'luxury', 'sea', 'craft', 'loot']) {
      const v = 1 + ((w[c] || 1) - 1) * MKT.wantBack + (Math.random() - .5) * MKT.wantStep;
      w[c] = Math.round(Math.max(.05, v) * 1000) / 1000;
    }
  }
}
const mktPf = (m, id) => 1;   // (fixed factors per town until 2026-11-04; now the stocks themselves are cheap where goods are made)
function mktState() { if (!S.mkt || !S.mkt.s) S.mkt = { s: {}, cv: [], news: [] }; return S.mkt; }
function mktStock(m, id) { const st = mktState().s[m]; return st && st[id] !== undefined ? st[id] : mktT0(m, id); }
function mktSet(m, id, v) { const s = mktState().s; (s[m] = s[m] || {})[id] = Math.max(0, Math.round(v * 10) / 10); }
// price factor against the base: what the town makes or lacks, times how full its stock is
function mktF(m, id, s) {
  if (s === undefined) s = mktStock(m, id);
  // no floor or ceiling (asked 2026-11-04): the price is wherever the town's supply and demand put it; half a unit in stock
  // is the least it counts, so an empty market is very dear but not infinite
  const T = mktT(m, id), k = Math.pow(T / Math.max(.5, s), .6);
  return mktPf(m, id) * k * (1 + Math.min(DRY_MAX, mktDry(m, id) * DRY_DAY));
}
// a dry spell (asked 2026-11-04): each morning a town's stock of a good is under a quarter of normal counts a dry day,
// and every dry day adds 5% on top of the shortage price, up to 3x after 40 days (a month out of halibut: ~2.5x); when
// it's back the count falls four days a day (S.mkt.dry[m][id])
const DRY_LOW = .25, DRY_DAY = .05, DRY_MAX = 2;
const mktDry = (m, id) => { const d = S && S.mkt && S.mkt.dry && S.mkt.dry[m]; return (d && d[id]) || 0; };
function mktDryDay() {
  const M = mktState(), D = M.dry = M.dry || {};
  for (const m in MARKETS) {
    const st = M.s[m] || {}, dm = D[m] = D[m] || {};
    for (const id of new Set([...Object.keys(st), ...Object.keys(dm)])) {
      if (!IT[id]) { delete dm[id]; continue; }
      if (mktStock(m, id) / mktT(m, id) < DRY_LOW) {
        dm[id] = (dm[id] || 0) + 1;
        if (dm[id] === 14 || dm[id] === 30) mktNews(mktName(m) + ' has been out of ' + IT[id].n.toLowerCase() + ' for ' + (dm[id] === 14 ? 'two weeks' : 'a month') + ': the price there keeps climbing.');
      } else if (dm[id]) { dm[id] = Math.max(0, dm[id] - 4); if (!dm[id]) delete dm[id]; }
    }
    if (!Object.keys(dm).length) delete D[m];
  }
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
  const r = mktStock(m, id) / mktT(m, id), d = mktDry(m, id);
  if (d >= 3) return '▲ Out of it for ' + d + ' days here';
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
  mktDryDay();   // counted on the morning's stocks, before production refills them
  for (const m in st) for (const id in st[m]) if (!IT[id] || !MARKETS[m]) delete st[m][id];
  mktWantDay();
  mktLife();
  // shortages and gluts: one or two a day
  const ev = MKT.events[0] + Math.floor(Math.random() * (MKT.events[1] - MKT.events[0] + 1));
  for (let e = 0; e < ev; e++) {
    const m = pickR(Object.keys(MARKETS)), c = pickR(['farm', 'fish', 'mine', 'metal', 'wood', 'food', 'forage', 'luxury', 'sea', 'craft']), k = Math.random() < .55 ? .4 : 1.8;
    for (const id of mktIds()) if (mktCat(id) === c && IT[id].p <= 600) mktSet(m, id, mktStock(m, id) * k);   // everyday goods, not legendary fish or rare gems
    mktNews(mktName(m) + (k < 1 ? ' is short of ' : ' has more ' + CAT_N[c] + ' than it can use: ') + (k < 1 ? CAT_N[c] + ': prices are up there.' : 'prices are down there.'));
  }
  // traders: along each road, goods go from where the stock is high to where it's low (up to MKT.loads loads per good a
  // day, where the stock gap is over MKT.gap, so a maker stays cheaper than a user)
  const ids = new Set(); for (const m in st) for (const id in st[m]) ids.add(id);
  for (const id of ids) for (let it = 0; it < MKT.loads; it++) {
    let best = null, gap = MKT.gap;
    for (const [a, b, mins] of LINKS) {
      const ra = mktStock(a, id) / mktT(a, id), rb = mktStock(b, id) / mktT(b, id);
      if (ra - rb > gap) { gap = ra - rb; best = [a, b, mins]; } else if (rb - ra > gap) { gap = rb - ra; best = [b, a, mins]; }
    }
    if (!best) break;
    const [a, b, mins] = best, Ta = mktT(a, id), Tb = mktT(b, id), q = Math.floor(MKT.load * gap / (1 / Ta + 1 / Tb));
    if (q < 1) break;
    mktSet(a, id, mktStock(a, id) - q); mktShip(id, q, a, b, mins);
  }
  // the day's caravans in the news: the biggest two, and any the bandits took
  const today = M.cv.filter(c => c.day === dayIndex());
  for (const c of today.filter(c => c.lost)) mktNews('Bandits took a caravan of ' + cvSay(c) + ' on the road to ' + mktName(c.to) + '.');
  today.filter(c => !c.lost && cvValue(c) >= 2500).sort((x, y) => cvValue(y) - cvValue(x)).slice(0, 2).forEach(c => mktNews('A caravan of ' + cvSay(c) + ' left ' + mktName(c.from) + ' for ' + mktName(c.to) + '.'));
}
// who can make a good, with a weight: its region only for regional goods; else the towns that make its kind (PROD), and
// any lowland town now and then (MKT.side). Dear goods are made and traded like any other; monster loot is only traded (cached)
const LOWLAND = ['village', 'kingsbridge', 'greyhelm', 'ashford', 'saltmere'];
let MKT_MAKERS = null;
function mktMakers(id) {
  if (!MKT_MAKERS) MKT_MAKERS = {};
  if (MKT_MAKERS[id]) return MKT_MAKERS[id];
  const own = Object.keys(MARKETS).find(m => MARKETS[m].own && MARKETS[m].own.has(id)), c = mktCat(id);
  if (own) return MKT_MAKERS[id] = [[own, 1.5]];
  if (IT[id].t === 'loot') return MKT_MAKERS[id] = [];   // monster loot comes only from monsters: traded, never made
  const w = {}; for (const m of LOWLAND) w[m] = MKT.side; for (const m in PROD) if (PROD[m][c]) w[m] = PROD[m][c];
  return MKT_MAKERS[id] = Object.entries(w);
}
// today's makers of a good: 1 or 2 towns (MKT.makers), drawn by weight; a regional good is made in its region on MKT.chance of days
function mktToday(makers) {
  if (makers.length === 1) return Math.random() < MKT.chance ? makers : [];
  const pool = makers.slice(), out = [], n = MKT.makers[0] + Math.floor(Math.random() * (MKT.makers[1] - MKT.makers[0] + 1));
  while (out.length < n && pool.length) {
    let r = Math.random() * pool.reduce((t, p) => t + p[1], 0), i = 0;
    while ((r -= pool[i][1]) > 0 && i < pool.length - 1) i++;
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
// one day of making and using: each maker produces with MKT.chance, every town uses its share, everything is pulled a little
// back to normal (trade from afar) and drifts. A maker settles around 1.5-2.5x normal stock, a heavy user around 0.6x
function mktLife() {
  const M = mktState(), st = M.s, made = M.made = {};   // made: town -> goods made there today (the Markets tab)
  for (const id of mktIds()) {
    const makers = mktMakers(id), today = mktToday(makers), c = mktCat(id);
    for (const [m] of today) (made[m] = made[m] || []).push(id);
    for (const m in MARKETS) {
      const T = mktT0(m, id), want = mktWant(m, id); let s = mktStock(m, id);
      if (makers.length) {
        if (today.some(p => p[0] === m)) s += T * MKT.k * (MKT.yield[0] + Math.random() * (MKT.yield[1] - MKT.yield[0]));   // a good or a poor day's making
        s -= s * ((USE[m] && USE[m][c]) || MKT.use0) * MKT.useK * want;   // a town that wants more uses more
      }
      s += (T - s) * MKT.relax;
      s = Math.max(0, s * (1 + (Math.random() - .5) * MKT.drift));
      const r = s / T;
      if (Math.abs(r - 1) < .02) { if (st[m]) delete st[m][id]; }
      else (st[m] = st[m] || {})[id] = s >= 10 ? Math.round(s) : Math.round(s * 10) / 10;
    }
  }
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
// the chance a try sells: 70% of the village price always, 100% half the time, 130% one in eight, 160% hardly ever, and
// no villager pays 2-3x (asked 2026-11-04: no ceiling on stall prices, since towns can pay that much; traders still buy)
const stallChance = mul => Math.min(1, .5 * Math.pow(2, (1 - mul) / .15));
// − and + move 5% up to double the village price, 10% up to 4x, then 25%
const stallStep = (mul, d) => { const m = d < 0 ? mul - .001 : mul; return m < 2 ? .05 : m < 4 ? .1 : .25; };
const stallPace = mul => { const c = stallChance(mul); return c >= .9 ? 'sells fast' : c >= .45 ? 'sells steadily' : c >= .2 ? 'sells slowly' : c >= .08 ? 'sells now and then' : 'hardly sells'; };
openStall = function () {
  S.stall = S.stall || { goods: {}, earned: 0 }; S.stall.mul = S.stall.mul || {}; stallClean();
  openModal('Market Stall', [{ id: 's', label: 'Stall', render: b => {
    stallAutoPrice();
    const auto = el('input', { type: 'checkbox' }); auto.checked = !!S.stall.autoTrader;
    auto.onchange = () => { S.stall.autoTrader = auto.checked; S.stall.autoDay = {}; stallAutoPrice(); refresh(); };
    b.append(el('label', { class: 'note', title: 'Each morning, after the markets move, every good on display is priced at the most a trader would pay. Goods you put out later are priced at once.' }, auto,
      ' Match the trader price every day' + (S.stall.autoTrader && !intelOn() ? ' (paused: needs market analysis from the Market news tab)' : !intelOn() ? ' (needs market analysis)' : '')));
    b.append(el('p', { class: 'note' }, 'Open 8:00 to 18:00. Set each price against what the village pays: the cheaper, the faster it sells. Traders call in the morning, at midday and in the evening (9:00, 13:00, 17:00) and buy anything a town pays more for than your price (after their 15%). Earned so far: ' + S.stall.earned.toLocaleString() + 'g.'));
    const on = el('div', { class: 'stallgrid' });
    for (const k in S.stall.goods) {
      const [id, q] = parseK(k), mul = stallMul(k), set = d => { S.stall.mul[k] = Math.max(.1, Math.round((mul + d * stallStep(mul, d)) * 100) / 100); refresh(); };
      const offer = stallOffer(k);
      on.append(el('div', { class: 'scard', title: offer }, el('div', { class: 'shead' }, icon(id, 24, q), el('b', null, IT[id].n + ' ×' + S.stall.goods[k])),
        el('small', null, stallEach(k) + 'g each · ' + Math.round(mul * 100) + '% · ' + stallPace(mul)), offer ? el('small', { class: 'soffer' }, offer) : null,
        el('div', { class: 'sacts' }, el('button', { class: 'btn ghost', on: () => set(-1) }, '−'), el('button', { class: 'btn ghost', on: () => set(1) }, '+'),
          intelOn() && stallTraderMul(k) ? el('button', { class: 'btn ghost', title: 'Set your price to the most a trader would pay', on: () => { S.stall.mul[k] = stallTraderMul(k); refresh(); } }, 'Trader') : null,
          el('button', { class: 'btn ghost', on: () => { GIVE_NO_DROP = true; const left = give(id, S.stall.goods[k], q, true); GIVE_NO_DROP = false; if (left) S.stall.goods[k] = left; else delete S.stall.goods[k]; refresh(); } }, 'Take back'))));
    }
    // a search, and how many go out per click (round 4: a click put the whole stack out)
    const sq = (MODAL.opts.sq || '').toLowerCase(), amt = MODAL.opts.sn === undefined ? 10 : MODAL.opts.sn;
    const ks = sortedInv().filter(k => valK(k) > 0 && !IT[parseK(k)[0]].slot && (!sq || IT[parseK(k)[0]].n.toLowerCase().includes(sq))), add = el('div', { class: 'grid' });
    for (const k of ks) { const [id, q] = parseK(k); add.append(el('button', { class: 'cell f-slot', title: IT[id].n, on: () => { const n = Math.min(S.inv[k] || 0, amt === 'All' ? Infinity : amt); if (!n) return; takeK(k, n); S.stall.goods[k] = (S.stall.goods[k] || 0) + n; refresh(); } }, icon(id, 32, q), el('b', null, S.inv[k]))); }
    const find = el('input', { class: 'f-input', placeholder: 'Find in your backpack…', value: MODAL.opts.sq || '' });
    find.oninput = () => { MODAL.opts.sq = find.value; refresh(); setTimeout(() => { const f = document.querySelector('#mbody input[placeholder^="Find in your"]'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0); };
    const chips = el('div', { class: 'chips' }, el('span', null, 'Put out per click:'), ...STALL_AMTS.map(a => el('button', { class: 'chip' + (amt === a ? ' on' : ''), on: () => { MODAL.opts.sn = a; refresh(); } }, String(a))));
    b.append(el('h3', null, 'Put out from your backpack'), el('div', { class: 'acts wrap' }, find), chips, ks.length ? add : el('p', { class: 'note' }, sq ? 'Nothing in your backpack matches.' : 'Nothing to put out.'));
    b.append(el('h3', null, 'On display'), on.children.length ? on : el('p', { class: 'note' }, 'Nothing on display.'));
  } }, { id: 'orders', label: 'Buy orders', render: renderOrders }, { id: 'log', label: 'Log', render: renderStallLog }, { id: 'mkt', label: 'Market news', render: renderIntel }]);
};
/* ---- the stall's log (asked 2026-11-04): every sale and every delivered order of the last game year (112 days), by day
   (S.stall.log: d day index, h minute, k sold | trader | bought, id item key, n, g gold, w town) ---- */
const LOG_DAYS = 112;
function stallLog(k, key, n, g, w) {
  const st = S.stall, L = st.log = st.log || [], d = dayIndex();
  L.push({ d, h: Math.round(S.time), k, id: key, n, g, w: w || null });
  while (L.length && L[0].d <= d - LOG_DAYS) L.shift();
}
const dayName = d => { const y = Math.floor((d - 1) / 112) + 1, r = (d - 1) % 112; return SEASONS[Math.floor(r / 28)] + ' ' + (r % 28 + 1) + (y > 1 ? ', year ' + y : ''); };
const clockName = h => { const hh = Math.floor(h / 60) % 24, mm = Math.round(h % 60); return (hh % 12 || 12) + ':' + String(mm).padStart(2, '0') + (hh < 12 ? ' am' : ' pm'); };
function renderStallLog(b) {
  const L = (S.stall.log || []).slice(), today = dayIndex();
  const sum = (f, k) => L.filter(f).filter(e => e.k === k || (k === 'sold' && e.k === 'trader')).reduce((t, e) => t + e.g, 0);
  const week = e => e.d > today - 7;
  b.append(el('p', { class: 'note' }, 'Every sale and every delivered buy order of the last year (112 days), newest first.'));
  b.append(el('div', { class: 'list' },
    el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, 'Last 7 days'), el('small', null, 'Sold ' + sum(week, 'sold').toLocaleString() + 'g · bought ' + sum(week, 'bought').toLocaleString() + 'g'))),
    el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, 'This year'), el('small', null, 'Sold ' + sum(() => true, 'sold').toLocaleString() + 'g · bought ' + sum(() => true, 'bought').toLocaleString() + 'g')))));
  if (!L.length) { b.append(el('p', { class: 'note' }, 'Nothing sold or bought yet.')); return; }
  const days = [...new Set(L.map(e => e.d))].sort((a, c) => c - a), shown = MODAL.opts.logN || 14;
  for (const d of days.slice(0, shown)) {
    const es = L.filter(e => e.d === d).reverse(), so = es.filter(e => e.k !== 'bought').reduce((t, e) => t + e.g, 0), bo = es.filter(e => e.k === 'bought').reduce((t, e) => t + e.g, 0);
    b.append(el('h3', null, (d === today ? 'Today, ' : d === today - 1 ? 'Yesterday, ' : '') + dayName(d) + ' · sold ' + so.toLocaleString() + 'g' + (bo ? ', bought ' + bo.toLocaleString() + 'g' : '')));
    const box = el('div', { class: 'list' });
    for (const e of es) {
      const [id, q] = parseK(e.id), name = IT[id] ? (q ? QNAME[q] + ' ' : '') + IT[id].n.toLowerCase() : e.id;
      const it = name + ' ×' + e.n, what = e.k === 'bought' ? 'Bought ' + it + (e.w && e.w !== AFAR ? ' from ' + mktName(e.w) : '') + ' (buy order)'
        : e.k === 'trader' ? 'Sold ' + it + ' to a trader' + (e.w ? ' bound for ' + mktName(e.w) : '') : 'Sold ' + it + ' to a villager';
      box.append(el('div', { class: 'rrow' }, IT[id] ? icon(id, 24, q) : null, el('div', { class: 'rtxt' }, el('b', null, what), el('small', null, clockName(e.h) + ' · ' + (e.k === 'bought' ? '−' : '+') + e.g.toLocaleString() + 'g'))));
    }
    b.append(box);
  }
  if (days.length > shown) b.append(el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => { MODAL.opts.logN = shown + 28; refresh(); } }, 'Show older days (' + (days.length - shown) + ' more)')));
}
/* ---- buy orders (asked 2026-11-04): you name an item, your top price and how many; the traders who call (9:00, 13:00 and 17:00; was every two
   hours) buy it in a town whose shop sells it under your price, take it from that town's stock and bring it (the town's shop
   price, `ORDER_CUT` x the market price, so an order saves the walk but is never cheaper than buying there yourself). You pay your price when it arrives; deliveries wait in the stall (S.stall.orders, S.stall.bought). ---- */
const ORDER_CUT = 1.25;   // as town shops charge (x_realm.js); 1.1 let an order buy Greyhelm ore that resold in the village at +25%
// besides trade goods, orders take seeds, saplings, fertiliser, placeables and the like, and gear up to iron (no better tools,
// weapons, armour or rings); those come from the traders' own stock at a little over the usual price, up to 20 a visit
const ORDER_TYPES = new Set(['seed', 'sapling', 'fert', 'feed', 'place', 'path', 'ammo', 'implement', 'boat', 'fishtool', 'buildtool']);
const orderable = id => { const it = IT[id]; if (!it || !(it.p > 0)) return false; if (mktTracks(id) || ORDER_TYPES.has(it.t)) return true; return ['weapon', 'armor'].includes(it.t) && (it.ti || 0) <= 3; };
const AFAR = 'afar', srcName = m => m === AFAR ? 'their own stock' : mktName(m);
const orderCost = (m, id) => Math.max(1, Math.round(valBase(id) * mktF(m, id) * ORDER_CUT));   // what a trader needs from you to bring one from m
function orderBest(id) { if (!mktTracks(id)) return orderable(id) ? [AFAR, Math.max(1, Math.round(IT[id].p * 1.1))] : null; let best = null; for (const m in MARKETS) { if (mktStock(m, id) < 1) continue; const c = orderCost(m, id); if (!best || c < best[1]) best = [m, c]; } return best; }
function renderOrders(b) {
  const st = S.stall; st.orders = st.orders || []; st.bought = st.bought || {};
  b.append(el('p', { class: 'note' }, 'Ask the travelling traders to bring goods. Three times a day (9:00, 13:00, 17:00) they buy them in a town whose shop sells them under your price and bring them here; you pay your price when they arrive (you need the gold then, not now). It saves the trip, at the town’s own price.'));
  const got = Object.keys(st.bought).filter(id => st.bought[id] > 0 && IT[id]);
  if (got.length) {
    const L = el('div', { class: 'list' });
    for (const id of got) L.append(el('div', { class: 'rrow' }, icon(id, 32), el('div', { class: 'rtxt' }, el('b', null, IT[id].n + ' ×' + st.bought[id]), el('small', null, 'Delivered')),
      el('div', { class: 'acts' }, el('button', { class: 'btn', on: () => { GIVE_NO_DROP = true; const left = give(id, st.bought[id], 0, true); GIVE_NO_DROP = false; if (left) { st.bought[id] = left; toast('No room for all of it.', 'bad'); } else delete st.bought[id]; refresh(); } }, 'Take'))));
    b.append(el('h3', null, 'Delivered'), L);
  }
  const L = el('div', { class: 'list' });
  st.orders.forEach((o, i) => {
    const best = orderBest(o.id), now = best ? (best[1] <= o.price ? 'A trader can get it now from ' + srcName(best[0]) + ' (' + best[1] + 'g).' : 'Cheapest now: ' + srcName(best[0]) + ', ' + best[1] + 'g. Raise your price or wait for a glut.') : 'No town has any.';
    L.append(el('div', { class: 'rrow' }, icon(o.id, 32), el('div', { class: 'rtxt' }, el('b', null, IT[o.id].n + ': ' + o.left + ' more at up to ' + o.price + 'g'), el('small', null, now)),
      el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => { st.orders.splice(i, 1); refresh(); } }, 'Cancel'))));
  });
  b.append(el('h3', null, 'Your orders'), st.orders.length ? L : el('p', { class: 'note' }, 'No orders yet.'));
  // a new order: find the item, then the price and how many
  const ids = Object.keys(IT).filter(orderable).sort((a, b2) => IT[a].n.localeCompare(IT[b2].n)), q0 = MODAL.opts.oq || '';
  const sel = el('select', { class: 'f-input' }), find = el('input', { class: 'f-input', placeholder: 'Find an item…', value: q0 });
  const price = el('input', { class: 'f-input', type: 'number', min: 1, style: 'width:90px' }), qty = el('input', { class: 'f-input', type: 'number', min: 1, value: 10, style: 'width:70px' }), hint = el('small', null, '');
  const setPrice = () => { const id = sel.value; if (!id) { hint.textContent = ''; return; } const best = orderBest(id); price.value = best ? best[1] : Math.round(valBase(id) * ORDER_CUT); hint.textContent = best ? 'Cheapest now: ' + srcName(best[0]) + ', ' + best[1] + 'g each.' : 'No town has any right now.'; };
  const fill = () => { const q = find.value.toLowerCase(); sel.innerHTML = ''; for (const id of ids.filter(id => !q || IT[id].n.toLowerCase().includes(q)).slice(0, 150)) sel.append(el('option', { value: id }, IT[id].n)); setPrice(); };
  find.oninput = () => { MODAL.opts.oq = find.value; fill(); }; sel.onchange = setPrice;
  const place = el('button', { class: 'btn', on: () => {
    const id = sel.value, p = Math.max(1, Math.round(+price.value || 0)), n = Math.max(1, Math.round(+qty.value || 0));
    if (!id || !IT[id]) { toast('Pick an item first.', 'bad'); return; }
    const o = st.orders.find(o => o.id === id); if (o) { o.price = p; o.left += n; } else st.orders.push({ id, price: p, left: n });
    toast('Order placed: ' + n + ' ' + IT[id].n.toLowerCase() + ' at up to ' + p + 'g each.'); SFX.ok(); refresh();
  } }, 'Place order');
  b.append(el('h3', null, 'New order'), el('div', { class: 'acts wrap' }, find, sel), el('div', { class: 'acts wrap' }, el('span', null, 'Up to'), price, el('span', null, 'g each, how many'), qty, place), el('p', { class: 'note' }, hint));
  fill();
}
// which orders a trader can fill on this visit: the cheapest town under your price, as much as you can pay for (40% of a
// town's stock at most, so one order can't empty it)
function stallOrderDeals() {
  const out = []; let gold = S.gold;
  for (const o of (S.stall.orders || [])) {
    if (o.left < 1 || !IT[o.id]) continue;
    const best = orderBest(o.id); if (!best || best[1] > o.price) continue;
    const q = Math.min(o.left, best[0] === AFAR ? 20 : Math.floor(mktStock(best[0], o.id) * .4), Math.floor(gold / o.price)); if (q < 1) continue;
    gold -= q * o.price; out.push({ o, m: best[0], q });
  }
  return out;
}
function stallOrdersFill(list) {
  const st = S.stall; st.bought = st.bought || {}; const said = [];
  for (const { o, m, q: want } of list) {
    const q = Math.min(want, o.left, Math.floor(S.gold / o.price), m === AFAR ? want : Math.floor(mktStock(m, o.id))); if (q < 1) continue;
    S.gold -= q * o.price; if (m !== AFAR) mktSet(m, o.id, mktStock(m, o.id) - q); st.bought[o.id] = (st.bought[o.id] || 0) + q; o.left -= q;
    stallLog('bought', o.id, q, q * o.price, m);
    said.push(q + ' ' + IT[o.id].n.toLowerCase() + (m === AFAR ? '' : ' from ' + mktName(m)) + ' (' + (q * o.price).toLocaleString() + 'g)');
  }
  st.orders = (st.orders || []).filter(o => o.left > 0);
  if (said.length) { toast('A trader brought your order: ' + said.join(', ') + '. It’s waiting at your stall.', 'lvl'); SFX.coin(); }
}
// what the traders would pay: the town that's short of it, and the most they'd give (its price less their 15%)
function stallBest(k) {
  const [id] = parseK(k); if (!mktTracks(id)) return null;
  let best = null;
  for (const m in MARKETS) { const pays = Math.round(valBase(k) * mktF(m, id) * .85); if (!best || pays > best[1]) best = [m, pays]; }
  return best;
}
// the stall multiplier that asks exactly what the best trader would pay (or null)
function stallTraderMul(k) {
  const b = stallBest(k), v = Math.max(1, Math.round(mktSellPrice(parseK(k)[0], valBase(k)))); if (!b) return null;
  let m = Math.floor(b[1] / v * 100) / 100; while (m > .1 && Math.max(1, Math.round(v * m)) > b[1]) m -= .01;
  return Math.max(.1, Math.round(m * 100) / 100);
}
function stallOffer(k) {
  const [id] = parseK(k); if (!mktTracks(id)) return '';
  if (!intelOn()) return 'Hire market analysis (Market news tab) to see what traders would pay.';
  let best = null;
  for (const m in MARKETS) { const pays = Math.round(valBase(k) * mktF(m, id) * .85); if (!best || pays > best[1]) best = [m, pays]; }
  if (!best) return '';
  return 'Best for a trader: ' + mktName(best[0]) + ', up to ' + best[1] + 'g' + (stallEach(k) <= best[1] ? ': a trader would take it.' : ', under your price.');
}
// goods whose item no longer exists are dropped from the stall (an unknown key threw on every tick)
const stallClean = () => { if (S && S.stall && S.stall.goods) for (const k in S.stall.goods) if (!IT[parseK(k)[0]]) delete S.stall.goods[k]; if (S && S.stall && S.stall.orders) S.stall.orders = S.stall.orders.filter(o => IT[o.id] && o.left > 0); };
const STALL_AMTS = [1, 5, 10, 25, 'All'];
const stallBuilt = () => S && S.stall && S.structures && S.structures.some(s => s.k === 'stall' && s.stage >= 4) && (stallClean(), true);
function stallSell(k, n, each, who, to) {
  const [id] = parseK(k); n = Math.min(n, S.stall.goods[k] || 0); if (!n) return 0;
  S.stall.goods[k] -= n; if (S.stall.goods[k] <= 0) delete S.stall.goods[k];
  S.gold += each * n; S.stall.earned += each * n; S.stats.shipped[id] = (S.stats.shipped[id] || 0) + n;
  stallLog(who ? 'trader' : 'sold', k, n, each * n, to);
  if (!who) mktSet('village', id, mktStock('village', id) + n);
  return each * n;
}
let stallHr2 = -1;
EVT.on('tick', () => {
  if (!stallBuilt() || PAUSED) return;
  const hr = Math.floor(S.time / 60); if (hr === stallHr2) return; stallHr2 = hr;
  if (hr < 8 || hr >= 18) return;
  if (TRADER_HRS.includes(hr)) stallTrader();
  if (!Object.keys(S.stall.goods).length) return;
  const weekend = (dayIndex() - 1) % 7 >= 5, pend = [];
  for (let i = 0; i < (weekend ? 6 : 3); i++) {
    const ks = Object.keys(S.stall.goods); if (!ks.length) break;
    const k = pickR(ks), mul = stallMul(k); if (Math.random() > stallChance(mul)) continue;
    pend.push({ k, n: 1 + Math.floor(Math.random() * 3) });
  }
  if (!pend.length) return;
  // on the farm you see the passer-by walk up to the stall and buy (2026-11-04: sales were invisible); elsewhere it just happens
  if (cur && cur.id === 'farm' && BUYERS.length < 3 && buyerWalk(pend)) return;
  stallPasserSell(pend);
});
function stallPasserSell(pend) {
  let earned = 0; const sold = [];
  for (const { k, n } of pend) { const g = S.stall.goods[k] ? stallSell(k, n, stallEach(k)) : 0; if (g) { earned += g; sold.push(IT[parseK(k)[0]].n.toLowerCase()); } }
  if (earned) { toast('Your stall sold ' + [...new Set(sold)].join(', ') + ' for ' + earned + 'g.'); SFX.coin(); }
}
/* ---- passers-by you can see: a villager walks in from the village road, stops at the stall, buys and goes back ---- */
const BUYERS = [], BUYER_LOOKS = [['#f0c8a0', '#5a3a22', 'long', '#a8402a'], ['#c89070', '#2a1a10', 'short', '#4a6a8a'], ['#e0b090', '#c89a50', 'bun', '#6a8a4a'], ['#a87050', '#3a2a2a', 'spiky', '#8a6a3a']];
BUYER_LOOKS.forEach(([skin, hair, hs, shirt], i) => Object.defineProperty(NPCS, 'mkt_buyer' + i, { value: { n: 'Villager', role: 'Shopper', shop: 'k_buyer', P: HP(0, { skin, hair, hs, shirt, pants: '#4a3a2a', apron: i % 2 ? null : '#e8dcc0' }), love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true }));
function buyerWalk(pend) {
  const m = MAPS.farm, s = S.structures.find(s => s.k === 'stall' && s.stage >= 4); if (!m || !s) return false;
  const sx = m.w - 2, sy = 18 + (BUYERS.length % 2), gx = s.x + (BUYERS.length % 3), gy = s.y + BP.stall.h;
  const path = findPath(m, sx, sy, gx, gy, 8000); if (!path) return false;
  const free = BUYER_LOOKS.findIndex((_, i) => !BUYERS.some(b => b.n.id === 'mkt_buyer' + i)); if (free < 0) return false;
  const n = { id: 'mkt_buyer' + free, x: (sx + .5) * 16, y: (sy + .8) * 16, hx: (sx + .5) * 16, hy: (sy + .8) * 16, dir: 1, walk: true, t: 1e9, vx: 0 };
  m.npcs = (m.npcs || []).filter(q => q.id !== n.id); m.npcs.push(n);
  BUYERS.push({ n, path, pi: 1, phase: 1, wait: 0, pend }); return true;
}
function buyerFrame(dt) {
  const m = MAPS.farm;
  for (const B of BUYERS.slice()) {
    const n = B.n, gone = () => { if (m && m.npcs) m.npcs = m.npcs.filter(q => q !== n); BUYERS.splice(BUYERS.indexOf(B), 1); };
    if (!m || cur !== m || !m.npcs.includes(n)) { if (B.phase === 1) stallPasserSell(B.pend); gone(); continue; }
    if (B.wait > 0) { B.wait -= dt; n.walk = false; if (B.wait <= 0) { const p = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), m.w - 2, 18, 8000); if (!p) { gone(); continue; } B.path = p; B.pi = 1; B.phase = 2; } continue; }
    const node = B.path && B.path[B.pi];
    if (!node) { if (B.phase === 1) { stallPasserSell(B.pend); B.pend = []; B.wait = 1.8; n.dir = 3; } else gone(); continue; }
    const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
    if (d < 2) { B.pi++; continue; }
    const sp = 34 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.hx = n.x; n.hy = n.y; n.walk = true;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  }
}
doorAction = (f => function (act, who) {
  if (act !== 'k_buyer') return f(act, who);
  storyDialog([[who, pickR(['Fresh from your own fields? Lovely.', 'Mara never has these. I\'ll take a few.', 'Your prices are fair. Mostly.'])]], { title: 'Villager' });
})(doorAction);
// a trader looks for goods some town is short of, and buys them if your price leaves them a margin there
// what a trader buys at the stall (asked 2026-11-08: "traders can buy large quantities and different goods; sometimes they buy
// almost nothing"): for every good on display, the town that pays most (your price must not be above what it pays after
// the trader's 15% cut); the amount is what that town lacks, else a third of its usual stock, at least 5 while you have them;
// up to TRADER_GOODS different goods, the best gains first, within a purse of TRADER_PURSE gold. It used to take one good,
// and only what the town lacked or 15% of its usual stock, often a unit or two.
const TRADER_GOODS = 5, TRADER_PURSE = 6000;
function stallTraderDeal() {
  const best = [];
  for (const k in S.stall.goods) {
    const [id] = parseK(k); if (!mktTracks(id) || !(S.stall.goods[k] > 0)) continue;
    const each = stallEach(k); let deal = null;
    for (const m in MARKETS) {
      const s = mktStock(m, id), T = mktT(m, id);
      const pays = Math.round(valBase(k) * mktF(m, id) * .85); if (each > pays) continue;
      const q = Math.min(S.stall.goods[k], Math.max(Math.ceil(T - s), Math.ceil(T / 3), 5)), gain = (pays - each) * q;
      if (q > 0 && (!deal || gain > deal.gain || (gain === deal.gain && T - s > deal.short))) deal = { k, id, m, q, each, gain, short: T - s };
    }
    if (deal) best.push(deal);
  }
  best.sort((a, b) => b.gain - a.gain || b.each * b.q - a.each * a.q);
  const out = []; let purse = TRADER_PURSE;
  for (const d of best) { if (out.length >= TRADER_GOODS || purse < d.each) break; d.q = Math.min(d.q, Math.floor(purse / d.each)); if (d.q <= 0) continue; purse -= d.q * d.each; out.push(d); }
  return out.length ? out : null;
}
const TRADER_HRS = [9, 13, 17];   // when traders call at the stall: morning, midday, evening (asked 2026-11-04; it was every two hours, and 10:00 and 15:00 before that)
function stallTrader() {
  if (TRADER.n) return;   // one already on the way
  const sell = stallTraderDeal(), orders = stallOrderDeals(); if (!sell && !orders.length) return;
  const d = { sell, orders };
  if (cur && cur.id === 'farm' && !TRADER.n) { traderWalk(d); return; }
  stallTraderBuy(d);
}
function stallTraderBuy(v) {
  if (v.orders && v.orders.length) stallOrdersFill(v.orders);
  const deals = Array.isArray(v.sell) ? v.sell : v.sell ? [v.sell] : [], bought = []; let total = 0;
  for (const d of deals) {
    if (!S.stall.goods[d.k]) continue;
    const g = stallSell(d.k, Math.min(d.q, S.stall.goods[d.k]), d.each, 'trader', d.m), n = Math.round(g / d.each); if (!g) continue;
    const L = LINKS.find(([a, b]) => (a === 'village' && b === d.m) || (b === 'village' && a === d.m));
    mktShip(d.id, n, 'village', d.m, L ? L[2] : 600); total += g; bought.push(n + ' ' + IT[d.id].n.toLowerCase() + ' (for ' + mktName(d.m) + ')');
  }
  if (bought.length) { toast('A trader bought ' + bought.join(', ') + ' at your stall for ' + total.toLocaleString() + 'g.', 'lvl'); SFX.coin(); }
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
update = (f => function (dt) { f(dt); if (S && !TITLE) { traderFrame(dt); buyerFrame(dt); caravanFrame(dt); } })(update);
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
  b.append(el('h3', null, 'Where prices stand'), el('p', { class: 'note' }, 'Prices are shown against the usual price (100%). Click a town for everything it is short of and has plenty of.'));
  const L = el('div', { class: 'list' }), here = mktHere();
  for (const m of [here, ...Object.keys(MARKETS).filter(m => m !== here)]) {
    const st = (S.mkt && S.mkt.s[m]) || {}, rows = Object.keys(st).filter(id => IT[id]).map(id => [id, st[id] / mktT(m, id)]);
    // the same thresholds as the shop notes (scarce under 80% of the normal stock, plentiful over 125%), with the price against normal
    const pct = id => IT[id].n + ' ' + Math.round(mktF(m, id) * 100) + '%';
    const short = rows.filter(r => r[1] < .8).sort((a, b) => a[1] - b[1]).slice(0, 4).map(r => pct(r[0])), glut = rows.filter(r => r[1] > 1.25).sort((a, b) => b[1] - a[1]).slice(0, 4).map(r => pct(r[0]));
    const mk = ((S.mkt && S.mkt.made && S.mkt.made[m]) || []).filter(id => IT[id]).sort((a, c) => IT[c].p - IT[a].p), made = mk.length ? 'Made here today: ' + mk.slice(0, 6).map(id => IT[id].n).join(', ') + (mk.length > 6 ? ' and ' + (mk.length - 6) + ' more' : '') + '.' : 'Nothing made here today.';
    const W = (S.mkt && S.mkt.want && S.mkt.want[m]) || {}, wk = Object.keys(W).filter(c => CAT_N[c]), more = wk.filter(c => W[c] > 1.2).map(c => CAT_N[c]), less = wk.filter(c => W[c] < .83).map(c => CAT_N[c]);
    const wants = (more.length ? ' Wants more ' + more.join(', ') + ' than usual.' : '') + (less.length ? ' Wants less ' + less.join(', ') + '.' : '');
    L.append(el('div', { class: 'rrow mtown', title: 'Everything ' + mktName(m) + ' is short of and has plenty of', on: () => mktTownOpen(m) }, el('div', { class: 'rtxt' }, el('b', null, mktName(m) + (m === here ? ' (here)' : '') + ' ›'), el('small', null, (short.length ? 'Short of ' + short.join(', ') + ' (dear). ' : '') + (glut.length ? 'Plenty of ' + glut.join(', ') + ' (cheap). ' : '') + (!short.length && !glut.length ? 'Prices as usual. ' : '') + made + wants))));
  }
  b.append(L);
}
/* ---- a town's full market (asked 2026-11-04): click a town in the Markets tab. Two scrollable lists, short of (dear) and
   plenty of (cheap), each good with its price against usual and (stock / wanted stock); goods made there today are marked ---- */
function mktTownOpen(m) {
  mktTownClose();
  const made = new Set((S.mkt && S.mkt.made && S.mkt.made[m]) || []), rows = mktIds().map(id => { const s = mktStock(m, id), T = mktT(m, id); return { id, s, T, r: s / T, f: mktF(m, id) }; });
  const short = rows.filter(x => x.r < .8).sort((a, b) => a.r - b.r), plenty = rows.filter(x => x.r > 1.25).sort((a, b) => b.r - a.r);
  const amt = v => v >= 10 ? Math.round(v).toLocaleString() : (Math.round(v * 10) / 10).toString();
  const row = x => el('div', { class: 'mtrow' }, icon(x.id, 22), el('span', { class: 'mtn' }, IT[x.id].n, made.has(x.id) ? el('i', null, ' made today') : null),
    el('b', { class: x.f >= 1 ? 'up' : 'down' }, Math.round(x.f * 100) + '%'), el('small', null, '(' + amt(x.s) + ' / ' + amt(x.T) + ')'));
  const col = (title, sub, list, cls) => el('div', { class: 'mtcol ' + cls }, el('h3', null, title + ' (' + list.length + ')'), el('p', { class: 'note' }, sub),
    el('div', { class: 'mtlist' }, ...(list.length ? list.map(row) : [el('p', { class: 'note' }, 'Nothing.')])));
  const W = (S.mkt && S.mkt.want && S.mkt.want[m]) || {}, wk = Object.keys(W).filter(c => CAT_N[c]);
  const more = wk.filter(c => W[c] > 1.2).map(c => CAT_N[c]), less = wk.filter(c => W[c] < .83).map(c => CAT_N[c]);
  const box = el('div', { id: 'mtownpop', class: 'f-panel' },
    el('div', { class: 'ph' }, el('h2', null, mktName(m) + (m === mktHere() ? ' (here)' : '')), el('button', { class: 'btn ghost', 'aria-label': 'Close', on: mktTownClose }, '✕')),
    el('p', { class: 'note' }, 'Price against the usual price, then (in stock / the stock the town wants today). ' + made.size + ' goods made here today.' + (more.length ? ' Wants more ' + more.join(', ') + ' than usual.' : '') + (less.length ? ' Wants less ' + less.join(', ') + '.' : '')),
    el('div', { class: 'mtcols' }, col('Short of', 'Under 80% of the stock it wants: dear here, a good place to sell.', short, 'short'), col('Plenty of', 'Over 125% of the stock it wants: cheap here, a good place to buy.', plenty, 'plenty')));
  document.body.append(box);
}
function mktTownClose() { const b = document.getElementById('mtownpop'); if (b) b.remove(); }
closeModal = (f => function () { mktTownClose(); return f.apply(this, arguments); })(closeModal);
addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('mtownpop')) { mktTownClose(); e.stopImmediatePropagation(); e.preventDefault(); } }, true);
document.head.append(el('style', null, `
.stallgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 6px; }
.stallgrid .scard { display: flex; flex-direction: column; gap: 2px; padding: 5px 7px; border: 2px solid rgba(80, 50, 20, .3); border-radius: 4px; background: rgba(255, 245, 220, .35); min-width: 0; }
.stallgrid .shead { display: flex; align-items: center; gap: 6px; min-width: 0; } .stallgrid .shead b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stallgrid small { font-size: 12px; line-height: 1.25; } .stallgrid .soffer { opacity: .75; }
.stallgrid .sacts { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 2px; } .stallgrid .sacts .btn { padding: 2px 8px; min-width: 0; font-size: 13px; }
.rrow.mtown { cursor: pointer; } .rrow.mtown:hover { filter: brightness(1.07); }
#mtownpop { position: fixed; z-index: 2000; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(820px, calc(100vw - 32px)); max-height: 86vh; display: flex; flex-direction: column; padding: 14px 18px 14px; box-sizing: border-box; }
#mtownpop .ph { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
#mtownpop .ph h2 { flex: 1; margin: 0; font-size: 22px !important; }
#mtownpop .mtcols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; min-height: 0; flex: 1; }
#mtownpop .mtcol { display: flex; flex-direction: column; min-height: 0; }
#mtownpop .mtcol h3 { margin: 6px 0 2px; } #mtownpop .mtcol .note { margin: 0 0 6px; }
#mtownpop .mtcol.short h3 { color: #a8402a; } #mtownpop .mtcol.plenty h3 { color: #4a7a3a; }
#mtownpop .mtlist { overflow-y: auto; max-height: 58vh; border: 2px solid rgba(80, 50, 20, .35); border-radius: 4px; background: rgba(255, 245, 220, .35); }
#mtownpop .mtrow { display: grid; grid-template-columns: 24px 1fr auto auto; align-items: center; gap: 8px; padding: 3px 8px; border-bottom: 1px solid rgba(80, 50, 20, .15); }
#mtownpop .mtrow:nth-child(odd) { background: rgba(255, 255, 255, .25); }
#mtownpop .mtn i { font-size: 11px; color: #6a7a3a; font-style: normal; }
#mtownpop .mtrow b.up { color: #a8402a; } #mtownpop .mtrow b.down { color: #4a7a3a; }
#mtownpop .mtrow small { opacity: .75; min-width: 72px; text-align: right; }
@media (max-width: 640px) { #mtownpop .mtcols { grid-template-columns: 1fr; } #mtownpop .mtlist { max-height: 30vh; } }
`));
/* ---- market analysis (asked 2026-11-04): the trade news, every town's market and what traders would pay for your stall's
   goods are a service hired at the stall, a month (28 days) at a time (S.stall.intel: the last day it runs). It used to be
   a free tab on every notice board and inn. ---- */
const INTEL_COST = 400, INTEL_DAYS = 28;
const intelOn = () => !!(S && S.stall && S.stall.intel >= dayIndex());
function renderIntel(b) {
  const st = S.stall, on = intelOn(), left = on ? st.intel - dayIndex() + 1 : 0;
  const hire = () => {
    if (S.gold < INTEL_COST) { toast('You need ' + INTEL_COST + 'g.'); return; }
    S.gold -= INTEL_COST; st.intel = Math.max(st.intel || 0, dayIndex() - 1) + INTEL_DAYS; SFX.coin && SFX.coin();
    toast('Market analysis until ' + dayName(st.intel) + '.'); refresh();
  };
  if (!on) {
    b.append(el('p', { class: 'note' }, 'Odo Fenn, a clerk who keeps the ledgers of the traders between Kingsbridge and the far regions, will send you a weekly bundle of letters and rumours: the trade news, what every town is short of and has plenty of, what it made today and wants more of, and what a trader would pay for each good on your stall.'),
      el('p', { class: 'note' }, st.intel ? 'Your last month ran out on ' + dayName(st.intel) + '.' : 'You have never hired him.'),
      el('div', { class: 'acts' }, el('button', { class: 'btn', on: hire }, 'Hire him for a month (' + INTEL_COST + 'g)')));
    return;
  }
  b.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, 'Market analysis by Odo Fenn'), el('small', null, 'Paid until ' + dayName(st.intel) + ' (' + left + (left === 1 ? ' day' : ' days') + ' left).')),
    el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: hire }, 'Add a month (' + INTEL_COST + 'g)'))));
  renderMarkets(b);
}
// (until 2026-11-04 the Markets tab was also on the farm notice board, every town board and inn: it's now the stall's hired Market news)


/* ---- market stalls sell what the town made that day (asked 2026-11-04: Kingsbridge's stalls had the same 12 goods every
   day and a region market only its fixed seeds, timber and ore). From S.mkt.made, up to 16 at Kingsbridge and 14 in a
   region, those it has most of first; nothing it's out of. Prices and stock are the market's (buyRow -> mktBuyRow). ---- */
// goods from the far regions (u_regiondata.js: their fish, forage, crops, woods and bars, and anything made from them, such
// as their dishes): a lowland stall doesn't have them
let EXOTIC = null;
function exoticGood(id) {
  if (!EXOTIC) {
    EXOTIC = new Set();
    try {
      for (const f of RFISH) EXOTIC.add(f[0]);
      for (const k in RFORAGE) for (const id of RFORAGE[k]) if (!(FORAGE.meadow || []).flat().includes(id) && !(FORAGE.coast || []).flat().includes(id)) EXOTIC.add(id);
      for (const r in RCROPS) for (const c of RCROPS[r]) EXOTIC.add(c[0]);
      for (const k in RWOOD) EXOTIC.add(RWOOD[k][0]);
      for (const t of RTIERS) if (t[3]) EXOTIC.add(t[3]);
      for (let pass = 0; pass < 3; pass++) for (const r of RC) if (r[2] && Object.keys(r[2]).some(k => EXOTIC.has(k))) EXOTIC.add(r[0]);
    } catch (e) { }
  }
  return EXOTIC.has(id);
}
const STALL_TYPES = new Set(['crop', 'fruit', 'forage', 'artisan', 'animal', 'food', 'fish']);
function marketPicks(m, n, types) {
  // only what the town made this morning (asked 2026-11-04: it's what a market stall would have), most made first
  const made = ((S.mkt && S.mkt.made && S.mkt.made[m]) || []).filter(id => IT[id]);
  // a region's own goods (and their smoked, pickled... versions) only sell there; legendary goods (over 600g) never on a stall
  const lowland = !MARKETS[m].region, foreign = id => { const base = id.replace(/^(smoked|pickles|jam|wine|juice|dried)_/, ''); return (lowland && (exoticGood(id) || exoticGood(base))) || Object.keys(MARKETS).some(k => k !== m && MARKETS[k].own && (MARKETS[k].own.has(id) || MARKETS[k].own.has(base))); };
  const ok = id => types.has(IT[id].t) && IT[id].p <= 600 && !foreign(id) && !(CROPS[id] && CROPS[id].secret && !(MARKETS[m].own && MARKETS[m].own.has(id))) && mktStock(m, id) >= 1;
  return [...new Set(made)].filter(ok).sort((a, b) => mktStock(m, b) / Math.max(1, mktT(m, b)) - mktStock(m, a) / Math.max(1, mktT(m, a))).slice(0, n)
    .sort((a, b) => IT[a].n.localeCompare(IT[b].n));
}
SHOP_STOCK.kb_stall = () => marketPicks('kingsbridge', 16, STALL_TYPES);
// a region market's Buy tab also lists that day's stalls, below its seeds, timber and ore
doorAction = (f => function (act, who) {
  const r = f.apply(this, arguments);
  if (act === 'r_trade' && MODAL && MODAL.tabs) {
    const t = MODAL.tabs.find(t => t.id === 'buy'), m = typeof mktHere === 'function' ? mktHere() : null;
    if (t && m && MARKETS[m] && !t.__stalls) { const base = t.render; t.__stalls = 1; t.render = b => { base(b); const ids = marketPicks(m, 14, new Set([...STALL_TYPES, 'mat', 'ore', 'gem'])); b.append(el('h3', null, 'At the stalls today'), el('p', { class: 'note' }, 'What the town made this morning: it changes every day.')); const L = el('div', { class: 'list' }); for (const id of ids) L.append(buyRow(id, Math.max(5, Math.round((IT[id].p || 20) * 1.25)))); b.append(ids.length ? L : el('p', { class: 'note' }, 'The stalls are bare today.')); }; drawModal(); }
  }
  return r;
})(doorAction);

/* Match the trader price every day (asked 2026-11-07): a checkbox on the stall (S.stall.autoTrader). Each morning after
   the markets move (mktDaily), and whenever the stall window is drawn, every good on display that hasn't been priced
   today is set to the most a trader would pay (stallTraderMul), so new goods are priced at once and your − / + changes
   hold for the rest of the day (S.stall.autoDay[k] = the day it was set). Like the Trader button it needs market analysis
   (intelOn); goods no trader buys keep their price. */
function stallAutoPrice() {
  const st = S && S.stall; if (!st || !st.autoTrader || !intelOn() || !st.goods) return;
  st.mul = st.mul || {}; st.autoDay = st.autoDay || {}; const d = dayIndex();
  for (const k in st.goods) { if (st.autoDay[k] === d) continue; const m = stallTraderMul(k); if (m) st.mul[k] = m; st.autoDay[k] = d; }
  for (const k in st.autoDay) if (!st.goods[k]) delete st.autoDay[k];
}
mktDaily = (f => function () { const r = f.apply(this, arguments); try { if (S && S.stall) S.stall.autoDay = {}; stallAutoPrice(); } catch (e) { console.error(e); } return r; })(mktDaily);
