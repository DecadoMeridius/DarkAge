/* ================= Crafting at a station: progress bar and batches =================
   Crafting at any station (workbench, furnace, anvil, kitchen, tanning rack) is a timed batch:
   the station's window stays open with a progress bar ("Smithing Iron Sword 3 / 10") and a
   Cancel button. You don't swing a tool while crafting. Each recipe has Make, x5, x10 and
   x100; a batch is capped at what your materials allow, and adding the same recipe while it
   runs extends the batch. With the window open the batch runs in real time (0.6 s per tick,
   like the game tick); close it and it carries on on the game tick, until you walk away. */

JOB_TICKS.bench = 2;
const CRAFT_VERB = { furnace: 'Smelting', anvil: 'Smithing', tanning: 'Tanning', kitchen: 'Cooking', bench: 'Making' };
const maxCraftable = r => { let n = Infinity; for (const k in r[2]) n = Math.min(n, Math.floor(needHave(k) / r[2][k])); return n === Infinity ? 0 : n; };

const _realCraft = doCraft; // with JOB_RUN set, this crafts at once (materials, output, XP)
doCraft = function (r, n = 1) {
  if (JOB_RUN || !JOB_TICKS[r[3]]) return _realCraft(r, n);
  const why = canCraft(r); if (why) { toast(why, 'bad'); return; }
  n = Math.max(1, Math.min(n, maxCraftable(r)));
  if (JOB && JOB.r === r) { JOB.left += n; JOB.total += n; refreshCraftUI(); return; }
  if (JOB) { toast('Already ' + CRAFT_VERB[JOB.r[3]].toLowerCase() + ' ' + IT[JOB.r[0]].n + '. Cancel it first.', 'bad'); return; }
  JOB = { r, left: n, done: 0, total: n, t: 0, need: JOB_TICKS[r[3]], at: [S.p.x, S.p.y], acc: 0 };
  refreshCraftUI(); // the window stays open
};

/* one step of a job (a game tick, or 0.6 s with the window open) */
function jobStep() {
  if (!JOB) return;
  if (++JOB.t < JOB.need) return;
  JOB.t = 0;
  const why = canCraft(JOB.r); if (why) { toast(why === 'Missing materials' ? 'Out of materials after ' + JOB.done + '.' : why, 'bad'); JOB = null; refreshCraftUI(true); return; }
  JOB_RUN = true; try { _realCraft(JOB.r, 1); } finally { JOB_RUN = false; }
  JOB.done++; const st = JOB.r[3]; if (st === 'anvil') snd(880, .05, 'square', .03); else noiseBurst(.05, .02, 1200);
  if (--JOB.left <= 0) { toast(IT[JOB.r[0]].n + (JOB.total > 1 ? ' ×' + JOB.total : '') + ' done.', 'lvl'); SFX.ok(); JOB = null; refreshCraftUI(true); return; }
  refreshCraftUI();
}
jobTick = function () { // the game tick, while no window is open
  if (!JOB || MODAL) return;
  if (Math.hypot(S.p.x - JOB.at[0], S.p.y - JOB.at[1]) > 3) { toast('You stop working.'); JOB = null; return; }
  jobStep();
};
setInterval(() => { if (!JOB || !MODAL || !S || TITLE) return; JOB.acc = (JOB.acc || 0) + .1; if (JOB.acc >= .6) { JOB.acc -= .6; jobStep(); } }, 100);

/* the progress panel and the batch buttons in a station's window */
function refreshCraftUI(full) {
  if (!MODAL) return;
  if (full) { refresh(); return; }
  const box = document.getElementById('craftprog'); if (!box) { refresh(); return; }
  if (!JOB) { refresh(); return; }
  const k = (JOB.done + JOB.t / JOB.need) / JOB.total;
  box.querySelector('.cpt').textContent = CRAFT_VERB[JOB.r[3]] + ' ' + IT[JOB.r[0]].n + '  ' + JOB.done + ' / ' + JOB.total;
  box.querySelector('i').style.width = Math.round(k * 100) + '%';
}
const _renderCraftJ = renderCraft;
renderCraft = function (b) {
  _renderCraftJ(b);
  const atStation = (typeof CRAFT_AT !== 'undefined' && CRAFT_AT) || MODAL.opts.station; if (!atStation) return;
  if (JOB) {
    const ic = icon(JOB.r[0], 32), k = (JOB.done + JOB.t / JOB.need) / JOB.total;
    const bar = el('div', { class: 'sbar' }, el('i', { style: 'width:' + Math.round(k * 100) + '%' }));
    const box = el('div', { id: 'craftprog', class: 'greet f-panel' }, ic, el('div', { class: 'rtxt' }, el('b', { class: 'cpt' }, CRAFT_VERB[JOB.r[3]] + ' ' + IT[JOB.r[0]].n + '  ' + JOB.done + ' / ' + JOB.total), bar),
      el('button', { class: 'btn ghost', on: () => { toast('Stopped after ' + JOB.done + '.'); JOB = null; refresh(); } }, 'Cancel'));
    b.insertBefore(box, b.firstChild);
  }
  const st = MODAL.opts.st || 'all', ready = MODAL.opts.ready, shown = RC.filter(r => (st === 'all' || r[3] === st) && (!ready || !canCraft(r)));
  [...b.querySelectorAll('.list > .rrow')].forEach((row, i) => {
    const r = shown[i], acts = row.querySelector('.acts'); if (!r || !acts || !JOB_TICKS[r[3]]) return;
    [...acts.querySelectorAll('.btn')].forEach(x => { if (/^(Make|×5)$/.test(x.textContent)) x.remove(); });
    const can = maxCraftable(r), ok = !canCraft(r);
    for (const [lab, n] of [['Make', 1], ['×5', 5], ['×10', 10], ['×100', 100]]) {
      if (n > 1 && can < 2 && lab !== 'Make') continue;
      acts.append(el('button', { class: 'btn' + (n > 1 ? ' ghost' : '') + (ok ? '' : ' off'), title: n > 1 ? 'Make up to ' + n + ' (you have materials for ' + can + ')' : '', on: () => { if (!ok) return; doCraft(r, n); } }, lab));
    }
  });
};
