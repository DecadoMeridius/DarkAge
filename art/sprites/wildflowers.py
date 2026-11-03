"""Wild flowers, one species per variant (asked 2026-11-03: the flowers should look different from each other, not one
shape in five colours). Overrides `flower.0-4` from props.py (this module loads after it) with the same colour per
variant: 0 buttercups (yellow), 1 foxgloves (pink), 2 bluebells (blue), 3 daisies (white), 4 marigolds (orange).
32x32, bottom-aligned, light from the top-left.
"""
import math
from px import Canvas, ellipse, poly, line, rng
from sprites.crops import leaf

STEM = '#3e7a30'
LEAVES = ['#1e4a22', '#2e6a2e', '#4a8a3a', '#6aa848', '#8cc45a']


def cv():
    return Canvas(32, 32)


def fin(s):
    s.outline(); return s


def buttercups():
    s = cv(); r = rng(21)
    for x, top in ((7, 16), (12, 12), (17, 17), (22, 11), (26, 18)):  # small glossy yellow cups on thin branching stems
        s.fill(line(x, 30, x + r.randrange(-1, 2), top + 2), STEM)
        s.shade(ellipse(x, top, 2.4, 2), None, 'sphere', colors=['#8a6a00', '#d8a800', '#ffe060', '#fff090', '#ffffff'])
        s.set(x, top + 1, '#e8a020')
    for a in (-2.6, -.5):
        leaf(s, 16, 29, a, 7, 2.4, LEAVES)
    return fin(s)


def foxgloves():
    s = cv()
    for x, top in ((10, 6), (20, 9)):  # a tall spire hung with pink bells on one side
        s.fill(line(x, 30, x, top), STEM)
        for k in range(6):
            y = top + 2 + k * 3
            s.shade(poly([(x + 1, y), (x + 4, y), (x + 4, y + 2), (x + 1, y + 3)]), None, 'sphere', colors=['#7a1a4a', '#c04a7a', '#ff8ab8', '#ffb0d0', '#ffe0f0'])
            s.set(x + 3, y + 2, '#5a1030')
        leaf(s, x, 28, -2.6, 6, 2.4, LEAVES); leaf(s, x, 27, -.5, 6, 2.4, LEAVES)
    return fin(s)


def bluebells():
    s = cv()
    for x0, top in ((8, 9), (17, 7), (25, 11)):  # arching stems with nodding bells along one side
        pts = [(x0 + math.sin(k / 6) * 4, top + k * 2.6) for k in range(8)]
        for k in range(len(pts) - 1):
            s.fill(line(round(pts[k][0]), round(pts[k][1]), round(pts[k + 1][0]), round(pts[k + 1][1])), STEM)
        s.fill(line(x0, 30, round(pts[-1][0]), round(pts[-1][1])), STEM)
        for k in (1, 2, 3, 4):
            x, y = pts[k][0] + 2, pts[k][1] + 1
            s.shade(poly([(x - 1, y), (x + 1, y), (x + 2, y + 3), (x - 2, y + 3)]), None, 'sphere', colors=['#1a2a7a', '#3a4ac0', '#6a80ff', '#a8c0ff', '#e0e8ff'])
    for a in (-1.9, -1.3):
        leaf(s, 16, 30, a, 10, 1.6, LEAVES)
    return fin(s)


def daisies():
    s = cv()
    for x, top in ((8, 15), (16, 10), (24, 16)):  # white rays round a yellow eye
        s.fill(line(x, 30, x, top), STEM)
        for k in range(10):
            a = k / 10 * math.tau
            s.fill(line(x, top, round(x + math.cos(a) * 4), round(top + math.sin(a) * 3.4)), '#ffffff')
            s.set(round(x + math.cos(a) * 4), round(top + math.sin(a) * 3.4), '#d8d8e8')
        s.shade(ellipse(x, top, 1.6, 1.6), None, 'sphere', colors=['#a87000', '#e8a020', '#ffd040', '#ffe880', '#fff8d0'])
    leaf(s, 16, 29, -2.7, 7, 2.2, LEAVES); leaf(s, 16, 29, -.4, 7, 2.2, LEAVES)
    return fin(s)


def marigolds():
    s = cv()
    for i in range(7):  # a low bushy clump
        leaf(s, 16, 29, -math.pi + (i + .5) / 7 * math.pi, 9, 2.6, LEAVES)
    for x, y in ((9, 17), (16, 13), (23, 18), (13, 21), (20, 22)):  # round, ruffled orange pompoms
        s.shade(ellipse(x, y, 3.4, 3), None, 'sphere', colors=['#8a3a00', '#d8601a', '#ffa060', '#ffc890', '#fff0d0'])
        for k in range(6):
            a = k / 6 * math.tau
            s.set(round(x + math.cos(a) * 2), round(y + math.sin(a) * 1.8), '#b84a10')
        s.set(x, y, '#fff0a0')
    return fin(s)


SPRITES = {'flower': lambda: [buttercups(), foxgloves(), bluebells(), daisies(), marigolds()]}
