/* Joined fences (art/sprites/props_hand.py): each fence remembers which neighbours are fences
   (o.fm: 1 north, 2 east, 4 south, 8 west) and draws fence_<mask>, so runs across and runs up and
   down look different. Masks are refreshed when you arrive on a map and every couple of ticks. */
function fenceMasks(m) {
  if (!m || !m.o) return;
  const isF = (x, y) => { const o = inb(m, x, y) && m.o[y * m.w + x]; return !!(o && o.k === 'fence'); };
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o || o.k !== 'fence') continue;
    const x = i % m.w, y = (i / m.w) | 0;
    o.fm = (isF(x, y - 1) ? 1 : 0) | (isF(x + 1, y) ? 2 : 0) | (isF(x, y + 1) ? 4 : 0) | (isF(x - 1, y) ? 8 : 0);
  }
}
EVT.on('map', () => fenceMasks(cur));
EVT.on('tick', n => { if (n % 2 === 0) fenceMasks(cur); });
objSprite = (f => function (o, season) { if (o.k === 'fence') { const s = PIX.get('fence_' + (o.fm === undefined ? 10 : o.fm)); if (s) return s; } return f(o, season); })(objSprite);
