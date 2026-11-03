"""Ripe crops drawn one by one (asked 2026-11-03: grown plants should look like the real thing, a strawberry plant
should read as strawberries). Each crop gets its own `crop_<key>_3` (32x40, one tile wide, bottom-aligned like
crops.py) in real colours, not channel codes; cropSpr in h_pixel.js uses it when it exists and falls back to the
shape templates in crops.py otherwise. Light from the top-left, selective outlines.
"""
import math
from px import Canvas, rect, ellipse, poly, line, rng
from sprites.crops import G, STEM, leaf, soil_mound

# hand-picked ramps, dark -> light
RED = ['#7a1018', '#b0202a', '#e2394a', '#f2707a', '#ffb0b0']
DRED = ['#4a0a18', '#6a1028', '#8a1a3a', '#b03a5a', '#d06a82']
BLUE = ['#1a2060', '#2a3a9a', '#4a5ae0', '#7a8af0', '#b0c0ff']
PURP = ['#2a1040', '#4a2060', '#6a3a8a', '#8a5aaa', '#b08ad0']
ORNG = ['#7a3a08', '#b05a10', '#ea8a22', '#f6aa4a', '#ffd08a']
YEL = ['#8a6a10', '#c09a20', '#f2cf3a', '#ffe070', '#fff4b0']
GOLD = ['#7a5a1a', '#a8822a', '#e3c058', '#f0d880', '#fff0c0']
WHT = ['#a8a090', '#cfc8b8', '#f2ead8', '#fffaf0', '#ffffff']
BRN = ['#4a2a14', '#6a4022', '#8a5a34', '#b07a4a', '#d0a070']
LGRN = ['#2e5a24', '#4a8a3a', '#7cc04a', '#a8dc6a', '#d0f0a0']
PALE = ['#3a6a2a', '#5a9a4a', '#8ac86a', '#b0e090', '#e0f8c8']
GREY = ['#2e4a3a', '#4a6a5a', '#6a9a7a', '#8ab89a', '#b0d8c0']
BLUEG = ['#2a4a5a', '#3a6a7a', '#5a9aa8', '#8ac0c8', '#c0e4ea']
DLEAF = ['#163a1a', '#24502a', '#3e7a30', '#5a9a38', '#7cb444']


def base():
    s = Canvas(32, 40); soil_mound(s); return s


def fin(s):
    s.outline(); return s


def ball(s, x, y, r, pal, hi=True):
    s.shade(ellipse(x, y, r, r), None, 'sphere', colors=pal)
    if hi and r >= 2:
        s.set(round(x - r * .45), round(y - r * .45), '#ffffff')


def bush(s, n=7, cy=26, spread=11, pal=G):
    for i in range(n):
        a = -math.pi + (i + .5) / n * math.pi
        leaf(s, 16, 35, a * .9 - .15, spread + (i % 2) * 2, 2.8, pal)
    s.shade(ellipse(16, cy, 9, 7), None, 'form', colors=pal[1:])


def stake(s, x=16, top=4):
    s.fill(line(x, 37, x, top), '#8a6a40'); s.fill(line(x + 1, 37, x + 1, top), '#b08a58')


def stalk(s, x, top, bend=0, col=STEM):
    s.fill(line(x, 37, x + bend, top), col)


# ---------------------------------------------------------------- berries
def strawberry():
    s = base(); r = rng(5)
    for a in (-2.7, -2.1, -1.5, -.9, -.4):  # trifoliate leaves on short stems, low to the ground
        x, y = 16 + math.cos(a) * 8, 33 + math.sin(a) * 6
        s.fill(line(16, 36, round(x), round(y)), STEM)
        for b in (-.6, 0, .6):
            s.shade(ellipse(x + math.cos(a + b) * 3, y + math.sin(a + b) * 3, 2.5, 2), None, 'form', colors=G[1:])
    for x, y in ((8, 31), (13, 34), (21, 33), (25, 30), (18, 29)):  # heart-shaped red berries with seeds and a green cap
        s.shade(poly([(x - 3, y - 2), (x + 3, y - 2), (x + 3, y + 1), (x, y + 4), (x - 3, y + 1)]), None, 'sphere', colors=RED)
        s.fill({(x - 1, y - 3), (x, y - 3), (x + 1, y - 3), (x, y - 4)}, '#3e7a30')
        for dx, dy in ((-1, -1), (1, 0), (0, 2), (-2, 1), (2, -1)):
            s.set(x + dx, y + dy, '#ffe070')
    for x, y in ((11, 24), (22, 25)):  # a couple of white flowers
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
            s.set(x + dx, y + dy, '#ffffff')
        s.set(x, y, '#f2c040')
    return fin(s)


def berry_bush(pal, n=11, r_=2.2, seed=3, bloom=None):
    s = base(); bush(s, 8, 25, 12, DLEAF)
    r = rng(seed)
    pts = [(9, 21), (13, 18), (18, 19), (23, 21), (11, 27), (16, 25), (21, 27), (25, 25), (7, 25), (19, 30), (14, 31), (24, 30)]
    for x, y in pts[:n]:
        ball(s, x + r.randrange(-1, 2), y + r.randrange(-1, 2), r_, pal)
        if bloom:
            s.set(x, y - 1, bloom)
    return fin(s)


def blueberry():
    s = berry_bush(BLUE, 12, 2.0, 4)
    for x, y in ((9, 21), (18, 19), (16, 25)):  # the pale bloom on blueberries
        s.set(x, y - 1, '#d0d8ff')
    return s


def cranberry():
    s = base()
    for i in range(9):  # a low trailing mat with small glossy berries
        x = 4 + i * 3
        s.fill(line(x, 36, x + 2, 33 + (i % 3)), STEM)
        s.shade(ellipse(x + 1, 32 + (i % 3), 2, 1.4), None, 'form', colors=DLEAF[1:])
    for x, y in ((6, 31), (10, 34), (14, 30), (18, 33), (22, 30), (26, 33), (12, 27), (20, 27)):
        ball(s, x, y, 1.8, ['#5a0a18', '#8a1028', '#c8183a', '#e84a5a', '#ff9aa0'])
    return fin(s)


def vine_bunch(pal, seed=6, berry=1.6):
    s = base(); stake(s, 16, 3)
    s.fill(line(16, 6, 6, 8) | line(16, 6, 26, 8), '#7a5a30')  # a crossbar for the vine
    for x in (6, 10, 22, 26):
        s.fill(line(x, 8, x - 1, 16), '#5a7a30')
    for x, y in ((7, 9), (12, 7), (20, 7), (25, 9), (16, 12)):
        s.shade(ellipse(x, y, 3.5, 2.6), None, 'form', colors=G[1:])
    r = rng(seed)
    for cx in (9, 23):  # hanging bunches, wide at the top
        for row in range(5):
            w = 3 - row // 2
            for k in range(-w, w + 1, 2):
                ball(s, cx + k + (row % 2), 15 + row * 2.6, berry, pal, hi=r.random() < .4)
    return fin(s)


def grape(): return vine_bunch(PURP, 6)
def sea_grape(): return vine_bunch(['#1a4a2a', '#2a7a4a', '#5ab87a', '#8ad8a0', '#c8f4d0'], 7, 1.4)
def mountain_berry(): return berry_bush(['#160a3a', '#2a1a5a', '#4a3a8a', '#7a6ab0', '#b0a0e0'], 10, 2.0, 8)
def sunberry(): return berry_bush(['#8a4a00', '#c87a00', '#ffb703', '#ffd050', '#fff0a0'], 10, 2.4, 9)


def hops():
    s = base(); stake(s, 16, 2)
    for y in range(4, 36, 3):  # the bine winding up the pole
        s.set(15 + (y // 3) % 3, y, '#4a8a3a')
    for x, y in ((12, 8), (20, 12), (11, 17), (21, 22), (12, 27), (20, 30)):
        s.shade(ellipse(x + (3 if x < 16 else -3), y + 2, 3, 2), None, 'form', colors=G[1:])
        s.shade(poly([(x - 2, y - 2), (x + 2, y - 2), (x + 2, y + 2), (x, y + 4), (x - 2, y + 2)]), None, 'sphere', colors=LGRN)  # the cone
        s.set(x - 1, y, '#e8f8b0'); s.set(x + 1, y + 2, '#3e7a30')
    return fin(s)


# ---------------------------------------------------------------- fruiting plants
def tomato():
    s = base(); stake(s, 22, 6)
    stalk(s, 15, 10, 1)
    for a, y in ((-2.6, 30), (-.5, 28), (-2.4, 22), (-.7, 19), (-2.2, 14), (-.9, 11)):
        leaf(s, 15, y, a, 7, 2.6)
    for x, y, r_ in ((10, 26, 3.2), (19, 24, 3.4), (12, 17, 3), (20, 15, 2.8), (16, 31, 3)):
        ball(s, x, y, r_, RED)
        s.fill({(x, y - r_ - 1), (x - 1, y - r_), (x + 1, y - r_)}, '#3e7a30')
    return fin(s)


def peppers(pal, long_=6, seed=10):
    s = base()
    stalk(s, 16, 14, 0)
    for a, y in ((-2.7, 31), (-.4, 30), (-2.5, 24), (-.6, 23), (-2.2, 17), (-.9, 16)):
        leaf(s, 16, y, a, 8, 2.6, DLEAF)
    for x, y in ((10, 19), (21, 18), (13, 26), (22, 26), (17, 31)):  # glossy pods hanging under the leaves
        s.shade(ellipse(x, y + 2, 2.2, 3), None, 'sphere', colors=pal)
        s.shade(poly([(x - 2, y + 3), (x + 2, y + 3), (x + 1, y + long_), (x, y + long_ + 1)]), None, 'sphere', colors=pal)
        s.fill({(x, y - 1), (x - 1, y), (x, y), (x + 1, y)}, '#3e7a30')
        s.set(x - 1, y + 2, '#ffffff')
    return fin(s)


def pepper(): return peppers(['#6a0a0a', '#a8181a', '#e8342a', '#f86a5a', '#ffb0a0'])
def dragon_pepper(): return peppers(['#3a0005', '#7a0a10', '#c8101a', '#ff3a1a', '#ffb070'], 8)


def eggplant():
    s = base(); bush(s, 7, 21, 10, DLEAF)
    for x, y in ((10, 24), (20, 23), (15, 29)):  # glossy teardrops with a green calyx
        s.shade(poly([(x - 2, y), (x + 2, y), (x + 4, y + 5), (x, y + 8), (x - 4, y + 5)]), None, 'sphere', colors=PURP)
        s.fill({(x - 2, y - 1), (x - 1, y - 1), (x, y - 1), (x + 1, y - 1), (x + 2, y - 1), (x, y - 2)}, '#4a8a3a')
        s.set(x - 2, y + 3, '#d8c0f0')
    return fin(s)


def emberfruit():
    s = base(); bush(s, 6, 22, 10, ['#1e2a14', '#3a3a1a', '#5a5020', '#7a6a2a', '#9a8a3a'])
    for x, y in ((10, 20), (21, 19), (15, 26), (23, 27), (8, 28)):  # glowing coals of fruit with a bright core
        ball(s, x, y, 2.8, ['#8a1a00', '#d84a10', '#ff6a1a', '#ffb040', '#fff0a0'])
        s.set(x, y, '#fff6c8')
    return fin(s)


# ---------------------------------------------------------------- tall grains and pods
def corn():
    s = base()
    for x, top in ((10, 4), (21, 6)):
        s.fill(line(x, 37, x, top) | line(x + 1, 37, x + 1, top), '#5a8a2a')
        for a, y in ((-2.6, 30), (-.4, 26), (-2.4, 20), (-.6, 15)):  # long arching leaves
            leaf(s, x, y, a, 9, 1.6, ['#2a4a1a', '#3e6a24', '#5a8a2a', '#7aa840', '#9ac458'])
        for k in (-2, 0, 2):  # the tassel
            s.fill(line(x, top, x + k, top - 3), '#e8d08a')
        cx, cy = x + 3, 21  # an ear: yellow kernels peeking out of the husk, silk at the tip
        s.shade(poly([(cx - 1, cy - 6), (cx + 2, cy - 6), (cx + 3, cy + 2), (cx, cy + 4), (cx - 2, cy + 2)]), None, 'cyl', colors=YEL)
        for k in range(-5, 2, 2):
            s.set(cx, cy + k, '#c09a20')
        s.fill(line(cx - 2, cy + 3, cx - 2, cy - 4) | line(cx + 3, cy + 3, cx + 3, cy - 3), '#7aa840')
        s.fill(line(cx, cy - 7, cx + 2, cy - 9), '#a8603a')
    return fin(s)


def grain(pal, awns=False, seed=12):
    s = base(); r = rng(seed)
    for i in range(7):
        x = 6 + i * 3 + r.randrange(-1, 2); top = 8 + r.randrange(0, 5); bend = r.randrange(-1, 2)
        s.fill(line(x, 37, x + bend, top + 6), '#b0a050' if pal is GOLD else '#a8a060')
        for k in range(5):  # the head: a column of grains in pairs
            y = top + k * 1.6
            s.set(x + bend - 1, round(y), pal[2 + (k % 2)]); s.set(x + bend + 1, round(y + .8), pal[3])
            s.set(x + bend, round(y), pal[1])
        if awns:
            s.fill(line(x + bend, top, x + bend - 2, top - 5) | line(x + bend + 1, top, x + bend + 3, top - 4), pal[4])
    for a in (-2.7, -.4):
        leaf(s, 16, 33, a, 9, 1.4, ['#5a6a2a', '#7a8a3a', '#9aa04a', '#b8b860', '#d0d080'])
    return fin(s)


def wheat(): return grain(GOLD)
def alpine_barley(): return grain(['#6a5a2a', '#9a8a4a', '#e8d080', '#f4e4a8', '#fff8d8'], True, 13)


def pods(pal, flowers='#ffffff'):
    s = base(); stake(s, 10, 4); stake(s, 22, 4)
    s.fill(line(10, 10, 22, 10) | line(10, 20, 22, 20), '#8a6a40')  # a little trellis
    for x in (12, 16, 20):
        s.fill(line(x, 37, x + 1, 6), '#5a9a38')
    for x, y in ((9, 12), (23, 15), (14, 24), (20, 28), (8, 27)):
        s.shade(ellipse(x, y, 3, 2.2), None, 'form', colors=G[1:])
    for x, y in ((14, 13), (19, 17), (13, 29), (20, 23)):  # pods with the peas showing as bumps
        s.shade(poly([(x - 1, y), (x + 1, y), (x + 2, y + 6), (x, y + 8), (x - 1, y + 6)]), None, 'cyl', colors=pal)
        for k in (2, 4, 6):
            s.set(x, y + k, pal[3])
    for x, y in ((18, 8), (11, 19)):
        s.set(x, y, flowers); s.set(x + 1, y, flowers); s.set(x, y + 1, '#f0d0e8')
    return fin(s)


def peapod(): return pods(LGRN)
def snowpea(): return pods(['#4a7a5a', '#7aaa8a', '#bfe6c8', '#dcf4e0', '#ffffff'], '#e0f0ff')


def rhubarb():
    s = base()
    for x, top, bend in ((9, 14, -3), (14, 10, -1), (18, 11, 1), (23, 15, 3)):  # red stalks, big crinkled leaves on top
        s.fill(line(x, 37, x + bend, top) | line(x + 1, 37, x + 1 + bend, top), '#c83a5a')
        s.fill(line(x + 1, 36, x + 1 + bend, top + 3), '#f07a90')
        s.shade(ellipse(x + bend, top - 3, 6, 4.5), None, 'form', colors=['#1e4a22', '#2e6a2e', '#4a8a3a', '#6aa848', '#8cc45a'])
        s.fill(line(x + bend, top, x + bend, top - 6), '#a8d070')
    return fin(s)


def amaranth():
    s = base(); stalk(s, 16, 12, 0, '#8a2a4a')
    for a, y in ((-2.5, 31), (-.6, 29), (-2.3, 24), (-.8, 22)):
        leaf(s, 16, y, a, 7, 2.4, ['#2a3a1a', '#4a4a2a', '#6a5a3a', '#8a6a4a', '#a87a5a'])
    for k in range(9):  # a drooping magenta plume
        x, y = 16 + k * 1.3, 8 + k * 1.9
        s.shade(ellipse(x, y, 3 - k * .2, 2.4), None, 'form', colors=['#5a0a2a', '#8a1a4a', '#c83a6a', '#e86a90', '#ffa8c0'])
    return fin(s)


# ---------------------------------------------------------------- roots (the top of the root shows above the soil)
def root_top(body, leaves, w=6, h=5, y=32, shape='round', top=None):
    s = base()
    for i, a in enumerate((-2.5, -2.0, -1.5, -1.0, -.6)):
        leaf(s, 16, y - h + 1, a, 9 + (i % 2) * 2, 2.4, leaves)
    if shape == 'long':  # a carrot or yam: a shoulder above the soil, tapering into it
        s.shade(poly([(16 - w, y - h), (16 + w, y - h), (16 + w - 1, y), (16, y + 5), (16 - w + 1, y)]), None, 'cyl', colors=body)
    else:
        s.shade(ellipse(16, y, w, h), None, 'sphere', colors=body)
    if top:  # a coloured crown (purple-topped turnips)
        s.shade(ellipse(16, y - h + 2, w - 1, 2.5), None, 'sphere', colors=top)
    s.set(16 - w // 2, y - h // 2, '#ffffff')
    return fin(s)


def feathery(s, cx, y):
    for k in range(7):  # carrot tops: fine, split fronds
        a = -2.8 + k * .45
        for j in range(1, 11):
            x_, y_ = cx + math.cos(a) * j, y + math.sin(a) * j
            s.set(round(x_), round(y_), G[2 + (j % 2)])
            if j % 3 == 0:
                s.set(round(x_ + math.cos(a + 1.2) * 2), round(y_ + math.sin(a + 1.2) * 2), G[3])


def carrot():
    s = Canvas(32, 40); soil_mound(s)
    feathery(s, 16, 30)
    s.shade(poly([(12, 29), (20, 29), (19, 33), (16, 38), (13, 33)]), None, 'cyl', colors=ORNG)
    for y in (31, 34):
        s.set(14, y, '#b05a10'); s.set(18, y + 1, '#b05a10')
    return fin(s)


def turnip(): return root_top(WHT, G, 6, 5, 32, top=PURP)
def radish(): return root_top(['#7a1028', '#b02a48', '#e04a6a', '#f07a90', '#ffb0c0'], G, 5, 4.5, 33)
def beet(): return root_top(DRED, ['#2a1a1a', '#5a1a2a', '#3e6a2e', '#5a8a3a', '#7aa848'], 6, 5, 32)
def yam(): return root_top(BRN, DLEAF, 6, 4, 32, 'long')
def ice_turnip(): return root_top(['#6a8aa8', '#a0c0d8', '#e0f4ff', '#f4fbff', '#ffffff'], BLUEG, 6, 5, 32, top=['#2a4a7a', '#3a6aa0', '#6aa0c8', '#9ac0e0', '#c8e0f4'])


def leek(white, leaves):
    s = base()
    for x in (11, 16, 21):  # a white shaft fanning into flat blue-green leaves
        s.shade(rect(x - 2, 22, 4, 15), None, 'cyl', colors=white)
        for a in (-2.2, -1.57, -.95):
            leaf(s, x, 23, a, 12, 1.8, leaves)
    return fin(s)


def frostleek(): return leek(['#8aa8b0', '#b8d0d8', '#cfe8ef', '#e8f8fc', '#ffffff'], BLUEG)


def potato():
    s = base(); bush(s, 8, 24, 11)
    for x, y in ((11, 18), (19, 16), (24, 21)):  # small white flowers
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
            s.set(x + dx, y + dy, '#ffffff')
        s.set(x, y, '#f2c040')
    for x, y in ((9, 35), (16, 36), (23, 35)):  # potatoes turned up at the foot
        s.shade(ellipse(x, y, 3.5, 2.3), None, 'sphere', colors=['#5a3a1a', '#8a6034', '#c79a5b', '#e0bc84', '#f4dcb0'])
        s.set(x + 1, y, '#6a4a24')
    return fin(s)


def garlic():
    s = base()
    for x in (9, 16, 23):  # flat upright leaves over a papery white bulb
        for a in (-1.9, -1.57, -1.25):
            leaf(s, x, 30, a, 13, 1.4, PALE)
        s.shade(ellipse(x, 32, 3.5, 3.2), None, 'sphere', colors=WHT)
        s.fill(line(x, 29, x, 35), '#d8d0c0'); s.set(x, 36, '#a8a090')
    return fin(s)


# ---------------------------------------------------------------- heads and leaves
def head(outer, inner, veins=None):
    s = base()
    for i in range(7):  # loose outer leaves
        a = -math.pi + (i + .5) / 7 * math.pi
        s.shade(ellipse(16 + math.cos(a) * 9, 31 + math.sin(a) * 5, 6, 4), None, 'form', colors=outer)
    s.shade(ellipse(16, 27, 8, 7), None, 'sphere', colors=inner)  # the tight head
    s.fill(line(16, 21, 13, 27) | line(16, 21, 19, 26), veins or inner[1])
    return fin(s)


def cabbage(): return head(['#2e5a24', '#4a8a3a', '#6aa848', '#8cc45a', '#b0d878'], ['#5a8a3a', '#8ab860', '#a8d878', '#c8ec98', '#e8f8c8'])
def redcabbage(): return head(['#2e4a2a', '#4a6a3a', '#5a8a4a', '#7aa860', '#9ac478'], ['#3a0a2a', '#5a1a4a', '#8a2a6a', '#aa4a8a', '#d080b0'], '#e8b0d0')


def kale():
    s = base()
    for i, (a, L) in enumerate(((-2.4, 13), (-2.0, 15), (-1.57, 16), (-1.15, 15), (-.75, 13))):  # tall curly leaves on stems
        x1, y1 = 16 + math.cos(a) * L, 36 + math.sin(a) * L
        s.fill(line(16, 36, round(x1), round(y1)), '#5a8a4a')
        for j in range(4, L, 2):
            x, y = 16 + math.cos(a) * j, 36 + math.sin(a) * j
            s.shade(ellipse(x, y, 2.6, 2), None, 'form', colors=['#163a2a', '#24503a', '#3a6a4a', '#5a8a5a', '#7aa878'])
            s.set(round(x + 2), round(y), '#24503a'); s.set(round(x - 2), round(y + 1), '#24503a')  # the frilled edge
    return fin(s)


def bokchoy():
    s = base()
    for x, a in ((11, -2.0), (14, -1.75), (18, -1.4), (21, -1.15)):  # white spoon stems with dark green blades
        x1, y1 = x + math.cos(a) * 12, 36 + math.sin(a) * 12
        s.fill(line(x, 36, round(x1), round(y1) + 4) | line(x + 1, 36, round(x1) + 1, round(y1) + 4), '#eef4e0')
        s.shade(ellipse(x1, y1, 3.5, 5), None, 'form', colors=['#1e4a22', '#2e6a2e', '#4a8a3a', '#6aa848', '#8cc45a'])
    return fin(s)


def artichoke():
    s = base()
    for a in (-2.8, -2.3, -.8, -.3):  # silvery jagged leaves
        leaf(s, 16, 34, a, 11, 2.6, GREY)
    stalk(s, 16, 16, 0, '#6a8a6a')
    for row in range(4):  # the scaled globe bud
        for k in range(-2 + row // 2, 3 - row // 2):
            s.shade(ellipse(16 + k * 2.6, 12 + row * 2.4, 2, 1.8), None, 'sphere', colors=['#2e4a3a', '#4a6a5a', '#6a9a5a', '#8ab878', '#b0d898'])
    s.set(16, 9, '#a07ac0')  # a hint of the purple tip
    return fin(s)


def meadowgrass():
    s = base(); r = rng(14)
    for i in range(13):  # a tall tuft with seed heads
        x = 5 + i * 1.8 + r.randrange(-1, 2); top = 6 + r.randrange(0, 10); b = r.randrange(-2, 3)
        s.fill(line(round(x), 37, round(x) + b, top), G[1 + i % 3])
        if i % 3 == 0:
            s.fill(line(round(x) + b, top, round(x) + b, top - 3), '#c8b878')
    return fin(s)


# ---------------------------------------------------------------- gourds
def gourd(pal, stripes=None, ribs=False, big=10, glow=False):
    s = base()
    s.fill(line(4, 36, 28, 34), '#3e7a30')  # the vine along the ground
    for x, y in ((6, 31), (26, 30), (21, 22)):
        s.shade(ellipse(x, y, 4, 3), None, 'form', colors=G[1:])
    s.shade(ellipse(15, 29, big, 7), None, 'sphere', colors=pal)
    if stripes:  # dark stripes curving with the rind, wide enough to read
        for k in (-7, -3, 1, 5):
            for y in range(23, 36):
                dx = round(k * (1 - ((y - 29) / 7) ** 2) ** .5) if abs(y - 29) < 7 else 0
                s.set(15 + dx, y, stripes); s.set(16 + dx, y, stripes)
    if ribs:
        for k in (-4, 0, 4):
            s.fill(line(15 + k, 23, 15 + k, 35), pal[1])
        s.fill(rect(14, 20, 3, 3), '#5a7a2a')
    if glow:
        for k in range(5):
            s.set(9 + k * 3, 27 + (k % 2) * 3, '#ffd040')
    s.set(11, 25, '#ffffff')
    return fin(s)


def melon(): return gourd(['#2a5a1a', '#4a8a2a', '#8ac850', '#b0e070', '#e0f8b0'], '#1e4a14')
def glacier(): return gourd(['#2a5a8a', '#5a8ab8', '#9fd8f0', '#c8ecf8', '#ffffff'], '#5a8ab8')
def cinder_melon(): return gourd(['#140a0a', '#2a1a1a', '#3a2a2a', '#5a4040', '#7a5a5a'], None, False, 10, True)
def pumpkin(): return gourd(ORNG, None, True)


# ---------------------------------------------------------------- flowers (each its own shape)
def stem_leaves(s, x, top):
    s.fill(line(x, 37, x, top), STEM)
    leaf(s, x, 32, -2.5, 6, 2); leaf(s, x, 29, -.6, 6, 2)


def tulip():
    s = base()
    for x, top, c in ((10, 14, ['#8a1a3a', '#d83a5a', '#ff6a8a', '#ff9ab0', '#ffd0e0']), (17, 10, ['#8a1a3a', '#d83a5a', '#ff6a8a', '#ff9ab0', '#ffd0e0']), (23, 15, ['#8a5a00', '#d89a10', '#ffd040', '#ffe880', '#fff8c8'])):
        s.fill(line(x, 37, x, top + 3), STEM)
        leaf(s, x, 33, -2.0, 8, 2); leaf(s, x, 31, -1.1, 7, 2)
        s.shade(poly([(x - 3, top - 3), (x - 1, top - 1), (x, top - 4), (x + 1, top - 1), (x + 3, top - 3), (x + 3, top + 2), (x, top + 4), (x - 3, top + 2)]), None, 'sphere', colors=c)  # a cup with three points
    return fin(s)


def sunflower():
    s = base()
    s.fill(line(16, 37, 16, 13) | line(17, 37, 17, 13), '#4a7a2a')
    for a, y in ((-2.6, 30), (-.5, 26), (-2.4, 21), (-.7, 18)):
        leaf(s, 16, y, a, 8, 3, G)
    for k in range(14):  # a big ring of yellow petals round a dark seed disc
        a = k / 14 * math.tau
        s.shade(ellipse(16 + math.cos(a) * 7, 9 + math.sin(a) * 7, 2.6, 2.6), None, 'sphere', colors=YEL)
    s.shade(ellipse(16, 9, 5, 5), None, 'sphere', colors=['#1a0e06', '#2a1a0a', '#4a2e14', '#6a4422', '#8a5a30'])
    for dx, dy in ((-2, -1), (1, -2), (2, 1), (-1, 2), (0, 0)):
        s.set(16 + dx, 9 + dy, '#8a6a30')
    return fin(s)


def poppy():
    s = base()
    for x, top in ((9, 14), (17, 9), (24, 16)):  # thin hairy stems, wide flat red cups with a black centre
        s.fill(line(x, 37, x + (1 if x < 16 else -1), top + 2), '#5a8a3a')
        for k in range(5):
            a = k / 5 * math.tau - .3
            s.shade(ellipse(x + math.cos(a) * 3, top + math.sin(a) * 2.4, 2.8, 2.4), None, 'sphere', colors=['#7a0a0a', '#b81a1a', '#e8342a', '#f86a4a', '#ffa080'])
        s.fill(ellipse(x, top, 1.4, 1.2), '#1a1010'); s.set(x, top - 1, '#3a2a40')
    leaf(s, 16, 34, -2.6, 8, 2, PALE); leaf(s, 16, 34, -.5, 8, 2, PALE)
    return fin(s)


def star(s, x, y, r_, pal):
    pts = []
    for k in range(10):
        a = k / 10 * math.tau - math.pi / 2
        rr = r_ if k % 2 == 0 else r_ * .45
        pts.append((x + math.cos(a) * rr, y + math.sin(a) * rr))
    s.shade(poly(pts), None, 'sphere', colors=pal)


def starbloom():
    s = base()
    for x, top in ((10, 13), (18, 9), (24, 16)):
        stem_leaves(s, x, top)
        star(s, x, top, 5, ['#4a5a9a', '#7a8ad0', '#c8d8ff', '#e8f0ff', '#ffffff'])
        s.set(x, top, '#fff8c0')
    return fin(s)


def moonblossom():
    s = base()
    for x, top in ((11, 12), (21, 14)):  # pale crescent petals that curl round a glowing heart
        stem_leaves(s, x, top)
        for k in range(6):
            a = k / 6 * math.tau
            s.shade(ellipse(x + math.cos(a) * 3.5, top + math.sin(a) * 3, 2.4, 1.6), None, 'sphere', colors=['#5a4a8a', '#8a7ab8', '#d8c8ff', '#ece4ff', '#ffffff'])
        s.fill(ellipse(x, top, 1.6, 1.6), '#fff4c0')
    return fin(s)


def saffron():
    s = base()
    for x, top in ((9, 22), (16, 19), (23, 23)):  # low purple crocus cups with red threads standing out
        for a in (-1.8, -1.35):
            leaf(s, x, 36, a, 12, 1, PALE)
        s.fill(line(x, 37, x, top + 3), '#e8e0c8')
        s.shade(poly([(x - 3, top - 4), (x, top - 6), (x + 3, top - 4), (x + 3, top + 2), (x, top + 4), (x - 3, top + 2)]), None, 'sphere', colors=PURP)
        s.fill(line(x, top, x - 2, top - 5) | line(x, top, x + 2, top - 5), '#e83a1a')
    return fin(s)


def snow_lotus():
    s = base()
    s.shade(ellipse(16, 34, 12, 3), None, 'form', colors=BLUEG)  # pads
    for row, (rr, n, yy) in enumerate(((9, 9, 29), (6, 7, 26), (3.5, 5, 24))):  # layered pointed petals
        for k in range(n):
            a = math.pi + (k + .5) / n * math.pi
            x, y = 16 + math.cos(a) * rr, yy + math.sin(a) * rr * .8
            s.shade(poly([(x - 2, y + 2), (16 + math.cos(a) * (rr + 4), yy + math.sin(a) * (rr + 4) * .8), (x + 2, y + 2)]), None, 'sphere', colors=['#8aa0b8', '#c8d8e8', '#f4f8ff', '#ffffff', '#ffffff'])
    s.fill(ellipse(16, 25, 2, 1.4), '#ffe080')
    return fin(s)


def flax():
    s = base(); r = rng(16)
    for i in range(7):  # many thin stems, small sky-blue five-petal flowers
        x = 6 + i * 3 + r.randrange(-1, 2); top = 8 + r.randrange(0, 10)
        s.fill(line(x, 37, x, top), '#6a9a4a')
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)):
            s.set(x + dx, top + dy, '#6a8ad8')
        s.set(x, top, '#f4f0c0')
    return fin(s)


CROP_ART = {
    'strawberry': strawberry, 'blueberry': blueberry, 'cranberry': cranberry, 'grape': grape, 'sea_grape': sea_grape,
    'mountain_berry': mountain_berry, 'sunberry': sunberry, 'hops': hops,
    'tomato': tomato, 'pepper': pepper, 'dragon_pepper': dragon_pepper, 'eggplant': eggplant, 'emberfruit': emberfruit,
    'corn': corn, 'wheat': wheat, 'alpine_barley': alpine_barley, 'peapod': peapod, 'snowpea': snowpea, 'rhubarb': rhubarb, 'amaranth': amaranth,
    'turnip': turnip, 'radish': radish, 'beet': beet, 'yam': yam, 'carrot': carrot, 'ice_turnip': ice_turnip, 'frostleek': frostleek,
    'potato': potato, 'garlic': garlic,
    'cabbage': cabbage, 'redcabbage': redcabbage, 'kale': kale, 'bokchoy': bokchoy, 'artichoke': artichoke, 'meadowgrass': meadowgrass,
    'melon': melon, 'glacier': glacier, 'cinder_melon': cinder_melon, 'pumpkin': pumpkin,
    'tulip': tulip, 'sunflower': sunflower, 'poppy': poppy, 'starbloom': starbloom, 'moonblossom': moonblossom, 'saffron': saffron,
    'snow_lotus': snow_lotus, 'flax': flax,
}
SPRITES = {f'crop_{k}_3': fn for k, fn in CROP_ART.items()}
