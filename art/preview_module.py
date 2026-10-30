"""Contact sheet of every sprite in one module (first frame each): python preview_module.py <module> [max]
-> out/module_<module>.png. Channel templates are shown in a neutral ramp. Run inside the pixelart-mcp uv environment from art/."""
import importlib, sys
from PIL import Image

sys.path.insert(0, '.')
mod = importlib.import_module('sprites.' + sys.argv[1])
mx = int(sys.argv[2]) if len(sys.argv) > 2 else 400
RAMP = [[(70, 64, 58), (110, 102, 94), (150, 142, 132), (196, 188, 176)], [(80, 50, 40), (120, 80, 60), (160, 116, 90), (204, 160, 130)]]
tiles = []
for n, fn in list(mod.SPRITES.items())[:mx]:
    try:
        r = fn()
    except Exception as e:
        print('fail', n, e); continue
    im = (r[0] if isinstance(r, list) else r).img.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            a = px[x, y]
            if a[3] and a[0] == 255 and a[1] < 2 and a[2] < 4:
                px[x, y] = RAMP[a[1]][a[2]] + (255,)
    if im.width > 96 or im.height > 96:
        k = max(im.width, im.height) / 96
        im = im.resize((max(1, round(im.width / k)), max(1, round(im.height / k))), Image.NEAREST)
    tiles.append(im)
cols = 14
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGBA', (cols * 100, rows * 100), (90, 130, 70, 255))
for i, t in enumerate(tiles):
    r_, c = divmod(i, cols)
    sheet.alpha_composite(t, (c * 100 + (100 - t.width) // 2, r_ * 100 + 100 - t.height - 2))
sheet.save('out/module_' + sys.argv[1] + '.png')
print(len(tiles), 'sprites')
