"""Vermin for the warrens under Briarholt: the rat (and its bigger kin, drawn at their own size so the
pixels stay crisp), the cellar roach, and the Rat King, a bloated old rat in a stolen crown.
Built like the beasts in handdrawn.py: hand-picked points scaled by k, flat cel shading, legs that step,
a crouched wind-up and a lunging strike with bared teeth. Pink tails, ears and feet are fixed colours
(K light, Q shade) so every coat keeps them."""
from sprites import handdrawn as H

H.FIXED.update({'K': '#e8a89a', 'Q': '#b0685e'})

SPRITES = {}


def _reg(name, fn):
    SPRITES['en_' + name] = lambda: [fn(k, 'walk') for k in range(4)]
    SPRITES['en_' + name + '_atk'] = lambda: [fn(0, 'wind'), fn(0, 'strike')]


def rat_f(step, pose='walk', k=1.0, crown=False, scars=False):
    """Designed in a 44x26 frame, facing right."""
    W, Hh = round(44 * k) + 2, round(26 * k) + (round(9 * k) if crown else 0)
    oy = Hh - 26 * k
    legs = [(14, 20, 13, 2.4, 1.6, -1), (30, 20, 31, 2.2, 1.6, 1), (12, 20, 11, 3, 2, -1), (28, 20, 28, 2.8, 2, 1)]
    body = [([(7, 17), (10, 12), (17, 9), (26, 9), (32, 12), (34, 17), (30, 22), (18, 23), (9, 22)], 'b'),
            ([(13, 19), (20, 20), (29, 19), (27, 22), (16, 22)], 'm'),                           # the paler belly
            ([(29, 13), (34, 10), (39, 12), (43, 15), (42, 17), (36, 19), (30, 18)], 'b')]      # the head, a long snout
    ears = [([(31, 11), (32, 6), (36, 8), (35, 11)], 'K')]
    det = [(12, 36, 'NE'), (15, 43, 'N'), (16, 42, 'K'), (17, 40, 'NNN'), (14, 39, '1'), (13, 33, 'Q'), (10, 17, '4444'), (11, 15, '44'),
           (10, 24, '44'), (15, 9, '2'), (19, 12, '2'), (20, 22, '2'), (16, 41, '1'), (14, 44, 'W'), (16, 44, 'W')]   # whiskers glint
    if pose == 'strike':
        det += [(17, 39, 'NNNN'), (18, 40, 'TT'), (19, 40, 'NN')]
    elif pose == 'wind':
        det += [(11, 36, 'R')]                                                                     # a red glint in the eye
    if scars:
        det += [(11, 20, 'Q'), (12, 21, 'Q'), (13, 22, 'Q'), (12, 27, 'QQ')]
    # the tail: a pink hook behind, swinging with the step (a shape, so it scales with the rat)
    sw = [0, 1, 0, -1][step if pose == 'walk' else 1]
    tail = [([(8, 16), (4, 15.5), (1.5 + sw, 17.5), (1 + sw, 21), (3 + sw, 22.5), (4 + sw, 21.5), (2.6 + sw, 20.5), (3 + sw, 18), (5, 17), (8, 17.6)], 'K')]
    if crown:   # a battered gold crown with a red stone, sitting crooked between the ear and the eyes
        ears = ears + [([(33, 9.5), (33, 6), (34, 7.5), (35, 4.5), (36.2, 7.5), (37.4, 5.2), (38, 9)], 'Y'), ([(33, 8.6), (38, 8.2), (38, 9.6), (33, 10)], 'O')]
        det += [(8, 35, 'R'), (11, 36, 'NEE'), (12, 36, 'NNN')]
    det = [(y, x, px) for y, x, px in det]
    dx, dy = H.POSE[pose]
    dx, dy = dx * k, dy * k
    legs_k = [(hx * k + dx, hy * k + dy + oy, fx * k + dx * .3, a * k, b * k, kn * k) for hx, hy, fx, a, b, kn in legs]
    tr = lambda shapes: [(H.S(p, k, dx, dy + oy), ch) for p, ch in shapes]
    st = step if pose == 'walk' else 1
    return H.quad(W, Hh, st, tr(tail), tr(ears), legs_k, tr(body), H.SD(det, k, dx, dy + oy), hoof='K', hh=1)


def roach_f(step, pose='walk'):
    """A cellar roach the size of a cat: glossy shell (b), legs and feelers (m), seen from the side."""
    W, Hh = 38, 20
    lift = [0, 1, 0, 1][step if pose == 'walk' else 0]
    dx = {'walk': 0, 'wind': -2, 'strike': 3}[pose]
    shell = [([(5 + dx, 12), (9 + dx, 6), (20 + dx, 4), (28 + dx, 6), (31 + dx, 11), (27 + dx, 15), (8 + dx, 15)], 'b'),
             ([(28 + dx, 8), (33 + dx, 8), (35 + dx, 11), (32 + dx, 14), (28 + dx, 13)], 'm')]   # the head plate
    g = H.polygrid(W, Hh, shell)
    det = [(9, 32 + dx, 'NE'), (6, 12 + dx, '444444'), (5, 16 + dx, '4444'), (10, 18 + dx, '2'), (8, 20 + dx, '1'), (9, 20 + dx, '1'), (10, 20 + dx, '1')]
    for i, x in enumerate((9, 16, 23)):                                                   # three legs a side, alternating
        up = lift if i % 2 == step % 2 else 0
        det += [(15, x + dx, '6'), (16, x - 1 + dx, '6'), (17 - up, x - 2 + dx, '5'), (18 - up, x - 3 + dx, '5'), (19 - up, x - 3 + dx, 'N')]
    feel = 2 if pose == 'strike' else 0
    det += [(7 - k, 35 + dx + k + feel, '5') for k in range(4)] + [(9 - k, 36 + dx + k + feel, '6') for k in range(3)]
    if pose == 'strike':
        det += [(12, 35 + dx, 'NN'), (13, 36 + dx, 'T')]
    return H.grid_sprite(H.with_detail(g, det, W), W, Hh)


_reg('rat', lambda s, p: rat_f(s, p, 1.0))
_reg('bigrat', lambda s, p: rat_f(s, p, 1.5, scars=True))
_reg('roach', roach_f)
_reg('ratking', lambda s, p: rat_f(s, p, 2.5, crown=True, scars=True))


# ---- the way down: a hole broken through the Wine Cellar floor, and the rope ladder back up ----
from px import Canvas, ellipse, rect, vnoise
FLAG = ['#4a4448', '#6a6268', '#8a8288', '#a8a0a2']
ROPE = ['#5a3a1e', '#8a6232', '#b88c4a']


def hole():
    s = Canvas(32, 32)
    for x, y in ellipse(16, 17, 14, 11):                       # broken flagstones round the edge
        n = vnoise(x * .45, y * .45, 3)
        s.set(x, y, FLAG[3] if y < 12 and n > .5 else FLAG[2] if n > .45 else FLAG[1])
    for x, y in ellipse(16, 18, 10, 7.5):                      # the pit, darkest at the far side
        s.set(x, y, '#0c080a' if y < 20 else '#1a1216')
    for x in range(8, 25):                                       # the lit far lip and the dark near lip
        for y in range(10, 27):
            if s.get(x, y)[:3] == (12, 8, 10) and s.get(x, y - 1)[:3] in [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) for c in FLAG]:
                s.set(x, y - 1, FLAG[0])
    for y in range(12, 25):                                      # the rope ladder's top rungs going down
        s.set(12, y, ROPE[1]); s.set(19, y, ROPE[1])
        if y % 4 == 0:
            for x in range(13, 19):
                s.set(x, y, ROPE[2] if y < 18 else ROPE[0])
    for x, y in ((5, 13), (26, 15), (8, 25), (24, 24), (15, 7)):   # loose chips
        s.set(x, y, FLAG[2]); s.set(x + 1, y + 1, FLAG[0])
    s.outline()
    return s


def ropeup():
    """A rope ladder hanging into the tunnel from a shaft of cellar light above."""
    s = Canvas(32, 60)
    for y in range(0, 14):                                       # the light falling down the shaft
        for x in range(8 - y // 4, 24 + y // 4):
            s.set(x, y, (255, 236, 190, max(0, 120 - y * 8)))
    for y in range(4, 58):
        s.set(11, y, ROPE[1]); s.set(10, y, ROPE[0]); s.set(20, y, ROPE[1]); s.set(21, y, ROPE[0])
        if y % 6 == 2:
            for x in range(12, 20):
                s.set(x, y, ROPE[2]); s.set(x, y + 1, ROPE[0])
    for x, y in ellipse(16, 57, 8, 2.5):                         # a coil of slack rope on the floor
        if not s.get(x, y)[3]:
            s.set(x, y, ROPE[1] if (x + y) % 3 else ROPE[0])
    s.outline()
    return s


SPRITES.update({'furn_hole': hole, 'furn_ropeup': ropeup})
