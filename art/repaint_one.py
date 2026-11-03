"""Repaint a few sprites on a sheet of their own with words that say what they are, for review and pinning.

    cd art && uv run --project ../tools/pixelart-mcp-main --with numpy python repaint_one.py <out_dir> <name,name,..> <seed> "<what they are>"

Paints the sprites with the free-painting prompt plus the description, cuts each out as the build does
(cut, place, frame_of in style_free.py) and writes <out_dir>/<name>.png + frames.json (k, ox, oy) and a contact
sheet review.png (pixel sprite | painting). Approved frames are copied into pinned/<style>/ so every build keeps them.
Made 2026-11-03 for the Ashen Wastes' dead trees and the Emberwaste's charwood (their paintings had leaves and ground).
"""
import json, sys
from pathlib import Path
out_dir, names, seed, what = Path(sys.argv[1]), sys.argv[2].split(','), int(sys.argv[3]), sys.argv[4]
sys.argv = sys.argv[:1]
import style_free as sf   # (sets the style to painterly on import)
from PIL import Image
import numpy as np
sb = sf.sb

gen = sf.gen_for(names[0])
sheet, pos, pad = sf.sheet_for(names, gen, soft=True)
prompt = (sf.FREE.format('') + ' What they are: ' + what +
          ' Each one stands alone on the magenta card: no ground under it, no grass, rocks, ruins, water or mushrooms.')
key = 'PIN_' + '_'.join(n[:10] for n in names)[:60] + f'_s{seed}'
res = sb.restyle_sheet(key, sheet, prompt, seed=seed)
out_dir.mkdir(parents=True, exist_ok=True)
meta, cells = {}, []
for n, (x, y) in pos.items():
    got = sf.cut(res, n, x, y, pad, gen, None)
    if not got: print('nothing found for', n); continue
    got = (got[0], sf.place(n, got[0], gen))
    f = sf.frame_of(n, got, gen)
    if not f: print('wrong size for', n, got[0].size); continue
    f[0].save(out_dir / f'{n}.png'); meta[n] = {'k': f[1], **f[2]}
    cells.append((sb.crop(n).resize((sb.atlas[n]['w'] * 3, sb.atlas[n]['h'] * 3), Image.NEAREST), f[0]))
(out_dir / 'frames.json').write_text(json.dumps(meta, indent=1))
W = sum(o.width + p.width + 40 for o, p in cells) + 10; H = max(max(o.height, p.height) for o, p in cells) + 20
yy, xx = np.mgrid[:H, :W]; d = np.zeros((H, W, 4), np.uint8)
d[...] = np.where((((yy // 16) + (xx // 16)) % 2)[..., None] == 0, [74, 70, 66, 255], [84, 80, 76, 255])   # ashy grey, like the Wastes
chk = Image.fromarray(d); x = 10
for o, p in cells:
    chk.alpha_composite(o, (x, H - 10 - o.height)); x += o.width + 10
    chk.alpha_composite(p, (x, H - 10 - p.height)); x += p.width + 30
chk.save(out_dir / 'review.png'); print('ok', list(meta))
