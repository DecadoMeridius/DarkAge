/* ================= Forging: quality, traits, reforge, temper, maker's marks (asked 2026-11-05) =================
   - Make (one piece) of a weapon or armour at an anvil opens the forging minigame (#mgame): 10 hits on the anvil. A mark
     moves over the work; click it before its ring runs out (longer with Smithing, shorter for better metals). Good hits set
     the quality (forgeQ): 0-3 Crude, 4-6 Standard, 7-8 Fine, 9 Masterwork, 10 Legendary (QUAL). Quick forge skips it. Standard is the plain item; batches
     (x5, x10, x100) and the trip and power hammers always make Standard.
   - A forged piece is its own item `<base>@<n>` (S.forged[n] = { b, q, tr: [trait ids], mk, day, gen }), registered as a
     non-enumerable IT entry whose prototype is the base item (so the encyclopedia and shops don't list it), with its stats
     and price scaled by quality. Fine rolls 1 trait, Masterwork 2, Legendary 3 (GTRAITS, weapons and armour have their own).
     A catalyst (a monster part, CATALYST) picked before forging makes its trait the first one.
   - Traits act in a recalc wrapper (crit, attack speed, damage, defence, health, speed, luck, regeneration, slow, burn, holy,
     fire resistance) and in actionHit / hurtPlayer wrappers (lifesteal, thorns, ward).
   - At the anvil, Forge work (openForgeWork): temper a piece one quality up (bars and gold; it can fail, the piece is kept)
     or reforge one trait (rerolled to another).
   - Maker's mark: pieces you forge carry your name and the day. An heirloom (forged in an earlier generation) gains 3% stats
     a generation it was kept, up to 30%.
   The minigame panel (mgOpen) is shared with the cooking game (x_cook.js). */

/* ---- the minigame panel ---- */
let MG = null;
function mgOpen(o) {
  mgClose(true);
  const res = o.res || 3, W0 = o.w || 360, H0 = o.h || 150, cv = el('canvas', { width: W0 * res, height: H0 * res }), top = el('div', { class: 'mgtop' }), acts = el('div', { class: 'acts wrap' });
  const p = el('div', { id: 'mgame', class: 'f-panel' }, el('b', { class: 'mgt' }, o.title), top, cv, el('small', { class: 'mgh' }, o.hint || ''), acts);
  document.body.append(p);
  MG = Object.assign({ cv, c: cv.getContext('2d'), top, acts, p, hold: false, t: 0, last: performance.now(), res }, o);
  for (const [lab, fn, cls] of o.buttons || []) acts.append(el('button', { class: 'btn' + (cls ? ' ' + cls : ''), on: () => fn(MG) }, lab));
  cv.addEventListener('mousedown', e => { e.preventDefault(); if (!MG) return; MG.hold = true; const R = cv.getBoundingClientRect(); MG.press && MG.press(MG, { x: (e.clientX - R.left) * W0 / R.width, y: (e.clientY - R.top) * H0 / R.height }); });
  cv.addEventListener('mousemove', e => { if (!MG) return; const R = cv.getBoundingClientRect(); MG.mouse = { x: (e.clientX - R.left) * W0 / R.width, y: (e.clientY - R.top) * H0 / R.height }; });
  if (o.setup) o.setup(MG);
  PAUSED = true; INPUT.keys = {};
  // drawn at 3x resolution, in 360x150 units
  const loop = now => { if (!MG || MG.p !== p) return; const dt = Math.min(.05, (now - MG.last) / 1000); MG.last = now; MG.t += dt; PAUSED = true;
    try { MG.update && MG.update(dt, MG); if (MG) { MG.c.setTransform(res, 0, 0, res, 0, 0); MG.c.imageSmoothingEnabled = false; MG.draw(MG.c, MG); } } catch (e) { console.error(e); mgClose(); return; } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  return MG;
}
function mgClose(quiet) { if (!MG) return; const p = MG.p; MG = null; p.remove(); if (!quiet) { PAUSED = !!(typeof windowPauses === 'function' ? windowPauses() : MODAL); if (typeof INPUT_GAP !== 'undefined') INPUT_GAP = performance.now() + 300; } }
addEventListener('mouseup', () => { if (MG && MG.hold) { MG.hold = false; MG.release && MG.release(MG); } });
addEventListener('keydown', e => {
  if (!MG) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); MG.cancel ? MG.cancel(MG) : mgClose(); return; }
  if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) { MG.hold = true; MG.press && MG.press(MG); } return; }
  e.stopImmediatePropagation();
}, true);
addEventListener('keyup', e => { if (MG && (e.code === 'Space' || e.key === 'Enter')) { e.preventDefault(); MG.hold = false; MG.release && MG.release(MG); } }, true);
if (typeof windowPauses === 'function') windowPauses = (f => function () { return MG ? true : f.apply(this, arguments); })(windowPauses);
document.head.append(el('style', null, `
#mgame { position: fixed; left: 50%; top: 80px; transform: translateX(-50%); z-index: 2100; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; align-items: center; width: min(760px, calc(100vw - 32px)); }
#mgame canvas { width: min(720px, calc(100vw - 60px)); aspect-ratio: 360 / 150; image-rendering: pixelated; border: 2px solid #2a1c18; background: #1c1410; cursor: pointer; }
#mgame .mgt { font-size: 18px; } #mgame .mgtop { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; }
#mgame .mgh { opacity: .85; text-align: center; }
`));
// painted scenes behind the minigames (art/minigame_bg.py); drawn to cover the panel
const MG_BG = {};
const mgScene = name => { let i = MG_BG[name]; if (!i) { i = MG_BG[name] = new Image(); i.src = 'art/ui/mg_' + name + '.png'; } return i.complete && i.naturalWidth ? i : null; };
['cook', 'under', 'reel', 'harpoon', 'haul'].forEach(mgScene);
function mgDrawScene(c, name, x = 0, y = 0, w = 360, h = 150, fb = '#1c1410') { const i = mgScene(name); if (!i) { c.fillStyle = fb; c.fillRect(x, y, w, h); return false; } const was = c.imageSmoothingEnabled; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(i, x, y, w, h); c.imageSmoothingEnabled = was; return true; }
const mgBar = (c, x, y, w, h, fill, col) => { c.fillStyle = '#3a2a22'; c.fillRect(x, y, w, h); c.fillStyle = col; c.fillRect(x, y, Math.round(w * fill), h); };
const mgText = (c, s, x, y, col, size) => { c.fillStyle = col || '#f4e8d0'; c.font = (size || 12) + 'px Fredoka, sans-serif'; c.textAlign = 'center'; c.fillText(s, x, y); };

/* ---- quality and traits ---- */
const QUAL = [
  { n: 'Crude', col: '#a08c78', st: .9, p: .75, tr: 0 },
  { n: 'Standard', col: '#e8dcc0', st: 1, p: 1, tr: 0 },
  { n: 'Fine', col: '#7cd05a', st: 1.08, p: 1.35, tr: 1 },
  { n: 'Masterwork', col: '#5aa8f0', st: 1.16, p: 1.9, tr: 2 },
  { n: 'Legendary', col: '#f0b030', st: 1.25, p: 2.8, tr: 3 }];
const TKM = [0, 0, 1, 1.25, 1.5];   // how strong traits are at each quality
const GTRAITS = {
  keen: { k: 'w', n: 'Keen', s: { crit: .05 }, d: m => '+' + Math.round(5 * m) + '% critical chance' },
  balanced: { k: 'w', n: 'Balanced', s: { aspd: .07 }, d: m => '+' + Math.round(7 * m) + '% attack speed' },
  heavy: { k: 'w', n: 'Heavy', s: { dmgx: .12, aspd: -.04 }, d: m => '+' + Math.round(12 * m) + '% damage, ' + Math.round(4 * m) + '% slower' },
  sharp: { k: 'w', n: 'Sharp', s: { dmgx: .07 }, d: m => '+' + Math.round(7 * m) + '% damage' },
  vampiric: { k: 'w', n: 'Vampiric', s: { leech: .04 }, d: m => 'heals ' + Math.round(4 * m) + '% of damage dealt' },
  swift: { k: 'w', n: 'Swift', s: { spd: .05 }, d: m => '+' + Math.round(5 * m) + '% move speed' },
  lucky: { k: 'wa', n: 'Lucky', s: { luck: 1 }, d: () => '+1 luck (better drops)' },
  frostbite: { k: 'w', n: 'Frostbite', s: { slow: 1 }, d: () => 'hits slow enemies', tiers: ['frost', 'rime', 'silver', 'star'] },
  burning: { k: 'w', n: 'Burning', s: { burn: 1 }, d: () => 'hits set enemies burning', tiers: ['obsidian', 'dragon', 'cinder', 'gold'] },
  holy: { k: 'w', n: 'Holy', s: { holy: .25 }, d: m => '+' + Math.round(25 * m) + '% damage to the undead', tiers: ['silver', 'gold', 'star', 'mythril'] },
  sturdy: { k: 'a', n: 'Sturdy', s: { defx: .25 }, d: m => '+' + Math.round(25 * m) + '% of its defence' },
  vital: { k: 'a', n: 'Vital', s: { maxhp: 12 }, d: m => '+' + Math.round(12 * m) + ' max health' },
  featherweight: { k: 'a', n: 'Featherweight', s: { spd: .04 }, d: m => '+' + Math.round(4 * m) + '% move speed' },
  thorned: { k: 'a', n: 'Thorned', s: { thorns: .2 }, d: m => 'returns ' + Math.round(20 * m) + '% of melee damage taken' },
  warded: { k: 'a', n: 'Warded', s: { ward: .04 }, d: m => Math.round(4 * m) + '% less damage taken' },
  regenerating: { k: 'a', n: 'Regenerating', s: { regen: .5 }, d: () => 'slowly restores health' },
  fireproof: { k: 'a', n: 'Fireproof', s: { fireres: 1 }, d: () => 'immune to burning', tiers: ['obsidian', 'dragon', 'cinder', 'adamant'] },
};
const FLAGS = new Set(['luck', 'slow', 'burn', 'fireres']);
// monster parts that steer the first trait
const CATALYST = { fang: ['keen', 'sturdy'], frost_fang: ['frostbite', 'warded'], raptor_feather: ['balanced', 'featherweight'], bat_wing: ['swift', 'featherweight'],
  bone: ['sharp', 'sturdy'], troll_hide: ['heavy', 'sturdy'], bear_pelt: ['heavy', 'vital'], ectoplasm: ['vampiric', 'warded'], chitin: ['sharp', 'thorned'],
  bug_shell: ['keen', 'thorned'], imp_horn: ['burning', 'fireproof'], salamander_scale: ['burning', 'fireproof'], hound_ember: ['burning', 'fireproof'],
  rime_essence: ['frostbite', 'warded'], jelly_gel: ['vampiric', 'regenerating'], slime_goo: ['lucky', 'regenerating'], relic_coin: ['lucky', 'lucky'],
  griffin_feather: ['swift', 'featherweight'], wisp_essence: ['holy', 'warded'], siren_scale: ['vampiric', 'vital'] };
const gearKind = it => it && it.t === 'weapon' ? 'w' : it && it.t === 'armor' ? 'a' : null;
const forgeable = id => { const it = IT[id]; return !!(it && gearKind(it) && it.ti !== undefined && !it.forged && !it.ring); };
const traitOk = (t, it) => { const T = GTRAITS[t]; return T && T.k.includes(gearKind(it)) && (!T.tiers || T.tiers.includes(it.tier)); };
function rollTraits(it, n, first, have) {
  const out = (have || []).slice(); if (first && traitOk(first, it) && !out.includes(first) && out.length < n) out.push(first);
  const pool = Object.keys(GTRAITS).filter(t => traitOk(t, it) && !out.includes(t));
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
const traitLine = (t, q) => GTRAITS[t].n + ' (' + GTRAITS[t].d(TKM[q] || 1) + ')';

/* ---- forged items ---- */
const FORGED = new Set();
const heirGens = f => f.mk && S && S.fam && S.fam.me ? Math.max(0, (S.fam.me.gen || 1) - (f.gen || 1)) : 0;
function registerForged(i) {
  const f = S.forged[i], B = IT[f.b]; if (!B) return null;
  const id = f.b + '@' + i, Q = QUAL[f.q], hg = heirGens(f), hk = Math.min(.3, hg * .03), k = Q.st * (1 + hk);
  const it = Object.create(B);
  Object.assign(it, { id, forged: i, base: f.b, q: f.q, n: (hg ? 'Heirloom ' : '') + (f.q === 1 ? '' : Q.n + ' ') + B.n,
    p: Math.max(1, Math.round((B.p || 1) * Q.p * (1 + hk))) });
  if (B.atk) it.atk = Math.max(1, Math.round(B.atk * k));
  if (B.def) it.def = Math.max(1, Math.round(B.def * k));
  if (B.magic) it.magic = Math.round(B.magic * k * 100) / 100;
  const bits = [(f.q === 1 ? 'Standard' : Q.n) + ' quality.'];
  if (f.tr.length) bits.push('Traits: ' + f.tr.map(t => traitLine(t, f.q)).join('; ') + '.');
  if (f.from) bits.push('Taken from ' + f.from + '.');
  if (f.mk) bits.push('Maker’s mark: ' + f.mk + ', ' + (typeof dayName === 'function' ? dayName(f.day) : 'day ' + f.day) + '.' + (hg ? ' Kept in the family for ' + hg + ' generation' + (hg > 1 ? 's' : '') + ' (+' + Math.round(hk * 100) + '% stats).' : ''));
  it.desc = (bits.join(' ') + (B.desc ? ' ' + B.desc : '')).replace(/\.$/, '');   // the UI adds the last full stop
  Object.defineProperty(IT, id, { value: it, enumerable: false, configurable: true, writable: true });
  FORGED.add(id); if (typeof ICACHE !== 'undefined') delete ICACHE[id];
  return id;
}
function newForged(base, q, tr, mark) {
  S.forged = S.forged || [];
  const f = { b: base, q, tr: tr || [], day: dayIndex() };
  if (mark !== false) { f.mk = (S.look && S.look.name) || 'You'; f.gen = (S.fam && S.fam.me && S.fam.me.gen) || 1; }
  S.forged.push(f); return registerForged(S.forged.length - 1);
}
initMaps = (f => function () { const r = f.apply(this, arguments); try { if (S && S.forged) S.forged.forEach((_, i) => registerForged(i)); } catch (e) { console.error(e); } return r; })(initMaps);
// an heir sees the heirloom bonus at once
if (typeof succeed === 'function') succeed = (f => function () { const r = f.apply(this, arguments); try { if (S && S.forged) S.forged.forEach((_, i) => registerForged(i)); recalc(); } catch (e) { console.error(e); } return r; })(succeed);
const baseOf = id => (id && IT[id] && IT[id].forged !== undefined) ? IT[id].base : id;
const forgedOf = id => id && IT[id] && IT[id].forged !== undefined && S.forged ? S.forged[IT[id].forged] : null;
itemIcon = (f => function (id) { return f.call(this, baseOf(id)); })(itemIcon);
// armour drawn on the character, by tier, from the base item
playerPal = (f => function () {
  const was = {}; for (const s in S.eq) if (S.eq[s] && IT[S.eq[s]] && IT[S.eq[s]].forged !== undefined) { was[s] = S.eq[s]; S.eq[s] = IT[S.eq[s]].base; }
  try { return f.apply(this, arguments); } finally { for (const s in was) S.eq[s] = was[s]; }
})(playerPal);

/* ---- traits at work ---- */
recalc = (f => function () {
  const r = f.apply(this, arguments); if (!S || !PS) return r;
  const x = { dmgx: 0, defx: 0, leech: 0, thorns: 0, ward: 0 };
  for (const s of ['weapon', 'helm', 'body', 'boots', 'shield']) {
    const F = forgedOf(S.eq[s]); if (!F) continue; const m = TKM[F.q] || 1, it = IT[S.eq[s]];
    for (const t of F.tr) { const T = GTRAITS[t]; if (!T) continue; for (const k in T.s) {
      const v = FLAGS.has(k) ? T.s[k] : T.s[k] * m;
      if (k === 'defx') PS.def += Math.max(1, Math.round((it.def || 0) * v));
      else if (k in x) x[k] += v; else PS[k] = (PS[k] || 0) + v; } }
  }
  if (x.dmgx && PS.maxHit) PS.maxHit = Math.max(2, Math.round(PS.maxHit * (1 + x.dmgx)));
  PS.dmg = (PS.dmg || 0) + x.dmgx;
  const W = IT[S.eq.weapon] || IT.wood_sword; PS.cd = (W.cd || .32) * (1 - Math.max(-.5, Math.min(.6, PS.aspd || 0)));
  PS.leech = x.leech; PS.thorns = x.thorns; PS.ward = Math.min(.4, x.ward);
  return r;
})(recalc);
actionHit = (f => function (e, mult, a, kb, opts) {
  const d = f.apply(this, arguments);
  if (d > 0 && PS && PS.leech && S.p.hp < maxHP()) { const h = Math.max(1, Math.round(d * PS.leech)); S.p.hp = Math.min(maxHP(), S.p.hp + h); if (Math.random() < .3) floatText(S.p.x + 10, S.p.y - 30, '+' + h, '#7be07b'); }
  return d;
})(actionHit);
hurtPlayer = (f => function (dmg, sx, sy, elem) {
  if (!S || !PS) return f.apply(this, arguments);
  if (PS.ward) dmg *= 1 - PS.ward;
  const hp0 = S.p.hp, r = f.call(this, dmg, sx, sy, elem), lost = hp0 - S.p.hp;
  if (PS.thorns && lost > 0 && cur && cur.ents && sx !== undefined) {
    let best = null, bd = 40; for (const e of cur.ents) if (e.type === 'enemy' && !e.dead) { const dd = Math.hypot(e.x - sx, e.y - sy); if (dd < bd) { bd = dd; best = e; } }
    if (best) { const t = Math.max(1, Math.round(lost * PS.thorns)); best.hp -= t; best.flash = .1; splat(best.x, best.y - EN[best.k].r * 2 - 4, t, 'bleed'); if (best.hp <= 0) killEnemy(cur, best); }
  }
  return r;
})(hurtPlayer);

/* ---- the forging minigame ---- */
let FORGE_PASS = false;
// 10 hits on the anvil (asked 2026-11-05): a mark moves over the work; click it before its ring runs out. Good hits set the quality.
const FORGE_HITS = 10;
// a centre hit counts 1, a hit elsewhere on the mark 0.5 (asked 2026-11-05: Legendary must be rare). The sum of 10 sets the
// quality, capped by Smithing: Masterwork from 20, Legendary from 40.
const forgeQ = (sc, L) => Math.min(sc < 4 ? 0 : sc < 6.5 ? 1 : sc < 8.5 ? 2 : sc < 9.5 ? 3 : 4, L < 20 ? 2 : L < 40 ? 3 : 4);
const forgeR = (rad, m, tw) => rad * (1 - .4 * Math.min(1, m.t / tw));   // the mark shrinks as its ring runs out
function forgeGame(r) {
  const it = IT[r[0]], L = lifeL('smithing'), ti = it.ti || 0;
  const tw = Math.max(.55, Math.min(1.45, 1.05 + L * .004 - ti * .04)), rad = Math.min(12, 8 + L * .04), spd = 55 + ti * 6;
  const cats = Object.keys(CATALYST).filter(k => IT[k] && has(k) && CATALYST[k].some(t => traitOk(t, it)));
  const A = FORGE_BG.naturalWidth ? { x0: 160, x1: 296, y0: 30, y1: 84 } : { x0: 120, x1: 296, y0: 50, y1: 100 };   // where the mark wanders: the work on the anvil
  const G = { phase: 'prep', n: 0, good: 0, mk: null, gap: 0, flash: 0, msg: '', hits: [], cat: null, sp: [], swing: null };
  const spawn = () => { const a = Math.random() * Math.PI * 2; G.mk = { x: A.x0 + 20 + Math.random() * (A.x1 - A.x0 - 40), y: A.y0 + 10 + Math.random() * (A.y1 - A.y0 - 20), vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, t: 0 }; };
  const hit = (v, at) => { const ok = v > 0, m = G.mk || {}, hx = at ? at.x : m.x || 180, hy = at ? at.y : m.y || 80;
    G.swing = { x: hx, y: hy, t: 0 }; for (let i = 0; i < (ok ? 16 : 5); i++) { const a = -Math.PI / 2 + (Math.random() - .5) * 2.6, v = (ok ? 60 : 25) + Math.random() * (ok ? 90 : 30); G.sp.push({ x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: ok ? .5 + Math.random() * .4 : .35, c: ok ? (Math.random() < .5 ? '#ffd060' : '#ff8a2a') : '#8a8078' }); }
    G.n++; G.good += v; G.hits.push(v); G.msg = v === 1 ? 'Perfect!' : ok ? 'Off-centre' : 'Miss'; G.flash = .4; G.mk = null; G.gap = .3;
    snd(ok ? 900 : 260, .06, 'square', .05); if (ok) SHAKE = .05;
    if (G.n >= FORGE_HITS) { G.phase = 'done'; G.q = forgeQ(G.good, L); G.dt = 0; } };
  const finish = q => { mgClose(); forgeDone(r, q, G.cat); };
  mgOpen({ title: 'Forging ' + it.n, hint: 'Click the centre of the glowing mark before its ring runs out. A centre hit counts 1, an off-centre hit ½; the 10 decide the quality.', w: 360, h: 150,
    buttons: [['Quick forge (Standard)', () => finish(1), 'ghost'], ['Cancel', () => mgClose(), 'ghost']],
    setup: M => {
      M.G = G; M.A = A; M.rad = rad;
      if (cats.length) { M.top.append(el('span', null, 'Catalyst:'));
        const chips = [null].concat(cats).map(k => { const b = el('button', { class: 'chip' + (k === G.cat ? ' on' : ''), title: k ? 'Steers the first trait: ' + CATALYST[k].filter(t => traitOk(t, it)).map(t => GTRAITS[t].n).join(' or ') : 'No catalyst', on: () => { if (G.phase !== 'prep') return; G.cat = k; chips.forEach(c => c.classList.toggle('on', c.dataset.k === String(k))); } }, k ? IT[k].n : 'None'); b.dataset.k = String(k); return b; });
        M.top.append(...chips); }
      M.top.append(el('span', null, 'Smithing ' + L + ' · ' + tw.toFixed(1) + ' s a mark'));
    },
    press: (M, pt) => {
      if (G.phase === 'prep') { G.phase = 'hit'; G.gap = .4; return; }
      if (G.phase !== 'hit' || !G.mk || !pt) return;
      const d = Math.hypot(pt.x - G.mk.x, pt.y - G.mk.y), R = forgeR(rad, G.mk, tw); hit(d <= R * .4 ? 1 : d <= R + 2 ? .5 : 0, pt);
    },
    update: dt => {
      G.flash = Math.max(0, G.flash - dt);
      for (const q of G.sp) { q.t -= dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 260 * dt; } G.sp = G.sp.filter(q => q.t > 0);
      if (G.swing) { G.swing.t += dt; if (G.swing.t > .3) G.swing = null; }
      if (G.phase === 'hit') {
        if (!G.mk) { G.gap -= dt; if (G.gap <= 0) spawn(); return; }
        const m = G.mk; m.t += dt; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.x < A.x0 + rad || m.x > A.x1 - rad) { m.vx = -m.vx; m.x = Math.max(A.x0 + rad, Math.min(A.x1 - rad, m.x)); }
        if (m.y < A.y0 + rad || m.y > A.y1 - rad) { m.vy = -m.vy; m.y = Math.max(A.y0 + rad, Math.min(A.y1 - rad, m.y)); }
        if (Math.random() < dt * 1.8) { const a = Math.atan2(m.vy, m.vx) + (Math.random() - .5) * 1.6; m.vx = Math.cos(a) * spd; m.vy = Math.sin(a) * spd; }   // it changes course now and then
        if (m.t >= tw) hit(0);
      } else if (G.phase === 'done') { G.dt += dt; if (G.dt > 1.2) finish(G.q); }
    },
    draw: c => {
      const glow = G.phase === 'prep' ? 1 : Math.max(.2, 1 - G.n * .08);
      forgeScene(c, r[0], glow, MG.t);
      // hit lights
      for (let i = 0; i < FORGE_HITS; i++) { const h = G.hits[i]; c.fillStyle = '#120c0a'; c.fillRect(104 + i * 17, 5, 14, 10); c.fillStyle = h === undefined ? '#3a2a22' : h === 1 ? '#f0b030' : h ? '#c8a878' : '#9a3a2a'; c.fillRect(105 + i * 17, 6, 12, 8); if (h === 1) { c.fillStyle = '#ffe8a0'; c.fillRect(105 + i * 17, 6, 12, 2); } }
      mgText(c, (Math.round(G.good * 10) / 10) + ' / ' + G.n, 336, 14, '#f4e8d0', 11);
      if (G.phase === 'prep') { c.fillStyle = 'rgba(18,12,10,.6)'; c.fillRect(70, 52, 220, 30); mgText(c, 'Click (or Space) to start, then click each mark', 180, 72, '#f4e8d0', 13); return; }
      const m = G.mk;
      if (m) { const k = 1 - m.t / tw, R = forgeR(rad, m, tw);
        c.fillStyle = 'rgba(255,210,110,.22)'; c.beginPath(); c.arc(m.x, m.y, R + 9 * k, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#120c0a'; c.lineWidth = 5; c.beginPath(); c.arc(m.x, m.y, R + 3, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = k > .35 ? '#f0b030' : '#ff5a3a'; c.lineWidth = 3; c.beginPath(); c.arc(m.x, m.y, R + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke();
        c.fillStyle = 'rgba(255,240,190,.35)'; c.beginPath(); c.arc(m.x, m.y, R, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff2c0'; c.beginPath(); c.arc(m.x, m.y, Math.max(1.5, R * .4), 0, Math.PI * 2); c.fill();   // a cross on the spot to strike
      }
      for (const q of G.sp) { c.globalAlpha = Math.min(1, q.t * 3); c.fillStyle = q.c; c.fillRect(Math.round(q.x), Math.round(q.y), 2, 2); } c.globalAlpha = 1;
      if (G.swing) forgeHammer(c, G.swing.x, G.swing.y, G.swing.t / .3);
      if (G.flash > 0) mgText(c, G.msg, 180, 140, G.msg === 'Miss' ? '#ff8a6a' : '#ffe08a', 14);
      if (G.phase === 'done') { const Q = QUAL[G.q]; c.fillStyle = 'rgba(18,12,10,.65)'; c.fillRect(80, 56, 200, 34); mgText(c, Q.n + '! (' + (Math.round(G.good * 10) / 10) + ' of ' + FORGE_HITS + ')', 180, 80, Q.col, 20); }
    } });
}
// the smithy: a brick wall, the hearth burning on the left, the anvil, and the piece glowing on it
const FORGE_ART = {};
function forgeWork(id, glow) {
  const key = id + '|' + (SETTINGS.artStyle || ''); let A = FORGE_ART[key];
  if (!A || A.__lost) { const ic = itemIcon(id); if (!ic) return null;
    const hot = mk(ic.width, ic.height, x => { x.drawImage(ic, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(255,110,30,.55)'; x.fillRect(0, 0, ic.width, ic.height); x.globalCompositeOperation = 'lighter'; x.globalAlpha = .35; x.drawImage(ic, 0, 0); });
    A = FORGE_ART[key] = { ic, hot }; }
  return A;
}
// the painted smithy (art/forge_bg.py writes public/art/ui/forge_bg.png); set FORGE_BG_FILE once it exists, else the scene is drawn in code
const FORGE_BG_FILE = 'art/ui/forge_bg.png';
const FORGE_BG = new Image(); if (FORGE_BG_FILE) FORGE_BG.src = FORGE_BG_FILE;
function forgeScene(c, id, glow, t) {
  c.imageSmoothingEnabled = false;
  if (FORGE_BG.complete && FORGE_BG.naturalWidth) {
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(FORGE_BG, 0, 0, 360, 150); c.imageSmoothingEnabled = false;
    const f = .16 + .06 * Math.sin(t * 7) + .04 * Math.sin(t * 13), g0 = c.createRadialGradient(44, 100, 4, 44, 100, 110);   // the fire breathes
    g0.addColorStop(0, 'rgba(255,150,60,' + f + ')'); g0.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g0; c.fillRect(0, 0, 220, 150);
    forgePiece(c, id, glow, 76, 226); return;   // the painting's anvil top
  }
  // wall
  c.fillStyle = '#2a1e1a'; c.fillRect(0, 0, 360, 150);
  for (let y = 0; y < 120; y += 10) for (let x = (y / 10) % 2 ? -10 : 0; x < 360; x += 20) { c.fillStyle = ((x * 7 + y * 3) % 11) < 4 ? '#33251f' : '#2e211c'; c.fillRect(x + 1, y + 1, 18, 8); }
  // hearth with fire
  c.fillStyle = '#1a1210'; c.fillRect(8, 40, 70, 80); c.fillStyle = '#4a3a34'; c.fillRect(4, 34, 78, 8); c.fillRect(4, 34, 6, 86); c.fillRect(76, 34, 6, 86);
  c.fillStyle = '#3a1a10'; c.fillRect(12, 112, 62, 8); c.fillStyle = '#ff6a2a'; for (let i = 0; i < 6; i++) c.fillRect(14 + i * 10, 113, 6, 3);   // coals
  for (let i = 0; i < 5; i++) { const f = .5 + .5 * Math.sin(t * 8 + i * 2.1), h = 20 + f * 16 + (i % 2) * 8, cx = 18 + i * 12;   // tapered flames
    for (let y = 0; y < h; y += 2) { const k = 1 - y / h, w = Math.max(1, Math.round(10 * k)), sway = Math.round(Math.sin(t * 6 + i + y * .2) * 2 * (1 - k));
      c.fillStyle = k > .7 ? '#ffe08a' : k > .35 ? '#ffb040' : '#ff6a2a'; c.fillRect(cx - w / 2 + sway, 112 - y, w, 2); } }
  const g = c.createRadialGradient(44, 100, 4, 44, 100, 90); g.addColorStop(0, 'rgba(255,140,50,.28)'); g.addColorStop(1, 'rgba(255,140,50,0)'); c.fillStyle = g; c.fillRect(0, 20, 180, 130);
  // tongs and a spare hammer on the wall
  c.fillStyle = '#6a625c'; c.fillRect(306, 22, 2, 40); c.fillRect(312, 22, 2, 40); c.fillRect(304, 60, 12, 3); c.fillStyle = '#7a5a3a'; c.fillRect(330, 26, 3, 40); c.fillStyle = '#6a625c'; c.fillRect(324, 22, 15, 8);
  // floor
  c.fillStyle = '#1e1512'; c.fillRect(0, 128, 360, 22); c.fillStyle = '#261b17'; for (let x = 0; x < 360; x += 24) c.fillRect(x, 128, 22, 2);
  // the anvil: face, horn, waist, foot
  const ax = 120, ay = 96;
  c.fillStyle = '#121010'; c.fillRect(ax - 34, ay - 2, 210, 16); c.fillRect(ax + 50, ay + 12, 80, 22); c.fillRect(ax + 30, ay + 30, 120, 10);
  c.fillStyle = '#6a6460'; c.fillRect(ax - 30, ay, 202, 12);   // the face
  c.fillStyle = '#8a8480'; c.fillRect(ax - 30, ay, 202, 3);
  c.fillStyle = '#4a4440'; c.fillRect(ax - 30, ay + 9, 202, 3);
  for (let i = 0; i < 26; i++) { c.fillStyle = '#5a5450'; c.fillRect(ax - 30 - i, ay + 1 + Math.floor(i / 3), 1, Math.max(1, 10 - Math.floor(i / 2.6))); }   // the horn
  c.fillStyle = '#4e4844'; c.fillRect(ax + 54, ay + 12, 72, 20); c.fillStyle = '#5c5652'; c.fillRect(ax + 54, ay + 12, 6, 20);
  c.fillStyle = '#5a5450'; c.fillRect(ax + 34, ay + 32, 112, 7); c.fillStyle = '#6e6864'; c.fillRect(ax + 34, ay + 32, 112, 2);
  forgePiece(c, id, glow, ay - 2);
}
// the piece on the anvil's face, hot and cooling
// a weapon lies along the face, armour stands on it
function forgePiece(c, id, glow, face, cx = 210) {
  const W = forgeWork(id, glow); if (!W) return;
  const wpn = IT[id] && IT[id].t === 'weapon', sz = wpn ? 96 : 60, cy = wpn ? face - 5 : face + 1 - sz / 2;   // a weapon lies on the face, armour stands on it
  c.fillStyle = 'rgba(20,10,6,.45)'; c.beginPath(); c.ellipse(cx, face + 1, wpn ? 40 : 22, 3, 0, 0, Math.PI * 2); c.fill();   // contact shadow
  c.save(); c.translate(cx, cy); if (wpn) c.rotate(Math.PI / 4); c.imageSmoothingEnabled = !!W.ic.hi;
  c.drawImage(W.ic, -sz / 2, -sz / 2, sz, sz); c.globalAlpha = .25 + .55 * glow; c.drawImage(W.hot, -sz / 2, -sz / 2, sz, sz); c.restore(); c.globalAlpha = 1;
  const g2 = c.createRadialGradient(cx, cy, 4, cx, cy, 60); g2.addColorStop(0, 'rgba(255,150,60,' + (.25 * glow) + ')'); g2.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g2; c.fillRect(cx - 70, cy - 60, 140, 120);
}
function forgeHammer(c, x, y, k) {
  // raised, then down on the spot
  const a = k < .4 ? -1.2 + k * 2.5 : Math.max(-.2, -.2 - (k - .4) * .5), L = 34;
  c.save(); c.translate(x + 22, y + 18); c.rotate(a);
  c.fillStyle = '#7a5a3a'; c.fillRect(-2, 0, 4, L); c.fillStyle = '#5a4028'; c.fillRect(1, 0, 1, L);
  c.fillStyle = '#121010'; c.fillRect(-11, -9, 22, 11); c.fillStyle = '#8a8480'; c.fillRect(-10, -8, 20, 9); c.fillStyle = '#b0aaa4'; c.fillRect(-10, -8, 20, 2);
  c.restore();
}
function forgeDone(r, q, cat) {
  const base = r[0], it = IT[base], n0 = cnt(base);
  FORGE_PASS = true; const jr = JOB_RUN; JOB_RUN = true;
  try { doCraft(r, 1); } finally { JOB_RUN = jr; FORGE_PASS = false; }
  const made = cnt(base) - n0; if (made <= 0) return;
  let first = null; if (cat && q >= 2 && has(cat)) { take(cat, 1); first = CATALYST[cat].find(t => traitOk(t, it)); }
  for (let i = 0; i < made; i++) {
    const tr = QUAL[q].tr ? rollTraits(it, QUAL[q].tr, i === 0 ? first : null) : [];
    if (q === 1 && !tr.length) { toast(it.n + ' (Standard).'); continue; }
    const id = newForged(base, q, tr); if (!id) continue;
    take(base, 1); give(id, 1, 0, true);
    toast((q >= 3 ? '★ ' : '') + IT[id].n + (tr.length ? ': ' + tr.map(t => GTRAITS[t].n).join(', ') : '') + '.', q >= 2 ? 'lvl' : q === 0 ? 'bad' : '');
  }
  if (q >= 3) { addXP('smithing', 10 * q); SFX.lvl(); } else SFX.ok();
  if (MODAL) refresh();
}
doCraft = (f => function (r, n = 1) {
  if (FORGE_PASS || JOB_RUN || !r || r[3] !== 'anvil' || n !== 1 || !forgeable(r[0]) || typeof JOB === 'undefined' || JOB) return f.apply(this, arguments);
  const why = canCraft(r); if (why) { toast(why, 'bad'); return; }
  forgeGame(r);
})(doCraft);

/* ---- forge work at the anvil: temper and reforge ---- */
const forgeBar = it => IT[it.tier + '_bar'] ? it.tier + '_bar' : IT.iron_bar ? 'iron_bar' : 'copper_bar';
const TEMPER_OK = [.9, .75, .55, .35];
const temperCost = (it, q) => ({ bars: 2 + q, gold: Math.round((IT[baseOf(it.id)].p || 50) * [.3, .5, .8, 1.2][q]) });
const reforgeCost = (it, q) => ({ bars: 1, gold: Math.round((IT[baseOf(it.id)].p || 50) * .25 * (1 + q * .3)) });
function gearInBag() { const out = []; for (const s of S.pack) if (s && s.k && IT[s.k] && (IT[s.k].forged !== undefined || forgeable(s.k))) out.push(s.k); return [...new Set(out)]; }
function openForgeWork() {
  openModal('Forge work', [{ id: 'fw', label: 'Temper and reforge', render: b => {
    b.append(el('p', { class: 'note' }, 'Temper: raise a piece one quality step (it can fail; the piece is always kept). Reforge: reroll one trait into another. Both cost bars of the piece’s metal and gold. Your Smithing level adds to the temper chance.'));
    const L = lifeL('smithing'), list = el('div', { class: 'list' }), items = gearInBag();
    if (!items.length) list.append(el('p', { class: 'note' }, 'No weapons or armour in your backpack.'));
    for (const id of items) {
      const it = IT[id], F = forgedOf(id), q = F ? F.q : 1, bar = forgeBar(it), Q = QUAL[q];
      const row = el('div', { class: 'rrow' }, icon(id, 36), el('div', { class: 'rtxt' }, el('b', { style: 'color:' + Q.col }, it.n), el('small', null, Q.n + (F && F.tr.length ? ' · ' + F.tr.map(t => GTRAITS[t].n).join(', ') : '') + (F && F.mk ? ' · made by ' + F.mk : ''))));
      const acts = el('div', { class: 'acts wrap' });
      if (q < 4) { const c = temperCost(it, q), ch = Math.min(.95, TEMPER_OK[q] + L * .002), ok = cnt(bar) >= c.bars && S.gold >= c.gold;
        acts.append(el('button', { class: 'btn' + (ok ? '' : ' off'), title: c.bars + ' ' + IT[bar].n + ', ' + c.gold + 'g', on: () => { if (!ok) { toast('You need ' + c.bars + ' ' + IT[bar].n + ' and ' + c.gold + 'g.', 'bad'); return; } temper(id, c, bar, ch); refresh(); } }, 'Temper → ' + QUAL[q + 1].n + ' (' + Math.round(ch * 100) + '%, ' + c.bars + ' bars, ' + c.gold + 'g)')); }
      if (F && F.tr.length) { const c = reforgeCost(it, q), ok = cnt(bar) >= c.bars && S.gold >= c.gold;
        for (const t of F.tr) acts.append(el('button', { class: 'btn ghost' + (ok ? '' : ' off'), title: c.bars + ' ' + IT[bar].n + ', ' + c.gold + 'g', on: () => { if (!ok) { toast('You need ' + c.bars + ' ' + IT[bar].n + ' and ' + c.gold + 'g.', 'bad'); return; } reforge(id, t, c, bar); refresh(); } }, 'Reforge ' + GTRAITS[t].n + ' (' + c.gold + 'g)')); }
      row.append(acts); list.append(row);
    }
    b.append(list);
  } }]);
}
function temper(id, c, bar, ch) {
  take(bar, c.bars); S.gold -= c.gold;
  if (Math.random() > ch) { toast('The temper didn’t take. The piece is unharmed, the bars and gold are spent.', 'bad'); SFX.bad(); return; }
  const it = IT[id], F = forgedOf(id), q = (F ? F.q : 1) + 1, base = baseOf(id);
  const tr = rollTraits(IT[base], QUAL[q].tr, null, F ? F.tr : []);
  if (F) { F.q = q; F.tr = tr; if (!F.mk) { F.mk = (S.look && S.look.name) || 'You'; F.gen = S.fam.me.gen || 1; F.day = dayIndex(); } registerForged(it.forged); toast('Tempered: ' + IT[id].n + '!', 'lvl'); }
  else { const nid = newForged(base, q, tr); take(id, 1); give(nid, 1, 0, true); toast('Tempered: ' + IT[nid].n + '!', 'lvl'); }
  addXP('smithing', 6 + q * 4); SFX.lvl(); recalc();
}
function reforge(id, t, c, bar) {
  const F = forgedOf(id), it = IT[baseOf(id)]; if (!F) return;
  const pool = Object.keys(GTRAITS).filter(x => traitOk(x, it) && !F.tr.includes(x)); if (!pool.length) { toast('Nothing else can take its place.'); return; }
  take(bar, c.bars); S.gold -= c.gold;
  const nt = pickR(pool); F.tr = F.tr.map(x => x === t ? nt : x); registerForged(IT[id].forged);
  toast(GTRAITS[t].n + ' became ' + GTRAITS[nt].n + '.', 'lvl'); addXP('smithing', 4); SFX.ok(); recalc();
}
// the anvil's recipe window gets a Forge work button
renderCraft = (f => function (b) {
  const r = f.apply(this, arguments);
  try {
    const st = (typeof CRAFT_AT !== 'undefined' && CRAFT_AT) || (MODAL && MODAL.opts && MODAL.opts.station);
    if (st === 'anvil' || (MODAL && MODAL.opts && MODAL.opts.st === 'anvil')) b.prepend(el('div', { class: 'acts wrap', style: 'margin-bottom:6px' },
      el('button', { class: 'btn', on: () => openForgeWork() }, 'Forge work: temper and reforge'),
      el('small', { class: 'note' }, 'Make forges one piece by hand (a minigame sets its quality and traits); ×5 and more make Standard pieces.')));
  } catch (e) { console.error(e); }
  return r;
})(renderCraft);
if (typeof HELP !== 'undefined') {
  HELP.forgework = ['Forge work', ['Temper raises a piece one quality step: Crude, Standard, Fine, Masterwork, Legendary. It can fail (your Smithing level helps); the piece is always kept.', 'Reforge rerolls one trait into another the piece can carry.', 'Fine pieces have 1 trait, Masterwork 2, Legendary 3. Quality raises attack or defence (Crude −10%, Fine +8%, Masterwork +16%, Legendary +25%) and the price.', 'Pieces you forge carry your maker’s mark. Kept by your heirs they become heirlooms: +3% stats a generation, up to +30%.']];
  helpKey = (f => function () { if (MODAL && MODAL.title === 'Forge work') return 'forgework'; return f.apply(this, arguments); })(helpKey);
}
