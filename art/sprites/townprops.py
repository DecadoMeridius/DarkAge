"""Props that give each Wilds town its own trade (art-and-feel playtest, 2026-10-31: "Greyhelm is a smaller
copy of Kingsbridge; nothing says mining town"). Hand-placed pixels, light from the top-left.

- Greyhelm, the mining town: mine rails (both ways), an ore-filled mine cart, a slag heap.
- Ashford, the woodcutters: a stacked log pile.
- Saltmere, the fishers: a rowboat drawn up on the sand, a fish-drying rack."""
from px import Canvas, rect, ellipse, poly, vnoise, rng
from sprites.interior import finish, WOOD, IRON

RAIL = ['#2a2a30', '#56565e', '#8a8a92', '#c0c0c8']
SLEEPER = ['#3a2416', '#5a3a22', '#7a5434', '#94683e']
ORE = ['#3a3236', '#5a4e4e', '#7a6c66', '#a08e80']
COPPER = ['#7a3a1a', '#c0642a', '#f0a050']
SLAG = ['#24202a', '#3a343e', '#524a54', '#6e646c', '#8a7e84']
BARK = ['#3a2416', '#5a3a22', '#7a5434']
RING = ['#b08a5a', '#d0aa74', '#ecca94']
HULL = ['#3a2214', '#5e3a20', '#86582e', '#a87440']
FISH = ['#4a5a6a', '#7a8e9e', '#b8c8d0']


def rails(vertical=False):
    """Two iron rails on wooden sleepers, a ground piece you walk over."""
    s = Canvas(32, 32)
    for k in range(4):                       # sleepers every 8 px
        a = k * 8 + 2
        for t in range(32):
            for w in range(5):
                x, y = (a + w, t) if not vertical else (t, a + w)
                if 2 <= t <= 29:
                    s.set(x, y, SLEEPER[3] if w == 0 else SLEEPER[0] if w == 4 else SLEEPER[2 if (t + k) % 7 else 1])
    for r in (8, 22):                        # the rails: a lit top, a dark side
        for t in range(32):
            for w, c in ((0, RAIL[3]), (1, RAIL[2]), (2, RAIL[1]), (3, RAIL[0])):
                x, y = (t, r + w) if not vertical else (r + w, t)
                s.set(x, y, c)
    return s


def minecart():
    s = Canvas(36, 30)
    for (x, y) in poly([(3, 8), (33, 8), (30, 24), (6, 24)]):        # the tub
        s.set(x, y, IRON[2] if x < 12 else IRON[1] if x < 26 else IRON[0])
    for y in (11, 19):                                                  # iron bands
        for x in range(4, 33):
            if s.get(x, y)[3]:
                s.set(x, y, IRON[3] if x < 14 else IRON[2])
    for x, y in ellipse(18, 8, 14, 5):                                  # the ore heaped over the rim
        if y <= 9:
            n = vnoise(x * .5, y * .7, 4)
            s.set(x, y, COPPER[2] if n > .78 else COPPER[1] if n > .7 else ORE[3] if (x + y) % 5 == 0 or y < 5 else ORE[2] if x < 20 else ORE[1])
    for cx in (10, 26):                                                 # wheels
        for x, y in ellipse(cx, 25, 4, 4):
            s.set(x, y, RAIL[1] if (x - cx) * (x - cx) + (y - 25) ** 2 > 6 else RAIL[0])
        s.set(cx - 1, 23, RAIL[3])
    return finish(s)


def slag():
    s = Canvas(48, 26)
    r = rng(17)
    for x, y in ellipse(24, 18, 22, 9):
        if y < 18 and abs(x - 24) > (y - 9) * 2.4 + 10:
            continue
        n = vnoise(x * .35, y * .5, 9)
        k = 4 if n > .78 else 3 if n > .6 else 2 if n > .4 else 1
        if x > 30:
            k = max(0, k - 1)
        s.set(x, y, SLAG[k])
    for _ in range(14):                                                 # loose lumps with a lit top-left
        x, y = r.randrange(6, 42), r.randrange(10, 24)
        if s.get(x, y)[3]:
            s.set(x, y, SLAG[4]); s.set(x + 1, y + 1, SLAG[0])
    for x, y in ((16, 13), (29, 17), (21, 20)):                         # a glint of ore left in the spoil
        s.set(x, y, COPPER[2]); s.set(x + 1, y, COPPER[1])
    return finish(s)


def logpile():
    """Logs stacked three high, cut ends towards you."""
    s = Canvas(52, 34)
    rows = [(8, 26, [6, 18, 30, 42]), (8, 17, [12, 24, 36]), (8, 8, [18, 30])]
    for rr, cy, xs in rows:
        for cx in xs:
            for x, y in ellipse(cx, cy, 6, 6):
                d = ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2) ** .5
                c = BARK[2] if d > 5 and x < cx else BARK[1] if d > 5 else BARK[0] if d > 4.4 else RING[0] if int(d) % 2 else RING[1]
                if d <= 2.2 and x <= cx and y <= cy:
                    c = RING[2]
                s.set(x, y, c)
            s.set(cx, cy, BARK[1])
    return finish(s)


def rowboat():
    """A rowboat drawn up on the sand: pointed at both ends, planked, two thwarts and an oar."""
    s = Canvas(66, 30)
    hull = poly([(1, 15), (12, 7), (54, 7), (65, 14), (54, 24), (12, 24)])
    for x, y in hull:
        s.set(x, y, HULL[3] if y < 10 else HULL[2] if y < 19 else HULL[1])
    inside = poly([(6, 15), (14, 10), (52, 10), (60, 14), (52, 21), (14, 21)])
    for x, y in inside:
        s.set(x, y, HULL[0] if (y - 10) % 4 == 3 else HULL[1])          # plank seams along the bottom
    for x, y in hull - inside:                                          # the gunwale, lit along the top
        if y <= 12:
            s.set(x, y, '#c08850' if (x, y - 1) not in hull else HULL[3])
    for bx in (24, 40):                                                 # thwarts
        s.fill(rect(bx, 10, 4, 11), WOOD[3]); s.fill(rect(bx + 3, 10, 1, 11), WOOD[1])
    for x in range(16, 46):                                             # an oar along the seats
        s.set(x, 15, WOOD[4]); s.set(x, 16, WOOD[2])
    s.fill(rect(44, 14, 7, 4), WOOD[3]); s.fill(rect(44, 17, 7, 1), WOOD[1])
    return finish(s)


def fishrack():
    s = Canvas(52, 46)
    for px_ in (4, 46):                                                 # posts
        s.fill(rect(px_, 6, 3, 38), WOOD[2]); s.fill(rect(px_, 6, 1, 38), WOOD[3]); s.fill(rect(px_ + 2, 6, 1, 38), WOOD[0])
    for y in (8, 22):                                                   # cross poles
        s.fill(rect(3, y, 47, 2), WOOD[3]); s.fill(rect(3, y + 2, 47, 1), WOOD[0])
    for row, y0 in ((0, 11), (1, 25)):                                  # fish hung by the tail
        for k, fx in enumerate(range(9, 45, 6)):
            if (k + row) % 5 == 4:
                continue
            for j in range(12):
                w = 1 if j < 2 else 2 if j < 9 else 1
                for i in range(-w + 1, w + 1):
                    s.set(fx + i, y0 + j, FISH[2] if i <= 0 and j < 9 else FISH[1] if j < 10 else FISH[0])
            s.set(fx, y0 + 9, '#1a1a20')
    return finish(s)


SPRITES = {'furn_rails': rails, 'furn_rails_v': lambda: rails(True), 'furn_minecart': minecart, 'furn_slag': slag,
           'furn_logpile': logpile, 'furn_rowboat': rowboat, 'furn_fishrack': fishrack}
