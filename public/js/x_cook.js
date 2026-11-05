/* ================= Cooking: a minigame, dish quality and meal buffs (asked 2026-11-05) =================
   - Cooking at a kitchen (stove, fireplace, campfire, tavern) opens a short minigame for the whole batch, on a painted
     hearth (mg_cook): each ingredient (3-6 drops) is added by clicking while the heat dial's needle is in the green band
     (centre 1, band 1/2, else 0). The average sets the quality (cookQ): Plain, Tasty, Delicious, Exquisite (COOKQ), capped by
     Cooking level (Delicious from 20, Exquisite from 40). Quick cook skips it (Plain).
   - A cooked dish of a quality is its own item `<dish>@q<n>`: a non-enumerable IT entry whose prototype is the plain dish,
     restoring more and with a longer buff, and worth more (registered for every dish once all scripts have run).
   - Every dish now gives a buff when eaten (dishes without one get one by what they are, DISH_BUFF); quality multiplies
     how long it lasts. Eating a dish replaces the buff of the same dish at any quality. */
const COOKQ = [
  { n: 'Plain', col: '#e8dcc0', eat: 1, dur: 1, p: 1 },
  { n: 'Tasty', col: '#7cd05a', eat: 1.1, dur: 1.5, p: 1.15 },
  { n: 'Delicious', col: '#5aa8f0', eat: 1.2, dur: 2, p: 1.35 },
  { n: 'Exquisite', col: '#f0b030', eat: 1.35, dur: 3, p: 1.7 }];
// a buff for every dish that has none, by what it is (seconds of play)
const DISH_BUFF = [
  [/fish|sushi|eel|chowder|smoked|clam|crab|prawn|lobster|oyster|kelp/, { fish: 1, dur: 180 }],
  [/roast|meat|steak|bacon|sausage|jerky|kebab|ham|feast|chop|ribs|burger/, { atk: 3, dur: 180 }],
  [/stew|soup|broth|curry|porridge|risotto/, { regen: 1, dur: 180 }],
  [/pie|pasty/, { mine: 1, dur: 180 }],
  [/cake|tart|cookie|muffin|pudding|jam|sorbet|candy|sweet|honey/, { luck: 1, dur: 180 }],
  [/salad|skewer|veg|greens|wrap/, { spd: .1, dur: 180 }],
  [/bread|toast|pancake|bun|loaf|omelette|egg|biscuit|roll/, { def: 2, dur: 180 }]];
const dishBase = id => (id && IT[id] && IT[id].cq !== undefined) ? IT[id].base : id;
function giveBuffs() {
  for (const id in IT) { const it = IT[id]; if (!it || it.t !== 'food' || it.buff || !it.eat) continue;
    const key = (id + ' ' + (it.n || '')).toLowerCase(); const m = DISH_BUFF.find(([re]) => re.test(key)); it.buff = Object.assign({}, m ? m[1] : { maxhp: 10, dur: 180 }); }
}
function registerDish(id, q) {
  const B = IT[id]; if (!B || q < 1) return id; const vid = id + '@q' + q; if (IT[vid] && IT[vid].base === id) return vid;
  const Q = COOKQ[q], it = Object.create(B);
  Object.assign(it, { id: vid, base: id, cq: q, n: Q.n + ' ' + B.n });
  Object.defineProperty(it, 'p', { get: () => Math.max(1, Math.round((B.p || 1) * Q.p)), enumerable: true });
  Object.defineProperty(it, 'eat', { get: () => B.eat && [Math.round(B.eat[0] * Q.eat), Math.round(B.eat[1] * Q.eat)], enumerable: true });
  Object.defineProperty(it, 'buff', { get: () => B.buff && Object.assign({}, B.buff, { dur: Math.round(B.buff.dur * Q.dur) }), enumerable: true });
  Object.defineProperty(it, 'desc', { get: () => Q.n + ' cooking: restores more and its buff lasts ' + Q.dur + '× as long' + (B.desc ? '. ' + B.desc : ''), enumerable: true });
  Object.defineProperty(IT, vid, { value: it, enumerable: false, configurable: true, writable: true });
  return vid;
}
addEventListener('DOMContentLoaded', () => { try { giveBuffs(); for (const id of Object.keys(IT)) if (IT[id].t === 'food') for (let q = 1; q < 4; q++) registerDish(id, q); } catch (e) { console.error(e); } });
itemIcon = (f => function (id) { return f.call(this, dishBase(id)); })(itemIcon);
// one buff per dish, whatever its quality
eat = (f => function (id) {
  const b = dishBase(id); if (S && S.buffs && IT[id] && IT[id].buff) S.buffs = S.buffs.filter(x => dishBase(x.id) !== b);
  return f.apply(this, arguments);
})(eat);

/* ---- the cooking minigame ---- */
let COOK_PASS = false;
// add each ingredient at the right heat (asked 2026-11-05: proper art and a nice system, like the forge). A needle swings
// over the heat dial; click when it's in the green: the centre counts 1, the rest of the band 1/2. The sum over the
// ingredients sets the quality, capped by Cooking: Delicious from 20, Exquisite from 40.
const cookQ = (sc, L) => Math.min(sc < .5 ? 0 : sc < .72 ? 1 : sc < .9 ? 2 : 3, L < 20 ? 1 : L < 40 ? 2 : 3);
const cookIcon = k => k[0] !== '$' ? k : (S.pack.map(s => s && parseK(s.k)[0]).find(id => id && IT[id] && CATF[k] && CATF[k](id)) || Object.keys(IT).find(id => CATF[k] && CATF[k](id)));
function cookGame(r, n) {
  const it = IT[r[0]], L = lifeL('cooking'), kinds = Object.keys(r[2]).map(cookIcon).filter(Boolean);
  const drops = []; while (drops.length < Math.max(3, Math.min(6, kinds.length))) drops.push(kinds[drops.length % kinds.length]);
  const zw = Math.max(.12, Math.min(.3, .17 + L * .0015 - kinds.length * .01)), spd = 1.1 + kinds.length * .12;
  const G = { phase: 'prep', i: 0, sc: 0, res: [], ang: 0, dir: 1, zc: .5, fall: null, sp: [], t: 0, msg: '', flash: 0, wait: 0 };
  const newZone = () => { G.zc = .2 + Math.random() * .6; G.wait = 0; };
  const finish = q => { mgClose(); cookStart(r, n, q); };
  const add = v => {
    G.res.push(v); G.sc += v; G.msg = v === 1 ? 'Perfect!' : v ? 'Good' : 'Too ' + (G.ang > G.zc ? 'hot' : 'cold') + '!'; G.flash = .5;
    G.fall = { id: drops[G.i], x: 132, y: 34, t: 0 }; snd(v === 1 ? 880 : v ? 660 : 240, .06, 'sine', .05);
    G.i++; if (G.i >= drops.length) { G.phase = 'done'; G.q = cookQ(G.sc / drops.length, L); G.dt = 0; } else newZone();
  };
  mgOpen({ title: 'Cooking ' + it.n + (n > 1 ? ' ×' + n : ''), hint: 'Click (or Space) when the needle is in the green to add each ingredient. The centre of the band is best.', w: 360, h: 150,
    buttons: [['Quick cook (Plain)', () => finish(0), 'ghost'], ['Cancel', () => mgClose(), 'ghost']],
    setup: M => { M.G = G; M.top.append(el('span', null, 'Cooking ' + L + ' · ' + drops.length + ' ingredients' + (n > 1 ? ' · one quality for the batch' : ''))); newZone(); },
    press: () => {
      if (G.phase === 'prep') { G.phase = 'cook'; return; }
      if (G.phase !== 'cook') return;
      const d = Math.abs(G.ang - G.zc); add(d <= zw * .2 ? 1 : d <= zw / 2 ? .5 : 0);
    },
    update: dt => {
      G.t += dt; G.flash = Math.max(0, G.flash - dt);
      if (G.phase === 'cook') { G.ang += G.dir * spd * dt * (1 + G.i * .08); if (G.ang > 1) { G.ang = 1; G.dir = -1; } if (G.ang < 0) { G.ang = 0; G.dir = 1; } G.wait += dt; if (G.wait > 6) add(0); }
      if (G.fall) { G.fall.t += dt; G.fall.y += 160 * dt; if (G.fall.y > 82) { for (let i = 0; i < 10; i++) G.sp.push({ x: 160 + (Math.random() - .5) * 20, y: 82, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 50, t: .5 }); G.fall = null; } }
      for (const q of G.sp) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 200 * dt; } G.sp = G.sp.filter(q => q.t > 0);
      if (G.phase === 'done') { G.dt += dt; if (G.dt > 1.2) finish(G.q); }
    },
    draw: c => {
      mgDrawScene(c, 'cook');
      // steam from the pot
      for (let i = 0; i < 6; i++) { const k = (G.t * .35 + i / 6) % 1; c.fillStyle = 'rgba(255,255,255,' + (.18 * (1 - k)) + ')'; c.beginPath(); c.arc(158 + Math.sin(G.t * 2 + i) * 8 * k, 70 - k * 60, 4 + k * 10, 0, Math.PI * 2); c.fill(); }
      for (const q of G.sp) { c.fillStyle = 'rgba(200,230,255,' + Math.min(1, q.t * 2) + ')'; c.fillRect(q.x, q.y, 2, 2); }
      if (G.fall) { const ic = itemIcon(G.fall.id); if (ic) { c.save(); c.translate(G.fall.x + 26 * Math.min(1, G.fall.t * 3), G.fall.y); c.rotate(G.fall.t * 6); c.imageSmoothingEnabled = !!ic.hi; c.drawImage(ic, -10, -10, 20, 20); c.restore(); } }
      // the ingredients still to add, on the worktop
      c.fillStyle = 'rgba(40,24,14,.55)'; c.fillRect(6, 116, 22 * drops.length + 6, 28);
      drops.forEach((id, i) => { const ic = itemIcon(id); if (!ic) return; c.globalAlpha = i < G.i ? .25 : 1; c.imageSmoothingEnabled = !!ic.hi; c.drawImage(ic, 9 + i * 22, 119, 20, 20); c.globalAlpha = 1;
        const v = G.res[i]; if (v !== undefined) { c.fillStyle = v === 1 ? '#f0b030' : v ? '#c8a878' : '#9a3a2a'; c.fillRect(11 + i * 22, 139, 16, 3); } if (i === G.i && G.phase === 'cook') { c.strokeStyle = '#ffe08a'; c.lineWidth = 1.5; c.strokeRect(8 + i * 22, 118, 22, 22); } });
      // the heat dial
      const cx = 306, cy = 92, R = 40, A = t => Math.PI + t * Math.PI;
      c.fillStyle = 'rgba(30,18,12,.75)'; c.beginPath(); c.arc(cx, cy, R + 8, Math.PI, 0); c.fill(); c.fillRect(cx - R - 8, cy, 2 * R + 16, 12);
      for (let k = 0; k < 40; k++) { const t = k / 40; c.strokeStyle = `rgb(${Math.round(80 + 175 * t)},${Math.round(150 - 90 * t)},${Math.round(200 - 170 * t)})`; c.lineWidth = 8; c.beginPath(); c.arc(cx, cy, R, A(t), A(t + 1 / 40) + .01); c.stroke(); }
      if (G.phase !== 'prep') { c.strokeStyle = 'rgba(110,220,90,.9)'; c.lineWidth = 11; c.beginPath(); c.arc(cx, cy, R, A(G.zc - zw / 2), A(G.zc + zw / 2)); c.stroke(); c.strokeStyle = '#eaffc8'; c.lineWidth = 11; c.beginPath(); c.arc(cx, cy, R, A(G.zc - zw * .2), A(G.zc + zw * .2)); c.stroke(); }
      const na = A(G.ang); c.strokeStyle = '#1a0e08'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(na) * (R + 4), cy + Math.sin(na) * (R + 4)); c.stroke();
      c.strokeStyle = '#ffe8b0'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(na) * (R + 3), cy + Math.sin(na) * (R + 3)); c.stroke(); c.fillStyle = '#c89a4a'; c.beginPath(); c.arc(cx, cy, 4, 0, Math.PI * 2); c.fill();
      mgText(c, 'heat', cx, cy + 12, '#f4e8d0', 9);
      if (G.phase === 'prep') { c.fillStyle = 'rgba(18,12,10,.6)'; c.fillRect(60, 40, 180, 26); mgText(c, 'Click (or Space) to start', 150, 58, '#f4e8d0', 13); }
      if (G.flash > 0) mgText(c, G.msg, 160, 24, G.msg === 'Perfect!' ? '#ffe08a' : G.msg === 'Good' ? '#f4e8d0' : '#ff9a7a', 15);
      if (G.phase === 'done') { const Q = COOKQ[G.q]; c.fillStyle = 'rgba(18,12,10,.65)'; c.fillRect(80, 40, 200, 32); mgText(c, Q.n + '!', 180, 62, Q.col, 20); }
    } });
}
// a batch with a quality: its job turns each plain dish it makes into the dish of that quality
function cookStart(r, n, q) {
  COOK_PASS = true; try { doCraft(r, n); } finally { COOK_PASS = false; }
  if (JOB && JOB.r === r) JOB.cq = q;
  else if (q) toast('Cooked plain: the batch didn’t start.', 'bad');
}
doCraft = (f => function (r, n = 1) {
  if (COOK_PASS || JOB_RUN || !r || r[3] !== 'kitchen' || !IT[r[0]] || IT[r[0]].t !== 'food' || typeof JOB === 'undefined' || JOB) return f.apply(this, arguments);
  const why = canCraft(r); if (why) { toast(why, 'bad'); return; }
  cookGame(r, Math.max(1, Math.min(n, typeof maxCraftable === 'function' ? maxCraftable(r) || 1 : n)));
})(doCraft);
jobStep = (f => function () {
  const J = JOB, q = J && J.cq, id = J && J.r[0], n0 = q ? cnt(id) : 0;
  const r = f.apply(this, arguments);
  if (q) { const made = cnt(id) - n0; if (made > 0) { const vid = registerDish(id, q); const got = take(id, made) ? made : 0; if (got) give(vid, got, 0, true); } }
  return r;
})(jobStep);
if (typeof HELP !== 'undefined' && HELP.station) HELP.station[1].push('Cooking opens a short minigame: keep the heat in the green band. The whole batch comes out Plain, Tasty, Delicious or Exquisite; better dishes restore more and their buff lasts up to 3× as long. Every dish gives a buff when eaten.');
