"""Render the player template front / side / back with a sample palette and a few walk frames and poses:
python preview_char.py -> out/char.png (run inside the pixelart-mcp uv environment from art/)."""
import colorsys, importlib, sys
from PIL import Image

sys.path.insert(0, '.')
H = importlib.import_module('sprites.human')
chans = list(H.CH)


def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def sh(c, k):
    r, g, b = [v / 255 for v in hx(c)]; h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0, min(1, l + k * .14)); r, g, b = colorsys.hls_to_rgb(h, l, s); return (int(r * 255), int(g * 255), int(b * 255))


def ramp(c):
    return [sh(c, -1.7), sh(c, -.7), hx(c), sh(c, 1)]


PAL = dict(skin='#f6d0ac', hair='#7a4426', shirt='#4a7cc0', pants='#5a4e70', shoe='#6a4428', acc='#e8742a', belt='#6a4428')
rm = {n: ramp(PAL.get(n, '#888888')) for n in chans}


def comp(layers):
    im = Image.new('RGBA', (32, 64))
    for l in layers:
        im.alpha_composite(l.img)
    px = im.load()
    for y in range(64):
        for x in range(32):
            r, g, b, a = px[x, y]
            if a and r == 255 and g < len(chans) and b < 4:
                px[x, y] = rm[chans[g]][b] + (255,)
    return im


SP = H._all()
try:
    SP.update(H._anim())
except Exception:
    pass
frames = []
for d in (0, 2, 3):
    for f in ('0', 'w2', 'w6'):
        body = SP.get(f'hb_body_{d}_{f}')
        if not body:
            continue
        frames.append(comp([SP[f'hb_hair_short_{d}_back'](), body(), SP[f'hb_hair_short_{d}_front']()]))
sheet = Image.new('RGBA', (len(frames) * 36, 68), (90, 130, 70, 255))
for i, f in enumerate(frames):
    sheet.alpha_composite(f, (i * 36 + 2, 2))
sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save('out/char.png')
print(len(frames))
