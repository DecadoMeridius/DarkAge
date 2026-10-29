"""Draw every game sprite and pack them into public/art/atlas.png + atlas.json.

Run with:  npm run art
Each module in art/sprites/ exposes SPRITES = {name: fn}; fn() returns a px.Canvas
(or a list of canvases for animation frames, packed as name.0, name.1, ...).
Sprites are 32px per tile: 2 art pixels per world unit.
"""
import importlib, json, os, pkgutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from PIL import Image  # noqa: E402
import sprites  # noqa: E402

OUT = os.path.join(HERE, '..', 'public', 'art')
PAD = 1


def collect():
    out = {}
    for m in pkgutil.iter_modules(sprites.__path__):
        mod = importlib.import_module(f'sprites.{m.name}')
        for name, fn in getattr(mod, 'SPRITES', {}).items():
            res = fn()
            if isinstance(res, list):
                for i, c in enumerate(res):
                    out[f'{name}.{i}'] = c
            else:
                out[name] = res
    return out


def pack(items, width=1024):
    """Shelf packer: tallest first, left to right, new shelf when the row is full."""
    order = sorted(items.items(), key=lambda kv: -kv[1].h)
    x = y = shelf = 0
    frames = {}
    for name, c in order:
        if x + c.w + PAD > width:
            x, y, shelf = 0, y + shelf + PAD, 0
        frames[name] = {'x': x, 'y': y, 'w': c.w, 'h': c.h}
        if getattr(c, 'anchor', None):
            frames[name]['ax'], frames[name]['ay'] = c.anchor
        if getattr(c, 'meta', None):
            frames[name]['meta'] = c.meta
        x += c.w + PAD
        shelf = max(shelf, c.h)
    img = Image.new('RGBA', (width, y + shelf + PAD), (0, 0, 0, 0))
    for name, c in items.items():
        f = frames[name]
        img.alpha_composite(c.img, (f['x'], f['y']))
    return img, frames


def main():
    items = collect()
    img, frames = pack(items)
    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, 'atlas.png'))
    with open(os.path.join(OUT, 'atlas.json'), 'w') as f:
        json.dump({'frames': frames}, f, separators=(',', ':'))
    print(f'{len(frames)} sprites -> atlas {img.width}x{img.height}')


if __name__ == '__main__':
    main()
