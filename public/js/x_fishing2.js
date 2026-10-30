/* More fishing (art in art/sprites/fishing_art.py).
   - In the canoe only fishing works: the rod, the harpoon, crab traps (and eating). Other tools and weapons are refused.
   - Harpoon (anvil): face deep water and use it. Aim: a big fish's shadow swims while your mark sweeps across;
     throw (click / Space) when it's over the fish, three throws. Fight: hold to reel, let go when it runs; keep the
     line's tension inside the band until it's landed. Sharks, swordfish, tuna and mantas at sea; sturgeon in rivers and lakes.
   - Crab trap (workbench): set it in water. From the next morning it holds crabs, prawns, crayfish, lobsters or snails,
     by the water it's in (its buoy rides low). Haul it: pull when the marker crosses the band; a missed pull lets one go.
   The minigames pause the game and run in their own panel (#fishgame). */
const BIGFISH = [  // id, name, price, waters, seasons, difficulty 1-5
  ['shark', 'Shark', 620, ['ocean'], [1, 2], 4], ['swordfish', 'Swordfish', 720, ['ocean'], [1, 2], 5], ['tuna', 'Bluefin Tuna', 420, ['ocean'], [0, 1, 2, 3], 3],
  ['manta', 'Manta Ray', 560, ['ocean'], [1, 2, 3], 3], ['sturgeon', 'Sturgeon', 460, ['river', 'lake'], [0, 2, 3], 3],
];
const SHELLFISH = [  // id, name, price, waters, weight
  ['mud_crab', 'Mud Crab', 70, ['ocean', 'lake', 'pond'], 3], ['prawn', 'Prawn', 45, ['ocean', 'river'], 4], ['crayfish', 'Crayfish', 40, ['river', 'lake', 'pond'], 4],
  ['rock_lobster', 'Rock Lobster', 160, ['ocean'], 1], ['river_snail', 'River Snail', 25, ['river', 'lake', 'pond'], 3],
];
for (const [id, n, p, loc, ss, d] of BIGFISH) I(id, n, 'fish', p, 'fish', '#56687c', null, { eat: [Math.round(p / 10), Math.round(p / 8)], desc: 'A big fish, caught with a harpoon', fish: { loc, s: ss, time: 'any', diff: d, w: 1, mot: 'smooth', big: 1 } });
for (const [id, n, p] of SHELLFISH) I(id, n, 'fish', p, 'fish', '#d8542a', null, { eat: [Math.round(p / 6) + 4, Math.round(p / 5) + 6], desc: 'Caught in a crab trap' });
I('harpoon', 'Harpoon', 'fishtool', 350, 'obj', '#b8bec8', null, { desc: 'Face deep water and use it to hunt big fish: sharks and swordfish at sea, sturgeon in rivers and lakes' });
I('crab_trap', 'Crab Trap', 'fishtool', 60, 'obj', '#a8743f', null, { desc: 'Set it in water. From the next morning it holds crabs, prawns or crayfish' });
SINGLE.add('fishtool'); // one per slot; traps are set one at a time anyway
RC.push(['harpoon', 1, { iron_bar: 3, wood: 5, fiber: 6 }, 'anvil'], ['crab_trap', 1, { wood: 8, fiber: 10 }, 'bench']);
recipeKnown = (f => function (r) { return r[0] === 'harpoon' || r[0] === 'crab_trap' || f(r); })(recipeKnown);
OBJ.crabtrap = { solid: 0 };

/* ---- the canoe allows fishing only ---- */
let canoeToastT = 0;
const canoeAllows = k => k === 'rod' || (IT[k] && (IT[k].t === 'fishtool' || IT[k].eat));
primaryUse = (f => function () {
  if (S && S.p && S.p.boat && !PAUSED && !TITLE && !fishing && !canoeAllows(selKind())) {
    if (gameT - canoeToastT > 2) { canoeToastT = gameT; toast('From the canoe you can only fish.'); }
    return;
  }
  return f();
})(primaryUse);
if (typeof actionAttack === 'function') actionAttack = (f => function () { if (S && S.p && S.p.boat) return; return f.apply(this, arguments); })(actionAttack);

/* ---- using the harpoon and the trap ---- */
const waterAhead = () => { const [tx, ty] = faceTile(); return (TER[getT(cur, tx, ty)] || {}).water ? [tx, ty] : null; };
useItem = (f => function (id) {
  if (id === 'harpoon') {
    if (!waterAhead()) { toast('Face deep water to use the harpoon.'); return; }
    const locs = fishLocs(), pool = BIGFISH.filter(b => b[3].some(l => locs.includes(l)) && b[4].includes(S.season));
    if (!pool.length) { toast(locs.includes('pond') ? 'Nothing big enough lives here. Try the sea, a river or a lake.' : 'Nothing big is moving this season.'); return; }
    if (S.p.st < 4) { toast('Too tired to hunt.'); return; }
    useStamina(4); startHarpoon(pickR(pool)); return;
  }
  if (id === 'crab_trap') {
    const w = waterAhead(); if (!w) { toast('Set the trap in water.'); return; }
    if (getO(cur, w[0], w[1])) { toast('Something is already there.'); return; }
    take('crab_trap'); setO(cur, w[0], w[1], { k: 'crabtrap', t: dayIndex(), loc: fishLocs()[0] || 'pond' }); SFX.splash();
    toast('Trap set. Come back tomorrow to haul it up.'); return;
  }
  return f(id);
})(useItem);

function trapReady(o) {
  if (o.catch === undefined || o.catch === null) {
    if (o.t >= dayIndex()) return false;
    const pool = SHELLFISH.filter(s => s[3].includes(o.loc)); const pl2 = pool.length ? pool : SHELLFISH.filter(s => s[3].includes('pond'));
    const n = 1 + (Math.random() < .5 ? 1 : 0) + (Math.random() < .2 ? 1 : 0);
    o.catch = []; for (let i = 0; i < n; i++) o.catch.push(wpick(pl2.map(s => [s[0], s[4]])));
  }
  return o.catch.length > 0;
}
objInteract = (f => function (m, x, y, o) {
  if (o.k !== 'crabtrap') return f(m, x, y, o);
  if (trapReady(o)) return { label: 'Haul trap', fn: () => startHaul(o) };
  return { label: 'Lift trap', fn: () => { setO(m, x, y, null); give('crab_trap', 1); toast('Nothing in it yet. Traps fill overnight.'); } };
})(objInteract);
objSprite = (f => function (o, season) { return o.k === 'crabtrap' ? PIX.get('crabtrap.' + (o.catch && o.catch.length || o.t < dayIndex() ? 1 : 0)) || f(o, season) : f(o, season); })(objSprite);

/* ---- the minigame panel ---- */
let FG = null;
function fgOpen(title) {
  let p = document.getElementById('fishgame');
  if (!p) { p = el('div', { id: 'fishgame', class: 'f-panel' }, el('b', { id: 'fgtitle' }), el('canvas', { id: 'fgcv', width: 320, height: 150 }), el('small', { id: 'fghint' })); document.body.append(p); }
  p.hidden = false; document.getElementById('fgtitle').textContent = title;
  PAUSED = true; INPUT.x = INPUT.y = 0;
}
function fgClose() { const p = document.getElementById('fishgame'); if (p) p.hidden = true; FG = null; PAUSED = !!MODAL; }
const fgDown = () => FG && (FG.hold || false);
addEventListener('mousedown', e => { if (!FG) return; e.stopImmediatePropagation(); e.preventDefault(); FG.hold = true; FG.press = true; }, true);
addEventListener('mouseup', e => { if (!FG) return; FG.hold = false; }, true);
addEventListener('keydown', e => {
  if (!FG) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) FG.press = true; FG.hold = true; }
  else if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); toast(FG.kind === 'harpoon' ? 'You lower the harpoon.' : 'You let the trap sink back.'); fgClose(); }
}, true);
addEventListener('keyup', e => { if (FG && (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E')) FG.hold = false; }, true);
function fgLoop(t0) {
  let last = performance.now();
  const step = now => { if (!FG) return; const dt = Math.min(.05, (now - last) / 1000); last = now; FG.update(dt); if (FG) { FG.draw(document.getElementById('fgcv').getContext('2d')); FG.press = false; requestAnimationFrame(step); } };
  requestAnimationFrame(step);
}
const fgHint = t => { const h = document.getElementById('fghint'); if (h && h.textContent !== t) h.textContent = t; };

/* ---- harpoon: aim, then fight ---- */
function startHarpoon(b) {
  const [id, n, , , , d] = b;
  fgOpen('Harpoon: ' + n);
  FG = {
    kind: 'harpoon', id, d, phase: 'aim', throws: 3, fx: .5, fv: .25 + d * .05, sweep: 0, sdir: 1, tension: .5, prog: .15, run: 0, runT: 1, slack: 0, flash: 0,
    update(dt) {
      if (this.phase === 'aim') {
        this.fx += this.fv * dt * (Math.random() < dt * (.6 + d * .3) ? -1 : 1); if (Math.random() < dt * (.5 + d * .25)) this.fv = -this.fv;
        if (this.fx < .1 || this.fx > .9) { this.fv = -this.fv; this.fx = clamp(this.fx, .1, .9); }
        this.sweep += this.sdir * dt * (.45 + d * .08); if (this.sweep > 1 || this.sweep < 0) { this.sdir = -this.sdir; this.sweep = clamp(this.sweep, 0, 1); }
        fgHint('Click or Space when your mark is over the fish. Throws left: ' + this.throws);
        if (this.press) {
          if (Math.abs(this.sweep - this.fx) < .07 - d * .006) { this.phase = 'fight'; SFX.bite(); this.flash = .3; }
          else { this.throws--; SFX.splash(); this.flash = -.3; if (this.throws <= 0) { toast('The ' + IT[id].n.toLowerCase() + ' dives out of reach.', 'bad'); fgClose(); } }
        }
      } else {
        this.runT -= dt; if (this.runT <= 0) { this.run = !this.run; this.runT = this.run ? .6 + Math.random() * (.6 + d * .2) : 1 + Math.random() * 1.4; }
        const reel = this.hold;
        this.tension += (reel ? (this.run ? .95 + d * .08 : .28) : (this.run ? .1 : -.45)) * dt;
        const inBand = this.tension > .3 && this.tension < .78;
        if (reel && inBand && !this.run) this.prog += (.34 - d * .025) * dt;
        if (this.run && !reel) this.prog -= (.05 + d * .01) * dt;
        this.tension = clamp(this.tension, 0, 1); this.prog = clamp(this.prog, 0, 1);
        this.slack = this.tension < .08 ? this.slack + dt : 0;
        fgHint(this.run ? 'It runs! Let the line go.' : 'Hold to reel it in. Keep the tension in the band.');
        if (this.tension >= 1) { toast('The line snaps!', 'bad'); SFX.bad(); fgClose(); return; }
        if (this.slack > 2.4) { toast('It shakes the harpoon loose.', 'bad'); fgClose(); return; }
        if (this.prog >= 1) {
          const q = typeof fishQ === 'function' ? fishQ() : 0; give(id, 1, q); S.stats.fish++; S.stats.caught = S.stats.caught || {}; S.stats.caught[id] = (S.stats.caught[id] || 0) + 1;
          addXP('fishing', 30 + d * 12); toast('You landed a ' + IT[id].n + '!', 'lvl'); SFX.lvl(); fgClose();
        }
      }
      this.flash = this.flash > 0 ? Math.max(0, this.flash - dt) : Math.min(0, this.flash + dt);
    },
    draw(x) {
      x.imageSmoothingEnabled = false;
      x.fillStyle = '#1e4a6e'; x.fillRect(0, 0, 320, 150); x.fillStyle = '#2a5e86'; for (let i = 0; i < 6; i++) x.fillRect((i * 57 + gameT * 20) % 340 - 20, 20 + i * 21, 30, 2);
      const ic = itemIcon(id);
      if (this.phase === 'aim') {
        const fx = this.fx * 280 + 20; x.globalAlpha = .55; x.filter = 'brightness(0.15)'; if (ic) x.drawImage(ic, fx - 32, 55, 64, 64); x.filter = 'none'; x.globalAlpha = 1;
        const sx = this.sweep * 280 + 20; x.strokeStyle = this.flash < 0 ? '#ff5a4a' : '#ffe08a'; x.lineWidth = 2; x.beginPath(); x.moveTo(sx, 0); x.lineTo(sx, 150); x.stroke();
        x.beginPath(); x.arc(sx, 87, 12, 0, 6.283); x.stroke();
      } else {
        if (ic) { const wob = this.run ? Math.sin(gameT * 30) * 4 : 0; x.drawImage(ic, 230 + wob - this.prog * 160, 40, 64, 64); }
        x.fillStyle = '#10202e'; x.fillRect(16, 118, 288, 14);
        x.fillStyle = '#3a8a4a'; x.fillRect(16 + .3 * 288, 118, .48 * 288, 14);
        x.fillStyle = this.tension > .78 ? '#ff5a4a' : '#ffe08a'; x.fillRect(16 + this.tension * 284, 114, 4, 22);
        x.fillStyle = '#10202e'; x.fillRect(16, 8, 288, 8); x.fillStyle = '#7affd8'; x.fillRect(16, 8, 288 * this.prog, 8);
        x.fillStyle = '#e8dcc0'; x.font = '10px Fredoka, sans-serif'; x.fillText('tension', 16, 112); x.fillText('landed', 16, 28);
      }
    },
  };
  fgLoop();
}

/* ---- hauling a trap: pull when the marker crosses the band ---- */
function startHaul(o) {
  fgOpen('Hauling the trap');
  const pulls = 3 + (o.catch.includes('rock_lobster') ? 1 : 0);
  FG = {
    kind: 'haul', o, pulls, done: 0, m: 0, mv: 1, band: .3 + Math.random() * .4, lost: [],
    update(dt) {
      this.m += this.mv * dt * (1.1 + this.done * .25); if (this.m > 1 || this.m < 0) { this.mv = -this.mv; this.m = clamp(this.m, 0, 1); }
      fgHint('Pull (click or Space) when the marker is in the green band. ' + (this.pulls - this.done) + ' pulls to go.');
      if (this.press) {
        if (Math.abs(this.m - this.band) < .09) { this.done++; SFX.ok(); }
        else { SFX.splash(); if (o.catch.length) { const g2 = o.catch.splice(Math.floor(Math.random() * o.catch.length), 1)[0]; this.lost.push(g2); toast('A ' + IT[g2].n.toLowerCase() + ' slips out of the trap.'); } this.done++; }
        this.band = .2 + Math.random() * .6;
        if (this.done >= this.pulls) {
          const got = {}; for (const k of o.catch) { give(k, 1); got[k] = (got[k] || 0) + 1; addXP('fishing', 6); }
          toast(Object.keys(got).length ? 'In the trap: ' + Object.entries(got).map(([k, n]) => n + ' ' + IT[k].n).join(', ') + '.' : 'The trap came up empty.', Object.keys(got).length ? 'lvl' : '');
          o.catch = null; o.t = dayIndex(); fgClose();
        }
      }
    },
    draw(x) {
      x.fillStyle = '#1e4a6e'; x.fillRect(0, 0, 320, 150);
      const depth = 1 - this.done / this.pulls, ty = 30 + depth * 80;
      x.strokeStyle = '#e8dcc0'; x.lineWidth = 2; x.beginPath(); x.moveTo(110, 0); x.lineTo(110, ty); x.stroke();
      const ic = itemIcon('crab_trap'); if (ic) x.drawImage(ic, 86, ty - 8, 48, 48);
      x.fillStyle = '#10202e'; x.fillRect(250, 10, 24, 130);
      x.fillStyle = '#3a8a4a'; x.fillRect(250, 10 + (this.band - .09) * 130, 24, .18 * 130);
      x.fillStyle = '#ffe08a'; x.fillRect(246, 10 + this.m * 128, 32, 3);
    },
  };
  fgLoop();
}
