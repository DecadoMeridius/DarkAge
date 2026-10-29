"""Contact sheet of atlas sprites whose names start with any given prefix: python sheet.py out.png prefix..."""
import json, sys
from PIL import Image
a = Image.open('../../public/art/atlas.png'); f = json.load(open('../../public/art/atlas.json'))['frames']
names = [k for k in f if any(k.startswith(p) for p in sys.argv[2:])]
W = 1100; x = y = rowh = 0; pos = []
for k in names:
    v = f[k]
    if x + v['w'] > W: x, y, rowh = 0, y + rowh + 6, 0
    pos.append((k, x, y)); x += v['w'] + 6; rowh = max(rowh, v['h'])
sheet = Image.new('RGBA', (W, y + rowh + 6), (110, 150, 70, 255))
for k, x, y in pos:
    v = f[k]; sheet.alpha_composite(a.crop((v['x'], v['y'], v['x'] + v['w'], v['y'] + v['h'])), (x, y))
sheet = sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST); sheet.save(sys.argv[1])
