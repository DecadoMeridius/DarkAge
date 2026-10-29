"""Interior furniture (objects, named furn_<kind>) and wall/floor decals (dec_<kind>).

Furniture sprites are bottom-aligned on their footprint like every object, so tall
pieces (shelves, fireplaces) rise up over the back wall. Decals are painted
straight into the room's floor/wall chunks (rugs, windows, paintings).
Same palette families as the blacksmith test.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng, vnoise, hx

WOOD = ['#3a2218', '#5a3622', '#7a4c2c', '#9a6638', '#b88450']
LWOOD = ['#5a3a22', '#8a5a34', '#b07c4c', '#c8985e', '#e0b47a']
IRON = ['#1e1e2a', '#2e3040', '#454a5c', '#6a7084', '#9aa2b4']
STONE = ['#3e3c48', '#56545e', '#6e6c74', '#8a8890', '#a8a6aa']
FIRE = ['#a8301a', '#e0602a', '#f29a32', '#ffd25a', '#fff4c0']
CLOTH = {'red': ['#5a1a1a', '#8a2a24', '#b8402e', '#d8604a'], 'blue': ['#1a2a4a', '#2a4a7a', '#3a64a0', '#5a86c0'],
         'green': ['#1a3a22', '#2a5a32', '#3e7a44', '#5a9a5a'], 'cream': ['#a8987e', '#d0c2a6', '#e8dcc0', '#fff4dc'],
         'purple': ['#2a1a3a', '#4a2a6a', '#6a3a8a', '#8a5aaa']}


def base(w, h):
    return Canvas(w, h)


def finish(s, shadow=True):
    if shadow:  # contact shadow along the bottom edge
        for x in range(s.w):
            for y in range(s.h - 1, -1, -1):
                if s.get(x, y)[3]:
                    for k in (1, 2):
                        if y + k < s.h and not s.get(x, y + k)[3]:
                            s.px[x, y + k] = (20, 12, 10, 110 if k == 1 else 60)
                    break
    s.outline()
    return s


def plank_top(s, x, y, w, h, pal=WOOD, vertical=False):
    for i in range(x, x + w):
        for j in range(y, y + h):
            seam = ((i - x) % 8 == 0) if vertical else ((j - y) % 5 == 4)
            s.set(i, j, pal[1] if seam else pal[3] if (j == y) else pal[2 + (1 if vnoise(i * .4, j * .9, 3) > .7 else 0)])


# ---- furniture -----------------------------------------------------------
def bed(color='red'):
    s = base(64, 72)
    c = CLOTH[color]
    s.shade(rect(4, 2, 56, 18), None, 'form', colors=WOOD[1:])  # headboard
    s.fill(rect(4, 2, 56, 2), WOOD[4])
    s.shade(rect(8, 14, 48, 12), None, 'form', colors=CLOTH['cream'])  # pillows
    s.fill(rect(31, 14, 2, 12), CLOTH['cream'][0])
    s.shade(rect(6, 24, 52, 38), None, 'form', colors=c)  # quilt
    for y in range(30, 60, 8):
        s.fill(rect(6, y, 52, 1), c[0])
    for x in range(18, 58, 13):
        s.fill(rect(x, 24, 1, 38), c[0])
    s.fill(rect(6, 24, 52, 2), CLOTH['cream'][2])  # folded sheet
    s.shade(rect(4, 60, 56, 8), None, 'form', colors=WOOD[1:])  # footboard
    for x in (4, 56):
        s.fill(rect(x, 2, 4, 68), WOOD[1]); s.fill(rect(x, 2, 1, 68), WOOD[3])
    return finish(s)


def table(cloth=None):
    s = base(64, 44)
    plank_top(s, 2, 4, 60, 24, LWOOD)
    if cloth:
        s.shade(rect(14, 4, 36, 26), None, 'form', colors=CLOTH[cloth])
    s.fill(rect(2, 28, 60, 4), LWOOD[1])
    for x in (4, 54):
        s.shade(rect(x, 32, 5, 10), None, 'cyl', colors=LWOOD[:4])
    s.shade(ellipse(22, 14, 5, 3), None, 'sphere', colors=['#8a8478', '#c8c2b2', '#f0ece0'])  # plate
    s.fill(ellipse(22, 13, 2, 1), '#c8703a')
    s.shade(rect(40, 8, 5, 7), None, 'cyl', colors=['#6a4a2a', '#a07040', '#c89858'])  # mug
    return finish(s)


def chair():
    s = base(32, 40)
    s.shade(rect(8, 2, 16, 20), None, 'form', colors=LWOOD[1:])
    for x in range(11, 22, 4):
        s.fill(rect(x, 6, 1, 14), LWOOD[0])
    s.shade(rect(6, 20, 20, 8), None, 'form', colors=LWOOD)
    for x in (7, 22):
        s.fill(rect(x, 28, 3, 10), LWOOD[1])
    return finish(s)


def stool():
    s = base(32, 28)
    s.shade(ellipse(16, 8, 10, 5), None, 'sphere', colors=LWOOD[1:])
    for x in (9, 21):
        s.fill(line(x, 12, x - 2 if x < 16 else x + 2, 26), LWOOD[1])
    return finish(s)


def stove():
    s = base(32, 56)
    s.shade(rect(3, 20, 26, 34), None, 'form', colors=IRON)
    s.fill(rect(3, 20, 26, 3), IRON[4])
    s.fill(rect(8, 34, 16, 10), '#1a0e0a')
    for x in range(9, 23, 2):
        s.set(x, 42, FIRE[2]); s.set(x + 1, 41, FIRE[3])
    s.shade(rect(12, 2, 8, 18), None, 'cyl', colors=IRON)  # flue
    s.shade(ellipse(10, 17, 5, 2.5), None, 'sphere', colors=STONE[1:])  # pot
    s.fill(rect(20, 16, 6, 3), IRON[3])
    return finish(s)


def fireplace():
    s = base(64, 80)
    for x in range(4, 60):
        for y in range(4, 76):
            row = (y - 4) // 6
            j = (y - 4) % 6 == 5 or (x + row * 5) % 12 == 0
            s.set(x, y, STONE[0] if j else STONE[3] if (y - 4) % 6 == 0 else STONE[2])
    s.shade(rect(0, 34, 64, 6), None, 'cyl_side', colors=WOOD)  # mantel
    s.fill(rect(10, 30, 4, 4), '#d8b048'); s.fill(rect(48, 28, 5, 6), '#7a4a8a')  # trinkets
    mouth = {(x, y) for x in range(16, 48) for y in range(46, 76) if y > 54 or ((x + .5 - 32) / 16) ** 2 + ((y - 55) / 9) ** 2 <= 1}
    s.fill(mouth, '#1a0c08')
    r = rng(3)
    for x, y in mouth:
        if y > 62 and r.random() < .85:
            heat = 1 - abs(x - 32) / 16 + r.uniform(-.3, .3) - (y - 62) / 30
            s.set(x, y, FIRE[max(0, min(4, int(heat * 5)))])
    for x in range(18, 46, 3):
        s.set(x, 73, IRON[2])
    s.meta = {'light': [32, 66]}
    return finish(s)


def bookshelf():
    s = base(64, 84)
    s.shade(rect(2, 2, 60, 80), None, 'form', colors=WOOD)
    r = rng(5)
    for k in range(4):
        y = 8 + k * 18
        s.fill(rect(6, y, 52, 14), WOOD[0])
        x = 7
        while x < 56:
            bw = r.randrange(3, 6)
            bh = r.randrange(9, 14)
            col = r.choice([CLOTH['red'], CLOTH['blue'], CLOTH['green'], CLOTH['purple'], CLOTH['cream']])
            s.fill(rect(x, y + 14 - bh, bw, bh), col[2]); s.fill(rect(x, y + 14 - bh, 1, bh), col[3]); s.fill(rect(x + bw - 1, y + 14 - bh, 1, bh), col[0])
            s.set(x + 1, y + 16 - bh, '#e8c040')
            x += bw + (1 if r.random() < .2 else 0)
        s.fill(rect(4, y + 14, 56, 2), WOOD[3])
    return finish(s)


def dresser():
    s = base(64, 48)
    s.shade(rect(4, 6, 56, 40), None, 'form', colors=WOOD[1:])
    for k in range(3):
        s.fill(rect(8, 12 + k * 11, 48, 1), WOOD[0])
        s.set(31, 17 + k * 11, '#e8c040'); s.set(32, 17 + k * 11, '#e8c040')
    s.shade(rect(40, 0, 8, 7), None, 'cyl', colors=['#2a5a32', '#3e7a44', '#5a9a5a'])  # vase
    s.fill(ellipse(44, -1, 4, 3), '#ff7aa0')
    return finish(s)


def plant():
    s = base(32, 48)
    s.shade(poly([(9, 34), (23, 34), (21, 46), (11, 46)]), None, 'form', colors=['#7a3a1e', '#a8582e', '#c8703a', '#e08a4a'])
    r = rng(8)
    for k in range(9):
        a = -math.pi / 2 + (k - 4) * .32
        L = r.randrange(14, 26)
        tip = (16 + math.cos(a) * L, 34 + math.sin(a) * L)
        s.shade(poly([(16, 34), (tip[0] - 3, tip[1] + 2), tip, (tip[0] + 3, tip[1] + 2)]), None, 'form', colors=['#1e4a22', '#2e6a2e', '#4a8a3a', '#6aa848'])
    return finish(s)


def barrel():
    s = base(32, 40)
    s.shade(rect(6, 8, 20, 28), None, 'cyl', colors=WOOD)
    for x in range(8, 26, 4):
        s.fill(rect(x, 10, 1, 26), WOOD[1])
    for y in (13, 29):
        s.shade(rect(6, y, 20, 2), None, 'cyl', colors=IRON[1:])
    s.shade(ellipse(16, 8, 10, 4), None, 'sphere', colors=WOOD[1:])
    s.fill(ellipse(16, 8, 7, 2.5), WOOD[1])
    return finish(s)


def crate():
    s = base(32, 36)
    s.shade(rect(4, 8, 24, 26), None, 'form', colors=LWOOD[1:])
    s.fill(rect(4, 8, 24, 2) | rect(4, 32, 24, 2) | rect(4, 8, 2, 26) | rect(26, 8, 2, 26), LWOOD[0])
    s.fill(line(6, 10, 25, 31), LWOOD[1])
    s.fill(rect(4, 4, 24, 5), LWOOD[3]); s.fill(rect(4, 4, 24, 1), LWOOD[4])
    return finish(s)


def sack():
    s = base(32, 32)
    s.shade(poly([(8, 30), (6, 16), (11, 8), (21, 8), (26, 16), (24, 30)]), None, 'form', colors=['#7a6440', '#a88e5e', '#c8ae7a', '#e2cc98'])
    s.fill(rect(12, 7, 8, 2), '#5a4228')
    s.fill(ellipse(16, 6, 4, 2), '#e8d8a0')
    return finish(s)


def shelf_goods(kind='store'):
    s = base(64, 84)
    s.shade(rect(2, 2, 60, 80), None, 'form', colors=LWOOD[:4])
    r = rng(len(kind) * 7)
    for k in range(4):
        y = 8 + k * 18
        s.fill(rect(6, y, 52, 14), LWOOD[0])
        for i in range(6):
            x = 8 + i * 8
            if kind == 'tavern':
                col = r.choice([['#1a3a22', '#2a6a3a', '#5aa070'], ['#4a1a1a', '#8a2a2a', '#c04a3a'], ['#5a4a1a', '#a88a2a', '#e0c050']])
                s.shade(rect(x + 1, y + 4, 5, 10), None, 'cyl', colors=col); s.fill(rect(x + 2, y + 1, 3, 3), col[0])
            elif kind == 'museum':
                s.shade(ellipse(x + 3.5, y + 9, 3, 4), None, 'sphere', colors=r.choice([['#7a3a1e', '#c8703a', '#e8a070'], ['#2a4a6a', '#4a7aaa', '#8ab4d8'], ['#6a6a3a', '#a8a050', '#e0d890']]))
            else:  # jars of seeds, preserves, flour bags
                col = r.choice([['#8a2a3a', '#c84a5a', '#e87a8a'], ['#6a5a1a', '#c8a030', '#f0d060'], ['#2a5a2a', '#4a8a3a', '#7ab858'], ['#a8987e', '#d0c2a6', '#f0e6cc']])
                s.shade(rect(x, y + 5, 7, 9), None, 'cyl', colors=col)
                s.fill(rect(x + 1, y + 3, 5, 2), LWOOD[3])
        s.fill(rect(4, y + 14, 56, 2), LWOOD[3])
    return finish(s)


def counter(dark=False):
    s = base(96, 48)
    pal = WOOD if dark else LWOOD
    plank_top(s, 2, 4, 92, 12, pal)
    s.fill(rect(2, 4, 92, 1), pal[4])
    for x in range(2, 94):
        for y in range(16, 46):
            s.set(x, y, pal[1] if (x - 2) % 10 == 0 else pal[2])
    s.fill(rect(2, 16, 92, 2), pal[0])
    if dark:  # tavern bar: mugs on top
        for x in (12, 30, 70):
            s.shade(rect(x, 4, 6, 8), None, 'cyl', colors=['#6a4a2a', '#a07040', '#c89858', '#f0e8d0'])
            s.fill(rect(x, 4, 6, 2), '#fff8e8')
    else:  # shop counter: scales + coin tray + ledger
        s.fill(rect(14, 6, 14, 2), IRON[3]); s.fill(rect(20, 2, 2, 5), IRON[2]); s.fill(ellipse(15, 5, 3, 1.5) | ellipse(27, 5, 3, 1.5), '#c8a040')
        s.fill(rect(62, 6, 16, 8), '#e8dcc0'); s.fill(rect(70, 6, 1, 8), '#a89878'); s.fill(rect(64, 8, 4, 1) | rect(72, 10, 4, 1), '#6a5a4a')
        for i in range(4):
            s.set(42 + i * 2, 9, '#f2c040'); s.set(43 + i * 2, 10, '#c8901a')
    return finish(s)


def keg_rack():
    s = base(64, 48)
    s.fill(rect(4, 34, 56, 4), WOOD[1]); s.fill(rect(6, 38, 3, 8) | rect(55, 38, 3, 8), WOOD[0])
    for cx in (17, 47):
        s.shade(ellipse(cx, 22, 13, 13), None, 'sphere', colors=WOOD)
        s.fill(ellipse(cx, 22, 13, 13) - ellipse(cx, 22, 11, 11), IRON[2])
        s.fill(ellipse(cx, 22, 4, 4), WOOD[1]); s.fill(rect(cx - 1, 30, 3, 4), '#c8a040')
    return finish(s)


def display_case():
    s = base(64, 52)
    s.shade(rect(2, 30, 60, 20), None, 'form', colors=WOOD[1:])
    for x in range(4, 60):
        for y in range(4, 30):
            s.set(x, y, '#cfeef8' if (x - y) % 19 > 2 else '#ffffff')
    s.fill(rect(4, 4, 56, 1) | rect(4, 29, 56, 1) | rect(4, 4, 1, 26) | rect(59, 4, 1, 26) | rect(31, 4, 1, 26), '#8a8478')
    s.shade(ellipse(16, 22, 6, 5), None, 'sphere', colors=['#5a2a6a', '#8a4aaa', '#c88ae0', '#f0d0ff'])  # gem
    s.shade(poly([(40, 26), (44, 12), (48, 12), (52, 26)]), None, 'form', colors=['#5a4a2a', '#a8884a', '#e0c070', '#fff0b0'])  # fossil / relic
    return finish(s)


def pedestal():
    s = base(32, 56)
    s.shade(rect(8, 22, 16, 32), None, 'cyl', colors=['#a8a294', '#d8d2c4', '#f4f0e6', '#ffffff'])
    s.fill(rect(5, 20, 22, 4), '#e8e2d2'); s.fill(rect(5, 50, 22, 4), '#c8c2b2')
    s.shade(poly([(11, 20), (9, 12), (12, 4), (20, 4), (23, 12), (21, 20)]), None, 'form', colors=['#6a2a14', '#a84a24', '#d0703a', '#f0a060'])  # urn
    for x in range(10, 23, 3):
        s.set(x, 12, '#2a1a10')
    return finish(s)


def hay():
    s = base(32, 32)
    s.shade(rect(3, 8, 26, 22), None, 'form', colors=['#8a6a20', '#c09a34', '#e0c050', '#f4e080'])
    r = rng(2)
    for _ in range(30):
        x, y = r.randrange(4, 28), r.randrange(9, 29)
        s.set(x, y, r.choice(['#a8862a', '#f8ec98']))
    s.fill(rect(3, 15, 26, 1) | rect(3, 23, 26, 1), '#6a4a1a')
    return finish(s)


def trough():
    s = base(64, 32)
    s.shade(rect(2, 8, 60, 20), None, 'form', colors=WOOD)
    s.fill(rect(6, 10, 52, 10), '#3a6a98'); s.fill(rect(6, 10, 52, 2), '#8ab4d8')
    for x in range(10, 56, 9):
        s.set(x, 14, '#c8e2f4')
    return finish(s)


def nest_box():
    s = base(64, 48)
    s.shade(rect(2, 4, 60, 40), None, 'form', colors=LWOOD[:4])
    for k in range(3):
        x = 6 + k * 19
        s.fill(rect(x, 10, 16, 14), '#2a1a10')
        s.fill(rect(x, 18, 16, 6), '#d8b84a')
        s.shade(ellipse(x + 8, 18, 3, 3.5), None, 'sphere', colors=['#c8b090', '#ece0c8', '#fffaf0'])
    s.fill(rect(2, 28, 60, 2), LWOOD[0])
    return finish(s)


def saddle_rack():
    s = base(32, 48)
    s.fill(rect(14, 20, 4, 26), WOOD[2]); s.fill(rect(8, 44, 16, 3), WOOD[1])
    s.shade(poly([(4, 22), (8, 10), (24, 10), (28, 22), (22, 28), (10, 28)]), None, 'form', colors=['#3a1a10', '#6a3418', '#9a5228', '#c8783a'])
    s.fill(rect(15, 26, 2, 10), '#e8c040')
    return finish(s)


def workbench():
    s = base(64, 48)
    plank_top(s, 2, 8, 60, 14, LWOOD)
    s.fill(rect(2, 22, 60, 4), LWOOD[1])
    for x in (4, 55):
        s.fill(rect(x, 26, 5, 20), LWOOD[1])
    s.fill(rect(8, 38, 48, 3), LWOOD[1])
    s.fill(line(10, 16, 22, 10), IRON[3]); s.fill(rect(20, 9, 5, 3), IRON[2])  # hammer
    s.fill(rect(34, 12, 18, 3), IRON[4]); s.fill(rect(50, 10, 5, 7), WOOD[2])  # saw
    for x in range(35, 50, 2):
        s.set(x, 15, IRON[2])
    s.fill(rect(26, 4, 6, 5), '#c8b080')  # shavings
    return finish(s)


def lumber():
    s = base(64, 36)
    for k, y in enumerate((22, 14, 6)):
        for i in range(4 - k):
            x = 4 + k * 7 + i * 14
            s.shade(rect(x, y, 13, 9), None, 'form', colors=LWOOD)
            s.fill(ellipse(x + 2, y + 4, 2, 3), LWOOD[4]); s.set(x + 2, y + 4, LWOOD[1])
    return finish(s)


def anvil():
    s = base(32, 40)
    s.shade(ellipse(16, 32, 10, 6), None, 'cyl', colors=WOOD)
    s.fill(ellipse(16, 29, 9, 3), WOOD[3])
    top = poly([(1, 12), (8, 10), (30, 10), (30, 16), (8, 16), (1, 14)])
    s.shade(top, None, 'form', colors=IRON)
    s.shade(rect(12, 16, 9, 7), None, 'cyl', colors=IRON)
    s.shade(rect(8, 22, 17, 4), None, 'form', colors=IRON)
    s.fill(rect(9, 10, 20, 1), IRON[4])
    return finish(s)


def tub():
    s = base(32, 36)
    s.shade(rect(3, 12, 26, 20), None, 'cyl', colors=WOOD)
    s.shade(ellipse(16, 12, 13, 6), None, 'sphere', colors=WOOD[1:])
    s.shade(ellipse(16, 12, 10, 4), None, 'sphere', colors=['#1a2a4a', '#30588a', '#4a7aaa', '#8ab4d8'], light='bottom_right')
    s.fill(rect(3, 18, 26, 2) | rect(3, 27, 26, 2), IRON[2])
    s.fill(line(22, 2, 26, 14), IRON[3])
    return finish(s)


def weapon_rack():
    s = base(64, 60)
    s.fill(rect(2, 14, 60, 4), WOOD[3]); s.fill(rect(2, 46, 60, 5), WOOD[2]); s.fill(rect(4, 18, 3, 40) | rect(57, 18, 3, 40), WOOD[1])
    for i, kind in enumerate(['sword', 'axe', 'sword', 'spear', 'sword']):
        bx = 9 + i * 10
        if kind == 'sword':
            s.shade(rect(bx, 4, 3, 36), None, 'cyl', colors=IRON[2:])
            s.fill(rect(bx - 2, 40, 7, 2), '#c8a040'); s.fill(rect(bx + 1, 42, 1, 6), WOOD[1])
        elif kind == 'axe':
            s.fill(rect(bx + 1, 6, 2, 42), WOOD[3])
            s.shade(poly([(bx + 3, 6), (bx + 9, 2), (bx + 9, 16), (bx + 3, 12)]), None, 'form', colors=IRON[1:])
        else:
            s.fill(rect(bx + 1, 6, 2, 42), WOOD[3])
            s.shade(poly([(bx + 2, 0), (bx + 5, 8), (bx - 1, 8)]), None, 'form', colors=IRON[1:])
    return finish(s)


def coal_pile():
    s = base(32, 28)
    r = rng(6)
    for _ in range(16):
        x, y = r.uniform(5, 27), r.uniform(10, 24)
        s.shade(ellipse(x, y, r.uniform(2, 3.5), r.uniform(1.5, 2.5)), None, 'sphere', colors=['#14141c', '#22232e', '#343648', '#5a5e74'])
    return finish(s)


def big_forge():
    s = base(64, 96)
    for x in range(10, 54):  # hood
        for y in range(2, 34):
            half = 10 + (y - 2) * 12 / 32
            if abs(x - 32) <= half:
                row = (y - 2) // 4
                s.set(x, y, STONE[0] if (y - 2) % 4 == 3 else STONE[3] if x < 32 - half * .3 else STONE[2])
    s.shade(rect(4, 34, 56, 5), None, 'cyl_side', colors=WOOD)
    for x in range(6, 58):
        for y in range(39, 92):
            row = (y - 39) // 5
            j = (y - 39) % 5 == 4 or (x + row * 4) % 10 == 0
            s.set(x, y, STONE[0] if j else STONE[2] if x > 20 else STONE[3])
    mouth = {(x, y) for x in range(18, 46) for y in range(50, 80) if y > 60 or ((x + .5 - 32) / 14) ** 2 + ((y - 61) / 11) ** 2 <= 1}
    s.fill(mouth, '#2a0e0a')
    r = rng(9)
    for x, y in mouth:
        if y > 62 and r.random() < .9:
            heat = 1 - abs(x - 32) / 14 + r.uniform(-.25, .25)
            s.set(x, y, FIRE[max(0, min(4, int(heat * 5.2)))])
    s.fill(rect(4, 88, 56, 4), STONE[1]); s.fill(rect(4, 88, 56, 1), STONE[3])
    s.meta = {'light': [32, 70]}
    return finish(s)


def net_rack():
    s = base(64, 56)
    s.fill(rect(4, 6, 3, 48) | rect(57, 6, 3, 48), WOOD[2]); s.fill(rect(2, 6, 60, 3), WOOD[3])
    for x in range(8, 57):
        for y in range(10, 44):
            if (x + y) % 6 == 0 or (x - y) % 6 == 0:
                s.set(x, y + (abs(x - 32) // 10), '#c8b890')
    s.shade(ellipse(20, 40, 6, 3), None, 'sphere', colors=['#2a4a6a', '#4a7ab0', '#8ab4d8'])  # hanging fish
    s.shade(ellipse(42, 36, 5, 2.5), None, 'sphere', colors=['#6a3a2a', '#c8705a', '#f0a080'])
    return finish(s)


def lamp():
    s = base(32, 48)
    s.fill(rect(15, 14, 3, 30), IRON[1]); s.fill(rect(10, 42, 13, 3), IRON[2])
    s.shade(rect(11, 4, 11, 11), None, 'form', colors=IRON[1:])
    s.fill(rect(13, 6, 7, 7), FIRE[3]); s.fill(rect(15, 8, 3, 3), FIRE[4])
    s.meta = {'light': [16, 9]}
    return finish(s, False)


def bench():
    s = base(64, 32)
    plank_top(s, 2, 6, 60, 10, LWOOD)
    s.fill(rect(2, 16, 60, 3), LWOOD[1])
    for x in (6, 54):
        s.fill(rect(x, 19, 4, 11), LWOOD[1])
    return finish(s)


# ---- decals (painted into the room) ---------------------------------------
def rug(color, w=96, h=64):
    s = Canvas(w, h)
    c = CLOTH[color]
    s.fill(rect(0, 0, w, h), c[1])
    s.fill(rect(4, 4, w - 8, h - 8), c[2])
    s.fill(rect(8, 8, w - 16, h - 16), c[1])
    for x in range(10, w - 10):
        for y in range(10, h - 10):
            if (x + y) % 10 == 0 or (x - y) % 10 == 0:
                s.set(x, y, CLOTH['cream'][1])
    for x in range(0, w, 3):  # fringe
        s.set(x, 0, CLOTH['cream'][2]); s.set(x, h - 1, CLOTH['cream'][2])
    return s


def window_dec():
    s = Canvas(32, 28)
    s.fill(rect(2, 0, 28, 26), WOOD[1])
    for x in range(4, 28):
        for y in range(2, 22):
            s.set(x, y, '#cfeefa' if (x + y) < 18 else '#8ac4e4' if y < 14 else '#5a9ac8')
    s.fill(rect(15, 2, 2, 20) | rect(4, 11, 24, 2), WOOD[2])
    s.fill(rect(0, 22, 32, 4), WOOD[3]); s.fill(rect(0, 22, 32, 1), WOOD[4])
    s.set(6, 4, '#ffffff'); s.set(7, 4, '#ffffff'); s.set(6, 5, '#ffffff')
    return s


def painting():
    s = Canvas(32, 24)
    s.fill(rect(2, 2, 28, 20), '#c8a040'); s.fill(rect(4, 4, 24, 16), '#8ac4e4')
    s.fill(rect(4, 14, 24, 6), '#5a9a40'); s.fill(poly([(8, 14), (14, 7), (20, 14)]), '#8a8890'); s.fill(ellipse(22, 8, 2, 2), '#ffe080')
    return s


def banner(color):
    s = Canvas(24, 40)
    c = CLOTH[color]
    s.fill(rect(0, 0, 24, 3), WOOD[2])
    s.fill(poly([(3, 3), (21, 3), (21, 36), (12, 30), (3, 36)]), c[2])
    s.fill(rect(3, 3, 2, 30), c[3]); s.fill(rect(19, 3, 2, 30), c[1])
    s.fill(ellipse(12, 15, 4, 4), '#e8c040'); s.fill(ellipse(12, 15, 2, 2), c[1])
    return s


def wall_shelf():
    s = Canvas(64, 24)
    s.fill(rect(0, 16, 64, 3), WOOD[3]); s.fill(rect(0, 19, 64, 1), WOOD[0])
    r = rng(4)
    for i in range(7):
        x = 3 + i * 9
        col = r.choice([['#7a3a1e', '#c8703a', '#e8a070'], ['#4a6a8a', '#7aa0c8', '#b8d4ec'], ['#8a8478', '#c8c2b2', '#f0ece0']])
        s.shade(rect(x, 6 + (i % 2) * 2, 6, 10 - (i % 2) * 2), None, 'cyl', colors=col)
    return s


SPRITES = {
    'furn_bed': bed, 'furn_table': table, 'furn_table_cloth': lambda: table('red'), 'furn_chair': chair, 'furn_stool': stool,
    'furn_stove': stove, 'furn_fireplace': fireplace, 'furn_bookshelf': bookshelf, 'furn_dresser': dresser, 'furn_plant': plant,
    'furn_barrel': barrel, 'furn_crate': crate, 'furn_sack': sack, 'furn_shelf_store': shelf_goods,
    'furn_shelf_tavern': lambda: shelf_goods('tavern'), 'furn_shelf_museum': lambda: shelf_goods('museum'),
    'furn_counter': counter, 'furn_bar': lambda: counter(True), 'furn_kegs': keg_rack, 'furn_display': display_case,
    'furn_pedestal': pedestal, 'furn_hay': hay, 'furn_trough': trough, 'furn_nestbox': nest_box, 'furn_saddle': saddle_rack,
    'furn_workbench': workbench, 'furn_lumber': lumber, 'furn_anvil': anvil, 'furn_tub': tub, 'furn_weapons': weapon_rack,
    'furn_coal': coal_pile, 'furn_forge': big_forge, 'furn_nets': net_rack, 'furn_lamp': lamp, 'furn_bench': bench,
    'dec_rug_red': lambda: rug('red'), 'dec_rug_blue': lambda: rug('blue'), 'dec_rug_green': lambda: rug('green'),
    'dec_rug_purple': lambda: rug('purple', 128, 64), 'dec_rug_small': lambda: rug('red', 64, 32),
    'dec_window': window_dec, 'dec_painting': painting, 'dec_banner_red': lambda: banner('red'), 'dec_banner_blue': lambda: banner('blue'),
    'dec_shelf': wall_shelf,
}
