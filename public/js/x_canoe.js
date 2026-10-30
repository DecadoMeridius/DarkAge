/* The canoe: made at a workbench, worn in the Boat slot. With it worn, deep water is open to you:
   walk into a river or lake and you are in the canoe (S.p.boat), paddling; step onto land and you
   climb out. Click-to-walk paths over water too. Art: 'canoe' (hull + near gunwale) in implements.py. */
I('canoe', 'Canoe', 'boat', 400, 'obj', '#c08a52', null, { slot: 'boat', desc: 'Wear it in the Boat slot. Walk into deep water to paddle across rivers and lakes' });
SINGLE.add('boat');
RC.push(['canoe', 1, { wood: 40, hardwood: 4, fiber: 12 }, 'bench']);
recipeKnown = (f => function (r) { return r[0] === 'canoe' || f(r); })(recipeKnown);
WORN[3][1] = 'boat'; WORN_N.boat = 'Boat';
defaultAction = (f => function (id) { return IT[id] && IT[id].slot === 'boat' ? 'Wear' : f(id); })(defaultAction);

const hasCanoe = () => !!(S && S.eq && S.eq.boat && !S.mounted);
function withWater(fn) { const w = TER.w.solid; TER.w.solid = 0; try { return fn(); } finally { TER.w.solid = w; } }

// moving: water is open while the canoe is worn; in or out of it follows the tile under you
moveEnt = (f => function (m, e, dx, dy, hw) {
  if (e !== S.p || !hasCanoe()) return f(m, e, dx, dy, hw);
  const r = withWater(() => f(m, e, dx, dy, hw));
  const was = S.p.boat; S.p.boat = !!(TER[getT(m, Math.floor(e.x / 16), Math.floor((e.y - 2) / 16))] || {}).water;
  if (S.p.boat !== was) { SFX.pop(); for (let i = 0; i < 8; i++) PARTS.push({ x: e.x + (Math.random() - .5) * 14, y: e.y, vx: (Math.random() - .5) * 40, vy: -20 - Math.random() * 20, t: .4, c: '#c8e8ff' }); }
  return r;
})(moveEnt);
// click-to-walk routes over water while the canoe is worn
walkTo = (f => function (tx, ty, then) { return hasCanoe() ? withWater(() => f(tx, ty, then)) : f(tx, ty, then); })(walkTo);
EVT.on('map', () => { if (S && S.p) S.p.boat = false; });
EVT.on('tick', () => { if (S && S.p && S.p.boat && !hasCanoe()) S.p.boat = false; });

// drawn sitting in the canoe, paddling from side to side while moving, with a wake behind
drawPlayer = (f => function () {
  if (!S || !S.p || !S.p.boat || TITLE) return f();
  const p = S.p, P = playerPal(); if (!HC_P) HC_P = 'pl' + Math.random().toString(36).slice(2, 7);
  const right = p.dir === 2 || (p.dir !== 1 && p.lastH !== 1), bob = Math.round(Math.sin(gameT * 3)) * .5;
  const hull = PIX.get('canoe.0'), rim = PIX.get('canoe.1'), ps = humanSpr(HC_P, P, 2, 'ride');
  g.save(); g.translate(p.x, p.y + bob); if (!right) g.scale(-1, 1);
  g.fillStyle = 'rgba(20,40,70,.25)'; g.fillRect(-10, 0, 20, 2); // its shadow on the water
  if (hull) D(hull, -10, -7, 20, 8);
  D(ps, -7.5, -27.5, 16, 32);                                  // seated, legs inside the hull
  if (rim) D(rim, -10, -7, 20, 8);
  // the paddle: a stroke on one side, then the other
  const st = pl.moving ? (gameT * 2.2) % 2 : .5, side = st < 1 ? 1 : -1, k = st % 1;
  const hx = 2, hy = -14, bx = hx + side * (6 - k * 4) - k * 8 * (right ? 1 : 1), by = -1 + Math.sin(k * Math.PI) * 2;
  g.strokeStyle = '#7a4e2c'; g.lineWidth = 1; g.beginPath(); g.moveTo(hx + 4, hy - 4); g.lineTo(bx, by); g.stroke();
  g.fillStyle = '#c08a52'; g.fillRect(Math.round(bx * 2) / 2 - 1, Math.round(by * 2) / 2 - 1, 2, 3);
  g.restore();
  if (pl.moving && Math.random() < .5) PARTS.push({ x: p.x + (right ? -11 : 11) + (Math.random() - .5) * 3, y: p.y + 1, vx: (right ? -1 : 1) * 12, vy: 0, t: .5, c: 'rgba(220,240,255,.8)' });
})(drawPlayer);
