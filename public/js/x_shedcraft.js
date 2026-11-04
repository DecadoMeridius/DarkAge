/* ================= Crafting from the storage shed (asked 2026-11-04) =================
   With a finished Storage Shed on the farm, crafting at a station (workbench, furnace, anvil,
   kitchen, tanning rack) counts the bank as well as the backpack, and takes from the backpack
   first, then the bank. Without a shed it's the backpack only, as before.
   While SHEDCRAFT is on, cnt / catCount / take / catTake see both; it is on only inside the
   crafting calls (canCraft, doCraft, a job's step and the station window), so shops, quests and
   everything else still count the backpack alone. */

let SHEDCRAFT = 0;
const shedBuilt = () => !!(S && S.bank && S.structures && S.structures.some(s => s.k === 'shed' && s.stage >= 4));
const withShed = f => function () { if (SHEDCRAFT || !shedBuilt()) return f.apply(this, arguments); SHEDCRAFT = 1; try { return f.apply(this, arguments); } finally { SHEDCRAFT = 0; } };

const bankCnt = id => { let n = S.bank[id] || 0; for (let q = 1; q <= 3; q++) n += S.bank[id + '#' + q] || 0; return n; };
const bankTakeK = (k, n) => { const t = Math.min(n, S.bank[k] || 0); if (t) { S.bank[k] -= t; if (S.bank[k] <= 0) delete S.bank[k]; SHED_USED[parseK(k)[0]] = (SHED_USED[parseK(k)[0]] || 0) + t; } return t; };
let SHED_USED = {};

cnt = (f => function (id) { return f(id) + (SHEDCRAFT ? bankCnt(id) : 0); })(cnt);
catCount = (f => function (cat) {
  let n = f(cat); if (!SHEDCRAFT) return n;
  for (const k in S.bank) if (IT[parseK(k)[0]] && CATF[cat](parseK(k)[0])) n += S.bank[k];
  return n;
})(catCount);
take = (f => function (id, n = 1) {
  if (!SHEDCRAFT) return f(id, n);
  if (!has(id, n)) return false;
  SHEDCRAFT = 0; const inBag = cnt(id), fromBag = Math.min(inBag, n); if (fromBag) f(id, fromBag); SHEDCRAFT = 1;   // the backpack first
  n -= fromBag; for (let q = 0; q <= 3 && n > 0; q++) n -= bankTakeK(keyOf(id, q), n);
  return true;
})(take);
catTake = (f => function (cat, n) {
  if (!SHEDCRAFT) return f(cat, n);
  SHEDCRAFT = 0; const fromBag = Math.min(catCount(cat), n); if (fromBag) f(cat, fromBag); SHEDCRAFT = 1;
  n -= fromBag; if (n <= 0) return;
  const ks = Object.keys(S.bank).filter(k => IT[parseK(k)[0]] && CATF[cat](parseK(k)[0])).sort((a, b) => IT[parseK(a)[0]].p - IT[parseK(b)[0]].p);
  for (const k of ks) { if (n <= 0) break; n -= bankTakeK(k, n); }
})(catTake);

canCraft = withShed(canCraft);
renderCraft = withShed(renderCraft);
jobStep = withShed(jobStep);
// a craft that used the shed says so (one toast per craft or per finished batch, not per item)
doCraft = (f => withShed(function (r, n) {
  SHED_USED = {}; const out = f.apply(this, arguments);
  const used = Object.entries(SHED_USED); if (used.length && !JOB_RUN) toast('Took ' + used.map(([id, c]) => c + ' ' + IT[id].n.toLowerCase()).join(', ') + ' from your storage shed.');
  return out;
}))(doCraft);
jobStep = (f => function () {
  const before = JOB; f(); const u = Object.entries(SHED_USED);
  if (before && JOB !== before && u.length) { toast('Took ' + u.map(([id, c]) => c + ' ' + IT[id].n.toLowerCase()).join(', ') + ' from your storage shed.'); SHED_USED = {}; }
})(jobStep);
