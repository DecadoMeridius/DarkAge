"""Paints the smithy behind the forging minigame (x_forge.js) with the painterly pipeline (ComfyUI, comfyui/restyle.py).

art/src/forge_guide.png is the minigame's own layout (hearth on the left, the anvil's face at the same height, tools on
the right wall), exported from the game at 3x. The model repaints it as a hand-painted smithy, keeping the layout so the
glowing piece still lies on the anvil. Tries go to art/out/forge_bg_<seed>.png; the chosen one is copied to
public/art/ui/forge_bg.png.

    python art/forge_bg.py [seed ...]          paint tries
    python art/forge_bg.py --pick <seed>       use that try in the game
"""
import shutil, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle

GUIDE = ROOT / 'art' / 'src' / 'forge_guide.png'
OUT = ROOT / 'art' / 'out'
GAME = ROOT / 'public' / 'art' / 'ui' / 'forge_bg.png'
PROMPT = ('Paint a beautiful, richly detailed hand-painted fantasy RPG illustration in the style of a painted storybook, '
          'with visible oil brush strokes, soft form shading and warm glowing light: the cosy inside of a medieval village '
          "blacksmith's forge at night. On the left a big stone forge hearth with a roaring orange fire and glowing coals, lighting "
          'the room. In the middle, in the foreground, a heavy dark iron anvil with a horn on its left, its flat top at about two '
          'thirds of the way down the picture, standing on a thick tree stump; the top of the anvil is empty. Behind it a warm '
          'stone and brick wall; on the right wall hanging tongs, hammers and horseshoes; a bucket of water and a barrel; a worn '
          'plank floor. Use the layout of the picture: hearth on the left, anvil in the middle, tools on the right. '
          'Flat straight-on side view like a 2D game background, no people, no text.')

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['--pick']:
        GAME.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(OUT / f'forge_bg_{a[1]}.png', GAME); print('->', GAME.relative_to(ROOT)); sys.exit()
    name = restyle.upload(GUIDE)   # ComfyUI loads images by their uploaded name
    for seed in [int(x) for x in a] or [7, 21, 42]:
        restyle.run(name, PROMPT, OUT / f'forge_bg_{seed}.png', seed=seed, mp=.6, denoise=1.0, steps=4)
