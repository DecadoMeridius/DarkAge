/* Playtest 3, second pass: the "Still open" list in docs/playtest/PLAYTEST_3.md.
   1 clicks: placing on the clicked tile, hints that match what a click does
   2 combat: filled telegraphs, wind-up "!", a fair Mixed pack, a mouse boss list, no knockback through exits
   3 building and animals: reasons on Breed and Buy, animal names that aren't villagers, sandbox comforts
   4 villagers: Chat / Shop / Gift on the street, heart progress
   5 exploration: zoomable map with waystones, chest contents, picked flowers, ladders in the mine, early requests */

/* ---------- 1 clicks ---------- */
// a crate, belt or path in hand: clicking an empty tile further away walks next to it and places it there
const _primaryUseF4 = primaryUse;
primaryUse = function () {
  if (!PAUSED && !TITLE && !fishing && S && cur) {
    const k = selKind(), it = k && IT[k];
    if (it && (it.t === 'place' || it.t === 'path')) {
      const [tx, ty] = clickTarget(), [px, py] = playerTile();
      if (!inReach(tx, ty) && !(tx === px && ty === py)) { walkTo(tx, ty, 'use'); return; }
    }
  }
  return _primaryUseF4();
};
// the LMB / RMB hints say what a click will really do
const _hudTickF4 = hudTick;
hudTick = function (dt) {
  _hudTickF4(dt);
  if (!S || TITLE || PAUSED || !cur || fishing || !$('#pL')) return;
  const k = selKind(); let L = null, R = null;
  if (!k) L = 'Walk';
  else if (k === 'hoe') L = (cur.farm || cur.id === 'greenhouse') && !(cur.id || '').startsWith('in_') ? 'Till' : '';
  else if (k === 'scythe') { L = 'Cut'; const it = findInteract(); if (it && it.label === 'Use scythe') R = ''; }
  else if (k === 'multi') L = 'Use';
  if (L !== null) $('#pL').innerHTML = L ? '<kbd>LMB</kbd>' + L : '';
  if (R !== null) $('#pR').innerHTML = '';
};

/* ---------- 2 combat ---------- */
// telegraphs fill up: the danger zone is shown at full size from the start and fills in until it hits
drawHazards = function () {
  for (const h of HAZ) {
    const live = h.t >= h.T, k = Math.min(1, h.t / h.T), col = h.elem === 'fire' ? [255, 110, 40] : h.elem === 'ice' ? [120, 210, 255] : [230, 70, 50];
    const rgba = a => `rgba(${col[0]},${col[1]},${col[2]},${a})`;
    g.save();
    if (h.k === 'circle' || h.k === 'pool') {
      if (live) { g.fillStyle = rgba(h.k === 'pool' ? .45 + Math.sin(gameT * 8) * .1 : .75); g.beginPath(); g.ellipse(h.x, h.y, h.r, h.r * .7, 0, 0, 6.283); g.fill(); }
      else {
        g.fillStyle = rgba(.16); g.beginPath(); g.ellipse(h.x, h.y, h.r, h.r * .7, 0, 0, 6.283); g.fill();
        g.fillStyle = rgba(.3 + k * .3); g.beginPath(); g.ellipse(h.x, h.y, h.r * k, h.r * .7 * k, 0, 0, 6.283); g.fill();
        g.strokeStyle = rgba(.95); g.lineWidth = 1.5; g.beginPath(); g.ellipse(h.x, h.y, h.r, h.r * .7, 0, 0, 6.283); g.stroke();
      }
      if (h.rock && !live) { const y = h.y - 90 * (1 - k); g.fillStyle = '#8a8478'; g.fillRect(h.x - 4, y - 4, 8, 7); g.fillStyle = '#b0aa9e'; g.fillRect(h.x - 4, y - 4, 8, 2); }
    } else if (h.k === 'ring') {
      if (!live) { // the boss gathers: a filling disc under it, and the reach of the wave faintly
        g.fillStyle = rgba(.1); g.beginPath(); g.ellipse(h.x, h.y, h.r1, h.r1 * .7, 0, 0, 6.283); g.fill();
        g.fillStyle = rgba(.35 + k * .35); g.beginPath(); g.ellipse(h.x, h.y, 22 * k + 3, 16 * k + 2, 0, 0, 6.283); g.fill();
      } else { // a solid band travelling outward: dash through it
        const r = h.r0 + (h.r1 - h.r0) * Math.min(1, (h.t - h.T) / h.life);
        g.fillStyle = rgba(.6); g.beginPath(); g.ellipse(h.x, h.y, r + 7, (r + 7) * .7, 0, 0, 6.283); g.ellipse(h.x, h.y, Math.max(1, r - 7), Math.max(1, r - 7) * .7, 0, 0, 6.283); g.fill('evenodd');
        g.strokeStyle = 'rgba(255,240,220,.9)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(h.x, h.y, r + 7, (r + 7) * .7, 0, 0, 6.283); g.stroke();
      }
    } else if (h.k === 'lane') {
      g.translate(h.x, h.y); g.rotate(h.a);
      if (live) { g.fillStyle = rgba(.75); g.fillRect(0, -h.w / 2, h.len, h.w); g.fillStyle = '#e8f6ff'; for (let s = 10; s < h.len; s += 14) { g.beginPath(); g.moveTo(s, h.w / 2); g.lineTo(s + 4, -h.w / 2 - 6); g.lineTo(s + 8, h.w / 2); g.fill(); } }
      else { g.fillStyle = rgba(.14); g.fillRect(0, -h.w / 2, h.len, h.w); g.fillStyle = rgba(.3 + k * .3); g.fillRect(0, -h.w / 2, h.len * k, h.w); g.strokeStyle = rgba(.9); g.lineWidth = 1; g.strokeRect(0, -h.w / 2, h.len, h.w); }
    } else if (h.k === 'wave') {
      const x = live ? h.x + h.dir * 340 * Math.min(1, (h.t - h.T) / h.life) : h.x;
      g.fillStyle = rgba(live ? .7 : .2 + k * .35);
      g.fillRect(x - 8, h.y - h.h / 2, 16, h.gap - h.gw / 2 - (h.y - h.h / 2)); g.fillRect(x - 8, h.gap + h.gw / 2, 16, h.y + h.h / 2 - h.gap - h.gw / 2);
      if (!live) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x - 3, h.gap - h.gw / 2, 6, h.gw); }
    }
    g.restore();
  }
};
// an enemy winding up fills its strike wedge and shows a "!" over its head
const _drawEntF4 = drawEnt;
drawEnt = function (e) {
  const r = _drawEntF4(e);
  if (typeof ACTION === 'function' && ACTION() && e.type === 'enemy' && e.wind > 0 && !e.dead) {
    const E = EN[e.k], k = 1 - e.wind / (e.windT || .5), y = e.y - E.r * 2 - 10 - (E.boss ? 8 : 0);
    g.save(); g.globalAlpha = .35 + k * .3; g.fillStyle = '#ff3a2a'; g.beginPath(); g.moveTo(e.x, e.y - 2); g.arc(e.x, e.y - 2, (E.r + 16) * k, e.windA - 1.1, e.windA + 1.1); g.closePath(); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#2a1c18'; g.fillRect(e.x - 2, y - 1, 4, 9); g.fillStyle = k > .7 ? '#ff4a3a' : '#ffd040'; g.fillRect(e.x - 1, y, 2, 5); g.fillRect(e.x - 1, y + 6, 2, 1.5); g.restore();
  }
  return r;
};
// knockback and dashes never carry you through a map exit (a boss pushed a tester off the Wilds onto the farm)
const _updateF4 = update;
update = function (dt) {
  if (PAUSED || TITLE || !S || !S.p || !cur || !cur.warps) return _updateF4(dt);
  const shoved = Math.hypot(pl.kbx || 0, pl.kby || 0) > 25 || pl.roll > 0;
  if (!shoved) return _updateF4(dt);
  const m = cur, W = m.warps, x0 = S.p.x, y0 = S.p.y; m.warps = [];
  try { _updateF4(dt); } finally { if (cur === m) m.warps = W; }
  if (cur === m) { const tx = Math.floor(S.p.x / 16), ty = Math.floor((S.p.y - 2) / 16); if (W.some(w => tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h)) { S.p.x = x0; S.p.y = y0; pl.kbx = pl.kby = 0; } }
};
// combat test: the Mixed pack takes Hollow Vale enemies at a fair level, and bosses are a clickable list
if (typeof combatPanel === 'function') {
  const _combatPanelF4 = combatPanel;
  combatPanel = function () {
    _combatPanelF4();
    const p = document.getElementById('ctpanel'); if (!p) return;
    const vale = new Set(); for (const b of ['meadow', 'forest', 'highlands', 'coast', 'frost', 'ash']) { const T = BIOME_EN[b]; if (T) for (const [k] of (T.day || []).concat(T.night || [])) if (EN[k] && !EN[k].boss && EN[k].ai !== 'ambush') vale.add(k); }
    const pool = [...vale];
    for (const b of p.querySelectorAll('button')) if (b.textContent === 'Mixed pack') { const nb = el('button', { class: 'btn ghost', on: () => { for (let i = 0; i < 5; i++) spawnNear(pickR(pool.length ? pool : ['slime']), 1, 80, 10); } }, 'Mixed pack'); b.replaceWith(nb); }
    const sel = p.querySelector('select'), spawn = [...p.querySelectorAll('button')].find(b => b.textContent === 'Spawn boss');
    if (sel && spawn) {
      const list = el('div', { class: 'bosslist' });
      for (const o of sel.options) list.append(el('button', { class: 'btn ghost', on: () => { sel.value = o.value; spawn.click(); } }, o.textContent));
      sel.replaceWith(el('small', null, 'Spawn a boss:'), list); spawn.remove();
    }
  };
}

/* ---------- 3 building, animals, sandbox ---------- */
// animals never share a name with a villager
{ const villagers = new Set(Object.values(NPCS).map(n => n.n)); for (const sp in NAMES) if (Array.isArray(NAMES[sp])) { const f = NAMES[sp].filter(n => !villagers.has(n)); if (f.length) NAMES[sp] = f; } }
// greyed-out buttons say why
const _renderAnimalShopF4 = renderAnimalShop;
renderAnimalShop = function (b) {
  _renderAnimalShopF4(b);
  const sps = Object.keys(ANIMAL).filter(sp => sp !== 'horse'), rows = b.querySelectorAll('.list > .rrow');
  sps.forEach((sp, i) => { const btn = rows[i] && rows[i].querySelector('button.off'), A = ANIMAL[sp]; if (!btn) return;
    btn.textContent = !(S.build[A.house] > 0) ? 'Needs a ' + A.house : countIn(A.house) >= capFor(sp) ? A.house[0].toUpperCase() + A.house.slice(1) + ' full' : 'Need ' + A.price.toLocaleString() + 'g'; });
};
const _renderAnimalsF4 = typeof renderAnimals === 'function' ? renderAnimals : null;
if (_renderAnimalsF4) renderAnimals = function (b) {
  _renderAnimalsF4(b);
  if (MODAL.opts.breedA) return;
  const today = dayIndex(), fil = MODAL.opts.sp || 'all';
  const list = S.animals.filter(a => fil === 'all' || a.sp === fil).sort((x, y) => x.sp.localeCompare(y.sp) || animalScore(y) - animalScore(x));
  const cards = b.querySelectorAll('.list > .rrow');
  list.forEach((a, i) => { const btn = cards[i] && [...cards[i].querySelectorAll('button.off')].find(x => x.textContent === 'Breed'); if (!btn) return; const A = ANIMAL[a.sp];
    btn.textContent = a.age < A.adult ? 'Grown in ' + (A.adult - a.age) + ' d' : a.preg ? 'Expecting' : countIn(A.house) >= capFor(a.sp) ? 'No room' : a.aff < 40 ? 'Needs 2 ♥' : a.bred === today ? 'Rest today' : 'No mate'; });
};
// the sandbox: labels instead of solid signposts, the animal buildings ready, Next day, Get x5
if (typeof setupSandbox === 'function') {
  const _setupSandboxF4 = setupSandbox;
  setupSandbox = function () {
    _setupSandboxF4();
    const m = MAPS.farm; window.SB_LABELS = [];
    for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && o.k === 'sign' && o.text && i % m.w >= 12 && i % m.w <= 46 && (i / m.w | 0) >= 13 && (i / m.w | 0) <= 30) { SB_LABELS.push({ x: i % m.w, y: i / m.w | 0, t: o.text }); m.o[i] = null; } }
    for (const k of ['coop', 'barn', 'stable']) { const B = BP[k]; let done = false;
      for (let y = 3; y < m.h - B.h - 2 && !done; y++) for (let x = 48; x < m.w - B.w - 2 && !done; x++) if (placeOk(m, x, y, B)) { const s = { k, x, y, stage: 4, delivered: {}, work: 0 }; S.structures.push(s); placeStructure(m, s); S.build[k] = Math.max(1, S.build[k] || 0); done = true; }
      if (!done) for (let y = 3; y < m.h - B.h - 2 && !done; y++) for (let x = 2; x < m.w - B.w - 2 && !done; x++) if (placeOk(m, x, y, B)) { const s = { k, x, y, stage: 4, delivered: {}, work: 0 }; S.structures.push(s); placeStructure(m, s); S.build[k] = Math.max(1, S.build[k] || 0); done = true; } }
    CHUNK.clear();
    const bar = document.getElementById('sandboxbar'); if (bar) { bar.style.pointerEvents = 'auto'; bar.append(' ', el('button', { class: 'btn ghost', style: 'padding:0 8px;margin-left:8px', on: () => { if (!MODAL) endDay(false); } }, 'Next day')); }
    toast('The supply crate holds every ingredient and every machine. A coop, barn and stable are ready north of the yard.', 'lvl');
  };
  const _renderCraftF4 = renderCraft;
  renderCraft = function (b) {
    _renderCraftF4(b);
    if (!SANDBOX || !(CRAFT_AT || MODAL.opts.station)) return;
    const st = MODAL.opts.st || 'all', ready = MODAL.opts.ready, shown = RC.filter(r => (st === 'all' || r[3] === st) && (!ready || !canCraft(r)));
    [...b.querySelectorAll('.list > .rrow')].forEach((row, i) => { const r = shown[i], get = [...row.querySelectorAll('.acts button')].find(x => x.textContent === 'Get'); if (r && get) get.after(el('button', { class: 'btn ghost', on: () => { sandboxGet(r, 5); refresh(); } }, 'Get ×5')); });
  };
  const _pcCursorDrawSB = pcCursorDraw;
  pcCursorDraw = function (m) {
    _pcCursorDrawSB(m);
    if (!SANDBOX || !window.SB_LABELS || m.id !== 'farm') return;
    g.save(); g.font = '600 6px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2; g.strokeStyle = 'rgba(42,28,24,.9)'; g.fillStyle = '#fff2c8';
    for (const L of SB_LABELS) { g.strokeText(L.t, (L.x + .5) * 16, L.y * 16 - 4); g.fillText(L.t, (L.x + .5) * 16, L.y * 16 - 4); }
    g.restore();
  };
}

/* ---------- 4 villagers ---------- */
// on the street a shopkeeper talks first: Chat, their shop, or a gift
const SHOP_WORD = { store: 'Shop', smith: 'Smithy', tavern: 'Tavern menu', stablemaster: 'Animals', carpenter: 'Workshop', museum: 'Museum', fisher: 'Fishing shop', landowner: 'Land deeds' };
const _talkNPCF4 = talkNPC;
talkNPC = function (id) {
  const N = NPCS[id];
  if (!N || !N.shop || !SHOP_WORD[N.shop] || !cur || (cur.id !== 'village' && !(cur.id === 'in_tavern' && N.shop !== 'tavern')) || (typeof festToday === 'function' && festToday()) || /^kid/.test(id)) return _talkNPCF4(id);
  if (typeof storyTalk === 'function' && storyTalk(id)) return;
  openModal(N.n, [{ id: 't', label: 'Talk', render: b => {
    greet(b, id);
    b.append(el('div', { class: 'acts wrap' }, el('button', { class: 'btn', on: () => { closeModal(); _talkNPCF4(id); } }, SHOP_WORD[N.shop] || 'Shop'), el('button', { class: 'btn ghost', on: () => drawModal() }, 'Chat'), el('button', { class: 'btn ghost', on: closeModal }, 'Goodbye')));
  } }]);
  const p = document.querySelector('#modal'); if (p) p.classList.add('small');
};
// the greeting shows how far it is to the next heart, and a gift says what it did
const _greetF4 = greet;
greet = function (b, id) {
  _greetF4(b, id);
  const f = fr(id), h = hearts(id), box = [...b.querySelectorAll('.greet')].pop(); if (!box || h >= 10) return;
  const into = f.pts - h * 250, t = box.querySelector('.rtxt');
  if (t) t.append(el('div', { class: 'hprog', title: into + ' / 250 to the next heart' }, el('i', { style: 'width:' + Math.round(into / 2.5) + '%' })));
};
const _giftToF4 = giftTo;
giftTo = function (id, item) {
  const before = fr(id).pts, ok = _giftToF4(id, item);
  if (ok) { const d = fr(id).pts - before, h = hearts(id); if (d) toast(NPCS[id].n + (d >= 80 ? ' loved it' : d > 0 ? ' liked it' : ' didn\'t like it') + ' (' + (d > 0 ? '+' : '') + d + ' friendship' + (h < 10 ? ', ' + (250 - (fr(id).pts - h * 250)) + ' to the next heart' : '') + ').'); }
  return ok;
};

/* ---------- 5 exploration ---------- */
// the Wilds and region maps zoom (buttons or the mouse wheel) and show waystones
const _worldMapCanvasF4 = worldMapCanvas;
worldMapCanvas = function () {
  const c = _worldMapCanvasF4(), x = c.getContext('2d'), wp = S.wayPos || {};
  x.font = '13px Fredoka, sans-serif'; x.textAlign = 'center';
  for (const id in wp) { if (typeof wayWhere === 'function' && wayWhere(id) !== 'wilds') continue; const [X, Y] = wp[id]; x.fillStyle = OUT; x.fillText('◆', X * 3 + 1, Y * 3 + 6); x.fillStyle = (S.ways || {})[id] ? '#8ad8ff' : '#c8c0b0'; x.fillText('◆', X * 3, Y * 3 + 5); }
  return c;
};
const _renderMapF4 = renderMap;
renderMap = function (b) {
  _renderMapF4(b);
  const box = b.querySelector('.mapbox'), c = box && box.querySelector('canvas.wmap:not(.localmap)'); if (!c) return;
  let z = MODAL.opts.mapZ || 1;
  const apply = () => { c.style.width = (c.width * z / 1) + 'px'; c.style.maxWidth = 'none'; c.style.height = 'auto'; MODAL.opts.mapZ = z; };
  const zoom = (f, cx, cy) => { const r = box.getBoundingClientRect(), ox = (cx === undefined ? r.width / 2 : cx - r.left) + box.scrollLeft, oy = (cy === undefined ? r.height / 2 : cy - r.top) + box.scrollTop, z0 = z; z = clamp(z * f, .6, 3); apply(); box.scrollLeft = ox * z / z0 - (ox - box.scrollLeft); box.scrollTop = oy * z / z0 - (oy - box.scrollTop); };
  apply();
  box.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation(); zoom(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); }, { passive: false });
  box.before(el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => zoom(1.25) }, 'Zoom in'), el('button', { class: 'btn ghost', on: () => zoom(.8) }, 'Zoom out'), el('small', null, '  Mouse wheel zooms too. ◆ waystones (blue: attuned)')));
};
// chests list what was inside
const _openChestF4 = openChest;
openChest = function (m, x, y, o) {
  const empty = o.opened || (o.id && S.flags['c_' + o.id]); if (empty) return _openChestF4(m, x, y, o);
  const g0 = S.gold, n0 = m.ents.length; _openChestF4(m, x, y, o);
  const got = {}; for (const e of m.ents.slice(n0)) if (e.type === 'drop') got[e.id] = (got[e.id] || 0) + (e.n || 1);
  const parts = []; if (S.gold > g0) parts.push((S.gold - g0).toLocaleString() + 'g'); if (got.$) { parts.push(got.$.toLocaleString() + 'g'); delete got.$; }
  for (const id in got) if (IT[id]) parts.push(got[id] + ' ' + IT[id].n);
  if (parts.length) toast('The chest held ' + parts.join(', ') + '.', 'lvl');
};
// picking a wild flower or mushroom says what it was
const _pickWildF4 = pickWild;
pickWild = function (m, x, y, o) { const before = Object.assign({}, S.inv); _pickWildF4(m, x, y, o); const id = Object.keys(S.inv).find(k => (S.inv[k] || 0) > (before[k] || 0)); if (id) { const [b] = parseK(id); toast('Picked: ' + IT[b].n + '.'); } };
// ladders in the mine bob a small arrow so they're easy to spot
const _pcCursorDrawLad = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawLad(m);
  if (TITLE || !m || !m.mine) return;
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o || o.k !== 'ladder') continue; const x = (i % m.w + .5) * 16, y = (i / m.w | 0) * 16 - 6 + Math.sin(gameT * 4) * 2;
    g.fillStyle = '#2a1c18'; g.beginPath(); g.moveTo(x - 5, y - 4); g.lineTo(x + 5, y - 4); g.lineTo(x, y + 3); g.closePath(); g.fill(); g.fillStyle = '#ffd040'; g.beginPath(); g.moveTo(x - 3.5, y - 3); g.lineTo(x + 3.5, y - 3); g.lineTo(x, y + 1.5); g.closePath(); g.fill(); }
};
// the request board asks for things a new farm can get in its first week
const _rollBoardF4 = rollBoard;
rollBoard = function () {
  _rollBoardF4();
  if (S.year > 1 || S.season > 0 || S.day > 7) return;
  const early = new Set(['wood', 'stone', 'copper_ore', 'carp', 'red_cap', 'slime_goo', 'hay', 'clam']);
  for (let t = 0; t < 30 && !(early.has(S.board.id) || CROPS[S.board.id]); t++) _rollBoardF4();
};
// small windows for small content
const _openModalF4 = openModal;
openModal = function (title, tabs, opts) { const r = _openModalF4(title, tabs, opts); const p = document.querySelector('#modal'); if (p) p.classList.toggle('small', title === 'Mine elevator' || title === 'A lost page'); return r; };
// a held bow is shown full size at your side, not as a small icon
const _playerActionF4 = playerAction;
playerAction = function () {
  const A = _playerActionF4();
  if (A && A.held && PS && PS.wt === 'bow' && S.eq.weapon && !(pl.anim > 0)) return { frame: A.frame, item: itemIcon(S.eq.weapon), ang: (S.p.dir === 1 ? -1 : 1) * .25 - Math.PI / 4, size: 15 };
  return A;
};
