/* The interaction prompt: a small panel in the bottom-right corner listing what you can do with
   whatever is in front of you, each with its key (rebound keys are shown as bound): open a crate,
   talk, enter, hitch or pick up an implement; while an implement is hitched, lower / raise and unhitch;
   while riding, get off. */
const bindKey = (id, def) => { const k = (typeof SETTINGS !== 'undefined' && SETTINGS.binds && SETTINGS.binds[id]) || def; return k === ' ' ? 'Space' : k.length === 1 ? k.toUpperCase() : k[0].toUpperCase() + k.slice(1); };
let promptAcc = 0, promptKey = '';
const _hudTickP = hudTick;
hudTick = function (dt) {
  _hudTickP(dt);
  promptAcc += dt; if (promptAcc < .12) return; promptAcc = 0;
  let box = document.getElementById('iprompt');
  const rows = [];
  if (S && !TITLE && !PAUSED && !MODAL && !fishing && cur && !(typeof DIALOG !== 'undefined' && DIALOG) && !(typeof PLACING !== 'undefined' && PLACING)) {
    const it = findInteract();
    let place = '';
    if (it && it.label && typeof BLD_N === 'object') { const [tx, ty] = faceTile(); const b = (cur.bld || []).find(b => b.door && b.door.x === tx && b.door.y === ty && b.act); if (b && BLD_N[b.act]) place = BLD_N[b.act]; }
    if (it && it.label) rows.push([bindKey('interact', 'e'), place && !place.includes(it.label) ? it.label + ' · ' + place : place || it.label]);
    if (typeof hitchK === 'function' && hitchK()) {
      if (S.hitch.k !== 'cart') rows.push(['G', S.hitch.on ? 'Raise the ' + IT[S.hitch.k].n.toLowerCase() : 'Lower the ' + IT[S.hitch.k].n.toLowerCase()]);
      if (!it) rows.push([bindKey('interact', 'e'), 'Unhitch here']);
    }
    if (S.mounted) rows.push([bindKey('ride', 'r'), 'Get off']);
  }
  const key = rows.map(r => r.join(':')).join('|');
  if (key === promptKey) return; promptKey = key;
  if (!rows.length) { if (box) box.hidden = true; return; }
  if (!box) { box = el('div', { id: 'iprompt', class: 'f-panel' }); document.body.append(box); }
  box.hidden = false; box.innerHTML = '';
  const tr = document.getElementById('topr'); if (tr) box.style.top = Math.round(tr.getBoundingClientRect().bottom + 8) + 'px'; // just under the menu buttons
  for (const [k, t] of rows) box.append(el('div', { class: 'iprow' }, el('kbd', null, k), el('span', null, t)));
};
