/* ================= Station windows with slots (asked 2026-11-04) =================
   Smelter, furnaces, charcoal kiln, mill, oven, churn, compost bin, trip and power hammers and the
   treadwheel open one window: the station's own inventory on top (input slots, fuel slots, a
   progress arrow, output slots) and your backpack below it, all as slots.
   - Drag a backpack stack onto the input or the fuel slots, or click it (inputs first, else fuel).
     Wood can go into a kiln's fuel this way; a click alone always made it charcoal input.
   - Drag a station stack onto the backpack, or click it, to take it back.
   - "Move" sets how many go per drag or click (1, 10, half, all); Shift moves half, Ctrl one.
   - A recipe can be chosen (o.sel, its output): then the station only takes that recipe's inputs,
     by hand and from belts, and only makes that (stationRecipes in s_auto.js). "Any" lets it pick. */

const ST_SLOTS = { in: 4, fuel: 2, out: 4 };
let STDRAG = null;   // what is being dragged: { from: 'pack', i } or { from: 'in' | 'fuel' | 'out', k }
const stTread = o => o.k === 'treadwheel';
const stHasFuel = o => stTread(o) || !!(STATIONS[o.k] && STATIONS[o.k].fuel);
const stFuelOK = (o, id) => stTread(o) ? id === 'hay' : stHasFuel(o) && !!FUEL[id];
const stInOK = (o, id) => !stTread(o) && (ACCEPT[o.k] ? ACCEPT[o.k](o, id, 1, true) : usesInput(o, id));
function stAmount(have, ev) {
  const a = ev && ev.ctrlKey ? 1 : ev && ev.shiftKey ? 'Half' : (MODAL && MODAL.opts.sa !== undefined ? MODAL.opts.sa : 'All');
  return Math.max(0, a === 'All' ? have : a === 'Half' ? Math.ceil(have / 2) : Math.min(have, a));
}
// backpack slot i into the station's 'in' or 'fuel'; returns how many moved
function stPut(o, bag, i, ev) {
  const s = S.pack[i]; if (!s) return 0; const [id] = parseK(s.k);
  let n = stAmount(s.n, ev), moved = 0;
  if (bag === 'fuel') {
    if (!stFuelOK(o, id)) { toast(IT[id].n + (stHasFuel(o) ? ' doesn’t burn here.' : ': this station needs no fuel.'), 'bad'); return 0; }
    o.fuel = o.fuel || {}; moved = Math.min(n, CAP - (o.fuel[id] || 0)); if (moved > 0) o.fuel[id] = (o.fuel[id] || 0) + moved;
  } else {
    if (!stInOK(o, id)) { toast(IT[id].n + ' isn’t used ' + (o.sel ? 'by the chosen recipe.' : 'here.'), 'bad'); return 0; }
    while (moved < n && accept(o, id, 1, true)) { accept(o, id, 1); moved++; }
  }
  if (moved <= 0) { toast('That slot is full.', 'bad'); return 0; }
  s.n -= moved; if (s.n <= 0) S.pack[i] = null; touched(); SFX.pop();
  return moved;
}
// a station stack back into the backpack
function stTake(o, bag, k, ev) {
  const src = o[bag]; if (!src || !src[k]) return;
  const [id, q] = parseK(k), n = stAmount(src[k], ev);
  GIVE_NO_DROP = true; const left = give(id, n, q, true); GIVE_NO_DROP = false;
  src[k] -= n - left; if (src[k] <= 0) delete src[k];
  if (left) toast('Your backpack is full.', 'bad'); else SFX.pop();
}
// the recipe that is (or would be) running, for the progress arrow
function stRecipeNow(o) {
  const rs = recipesOf(o); return rs.find(r => Object.entries(r.in).every(([k, n]) => ((o.in || {})[k] || 0) >= n)) || null;
}
const stLine = r => Object.entries(r.in).map(([k, n]) => n + ' ' + IT[k].n.toLowerCase()).join(' + ') + ' → ' + r.out[1] + ' ' + IT[r.out[0]].n.toLowerCase();

function stSlotBox(o, bag, label, count) {
  const src = o[bag] || {}, keys = Object.keys(src).filter(k => src[k] > 0 && IT[parseK(k)[0]]);
  const box = el('div', { class: 'stbox st-' + bag }), grid = el('div', { class: 'stslots' });
  box.append(el('div', { class: 'stlab' }, label), grid);
  for (let j = 0; j < Math.max(count, keys.length); j++) {
    const k = keys[j];
    if (!k) { grid.append(el('div', { class: 'cell f-slot stempty' })); continue; }
    const [id, q] = parseK(k);
    const c = el('button', { class: 'cell f-slot', title: IT[id].n + ' ×' + src[k] + ' (click or drag to your backpack)', on: ev => { stTake(o, bag, k, ev); refresh(); } }, icon(id, 40, q), el('b', null, src[k]));
    c.draggable = true;
    c.addEventListener('dragstart', e => { STDRAG = { from: bag, k }; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', k); } catch (er) { } });
    c.addEventListener('dragend', () => { STDRAG = null; });
    grid.append(c);
  }
  if (bag !== 'out') {   // drops from the backpack
    box.addEventListener('dragover', e => { if (STDRAG && STDRAG.from === 'pack') { e.preventDefault(); box.classList.add('over'); } });
    box.addEventListener('dragleave', () => box.classList.remove('over'));
    box.addEventListener('drop', e => { e.preventDefault(); box.classList.remove('over'); const d = STDRAG; STDRAG = null; if (d && d.from === 'pack') { stPut(o, bag, d.i, e); refresh(); } });
  }
  return box;
}

function stationPanel(b, o, m, x, y, opt) {
  const st = STATIONS[o.k] || {}, fuel = stHasFuel(o), tread = stTread(o);
  // what it does and why it's idle
  let status;
  if (tread) status = o.burn > 0 || (o.fuel || {}).hay ? 'Turning: powers things within 5 tiles while it has hay (1 hay per 20 ticks).' : 'Idle: it runs on hay.';
  else status = (st.power ? (powered(m, x, y) ? 'Powered. ' : 'Needs a windmill, waterwheel or treadwheel nearby. ') : '') + (o.on ? 'Working…' : 'Idle: ' + idleWhy(o, st, m, x, y));
  b.append(el('p', { class: 'note' }, (opt.note ? opt.note + ' ' : '') + status));

  // the recipe choice
  if (!tread && opt.pick !== false) {
    const all = (STATIONS[o.k] || {}).recipes || [], outs = [...new Set(all.map(r => r.out[0]))].filter(id => IT[id]);
    if (outs.length > 1) {
      const chips = el('div', { class: 'chips strec' }, el('span', null, 'Make:'),
        el('button', { class: 'chip' + (!o.sel ? ' on' : ''), title: 'Make whatever the inputs allow', on: () => { o.sel = undefined; o.prog = 0; refresh(); } }, 'Any'));
      for (const id of outs) {
        const rs = all.filter(r => r.out[0] === id);
        chips.append(el('button', { class: 'chip' + (o.sel === id ? ' on' : ''), title: rs.map(stLine).join('\n'), on: () => { o.sel = id; o.prog = 0; refresh(); } }, icon(id, 20), ' ' + IT[id].n));
      }
      b.append(chips);
    }
    const shown = recipesOf(o).slice(0, 6);
    if (shown.length) b.append(el('p', { class: 'note strecline' }, shown.map(stLine).join(' · ') + (recipesOf(o).length > 6 ? ' · …' : '') + '.'));
  }
  if (opt.extra) opt.extra(b);

  // the station's own inventory
  const row = el('div', { class: 'strow' });
  if (!tread) row.append(stSlotBox(o, 'in', 'Input', ST_SLOTS.in));
  if (fuel) {
    const fb = stSlotBox(o, 'fuel', tread ? 'Hay' : 'Fuel', ST_SLOTS.fuel);
    const burn = o.burn > 0 ? Math.min(1, o.burn / Math.max(1, o.burnMax || (tread ? 20 : o.burn))) : 0;
    fb.append(el('div', { class: 'stflame', title: burn ? 'Burning' : 'Not burning' }, el('i', { style: 'width:' + Math.round(burn * 100) + '%' })));
    row.append(fb);
  }
  if (!tread) {
    const r = stRecipeNow(o), need = r ? Math.max(1, Math.round(r.ticks * (st.mult || 1))) : 1, k = r ? Math.min(1, (o.prog || 0) / need) : 0;
    row.append(el('div', { class: 'starrow', title: r ? 'Making ' + IT[r.out[0]].n : 'Nothing to make' }, el('div', { class: 'stbar' }, el('i', { style: 'width:' + Math.round(k * 100) + '%' })), el('span', null, '➜')));
    row.append(stSlotBox(o, 'out', 'Output', ST_SLOTS.out));
  }
  b.append(row);

  // how many per click or drag
  const amt = MODAL.opts.sa !== undefined ? MODAL.opts.sa : 'All';
  b.append(el('div', { class: 'chips' }, el('span', null, 'Move:'), ...[1, 10, 'Half', 'All'].map(a => el('button', { class: 'chip' + (amt === a ? ' on' : ''), on: () => { MODAL.opts.sa = a; refresh(); } }, String(a))),
    el('small', { class: 'sthint' }, 'Drag between the slots, or click. Shift: half · Ctrl: one.')));

  // the backpack, slot for slot
  const pack = el('div', { class: 'stpack' });
  b.append(el('h3', null, 'Your backpack'), pack);
  S.pack.forEach((s, i) => {
    if (!s) { pack.append(el('div', { class: 'cell f-slot stempty' })); return; }
    const [id, q] = parseK(s.k), inOK = stInOK(o, id), fuelOK = stFuelOK(o, id), fits = inOK || fuelOK;
    const c = el('button', { class: 'cell f-slot' + (fits ? '' : ' stdim'), title: IT[id].n + (fits ? (inOK && fuelOK ? ' (click: input · drag to Fuel to burn it)' : inOK ? ' (click or drag to Input)' : ' (click or drag to ' + (tread ? 'Hay' : 'Fuel') + ')') : ''),
      on: ev => { if (!fits) return; stPut(o, inOK ? 'in' : 'fuel', i, ev); refresh(); } }, icon(id, 40, q), el('b', null, s.n));
    c.draggable = true;
    c.addEventListener('dragstart', e => { STDRAG = { from: 'pack', i }; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', s.k); } catch (er) { } });
    c.addEventListener('dragend', () => { STDRAG = null; });
    pack.append(c);
  });
  pack.addEventListener('dragover', e => { if (STDRAG && STDRAG.from !== 'pack') { e.preventDefault(); pack.classList.add('over'); } });
  pack.addEventListener('dragleave', () => pack.classList.remove('over'));
  pack.addEventListener('drop', e => { e.preventDefault(); pack.classList.remove('over'); const d = STDRAG; STDRAG = null; if (d && d.from !== 'pack') { stTake(o, d.from, d.k, e); refresh(); } });
}

openStation = function (o, m, x, y) {
  const st = STATIONS[o.k];
  openModal(IT[o.k].n, [{ id: 's', label: 'Station', render: b => stationPanel(b, o, m, x, y, { note: st.desc ? st.desc + '.' : (st.fuel ? 'Burns wood, hardwood, charcoal or coal.' : '') }) }]);
};
openHammer = function (o, m, x, y) {
  openModal(IT[o.k] ? IT[o.k].n : 'Trip Hammer', [{ id: 'h', label: 'Hammer', render: b => stationPanel(b, o, m, x, y, { pick: false,
    note: RC[o.recipe] ? 'Making ' + IT[RC[o.recipe][0]].n + ' from ' + Object.entries(RC[o.recipe][2]).map(([k, n]) => n + ' ' + IT[k].n.toLowerCase()).join(' + ') + '. Belts can feed it and take the pieces away.' : 'Choose what it should make.',
    extra: bb => {
      const sel = el('select'); sel.append(el('option', { value: '' }, '— choose —'));
      RC.forEach((rc, i) => { if (rc[3] === 'anvil' && IT[rc[0]]) { const op = el('option', { value: i }, IT[rc[0]].n); if (o.recipe === i) op.selected = true; sel.append(op); } });
      sel.onchange = () => { o.recipe = sel.value === '' ? undefined : +sel.value; o.prog = 0; refresh(); };
      bb.append(el('div', { class: 'acts' }, el('b', null, 'Make: '), sel));
    } }) }]);
};
// the treadwheel opens the same window (hay in its slots) instead of feeding 40 hay blind
objInteract = (f => function (m, x, y, o) {
  if (o && o.k === 'treadwheel') return { label: 'Open', fn: () => openModal(IT.treadwheel.n, [{ id: 't', label: 'Treadwheel', render: b => stationPanel(b, o, m, x, y, {}) }]) };
  return f.apply(this, arguments);
})(objInteract);

document.head.append(el('style', null, `
.strow { display: flex; align-items: stretch; gap: 14px; flex-wrap: wrap; margin: 8px 0 10px; padding: 10px 12px; border: 2px solid rgba(80, 50, 20, .35); border-radius: 4px; background: rgba(255, 245, 220, .35); }
.stbox { display: flex; flex-direction: column; gap: 4px; padding: 4px; border-radius: 4px; border: 2px dashed transparent; }
.stbox.over, .stpack.over { border-color: #c8901a; background: rgba(255, 230, 160, .45); }
.stlab { font-weight: 700; font-size: 13px; opacity: .8; }
.stslots { display: grid; grid-template-columns: repeat(2, 56px); gap: 4px; }
.st-fuel .stslots { grid-template-columns: 56px; }
.stempty { opacity: .45; pointer-events: none; }
.stdim { opacity: .45; }
.starrow { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-width: 70px; font-size: 26px; color: #6a4a2a; }
.stbar, .stflame { width: 64px; height: 8px; border: 2px solid rgba(80, 50, 20, .5); background: rgba(0, 0, 0, .12); }
.stbar i, .stflame i { display: block; height: 100%; background: #6aa040; }
.stflame { width: 56px; } .stflame i { background: linear-gradient(90deg, #e8a020, #e04a20); }
.stpack { display: grid; grid-template-columns: repeat(auto-fill, 60px); gap: 4px; padding: 4px; border: 2px dashed transparent; border-radius: 4px; }
.stpack .cell, .stslots .cell { width: 56px !important; height: 56px !important; cursor: grab; }
.strec .chip { display: inline-flex; align-items: center; gap: 2px; } .strec img { width: 20px; height: 20px; }
.strecline { font-size: 12px; margin-top: 0; }
.sthint { opacity: .7; margin-left: 8px; }
`));
