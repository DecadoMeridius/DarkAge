"""Full-size contact sheet of one module, every frame, at 2x: python preview_full.py <module> [filter] -> out/full_<module>.png"""
import importlib, sys
from PIL import Image
sys.path.insert(0, '.')
mod = importlib.import_module('sprites.' + sys.argv[1])
flt = sys.argv[2] if len(sys.argv) > 2 else ''
RAMP = [[(70, 64, 58), (110, 102, 94), (150, 142, 132), (196, 188, 176), (40, 36, 32)], [(80, 50, 40), (120, 80, 60), (160, 116, 90), (204, 160, 130), (50, 30, 24)]]
ims = []
for n, fn in mod.SPRITES.items():
    if flt and flt not in n: continue
    try: r = fn()
    except Exception as e: print('fail', n, e); continue
    for c in (r if isinstance(r, list) else [r])[:3]:
        im = c.img.copy(); px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                a = px[x, y]
                if a[3] and a[0] == 255 and a[1] < 2 and a[2] < 5: px[x, y] = RAMP[a[1]][a[2]] + (255,)
        ims.append(im)
W = 1400; x = y = 4; rowh = 0; pos = []
for im in ims:
    w, h = im.width * 2, im.height * 2
    if x + w > W: x = 4; y += rowh + 6; rowh = 0
    pos.append((x, y)); x += w + 6; rowh = max(rowh, h)
sheet = Image.new('RGBA', (W, y + rowh + 4), (96, 128, 72, 255))
for im, p in zip(ims, pos): sheet.alpha_composite(im.resize((im.width * 2, im.height * 2), Image.NEAREST), p)
sheet.save('out/full_' + sys.argv[1] + (('_' + flt) if flt else '') + '.png'); print(len(ims), 'images', sheet.size)
