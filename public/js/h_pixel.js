/* ================= Pixel art (atlas-backed sprites) =================
   Sprites are drawn by the Python scripts in art/ and packed into public/art/atlas.png
   with atlas.json. Art is 32px per tile: 2 art pixels per world unit (TS = 16).
   PIX.get(name) returns a canvas sized in art pixels with ww/wh in world units,
   so it drops straight into D() like the painted sprites it replaces. */
const PIX = {
  img: null, map: {}, cache: {},
  async load() {
    const [meta, img] = await Promise.all([
      fetch('art/atlas.json').then(r => r.json()),
      new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = 'art/atlas.png'; }),
    ]);
    this.img = img; this.map = meta.frames;
  },
  has(n) { return !!this.map[n]; },
  get(n) {
    if (this.cache[n] && !this.cache[n].__lost) return this.cache[n];
    const f = this.map[n]; if (!f) return null;
    const c = (/^(hb_|en_|an_|crop_)/.test(n) ? mkCPU : mk)(f.w, f.h, x => x.drawImage(this.img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h));   // character layers and creature/crop templates are only read on the CPU (humanSpr, pixTemplate): kept in normal memory
    c.ww = f.w / 2; c.wh = f.h / 2; if (f.ax !== undefined) { c.ax = f.ax / 2; c.ay = f.ay / 2; }
    return this.cache[n] = c;
  },
};

/* ---- crisp pixel zoom: an even scale so one art pixel (half a world unit) is a whole number of screen pixels ---- */
function pixZoom(H) { return Math.max(2, Math.round(H / (TS * 11) / 2) * 2); }

/* ---- sprite overrides: use atlas art where it exists, painted art otherwise ---- */
const FRUIT_KINDS = new Set(['apple', 'cherry', 'peach', 'orange', 'plum', 'pomegranate']);
const _treeImg = treeImg;
treeImg = function (kind, s, fruitOn, v = 0) {
  const n = FRUIT_KINDS.has(kind) ? `tree_${kind}_${s}_${fruitOn ? 'f' : '0'}` : `tree_${kind}_${s}_${v}`;
  return PIX.get(n) || _treeImg(kind, s, fruitOn, v);
};
const _buildObjects = buildObjects;
buildObjects = function () {
  _buildObjects();
  for (const k of Object.keys(SPR)) {
    const v = SPR[k];
    if (Array.isArray(v)) SPR[k] = v.map((e, i) => Array.isArray(e) ? e.map((e2, j) => PIX.get(`${k}_${i}.${j}`) || e2) : PIX.get(`${k}.${i}`) || e); // seasons / frames
    else { const c = PIX.get(k); if (c) SPR[k] = c; }
  }
};

/* ---- pixel ground: per art pixel, the highest-priority terrain whose smoothed
   tile field passes 0.5 (plus a little pixel-scale jitter) wins. Edges get a lit rim
   on the upper terrain, a dark lip under it, and foam where land meets water. ---- */
const PXG = { M: 8, tex: {} };
function groundKey(k, s, theme) {
  if (k === 'g') return 'ground_g_' + s;
  if (k === 'c' || k === 'xw') return 'ground_' + k + '_' + (theme || 'earth');
  return 'ground_' + k;
}
function groundPixels(k, s, theme) {
  const n = groundKey(k, s, theme);
  if (PXG.tex[n]) return PXG.tex[n];
  const c = PIX.get(n); if (!c) return null;
  return PXG.tex[n] = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
}
const _paintChunk = paintChunk;
paintChunk = function (m, cx, cy) {
  if (!PIX.has('ground_g_0')) return _paintChunk(m, cx, cy);
  if (GROUND_SLICED && !m.indoor && ((PIX.get('ground_g_0') || {}).hi || 1) > 1) return { job: paintChunkHiGen(m, cx, cy) };
  const M = PXG.M, SP = CH * 32, N = SP + 2 * M, G2 = CH + 2;
  const s = m.indoor || m.dark ? 0 : S.season, th = m.theme;
  const keys = [], present = new Set();
  for (let j = 0; j < G2; j++) for (let i = 0; i < G2; i++) { const k = paintKey(m, cx * CH + i - 1, cy * CH + j - 1); keys.push(k); present.add(k); }
  const layers = [...present].sort((a, b) => PPRI[a] - PPRI[b]);
  const fields = layers.map(L => { const P = PPRI[L], f = new Float32Array(G2 * G2); for (let i = 0; i < f.length; i++) f[i] = PPRI[keys[i]] >= P ? 1 : 0; return f; });
  const lay = new Uint8Array(N * N), ox = cx * SP - M, oy = cy * SP - M, exact = m.theme === 'indoor'; // rooms keep hard tile edges
  for (let py = 0; py < N; py++) for (let px_ = 0; px_ < N; px_++) {
    const ax = ox + px_, ay = oy + py; // absolute art-pixel coords
    const gx = (px_ - M) / 32 + .5, gy = (py - M) / 32 + .5, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const jit = (fbm(ax * .045, ay * .045, 17, 2) - .5) * .5 + (hsh(ax >> 1, ay >> 1, 9) - .5) * .12;
    let L = 0;
    if (exact) { const ti = Math.floor((px_ - M) / 32), tj = Math.floor((py - M) / 32); lay[py * N + px_] = inb(m, cx * CH + ti, cy * CH + tj) ? Math.max(0, layers.indexOf(keys[(tj + 1) * G2 + ti + 1])) : 255; continue; }
    for (let li = layers.length - 1; li > 0; li--) {
      const f = fields[li], r0 = y0 * G2 + x0, r1 = r0 + G2;
      const v = (f[r0] + (f[r0 + 1] - f[r0]) * fx) * (1 - fy) + (f[r1] + (f[r1 + 1] - f[r1]) * fx) * fy;
      if (v + jit > .5) { L = li; break; }
    }
    lay[py * N + px_] = L;
  }
  const GK = (PIX.get('ground_g_0') || {}).hi || 1;   // an art style with hi-res ground (x_artstyle.js)
  if (GK > 1) return pixGroundHi(m, cx, cy, lay, layers, N, M, SP, ox, oy, s, th, GROUND_K, GK);   // painted at GROUND_K px per art px (2 = the screen at the usual zoom); the textures are GK
  const c = mk(N, N), x = c.getContext('2d'), img = x.createImageData(N, N), d = img.data;
  const texs = layers.map(L => groundPixels(L, s, th));
  const wet = layers.map(L => L === 'w' || L === 'l');
  for (let py = 0; py < N; py++) for (let px_ = 0; px_ < N; px_++) {
    const i = py * N + px_, L = lay[i], T = texs[L], o = i * 4;
    if (L === 255) { d[o] = 12; d[o + 1] = 8; d[o + 2] = 10; d[o + 3] = 255; continue; } // outside a room
    const tx = (((ox + px_) % 64) + 64) % 64, ty = (((oy + py) % 64) + 64) % 64, to = (ty * 64 + tx) * 4;
    let r = T ? T[to] : 128, gg = T ? T[to + 1] : 128, b = T ? T[to + 2] : 128;
    if (layers[L] === 'p' && !exact) { // paving: patches of wear and moss in the grout, so the texture doesn't read as one repeating tile
      const ax = ox + px_, ay = oy + py, w = .9 + fbm(ax * .018, ay * .018, 5, 2) * .2; r *= w; gg *= w; b *= w;
      if (r + gg + b < 330 && fbm(ax * .05, ay * .05, 23, 2) > .69) { r = r * .7 + 20; gg = gg * .8 + 38; b = b * .6 + 8; }
    }
    const up = py > 0 ? lay[i - N] : L, up2 = py > 1 ? lay[i - 2 * N] : L, dn = py < N - 1 ? lay[i + N] : L;
    const lf = px_ > 0 ? lay[i - 1] : L, rt = px_ < N - 1 ? lay[i + 1] : L;
    if (wet[L]) {
      // foam on water next to land, one solid pixel plus a dithered second
      const near1 = [up, dn, lf, rt].some(n => !wet[n]);
      const near2 = !near1 && ((py > 1 && !wet[up2]) || (py < N - 2 && !wet[lay[i + 2 * N]]) || (px_ > 1 && !wet[lay[i - 2]]) || (px_ < N - 2 && !wet[lay[i + 2]]));
      const foam = layers[L] === 'l' ? [255, 207, 122] : [230, 246, 255];
      if (near1 || (near2 && (px_ + py) % 2 === 0)) { r = foam[0]; gg = foam[1]; b = foam[2]; }
    } else if (up > L || up2 > L) {
      const k = up > L ? .62 : .78; r *= k; gg *= k; b *= k * 1.06; // lip shadow under a higher terrain's edge
    } else if (dn < L || lf < L || rt < L) {
      r = r + (255 - r) * .14; gg = gg + (255 - gg) * .14; b = b + (255 - b) * .08; // lit rim on the edge
    }
    d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  pixCliffsAndBridges(x, m, cx, cy, M, s);
  c.m = M; c.span = SP;
  return c;
};

/* the same chunk for a painted style, as slices (see pixGroundHiGen): the terrain layout too yields as it goes */
function* paintChunkHiGen(m, cx, cy) {
  const M = PXG.M, SP = CH * 32, N = SP + 2 * M, G2 = CH + 2;
  const s = m.indoor || m.dark ? 0 : S.season, th = m.theme;
  const keys = [], present = new Set();
  for (let j = 0; j < G2; j++) for (let i = 0; i < G2; i++) { const k = paintKey(m, cx * CH + i - 1, cy * CH + j - 1); keys.push(k); present.add(k); }
  const layers = [...present].sort((a, b) => PPRI[a] - PPRI[b]);
  const fields = layers.map(L => { const P = PPRI[L], f = new Float32Array(G2 * G2); for (let i = 0; i < f.length; i++) f[i] = PPRI[keys[i]] >= P ? 1 : 0; return f; });
  // natural ground (grass, snow, ash, ice, sand) is smoothed a little before its edge is found, so a border between biomes
  // curves instead of stepping tile by tile (art playtest: stair-stepped biome borders); roads, paving and water keep their shape
  // round 3: the diagonal neighbours count too (half weight), so a road or shore running diagonally rounds its tile steps
  // off; a one-tile path still keeps its width. Dirt roads and paths are smoothed as well.
  const SMOOTHK = { g: 1, sn: 1, a: 1, i: 1, s: 1, d: 1, p: 1 };
  fields.forEach((f, li) => { if (!SMOOTHK[layers[li]]) return; const o = f.slice();
    for (let j = 0; j < G2; j++) for (let i = 0; i < G2; i++) { const at = (I, J) => o[Math.max(0, Math.min(G2 - 1, J)) * G2 + Math.max(0, Math.min(G2 - 1, I))];
      f[j * G2 + i] = (4 * at(i, j) + at(i - 1, j) + at(i + 1, j) + at(i, j - 1) + at(i, j + 1) + .5 * (at(i - 1, j - 1) + at(i + 1, j - 1) + at(i - 1, j + 1) + at(i + 1, j + 1))) / 10; } });
  const lay = new Uint8Array(N * N), ox = cx * SP - M, oy = cy * SP - M, exact = m.theme === 'indoor'; // rooms keep hard tile edges
  for (let py = 0; py < N; py++) { if ((py & 15) === 15) yield; for (let px_ = 0; px_ < N; px_++) {
    const ax = ox + px_, ay = oy + py; // absolute art-pixel coords
    const gx = (px_ - M) / 32 + .5, gy = (py - M) / 32 + .5, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    // only the broad wobble: the per-pixel hash noise made painted borders ragged in art-pixel steps (round 3)
    const jit = (fbm(ax * .045, ay * .045, 17, 2) - .5) * .5;
    let L = 0;
    if (exact) { const ti = Math.floor((px_ - M) / 32), tj = Math.floor((py - M) / 32); lay[py * N + px_] = inb(m, cx * CH + ti, cy * CH + tj) ? Math.max(0, layers.indexOf(keys[(tj + 1) * G2 + ti + 1])) : 255; continue; }
    for (let li = layers.length - 1; li > 0; li--) {
      const f = fields[li], r0 = y0 * G2 + x0, r1 = r0 + G2;
      const v = (f[r0] + (f[r0 + 1] - f[r0]) * fx) * (1 - fy) + (f[r1] + (f[r1 + 1] - f[r1]) * fx) * fy;
      if (v + jit > .5) { L = li; break; }
    }
    lay[py * N + px_] = L;
  } }
  const GK = (PIX.get('ground_g_0') || {}).hi || 1;
  return yield* pixGroundHiGen(m, cx, cy, lay, layers, N, M, SP, ox, oy, s, th, GROUND_K, GK);
}

/* the same ground at GK px per art pixel, for art styles whose ground textures are hi-res: terrain shapes, foam,
   lips and rims are worked out per art pixel exactly as above, the texture is sampled at full resolution.
   The canvas keeps a GK scale, so the cliffs, bridges and room walls drawn on it afterwards stay in art px. */
let GROUND_SLICED = false;   // set by f_render's getChunk while it asks for a chunk it can wait for
const GROUND_K = 2;   // at 4 (the texture's own resolution) a chunk took 150-300 ms and stuttered as it scrolled in
function* pixGroundHiGen(m, cx, cy, lay, layers, N, M, SP, ox, oy, s, th, GK, TK = GK) {
  const TS_ = TK / GK;   // texture px per output px
  const texs = layers.map(L => groundPixels(L, s, th)), tws = texs.map(T => T ? Math.round(Math.sqrt(T.length / 4)) : 64);
  const tmean = texs.map(T => { if (!T) return [128, 128, 128]; const a = [0, 0, 0]; for (let i = 0; i < T.length; i += 64) { a[0] += T[i]; a[1] += T[i + 1]; a[2] += T[i + 2]; } const n = T.length / 64; return a.map(v => v / n); });
  const TC = .7;   // a painted ground is calmer than its texture (the example scenes: shadows read on it)
  const SOFT = { s: 1, a: 1, st: 1, d: 1, sn: 1, g: 1, i: 1, p: 2, l: 1 }, soft = layers.map(L => SOFT[L] || 0);   // 2: paving switches copies sharply (a soft blend showed doubled stones)   // natural grounds take the mirrored copy; paving and floors would show doubled stones
  const wet = layers.map(L => L === 'w' || L === 'l'), mode = new Uint8Array(N * N);   // 1 foam, 2 lava foam, 3/4 lip, 5 rim, 6 outside a room
  const vary = new Float32Array(N * N), warmv = new Float32Array(N * N), mixw = new Float32Array(N * N), mixs = new Uint8Array(N * N);   // broad light and colour drift, and patches where a mirrored, shifted copy of the texture takes over, so it doesn't read as repeating tiles
  for (let py = 0; py < N; py++) { if ((py & 31) === 31) yield; for (let px_ = 0; px_ < N; px_++) { const ax = ox + px_, ay = oy + py, i = py * N + px_; vary[i] = .86 + fbm(ax * .011, ay * .011, 31, 3) * .28; warmv[i] = (fbm(ax * .007 + 40, ay * .007, 37, 2) - .5) * 26; const fb = fbm(ax * .021 + 9, ay * .021, 43, 2), t = Math.min(1, Math.max(0, (fb - .4) * 5)); mixw[i] = t * t * (3 - 2 * t); const f2 = fbm(ax * .017 + 71, ay * .017 + 13, 47, 2); mixs[i] = f2 > .56 ? 2 : fb > .48 ? 1 : 0; } }
  for (let py = 0; py < N; py++) for (let px_ = 0; px_ < N; px_++) {
    const i = py * N + px_, L = lay[i]; if (L === 255) { mode[i] = 6; continue; }
    const up = py > 0 ? lay[i - N] : L, up2 = py > 1 ? lay[i - 2 * N] : L, dn = py < N - 1 ? lay[i + N] : L;
    const lf = px_ > 0 ? lay[i - 1] : L, rt = px_ < N - 1 ? lay[i + 1] : L;
    if (wet[L]) {
      const near1 = [up, dn, lf, rt].some(n => !wet[n]);
      const near2 = !near1 && ((py > 1 && !wet[up2]) || (py < N - 2 && !wet[lay[i + 2 * N]]) || (px_ > 1 && !wet[lay[i - 2]]) || (px_ < N - 2 && !wet[lay[i + 2]]));
      if (near1 || (near2 && (px_ + py) % 2 === 0)) mode[i] = layers[L] === 'l' ? 2 : 1;
    } else if (up > L || up2 > L) mode[i] = up > L ? 3 : 4;
    else if (dn < L || lf < L || rt < L) mode[i] = 5;
  }
  const NH = N * GK, P64 = 64 * GK, c = mk(NH, NH), x = c.getContext('2d'), img = x.createImageData(NH, NH), d = img.data;
  for (let Y = 0; Y < NH; Y++) {
    if ((Y & 15) === 15) yield;
    const py = (Y / GK) | 0, hy = (((oy * GK + Y) % P64) + P64) % P64;
    const gy = (Y + .5) / GK - .5, y0 = Math.max(0, Math.min(N - 2, Math.floor(gy))), fy = Math.min(1, Math.max(0, gy - y0));
    for (let X = 0; X < NH; X++) {
      let i = py * N + ((X / GK) | 0), L = lay[i];
      // where terrains meet, take the one with the most bilinear weight here, so edges run smoothly instead of in art-pixel steps
      const gx = (X + .5) / GK - .5, x0 = Math.max(0, Math.min(N - 2, Math.floor(gx))), j00 = y0 * N + x0, la = lay[j00], lb = lay[j00 + 1], lc = lay[j00 + N], ld = lay[j00 + N + 1];
      if (la !== lb || la !== lc || la !== ld) {
        const fx = Math.min(1, Math.max(0, gx - x0)), w = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy], js = [j00, j00 + 1, j00 + N, j00 + N + 1];
        let best = -1, bw = -1; for (let q = 0; q < 4; q++) { const Lq = lay[js[q]]; let s = 0; for (let r = 0; r < 4; r++) if (lay[js[r]] === Lq) s += w[r]; if (s > bw) { bw = s; best = q; } }
        i = js[best]; L = lay[i];
      }
      const md = mode[i], o = (Y * NH + X) * 4;
      if (md === 6) { d[o] = 12; d[o + 1] = 8; d[o + 2] = 10; d[o + 3] = 255; continue; }
      const T = texs[L], tw = tws[L], P = tw > 64 ? tw : P64, hx = tw > 64 ? (((Math.floor((ox * GK + X) * TS_)) % P) + P) % P : (((ox * GK + X) % P) + P) % P, hyy = tw > 64 ? (((Math.floor((oy * GK + Y) * TS_)) % P) + P) % P : (((oy * GK + Y) % P) + P) % P;  // a styled texture repeats every tw px (128 art px), a plain one every 64 art px
      const to = (((hyy * tw / P) | 0) * tw + ((hx * tw / P) | 0)) * 4;
      let r = T ? T[to] : 128, gg = T ? T[to + 1] : 128, b = T ? T[to + 2] : 128;
      const mw = soft[L] === 2 ? (mixs[i] ? 1 : 0) : soft[L] ? mixw[i] : 0;
      if (T && soft[L] === 2 && mixs[i] === 2) {   // paving's third copy: turned a quarter (rows for columns) and shifted
        const t3 = ((((hx + (P * .23 | 0)) % P) * tw / P | 0) * tw + (((hyy + (P * .71 | 0)) % P) * tw / P | 0)) * 4;
        r = T[t3]; gg = T[t3 + 1]; b = T[t3 + 2];
      } else if (T && mw > 0) {   // the second copy: mirrored and shifted by an odd amount (both still tile)
        const t2 = ((((hyy + (P * .37 | 0)) % P) * tw / P | 0) * tw + ((P - 1 - (hx + (P * .61 | 0)) % P) * tw / P | 0)) * 4;
        r += (T[t2] - r) * mw; gg += (T[t2 + 1] - gg) * mw; b += (T[t2 + 2] - b) * mw;
      }
      if (!wet[L]) { const M = tmean[L]; r = M[0] + (r - M[0]) * TC; gg = M[1] + (gg - M[1]) * TC; b = M[2] + (b - M[2]) * TC; }
      if (!wet[L]) { const v = vary[i], wv = warmv[i]; r = r * v + wv; gg = gg * v + wv * .4; b = b * v - wv * .3; }
      if (md === 1 || md === 2) { const F = md === 1 ? [230, 246, 255] : [255, 207, 122]; r += (F[0] - r) * .38; gg += (F[1] - gg) * .38; b += (F[2] - b) * .38; }   // foam: a soft wash over the water, not a solid 1 px line (it stair-stepped in a painted style)
      else if (md === 3 || md === 4) { const k = md === 3 ? .62 : .78; r *= k; gg *= k; b *= k * 1.06; }
      else if (md === 5) { r += (255 - r) * .14; gg += (255 - gg) * .14; b += (255 - b) * .08; }
      d[o] = r; d[o + 1] = gg; d[o + 2] = b; d[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  // cliffs and bridges are drawn in art pixels on their own layer, then laid on smoothly (soft, not 4x blocks)
  const cl = mk(N, N); pixCliffsAndBridges(cl.getContext('2d'), m, cx, cy, M, s);
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(cl, 0, 0, NH, NH); x.imageSmoothingEnabled = false;
  x.setTransform(GK, 0, 0, GK, 0, 0);
  c.m = M * GK; c.span = SP * GK; c.hi = GK;
  return c;
}
/* painted in slices: f_render advances it a few ms a frame (a whole chunk took 60-300 ms and stuttered as it scrolled
   in); pixGroundHi runs it to the end at once (rooms, map changes) */
function pixGroundHi() { const it = pixGroundHiGen.apply(this, arguments); let r; do r = it.next(); while (!r.done); return r.value; }

/* raised cliff ground: every r / x tile is solid, so mark the whole block, not only its
   bottom face. Darker top, rock side walls where it meets open ground, a lit far edge and
   a few loose stones. Without this, cliff interiors looked like walkable grass. */
function cliffTop(P, m, X, Y, t, bx, by) {
  const C = t === 'r' ? ['#4a4036', '#6a5e4e', '#8c7e68', '#b0a28a', '#c8bca4'] : (() => { const c = CAVE[m.theme || 'earth']; return [c[3], sh(c[1], -.6), c[1], c[0], c[2]]; })();
  const open = (dx, dy) => inb(m, X + dx, Y + dy) && getT(m, X + dx, Y + dy) !== t;
  P(bx, by, 32, 32, t === 'r' ? 'rgba(236,224,196,.14)' : 'rgba(10,6,4,.35)'); // a raised plateau: lit a touch lighter than the ground below (round 3: the dark wash read as pits)
  if (t === 'r') for (let k = 0; k < 5; k++) if (hsh(X * 7 + k, Y, 53) < .6) { const sx = bx + 3 + (hsh(X, Y * 5 + k, 11) * 24 | 0), sy = by + 4 + (hsh(Y, X + k * 3, 19) * 22 | 0), w = 3 + (hsh(k, X, Y) * 4 | 0); P(sx, sy, w, 2, C[2]); P(sx, sy, w - 1, 1, C[3]); P(sx + 1, sy + 2, w, 1, C[0]); }
  if (SETTINGS.artStyle !== 'pixel') {   // painted styles: rims that wander in width, no ruled lines (cliffs read as outlined boxes)
    const wob = (k, a) => 2 + Math.round(hsh(X * 13 + (k >> 2), Y * 7 + a, 71) * 3);
    if (open(0, -1)) for (let k = 0; k < 32; k++) { const w = wob(k, 1); P(bx + k, by, 1, w, C[4]); P(bx + k, by + w, 1, 1, C[3]); }
    if (open(-1, 0)) for (let k = 0; k < 32; k++) { const w = wob(k, 2); P(bx, by + k, w, 1, C[2]); P(bx + w, by + k, 1, 1, C[1]); }
    if (open(1, 0)) for (let k = 0; k < 32; k++) { const w = wob(k, 3); P(bx + 32 - w, by + k, w, 1, C[1]); }
  } else {
  if (open(0, -1)) { P(bx, by, 32, 3, C[4]); P(bx, by + 3, 32, 1, C[3]); P(bx, by - 1, 32, 1, 'rgba(20,12,8,.5)'); }
  if (open(-1, 0)) { P(bx, by, 4, 32, C[2]); P(bx, by, 1, 32, C[3]); P(bx + 3, by, 1, 32, C[0]); }
  if (open(1, 0)) { P(bx + 28, by, 4, 32, C[1]); P(bx + 28, by, 1, 32, C[0]); P(bx + 31, by, 1, 32, C[0]); }
  }
  for (let k = 0; k < 3; k++) if (hsh(X * 3 + k, Y, 41) < .45) { const sx = bx + 5 + (hsh(X, Y * 3 + k, 7) * 20 | 0), sy = by + 5 + (hsh(Y, X + k, 9) * 18 | 0); P(sx, sy, 3, 2, C[3]); P(sx, sy, 2, 1, C[4]); P(sx + 1, sy + 2, 3, 1, C[0]); }
}

/* rock walls (r / x tiles whose lower neighbour is open) and plank bridges, in art pixels */
function pixCliffsAndBridges(x, m, cx, cy, M, s) {
  const P = (X, Y, W, H, col) => { x.fillStyle = col; x.fillRect(X, Y, W, H); };
  for (let j = -1; j <= CH; j++) for (let i = -1; i <= CH; i++) {
    const X = cx * CH + i, Y = cy * CH + j; if (!inb(m, X, Y)) continue;
    const t = getT(m, X, Y), bx = M + i * 32, by = M + j * 32;
    if (t === 'b') {
      const vert = TER[getT(m, X - 1, Y)].water || TER[getT(m, X + 1, Y)].water;
      P(bx, by + 4, 32, 32, 'rgba(20,40,60,.3)');
      for (let k = 0; k < 4; k++) {
        const [X0, Y0, W0, H0] = vert ? [bx, by + k * 8, 32, 7] : [bx + k * 8, by, 7, 32];
        P(X0, Y0, W0, H0, '#3e2a1a'); P(X0 + 1, Y0 + 1, W0 - 2, H0 - 2, k % 2 ? '#b07c4c' : '#c08a56');
        P(X0 + 1, Y0 + 1, vert ? W0 - 2 : 1, vert ? 1 : H0 - 2, '#d8a874');
        P(vert ? X0 + 3 : X0 + 3, vert ? Y0 + 3 : Y0 + 3, 1, 1, '#3a2a20');
      }
    }
    if (t === 'r' || (t === 'x' && m.theme !== 'indoor')) cliffTop(P, m, X, Y, t, bx, by); // the whole block reads as raised, not just its front face
    if ((t === 'r' || (t === 'x' && m.theme !== 'indoor')) && getT(m, X, Y + 1) !== t) {
      const C = t === 'r' ? ['#5a4e40', '#6a5e4e', '#8c7e68', '#b0a28a', '#c8bca4'] : (() => { const c = CAVE[m.theme || 'earth']; return [c[3], sh(c[1], -.6), c[1], c[0], c[2]]; })();
      const lft = getT(m, X - 1, Y) !== t, rgt = getT(m, X + 1, Y) !== t;
      const top = by + 10, bot = by + 34, x0 = bx + (lft ? 2 : 0), x1 = bx + 32 - (rgt ? 2 : 0);
      P(x0 + 2, bot, x1 - x0, 4, 'rgba(20,10,5,.32)'); // contact shadow
      P(x0, top, x1 - x0, bot - top, C[0]);
      const r = rng(X * 31 + Y * 7);
      const natural = t === 'r' || m.mine || /^(cave_|warren_|gseam)/.test(m.id || '');   // caves are natural rock; built dungeons keep their courses (art pass 2: brick in every mine)
      if (!natural) for (let yy = top + 1; yy < bot - 1; yy++) { // built walls: stacked stone courses, lit top row, dark seams
        const row = Math.floor((yy - top - 1) / 6), ry = (yy - top - 1) % 6;
        for (let xx = x0 + 1; xx < x1 - 1; xx++) {
          const seam = ry === 5 || (xx - bx + row * 5 + (hsh(X, row, 3) * 6 | 0)) % 11 === 0;
          const tone = seam ? C[0] : ry === 0 ? C[4] : ry < 3 ? C[3] : ry < 5 ? C[2] : C[1];
          P(xx, yy, 1, 1, tone);
        }
      } else { // natural rock: light from above, wandering cracks, a broken ledge, darker toward the foot
        const cracks = [0, 1, 2].map(k => bx + 4 + (hsh(X * 5 + k, Y, 13) * 24 | 0)), ledge = top + 8 + (hsh(X, Y, 5) * 6 | 0);
        for (let yy = top + 1; yy < bot - 1; yy++) {
          const v = yy - top, band = v < 3 ? 4 : v < 7 ? 3 : v < 15 ? 2 : 1;
          for (let xx = x0 + 1; xx < x1 - 1; xx++) {
            const crack = cracks.some((c, k) => xx === c + Math.round(Math.sin(v * .5 + k * 2.1 + X) * 1.6) && hsh(k + X, (v / 4) | 0, Y) < .8);
            const lg = yy === ledge + Math.round(Math.sin(xx * .4 + Y) * 1.2) && hsh(xx >> 2, X, 17) < .7, lit = yy === ledge + 1 + Math.round(Math.sin(xx * .4 + Y) * 1.2);
            const n = hsh(xx + X * 32, yy, 29), tone = crack || lg ? C[0] : lit ? C[Math.min(4, band + 1)] : n < .07 ? C[Math.max(0, band - 1)] : n > .94 ? C[Math.min(4, band + 1)] : C[band];
            P(xx, yy, 1, 1, tone);
          }
        }
      }
      P(x0 + 1, bot - 2, x1 - x0 - 2, 1, C[1]);
      if (t === 'r') { // grass / snow / ash cap with a ragged hem
        const pk = paintKey(m, X, Y), cap = pk === 'sn' ? ['#b8c8da', '#e4ecf4', '#ffffff'] : pk === 'a' ? ['#463c36', '#6e625a', '#8a7d73'] : [GRASS[s][2], GRASS[s][0], GRASS[s][3]];
        P(x0 - (lft ? 1 : 0), top - 4, x1 - x0 + (lft ? 1 : 0) + (rgt ? 1 : 0), 5, cap[1]);
        for (let xx = x0; xx < x1; xx++) { const h = 1 + ((hsh(xx, Y, 5) * 3) | 0); P(xx, top + 1, 1, h, cap[1]); P(xx, top + 1 + h, 1, 1, cap[0]); }
        P(x0, top - 4, x1 - x0, 1, cap[2]);
      }
      if (r() < .4) P(x0 + 4 + (r() * 20 | 0), top + 8, 2, 1, C[4]);
    }
  }
}

/* ---- humans: layered template sprites, palette-swapped from the character's palette ----
   Template pixels are channel codes RGB(255, channel, level). See art/sprites/human.py. */
const HCH = ['skin', 'hair', 'shirt', 'pants', 'shoe', 'acc', 'helm', 'plume', 'cape', 'hood', 'apron', 'beard', 'robe', 'hat', 'crown', 'belt', 'armor', 'trim'];
const pixRamp = col => [sh(col, -1.7), sh(col, -.7), col, sh(col, 1)].map(h2r);
function humanRamps(P) {
  const col = { skin: P.skin, hair: P.hair, shirt: P.shirt, pants: P.pants, shoe: P.shoe || '#5a3a20', acc: P.acc || P.shirt, helm: P.helm, plume: P.plume, cape: P.cape, hood: P.hood, apron: P.apron, beard: typeof P.beard === 'string' ? P.beard : P.hair, robe: P.robe, hat: P.hat, crown: '#f2c040', belt: P.belt || '#6a4428', armor: P.armor, trim: P.trim };
  const fallback = { armor: P.shirt, trim: '#c8a040', robe: P.shirt, hood: P.shirt, cape: '#9a2a2a', apron: '#e8dcc0', hat: '#5a4a3a', helm: '#8a8a92', plume: '#d8342a' };
  return HCH.map(n => pixRamp(typeof col[n] === 'string' ? col[n] : fallback[n] || '#888888')); // flag values (robe: 1) mean "wear the default"
}
const _humanSpr = humanSpr;
const POSE_DY = { idle1: -1, wind: -1, strike: 1 }, POSE_DX = { wind: -1, strike: 1, thrust: 1, hurt: -2 }; // head and hat layers follow the body's lean
humanSpr = function (key, P, dir, f) {
  const k = key + '|' + dir + '|' + f; if (HC[k] && !HC[k].__lost) return HC[k];
  if (!PIX.has('hb_body_0_0')) return _humanSpr(key, P, dir, f);
  const ride = f === 'ride', tuck = f === 'tuck', d = ride ? 2 : tuck ? 0 : dir === 1 ? 2 : dir, hs = P.hs || 'short';
  // f: 0-3 the old walk, 'w0'-'w7' the 8-frame walk, or a pose ('wind', 'strike'...; see human.py)
  const wf = typeof f === 'string' && /^w\d$/.test(f) ? +f[1] : -1, po = typeof f === 'string' && wf < 0 && !ride ? f : null;
  const bob = f === 1 || f === 3 || wf === 2 || wf === 6 ? 1 : po ? POSE_DY[po] || 0 : 0, lx = po && d === 2 ? POSE_DX[po] || 0 : 0;
  const L = [], add = (n, dy = bob, dx = lx) => { const c = PIX.get(n); if (c) L.push([c, dy, dx]); };
  // women get the female body (hb_bodyf_*): chosen in the creator, otherwise read from the hairstyle like sexOf
  const fem = P.sex ? P.sex === 'f' : P.fem !== undefined ? !!P.fem : ['long', 'bun', 'pony'].includes(hs);
  if (P.cape && d !== 3) add('hb_cape_' + d);
  if (P.quiver && d !== 3) add('hb_quiver_' + d);
  if (P.hood) add(`hb_hood_${d}_back`); else if (!P.helm) add(`hb_hair_${hs}_${d}_back`);
  add(ride ? 'hb_ride_2' : (fem && PIX.has(`hb_bodyf_${d}_${f}`) ? `hb_bodyf_${d}_${f}` : `hb_body_${d}_${f}`), wf >= 0 ? bob : 0, 0); if (P.ribs) add('hb_ribs_' + d);   // 'ride' = seated pose, facing right (the ribs were hidden behind this comment)
  if (P.robe) add('hb_robe_' + d); if (P.apron) add('hb_apron_' + d); if (P.belt) add('hb_belt_' + d); if (P.armS && !P.robe) { const a = armFit('hb_arm_' + P.armS + '_' + d, d, ride ? null : f); if (a) L.push([a, bob, lx]); } if (P.vest) add('hb_vest_' + d); if (P.quiver && d === 3) add('hb_quiver_3');
  if (P.cape && d === 3) add('hb_cape_3');
  if (P.beard) add('hb_beard_' + d); if (P.ears) add('hb_ears_' + d);
  if (!P.helm && !P.hood && hs !== 'bald') add(`hb_hair_${hs}_${d}_front`);
  if (P.hood) add(`hb_hood_${d}_front`);
  if (P.mask) add('hb_mask_' + d);
  if (P.helm) add(P.helmS && PIX.has('hb_helm_' + P.helmS + '_' + d) ? 'hb_helm_' + P.helmS + '_' + d : 'hb_helm_' + d); if (P.plume && !P.helmS) add('hb_plume_' + d);
  if (P.hat) add('hb_hat_' + d); if (P.crown) add('hb_crown_' + d);
  if (tuck) { L.length = 0; add('hb_body_0_tuck', 0, 0); } // the roll is the curled body alone
  const K = Math.max(1, ...L.map(([img]) => img.hi || 1)); // an art style's layers are K px per art px (x_artstyle.js)
  const c = mkCPU(32 * K, 64 * K, x => { for (const [img, dy, dx] of L) x.drawImage(img, (dx || 0) * K, dy * K, 32 * K, 64 * K); });   // read back below (pixSwap, pixOutline): kept in normal memory
  if (K > 1 && typeof styledSwap === 'function') styledSwap(c, humanRamps(P));
  pixSwap(c, humanRamps(P), P.eye || P.glow ? [[0x2b, 0x1d, 0x18], h2r(P.glow || P.eye)] : null);
  if (K === 1) pixOutline(c, null); // selective: each edge is a darker shade of what it touches (painted layers have their own edges)
  const out = dir === 1 ? flipC(c) : mk(c.width, c.height, x => x.drawImage(c, 0, 0)); out.ww = 16; out.wh = 32; if (K > 1) out.hi = K;   // the finished frame on the GPU (c stays in normal memory)
  return HC[k] = out;
};
/* body armour is one picture per facing, drawn for the standing arms: per body frame, its sleeves are taken away
   where an arm has moved off and the arm's sleeve (shirt channel) is coloured as armour where it has moved to, so
   the armour swings with the arms (playtest 2026-11-02). Template codes: RGB(255, channel, level). */
const ARMFIT = {}, ARM_CH = HCH.indexOf('armor'), SHIRT_CH = HCH.indexOf('shirt');
function armFit(name, d, f) {
  const A = PIX.get(name); if (!A || f === null || f === undefined || f === 0 || f === 'tuck') return A;
  const k = name + '|' + f; if (ARMFIT[k]) return ARMFIT[k];
  const S = PIX.get(`hb_body_${d}_0`), F = PIX.get(`hb_body_${d}_${f}`); if (!S || !F || A.width !== 32) return A;
  const px = c => mkCPU(32, 64, x => x.drawImage(c, 0, 0)).getContext('2d').getImageData(0, 0, 32, 64).data;
  const s = px(S), fr = px(F), out = mkCPU(32, 64, x => x.drawImage(A, 0, 0)), ox = out.getContext('2d'), id = ox.getImageData(0, 0, 32, 64), a = id.data;
  const shirt = (q, i) => q[i + 3] > 0 && q[i] === 255 && q[i + 1] === SHIRT_CH && q[i + 2] < 5;
  const same = i => s[i] === fr[i] && s[i + 1] === fr[i + 1] && s[i + 2] === fr[i + 2] && s[i + 3] === fr[i + 3];
  // is the standing arm armoured here (plate sleeves) or cloth (only shoulder plates)? judged on the arm pixels that move
  let moved = 0, covered = 0;
  for (let i = 0; i < a.length; i += 4) if (!same(i) && shirt(s, i)) { moved++; if (a[i + 3] > 0) covered++; }
  const plate = moved > 0 && covered / moved > .5;
  for (let i = 0; i < a.length; i += 4) {
    if (same(i)) continue;
    if (shirt(s, i)) a[i + 3] = 0;   // the arm was here standing and has moved: no floating sleeve
    if (plate && shirt(fr, i)) { a[i] = 255; a[i + 1] = ARM_CH; a[i + 2] = fr[i + 2]; a[i + 3] = 255; }   // the arm is here now: armoured sleeve
  }
  ox.putImageData(id, 0, 0); out.ww = A.ww; out.wh = A.wh;
  return ARMFIT[k] = out;
}

/* 1px outline around opaque pixels (a_core's outline() is stubbed out by the painted art) */
function pixOutline(c, col) {
  const x = c.getContext('2d'), W = c.width, H = c.height, d = x.getImageData(0, 0, W, H), a = d.data, src = new Uint8Array(W * H), [r, g2, b] = col ? h2r(col) : [0, 0, 0];
  for (let i = 0; i < W * H; i++) src[i] = a[i * 4 + 3] > 100 ? 1 : 0;
  for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) {
    const i = y * W + X; if (src[i]) continue;
    const n = X < W - 1 && src[i + 1] ? i + 1 : X > 0 && src[i - 1] ? i - 1 : y < H - 1 && src[i + W] ? i + W : y > 0 && src[i - W] ? i - W : -1;
    if (n < 0) continue;
    if (col) { a[i * 4] = r; a[i * 4 + 1] = g2; a[i * 4 + 2] = b; }
    else { a[i * 4] = a[n * 4] * .38 + 8; a[i * 4 + 1] = a[n * 4 + 1] * .32 + 4; a[i * 4 + 2] = a[n * 4 + 2] * .36 + 8; } // darker, slightly cooler neighbour
    a[i * 4 + 3] = 255;
  }
  x.putImageData(d, 0, 0); return c;
}

/* ---- palette swap: template pixels RGB(255, channel, level 0-3) -> ramps[channel][level];
   swap = optional [fromRGB, toRGB] for one fixed colour (eyes) ---- */
function pixSwap(c, ramps, swap) {
  const x = c.getContext('2d'), id = x.getImageData(0, 0, c.width, c.height), a = id.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    if (a[i] === 255 && a[i + 1] < ramps.length && a[i + 2] < 5) { const lv = a[i + 2], rc = ramps[a[i + 1]][lv < 4 ? lv : 0], k = lv < 4 ? 1 : .55; a[i] = rc[0] * k; a[i + 1] = rc[1] * k; a[i + 2] = rc[2] * k * (lv < 4 ? 1 : 1.12); } // level 4: the outline, a darker shade of the ramp
    else if (swap && a[i] === swap[0][0] && a[i + 1] === swap[0][1] && a[i + 2] === swap[0][2]) { a[i] = swap[1][0]; a[i + 1] = swap[1][1]; a[i + 2] = swap[1][2]; }
  }
  x.putImageData(id, 0, 0); return c;
}
function pixTemplate(name, ramps, swap) {
  const t = PIX.get(name); if (!t) return null;
  const w = mkCPU(t.width, t.height, x => x.drawImage(t, 0, 0)); pixSwap(w, ramps, swap);   // recoloured in normal memory, the result copied to the GPU
  const c = mk(t.width, t.height, x => x.drawImage(w, 0, 0)); c.ww = t.ww; c.wh = t.wh; if (t.ax !== undefined) { c.ax = t.ax; c.ay = t.ay; } return c;
}

/* ---- crops ---- */
const BIGCROP = new Set(['pumpkin', 'melon', 'glacier', 'cabbage', 'redcabbage']);
const _cropSpr = cropSpr;
cropSpr = function (k, st, dead) {
  const key = k + st + (dead ? 'd' : ''); if (CROPSPR[key]) return CROPSPR[key];
  const C = CROPS[k];
  const name = dead ? 'crop_dead' : st === 0 ? 'crop_s0' : st === 1 ? 'crop_s1' : st === 2 ? (C.sh === 'long' ? 'crop_long_2' : 'crop_leafy_2') : BIGCROP.has(k) ? 'crop_round_big_3' : 'crop_' + C.sh + '_3';
  const c = pixTemplate(name, [pixRamp(C.c), pixRamp(C.c2 || sh(C.c, -1.2))]);
  return CROPSPR[key] = c || _cropSpr(k, st, dead);
};

/* ---- animals and enemies: side-view templates facing right, 2 frames ---- */
const _animalSpr = animalSpr;
animalSpr = function (sp, coat, f) {
  const k = sp + coat + f; if (ACACHE[k]) return ACACHE[k];
  const Cc = COATS[sp][coat] || Object.values(COATS[sp])[0];
  const c = pixTemplate(`an_${sp}.${f ? 1 : 0}`, [pixRamp(Cc[0]), pixRamp(Cc[1])]);
  return ACACHE[k] = c || _animalSpr(sp, coat, f);
};
const _enemySpr = enemySpr;
enemySpr = function (k, f) {
  const key = k + f; if (ECACHE[key]) return ECACHE[key];
  const E2 = EN[k], sc = E2.scale || 1;
  let c;
  if (E2.art === 'human') { const h = humanSpr('en' + k, E2.P, 0, f ? 1 : 3); c = mk(h.width, h.height, x => x.drawImage(h, 0, 0)); c.ww = h.ww; c.wh = h.wh; }
  else c = pixTemplate(`en_${E2.art}.${f ? 1 : 0}`, [pixRamp(E2.col || '#888888'), pixRamp(sh(E2.col || '#888888', -1.4))], E2.eye ? [[0x2b, 0x1d, 0x18], h2r(E2.eye)] : null);
  if (!c) return _enemySpr(k, f);
  if (sc !== 1) { const s2 = mk(Math.round(c.width * sc), Math.round(c.height * sc), x => x.drawImage(c, 0, 0, Math.round(c.width * sc), Math.round(c.height * sc))); s2.ww = c.ww * sc; s2.wh = c.wh * sc; c = s2; }
  return ECACHE[key] = c;
};

/* ---- item icons: shape templates (ic_<shape>) recoloured with the item's colours ---- */
const _itemIcon = itemIcon;
itemIcon = function (id) {
  if (ICACHE[id]) return ICACHE[id];
  let c = null;
  if (id.startsWith('tool:')) { const [, t, l] = id.split(':'), col = TOOL_COL[+l] || '#a8a8a8'; c = pixTemplate('ic_' + (t === 'weapon' ? 'sword' : t), [pixRamp(col), pixRamp(sh(col, -1.2))]); }
  else {
    const it = IT[id];
    if (it && it.sh === 'obj') { const o = objSprite({ k: it.place }, 0); if (o && o.width) { const k = Math.min(32 / o.width, 32 / o.height, 1); c = mk(32, 32, x => x.drawImage(o, Math.round((32 - o.width * k) / 2), Math.round(32 - o.height * k), Math.round(o.width * k), Math.round(o.height * k))); c.ww = c.wh = 16; } }
    else if (it) { const col = typeof it.c === 'string' ? it.c : '#888888', c2 = typeof it.c2 === 'string' ? it.c2 : sh(col, -1.2); c = pixTemplate('ic_' + it.sh, [pixRamp(col), pixRamp(c2)]); }
  }
  return ICACHE[id] = c || _itemIcon(id);
};

/* ---- time of day + weather grade ----
   A single flat multiply over the frame: crisp pixels, no light map. Keyframes are
   [minute of day, colour]; 1.0 white = untouched daylight. */
const GRADE_KEYS = [[0, '#6a78b8'], [290, '#6a78b8'], [345, '#f0c8c0'], [450, '#ffffff'], [1020, '#ffffff'], [1110, '#ffd0a0'], [1200, '#b890a8'], [1280, '#6a78b8'], [1440, '#6a78b8']];
const WEATHER_GRADE = { rain: '#c0c8d8', snow: '#e8eef8' };
function gradeColor(t) {
  for (let i = 1; i < GRADE_KEYS.length; i++) if (t <= GRADE_KEYS[i][0]) {
    const [t0, c0] = GRADE_KEYS[i - 1], [t1, c1] = GRADE_KEYS[i], k = (t - t0) / (t1 - t0 || 1), a = h2r(c0), b = h2r(c1);
    return [0, 1, 2].map(j => a[j] + (b[j] - a[j]) * k);
  }
  return [255, 255, 255];
}
function pixGrade(m, W, H) {
  let c;
  if (m.dark) c = [168, 150, 140];            // mines and caves: dim and warm, still readable
  else if (m.indoor) c = [255, 244, 228];     // rooms: a touch of lamplight warmth
  else {
    c = gradeColor(((S.time % 1440) + 1440) % 1440);
    const w = WEATHER_GRADE[S.weather]; if (w) { const r = h2r(w); c = c.map((v, j) => v * r[j] / 255); }
  }
  if (c[0] > 253 && c[1] > 253 && c[2] > 253) return;
  g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${c.map(Math.round).join(',')})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
}
/* pixel disc for smoke puffs, in world units on the current transform */
function pixDisc(cx, cy, r) {
  const q = .5; for (let y = -r; y <= r; y += q) { const w = Math.sqrt(Math.max(0, r * r - y * y)); g.fillRect(Math.round((cx - w) / q) * q, Math.round((cy + y) / q) * q, Math.max(q, Math.round(2 * w / q) * q), q); }
}
