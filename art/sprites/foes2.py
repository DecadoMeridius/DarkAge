"""Regional creatures and bosses, redrawn (used by creatures2.py's en_* sprites).

Same sizes, channels and fixed colours as creatures2.py. Replaces the shapes that were
ellipses and boxes: wargs and the fire hound (one canine body, scaled), the cave bear, the
troll, the griffin, the Stone Tyrant, the Forge King, the mammoth, shardlings and the Heart
of the Glacier, the basalt golem, the Cinder Drake and the harpy.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng
from sprites.creatures import C, fin, eye, EYE
from sprites.creatures2 import ICE, FIRE, BONE, STEEL, GLOWT, SKIN, TALON, BEAK
from sprites.farm_animals import leg, blob

CLAW = '#e8dcc0'
OBSID = ['#1a1420', '#3a2a4a', '#6a4a8a', '#a88ad8']


def Pk(pts, k=1, ox=0, oy=0):
    return poly([(round(ox + x * k), round(oy + y * k)) for x, y in pts])


def canine(W, H, f, k, mane=C(1), tail=C(1), extra=None):
    """A lean wolf body in a 54x40 design frame, scaled by k (wargs, the fire hound)."""
    s = Canvas(W, H)
    sw = 2 if f else -2
    oy = H - 40 * k
    L = lambda hip, foot, wt, wb, pal, kn: leg(s, (round(hip[0] * k), round(oy + hip[1] * k)), (round(foot[0] * k), H - 1), wt * k, wb * k, pal, kn)
    s.shade(Pk([(10, 18), (4, 14), (1, 18), (3, 26), (9, 24)], k, 0, oy), None, 'form', colors=tail)
    L((14, 26), (13 - sw, 0), 4, 2, C(0)[:1] + C(0)[:3], -2)
    L((36, 26), (37 + sw, 0), 3.5, 2, C(0)[:1] + C(0)[:3], 1)
    s.shade(Pk([(9, 18), (16, 15), (30, 16), (40, 14), (44, 20), (41, 28), (33, 30), (20, 26), (12, 27)], k, 0, oy), None, 'form', colors=C(0))
    s.shade(Pk([(26, 15), (30, 9), (34, 13), (37, 7), (40, 12), (44, 15), (43, 27), (36, 26)], k, 0, oy), None, 'form', colors=mane)
    L((12, 25), (11 + sw, 0), 5, 2, C(0), -2)
    L((34, 26), (34 - sw, 0), 4, 2, C(0), 1)
    s.shade(Pk([(38, 12), (44, 9), (48, 13), (53, 17), (52, 20), (46, 21), (40, 19)], k, 0, oy), None, 'form', colors=C(0))
    s.fill(Pk([(40, 11), (41, 3), (44, 10)], k, 0, oy) | Pk([(43, 10), (45, 3), (46, 10)], k, 0, oy), C(1)[1])
    s.set(round(53 * k), round(oy + 17 * k), EYE)
    s.fill(line(round(47 * k), round(oy + 20 * k), round(51 * k), round(oy + 19 * k)), '#ffffff')
    eye(s, round(44 * k), round(oy + 13 * k), True)
    if extra:
        extra(s, k, oy)
    return fin(s)


def warg(f, ice=False):
    def ext(s, k, oy):
        if ice:
            for x in range(12, 40, 6):
                s.shade(Pk([(x, 17), (x + 3, 7 - (x // 6) % 2 * 3), (x + 6, 17)], k, 0, oy), None, 'form', colors=ICE)
        s.fill(line(round(46 * k), round(oy + 21 * k), round(47 * k), round(oy + 23 * k)), '#ffffff')  # fang
    return canine(66, 48, f, 1.2, extra=ext)


def hound(f):
    flick = 3 if f else 0
    def ext(s, k, oy):
        for i, x in enumerate(range(14, 42, 5)):  # a mane of fire down the spine
            h = 8 + (i * 7 + flick * (i % 2)) % 7
            s.shade(Pk([(x, 17), (x + 3, 17 - h), (x + 6, 17)], k, 0, oy), None, 'form', colors=FIRE)
        s.shade(Pk([(8, 18), (0, 6 + flick), (5, 16), (10, 22)], k, 0, oy), None, 'form', colors=FIRE)
        for x0 in (18, 26, 32):
            s.fill(line(round(x0 * k), round(oy + 20 * k), round((x0 + 3) * k), round(oy + 25 * k)), FIRE[2])  # glowing ribs
        s.fill(rect(round(44 * k), round(oy + 13 * k), 2, 2), FIRE[3])
    return canine(64, 46, f, 1.15, mane=C(0), tail=FIRE, extra=ext)


def bear(f):
    s = Canvas(70, 52)
    sw = 3 if f else -3
    leg(s, (24, 34), (23 - sw, 51), 9, 7, C(0)[:1] + C(0)[:3], -1, hoof=None)
    leg(s, (50, 34), (51 + sw, 51), 8, 7, C(0)[:1] + C(0)[:3], 1, hoof=None)
    s.shade(blob((34, 30, 23, 13), (20, 30, 11, 12), (44, 24, 14, 13)), None, 'form', colors=C(0))
    s.shade(Pk([(30, 14), (40, 10), (52, 14), (52, 24), (34, 22)]), None, 'form', colors=C(1))  # shoulder hump
    for (hx, fx) in ((19, 19 + sw), (46, 46 - sw)):
        leg(s, (hx, 34), (fx, 51), 10, 8, C(0), 0, hoof=None)
        s.fill({(fx - 3, 51), (fx - 1, 51), (fx + 1, 51), (fx + 3, 51)}, CLAW)
    s.shade(Pk([(52, 20), (58, 16), (64, 19), (69, 26), (66, 31), (57, 31), (52, 28)]), None, 'form', colors=C(0))  # head held low
    s.shade(ellipse(65, 28, 4, 3), None, 'form', colors=C(0)[1:] + [C(0)[3]]); s.fill(rect(67, 26, 2, 2), '#1a1414')  # snout
    for x in (54, 59):
        s.shade(ellipse(x, 17, 2.5, 2.5), None, 'sphere', colors=C(1))
    s.fill(line(60, 31, 65, 31), '#f0e8d0')
    r = rng(3)
    for _ in range(18):
        x, y = r.randrange(14, 56), r.randrange(18, 42)
        if s.get(x, y)[3]:
            s.fill(line(x, y, x - 2, y + 2), C(0)[1])  # fur
    eye(s, 60, 21)
    return fin(s)


def troll(f):
    s = Canvas(64, 76)
    sw = 2 if f else 0
    for x, d in ((22, -1), (38, 1)):  # short bowed legs, big feet
        s.shade(Pk([(x - 5, 54), (x + 5, 54), (x + 6 + d, 66), (x + 4, 72), (x - 4, 72), (x - 5 + d, 64)]), None, 'form', colors=C(1))
        s.shade(Pk([(x - 6, 70), (x + 7, 70), (x + 8, 74), (x - 6, 74)]), None, 'form', colors=C(0))
    s.shade(Pk([(14, 28), (26, 20), (44, 20), (52, 30), (52, 48), (44, 58), (18, 58), (10, 46)]), None, 'form', colors=C(0))  # hunched torso
    s.shade(ellipse(30, 47, 13, 10), None, 'form', colors=C(1))  # pot belly
    s.fill(Pk([(16, 54), (46, 54), (44, 60), (18, 60)]), '#6a4a2a'); s.fill(line(18, 57, 44, 57), '#4a3220')  # hide loincloth
    s.shade(Pk([(12, 28), (19, 30), (14 + sw, 60), (7 + sw, 60)]), None, 'form', colors=C(0))  # long arm, knuckles low
    s.shade(ellipse(10 + sw, 63, 5, 4), None, 'sphere', colors=C(0))
    s.shade(Pk([(54, 60 - sw), (57, 18 - sw), (62, 12 - sw), (64, 20 - sw), (59, 60 - sw)]), None, 'form', colors=['#3a2414', '#5a3a22', '#7a5230', '#9a6a40'])  # club
    for y in (18, 26, 34):
        s.fill(Pk([(62, y - sw), (64, y - 1 - sw), (63, y + 1 - sw)]), STEEL[2])
    s.shade(Pk([(44, 28), (51, 26), (58, 52 - sw), (52, 55 - sw)]), None, 'form', colors=C(0))
    s.shade(ellipse(55, 55 - sw, 4, 4), None, 'sphere', colors=C(0))
    s.shade(Pk([(28, 10), (36, 6), (44, 10), (45, 22), (38, 27), (30, 25), (27, 18)]), None, 'form', colors=C(0))  # head thrust forward
    s.shade(Pk([(42, 13), (48, 16), (46, 20), (41, 19)]), None, 'form', colors=C(0)[1:] + [C(0)[3]])  # big nose
    s.fill(line(29, 12, 43, 12), C(1)[0])  # heavy brow
    s.fill(Pk([(33, 24), (34, 19), (35, 24)]) | Pk([(40, 24), (41, 20), (42, 24)]), '#f0e8d0')  # tusks
    for x in (33, 39):
        s.fill(rect(x, 14, 2, 2), EYE)
    s.fill(Pk([(29, 10), (24, 6), (29, 13)]), C(0)[1])  # ear
    for x, y in ((18, 26), (22, 23), (46, 22), (49, 25), (32, 7)):
        s.fill(ellipse(x, y, 3, 1.5), '#5a8a3a'); s.set(x - 1, y - 1, '#8ab858')  # moss
    return fin(s)


def griffin(f):
    s = Canvas(70, 56)
    sw = 2 if f else -2
    s.fill(line(12, 28, 3, 18) | line(12, 29, 4, 19), C(0)[1]); s.shade(ellipse(3, 16, 3, 3), None, 'sphere', colors=C(1))  # lion tail
    leg(s, (16, 36), (15 - sw, 55), 6, 3, C(0)[:1] + C(0)[:3], -2, hoof=None)  # lion hindquarters
    leg(s, (44, 36), (45 + sw, 55), 3, 2, BEAK[:1] + BEAK[:3], 1, hoof=None)
    s.shade(blob((30, 32, 16, 9), (18, 32, 8, 9)), None, 'form', colors=C(0))
    s.shade(ellipse(44, 30, 9, 10), None, 'form', colors=BONE)  # feathered chest
    for y in range(24, 40, 3):
        s.fill(line(39, y, 48, y + 1), BONE[1])
    leg(s, (20, 36), (20 + sw, 55), 7, 4, C(0), -2, hoof=None); s.fill({(18 + sw, 55), (21 + sw, 55), (24 + sw, 55)}, TALON[0])
    leg(s, (46, 36), (46 - sw, 55), 3.5, 2, BEAK, 1, hoof=None); s.fill({(43 - sw, 55), (46 - sw, 55), (49 - sw, 55)}, TALON[0])  # eagle talons
    wing = [(22, 28), (6, 2), (16, 6), (24, 3), (32, 8), (42, 26)] if f else [(22, 28), (2, 22), (12, 18), (14, 30), (26, 24), (42, 28)]
    s.shade(Pk(wing), None, 'form', colors=C(1))
    for p in wing[1:5]:
        s.fill(line(24, 26, p[0], p[1]), C(1)[0])
    s.shade(Pk([(44, 22), (46, 12), (52, 8), (58, 10), (60, 18), (54, 24)]), None, 'form', colors=BONE)  # eagle head
    s.fill(Pk([(58, 12), (66, 14), (69, 19), (67, 23), (64, 19), (58, 19)]), BEAK[2]); s.fill({(67, 21), (67, 22), (66, 23)}, BEAK[0])  # hooked beak
    s.fill(Pk([(46, 12), (40, 4), (48, 10), (47, 2), (51, 9)]), BONE[0])  # crest
    s.fill(line(51, 14, 57, 14), C(1)[1]); eye(s, 54, 13)
    return fin(s)


def tyrant(f):
    """The Stone Tyrant: a mountain that stood up, pines on its shoulders and a crystal heart."""
    s = Canvas(132, 124)
    sw = 3 if f else 0
    for x, d in ((46, -1), (84, 1)):  # stacked boulder legs
        s.shade(Pk([(x - 12, 90), (x + 12, 90), (x + 14, 106), (x + 10, 122), (x - 10, 122), (x - 14, 106)]), None, 'form', colors=C(1))
        s.fill(line(x - 13, 106, x + 13, 105), C(1)[0])
    body = [(28, 44), (40, 30), (56, 26), (78, 26), (94, 30), (106, 44), (104, 70), (96, 92), (66, 98), (36, 92), (28, 70)]
    s.shade(Pk(body), None, 'form', colors=C(0))
    for a, b in (((40, 50), (60, 46)), ((72, 46), (96, 52)), ((34, 74), (54, 80)), ((80, 80), (100, 72)), ((66, 30), (64, 44))):
        s.fill(line(*a, *b), C(0)[0])  # fault lines
    for x, d in ((14, -1), (118, 1)):  # arms of boulders, huge fists
        s.shade(ellipse(x, 48 + sw * d, 15, 13), None, 'form', colors=C(0))
        s.shade(Pk([(x - 10, 56 + sw * d), (x + 10, 56 + sw * d), (x + 9, 88 + sw * d), (x - 9, 88 + sw * d)]), None, 'form', colors=C(1))
        s.shade(ellipse(x, 98 + sw * d, 13, 11), None, 'form', colors=C(0))
        for px_ in (x - 12, x - 6, x + 2):  # pines growing on the shoulders
            s.fill(Pk([(px_, 38 + sw * d), (px_ + 4, 24 + sw * d), (px_ + 8, 38 + sw * d)]), '#2e5a26')
            s.fill(Pk([(px_ + 1, 32 + sw * d), (px_ + 4, 22 + sw * d), (px_ + 7, 32 + sw * d)]), '#4a8a3a')
    s.shade(Pk([(52, 10), (66, 4), (80, 10), (82, 28), (66, 34), (50, 28)]), None, 'form', colors=C(0))  # craggy head
    for pts in ([(54, 14), (44, 0), (60, 10)], [(78, 14), (88, 0), (72, 10)], [(64, 6), (67, -6), (70, 6)]):
        s.shade(Pk(pts), None, 'form', colors=GLOWT)  # crystal crown
    s.fill(line(54, 18, 78, 18), C(0)[0])
    for x in (58, 70):
        s.fill(rect(x, 20, 5, 3), EYE)
    s.fill(line(60, 28, 72, 28), C(1)[0])
    s.shade(Pk([(66, 50), (76, 62), (66, 76), (56, 62)]), None, 'form', colors=GLOWT)  # crystal heart
    for a in range(0, 360, 60):
        r = math.radians(a + (15 if f else 0))
        s.fill(line(66, 62, round(66 + math.cos(r) * 22), round(62 + math.sin(r) * 18)), GLOWT[1])
    s.set(63, 58, '#ffffff')
    return fin(s)


def forgeking(f):
    """The Forge King: an iron giant in heavy plate, a furnace in his chest and a hammer the size of a door."""
    s = Canvas(100, 104)
    for x, d in ((34, -1), (60, 1)):
        s.shade(Pk([(x - 8, 74), (x + 8, 74), (x + 9, 96), (x - 9, 96)]), None, 'form', colors=C(1))
        s.shade(Pk([(x - 11, 94), (x + 11, 94), (x + 12, 102), (x - 11, 102)]), None, 'form', colors=STEEL)  # sabatons
        s.fill(line(x - 8, 84, x + 8, 84), STEEL[3])  # knee plate
    s.shade(Pk([(22, 34), (78, 34), (76, 60), (70, 78), (30, 78), (24, 60)]), None, 'form', colors=C(0))  # breastplate
    s.fill(rect(38, 46, 24, 18), '#1a1414')  # the furnace door
    for x in range(39, 61, 4):
        s.fill(rect(x, 47, 2, 16), STEEL[1])
    s.fill(rect(41, 54, 18, 9), FIRE[2]); s.fill(rect(45, 57, 10, 5), FIRE[3])
    for y in (66, 72):
        s.fill(line(30, y, 70, y), C(0)[0])  # fauld lames
    for x, d in ((16, -1), (84, 1)):  # stepped pauldrons
        for k in range(3):
            s.shade(ellipse(x, 34 + k * 5, 13 - k * 2, 7), None, 'form', colors=C(0))
            s.fill(line(x - 11 + k * 2, 36 + k * 5, x + 11 - k * 2, 36 + k * 5), STEEL[3])
    s.shade(Pk([(8, 44), (20, 44), (19, 74), (9, 74)]), None, 'form', colors=C(1))  # left arm
    s.shade(ellipse(14, 78, 7, 6), None, 'sphere', colors=STEEL)
    up = 12 if f else 0
    s.shade(Pk([(80, 44), (92, 44), (91, 70 - up), (81, 70 - up)]), None, 'form', colors=C(1))
    s.fill(line(86, 76 - up, 86, 6 - up) | line(87, 76 - up, 87, 6 - up), '#5a3a22')  # hammer haft
    s.shade(Pk([(72, 0 + (0 if f else 12)), (100, 0 + (0 if f else 12)), (100, 16 + (0 if f else 12)), (72, 16 + (0 if f else 12))]), None, 'form', colors=STEEL)
    s.fill(rect(73, 2 + (0 if f else 12), 26, 2), STEEL[3]); s.fill(rect(82, 6 + (0 if f else 12), 8, 6), FIRE[1])  # glowing rune
    s.shade(Pk([(36, 14), (50, 6), (64, 14), (64, 32), (36, 32)]), None, 'form', colors=C(1))  # great helm
    s.fill(Pk([(36, 16), (24, 6), (22, 0), (30, 6), (38, 12)]) | Pk([(64, 16), (76, 6), (78, 0), (70, 6), (62, 12)]), BONE[1])  # horns
    s.fill(rect(40, 21, 20, 3), '#1a1414'); s.fill(rect(44, 21, 3, 2) | rect(53, 21, 3, 2), FIRE[2])  # glowing eye slit
    s.fill(line(50, 8, 50, 31), STEEL[3])
    return fin(s)


def mammoth(f):
    s = Canvas(88, 68)
    sw = 2 if f else -2
    for (hx, fx) in ((24, 24 + sw), (58, 58 - sw)):
        leg(s, (hx, 44), (fx, 67), 10, 9, C(0)[:1] + C(0)[:3], 0, hoof=None)
    s.shade(Pk([(10, 40), (16, 22), (34, 12), (54, 10), (70, 16), (76, 34), (72, 50), (16, 52)]), None, 'form', colors=C(0))  # high shoulders, sloping back
    for (hx, fx) in ((18, 18 - sw), (52, 52 + sw)):
        leg(s, (hx, 44), (fx, 67), 11, 10, C(0), 0, hoof=None)
        s.fill({(fx - 4, 67), (fx, 67), (fx + 4, 67)}, '#e8dcc0')  # toenails
    for x in range(12, 74, 3):  # long shaggy fur hanging below the belly
        s.fill(line(x, 44, x + 1, 52 + (x * 7) % 5), C(1)[1] if x % 2 else C(1)[2])
    s.shade(ellipse(32, 16, 18, 6), None, 'form', colors=ICE)  # snow on its back
    s.shade(Pk([(62, 14), (72, 8), (80, 14), (82, 30), (76, 40), (66, 36)]), None, 'form', colors=C(0))  # domed head
    s.shade(Pk([(76, 34), (84, 44), (82, 58), (78, 64), (75, 62), (77, 54), (76, 44), (70, 38)]), None, 'form', colors=C(0))  # trunk
    for y in range(40, 62, 3):
        s.fill(line(76, y, 82, y), C(0)[1])
    s.shade(Pk([(70, 36), (74, 46), (82, 52), (88, 44), (86, 54), (76, 56), (68, 44)]), None, 'form', colors=BONE)  # curved tusk
    s.shade(ellipse(64, 24, 5, 8), None, 'form', colors=C(1))  # ear
    eye(s, 73, 22)
    return fin(s)


def shardling(f, k=1.0):
    """A walking cluster of ice crystals; k=2 is the Heart of the Glacier."""
    W, H = round(58 * k), round(68 * k)
    s = Canvas(W, H)
    P = lambda pts: Pk(pts, k)
    sw = 3 if f else 0
    for x, d in ((20, -1), (36, 1)):  # crystal legs
        s.shade(P([(x - 4, 46), (x + 4, 46), (x + 3 + d * sw, 66), (x - 2 + d * sw, 66)]), None, 'form', colors=C(1))
    s.shade(P([(12, 28), (20, 18), (38, 16), (46, 26), (44, 48), (14, 48)]), None, 'form', colors=C(0))
    prisms = [((14, 26), (4, 4), (12, 3), (20, 20)), ((44, 24), (54, 2), (48, 2), (38, 18)), ((26, 18), (28, -1), (34, 0), (34, 18)),
              ((20, 34), (8, 16), (14, 14), (26, 28)), ((40, 36), (52, 22), (54, 28), (44, 42))]
    for a, b, c, d2 in prisms:
        s.shade(P([a, b, c, d2]), None, 'form', colors=ICE)
        (x0, y0), (x1, y1) = a, b
        s.fill(line(round(x0 * k), round(y0 * k), round((x0 + x1) / 2 * k), round((y0 + y1) / 2 * k)), '#ffffff')
    for x, d in ((6, -1), (50, 1)):  # shard arms
        s.shade(P([(x, 28 + sw * d), (x + 6, 26 + sw * d), (x + 5 + d * 2, 50 + sw * d), (x + 1, 46 + sw * d)]), None, 'form', colors=C(0))
    core = ['#1a3a8a', '#3a8aff', '#9ad8ff', '#ffffff']
    s.shade(P([(29, 30), (36, 37), (29, 44), (22, 37)]), None, 'form', colors=core)
    for x in (24, 32):
        s.fill(rect(round(x * k), round(26 * k), max(2, round(2 * k)), max(2, round(2 * k))), EYE)
    return fin(s)


def basalt(f):
    """A golem of black basalt columns with lava running in the cracks."""
    s = Canvas(72, 76)
    up = 3 if f else 0
    def column(x0, y0, w, h, pal):
        s.shade(Pk([(x0, y0 + 2), (x0 + w / 2, y0), (x0 + w, y0 + 2), (x0 + w, y0 + h), (x0, y0 + h)]), None, 'form', colors=pal)
        s.fill(line(round(x0 + w / 2), y0 + 2, round(x0 + w / 2), y0 + h - 1), pal[1])
    for x in (22, 40):
        column(x, 52, 11, 22, C(1))
    for k, x in enumerate(range(14, 58, 8)):  # the torso: a cluster of columns of different heights
        column(x, 22 - (k % 3) * 4, 8, 34 + (k % 3) * 4, C(0))
    for pts in ([(14, 24), (8, 6), (20, 20)], [(58, 24), (66, 6), (52, 20)], [(32, 16), (36, 4), (40, 16)]):
        s.shade(Pk(pts), None, 'form', colors=OBSID)  # obsidian spikes
    for x, d in ((2, -1), (60, 1)):
        column(x, 28 + up * d, 11, 30, C(0))
        s.shade(ellipse(x + 5, 60 + up * d, 7, 5), None, 'form', colors=C(1))
    for pts in ([(20, 30), (26, 38), (23, 48)], [(46, 28), (42, 40), (50, 52)], [(30, 44), (40, 46)], [(6, 36), (10, 50)], [(64, 34), (66, 50)]):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            s.fill(line(x0, y0, x1 + (1 if f else 0), y1), FIRE[2]); s.fill(line(x0 + 1, y0, x1 + 1, y1), FIRE[1])
    column(26, 4, 20, 20, C(0))  # head
    for x in (29, 39):
        s.fill(rect(x, 12, 4, 3), EYE)
    s.fill(line(30, 19, 42, 19), FIRE[1])
    return fin(s)


def drake(f):
    """The Cinder Drake: a two-legged wyvern, wings for arms, a furnace in its throat."""
    s = Canvas(156, 116)
    up = f
    def wing(ox, oy, pal):
        tip = (ox - 46, oy - 40) if up else (ox - 56, oy - 6)
        f1 = (ox - 16, oy - 46) if up else (ox - 30, oy + 4)
        f2 = (ox + 18, oy - 40) if up else (ox + 4, oy + 8)
        m = Pk([(ox, oy), tip, (ox - 40, oy - 12 if up else oy + 14), f1, (ox - 10, oy - 10 if up else oy + 18), f2, (ox + 28, oy + 2)])
        s.shade(m, None, 'form', colors=pal)
        for p in (tip, f1, f2):
            s.fill(line(ox + 2, oy, p[0], p[1]) | line(ox + 3, oy, p[0] + 1, p[1]), C(0)[0])
        s.fill({(tip[0], tip[1]), (tip[0] - 1, tip[1] - 1)}, BONE[2])  # wing claw
    wing(80, 50, C(1)[:1] + C(1)[:3])
    s.shade(Pk([(48, 66), (24, 58), (6, 62), (0, 70), (10, 70), (28, 72), (46, 80)]), None, 'form', colors=C(0))  # tail
    s.fill(Pk([(0, 70), (2, 60), (8, 66)]) | Pk([(0, 70), (4, 78), (8, 72)]), C(1)[1])
    for x, d in ((60, -1), (86, 1)):  # digitigrade legs
        st = (4 if f else -4) * d
        s.shade(Pk([(x - 9, 74), (x + 9, 74), (x + 6, 92), (x + 10 + st, 108), (x + 4 + st, 110), (x - 2, 94), (x - 9, 86)]), None, 'form', colors=C(0))
        s.fill(Pk([(x - 2 + st, 110), (x + 4 + st, 106), (x + 16 + st, 112), (x + 2 + st, 112)]), BONE[1])
    s.shade(blob((74, 68, 28, 16), (58, 70, 14, 12), (92, 62, 14, 14)), None, 'form', colors=C(0))
    s.shade(Pk([(62, 78), (92, 76), (104, 66), (98, 82), (66, 84)]), None, 'form', colors=['#a8501a', '#e0782a', '#f8a83a', '#ffd870'])  # belly plates
    for x in range(66, 98, 6):
        s.fill(line(x, 77, x + 1, 84), '#a8501a')
    for x in range(52, 104, 8):
        s.fill(Pk([(x, 56 - (x - 52) // 4), (x + 4, 47 - (x - 52) // 4), (x + 8, 56 - (x - 52) // 4)]), C(1)[1])  # spines
    wing(74, 44, C(1))
    s.shade(Pk([(94, 60), (102, 40), (112, 28), (124, 24), (126, 34), (114, 40), (106, 64)]), None, 'form', colors=C(0))  # neck
    for y in range(36, 60, 5):
        s.fill(line(104 - (y - 36) // 4, y, 110 - (y - 36) // 4, y - 1), FIRE[1])  # the throat glows
    s.shade(Pk([(116, 22), (128, 16), (140, 20), (150, 28), (148, 34), (136, 36), (120, 34)]), None, 'form', colors=C(0))  # head
    s.shade(Pk([(130, 34), (148, 36), (144, 42 + up * 3), (128, 40)]), None, 'form', colors=C(0)[:3] + [C(0)[2]])  # jaw
    s.fill(line(132, 35, 146, 36), '#ffffff')
    for pts in ([(120, 20), (110, 4), (124, 16)], [(128, 18), (124, 2), (132, 16)]):
        s.shade(Pk(pts), None, 'form', colors=BONE)
    s.fill(rect(132, 22, 4, 3), EYE); s.set(133, 22, '#ffffff')
    if f:
        s.shade(Pk([(148, 34), (156, 28), (156, 44), (148, 40)]), None, 'form', colors=FIRE)  # a lick of flame
    return fin(s)


def harpy(f):
    s = Canvas(60, 60)
    FLESH = ['#c88a6a', '#e0a888', '#f0c4a4', '#fadcc0']
    def wing(pts):
        s.shade(Pk(pts), None, 'form', colors=C(0))
        for p in pts[1:-1]:
            s.fill(line(pts[0][0], pts[0][1], p[0], p[1]), C(0)[0])
    wing([(24, 24), (2, 2), (8, 12), (0, 20), (8, 26), (2, 34), (26, 34)] if f else [(24, 24), (0, 28), (8, 34), (2, 42), (12, 42), (8, 50), (26, 36)])
    for x in (26, 34):  # bird legs with talons
        s.fill(line(x, 42, x - 1, 50) | line(x + 1, 42, x, 50), BEAK[1]); s.fill(line(x - 1, 50, x + 1, 54), BEAK[1])
        s.fill({(x - 2, 55), (x, 55), (x + 2, 55), (x - 3, 54)}, TALON[0])
    s.shade(Pk([(24, 36), (36, 36), (38, 44), (22, 44)]), None, 'form', colors=C(0))  # feathered hips
    s.shade(Pk([(25, 24), (35, 24), (36, 36), (24, 36)]), None, 'form', colors=FLESH)  # torso
    s.shade(Pk([(25, 26), (35, 26), (35, 30), (25, 30)]), None, 'form', colors=C(1))  # feather wrap
    s.shade(Pk([(24, 6), (36, 4), (44, 12), (42, 30), (36, 22), (26, 24), (22, 16)]), None, 'form', colors=C(1))  # wild hair
    s.shade(Pk([(30, 10), (37, 10), (39, 16), (36, 21), (31, 20)]), None, 'form', colors=FLESH)  # face
    s.fill(rect(35, 13, 2, 2), EYE); s.fill(line(36, 18, 38, 18), '#8a3a3a')
    wing([(36, 24), (58, 4), (52, 14), (60, 20), (52, 26), (58, 32), (36, 34)] if f else [(36, 24), (60, 28), (52, 34), (58, 42), (48, 42), (52, 50), (34, 36)])
    return fin(s)


def salamander(f, k=1.0):
    """A fire lizard with sprawling legs and a ridge of flame; k=2.2 is the Ash Mother."""
    W, H = round(70 * k), round(40 * k)
    s = Canvas(W, H)
    P = lambda pts: Pk(pts, k)
    st = 3 if f else -3
    for x, d in ((22, 1), (44, -1)):  # far legs, sprawled
        s.shade(P([(x, 26), (x + 4, 26), (x + 2 + st * d, 33), (x - 4 + st * d, 38), (x - 6 + st * d, 36), (x - 2, 30)]), None, 'form', colors=C(1))
    s.shade(P([(22, 22), (10, 22), (2, 28 + st // 2), (0, 32 + st // 2), (8, 30), (22, 30)]), None, 'form', colors=C(0))  # tapering tail
    s.shade(P([(18, 20), (30, 16), (44, 17), (50, 22), (46, 30), (24, 31), (16, 27)]), None, 'form', colors=C(0))  # long low body
    s.shade(P([(22, 28), (44, 27), (42, 31), (26, 32)]), None, 'form', colors=FIRE[1:] + [FIRE[3]])  # glowing belly
    for x, d in ((26, -1), (42, 1)):  # near legs with claws
        s.shade(P([(x - 2, 26), (x + 3, 26), (x + 5 + st * d, 32), (x + 1 + st * d, 38), (x - 2 + st * d, 38), (x, 31)]), None, 'form', colors=C(0))
        fx = round((x + st * d) * k)
        s.fill({(fx - round(2 * k), round(38 * k) - 1), (fx, round(38 * k) - 1), (fx + round(2 * k), round(38 * k) - 1)}, CLAW)
    s.shade(P([(46, 18), (54, 15), (62, 17), (68, 21), (67, 25), (58, 27), (48, 26)]), None, 'form', colors=C(0))  # flat head
    s.shade(P([(56, 25), (68, 24), (64, 29 + f), (55, 28)]), None, 'form', colors=C(0)[:3] + [C(0)[2]])  # jaw
    s.fill(line(round(58 * k), round(25 * k), round(66 * k), round(24 * k)), '#ffe0a0')
    for x in range(20, 48, 5):  # flame ridge
        h = 6 + (x // 5) % 2 * 3 + (2 if f and x % 10 == 0 else 0)
        s.shade(P([(x, 18), (x + 2, 18 - h), (x + 5, 18)]), None, 'form', colors=FIRE)
    for x in range(22, 46, 7):
        s.fill(ellipse(x * k, 23 * k, 1.2 * k, 1 * k), FIRE[3])  # ember spots
    s.fill(rect(round(57 * k), round(19 * k), max(2, round(2 * k)), max(2, round(2 * k))), EYE)
    if k > 1.5:  # the Ash Mother wears a crown of horns
        for x in (50, 54, 58):
            s.shade(P([(x, 17), (x + 1, 8), (x + 3, 17)]), None, 'form', colors=BONE)
    return fin(s)
