/* Art styles (pilot, asked 2026-11-01): Options → Graphics → Art style switches the whole game to another 2D look.
   A style is a second atlas in public/art/styles/<style>/ (made by art/style_pilot.py with ComfyUI + Qwen Image Edit)
   with the same sprite names. Its frames carry `k`: art px per pixel-art px (objects 4, ground textures 1), so
   PIX.get keeps ww/wh in world units and everything else (collisions, anchors, meta) is unchanged.
   Sprites the style doesn't have yet fall back to the pixel art. Hi-res frames are drawn with smoothing on. */
let ART_Q = 'low';   // smoothing quality for hi-res sprites ('high' builds mipmaps on every draw)
const ART_STYLES = [['pixel', 'Pixel art'], ['painterly', 'Painterly (preview)']];
if (SETTINGS.artStyle === undefined) SETTINGS.artStyle = 'pixel';
const STYLE_ATLAS = {};
function loadStyle(s) {
  if (s === 'pixel' || STYLE_ATLAS[s]) return Promise.resolve(STYLE_ATLAS[s]);
  const page = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  return fetch(`art/styles/${s}/atlas.json`).then(r => r.json())
    .then(meta => Promise.all([...Array(meta.pages || 1)].map((_, p) => page(`art/styles/${s}/atlas_${p}.png`))).then(imgs => STYLE_ATLAS[s] = { imgs, map: meta.frames }))
    .catch(err => { console.warn('Art style failed to load', s, err); return null; });
}
PIX.load = (f => function () { return f.apply(this, arguments).then(() => loadStyle(SETTINGS.artStyle)); })(PIX.load);
// a painted sprite that must use another's painting: the lit lamp's painted glow kept a pink disc of the magenta card
// (the game draws lamp light itself at night)
const STYLE_ALIAS = { lantern: 'lantern_off' };
// pieces that must join their neighbours (fence runs, tilled soil beds) keep the pixel sprite, rounded and lit like the
// characters (painted one by one they came out as a jumble of posts and separate squares)
const STYLE_SMOOTH = /^(fence|soil_|waystone)/;   // (the waystone's painted frames came out cut up and misaligned)
// paintings that came out bigger than the object is: fitted back inside the pixel sprite's box (standing on its base)
const STYLE_FIT = /^(well$|bld_barn_|bld_kb_market_)/;
// creatures whose paintings didn't hold up (drawn 2-3x as Old Snapper and the Frost Giant): their pixel animation,
// rounded and lit like the characters (pixTemplate wrapper)
const STYLE_SKIP = /^en_(crab|yeti)(_atk)?\./;
PIX.get = (f => function (n) {
  const st = STYLE_ATLAS[SETTINGS.artStyle];
  if (st && STYLE_SMOOTH.test(n)) {
    if (this.cache[n] && !this.cache[n].__lost) return this.cache[n];
    const p = f.call(this, n); if (!p || !p.width) return p;
    const sm = smoothUp(p);
    return this.cache[n] = sm;
  }
  const sf = st && !STYLE_SKIP.test(n) && st.map[STYLE_ALIAS[n] || n];
  if (!sf) return f.call(this, n);
  if (this.cache[n] && !this.cache[n].__lost) return this.cache[n];
  const base = this.map[n] || this.map[n.replace(/_glow$/, '')] || { w: sf.w / sf.k, h: sf.h / sf.k };   // a building's night glow shares its box
  const c = mk(sf.w, sf.h, x => x.drawImage(st.imgs[sf.p || 0], sf.x, sf.y, sf.w, sf.h, 0, 0, sf.w, sf.h));
  c.ww = base.w / 2; c.wh = base.h / 2; if (base.ax !== undefined) { c.ax = base.ax / 2; c.ay = base.ay / 2; }
  if (sf.k > 1) c.hi = sf.k;
  if (sf.t) c.lum = 1;
  if (sf.ox !== undefined) c.off = [sf.ox / 2, sf.oy / 2, sf.w / sf.k / 2, sf.h / sf.k / 2];   // a free painting: where it lies against the pixel box (x_artlight.js)
  if (c.off && STYLE_FIT.test(n)) { const [, , w, h] = c.off, k = Math.min(1, c.ww / w, c.wh / h); if (k < 1) c.off = [(c.ww - w * k) / 2, c.wh - h * k, w * k, h * k]; }
  return this.cache[n] = c;
})(PIX.get);
// a hi-res sprite (more than 2 px per world unit, so copies made from one count too) is drawn smoothly on the
// world canvas; the pixel art around it stays crisp
g.drawImage = (f => function (img) {
  if (!img || !img.ww || img.width < img.ww * 2.5 || this.imageSmoothingEnabled) return f.apply(this, arguments);
  this.imageSmoothingEnabled = true; this.imageSmoothingQuality = ART_Q;
  try { return f.apply(this, arguments); } finally { this.imageSmoothingEnabled = false; }
})(g.drawImage);
// styled templates (frames with `t`): R = channel, G = shade along the ramp (20 + level / 3 * 200), B = 254;
// other pixels keep their painted colour. Recoloured here from the same ramps the pixel templates use.
function styledSwap(c, ramps) {
  const x = c.getContext('2d'), id = x.getImageData(0, 0, c.width, c.height), a = id.data;
  for (let i = 0; i < a.length; i += 4) {
    if (!a[i + 3] || a[i + 2] < 250 || a[i] > 40) continue;   // code pixels: B 254, R the channel; semi-transparent edge pixels come back from the canvas a little off 254 (they stayed raw: blue specks on outlines)
    const r = ramps[a[i]] || ramps[0], lv = (a[i + 1] - 20) / 200 * 3;
    let R, G, B;
    if (lv <= 0) { const k = Math.max(.35, 1 + lv * .45); R = r[0][0] * k; G = r[0][1] * k; B = r[0][2] * k; }
    else { const i0 = Math.min(2, lv | 0), t = Math.min(1.5, lv - i0), p = r[i0], q = r[i0 + 1]; R = p[0] + (q[0] - p[0]) * t; G = p[1] + (q[1] - p[1]) * t; B = p[2] + (q[2] - p[2]) * t; }
    a[i] = R; a[i + 1] = G; a[i + 2] = B;
  }
  x.putImageData(id, 0, 0); return c;
}
pixTemplate = (f => function (name, ramps, swap) {
  const t = PIX.get(name); if (!t || !t.lum) return f.apply(this, arguments);
  const c = mkCPU(t.width, t.height, x => x.drawImage(t, 0, 0)); styledSwap(c, ramps);   // read back in normal memory; gpuCopy below puts the result on the GPU c.ww = t.ww; c.wh = t.wh; c.hi = t.hi; return c;
})(pixTemplate);
// characters stay layered pixel templates (painting every walk frame on its own would flicker); in a styled mode
// they get two Scale2x passes, which round the pixel steps into smooth edges, and are drawn smoothly
function scale2x(c) {
  const W = c.width, H = c.height, src = new Uint32Array(c.getContext('2d').getImageData(0, 0, W, H).data.buffer);
  const out = mk(W * 2, H * 2), x = out.getContext('2d'), id = x.createImageData(W * 2, H * 2), d = new Uint32Array(id.data.buffer);
  const at = (i, j) => src[Math.min(H - 1, Math.max(0, j)) * W + Math.min(W - 1, Math.max(0, i))];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const P = at(i, j), A = at(i, j - 1), B = at(i + 1, j), C = at(i - 1, j), D_ = at(i, j + 1);
    const o = (j * 2) * W * 2 + i * 2;
    d[o] = C === A && C !== D_ && A !== B ? A : P;
    d[o + 1] = A === B && A !== C && B !== D_ ? B : P;
    d[o + W * 2] = D_ === C && D_ !== B && C !== A ? C : P;
    d[o + W * 2 + 1] = B === D_ && B !== A && D_ !== C ? D_ : P;
  }
  x.putImageData(id, 0, 0); out.ww = c.ww; out.wh = c.wh; return out;
}
// a touch of softness and the painted light (warm top-left, cool bottom-right) so they sit in the painted world
// (painting the character layers with the model was tried at several strengths: low ones leave the pixels, higher
// ones re-pose some frames and not others, so the figure jumps. This shading is the same on every frame instead.)
function paintedLook(c) {
  const W = c.width, H = c.height, d = Math.max(2, Math.round(W / c.ww / 2)), out = mk(W, H, x => {
    x.filter = 'blur(0.6px)'; x.drawImage(c, 0, 0); x.filter = 'none';
    // form shading: a soft shade inside the bottom-right edges and a warm lit rim along the top-left ones
    const inv = (dx, dy) => mk(W, H, y => { y.fillStyle = '#000'; y.fillRect(0, 0, W, H); y.globalCompositeOperation = 'destination-out'; y.drawImage(c, dx, dy); });
    const edge = (dx, dy, col, op, a) => {
      const m = mk(W, H, y => { y.filter = `blur(${d * .8}px)`; y.drawImage(inv(dx, dy), 0, 0); y.filter = 'none'; y.globalCompositeOperation = 'source-in'; y.fillStyle = col; y.fillRect(0, 0, W, H); });
      x.globalCompositeOperation = op; x.globalAlpha = a; x.drawImage(m, 0, 0); x.globalAlpha = 1;
    };
    edge(-d * 1.5, -d * 1.5, 'rgb(40,30,70)', 'multiply', .55);
    edge(d, d, 'rgb(255,226,170)', 'screen', .35);
    x.globalCompositeOperation = 'source-over';
    x.globalCompositeOperation = 'soft-light'; const gr = x.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, 'rgba(255,226,180,.55)'); gr.addColorStop(.5, 'rgba(128,128,128,0)'); gr.addColorStop(1, 'rgba(50,40,80,.6)');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(c, 0, 0);
  });
  out.ww = c.ww; out.wh = c.wh; return out;
}
// the smoothing runs on the GPU: a high-quality smooth enlargement (scale2x read every pixel back to the CPU, and
// building characters' frames that way was the microstutter in busy towns)
function gpuUp(c, k) { const o = mk(c.width * k, c.height * k, x => { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(c, 0, 0, c.width * k, c.height * k); }); o.ww = c.ww; o.wh = c.wh; if (c.ax !== undefined) { o.ax = c.ax; o.ay = c.ay; } return o; }
const smoothUp = c => { const s = paintedLook(gpuUp(c, 4)); if (c.ax !== undefined) { s.ax = c.ax; s.ay = c.ay; } return s; };
const SMOOTH = new WeakMap(), WARMQ = [], WARMED = new Set();
humanSpr = (f => function (key, P, dir, fr) {
  const c = f.apply(this, arguments);
  if (!c || SETTINGS.artStyle === 'pixel' || c.width >= c.ww * 4) return c;
  let s = SMOOTH.get(c); if (!s || s.__lost) { s = smoothUp(c); SMOOTH.set(c, s); }
  // its other walk frames are built in spare time, ready before the next step
  if (typeof fr === 'string' && /^w\d$/.test(fr)) { const wk = key + '|' + dir; if (!WARMED.has(wk)) { WARMED.add(wk); for (let i = 0; i < 8; i++) WARMQ.push([key, P, dir, 'w' + i]); } }
  return s;
})(humanSpr);
(function warmPump() {
  const t0 = performance.now();
  while (WARMQ.length && performance.now() - t0 < 2.5) { const [k, P, d, fr] = WARMQ.shift(); try { humanSpr(k, P, d, fr); } catch (e) {} }
  requestAnimationFrame(warmPump);
})();
// the painted night glow of a building's windows (art/style_free.py), or null
// Worked out here from the painted building (made once per building): the painting's glass (bluish or dark pixels)
// near where each window sits, mapped by proportion from the pixel sprite's meta.win (the painting may be a little
// bigger or shifted), lit with an even warm light, brighter in the middle. The baked <name>_glow frames from the
// build put the light under the windows (playtest 2026-11-02), so they're no longer used.
const GLOWC = new Map();
function styleGlow(n) {
  const st = STYLE_ATLAS[SETTINGS.artStyle]; if (!n || !st || !st.map[n]) return null;
  if (GLOWC.has(n)) return GLOWC.get(n);
  const c = PIX.get(n), f = PIX.map[n], wins = f && f.meta && f.meta.win; if (!c || !wins || !c.width) { GLOWC.set(n, null); return null; }
  const W = c.width, H = c.height, a = mk(W, H, x => x.drawImage(c, 0, 0)).getContext('2d').getImageData(0, 0, W, H).data;
  // The paintings are free, so their windows aren't where the pixel art's were: the windows are found in the painting:
  // glass-coloured patches (bluish, or dark and cool) of window size, in the band of the wall where the pixel art had
  // its windows (by proportion of the height, so a blue slate roof doesn't count)
  const ys = wins.map(w => [w[1] / f.h, (w[1] + w[3]) / f.h]), band = [Math.max(0, Math.min(...ys.map(v => v[0])) - .12) * H, Math.min(1, Math.max(...ys.map(v => v[1])) + .1) * H];
  const ppa = W / (c.off ? c.off[2] * 2 : f.w), glass = new Uint8Array(W * H);
  for (let y = Math.floor(band[0]); y < Math.ceil(band[1]); y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4; if (a[i + 3] < 200) continue;
    const r = a[i], g_ = a[i + 1], b = a[i + 2], lum = (r * 3 + g_ * 6 + b) / 10;
    if ((b > r + 14 && b >= g_ - 4 && lum < 160) || (lum < 45 && b >= r - 4)) glass[y * W + x] = 1;
  }
  const mask = mk(W, H), mx = mask.getContext('2d'), id = mx.createImageData(W, H), d = id.data, seen = new Uint8Array(W * H);
  const minA = (2.5 * ppa) ** 2, maxA = (26 * ppa) ** 2;   // a window is between about 2.5 and 26 art px across
  for (let s0 = 0; s0 < W * H; s0++) {
    if (!glass[s0] || seen[s0]) continue;
    const q = [s0], comp = []; seen[s0] = 1; let x0 = W, x1 = 0, y0 = H, y1 = 0;
    while (q.length) { const k = q.pop(), x = k % W, y = (k / W) | 0; comp.push(k); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (const n of [k - 1, k + 1, k - W, k + W]) if (n >= 0 && n < W * H && glass[n] && !seen[n] && Math.abs((n % W) - x) <= 1) { seen[n] = 1; q.push(n); } }
    const bw = x1 - x0 + 1, bh = y1 - y0 + 1, fill = comp.length / (bw * bh);
    if (comp.length < minA || bw * bh > maxA || bw > bh * 3.5 || bh > bw * 4 || fill < .35) continue;
    for (const k of comp) { const i = k * 4; d[i] = 255; d[i + 1] = 214; d[i + 2] = 130; d[i + 3] = 255; }
  }
  mx.putImageData(id, 0, 0);
  const out = mk(W, H, x => { x.filter = `blur(${Math.max(1, ppa * .6)}px)`; x.drawImage(mask, 0, 0); x.filter = 'none'; x.globalAlpha = .7; x.drawImage(mask, 0, 0); });
  out.ww = c.ww; out.wh = c.wh; out.off = c.off; out.hi = c.hi;
  GLOWC.set(n, out); return out;
}
// switching: drop every cached sprite and painted chunk so they're made again from the new atlas
function applyArtStyle() {
  return loadStyle(SETTINGS.artStyle).then(() => {
    PIX.cache = {}; PXG.tex = {}; GLOWC.clear(); WARMED.clear(); WARMQ.length = 0; if (typeof CHUNK !== 'undefined') { CHUNK.clear(); CHUNK_LAST.clear(); }
    for (const C of [HC, ACACHE, ECACHE, CROPSPR, ICACHE, GICACHE, IURL]) for (const k in C) delete C[k];
    if (typeof buildObjects === 'function') buildObjects();
    for (const id in MAPS) { const m = MAPS[id]; if (m && m.bld) for (const b of m.bld) b.sprName = null; }
    if (typeof refreshBuildings === 'function') refreshBuildings();
    if (typeof buildDock === 'function') buildDock();
  });
}
let ART_APPLIED = SETTINGS.artStyle;
applyGraphics = (f => function () { const r = f.apply(this, arguments); if (SETTINGS.artStyle !== ART_APPLIED) { ART_APPLIED = SETTINGS.artStyle; applyArtStyle(); } return r; })(applyGraphics);
renderOpts = (f => function (b) {
  f.apply(this, arguments);
  const h = [...b.querySelectorAll('h3')].find(e => e.textContent === 'Graphics'); if (!h) return;
  const row = el('div', { class: 'acts wrap' }, el('span', { style: 'display:inline-block;width:120px' }, 'Art style'),
    ...ART_STYLES.map(([v, n]) => el('button', { class: 'btn' + (SETTINGS.artStyle === v ? '' : ' ghost'), on: () => { SETTINGS.artStyle = v; saveSettings(); applyGraphics(); refresh(); } }, n)));
  h.after(row);
})(renderOpts);
// UI canvases and icons scale smoothly in a styled mode (the pixel style keeps them crisp)
document.head.append(el('style', null, 'body.styled canvas:not(#cv), body.styled img { image-rendering: auto !important; }'));
const markStyled = () => document.body.classList.toggle('styled', SETTINGS.artStyle !== 'pixel');
markStyled(); applyGraphics = (f => function () { const r = f.apply(this, arguments); markStyled(); return r; })(applyGraphics);
// Chrome keeps a canvas on the CPU once it has been read back (getImageData), and then uploads it again on every
// draw: cheap for small pixel sprites, slow for hi-res chunks and recoloured templates. Hand back a fresh copy,
// which stays on the GPU.
const gpuCopy = c => { const d = mk(c.width, c.height, x => x.drawImage(c, 0, 0)); for (const k of ['m', 'span', 'hi', 'ww', 'wh', 'ax', 'ay', 'lum', 'cast', 'off']) if (c[k] !== undefined) d[k] = c[k]; return d; };
paintChunk = (f => function () { const c = f.apply(this, arguments); return c && c.hi ? gpuCopy(c) : c; })(paintChunk);
pixTemplate = (f => function () { const c = f.apply(this, arguments); return c && c.hi ? gpuCopy(c) : c; })(pixTemplate);
// animals and enemies stay pixel templates in a styled mode (painted frames came out a different size each, so they
// shrank as they walked); like characters they're rounded with Scale2x and given the painted light
pixTemplate = (f => function (name) {
  const c = f.apply(this, arguments);
  if (!c || c.hi || SETTINGS.artStyle === 'pixel' || !/^(en_|an_)/.test(name)) return c;
  return smoothUp(c);
})(pixTemplate);
