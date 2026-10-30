"""Hand-pixelled fishing art: big harpoon fish, crustaceans, the harpoon, and the crab trap.
Icons are 32x32 (gi_<item>, used by itemIcon through x_gear.js); the trap in the water is
crabtrap.0 (empty, buoy only) and crabtrap.1 (something inside: the buoy bobs low)."""
from px import Canvas, poly, rect, line, ellipse


def P(pts):
    return poly([(round(x), round(y)) for x, y in pts])


def fin(s):
    s.outline()
    return s


def shade_fill(s, mask, cols):
    """Flat cel shading by hand: the top rows of the shape light, the underside dark."""
    mask = set(mask)
    for x, y in mask:
        up = (x, y - 1) in mask and (x, y - 2) in mask
        down = (x, y + 1) in mask and (x, y + 2) in mask
        s.set(x, y, cols[3] if not up else cols[0] if not down else cols[1] if (x + y) % 7 == 0 else cols[2])


def fishbody(body, tail, fins, cols, belly=None, eye=(0, 0), extra=None):
    s = Canvas(32, 32)
    shade_fill(s, P(tail), [cols[0], cols[1], cols[1], cols[2]])
    for f in fins:
        shade_fill(s, P(f), [cols[0], cols[1], cols[1], cols[2]])
    shade_fill(s, P(body), cols)
    if belly:
        for x, y in P(belly):
            if s.get(x, y)[3]:
                s.set(x, y, belly_col(cols))
    ex, ey = eye
    s.set(ex, ey, '#101418'); s.set(ex - 1, ey - 1, '#ffffff')
    if extra:
        extra(s)
    return fin(s)


def belly_col(cols):
    return '#e8ecf0'


SHARK = ['#2e3a48', '#56687c', '#7e94aa', '#b0c4d6']
SWORD = ['#1e2a54', '#38509a', '#5a7ad0', '#9ab4f0']
TUNA = ['#1a2a40', '#2e4a6e', '#4e7aa8', '#8ab0d8']
MANTA = ['#1e1e2a', '#383848', '#58586e', '#8a8aa0']
STURG = ['#3a3428', '#5e5442', '#867a62', '#b0a488']


def shark():
    def ext(s):
        for x in range(19, 25, 2):
            s.set(x, 18, '#2a3440')                        # gill slits
        s.fill(line(25, 21, 29, 20), '#f0f0f0')            # teeth
    return fishbody([(3, 17), (10, 13), (20, 11), (28, 14), (31, 17), (28, 21), (18, 23), (8, 21)],
                    [(5, 17), (0, 9), (2, 16), (0, 24)], [[(14, 13), (18, 4), (20, 12)], [(16, 21), (12, 28), (20, 22)]], SHARK,
                    belly=[(8, 19), (28, 18), (26, 22), (10, 22)], eye=(25, 15), extra=ext)


def swordfish():
    def ext(s):
        s.fill(line(29, 14, 31, 13) | line(26, 15, 31, 14), '#c8d0e0')   # the sword
    return fishbody([(4, 17), (10, 13), (20, 12), (27, 15), (25, 19), (16, 22), (8, 21)],
                    [(5, 17), (0, 10), (3, 17), (0, 24)], [[(12, 13), (15, 3), (22, 12)], [(14, 21), (12, 26), (18, 21)]], SWORD,
                    belly=[(8, 19), (25, 17), (22, 21), (10, 21)], eye=(23, 15), extra=ext)


def tuna():
    def ext(s):
        for x in range(10, 22, 3):
            s.set(x, 22, '#ffd040')                       # yellow finlets
    return fishbody([(3, 17), (10, 11), (20, 10), (29, 15), (27, 20), (18, 24), (8, 22)],
                    [(5, 17), (0, 10), (3, 17), (0, 24)], [[(14, 11), (17, 6), (20, 11)]], TUNA,
                    belly=[(8, 19), (27, 17), (24, 22), (10, 22)], eye=(25, 15), extra=ext)


def manta():
    s = Canvas(32, 32)
    shade_fill(s, P([(16, 6), (22, 12), (31, 16), (22, 20), (16, 26), (10, 20), (1, 16), (10, 12)]), MANTA)
    s.fill(line(16, 26, 16, 31), MANTA[1])
    s.set(13, 9, '#101418'); s.set(19, 9, '#101418')
    for x, y in ((8, 16), (12, 14), (20, 14), (24, 16)):
        s.set(x, y, MANTA[3])
    return fin(s)


def sturgeon():
    def ext(s):
        for x in range(8, 26, 3):
            s.set(x, 13, '#d8ccb0')                       # bony plates along the back
    return fishbody([(3, 17), (9, 13), (22, 13), (30, 16), (29, 18), (20, 21), (8, 20)],
                    [(5, 17), (0, 11), (3, 17), (1, 22)], [[(18, 20), (16, 25), (22, 21)]], STURG,
                    belly=[(8, 18), (29, 17), (22, 20), (10, 20)], eye=(25, 15), extra=ext)


def crab_item():
    s = Canvas(32, 32)
    C = ['#6a1a10', '#a8341a', '#d8542a', '#f08a5a']
    for d in (-1, 1):
        for i in range(3):
            s.fill(line(16 + d * 7, 20, 16 + d * (12 + i * 2), 22 + i * 2) | line(16 + d * (12 + i * 2), 22 + i * 2, 16 + d * (13 + i * 2), 27), C[1])
        shade_fill(s, P([(16 + d * 9, 13), (16 + d * 14, 8), (16 + d * 15, 12), (16 + d * 12, 15)]), C)
        s.fill(line(16 + d * 13, 8, 16 + d * 15, 6), C[2])
    shade_fill(s, P([(6, 18), (10, 13), (22, 13), (26, 18), (22, 23), (10, 23)]), C)
    s.set(13, 12, '#101418'); s.set(19, 12, '#101418')
    return fin(s)


def prawn():
    s = Canvas(32, 32)
    C = ['#a83a2a', '#e06a4a', '#f89a7a', '#ffd0b8']
    pts = []
    for k in range(9):
        a = k / 8 * 2.6
        pts.append((16 + 9 * __import__('math').cos(a + 1.4), 16 + 9 * __import__('math').sin(a + 1.4)))
    for i, (x, y) in enumerate(pts):
        r = 3.4 - i * .25
        shade_fill(s, ellipse(x, y, r, r), C)
        s.set(round(x), round(y - r), C[3])
    s.fill(line(round(pts[0][0]), round(pts[0][1]), 30, 4) | line(round(pts[0][0]), round(pts[0][1]), 28, 2), '#f0c0a0')  # feelers
    s.fill(P([(round(pts[-1][0]) - 3, round(pts[-1][1])), (round(pts[-1][0]) - 6, round(pts[-1][1]) - 3), (round(pts[-1][0]) - 6, round(pts[-1][1]) + 3)]), C[1])
    s.set(round(pts[0][0]) + 1, round(pts[0][1]) - 1, '#101418')
    return fin(s)


def crayfish():
    s = Canvas(32, 32)
    C = ['#4a2a18', '#7a4426', '#a8643a', '#c88a5a']
    shade_fill(s, P([(4, 17), (14, 14), (22, 15), (24, 18), (14, 21), (4, 19)]), C)
    for x in range(6, 14, 3):
        s.set(x, 15, C[3])
    shade_fill(s, P([(22, 14), (28, 9), (31, 11), (26, 16)]), C); shade_fill(s, P([(22, 19), (28, 24), (31, 22), (26, 18)]), C)
    s.fill(P([(2, 15), (4, 17), (2, 20)]), C[1])
    for x in (12, 16, 20):
        s.fill(line(x, 20, x - 1, 25), C[1])
    s.set(22, 16, '#101418')
    return fin(s)


def lobster_item():
    s = Canvas(32, 32)
    C = ['#2a1e40', '#3e3060', '#5a4a8a', '#8a7ab8']
    shade_fill(s, P([(3, 16), (12, 13), (22, 14), (25, 17), (14, 20), (3, 19)]), C)
    for x in range(5, 13, 2):
        s.set(x, 14, C[3])
    shade_fill(s, P([(22, 13), (27, 6), (31, 6), (30, 10), (26, 15)]), C); shade_fill(s, P([(22, 18), (27, 26), (31, 26), (30, 22), (26, 17)]), C)
    s.fill(P([(1, 13), (4, 17), (1, 21)]), C[1])
    s.fill(line(23, 15, 31, 2) | line(23, 16, 30, 0), '#c8a0a0')
    s.set(23, 15, '#101418')
    return fin(s)


def snail():
    s = Canvas(32, 32)
    shade_fill(s, P([(4, 24), (26, 24), (30, 21), (26, 20), (6, 21)]), ['#4a3e30', '#7a6a52', '#a8967a', '#c8b89a'])
    shade_fill(s, ellipse(14, 16, 8, 7), ['#5a3018', '#8a5028', '#b87838', '#d8a060'])
    for k in range(2):
        s.fill(ellipse(14, 16, 6 - k * 2, 5 - k * 2) - ellipse(14, 16, 5 - k * 2, 4 - k * 2), '#4a2810')
    s.fill(line(26, 20, 28, 15) | line(28, 20, 31, 16), '#a8967a'); s.set(28, 15, '#101418'); s.set(31, 16, '#101418')
    return fin(s)


def harpoon():
    s = Canvas(32, 32)
    s.fill(line(3, 29, 24, 8) | line(4, 29, 25, 8), '#8a5a30'); s.fill(line(5, 29, 25, 9), '#5a3a1a')
    s.fill(line(2, 30, 6, 26), '#c8b088')
    s.fill(P([(24, 8), (31, 1), (27, 10)]), '#b8bec8'); s.fill(P([(24, 8), (31, 1), (22, 6)]), '#d8dee8')
    s.fill(line(25, 11, 22, 13) | line(21, 5, 23, 3), '#7e8492')  # barbs
    s.fill(line(6, 27, 10, 31) | line(10, 31, 14, 29), '#e8dcc0')  # line
    return fin(s)


def trap_item():
    s = Canvas(32, 32)
    shade_fill(s, P([(4, 12), (24, 8), (28, 22), (8, 26)]), ['#4a2e1a', '#7a4e2c', '#a8743f', '#c8925a'])
    for k in range(5):
        s.fill(line(6 + k * 4, 12 - k, 10 + k * 4, 25 - k), '#4a2e1a')
    for k in range(3):
        s.fill(line(5, 15 + k * 4, 26, 11 + k * 4), '#4a2e1a')
    s.fill(ellipse(26, 6, 3, 3), '#d8342a'); s.fill(ellipse(26, 5, 2, 1), '#ffffff')
    s.fill(line(24, 8, 22, 10), '#e8dcc0')
    return fin(s)


def trap_water(full):
    """The trap lies on the bottom; all you see is its rope and a red buoy, low and bobbing when something's inside."""
    s = Canvas(32, 32)
    y = 16 + (3 if full else 0)
    s.fill(ellipse(16, y + 4, 8, 2), (20, 40, 70, 90))       # the trap's shadow under the surface
    for x in range(9, 24, 3):
        s.set(x, y + 4, (60, 90, 120, 140))
    s.fill(line(16, y + 3, 16, y - 1), '#e8dcc0')
    s.fill(ellipse(16, y - 4, 4, 4), '#d8342a'); s.fill(ellipse(16, y - 3, 4, 2) - ellipse(16, y - 4, 4, 4), '#a8241a')
    s.fill(line(12, y - 4, 20, y - 4), '#ffffff'); s.set(14, y - 6, '#ff8a7a')
    s.fill(line(10, y + 1, 22, y + 1), (200, 230, 255, 160))  # ripple ring
    return fin(s)


SPRITES = {'gi_shark': shark, 'gi_swordfish': swordfish, 'gi_tuna': tuna, 'gi_manta': manta, 'gi_sturgeon': sturgeon,
           'gi_mud_crab': crab_item, 'gi_prawn': prawn, 'gi_crayfish': crayfish, 'gi_rock_lobster': lobster_item, 'gi_river_snail': snail,
           'gi_harpoon': harpoon, 'gi_crab_trap': trap_item, 'crabtrap': lambda: [trap_water(0), trap_water(1)]}
