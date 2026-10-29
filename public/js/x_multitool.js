/* ================= The Ember Multitool: the last tool tier =================
   One rune-bound tool that is an axe, a pickaxe and a scythe at once, at tier 6 ("Ember", above
   mythril). Brann forges it once your axe, pickaxe and scythe are all mythril: 30,000g, 3 Ember
   Runes, 5 Starmetal and 10 Mythril Bars. It goes on the hotbar (key kind 'multi', S.tools.multi = 6);
   your old tools stay yours.
   Use it on anything: trees, stumps and logs are chopped, rocks, ores and placed machines are worked
   with the pickaxe, and everything else (grass, weeds, crops) is swept with a 7x3 scythe swing.
   Tier 6 means: the fastest gathering, an extra log or ore 50% of the time, the biggest final-hit
   bonus, and every rock and stump in the game. */

TIER_TOOL[6] = 'Ember'; TOOL_COL[6] = '#ff7a2a'; TOOLN.multi = 'Multitool'; SCYTHE_AREA[6] = [7, 3];
TOOL_KINDS.push('multi');
I('tool_multi', 'Ember Multitool', 'tool', 0, 'obj', '#ff7a2a', null, { tool: 'multi', desc: 'Axe, pickaxe and scythe in one. Drag it onto the hotbar to use it.' });
const MULTI_COST = { gold: 30000, items: { ember_rune: 3, starmetal: 5, mythril_bar: 10 } };

const _useToolM = useTool;
useTool = function () {
  if (selKind() !== 'multi') return _useToolM();
  if (pl.cd > 0) return;
  const m = cur, [tx, ty] = faceTile(), [, , o] = mainOf(m, tx, ty), D = o && OBJ[o.k];
  const sub = D && D.tool === 'axe' ? 'axe' : D && (D.tool === 'pick' || (D.place && !o.fixed)) ? 'pick' : 'scythe';
  const i = S.sel, keep = S.tools[sub]; S.hot[i] = sub; S.tools[sub] = S.tools.multi || 6;
  try { _useToolM(); } finally { S.hot[i] = 'multi'; S.tools[sub] = keep; }
  if (GATHER && GATHER.k === sub) GATHER.k = 'multi'; // gathering keeps reading the multitool's tier
  if (pl.anim > 0) pl.tool = 'multi';
};

/* Brann's tool upgrades: the multitool row */
const _renderUpgradesM = renderUpgrades;
renderUpgrades = function (b) {
  const n = TOOLN.multi; delete TOOLN.multi;
  try { _renderUpgradesM(b); } finally { TOOLN.multi = n; }
  const L = b.querySelector('.list'); if (!L) return;
  const have = S.tools.multi > 0, ready = ['axe', 'pick', 'scythe'].every(k => (S.tools[k] || 1) >= 5);
  const items = Object.entries(MULTI_COST.items), can = ready && S.gold >= MULTI_COST.gold && items.every(([k, n]) => cnt(k) >= n);
  const row = el('div', { class: 'rrow' + (have ? ' done' : '') }, icon('tool:multi:6', 32), el('div', { class: 'rtxt' }, el('b', null, 'Ember Multitool'),
    el('small', null, have ? 'Forged. Axe, pickaxe and scythe in one, at the Ember tier.' : 'Axe, pickaxe and scythe in one, a tier above mythril. Needs a mythril axe, pickaxe and scythe' + (ready ? '' : ' (not yet)') + ', ' + MULTI_COST.gold.toLocaleString() + 'g and ' + items.map(([k, n]) => n + ' ' + IT[k].n + ' (you have ' + cnt(k) + ')').join(', ') + '.')));
  if (!have) row.append(el('button', { class: 'btn' + (can ? '' : ' off'), on: () => {
    if (!ready) { toast('Upgrade your axe, pickaxe and scythe to mythril first.', 'bad'); return; }
    if (!can) { toast('You need more gold or materials.', 'bad'); return; }
    S.gold -= MULTI_COST.gold; for (const [k, n] of items) take(k, n); S.tools.multi = 6;
    const h = S.hot.indexOf(null); if (h >= 0) S.hot[h] = 'multi'; else { const p = S.pack.indexOf(null); if (p >= 0) S.pack[p] = { k: 'tool_multi', n: 1 }; }
    addXP('smithing', 400); SFX.lvl(); SHAKE = .3; hudKey = ''; toast('Brann quenches the Ember Multitool. It hums in your hand.', 'lvl'); refresh();
  } }, 'Forge'));
  L.append(row);
};

/* clicking a resource picks the right tool from the hotbar first: axe for trees, stumps and logs,
   pickaxe for rocks and ores, scythe for grass, weeds and ripe vegetables (the multitool for all of
   them when it's on the hotbar). Seeds or other items in hand keep working on soil. */
function toolFor(m, tx, ty) {
  if (!inb(m, tx, ty)) return null;
  const [, , o] = mainOf(m, tx, ty), D = o && OBJ[o.k];
  if (o && (o.k === 'weed' || o.k === 'tgrass')) return 'scythe';
  if (D && !D.place && (D.tool === 'axe' || D.tool === 'pick') && o.k !== 'ftree') return D.tool;
  const s = m.soil[ty * m.w + tx], C = s && s.crop && CROPS[s.crop.k];
  if (!o && C && s.crop.age >= C.d && needsScythe(C)) return 'scythe';
  return null;
}
const _primaryUseT = primaryUse;
primaryUse = function () {
  if (!PAUSED && !TITLE && !fishing && S && cur && !(typeof PLACING !== 'undefined' && PLACING)) {
    const [tx, ty] = clickTarget(), want = toolFor(cur, tx, ty), held = selKind();
    const soil = cur.soil[ty * cur.w + tx];
    if (want && held !== want && held !== 'multi' && (isTool(held) || !held || !soil)) {
      const slot = S.hot.indexOf('multi') >= 0 ? S.hot.indexOf('multi') : S.hot.indexOf(want);
      if (slot >= 0 && slot !== S.sel) { S.sel = slot; hudKey = ''; }
    }
  }
  return _primaryUseT();
};
