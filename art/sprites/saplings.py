"""Fruit tree saplings, one set per tree (asked 2026-11-04: growth stages for every plant and tree). `sapling_<kind>.0-2`
(32x52 like props.py's shared `sapling`): a thin whip with a few leaves, a young tree with a small crown, then an
almost-grown tree with blossom (cherry, plum) or small green fruit (the rest), in the tree's own leaf colours and bark
(nature.py LEAF, BARK, FRUIT_TREES). The game shows them while a planted fruit tree grows (age 0-13 days).
"""
import math
from px import line, ellipse, rng
from sprites.props import cv, shadow, done
from sprites.nature import LEAF, BARK, FRUIT_TREES

UNRIPE = ['#2e5a24', '#4a8a3a', '#7cc04a', '#a8dc6a', '#d0f0a0']


def ramp(kind):
    L = LEAF.get(kind) or LEAF['oak']
    return L[1] or LEAF['oak'][1]


def crown(s, cx, cy, rx, ry, L, r, lumps=5):
    for k in range(lumps):   # a few soft lumps, so it reads as foliage and not a ball
        a = k / lumps * math.tau
        s.shade(ellipse(cx + math.cos(a) * rx * .45, cy + math.sin(a) * ry * .4, rx * .62, ry * .62), None, 'form', colors=L[1:])
    s.shade(ellipse(cx - rx * .15, cy - ry * .2, rx * .55, ry * .5), None, 'form', colors=L[2:])


def sapling(kind, st):
    s = cv(32, 52); r = rng(len(kind) * 13 + st)
    L, bark = ramp(kind), BARK['oak']
    blossom, fruit = FRUIT_TREES.get(kind, (None, '#d8342a'))
    h = (16, 26, 36)[st]
    shadow(s, 16, 49, 5 + st * 2, 2)
    s.fill(line(16, 50, 16, 50 - h), bark[2]); s.fill(line(15, 50, 15, round(52 - h * .6)), bark[1])
    if st >= 1: s.fill(line(17, 50, 17, round(50 - h * .55)), bark[3])   # the trunk thickens
    if st == 0:
        for k, (dx, y) in enumerate(((-4, 36), (4, 39), (-4, 42))):
            s.shade(ellipse(16 + dx, y, 3, 1.6), None, 'form', colors=L[1:])
        s.fill(line(16, 34, 18, 31), bark[2]); s.shade(ellipse(19, 31, 2, 1.4), None, 'form', colors=L[2:])
        return done(s)
    if st == 1:
        s.fill(line(16, 34, 11, 30) | line(16, 31, 21, 27), bark[2])
        crown(s, 16, 26, 9, 8, L, r, 4)
    else:
        s.fill(line(16, 30, 9, 24) | line(16, 26, 23, 20) | line(16, 22, 16, 14), bark[2])
        crown(s, 16, 18, 13, 11, L, r, 6)
        if blossom:   # spring-blossoming trees show their flowers
            for _ in range(10):
                x, y = 16 + r.randrange(-11, 12), 18 + r.randrange(-9, 9)
                if s.get(x, y)[3]: s.set(x, y, blossom[4]); s.set(x, y - 1, blossom[5])
        else:   # small green fruit, a hint of colour on a couple
            for k in range(5):
                x, y = 16 + r.randrange(-9, 10), 19 + r.randrange(-6, 8)
                if s.get(x, y)[3]:
                    s.shade(ellipse(x, y, 1.5, 1.5), None, 'sphere', colors=UNRIPE)
                    if k < 2: s.set(x, y, fruit)
    return done(s)


SPRITES = {f'sapling_{k}': (lambda k=k: [sapling(k, i) for i in range(3)]) for k in FRUIT_TREES}
