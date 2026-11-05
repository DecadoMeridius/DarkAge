"""Cuts every saved painting out again with the current magenta key (art/magenta.py), without repainting: fish, animals,
creatures, single sprites (and their winter looks) and item icons. Run it after changing the key.

    python art/recut.py
"""
import json, sys
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'art')); sys.argv = sys.argv[:1]
import fish_paint, object_paint, icon_paint
O, P = ROOT / 'art' / 'out', ROOT / 'public' / 'art'
n = 0
for sub in ('fish', 'animals', 'creatures'):
    for raw in sorted((O / sub).glob('*.png')):
        out = P / sub / raw.name
        if out.exists(): im = fish_paint.cut(Image.open(raw)); im = im.transpose(Image.FLIP_LEFT_RIGHT) if raw.stem == 'octopus' else im; im.save(out); n += 1
for raw in sorted((O / 'objects').glob('*.png')):
    out = P / 'objects' / raw.name
    if raw.stem in object_paint.EDITED or raw.stem.endswith('_w'): continue   # aligned building edits: finished below at their source's size
    if out.exists(): object_paint.depink(object_paint.despill(object_paint.objcut(Image.open(raw)))).save(out); n += 1
for nm in [e[0] for e in object_paint.EDITS] + sorted(p.stem for p in (P / 'objects').glob('bld_*_w.png')):
    if nm != 'bld_cabin_4x3' and (O / 'objects' / f'{nm}.png').exists() and object_paint.src_of(nm).exists():
        object_paint.finish(O / 'objects' / f'{nm}.png', object_paint.src_of(nm)).save(P / 'objects' / f'{nm}.png'); n += 1
for raw in sorted((O / 'icons' / 'raw').glob('*.png')):
    if (O / 'icons' / raw.name).exists(): icon_paint.cut(Image.open(raw)).save(O / 'icons' / raw.name); n += 1
icon_paint.pack()
print('recut', n)
