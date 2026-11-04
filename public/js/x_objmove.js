/* ================= Moving the shipping bin and the campfire (asked 2026-11-04) =================
   They were fixed in place: interacting only opened them. With the building hammer in hand, E or right click on
   the farm's shipping bin or a campfire offers Move: it lifts off (OMOVE), a ghost follows the mouse, green where it
   fits and red where it doesn't, left click sets it down, right click, Esc or leaving the map puts it back.
   The farm saves its objects as they are, so the new spot stays (genFarm's own bin and campfire are replaced by the
   saved objects on load). */
const OMOVE_K = new Set(['bin', 'campfire']);
let OMOVE = null;   // { o, x, y }: the lifted object and where it came from
const omoveName = o => o.k === 'bin' ? 'shipping bin' : 'campfire';
function omoveWhy(m, x, y) {
  if (!inb(m, x, y)) return 'off the map';
  if (getO(m, x, y)) return (typeof objLabel === 'function' ? objLabel(getO(m, x, y)) : 'something') + ' is there';
  if (m.solidB[y * m.w + x]) return 'a building is there';
  const t = TER[getT(m, x, y)]; if (t.solid) return 'the ground is rock'; if (t.water) return 'that’s water';
  if (m.soil[y * m.w + x]) return 'that’s tilled soil';
  if (Math.floor(S.p.x / 16) === x && Math.floor((S.p.y - 2) / 16) === y) return 'you’re standing there';
  if (m.warps && m.warps.some(w => w.x === x && w.y === y)) return 'that’s the way off the farm';
  return '';
}
const omoveAt = () => MOUSE.in ? mouseTile() : faceTile();
function omoveStart(m, x, y, o) {
  setO(m, x, y, null); OMOVE = { o, x, y }; CHUNK.clear();
  toast('Moving the ' + omoveName(o) + ': left click to set it down, right click to put it back.');
}
function omoveEnd(x, y) {
  const m = MAPS.farm, o = OMOVE.o; OMOVE = null;
  if (m) setO(m, x, y, o); CHUNK.clear();
}
const omoveCancel = () => { if (!OMOVE) return false; const { x, y } = OMOVE; omoveEnd(x, y); toast('Put back where it was.'); return true; };

objInteract = (f => function (m, x, y, o) {
  if (o && OMOVE_K.has(o.k) && m && m.farm && typeof hammerIn === 'function' && hammerIn() && !PLACING && !OMOVE) return { label: 'Move', fn: () => omoveStart(m, x, y, o) };
  return f.apply(this, arguments);
})(objInteract);
primaryUse = (f => function () {
  if (!OMOVE) return f.apply(this, arguments);
  const m = cur, [x, y] = omoveAt(), why = m && m.farm ? omoveWhy(m, x, y) : 'not here';
  if (why) { toast('Not there: ' + why + '.', 'bad'); SFX.bad(); return; }
  const n = omoveName(OMOVE.o); omoveEnd(x, y); SFX.ok(); toast(n[0].toUpperCase() + n.slice(1) + ' moved.', 'lvl');
})(primaryUse);
interact = (f => function () { if (OMOVE) { omoveCancel(); return; } return f.apply(this, arguments); })(interact);
addEventListener('keydown', e => { if (e.key === 'Escape' && OMOVE) { e.stopImmediatePropagation(); omoveCancel(); } }, true);
EVT.on('map', () => { if (OMOVE) { const { x, y } = OMOVE; omoveEnd(x, y); } });
// the ghost: the tile green or red, the object half see-through on it
pcCursorDraw = (f => function (m) {
  const r = f.apply(this, arguments);
  if (!OMOVE || !m || !m.farm) return r;
  const [x, y] = omoveAt(), ok = !omoveWhy(m, x, y), spr = objSprite(OMOVE.o, S.season);
  g.fillStyle = ok ? 'rgba(80, 220, 110, .35)' : 'rgba(230, 70, 60, .4)'; g.fillRect(x * 16, y * 16, 16, 16);
  if (spr) { g.globalAlpha = .6; const w = spr.ww || 16, h = spr.wh || 16; g.drawImage(spr, x * 16 + (16 - w) / 2, (y + 1) * 16 - h, w, h); g.globalAlpha = 1; }
  return r;
})(pcCursorDraw);
