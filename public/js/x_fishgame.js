/* ================= Fishing minigames: steer the hook, reel it in; harpoon and trap art (asked 2026-11-05) =================
   - Rod fishing: on a bite, an underwater view opens (mgOpen, painted lake mg_under). 4-6 fish swim about, picked with the
     game's own chooseFish for this water, season, time and your skill, so any of them can be caught here. Steer the hook with
     the mouse (it follows at the rod's speed); harder fish dart away from it, easy ones drift towards the bait. Touch a fish's
     mouth to hook it (18 s, then they lose interest). Then the old reel runs in the same window: hold (mouse or Space) to lift
     the net zone, keep the fish inside until the catch bar fills; same formulas as updateFishing (zone size from Fishing
     level, rod, perks; treasure chests). `fishing` stays set (phase 'mg') so the tournament weighs the catch.
   - Harpoon and crab traps keep their rules (x_fishing2.js) and get painted scenes (mg_harpoon, mg_haul) and drawn gauges;
     their canvas is drawn at 3x. */
const FISHG = { tw: 18 };
const FISH_ART = {};
// a painted fish (facing right), its back third swinging as a tail; returns false when this fish has no painting
function drawFishArt(c, id, x, y, w, dir, a, wag) {
  const P = fishArt(id); if (!P) return false;
  const h = w * P.height / P.width, cut = .34, W = P.width, H = P.height, sw = Math.sin(wag || 0) * .28, tx = -w / 2 + w * cut;
  c.save(); c.translate(x, y); c.scale(dir, 1); if (a) c.rotate(a * dir); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.save(); c.translate(tx, 0); c.rotate(sw); c.drawImage(P, 0, 0, W * cut, H, -w * cut, -h / 2, w * cut + .5, h); c.restore();
  c.drawImage(P, W * cut, 0, W * (1 - cut), H, tx, -h / 2, w * (1 - cut), h); c.restore(); return true;
}
let FISH_LIST = null; fetch('art/fish/fish.json').then(r => r.ok ? r.json() : []).then(a => { FISH_LIST = new Set(a); }).catch(() => { FISH_LIST = new Set(); });
const fishArt = id => { if (!FISH_LIST || !FISH_LIST.has(id)) return null; let i = FISH_ART[id]; if (!i) { i = FISH_ART[id] = new Image(); i.onerror = () => { i.bad = 1; }; i.src = 'art/fish/' + id + '.png'; } return i.complete && i.naturalWidth && !i.bad ? i : null; };
updateFishing = (f => function (dt) { if (fishing && fishing.phase === 'mg') return; return f.apply(this, arguments); })(updateFishing);
fishAct = (f => function () {
  if (!fishing || fishing.phase !== 'bite') return f.apply(this, arguments);
  const locs = fishing.locs; fishing = { phase: 'mg', locs }; fishGame(locs);
})(fishAct);
function fishGame(locs) {
  const pool = []; for (let i = 0; i < 12 && pool.length < 6; i++) { const id = chooseFish(locs); if (id && IT[id] && IT[id].fish && (pool.filter(x => x === id).length < 2)) pool.push(id); }
  if (!pool.length) { fishing = null; toast('Nothing bites here.'); return; }
  while (pool.length < 4) pool.push(pool[pool.length % pool.length]);
  const rod = (S.tools && S.tools.rod) || 1, L = lifeL('fishing');
  const fishes = pool.map((id, i) => { const F = IT[id].fish, d = F.diff || 1, sz = Math.max(18, Math.min(44, 16 + Math.sqrt(IT[id].p || 30) * 1.4));
    return { id, d, mot: F.mot, sz, x: 30 + Math.random() * 300, y: 40 + Math.random() * 80, dir: Math.random() < .5 ? -1 : 1, sp: 14 + d * 6 + Math.random() * 8, ph: Math.random() * 6, flee: 0 }; });
  const G = { phase: 'steer', hx: 180, hy: 6, t: 0, fishes, f: null, msg: '', flash: 0, bub: [] };
  const done = () => { fishing = null; mgClose(); };
  const hookSpd = 70 + rod * 12, reach = 7 + rod;
  mgOpen({ title: 'Fishing', hint: 'Steer the hook with the mouse to a fish’s mouth. Any of these can be caught here.', w: 360, h: 150,
    buttons: [['Let it go', () => { toast('You reel in the line.'); done(); }, 'ghost']],
    cancel: () => { toast('You reel in the line.'); done(); },
    setup: M => { M.G = G; M.top.append(el('span', null, 'Fishing ' + L + ' · ' + [...new Set(pool)].map(id => IT[id].n).join(', '))); },
    update: (dt, M) => {
      G.t += dt; G.flash = Math.max(0, G.flash - dt);
      if (Math.random() < dt * 3) G.bub.push({ x: Math.random() * 360, y: 150, v: 10 + Math.random() * 20, t: 5 });
      for (const b of G.bub) { b.y -= b.v * dt; b.t -= dt; } G.bub = G.bub.filter(b => b.t > 0 && b.y > 8);
      if (G.phase === 'steer') {
        const m = M.mouse || { x: 180, y: 75 }, dx = m.x - G.hx, dy = m.y - G.hy, dd = Math.hypot(dx, dy), st = Math.min(dd, hookSpd * dt);
        if (dd > .5) { G.hx += dx / dd * st; G.hy = Math.max(8, Math.min(138, G.hy + dy / dd * st)); }
        for (const F of G.fishes) {
          const fx = F.x - G.hx, fy = F.y - G.hy, near = Math.hypot(fx, fy);
          if (near < 40 && F.d >= 3 && Math.random() < dt * F.d * .5) { F.flee = .8; F.dir = fx > 0 ? 1 : -1; }   // shy fish dart off
          let v = F.sp * (F.flee > 0 ? 2.6 : 1); F.flee -= dt;
          if (near < 70 && F.d < 3 && F.flee <= 0) { F.dir = fx > 0 ? -1 : 1; v *= .6; F.y += Math.sign(G.hy - F.y) * 8 * dt; }   // easy ones come for the bait
          F.x += F.dir * v * dt; F.y += Math.sin(G.t * (1 + F.d * .3) + F.ph) * 10 * dt;
          if (F.x < 14) { F.x = 14; F.dir = 1; } if (F.x > 346) { F.x = 346; F.dir = -1; } F.y = Math.max(24, Math.min(126, F.y));
          if (Math.random() < dt * .25) F.dir = -F.dir;
          const mx = F.x + F.dir * F.sz * (fishArt(F.id) ? .88 : .42), my = F.y;   // the mouth
          if (Math.hypot(mx - G.hx, my - G.hy) < reach) { hookFish(F); break; }
        }
        if (G.t > FISHG.tw && G.phase === 'steer') { toast('The fish lose interest.'); done(); }
      } else if (G.phase === 'reel') reelStep(dt, M);
      else if (G.phase === 'end') { G.et += dt; if (G.et > 1.1) done(); }
    },
    press: () => {}, draw: c => fishDraw(c) });
  function hookFish(F) {
    const id = F.id, D = F.d;
    G.phase = 'reel'; G.hooked = F; SFX.bite(); G.msg = 'Hooked: ' + IT[id].n + '!'; G.flash = 1.2;
    G.f = { id, diff: D, mot: F.mot, pos: .5, v: 0, tgt: .5, zone: .5, zv: 0, prog: .3, t: 0, treasure: Math.random() < .05 + (hasPerk('diver') ? .15 : 0) + PS.luck * .02, tp: .2 + Math.random() * .6, tprog: 0 };
    MG.p.querySelector('.mgh').textContent = 'Hold the mouse or Space to lift the net; keep the fish inside it until the catch bar fills.';
  }
  function reelStep(dt, M) {
    const f = G.f; f.t += dt;
    const zs = Math.min(.5, (.2 + S.sk.fishing.l * .015 + (rod - 1) * .03) * (hasPerk('patient') ? 1.25 : 1) * (S.bonus.fishzone ? 1.2 : 1) * (S.buffs.some(b => b.fish) ? 1.15 : 1)), D = f.diff;
    if (f.mot === 'dart') { if (Math.random() < dt * (1 + D * .6)) f.tgt = clamp(Math.random(), .05, .95); }
    else if (f.mot === 'sinker') { if (Math.random() < dt * (.7 + D * .4)) f.tgt = clamp(Math.random() * .6, .05, .95); }
    else if (f.mot === 'floater') { if (Math.random() < dt * (.7 + D * .4)) f.tgt = clamp(.4 + Math.random() * .6, .05, .95); }
    else f.tgt = .5 + Math.sin(f.t * (.8 + D * .35)) * .42;
    f.v += (f.tgt - f.pos) * dt * (2 + D * 1.6); f.v *= .9; f.pos = clamp(f.pos + f.v * dt * 3, 0, 1);
    f.zv += (M.hold ? 2.7 : -2.3) * dt; f.zv *= .9; f.zone = clamp(f.zone + f.zv * dt * 2, zs / 2, 1 - zs / 2); if (f.zone <= zs / 2 || f.zone >= 1 - zs / 2) f.zv *= -.3;
    const inZ = Math.abs(f.pos - f.zone) < zs / 2; f.prog = clamp(f.prog + (inZ ? .3 : -.2 - D * .025) * dt, 0, 1); f.zs = zs; f.inZ = inZ;
    if (f.treasure && f.tprog < 1 && Math.abs(f.tp - f.zone) < zs / 2) f.tprog = Math.min(1, f.tprog + dt * .5);
    if (f.prog >= 1) {
      const q = typeof fishQ === 'function' ? fishQ() : 0;
      give(f.id, 1, q); S.stats.fish++; addXP('fishing', 8 + D * 9); toast('You caught a ' + IT[f.id].n + '!' + (IT[f.id].fish.legend ? ' A legend!' : ''), 'lvl'); SFX.lvl();
      if (f.tprog >= 1) { toast('Treasure chest!', 'lvl'); lootTable(2 + Math.floor(S.sk.fishing.l / 3), 1).forEach(([id, n]) => give(id, n)); }
      G.phase = 'end'; G.et = 0; G.msg = 'Caught!'; G.flash = 1.2;
    } else if (f.prog <= 0) { toast('It slipped away.', 'bad'); G.phase = 'end'; G.et = 0; G.msg = 'It slipped away'; G.flash = 1.2; }
  }
  function fishSprite(c, id, x, y, sz, dir, a, wag) {
    if (drawFishArt(c, id, x, y, sz * 1.9, dir, a, wag)) return;
    const ic = itemIcon(id); if (!ic) return; c.save(); c.translate(x, y); c.scale(-dir, 1); if (a) c.rotate(a); c.imageSmoothingEnabled = !!ic.hi; c.rotate(-Math.PI / 4); c.drawImage(ic, -sz / 2, -sz / 2, sz, sz); c.restore();
  }
  function fishDraw(c) {
    mgDrawScene(c, 'under', 0, 0, 360, 150, '#1e5a6e');
    for (const b of G.bub) { c.strokeStyle = 'rgba(220,250,255,.5)'; c.lineWidth = .8; c.beginPath(); c.arc(b.x, b.y, 1.6, 0, Math.PI * 2); c.stroke(); }
    if (G.phase === 'steer') {
      for (const F of G.fishes) { c.fillStyle = 'rgba(0,20,30,.18)'; c.beginPath(); c.ellipse(F.x, 138, F.sz * .4, 2.5, 0, 0, Math.PI * 2); c.fill(); fishSprite(c, F.id, F.x, F.y, F.sz, F.dir, Math.sin(G.t * 2 + F.ph) * .05, G.t * (F.flee > 0 ? 18 : 7) + F.ph); }
      c.strokeStyle = 'rgba(240,240,230,.7)'; c.lineWidth = .8; c.beginPath(); c.moveTo(180, 0); c.quadraticCurveTo(180, G.hy * .5, G.hx, G.hy); c.stroke();
      c.strokeStyle = '#d8d0c0'; c.lineWidth = 1.6; c.beginPath(); c.arc(G.hx, G.hy + 3, 3, 0, Math.PI); c.stroke(); c.fillStyle = '#e04a2a'; c.beginPath(); c.arc(G.hx, G.hy - 3, 2, 0, Math.PI * 2); c.fill();
      const left = Math.max(0, FISHG.tw - G.t); mgBar(c, 8, 8, 60, 4, left / FISHG.tw, left < 5 ? '#ff7a5a' : '#9ad8e8');
    } else if (G.f) {
      const f = G.f, F = G.hooked, by = 14, bh = 122, bx = 300, bw = 22;
      // the hooked fish fighting in the middle, on the line
      const fy = 30 + (1 - f.pos) * 90, fx = 150 + Math.sin(G.t * 9) * (f.inZ ? 3 : 10);
      c.strokeStyle = 'rgba(240,240,230,.75)'; c.lineWidth = .9; c.beginPath(); c.moveTo(180, 0); c.lineTo(fx, fy); c.stroke();
      fishSprite(c, F.id, fx, fy, F.sz * 1.4, F.dir, Math.sin(G.t * 14) * (f.inZ ? .06 : .25), G.t * 16);
      // the gauge: a strip of the painted lake in a wooden frame
      c.fillStyle = '#3a2416'; c.fillRect(bx - 4, by - 4, bw + 8, bh + 8); c.fillStyle = '#6a4426'; c.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      c.save(); c.beginPath(); c.rect(bx, by, bw, bh); c.clip(); if (!mgDrawScene(c, 'reel', bx, by, bw, bh, '#1e5a6e')) {} c.restore();
      const zy = by + (1 - f.zone - f.zs / 2) * bh, zh = f.zs * bh;
      c.fillStyle = f.inZ ? 'rgba(130,230,110,.55)' : 'rgba(130,230,110,.32)'; c.fillRect(bx, zy, bw, zh); c.strokeStyle = '#d8f8c0'; c.lineWidth = 1; c.strokeRect(bx + .5, zy + .5, bw - 1, zh - 1);
      for (let k = 1; k < 4; k++) { c.strokeStyle = 'rgba(220,250,210,.35)'; c.beginPath(); c.moveTo(bx, zy + zh * k / 4); c.lineTo(bx + bw, zy + zh * k / 4); c.stroke(); }   // the net
      fishSprite(c, f.id, bx + bw / 2, by + (1 - f.pos) * bh, 12, 1, 0, G.t * 12);
      if (f.treasure) { c.fillStyle = f.tprog >= 1 ? '#f0c040' : '#8a5a2a'; c.fillRect(bx + bw / 2 - 5, by + (1 - f.tp) * bh - 4, 10, 8); c.fillStyle = '#3a2416'; c.fillRect(bx + bw / 2 - 5, by + (1 - f.tp) * bh - 1, 10, 1); mgBar(c, bx + bw + 8, by + bh - 40, 4, 40, f.tprog, '#f0c040'); }
      // the catch bar beside it
      c.fillStyle = '#3a2416'; c.fillRect(bx - 16, by - 4, 10, bh + 8); c.fillStyle = '#1a1008'; c.fillRect(bx - 14, by - 2, 6, bh + 4);
      const ph = f.prog * (bh + 4); c.fillStyle = f.prog > .66 ? '#7cd05a' : f.prog > .33 ? '#e8c050' : '#e06a3a'; c.fillRect(bx - 14, by - 2 + bh + 4 - ph, 6, ph);
    }
    if (G.flash > 0 && G.msg) mgText(c, G.msg, 150, 22, G.msg === 'It slipped away' ? '#ff9a7a' : '#ffe08a', 14);
  }
}

/* ---- the harpoon and the trap: painted scenes, drawn at 3x ---- */
fgOpen = (f => function (title) {
  const r = f.apply(this, arguments); const cv = document.getElementById('fgcv');
  if (cv && cv.width !== 960) { cv.width = 960; cv.height = 450; }
  return r;
})(fgOpen);
function fgFrame(x, name) { x.setTransform(3, 0, 0, 3, 0, 0); x.imageSmoothingEnabled = false; mgDrawScene(x, name, 0, 0, 320, 150, '#1e4a6e'); }
function fgGauge(x, X, Y, W, H, fill, col, band) {
  x.fillStyle = '#3a2416'; x.fillRect(X - 3, Y - 3, W + 6, H + 6); x.fillStyle = '#1a1008'; x.fillRect(X, Y, W, H);
  if (band) { x.fillStyle = 'rgba(110,210,90,.75)'; x.fillRect(X + band[0] * W, Y, (band[1] - band[0]) * W, H); }
  if (fill !== null) { x.fillStyle = col; x.fillRect(X, Y, W * fill, H); }
  x.fillStyle = 'rgba(255,230,180,.25)'; x.fillRect(X, Y, W, 1);
}
startHarpoon = (f => function (b) {
  const r = f.apply(this, arguments); if (!FG || FG.kind !== 'harpoon') return r;
  const H = FG, id = H.id;
  H.draw = function (x) {
    fgFrame(x, 'harpoon');
    const ic = itemIcon(id), msg = this.msgT > 0 ? this.msg : null;
    if (this.phase === 'aim') {
      const fx = this.fx * 280 + 20, fy = 84;
      x.save(); x.globalAlpha = .5; x.filter = 'brightness(0.12) blur(1px)';   // the fish's shadow under the waves
      if (!drawFishArt(x, id, fx, fy, 84, this.fv > 0 ? 1 : -1, 0, gameT * 5)) { x.fillStyle = '#000'; x.beginPath(); x.ellipse(fx, fy, 30, 8, 0, 0, 6.283); x.fill(); }
      x.restore(); x.filter = 'none'; x.globalAlpha = 1;
      x.strokeStyle = 'rgba(232,248,255,.4)'; x.lineWidth = 1; x.beginPath(); x.ellipse(fx, fy, 30 + Math.sin(gameT * 4) * 2, 9, 0, 0, 6.283); x.stroke();
      const sx = this.sweep * 280 + 20;
      x.strokeStyle = this.flash < 0 ? '#ff5a4a' : '#ffe08a'; x.lineWidth = 1.5; x.beginPath(); x.arc(sx, fy, 10, 0, 6.283); x.stroke(); x.beginPath(); x.moveTo(sx - 14, fy); x.lineTo(sx + 14, fy); x.moveTo(sx, fy - 14); x.lineTo(sx, fy + 14); x.stroke();
      x.save(); x.translate(160, 150); x.rotate(Math.atan2(fy - 150, sx - 160) + Math.PI / 2); x.fillStyle = '#6a4a2a'; x.fillRect(-1.5, -40, 3, 40); x.fillStyle = '#b0b8c0'; x.beginPath(); x.moveTo(0, -50); x.lineTo(-4, -40); x.lineTo(4, -40); x.fill(); x.restore();   // the harpoon in your hands
      x.fillStyle = 'rgba(20,12,8,.6)'; x.fillRect(8, 8, 74, 12); x.font = '9px Fredoka, sans-serif'; x.fillStyle = '#f4e8d0'; x.textAlign = 'left'; x.fillText('Throws left: ' + this.throws, 12, 17);
    } else {
      const fx = 230 - this.prog * 150, fy = 70 + Math.sin(gameT * 3) * 4, wob = this.run ? Math.sin(gameT * 30) * 4 : 0;
      x.strokeStyle = this.tension > .78 ? '#ff8a6a' : 'rgba(240,235,220,.85)'; x.lineWidth = 1; x.beginPath(); x.moveTo(160, 150); x.quadraticCurveTo(160 + (fx - 160) * .5, 110 - this.tension * 40, fx, fy); x.stroke();
      if (this.run) for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,255,255,.7)'; x.fillRect(fx + (Math.random() - .5) * 40, fy + 10 + Math.random() * 6, 2, 2); }
      if (!drawFishArt(x, id, fx + wob, fy, 80, -1, this.run ? Math.sin(gameT * 20) * .25 : -.15, gameT * (this.run ? 22 : 9)) && ic) { x.save(); x.translate(fx + wob, fy); x.rotate(-Math.PI / 4 + (this.run ? Math.sin(gameT * 20) * .2 : 0)); x.imageSmoothingEnabled = !!ic.hi; x.drawImage(ic, -30, -30, 60, 60); x.restore(); }
      fgGauge(x, 40, 128, 240, 10, null, null, [.3, .78]); x.fillStyle = this.tension > .78 ? '#ff5a4a' : '#ffe08a'; x.fillRect(40 + this.tension * 238, 124, 3, 18);
      fgGauge(x, 40, 10, 240, 6, this.prog, '#7affd8');
      x.font = '8px Fredoka, sans-serif'; x.fillStyle = '#f4e8d0'; x.textAlign = 'left'; x.fillText('tension', 42, 124); x.fillText('landed', 42, 24);
    }
    if (msg) { x.font = '700 15px Fredoka, sans-serif'; x.textAlign = 'center'; x.lineWidth = 3; x.strokeStyle = '#10202e'; x.strokeText(msg, 160, 50); x.fillStyle = msg === 'Hit!' ? '#7affb0' : '#ffb08a'; x.fillText(msg, 160, 50); x.textAlign = 'left'; }
  };
  return r;
})(startHarpoon);
startHaul = (f => function (o) {
  const r = f.apply(this, arguments); if (!FG || FG.kind !== 'haul') return r;
  FG.draw = function (x) {
    fgFrame(x, 'haul');
    const depth = 1 - this.done / this.pulls, ty = 52 + depth * 70, rx = 84;
    x.strokeStyle = '#c8a870'; x.lineWidth = 2; x.beginPath(); x.moveTo(rx, 44); x.quadraticCurveTo(rx + Math.sin(gameT * 2) * 4, (44 + ty) / 2, rx + 6, ty); x.stroke();
    x.strokeStyle = 'rgba(80,50,20,.6)'; x.lineWidth = .7; for (let y = 48; y < ty; y += 4) { x.beginPath(); x.moveTo(rx - 1, y); x.lineTo(rx + 2, y + 2); x.stroke(); }   // the twist of the rope
    const ic = itemIcon('crab_trap'); if (ic) { x.save(); x.globalAlpha = depth > .6 ? .55 : .9; x.imageSmoothingEnabled = !!ic.hi; x.drawImage(ic, rx - 18, ty - 8, 48, 48); x.restore(); }
    x.fillStyle = 'rgba(200,240,255,.12)'; x.fillRect(0, 46, 320, 2);
    // the pull gauge: a brass rule with a moving marker
    x.fillStyle = '#5a3a1a'; x.fillRect(262, 40, 30, 104); x.fillStyle = '#c89a4a'; x.fillRect(265, 43, 24, 98);
    x.fillStyle = '#2a1a0c'; x.fillRect(268, 46, 18, 92); x.fillStyle = 'rgba(110,210,90,.85)'; x.fillRect(268, 46 + (this.band - .11) * 92, 18, .22 * 92);
    x.fillStyle = '#ffe08a'; x.fillRect(264, 46 + this.m * 90, 26, 2);
    for (let i = 0; i < this.pulls; i++) { x.fillStyle = i < this.done ? '#f0b030' : '#3a2a22'; x.fillRect(180 + i * 16, 140, 12, 6); }
  };
  return r;
})(startHaul);
document.head.append(el('style', null, `#fishgame canvas { width: min(720px, calc(100vw - 60px)) !important; height: auto !important; aspect-ratio: 320 / 150; image-rendering: auto !important; }`));
