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


# ---- the courtyard: a training yard and a few yard pieces -------------------------------------
# a straw training dummy: a stitched sack head, a wrapped crossbar with straw poking out of the ends,
# a roped body with a painted target and a straw fringe, on a post in a wooden foot. Lit on the left.
DUMMY = ([
    '..........kkkkkk',
    '.........kcccvVVk',
    '........kcCccvvVVk',
    '........kcckcckvVk',
    '........kccccvvvVk',
    '........kcckkkvvVk',
    '.........kcvvvvVk',
    '..........kkkkkk',
    '...........kbBk',
    'yo.kkkkkkkkkbBkkkkkkkkkkk.oy',
    'oykcCcccccvvvvvvvvvvvVVVVkyo',
    'yokvcvvvvvvvvvVVVVVVVVVVVkoy',
    '.o.kkkkkkkkcvvvVkkkkkkkkk.o.',
    '........kcCccvvvVk',
    '........kcCccvvvVk',
    '........kBBBBBBBBk',
    '........kcCccvvvVk',
    '........kcCcrrvvVk',
    '........kcCrCCrvVk',
    '........kcCrCrrvVk',
    '........kcCcrrvvVk',
    '........kcCccvvvVk',
    '........kBBBBBBBBk',
    '........kcCccvvvVk',
    '.......ykcCccvvvVky',
    '........kyoyoyoyok',
    '.........ko.o.o.k',
] + ['...........kbBk'] * 16 + [
    '.......kkkkkbBkkkkk',
    '......kWWwwwbBwwwbBk',
    '......kbbbbbbBBBBBnk',
    '......kkkkkkkkkkkkkk',
])


def target():
    """An archery butt: a round straw boss with painted rings (gold, red, blue, black, white) on a
    wooden easel, an arrow stuck in the red."""
    cx, cy, R = 15.5, 13.5, 13
    rows = []
    for y in range(28):
        r = ''
        for x in range(32):
            d = ((x - cx) ** 2 + (y - cy) ** 2) ** .5
            if d > R + .5:
                r += '.'
            elif d > R - .7:
                r += 'k'
            elif d > R - 2.4:
                r += 'y' if (x - cx) + (y - cy) < -4 else 'o' if (x - cx) + (y - cy) < 6 else 'O'
            else:
                ring = int(d / 2.3)
                r += ['Y', 'r', 'a', 'J', 'C', 'C'][min(5, ring)]
                if ring == 4 and (x - cx) + (y - cy) > 4:
                    r = r[:-1] + 'c'
        rows.append(r)
    rows = [list(r) for r in rows]
    for i, (x, y) in enumerate([(22, 9), (23, 8), (24, 7), (25, 6), (26, 5)]):   # the arrow
        rows[y][x] = 'b' if i < 4 else 'R'
    rows[4][27] = 'C'; rows[4][26] = 'R'; rows[5][27] = 'R'
    legs = []
    for k in range(14):                                        # the easel: two splayed legs and a back prop
        r = ['.'] * 32
        lx, rx = 9 - k // 3, 22 + k // 3
        r[lx], r[lx + 1], r[lx + 2] = 'k', 'W', 'b'
        r[rx - 1], r[rx], r[rx + 1] = 'k', 'b', 'B'
        r[15], r[16] = 'b', 'B'
        legs.append(r)
    legs.insert(3, list('......kkkkkkkkkkkkkkkkkkkk......'.replace('kkkkkkkkkkkkkkkkkkkk', 'kWWwwwwwwwwbbbbbbBBk')))
    return grid([''.join(r) for r in rows + legs])


# a hay bale, strapped with two bands of twine, straw ends bristling
def haybale():
    rows = ['...kkkkkkkkkkkkkkkkkkkkkkkkk....']
    for y in range(16):
        r = '..k' if y else '..k'
        for x in range(27):
            if x in (7, 19):
                c = 'B' if y else 'b'
            elif y == 0:
                c = 'Y'
            elif y < 3:
                c = 'Y' if (x + y) % 4 else 'y'
            elif y > 12:
                c = 'O' if (x + y) % 3 else 'o'
            else:
                c = 'y' if (x * 3 + y * 5) % 7 else 'o' if x < 20 else 'O'
            r += c
        rows.append(r + 'k' + ('o' if y % 3 == 0 else '.'))
    rows.append('..kkkkkkkkkkkkkkkkkkkkkkkkkkkk..')
    return grid(rows)


# a stone bench on two block legs (mirrored)
BENCH = ['.kkkkkkkkkkkkkkk', 'kSSSSSSSSSSSSSSS', 'kSssssssssssssss', 'kmmmmmmmmmmmmmmm', 'kddddddddddddddd', '.kkkkkkkkkkkkkkk'] + \
        ['..kSsmdk........'] * 6 + ['..kkkkkk........']

SPRITES.update({'furn_dummy': lambda: grid(DUMMY), 'furn_target': target, 'furn_haybale': haybale, 'furn_sbench': lambda: grid(BENCH, True)})


# ---- the royal gardens and the knights' camp ----------------------------------------------------
PAL.update({'L': '#2a5226', 'l': '#3a6e30', 'T': '#c8582a', 't': '#8a3a1a', 'N': '#e8804a'})


def hedge():
    """A clipped box hedge, one tile long so a row of them reads as one hedge: a lit top with leaf
    clumps, a darker front face, a shadowed foot. The ends are square so neighbours join."""
    rows = []
    for y in range(26):
        r = ''
        for x in range(32):
            clump = (x * 7 + (y // 3) * 11) % 9 < 2
            if y == 0:
                c = 'k'
            elif y < 9:                               # the clipped top, lit from the top-left
                c = 'G' if (x * 5 + y * 3) % 13 < (4 if y < 5 else 2) else 'g' if (x * 2 + y * 7) % 17 else 'l'
            elif y == 9:
                c = 'l'
            elif y < 23:                              # the front face
                c = 'l' if clump or (x + y * 3) % 7 == 0 else 'g' if (x * 3 + y) % 11 == 0 else 'L'
            elif y < 25:
                c = 'L'
            else:
                c = 'k'
            r += c
        rows.append(r)
    return grid(rows)


def topiary():
    """A boxwood cone in a terracotta pot."""
    rows = []
    for y in range(40):
        half = 1 + y * .32 if y < 36 else 0
        r = ''
        for x in range(24):
            d = x - 11.5
            if y >= 36:
                r += '.'
                continue
            if abs(d) > half + .5:
                r += '.'
            elif abs(d) > half - .6:
                r += 'k'
            else:
                band = (y % 6) == 5
                c = 'G' if d < -half * .35 else 'g' if d < half * .3 else 'l'
                r += 'L' if band and d > 0 else ('l' if band else c)
        rows.append(r)
    rows[0] = '...........kk' ; rows[1] = '..........kGgk'
    pot = ['...kkkkkkkkkkkkkkkkkk', '...kNNNNNNNTTTTTTTTtk', '....kNTTTTTTTTTTTttk', '....kNTTTTTTTTTTTttk', '.....kTTTTTTTTTTttk', '.....kTTTTTTTTTTttk', '......kkkkkkkkkkkk']
    rows = rows[:36] + pot
    return grid(rows)


# a banner pole: a gilt finial, a crossbar, a swallow-tailed Briarholt banner with the stag, a stone foot
def banner_pole():
    rows = ['.......kk.......', '......kYyk......', '......kyok......', '.......kk.......']
    rows += ['..kkkkkjikkkkk..', '.kIIIIIjiIIIIjk.', '..kkkkkjikkkkk..']
    stag = ['..y...y..', '..y.y.y..', '...yyy...', '....y....', '...yyy...', '..yyyyy..', '..y...y..']
    for y in range(40):
        r = '..k'
        for x in range(11):
            if y > 33 and abs(x - 5) < (y - 33) * .9:
                c = 'j' if x == 5 else 'i' if x == 6 else '.'
            else:
                c = 'P' if x == 0 else 'q' if x == 10 else 'p'
                if 8 <= y < 15 and 1 <= x - 0 <= 9 and stag[y - 8][x - 1:x] == 'y':
                    c = 'y' if x < 5 else 'o'
                if y in (2, 30):
                    c = 'o'
            r += c
        r += 'k' if not (y > 33 and abs(10 - 5) < (y - 33) * .9) else '.'
        rows.append(r.replace('..k.', '...').rstrip('.'))
    rows += ['.......ji.......'] * 30
    rows += ['....kkkkkkkk....', '...kSSSSSSssk...', '...kssssssmmk...', '..kkkkkkkkkkkk..']
    return grid(rows)


def pavilion():
    """A knight's pavilion: a round striped tent in purple and cream, a scalloped valance with gold
    points, a pennant on the king pole and the door flaps tied open."""
    W, H = 64, 72
    rows = [['.'] * W for _ in range(H)]
    cx = 31.5
    for y in range(10, 34):                          # the conical roof
        t = (y - 10) / 24
        half = 3 + t * 27
        for x in range(W):
            d = x - cx
            if abs(d) <= half:
                stripe = int((d / max(1, half)) * 5 + 5) % 2
                c = ('p' if stripe else 'C') if d < half * .3 else ('q' if stripe else 'c')
                if d < -half * .7:
                    c = 'P' if stripe else 'C'
                rows[y][x] = 'k' if abs(d) > half - 1 else c
    for x in range(2, 62):                           # the valance with gold points
        rows[34][x] = 'q'; rows[35][x] = 'p'
        if (x - 2) % 6 < 3:
            rows[36][x] = 'p'; rows[37][x] = 'y' if (x - 2) % 6 == 1 else 'p'
    for y in range(36, 66):                          # the walls
        for x in range(4, 60):
            stripe = ((x - 4) // 8) % 2
            c = ('p' if stripe else 'C') if x < 44 else ('q' if stripe else 'c')
            if x in (4, 59):
                c = 'k'
            rows[y][x] = c
    for y in range(44, 66):                          # the doorway, flaps tied back
        w = int((y - 44) * .45) + 2
        for x in range(32 - w, 32 + w):
            rows[y][x] = 'z' if y > 46 else 'n'
        rows[y][32 - w - 1] = 'C'; rows[y][32 + w] = 'c'
    rows[54][32 - 9] = 'y'; rows[54][32 + 9] = 'y'
    for x in range(4, 60):
        rows[66][x] = 'k'
    for y in range(0, 12):                           # king pole and pennant
        rows[y][31] = 'j'; rows[y][32] = 'i'
    for k in range(8):
        for j in range(4 - k // 2):
            rows[1 + j + k // 3][33 + k] = 'P' if j == 0 else 'p'
    rows[0][31] = 'Y'; rows[0][32] = 'y'
    return grid([''.join(r) for r in rows[:67]])


SPRITES.update({'furn_hedge': hedge, 'furn_topiary': topiary, 'furn_bpole': banner_pole, 'furn_pavilion': pavilion})


def dais():
    """The throne's dais, painted into the floor under it: a stone platform of squared slabs, three steps down
    toward the hall (lit treads, shaded risers) and a purple carpet with gold edges up the middle."""
    W, H = 192, 112
    rows = []
    for y in range(H):
        r = ''
        for x in range(W):
            carpet = 64 <= x < 128
            if y < 72:
                part = 'top'
            elif y < 78 or 86 <= y < 92 or 100 <= y < 106:
                part = 'riser'
            elif y < 106:
                part = 'tread'
            else:
                part = 'shadow'
            if part == 'shadow':
                r += 'n' if (x + y) % 2 == 0 else '.'
                continue
            if x in (0, W - 1):
                r += 'k'; continue
            if carpet:
                if x in (64, 127):
                    c = 'o' if part != 'riser' else 'O'
                elif x in (65, 126):
                    c = 'y' if part != 'riser' else 'o'
                else:
                    c = 'q' if part == 'riser' else 'P' if y in (0, 78, 92) else 'p'
            elif part == 'riser':
                c = 'd' if y not in (72, 86, 100) else 'D'
            elif y in (0, 78, 92):
                c = 'S'
            elif x % 32 == 31 or (part == 'top' and y % 24 == 23):
                c = 'm'
            else:
                c = 's' if (x // 32 + y // 24) % 2 else 'S' if x % 32 < 2 else 's'
            r += c
        rows.append(r)
    return grid(rows)


SPRITES['dec_dais'] = dais
