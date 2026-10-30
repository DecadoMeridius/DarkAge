"""Preview sheet of creature templates with sample colours: python preview_creatures.py <prefix> <out.png>
(run inside the pixelart-mcp uv environment, from art/). Not part of the atlas build."""
import colorsys, importlib, sys
from PIL import Image

sys.path.insert(0, '.')
cr = importlib.import_module('sprites.creatures')
importlib.import_module('sprites.creatures2')
prefix, out = sys.argv[1], sys.argv[2]
mods = [cr] + [importlib.import_module('sprites.creatures2')]
names = [(m, n) for m in mods for n in m.SPRITES if n.startswith(prefix)]


def hx(c):
    c = c.lstrip('#'); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def sh(c, k):
    r, g, b = [v / 255 for v in hx(c)]; h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0, min(1, l + k * .14)); r, g, b = colorsys.hls_to_rgb(h, l, s); return (int(r * 255), int(g * 255), int(b * 255))


COLS = ['#c89a5a', '#6a4a30', '#e8e0d0', '#5a6a8a', '#8a3a2a', '#4a8a4a']
tiles = []
for i, (m, n) in enumerate(names):
    frames = m.SPRITES[n]()
    frames = frames if isinstance(frames, list) else [frames]
    c0 = COLS[i % len(COLS)]; c1 = COLS[(i + 1) % len(COLS)]
    rm = [[sh(c, k) for k in (-1.7, -.7, 0, 1)] for c in (c0, c1)]
    for fr in frames:
        im = fr.img.copy(); px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if a and r == 255 and g < 2 and b < 4:
                    px[x, y] = rm[g][b] + (255,)
        tiles.append(im)
W = sum(t.width + 4 for t in tiles[:12]); rows = (len(tiles) + 11) // 12
H = max(t.height for t in tiles) + 4
sheet = Image.new('RGBA', (max(W, 400), rows * H), (70, 100, 60, 255))
for i, t in enumerate(tiles):
    r, c = divmod(i, 12)
    x = sum(tt.width + 4 for tt in tiles[r * 12:i])
    sheet.alpha_composite(t, (x, r * H + H - t.height - 2))
sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(out)
print(len(tiles), 'frames')
