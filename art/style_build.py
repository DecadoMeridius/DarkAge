"""Builds an art-style atlas from the pixel-art atlas with Qwen Image Edit (ComfyUI on 127.0.0.1:8188).

    cd art && uv run --project ../tools/pixelart-mcp-main --with numpy python style_build.py [style] [--only prefix,...]

Output: public/art/styles/<style>/atlas.json + atlas_<page>.png (4096 px pages). Frames carry `k` (style px per
pixel-art px) and `p` (page); the game keeps ww/wh in world units, so sizes, anchors and collisions don't change.

- Objects: related sprites (a family: tree_oak_*, conveyor.*, bld_barn_*...) share a sheet so they come out alike.
  Sheets are drawn at GEN x on a flat grey card, restyled, cut out with each sprite's own pixel-art mask, colour
  matched to the original, and stored at K x.
- Ground textures: a 3x3 tiling is restyled and the centre tile kept, so it still tiles; stored at GK x
  (the chunk painter paints styled ground at that resolution).
- Palette-swap templates (channel codes RGB(255, ch, level)), character layers and UI icons are skipped here.
- Every restyled sheet is cached in comfyui/style/<style>/, so a rerun only does what's new.
"""
import json, re, sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'comfyui'))
import restyle  # noqa: E402

args = [a for a in sys.argv[1:] if not a.startswith('--')]
STYLE = args[0] if args else 'painterly'
TRIES = next((int(a.split('=', 1)[1]) for a in sys.argv[1:] if a.startswith('--tries=')), 6)
ONLY = next((a.split('=', 1)[1].split(',') for a in sys.argv[1:] if a.startswith('--only=')), None)
GEN, K, GK = 4, 3, 4               # generate at 4x, store objects at 3x, ground at 4x
SHEET_PX = 62000                    # art px per sheet (about 1 MP at 4x)
OUT = ROOT / 'public' / 'art' / 'styles' / STYLE
WORK = ROOT / 'comfyui' / 'style' / STYLE
BG = (128, 128, 128, 255)

LOOK = {
    'painterly': 'Repaint these game sprites as a rich hand-painted fantasy RPG: visible oil brush strokes, detailed '
                 'textures, soft form shading with light from the top-left, warm golden highlights.',
}
KEEP = ('Each object keeps its exact silhouette, size, position, colours and design; nothing may stay pixel art. '
        'Do not add anything and do not move anything. The background stays plain flat grey with no shadows and no light.')
# soft natural grounds: the model turns their big flat patches into embossed 3D blobs unless told to keep them flat
FLAT_GROUND = {'ground_a', 'ground_c_ice', 'ground_c_void', 'ground_d', 'ground_d_0', 'ground_d_2', 'ground_d_3', 'ground_g_2', 'ground_g_3',
               'ground_i', 'ground_s', 'ground_s_0', 'ground_s_2', 'ground_s_3', 'ground_sn', 'ground_st', 'ground_st_0', 'ground_st_2',
               'ground_st_3', 'ground_w', 'ground_p_3'}
FLAT_TXT = ('Turn this into a seamless hand-painted texture of {} seen from straight above, for a fantasy RPG: rich, detailed '
            'painterly brushwork in these same colours, small natural detail spread evenly over the whole image, nothing large. '
            'Uniform everywhere: no centre, no frame, no border, no swirl, no big shapes, no objects. Flat lighting.')
MAT = {'a': 'grey volcanic ash and cinders', 'c_ice': 'a frozen ice cave floor with frost', 'c_void': 'a dark violet crystal cave floor',
       'd': 'packed brown dirt with pebbles', 'g': 'short grass', 'i': 'smooth blue ice with frost and cracks', 's': 'fine beach sand',
       'sn': 'fresh soft snow', 'st': 'rough grey-brown rocky ground with gravel', 'w': 'calm deep blue water with many small soft ripples',
       'p': 'snow-dusted cobblestone paving'}
def MATERIAL(n):
    k = n[len('ground_'):]; base = k.split('_')[0] if not k.startswith('c_') else k
    m = MAT.get(base, MAT.get(k, 'natural ground'))
    if k.endswith('_3') and base not in ('p',): m += ' with a light dusting of snow'
    if base == 'g' and k.endswith('_2'): m = 'short autumn grass with fallen leaves'
    return m
GROUND_TXT = (' This is a seamless ground texture seen from straight above; keep it an even, seamless, flat texture '
              'with the same colours and pattern scale, no objects, no lighting.')

atlas = json.loads((ROOT / 'public' / 'art' / 'atlas.json').read_text())['frames']
img = Image.open(ROOT / 'public' / 'art' / 'atlas.png').convert('RGBA')
crop = lambda n: img.crop((atlas[n]['x'], atlas[n]['y'], atlas[n]['x'] + atlas[n]['w'], atlas[n]['y'] + atlas[n]['h']))


def is_template(n):
    a = np.asarray(crop(n)); m = a[..., 3] > 0
    if m.sum() == 0: return False
    code = (a[..., 0] == 255) & (a[..., 2] < 8) & m
    return code.sum() > m.sum() * .2


SKIP = ('hb_', 'ui_', 'ic_')   # objects only; hb_ and ic_ templates are done by templates()
def family(n):
    """sprites that should be restyled together"""
    if n.startswith('bld_'): return re.sub(r'(_w|_l\d|_ruin)+$', '', n)
    if n.startswith('cwall'): return 'cwall'
    if n.startswith(('ctower', 'cgate')): return 'cgate'
    if n.startswith('fence'): return 'fence'
    if n.startswith('furn_'): return 'furn'
    if n.startswith('dec_'): return 'dec'
    if n.startswith('tree_'): return 'tree_' + n.split('_')[1]
    if n.startswith('gi_tool_'): return 'gi_tool_' + n.split('_')[2]          # one tool kind across its tiers
    if n.startswith('gi_'): return 'gi_' + n.split('_')[-1]                   # one weapon / armour kind across tiers
    return re.split(r'[._]', n)[0]


def match(part, ref, mask):
    """pull each channel's mean (and half its spread) back to the pixel-art original"""
    a = np.asarray(part.convert('RGB'), dtype=np.float32); r = np.asarray(ref.convert('RGB'), dtype=np.float32)
    m = np.asarray(mask) > 128
    if m.sum() < 16: return part.convert('RGBA')
    for c in range(3):
        am, asd = a[..., c][m].mean(), a[..., c][m].std() + 1e-3
        rm, rsd = r[..., c][m].mean(), r[..., c][m].std()
        a[..., c] = (a[..., c] - am) * (.5 + .5 * rsd / asd) + rm
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')


def shelf(names, pad=10):
    area = sum((atlas[n]['w'] + pad) * (atlas[n]['h'] + pad) for n in names)
    width = max(int(area ** .5 * 1.25), max(atlas[n]['w'] for n in names) + 2 * pad)
    x = y = pad; row = 0; pos = {}
    for n in sorted(names, key=lambda n: (-atlas[n]['h'], n)):
        w, h = atlas[n]['w'], atlas[n]['h']
        if x + w + pad > width: x = pad; y += row + pad; row = 0
        pos[n] = (x, y); x += w + pad; row = max(row, h)
    return (width, y + row + pad), pos


def sheets_for(names, cap=None):
    """split a family into sheets of at most SHEET_PX art px (a sprite bigger than that gets a sheet of its own)"""
    out, cur, size = [], [], 0
    for n in sorted(names, key=lambda n: (-atlas[n]['w'] * atlas[n]['h'], n)):
        a = (atlas[n]['w'] + 10) * (atlas[n]['h'] + 10)
        if cur and size + a > (cap or SHEET_PX): out.append(cur); cur, size = [], 0
        cur.append(n); size += a
    if cur: out.append(cur)
    return out


def restyle_sheet(key, sheet, prompt, seed=7):
    src = WORK / f'{key}_in.png'; res = WORK / f'{key}_out.png'
    src.parent.mkdir(parents=True, exist_ok=True)
    if not res.exists():
        sheet.save(src)
        mp = min(2.2, max(.6, sheet.width * sheet.height / 1e6))
        restyle.run(restyle.upload(src), prompt, res, seed=seed, mp=mp)
    return align(Image.open(res).convert('RGBA').resize(sheet.size, Image.LANCZOS), sheet)


def align(res, sheet):
    """the model sometimes draws the whole sheet a little shifted: find the offset that best lays its
    foreground over the input's (on a 4x smaller grid) and move it back"""
    S = 4; w, h = sheet.width // S, sheet.height // S
    fg = lambda im, bg: (np.abs(np.asarray(im.convert('RGB').resize((w, h), Image.BOX), dtype=np.int16) - bg).sum(-1) > 30)
    a = fg(sheet, np.array(BG[:3]))
    r = np.asarray(res.convert('RGB')); edge = np.concatenate([r[0], r[-1], r[:, 0], r[:, -1]])
    b = fg(res, np.median(edge, 0).astype(np.int16))
    R = max(4, int(min(w, h) * .12)); best, bd = -1, (0, 0)
    for dy in range(-R, R + 1):
        for dx in range(-R, R + 1):
            bs = np.roll(np.roll(b, dy, 0), dx, 1)
            v = (a & bs).sum() - .5 * (bs & ~a).sum()
            if v > best: best, bd = v, (dx, dy)
    if bd == (0, 0): return res
    out = Image.new('RGBA', res.size, tuple(int(v) for v in np.median(edge, 0)) + (255,))
    out.paste(res, (bd[0] * S, bd[1] * S)); return out


def trim_bg(raw, mask, bgc):
    """where the painting doesn't quite fill the outline, background grey shows at the edge: flood in from outside
    the outline through near-background pixels and cut them (grey parts inside the object aren't reached)"""
    S = 2; w, h = raw.width // S, raw.height // S
    if w < 2 or h < 2: return mask
    near = np.abs(np.asarray(raw.convert('RGB').resize((w, h), Image.BOX), dtype=np.int16) - bgc).sum(-1) < 42
    reach = np.asarray(mask.resize((w, h), Image.BOX)) < 128
    reach = np.pad(reach, 1, constant_values=True); near = np.pad(near, 1, constant_values=True)
    for _ in range(max(w, h)):
        grown = reach.copy(); grown[1:] |= reach[:-1]; grown[:-1] |= reach[1:]; grown[:, 1:] |= reach[:, :-1]; grown[:, :-1] |= reach[:, 1:]
        grown &= near | reach
        if (grown == reach).all(): break
        reach = grown
    cut = Image.fromarray(((~reach[1:-1, 1:-1]) * 255).astype(np.uint8)).resize(mask.size, Image.BILINEAR)
    out = np.minimum(np.asarray(mask), np.asarray(cut))
    if out.sum() < np.asarray(mask).sum() * .75: return mask   # it ran into the object itself (grey metal, grey stone): keep the outline
    return Image.fromarray(out)


def objects(key, names):
    (w, h), pos = shelf(names)
    sheet = Image.new('RGBA', (w * GEN, h * GEN), BG)
    for n, (x, y) in pos.items():
        sheet.alpha_composite(crop(n).resize((atlas[n]['w'] * GEN, atlas[n]['h'] * GEN), Image.NEAREST), (x * GEN, y * GEN))
    res = restyle_sheet(key, sheet, LOOK[STYLE] + ' ' + KEEP)
    r_ = np.asarray(res.convert('RGB')); bgc = np.median(np.concatenate([r_[0], r_[-1], r_[:, 0], r_[:, -1]]), 0).astype(np.int16)
    got = {}
    for n, (x, y) in pos.items():
        fw, fh = atlas[n]['w'] * GEN, atlas[n]['h'] * GEN
        mask = crop(n).getchannel('A').resize((fw, fh), Image.NEAREST).filter(ImageFilter.GaussianBlur(GEN * .35))
        mask = mask.point(lambda a: 0 if a < 70 else 255 if a > 185 else int((a - 70) * 255 / 115))
        raw = res.crop((x * GEN, y * GEN, x * GEN + fw, y * GEN + fh))
        mask = trim_bg(raw, mask, bgc)
        part = match(raw, crop(n).resize((fw, fh), Image.NEAREST), mask)
        part.putalpha(mask)
        got[n] = (part.resize((atlas[n]['w'] * K, atlas[n]['h'] * K), Image.LANCZOS), K)
    return got


def seamless(im):
    """the model doesn't keep a texture periodic: blend it with itself shifted by half, weighted toward the shifted
    copy near the edges (whose borders are neighbouring rows of the original, so it wraps cleanly)"""
    a = np.asarray(im.convert('RGB'), dtype=np.float32); H, W = a.shape[:2]
    b = np.roll(np.roll(a, H // 2, 0), W // 2, 1)
    wy = 1 - np.abs(np.linspace(-1, 1, H)); wx = 1 - np.abs(np.linspace(-1, 1, W))
    w = np.clip(np.minimum.outer(wy, wx) * 2.2, 0, 1)[..., None]
    return Image.fromarray(np.clip(a * w + b * (1 - w), 0, 255).astype(np.uint8)).convert('RGBA')


def highpass(im, frac=.12):
    """drop the texture's large blotches (they make a repeating tile obvious) and keep the brushwork; the game adds
    its own broad variation across the map"""
    a = np.asarray(im.convert('RGB'), dtype=np.float32); H, W = a.shape[:2]
    t = Image.fromarray(np.tile(a, (3, 3, 1)).astype(np.uint8)).filter(ImageFilter.GaussianBlur(W * frac))
    low = np.asarray(t, dtype=np.float32)[H:2 * H, W:2 * W]
    return Image.fromarray(np.clip(a - low + a.reshape(-1, 3).mean(0), 0, 255).astype(np.uint8)).convert('RGBA')


def ground(n):
    """a 4x4 tiling restyled; the centre 2x2 becomes a 128 px tile (a longer repeat than the 64 px original),
    made seamless and high-passed"""
    w, h = atlas[n]['w'], atlas[n]['h']
    big = crop(n).resize((w * GEN, h * GEN), Image.NEAREST)
    tile = Image.new('RGBA', (w * 4 * GEN, h * 4 * GEN))
    for j in range(4):
        for i in range(4): tile.paste(big, (i * w * GEN, j * h * GEN))
    flat = n in FLAT_GROUND
    if flat:   # paint a fresh texture of the material from its colours alone (random pixels of the original, softened), so nothing repeats or gets copied as a blob
        src_ = np.asarray(crop(n).convert('RGB')).reshape(-1, 3); rng = np.random.default_rng(len(n))
        small = src_[rng.integers(0, len(src_), (h * 4 // 2) * (w * 4 // 2))].reshape(h * 4 // 2, w * 4 // 2, 3)
        tile = Image.fromarray(small.astype(np.uint8)).resize(tile.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(GEN * 1.5)).convert('RGBA')
    if n == 'ground_w': res = tile   # the model paints water as one big swirl; its soft colour field reads as calm water (the game adds glints)
    else: res = restyle_sheet(n + ('_mat' if flat else '_x4'), tile, (FLAT_TXT.format(MATERIAL(n)) if flat else LOOK[STYLE] + GROUND_TXT))
    part = res.crop((w * GEN, h * GEN, 3 * w * GEN, 3 * h * GEN))
    ref = tile.crop((w * GEN, h * GEN, 3 * w * GEN, 3 * h * GEN))
    part = highpass(seamless(match(part, ref, Image.new('L', part.size, 255))), .08)
    return {n: (part.resize((2 * w * GK, 2 * h * GK), Image.LANCZOS), GK)}


"""Palette-swap templates (channel codes RGB(255, ch, level), level 4 = outline): each is painted in neutral
per-channel ramps, restyled, then stored as  R = channel, G = shade (20 + level/3*200, continuous), B = 254;
pixels that weren't codes keep their painted colour (B nudged off 254). The game maps the shade onto each
creature's own ramp (x_artstyle.js), so one painted template serves every colour variant."""
NEUTRAL = ['#9a8a7a', '#6a7a8a', '#8a9a7a', '#9a7a8a', '#7a8a9a', '#a09070', '#7a7a7a', '#a07a6a', '#6a8a8a', '#8a7a9a',
           '#9a9a7a', '#7a6a5a', '#8a8a9a', '#6a6a7a', '#b09a50', '#7a5a4a', '#8a8a8a', '#a08a50'] + ['#8a8a8a'] * 14
LV = [.45, .68, .88, 1.08]


def neutral_ramp(ch):
    h = NEUTRAL[ch % len(NEUTRAL)]; base = np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)
    return [np.clip(base * f, 0, 255) for f in LV] + [np.clip(base * LV[0] * .55, 0, 255)]


def neutral(n):
    """the template in neutral colours, plus its channel and code masks"""
    a = np.asarray(crop(n)).copy(); code = (a[..., 0] == 255) & (a[..., 2] < 5) & (a[..., 3] > 0)
    ch = np.where(code, a[..., 1], 255).astype(np.uint8); lv = a[..., 2]
    out = a.astype(np.float32)
    for c in np.unique(ch[code]):
        r = neutral_ramp(int(c))
        for L in range(5):
            m = code & (ch == c) & (lv == L); out[m, :3] = r[L]
    return Image.fromarray(out.astype(np.uint8)), ch, lv


def encode(part, ch_big, mask):
    """painted RGB -> R channel / G shade / B 254 for code pixels; the shade comes from the luminance against
    that channel's neutral ramp"""
    a = np.asarray(part.convert('RGB'), dtype=np.float32); lum = a @ np.array([.299, .587, .114], dtype=np.float32)
    out = a.copy(); out[..., 2] = np.where(np.abs(out[..., 2] - 254) < .5, 253, out[..., 2])
    for c in np.unique(ch_big[ch_big < 255]):
        r = neutral_ramp(int(c)); lums = np.array([x @ np.array([.299, .587, .114]) for x in r[:4]])
        m = ch_big == c
        lv = np.interp(lum[m], lums, [0, 1, 2, 3], left=None, right=None)
        lv = np.where(lum[m] < lums[0], (lum[m] - lums[0]) / max(lums[0], 1) * 1.6, lv)          # below level 0: outline-ish
        lv = np.where(lum[m] > lums[3], 3 + (lum[m] - lums[3]) / max(255 - lums[3], 1) * .5, lv)   # brighter than level 3
        out[m, 0] = c; out[m, 1] = np.clip(20 + lv / 3 * 200, 0, 255); out[m, 2] = 254
    img_ = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert('RGBA'); img_.putalpha(mask)
    return img_


def register(res, n, x, y, pad):
    """find where (and how much bigger) the model painted sprite n near its cell (x, y art px; pad art px of
    room round it) and return that region at the sprite's own size and place, GEN px"""
    w, h = atlas[n]['w'], atlas[n]['h']
    S = max(1, int(max(w + 2 * pad, h + 2 * pad) * GEN / 110))           # search grid, about 110 px across
    X0, Y0 = max(0, (x - pad) * GEN), max(0, (y - pad) * GEN)
    win = res.crop((X0, Y0, min(res.width, (x + w + pad) * GEN), min(res.height, (y + h + pad) * GEN)))
    ww, wh = max(1, win.width // S), max(1, win.height // S)
    b = np.abs(np.asarray(win.convert('RGB').resize((ww, wh), Image.BOX), dtype=np.int16) - np.array(BG[:3])).sum(-1) > 30
    m0 = crop(n).getchannel('A')
    best, bp = -1e9, (1.0, (x * GEN - X0) // S, (y * GEN - Y0) // S)
    for sc in np.linspace(.55, 1.7, 24):
        mw, mh = max(1, int(w * GEN * sc / S)), max(1, int(h * GEN * sc / S))
        if mw > ww or mh > wh: continue
        a = np.asarray(m0.resize((mw, mh), Image.BOX)) > 100
        for oy in range(0, wh - mh + 1):
            for ox in range(0, ww - mw + 1):
                bb = b[oy:oy + mh, ox:ox + mw]
                v = (a & bb).sum() - .6 * (bb & ~a).sum() - .6 * (a & ~bb).sum()
                if v > best: best, bp = v, (sc, ox, oy)
    sc, ox, oy = bp
    L, T = ox * S, oy * S
    return win.crop((L, T, L + int(w * GEN * sc), T + int(h * GEN * sc))).resize((w * GEN, h * GEN), Image.LANCZOS)


def templates(key, names):
    pad = max(12, int(.45 * max(max(atlas[n]['w'], atlas[n]['h']) for n in names)))
    (w, h), pos = shelf(names, pad=pad)
    sheet = Image.new('RGBA', (w * GEN, h * GEN), BG); info = {}
    for n, (x, y) in pos.items():
        neu, ch, lv = neutral(n); info[n] = (neu, ch)
        sheet.alpha_composite(neu.resize((atlas[n]['w'] * GEN, atlas[n]['h'] * GEN), Image.NEAREST), (x * GEN, y * GEN))
    what = {'T_crop': 'crop plants at their growth stages', 'T_ic': 'small item icons'}.get(key.rsplit('_', 1)[0])
    if key.startswith('T_hb_body'): what = 'animation frames of a fantasy villager, walking and posing, seen from one side'
    elif key.startswith('T_hb_'): what = "one piece of a fantasy villager's outfit or hair (" + key[5:].rsplit('_', 1)[0].replace('_', ' ') + '), drawn on its own, from several sides'
    what = what or 'animation frames of a ' + key.split('_', 2)[2].rsplit('_', 1)[0].replace('_', ' ') + ' game character'
    prompt = LOOK[STYLE] + f' These are {what}. ' + KEEP + ' Keep the grey-toned colours as they are.'
    best = {}
    for attempt in range(TRIES):   # a sheet where a figure didn't fit is painted again with another seed; each sprite keeps its best try
        res = restyle_sheet(key if attempt == 0 else f'{key}_r{attempt}', sheet, prompt, seed=7 + attempt * 101)
        r_ = np.asarray(res.convert('RGB')); bgc = np.median(np.concatenate([r_[0], r_[-1], r_[:, 0], r_[:, -1]]), 0).astype(np.int16)
        for n, (x, y) in pos.items():
            if n in best and best[n][0] >= .6: continue
            neu, ch = info[n]; fw, fh = atlas[n]['w'] * K, atlas[n]['h'] * K
            part = register(res, n, x, y, pad)
            # keep only where the model actually painted the figure (a closing, so grey-toned parts inside stay)
            fgb = (np.abs(np.asarray(part.convert('RGB'), dtype=np.int16) - bgc).sum(-1) > 50)
            fg = Image.fromarray((fgb * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(GEN + 1)).filter(ImageFilter.MinFilter(GEN + 1)).resize((fw, fh), Image.BOX)
            om = np.asarray(crop(n).getchannel('A').resize(part.size, Image.NEAREST)) > 100
            fit = (om & fgb).sum() / max(1, (om | fgb).sum())
            if n in best and best[n][0] >= fit: continue
            part = part.resize((fw, fh), Image.LANCZOS)
            mask = crop(n).getchannel('A').resize((fw, fh), Image.NEAREST).filter(ImageFilter.GaussianBlur(K * .35))
            mask = mask.point(lambda a: 0 if a < 70 else 255 if a > 185 else int((a - 70) * 255 / 115))
            mask = Image.fromarray(np.minimum(np.asarray(mask), np.asarray(fg)))
            part = match(part, neu.resize((fw, fh), Image.NEAREST), mask)
            ch_big = np.asarray(Image.fromarray(ch).resize((fw, fh), Image.NEAREST))
            best[n] = (fit, encode(part, ch_big, mask))
        if all(b[0] >= .6 for b in best.values()): break
    bad = [n for n, b in best.items() if b[0] < .45]
    if bad and key.startswith(('T_en_', 'T_an_')):   # a creature that's half painted would flicker as it walks: all or nothing
        print('  poor fit, whole creature kept as pixel art:', key, ' '.join(bad), flush=True); return {}
    if bad: print('  poor fit, kept as pixel art:', ' '.join(bad), flush=True)
    return {n: (b[1], K, 'lum') for n, b in best.items() if b[0] >= .45}


def pack(frames):
    PAGE = 4096; pages, meta = [], {}
    page, x, y, row = None, 0, 0, 0
    for n in sorted(frames, key=lambda n: (-frames[n][0].height, n)):
        im, k = frames[n][:2]; w, h = im.size
        if page is None or x + w > PAGE:
            x = 0; y += row + 2; row = 0
        if page is None or y + h > PAGE:
            page = Image.new('RGBA', (PAGE, PAGE)); pages.append(page); x = y = row = 0
        page.alpha_composite(im, (x, y))
        meta[n] = {'x': x, 'y': y, 'w': w, 'h': h, 'k': k, 'p': len(pages) - 1}
        if len(frames[n]) > 2: meta[n]['t'] = 1   # an encoded template (channel / shade)
        x += w + 2; row = max(row, h)
    OUT.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob('atlas*.png'): f.unlink()
    for i, pg in enumerate(pages):
        bbox = pg.getbbox() or (0, 0, 1, 1)
        pg.crop((0, 0, PAGE, bbox[3])).save(OUT / f'atlas_{i}.png', optimize=True)
    (OUT / 'atlas.json').write_text(json.dumps({'style': STYLE, 'pages': len(pages), 'frames': meta}))
    print(f'{len(meta)} sprites in {len(pages)} pages -> {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    names = [n for n in atlas if not n.startswith(SKIP) and not is_template(n)]
    grounds = [n for n in names if n.startswith('ground_')]
    fams = {}
    for n in names:
        if n.startswith('ground_'): continue
        fams.setdefault(family(n), []).append(n)
    for f in [f for f, ns in fams.items() if sum(atlas[n]['w'] * atlas[n]['h'] for n in ns) < 6000 and not f.startswith('bld_')]:
        fams.setdefault('small', []).extend(fams.pop(f))   # one-off little props share sheets
    jobs = [(f'{f}_{i}', s, objects) for f, ns in sorted(fams.items()) for i, s in enumerate(sheets_for(ns))]
    # templates: creatures (all frames of one creature together), crops, icons
    tfam = {}
    for n in atlas:
        if n.startswith('hb_') and '--hb' not in sys.argv: continue   # characters: the model invents a different person per frame, so they stay pixel templates (smoothed in the game)
        if n.startswith('hb_'):   # character layers: a direction's body frames together, each other piece in all directions
            f = 'T_hb_body_' + n.split('_')[2] if n.startswith('hb_body_') else 'T_' + re.sub(r'_\d(_.*)?$', '', n)
            tfam.setdefault(f, []).append(n); continue
        if not n.startswith(('en_', 'an_', 'crop_', 'ic_')) or not is_template(n): continue
        f = 'T_' + (re.sub(r'(_atk)?\.\d+$', '', n) if n.startswith(('en_', 'an_')) else n.split('_')[0])
        tfam.setdefault(f, []).append(n)
    jobs += [(f'{f}_{i}', s, templates) for f, ns in sorted(tfam.items()) for i, s in enumerate(sheets_for(ns, 80000 if f.startswith('T_hb_body') else None))]
    if ONLY: jobs = [j for j in jobs if j[0].startswith(tuple(ONLY))]; grounds = [g for g in grounds if g.startswith(tuple(ONLY))]
    print(f'{len(jobs)} sheets ({sum(len(s) for _, s, _ in jobs)} sprites), {len(grounds)} ground textures', flush=True)
    if '--dry' in sys.argv: print(' '.join(f'{k}:{len(s)}' for k, s, _ in jobs)); sys.exit()
    if '--cached' in sys.argv:   # pack only what's been restyled so far
        jobs = [j for j in jobs if (WORK / f'{j[0]}_out.png').exists()]; grounds = [g for g in grounds if (WORK / f'{g}_out.png').exists()]
    frames = {}
    for i, (key, s, fn) in enumerate(jobs):
        frames.update(fn(key, s)); print(f'[{i + 1}/{len(jobs)}] {key} ({len(s)})', flush=True)
    for n in grounds:
        frames.update(ground(n)); print('ground', n, flush=True)
    if '--nopack' not in sys.argv: pack(frames)
