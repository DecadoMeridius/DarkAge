/* ================= What stays in storage (asked 2026-11-04) =================
   Every storage (the Storage Shed, which is your bank, and each storage crate or ledger on the farm) gets a Keep tab:
   - "Hired hands may not leave their haul here": off by default. When on, deliveries skip it for the next storage
     (x_hire.js dropSpot reads S.flags.shedNoHands and o.noHands).
   - A minimum to keep per item (S.bankKeep for the shed, o.keep for a crate): automation never takes it below that.
     Belts pulling from it, crates pushing onto belts, cranes, crafting from the shed and the farmhand's fertiliser all
     run inside withReserve, which sets the kept amount aside first and puts it back after, so none of them can see it.
     Taking things out yourself still works. */

let RESERVE_DEPTH = 0;
// set aside up to keep[id] of each item (all qualities together, plain first) and return a function that puts it back
function hideKeep(bag, keep) {
  const moved = [];
  if (!bag || !keep) return () => { };
  // keep['*'] is a floor for every item (asked 2026-11-04: "nothing below 50"); an item's own amount counts when higher
  const all = Math.max(0, (keep['*'] | 0)), ids = new Set(Object.keys(keep).filter(k => k !== '*'));
  if (all) for (const k of Object.keys(bag)) ids.add(parseK(k)[0]);
  for (const id of ids) {
    let want = Math.max(0, keep[id] | 0, all); if (!want) continue;
    for (const k of Object.keys(bag).filter(k => parseK(k)[0] === id).sort()) {
      const n = Math.min(want, bag[k] || 0); if (n <= 0) continue;
      bag[k] -= n; if (bag[k] <= 0) delete bag[k]; moved.push([k, n]); want -= n; if (!want) break;
    }
  }
  return () => { for (const [k, n] of moved) bag[k] = (bag[k] || 0) + n; };
}
const shedKeep = () => (S.bankKeep = S.bankKeep || {});
function withReserve(fn, self, args) {
  if (RESERVE_DEPTH || !S) return fn.apply(self, args);
  const back = [];
  if (S.bank && S.bankKeep) back.push(hideKeep(S.bank, S.bankKeep));
  for (const m of (typeof farmMaps === 'function' ? farmMaps() : [])) for (const o of m.o || []) if (o && STORE.has(o.k) && o.keep && o.inv) back.push(hideKeep(o.inv, o.keep));
  RESERVE_DEPTH++;
  try { return fn.apply(self, args); } finally { RESERVE_DEPTH--; for (const f of back.reverse()) f(); }
}
const reserved = f => function () { return withReserve(f, this, arguments); };
autoTick = reserved(autoTick);
if (typeof craneTick === 'function') craneTick = reserved(craneTick);
// crafting from the shed (x_shedcraft.js) and the farmhand's fertiliser (x_hire.js)
canCraft = reserved(canCraft); doCraft = reserved(doCraft); renderCraft = reserved(renderCraft);
if (typeof jobStep === 'function') jobStep = reserved(jobStep);
if (typeof fhDo === 'function') fhDo = (f => function (m, w, x, y, job) { return job === 'fert' ? withReserve(f, this, arguments) : f.apply(this, arguments); })(fhDo);
if (typeof farmhandFrame === 'function') farmhandFrame = reserved(farmhandFrame);   // (it checks whether there's fertiliser to spread)
if (typeof fhCatchUp === 'function') fhCatchUp = reserved(fhCatchUp);

/* ---- the Keep tab ---- */
function renderKeep(b, bag, keep, noHands, setNoHands, isShed) {
  const cb = el('input', { type: 'checkbox' }); cb.checked = !!noHands; cb.onchange = () => { setNoHands(cb.checked); refresh(); };
  b.append(el('label', { class: 'bwpull' }, cb, ' Hired hands may not leave their haul here'),
    el('p', { class: 'note' }, (noHands ? 'They take it to the next storage: ' + (isShed ? 'a storage crate, else the notice board.' : 'the Storage Shed or another crate, else the notice board.') : 'They bring their haul here' + (isShed ? '.' : ' when there\'s no Storage Shed (or it\'s closed to them).'))
      + ' Below, the least of each item to keep: belts, cranes, crafting' + (isShed ? ' from the shed' : '') + ' and the farmhand never take it below that. You can still take it yourself.'));
  const tot = id => Object.keys(bag).filter(k => parseK(k)[0] === id).reduce((a, k) => a + (bag[k] || 0), 0);
  const rows = el('div', { class: 'keepgrid' });   // small cards in a grid, so a long list stays short
  // every item at once
  const allIn = el('input', { type: 'number', min: 0, value: keep['*'] || 0, class: 'f-input' }); allIn.style.width = '70px';
  allIn.onchange = () => { const v = Math.max(0, Math.floor(+allIn.value || 0)); if (v) keep['*'] = v; else delete keep['*']; refresh(); };
  b.append(el('div', { class: 'acts wrap keepall' }, el('b', null, 'Every item: keep at least'), allIn, el('small', null, keep['*'] ? 'Nothing here goes below ' + keep['*'] + '; an item set higher below keeps its own amount.' : '0 is off. Set it to keep that much of everything in here.')));
  for (const id of Object.keys(keep).filter(id => id !== '*' && IT[id]).sort((a, c) => IT[a].n.localeCompare(IT[c].n))) {
    const inp = el('input', { type: 'number', min: 0, value: keep[id], class: 'f-input' }); inp.style.width = '54px';
    inp.onchange = () => { const v = Math.max(0, Math.floor(+inp.value || 0)); keep[id] = v; refresh(); };
    const step = d => { keep[id] = Math.max(0, (keep[id] || 0) + d); refresh(); };
    rows.append(el('div', { class: 'kcard' + (tot(id) < Math.max(keep[id], keep['*'] || 0) ? ' under' : ''), title: IT[id].n + ': has ' + tot(id).toLocaleString() }, el('div', { class: 'khead' }, icon(id, 20), el('b', null, IT[id].n), el('small', null, tot(id).toLocaleString())),
      el('div', { class: 'kacts' }, el('button', { class: 'btn ghost', on: () => step(-10) }, '−'), inp, el('button', { class: 'btn ghost', on: () => step(10) }, '+'), el('button', { class: 'btn ghost', title: 'Stop keeping it', on: () => { delete keep[id]; refresh(); } }, '✕'))));
  }
  b.append(el('h3', null, 'Keep at least'), rows.children.length ? rows : el('p', { class: 'note' }, 'Nothing kept back yet: pick items below.'));
  const q = (MODAL.opts.kq || '').toLowerCase(), find = el('input', { class: 'f-input', placeholder: 'Find an item to keep…', value: MODAL.opts.kq || '' });
  find.oninput = () => { MODAL.opts.kq = find.value; refresh(); setTimeout(() => { const f = document.querySelector('#mbody input[placeholder="Find an item to keep…"]'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0); };
  b.append(el('h3', null, 'Add an item'), el('div', { class: 'acts wrap' }, find));
  const ids = [...new Set([...Object.keys(bag).map(k => parseK(k)[0]), ...Object.keys(S.inv || {}).map(k => parseK(k)[0])])].filter(id => IT[id] && !(id in keep) && (!q || IT[id].n.toLowerCase().includes(q)))
    .sort((a, c) => IT[a].n.localeCompare(IT[c].n)).slice(0, 120);
  const g = el('div', { class: 'grid' });
  for (const id of ids) g.append(el('button', { class: 'cell f-slot', title: IT[id].n + ' (has ' + tot(id) + ')', on: () => { keep[id] = Math.max(10, Math.min(tot(id), 50)) || 10; refresh(); } }, icon(id, 32)));
  b.append(ids.length ? g : el('p', { class: 'note' }, q ? 'Nothing matches.' : 'Nothing here to keep.'));
}
const keepTab = (label, render) => ({ id: 'keep', label, render });
openBank = (f => function () {
  const r = f.apply(this, arguments);
  if (MODAL && MODAL.tabs && !MODAL.tabs.some(t => t.id === 'keep')) {
    MODAL.tabs.push(keepTab('Keep', b => { S.flags = S.flags || {}; renderKeep(b, S.bank, shedKeep(), S.flags.shedNoHands, v => { S.flags.shedNoHands = v ? 1 : 0; }, true); }));
    drawModal();
  }
  return r;
})(openBank);
openCrate = (f => function (o) {
  const r = f.apply(this, arguments);
  if (MODAL && MODAL.tabs && !MODAL.tabs.some(t => t.id === 'keep')) {
    MODAL.tabs.push(keepTab('Keep', b => { o.inv = o.inv || {}; o.keep = o.keep || {}; renderKeep(b, o.inv, o.keep, o.noHands, v => { o.noHands = v ? 1 : 0; }, false); }));
    drawModal();
  }
  return r;
})(openCrate);
if (typeof openLedger === 'function') openLedger = (f => function (m) {
  const r = f.apply(this, arguments), o = (m.o || []).find(q => q && q.k === 'ledger');
  if (o && MODAL && MODAL.tabs && !MODAL.tabs.some(t => t.id === 'keep')) {
    MODAL.tabs.push(keepTab('Keep', b => { o.inv = o.inv || {}; o.keep = o.keep || {}; renderKeep(b, o.inv, o.keep, o.noHands, v => { o.noHands = v ? 1 : 0; }, false); }));
    drawModal();
  }
  return r;
})(openLedger);
if (typeof HELP !== 'undefined') {
  HELP.keep = ['Keep', ['Hired hands may not leave their haul here: tick it and they take it to the next storage instead.', 'Keep at least: automation (belts, cranes, crafting from the shed, the farmhand) never takes an item below the amount you set. You can still take it out yourself.']];
  helpKey = (f => function () { if (MODAL && MODAL.cur === 'keep') return 'keep'; return f.apply(this, arguments); })(helpKey);
}
document.head.append(el('style', null, `
.keepall { align-items: center; gap: 8px; margin: 6px 0; }
.keepgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 5px; }
.kcard { display: flex; flex-direction: column; gap: 3px; padding: 4px 6px; border: 2px solid rgba(80, 50, 20, .3); border-radius: 4px; background: rgba(255, 245, 220, .35); min-width: 0; }
.kcard.under { border-color: #c8901a; }
.kcard .khead { display: flex; align-items: center; gap: 5px; min-width: 0; }
.kcard .khead b { flex: 1; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .kcard .khead small { opacity: .75; font-size: 12px; }
.kcard .kacts { display: flex; align-items: center; gap: 3px; } .kcard .kacts .btn { padding: 1px 8px; min-width: 0; font-size: 13px; } .kcard .kacts input { padding: 1px 4px; font-size: 13px; }
`));
