/* Pixel-crisp text in the game world (art-and-feel playtests: "the big smooth-font labels sit over the world",
   "world labels and floating numbers are anti-aliased").
   Every fillText / strokeText on the world canvas (g) goes through here: the text is drawn once at art-pixel
   resolution (2 per world unit), each pixel is made fully on or off, and a hard 1-px outline is added in the
   stroke colour the caller set (when it stroked the same text first, as the labels do). The bitmap is cached and
   drawn with smoothing off, so labels, signposts, damage numbers and the tracker label match the pixel art.
   HTML windows, the map canvases and the HUD are untouched. */
{
  const PT_CACHE = new Map(), K = 2;
  let lastStroke = null;
  const bitmap = (text, font, fill, stroke) => {
    const key = font + '|' + text + '|' + fill + '|' + stroke; let b = PT_CACHE.get(key); if (b) return b;
    const m = font.match(/(\d+(?:\.\d+)?)px/), px = m ? +m[1] : 10, big = font.replace(/(\d+(?:\.\d+)?)px/, Math.round(px * K) + 'px');
    const c = document.createElement('canvas'), x = c.getContext('2d'); x.font = big;
    const w = Math.ceil(x.measureText(text).width) + 4, h = Math.ceil(px * K * 1.35) + 4; c.width = w; c.height = h;
    x.font = big; x.textBaseline = 'alphabetic'; x.fillStyle = fill; x.fillText(text, 2, Math.round(px * K) + 1);
    const d = x.getImageData(0, 0, w, h), a = d.data, on = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) on[i] = a[i * 4 + 3] >= 110 ? 1 : 0;
    const col = (s => { const t = document.createElement('canvas').getContext('2d'); t.fillStyle = s; t.fillRect(0, 0, 1, 1); return t.getImageData(0, 0, 1, 1).data; });
    const F = col(fill), S2 = stroke ? col(stroke) : null;
    for (let i = 0; i < w * h; i++) {
      const o = i * 4;
      if (on[i]) { a[o] = F[0]; a[o + 1] = F[1]; a[o + 2] = F[2]; a[o + 3] = 255; continue; }
      const X = i % w, Y = (i / w) | 0;
      if (S2 && ((X > 0 && on[i - 1]) || (X < w - 1 && on[i + 1]) || (Y > 0 && on[i - w]) || (Y < h - 1 && on[i + w]))) { a[o] = S2[0]; a[o + 1] = S2[1]; a[o + 2] = S2[2]; a[o + 3] = Math.max(200, S2[3]); }
      else a[o + 3] = 0;
    }
    x.putImageData(d, 0, 0);
    b = { c, w, h, base: Math.round(px * K) + 1 }; if (PT_CACHE.size > 600) PT_CACHE.clear(); PT_CACHE.set(key, b); return b;
  };
  const wrap = ctx => {
    if (!ctx || ctx._pixelText) return; ctx._pixelText = 1;
    const fill0 = ctx.fillText.bind(ctx), stroke0 = ctx.strokeText.bind(ctx);
    ctx.strokeText = function (t, x, y) { if (!S || TITLE) return stroke0(t, x, y); lastStroke = { t: String(t), x, y, s: ctx.strokeStyle }; };
    ctx.fillText = function (t, x, y) {
      if (!S || TITLE || typeof ctx.fillStyle !== 'string') return fill0(t, x, y);
      t = String(t); const st = lastStroke && lastStroke.t === t && Math.abs(lastStroke.x - x) < 2 && Math.abs(lastStroke.y - y) < 2 ? lastStroke.s : null; lastStroke = null;
      const b = bitmap(t, ctx.font, ctx.fillStyle, typeof st === 'string' ? st : null), al = ctx.textAlign;
      let dx = x - 2 / K; if (al === 'center') dx = x - b.w / K / 2; else if (al === 'right' || al === 'end') dx = x - b.w / K + 2 / K;
      const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
      ctx.drawImage(b.c, Math.round(dx * K) / K, Math.round((y - b.base / K) * K) / K, b.w / K, b.h / K);
      ctx.imageSmoothingEnabled = sm;
    };
  };
  if (typeof g !== 'undefined') wrap(g);
}
