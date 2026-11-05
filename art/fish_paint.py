"""Paints a side-view swimming sprite for every fish (the underwater fishing game, x_fishgame.js) with the painterly
pipeline (ComfyUI, comfyui/restyle.py; see CLAUDE.md for the server).

art/src/fish_list.json lists the fish (id, name, shape, colour, second colour, price, legendary), exported from the game.
For each, a guide silhouette in its colours and body shape (fish_round, fish_long, fish_flat or plain fish), facing right on a
magenta card, is repainted as that species; the magenta is keyed out and the fish cropped to
public/art/fish/<id>.png (about 256 px wide). Tries are kept in art/out/fish/.

    python art/fish_paint.py [id ...]        paint these fish (all when none are named)
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle
sys.path.insert(0, str(ROOT / 'art'))
import magenta

OUT, GAME, SRC = ROOT / 'art' / 'out' / 'fish', ROOT / 'public' / 'art' / 'fish', ROOT / 'art' / 'src'
KEY = (255, 0, 255)
hexc = lambda h: tuple(int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)) if h else (120, 140, 150)

def guide(sh, c1, c2, W=768, H=384, kind='fish'):
    im = Image.new('RGB', (W, H), KEY); d = ImageDraw.Draw(im); cx, cy = W * .46, H * .5
    if kind == 'ray':   # a flat diamond with a whip tail, seen from the side as it glides
        d.polygon([(cx + W * .22, cy), (cx, cy - H * .16), (cx - W * .22, cy), (cx, cy + H * .1)], fill=c1); d.line([(cx - W * .2, cy), (cx - W * .44, cy + H * .05)], fill=c2, width=6); return im
    if kind == 'octopus':   # a round mantle and eight trailing arms
        d.ellipse([cx, cy - H * .3, cx + W * .22, cy + H * .1], fill=c1)
        for i in range(8): y = cy - H * .05 + i * H * .04; d.line([(cx + W * .04, y), (cx - W * .3, y + (i - 4) * H * .03)], fill=c2, width=14)
        return im
    bl, bh = {'fish_long': (.36, .1), 'fish_flat': (.26, .3), 'fish_round': (.24, .22)}.get(sh, (.3, .16))
    bl, bh = W * bl, H * bh * 1.4
    d.ellipse([cx - bl, cy - bh, cx + bl, cy + bh], fill=c1)                                          # body
    d.polygon([(cx - bl * .85, cy), (cx - bl * 1.45, cy - bh * .9), (cx - bl * 1.3, cy), (cx - bl * 1.45, cy + bh * .9)], fill=c2)   # tail
    d.polygon([(cx - bl * .2, cy - bh * .9), (cx + bl * .25, cy - bh * 1.5), (cx + bl * .35, cy - bh * .8)], fill=c2)                # dorsal fin
    d.ellipse([cx - bl * .7, cy, cx + bl * .6, cy + bh * .9], fill=tuple(min(255, v + 60) for v in c1))                                # pale belly
    d.ellipse([cx + bl * .62, cy - bh * .35, cx + bl * .76, cy - bh * .1], fill=(20, 20, 20))                                          # eye
    return im

def keep_biggest(im):
    W, H = im.size; k = 4; sm = im.getchannel('A').resize((W // k, H // k)); px = sm.load(); w, h = sm.size
    seen = [[0] * w for _ in range(h)]; best, comps = None, []
    for y in range(h):
        for x in range(w):
            if px[x, y] > 6 and not seen[y][x]:
                stack, comp = [(x, y)], []; seen[y][x] = 1
                while stack:
                    cx, cy = stack.pop(); comp.append((cx, cy))
                    for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and px[nx, ny] > 6: seen[ny][nx] = 1; stack.append((nx, ny))
                comps.append(comp)
    if len(comps) < 2: return
    best = max(comps, key=len); keep = set(best); op = im.load()
    for comp in comps:
        if comp is best: continue
        for (x, y) in comp:
            for yy in range(y * k, min(H, y * k + k)):
                for xx in range(x * k, min(W, x * k + k)): op[xx, yy] = (0, 0, 0, 0)

def cut(src):
    im = src.convert('RGB'); W, H = im.size; a = magenta.alpha(im)
    out = im.convert('RGBA'); out.putalpha(a)
    # pull magenta spill at the edge back to neutral
    op = out.load()
    for y in range(H):
        for x in range(W):
            r, g, b, al = op[x, y]
            if 0 < al < 255 or (min(r, b) - g) > 20: op[x, y] = (min(r, g + 30), g, min(b, g + 30), al)
    keep_biggest(out)   # stray bits (a painted moon, a fleck) go; only the animal stays
    bb = out.getbbox(); out = out.crop(bb) if bb else out
    w = 256; return out.resize((w, max(8, int(out.height * w / out.width))), Image.LANCZOS)

def paint(f, seed=5):
    fid, name, sh, c1, c2, p, legend = f
    kind = 'ray' if fid.endswith('ray') or fid == 'manta' else 'octopus' if fid == 'octopus' else 'fish'
    g = guide(sh, hexc(c1), hexc(c2) if c2 else tuple(max(0, v - 50) for v in hexc(c1)), kind=kind)
    what = {'ray': 'a single ' + name + ', a ray, gliding to the right seen from the side with its wide wings and long thin tail',
            'octopus': 'a single octopus swimming to the right seen from the side, its round head in front and eight curling arms trailing behind'}.get(kind)
    gp = SRC / 'fish_guide.png'; g.save(gp); up = restyle.upload(gp)
    prompt = (f'Repaint this rough shape as a beautiful hand-painted fantasy RPG illustration of ' + (what or f'a {name}'
              + (' (a legendary, magical fish)' if legend else '') + ', a single fish seen exactly from the side, swimming to the right') +
              ', the whole animal visible, '
              'in a painted storybook style with visible oil brush strokes, soft form shading and light from the top-left, '
              'natural colours for this kind of fish. Keep the plain flat magenta background around it, no water, no shadow, '
              'no bubbles, no text, nothing else.')
    raw = OUT / f'{fid}.png'; restyle.run(up, prompt, raw, seed=seed, mp=.3, denoise=1.0, steps=4)
    GAME.mkdir(parents=True, exist_ok=True); im = cut(Image.open(raw))
    if kind == 'octopus': im = im.transpose(Image.FLIP_LEFT_RIGHT)   # painted head-left; the game wants every animal facing right
    im.save(GAME / f'{fid}.png')

if __name__ == '__main__':
    fish = json.loads((SRC / 'fish_list.json').read_text())
    want = set(sys.argv[1:]); OUT.mkdir(parents=True, exist_ok=True)
    for f in fish:
        if want and f[0] not in want: continue
        try: paint(f)
        except Exception as e: print('failed', f[0], e)
    # the list the game loads (public/js/x_fishgame.js), so it never asks for a fish that has no painting
    (GAME / 'fish.json').write_text(json.dumps(sorted(p.stem for p in GAME.glob('*.png'))))
