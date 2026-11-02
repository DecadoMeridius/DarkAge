/* Light and shadow for the art styles (asked 2026-11-02: "with all the lighting and shadows like in the pictures").
   Only when SETTINGS.artStyle isn't 'pixel'; the pixel style keeps its flat grade (see CLAUDE.md).
   - Cast shadows: every styled object sprite flagged `cast` (buildings, trees, rocks, props, walls...) throws a soft
     silhouette toward the bottom-right, away from the top-left light. Made once per sprite (`castOf`) and drawn just
     before the sprite, so the y-sorted draw order lays it under whatever stands in front. They fade at night.
   - Contact shadows under creatures and people are soft ellipses instead of hard pixel ones.
   - The grade: after the flat time-of-day multiply, a soft-light wash warm from the top-left and cool toward the
     bottom-right, and a gentle vignette; lamps and windows get a soft glow after dark. */
const STYLED = () => SETTINGS.artStyle !== 'pixel';
const CAST_NO = /^(ground_|dec_|soil|crop|weed|tgrass|flower|twig|stone$|page|shell|shard|dig|channel|conveyor|chute|fastbelt|runebelt|sorter|splitter|fence_|ladder|upladder|cave|clay|salt|log$|mushroom|fern|cattail|sapling)/;
let LIGHT_K = 1;   // how strong daylight shadows are now (0 at night)

PIX.get = (f => function (n) {
  const c = f.call(this, n);
  if (c && c.hi && !c.lum && c.cast === undefined) c.cast = CAST_NO.test(n) ? 0 : 1;
  return c;
})(PIX.get);
if (typeof swayFrame === 'function') swayFrame = (f => function (c) { const s = f.apply(this, arguments); if (s && c && s !== c) s.cast = c.cast; return s; })(swayFrame);

const CASTC = new WeakMap(), SH_A = .62, SH_B = .2;
function castOf(c) {
  let s = CASTC.get(c); if (s) return s;
  const w = c.width, h = c.height, ppu = w / c.ww, B = Math.ceil(ppu * 3);
  const W = Math.ceil(w + SH_A * h) + 2 * B, H = Math.ceil(SH_B * h) + 2 * B;
  const sil = mk(W, H, x => {
    x.setTransform(1, 0, -SH_A, -SH_B, SH_A * h + B, SH_B * h + B); x.drawImage(c, 0, 0);
    x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgb(34,26,52)'; x.fillRect(0, 0, W, H);
  });
  s = mk(W, H, x => { x.filter = `blur(${Math.max(2, ppu * 1.2)}px)`; x.drawImage(sil, 0, 0); });
  s.B = B; s.ppu = ppu; CASTC.set(c, s); return s;
}
g.drawImage = (f => function (img, a1, a2, a3, a4) {
  if (img && img.cast && arguments.length === 5 && STYLED() && LIGHT_K > .02 && !g.__noCast) {
    const s = castOf(img), k = a3 / img.width, ga = this.globalAlpha;
    this.globalAlpha = ga * .36 * LIGHT_K; g.__noCast = 1;
    f.call(this, s, a1 - s.B * k, a2 + a4 - (s.B + 1) * k, s.width * k, s.height * k);
    g.__noCast = 0; this.globalAlpha = ga;
  }
  return f.apply(this, arguments);
})(g.drawImage);

shadow = (f => function (x, y, r, a = .22) {
  if (!STYLED()) return f.apply(this, arguments);
  g.save(); g.translate(x, y); g.scale(1, .42);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.25);
  gr.addColorStop(0, `rgba(30,22,40,${a * 1.5})`); gr.addColorStop(.6, `rgba(30,22,40,${a})`); gr.addColorStop(1, 'rgba(30,22,40,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.25, 0, 6.283); g.fill(); g.restore();
})(shadow);

pixGrade = (f => function (m, W, H) {
  f.apply(this, arguments);
  const t = ((S.time % 1440) + 1440) % 1440, day = m.dark || m.indoor ? 0 : Math.max(0, Math.min(1, Math.min((t - 330) / 90, (1230 - t) / 120)));
  LIGHT_K = m.dark ? 0 : m.indoor ? .45 : day;
  if (!STYLED()) return;
  const warm = m.dark ? 0 : m.indoor ? .5 : .25 + .75 * day;
  g.save(); g.globalCompositeOperation = 'soft-light';
  const lg_ = g.createLinearGradient(0, 0, W, H);
  lg_.addColorStop(0, `rgba(255,214,150,${.55 * warm})`); lg_.addColorStop(.55, 'rgba(128,128,128,0)'); lg_.addColorStop(1, `rgba(40,40,90,${.45 * warm + .15})`);
  g.fillStyle = lg_; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'source-over';
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .45, W / 2, H / 2, Math.hypot(W, H) * .62);
  vg.addColorStop(0, 'rgba(18,10,26,0)'); vg.addColorStop(1, `rgba(18,10,26,${m.dark ? .45 : .28})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H); g.restore();
})(pixGrade);
// after dark, every window and flame nightLights paints also gets a soft warm halo
let NL_ON = 0;
if (typeof nightLights === 'function') nightLights = (f => function () { NL_ON = STYLED(); try { return f.apply(this, arguments); } finally { NL_ON = 0; } })(nightLights);
g.fillRect = (f => function (x, y, w, h) {
  f.apply(this, arguments);
  if (!NL_ON || this.globalAlpha < .05 || w > 400) return;
  const cx = x + w / 2, cy = y + h / 2, r = Math.max(w, h) * 2.6 + 6, ga = this.globalAlpha, op = this.globalCompositeOperation;
  const gr = this.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(255,190,110,.5)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
  this.globalCompositeOperation = 'lighter'; this.globalAlpha = ga * .45; this.fillStyle = gr; f.call(this, cx - r, cy - r, 2 * r, 2 * r);
  this.globalCompositeOperation = op; this.globalAlpha = ga;
})(g.fillRect);
