/* Pixel text in the game world, from a hand-drawn bitmap font (2026-11-01: "text is super blurry on bigger
   resolutions"; earlier rounds: "the big smooth-font labels sit over the world").
   Every fillText / strokeText on the world canvas (g) is drawn from a 5x7 pixel font laid out on the art-pixel grid
   (one font pixel = one art pixel, two per world unit; bigger fonts double it), in capitals like the game's headings,
   with a hard 1-px outline in the stroke colour the caller set (when it stroked the same text just before filling,
   as the labels do). The bitmaps are cached and drawn with smoothing off, so they stay crisp at any zoom or screen
   size. HTML windows, the map canvases and the HUD are untouched. */
const PXFONT = (() => {
  const G = {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'], D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'], F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'], H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'], J: ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..'],
    K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'], L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'], N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'], R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'], V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'], X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'], Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'], 1: ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
    2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'], 3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
    4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'], 5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'], 7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'], 9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
    ' ': ['..', '..', '..', '..', '..', '..', '..'], '.': ['.', '.', '.', '.', '.', '.', '#'], ',': ['..', '..', '..', '..', '..', '.#', '#.'],
    ':': ['.', '.', '#', '.', '.', '#', '.'], ';': ['..', '..', '.#', '..', '..', '.#', '#.'], '!': ['#', '#', '#', '#', '#', '.', '#'],
    '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'], "'": ['#', '#', '.', '.', '.', '.', '.'], '"': ['#.#', '#.#', '...', '...', '...', '...', '...'],
    '-': ['...', '...', '...', '###', '...', '...', '...'], '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
    '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'], '(': ['.#', '#.', '#.', '#.', '#.', '#.', '.#'], ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
    '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '.#.##', '#..##'], '&': ['.##..', '#..#.', '.##..', '.#..#', '#.##.', '#..#.', '.##.#'],
    '#': ['.#.#.', '#####', '.#.#.', '.#.#.', '#####', '.#.#.', '.....'], '·': ['.', '.', '.', '#', '.', '.', '.'], '•': ['..', '..', '##', '##', '..', '..', '..'],
    '×': ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'], '✓': ['.....', '....#', '...#.', '#.#..', '.#...', '.....', '.....'], '✗': ['.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '.....'],
    '→': ['.......', '....#..', '.....#.', '#######', '.....#.', '....#..', '.......'], '←': ['.......', '..#....', '.#.....', '#######', '.#.....', '..#....', '.......'],
    '↑': ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..', '..#..'], '↓': ['..#..', '..#..', '..#..', '..#..', '#.#.#', '.###.', '..#..'],
    '↗': ['..###', '...##', '..#.#', '.#...', '#....', '.....', '.....'], '↖': ['###..', '##...', '#.#..', '...#.', '....#', '.....', '.....'],
    '↘': ['.....', '.....', '#....', '.#...', '..#.#', '...##', '..###'], '↙': ['.....', '.....', '....#', '...#.', '#.#..', '##...', '###..'],
    '♥': ['.#.#.', '#####', '#####', '.###.', '..#..', '.....', '.....'], '★': ['..#..', '..#..', '#####', '.###.', '.#.#.', '#...#', '.....'],
  };
  return G;
})();
{
  const PT_CACHE = new Map();
  let lastStroke = null;
  const rgb = s => { const t = document.createElement('canvas').getContext('2d'); t.fillStyle = s; t.fillRect(0, 0, 1, 1); return t.getImageData(0, 0, 1, 1).data; };
  // a line of text as a bitmap, one font pixel per art pixel (doubled for big fonts), with a 1-px outline
  const bitmap = (text, fontPx, fill, stroke) => {
    const key = fontPx + '|' + text + '|' + fill + '|' + stroke; let b = PT_CACHE.get(key); if (b) return b;
    const sc = fontPx >= 13 ? 2 : 1, chars = [...String(text).toUpperCase()].map(ch => PXFONT[ch] || PXFONT['?']);
    const gw = chars.reduce((a, g) => a + g[0].length + 1, 0) - 1, w = gw * sc + 2, h = 7 * sc + 2;
    const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = h; const x = c.getContext('2d'), d = x.createImageData(c.width, h), a = d.data, on = new Uint8Array(c.width * h);
    let cx = 1; for (const gl of chars) { for (let r = 0; r < 7; r++) for (let q = 0; q < gl[r].length; q++) if (gl[r][q] === '#') for (let yy = 0; yy < sc; yy++) for (let xx = 0; xx < sc; xx++) on[(1 + r * sc + yy) * c.width + cx + q * sc + xx] = 1; cx += (gl[0].length + 1) * sc; }
    const F = rgb(fill), S2 = stroke ? rgb(stroke) : null;
    for (let i = 0; i < on.length; i++) { const o = i * 4;
      if (on[i]) { a[o] = F[0]; a[o + 1] = F[1]; a[o + 2] = F[2]; a[o + 3] = 255; continue; }
      const X = i % c.width, Y = (i / c.width) | 0;
      if (S2 && ((X > 0 && on[i - 1]) || (X < c.width - 1 && on[i + 1]) || (Y > 0 && on[i - c.width]) || (Y < h - 1 && on[i + c.width]) || (X > 0 && Y > 0 && on[i - c.width - 1]) || (X < c.width - 1 && Y < h - 1 && on[i + c.width + 1]))) { a[o] = S2[0]; a[o + 1] = S2[1]; a[o + 2] = S2[2]; a[o + 3] = 255; }
    }
    x.putImageData(d, 0, 0);
    b = { c, w: c.width, h }; if (PT_CACHE.size > 800) PT_CACHE.clear(); PT_CACHE.set(key, b); return b;
  };
  const wrap = ctx => {
    if (!ctx || ctx._pixelText) return; ctx._pixelText = 1;
    const fill0 = ctx.fillText.bind(ctx), stroke0 = ctx.strokeText.bind(ctx);
    ctx.strokeText = function (t, x, y) { if (!S || TITLE) return stroke0(t, x, y); lastStroke = { t: String(t), x, y, s: ctx.strokeStyle }; };
    ctx.fillText = function (t, x, y) {
      if (!S || TITLE || typeof ctx.fillStyle !== 'string') return fill0(t, x, y);
      t = String(t); const st = lastStroke && lastStroke.t === t && Math.abs(lastStroke.x - x) < 2 && Math.abs(lastStroke.y - y) < 2 ? lastStroke.s : null; lastStroke = null;
      const m = ctx.font.match(/(\d+(?:\.\d+)?)px/), px = m ? +m[1] : 8;
      const b = bitmap(t, px, ctx.fillStyle, typeof st === 'string' ? st : null), al = ctx.textAlign, W = b.w / 2, H = b.h / 2;   // 2 art px per world unit
      let dx = x; if (al === 'center') dx = x - W / 2; else if (al === 'right' || al === 'end') dx = x - W;
      const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
      ctx.drawImage(b.c, Math.round(dx * 2) / 2, Math.round((y - H + 1) * 2) / 2, W, H);   // on the art-pixel grid, sitting on the baseline
      ctx.imageSmoothingEnabled = sm;
    };
  };
  if (typeof g !== 'undefined') wrap(g);
}
