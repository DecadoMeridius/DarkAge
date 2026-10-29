"""Style test 2: a blacksmith's workshop interior, lit by the forge.

Cobbled floor, stone back wall with timber posts, a stone forge with live coals,
coal heap, bellows, anvil + smith, quench tub, grindstone, tanning rack, weapon
rack, shelves, a workbench and candles. A light pass multiplies the scene by a
banded, dithered light map (warm point lights over a cool dark ambient), then
adds glow halos around flames.
Writes art/out/blacksmith_test.png and blacksmith_test@5x.png.
"""
import math, os
from px import Canvas, rect, ellipse, poly, line, fbm, vnoise, rng, hx

OUT = os.path.join(os.path.dirname(__file__), 'out')
W, H = 256, 176
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
WOOD = ['#3a2218', '#5a3622', '#7a4c2c', '#9a6638', '#b88450']
IRON = ['#1e1e2a', '#2e3040', '#454a5c', '#6a7084', '#9aa2b4']
STONE = ['#3e3c48', '#56545e', '#6e6c74', '#8a8890', '#a8a6aa']
FIRE = ['#a8301a', '#e0602a', '#f29a32', '#ffd25a', '#fff4c0']
R = rng(7)
LIGHTS = []  # (x, y, radius, (r, g, b), strength)
FLAMES = []  # (x, y, size) for glow halos


# ---- room shell ----------------------------------------------------------
def floor(cv):
    # jittered-grid voronoi cobbles
    seeds = {}
    for gy in range(-1, H // 7 + 2):
        for gx in range(-1, W // 9 + 2):
            seeds[(gx, gy)] = (gx * 9 + (gy % 2) * 4.5 + R.uniform(1, 8), gy * 7 + R.uniform(1, 6), R.random())
    cell = {}
    for y in range(H):
        for x in range(W):
            gx, gy = int(x // 9), int(y // 7)
            best = []
            for dy in (-1, 0, 1):
                for dx in (-2, -1, 0, 1, 2):
                    s = seeds.get((gx + dx, gy + dy))
                    if s:
                        best.append(((x + .5 - s[0]) ** 2 + ((y + .5 - s[1]) * 1.25) ** 2, (gx + dx, gy + dy)))
            best.sort()
            cell[x, y] = best[0][1] if math.sqrt(best[1][0]) - math.sqrt(best[0][0]) > 1.1 else None
    pal = ['#8c7458', '#9a8062', '#a68c6c', '#8a7a68', '#b0966e']
    for y in range(H):
        for x in range(W):
            c = cell[x, y]
            if c is None:
                cv.set(x, y, '#5a4636'); continue
            base = hx(pal[int(seeds[c][2] * len(pal))])
            up, dn = cell.get((x, y - 1)), cell.get((x, y + 1))
            k = 1.14 if up is None else .82 if dn is None else 1.0
            if k == 1.0 and vnoise(x * .7, y * .7, 3) > .82:
                k = .92
            cv.set(x, y, tuple(min(255, int(v * k)) for v in base[:3]))


def walls(cv):
    # back wall: stone courses between timber posts, wall cap above
    for y in range(8, 58):
        row = (y - 8) // 6
        for x in range(8, W - 8):
            j = (y - 8) % 6 == 5 or (x + row * 5) % 12 == 0
            t = vnoise((x + row * 5) // 12, row, 4)
            c = STONE[3] if t > .66 else STONE[2] if t > .3 else STONE[1]
            if not j and (y - 8) % 6 == 0:
                c = STONE[4] if t > .5 else STONE[3]
            cv.set(x, y, STONE[0] if j else c)
    cv.fill(rect(8, 56, W - 16, 3), WOOD[1]); cv.fill(rect(8, 56, W - 16, 1), WOOD[3])  # skirting
    for px_ in (20, 226):  # posts
        cv.shade(rect(px_, 4, 10, 54), None, 'cyl', colors=WOOD[1:])
        cv.fill(rect(px_ - 1, 54, 12, 4), WOOD[0])
    # room frame: dark wall tops with a timber lip
    for x, y in rect(0, 0, W, 8) | rect(0, 0, 8, H) | rect(W - 8, 0, 8, H) | rect(0, H - 6, W, 6):
        cv.set(x, y, '#22191e' if (x + y) % 7 else '#2c2026')
    cv.fill(rect(8, 7, W - 16, 1), WOOD[2]); cv.fill(rect(8, H - 7, W - 16, 1), WOOD[2])
    cv.fill(rect(7, 7, 1, H - 13), WOOD[2]); cv.fill(rect(W - 8, 7, 1, H - 13), WOOD[2])


# ---- props ---------------------------------------------------------------
def forge(cv, cx=128):
    hood = poly([(cx - 11, 2), (cx + 11, 2), (cx + 23, 28), (cx - 23, 28)])
    for x, y in hood:
        half = 11 + (y - 2) * 12 / 26  # hood half-width at this row
        u = (x - cx) / half  # -1..1 across the hood
        row = (y - 2) // 4
        j = (y - 2) % 4 == 3 or int((u + 1) * 4 + (row % 2) * .5) != int((u + 1) * 4 + (row % 2) * .5 + 1.5 / half)
        lit = 3 if u < -.35 else 2 if u < .45 else 1
        c = STONE[0] if j else STONE[lit + (1 if (y - 2) % 4 == 0 and lit < 3 else 0)]
        if y > 20 and abs(u) < .7 and R.random() < (y - 20) / 10:
            c = STONE[max(0, STONE.index(c) - 1)]  # soot over the mouth
        cv.set(x, y, c)
    cv.shade(rect(cx - 25, 28, 50, 4), None, 'cyl_side', colors=WOOD)  # mantel beam
    for bx in (cx - 22, cx + 19):
        cv.fill(rect(bx, 29, 3, 2), IRON[3])
    body = rect(cx - 24, 30, 48, 34)
    for x, y in body:
        row = (y - 30) // 5
        j = (y - 30) % 5 == 4 or (x + row * 4) % 10 == 0
        cv.set(x, y, STONE[0] if j else STONE[3] if (x + row) % 10 < 4 and (y - 30) % 5 == 0 else STONE[2])
    cv.fill(rect(cx - 26, 62, 52, 4), STONE[1]); cv.fill(rect(cx - 26, 62, 52, 1), STONE[3])
    mouth = ellipse(cx, 46, 15, 11) & {(x, y) for x in range(W) for y in range(36, 60)}
    cv.fill(mouth, '#2a0e0a')
    for x, y in mouth:  # coal bed: layered embers, hottest in the middle
        d = ((x - cx) / 15) ** 2 + ((y - 50) / 11) ** 2
        if y > 42 and R.random() < .9:
            heat = max(0, 1 - d) + R.uniform(-.25, .25)
            cv.set(x, y, FIRE[max(0, min(4, int(heat * 5.2)))])
    for x in range(cx - 15, cx + 16):  # arch rim
        for y in range(34, 60):
            if (x, y) not in mouth and any(p in mouth for p in ((x + 1, y), (x - 1, y), (x, y + 1))):
                cv.set(x, y, FIRE[0] if y > 44 else '#4a3a3a')
    for gx in range(cx - 12, cx + 13, 3):  # grate
        cv.set(gx, 58, IRON[1]); cv.set(gx, 59, IRON[2])
    cv.fill(line(cx + 14, 61, cx + 30, 52), IRON[2]); cv.fill(line(cx + 14, 62, cx + 30, 53), IRON[0])  # poker
    LIGHTS.append((cx, 50, 120, (1.0, .62, .3), 1.6))
    FLAMES.append((cx, 48, 16))


def coal_heap(cv, x0, y0):
    for _ in range(26):
        x, y = x0 + R.uniform(0, 30) - abs(R.gauss(0, 3)), y0 + R.uniform(0, 16)
        cv.shade(ellipse(x, y, R.uniform(2, 3.5), R.uniform(1.6, 2.6)), None, 'sphere', colors=['#14141c', '#22232e', '#343648', '#5a5e74'])


def anvil(cv, x, y):
    cv.shade(ellipse(x + 10, y + 18, 9, 5), None, 'cyl', colors=WOOD)  # stump
    cv.fill({(i, j) for i, j in ellipse(x + 10, y + 16, 8, 3)}, WOOD[3])
    for k in range(3):
        cv.set(x + 6 + k * 3, y + 16, WOOD[1])
    top = poly([(x - 4, y), (x + 4, y - 1), (x + 22, y - 1), (x + 22, y + 4), (x + 4, y + 4), (x - 4, y + 2)])
    cv.shade(top, None, 'form', colors=IRON)
    cv.shade(rect(x + 7, y + 4, 8, 6), None, 'cyl', colors=IRON)
    cv.shade(rect(x + 4, y + 10, 14, 3), None, 'form', colors=IRON)
    cv.fill(rect(x + 5, y - 1, 16, 1), IRON[4])
    # glowing blade on the anvil face
    for i in range(12):
        cv.set(x + 6 + i, y + 1, FIRE[3] if 3 < i < 9 else FIRE[2])
    LIGHTS.append((x + 12, y + 1, 30, (1, .55, .25), .5))
    FLAMES.append((x + 12, y + 1, 4))


def smith(cv, x, y):
    s = Canvas(30, 40)
    skin = ['#5a3220', '#7a4628', '#9a5e38', '#b87a4c', '#cc9064']
    hair = ['#4a1a14', '#7a2a1c', '#a8402a', '#cc5e36', '#e88a4a']
    linen = ['#6a5a4a', '#9a8a72', '#c4b496', '#e2d6bc']
    leather = ['#2a1810', '#45281a', '#643c24', '#845232']
    trousers = ['#22202c', '#34303e', '#484254']
    for lx in (8, 15):  # legs + boots
        s.shade(rect(lx, 27, 5, 7), None, 'cyl', colors=trousers)
        s.shade(rect(lx - 1, 33, 7, 5), None, 'form', colors=leather)
    s.shade(poly([(6, 15), (22, 15), (23, 28), (5, 28)]), None, 'form', colors=linen)  # shirt
    s.shade(poly([(9, 18), (19, 18), (21, 32), (7, 32)]), None, 'form', colors=leather)  # apron
    s.fill(line(9, 18, 8, 15) | line(19, 18, 20, 15), leather[0])  # straps
    s.fill(rect(11, 25, 6, 4), leather[1]); s.fill(rect(11, 25, 6, 1), leather[3])  # pocket
    s.fill(rect(6, 27, 16, 1), leather[0]); s.set(14, 27, '#d8b048')  # belt + buckle
    s.shade(rect(2, 16, 4, 6), None, 'cyl', colors=linen)  # rolled sleeves
    s.shade(rect(22, 16, 4, 6), None, 'cyl', colors=linen)
    s.shade(rect(2, 22, 4, 6), None, 'cyl', colors=skin[:4])  # forearms
    s.shade(rect(22, 20, 4, 5), None, 'cyl', colors=skin[:4])
    s.fill(rect(2, 25, 4, 2), leather[2]); s.fill(rect(22, 22, 4, 2), leather[2])  # bracers
    s.shade(ellipse(14, 9, 6.5, 6.5), None, 'sphere', colors=skin)  # head
    s.shade({p for p in ellipse(14, 7, 7.5, 6.5) if p[1] < 6 or (p[0] < 9 and p[1] < 12) or (p[0] > 19 and p[1] < 12)}, None, 'form', colors=hair)
    s.shade(poly([(19, 10), (22, 11), (22, 20), (20, 21), (19, 14)]), None, 'form', colors=hair[1:])  # braid
    for by in (13, 16, 19):
        s.set(20, by, hair[0]); s.set(21, by, hair[0])
    for ex in (11, 16):  # eyes + brows
        s.set(ex, 10, '#1a0e0a'); s.set(ex, 9, '#1a0e0a')
        s.set(ex - 1, 8, hair[1]); s.set(ex, 8, hair[1])
    s.set(13, 12, skin[1]); s.set(13, 13, skin[2])  # nose shadow
    s.set(13, 14, '#6a2a20'); s.set(14, 14, '#6a2a20')  # mouth
    s.set(9, 12, '#c8705a'); s.set(18, 12, '#c8705a')  # cheeks
    # hammer raised in the right hand
    s.fill(line(24, 21, 25, 12), WOOD[3]); s.fill(line(25, 21, 26, 12), WOOD[1])
    s.shade(rect(22, 8, 7, 4), None, 'form', colors=IRON[1:])
    s.outline()
    cv.paste(s, x, y)


def bellows(cv, x, y):
    for lx in (x + 8, x + 34):  # stand
        cv.shade(rect(lx, y + 14, 3, 12), None, 'cyl', colors=WOOD)
    cv.shade(rect(x + 6, y + 22, 34, 3), None, 'cyl_side', colors=WOOD)
    pleat = poly([(x + 2, y + 12), (x + 22, y + 6), (x + 44, y + 10), (x + 44, y + 20), (x + 22, y + 21), (x + 2, y + 15)])
    for px_, py_ in pleat:  # leather folds as zigzag bands
        band = ((px_ - x) + (py_ - y) // 2) % 6
        cv.set(px_, py_, ['#3a2014', '#5a2e1c', '#7a4228', '#94583a', '#7a4228', '#5a2e1c'][band])
    board = poly([(x, y + 11), (x + 14, y + 3), (x + 30, y - 2), (x + 42, y), (x + 46, y + 7), (x + 42, y + 13), (x + 26, y + 15), (x + 10, y + 15)])
    cv.shade(board, None, 'form', colors=WOOD)
    for k in range(4):  # plank seams
        cv.fill(line(x + 12 + k * 8, y + 2, x + 10 + k * 8, y + 14) & board, WOOD[1])
    for rx, ry in ((x + 8, y + 11), (x + 38, y + 2), (x + 42, y + 11), (x + 24, y + 13)):
        cv.set(rx, ry, '#e0c060')  # brass rivets
    cv.shade(poly([(x - 14, y + 11), (x, y + 9), (x, y + 14), (x - 14, y + 13)]), None, 'cyl_side', colors=IRON[1:])  # nozzle
    cv.fill(rect(x + 46, y + 4, 6, 2) | rect(x + 50, y + 2, 2, 6), WOOD[3])  # handle


def quench_tub(cv, cx, cy):
    cv.shade(ellipse(cx, cy, 15, 10), None, 'sphere', colors=WOOD)
    for a in range(0, 360, 30):  # staves
        r_ = math.radians(a)
        cv.set(round(cx + math.cos(r_) * 14), round(cy + math.sin(r_) * 9), WOOD[0])
    cv.fill(ellipse(cx, cy, 15, 10) - ellipse(cx, cy, 14, 9), IRON[1])  # hoop
    water = ellipse(cx, cy, 11, 7)
    cv.shade(water, None, 'sphere', colors=['#1a2a4a', '#24406a', '#30588a', '#4a7aaa', '#8ab4d8'], light='bottom_right')
    for i in range(5):
        cv.set(cx - 5 + i * 3, cy - 2 + (i % 2), '#a8d0f0')
    cv.fill(line(cx + 4, cy - 10, cx + 14, cy + 6), IRON[3])  # tongs
    cv.fill(line(cx + 6, cy - 10, cx + 16, cy + 5), IRON[1])


def grindstone(cv, x, y):
    cv.fill(rect(x, y + 10, 26, 3), WOOD[2]); cv.fill(rect(x + 2, y + 13, 2, 7), WOOD[1]); cv.fill(rect(x + 22, y + 13, 2, 7), WOOD[1])
    cv.shade(ellipse(x + 13, y + 8, 8, 8), None, 'sphere', colors=STONE)
    cv.fill(ellipse(x + 13, y + 8, 2, 2), WOOD[0])
    cv.fill(rect(x + 11, y + 2, 4, 2), IRON[3])


def tanning_rack(cv, x, y):
    hide = poly([(x + 10, y + 8), (x + 16, y + 12), (x + 28, y + 12), (x + 34, y + 8), (x + 32, y + 18), (x + 34, y + 30),
                 (x + 30, y + 36), (x + 32, y + 42), (x + 22, y + 38), (x + 12, y + 42), (x + 14, y + 36), (x + 10, y + 30), (x + 12, y + 18)])
    for k in range(6):  # lacing from pelt to posts
        cv.fill(line(x + 4, y + 8 + k * 7, x + 12, y + 10 + k * 6), '#d8c8a0')
        cv.fill(line(x + 40, y + 8 + k * 7, x + 32, y + 10 + k * 6), '#d8c8a0')
    cv.shade(hide, None, 'form', colors=['#7a4a2a', '#a8703e', '#c8905a', '#e2b07a', '#f2cc98'])
    for _ in range(14):  # fur texture
        hx_, hy_ = x + R.randrange(13, 31), y + R.randrange(14, 36)
        if (hx_, hy_) in hide:
            cv.set(hx_, hy_, '#9a6438')
    for fx in (x + 2, x + 40):  # posts
        cv.shade(rect(fx, y, 4, 54), None, 'cyl', colors=WOOD)
    for fy in (y + 3, y + 45):  # crossbars
        cv.shade(rect(x, fy, 46, 4), None, 'cyl_side', colors=WOOD)


def weapon_rack(cv, x, y):
    cv.fill(rect(x, y, 56, 3), WOOD[3]); cv.fill(rect(x, y + 3, 56, 2), WOOD[1])
    cv.fill(rect(x, y + 20, 56, 4), WOOD[2]); cv.fill(rect(x, y + 24, 56, 2), WOOD[0])
    for i, kind in enumerate(['sword', 'axe', 'sword', 'spear', 'sword']):
        bx = x + 5 + i * 11
        if kind == 'sword':
            cv.shade(rect(bx, y - 10, 3, 24), None, 'cyl', colors=IRON[2:])
            cv.fill(rect(bx - 2, y + 13, 7, 2), '#c8a040'); cv.fill(rect(bx + 1, y + 15, 1, 5), WOOD[1])
        elif kind == 'axe':
            cv.fill(rect(bx + 1, y - 8, 2, 28), WOOD[3])
            cv.shade(poly([(bx + 3, y - 8), (bx + 9, y - 11), (bx + 9, y), (bx + 3, y - 3)]), None, 'form', colors=IRON[1:])
        else:
            cv.fill(rect(bx + 1, y - 6, 2, 26), WOOD[3])
            cv.shade(poly([(bx + 2, y - 16), (bx + 5, y - 7), (bx - 1, y - 7)]), None, 'form', colors=IRON[1:])


def shelf(cv, x, y):
    for k in range(3):
        cv.fill(rect(x, y + k * 14 + 11, 16, 2), WOOD[3]); cv.fill(rect(x, y + k * 14 + 13, 16, 1), WOOD[0])
        for b in range(3):
            col = R.choice([['#3a1a4a', '#6a2a8a', '#9a50c0'], ['#1a3a2a', '#2a6a3a', '#4aa060'], ['#4a1a1a', '#8a2a2a', '#c04a3a'], ['#3a2a1a', '#7a5a2a', '#b08a40']])
            bx = x + 2 + b * 5
            cv.shade(rect(bx, y + k * 14 + 5, 4, 6), None, 'cyl', colors=col)
            cv.fill(rect(bx + 1, y + k * 14 + 3, 2, 2), '#c8a070')
    cv.fill(rect(x - 1, y + 2, 1, 42), WOOD[1]); cv.fill(rect(x + 16, y + 2, 1, 42), WOOD[1])


def workbench(cv, x, y):
    cv.shade(rect(x, y, 40, 12), None, 'form', colors=WOOD[1:])
    for k in range(0, 40, 8):
        cv.fill(rect(x + k, y, 1, 12), WOOD[1])
    cv.fill(rect(x + 2, y + 12, 3, 6), WOOD[0]); cv.fill(rect(x + 35, y + 12, 3, 6), WOOD[0])
    cv.shade(poly([(x + 22, y + 1), (x + 37, y + 2), (x + 35, y + 10), (x + 21, y + 9)]), None, 'form', colors=['#7a4a2a', '#a8703e', '#c89058'])
    cv.fill(line(x + 6, y + 8, x + 15, y + 3), IRON[3]); cv.fill(rect(x + 14, y + 2, 4, 3), IRON[2])


def barrel(cv, x, y):
    for k in range(3):  # spare blades stuck in it
        cv.shade(rect(x + 3 + k * 4, y - 8 - k * 2, 2, 12), None, 'cyl', colors=IRON[2:])
        cv.fill(rect(x + 2 + k * 4, y - 9 - k * 2, 4, 1), '#c8a040')
    cv.shade(rect(x, y + 4, 16, 16), None, 'cyl', colors=WOOD)
    for k in range(2, 16, 4):
        cv.fill(rect(x + k, y + 6, 1, 14), WOOD[1])
    for hy in (y + 8, y + 16):
        cv.shade(rect(x, hy, 16, 2), None, 'cyl', colors=IRON[1:])
    cv.shade(ellipse(x + 8, y + 4, 8, 3.5), None, 'sphere', colors=WOOD[1:])
    cv.fill(ellipse(x + 8, y + 4, 5, 2), WOOD[0])


def ingots(cv, x, y):
    gold = ['#7a4a10', '#c08a20', '#f2c040', '#fff0a0']
    for row, (n, col) in enumerate(((4, IRON[1:]), (3, IRON[1:]), (2, gold))):
        for k in range(n):
            bx, by = x + k * 7 + row * 3, y - row * 3
            cv.shade(poly([(bx, by + 4), (bx + 1, by), (bx + 6, by), (bx + 7, by + 4)]), None, 'form', colors=col)


def ore_crate(cv, x, y):
    crate(cv, x, y, 18, 12)
    for _ in range(9):
        cv.shade(ellipse(x + R.uniform(3, 15), y + R.uniform(0, 3), 2.2, 1.6), None, 'sphere', colors=['#3a2a24', '#6a4a3a', '#a8705a', '#e89a7a'])


def sparks(cv, cx, cy):
    for _ in range(14):
        a, d = R.uniform(math.pi * 1.05, math.pi * 1.95), R.uniform(4, 14)
        sx, sy = round(cx + math.cos(a) * d), round(cy + math.sin(a) * d * .8)
        cv.set(sx, sy, FIRE[4] if d < 8 else FIRE[3])
        if R.random() < .4:
            cv.set(sx, sy + 1, FIRE[1])


def chair(cv, x, y):
    cv.shade(rect(x, y, 12, 4), None, 'form', colors=WOOD[1:])
    cv.shade(rect(x, y + 4, 12, 8), None, 'form', colors=WOOD)
    cv.fill(rect(x + 1, y + 12, 2, 4), WOOD[0]); cv.fill(rect(x + 9, y + 12, 2, 4), WOOD[0])


def crate(cv, x, y, w=16, h=14):
    cv.shade(rect(x, y, w, h), None, 'form', colors=WOOD[1:])
    cv.fill(rect(x, y, w, 1) | rect(x, y + h - 1, w, 1) | rect(x, y, 1, h) | rect(x + w - 1, y, 1, h), WOOD[0])
    cv.fill(line(x + 1, y + 1, x + w - 2, y + h - 2), WOOD[1])


def torch(cv, x, y):
    cv.fill(rect(x, y + 3, 2, 6), WOOD[1]); cv.fill(rect(x - 1, y + 2, 4, 2), IRON[2])
    for p, c in (((x, y), FIRE[3]), ((x + 1, y), FIRE[2]), ((x, y - 1), FIRE[4]), ((x + 1, y + 1), FIRE[1]), ((x, y + 1), FIRE[2]), ((x, y - 2), FIRE[3])):
        cv.set(*p, c)
    LIGHTS.append((x, y, 46, (1, .7, .35), .9)); FLAMES.append((x, y, 6))


def candle(cv, x, y):
    cv.fill(rect(x, y, 2, 4), '#f0e2c0'); cv.set(x, y + 3, '#c8b088'); cv.set(x, y - 1, FIRE[3]); cv.set(x, y - 2, FIRE[4])
    LIGHTS.append((x, y, 26, (1, .72, .4), .6)); FLAMES.append((x, y - 1, 3))


def hanging_tools(cv, x, y):
    cv.fill(rect(x, y, 30, 2), WOOD[2])
    cv.fill(rect(x + 4, y + 2, 1, 9), WOOD[3]); cv.shade(rect(x + 2, y + 10, 5, 3), None, 'form', colors=IRON[1:])
    cv.fill(line(x + 13, y + 2, x + 11, y + 13) | line(x + 15, y + 2, x + 17, y + 13), IRON[3])
    cv.fill(rect(x + 24, y + 2, 1, 10), WOOD[3]); cv.shade(poly([(x + 21, y + 9), (x + 28, y + 9), (x + 27, y + 14), (x + 22, y + 14)]), None, 'form', colors=IRON[1:])


# ---- lighting ------------------------------------------------------------
def light_pass(cv):
    amb = (.42, .38, .52)
    STEP = .14
    src = cv.img.copy().load()
    for y in range(H):
        for x in range(W):
            l = list(amb)
            for lx, ly, rad, col, s in LIGHTS:
                d = math.hypot(x - lx, (y - ly) * 1.15)
                if d < rad:
                    f = (1 - d / rad) ** 1.7 * s
                    for k in range(3):
                        l[k] += col[k] * f
            # band the light into steps; dither the boundaries
            th = (BAYER[y % 4][x % 4] / 16 - .5) * STEP * .45
            l = [math.floor((v + th) / STEP + .5) * STEP for v in l]
            r_, g_, b_, a_ = src[x, y]
            cv.px[x, y] = (min(255, int(r_ * l[0])), min(255, int(g_ * l[1])), min(255, int(b_ * l[2])), a_)
    for fx, fy, size in FLAMES:  # glow halos: dithered additive rings
        for x, y in ellipse(fx, fy, size * 1.6, size * 1.4):
            d = math.hypot((x - fx) / (size * 1.6), (y - fy) / (size * 1.4))
            a = (1 - d) ** 2 * .55
            if a > BAYER[y % 4][x % 4] / 16 * .5:
                r_, g_, b_, a_ = cv.get(x, y)
                cv.set(x, y, (min(255, r_ + int(255 * a)), min(255, g_ + int(150 * a)), min(255, b_ + int(60 * a))))
    # vignette into the dark corners
    for y in range(H):
        for x in range(W):
            d = math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2))
            if d > .8:
                k = 1 - min(.45, (d - .8) * 1.1)
                r_, g_, b_, a_ = cv.px[x, y]
                cv.px[x, y] = (int(r_ * k), int(g_ * k), int(b_ * (k + .05)), a_)


def prop(cv, fn, *a, shade_floor=True):
    """Draw a prop on its own layer, outline it, drop a contact shadow, paste."""
    lay = Canvas(W, H)
    fn(lay, *a)
    lay.outline()
    if shade_floor:
        lp = lay.img.load()
        for y in range(H):
            for x in range(W):
                if lp[x, y][3] and not (0 <= y + 2 < H and lp[x, y + 2][3]):
                    for dx, dy in ((1, 1), (2, 2), (1, 2)):
                        if 0 <= x + dx < W and 0 <= y + dy < H and not lp[x + dx, y + dy][3]:
                            cv.blend(x + dx, y + dy, '#1a1014', .45)
    cv.paste(lay, 0, 0)


def main():
    cv = Canvas(W, H)
    floor(cv)
    walls(cv)
    prop(cv, shelf, 10, 30, shade_floor=False)
    prop(cv, hanging_tools, 40, 14, shade_floor=False); prop(cv, hanging_tools, 178, 14, shade_floor=False)
    prop(cv, torch, 33, 22, shade_floor=False); prop(cv, torch, 222, 22, shade_floor=False)
    prop(cv, coal_heap, 72, 48)
    prop(cv, forge)
    prop(cv, bellows, 162, 42)
    prop(cv, tanning_rack, 14, 62)
    prop(cv, barrel, 66, 72)
    prop(cv, ore_crate, 52, 120)
    prop(cv, quench_tub, 196, 104)
    prop(cv, grindstone, 222, 92)
    prop(cv, smith, 116, 74)
    prop(cv, anvil, 120, 112)
    prop(cv, ingots, 150, 124)
    sparks(cv, 132, 109)
    LIGHTS.append((132, 106, 18, (1, .8, .4), .4))
    prop(cv, chair, 92, 116)
    prop(cv, weapon_rack, 12, 140)
    prop(cv, workbench, 190, 138); prop(cv, crate, 234, 140); prop(cv, crate, 234, 126, 12, 12)
    for c in ((86, 134), (176, 150), (60, 100)):
        prop(cv, candle, *c)
    light_pass(cv)
    cv.save(os.path.join(OUT, 'blacksmith_test.png'))
    cv.save(os.path.join(OUT, 'blacksmith_test@5x.png'), 5)


if __name__ == '__main__':
    main()
