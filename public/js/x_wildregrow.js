/* ================= The wild keeps changing: regrowth and roaming chests =================
   In the Wilds and every region (maps with m.wild, not the farm or village):
   - A felled tree's stump disappears after 5 nights and a new tree of that kind grows somewhere
     else in the same biome, on the same kind of ground. A dug-out stump does the same after 5 days.
   - A mined rock, boulder or ore vein comes back a day later somewhere else in the same biome.
   - The biome treasure chests (Wilds 'w0'-'w5', region caches '<region>_c<n>') restock a week after
     you open them, in a new random spot in their biome. Story and landmark chests stay put.
   New spots are never on roads or paths, in towns, next to warps or in sight of the player.
   Towns, roads, landmarks and everything else stay where they are. */

const ROAM_CHEST = id => /^w\d$/.test(id || '') || /_c\d+$/.test(id || '');
function wildSpot(m, x0, y0, w = 1, h = 1) {
  const bio = m.bio ? m.bio[y0 * m.w + x0] : null, t0 = getT(m, x0, y0);
  const ok = (x, y, sameGround) => {
    if (x < 3 || y < 3 || x + w > m.w - 3 || y + h > m.h - 3) return false;
    if (m.safe && dist(x, y, m.safe[0], m.safe[1]) < 18) return false;
    if (cur === m && Math.hypot(S.p.x / 16 - x, S.p.y / 16 - y) < 16) return false; // never pops up in view
    if (m.warps.some(wp => x >= wp.x - 3 && x <= wp.x + wp.w + 2 && y >= wp.y - 3 && y <= wp.y + wp.h + 2)) return false;
    for (let j = y; j < y + h + 1; j++) for (let i = x; i < x + w; i++) {
      const T = getT(m, i, j), D = TER[T]; if (!D || D.solid || D.water || D.lava || T === 'p' || T === 'd' && t0 !== 'd') return false;
      if (getO(m, i, j) || m.solidB[j * m.w + i]) return false;
      if (bio !== null && m.bio[j * m.w + i] !== bio) return false;
      if (sameGround && j < y + h && T !== t0) return false;
    }
    return true;
  };
  for (const same of [true, false]) for (let k = 0; k < 500; k++) { const x = 3 + Math.floor(Math.random() * (m.w - 6)), y = 3 + Math.floor(Math.random() * (m.h - 6)); if (ok(x, y, same)) return [x, y]; }
  return null;
}
function regrowElsewhere(m, x0, y0, o) {
  const D = OBJ[o.k] || {}, p = wildSpot(m, x0, y0, D.w || 1, D.h || 1); if (!p) return false;
  putObj(m, p[0], p[1], Object.assign({}, o)); if (m === cur) CHUNK.clear(); return true;
}

/* trees: the overnight stump check in endDay calls this for wild maps */
const _endDayW = endDay;
endDay = function (fainted) {
  for (const id of ['wilds', ...Object.keys(REGIONS)]) { // stumps that regrow tonight move instead (the old code would regrow them in place)
    const m = MAPS[id]; if (!m || !m.wild) continue;
    for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o || o.k !== 'stump' || o.regrow === undefined || o.regrow > 1) continue;
      const x = i % m.w, y = (i / m.w) | 0; setO(m, x, y, null); regrowElsewhere(m, x, y, { k: o.was || 'tree', kind: o.kind, snow: o.snow }); }
  }
  _endDayW(fainted); restockChests();
};

/* rocks, ores and dug-out stumps: S.respawn records from wild maps move */
const _respawnTickW = respawnTick;
respawnTick = function () {
  if (S.respawn && S.respawn.length) {
    const now = worldMin();
    S.respawn = S.respawn.filter(r => { const m = MAPS[r.map]; if (now < r.at || !m || !m.wild) return true; return !regrowElsewhere(m, r.x, r.y, r.o); });
  }
  _respawnTickW();
};

/* roaming chests */
const _openChestW = openChest;
openChest = function (m, x, y, o) {
  const fresh = !(o.opened || (o.id && S.flags['c_' + o.id]));
  _openChestW(m, x, y, o);
  if (fresh && m.wild && ROAM_CHEST(o.id)) (S.restock = S.restock || []).push({ map: m.id, id: o.id, tier: o.tier, x, y, at: worldMin() + 7 * 1440 });
};
function restockChests() {
  if (!S.restock || !S.restock.length) return;
  const now = worldMin();
  S.restock = S.restock.filter(r => {
    const m = MAPS[r.map]; if (now < r.at) return true; if (!m) return PERSIST.includes(r.map);
    const p = wildSpot(m, r.x, r.y); if (!p) return true;
    for (let i = 0; i < m.o.length; i++) if (m.o[i] && m.o[i].k === 'chest' && m.o[i].id === r.id) m.o[i] = null;
    delete S.flags['c_' + r.id]; setO(m, p[0], p[1], { k: 'chest', id: r.id, tier: r.tier });
    const poi = (m.poi || []).find(q => q.type === 'chest' && q.x === r.x && q.y === r.y); if (poi) { poi.x = p[0]; poi.y = p[1]; }
    return false;
  });
}
