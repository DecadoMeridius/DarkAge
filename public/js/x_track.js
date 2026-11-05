/* ================= Pinned recipes on the HUD (asked 2026-11-05) =================
   Every recipe row in a station window and the recipe book gets a pin button. Up to 3 pinned recipes (S.pins, keys
   '<output>|<station>') show in a panel on the left of the screen (#pins): each ingredient as have / need, green once
   there's enough, counting the backpack and, with a Storage Shed built, the bank (x_shedcraft.js). ✕ unpins. */
const PIN_MAX = 3;
const pinKey = r => r[0] + '|' + r[3];
const pinRecipe = k => RC.find(r => pinKey(r) === k);
const pinned = () => (S && S.pins) || [];
function togglePin(r) {
  S.pins = pinned().slice(); const k = pinKey(r), i = S.pins.indexOf(k);
  if (i >= 0) S.pins.splice(i, 1); else { if (S.pins.length >= PIN_MAX) S.pins.shift(); S.pins.push(k); toast('Pinned ' + IT[r[0]].n + ': what you need shows on the left.'); }
  PIN_KEY = ''; pinsDraw();
}
const pinHave = k => { const was = typeof SHEDCRAFT !== 'undefined' ? SHEDCRAFT : 0; try { if (typeof shedBuilt === 'function' && shedBuilt()) SHEDCRAFT = 1; return needHave(k); } finally { if (typeof SHEDCRAFT !== 'undefined') SHEDCRAFT = was; } };
const pinName = k => k[0] === '$' ? (typeof CATN !== 'undefined' && CATN[k] ? CATN[k] : k.slice(1).replace(/_/g, ' ')) : (IT[k] ? IT[k].n : k);
let PIN_KEY = '';
function pinsDraw() {
  if (!S || TITLE) return;
  let box = document.getElementById('pins');
  const P = pinned().map(pinRecipe).filter(Boolean);
  const rows = P.map(r => [r, Object.entries(r[2]).map(([k, n]) => [k, n, pinHave(k)])]);
  const key = JSON.stringify(rows.map(([r, L]) => [pinKey(r), L.map(x => x[2])]));
  if (key === PIN_KEY && box) return; PIN_KEY = key;
  if (!box) { box = el('div', { id: 'pins' }); document.body.append(box); }
  box.innerHTML = ''; box.hidden = !P.length;
  for (const [r, L] of rows) {
    const ready = L.every(([, n, h]) => h >= n);
    const card = el('div', { class: 'pincard f-panel' + (ready ? ' ready' : '') },
      el('div', { class: 'pinh' }, icon(r[0], 20), el('b', null, IT[r[0]].n), el('button', { class: 'pinx', title: 'Unpin', on: () => togglePin(r) }, '✕')));
    for (const [k, n, h] of L) card.append(el('div', { class: 'pinr' + (h >= n ? ' ok' : '') }, el('span', null, Math.min(h, 9999) + ' / ' + n), ' ' + pinName(k)));
    card.append(el('small', null, ready ? 'Ready: make it at the ' + (({ bench: 'workbench', furnace: 'furnace', anvil: 'anvil', kitchen: 'kitchen', tanning: 'tanning rack', hand: 'anywhere' })[r[3]] || r[3]) : 'Pinned'));
    box.append(card);
  }
}
setInterval(() => { try { pinsDraw(); } catch (e) { console.error(e); } }, 500);
renderCraft = (f => function (b) {
  const r = f.apply(this, arguments);
  try {
    const st = (MODAL && MODAL.opts && (MODAL.opts.st || MODAL.opts.station)) || 'all';
    for (const row of b.querySelectorAll('.list > .rrow')) {
      const nm = row.querySelector('.rtxt > b'); if (!nm) continue;
      const name = nm.textContent.replace(/ ×\d+$/, ''), rec = RC.find(x => IT[x[0]] && IT[x[0]].n === name && (st === 'all' || x[3] === st)) || RC.find(x => IT[x[0]] && IT[x[0]].n === name);
      if (!rec) continue; const on = pinned().includes(pinKey(rec));
      const pb = el('button', { class: 'btn ghost pinb' + (on ? ' on' : ''), title: on ? 'Unpin' : 'Pin: show what you still need on the HUD', on: e => { e.stopPropagation(); togglePin(rec); refresh(); } }, '📌');
      const acts = row.querySelector('.acts'); if (acts) acts.prepend(pb); else row.append(pb);
    }
  } catch (e) { console.error(e); }
  return r;
})(renderCraft);
document.head.append(el('style', null, `
#pins { position: fixed; left: 14px; top: 130px; z-index: 30; display: flex; flex-direction: column; gap: 6px; width: 210px; pointer-events: auto; }
#pins .pincard { padding: 6px 8px; font-size: 13px; }
#pins .pincard.ready { box-shadow: 0 0 0 2px #7cd05a inset; }
#pins .pinh { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; } #pins .pinh b { flex: 1; font-size: 13px; }
#pins .pinx { background: none; border: 0; cursor: pointer; font-size: 13px; opacity: .7; } #pins .pinx:hover { opacity: 1; }
#pins .pinr { color: #a8402a; } #pins .pinr.ok { color: #3a7a2a; } #pins .pinr span { font-weight: 700; display: inline-block; min-width: 54px; }
#pins small { opacity: .75; }
.pinb { min-width: 0 !important; padding: 2px 6px !important; filter: grayscale(1); opacity: .6; } .pinb.on { filter: none; opacity: 1; }
`));
