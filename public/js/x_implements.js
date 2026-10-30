/* Horse implements as things on the farm (art in art/sprites/implements.py).
   - Use a plough, seed drill, harrow or cart from the backpack to set it down on the farm ('impl' object).
   - Ride up to it and interact to hitch it (S.hitch = { k, on }). It is drawn behind the horse.
   - G (or the bar's button) lowers and raises it: lowered, every tile you cross is worked three wide
     (the old implementTick); raised, you just ride. The cart works while hitched: what you pick up goes in it.
   - Press E with nothing in front of you, or the bar's Unhitch, to leave it standing where it is.
     Dismounting unhitches too. On foot, interact with a standing implement to pick it up. */
const IMPLS = ['plough', 'seeddrill', 'harrow', 'cart'];
OBJ.impl = { solid: 1 };
for (const k of IMPLS) if (IT[k]) IT[k].desc = 'Set it down on your farm, ride up to it and hitch it to your horse. G lowers and raises it';

const hitchK = () => S && S.mounted && S.hitch ? S.hitch.k : null;
const hitchWorking = () => !!(hitchK() && (S.hitch.k === 'cart' || S.hitch.on));
function asKind(k, fn) { const sk = selKind; selKind = () => k; try { return fn(); } finally { selKind = sk; } }

// working: only a lowered, hitched implement does anything (not the item selected on the hotbar)
const _implementTickH = implementTick;
implementTick = function () {
  if (!hitchWorking() || S.hitch.k === 'cart') { lastHorseTile = null; return; }
  asKind(S.hitch.k, _implementTickH);
  if (pl.moving && cur && cur.farm && Math.random() < .5) { const b = behindPt(); PARTS.push({ x: b[0] + (Math.random() - .5) * 8, y: b[1], vx: (Math.random() - .5) * 20, vy: -14, t: .35, c: S.hitch.k === 'seeddrill' ? '#d8b860' : '#8a6040' }); }
};
const _giveH = give;
give = function (id, n, q, quiet) { const k = hitchK() === 'cart' ? 'cart' : selKind() === 'cart' ? null : selKind(); return asKind(k, () => _giveH(id, n, q, quiet)); };
const _objInteractH = objInteract;
objInteract = function (m, x, y, o) {
  if (o.k === 'impl') {
    const n = IT[o.id] ? IT[o.id].n : o.id;
    if (S.mounted) return S.hitch ? { label: 'Busy', fn: () => toast('Unhitch the ' + IT[S.hitch.k].n.toLowerCase() + ' first.') } : { label: 'Hitch ' + n, fn: () => hitch(m, x, y, o) };
    return { label: 'Pick up', fn: () => { setO(m, x, y, null); give(o.id, 1); SFX.pop(); } };
  }
  return asKind(hitchK() === 'cart' ? 'cart' : selKind() === 'cart' ? null : selKind(), () => _objInteractH(m, x, y, o));
};
const _hudTickH = hudTick;
hudTick = function (dt) { asKind(hitchK() === 'cart' ? 'cart' : selKind() === 'cart' ? null : selKind(), () => _hudTickH(dt)); hitchBar(); };

function hitch(m, x, y, o) {
  setO(m, x, y, null); S.hitch = { k: o.id, on: false }; SFX.ok();
  toast(IT[o.id].n + ' hitched. ' + (o.id === 'cart' ? 'What you pick up now goes in the cart; interact with a storage crate to unload.' : 'Press G to lower it and work the ground, G again to raise it.'), 'lvl');
}
function unhitch(quiet) {
  if (!S.hitch) return;
  const k = S.hitch.k, m = cur, [bx, by] = behindPt();
  let spot = null;
  if (m && m.farm) for (let r = 0; r < 4 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) {
    const x = Math.floor(bx / 16) + dx, y = Math.floor(by / 16) + dy;
    if (inb(m, x, y) && !getO(m, x, y) && !m.solidB[y * m.w + x] && !TER[getT(m, x, y)].solid && !TER[getT(m, x, y)].water && !m.soil[y * m.w + x] && !(x === Math.floor(S.p.x / 16) && y === Math.floor((S.p.y - 2) / 16))) spot = [x, y];
  }
  if (spot) setO(m, spot[0], spot[1], { k: 'impl', id: k }); else give(k, 1); // off the farm (or no room) it goes back in the bag
  if (k === 'cart' && S.cart && sum(S.cart)) toast('The cart still holds ' + sum(S.cart) + ' items. Hitch it again and unload it at a storage crate.');
  S.hitch = null; lastHorseTile = null; if (!quiet) { SFX.ok(); toast(IT[k].n + (spot ? ' left here.' : ' put back in your bag.')); }
}
function toggleLower() {
  if (!S.hitch || !S.mounted || S.hitch.k === 'cart') return;
  S.hitch.on = !S.hitch.on; SFX.ok();
  if (S.hitch.on && !(cur && cur.farm)) toast('It only works the ground on your farm.');
}
const behindPt = () => { const right = S.p.dir === 2 || (S.p.dir !== 1 && S.p.lastH !== 1); return [S.p.x + (right ? -30 : 30), S.p.y]; };

// placing from the bag
const _useItemH = useItem;
useItem = function (id) {
  const it = IT[id];
  if (!it || it.t !== 'implement') return _useItemH(id);
  const m = cur; if (!m || !m.farm) { toast('Set it down on your farm.'); return; }
  if (S.mounted) { toast('Get off the horse to set it down, then ride up and hitch it.'); return; }
  const [tx, ty] = faceTile(), i = ty * m.w + tx;
  if (!inb(m, tx, ty) || getO(m, tx, ty) || m.solidB[i] || TER[getT(m, tx, ty)].solid || TER[getT(m, tx, ty)].water || (m.soil[i] && m.soil[i].crop)) { toast('Something is in the way.'); return; }
  take(id); setO(m, tx, ty, { k: 'impl', id }); SFX.till(); toast(it.n + ' set down. Ride up to it and interact to hitch it.');
};
// in the hand it reads Place; on a click away it walks over first (x_fix4 handles 'place' and 'path')
const _primaryUseH = primaryUse;
primaryUse = function () {
  const k = selKind(), it = k && IT[k];
  if (it && it.t === 'implement' && !PAUSED && !TITLE && S && cur) { const [tx, ty] = clickTarget(); if (!inReach(tx, ty)) { walkTo(tx, ty, 'use'); return; } }
  return _primaryUseH();
};

// interacting with nothing while hitched unhitches; dismounting unhitches; a hitch never outlives the ride
const _toggleRideH = toggleRide;
toggleRide = function () { if (S.mounted && S.hitch) unhitch(); return _toggleRideH(); };
EVT.on('tick', () => { if (S && S.hitch && !S.mounted) { give(S.hitch.k, 1, 0, true); S.hitch = null; } });
addEventListener('keydown', e => {
  if (e.repeat || TITLE || MODAL || (e.target && /input|textarea/i.test(e.target.tagName))) return;
  if (e.key === 'g' || e.key === 'G') toggleLower();
  if ((e.key === 'e' || e.key === 'E') && S && S.mounted && S.hitch && !PAUSED && !findInteract()) unhitch(); // E with nothing in front: leave it here
});

// drawn behind the horse, with traces to the harness
objSprite = (f => function (o, season) { return o.k === 'impl' ? PIX.get('impl_' + o.id + '.0') || SPR.chest[0] : f(o, season); })(objSprite);
const _drawPlayerH = drawPlayer;
drawPlayer = function () {
  if (S.mounted && S.hitch && !TITLE) {
    const right = S.p.dir === 2 || (S.p.dir !== 1 && S.p.lastH !== 1), [bx, by] = behindPt();
    const lowered = S.hitch.k === 'cart' ? (S.cart && sum(S.cart) > 0) : S.hitch.on, spr = PIX.get('impl_' + S.hitch.k + '.' + (lowered ? 1 : 0));
    if (spr) {
      shadow(bx, by, 9);
      g.save(); g.translate(bx, by); if (!right) g.scale(-1, 1);
      const bob = pl.moving && !lowered ? Math.round(Math.sin(gameT * 18)) * .5 : 0;
      D(spr, -spr.ww / 2, -spr.wh + 1 + bob); g.restore();
      g.strokeStyle = '#5a3a22'; g.lineWidth = 1; g.beginPath(); // traces from the implement's hitch to the harness
      const hx = bx + (right ? spr.ww / 2 - 1 : -spr.ww / 2 + 1), hy = by - spr.wh + (S.hitch.k === 'cart' ? 7 : S.hitch.k === 'harrow' ? (lowered ? 7 : 5) : 7);
      g.moveTo(hx, hy); g.lineTo(S.p.x + (right ? -12 : 12), S.p.y - 16); g.stroke();
    }
  }
  return _drawPlayerH();
};

// the bar: what is hitched, lower / raise, unhitch
function hitchBar() {
  let b = document.getElementById('hitchbar');
  const k = hitchK();
  if (!k || TITLE) { if (b) b.hidden = true; return; }
  if (!b) {
    b = el('div', { id: 'hitchbar', class: 'f-panel' }, el('b', { id: 'hbname' }), el('button', { id: 'hblow', class: 'btn', on: toggleLower }), el('button', { class: 'btn ghost', on: () => unhitch() }, 'Unhitch'));
    b.addEventListener('mousedown', e => e.stopPropagation()); document.body.append(b);
  }
  b.hidden = false;
  const name = IT[k].n + (k === 'cart' ? ' · ' + sum(S.cart || {}) + ' / ' + CART_CAP : S.hitch.on ? ' · working' : ' · raised'), low = document.getElementById('hblow');
  if (document.getElementById('hbname').textContent !== name) document.getElementById('hbname').textContent = name;
  low.hidden = k === 'cart'; const t = S.hitch.on ? 'Raise (G)' : 'Lower (G)'; if (low.textContent !== t) low.textContent = t;
}
