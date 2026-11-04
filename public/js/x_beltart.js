/* ================= Belts that join (asked 2026-11-04) =================
   Belts were one framed square each, iron crossbars at both ends, so a line looked like a row of boxes and a turn was a
   straight piece facing the new way. Now every belt is drawn in code from the same palettes as art/sprites/automation.py
   and automation2.py, knowing its neighbours (o.bl, worked out by beltLinks on every tick and map change):
     1 fed from behind, 2 fed from its east side, 4 from its west side (as it faces, drawn facing down), 8 it runs on into a belt.
   - An end that joins another belt loses its crossbar, so a line reads as one belt.
   - A belt fed from one side only, and not from behind, is a curve from that side round to its front.
   - A side feed opens a gap in the rail where the other belt comes in.
   - The pixel art is built facing down (u across, v along; a curve maps its ring onto the same u/v) and turned; Painterly
     uses it smoothed (smoothUp), as fences do, so runs join there too. Sorter, splitter and merger keep their gates and guides.
   An item that has just arrived is left off (y_anim.js slides it in on the overlay). */

const BP_ = {   // palettes, from automation.py / automation2.py
  WOOD: ['#3a2218', '#5a3622', '#7a4c2c', '#9a6638', '#b88450'], LWOOD: ['#5a3a22', '#8a5a34', '#b07c4c', '#c8985e', '#e0b47a'],
  IRON: ['#1e1e2a', '#2e3040', '#454a5c', '#6a7084', '#9aa2b4'], BELT: ['#3a2a20', '#5a4232', '#7a5a42', '#94704e'],
  COBALT: ['#1a2a5a', '#24408a', '#3a62c8', '#6a92f0', '#a8c4ff'], EMBER: ['#5a1408', '#a8301a', '#ff6a1a', '#ffb03a', '#fff0a0'],
  OBSID: ['#120c18', '#1e1626', '#2e2238', '#46365a', '#6a5a84'],
};
// the look of each belt across (u) and along (v) it, facing down; ends: which crossbars to draw; gaps: open side rails
function beltPx(kind, u, v, f, ends, gaps, curve) {
  const { WOOD, LWOOD, IRON, BELT, COBALT, EMBER, OBSID } = BP_;
  if (kind === 'chute') {
    if (u < 4 || u > 27) return null;
    const gapE = (gaps & 2) && u >= 24 && v >= 6 && v <= 25, gapW = (gaps & 4) && u <= 7 && v >= 6 && v <= 25;
    if (gapE || gapW) return (v % 8 === 2) ? LWOOD[1] : LWOOD[0];
    if (u <= 6) return LWOOD[3]; if (u >= 25) return LWOOD[2];
    if (u < 8 || u > 23) return LWOOD[1];
    if (!curve && (u === 15 || u === 16) && ((v >= 5 + f && v <= 7 + f) || (v >= 21 + f && v <= 23 + f))) return LWOOD[2];
    return v % 8 === 2 ? LWOOD[1] : LWOOD[0];   // every 8 (6 in the old sprite), so the slats run on across tiles
  }
  if (u < 2 || u > 29) return null;
  const P = kind === 'fast' ? { fr: IRON[2], rl: COBALT[3], rr: COBALT[1], ed: IRON[0], s1: BELT[1], s2: BELT[2], ch: COBALT[4], bar: COBALT[2], bw: 4, sc: 8, chev: [3, 10, 3, 4, 5] }
    : kind === 'rune' ? { fr: OBSID[2], rl: EMBER[3], rr: EMBER[1], ed: OBSID[0], s1: OBSID[2], s2: OBSID[3], ch: EMBER[3], bar: EMBER[2], bw: 4, sc: 8, chev: [3, 10, 3, 4, 5] }
    : { fr: WOOD[1], rl: WOOD[3], rr: WOOD[2], ed: WOOD[0], s1: BELT[1], s2: BELT[2], ch: BELT[3], bar: IRON[2], bw: 4, sc: 4, chev: [6, 14, 2, 2, 6] };
  if (((ends & 1) && v === 1) || ((ends & 2) && v === 30)) return P.bar;
  const slat = (((Math.floor((v + f * P.sc) / P.bw)) % 2) + 2) % 2 ? P.s2 : P.s1;
  const gapE = (gaps & 2) && u >= 26 && v >= 6 && v <= 25, gapW = (gaps & 4) && u <= 5 && v >= 6 && v <= 25;
  if (gapE || gapW) return slat;
  if (u <= 4) return u === 4 ? P.ed : P.rl;
  if (u >= 27) return u === 27 ? P.ed : P.rr;
  if (u < 6 || u > 25) return P.fr;
  if (curve) return slat;   // (chevrons smear round a curve: the belts either side show the way)
  const [y0, step, n, fs, len] = P.chev;   // chevrons point the way
  for (let k = 0; k < n; k++) { const y = (y0 + k * step + f * fs) % 32; for (let i = 0; i < len; i++) if (((v - y + 32) % 32) === i && (u === 10 + i || u === 21 - i)) return P.ch; }
  return slat;
}
const beltKind = k => k === 'chute' ? 'chute' : k === 'fastbelt' ? 'fast' : k === 'runebelt' ? 'rune' : 'conv';
// the joined belt, facing down, 32x32 art px: a straight piece, or a curve in from the east or the west
function beltCanvas(o, f, bl) {
  const kind = beltKind(o.k), plain = !['sorter', 'splitter', 'merger'].includes(o.k);
  const side = bl & 6, curve = plain && !(bl & 1) && (side === 2 || side === 4);
  const ends = (curve ? 0 : (bl & 1 ? 0 : 1)) | (bl & 8 ? 0 : 2), gaps = curve ? 0 : side;
  const c = mkCPU(32, 32, x => {
    const id = x.createImageData(32, 32), dt = id.data;
    for (let y = 0; y < 32; y++) for (let px = 0; px < 32; px++) {
      let u = px, v = y;
      if (curve) {   // a quarter ring round the bottom-east corner: in from the east edge, out at the bottom
        // the ring's radius is the distance across, exactly as on the straight belts it joins (u = 32 - r, floored), so the
        // rails and the slats meet theirs at both edges; inside r 2 and outside r 30 stay open
        // (from the east the ring is centred on the bottom-east corner, from the west on the bottom-west one; drawn, not
        // mirrored, so each rail keeps its own shade where it meets the straight belt)
        const east = side === 2, dx = east ? px + .5 - 32 : px + .5, dy = y + .5 - 32, r = Math.hypot(dx, dy);
        u = east ? Math.floor(32 - r) : Math.floor(r); v = Math.floor(Math.atan2(east ? -dx : dx, -dy) / (Math.PI / 2) * 32);
      }
      const col = beltPx(kind, u, v, f, ends, gaps, curve); if (!col) continue;
      const j = (y * 32 + px) * 4; dt[j] = parseInt(col.slice(1, 3), 16); dt[j + 1] = parseInt(col.slice(3, 5), 16); dt[j + 2] = parseInt(col.slice(5, 7), 16); dt[j + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); }, Y = '#e8c040', I = BP_.IRON;
    if (o.k === 'sorter' || o.k === 'splitter') {   // the gate, and the sorter's arrow or the splitter's fork
      R(5, 13, 22, 6, I[2]); R(5, 13, 22, 1, I[4]);
      if (o.k === 'sorter') { for (let i = 0; i < 3; i++) R(22 + i * 2, 14 + i, 2, 5 - i * 2, Y); }
      else { R(12, 20, 8, 2, Y); for (let i = 0; i <= 10; i++) R(16 + i, 20 + Math.round(i * .8), 1, 1, Y); }
    }
    if (o.k === 'merger') {   // steel guides down both sides, each with an inward chevron, and a brass plate at the outlet
      for (const s of [0, 1]) {
        const gx = s ? 27 : 1;
        R(gx, 1, 4, 30, '#2a2a30'); R(gx + 1, 2, 2, 28, '#8a8e98'); R(gx + (s ? 1 : 2), 2, 1, 28, '#c8ccd4');
        for (let i = 0; i < 3; i++) { const cx = s ? 25 - i : 6 + i; R(cx, 12 + i, 1, 1, '#e8b040'); R(cx, 18 - i, 1, 1, '#e8b040'); }
      }
      R(12, 27, 8, 4, '#2a2a30'); R(13, 28, 6, 2, '#e8b040');
    }
  });
  return c;
}
const BELTJ = new Map();
beltSprite = function (o, f) {
  const bl = o.bl || 0, item = o.item && !(o.slideT === TICK.n) ? o.item : '', st = SETTINGS.artStyle || 'pixel';
  const key = o.k + '|' + (o.d || 0) + '|' + f + '|' + bl + '|' + item + '|' + st, hit = BELTJ.get(key);
  if (hit && !hit.__lost) return hit;
  const base = beltCanvas(o, f, bl), rot = [0, Math.PI / 2, -Math.PI / 2, Math.PI][o.d || 0];
  let c = mk(32, 32, x => { x.translate(16, 16); x.rotate(rot); x.drawImage(base, -16, -16); }); c.ww = c.wh = 16;
  if (st !== 'pixel' && typeof smoothUp === 'function') c = smoothUp(c);
  if (item) { const k = c.width / 32, ic = itemIcon(parseK(item)[0]); if (ic) { const out = mk(c.width, c.height, x => { x.drawImage(c, 0, 0); x.drawImage(ic, 7 * k, 7 * k, 18 * k, 18 * k); }); out.ww = out.wh = 16; c = out; } }
  if (BELTJ.size > 1500) BELTJ.clear();
  BELTJ.set(key, c); return c;
};

/* ---- who feeds whom ---- */
// the ways a belt can send its item this tick, as s_auto.js and x_beltpull.js move it
function beltSends(b) {
  const d = b.d || 0;
  if (b.k === 'sorter') return b.filter ? [d, RIGHT[d]] : [d];
  if (b.k === 'splitter') {
    if (typeof splitCustom === 'function' && splitCustom(b)) { const w = b.so || { s: 1, r: 1 }, out = new Set(); for (const k of ['s', 'l', 'r']) if (w[k] > 0) out.add(SPLIT_OUT[k](d)); for (const id in b.route || {}) out.add(SPLIT_OUT[b.route[id]](d)); return [...out]; }
    return [d, RIGHT[d]];
  }
  return [d];
}
function beltLinks(m) {
  if (!m || !m.o) return;
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!isBelt(o)) continue;
    const x = i % m.w, y = i / m.w | 0, v = DIRV[o.d || 0], east = [v[1], -v[0]];
    const feeds = (dx, dy) => { const nx = x + dx, ny = y + dy; if (!inb(m, nx, ny)) return false; const n = getO(m, nx, ny); return isBelt(n) && beltSends(n).some(s => nx + DIRV[s][0] === x && ny + DIRV[s][1] === y); };
    let bl = 0;
    if (feeds(-v[0], -v[1])) bl |= 1;
    if (feeds(east[0], east[1])) bl |= 2;
    if (feeds(-east[0], -east[1])) bl |= 4;
    const fx = x + v[0], fy = y + v[1]; if (inb(m, fx, fy) && isBelt(getO(m, fx, fy))) bl |= 8;
    o.bl = bl;
  }
}
EVT.on('tick', () => { if (S && cur && cur.o && (cur.farm || cur.id.startsWith('plot_'))) beltLinks(cur); });
EVT.on('map', () => { if (S && cur) beltLinks(cur); });
// placing, rotating or picking up belts while the clock is stopped (windows, placing) still joins at once
for (const fn of ['useItem', 'delObj']) if (typeof window[fn] === 'function') window[fn] = (f => function () { const r = f.apply(this, arguments); try { if (S && cur && cur.farm) beltLinks(cur); } catch (e) { } return r; })(window[fn]);
addEventListener('keyup', () => { if (S && cur && cur.farm && !TITLE) beltLinks(cur); });
