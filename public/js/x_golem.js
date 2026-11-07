/* The ember golem works the farm like an unpaid, tireless farmhand (asked 2026-11-07: "I thought it was a tier 5 farmhand").
   The placed golem is its home. From 7:00 it walks the farm (a walker on the farmhand's machinery in x_hire.js: hwSpawn,
   hwGo, fhJobs, fhDo) and does every farmhand job at the top level (harvest, water, weeds and the tall grass round the
   fields, crab traps, finished goods out of machines, fertiliser from your stores), plus its own:
   - till: the fields you marked for it (`o.fields`, tile indices on its map) when they have no soil. Marked fields turn
     back to ground after a harvest like any field (x_fix7.js); the golem tills them again;
   - plant: any empty soil on its map, from the seeds it holds (the crop that grew there before if it can; in Breeding mode
     the mixed pattern of x_breed.js, `golemLine`). Marking only says where to till (asked 2026-11-07): every other job
     covers every field.
   Up to GOLEM_CAP (2000) jobs a day. With the fields done it carries the harvest to the storage shed or a crate (`deliver`
   in midday mode). At 17:00 the rest of the day's work is done at once, the haul is stored and it walks home; on a farm
   you aren't on, or an owned plot, the day is done at 17:00 the same way. While it's out its home shows an empty plinth.
   In Breeding mode a crop it harvests still sees the neighbours it cut earlier that day (`gw.pre`), so crosses are fair,
   and the strain seeds it harvests go into its seeds.
   Mark fields: a button in its window; drag rectangles on its map to add tiles, right-drag to remove, Esc or Done ends. */
const GOLEM_CAP = 2000, GOLEM_T = [420, 1020], GOLEM_R = 6;
const GOLEM_LOOK = HP(0, { skin: '#7a6a5e', hair: '#4a3a30', hs: 'bald', shirt: '#5a4a40', pants: '#4a3c34', shoe: '#2e2620', glow: '#ff9a3a', eye: '#ff9a3a' });
const GOLEM_PRI = { harvest: 0, plant: 1, till: 2, water: 3, trap: 4, empty: 5, weed: 6, fert: 7 };
const golemsOn = m => { const L = []; if (m && m.o) for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && o.k === 'golem') L.push([i, o]); } return L; };
const golemKey = (m, i) => 'golem' + (m.id === 'farm' ? '' : '_' + m.id) + '_' + i;
function golemNpc(key) {
  const id = 'hire_' + key;
  if (!Object.getOwnPropertyDescriptor(NPCS, id)) Object.defineProperty(NPCS, id, { value: { n: 'Ember Golem', role: 'Ember golem', shop: 'k_golem', P: GOLEM_LOOK, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
}
const golemTillable = (m, i) => { const x = i % m.w, y = i / m.w | 0, T = getT(m, x, y); return inb(m, x, y) && (T === 'g' || T === 'd') && !getO(m, x, y) && !m.solidB[i] && !m.soil[i]; };
// the seeds it can plant here today
function golemSeeds(m, o) {
  const inv = o.inv || {}, inSeason = it => m.id === 'greenhouse' || (it.t === 'strainseed' && S.strains[it.strain] ? cropSeasons(it.crop, strainLv(S.strains[it.strain]).h).has(S.season) : CROPOK(it.crop, m));
  return Object.keys(inv).filter(id => inv[id] > 0 && IT[id] && (IT[id].t === 'seed' || (o.breed && IT[id].t === 'strainseed')) && inSeason(IT[id]));
}
function golemLine(m, o, x, y) {
  const L = golemSeeds(m, o); if (!L.length) return null;
  if (o.breed) {
    L.sort((a, b) => { const sa = IT[a].t === 'strainseed' ? strainScore(S.strains[IT[a].strain]) : -1, sb = IT[b].t === 'strainseed' ? strainScore(S.strains[IT[b].strain]) : -1; return sb - sa || a.localeCompare(b); });
    return L[(((x + y) % L.length) + L.length) % L.length];
  }
  const was = o.gw && o.gw.last && o.gw.last[y * m.w + x];   // the crop that grew here before, if it has the seed
  return (was && L.find(id => IT[id].crop === was && IT[id].t === 'seed')) || L.filter(id => IT[id].t === 'seed').sort()[0] || null;
}
function golemJobs(m, o, gx, gy) {
  const hasF = !!fhFert(), out = fhJobs(m, 4).filter(j => j[2] !== 'fert' || hasF), inv = golemSeeds(m, o).length > 0;
  for (const i of o.fields || []) if (golemTillable(m, i)) out.push([i % m.w, i / m.w | 0, 'till']);
  if (inv) for (const key in m.soil) { const i = +key, s = m.soil[key]; if (s && !s.crop && !s.had) out.push([i % m.w, i / m.w | 0, 'plant']); }   // not soil a harvest just emptied: it goes back to ground (x_fix7.js) and, if marked, is tilled again
  return out;
}
function golemDo(m, o, x, y, job) {
  const gw = o.gw, i = y * m.w + x, s = m.soil[i];
  if (job === 'till') { if (!golemTillable(m, i)) return false; m.soil[i] = { wet: S.weather === 'rain' && m.outdoor, crop: null }; return true; }
  if (job === 'plant') {
    if (!s || s.crop || s.had) return false; const id = golemLine(m, o, x, y); if (!id) return false; const [k, st] = lineOf(id);
    s.crop = st === undefined ? { k, age: 0 } : { k, age: 0, st }; if (--o.inv[id] <= 0) delete o.inv[id]; return true;
  }
  if (job === 'harvest') {
    if (!s || !s.crop || !CROPS[s.crop.k] || s.crop.age < CROPS[s.crop.k].d) return false;
    gw.pre = gw.pre || {}; gw.last = gw.last || {};
    const k = s.crop.k, pre = Object.assign({}, s.crop), back = [];
    // Breeding mode: neighbours it cut earlier today stand again for this harvest's cross
    if (o.breed) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (y + dy) * m.w + x + dx, q = m.soil[j]; if ((dx || dy) && q && gw.pre[j]) { back.push([q, q.crop]); q.crop = gw.pre[j]; } }
    const box = { out: gw.carry }, ax = addXP; CAPTURE = box; addXP = () => { };
    try { harvest(m, x, y); } finally { CAPTURE = null; addXP = ax; for (const [q, c] of back) q.crop = c; }
    gw.carry = box.out; gw.pre[i] = pre; gw.last[i] = k;
    if (o.breed) { o.inv = o.inv || {}; for (const key of Object.keys(gw.carry)) { const id = parseK(key)[0]; if (IT[id] && IT[id].t === 'strainseed') { o.inv[id] = (o.inv[id] || 0) + gw.carry[key]; delete gw.carry[key]; } } }
    return true;
  }
  const w = { lv: 4, carry: gw.carry }, r = fhDo(m, w, x, y, job); gw.carry = w.carry; return r;
}
// the rest of the day's jobs at once, best first
function golemWorkAll(m, o, gx, gy) {
  const gw = o.gw; let fertOut = false;
  for (let pass = 0; pass < 3; pass++) {   // tilling makes planting jobs, harvesting makes tilling jobs once the soil goes
    const jobs = golemJobs(m, o, gx, gy).sort((a, b) => GOLEM_PRI[a[2]] - GOLEM_PRI[b[2]]); let n = 0;
    for (const [x, y, j] of jobs) { if (gw.jobs >= GOLEM_CAP) return; if (j === 'fert' && fertOut) continue; if (golemDo(m, o, x, y, j)) { gw.jobs++; n++; } else if (j === 'fert') fertOut = true; }
    if (!n) return;
  }
}
const golemHas = gw => Object.values(gw.carry || {}).some(n => n > 0);
function golemStore(o) { const w = { carry: o.gw.carry }, what = deliver('golem', w, true); o.gw.carry = {}; return what; }

/* ---- the day ---- */
EVT.on('tick', () => {
  if (!S || TITLE) return; const t = S.time, today = dayIndex();
  for (const m of farmMaps()) for (const [i, o] of golemsOn(m)) {
    const gx = i % m.w, gy = i / m.w | 0, gw = o.gw;
    if (t >= GOLEM_T[0] && t < GOLEM_T[1] && (!gw || gw.day !== today)) o.gw = { day: today, jobs: 0, carry: {}, pre: {}, last: (gw && gw.last) || {}, phase: 'work' };
    else if (t >= GOLEM_T[1] && gw && gw.day === today && gw.phase === 'work') {
      gw.phase = 'home'; golemWorkAll(m, o, gx, gy); gw.pre = {};
      if (golemHas(gw)) { const what = golemStore(o); if (what && cur === m) toast('The ember golem put ' + what + '.'); }
      const key = golemKey(m, i); if (HW[key]) hwGo(key, nearFree(m, gx, gy + 1), () => hwGone(key));
    }
  }
});
// sleeping before 17:00 finishes the day first
endDay = (f => function () {
  try { for (const m of farmMaps()) for (const [i, o] of golemsOn(m)) { const gw = o.gw; if (gw && gw.day === dayIndex() && gw.phase === 'work') { gw.phase = 'home'; golemWorkAll(m, o, i % m.w, i / m.w | 0); gw.pre = {}; if (golemHas(gw)) golemStore(o); const key = golemKey(m, i); if (HW[key]) hwGone(key); } } } catch (e) { console.error(e); }
  return f.apply(this, arguments);
})(endDay);

/* ---- seen on the farm: it walks from job to job ---- */
function golemFrame() {
  const m = MAPS.farm; if (!m || cur !== m) return;
  for (const [i, o] of golemsOn(m)) {
    const gw = o.gw, key = golemKey(m, i), gx = i % m.w, gy = i / m.w | 0;
    if (!gw || gw.phase !== 'work' || gw.day !== dayIndex()) continue;
    if (!HW[key]) { golemNpc(key); hwSpawn(key, nearFree(m, gx, gy + 1)); if (!HW[key]) continue; HW[key].n.id = 'hire_' + key; }
    const H = HW[key]; if (H.path || H.then || H.wait > 0) continue;
    if (gw.jobs >= GOLEM_CAP) { H.wait = 5; continue; }
    const nx = Math.floor(H.n.x / 16), ny = Math.floor((H.n.y - 2) / 16), jobs = golemJobs(m, o, gx, gy);
    if (!jobs.length) {
      if (golemHas(gw) && gameT - (gw.dropT || -1e9) > 20) { const d = dropSpot(); gw.dropT = gameT; if (d && d.at) { hwGo(key, d.at, () => { const what = golemStore(o); if (what) toast('The ember golem put ' + what + '.'); if (HW[key]) HW[key].wait = 1; }); continue; } }
      H.wait = 3; continue;
    }
    jobs.sort((a, b) => GOLEM_PRI[a[2]] - GOLEM_PRI[b[2]] || (Math.abs(a[0] - nx) + Math.abs(a[1] - ny)) - (Math.abs(b[0] - nx) + Math.abs(b[1] - ny)));
    const [x, y, job] = jobs[0];
    const stand = [[0, 1], [1, 0], [-1, 0], [0, -1], [0, 0]].map(([a, b]) => [x + a, y + b]).find(([a, b]) => inb(m, a, b) && !getO(m, a, b) && !m.solidB[b * m.w + a] && !TER[getT(m, a, b)].solid && !TER[getT(m, a, b)].water) || null;
    const act = () => { if (golemDo(m, o, x, y, job)) { gw.jobs++; sparkle(x, y, job === 'water' ? '#7ab8ff' : job === 'till' ? '#a8744a' : job === 'plant' ? '#9ad870' : '#ffb060'); } };
    if (!stand) { act(); H.wait = .4; continue; }
    hwGo(key, stand, () => { H.n.dir = y < stand[1] ? 3 : y > stand[1] ? 0 : x < stand[0] ? 1 : 2; H.wait = .45; H.after = act; });
  }
}
update = (f => function (dt) { f(dt); if (S && !TITLE && !PAUSED) try { golemFrame(); } catch (e) { console.error(e); } })(update);
// while it's out, its home is an empty plinth
objSprite = (f => function (o, season) { if (o && o.k === 'golem' && o.gw && o.gw.phase === 'work' && o.gw.day === dayIndex() && SPR.furn_pedestal) return SPR.furn_pedestal; return f.apply(this, arguments); })(objSprite);

/* ---- talking to it, and its window ---- */
doorAction = (f => function (act, who) {
  if (act !== 'k_golem') return f(act, who);
  const m = MAPS.farm, g = golemsOn(m).find(([i]) => 'hire_' + golemKey(m, i) === who), o = g && g[1], gw = o && o.gw;
  const carry = gw ? Object.entries(gw.carry || {}).filter(([, n]) => n > 0) : [];
  storyDialog([[who, gw ? 'Jobs today: ' + gw.jobs + ' of ' + GOLEM_CAP + '. ' + (carry.length ? 'Carrying ' + carry.map(([k, n]) => n + ' ' + IT[parseK(k)[0]].n.toLowerCase()).join(', ') + '.' : 'Carrying nothing.') + ((o.fields || []).length ? ' It tills ' + o.fields.length + ' marked field tiles again when they go back to ground.' : ' No fields marked to till.') : 'Resting.']], { title: 'Ember Golem' });
})(doorAction);
let GMARK = null;   // { m, o, a, b, rem }
golemBreedRow = (f => function (o) {
  const n = (o.fields || []).length, m = cur;
  return el('div', null, f(o), el('div', { class: 'acts wrap' },
    el('button', { class: 'btn', on: () => golemMarkStart(m, o) }, 'Mark fields'), n ? el('button', { class: 'btn ghost', on: () => { o.fields = []; refresh(); } }, 'Clear fields') : null,
    el('small', { class: 'note' }, n ? n + ' field tiles marked: it tills them again whenever they go back to ground.' : 'Mark the fields it should till again when a harvest turns them back to ground. It harvests, waters, weeds and plants every field either way.')));
})(golemBreedRow);
function golemMarkStart(m, o) {
  closeModal(); GMARK = { m, o };
  const bar = el('div', { class: 'f-panel', id: 'gmarkbar' }, el('b', null, 'Marking fields for the ember golem'), el('span', null, ' Drag to add tiles · right-drag to remove · '), el('button', { class: 'btn', on: golemMarkEnd }, 'Done'));
  Object.assign(bar.style, { position: 'fixed', left: '50%', top: '70px', transform: 'translateX(-50%)', padding: '8px 14px', zIndex: 45, display: 'flex', gap: '8px', alignItems: 'center', whiteSpace: 'nowrap', width: 'max-content', maxWidth: '92vw' });
  document.body.append(bar);
}
function golemMarkEnd() { GMARK = null; const b = document.getElementById('gmarkbar'); if (b) b.remove(); }
const onCanvas = e => e.target && e.target.tagName === 'CANVAS';
addEventListener('mousedown', e => { if (!GMARK || !onCanvas(e)) return; e.preventDefault(); e.stopImmediatePropagation(); GMARK.a = GMARK.b = mouseTile(); GMARK.rem = e.button === 2; }, true);
addEventListener('mousemove', e => { if (GMARK && GMARK.a) GMARK.b = mouseTile(); }, true);
addEventListener('mouseup', e => {
  if (!GMARK || !GMARK.a) return; e.preventDefault(); e.stopImmediatePropagation();
  const { m, o, a, b, rem } = GMARK, set = new Set(o.fields || []); GMARK.a = GMARK.b = null; if (cur !== m) return;
  for (let y = Math.min(a[1], b[1]); y <= Math.max(a[1], b[1]); y++) for (let x = Math.min(a[0], b[0]); x <= Math.max(a[0], b[0]); x++) {
    if (!inb(m, x, y)) continue; const i = y * m.w + x, T = getT(m, x, y);
    if (rem) set.delete(i); else if ((T === 'g' || T === 'd' || m.soil[i]) && !m.solidB[i]) set.add(i);
  }
  o.fields = [...set]; SFX.pop();
}, true);
addEventListener('contextmenu', e => { if (GMARK && onCanvas(e)) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
addEventListener('keydown', e => { if (GMARK && e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); golemMarkEnd(); } }, true);
// the marked fields show while you mark them and while a golem's window is open
pcCursorDraw = (f => function (m) {
  f.apply(this, arguments);
  const open = GMARK || (MODAL && MODAL.title === 'Ember Golem'); if (!open || !m || !m.o) return;
  g.save(); g.fillStyle = 'rgba(255,160,60,.22)'; g.strokeStyle = 'rgba(255,190,90,.75)'; g.lineWidth = 1;
  for (const [, o] of golemsOn(m)) for (const i of o.fields || []) { const x = i % m.w, y = i / m.w | 0; g.fillRect(x * 16, y * 16, 16, 16); g.strokeRect(x * 16 + .5, y * 16 + .5, 15, 15); }
  if (GMARK && GMARK.a && GMARK.b) { const [a, b] = [GMARK.a, GMARK.b], x0 = Math.min(a[0], b[0]), y0 = Math.min(a[1], b[1]); g.fillStyle = GMARK.rem ? 'rgba(220,60,40,.3)' : 'rgba(255,210,90,.35)'; g.fillRect(x0 * 16, y0 * 16, (Math.abs(a[0] - b[0]) + 1) * 16, (Math.abs(a[1] - b[1]) + 1) * 16); }
  g.restore();
})(pcCursorDraw);
