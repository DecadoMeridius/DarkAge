/* ================= Storybook art, part 1 ================= */
const K = 4, INK = '#3b2a20', LW = .5, OUT = '#3b2a20';
function mkS(w, h, f) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * K)); c.height = Math.max(1, Math.ceil(h * K)); c.ww = w; c.wh = h; const x = c.getContext('2d'); x.scale(K, K); x.lineJoin = 'round'; x.lineCap = 'round'; if (f) f(x, c); return c; }
function E(x, cx, cy, rx, ry, rot) { x.beginPath(); x.ellipse(cx, cy, Math.max(.05, rx), Math.max(.05, ry), rot || 0, 0, 6.2832); }
function RR(x, X, Y, W, H, r) { x.beginPath(); r = Math.min(r, W / 2, H / 2); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
function F(x, fill, st = INK, lw = LW) { if (fill) { x.fillStyle = fill; x.fill(); } if (st) { x.strokeStyle = st; x.lineWidth = lw; x.stroke(); } }
function LG(x, x0, y0, x1, y1, ...cols) { const gr = x.createLinearGradient(x0, y0, x1, y1); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); return gr; }
function RG(x, cx, cy, r, c0, c1, ox = -.35, oy = -.45) { const gr = x.createRadialGradient(cx + ox * r, cy + oy * r, r * .05, cx, cy, r * 1.15); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; }
function ball(x, cx, cy, rx, ry, col, st = INK, lw = LW) { E(x, cx, cy, rx, ry); F(x, RG(x, cx, cy, Math.max(rx, ry), sh(col, .9), sh(col, -.9)), st, lw); }
function shine(x, cx, cy, rx, ry, a = .55, rot = -.6) { E(x, cx, cy, rx, ry, rot); x.fillStyle = 'rgba(255,255,245,' + a + ')'; x.fill(); }
function leaf(x, cx, cy, len, w, ang, col, st = INK) { x.save(); x.translate(cx, cy); x.rotate(ang); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * .5, -w, len, 0); x.quadraticCurveTo(len * .5, w, 0, 0); F(x, LG(x, 0, -w, 0, w, sh(col, .7), sh(col, -.7)), st, .32); x.beginPath(); x.moveTo(len * .1, 0); x.lineTo(len * .8, 0); x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = .25; x.stroke(); x.restore(); }
function blade(x, x0, y0, h, bend, w, col) { x.beginPath(); x.moveTo(x0 - w, y0); x.quadraticCurveTo(x0 + bend * .3, y0 - h * .6, x0 + bend, y0 - h); x.quadraticCurveTo(x0 + bend * .3 + w * .4, y0 - h * .6, x0 + w, y0); x.closePath(); x.fillStyle = col; x.fill(); }
function smoothPath(x, pts) { x.beginPath(); const n = pts.length; const mid = i => [(pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2]; let m0 = mid(n - 1); x.moveTo(m0[0], m0[1]); for (let i = 0; i < n; i++) { const m = mid(i); x.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } x.closePath(); }
function rockPts(cx, cy, rx, ry, seed, n = 9, flat = .35) { const r = rng(seed), pts = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283 - 1.57, j = .82 + r() * .3; let px_ = cx + Math.cos(a) * rx * j, py = cy + Math.sin(a) * ry * j; if (py > cy + ry * flat) py = cy + ry * flat + (py - cy - ry * flat) * .3; pts.push([px_, py]); } return pts; }
function softShadow(x, cx, cy, rx, ry, a = .28) { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, rx); gr.addColorStop(0, 'rgba(30,20,10,' + a + ')'); gr.addColorStop(1, 'rgba(30,20,10,0)'); x.save(); x.translate(cx, cy); x.scale(1, ry / rx); x.translate(-cx, -cy); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, rx, 0, 6.283); x.fill(); x.restore(); }
function scaleC(c, s) { return c; }
function outline(c) { return c; }

/* ================= Terrain ================= */
const GRASS = [['#82bd5f', '#609c45', '#467f36', '#acd67c'], ['#74ae54', '#57923f', '#3f7230', '#9ccb72'], ['#c9ac5c', '#a88a44', '#86683a', '#e2c77a'], ['#eef3f7', '#d4dee9', '#b9c8d8', '#ffffff']];
const TER = {
  g: { pri: 11 }, d: { pri: 8 }, s: { pri: 5 }, w: { pri: 1, solid: 1, water: 1 }, p: { pri: 9 }, sn: { pri: 10 }, i: { pri: 3 }, a: { pri: 6 }, st: { pri: 7 },
  l: { pri: 0, solid: 1, lava: 1 }, b: { pri: 1 }, r: { pri: 12, solid: 1 }, c: { pri: 4 }, x: { pri: 13, solid: 1 }, f: { pri: 4 }, mo: { pri: 13, solid: 1 },
};
const CAVE = { earth: ['#8f6e50', '#6e5238', '#a8865f', '#4e3a2a'], ice: ['#a9bfd1', '#8aa4ba', '#c8dae8', '#5a7290'], magma: ['#664236', '#4a2e26', '#7e5444', '#2e1a14'], void: ['#4a3d60', '#382d4c', '#5e507a', '#1e1830'] };
function groundStyle(t, s, theme) {
  switch (t) {
    case 'g': return { base: GRASS[s][0], d: GRASS[s][1], dd: GRASS[s][2], l: GRASS[s][3], kind: s === 3 ? 'snow' : 'grass', flowers: s < 3 };
    case 'sn': return { base: '#eef3f8', d: '#d6e0ec', dd: '#b8c7da', l: '#ffffff', kind: 'snow' };
    case 'd': return { base: '#d6b17c', d: '#b9925e', dd: '#9a764a', l: '#ecd2a2', kind: 'dirt' };
    case 's': return { base: '#f0dfae', d: '#dcc68c', dd: '#c4ab70', l: '#fff3cf', kind: 'sand' };
    case 'a': return { base: '#6e625a', d: '#5a4f48', dd: '#463c36', l: '#8a7d73', kind: 'ash' };
    case 'st': return { base: '#b8ae9c', d: '#9c927f', dd: '#7e7462', l: '#d2c9b8', kind: 'stone' };
    case 'p': return { base: '#a89e8c', d: '#8a8070', dd: '#6e6556', l: '#cfc6b4', kind: 'cobble' };
    case 'i': return { base: '#cdeaf6', d: '#a9d4ea', dd: '#88bcd8', l: '#f2fbff', kind: 'ice' };
    case 'w': return { base: '#5aa8d2', d: '#3f88b8', dd: '#2c6a98', l: '#9fd4ee', kind: 'water' };
    case 'l': return { base: '#e2662a', d: '#c2441c', dd: '#8a2a12', l: '#ffc85a', kind: 'lava' };
    case 'f': return { base: '#c08a56', d: '#9e6c40', dd: '#7a5030', l: '#d8a874', kind: 'plank' };
    case 'c': { const C = CAVE[theme || 'earth']; return { base: C[0], d: C[1], dd: C[3], l: C[2], kind: 'cave' }; }
    case 'xw': { const C = CAVE[theme || 'earth']; return { base: sh(C[1], -.6), d: C[3], dd: C[3], l: C[1], kind: 'wall' }; }
  }
  return { base: '#888', d: '#666', dd: '#444', l: '#aaa', kind: 'dirt' };
}
const CH = 8, KT = 3, CPX = CH * 16 * KT;
const TEXC = {};
function groundTex(t, s, theme) {
  const key = t + s + (theme || ''); if (TEXC[key]) return TEXC[key];
  const G = groundStyle(t, s, theme), P = CH * 16;
  const c = document.createElement('canvas'); c.width = c.height = CPX; const x = c.getContext('2d'); x.scale(KT, KT); x.lineCap = 'round';
  const wrap = (f) => { for (const ox of [-P, 0, P]) for (const oy of [-P, 0, P]) { x.save(); x.translate(ox, oy); f(); x.restore(); } };
  x.fillStyle = G.base; x.fillRect(0, 0, P, P);
  const r = rng(key.length * 97 + s * 13 + t.charCodeAt(0));
  for (let i = 0; i < 30; i++) { const cx = r() * P, cy = r() * P, rr = 6 + r() * 16, col = r() < .5 ? G.l : G.dd; wrap(() => { const gr = x.createRadialGradient(cx, cy, 0, cx, cy, rr); gr.addColorStop(0, rgba(col, .26)); gr.addColorStop(1, rgba(col, 0)); x.fillStyle = gr; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); }); }
  if (G.kind === 'grass') {
    for (let i = 0; i < 420; i++) { const X = r() * P, Y = r() * P, h = 1.6 + r() * 2.4, b = (r() - .5) * 1.6, col = [G.d, G.dd, G.l, G.d][Math.floor(r() * 4)]; wrap(() => blade(x, X, Y, h, b, .32, col)); }
    if (G.flowers) for (let i = 0; i < 18; i++) { const X = r() * P, Y = r() * P, fc = ['#fff3a0', '#ffffff', '#ffb8d0', '#c8b8ff'][Math.floor(r() * 4)]; wrap(() => { for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; E(x, X + Math.cos(a) * .55, Y + Math.sin(a) * .55, .45, .45); x.fillStyle = fc; x.fill(); } E(x, X, Y, .35, .35); x.fillStyle = '#f2b830'; x.fill(); }); }
  } else if (G.kind === 'snow') { for (let i = 0; i < 90; i++) { const X = r() * P, Y = r() * P; wrap(() => { E(x, X, Y, 1 + r() * 2.5, .5 + r(), 0); x.fillStyle = r() < .5 ? 'rgba(255,255,255,.7)' : rgba(G.d, .5); x.fill(); }); } }
  else if (G.kind === 'dirt' || G.kind === 'sand' || G.kind === 'ash' || G.kind === 'stone' || G.kind === 'cave') {
    for (let i = 0; i < 70; i++) { const X = r() * P, Y = r() * P, rr = .4 + r() * (G.kind === 'stone' ? 2.2 : 1.1); wrap(() => { E(x, X, Y, rr, rr * .75); x.fillStyle = r() < .5 ? G.d : G.l; x.fill(); if (rr > 1) { E(x, X - rr * .2, Y - rr * .25, rr * .5, rr * .3); x.fillStyle = rgba(G.l, .7); x.fill(); } }); }
    if (G.kind === 'sand') for (let i = 0; i < 6; i++) { const X = r() * P, Y = r() * P; wrap(() => { E(x, X, Y, 1, .7); x.fillStyle = '#f6d0c4'; x.fill(); }); }
    if (G.kind === 'ash') for (let i = 0; i < 14; i++) { const X = r() * P, Y = r() * P; wrap(() => { E(x, X, Y, .4, .4); x.fillStyle = '#ff9a4a'; x.fill(); }); }
  } else if (G.kind === 'cobble') {
    for (let row = 0; row < P / 5; row++) for (let col = 0; col < P / 6; col++) { const X = col * 6 + (row % 2) * 3 + (r() - .5), Y = row * 5 + (r() - .5); RR(x, X + .4, Y + .4, 5.2, 4.2, 1.6); F(x, LG(x, X, Y, X, Y + 5, G.l, r() < .5 ? G.base : sh(G.base, .3), G.d), rgba(G.dd, .8), .4); }
  } else if (G.kind === 'ice') { for (let i = 0; i < 20; i++) { const X = r() * P, Y = r() * P; wrap(() => { x.beginPath(); x.moveTo(X, Y); for (let k = 0; k < 4; k++) x.lineTo(X + (r() - .5) * 8, Y + (r() - .2) * 6); x.strokeStyle = rgba('#7fb4d4', .5); x.lineWidth = .3; x.stroke(); E(x, X + 2, Y - 1, 2.5, .5, -.3); x.fillStyle = 'rgba(255,255,255,.6)'; x.fill(); }); } }
  else if (G.kind === 'water') { for (let i = 0; i < 40; i++) { const X = r() * P, Y = r() * P, w = 2 + r() * 4; wrap(() => { x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo(X + w / 2, Y - .8, X + w, Y); x.strokeStyle = r() < .6 ? rgba(G.l, .55) : rgba(G.dd, .4); x.lineWidth = .45; x.stroke(); }); } }
  else if (G.kind === 'lava') { for (let i = 0; i < 30; i++) { const X = r() * P, Y = r() * P, w = 2 + r() * 5; wrap(() => { x.beginPath(); x.moveTo(X, Y); x.bezierCurveTo(X + w * .3, Y - 1.5, X + w * .7, Y + 1.5, X + w, Y); x.strokeStyle = r() < .5 ? '#ffd36a' : '#ff9a3a'; x.lineWidth = .7; x.stroke(); }); } }
  else if (G.kind === 'plank') { for (let Y = 0; Y < P; Y += 4) { x.fillStyle = Y % 8 ? G.base : sh(G.base, .15); x.fillRect(0, Y, P, 4); x.fillStyle = G.dd; x.fillRect(0, Y + 3.6, P, .4); for (let X = (Y * 7) % 13; X < P; X += 13) x.fillRect(X, Y, .4, 4); } }
  TEXC[key] = c; return c;
}
const CM = 4, CPXE = (CH * 16 + 2 * CM) * KT, MR = 170, NR = 160, NZ = new Float32Array(NR * NR);
(function () { const P = NR, waves = []; const r = rng(99); for (let i = 0; i < 9; i++) waves.push([1 + Math.floor(r() * 5), Math.floor(r() * 5) - 2, r() * 6.28, .5 / (i * .35 + 1)]); for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) { let v = 0; for (const [a, b, ph, amp] of waves) v += Math.sin((a * x + b * y) / P * 6.2832 * 3 + ph) * amp; NZ[y * P + x] = v * .1; } })();
const mkC = (w) => { const c = document.createElement('canvas'); c.width = c.height = w; return c; };
const maskC = mkC(MR), maskX = maskC.getContext('2d'), maskD = maskX.createImageData(MR, MR);
const foamC = mkC(MR), foamX = foamC.getContext('2d'), foamD = foamX.createImageData(MR, MR);
const tintC = mkC(MR), tintX = tintC.getContext('2d');
const tmpC = mkC(CPXE), tmpX = tmpC.getContext('2d');
const GRID = new Float32Array((CH + 2) * (CH + 2));
function paintKey(m, x, y) {
  x = clamp(x, 0, m.w - 1); y = clamp(y, 0, m.h - 1); const i = y * m.w + x; let t = m.t[i];
  if (t === 'r' || t === 'mo') { t = m.bio ? (BIOMES[m.bio[i]] === 'frost' ? 'sn' : BIOMES[m.bio[i]] === 'ash' ? 'a' : 'g') : 'g'; }
  if (t === 'x') return 'xw'; if (t === 'b') return 'w';
  if (t === 'g' && m.bio && BIOMES[m.bio[i]] === 'frost') return 'sn';
  return t;
}
const PPRI = { l: 0, w: 1, i: 2, c: 3, f: 3, s: 4, a: 5, st: 6, d: 7, p: 8, sn: 9, g: 10, xw: 12 };
function buildMask(test, keys, foam) {
  for (let i = 0; i < GRID.length; i++) GRID[i] = test(keys[i]) ? 1 : 0;
  const A = maskD.data, Fd = foamD.data, G2 = CH + 2, span = CH * 16 + 2 * CM, sc = span / MR;
  for (let py = 0; py < MR; py++) {
    const wy = (py + .5) * sc - CM, gy = wy / 16 + .5, y0 = gy | 0, fy = gy - y0, r0 = y0 * G2, r1 = r0 + G2, ny = ((((wy / 128) * NR) | 0) % NR + NR) % NR * NR;
    for (let px_ = 0; px_ < MR; px_++) {
      const wx = (px_ + .5) * sc - CM, gx = wx / 16 + .5, x0 = gx | 0, fx = gx - x0;
      const top = GRID[r0 + x0] + (GRID[r0 + x0 + 1] - GRID[r0 + x0]) * fx, bot = GRID[r1 + x0] + (GRID[r1 + x0 + 1] - GRID[r1 + x0]) * fx;
      const v = top + (bot - top) * fy + NZ[ny + ((((wx / 128) * NR) | 0) % NR + NR) % NR], o = (py * MR + px_) * 4 + 3;
      A[o] = v < .45 ? 0 : v > .55 ? 255 : (v - .45) * 2550;
      if (foam) Fd[o] = v > .5 ? 0 : v < .2 ? 0 : (1 - Math.abs(v - .37) / .17) * 255;
    }
  }
  maskX.putImageData(maskD, 0, 0); if (foam) foamX.putImageData(foamD, 0, 0);
  return maskC;
}
(function () { for (const D of [maskD, foamD]) for (let i = 0; i < D.data.length; i += 4) { D.data[i] = D.data[i + 1] = D.data[i + 2] = 255; } })();
function tinted(mask, col) { tintX.globalCompositeOperation = 'source-over'; tintX.clearRect(0, 0, MR, MR); tintX.drawImage(mask, 0, 0); tintX.globalCompositeOperation = 'source-in'; tintX.fillStyle = col; tintX.fillRect(0, 0, MR, MR); tintX.globalCompositeOperation = 'source-over'; return tintC; }
function paintChunk(m, cx, cy) {
  const c = mkC(CPXE), x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; tmpX.imageSmoothingEnabled = true;
  const s = m.indoor || m.dark ? 0 : S.season, th = m.theme;
  const keys = []; const present = new Set(); for (let j = 0; j < CH + 2; j++) for (let i = 0; i < CH + 2; i++) { const k = paintKey(m, cx * CH + i - 1, cy * CH + j - 1); keys.push(k); present.add(k); }
  const layers = [...present].sort((a, b) => PPRI[a] - PPRI[b]);
  const pat = (t) => { const p = x.createPattern(groundTex(t, s, th), 'repeat'); p.setTransform && p.setTransform(new DOMMatrix().translate(CM * KT, CM * KT)); return p; };
  x.fillStyle = pat(layers[0]); x.fillRect(0, 0, CPXE, CPXE);
  const hasW = present.has('w') || present.has('l'), firstLand = layers.findIndex(k => PPRI[k] > 1);
  for (let li = 1; li < layers.length; li++) {
    const L = layers[li], P = PPRI[L], doFoam = hasW && li === firstLand, mask = buildMask(k => PPRI[k] >= P, keys, doFoam);
    if (doFoam) { const lava = present.has('l') && !present.has('w'); x.globalAlpha = .85; x.drawImage(tinted(foamC, lava ? '#ffcf7a' : '#f4fbff'), 0, 0, CPXE, CPXE); x.globalAlpha = 1; }
    x.globalAlpha = L === 'g' || L === 'sn' ? .34 : .26; x.drawImage(tinted(mask, '#2a1a0c'), 0, 1.6 * KT, CPXE, CPXE); x.globalAlpha = 1;
    tmpX.globalCompositeOperation = 'source-over'; tmpX.clearRect(0, 0, CPXE, CPXE); const tp = tmpX.createPattern(groundTex(L, s, th), 'repeat'); tp.setTransform && tp.setTransform(new DOMMatrix().translate(CM * KT, CM * KT)); tmpX.fillStyle = tp; tmpX.fillRect(0, 0, CPXE, CPXE); tmpX.globalCompositeOperation = 'destination-in'; tmpX.drawImage(mask, 0, 0, CPXE, CPXE); tmpX.globalCompositeOperation = 'source-over'; x.drawImage(tmpC, 0, 0);
  }
  x.save(); x.scale(KT, KT); x.translate(CM - cx * CH * 16, CM - cy * CH * 16); x.lineJoin = 'round';
  for (let j = -1; j <= CH; j++) for (let i = -1; i <= CH; i++) {
    const X = cx * CH + i, Y = cy * CH + j; if (!inb(m, X, Y)) continue; const t = getT(m, X, Y);
    if (t === 'b') { const vert = TER[getT(m, X - 1, Y)].water || TER[getT(m, X + 1, Y)].water; x.fillStyle = 'rgba(20,40,60,.25)'; x.fillRect(X * 16, Y * 16 + 2, 16, 16); for (let k = 0; k < 4; k++) { if (vert) RR(x, X * 16 + .3, Y * 16 + k * 4 + .2, 15.4, 3.6, 1); else RR(x, X * 16 + k * 4 + .2, Y * 16 + .3, 3.6, 15.4, 1); F(x, LG(x, X * 16, Y * 16, X * 16, Y * 16 + 16, '#c99a62', '#a87a46'), INK, .35); } }
    if ((t === 'r' || t === 'x') && getT(m, X, Y + 1) !== t) {
      const rock = t === 'r' ? ['#b0a28a', '#8c7e68', '#6a5e4e'] : (() => { const C = CAVE[m.theme || 'earth']; return [C[2], C[1], C[3]]; })();
      const lft = getT(m, X - 1, Y) !== t, rgt = getT(m, X + 1, Y) !== t;
      const top = Y * 16 + 5, bot = Y * 16 + 17;
      const gr = x.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, rock[0]); gr.addColorStop(.5, rock[1]); gr.addColorStop(1, rock[2]);
      x.fillStyle = 'rgba(20,10,5,.28)'; RR(x, X * 16 - .5, bot - 2, 17, 6, 3); x.fill();
      RR(x, X * 16 + (lft ? 1 : -1), top, 16 + (lft ? -1 : 1) + (rgt ? -1 : 1), bot - top, 3); F(x, gr, INK, .5);
      const r = rng(X * 31 + Y * 7); for (let k = 0; k < 3; k++) { const yy = top + 3 + k * 3 + r(); x.beginPath(); x.moveTo(X * 16 + 2, yy); x.quadraticCurveTo(X * 16 + 8, yy + (r() - .5) * 1.5, X * 16 + 14, yy); x.strokeStyle = 'rgba(40,25,15,.3)'; x.lineWidth = .4; x.stroke(); }
      for (let k = 0; k < 2; k++) { const xx = X * 16 + 3 + r() * 10; x.beginPath(); x.moveTo(xx, top + 2); x.lineTo(xx + (r() - .5) * 2, top + 7); x.strokeStyle = 'rgba(40,25,15,.35)'; x.stroke(); }
      if (t === 'r') { const pk = paintKey(m, X, Y), capc = pk === 'sn' ? '#f2f6fa' : pk === 'a' ? '#7a6d64' : GRASS[s][0]; x.beginPath(); x.moveTo(X * 16 - .2, top - 1); for (let k = 0; k <= 4; k++) x.quadraticCurveTo(X * 16 + k * 4 - 2, top + 2.2 + (k % 2) * .8, X * 16 + k * 4, top + .4); x.lineTo(X * 16 + 16.2, top - 1.5); x.closePath(); F(x, capc, INK, .4); }
    }
  }
  x.restore();
  return c;
}

/* ================= Trees ================= */
const TREEPAL = {
  oak: ['#6fae4a', '#5d9c3c', '#d98a2e', null], maple: ['#7bb84e', '#62a23f', '#d4502e', null], birch: ['#a6cf5a', '#8fbe48', '#e8c040', null],
  pine: ['#3f7d52', '#3a764c', '#46805a', '#3f7656'], palm: ['#6ab04a', '#6ab04a', '#78a848', '#5f9a48'], dead: [null, null, null, null],
  apple: ['#6fae4a', '#5d9c3c', '#5d9c3c', null], cherry: ['#f2b8cc', '#5d9c3c', '#c8803a', null], peach: ['#6fae4a', '#5d9c3c', '#c8a03a', null],
  orange: ['#4f9440', '#4f9440', '#4f9440', null], plum: ['#e8e0f0', '#5d9c3c', '#a8662a', null], pomegranate: ['#5d9c3c', '#5d9c3c', '#5d9c3c', null],
};
const FRUITCOL = { apple: [2, '#d8342a'], cherry: [0, '#c4183a'], peach: [1, '#ffaa70'], orange: [1, '#ff9a1a'], plum: [0, '#7a2a8a'], pomegranate: [2, '#c0182a'] };
function canopy(x, cl, col, seed) {
  cl.forEach(c => { E(x, c[0], c[1], c[2] + .7, c[3] + .7); x.fillStyle = INK; x.fill(); });
  cl.forEach(c => { E(x, c[0], c[1], c[2], c[3]); x.fillStyle = RG(x, c[0], c[1], Math.max(c[2], c[3]), sh(col, .55), sh(col, -.85)); x.fill(); });
  x.save(); x.beginPath(); cl.forEach(c => { x.moveTo(c[0] + c[2], c[1]); x.ellipse(c[0], c[1], c[2], c[3], 0, 0, 6.2832); }); x.clip();
  const r = rng(seed);
  for (let i = 0; i < 95; i++) { const c = cl[Math.floor(r() * cl.length)], a = r() * 6.28, d = Math.sqrt(r()), X = c[0] + Math.cos(a) * c[2] * d, Y = c[1] + Math.sin(a) * c[3] * d; const lit = (c[1] - Y) / c[3] + (c[0] - X) / c[2] * .6; E(x, X, Y, .9 + r() * 1.3, .6 + r() * .8, r() * 3); x.fillStyle = lit > .45 ? sh(col, 1.3) : lit < -.5 ? sh(col, -1.2) : sh(col, (r() - .5) * .9); x.globalAlpha = .8; x.fill(); }
  x.globalAlpha = 1;
  cl.forEach(c => { E(x, c[0] + c[2] * .1, c[1] + c[3] * .9, c[2] * .75, c[3] * .32); x.fillStyle = 'rgba(25,40,20,.22)'; x.fill(); E(x, c[0] - c[2] * .32, c[1] - c[3] * .38, c[2] * .42, c[3] * .3, -.4); x.fillStyle = 'rgba(255,250,200,.16)'; x.fill(); });
  x.restore();
}
function trunk(x, bx, by, h, w, col, birch) {
  x.beginPath(); x.moveTo(bx - w * 1.1, by); x.quadraticCurveTo(bx - w * .55, by - 1.5, bx - w * .5, by - h * .45); x.lineTo(bx - w * .42, by - h); x.lineTo(bx + w * .42, by - h); x.lineTo(bx + w * .5, by - h * .45); x.quadraticCurveTo(bx + w * .55, by - 1.5, bx + w * 1.15, by); x.quadraticCurveTo(bx, by + 1, bx - w * 1.1, by);
  F(x, LG(x, bx - w, 0, bx + w, 0, sh(col, .8), col, sh(col, -1.1)));
  if (birch) for (let k = 0; k < 5; k++) { RR(x, bx - w * .45 + (k % 2) * w * .4, by - h * .2 - k * h * .17, w * .45, .6, .3); x.fillStyle = '#3a3330'; x.fill(); }
  else for (let k = 0; k < 3; k++) { x.beginPath(); const xx = bx - w * .25 + k * w * .25; x.moveTo(xx, by - 1.5); x.quadraticCurveTo(xx + .4, by - h * .5, xx - .2, by - h * .9); x.strokeStyle = 'rgba(30,15,5,.28)'; x.lineWidth = .35; x.stroke(); }
}
function branch(x, X, Y, len, ang, w, col, depth, snow) {
  const ex = X + Math.cos(ang) * len, ey = Y + Math.sin(ang) * len;
  x.beginPath(); x.moveTo(X, Y); x.quadraticCurveTo((X + ex) / 2 + Math.sin(ang) * len * .15, (Y + ey) / 2, ex, ey); x.strokeStyle = INK; x.lineWidth = w + .7; x.stroke(); x.strokeStyle = col; x.lineWidth = w; x.stroke();
  if (snow && w > .6) { x.beginPath(); x.moveTo(X, Y - w * .5); x.lineTo(ex, ey - w * .5); x.strokeStyle = 'rgba(255,255,255,.9)'; x.lineWidth = w * .45; x.stroke(); }
  if (depth > 0) { branch(x, ex, ey, len * .68, ang - .45, w * .66, col, depth - 1, snow); branch(x, ex, ey, len * .62, ang + .42, w * .62, col, depth - 1, snow); }
}
function treeSprite(kind, s, fruit, v) {
  const pal = (TREEPAL[kind] || TREEPAL.oak)[s];
  return mkS(40, 58, x => {
    softShadow(x, 20, 55.5, 11, 3, .3);
    const tcol = kind === 'birch' ? '#efe9dc' : kind === 'dead' ? '#7a6e66' : kind === 'palm' ? '#b0844e' : '#8a5a34', r = rng(kind.length * 31 + s * 7 + v * 101);
    if (kind === 'palm') {
      for (let i = 0; i < 12; i++) { const t = i / 12, X = 20 + Math.sin(t * 2.4) * 4 * (v ? -1 : 1), Y = 55 - t * 38; RR(x, X - 2.2 + t, Y - 3.6, 4.4 - t * 1.6, 3.8, 1.2); F(x, LG(x, X - 2, 0, X + 2, 0, sh(tcol, .6), sh(tcol, -.8)), INK, .4); }
      const tx = 20 + Math.sin(2.4) * 4 * (v ? -1 : 1), ty = 17;
      [[-2.6, 0], [-1.6, 1], [-.6, 1], [.4, 1], [1.4, 1], [2.5, 0], [-1, -1], [1.1, -1]].forEach(([a, k]) => { x.save(); x.translate(tx, ty); x.rotate(a * .55); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(8, -6 - k * 2, 16, 3); x.quadraticCurveTo(8, -1 - k, 0, 0); F(x, LG(x, 0, -6, 0, 4, sh(pal, .5), sh(pal, -.9)), INK, .4); x.beginPath(); x.moveTo(1, -.4); x.quadraticCurveTo(8, -4.5 - k * 1.6, 15, 2.6); x.strokeStyle = 'rgba(30,50,20,.4)'; x.lineWidth = .3; x.stroke(); x.restore(); });
      [[-1, 1], [1, 1]].forEach(() => { }); x.save(); x.translate(tx, ty); x.scale(-1, 1); [[-1.6, 1], [-.6, 1], [.4, 1], [1.4, 1]].forEach(([a, k]) => { x.save(); x.rotate(a * .55); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(8, -6 - k * 2, 15, 3); x.quadraticCurveTo(8, -1 - k, 0, 0); F(x, LG(x, 0, -6, 0, 4, sh(pal, .3), sh(pal, -1)), INK, .4); x.restore(); }); x.restore();
      ball(x, tx - 1.2, ty + 1.5, 1.4, 1.4, '#7a5a2a'); ball(x, tx + 1.3, ty + 1.8, 1.4, 1.4, '#7a5a2a'); return;
    }
    if (kind === 'dead' || !pal) {
      trunk(x, 20, 55, 22, 4.2, tcol, kind === 'birch');
      const snw = s === 3 && kind !== 'dead';
      branch(x, 19, 34, 9, -2.1, 1.8, tcol, 3, snw); branch(x, 21, 34, 9, -1.05, 1.8, tcol, 3, snw); branch(x, 20, 38, 7, -2.7, 1.2, tcol, 2, snw); branch(x, 20, 38, 7, -.45, 1.2, tcol, 2, snw);
      return;
    }
    if (kind === 'pine') {
      trunk(x, 20, 55, 10, 3.2, '#7a4e2c');
      const snow = s === 3;
      for (let i = 3; i >= 0; i--) {
        const top = 3 + i * 10, w = 6 + i * 4.2 + (v ? .8 : 0), h = 15, bot = top + h;
        x.beginPath(); x.moveTo(20, top); x.quadraticCurveTo(20 - w * .35, top + h * .55, 20 - w, bot); for (let k = 0; k < 5; k++) { const x0 = 20 - w + k * w * .4; x.quadraticCurveTo(x0 + w * .2, bot + 1.6, x0 + w * .4, bot); } x.quadraticCurveTo(20 + w * .35, top + h * .55, 20, top);
        F(x, LG(x, 20 - w, 0, 20 + w, 0, sh(pal, .7), pal, sh(pal, -1)), INK, .5);
        for (let k = 0; k < 14; k++) { const yy = top + 3 + r() * (h - 3), half = w * (yy - top) / h; E(x, 20 + (r() * 2 - 1) * half * .8, yy, 1 + r(), .5, (r() - .5) * .6); x.fillStyle = r() < .5 ? sh(pal, .9) : sh(pal, -.8); x.globalAlpha = .7; x.fill(); x.globalAlpha = 1; }
        if (snow) { x.beginPath(); x.moveTo(20, top + .2); x.quadraticCurveTo(20 - w * .3, top + h * .35, 20 - w * .62, top + h * .62); for (let k = 0; k < 4; k++) x.quadraticCurveTo(20 - w * .62 + k * w * .31 + w * .15, top + h * .48, 20 - w * .62 + (k + 1) * w * .31, top + h * .62); x.quadraticCurveTo(20 + w * .3, top + h * .35, 20, top + .2); F(x, LG(x, 0, top, 0, top + h * .6, '#ffffff', '#dfe8f2'), INK, .35); }
      }
      return;
    }
    const small = !!FRUITCOL[kind], sc = small ? .8 : 1, cy = small ? 26 : 22;
    trunk(x, 20, 55, small ? 22 : 26, small ? 3.4 : 4.4, tcol, kind === 'birch');
    const base = kind === 'maple' ? [[0, 0, 11, 12], [-8, 4, 7, 7], [8, 4, 7, 7], [-5, -8, 7, 7], [5, -8, 7, 7], [0, -14, 6, 6]] : kind === 'birch' ? [[0, -2, 8, 10], [-6, 5, 6, 7], [6, 5, 6, 7], [0, -11, 6, 6], [-4, -6, 5, 6], [4, -6, 5, 6]]
      : [[0, 0, 13, 11], [-9, 4, 8, 7], [9, 4, 8, 7], [-6, -7, 8, 7], [6, -7, 8, 7], [0, -11, 8, 6], [0, 7, 10, 6]];
    const cl = base.map(([dx, dy, rx, ry]) => [20 + (dx + (r() - .5) * 2) * sc, cy + (dy + (r() - .5) * 2) * sc, rx * sc * (.92 + r() * .16), ry * sc * (.92 + r() * .16)]);
    canopy(x, cl, kind === 'cherry' && s === 0 ? '#6fae4a' : kind === 'plum' && s === 0 ? '#6fae4a' : pal, kind.length + s * 5 + v);
    if (s === 0 && (kind === 'oak' || kind === 'cherry' || kind === 'plum' || kind === 'apple')) for (let i = 0; i < 26; i++) { const c = cl[Math.floor(r() * cl.length)], a = r() * 6.28, d = Math.sqrt(r()) * .9; const X = c[0] + Math.cos(a) * c[2] * d, Y = c[1] + Math.sin(a) * c[3] * d; const pc = kind === 'oak' ? '#ffd2e0' : kind === 'cherry' ? '#ffb0cc' : '#ffffff'; for (let k = 0; k < 5; k++) { E(x, X + Math.cos(k * 1.26) * .55, Y + Math.sin(k * 1.26) * .55, .5, .5); x.fillStyle = pc; x.fill(); } E(x, X, Y, .3, .3); x.fillStyle = '#e88aa8'; x.fill(); }
    if (fruit && FRUITCOL[kind]) for (let i = 0; i < 9; i++) { const c = cl[Math.floor(r() * cl.length)], a = r() * 6.28, d = Math.sqrt(r()) * .85; const X = c[0] + Math.cos(a) * c[2] * d, Y = c[1] + Math.sin(a) * c[3] * d; ball(x, X, Y, 1.25, 1.25, FRUITCOL[kind][1], INK, .3); shine(x, X - .45, Y - .45, .45, .3, .7); }
  });
}
const TREE = {};
function treeImg(kind, s, fruitOn, v = 0) { const k = kind + s + (fruitOn ? 'f' : '') + v; return TREE[k] || (TREE[k] = treeSprite(kind, s, fruitOn, v)); }
