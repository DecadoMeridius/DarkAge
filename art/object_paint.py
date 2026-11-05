"""Paints single atlas sprites again for the painted styles (art playtest 4, asked 2026-11-05) with the painterly pipeline
(ComfyUI, comfyui/restyle.py; see CLAUDE.md for the server): sprites whose Painterly frame was still pixel art, wrong or
missing (lamp posts, rugs, the sailboat, sprinklers, the barn, coop and stable upgrade levels, the storage shed).

art/src/objects/<name>.png are the pixel sprites (exported from the game). Each is painted from its layout by the
description in OBJ (buildings at a lower strength so the door stays where it is), keyed out and written to
public/art/objects/<name>.png; public/art/objects/objects.json lists them. x_artfix.js draws them in the sprite's own box.

    python art/object_paint.py [name ...]
    python art/object_paint.py --winter <name ...>     the snowy look of painted buildings, from their summer painting
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle
sys.path.insert(0, str(ROOT / 'art'))
import magenta
sys.path.insert(0, str(ROOT / 'art'))
from fish_paint import cut, keep_biggest
sys.path.insert(0, str(ROOT / 'art'))
from ui_finish import despill
SRC, OUT, GAME = ROOT / 'art' / 'src' / 'objects', ROOT / 'art' / 'out' / 'objects', ROOT / 'public' / 'art' / 'objects'
KEY = (255, 0, 255)
BARN = 'a red wooden farm barn with a gambrel roof and big double doors'
COOP = 'a small wooden chicken coop with a little door and a ramp'
STABLE = 'a wooden horse stable with stall doors'
WIN = ', with snow on its roof'
FREER = {'bld_stable_6x5', 'bld_stable_6x5_l2', 'bld_stable_6x5_l3', 'bld_cabin_4x3'}   # their pixel layout is a flat box: let the painting redesign them

def objcut(src):
    im = src.convert('RGB'); W, H = im.size; a = magenta.alpha(im); ap = a.load()
    seen = set(); stack = [(x, y) for x in range(W) for y in (0, H - 1)] + [(x, y) for y in range(H) for x in (0, W - 1)]
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < W and 0 <= y < H) or ap[x, y] < 10: continue
        seen.add((x, y)); ap[x, y] = 0; stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    out = im.convert('RGBA'); out.putalpha(a); bb = out.getbbox(); out = out.crop(bb) if bb else out
    w = 384 if max(out.size) > 384 else out.width; return out.resize((w, max(8, int(out.height * w / out.width))), Image.LANCZOS)

def depink(im):
    px = im.load(); W, H = im.size   # a pink glow left from the magenta card (lamp light, rims)
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a and r - g > 25 and b >= g - 6 and r > 170: px[x, y] = (r, g, b, 0)
    return im
OBJ = {
    'lantern_off': 'a tall black wrought-iron street lamp post with a glass lantern on top, switched off in daylight: dark clear glass, no flame, no light, no glow',
    'furn_lamp': 'a small brass table oil lamp with a glass chimney',
    'dec_rug_red': 'a rectangular red woven rug with a patterned border, seen from directly above, lying flat',
    'dec_rug_blue': 'a rectangular blue woven rug with a patterned border, seen from directly above, lying flat',
    'dec_rug_green': 'a rectangular green woven rug with a patterned border, seen from directly above, lying flat',
    'dec_rug_purple': 'a long deep crimson and gold woven carpet with a rich border, seen from directly above, lying flat',   # purple sits too close to the magenta card
    'dec_rug_small': 'a small oval braided rag rug, seen from directly above, lying flat',
    'ferry': 'a small wooden sailing boat with a white sail and a mast, floating, seen from the side',
    'sprinkler': 'a small iron farm sprinkler with a nozzle on a short pipe in the ground',
    'qsprinkler': 'a small golden farm sprinkler with a rotating head on a short pipe in the ground',
    'isprinkler': 'a small glowing blue mythril farm sprinkler with a rotating head on a short pipe in the ground',
    'bld_barn_7x6_l2': BARN + ', upgraded: glass windows and white painted trim',
    'bld_barn_7x6_l3': BARN + ', upgraded further: glass windows, white trim, a stone footing and a little cupola on the roof',
    'bld_barn_7x6_l4': BARN + ', fully upgraded: glass windows, white trim, a stone footing, a cupola with a weathervane, lanterns by the door and flower boxes',
    'bld_coop_6x5_l3': COOP + ', upgraded: a stone footing, a window and a little cupola',
    'bld_coop_6x5_l4': COOP + ', fully upgraded: a stone footing, windows, a cupola with a weathervane, a lantern and flower boxes',
    'bld_stable_6x5': STABLE + ', simple, both stall doors fully visible',
    'bld_stable_6x5_l2': STABLE + ', upgraded: windows and painted trim, both stall doors fully visible',
    'bld_stable_6x5_l3': STABLE + ', upgraded further: windows, painted trim, a stone footing and a cupola, both stall doors fully visible',
    'bld_cabin_4x3': 'a small wooden storage shed with a slanted shingle roof and a plank door, in summer with no snow',
    'bld_barn_7x6_w': BARN + WIN, 'bld_barn_7x6_l2_w': BARN + ', with glass windows and white trim' + WIN,
    'bld_barn_7x6_l3_w': BARN + ', with windows, white trim, a stone footing and a cupola' + WIN,
    'bld_barn_7x6_l4_w': BARN + ', with windows, white trim, a stone footing, a cupola with a weathervane and lanterns' + WIN,
}

# the Painterly atlas's building prompt (art/style_free.py FREE with BLD and FLAT), copied so this script doesn't load the atlas builder
ATLAS_FREE = ('Transform these pixel-art game sprites into beautiful, richly detailed hand-painted fantasy RPG art in the style of a painted '
              'storybook: visible oil brush strokes, soft form shading, rich colour, the same three-quarter top-down view. The pixel art is only '
              'a rough guide to what each object is, how big it is and where it stands: redesign it freely with more detail and charm, but keep '
              'every object in its own place and about its size. Keep doors and windows about where they are. Nothing may stay pixel art. Do not '
              'add new objects. The background stays plain flat magenta: no shadows, no light rays, no glow, no ground. Paint everything flat and '
              'straight-on, in exactly the same view as the pixel art: fronts facing us, tops seen from above, like a classic 2D top-down RPG. '
              'No perspective, no isometric or turned 3D view.')

def paint_building(name, seed=7):
    """a building in the Painterly atlas's own way (style_free.py: the pixel sprite at 2x on a roomy magenta card, its FREE
    prompt), so it matches the village buildings: an earlier, freer prompt came out glossy and lit, in another style"""
    src = Image.open(SRC / f'{name}.png').convert('RGBA'); px0 = src.resize((src.width // max(1, src.width // 224 if src.width > 448 else 1), src.height // max(1, src.width // 224 if src.width > 448 else 1)), Image.NEAREST)
    big = px0.resize((px0.width * 2, px0.height * 2), Image.NEAREST); pad = int(max(big.size) * .35)
    card = Image.new('RGB', (big.width + 2 * pad, big.height + 2 * pad), KEY); card.paste(big, (pad, pad), big)
    gp = ROOT / 'art' / 'src' / f'guide_{name}.png'; card.save(gp); up = restyle.upload(gp)
    prompt = ATLAS_FREE + f' The sprite is {OBJ[name]}.'
    raw = OUT / f'{name}.png'; OUT.mkdir(parents=True, exist_ok=True)
    restyle.run(up, prompt, raw, seed=seed, mp=card.width * card.height / 1e6, denoise=1.0, steps=4)
    GAME.mkdir(parents=True, exist_ok=True); depink(despill(objcut(Image.open(raw)))).save(GAME / f'{name}.png')

def paint(name, seed=7):
    if name.startswith('bld_'): return paint_building(name, seed)
    src = Image.open(SRC / f'{name}.png').convert('RGBA'); W, H = 768, 768
    g = Image.new('RGB', (W, H), KEY); ic = src.copy(); ic.thumbnail((620, 620), Image.NEAREST); ic = ic.filter(ImageFilter.GaussianBlur(2))
    if name in FREER:   # only the silhouette, in plain wood and roof colours: nothing to copy but the size and shape
        a = ic.getchannel('A'); sil = Image.new('RGBA', ic.size, (120, 80, 50, 255)); top = Image.new('RGBA', (ic.width, ic.height * 2 // 5), (70, 80, 110, 255))
        sil.alpha_composite(top, (0, 0)); sil.putalpha(a); ic = sil
    g.paste(ic, ((W - ic.width) // 2, (H - ic.height) // 2), ic); gp = ROOT / 'art' / 'src' / f'guide_{name}.png'; g.save(gp); up = restyle.upload(gp)
    bld = name.startswith('bld_')
    prompt = (f'Repaint this rough picture as a beautiful hand-painted fantasy RPG game sprite of {OBJ[name]}, in a painted storybook style '
              'with visible oil brush strokes, soft form shading and light from the top-left, rich warm colour. '
              + ('Keep the layout of the picture: the same outline, the doors, windows and walls where they are. Paint it flat and straight-on, '
                 'exactly in the same view as the picture: the front wall facing us and the roof seen from above, like a classic 2D top-down RPG. '
                 'No perspective, no isometric or turned 3D view. ' if bld else
                 'One object, the whole of it visible, in the same view as the picture. ') +
              'Keep the plain flat magenta background around it, no ground, no shadow, no text, nothing else.')
    raw = OUT / f'{name}.png'; OUT.mkdir(parents=True, exist_ok=True)
    restyle.run(up, prompt, raw, seed=seed, mp=.5 if bld else .3, denoise=(1.0 if name in FREER else .72) if bld else .95, steps=10)
    GAME.mkdir(parents=True, exist_ok=True); depink(despill(objcut(Image.open(raw)))).save(GAME / f'{name}.png')

def winter(name, seed=7):
    """the winter look (<name>_w) as an edit of the painted summer building, so it stays the same building with snow added"""
    raw = OUT / f'{name}.png'; src = Image.open(raw).convert('RGB')
    gp = ROOT / 'art' / 'src' / f'winter_{name}.png'; src.save(gp); up = restyle.upload(gp)   # its own name: another job may be uploading a guide
    prompt = ('Keep this painting exactly the same: the same building, shape, colours, doors, windows and brush strokes. Only add winter: '
              'the whole roof covered in a thick soft blanket of white snow with rounded drifts hanging over its edges, snow on the window ledges, on the door frame and piled at the foot of the walls, in the same hand-painted style. '
              'Keep the plain flat magenta background around it, no snow on the background, no ground, no sky.')
    out = OUT / f'{name}_w.png'; restyle.run(up, prompt, out, seed=seed, mp=.5, denoise=.74, steps=10)
    GAME.mkdir(parents=True, exist_ok=True); depink(despill(objcut(Image.open(out)))).save(GAME / f'{name}_w.png')

# upgrade levels and fixes as edits of the atlas's own painting (asked 2026-11-05: the levels looked the same, and freely
# painted buildings came out in another, glossier style). Each edit keeps the source painting's exact size; ALIGN (written
# to public/art/objects/aligned.json) tells x_artfix.js which atlas frame's size and position to draw it with.
EDITS = [  # (name, source: an atlas building or an earlier edit, frame it lines up with, the change)
    ('bld_barn_7x6_l2', 'bld_barn_7x6', 'bld_barn_7x6', 'add a row of small glass windows with white frames on the red board wall only, below the roof, and white painted trim along the wall corners; the dark roof stays exactly as it is, with no windows, hatches or openings on the roof'),
    ('bld_barn_7x6_l3', 'bld_barn_7x6_l2', 'bld_barn_7x6', 'add a grey stone footing along the bottom of the walls and one small white wooden cupola on top of the roof ridge; no windows on the roof'),
    ('bld_barn_7x6_l4', 'bld_barn_7x6_l3', 'bld_barn_7x6', 'add a little iron weathervane on top of the cupola, a lit lantern on each side of the big doors and red flower boxes under the wall windows; the roof stays exactly as it is, plain dark shingles'),
    ('bld_coop_6x5_l3', 'bld_coop_6x5_l2', 'bld_coop_6x5_l2', 'add a grey stone footing along the bottom of the walls and a small wooden cupola on the roof'),
    ('bld_coop_6x5_l4', 'bld_coop_6x5_l3', 'bld_coop_6x5_l2', 'add a little weathervane on the cupola, a lantern beside the door and flower boxes under the windows'),
    ('bld_stable_6x5', 'bld_stable_6x5', 'bld_stable_6x5', 'make it read as a horse stable: complete the cut-off stall door on the right, add a roof ridge and dark roof trim; the roof stays plain slate with no windows, vents or openings on it'),
    ('bld_stable_6x5_l2', 'bld_stable_6x5', 'bld_stable_6x5', 'add small glass windows on the wooden wall only, between the stall doors and below the roof, and painted white trim around the stall doors; nothing on the roof'),
    ('bld_stable_6x5_l3', 'bld_stable_6x5_l2', 'bld_stable_6x5', 'add a grey stone footing along the bottom of the walls and an iron lantern beside each of the two outer stall doors; the roof stays plain slate with no windows, dormers or openings'),
    ('bld_cabin_4x3', 'bld_cabin_4x3', 'bld_cabin_4x3', 'remove all the snow: a plain dark grey shingle roof as in summer, no snow anywhere'),
]
EDITED = {e[0]: e for e in EDITS}

def keep_shape(fin, src):
    """An edit keeps its building's outline, so it is at least as solid as the painting it came from: the shadow key could
    flood in along dark grout and window edges and cut holes into roofs (asked 2026-11-05: barn level 4). What it fills takes
    the source painting's colour (the same building), blended by how much was filled."""
    src = src.convert('RGBA').resize(fin.size, Image.LANCZOS); fin = fin.copy(); fp, sp = fin.load(), src.load()
    for y in range(fin.height):
        for x in range(fin.width):
            f, s = fp[x, y], sp[x, y]
            if s[3] > f[3]:
                t = (s[3] - f[3]) / 255; fp[x, y] = tuple(round(f[i] * (1 - t) + s[i] * t) for i in range(3)) + (s[3],)
    return fin

def finish(raw, src_png, W=None):
    """the edit's raw output -> the finished painting at its source's size (keyed, despilled, solid where the source is)"""
    src = Image.open(src_png).convert('RGBA'); W, H = src.size
    s = 1024 / max(W, H); bw, bh = round(W * s), round(H * s)
    ed = Image.open(raw).convert('RGB').resize((bw + 64, bh + 64), Image.LANCZOS).crop((32, 32, 32 + bw, 32 + bh))
    a = magenta.alpha(ed); fin = ed.convert('RGBA'); fin.putalpha(a)
    return keep_shape(depink(despill(fin)).resize((W, H), Image.LANCZOS), src)

def src_of(n):
    """the painting an aligned edit was made from"""
    if n.endswith('_w'):
        b = n[:-2]; return GAME / f'{b}.png' if b in EDITED else ROOT / 'art' / 'src' / 'summer' / f'{b}.png'
    e = EDITED[n]; return GAME / f'{e[1]}.png' if e[1] in EDITED and e[1] != n else ROOT / 'art' / 'src' / 'summer' / f'{e[1]}.png'

def edit_aligned(src_png, out_name, instr, seed=7):
    src = Image.open(src_png).convert('RGBA'); W, H = src.size
    s = 1024 / max(W, H); big = src.resize((round(W * s), round(H * s)), Image.LANCZOS)
    card = Image.new('RGB', (big.width + 64, big.height + 64), KEY); card.paste(big, (32, 32), big)
    gp = ROOT / 'art' / 'src' / f'edit_{out_name}.png'; card.save(gp); up = restyle.upload(gp)
    prompt = ('Keep this painting exactly the same: the same building, shape, size, view, colours and brush strokes. Only change this: '
              + instr + ', painted in exactly the same hand-painted style. Keep the plain flat magenta background around it.')
    out = OUT / f'{out_name}.png'; OUT.mkdir(parents=True, exist_ok=True); restyle.run(up, prompt, out, seed=seed, mp=.6, denoise=.72, steps=10)
    ed = Image.open(out).convert('RGB').resize(card.size, Image.LANCZOS).crop((32, 32, 32 + big.width, 32 + big.height))
    a = magenta.alpha(ed); fin = ed.convert('RGBA'); fin.putalpha(a); fin = keep_shape(depink(despill(fin)).resize((W, H), Image.LANCZOS), src)
    GAME.mkdir(parents=True, exist_ok=True); fin.save(GAME / f'{out_name}.png'); return GAME / f'{out_name}.png'

def write_align():
    al = {n: frame for n, _, frame, _ in EDITS}
    for p in GAME.glob('bld_*_w.png'):
        base = p.stem[:-2]; al[p.stem] = al.get(base, base)
    (GAME / 'aligned.json').write_text(json.dumps(al, indent=0))
    (GAME / 'objects.json').write_text(json.dumps(sorted(p.stem for p in GAME.glob('*.png'))))

def winter_aligned(name, seed=7):
    """<name>_w for any building, as a snow edit of its Painterly summer painting (art/src/summer/<name>.png, exported from the
    game), kept at exactly the summer painting's size so it lines up with it (separately painted winter looks were another
    size and shape: buildings jumped and changed shape between seasons, asked 2026-11-05)"""
    sp = GAME / f'{name}.png' if name in EDITED else ROOT / 'art' / 'src' / 'summer' / f'{name}.png'
    src = Image.open(sp).convert('RGBA'); W, H = src.size
    s = 1024 / max(W, H); big = src.resize((round(W * s), round(H * s)), Image.LANCZOS)
    card = Image.new('RGB', (big.width + 64, big.height + 64), KEY); card.paste(big, (32, 32), big)
    gp = ROOT / 'art' / 'src' / f'winter_{name}.png'; card.save(gp); up = restyle.upload(gp)
    prompt = ('Keep this painting exactly the same: the same building, shape, size, colours, doors, windows and brush strokes. Only add winter: '
              'the whole roof covered in a thick soft blanket of white snow with rounded drifts hanging over its edges, snow on the window ledges '
              'and on the door frame, in the same hand-painted style. Keep the plain flat magenta background around it, no snow on the background.')
    out = OUT / f'{name}_w.png'; OUT.mkdir(parents=True, exist_ok=True); restyle.run(up, prompt, out, seed=seed, mp=.6, denoise=.72, steps=10)
    ed = Image.open(out).convert('RGB').resize(card.size, Image.LANCZOS).crop((32, 32, 32 + big.width, 32 + big.height))
    a = magenta.alpha(ed); fin = ed.convert('RGBA'); fin.putalpha(a); fin = keep_shape(depink(despill(fin)).resize((W, H), Image.LANCZOS), src)
    GAME.mkdir(parents=True, exist_ok=True); fin.save(GAME / f'{name}_w.png')

if __name__ == '__main__':
    if sys.argv[1:2] == ['--fill']:   # keep_shape on every aligned painting already made (edits in chain order, then winters)
        for n in [e[0] for e in EDITS] + sorted(p.stem for p in GAME.glob('bld_*_w.png')):
            if n == 'bld_cabin_4x3': continue   # made from art/desnow.py's snow-free copy
            if (OUT / f'{n}.png').exists() and src_of(n).exists(): finish(OUT / f'{n}.png', src_of(n)).save(GAME / f'{n}.png')
        sys.exit()
    if sys.argv[1:2] == ['--edits']:
        for n, src, frame, instr in EDITS:
            if sys.argv[2:] and n not in sys.argv[2:]: continue
            sp = GAME / f'{src}.png' if src in EDITED and src != n else ROOT / 'art' / 'src' / 'summer' / f'{src}.png'
            if n == 'bld_cabin_4x3':   # its atlas painting has snow and the model keeps it: art/desnow.py first, then tidy the roof
                import desnow; ns = ROOT / 'art' / 'out' / 'cabin_ns.png'; desnow.desnow(Image.open(sp)).save(ns); sp = ns
                instr = 'tidy the roof into clean, even rows of dark grey wooden shingles with no seams, and give the stone chimney on the left a solid stone face, summer'
            try: edit_aligned(sp, n, instr, seed=11 if n == 'bld_cabin_4x3' else 7)
            except Exception as e: print('failed', n, e, flush=True)
        write_align(); sys.exit()
    if sys.argv[1:2] == ['--winter-all']:   # every building with a winter look but the snowy Frostmere and the snowless Emberwaste
        names = sys.argv[2:] or sorted(p.stem for p in (ROOT / 'art' / 'src' / 'summer').glob('*.png') if not p.stem.startswith(('bld_fm_', 'bld_ew_', 'bld_dg_fm', 'bld_dg_ew')))
        for n in names:
            if len(sys.argv) <= 2 and (GAME / f'{n}_w.png').exists() and (OUT / f'{n}_w.png').stat().st_mtime > (ROOT / 'art' / 'src' / 'summer' / f'{n}.png').stat().st_mtime: continue
            try: winter_aligned(n)
            except Exception as e: print('failed', n, e, flush=True)
        write_align(); sys.exit()
    if sys.argv[1:2] == ['--winter']:
        for n in sys.argv[2:]:
            try: winter(n)
            except Exception as e: print('failed', n, e, flush=True)
        (GAME / 'objects.json').write_text(json.dumps(sorted(p.stem for p in GAME.glob('*.png')))); sys.exit()
    want = sys.argv[1:] or list(OBJ)
    for n in want:
        try: paint(n)
        except Exception as e: print('failed', n, e, flush=True)
    (GAME / 'objects.json').write_text(json.dumps(sorted(p.stem for p in GAME.glob('*.png'))))
