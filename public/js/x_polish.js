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
