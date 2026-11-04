/* ================= Farming: sprinkler reach, seeds back, crop breeding (asked 2026-11-04) =================
   - Holding a sprinkler shows the tiles it would water around the tile you aim at (tilled soil brighter), and faintly
     what the sprinklers already placed reach; on the farm and in the greenhouse.
   - Seeds back: a harvest gives a seed of that crop (or strain) with a chance of 5% + 0.25% a Farming level (~30% at 99).
   - Crosses: harvesting a crop with a different, grown crop or strain next to it (any of the 8 tiles, at least 60% grown)
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
// a crop's traits: its strain's, or a plain crop's (no change)
const traitsOf = (k, st) => st !== undefined && S.strains && S.strains[st] ? S.strains[st] : { k, g: 1, y: 0, v: 1, h: 0, gen: 0, col: baseCol(k), name: IT[k] ? IT[k].n : k };
function traitText(T) {
  const p = [];
  if (T.g > 1.04) p.push('grows ' + Math.round((T.g - 1) * 100) + '% faster'); else if (T.g < .96) p.push('grows ' + Math.round((1 - T.g) * 100) + '% slower');
  if (T.y >= .1) p.push('+' + T.y.toFixed(1) + ' per harvest');
  if (T.v > 1.04) p.push('sells ×' + T.v.toFixed(2)); else if (T.v < .96) p.push('sells ×' + T.v.toFixed(2));
  if (T.h) p.push('hardy: lives through the change of season and plants in any season');
  return p.length ? p.join(' · ') : 'like the plain crop';
}
const ST_ADJ = { g: ['Swift', 'Early', 'Quick', 'Brisk'], y: ['Plentiful', 'Giant', 'Bountiful', 'Heavy'], v: ['Ruby', 'Golden', 'Violet', 'Amber', 'Silver', 'Rose', 'Sapphire', 'Copper'], h: ['Frostbright', 'Hardy', 'Wintry', 'Evergreen'] };
function strainName(k, T) {
  const sc = { g: (T.g - 1) / .25, y: T.y / 1, v: (T.v - 1) / .25, h: T.h ? 1.3 : 0 }, top = Object.keys(sc).sort((a, b) => sc[b] - sc[a])[0];
  const pool = ST_ADJ[top], adj = pool[Math.floor(Math.random() * pool.length)], base = IT[k] ? IT[k].n : k;
  let n = adj + ' ' + base, i = 2; const used = new Set(strains().map(s => s.name));
  while (used.has(n)) n = adj + ' ' + base + ' ' + ['', '', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][Math.min(10, i++)];
  return n;
}
function registerStrain(i) {
  const T = S.strains[i], k = T.k, base = IT[k]; if (!base) return;
  const seed = IT[k + '_seed'] || {}, vid = k + '~' + i, sid = k + '_seed~' + i;
  IT[vid] = Object.assign({}, base, { id: vid, n: T.name, p: Math.max(1, Math.round((base.p || 1) * T.v)), c: T.col, strain: i, desc: 'A strain you bred: ' + traitText(T) });
  IT[sid] = Object.assign({}, seed, { id: sid, n: T.name + ' Seeds', t: 'strainseed', crop: k, strain: i, p: Math.max(10, Math.round((seed.p || 20) * 3)), c: T.col, desc: 'Plant by hand. ' + traitText(T) });
  if (typeof ICACHE !== 'undefined') { delete ICACHE[vid]; delete ICACHE[sid]; }
}
initMaps = (f => function () { const r = f.apply(this, arguments); try { if (S && S.strains) S.strains.forEach((_, i) => registerStrain(i)); } catch (e) { console.error(e); } return r; })(initMaps);
// a cross of two crops: one parent's crop, the traits mixed and changed a little
function crossStrain(a, b) {
  const k = Math.random() < .5 ? a.k : b.k, wide = a.k !== b.k ? 1.6 : 1, mut = (x, s) => x + (Math.random() - .5) * 2 * s * wide, r = (x, s) => +(Math.round(x / s) * s).toFixed(2);
  const T = { k, g: r(clamp(mut((a.g + b.g) / 2, .1), .7, 2.2), .05), y: r(clamp(mut((a.y + b.y) / 2, .35), 0, 4), .1), v: r(clamp(mut((a.v + b.v) / 2, .1), .8, 2.5), .05),
    h: (a.h || b.h) ? (Math.random() < .6 ? 1 : 0) : (Math.random() < .07 * wide ? 1 : 0), gen: Math.max(a.gen || 0, b.gen || 0) + 1, pa: [a.name, b.name], day: dayIndex() };
  T.col = hueShift(mixCol(a.col, b.col), (Math.random() - .5) * 60 * wide);
  const L = strains(), same = L.findIndex(s => s.k === T.k && Math.abs(s.g - T.g) < .06 && Math.abs(s.y - T.y) < .25 && Math.abs(s.v - T.v) < .06 && (s.h | 0) === T.h);
  if (same >= 0) return same;
  if (L.length >= 500) return -1;
  T.name = strainName(k, T); L.push(T); registerStrain(L.length - 1); return L.length - 1;
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
  if (IT[seedId] && Math.random() < .05 + L * .0025) { give(seedId, 1); floatText((tx + .5) * 16, ty * 16 - 10, '+1 ' + IT[seedId].n.toLowerCase(), '#c8e08a'); }
  if (!IT[k + '_seed']) return;   // field crops without seeds don't cross
  const partners = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue; const q = m.soil[(ty + dy) * m.w + tx + dx], pc = q && q.crop;
    if (pc && !pc.dead && CROPS[pc.k] && IT[pc.k + '_seed'] && pc.age >= CROPS[pc.k].d * .6 && (pc.k !== k || pc.st !== st)) partners.push(pc);
  }
  if (!partners.length || Math.random() > .04 + L * .001) return;
  const p = pickR(partners), i = crossStrain(traitsOf(k, st), traitsOf(p.k, p.st)); if (i < 0) return;
  const T = S.strains[i], first = !T.seen; T.seen = 1; give(k === T.k ? T.k + '_seed~' + i : T.k + '_seed~' + i, 1);
  toast((first ? 'A new cross: ' : 'A cross: ') + T.name + ' seeds! ' + traitText(T) + '.', 'lvl'); SFX.lvl && SFX.lvl();
}

/* ---- planting strain seeds by hand (any season when hardy) ---- */
useItem = (f => function (id) {
  const it = id && IT[id]; if (!it || it.t !== 'strainseed' || !has(id)) return f.apply(this, arguments);
  const m = cur, [tx, ty] = faceTile(), s = m.soil[ty * m.w + tx], T = S.strains[it.strain], C = CROPS[it.crop];
  if (!s) { toast('Till the soil first.'); return; } if (s.crop) return;
  if (!m.noSeason && !C.s.includes(S.season) && !(T && T.h)) { toast(C.n + ' only grows in ' + C.s.map(q => SEASONS[q]).join(', ') + '. Hardy strains grow any season.', 'bad'); return; }
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
    if (T.h && c.dead && !dead) c.dead = false;   // hardy: the change of season doesn't kill it
  }
  return r;
})(endDay);

/* ---- the seed book ---- */
function renderSeedBook(b) {
  const L = strains();
  b.append(el('p', { class: 'note' }, 'Plant two different crops side by side; when one is harvested beside the other, grown, now and then a cross sprouts: a new strain. Strains can be crossed again. Harvests also give seeds back now and then, more often the better you farm.'));
  if (!L.length) { b.append(el('p', { class: 'note' }, 'No strains yet.')); return; }
  const grid = el('div', { class: 'keepgrid' });
  L.map((T, i) => [T, i]).sort((a, c) => (c[0].gen - a[0].gen) || a[0].name.localeCompare(c[0].name)).forEach(([T, i]) => {
    const sid = T.k + '_seed~' + i, have = cnt(sid);
    grid.append(el('div', { class: 'kcard' }, el('div', { class: 'khead' }, IT[T.k + '~' + i] ? icon(T.k + '~' + i, 20) : null, el('b', null, T.name), el('small', null, 'gen ' + T.gen)),
      el('small', null, traitText(T)), el('small', { class: 'sbpa' }, (T.pa ? 'From ' + T.pa.join(' × ') + '. ' : '') + (have ? 'You have ' + have + ' seed' + (have > 1 ? 's' : '') + '.' : 'No seeds on you.'))));
  });
  b.append(el('h3', null, L.length + ' strain' + (L.length > 1 ? 's' : '') + ' bred'), grid);
}
farmNotices = (f => function () {
  const r = f.apply(this, arguments);
  if (MODAL && MODAL.title === 'Farm notices' && !MODAL.tabs.some(t => t.id === 'seeds')) { MODAL.tabs.push({ id: 'seeds', label: 'Seed book', render: renderSeedBook }); drawModal(); }
  return r;
})(farmNotices);
drawModal = (f => function () { const r = f.apply(this, arguments); const p = document.querySelector('#modal'); if (p && MODAL && MODAL.title === 'Farm notices' && MODAL.cur === 'seeds') p.classList.remove('small'); return r; })(drawModal);
if (typeof HELP !== 'undefined') {
  HELP.seeds = ['Seed book', ['Harvests give a seed back now and then: 5% at Farming 1, about 30% at 99.', 'Plant two different crops (or strains) side by side. Harvesting one next to the other, grown, now and then gives a cross: a new strain with the parents’ traits mixed. Strains can grow faster, give more per harvest, sell for more, or be hardy (live through the change of season and plant any season).', 'Strain seeds are planted by hand. Cross strains again for better ones.']];
  helpKey = (f => function () { if (MODAL && MODAL.title === 'Farm notices' && MODAL.cur === 'seeds') return 'seeds'; return f.apply(this, arguments); })(helpKey);
}
document.head.append(el('style', null, '.sbpa { opacity: .7; }'));
