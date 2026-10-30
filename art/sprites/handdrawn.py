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


SPRITES = {}  # a sample for now: previewed with art/preview_creatures.py, not yet used in the game
SAMPLE = {'wolf': wolf_hand}
