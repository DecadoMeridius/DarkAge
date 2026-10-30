"""The Hollow Vale's creatures, redrawn (used by creatures.py's en_* sprites).

Same canvas sizes and channels as before (ch 0 body, ch 1 secondary, #2b1d18 swappable eyes),
so every enemy and boss built on them (slimes, bats, wolves, boars, crabs, crows and raptors,
wraiths and shades, yetis and the Frost Giant, golems and the Stone Warden / Ash Colossus, imps,
the Ember Wyrm) changes with them. Side view facing right, two frames.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng
from sprites.creatures import C, fin, eye, EYE, BEAK
from sprites.farm_animals import leg, blob

BONE = ['#8a7a60', '#c8b898', '#ece0c4', '#fff8e8']
CLAW = '#e8dcc0'


def P(pts):
    return poly([(round(x), round(y)) for x, y in pts])


def slime(f):
    s = Canvas(36, 36)
    top, wide = (13, 16.5) if f else (6, 13.5)
    m = {(x, y) for x in range(36) for y in range(36) if y <= 32 and ((x + .5 - 18) / wide) ** 2 + ((y - 32) / (32 - top)) ** 2 <= 1}
    m |= {(x, 32) for x in range(int(18 - wide), int(18 + wide))} | ellipse(8, 32, 2, 1) | ellipse(28, 32, 2, 1)  # a puddle at the base
    s.shade(m, None, 'form', colors=C(0))
    core = {(x, y) for x, y in m if ((x - 19) / (wide * .45)) ** 2 + ((y - 25) / ((32 - top) * .35)) ** 2 <= 1}
    s.shade(core, None, 'sphere', colors=C(0)[:1] + C(0)[:3])  # a darker nucleus inside
    s.fill({(10, top + 6), (11, top + 5), (12, top + 4), (13, top + 4), (11, top + 6)}, '#ffffff')  # wet highlight
    s.set(16, top + 3, '#ffffff')
    for x in (13, 21):
        s.fill(rect(x, 20 + (2 if f else 0), 2, 4), EYE); s.set(x, 20 + (2 if f else 0), '#ffffff')
    s.fill(line(15, 26 + (1 if f else 0), 19, 26 + (1 if f else 0)), C(0)[0])
    for x, y in ((7, 29), (25, 30), (29, 27)):
        s.set(x, y, C(0)[3])  # bubbles
    return fin(s)


def bat(f):
    s = Canvas(40, 32)
    for d in (-1, 1):  # membrane wings stretched over finger bones
        tip = (20 + d * 19, 3 if f else 18)
        f1 = (20 + d * 14, 8 if f else 23); f2 = (20 + d * 9, 12 if f else 25)
        mem = P([(20 + d * 3, 12), tip, (20 + d * 16, 15 if f else 26), f1, (20 + d * 11, 19 if f else 27), f2, (20 + d * 5, 20)])
        s.shade(mem, None, 'form', colors=C(1))
        for fx, fy in (tip, f1, f2):
            s.fill(line(20 + d * 4, 13, fx, fy), C(0)[0])
    s.shade(ellipse(20, 16, 5, 7), None, 'form', colors=C(0))  # furry body
    s.shade(ellipse(20, 10, 5, 4), None, 'sphere', colors=C(0))
    s.fill(P([(15, 9), (14, 1), (18, 7)]) | P([(25, 9), (26, 1), (22, 7)]), C(0)[1])  # big ears
    s.fill({(15, 4), (25, 4)}, C(1)[2])
    s.fill({(18, 10), (22, 10)}, '#ff3a2a'); s.fill({(19, 13), (21, 13), (19, 14), (21, 14)}, '#ffffff')  # eyes, fangs
    s.fill(line(19, 23, 18, 26) | line(21, 23, 22, 26), C(0)[0])  # feet
    return fin(s)


def wolf(f, boar=False):
    s = Canvas(54, 40)
    sw = 2 if f else -2
    if boar:  # heavy forequarters, a bristled ridge, tusks and a flat snout
        leg(s, (16, 28), (16 - sw, 39), 4, 3, C(0)[:1] + C(0)[:3], -1)
        leg(s, (36, 28), (37 + sw, 39), 4, 3, C(0)[:1] + C(0)[:3], 1)
        s.shade(blob((26, 22, 17, 10), (36, 21, 9, 11), (14, 23, 8, 8)), None, 'form', colors=C(0))
        leg(s, (13, 28), (13 + sw, 39), 5, 3, C(0), -1)
        leg(s, (33, 28), (33 - sw, 39), 5, 3, C(0), 1)
        for x in range(14, 40, 2):
            s.fill(line(x, 13 + (x % 4 == 0), x - 1, 9 + (x % 3)), C(1)[1])  # bristles
        s.shade(P([(40, 14), (47, 16), (52, 22), (51, 28), (44, 29), (40, 25)]), None, 'form', colors=C(0))  # head
        s.shade(ellipse(51, 25, 2, 3), None, 'sphere', colors=C(1)); s.set(52, 24, '#3a1a14')  # snout
        s.fill(line(48, 28, 50, 23) | line(47, 28, 49, 24), '#f0e8d0')  # tusk
        s.fill(P([(41, 14), (42, 9), (45, 14)]), C(1)[1])  # ear
        s.fill({(5, 20), (4, 21), (5, 22)}, C(0)[1])  # tail
        eye(s, 46, 18)
        return fin(s)
    s.shade(P([(10, 18), (4, 14), (1, 18), (3, 26), (9, 24)]), None, 'form', colors=C(1))  # bushy tail
    s.fill(line(3, 18, 8, 21), C(1)[3])
    leg(s, (14, 26), (13 - sw, 39), 4, 2, C(0)[:1] + C(0)[:3], -2)  # far legs
    leg(s, (36, 26), (37 + sw, 39), 3.5, 2, C(0)[:1] + C(0)[:3], 1)
    s.shade(P([(9, 18), (16, 15), (30, 16), (40, 14), (44, 20), (41, 28), (33, 30), (20, 26), (12, 27)]), None, 'form', colors=C(0))  # deep chest, tucked waist
    s.shade(P([(30, 13), (38, 11), (44, 15), (43, 27), (36, 26)]), None, 'form', colors=C(1))  # ruff
    leg(s, (12, 25), (11 + sw, 39), 5, 2, C(0), -2)  # near legs, hind hock bent back
    leg(s, (34, 26), (34 - sw, 39), 4, 2, C(0), 1)
    s.shade(P([(38, 12), (44, 9), (48, 13), (53, 17), (52, 20), (46, 21), (40, 19)]), None, 'form', colors=C(0))  # head, long snout
    s.fill(P([(40, 11), (41, 3), (44, 10)]) | P([(43, 10), (45, 3), (46, 10)]), C(0)[1])  # pointed ears
    s.set(53, 17, EYE); s.fill(line(47, 20, 51, 19), C(0)[0])
    s.fill({(48, 21), (50, 21)}, '#ffffff')  # bared teeth
    eye(s, 44, 13)
    return fin(s)


def crab(f):
    s = Canvas(48, 32)
    for i in range(3):  # jointed legs
        for d in (-1, 1):
            kx, ky = 24 + d * (15 + i * 2), 17 + ((i + f) % 2) * 2
            s.fill(line(24 + d * 8, 20, kx, ky) | line(24 + d * 8, 21, kx, ky + 1), C(1)[1])
            s.fill(line(kx, ky, kx + d * 2, 31), C(1)[2])
    s.shade(P([(11, 19), (14, 12), (24, 9), (34, 12), (37, 19), (33, 24), (15, 24)]), None, 'form', colors=C(0))  # carapace
    for x in (16, 21, 27, 32):
        s.set(x, 13 if 18 < x < 30 else 14, C(0)[3]); s.set(x, 12 if 18 < x < 30 else 13, C(0)[3])  # knobs
    s.fill(line(15, 19, 33, 19), C(0)[1])
    for d in (-1, 1):  # big claws: arm, palm and a two-pronged pincer
        cx, cy = 24 + d * 17, 9 - f
        s.fill(line(24 + d * 10, 15, cx - d * 3, cy + 3) | line(24 + d * 10, 16, cx - d * 3, cy + 4), C(0)[1])
        s.shade(ellipse(cx, cy, 5, 4), None, 'form', colors=C(0))
        s.shade(P([(cx + d * 2, cy - 4), (cx + d * 7, cy - 6 - f), (cx + d * 5, cy - 2)]), None, 'form', colors=C(0))
        s.shade(P([(cx + d * 2, cy + 1), (cx + d * 7, cy + 1 + f), (cx + d * 4, cy + 3)]), None, 'form', colors=C(0)[:3] + [C(0)[2]])
    for x in (20, 28):
        s.fill(line(x, 11, x, 6), C(1)[1]); s.fill(rect(x - 1, 4, 2, 2), EYE); s.set(x - 1, 4, '#ffffff')
    return fin(s)


def bird(f):
    s = Canvas(40, 32)
    s.shade(P([(3, 15), (12, 15), (13, 19), (4, 21)]), None, 'form', colors=C(1))  # tail feathers
    s.fill(line(4, 17, 12, 17), C(1)[0])
    s.shade(P([(11, 15), (20, 12), (28, 13), (31, 18), (24, 23), (14, 22)]), None, 'form', colors=C(0))
    s.shade(P([(26, 13), (29, 7), (34, 7), (35, 11), (31, 15)]), None, 'form', colors=C(0))  # head
    s.fill(P([(34, 8), (39, 10), (36, 11), (34, 12)]), BEAK[2]); s.set(38, 11, BEAK[0])  # hooked beak
    wing = P([(15, 14), (12, 1), (18, 4), (22, 3), (25, 13)]) if f else P([(15, 15), (13, 27), (19, 25), (23, 28), (25, 16)])
    s.shade(wing, None, 'form', colors=C(1))
    for k in range(3):
        s.fill(line(16 + k * 3, 14 if f else 16, 14 + k * 3, 4 if f else 25), C(1)[0])
    s.fill(line(20, 23, 19, 27) | line(23, 23, 24, 27), BEAK[1]); s.fill({(18, 28), (20, 28), (23, 28), (25, 28)}, '#2a2018')  # talons
    eye(s, 31, 9)
    return fin(s)


def ghost(f):
    s = Canvas(36, 48)
    sway = 1 if f else -1
    body = P([(18, 3), (26, 7), (29, 16), (30, 28), (27 + sway, 36), (24 + sway, 44), (20, 38), (16 - sway, 46), (12, 37), (7 - sway, 42), (6, 30), (7, 16), (10, 7)])
    s.shade(body, None, 'form', colors=C(0))
    s.shade(P([(10, 8), (18, 3), (26, 8), (26, 18), (10, 18)]), None, 'form', colors=C(0)[1:] + [C(0)[3]])  # hood
    s.fill(ellipse(18, 15, 6, 6), C(1)[0])  # the dark inside of the hood
    for x in (15, 20):
        s.fill(rect(x, 13, 2, 3), EYE); s.set(x, 13, '#ffffff')  # eyes (glow colour swapped in game)
    for d in (-1, 1):  # trailing arms with claws
        s.shade(P([(18 + d * 9, 20), (18 + d * 15, 26 - sway * d), (18 + d * 14, 30 - sway * d), (18 + d * 8, 26)]), None, 'form', colors=C(0))
        s.fill(line(18 + d * 15, 29 - sway * d, 18 + d * 17, 32 - sway * d), C(1)[1])
    for y in range(22, 40, 5):
        s.fill(line(13, y, 23, y + 1), C(0)[1])  # tattered folds
    return fin(s)


def yeti(f):
    s = Canvas(56, 60)
    st = 2 if f else 0
    for x, d in ((20, -1), (34, 1)):  # short powerful legs
        s.shade(P([(x - 5, 40), (x + 5, 40), (x + 4 + d * st, 55), (x - 4 + d * st, 55)]), None, 'form', colors=C(0))
        s.shade(ellipse(x + d * st, 56, 6, 3), None, 'form', colors=C(1))
    s.shade(P([(12, 22), (20, 14), (36, 14), (44, 22), (42, 42), (14, 42)]), None, 'form', colors=C(0))  # hunched torso, huge shoulders
    s.shade(P([(19, 26), (37, 26), (35, 40), (21, 40)]), None, 'form', colors=C(1))  # bare chest
    for x, d in ((9, -1), (47, 1)):  # long arms with fists at the knees
        s.shade(P([(x - d * 4, 19), (x + d * 3, 21), (x + d * 4, 44 - f * d), (x - d * 3, 44 - f * d)]), None, 'form', colors=C(0))
        s.shade(ellipse(x, 47 - f * d, 5, 4), None, 'sphere', colors=C(1))
        s.fill(line(x - 2, 49 - f * d, x + 2, 49 - f * d), C(1)[0])
    r = rng(9)
    for _ in range(20):  # shaggy fur
        x, y = r.randrange(10, 46), r.randrange(15, 42)
        if s.get(x, y)[3]:
            s.fill(line(x, y, x - 1, y + 3), C(0)[3] if r.random() < .5 else C(0)[1])
    s.shade(P([(21, 9), (28, 4), (35, 9), (35, 18), (28, 21), (21, 18)]), None, 'form', colors=C(0))  # head sunk between the shoulders
    s.shade(P([(23, 12), (33, 12), (32, 19), (24, 19)]), None, 'form', colors=C(1))  # face
    s.fill(P([(22, 8), (18, 2), (24, 6)]) | P([(34, 8), (38, 2), (32, 6)]), BONE[2])  # small horns
    for x in (25, 30):
        s.fill(rect(x, 14, 2, 2), EYE)
    s.fill(rect(25, 17, 6, 1), '#ffffff'); s.fill({(25, 18), (30, 18)}, '#ffffff')  # tusked grin
    return fin(s)


def golem(f):
    s = Canvas(56, 60)
    st = 1 if f else 0
    for x, d in ((19, -1), (36, 1)):  # boulder legs
        s.shade(P([(x - 6, 44), (x + 6, 44), (x + 7, 58), (x - 7, 58)]), None, 'form', colors=C(1))
        s.fill(line(x - 6, 51 + st * d, x + 6, 50 + st * d), C(1)[0])
    s.shade(P([(10, 20), (20, 13), (37, 13), (47, 21), (44, 40), (36, 46), (20, 46), (12, 39)]), None, 'form', colors=C(0))  # stacked torso
    s.fill(line(14, 30, 42, 29) | line(22, 13, 20, 29) | line(34, 14, 36, 29), C(0)[0])  # seams between stones
    s.fill(line(24, 32, 28, 38) | line(28, 38, 26, 44) | line(31, 33, 34, 40), EYE)  # a glowing crack (eye colour)
    for x, d in ((7, -1), (49, 1)):  # arms: two boulders and a heavy fist
        s.shade(ellipse(x, 22 + st * d, 6, 5), None, 'form', colors=C(0))
        s.shade(P([(x - 5, 26 + st * d), (x + 5, 26 + st * d), (x + 6, 40 + st * d), (x - 6, 40 + st * d)]), None, 'form', colors=C(1))
        s.shade(ellipse(x, 44 + st * d, 7, 5), None, 'form', colors=C(0))
    s.shade(P([(22, 4), (34, 4), (37, 10), (34, 16), (22, 16), (19, 10)]), None, 'form', colors=C(0))  # head stone
    s.fill(line(19, 9, 37, 9), C(0)[1])  # heavy brow
    for x in (23, 30):
        s.fill(rect(x, 11, 4, 2), EYE)
    r = rng(5)
    for _ in range(14):  # moss and chips
        x, y = r.randrange(12, 44), r.randrange(14, 44)
        if s.get(x, y)[3]:
            s.set(x, y, C(0)[3])
    return fin(s)


def imp(f):
    s = Canvas(40, 44)
    for d in (-1, 1):  # bat wings
        tip = (20 + d * 19, 6 if f else 14)
        s.shade(P([(20 + d * 4, 18), tip, (20 + d * 15, 20 if f else 24), (20 + d * 10, 18 if f else 23), (20 + d * 6, 24)]), None, 'form', colors=C(1))
        s.fill(line(20 + d * 4, 18, tip[0], tip[1]), C(0)[0])
    s.fill(line(20, 34, 10, 40) | line(10, 40, 7, 36), C(0)[1]); s.fill(P([(5, 34), (9, 33), (8, 38)]), C(0)[1])  # spade tail
    s.shade(P([(14, 22), (26, 22), (25, 33), (22, 37), (18, 37), (15, 33)]), None, 'form', colors=C(0))  # wiry body
    s.fill(rect(16, 37, 3, 6) | rect(21, 37, 3, 6), C(0)[1]); s.fill({(15, 43), (19, 43), (20, 43), (24, 43)}, CLAW)  # legs, claws
    for d in (-1, 1):
        s.fill(line(20 + d * 6, 24, 20 + d * 10, 31 - f) | line(20 + d * 6, 25, 20 + d * 10, 32 - f), C(0)[1]); s.fill({(20 + d * 11, 32 - f), (20 + d * 10, 33 - f)}, CLAW)
    s.shade(P([(13, 12), (16, 7), (24, 7), (27, 12), (25, 19), (20, 22), (15, 19)]), None, 'form', colors=C(0))  # head
    s.fill(P([(15, 9), (11, 1), (17, 7)]) | P([(25, 9), (29, 1), (23, 7)]), BONE[2])  # horns
    s.fill(P([(13, 13), (9, 11), (13, 15)]) | P([(27, 13), (31, 11), (27, 15)]), C(0)[1])  # pointed ears
    for x in (16, 22):
        s.fill(rect(x, 12, 2, 2), EYE); s.set(x + 1, 12, '#ffffff')
    s.fill(line(16, 17, 23, 17), '#ffffff'); s.fill({(16, 16), (23, 16)}, C(0)[0])  # wide grin
    return fin(s)


def dragon(f):
    s = Canvas(108, 84)
    up = f
    # far wing, then tail, legs, body, near wing, neck and head
    def wing(ox, dy, pal):
        tip = (ox - 26, 2 + dy) if up else (ox - 30, 30 + dy)
        f1 = (ox - 8, 0 + dy) if up else (ox - 14, 40 + dy)
        f2 = (ox + 10, 6 + dy) if up else (ox + 4, 44 + dy)
        m = P([(ox, 36), tip, (ox - 22, 24 if up else 44), f1, (ox - 4, 26 if up else 46), f2, (ox + 14, 34)])
        s.shade(m, None, 'form', colors=pal)
        for p in (tip, f1, f2):
            s.fill(line(ox + 2, 34, p[0], p[1]) | line(ox + 3, 34, p[0] + 1, p[1]), C(0)[0])
    wing(62, 4, C(1)[:1] + C(1)[:3])
    tail = [(34, 50), (20, 46), (8, 50), (2, 60), (8, 58), (16, 56), (32, 60)]
    s.shade(P(tail), None, 'form', colors=C(0))
    s.fill(P([(2, 60), (0, 52), (6, 55)]), C(1)[1])  # tail spade
    for x, d in ((38, -1), (64, 1)):
        leg(s, (x + 2, 56), (x + 2 + (3 if f else -3) * d, 83), 10, 6, C(0)[:1] + C(0)[:3], -2 * d, hoof=None)
    s.shade(blob((52, 52, 24, 14), (36, 54, 12, 11), (68, 50, 12, 12)), None, 'form', colors=C(0))
    s.shade(P([(36, 60), (52, 64), (70, 60), (64, 66), (40, 66)]), None, 'form', colors=['#a8783a', '#d8a050', '#f0c870', '#ffe8a0'])  # belly plates
    for x in range(42, 68, 5):
        s.fill(line(x, 61, x + 1, 66), '#a8783a')
    for x, d in ((34, -1), (60, 1)):
        leg(s, (x, 56), (x + (-3 if f else 3) * d, 83), 11, 7, C(0), -2 * d, hoof=None)
        fx = x + (-3 if f else 3) * d
        s.fill({(fx - 4, 83), (fx - 1, 83), (fx + 2, 83)}, CLAW)  # claws
    for x in range(30, 74, 6):
        s.fill(P([(x, 40 + (x > 50) * -2), (x + 3, 33 + (x > 50) * -2), (x + 6, 40 + (x > 50) * -2)]), C(1)[1])  # back spines
    wing(56, 0, C(1))
    s.shade(P([(68, 44), (74, 30), (80, 20), (90, 16), (94, 24), (86, 30), (80, 46)]), None, 'form', colors=C(0))  # curved neck
    for y in range(26, 44, 4):
        s.fill(line(78 - (y - 26) // 3, y, 84 - (y - 26) // 3, y - 1), '#d8a050')  # throat scales
    s.shade(P([(84, 14), (92, 10), (100, 14), (107, 19), (106, 24), (98, 26), (88, 25)]), None, 'form', colors=C(0))  # head
    s.shade(P([(92, 24), (104, 26), (100, 30 + up * 2), (90, 28)]), None, 'form', colors=C(0)[:3] + [C(0)[2]])  # lower jaw
    s.fill(line(94, 25, 104, 26), '#ffffff')  # teeth
    s.fill(P([(86, 13), (78, 4), (82, 3), (90, 11)]) | P([(90, 11), (86, 1), (89, 1), (93, 10)]), BONE[2])  # horns
    s.fill(rect(94, 15, 3, 2), EYE); s.set(95, 15, '#ffffff'); s.set(105, 19, C(0)[0])
    return fin(s)
