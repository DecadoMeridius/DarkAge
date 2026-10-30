"""Briarholt's keep, hand-pixelled: every sprite here is a grid of hand-placed pixels (one letter per
art pixel, outlines placed by hand), mirrored where the piece is symmetrical (the row is written up to
the middle and reflected). Light from the top-left.

Floors of the keep (x_kingdom.js): pillars, the grand stair up and the stair down, the throne on its
dais, a carved wardrobe, a war table with the map of Valdmark, a copper bath, portraits, a great
kitchen hearth with its cauldron, a wine rack, cell bars, a tomb with a stone effigy and a heap of
treasure."""
from px import Canvas

PAL = {
    'k': '#1e1820', 'z': '#120c10',
    'S': '#d8d2cc', 's': '#b4aeaa', 'm': '#8e8a8c', 'd': '#6a666c', 'D': '#46424a',
    'Y': '#ffe080', 'y': '#e8b830', 'o': '#b8862a', 'O': '#7a5a1a',
    'P': '#9a66cc', 'p': '#6a3a9a', 'q': '#4a2470', 'Q': '#2a1440',
    'W': '#c8945a', 'w': '#9a6638', 'b': '#7a4c2c', 'B': '#5a3622', 'n': '#3a2218',
    'I': '#c8ced8', 'i': '#8a92a4', 'j': '#565a68', 'J': '#2e3038',
    'R': '#e06a4a', 'r': '#b8402e', 'e': '#7a2420',
    'C': '#fff4dc', 'c': '#e8dcc0', 'v': '#c8b898', 'V': '#a89878',
    'G': '#8ac868', 'g': '#4a8a3a', 'A': '#7ab8e8', 'a': '#3a7ab8', 'x': '#5a1424',
    'F': '#fff4c0', 'f': '#ffd25a', 'h': '#f29a32', 'H': '#d0502a', 'u': '#e8a070', 'U': '#b8704a',
}


def grid(rows, mirror=False, odd=False):
    if mirror:
        rows = [r + (r[:-1] if odd else r)[::-1] for r in rows]
    W = max(len(r) for r in rows)
    s = Canvas(W, len(rows))
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in PAL:
                s.set(x, y, PAL[ch])
    return s


# a stone pillar, 24 wide: capital, fluted shaft, plinth (mirrored)
PILLAR = (['..kkkkkkkkkk', '.kSSSSSSSSSS', 'kSsssssssssS', 'kdddddddddds', '.kmmmmmmmmmd', '..kSsssssssm', '...kSdsSsdsm'] +
          ['...kSdsSsdsm', '...kSdmSsdmm', '...kSdsSsdsm', '...kSdmSsdsm'] * 13 +
          ['..kSsssssssm', '.kSSSSSSSSSs', 'kssssssssssm', 'kmmmmmmmmmmd', 'kddddddddddd', '.kkkkkkkkkkk'])


# the throne, 48 wide (mirrored): gilded back with a purple panel and the stag, arms, a velvet seat, on a step
THRONE = [
    '.......................k',
    '......................kY',
    '.....................kYy',
    '..........k.........kYyo',
    '.........kYk.......kYyyo',
    '........kYyok.....kYyyyo',
    '........kyyoOkkkkkYyyyyo',
    '........kyoOOyyyyyyyyyyo',
    '........kyoqqqqqqqqqqqqq',
    '........kyoqpppppppppppp',
    '........kyoqpPPPPPPPPPPp',
    '........kyoqpPppppppppPp',
    '........kyoqpPpppppppyPp',
    '........kyoqpPppppppypPp',
    '........kyoqpPpppppyyyPp',
    '........kyoqpPppppppyppp',
    '........kyoqpPpppppyyyPp',
    '........kyoqpPppppyyyyyp',
    '........kyoqpPppppypppyp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '........kyoqpPpppppppppp',
    '...kkkkkkyoqpppppppppppp',
    '..kYyyyyyoqqqqqqqqqqqqqq',
    '..kyyyyyyookkkkkkkkkkkkk',
    '..kyoooooOkPPPPPPPPPPPPP',
    '..kyoqqqqOkPpppppppppppp',
    '..kyoqppqOkPpppppppppppp',
    '..kyoqppqOkpqqqqqqqqqqqq',
    '..kyoqppqOkqQQQQQQQQQQQQ',
    '..kyoqqqqOkkkkkkkkkkkkkk',
    '..kyooooooYyyyyyyyyyyyyy',
    '..kOOOOOOOoooooooooooooo',
    '...kyok..kOOOOOOOOOOOOOO',
    '...kyok...kkkkkkkkkkkkkk',
    '...kyok.................',
    '...kyOk.................',
    '..kyyoOk................',
    'kkkkkkkkkkkkkkkkkkkkkkkk',
    'kSSSSSSSSSSSSSSSSSSSSSSS',
    'ksssssssssssssssssssssss',
    'kmmmmmmmmmmmmmmmmmmmmmmm',
    'kdddddddddddddddddddddd',
    'kkkkkkkkkkkkkkkkkkkkkkkk',
]

# a carved wardrobe, 40 wide (mirrored)
WARDROBE = (['....kkkkkkkkkkkkkkkk', '...kWWWWWWWWWWWWWWWW', '..kWwwwwwwwwwwwwwwww', '.kWwbbbbbbbbbbbbbbbb', 'kkkkkkkkkkkkkkkkkkkk',
             'kWWWWWWWWWWWWWWWWWWW', 'kWwwwwwwwwwwwwwwwwwk', 'kWwkkkkkkkkkkkkkkwwk'] +
            ['kWwkWwwwwwwwwwwwbkwk'] * 2 + ['kWwkWwkkkkkkkkwwbkwk', 'kWwkWwkbbbbbbkwwbkwk'] + ['kWwkWwkbwwwwbkwwbkwk'] * 8 +
            ['kWwkWwkbbbbbbkwwbkwk', 'kWwkWwkkkkkkkkwwbkwk', 'kWwkWwwwwwwwwwwyykwk', 'kWwkWwwwwwwwwwwyykwk'] +
            ['kWwkWwwwwwwwwwwwbkwk'] * 2 + ['kWwkWwkkkkkkkkwwbkwk', 'kWwkWwkbbbbbbkwwbkwk'] + ['kWwkWwkbwwwwbkwwbkwk'] * 8 +
            ['kWwkWwkbbbbbbkwwbkwk', 'kWwkWwkkkkkkkkwwbkwk', 'kWwkWwwwwwwwwwwwbkwk', 'kWwkbbbbbbbbbbbbbkwk', 'kWwkkkkkkkkkkkkkkkwk',
             'kWwwwwwwwwwwwwwwwwwk', 'kbbbbbbbbbbbbbbbbbbb', 'kkkkkkkkkkkkkkkkkkkk', '.kBk................', '.kkk................'])

# the war table: the map of Valdmark on a heavy table, markers and a candle (96 x 56, drawn whole)
def war_table():
    rows = []
    rows.append('..' + 'k' * 92 + '..')
    rows.append('.k' + 'W' * 92 + 'k.')
    rows.append('kW' + 'w' * 92 + 'Wk')
    land = ['GGGGGGGggGGGGGGGGGgGGGGGGGGGGGgggGGGGGAAAAAAA', 'GGgGGGGGGGGGGGGgGGGGGGGgGGGGGGGGGGGGGGAAAAAAA']
    for y in range(30):
        r = 'kWwk'
        for x in range(84):
            if x < 1 or x > 82 or y < 1 or y > 28:
                r += 'k'; continue
            u, v = x / 84, y / 30
            if u > .82 - .08 * v:
                ch = 'a' if (x + y) % 9 else 'A'                                 # the sea
            elif v < .3 and u < .4:
                ch = 'C' if (x * 3 + y) % 5 else 'c'                             # the frost
            elif v < .35 and u > .55:
                ch = 'D' if (x + y * 2) % 4 else 'd'                             # the ash
            elif .3 < u < .6 and v < .55:
                ch = 'm' if (x + y) % 3 else 's'                                 # the highlands
            elif u < .3:
                ch = 'g' if (x * 7 + y * 3) % 4 else 'G'                         # the forest
            else:
                ch = 'G' if (x * 5 + y) % 7 else 'g'                             # the meadows
            if abs((y - 6) - (x - 20) * .6) < .6 and 20 < x < 50:
                ch = 'w'                                                         # the royal road
            r += ch
        r += 'kwWk'
        rows.append(r[:96])
    rows.append('kW' + 'w' * 92 + 'Wk')
    rows.append('kWbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbWk'[:96])
    rows.append('k' * 96)
    for _ in range(14):
        rows.append('..kWbk' + '.' * 26 + 'kWbk' + '.' * 26 + 'kWbk' + '.' * 26 + 'kWbk..'[:96])
    rows.append('.kkkkkk' + '.' * 24 + 'kkkkkk' + '.' * 24 + 'kkkkkk' + '.' * 24 + 'kkkkkk.')
    s = grid([r[:96] for r in rows])
    for x, y, c in ((30, 12, 'p'), (31, 12, 'P'), (60, 8, 'p'), (61, 8, 'P'), (44, 18, 'r'), (45, 18, 'R'), (18, 22, 'y'), (70, 20, 'Q')):  # markers
        for dy in range(3):
            s.set(x, y + dy, PAL[c]); s.set(x + 1, y + dy, PAL['k'] if dy == 2 else PAL[c])
    for x, y in ((24, 10), (52, 16), (40, 22)):                                   # towns
        s.set(x, y, PAL['k']); s.set(x + 1, y, PAL['k']); s.set(x, y - 1, PAL['Y'])
    for y in range(0, 8):                                                         # a candle at the corner
        s.set(86, y, PAL['C']); s.set(87, y, PAL['c'])
    s.set(86, 0, PAL['f']); s.set(87, 0, PAL['F'])
    return s


# a copper bath on claw feet, 64 x 36
BATH = (['......kkkkkkkkkkkkkkkkkkkkkkkkkk', '....kkUuuuuuuuuuuuuuuuuuuuuuuuuu', '...kUuuAAAAAAAAAAAAAAAAAAAAAAAAA', '..kUuAAAAAAAAAAAAAAAAAAAAAAAAAAA',
         '..kuAAAaaAAAAAAAAAAAAAAaaAAAAAAA', '.kUuAaAAAAAACCAAAAAAAAAAAAAAAAAA', '.kUuAAAAAAACCCCAAAAAAAAAAAAAAAAA', '.kUuuaaaaaaaaaaaaaaaaaaaaaaaaaaa',
         '.kUuuuuuuuuuuuuuuuuuuuuuuuuuuuuu', '.kUUUUuuuuuuuuuuuuuuuuuuuuuuuuuu', '.kUUUUUUuuuuuuuuuuuuuuuuuuuuuuuu', '.kUUUUUUUUuuuuuuuuuuuuuuuuuuuuuu',
         '.kUUUUUUUUUUUUUUuuuuuuuuuuuuuuuu', '..kUUUUUUUUUUUUUUUUUUUUUUUUUUUUU', '..kUUUUUUUUUUUUUUUUUUUUUUUUUUUUU', '...kUUUUUUUUUUUUUUUUUUUUUUUUUUUU',
         '....kkUUUUUUUUUUUUUUUUUUUUUUUUUU', '......kkkkkkkkkkkkkkkkkkkkkkkkkk', '.......kyok......................', '......kyyoOk.....................',
         '......kkkkkk.....................'])

# a gilded portrait, 32 x 40: two sitters (a king and a lady)
def portrait(kind):
    face, cloth, hair = ('u', 'p', 'S') if kind == 0 else ('u', 'r', 'n')
    rows = ['kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'kYyyyyyyyyyyyyyyyyyyyyyyyyyyyyok', 'kyoOOOOOOOOOOOOOOOOOOOOOOOOOOoOk']
    for y in range(32):
        r = 'kyO'
        for x in range(26):
            cx, cy = x - 13, y - 11
            if cx * cx / 30 + cy * cy / 42 <= 1 and y < 18:
                ch = face if not (y in (9, 10) and x in (10, 15)) else 'k'
                if y < 6 or (kind and abs(cx) > 3 and y < 15):
                    ch = hair
                if kind == 0 and y < 3:
                    ch = 'y' if x % 3 else 'Y'                                 # a crown
            elif y >= 16 and abs(cx) < 6 + (y - 16):
                ch = cloth if abs(cx) > 1 else ('y' if kind == 0 else 'C')
            else:
                ch = 'Q' if (x + y) % 7 else 'q'
            r += ch
        rows.append(r + 'Ook')
    rows += ['kyoOOOOOOOOOOOOOOOOOOOOOOOOOOoOk', 'kOoooooooooooooooooooooooooooook', 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk']
    return grid(rows)


# the great kitchen hearth: a stone chimney breast, a fire and an iron cauldron on a hook (96 x 88, mirrored)
HEARTH = (['......kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', '.....kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', '....kSsssssssssssssssssssssssssssssssssssssssss',
           '....ksmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm'] +
          ['....ksmsssssdssssssdssssssdssssssdssssssdsssss', '....ksmssssssdssssssdssssssdssssssdssssssdssss', '....ksmddddddddddddddddddddddddddddddddddddddddd'] * 6 +
          ['..kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', '.kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS', 'kSsssssssssssssssssssssssssssssssssssssssssssssss',
           'kmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', 'kddddddddkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk'] +
          ['ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'] * 2 +
          ['ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjjj', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjz', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjz'] +
          ['ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjz'] * 4 +
          ['ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzkkkkkkkk', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzkJjjjjjjjj', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzkJjiiiiiiii',
           'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzkJjjjjjjjjj', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzkJJjjjjjjjj', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzkJJJjjjjjjj',
           'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzkJJJJjjjjj', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzkJJJJJJJJ', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzkkkkkkkk',
           'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzHHH', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzHhhhh', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzHhhffff',
           'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzHhhffFFF', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzbbbbbbbbbbb', 'ksssssdmkzzzzzzzzzzzzzzzzzzzzzzzzzzzzBBBBBBBBBBB',
           'kSSSSSSSkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'kSssssssssssssssssssssssssssssssssssssssssssssss', 'kmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm',
           'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk'])

# one barrel end for the wine rack, 16 x 16
BARREL_END = ['.....kkkkkk.....', '...kkwwwwwwkk...', '..kwWWWWWWWWwk..', '.kwWWbbbbbbWWwk.', '.kwWbjjjjjjbWwk.', 'kwWbjwwwwwwjbWwk', 'kwWbjwbbbbwjbWwk', 'kwWbjwbkkbwjbWwk',
              'kwWbjwbkkbwjbWwk', 'kwWbjwbbbbwjbWwk', 'kwWbjwwwwwwjbWwk', '.kwWbjjjjjjbWwk.', '.kwWWbbbbbbWWwk.', '..kwWWWWWWWWwk..', '...kkwwwwwwkk...', '.....kkkkkk.....']


def wine_rack():
    s = Canvas(64, 60)
    frame = ['k' * 64, 'k' + 'W' * 62 + 'k'] + ['kWk' + '.' * 58 + 'kWk'[:3]] * 52 + ['k' + 'b' * 62 + 'k', 'k' * 64]
    g = grid([r[:64] for r in frame])
    s.paste(g, 0, 0)
    be = grid(BARREL_END)
    for r_, y in enumerate((4, 21, 38)):
        for c in range(3):
            s.paste(be, 4 + c * 19 + (r_ % 2) * 4, y)
            if r_ < 2:
                for x in range(3, 61):                                       # shelves
                    s.set(x, y + 16, PAL['b']); s.set(x, y + 17, PAL['B'])
    for x, y in ((12, 12), (35, 29), (54, 46)):                                # a few wine-stained corks
        s.set(x, y, PAL['x'])
    return s


# a cell door of iron bars (32 x 64)
CELL = (['kkkkkkkkkkkkkkkk', 'kiIiIiIiIiIiIiIi', 'kjjjjjjjjjjjjjjj'] + ['.kIk.kIk.kIk.kIk'] * 22 + ['kjjjjjjjjjjjjjjj', 'kiIiIiIiIiIiIiIi', 'kjjjjjjjjjjjjjjj'] +
        ['.kIk.kIk.kIk.kIk'] * 30 + ['kjjjjjjjjjjjjjjj', 'kkkkkkkkkkkkkkkk'])

# a stone tomb with an effigy (64 x 44, mirrored): the knight lies with his sword
TOMB = (['....kkkkkkkkkkkkkkkkkkkkkkkkkkkk', '...kSSSSSSSSSSSSSSSSSSSSSSSSSSSS', '..kSsssssssssssssssssssssssssssss', '..kssssskkkkkkkkkkkkkkkkkkkkkkkk',
         '..ksssskSSSSSSSkkSSSSSSSSSSSSSSSS', '..ksssskSsmmmmSksSsssssssssssssss', '..ksssskSsmmmmSksSssmmmmmmmmmmmmm', '..ksssskSSSSSSSkkSsmssssssssssssI',
         '..ksssskkkkkkkkkkSsmsssssssssssIi', '..ksssssssssssssksSsmmmmmmmmmmmmm', '..ksssssssssssssskkSSSSSSSSSSSSSS', '..kssssssssssssssssskkkkkkkkkkkkk',
         '..kmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', '..kdddddddddddddddddddddddddddddd', '..kdmdddmdddmdddmdddmdddmdddmdddm', '..kdmyydmdddmdddmyyymdddmdddmdddm',
         '..kdmyydmdddmdddmyyymdddmdddmdddm', '..kdmdddmdddmdddmdddmdddmdddmdddm', '..kdddddddddddddddddddddddddddddd', '..kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
         '..kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk'])

# a heap of treasure (48 x 32): coins, a crown, gems and a goblet
HOARD = ['....................kk..........................', '...................kYYk.........................', '..........kkk.....kYyyok........kk...............',
         '.........kYyYk...kYyYyyok......kRRk..............', '........kYyyyok.kYyyyyyyok....kRrrek.............', '......kkYyyoyyokYyoyyoyyyok...kRrek....kk.........',
         '.....kYYyyyoyyyyyyyoyyyyyook...kek....kAAk........', '....kYyyyyyyyyoyyyyyyyyoyyyok........kAaak........', '...kYyyoyyYyyyyyyyoyyyyyyyyyok...kk..kAak.........',
         '..kYyyyyyyyyyyoyyyyyyyYyyyoyyok.kYYk..kk.....kk...', '.kYyyyoyyyyyyyyyyyyyyyyyyyyyyyykYyyok........kPPk..', 'kYyyyyyyyyoyyyyYyyyoyyyyyyoyyyyYyyyyok......kPpqk..',
         'kYyoyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyokkkkkkkkpqk...', 'kyyyyyyyoyyyyyyyyyyyyyoyyyyyyyyyoyyyyyyyyyyyykk....', 'kOyyyyyyyyyyyyyoyyyyyyyyyyyyyyyyyyyyyyoyyyyyyok...',
         '.kOOyyyyoyyyyyyyyyyyyyyyyoyyyyyyyyyyyyyyyyyyok....', '..kkOOOOOOyyyyyyyyyyyoyyyyyyyyyyyyyyoyyyyOOk......', '....kkkkkOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOkk.......',
         '.........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.........']

# the grand stair up (64 x 72, a decal on the floor running up into the wall) and the stair down (64 x 48)
def stair_up():
    rows = []
    for y in range(72):
        step, t = y // 8, y % 8
        lo = 4 + step
        r = '.' * lo + 'k' + ''.join(('S' if t == 0 else 's' if t < 3 else 'm' if t < 6 else 'd') if 0 < x < 56 - 2 * step else 'k' for x in range(64 - 2 * lo - 1))
        rows.append(r)
    s = grid(rows)
    for y in range(72):                                                        # a purple runner up the middle
        for x in range(26, 38):
            c = s.get(x, y)
            if c[3] and c[:3] != (30, 24, 32):
                s.set(x, y, PAL['p'] if y % 8 > 2 else PAL['P'] if y % 8 else PAL['Q'])
    return s


def stair_down():
    rows = ['kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk']
    for y in range(44):
        step, t = y // 7, y % 7
        shade = ['s', 'm', 'd', 'D', 'D', 'z', 'z'][min(6, step)]
        rows.append('kS' + ('k' if t == 6 else shade) * 60 + 'Sk')
    rows.append('k' * 64)
    return grid(rows)


# a ballista (40 x 34): a crossbow on a wooden turntable, a bolt loaded, iron fittings
BALLISTA = ['...................kk...................', '..................kIIk..................', '.................kIiiIk.................',
            'kk...............kiJJik...............kk', 'kIk.............kkjkkjkk.............kIk', 'kiIk...........kWwwwwwwbk...........kIik', '.kiIk.........kWwbbbbbbwbk.........kIik.',
            '..kiIkkkkkkkkkWwbkkkkkkbwbkkkkkkkkkkIik..', '...kiIIIIIIIIIwbkIIIIIIkbwIIIIIIIIIIik...', '....kjjjjjjjjjwbkiiiiiikbwjjjjjjjjjjk....', '.....kkkkkkkkkWwbkkkkkkbwbkkkkkkkkkk.....',
            '..............kWwbbbbbbwbk..............', '...............kWwwwwwwbk...............', '................kWWWWWbk................', '.....kkkkkkkkkkkkWwwwwbkkkkkkkkkkkk.....',
            '....kWWWWWWWWWWWWWwwwbbbbbbbbbbbbbbk....', '....kWwwwwwwwwwwwwwwwwwwwwwwwwwwwwbk....', '....kWwbbbbbbbbbbbbbbbbbbbbbbbbbbwbk....', '....kWwbkkkkkkkkkkkkkkkkkkkkkkkkbwbk....',
            '....kWwbk.....................kbwbk....', '....kbbbk.....................kbbbk....', '...kkkkkkk...................kkkkkkk...', '..kjIIIIIjk.................kjIIIIIjk..',
            '.kjIijjjiIjk...............kjIijjjiIjk.', '.kjijkkkjijk...............kjijkkkjijk.', '.kjIijjjiIjk...............kjIijjjiIjk.', '..kjIIIIIjk.................kjIIIIIjk..',
            '...kkkkkkk...................kkkkkkk...']

# a barricade of sharpened stakes (40 x 30)
BARRICADE = ['k......................................k', 'Ck....................................kC', 'vCk..................................kCv', '.vWk................................kWv.',
             '..wWk..............................kWw..', '...bWk............................kWb...', '....bWk..........................kWb....', '.....bWk........................kWb.....',
             '......bWk......................kWb......', '.......bWk....................kWb.......', '........bWk..................kWb........', '.........bWk................kWb.........',
             '..........bWk..............kWb..........', '...........bWk............kWb...........', 'kkkkkkkkkkkkbWkkkkkkkkkkkkkWbkkkkkkkkkkkk', 'kWWWWWWWWWWWWbWWWWWWWWWWWWWbWWWWWWWWWWWWk',
             'kwwwwwwwwwwwwwbwwwwwwwwwwwbwwwwwwwwwwwwk', 'kbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbk', 'kkkkkkkkkkkkkkkWkkkkkkkkkkWkkkkkkkkkkkkk', '.............kWbk.......kbWk.............',
             '............kWbk.........kbWk............', '...........kWbk...........kbWk...........', '..........kWbk.............kbWk..........', '.........kWbk...............kbWk.........',
             '........kWbk.................kbWk........', '.......kkkk...................kkkk.......']


SPRITES = {
    'furn_pillar': lambda: grid(PILLAR, True), 'furn_throne_h': lambda: grid(THRONE, True), 'furn_wardrobe': lambda: grid(WARDROBE, True),
    'furn_wartable': war_table, 'furn_bath': lambda: grid(BATH, True), 'furn_hearth': lambda: grid(HEARTH, True), 'furn_winerack': wine_rack,
    'furn_cell': lambda: grid(CELL, True), 'furn_tomb': lambda: grid(TOMB, True), 'furn_hoard': lambda: grid(HOARD),
    'furn_stairup': stair_up, 'furn_stairdown': stair_down,
    'ballista': lambda: grid([r[:40] for r in BALLISTA]), 'barricade': lambda: grid([r[:40] for r in BARRICADE]), 'dec_portrait_king': lambda: portrait(0), 'dec_portrait_lady': lambda: portrait(1),
}


# ---- the drake: a mount you fly on (facing right; wings up, level and down) and the drakeling ----
DRAKE_PAL = {'r': '#b8402e', 'R': '#e06a4a', 'e': '#7a2420', 'E': '#4a1418', 'u': '#f0b080', 'U': '#c88050', 'C': '#f0e6d0', 'c': '#b8aa90', 'Y': '#ffe060',
             'p': '#6a3a9a', 'P': '#9a66cc', 'y': '#e8b830', 'k': '#1e1820', 'H': '#c84a2a', 'h': '#f2a040', 'w': '#ffd890'}
DRAKE_BODY = [
    '..............................................kk........',
    '.............................................kCck.kk....',
    '............................................kCck.kCck...',
    '...........................................kRrrkkCck....',
    '..........................................kRRrrrrkk.....',
    '.........................................kRRrrrrrrrkk...',
    '........................................kRrrrkYkrrrrrk..',
    '........................................kRrrrrkkrrrrrrk.',
    '.......................................kRrrrrrrrrrreeeek',
    '.......................................kRrrrrrrkkkkkkkk.',
    '......................................kRrrrrrrkuUk......',
    '.....................................kRrrrrrrkuUk.......',
    '......................kkkkkkkkkkk...kRrrrrrrkuUk........',
    '....................kkpPPPPPPPPPpkkkRrrrrrrkuUk.........',
    '..................kkRpyyyyyyyyyyyprRrrrrrrkuUk..........',
    '................kkRRrpppppppppppprrrrrrrrkuUk...........',
    '..............kkRRrrrrrrrrrrrrrrrrrrrrrrkuUk............',
    '............kkRRrrrrrrrrrrrrrrrrrrrrrrrruUk.............',
    '..........kkRrrrrrrrrrrrrrrrrrrrrrrrrrruUUk.............',
    'kk......kkRrrrrrrrrrrrrrrrrrrrrrrrrrrruuUUk.............',
    'kRkkkkkkRrrrrrrrrrrrrrrrrrrrrrrrrrrruuuUUk..............',
    '.kRRrrrrrrrrrrrrrrrrrrrrrrrrrrrrrruuuuUUk...............',
    '..kkeeeeerrrrrrrrrrrrrrrrrrrrrruuuuuuUUk................',
    '....kkkkkeeeeeerrrrrrrrrrrrruuuuuuuuUUk.................',
    '.........kkkkkkeeeerrrrrrruuuuuuuuuUUek.................',
    '...............kkkeeeeeeeUUUUUUUUUUeeek.................',
    '................kkeeeeek.kkkkkkkkkeeeek.................',
    '................keeeeek..........keeek..................',
    '................kerrek...........kerrk..................',
    '................kerrek...........kerrk..................',
    '...............keerrek..........keerrk..................',
    '..............kCkCkCk..........kCkCkCk..................',
    '..............kkkkkkk..........kkkkkkk..................',
]
WING_UP = [
    '..........................kk',
    '.........................keek',
    '.......................kkeHek',
    '.....................kkHHeHk.',
    '...................kkHhHHeHk.',
    '.................kkHhhHHHeHk.',
    '...............kkHhhhHHHeHk..',
    '.............kkHhhhhHHHHeHk..',
    '...........kkeeeeeeeeeeeeek..',
    '..........kHhhhhHHHHHHHHeHk..',
    '........kkHhhhhhHHHHHHHeHk...',
    '.......kHhhhhhhHHHHHHHHeHk...',
    '......kHhhhhhhHHHHHHHHeHk....',
    '.....kHhhhhhhHHHHHHHHHeHk....',
    '....kkkkkkkkkkkkkkkkkkeek....',
]
WING_DOWN = [
    'kkkkkkkkkkkkkkkkkkkkkkkkeek.',
    '.kHhhhhhhHHHHHHHHHHHHHHHeHk.',
    '..kHhhhhhhHHHHHHHHHHHHHHeHk.',
    '...kHhhhhhhHHHHHHHHHHHHeHk..',
    '....kHhhhhhHHHHHHHHHHHHeHk..',
    '.....kkHhhhhHHHHHHHHHHeHk...',
    '.......kkHhhhHHHHHHHHHeHk...',
    '.........kkHhhHHHHHHHeHk....',
    '...........kkHhHHHHHeHk.....',
    '.............kkHHHHeHk......',
    '...............kkHeHk.......',
    '.................kkk........',
]


def dgrid(rows):
    W = max(len(r) for r in rows)
    s = Canvas(W, len(rows))
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in DRAKE_PAL:
                s.set(x, y, DRAKE_PAL[ch])
    return s


def drake_mount(frame):
    """frame 0: wings up, 1: level, 2: down. The far wing behind the body, the near wing over it."""
    s = Canvas(64, 52)
    body = dgrid(DRAKE_BODY)
    wing = dgrid(WING_UP if frame == 0 else WING_DOWN if frame == 2 else WING_UP[6:])
    far = dgrid([r[::-1] for r in (WING_UP if frame == 0 else WING_DOWN if frame == 2 else WING_UP[6:])])
    wx, wy = (8, 16) if frame == 0 else (8, 22) if frame == 1 else (9, 28)      # the wing root sits on the shoulder
    s.paste(far, wx + 8, wy - 3)                                              # the far wing, darker by being behind
    for y in range(s.h):
        for x in range(s.w):
            c = s.get(x, y)
            if c[3]:
                s.set(x, y, tuple(int(v * .62) for v in c[:3]) + (255,))
    s.paste(body, 2, 14)
    s.paste(wing, wx, wy)
    return s


DRAKELING = ['..........kk.kk...', '.........kCkkCk...', '........kRrrrrkk..', '.......kRrkYkrrrk.', '.......kRrrkkrreek', '......kRrrrrrkkkk.',
             '..kk.kRrrrrkuk....', '.kHhkRrrrrrkuUk...', 'kHhhkRrrrrrruUk...', 'kHhRRrrrrrruuUk...', '.kkRrrrrrruuUUk...', 'kRrrrrrrruuuUk....',
             '.kkeeeeeeUUUek....', '...keek..keek.....', '...kCCk..kCCk.....']

SPRITES.update({f'drake_mount.{i}': (lambda i=i: drake_mount(i)) for i in range(3)})
SPRITES['drakeling'] = lambda: dgrid(DRAKELING)
SPRITES['ic_whistle'] = lambda: dgrid(['......kk', '.....kYk', '....kYyk', 'kkkkYyk.', 'kyYYyk..', 'kyyyk...', '.kkk....'])


def scale2x(c):
    """EPX / Scale2x: doubles a hand-pixelled sprite while keeping its pixels crisp and smoothing its diagonals."""
    W, H = c.w, c.h
    s = Canvas(W * 2, H * 2)
    g = lambda x, y: c.get(x, y) if 0 <= x < W and 0 <= y < H else (0, 0, 0, 0)
    for y in range(H):
        for x in range(W):
            P = g(x, y); A, B, C_, D = g(x, y - 1), g(x + 1, y), g(x - 1, y), g(x, y + 1)
            e = [P, P, P, P]
            if C_ == A and C_ != D and A != B: e[0] = A
            if A == B and A != C_ and B != D: e[1] = B
            if D == C_ and D != B and C_ != A: e[2] = C_
            if B == D and B != A and D != C_: e[3] = D
            for i, (dx, dy) in enumerate(((0, 0), (1, 0), (0, 1), (1, 1))):
                if e[i][3]:
                    s.set(x * 2 + dx, y * 2 + dy, e[i])
    return s


SPRITES.update({f'drake_mount.{i}': (lambda i=i: scale2x(drake_mount(i))) for i in range(3)})
