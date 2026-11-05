"""Paints a side view of every farm animal coat and the pets for the painted styles (asked 2026-11-05: the animals were
upscaled pixel art) with the painterly pipeline (ComfyUI, comfyui/restyle.py; see CLAUDE.md for the server).

art/src/animals.json and art/src/animals/<id>.png are the game's coats and their pixel frames (exported from the game),
ids `<species>_<coat>` and `pet_dog` / `pet_cat`. Each frame, softened on a magenta card, is repainted as that animal in
that coat, keyed out and cropped to public/art/animals/<id>.png (facing right); public/art/animals/animals.json lists them.
x_artfix.js draws them in the animal's own sprite box with a step bob.

    python art/animal_paint.py [id ...]
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle
sys.path.insert(0, str(ROOT / 'art'))
from fish_paint import cut, keep_biggest   # the same magenta key and clean-up
SRC, OUT, GAME = ROOT / 'art' / 'src', ROOT / 'art' / 'out' / 'animals', ROOT / 'public' / 'art' / 'animals'
KEY = (255, 0, 255)
NAMES = {'chicken': 'hen', 'duck': 'duck', 'rabbit': 'rabbit', 'goat': 'goat', 'sheep': 'woolly sheep', 'cow': 'cow', 'pig': 'pig', 'horse': 'horse', 'dog': 'friendly farm dog', 'cat': 'farm cat'}
COAT = {'spotted': 'black-and-white spotted', 'belted': 'black belted Galloway (black with a wide white band round its middle)', 'highland': 'shaggy ginger Highland',
        'speckled': 'cream speckled', 'mallard': 'mallard', 'royal': 'royal blue and gold', 'boar': 'wild-boar brown bristly', 'dapple': 'dapple grey',
        'palomino': 'golden palomino', 'pinto': 'brown-and-white pinto', 'ember': 'fiery red-orange', 'golden': 'golden', 'silver': 'silvery', 'cream': 'cream-coloured'}

def paint(d, seed=7):
    g = Image.new('RGB', (640, 640), KEY); ic = Image.open(SRC / 'animals' / f'{d["id"]}.png').convert('RGBA')
    ic.thumbnail((440, 440), Image.NEAREST); ic = ic.filter(ImageFilter.GaussianBlur(3)); g.paste(ic, ((640 - ic.width) // 2, (640 - ic.height) // 2), ic)
    gp = SRC / 'animal_guide.png'; g.save(gp); up = restyle.upload(gp)
    who = NAMES.get(d['sp'], d['sp']); coat = COAT.get(d['coat'], d['coat'])
    prompt = (f'Repaint this rough shape as a beautiful hand-painted fantasy RPG illustration of a {coat + " " if coat else ""}{who}, a single animal '
              'standing on all its legs, seen exactly from the side, facing right, the whole animal visible, in a painted storybook '
              'style with visible oil brush strokes, soft form shading and light from the top-left, friendly and charming. Keep '
              'the plain flat magenta background around it, no ground, no shadow, no text, nothing else.')
    raw = OUT / f'{d["id"]}.png'; restyle.run(up, prompt, raw, seed=seed, mp=.35, denoise=1.0, steps=4)
    GAME.mkdir(parents=True, exist_ok=True); cut(Image.open(raw)).save(GAME / f'{d["id"]}.png')

if __name__ == '__main__':
    items = json.loads((SRC / 'animals.json').read_text()); want = set(sys.argv[1:]); OUT.mkdir(parents=True, exist_ok=True)
    for d in items:
        if want and d['id'] not in want: continue
        try: paint(d)
        except Exception as e: print('failed', d['id'], e, flush=True)
    (GAME / 'animals.json').write_text(json.dumps(sorted(p.stem for p in GAME.glob('*.png'))))
