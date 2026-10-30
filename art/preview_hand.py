"""Preview every frame of the hand-drawn creatures, one creature per row (walk frames, then attack frames).
Run inside the pixelart-mcp uv environment from art/: python preview_hand.py [name ...] -> out/hand.png"""
import importlib, sys
from PIL import Image

sys.path.insert(0, '.')
hd = importlib.import_module('sprites.handdrawn')
want = sys.argv[1:]
RAMPS = [[(64, 58, 54), (104, 96, 90), (148, 140, 130), (196, 188, 176)], [(70, 44, 36), (112, 72, 58), (156, 108, 86), (204, 156, 128)]]


def col(c):
    im = c.img.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and r == 255 and g < 2 and b < 4:
                px[x, y] = RAMPS[g][b] + (255,)
    return im


rows = []
for n in hd.SPRITES:
    if n.endswith('_atk') or (want and not any(w in n for w in want)):
        continue
    frames = [col(c) for c in hd.SPRITES[n]()] + ([col(c) for c in hd.SPRITES[n + '_atk']()] if n + '_atk' in hd.SPRITES else [])
    rows.append(frames)
W = max(sum(f.width + 6 for f in r) for r in rows); H = sum(max(f.height for f in r) + 6 for r in rows)
sheet = Image.new('RGBA', (W, H), (74, 104, 60, 255)); y = 0
for r in rows:
    h = max(f.height for f in r); x = 0
    for i, f in enumerate(r):
        sheet.alpha_composite(f, (x + 3, y + 3 + h - f.height)); x += f.width + 6
    y += h + 6
sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save('out/hand.png')
print(len(rows), 'creatures')
