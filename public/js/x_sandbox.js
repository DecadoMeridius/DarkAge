/* ================= Test sandbox =================
   A "Test sandbox" button on the title screen starts a throwaway game for trying every
   crafting station. NOTHING IS SAVED: saveGame does nothing while SANDBOX is on, the Delete
   save button is hidden, and a banner says so. Your real save is never read or written.
   The farm gets a yard of stations (workbench, furnace, anvil, tanning rack, kitchen fire,
   the artisan machines and every automation station from stone furnace to ember forge, under
   an ember core so the powered ones run), a supply crate with every ingredient in the game
   (also in the bank), automation tier 5, skills at 75 and 1,000,000 gold.
   At a station, each recipe has a Get button that moves what it needs from the supply crate
   into your backpack, so you craft from your own inventory. */

let SANDBOX = false;
const _saveGameX = saveGame;
saveGame = function () { if (SANDBOX) return true; return _saveGameX(); }; // the sandbox never touches localStorage

{ // the title screen button
  const acts = document.querySelector('#title .acts');
  if (acts && !document.getElementById('tsand')) acts.append(el('button', { id: 'tsand', class: 'btn ghost', on: () => startSandbox() }, 'Test sandbox'));
}

const CATREP = { $fish: 'carp', $mush: 'red_cap', $veg: 'turnip', $egg: 'egg', $berry: 'blackberry' };
function sandboxSupply() {
  const want = new Set();
  for (const r of RC) for (const k in r[2]) want.add(CATREP[k] || k);
  for (const st in STATIONS) for (const r of STATIONS[st].recipes || []) for (const k in r.in) want.add(k);
  for (const k in FUEL) want.add(k);
  ['hay', 'wheat', 'milk', 'egg', 'beet', 'clam', 'grape', 'apple', 'wool', 'goat_milk', 'cheese', 'honey', 'pumpkin', 'potato', 'carrot', 'corn', 'tomato', 'cloth'].forEach(k => want.add(k));
  for (const id of Object.keys(AUTOTIER)) want.add(id);
  ['workbench', 'forge', 'anvil', 'tanrack', 'campfire', 'keg', 'jar', 'cheese_press', 'loom', 'oilpress', 'smoker', 'sprinkler', 'qsprinkler', 'isprinkler'].forEach(k => want.add(k));
  const inv = {};
  for (const k of want) { const it = IT[k]; if (!it) continue; inv[k] = it.t === 'place' || it.t === 'implement' ? 10 : it.p >= 1500 ? 20 : it.p >= 400 ? 60 : 300; }
  return inv;
}
function startSandbox() {
  SANDBOX = true;
  startGame(true);
  setTimeout(() => { while (MODAL) { MODAL.lock = false; closeModal(); } setupSandbox(); }, 300);
}
function setupSandbox() {
  const m = MAPS.farm;
  S.gold = 1000000; S.autoTier = 5; S.flags = S.flags || {}; S.flags.wb = 1; S.look = Object.assign({}, DEFAULT_LOOK, S.look || {}, { name: 'Tester' });
  ensureLife(); for (const k of SK) if (S.sk[k]) { S.sk[k].tx = XPT[75]; S.sk[k].L = 75; S.sk[k].l = 8; }
  ensureCombat(); for (const c in S.csk) S.csk[c].xp = XPT[60];
  S.tools = { hoe: 5, can: 5, axe: 5, pick: 5, rod: 5, scythe: 5 };
  // a cleared yard south of the tent
  const X0 = 12, X1 = 46, Y0 = 13, Y1 = 30;
  for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { if (!inb(m, x, y) || m.solidB[y * m.w + x]) continue; if (getO(m, x, y)) delObj(m, x, y); delete m.soil[y * m.w + x]; if (TER[getT(m, x, y)].solid || TER[getT(m, x, y)].water) continue; setT(m, x, y, 'g'); }
  const rows = [
    [15, ['workbench', 'forge', 'anvil', 'tanrack', 'campfire', 'keg', 'jar', 'cheese', 'loom', 'oilpress', 'smoker']],
    [20, ['stonefurnace', 'smelter', 'blastfurnace', 'emberforge', 'kiln', 'mill', 'oven', 'churn', 'compostbin', 'triphammer', 'powerhammer']],
    [25, ['storage', 'embercore', 'ledger', 'seedhopper', 'reaper', 'golem']],
  ];
  const NAMES = { forge: 'Furnace (forge)', campfire: 'Kitchen (campfire)', storage: 'SUPPLY: every ingredient' };
  let supply = null;
  for (const [y, list] of rows) {
    let x = X0 + 1;
    for (const k of list) {
      const o = { k, fixed: 1 }; if (k === 'storage') { o.inv = sandboxSupply(); supply = o; }
      if (k === 'embercore') x += 1;
      putObj(m, x, y, o);
      setO(m, x, y + 2, { k: 'sign', text: NAMES[k] || (IT[k] ? IT[k].n : k) });
      x += (OBJ[k] && OBJ[k].w) || 1; x += 2;
    }
  }
  S.bank = Object.assign({}, sandboxSupply());
  scanPower(m);
  goMap('farm', (X0 + 2.5) * 16, (Y0 + 4.5) * 16, 0);
  window.SANDBOX_SUPPLY = supply;
  sandboxBanner();
  storyDialog([['narr', 'Test sandbox. Nothing here is saved, and your real save is untouched.'], ['narr', 'Every station is in this yard. The crate in the bottom row holds every ingredient; at a station, the Get button on a recipe puts what it needs in your backpack.'], ['narr', 'Reload the page to leave the sandbox.']], { title: 'Sandbox' });
}
function sandboxBanner() {
  if (document.getElementById('sandboxbar')) return;
  const b = el('div', { id: 'sandboxbar' }, 'TEST SANDBOX: nothing is saved. Reload the page to leave.');
  Object.assign(b.style, { position: 'fixed', top: '6px', left: '50%', transform: 'translateX(-50%)', zIndex: 60, padding: '4px 12px', background: '#7a1a1a', color: '#fff6e0', font: '600 13px Fredoka, sans-serif', border: '2px solid #2a1c18', pointerEvents: 'none' });
  document.body.append(b);
}
const _renderOptsX = renderOpts;
renderOpts = function (b) { _renderOptsX(b); if (!SANDBOX) return; [...b.querySelectorAll('button')].forEach(x => { if (/Delete save|Save game/.test(x.textContent)) x.remove(); }); b.prepend(el('p', { class: 'note' }, 'Test sandbox: nothing is saved. Reload the page to go back to your own game.')); };

/* at a station, a Get button fetches a recipe's ingredients from the supply crate */
function sandboxGet(r, times = 1) {
  const sup = window.SANDBOX_SUPPLY; if (!sup) return;
  let moved = 0;
  for (const k in r[2]) {
    const id = CATREP[k] || k, have = k[0] === '$' ? catCount(k) : cnt(k), want = r[2][k] * times - have; if (want <= 0) continue;
    const n = Math.min(want, sup.inv[id] || 0); if (!n) { toast('The supply crate has no ' + (IT[id] ? IT[id].n : id) + '.', 'bad'); continue; }
    sup.inv[id] -= n; give(id, n, 0, true); moved += n;
  }
  toast(moved ? 'Took ' + moved + ' items from the supply crate.' : 'You already have everything for this.');
}
const _renderCraftX = renderCraft;
renderCraft = function (b) {
  _renderCraftX(b);
  if (!SANDBOX || !(CRAFT_AT || MODAL.opts.station)) return;
  const st = MODAL.opts.st || 'all', ready = MODAL.opts.ready, shown = RC.filter(r => (st === 'all' || r[3] === st) && (!ready || !canCraft(r)));
  [...b.querySelectorAll('.list > .rrow')].forEach((row, i) => { const r = shown[i], acts = row.querySelector('.acts'); if (!r || !acts) return; acts.prepend(el('button', { class: 'btn ghost', on: () => { sandboxGet(r, 1); refresh(); } }, 'Get')); });
};
