"""Hand-pixelled props (override props.py): joined fences, a knight statue, broken ruin walls with ivy,
an iron lamp post, a stone forge and an ember shrine. Pixels are placed run by run with fixed palettes:
light from the top-left, a lit edge, a base, a shade and a dark edge, then the selective outline.

Fences: fence_<mask> for every combination of neighbours (1 north, 2 east, 4 south, 8 west); a run going
across shows its rails side-on, a run going up and down shows the rail tops from above.
"""
from px import Canvas

WOOD = {'k': '#2e1c10', 'd': '#4a2e1a', 'm': '#7a4e2c', 'l': '#a8743f', 'h': '#d09a60'}
STONE = {'k': '#2e2c30', 'd': '#55525a', 'm': '#7e7a82', 'l': '#a8a4ac', 'h': '#d0ccd2'}
MOSS = {'d': '#2e5a26', 'm': '#4a8a3a', 'l': '#7ab858'}
IRON = {'k': '#18181e', 'd': '#2e3038', 'm': '#4e525e', 'l': '#7e8492', 'h': '#b8bec8'}
FIRE = {'r': '#c8341a', 'o': '#ff8a2a', 'y': '#ffd860', 'w': '#fff6c8'}


def box(s, x0, y0, w, h, P, lit=True):
    """A shaded block: lit top row and left column, shaded right column and bottom row."""
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            c = P['m']
            if y == y0 and lit:
                c = P['h'] if 'h' in P else P['l']
            elif x == x0 and lit:
                c = P['l']
            elif x == x0 + w - 1 or y == y0 + h - 1:
                c = P['d']
            s.set(x, y, c)


def shadow_ellipse(s, cx, cy, rx, ry):
    for y in range(cy - ry, cy + ry + 1):
        for x in range(cx - rx, cx + rx + 1):
            if ((x - cx) / rx) ** 2 + ((y - cy) / max(1, ry)) ** 2 <= 1 and not s.get(x, y)[3]:
                s.set(x, y, (20, 30, 10, 90))


def done(s):
    s.outline()
    return s


# ---------- fences ----------
def fence(mask):
    s = Canvas(32, 36)
    N, E, S_, W = mask & 1, mask & 2, mask & 4, mask & 8
    shadow_ellipse(s, 16, 33, 6, 1)
    if N:   # rails running away from us: their tops, from above, either side of the post
        for x0 in (10, 19):
            box(s, x0, 0, 3, 14, WOOD)
    if S_:
        for x0 in (10, 19):
            box(s, x0, 20, 3, 16, WOOD)
    for (on, xa, xb) in ((W, 0, 13), (E, 19, 32)):
        if on:
            for y0 in (11, 21):
                box(s, xa, y0, xb - xa, 4, WOOD)
                for x in range(xa + 3, xb - 1, 7):
                    s.set(x, y0 + 2, WOOD['d'])        # plank grain
                s.set(xa + (xb - xa) // 2, y0 + 1, WOOD['l'])
    box(s, 13, 6, 6, 28, WOOD)                           # the post
    for y in (6, 7):
        for x in range(13, 19):
            s.set(x, y, WOOD['h'] if y == 6 else WOOD['l'])
    s.set(14, 5, WOOD['l']); s.set(15, 4, WOOD['h']); s.set(16, 4, WOOD['h']); s.set(17, 5, WOOD['m'])  # a rounded cap
    for y in range(10, 32, 5):
        s.set(15, y, WOOD['d']); s.set(16, y + 2, WOOD['d'])  # grain
    for y0 in (12, 22):
        if W:
            s.set(13, y0 + 1, WOOD['k'])                     # nails
        if E:
            s.set(18, y0 + 1, WOOD['k'])
    return done(s)


# ---------- a knight statue on a stepped plinth ----------
def statue():
    s = Canvas(36, 68)
    shadow_ellipse(s, 18, 64, 14, 2)
    box(s, 3, 58, 30, 6, STONE); box(s, 6, 53, 24, 6, STONE)       # stepped plinth
    for x in range(8, 28, 6):
        s.set(x, 61, STONE['d'])
    # cloak falling behind
    for y in range(26, 53):
        w = 6 + (y - 26) // 3
        for x in range(18 - w, 18 + w):
            s.set(x, y, STONE['d'] if x > 18 + w - 3 else STONE['m'] if x > 18 - w + 1 else STONE['l'])
    box(s, 13, 27, 10, 14, STONE)                                    # breastplate
    for x in range(14, 22):
        s.set(x, 33, STONE['d'])
    box(s, 14, 40, 3, 13, STONE); box(s, 19, 40, 3, 13, STONE)     # legs
    box(s, 9, 26, 5, 5, STONE); box(s, 22, 26, 5, 5, STONE)        # pauldrons
    box(s, 13, 15, 10, 11, STONE)                                    # great helm
    for x in range(14, 22):
        s.set(x, 19, STONE['k'])                                     # eye slit
    s.set(18, 14, STONE['h']); s.set(18, 13, STONE['l']); s.set(18, 12, STONE['m'])  # crest ridge
    # both hands on the pommel of a sword planted point-down
    for y in range(36, 56):
        s.set(17, y, STONE['h']); s.set(18, y, STONE['l']); s.set(19, y, STONE['d'])
    for x in range(14, 23):
        s.set(x, 35, STONE['l'])                                      # crossguard
    box(s, 16, 31, 4, 4, STONE)                                      # gauntlets on the pommel
    for x, y in ((6, 57), (7, 56), (27, 58), (28, 57), (11, 52), (30, 63)):
        s.set(x, y, MOSS['m']); s.set(x + 1, y, MOSS['l'])
    return done(s)


# ---------- a broken wall of fitted stones, with ivy ----------
def ruinwall():
    s = Canvas(32, 60)
    shadow_ellipse(s, 16, 57, 15, 2)
    top = [12, 8, 5, 7, 14, 11, 18, 16]
    rows = [(52, 6), (46, 6), (40, 6), (34, 6), (28, 6), (22, 6), (16, 6), (10, 6), (4, 6)]
    offs = 0
    for y0, h in rows:
        x = -((offs * 5) % 9)
        while x < 32:
            w = 7 + ((x * 13 + y0) % 5)
            x0, x1 = max(1, x), min(31, x + w - 1)
            stone_top = max(top[min(7, x0 // 4)], y0)
            if x1 - x0 >= 2 and y0 + h - 1 >= top[min(7, x0 // 4)]:
                for yy in range(stone_top, y0 + h):
                    for xx in range(x0, x1):
                        if yy < top[min(7, xx // 4)]:
                            continue
                        c = STONE['m']
                        if yy == stone_top:
                            c = STONE['h'] if yy == top[min(7, xx // 4)] else STONE['l']
                        elif xx == x0:
                            c = STONE['l']
                        elif xx == x1 - 1 or yy == y0 + h - 1:
                            c = STONE['d']
                        s.set(xx, yy, c)
            x += w
        offs += 1
    for y in range(58):          # mortar gaps stay dark where stones meet
        for x in range(1, 31):
            if not s.get(x, y)[3] and y >= top[min(7, x // 4)] and y < 58:
                s.set(x, y, STONE['k'])
    for x0, y0, L in ((5, 9, 18), (20, 17, 22), (27, 16, 12)):     # ivy hanging down the face
        for k in range(L):
            x = x0 + (1 if (k // 3) % 2 else 0)
            s.set(x, y0 + k, MOSS['d'] if k % 4 == 3 else MOSS['m'])
            if k % 3 == 0:
                s.set(x + 1, y0 + k, MOSS['l']); s.set(x - 1, y0 + k + 1, MOSS['m'])
    for x in range(2, 30, 3):
        s.set(x, 56, MOSS['m'])
    return done(s)


# ---------- an iron lamp post with a hanging lantern ----------
def lantern(lit=True):
    s = Canvas(32, 56)
    shadow_ellipse(s, 16, 53, 7, 1)
    box(s, 10, 50, 12, 4, IRON); box(s, 12, 47, 8, 3, IRON)              # base
    for y in range(14, 47):
        s.set(14, y, IRON['l']); s.set(15, y, IRON['m']); s.set(16, y, IRON['m']); s.set(17, y, IRON['d'])
    for y in (24, 36):
        for x in range(13, 19):
            s.set(x, y, IRON['h'] if x == 13 else IRON['l'])                # collars
    for x in range(15, 26):
        s.set(x, 12, IRON['l']); s.set(x, 13, IRON['d'])                 # crossarm
    s.set(26, 11, IRON['l']); s.set(27, 10, IRON['m'])                   # curled end
    s.set(22, 14, IRON['m']); s.set(22, 15, IRON['m'])                   # hook
    box(s, 18, 16, 9, 2, IRON)                                           # lantern cap
    s.set(21, 15, IRON['l']); s.set(22, 14, IRON['l']); s.set(23, 15, IRON['l'])
    for y in range(18, 26):                                              # glass and flame (by day: dark glass, a cold wick)
        s.set(18, y, IRON['d']); s.set(26, y, IRON['d'])
        for x in range(19, 26):
            if lit:
                s.set(x, y, FIRE['y'] if 20 <= x <= 24 and 19 <= y <= 24 else FIRE['o'])
            else:
                s.set(x, y, '#c8d8d8' if x == 19 and y < 23 else '#7a8a8e' if (x + y) % 5 else '#5a6a70')
    if lit:
        s.set(22, 20, FIRE['w']); s.set(22, 21, FIRE['w']); s.set(21, 22, FIRE['w']); s.set(23, 22, FIRE['w'])
    else:
        s.set(22, 23, '#3a2a20'); s.set(22, 24, '#3a2a20'); s.set(22, 25, '#c8b890')
    for x in range(18, 27):
        s.set(x, 26, IRON['m'])
    s.set(22, 27, IRON['d'])
    if lit:
        s.meta = {'light': [22, 21]}
    return done(s)


# ---------- a stone forge: hood and chimney, glowing coals, bellows ----------
def forge():
    s = Canvas(32, 44)
    shadow_ellipse(s, 16, 41, 13, 2)
    box(s, 3, 24, 26, 16, STONE)                                         # hearth block
    for y in range(28, 40, 4):
        for x in range(3 + (y // 4) % 2 * 4, 29, 8):
            s.set(x, y, STONE['d'])
    for y in range(26, 34):                                              # the fire mouth
        for x in range(9, 23):
            c = STONE['k']
            if y > 28:
                c = FIRE['r'] if (x + y) % 3 == 0 else FIRE['o'] if (x * 3 + y) % 4 else FIRE['y']
            s.set(x, y, c)
    for x in range(11, 21, 3):
        s.set(x, 31, FIRE['w'])
    box(s, 7, 12, 18, 12, STONE)                                         # hood
    for x in range(8, 24):
        s.set(x, 23, STONE['d'])
    box(s, 12, 0, 8, 12, STONE)                                          # chimney
    s.set(14, 0, (90, 90, 90, 160)); s.set(16, 0, (110, 110, 110, 140))
    box(s, 25, 30, 6, 6, WOOD); s.set(27, 29, WOOD['d']); s.set(28, 28, WOOD['m'])  # bellows
    for x in range(25, 31):
        s.set(x, 33, WOOD['k'])
    s.meta = {'light': [16, 30]}
    return done(s)


# ---------- the ember shrine: carved pillars and a burning bowl ----------
def shrine():
    s = Canvas(48, 60)
    shadow_ellipse(s, 24, 56, 20, 2)
    box(s, 4, 50, 40, 6, STONE); box(s, 8, 46, 32, 5, STONE)            # steps
    for x0 in (8, 34):                                                   # pillars
        box(s, x0, 18, 6, 28, STONE)
        for y in range(22, 44, 6):
            s.set(x0 + 2, y, STONE['d']); s.set(x0 + 3, y + 1, STONE['l'])
    for y, (x0, w) in enumerate(((4, 40), (6, 36), (8, 32), (12, 24), (16, 16))):
        box(s, x0, 14 - y * 3, w, 4, STONE)                              # stacked roof slabs
    s.set(24, 0, STONE['h'])
    box(s, 16, 38, 16, 8, STONE)                                         # altar
    for x in range(17, 31):
        s.set(x, 37, STONE['d'])
    for y in range(26, 38):                                              # the ember flame in its bowl
        w = (38 - y) // 2
        for x in range(24 - w, 25 + w):
            s.set(x, y, FIRE['y'] if abs(x - 24) < w - 1 else FIRE['o'])
    s.set(24, 30, FIRE['w']); s.set(24, 31, FIRE['w']); s.set(24, 33, FIRE['w'])
    box(s, 19, 36, 11, 2, IRON)
    for x, y in ((6, 49), (7, 48), (40, 49), (41, 48), (12, 45)):
        s.set(x, y, MOSS['m']); s.set(x + 1, y, MOSS['l'])
    s.meta = {'light': [24, 30]}
    return done(s)


# ---------- the village fountain (128x150): a stone basin over the plaza pond, a two-tier spout ----------
WATER = {'k': '#1e3a5a', 'd': '#2a5a8a', 'm': '#3a7ab8', 'l': '#6aaee0', 'h': '#c8ecff'}


def fountain():
    s = Canvas(128, 150)
    cx, cy = 64, 96
    inE = lambda x, y, rx, ry, oy=0: ((x - cx) / rx) ** 2 + ((y - cy - oy) / ry) ** 2 <= 1
    shadow_ellipse(s, cx, cy + 34, 62, 10)
    for x in range(128):                                       # the basin wall, front face, with block joints
        for y in range(60, 150):
            if inE(x, y, 61, 33, 10) and not inE(x, y, 61, 33):
                j = (x // 9 + (1 if y > cy + 30 else 0)) % 2
                c = STONE['d'] if (x % 9 == 0 and y > cy) or y >= cy + 33 + 8 else STONE['m'] if j else STONE['l']
                if x > 100:
                    c = STONE['d'] if c != STONE['l'] else STONE['m']
                s.set(x, y, c)
    for x in range(128):                                       # the rim: lit on the far (top) side
        for y in range(56, 140):
            if inE(x, y, 61, 33) and not inE(x, y, 52, 27):
                c = STONE['h'] if y < cy - 20 and x < 90 else STONE['l'] if y < cy else STONE['m']
                if (x + y) % 11 == 0:
                    c = STONE['d']
                s.set(x, y, c)
    for x in range(128):                                       # the water, darker toward the near wall
        for y in range(60, 140):
            if inE(x, y, 51, 26):
                c = WATER['d'] if y < cy - 16 else WATER['m']
                if y > cy + 14:
                    c = WATER['m']
                if (y - cy) % 6 == 0 and (x + y // 6) % 9 < 4:
                    c = WATER['l']
                s.set(x, y, c)
    for y in range(66, 72):                                    # the far rim's shadow on the water
        for x in range(30, 98):
            if inE(x, y, 51, 26) and not inE(x, y, 49, 26, 4):
                s.set(x, y, WATER['k'])
    # the pedestal and lower bowl
    box(s, 58, 54, 12, 44, STONE)
    for x in range(36, 93):
        for y in range(50, 66):
            if ((x - 64) / 28) ** 2 + ((y - 58) / 7) ** 2 <= 1:
                s.set(x, y, STONE['l'] if y < 56 else STONE['m'] if y < 62 else STONE['d'])
            if ((x - 64) / 23) ** 2 + ((y - 56) / 4) ** 2 <= 1:
                s.set(x, y, WATER['m'] if (x + y) % 7 else WATER['l'])
    # the upper bowl and the spout
    box(s, 61, 26, 6, 26, STONE)
    for x in range(48, 81):
        for y in range(26, 38):
            if ((x - 64) / 15) ** 2 + ((y - 31) / 5) ** 2 <= 1:
                s.set(x, y, STONE['l'] if y < 30 else STONE['m'] if y < 34 else STONE['d'])
            if ((x - 64) / 11) ** 2 + ((y - 29) / 2.5) ** 2 <= 1:
                s.set(x, y, WATER['l'])
    box(s, 62, 14, 4, 13, STONE); box(s, 60, 10, 8, 4, STONE)
    for k in range(3):                                         # water falling from the spout and over the bowls
        s.set(63 - k, 8 - k, WATER['h']); s.set(65 + k, 8 - k, WATER['h'])
    for side in (-1, 1):
        for k in range(16):
            x = 64 + side * (15 + k // 3); y = 31 + k
            s.set(x, y, WATER['h'] if k % 3 else WATER['l'])
        for k in range(26):
            x = 64 + side * (28 + k // 4); y = 58 + k
            s.set(x, y, WATER['h'] if k % 4 else WATER['l'])
    for x, y in ((40, 104), (88, 110), (52, 118), (76, 100)):  # ripples where the water lands
        for dx in range(-3, 4):
            s.set(x + dx, y, WATER['h'] if abs(dx) < 3 else WATER['l'])
    return done(s)


SPRITES = {'fountain': fountain, 'statue': statue, 'ruinwall': ruinwall, 'lantern': lantern, 'lantern_off': lambda: lantern(False), 'forge': forge, 'shrine': shrine, 'fence': lambda: fence(10)}
for _m in range(16):
    SPRITES[f'fence_{_m}'] = (lambda m=_m: fence(m))
