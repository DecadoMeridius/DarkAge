"""Goblins and ogres of the Wilds' camps (asked for 2026-10-31: "real goblin/ogre sprites; they live in the wild
in little shacks with small tribes"). Templates in the creature channels (b body, m clothing), recoloured per
enemy, plus fixed wood and iron for their spears and clubs. Light from the top-left, facing right.
- en_goblin: a hunched little goblin with big ears and a spear (walk, wind-up, thrust).
- en_ogre: the brute frame with a lumpy bald head, tusks, pot belly and loincloth, swinging a club.
- the camp: shack, totem, and a spit over a fire pit."""
from px import Canvas, rect, ellipse, poly, vnoise
from sprites import handdrawn as H

H.FIXED.update({'U': '#a8783e', 'u': '#5a3a20', 'X': '#b8c0c8'})
SPRITES = {}


def _line(det, x0, y0, x1, y1, ch, thick=1):
    n = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(n + 1):
        x, y = round(x0 + (x1 - x0) * i / n), round(y0 + (y1 - y0) * i / n)
        for t in range(thick):
            det.append((y + t, x, ch))


def goblin_f(step, pose='walk'):
    W, Hh = 38, 36
    o = [2, 0, -2, 0][step] if pose == 'walk' else 0
    bob = [0, 1, 0, 1][step] if pose == 'walk' else (2 if pose == 'wind' else 0)
    lean = {'walk': 0, 'wind': -2, 'strike': 2}[pose]
    y0 = bob
    sh = lambda pts, dx=lean: [(x + dx, y + y0) for x, y in pts]
    shapes = [
        (sh([(10, 10), (4, 6), (11, 13)]), 'd'),                                            # the far ear
        (sh([(14, 16), (24, 16), (25, 26), (13, 26)]), 'm'),                                # ragged tunic
        (sh([(13, 7), (18, 3), (24, 4), (27, 9), (25, 15), (18, 16), (13, 13)]), 'b'),       # big head
        (sh([(24, 8), (33, 4), (26, 12)]), 'b'),                                            # the near ear, long and pointed
        (sh([(26, 10), (31, 13), (26, 14)]), 'b'),                                          # hooked nose
        ([(15, 26), (18, 26), (17 + o, 33), (14 + o, 33)], 'd'),                            # far leg
        ([(19, 26), (22, 26), (22 - o, 33), (19 - o, 33)], 'b'),                            # near leg
        (sh([(21, 17), (24, 17), (27, 22), (25, 24)]), 'b'),                                # arm
    ]
    g = H.polygrid(W, Hh, shapes)
    det = [(9 + y0, 22 + lean, 'Y'), (9 + y0, 23 + lean, 'N'), (13 + y0, 23 + lean, 'NTN'), (5 + y0, 18 + lean, '44'), (4 + y0, 20 + lean, '4'),
           (20 + y0, 15 + lean, '6'), (23 + y0, 16 + lean, '6'), (25 + y0, 13 + lean, 'm.m.m.m.m'), (34, 13 + o, 'NNN'), (34, 19 - o, 'NNN')]
    # the spear: held at a slant, couched back for the wind-up, thrust level for the strike
    if pose == 'strike':
        _line(det, 4, 20 + y0, 36, 20 + y0, 'u'); det += [(19 + y0, 35, 'X'), (20 + y0, 36, 'XX'), (21 + y0, 35, 'X')]
    elif pose == 'wind':
        _line(det, 2, 25 + y0, 28, 15 + y0, 'u'); det += [(14 + y0, 28, 'XX'), (13 + y0, 29, 'X')]
    else:
        _line(det, 12, 33, 33, 2 + y0, 'u'); det += [(1 + y0, 33, 'X'), (2 + y0, 34, 'X'), (0 + y0, 34, 'X')]
    return H.grid_sprite(H.with_detail(g, det, W), W, Hh)


OGRE = {
    'head': H.spans(18, 16, {0: [(6, 11, 'b')], 1: [(3, 14, 'b')], 2: [(2, 15, 'b')], 3: [(1, 16, 'b')], 4: [(1, 16, 'b')], 5: [(1, 16, 'b'), (11, 11, 'E'), (14, 14, 'E')],
                             6: [(1, 16, 'b')], 7: [(1, 17, 'b'), (13, 15, 'N')], 8: [(1, 17, 'b')], 9: [(1, 16, 'b'), (8, 15, 'N'), (9, 9, 'T'), (14, 14, 'T')],
                             10: [(2, 16, 'b'), (9, 9, 'T'), (14, 14, 'T')], 11: [(3, 15, 'b')], 12: [(4, 14, 'b')]}),
    'torso': H.spans(40, 30, {**{y: [(6 - min(6, y), 33 + min(6, y), 'b')] for y in range(0, 8)},
                              **{y: [(0, 39, 'b')] for y in range(8, 18)},
                              **{y: [(1, 38, 'b')] for y in range(18, 22)},
                              **{y: [(3, 36, 'm')] for y in range(22, 30)}}),          # the loincloth
    'arm': H.spans(10, 30, {**{y: [(1, 8, 'b')] for y in range(0, 24)}, **{y: [(0, 9, 'b')] for y in range(24, 29)}, 29: [(2, 7, 'b')]}),
    'leg': H.spans(10, 16, {**{y: [(1, 8, 'b')] for y in range(0, 13)}, 13: [(0, 9, 'b')], 14: [(0, 9, 'b')], 15: [(0, 3, 'N'), (6, 9, 'N')]}),
}
OGRE['torso'] = H.with_detail(OGRE['torso'], [(10, 16, '44444'), (11, 14, '4'), (14, 22, '2'), (15, 23, '2'), (16, 17, '22'), (21, 4, '1' * 32), (22, 8, '7.7.7.7.7.7.7.7.7.7.7.7')], 40)
OGRE['head'] = H.with_detail(OGRE['head'], [(2, 6, '44'), (1, 8, '444'), (6, 3, '2'), (7, 4, '2')], 18)


def ogre(step=0, arms='swing'):
    s = H.brute(OGRE, step, arms)
    # the club in the near hand: a knotted log
    c = Canvas(s.w + 12, s.h + 10)
    c.img.alpha_composite(s.img, (6, 10)); c.px = c.img.load()
    if arms == 'up':
        pts = [(48, 2), (54, 0), (57, 10), (52, 26), (49, 26), (49, 12)]
    elif arms == 'down':
        pts = [(46, 42), (64, 52), (62, 58), (44, 48)]
    else:
        pts = [(50, 40), (54, 38), (58, 62), (52, 64)]
    for x, y in poly(pts):
        if 0 <= x < c.w and 0 <= y < c.h:
            n = vnoise(x * .6, y * .6, 5)
            c.set(x, y, '#a8783e' if n > .62 else '#7a5430' if n > .3 else '#5a3a20')
    c.outline()
    return c


SPRITES['en_goblin'] = lambda: [goblin_f(k) for k in range(4)]
SPRITES['en_goblin_atk'] = lambda: [goblin_f(0, 'wind'), goblin_f(0, 'strike')]
SPRITES['en_ogre'] = lambda: [ogre(k) for k in range(4)]
SPRITES['en_ogre_atk'] = lambda: [ogre(0, 'up'), ogre(0, 'down')]


# ---- the camp ----
HIDE = ['#5a3e26', '#7a5636', '#9a744a', '#bc9662']
WOOD = ['#3a2416', '#5a3a22', '#7a5434', '#9a6e44']


def shack():
    """A goblin shack: crooked poles, a patchwork hide roof, a dark doorway hung with a rag. 64x56."""
    s = Canvas(64, 56)
    roof = poly([(4, 30), (30, 4), (36, 6), (60, 32), (54, 34), (10, 34)])
    for x, y in roof:
        patch = (x // 9 + y // 7) % 3
        n = vnoise(x * .4, y * .4, 3)
        c = HIDE[3] if x < 30 and n > .55 else HIDE[2 if patch else 1] if x < 34 else HIDE[1 if patch else 0]
        s.set(x, y, c)
    for i in range(3):                                            # stitched seams
        for x in range(10 + i * 14, 18 + i * 14):
            y = 32 - abs(x - 32) // 2 - 8 + i * 2
            if (x, y) in roof and x % 2:
                s.set(x, y, HIDE[0])
    for x, y in poly([(10, 34), (54, 34), (52, 52), (12, 52)]):    # the walls of lashed sticks
        s.set(x, y, WOOD[3] if x % 6 == 0 else WOOD[2] if x % 6 < 4 else WOOD[1])
    for x, y in poly([(26, 38), (38, 38), (38, 52), (26, 52)]):    # doorway
        s.set(x, y, '#140c08')
    for x in range(26, 34):                                       # a rag over half the door
        for y in range(38, 38 + 6 + (x % 3) * 2):
            s.set(x, y, '#7a3a2a' if (x + y) % 4 else '#5a2a1e')
    for px_ in (6, 31, 57):                                       # poles poking through the roof
        top = 0 if px_ == 31 else 22
        for y in range(top, top + 8):
            s.set(px_, y, WOOD[2]); s.set(px_ + 1, y, WOOD[0])
    for x, y in ((14, 46), (46, 44)):                             # a skull nailed up, and a bone
        s.set(x, y, '#e8e0c8'); s.set(x + 1, y, '#e8e0c8'); s.set(x, y + 1, '#1a1210'); s.set(x + 1, y + 1, '#c8c0a8')
    s.outline()
    return s


def totem():
    s = Canvas(24, 52)
    for y in range(10, 50):
        for x in range(9, 15):
            s.set(x, y, WOOD[3] if x == 9 else WOOD[1] if x == 14 else WOOD[2])
    for y0, col in ((12, '#c8402e'), (26, '#e8b830'), (38, '#4a8a3a')):   # three carved, painted faces
        s.fill(rect(7, y0, 10, 9), WOOD[2]); s.fill(rect(7, y0, 1, 9), WOOD[3])
        s.set(9, y0 + 3, col); s.set(14, y0 + 3, col); s.fill(rect(10, y0 + 6, 4, 1), '#1a1210')
    for x, y in ellipse(12, 6, 9, 5):                             # antlers, or something like them
        if abs(x - 12) > 3 and y < 7:
            s.set(x, y, '#e8dcc0')
    for x in range(6, 18):
        s.set(x, 50, WOOD[0]); s.set(x, 51, (20, 12, 10, 110))
    s.outline()
    return s


def spit():
    """A fire pit with a spit and something roasting. Lit at night (meta light)."""
    s = Canvas(40, 34)
    for x, y in ellipse(20, 27, 13, 5):
        s.set(x, y, '#4a4448' if ((x - 20) ** 2 / 169 + (y - 27) ** 2 / 25) > .55 else '#2a1e18')
    for x, y in ellipse(20, 24, 6, 6):                            # the flames
        if y < 27:
            s.set(x, y, '#ffd25a' if abs(x - 20) < 2 and y > 20 else '#f29a32' if y > 21 else '#e0602a')
    for px_ in (6, 33):                                           # the spit's forked posts
        for y in range(10, 30):
            s.set(px_, y, WOOD[2]); s.set(px_ + 1, y, WOOD[0])
        s.set(px_ - 1, 9, WOOD[2]); s.set(px_ + 2, 9, WOOD[2])
    for x in range(5, 36):
        s.set(x, 12, WOOD[3]); s.set(x, 13, WOOD[1])
    for x, y in ellipse(20, 15, 7, 4):                            # the roast
        s.set(x, y, '#c87a3a' if y < 15 else '#8a4a22')
    s.outline()
    s.meta = {'light': [20, 22]}
    return s


SPRITES.update({'furn_gshack': shack, 'furn_gtotem': totem, 'furn_gspit': spit})
