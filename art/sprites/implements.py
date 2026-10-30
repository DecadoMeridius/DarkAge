"""Horse implements, side view facing right (the horse pulls them from the right):
impl_<k>.0 standing / raised, impl_<k>.1 lowered and working. Placed on the farm as an 'impl'
object, and drawn behind the horse while hitched (x_implements.js)."""
import math
from px import Canvas, rect, ellipse, poly, line

WOOD = ['#3e2614', '#6e4426', '#a0703c', '#c8965c']
IRON = ['#26282e', '#4a4e58', '#7a808c', '#b8bec8']
ROPE = '#c8a868'


def fin(s):
    s.outline()
    return s


def wheel(s, cx, cy, r, spokes=6, rot=0):
    s.fill(ellipse(cx, cy, r, r) - ellipse(cx, cy, r - 2, r - 2), WOOD[1])
    s.fill(ellipse(cx, cy, r, r) - ellipse(cx, cy, r - 1, r - 1), IRON[1])
    for k in range(spokes):
        a = rot + k * math.pi * 2 / spokes
        s.fill(line(cx, cy, round(cx + math.cos(a) * (r - 2)), round(cy + math.sin(a) * (r - 2))), WOOD[2])
    s.fill(ellipse(cx, cy, 1.5, 1.5), IRON[2])


def plough(down):
    s = Canvas(32, 32)
    d = 3 if down else 0
    s.fill(line(2, 8, 12, 20 + d) | line(3, 8, 13, 20 + d), WOOD[1])  # handles back up to the ploughman
    s.fill(line(6, 6, 14, 20 + d) | line(7, 6, 15, 20 + d), WOOD[2])
    s.shade(poly([(10, 19 + d), (30, 13), (31, 15), (12, 22 + d)]), None, 'form', colors=WOOD)  # the beam to the horse
    s.shade(poly([(12, 20 + d), (20, 21 + d), (22, 28 + d), (14, 28 + d), (10, 24 + d)]), None, 'form', colors=IRON)  # mouldboard
    s.fill(poly([(20, 25 + d), (26, 28 + d), (21, 29 + d)]), IRON[3])  # the share's point
    s.fill(line(16, 21 + d, 16, 27 + d), IRON[0])
    if not down:
        wheel(s, 25, 25, 5, 5)  # a small land wheel carries it when raised
        s.fill(line(25, 16, 25, 21), IRON[1])
    else:
        for x, y in ((24, 30), (27, 29), (29, 31), (18, 31)):
            s.set(x, y, '#7a5434')  # earth thrown up
    s.fill(rect(29, 12, 3, 3), IRON[2])  # hitch ring
    return fin(s)


def seeddrill(down):
    s = Canvas(32, 32)
    wheel(s, 9, 24, 7, 8, .3 if down else 0)
    s.shade(poly([(4, 6), (24, 6), (22, 16), (6, 16)]), None, 'form', colors=WOOD)  # the seed hopper
    s.fill(rect(4, 6, 20, 2), WOOD[3]); s.fill(line(5, 11, 23, 11), WOOD[0])
    s.fill(rect(8, 4, 12, 2), '#d8b860'); s.set(11, 4, '#8a6a30'); s.set(16, 5, '#8a6a30')  # seed heaped on top
    for x in (14, 18, 22):  # drop tubes to the coulters
        s.fill(line(x - 1, 16, x, 27 + (2 if down else 0)), IRON[1]); s.set(x, 28 + (2 if down else 0), IRON[3])
    s.fill(line(22, 14, 31, 14) | line(22, 15, 31, 15), WOOD[1])  # shafts
    s.fill(rect(29, 13, 3, 3), IRON[2])
    if down:
        for x in (15, 19, 23):
            s.set(x, 31, '#d8b860')
    return fin(s)


def harrow(down):
    s = Canvas(32, 32)
    y0 = 18 if down else 14
    s.shade(poly([(2, y0), (24, y0 - 2), (25, y0 + 4), (3, y0 + 6)]), None, 'form', colors=WOOD)  # the frame, seen from the side, tilted
    for x in range(4, 24, 4):
        s.fill(line(x, y0 + 5, x - 1, y0 + 10 + (1 if down else 0)), IRON[1]); s.set(x - 1, y0 + 10 + (1 if down else 0), IRON[3])  # tines
    s.fill(line(4, y0 + 1, 23, y0), WOOD[3])
    s.fill(line(24, y0, 31, y0 - 4) | line(24, y0 + 1, 31, y0 - 3), IRON[1])  # chain to the horse
    s.fill(rect(29, y0 - 6, 3, 3), IRON[2])
    if down:
        for x in (3, 9, 16, 22):
            s.set(x, 31, '#4a7a2a'); s.set(x + 1, 30, '#6a9a3a')  # torn-up weeds behind
    return fin(s)


def cart(load):
    s = Canvas(40, 32)
    s.shade(poly([(2, 10), (28, 10), (27, 22), (3, 22)]), None, 'form', colors=WOOD)  # box
    for x in (2, 14, 27):
        s.fill(rect(x, 9, 2, 14), WOOD[0])
    s.fill(line(3, 15, 27, 15), WOOD[1]); s.fill(line(3, 10, 28, 10), WOOD[3])
    if load:  # loaded: sacks and logs show over the side
        s.shade(ellipse(9, 8, 5, 3), None, 'form', colors=['#8a7a5a', '#b8a47a', '#d8c89a', '#f0e4c0'])
        s.shade(poly([(15, 9), (26, 6), (27, 9), (16, 11)]), None, 'form', colors=WOOD)
    wheel(s, 15, 23, 8, 8)
    s.fill(line(27, 16, 39, 13) | line(27, 17, 39, 14), WOOD[1])  # shafts
    s.fill(rect(36, 12, 3, 3), IRON[2])
    return fin(s)


SPRITES = {'impl_plough': lambda: [plough(0), plough(1)], 'impl_seeddrill': lambda: [seeddrill(0), seeddrill(1)],
           'impl_harrow': lambda: [harrow(0), harrow(1)], 'impl_cart': lambda: [cart(0), cart(1)]}
