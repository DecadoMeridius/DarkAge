/* ================= 28-slot backpack, worn equipment, bank =================
   S.pack is the source of truth: 28 slots of { k, n } (k = item key, 'id' or 'id#quality').
   Weapons, armour and rings take one slot each; everything else stacks in one slot
   (STACKS below; change it there to make more things single-slot).
   S.inv is kept as a read-only view (item key -> total in the pack) so the rest of the
   game (shops, crafting, quests) keeps reading it. Old saves with a plain S.inv are
   migrated on load; anything that doesn't fit goes to the bank.
   S.bank holds everything else; it's opened from storage chests (farmhouse, Mara's store).
   S.presets: three saved equipment loadouts, loaded from the bank window. */

const PACK_SIZE = 28;
const SINGLE = new Set(['weapon', 'armor', 'ring']);
const stacks = id => !(IT[id] && SINGLE.has(IT[id].t));
let PACKV = 0, INVC = null, INVV = -1;

function ensurePack(s = S) {
  if (!s || s.__packed) return;
  const old = Object.getOwnPropertyDescriptor(s, 'inv');
  const legacy = old && 'value' in old ? old.value || {} : {};
  if (!Array.isArray(s.pack)) {
    s.pack = new Array(PACK_SIZE).fill(null); s.bank = s.bank || {};
    const order = Object.keys(legacy).filter(k => legacy[k] > 0 && IT[parseK(k)[0]]);
    for (const k of order) {
      let n = legacy[k];
      const [id] = parseK(k);
      if (stacks(id)) { const e = s.pack.indexOf(null); if (e >= 0) { s.pack[e] = { k, n }; n = 0; } }
      else while (n > 0) { const e = s.pack.indexOf(null); if (e < 0) break; s.pack[e] = { k, n: 1 }; n--; }
      if (n > 0) s.bank[k] = (s.bank[k] || 0) + n; // didn't fit: banked, not lost
    }
  }
  s.bank = s.bank || {}; s.presets = s.presets || [null, null, null];
  delete s.inv;
  Object.defineProperty(s, 'inv', { configurable: true, enumerable: false, get: invView, set() { } });
  Object.defineProperty(s, '__packed', { value: true, enumerable: false, configurable: true });
  PACKV++;
}
function invView() {
  if (INVV === PACKV && INVC) return INVC;
  const o = {}; for (const sl of S.pack) if (sl) o[sl.k] = (o[sl.k] || 0) + sl.n;
  INVC = o; INVV = PACKV; return o;
}
const touched = () => { PACKV++; hudKey = ''; };
const packFree = () => { ensurePack(); return S.pack.filter(s => !s).length; };

/* add n of key k; returns how many did NOT fit */
function packAdd(k, n) {
  ensurePack(); const [id] = parseK(k);
  if (stacks(id)) {
    const i = S.pack.findIndex(s => s && s.k === k);
    if (i >= 0) S.pack[i].n += n; else { const e = S.pack.indexOf(null); if (e < 0) return n; S.pack[e] = { k, n }; }
    touched(); return 0;
  }
  while (n > 0) { const e = S.pack.indexOf(null); if (e < 0) break; S.pack[e] = { k, n: 1 }; n--; }
  touched(); return n;
}
function packRemove(k, n) {
  ensurePack(); let have = 0; for (const s of S.pack) if (s && s.k === k) have += s.n;
  if (have < n) return false;
  for (let i = PACK_SIZE - 1; i >= 0 && n > 0; i--) { const s = S.pack[i]; if (!s || s.k !== k) continue; const t = Math.min(s.n, n); s.n -= t; n -= t; if (s.n <= 0) S.pack[i] = null; }
  touched(); return true;
}

cnt = function (id) { ensurePack(); const v = invView(); let n = v[id] || 0; for (let q = 1; q <= 3; q++) n += v[id + '#' + q] || 0; return n; };
takeK = function (k, n = 1) { return packRemove(k, n); };
take = function (id, n = 1) { if (!has(id, n)) return false; for (let q = 0; q <= 3 && n > 0; q++) { const k = keyOf(id, q), c = invView()[k] || 0, t = Math.min(c, n); if (t) { packRemove(k, t); n -= t; } } return true; };
let fullWarnT = 0;
const _give = give;
give = function (id, n = 1, q = 0, quiet) {
  ensurePack();
  if (id === '$') return _give(id, n, q, quiet); // gold isn't an item
  if (id === 'gem') { id = wpick([['amethyst', 4], ['topaz', 4], ['aquamarine', 2], ['emerald', 1.5], ['ruby', 1.5], ['diamond', .5 + (S.sk.mining.l > 6 ? .5 : 0)]]); if (hasPerk('geologist')) n *= 2; }
  if (!IT[id]) return 0;
  if (!QUAL_T.has(IT[id].t)) q = 0;
  const k = keyOf(id, q), left = packAdd(k, n), got = n - left;
  if (got > 0) {
    if (!quiet) floatText(S.p.x, S.p.y - 26, '+' + got + ' ' + IT[id].n, q ? ['', '#dfe8f0', '#ffd040', '#ff8a3a'][q] : '#fff6d8');
    if (id === 'ember_shard') { S.shardsTotal += got; toast('An ember shard! (' + S.shardsTotal + ' found)', 'lvl'); SFX.secret(); }
    if (IT[id].t === 'fish') S.stats.caught[id] = (S.stats.caught[id] || 0) + got;
  }
  if (left > 0) {
    if (gameT - fullWarnT > 2) { toast('Your backpack is full.', 'bad'); fullWarnT = gameT; }
    if (cur && !GIVE_NO_DROP) { for (let i = 0; i < left; i += stacks(id) ? left : 1) { dropItem(cur, S.p.x, S.p.y, id, stacks(id) ? left : 1); cur.ents[cur.ents.length - 1].q = q; cur.ents[cur.ents.length - 1].t = -1.2; } }
  }
  return left;
};
let GIVE_NO_DROP = false; // pickups from the ground set this so a full pack leaves the item where it lies

/* ---- equipment: level requirements, space checks ---- */
const TIER_REQ = [1, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 9, 10]; // combat level per gear tier (TIERS order)
const reqOf = id => { const it = IT[id]; return it && (it.t === 'weapon' || it.t === 'armor') && it.ti !== undefined ? TIER_REQ[it.ti] || 1 : 0; };
equip = function (id) {
  const it = IT[id]; if (!it || !it.slot) return;
  const need = reqOf(id); if (need && S.sk.combat.l < need) { toast('You need Combat level ' + need + ' to use ' + it.n + '.', 'bad'); SFX.bad(); return; }
  let slot = it.slot; if (slot === 'ring') slot = !S.eq.ring1 ? 'ring1' : !S.eq.ring2 ? 'ring2' : 'ring1';
  const old = S.eq[slot]; if (!take(id)) return;
  if (old) { GIVE_NO_DROP = true; const left = give(old, 1, 0, true); GIVE_NO_DROP = false; if (left) { give(id, 1, 0, true); toast('No room in your backpack to swap.', 'bad'); return; } }
  S.eq[slot] = id; if (slot === 'weapon') S.hot[5] = 'weapon';
  HC_P = null; recalc(); hudKey = ''; SFX.ok();
};
unequip = function (slot) {
  if (slot === 'weapon') return; const o = S.eq[slot]; if (!o) return;
  if (packFree() < 1) { toast('Your backpack is full.', 'bad'); return; }
  give(o, 1, 0, true); S.eq[slot] = null; HC_P = null; recalc();
};
const _itemDesc = itemDesc;
itemDesc = function (id) { const d = _itemDesc(id), r = reqOf(id); return r ? d + ' Requires Combat ' + r + '.' : d; };

/* ---- backpack window ---- */
const WORN = [[null, 'helm', null], ['weapon', 'body', 'shield'], [null, 'boots', null], ['ring1', null, 'ring2']];
const WORN_N = { helm: 'Head', weapon: 'Weapon', body: 'Body', shield: 'Shield', boots: 'Feet', ring1: 'Ring', ring2: 'Ring' };
function defaultAction(id) { const it = IT[id]; if (!it) return null; if (it.slot) return it.slot === 'weapon' || it.slot === 'shield' ? 'Wield' : 'Wear'; if (it.eat) return 'Eat'; return null; }
function slotPrimary(i) {
  const s = S.pack[i]; if (!s) return; const [id] = parseK(s.k), a = defaultAction(id);
  if (MODAL.opts.giftTo) { MODAL.opts.sel = i; refresh(); return; }
  if (a === 'Eat') { eat(id); } else if (a) equip(id); else MODAL.opts.sel = i;
  refresh();
}
function packMenu(e, i) {
  e.preventDefault(); const s = S.pack[i]; if (!s) return; const [id, q] = parseK(s.k), it = IT[id], a = defaultAction(id);
  const opts = [];
  if (a) opts.push([a, () => slotPrimary(i)]);
  opts.push(['Use', () => { MODAL.opts.sel = i; refresh(); }]);
  opts.push(['Drop', () => dropSlot(i, s.n)]); if (s.n > 1) opts.push(['Drop 1', () => dropSlot(i, 1)]);
  opts.push(['Examine', () => toast(((q ? QNAME[q] + ' ' : '') + it.n) + ': ' + itemDesc(id))]);
  ctxMenu(e.clientX, e.clientY, it.n, opts);
}
function dropSlot(i, n) { const s = S.pack[i]; if (!s) return; const [id, q] = parseK(s.k); n = Math.min(n, s.n); s.n -= n; if (s.n <= 0) S.pack[i] = null; touched(); for (let k = 0; k < (stacks(id) ? 1 : n); k++) { dropItem(cur, S.p.x, S.p.y, id, stacks(id) ? n : 1); const d = cur.ents[cur.ents.length - 1]; d.q = q; d.t = -2; } SFX.pop(); refresh(); }
function ctxMenu(x, y, title, opts) {
  let m = $('#ctxmenu'); if (!m) { m = el('div', { id: 'ctxmenu' }); document.body.append(m); addEventListener('mousedown', ev => { if (!m.contains(ev.target)) m.hidden = true; }); }
  m.innerHTML = ''; m.append(el('div', { class: 'ctxhead' }, title));
  for (const [label, fn] of [...opts, ['Cancel', () => { }]]) m.append(el('button', { on: () => { m.hidden = true; fn(); } }, label));
  m.hidden = false; m.style.left = Math.min(x, innerWidth - 200) + 'px'; m.style.top = Math.min(y, innerHeight - 30 * (opts.length + 2)) + 'px';
}
renderBag = function (b) {
  ensurePack();
  const wrap = el('div', { class: 'bagwrap' }), left = el('div', { class: 'worncol' });
  const worn = el('div', { class: 'worn' });
  for (const row of WORN) for (const s of row) {
    if (!s) { worn.append(el('div', { class: 'wgap' })); continue; }
    const id = S.eq[s], c = el('button', { class: 'eq f-slot', title: id ? 'Remove ' + IT[id].n : WORN_N[s], on: () => { if (id && s !== 'weapon') { unequip(s); refresh(); } } }, id ? icon(id, 40) : el('span', { class: 'empty' }, WORN_N[s]));
    if (id) { c.addEventListener('mouseenter', () => showTip(c, id)); c.addEventListener('mouseleave', hideTip); }
    worn.append(c);
  }
  const st = el('div', { class: 'eqstat' }, el('div', null, 'Attack ', el('b', null, Math.round(PS.atk * (1 + PS.dmg)))), el('div', null, 'Defence ', el('b', null, Math.round(PS.def))), el('div', null, 'Critical ', el('b', null, Math.round(PS.crit * 100) + '%')), el('div', null, 'Health ', el('b', null, Math.round(S.p.hp) + ' / ' + maxHP())), el('div', null, 'Combat level ', el('b', null, S.sk.combat.l)), PS.set ? el('div', { class: 'setb' }, SETB[PS.set][0]) : null);
  left.append(el('h3', null, 'Worn equipment'), worn, st);
  const right = el('div', { class: 'bagright' }), sel = MODAL.opts.sel;
  right.append(el('h3', null, 'Backpack ', el('small', { class: 'note' }, (PACK_SIZE - packFree()) + ' / ' + PACK_SIZE)));
  const grid = el('div', { class: 'pack' });
  S.pack.forEach((s, i) => {
    const c = el('div', { class: 'cell f-slot' + (i === sel ? ' on' : ''), draggable: s ? 'true' : 'false' });
    if (s) { const [id, q] = parseK(s.k); c.append(icon(id, 40, q)); if (stacks(id) && s.n > 1) c.append(el('b', null, s.n > 99999 ? Math.floor(s.n / 1000) + 'K' : s.n)); c.addEventListener('mouseenter', () => showTip(c, id)); c.addEventListener('mouseleave', hideTip); }
    c.onclick = () => slotPrimary(i); c.oncontextmenu = e => packMenu(e, i);
    c.ondragstart = e => { e.dataTransfer.setData('text', String(i)); hideTip(); }; c.ondragover = e => e.preventDefault();
    c.ondrop = e => { e.preventDefault(); const from = +e.dataTransfer.getData('text'); if (from === i || isNaN(from)) return; [S.pack[from], S.pack[i]] = [S.pack[i], S.pack[from]]; touched(); MODAL.opts.sel = null; refresh(); };
    grid.append(c);
  });
  right.append(grid);
  if (sel !== null && sel !== undefined && S.pack[sel]) {
    const s = S.pack[sel], [id, q] = parseK(s.k), it = IT[id], acts = el('div', { class: 'acts wrap' });
    if (MODAL.opts.giftTo) acts.append(el('button', { class: 'btn', on: () => { if (giftTo(MODAL.opts.giftTo, s.k)) closeModal(); } }, 'Give to ' + NPCS[MODAL.opts.giftTo].n));
    else {
      if (id === 'treasure_map') acts.append(el('button', { class: 'btn', on: () => { readMap(); refresh(); } }, 'Read'));
      if (id === 'warp_totem') acts.append(el('button', { class: 'btn', on: () => { closeModal(); useItem(id); } }, 'Use'));
      if (!it.slot) { const hb = el('div', { class: 'hbset' }, el('small', null, 'Put on hotbar ')); [6, 7, 8, 9].forEach(h => hb.append(el('button', { class: 'chip' + (S.hot[h] === id ? ' on' : ''), on: () => { S.hot = S.hot.map(x => x === id ? null : x); S.hot[h] = id; S.sel = h; hudKey = ''; refresh(); } }, String(h === 9 ? 0 : h + 1)))); acts.append(hb); }
    }
    right.append(el('div', { class: 'detail f-panel' }, icon(id, 40, q), el('div', { class: 'dtxt' }, el('b', null, (q ? QNAME[q] + ' ' : '') + it.n + (s.n > 1 ? ' ×' + s.n : '')), el('div', null, itemDesc(id))), acts));
  } else right.append(el('p', { class: 'note' }, MODAL.opts.giftTo ? 'Pick a gift for ' + NPCS[MODAL.opts.giftTo].n + '.' : 'Left click to wear, wield or eat. Right click for more. Drag to rearrange. Bulk storage goes in a storage chest.'));
  wrap.append(left, right); b.append(wrap);
};

/* ---- bank ---- */
function bankSorted() { return Object.keys(S.bank).filter(k => S.bank[k] > 0 && IT[parseK(k)[0]]).sort((a, b) => { const A = IT[parseK(a)[0]], B = IT[parseK(b)[0]]; return TORD.indexOf(A.t) - TORD.indexOf(B.t) || A.n.localeCompare(B.n); }); }
function deposit(i, n) { const s = S.pack[i]; if (!s) return; n = Math.min(n, s.n); S.bank[s.k] = (S.bank[s.k] || 0) + n; s.n -= n; if (s.n <= 0) S.pack[i] = null; touched(); }
function withdraw(k, n) { n = Math.min(n, S.bank[k] || 0); if (!n) return; GIVE_NO_DROP = true; const [id, q] = parseK(k), left = give(id, n, q, true); GIVE_NO_DROP = false; S.bank[k] -= n - left; if (S.bank[k] <= 0) delete S.bank[k]; touched(); }
function openBank() {
  ensurePack();
  openModal('Storage', [{ id: 'bank', label: 'Bank', render: b => {
    const wrap = el('div', { class: 'bankwrap' }), L = el('div', { class: 'bankcol' }), R = el('div', { class: 'bankcol wide' });
    L.append(el('h3', null, 'Backpack'), el('p', { class: 'note' }, 'Click to deposit the stack, right click for one.'));
    const pg = el('div', { class: 'pack' });
    S.pack.forEach((s, i) => { const c = el('div', { class: 'cell f-slot' }); if (s) { const [id, q] = parseK(s.k); c.append(icon(id, 40, q)); if (s.n > 1) c.append(el('b', null, s.n)); c.addEventListener('mouseenter', () => showTip(c, id)); c.addEventListener('mouseleave', hideTip); }
      c.onclick = () => { deposit(i, Infinity); refresh(); }; c.oncontextmenu = e => { e.preventDefault(); deposit(i, 1); refresh(); }; pg.append(c); });
    L.append(pg, el('div', { class: 'acts' }, el('button', { class: 'btn', on: () => { S.pack.forEach((_, i) => deposit(i, Infinity)); refresh(); } }, 'Deposit all'),
      el('button', { class: 'btn ghost', on: () => { S.pack.forEach((s, i) => { if (s && !S.hot.includes(parseK(s.k)[0])) deposit(i, Infinity); }); refresh(); } }, 'Keep hotbar items')));
    R.append(el('h3', null, 'Bank'), el('p', { class: 'note' }, 'Click to take the stack, right click for one.'));
    const bg = el('div', { class: 'grid' });
    for (const k of bankSorted()) { const [id, q] = parseK(k), c = el('div', { class: 'cell f-slot' }, icon(id, 40, q), el('b', null, S.bank[k] > 99999 ? Math.floor(S.bank[k] / 1000) + 'K' : S.bank[k]));
      c.addEventListener('mouseenter', () => showTip(c, id)); c.addEventListener('mouseleave', hideTip);
      c.onclick = () => { withdraw(k, stacks(id) ? S.bank[k] : 1); refresh(); }; c.oncontextmenu = e => { e.preventDefault(); withdraw(k, 1); refresh(); }; bg.append(c); }
    if (!bg.children.length) bg.append(el('p', { class: 'note' }, 'The bank is empty.'));
    R.append(bg);
    const pr = el('div', { class: 'presets' }, el('h3', null, 'Equipment presets'));
    S.presets.forEach((p, i) => pr.append(el('div', { class: 'acts' }, el('b', null, 'Loadout ' + (i + 1) + ' '), el('small', { class: 'note' }, p ? Object.values(p).filter(Boolean).map(id => IT[id] ? IT[id].n : '').join(', ') : 'empty'),
      el('button', { class: 'btn ghost', on: () => { S.presets[i] = Object.assign({}, S.eq); toast('Loadout ' + (i + 1) + ' saved.'); refresh(); } }, 'Save'),
      p ? el('button', { class: 'btn', on: () => { loadPreset(p); refresh(); } }, 'Load') : null)));
    R.append(pr);
    wrap.append(L, R); b.append(wrap);
  } }]);
}
function loadPreset(p) {
  for (const slot in p) {
    const want = p[slot]; if (!want || S.eq[slot] === want) continue;
    if (!has(want)) { if (S.bank[want]) withdraw(want, 1); else { toast("Can't find " + IT[want].n + '.', 'bad'); continue; } }
    equip(want);
  }
}

/* storage chests in the farmhouse and Mara's store open the bank */
if (typeof ROOMS !== 'undefined') {
  ROOMS.house.f.push(['bank', 10, 5, 'bank', 'Storage']);
  ROOMS.store.f.push(['bank', 8, 6, 'bank', 'Bank']);
  FURN.bank = {}; OBJ.furn_bank = { solid: 1, fixed: 1 };
}
const _buildObjectsP = buildObjects;
buildObjects = function () { _buildObjectsP(); SPR.furn_bank = PIX.get('chest.0') || SPR.chest[0]; };
const _objInteractP = objInteract;
objInteract = function (m, x, y, o) { if (o.act === 'bank') return { label: o.label || 'Bank', fn: openBank }; return _objInteractP(m, x, y, o); };

/* make sure every state object (title screen, new game, loaded save) uses the pack */
const _startGameP = startGame;
startGame = function (isNew) { _startGameP(isNew); ensurePack(); };
const _saveGame = saveGame;
saveGame = function () { ensurePack(); return _saveGame(); };
