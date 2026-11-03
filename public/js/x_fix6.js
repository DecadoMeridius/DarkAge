/* Fixes from the overnight playtest (docs/playtest/overnight/SUMMARY.md, 2026-11-03). */

/* ---- enemies stuck on cliffs: a boss charging onto a cliff tile couldn't be reached, its leash couldn't
   walk it home, and it healed for ever while its fire still hit you (Ash Colossus, Cinder Drake) ---- */
updateEnemies = (f => function (m, dt) {
  const r = f.apply(this, arguments);
  for (const e of m.ents) {
    if (e.type !== 'enemy' || e.dead) continue;
    const tx = Math.floor(e.x / 16), ty = Math.floor((e.y - 2) / 16), t = inb(m, tx, ty) && TER[getT(m, tx, ty)];
    // standing on solid ground (a cliff) for half a second: put it on the nearest open tile
    if (t && t.solid) { e._solidT = (e._solidT || 0) + dt; if (e._solidT > .5) { const o = openTileNear(m, tx, ty); if (o) { e.x = (o[0] + .5) * 16; e.y = (o[1] + .8) * 16; } e._solidT = 0; } }
    else e._solidT = 0;
    // walking home on its leash but getting no closer for 2 s: it's caught on something, so it goes home at once
    if (e.leash && e.home) {
      const hd = Math.hypot(e.home[0] - e.x, e.home[1] - e.y);
      if (hd > 8 && e._lhd !== undefined && hd > e._lhd - .5) { e._lstuck = (e._lstuck || 0) + dt; if (e._lstuck > 2) { e.x = e.home[0]; e.y = e.home[1]; e._lstuck = 0; } }
      else e._lstuck = 0;
      e._lhd = hd;
    } else e._lhd = undefined;
  }
  return r;
})(updateEnemies);

/* ---- the siege's Warlord doesn't start his weekly timer: chapter 10 then asks you to beat him at his camp,
   and he was away for a week ---- */
killEnemy = (f => function (m, e) {
  const prev = S && S.bossDay ? S.bossDay[e.k] : undefined, siege = e && e.siege;
  const r = f.apply(this, arguments);
  if (siege && S.bossDay) { if (prev === undefined) delete S.bossDay[e.k]; else S.bossDay[e.k] = prev; }
  return r;
})(killEnemy);

/* ---- Enter and Space ----
   Enter presses "Start the day" on the morning report (its lines are a .list, so the general Enter rule
   skipped it), and a button you clicked earlier (the sandbox's Next day) no longer takes Enter or Space. */
addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
  const a = document.activeElement;
  if (a && a.tagName === 'BUTTON' && !a.closest('#modal') && !a.closest('.storybox')) a.blur();   // focus left on a HUD button
  if (e.key === 'Enter' && MODAL && !(typeof DIALOG !== 'undefined' && DIALOG)) {
    const start = [...document.querySelectorAll('#modal .btn.big')].find(b => b.textContent === 'Start the day');
    if (start) { e.preventDefault(); e.stopImmediatePropagation(); start.click(); }
  }
}, true);
// Space only uses your tool in the world: not right after a window or dialogue closes (it placed a fence
// and swung the hoe when it closed a dialogue)
let KEY_GAP = 0;
closeModal = (f => function () { KEY_GAP = performance.now() + 350; if (typeof KEYPOP !== 'undefined') KEYPOP = 0; return f.apply(this, arguments); })(closeModal);
storyDialog = (f => function (lines, opts = {}) {
  const done = opts.done; opts = Object.assign({}, opts, { done: done ? () => { KEY_GAP = performance.now() + 350; done(); } : null });
  const r = f.call(this, lines, opts);
  // closing without a done callback still leaves a gap
  const d = DIALOG; if (d) { const c = d.close; d.close = q => { KEY_GAP = performance.now() + 350; return c(q); }; }
  return r;
})(storyDialog);
addEventListener('keydown', e => {
  if (e.key !== ' ' || e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (typeof DIALOG !== 'undefined' && DIALOG) return;   // the dialogue reads Space itself
  if (performance.now() < KEY_GAP || (PAUSED && !MODAL)) { e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
// Esc on the key bindings popup closes just the popup
addEventListener('keydown', e => {
  if (e.key !== 'Escape' || typeof KEYPOP === 'undefined' || !KEYPOP || (typeof REBIND !== 'undefined' && REBIND)) return;
  e.preventDefault(); e.stopImmediatePropagation(); KEYPOP = 0; if (MODAL) refresh();
}, true);

/* ---- closing the window saves (up to 5 minutes since the last autosave were lost) ---- */
{
  let last = -1e9;
  const saveOnClose = () => {
    if (!S || TITLE || (typeof SANDBOX !== 'undefined' && SANDBOX) || performance.now() - last < 1000) return;
    if (MODAL && MODAL.title === 'Who are you?') return;   // not before the character creator is done
    try { saveGame(); last = performance.now(); } catch (err) {}
  };
  addEventListener('pagehide', saveOnClose);
  addEventListener('beforeunload', saveOnClose);
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveOnClose(); });   // alt-tab or minimise
}

/* ---- automation clicks ----
   - holding a placeable piece and aiming at an empty tile places it (it used to upgrade or turn the belt you stood on);
   - the pickaxe aimed at one of your placed machines, crates or belts picks it up (it opened its window). */
act = (f => function () {
  if (PAUSED || fishing || !S || !cur) return f.apply(this, arguments);
  const k = selKind(), m = cur, [tx, ty] = faceTile(), [, , o] = mainOf(m, tx, ty);
  if (IT[k] && IT[k].t === 'place' && !o) { useTool(); return; }
  if ((k === 'pick' || k === 'multi') && o && OBJ[o.k] && OBJ[o.k].place && !o.fixed) { useTool(); return; }
  if (k === 'scythe') { useTool(); return; }   // after walking to a crop, the scythe cuts (it found the crop's "use your scythe" hint instead)
  return f.apply(this, arguments);
})(act);

/* ---- the building hammer moves and removes wells too (a finished well is an object, not a building) ---- */
findInteract = (f => function () {
  if (S && cur && cur.farm && typeof hammerIn === 'function' && hammerIn() && !PLACING) {
    const [tx, ty] = faceTile(), [ax, ay, o] = mainOf(cur, tx, ty);
    if (o && o.k === 'fwell') {
      const s = (S.structures || []).find(s => s.k === 'well' && s.stage >= 4 && ax >= s.x && ax < s.x + BP.well.w && ay === s.y + BP.well.h - 1);
      if (s) return { label: 'Move or remove', fn: () => hammerMenu({ x: s.x, y: s.y, w: BP.well.w, h: BP.well.h, struct: s }) };
    }
  }
  return f();
})(findInteract);

/* ---- goMap without a position (console and some story jumps) put the player and the camera at NaN for good ---- */
goMap = (f => function (id, x, y, dir) {
  const r = f.apply(this, arguments);
  if (S && cur && !(isFinite(S.p.x) && isFinite(S.p.y))) {
    const st = cur.start || { x: cur.w * 8, y: cur.h * 8 }, o = openTileNear(cur, Math.floor(st.x / 16), Math.floor(st.y / 16));
    S.p.x = o ? (o[0] + .5) * 16 : st.x; S.p.y = o ? (o[1] + .8) * 16 : st.y;
  }
  if (!(isFinite(camX) && isFinite(camY))) { camX = S.p.x; camY = S.p.y; }
  return r;
})(goMap);

/* ---- towns without a town hall (Ashford, Saltmere) post their jobs at the inn: their jobs couldn't be taken ---- */
townMenu = (f => function (act, who) {
  const r = f.apply(this, arguments);
  const T = TOWN_ACTS[act]; if (!T || actType(act) !== 'inn' || !MODAL || !MODAL.tabs) return r;
  const hasHall = Object.keys(TOWN_ACTS).some(a => TOWN_ACTS[a].town === T.town && actType(a) === 'hall');
  if (!hasHall && !MODAL.tabs.some(t => t.id === 'jobs')) { MODAL.tabs.push({ id: 'jobs', label: 'Job board', render: b => renderJobs(b, T.town) }); drawModal(); }
  return r;
})(townMenu);

/* ---- a belt whose item the next machine won't take shows it: a red "!" over it, and interacting takes the
   stuck item off (belts used to jam silently; s_auto.js counts o.jam) ---- */
const beltJammed = o => o && isBelt(o) && o.item && (o.jam || 0) >= 4;
objInteract = (f => function (m, x, y, o) {
  if (beltJammed(o)) return { label: 'Take the stuck ' + IT[parseK(o.item)[0]].n, fn: () => { const [id, q] = parseK(o.item); give(id, 1, q); o.item = null; o.jam = 0; SFX.pop(); } };
  return f.apply(this, arguments);
})(objInteract);
pcCursorDraw = (f => function (m) {
  const r = f.apply(this, arguments);
  if (!m || !m.farm || !S || TITLE) return r;
  const x0 = Math.max(0, Math.floor(camX / 16) - 2), x1 = Math.min(m.w, x0 + 64), y0 = Math.max(0, Math.floor(camY / 16) - 2), y1 = Math.min(m.h, y0 + 44);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const o = m.o[y * m.w + x]; if (!beltJammed(o)) continue;
    const X = x * 16 + 8, Y = y * 16 - 3 + Math.sin(gameT * 5) * 1.5;
    g.fillStyle = '#7a1a10'; g.fillRect(X - 3, Y - 7, 6, 9); g.fillStyle = '#ff5a3a'; g.fillRect(X - 2, Y - 6, 4, 7); g.fillStyle = '#fff4e0'; g.fillRect(X - .5, Y - 5, 1, 3.5); g.fillRect(X - .5, Y - .5, 1, 1);
  }
  return r;
})(pcCursorDraw);

/* ---- festivals and birthdays are in the morning report (they were only toasts, hidden behind it) ---- */
showDayReport = (f => function (lines) {
  try {
    const add = [], F = typeof festToday === 'function' && festToday();
    if (F) add.push(['star', 'Today is ' + F.n + '! ' + F.desc]);
    else { const nf = FEST[S.season]; if (nf && nf.day > S.day && nf.day - S.day <= 3) add.push(['star', nf.n + ' is in ' + (nf.day - S.day) + ' day' + (nf.day - S.day > 1 ? 's' : '') + '.']); }
    for (const id in BDAY) if (BDAY[id][0] === S.season && BDAY[id][1] === S.day && NPCS[id]) add.push(['star', 'It\'s ' + NPCS[id].n + '\'s birthday today. A gift counts triple.']);
    if (Array.isArray(lines) && add.length) lines = add.concat(lines);
  } catch (e) { console.error(e); }
  return f.call(this, lines);
})(showDayReport);

/* ---- Odile's: a horse costs thousands, and when one is bought the next row slides up under the cursor, so a double
   click bought a second one. Expensive animals ask for a second click, and buttons rest briefly after a purchase. ---- */
{
  let rest = 0, armed = null;
  addEventListener('click', e => {
    if (!MODAL || MODAL.title !== 'Odile\'s Stables') return;
    const btn = e.target.closest && e.target.closest('#modal .rrow .btn, #modal .acts .btn'); if (!btn || !/^Buy/.test(btn.textContent)) return;
    if (performance.now() < rest) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    const row = btn.closest('.rrow') || btn.parentElement, m = (row.textContent.match(/([\d,]{4,})g/) || [])[1], price = m ? +m.replace(/,/g, '') : 0;
    if (price >= 1000 && armed !== btn) { e.stopImmediatePropagation(); e.preventDefault(); armed = btn; btn.classList.add('warn'); toast('Click Buy again to pay ' + price.toLocaleString() + 'g.'); setTimeout(() => { if (armed === btn) { armed = null; btn.classList.remove('warn'); } }, 3000); return; }
    armed = null; rest = performance.now() + 700;
  }, true);
}

/* ---- search boxes in station windows start empty each time the window opens (they kept the last search) ---- */
openModal = (f => function () { const r = f.apply(this, arguments); if (MODAL && MODAL.opts && MODAL.opts.rq) { delete MODAL.opts.rq; drawModal(); } return r; })(openModal);

/* ---- a foe "near" for weapon clicks: within r px and with open ground between you (not across a pond, a wall
   or a cliff). A goblin across a lake turned every click into air swings for over a minute. ---- */
function lineClear(m, x0, y0, x1, y1) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6);
  for (let i = 1; i < n; i++) { const tx = Math.floor((x0 + (x1 - x0) * i / n) / 16), ty = Math.floor((y0 + (y1 - y0) * i / n - 2) / 16); if (!inb(m, tx, ty)) return false; const t = TER[getT(m, tx, ty)]; if (t.solid || t.water || m.solidB[ty * m.w + tx]) return false; }
  return true;
}
function foeNear(r) { return !!(cur && cur.ents.some(e => e.type === 'enemy' && !e.dead && Math.hypot(e.x - S.p.x, e.y - S.p.y) < r && lineClear(cur, S.p.x, S.p.y, e.x, e.y))); }

/* ---- E: when nothing is where the mouse points, E tries the tile you're facing (you walked up to a counter or a
   ladder and E missed it because the mouse was elsewhere) ---- */
addEventListener('keydown', e => {
  if ((e.key !== 'e' && e.key !== 'E') || e.repeat || !S || TITLE || MODAL || PAUSED || fishing || (typeof DIALOG !== 'undefined' && DIALOG)) return;
  if (e.target && /input|textarea/i.test(e.target.tagName)) return;
  if (findInteract()) return;   // the usual way works
  const d = S.p.dir | 0, px = Math.floor(S.p.x / 16), py = Math.floor((S.p.y - 2) / 16), ft = faceTile;
  faceTile = () => [px + DIRV[d][0], py + DIRV[d][1]];
  let it = null; try { it = findInteract(); } finally { faceTile = ft; }
  if (it) { e.preventDefault(); e.stopImmediatePropagation(); it.fn(); }
}, true);

/* ---- food in hand: a left click eats it, whatever is under the cursor (mid-fight it hit the target, a rock or a knight) ---- */
primaryUse = (f => function () {
  if (!PAUSED && !TITLE && !fishing && S && !(typeof PLACING !== 'undefined' && PLACING)) {
    const k = selKind(); if (k && IT[k] && IT[k].eat && has(k)) { if (!(pl.cd > 0)) { pl.cd = .28; eat(k); } return; }
  }
  return f.apply(this, arguments);
})(primaryUse);

/* ---- a full backpack is shown on screen while it lasts (one toast was easy to miss, and drops piled up unseen) ---- */
{
  const tag = el('div', { id: 'bagfull' }, 'Backpack full');
  tag.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);padding:2px 10px;border-radius:4px;background:#7a1a10;color:#fff4e0;font:600 13px Fredoka,sans-serif;z-index:30;pointer-events:none;display:none';
  document.body.append(tag);
  hudTick = (f => function (dt) {
    const r = f.apply(this, arguments);
    const full = !!(S && !TITLE && S.pack && !S.pack.includes(null)); tag.style.display = full && !MODAL ? 'block' : 'none';
    return r;
  })(hudTick);
}

/* ---- the test sandbox doesn't hand out milestone quest gold (it showed 55,500g more than it started with) ---- */
checkQuests = (f => function () { if (typeof SANDBOX !== 'undefined' && SANDBOX) return; return f.apply(this, arguments); })(checkQuests);

/* ---- the combat test stays a clean arena: no knight patrols or bandits joining, the clock stays at morning, and the
   backpack starts with room (it began at 26/28 and was full after one boss; anything but gear, food and arrows goes to the bank) ---- */
startCombatTest = (f => function () {
  const r = f.apply(this, arguments);
  try {
    const keep = it => it && (['weapon', 'armor', 'food', 'ring', 'tool', 'ammo'].includes(it.t) || /arrow/.test(it.id) || it.eat);
    for (let i = 0; i < S.pack.length; i++) { const s = S.pack[i]; if (s && !keep(IT[parseK(s.k)[0]])) deposit(i, s.n); }
  } catch (e) { console.error(e); }
  return r;
})(startCombatTest);
alliesFrame = (f => function (dt) { if (window.COMBAT_TEST) { PATROL_T = 999; PATROLS.forEach(P => P.members.forEach(a => a.gone = true)); } return f.apply(this, arguments); })(alliesFrame);
EVT.on('tick', () => { if (window.COMBAT_TEST && S && S.time > 600) S.time = 600; });
if (typeof banditsFrame === 'function') banditsFrame = (f => function (dt) { if (window.COMBAT_TEST) return; return f.apply(this, arguments); })(banditsFrame);

/* ---- an empty hotbar slot and a click on a tree, rock, ore, grass or ripe crop: the matching tool is picked first
   (the auto tool sat under the "an empty slot only walks" rule, so nothing was gathered) ---- */
primaryUse = (f => function () {
  if (!PAUSED && !TITLE && !fishing && S && cur && !selKind() && !(typeof PLACING !== 'undefined' && PLACING) && typeof toolFor === 'function') {
    const [tx, ty] = clickTarget(), want = toolFor(cur, tx, ty);
    if (want) { const slot = S.hot.indexOf('multi') >= 0 ? S.hot.indexOf('multi') : S.hot.indexOf(want); if (slot >= 0) { S.sel = slot; hudKey = ''; } }
  }
  return f.apply(this, arguments);
})(primaryUse);

/* ---- arriving in a town by waystone shows the town's name, not "The Wilds" ---- */
showBanner = (f => function (txt) {
  if (txt === 'The Wilds' && cur && cur.id === 'wilds' && typeof townAt === 'function') { const T = townAt(cur, S.p.x / 16, S.p.y / 16, 1); if (T && T.n) { txt = T.n + ' · ' + T.kind; if (typeof LAST_TOWN !== 'undefined') LAST_TOWN = T; } }
  return f.call(this, txt);
})(showBanner);

/* ---- melee skills (asked 2026-11-03: melee felt weak next to bow and staff, and needed more area skills) ----
   In action combat Cleave, Lunge and Rend used the old tick-combat code: they rolled to hit, Lunge and Rend needed a
   clicked target (action mode has no auto-target), and Cleave only reached what stood in weapon range. Now:
   - Cleave hits everything around you (1.5x, knocked back);
   - Lunge dashes toward the mouse (up to 5 tiles), cutting everything on the way (2x, staggers);
   - Rend cuts a wide arc in front of you and every enemy it hits bleeds.
   Whirlwind and Blade Dash hit harder again, and the Blade tree gets two area skills: Earthshatter (level 10:
   three rings of quakes spreading out from you, stunning) and Cyclone (level 30: you spin as you move for 3 s,
   pulling enemies in). Classic combat keeps the old abilities. */
{
  const act = () => typeof ACTION === 'function' && ACTION();
  // the coloured motes and the weapon swing that x_fix5 adds round every skill (SKILL_FX, MELEE_ANIM)
  const fx = (id, from, aim) => {
    const cols = (typeof SKILL_FX !== 'undefined' && SKILL_FX[id]) || ['#ffe8a0', '#e8c060', '#ffffff'];
    if (typeof motes === 'function') { SKILL_COL = cols; SKILL_COL_T = gameT + 1.2; motes(S.p.x, S.p.y - 14, cols, 18, 90); }
    if (typeof MELEE_ANIM !== 'undefined' && MELEE_ANIM[id] && typeof meleeIcon === 'function' && meleeIcon()) MELEE_ANIM[id](cols, id === 'lunge' ? Math.atan2(S.p.y - from[1], S.p.x - from[0]) : aim, from);
  };
  const wrapA = (id, fn) => { const old = ABIL[id] && ABIL[id].fn; if (!old) return;
    ABIL[id].fn = function () { if (!act()) return old.apply(this, arguments); const from = [S.p.x, S.p.y], aim = aimAngle(), ok = fn.call(this); if (ok !== false) fx(id, from, aim); return ok; }; };
  wrapA('cleave', () => {
    let n = 0; for (const e of enemiesNear(S.p.x, S.p.y - 6, 38)) { actionHit(e, 1.5, Math.atan2(e.y - S.p.y, e.x - S.p.x), 160); n++; }
    ring(S.p.x, S.p.y - 4, 40, '#ffd890', .35, 3); burst(S.p.x, S.p.y - 6, 14, '#ffe8b0', 120); SFX.swing(); if (typeof swingAnim === 'function') swingAnim();
    return true;
  });
  wrapA('lunge', () => {
    const a = aimAngle(), x0 = S.p.x, y0 = S.p.y, hit = new Set();
    for (let s = 0; s < 16; s++) { moveEnt(cur, S.p, Math.cos(a) * 5, Math.sin(a) * 5, 5); for (const e of enemiesNear(S.p.x, S.p.y - 6, 16)) if (!hit.has(e)) { hit.add(e); actionHit(e, 2, a, 150, { stagger: 1 }); } }
    pl.inv = Math.max(pl.inv || 0, .25); burst(S.p.x, S.p.y - 8, 10, '#ffe8a0', 100); SFX.swing();
    vfx(k => { g.strokeStyle = 'rgba(255,232,160,' + (1 - k) * .8 + ')'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0 - 10); g.lineTo(S.p.x, S.p.y - 10); g.stroke(); }, .3);
    return true;
  });
  wrapA('rend', () => {
    const a = aimAngle(); let n = 0;
    for (const e of enemiesNear(S.p.x, S.p.y - 6, 46)) if (angDiff(Math.atan2(e.y - S.p.y, e.x - S.p.x), a) < 1.2) { actionHit(e, 1.2, a, 90); e.bleed = Math.max(e.bleed || 0, 6); n++; }
    burst(S.p.x + Math.cos(a) * 20, S.p.y - 6 + Math.sin(a) * 20, 12, '#ff5a4a', 110); SFX.swing(); if (typeof swingAnim === 'function') swingAnim();
    vfx(k => { g.strokeStyle = 'rgba(255,90,74,' + (1 - k) + ')'; g.lineWidth = 3; g.beginPath(); g.arc(S.p.x, S.p.y - 6, 30, a - 1.1, a + 1.1); g.stroke(); }, .3);
    return true;
  });
  for (const id of ['cleave', 'lunge', 'rend']) if (ABIL[id]) ABIL[id].desc = {
    cleave: 'Hit every enemy around you for 1.5x your damage and knock them back.',
    lunge: 'Dash toward the mouse, cutting everything on the way for 2x your damage.',
    rend: 'Cut a wide arc in front of you: everything hit bleeds.' }[id] + ' (Classic combat: the old version.)';
  SKILL_MULT.whirlwind = 1; SKILL_MULT.bladedash = 1.25;

  const NEWB = [
    ['earthshatter', 'blade', 10, 'Earthshatter', 35, 9, 'Three rings of quakes spread out from you, each hitting and briefly stunning everything they cross.', () => {
      SHAKE = .35; SFX.boom && SFX.boom();
      for (let i = 0; i < 3; i++) after(i * .22, () => { const r = 26 + i * 18, x = S.p.x, y = S.p.y - 4; hitArea(x, y, r, .8 * rankK('earthshatter'), 90, { freeze: .5 }); ring(x, y, r + 6, '#c8a070', .35, 4); burst(x, y, 10, '#a89880', 90 + i * 30); });
      return true; }],
    ['cyclone', 'blade', 30, 'Cyclone', 45, 14, 'Spin as you move for 3 seconds: enemies near you are pulled in and cut again and again.', () => {
      let acc = 0;
      vfx(k => { g.save(); g.translate(S.p.x, S.p.y - 6); g.rotate(gameT * 16); g.strokeStyle = 'rgba(255,232,160,.7)'; g.lineWidth = 2; for (let a = 0; a < 4; a++) { g.beginPath(); g.arc(0, 0, 30, a * 1.57, a * 1.57 + .9); g.stroke(); } g.restore(); }, 3, { tick: dt => {
        acc += dt;
        for (const e of enemiesNear(S.p.x, S.p.y - 6, 70)) { const d = Math.hypot(e.x - S.p.x, e.y - S.p.y) || 1; if (d > 18 && !(EN[e.k] && EN[e.k].boss)) moveEnt(cur, e, (S.p.x - e.x) / d * 40 * dt, (S.p.y - e.y) / d * 40 * dt, EN[e.k].r || 6); }
        if (acc >= .3) { acc = 0; hitArea(S.p.x, S.p.y - 6, 34, .45 * rankK('cyclone'), 40); }
      } });
      return true; }],
  ];
  for (const s of NEWB) {
    const [id, tree, lvl, n, cost, cd, desc, fn] = s;
    const at = CSKILLS.findIndex(x => x[1] === tree && x[2] > lvl); CSKILLS.splice(at < 0 ? CSKILLS.length : at, 0, s); CSKI[id] = s;
    ABIL[id] = { n, cost, cd, desc, tree, fn() { const T = CTREES[tree]; if (!T.need(PS.wt)) { toast(n + ' needs ' + T.needN + '.', 'bad'); return false; } LAST_FIGHT = gameT; const from = [S.p.x, S.p.y], aim = aimAngle(), ok = fn() !== false; if (ok) fx(id, from, aim); return ok; } };
    if (typeof SKILL_FX !== 'undefined') SKILL_FX[id] = id === 'earthshatter' ? ['#c8a070', '#8a6040', '#ffd890'] : ['#ffe8a0', '#ff9a3a', '#ffffff'];
  }
}

/* ---- the Defence level counts in action combat: damage taken falls 0.4% per level (40% at 99). Only armour
   counted before, so training Defence from 15 to 50 changed nothing (overnight playtest) ---- */
hurtPlayer = (f => function (dmg, sx, sy, elem) {
  if (typeof ACTION === 'function' && ACTION() && typeof clv === 'function' && dmg > 0) dmg *= 1 - Math.min(.4, clv('defence') * .004);
  return f.call(this, dmg, sx, sy, elem);
})(hurtPlayer);

/* ---- a locked window (the Farewell) hides its close button, which did nothing ---- */
drawModal = (f => function () { const r = f.apply(this, arguments); const c = document.getElementById('mclose'); if (c && MODAL && MODAL.lock) c.style.visibility = 'hidden'; return r; })(drawModal);

/* ---- the Family tab lists only people you could court now (the same age rule as their greeting: the original five
   within 15 years of you, suitors within 8) ---- */
function courtOk(id) {
  const R = ROMANCE[id]; if (!R || typeof candAge !== 'function') return true;
  if (Math.abs(candAge(id) - myAge()) > (R.suitor ? 8 : 15)) return false;
  return !(typeof candSex === 'function' && candSex(id) && typeof wantsSex === 'function' && candSex(id) !== wantsSex());
}

/* ---- someone standing right on top of you can be talked to (Isolde stood on the player and E found nothing) ---- */
findInteract = (f => function () {
  const r = f.apply(this, arguments); if (r || !cur || !S) return r;
  let best = null, bd = 14; for (const n of cur.npcs || []) { const d = Math.hypot(n.x - S.p.x, n.y - S.p.y); if (d < bd) { bd = d; best = n; } }
  return best ? { label: 'Talk', fn: () => talkNPC(best.id) } : r;
})(findInteract);

/* ---- region markets also sell coal (smithing the regional bars needed coal carried up from home) ---- */
if (typeof REGIONS !== 'undefined') for (const id in REGIONS) { const Rg = REGIONS[id]; if (Rg && Rg.trade && !Rg.trade.some(t => t[0] === 'coal')) Rg.trade.push(['coal', Math.round(((IT.coal && IT.coal.p) || 15) * 1.6)]); }

/* ---- the staff: ranged, with an area fireball every third shot, it cleared a goblin camp and an ogre in 9 s,
   far faster than a sword (overnight playtest). Its bolts hit 0.85x and the basic fireball 1.2x (the Fireball skill shares the blast, so its size stays). ---- */
WPN.staff.mult = .85; WPN.staff.combo = [.85, .85, 1.2];

/* ---- the Forge King (The Hollow Crown, chapter 3) needed combat 60 in cobalt, while the Stone Warden before him fell at
   combat 1 and the Ember Wyrm after him was easy: health 4000 -> 2600, attack 56 -> 44 ---- */
if (EN.forgeking) { EN.forgeking.hp = 2600; EN.forgeking.atk = 44; }

/* ---- fishing out-earned farming in week one (pond fish 12-20g per energy, crops 2-3g): fish sell for 20% less, as crops
   already did (t_balance.js), and a cast costs 3 energy at first, down to 1 with skill (e_play.js) ---- */
for (const k in IT) if (IT[k].t === 'fish' && typeof IT[k].p === 'number') IT[k].p = Math.max(1, Math.round(IT[k].p * .8));

/* ---- painted standing frames that came out as a smear (frame 0 of the troll, basalt golem and ogre; the goblin's is
   sheared): the painted style uses walk frame 2 in their place, so a creature standing still looks right ---- */
if (typeof STYLE_ALIAS !== 'undefined') for (const a of ['troll', 'basalt', 'ogre', 'goblin']) STYLE_ALIAS['en_' + a + '.0'] = 'en_' + a + '.2';

/* ---- painted fruit trees show their fruit: the painted "_f" frames came out the same as the bare ones, so you couldn't
   see when to harvest. In a painted style a ripe tree gets fruit painted on its canopy in the fruit's colour. ---- */
{
  const FRC = new Map();
  treeImg = (f => function (kind, season, fruit) {
    const c = f.apply(this, arguments);
    if (!fruit || !c || !c.width || SETTINGS.artStyle === 'pixel' || typeof FTREES === 'undefined' || !FTREES[kind]) return c;
    if (FRC.has(c) && !FRC.get(c).__lost) return FRC.get(c);
    const col = FTREES[kind][3], W = c.width, H = c.height, r = Math.max(2, W * .03);
    const out = mk(W, H, x => {
      x.drawImage(c, 0, 0);
      let s = kind.length * 97; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 14; i++) {
        const a = rnd() * 6.283, d = Math.sqrt(rnd()), px = W * .5 + Math.cos(a) * d * W * .3, py = H * .34 + Math.sin(a) * d * H * .2;
        x.fillStyle = 'rgba(40,20,10,.45)'; x.beginPath(); x.arc(px + r * .25, py + r * .3, r, 0, 6.283); x.fill();
        x.fillStyle = col; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill();
        x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(px - r * .35, py - r * .35, r * .35, 0, 6.283); x.fill();
      }
    });
    for (const k of ['ww', 'wh', 'ax', 'ay', 'hi', 'lum', 'off', 'cast']) if (c[k] !== undefined) out[k] = c[k];
    FRC.set(c, out); return out;
  })(treeImg);
}

/* ---- clay along rivers and lakes (asked 2026-11-03): clay mounds only grew on sand touching water, so river banks,
   mostly grass, had almost none. Once per wild map, up to 30 more mounds go on grass, dirt or sand within two tiles
   of fresh water (not the sea coast). ---- */
EVT.on('map', id => {
  const m = MAPS[id]; if (!m || !m.wild || !S || TITLE) return; S.flags = S.flags || {}; if (S.flags['clay2_' + id]) return; S.flags['clay2_' + id] = 1;
  const sea = b => b === 'coast' || b === 'isles' || b === 'reef';
  let n = 0;
  for (let k = 0; k < 20000 && n < 30; k++) {
    const x = 3 + Math.floor(Math.random() * (m.w - 6)), y = 3 + Math.floor(Math.random() * (m.h - 6)), t = getT(m, x, y);
    if (!['g', 'd', 's'].includes(t) || getO(m, x, y) || m.solidB[y * m.w + x] || (m.safe && dist(x, y, m.safe[0], m.safe[1]) < 18)) continue;
    if (m.bio && sea(BIOMES[m.bio[y * m.w + x]])) continue;
    let wet = false; for (let dy = -2; dy <= 2 && !wet; dy++) for (let dx = -2; dx <= 2 && !wet; dx++) wet = !!(TER[getT(m, x + dx, y + dy)] || {}).water;
    if (!wet || (m.roadT && m.roadT.has(y * m.w + x))) continue;
    setO(m, x, y, { k: 'clay_mound' }); n++;
  }
});

/* ---- ore rocks are drawn at 80% (asked 2026-11-03: they looked too big), standing on the same tile ---- */
{
  const ORS = new WeakMap(), K = .8;
  objSprite = (f => function (o, season) {
    const c = f.apply(this, arguments);
    if (!o || !c || !c.width || !/^ore_/.test(o.k)) return c;
    const hit = ORS.get(c); if (hit && !hit.__lost) return hit;
    const out = mk(c.width, c.height, x => x.drawImage(c, 0, 0));
    for (const k of ['hi', 'lum', 'cast']) if (c[k] !== undefined) out[k] = c[k];
    out.ww = c.ww * K; out.wh = c.wh * K; if (c.ax !== undefined) { out.ax = c.ax * K; out.ay = c.ay * K; }
    if (c.off) out.off = c.off.map(v => v * K);
    ORS.set(c, out); return out;
  })(objSprite);
}

/* ---- ripe crops drawn one by one (art/sprites/crops2.py, `crop_<key>_3`): a ripe crop with its own drawing uses it
   as it is (real colours); others keep the shape templates of crops.py ---- */
cropSpr = (f => function (k, st, dead) {
  if (st === 3 && !dead && PIX.map && PIX.map['crop_' + k + '_3']) { const key = k + st + 'own'; if (CROPSPR[key] && !CROPSPR[key].__lost) return CROPSPR[key]; const c = PIX.get('crop_' + k + '_3'); if (c) return CROPSPR[key] = c; }
  return f.apply(this, arguments);
})(cropSpr);

/* ---- tilled soil joins into fields: each tile was drawn with its own ragged rim and cut corners, so a field read as
   a grid of cushions (Painterly especially). A side that meets more soil takes the tile's inner rows instead of
   the rim, and a corner fills in when its two sides and the diagonal are soil. 16 edge masks x wet/dry, made once. ---- */
const SOILC = {};
function soilSpr(m, x, y, wet) {
  const has = (dx, dy) => inb(m, x + dx, y + dy) && !!m.soil[(y + dy) * m.w + x + dx];
  const N = has(0, -1), E = has(1, 0), S_ = has(0, 1), W = has(-1, 0);
  const mask = (N ? 1 : 0) | (E ? 2 : 0) | (S_ ? 4 : 0) | (W ? 8 : 0) | (N && E && has(1, -1) ? 16 : 0) | (S_ && E && has(1, 1) ? 32 : 0) | (S_ && W && has(-1, 1) ? 64 : 0) | (N && W && has(-1, -1) ? 128 : 0);
  const name = wet ? 'soil_wet' : 'soil_dry', key = name + mask + SETTINGS.artStyle;
  if (SOILC[key] && !SOILC[key].__lost) return SOILC[key];
  const fr = PIX.map[name]; if (!fr || !PIX.img) return PIX.get(name);
  const c = mkCPU(32, 32, g2 => g2.drawImage(PIX.img, fr.x, fr.y, 32, 32, 0, 0, 32, 32));
  const g2 = c.getContext('2d');
  // a joined side: the rim (2 px) is replaced by the rows or columns just inside it
  if (N) g2.drawImage(c, 0, 2, 32, 2, 0, 0, 32, 2);
  if (S_) g2.drawImage(c, 0, 28, 32, 2, 0, 30, 32, 2);
  if (W) g2.drawImage(c, 2, 0, 2, 32, 0, 0, 2, 32);
  if (E) g2.drawImage(c, 28, 0, 2, 32, 30, 0, 2, 32);
  for (const [bit, cx, cy] of [[16, 30, 0], [32, 30, 30], [64, 0, 30], [128, 0, 0]]) if (mask & bit) g2.drawImage(c, 14, 14, 2, 2, cx, cy, 2, 2);
  let out = mk(32, 32, x2 => x2.drawImage(c, 0, 0)); out.ww = 16; out.wh = 16;
  if (SETTINGS.artStyle !== 'pixel' && typeof smoothUp === 'function') {
    // smoothed with a 2 px border of its own edge pixels, then cut back to the tile, so the smoothing doesn't fade the
    // tile's edges (that showed as seams between joined tiles)
    const pad = mkCPU(36, 36, p2 => { p2.drawImage(c, 2, 2); p2.drawImage(c, 0, 0, 32, 1, 2, 0, 32, 2); p2.drawImage(c, 0, 31, 32, 1, 2, 34, 32, 2); p2.drawImage(c, 0, 0, 1, 32, 0, 2, 2, 32); p2.drawImage(c, 31, 0, 1, 32, 34, 2, 2, 32);
      p2.drawImage(c, 0, 0, 1, 1, 0, 0, 2, 2); p2.drawImage(c, 31, 0, 1, 1, 34, 0, 2, 2); p2.drawImage(c, 0, 31, 1, 1, 0, 34, 2, 2); p2.drawImage(c, 31, 31, 1, 1, 34, 34, 2, 2); });
    const big = typeof gpuUp === "function" ? gpuUp(pad, 4) : smoothUp(pad), k = big.width / 36;   // a plain smooth enlargement: paintedLook's edge shading washed the field out
    const cut = mk(32 * k, 32 * k, x2 => x2.drawImage(big, 2 * k, 2 * k, 32 * k, 32 * k, 0, 0, 32 * k, 32 * k));
    for (const q of ['hi', 'lum']) if (big[q] !== undefined) cut[q] = big[q];
    out = cut; out.ww = 16; out.wh = 16;
  }
  return SOILC[key] = out;
}
EVT.on('map', () => { for (const k in SOILC) if (!k.endsWith(SETTINGS.artStyle)) delete SOILC[k]; });

/* ---- a bridge over lava has lava under it, not water (blue foam ran along the bridge over the lava, art pass 2) ---- */
paintKey = (f => function (m, x, y) {
  const k = f.apply(this, arguments);
  if (k === 'w' && m && m.t) { const X = Math.max(0, Math.min(m.w - 1, x)), Y = Math.max(0, Math.min(m.h - 1, y));
    if (m.t[Y * m.w + X] === 'b' && [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 0], [-2, 0], [0, 2], [0, -2]].some(([dx, dy]) => inb(m, X + dx, Y + dy) && m.t[(Y + dy) * m.w + X + dx] === 'l')) return 'l'; }
  return k;
})(paintKey);

/* ---- rocks in themed mines match the floor: snowy rock on ice floors, ash rock on magma and void floors, cave rock
   on earth floors (the mossy surface rock stood on every mine floor, art pass 2) ---- */
objSprite = (f => function (o, season) {
  if (o && o.k === 'rock' && !o.v && cur && cur.mine && cur.theme) { const v = { ice: 'S', magma: 'A', void: 'A' }[cur.theme]; if (v) return f.call(this, Object.assign({}, o, { v }), season); return f.call(this, Object.assign({}, o, { cave: 1 }), season); }
  return f.apply(this, arguments);
})(objSprite);

/* ---- E prefers what matters: a story object, page or shard under your feet or beside you beats a wild flower or
   mushroom in front of you (E picked a morel instead of the journal page you stood on) ---- */
findInteract = (f => function () {
  const r = f.apply(this, arguments); if (!r || r.label !== 'Pick' || !cur || !S) return r;
  const px = Math.floor(S.p.x / 16), py = Math.floor((S.p.y - 2) / 16);
  for (const [dx, dy] of [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1]]) {
    const [x, y, o] = mainOf(cur, px + dx, py + dy); if (!o || !/^(page|shard|storyobj|storynpc|chest)$/.test(o.k)) continue;
    const it = objInteract(cur, x, y, o); if (it) return it;
  }
  return r;
})(findInteract);

/* ---- the tracker for boss and kill steps (they had no arrow): a boss step without a place points to its arena (the Wilds
   or a region), a kill step to the nearest ground of the biome where that enemy lives ('*bio:<biome>' kill steps too) ---- */
const KILLW = { k: null, v: null };
stepWhere = (f => function (sid, st) {
  const r = f.apply(this, arguments); if (r || !st) return r;
  try {
    if (st.t === 'boss' && st.boss) for (const id of ['wilds', ...Object.keys(typeof REGIONS !== 'undefined' ? REGIONS : {})]) {
      const m = MAPS[id], a = m && (m.arenas || []).find(a => a.boss === st.boss); if (a) return { map: id, x: a.x, y: a.y + 4 };
    }
    if (st.t === 'kill' && st.enemy && MAPS.wilds && MAPS.wilds.bio) {
      const m = MAPS.wilds, want = st.enemy.startsWith('*bio:') ? st.enemy.slice(5) : Object.keys(BIOME_EN).find(b => ['day', 'night'].some(t => (BIOME_EN[b][t] || []).some(([k]) => k === st.enemy)));
      const bi = want ? BIOMES.indexOf(want) : -1; if (bi < 0) return r;
      const px = cur === m ? S.p.x / 16 : m.w / 2, py = cur === m ? S.p.y / 16 : m.h - 20;
      if (cur === m && m.bio[Math.floor(py) * m.w + Math.floor(px)] === bi) return r;   // already there: no arrow
      const ck = sid + st.enemy + (Math.floor(px / 8) * 1000 + Math.floor(py / 8)); if (KILLW.k === ck) return KILLW.v;   // the scan runs again only after you've moved a few tiles
      let best = null, bd = 1e9;
      for (let y = 4; y < m.h - 4; y += 4) for (let x = 4; x < m.w - 4; x += 4) { if (m.bio[y * m.w + x] !== bi || !passable(m, x, y)) continue; const d = Math.hypot(x - px, y - py); if (d < bd && d > 12) { bd = d; best = { map: 'wilds', x, y }; } }
      KILLW.k = ck; KILLW.v = best; if (best) return best;
    }
  } catch (e) { console.error(e); }
  return r;
})(stepWhere);

/* ---- the map can be dragged: press and hold anywhere on it and move to pan (asked 2026-11-03). A press that moves less
   than 4 px is still a click. ---- */
renderMap = (f => function (b) {
  const r = f.apply(this, arguments);
  const box = b.querySelector('.mapbox'); if (!box || box.__drag) return r; box.__drag = 1;
  box.style.cursor = 'grab';
  let d = null;
  box.addEventListener('pointerdown', e => { if (e.button !== 0) return; d = { x: e.clientX, y: e.clientY, sl: box.scrollLeft, st: box.scrollTop, moved: false, id: e.pointerId }; });
  box.addEventListener('pointermove', e => {
    if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) { d.moved = true; box.style.cursor = 'grabbing'; try { box.setPointerCapture(d.id); } catch (err) {} }
    box.scrollLeft = d.sl - dx; box.scrollTop = d.st - dy; e.preventDefault();
  });
  const end = e => { if (!d) return; const moved = d.moved; d = null; box.style.cursor = 'grab'; if (moved) { const stop = ev => { ev.stopPropagation(); ev.preventDefault(); }; box.addEventListener('click', stop, { capture: true, once: true }); setTimeout(() => box.removeEventListener('click', stop, { capture: true }), 300); } };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  box.addEventListener('dragstart', e => e.preventDefault());   // the map image isn't dragged out as a picture
  const hint = b.querySelector('.acts small'); if (hint && !/drag/i.test(hint.textContent)) hint.textContent += ' Drag to move the map.';
  return r;
})(renderMap);

/* ---- numbers and loot text that land on the same spot stack upward instead of piling on top of each other ---- */
floatText = (f => function (x, y, txt, c) {
  let k = 0; for (const o of FX) if (o.txt !== undefined && o.t > .75 && Math.abs(o.x - x) < 12 && Math.abs(o.y - (y - k * 8)) < 6) k++;
  return f.call(this, x + (k % 2 ? 5 : 0), y - k * 8, txt, c);
})(floatText);

/* ---- the zombie and the drowned pirate read as villagers: the zombie gets sickly green skin, torn rags, bare ribs and glowing
   eyes; the pirate drowned-blue skin, a red bandana and bare ribs (art detail pass) ---- */
if (EN.zombie && EN.zombie.P) Object.assign(EN.zombie.P, { skin: '#7aa858', hair: '#2a3020', shirt: '#5a5040', pants: '#3a3a2a', eye: '#e8ff60', ribs: 1 });
if (EN.pirate && EN.pirate.P) Object.assign(EN.pirate.P, { skin: '#8ab0a8', hair: '#4a5a58', eye: '#5affe0', mask: '#b02020', ribs: 1 });
