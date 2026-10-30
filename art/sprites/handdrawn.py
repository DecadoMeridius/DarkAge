"""Hand-pixelled creatures: drawn pixel by pixel as character grids, not built from shapes.

Grid letters:  . empty
  b  body region (ch 0)        m  second colour region (ch 1)      d  far-side body (ch 0, a tone darker)
  1 2 3 4  body tones dark->light (ch 0, levels 0-3), placed by hand
  5 6 7 8  second-colour tones (ch 1, levels 0-3)
  E eye (swappable)  W white  N nose/claw black  T tooth  R red  O fire orange  Y fire yellow
  G g pine greens  C crystal teal  I J ice light / ice shade
Region letters are cel shaded flat (light on top edges, shadow on the bottom edges, base inside), like
the characters; every hand-placed digit wins over that. A selective outline is added at the end.
"""
from px import Canvas
from sprites.creatures import C, EYE

FIXED = {'E': EYE, 'W': '#f4ece0', 'N': '#1a1210', 'T': '#f0e8d8', 'R': '#d8342a', 'O': '#ff8a2a', 'Y': '#ffd860', 'G': '#2e5a26', 'g': '#5a8a3a', 'C': '#4ad8b8', 'I': '#c8ecff', 'J': '#7ab8e0'}


def grid_sprite(rows, W, H):
    rows = [r.ljust(W, '.')[:W] for r in rows] + ['.' * W] * (H - len(rows))
    s = Canvas(W, H)
    reg = lambda x, y: rows[y][x] if 0 <= x < W and 0 <= y < H else '.'
    for y in range(H):
        for x in range(W):
            ch = rows[y][x]
            if ch == '.':
                continue
            if ch in FIXED:
                s.set(x, y, FIXED[ch]); continue
            if ch in '1234':
                s.set(x, y, C(0)[int(ch) - 1]); continue
            if ch in '5678':
                s.set(x, y, C(1)[int(ch) - 5]); continue
            same = lambda xx, yy: reg(xx, yy) == ch
            lvl = 2
            if not same(x, y - 1) or (not same(x, y - 2) and same(x - 1, y - 1) is False):
                lvl = 3                       # lit top edge
            elif not same(x, y + 1) or not same(x, y + 2):
                lvl = 1                       # shadowed underside
            if ch == 'd':
                lvl = max(0, lvl - 1)
            s.set(x, y, (C(1) if ch == 'm' else C(0))[lvl])
    s.outline()
    return s


# The grey wolf, facing right, 54x40. Two frames: legs mid-stride and passing.
WOLF_TOP = [
    "......................................................",
    "......................................................",
    "............................................1.........",
    "........................................1..151........",
    "........................................151b561.......",
    ".......................................1b5bbbb1.......",
    "......................................1bbbbbbbb1......",
    ".....................................mbbbbbbbbbb1.....",
    "....................................mmbbbbWEbbbbbb1...",
    "...................................mmmbbbbbbbbbbbbbb1.",
    "..................................mmmmbbbbbbbbbbbbbbNN",
    ".........................bbbbbbbbmmmmmmbbbbbbb2222221.",
    "..................bbbbbbbbbbbbbbbbmmmmmmbbbbb1TT1T1...",
    "............bbbbbbbbbbbbbbbbbbbbbbbmmmmmmbbbb21.......",
    "..........bbbbbbbbbbbbbbbbbbbbbbbbbbmmmmmmbbb1........",
    "........bbbbbbbbbbbbbbbbbbbbbbbbbbbbbmmmmmmb1.........",
    "......bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbmmmmmb..........",
    "....mmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbmmmmb..........",
    "...mmmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbmmmb..........",
    "..mmmmbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbmmb..........",
    "..mmmm.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..........",
    ".mmmm..bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..........",
    ".mmmm..bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..........",
    "mmmm....bbbbbbbbbbbb.....bbbbbbbbbbbbbbbbbbb..........",
    "mmm.....bbbbbbbbbbb..........bbbbbbbbbbbbbbb..........",
    "mm......bbbbbbbbbb..............bbbbbbbbbbb...........",
    "m.......bbbbbbbbb................bbbbbbbbb............",
]
# legs, rows 27-39, for the two frames (d = far legs, b = near legs)
WOLF_LEGS = [[
    ".........bbbbbbb..................bbbbbbbb............",
    "........dbbbbbb...................dbbbbbbb............",
    ".......ddbbbbb....................ddbbbbbb............",
    "......ddd.bbbb....................dd.bbbb.............",
    ".....ddd..bbbb...................ddd.bbbb.............",
    ".....dd....bbb...................dd..bbbb.............",
    "....dd.....bbbb..................dd...bbb.............",
    "....dd......bbb.................ddd...bbb.............",
    "....dd......bbb.................dd....bbb.............",
    "...ddd......bbb.................dd....bbbb............",
    "...dd.......bbbb...............ddd....bbbbb...........",
    "..dddN......bbbbNN.............ddNN...bbbbbNN.........",
    "..NNN.......NN.NN..............NN.N...NN.NNN..........",
], [
    ".........bbbbbbb..................bbbbbbbb............",
    ".........dbbbbbb..................bdbbbbbb............",
    "..........dbbbbb..................bbdbbbbb............",
    "..........ddbbbb..................bbbdbbb.............",
    ".........bdd.bbb..................bbb.ddb.............",
    "........bbdd..bb.................bbb...dd.............",
    "........bb.dd.bbb...............bbb....dd.............",
    ".......bbb..dd.bb...............bb.....ddd............",
    ".......bb...dd..bb.............bbb......dd............",
    "......bbb...ddd.bb.............bb.......dd............",
    "......bb.....dd..bbb..........bbb.......ddd...........",
    ".....bbbNN...dddNNbN.........bbbNN......dddN..........",
    ".....NNN.....NNN.NN..........NNN........NNNN..........",
]]


# hand-placed details over the grid: (row, column, pixels)
WOLF_DETAIL = [
    (11, 25, 'mmmmmmmmm'), (12, 18, 'mmmmmmmmmmmmmmmm'), (13, 12, 'mmmmmmmmmmmmmmmmmmmm'), (14, 10, 'mmmmm'), (14, 22, 'mmmmmmmmm'),
    (14, 15, '7'), (13, 26, '7'), (12, 31, '7'),                                   # light tips in the saddle fur
    (15, 33, '44'), (16, 34, '44'), (17, 35, '4'),                                 # shoulder catching the light
    (18, 20, '2'), (19, 21, '2'), (20, 22, '2'), (19, 28, '2'), (20, 29, '2'), (21, 30, '2'), (18, 13, '2'), (19, 14, '2'),  # fur strokes
    (21, 38, '2'), (22, 39, '2'), (20, 15, '4'), (17, 11, '4'),
    (16, 4, 'mm'), (17, 2, 'mm'), (18, 1, 'm'), (19, 0, 'mm'), (20, 0, 'm'), (24, 3, 'm'), (25, 2, 'mm'), (26, 1, 'mm'), (27, 0, 'mm'),  # a fuller brush
    (26, 0, '8'), (27, 1, '8'), (23, 1, '7'), (21, 3, '7'),                        # pale tail tip and highlights
    (7, 45, '2'), (8, 44, '2'), (10, 47, '4'), (9, 50, '4'), (11, 46, '1'),        # brow, muzzle light, lip line
]


def wolf_hand(f):
    rows = [list(r.ljust(54, '.')) for r in WOLF_TOP + WOLF_LEGS[f]]
    for y, x, px in WOLF_DETAIL:
        for i, ch in enumerate(px):
            if 0 <= y < len(rows) and 0 <= x + i < 54:
                rows[y][x + i] = ch
    return grid_sprite([''.join(r) for r in rows], 54, 40)




# ---------- composing frames from hand-drawn parts ----------
SWAP = {'b': 'd', 'd': 'b'}


def mirror(grid):
    return [r[::-1] for r in grid]


def swapped(grid):
    return [''.join(SWAP.get(c, c) for c in r) for r in grid]


def build(W, H, parts):
    """parts: (grid, x, y) stamped in order; '.' is transparent."""
    rows = [['.'] * W for _ in range(H)]
    for grid, x0, y0 in parts:
        for y, r in enumerate(grid):
            for x, c in enumerate(r):
                if c != '.' and 0 <= x0 + x < W and 0 <= y0 + y < H:
                    rows[y0 + y][x0 + x] = c
    return grid_sprite([''.join(r) for r in rows], W, H)


SPRITES = {}


def register(name, walk, atk=None, prefix='en_'):
    SPRITES[prefix + name] = lambda: [f() for f in walk]
    if atk:
        SPRITES[prefix + name + '_atk'] = lambda: [f() for f in atk]


def with_detail(grid, detail, W):
    rows = [list(r.ljust(W, '.')) for r in grid]
    for y, x, px in detail:
        for i, ch in enumerate(px):
            if 0 <= y < len(rows) and 0 <= x + i < W:
                rows[y][x + i] = ch
    return [''.join(r) for r in rows]


# ---------- wolf (54x40): four-step walk, crouched wind-up, lunge with open jaws ----------
WOLF_BODY = with_detail(WOLF_TOP, WOLF_DETAIL, 54)
WOLF_JAW = ["..1TT1T1T.", ".1NNNNNNN1", ".bTbTbTbb1", "..bbbbbb1."]
register('wolf', [
    lambda: build(54, 40, [(WOLF_BODY, 0, 0), (WOLF_LEGS[0], 0, 27)]),
    lambda: build(54, 40, [(WOLF_BODY, 0, 0), (WOLF_LEGS[1], 0, 27)]),
    lambda: build(54, 40, [(WOLF_BODY, 0, 0), (swapped(WOLF_LEGS[0]), 0, 27)]),
    lambda: build(54, 40, [(WOLF_BODY, 0, 0), (swapped(WOLF_LEGS[1]), 0, 27)]),
], [
    lambda: build(54, 40, [(WOLF_BODY, -2, 2), (WOLF_LEGS[1][2:], -1, 29), (["1T1T1"], 46, 14)]),   # crouched, snarling
    lambda: build(54, 40, [(WOLF_BODY, 1, 1), (WOLF_JAW, 45, 12), (WOLF_LEGS[0], 1, 28)]),      # lunging, jaws open
])


# ---------- slime (36x36): a squash-and-stretch hop cycle ----------
SLIME_MID = [
    "............bbbbbbbbbbbb............",
    "..........bbbbbbbbbbbbbbbb..........",
    ".........bbbb44bbbbbbbbbbbb.........",
    "........bbb44bbbbbbbbbbbbbbb........",
    ".......bbb44bbbbbbbbbbbbbbbbb.......",
    "......bbbb4bbbbbbbbbbbbbbbbbbb......",
    "......bbbbbbbbbbbbbbbbbbbbbbbb......",
    ".....bbbbbbbbbbbWbbbbbbWbbbbbbb.....",
    ".....bbbbbbbbbbbEbbbbbbEbbbbbbb.....",
    ".....bbbbbbbbbbbEbbbbbbEbbbbbbb.....",
    "....bbbbbbbbbbbbbbbbbbbbbbbbbbbb....",
    "....bbbbbbbbbbbbbb1111bbbbbbbbbb....",
    "....bbbbbbbbb22bbbbbbbbbbbbbbbbb....",
    "....bbbbbb4bb222bbbbbbbbbbb4bbbb....",
    "...bbbbbbbbbbb2bbbbbbbbbbbbbbbbbb...",
    "...bbbbbbbbbbbbbbbbbbbbbbb22bbbbb...",
    "..bbbbbbbbbbbbbbbbbbbbbbbb2bbbbbbb..",
    ".bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.",
    ".bb.bbbbbbbbbbbbbbbbbbbbbbbbbbb.bbb.",
    "..b..bbbbbbbbbbbbbbbbbbbbbbbbb...b..",
]
SLIME_TALL = [
    ".............bbbbbbbbbb.............",
    "............bbbbbbbbbbbb............",
    "...........bb44bbbbbbbbbb...........",
    "..........bb44bbbbbbbbbbbb..........",
    "..........bb4bbbbbbbbbbbbb..........",
    ".........bbbbbbbbbbbbbbbbbb.........",
    ".........bbbbbbbbbbbbbbbbbb.........",
    ".........bbbbbWbbbbbbWbbbbb.........",
    ".........bbbbbEbbbbbbEbbbbb.........",
    ".........bbbbbEbbbbbbEbbbbb.........",
    "........bbbbbbbbbbbbbbbbbbbb........",
    "........bbbbbbbb1111bbbbbbbb........",
    "........bbbbbbbbbbbbbbbbbbbb........",
    "........bbbb22bbbbbbbbbbbbbb........",
    "........bbbbb2bbbbbbbbb4bbbb........",
    ".......bbbbbbbbbbbbbbbbbbbbbb.......",
    ".......bbbbbbbbbbbbbbbb22bbbb.......",
    ".......bbbbbbbbbbbbbbbbbbbbbb.......",
    "......bbbbbbbbbbbbbbbbbbbbbbbb......",
    "......bbbbbbbbbbbbbbbbbbbbbbbb......",
    ".....bbbbbbbbbbbbbbbbbbbbbbbbbb.....",
    "....bbbbbbbbbbbbbbbbbbbbbbbbbbbb....",
    "....bb.bbbbbbbbbbbbbbbbbbbbbb.bb....",
    ".....b..bbbbbbbbbbbbbbbbbbbb...b....",
]
SLIME_WIDE = [
    "..........bbbbbbbbbbbbbbbb..........",
    ".......bbbb44bbbbbbbbbbbbbbbb.......",
    ".....bbbb44bbbbbbbbbbbbbbbbbbbbb....",
    "....bbbb4bbbbbbbWbbbbbbbbWbbbbbbb...",
    "...bbbbbbbbbbbbbEbbbbbbbbEbbbbbbbb..",
    "..bbbbbbbbbbbbbbEbbb1111bEbbbbbbbbb.",
    "..bbbbbbbb22bbbbbbbbbbbbbbbbbbbbbbb.",
    ".bbbbbbbbbb222bbbbbbbbbbbbbbbb4bbbbb",
    ".bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbb22bbbbbbb",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "bbb.bbbbbbbbbbbbbbbbbbbbbbbbbbbbb.bb",
    ".b...bbbbbbbbbbbbbbbbbbbbbbbbbbb..b.",
]
SLIME_LUNGE = [  # stretched forward (to the right) for the strike
    "...............bbbbbbbbbbb..........",
    "............bbbbbbbbbbbbbbbbb.......",
    "..........bbbb44bbbbbbbbbbbbbbb.....",
    ".........bbb44bbbbbbbbbbbbbbbbbbb...",
    "........bbb4bbbbbbbbbbbbWbbbbbWbbbb.",
    ".......bbbbbbbbbbbbbbbbbEbbbbbEbbbbb",
    "......bbbbbbbbbbbbbbbbbbEbbbbbEbbbbb",
    ".....bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ".....bbbbbbbbb22bbbbbbbbbbb1NNNN1bbb",
    "....bbbbbbbbbbb2bbbbbbbbbbbb1NN1bbbb",
    "....bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.",
    "...bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb..",
    "..bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...",
    ".bb.bbbbbbbbbbbbbbbbbbbbbbbbbbb.....",
    "..b..bbbbbbbbbbbbbbbbbbbbbbbbb......",
]
def slime_eyes(grid):
    out = []
    for r in grid:
        r = r.replace('W', 'WE') if 'W' in r else r.replace('E', 'EE')
        out.append(r[:36])
    return out


SLIME_MID, SLIME_TALL, SLIME_WIDE, SLIME_LUNGE = [slime_eyes(g) for g in (SLIME_MID, SLIME_TALL, SLIME_WIDE, SLIME_LUNGE)]
register('slime', [
    lambda: build(36, 36, [(SLIME_MID, 0, 14)]), lambda: build(36, 36, [(SLIME_TALL, 0, 10)]),
    lambda: build(36, 36, [(SLIME_MID, 0, 14)]), lambda: build(36, 36, [(SLIME_WIDE, 0, 21)]),
], [lambda: build(36, 36, [(SLIME_WIDE, 0, 21)]), lambda: build(36, 36, [(SLIME_LUNGE, 0, 19)])])


# ---------- bat (40x32, seen from the front): four wingbeats, a rear-up and a fang dive ----------
BAT_BODY = [
    "..1.....1..",
    "..15...51..",
    "..b5bbb5b..",
    "..bbbbbbb..",
    ".bbWEbEWbb.",
    ".bbbbbbbbb.",
    ".bbbTbTbbb.",
    "..bbbbbbb..",
    "..bbmbmbb..",
    "..bbbmbbb..",
    "...bbbbb...",
    "...b.b.b...",
    "...N...N...",
]
BAT_WING = {  # the left wing (mirrored for the right): membrane with finger bones (5), anchored at its right edge
    'up': ["5.............", "55............", ".5m5..........", ".mm5m5........", "..mmm5mm5.....", "..mmmm5mmm5mm.", "...mmmmm5mmmmm",
           "...m.mmmm5mmmm", "....m..mmm.mmm", ".........m...m"],
    'mid': ["5555...........", "mmmm555........", "mmmmmmmm555mmmm", "m.mmm5mmmmm5mmm", "...m..mm5mmmmmm", "........m..mmmm"],
    'down': ["..........mmmm", ".......mmmmmmm", "....mmmmmmmmmm", "..mmmmm5mmmmmm", ".mmm5mmmm5mmmm", "mm5.mmm..mm5mm", "m5...m.....m5m", "5..........m.5"],
}


def bat(w, y=9, body_dy=0, fangs=False):
    W = BAT_WING[w]; wy = {'up': 1, 'mid': 9, 'down': 10}[w] + body_dy
    parts = [(W, 17 - len(W[0]) + 1, wy), (mirror(W), 23, wy), (BAT_BODY, 15, y + body_dy)]
    if fangs:
        parts.append((["1TNT1"], 18, y + body_dy + 6))
    return build(40, 32, parts)


register('bat', [lambda: bat('up'), lambda: bat('mid'), lambda: bat('down'), lambda: bat('mid')],
         [lambda: bat('up', body_dy=-3), lambda: bat('down', body_dy=3, fangs=True)])


# ---------- boar (54x40): heavy forequarters, bristles, tusks; charges head-down ----------
def spans(W, H, spec):
    """A grid from hand-placed runs: {row: [(x0, x1, letter), ...]} (x1 inclusive), later runs on top."""
    rows = [['.'] * W for _ in range(H)]
    for y, runs in spec.items():
        for x0, x1, ch in runs:
            for x in range(max(0, x0), min(W, x1 + 1)):
                rows[y][x] = ch
    return [''.join(r) for r in rows]


BOAR_TOP = spans(54, 27, {  # high humped shoulders, a back sloping to a small rump, a wedge head down to the snout
    4: [(32, 36, 'm')], 5: [(28, 38, 'm')], 6: [(23, 39, 'm')], 7: [(18, 40, 'm')],
    8: [(14, 17, 'm'), (18, 40, 'b'), (41, 41, 'm')], 9: [(11, 13, 'm'), (14, 42, 'b'), (41, 43, '1'), (42, 42, '5')],
    10: [(9, 10, 'm'), (11, 44, 'b'), (42, 43, '5')], 11: [(8, 46, 'b')], 12: [(7, 47, 'b'), (43, 43, 'W'), (44, 44, 'E')],
    13: [(6, 48, 'b')], 14: [(5, 49, 'b')], 15: [(5, 50, 'b')], 16: [(4, 51, 'b')],
    17: [(4, 49, 'b'), (50, 53, 'm')], 18: [(4, 49, 'b'), (50, 53, 'm'), (52, 52, 'N')], 19: [(4, 49, 'b'), (50, 53, 'm')],
    20: [(5, 49, 'b'), (47, 48, 'T')], 21: [(5, 47, 'b'), (46, 47, 'T'), (48, 48, 'T')], 22: [(6, 45, 'b')], 23: [(6, 43, 'b')],
    24: [(7, 41, 'b')], 25: [(8, 17, 'b'), (30, 40, 'b')], 26: [(9, 16, 'b'), (31, 39, 'b')],
})
BOAR_DETAIL = [(12, 14, '2'), (13, 15, '2'), (14, 16, '2'), (12, 24, '2'), (13, 25, '2'), (14, 26, '2'), (10, 33, '44'), (11, 34, '4'),
               (17, 18, '2'), (18, 19, '2'), (15, 40, '2'), (16, 41, '2'), (17, 42, '2'), (14, 46, '4'), (15, 47, '44'), (19, 42, '1111'), (21, 10, '2'), (22, 11, '2')]
BOAR_LEGS = [[
    "........bbbbbbb..................bbbbbbb..............",
    ".......dbbbbbb..................dbbbbbbb..............",
    "......ddbbbbb..................ddbbbbbb...............",
    ".....ddd.bbbb..................dd..bbbb...............",
    ".....dd...bbb.................ddd...bbbb..............",
    "....ddd...bbbb................dd.....bbb..............",
    "....dd.....bbb...............ddd.....bbbb.............",
    "...ddN.....bbbN..............ddN.....bbbbN............",
    "...NN......NN.N..............NNN.....NN.NN............",
], [
    "........bbbbbbb..................bbbbbbb..............",
    "........bdbbbbb..................bdbbbbbb.............",
    "........bbdbbbb..................bbbdbbbb.............",
    "........bbbdbb...................bbb.dbbb.............",
    ".......bbb.ddb...................bbb..dbb.............",
    ".......bbb..dd..................bbbb..ddb.............",
    "......bbbb..ddd.................bbb...ddd.............",
    "......bbbN..dddN...............bbbbN..dddN............",
    "......NNN...NNNN...............NNNN...NNNN............",
]]
BOAR_BODY = with_detail(BOAR_TOP, BOAR_DETAIL, 54)
register('boar', [
    lambda: build(54, 40, [(BOAR_BODY, 0, 2), (BOAR_LEGS[0], 0, 29)]), lambda: build(54, 40, [(BOAR_BODY, 0, 2), (BOAR_LEGS[1], 0, 29)]),
    lambda: build(54, 40, [(BOAR_BODY, 0, 2), (swapped(BOAR_LEGS[0]), 0, 29)]), lambda: build(54, 40, [(BOAR_BODY, 0, 2), (swapped(BOAR_LEGS[1]), 0, 29)]),
], [
    lambda: build(54, 40, [(BOAR_BODY, -2, 3), (BOAR_LEGS[1][1:], -1, 30)]),                       # rocking back to charge
    lambda: build(54, 40, [(BOAR_BODY, 0, 5), (BOAR_LEGS[0][3:], 0, 32)]),                         # head down, tusks forward
])


# ---------- crab (48x32, seen from the front): scuttling legs, claws raised, a pinch ----------
CRAB_SHELL = [
    "........bbbbbbbbbbbbbbbb........",
    ".....bbbbbbb4bbbb4bbbbbbbbb.....",
    "...bbbb4bbbbbbbbbbbbbbbbbbbbb...",
    "..bbbbbbbbbbbbbbbbbbbbbbbbbbbb..",
    ".bbbb2bbbbbbbbbbbbbbbbbbb2bbbbb.",
    "bbbbbb2bbbbbbbbbbbbbbbbb2bbbbbbb",
    "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ".bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.",
    "..1bbbbbbbbbbbbbbbbbbbbbbbbbb1..",
    "....11bbbbbbbbbbbbbbbbbbbbb1....",
    ".......1111bbbbbbbbbbbb111......",
]
CRAB_EYES = ["1W1....1W1", "1E1....1E1", ".m......m.", ".m......m."]
CRAB_CLAW = {  # the left claw: arm then a two-fingered pincer
    'low': ["..bbbbb.....", ".bbbbbbb....", "bbb4bbbbb...", "bbbbbbbbbmm.", ".bbbbbbb.mmm", "..bb...mmmm.", "........mm.."],
    'up': ["bbbb........", "b4bbb.......", "bbbbbb......", ".bbbbbb.....", "..bbbbbb....", "...bbbbmm...", "......mmmm..", ".......mmm.."],
    'pinch': ["...bbbbb....", "..b4bbbbbb..", ".bbbbbbbbbb.", "bbbbbbbbbbbb", ".bbbbbbbb...", "..mmm.......", ".mmmm.......", "..mm........"],
}
CRAB_LEGS = [["d..d..d", ".d..d..d", "..d..d..d", "..d..d..d", "...d..d..d"], ["..d..d..", ".d..d..d.", "d..d..d..", "d..d..d..", "d..d..d.."]]


def crab(claw='low', legs=0, dy=0):
    L = CRAB_LEGS[legs]
    return build(48, 32, [(mirror(L), 4, 20), (L, 37, 20), (CRAB_SHELL, 8, 12 + dy), (CRAB_EYES, 19, 8 + dy),
                          (CRAB_CLAW[claw], 1, 8 + dy if claw != 'low' else 12 + dy), (mirror(CRAB_CLAW[claw]), 35, 8 + dy if claw != 'low' else 12 + dy)])


register('crab', [lambda: crab('low', 0), lambda: crab('low', 1, 1), lambda: crab('low', 0), lambda: crab('low', 1, 1)],
         [lambda: crab('up', 0, -1), lambda: crab('pinch', 1, 1)])


# ---------- bird (40x32, side view, crows and raptors): wingbeats, a dive with talons out ----------
BIRD_BODY = [
    "........................bbbb....",
    ".......................bbbbbb...",
    "......................bbbWEbbbTT",
    "...mm................bbbbbbbbTTT",
    "..mmmm.............bbbbbbbbbb.T.",
    ".mmmmmmm.........bbbbbbbbbbb....",
    "..mmmmmmmmbbbbbbbbbbbbbbbbbb....",
    "....mmmmmbbbbbbbbbbbbbbbbbb.....",
    "......mmmbbbbbbbbbbbbbbbbb......",
    "........bbbbbbbbbbbbbbbbb.......",
    "..........bbbbbbbbbbbb..........",
    "............N.....N.............",
    "...........NN....NN.............",
]
BIRD_WING = {
    'up': ["m............", "mm...........", ".mm..........", ".mmm.........", "..mmm........", "..m5mm.......", "...m5mm......", "...mm5mmm....",
           "....mm5mmm...", ".....mm5mmmm.", "......mmm5mmm", "........mmmmm", "..........mmm"],
    'mid': ["..........mmmmmm", ".......mmmmmmmmm", "...mmmm5mmmmmmmm", "mmmm5mmmmm5mmmm.", "mm...mmmm....m.."],
    'down': ["mmmmmmmmmmm..", ".mmmm5mmmmmm.", "..mmmm5mmmmm.", "...mmm.5mmm..", "....mm..5mm..", ".....m...mm..", ".........m..."],
}


def bird(w, dive=False):
    wx, wy = {'up': (12, 4), 'mid': (10, 13), 'down': (12, 16)}[w]
    body = BIRD_BODY if not dive else [r for r in BIRD_BODY[:11]] + ["..........NN..NN................", ".........N.N.N.N................"]
    dy = 0 if not dive else 2
    return build(40, 32, [(body, 6, 10 + dy), (BIRD_WING[w], wx, wy + dy)])


register('bird', [lambda: bird('up'), lambda: bird('mid'), lambda: bird('down'), lambda: bird('mid')],
         [lambda: bird('up'), lambda: bird('down', True)])


# ---------- wraith (36x48): a hooded shape whose ragged hem drifts; claws reach out to strike ----------
def wraith(hem=0, arms='down', lean=0):
    spec = {3: [(14, 21, 'b')], 4: [(12, 23, 'b')], 5: [(11, 24, 'b')], 6: [(10, 25, 'b')], 7: [(10, 26, 'b')]}
    for y in range(8, 13):
        spec[y] = [(9, 27, 'b'), (13, 22, 'N')]
    spec[13] = [(9, 27, 'b'), (14, 21, 'N')]; spec[14] = [(9, 27, 'b'), (15, 20, 'N')]
    for y in range(15, 37):
        w = 9 - (y - 15) // 6
        spec[y] = [(w, 36 - w - (1 if y % 7 == 0 else 0), 'b')]
    for k, x in enumerate(range(6, 31, 4)):  # ragged strips of the hem, drifting with the frame
        L = 4 + (k * 5 + hem * 3) % 7
        for y in range(37, 37 + L):
            sx = x + ((y - 37 + hem + k) // 3) % 2
            spec.setdefault(y, []).append((sx, sx + 2 - (y - 37) // 4, 'b'))
    g = spans(36, 48, spec)
    g = with_detail(g, [(10, 15, 'EE'), (10, 20, 'EE'), (11, 15, 'E'), (11, 21, 'E'),                       # eyes in the dark of the hood
                        (5, 13, '44'), (6, 12, '4'), (7, 11, '4'),                                             # light on the hood
                        (18, 14, '2'), (19, 14, '2'), (20, 15, '2'), (21, 15, '2'), (22, 15, '2'), (24, 16, '2'),  # robe folds
                        (18, 22, '2'), (19, 22, '2'), (20, 21, '2'), (21, 21, '2'), (23, 21, '2'), (28, 12, '2'), (29, 12, '2')], 36)
    arm = {'down': [((5, 16), ["..bb", ".bbb", "bbb.", "bbb.", "bb..", "bb..", "bb..", "mm..", "m.m."])],
           'up': [((2, 4), ["m.m.", "mm..", "bb..", "bbb.", ".bbb", "..bb", "..bb", "...b"])],
           'fwd': [((25, 15), ["..........", "bbbbbbb...", ".bbbbbbbbm", "....bbbbmm", "........m."])]}[arms]
    parts = [(g, lean, 0)]
    for (x, y), grid in arm:
        parts += [(grid, x + lean, y), (mirror(grid), 36 - x - len(grid[0]) + lean, y)] if arms != 'fwd' else [(grid, x + lean, y)]
    if arms == 'fwd':
        parts.append((["NNNN", ".NN."], 16 + lean, 13))
    return build(36, 48, parts)


register('ghost', [lambda: wraith(0), lambda: wraith(1), lambda: wraith(2), lambda: wraith(3)],
         [lambda: wraith(1, 'up', -1), lambda: wraith(2, 'fwd', 2)])


# ---------- yeti and golem (56x60): a hunched brute built from parts; arms swing, fists rise and slam ----------
YETI = {
    'head': spans(16, 16, {0: [(5, 10, 'b')], 1: [(3, 12, 'b')], 2: [(2, 13, 'b')], 3: [(1, 14, 'b')], 4: [(1, 14, 'b'), (3, 12, 'm')],
                           5: [(1, 14, 'b'), (3, 12, 'm')], 6: [(1, 14, 'b'), (3, 12, 'm'), (4, 4, 'E'), (11, 11, 'E')], 7: [(1, 14, 'b'), (3, 12, 'm')],
                           8: [(1, 14, 'b'), (3, 12, 'm'), (5, 10, 'N')], 9: [(2, 13, 'b'), (4, 11, 'm'), (5, 10, 'N'), (5, 5, 'T'), (10, 10, 'T')],
                           10: [(2, 13, 'b'), (4, 11, 'm')], 11: [(3, 12, 'b')], 12: [(4, 11, 'b')]}),
    'horn': ["T..", "TT.", ".TT"],
    'torso': spans(40, 30, {**{y: [(6 - min(6, y), 33 + min(6, y), 'b')] for y in range(0, 8)},
                            **{y: [(0, 39, 'b'), (11, 28, 'm')] for y in range(8, 20)},
                            **{y: [(3 + (y - 20) // 2, 36 - (y - 20) // 2, 'b'), (12, 27, 'm')] for y in range(20, 30)}}),
    'arm': spans(10, 30, {**{y: [(1, 8, 'b')] for y in range(0, 22)}, **{y: [(0, 9, 'm')] for y in range(22, 28)}, 28: [(1, 8, 'm')], 29: [(2, 3, 'N'), (5, 6, 'N')]}),
    'leg': spans(10, 16, {**{y: [(1, 8, 'b')] for y in range(0, 12)}, **{y: [(0, 9, 'm')] for y in range(12, 15)}, 15: [(0, 2, 'N'), (4, 5, 'N'), (7, 9, 'N')]}),
}
YETI_FUR = [(9, 6, '2'), (10, 7, '2'), (11, 6, '2'), (9, 32, '2'), (10, 33, '2'), (11, 32, '2'), (3, 9, '44'), (4, 8, '4'), (24, 8, '2'), (25, 9, '2'), (24, 30, '2'), (25, 31, '2')]
YETI['torso'] = with_detail(YETI['torso'], YETI_FUR, 40)
GOLEM = {
    'head': spans(16, 14, {0: [(2, 13, 'b')], 1: [(1, 14, 'b')], **{y: [(0, 15, 'b')] for y in range(2, 11)}, 11: [(1, 14, 'b')], 12: [(2, 13, 'b')],
                           5: [(0, 15, 'b'), (0, 15, '1')], 7: [(0, 15, 'b'), (3, 5, 'E'), (10, 12, 'E')], 8: [(0, 15, 'b'), (3, 5, 'E'), (10, 12, 'E')]}),
    'torso': spans(40, 30, {**{y: [(4, 35, 'b')] for y in range(0, 3)}, **{y: [(0, 39, 'b')] for y in range(3, 14)}, 14: [(0, 39, '1')],
                            **{y: [(3, 36, 'b')] for y in range(15, 26)}, **{y: [(6, 33, 'b')] for y in range(26, 30)}}),
    'arm': spans(10, 30, {**{y: [(0, 9, 'b')] for y in range(0, 10)}, 10: [(0, 9, '1')], **{y: [(1, 8, 'm')] for y in range(11, 20)}, 20: [(0, 9, '1')],
                          **{y: [(0, 9, 'b')] for y in range(21, 30)}}),
    'leg': spans(10, 16, {**{y: [(0, 9, 'm')] for y in range(0, 7)}, 7: [(0, 9, '1')], **{y: [(0, 9, 'b')] for y in range(8, 16)}}),
}
GOLEM['torso'] = with_detail(GOLEM['torso'], [(4, 8, '1'), (5, 9, '1'), (6, 9, '1'), (4, 28, '1'), (5, 27, '1'), (17, 18, '1'), (18, 18, '1'), (19, 19, '1'),
                                              (8, 17, 'E'), (9, 18, 'E'), (10, 18, 'E'), (11, 19, 'E'), (12, 20, 'E'), (9, 22, 'E'), (10, 23, 'E'),  # the glowing crack
                                              (1, 6, '444'), (4, 2, '44'), (16, 5, '4'), (21, 30, '2'), (22, 31, '2')], 40)


def brute(P, step=0, arms='swing', horns=False):
    """step 0..3 walk; arms 'swing' (with the step), 'up' (raised for a slam), 'down' (slammed down in front)."""
    sw = [0, 2, 0, -2][step]; lift = [0, 2, 0, 2][step]
    parts = []
    la, ra = (14 + sw, 14 - sw) if arms == 'swing' else (-2, -2) if arms == 'up' else (26, 26)
    lx, rx = (3, 43) if arms != 'down' else (10, 36)
    parts += [(P['leg'], 16, 44 - (lift if step == 1 else 0)), (P['leg'], 30, 44 - (lift if step == 3 else 0))]
    parts += [(P['torso'], 8, 16 + (2 if arms == 'down' else 0))]
    parts += [(P['arm'], lx, la), (mirror(P['arm']), rx, ra)]
    parts += [(P['head'], 20, 3 + (4 if arms == 'down' else 0))]
    if horns:
        parts += [(P['horn'], 18, 2 + (4 if arms == 'down' else 0)), (mirror(P['horn']), 35, 2 + (4 if arms == 'down' else 0))]
    return build(56, 60, parts)


register('yeti', [lambda: brute(YETI, 0, horns=True), lambda: brute(YETI, 1, horns=True), lambda: brute(YETI, 2, horns=True), lambda: brute(YETI, 3, horns=True)],
         [lambda: brute(YETI, 0, 'up', True), lambda: brute(YETI, 0, 'down', True)])
register('golem', [lambda: brute(GOLEM, 0), lambda: brute(GOLEM, 1), lambda: brute(GOLEM, 2), lambda: brute(GOLEM, 3)],
         [lambda: brute(GOLEM, 0, 'up'), lambda: brute(GOLEM, 0, 'down')])


# ---------- imp (40x44): hovers on beating wings; draws back and hurls a firebolt ----------
IMP_BODY = spans(20, 30, {0: [(3, 4, 'T'), (15, 16, 'T')], 1: [(4, 5, 'T'), (14, 15, 'T')], 2: [(5, 14, 'b')], 3: [(4, 15, 'b')], 4: [(2, 17, 'b')],
                          5: [(1, 18, 'b'), (6, 7, 'E'), (12, 13, 'E')], 6: [(1, 18, 'b'), (6, 7, 'W'), (12, 13, 'W')], 7: [(3, 16, 'b')],
                          8: [(4, 15, 'b'), (6, 13, 'N')], 9: [(5, 14, 'b'), (6, 6, 'T'), (13, 13, 'T')], 10: [(6, 13, 'b')],
                          **{y: [(5, 14, 'b')] for y in range(11, 20)}, 20: [(6, 13, 'b')], 21: [(6, 8, 'b'), (11, 13, 'b')],
                          **{y: [(6, 8, 'b'), (11, 13, 'b')] for y in range(22, 27)}, 27: [(5, 8, 'N'), (11, 14, 'N')]})
IMP_BODY = with_detail(IMP_BODY, [(12, 7, '4'), (13, 7, '4'), (14, 12, '2'), (15, 12, '2'), (3, 7, '44')], 20)
IMP_WING = {'up': ["m.........", "mm........", "m5m.......", ".m5mm.....", ".mm5mm....", "..mm5mmm..", "..m.mmmmmm", "...m..mmmm"],
            'mid': ["mmmmmmmmm.", "m5mmm5mmmm", ".mm5mmmmmm", "..m.mm.mmm", "......m..m"],
            'down': ["....mmmmmm", "..mmm5mmmm", ".mm5mmmmm.", "mm5.mmm...", "m5..m.....", "5........."]}
IMP_TAIL = ["....b", "...b.", "..b..", ".b...", "b....", "mm...", "m...."]


def imp(w, arm='rest', dy=0):
    W = IMP_WING[w]; wy = {'up': 4, 'mid': 13, 'down': 15}[w] + dy
    parts = [(IMP_TAIL, 8, 30 + dy), (W, 20 - len(W[0]) - 2, wy), (mirror(W), 22, wy), (IMP_BODY, 10, 8 + dy)]
    arms = {'rest': [(["b", "b", "b", "b", "b", "N"], 14, 21), (["b", "b", "b", "b", "b", "N"], 25, 21)],
            'back': [(["bbbb", "...b", "...b"], 24, 13), (["b", "b", "b", "b", "N"], 14, 21), (["mm", "mm"], 28, 11)],
            'throw': [(["bbbbbbb", "......N"], 24, 20), (["b", "b", "b", "b", "N"], 14, 21), (["mmm", "mmmm", "mmm"], 31, 18)]}[arm]
    parts += [(g, x, y + dy) for g, x, y in arms]
    return build(40, 44, parts)


register('imp', [lambda: imp('up'), lambda: imp('mid', dy=1), lambda: imp('down', dy=2), lambda: imp('mid', dy=1)],
         [lambda: imp('up', 'back'), lambda: imp('mid', 'throw', 1)])


# ---------- organic parts: jagged fur edges and hand-picked boulder outlines ----------
from px import poly as _poly


def furspans(W, H, rows, letter='b', jag=1, seed=0):
    """rows: {y: (x0, x1)}; the edges get a hand-feel fur jag (a pixel in or out every other row)."""
    spec = {}
    for y, (x0, x1) in rows.items():
        j0 = jag if (y + seed) % 3 == 0 else 0
        j1 = jag if (y + seed + 1) % 3 == 0 else 0
        spec[y] = [(x0 - j0, x1 + j1, letter)]
    return spans(W, H, spec)


def polygrid(W, H, shapes):
    """shapes: [(points, letter)] rasterised in order (hand-picked outlines, flat cel shading afterwards)."""
    rows = [['.'] * W for _ in range(H)]
    for pts, ch in shapes:
        for x, y in _poly(pts):
            if 0 <= x < W and 0 <= y < H:
                rows[y][x] = ch
    return [''.join(r) for r in rows]


def overlay(base, top):
    out = []
    for a, b in zip(base, top + [''] * (len(base) - len(top))):
        out.append(''.join(bc if bc != '.' else ac for ac, bc in zip(a, b.ljust(len(a), '.'))))
    return out


# yeti: a hunched shaggy torso, sloping shoulders, a rounded pale chest, long tapering arms, big hands
_yt = {}
for y in range(30):
    hw = 7 + y * 1.8 if y < 7 else 19.5 if y < 18 else 19.5 - (y - 18) * .5
    _yt[y] = (round(20 - hw), round(19 + hw))
YT_TORSO = furspans(40, 30, _yt)
YT_CHEST = spans(40, 30, {y: [(round(20 - (8 - abs(y - 16) / 2.2)), round(19 + (8 - abs(y - 16) / 2.2)), 'm')] for y in range(6, 27)})
YETI['torso'] = with_detail(overlay(YT_TORSO, YT_CHEST), YETI_FUR + [(14, 17, '6'), (15, 18, '6'), (14, 22, '6'), (15, 21, '6'), (20, 19, '66')], 40)
_ya = {y: (round(1 + y * .12), round(7 + y * .12 - (1 if y > 14 else 0))) for y in range(0, 22)}
YETI['arm'] = overlay(furspans(12, 30, _ya, seed=1), spans(12, 30, {**{y: [(round(2.5 + y * .12) - 2, round(8 + y * .12) + 1, 'm')] for y in range(22, 28)},
                                                                    28: [(2, 9, 'm')], 29: [(3, 4, 'N'), (6, 7, 'N'), (9, 9, 'N')]}))
YETI['leg'] = overlay(furspans(10, 16, {y: (1, 8 - (1 if y > 8 else 0)) for y in range(0, 12)}, seed=2),
                      spans(10, 16, {12: [(0, 9, 'm')], 13: [(0, 9, 'm')], 14: [(0, 9, 'm')], 15: [(0, 2, 'N'), (4, 5, 'N'), (7, 9, 'N')]}))
YETI['head'] = overlay(furspans(16, 16, {0: (5, 10), 1: (3, 12), 2: (2, 13), 3: (1, 14), 4: (1, 14), 5: (1, 14), 6: (1, 14), 7: (1, 14), 8: (1, 14), 9: (2, 13), 10: (2, 13), 11: (3, 12), 12: (4, 11)}, seed=1),
                       spans(16, 16, {4: [(4, 11, 'm')], 5: [(3, 12, 'm')], 6: [(3, 12, 'm'), (4, 5, 'E'), (10, 11, 'E')], 7: [(3, 12, 'm')], 8: [(3, 12, 'm'), (6, 9, 'N')],
                                      9: [(4, 11, 'm'), (5, 10, 'N'), (5, 5, 'T'), (10, 10, 'T')], 10: [(5, 10, 'm')]}))

# golem: hand-picked boulders stacked into a body
GOLEM['torso'] = polygrid(40, 30, [
    ([(3, 4), (10, 0), (22, 1), (30, 0), (37, 4), (39, 13), (33, 16), (6, 16), (0, 12)], 'b'),       # the great chest stone
    ([(6, 15), (20, 14), (34, 15), (36, 23), (28, 29), (12, 29), (4, 23)], 'b'),                     # the belly stone
    ([(14, 1), (22, 0), (25, 6), (21, 11), (15, 9)], 'm'),                                           # a darker inset stone
])
GOLEM['torso'] = with_detail(GOLEM['torso'], [(15, 6, '1111111111111111111111111111'), (8, 17, 'E'), (9, 18, 'E'), (10, 18, 'E'), (11, 19, 'E'), (12, 20, 'E'), (13, 20, 'E'),
                                              (17, 21, 'E'), (18, 22, 'E'), (19, 22, 'E'), (2, 6, '444'), (3, 5, '44'), (5, 1, '4'), (18, 8, '44'), (20, 30, '2'), (21, 31, '2'), (24, 10, '2'), (25, 11, '2')], 40)
GOLEM['arm'] = polygrid(10, 30, [([(1, 0), (8, 1), (9, 9), (6, 11), (0, 9)], 'b'), ([(1, 11), (8, 11), (9, 19), (1, 20)], 'm'), ([(0, 20), (9, 19), (10, 28), (6, 30), (1, 29), (0, 25)], 'b')])
GOLEM['arm'] = with_detail(GOLEM['arm'], [(1, 2, '44'), (21, 1, '44'), (10, 0, '1111111111'), (19, 0, '1111111111')], 10)
GOLEM['leg'] = polygrid(10, 16, [([(1, 0), (9, 0), (9, 7), (0, 7)], 'm'), ([(0, 7), (9, 7), (10, 15), (0, 15)], 'b')])
GOLEM['head'] = polygrid(16, 14, [([(2, 1), (8, 0), (14, 2), (15, 9), (12, 13), (3, 13), (0, 8)], 'b')])
GOLEM['head'] = with_detail(GOLEM['head'], [(5, 1, '11111111111111'), (7, 3, 'EE'), (7, 10, 'EE'), (8, 3, 'E'), (8, 11, 'E'), (2, 4, '44'), (10, 6, '2222')], 16)


# ---------- dragon (108x84; the Ember Wyrm): wings beat as it stalks, rears back, then lunges with open jaws ----------
def dragon_frame(step=0, wing='up', pose='walk'):
    lean = {'walk': 0, 'rear': -4, 'lunge': 5}[pose]; rise = {'walk': 0, 'rear': -5, 'lunge': 3}[pose]
    sh = lambda pts, dx=0, dy=0: [(x + dx, y + dy) for x, y in pts]
    shapes = []
    # far wing (darker), far legs
    fw = [(64, 38), (26, 0), (36, 10), (34, 0), (50, 12), (54, 0), (66, 16), (74, 6), (78, 32)] if wing == 'up' else [(64, 40), (18, 26), (28, 34), (14, 40), (30, 44), (22, 54), (48, 48), (76, 42)]
    shapes.append((sh(fw, lean, rise), 'd'))
    off = [0, 3, 0, -3][step]
    for hx, s_ in ((44, 1), (70, -1)):
        f = off * s_
        shapes.append(([(hx - 5, 54), (hx + 5, 54), (hx + 4 + f, 70), (hx + 6 + f, 82), (hx - 2 + f, 82), (hx - 4 + f, 70)], 'd'))
    # tail, body, belly
    shapes.append(([(36, 50), (20, 46), (8, 50), (2, 58), (0, 66), (8, 60), (18, 58), (34, 62)], 'b'))
    shapes.append((sh([(30, 52), (36, 42), (52, 38), (72, 38), (84, 44), (86, 56), (76, 66), (48, 68), (34, 64)], lean // 2, rise // 2), 'b'))
    shapes.append((sh([(38, 62), (52, 66), (74, 64), (80, 58), (66, 68), (46, 70)], lean // 2, rise // 2), 'm'))
    # near legs with claws
    for hx, s_ in ((40, -1), (66, 1)):
        f = off * s_
        shapes.append(([(hx - 6, 56), (hx + 6, 56), (hx + 5 + f, 70), (hx + 7 + f, 81), (hx - 3 + f, 81), (hx - 5 + f, 70)], 'b'))
    # neck and head
    nk = [(72, 48), (75, 36), (79, 26), (86, 18), (96, 20), (92, 30), (88, 42), (84, 56)]
    shapes.append((sh(nk, lean, rise), 'b'))
    head = [(84, 14), (92, 8), (102, 10), (107, 16), (106, 22), (96, 26), (86, 24)]
    shapes.append((sh(head, lean, rise), 'b'))
    jaw = [(92, 22), (106, 22), (104, 27), (92, 28)] if pose != 'lunge' else [(92, 22), (106, 27), (103, 34), (92, 30)]
    shapes.append((sh(jaw, lean, rise), 'b'))
    # near wing over the body
    nw = [(58, 42), (16, 2), (28, 12), (24, 0), (42, 14), (44, 0), (58, 18), (64, 4), (72, 36)] if wing == 'up' else [(58, 44), (8, 30), (18, 38), (2, 44), (20, 48), (10, 60), (40, 52), (70, 46)]
    shapes.append((sh(nw, lean, rise), 'm'))
    g = polygrid(108, 84, shapes)
    det = []
    for x in range(36, 80, 6):  # back spines
        det.append((40 + (rise // 2) - (2 if 50 < x < 70 else 0), x + lean // 2, 'T'))
    for k, x in enumerate(range(10, 34, 6)):  # tail spines
        det.append((48 + k // 2, x, 'T'))
    ex, ey = 96 + lean, 13 + rise
    det += [(ey, ex, 'EE'), (ey - 1, ex, 'W'), (ey - 5, ex - 9, 'TTT'), (ey - 6, ex - 11, 'TTT'), (ey - 7, ex - 13, 'TT'), (ey - 8, ex - 15, 'T'), (ey - 6, ex - 4, 'TT'), (ey - 7, ex - 5, 'TT'), (ey - 8, ex - 6, 'T')]  # eye, horns
    if pose == 'lunge':
        det += [(ey + 9, ex - 4, 'TNTNTNTN'), (ey + 13, ex - 4, 'NTNTNTN'), (ey + 10, ex - 3, 'NNNNNNN'), (ey + 11, ex - 3, 'NNNNNN'), (ey + 12, ex - 2, 'NNNNN')]
    else:
        det += [(ey + 9, ex - 4, 'TTTTTTT')]
    det += [(46 + rise // 2, 50 + lean // 2, '44'), (45 + rise // 2, 54 + lean // 2, '444'), (58, 44, '2'), (59, 45, '2'), (60, 46, '2'), (56, 62, '2'), (57, 63, '2')]
    if wing == 'up':
        for (x0, y0) in ((16, 2), (24, 0), (44, 0), (64, 4)):
            det += [(y0 + k + rise, x0 + round((58 - x0) * k / 40) + lean, '5') for k in range(0, 40, 2) if y0 + k < 42]
    else:
        for (x0, y0) in ((8, 30), (2, 44), (10, 60)):
            det += [(round(y0 + (44 - y0) * k / 20) + rise, x0 + round((58 - x0) * k / 20) + lean, '5') for k in range(0, 20, 2)]
    return grid_sprite(with_detail(g, det, 108), 108, 84)


register('dragon', [lambda: dragon_frame(0, 'up'), lambda: dragon_frame(1, 'down'), lambda: dragon_frame(2, 'up'), lambda: dragon_frame(3, 'down')],
         [lambda: dragon_frame(0, 'up', 'rear'), lambda: dragon_frame(0, 'down', 'lunge')])


# ---------- farm animals (an_*): four-frame walks, diagonal leg pairs, far legs a shade darker ----------
def legpoly(hx, hy, fx, fy, wt, wb, knee):
    kx, ky = (hx + fx) / 2 + knee, hy + (fy - hy) * .55
    return [(hx - wt / 2, hy), (hx + wt / 2, hy), (kx + wb / 2 + .5, ky), (fx + wb / 2, fy), (fx - wb / 2, fy), (kx - wb / 2 - .5, ky)]


def quad(W, H, step, back, front, legs, top, det, hoof='N', hh=2):
    """legs: [(hipx, hipy, footx, wt, wb, knee)] in order far-hind, far-front, near-hind, near-front.
    back: shapes drawn behind the far legs (tail); top: body/neck/head shapes drawn between far and near legs."""
    off = [3, 0, -3, 0][step]; lift = [0, 2, 0, 2][step]
    pairA = {1, 2}   # far-front and near-hind move together
    shapes = list(back)
    def leg(i, letter):
        hx, hy, fx, wt, wb, kn = legs[i]
        o = off if i in pairA else -off
        up = lift if (i in pairA) == (step == 1) and step in (1, 3) else 0
        return ([(round(x), round(y)) for x, y in legpoly(hx, hy, fx + o, H - 1 - up, wt, wb, kn)], letter)
    shapes += [leg(0, 'd'), leg(1, 'd')] + list(top) + [leg(2, 'b'), leg(3, 'b')] + list(front)
    g = polygrid(W, H, shapes)
    hooves = []
    for i, (hx, hy, fx, wt, wb, kn) in enumerate(legs):
        o = off if i in pairA else -off
        up = lift if (i in pairA) == (step == 1) and step in (1, 3) else 0
        for k in range(hh):
            hooves.append((H - 1 - up - k, round(fx + o - wb / 2), hoof * max(2, round(wb) + 1)))
    return grid_sprite(with_detail(g, det + hooves, W), W, H)


def horse_f(step):
    legs = [(17, 38, 15, 7, 4, -2), (48, 38, 48, 6, 4, 1), (22, 38, 21, 7, 4, -2), (53, 38, 53, 6, 4, 1)]
    body = ([(10, 30), (14, 24), (26, 22), (44, 22), (52, 24), (56, 30), (54, 40), (44, 42), (24, 42), (12, 40)], 'b')
    neck = ([(46, 26), (50, 12), (54, 6), (60, 6), (58, 16), (56, 32)], 'b')
    head = ([(53, 8), (57, 4), (62, 5), (68, 13), (69, 19), (65, 22), (59, 18), (55, 14)], 'b')
    tail = ([(12, 26), (6, 30), (3, 40), (2, 50), (6, 52), (8, 42), (12, 32)], 'm')
    mane = ([(49, 6), (53, 2), (57, 4), (53, 14), (49, 26), (45, 28), (47, 16)], 'm')
    det = [(9, 59, 'W'), (10, 59, 'E'), (10, 60, 'E'), (19, 67, 'N'), (17, 63, '1111'), (1, 56, 'm'), (2, 56, 'mm'), (3, 56, 'mm'),
           (26, 20, '44'), (25, 26, '444'), (25, 36, '44'), (30, 40, '2'), (31, 41, '2'), (32, 42, '2'), (33, 50, '2'), (34, 51, '2'), (12, 52, '4'), (13, 53, '4')]
    return quad(70, 60, step, [tail], [mane], legs, [body, neck, head], det, hh=3)


def cow_f(step):
    legs = [(15, 32, 14, 8, 5, -1), (41, 32, 41, 7, 5, 1), (20, 32, 20, 8, 5, -1), (45, 32, 46, 7, 5, 1)]
    body = ([(8, 22), (14, 15), (30, 14), (44, 15), (50, 20), (50, 32), (42, 36), (16, 36), (8, 32)], 'b')
    head = ([(46, 18), (52, 12), (58, 14), (61, 22), (60, 28), (55, 30), (50, 26), (47, 30)], 'b')
    muzzle = ([(54, 24), (61, 23), (61, 29), (55, 30)], 'm')
    tail = ([(8, 18), (6, 24), (5, 34), (4, 37), (7, 38), (7, 30), (9, 20)], 'b')
    det = [(16, 54, 'W'), (17, 54, 'E'), (17, 55, 'E'), (11, 51, 'TT'), (10, 49, 'TT'), (11, 56, 'TT'), (10, 58, 'TT'), (14, 46, 'mm'), (15, 45, 'mmm'),
           (26, 57, 'N'), (26, 59, 'N'), (36, 4, 'mmm'), (37, 4, 'mm'),
           (16, 18, 'mmmmmmm'), (17, 17, 'mmmmmmmmm'), (18, 17, 'mmmmmmmmmm'), (19, 18, 'mmmmmmmm'), (20, 19, 'mmmmm'),          # patches
           (24, 32, 'mmmm'), (25, 31, 'mmmmmm'), (26, 31, 'mmmmm'), (36, 24, 'mmm'), (37, 23, 'mmmmm'),                     # udder area
           (16, 30, '444'), (15, 36, '44')]
    return quad(62, 48, step, [tail], [muzzle], legs, [body, head], det)


def goat_f(step):
    legs = [(14, 26, 13, 5, 3, -1), (34, 26, 34, 5, 3, 1), (18, 26, 17, 5, 3, -1), (37, 26, 38, 5, 3, 1)]
    body = ([(8, 18), (12, 14), (24, 14), (36, 14), (41, 18), (40, 27), (32, 30), (14, 30), (8, 26)], 'b')
    neck = ([(36, 18), (40, 8), (45, 8), (43, 22)], 'b')
    head = ([(40, 7), (45, 4), (49, 7), (53, 13), (51, 16), (46, 14), (42, 12)], 'b')
    beard = ([(48, 15), (51, 16), (49, 21)], 'm')
    det = [(8, 46, 'W'), (9, 46, 'E'), (13, 52, 'N'), (3, 43, 'T'), (2, 42, 'T'), (1, 40, 'TT'), (0, 38, 'TT'), (4, 44, 'T'), (3, 42, 'T'),
           (10, 38, 'm'), (11, 37, 'mm'), (13, 6, 'b'), (12, 5, 'bb'), (11, 5, 'b'),
           (18, 20, 'mmmmmm'), (19, 19, 'mmmmmmmm'), (20, 19, 'mmmmmmm'), (21, 21, 'mmmm'), (15, 14, '444'), (16, 36, '44')]
    return quad(54, 44, step, [], [beard], legs, [body, neck, head], det)


def sheep_f(step):
    legs = [(15, 28, 14, 4, 3, -1), (32, 28, 32, 4, 3, 1), (19, 28, 19, 4, 3, -1), (35, 28, 36, 4, 3, 1)]
    fleece = ([(6, 18), (8, 13), (13, 10), (20, 9), (28, 9), (36, 10), (41, 14), (42, 22), (40, 29), (32, 32), (14, 32), (7, 28)], 'b')
    head = ([(39, 13), (44, 11), (49, 14), (52, 19), (49, 23), (43, 21)], 'm')
    det = [(16, 46, 'W'), (17, 46, 'E'), (20, 51, 'N'), (14, 38, 'mm'), (15, 37, 'mmm'), (11, 42, 'bbb'), (10, 41, 'bbbb'),   # face, ear, topknot
           ] + [(y, x, '4') for y, x in ((12, 12), (11, 18), (11, 25), (12, 32), (16, 9), (15, 16), (14, 23), (15, 30), (16, 37), (20, 12), (19, 19), (19, 27), (20, 34), (24, 15), (23, 22), (24, 30))] \
              + [(y + 1, x + 1, '2') for y, x in ((12, 12), (11, 18), (11, 25), (12, 32), (16, 9), (15, 16), (14, 23), (15, 30), (16, 37), (20, 12), (19, 19), (19, 27), (20, 34), (24, 15), (23, 22), (24, 30))]
    leg_pal = legs
    g = quad(54, 44, step, [], [head], leg_pal, [fleece], det)
    return g


def pig_f(step):
    legs = [(16, 30, 15, 5, 4, 0), (33, 30, 33, 5, 4, 0), (20, 30, 20, 5, 4, 0), (36, 30, 37, 5, 4, 0)]
    body = ([(7, 22), (10, 15), (20, 12), (32, 12), (40, 16), (42, 26), (36, 33), (14, 33), (8, 29)], 'b')
    head = ([(36, 15), (43, 14), (49, 18), (51, 25), (45, 29), (38, 27)], 'b')
    snout = ([(48, 19), (52, 19), (53, 25), (49, 26)], 'm')
    ear = ([(38, 15), (43, 9), (45, 17)], 'b')
    det = [(19, 44, 'W'), (20, 44, 'E'), (21, 50, 'N'), (23, 50, 'N'), (17, 8, 'mm'), (16, 6, 'mm'), (17, 5, 'm'), (18, 6, 'm'),
           (14, 16, '4444'), (15, 14, '44'), (27, 22, '2222'), (24, 46, '1111')]
    return quad(54, 40, step, [], [snout, ear], legs, [body, head], det, hoof='m')


def chicken_f(step):
    bob = [0, 1, 0, 1][step]; fwd = [0, 1, 0, -1][step]
    g = polygrid(36, 36, [([(4, 10), (9, 6), (13, 14), (10, 22), (5, 20)], 'm'),                              # tail fan
                          ([(9, 18), (14, 14), (24, 14), (29, 18), (27, 27), (19, 31), (12, 28)], 'b'),      # body
                          ([(22 + fwd, 16 + bob), (24 + fwd, 7 + bob), (29 + fwd, 5 + bob), (32 + fwd, 8 + bob), (31 + fwd, 15 + bob), (28 + fwd, 19 + bob)], 'b'),  # neck + head
                          ([(13, 19), (21, 18), (24, 22), (19, 26), (13, 24)], 'm')])                         # wing
    lx = [(15, 20), (16, 19), (15, 20), (14, 21)][step]
    det = [(30 - k, lx[0] + (k if step == 1 else 0) // 3, 'T') for k in range(0, 4)] + [(30 - k, lx[1], 'T') for k in range(0, 4)]
    det += [(34, lx[0] - 1, 'TTT'), (34, lx[1], 'TTT'), (31, lx[0], 'T'), (31, lx[1], 'T'), (32, lx[0], 'T'), (32, lx[1], 'T'), (33, lx[0], 'T'), (33, lx[1], 'T')]
    hx, hy = 29 + fwd, 8 + bob
    det += [(hy, hx, 'W'), (hy + 1, hx, 'E'), (hy + 1, hx + 3, 'TTT'), (hy + 2, hx + 3, 'TT'), (hy - 4, hx - 3, 'RR'), (hy - 3, hx - 4, 'RRRR'), (hy - 2, hx - 3, 'RRR'),
            (hy + 5, hx + 1, 'R'), (hy + 6, hx + 1, 'R'), (21, 15, '666'), (22, 14, '6666'), (17, 16, '444'), (16, 20, '44')]
    return grid_sprite(with_detail(g, det, 36), 36, 36)


def duck_f(step):
    bob = [0, 1, 0, 1][step]
    g = polygrid(38, 36, [([(3, 16), (8, 18), (26, 18), (31, 22), (27, 29), (12, 30), (6, 26)], 'b'),
                          ([(24, 20), (25, 12 + bob), (27, 6 + bob), (32, 5 + bob), (34, 9 + bob), (31, 12 + bob), (29, 19)], 'm'),
                          ([(9, 20), (22, 19), (24, 24), (12, 26)], 'b')])
    lx = [(15, 21), (16, 20), (15, 21), (14, 22)][step]
    det = [(30 + k, lx[0], 'T') for k in range(4)] + [(30 + k, lx[1], 'T') for k in range(4)] + [(34, lx[0] - 1, 'TTT'), (34, lx[1] - 1, 'TTT')]
    det += [(6 + bob, 30, 'W'), (7 + bob, 30, 'E'), (8 + bob, 33, 'TTTTT'), (9 + bob, 33, 'TTTT'), (17, 26, 'WWWW'), (21, 11, '2222222222'), (22, 12, '22222222'), (19, 8, '4444')]
    return grid_sprite(with_detail(g, det, 38), 38, 36)


def rabbit_f(step):
    # a hop: crouched, pushing off (stretched), airborne, landing
    shp = [
        ([(5, 24), (8, 16), (16, 13), (24, 15), (27, 22), (22, 28), (9, 28)], (22, 14), 0),
        ([(4, 20), (9, 13), (18, 11), (27, 13), (30, 19), (24, 25), (10, 26)], (25, 11), -2),
        ([(5, 18), (10, 11), (19, 9), (28, 11), (31, 17), (25, 23), (11, 24)], (26, 8), -5),
        ([(5, 23), (9, 15), (17, 12), (25, 14), (28, 21), (23, 27), (10, 27)], (23, 13), -1),
    ][step]
    body, (hx, hy), air = shp
    g = polygrid(38, 32, [(body, 'b'), ([(hx, hy + 1), (hx + 5, hy - 3), (hx + 11, hy - 1), (hx + 13, hy + 4), (hx + 9, hy + 8), (hx + 3, hy + 7)], 'b'),
                          ([(hx + 2, hy - 1), (hx + 5, hy - 1), (hx + 4, hy - 13), (hx + 2, hy - 12)], 'b'), ([(hx + 6, hy - 1), (hx + 9, hy - 1), (hx + 9, hy - 12), (hx + 7, hy - 12)], 'b')])
    feet = {0: [(29, 6, 'mmmmmmmmmm'), (28, 22, 'mmm')], 1: [(29 + air, 2, 'mmmmmmm'), (27, 24, 'mmm')], 2: [(26 + air // 2, 2, 'mmmmmm'), (24 + air // 2, 26, 'mmm')], 3: [(28, 6, 'mmmmmmmm'), (29, 24, 'mmm')]}[step]
    det = feet + [(hy + 1, hx + 7, 'W'), (hy + 2, hx + 7, 'E'), (hy + 3, hx + 12, 'N'), (hy - 8, hx + 3, '7'), (hy - 7, hx + 3, '7'), (hy - 6, hx + 3, '7'), (hy - 8, hx + 8, '7'), (hy - 7, hx + 8, '7'),
                  (17 + air // 2, 2, 'WW'), (18 + air // 2, 1, 'WWW'), (19 + air // 2, 2, 'WW'), (15 + air // 2, 12, '444')]
    return grid_sprite(with_detail(g, det, 38), 38, 32)


for _n, _f in (('horse', horse_f), ('cow', cow_f), ('goat', goat_f), ('sheep', sheep_f), ('pig', pig_f), ('chicken', chicken_f), ('duck', duck_f), ('rabbit', rabbit_f)):
    register(_n, [(lambda f=_f, k=k: f(k)) for k in range(4)], prefix='an_')


# ======================= regional creatures and bosses =======================
def S(pts, k=1, dx=0, dy=0):
    """Scale hand-picked points (designed small) by k and shift them: crisp at any size."""
    return [(round(x * k + dx), round(y * k + dy)) for x, y in pts]


def SD(det, k=1, dx=0, dy=0):
    return [(round(y * k + dy), round(x * k + dx), px) for y, x, px in det]


POSE = {'walk': (0, 0), 'wind': (-2, 2), 'strike': (3, 0)}


def beast(W, H, k, step, pose, legs, back, top, front, det, wt=1, wb=1, hoof='N', hh=2, oy=0):
    """A four-legged creature from designed points (scaled by k): pose moves the body, legs stay planted."""
    dx, dy = POSE[pose]
    dx, dy = dx * k, dy * k
    legs_k = [(hx * k + dx, hy * k + dy + oy, fx * k + dx * .3, a * k * wt, b * k * wb, kn * k) for hx, hy, fx, a, b, kn in legs]
    tr = lambda shapes: [(S(p, k, dx, dy + oy), ch) for p, ch in shapes]
    st = step if pose == 'walk' else 1
    return quad(W, H, st, tr(back), tr(front), legs_k, tr(top), SD(det, k, dx, dy + oy), hoof=hoof, hh=hh)


# canine (designed in a 54x40 frame): wargs, the frost warg, the fire hound
def canine(W, H, k, step, pose, extra=None, jaw_open=False):
    legs = [(14, 26, 12, 4, 2, -2), (36, 26, 37, 3.5, 2, 1), (12, 25, 11, 5, 2, -2), (34, 26, 34, 4, 2, 1)]
    tail = [([(10, 18), (4, 14), (1, 18), (3, 26), (9, 24)], 'm')]
    body = [([(9, 18), (16, 15), (30, 16), (40, 14), (44, 20), (41, 28), (33, 30), (20, 26), (12, 27)], 'b'),
            ([(26, 15), (30, 9), (34, 13), (37, 7), (40, 12), (44, 15), (43, 27), (36, 26)], 'm'),
            ([(38, 12), (44, 9), (48, 13), (53, 17), (52, 20), (46, 21), (40, 19)], 'b')]
    ears = [([(40, 11), (41, 3), (44, 10)], 'b'), ([(43, 10), (45, 3), (46, 10)], 'b')]
    det = [(13, 44, 'WE'), (17, 53, 'N'), (20, 47, '1111'), (21, 48, 'T'), (21, 50, 'T'), (16, 34, '44'), (17, 35, '4'), (19, 20, '2'), (20, 21, '2'), (19, 28, '2'), (20, 29, '2')]
    if jaw_open:
        det += [(20, 46, '1NNNNN1'), (21, 46, 'TbTbTb'), (22, 47, 'bbbb')]
    if extra:
        b2, d2 = extra
        body += b2; det += d2
    return beast(W, H, k, step, pose, legs, tail, body, ears, det, oy=H - 40 * k)


def warg_f(step, pose='walk', ice=False):
    ex = None
    if ice:
        ex = ([([(x, 17), (x + 3, 7 - (x // 6) % 2 * 3), (x + 6, 17)], 'T') for x in range(12, 38, 6)], [])
    return canine(66, 48, 1.2, step, pose, ex, pose == 'strike')


def hound_f(step, pose='walk'):
    fl = step % 2
    ex = ([([(x, 17), (x + 3, 17 - (8 + (i * 7 + fl * 3 * (i % 2)) % 7)), (x + 6, 17)], 'b') for i, x in enumerate(range(14, 42, 5))],
          [(17 - (8 + (i * 7 + fl * 3 * (i % 2)) % 7) + 2, x + 3, 'Y') for i, x in enumerate(range(14, 42, 5))] + [(15, x, 'O') for x in range(16, 42, 5)] + [(13, 44, 'YY')])
    return canine(64, 46, 1.15, step, pose, ex, pose == 'strike')


def bear_f(step, pose='walk'):
    legs = [(24, 34, 23, 9, 7, -1), (50, 34, 51, 8, 7, 1), (19, 34, 19, 10, 8, 0), (46, 34, 46, 10, 8, 0)]
    body = [([(10, 30), (16, 20), (30, 17), (42, 10), (54, 14), (58, 26), (54, 40), (40, 44), (16, 42)], 'b'), ([(30, 14), (40, 10), (52, 14), (52, 24), (34, 22)], 'm')]
    head = [([(52, 20), (58, 16), (64, 19), (69, 26), (66, 31), (57, 31), (52, 28)], 'b'), ([(53, 16), (55, 13), (58, 16)], 'b'), ([(59, 16), (61, 13), (63, 17)], 'b')]
    det = [(21, 60, 'WE'), (26, 67, 'NN'), (30, 60, 'TTTTT'), (20, 22, '44'), (19, 28, '444'), (24, 16, '2'), (25, 17, '2'), (30, 26, '2'), (31, 27, '2'), (34, 36, '2'), (35, 37, '2')]
    if pose == 'strike':
        det += [(29, 58, '1NNNNNN'), (30, 59, 'TbTbT')]
    return beast(70, 52, 1, step, pose, legs, [], body + head, [], det, hoof='T', hh=1)


def mammoth_f(step, pose='walk'):
    legs = [(24, 44, 24, 10, 9, 0), (58, 44, 58, 10, 9, 0), (18, 44, 18, 11, 10, 0), (52, 44, 52, 11, 10, 0)]
    body = [([(8, 40), (14, 22), (34, 12), (54, 10), (70, 16), (76, 34), (72, 50), (16, 52)], 'b'),
            ([(12, 22), (30, 12), (48, 10), (40, 18), (20, 24)], 'T')]   # snow on its back
    trunk_up = pose == 'wind'
    head = [([(62, 14), (72, 8), (80, 14), (82, 30), (76, 40), (66, 36)], 'b'), ([(60, 18), (66, 16), (68, 32), (62, 34)], 'm')]
    trunk = ([(76, 34), (84, 28), (88, 16), (86, 12), (82, 22), (74, 28)], 'b') if trunk_up else ([(76, 34), (84, 44), (82, 58), (78, 64), (75, 62), (77, 54), (76, 44), (70, 38)], 'b')
    tusk = ([(70, 36), (74, 46), (82, 52), (88, 44), (86, 54), (76, 56), (68, 44)], 'T')
    det = [(22, 72, 'WE'), (41, 12, 'mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm'), (42, 13, 'm.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m.m'),
           (43, 14, 'm..m..m..m..m..m..m..m..m..m..m..m..m..m..m..m..m..m..m'), (24, 30, '44'), (22, 40, '444'), (30, 50, '2'), (31, 51, '2')]
    return beast(88, 68, 1, step, pose, legs, [], body + head + [trunk], [tusk], det, hoof='T', hh=1)


def griffin_f(step, pose='walk'):
    legs = [(16, 36, 15, 6, 3, -2), (44, 36, 45, 3, 2, 1), (20, 36, 20, 7, 4, -2), (46, 36, 46, 3.5, 2, 1)]
    wing_up = step % 2 == 0 or pose == 'wind'
    wing = ([(22, 28), (6, 2), (16, 6), (24, 3), (32, 8), (42, 26)], 'm') if wing_up else ([(22, 28), (2, 22), (12, 18), (14, 30), (26, 24), (42, 28)], 'm')
    body = [([(10, 30), (16, 24), (30, 23), (40, 24), (52, 26), (52, 38), (38, 42), (18, 41), (10, 36)], 'b'), ([(38, 22), (48, 20), (54, 28), (50, 40), (40, 38)], 'T')]
    head = [([(44, 22), (46, 12), (52, 8), (58, 10), (60, 18), (54, 24)], 'T'), ([(58, 12), (66, 14), (69, 19), (67, 23), (64, 19), (58, 19)], 'Y'), ([(46, 12), (40, 4), (48, 10), (47, 2), (51, 9)], 'T')]
    tail = [([(12, 28), (4, 20), (2, 16), (6, 16), (8, 22), (13, 26)], 'b')]
    det = [(13, 54, 'WE'), (21, 66, 'N'), (14, 51, '111111'), (26, 20, '44'), (25, 26, '444'), (32, 30, '2'), (33, 31, '2')]
    if pose == 'strike':
        det += [(20, 59, '1NNNN'), (21, 59, 'NNN')]
    return beast(70, 56, 1, step, pose, legs, tail, body + head, [wing], det, hoof='N', hh=1)


def lizard(W, H, k, step, pose, crown=False):
    """Salamanders and the Ash Mother (designed 70x40, scaled by k): sprawled legs, a ridge of flame."""
    dx, dy = [(0, 0), (-2, 1), (3, 0)][['walk', 'wind', 'strike'].index(pose)]
    st = [3, -3, 3, -3][step] if pose == 'walk' else 0
    shp = []
    for x, d in ((22, 1), (44, -1)):
        shp.append(([(x, 26), (x + 4, 26), (x + 2 + st * d, 33), (x - 4 + st * d, 38), (x - 6 + st * d, 36), (x - 2, 30)], 'd'))
    shp.append(([(22, 22), (10, 22), (2, 28 + st // 2), (0, 32 + st // 2), (8, 30), (22, 30)], 'b'))
    shp.append(([(18 + dx, 20 + dy), (30 + dx, 16 + dy), (44 + dx, 17 + dy), (50 + dx, 22 + dy), (46 + dx, 30 + dy), (24 + dx, 31 + dy), (16, 27)], 'b'))
    shp.append(([(22 + dx, 28 + dy), (44 + dx, 27 + dy), (42 + dx, 31 + dy), (26 + dx, 32 + dy)], 'm'))
    for x, d in ((26, -1), (42, 1)):
        shp.append(([(x - 2, 26), (x + 3, 26), (x + 5 + st * d, 32), (x + 1 + st * d, 38), (x - 2 + st * d, 38), (x, 31)], 'b'))
    open_ = pose == 'strike'
    shp.append(([(46 + dx, 18 + dy), (54 + dx, 15 + dy), (62 + dx, 17 + dy), (68 + dx, 21 + dy), (67 + dx, 25 + dy), (58 + dx, 27 + dy), (48 + dx, 26 + dy)], 'b'))
    shp.append(([(56 + dx, 25 + dy), (68 + dx, 24 + dy + (4 if open_ else 0)), (64 + dx, 29 + dy + (4 if open_ else 0)), (55 + dx, 28 + dy)], 'b'))
    g = polygrid(W, H, [(S(p, k), ch) for p, ch in shp])
    det = [(19 + dy, 57 + dx, 'EE')]
    for i, x in enumerate(range(20, 48, 5)):
        h = 6 + (i + step) % 3 * 2
        for r in range(h):
            det.append((17 + dy - r, x + dx + (1 if r > h // 2 else 0), 'O' if r < h - 2 else 'Y'))
    det += [(23 + dy, x + dx, 'Y') for x in range(22, 46, 7)]
    if crown:
        det += [(16 + dy - r, x + dx, 'T') for x in (50, 54, 58) for r in range(7)]
    det = SD(det, k)
    return grid_sprite(with_detail(g, det, W), W, H)


def lobster_f(step, pose='walk'):
    o = 2 if pose == 'strike' else -2 if pose == 'wind' else 0
    g = polygrid(66, 40, [([(4, 18), (12, 14), (12, 30), (4, 28)], 'm'), ([(10, 16), (30, 14), (46, 16), (48, 26), (30, 30), (10, 28)], 'b'),
                          ([(44, 18), (54, 10 - o), (62, 8 - o), (64, 12 - o), (56, 16 - o), (48, 22)], 'b'), ([(44, 24), (54, 32 + o), (62, 34 + o), (64, 30 + o), (56, 28 + o), (48, 26)], 'b'),
                          ([(60, 6 - o), (66, 4 - o), (64, 10 - o)], 'm'), ([(60, 36 + o), (66, 38 + o), (64, 32 + o)], 'm')])
    det = [(18, 46, 'WE')] + [(r, c, '1') for c in (16, 22, 28, 34) for r in range(15, 29)] + [(15, 20, '444'), (16, 30, '44')]
    for i in range(4):
        x = 20 + i * 6; s = (2 if (i + step) % 2 else -2) if pose == 'walk' else 0
        det += [(29 + r, x + s * r // 8, 'm') for r in range(9)]
    det += [(17 - r, 47 + r * 2, 'm') for r in range(8)]
    return grid_sprite(with_detail(g, det, 66), 66, 40)


def jelly_f(step, pose='walk'):
    pulse = [0, 1, 2, 1][step] if pose == 'walk' else 3 if pose == 'wind' else -1
    bell = {(x, y) for x in range(2, 42) for y in range(2 + pulse, 26) if ((x + .5 - 22) / (20 - pulse)) ** 2 + ((y - 24) / (21 - pulse)) ** 2 <= 1}
    rows = [['.'] * 44 for _ in range(58)]
    for x, y in bell:
        rows[y][x] = 'b'
    for i, x in enumerate(range(8, 38, 5)):
        for y in range(25, 54 - (i % 3) * 4 - (6 if pose == 'wind' else 0)):
            xx = x + round(__import__('math').sin(y * .3 + i + step * 1.5) * 2) + (2 if pose == 'strike' else 0)
            if 0 <= xx < 44:
                rows[y][xx] = 'm' if y % 4 else '6'
    g = [''.join(r) for r in rows]
    det = [(10 + pulse, 13, '44'), (9 + pulse, 15, '44'), (12 + pulse, 12, '4'), (17, 17, 'E'), (17, 26, 'E'), (18, 17, 'E'), (18, 26, 'E'), (20, 20, '2222')]
    return grid_sprite(with_detail(g, det, 44), 44, 58)


def wisp_f(step, pose='walk'):
    import math
    sway = [2, 0, -2, 0][step]
    rows = [['.'] * 48 for _ in range(60)]
    for y in range(4, 58):
        for x in range(4, 44):
            head = y < 24 and ((x + .5 - 24) / 13) ** 2 + ((y - 22) / 17) ** 2 <= 1
            tail = 24 <= y < 56 and abs(x + .5 - 24 - sway * (y - 24) / 30) < 13 - (y - 24) * .4 and ((x // 4 + y // 6 + step) % 5 or y < 44)
            if head or tail:
                rows[y][x] = 'b'
    g = [''.join(r) for r in rows]
    det = [(y, x, 'N') for y in range(14, 28) for x in range(17, 31) if ((x - 24) / 7) ** 2 + ((y - 21) / 7) ** 2 <= 1]
    det += [(20, 20, 'EE'), (20, 26, 'EE'), (21, 20, 'E'), (21, 27, 'E'), (33, 22, 'WWW'), (34, 21, 'WWWWW'), (35, 22, 'WWW')]
    for i, (x, y) in enumerate(((6, 14), (42, 22), (8, 42), (40, 48))):
        y += (2 if (i + step) % 2 else -2) - (6 if pose == 'wind' else 0)
        det += [(y - 1, x, 'W'), (y, x - 1, 'WWW'), (y + 1, x, 'W')]
    if pose == 'strike':
        det += [(28, 34, 'WWWWWWWWWWWWW'), (29, 36, 'WWWWWWWWWWW')]
    return grid_sprite(with_detail(g, det, 48), 48, 60)


def upright(W, H, k, step, pose, P):
    """Something that stands upright (designed in a 56x60 frame, scaled by k): stone, crystal, troll, giants.
    P: dict of shapes for 'legs', 'torso', 'arm' (left, mirrored), 'head', plus 'det' and optional 'weapon'."""
    sw = [0, 2, 0, -2][step] if pose == 'walk' else 0
    lift = [0, 2, 0, 2][step] if pose == 'walk' else 0
    ay = {'walk': 0, 'wind': -16, 'strike': 10}[pose]; by = {'walk': 0, 'wind': 0, 'strike': 3}[pose]
    shapes = []
    for i, x in enumerate((17, 31)):
        up = lift if (i == 0) == (step == 1) and step in (1, 3) else 0
        shapes.append((S(P['leg'], k, x * k, (44 - up) * k), 'b' if i else 'd'))
    tw = P.get('tw', .74)  # torsos are narrowed toward their middle so the arms hang clear of them
    shapes += [(S([(20 + (x - 20) * tw, y) for x, y in p], k, 8 * k, (16 + by) * k), ch) for p, ch in P['torso']]
    for side, x in ((-1, 5), (1, 43)):
        pts = P['arm'] if side < 0 else [(8 - px, py) for px, py in P['arm']]
        shapes.append((S(pts, k, x * k + (6 if pose == 'strike' else 0) * k * -side, (14 + ay + sw * side) * k), 'b'))
    shapes += [(S(p, k, 20 * k, (3 + by) * k), ch) for p, ch in P['head']]
    if P.get('weapon'):
        shapes += [(S(p, k, 0, (ay if pose != 'walk' else sw) * k), ch) for p, ch in P['weapon']]
    g = polygrid(W, H, shapes)
    return grid_sprite(with_detail(g, SD(P['det'], k, 0, by * k), W), W, H)


BASALT = {'leg': [(0, 0), (10, 0), (11, 15), (-1, 15)], 'arm': [(1, 0), (9, 0), (10, 30), (0, 30)],
          'torso': [([(4, 0), (8, -6), (12, 0), (16, -4), (20, 0), (24, -6), (28, 0), (32, -4), (36, 0), (40, 2), (38, 28), (2, 28), (0, 2)], 'b'),
                    ([(-2, 2), (-6, -12), (6, 0)], 'm'), ([(42, 2), (46, -12), (34, 0)], 'm')],
          'head': [([(0, 2), (8, -2), (16, 2), (16, 14), (0, 14)], 'b')],
          'det': [(24, 30, 'EEEE'), (25, 27, 'E'), (26, 32, 'EE'), (28, 23, 'O'), (29, 22, 'O'), (30, 21, 'OO'), (31, 34, 'O'), (32, 35, 'O'), (33, 36, 'OO'), (36, 26, 'OOOO'),
                  (19, 16, '1'), (19, 24, '1'), (19, 32, '1'), (19, 40, '1'), (11, 25, 'YY'), (11, 30, 'YY'), (16, 26, 'OOOOO')]}
SHARD = {'leg': [(1, 0), (9, 0), (8, 15), (2, 15)], 'arm': [(2, 0), (8, 0), (6, 30), (0, 22)],
         'torso': [([(4, 4), (12, -2), (28, -4), (36, 4), (38, 26), (2, 26)], 'b'), ([(6, 4), (-2, -14), (6, -12), (12, 2)], 'I'), ([(34, 4), (44, -16), (46, -10), (30, 2)], 'I'),
                   ([(16, 0), (18, -18), (24, -18), (24, 0)], 'I'), ([(14, 10), (6, -4), (12, -6), (20, 8)], 'I')],
         'head': [([(2, 2), (8, -4), (14, 2), (12, 12), (4, 12)], 'b')],
         'det': [(24, 25, 'W'), (25, 24, 'WWW'), (26, 23, 'WWWWW'), (27, 24, 'WWW'), (28, 25, 'W'), (10, 25, 'E'), (10, 30, 'E'), (6, 22, 'W'), (2, 30, 'W'), (12, 14, 'W')]}
TROLL = {'leg': [(0, 0), (10, 0), (12, 12), (12, 16), (-2, 16), (0, 10)], 'arm': [(2, 0), (8, 0), (10, 30), (12, 34), (2, 36), (0, 30)],
         'torso': [([(6, 2), (18, -4), (34, 0), (40, 12), (40, 26), (30, 30), (8, 30), (0, 20)], 'b'), ([(10, 14), (30, 14), (32, 28), (8, 28)], 'm'), ([(6, 26), (36, 26), (34, 32), (8, 32)], 'd')],
         'head': [([(0, 6), (6, 0), (14, 2), (17, 8), (14, 16), (4, 16)], 'b'), ([(12, 7), (18, 10), (16, 14), (12, 12)], 'b')],
         'weapon': [([(48, 58), (51, 16), (56, 10), (58, 18), (53, 58)], 'm')],
         'det': [(8, 23, 'E'), (8, 30, 'E'), (6, 22, '11111111111'), (17, 23, 'T'), (17, 31, 'T'), (16, 23, 'T'), (16, 31, 'T'), (22, 14, 'mm'), (21, 16, 'mm'), (20, 40, 'mm'),
                 (24, 52, 'T'), (30, 53, 'T'), (18, 54, 'T')]}
GIANT_ROCK = {'leg': [(0, 2), (6, 0), (12, 2), (13, 10), (12, 16), (0, 16), (-1, 9)],
              'arm': [(0, 2), (5, -2), (10, 1), (11, 12), (8, 15), (11, 20), (12, 28), (9, 33), (1, 33), (-2, 28), (-1, 18), (1, 14), (-1, 8)],
              'torso': [([(2, 6), (8, 0), (18, -2), (24, 2), (30, -2), (38, 4), (40, 14), (36, 18), (4, 18), (0, 14)], 'b'),
                        ([(4, 17), (20, 16), (36, 17), (38, 26), (30, 31), (10, 31), (2, 25)], 'b'),
                        ([(-8, 4), (-2, -2), (6, 2), (4, 10), (-6, 10)], 'm'), ([(48, 4), (42, -2), (34, 2), (36, 10), (46, 10)], 'm'),
                        ([(-6, 2), (-3, -10), (0, 2)], 'G'), ([(-1, 1), (2, -14), (5, 1)], 'G'), ([(36, 1), (39, -14), (42, 1)], 'G'), ([(41, 2), (44, -9), (47, 2)], 'G'),
                        ([(15, 8), (20, 3), (25, 8), (20, 14)], 'C')],
              'head': [([(1, 4), (5, -1), (11, -1), (15, 4), (14, 13), (8, 15), (2, 13)], 'b'),
                       ([(1, 1), (-2, -8), (4, 0)], 'C'), ([(6, -1), (8, -10), (10, -1)], 'C'), ([(12, 0), (18, -8), (15, 1)], 'C')],
              'det': [(8, 24, 'EE'), (8, 31, 'EE'), (12, 25, '111111'), (19, 26, 'II'), (20, 27, 'I'), (33, 8, '1111111111111111111111111111111111'),
                      (17, 4, 'g'), (14, 6, 'g'), (11, 7, 'g'), (17, 49, 'g'), (14, 50, 'g'), (11, 51, 'g'), (24, 14, '2'), (25, 15, '2'), (26, 16, '2'), (40, 36, '2'), (41, 37, '2'),
                      (22, 20, '44'), (21, 22, '444'), (36, 40, '44')]}
FORGE = {'leg': [(0, 0), (11, 0), (12, 13), (14, 16), (-2, 16), (-1, 13)], 'arm': [(1, 0), (9, 0), (10, 28), (0, 28)],
         'torso': [([(0, 2), (40, 2), (38, 22), (34, 30), (6, 30), (2, 22)], 'b'), ([(-6, 0), (8, -4), (10, 8), (-4, 8)], 'm'), ([(46, 0), (32, -4), (30, 8), (44, 8)], 'm'),
                   ([(13, 8), (27, 8), (27, 20), (13, 20)], 'N')],
         'head': [([(0, 4), (8, -2), (16, 4), (16, 16), (0, 16)], 'm'), ([(0, 6), (-6, -2), (-7, -6), (-2, -1), (2, 4)], 'T'), ([(16, 6), (22, -2), (23, -6), (18, -1), (14, 4)], 'T')],
         'weapon': [([(50, 50), (51, 4), (53, 4), (52, 50)], 'm'), ([(44, -6), (60, -6), (60, 4), (44, 4)], 'b')],
         'det': [(10, 21, 'NNNNNNNNNNNNNN'), (10, 23, 'OO'), (10, 30, 'OO'), (30, 22, 'OOOOOOOOOOOOO'), (31, 22, 'YYYYYYYYYYYY'), (32, 24, 'OOOOOOOOO'),
                 (27, 22, '1.1.1.1.1.1.1'), (28, 22, '1.1.1.1.1.1.1'), (29, 22, '1.1.1.1.1.1.1'), (-4, 50, 'OO')]}


def queen_f(step, pose='walk'):
    sway = [2, 0, -2, 0][step] if pose == 'walk' else 0
    up = {'walk': 0, 'wind': -8, 'strike': 4}[pose]
    g = polygrid(84, 116, [([(22, 30), (58, 30), (74 + sway, 112), (6 + sway, 112)], 'm'), ([(28, 44), (52, 44), (66, 112), (14, 112)], 'b'),
                           ([(30, 28), (50, 28), (50, 46), (30, 46)], 'b'), ([(30, 30), (24, 52), (28, 54), (34, 34)], 'T'),
                           ([(50, 30), (64, 40 + up), (62, 44 + up), (48, 36)], 'T'),
                           ([(65, 112 + up), (65, 18 + up), (68, 18 + up), (68, 112 + up)], 'T'),
                           ([(66, 4 + up), (72, 14 + up), (66, 24 + up), (60, 14 + up)], 'W'),
                           ([(30, 14), (50, 14), (54, 46), (26, 46)], 'W'), ([(33, 10), (47, 10), (48, 24), (40, 28), (32, 24)], 'T'),
                           ([(32, 10), (33, 0), (36, 9)], 'W'), ([(38, 9), (40, -2), (42, 9)], 'W'), ([(44, 9), (47, 0), (48, 10)], 'W')])
    det = [(17, 36, 'EE'), (17, 42, 'EE'), (23, 38, 'RRRR')] + [(112 - r, x + r, 'W') for x in range(16, 66, 6) for r in range(3)]
    if pose == 'strike':
        det += [(14 + up, 72 + i * 2, 'WW') for i in range(5)]
    return grid_sprite(with_detail(g, det, 84), 84, 116)


def captain_f(step, pose='walk'):
    sway = [3, 0, -3, 0][step] if pose == 'walk' else 0
    up = {'walk': 0, 'wind': -10, 'strike': 6}[pose]
    rows = [['.'] * 88 for _ in range(112)]
    for y in range(40, 110):
        for x in range(8, 80):
            if abs(x + .5 - 44 - sway * (y - 40) / 70) < 24 - max(0, y - 80) * .5 and (y < 96 or (x // 6 + step) % 2 == 0 or y < 100):
                rows[y][x] = 'b'
    g = polygrid(88, 112, [([(22, 42), (14, 70), (20, 72), (28, 46)], 'b'), ([(64, 42), (76, 56 + up), (72, 60 + up), (60, 48)], 'b'),
                           ([(74, 58 + up), (86, 20 + up * 2), (88, 22 + up * 2), (76, 60 + up)], 'W'),
                           ([(34, 22), (54, 22), (56, 34), (50, 42), (38, 42), (32, 34)], 'T'), ([(34, 34), (54, 34), (50, 52), (44, 56), (38, 52)], 'm'),
                           ([(22, 22), (66, 22), (60, 12), (44, 4), (28, 12)], 'N')])
    g = overlay([''.join(r) for r in rows], g)
    det = [(27, 38, 'EEE'), (27, 48, 'EEE'), (22, 24, 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'), (60, 24, '1111111111111111111111111111111111111111')] + [(y, 42, 'YY') for y in range(46, 90, 8)]
    return grid_sprite(with_detail(g, det, 88), 88, 112)


def kraken_f(step, pose='walk'):
    import math
    rows = [['.'] * 140 for _ in range(112)]
    for i in range(8):
        x0 = 30 + i * 11
        lift = 20 if pose == 'wind' and i % 2 else 0
        for kk in range(14):
            t = kk / 13
            x = x0 + math.sin(t * 4 + i + step * 1.2) * 10 * t + (i - 3.5) * 6 * t + (14 * t if pose == 'strike' else 0)
            y = 60 + t * (50 - lift)
            w = 4 - round(3 * t)
            for d in range(-w, w + 1):
                for yy in range(int(y), int(y) + 4):
                    if 0 <= int(x + d) < 140 and yy < 112:
                        rows[yy][int(x + d)] = 'm'
    g = [''.join(r) for r in rows]
    g = overlay(g, polygrid(140, 112, [([(40, 50), (44, 24), (56, 8), (70, 4), (84, 8), (96, 24), (100, 50), (92, 64), (48, 64)], 'b')]))
    det = [(46, 54, 'WWWW'), (47, 53, 'WEEW'), (48, 53, 'WEEW'), (49, 54, 'WWWW'), (46, 84, 'WWWW'), (47, 83, 'WEEW'), (48, 83, 'WEEW'), (49, 84, 'WWWW'),
           (20, 52, '44'), (14, 62, '444'), (12, 70, '44'), (30, 60, '2'), (31, 61, '2'), (28, 84, '2'), (29, 85, '2')]
    return grid_sprite(with_detail(g, det, 140), 140, 112)


def harpy_f(step, pose='walk'):
    up = step % 2 == 0 if pose == 'walk' else pose == 'wind'
    lw = [(24, 24), (2, 2), (8, 12), (0, 20), (8, 26), (2, 34), (26, 34)] if up else [(24, 24), (0, 28), (8, 34), (2, 42), (12, 42), (8, 50), (26, 36)]
    rw = [(36, 24), (58, 4), (52, 14), (60, 20), (52, 26), (58, 32), (36, 34)] if up else [(36, 24), (60, 28), (52, 34), (58, 42), (48, 42), (52, 50), (34, 36)]
    dy = 2 if pose == 'strike' else 0
    g = polygrid(60, 60, [(lw, 'm'), ([(24, 36 + dy), (36, 36 + dy), (38, 44 + dy), (22, 44 + dy)], 'm'), ([(25, 24 + dy), (35, 24 + dy), (36, 36 + dy), (24, 36 + dy)], 'T'),
                          ([(24, 6), (36, 4), (44, 12), (42, 30), (36, 22), (26, 24), (22, 16)], 'b'), ([(30, 10), (37, 10), (39, 16), (36, 21), (31, 20)], 'T'), (rw, 'm')])
    det = [(13, 35, 'EE'), (18, 36, 'RR')] + [(44 + dy + r, x, 'Y') for x in (26, 34) for r in range(8)] + [(52 + dy, 24, 'NNN'), (52 + dy, 32, 'NNN')]
    if pose == 'strike':
        det += [(52 + dy, 22, 'NNNNN'), (53 + dy, 22, 'N...N')]
    return grid_sprite(with_detail(g, det, 60), 60, 60)


def drake_f(step, pose='walk'):
    """The Cinder Drake: the dragon's design at 1.44x, with fire in its throat."""
    import math
    wing = 'up' if step % 2 == 0 else 'down'
    base = dragon_frame(step, wing, {'walk': 'walk', 'wind': 'rear', 'strike': 'lunge'}[pose])
    c = Canvas(156, 116)
    big = base.img.resize((round(108 * 1.44), round(84 * 1.38)), 0)
    c.paste(big, 0, 0)
    return c


def _reg(name, fn, poses=True):
    register(name, [(lambda k=k: fn(k, 'walk')) for k in range(4)], [lambda: fn(0, 'wind'), lambda: fn(0, 'strike')] if poses else None)


_reg('warg', warg_f); _reg('icewarg', lambda s, p: warg_f(s, p, True)); _reg('hound', hound_f); _reg('bear', bear_f)
_reg('mammoth', mammoth_f); _reg('griffin', griffin_f)
_reg('salamander', lambda s, p: lizard(70, 40, 1, s, p)); _reg('ashmother', lambda s, p: lizard(154, 88, 2.2, s, p, True))
_reg('lobster', lobster_f); _reg('jelly', jelly_f); _reg('wisp', wisp_f); _reg('harpy', harpy_f)
_reg('basalt', lambda s, p: upright(72, 76, 1.25, s, p, BASALT)); _reg('elemental', lambda s, p: flame_f(s, p))
_reg('shardling', lambda s, p: upright(58, 68, 1.05, s, p, SHARD)); _reg('glacierheart', lambda s, p: upright(116, 136, 2.05, s, p, SHARD))
_reg('troll', lambda s, p: upright(64, 76, 1.2, s, p, TROLL)); _reg('tyrant', lambda s, p: upright(132, 124, 2.1, s, p, GIANT_ROCK))
_reg('forgeking', lambda s, p: upright(100, 104, 1.6, s, p, FORGE))
_reg('queen', queen_f); _reg('captain', captain_f); _reg('kraken', kraken_f); _reg('drake', drake_f)


def flame_f(step, pose='walk'):
    """The fire elemental (48x62): a body of flame with a hot core; it flares up, then lashes forward."""
    import math
    rows = [['.'] * 48 for _ in range(62)]
    grow = {'walk': 0, 'wind': -5, 'strike': 2}[pose]; lean = 3 if pose == 'strike' else 0
    for y in range(4 + grow, 60):
        t = (y - 4 - grow) / (56 - grow)
        hw = 3 + 15 * math.sin(min(1, t * 1.15) * math.pi * .6) + (2 if y > 50 else 0)
        for x in range(48):
            cx = 24 + lean * (1 - t) + math.sin(y * .35 + step * 1.7) * 2 * (1 - t)
            tongue = y < 26 and abs(x - 24) > 4 and (x + y // 3 + step) % 7 < 3
            if abs(x + .5 - cx) < hw and not tongue:
                rows[y][x] = 'O' if abs(x + .5 - cx) > hw - 3 else 'b'
    g = [''.join(r) for r in rows]
    det = [(y, x, 'Y') for y in range(36, 54) for x in range(18, 31) if ((x - 24) / 6) ** 2 + ((y - 46) / 8) ** 2 <= 1]
    det += [(34 + (grow // 2), 19 + lean, 'NNN'), (34 + (grow // 2), 27 + lean, 'NNN'), (35 + (grow // 2), 20 + lean, 'N'), (35 + (grow // 2), 28 + lean, 'N')]
    for i in range(5):
        det.append(((2 + i * 5 + step * 3) % 20 + grow + 2, 10 + i * 7, 'Y'))
    return grid_sprite(with_detail(g, det, 48), 48, 62)


# ---------- organic upright creatures (redefined: the troll, basalt and crystal creatures were too blocky) ----------
TROLL = {
    'leg': [(1, 0), (10, 0), (12, 5), (10, 10), (13, 14), (13, 16), (-2, 16), (0, 12), (-1, 5)],
    'arm': [(1, 0), (8, -1), (10, 7), (9, 16), (11, 24), (13, 31), (10, 36), (2, 36), (-2, 30), (0, 21), (-1, 10)],
    'torso': [([(4, 4), (12, -3), (26, -5), (36, -1), (42, 8), (43, 20), (37, 30), (20, 33), (4, 31), (-2, 21), (-2, 10)], 'b'),
              ([(9, 13), (30, 11), (35, 21), (29, 31), (11, 31), (5, 22)], 'm'),
              ([(5, 28), (36, 28), (33, 34), (24, 31), (17, 35), (8, 31)], 'd')],
    'head': [([(0, 8), (3, 2), (11, 0), (16, 4), (18, 11), (15, 17), (9, 19), (3, 16), (0, 13)], 'b'),
             ([(13, 8), (20, 11), (18, 15), (13, 13)], 'b'), ([(0, 9), (-4, 6), (-3, 12), (1, 12)], 'b')],
    'weapon': [([(48, 58), (50, 22), (53, 12), (58, 9), (61, 15), (57, 24), (53, 58)], 'm')],
    'det': [(9, 23, 'E'), (9, 30, 'E'), (7, 22, '1111111111'), (8, 21, '1'), (17, 24, 'T'), (18, 24, 'T'), (17, 31, 'T'), (18, 31, 'T'), (16, 25, '111111'),
            (13, 36, '2'), (14, 37, '2'), (12, 33, '2'),                                                       # nose shading
            (21, 14, 'gg'), (20, 16, 'G'), (19, 18, 'gg'), (21, 42, 'gg'), (20, 44, 'G'), (4, 26, 'g'), (5, 27, 'G'),     # moss on shoulders and head
            (24, 19, '2'), (30, 46, '2'), (36, 20, '2'), (27, 27, '44'), (28, 26, '4'), (40, 34, '2'),                  # warts and light on the belly
            (22, 54, 'T'), (30, 55, 'T'), (16, 56, 'T'), (38, 57, 'T')]}                                                # spikes in the club
BASALT = {
    'leg': [(0, 0), (11, 0), (12, 10), (13, 16), (-2, 16), (-1, 10)],
    'arm': [(0, 0), (10, -1), (11, 10), (10, 20), (13, 26), (13, 33), (-2, 33), (-2, 26), (0, 20), (-1, 10)],
    'torso': [([(2, 2), (6, -6), (10, -2), (14, -8), (18, -3), (22, -9), (26, -3), (30, -7), (34, -1), (38, -5), (41, 3), (40, 18), (37, 29), (4, 29), (1, 18)], 'b'),
              ([(-4, 4), (-7, -12), (-1, -8), (4, 2)], 'm'), ([(44, 4), (48, -14), (42, -9), (37, 2)], 'm'), ([(20, -2), (22, -14), (25, -2)], 'm')],
    'head': [([(1, 3), (5, -1), (12, -1), (16, 3), (16, 12), (12, 15), (4, 15), (0, 12)], 'b')],
    'det': [(24, 30, 'OOO'), (25, 28, 'OO'), (26, 27, 'O'), (27, 26, 'OO'), (28, 25, 'O'), (29, 26, 'OO'), (30, 28, 'O'), (31, 29, 'OO'), (32, 31, 'O'),      # lava seams
            (26, 35, 'O'), (27, 36, 'O'), (28, 37, 'OO'), (29, 39, 'O'), (35, 20, 'OOO'), (36, 23, 'OO'), (37, 25, 'O'), (40, 30, 'YO'),
            (10, 24, 'YY'), (10, 30, 'YY'), (11, 25, 'O'), (11, 31, 'O'), (13, 25, 'OOOOO'),                                                          # eyes and mouth
            (18, 13, '1'), (18, 21, '1'), (18, 29, '1'), (18, 37, '1'), (18, 45, '1'), (22, 15, '4'), (22, 31, '4'), (17, 10, '44'), (17, 42, '44')]}
SHARD = {
    'leg': [(2, 0), (8, 0), (10, 8), (7, 16), (3, 16), (0, 8)],
    'arm': [(2, 0), (8, -1), (9, 8), (7, 18), (10, 30), (5, 36), (0, 26), (1, 12)],
    'torso': [([(3, 6), (10, -2), (20, -5), (30, -2), (37, 6), (39, 18), (33, 27), (20, 30), (7, 27), (1, 18)], 'b'),
              ([(8, 2), (4, -9), (8, -9), (12, 1)], 'I'), ([(32, 2), (37, -11), (40, -7), (28, 1)], 'I'),
              ([(17, -2), (19, -13), (23, -15), (24, -2)], 'I'), ([(12, 8), (9, -2), (13, -3), (17, 6)], 'J'), ([(27, 7), (31, -3), (33, 1), (30, 9)], 'J')],
    'head': [([(2, 4), (8, -3), (14, 4), (13, 11), (8, 14), (3, 11)], 'b')],
    'det': [(24, 26, 'W'), (25, 25, 'WWW'), (26, 24, 'WWWWW'), (27, 25, 'WWW'), (28, 26, 'W'), (25, 28, 'I'), (23, 24, 'I'),                  # the heart crystal
            (9, 24, 'EE'), (9, 30, 'EE'), (20, 14, 'JJJ'), (21, 13, 'J'), (22, 12, 'J'), (19, 33, 'JJJ'), (20, 35, 'J'), (30, 16, 'J'), (31, 17, 'J'),  # facet lines
            (0, 22, 'W'), (-4, 26, 'W'), (2, 33, 'W'), (12, 12, 'W'), (3, 40, 'W')]}
BASALT['arm'] = [(1, 0), (8, -1), (9, 10), (8, 20), (11, 26), (11, 33), (-1, 33), (-1, 26), (1, 20), (0, 10)]
BASALT['tw'] = .64
GIANT_ROCK['tw'] = .8
