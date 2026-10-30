/* ================= Polish: wind, knockouts, carrying =================
   WIND: trees and fruit trees lean one art pixel at the canopy now and then (a second frame
   made once per sprite, so it stays crisp and costs nothing per frame); tall grass cycles
   its three frames. Each plant gets its own phase (kept in memory, not in the save); gusts
   come more often in rain.
   KNOCKOUT: being knocked out plays a short fall (recoil, then lying down with stars) and a
   fade to black before the day ends, instead of cutting straight to the morning.
   CARRYING: holding a crop, fish, forage, animal product, artisan good or gem in the selected
   hotbar slot shows it above your head, Stardew-style. */

const PHASE = new WeakMap(), phase = o => { let p = PHASE.get(o); if (p === undefined) { p = Math.random() * 6.283; PHASE.set(o, p); } return p; };
const SWAYC = new WeakMap();
function swayFrame(c) {
  if (!c || !c.width) return c; let s = SWAYC.get(c); if (s) return s;
  const cut = Math.round(c.height * .6);
  s = mk(c.width, c.height, x => { x.drawImage(c, 0, cut, c.width, c.height - cut, 0, cut, c.width, c.height - cut); x.drawImage(c, 0, 0, c.width, cut, 1, 0, c.width, cut); });
  s.ww = c.ww; s.wh = c.wh; SWAYC.set(c, s); return s;
}
const _objSpriteP = objSprite;
objSprite = function (o, season) {
  const c = _objSpriteP(o, season);
  if (!S || !c) return c;
  const gust = S.weather === 'rain' || S.weather === 'snow' ? .25 : .72;
  if (o.k === 'tree' || o.k === 'ancient' || (o.k === 'ftree' && o.age >= 14)) return Math.sin(gameT * 1.25 + phase(o)) > gust ? swayFrame(c) : c;
  if (o.k === 'tgrass') { const v = Math.sin(gameT * 1.6 + phase(o)); const fr = SPR.tgrass && SPR.tgrass[season]; return fr ? fr[v > .45 ? 2 : v < -.45 ? 0 : 1] || c : c; }
  return c;
};

/* knockout: fall, stars, fade, then the usual faint (and, with heirs, maybe the end of a life) */
let KO = null;
const _faintP = faint;
faint = function (msg) { if (KO) return; KO = { t: 0, msg, dir: S.p.dir }; S.p.hp = Math.max(1, S.p.hp); INPUT.keys = {}; MOUSE.down = false; if (typeof TARGET !== 'undefined') TARGET = null; SFX.hurt(); };
const _updateP = update;
update = function (dt) {
  if (KO) { KO.t += dt; S.p.hp = Math.max(1, S.p.hp); pl.inv = 1; INPUT.keys = {}; MOUSE.down = false;
    if (KO.t >= 1.7) { const m = KO.msg; KO = null; pl.inv = 0; _faintP(m); } return; }
  _updateP(dt);
};
const _drawPlayerP = drawPlayer;
drawPlayer = function () {
  if (KO) {
    const p = S.p, P = playerPal(); if (!HC_P) HC_P = 'pl' + Math.random().toString(36).slice(2, 7);
    shadow(p.x, p.y, 8);
    if (KO.t < .3) { D(humanSpr(HC_P, P, KO.dir, 'hurt'), p.x - 8, p.y - 31, 16, 32); return; }
    const spr = humanSpr(HC_P, P, 0, 'hurt'), side = KO.dir === 1 ? 1 : -1; // lying down, head away from where you faced
    g.save(); g.translate(p.x, p.y - 4); g.rotate(side * Math.PI / 2); D(spr, -8, -31 + 8, 16, 32); g.restore();
    for (let i = 0; i < 3; i++) { const a = gameT * 4 + i * 2.1; g.fillStyle = i % 2 ? '#fff0a0' : '#ffd040'; g.fillRect(Math.round((p.x + side * 10 + Math.cos(a) * 6) * 2) / 2, Math.round((p.y - 12 + Math.sin(a) * 2) * 2) / 2, 1, 1); }
    if (KO.t > .9) { g.globalAlpha = Math.min(1, (KO.t - .9) / .7); g.fillStyle = '#000000'; g.fillRect(p.x - 3000, p.y - 3000, 6000, 6000); g.globalAlpha = 1; }
    return;
  }
  _drawPlayerP();
  const id = S.hot && S.hot[S.sel], it = id && IT[parseK(id)[0]];
  if (it && ['crop', 'fruit', 'forage', 'fish', 'animal', 'artisan', 'gem', 'artifact'].includes(it.t) && !(pl.swing > 0) && !(pl.anim > 0) && !fishing && !S.mounted && !(pl.roll > 0) && !(pl.eatT > 0)) {
    const ic = itemIcon(parseK(id)[0]); if (ic) D(ic, S.p.x - 5, S.p.y - 44 + (pl.moving && Math.floor(gameT * 12) % 8 > 3 ? 1 : 0), 10, 10);
  }
};

/* pause: the Pause key (rebindable in Options) or the button under the clock. Stops time, ticks and
   enemies; a click or the key again resumes. */
let GPAUSE = false;
function setPause(on) {
  if (on && (TITLE || MODAL || !S || GPAUSE)) return;
  if (!on && !GPAUSE) return;
  GPAUSE = on; PAUSED = on; INPUT.keys = {}; MOUSE.down = false;
  let ov = document.getElementById('pauseov');
  if (on && !ov) { ov = el('div', { id: 'pauseov' }, el('div', { class: 'f-panel' }, el('h2', null, 'Paused'), el('p', { class: 'note' }, 'Click or press ' + KEYNAME(SETTINGS.binds.pause || 'pause') + ' to carry on.'))); ov.onclick = () => setPause(false); document.body.append(ov); }
  if (!on && ov) ov.remove();
}
ACTIONS.push(['pause', 'Pause', 'pause']); buildKeymap();
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === 'pause' && !e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); setPause(!GPAUSE); return; }
  if (GPAUSE) { e.preventDefault(); e.stopImmediatePropagation(); if (k === 'escape') setPause(false); }
}, true);
addEventListener('blur', () => { if (!GPAUSE && !TITLE && !MODAL && S && SETTINGS.autoPause !== false) setPause(true); }); // alt-tab pauses
{ const b = el('button', { id: 'pausebtn', class: 'btn ghost', title: 'Pause (Pause key)' }, 'Pause'); b.onclick = e => { e.stopPropagation(); setPause(true); b.blur(); }; const c = document.getElementById('clock'); if (c) c.after(b); }

/* gathered resources pop out of the tree, rock or grass as real pieces (logs, stones, fibre, hay),
   arc through the air, then home in on you and are picked up: popTo(map, x, y, item, n, big) */
function popTo(m, x, y, id, n, big) {
  const pieces = Math.min(n, big ? 8 : 4), per = Math.floor(n / pieces); let extra = n - per * pieces;
  for (let i = 0; i < pieces; i++) {
    const a = Math.random() * 6.283, sp = (big ? 40 : 22) + Math.random() * 30;
    m.ents.push({ type: 'drop', id, n: per + (extra-- > 0 ? 1 : 0), x, y, z: 6, vz: (big ? 90 : 70) + Math.random() * 50, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6, t: 0, home: 1 });
  }
}
const _updateDropsX = updateDrops;
updateDrops = function (m, dt) {
  for (const d of m.ents) {
    if (d.type !== 'drop') continue;
    if (d.vx || d.vy) { d.x += d.vx * dt; d.y += d.vy * dt; const k = d.z > 0 ? .985 : .8; d.vx *= k; d.vy *= k; if (Math.abs(d.vx) + Math.abs(d.vy) < 1) d.vx = d.vy = 0; }
    if (d.home && d.t > .45 && d.z <= 0 && m === cur) { // fly to the player, faster the longer it flies
      const dx = S.p.x - d.x, dy = S.p.y - 4 - d.y, dd = Math.hypot(dx, dy) || 1, sp = Math.min(260, 70 + (d.t - .45) * 380);
      d.x += dx / dd * Math.min(dd, sp * dt); d.y += dy / dd * Math.min(dd, sp * dt);
    }
    if (d.t < 0) d.home = 0; // the bag was full: it stays on the ground like any drop
  }
  _updateDropsX(m, dt);
};

/* pickup popups merge: several pieces of the same item reaching you shortly after each other show one
   growing "+N Wood" instead of a stack of overlapping "+1 Wood" texts */
const _floatTextX = floatText;
floatText = function (x, y, txt, c) {
  const m = /^\+(\d+) (.+)$/.exec(txt);
  if (m) {
    const f = FX.find(f => f.item === m[2] && f.t > .35 && Math.abs(f.x - x) < 24);
    if (f) { f.n += +m[1]; f.txt = '+' + f.n + ' ' + m[2]; f.t = 1.1; return; }
    const stack = FX.filter(f => f.item && f.t > .2 && Math.abs(f.x - x) < 24).length; // other items' popups: stack above them, not on top
    _floatTextX(x, y - stack * 9, txt, c); const g2 = FX[FX.length - 1]; g2.item = m[2]; g2.n = +m[1]; return;
  }
  _floatTextX(x, y, txt, c);
};

/* aiming at a tree, rock or ore vein you can't work yet: the cursor turns red and a label says what it
   is and the level it needs ("Maple · Woodcutting 10") */
const TREE_N = { oak: 'Oak', maple: 'Maple', birch: 'Birch', pine: 'Pine', dead: 'Dead tree', palm: 'Palm', stonepine: 'Stone pine', mangrove: 'Mangrove', frostwood: 'Frostwood', charwood: 'Charwood' };
const _pcCursorDrawX = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawX(m);
  if (TITLE || PAUSED || !MOUSE.in || !S || !S.p || fishing || (typeof PLACING !== 'undefined' && PLACING) || selKind() === 'weapon') return;
  const [tx, ty] = faceTile(); if (!inb(m, tx, ty)) return;
  const [ax, ay, o] = mainOf(m, tx, ty), D = o && OBJ[o.k]; if (!D || !D.drop || !D.xp || D.place) return;
  const skill = D.xp[0], need = nodeReq(o); if (lifeL(skill) >= need) return;
  const X = tx * 16, Y = ty * 16; g.fillStyle = 'rgba(232,64,40,.9)';
  for (const [x0, y0, w, h] of [[X, Y, 4, 1], [X, Y, 1, 4], [X + 12, Y, 4, 1], [X + 15, Y, 1, 4], [X, Y + 15, 4, 1], [X, Y + 12, 1, 4], [X + 12, Y + 15, 4, 1], [X + 15, Y + 12, 1, 4]]) g.fillRect(x0, y0, w, h);
  const name = o.k === 'tree' ? TREE_N[o.kind || 'oak'] || 'Tree' : IT[D.drop[0][0]] ? IT[D.drop[0][0]].n.replace(/ Ore$/, '') + (D.ore ? ' vein' : '') : ({ ore_gem: 'Gem vein', crystalnode: 'Crystal' }[o.k] || o.k);
  const txt = name + ' · ' + SKN[skill] + ' ' + need, ly = (ay + (D.h || 1)) * 16 + 9; // under the node: canopies are drawn over this pass
  g.save(); g.font = '600 8px Fredoka, sans-serif'; g.textAlign = 'center'; g.lineWidth = 2.4; g.strokeStyle = 'rgba(42,28,24,.95)'; g.strokeText(txt, (ax + .5) * 16, ly); g.fillStyle = '#ff9a7a'; g.fillText(txt, (ax + .5) * 16, ly); g.restore();
};
