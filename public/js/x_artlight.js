/* Light and shadow for the art styles (asked 2026-11-02: "with all the lighting and shadows like in the pictures").
   Only when SETTINGS.artStyle isn't 'pixel'; the pixel style keeps its flat grade (see CLAUDE.md).
   - A sun (`sunNow`): shadows fall west in the morning and east in the evening, short at noon and long near sunrise
     and sunset, faint under rain or snow. Every styled object sprite flagged `cast` (buildings, trees, rocks, props,
     walls...) throws its silhouette (`castOf`, made once, from its real base) slanted and stretched by the sun at draw
     time, just before the sprite, so the y-sorted draw order lays it under whatever stands in front.
   - Contact shadows under creatures and people are soft ellipses instead of hard pixel ones.
   - The grade: after the flat time-of-day multiply, a soft-light wash warm from the top-left and cool toward the
     bottom-right, and a gentle vignette; lamps and windows get a soft glow after dark. */
const STYLED = () => SETTINGS.artStyle !== 'pixel';
const CAST_NO = /^(ground_|dec_|soil|crop|weed|tgrass|flower|twig|stone$|page|shell|shard|dig|channel|conveyor|chute|fastbelt|runebelt|sorter|splitter|fence_|ladder|upladder|cave|clay|salt|log$|mushroom|fern|cattail|sapling)/;
let LIGHT_K = 1;   // how strong daylight shadows are now (0 at night)

PIX.get = (f => function (n) {
  const c = f.call(this, n);
  if (c && c.hi && !c.lum && c.cast === undefined) c.cast = CAST_NO.test(n) || n.endsWith('_glow') ? 0 : 1;
  return c;
})(PIX.get);
if (typeof swayFrame === 'function') swayFrame = (f => function (c) { const s = f.apply(this, arguments); if (s && c && s !== c) { s.cast = c.cast; s.off = c.off; } return s; })(swayFrame);

// The sun (updated each frame in the pixGrade wrapper): rises in the east, so morning shadows fall west (left) and
// evening ones east; short at noon, long near sunrise and sunset (SUN in v_seasons.js); faint under rain or snow.
const SUNP = { sx: .9, sy: .4, k: 1, dir: .5 };
function sunNow(m) {
  const t = ((S.time % 1440) + 1440) % 1440, [rise, set] = typeof SUN !== 'undefined' ? SUN[S.season || 0] : [360, 1170];
  const p = Math.max(0, Math.min(1, (t - rise) / (set - rise))), elev = Math.sin(Math.PI * p), dir = (p - .5) * 2;
  SUNP.dir = m.indoor ? .4 : dir;
  SUNP.sx = m.indoor ? .4 : dir * (.3 + (1 - elev) * .55);   // horizontal lean per unit of height (playtest: morning and evening shadows were huge slabs)
  SUNP.sy = m.indoor ? .3 : .2 + (1 - elev) * .38;           // length per unit of height
  SUNP.k = m.indoor || m.dark ? 1 : S.weather === 'rain' ? .3 : S.weather === 'snow' ? .45 : 1;
}

// (castOf reads a copy of the sprite: reading the sprite itself would move it off the GPU)
// each castable sprite's shadow: its silhouette from the base up, flipped (row 0 = the base), blurred; made once.
// The base is the lowest row that's really part of the object, not grass or a soft edge below it, so the shadow
// starts at the wall and not under a transparent strip.
const CASTC = new WeakMap(), CASTQ = [];
const FOOT = mk(64, 64, x => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(46,44,86,1)'); gr.addColorStop(.6, 'rgba(46,44,86,.45)'); gr.addColorStop(1, 'rgba(46,44,86,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
// Made at a quarter of the sprite's resolution (a soft shadow needs no more) and not in the middle of a frame: a
// sprite seen for the first time is queued and gets its shadow a moment later (building them on the spot stuttered)
function castMake(c) {
  const ppu = c.width / c.ww, q = Math.max(1, Math.round(ppu / 1.5)), w = Math.ceil(c.width / q), h = Math.ceil(c.height / q), B = 3;
  const small = mk(w, h, x => { x.imageSmoothingEnabled = true; x.drawImage(c, 0, 0, w, h); });
  const a = small.getContext('2d').getImageData(0, 0, w, h).data; let base = h - 1, most = 0; const cnt = new Array(h).fill(0);
  for (let y = 0; y < h; y++) { let n = 0; for (let x = 0; x < w; x++) if (a[(y * w + x) * 4 + 3] > 160) n++; cnt[y] = n; most = Math.max(most, n); }
  while (base > 0 && cnt[base] < Math.max(2, most * .08)) base--;   // the real foot (a trunk is narrow: at 30% a tree's shadow started under its canopy, a gap below the trunk)
  const H = base + 1, sil = mk(w + 2 * B, H + 2 * B, x => {
    x.setTransform(1, 0, 0, -1, B, H + B); x.drawImage(small, 0, 0, w, H, 0, 0, w, H);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgb(46,44,86)'; x.fillRect(0, 0, w + 2 * B, H + 2 * B);   // a cool shade, not black
  });
  const s = mk(sil.width, sil.height, x => { x.filter = 'blur(2.5px)'; x.drawImage(sil, 0, 0); });
  // the foot: the opaque span of the base row (centre and width, in sprite px)
  let l = w, r_ = 0; for (let x = 0; x < w; x++) if (a[(base * w + x) * 4 + 3] > 160) { l = Math.min(l, x); r_ = Math.max(r_, x); }
  s.fx = (l <= r_ ? (l + r_ + 1) / 2 : w / 2) * q; s.fw = (l <= r_ ? Math.max(r_ - l + 1, w * .25) : w * .5) * q;
  s.B = B * q; s.base = (base + 1) * q - 1; s.q = q; CASTC.set(c, s); return s;
}
function castOf(c) {
  const s = CASTC.get(c); if (s) return s;
  if (!c.__castQ) { c.__castQ = 1; CASTQ.push(c); }
  return null;
}
// build queued shadows in spare time: up to ~3 ms a frame
(function castPump() {
  const t0 = performance.now();
  while (CASTQ.length && performance.now() - t0 < 3) castMake(CASTQ.shift());
  requestAnimationFrame(castPump);
})();
g.drawImage = (f => function (img, a1, a2, a3, a4) {
  if (img && img.cast && arguments.length === 5 && STYLED() && LIGHT_K > .02 && !g.__noCast) {
    const s = castOf(img), k = a3 / img.width, ga = this.globalAlpha, over = 2.5;   // starts 2.5 world px inside the object: drawn first, so the object hides the overlap
    if (s) {
    this.save(); this.globalAlpha = ga * .46 * LIGHT_K * SUNP.k; g.__noCast = 1;
    this.translate(a1, a2 + (s.base + 1) * k - over); this.transform(1, 0, SUNP.sx, SUNP.sy, 0, 0);
    f.call(this, s, -s.B * k, -s.B * k, s.width * s.q * k, s.height * s.q * k);
    g.__noCast = 0; this.restore();
    // a soft contact shadow at the foot, so the cast shadow never looks detached from the trunk or wall
    const fw = Math.min(a3, s.fw * k * 1.15); this.globalAlpha = ga * .38 * LIGHT_K * SUNP.k;
    f.call(this, FOOT, a1 + (s.fx * k) - fw / 2, a2 + (s.base + 1) * k - fw * .16, fw, fw * .3);
    this.globalAlpha = ga;
    }
  }
  return f.apply(this, arguments);
})(g.drawImage);

// people and creatures: a soft contact shadow, plus a long soft one toward the bottom-right by day (drawn as a blob,
// not a silhouette, since they're drawn mirrored when they face left)
shadow = (f => function (x, y, r, a = .22) {
  if (!STYLED()) return f.apply(this, arguments);
  const blob = (dx, dy, rot, sx, sy, al, rr = r) => {
    g.save(); g.translate(x + dx, y + dy); g.rotate(rot); g.scale(sx, sy);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rr * 1.25);
    gr.addColorStop(0, `rgba(46,44,86,${al})`); gr.addColorStop(.55, `rgba(46,44,86,${al * .6})`); gr.addColorStop(1, 'rgba(46,44,86,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rr * 1.25, 0, 6.283); g.fill(); g.restore();
  };
  const L = Math.hypot(SUNP.sx, SUNP.sy);   // along the sun's shadow direction, as long as the sun makes it
  const R = Math.max(r, 8);   // people and creatures: a sun shadow as long as a ~30 px figure makes (it was too small to see)
  if (LIGHT_K > .02 && a >= .18) blob(SUNP.sx * R * 1.6, SUNP.sy * R * 1.6, Math.atan2(SUNP.sy, SUNP.sx), 1 + L * 2.4, .45, Math.min(.42, a * 2.2) * LIGHT_K * SUNP.k, R);
  blob(0, 0, 0, 1, .42, a * 1.1);
})(shadow);

pixGrade = (f => function (m, W, H) {
  f.apply(this, arguments);
  const t = ((S.time % 1440) + 1440) % 1440, day = m.dark || m.indoor ? 0 : Math.max(0, Math.min(1, Math.min((t - 330) / 90, (1230 - t) / 120)));
  LIGHT_K = m.dark ? 0 : m.indoor ? .45 : day;
  sunNow(m);
  if (!STYLED()) return;
  const warm = m.dark ? 0 : m.indoor ? .5 : .25 + .75 * day;
  g.save(); g.globalCompositeOperation = 'soft-light';
  const lg_ = g.createLinearGradient(W * (.5 + SUNP.dir * .5), 0, W * (.5 - SUNP.dir * .5), H);   // warm on the sun's side
  lg_.addColorStop(0, `rgba(255,210,140,${.7 * warm})`); lg_.addColorStop(.5, 'rgba(128,128,128,0)'); lg_.addColorStop(1, `rgba(30,34,80,${.55 * warm + .15})`);
  g.fillStyle = lg_; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .38, W / 2, H / 2, Math.hypot(W, H) * .62);
  vg.addColorStop(0, 'rgba(14,8,22,0)'); vg.addColorStop(1, `rgba(14,8,22,${m.dark ? .5 : .42})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // at night the painted water stayed the brightest thing on screen (blue passes the night grade): a warm multiply that
  // takes most from blue
  const night = m.dark || m.indoor ? 0 : 1 - day;
  if (night > .02) { g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(205,200,150,${.75 * night})`; g.fillRect(0, 0, W, H); }
  g.restore();
})(pixGrade);
// after dark, every window and flame nightLights paints also gets a soft warm halo
let NL_ON = 0;
if (typeof nightLights === 'function') nightLights = (f => function () { NL_ON = STYLED(); try { return f.apply(this, arguments); } finally { NL_ON = 0; } })(nightLights);
g.fillRect = (f => function (x, y, w, h) {
  f.apply(this, arguments);
  // one glow per flame: only its outer square (#ffb040) gets one; the three stacked squares each glowing made hard red discs
  if (!NL_ON || this.globalAlpha < .05 || w > 400 || String(this.fillStyle).toLowerCase() !== '#ffb040') return;
  const cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) * 6 + 18, ga = this.globalAlpha / .22, op = this.globalCompositeOperation;
  const gr = this.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(255,200,130,.42)'); gr.addColorStop(.3, 'rgba(255,180,110,.18)'); gr.addColorStop(.65, 'rgba(255,170,100,.06)'); gr.addColorStop(1, 'rgba(255,170,100,0)');
  this.globalCompositeOperation = 'lighter'; this.globalAlpha = Math.min(1, ga * .8); this.fillStyle = gr; f.call(this, cx - r, cy - r, 2 * r, 2 * r);
  this.globalCompositeOperation = op; this.globalAlpha = ga;
})(g.fillRect);

// Freely painted frames (art/style_free.py) keep their pixel sprite's box as ww / wh, so positions, collisions, clicks,
// windows and chimneys stay where they were, and carry `off` = [x, y, w, h]: where the painting really lies against
// that box, in world units (it may spill past it). Any 5-argument draw of such a frame is moved onto the painting.
// On the world canvas this wrapper is the outermost one, so the cast shadow above sees the painted shape.
let OFF_IN = 0;
const offDraw = f => function (img, a1, a2, a3, a4) {
  const o = img && img.off;
  if (!o || OFF_IN || arguments.length !== 5) return f.apply(this, arguments);
  const sx = a3 / img.ww, sy = a4 / img.wh; OFF_IN = 1;
  try { return f.call(this, img, a1 + o[0] * sx, a2 + o[1] * sy, o[2] * sx, o[3] * sy); } finally { OFF_IN = 0; }
};
CanvasRenderingContext2D.prototype.drawImage = offDraw(CanvasRenderingContext2D.prototype.drawImage);
g.drawImage = offDraw(g.drawImage);

// Daylight over the scene, like the painted example scenes: dappled leaf shade drifting over the ground (one tiling
// texture, anchored to the world), and soft light shafts from the top-left. Drawn after the grade, outdoors by day.
let DAPPLE = null;
function dappleTex() {
  if (DAPPLE) return DAPPLE;
  const N = 512, rnd = (i => () => (i = (i * 16807) % 2147483647) / 2147483647)(7);
  DAPPLE = mk(N, N, x => {
    x.fillStyle = '#fff'; x.fillRect(0, 0, N, N); x.filter = 'blur(10px)';
    for (let i = 0; i < 70; i++) {   // shade blobs, wrapped so the texture tiles
      const cx = rnd() * N, cy = rnd() * N, r = 14 + rnd() * 46, v = 105 + rnd() * 70 | 0;
      x.fillStyle = `rgb(${v - 30},${v - 24},${v})`;
      for (const ox of [-N, 0, N]) for (const oy of [-N, 0, N]) { x.beginPath(); x.ellipse(cx + ox, cy + oy, r, r * .7, rnd() * 3, 0, 6.283); x.fill(); }
    }
  });
  return DAPPLE;
}
if (typeof nightLights === 'function') nightLights = (f => function (m, Z, cxp, cyp, W, H) {
  if (STYLED() && !m.indoor && !m.dark && LIGHT_K > .02 && SUNP.k > .9 && typeof gameT !== 'undefined') {   // (not under rain or snow)
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    // leaf shade: a multiply layer in world space, drifting slowly
    const pat = g.createPattern(dappleTex(), 'repeat'), dr = gameT * 3;
    pat.setTransform(new DOMMatrix([Z, 0, 0, Z, (-cxp + dr) * Z, (-cyp + dr * .4) * Z]));
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = .5 * LIGHT_K; g.fillStyle = pat; g.fillRect(0, 0, W, H);
    // light shafts: broad soft diagonal bands from the top-left, sliding a little
    g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 3; i++) {
      const c = ((i * .37 + gameT * .004) % 1.2 - .1) * (W + H), w = (W + H) * (.05 + .03 * i);
      const gr = g.createLinearGradient(c - w, 0, c + w, 0);
      gr.addColorStop(0, 'rgba(255,226,150,0)'); gr.addColorStop(.5, `rgba(255,222,140,${.22 * LIGHT_K})`); gr.addColorStop(1, 'rgba(255,226,150,0)');
      g.save(); g.transform(1, 0, -SUNP.sx * .8, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(-H, 0, W + 2 * H, H); g.restore();   // the shafts lean away from the sun
    }
    g.restore();
  }
  return f.apply(this, arguments);
})(nightLights);
// a little more contrast and colour in a painted style (a CSS filter on the canvas: done by the GPU compositor)
const gradeCss = () => { const c = document.getElementById('cv'); if (c) c.style.filter = STYLED() ? 'contrast(1.1) saturate(1.18)' : ''; };
gradeCss(); applyGraphics = (f => function () { const r = f.apply(this, arguments); gradeCss(); return r; })(applyGraphics);

// boss hazards and telegraphs are flat pixel shapes: a little lighter in a painted style
if (typeof drawHazards === 'function') drawHazards = (f => function () {
  if (!STYLED()) return f.apply(this, arguments);
  g.save(); g.globalAlpha *= .85;   // (a blur filter here froze the game during quake rings: a canvas filter per shape is far too slow)
  try { return f.apply(this, arguments); } finally { g.restore(); }
})(drawHazards);
