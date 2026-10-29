"""Outdoor props: everything in SPR that isn't a tree, rock or building.

Sizes are the painted sprite sizes x2 (world units -> art px), bottom-aligned on the
tile. Arrays in the game (seasons, frames) are packed as name.i or name_s.i and
rebuilt in h_pixel.js. Light from the top-left, selective outlines.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng, vnoise, hx

WOOD = ['#3a2218', '#5a3622', '#7a4c2c', '#9a6638', '#b88450']
LWOOD = ['#5a3a22', '#8a5a34', '#b07c4c', '#c8985e', '#e0b47a']
IRON = ['#1e1e2a', '#2e3040', '#454a5c', '#6a7084', '#9aa2b4']
STONE = ['#4a4640', '#6a645a', '#8a8478', '#aaa498', '#ccc6b8']
FIRE = ['#a8301a', '#e0602a', '#f29a32', '#ffd25a', '#fff4c0']
LEAF = [['#2c5a2a', '#3e7a30', '#5a9a38', '#7cb444', '#a2cc58'], ['#24502a', '#336e2e', '#4a8a34', '#68a63c', '#8cc04c'],
        ['#6a4a18', '#9a6a22', '#c8902a', '#e0b03a', '#f0cc50'], ['#5a6a6a', '#7a8a86', '#9aa8a4', '#c8d4d4', '#f2f6fa']]


def cv(w, h):
    return Canvas(w, h)


def shadow(s, cx, cy, rx, ry):
    for x, y in ellipse(cx, cy, rx, ry):
        d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2
        if (d < .6 or (x + y) % 2 == 0) and not s.get(x, y)[3]:
            s.px[x, y] = (24, 30, 14, 90)


def done(s):
    s.outline()
    return s


def ramp(base, n=5):
    from px import ramp as r
    return r(base, n, 12)[0]


# ---- plants ----------------------------------------------------------------
def blades(s, cx, base, n, h, pal, seed, bend=0.0, spread=10):
    r = rng(seed)
    for i in range(n):
        x0 = cx + r.uniform(-spread / 2, spread / 2)
        hh = h * r.uniform(.6, 1)
        b = r.uniform(-2, 2) + bend
        for k in range(int(hh)):
            t = k / hh
            x = round(x0 + b * t * t)
            col = pal[1] if t < .3 else pal[2] if t < .7 else pal[3]
            s.set(x, base - k, col)
            if t < .5:
                s.set(x + 1, base - k, pal[0])


def tgrass(season, f):
    s = cv(32, 36)
    pal = LEAF[season] if season < 3 else ['#5a6a5a', '#7a8a7a', '#9aa894', '#c0ccc0', '#e2eae2']
    blades(s, 16, 34, 16, 22, pal, 42, (f - 1) * 3, 22)
    return done(s)


def weed(season):
    s = cv(32, 32)
    pal = [LEAF[0], LEAF[1], ['#4a3a14', '#7a6a24', '#a08a3a', '#c0aa54', '#dcc878'], ['#4a4a44', '#6a6a62', '#8a8a7a', '#a8a898', '#c8c8b8']][season]
    shadow(s, 16, 29, 9, 2.5)
    for k, a in enumerate((-2.0, -2.5, -.8, -1.4, -2.9, -1.1)):
        L = 12 - (k % 3) * 2
        tip = (16 + math.cos(a) * L, 28 + math.sin(a) * L)
        s.shade(poly([(16, 28), (tip[0] - 2, tip[1] + 2), tip, (tip[0] + 2, tip[1] + 2)]), None, 'form', colors=pal[:4])
    return done(s)


def bush(season, ripe):
    s = cv(40, 36)
    pal = LEAF[season]
    shadow(s, 20, 32, 16, 3.5)
    for cx, cy, rx, ry in ((12, 20, 9, 8), (28, 20, 9, 8), (20, 14, 11, 9), (20, 23, 12, 8)):
        s.shade(ellipse(cx, cy, rx, ry), None, 'form', colors=pal)
    r = rng(7 + season)
    for _ in range(14):
        x, y = r.randrange(6, 34), r.randrange(6, 28)
        if s.get(x, y)[3] and x + y < 34:
            s.set(x, y, pal[4])
    if ripe:
        for _ in range(8):
            x, y = r.randrange(8, 32), r.randrange(10, 28)
            if s.get(x, y)[3]:
                s.fill({(x, y), (x + 1, y), (x, y + 1), (x + 1, y + 1)}, '#c8243a'); s.set(x, y, '#ff8a9a')
    return done(s)


def bramble():
    s = cv(36, 36)
    shadow(s, 18, 32, 15, 3)
    r = rng(3)
    for i in range(9):
        x, y = r.uniform(4, 32), 33.0
        for k in range(5):
            nx, ny = x + r.uniform(-5, 5), y - r.uniform(4, 7)
            s.fill(line(round(x), round(y), round(nx), round(ny)), '#5a3a2a' if i % 2 else '#7a4a34')
            if k > 1:
                s.set(round(nx) + 1, round(ny), '#c8a888')
            x, y = nx, ny
    for _ in range(10):
        x, y = r.randrange(6, 30), r.randrange(8, 28)
        s.fill({(x, y), (x + 1, y), (x, y + 1)}, '#4a7a30'); s.set(x, y, '#7aac48')
    return done(s)


def flower(a, b, vi):
    s = cv(32, 32)
    r = rng(vi + 2)
    for k in range(3):
        x, top = 9 + k * 7 + r.randrange(-1, 2), 12 + r.randrange(0, 6)
        s.fill(line(x, 28, x, top), '#3e7a30'); s.set(x + 1, top + 6, '#5a9a38'); s.set(x + 2, top + 5, '#5a9a38')
        for dx, dy in ((0, -2), (-2, 0), (2, 0), (0, 2), (-1, -1), (1, -1), (-1, 1), (1, 1)):
            s.set(x + dx, top + dy, a)
        s.set(x - 2, top + 1, b); s.set(x + 2, top + 1, b); s.set(x, top, '#f2b830')
    return done(s)


def cattail():
    s = cv(32, 32)
    for x, top in ((9, 6), (16, 3), (23, 8)):
        s.fill(line(x, 30, x, top + 8), '#4a7a30')
        s.shade(rect(x - 1, top, 3, 9), None, 'cyl', colors=['#3a2414', '#6a4228', '#8a5a34', '#a8743f'])
    for k in range(4):
        s.fill(line(5 + k * 7, 30, 3 + k * 7 + (k % 2) * 4, 18), '#5a9a38')
    return done(s)


def fern():
    s = cv(32, 32)
    for a in (-2.6, -2.0, -1.57, -1.1, -.5):
        L = 13
        x0, y0 = 16, 29
        for k in range(L):
            x, y = round(x0 + math.cos(a) * k), round(y0 + math.sin(a) * k)
            s.set(x, y, '#3e7a30')
            if k % 2 == 0 and k > 2:
                s.set(x - 1, y - 1, '#6aa840'); s.set(x + 1, y - 1, '#5a9a38')
    return done(s)


def mushroom():
    s = cv(32, 32)
    shadow(s, 16, 28, 8, 2)
    for cx, sz in ((12, 1.0), (21, .75)):
        s.shade(rect(round(cx - 2 * sz), round(28 - 9 * sz), round(4 * sz) + 1, round(9 * sz)), None, 'cyl', colors=['#c8b8a0', '#ece0cc', '#fff8ec'])
        cap = {p for p in ellipse(cx, 28 - 10 * sz, 7 * sz, 5 * sz) if p[1] < 28 - 9 * sz}
        s.shade(cap, None, 'form', colors=['#6a1414', '#a82a20', '#d8452a', '#f07a5a'])
        for d in (-3, 1, 3):
            s.set(round(cx + d * sz), round(28 - 12 * sz), '#fff8ec')
    return done(s)


def sapling(st):
    s = cv(32, 52)
    h = 12 + st * 10
    shadow(s, 16, 49, 7, 2)
    s.fill(line(16, 50, 16, 50 - h) | line(17, 50, 17, 50 - h), '#7a5030')
    for k in range(st + 2):
        y = 50 - h + 3 + k * 5
        for d in (-1, 1):
            s.shade(ellipse(16 + d * 5, y, 5, 2.5), None, 'form', colors=LEAF[1][1:])
    return done(s)


# ---- wood & stone ----------------------------------------------------------
def log():
    s = cv(64, 32)
    shadow(s, 32, 27, 30, 4)
    s.shade(rect(4, 8, 50, 18), None, 'cyl_side', colors=WOOD)
    for x in range(10, 50, 9):
        s.fill(line(x, 11, x + 2, 22), WOOD[1])
    s.shade(ellipse(55, 17, 6, 9), None, 'sphere', colors=['#8a6a40', '#c49a68', '#e8c890', '#f8e0b0'])
    s.fill(ellipse(55, 17, 3, 5) - ellipse(55, 17, 2, 4), '#a87a4a')
    s.fill({(20, 6), (21, 5), (22, 5)}, '#4a7a30')  # moss
    return done(s)


def stump():
    s = cv(32, 32)
    shadow(s, 16, 27, 13, 3.5)
    s.shade(poly([(5, 26), (7, 13), (25, 13), (27, 26)]), None, 'cyl', colors=WOOD)
    s.shade(ellipse(16, 13, 10, 4), None, 'sphere', colors=['#a8865a', '#d8b484', '#f0d0a0', '#fff0c8'])
    s.fill(ellipse(16, 13, 6, 2.4) - ellipse(16, 13, 5, 1.6), '#b89060'); s.set(16, 13, '#a07040')
    return done(s)


def twig():
    s = cv(32, 32)
    s.fill(line(6, 24, 26, 21) | line(14, 23, 17, 17) | line(20, 22, 24, 26), '#7a5030')
    s.fill(line(6, 23, 26, 20), '#a87a4a')
    return done(s)


def stone_small():
    s = cv(32, 32)
    shadow(s, 16, 25, 8, 2.5)
    s.shade(ellipse(16, 21, 7, 5), None, 'form', colors=STONE)
    return done(s)


def fence():
    s = cv(32, 36)
    for x in (4, 24):
        s.shade(rect(x, 4, 5, 30), None, 'cyl', colors=LWOOD)
        s.fill(rect(x, 4, 5, 1), LWOOD[4])
    for y in (11, 21):
        s.shade(rect(0, y, 32, 4), None, 'cyl_side', colors=LWOOD)
    return done(s)


def sign():
    s = cv(32, 44)
    shadow(s, 16, 41, 9, 2)
    s.shade(rect(14, 18, 4, 24), None, 'cyl', colors=WOOD)
    s.shade(rect(3, 4, 26, 16), None, 'form', colors=LWOOD[1:])
    for y in (9, 14):
        s.fill(rect(7, y, 18, 1), LWOOD[0])
    return done(s)


def grave():
    s = cv(32, 40)
    shadow(s, 16, 37, 11, 2.5)
    s.shade({p for p in rect(6, 8, 20, 28) if p[1] > 14 or ((p[0] + .5 - 16) / 10) ** 2 + ((p[1] - 15) / 7) ** 2 <= 1}, None, 'form', colors=STONE)
    s.fill(rect(15, 16, 2, 9) | rect(12, 19, 8, 2), STONE[1])
    s.fill({(8, 33), (9, 32), (23, 33), (24, 32)}, '#5a9a38')
    return done(s)


def statue():
    s = cv(36, 68)
    shadow(s, 18, 64, 14, 3)
    s.shade(rect(5, 52, 26, 12), None, 'form', colors=STONE)
    s.shade(poly([(10, 52), (12, 30), (24, 30), (26, 52)]), None, 'form', colors=STONE)
    s.shade(ellipse(18, 23, 6, 7), None, 'sphere', colors=STONE)
    s.shade(poly([(23, 32), (32, 14), (34, 16), (26, 36)]), None, 'form', colors=STONE[1:])  # raised arm + sword
    s.fill(line(33, 14, 33, 2), STONE[4])
    s.fill({(8, 58), (9, 57), (28, 59)}, '#5a8a3a')
    return done(s)


def ruinwall():
    s = cv(32, 60)
    shadow(s, 16, 57, 15, 2.5)
    top = [10, 6, 4, 8, 14, 12, 18, 16]
    for x in range(1, 31):
        t = top[x // 4]
        for y in range(t, 58):
            row = (y - t) // 6
            j = (y - t) % 6 == 5 or (x + row * 4) % 10 == 0
            s.set(x, y, STONE[0] if j else STONE[3] if (y - t) % 6 == 0 else STONE[2])
    r = rng(5)
    for _ in range(12):
        x, y = r.randrange(2, 30), r.randrange(10, 54)
        if s.get(x, y)[3]:
            s.set(x, y, '#5a8a3a')
    return done(s)


def shrine():
    s = cv(64, 84)
    shadow(s, 32, 80, 28, 4)
    s.shade(rect(4, 66, 56, 14), None, 'form', colors=STONE)
    for x in (10, 46):
        s.shade(rect(x, 22, 8, 46), None, 'cyl', colors=STONE)
    s.shade(poly([(2, 24), (32, 4), (62, 24), (60, 28), (4, 28)]), None, 'form', colors=['#5a3a2a', '#8a4a32', '#b0603a', '#d8804a'])
    s.shade(ellipse(32, 52, 8, 8), None, 'sphere', colors=['#8a4a10', '#e0782a', '#ffb050', '#fff0b0'])
    s.meta = {'light': [32, 52]}
    return done(s)


def altar():
    s = cv(64, 64)
    shadow(s, 32, 59, 28, 4)
    s.shade(rect(6, 34, 52, 24), None, 'form', colors=STONE)
    s.shade(rect(2, 28, 60, 8), None, 'form', colors=STONE[1:])
    for k in range(5):
        s.shade(ellipse(14 + k * 9, 24, 3, 3), None, 'sphere', colors=['#5a2a6a', '#8a4aaa', '#c88ae0', '#f0d0ff'])
    s.fill(rect(28, 40, 8, 10), '#e0782a'); s.fill(rect(30, 42, 4, 6), '#ffd25a')
    return done(s)


def well():
    s = cv(64, 76)
    shadow(s, 32, 72, 26, 4)
    for x in range(8, 56):
        for y in range(42, 70):
            row = (y - 42) // 5
            s.set(x, y, STONE[0] if (y - 42) % 5 == 4 or (x + row * 4) % 9 == 0 else STONE[2] if x > 28 else STONE[3])
    s.fill(ellipse(32, 42, 24, 7), STONE[3]); s.fill(ellipse(32, 42, 19, 5), '#1a2a3a'); s.fill(ellipse(32, 43, 15, 3), '#2a4a6a')
    for x in (10, 50):
        s.shade(rect(x, 12, 4, 32), None, 'cyl', colors=WOOD)
    s.shade(poly([(4, 14), (32, 2), (60, 14), (58, 18), (6, 18)]), None, 'form', colors=['#5a2a1a', '#8a3a28', '#b04a32', '#d06a4a'])
    s.fill(rect(14, 22, 36, 2), WOOD[2]); s.fill(line(32, 24, 32, 34), '#c8b890')
    s.shade(rect(28, 34, 8, 7), None, 'cyl', colors=WOOD)
    return done(s)


def tent():
    s = cv(64, 56)
    shadow(s, 32, 52, 30, 4)
    s.shade(poly([(32, 4), (62, 50), (2, 50)]), None, 'form', colors=['#5a4a2a', '#8a7a4a', '#b8a670', '#dccc98'])
    s.fill(poly([(32, 18), (42, 50), (22, 50)]), '#2a1e14')
    s.fill(line(32, 4, 32, 50), '#6a5a3a')
    return done(s)


def cart():
    s = cv(80, 68)
    shadow(s, 40, 64, 34, 4)
    s.shade(rect(8, 24, 60, 22), None, 'form', colors=LWOOD)
    for x in range(12, 66, 8):
        s.fill(rect(x, 24, 1, 22), LWOOD[0])
    s.shade(poly([(10, 24), (20, 10), (60, 10), (68, 24)]), None, 'form', colors=['#7a6a5a', '#a89a84', '#d0c4ac', '#ece2cc'])  # cover
    for cx in (20, 56):
        s.fill(ellipse(cx, 52, 10, 10), WOOD[0]); s.fill(ellipse(cx, 52, 8, 8), WOOD[2]); s.fill(ellipse(cx, 52, 2, 2), IRON[2])
        for a in range(0, 360, 60):
            s.fill(line(cx, 52, round(cx + math.cos(math.radians(a)) * 7), round(52 + math.sin(math.radians(a)) * 7)), WOOD[1])
    s.fill(line(68, 40, 78, 46), WOOD[2])
    return done(s)


def wreck():
    s = cv(128, 84)
    shadow(s, 64, 78, 58, 5)
    s.shade(poly([(6, 50), (20, 76), (108, 76), (124, 46), (110, 56), (16, 58)]), None, 'form', colors=WOOD)
    for x in range(14, 116, 10):
        s.fill(line(x, 58, x + 4, 76), WOOD[1])
    s.shade(rect(60, 6, 5, 52), None, 'cyl', colors=WOOD)
    s.shade(poly([(66, 10), (98, 22), (66, 40)]), None, 'form', colors=['#6a5a4a', '#a89880', '#d0c0a4', '#ece0c8'])
    s.fill({(30, 66), (31, 65), (90, 70)}, '#5a8a3a')
    return done(s)


def cave():
    s = cv(64, 60)
    shadow(s, 32, 56, 30, 3)
    hill = {(x, y) for x in range(64) for y in range(60) if ((x + .5 - 32) / 32) ** 2 + ((y + .5 - 60) / 58) ** 2 <= 1}
    s.shade(hill, None, 'form', colors=['#4a4036', '#6a5e4e', '#8c7e68', '#b0a28a', '#c8bca4'])
    s.fill({(x, y) for x in range(16, 48) for y in range(28, 60) if y > 40 or ((x + .5 - 32) / 16) ** 2 + ((y - 40) / 12) ** 2 <= 1}, '#140c08')
    return done(s)


def campfire(f):
    s = cv(32, 36)
    shadow(s, 16, 32, 12, 3)
    for k in range(7):
        a = k / 7 * math.tau
        s.shade(ellipse(16 + math.cos(a) * 9, 29 + math.sin(a) * 3, 3, 2), None, 'sphere', colors=STONE[1:])
    s.fill(line(8, 30, 24, 26) | line(8, 26, 24, 30), WOOD[2])
    r = rng(f + 1)
    flame = {(x, y) for x in range(10, 23) for y in range(8, 29) if abs(x - 16) < (29 - y) * .45 + 1 and r.random() < .9}
    for x, y in flame:
        heat = 1 - (29 - y) / 22 + r.uniform(-.25, .25) - abs(x - 16) / 10
        s.set(x, y + (f % 2), FIRE[max(0, min(4, int(heat * 5)))])
    s.meta = {'light': [16, 22]}
    return done(s)


def fairy(f):
    s = cv(36, 32)
    for d in (-1, 1):
        wing = ellipse(18 + d * 7, 12 + (f * 3), 7, 4)
        s.fill(wing, '#d8f0ff'); s.fill(wing - ellipse(18 + d * 7, 12 + (f * 3), 5, 2.5), '#a8d8f8')
    s.shade(ellipse(18, 16, 3, 5), None, 'form', colors=['#c84a8a', '#f07ab0', '#ffc8e0'])
    s.shade(ellipse(18, 9, 3, 3), None, 'sphere', colors=['#e0a880', '#f6d0ac', '#fff0e0'])
    s.meta = {'light': [18, 14]}
    return done(s)


def chest(opened):
    s = cv(32, 32)
    shadow(s, 16, 29, 13, 3)
    s.shade(rect(4, 14, 24, 14), None, 'form', colors=WOOD)
    if opened:
        s.shade(rect(4, 6, 24, 6), None, 'form', colors=WOOD[1:])
        s.fill(rect(6, 12, 20, 4), '#1a0e0a'); s.fill({(10, 13), (14, 12), (19, 13)}, '#f2c040')
    else:
        s.shade({p for p in rect(4, 6, 24, 9) if ((p[1] - 15) / 9) ** 2 + ((p[0] + .5 - 16) / 13) ** 2 <= 1.15}, None, 'form', colors=WOOD[1:])
    s.fill(rect(4, 14, 24, 2) | rect(9, 6, 2, 22) | rect(21, 6, 2, 22), IRON[2])
    s.fill(rect(14, 16, 4, 5), '#d8b048'); s.set(15, 18, '#2a1a10')
    return done(s)


def page():
    s = cv(32, 32)
    shadow(s, 16, 27, 9, 2)
    s.shade(poly([(8, 8), (24, 6), (25, 25), (9, 26)]), None, 'form', colors=['#a8987e', '#d8caa8', '#f0e6cc', '#fff8e8'])
    for y in range(11, 24, 3):
        s.fill(line(11, y, 21, y - 1), '#8a7a5a')
    return done(s)


def shard():
    s = cv(32, 32)
    s.shade(poly([(16, 4), (22, 14), (18, 28), (12, 22), (10, 12)]), None, 'form', colors=['#a84a10', '#e0782a', '#ffb050', '#ffe08a', '#fff8d0'])
    s.meta = {'light': [16, 16]}
    return done(s)


def dig(f):
    s = cv(32, 32)
    s.fill(ellipse(16, 22, 9, 4), '#7a5a3a'); s.fill(ellipse(16, 21, 7, 3), '#9a764a')
    for k in range(3):
        x = 10 + k * 6
        s.fill(rect(x, 14 - (k + f) % 2 * 2, 2, 5), '#4a3424')
    return done(s)


def crystalnode():
    s = cv(32, 36)
    shadow(s, 16, 33, 11, 2.5)
    for cx, h, w in ((10, 18, 4), (17, 26, 5), (23, 16, 4)):
        s.shade(poly([(cx - w, 32), (cx - w, 32 - h + w), (cx, 32 - h), (cx + w, 32 - h + w), (cx + w, 32)]), None, 'form', colors=['#2a6a8a', '#4aa8c8', '#8ad8f0', '#d8f8ff'])
    s.meta = {'light': [16, 20]}
    return done(s)


def shell():
    s = cv(32, 32)
    shadow(s, 16, 25, 8, 2)
    m = {p for p in ellipse(16, 20, 8, 6) if p[1] < 24}
    s.shade(m, None, 'form', colors=['#c8987e', '#ecc0a8', '#fde0cc', '#fff4ec'])
    for k in range(-3, 4, 2):
        s.fill(line(16, 24, 16 + k * 2, 15), '#d8a890')
    return done(s)


def bin_():
    s = cv(32, 32)
    shadow(s, 16, 29, 13, 3)
    s.shade(rect(4, 10, 24, 18), None, 'form', colors=LWOOD)
    s.shade(rect(3, 6, 26, 5), None, 'form', colors=WOOD[1:])
    s.fill(rect(12, 14, 8, 6), '#f2c040'); s.fill(rect(14, 16, 4, 2), '#a87a20')
    return done(s)


def sprinkler(body, top):
    s = cv(32, 32)
    shadow(s, 16, 27, 9, 2.5)
    s.fill(ellipse(16, 25, 8, 3), '#6a6a6a')
    s.shade(rect(12, 12, 8, 13), None, 'cyl', colors=ramp(body, 4))
    s.shade(ellipse(16, 11, 6, 3), None, 'sphere', colors=ramp(top, 4))
    return done(s)


def scarecrow():
    s = cv(36, 60)
    shadow(s, 18, 57, 10, 2.5)
    s.fill(rect(17, 18, 3, 40), WOOD[2]); s.fill(rect(4, 24, 28, 3), WOOD[2])
    s.shade(poly([(9, 22), (27, 22), (29, 44), (7, 44)]), None, 'form', colors=['#3a4a7a', '#4a6aa0', '#6a8ac0', '#8aa8d8'])
    s.shade(ellipse(18, 14, 7, 7), None, 'sphere', colors=['#a8884a', '#d8b870', '#f0d890'])
    s.shade(poly([(6, 10), (30, 10), (24, 2), (12, 2)]), None, 'form', colors=['#5a3a1a', '#8a5a2a', '#a8743a'])
    s.fill({(15, 14), (21, 14)}, '#2a1a10'); s.fill(line(15, 18, 21, 18), '#5a3a1a')
    for x in (4, 31):
        s.fill({(x, 27), (x, 28), (x + (1 if x < 10 else -1), 29)}, '#e0c070')
    return done(s)


def lantern():
    s = cv(32, 56)
    shadow(s, 16, 53, 7, 2)
    s.shade(rect(14, 16, 4, 38), None, 'cyl', colors=IRON)
    s.fill(rect(10, 52, 12, 3), IRON[2])
    s.shade(rect(9, 4, 14, 13), None, 'form', colors=IRON[1:])
    s.fill(rect(11, 6, 10, 9), FIRE[3]); s.fill(rect(14, 8, 4, 5), FIRE[4])
    s.fill(rect(8, 2, 16, 3), IRON[2])
    s.meta = {'light': [16, 10]}
    return done(s)


def forge_small():
    s = cv(36, 56)
    shadow(s, 18, 53, 15, 3)
    for x in range(4, 32):
        for y in range(18, 52):
            row = (y - 18) // 5
            s.set(x, y, STONE[0] if (y - 18) % 5 == 4 or (x + row * 4) % 9 == 0 else STONE[3] if x < 14 else STONE[2])
    s.shade(rect(12, 2, 12, 16), None, 'cyl', colors=STONE)
    mouth = {(x, y) for x in range(10, 26) for y in range(30, 46) if y > 36 or ((x + .5 - 18) / 8) ** 2 + ((y - 37) / 7) ** 2 <= 1}
    s.fill(mouth, '#2a0e0a')
    r = rng(2)
    for x, y in mouth:
        if y > 38 and r.random() < .85:
            s.set(x, y, FIRE[max(0, min(4, int((1 - abs(x - 18) / 8 + r.uniform(-.3, .3)) * 5)))])
    s.meta = {'light': [18, 40]}
    return done(s)


def machine(kind):
    s = cv(32, 52)
    shadow(s, 16, 49, 12, 3)
    if kind == 'keg':
        s.shade(ellipse(16, 32, 12, 16), None, 'cyl', colors=WOOD)
        for y in (22, 42):
            s.fill(rect(4, y, 24, 2), IRON[2])
        s.fill(rect(15, 34, 3, 5), '#c8a040')
    elif kind == 'jar':
        s.shade(rect(6, 18, 20, 28), None, 'cyl', colors=['#2a5a6a', '#4a8a9a', '#8ac8d8', '#d8f4fc'])
        s.fill(rect(8, 30, 16, 14), '#c8402a'); s.fill(rect(7, 14, 18, 5), WOOD[2])
    elif kind == 'cheese':
        s.shade(rect(4, 28, 24, 18), None, 'form', colors=LWOOD)
        s.fill(rect(10, 16, 4, 14), IRON[2]); s.shade(ellipse(16, 14, 9, 3), None, 'sphere', colors=IRON[1:])
        s.shade(ellipse(16, 30, 8, 3), None, 'sphere', colors=['#c8902a', '#f0c040', '#ffe080'])
    elif kind == 'loom':
        for x in (4, 26):
            s.shade(rect(x, 10, 3, 36), None, 'cyl', colors=WOOD)
        s.fill(rect(4, 10, 25, 3) | rect(4, 42, 25, 3), WOOD[2])
        for x in range(8, 26, 2):
            s.fill(line(x, 13, x, 41), '#e8dcc0')
        s.fill(rect(7, 24, 19, 8), '#c84a4a')
    elif kind == 'oilpress':
        s.shade(rect(6, 24, 20, 22), None, 'form', colors=WOOD)
        s.fill(rect(15, 6, 3, 20), IRON[2]); s.fill(rect(8, 6, 17, 3), IRON[3])
        s.fill(rect(10, 40, 12, 5), '#d8c040')
    else:  # smoker
        s.shade(rect(5, 16, 22, 30), None, 'form', colors=IRON)
        s.shade(rect(12, 4, 8, 13), None, 'cyl', colors=IRON)
        s.fill(rect(9, 30, 14, 8), '#1a0e0a'); s.fill(rect(10, 35, 12, 2), FIRE[1])
    return done(s)


def beehive(full):
    s = cv(32, 52)
    shadow(s, 16, 49, 11, 2.5)
    s.fill(rect(9, 38, 3, 10) | rect(20, 38, 3, 10), WOOD[1])
    for k in range(4):
        s.shade(rect(5 + k, 14 + k * 6, 22 - 2 * k, 7), None, 'form', colors=['#8a6a20', '#c09a34', '#e0c050', '#f4e080'])
    s.shade(poly([(4, 16), (16, 6), (28, 16)]), None, 'form', colors=WOOD[1:])
    s.fill(rect(14, 33, 4, 3), '#2a1a10')
    if full:
        s.fill(rect(6, 22, 3, 6), '#f2a020'); s.set(7, 28, '#f2a020')
    return done(s)


def ladder(up):
    s = cv(32, 32)
    if not up:
        s.fill(ellipse(16, 18, 13, 10), '#140c08')
    for x in (10, 21):
        s.shade(rect(x, 4 if up else 8, 2, 24), None, 'cyl', colors=LWOOD)
    for y in range(8 if up else 12, 28, 5):
        s.fill(rect(10, y, 13, 2), LWOOD[3])
    if up:
        s.meta = {'light': [16, 8]}
    return done(s)


def board():
    s = cv(40, 56)
    shadow(s, 20, 53, 15, 3)
    for x in (6, 31):
        s.shade(rect(x, 14, 4, 40), None, 'cyl', colors=WOOD)
    s.shade(rect(2, 4, 36, 30), None, 'form', colors=LWOOD)
    s.fill(rect(2, 2, 36, 4), WOOD[2])
    for x, y, c in ((6, 9, '#f0e6cc'), (19, 11, '#ffe8a0'), (9, 21, '#f0e6cc'), (24, 22, '#d8e8ff')):
        s.fill(rect(x, y, 10, 9), c); s.set(x + 5, y, '#c8342a')
    return done(s)


def dead():
    s = cv(32, 32)
    s.fill(line(10, 26, 16, 14) | line(16, 14, 22, 26) | line(14, 20, 6, 16) | line(18, 20, 26, 15), '#8a6a40')
    s.fill({(6, 16), (26, 15)}, '#a88a5a')
    return done(s)


def iceboulder():
    s = cv(64, 64)
    shadow(s, 32, 56, 28, 5)
    m = poly([(8, 52), (4, 34), (14, 16), (32, 8), (50, 14), (60, 32), (56, 52)])
    s.shade(m, None, 'form', colors=['#3a5a78', '#6a9ac0', '#9ccce8', '#d0ecfa', '#f6fdff'])
    for p in line(20, 18, 28, 30) | line(40, 22, 36, 40):
        s.set(*p, '#ffffff')
    return done(s)


def meteor():
    s = cv(64, 64)
    shadow(s, 32, 56, 28, 5)
    m = poly([(8, 50), (6, 32), (18, 14), (36, 10), (54, 20), (58, 40), (50, 54), (20, 56)])
    s.shade(m, None, 'form', colors=['#1a1424', '#2e2638', '#463c54', '#5e5470', '#7a6e8c'])
    r = rng(5)
    for _ in range(9):
        x, y = r.randrange(14, 50), r.randrange(16, 50)
        if (x, y) in m:
            s.fill({(x, y), (x + 1, y)}, '#ff8a3a'); s.set(x, y + 1, '#ffd25a')
    s.meta = {'light': [32, 32]}
    return done(s)


def cracked():
    from sprites.nature import rock
    s = rock('#a09888', big=True, seed=12)
    for p in line(22, 22, 28, 30) | line(28, 30, 24, 36) | line(24, 36, 32, 44) | line(28, 30, 38, 32):
        s.set(*p, '#2a1c18')
    return s


def tanrack():
    s = cv(40, 52)
    shadow(s, 20, 49, 16, 3)
    hide = poly([(9, 10), (14, 13), (26, 13), (31, 10), (29, 22), (31, 34), (26, 38), (20, 35), (14, 38), (9, 34), (11, 22)])
    for k in range(5):
        s.fill(line(4, 9 + k * 7, 10, 11 + k * 6) | line(36, 9 + k * 7, 30, 11 + k * 6), '#d8c8a0')
    s.shade(hide, None, 'form', colors=['#9a6a40', '#c08e5a', '#dcae78', '#f0cc98'])
    for fx in (2, 34):
        s.shade(rect(fx, 4, 4, 46), None, 'cyl', colors=WOOD)
    for fy in (5, 40):
        s.shade(rect(0, fy, 40, 4), None, 'cyl_side', colors=WOOD)
    return done(s)


def waystone(lit):
    """A carved standing stone; its rune glows once you've attuned to it."""
    s = cv(32, 64)
    shadow(s, 16, 60, 13, 3)
    s.shade(rect(4, 52, 24, 9), None, 'form', colors=STONE)
    body = poly([(9, 8), (16, 3), (23, 8), (24, 53), (8, 53)])
    s.shade(body, None, 'form', colors=['#4a4a58', '#6a6a7a', '#8a8a9a', '#b0b0c0'])
    for y in range(12, 50, 9):  # carved bands
        s.fill(rect(10, y, 13, 1), '#4a4a58')
    rune = line(16, 20, 16, 40) | line(12, 26, 20, 34) | line(20, 26, 12, 34) | {(15, 19), (17, 19), (15, 41), (17, 41)}
    s.fill(rune, '#7ae8ff' if lit else '#3a3a48')
    if lit:
        for x, y in list(rune):
            for dx, dy in ((1, 0), (-1, 0)):
                if (x + dx, y + dy) not in rune and 9 < x + dx < 23:
                    s.blend(x + dx, y + dy, '#bff4ff', .45)
        s.meta = {'light': [16, 30]}
    for k in range(6):  # moss at the foot
        s.fill({(9 + k * 2, 52 - (k % 3)), (10 + k * 2, 52)}, '#4f8e3a')
    return done(s)


def ferry():
    """A rowboat tied to a mooring post: Corwin's ferry."""
    s = cv(64, 40)
    hull = poly([(4, 18), (60, 18), (54, 32), (10, 32)])
    s.shade(hull, None, 'form', colors=['#3e2614', '#6e4626', '#9a6a3a', '#c08e5a'])
    s.fill(rect(6, 18, 52, 2), '#c8925a'); s.fill(rect(8, 22, 48, 6), '#4a2e1a')
    for x in (20, 36):
        s.fill(rect(x, 22, 4, 6), '#8a5a34')
    s.fill(line(14, 26, 2, 14) | line(15, 26, 3, 14), '#a8743f')  # oar
    s.shade(rect(56, 4, 5, 32), None, 'cyl', colors=WOOD)
    s.fill(line(58, 12, 48, 20), '#d8c8a0')
    for x in range(6, 58, 5):  # ripples
        s.set(x, 34 + (x // 5) % 2, '#bfe6f5')
    return done(s)


GRASSC = None
FLOWERS = [('#ffe060', '#e8a020'), ('#ff8ab8', '#d84a7a'), ('#a8c0ff', '#5a6ad8'), ('#ffffff', '#d0d0e0'), ('#ffa060', '#d8601a')]


def _all():
    out = {
        'bramble': bramble, 'log': log, 'stump': stump, 'twig': twig, 'stone': stone_small, 'fence': fence, 'sign': sign, 'grave': grave,
        'statue': statue, 'ruinwall': ruinwall, 'shrine': shrine, 'altar': altar, 'well': well, 'tent': tent, 'cart': cart, 'wreck': wreck,
        'cave': cave, 'cattail': cattail, 'fern': fern, 'mushroom': mushroom, 'shell': shell, 'crystalnode': crystalnode, 'page': page,
        'shard': shard, 'bin': bin_, 'scarecrow': scarecrow, 'lantern': lantern, 'forge': forge_small, 'board': board, 'dead': dead, 'tanrack': tanrack,
        'ladder': lambda: ladder(False), 'upladder': lambda: ladder(True), 'iceboulder': iceboulder, 'meteor': meteor, 'cracked': cracked,
        'sprinkler': lambda: sprinkler('#e8853e', '#c8c8c8'), 'qsprinkler': lambda: sprinkler('#ffd040', '#bfe6f5'), 'isprinkler': lambda: sprinkler('#4fe0c8', '#ffffff'),
        'weed': lambda: [weed(s_) for s_ in range(4)], 'flower': lambda: [flower(a, b, i) for i, (a, b) in enumerate(FLOWERS)],
        'sapling': lambda: [sapling(i) for i in range(3)], 'campfire': lambda: [campfire(i) for i in range(3)], 'fairy': lambda: [fairy(i) for i in range(2)],
        'chest': lambda: [chest(i) for i in range(2)], 'waystone': lambda: [waystone(i) for i in range(2)], 'ferry': ferry, 'dig': lambda: [dig(i) for i in range(2)], 'beehive': lambda: [beehive(i) for i in range(2)],
    }
    for k in ('keg', 'jar', 'cheese', 'loom', 'oilpress', 'smoker'):
        out[k] = (lambda k=k: machine(k))
    for s_ in range(4):
        out[f'tgrass_{s_}'] = (lambda s_=s_: [tgrass(s_, f) for f in range(3)])
        out[f'bush_{s_}'] = (lambda s_=s_: [bush(s_, r) for r in range(2)])
    return out


SPRITES = _all()
