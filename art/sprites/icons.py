"""Item icon templates (32x32), one per icon shape used by items (it.sh) and tools.

Channel codes RGB(255, ch, level): ch 0 = the item's colour (c), ch 1 = its second
colour (c2, or a darker shade of c). Wood, steel and paper parts use real colours.
itemIcon in h_pixel.js recolours them; 'obj' icons reuse the object sprite.
"""
import math
from px import Canvas, rect, ellipse, poly, line

WOOD = ['#4a2e1a', '#7a4e2c', '#a8743f', '#c8925a']
STEEL = ['#3a3e4a', '#6a7084', '#9aa2b4', '#d8dee8']
PAPER = ['#a8987e', '#d8caa8', '#f0e6cc', '#fff8e8']
LEAFC = ['#1e4a22', '#2e6a2e', '#4a8a3a', '#6aa848']


def C(ch):
    return [(255, ch, k, 255) for k in range(4)]


def I():
    return Canvas(32, 32)


def fin(s):
    s.outline()
    return s


def blob(s, m, ch=0, mode='form'):
    s.shade(m, None, mode, colors=C(ch) if isinstance(ch, int) else ch)


def handle(s, x0, y0, x1, y1):
    s.fill(line(x0, y0, x1, y1) | line(x0 + 1, y0, x1 + 1, y1), WOOD[2]); s.fill(line(x0 + 2, y0, x1 + 2, y1), WOOD[1])


def sword(blade=0):
    s = I()
    blob(s, poly([(24, 3), (28, 4), (12, 20), (9, 18)]), blade)
    s.fill(line(25, 5, 11, 19), C(blade)[3])
    s.fill(line(6, 15, 14, 23) | line(7, 15, 15, 23), '#c8a040')
    handle(s, 3, 27, 8, 22); s.fill(rect(2, 27, 3, 3), '#c8a040')
    return fin(s)


def S(fn):
    return lambda: fin(fn())


def shapes():
    out = {}

    def reg(name):
        def deco(fn):
            out[name] = fn
            return fn
        return deco

    @reg('sword')
    def _():
        return sword()

    @reg('dagger')
    def _():
        s = I(); blob(s, poly([(22, 8), (25, 9), (14, 20), (12, 18)])); s.fill(line(9, 16, 16, 23), '#c8a040'); handle(s, 6, 26, 10, 22); return fin(s)

    @reg('spear')
    def _():
        s = I(); handle(s, 4, 29, 22, 11); blob(s, poly([(28, 3), (26, 12), (22, 10), (20, 6)])); return fin(s)

    @reg('hammer')
    def _():
        s = I(); handle(s, 5, 28, 18, 13); blob(s, poly([(12, 8), (22, 2), (29, 11), (19, 17)])); return fin(s)

    @reg('axe')
    def _():
        s = I(); handle(s, 6, 29, 20, 6); blob(s, poly([(18, 6), (28, 4), (30, 14), (22, 16)])); s.fill(line(29, 5, 30, 13), C(0)[3]); return fin(s)

    @reg('pick')
    def _():
        s = I(); handle(s, 7, 29, 19, 9); blob(s, poly([(4, 10), (14, 4), (26, 6), (30, 14), (24, 10), (14, 8), (6, 14)])); return fin(s)

    @reg('hoe')
    def _():
        s = I(); handle(s, 6, 29, 22, 6); blob(s, poly([(18, 4), (28, 6), (28, 12), (24, 10)])); return fin(s)

    @reg('scythe')
    def _():
        s = I(); handle(s, 8, 30, 20, 5); s.fill(line(11, 20, 16, 21) | line(11, 21, 16, 22), WOOD[1])  # snath and grip
        blob(s, poly([(22, 4), (14, 3), (7, 5), (2, 11), (8, 8), (14, 7), (22, 8)]))
        s.fill(line(21, 4, 13, 4) | line(13, 4, 6, 7), C(0)[3]); return fin(s)

    @reg('multi')
    def _():  # the ember multitool: axe blade, pick spike and a scythe hook on one rune-bound haft
        s = I(); handle(s, 7, 30, 19, 8)
        blob(s, poly([(19, 7), (28, 3), (30, 12), (22, 13)]))                      # axe blade (right)
        blob(s, poly([(18, 9), (10, 5), (3, 6), (9, 8), (16, 11)]))                # pick spike (left)
        blob(s, poly([(20, 6), (19, 1), (13, 1), (8, 3), (14, 3), (18, 4)]), 1)   # scythe hook on top
        s.fill(line(29, 4, 30, 11), C(0)[3]); s.fill(line(19, 2, 13, 2), C(1)[3])
        s.fill(rect(16, 15, 3, 3), '#ff8a2a'); s.set(17, 16, '#ffe08a')             # ember rune on the haft
        return fin(s)

    @reg('staff')
    def _():  # a long haft with a gem held in a claw head (the gem takes the item colour)
        s = I(); handle(s, 6, 30, 22, 8)
        s.fill(line(20, 9, 19, 4) | line(24, 9, 26, 4) | line(22, 10, 22, 3), WOOD[1])
        blob(s, ellipse(22, 6, 4, 4), 0, 'sphere'); s.set(21, 4, C(0)[3]); s.set(20, 5, '#ffffff')
        return fin(s)

    @reg('robe')
    def _():  # a hooded robe with a sash
        s = I(); blob(s, poly([(11, 6), (21, 6), (25, 29), (7, 29)]), 0)
        blob(s, poly([(5, 10), (11, 7), (10, 20), (5, 22)]), 0); blob(s, poly([(27, 10), (21, 7), (22, 20), (27, 22)]), 0)
        s.fill(rect(9, 16, 14, 2), C(1)[2]); s.fill(line(16, 7, 16, 28), C(0)[0]); s.fill(poly([(12, 5), (16, 9), (20, 5), (16, 3)]), C(0)[1])
        return fin(s)

    @reg('hat')
    def _():  # a wide-brimmed pointed wizard hat
        s = I(); blob(s, poly([(16, 3), (22, 20), (10, 20)]), 0); s.fill(line(16, 3, 19, 6), C(0)[3])
        blob(s, ellipse(16, 22, 13, 4), 0); s.fill(rect(10, 18, 12, 2), C(1)[2]); s.set(19, 12, '#fff6a8')
        return fin(s)

    @reg('can')
    def _():
        s = I(); blob(s, rect(6, 12, 16, 15), 0); s.fill(line(22, 16, 29, 10) | line(22, 17, 29, 11), C(0)[1])
        s.fill(rect(28, 8, 3, 3), C(0)[2]); s.fill(line(9, 12, 14, 6) | line(14, 6, 19, 12), C(0)[1]); return fin(s)

    @reg('rod')
    def _():
        s = I(); s.fill(line(4, 29, 27, 4), WOOD[2]); s.fill(line(5, 29, 28, 4), WOOD[1])
        s.fill(line(27, 4, 27, 20), '#e8e8e8'); s.fill(ellipse(27, 21, 2, 2), '#e8342a'); s.fill(ellipse(9, 24, 3, 3), C(0)[2]); return fin(s)

    @reg('bow')
    def _():
        s = I()
        for t in range(40):
            a = -1.1 + t / 39 * 2.2
            s.set(round(10 + math.cos(a) * 14), round(16 + math.sin(a) * 13), C(0)[2]); s.set(round(11 + math.cos(a) * 14), round(16 + math.sin(a) * 13), C(0)[1])
        s.fill(line(17, 4, 17, 28), '#f0e8d8'); return fin(s)

    @reg('arrow')
    def _():
        s = I()
        for k in range(3):
            s.fill(line(6 + k * 4, 28, 24 + k * 2, 6), WOOD[2]); blob(s, poly([(24 + k * 2, 3), (27 + k * 2, 8), (22 + k * 2, 8)]))
            s.fill({(6 + k * 4, 28), (5 + k * 4, 26), (8 + k * 4, 28)}, '#f0f0f0')
        return fin(s)

    @reg('shield')
    def _():
        s = I(); blob(s, poly([(5, 4), (27, 4), (27, 16), (16, 30), (5, 16)])); blob(s, poly([(10, 8), (22, 8), (22, 16), (16, 24), (10, 16)]), 1)
        s.fill(rect(15, 8, 2, 16) | rect(10, 13, 12, 2), C(0)[3]); return fin(s)

    @reg('helm')
    def _():
        s = I(); blob(s, {p for p in ellipse(16, 18, 12, 13) if p[1] < 22}); s.fill(rect(4, 20, 24, 4), C(0)[1])
        s.fill(rect(9, 14, 14, 3), '#1a1418'); s.fill(rect(15, 14, 2, 9), C(0)[2]); return fin(s)

    @reg('boots')
    def _():
        s = I()
        for x in (5, 17):
            blob(s, rect(x, 6, 8, 16)); blob(s, rect(x, 20, 12, 7), 1)
        return fin(s)

    @reg('ring')
    def _():
        s = I(); s.fill(ellipse(16, 19, 9, 9) - ellipse(16, 19, 6, 6), '#e8c040'); s.fill(ellipse(16, 19, 9, 9) - ellipse(16, 18, 8, 8), '#a87a20')
        blob(s, ellipse(16, 9, 4, 4), 0, 'sphere'); return fin(s)

    @reg('bar')
    def _():
        s = I(); blob(s, poly([(4, 24), (9, 12), (28, 12), (25, 24)])); s.fill(poly([(9, 12), (28, 12), (26, 16), (8, 16)]), C(0)[3]); return fin(s)

    @reg('ore')
    def _():
        s = I(); s.shade(poly([(4, 24), (6, 12), (16, 6), (26, 10), (28, 24), (16, 28)]), None, 'form', colors=['#4a4640', '#6a645a', '#8a8478', '#aaa498'])
        for x, y in ((10, 14), (18, 12), (14, 21), (22, 19)):
            s.fill(rect(x, y, 3, 3), C(0)[2]); s.set(x, y, C(0)[3])
        return fin(s)

    @reg('gem')
    def _():
        s = I(); blob(s, poly([(16, 4), (27, 13), (16, 29), (5, 13)])); s.fill(poly([(16, 4), (27, 13), (16, 13)]), C(0)[3]); s.fill(line(5, 13, 27, 13), C(0)[1]); return fin(s)

    @reg('shard')
    def _():
        s = I(); blob(s, poly([(16, 3), (23, 14), (18, 29), (10, 21), (9, 11)])); s.fill(line(16, 5, 14, 20), C(0)[3]); return fin(s)

    @reg('stone')
    def _():
        s = I(); blob(s, ellipse(16, 18, 11, 9), ['#4a4640', '#6a645a', '#8a8478', '#aaa498']); return fin(s)

    @reg('core')
    def _():
        s = I(); blob(s, ellipse(16, 16, 10, 10), 0, 'sphere'); blob(s, ellipse(16, 16, 5, 5), 1, 'sphere'); return fin(s)

    @reg('log')
    def _():
        s = I(); s.shade(rect(4, 10, 20, 14), None, 'cyl_side', colors=WOOD); s.shade(ellipse(25, 17, 5, 7), None, 'sphere', colors=['#8a6a40', '#c49a68', '#e8c890', '#f8e0b0']); return fin(s)

    @reg('fiber')
    def _():
        s = I()
        for k in range(6):
            s.fill(line(8 + k * 3, 28, 12 + k * 2, 4), C(0)[1 + k % 3])
        s.fill(rect(8, 16, 18, 3), WOOD[1]); return fin(s)

    @reg('hay')
    def _():
        s = I(); blob(s, rect(4, 9, 24, 17), ['#8a6a20', '#c09a34', '#e0c050', '#f4e080']); s.fill(rect(4, 14, 24, 1) | rect(4, 20, 24, 1), '#6a4a1a'); return fin(s)

    @reg('wool')
    def _():
        s = I()
        for cx, cy in ((11, 13), (21, 13), (16, 20), (9, 21), (23, 21)):
            blob(s, ellipse(cx, cy, 6, 5), 0, 'sphere')
        return fin(s)

    @reg('cloth')
    def _():
        s = I(); blob(s, poly([(4, 8), (24, 6), (28, 24), (8, 27)])); s.fill(line(4, 8, 8, 27), C(0)[3]); s.fill(line(12, 10, 15, 25), C(0)[1]); return fin(s)

    @reg('hide')
    def _():
        s = I(); blob(s, poly([(6, 6), (12, 9), (20, 9), (26, 6), (24, 16), (27, 26), (19, 23), (13, 23), (5, 26), (8, 16)])); return fin(s)

    @reg('scale')
    def _():
        s = I()
        for x, y in ((10, 10), (20, 10), (15, 18), (9, 24), (21, 24)):
            blob(s, {p for p in ellipse(x, y, 5, 5) if p[1] >= y - 3}, 0, 'sphere')
        return fin(s)

    @reg('feather')
    def _():
        s = I(); blob(s, poly([(26, 3), (20, 18), (8, 28), (12, 16)])); s.fill(line(26, 4, 7, 29), C(0)[3]); return fin(s)

    @reg('wing')
    def _():
        s = I(); blob(s, poly([(4, 8), (28, 4), (26, 14), (20, 24), (14, 18), (8, 22)])); s.fill(line(4, 8, 26, 14) | line(10, 8, 14, 18), C(0)[1]); return fin(s)

    @reg('bone')
    def _():
        s = I(); s.shade(rect(9, 13, 14, 6), None, 'cyl_side', colors=PAPER)
        for x in (7, 25):
            for y in (12, 20):
                s.shade(ellipse(x, y, 3, 3), None, 'sphere', colors=PAPER)
        return fin(s)

    @reg('fang')
    def _():
        s = I(); s.shade(poly([(10, 5), (22, 5), (18, 20), (13, 29)]), None, 'form', colors=PAPER); s.fill(rect(10, 5, 12, 3), C(0)[1]); return fin(s)

    @reg('goo')
    def _():
        s = I(); blob(s, {p for p in ellipse(16, 20, 12, 9) if p[1] > 13 or abs(p[0] - 16) < 6}); s.fill({(11, 16), (12, 15)}, '#ffffff'); return fin(s)

    @reg('egg')
    def _():
        s = I(); blob(s, ellipse(16, 17, 9, 12), 0, 'sphere'); s.fill({(12, 11), (12, 12), (13, 10)}, '#ffffff'); return fin(s)

    @reg('foot')
    def _():
        s = I(); blob(s, ellipse(16, 20, 7, 9)); blob(s, ellipse(16, 9, 4, 4), 1, 'sphere'); s.fill(line(16, 2, 16, 6), '#e8c040'); return fin(s)

    @reg('heart')
    def _():
        s = I(); blob(s, ellipse(11, 12, 6, 6) | ellipse(21, 12, 6, 6) | poly([(5, 14), (27, 14), (16, 28)]), 0, 'sphere'); s.fill({(9, 9), (10, 9), (9, 10)}, '#ffffff'); return fin(s)

    @reg('fish')
    def _():
        s = I(); blob(s, ellipse(14, 16, 11, 6)); blob(s, poly([(23, 16), (30, 9), (30, 23)]), 1)
        s.fill(poly([(12, 10), (18, 6), (18, 11)]), C(1)[2]); s.fill({(7, 14), (7, 15)}, '#1a1418'); s.set(7, 14, '#ffffff'); return fin(s)

    @reg('round')
    def _():
        s = I(); blob(s, ellipse(16, 18, 11, 10), 0, 'sphere'); s.fill(line(16, 8, 18, 3), WOOD[1]); s.shade(ellipse(21, 6, 4, 2), None, 'form', colors=C(1)); s.fill({(11, 13), (12, 12)}, '#ffffff'); return fin(s)

    @reg('root')
    def _():
        s = I(); blob(s, poly([(10, 12), (22, 12), (18, 26), (16, 30), (14, 26)]))
        for a in (-2.4, -1.57, -.7):
            s.shade(poly([(16, 12), (16 + math.cos(a) * 10 - 2, 12 + math.sin(a) * 10), (16 + math.cos(a) * 10 + 2, 12 + math.sin(a) * 10)]), None, 'form', colors=C(1) if True else LEAFC)
        return fin(s)

    @reg('leaf')
    def _():
        s = I(); blob(s, poly([(16, 3), (27, 14), (16, 29), (5, 14)])); s.fill(line(16, 4, 16, 28), C(0)[1]); return fin(s)

    @reg('long')
    def _():
        s = I(); blob(s, poly([(10, 4), (22, 4), (24, 28), (8, 28)])); s.shade(poly([(10, 4), (16, 0), (22, 4)]), None, 'form', colors=LEAFC)
        for y in range(8, 27, 4):
            s.fill(rect(10, y, 13, 1), C(0)[1])
        return fin(s)

    @reg('berry')
    def _():
        s = I()
        for x, y in ((11, 13), (20, 12), (16, 20), (9, 22), (23, 21)):
            blob(s, ellipse(x, y, 4, 4), 0, 'sphere'); s.set(x - 1, y - 1, '#ffffff')
        s.shade(poly([(14, 4), (20, 2), (18, 8)]), None, 'form', colors=LEAFC); return fin(s)

    @reg('flower')
    def _():
        s = I(); s.fill(line(16, 16, 16, 30), '#3e7a30')
        for k in range(6):
            a = k / 6 * math.tau
            blob(s, ellipse(16 + math.cos(a) * 6, 12 + math.sin(a) * 6, 4, 4), 0, 'sphere')
        s.shade(ellipse(16, 12, 3, 3), None, 'sphere', colors=['#8a5a10', '#d89a20', '#f2c040', '#ffe080']); return fin(s)

    @reg('mush')
    def _():
        s = I(); s.shade(rect(13, 16, 6, 12), None, 'cyl', colors=PAPER); blob(s, {p for p in ellipse(16, 16, 12, 9) if p[1] < 17}); return fin(s)

    @reg('nut')
    def _():
        s = I(); blob(s, ellipse(16, 19, 9, 9), 0, 'sphere'); blob(s, {p for p in ellipse(16, 12, 10, 6) if p[1] < 14}, 1); return fin(s)

    @reg('seed')
    def _():
        s = I(); s.shade(poly([(7, 8), (25, 8), (27, 28), (5, 28)]), None, 'form', colors=PAPER); s.fill(rect(8, 6, 16, 3), PAPER[0])
        blob(s, ellipse(16, 18, 5, 5), 0, 'sphere'); s.shade(poly([(16, 14), (21, 9), (20, 15)]), None, 'form', colors=LEAFC); return fin(s)

    @reg('oats')
    def _():
        s = I()
        for k in range(4):
            s.fill(line(9 + k * 4, 29, 11 + k * 3, 8), '#a8862a')
            for y in range(8, 18, 3):
                s.fill({(11 + k * 3, y), (12 + k * 3, y + 1)}, C(0)[2])
        return fin(s)

    @reg('truffle')
    def _():
        s = I(); blob(s, ellipse(16, 18, 10, 8), ['#2a1a14', '#4a3224', '#6a4a34', '#8a6448']); return fin(s)

    @reg('food')
    def _():
        s = I(); s.shade(ellipse(16, 22, 13, 6), None, 'sphere', colors=['#8a8478', '#c8c2b2', '#f0ece0', '#ffffff']); blob(s, ellipse(16, 18, 9, 6)); s.fill({(12, 15), (13, 14)}, '#ffffff'); return fin(s)

    @reg('bread')
    def _():
        s = I(); blob(s, ellipse(16, 18, 13, 8), ['#7a4a1a', '#b07a3a', '#d8a050', '#f0c878'])
        for x in (10, 16, 22):
            s.fill(line(x - 2, 15, x + 1, 19), '#e8c890')
        return fin(s)

    @reg('pie')
    def _():
        s = I(); s.shade(ellipse(16, 18, 13, 9), None, 'sphere', colors=['#7a4a1a', '#b07a3a', '#d8a050', '#f0c878']); blob(s, ellipse(16, 17, 9, 6)); return fin(s)

    @reg('jar')
    def _():
        s = I(); s.shade(rect(8, 9, 16, 20), None, 'cyl', colors=['#5a7a8a', '#9ac0d0', '#d0ecf6', '#ffffff']); blob(s, rect(9, 14, 14, 14)); s.fill(rect(7, 5, 18, 5), WOOD[2]); return fin(s)

    @reg('bottle')
    def _():
        s = I(); blob(s, ellipse(16, 21, 9, 9), 0, 'sphere'); s.shade(rect(13, 5, 6, 9), None, 'cyl', colors=['#5a7a8a', '#9ac0d0', '#d0ecf6', '#ffffff']); s.fill(rect(13, 3, 6, 3), WOOD[2])
        s.fill({(12, 17), (12, 18)}, '#ffffff'); return fin(s)

    @reg('fert')
    def _():
        s = I(); blob(s, poly([(7, 28), (5, 14), (10, 7), (22, 7), (27, 14), (25, 28)]), ['#5a4228', '#8a6a44', '#b8945e', '#d8b884'])
        blob(s, ellipse(16, 18, 5, 5), 0, 'sphere'); return fin(s)

    @reg('scroll')
    def _():
        s = I(); s.shade(rect(7, 8, 18, 18), None, 'form', colors=PAPER)
        for y in (6, 24):
            s.shade(rect(5, y, 22, 4), None, 'cyl_side', colors=C(0))
        for y in range(12, 22, 3):
            s.fill(rect(10, y, 12, 1), PAPER[0])
        return fin(s)

    @reg('map')
    def _():
        s = I(); s.shade(poly([(4, 8), (12, 5), (20, 8), (28, 5), (28, 25), (20, 28), (12, 25), (4, 28)]), None, 'form', colors=PAPER)
        s.fill(line(8, 22, 14, 15) | line(14, 15, 22, 18), '#a86a3a'); s.fill(line(20, 10, 24, 14) | line(24, 10, 20, 14), '#d8342a'); return fin(s)

    @reg('artifact')
    def _():
        s = I(); blob(s, poly([(11, 28), (8, 16), (12, 5), (20, 5), (24, 16), (21, 28)]))
        for y in (10, 16, 22):
            s.fill(rect(10, y, 12, 1), C(1)[1])
        return fin(s)

    @reg('chest')
    def _():
        s = I(); s.shade(rect(4, 13, 24, 14), None, 'form', colors=WOOD); s.shade(rect(4, 6, 24, 8), None, 'form', colors=WOOD[1:] + ['#e0b07a'])
        s.fill(rect(4, 13, 24, 2) | rect(9, 6, 2, 21) | rect(21, 6, 2, 21), STEEL[1]); s.fill(rect(14, 14, 4, 5), '#d8b048'); return fin(s)

    @reg('wheel')
    def _():
        s = I(); blob(s, ellipse(16, 16, 12, 12), ['#8a6a20', '#c09a34', '#e0c050', '#f4e080']); s.fill(ellipse(16, 16, 12, 12) - ellipse(16, 16, 10, 10), '#a87a20')
        s.fill(line(16, 6, 16, 26) | line(6, 16, 26, 16), '#d0a040'); return fin(s)

    @reg('weapon')
    def _():
        return sword()

    return out


SPRITES = {f'ic_{k}': fn for k, fn in shapes().items()}
