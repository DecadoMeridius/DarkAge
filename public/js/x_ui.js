/* ================= Playtest fixes, section B: inventory, recipes and UI (docs/playtest/BACKLOG.md) =================
   B1 Search boxes: recipe book and station windows (recipe name or ingredient), backpack (dims what doesn't match),
      bank (filters the list).
   B2 Sort: the backpack gets a Sort button (by type, then name, empty slots last).
   B3 Selecting an item in the backpack shows what it's used in, and "Recipes & uses" opens it in the
      encyclopedia; right click on an item has the same option.
   B4 Category chips in the recipe book and station windows: Blueprints, Machines, Parts, Gear, Farming, Food.
   B5 Onboarding: a "Getting started" checklist at the top of the Quests tab until you've done your first
      day; the milestone list only shows the next few open ones (a button shows them all).
   B6 Shops: name plates over village doors, a closed shop says its hours at the door instead of letting
      you into an empty room, and buying for more than a quarter of your gold asks you to click again.
   B7 HUD: the Focus bar and Z/X/C buttons only show when you're fighting (or hold a weapon), the watering can
      shows how much water is left, wider backpack grid, compact key-binding rows.
   B8 Balance: the clock runs 30% slower (12 to 17 real minutes a day), new games start with 5 bread,
      health slowly comes back out of combat, a low-health warning, request rewards are lower, and the
      farm's own trees are oaks and birches (no Woodcutting-10 maples at the start). */

/* ---------- B1 + B4: recipe search and categories ---------- */
const RCAT = [['all', 'All'], ['bp', 'Blueprints'], ['mach', 'Machines'], ['part', 'Parts'], ['gear', 'Gear'], ['farm', 'Farming'], ['food', 'Food']];
function rcatOf(r) {
  const it = IT[r[0]] || {};
  if (r[0].startsWith('bp_')) return 'bp';
  if (r[3] === 'kitchen' || it.t === 'food') return 'food';
  if (it.t === 'weapon' || it.t === 'armor' || it.t === 'ring' || it.t === 'ammo') return 'gear';
  if (it.t === 'fert' || it.t === 'path' || /sprinkler|scarecrow|beehive|compost|channel/.test(r[0])) return 'farm';
  if ((typeof AUTOTIER !== 'undefined' && AUTOTIER[r[0]]) || (OBJ[r[0]] && (OBJ[r[0]].mach || OBJ[r[0]].place))) return 'mach';
  if (it.t === 'mat' || it.t === 'bar') return 'part';
  return 'all';
}
const rmatch = (r, q) => { const t = q.toLowerCase(); return IT[r[0]].n.toLowerCase().includes(t) || Object.keys(r[2]).some(k => (k[0] === '$' ? CATN[k] : (IT[k] || {}).n || '').toLowerCase().includes(t)); };
const _renderCraftU = renderCraft;
renderCraft = function (b) {
  const q = MODAL.opts.rq || '', cat = MODAL.opts.rcat || 'all', all = RC.slice();
  RC.length = 0; for (const r of all) if ((!q || rmatch(r, q)) && (cat === 'all' || rcatOf(r) === cat)) RC.push(r);
  try { _renderCraftU(b); } finally { RC.length = 0; RC.push(...all); }
  const inp = el('input', { type: 'search', placeholder: 'Search recipes or ingredients…', value: q }); inp.style.cssText = 'width:240px;padding:4px 8px';
  inp.oninput = () => { MODAL.opts.rq = inp.value; const p = inp.selectionStart; refresh(); const n = document.querySelector('#modal input[type=search]'); if (n) { n.focus(); n.setSelectionRange(p, p); } };
  const chips = el('div', { class: 'chips' }, inp, ...RCAT.map(([k, n]) => el('button', { class: 'chip' + (cat === k ? ' on' : ''), on: () => { MODAL.opts.rcat = k; refresh(); } }, n)));
  b.insertBefore(chips, b.firstChild);
};

/* ---------- B1 + B2 + B3: backpack search, sort, uses ---------- */
const _renderBagU = renderBag;
renderBag = function (b) {
  _renderBagU(b);
  const grid = b.querySelector('.pack'); if (!grid) return;
  const q = (MODAL.opts.bq || '').toLowerCase();
  if (q) [...grid.querySelectorAll('.cell')].forEach((c, i) => { const s = S.pack[i]; const hit = s && IT[parseK(s.k)[0]].n.toLowerCase().includes(q); c.classList.toggle('dim', !hit); });
  const inp = el('input', { type: 'search', placeholder: 'Search the bag…', value: MODAL.opts.bq || '' }); inp.style.cssText = 'width:170px;padding:3px 8px;margin-right:6px';
  inp.oninput = () => { MODAL.opts.bq = inp.value; const p = inp.selectionStart; refresh(); const n = document.querySelector('#modal .bagtools input'); if (n) { n.focus(); n.setSelectionRange(p, p); } };
  const sort = el('button', { class: 'btn ghost', on: () => { sortPack(); refresh(); } }, 'Sort');
  grid.before(el('div', { class: 'acts bagtools' }, inp, sort));
  const sel = MODAL.opts.sel, s = sel !== null && sel !== undefined && S.pack[sel];
  if (s && typeof encyUses === 'function') {
    const id = parseK(s.k)[0], uses = encyUses(id), det = b.querySelector('.detail .dtxt');
    if (det) {
      if (uses.length) det.append(el('div', { class: 'note' }, 'Used in: ' + uses.slice(0, 12).join(', ') + (uses.length > 12 ? '…' : '')));
      det.append(el('button', { class: 'btn ghost', on: () => showUses(id) }, 'Recipes & uses'));
    }
  }
};
function showUses(id) { if (typeof ENCY === 'undefined') return; ENCY.q = ''; ENCY.sel = id; ENCY.cat = encyCat(IT[id]); MODAL.cur = 'ency'; if (typeof drawModal === 'function') drawModal(); else refresh(); }
function sortPack() {
  const items = S.pack.filter(Boolean), ord = t => { const i = TORD.indexOf(t); return i < 0 ? 99 : i; };
  items.sort((a, b) => { const A = IT[parseK(a.k)[0]], B = IT[parseK(b.k)[0]]; return (A.t === 'tool' ? -1 : 0) - (B.t === 'tool' ? -1 : 0) || ord(A.t) - ord(B.t) || A.n.localeCompare(B.n) || parseK(b.k)[1] - parseK(a.k)[1]; });
  for (let i = 0; i < S.pack.length; i++) S.pack[i] = items[i] || null;
  if (typeof touched === 'function') touched(); SFX.pop();
}
let PACK_CTX = null;
const _packMenuU = packMenu;
packMenu = function (e, i) { const s = S.pack[i]; PACK_CTX = s ? parseK(s.k)[0] : null; try { return _packMenuU(e, i); } finally { PACK_CTX = null; } };
const _ctxMenuU = ctxMenu;
ctxMenu = function (x, y, title, opts) { if (PACK_CTX) { const id = PACK_CTX; opts = opts.concat([['Recipes & uses', () => showUses(id)]]); } return _ctxMenuU(x, y, title, opts); };
// bank: a search box filters the list
const _bankSortedU = bankSorted;
bankSorted = function () { const L = _bankSortedU(), q = (MODAL && MODAL.opts.kq || '').toLowerCase(); return q ? L.filter(k => IT[parseK(k)[0]].n.toLowerCase().includes(q)) : L; };
const _openModalU = openModal;
openModal = function (title, tabs, start, opts) {
  const r = _openModalU(title, tabs, start, opts);
  if (MODAL && /bank|storage|chest/i.test(title)) {
    const t = MODAL.tabs[0], f = t.render;
    t.render = b => { const inp = el('input', { type: 'search', placeholder: 'Search storage…', value: MODAL.opts.kq || '' }); inp.style.cssText = 'width:200px;padding:3px 8px;margin-bottom:6px';
      inp.oninput = () => { MODAL.opts.kq = inp.value; const p = inp.selectionStart; refresh(); const n = document.querySelector('#modal input[type=search]'); if (n) { n.focus(); n.setSelectionRange(p, p); } }; b.append(inp); f(b); };
    if (typeof drawModal === 'function') drawModal();
  }
  return r;
};

/* ---------- B5: getting started + shorter milestone list ---------- */
const START_STEPS = [
  ['Buy seeds at Mara\'s store (east, along the road)', () => S.flags && S.flags.boughtSeeds],
  ['Till some soil with the hoe', () => Object.values(MAPS.farm ? MAPS.farm.soil : {}).some(Boolean)],
  ['Plant seeds on tilled soil', () => Object.values(MAPS.farm ? MAPS.farm.soil : {}).some(s => s && s.crop)],
  ['Water your crops with the watering can', () => Object.values(MAPS.farm ? MAPS.farm.soil : {}).some(s => s && s.crop && s.wet)],
  ['Sleep in your tent before 2 am', () => S.day > 1 || S.season > 0 || S.year > 1],
  ['Harvest a crop', () => S.stats.harvest > 0],
  ['Sell something (shipping bin or a shop)', () => Object.keys(S.stats.shipped || {}).length > 0],
];
const _renderQuestsU = renderQuests;
renderQuests = function (b) {
  _renderQuestsU(b);
  const done = START_STEPS.map(([, f]) => { try { return !!f(); } catch (e) { return false; } });
  if (!done.every(Boolean)) {
    const L = el('div', { class: 'list' }); START_STEPS.forEach(([t], i) => L.append(el('div', { class: 'rrow' + (done[i] ? ' done' : i === done.indexOf(false) ? ' hl' : '') }, el('div', { class: 'qck' }, done[i] ? '✓' : i + 1), el('div', { class: 'rtxt' }, el('b', null, t)))));
    b.prepend(el('h3', null, 'Getting started'), L);
  }
  if (MODAL.opts.allQ) return;
  let open = 0; const rows = [...b.querySelectorAll('.rrow')].filter(r => { const q = r.querySelector('.qck'); return q && /^\d+$/.test(q.textContent) && !r.closest('.list') === false && QUESTS.some(Q => r.textContent.includes(Q[0])); });
  let hidden = 0; for (const r of rows) { if (++open > 5) { r.style.display = 'none'; hidden++; } }
  if (hidden) b.append(el('button', { class: 'btn ghost', on: () => { MODAL.opts.allQ = 1; refresh(); } }, 'Show ' + hidden + ' more milestones'));
};

/* ---------- B6: shops ---------- */
const _buyRowU = buyRow;
buyRow = function (id, price, label, cb, sub) {
  const row = _buyRowU(id, price, label, cb, sub);
  row.querySelectorAll('.acts .btn').forEach(btn => {
    const n = +(btn.textContent.replace('×', '')) || 1; let sure = 0;
    btn.addEventListener('click', e => {
      if (price * n > S.gold * .25 && price * n > 200 && !sure) { e.stopImmediatePropagation(); e.preventDefault(); sure = 1; btn.textContent = 'Buy for ' + (price * n).toLocaleString() + 'g?'; setTimeout(() => { sure = 0; if (btn.isConnected) btn.textContent = '×' + n; }, 3000); return; }
      if (/_seed$/.test(id)) { S.flags = S.flags || {}; S.flags.boughtSeeds = 1; }
    }, true);
  });
  return row;
};
const _doorActionU = doorAction;
doorAction = function (act, who) {
  const H = typeof HOURS !== 'undefined' && HOURS[act];
  if (H && !who && cur && cur.id === 'village' && (S.time < H[0] || S.time >= H[1])) { toast((BLD_N[act] || 'The shop') + ' is closed. Open ' + fmtHM(H[0]) + ' to ' + fmtHM(H[1]) + '.', 'bad'); return; }
  return _doorActionU(act, who);
};
const _pcCursorDrawU = pcCursorDraw;
pcCursorDraw = function (m) { // name plates over the village doors
  _pcCursorDrawU(m);
  if (TITLE || !m || m.id !== 'village') return;
  g.save(); g.font = '600 7px Fredoka, sans-serif'; g.textAlign = 'center';
  for (const b of m.bld) { const n = BLD_N[b.act]; if (!n || b.act === 'house') continue; const x = (b.door.x + .5) * 16, y = b.door.y * 16 - 3, w = g.measureText(n).width + 8;
    g.fillStyle = 'rgba(58,36,20,.92)'; g.fillRect(Math.round(x - w / 2), y - 8, Math.round(w), 10); g.fillStyle = '#ffe8b8'; g.fillText(n, x, y); }
  g.restore();
};

/* ---------- B7: HUD ---------- */
let LAST_FIGHT = -99;
const _hurtPlayerU = hurtPlayer;
hurtPlayer = function (dmg, sx, sy, elem) { LAST_FIGHT = gameT; return _hurtPlayerU(dmg, sx, sy, elem); };
const _hudTickU = hudTick;
hudTick = function (dt) {
  _hudTickU(dt);
  if (!S || TITLE) return;
  if (typeof TARGET !== 'undefined' && TARGET && !TARGET.dead) LAST_FIGHT = gameT;
  const fighting = gameT - LAST_FIGHT < 8 || selKind() === 'weapon' || (cur && cur.ents.some(e => e.type === 'enemy' && !e.dead && Math.hypot(e.x - S.p.x, e.y - S.p.y) < 110));
  const a = document.getElementById('abil'); if (a) a.style.display = fighting && !(cur && cur.indoor) ? '' : 'none';
  const ci = S.hot.indexOf('can'), slot = ci >= 0 && document.getElementById('hs' + ci);
  if (slot) { let w = slot.querySelector('.water'); if (!w) { w = el('b', { class: 'water' }); slot.append(w); } w.textContent = Math.round(S.water) + '/' + canCap(); }
  // health: slowly back out of combat; a warning when low
  if (gameT - LAST_FIGHT > 8 && S.p.hp < maxHP() && !PAUSED) { S.p.regenAcc = (S.p.regenAcc || 0) + dt; if (S.p.regenAcc > 2) { S.p.regenAcc = 0; S.p.hp = Math.min(maxHP(), S.p.hp + Math.max(1, Math.round(maxHP() * .01))); } }
  const low = S.p.hp < maxHP() * .25; if (low && !S.p.lowWarned) { S.p.lowWarned = 1; toast('Low health! Eat something or get away.', 'bad'); SFX.hurt(); } else if (!low) S.p.lowWarned = 0;
};

/* ---------- B8: balance ---------- */
const _updateTimeU = updateTime;
updateTime = function (dt) { return _updateTimeU(dt * .7); }; // a day lasts about 17 real minutes instead of 12
const _rollBoardU = rollBoard;
rollBoard = function () { _rollBoardU(); if (S.board) S.board.rew = Math.round(IT[S.board.id].p * S.board.n * 1.25 + 40); };
const _newStateU = newState;
newState = function (seed) { const o = _newStateU(seed); if (o.inv) o.inv.bread = (o.inv.bread || 0) + 5; return o; };
const _genFarmU = genFarm;
genFarm = function () { const m = _genFarmU(); for (const o of m.o) if (o && o.k === 'tree' && o.kind === 'maple') o.kind = Math.random() < .5 ? 'oak' : 'birch'; return m; };
