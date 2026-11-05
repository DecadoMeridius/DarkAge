"""Paints every enemy and boss as one free painting for the painted styles (asked 2026-11-05: the creature paintings were
cut to the pixel outline, stair-stepped, cut off or mismatched between frames) with the painterly pipeline (ComfyUI,
comfyui/restyle.py; see CLAUDE.md for the server).

art/src/creatures.json and art/src/creatures/<key>.png are the game's enemies (key, name, art, boss, colour, flying) and
their pixel frames (exported from the game). Each frame, softened on a magenta card, is repainted as that creature by name,
keyed out and cropped to public/art/creatures/<key>.png (facing right); public/art/creatures/creatures.json lists them.
x_artfix.js builds the walk, wind-up and strike frames from it with motion, in the creature's own sprite box.

    python art/creature_paint.py [key ...]
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle
sys.path.insert(0, str(ROOT / 'art'))
from fish_paint import cut, keep_biggest
SRC, OUT, GAME = ROOT / 'art' / 'src', ROOT / 'art' / 'out' / 'creatures', ROOT / 'public' / 'art' / 'creatures'
KEY = (255, 0, 255)
# what each body type is, so the painting keeps the creature's own build (free paintings added wings and tails everywhere)
BODY = {'slime': 'a round jelly slime blob with no limbs', 'bird': 'a bird', 'wolf': 'a four-legged wolf with no wings', 'boar': 'a four-legged wild boar',
        'goblin': 'a small goblin warrior', 'crab': 'a big crab', 'ghost': 'a floating ghost with no legs', 'yeti': 'a big furry yeti standing on two legs',
        'imp': 'a small horned imp standing on two legs, no wings', 'golem': 'a hulking golem made of rock', 'bat': 'a bat with spread wings', 'dragon': 'a four-legged winged dragon',
        'lich': 'a robed skeletal lich', 'warg': 'a huge four-legged warg wolf, no wings', 'bear': 'a four-legged bear', 'troll': 'a hulking troll with a club',
        'griffin': 'a griffin', 'icewarg': 'a huge four-legged ice wolf, no wings', 'mammoth': 'a woolly mammoth', 'wisp': 'a small floating glowing wisp of light with no body',
        'shardling': 'a golem made of ice crystals, no wings, no tail', 'hound': 'a four-legged hound, no wings', 'salamander': 'a four-legged salamander lizard, no wings',
        'elemental': 'a living flame or element creature with no wings, no limbs, no weapon', 'basalt': 'a golem made of dark basalt stone', 'lobster': 'a giant lobster',
        'jelly': 'a floating jellyfish', 'harpy': 'a harpy, a winged woman with bird feet', 'tyrant': 'a hulking armoured stone tyrant standing on two legs, no wings',
        'queen': 'a regal sorceress queen in a long gown, no wings, no tail', 'drake': 'a four-legged drake, a small dragon', 'captain': 'a ghostly pirate captain',
        'forgeking': 'a towering iron forge-golem king with a furnace in its chest and a hammer, no wings', 'glacierheart': 'a giant ice golem with a glowing crystal heart, no wings',
        'ashmother': 'a huge ash-grey monster mother', 'kraken': 'a kraken with tentacles', 'rat': 'a rat', 'bigrat': 'a giant rat', 'roach': 'a giant cockroach',
        'ratking': 'a huge rat king wearing a crown', 'ogre': 'a big ogre with a club'}

def paint(d, seed=7):
    g = Image.new('RGB', (640, 640), KEY); ic = Image.open(SRC / 'creatures' / f'{d["id"]}.png').convert('RGBA')
    ic.thumbnail((460, 460), Image.NEAREST); ic = ic.filter(ImageFilter.GaussianBlur(3)); g.paste(ic, ((640 - ic.width) // 2, (640 - ic.height) // 2), ic)
    gp = SRC / 'creature_guide.png'; g.save(gp); up = restyle.upload(gp)
    body = BODY.get(d['art'], 'a monster')
    prompt = (f'Repaint this rough shape as a beautiful hand-painted fantasy RPG illustration of the {d["n"]}: {body}' + (', a boss' if d['boss'] else '') +
              '. Follow the picture closely: the same body shape, pose, limbs and colours; add nothing it does not have. One creature, '
              'seen from the side and slightly from the front, facing right, the whole creature visible, in a painted storybook style '
              'with visible oil brush strokes, soft form shading and light from the top-left. Keep the plain flat magenta background '
              'around it, no ground, no shadow, no light rays, no text, nothing else.')
    raw = OUT / f'{d["id"]}.png'; restyle.run(up, prompt, raw, seed=seed, mp=.35, denoise=.9, steps=8)
    GAME.mkdir(parents=True, exist_ok=True); cut(Image.open(raw)).save(GAME / f'{d["id"]}.png')

if __name__ == '__main__':
    items = json.loads((SRC / 'creatures.json').read_text()); want = set(sys.argv[1:]); OUT.mkdir(parents=True, exist_ok=True)
    for d in items:
        if want and d['id'] not in want: continue
        if not want and (GAME / f'{d["id"]}.png').exists(): continue
        try: paint(d)
        except Exception as e: print('failed', d['id'], e, flush=True)
    (GAME / 'creatures.json').write_text(json.dumps(sorted(p.stem for p in GAME.glob('*.png'))))
