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
PROMPT = ('Repaint this rough game layout as a beautiful hand-painted fantasy RPG scene in the style of a painted storybook: '
          'the inside of a medieval village blacksmith\'s forge. On the left a stone forge hearth with a roaring orange fire and '
          'glowing coals; in the middle a heavy dark iron anvil with a pointed horn on the left, standing on a sturdy base, its '
          'flat top exactly where the grey bar is; behind it a warm brick and stone wall; on the right wall hanging tongs and '
          'hammers; a worn wooden floor. Warm firelight from the left, deep shadows, visible oil brush strokes, rich colour. '
          'Keep the layout exactly: the hearth, the anvil and its top surface stay where they are and the same size. '
          'Leave the top of the anvil and the space above it clear: nothing lies on the anvil. No people, no text. '
          'Flat straight-on view like a 2D game, no perspective tilt.')

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['--pick']:
        GAME.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(OUT / f'forge_bg_{a[1]}.png', GAME); print('->', GAME.relative_to(ROOT)); sys.exit()
    name = restyle.upload(GUIDE)   # ComfyUI loads images by their uploaded name
    for seed in [int(x) for x in a] or [7, 21, 42]:
        restyle.run(name, PROMPT, OUT / f'forge_bg_{seed}.png', seed=seed, mp=.6, denoise=.85, steps=8)
