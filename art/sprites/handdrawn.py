"""Hand-pixelled creatures: drawn pixel by pixel as character grids, not built from shapes.

Grid letters:  . empty
  b  body region (ch 0)        m  second colour region (ch 1)      d  far-side body (ch 0, a tone darker)
  1 2 3 4  body tones dark->light (ch 0, levels 0-3), placed by hand
  5 6 7 8  second-colour tones (ch 1, levels 0-3)
  E eye (swappable)  W white  N nose/claw black  T tooth
Region letters are cel shaded flat (light on top edges, shadow on the bottom edges, base inside), like
the characters; every hand-placed digit wins over that. A selective outline is added at the end.
"""
from px import Canvas
from sprites.creatures import C, EYE

FIXED = {'E': EYE, 'W': '#f4ece0', 'N': '#1a1210', 'T': '#f0e8d8'}


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
