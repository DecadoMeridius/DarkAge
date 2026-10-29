"""Trees, rocks, ore rocks and boulders.

Sizes match the painted sprites they replace (world units x2):
trees 40x58 world -> 80x116 art px, trunk base 6px above the bottom edge;
small rocks 16x16 -> 32x32; boulders 32x32 -> 64x64. Seasons: 0 spring,
1 summer, 2 autumn, 3 winter. Variant v mirrors and reseeds the tree.
"""
import math
from px import Canvas, rect, ellipse, poly, line, vnoise, rng, hx

INK = '#2a1c18'
BARK = {'oak': ['#3e2618', '#5a3822', '#7a5030', '#9a6a40', '#b8885a'],
        'birch': ['#5a5650', '#9a948a', '#d8d2c4', '#efe9dc', '#fffaf0'],
        'dead': ['#3a3230', '#544a46', '#6e6460', '#8a807a', '#a69c94'],
        'palm': ['#5a3e22', '#7e5a36', '#a07a4a', '#c09a64', '#dcbc86'],
        'charwood': ['#141012', '#221a1a', '#322626', '#463434', '#5e4848'],
        'mangrove': ['#3a2a1a', '#56402a', '#76583a', '#94744c', '#b09060']}
# leaf ramps dark -> light, per kind and season
LEAF = {
    'oak': [['#2c5a2a', '#3e7a30', '#5a9a38', '#7cb444', '#a2cc58', '#c8e07a'],
            ['#24502a', '#336e2e', '#4a8a34', '#68a63c', '#8cc04c', '#b4d870'],
            ['#6a2a18', '#9a4422', '#c8682a', '#e0903a', '#f0b450', '#fad67a'],
            None],
    'maple': [['#2e5a26', '#427c2c', '#62a034', '#84ba44', '#a8d05c', '#cce47e'],
              ['#285226', '#3a722c', '#549034', '#74ac40', '#98c652', '#bede74'],
              ['#5a1414', '#8a201a', '#b83422', '#d8542e', '#ec7c3e', '#f8a862'],
              None],
    'birch': [['#3e6a26', '#56882e', '#76a838', '#96c246', '#b8d85e', '#dcec86'],
              ['#365e24', '#4c7c2a', '#6a9a32', '#8ab43e', '#acca52', '#d0e276'],
              ['#6a4a10', '#9a6c18', '#c89a24', '#e2bc36', '#f2d454', '#fce88a'],
              None],
    'pine': [['#14302a', '#1e4436', '#2a5a42', '#3a7050', '#4e8860', '#6aa274']] * 4,
    'stonepine': [['#1a2a34', '#2a3e4a', '#3a5260', '#4e6a78', '#6a8692', '#8aa4ae']] * 4,
    'frostwood': [['#4a7aa0', '#6a9ac0', '#8ab8d8', '#acd2ea', '#cce6f6', '#eef8ff']] * 4,
    'mangrove': [['#143a24', '#1e5030', '#2a683a', '#3a8046', '#529a58', '#72b46c']] * 4,
}
FRUIT_TREES = {  # kind: (spring blossom ramp or None, fruit colour)
    'apple': (None, '#d8342a'), 'cherry': (['#a85a7a', '#c87a98', '#e09ab4', '#f2b8cc', '#fcd6e2', '#fff0f6'], '#c4183a'),
    'peach': (None, '#ffaa70'), 'orange': (None, '#ff9a1a'),
    'plum': (['#8a7aa0', '#a898bc', '#c4b8d6', '#ddd4ea', '#efe9f6', '#ffffff'], '#7a2a8a'), 'pomegranate': (None, '#c0182a'),
}
SNOW = ['#8a9ab4', '#b4c2d6', '#d8e2ee', '#f2f6fa', '#ffffff']


def ground_shadow(s, cx, cy, rx, ry):
    for x, y in ellipse(cx, cy, rx, ry):
        d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
        if d < .65 or (x + y) % 2 == 0:
            if not s.get(x, y)[3]:
                s.px[x, y] = (24, 30, 14, 92)


def trunk(s, kind, cx, base, top, w, r):
    bark = BARK.get(kind, BARK['oak'])
    m = poly([(cx - w, top), (cx + w, top), (cx + w + 1, base - 5), (cx + w + 5, base), (cx - w - 5, base), (cx - w - 1, base - 5)])
    s.shade(m, None, 'cyl', colors=bark[:4])
    for y in range(top + 2, base - 2, 3):  # bark grain / birch bands
        if kind == 'birch':
            for x in range(cx - w, cx - w + r.randrange(2, 2 * w)):
                s.set(x, y, bark[0])
        else:
            s.set(cx - w + 1 + r.randrange(2 * w - 1), y, bark[0])
    return m


def canopy(s, clusters, ramp, seed, light_dots=40):
    r = rng(seed)
    for cx, cy, rx, ry in clusters:
        m = {p for p in ellipse(cx, cy, rx, ry)
             if vnoise(p[0] * .45, p[1] * .45, seed + cx) > .14 or ((p[0] + .5 - cx) / rx) ** 2 + ((p[1] + .5 - cy) / ry) ** 2 < .72}
        s.shade(m, None, 'form', colors=ramp)
    for _ in range(light_dots):  # leaf sparkle on the lit upper-left
        x, y = r.randrange(s.w), r.randrange(s.h)
        c = s.get(x, y)
        if c[3] and sum(c[:3]) > sum(hx(ramp[3])[:3]) and x + y < s.w * .9:
            s.set(x, y, ramp[-1])
            if r.random() < .5:
                s.set(x + 1, y, ramp[-2])


def clusters_round(cx, top, w, h, r, n=8):
    out = [(cx, top + h * .3, w * .38, h * .3)]
    for i in range(n):
        a = i / n * math.tau + r.uniform(-.3, .3)
        out.append((cx + math.cos(a) * w * .3, top + h * .5 + math.sin(a) * h * .28, w * r.uniform(.2, .26), h * r.uniform(.2, .26)))
    out.append((cx, top + h * .58, w * .34, h * .26))
    # draw back (upper) clusters first so lower ones overlap them
    return sorted(out, key=lambda c: c[1])


def bare_branches(s, kind, cx, top, r, snow):
    bark = BARK.get(kind, BARK['oak'])
    tips = []

    def branch(x, y, ang, ln, depth):
        x2, y2 = x + math.cos(ang) * ln, y + math.sin(ang) * ln
        s.fill(line(round(x), round(y), round(x2), round(y2)), bark[1 if depth < 2 else 0])
        if depth < 3:
            s.fill(line(round(x) - 1, round(y), round(x2) - 1, round(y2)), bark[2])
        if depth >= 4:
            tips.append((round(x2), round(y2)))
            return
        for d in (-.5, .45):
            branch(x2, y2, ang + d + r.uniform(-.15, .15), ln * .72, depth + 1)

    branch(cx, top + 34, -math.pi / 2, 14, 1)
    branch(cx - 1, top + 40, -math.pi / 2 - .9, 12, 2)
    branch(cx + 1, top + 42, -math.pi / 2 + .9, 12, 2)
    if snow:
        for x, y in tips:
            s.set(x, y - 1, SNOW[3]); s.set(x + 1, y - 1, SNOW[4])


def tree(kind, season, v, fruit=False):
    W, H = 80, 116
    s = Canvas(W, H)
    r = rng(hash((kind, season, v)) & 0xffff)
    cx, base = 40, H - 6
    ground_shadow(s, cx + 2, base, 22, 5)
    winter_bare = season == 3 and kind not in ('pine', 'palm')
    blossom, fruit_col = FRUIT_TREES.get(kind, (None, None))
    leaf_kind = kind if kind in LEAF else 'oak'

    if kind in ('pine', 'stonepine', 'frostwood'):
        trunk(s, 'birch' if kind == 'frostwood' else 'oak', cx, base, base - 22, 3, r)
        ramp = LEAF[kind][season]
        for i, (y0, hw) in enumerate(((10, 14), (26, 20), (44, 26), (62, 30))):  # tiers, top first
            m = poly([(cx, y0 - 6), (cx + hw, y0 + 26), (cx + hw * .5, y0 + 23), (cx, y0 + 28), (cx - hw * .5, y0 + 23), (cx - hw, y0 + 26)])
            s.shade(m, None, 'form', colors=ramp)
            for k in range(-hw + 4, hw - 3, 5):  # needle notches on the tier hem
                s.set(cx + k, y0 + 24 + (k // 5) % 2, ramp[0])
            if season == 3 or kind == 'stonepine':
                s.shade({p for p in m if p[1] < y0 + 4 + abs(p[0] - cx) * .55}, None, 'form', colors=SNOW)
            if kind == 'frostwood':  # icicle tips on every tier
                for k in range(-hw + 3, hw - 2, 6):
                    s.fill({(cx + k, y0 + 25 + j) for j in range(3)}, '#ffffff')
    elif kind in ('dead', 'charwood') or winter_bare:
        trunk(s, kind, cx, base, base - 52, 4, r)
        bare_branches(s, kind, cx, base - 88, r, season == 3 and kind != 'charwood')
        if kind == 'charwood':  # embers still glowing in the cracks
            for _ in range(14):
                x, y = r.randrange(cx - 20, cx + 20), r.randrange(base - 90, base - 4)
                if s.get(x, y)[3]:
                    s.set(x, y, '#ff8a2a'); s.set(x, y - 1, '#ffd060')
        if season == 3:
            s.fill({(x, base - 52) for x in range(cx - 3, cx + 4)}, SNOW[3])
    elif kind == 'palm':
        for i in range(12):
            t = i / 12
            x = cx + math.sin(t * 2.4) * 8 * (-1 if v else 1)
            s.shade(rect(round(x) - 3, round(base - 4 - t * 70), 7, 7), None, 'cyl', colors=BARK['palm'][:4])
        tx, ty = cx + math.sin(2.4) * 8 * (-1 if v else 1), base - 76
        ramp = LEAF['oak'][1]
        for a in range(0, 360, 45):
            ra = math.radians(a + 20)
            pts = [(tx, ty), (tx + math.cos(ra) * 30, ty + math.sin(ra) * 14 + 8), (tx + math.cos(ra + .25) * 18, ty + math.sin(ra + .25) * 8 + 4)]
            s.shade(poly(pts), None, 'form', colors=ramp[:5])
    else:
        trunk(s, kind if kind in BARK else 'oak', cx, base, base - 40, 4, r)
        if kind == 'mangrove':  # arching stilt roots
            for d in (-1, 1):
                for k in range(2):
                    x0 = cx + d * (6 + k * 6)
                    s.fill(line(cx + d * 2, base - 18 - k * 6, x0, base) | line(cx + d * 3, base - 18 - k * 6, x0 + d, base), BARK['mangrove'][1 + k])
        ramp = LEAF[leaf_kind][season] if season < 3 else LEAF[leaf_kind][1]
        if blossom and season == 0:
            ramp = blossom
        cl = clusters_round(cx + r.uniform(-2, 2), 6, 68, 80, r)
        canopy(s, cl, ramp, hash((kind, season, v)) & 0xfff)
        if fruit and fruit_col:
            fr = [c for c in (hx(fruit_col),)][0]
            dark = tuple(int(c * .55) for c in fr[:3]) + (255,)
            for _ in range(11):
                x, y = r.randrange(16, 64), r.randrange(18, 70)
                if s.get(x, y)[3] and s.get(x, y + 2)[3]:
                    s.fill(rect(x, y, 3, 3), fr); s.set(x + 2, y + 2, dark); s.set(x, y, '#ffffff')
    s.outline()
    if v and kind != 'palm':
        s.img = s.img.transpose(0)  # FLIP_LEFT_RIGHT
        s.px = s.img.load()
    return s


# ---- rocks ---------------------------------------------------------------
def ramp_of(base):
    from px import ramp
    return [c for c in ramp(base, 5, 10)[0]]


def rock(base, ore=None, big=False, seed=1):
    W = 64 if big else 32
    s = Canvas(W, W)
    r = rng(seed * 31 + W)
    cx, cy = W / 2, (40 if big else 21)
    rx, ry = (26, 20) if big else (13, 10)
    ground_shadow(s, cx + 1, cy + ry * .7, rx * 1.05, ry * .45)
    n = 9
    pts = []
    for i in range(n):
        a = i / n * math.tau - math.pi / 2
        k = r.uniform(.82, 1.0)
        y = cy + math.sin(a) * ry * k
        pts.append((cx + math.cos(a) * rx * k, min(y, cy + ry * .62)))  # flat bottom
    m = poly(pts)
    s.shade(m, None, 'form', colors=ramp_of(base))
    # facets: a lit top plane and a couple of cracks
    top = {p for p in m if p[1] < cy - ry * .25 and vnoise(p[0] * .3, p[1] * .3, seed) > .3}
    s.fill(top, ramp_of(base)[3])
    for _ in range(3 if big else 2):
        x0, y0 = r.randrange(int(cx - rx * .5), int(cx + rx * .5)), r.randrange(int(cy - ry * .3), int(cy + ry * .3))
        s.fill(line(x0, y0, x0 + r.randrange(2, 5), y0 + r.randrange(2, 4)) & m, ramp_of(base)[0])
    if ore:
        oc = ramp_of(ore)
        for _ in range(7 if big else 4):
            x, y = r.randrange(int(cx - rx * .6), int(cx + rx * .6)), r.randrange(int(cy - ry * .5), int(cy + ry * .4))
            if (x, y) in m:
                s.fill({(x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)} & m, oc[2]); s.set(x, y, oc[4]); s.set(x + 1, y + 1, oc[0])
    s.outline()
    return s


ORES = {'cobalt': '#3a7aff', 'tide': '#2ae8c8', 'rime': '#c8f4ff', 'cinder': '#ff3a0a', 'copper': '#ef8a3e', 'iron': '#e2c2b0', 'silver': '#f4f8fc', 'gold': '#ffd040', 'mythril': '#4fe8cc', 'frost': '#9fdcff',
        'obsidian': '#a87aff', 'adamant': '#ff5a8a', 'coal': '#2a2624', 'gem': '#c86aff', 'star': '#fff6a8'}


def _trees():
    out = {}
    for kind in ('oak', 'maple', 'birch', 'pine', 'dead', 'palm', 'stonepine', 'frostwood', 'charwood', 'mangrove'):
        for s_ in range(4):
            for v in (0, 1):
                out[f'tree_{kind}_{s_}_{v}'] = (lambda k=kind, a=s_, b=v: tree(k, a, b))
    for kind in FRUIT_TREES:
        for s_ in range(4):
            out[f'tree_{kind}_{s_}_0'] = (lambda k=kind, a=s_: tree(k, a, 0))
            out[f'tree_{kind}_{s_}_f'] = (lambda k=kind, a=s_: tree(k, a, 0, True))
    return out


SPRITES = {
    **_trees(),
    'rock': lambda: rock('#a8a196', seed=3),
    'rockS': lambda: rock('#d6e0ea', seed=4),
    'rockA': lambda: rock('#6a5e58', seed=5),
    'rockC': lambda: rock('#8a7462', seed=6),
    'boulder': lambda: rock('#a09888', big=True, seed=11),
    'obsboulder': lambda: rock('#3e3250', '#a87aff', True, 13),
    **{f'ore_{k}': (lambda k=k, c=c: rock({'obsidian': '#4a3d58', 'frost': '#b4c8d8', 'rime': '#7a9ab8', 'cinder': '#2e2628', 'tide': '#6a7a78', 'cobalt': '#6a6a74'}.get(k, '#8e867a'), c, False, len(k))) for k, c in ORES.items()},
}
