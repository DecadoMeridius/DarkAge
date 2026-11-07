/* ================= Farming: sprinkler reach, seeds back, crop breeding (asked 2026-11-04) =================
   - Holding a sprinkler shows the tiles it would water around the tile you aim at (tilled soil brighter), and faintly
     what the sprinklers already placed reach; on the farm and in the greenhouse.
   - Seeds back: a harvest gives a seed of that crop (or strain) with a chance of 5% + 0.25% a Farming level (~30% at 99).
   - Crosses: harvesting a crop with a different, grown crop or strain next to it (any of the 8 tiles, at least half grown)
     gives a cross seed now and then (4% + 0.1% a Farming level). The cross is a strain of one parent's crop with the
     parents' traits mixed and a little changed (more when the two crops differ): growth speed (g), extra produce per
     harvest (y), worth and colour (v, col) and hardiness (h: survives the change of season and plants in any season).
     A cross like an existing strain is that strain. Strains breed on, so generations improve.
   - Strains live in S.strains (k, g, y, v, h, col, name, gen, pa); each has seed items '<crop>_seed~<i>' (type
     'strainseed', planted by hand; the seed drill and hopper only take plain seeds) and produce '<crop>~<i>' (worth x v,
     its colour), registered after initMaps. A strain crop carries s.crop.st.
   - The farm notice board's Seed book tab lists every strain. */

/* ---- sprinkler reach ---- */
const SPRINK_R = { sprinkler: 1, qsprinkler: 2, isprinkler: 3 };
pcCursorDraw = (f => function (m) {
  const r = f.apply(this, arguments);
  if (!m || !m.farm || !S || TITLE || MODAL) return r;
  const id = selKind(), it = id && IT[id], R = it && it.t === 'place' && SPRINK_R[it.place]; if (!R) return r;
  const sq = (x, y, a, col) => { if (!inb(m, x, y)) return; g.globalAlpha = a; g.fillStyle = col; g.fillRect(x * 16 + 1, y * 16 + 1, 14, 14); };
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i], rr = o && SPRINK_R[o.k]; if (!rr) continue; const ox = i % m.w, oy = i / m.w | 0; for (let j = -rr; j <= rr; j++) for (let k = -rr; k <= rr; k++) sq(ox + k, oy + j, .12, '#6ab0ff'); }
  const [tx, ty] = MOUSE.in ? mouseTile() : faceTile();
  for (let j = -R; j <= R; j++) for (let k = -R; k <= R; k++) { const x = tx + k, y = ty + j; sq(x, y, m.soil[y * m.w + x] ? .45 : .22, '#4aa0ff'); }
  g.globalAlpha = 1; g.strokeStyle = '#d8f0ff'; g.lineWidth = 1; g.strokeRect(tx * 16 + .5, ty * 16 + .5, 15, 15);
  return r;
})(pcCursorDraw);

/* ---- strains ---- */
const strains = () => (S.strains = S.strains || []);
const hexRgb = h => { h = (h || '#88aa66').replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0); };
const rgbHex = c => '#' + c.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function hueShift(hex, deg) {
  let [r, g2, b] = hexRgb(hex).map(v => v / 255); const mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2; let h = 0, s = 0;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g2 - b) / d + (g2 < b ? 6 : 0) : mx === g2 ? (b - r) / d + 2 : (r - g2) / d + 4; h /= 6; }
  h = ((h * 360 + deg) % 360 + 360) % 360 / 360; s = Math.min(1, s * 1.1 + .05);
  const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
  return rgbHex([f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => v * 255));
}
const mixCol = (a, b) => rgbHex(hexRgb(a).map((v, i) => (v + hexRgb(b)[i]) / 2));
const baseCol = k => typeof (IT[k] || {}).c === 'string' ? IT[k].c : '#88aa66';
/* ---- genes (asked 2026-11-04): a strain's traits are levels, bred in one at a time ----
   growth g 0-3: 20% faster a level (60% at most); hardy h 0-4: grows one more season after its own a level, and at 4 in
   every season for good; worth v 0-5: sells 10% more a level, in the strain's colour; yield y 0-3: one more per harvest a
   level. A cross keeps each trait's best level from either parent and, half the time, gains one level more, most often in
   a trait the parents already have, so a line can be bred up trait by trait into a superstrain. T.lv holds the levels;
   T.g, T.y, T.v, T.h are worked out from them for the rest of the code. */
const GENE_MAX = { g: 3, y: 3, v: 5, h: 4 }, GENE_TOTAL = 15;
function strainLv(T) {   // the levels, converting a strain from before levels (continuous traits)
  if (!T.lv) T.lv = { g: clamp(Math.round(((T.g || 1) - 1) / .2), 0, 3), y: clamp(Math.round(T.y || 0), 0, 3), v: clamp(Math.round(((T.v || 1) - 1) / .1), 0, 5), h: T.h ? 1 : 0 };
  const L = T.lv; T.g = 1 + .2 * L.g; T.y = L.y; T.v = 1 + .1 * L.v; T.h = L.h; return L;
}
// a crop's traits: its strain's, or a plain crop's (no genes)
const traitsOf = (k, st) => { if (st !== undefined && S.strains && S.strains[st]) { strainLv(S.strains[st]); return S.strains[st]; } return { k, lv: { g: 0, y: 0, v: 0, h: 0 }, g: 1, y: 0, v: 1, h: 0, gen: 0, col: baseCol(k), name: IT[k] ? IT[k].n : k }; };
// the seasons a crop grows in: its own, and with hardy genes the ones after them (all four at level 4)
function cropSeasons(k, h) {
  const own = (CROPS[k] && CROPS[k].s) || [], set = new Set(own); if (!h || !own.length) return set; if (h >= 4) return new Set([0, 1, 2, 3]);
  const last = own.find(q => !own.includes((q + 1) % 4)); let q = last === undefined ? own[own.length - 1] : last;
  for (let i = 0; i < h; i++) { q = (q + 1) % 4; set.add(q); }
  return set;
}
// what a strain's seed does in the field (asked 2026-11-07): the seasons it grows in (its crop's own, plus the hardy
// trait's), the days to grow, the harvest and the price, each against the plain crop
const STRAIN_SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
function strainGrowText(T) {
  const L = strainLv(T), C = CROPS[T.k] || {}, own = C.s || [], all = [...cropSeasons(T.k, L.h)].sort((a, b) => a - b), list = a => a.map(q => STRAIN_SEASONS[q]).join(', ');
  const d = C.d ? Math.max(1, Math.round(C.d * (1 - Math.min(.6, .2 * L.g)))) : 0, base = IT[T.k] || {};
  return 'Grows in ' + (all.length >= 4 ? 'every season' : list(all)) + (all.length > own.length ? ' (plain ' + (base.n || T.k) + ': ' + list(own) + ')' : '') + '. '
    + (d ? 'Ripe in ' + d + ' day' + (d === 1 ? '' : 's') + (d < C.d ? ' (plain ' + C.d + ')' : '') + (C.re ? ', then every ' + C.re + ' days' : '') + '. ' : '')
    + (L.y ? 'Yields ' + L.y + ' more a harvest. ' : '') + (L.v ? 'Sells for ' + (100 + 10 * L.v) + '% of the plain crop.' : '');
}
function traitText(T) {
  const L = strainLv(T), p = [];
  if (L.g) p.push('grows ' + L.g * 20 + '% faster');
  if (L.y) p.push('+' + L.y + ' per harvest');
  if (L.v) p.push('sells for ' + L.v * 10 + '% more');
  if (L.h) p.push(L.h >= 4 ? 'grows in every season' : 'grows ' + L.h + ' season' + (L.h > 1 ? 's' : '') + ' longer');
  return p.length ? p.join(' · ') : 'like the plain crop';
}
const geneText = T => { const L = strainLv(T); return 'Growth ' + L.g + '/3 · Yield ' + L.y + '/3 · Worth ' + L.v + '/5 · Hardy ' + L.h + '/4'; };
const ST_ADJ = { g: ['Swift', 'Early', 'Quick', 'Brisk'], y: ['Plentiful', 'Giant', 'Bountiful', 'Heavy'], v: ['Ruby', 'Golden', 'Violet', 'Amber', 'Silver', 'Rose', 'Sapphire', 'Copper'], h: ['Frostbright', 'Hardy', 'Wintry', 'Evergreen'] };
// how good a strain is: its gene levels out of the 15 there are, shown as 1-5 stars
const strainScore = T => { const L = strainLv(T); return Math.round((L.g + L.y + L.v + L.h) / GENE_TOTAL * 100); };
const strainStars = T => { const n = Math.max(1, Math.min(5, Math.ceil(strainScore(T) / 20))); return '★'.repeat(n) + '☆'.repeat(5 - n); };
// the name takes the two strongest traits (by how far along each is)
function strainName(k, T) {
  const L = strainLv(T), sc = { g: L.g / 3, y: L.y / 3, v: L.v / 5, h: L.h / 4 }, ks = Object.keys(sc).filter(t => sc[t] > 0).sort((a, b) => sc[b] - sc[a]).slice(0, 2);
  if (!ks.length) ks.push('v');
  const adj = ks.map(t => ST_ADJ[t][Math.floor(Math.random() * ST_ADJ[t].length)]), base = IT[k] ? IT[k].n : k;
  if (ks.length === 2 && ks[0] === 'v') adj.reverse();   // the colour word next to the crop: "Swift Ruby Turnip"
  let n = adj.join(' ') + ' ' + base, i = 2; const used = new Set(strains().map(s => s.name));
  while (used.has(n)) n = adj.join(' ') + ' ' + base + ' ' + ['', '', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][Math.min(10, i++)];
  return n;
}
function registerStrain(i) {
  const T = S.strains[i], k = T.k, base = IT[k]; if (!base) return; strainLv(T);
  const seed = IT[k + '_seed'] || {}, vid = k + '~' + i, sid = k + '_seed~' + i;
  const about = strainStars(T) + ', generation ' + (T.gen || 1) + '. ' + traitText(T) + '. (' + geneText(T) + ')';
  IT[vid] = Object.assign({}, base, { id: vid, n: T.name, p: Math.max(1, Math.round((base.p || 1) * T.v)), c: T.col, strain: i, desc: 'A strain you bred: ' + about });
  IT[sid] = Object.assign({}, seed, { id: sid, n: T.name + ' Seeds', t: 'strainseed', crop: k, strain: i, p: Math.max(10, Math.round((seed.p || 20) * 3)), c: T.col, desc: 'Plant by hand. ' + strainGrowText(T) + ' ' + about });
  if (typeof ICACHE !== 'undefined') { delete ICACHE[vid]; delete ICACHE[sid]; }
}
initMaps = (f => function () { const r = f.apply(this, arguments); try { if (S && S.strains) S.strains.forEach((_, i) => registerStrain(i)); } catch (e) { console.error(e); } return r; })(initMaps);
// a cross: one parent's crop (the strain's, when only one parent is a strain), each trait's best level from either parent,
// and half the time one level more
function crossStrain(a, b) {
  const A = a, B = b; strainLv(A); strainLv(B);
  const aS = A.gen > 0, bS = B.gen > 0, k = aS && !bS ? (Math.random() < .7 ? A.k : B.k) : bS && !aS ? (Math.random() < .7 ? B.k : A.k) : (Math.random() < .5 ? A.k : B.k);
  const lv = {}; for (const t in GENE_MAX) lv[t] = Math.max(A.lv[t] || 0, B.lv[t] || 0);
  let gained = null;
  if (Math.random() < .5) {
    const open = Object.keys(GENE_MAX).filter(t => lv[t] < GENE_MAX[t]), had = open.filter(t => lv[t] > 0);
    if (open.length) { gained = had.length && Math.random() < .6 ? pickR(had) : pickR(open); lv[gained]++; }
  }
  if (!lv.g && !lv.y && !lv.v && !lv.h) { const t = pickR(Object.keys(GENE_MAX)); lv[t] = 1; gained = t; }   // a cross is never just the plain crop
  const L = strains(), same = L.findIndex(s => s.k === k && strainLv(s) && ['g', 'y', 'v', 'h'].every(t => (s.lv[t] || 0) === lv[t]));
  if (same >= 0) return same;
  if (L.length >= 500) return -1;
  const T = { k, lv, gen: Math.max(A.gen || 0, B.gen || 0) + 1, pa: [A.name, B.name], day: dayIndex() };
  // its colour: the parents' mixed, and further from the plain crop the more worth it has
  T.col = hueShift(mixCol(A.col || baseCol(A.k), B.col || baseCol(B.k)), (Math.random() - .5) * 40 + (lv.v ? (lv.v * 14) * (Math.random() < .5 ? -1 : 1) : 0));
  strainLv(T); T.name = strainName(k, T); L.push(T); registerStrain(L.length - 1); return L.length - 1;
}

/* ---- harvest: a strain's produce, seeds back, crosses ---- */
let HARVEST_ST = null;
give = (f => function (id, n = 1, q = 0, quiet) {
  if (HARVEST_ST && id === HARVEST_ST.k) {   // a strain's produce is its own item, with its extra yield on the first
    let extra = 0; if (!HARVEST_ST.done) { HARVEST_ST.done = 1; const T = S.strains[HARVEST_ST.i]; extra = Math.floor(T.y) + (Math.random() < T.y % 1 ? 1 : 0); }
    return f.call(this, HARVEST_ST.k + '~' + HARVEST_ST.i, n + extra, q, quiet);
  }
  return f.apply(this, arguments);
})(give);
harvest = (f => function (m, tx, ty) {
  const s = m && m.soil[ty * m.w + tx], c = s && s.crop; if (!c || !CROPS[c.k]) return f.apply(this, arguments);
  const k = c.k, st = c.st;
  HARVEST_ST = st !== undefined && S.strains && S.strains[st] && IT[k + '~' + st] ? { k, i: st } : null;
  let r; try { r = f.apply(this, arguments); } finally { HARVEST_ST = null; }
  try { afterHarvest(m, tx, ty, k, st); } catch (e) { console.error(e); }
  return r;
})(harvest);
function afterHarvest(m, tx, ty, k, st) {
  const L = typeof lifeL === 'function' ? lifeL('farming') : 1, seedId = st !== undefined && IT[k + '_seed~' + st] ? k + '_seed~' + st : k + '_seed';
  // seeds back: 5% + 0.25% a Farming level for a plain crop; a strain 40% + 0.3% a level, so a line isn't lost
  if (IT[seedId] && Math.random() < (seedId.includes('~') ? .4 + L * .003 : .05 + L * .0025)) { give(seedId, 1); floatText((tx + .5) * 16, ty * 16 - 10, '+1 ' + IT[seedId].n.toLowerCase(), '#c8e08a'); }
  if (!IT[k + '_seed']) return;   // field crops without seeds don't cross
  const partners = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue; const q = m.soil[(ty + dy) * m.w + tx + dx], pc = q && q.crop;
    if (pc && !pc.dead && CROPS[pc.k] && IT[pc.k + '_seed'] && pc.age >= CROPS[pc.k].d * .5 && (pc.k !== k || pc.st !== st)) partners.push(pc);
  }
  if (!partners.length || Math.random() > .04 + L * .001) return;
  const p = pickR(partners), i = crossStrain(traitsOf(k, st), traitsOf(p.k, p.st)); if (i < 0) return;
  const T = S.strains[i], first = !T.seen; T.seen = 1; give(k === T.k ? T.k + '_seed~' + i : T.k + '_seed~' + i, 1);
  toast((first ? 'A new cross: ' : 'A cross: ') + T.name + ' seeds ' + strainStars(T) + '. ' + traitText(T) + '.', 'lvl'); SFX.lvl && SFX.lvl();
}

/* ---- planting strain seeds by hand (any season when hardy) ---- */
useItem = (f => function (id) {
  const it = id && IT[id]; if (!it || it.t !== 'strainseed' || !has(id)) return f.apply(this, arguments);
  const m = cur, [tx, ty] = faceTile(), s = m.soil[ty * m.w + tx], T = S.strains[it.strain], C = CROPS[it.crop];
  if (!s) { toast('Till the soil first.'); return; } if (s.crop) return;
  const ok = cropSeasons(it.crop, T ? strainLv(T).h : 0);
  if (!m.noSeason && !ok.has(S.season)) { toast((T ? T.name : C.n) + ' only grows in ' + [...ok].sort().map(q => SEASONS[q]).join(', ') + '.', 'bad'); return; }
  s.crop = { k: it.crop, age: 0, st: it.strain }; take(id); addXP('farming', 1); SFX.till();
})(useItem);

/* ---- growth speed and hardiness, each morning ---- */
endDay = (f => function () {
  const watch = [];
  try { for (const id of ['farm', 'greenhouse', ...(typeof ownedPlots === 'function' ? ownedPlots() : [])]) { const m = MAPS[id]; if (!m) continue; for (const key in m.soil) { const s = m.soil[key]; if (s && s.crop && s.crop.st !== undefined && S.strains && S.strains[s.crop.st]) watch.push([s, s.crop, s.crop.age, !!s.crop.dead]); } } } catch (e) { console.error(e); }
  const r = f.apply(this, arguments);
  for (const [s, c, age, dead] of watch) {
    if (s.crop !== c) continue; const T = S.strains[c.st];
    if (c.age > age) c.age = age + (c.age - age) * T.g;
    if (c.dead && !dead && cropSeasons(c.k, strainLv(T).h).has(S.season)) c.dead = false;   // hardy: lives on through its extra seasons
  }
  return r;
})(endDay);

/* ---- the seed book ---- */
// where a strain still lives (asked 2026-11-04: the book only lists strains you still have): its seeds in the backpack,
// the bank (Storage Shed), a crate or ledger, a hired hand's haul or the board's stash, the stall; or a plant in the ground
function strainsAlive() {
  const alive = new Set(), seen = k => { const m = /_seed~(\d+)$/.exec(parseK(k)[0]); if (m) alive.add(+m[1]); };
  const bags = [S.inv, S.bank, S.hire && S.hire.stash, S.stall && S.stall.goods, S.stall && S.stall.bought];
  if (S.hire) for (const k in S.hire.w) bags.push(S.hire.w[k].carry);
  const maps = ['farm', 'greenhouse', ...(typeof ownedPlots === 'function' ? ownedPlots() : [])].map(id => MAPS[id]).filter(Boolean);
  for (const m of maps) {
    for (const o of m.o || []) if (o && o.inv) bags.push(o.inv);
    for (const key in m.soil) { const c = m.soil[key] && m.soil[key].crop; if (c && c.st !== undefined && !c.dead) alive.add(c.st); }
  }
  for (const bag of bags) for (const k in bag || {}) if (bag[k] > 0) seen(k);
  return alive;
}
function renderSeedBook(b) {
  const growing = {}; for (const id of ['farm', 'greenhouse', ...(typeof ownedPlots === 'function' ? ownedPlots() : [])]) { const m = MAPS[id]; if (m) for (const key in m.soil) { const c = m.soil[key] && m.soil[key].crop; if (c && c.st !== undefined && !c.dead) growing[c.st] = (growing[c.st] || 0) + 1; } }
  const alive = strainsAlive(), L = strains().map((T, i) => [T, i]).filter(([, i]) => alive.has(i)), gone = strains().length - L.length;
  b.append(el('p', { class: 'note' }, 'Plant two different crops (or strains) side by side; harvesting one beside the other (at least half grown) now and then gives a cross. A cross keeps the best of each parent\'s genes and half the time gains one more level, most often in a trait it already has, so you can breed a line up trait by trait or combine two strains. Growth +20% a level (3), yield +1 (3), worth +10% (5), hardy one more season (4: every season). Strains give their seeds back often.'));
  if (!L.length) { b.append(el('p', { class: 'note' }, strains().length ? 'You have no seeds or plants of any strain left.' : 'No strains yet.')); return; }
  const grid = el('div', { class: 'keepgrid' });
  L.sort((a, c) => (c[0].gen - a[0].gen) || a[0].name.localeCompare(c[0].name)).forEach(([T, i]) => {
    const sid = T.k + '_seed~' + i, have = cnt(sid), grow = growing[i] || 0;
    grid.append(el('div', { class: 'kcard' }, el('div', { class: 'khead' }, IT[T.k + '~' + i] ? icon(T.k + '~' + i, 20) : null, el('b', null, T.name), el('small', { title: 'How good this strain is so far' }, strainStars(T))), el('small', null, 'Generation ' + T.gen + '.'),
      el('small', null, traitText(T)), el('small', { class: 'sbpa' }, geneText(T)), el('small', { class: 'sbpa' }, (T.pa ? 'From ' + T.pa.join(' × ') + '. ' : '') + (have ? 'You have ' + have + ' seed' + (have > 1 ? 's' : '') + '.' : 'No seeds on you.') + (grow ? ' ' + grow + ' growing.' : ''))));
  });
  b.append(el('h3', null, L.length + ' strain' + (L.length > 1 ? 's' : '') + ' you have'), grid);
  if (gone) b.append(el('p', { class: 'note' }, gone + (gone > 1 ? ' more you bred are' : ' more you bred is') + ' gone: no seeds or plants are left. Breed ' + (gone > 1 ? 'them' : 'it') + ' again and ' + (gone > 1 ? 'they come' : 'it comes') + ' back.'));
}
farmNotices = (f => function () {
  const r = f.apply(this, arguments);
  if (MODAL && MODAL.title === 'Farm notices' && !MODAL.tabs.some(t => t.id === 'seeds')) { MODAL.tabs.push({ id: 'seeds', label: 'Seed book', render: renderSeedBook }); drawModal(); }
  return r;
})(farmNotices);
drawModal = (f => function () { const r = f.apply(this, arguments); const p = document.querySelector('#modal'); if (p && MODAL && MODAL.title === 'Farm notices' && MODAL.cur === 'seeds') p.classList.remove('small'); return r; })(drawModal);
if (typeof HELP !== 'undefined') {
  HELP.seeds = ['Seed book', ['Harvests give a seed back now and then: 5% at Farming 1, about 30% at 99.', 'Plant two different crops (or strains) side by side. Harvesting one next to the other (at least half grown) now and then gives a cross: a new strain with the parents’ traits mixed. Strains can grow faster, give more per harvest, sell for more, or be hardy (live through the change of season and plant any season).', 'Strain seeds are planted by hand. Cross strains again for better ones.']];
  helpKey = (f => function () { if (MODAL && MODAL.title === 'Farm notices' && MODAL.cur === 'seeds') return 'seeds'; return f.apply(this, arguments); })(helpKey);
}
document.head.append(el('style', null, '.sbpa { opacity: .7; }'));

/* ---- strain items show it (asked 2026-11-04): strain seeds are a seed bag in the strain's colour, and its produce is the
   crop recoloured to the strain's colour (keeping the shading) ---- */
const STRAIN_IC = new Map();
const shadeHex = (hex, k) => rgbHex(hexRgb(hex).map(v => k < 0 ? v * (1 + k) : v + (255 - v) * k));
function seedBagIcon(col) {
  const out = mk(32, 32, x => {
    const P = (px, py, c) => { x.fillStyle = c; x.fillRect(px, py, 1, 1); }, ol = shadeHex(col, -.65), dk = shadeHex(col, -.35), md = col, lt = shadeHex(col, .35), hi = shadeHex(col, .6);
    // a sack: a gathered cloth top above the tie, a body that widens fast, a flat rounded bottom
    const half = y => y < 4 ? 0 : y <= 7 ? [3, 4, 5, 4][y - 4] : y <= 9 ? 3 : y <= 26 ? Math.min(11, Math.round(4 + (y - 10) * 1.5)) : [11, 10, 9][y - 27] || 0;
    for (let y = 4; y < 30; y++) { const h = half(y); if (!h) continue; for (let i = -h; i <= h; i++) {
      if (y === 4 && (i + 16) % 2) continue;   // the ruffled top edge
      const edge = i === -h || i === h || y === 29 || y === 4 || (y === 10 && Math.abs(i) > 3), sh = i > h * .45 || y > 26 ? dk : i < -h * .4 && y > 12 && y < 26 ? lt : md;
      P(16 + i, y, edge ? ol : sh); } }
    for (const [fx, fy] of [[14, 5], [17, 5], [15, 6], [18, 6]]) P(fx, fy, dk);   // folds in the gathered top
    for (let i = -3; i <= 3; i++) { P(16 + i, 8, '#8a5a30'); P(16 + i, 9, '#5a3a1e'); }            // the tie
    P(20, 8, '#5aa040'); P(21, 7, '#7ac850'); P(21, 8, '#5aa040'); P(22, 6, '#7ac850');              // a sprig on the tie
    for (const [sx, sy] of [[12, 17], [17, 15], [20, 20], [13, 23], [18, 24]]) { P(sx, sy, hi); P(sx + 1, sy, lt); }   // seeds drawn on the bag
  });
  out.ww = out.wh = 16; return out;
}
itemIcon = (f => function (id) {
  const it = IT[id]; if (!it || it.strain === undefined) return f.apply(this, arguments);
  const key = id + '|' + (SETTINGS.artStyle || '') + '|' + it.c, hit = STRAIN_IC.get(key); if (hit && !hit.__lost) return hit;
  let out;
  if (it.t === 'strainseed') out = seedBagIcon(it.c || '#a0a060');
  else {
    const c = f.apply(this, arguments); if (!c) return c;
    out = mk(c.width, c.height, x => {
      x.drawImage(c, 0, 0);
      x.globalCompositeOperation = 'color'; x.fillStyle = it.c; x.fillRect(0, 0, c.width, c.height);   // the strain's hue, the crop's own light and shade
      x.globalCompositeOperation = 'destination-in'; x.drawImage(c, 0, 0);                            // only where the crop is
    });
    if (c.ww) { out.ww = c.ww; out.wh = c.wh; }
  }
  STRAIN_IC.set(key, out); return out;
})(itemIcon);

// strain seeds are seeds: filed with them in storage and sorted beside them (asked 2026-11-07: a strain seed put in the
// shed "disappeared" -- it was filed under Treasure & trophies and hidden under the Farm filter)
if (typeof TORD !== 'undefined' && !TORD.includes('strainseed')) TORD.splice(TORD.indexOf('seed') + 1, 0, 'strainseed');
if (typeof BANK_CATS !== 'undefined') { const F = BANK_CATS.find(c => c[0] === 'farm'); if (F) { const f0 = F[2]; F[2] = (t, id) => t === 'strainseed' || f0(t, id); } }

/* ---- the ember golem's Breeding mode (asked 2026-11-07: let the golem work at making strains) ----
   A checkbox in the golem's window (o.breed). With it on:
   - it takes strain seeds as well as plain seeds (from your backpack and from belts);
   - it plants what it holds in a repeating pattern of different lines (`golemSow`: each crop or strain is a line; the
     best-rated strains first), so every plant stands beside a different one and can cross at harvest;
   - at harvest every plant still sees its neighbours as they stood that morning (`golemReap` puts back the plants it has
     already cut while it harvests each one), so the sweep doesn't spoil the crosses;
   - strain seeds it harvests (new crosses and a line's seeds back) stay in it and are planted the next morning instead of
     going out with the harvest.
   Off, it works as before. */
function golemBreedRow(o) {
  const cb = el('input', { type: 'checkbox' }); cb.checked = !!o.breed; cb.onchange = () => { o.breed = cb.checked; refresh(); };
  return el('div', { class: 'note' }, el('label', { title: 'Plants its seeds in a pattern of different crops and strains so every harvest can cross, takes strain seeds, and keeps the new strain seeds it harvests to plant next' }, cb, ' Breeding mode'),
    o.breed ? el('div', null, 'Plants its crops and strains in a mixed pattern so every plant has a different neighbour, takes strain seeds, and keeps and replants the new strain seeds it harvests. Load it with at least two kinds.') : null);
}
// a seed in the golem as a line: [crop, strain index or undefined]
const lineOf = id => { const it = IT[id]; return it ? [it.crop, it.t === 'strainseed' ? it.strain : undefined] : null; };
function golemSow(m, o, x, y, r) {
  const inv = o.inv || {}, inSeason = it => m.id === 'greenhouse' || (it.t === 'strainseed' && S.strains[it.strain] ? cropSeasons(it.crop, strainLv(S.strains[it.strain]).h).has(S.season) : CROPOK(it.crop, m));   // a hardy strain grows on past its crop's seasons
  const ok = id => inv[id] > 0 && IT[id] && (IT[id].t === 'seed' || IT[id].t === 'strainseed') && inSeason(IT[id]);
  // the lines it can plant, best strains first, then plain crops
  const lines = Object.keys(inv).filter(ok).sort((a, b) => {
    const sa = IT[a].t === 'strainseed' ? strainScore(S.strains[IT[a].strain]) : -1, sb = IT[b].t === 'strainseed' ? strainScore(S.strains[IT[b].strain]) : -1;
    return sb - sa || a.localeCompare(b);
  });
  if (!lines.length) return 0;
  let n = 0;
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const tx = x + i, ty = y + j, s = m.soil[ty * m.w + tx]; if (!s || s.crop) continue;
    const avail = lines.filter(id => inv[id] > 0); if (!avail.length) return n;
    const want = avail[(((tx + ty) % avail.length) + avail.length) % avail.length], [k, st] = lineOf(want);
    s.crop = st === undefined ? { k, age: 0 } : { k, age: 0, st };
    if (--inv[want] <= 0) delete inv[want]; n++;
  }
  return n;
}
function golemReap(m, o, x, y, r) {
  const ripe = [];
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const tx = x + i, ty = y + j, s = m.soil[ty * m.w + tx];
    if (s && s.crop && !s.crop.dead && CROPS[s.crop.k] && s.crop.age >= CROPS[s.crop.k].d) ripe.push([tx, ty, ty * m.w + tx]);
  }
  const before = {}; for (const [, , i] of ripe) before[i] = Object.assign({}, m.soil[i].crop);
  const done = [], after = {};
  for (const [tx, ty, i] of ripe) {
    for (const d of done) m.soil[d].crop = before[d];   // the neighbours as they stood this morning
    CAPTURE = o; try { harvest(m, tx, ty); } finally { CAPTURE = null; }
    after[i] = m.soil[i] ? m.soil[i].crop : null;
    for (const d of done) m.soil[d].crop = after[d];
    done.push(i);
  }
  // strain seeds stay to be planted: new crosses and a line's seeds back
  o.inv = o.inv || {};
  for (const k of Object.keys(o.out || {})) { const id = parseK(k)[0]; if (IT[id] && IT[id].t === 'strainseed') { o.inv[id] = (o.inv[id] || 0) + o.out[k]; delete o.out[k]; } }
  return ripe.length;
}
reapAround = (f => function (m, o, x, y, r, max) { return o && o.k === 'golem' && o.breed ? golemReap(m, o, x, y, r) : f.apply(this, arguments); })(reapAround);
sowAround = (f => function (m, o, x, y, r) { return o && o.k === 'golem' && o.breed ? golemSow(m, o, x, y, r) : f.apply(this, arguments); })(sowAround);
if (typeof ACCEPT !== 'undefined' && ACCEPT.golem) ACCEPT.golem = (f => function (o, id, n, dry) {
  if (o && o.breed && IT[id] && IT[id].t === 'strainseed') { if (sum(o.inv || {}) + n > 200) return false; if (!dry) { o.inv = o.inv || {}; o.inv[id] = (o.inv[id] || 0) + n; } return true; }
  return f.apply(this, arguments);
})(ACCEPT.golem);
