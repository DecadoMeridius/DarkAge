"""Farm animals and enemies as palette-swap templates, side view facing right, 2 frames.

Channel codes RGB(255, ch, level): animals ch 0 = coat, ch 1 = accent colour (the
coat's second colour); enemies ch 0 = body colour, ch 1 = a darker secondary.
Eyes are drawn in #2b1d18 so the game can swap in an enemy's eye colour.
Sizes are the painted sizes x2. animalSpr / enemySpr in h_pixel.js recolour them.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng

EYE = '#2b1d18'
HOOF = ['#2a1a14', '#3a2a20', '#5a4232']
BEAK = ['#a8601a', '#e0902a', '#f2b840', '#ffd870']
PINK = ['#a8505a', '#d87a84', '#f0a0a8', '#ffc8cc']


def C(ch):
    return [(255, ch, k, 255) for k in range(4)]


def fin(s):
    s.outline()
    return s


def eye(s, x, y, big=False):
    s.fill({(x, y), (x, y + 1)} | ({(x + 1, y), (x + 1, y + 1)} if big else set()), EYE)
    s.set(x, y, '#ffffff')


def legs(s, xs, top, bot, f, ch=0, pal=None, w=3):
    for i, x in enumerate(xs):
        off = (1 if (i + f) % 2 else -1) * (2 if f else 0)
        s.shade(rect(x + off, top, w, bot - top), None, 'cyl', colors=pal or C(ch)[:3])
        s.fill(rect(x + off, bot - 2, w, 2), HOOF[1])


# ---- animals -------------------------------------------------------------
def chicken(f):
    s = Canvas(36, 36)
    s.fill(line(15, 28, 15 - f, 34) | line(20, 28, 20 + f, 34), BEAK[1])
    s.shade(ellipse(17, 21, 11, 8), None, 'form', colors=C(0))
    s.shade(poly([(5, 14), (9, 22), (5, 22)]), None, 'form', colors=C(1))  # tail
    s.shade(ellipse(26, 12, 6, 6), None, 'sphere', colors=C(0))
    s.shade(ellipse(16, 20, 6, 4), None, 'form', colors=C(1))  # wing
    s.fill(poly([(31, 11), (36, 13), (31, 15)]), BEAK[2])
    s.fill(ellipse(26, 5, 3, 2), '#d8342a'); s.fill({(28, 16), (28, 17)}, '#d8342a')
    eye(s, 28, 10)
    return fin(s)


def duck(f):
    s = Canvas(38, 36)
    s.fill(line(15, 28, 15 - f, 34) | line(21, 28, 21 + f, 34), BEAK[1])
    s.shade(ellipse(18, 22, 13, 8), None, 'form', colors=C(0))
    s.shade(ellipse(28, 12, 6, 6), None, 'sphere', colors=C(1))
    s.fill(rect(25, 17, 4, 3), C(0)[2])
    s.fill(poly([(33, 12), (38, 13), (38, 15), (33, 15)]), BEAK[2])
    s.shade(ellipse(16, 21, 7, 4), None, 'form', colors=C(0))
    eye(s, 29, 10)
    return fin(s)


def rabbit(f):
    s = Canvas(38, 32)
    s.shade(ellipse(16, 21 - f, 12, 8), None, 'form', colors=C(0))
    s.shade(ellipse(4, 18 - f, 3, 3), None, 'sphere', colors=['#c8c0b8', '#f0ece6', '#ffffff'])
    s.shade(ellipse(28, 16 - f, 6, 5.5), None, 'sphere', colors=C(0))
    for x in (25, 29):
        s.shade(rect(x, 2 - f, 3, 11), None, 'cyl', colors=C(0)[1:]); s.fill(rect(x + 1, 4 - f, 1, 7), PINK[2])
    s.fill(ellipse(10, 28, 5, 2) | ellipse(24, 28, 3, 2), C(1)[2])
    s.set(34, 17 - f, PINK[1]); eye(s, 30, 14 - f)
    return fin(s)


def quad(W, H, body, head, legx, legtop, f, ears=None, tail=None, extra=None):
    s = Canvas(W, H)
    legs(s, legx, legtop, H - 1, f)
    if tail:
        tail(s)
    s.shade(ellipse(*body), None, 'form', colors=C(0))
    s.shade(ellipse(*head), None, 'sphere', colors=C(0))
    if ears:
        ears(s)
    if extra:
        extra(s)
    return s


def goat(f):
    def ext(s):
        s.fill(line(42, 6, 38, 1) | line(44, 6, 41, 0), '#8a7a6a')  # horns
        s.fill(poly([(46, 22), (49, 22), (47, 28)]), C(0)[1])  # beard
        s.shade(ellipse(22, 22, 10, 6), None, 'form', colors=C(1))  # patch
        eye(s, 45, 12); s.set(51, 16, EYE)
    s = quad(54, 44, (24, 22, 17, 10), (44, 14, 7, 7), (12, 16, 30, 34), 28, f,
             ears=lambda s: s.fill(poly([(38, 10), (33, 13), (38, 14)]), C(0)[1]), tail=lambda s: s.fill(rect(6, 12, 4, 4), C(0)[2]), extra=ext)
    return fin(s)


def sheep(f):
    s = Canvas(54, 44)
    legs(s, (14, 18, 30, 34), 30, 43, f, pal=C(1)[:3])
    r = rng(4)
    s.shade(ellipse(24, 22, 18, 12), None, 'form', colors=C(0))
    for _ in range(18):  # wool curls
        x, y = r.randrange(9, 40), r.randrange(12, 32)
        if s.get(x, y)[3]:
            s.fill(ellipse(x, y, 2, 1.5), C(0)[3]); s.set(x + 1, y + 1, C(0)[1])
    s.shade(ellipse(43, 18, 6, 6), None, 'sphere', colors=C(1))
    s.fill(poly([(38, 15), (33, 18), (38, 19)]), C(1)[1])
    s.shade(ellipse(41, 12, 5, 3), None, 'sphere', colors=C(0))
    eye(s, 45, 17)
    return fin(s)


def cow(f):
    def ext(s):
        s.shade(ellipse(20, 20, 8, 6), None, 'form', colors=C(1)); s.shade(ellipse(34, 26, 6, 4), None, 'form', colors=C(1))
        s.shade(ellipse(55, 22, 5, 4), None, 'sphere', colors=PINK)  # muzzle
        s.fill(line(48, 8, 46, 4) | line(54, 8, 56, 4), '#e8dcc0')
        s.fill(poly([(25, 36), (29, 36), (27, 39)]), PINK[2])  # udder
        eye(s, 51, 15)
    s = quad(62, 48, (28, 24, 21, 12), (51, 18, 8, 8), (12, 18, 38, 44), 32, f,
             ears=lambda s: s.fill(poly([(45, 12), (39, 13), (44, 16)]), C(0)[1]), tail=lambda s: s.fill(line(7, 18, 4, 34) | rect(3, 34, 3, 3), C(0)[1]), extra=ext)
    return fin(s)


def pig(f):
    def ext(s):
        s.shade(ellipse(47, 22, 4, 4), None, 'sphere', colors=C(1)); s.fill({(46, 21), (48, 21)}, '#5a2a2a')
        s.shade(ellipse(22, 16, 7, 4), None, 'form', colors=C(1))
        eye(s, 42, 16)
    s = quad(54, 40, (24, 22, 18, 11), (40, 20, 8, 8), (14, 18, 30, 34), 30, f,
             ears=lambda s: s.fill(poly([(36, 12), (40, 7), (42, 13)]), C(0)[1]), tail=lambda s: s.fill({(6, 18), (5, 17), (4, 18), (5, 19)}, C(0)[1]), extra=ext)
    return fin(s)


def horse(f):
    s = Canvas(70, 60)
    legs(s, (16, 22, 46, 52), 36, 59, f, w=4)
    s.fill(line(9, 22, 4, 42) | line(10, 22, 6, 44) | line(11, 22, 8, 44), C(1)[1])  # tail
    s.shade(ellipse(32, 30, 24, 11), None, 'form', colors=C(0))
    s.shade(poly([(46, 26), (52, 8), (60, 8), (56, 30)]), None, 'form', colors=C(0))  # neck
    s.shade(poly([(52, 6), (66, 12), (68, 18), (62, 20), (54, 14)]), None, 'form', colors=C(0))  # head
    s.fill(poly([(50, 4), (56, 2), (50, 24), (46, 26)]), C(1)[1]); s.fill(line(51, 4, 47, 24), C(1)[2])  # mane
    s.fill(poly([(54, 4), (56, 0), (57, 6)]), C(0)[1])
    s.fill(rect(16, 56, 4, 3) | rect(52, 56, 4, 3), HOOF[0])
    eye(s, 59, 10)
    return fin(s)


# ---- enemies ---------------------------------------------------------------
def slime(f):
    s = Canvas(36, 36)
    top, wide = (12, 16) if f else (7, 13.6)
    m = {(x, y) for x in range(36) for y in range(36) if y <= 31 and ((x + .5 - 18) / wide) ** 2 + ((y - 31) / (31 - top)) ** 2 <= 1}
    s.shade(m, None, 'form', colors=C(0))
    s.fill({(11, top + 6), (12, top + 5), (13, top + 6)}, '#ffffff')
    for x in (14, 21):
        s.fill(rect(x, 22, 2, 4), EYE); s.set(x, 22, '#ffffff')
    return fin(s)


def bat(f):
    s = Canvas(40, 32)
    for d in (-1, 1):
        tip = 20 + d * 19
        wing = poly([(20, 14), (tip, 4 if f else 16), (20 + d * 13, 18 if f else 24), (20 + d * 7, 14 if f else 20)])
        s.shade(wing, None, 'form', colors=C(1))
    s.shade(ellipse(20, 16, 6, 7), None, 'sphere', colors=C(0))
    s.fill(poly([(15, 10), (16, 4), (18, 10)]) | poly([(22, 10), (24, 4), (25, 10)]), C(0)[1])
    s.fill({(17, 14), (23, 14)}, '#ff3a2a'); s.fill({(19, 20), (21, 20)}, '#ffffff')
    return fin(s)


def wolf(f, boar=False):
    s = Canvas(54, 40)
    legs(s, (12, 16, 32, 36), 26, 39, f)
    if not boar:
        s.shade(poly([(8, 14), (2, 8), (4, 20), (12, 20)]), None, 'form', colors=C(1))  # tail
    s.shade(ellipse(24, 20, 16, 9), None, 'form', colors=C(0))
    s.shade(ellipse(22, 14, 12, 5), None, 'form', colors=C(1))  # mane / back
    s.shade(poly([(36, 10), (50, 16), (52, 22), (40, 24)]), None, 'form', colors=C(0))  # head + snout
    s.fill(poly([(38, 10), (40, 2), (44, 10)]), C(1)[1])
    if boar:
        s.fill({(50, 24), (51, 23), (52, 22), (49, 25)}, '#f0e8d0')
        s.fill(line(16, 10, 32, 10), C(1)[0])
    s.set(51, 19, EYE); eye(s, 43, 14)
    s.fill(line(44, 23, 49, 22), '#ffffff')
    return fin(s)


def crab(f):
    s = Canvas(48, 32)
    for i in range(3):
        for d in (-1, 1):
            s.fill(line(24 + d * 8, 20, 24 + d * (14 + i * 2), 22 + ((i + f) % 2) * 2) | line(24 + d * (14 + i * 2), 22 + ((i + f) % 2) * 2, 24 + d * (16 + i * 2), 30), C(1)[1])
    s.shade(ellipse(24, 18, 13, 8), None, 'form', colors=C(0))
    for d in (-1, 1):
        s.shade(ellipse(24 + d * 17, 8 - f, 6, 4), None, 'sphere', colors=C(0))
        s.fill(line(24 + d * 9, 14, 24 + d * 14, 10), C(0)[1])
    for x in (20, 27):
        s.fill(line(x, 12, x, 7), C(1)[1]); s.fill(rect(x - 1, 5, 2, 2), EYE)
    return fin(s)


def bird(f):
    s = Canvas(40, 32)
    s.shade(ellipse(20, 18, 9, 6), None, 'form', colors=C(0))
    s.shade(poly([(12, 16), (2, 14), (4, 20)]), None, 'form', colors=C(1))
    s.shade(ellipse(28, 12, 5, 5), None, 'sphere', colors=C(0))
    s.fill(poly([(32, 11), (38, 13), (32, 15)]), BEAK[2])
    s.shade(poly([(16, 14), (22, 2 if f else 22), (26, 14)]), None, 'form', colors=C(1))
    eye(s, 29, 10)
    return fin(s)


def ghost(f):
    s = Canvas(36, 48)
    m = {(x, y) for x in range(4, 32) for y in range(4, 44) if (y > 18 or ((x + .5 - 18) / 13) ** 2 + ((y - 18) / 14) ** 2 <= 1) and (y < 38 or (x // 7 + f) % 2 == 0 or y < 41)}
    s.shade(m, None, 'form', colors=C(0))
    for x in (12, 21):
        s.fill(rect(x, 16, 3, 5), EYE)
    s.fill(ellipse(18, 28, 3, 2), C(1)[0])
    return fin(s)


def yeti(f):
    s = Canvas(56, 60)
    for x, d in ((9, 1), (47, -1)):
        s.shade(ellipse(x, 34 + f * d, 6, 11), None, 'form', colors=C(0))
    for x in (19, 33):
        s.shade(ellipse(x, 54, 7, 5), None, 'form', colors=C(1))
    s.shade(ellipse(28, 32, 18, 20), None, 'form', colors=C(0))
    s.shade(ellipse(28, 34, 10, 12), None, 'form', colors=C(1))
    s.shade(ellipse(28, 14, 10, 9), None, 'sphere', colors=C(0))
    s.fill(ellipse(28, 16, 6, 4), C(1)[1])
    for x in (24, 31):
        s.fill(rect(x, 13, 2, 2), EYE)
    s.fill(rect(24, 18, 8, 2), '#ffffff')
    return fin(s)


def golem(f):
    s = Canvas(56, 60)
    for x, d in ((8, 1), (48, -1)):
        s.shade(rect(x - 6, 26 + f * d, 12, 20), None, 'form', colors=C(0))
    for x in (16, 32):
        s.shade(rect(x, 46, 9, 13), None, 'form', colors=C(1))
    s.shade(poly([(12, 22), (44, 22), (46, 48), (10, 48)]), None, 'form', colors=C(0))
    s.shade(rect(18, 6, 20, 16), None, 'form', colors=C(0))
    s.fill(line(20, 30, 26, 38) | line(26, 38, 22, 44) | line(34, 26, 38, 34), C(1)[0])
    for x in (22, 31):
        s.fill(rect(x, 12, 4, 3), EYE)
    return fin(s)


def imp(f):
    s = Canvas(40, 44)
    for d in (-1, 1):
        s.shade(poly([(20 + d * 4, 18), (20 + d * 18, 8 if f else 14), (20 + d * 14, 24)]), None, 'form', colors=C(1))
    s.fill(line(20, 38, 12, 42) | line(12, 42, 10, 38), C(0)[1])
    s.shade(ellipse(20, 28, 8, 10), None, 'form', colors=C(0))
    s.shade(ellipse(20, 14, 7, 7), None, 'sphere', colors=C(0))
    s.fill(poly([(14, 10), (12, 2), (17, 8)]) | poly([(26, 10), (28, 2), (23, 8)]), '#f0e0c0')
    for x in (17, 22):
        s.fill(rect(x, 13, 2, 2), EYE)
    s.fill(rect(16, 40, 3, 4) | rect(21, 40, 3, 4), C(0)[1])
    return fin(s)


def dragon(f):
    s = Canvas(108, 84)
    s.shade(poly([(30, 50), (6, 40), (2, 46), (24, 60)]), None, 'form', colors=C(0))  # tail
    for d, yy in ((0, 0),):
        s.shade(poly([(46, 34), (30, 4 if f else 18), (64, 10 if f else 22), (70, 36)]), None, 'form', colors=C(1))  # wing
    for x in (36, 64):
        s.shade(rect(x, 58, 10, 24), None, 'form', colors=C(0))
    s.shade(ellipse(52, 52, 26, 16), None, 'form', colors=C(0))
    s.shade(ellipse(52, 58, 16, 8), None, 'form', colors=['#a8783a', '#d8a050', '#f0c870', '#ffe8a0'])  # belly
    s.shade(poly([(70, 44), (80, 18), (92, 18), (84, 48)]), None, 'form', colors=C(0))  # neck
    s.shade(poly([(80, 12), (104, 20), (106, 28), (90, 30), (78, 22)]), None, 'form', colors=C(0))  # head
    s.fill(poly([(82, 12), (78, 2), (88, 12)]), '#f0e0c0')
    for x in range(40, 76, 6):
        s.fill(poly([(x, 38), (x + 3, 32), (x + 6, 38)]), C(1)[1])
    s.fill(rect(92, 18, 3, 3), EYE); s.fill(line(94, 28, 104, 27), '#ffffff')
    return fin(s)


SPRITES = {}
for name, fn in (('chicken', chicken), ('duck', duck), ('rabbit', rabbit), ('goat', goat), ('sheep', sheep), ('cow', cow), ('pig', pig), ('horse', horse)):
    SPRITES['an_' + name] = (lambda fn=fn: [fn(0), fn(1)])
for name, fn in (('slime', slime), ('bat', bat), ('wolf', wolf), ('boar', lambda f: wolf(f, True)), ('crab', crab), ('bird', bird), ('ghost', ghost),
                 ('yeti', yeti), ('golem', golem), ('imp', imp), ('dragon', dragon)):
    SPRITES['en_' + name] = (lambda fn=fn: [fn(0), fn(1)])
