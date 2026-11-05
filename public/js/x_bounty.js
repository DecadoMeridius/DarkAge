/* ================= Bounties: named elites in the Wilds (asked 2026-11-05) =================
   The Barracks in Kingsbridge (kb_barracks) has a Bounties tab. Each week (bountyWeek) three bounties are posted, made from
   the world seed: a named elite of a Hollow Vale creature (BOUNTY_FOES by biome), its lair (a walkable tile in its biome in the
   Wilds), its level and its reward. Take one and an arrow at your feet points to its lair while you're in the Wilds; within
   30 tiles it is there (spawnEnemy, then made an elite: 8x health, 1.6x attack, a gold ring and its name over it). Kill it,
   then claim the reward at the Barracks: gold plus a Fine or Masterwork weapon or armour piece with traits (x_forge.js) of a
   tier that fits the foe. Unclaimed or unfinished bounties end with the week.
   State: S.bounty = { wk, take: { id: 1 }, done: { id: 1 }, paid: { id: 1 } }. */
const BOUNTY_FOES = [['meadow', ['wolf', 'blueslime']], ['forest', ['wolf', 'boar', 'zombie']], ['highlands', ['bandit', 'rockcrab', 'archer']],
  ['coast', ['crab', 'pirate']], ['frost', ['icewolf', 'yeti', 'wraith']], ['ash', ['imp', 'ashgolem', 'shade']]];
const BOUNTY_N1 = ['Grim', 'Scar', 'Ash', 'Rot', 'Thorn', 'Gloom', 'Blood', 'Iron', 'Frost', 'Bone', 'Black', 'Red', 'Old'];
const BOUNTY_N2 = ['fang', 'maw', 'hide', 'claw', 'tusk', 'eye', 'back', 'horn', 'tooth', 'skull', 'mane', 'heart'];
const BOUNTY_TIER = ['copper', 'iron', 'iron', 'steel', 'silver', 'mythril'];   // the reward's metal, by biome
const bountyWeek = () => Math.floor((dayIndex() - 1) / 7);
const BCACHE = {};
function bountyList() {
  const wk = bountyWeek(); if (BCACHE.wk === wk && BCACHE.seed === S.seed) return BCACHE.list;
  const m = MAPS.wilds, out = [];
  for (let i = 0; i < 3; i++) {
    const h = n => hsh(wk * 7 + i, n, 4431 + (S.seed || 0) % 997);
    const bi = Math.min(5, Math.floor(h(1) * 6)), [bio, foes] = BOUNTY_FOES[bi], k = foes[Math.floor(h(2) * foes.length)];
    if (!EN[k]) continue;
    const name = BOUNTY_N1[Math.floor(h(3) * BOUNTY_N1.length)] + BOUNTY_N2[Math.floor(h(4) * BOUNTY_N2.length)];
    let lair = null;
    if (m && m.bio) for (let t = 0; t < 400 && !lair; t++) { const x = 4 + Math.floor(h(10 + t) * (m.w - 8)), y = 4 + Math.floor(h(500 + t) * (m.h - 8));
      if (BIOMES[m.bio[y * m.w + x]] === bio && !solidAt(m, x * 16 + 8, y * 16 + 8) && !getO(m, x, y)) lair = [x, y]; }
    const lvl = (BIOME_EN[bio] ? BIOME_EN[bio].lvl : 0) + 4;
    out.push({ id: wk + ':' + i, k, bio, bi, name: name + ' the ' + EN[k].n, lair, lvl, gold: 300 + bi * 260 + Math.round(h(5) * 200) });
  }
  BCACHE.wk = wk; BCACHE.seed = S.seed; BCACHE.list = out; return out;
}
function bountyState() { const wk = bountyWeek(); if (!S.bounty || S.bounty.wk !== wk) S.bounty = { wk, take: {}, done: {}, paid: {} }; return S.bounty; }
const bountyTaken = () => { const B = bountyState(); return bountyList().filter(b => B.take[b.id] && !B.done[b.id] && b.lair); };
function bountyReward(b) {
  const tk = BOUNTY_TIER[b.bi] || 'iron', bases = Object.keys(IT).filter(id => IT[id].tier === tk && (IT[id].t === 'weapon' || IT[id].t === 'armor') && typeof forgeable === 'function' && forgeable(id));
  if (!bases.length) return null;
  const base = pickR(bases), q = Math.random() < .3 ? 3 : 2, tr = rollTraits(IT[base], QUAL[q].tr);
  const id = newForged(base, q, tr, false); if (id && S.forged) { S.forged[IT[id].forged].from = b.name; registerForged(IT[id].forged); } return id;
}
function renderBounties(b) {
  const B = bountyState(), L = bountyList();
  b.append(el('p', { class: 'note' }, 'Named beasts and outlaws are loose in the Hollow Vale. Take a bounty and an arrow at your feet points to its lair whenever you’re in the Wilds. Kill it, then come back for the reward: gold and a fine piece of gear. New bounties are posted every week.'));
  const list = el('div', { class: 'list' });
  for (const x of L) {
    const st = B.paid[x.id] ? 'Claimed' : B.done[x.id] ? 'Slain: claim your reward' : B.take[x.id] ? 'Taken: hunt it down' : 'Open';
    const row = el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, x.name), el('small', null, 'Level ' + x.lvl + ' elite · ' + BIONAME[x.bio] + ' · ' + x.gold + 'g and a Fine or better ' + (BOUNTY_TIER[x.bi] || 'iron') + ' piece · ' + st)));
    const acts = el('div', { class: 'acts' });
    if (!x.lair) acts.append(el('small', null, 'No lair found'));
    else if (B.done[x.id] && !B.paid[x.id]) acts.append(el('button', { class: 'btn', on: () => { B.paid[x.id] = 1; S.gold += x.gold; const id = bountyReward(x); if (id) give(id, 1, 0, true); SFX.lvl(); toast('Bounty paid: ' + x.gold + 'g' + (id ? ' and ' + IT[id].n : '') + '.', 'lvl'); if (S.realm && S.realm.rep) S.realm.rep.kingsbridge = (S.realm.rep.kingsbridge || 0) + 5; refresh(); } }, 'Claim'));
    else if (!B.take[x.id]) acts.append(el('button', { class: 'btn', on: () => { B.take[x.id] = 1; SFX.ok(); toast('Bounty taken: ' + x.name + '. Look for the arrow in the Wilds.'); refresh(); } }, 'Take'));
    else if (!B.done[x.id]) acts.append(el('button', { class: 'btn ghost', on: () => { delete B.take[x.id]; refresh(); } }, 'Drop'));
    row.append(acts); list.append(row);
  }
  b.append(list);
}
townMenu = (f => function (act, who) {
  const r = f.apply(this, arguments);
  if (act === 'kb_barracks' && MODAL && MODAL.tabs && !MODAL.tabs.some(t => t.id === 'bty')) { MODAL.tabs.push({ id: 'bty', label: 'Bounties', render: renderBounties }); drawModal(); }
  return r;
})(townMenu);
// the elite turns up at its lair when you come near
EVT.on('tick', () => {
  if (!S || !cur || cur.id !== 'wilds' || TITLE) return;
  for (const x of bountyTaken()) {
    const [lx, ly] = x.lair; if (Math.hypot(S.p.x / 16 - lx, S.p.y / 16 - ly) > 30) continue;
    if (cur.ents.some(e => e.bty === x.id && !e.dead)) continue;
    const e = spawnEnemy(cur, x.k, lx * 16 + 8, ly * 16 + 8, x.lvl); if (!e) continue;
    e.bty = x.id; e.elite = x.name; e.hp = e.mhp = Math.round(e.mhp * 8); e.atk = Math.round(e.atk * 1.6); e.hx = e.x; e.hy = e.y;
  }
});
killEnemy = (f => function (m, e) {
  const was = e && !e.dead && e.bty; const r = f.apply(this, arguments);
  if (was && e.dead) { const B = bountyState(); if (B.take[e.bty]) { B.done[e.bty] = 1; toast(e.elite + ' is slain! Claim the bounty at the Kingsbridge barracks.', 'lvl'); SFX.lvl(); } }
  return r;
})(killEnemy);
// an arrow to the lair, and the elite's ring and name
pcCursorDraw = (f => function (m) {
  const r = f.apply(this, arguments);
  try {
    if (!m || m.id !== 'wilds' || !S || TITLE) return r;
    for (const e of m.ents) if (e.elite && !e.dead) { const E = EN[e.k], rr = (E.r || 6) + 5, pulse = .5 + .5 * Math.sin(gameT * 4);
      g.save(); g.strokeStyle = 'rgba(240,176,48,' + (.5 + .4 * pulse) + ')'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(e.x, e.y, rr, rr * .45, 0, 0, Math.PI * 2); g.stroke();
      g.font = '600 7px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2; g.strokeStyle = '#2a1c18'; g.strokeText(e.elite, e.x, e.y - (E.r || 6) * 2 - 12); g.fillStyle = '#ffd060'; g.fillText(e.elite, e.x, e.y - (E.r || 6) * 2 - 12); g.restore(); }
    const T = bountyTaken(); if (!T.length) return r;
    let best = null, bd = Infinity; for (const x of T) { const d = Math.hypot(x.lair[0] * 16 + 8 - S.p.x, x.lair[1] * 16 + 8 - S.p.y); if (d < bd) { bd = d; best = x; } }
    if (!best || bd < 90) return r;
    const a = Math.atan2(best.lair[1] * 16 + 8 - S.p.y, best.lair[0] * 16 + 8 - S.p.x), cx = S.p.x + Math.cos(a) * 18, cy = S.p.y - 4 + Math.sin(a) * 12;
    g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = '#d04a2a'; g.beginPath(); g.moveTo(6, 0); g.lineTo(-4, -4); g.lineTo(-2, 0); g.lineTo(-4, 4); g.closePath(); g.fill(); g.restore();
    g.save(); g.font = '600 6px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2; g.strokeStyle = '#2a1c18'; const t = best.name + ' · ' + Math.round(bd / 16) + ' m';
    g.strokeText(t, cx, cy + 12); g.fillStyle = '#ff9a7a'; g.fillText(t, cx, cy + 12); g.restore();
  } catch (e) { console.error(e); }
  return r;
})(pcCursorDraw);
if (typeof HELP !== 'undefined') {
  HELP.bounty = ['Bounties', ['Three bounties are posted at the Kingsbridge barracks each week: named elites of the Hollow Vale’s creatures, each in its own lair.', 'Take one and an arrow at your feet points to the lair while you’re in the Wilds. Near the lair the elite appears: much tougher than usual, with a gold ring and its name over it.', 'Kill it, then claim the reward here: gold and a Fine or Masterwork weapon or armour piece with traits. Bounties not finished by the end of the week are taken down.']];
  helpKey = (f => function () { if (MODAL && MODAL.cur === 'bty') return 'bounty'; return f.apply(this, arguments); })(helpKey);
}
