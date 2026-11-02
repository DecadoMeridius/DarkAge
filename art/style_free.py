"""Free painting: the model paints each object afresh, using the pixel sprite only as a rough guide to what
it is, how big it is and where it stands; the result is cut out by its own silhouette, not the pixel outline.

    cd art && uv run --project ../tools/pixelart-mcp-main --with numpy python style_free.py --build [--only=prefix,..] [--nopack]
    (pilot: style_free.py <out.png> name,name,... [seed] [gen]   a contact sheet, pixel sprite | free painting)

Bases are painted on a magenta card (whatever the model paints on it stays magenta-ish, so shadows and glows cut away
cleanly); variants (winter, upgrades, ruins, seasons, lit, filled) are word edits of the painted base, so they stay the
same object. Frames keep the pixel sprite's box and carry ox / oy: where the painting lies against it (x_artlight.js).
Tiling pieces (walls, fences, gates) and animation frames are still painted to the pixel outline (style_build.py).
"""
import re, sys
from PIL import Image, ImageFilter
import numpy as np
sys.argv = [sys.argv[0], 'painterly'] + sys.argv[1:]
import style_build as sb

KEY = (255, 0, 255, 255)   # a magenta card: whatever the model paints on it (shadows, glow) stays magenta-ish
FREE = ('Transform these pixel-art game sprites into beautiful, richly detailed hand-painted fantasy RPG art in the '
        'style of a painted storybook: visible oil brush strokes, soft form shading, rich colour, the same three-quarter top-down view. '
        'The pixel art is only a rough guide to what each object is, how big it is and where it stands: redesign it '
        'freely with more detail and charm, but keep every object in its own place and about its size.{} '
        'Nothing may stay pixel art. Do not add new objects. The background stays plain flat magenta: no shadows, no '
        'light rays, no glow, no ground.')
BLD = ' Keep doors and windows about where they are.'
VAR = ('Edit these painted game objects: {}. Keep everything else exactly as it is: the same painted style, designs, '
       'colours, sizes and positions. Paint the change in the same soft painted brushwork. The background stays plain '
       'flat magenta.')


def background(a):
    """the magenta card and anything the model painted on it: hue near magenta with some saturation"""
    f = a.astype(np.float32); r, g, b = f[..., 0], f[..., 1], f[..., 2]; lo = np.minimum(r, b)
    return (lo > 45) & (g < lo * .55) & (np.abs(r - b) < lo * .5)   # (the card comes back anywhere from magenta to pink; dark reds have b low)


PAD = .35   # room round each sprite (of its size) for the painting to grow into


def sheet_for(names, gen):
    pads = {n: int(max(sb.atlas[n]['w'], sb.atlas[n]['h']) * PAD) for n in names}
    pad = max(pads.values())
    (w, h), pos = sb.shelf(names, pad=pad)
    sheet = Image.new('RGBA', (w * gen, h * gen), KEY)
    for n, (x, y) in pos.items():
        sheet.alpha_composite(sb.crop(n).resize((sb.atlas[n]['w'] * gen, sb.atlas[n]['h'] * gen), Image.NEAREST), (x * gen, y * gen))
    return sheet, pos, pad


def cut(res, n, x, y, pad, gen, bgc):
    """the painted object near cell (x, y): pixels off the card, the parts touching the sprite's middle, holes filled"""
    w, h = sb.atlas[n]['w'], sb.atlas[n]['h']
    X0, Y0 = max(0, (x - pad) * gen), max(0, (y - pad) * gen)
    win = res.crop((X0, Y0, min(res.width, (x + w + pad) * gen), min(res.height, (y + h + pad) * gen)))
    a = np.asarray(win.convert('RGB'), dtype=np.int16)
    fg = ~background(a)
    fg = np.asarray(Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(3))) > 0
    # connected parts touching the middle of the sprite's own box
    from collections import deque
    H, W = fg.shape; lab = np.zeros((H, W), np.int32); keep = set(); k = 0
    cx0, cx1 = (x - (x - pad if x - pad > 0 else 0)) * gen + int(w * gen * .2), (x - max(0, x - pad)) * gen + int(w * gen * .8)
    cy0, cy1 = (y - max(0, y - pad)) * gen + int(h * gen * .2), (y - max(0, y - pad)) * gen + int(h * gen * .9)
    for sy in range(0, H, 2):
        for sx in range(0, W, 2):
            if not fg[sy, sx] or lab[sy, sx]: continue
            k += 1; q = deque([(sy, sx)]); lab[sy, sx] = k; hit = False
            while q:
                py, px = q.popleft()
                if cx0 <= px < cx1 and cy0 <= py < cy1: hit = True
                for qy, qx in ((py + 1, px), (py - 1, px), (py, px + 1), (py, px - 1)):
                    if 0 <= qy < H and 0 <= qx < W and fg[qy, qx] and not lab[qy, qx]: lab[qy, qx] = k; q.append((qy, qx))
            if hit: keep.add(k)
    obj = np.isin(lab, list(keep))
    if obj.sum() < 50: return None
    # fill holes (grey stone inside the object): everything not reachable from the border through non-object pixels
    reach = np.zeros_like(obj); q = deque()
    for py in range(H):
        for px in (0, W - 1):
            if not obj[py, px] and not reach[py, px]: reach[py, px] = 1; q.append((py, px))
    for px in range(W):
        for py in (0, H - 1):
            if not obj[py, px] and not reach[py, px]: reach[py, px] = 1; q.append((py, px))
    while q:
        py, px = q.popleft()
        for qy, qx in ((py + 1, px), (py - 1, px), (py, px + 1), (py, px - 1)):
            if 0 <= qy < H and 0 <= qx < W and not obj[qy, qx] and not reach[qy, qx]: reach[qy, qx] = 1; q.append((qy, qx))
    alpha = ~reach & ~background(a)   # holes filled, but the card showing through (under a roof, inside a stall) stays open
    ys, xs = np.nonzero(alpha)
    bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    m = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(gen * .25))
    part = win.copy(); part, m = sb.defringe(part, m, gen); part.putalpha(m)
    return part.crop((bx0, by0, bx1, by1)), (X0 + bx0 - x * gen, Y0 + by0 - y * gen)   # and where it sits against the sprite's box, GEN px


def paint_sheet(key, names, gen, seed=7):
    sheet, pos, pad = sheet_for(names, gen)
    res = sb.restyle_sheet(key, sheet, FREE.format(BLD if all(n.startswith('bld_') for n in names) else ''), seed=seed)
    return res, sheet, pos, pad


def variant_sheet(key, base_res, names, suffix, what, gen, seed=7):
    """the variants (name + suffix) as a word-described edit of the painted base sheet, so they stay the same objects
    (a pixel variant as a second image was tried: the model copied its blocky pixel snow)"""
    sheet, pos, pad = sheet_for(names, gen)
    src = sb.WORK / f'{key}_in.png'; res = sb.WORK / f'{key}_out.png'
    if not res.exists():
        base_res.save(src)
        mp = min(2.2, max(.6, sheet.width * sheet.height / 1e6))
        sb.restyle.run(sb.restyle.upload(src), VAR.format(what), res, seed=seed, mp=mp)
    return Image.open(res).convert('RGBA').resize(sheet.size, Image.LANCZOS), pos, pad


# ---------------------------------------------------------------- the full build -----------------------------------
EVERGREEN = {'pine', 'stonepine', 'frostwood', 'fir', 'spruce', 'mangrove'}
HYBRID_FAM = ('fence', 'cwall', 'cgate')        # pieces that must join up with each other: painted to the pixel outline
CONTAIN = ('gi_', 'ui_', 'dec_')               # icons and floor decals stay inside their box (drawn at a fixed size)
EDIT = {
    'winter': 'make it deep winter: a soft layer of painted snow on every roof, ledge and top surface, a few icicles under '
              'the eaves, a little snow at the foot, no flowers or green plants',
    'l2': 'make it a little grander: the windows get painted white trim and wooden shutters',
    'l3': 'make it grander still: add a stone footing along the bottom of the walls and a small white cupola with a pointed '
          'roof on the middle of the roof ridge; keep everything already there',
    'l4': 'make it the grandest: add a weathervane on top of the cupola, two hanging lanterns beside the door and flower '
          'boxes full of flowers under the windows; keep everything already there',
    'ruin': 'make it a neglected ruin: broken and missing glass panes, cracked frames, weeds and ivy growing over it',
    'lit': 'light the lamp: a warm glowing flame inside, the glass lit golden',
    'fill': 'fill the empty display with a few small treasures: old coins, a vase, a fossil, a gem',
    'spring': 'make it spring: fresh light-green young leaves and a few pale blossoms',
    'autumn': 'make it autumn: the leaves turned orange, red and gold, a few fallen leaves at the foot',
    'bare': 'make it winter: take away all the leaves so only the bare branches show, with a little snow along their tops',
    'snowtree': 'make it winter: soft snow resting on the branches and needles',
    'fruit': 'hang ripe {} fruit among the leaves',
}


def plan(names):
    """each sprite's parent and the edit that turns the parent into it (a sprite with none is a base, painted freely)"""
    S = set(names); par = {}
    for n in names:
        p = e = None
        t = re.match(r'tree_(.+)_(\d)_(\w)$', n)
        if t:
            k, se, v = t.groups()
            if se != '1': p, e = f'tree_{k}_1_{v}', ['spring', None, 'autumn', 'snowtree' if k in EVERGREEN else 'bare'][int(se)]
            elif v == 'f' and f'tree_{k}_1_0' in S: p, e = f'tree_{k}_1_0', 'fruit:' + k.replace('_', ' ')
        elif n.endswith('_w') and n[:-2] in S: p, e = n[:-2], 'winter'
        elif re.search(r'_l\d$', n):
            b, lv = n[:-3], int(n[-1]); prev = f'{b}_l{lv - 1}' if lv > 2 and f'{b}_l{lv - 1}' in S else b
            if b in S: p, e = prev, f'l{min(lv, 4)}'
        elif n.endswith('_ruin') and n[:-5] in S: p, e = n[:-5], 'ruin'
        elif n + '_off' in S: p, e = n + '_off', 'lit'
        elif n + '_empty' in S: p, e = n + '_empty', 'fill'
        if p and p in S and (sb.atlas[p]['w'], sb.atlas[p]['h']) == (sb.atlas[n]['w'], sb.atlas[n]['h']): par[n] = (p, e)
    return par


def root(n, par):
    path = []
    while n in par: n, e = par[n]; path.append(e)
    return n, tuple(reversed(path))


def gen_for(n):
    m = max(sb.atlas[n]['w'], sb.atlas[n]['h'])
    return 2 if n.startswith('bld_') else 8 if m <= 40 else 4   # big things at 2x, so the model redesigns rather than traces


def base_sheets(bases):
    """bases grouped by input scale, sorted by size, packed so a sheet stays about 2.4 MP"""
    out = []
    for gen in (2, 4, 8):
        ns = sorted([n for n in bases if gen_for(n) == gen], key=lambda n: (max(sb.atlas[n]['w'], sb.atlas[n]['h']), n))
        cur, area = [], 0
        for n in ns:
            p = int(max(sb.atlas[n]['w'], sb.atlas[n]['h']) * PAD)
            a = (sb.atlas[n]['w'] + 2 * p) * (sb.atlas[n]['h'] + 2 * p) * gen * gen
            if cur and (area + a > 2.4e6 or len(cur) >= 16): out.append((gen, cur)); cur, area = [], 0
            cur.append(n); area += a
        if cur: out.append((gen, cur))
    return out


def frame_of(n, got, gen):
    """the cut painting as an atlas frame: free (ox / oy against the pixel box) or fitted into the box (CONTAIN)"""
    part, (ox, oy) = got
    bw, bh = sb.atlas[n]['w'], sb.atlas[n]['h']; pw, ph = part.width / gen, part.height / gen
    lim = (.25, 4) if n.startswith(CONTAIN) else (.45, 1.8)   # icons and decals are fitted into their box anyway
    if not (lim[0] < pw / bw < lim[1] and lim[0] < ph / bh < lim[1]): return None
    if n.startswith(CONTAIN):
        s = min(bw / pw, bh / ph); im = part.resize((max(1, int(pw * s * sb.K)), max(1, int(ph * s * sb.K))), Image.LANCZOS)
        box = Image.new('RGBA', (bw * sb.K, bh * sb.K)); box.alpha_composite(im, ((box.width - im.width) // 2, (box.height - im.height) // 2))
        return (box, sb.K)
    im = part.resize((max(1, round(pw * sb.K)), max(1, round(ph * sb.K))), Image.LANCZOS)
    return (im, sb.K, {'ox': round(ox / gen, 2), 'oy': round(oy / gen, 2)})


def realign(ed, base):
    """an edit of a whole sheet sometimes comes back zoomed out or shifted: scale and move it so everything painted
    spans the same width and stands on the same bottom line as in the sheet it was made from (snow adds height on top)"""
    def box(im):
        fg = ~background(np.asarray(im.convert('RGB'), dtype=np.int16))
        cols, rows = np.nonzero(fg.sum(0) >= 3)[0], np.nonzero(fg.sum(1) >= 3)[0]
        return (cols.min(), cols.max() + 1, rows.min(), rows.max() + 1) if len(cols) and len(rows) else None
    a, b = box(base), box(ed)
    if not a or not b: return ed
    s = (a[1] - a[0]) / max(1, b[1] - b[0])
    if abs(s - 1) < .01 and abs(a[0] - b[0]) < 2 and abs(a[3] - b[3]) < 2: return ed
    out = Image.new('RGBA', base.size, KEY)
    big = ed.resize((max(1, round(ed.width * s)), max(1, round(ed.height * s))), Image.LANCZOS)
    out.paste(big, (round(a[0] - b[0] * s), round(a[3] - b[3] * s)))   # (negative offsets clip)
    return out


def build():
    names = [n for n in sb.atlas if not n.startswith(('hb_', 'ic_', 'ground_')) and not sb.is_template(n)]
    hybrid = {n for n in names if re.search(r'\.\d+$', n) or sb.family(n) in HYBRID_FAM}
    free = [n for n in names if n not in hybrid]
    par = plan(free)
    bases = [n for n in free if n not in par]
    frames, failed = {}, []
    sheets = base_sheets(bases)
    if ONLY: sheets = [(g, ns) for g, ns in sheets if any(n.startswith(tuple(ONLY)) for n in ns)]
    print(f'{len(sheets)} free sheets ({len(bases)} bases, {len(par)} variants), {len(hybrid)} kept to the pixel outline', flush=True)
    if '--dry' in sys.argv: return {}
    seen = set()
    for i, (gen, ns) in enumerate(sheets):
        key = f'F_{gen}_' + '_'.join(sorted(n[:5] for n in ns))[:40] + f'_{len(ns)}'
        if key in seen: key += f'_b{i}'   # two sheets with the same short name must not share a cache
        seen.add(key)
        base, sheet, pos, pad = paint_sheet(key, ns, gen)
        imgs = {(): base}
        kids = [n for n in par if root(n, par)[0] in pos]
        for n in sorted(kids, key=lambda n: len(root(n, par)[1])):
            b, path = root(n, par)
            for j in range(1, len(path) + 1):   # each edit on the sheet once, built on the one before
                if path[:j] in imgs: continue
                e = path[j - 1]; what = EDIT[e.split(':')[0]].format(*e.split(':')[1:])
                ed = sb.restyle_sheet(f'{key}_' + '_'.join(x.replace(':', '-').replace(' ', '') for x in path[:j]), imgs[path[:j - 1]], VAR.format(what))
                imgs[path[:j]] = realign(ed, imgs[path[:j - 1]])
        for n in list(pos) + kids:
            b, path = root(n, par); x, y = pos[b]
            if b in failed: failed.append(n); continue   # a variant of a failed base goes the old way too, so they match
            got = cut(imgs[path], b, x, y, pad, gen, None)
            f = frame_of(n, got, gen) if got else None
            if f: frames[n] = f
            else: failed.append(n)
        print(f'[{i + 1}/{len(sheets)}] {key} ({len(ns)} + {len(kids)} variants)', flush=True)
    if failed: print('  no fitting painting, painted to the pixel outline:', ' '.join(failed), flush=True)
    # the rest the old way: tiling pieces, animation frames, and whatever failed above
    rest = sorted(hybrid | set(failed))
    if ONLY: rest = [n for n in rest if n.startswith(tuple(ONLY))]
    fams = {}
    for n in rest: fams.setdefault(sb.family(n), []).append(n)
    for f, ns in sorted(fams.items()):
        for i, s in enumerate(sb.sheets_for(ns)): frames.update(sb.objects(f'{f}_{i}', s))   # style_build's keys, so its cached sheets are reused
    return frames


ONLY = next((a.split('=', 1)[1].split(',') for a in sys.argv if a.startswith('--only=')), None)
if __name__ == '__main__' and '--build' in sys.argv:
    frames = build()
    if '--nopack' in sys.argv or '--dry' in sys.argv: sys.exit()
    # templates (creatures, crops, icons) and ground: as style_build makes them (cached)
    tfam = {}
    for n in sb.atlas:
        if not n.startswith(('en_', 'an_', 'crop_', 'ic_')) or not sb.is_template(n): continue
        f = 'T_' + (re.sub(r'(_atk)?\.\d+$', '', n) if n.startswith(('en_', 'an_')) else n.split('_')[0])
        tfam.setdefault(f, []).append(n)
    for f, ns in sorted(tfam.items()):
        for i, s in enumerate(sb.sheets_for(ns)): frames.update(sb.templates(f'{f}_{i}', s))
    for n in [n for n in sb.atlas if n.startswith('ground_')]: frames.update(sb.ground(n))
    sb.pack(frames); sys.exit()


if __name__ == '__main__' and '--var' in sys.argv:
    out, names, suffix, what = sys.argv[2], sys.argv[3].split(','), sys.argv[4], sys.argv[5]
    gen = 2
    base, _, pos, pad = paint_sheet('FREE3_' + '_'.join(n[:6] for n in names)[:60] + f'_s7_g{gen}', names, gen)
    res, pos, pad = variant_sheet('FVAR2_' + '_'.join(n[:6] for n in names)[:50] + suffix, base, names, suffix, what, gen)
    cells = []
    for n, (x, y) in pos.items():
        bgc = None
        for r in (base, res):
            got = cut(r, n, x, y, pad, gen, bgc)
            if got: cells.append(got[0])
    W = sum(p.width + 20 for p in cells); H = max(p.height for p in cells) + 20
    yy, xx = np.mgrid[:H, :W]; d = np.zeros((H, W, 4), np.uint8)
    d[...] = np.where((((yy // 16) + (xx // 16)) % 2)[..., None] == 0, [92, 120, 80, 255], [104, 132, 90, 255])
    chk = Image.fromarray(d); x = 10
    for p in cells: chk.alpha_composite(p, (x, H - 10 - p.height)); x += p.width + 20
    s = min(1, 2400 / chk.width); chk.resize((int(chk.width * s), int(chk.height * s))).save(out); sys.exit()
if __name__ == '__main__':
    out, names = sys.argv[2], sys.argv[3].split(',')
    seed = int(sys.argv[4]) if len(sys.argv) > 4 else 7
    gen = int(sys.argv[5]) if len(sys.argv) > 5 else 4
    sheet, pos, pad = sheet_for(names, gen)
    res = sb.restyle_sheet('FREE3_' + '_'.join(n[:6] for n in names)[:60] + f'_s{seed}_g{gen}', sheet, FREE.format(BLD if all(n.startswith('bld_') for n in names) else ''), seed=seed)
    r_ = np.asarray(res.convert('RGB')); bgc = np.median(np.concatenate([r_[0], r_[-1], r_[:, 0], r_[:, -1]]), 0).astype(np.int16)
    cells = []
    for n, (x, y) in pos.items():
        got = cut(res, n, x, y, pad, gen, bgc)
        o = sb.crop(n).resize((sb.atlas[n]['w'] * gen, sb.atlas[n]['h'] * gen), Image.NEAREST)
        if got is None: print('nothing found for', n); continue
        p, (ox, oy) = got
        print(f'{n}: painted {p.width / gen:.0f}x{p.height / gen:.0f} art px (pixel {sb.atlas[n]["w"]}x{sb.atlas[n]["h"]}), offset {ox / gen:.0f},{oy / gen:.0f}')
        cells.append((o, p))
    W = sum(o.width + p.width + 40 for o, p in cells); H = max(max(o.height, p.height) for o, p in cells) + 20
    chk = Image.new('RGBA', (W, H)); d = np.zeros((H, W, 4), np.uint8); yy, xx = np.mgrid[:H, :W]
    d[...] = np.where((((yy // 16) + (xx // 16)) % 2)[..., None] == 0, [92, 120, 80, 255], [104, 132, 90, 255])
    chk = Image.fromarray(d); x = 10
    for o, p in cells:
        chk.alpha_composite(o, (x, H - 10 - o.height)); x += o.width + 10
        chk.alpha_composite(p, (x, H - 10 - p.height)); x += p.width + 30
    s = min(1, 2400 / chk.width); chk.resize((int(chk.width * s), int(chk.height * s))).save(out)
