"""Hand-pixelled 16x16 UI icons for the menu dock and the window tabs (ui_<tab>)."""
from px import Canvas

PAL = {'k': '#2a1c18', 'd': '#5a3a22', 'w': '#8a5a32', 'l': '#c08a52', 'p': '#f0e2c0', 'q': '#c8b48a', 'y': '#f2c040', 'Y': '#a87a20',
       'r': '#d8342a', 'R': '#8a1a1a', 'b': '#4a8ad8', 'B': '#2a4a8a', 'g': '#5ab04a', 'G': '#2e6a26', 's': '#c8ced8', 'S': '#6a707e', 'W': '#ffffff', 'o': '#e8742a'}

ICONS = {
    'bag': ["....kkkkkk......", "...kddddddk.....", "..kdkkkkkkdk....", ".kwwwwwwwwwwk...", ".kwlllllllllwk..", ".kwlkkyykklwwk..", ".kwlllyyllllwk..", ".kwwwwwwwwwwwk..",
            ".kwlllllllllwk..", ".kwlllllllllwk..", ".kwlllllllllwk..", ".kwwwwwwwwwwwk..", "..kkkkkkkkkkk...", "................", "................", "................"],
    'craft': [".....kkkk.......", "....kssssk......", "...kssSSssk.....", "....kkwkkk......", "......kwk.......", "......kwk.......", "......kwk.......", "..kkkkkwkkkkk...",
              ".kSSSSSSSSSSSk..", "..kSSSSSSSSSk...", "....kSSSSSk.....", "....kSSSSSk.....", "...kSSSSSSSk....", "..kkkkkkkkkkk...", "................", "................"],
    'skills': [".......kk.......", "......kyyk......", "......kyyk......", ".....kyyyyk.....", "kkkkkyyyyyykkkkk", "kyyyyyyyyyyyyyyk", ".kyyyyYyyYyyyyk.", "..kyyyyyyyyyyk..",
               "...kyyyyyyyyk...", "...kyyyykyyyk...", "..kyyyk..kyyyk..", "..kyyk....kyyk..", ".kyk........kyk.", ".kk..........kk.", "................", "................"],
    'tree': ["......kkkk......", ".....kbbbbk.....", ".....kbWbbk.....", "......kkkk......", ".......kk.......", "...kk..kk..kk...", "..k..kkkkkk..k..", ".kggk......kgg k",
             ".kggk......kggk.", "..kk...kk...kk..", ".......kk.......", "......kook......", ".....koook......", "......kkk.......", "................", "................"],
    'cskills': ["k.............k.", "kk...........kk.", ".kssk.....kssk..", "..kssk...kssk...", "...kssk.kssk....", "....kssksssk....", ".....kssssk.....", "......kssk......",
                ".....kssssk.....", "....kssk.kssk...", "..kkksk...kskkk.", ".kwwkk.....kkwwk", ".kwk.........kwk", "..k...........k.", "................", "................"],
    'animals': ["......kk........", ".....krrk.......", "....kkrrkk......", "...kWWWWWWk.....", "..kWWWWkWWWk....", "..kWWWWWWWWkyy..", "..kWWWWWWWWkyyk.", ".kWWWWWWWWWWkk..",
                "kWWWqWWWWWWWWk..", "kWWqqqWWWWWWWk..", "kWWWqqqWWWWWk...", ".kWWWWWWWWWk....", "..kkkkkkkkk.....", "....ky..ky......", "...kyk.kyk......", "................"],
    'friends': ["................", "..kkk....kkk....", ".krrrk..krrrk...", "krrWrrkkrrrrrk..", "krWrrrrrrrrrrk..", "krrrrrrrrrrrrk..", "krrrrrrrrrrrRk..", ".krrrrrrrrrRk...",
                "..krrrrrrrRk....", "...krrrrrRk.....", "....krrrRk......", ".....krRk.......", "......kk........", "................", "................", "................"],
    'family': [".......kk.......", "......krrk......", ".....krrrrk.....", "....krrrrrrk....", "...krrrrrrrrk...", "..krrrrrrrrrrk..", ".kkkkkkkkkkkkkk.", "..kppppppppppk..",
               "..kpbbkppkwwk...", "..kpbbkppkwwk...", "..kppppppkwwk...", "..kppppppkwwk...", "..kkkkkkkkkkkk..", "................", "................", "................"],
    'coll': ["................", "....kkkkkkkk....", "...kbbWbbbbbk...", "..kbWbbbbbbbbk..", ".kkkkkkkkkkkkkk.", ".kbbbbbbbbbbbBk.", "..kbbbbbbbbbBk..", "...kbbbbbbbBk...",
             "....kbbbbbBk....", ".....kbbbBk.....", "......kbBk......", ".......kk.......", "................", "................", "................", "................"],
    'ency': ["................", ".kkkkkk.kkkkkk..", "kppppppkppppppk.", "kpqqqqpkpqqqqpk.", "kppppppkppppppk.", "kpqqqqpkpqqqpk..", "kppppppkppppppk.", "kpqqqqpkpqqqqpk.",
             "kppppppkppppppk.", "kpqqqppkpqqqqpk.", "kppppppkppppppk.", "kkkkkkkkkkkkkkk.", ".kwwwwwwwwwwwk..", "..kkkkkkkkkkk...", "................", "................"],
    'map': ["................", ".kkkkkkkkkkkkk..", ".kppppkqqqkpppk.", ".kpgpkqqqqkppbk.", ".kpggkqgqqkpbbk.", ".kppkqqgqqqkppk.", ".kpkqqqqrqqkppk.", ".kpkqqqrqrqkgpk.",
            ".kppkqqqrqkggpk.", ".kpppkqqqkpgppk.", ".kppppkqqkpppk..", ".kkkkkkkkkkkkk..", "................", "................", "................", "................"],
    'quests': ["................", "..kkkkkkkkkk....", ".kwkppppppppk...", ".kkkpppppppk....", "...kpqqqqqqpk...", "...kppppppppk...", "...kpqqqqqppk...", "...kppppppppk...",
               "...kpqqqqpRRk...", "...kpppppRrrRk..", "...kkkkkkRrrRk..", "..kwwwwwwkRRk...", "..kkkkkkkkkk....", "................", "................", "................"],
    'opts': ["......kkkk......", "..kk.kSSSSk.kk..", ".kSSkSssssSkSSk.", ".kSssssssssssSk.", "..kssskkkksssk..", ".kSsskk..kkssSk.", "kSssk......ksSSk", "kSssk......kssSk",
             ".kSsskk..kksssk.", "..kssskkkksssk..", ".kSssssssssssSk.", ".kSSkSssssSkSSk.", "..kk.kSSSSk.kk..", "......kkkk......", "................", "................"],
}


def ui(rows):
    s = Canvas(16, 16)
    for y, r in enumerate(rows):
        for x, c in enumerate(r[:16]):
            if c in PAL:
                s.set(x, y, PAL[c])
    return s


SPRITES = {f'ui_{k}': (lambda v=v: ui(v)) for k, v in ICONS.items()}
