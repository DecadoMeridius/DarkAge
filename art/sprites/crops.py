"""Crop templates (32x40, one tile wide, bottom-aligned) and tilled soil tiles (32x32).

Produce pixels are channel codes RGB(255, ch, level): ch 0 = the crop's colour,
ch 1 = its second colour. cropSpr in h_pixel.js swaps them per crop, so these
few drawings cover every crop. Leaves and stems are real colours.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng

G = ['#1e4a22', '#2e6a2e', '#4a8a3a', '#6aa848', '#8cc45a']
STEM = '#3e7a30'


def C(ch):
    return [(255, ch, k, 255) for k in range(4)]


def leaf(s, x0, y0, ang, L, w=2.2, pal=G):
    tip = (x0 + math.cos(ang) * L, y0 + math.sin(ang) * L)
    nx, ny = -math.sin(ang) * w, math.cos(ang) * w
    mid = (x0 + math.cos(ang) * L * .5, y0 + math.sin(ang) * L * .5)
    s.shade(poly([(x0, y0), (mid[0] + nx, mid[1] + ny), tip, (mid[0] - nx, mid[1] - ny)]), None, 'form', colors=pal[1:])


def base():
    return Canvas(32, 40)


def soil_mound(s):
    s.fill(ellipse(16, 37, 6, 2), '#5a3a22')


def sprout():
    s = base(); soil_mound(s)
    leaf(s, 16, 36, -2.3, 6); leaf(s, 16, 36, -.85, 6)
    return fin(s)


def small():
    s = base(); soil_mound(s)
    s.fill(line(16, 37, 16, 24), STEM)
    for a, y in ((-2.5, 30), (-.6, 30), (-2.2, 26), (-1.0, 26)):
        leaf(s, 16, y, a, 7)
    return fin(s)


def leafy(n=7):
    s = base(); soil_mound(s)
    for i in range(n):
        leaf(s, 16, 35, -3 + i * (3 / (n - 1)) * .95 - .05, 10 + (i % 2) * 2, 2.6, G if i % 2 else ['#24502a', '#3e7a30', '#5a9a38', '#7cb444', '#a2cc58'])
    return s


def long2():
    s = base(); soil_mound(s)
    for i in range(3):
        x, top = 10 + i * 6, 10 + (i % 2) * 4
        s.fill(line(x, 37, x + 1, top), STEM); s.fill(line(x + 1, 37, x + 2, top), G[3])
        leaf(s, x, top + 12, -2.6, 7); leaf(s, x + 1, top + 8, -.5, 7)
    return s


def fin(s):
    s.outline()
    return s


def mature(shape, big=False):
    if shape == 'long':
        s = long2()
        for i in range(3):
            x, top = 10 + i * 6, 10 + (i % 2) * 4
            s.shade(rect(x - 1, top - 2, 4, 10), None, 'cyl', colors=C(0))
        return fin(s)
    if shape == 'flower':
        s = leafy(5)
        s.fill(line(16, 34, 16, 10), STEM)
        for k in range(8):
            a = k / 8 * math.tau
            s.shade(ellipse(16 + math.cos(a) * 5, 9 + math.sin(a) * 5, 3, 3), None, 'sphere', colors=C(0))
        s.shade(ellipse(16, 9, 3, 3), None, 'sphere', colors=['#8a5a10', '#d89a20', '#f2c040', '#ffe080'])
        return fin(s)
    if shape == 'berry':
        s = leafy(7)
        for i in range(7):
            x, y = 8 + (i * 5) % 16, 14 + (i * 3) % 10
            s.shade(ellipse(x, y, 2.5, 2.5), None, 'sphere', colors=C(0)); s.set(x - 1, y - 1, '#ffffff')
        return fin(s)
    if shape == 'root':
        s = leafy(6)
        s.shade(ellipse(16, 34, 6, 4.5), None, 'sphere', colors=C(0))
        s.set(14, 32, '#ffffff')
        return fin(s)
    if shape == 'leaf':
        s = base(); soil_mound(s)
        s.shade(ellipse(16, 26, 10, 9), None, 'form', colors=C(0))
        for k in range(3):
            leaf(s, 16, 30, -2.4 + k * .8, 9, 2.4, ['#000000'] + [(255, 0, l, 255) for l in range(4)])
        return fin(s)
    # round
    s = leafy(6)
    if big:
        s.shade(ellipse(16, 30, 11, 8), None, 'sphere', colors=C(0))
        for k in (-4, 0, 4):
            s.fill(line(16 + k, 24, 16 + k, 36), (255, 0, 1, 255))
        s.fill(rect(15, 20, 3, 4), (255, 1, 1, 255))
    else:
        for x, y in ((11, 23), (21, 25)):
            s.shade(ellipse(x, y, 4, 4), None, 'sphere', colors=C(0)); s.set(x - 1, y - 2, '#ffffff')
    return fin(s)


def dead():
    s = base(); soil_mound(s)
    s.fill(line(16, 37, 15, 26) | line(15, 26, 18, 22), '#8a6a40')
    for a in (-2.6, -.5, 2.4):
        leaf(s, 16, 30, a, 7, 2, ['#4a3a20', '#6a5430', '#8a6e44', '#a8885a', '#c0a070'])
    return fin(s)


def soil(wet):
    s = Canvas(32, 32)
    pal = ['#3e2616', '#4e321e', '#5a3a24', '#6a4a30'] if wet else ['#7a4e30', '#8a5e3a', '#9a6a44', '#b08050']
    r = rng(3 + wet)
    s.fill(rect(1, 1, 30, 30), pal[2])
    for k in range(3):  # furrows
        y = 6 + k * 9
        s.fill(rect(3, y, 26, 2), pal[0]); s.fill(rect(3, y + 2, 26, 1), pal[3])
    for _ in range(14):
        s.set(r.randrange(2, 30), r.randrange(2, 30), pal[1 if r.random() < .5 else 3])
    s.fill(rect(1, 0, 30, 1) | rect(0, 1, 1, 30), pal[3]); s.fill(rect(1, 31, 30, 1) | rect(31, 1, 1, 30), pal[0])
    if wet:
        s.fill(ellipse(10, 9, 5, 1.5), '#5a6a7a'); s.set(8, 9, '#8a9aaa')
    return s


SPRITES = {'crop_s0': sprout, 'crop_s1': small, 'crop_dead': dead, 'crop_long_2': lambda: fin(long2()), 'crop_leafy_2': lambda: fin(leafy()),
           'soil_dry': lambda: soil(0), 'soil_wet': lambda: soil(1), 'crop_round_big_3': lambda: mature('round', True)}
for sh_ in ('long', 'flower', 'berry', 'root', 'leaf', 'round'):
    SPRITES[f'crop_{sh_}_3'] = (lambda sh_=sh_: mature(sh_))
