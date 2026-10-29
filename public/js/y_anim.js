/* ================= Phase 14: animation =================
   The player is drawn from a small state machine, highest priority first:
   mounted > dodge roll > hurt > weapon attack > tool use > eating > fishing > Guard > walk > idle.
   Poses come from human.py (8-frame walk 'w0'-'w7', idle breath, wind/strike/thrust/draw/
   cast/pour/eat/block/hurt, and 'tuck' for the roll, rotated in 90° steps so it stays crisp).
   The held item is drawn at the pose's hand (HAND, art px, mirrored for dir 1).
   Weapons have wind-up, strike and recovery: sword arcs with a smear, warhammers come down
   overhead and kick up dust, spears pull back and thrust, daggers jab twice, bows draw and
   release. Abilities: Cleave sweeps a ring, Lunge leaves afterimages, Rend makes targets
   bleed, Guard shimmers, Second Wind lifts green motes.
   Enemies bob as they walk, lunge when they attack, recoil and squash when hit, crouch
   before a slam, and fall and fade when they die. The world gets water glints, forge
   sparks, belt items that slide between tiles, and '!' or heart bubbles over villagers. */

const SWING_T = { sword: .34, dagger: .26, spear: .38, hammer: .5, bow: .46 };
const HAND = {
  wind: { 0: [25, 6], 2: [10, 6], 3: [7, 6] }, strike: { 0: [17, 37], 2: [26, 37], 3: [16, 34] }, thrust: { 0: [18, 31], 2: [29, 27], 3: [16, 28] },
  draw: { 0: [16, 28], 2: [29, 26], 3: [16, 26] }, cast: { 0: [18, 27], 2: [26, 15], 3: [16, 24] }, pour: { 0: [17, 34], 2: [24, 33], 3: [16, 33] },
  eat: { 0: [16, 19], 2: [21, 18], 3: [16, 22] }, block: { 0: [16, 27], 2: [23, 24], 3: [16, 27] }, hurt: { 0: [26, 30], 2: [9, 32], 3: [6, 30] },
  idle: { 0: [26, 39], 2: [17, 39], 3: [6, 39] },
};
const lerpc = (a, b, t) => a + (b - a) * clamp(t, 0, 1); // clamped (a_core's lerp is not)
function handAt(pose, dir) { const h = (HAND[pose] || HAND.idle)[dir === 1 ? 2 : dir] || [16, 38]; return [S.p.x - 8 + (dir === 1 ? 32 - h[0] : h[0]) / 2, S.p.y - 31 + h[1] / 2]; }
function heldIcon(ic, x, y, ang, size) { if (!ic) return; g.save(); g.translate(Math.round(x * 2) / 2, Math.round(y * 2) / 2); g.rotate(ang + Math.PI / 4); D(ic, -size * .2, -size * .8, size, size); g.restore(); }
function px2(x, y, c, w = 1, h = 1) { g.fillStyle = c; g.fillRect(Math.round(x * 2) / 2, Math.round(y * 2) / 2, w, h); }
const FXL = [], CORPSES = []; // short-lived effects drawn over the world

/* ---- what the player is doing, as a pose and a held item ---- */
function playerAction() {
  const p = S.p, base = Math.atan2(DIRV[p.dir][1], DIRV[p.dir][0]), side = p.dir === 1 ? -1 : 1;
  if (pl.roll > 0) return { roll: 1 };
  if (pl.inv > .72) return { pose: 'hurt' };
  if (pl.swing > 0) {
    const wt = PS.wt || 'sword', t = 1 - pl.swing / (pl.swingT || .3), ic = itemIcon(S.eq.weapon);
    if (wt === 'bow') return t < .62 ? { pose: 'draw', bow: ic, pull: t / .62 } : { pose: 'draw', bow: ic, pull: 0, loose: (t - .62) / .38 };
    if (wt === 'spear') { const ext = t < .3 ? -lerpc(0, 4, t / .3) : t < .55 ? lerpc(-4, 9, (t - .3) / .25) : lerpc(9, 0, (t - .55) / .45); return { pose: t < .3 ? 'draw' : 'thrust', item: ic, ang: base, ext, streak: t >= .3 && t < .6 }; }
    if (wt === 'dagger') { const k = (t * 2) % 1, ext = Math.sin(k * Math.PI) * 6; return { pose: t < .5 ? 'thrust' : 'strike', item: ic, ang: base + (t < .5 ? -.3 : .3) * side, ext, streak: k > .2 && k < .6, size: 12 }; }
    if (wt === 'hammer') { if (t >= .55 && !pl.slammed) { pl.slammed = 1; SHAKE = Math.max(SHAKE, .12); const [fx, fy] = facePt(); for (let i = 0; i < 10; i++) PARTS.push({ x: fx, y: fy + 4, vx: (Math.random() - .5) * 70, vy: -Math.random() * 40, t: .4, c: '#c8b898' }); FXL.push({ k: 'ring', x: fx, y: fy + 4, t: 0, T: .3, r: 12, c: '#e8dcc0' }); }
      return { pose: t < .4 ? 'wind' : 'strike', item: ic, ang: t < .4 ? base - 2.5 * side : lerpc(base - 2.2 * side, base + .35 * side, (t - .4) / .15), size: 18 }; }
    const a0 = base - 1.7 * side, a1 = base + 1.1 * side; // sword: wind up behind, sweep through, follow through
    return { pose: t < .3 ? 'wind' : 'strike', item: ic, ang: t < .3 ? base - 2.1 * side : lerpc(a0, a1, (t - .3) / .3), smear: t >= .3 && t < .75 ? [a0, lerpc(a0, a1, (t - .3) / .3), 1 - (t - .3) / .45] : null };
  }
  pl.slammed = 0;
  if (pl.anim > 0 && pl.tool) {
    const t = 1 - pl.anim / .25, tl = pl.tool;
    if (isTool(tl) && tl !== 'weapon') {
      const ic = itemIcon('tool:' + tl + ':' + (S.tools[tl] || 1));
      if (tl === 'can') { if (Math.random() < .5) { const [fx, fy] = facePt(); PARTS.push({ x: fx + (Math.random() - .5) * 6, y: fy - 4, vx: 0, vy: 30, t: .25, c: '#7ac8f0' }); } return { pose: 'pour', item: ic, ang: base + .9 * side, size: 12 }; }
      if (tl === 'rod') return { pose: t < .4 ? 'wind' : 'cast', item: ic, ang: t < .4 ? base - 2.4 * side : lerpc(base - 1.6 * side, base - .4 * side, (t - .4) / .3), size: 14 };
      const low = tl === 'hoe' ? .9 : .4; // axe, pickaxe, hoe, hammering: overhead, then down
      return { pose: t < .45 ? 'wind' : 'strike', item: ic, ang: t < .45 ? base - 2.4 * side : lerpc(base - 1.8 * side, base + low * side, (t - .45) / .25), size: 13 };
    }
    if (tl === 'weapon') return { pose: t < .3 ? 'wind' : 'strike', item: itemIcon(S.eq.weapon), ang: t < .3 ? base - 2.1 * side : lerpc(base - 1.7 * side, base + 1.1 * side, (t - .3) / .3) };
    return { pose: 'pour' }; // sowing, placing
  }
  if (pl.eatT > 0) return { pose: 'eat', item: itemIcon(pl.eatId), ang: -Math.PI / 4, size: 9, crumbs: 1 };
  if (fishing) return { pose: 'cast', fishing: 1 }; // the rod itself is drawn as a line (drawFishing)
  if (typeof GUARD !== 'undefined' && GUARD > 0) return { pose: 'block', item: itemIcon(S.eq.shield || S.eq.weapon), ang: base - .6 * side, size: 12, guard: 1 };
  if (pl.moving) return { frame: 'w' + Math.floor(gameT * 12) % 8, held: 1 };
  return { frame: (gameT % 2.6) > 1.9 ? 'idle1' : 0, held: 1 };
}

function drawFishing(p) { // a rod held out over the water, one sagging line, one bobber where the cast landed
  const d = DIRV[p.dir], [hx, hy] = handAt('cast', p.dir), up = p.dir === 3;
  const tip = d[0] ? [hx + d[0] * 13, hy - 9] : [hx + 3, hy + (up ? -15 : 9)];
  for (let k = 0; k <= 12; k++) { const t = k / 12; px2(hx + (tip[0] - hx) * t, hy + (tip[1] - hy) * t, t < .35 ? '#5a3a22' : '#9a6a40', 1, 1); }
  const [fx, fy] = facePt(), bx = fx + d[0] * 12, by = fy + d[1] * 12 + 6, ph = fishing.phase;
  const dip = ph === 'bite' ? 1.5 + Math.sin(gameT * 30) * .5 : ph === 'reel' ? 0 : Math.sin(gameT * 4) * .5, shake = ph === 'reel' ? Math.sin(gameT * 40) : 0;
  g.strokeStyle = 'rgba(240,240,230,.85)'; g.lineWidth = .5; g.beginPath(); g.moveTo(tip[0], tip[1]);
  if (ph === 'reel') g.lineTo(bx + shake, by + dip); else g.quadraticCurveTo((tip[0] + bx) / 2, Math.max(tip[1], by) + 5, bx, by + dip); g.stroke();
  px2(bx - 1, by - 1 + dip, '#f4f0e8', 2, 1); px2(bx - 1, by + dip, '#e8342a', 2, 1.5); px2(bx - .5, by - 1.5 + dip, '#2a1c18', 1, .5);
  if (ph === 'bite' && gameT - (fishing.rt || 0) > .45) { fishing.rt = gameT; FXL.push({ k: 'ring', x: bx, y: by + 1, t: 0, T: .4, r: 5, c: '#cfeefa' }); } // a ripple every half second
}
drawPlayer = function () {
  const p = S.p, P = playerPal(); if (!HC_P) HC_P = 'pl' + Math.random().toString(36).slice(2, 7);
  if (pl.inv > 0 && pl.inv < .72 && Math.floor(gameT * 20) % 2) return; // invulnerability blink
  if (S.mounted) {
    const h = rideHorse(); if (!h) { S.mounted = false; return; }
    const spr = animalSpr('horse', h.coat, pl.moving ? Math.floor(gameT * 10) % 2 : 0), right = p.dir === 2 || (p.dir !== 1 && p.lastH !== 1), bob = pl.moving && Math.floor(gameT * 10) % 2 ? .5 : 0;
    shadow(p.x, p.y, 14); g.save(); g.translate(p.x, p.y); if (!right) g.scale(-1, 1); D(spr, -spr.ww / 2, -spr.wh + 1); g.restore();
    const ps = humanSpr(HC_P, P, 2, 'ride'); g.save(); g.translate(p.x, p.y - bob); if (!right) g.scale(-1, 1); D(ps, -10, -41, 16, 32); g.restore(); return;
  }
  const A = playerAction();
  // Lunge afterimages
  if (pl.trail && pl.trail.t > 0) { const T = pl.trail, spr = humanSpr(HC_P, P, p.dir, 'thrust'); for (let k = 1; k <= 3; k++) { const q = k / 4; g.globalAlpha = .35 * (1 - q) * (T.t / .3); D(spr, lerpc(T.x0, p.x, q) - 8, lerpc(T.y0, p.y, q) - 31, 16, 32); } g.globalAlpha = 1; }
  shadow(p.x, p.y, 6.5);
  if (A.roll) {
    const k = Math.min(3, Math.floor((1 - pl.roll / .28) * 4)), sgn = p.dir === 1 || p.dir === 3 ? -1 : 1, spr = humanSpr(HC_P, P, 0, 'tuck');
    g.save(); g.translate(p.x, p.y - 9); g.rotate(k * Math.PI / 2 * sgn); D(spr, -8, -23, 16, 32); g.restore();
    if (Math.random() < .6) PARTS.push({ x: p.x + (Math.random() - .5) * 8, y: p.y, vx: (Math.random() - .5) * 20, vy: -12, t: .3, c: '#d8c4a0' });
    return;
  }
  const frame = A.pose || A.frame, spr = humanSpr(HC_P, P, p.dir, frame), back = p.dir === 3;
  const drawHeld = () => {
    if (A.held) { const id = S.eq.weapon; if (!id || pl.anim > 0) return; const [hx, hy] = handAt('idle', p.dir), sw = pl.moving ? Math.sin(gameT * 12 / 8 * Math.PI * 2) * .25 : 0; heldIcon(itemIcon(id), hx, hy, (p.dir === 1 ? -1 : 1) * (-.6 + sw) - Math.PI / 4 + (p.dir === 1 ? -Math.PI / 2 : 0), 10); return; }
    const [hx, hy] = handAt(A.pose, p.dir);
    if (A.bow) { // bow upright at the front hand, string to the drawing hand
      const fx = hx, fy = hy, dx = DIRV[p.dir][0], dy = DIRV[p.dir][1], pull = A.pull || 0;
      g.save(); g.translate(fx, fy); g.rotate(Math.atan2(dy, dx) - Math.PI / 4); D(A.bow, -7, -7, 14, 14); g.restore(); // upright, string toward you
      const top = [fx - dy * 6, fy + dx * 6 - 6], bot = [fx + dy * 6, fy - dx * 6 + 2], back_ = [fx - dx * (2 + pull * 6), fy - dy * (2 + pull * 6) - 1];
      const vib = A.loose ? Math.sin(A.loose * 40) * (1 - A.loose) * 1.5 : 0;
      g.strokeStyle = '#f2ead8'; g.lineWidth = .5; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(back_[0] + vib, back_[1]); g.lineTo(bot[0], bot[1]); g.stroke();
      if (!A.loose) { g.strokeStyle = '#8a6a4a'; g.beginPath(); g.moveTo(back_[0], back_[1]); g.lineTo(fx + dx * 6, fy + dy * 6 - 1); g.stroke(); }
      return;
    }
    if (!A.item) return;
    const ex = A.ext || 0, ix = hx + Math.cos(A.ang - (A.pose === 'thrust' || A.pose === 'draw' ? 0 : 0)) * 0 + DIRV[p.dir][0] * ex, iy = hy + DIRV[p.dir][1] * ex;
    heldIcon(A.item, ix, iy, A.ang, A.size || 15);
    if (A.streak) { const d = DIRV[p.dir]; for (let k = 0; k < 6; k++) px2(ix + d[0] * (8 + k * 2) - d[1] * .5, iy + d[1] * (6 + k * 2) - 4, 'rgba(255,255,240,' + (.6 - k * .09) + ')', d[0] ? 1 : .5, d[0] ? .5 : 1); }
  };
  if (back) drawHeld();
  D(spr, p.x - 8, p.y - 31, 16, 32);
  if (!back) drawHeld();
  if (A.smear) { const [a0, a1, al] = A.smear, cx = p.x, cy = p.y - 15; for (let q = 0; q <= 20; q++) { const an = lerpc(a0, a1, q / 20); for (const r of [12, 14]) px2(cx + Math.cos(an) * r, cy + Math.sin(an) * r * .8, 'rgba(255,255,245,' + (al * (q / 20) * (r === 14 ? .9 : .5)).toFixed(2) + ')', 1, 1); } }
  if (A.crumbs && Math.random() < .2) PARTS.push({ x: p.x + (Math.random() - .5) * 4, y: p.y - 21, vx: (Math.random() - .5) * 16, vy: 10, t: .3, c: '#e8c890' });
  if (A.guard) { const r = 11 + Math.sin(gameT * 10) * 1; for (let q = 0; q < 24; q++) { const an = q / 24 * Math.PI * 2; if ((q + Math.floor(gameT * 12)) % 3) px2(p.x + Math.cos(an) * r, p.y - 15 + Math.sin(an) * r * .9, 'rgba(160,210,255,.7)'); } }
  if (A.fishing) drawFishing(p);
  if (pl.burn > 0 && Math.random() < .3) PARTS.push({ x: p.x + (Math.random() - .5) * 8, y: p.y - 10 - Math.random() * 14, vx: 0, vy: -24, t: .4, c: '#ff8a3a' });
};

/* ---- timings and triggers ---- */
const _swingAnimA = swingAnim;
swingAnim = function () { _swingAnimA(); const t = SWING_T[PS.wt] || .3; pl.swing = t; pl.swingT = t; pl.slammed = 0; };
const _eatA = eat;
eat = function (id) { const before = S.p.st + S.p.hp; const r = _eatA(id); pl.eatT = .7; pl.eatId = id; return r; };
for (const [k, fx] of [['cleave', () => { FXL.push({ k: 'ring', x: S.p.x, y: S.p.y - 12, t: 0, T: .35, r: 24, c: '#fff6e0', thick: 1 }); }],
  ['lunge', () => { pl.trail = { x0: S.p.x, y0: S.p.y, t: .3 }; }],
  ['secondwind', () => { for (let i = 0; i < 18; i++) PARTS.push({ x: S.p.x + (Math.random() - .5) * 14, y: S.p.y - Math.random() * 20, vx: 0, vy: -20 - Math.random() * 20, t: .8, c: Math.random() < .5 ? '#7ae87a' : '#c8ffc8' }); }]]) {
  if (!ABIL[k]) continue; const fn0 = ABIL[k].fn; const pre = k === 'lunge';
  ABIL[k].fn = function () { const x0 = S.p.x, y0 = S.p.y; const ok = fn0.apply(this, arguments); if (ok !== false) { fx(); if (pre) pl.trail = { x0, y0, t: .3 }; } return ok; };
}

/* ---- enemies: walk bob, attack lunge, hit recoil, telegraph crouch ---- */
function enemyAnim(e, E) {
  const o = { x: 0, y: 0, sx: 1, sy: 1 }, now = gameT, dt = Math.min(.1, now - (e._at || now)); e._at = now;
  const moved = e._ax !== undefined && Math.hypot(e.x - e._ax, e.y - e._ay) > .05; e._ax = e.x; e._ay = e.y;
  const fly = E.ai === 'fly' || E.ai === 'swoop' || E.ai === 'ghost';
  if (moved && !fly && E.art !== 'slime') o.y -= Math.abs(Math.sin(now * 10 + (e.hx || 0))) * 1.2;
  if (e.lunge > 0) { e.lunge -= dt; const k = Math.sin(Math.PI * clamp(1 - e.lunge / .3, 0, 1)), d = Math.hypot(S.p.x - e.x, S.p.y - e.y) || 1; o.x += (S.p.x - e.x) / d * k * 5; o.y += (S.p.y - e.y) / d * k * 3; o.sx *= 1 + k * .1; }
  if (e.flash > 0 && !e.dead) { const k = e.flash / .12, d = Math.hypot(e.x - S.p.x, e.y - S.p.y) || 1; o.x += (e.x - S.p.x) / d * 2 * k; o.sx *= 1 + .15 * k; o.sy *= 1 - .12 * k; }
  if (e.tele > 0) { o.sx *= 1 + e.tele * .14; o.sy *= 1 - e.tele * .18; }
  if (e.tele2) { o.sx *= 1.1; o.sy *= .92; }
  if (e.bleed > 0 && Math.random() < .15) PARTS.push({ x: e.x + (Math.random() - .5) * 8, y: e.y - (E.r || 6) * 1.5, vx: 0, vy: 20, t: .4, c: '#a8101a' });
  return o;
}
const _killEnemyA = killEnemy;
killEnemy = function (m, e) {
  const was = e.dead; _killEnemyA(m, e);
  if (!was && e.dead) { const E = EN[e.k]; CORPSES.push({ m: m.id, spr: enemySpr(e.k, 0), x: e.x, y: e.y, flip: e.dir < 0 && E.art !== 'human' && E.art !== 'slime', t: 0, T: E.boss ? 1.4 : .6, boss: E.boss }); }
};

/* ---- the overlay pass: effects, corpses, glints, sparks, sliding belt items, emotes ---- */
const _pcCursorDrawA = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawA(m);
  const now = gameT, dt = Math.min(.1, now - (FXL.last || now)); FXL.last = now;
  if (pl.eatT > 0) pl.eatT -= dt; if (pl.trail) pl.trail.t -= dt;
  for (let i = CORPSES.length - 1; i >= 0; i--) {
    const c = CORPSES[i]; if (c.m !== m.id) { CORPSES.splice(i, 1); continue; } c.t += dt; if (c.t >= c.T) { CORPSES.splice(i, 1); continue; }
    const k = c.t / c.T; g.save(); g.translate(c.x + (c.boss ? (Math.random() - .5) * 2 * (1 - k) : 0), c.y); if (c.flip) g.scale(-1, 1);
    g.globalAlpha = 1 - k * k; if (c.t < .1) g.filter = 'brightness(3)';
    g.scale(1 + k * .25, Math.max(.15, 1 - k * .85)); D(c.spr, -c.spr.ww / 2, -c.spr.wh); g.filter = 'none'; g.globalAlpha = 1; g.restore();
    if (c.boss && Math.random() < .5) PARTS.push({ x: c.x + (Math.random() - .5) * c.spr.ww, y: c.y - Math.random() * c.spr.wh * (1 - k), vx: 0, vy: -30, t: .5, c: '#d8d0c0' });
  }
  for (let i = FXL.length - 1; i >= 0; i--) {
    const f = FXL[i]; f.t += dt; if (f.t >= f.T) { FXL.splice(i, 1); continue; }
    const k = f.t / f.T, r = f.r * (.3 + k * .7);
    for (let q = 0; q < 32; q++) { const an = q / 32 * Math.PI * 2; px2(f.x + Math.cos(an) * r, f.y + Math.sin(an) * r * .6, f.c, f.thick ? 1.5 : 1, 1); }
    g.globalAlpha = 1;
  }
  const tx0 = Math.floor(S.p.x / 16) - 26, ty0 = Math.floor(S.p.y / 16) - 17;
  for (let y = ty0; y < ty0 + 34; y++) for (let x = tx0; x < tx0 + 52; x++) {
    if (!inb(m, x, y)) continue; const t = m.t[y * m.w + x];
    if (TER[t] && TER[t].water && t !== 'i') { const h = hsh(x, y, 7), ph = (now * .7 + h * 9) % 5; if (ph < .6) px2(x * 16 + 2 + h * 9 + ph * 5, y * 16 + 3 + (h * 37 % 1) * 10, 'rgba(255,255,255,' + (.7 - ph).toFixed(2) + ')', 1, .5); }
    else if (TER[t] && TER[t].lava) { const h = hsh(x, y, 9), ph = (now * .9 + h * 7) % 4; if (ph < .5) px2(x * 16 + 3 + h * 10, y * 16 + 4 + ph * 4, '#ffd060', .5, .5); }
    const o = m.o[y * m.w + x];
    if (o && typeof isBelt === 'function' && isBelt(o) && o.item && o.slideT === TICK.n && o.slideFrom !== undefined) { const k = clamp(TICK.acc / TICK.len, 0, 1), d = DIRV[o.slideFrom], ic = itemIcon(parseK(o.item)[0]); if (ic) D(ic, x * 16 + 3.5 - d[0] * 16 * (1 - k), y * 16 + 3.5 - d[1] * 16 * (1 - k), 9, 9); }
  }
  if (typeof JOB !== 'undefined' && JOB && (JOB.r[3] === 'furnace' || JOB.r[3] === 'anvil') && Math.random() < .35) { const [fx, fy] = facePt(); PARTS.push({ x: fx + (Math.random() - .5) * 6, y: fy - 6, vx: (Math.random() - .5) * 60, vy: -30 - Math.random() * 50, t: .35, c: Math.random() < .5 ? '#ffb03a' : '#fff0a0' }); }
  for (const n of m.npcs || []) { // emotes
    const want = typeof stepOf === 'function' && Object.keys(STORIES).some(sid => { const st = stepOf(sid); return st && st.who === n.id && (st.t === 'talk' || st.t === 'bring'); });
    const love = S.fam && S.fam.rel && (S.fam.rel[n.id] === 'dating' || S.fam.rel[n.id] === 'married') && dist(n.x, n.y, S.p.x, S.p.y) < 40;
    if (!want && !love) continue; const bx = Math.round(n.x) - 4, by = Math.round(n.y) - 44 + Math.round(Math.sin(now * 4));
    g.fillStyle = '#2a1c18'; g.fillRect(bx - .5, by - .5, 9, 8); g.fillStyle = '#fff6e0'; g.fillRect(bx, by, 8, 7); g.fillRect(bx + 2, by + 7, 2, 1);
    if (want) { g.fillStyle = '#d8a020'; g.fillRect(bx + 3.5, by + 1, 1, 3.5); g.fillRect(bx + 3.5, by + 5, 1, 1); }
    else { g.fillStyle = '#e84a5a'; g.fillRect(bx + 1.5, by + 2, 2, 2); g.fillRect(bx + 4.5, by + 2, 2, 2); g.fillRect(bx + 2, by + 3, 4, 2); g.fillRect(bx + 3, by + 5, 2, 1); }
  }
};
if (typeof beltSprite === 'function') { // an item that just arrived slides in on the overlay instead of being baked into the belt
  const _beltSpriteA = beltSprite;
  beltSprite = function (o, f) { return o.item && o.slideT === TICK.n ? _beltSpriteA({ k: o.k, d: o.d }, f) : _beltSpriteA(o, f); };
}
