"""Preview any atlas sprites by name (all frames), in their real colours:
python preview_sprites.py name1 name2 ... -> out/sprites.png (run inside the pixelart-mcp uv environment, from art/)."""
import importlib, pkgutil, sys
from PIL import Image

sys.path.insert(0, '.')
import sprites

want = sys.argv[1:]
found = {}
for m in pkgutil.iter_modules(sprites.__path__):
    mod = importlib.import_module(f'sprites.{m.name}')
    for n, fn in getattr(mod, 'SPRITES', {}).items():
        if n in want:
            found[n] = fn  # later modules win, like the atlas build
tiles = []
for n in want:
    if n not in found:
        print('missing', n); continue
    res = found[n]()
    for c in (res if isinstance(res, list) else [res]):
        tiles.append(c.img)
W = sum(t.width + 6 for t in tiles); H = max(t.height for t in tiles) + 6
sheet = Image.new('RGBA', (W, H), (90, 130, 70, 255)); x = 0
for t in tiles:
    sheet.alpha_composite(t, (x + 3, H - t.height - 3)); x += t.width + 6
sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save('out/sprites.png')
print(len(tiles), 'frames')
