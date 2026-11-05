"""Paints the scenes behind the minigames with the painterly pipeline (ComfyUI, comfyui/restyle.py; see CLAUDE.md for the
server). Each scene has a rough layout drawn here (art/src/mg_<name>_guide.png) and a prompt; tries go to
art/out/mg_<name>_<seed>.png and the chosen one is copied to public/art/ui/mg_<name>.png. The forge has its own script
(art/forge_bg.py).

    python art/minigame_bg.py <scene> [seed ...]       paint tries (scenes: cook, reel, harpoon, haul)
    python art/minigame_bg.py --pick <scene> <seed>    use that try in the game
"""
import shutil, sys
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle

SRC, OUT, GAME = ROOT / 'art' / 'src', ROOT / 'art' / 'out', ROOT / 'public' / 'art' / 'ui'
STYLE = ('Paint a beautiful, richly detailed hand-painted fantasy RPG illustration in the style of a painted storybook, with '
         'visible oil brush strokes, soft form shading, rich warm colour and glowing light. ')
END = ' Use the layout of the picture. Flat straight-on view like a 2D game background, no people, no text, no frame.'

def g_cook(d, w, h):
    d.rectangle([0, 0, w, h], fill=(70, 46, 34)); d.rectangle([w * .25, h * .1, w * .75, h * .85], fill=(90, 80, 74))
    d.rectangle([w * .3, h * .45, w * .7, h * .85], fill=(30, 18, 12)); d.ellipse([w * .36, h * .62, w * .64, h * .82], fill=(240, 120, 40))
    d.ellipse([w * .38, h * .4, w * .62, h * .66], fill=(40, 40, 44)); d.rectangle([0, h * .85, w, h], fill=(110, 76, 46))
def g_reel(d, w, h):
    for y in range(h): d.line([0, y, w, y], fill=(int(60 - 40 * y / h), int(120 - 70 * y / h), int(150 - 70 * y / h)))
    d.rectangle([0, h * .88, w, h], fill=(110, 96, 70)); d.ellipse([w * .1, h * .82, w * .4, h * .95], fill=(70, 90, 60))
def g_harpoon(d, w, h):
    d.rectangle([0, 0, w, h * .18], fill=(150, 180, 210)); d.rectangle([0, h * .18, w, h], fill=(30, 80, 120))
    d.rectangle([0, h * .86, w, h], fill=(110, 76, 46)); d.rectangle([0, h * .8, w, h * .86], fill=(140, 100, 60))
def g_haul(d, w, h):
    d.rectangle([0, 0, w, h], fill=(30, 90, 120)); d.rectangle([0, 0, w, h * .22], fill=(130, 96, 60))
    for x in range(0, w, w // 8): d.line([x, 0, x, h * .22], fill=(90, 60, 36), width=3)
    d.rectangle([w * .3, 0, w * .36, h * .3], fill=(100, 70, 44))

def g_under(d, w, h):
    for y in range(h): d.line([0, y, w, y], fill=(int(70 - 50 * y / h), int(140 - 80 * y / h), int(160 - 80 * y / h)))
    d.rectangle([0, h * .86, w, h], fill=(110, 96, 70)); d.ellipse([w * .05, h * .75, w * .25, h * .95], fill=(60, 90, 60)); d.ellipse([w * .7, h * .7, w * .9, h * .95], fill=(60, 90, 60))

SCENES = {
    'under': ((1080, 450), g_under, STYLE + 'A wide view under the water of a clear lake: sunlight rays slanting down from the bright '
              'rippling surface along the top, green-blue water getting deeper towards the bottom, swaying water weeds and reeds on both '
              'sides, small bubbles, a sandy pebbly lake bed along the bottom with stones and a sunken log. Open water in the middle. No fish.'),
    'cook': ((1080, 450), g_cook, STYLE + 'A cosy farmhouse kitchen hearth at evening: a big stone fireplace in the middle with a '
             'crackling fire and glowing embers, a large black iron cooking pot hanging over the fire, steam rising from it; copper '
             'pans, dried herbs and garlic hanging on the wall either side, a wooden shelf with jars, a wooden worktop at the front.'),
    'reel': ((450, 1080), g_reel, STYLE + 'Under the water of a clear forest lake, seen from the side: sunlight rays slanting down '
             'from the bright surface at the top, green water getting deeper and darker towards the bottom, swaying water weeds, '
             'small bubbles, a sandy pebbly lake bed at the bottom with stones and a sunken log. No fish.'),
    'harpoon': ((1080, 450), g_harpoon, STYLE + 'The open sea seen from the bow of a small wooden fishing boat: a wide band of deep '
                'blue-green water with rolling waves and white foam filling most of the picture, a bright sky and the horizon at the '
                'top, the boat\'s worn wooden railing and a coil of rope along the bottom edge. No fish, no people.'),
    'haul': ((1080, 450), g_haul, STYLE + 'Looking down from a weathered wooden pier into clear sea water: the planks and a thick '
             'mooring post with a coiled rope across the top of the picture, deep blue-green sea water below with light rippling '
             'on it, seaweed and rocks faintly visible in the depths. No people.'),
}

def guide(name):
    (w, h), fn, _ = SCENES[name]; im = Image.new('RGB', (w, h)); fn(ImageDraw.Draw(im), w, h)
    p = SRC / f'mg_{name}_guide.png'; SRC.mkdir(parents=True, exist_ok=True); im.save(p); return p

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['--pick']:
        GAME.mkdir(parents=True, exist_ok=True); shutil.copy(OUT / f'mg_{a[1]}_{a[2]}.png', GAME / f'mg_{a[1]}.png'); print('->', a[1]); sys.exit()
    name = a[0]; name_up = restyle.upload(guide(name))
    for seed in [int(x) for x in a[1:]] or [3, 11]:
        restyle.run(name_up, SCENES[name][2] + END, OUT / f'mg_{name}_{seed}.png', seed=seed, mp=.6, denoise=1.0, steps=4)
