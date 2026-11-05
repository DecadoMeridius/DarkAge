"""Paints the UI pieces for the painted styles (asked 2026-11-05: dark oak wood and beautiful edges) with the painterly
pipeline (ComfyUI, comfyui/restyle.py; see CLAUDE.md for the server). x_uiart.js uses them as CSS border-images and
backgrounds while a painted style is on.

Each piece has a rough layout drawn here on a magenta card; magenta is keyed out (the frame's middle stays open). Tries go
to art/out/ui/<piece>_<seed>.png, and `--pick <piece> <seed>` copies one to public/art/ui/ui_<piece>.png.

    python art/ui_paint.py <piece> [seed ...]     pieces: frame, parch, button, slot, tile
    python art/ui_paint.py --pick <piece> <seed>
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle
SRC, OUT, GAME = ROOT / 'art' / 'src', ROOT / 'art' / 'out' / 'ui', ROOT / 'public' / 'art' / 'ui'
KEY = (255, 0, 255)
STYLE = ('hand-painted fantasy RPG game interface art in a painted storybook style, visible oil brush strokes, soft shading with '
         'light from the top-left, rich warm colour. ')

def g_frame(d, w, h):
    d.rectangle([0, 0, w, h], fill=(70, 42, 24)); d.rectangle([w * .1, h * .1, w * .9, h * .9], fill=KEY)
    for x, y in ((0, 0), (w * .82, 0), (0, h * .82), (w * .82, h * .82)): d.rectangle([x, y, x + w * .18, y + h * .18], fill=(170, 130, 60))
def g_parch(d, w, h): d.rectangle([0, 0, w, h], fill=(236, 214, 170))
def g_button(d, w, h): d.rectangle([0, 0, w, h], fill=KEY); d.rounded_rectangle([w * .04, h * .1, w * .96, h * .9], 20, fill=(84, 52, 30))
def g_slot(d, w, h): d.rectangle([0, 0, w, h], fill=KEY); d.rectangle([w * .06, h * .06, w * .94, h * .94], fill=(60, 38, 22)); d.rectangle([w * .16, h * .16, w * .84, h * .84], fill=(110, 80, 50))
def g_tile(d, w, h): d.rectangle([0, 0, w, h], fill=KEY); d.rounded_rectangle([w * .05, h * .05, w * .95, h * .95], 24, fill=(56, 34, 20))

PIECES = {
    'frame': ((1024, 1024), g_frame, 'A square ornate picture frame made of dark oak wood: thick carved wooden edges with a fine bevel and '
              'a thin gold inner trim, and decorative brass corner fittings at all four corners. Every edge has the same width. The '
              'inside of the frame is empty: plain flat magenta. Seen straight on, flat, no perspective.', True),
    'parch': ((1024, 1024), g_parch, 'A sheet of warm old parchment paper filling the whole picture: soft fibres, faint stains and gentle '
              'light variation, no writing, no edges, no frame, seen straight on.', False),
    'button': ((768, 256), g_button, 'A single wide rectangular button made of a polished dark oak plank with rounded corners, a carved '
               'bevelled edge and a small brass rivet at each end, empty in the middle, on a plain flat magenta background. Seen straight on.', True),
    'slot': ((512, 512), g_slot, 'A single square inventory slot: a recessed hollow carved into dark oak wood with a bevelled rim and a '
             'slightly lighter worn wooden floor, empty, on a plain flat magenta background. Seen straight on.', True),
    'tile': ((512, 512), g_tile, 'A single square menu tile: a small dark oak wooden plaque with rounded corners, a carved bevelled edge and a '
             'thin brass trim, empty in the middle, on a plain flat magenta background. Seen straight on.', True),
}

def cut(im):
    im = im.convert('RGB'); W, H = im.size; px = im.load(); a = Image.new('L', (W, H)); ap = a.load()
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y]; m = min(r, b) - g
            ap[x, y] = 0 if m > 90 else 255 if m < 35 else int(255 * (90 - m) / 55)
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.8)); out = im.convert('RGBA'); out.putalpha(a); return out

if __name__ == '__main__':
    import shutil
    a = sys.argv[1:]
    if a[:1] == ['--pick']: GAME.mkdir(parents=True, exist_ok=True); shutil.copy(OUT / f'{a[1]}_{a[2]}.png', GAME / f'ui_{a[1]}.png'); print('->', a[1]); sys.exit()
    name = a[0]; (w, h), fn, prompt, key = PIECES[name]
    im = Image.new('RGB', (w, h)); fn(ImageDraw.Draw(im), w, h); SRC.mkdir(parents=True, exist_ok=True); gp = SRC / f'ui_{name}_guide.png'; im.save(gp)
    up = restyle.upload(gp); OUT.mkdir(parents=True, exist_ok=True)
    for seed in [int(x) for x in a[1:]] or [3, 11]:
        raw = OUT / f'{name}_{seed}_raw.png'; restyle.run(up, STYLE + prompt, raw, seed=seed, mp=.5 if w > 600 else .3, denoise=1.0, steps=4)
        img = Image.open(raw); (cut(img) if key else img.convert('RGBA')).save(OUT / f'{name}_{seed}.png')
