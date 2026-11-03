"""Growth stages for every crop (asked 2026-11-04): `crop_<key>_0` (sprout), `_1` (young plant) and `_2` (grown, with buds,
flowers or small unripe produce), leading into the ripe drawing `crop_<key>_3` of crops2.py. Same canvas (32x40,
bottom-aligned on a soil mound), real colours, light from the top-left, selective outlines.

Crops are drawn by plant type (TYPE) with their own leaf ramp and an accent (flower, bud or root-top colour), so each
reads as itself from the young plant on: a strawberry is a low rosette with white flowers, corn a tall stalk that tassels,
a pumpkin a sprawling vine with yellow flowers and a small green fruit.
"""
import math
from px import line, ellipse, poly, rng
from sprites.crops import G, STEM, leaf
from sprites.crops2 import (base, fin, ball, bush, stake, RED, DRED, BLUE, PURP, ORNG, YEL, GOLD, WHT, BRN, LGRN, PALE,
                            GREY, BLUEG, DLEAF, CROP_ART)

UNRIPE = ['#2e5a24', '#4a8a3a', '#7cc04a', '#a8dc6a', '#d0f0a0']   # small green fruit before it colours
ASH = ['#1a1414', '#2e2424', '#4a3a34', '#6a5248', '#8a7060']        # volcanic leaves (emberfruit, cinder melon)
SILV = ['#3a4a5a', '#5a6a7a', '#8a9aa8', '#b8c4d0', '#e0e8f0']

# key: (type, leaf ramp, accent ramp)
SPEC = {
    'strawberry': ('low', G, WHT), 'cranberry': ('low', DLEAF, RED),
    'blueberry': ('bush', DLEAF, WHT), 'mountain_berry': ('bush', DLEAF, PURP), 'sunberry': ('bush', DLEAF, YEL),
    'grape': ('vine', G, LGRN), 'sea_grape': ('vine', G, PALE), 'hops': ('vine', G, LGRN),
    'tomato': ('staked', G, YEL), 'pepper': ('staked', G, WHT), 'dragon_pepper': ('staked', DLEAF, ORNG),
    'eggplant': ('bush', DLEAF, PURP), 'emberfruit': ('bush', ASH, ORNG),
    'corn': ('tall', G, GOLD), 'sunflower': ('tall', G, YEL), 'amaranth': ('tall', G, DRED),
    'wheat': ('grain', G, LGRN), 'alpine_barley': ('grain', G, PALE), 'meadowgrass': ('grain', LGRN, LGRN), 'flax': ('grain', G, BLUE),
    'peapod': ('pods', LGRN, WHT), 'snowpea': ('pods', PALE, WHT),
    'carrot': ('root', G, ORNG), 'turnip': ('root', G, PURP), 'radish': ('root', G, RED), 'beet': ('root', G, DRED),
    'yam': ('root', DLEAF, BRN), 'ice_turnip': ('root', BLUEG, SILV), 'potato': ('root', DLEAF, WHT),
    'garlic': ('bulb', PALE, WHT), 'frostleek': ('bulb', BLUEG, SILV),
    'cabbage': ('head', G, PALE), 'redcabbage': ('head', GREY, PURP), 'kale': ('head', DLEAF, DLEAF), 'bokchoy': ('head', G, PALE),
    'artichoke': ('head', GREY, GREY), 'rhubarb': ('head', G, RED),
    'melon': ('gourd', G, YEL), 'glacier': ('gourd', BLUEG, WHT), 'cinder_melon': ('gourd', ASH, ORNG), 'pumpkin': ('gourd', G, YEL),
    'tulip': ('flower', G, RED), 'poppy': ('flower', G, RED), 'starbloom': ('flower', G, BLUE), 'moonblossom': ('flower', SILV, SILV),
    'saffron': ('flower', G, PURP), 'snow_lotus': ('flower', BLUEG, WHT),
}


def blossom(s, x, y, pal, big=False):
    for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)) + (((-1, -1), (1, 1), (1, -1), (-1, 1)) if big else ()):
        s.set(x + dx, y + dy, pal[3])
    s.set(x, y, '#f2c040' if pal[3] in (WHT[3], PALE[3]) else pal[1])


def sprout(L, t):
    """stage 0: a seedling: two seed leaves (a single blade for grasses, two spikes for bulbs, a feathery tuft for carrots)"""
    s = base()
    if t == 'grain':
        for x, h in ((15, 8), (17, 6)): s.fill(line(x, 36, x + (1 if x > 16 else -1), 36 - h), L[2])
    elif t == 'bulb':
        for x in (15, 17): s.fill(line(x, 36, x, 29), L[2]); s.set(x, 28, L[3])
    else:
        s.fill(line(16, 36, 16, 32), STEM)
        leaf(s, 16, 32, -2.5, 5, 2.2, L); leaf(s, 16, 32, -.65, 5, 2.2, L)
    return fin(s)


def young(t, L, A, r):
    """stage 1: the young plant, already in its own shape"""
    s = base()
    if t == 'low':
        for a in (-2.6, -1.6, -.6):
            x, y = 16 + math.cos(a) * 6, 34 + math.sin(a) * 4
            s.fill(line(16, 36, round(x), round(y)), STEM)
            for b in (-.6, 0, .6): s.shade(ellipse(x + math.cos(a + b) * 2.4, y + math.sin(a + b) * 2.4, 2, 1.6), None, 'form', colors=L[1:])
    elif t == 'bush':
        bush(s, 5, 30, 8, L)
    elif t in ('vine', 'pods'):
        stake(s, 16, 18)
        for y in range(22, 36, 3): s.set(15 + (y // 3) % 2, y, L[2])
        for x, y in ((12, 26), (20, 23), (13, 32)): s.shade(ellipse(x, y, 2.6, 2), None, 'form', colors=L[1:])
    elif t == 'staked':
        stake(s, 22, 18); s.fill(line(16, 36, 16, 24), STEM)
        for a, y in ((-2.6, 32), (-.5, 30), (-2.4, 27), (-.7, 25)): leaf(s, 16, y, a, 6, 2.4, L)
    elif t == 'tall':
        s.fill(line(16, 36, 16, 22), STEM)
        for a, y in ((-2.7, 33), (-.4, 30), (-2.5, 27), (-.6, 24)): leaf(s, 16, y, a, 8, 1.6, L)
    elif t == 'grain':
        for i in range(7):
            x = 9 + i * 2.4; h = 9 + r.randrange(0, 4)
            s.fill(line(round(x), 36, round(x + r.randrange(-1, 2)), 36 - h), L[2 + i % 2])
    elif t == 'root':
        if L is G and A is ORNG:   # carrot: a feathery tuft
            for a in (-2.4, -1.9, -1.4, -.9):
                x2, y2 = 16 + math.cos(a) * 9, 35 + math.sin(a) * 9
                s.fill(line(16, 35, round(x2), round(y2)), L[2])
                for k in range(3): s.set(round(16 + math.cos(a) * (4 + k * 2)) + (1 if k % 2 else -1), round(35 + math.sin(a) * (4 + k * 2)), L[3])
        else:
            for a in (-2.5, -1.9, -1.2, -.6): leaf(s, 16, 35, a, 8, 2.4, L)
    elif t == 'bulb':
        for x, h in ((13, 13), (16, 16), (19, 12)): s.fill(line(x, 36, x + (1 if x > 16 else -1 if x < 16 else 0), 36 - h), L[2]); s.fill(line(x + 1, 36, x + 1, 38 - h), L[3])
    elif t == 'head':
        for i in range(6):
            a = -math.pi + (i + .5) / 6 * math.pi
            leaf(s, 16, 35, a * .9 - .1, 7, 3, L)
        if A is RED:   # rhubarb: red stalks
            for x in (12, 16, 20): s.fill(line(16, 36, x, 30), A[2])
    elif t == 'gourd':
        s.fill(line(8, 35, 24, 34), STEM)
        for x, y in ((10, 31), (17, 30), (24, 31)): s.shade(ellipse(x, y, 4, 3), None, 'form', colors=L[1:])
    elif t == 'flower':
        for a in (-2.2, -1.5, -.9): leaf(s, 16, 35, a, 9, 1.8, L)
    return fin(s)


def grown(t, L, A, r, key):
    """stage 2: nearly there: full size, with buds, flowers or small unripe produce"""
    s = base()
    if t == 'low':
        for a in (-2.7, -2.1, -1.5, -.9, -.4):
            x, y = 16 + math.cos(a) * 8, 33 + math.sin(a) * 6
            s.fill(line(16, 36, round(x), round(y)), STEM)
            for b in (-.6, 0, .6): s.shade(ellipse(x + math.cos(a + b) * 3, y + math.sin(a + b) * 3, 2.5, 2), None, 'form', colors=L[1:])
        for x, y in ((11, 25), (22, 26), (16, 23)): blossom(s, x, y, WHT)
        for x, y in ((9, 32), (21, 33)): ball(s, x, y, 1.6, UNRIPE if A is WHT else A, hi=False)
    elif t == 'bush':
        bush(s, 8, 25, 12, L)
        for x, y in ((9, 21), (14, 18), (19, 20), (23, 23), (12, 27), (20, 28)): blossom(s, x, y, A if A in (YEL, PURP, ORNG) else WHT)
        for x, y in ((16, 24), (25, 27), (8, 26)): ball(s, x, y, 1.4, UNRIPE, hi=False)
    elif t == 'vine':
        stake(s, 16, 3); s.fill(line(16, 6, 6, 8) | line(16, 6, 26, 8), '#7a5a30')
        for x in (6, 10, 22, 26): s.fill(line(x, 8, x - 1, 14), L[2])
        for x, y in ((7, 9), (12, 7), (20, 7), (25, 9), (16, 12)): s.shade(ellipse(x, y, 3.5, 2.6), None, 'form', colors=L[1:])
        for cx in (9, 23):   # small hard green bunches (or hop burrs)
            for row in range(3):
                for k in range(-1, 2, 2): ball(s, cx + k + (row % 2), 14 + row * 2.2, 1.1, A if key == 'hops' else UNRIPE, hi=False)
    elif t == 'staked':
        stake(s, 22, 6); s.fill(line(16, 36, 16, 12) | line(16, 26, 11, 20) | line(16, 20, 21, 15), STEM)
        for a, y in ((-2.6, 33), (-.5, 31), (-2.4, 27), (-.6, 23), (-2.5, 19), (-.7, 15)): leaf(s, 16, y, a, 7, 2.6, L)
        for x, y in ((11, 19), (21, 14), (13, 26)): blossom(s, x, y, A)
        for x, y in ((18, 28), (12, 22)): ball(s, x, y, 1.8 if key != 'eggplant' else 2.2, UNRIPE, hi=False)
    elif t == 'tall':
        s.fill(line(16, 36, 16, 6), STEM); s.fill(line(17, 36, 17, 8), L[3])
        for a, y in ((-2.8, 33), (-.3, 29), (-2.6, 25), (-.5, 21), (-2.7, 17), (-.4, 13)): leaf(s, 16, y, a, 9, 1.8, L)
        if key == 'corn':
            for dx in (-2, 0, 2): s.fill(line(16, 6, 16 + dx, 2), A[3])   # the tassel coming
            ball(s, 18, 22, 1.6, UNRIPE, hi=False)
        elif key == 'sunflower':
            s.shade(ellipse(16, 6, 3.5, 3), None, 'sphere', colors=UNRIPE)   # a closed green head
            for a in range(0, 360, 60): s.set(round(16 + math.cos(math.radians(a)) * 4), round(6 + math.sin(math.radians(a)) * 3.4), A[2])
        else:
            for y in range(4, 10): s.set(16 + (y % 2), y, A[2 + y % 2])   # amaranth's plume starting
    elif t == 'grain':
        for i in range(9):
            x = 7 + i * 2.3; top = 9 + r.randrange(0, 6)
            s.fill(line(round(x), 37, round(x + r.randrange(-1, 2)), top), L[2 + i % 2])
            if key == 'flax': blossom(s, round(x), top - 1, A)
            elif key != 'meadowgrass':
                for k in range(4): s.set(round(x) + (k % 2), top - k, A[2])   # green heads, not yet gold
    elif t == 'pods':
        stake(s, 16, 4)
        for y in range(6, 36, 3): s.set(15 + (y // 3) % 3, y, L[2])
        for x, y in ((11, 10), (21, 14), (11, 20), (21, 25), (12, 30)): s.shade(ellipse(x, y, 3, 2), None, 'form', colors=L[1:])
        for x, y in ((12, 14), (20, 9), (20, 21)): blossom(s, x, y, A)
        for x, y in ((11, 24), (21, 29)): s.fill(poly([(x - 1, y), (x + 1, y), (x + 1, y + 4), (x - 1, y + 3)]), UNRIPE[3])
    elif t == 'root':
        if L is G and A is ORNG:
            for a in (-2.6, -2.2, -1.8, -1.4, -1, -.6):
                x2, y2 = 16 + math.cos(a) * 12, 35 + math.sin(a) * 12
                s.fill(line(16, 35, round(x2), round(y2)), L[2])
                for k in range(4): s.set(round(16 + math.cos(a) * (4 + k * 2.4)) + (1 if k % 2 else -1), round(35 + math.sin(a) * (4 + k * 2.4)), L[3])
        else:
            for a in (-2.7, -2.2, -1.7, -1.2, -.7, -.3): leaf(s, 16, 35, a, 11, 2.8, L)
        if key == 'potato':
            for x, y in ((11, 24), (20, 23), (15, 21)): blossom(s, x, y, WHT, True)
        else:
            s.shade(ellipse(16, 36, 3.5, 2), None, 'sphere', colors=A)   # the shoulder of the root, just showing
    elif t == 'bulb':
        for x, h in ((11, 17), (14, 22), (17, 25), (20, 20), (23, 15)):
            s.fill(line(x, 37, x + (1 if x > 17 else -1 if x < 17 else 0), 37 - h), L[2]); s.fill(line(x + 1, 37, x + 1, 39 - h), L[3])
        s.shade(ellipse(17, 36, 3.5, 2.2), None, 'sphere', colors=A)
        if key == 'garlic':   # the curling scape
            s.fill(line(17, 14, 20, 9) | line(20, 9, 23, 11), L[2]); s.set(23, 12, WHT[2])
    elif t == 'head':
        for i in range(8):
            a = -math.pi + (i + .5) / 8 * math.pi
            leaf(s, 16, 35, a * .95 - .08, 10, 3.4, L)
        if A is RED:
            for x in (9, 13, 19, 23): s.fill(line(16, 37, x, 27), A[2]); s.fill(line(16, 37, x + 1, 28), A[1])
        elif key == 'artichoke':
            s.shade(ellipse(16, 22, 3, 3.5), None, 'sphere', colors=A); s.fill(line(16, 26, 16, 34), STEM)
        else:
            s.shade(ellipse(16, 31, 5, 4), None, 'form', colors=A[1:] if A is not DLEAF else L[1:])   # a small head forming
    elif t == 'gourd':
        s.fill(line(4, 35, 28, 33) | line(14, 34, 10, 26), STEM)
        for x, y in ((7, 30), (14, 27), (22, 28), (27, 31), (11, 23)): s.shade(ellipse(x, y, 4.5, 3.4), None, 'form', colors=L[1:])
        for x, y in ((18, 24), (25, 26)): blossom(s, x, y, YEL, True)
        ball(s, 16, 34, 3, UNRIPE if key != 'cinder_melon' else ASH, hi=False)   # a small young fruit
    elif t == 'flower':
        s.fill(line(16, 36, 16, 12), STEM)
        for a in (-2.3, -1.7, -1.3, -.8): leaf(s, 16, 34, a, 10, 2, L)
        s.shade(poly([(14, 12), (18, 12), (18, 9), (16, 6), (14, 9)]), None, 'sphere', colors=UNRIPE)   # a closed bud,
        s.fill(line(16, 7, 16, 11), A[2])                                                                # its colour showing
    return fin(s)


SPRITES = {}
for key, (t, L, A) in SPEC.items():
    if key not in CROP_ART: continue
    SPRITES[f'crop_{key}_0'] = (lambda t=t, L=L: sprout(L, t))
    SPRITES[f'crop_{key}_1'] = (lambda t=t, L=L, A=A, key=key: young(t, L, A, rng(len(key) * 7)))
    SPRITES[f'crop_{key}_2'] = (lambda t=t, L=L, A=A, key=key: grown(t, L, A, rng(len(key) * 11), key))
