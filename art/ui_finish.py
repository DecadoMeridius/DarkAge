"""Finishes the painted UI pieces (art/ui_paint.py tries) for the game: darker oak (asked 2026-11-05), gold and brass kept
bright, clean rounded masks for the slot and tile, written to public/art/ui/ui_<piece>.png.

    python art/ui_finish.py frame=3 parch=3 button=11 slot=3 tile=3
"""
import colorsys, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
OUT, GAME = ROOT / 'art' / 'out' / 'ui', ROOT / 'public' / 'art' / 'ui'

def darken(im, k=.66):
    im = im.convert('RGBA'); px = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if not a: continue
            h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            gold = .08 < h < .17 and s > .45 and l > .45      # gold and brass stay bright
            if not gold: l *= k; s = min(1, s * 1.1)
            r2, g2, b2 = colorsys.hls_to_rgb(h, l, s); px[x, y] = (int(r2 * 255), int(g2 * 255), int(b2 * 255), a)
    return im

def despill(im):
    # anything still tinted magenta (the model shades its card: smears, rims) goes; wood is red-brown with little blue
    im = im.convert('RGBA'); px = im.load(); W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a and b - g > 14 and r - g > 14 and b > 50: m = min(b - g, r - g); px[x, y] = (r, g, b, max(0, a - int(m * 6)))
    return im

def rounded(im, inset=.035, rad=.1):
    W, H = im.size; c = im.crop((int(W * inset), int(H * inset), int(W * (1 - inset)), int(H * (1 - inset)))).convert('RGBA')
    m = Image.new('L', c.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, c.width - 1, c.height - 1], int(min(c.size) * rad), fill=255)
    c.putalpha(m.filter(ImageFilter.GaussianBlur(1))); return c

if __name__ == '__main__':
    GAME.mkdir(parents=True, exist_ok=True)
    for arg in sys.argv[1:]:
        name, seed = arg.split('=')
        src = OUT / (f'{name}_{seed}_raw.png' if name in ('slot', 'tile', 'button') else f'{name}_{seed}.png')
        im = Image.open(src)
        if name in ('slot', 'tile'): im = rounded(im, inset=.06)
        if name != 'parch': im = despill(im)
        if name == 'parch': im = im.convert('RGBA')
        else: im = darken(im, .62 if name != 'slot' else .55)
        if name == 'frame': im = im.resize((512, 512), Image.LANCZOS)
        if name == 'parch': im = im.resize((512, 512), Image.LANCZOS)
        if name in ('slot', 'tile'): im = im.resize((192, 192), Image.LANCZOS)
        if name == 'button':   # the plank alone, with its rounded outline (a stray blob sat outside a corner)
            W, H = im.size; im = im.crop((int(W * .04), int(H * .12), int(W * .96), int(H * .88)))
            m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width - 1, im.height - 1], int(im.height * .22), fill=255)
            a0 = im.getchannel('A'); from PIL import ImageChops; im.putalpha(ImageChops.multiply(a0, m.filter(ImageFilter.GaussianBlur(1))))
            im = im.resize((384, max(8, int(im.height * 384 / im.width))), Image.LANCZOS)
        im.save(GAME / f'ui_{name}.png'); print(name, im.size)
