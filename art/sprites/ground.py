"""Seamless 64x64 ground textures (2x2 tiles) for every terrain kind.

Named ground_<key>_<season> where key matches paintKey() in the game
(g, sn, d, s, a, st, p, i, w, l, f) plus cave themes ground_c_<theme> and
walls ground_xw_<theme>. Season only varies for grass (g).
Light comes from the top-left; all noise wraps at 64px so tiles repeat cleanly.
"""
import math
from px import Canvas, _h, rng

N = 64
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def pnoise(x, y, cell, s):
    """Value noise that tiles every N pixels (cell must divide N)."""
    p = N // cell
    gx, gy = x / cell, y / cell
    xi, yi = math.floor(gx), math.floor(gy)
    xf, yf = gx - xi, gy - yi
    u, v = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf)
    h = lambda a, b: _h(a % p, b % p, s)
    top = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * u
    bot = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * u
    return top + (bot - top) * v


def pfbm(x, y, s):
    return (pnoise(x, y, 16, s) * .6 + pnoise(x, y, 8, s + 7) * .3 + pnoise(x, y, 4, s + 13) * .1)


def wrap_set(c, x, y, col):
    c.set(x % N, y % N, col)


def mottled(pal, seed, spread=3.2):
    """Base fill: 3-4 tones in soft dithered patches."""
    c = Canvas(N, N)
    for y in range(N):
        for x in range(N):
            n = pfbm(x, y, seed) * spread + (BAYER[y % 4][x % 4] / 16 - .5) * .5
            c.set(x, y, pal[max(0, min(len(pal) - 1, int(n)))])
    return c


GRASS = [  # dark, base-, base, light, tuft dark, tuft light
    ['#4f8a34', '#62a03e', '#74b048', '#8cc256', '#3e7428', '#a8d46c'],
    ['#46802e', '#589638', '#6aa642', '#80b84e', '#36681f', '#9cc862'],
    ['#8a7a34', '#a08c3c', '#b49e48', '#c8b45a', '#6e5e26', '#dcc874'],
    ['#b8c8da', '#d0dcea', '#e4ecf4', '#f4f8fc', '#9aaec6', '#ffffff'],
]


def grass(season):
    G = GRASS[season]
    c = mottled(G[:4], 3 + season, 3.4)
    r = rng(40 + season)
    if season == 3:  # snow: soft drifts + sparkle
        for _ in range(26):
            x, y = r.randrange(N), r.randrange(N)
            for k in range(r.randrange(3, 7)):
                wrap_set(c, x + k, y, G[3])
            wrap_set(c, x, y + 1, G[1])
        for _ in range(10):
            wrap_set(c, r.randrange(N), r.randrange(N), G[5])
        return c
    for _ in range(46):  # tufts: little V of blades with a lit tip
        x, y = r.randrange(N), r.randrange(N)
        for dx, dy in ((-1, 0), (1, 0), (0, 1), (-2, -1), (2, -1)):
            wrap_set(c, x + dx, y + dy, G[4])
        wrap_set(c, x - 1, y - 1, G[5])
    if season < 2:
        for _ in range(5):  # flowers
            x, y = r.randrange(N), r.randrange(N)
            col = r.choice(['#fff6dc', '#fff3a0', '#ffb8d0', '#c8b8ff'])
            for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
                wrap_set(c, x + dx, y + dy, col)
            wrap_set(c, x, y, '#f2b830'); wrap_set(c, x, y + 2, G[4])
    else:
        for _ in range(8):  # fallen leaves
            x, y = r.randrange(N), r.randrange(N)
            col = r.choice(['#c8682a', '#e0903a', '#9a4422'])
            wrap_set(c, x, y, col); wrap_set(c, x + 1, y, col); wrap_set(c, x + 1, y + 1, '#6a3a18')
    return c


def speckled(pal, seed, specks=90, pebbles=0, extra=None):
    """Dirt / sand / ash / cave floors: mottled base, specks, a few pebbles."""
    c = mottled(pal[:3], seed, 2.6)
    r = rng(seed * 3)
    for _ in range(specks):
        x, y = r.randrange(N), r.randrange(N)
        wrap_set(c, x, y, pal[3] if r.random() < .5 else pal[0])
    for _ in range(pebbles):
        x, y = r.randrange(N), r.randrange(N)
        wrap_set(c, x, y, pal[4]); wrap_set(c, x + 1, y, pal[4]); wrap_set(c, x, y + 1, pal[0]); wrap_set(c, x + 1, y + 1, pal[0])
        wrap_set(c, x, y, pal[5] if len(pal) > 5 else pal[3])  # lit top-left of the pebble
    if extra:
        extra(c, r)
    return c


def cobble(pal, seed, cw=9, chh=7):
    """Irregular cobbles: wrapped voronoi with mortar gaps and lit top edges."""
    r = rng(seed)
    seeds = []
    for gy in range(N // chh + 1):
        for gx in range(N // cw + 1):
            seeds.append(((gx * cw + (gy % 2) * cw / 2 + r.uniform(1, cw - 1)) % N, (gy * chh + r.uniform(1, chh - 1)) % N, r.random()))
    cell = {}
    for y in range(N):
        for x in range(N):
            ds = sorted((min(abs(x + .5 - sx), N - abs(x + .5 - sx)) ** 2 + (min(abs(y + .5 - sy), N - abs(y + .5 - sy)) * 1.25) ** 2, i) for i, (sx, sy, _) in enumerate(seeds))[:2]
            cell[x, y] = ds[0][1] if math.sqrt(ds[1][0]) - math.sqrt(ds[0][0]) > 1.1 else None
    c = Canvas(N, N)
    for y in range(N):
        for x in range(N):
            k = cell[x, y]
            if k is None:
                c.set(x, y, pal[0]); continue
            tone = pal[1 + int(seeds[k][2] * 3)]
            if cell[x, (y - 1) % N] is None:
                tone = pal[4]
            elif cell[x, (y + 1) % N] is None:
                tone = pal[1]
            c.set(x, y, tone)
    return c


def rocky(pal, seed):
    """Natural stony ground: mottled rock, hairline cracks, embedded pebbles (not paving)."""
    c = mottled(pal[1:4], seed, 2.8)
    r = rng(seed * 5)
    for _ in range(9):  # cracks wander a few pixels
        x, y = r.randrange(N), r.randrange(N)
        for k in range(r.randrange(4, 10)):
            wrap_set(c, x, y, pal[0]); x += r.choice((-1, 0, 1)); y += r.choice((0, 1))
    for _ in range(16):  # pebbles: lit top-left, shaded bottom-right
        x, y = r.randrange(N), r.randrange(N)
        wrap_set(c, x, y, pal[4]); wrap_set(c, x + 1, y, pal[3]); wrap_set(c, x, y + 1, pal[2]); wrap_set(c, x + 1, y + 1, pal[0])
    for _ in range(6):  # a few tufts of hardy grass
        x, y = r.randrange(N), r.randrange(N)
        wrap_set(c, x, y, '#6a8a40'); wrap_set(c, x + 1, y - 1, '#8aa850'); wrap_set(c, x - 1, y - 1, '#5a7a38')
    return c


def water():
    pal = ['#2c6a98', '#3a80b2', '#4a92c4', '#5aa8d2']
    c = mottled(pal, 71, 3.6)
    r = rng(72)
    for _ in range(18):  # ripple glints
        x, y = r.randrange(N), r.randrange(N)
        for k in range(r.randrange(3, 6)):
            wrap_set(c, x + k, y, '#9fd4ee')
        wrap_set(c, x + 1, y + 1, '#2c6a98')
    return c


def lava():
    c = mottled(['#8a2a12', '#c2441c', '#e2662a', '#f29a3a'], 81, 3.8)
    r = rng(82)
    for _ in range(24):
        x, y = r.randrange(N), r.randrange(N)
        for k in range(r.randrange(2, 6)):
            wrap_set(c, x + k, y + (k // 2) % 2, '#ffd36a')
    return c


def ice():
    c = mottled(['#88bcd8', '#a9d4ea', '#cdeaf6', '#e2f4fc'], 91, 3)
    r = rng(92)
    for _ in range(9):  # cracks
        x, y = r.randrange(N), r.randrange(N)
        for k in range(r.randrange(4, 9)):
            x += r.choice((-1, 0, 1)); y += 1
            wrap_set(c, x, y, '#7fa8c4')
    for _ in range(10):
        x, y = r.randrange(N), r.randrange(N)
        wrap_set(c, x, y, '#ffffff'); wrap_set(c, x + 1, y, '#f2fbff')
    return c


def planks():
    pal = ['#5a3820', '#9e6c40', '#b07c4c', '#c08a56', '#d8a874']
    c = Canvas(N, N)
    r = rng(5)
    for y in range(N):
        row = y // 8
        for x in range(N):
            seam = y % 8 == 7 or (x + row * 19) % 32 == 0
            grain = pnoise(x, y * 4, 8, row) > .72
            col = pal[0] if seam else pal[1] if grain else pal[2 + (row % 2)]
            if not seam and y % 8 == 0:
                col = pal[4]
            c.set(x, y, col)
    for _ in range(6):  # nail heads
        x, y = r.randrange(N), r.randrange(8) * 8 + 3
        c.set(x, y, '#3a2a20')
    return c


def flagstones():
    """Castle flagstones: squared slabs in staggered courses with dark grout, a lit top-left edge on each slab,
    a little tone variation from slab to slab and the odd hairline crack."""
    pal = ['#4e4840', '#7e766a', '#8e8678', '#9c9484', '#b4ac9a']
    c = Canvas(N, N)
    r = rng(17)
    for y in range(N):
        row = y // 16
        for x in range(N):
            sx = (x + (8 if row % 2 else 0)) % N
            gx, gy = sx % 16, y % 16
            slab = (sx // 16 + row * 5) % 7
            if gx == 15 or gy == 15:
                col = pal[0]
            elif gy == 0 or gx == 0:
                col = pal[4] if slab % 3 else pal[3]
            else:
                col = pal[2 + (slab % 2)] if (x * 7 + y * 3) % 23 else pal[1]
            c.set(x, y, col)
    for _ in range(5):  # hairline cracks
        x, y = r.randrange(N), r.randrange(N)
        for k in range(r.randrange(3, 7)):
            c.set((x + k) % N, (y + (k // 2)) % N, pal[1])
    return c


def marble():
    """A chequered marble floor for the halls: cream and dove-grey squares with faint veins and fine grout."""
    a = ['#d8d0c4', '#e8e2d6', '#f4f0e6']
    b = ['#9c9490', '#aaa29c', '#bab2aa']
    c = Canvas(N, N)
    for y in range(N):
        for x in range(N):
            light = ((x // 16) + (y // 16)) % 2 == 0
            P = a if light else b
            gx, gy = x % 16, y % 16
            if gx == 15 or gy == 15:
                col = '#7e7670'
            else:
                vein = abs(((x * 3 + y * 2) % 29) - 14) == 0 or abs(((x * 2 - y * 3) % 37) - 18) == 0
                col = P[0] if vein else P[2] if gx < 2 or gy < 2 else P[1]
            c.set(x, y, col)
    return c


CAVE = {'earth': ['#4e3a2a', '#6e5238', '#8f6e50', '#a8865f', '#b89870'],
        'ice': ['#5a7290', '#8aa4ba', '#a9bfd1', '#c8dae8', '#e2eef6'],
        'magma': ['#2e1a14', '#4a2e26', '#664236', '#7e5444', '#ff8a3a'],
        'void': ['#1e1830', '#382d4c', '#4a3d60', '#5e507a', '#9a7ad8']}


def cave_wall(pal):
    c = cobble([pal[0], pal[0], pal[1], pal[1], pal[2]], 61, 12, 9)
    return c


# ---- seasonal versions of the bare ground (summer is the base texture) ----
LEAVES = ['#c8452f', '#d9822b', '#e8b040', '#8a4a22', '#b05a24']
SNOW = ['#c8d6e6', '#dde7f2', '#eef3f8', '#ffffff']


def seasonal(base_fn, key, season):
    c = base_fn()
    r = rng(91 + season * 13 + len(key))
    if season == 3:  # snow over most of it; stones and ruts show through
        cover = {'d': .4, 'p': .5, 'st': .5, 's': .62}.get(key, .45)
        for y in range(N):
            for x in range(N):
                n = pfbm(x, y, 400 + len(key)) + (BAYER[y % 4][x % 4] / 16 - .5) * .12
                if n > cover:
                    up = pfbm(x, (y - 1) % N, 400 + len(key)) > cover
                    c.set(x, y, SNOW[2] if up else SNOW[3])
                    if pfbm(x, (y + 1) % N, 400 + len(key)) <= cover:
                        c.set(x, y, SNOW[0])  # the drift's shaded lower edge
                    elif n > cover + .2:
                        c.set(x, y, SNOW[1] if BAYER[y % 4][x % 4] > 13 else SNOW[3])  # a few soft blue specks in deep snow
    elif season == 2:  # leaf litter
        for _ in range({'d': 46, 'p': 30, 'st': 22, 's': 8}.get(key, 30)):
            x, y, col = r.randrange(N), r.randrange(N), r.choice(LEAVES)
            wrap_set(c, x, y, col); wrap_set(c, x + 1, y, col)
            if r.random() < .5:
                wrap_set(c, x, y + 1, col)
            wrap_set(c, x + 1, y + 1, '#5a3418')
    elif season == 0:  # sprouts and blossom petals blown across
        for _ in range({'d': 30, 'p': 18, 'st': 10, 's': 6}.get(key, 18)):
            x, y = r.randrange(N), r.randrange(N)
            if r.random() < .6:
                wrap_set(c, x, y, '#6ab04a'); wrap_set(c, x, y - 1, '#8cc256')
            else:
                wrap_set(c, x, y, r.choice(['#ffc8d8', '#fff0f4', '#ffd8e8']))
    return c


BASES = {'d': lambda: speckled(['#9a764a', '#b9925e', '#d6b17c', '#ecd2a2', '#a89a86', '#cfc4b0'], 21, 90, 6),
         's': lambda: speckled(['#c4ab70', '#dcc68c', '#f0dfae', '#fff3cf', '#e8d0b8', '#f6d0c4'], 22, 70, 3),
         'st': lambda: rocky(['#6a6254', '#8a8070', '#9c927f', '#aaa08c', '#c8bfae'], 24),
         'p': lambda: cobble(['#5e5648', '#8a8070', '#a89e8c', '#b8ae9a', '#d4cab6'], 25)}


def _all():
    out = {}
    for s in range(4):
        out[f'ground_g_{s}'] = (lambda s=s: grass(s))
    out['ground_sn'] = lambda: grass(3)
    out['ground_d'] = lambda: speckled(['#9a764a', '#b9925e', '#d6b17c', '#ecd2a2', '#a89a86', '#cfc4b0'], 21, 90, 6)
    out['ground_s'] = lambda: speckled(['#c4ab70', '#dcc68c', '#f0dfae', '#fff3cf', '#e8d0b8', '#f6d0c4'], 22, 70, 3)
    out['ground_a'] = lambda: speckled(['#463c36', '#5a4f48', '#6e625a', '#8a7d73', '#ff9a4a'], 23, 60, 4)
    out['ground_st'] = lambda: rocky(['#6a6254', '#8a8070', '#9c927f', '#aaa08c', '#c8bfae'], 24)  # natural rock, not paving
    out['ground_p'] = lambda: cobble(['#5e5648', '#8a8070', '#a89e8c', '#b8ae9a', '#d4cab6'], 25)
    out['ground_i'] = ice
    out['ground_w'] = water
    out['ground_l'] = lava
    out['ground_f'] = planks
    out['ground_fl'] = flagstones
    out['ground_mb'] = marble
    for th, pal in CAVE.items():
        out[f'ground_c_{th}'] = (lambda pal=pal, th=th: speckled(pal, 30 + len(th), 80, 5))
        out[f'ground_xw_{th}'] = (lambda pal=pal: cave_wall(pal))
    for k, fn in BASES.items():
        for se in (0, 2, 3):
            out[f'ground_{k}_{se}'] = (lambda fn=fn, k=k, se=se: seasonal(fn, k, se))
    return out


SPRITES = _all()
