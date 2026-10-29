"""Style test: a small village corner at 32px-tile scale.

Grass + dirt path ground, an oak, a rock, a fence, a cottage and the player.
Writes art/out/style_test.png (1x) and style_test@4x.png.
"""
import os
from px import Canvas, rect, ellipse, poly, line, shadow, fbm, vnoise, rng, ramp, hx

OUT = os.path.join(os.path.dirname(__file__), 'out')
W, H = 320, 224

GRASS = ['#6f9a2e', '#86ab36', '#97b83e', '#a9c44c']
TUFT_D, TUFT_L = '#5c8526', '#bcd25e'
LEAF = ['#2f5a24', '#4a7a2a', '#6a9a30', '#8cb43a', '#b4cc4c', '#d6dc6a']
SKIN = ['#c47e5a', '#e8ae84', '#f6cca2', '#fde2c0']
DIRT, DIRT_D, DIRT_L, DIRT_EDGE = '#d6b47a', '#c29c62', '#e4c994', '#b48a55'
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


# ---- ground --------------------------------------------------------------
def path_mask():
    m = set()
    for y in range(H):
        cx = 168 + 10 * vnoise(y * .03, 0, 5) - 5
        half = 11 + 3 * fbm(y * .08, 1, 6)
        for x in range(W):
            j = round(2 * vnoise(x * .4, y * .4, 7))
            if y > 150 and abs(x - cx) < half + j:
                m.add((x, y))
    # yard in front of the cottage door
    for x, y in ellipse(168, 150, 34, 14):
        if vnoise(x * .35, y * .35, 8) > .25:
            m.add((x, y))
    return m


def ground(cv):
    dirt = path_mask()
    r = rng(1)
    for y in range(H):
        for x in range(W):
            if (x, y) in dirt:
                n = vnoise(x * .5, y * .5, 11)
                c = DIRT_L if n > .8 else DIRT_D if n < .18 else DIRT
                if (x, y - 1) not in dirt or (x, y - 2) not in dirt and (x + y) % 2:
                    c = DIRT_EDGE  # lip shadow under the grass edge
                cv.set(x, y, c)
            else:
                n = fbm(x * .045, y * .045, 3) * 3.2 + (BAYER[y % 4][x % 4] / 16 - .5) * .55
                i = max(0, min(3, int(n)))
                if any(p in dirt for p in ((x, y + 1), (x + 1, y), (x - 1, y))):
                    i = 3  # lit grass rim over the path
                cv.set(x, y, GRASS[i])
    # tufts and flowers
    for _ in range(170):
        x, y = r.randrange(2, W - 2), r.randrange(2, H - 2)
        if (x, y) in dirt or (x, y + 2) in dirt:
            continue
        for p in ((x - 1, y), (x + 1, y), (x, y + 1), (x - 2, y - 1), (x + 2, y - 1)):
            cv.set(*p, TUFT_D)
        cv.set(x - 1, y - 1, TUFT_L)
    for _ in range(28):
        x, y = r.randrange(2, W - 2), r.randrange(2, H - 2)
        if (x, y) in dirt:
            continue
        col = r.choice(['#fff6dc', '#fff6dc', '#f2d24a'])
        for p in ((x, y - 1), (x - 1, y), (x + 1, y), (x, y + 1)):
            cv.set(*p, col)
        cv.set(x, y, '#e8a83a')
        cv.set(x, y + 2, TUFT_D)
    for _ in range(40):  # pebbles on the path
        x, y = r.randrange(W), r.randrange(H)
        if (x, y) in dirt and (x + 1, y) in dirt:
            cv.set(x, y, '#a89a86'); cv.set(x + 1, y, '#cfc4b0'); cv.set(x, y + 1, DIRT_EDGE)
    return dirt


# ---- sprites -------------------------------------------------------------
def oak(seed=0):
    s = Canvas(56, 66)
    r = rng(seed)
    trunk = poly([(24, 36), (32, 36), (33, 56), (37, 62), (19, 62), (23, 56)])
    s.shade(trunk, '#8a5c38', 'cyl', 5)
    for y in range(40, 60, 3):  # bark grain
        s.set(26 + r.randrange(4), y, '#5e3c26')
    clusters = [(28, 14, 13, 11), (15, 22, 11, 10), (41, 22, 11, 10), (20, 33, 12, 9), (37, 33, 12, 9), (28, 28, 13, 10), (28, 9, 9, 7)]
    for cx, cy, rx, ry in clusters:
        m = {p for p in ellipse(cx, cy, rx, ry) if vnoise(p[0] * .5, p[1] * .5, seed + cx) > .12 or ((p[0] + .5 - cx) / rx) ** 2 + ((p[1] + .5 - cy) / ry) ** 2 < .7}
        s.shade(m, None, 'form', colors=LEAF)
    lit = LEAF[-1]
    for _ in range(60):  # leaf sparkle on the lit side
        x, y = r.randrange(6, 50), r.randrange(2, 40)
        c = s.get(x, y)
        if c[3] and sum(c[:3]) > 480 and x + y < 62:
            s.set(x, y, lit)
    s.outline()
    return s


def rock():
    s = Canvas(24, 18)
    m = poly([(3, 15), (2, 9), (6, 4), (13, 2), (19, 5), (22, 11), (20, 16)])
    s.shade(m, '#9c968a', 'form', 5, 8)
    for p in line(10, 6, 13, 10) | line(13, 10, 12, 13):
        s.set(*p, '#6a6460')
    s.fill({(x, y) for x, y in m if y < 6 and x < 14 and (x * 3 + y) % 4}, '#86a63a')
    s.outline()
    return s


def fence(n=3):
    s = Canvas(32 * n + 6, 22)
    for k in range(n + 1):
        x = 32 * k
        s.shade(rect(x + 1, 2, 4, 18), '#c49a62', 'cyl', 5)
        s.set(x + 2, 2, '#e8c890'); s.set(x + 3, 2, '#e8c890')
    for y in (6, 12):
        s.shade(rect(3, y, 32 * n, 3), '#b88c56', 'cyl_side', 4)
    s.outline()
    return s


def player():
    s = Canvas(22, 34)
    skin, hair, tunic, pants, boot = '#f2c49a', '#7a4426', '#4a7cc0', '#5a4e70', '#5a3a22'
    for sx in (7, 12):  # legs + boots
        s.shade(rect(sx, 22, 4, 7), pants, 'cyl', 4)
        s.shade(rect(sx - (1 if sx == 7 else 0), 28, 5, 4), boot, 'form', 4)
    s.shade(poly([(5, 13), (17, 13), (18, 24), (4, 24)]), tunic, 'form', 5)
    s.fill(rect(5, 21, 12, 2), '#6a4428'); s.set(10, 21, '#f2c040'); s.set(11, 21, '#f2c040')
    for ax in (2, 17):  # arms
        s.shade(rect(ax, 14, 3, 8), tunic, 'cyl', 4)
        s.shade(rect(ax, 22, 3, 2), skin, 'form', 3)
    s.shade(ellipse(11, 8, 6.5, 6.5), None, 'sphere', colors=SKIN)
    s.shade({p for p in ellipse(11, 5.5, 7.5, 5.5) if p[1] < 6 or (p[0] < 6 and p[1] < 10) or (p[0] > 16 and p[1] < 10) or (p[1] == 6 and p[0] % 3)}, hair, 'form', 5)
    for ex in (8, 13):
        s.set(ex, 9, '#2b1d18'); s.set(ex, 10, '#2b1d18'); s.set(ex, 8, '#fff6e8')
    s.set(6, 11, '#f4a890'); s.set(16, 11, '#f4a890')
    s.set(10, 13, '#c47e5a'); s.set(11, 13, '#c47e5a')
    s.outline()
    return s


def cottage():
    s = Canvas(80, 92)
    r = rng(4)
    # front wall: stone courses
    wall = rect(8, 58, 64, 30)
    for y in range(58, 88):
        row = (y - 58) // 5
        for x in range(8, 72):
            joint = (y - 58) % 5 == 4 or (x + row * 4) % 9 == 0
            t = vnoise((x + row * 4) // 9, row, 9)
            base = '#a29c92' if t > .66 else '#8e887e' if t > .33 else '#9a9488'
            s.set(x, y, '#5e5a56' if joint else base)
            if not joint and (y - 58) % 5 == 0:
                s.set(x, y, '#bdb8ae')
    # gable: vertical planks
    gable = poly([(40, 30), (72, 58), (8, 58)])
    for x, y in gable:
        s.set(x, y, '#5e3c24' if x % 4 == 0 else '#b8864e' if x % 4 == 1 else '#a87642')
    s.fill(rect(8, 56, 64, 3), '#6a4428'); s.fill(rect(8, 56, 64, 1), '#9a6a3e')
    # roof: two slopes of staggered slate tiles, left lit, right shaded
    for side, verts, tint in ((0, [(40, 2), (40, 30), (3, 62), (3, 16)], 1.0), (1, [(40, 2), (40, 30), (77, 62), (77, 16)], .78)):
        m = poly(verts)
        for x, y in m:
            row = (y - (x * .45 if side == 0 else (80 - x) * .45)) // 6
            col = (x + int(row) * 4) // 8
            v = vnoise(col * 1.3, row * 1.3, 21)
            g = (96 + int(v * 34)) * tint
            c = (int(g), int(g * 1.0), int(g * 1.08))
            ry = (y - (x * .45 if side == 0 else (80 - x) * .45)) % 6
            if ry < 1 or (x + int(row) * 4) % 8 == 0:
                c = (52, 50, 56)
            elif ry < 2:
                c = tuple(min(255, int(k * 1.18)) for k in c)
            if r.random() < .04:
                c = (150, 112, 70)  # rust / moss fleck
            s.set(x, y, c)
    for y in range(2, 31):  # ridge cap
        s.set(39, y, '#5a5660'); s.set(40, y, '#8c8892'); s.set(41, y, '#4a4650')
    for p in line(40, 30, 3, 62) | line(40, 30, 77, 62):  # barge boards
        s.set(*p, '#8a5a34'); s.set(p[0], p[1] + 1, '#5e3c24')
    # chimney on the lit slope
    s.shade(rect(16, 6, 9, 16), '#9a9488', 'cyl', 4)
    s.fill(rect(15, 4, 11, 3), '#6e6a66'); s.fill(rect(17, 4, 7, 1), '#3a3634')
    # door + windows
    door = rect(34, 70, 12, 18)
    for x, y in door:
        s.set(x, y, '#5e3c24' if x % 3 == 1 else '#9a6838')
    s.fill(rect(33, 69, 14, 1), '#5e3c24'); s.set(43, 79, '#f2c040')
    for wx, wy in ((15, 66), (55, 66), (37, 42)):
        s.fill(rect(wx - 1, wy - 1, 10, 10), '#5e3c24')
        for x, y in rect(wx, wy, 8, 8):
            s.set(x, y, '#9cc8d8' if (x - wx) + (y - wy) < 6 else '#6a98b0')
        s.fill(rect(wx + 3, wy, 2, 8), '#5e3c24'); s.fill(rect(wx, wy + 3, 8, 2), '#5e3c24')
    s.fill(rect(13, 76, 12, 3), '#7a5434')  # flower box
    for x in range(14, 24, 2):
        s.set(x, 75, r.choice(['#f2d24a', '#fff6dc', '#e86a4a'])); s.set(x + 1, 75, '#5c8526')
    s.outline()
    return s


# ---- compose -------------------------------------------------------------
def main():
    cv = Canvas(W, H)
    ground(cv)
    house, tree, stone, fen, hero = cottage(), oak(1), rock(), fence(3), player()
    things = [  # (sprite, x, y, shadow (cx, cy, rx, ry))
        (house, 128, 50, (176, 140, 40, 8)),
        (tree, 40, 30, (72, 94, 20, 6)),
        (oak(2), 236, 70, (268, 134, 20, 6)),
        (oak(3), 10, 130, (42, 194, 20, 6)),
        (stone, 96, 168, (110, 184, 11, 3)),
        (stone, 290, 190, (304, 206, 11, 3)),
        (fen, 214, 176, None),
        (fen, 20, 92, None),
        (hero, 158, 160, (169, 193, 8, 2)),
    ]
    for _, _, _, sh in things:
        if sh:
            shadow(cv, *sh)
    for spr, x, y, _ in sorted(things, key=lambda t: t[2] + t[0].h):
        cv.paste(spr, x, y)
    cv.save(os.path.join(OUT, 'style_test.png'))
    cv.save(os.path.join(OUT, 'style_test@4x.png'), 4)
    for name, spr in (('cottage', house), ('oak', tree), ('rock', stone), ('fence', fen), ('player', hero)):
        spr.save(os.path.join(OUT, f'{name}@6x.png'), 6)


if __name__ == '__main__':
    main()
