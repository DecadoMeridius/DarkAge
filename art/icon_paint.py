"""Paints an item icon for every item (Painterly style) with the painterly pipeline (ComfyUI, comfyui/restyle.py; see
CLAUDE.md for the server), asked 2026-11-05: most icons were recoloured pixel templates, many sharing a wrong shape.

art/src/items.json and art/src/icons/<id>.png are the game's items and their pixel icons (exported from the game). Each
icon is put on a magenta card as a hint of colour and shape, painted as that item by name (a prompt by its type), keyed
out and fitted into a 96 px cell (art/out/icons/<id>.png). `--pack` packs every painted icon into
public/art/icons/icons.png + icons.json ({id: [x, y]}), which x_icons.js uses in painted styles. Already painted items are
skipped, so a run can be stopped and resumed. Items the testers found good (SKIP_*) keep their icons.

    python art/icon_paint.py [id ...]     paint (all when none are named)
    python art/icon_paint.py --pack       pack the atlas
"""
import json, math, sys
from pathlib import Path
from PIL import Image, ImageFilter
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle
sys.path.insert(0, str(ROOT / 'art'))
import magenta

SRC, OUT, GAME = ROOT / 'art' / 'src', ROOT / 'art' / 'out' / 'icons', ROOT / 'public' / 'art' / 'icons'
KEY = (255, 0, 255); CELL = 96
SKIP_T = {'ring', 'tool', 'gem'}
SKIP_ID = {'shark', 'swordfish', 'tuna', 'manta', 'sturgeon', 'mud_crab', 'prawn', 'crayfish', 'rock_lobster', 'river_snail'}
PEARLS = {'pearl', 'moonpearl', 'frost_pearl'}
# items whose old icon is the wrong shape: an exact description, and no guide picture (it misled the model)
HINT = {'tide_valve': 'a heavy brass pipe valve with a round iron handwheel and a sea-green patina, with no letters or writing anywhere', 'lucky_lunch': 'a small woven picnic basket holding a sandwich, an apple and a four-leaf clover, with no letters, label or writing anywhere', 'fang': 'a single large sharp white animal fang', 'imp_horn': 'a single curved red imp horn', 'mammoth_tusk': 'a long curved ivory mammoth tusk',
        'dragon_tooth': 'a huge ancient dragon tooth', 'fiber': 'a small bundle of plant fibre twine tied with a knot', 'gear': 'a single iron cogwheel gear',
        'cobalt_gear': 'a single blue cobalt metal cogwheel gear', 'rivets': 'a small pile of iron rivets', 'grip': 'a leather-wrapped sword grip',
        'haft': 'a wooden tool haft', 'bowstring': 'a coiled bowstring', 'straps': 'a couple of leather straps with buckles', 'padding': 'a folded quilted cloth padding',
        'hollow_crown': 'an ancient tarnished dark crown', 'rime_crown': 'an icy crown made of frost crystals', 'sugar': 'a small cloth sack of white sugar',
        'salt': 'a small wooden bowl of coarse white salt', 'flour': 'a small cloth sack of flour', 'butter': 'a block of yellow butter on a small wooden board',
        'sea_urchin': 'a round purple spiky sea urchin', 'clam': 'a closed clam shell', 'nautilus': 'a spiral nautilus shell', 'pearl_oyster': 'an open oyster with a pearl',
        'coral': 'a branch of pink coral', 'star_coral': 'a branch of pale star coral', 'ember_coral': 'a branch of glowing orange coral', 'kelp': 'a strand of green kelp seaweed',
        'moon_kelp': 'a strand of pale glowing kelp', 'rat_tail': 'a long pink rat tail', 'anglers_cup': 'a golden trophy cup with two handles', 'captain_compass': 'an old brass ship compass',
        'drowned_crest': 'a barnacled bronze crest', 'pearl': 'a single white pearl', 'moonpearl': 'a single glowing silvery pearl', 'frost_pearl': 'a single icy pale blue pearl',
        'trail_bread': 'a small rustic loaf of travel bread wrapped in cloth', 'cheese': 'a wheel of yellow cheese with a slice cut out', 'goat_cheese': 'a small wheel of white goat cheese',
        'treasure_map': 'an old rolled-up treasure map', 'gear_box': 'a wooden box of gears'}
SHAPE_HINT = {'jar': 'in a glass jar with a cloth lid', 'bottle': 'in a corked glass bottle', 'wheel': 'a wheel of cheese', 'cloth': 'a folded bolt of fabric'}

def what(d):
    n, t, tier = d['n'], d['t'], d['tier']
    if d['id'] in HINT: return HINT[d['id']]
    if t == 'seed': return f'a small paper seed packet with a painted picture of {n.replace(" Seeds", "").replace(" Bulbs", "").lower()} on its front'
    if t == 'sapling': return f'a young {n.replace(" Sapling", "").lower()} tree sapling with a few leaves, its roots in a small clump of soil'
    if t == 'food': return f'{n}, a cooked dish of food'
    if t == 'artisan': return f'{n}' + (f', {SHAPE_HINT[d["sh"]]}' if d['sh'] in SHAPE_HINT else ', a homemade artisan good')
    if t == 'fish': return f'a {n} (a fish or sea creature), whole'
    if t == 'armor': return f'{n}, a piece of {tier} armour' if tier else n
    if t == 'weapon': return f'{n}, a {tier} {d["wt"] or "weapon"}'
    if t == 'place': return f'{n}, a small farm object or machine you can place'
    if t == 'implement': return f'{n}, a horse-drawn farm implement'
    if t == 'loot': return f'{n}, a part taken from a monster or a trophy'
    if t == 'fert': return f'a small sack of {n}'
    if t in ('crop', 'fruit'): return f'{n} ({t}), freshly harvested'
    if t == 'forage': return f'{n}, gathered in the wild'
    if t in ('ore', 'bar'): return f'{n} ({"a lump of raw ore" if t == "ore" else "a smelted metal ingot"})'
    if t == 'animal': return f'{n}, a farm animal product'
    if t == 'special': return f'{n}' + (f' ({d["desc"]})' if d['desc'] else '')
    return n + (f' ({d["desc"]})' if d['desc'] else '')

def wanted(d):
    if d['id'] in SKIP_ID: return False
    if d['t'] == 'gem': return d['id'] in PEARLS
    if d['t'] == 'weapon': return d['wt'] == 'dagger'
    if d['t'] == 'armor': return d['sh'] in ('helm', 'plate', 'boot', 'boots') or 'helm' in d['id'] or 'body' in d['id'] or 'boots' in d['id']
    return d['t'] not in SKIP_T

def guide(d):
    p = SRC / 'icons' / f'{d["id"]}.png'; im = Image.new('RGB', (384, 384), KEY)
    if p.exists() and d['id'] not in HINT:
        ic = Image.open(p).convert('RGBA').resize((256, 256), Image.NEAREST).filter(ImageFilter.GaussianBlur(3)); im.paste(ic, (64, 64), ic)
    g = SRC / 'icon_guide.png'; im.save(g); return g

def cut(src):
    im = src.convert('RGB'); W, H = im.size; a = magenta.alpha(im)
    out = im.convert('RGBA'); out.putalpha(a); op = out.load()
    for y in range(H):
        for x in range(W):
            r, g, b, al = op[x, y]
            if al and (min(r, b) - g) > 15: op[x, y] = (min(r, g + 30), g, min(b, g + 30), al)
    bb = out.getbbox(); out = out.crop(bb) if bb else out
    s = (CELL - 6) / max(out.width, out.height); out = out.resize((max(1, round(out.width * s)), max(1, round(out.height * s))), Image.LANCZOS)
    cell = Image.new('RGBA', (CELL, CELL)); cell.alpha_composite(out, ((CELL - out.width) // 2, (CELL - out.height) // 2)); return cell

def paint(d, seed=7):
    up = restyle.upload(guide(d))
    prompt = (f'Paint a single {what(d)} as a beautiful hand-painted fantasy RPG inventory icon: one object, centred and filling '
              'most of the picture, seen from a slight three-quarter view, visible oil brush strokes, soft shading with light '
              'from the top-left, rich colour and a thin dark outline. The rough picture is only a hint of its colours and '
              'shape: make it clearly read as what it is. Plain flat magenta background, no shadow, no text, no frame, nothing else.')
    raw = OUT / 'raw' / f'{d["id"]}.png'; raw.parent.mkdir(parents=True, exist_ok=True)
    restyle.run(up, prompt, raw, seed=seed, mp=.15, denoise=1.0, steps=4)
    cut(Image.open(raw)).save(OUT / f'{d["id"]}.png')

def pack():
    ids = sorted(p.stem for p in OUT.glob('*.png')); cols = 32; rows = math.ceil(len(ids) / cols)
    sheet = Image.new('RGBA', (cols * CELL, rows * CELL)); idx = {}
    for i, k in enumerate(ids):
        x, y = (i % cols) * CELL, (i // cols) * CELL; sheet.alpha_composite(Image.open(OUT / f'{k}.png'), (x, y)); idx[k] = [x, y]
    GAME.mkdir(parents=True, exist_ok=True); sheet.save(GAME / 'icons.png', optimize=True)
    (GAME / 'icons.json').write_text(json.dumps({'cell': CELL, 'at': idx})); print('packed', len(ids))

if __name__ == '__main__':
    a = sys.argv[1:]
    if a[:1] == ['--pack']: pack(); sys.exit()
    items = json.loads((SRC / 'items.json').read_text()); OUT.mkdir(parents=True, exist_ok=True)
    todo = [d for d in items if (d['id'] in a) if a] or [d for d in items if wanted(d) and not (OUT / f'{d["id"]}.png').exists()]
    print(len(todo), 'to paint', flush=True)
    for d in todo:
        try: paint(d)
        except Exception as e: print('failed', d['id'], e, flush=True)
