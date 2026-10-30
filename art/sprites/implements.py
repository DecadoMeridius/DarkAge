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


LEATHER = ['#2a160c', '#4e2c16', '#7a4a26', '#a06838']
BLANKET = ['#4a1414', '#7a2222', '#a83a32', '#c85a48']


def tack():
    """Saddle, blanket, girth, stirrup, bridle and reins, laid over the horse template (70x60, facing right)."""
    s = Canvas(70, 60)
    s.shade(poly([(27, 21), (45, 21), (46, 30), (26, 30)]), None, 'form', colors=BLANKET)  # saddle blanket
    s.fill(line(26, 30, 46, 30), '#e8c860'); s.fill(line(27, 21, 27, 29), BLANKET[3])  # its trim
    s.fill(rect(36, 29, 2, 12), LEATHER[1]); s.fill(rect(35, 40, 4, 1), IRON[2])  # girth and buckle
    s.shade(poly([(29, 22), (31, 16), (34, 19), (40, 20), (42, 16), (44, 17), (44, 24), (30, 25)]), None, 'form', colors=LEATHER)  # seat, cantle and pommel
    s.fill(line(32, 19, 40, 20), LEATHER[3])
    s.fill(line(34, 25, 33, 35), LEATHER[0]); s.fill(rect(31, 35, 5, 2), IRON[2]); s.set(32, 36, IRON[0])  # stirrup leather and iron
    s.fill(line(56, 5, 59, 18) | line(57, 5, 60, 18), LEATHER[1])  # headstall
    s.fill(line(59, 9, 64, 11), LEATHER[1])  # browband
    s.fill(line(61, 15, 67, 17), LEATHER[1])  # noseband
    s.set(64, 19, IRON[3]); s.set(65, 19, IRON[2])  # bit
    s.fill(line(64, 19, 52, 21) | line(52, 21, 44, 19), LEATHER[2])  # reins to the pommel
    return s


SPRITES['horse_tack'] = tack


def canoe(side):
    """A birch-bark canoe, side view facing right (40x16): side 0 the hull, 1 its near gunwale drawn over the paddler."""
    s = Canvas(40, 16)
    hull = poly([(1, 5), (6, 8), (34, 8), (39, 4), (37, 10), (31, 14), (9, 14), (3, 10)])
    if side == 0:
        s.shade(hull, None, 'form', colors=['#5a3a22', '#8a5a32', '#c08a52', '#e0b07a'])
        for x in range(7, 33, 5):
            s.fill(line(x, 9, x, 13), '#6a4426')  # ribs showing through the bark
        s.fill(line(4, 9, 36, 9), '#e8d0a0')      # pale birch band
        return fin(s)
    s.fill(line(2, 6, 38, 5) | line(3, 7, 37, 6), '#4a2e1a')  # the near gunwale, over the paddler's legs
    s.fill(line(5, 7, 35, 6), '#a0703c')
    return s


def canoe_icon():
    s = Canvas(32, 32)
    hull = poly([(2, 22), (6, 20), (26, 10), (31, 6), (29, 12), (24, 18), (8, 26), (3, 25)])
    s.shade(hull, None, 'form', colors=['#5a3a22', '#8a5a32', '#c08a52', '#e0b07a'])
    s.fill(line(5, 22, 28, 9), '#e8d0a0')
    s.fill(line(10, 28, 22, 4) | line(11, 28, 23, 4), '#a0703c'); s.fill(poly([(20, 4), (24, 2), (25, 7), (22, 8)]), '#c08a52')  # the paddle
    return fin(s)


SPRITES['canoe'] = lambda: [canoe(0), canoe(1)]
SPRITES['gi_canoe'] = canoe_icon


def build_hammer_icon():
    """The building hammer: a claw hammer over a rolled plan."""
    s = Canvas(32, 32)
    s.fill(poly([(3, 24), (14, 18), (17, 22), (6, 28)]), '#e8dcc0'); s.fill(line(4, 25, 15, 19), '#f6eedc'); s.fill(line(6, 27, 16, 21), '#c8b898')  # the plan
    s.fill(line(8, 23, 12, 21), '#5a7ad0'); s.fill(line(9, 25, 13, 23), '#5a7ad0')
    s.fill(line(9, 30, 22, 9) | line(10, 30, 23, 9), '#a0703c'); s.fill(line(11, 30, 24, 9), '#6e4426')                  # handle
    s.fill(poly([(18, 6), (26, 2), (30, 6), (27, 9), (21, 11)]), '#7e8492'); s.fill(line(19, 6, 26, 3), '#b8bec8')       # head
    s.fill(poly([(18, 6), (14, 3), (16, 2), (20, 5)]), '#5a5e6a')                                                       # claw
    return fin(s)


SPRITES['gi_build_hammer'] = build_hammer_icon
