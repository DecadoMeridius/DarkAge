"""Automation pieces: conveyors (4 directions x 2 frames), a sorter, storage crate,
fuelled smelter and charcoal kiln (idle / burning), mill, compost bin, and the power
sources (windmill and waterwheel, 2 frames each). Medieval tech: wood, stone, leather belts.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng

WOOD = ['#3a2218', '#5a3622', '#7a4c2c', '#9a6638', '#b88450']
LWOOD = ['#5a3a22', '#8a5a34', '#b07c4c', '#c8985e', '#e0b47a']
IRON = ['#1e1e2a', '#2e3040', '#454a5c', '#6a7084', '#9aa2b4']
STONE = ['#3e3c48', '#56545e', '#6e6c74', '#8a8890', '#a8a6aa']
FIRE = ['#a8301a', '#e0602a', '#f29a32', '#ffd25a', '#fff4c0']
BELT = ['#3a2a20', '#5a4232', '#7a5a42', '#94704e']


def fin(s):
    s.outline()
    return s


def shadow(s, cx, cy, rx, ry):
    for x, y in ellipse(cx, cy, rx, ry):
        if not s.get(x, y)[3] and ((x + y) % 2 == 0 or ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 < .6):
            s.px[x, y] = (24, 30, 14, 90)


def conveyor(f, sorter=False):
    """A wooden-framed leather belt running downwards (dir 0); rotated for the others."""
    s = Canvas(32, 32)
    s.fill(rect(2, 0, 28, 32), WOOD[1])
    s.fill(rect(2, 0, 3, 32), WOOD[3]); s.fill(rect(27, 0, 3, 32), WOOD[2]); s.fill(rect(4, 0, 1, 32), WOOD[0]); s.fill(rect(27, 0, 1, 32), WOOD[0])
    for y in range(32):  # belt slats scroll with the frame
        band = ((y + f * 4) // 4) % 2
        s.fill(rect(6, y, 20, 1), BELT[2] if band else BELT[1])
    for k in range(2):  # chevrons point the way
        y = 6 + k * 14 + f * 2
        for i in range(6):
            s.set(10 + i, y + i, BELT[3]); s.set(21 - i, y + i, BELT[3])
    for y in (1, 30):
        s.fill(rect(2, y, 28, 1), IRON[2])
    if sorter:
        s.fill(rect(5, 13, 22, 6), IRON[2]); s.fill(rect(5, 13, 22, 1), IRON[4])
        s.fill(poly([(22, 14), (28, 16), (22, 18)]), '#e8c040')
    return s


def rotated(img_canvas, d):
    c = Canvas(32, 32)
    im = img_canvas.img
    im = {0: im, 3: im.rotate(180), 1: im.rotate(-90), 2: im.rotate(90)}[d]
    c.img = im.copy(); c.px = c.img.load()
    return c


def storage():
    s = Canvas(32, 36)
    shadow(s, 16, 33, 13, 3)
    s.shade(rect(3, 10, 26, 22), None, 'form', colors=LWOOD[1:])
    s.fill(rect(3, 10, 26, 2) | rect(3, 30, 26, 2) | rect(3, 10, 2, 22) | rect(27, 10, 2, 22), LWOOD[0])
    s.fill(line(5, 12, 26, 29) | line(26, 12, 5, 29), LWOOD[1])
    s.shade(rect(2, 4, 28, 7), None, 'form', colors=LWOOD[1:] + ['#f0c890'])
    s.fill(rect(13, 13, 6, 4), IRON[3]); s.fill(rect(14, 14, 4, 2), IRON[1])
    return fin(s)


def smelter(lit):
    s = Canvas(40, 60)
    shadow(s, 20, 57, 17, 3)
    for x in range(4, 36):
        for y in range(22, 56):
            row = (y - 22) // 5
            s.set(x, y, STONE[0] if (y - 22) % 5 == 4 or (x + row * 4) % 9 == 0 else STONE[3] if x < 14 else STONE[2])
    s.shade(poly([(8, 22), (32, 22), (26, 6), (14, 6)]), None, 'form', colors=STONE)
    s.shade(rect(16, 0, 8, 8), None, 'cyl', colors=STONE[:4])
    mouth = {(x, y) for x in range(12, 28) for y in range(36, 52) if y > 42 or ((x + .5 - 20) / 8) ** 2 + ((y - 43) / 7) ** 2 <= 1}
    s.fill(mouth, '#1a0c08')
    r = rng(3 + lit)
    if lit:
        for x, y in mouth:
            if y > 43 and r.random() < .9:
                s.set(x, y, FIRE[max(0, min(4, int((1 - abs(x - 20) / 8 + r.uniform(-.3, .3)) * 5)))])
    s.fill(rect(30, 30, 6, 4), IRON[2])  # chute
    s.meta = {'light': [20, 46]} if lit else {}
    return fin(s)


def kiln(lit):
    s = Canvas(36, 46)
    shadow(s, 18, 43, 15, 3)
    dome = {p for p in ellipse(18, 30, 15, 16) if p[1] < 42}
    s.shade(dome, None, 'form', colors=['#5a3a2a', '#8a5a3a', '#b07a50', '#d09a6a'])
    for y in range(18, 42, 5):
        for x in range(4, 33):
            if (x, y) in dome and (x + y) % 3:
                s.set(x, y, '#6a4430')
    door = rect(13, 32, 10, 10)
    s.fill(door, '#1a0c08')
    if lit:
        for x, y in door:
            if y > 36:
                s.set(x, y, FIRE[2 + (x + y) % 3 if (x + y) % 3 < 3 else 2])
    s.fill(rect(16, 12, 4, 5), '#3a2418')
    return fin(s)


def mill(f):
    s = Canvas(36, 52)
    shadow(s, 18, 49, 15, 3)
    for x in (4, 29):
        s.shade(rect(x, 10, 4, 38), None, 'cyl', colors=WOOD)
    s.fill(rect(2, 8, 32, 4), WOOD[3]); s.fill(rect(2, 8, 32, 1), WOOD[4])
    s.shade(ellipse(18, 38, 12, 6), None, 'sphere', colors=STONE)
    s.shade(ellipse(18, 34, 10, 5), None, 'sphere', colors=STONE[1:] + ['#c8c6c8'])
    a = f * math.pi / 4
    s.fill(line(18, 12, 18, 33) | line(18, 34, round(18 + math.cos(a) * 9), round(34 + math.sin(a) * 4)), IRON[2])
    s.fill(rect(10, 20, 16, 6), LWOOD[2]); s.fill(rect(10, 20, 16, 1), LWOOD[4])  # hopper
    return fin(s)


def compost():
    s = Canvas(32, 36)
    shadow(s, 16, 33, 13, 3)
    for k in range(4):
        s.shade(rect(3, 12 + k * 5, 26, 4), None, 'cyl_side', colors=LWOOD)
    s.fill(rect(3, 12, 2, 20) | rect(27, 12, 2, 20), WOOD[1])
    s.shade(ellipse(16, 11, 12, 4), None, 'sphere', colors=['#2a3a14', '#4a5a20', '#6a7a30', '#8a9a40'])
    for x in (9, 15, 21):
        s.set(x, 9, '#c8a040'); s.set(x + 1, 10, '#8a6a30')
    return fin(s)


def windmill(f):
    s = Canvas(64, 112)
    shadow(s, 32, 108, 18, 4)
    body = poly([(22, 106), (24, 46), (40, 46), (42, 106)])
    s.shade(body, None, 'form', colors=['#8a8070', '#b0a690', '#d0c8b4', '#ece4d0'])
    s.fill(rect(28, 88, 8, 18), WOOD[1]); s.fill(rect(29, 70, 6, 6), '#2a3a5a')
    s.shade(poly([(20, 48), (32, 30), (44, 48)]), None, 'form', colors=WOOD)
    cx, cy = 32, 44
    for k in range(4):  # sails
        a = k * math.pi / 2 + f * math.pi / 4
        tip = (cx + math.cos(a) * 30, cy + math.sin(a) * 30)
        side = (math.cos(a + math.pi / 2) * 5, math.sin(a + math.pi / 2) * 5)
        mid = (cx + math.cos(a) * 8, cy + math.sin(a) * 8)
        s.fill(line(cx, cy, round(tip[0]), round(tip[1])), WOOD[2])
        sail = poly([mid, (mid[0] + side[0], mid[1] + side[1]), (tip[0] + side[0], tip[1] + side[1]), tip])
        for x, y in sail:
            s.set(x, y, '#ece4d0' if (x + y) % 4 else '#c8bca4')
    s.fill(ellipse(cx, cy, 3, 3), WOOD[0])
    return fin(s)


def waterwheel(f):
    s = Canvas(40, 48)
    cx, cy = 20, 26
    s.fill(ellipse(cx, cy, 18, 18) - ellipse(cx, cy, 15, 15), WOOD[2])
    for k in range(8):
        a = k * math.pi / 4 + f * math.pi / 8
        s.fill(line(cx, cy, round(cx + math.cos(a) * 16), round(cy + math.sin(a) * 16)), WOOD[1])
        px_, py_ = round(cx + math.cos(a) * 17), round(cy + math.sin(a) * 17)
        s.fill(rect(px_ - 2, py_ - 2, 4, 4), LWOOD[3])
    s.fill(ellipse(cx, cy, 3, 3), IRON[2])
    s.fill(rect(2, 44, 36, 4), '#4a92c4')
    for x in range(4, 36, 5):
        s.set(x, 44, '#9fd4ee')
    return fin(s)


def oven(lit):
    s = Canvas(36, 48)
    shadow(s, 18, 45, 15, 3)
    dome = {p for p in ellipse(18, 30, 15, 14) if p[1] < 44}
    for x, y in dome:  # brick dome
        row = (y - 16) // 4
        s.set(x, y, '#6a3424' if (y % 4 == 3 or (x + row * 3) % 7 == 0) else ('#c8704a' if x < 16 else '#a85a3a'))
    s.fill(rect(4, 40, 28, 5), STONE[2]); s.fill(rect(4, 40, 28, 1), STONE[4])
    mouth = {p for p in ellipse(18, 37, 7, 6) if p[1] < 40}
    s.fill(mouth, '#1a0c08')
    if lit:
        for x, y in mouth:
            if y > 35:
                s.set(x, y, FIRE[(x + y) % 3 + 1])
    s.fill(rect(26, 8, 5, 12), STONE[2]); s.fill(rect(25, 7, 7, 2), STONE[1])
    s.meta = {'light': [18, 36]} if lit else {}
    return fin(s)


def triphammer(f):
    s = Canvas(48, 52)
    shadow(s, 24, 49, 20, 3)
    for x in (4, 40):
        s.shade(rect(x, 8, 4, 40), None, 'cyl', colors=WOOD)
    s.fill(rect(2, 6, 44, 4), WOOD[3]); s.fill(rect(2, 6, 44, 1), WOOD[4])
    s.shade(rect(26, 34, 14, 12), None, 'form', colors=IRON)  # anvil block
    s.fill(rect(24, 32, 18, 3), IRON[3])
    a = -.35 if f else .05  # the beam tips: hammer up / down
    hx, hy = 10, 22
    ex, ey = round(hx + math.cos(a) * 26), round(hy + math.sin(a) * 26)
    s.fill(line(hx, hy, ex, ey) | line(hx, hy + 1, ex, ey + 1), WOOD[2])
    s.shade(rect(ex - 4, ey, 8, 7), None, 'form', colors=IRON[1:])
    s.shade(ellipse(10, 22, 5, 5), None, 'sphere', colors=WOOD)  # cam wheel
    return fin(s)


def treadwheel(f):
    s = Canvas(48, 52)
    shadow(s, 24, 49, 20, 3)
    cx, cy = 24, 26
    s.fill(ellipse(cx, cy, 20, 20) - ellipse(cx, cy, 17, 17), WOOD[2])
    for k in range(10):
        a = k * math.pi / 5 + f * math.pi / 10
        s.fill(line(cx, cy, round(cx + math.cos(a) * 18), round(cy + math.sin(a) * 18)), WOOD[1])
    s.fill(ellipse(cx, cy, 3, 3), IRON[2])
    for x in (6, 40):
        s.fill(rect(x, 30, 3, 18), WOOD[1])
    s.fill(rect(2, 46, 44, 3), WOOD[3])
    s.fill(rect(30, 40, 10, 6), '#d8b84a'); s.fill(rect(30, 40, 10, 1), '#f0d870')  # hay trough
    return fin(s)


def channel(wet):
    s = Canvas(32, 32)
    s.fill(rect(0, 8, 32, 16), STONE[1])
    s.fill(rect(0, 8, 32, 2), STONE[3]); s.fill(rect(0, 22, 32, 2), STONE[0])
    s.fill(rect(0, 10, 32, 12), '#4a92c4' if wet else '#5a4a3a')
    if wet:
        for x in range(2, 32, 7):
            s.fill(rect(x, 13, 3, 1), '#9fd4ee')
    for x in range(0, 32, 8):
        s.set(x, 9, STONE[0]); s.set(x, 23, STONE[0])
    return s


def channel_v(wet):
    c = channel(wet)
    c.img = c.img.rotate(90); c.px = c.img.load()
    return c


def _all():
    out = {'storage': storage, 'compostbin': compost}
    base = [conveyor(0), conveyor(1)]
    sbase = [conveyor(0, True), conveyor(1, True)]
    for d in range(4):
        out[f'conveyor_{d}'] = (lambda d=d: [rotated(base[0], d), rotated(base[1], d)])
        out[f'sorter_{d}'] = (lambda d=d: [rotated(sbase[0], d), rotated(sbase[1], d)])
    spl = [conveyor(0, True), conveyor(1, True)]
    for c in spl:  # a splitter: a fork painted over the gate
        c.fill(rect(12, 20, 8, 2), '#e8c040'); c.fill(line(16, 20, 26, 28), '#e8c040')
    for d in range(4):
        out[f'splitter_{d}'] = (lambda d=d: [rotated(spl[0], d), rotated(spl[1], d)])
    out['oven'] = lambda: [oven(0), oven(1)]
    out['triphammer'] = lambda: [triphammer(0), triphammer(1)]
    out['treadwheel'] = lambda: [treadwheel(0), treadwheel(1)]
    out['channel_h'] = lambda: [channel(0), channel(1)]
    out['channel_v'] = lambda: [channel_v(0), channel_v(1)]
    out['smelter'] = lambda: [smelter(0), smelter(1)]
    out['kiln'] = lambda: [kiln(0), kiln(1)]
    out['mill'] = lambda: [mill(f) for f in range(2)]
    out['windmill'] = lambda: [windmill(f) for f in range(2)]
    out['waterwheel'] = lambda: [waterwheel(f) for f in range(2)]
    return out


SPRITES = _all()
