"""Tiered automation (Phase 15a): the machines that come after the first ones.

Tier 1 hand-built: wooden chute, stone furnace, butter churn
Tier 2 iron:      seed hopper
Tier 3 cobalt:    fast belt, lever crane, blast furnace, reaper
Tier 4 tide/rime: filter crane, tide mill, power hammer, storehouse ledger
Tier 5 ember:     rune belt, ember forge, ember core, ember golem (magical, the only magic here)
Belts and cranes come in 4 directions (rotated like the conveyor), working pieces in 2 frames.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng
try:
    from .automation import WOOD, LWOOD, IRON, STONE, FIRE, BELT, fin, shadow, rotated
except ImportError:
    from automation import WOOD, LWOOD, IRON, STONE, FIRE, BELT, fin, shadow, rotated

COBALT = ['#1a2a5a', '#24408a', '#3a62c8', '#6a92f0', '#a8c4ff']
TIDE = ['#0e4a48', '#16706a', '#22a094', '#5ad8c8', '#a8f4ea']
RIME = ['#3a5a7a', '#5a8ab0', '#8ac0e0', '#c8eaff', '#ffffff']
EMBER = ['#5a1408', '#a8301a', '#ff6a1a', '#ffb03a', '#fff0a0']
OBSID = ['#120c18', '#1e1626', '#2e2238', '#46365a', '#6a5a84']


def belt(f, kind):
    """A belt running downwards (dir 0); rotated for the others."""
    s = Canvas(32, 32)
    if kind == 'chute':  # a sloped wooden trough: no power, slow
        s.fill(rect(4, 0, 24, 32), LWOOD[1])
        s.fill(rect(4, 0, 3, 32), LWOOD[3]); s.fill(rect(25, 0, 3, 32), LWOOD[2])
        s.fill(rect(8, 0, 16, 32), LWOOD[0])
        for y in range(2, 32, 6):
            s.fill(rect(8, y, 16, 1), LWOOD[1])
        for y in (5 + f, 21 + f):
            s.fill(rect(15, y, 2, 3), LWOOD[2])
        return s
    frame, trim, slat, chev = {'fast': (IRON, COBALT, BELT, COBALT[4]), 'rune': (OBSID, EMBER, [OBSID[1], OBSID[2], OBSID[3], OBSID[4]], EMBER[3])}[kind]
    s.fill(rect(2, 0, 28, 32), frame[2])
    s.fill(rect(2, 0, 3, 32), trim[3]); s.fill(rect(27, 0, 3, 32), trim[1]); s.fill(rect(4, 0, 1, 32), frame[0]); s.fill(rect(27, 0, 1, 32), frame[0])
    for y in range(32):
        band = ((y + f * 8) // 3) % 2
        s.fill(rect(6, y, 20, 1), slat[2] if band else slat[1])
    for k in range(3):  # double chevrons: faster
        y = 3 + k * 10 + f * 4
        for i in range(5):
            s.set(10 + i, (y + i) % 32, chev); s.set(21 - i, (y + i) % 32, chev)
    for y in (1, 30):
        s.fill(rect(2, y, 28, 1), trim[2])
    return s


def crane(f, filt=False):
    """A lever crane on a post, its arm pointing down (dir 0): lifts from behind, sets down in front."""
    s = Canvas(32, 40)
    shadow(s, 16, 37, 11, 3)
    s.shade(rect(13, 10, 6, 26), None, 'cyl', colors=WOOD)
    s.fill(rect(9, 33, 14, 4), STONE[2]); s.fill(rect(9, 33, 14, 1), STONE[4])
    s.shade(ellipse(16, 12, 5, 5), None, 'sphere', colors=COBALT[1:])  # cog
    for a in range(0, 360, 45):
        r = math.radians(a + f * 22)
        s.set(round(16 + math.cos(r) * 6), round(12 + math.sin(r) * 6), COBALT[3])
    arm = 22 if f else 26
    s.fill(line(16, 12, 16, arm) | line(17, 12, 17, arm), IRON[3])
    s.fill(rect(13, arm, 8, 3), IRON[2]); s.fill(rect(13, arm + 3, 2, 3) | rect(19, arm + 3, 2, 3), IRON[3])  # claw
    s.fill(line(16, 12, 16, 2) | line(17, 12, 17, 2), IRON[2]); s.fill(rect(14, 1, 6, 3), STONE[3])  # counterweight
    if filt:
        s.fill(rect(10, 18, 12, 3), RIME[2]); s.fill(rect(10, 18, 12, 1), RIME[4])
    return fin(s)


def rot40(img, d):
    """Rotate a 32x40 piece about its 32x32 footprint (the arm points the way it faces)."""
    c = Canvas(32, 40)
    im = img.img.crop((0, 4, 32, 36))
    im = {0: im, 3: im.rotate(180), 1: im.rotate(-90), 2: im.rotate(90)}[d]
    c.img.paste(img.img.crop((0, 36, 32, 40)), (0, 36)); c.img.alpha_composite(im, (0, 4)); c.px = c.img.load()
    return c


def furnace(lit, kind):
    W, H = (40, 52) if kind == 'stone' else (44, 72) if kind == 'blast' else (44, 64)
    s = Canvas(W, H)
    shadow(s, W // 2, H - 3, W // 2 - 3, 3)
    pal = {'stone': STONE, 'blast': ['#4a2a22', '#6a3a2a', '#8a4a32', '#a85a3a', '#c87a52'], 'ember': OBSID}[kind]
    top = 18 if kind == 'stone' else 8
    for x in range(4, W - 4):
        for y in range(top, H - 4):
            row = (y - top) // 4
            c = pal[0] if (y - top) % 4 == 3 or (x + row * 3) % 7 == 0 else pal[3] if x < W // 2 - 4 else pal[2]
            s.set(x, y, c)
    if kind == 'stone':
        s.shade(ellipse(W // 2, top, 16, 7), None, 'form', colors=pal)
    elif kind == 'blast':
        s.shade(rect(W // 2 - 6, 0, 12, top + 2), None, 'cyl', colors=pal)
        for y in (20, 40, 58):  # cobalt bands
            s.fill(rect(4, y, W - 8, 3), COBALT[2]); s.fill(rect(4, y, W - 8, 1), COBALT[4])
        s.shade(rect(W - 8, 30, 6, 12), None, 'form', colors=['#3a2a1a', '#5a3a22', '#7a5030', '#9a6a40'])  # bellows
    else:
        s.shade(poly([(4, top + 6), (W // 2, 0), (W - 4, top + 6)]), None, 'form', colors=pal)
        for k, y in enumerate(range(top + 10, H - 8, 9)):  # glowing runes
            s.fill({(W // 2 - 8 + k * 4, y), (W // 2 - 7 + k * 4, y + 1), (W // 2 - 6 + k * 4, y)}, EMBER[3] if lit else EMBER[1])
    mw = 8 if kind == 'stone' else 10
    my = H - 22
    mouth = {(x, y) for x in range(W // 2 - mw, W // 2 + mw) for y in range(my, H - 6) if y > my + 6 or ((x + .5 - W // 2) / mw) ** 2 + ((y - my - 6) / 6) ** 2 <= 1}
    s.fill(mouth, '#1a0c08')
    r = rng(7 + lit + len(kind))
    if lit:
        for x, y in mouth:
            if y > my + 4 and r.random() < .9:
                s.set(x, y, (EMBER if kind == 'ember' else FIRE)[max(0, min(4, int((1 - abs(x - W // 2) / mw + r.uniform(-.3, .3)) * 5)))])
    return fin(s)


def tidemill(f):
    s = Canvas(52, 56)
    shadow(s, 26, 53, 22, 3)
    cx, cy = 26, 30
    s.fill(ellipse(cx, cy, 22, 22) - ellipse(cx, cy, 18, 18), TIDE[1])
    for k in range(12):
        a = k * math.pi / 6 + f * math.pi / 12
        s.fill(line(cx, cy, round(cx + math.cos(a) * 20), round(cy + math.sin(a) * 20)), TIDE[2])
        px, py = round(cx + math.cos(a) * 21), round(cy + math.sin(a) * 21)
        s.fill(rect(px - 2, py - 2, 4, 4), TIDE[3])
    s.shade(ellipse(cx, cy, 5, 5), None, 'sphere', colors=TIDE[1:])
    s.fill(rect(4, 46, 44, 6), STONE[2]); s.fill(rect(4, 46, 44, 1), STONE[4])
    for x in range(8, 46, 6):  # foam at the base
        s.set(x + f * 2, 51, '#e8fffa')
    return fin(s)


def embercore(f):
    s = Canvas(36, 56)
    shadow(s, 18, 53, 13, 3)
    s.shade(poly([(8, 52), (28, 52), (24, 40), (12, 40)]), None, 'form', colors=OBSID)
    for k in range(3):
        s.fill({(13 + k * 5, 46), (14 + k * 5, 45), (15 + k * 5, 46)}, EMBER[3])
    lift = 2 if f else 0
    crystal = poly([(18, 6 - lift), (26, 20 - lift), (18, 34 - lift), (10, 20 - lift)])
    s.shade(crystal, None, 'form', colors=EMBER)
    s.fill(line(18, 8 - lift, 18, 30 - lift), EMBER[4])
    for a in range(0, 360, 60):  # orbiting sparks
        r = math.radians(a + f * 30)
        s.fill(rect(round(18 + math.cos(r) * 14), round(20 - lift + math.sin(r) * 8), 2, 2), EMBER[3])
    return fin(s)


def powerhammer(f):
    s = Canvas(52, 56)
    shadow(s, 26, 53, 22, 3)
    for x in (4, 44):
        s.shade(rect(x, 6, 5, 44), None, 'cyl', colors=IRON)
    s.fill(rect(2, 4, 48, 5), IRON[3]); s.fill(rect(2, 4, 48, 1), IRON[4])
    for y in (16, 26, 36):  # rime coils
        s.fill(rect(4, y, 5, 3) | rect(44, y, 5, 3), RIME[3])
    s.shade(rect(28, 38, 16, 12), None, 'form', colors=IRON)
    s.fill(rect(26, 36, 20, 3), IRON[3])
    hy = 18 if f else 30
    s.fill(line(36, 9, 36, hy) | line(37, 9, 37, hy), IRON[2])
    s.shade(rect(30, hy, 14, 8), None, 'form', colors=RIME[:4])
    return fin(s)


def seedhopper():
    s = Canvas(32, 44)
    shadow(s, 16, 41, 12, 3)
    for x in (6, 24):
        s.shade(rect(x, 24, 3, 16), None, 'cyl', colors=WOOD)
    s.shade(poly([(3, 6), (29, 6), (21, 26), (11, 26)]), None, 'form', colors=LWOOD[1:])
    s.fill(rect(3, 6, 26, 2), LWOOD[0])
    r = rng(4)
    for _ in range(26):
        x, y = r.randrange(6, 26), r.randrange(8, 12)
        s.set(x, y, r.choice(['#c8a060', '#8a6a3a', '#e8d090']))
    s.fill(rect(14, 26, 4, 6), IRON[2])
    return fin(s)


def reaper(f):
    s = Canvas(44, 44)
    shadow(s, 22, 41, 18, 3)
    s.fill(rect(4, 30, 36, 4), WOOD[2]); s.fill(rect(4, 30, 36, 1), WOOD[4])
    for x in (6, 36):
        s.shade(ellipse(x, 36, 5, 5), None, 'sphere', colors=WOOD)
    cx, cy = 22, 20
    s.fill(ellipse(cx, cy, 13, 13) - ellipse(cx, cy, 11, 11), COBALT[2])
    for k in range(6):  # sickle blades turning
        a = k * math.pi / 3 + f * math.pi / 6
        x1, y1 = round(cx + math.cos(a) * 12), round(cy + math.sin(a) * 12)
        s.fill(line(cx, cy, x1, y1), IRON[3])
        s.fill(line(x1, y1, round(x1 + math.cos(a + 1.4) * 4), round(y1 + math.sin(a + 1.4) * 4)), IRON[4])
    s.shade(ellipse(cx, cy, 3, 3), None, 'sphere', colors=COBALT[1:])
    s.fill(rect(30, 22, 10, 8), LWOOD[2]); s.fill(rect(30, 22, 10, 1), LWOOD[4])  # catch box
    return fin(s)


def golem(f):
    s = Canvas(40, 56)
    shadow(s, 20, 53, 14, 3)
    moss = ['#2f5e2a', '#4f8e3a', '#7cb854']
    for x in (12, 22):
        s.shade(rect(x, 38, 7, 15 - (2 if f and x == 12 else 0)), None, 'form', colors=STONE)
    s.shade(poly([(8, 18), (32, 18), (34, 40), (6, 40)]), None, 'form', colors=STONE)
    up = 3 if f else 0
    for x, d in ((2, -1), (32, 1)):
        s.shade(rect(x, 20 - up * (d > 0), 6, 18), None, 'form', colors=STONE)
    s.shade(rect(13, 4, 14, 14), None, 'form', colors=STONE)
    s.fill(rect(15, 9, 3, 2) | rect(22, 9, 3, 2), EMBER[3])
    s.shade(ellipse(20, 28, 4, 4), None, 'sphere', colors=EMBER)  # the ember heart that drives it
    for x, y in ((10, 18), (28, 19), (15, 4), (24, 5)):
        s.fill(ellipse(x, y, 3, 1.5), moss[1]); s.set(x - 1, y - 1, moss[2])
    s.fill(rect(34, 30 - up, 2, 18), WOOD[2]); s.fill(rect(31, 46 - up, 8, 3), IRON[3])  # a hoe
    return fin(s)


def ledger():
    s = Canvas(40, 44)
    shadow(s, 20, 41, 16, 3)
    s.shade(rect(4, 18, 32, 20), None, 'form', colors=LWOOD[1:])
    for x in (6, 32):
        s.fill(rect(x, 36, 3, 6), WOOD[1])
    s.fill(rect(4, 18, 32, 2), LWOOD[4])
    s.fill(rect(10, 10, 20, 9), '#f0e6cc'); s.fill(rect(19, 10, 2, 9), '#c8b890')
    for y in (12, 14, 16):
        s.fill(rect(11, y, 7, 1), '#8a7a6a'); s.fill(rect(22, y, 7, 1), '#8a7a6a')
    s.fill(rect(30, 6, 2, 10), '#f4f0e8'); s.set(30, 5, '#2a2a40')  # quill
    s.fill(rect(6, 24, 28, 3), RIME[2]); s.fill(rect(6, 24, 28, 1), RIME[4])  # the rime coil that links the crates
    return fin(s)


def churn():
    s = Canvas(28, 40)
    shadow(s, 14, 37, 10, 3)
    s.shade(poly([(6, 12), (22, 12), (24, 36), (4, 36)]), None, 'cyl', colors=LWOOD[1:])
    for y in (16, 26, 34):
        s.fill(rect(5, y, 18, 2), IRON[2])
    s.shade(ellipse(14, 12, 8, 3), None, 'form', colors=LWOOD)
    s.fill(rect(13, 0, 2, 12), WOOD[2]); s.fill(rect(10, 1, 8, 2), WOOD[3])
    return fin(s)


def _all():
    out = {}
    for kind, name in (('chute', 'chute'), ('fast', 'fastbelt'), ('rune', 'runebelt')):
        base = [belt(0, kind), belt(1, kind)]
        for d in range(4):
            out[f'{name}_{d}'] = (lambda b=base, d=d: [rotated(b[0], d), rotated(b[1], d)])
    for filt, name in ((False, 'crane'), (True, 'filtercrane')):
        fr = [crane(0, filt), crane(1, filt)]
        for d in range(4):
            out[f'{name}_{d}'] = (lambda fr=fr, d=d: [rot40(fr[0], d), rot40(fr[1], d)])
    out['stonefurnace'] = lambda: [furnace(0, 'stone'), furnace(1, 'stone')]
    out['blastfurnace'] = lambda: [furnace(0, 'blast'), furnace(1, 'blast')]
    out['emberforge'] = lambda: [furnace(0, 'ember'), furnace(1, 'ember')]
    out['tidemill'] = lambda: [tidemill(0), tidemill(1)]
    out['embercore'] = lambda: [embercore(0), embercore(1)]
    out['powerhammer'] = lambda: [powerhammer(0), powerhammer(1)]
    out['reaper'] = lambda: [reaper(0), reaper(1)]
    out['golem'] = lambda: [golem(0), golem(1)]
    out['seedhopper'] = seedhopper
    out['ledger'] = ledger
    out['churn'] = churn
    return out


SPRITES = _all()
