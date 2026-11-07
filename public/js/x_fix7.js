/* Double yields everywhere (asked 2026-11-07: "does the double forage work for sure?"). The Bountiful passive ("+6%
   chance to get a double yield", offered in every life skill from level 30) was only read for woodcutting, mining
   (o_skills.js gatherTick) and farming (t_balance.js harvest). Now it also counts for:
   - foraging: forage you pick up (`fg`) and wild flowers and mushrooms (`pickWild`); Gatherer gives the 25% its text
     promises (the code rolled 12%);
   - fishing: a rod or harpoon catch can come up two on the line;
   - cooking, smithing, crafting and the rest at a station: each unit made can come out doubled, by the recipe's skill
     (gear is left alone: a forged piece is one of a kind).
   A double says so in a toast. */
let BOUNTY_CTX = null;   // 'forage' while a forage pick runs; a recipe while doCraft is between its check and its output
// recipes with no skill level train their station's skill
const BOUNTY_SKILL = { kitchen: 'cooking', forge: 'smithing', furnace: 'smithing', anvil: 'smithing', bench: 'crafting', tanning: 'crafting', hand: 'crafting' };
const bountyChance = k => perkCount(k, 'bounty') * .06;
const _canCraftB = canCraft;
canCraft = function (r) {
  const why = _canCraftB.apply(this, arguments);
  // doCraft checks, then gives the output in the same run: remember the recipe for that give only
  if (!why && r && IT[r[0]] && !['weapon', 'armor'].includes(IT[r[0]].t)) { BOUNTY_CTX = r; queueMicrotask(() => { if (BOUNTY_CTX === r) BOUNTY_CTX = null; }); }
  return why;
};
give = (f => function (k, n, q, quiet) {
  const r = f.apply(this, arguments), base = typeof k === 'string' ? k.split('#')[0] : k, it = IT[base];
  try {
    if (!it || !S) return r;
    let extra = 0, why = '';
    if (BOUNTY_CTX === 'forage') { BOUNTY_CTX = null; const p = bountyChance('foraging') + (hasPerk('gatherer') ? .13 : 0); if (Math.random() < p) { extra = 1; why = 'Bountiful'; } }   // gatherer: .12 in the old roll + .13 = .25
    else if (Array.isArray(BOUNTY_CTX) && BOUNTY_CTX[0] === base) { const R = BOUNTY_CTX, sk = (R[4] && R[4][0]) || BOUNTY_SKILL[R[3]]; BOUNTY_CTX = null; if (sk && S.sk[sk] && Math.random() < bountyChance(sk)) { extra = R[1] || 1; why = 'Bountiful'; } }
    else if (it.t === 'fish' && n === 1 && (typeof fishing !== 'undefined' && fishing || typeof FG !== 'undefined' && FG) && Math.random() < bountyChance('fishing')) { extra = 1; why = 'Two on the line'; }
    if (extra) { f.call(this, k, extra, q, true); toast(why + ': +' + extra + ' ' + it.n + '.', 'lvl'); }
  } catch (e) { console.error(e); }
  return r;
})(give);
// forage pick-ups and wild flowers run their own give: mark them
objInteract = (f => function (m, x, y, o) {
  const r = f.apply(this, arguments);
  if (r && o && o.k === 'fg' && typeof r.fn === 'function') { const fn = r.fn; r.fn = function () { BOUNTY_CTX = 'forage'; try { return fn.apply(this, arguments); } finally { if (BOUNTY_CTX === 'forage') BOUNTY_CTX = null; } }; }
  return r;
})(objInteract);
if (typeof pickWild === 'function') pickWild = (f => function () { BOUNTY_CTX = 'forage'; try { return f.apply(this, arguments); } finally { if (BOUNTY_CTX === 'forage') BOUNTY_CTX = null; } })(pickWild);

/* Spent fields go back to ground (asked 2026-11-07): once a crop is gone from its soil (the last harvest of a crop that
   doesn't regrow, or a withered plant cleared by hand or with the scythe), the tilled tile turns back into plain ground.
   A crop that keeps fruiting keeps its soil, since it never leaves. Checked on the tick, so every way a crop can go
   (by hand, scythe, farmhand, reaper) is covered: soil that has had a crop (`s.had`) and now has none is removed.
   Kept: soil within reach of a seed hopper (3 tiles) or an ember golem (6), which sow it again in the morning, and the
   greenhouse beds (farmMaps doesn't include the greenhouse). */
const SOWER_R = { seedhopper: 3, golem: 6 };
function sownByMachine(m, x, y) {
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i], r = o && SOWER_R[o.k]; if (r && Math.abs(i % m.w - x) <= r && Math.abs((i / m.w | 0) - y) <= r) return true; }
  return false;
}
EVT.on('tick', () => {
  if (!S || typeof farmMaps !== 'function') return;
  for (const m of farmMaps()) {
    if (!m.soil) continue; let sowers = null;
    for (const key in m.soil) {
      const s = m.soil[key]; if (!s) continue;
      if (s.crop) { s.had = 1; continue; }
      if (!s.had) continue;
      const i = +key, x = i % m.w, y = i / m.w | 0;
      if (sowers === null) sowers = m.o.some(o => o && SOWER_R[o.k]);
      if (sowers && sownByMachine(m, x, y)) { s.had = 0; continue; }
      delete m.soil[key];
    }
  }
});
