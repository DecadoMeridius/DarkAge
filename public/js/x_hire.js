/* ================= Hired hands (asked 2026-11-04) =================
   The farm notice board has a Hire tab: a woodcutter, miner, forager, fisher or farmhand, hired for a number of days
   (paid up front, a little off for longer contracts). Each needs you in a guild: the Hunters' Lodge (woodcutter,
   forager), the Miners' Guild (miner), the Anglers' Guild (fisher), the Growers' Guild (farmhand); joining is enough,
   and each rank adds 5% to what they bring and opens a higher level (below).
   - The day (HIRE_T, game minutes): at 7:00 they walk in from the village road. The woodcutter, miner, forager and fisher
     cross the farm and go out by the Wilds road; at 17:00 they come back the same way, put the day's haul in your
     Storage Shed (the bank), else a storage crate on the farm, else leave it at the notice board (S.hire.stash, Collect
     on the Hire tab), and walk off to the village for the night. The farmhand stays on the farm from 7:00 to 17:00:
     harvests ripe crops, waters dry ones, pulls weeds and spreads fertiliser from your shed or crates, then stores the
     harvest the same way. A day's work counts when they deliver; the contract ends after its last day.
   - You see them only while you're on the farm (runtime NPCs `hire_<kind>` in MAPS.farm.npcs, walking on findPath like
     the stall's passers-by). Away from the farm everything happens on time without them being drawn, and sleeping before
     17:00 settles the day first (an endDay wrapper).
   - Hired the same day before noon, they start at once (walk in, then out to work); later, they come to say hello and
     start the next morning. Talking to one says what they're up to (`k_hire`).
   - State: S.hire = { w: { kind: { name, left, start, arr, del, carry, look } }, stash: {} }. */

const HIRE_T = { arrive: 7 * 60, late: 12 * 60, back: 17 * 60 };
const HIRE_DAYS = [[1, 1], [3, 1], [7, .95], [14, .9], [28, .85]];   // days, price factor
const HIRE_NAMES = { woodcutter: ['Bram', 'Odo', 'Hilde', 'Torvin'], miner: ['Dunn', 'Greta', 'Koll', 'Ysolde'], forager: ['Fen', 'Wren', 'Ailsa', 'Corrin'], fisher: ['Ned', 'Marta', 'Silas', 'Isla'], farmhand: ['Tam', 'Ruth', 'Piers', 'Elsie'] };
const pickN = (a, n) => a[Math.floor(Math.random() * n) % a.length];
const ri2 = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
/* ---- worker levels (asked 2026-11-04): each hand comes in levels 1-4, chosen when hiring. A level opens with your rank in
   their guild (level 1 on joining, level 2 at its second rank...), costs more a day (HIRE_FEE_LV) and brings better goods: the
   miner goes from stone, clay, copper and coal up to mythril, adamant, regional ores and gems; the woodcutter from wood
   and hardwood up to frostwood and charwood; the forager and fisher reach further afield; the farmhand does more jobs a
   day. Amounts are per resource, as before. ---- */
const allOf = list => Object.fromEntries(list.filter(([id]) => IT[id]).map(([id, a, b]) => [id, ri2(a, b)]));
const some = (o, p, ids, a, b) => { const pool = [].concat(ids).filter(id => IT[id]); if (pool.length && Math.random() < p) { const id = pickR(pool); o[id] = (o[id] || 0) + ri2(a, b); } return o; };
// picks from [id, weight] pairs (a plain id weighs 1)
const pickFrom = (pool, n) => { const o = {}, W = {}; for (const e of pool) { const [id, w] = Array.isArray(e) ? e : [e, 1]; if (IT[id]) W[id] = Math.max(W[id] || 0, w); } const L = Object.entries(W); for (let i = 0; i < n && L.length; i++) { const id = wpick(L, Math.random()); o[id] = (o[id] || 0) + 1; } return o; };
const forageLv = lv => {
  // the season's meadow and woods weigh 4, each wider reach less, so the rarer finds stay few
  const s = S.season, F = FORAGE, pool = [...(F.meadow[s] || []), ...(F.forest[s] || [])].map(id => [id, 4]);
  if (lv >= 2) pool.push(...[...(F.highlands[s] || []), 'morel', 'chanterelle', 'red_cap'].map(id => [id, 2.5]));
  if (lv >= 3) pool.push(...[...(F.coast[s] || []), ...((F.frost || [])[0] || []), ...((F.ash || [])[0] || [])].map(id => [id, 1.5]));
  if (lv >= 4) { const far = []; if (typeof RFORAGE !== 'undefined') for (const k in RFORAGE) far.push(...RFORAGE[k]); far.push('crystal_fruit', 'ice_bloom', 'moon_mushroom'); pool.push(...far.map(id => [id, 1])); }
  return pool;
};
const FISH_LV = [['river', 'lake', 'pond'], ['river', 'lake', 'pond', 'ocean'], ['river', 'lake', 'pond', 'ocean', 'ice'], ['river', 'lake', 'pond', 'ocean', 'ice', 'alpine', 'deepsea', 'glacial']];
const fishLv = lv => FISH.filter(f => IT[f[0]] && f[4].some(l => FISH_LV[lv - 1].includes(l)) && f[5].includes(S.season) && (f[7] || 1) <= [2, 3, 4, 4][lv - 1] && (lv >= 3 || f[6] !== 'night') && (f[6] !== 'rain' || S.weather === 'rain' || lv >= 3)).map(f => [f[0], 1 / Math.pow(f[7] || 1, 1.3)]);   // harder fish come up less
const HIRE = {
  woodcutter: { n: 'Woodcutter', g: 'af_guild', where: 'fells trees in the Wilds',
    levels: ['wood and hardwood, about as much of each, sometimes sap', 'wood, hardwood and some stonepine, more sap', 'hardwood, stonepine and mangrove wood, and sap', 'hardwood, frostwood, charwood and mangrove wood'],
    haul: lv => lv === 1 ? some(allOf([['wood', 18, 26], ['hardwood', 18, 26]]), .3, 'sap', 2, 4)
      : lv === 2 ? some(allOf([['wood', 12, 16], ['hardwood', 14, 18], ['stonepine_log', 6, 9]]), .5, 'sap', 3, 5)
      : lv === 3 ? some(allOf([['hardwood', 12, 16], ['stonepine_log', 8, 11], ['mangrove_wood', 6, 9]]), .6, 'sap', 3, 6)
      : allOf([['hardwood', 10, 14], ['mangrove_wood', 6, 8], ['frostwood_log', 4, 6], ['charwood_log', 3, 5]]),
    look: { shirt: '#7a3a2a', pants: '#4a3a2a', hs: 'short', hair: '#5a3a1a' } },
  miner: { n: 'Miner', g: 'gh_guild', where: 'breaks rock in the Wilds',
    levels: ['stone, clay, copper ore and coal, about as much of each, sometimes salt', 'stone, iron and silver ore and coal, now and then a gem', 'iron, gold and mythril ore, cobalt ore and coal, often a gem', 'mythril and adamant ore, frost ore or obsidian, a regional ore and gems, now and then starmetal'],
    haul: lv => lv === 1 ? some(allOf([['stone', 10, 15], ['clay', 10, 15], ['copper_ore', 10, 15], ['coal', 10, 15]]), .35, 'salt', 3, 6)
      : lv === 2 ? some(allOf([['stone', 10, 14], ['iron_ore', 8, 11], ['silver_ore', 5, 8], ['coal', 8, 11]]), .25, ['amethyst', 'topaz'], 1, 1)
      : lv === 3 ? some(allOf([['iron_ore', 8, 11], ['gold_ore', 5, 7], ['mythril_ore', 3, 5], ['cobalt_ore', 3, 5], ['coal', 8, 11]]), .4, ['amethyst', 'topaz', 'aquamarine'], 1, 1)
      : some(some(some(some(allOf([['mythril_ore', 4, 6], ['adamant_ore', 2, 4]]), 1, ['frost_ore', 'obsidian'], 3, 5), 1, ['cobalt_ore', 'tide_ore', 'rime_ore', 'cinder_ore'], 2, 4), .5, ['emerald', 'ruby', 'garnet'], 1, 1), .08, 'starmetal', 1, 1),
    look: { shirt: '#5a5a62', pants: '#3a3a3a', hs: 'bald', hair: '#2a1a10' } },
  forager: { n: 'Forager', g: 'af_guild', where: 'gathers in the Wilds',
    levels: ['what grows wild in the meadows and woods this season', 'that, plus mushrooms and highland herbs', 'that, plus what grows on the coast and in the frost and ash lands', 'that, plus the far regions\' forage and rare finds'],
    haul: lv => pickFrom(forageLv(lv), [ri2(8, 12), ri2(8, 12), ri2(8, 11), ri2(7, 10)][lv - 1]),
    look: { shirt: '#4a7a3a', pants: '#5a4a2a', hs: 'long', hair: '#a86a3a' } },
  fisher: { n: 'Fisher', g: 'sm_guild', where: 'fishes the Wilds\' waters',
    levels: ['river, lake and pond fish of the season', 'that, plus sea fish', 'that, plus ice fish, and at any hour', 'that, plus the far regions\' fish'],
    haul: lv => pickFrom(fishLv(lv), [ri2(5, 8), ri2(5, 8), ri2(5, 7), ri2(4, 6)][lv - 1]),
    look: { shirt: '#3a5a7a', pants: '#3a4a5a', hs: 'spiky', hair: '#c89a50' } },
  farmhand: { n: 'Farmhand', g: 'kb_guild', where: 'tends your fields',
    levels: ['waters, harvests and spreads fertiliser, up to 220 jobs a day', 'also cuts weeds, and tall grass round the fields, up to 320 jobs a day', 'also empties and re-sets your crab traps, up to 450 jobs a day', 'also takes finished goods out of your stations and machines into storage, up to 600 jobs a day'],
    look: { shirt: '#8a7a3a', pants: '#4a5a3a', hs: 'bun', hair: '#6a4a2a', apron: '#e8dcc0' } },
};
const hireLvOk = (k, lv) => lv - 1 <= guildRank(HIRE[k].g);
const HIRE_LOOKS = ['#f0c8a0', '#c89070', '#e0b090', '#a87050'];
for (const k in HIRE) Object.defineProperty(NPCS, 'hire_' + k, { value: { n: HIRE[k].n, role: 'Hired hand', shop: 'k_hire', P: HP(0, Object.assign({ skin: HIRE_LOOKS[Object.keys(HIRE).indexOf(k) % 4] }, HIRE[k].look)), love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });

// fixed fees a day (asked 2026-11-04: the fee is set, what they bring is luck)
const HIRE_FEES = { woodcutter: 120, miner: 140, forager: 200, fisher: 120, farmhand: 80 };
// a day's fee per level (asked 2026-11-04: hiring is a convenience, not a money-maker): for the gatherers about 1.1x what a
// steady hand brings on an average day at base prices, with the least rank bonus that level needs, and never below the
// earlier higher-level fees; so most days lose a little and only a hard-working or exceptional hand on a good day pays.
// The farmhand's as before.
const HIRE_FEE_LV = { woodcutter: [510, 760, 1220, 1390], miner: [510, 560, 1210, 1750], forager: [620, 790, 1020, 1600], fisher: [220, 360, 600, 960], farmhand: [80, 130, 190, 260] };
const feeOf = (k, lv) => HIRE_FEE_LV[k][(lv || 1) - 1];
const haulText = o => Object.entries(o).filter(([, n]) => n > 0).map(([id, n]) => n + ' ' + IT[parseK(id)[0]].n.toLowerCase()).join(', ');
/* every hand but the farmhand has a work ethic, rolled when hired and found out after the first day (w.skill): lazy ones
   bring half or less, a rare great one twice the usual. On top, each day is good or bad (x0.5-1.5, and 1 day in 10 they
   bring next to nothing). The farmhand always works the same. */
const ETHIC = [[.25, 'lazy', .35, .6], [.45, 'steady', .8, 1.1], [.22, 'hard-working', 1.2, 1.5], [.08, 'exceptional', 1.7, 2.2]];
function rollEthic() { let r = Math.random(); for (const [p, n, a, b] of ETHIC) { if ((r -= p) <= 0) return { skill: +(a + Math.random() * (b - a)).toFixed(2), ethic: n }; } return { skill: 1, ethic: 'steady' }; }
const dayLuck = () => Math.random() < .1 ? .15 : .5 + Math.random();
const hireState = () => { S.hire = S.hire || { w: {}, stash: {} }; S.hire.w = S.hire.w || {}; S.hire.stash = S.hire.stash || {}; return S.hire; };
const guildIn = act => !!(S.guilds && S.guilds[act]);
const guildRank = act => (S.guilds && S.guilds[act] && S.guilds[act].r) || 0;
const hireMult = k => 1 + .05 * guildRank(HIRE[k].g);   // +5% a guild rank (10% until 2026-11-04, which made hiring pay)
const townN = t => t ? t[0].toUpperCase() + t.slice(1) : '';

/* ---- where they go ---- */
const farmWarp = to => { const m = MAPS.farm; const w = m && (m.warps || []).find(w => w.to === to); return w ? [w.x + (w.w > 1 ? 1 : 0), w.y + (w.h > 1 ? 1 : 0)] : null; };
const nearFree = (m, x, y) => { if (inb(m, x, y) && !getO(m, x, y) && !m.solidB[y * m.w + x] && !TER[getT(m, x, y)].solid && !TER[getT(m, x, y)].water) return [x, y]; return typeof openTileNear === 'function' ? openTileNear(m, x, y) : [x, y]; };
// the drop-off: the shed's door, else a storage crate, else the notice board
function dropSpot() {
  const m = MAPS.farm; if (!m) return null;
  // a storage can be closed to hired hands (x_keep.js: S.flags.shedNoHands, o.noHands): they go on to the next one
  const sh = !(S.flags && S.flags.shedNoHands) && sheds(m)[0]; if (sh) return { kind: 'shed', at: nearFree(m, sh.door ? sh.door.x : sh.x + 1, sh.y + sh.h) };
  const ci = m.o.findIndex(o => o && (o.k === 'storage' || o.k === 'ledger') && !o.noHands); if (ci >= 0) return { kind: 'crate', o: m.o[ci], at: nearFree(m, ci % m.w, (ci / m.w | 0) + 1) };
  const bi = m.o.findIndex(o => o && o.k === 'board' && o.farmboard); return { kind: 'board', at: bi >= 0 ? nearFree(m, bi % m.w, (bi / m.w | 0) + 1) : [23, 8] };
}
/* ---- the workers' log (asked 2026-11-04): every delivery of the last year (112 days) on the notice board, per day and per
   worker (S.hire.log: d day index, k kind, nm name, e work ethic, it {item: n}, w where it went, j farmhand jobs) ---- */
function hireLog(k, w, items, where) {
  const H = hireState(), L = H.log = H.log || [], d = dayIndex();
  L.push({ d, k, nm: w.name, lv: w.lv || 1, e: w.ethic, q: k === 'farmhand' ? undefined : w.dayQ, it: Object.fromEntries(items), w: where, j: k === 'farmhand' ? (w.jobs || 0) : undefined });
  while (L.length && L[0].d < d - 111) L.shift();
}
// how the day went: the hand's work ethic times the day's luck
const dayKind = q => q === undefined ? '' : q < .6 ? 'a lazy day' : q < 1.1 ? 'an average day' : q < 1.6 ? 'a good day' : 'an exceptional day';
const HLOG_W = { shed: 'storage shed', crate: 'storage crate', board: 'notice board' };
function renderHireLog(b) {
  const H = hireState(), all = (H.log || []).slice(), today = dayIndex(), fk = MODAL.opts.hk || 'all';
  b.append(el('p', { class: 'note' }, 'What every hired hand brought back each day, for the last year, newest first.'));
  if (!all.length) { b.append(el('p', { class: 'note' }, 'Nobody has brought anything back yet.')); return; }
  const kinds = Object.keys(HIRE).filter(k => all.some(e => e.k === k));
  b.append(el('div', { class: 'chips' }, el('button', { class: 'chip' + (fk === 'all' ? ' on' : ''), on: () => { MODAL.opts.hk = 'all'; refresh(); } }, 'Everyone'),
    ...kinds.map(k => el('button', { class: 'chip' + (fk === k ? ' on' : ''), on: () => { MODAL.opts.hk = k; refresh(); } }, HIRE[k].n))));
  const L = all.filter(e => fk === 'all' || e.k === fk);
  // per worker: days worked and everything they brought
  const per = {}; for (const e of L) { const key = e.k + '|' + e.nm, P = per[key] = per[key] || { k: e.k, nm: e.nm, e: e.e, days: 0, it: {}, j: 0, last: 0 }; P.days++; P.last = Math.max(P.last, e.d); P.j += e.j || 0; for (const id in e.it) P.it[id] = (P.it[id] || 0) + e.it[id]; }
  const sumBox = el('div', { class: 'list' });
  for (const P of Object.values(per).sort((a, c) => c.last - a.last)) {
    const tot = Object.entries(P.it).sort((a, c) => c[1] - a[1]), top = tot[0] && parseK(tot[0][0]);
    sumBox.append(el('div', { class: 'rrow' }, top ? icon(top[0], 24) : null, el('div', { class: 'rtxt' },
      el('b', null, P.nm + ' the ' + HIRE[P.k].n.toLowerCase() + (P.k !== 'farmhand' && P.e ? ' (' + P.e + ')' : '') + ': ' + P.days + ' day' + (P.days === 1 ? '' : 's')),
      el('small', null, (P.k === 'farmhand' ? P.j + ' jobs · ' : '') + (tot.length ? haulText(Object.fromEntries(tot)) : 'nothing brought') + (P.days > 1 && tot.length ? ' · per day about ' + haulText(Object.fromEntries(tot.map(([id, n]) => [id, Math.round(n / P.days)]))) : '')))));
  }
  b.append(el('h3', null, 'Per worker'), sumBox);
  const days = [...new Set(L.map(e => e.d))].sort((a, c) => c - a), shown = MODAL.opts.hlogN || 14;
  for (const d of days.slice(0, shown)) {
    b.append(el('h3', null, (d === today ? 'Today, ' : d === today - 1 ? 'Yesterday, ' : '') + dayName(d)));
    const box = el('div', { class: 'list' });
    for (const e of L.filter(e => e.d === d)) {
      const ents = Object.entries(e.it), top = ents.sort((a, c) => c[1] - a[1])[0];
      box.append(el('div', { class: 'rrow' }, top ? icon(parseK(top[0])[0], 24, parseK(top[0])[1]) : null, el('div', { class: 'rtxt' },
        el('b', null, e.nm + ' the ' + HIRE[e.k].n.toLowerCase() + (e.lv ? ' (level ' + e.lv + ')' : '') + (e.k === 'farmhand' ? ' (' + (e.j || 0) + ' jobs)' : '')),
        el('small', null, (e.q !== undefined ? dayKind(e.q)[0].toUpperCase() + dayKind(e.q).slice(1) + ': ' : '') + (ents.length ? haulText(e.it) + ' · to your ' + (HLOG_W[e.w] || 'stores') : 'brought nothing.')))));
    }
    b.append(box);
  }
  if (days.length > shown) b.append(el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => { MODAL.opts.hlogN = shown + 28; refresh(); } }, 'Show older days (' + (days.length - shown) + ' more)')));
}
function deliver(k, w) {
  const items = Object.entries(w.carry || {}).filter(([, n]) => n > 0); w.carry = {};
  const d = dropSpot(), H = hireState();
  hireLog(k, w, items, d ? d.kind : 'board');
  if (!items.length) return '';
  // hay goes to the silos first while they have room (asked 2026-11-04); everything else, and hay they can't hold, as below
  let silo = 0;
  const hay = items.find(([id]) => id === 'hay');
  if (hay && S.build && S.build.silo > 0) { if (typeof siloSync === 'function') siloSync(); S.silo = S.silo || 0; silo = Math.min(hay[1], 240 * S.build.silo - S.silo); if (silo > 0) { S.silo += silo; hay[1] -= silo; } else silo = 0; }
  const bag = d && d.kind === 'shed' ? S.bank : d && d.kind === 'crate' ? (d.o.inv = d.o.inv || {}) : H.stash, rest = items.filter(([, n]) => n > 0);
  for (const [id, n] of rest) bag[id] = (bag[id] || 0) + n;
  const what = rest.map(([id, n]) => n + ' ' + IT[parseK(id)[0]].n.toLowerCase()).join(', ');
  const there = d && d.kind === 'shed' ? ' in your storage shed' : d && d.kind === 'crate' ? ' in your storage crate' : ' by the notice board';
  return [rest.length ? what + there : '', silo ? silo + ' hay in your silo' : ''].filter(Boolean).join(', and ');
}

/* ---- walkers (only while you're on the farm) ---- */
const HW = {};   // kind -> { n, path, pi, then, wait }
const onFarm = () => cur && cur === MAPS.farm;
const hireIdx = k => Object.keys(HIRE).indexOf(k);
const hireAt = (k, t) => t + hireIdx(k) * 7;   // game minutes
// the drop-off spot, a tile apart per kind so they don't stand on each other
const hireSpot = k => { const d = dropSpot(), m = MAPS.farm; if (!d || !m) return null; const [x, y] = d.at, o = [0, 1, -1, 2, -2][hireIdx(k)] || 0; return nearFree(m, x + o, y); };
function hwSpawn(k, from) {
  const m = MAPS.farm; if (!m || !from) return null;
  const n = { id: 'hire_' + k, x: (from[0] + .5) * 16, y: (from[1] + .8) * 16, hx: 0, hy: 0, dir: 0, walk: true, t: 1e9, vx: 0 };
  n.hx = n.x; n.hy = n.y; m.npcs = (m.npcs || []).filter(q => q.id !== n.id); m.npcs.push(n);
  return HW[k] = { n, path: null, pi: 1, then: null, wait: 0 };
}
function hwGone(k) { const m = MAPS.farm, H = HW[k]; if (H && m && m.npcs) m.npcs = m.npcs.filter(q => q !== H.n); delete HW[k]; }
function hwGo(k, to, then) {
  const H = HW[k], m = MAPS.farm; if (!H || !to) { if (then) then(); return; }
  const p = findPath(m, Math.floor(H.n.x / 16), Math.floor((H.n.y - 2) / 16), to[0], to[1], 9000);
  if (!p) { H.n.x = (to[0] + .5) * 16; H.n.y = (to[1] + .8) * 16; H.path = null; if (then) then(); return; }
  H.path = p; H.pi = 1; H.then = then || null;
}
const HLATER = [];   // [seconds, fn]: walkers that set off a little later
function hireFrame(dt) {
  const m = MAPS.farm;
  for (const L of HLATER.slice()) if ((L[0] -= dt) <= 0) { HLATER.splice(HLATER.indexOf(L), 1); if (onFarm()) L[1](); }
  for (const k of Object.keys(HW)) {
    const H = HW[k], n = H.n;
    if (!m || cur !== m || !(m.npcs || []).includes(n)) { hwGone(k); continue; }
    if (n.waitT > 0) { n.walk = false; continue; }   // you clicked them: they wait (x_fix5)
    if (H.wait > 0) { H.wait -= dt; n.walk = false; if (H.wait <= 0 && H.after) { const f = H.after; H.after = null; f(); } continue; }
    const node = H.path && H.path[H.pi];
    if (!node) { n.walk = false; H.path = null; if (H.then) { const f = H.then; H.then = null; f(); } continue; }
    const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
    if (d < 2) { H.pi++; continue; }
    const sp = (33 + hireIdx(k) * 1.5) * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.hx = n.x; n.hy = n.y; n.walk = true;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
  }
  if (onFarm()) farmhandFrame(dt);
}
update = (f => function (dt) { f(dt); if (S && !TITLE && !PAUSED) try { hireFrame(dt); } catch (e) { console.error(e); } })(update);

/* ---- the farmhand's chores ---- */
const FH_CAPS = [220, 320, 450, 600], fhCap = w => FH_CAPS[((w && w.lv) || 1) - 1];   // jobs a day, by level
const fhRaining = () => S.weather === 'rain' || S.weather === 'storm';
function fhFert() {   // fertiliser from the shed, else a crate
  const m = MAPS.farm, isF = id => IT[parseK(id)[0]] && IT[parseK(id)[0]].t === 'fert';
  if (sheds(m).length) { const k = Object.keys(S.bank).find(k => S.bank[k] > 0 && isF(k)); if (k) return { bag: S.bank, k }; }
  for (const o of m.o) if (o && (o.k === 'storage' || o.k === 'ledger') && o.inv) { const k = Object.keys(o.inv).find(k => o.inv[k] > 0 && isF(k)); if (k) return { bag: o.inv, k }; }
  return null;
}
// the jobs on the farm, best first: [x, y, job]
function fhJobs(m, lv) {
  const out = []; lv = lv || 1;
  const soilAt = new Set(Object.keys(m.soil).filter(k => m.soil[k]).map(Number)), nearField = (x, y) => { for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) if (soilAt.has((y + j) * m.w + x + i)) return true; return false; };
  for (const key in m.soil) {
    const i = +key, s = m.soil[key], x = i % m.w, y = i / m.w | 0; if (!s) continue;
    if (s.crop && !s.crop.dead && CROPS[s.crop.k] && s.crop.age >= CROPS[s.crop.k].d) out.push([x, y, 'harvest']);
    else if (s.crop && !s.crop.dead && !s.wet && !fhRaining()) out.push([x, y, 'water']);
    if (!s.fert) out.push([x, y, 'fert']);
  }
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o) continue; const x = i % m.w, y = i / m.w | 0;
    if (lv >= 2 && (o.k === 'weed' || (o.k === 'tgrass' && nearField(x, y)))) out.push([x, y, 'weed']);   // tall grass only round the fields, so the meadows stay
    if (lv >= 3 && o.k === 'crabtrap' && typeof trapReady === 'function' && trapReady(o)) out.push([x, y, 'trap']);
    if (lv >= 4 && fhHasOut(o)) out.push([x, y, 'empty']);
  }
  return out;
}
const FH_DO = ['waters, harvests and spreads fertiliser from your stores', 'cuts weeds, and tall grass round the fields', 'empties and re-sets your crab traps', 'takes finished goods out of your stations and machines into storage'];
const FH_PRI = { harvest: 0, water: 1, trap: 2, empty: 3, weed: 4, fert: 5 };
// a station's or machine's finished goods (not a crate's or ledger's stores)
const fhHasOut = o => !STORE.has(o.k) && ((isMach(o) && typeof o.out === 'string' && !(o.left > 0)) || (isAuto(o) && o.out && typeof o.out === 'object' && Object.values(o.out).some(n => n > 0)));
function fhDo(m, w, x, y, job) {
  const i = y * m.w + x, s = m.soil[i];
  if (job === 'harvest') {
    if (!s || !s.crop || !CROPS[s.crop.k] || s.crop.age < CROPS[s.crop.k].d) return false;
    const box = { out: w.carry }, ax = addXP; CAPTURE = box; addXP = () => { };
    try { harvest(m, x, y); } finally { CAPTURE = null; addXP = ax; }
    w.carry = box.out; return true;
  }
  if (job === 'water') { if (!s || !s.crop || s.wet) return false; s.wet = true; return true; }
  if (job === 'weed') { const o = getO(m, x, y); if (!o || (o.k !== 'weed' && o.k !== 'tgrass')) return false; setO(m, x, y, null); w.carry.fiber = (w.carry.fiber || 0) + 1; if (o.k === 'tgrass' || Math.random() < .5) w.carry.hay = (w.carry.hay || 0) + 1; return true; }
  if (job === 'trap') { const o = getO(m, x, y); if (!o || o.k !== 'crabtrap' || !trapReady(o)) return false; for (const c of o.catch) w.carry[c] = (w.carry[c] || 0) + 1; o.catch = null; o.t = dayIndex(); return true; }
  if (job === 'empty') {
    const [, , o] = mainOf(m, x, y); if (!o || !fhHasOut(o)) return false;
    if (isMach(o) && typeof o.out === 'string') { w.carry[o.out] = (w.carry[o.out] || 0) + 1; o.out = null; o.item = null; o.left = 0; }
    else { for (const k in o.out) if (o.out[k] > 0) w.carry[k] = (w.carry[k] || 0) + o.out[k]; o.out = {}; }
    return true;
  }
  if (job === 'fert') { if (!s || s.fert) return false; const F = fhFert(); if (!F) return false; s.fert = parseK(F.k)[0]; F.bag[F.k]--; if (F.bag[F.k] <= 0) delete F.bag[F.k]; return true; }
  return false;
}
// the rest of the day's work at once (you weren't watching, or the day is over)
// a map's jobs at once, best first, up to the day's cap (or max more)
function fhWorkMap(m, w, max) {
  if (!m) return 0; let jobs = fhJobs(m, w.lv).sort((a, b) => FH_PRI[a[2]] - FH_PRI[b[2]]), fertOut = false, n = 0;
  for (const [x, y, j] of jobs) { if ((w.jobs || 0) >= fhCap(w) || (max && n >= max)) break; if (j === 'fert' && fertOut) continue; if (fhDo(m, w, x, y, j)) { w.jobs = (w.jobs || 0) + 1; n++; } else if (j === 'fert') fertOut = true; }
  return n;
}
/* the greenhouse too (asked 2026-11-04: nothing but sprinklers watered it): once repaired (S.build.greenhouse), the farmhand
   works it like the fields, at the same level. Seen on the farm: with the fields done they walk to its door, go in, work it
   for a while (up to GH_VISIT jobs) and come back out, at most once a minute; the rest is done at 17:00 with the farm. */
const ghOpen = () => !!(S.build && S.build.greenhouse && MAPS.greenhouse);
const GH_VISIT = 60;
function fhCatchUp(w) {
  fhWorkMap(MAPS.farm, w);
  if (ghOpen()) fhWorkMap(MAPS.greenhouse, w);
}
function farmhandFrame(dt) {
  const H = HW.farmhand, w = hireState().w.farmhand; if (!H || !w || w.phase !== 'work' || H.path || H.then || H.wait > 0) return;
  if ((w.jobs || 0) >= fhCap(w)) return;
  const m = MAPS.farm, nx = Math.floor(H.n.x / 16), ny = Math.floor((H.n.y - 2) / 16), hasF = !!fhFert();
  const jobs = fhJobs(m, w.lv).filter(j => j[2] !== 'fert' || hasF);
  if (!jobs.length) {   // the fields are done: the greenhouse, if it needs anything
    const G = MAPS.greenhouse, door = m.bGH && m.bGH.door;
    if (ghOpen() && door && gameT - (w.ghT || -1e9) > 60 && fhJobs(G, w.lv).some(j => j[2] !== 'fert' || hasF)) {
      w.ghT = gameT;
      hwGo('farmhand', nearFree(m, door.x, door.y + 1), () => {
        hwGone('farmhand'); w.inGH = 1;   // inside, out of sight
        HLATER.push([12, () => { w.inGH = 0; fhWorkMap(MAPS.greenhouse, w, GH_VISIT); if (w.phase === 'work' && w.del !== dayIndex()) { hwSpawn('farmhand', nearFree(m, door.x, door.y + 1)); HW.farmhand.wait = 1; } }]);
      });
      return;
    }
    H.wait = 3; return;
  }
  jobs.sort((a, b) => FH_PRI[a[2]] - FH_PRI[b[2]] || (Math.abs(a[0] - nx) + Math.abs(a[1] - ny)) - (Math.abs(b[0] - nx) + Math.abs(b[1] - ny)));
  const [x, y, job] = jobs[0];
  const stand = [[0, 1], [1, 0], [-1, 0], [0, -1], [0, 0]].map(([a, b]) => [x + a, y + b]).find(([a, b]) => inb(m, a, b) && !getO(m, a, b) && !m.solidB[b * m.w + a] && !TER[getT(m, a, b)].solid && !TER[getT(m, a, b)].water) || null;
  // nowhere to stand beside it (a crab trap out in the water, a station hemmed in): done from where they are
  if (!stand) { if (fhDo(m, w, x, y, job)) w.jobs = (w.jobs || 0) + 1; H.wait = .7; return; }
  hwGo('farmhand', stand, () => {
    H.n.dir = y < stand[1] ? 3 : y > stand[1] ? 0 : x < stand[0] ? 1 : 2;
    H.wait = .7; H.after = () => { if (fhDo(m, w, x, y, job)) { w.jobs = (w.jobs || 0) + 1; sparkle(x, y, job === 'water' ? '#7ab8ff' : job === 'fert' ? '#c8e08a' : '#f5e08a'); } };
  });
}

/* ---- the day ---- */
function hireTick() {
  if (!S || !S.hire) return;
  const H = hireState(), today = dayIndex(), t = S.time;
  for (const k of Object.keys(H.w)) {
    const w = H.w[k]; w.carry = w.carry || {};
    if (today < w.start) continue;
    // morning: they come in
    if (t >= hireAt(k, HIRE_T.arrive) && t < HIRE_T.back && w.arr !== today) { w.arr = today; w.jobs = 0; w.phase = k === 'farmhand' ? 'work' : 'out'; if (onFarm()) walkIn(k, w); }
    // evening: back with the day's haul
    if (t >= hireAt(k, HIRE_T.back) && w.arr === today && w.del !== today) settle(k, w, onFarm());
  }
}
EVT.on('tick', () => { if (S && !PAUSED) try { hireTick(); } catch (e) { console.error(e); } });
function walkIn(k, w) {
  const east = farmWarp('village'); if (!hwSpawn(k, east)) return;
  if (k === 'farmhand') hwGo(k, hireSpot(k), () => { HW[k].wait = 1; });
  else { const board = hireSpot(k); hwGo(k, board, () => { HW[k].wait = 1.2; HW[k].after = () => hwGo(k, farmWarp('wilds'), () => hwGone(k)); }); }
}
// the day's haul, delivered: seen walking to the drop-off when you're on the farm, at once otherwise
function settle(k, w, seen) {
  w.del = today_(); if (k !== 'farmhand') { const h = HIRE[k].haul(w.lv || 1), luck = dayLuck(), mult = hireMult(k) * (w.skill || 1) * luck; w.dayQ = (w.skill || 1) * luck; for (const id in h) { const n = Math.round(h[id] * mult); if (n > 0) w.carry[id] = (w.carry[id] || 0) + n; } w.lastHaul = haulText(w.carry); }
  else fhCatchUp(w);
  w.phase = 'home'; w.left--; w.worked = (w.worked || 0) + 1;
  const done = () => {
    const what = deliver(k, w), nm = w.name + ' the ' + HIRE[k].n.toLowerCase();
    toast((what ? nm + ' left ' + what + '.' : nm + ' brought nothing today.') + (k !== 'farmhand' && w.worked === 1 ? ' ' + w.name + ' seems ' + w.ethic + '.' : ''), what ? 'lvl' : '');
    if (w.left <= 0) {
      // auto-renew (asked 2026-11-04): the same length again at the level's price, if the gold is there; told next morning
      const len = w.len || 1, fac = (HIRE_DAYS.find(d => d[0] === len) || [len, 1])[1], cost = Math.round(feeOf(k, w.lv || 1) * len * fac), H2 = hireState(); H2.notes = H2.notes || [];
      if (w.auto && S.gold >= cost) { S.gold -= cost; w.left = len; H2.notes.push(['coin', nm + '’s contract renewed for ' + len + ' day' + (len > 1 ? 's' : '') + ' (' + cost.toLocaleString() + 'g).']); toast(nm + '’s contract renewed for ' + len + ' days.'); }
      else { delete H2.w[k]; if (w.auto) H2.notes.push(['bad', nm + '’s contract ended: renewing it needed ' + cost.toLocaleString() + 'g.']); toast(nm + '’s contract is done. Hire again at the notice board.'); }
    }
  };
  if (!seen) { done(); hwGone(k); return; }
  if (!HW[k]) hwSpawn(k, k === 'farmhand' ? hireSpot(k) : farmWarp('wilds'));
  hwGo(k, hireSpot(k), () => { HW[k].wait = 1; HW[k].after = () => { done(); hwGo(k, farmWarp('village'), () => hwGone(k)); }; });
}
const today_ = () => dayIndex();
// sleeping before 17:00 settles the day; the walkers don't stay overnight
endDay = (f => function () {
  try { if (S && S.hire) { const today = dayIndex(); for (const k of Object.keys(S.hire.w)) { const w = S.hire.w[k]; if (w.arr === today && w.del !== today) settle(k, w, false); } } for (const k of Object.keys(HW)) hwGone(k); } catch (e) { console.error(e); }
  return f.apply(this, arguments);
})(endDay);
// arriving on the farm mid-day: whoever is there now shows (the farmhand at work; the others are out)
EVT.on('map', () => {
  if (!S || !S.hire || !onFarm()) return;
  const w = S.hire.w.farmhand, today = dayIndex();
  if (w && w.arr === today && w.del !== today && !HW.farmhand) { hwSpawn('farmhand', hireSpot('farmhand')); }
});

/* ---- talking to them ---- */
doorAction = (f => function (act, who) {
  if (act !== 'k_hire') return f(act, who);
  const k = String(who).replace('hire_', ''), w = S.hire && S.hire.w[k], H = HIRE[k];
  const t = S.time, line = !w ? 'Contract’s done. Good working for you.'
    : dayIndex() < w.start ? 'I start tomorrow, first thing. See you at seven.'
    : k === 'farmhand' ? (w.del === dayIndex() ? 'That’s the day done. Your harvest is put away.' : 'Fields first, then the weeds. ' + (w.jobs || 0) + ' jobs done so far today.')
    : w.del === dayIndex() ? 'Back with today’s haul. Off to the village for the night.' : t < HIRE_T.back ? 'Off to the Wilds. Back by five.' : 'Long day.';
  storyDialog([[who, line + (w ? ' (' + w.left + ' day' + (w.left === 1 ? '' : 's') + ' left on my contract.)' : '')]], { title: (w ? w.name + ', ' : '') + H.n });
})(doorAction);

/* ---- the Hire tab on the farm notice board ---- */
function hire(k, days, fac, lv) {
  const H = hireState(); lv = H.w[k] ? (H.w[k].lv || 1) : (lv || 1);
  if (!hireLvOk(k, lv)) { toast('Level ' + lv + ' needs rank ' + lv + ' in the ' + GUILDS[HIRE[k].g].name + '.', 'bad'); return; }
  const cost = Math.round(feeOf(k, lv) * days * fac);
  if (S.gold < cost) { toast('That’s ' + cost.toLocaleString() + 'g.', 'bad'); return; }
  S.gold -= cost; SFX.coin && SFX.coin();
  const ex = H.w[k];
  if (ex) { ex.left += days; toast(ex.name + '’s contract is ' + ex.left + ' days now.', 'lvl'); refresh(); return; }
  const today = dayIndex(), t = S.time, now = t < HIRE_T.late;
  const w = H.w[k] = Object.assign({ name: pickN(HIRE_NAMES[k], Math.random() * 97 | 0), lv, len: days, left: days, start: now ? today : today + 1, arr: null, del: null, carry: {} }, k === 'farmhand' ? { skill: 1, ethic: 'steady' } : rollEthic());
  toast(w.name + ', a level ' + lv + ' ' + HIRE[k].n.toLowerCase() + ', is hired for ' + days + ' day' + (days > 1 ? 's' : '') + (now ? '. On the way now.' : ': starting tomorrow at 7:00.'), 'lvl');
  const lag = Object.keys(HW).length * 3;   // seconds behind whoever is already walking in
  if (now && t >= HIRE_T.arrive) { w.arr = today; w.jobs = 0; w.phase = k === 'farmhand' ? 'work' : 'out'; if (onFarm()) HLATER.push([lag, () => walkIn(k, w)]); }
  else if (!now && onFarm()) HLATER.push([lag, () => { const east = farmWarp('village'); if (hwSpawn(k, east)) hwGo(k, hireSpot(k), () => { HW[k].wait = 1.5; HW[k].after = () => hwGo(k, east, () => hwGone(k)); }); }]);
  refresh();
}
function renderHire(b) {
  const H = hireState();
  b.append(el('p', { class: 'note' }, 'Hire a hand by the day. They come at 7:00 from the village and bring the day’s haul at 17:00 to your Storage Shed (or a storage crate, or this board). You need to belong to their guild; each rank there adds 5% to what they bring and opens a higher level. They cost more than an ordinary day brings in: a good worker on a good day pays, a lazy one never does.'));
  const st = Object.entries(H.stash).filter(([, n]) => n > 0);
  if (st.length) b.append(el('div', { class: 'acts wrap' }, el('b', null, 'Left at the board: '), el('span', null, st.map(([id, n]) => n + ' ' + IT[parseK(id)[0]].n.toLowerCase()).join(', ')),
    el('button', { class: 'btn', on: () => { for (const [k, n] of st) { const [id, q] = parseK(k); GIVE_NO_DROP = true; const left = give(id, n, q, true); GIVE_NO_DROP = false; if (left) H.stash[k] = left; else delete H.stash[k]; } refresh(); } }, 'Collect')));
  for (const k in HIRE) {
    const D = HIRE[k], G = GUILDS[D.g], inG = guildIn(D.g), w = H.w[k], r = guildRank(D.g);
    MODAL.opts.hl = MODAL.opts.hl || {}; const lv = w ? (w.lv || 1) : Math.min(MODAL.opts.hl[k] || 1, r + 1), fee = feeOf(k, lv);
    const card = el('div', { class: 'hirecard' + (inG ? '' : ' off') });
    const pv = k === 'farmhand' ? 'Level ' + lv + ': ' + FH_DO.slice(0, lv).join('; ') + '; up to ' + FH_CAPS[lv - 1] + ' jobs a day.' : 'Level ' + lv + ' brings ' + D.levels[lv - 1] + '. How much is luck: a lazy one brings a little, a good one well over the fee, and everyone has good and bad days.';
    card.append(el('div', { class: 'hirehead' }, el('b', null, D.n), el('span', null, ' ' + D.where + '. ' + fee + 'g a day.')), el('small', null, pv));
    card.append(el('small', { class: inG ? 'ok' : 'bad' }, inG ? '✓ ' + G.name + (r ? ' (rank ' + (r + 1) + ': +' + r * 5 + '%)' : '') : '✗ Join the ' + G.name + ' in ' + townN(G.town) + ' to hire one.'));
    if (inG) {   // the level: chosen before hiring, fixed for a contract
      const lr = el('div', { class: 'chips' }, el('span', null, 'Level:'));
      for (let L = 1; L <= 4; L++) { const ok = hireLvOk(k, L); lr.append(el('button', { class: 'chip' + (L === lv ? ' on' : '') + (ok ? '' : ' off'), title: ok ? feeOf(k, L) + 'g a day: ' + D.levels[L - 1] : 'Needs rank ' + L + ' in the ' + G.name, on: () => { if (w) { toast('Let ' + w.name + ' go first to hire at another level.'); return; } if (!ok) { toast('Level ' + L + ' needs rank ' + L + ' in the ' + G.name + '.', 'bad'); return; } MODAL.opts.hl[k] = L; refresh(); } }, String(L) + (ok ? '' : ' 🔒'))); }
      card.append(lr);
    }
    if (w) card.append(el('small', { class: 'hirenow' }, w.name + ' (level ' + (w.lv || 1) + ')' + (k !== 'farmhand' && w.worked ? ' (' + w.ethic + (w.lastHaul !== undefined ? '; last haul: ' + (w.lastHaul || 'nothing') : '') + ')' : '') + ': ' + w.left + ' day' + (w.left === 1 ? '' : 's') + ' left. ' +(dayIndex() < w.start ? 'Starts tomorrow at 7:00.' : w.del === dayIndex() ? 'Done for today.' : w.arr === dayIndex() ? (k === 'farmhand' ? 'At work on the farm.' : 'Out in the Wilds, back at 17:00.') : 'Comes at 7:00.')));
    if (inG) {
      const row = el('div', { class: 'acts wrap' }, el('span', null, w ? 'Add:' : 'Hire for:'));
      for (const [d, fac] of HIRE_DAYS) { const c = Math.round(fee * d * fac); row.append(el('button', { class: 'btn ghost' + (S.gold < c ? ' off' : ''), title: fac < 1 ? Math.round((1 - fac) * 100) + '% off' : '', on: () => hire(k, d, fac, lv) }, d + ' day' + (d > 1 ? 's' : '') + ' · ' + c.toLocaleString() + 'g')); }
      if (w) { const len = w.len || 1, cb = el('input', { type: 'checkbox' }); cb.checked = !!w.auto; cb.onchange = () => { w.auto = cb.checked ? 1 : 0; refresh(); };
        const fac = (HIRE_DAYS.find(d => d[0] === len) || [len, 1])[1]; card.append(el('label', { class: 'bwpull' }, cb, ' Renew when it ends (' + len + ' day' + (len > 1 ? 's' : '') + ', ' + Math.round(fee * len * fac).toLocaleString() + 'g)')); }
      if (w) row.append(el('button', { class: 'btn ghost', title: 'Ends the contract; days not yet worked are paid back', on: () => { const back = Math.max(0, w.left - (w.arr === dayIndex() && w.del !== dayIndex() ? 1 : 0)) * feeOf(k, w.lv || 1); S.gold += back; delete H.w[k]; hwGone(k); toast(w.name + ' is let go' + (back ? ': ' + back + 'g paid back.' : '.')); refresh(); } }, 'Let go'));
      card.append(row);
    }
    b.append(card);
  }
}
farmNotices = (f => function () {
  const r = f.apply(this, arguments);
  if (MODAL && MODAL.title === 'Farm notices' && !MODAL.tabs.some(t => t.id === 'hire')) { MODAL.tabs.push({ id: 'hire', label: 'Hire hands', render: renderHire }, { id: 'hlog', label: 'Workers’ log', render: renderHireLog }); drawModal(); }
  return r;
})(farmNotices);
// the Hire tab needs the full-size window
drawModal = (f => function () { const r = f.apply(this, arguments); const p = document.querySelector('#modal'); if (p && MODAL && MODAL.title === 'Farm notices') p.classList.toggle('small', MODAL.cur === 'n'); return r; })(drawModal);

HELP.hire = ['Hired hands', [
  'Hire a woodcutter, miner, forager, fisher or farmhand by the day, paid up front (7 days or more costs a little less a day).',
  'Every hand but the farmhand is a gamble: lazy, steady, hard-working or now and then exceptional (you find out after the first day), and each day is good or bad. A good one brings well over the fee; a lazy one less. The farmhand always works the same.',
  'Each needs you in their guild: the Hunters’ Lodge in Ashford (woodcutter, forager), the Miners’ Guild in Greyhelm, the Anglers’ Guild in Saltmere, the Growers’ Guild in Kingsbridge (farmhand). Every rank in it adds 5% to what they bring.',
  'They walk in from the village at 7:00. The others head out to the Wilds and are back at 17:00; the farmhand works your fields all day. The day’s haul goes to your Storage Shed, else a storage crate, else this board.',
  'Each hand comes in levels 1 to 4: level 1 when you join their guild, each higher level at the guild’s next rank. Higher levels cost more and bring rarer goods (the miner up to mythril, adamant and gems, the woodcutter up to frostwood and charwood), fewer of them than the common ones. The farmhand does more at each level: weeds and tall grass at 2, crab traps at 3, emptying your stations into storage at 4.',
  'Let go pays back the days not yet worked.',
  'The Workers’ log tab lists what each of them brought back every day, with totals per worker.']];
helpKey = (f => function () { if (MODAL && MODAL.title === 'Farm notices' && (MODAL.cur === 'hire' || MODAL.cur === 'hlog')) return 'hire'; return f.apply(this, arguments); })(helpKey);

document.head.append(el('style', null, `
.hirecard { display: flex; flex-direction: column; gap: 3px; padding: 8px 10px; margin: 6px 0; border: 2px solid rgba(80, 50, 20, .3); border-radius: 4px; background: rgba(255, 245, 220, .35); }
.hirecard.off { opacity: .7; }
.hirecard .hirehead b { font-size: 16px; } .hirecard small { font-size: 13px; }
.hirecard small.ok { color: #3a6a2a; } .hirecard small.bad { color: #a8402a; } .hirecard .hirenow { font-weight: 700; }
`));
// renewals and contracts that couldn't be renewed, in the morning report
showDayReport = (f => function (lines) {
  try { const H = S && S.hire; if (H && H.notes && H.notes.length && Array.isArray(lines)) { lines = H.notes.concat(lines); H.notes = []; } } catch (e) { console.error(e); }
  return f.call(this, lines);
})(showDayReport);
