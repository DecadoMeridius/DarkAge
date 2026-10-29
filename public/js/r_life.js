/* ================= Phase 6: village life =================
   SCHEDULES: villagers follow a daily routine (SCHED): morning stroll, working hours in
   their shop (inside, behind the counter), an evening at the tavern or the plaza, then
   home (out of sight). They walk between places on A* paths over the village grid.
   Shops only trade during opening hours (HOURS); outside them the door says when it opens.
   FESTIVALS: one per season (FEST). On the day the village is decorated, everyone
   gathers in the plaza from 9:00 and shops are shut. Blossom Day: an egg hunt; Lantern
   Night: release a lantern with a villager; Harvest Fair: enter your best crop for
   judging; Ember Feast: a gift exchange. Each gives gold, items or friendship.
   BIRTHDAYS: each villager has one (BDAY); a gift on the day is worth triple and the
   morning report reminds you. */

const SCHED = { // [from minute, place]; place: 'shop' (inside), 'home' (hidden) or [x, y] village tile
  mara: [[360, [9, 16]], [540, 'shop'], [1020, [21, 23]], [1260, 'home']],
  brann: [[360, [16, 15]], [540, 'shop'], [1080, [30, 12]], [1320, 'home']],
  pip: [[360, 'home'], [600, [31, 13]], [720, 'shop'], [1500, 'home']],
  odile: [[360, [38, 16]], [600, 'shop'], [1020, [34, 22]], [1260, 'home']],
  hale: [[360, [10, 26]], [540, 'shop'], [1020, [30, 13]], [1290, 'home']],
  elias: [[360, [38, 26]], [480, 'shop'], [1080, [22, 16]], [1230, 'home']],
};
const HOURS = { store: [540, 1020], smith: [540, 1080], tavern: [720, 1500], stablemaster: [600, 1020], carpenter: [540, 1020], museum: [480, 1080], landowner: [540, 1020], fisher: [480, 1140] };
const BDAY = { mara: [0, 8], brann: [1, 14], pip: [1, 22], odile: [2, 5], hale: [2, 19], elias: [3, 10], corwin: [3, 24] }; // [season, day]
const FEST = {
  0: { day: 13, n: 'Blossom Day', act: 'eggs', desc: 'An egg hunt in the village. Find as many painted eggs as you can before noon.' },
  1: { day: 11, n: 'Lantern Night', act: 'lantern', desc: 'At dusk the village releases paper lanterns over the pond. Talk to any villager to release one together.' },
  2: { day: 16, n: 'Harvest Fair', act: 'fair', desc: 'Bring your finest crop. The judges score quality and value; the best entries win prizes.' },
  3: { day: 25, n: 'Ember Feast', act: 'feast', desc: 'A winter feast and gift exchange. Give a gift to anyone today and they give one back.' },
};
const SEASON_DAY = () => [S.season, S.day];
const festToday = () => { const F = FEST[S.season]; return F && F.day === S.day ? F : null; };
const fmtHM = m => { const h = Math.floor(m / 60) % 24; return (h % 12 || 12) + (h < 12 ? ' am' : ' pm'); };

/* ---- schedules ---- */
function schedPlace(id) {
  if (festToday() && S.time >= 540 && S.time < 1320) return FEST_SPOTS[Object.keys(SCHED).indexOf(id) % FEST_SPOTS.length];
  const L = SCHED[id]; if (!L) return null; let p = L[L.length - 1][1];
  for (const [t, pl] of L) if (S.time >= t) p = pl;
  return S.time < L[0][0] ? 'home' : p;
}
const FEST_SPOTS = [[20, 17], [22, 23], [28, 23], [29, 17], [21, 20], [28, 20]];
function lifeTick() {
  const v = MAPS.village; if (!v) return;
  if (!v.allNpcs) v.allNpcs = v.npcs.slice();
  v.npcs = v.allNpcs.filter(n => { const p = schedPlace(n.id); return p === null || Array.isArray(p); });
  for (const n of v.npcs) {
    const p = schedPlace(n.id); if (!p) continue;
    const tx = p[0], ty = p[1], gx = (tx + .5) * 16, gy = (ty + .8) * 16;
    if (!n.placed) { n.x = gx; n.y = gy; n.hx = gx; n.hy = gy; n.placed = 1; continue; } // first sight of the day: already there
    if (dist(n.x, n.y, gx, gy) < 20) { n.path = null; n.hx = gx; n.hy = gy; continue; }
    if (!n.path || n.goal !== tx + ',' + ty) {
      const sx = Math.floor(n.x / 16), sy = Math.floor((n.y - 2) / 16), path = findPath(v, sx, sy, tx, ty, 4000);
      if (path) { n.path = path; n.pi = 1; n.goal = tx + ',' + ty; } else { n.x = gx; n.y = gy; n.hx = gx; n.hy = gy; }
    }
  }
}
function npcWalk(dt) {
  const v = MAPS.village; if (!v || !v.npcs) return;
  for (const n of v.npcs) {
    if (!n.path) continue; const node = n.path[n.pi]; if (!node) { n.path = null; n.walk = false; continue; }
    const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
    if (d < 2) { n.pi++; continue; }
    const sp = 22 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.walk = true;
    n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); n.hx = n.x; n.hy = n.y;
  }
}
// shopkeepers are only behind their counters during their working hours
const _genInteriorL = genInterior;
genInterior = function (act) {
  const m = _genInteriorL(act), R0 = ROOMS[act];
  if (R0 && R0.keeper && schedPlace(R0.keeper[0]) !== 'shop') { const [, x, y] = R0.keeper; setO(m, x, y, null); }
  return m;
};
const _doorActionLife = doorAction;
doorAction = function (act, who) {
  const H = HOURS[act];
  if (H && !who && (S.time < H[0] || S.time >= H[1] || (festToday() && act !== 'tavern'))) {
    if (festToday() && act !== 'tavern') { toast('Closed today for ' + festToday().n + '. Everyone is in the plaza!'); return; }
    if (ROOMS[act] && !(cur && cur.id === 'in_' + act)) return _doorActionLife(act, who); // you can still walk in
    toast('Closed. Open ' + fmtHM(H[0]) + ' to ' + fmtHM(H[1]) + '.'); return;
  }
  return _doorActionLife(act, who);
};

/* ---- festivals ---- */
function festSetup() {
  const F = festToday(), v = MAPS.village; if (!v) return;
  for (let i = 0; i < v.o.length; i++) if (v.o[i] && v.o[i].fest) v.o[i] = null; // the village is saved, so clear by flag
  v.festDeco = [];
  if (!F) return;
  const put = (x, y, o) => { if (inb(v, x, y) && !getO(v, x, y) && !TER[getT(v, x, y)].solid && !TER[getT(v, x, y)].water && !v.solidB[y * v.w + x]) { setO(v, x, y, Object.assign({ fest: 1, fixed: 1 }, o)); v.festDeco.push([x, y]); return true; } return false; };
  for (const [x, y] of [[17, 15], [33, 15], [17, 25], [33, 25], [22, 15], [28, 25]]) put(x, y, { k: 'lantern' });
  for (let x = 18; x <= 32; x += 3) put(x, 14, { k: 'flower', v: (x / 3) % 5 });
  S.fest = S.fest || {}; const key = S.year + '-' + S.season;
  if (F.act === 'eggs' && !S.fest[key]) { let n = 0; const r = rng(S.seed + S.year * 3); for (let tries = 0; tries < 400 && n < 14; tries++) { const x = 4 + Math.floor(r() * 42), y = 4 + Math.floor(r() * 30); if (put(x, y, { k: 'fg', item: 'egg', fegg: 1 })) n++; } }
}
const festState = () => { const key = S.year + '-' + S.season; S.fest = S.fest || {}; return S.fest[key] = S.fest[key] || {}; };
function festPrize(F) {
  const st = festState(); if (st.done) { toast('You already took part in ' + F.n + ' this year.'); return; }
  if (F.act === 'eggs') { const n = st.eggs || 0; if (S.time < 720) { toast('Eggs found: ' + n + '. Keep looking until noon!'); return; } st.done = 1; const g = n * 120; give('$', g); if (n >= 8) give('golden_egg' in IT ? 'golden_egg' : 'egg', 1); toast('You found ' + n + ' eggs! Prize: ' + g + 'g' + (n >= 8 ? ' and a special egg.' : '.'), 'lvl'); return; }
  if (F.act === 'fair') {
    const best = sortedInv().filter(k => IT[parseK(k)[0]] && ['crop', 'fruit', 'forage', 'artisan', 'fish'].includes(IT[parseK(k)[0]].t)).sort((a, b) => valK(b) - valK(a))[0];
    if (!best) { toast('You need a crop, fish or artisan good to enter.', 'bad'); return; }
    const [id, q] = parseK(best), score = Math.round(valK(best) / 10 + q * 25); takeK(best, 1); st.done = 1;
    const place = score > 90 ? 1 : score > 45 ? 2 : 3, prize = [0, 3000, 1500, 600][place];
    S.gold += prize; toast('Your ' + (q ? QNAME[q] + ' ' : '') + IT[id].n + ' scored ' + score + '. ' + ['', 'First prize!', 'Second prize!', 'Third prize.'][place] + ' +' + prize + 'g', 'lvl'); SFX.lvl(); return;
  }
  if (F.act === 'lantern') { if (S.time < 1080) { toast('The lanterns go up at dusk (6 pm).'); return; } st.done = 1; for (const id in SCHED) addFriend(id, 40); for (let i = 0; i < 40; i++) PARTS.push({ x: S.p.x + (Math.random() - .5) * 60, y: S.p.y - 20, vx: (Math.random() - .5) * 20, vy: -40 - Math.random() * 60, t: 3, c: pickR(['#ffd25a', '#ff9a3a', '#fff4c0']) }); toast('The lanterns drift over the pond. Everyone feels a little closer. (+friendship with all)', 'lvl'); return; }
  if (F.act === 'feast') { toast('Give anyone a gift today and they will give one back.'); return; }
}
// talking to a villager during a festival explains it / hands out the prize
const _talkNPCL = talkNPC;
talkNPC = function (id) { const F = festToday(); if (F && cur.id === 'village' && S.time >= 540) { openModal(F.n, [{ id: 'f', label: F.n, render: b => { greet(b, id); b.append(el('p', { class: 'note' }, F.desc)); if (F.act !== 'feast') b.append(el('button', { class: 'btn big', on: () => { closeModal(); festPrize(F); } }, F.act === 'eggs' ? 'Hand in eggs' : F.act === 'fair' ? 'Enter my best item' : 'Release a lantern')); } }]); return; } _talkNPCL(id); };
const _objInteractLife = objInteract;
objInteract = function (m, x, y, o) {
  const H = o.act && HOURS[o.act]; if (H && (S.time < H[0] || S.time >= H[1])) return { label: 'Closed', fn: () => toast('Closed. Open ' + fmtHM(H[0]) + ' to ' + fmtHM(H[1]) + '.') }; // counters keep shop hours too
  if (o.fegg) return { label: 'Pick up', fn: () => { setO(m, x, y, null); const st = festState(); st.eggs = (st.eggs || 0) + 1; SFX.pop(); floatText(S.p.x, S.p.y - 26, 'Egg ' + st.eggs + '!', '#ffd040'); } }; return _objInteractLife(m, x, y, o); };
const _giftToL = giftTo;
giftTo = function (id, item) {
  const F = festToday(), bd = BDAY[id] && BDAY[id][0] === S.season && BDAY[id][1] === S.day, before = fr(id).pts, ok = _giftToL(id, item);
  if (ok && bd) { const gain = fr(id).pts - before; addFriend(id, gain * 2); toast('It\'s ' + NPCS[id].n + '\'s birthday — they\'re delighted!', 'lvl'); }
  if (ok && F && F.act === 'feast') { const back = pickR(['bread', 'trout', 'apple', 'honey', 'cloth', 'topaz'].filter(i => IT[i])); give(back, 1); toast(NPCS[id].n + ' gives you ' + IT[back].n.toLowerCase() + ' in return.'); }
  return ok;
};

/* ---- day start: festival set-up, birthday reminders ---- */
function lifeMorning() {
  const v = MAPS.village; if (v && v.allNpcs) v.allNpcs.forEach(n => { n.placed = 0; n.path = null; });
  festSetup();
  const F = festToday(); if (F) toast('Today is ' + F.n + '! ' + F.desc, 'lvl');
  else { const nf = FEST[S.season]; if (nf && nf.day > S.day && nf.day - S.day <= 3) toast(nf.n + ' is in ' + (nf.day - S.day) + ' day' + (nf.day - S.day > 1 ? 's' : '') + '.'); }
  for (const id in BDAY) if (BDAY[id][0] === S.season && BDAY[id][1] === S.day) toast('It\'s ' + NPCS[id].n + '\'s birthday today.', 'lvl');
}
const _endDayLife = endDay;
endDay = function (f) { _endDayLife(f); try { lifeMorning(); } catch (e) { console.error(e); } };
const _startGameLife = startGame;
startGame = function (isNew) { _startGameLife(isNew); try { lifeMorning(); } catch (e) { console.error(e); } };

EVT.on('tick', n => { if (!S || PAUSED) return; if (n % 5 === 0 || (MAPS.village && !MAPS.village.allNpcs)) lifeTick(); });
const _updateLife = update;
update = function (dt) { if (!PAUSED && !TITLE && S && cur && cur.id === 'village') npcWalk(dt); _updateLife(dt); };

/* the friends tab shows birthdays and the next festival */
const _renderFriendsL = renderFriends;
renderFriends = function (b) {
  const nf = FEST[S.season], txt = nf ? (nf.day === S.day ? 'Today: ' + nf.n + '!' : nf.day > S.day ? nf.n + ' on ' + SEASONS[S.season] + ' ' + nf.day + '.' : 'Next: ' + FEST[(S.season + 1) % 4].n + ' on ' + SEASONS[(S.season + 1) % 4] + ' ' + FEST[(S.season + 1) % 4].day + '.') : '';
  b.append(el('p', { class: 'note' }, txt + ' Birthdays: ' + Object.entries(BDAY).map(([id, [s, d]]) => NPCS[id].n + ' ' + SEASONS[s] + ' ' + d).join(', ') + '.'));
  _renderFriendsL(b);
};
