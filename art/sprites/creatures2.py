"""Regional creatures and bosses (Phase 11b), side view facing right, 2 frames.

Same palette-swap contract as creatures.py: channel codes RGB(255, ch, level) for the
body (ch 0) and its darker second colour (ch 1), eyes in #2b1d18. Anything drawn in a
fixed colour (fire, ice, crystal, bone, steel) stays that colour whatever the enemy's
colours are. Bosses are drawn at full size, not scaled up in the game, so they stay crisp.
"""
import math
from px import Canvas, rect, ellipse, poly, line
try:
    from .creatures import C, fin, eye, legs, EYE
except ImportError:  # run on its own (previews)
    from creatures import C, fin, eye, legs, EYE

ICE = ['#5a8ab8', '#9ad0f0', '#d8f2ff', '#ffffff']
FIRE = ['#a8281a', '#ff6a1a', '#ffb03a', '#fff0a0']
BONE = ['#a89a80', '#d8ccb0', '#f0e8d0', '#fffaf0']
STEEL = ['#3a3a44', '#6a6a78', '#a8a8b8', '#e0e0ea']
GLOWT = ['#1a6a5a', '#3ac8a8', '#7affd8', '#e0fff8']
SKIN = ['#8a9aa8', '#b8c8d4', '#e0ecf4', '#f8fcff']
TALON = ['#2a2a2a', '#4a4440', '#6a625a']


def sc(pts, k, ox=0, oy=0):
    return [(ox + x * k, oy + y * k) for x, y in pts]


# ---- Highmarch ----------------------------------------------------------------
def warg(f, ice=False):
    s = Canvas(66, 48)
    legs(s, (14, 20, 40, 46), 31, 47, f, w=4)
    s.shade(poly([(14, 20), (2, 10), (6, 17), (0, 22), (8, 24), (14, 26)]), None, 'form', colors=C(1))  # bushy tail
    s.shade(ellipse(29, 26, 19, 10), None, 'form', colors=C(0))
    s.shade(poly([(24, 18), (28, 8), (32, 15), (35, 5), (39, 13), (43, 6), (46, 15), (50, 22), (40, 28), (26, 26)]), None, 'form', colors=C(1))  # mane
    s.shade(poly([(44, 13), (60, 19), (64, 25), (50, 30), (44, 24)]), None, 'form', colors=C(0))
    s.fill(poly([(46, 13), (49, 3), (53, 12)]), C(1)[1])
    s.fill(line(53, 27, 60, 26), '#ffffff'); s.set(55, 28, '#ffffff'); s.set(58, 28, '#ffffff')
    s.set(63, 22, EYE); eye(s, 52, 17)
    if ice:
        for x in range(12, 42, 6):
            m = poly([(x, 19), (x + 3, 8 - (x // 6) % 2 * 3), (x + 6, 19)])
            s.shade(m, None, 'form', colors=ICE)
    return fin(s)


def bear(f):
    s = Canvas(70, 52)
    legs(s, (16, 23, 44, 51), 34, 51, f, w=7)
    for x in (18, 25, 46, 53):
        s.fill({(x + i, 50) for i in range(0, 6, 2)}, '#f0e8d0')
    s.shade(ellipse(32, 30, 23, 14), None, 'form', colors=C(0))
    s.shade(ellipse(26, 19, 13, 7), None, 'form', colors=C(1))  # shoulder hump
    s.shade(ellipse(56, 26, 10, 9), None, 'sphere', colors=C(0))
    s.fill(ellipse(63, 29, 5, 3.5), C(0)[3]); s.fill(rect(66, 27, 2, 2), '#1a1414')
    for x in (51, 58):
        s.shade(ellipse(x, 18, 3, 3), None, 'sphere', colors=C(1))
    eye(s, 58, 23)
    return fin(s)


def troll(f):
    s = Canvas(64, 76)
    for x, d in ((20, 1), (36, -1)):
        s.shade(rect(x, 54, 9, 20), None, 'form', colors=C(1))
        s.fill(rect(x - 1, 72, 11, 3), C(1)[0])
    s.shade(poly([(14, 28), (46, 22), (52, 46), (44, 58), (18, 58), (10, 44)]), None, 'form', colors=C(0))
    s.shade(ellipse(31, 46, 11, 9), None, 'form', colors=C(1))
    sw = 2 if f else 0
    s.shade(poly([(12, 30), (18, 32), (12 + sw, 62), (6 + sw, 62)]), None, 'form', colors=C(0))  # long left arm
    s.shade(ellipse(8 + sw, 64, 5, 4), None, 'sphere', colors=C(0))
    s.shade(poly([(54, 58 - sw), (58, 16 - sw), (63, 14 - sw), (62, 22 - sw), (58, 58 - sw)]), None, 'form', colors=['#3a2414', '#5a3a22', '#7a5230', '#9a6a40'])  # club
    for y in (20, 28, 36):
        s.fill(rect(61, y - sw, 2, 2), STEEL[2])
    s.shade(poly([(44, 30), (50, 28), (58, 52 - sw), (52, 54 - sw)]), None, 'form', colors=C(0))
    s.shade(ellipse(36, 18, 10, 9), None, 'sphere', colors=C(0))
    s.fill(line(29, 14, 43, 13), C(1)[0])
    s.fill({(33, 24), (33, 23), (40, 24), (40, 23)}, '#f0e8d0')
    for x in (32, 39):
        s.fill(rect(x, 16, 2, 2), EYE)
    for x, y in ((16, 26), (20, 24), (44, 22), (48, 24)):
        s.fill(ellipse(x, y, 3, 2), '#5a8a3a'); s.set(x - 1, y - 1, '#8ab858')
    return fin(s)


def griffin(f):
    s = Canvas(70, 56)
    legs(s, (14, 20), 36, 54, f, w=4)
    for x in (40, 46):
        s.shade(rect(x + (1 if f else -1), 36, 4, 16), None, 'cyl', colors=BEAK[:3])
        s.fill({(x - 1, 53), (x + 4, 53), (x + 1, 54)}, TALON[0])
    s.fill(line(12, 30, 2, 22), C(0)[1]); s.shade(ellipse(3, 21, 3, 3), None, 'sphere', colors=C(1))
    s.shade(ellipse(28, 32, 17, 9), None, 'form', colors=C(0))
    s.shade(ellipse(44, 30, 8, 9), None, 'form', colors=BONE)  # white chest feathers
    wing = poly([(20, 28), (8, 2), (30, 8), (44, 26)]) if f else poly([(20, 28), (4, 16), (30, 14), (44, 26)])
    s.shade(wing, None, 'form', colors=C(1))
    for k in range(4):
        s.fill(line(14 + k * 6, 10 + (0 if f else 8), 24 + k * 5, 24), C(1)[0])
    s.shade(ellipse(50, 18, 8, 8), None, 'sphere', colors=BONE)
    s.fill(poly([(55, 14), (63, 15), (67, 19), (66, 24), (63, 21), (56, 22)]), BEAK[2]); s.fill({(66, 22), (66, 23), (65, 24)}, BEAK[0])  # hooked beak
    s.fill(poly([(44, 12), (40, 6), (47, 11), (46, 4), (50, 11)]), BONE[0])  # crest
    s.fill(line(50, 17, 56, 17), C(1)[1]); eye(s, 53, 16)
    return fin(s)


BEAK = ['#a8601a', '#e0902a', '#f2b840', '#ffd870']


def tyrant(f):
    """The Stone Tyrant: a mountain that stood up, with a crystal heart."""
    s = Canvas(132, 124)
    for x in (38, 74):
        s.shade(rect(x, 88, 22, 34), None, 'form', colors=C(1))
        s.fill(rect(x - 2, 118, 26, 5), C(1)[0])
    s.shade(poly([(24, 40), (108, 40), (100, 94), (32, 94)]), None, 'form', colors=C(0))
    sw = 3 if f else 0
    for x, d in ((4, -1), (110, 1)):
        s.shade(rect(x, 54 + sw * d, 18, 40), None, 'form', colors=C(0))
        s.shade(ellipse(x + 9, 98 + sw * d, 12, 10), None, 'sphere', colors=C(1))
    for x in (24, 108):
        s.shade(ellipse(x, 46, 17, 14), None, 'sphere', colors=C(0))
        s.fill(ellipse(x - 4, 38, 7, 3), '#5a8a3a'); s.fill(ellipse(x - 5, 37, 4, 1.5), '#8ab858')
    s.shade(rect(54, 18, 26, 24), None, 'form', colors=C(0))
    for pts in ([(54, 22), (46, 0), (60, 16)], [(80, 22), (88, 0), (74, 16)], [(64, 18), (67, 4), (70, 18)]):
        s.shade(poly(pts), None, 'form', colors=GLOWT)
    s.shade(ellipse(66, 62, 10, 10), None, 'sphere', colors=GLOWT)
    for a in range(0, 360, 60):
        r = math.radians(a + (15 if f else 0))
        s.fill(line(66, 62, round(66 + math.cos(r) * 26), round(62 + math.sin(r) * 22)), GLOWT[1])
    for x in (60, 71):
        s.fill(rect(x, 26, 4, 4), EYE)
    s.fill(line(60, 36, 74, 36), C(1)[0])
    return fin(s)


def forgeking(f):
    """The Forge King: an iron giant with an anvil for a head and a furnace for a heart."""
    s = Canvas(100, 104)
    for x in (30, 56):
        s.shade(rect(x, 74, 14, 28), None, 'form', colors=C(1))
    s.shade(poly([(20, 34), (80, 34), (74, 76), (26, 76)]), None, 'form', colors=C(0))
    for y in (42, 54, 66):
        s.fill(line(26, y, 74, y + 2), FIRE[1])
    s.fill(rect(40, 48, 20, 16), '#1a1414')
    for x in range(41, 59, 4):
        s.fill(rect(x, 49, 2, 14), STEEL[1])
    s.fill(rect(43, 56, 14, 7), FIRE[2]); s.fill(rect(46, 58, 8, 4), FIRE[3])
    s.shade(poly([(30, 14), (70, 14), (78, 20), (62, 22), (62, 32), (38, 32), (38, 22), (22, 20)]), None, 'form', colors=C(1))
    for x in (44, 53):
        s.fill(rect(x, 24, 4, 3), EYE)
    up = 10 if f else 0
    s.shade(rect(80, 40 - up, 10, 34), None, 'form', colors=C(0))
    s.fill(line(86, 40 - up, 86, 4 - up), '#5a3a22'); s.fill(line(87, 40 - up, 87, 4 - up), '#7a5230')
    s.shade(rect(76, 0 + (0 if f else 10), 22, 14), None, 'form', colors=STEEL)
    s.shade(rect(10, 40, 10, 34), None, 'form', colors=C(0))
    return fin(s)


# ---- Frostmere -----------------------------------------------------------------
def mammoth(f):
    s = Canvas(88, 68)
    legs(s, (18, 28, 52, 62), 46, 67, f, w=9)
    s.shade(ellipse(40, 34, 30, 21), None, 'form', colors=C(0))
    for x in range(12, 70, 4):
        s.fill(line(x, 48, x + 1, 54 + (x // 4) % 2 * 2), C(1)[1])
    s.shade(ellipse(30, 18, 16, 6), None, 'form', colors=ICE)  # snow on its back
    s.shade(ellipse(68, 32, 12, 14), None, 'form', colors=C(0))
    s.shade(poly([(74, 38), (82, 52), (80, 62), (75, 62), (76, 52), (70, 44)]), None, 'form', colors=C(0))  # trunk
    s.shade(poly([(70, 44), (82, 48), (88, 40), (86, 50), (72, 50)]), None, 'form', colors=BONE)  # tusk
    s.shade(ellipse(60, 30, 6, 9), None, 'form', colors=C(1))
    eye(s, 70, 27)
    return fin(s)


def wisp(f):
    s = Canvas(48, 60)
    sway = 2 if f else -2
    m = {(x, y) for x in range(4, 44) for y in range(4, 58)
         if ((y < 24 and ((x + .5 - 24) / 13) ** 2 + ((y - 22) / 17) ** 2 <= 1) or
             (24 <= y < 56 and abs(x + .5 - 24 - sway * (y - 24) / 30) < 13 - (y - 24) * .4))}
    s.shade(m, None, 'form', colors=C(0))
    s.shade(ellipse(24, 22, 9, 10), None, 'form', colors=C(1))  # hood shadow
    s.fill(ellipse(24, 34, 4, 5), ICE[3]); s.fill(ellipse(24, 34, 2, 3), '#ffffff')
    for x in (20, 27):
        s.fill(rect(x, 20, 2, 3), EYE)
    for i, (x, y) in enumerate(((6, 14), (42, 22), (8, 42), (40, 48))):
        y += (2 if (i + f) % 2 else -2)
        s.shade(poly([(x, y - 4), (x + 3, y), (x, y + 4), (x - 3, y)]), None, 'form', colors=ICE)
    return fin(s)


def shardling(f, k=1.0):
    """A walking cluster of ice crystals; k=2 is the Heart of the Glacier."""
    W, H = round(58 * k), round(68 * k)
    s = Canvas(W, H)
    P = lambda pts: poly(sc(pts, k))
    for x in (18, 32):
        s.shade(P([(x, 48), (x + 8, 48), (x + 7, 66), (x + 1, 66)]), None, 'form', colors=C(1))
    s.shade(P([(14, 22), (44, 20), (48, 48), (10, 48)]), None, 'form', colors=C(0))
    for pts in ([(14, 22), (6, 6), (20, 18)], [(44, 20), (52, 4), (38, 16)], [(26, 20), (30, 2), (34, 20)], [(20, 30), (14, 14), (26, 26)]):
        s.shade(P(pts), None, 'form', colors=ICE)
    up = 3 if f else 0
    for x, d in ((4, -1), (50, 1)):
        s.shade(P([(x, 26 + up * d), (x + 6, 24 + up * d), (x + 4, 46 + up * d), (x, 44 + up * d)]), None, 'form', colors=C(0))
    core = ['#1a3a8a', '#3a8aff', '#9ad8ff', '#ffffff']
    s.shade(ellipse(29 * k, 36 * k, 6 * k, 6 * k), None, 'sphere', colors=core)
    for x in (24, 32):
        s.fill(rect(round(x * k), round(28 * k), max(2, round(2 * k)), max(2, round(2 * k))), EYE)
    for pts in ([(16, 24), (22, 40)], [(40, 24), (36, 44)]):
        (x0, y0), (x1, y1) = sc(pts, k)
        s.fill(line(round(x0), round(y0), round(x1), round(y1)), '#ffffff')
    return fin(s)


def queen(f):
    """The Rime Queen: a tall sorceress in an ice gown with a crystal staff."""
    s = Canvas(84, 116)
    sway = 2 if f else 0
    s.shade(poly([(22, 30), (58, 30), (74 + sway, 112), (6 + sway, 112)]), None, 'form', colors=C(1))  # cape
    s.shade(poly([(28, 44), (52, 44), (66, 112), (14, 112)]), None, 'form', colors=C(0))  # gown
    for x in range(16, 66, 6):
        s.fill(poly([(x, 112), (x + 3, 106), (x + 6, 112)]), ICE[2])
    s.shade(rect(30, 28, 20, 18), None, 'form', colors=C(0))
    s.shade(poly([(30, 30), (24, 52), (28, 54), (34, 34)]), None, 'form', colors=SKIN)
    s.shade(poly([(50, 30), (64, 40), (62, 44), (48, 36)]), None, 'form', colors=SKIN)
    s.fill(line(66, 112, 66, 18), '#c8e8ff'); s.fill(line(67, 112, 67, 18), '#9ad0f0')
    glow = ICE if not f else ['#7ab8e8', '#bfeaff', '#ffffff', '#ffffff']
    s.shade(poly([(66, 4), (72, 14), (66, 24), (60, 14)]), None, 'form', colors=glow)
    s.shade(poly([(30, 14), (50, 14), (54, 46), (26, 46)]), None, 'form', colors=['#c8d8e8', '#e8f2fa', '#f8fcff', '#ffffff'])  # long white hair
    s.shade(ellipse(40, 18, 8, 9), None, 'sphere', colors=SKIN)
    for pts in ([(32, 10), (33, 0), (36, 9)], [(38, 9), (40, -2), (42, 9)], [(44, 9), (47, 0), (48, 10)]):
        s.shade(poly(pts), None, 'form', colors=ICE)
    s.fill(rect(36, 17, 2, 2), EYE); s.fill(rect(42, 17, 2, 2), EYE)
    s.fill(line(38, 24, 42, 24), '#8aa0b8')
    return fin(s)


# ---- Emberwaste ----------------------------------------------------------------
def hound(f):
    s = Canvas(64, 46)
    legs(s, (14, 19, 38, 43), 28, 45, f, w=3)
    s.shade(ellipse(28, 24, 17, 7), None, 'form', colors=C(0))
    s.shade(poly([(42, 12), (58, 18), (61, 23), (48, 26), (42, 22)]), None, 'form', colors=C(0))
    s.fill(poly([(44, 12), (45, 4), (49, 11)]), C(1)[1])
    flick = 3 if f else 0
    for i, x in enumerate(range(16, 46, 5)):
        h = 10 + (i * 7 + flick * (i % 2)) % 8
        s.shade(poly([(x, 20), (x + 3, 20 - h), (x + 6, 20)]), None, 'form', colors=FIRE)
    s.shade(poly([(12, 20), (0, 8 + flick), (4, 18), (10, 24)]), None, 'form', colors=FIRE)  # burning tail
    for x0 in (20, 28, 34):
        s.fill(line(x0, 22, x0 + 3, 28), FIRE[2])
    s.fill(line(50, 24, 57, 23), '#ffffff')
    s.fill(rect(50, 15, 3, 2), EYE)
    return fin(s)


def salamander(f, k=1.0):
    """A fire lizard; k=2.2 is the Ash Mother."""
    W, H = round(70 * k), round(40 * k)
    s = Canvas(W, H)
    P = lambda pts: poly(sc(pts, k))
    st = 2 if f else -2
    for x, d in ((20, 1), (42, -1)):
        s.fill(line(round(x * k), round(26 * k), round((x - 4 + st * d) * k), round(36 * k)) | line(round((x + 1) * k), round(26 * k), round((x - 3 + st * d) * k), round(36 * k)), C(1)[1])
    s.shade(P([(20, 20), (0, 28 + st), (2, 31 + st), (22, 28)]), None, 'form', colors=C(0))  # tail
    s.shade(ellipse(32 * k, 24 * k, 15 * k, 7 * k), None, 'form', colors=C(0))
    s.shade(P([(44, 18), (62, 21), (66, 26), (60, 29), (44, 30)]), None, 'form', colors=C(0))
    for x in range(20, 46, 5):
        s.shade(P([(x, 18), (x + 2, 10 + (x // 5) % 2 * 3), (x + 4, 18)]), None, 'form', colors=FIRE)
    for x in range(18, 44, 7):
        s.fill(ellipse(x * k, 25 * k, 1.5 * k, 1.2 * k), FIRE[3])
    s.fill(rect(round(55 * k), round(21 * k), max(2, round(2 * k)), max(2, round(2 * k))), EYE)
    if k > 1.5:  # the Ash Mother wears a crown of horns
        for x in (48, 52, 56):
            s.shade(P([(x, 19), (x + 1, 10), (x + 3, 19)]), None, 'form', colors=BONE)
    return fin(s)


def elemental(f):
    s = Canvas(48, 62)
    t = 3 if f else 0
    outer = poly([(10, 58), (6, 36), (12, 22), (16, 30), (18, 10 + t), (24, 22), (28, 4 + t), (32, 20), (38, 12 - t), (40, 34), (42, 58)])
    s.shade(outer, None, 'form', colors=C(0))
    s.shade(poly([(16, 56), (14, 36), (20, 28), (24, 34), (28, 22), (32, 34), (34, 56)]), None, 'form', colors=FIRE[1:])
    s.fill(ellipse(24, 46, 6, 8), FIRE[3])
    for x in (19, 27):
        s.fill(rect(x, 34, 3, 3), EYE)
    return fin(s)


def basalt(f):
    s = Canvas(72, 76)
    for x in (22, 42):
        s.shade(rect(x, 54, 11, 20), None, 'form', colors=C(1))
    s.shade(poly([(14, 24), (58, 24), (62, 56), (10, 56)]), None, 'form', colors=C(0))
    for pts in ([(14, 26), (8, 8), (22, 22)], [(58, 26), (66, 8), (50, 22)], [(30, 24), (34, 12), (38, 24)]):
        s.shade(poly(pts), None, 'form', colors=['#1a1420', '#3a2a4a', '#6a4a8a', '#a88ad8'])  # obsidian spikes
    up = 3 if f else 0
    for x, d in ((2, -1), (60, 1)):
        s.shade(rect(x, 28 + up * d, 12, 30), None, 'form', colors=C(0))
    for pts in ([(20, 30), (28, 40), (24, 50)], [(46, 30), (40, 42), (50, 52)], [(30, 44), (40, 46)]):
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            s.fill(line(x0, y0, x1, y1), FIRE[2]); s.fill(line(x0 + 1, y0, x1 + 1, y1), FIRE[1])
    s.shade(rect(24, 6, 24, 20), None, 'form', colors=C(0))
    for x in (29, 39):
        s.fill(rect(x, 13, 4, 3), EYE)
    return fin(s)


def drake(f):
    """The Cinder Drake: a two-legged wyvern, wings as arms, a furnace in its throat."""
    s = Canvas(156, 116)
    s.shade(poly([(46, 64), (8, 52), (0, 60), (40, 78)]), None, 'form', colors=C(0))
    s.fill(poly([(0, 60), (4, 50), (10, 58)]), C(1)[1])
    wing = [(60, 46), (30, 0), (64, 10), (98, 4), (90, 44)] if f else [(60, 46), (20, 22), (60, 24), (100, 18), (90, 48)]
    s.shade(poly(wing), None, 'form', colors=C(1))
    for (x0, y0), (x1, y1) in zip(wing[1:4], wing[2:5]):
        s.fill(line(60, 46, x0, y0), C(1)[0])
    for x in (56, 84):
        s.shade(rect(x, 80, 12, 30), None, 'form', colors=C(0))
        s.fill(poly([(x - 4, 112), (x + 4, 106), (x + 16, 112)]), BONE[1])
    s.shade(ellipse(72, 70, 30, 18), None, 'form', colors=C(0))
    s.shade(ellipse(76, 78, 18, 8), None, 'form', colors=['#a8501a', '#e0782a', '#f8a83a', '#ffd870'])  # belly plates
    for x in range(60, 94, 6):
        s.fill(line(x, 72, x, 84), '#a8501a')
    s.shade(poly([(92, 62), (106, 30), (118, 30), (106, 66)]), None, 'form', colors=C(0))
    s.shade(poly([(104, 22), (140, 30), (146, 38), (134, 44), (104, 38)]), None, 'form', colors=C(0))
    for pts in ([(108, 22), (100, 6), (114, 20)], [(116, 22), (114, 8), (122, 22)]):
        s.shade(poly(pts), None, 'form', colors=BONE)
    for x in range(52, 104, 8):
        s.fill(poly([(x, 54 - (x - 52) // 4), (x + 4, 46 - (x - 52) // 4), (x + 8, 54 - (x - 52) // 4)]), C(1)[1])
    s.fill(rect(120, 28, 4, 3), EYE)
    s.fill(poly([(132, 40), (146, 38), (140, 44)]), FIRE[2])
    if f:
        s.shade(poly([(146, 36), (156, 32), (156, 46), (146, 42)]), None, 'form', colors=FIRE)
    return fin(s)


# ---- Saltreach -----------------------------------------------------------------
def lobster(f):
    s = Canvas(66, 40)
    for i in range(3):
        s.fill(line(24 + i * 6, 26, 22 + i * 6 + (2 if (i + f) % 2 else -2), 36), C(1)[1])
    s.shade(poly([(4, 18), (12, 14), (12, 30), (4, 28)]), None, 'form', colors=C(1))  # tail fan
    for i in range(3):
        s.shade(ellipse(16 + i * 6, 22, 5, 7 - i * .5), None, 'form', colors=C(0))
    s.shade(ellipse(38, 22, 10, 8), None, 'form', colors=C(0))
    o = 2 if f else 0
    for y, d in ((10 - o, -1), (32 + o, 1)):
        s.fill(line(44, 20 + d * 2, 52, y), C(0)[1])
        s.shade(ellipse(56, y, 8, 5), None, 'form', colors=C(0))
        s.fill(line(58, y - 1, 64, y - 2 + d), C(1)[0])
    s.fill(line(46, 16, 66, 2) | line(46, 17, 64, 6), C(1)[1])
    eye(s, 46, 18)
    return fin(s)


def jelly(f):
    s = Canvas(44, 58)
    bell = {(x, y) for x in range(2, 42) for y in range(2, 26) if ((x + .5 - 22) / 20) ** 2 + ((y - 24) / 21) ** 2 <= 1}
    s.shade(bell, None, 'form', colors=C(0))
    s.fill({(x, y) for x, y in bell if ((x + .5 - 22) / 12) ** 2 + ((y - 18) / 10) ** 2 <= 1}, C(0)[3])
    for i, x in enumerate(range(8, 38, 5)):
        for y in range(25, 54 - (i % 3) * 4):
            s.set(x + round(math.sin(y * .3 + i + (2 if f else 0)) * 2), y, C(1)[2] if y % 4 else C(1)[1])
    for x, y in ((14, 14), (22, 10), (30, 15)):
        s.fill(ellipse(x, y, 1.5, 1.5), '#e8fffa')
    for x in (17, 26):
        s.fill(rect(x, 18, 2, 3), EYE)
    return fin(s)


def harpy(f):
    s = Canvas(60, 60)
    wing = poly([(24, 24), (2, 2), (12, 22), (0, 30), (26, 34)]) if f else poly([(24, 24), (0, 30), (10, 36), (4, 46), (26, 36)])
    s.shade(wing, None, 'form', colors=C(0))
    s.shade(ellipse(30, 34, 9, 12), None, 'form', colors=C(0))
    s.shade(ellipse(31, 30, 5, 6), None, 'form', colors=['#c88a6a', '#e0a888', '#f0c4a4', '#fadcc0'])  # chest
    for x in (26, 34):
        s.fill(line(x, 44, x, 54), BEAK[1]); s.fill({(x - 2, 55), (x, 55), (x + 2, 55)}, TALON[0])
    s.shade(poly([(26, 8), (40, 8), (42, 28), (24, 28)]), None, 'form', colors=C(1))  # hair
    s.shade(ellipse(34, 16, 7, 8), None, 'sphere', colors=['#c88a6a', '#e0a888', '#f0c4a4', '#fadcc0'])
    s.fill(rect(36, 15, 2, 2), EYE)
    s.fill(line(37, 21, 40, 21), '#8a3a3a')
    wing2 = poly([(36, 24), (58, 6), (50, 24), (58, 32), (36, 34)]) if f else poly([(36, 24), (60, 30), (52, 36), (56, 44), (34, 36)])
    s.shade(wing2, None, 'form', colors=C(1))
    return fin(s)


def captain(f):
    """The Drowned Captain: a ghostly pirate whose coat trails into sea mist."""
    s = Canvas(88, 112)
    sway = 3 if f else 0
    m = {(x, y) for x in range(8, 80) for y in range(40, 110)
         if abs(x + .5 - 44 - sway * (y - 40) / 70) < 24 - max(0, y - 80) * .5 and (y < 96 or (x // 6 + f) % 2 == 0 or y < 100)}
    s.shade(m, None, 'form', colors=C(0))  # long coat fading into wisps
    for y in range(46, 90, 8):
        s.fill(rect(42, y, 2, 2), '#d8b84a')
    s.fill(rect(24, 60, 40, 4), C(1)[0])
    s.shade(poly([(22, 42), (14, 70), (20, 72), (28, 46)]), None, 'form', colors=C(0))
    up = 6 if f else 0
    s.shade(poly([(64, 42), (76, 56 - up), (72, 60 - up), (60, 48)]), None, 'form', colors=C(0))
    s.fill(line(74, 58 - up, 86, 20 - up) | line(75, 58 - up, 87, 20 - up), STEEL[2]); s.fill(line(73, 60 - up, 79, 56 - up), '#d8b84a')  # cutlass
    s.shade(ellipse(44, 30, 11, 12), None, 'sphere', colors=['#5a8a7a', '#7ab0a0', '#9ad0c0', '#c8f0e4'])
    s.shade(poly([(34, 34), (54, 34), (50, 52), (44, 56), (38, 52)]), None, 'form', colors=C(1))  # weedy beard
    s.shade(poly([(22, 22), (66, 22), (60, 12), (44, 4), (28, 12)]), None, 'form', colors=['#0e0e16', '#1a1a2a', '#2a2a3e', '#3e3e56'])  # tricorn
    s.fill(line(24, 22, 64, 22), '#d8b84a')
    for x in (38, 48):
        s.fill(rect(x, 27, 3, 3), EYE)
    return fin(s)


def kraken(f):
    """The Tidecaller: a great squid risen from the grotto pools."""
    s = Canvas(140, 112)
    for i in range(8):
        x0 = 30 + i * 11
        pts = []
        for k in range(14):
            t = k / 13
            pts.append((x0 + math.sin(t * 4 + i + (1 if f else 0)) * 10 * t + (i - 3.5) * 6 * t, 60 + t * 50))
        for (ax, ay), (bx, by) in zip(pts, pts[1:]):
            w = 4 - round(3 * ((ay - 60) / 50))
            for d in range(-w, w + 1):
                s.fill(line(round(ax + d), round(ay), round(bx + d), round(by)), C(1)[1] if d < w - 1 else C(1)[0])
        for k in range(3, 13, 3):
            x, y = pts[k]
            s.fill(ellipse(x, y, 1.2, 1.2), '#f0d8d0')
    s.shade(ellipse(70, 38, 34, 34), None, 'form', colors=C(0))
    s.shade(ellipse(70, 62, 30, 8), None, 'form', colors=C(1))
    for x in (56, 84):
        s.fill(ellipse(x, 46, 7, 7), '#f8f0c8'); s.fill(ellipse(x, 46, 4, 6), EYE); s.set(x - 2, 43, '#ffffff')
    for x, y in ((50, 20), (64, 12), (84, 18), (92, 30)):
        s.fill(ellipse(x, y, 2, 2), C(0)[3])
    return fin(s)


from sprites.foes2 import warg, hound, bear, troll, griffin, tyrant, forgeking, mammoth, shardling, basalt, drake, harpy, salamander  # noqa: E402  (redrawn)

SPRITES = {}
for name, fn in (('warg', warg), ('icewarg', lambda f: warg(f, True)), ('bear', bear), ('troll', troll), ('griffin', griffin), ('tyrant', tyrant),
                 ('forgeking', forgeking), ('mammoth', mammoth), ('wisp', wisp), ('shardling', shardling), ('glacierheart', lambda f: shardling(f, 2.0)),
                 ('queen', queen), ('hound', hound), ('salamander', salamander), ('ashmother', lambda f: salamander(f, 2.2)), ('elemental', elemental),
                 ('basalt', basalt), ('drake', drake), ('lobster', lobster), ('jelly', jelly), ('harpy', harpy), ('captain', captain), ('kraken', kraken)):
    SPRITES['en_' + name] = (lambda fn=fn: [fn(0), fn(1)])
