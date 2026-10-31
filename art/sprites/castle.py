"""Briarholt Castle (kingdom phase K1): the keep, curtain walls, round towers, the gate arch,
the courtyard greenhouses, and the furniture and wall hangings of the castle rooms.

Walls are 1 tile thick and 56 art px tall. Every wall piece (cwall_<mask>, 1 N, 2 E, 4 S, 8 W)
is 32 x 96: the top band (the wall walk seen from above) sits at y 8-40, raised by the wall's
height, and the face (y 40-96) is only drawn where the run ends to the south, so runs join up
in every direction. Merlons stand along each open edge. Towers are 2x2 tiles with a crenellated
ring and a conical slate roof with a pennant.
"""
import math
from px import Canvas, rect, ellipse, poly, line, vnoise, rng
from sprites.buildings import building, winterize, paint_wall, window, door, R, mul, mix, foundation, WINLOG
from sprites.interior import finish, base, plank_top, WOOD, LWOOD, IRON, CLOTH, STONE as ISTONE

STONE = ['#4a464e', '#6e6a70', '#8e8a8c', '#aea8a6', '#cfc8c2']   # warm grey ashlar, dark -> light
SLATE = ['#262a3e', '#343a54', '#46506e', '#5e6a8a', '#7e8aa8']
MOSS = ['#2e5a26', '#4a8a3a', '#7ab858']
ROYAL = ['#2a1440', '#4a2470', '#6a3a9a', '#8e5ac0']             # Briarholt purple
GOLD = ['#7a5a1a', '#b8862a', '#e8b830', '#ffe080']
WALL_COL = '#b4ada6'
TOP_Y, FACE_Y, PH = 8, 40, 128   # walls stand ~4 tiles tall (art round: 'the walls are low, the gate barely taller than you')


def top_band(s, x0, x1, y0, y1, seed=3):
    """The flagstones of a wall walk seen from above."""
    for y in range(y0, y1):
        for x in range(x0, x1):
            row = (y - y0) // 8
            j = (x + row * 5) % 12 == 0 or (y - y0) % 8 == 7
            c = STONE[1] if j else STONE[3] if vnoise(((x + row * 5) // 12) * .7, row * .9, seed) > .55 else STONE[2]
            s.set(x, y, c)


def merlons(s, x0, x1, y, h=8, vertical=False, ox=0):
    """A row (or column) of merlons: lit top and left face, shaded right face."""
    if not vertical:
        for mx in range(x0, x1, 10):
            w = min(6, x1 - mx)
            if w < 3:
                continue
            for yy in range(y, y + h):
                for xx in range(mx, mx + w):
                    c = STONE[4] if yy == y else STONE[3] if xx == mx else STONE[1] if xx == mx + w - 1 else STONE[2]
                    s.set(xx, yy, c)
            s.fill(rect(mx, y + h, w, 2), STONE[0])
    else:   # a parapet down the side of a north-south run: a raised strip with merlons, each a block with a lit top and a shaded south face
        for yy in range(y, h):
            for xx in range(ox, ox + 5):
                s.set(xx, yy, STONE[3] if xx == ox else STONE[1] if xx == ox + 4 else STONE[2])
        inner = ox + 5 if ox == 0 else ox - 1                  # the parapet's inner face throws a dark line on the walk
        for yy in range(y, h):
            s.set(inner, yy, STONE[0])
        for my in range(y, h - 4, 10):
            for yy in range(my, min(h, my + 9)):
                for xx in range(ox, ox + 5):
                    top = yy < my + 5
                    s.set(xx, yy, (STONE[4] if yy == my else STONE[3] if xx == ox else STONE[2]) if top else (STONE[1] if xx < ox + 4 else STONE[0]))


def face(s, x0, x1, y0, y1, lit_left, dark_right, seed=5):
    paint_wall(s, rect(x0, y0, x1 - x0, y1 - y0), 'ashlar', WALL_COL, seed)
    s.fill(rect(x0, y0, x1 - x0, 1), STONE[4])
    for x in range(x0, x1):            # a darker, mossy foot
        for k in range(5):
            y = y1 - 1 - k
            c = s.get(x, y)
            if c[3]:
                s.set(x, y, mul(c, .78 if k < 3 else .88))
        if vnoise(x * .3, 1, seed) > .62:
            s.set(x, y1 - 1, MOSS[1]); s.set(x, y1 - 2, MOSS[0 if x % 2 else 1])
    if lit_left:
        s.fill(rect(x0, y0, 1, y1 - y0), STONE[4])
    if dark_right:
        for y in range(y0, y1):
            for k, a in ((1, .6), (2, .75), (3, .88)):
                c = s.get(x1 - k, y)
                if c[3]:
                    s.set(x1 - k, y, mul(c, a))


def weather(s, x0, x1, y0, y1, seed, slits=()):
    """Hand-placed wear on a stone face: hairline cracks with a lit lip, rain streaks under slits and
    sills, and a few moss tufts tucked under the parapet."""
    r = rng(seed)
    for _ in range(max(1, (x1 - x0) * (y1 - y0) // 1400)):
        x, y = r.randrange(x0 + 3, x1 - 3), r.randrange(y0 + 6, y1 - 10)
        for _k in range(r.randrange(5, 10)):
            c = s.get(x, y)
            if not c[3]:
                break
            s.set(x, y, mul(c, .62))
            n = s.get(x + 1, y)
            if n[3]:
                s.set(x + 1, y, mul(n, 1.08))
            y += 1
            x += r.choice((-1, 0, 0, 1))
    for sx, sy in slits:
        for k in range(r.randrange(8, 16)):
            c = s.get(sx, sy + k)
            if c[3]:
                s.set(sx, sy + k, mul(c, .86 + k * .008))
    for _ in range(max(1, (x1 - x0) // 40)):
        x = r.randrange(x0 + 2, x1 - 4)
        for dx, dy, k in ((0, 0, 1), (1, 0, 2), (2, 0, 1), (1, 1, 0), (0, 1, 0)):
            if s.get(x + dx, y0 + 1 + dy)[3]:
                s.set(x + dx, y0 + 1 + dy, MOSS[k])


def corbels(s, x0, x1, ytop, step=9, ybase=None):
    """Machicolations: stepped stone brackets under a parapet with dark drop holes between them.
    ybase(x) can bend the row round a tower."""
    for x in range(x0, x1 - 4, step):
        y = ybase(x + 2) if ybase else ytop
        s.fill(rect(x + 5, y, step - 5, 5), '#221e28')
        for yy in range(7):
            w = 5 if yy < 3 else 5 - (yy - 2)
            for xx in range(x, x + w):
                s.set(xx, y + yy, STONE[4] if yy == 0 else STONE[3] if xx == x else STONE[1] if xx == x + w - 1 else STONE[2])


def ivy(s, x0, x1, ybot, ytop, seed, n=5):
    """Climbing ivy drawn vine by vine: a dark stem that wanders up, leaf clusters left and right."""
    r = rng(seed)
    for v in range(n):
        x, y = r.randrange(x0, x1), ybot
        top = r.randrange(ytop, ybot - 20)
        side = 1
        while y > top:
            if s.get(x, y)[3]:
                s.set(x, y, MOSS[0])
            if (ybot - y) % 5 == 0:
                lx = x + 2 * side
                for dx, dy, k in ((0, -1, 2), (-1, 0, 1), (0, 0, 1), (1, 0, 2), (0, 1, 0), (-1, 1, 0)):
                    if s.get(lx + dx, y + dy)[3]:
                        s.set(lx + dx, y + dy, MOSS[k])
                side = -side
            y -= 1
            if r.random() < .28:
                x = max(x0, min(x1 - 1, x + r.choice((-1, 1))))


def cwall(mask, winter=False):
    s = Canvas(32, PH)
    n, e, so, w = mask & 1, mask & 2, mask & 4, mask & 8
    top_band(s, 0, 32, TOP_Y, FACE_Y, mask)
    s.fill(rect(0, TOP_Y, 32, 1), STONE[0]) if n else None
    if not so:
        face(s, 0, 32, FACE_Y, PH, not w, not e, mask + 7)
        if not w and not e:
            pass
        slit = (mask * 7) % 3 == 0
        if slit:   # an arrow slit
            s.fill(rect(15, FACE_Y + 14, 2, 14), '#1e1a22'); s.fill(rect(13, FACE_Y + 19, 6, 2), '#1e1a22')
        weather(s, 0, 32, FACE_Y, PH - 6, mask * 13 + 1, [(16, FACE_Y + 28)] if slit else ())
    if not n:
        merlons(s, 1, 32, TOP_Y - 6)
    if not so:
        merlons(s, 1, 32, FACE_Y - 8)
    if not w:
        merlons(s, 0, 0, TOP_Y - 2, FACE_Y - 2, True, 0)
    if not e:
        merlons(s, 0, 0, TOP_Y - 2, FACE_Y - 2, True, 27)
    s.outline()
    s = winterize(s) if winter else s
    if e:
        return s
    # a contact shadow on the ground to the east, where nothing joins: light from the top-left, so a run of
    # wall seen from above reads as raised (playtest: north-south walls looked like flat grey strips)
    c = Canvas(64, PH)                      # 16 px of padding each side keep the wall centred on its tile
    c.img.alpha_composite(s.img, (16, 0)); c.px = c.img.load()
    y0, y1 = (FACE_Y + 4, PH - 1) if not so else (TOP_Y + 2, TOP_Y + 34)   # a joined run: just this tile's stretch
    for y in range(y0, y1):                 # a wall ~4 tiles tall throws a wide shadow (art round: north-south runs read as paths)
        for k in range(14):
            if k < 9 or (y + k) % 2 == 0:
                c.set(48 + k, y, (16, 24, 8, 140 - k * 7))
    return c


def cone_roof(s, cx, apex, base_y, rr):
    """A conical slate roof: shingle courses, lit on the left, a flared eave and a pennant."""
    for y in range(apex, base_y + 1):
        t = (y - apex) / max(1, base_y - apex)
        half = 2 + t * rr
        for x in range(int(cx - half), int(cx + half) + 1):
            u = (x - cx) / max(1, half)
            course = (y - apex) % 5 == 4
            k = 3 if u < -.45 else 2 if u < .15 else 1 if u < .6 else 0
            if course:
                k = max(0, k - 1)
            elif (x + (y // 5) * 3) % 6 == 0:
                k = max(0, k - 1)
            s.set(x, y, SLATE[k + (1 if t < .2 and k < 4 else 0)])
    for x in range(int(cx - rr - 3), int(cx + rr + 4)):   # the flared eave
        u = (x - cx) / (rr + 3)
        s.set(x, base_y + 1, SLATE[3] if u < 0 else SLATE[1]); s.set(x, base_y + 2, SLATE[0])
    s.fill(rect(cx - 1, apex - 10, 2, 11), IRON[2]); s.set(cx - 1, apex - 11, GOLD[3]); s.set(cx, apex - 11, GOLD[2])
    for k in range(7):  # a pennant in Briarholt purple
        for j in range(4 - k // 2):
            s.set(cx + 1 + k, apex - 9 + j + k // 3, ROYAL[2] if j else ROYAL[3])


def round_body(s, cx, rr, y0, y1, seed):
    paint_wall(s, {(x, y) for x in range(cx - rr, cx + rr) for y in range(y0, y1)}, 'ashlar', WALL_COL, seed)
    for x in range(cx - rr, cx + rr):  # cylinder shading: lit left, dark right
        u = (x + .5 - cx) / rr
        a = 1.12 - .1 * (u + 1) ** 1.6 if u < .2 else .92 - .45 * (u - .2)
        a = max(.5, min(1.15, a))
        for y in range(y0, y1):
            c = s.get(x, y)
            if c[3]:
                s.set(x, y, mul(c, a))
    for x in range(cx - rr, cx + rr):  # mossy foot
        for k in range(4):
            c = s.get(x, y1 - 1 - k)
            if c[3]:
                s.set(x, y1 - 1 - k, mul(c, .8))
        if vnoise(x * .35, 4, seed) > .6:
            s.set(x, y1 - 1, MOSS[1])


def string_course(s, cx, rr, y):
    """A moulded band round a tower: a lit upper lip over a shadowed lower one, bending with the drum."""
    for x in range(cx - rr, cx + rr):
        u = (x + .5 - cx) / rr
        yy = y + int(3 * math.sqrt(max(0, 1 - u * u)))
        for k, a in ((0, 1.18), (1, 1.05), (2, .62)):
            c = s.get(x, yy + k)
            if c[3]:
                s.set(x, yy + k, mul(c, a))


def crenel_ring(s, cx, rr, y):
    """The top of a round tower: a lit stone ring and merlons around its front half."""
    for yy in range(y - 6, y + 7):
        for x in range(cx - rr - 2, cx + rr + 2):
            d = ((x + .5 - cx) / (rr + 2)) ** 2 + ((yy - y) / 7) ** 2
            if d <= 1:
                s.set(x, yy, STONE[3] if yy < y else STONE[2])
    for x in range(cx - rr - 1, cx + rr + 1, 9):
        u = (x + 2 - cx) / (rr + 2)
        yb = y + int(6 * math.sqrt(max(0, 1 - u * u)))
        for yy in range(yb - 9, yb):
            for xx in range(x, x + 5):
                s.set(xx, yy, STONE[4] if yy == yb - 9 else STONE[3] if xx == x else STONE[1] if xx == x + 4 else STONE[2])


def ctower(winter=False):
    s = Canvas(64, 192)        # a head taller than the 128 px curtain walls
    cx, rr = 32, 26
    for y in range(182, 190):   # contact shadow
        for x in range(4, 60):
            if ((x - 32) / 28) ** 2 + ((y - 184) / 5) ** 2 <= 1:
                s.set(x, y, (20, 30, 10, 90))
    round_body(s, cx, rr, 52, 186, 21)
    string_course(s, cx, rr, 100); string_course(s, cx, rr, 146)
    for wy in (76, 116, 156):   # arrow slits
        s.fill(rect(cx - 9, wy, 2, 12), '#1e1a22'); s.fill(rect(cx + 6, wy + 6, 2, 10), '#141018')
    weather(s, cx - rr + 2, cx + rr - 2, 66, 182, 77, [(cx - 8, 88), (cx - 8, 128), (cx - 8, 168)])
    corbels(s, cx - rr + 1, cx + rr - 2, 0, 8, lambda x: 52 + int(6 * math.sqrt(max(0, 1 - ((x - cx) / (rr + 2)) ** 2))))
    crenel_ring(s, cx, rr, 52)
    cone_roof(s, cx, 14, 44, rr + 1)
    s.outline()
    return winterize(s) if winter else s


def gate_arch(winter=False):
    """The archway over the gate: the wall walk carried across, posts down to the ground, a pointed
    arch and the raised portcullis. The opening is left clear so you walk under it."""
    s = Canvas(64, PH)
    top_band(s, 0, 64, TOP_Y, FACE_Y, 9)
    merlons(s, 1, 64, TOP_Y - 6)
    merlons(s, 1, 64, FACE_Y - 8)
    face(s, 0, 64, FACE_Y, PH, True, True, 13)

    def top(x):  # the arch line: straight jambs, then a pointed head
        d = abs(x + .5 - 32)
        return 50 + (d / 24) ** 2 * 14 if d < 24 else None
    for x in range(64):
        t = top(x)
        if t is None:
            continue
        for y in range(FACE_Y, PH):
            if y >= t:
                s.set(x, y, (0, 0, 0, 0))
            elif y >= t - 4:
                s.set(x, y, STONE[3] if (x // 6) % 2 else STONE[2])
    for x in range(10, 54, 5):  # the raised portcullis: its teeth hang in the arch
        yb = int(top(x) or 60)
        for y in range(yb, yb + 7):
            s.set(x, y, IRON[1] if y < yb + 6 else IRON[3]); s.set(x + 1, y, IRON[2])
    s.fill(rect(10, 52, 44, 1), IRON[1])
    s.fill(rect(29, 42, 6, 2), GOLD[2]); s.fill(rect(30, 44, 4, 3), ROYAL[2]); s.set(31, 47, ROYAL[1]); s.set(32, 47, ROYAL[1])
    s.outline()
    return winterize(s) if winter else s


def banner(s, x, y, h=56):
    """A long Briarholt banner: purple with a gold stag, gold fringe."""
    s.fill(rect(x - 2, y - 2, 20, 3), IRON[2]); s.fill(rect(x - 2, y - 2, 20, 1), IRON[4])
    for yy in range(y, y + h):
        for xx in range(x, x + 16):
            c = ROYAL[2]
            if xx == x:
                c = ROYAL[3]
            elif xx >= x + 14:
                c = ROYAL[1]
            if yy > y + h - 7 and abs(xx - (x + 7.5)) < (yy - (y + h - 7)) * 1.2:
                c = None
            if c:
                s.set(xx, yy, c)
    s.fill(rect(x, y + 3, 16, 1), GOLD[2]); s.fill(rect(x + 1, y + h - 9, 14, 1), GOLD[2])
    stag = ['.y...y.', '.y.y.y.', '..yyy..', '...y...', '..yyy..', '.yyyyy.', '.y...y.']
    for j, row in enumerate(stag):
        for i, ch in enumerate(row):
            if ch == 'y':
                s.set(x + 4 + i, y + 14 + j * 2, GOLD[3]); s.set(x + 4 + i, y + 15 + j * 2, GOLD[2])


def keep(w=18, h=10, winter=False):
    W, H = w * 32, h * 32
    s = Canvas(W, H)
    WINLOG.clear()
    gy = H - 8
    dcx = (w // 2) * 32 + 16
    # the tall donjon at the back middle, with a flag
    dx0, dx1 = dcx - 70, dcx + 70
    paint_wall(s, rect(dx0, 40, dx1 - dx0, 90), 'ashlar', '#a8a19a', 31)
    for y in range(40, 130):
        for k, a in ((1, .6), (2, .72), (3, .85)):
            c = s.get(dx1 - k, y)
            if c[3]:
                s.set(dx1 - k, y, mul(c, a))
    merlons(s, dx0 + 1, dx1, 32)
    s.fill(rect(dx0, 40, dx1 - dx0, 2), STONE[0])
    for wx in (dcx - 40, dcx, dcx + 40):
        window(s, wx, 62, 10, 18, '#4a3a30', arch=True)
    s.fill(rect(dcx - 1, 2, 2, 32), IRON[2])
    for k in range(18):
        for j in range(10 - k // 3):
            s.set(dcx + 1 + k, 4 + j + k // 6, ROYAL[2] if 0 < j < 9 - k // 3 else ROYAL[1])
    s.fill(rect(dcx + 5, 7, 5, 3), GOLD[3])
    # the main hall block
    mx0, mx1, my0 = 60, W - 60, 118
    paint_wall(s, rect(mx0, my0, mx1 - mx0, gy - my0), 'ashlar', WALL_COL, 41)
    s.fill(rect(mx0, my0, mx1 - mx0, 1), STONE[4])
    merlons(s, mx0 + 1, mx1, my0 - 9)
    s.fill(rect(mx0, my0 - 1, mx1 - mx0, 1), STONE[0])
    for k in range(4):    # string course between the floors
        s.fill(rect(mx0, 196 + k, mx1 - mx0, 1), [STONE[4], STONE[3], STONE[1], STONE[0]][k])
    for wx in (dcx - 156, dcx - 114, dcx + 114, dcx + 156):
        window(s, wx, 140, 14, 34, '#4a3a30', arch=True)
        window(s, wx, 220, 14, 30, '#4a3a30', arch=True, box=True, r=rng(wx))
    weather(s, mx0, mx1, my0, gy - 4, 41, [(wx, 252) for wx in (dcx - 156, dcx - 114, dcx + 114, dcx + 156)])
    corbels(s, mx0 + 2, mx1 - 2, my0 + 1)
    for bx in (dcx - 90, dcx + 74):
        banner(s, bx, 126, 62)
    foundation(s, mx0 - 1, mx1 + 1, gy, H, '#8a8478')
    # the gatehouse in front of the hall
    gx0, gx1 = dcx - 54, dcx + 54
    paint_wall(s, rect(gx0, 150, gx1 - gx0, gy - 150), 'ashlar', '#bcb5ae', 51)
    s.fill(rect(gx0, 150, gx1 - gx0, 1), STONE[4]); s.fill(rect(gx0, 150, 1, gy - 150), STONE[4])
    for y in range(150, gy):
        for k, a in ((1, .55), (2, .7), (3, .85)):
            c = s.get(gx1 - k, y)
            if c[3]:
                s.set(gx1 - k, y, mul(c, a))
    weather(s, gx0, gx1, 150, 196, 51)
    corbels(s, gx0 + 2, gx1 - 2, 151)
    merlons(s, gx0 + 1, gx1, 141)
    for x in range(gx0, gx1):   # the gatehouse casts a shadow on the hall to its right
        pass
    for y in range(158, gy):
        for x in range(gx1, gx1 + 6):
            c = s.get(x, y)
            if c[3]:
                s.set(x, y, mul(c, .78))
    # the arched doorway, its voussoirs and a portcullis above the doors
    for x in range(dcx - 30, dcx + 30):
        for y in range(196, gy):
            d = abs(x + .5 - dcx)
            if y < 214 and ((d / 30) ** 2 + ((y - 214) / 18) ** 2) > 1:
                continue
            s.set(x, y, STONE[3] if (x + y // 6) % 7 else STONE[2])
    for x in range(dcx - 24, dcx + 24):
        for y in range(204, gy):
            d = abs(x + .5 - dcx)
            if y < 216 and ((d / 24) ** 2 + ((y - 216) / 12) ** 2) > 1:
                continue
            s.set(x, y, '#1e1820')
    door(s, dcx, H - 6, 'double', '#4a3020')
    for x in range(dcx - 22, dcx + 22, 4):
        s.fill(rect(x, 206, 2, 4), IRON[2]); s.set(x, 210, IRON[4])
    s.fill(rect(dcx - 9, 166, 18, 20), GOLD[1]); s.fill(rect(dcx - 8, 167, 16, 18), ROYAL[2])     # the crest over the gate
    s.fill(poly([(dcx - 8, 182), (dcx + 8, 182), (dcx, 190)]), ROYAL[2]); s.fill(rect(dcx - 8, 167, 16, 1), ROYAL[3])
    for j, row in enumerate(['y.y.y', '.yyy.', '..y..', '.yyy.', 'y...y']):
        for i, ch in enumerate(row):
            if ch == 'y':
                s.fill(rect(dcx - 5 + i * 2, 170 + j * 3, 2, 2), GOLD[3])
    for k in range(3):  # steps
        s.fill(rect(dcx - 34 + k * 3, H - 6 + k * 2, 68 - k * 6, 2), STONE[3 - k])
    # the two front towers
    for tcx in (52, W - 52):
        round_body(s, tcx, 46, 92, gy + 4, tcx)
        for wy in (130, 190, 250):
            s.fill(rect(tcx - 18, wy, 3, 16), '#1e1a22'); s.fill(rect(tcx + 14, wy + 8, 3, 14), '#141018')
        window(s, tcx - 4, 150, 10, 20, '#4a3a30', arch=True)
        string_course(s, tcx, 46, 212)
        weather(s, tcx - 40, tcx + 40, 110, gy - 6, tcx, [(tcx - 17, 146), (tcx - 17, 206)])
        corbels(s, tcx - 45, tcx + 44, 0, 9, lambda x, t=tcx: 92 + int(6 * math.sqrt(max(0, 1 - ((x - t) / 48) ** 2))))
        crenel_ring(s, tcx, 46, 92)
        cone_roof(s, tcx, 10, 84, 48)
    ivy(s, 12, 60, gy - 1, 140, 7, 10)   # ivy up the left tower
    s.outline()
    c = winterize(s) if winter else s
    c.meta = {'win': [list(r_) for r_ in WINLOG]}
    return c


IRONF = ['#1c2622', '#2e3c36', '#4a5e54', '#6e8478']        # painted iron glazing bars, dark green
LEAF = ['#1e3a24', '#2e5a32', '#468040', '#6aa452']
FRUIT = ['#e8902a', '#f0c030', '#d8482a']


def glass_bay(s, x0, x1, y0, y1, seed, top=None):
    """A glazed bay: the planting inside first (citrus trees, ferns, fruit), then the glass over it
    with a sky reflection, diagonal glints on alternate panes and iron bars. top(x) gives a sloped head."""
    r = rng(seed)
    crowns = [(r.randrange(x0 + 6, x1 - 6), r.randrange(y0 + 14, y0 + 34), r.randrange(9, 15)) for _ in range(max(2, (x1 - x0) // 22))]
    for x in range(x0, x1):
        t0 = top(x) if top else y0
        for y in range(t0, y1):
            c = '#2a4440'                                       # the shade inside
            for cx, cy, rr in crowns:                           # round citrus crowns, lit top-left
                d = ((x - cx) / rr) ** 2 + ((y - cy) / (rr * .8)) ** 2
                if d <= 1:
                    k = 3 if (x - cx) + (y - cy) < -rr * .5 else 2 if (x - cx) + (y - cy) < rr * .3 else 1
                    if vnoise(x * .5, y * .5, seed) > .7:
                        k = max(0, k - 1)
                    c = LEAF[k]
                if abs(x - cx) <= 1 and y > cy + rr * .6:
                    c = '#4a3020' if x == cx else '#6a4630'
            if y > y1 - 10 + int(3 * vnoise(x * .3, 1, seed)):  # ferns along the sill
                c = LEAF[1 + (x % 3 == 0)]
            v = (y - t0) / max(1, y1 - t0)
            g = mix('#d8eef0', '#7aa8b4', v)                     # the sky reflected in the glass
            s.set(x, y, mix(c, g, .32 if v > .25 else .55))
    for cx, cy, rr in crowns:                                    # fruit
        for _ in range(4):
            fx, fy = cx + r.randrange(-rr + 3, rr - 3), cy + r.randrange(-rr // 2, rr // 2)
            col = mix(r.choice(FRUIT), '#d8eef0', .25)
            s.fill(rect(fx, fy, 2, 2), col); s.set(fx, fy, mix(col, '#ffffff', .5))
    for px0 in range(x0, x1, 16):                                # glints on alternate panes
        if (px0 // 16) % 2 == 0:
            for k in range(14):
                for w in range(3):
                    x, y = px0 + 3 + k // 2 + w, (top(px0 + 8) if top else y0) + 4 + k
                    if x < x1 and y < y1 and s.get(x, y)[3]:
                        s.set(x, y, mix(s.get(x, y), '#ffffff', .45 if w == 1 else .25))
    for x in list(range(x0, x1, 16)) + [x1 - 2]:                 # mullions with a lit left edge
        t0 = top(x) if top else y0
        s.fill(rect(x, t0, 2, y1 - t0), IRONF[1]); s.fill(rect(x, t0, 1, y1 - t0), IRONF[3])
    for ty in (y0 + (y1 - y0) // 3, y0 + 2 * (y1 - y0) // 3):    # transoms
        for x in range(x0, x1):
            if not top or ty > top(x):
                s.set(x, ty, IRONF[1]); s.set(x, ty - 1, IRONF[2])


def glass_roof(s, x0, x1, yb, rise):
    """A hipped glass roof over a wing: courses of panes, lit on the left, an iron ridge with cresting."""
    yt = yb - rise
    for y in range(yt, yb):
        inset = (yb - y) * .6
        for x in range(int(x0 + inset), int(x1 - inset)):
            u = (x - x0) / (x1 - x0)
            c = mix('#e4f4f6', '#9cc4cc', u) if (y - yt) % 7 else IRONF[2]
            if (x - x0) % 16 in (0, 1):
                c = IRONF[1]
            elif (x + y) % 23 < 2 and (y - yt) % 7:
                c = mix(c, '#ffffff', .6)
            s.set(x, y, c)
    s.fill(rect(x0 - 2, yb, x1 - x0 + 4, 3), IRONF[1]); s.fill(rect(x0 - 2, yb, x1 - x0 + 4, 1), IRONF[3])  # gutter
    rx0, rx1 = int(x0 + rise * .6), int(x1 - rise * .6)
    s.fill(rect(rx0, yt - 1, rx1 - rx0, 2), IRONF[0])
    for x in range(rx0 + 2, rx1 - 1, 6):                          # cresting: little iron fleurs
        s.fill(rect(x, yt - 4, 1, 3), IRONF[1]); s.set(x - 1, yt - 4, IRONF[2]); s.set(x + 1, yt - 4, IRONF[2]); s.set(x, yt - 5, IRONF[3])


def greenhouse(winter=False):
    """The castle orangery: two glazed wings on a stone plinth and a taller gabled entrance bay with a
    fanlight, all in dark green iron. The door sits on the building's door tile (x 128-160)."""
    W, H = 256, 192
    s = Canvas(W, H)
    for y in range(H - 8, H):                                     # contact shadow
        for x in range(4, W - 4):
            if ((x - 128) / 124) ** 2 + ((y - (H - 5)) / 3.5) ** 2 <= 1:
                s.set(x, y, (20, 30, 10, 90))
    pl = 160                                                      # the plinth top
    bx0, bx1, ax = 114, 174, 144                                  # the entrance bay and its axis
    glass_roof(s, 6, bx0 + 4, 92, 30); glass_roof(s, bx1 - 4, W - 6, 92, 30)
    glass_bay(s, 8, bx0, 95, pl, 11); glass_bay(s, bx1, W - 8, 95, pl, 12)

    def gtop(x):                                                  # the gable over the bay
        return 40 + int(abs(x + .5 - ax) * .9)
    glass_bay(s, bx0, bx1, 40, pl, 13, gtop)
    for x in range(bx0 - 2, bx1 + 2):                             # barge boards
        y = gtop(x)
        s.fill(rect(x, y - 3, 1, 3), IRONF[1]); s.set(x, y - 3, IRONF[3] if x < ax else IRONF[2])
    s.fill(rect(ax - 1, 26, 2, 12), IRONF[1]); s.fill(ellipse(ax, 25, 2, 2), GOLD[2]); s.set(ax - 1, 24, GOLD[3])  # finial
    for k in range(9):                                            # the fanlight over the door
        a = math.pi * k / 8
        for t in range(4, 17):
            s.set(round(ax - math.cos(a) * t), round(108 - math.sin(a) * t * .9), IRONF[1])
    for x in range(ax - 17, ax + 18):
        d = abs(x + .5 - ax) / 17
        s.set(x, 108 - int(15 * math.sqrt(max(0, 1 - d * d))), IRONF[0])
    s.fill(rect(ax - 18, 108, 37, 2), IRONF[1])
    for x0, x1 in ((6, bx0 + 2), (bx1 - 2, W - 6)):              # corner posts
        for x in (x0, x1 - 3):
            s.fill(rect(x, 92, 3, pl - 92), IRONF[1]); s.fill(rect(x, 92, 1, pl - 92), IRONF[3])
    for x in (bx0 - 2, bx1 - 1):
        s.fill(rect(x, gtop(x), 3, pl - gtop(x)), IRONF[0]); s.fill(rect(x, gtop(x), 1, pl - gtop(x)), IRONF[2])
    paint_wall(s, rect(4, pl, W - 8, H - 8 - pl), 'ashlar', WALL_COL, 61)       # the stone plinth
    s.fill(rect(2, pl - 2, W - 4, 3), STONE[3]); s.fill(rect(2, pl - 2, W - 4, 1), STONE[4]); s.fill(rect(2, pl + 1, W - 4, 1), STONE[1])
    for x in range(4, W - 4):
        for k in range(3):
            c = s.get(x, H - 9 - k)
            if c[3]:
                s.set(x, H - 9 - k, mul(c, .8))
        if vnoise(x * .3, 2, 61) > .62:
            s.set(x, H - 9, MOSS[1])
    dx0, dw, dh = ax - 13, 26, 50                                # the glazed double door
    dy0 = H - 8 - dh
    s.fill(rect(dx0 - 3, dy0 - 3, dw + 6, dh + 3), IRONF[0])
    for x in range(dx0, dx0 + dw):
        for y in range(dy0, H - 8):
            s.set(x, y, mix('#2a4440', '#cfe8ec', .45 - (y - dy0) / dh * .25))
    for x in (dx0, ax - 1, dx0 + dw - 2):
        s.fill(rect(x, dy0, 2, dh), IRONF[1])
    for y in (dy0, dy0 + 16, dy0 + 32, H - 12):
        s.fill(rect(dx0, y, dw, 2), IRONF[1])
    for k in range(10):
        s.set(dx0 + 3 + k // 2, dy0 + 3 + k, mix('#cfe8ec', '#ffffff', .6))
    s.fill(rect(ax - 4, dy0 + 26, 2, 3), GOLD[2]); s.fill(rect(ax + 2, dy0 + 26, 2, 3), GOLD[2])
    for k in range(2):                                            # the step
        s.fill(rect(dx0 - 6 + k * 2, H - 8 + k * 2, dw + 12 - k * 4, 2), STONE[3 - k])
    for px_ in (24, W - 34):                                      # potted bay trees by the plinth
        s.fill(rect(px_, H - 22, 10, 12), '#c8582a'); s.fill(rect(px_, H - 22, 10, 2), '#e8804a'); s.fill(rect(px_ + 7, H - 20, 3, 10), '#8a3a1a')
        s.fill(rect(px_ + 4, H - 26, 2, 4), '#4a3020')
        s.fill(ellipse(px_ + 5, H - 32, 7, 7), LEAF[1]); s.fill(ellipse(px_ + 3, H - 34, 4, 4), LEAF[3])
    s.outline()
    c = winterize(s) if winter else s
    c.meta = {'win': []}
    return c


# ---- castle furniture -------------------------------------------------------
def throne():
    s = base(64, 88)
    s.shade(rect(14, 4, 36, 54), None, 'form', colors=GOLD)               # gilded back
    s.fill(poly([(14, 8), (32, 0), (50, 8)]), GOLD[2])
    s.shade(rect(20, 10, 24, 44), None, 'form', colors=ROYAL)              # velvet
    for j, row in enumerate(['y.y.y', '.yyy.', '..y..', '.yyy.']):
        for i, ch in enumerate(row):
            if ch == 'y':
                s.fill(rect(27 + i * 2, 18 + j * 3, 2, 2), GOLD[3])
    s.shade(rect(8, 50, 48, 14), None, 'form', colors=ROYAL)               # seat
    s.fill(rect(8, 50, 48, 2), ROYAL[3])
    for x in (6, 50):                                                     # arms
        s.shade(rect(x, 40, 8, 26), None, 'form', colors=GOLD)
        s.fill(ellipse(x + 4, 40, 4, 3), GOLD[3])
    s.shade(rect(10, 64, 44, 8), None, 'form', colors=GOLD[:3])
    for x in (10, 48):
        s.fill(rect(x, 72, 6, 12), GOLD[1]); s.fill(rect(x, 72, 2, 12), GOLD[2])
    for x, y in ((32, 4), (20, 8), (44, 8)):
        s.fill(ellipse(x, y, 2, 2), '#e83a5a'); s.set(x - 1, y - 1, '#ffb0c0')
    return finish(s)


def royal_bed():
    s = base(96, 96)
    for x in (4, 88):                                                     # posts
        s.fill(rect(x, 0, 5, 92), WOOD[2]); s.fill(rect(x, 0, 1, 92), WOOD[4]); s.fill(rect(x + 4, 0, 1, 92), WOOD[0])
    s.shade(rect(4, 0, 89, 10), None, 'form', colors=ROYAL)                # canopy
    for x in range(4, 93, 8):
        s.fill(poly([(x, 10), (x + 8, 10), (x + 4, 15)]), ROYAL[1])
    s.fill(rect(4, 1, 89, 1), GOLD[3]); s.fill(rect(4, 9, 89, 1), GOLD[2])
    for x in (9, 80):                                                     # tied curtains
        s.shade(rect(x, 10, 7, 60), None, 'form', colors=ROYAL)
        s.fill(rect(x, 44, 7, 2), GOLD[2])
    s.shade(rect(16, 16, 64, 20), None, 'form', colors=WOOD[1:])           # headboard
    s.fill(rect(16, 16, 64, 2), GOLD[2])
    s.shade(rect(20, 32, 26, 12), None, 'form', colors=CLOTH['cream'])
    s.shade(rect(50, 32, 26, 12), None, 'form', colors=CLOTH['cream'])
    s.shade(rect(14, 42, 68, 42), None, 'form', colors=ROYAL)               # quilt
    for y in range(50, 84, 8):
        s.fill(rect(14, y, 68, 1), ROYAL[0])
    s.fill(rect(14, 42, 68, 3), CLOTH['cream'][2]); s.fill(rect(14, 60, 68, 2), GOLD[2])
    s.shade(rect(12, 82, 72, 10), None, 'form', colors=WOOD[1:])
    return finish(s)


def banquet():
    s = base(128, 52)
    plank_top(s, 2, 4, 124, 26, LWOOD)
    s.shade(rect(2, 4, 124, 16), None, 'form', colors=CLOTH['cream'])          # runner cloth
    s.fill(rect(2, 18, 124, 2), ROYAL[2])
    s.fill(rect(2, 30, 124, 4), LWOOD[1])
    for x in (6, 60, 116):
        s.shade(rect(x, 34, 6, 14), None, 'cyl', colors=LWOOD[:4])
    r = rng(5)
    for x in range(12, 120, 18):                                           # plates, goblets, a roast
        s.shade(ellipse(x, 11, 5, 3), None, 'sphere', colors=['#8a8478', '#c8c2b2', '#f0ece0'])
        s.fill(ellipse(x, 10, 2, 1), r.choice(['#c8703a', '#7aa04a', '#e8c050']))
        s.shade(rect(x + 7, 5, 3, 6), None, 'cyl', colors=GOLD[:3])
    s.shade(ellipse(64, 9, 9, 5), None, 'sphere', colors=['#6a3a1a', '#a8602a', '#d8904a'])
    for x in (40, 88):                                                     # candles
        s.fill(rect(x, 0, 3, 8), CLOTH['cream'][3]); s.set(x + 1, 0, '#ffd25a'); s.fill(rect(x - 1, 7, 5, 2), GOLD[1])
    return finish(s)


def armour_stand():
    s = base(32, 76)
    s.fill(rect(15, 60, 3, 12), WOOD[2]); s.fill(rect(9, 70, 15, 4), WOOD[1])
    s.shade(ellipse(16, 10, 7, 8), None, 'sphere', colors=IRON[1:])        # helm
    s.fill(rect(10, 10, 13, 2), IRON[0]); s.fill(rect(15, 2, 3, 5), ROYAL[2])
    s.shade(rect(7, 18, 19, 24), None, 'form', colors=IRON[1:])             # cuirass
    s.fill(rect(15, 20, 2, 20), IRON[4])
    s.shade(rect(3, 19, 5, 18), None, 'cyl', colors=IRON[1:]); s.shade(rect(25, 19, 5, 18), None, 'cyl', colors=IRON[1:])
    s.shade(rect(9, 42, 15, 18), None, 'form', colors=IRON[1:])             # tassets and legs
    s.fill(rect(16, 46, 1, 14), IRON[0])
    s.fill(rect(9, 42, 15, 2), ROYAL[2])
    return finish(s)


def altar():
    s = base(64, 60)
    s.shade(rect(4, 20, 56, 36), None, 'form', colors=ISTONE[1:])
    s.shade(rect(2, 16, 60, 8), None, 'form', colors=ISTONE[2:])
    s.shade(rect(18, 24, 28, 30), None, 'form', colors=CLOTH['cream'])       # altar cloth
    for j, row in enumerate(['..y..', '.yy..', '.yyy.', 'yyoyy', 'yooyy', '.yoy.']):   # the ember flame
        for i, ch in enumerate(row):
            if ch != '.':
                s.fill(rect(27 + i * 2, 28 + j * 3, 2, 3), GOLD[3] if ch == 'y' else '#e8602a')
    for x in (10, 50):
        s.fill(rect(x, 4, 4, 12), CLOTH['cream'][3]); s.fill(rect(x + 1, 1, 2, 3), '#ffd25a'); s.set(x + 1, 0, '#fff4c0')
        s.fill(rect(x - 2, 14, 8, 3), GOLD[1])
    s.shade(rect(26, 6, 12, 10), None, 'form', colors=GOLD)                 # reliquary
    s.fill(rect(30, 2, 4, 4), GOLD[3])
    return finish(s)


def candelabra():
    s = base(32, 68)
    s.fill(rect(15, 14, 3, 48), GOLD[1]); s.fill(rect(15, 14, 1, 48), GOLD[3])
    s.fill(rect(9, 60, 15, 4), GOLD[1]); s.fill(rect(11, 58, 11, 2), GOLD[2])
    s.fill(rect(5, 16, 23, 2), GOLD[2])
    for x in (5, 15, 25):
        s.fill(rect(x, 6, 3, 10), CLOTH['cream'][3]); s.fill(rect(x + 1, 2, 1, 4), '#ffd25a'); s.set(x + 1, 1, '#fff4c0')
    c = finish(s); c.meta = {'light': [16, 3]}   # the middle flame, for night glow
    return c


def royal_chest():
    s = base(48, 40)
    s.shade(rect(4, 10, 40, 26), None, 'form', colors=WOOD[1:])
    s.shade(rect(3, 4, 42, 10), None, 'form', colors=WOOD[2:])
    for x in (4, 22, 40):
        s.fill(rect(x, 4, 4, 32), GOLD[1]); s.fill(rect(x, 4, 1, 32), GOLD[3])
    s.fill(rect(20, 14, 8, 8), GOLD[2]); s.fill(rect(23, 17, 2, 3), '#2a1c18')
    return finish(s)


def harp():
    s = base(40, 72)
    s.fill(line(8, 66, 8, 10) | line(9, 66, 9, 10), GOLD[1])
    s.fill(line(8, 10, 32, 22) | line(8, 11, 32, 23), GOLD[2])
    s.fill(line(32, 22, 26, 66) | line(33, 22, 27, 66), GOLD[1])
    for k in range(11, 31, 3):
        s.fill(line(k, 12 + (k - 8) // 2, k, 64), '#f0e6c8')
    s.fill(rect(4, 64, 28, 5), WOOD[2]); s.fill(rect(4, 64, 28, 1), WOOD[4])
    return finish(s)


def tapestry():
    s = Canvas(64, 76)
    s.fill(rect(0, 0, 64, 3), WOOD[2]); s.fill(rect(0, 0, 64, 1), WOOD[4])
    s.fill(rect(3, 3, 58, 66), ROYAL[1]); s.fill(rect(6, 6, 52, 60), ROYAL[2])
    s.fill(rect(6, 6, 52, 2), GOLD[2]); s.fill(rect(6, 64, 52, 2), GOLD[2])
    s.fill(rect(6, 6, 2, 60), GOLD[2]); s.fill(rect(56, 6, 2, 60), GOLD[2])
    for x in range(10, 54):   # a woven scene: hills, the castle, the stag
        for y in range(44, 62):
            if y > 50 + 4 * math.sin(x * .2):
                s.set(x, y, '#3e7a44' if (x + y) % 5 else '#2a5a32')
    s.fill(rect(24, 30, 16, 20), '#cfc8c2'); s.fill(rect(20, 24, 6, 26), '#aea8a6'); s.fill(rect(38, 24, 6, 26), '#aea8a6')
    s.fill(poly([(19, 24), (23, 16), (27, 24)]), SLATE[3]); s.fill(poly([(37, 24), (41, 16), (45, 24)]), SLATE[3])
    s.fill(rect(30, 42, 4, 8), '#3a2218')
    for x in range(3, 61, 4):
        s.fill(rect(x, 69, 2, 6), GOLD[2])
    return s


def runner(h=224):
    s = Canvas(64, h)
    s.fill(rect(0, 0, 64, h), ROYAL[1]); s.fill(rect(4, 0, 56, h), ROYAL[2])
    s.fill(rect(6, 0, 2, h), GOLD[2]); s.fill(rect(56, 0, 2, h), GOLD[2])
    for y in range(10, h - 10, 24):
        s.fill(poly([(32, y), (40, y + 8), (32, y + 16), (24, y + 8)]), GOLD[1])
        s.fill(poly([(32, y + 3), (37, y + 8), (32, y + 13), (27, y + 8)]), ROYAL[3])
    return s


def stained_glass():
    s = Canvas(32, 44)
    for x in range(2, 30):
        for y in range(2, 42):
            if y < 16 and ((x - 15.5) / 14) ** 2 + ((y - 16) / 14) ** 2 > 1:
                continue
            s.set(x, y, '#2a2a34')
    cols = ['#d83a4a', '#3a6ad8', '#e8c040', '#4aa86a', '#8a4ac8']
    for x in range(4, 28):
        for y in range(4, 40):
            if y < 16 and ((x - 15.5) / 12) ** 2 + ((y - 16) / 12) ** 2 > 1:
                continue
            if x % 6 == 3 or y % 7 == 2:
                continue
            s.set(x, y, cols[(x // 6 + y // 7) % len(cols)])
    s.fill(rect(0, 40, 32, 4), ISTONE[3]); s.fill(rect(0, 40, 32, 1), ISTONE[4])
    return s


def royal_banner():
    s = Canvas(24, 48)
    s.fill(rect(0, 0, 24, 3), GOLD[1])
    s.fill(poly([(3, 3), (21, 3), (21, 44), (12, 37), (3, 44)]), ROYAL[2])
    s.fill(rect(3, 3, 2, 38), ROYAL[3]); s.fill(rect(19, 3, 2, 38), ROYAL[1])
    for j, row in enumerate(['y.y.y', '.yyy.', '..y..', '.yyy.', 'y...y']):
        for i, ch in enumerate(row):
            if ch == 'y':
                s.fill(rect(7 + i * 2, 12 + j * 3, 2, 2), GOLD[3])
    return s


SPRITES = {f'cwall_{m}': (lambda m=m: cwall(m)) for m in range(16)}
SPRITES.update({f'cwall_{m}_w': (lambda m=m: cwall(m, True)) for m in range(16)})
SPRITES.update({
    'ctower': ctower, 'ctower_w': lambda: ctower(True), 'cgate': gate_arch, 'cgate_w': lambda: gate_arch(True),
    'bld_castle_18x10': keep, 'bld_castle_18x10_w': lambda: keep(winter=True),
    'bld_greenhouse_8x6': greenhouse, 'bld_greenhouse_8x6_w': lambda: greenhouse(True),
    'furn_throne': throne, 'furn_royalbed': royal_bed, 'furn_banquet': banquet, 'furn_armour': armour_stand,
    'furn_altar': altar, 'furn_candles': candelabra, 'furn_chest': royal_chest, 'furn_harp': harp,
    'dec_tapestry': tapestry, 'dec_runner': runner, 'dec_runner_s': lambda: runner(128), 'dec_glass': stained_glass, 'dec_banner_royal': royal_banner,
})
