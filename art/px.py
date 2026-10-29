"""Pixel-art helpers for Emberhollow sprite scripts.

Thin layer over pixelart-mcp's craft module (hue-shifted ramps, form shading)
plus masks, selective outlines and drop shadows. Light comes from the top-left.
"""
import math, os, random, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'tools', 'pixelart-mcp-main'))
from pixelart_mcp import craft  # noqa: E402
from PIL import Image  # noqa: E402

LIGHT = 'top_left'


def hx(c):
    return craft.parse_color(c) if isinstance(c, str) else (tuple(c) + (255,))[:4]


def ramp(base, steps=5, shift=14.0):
    r, i = craft.build_ramp(hx(base), steps, shift)
    return r, i


class Canvas:
    def __init__(self, w, h, bg=(0, 0, 0, 0)):
        self.w, self.h = w, h
        self.img = Image.new('RGBA', (w, h), bg)
        self.px = self.img.load()

    def inside(self, x, y):
        return 0 <= x < self.w and 0 <= y < self.h

    def set(self, x, y, c):
        if self.inside(x, y):
            self.px[x, y] = hx(c)

    def get(self, x, y):
        return self.px[x, y] if self.inside(x, y) else (0, 0, 0, 0)

    def fill(self, mask, c):
        c = hx(c)
        for x, y in mask:
            if self.inside(x, y):
                self.px[x, y] = c

    def shade(self, mask, base, mode='form', steps=5, shift=14.0, light=LIGHT, colors=None):
        """Fill and shade a region. `colors` (dark->light hex list, base in the
        middle) overrides the generated ramp for hand-picked palettes."""
        mask = {p for p in mask if self.inside(*p)}
        if not mask:
            return
        r, i = ([hx(c) for c in colors], len(colors) // 2) if colors else ramp(base, steps, shift)
        self.fill(mask, colors[len(colors) // 2] if colors else base)
        fn = {'form': craft.shade_form, 'sphere': craft.shade_sphere}.get(mode)
        if fn:
            fn(self.img, mask, r, light, i)
        elif mode in ('cyl', 'cyl_side'):
            craft.shade_cylinder(self.img, mask, r, light, mode == 'cyl', i)
        self.px = self.img.load()

    def blend(self, x, y, c, a):
        if not self.inside(x, y):
            return
        r, g, b, al = self.px[x, y]
        c = hx(c)
        self.px[x, y] = (round(r + (c[0] - r) * a), round(g + (c[1] - g) * a), round(b + (c[2] - b) * a), al)

    def outline(self, palette_hint=None):
        """Selective 1px outline: each empty pixel touching art becomes a
        darker, cooler version of the art it touches."""
        src = self.img.copy().load()
        out = []
        for y in range(self.h):
            for x in range(self.w):
                if src[x, y][3]:
                    continue
                ns = [src[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                      if 0 <= x + dx < self.w and 0 <= y + dy < self.h and src[x + dx, y + dy][3] > 128]
                if ns:
                    n = min(ns, key=lambda c: c[0] + c[1] + c[2])
                    out.append((x, y, craft.darken_for_outline(n[:3]) + (255,)))
        for x, y, c in out:
            self.px[x, y] = c

    def paste(self, other, x, y):
        self.img.alpha_composite(other.img if isinstance(other, Canvas) else other, (x, y))
        self.px = self.img.load()

    def save(self, path, scale=1):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        im = self.img if scale == 1 else self.img.resize((self.w * scale, self.h * scale), Image.NEAREST)
        im.save(path)


# ---- masks ---------------------------------------------------------------
def rect(x, y, w, h):
    return {(i, j) for i in range(x, x + w) for j in range(y, y + h)}


def ellipse(cx, cy, rx, ry):
    return {(x, y) for x in range(math.floor(cx - rx), math.ceil(cx + rx) + 1)
            for y in range(math.floor(cy - ry), math.ceil(cy + ry) + 1)
            if ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1}


def poly(verts):
    out = set()
    ys = [v[1] for v in verts]
    for y in range(math.floor(min(ys)), math.ceil(max(ys)) + 1):
        xs = []
        for i in range(len(verts)):
            (x0, y0), (x1, y1) = verts[i], verts[(i + 1) % len(verts)]
            if (y0 <= y + .5 < y1) or (y1 <= y + .5 < y0):
                xs.append(x0 + (y + .5 - y0) / (y1 - y0) * (x1 - x0))
        xs.sort()
        for j in range(0, len(xs) - 1, 2):
            out |= {(x, y) for x in range(round(xs[j]), round(xs[j + 1]))}
    return out


def line(x0, y0, x1, y1):
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    return {(round(x0 + (x1 - x0) * t / n), round(y0 + (y1 - y0) * t / n)) for t in range(n + 1)}


def shadow(cv, cx, cy, rx, ry, a=0.4, col='#2e4a14'):
    """Soft-edged pixel shadow: solid core with a dithered rim."""
    for x, y in ellipse(cx, cy, rx, ry):
        d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
        if d < 0.7 or (x + y) % 2 == 0:
            cv.blend(x, y, col, a)


# ---- noise ---------------------------------------------------------------
def _h(x, y, s):
    n = (int(x) * 374761393 + int(y) * 668265263 + int(s) * 982451653) & 0xffffffff
    n = ((n ^ (n >> 13)) * 1274126177) & 0xffffffff
    return ((n ^ (n >> 16)) & 0xffffffff) / 4294967296


def vnoise(x, y, s=0):
    xi, yi = math.floor(x), math.floor(y)
    xf, yf = x - xi, y - yi
    u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
    a = _h(xi, yi, s) + (_h(xi + 1, yi, s) - _h(xi, yi, s)) * u
    b = _h(xi, yi + 1, s) + (_h(xi + 1, yi + 1, s) - _h(xi, yi + 1, s)) * u
    return a + (b - a) * v


def fbm(x, y, s=0, o=3):
    t = n = 0
    a = f = 1
    for i in range(o):
        t += vnoise(x * f, y * f, s + i * 31) * a
        n += a
        a *= .5
        f *= 2
    return t / n


def rng(seed):
    return random.Random(seed)
