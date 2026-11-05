/* ================= Cooking: a minigame, dish quality and meal buffs (asked 2026-11-05) =================
   - Cooking at a kitchen (stove, fireplace, campfire, tavern) opens a short minigame for the whole batch: hold Space or the
     mouse to turn the heat up, let go to let it cool, and keep the pan in the green band while the dish cooks (6 s). Time in
     the band sets the quality: Plain, Tasty, Delicious, Exquisite (COOKQ). Quick cook skips it (Plain).
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
function cookGame(r, n) {
  const it = IT[r[0]], L = lifeL('cooking'), zw = Math.max(.16, Math.min(.34, .2 + L * .0014)), want = 6;
  const G = { phase: 'prep', heat: .2, drift: 0, inz: 0, t: 0, zc: .55 };
  const finish = q => { mgClose(); cookStart(r, n, q); };
  mgOpen({ title: 'Cooking ' + it.n + (n > 1 ? ' ×' + n : ''), hint: 'Hold Space or the mouse to turn up the heat, let go to cool. Keep the pan in the green band.', w: 360, h: 150,
    buttons: [['Quick cook (Plain)', () => finish(0), 'ghost'], ['Cancel', () => mgClose(), 'ghost']],
    setup: M => { M.G = G; M.top.append(el('span', null, 'Cooking ' + L + (n > 1 ? ' · the whole batch gets one quality' : ''))); },
    press: () => { if (G.phase === 'prep') G.phase = 'cook'; },
    update: dt => {
      if (G.phase === 'cook') {
        G.t += dt; G.drift += (Math.random() - .5) * dt * 1.6; G.drift = Math.max(-.35, Math.min(.35, G.drift * (1 - dt * .3)));
        G.zc = .55 + Math.sin(G.t * .9) * .18;
        G.heat = Math.max(0, Math.min(1, G.heat + ((MG.hold ? .6 : -.45) + G.drift * .5) * dt));
        if (Math.abs(G.heat - G.zc) < zw / 2) G.inz += dt;
        if (G.t >= want) { const s = G.inz / want; G.q = s < .5 ? 0 : s < .72 ? 1 : s < .9 ? 2 : 3; G.phase = 'done'; G.dt = 0; snd(G.q >= 2 ? 990 : 660, .08, 'sine', .05); }
      } else if (G.phase === 'done') { G.dt += dt; if (G.dt > 1) finish(G.q); }
    },
    draw: c => {
      c.fillStyle = '#1c1410'; c.fillRect(0, 0, 360, 150);
      // a pan on the fire
      const hot = G.heat; c.fillStyle = `rgb(${Math.round(180 + 75 * hot)},${Math.round(80 + 100 * hot)},40)`; for (let i = 0; i < 5; i++) c.fillRect(150 + i * 12, 118 - Math.round(Math.random() * 8 * hot), 8, 12);
      c.fillStyle = '#3a3634'; c.fillRect(130, 100, 100, 12); c.fillRect(230, 104, 40, 4); c.fillStyle = it.c || '#d9a44a'; c.fillRect(140, 94, 80, 6);
      if (G.phase === 'prep') { mgText(c, 'Press Space or click to start cooking', 180, 50, '#f4e8d0', 14); return; }
      c.fillStyle = '#3a2a22'; c.fillRect(20, 20, 24, 110); c.fillStyle = 'rgba(110,200,90,.45)'; c.fillRect(20, 20 + (1 - G.zc - zw / 2) * 110, 24, zw * 110);
      c.fillStyle = '#ff7a2a'; c.fillRect(20, 20 + (1 - G.heat) * 110, 24, 3);
      mgBar(c, 70, 20, 220, 10, Math.min(1, G.t / want), '#a08c78'); mgBar(c, 70, 36, 220, 10, Math.min(1, G.inz / want), '#7cd05a');
      mgText(c, G.phase === 'done' ? COOKQ[G.q].n + '!' : Math.abs(G.heat - G.zc) < zw / 2 ? 'Just right' : G.heat > G.zc ? 'Too hot!' : 'More heat…', 180, 72, G.phase === 'done' ? COOKQ[G.q].col : '#f4e8d0', G.phase === 'done' ? 20 : 14);
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
