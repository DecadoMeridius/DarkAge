"""Hand-pixelled crafting stations (override props.py / automation.py / automation2.py at the same sizes):
keg, preserves jar, cheese press, loom, oil press, smoker, campfire, kiln, bread oven, smelter and stone furnace.
Lit frames carry meta['light'] for the night lights."""
from px import Canvas
from sprites.props_hand import box, shadow_ellipse, done, WOOD, STONE, IRON, FIRE

CLAY = {'k': '#4a2414', 'd': '#7a3a1e', 'm': '#a8562e', 'l': '#c8784a', 'h': '#e09a6a'}
BRICK = {'k': '#3a1a12', 'd': '#6a2a1a', 'm': '#9a4428', 'l': '#b85e3a', 'h': '#d07a52'}
BRASS = {'d': '#7a5418', 'm': '#c08a2a', 'l': '#f0c050'}
CREAM = '#f0e2c0'


def px(s, pts, c):
    for x, y in pts:
        s.set(x, y, c)


def hline(s, x0, x1, y, c):
    for x in range(x0, x1 + 1):
        s.set(x, y, c)


def vline(s, x, y0, y1, c):
    for y in range(y0, y1 + 1):
        s.set(x, y, c)


def round_body(s, cx, y0, y1, rx, P, bulge=2):
    """A barrel or crock: wider in the middle, light on the left, shaded on the right."""
    import math
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0)
        w = rx - bulge + round(bulge * math.sin(t * math.pi))
        for x in range(cx - w, cx + w + 1):
            c = P['m']
            if x <= cx - w + 1:
                c = P['l']
            elif x >= cx + w - 1:
                c = P['d']
            elif x <= cx - w // 2:
                c = P['h'] if 'h' in P and (y - y0) % 7 == 1 else P['l']
            s.set(x, y, c)


def keg():
    s = Canvas(32, 52)
    shadow_ellipse(s, 16, 49, 12, 2)
    box(s, 5, 42, 4, 7, WOOD); box(s, 23, 42, 4, 7, WOOD); box(s, 4, 40, 24, 3, WOOD)          # the cradle
    round_body(s, 16, 12, 42, 11, WOOD, 3)
    for x in (9, 13, 19, 23):
        vline(s, x, 14, 40, WOOD['d'])                                                       # staves
    for y in (17, 27, 37):
        hline(s, 6, 26, y, IRON['m']); hline(s, 6, 26, y + 1, IRON['d']); s.set(6, y, IRON['l'])  # iron hoops
    for x in range(9, 24):
        s.set(x, 12, WOOD['d'])
    for x in range(10, 23):
        s.set(x, 11, WOOD['l'])                                                              # the head of the barrel
    box(s, 14, 31, 4, 3, BRASS); s.set(16, 34, BRASS['d']); s.set(16, 35, BRASS['m'])          # brass tap
    return done(s)


def jar():
    s = Canvas(32, 52)
    shadow_ellipse(s, 16, 49, 11, 2)
    round_body(s, 16, 18, 47, 10, CLAY, 4)
    for y in range(28, 32):
        for x in range(8, 25):
            if s.get(x, y)[3]:
                s.set(x, y, CREAM if x > 9 else '#c8b48a')                                   # a cream glaze band
    px(s, [(12, 29), (16, 30), (20, 29)], '#5a8ad8')                                          # painted dots
    box(s, 10, 13, 12, 6, CLAY)                                                              # neck
    for x in range(8, 25):
        s.set(x, 12, '#c8b48a'); s.set(x, 11, CREAM)                                         # cloth cover
    px(s, [(8, 13), (9, 14), (24, 13), (23, 14), (8, 14)], CREAM)
    hline(s, 9, 23, 15, '#8a5a30')                                                           # the tie
    px(s, [(23, 16), (24, 17), (22, 17)], '#8a5a30')
    box(s, 14, 8, 4, 3, WOOD)                                                                # wooden knob
    return done(s)


def cheese():
    s = Canvas(32, 52)
    shadow_ellipse(s, 16, 49, 13, 2)
    box(s, 3, 43, 26, 5, WOOD)                                                               # base board
    hline(s, 4, 27, 47, WOOD['k'])
    box(s, 4, 10, 4, 34, WOOD); box(s, 24, 10, 4, 34, WOOD)                                  # posts
    box(s, 2, 8, 28, 5, WOOD)                                                                # crossbeam
    for y in range(4, 32):
        s.set(15, y, IRON['l'] if y % 2 else IRON['d']); s.set(16, y, IRON['m'] if y % 2 else IRON['k'])  # threaded screw
    box(s, 8, 4, 16, 2, WOOD)                                                                # handle bar
    box(s, 9, 31, 14, 3, WOOD)                                                               # press plate
    for y in range(34, 43):                                                                  # the cheese wheel
        for x in range(9, 23):
            s.set(x, y, '#f2c040' if y > 34 else '#ffe080')
        s.set(9, y, '#c8962a'); s.set(22, y, '#c8962a')
    hline(s, 9, 22, 42, '#a8781a'); px(s, [(13, 37), (18, 39)], '#d8a830')
    px(s, [(26, 44), (26, 45)], '#e8f0ff')                                                  # whey dripping
    return done(s)


def loom():
    s = Canvas(32, 52)
    shadow_ellipse(s, 16, 49, 13, 2)
    box(s, 3, 6, 4, 43, WOOD); box(s, 25, 6, 4, 43, WOOD)                                    # uprights
    box(s, 3, 6, 26, 4, WOOD); box(s, 3, 40, 26, 4, WOOD)                                    # beams
    for x in range(8, 25, 2):
        vline(s, x, 10, 24, CREAM)                                                           # warp threads
    for y in range(24, 40):                                                                  # woven cloth
        for x in range(7, 25):
            s.set(x, y, '#c8342a' if (x + y) % 2 else '#a82a22')
    for y in (28, 33, 37):
        hline(s, 7, 24, y, '#f0c040')                                                        # a pattern woven in
    box(s, 6, 22, 20, 2, WOOD)                                                               # the heddle bar
    box(s, 12, 18, 8, 2, {'k': '#3a2a1a', 'd': '#6a4426', 'm': '#a8743f', 'l': '#d09a60', 'h': '#e8c08a'})  # shuttle
    box(s, 6, 44, 4, 5, WOOD); box(s, 22, 44, 4, 5, WOOD)
    return done(s)


def oilpress():
    s = Canvas(32, 52)
    shadow_ellipse(s, 16, 49, 13, 2)
    box(s, 4, 32, 22, 15, STONE)                                                             # stone basin
    for x in range(6, 24):
        s.set(x, 33, '#8a6a20')                                                              # crushed olives inside
    hline(s, 6, 23, 34, '#c8a040')
    box(s, 13, 18, 4, 15, WOOD)                                                              # post
    box(s, 1, 14, 30, 4, WOOD)                                                               # lever beam
    box(s, 26, 18, 5, 8, STONE)                                                              # hanging stone weight
    vline(s, 28, 17, 18, '#8a5a30')
    box(s, 25, 40, 4, 2, STONE)                                                              # spout
    px(s, [(28, 42), (28, 43)], '#e8c040')                                                   # a drip of oil
    box(s, 25, 44, 6, 5, {'k': '#2a2a30', 'd': '#5a6a70', 'm': '#8ab0b8', 'l': '#c8e0e8', 'h': '#ffffff'})  # a glass jar
    hline(s, 26, 29, 46, '#e8c040'); hline(s, 26, 29, 47, '#c8a020')
    return done(s)


def smoker():
    s = Canvas(32, 52)
    shadow_ellipse(s, 16, 49, 13, 2)
    box(s, 5, 24, 22, 24, WOOD)                                                              # plank walls
    for x in range(9, 26, 4):
        vline(s, x, 25, 46, WOOD['d'])
    box(s, 11, 32, 10, 14, {'k': '#100808', 'd': '#1e1410', 'm': '#2a1c14', 'l': '#3a2a1e', 'h': '#4a3626'})  # dark doorway
    for x, c in ((13, '#d8a050'), (16, '#c88a40'), (19, '#e0b060')):                         # fish hanging in the smoke
        vline(s, x, 33, 35, '#8a6a4a'); vline(s, x, 36, 40, c); s.set(x, 41, '#a86a30')
    for y in range(12, 25):                                                                  # shingled roof
        w = (y - 12) + 6
        for x in range(16 - w, 16 + w):
            if 0 <= x < 32:
                s.set(x, y, '#5a3a22' if (x + (y // 2) * 2) % 4 == 0 else '#7a4e2c' if y % 2 else '#8a5a32')
    box(s, 20, 6, 5, 10, STONE)                                                              # chimney
    px(s, [(22, 4), (23, 3), (21, 2), (22, 1)], (200, 200, 200, 150))                         # smoke
    return done(s)


def campfire(f):
    s = Canvas(32, 36)
    shadow_ellipse(s, 16, 31, 12, 2)
    for i, (x, y) in enumerate(((5, 28), (9, 31), (15, 32), (21, 31), (25, 28), (11, 26), (20, 26))):  # ring of stones
        box(s, x, y, 4, 3, STONE)
    for k in range(12):                                                                      # crossed logs
        s.set(8 + k, 25 + k // 3, WOOD['m']); s.set(8 + k, 26 + k // 3, WOOD['d'])
        s.set(23 - k, 25 + k // 3, WOOD['l']); s.set(23 - k, 26 + k // 3, WOOD['d'])
    tongues = [[(12, 14), (16, 8), (20, 13)], [(11, 15), (15, 10), (17, 6), (21, 14)], [(12, 12), (16, 9), (19, 7), (21, 15)]][f]
    for y in range(6, 26):                                                                   # the flame body
        for x in range(9, 24):
            d = abs(x - 16)
            top = min(ty + abs(x - tx) * 2 for tx, ty in tongues)
            if y >= top and d < 7 - (25 - y) // 5:
                s.set(x, y, FIRE['y'] if d < 2 and y > top + 4 else FIRE['o'] if d < 4 else FIRE['r'])
    for x, y in ((14, 19), (17, 17), (15, 22)):
        s.set(x, y, FIRE['w'])
    px(s, [(10 + f * 4, 4 - f), (20 - f * 3, 2 + f)], FIRE['y'])                             # sparks
    s.meta = {'light': [16, 22]}
    return done(s)


def kiln(lit):
    s = Canvas(36, 46)
    shadow_ellipse(s, 18, 43, 15, 2)
    import math
    for y in range(8, 42):                                                                   # a brick beehive dome
        t = (y - 8) / 34
        w = round(15 * math.sin(min(1, t * 1.25) * math.pi / 2)) + 1
        for x in range(18 - w, 18 + w):
            row = (y - 8) // 3
            seam = (y - 8) % 3 == 2 or (x + row * 2) % 6 == 0
            c = BRICK['k'] if seam else BRICK['l'] if x < 18 - w + 3 else BRICK['d'] if x > 18 + w - 4 else BRICK['m']
            s.set(x, y, c)
    for y in range(28, 42):                                                                  # arched mouth
        for x in range(13, 23):
            if y > 30 or abs(x - 17.5) < 3:
                s.set(x, y, (FIRE['o'] if (x + y) % 3 else FIRE['y']) if lit and y > 33 else '#1a0e0a')
    box(s, 15, 3, 6, 6, BRICK)                                                               # vent
    if lit:
        px(s, [(17, 1), (18, 0), (19, 2)], (180, 180, 180, 160))
        s.meta = {'light': [18, 36]}
    return done(s)


def oven(lit):
    s = Canvas(36, 48)
    shadow_ellipse(s, 18, 45, 15, 2)
    box(s, 3, 30, 30, 15, BRICK)                                                             # brick base
    for y in range(33, 45, 3):
        for x in range(4 + (y // 3) % 2 * 3, 33, 6):
            s.set(x, y, BRICK['k'])
    import math
    for y in range(10, 31):                                                                  # clay dome
        t = (y - 10) / 20
        w = round(14 * math.sin(min(1, t * 1.3) * math.pi / 2)) + 1
        for x in range(18 - w, 18 + w):
            s.set(x, y, CLAY['l'] if x < 18 - w + 3 else CLAY['d'] if x > 18 + w - 4 else CLAY['m'])
    for y in range(20, 31):                                                                  # arched opening
        for x in range(12, 24):
            if y > 22 or abs(x - 17.5) < 4:
                s.set(x, y, (FIRE['o'] if (x * 2 + y) % 3 else FIRE['y']) if lit and y > 25 else '#1a0e0a')
    box(s, 25, 4, 5, 10, STONE)                                                              # chimney
    box(s, 8, 29, 20, 2, WOOD)                                                               # bread board
    if lit:
        px(s, [(27, 2), (28, 1), (26, 0)], (190, 190, 190, 150)); s.meta = {'light': [18, 26]}
    return done(s)


def smelter(lit):
    s = Canvas(40, 60)
    shadow_ellipse(s, 20, 57, 17, 2)
    box(s, 6, 22, 28, 34, STONE)                                                             # furnace body
    for y in range(26, 54, 5):
        for x in range(7 + (y // 5) % 2 * 4, 34, 8):
            s.set(x, y, STONE['d'])
    box(s, 13, 2, 14, 21, STONE)                                                             # stack
    for y in (8, 15):
        hline(s, 13, 26, y, IRON['m'])
    for y in range(38, 52):                                                                  # the fire box
        for x in range(13, 27):
            s.set(x, y, (FIRE['o'] if (x + y) % 3 else FIRE['y']) if lit and y > 43 else '#1a0e0a')
    box(s, 12, 36, 16, 3, IRON)
    box(s, 34, 30, 4, 3, IRON); box(s, 35, 33, 3, 6, IRON)                                   # the pour spout
    if lit:
        px(s, [(36, 39), (36, 40), (36, 41)], FIRE['y'])
    box(s, 0, 40, 7, 8, WOOD); px(s, [(2, 39), (3, 38), (4, 37)], WOOD['d'])                 # bellows
    for y in range(41, 47, 2):
        hline(s, 1, 5, y, WOOD['k'])
    if lit:
        px(s, [(19, 0), (20, 1), (21, 0)], (180, 180, 180, 160)); s.meta = {'light': [20, 46]}
    return done(s)


def stonefurnace(lit):
    s = Canvas(40, 52)
    shadow_ellipse(s, 20, 49, 16, 2)
    box(s, 5, 18, 30, 30, STONE)
    for y in range(22, 46, 5):
        for x in range(6 + (y // 5) % 2 * 4, 35, 8):
            s.set(x, y, STONE['d'])
    for y in range(14, 19):                                                                  # rounded top
        w = 14 - (18 - y) * 2
        for x in range(20 - w, 20 + w):
            s.set(x, y, STONE['h'] if y == 14 else STONE['l'] if x < 20 - w + 2 else STONE['m'])
    box(s, 16, 4, 8, 11, STONE)                                                              # flue
    for y in range(32, 46):
        for x in range(13, 27):
            if y > 34 or abs(x - 19.5) < 4:
                s.set(x, y, (FIRE['o'] if (x + y) % 3 else FIRE['y']) if lit and y > 38 else '#1a0e0a')
    hline(s, 12, 27, 46, IRON['m'])
    if lit:
        px(s, [(19, 2), (20, 1), (21, 3)], (180, 180, 180, 160)); s.meta = {'light': [20, 40]}
    return done(s)


SPRITES = {'keg': keg, 'jar': jar, 'cheese': cheese, 'loom': loom, 'oilpress': oilpress, 'smoker': smoker,
           'campfire': lambda: [campfire(i) for i in range(3)], 'kiln': lambda: [kiln(0), kiln(1)], 'oven': lambda: [oven(0), oven(1)],
           'smelter': lambda: [smelter(0), smelter(1)], 'stonefurnace': lambda: [stonefurnace(0), stonefurnace(1)]}
