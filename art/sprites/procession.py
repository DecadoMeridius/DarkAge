"""The royal herald's procession (x_kingdom.js): a covered wagon of the crown pulled by a bay horse,
facing left (it rolls in along the farm road from the village). Two frames: legs and wheel spokes
change between them. A second, plainer supply wagon carries crates under a brown cover.
Pixels are laid out run by run, light from the top-left, then the selective outline."""
from px import Canvas, rect, ellipse, poly, line

K = '#2a1c18'
WOOD = ['#3e2614', '#5e3c20', '#7e522e', '#9e6c3c', '#b8844c']
CANVAS = ['#a8987a', '#cfc1a2', '#e8dcc0', '#f6eedc']
BROWN = ['#4a3020', '#6a4630', '#8a6040', '#a8784e']
ROYAL = ['#2a1440', '#4a2470', '#6a3a9a', '#8e5ac0']
GOLD = ['#7a5a1a', '#b8862a', '#e8b830', '#ffe080']
IRON = ['#2e3038', '#4e525e', '#7e8492', '#b8bec8']
HORSE = ['#3a2010', '#5a3418', '#7a4a26', '#9a6438', '#b8804c']
MANE = ['#1a120a', '#2a1a10', '#3e2a1a']


def wheel(s, cx, cy, r, frame):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** .5
            if r - 2 <= d <= r + .3:
                s.set(x, y, IRON[1] if y > cy else IRON[2])
            elif r - 3.2 <= d < r - 2:
                s.set(x, y, WOOD[1] if y > cy else WOOD[2])
    for k in range(4):  # spokes, turned half a step on the second frame
        import math
        a = k * math.pi / 4 + (math.pi / 8 if frame else 0)
        for t in range(1, r - 2):
            s.set(round(cx + math.cos(a) * t), round(cy + math.sin(a) * t), WOOD[2])
            s.set(round(cx - math.cos(a) * t), round(cy - math.sin(a) * t), WOOD[2])
    s.fill(rect(cx - 1, cy - 1, 3, 3), IRON[2]); s.set(cx, cy, IRON[3])


def horse(s, x0, y0, frame):
    """A bay draught horse facing left, head up, in royal harness."""
    s.fill(ellipse(x0 + 22, y0 + 18, 15, 8), HORSE[2])                     # barrel
    s.fill(ellipse(x0 + 20, y0 + 15, 12, 4), HORSE[3])                     # lit back
    s.fill(ellipse(x0 + 22, y0 + 23, 13, 3), HORSE[1])                     # shaded belly
    s.fill(poly([(x0 + 8, y0 + 14), (x0 + 2, y0 + 2), (x0 + 8, y0 + 0), (x0 + 13, y0 + 12)]), HORSE[2])   # neck
    s.fill(poly([(x0 + 4, y0 + 3), (x0 + 9, y0 + 1), (x0 + 11, y0 + 8)]), HORSE[3])
    s.fill(poly([(x0 - 5, y0 + 7), (x0 + 2, y0 - 1), (x0 + 6, y0 + 2), (x0 + 1, y0 + 10), (x0 - 4, y0 + 10)]), HORSE[2])  # head
    s.fill(rect(x0 - 5, y0 + 8, 4, 3), HORSE[1]); s.set(x0 - 5, y0 + 9, K)                     # muzzle, nostril
    s.set(x0 + 1, y0 + 3, K); s.set(x0 + 2, y0 + 3, '#ffffff')                                 # eye
    s.fill(poly([(x0 + 3, y0 - 1), (x0 + 5, y0 - 4), (x0 + 6, y0 + 0)]), HORSE[1])             # ear
    for k in range(9):                                                                         # mane
        s.fill(rect(x0 + 5 + k, y0 + 1 + k, 2, 3), MANE[1 + (k % 2)])
    for i in range(10):                                                                        # tail
        s.set(x0 + 37 + i // 3, y0 + 13 + i, MANE[1]); s.set(x0 + 38 + i // 3, y0 + 13 + i, MANE[2])
    legs = [(x0 + 11, 0), (x0 + 16, 1), (x0 + 28, 1), (x0 + 33, 0)]
    for i, (lx, ph) in enumerate(legs):                                                         # legs swap stride with the frame
        off = (2 if (ph ^ frame) else -2)
        top, bot = y0 + 24, y0 + 36
        s.fill(line(lx, top, lx + off, bot) | line(lx + 1, top, lx + 1 + off, bot) | line(lx + 2, top, lx + 2 + off, bot - 2), HORSE[1] if i % 2 else HORSE[2])
        s.fill(rect(lx + off - 1, bot - 3, 5, 2), '#e8dcc0')                                    # white feathering
        s.fill(rect(lx + off - 1, bot - 1, 5, 2), K)                                            # hoof
    # harness: purple collar with gold studs, a breast strap and the traces back to the wagon
    s.fill(poly([(x0 + 7, y0 + 6), (x0 + 12, y0 + 4), (x0 + 15, y0 + 16), (x0 + 10, y0 + 18)]), ROYAL[2])
    for k in range(3):
        s.set(x0 + 10 + k, y0 + 8 + k * 3, GOLD[3])
    s.fill(rect(x0 + 14, y0 + 17, 26, 2), ROYAL[1]); s.fill(rect(x0 + 14, y0 + 17, 26, 1), ROYAL[2])
    s.fill(rect(x0 + 18, y0 + 10, 3, 14), ROYAL[1])
    s.fill(line(x0 - 3, y0 + 7, x0 + 9, y0 + 8), BROWN[0])                                      # rein


def wagon(frame=0, royal=True):
    s = Canvas(132, 64)
    for y in range(57, 63):                                                                     # contact shadow
        for x in range(8, 128):
            if ((x - 68) / 60) ** 2 + ((y - 59) / 3.2) ** 2 <= 1:
                s.set(x, y, (20, 30, 10, 90))
    bx = 48                                                                                     # the wagon body
    s.fill(rect(bx - 8, 40, 10, 2), WOOD[1])                                                     # shafts to the horse
    # the cover: canvas over hoops
    for y in range(6, 34):
        for x in range(bx + 4, bx + 76):
            u = (x - (bx + 40)) / 36
            top = 6 + int(14 * u * u)
            if y >= top:
                c = CANVAS[3] if y < top + 3 else CANVAS[2] if x < bx + 40 else CANVAS[1]
                if (x - bx) % 18 == 4:
                    c = CANVAS[0]                                                                # hoop seams
                s.set(x, y, c if royal else (BROWN[3] if c == CANVAS[3] else BROWN[2] if c == CANVAS[2] else BROWN[1] if c == CANVAS[1] else BROWN[0]))
    if royal:                                                                                   # a purple band with the gold stag
        s.fill(rect(bx + 6, 22, 68, 6), ROYAL[2]); s.fill(rect(bx + 6, 22, 68, 1), ROYAL[3]); s.fill(rect(bx + 6, 27, 68, 1), ROYAL[1])
        for i, row in enumerate(['y.y.y', '.yyy.', '..y..']):
            for j, ch in enumerate(row):
                if ch == 'y':
                    s.set(bx + 37 + j, 23 + i + (1 if i == 2 else 0), GOLD[3])
        s.fill(rect(bx + 70, 0, 2, 22), WOOD[1])                                                 # banner pole and pennant
        for k in range(10):
            for j in range(6 - k // 2):
                s.set(bx + 72 + k, 1 + j + k // 4, ROYAL[2] if j else ROYAL[3])
    # the bed: planks with iron straps
    for y in range(34, 46):
        for x in range(bx, bx + 80):
            c = WOOD[3] if y == 34 else WOOD[2] if (y - 34) % 4 else WOOD[1]
            s.set(x, y, c)
    for x in (bx + 2, bx + 26, bx + 52, bx + 77):
        s.fill(rect(x, 34, 2, 12), IRON[1]); s.set(x, 35, IRON[3])
    if royal:
        for x in range(bx, bx + 80, 8):                                                          # a scalloped purple skirt
            s.fill(poly([(x, 46), (x + 8, 46), (x + 4, 50)]), ROYAL[2]); s.set(x + 4, 49, GOLD[2])
    else:
        for x in range(bx + 6, bx + 70, 14):                                                     # crates peeking out
            s.fill(rect(x, 28, 10, 6), WOOD[3]); s.fill(rect(x, 28, 10, 1), WOOD[4]); s.fill(rect(x + 4, 28, 1, 6), WOOD[1])
    s.fill(rect(bx - 2, 30, 8, 3), WOOD[2]); s.fill(rect(bx - 2, 30, 8, 1), WOOD[4])              # driver's bench
    wheel(s, bx + 14, 48, 9, frame)
    wheel(s, bx + 64, 48, 10, frame)
    horse(s, 8, 18, frame)
    s.outline()
    return s


SPRITES = {'wagon_royal': lambda: [wagon(0), wagon(1)], 'wagon_supply': lambda: [wagon(0, False), wagon(1, False)]}
