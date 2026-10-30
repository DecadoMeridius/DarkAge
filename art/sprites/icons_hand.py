"""Hand-pixelled item icon templates (override icons.py's ic_<shape>): ores, bars, gems, logs, fibre, hay,
wool, cloth, hide, bones, eggs, fish, fruit, roots, leaves, berries, flowers, mushrooms, seeds, food,
bread, pies, jars, bottles, scrolls and artifacts. Same contract as icons.py: ch 0 = the item's colour,
ch 1 = its second colour, so every item keeps its own colours. Drawn as pixel grids (handdrawn.grid_sprite):
b / m are cel-shaded regions in ch 0 / ch 1, digits 1-4 and 5-8 are hand-placed tones, W N T Y R G g fixed colours.
Each grid is centred in the 32x32 icon."""
from sprites.handdrawn import grid_sprite


def icon(rows, dy=0):
    w = max(len(r) for r in rows); h = len(rows)
    k = min(26 / w, 24 / h, 1.7)  # grow small designs to fill the slot; shading and outline are applied after, so they stay 1px
    if k > 1.05:
        W2, H2 = round(w * k), round(h * k)
        rows = [''.join((rows[int(y / k)] + '.' * w)[int(x / k)] for x in range(W2)) for y in range(H2)]
        w, h = W2, H2
    x0, y0 = (32 - w) // 2, (32 - h) // 2 + dy
    out = ['.' * 32] * 32
    out = [list(r) for r in out]
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if c != '.' and 0 <= y0 + y < 32 and 0 <= x0 + x < 32:
                out[y0 + y][x0 + x] = c
    return grid_sprite([''.join(r) for r in out], 32, 32)


ICONS = {
    'bar': [  # an ingot in three-quarter view
        "......44444444444444......",
        ".....4bbbbbbbbbbbbbb4.....",
        "....4bbbbbbbbbbbbbbbb3....",
        "...4bbbbbbbbbbbbbbbbbb3...",
        "..444444444444444444444b..",
        "..3bbbbbbbbbbbbbbbbbbb3b2.",
        "..3bbbbbbbbbbbbbbbbbbb3b2.",
        "..3bbbbbbbbbbbbbbbbbbb32..",
        "..2222222222222222222222..",
    ],
    'ore': [  # a lump of rock with veins of the ore colour
        ".......mmmmm..........",
        ".....mmmmmmmmmm.......",
        "....mmmbbmmmmmmmm.....",
        "...mmmbbbbmmmmmmmmm...",
        "..mmmmmbbmmmmmbbbmmm..",
        ".mmmmmmmmmmmmbbbbbmmm.",
        ".mmmbbmmmmmmmmbbmmmmm.",
        "mmmbbbbmmmmmmmmmmmmmmm",
        "mmmmbbmmmmmmbbmmmmmmmm",
        ".mmmmmmmmmmbbbbmmmmmm.",
        "..mmmmmmmmmmbbmmmmmm..",
        "....mmmmmmmmmmmmmm....",
    ],
    'gem': [  # a cut stone with a bright table facet
        "......bbbbbbbbbb......",
        "....bb4444444444bb....",
        "...b44bbbbbbbbbb3bb...",
        "..bbbbbbbbbbbbbbbbbb..",
        ".bbbbbbbbbbbbbbbbbbbb.",
        "..bbbbbbbbbbbbbbbbbb..",
        "....bbbbbbbbbbbbbb....",
        "......bbbbbbbbbb......",
        "........bbbbbb........",
        "..........bb..........",
    ],
    'stone': [
        "......bbbbbbb.......",
        "....bbbbbbbbbbbb....",
        "..bbbb4bbbbbbbbbbb..",
        ".bbb44bbbbbbbbbbbbb.",
        "bbbbbbbbbbbb2bbbbbbb",
        "bbbbbbbbbbb2bbbbbbbb",
        ".bbbbbbbbbbbbbbbbbb.",
        "...bbbbbbbbbbbbbb...",
    ],
    'log': [  # a cut log: bark along its length, rings on the end
        ".mmmmmmmmmmmmmmmmmm.....",
        "mmmmmmmmmmmmmmmmmmmmbbb.",
        "mmm6mmmmm6mmmmmm6mmbbbbb",
        "mmmmmmmmmmmmmmmmmmmb3b3b",
        "mm6mmmmmm6mmmmmm6mmb3b3b",
        "mmmmmmmmmmmmmmmmmmmbbbbb",
        ".mmmmmmmmmmmmmmmmmm.bbb.",
    ],
    'fiber': [  # a twisted hank of plant fibre
        "..b......b......b..",
        "...b....bb.....b...",
        "...bb..b.b....bb...",
        "....b.b...b..b.b...",
        "....bb.....bb..b...",
        "....mmmmmmmmmmmm...",
        "....mmmmmmmmmmmm...",
        "....b.b...b..b.b...",
        "...bb..b..b..b..b..",
        "...b...b...b.b...b.",
        "..b....b....b.....b",
    ],
    'hay': [  # a tied bundle of hay
        ".b.b..b.b.b..b.b.b..",
        "..bbb.bbbbb.bbbbb...",
        "..bbbbbbbbbbbbbbbb..",
        "..bbbbbbbbbbbbbbbb..",
        "..mmmmmmmmmmmmmmmm..",
        "..bbbbbbbbbbbbbbbb..",
        "..bbbbbbbbbbbbbbbb..",
        ".bbbbbbbbbbbbbbbbbb.",
        "b.b.bb.b.bb.b.b.bb.b",
    ],
    'wool': [  # a fluffy fleece
        "......bbb..bbb.......",
        "....bbb44bbb44bb.....",
        "...bb4bbbbb4bbbbbb...",
        "..bbbbbbbbbbbbbbbbb..",
        ".bbb4bbbbbbbbb4bbbbb.",
        "bbbbbbbbbbbbbbbbbbbbb",
        ".bbbbbbb2bbbbbbbb2bb.",
        "..bbbbbbbbbbbbbbbbb..",
        "....bbbbbbbbbbbbb....",
    ],
    'cloth': [  # a folded bolt of cloth
        "....bbbbbbbbbbbbbbbb..",
        "...bbbbbbbbbbbbbbbbbb.",
        "..44444444444444444bb.",
        "..bbbbbbbbbbbbbbbbbbb.",
        "..bbbbbbbbbbbbbbbbbbb.",
        "..mmmmmmmmmmmmmmmmmmm.",
        "..bbbbbbbbbbbbbbbbbbb.",
        "..bbbbbbbbbbbbbbbbbb..",
        "..2222222222222222b...",
    ],
    'hide': [  # a stretched hide
        "..b..............b..",
        ".bbbb..........bbbb.",
        "..bbbbbbbbbbbbbbbb..",
        "...bbbbbbbbbbbbbb...",
        "..bbbbbbb44bbbbbbb..",
        "..bbbbbb4bbbbbbbbb..",
        "..bbbbbbbbbbbbbbbb..",
        "...bbbbbbbbbbbbbb...",
        "..bbbbbbbbbbbbbbbb..",
        ".bbbb..........bbbb.",
        "..b..............b..",
    ],
    'bone': [
        ".TT................TT.",
        "TTTT..............TTTT",
        "TTTTTTTTTTTTTTTTTTTTTT",
        ".TTTTTTTTTTTTTTTTTTTT.",
        "TTTT..............TTTT",
        ".TT................TT.",
    ],
    'fang': [
        "TTTTTT",
        "TTTTTT",
        "TTTTT.",
        ".TTTT.",
        ".TTT..",
        "..TT..",
        "..T...",
    ],
    'egg': [
        "....bbbb....",
        "...bb44bb...",
        "..bb4bbbbb..",
        ".bb4bbbbbbb.",
        ".bbbbbbbbbb.",
        "bbbbbbbbbbbb",
        "bbbbbbbbbbbb",
        "bbbbbbbbbbb2",
        ".bbbbbbbbb2.",
        "..bbbbbbb2..",
        "....2222....",
    ],
    'fish': [  # a fish in profile, tail left, with a fin and an eye
        "..............mmm.......",
        ".mm.........mmmmmm......",
        ".mmm....bbbbbbbbbbbbb...",
        "..mmm.bbbbbbbbbbbbbbbbb.",
        "...mmbbbbbbbbbbbbbbbWNbb",
        "...mmbbbbbbbbbbbbbbbbbbb",
        "..mmm.bbbbbbbbbbbbbbbb2.",
        ".mmm....bb2bbbbbbbbb2...",
        ".mm.........mmm.........",
    ],
    'round': [  # a round fruit with a leaf
        "........m.mm....",
        "........mmm.....",
        "....bbbbmbbbb...",
        "...bb44bbbbbbb..",
        "..bb4bbbbbbbbbb.",
        "..bbbbbbbbbbbbb.",
        ".bbbbbbbbbbbbbbb",
        ".bbbbbbbbbbbbbbb",
        "..bbbbbbbbbbbbb.",
        "..bbbbbbbbbbb2..",
        "....bbbbbbb2....",
    ],
    'root': [  # a tapering root vegetable with its leafy top
        "...m.m.m...",
        "...mmmmm...",
        "....mmm....",
        "...bbbbb...",
        "..bb4bbbb..",
        "..bbbbbbb..",
        "..bbbbbb2..",
        "...bbbbb...",
        "...bbbb2...",
        "....bbb....",
        "....bb.....",
        ".....b.....",
    ],
    'leaf': [
        "..........bbb",
        "........bbbbb",
        "......bb4bbbb",
        "....bb4bbbb2.",
        "...bbbmbbb2..",
        "..bbbmbbb2...",
        ".bbmbbbb2....",
        ".bmbb22......",
        "m............",
    ],
    'long': [  # a long vegetable (leek, carrot)
        "..mm.mm..........",
        "...mmm...........",
        "....bbb..........",
        "....bb4bb........",
        ".....bbbbbb......",
        "......bbbbbbb....",
        ".......bbbbbbbb..",
        ".........bbbbb2..",
        "...........bb2...",
    ],
    'berry': [  # a sprig of berries
        "......m......",
        ".....m.m.....",
        "....m...m....",
        "...bb..bb....",
        "..b4bbb4bb...",
        "..bbbbbbbb...",
        "...bbbbbbbb..",
        "....bb4bbbb..",
        "....bbbbbb...",
        ".....bbbb....",
    ],
    'flower': [
        "....bb.bb....",
        "...b4bbb4b...",
        "...bbbYbbb...",
        "..bb4YYYbbb..",
        "...bbbYbbb...",
        "...bbbbbbb...",
        "....bb.bb....",
        "......G......",
        "....GgG......",
        ".....GGg.....",
        "......G......",
    ],
    'mush': [  # a mushroom cap with spots on a pale stalk
        "....bbbbbbbb....",
        "..bbbWbbbbbWbb..",
        ".bbbbbbbbbbbbbb.",
        "bbWbbbbbWbbbbbbb",
        "bbbbbbbbbbbbbbb2",
        ".22222222222222.",
        ".....TTTTTT.....",
        ".....TTTTTT.....",
        "......TTTT......",
    ],
    'seed': [  # a little seed packet
        ".bbbbbbbbbbbb.",
        "bbbbbbbbbbbbbb",
        "bTTTTTTTTTTTTb",
        "bTTTTmmTTTTTTb",
        "bTTTmmmmTTTTTb",
        "bTTTTmmTTTTTTb",
        "bTTTTTTTTTTTTb",
        "bTTTTTTTTTTTTb",
        "bbbbbbbbbbbbbb",
    ],
    'bread': [  # a loaf with scored crust
        "....bbbbbbbbbbb.....",
        "..bbbb44bbbbbbbbb...",
        ".bbb4bbbb2bbbb2bbb..",
        "bbbbbbbb2bbbb2bbbbb.",
        "bbbbbbbbbbbbbbbbbbbb",
        "bbbbbbbbbbbbbbbbbbbb",
        ".22222222222222222b.",
    ],
    'pie': [
        "...bbbbbbbbbbbbbb...",
        ".bbbbmbbbbmbbbbmbbb.",
        "bbbbbbmbbmbbmbbmbbbb",
        "bbbbbbbbmbbbbmbbbbbb",
        "TTTTTTTTTTTTTTTTTTTT",
        ".TTTTTTTTTTTTTTTTTT.",
        "...TTTTTTTTTTTTTT...",
    ],
    'food': [  # a bowl of something hot
        "...W..W..W...",
        "....W..W..W..",
        ".bbbbbbbbbbb.",
        "b4bbbbbbbbbbb",
        "TTTTTTTTTTTTT",
        "TTTTTTTTTTTTT",
        ".TTTTTTTTTTT.",
        "...TTTTTTT...",
    ],
    'jar': [
        "...mmmmmmm...",
        "...mmmmmmm...",
        "..TTTTTTTTT..",
        ".TbbbbbbbbbT.",
        ".TbWbbbbbbbT.",
        ".TbWbbbbbbbT.",
        ".TbbbTTTbbbT.",
        ".TbbbTTTbbbT.",
        ".TbbbbbbbbbT.",
        ".TbbbbbbbbbT.",
        "..TTTTTTTTT..",
    ],
    'bottle': [
        ".....mm.....",
        ".....mm.....",
        ".....TT.....",
        "....TbbT....",
        "...TbbbbT...",
        "..TbWbbbbT..",
        "..TbWbbbbT..",
        "..TbbbbbbT..",
        "..TbbbbbbT..",
        "...TTTTTT...",
    ],
    'scroll': [
        ".mmmmmmmmmmmmmm.",
        "mmTTTTTTTTTTTTmm",
        ".TTTTTTTTTTTTTT.",
        ".TT2222222222TT.",
        ".TTTTTTTTTTTTTT.",
        ".TT22222222TTTT.",
        ".TTTTTTTTTTTTTT.",
        ".TT222222222TTT.",
        "mmTTTTTTTTTTTTmm",
        ".mmmmmmmmmmmmmm.",
    ],
    'artifact': [  # an old carved figurine
        ".....bbbb.....",
        "....bbbbbb....",
        "....bNbbNb....",
        "....bbbbbb....",
        ".....bbbb.....",
        "...bbbbbbbb...",
        "..bb4bbbbbbb..",
        "..bbbbmmbbbb..",
        "...bbbmmbbb...",
        "...bbbbbbbb...",
        "..bbbbbbbbbb..",
        "..2222222222..",
    ],
    'feather': [
        "............bb",
        "..........bbbb",
        "........bb4bb.",
        "......bb4bbb..",
        ".....bb4bbb...",
        "....bbmbbb....",
        "...bbmbbb.....",
        "..bbmbb.......",
        "..mbb.........",
        ".m............",
    ],
    'goo': [
        ".....bbbbbb.....",
        "...bbb44bbbbb...",
        "..bb4bbbbbbbbb..",
        ".bbbbbbbbbbbbbb.",
        "bbbbbbbbbbbbbbbb",
        "b.bbbbbbbbbbbb.b",
        "..b.bbbb.bbb.b..",
        "....b..b...b....",
    ],
    'nut': [
        "....mmmm....",
        "..mmmmmmmm..",
        ".mmmmmmmmmm.",
        "..bbbbbbbb..",
        ".bb4bbbbbbb.",
        ".bbbbbbbbbb.",
        "..bbbbbbb2..",
        "...bbbbb2...",
        ".....bb.....",
    ],
}


# ---- shapes built from simple pieces (playtest 4: logs, boots, artifacts and minerals that differ) ----
def _grid(W, H):
    return [['.'] * W for _ in range(H)]


def _put(g, x, y, ch):
    if 0 <= y < len(g) and 0 <= x < len(g[0]):
        g[y][x] = ch


def _ell(g, cx, cy, rx, ry, ch):
    for y in range(len(g)):
        for x in range(len(g[0])):
            if ((x - cx) / (rx + .5)) ** 2 + ((y - cy) / (ry + .5)) ** 2 <= 1:
                g[y][x] = ch


def _rect(g, x0, y0, w, h, ch):
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            _put(g, x, y, ch)


def _rows(g):
    return [''.join(r) for r in g]


def _log_bundle():  # two split logs stacked, bark along the side, rings on the cut ends
    g = _grid(28, 20)
    for x0, cy in ((1, 13), (6, 6)):
        _rect(g, x0, cy - 4, 17, 9, 'm')
        for x in range(x0 + 2, x0 + 16, 4):
            _put(g, x, cy - 3, '7'); _put(g, x + 1, cy + 2, '5'); _put(g, x + 2, cy + 3, '5')
        _ell(g, x0 + 17, cy, 3, 4, 'b')
        _put(g, x0 + 17, cy, '2'); _put(g, x0 + 16, cy - 1, '3'); _put(g, x0 + 18, cy + 1, '3'); _put(g, x0 + 17, cy - 2, '3'); _put(g, x0 + 17, cy + 2, '3')
        _put(g, x0 + 15, cy - 3, '4')
    return _rows(g)


def _boot():  # one boot from the side: shaft, folded cuff, toe, heel and sole
    g = _grid(20, 22)
    _rect(g, 4, 2, 8, 13, 'b'); _rect(g, 4, 13, 13, 5, 'b'); _ell(g, 15, 15, 3, 2, 'b')
    _rect(g, 3, 0, 10, 3, 'm')
    _rect(g, 3, 18, 16, 2, 'm'); _rect(g, 4, 20, 4, 1, 'm')
    for y in (6, 9): _put(g, 10, y, '2'); _put(g, 11, y, '2')
    _put(g, 5, 4, '4'); _put(g, 5, 5, '4'); _put(g, 5, 6, '4'); _put(g, 14, 14, '4')
    return _rows(g)


def _crown():
    g = _grid(24, 16)
    _rect(g, 2, 9, 20, 6, 'b')
    for cx in (3, 12, 20):
        for y in range(1, 10):
            w = (y - 1) // 3
            _rect(g, cx - w, y, 2 * w + 1, 1, 'b')
    _put(g, 12, 0, 'Y')
    _put(g, 7, 11, 'R'); _put(g, 12, 11, 'G'); _put(g, 17, 11, 'R')
    _rect(g, 2, 9, 20, 1, '4'); _rect(g, 2, 14, 20, 1, '2')
    return _rows(g)


def _coin():
    g = _grid(20, 20)
    _ell(g, 10, 10, 9, 9, 'b'); _ell(g, 10, 10, 6, 6, '3'); _ell(g, 10, 10, 5, 5, 'b')
    _rect(g, 8, 6, 2, 8, '2'); _rect(g, 10, 6, 3, 2, '2'); _rect(g, 10, 9, 2, 2, '2')  # a worn stamped letter
    _put(g, 5, 4, '4'); _put(g, 4, 5, '4'); _put(g, 6, 3, '4')
    return _rows(g)


def _mask():
    g = _grid(20, 22)
    _ell(g, 10, 11, 9, 10, 'b')
    _rect(g, 4, 8, 4, 3, 'N'); _rect(g, 12, 8, 4, 3, 'N')                                  # eye holes
    _rect(g, 9, 11, 2, 5, '2'); _rect(g, 7, 17, 6, 1, 'N')                                 # nose ridge, mouth slit
    _rect(g, 3, 6, 6, 1, '4'); _rect(g, 11, 6, 6, 1, '4')                                  # brows
    _put(g, 5, 3, '4'); _put(g, 4, 4, '4')
    return _rows(g)


def _amphora():
    g = _grid(18, 24)
    _rect(g, 6, 0, 6, 2, 'b'); _rect(g, 7, 2, 4, 3, 'b')
    _ell(g, 9, 11, 7, 7, 'b'); _rect(g, 7, 17, 4, 4, 'b'); _rect(g, 8, 21, 2, 2, 'b')
    for y in range(3, 10): _put(g, 3 if y > 5 else 5, y, 'm'); _put(g, 14 if y > 5 else 12, y, 'm')
    _put(g, 4, 5, 'm'); _put(g, 13, 5, 'm')
    _rect(g, 3, 10, 12, 1, 'm'); _rect(g, 4, 13, 10, 1, 'm')                              # painted bands
    _put(g, 5, 7, '4'); _put(g, 4, 8, '4'); _put(g, 14, 9, '.'); _put(g, 13, 16, '.')     # a chip out of the rim
    return _rows(g)


def _flute():
    g = _grid(26, 26)
    for k in range(22):
        x, y = 2 + k, 22 - k
        _put(g, x, y, 'b'); _put(g, x + 1, y, 'b'); _put(g, x, y - 1, 'b'); _put(g, x + 1, y + 1, '2')
    for k in (6, 10, 14, 18):
        _put(g, 2 + k, 21 - k, 'N')
    _rect(g, 22, 0, 3, 3, 'm')
    return _rows(g)


def _brooch():
    g = _grid(22, 22)
    _ell(g, 11, 11, 10, 10, 'm'); _ell(g, 11, 11, 7, 7, '6'); _ell(g, 11, 11, 6, 6, 'b')
    for a in range(8):
        import math
        x, y = 11 + round(math.cos(a * .785) * 9), 11 + round(math.sin(a * .785) * 9)
        _put(g, x, y, '8')
    _put(g, 9, 8, '4'); _put(g, 8, 9, '4'); _put(g, 10, 8, '4')
    return _rows(g)


def _crystal():  # a cluster of prisms
    g = _grid(24, 24)
    for cx, top, w in ((7, 6, 3), (14, 1, 4), (19, 9, 3)):
        for y in range(top, 22):
            ww = min(w, (y - top) // 2)
            _rect(g, cx - ww, y, 2 * ww + 1, 1, 'b')
        for y in range(top + 3, 21): _put(g, cx, y, '4' if y < top + 8 else '3')
        _put(g, cx + w, 21, '1')
    _rect(g, 2, 21, 21, 2, 'm')
    return _rows(g)


def _stepcut():  # an emerald cut: a rectangle with stepped facets
    g = _grid(22, 18)
    _rect(g, 2, 0, 18, 18, 'b')
    for c in ((2, 0), (19, 0), (2, 17), (19, 17)): _put(g, c[0], c[1], '.')
    _rect(g, 5, 3, 12, 12, '3'); _rect(g, 6, 4, 10, 10, 'b'); _rect(g, 8, 6, 6, 6, '4')
    _rect(g, 2, 0, 18, 1, '4'); _rect(g, 2, 17, 18, 1, '1')
    return _rows(g)


def _brilliant():  # a round brilliant seen from the side: crown and pointed pavilion
    g = _grid(24, 20)
    for y in range(0, 7):
        w = 6 + y + (1 if y > 2 else 0)
        _rect(g, 12 - w, y, 2 * w, 1, 'b')
    for y in range(7, 20):
        w = max(1, 12 - (y - 6))
        _rect(g, 12 - w, y, 2 * w, 1, 'b')
    _rect(g, 7, 0, 10, 1, '4'); _rect(g, 0, 6, 24, 1, '3')
    for k in range(6): _put(g, 6 + k * 2, 8 + k, '2'); _put(g, 17 - k * 2, 8 + k, '4')
    return _rows(g)


ICONS.update({'log': _log_bundle(), 'boots': _boot(), 'crown': _crown(), 'coin': _coin(), 'mask': _mask(), 'amphora': _amphora(),
              'flute': _flute(), 'brooch': _brooch(), 'crystal': _crystal(), 'stepcut': _stepcut(), 'brilliant': _brilliant()})

SPRITES = {f'ic_{k}': (lambda v=v: icon(v)) for k, v in ICONS.items()}
