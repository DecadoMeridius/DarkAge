"""Human template sprites for the player and NPCs (palette-swapped in the game).

Natural proportions (about 4.5 heads tall), hand-placed cel shading: each part gets a
lit left edge, a base, a shaded right edge and a darker underside, instead of
rounded blob shading. Pixels are channel codes RGB(255, channel, level), level 0..3
dark -> light; h_pixel.js swaps them for ramps from the character's palette.
Real colours (eyes, whites, mouth) pass through; #2b1d18 is the swappable eye colour.

Frame 32x64 art px (16x32 world), feet on row 62. dir 0 front, 2 right, 3 back;
dir 1 is dir 2 mirrored in the game. Body frames f 0..3 walk; other layers are
drawn per dir and bobbed 1px on the step frames.
"""
from px import Canvas, rect, ellipse, poly, line

CH = {n: i for i, n in enumerate(['skin', 'hair', 'shirt', 'pants', 'shoe', 'acc', 'helm', 'plume', 'cape', 'hood', 'apron', 'beard', 'robe', 'hat', 'crown', 'belt', 'armor', 'trim'])}
EYE, WHITE, MOUTH = '#2b1d18', '#f4ece0', '#9a5048'


def code(ch, lvl):
    return (255, CH[ch], lvl, 255)


def cel(s, mask, ch, light='left'):
    """Flat cel shading: lit edge toward the light, base fill, shaded far edge and underside."""
    mask = {p for p in mask if 0 <= p[0] < 32 and 0 <= p[1] < 64}
    for x, y in mask:
        lvl = 2
        if (x + 1, y) not in mask or (x + 2, y) not in mask and light == 'left':
            lvl = 1
        if (x, y + 1) not in mask:
            lvl = min(lvl, 1)
        if (x - 1, y) not in mask and light == 'left':
            lvl = 3
        if (x + 1, y) not in mask and (x, y + 1) not in mask:
            lvl = 0
        s.px[x, y] = code(ch, lvl)


def flat(s, mask, ch, lvl):
    s.fill(mask, code(ch, lvl))


def hline(s, x0, x1, y, ch, lvl):
    flat(s, {(x, y) for x in range(x0, x1 + 1)}, ch, lvl)


# ---- body ------------------------------------------------------------------
HEAD_ROWS_F = {7: (12, 19), 8: (11, 20), 9: (10, 21), 10: (10, 21), 11: (10, 21), 12: (10, 21), 13: (10, 21), 14: (10, 21),
               15: (10, 21), 16: (10, 21), 17: (11, 20), 18: (11, 20), 19: (12, 19), 20: (13, 18)}
HEAD_F = {(x, y) for y, (a, b) in HEAD_ROWS_F.items() for x in range(a, b + 1)}
HEAD_ROWS_S = {7: (13, 19), 8: (12, 20), 9: (11, 21), 10: (11, 21), 11: (11, 21), 12: (11, 21), 13: (11, 21), 14: (11, 22),
               15: (11, 22), 16: (11, 21), 17: (12, 21), 18: (13, 20), 19: (14, 20), 20: (15, 19)}
HEAD_S = {(x, y) for y, (a, b) in HEAD_ROWS_S.items() for x in range(a, b + 1)}


def torso_f(dx=0, dy=0):
    """Front / back torso: sloped shoulders, a chest, a waist, the hips."""
    return poly([(9 + dx, 22 + dy), (23 + dx, 22 + dy), (24 + dx, 25 + dy), (23 + dx, 31 + dy), (22 + dx, 34 + dy), (23 + dx, 40 + dy),
                 (9 + dx, 40 + dy), (10 + dx, 34 + dy), (9 + dx, 31 + dy), (8 + dx, 25 + dy)])


def torso_s(dx=0, dy=0):
    return poly([(12 + dx, 22 + dy), (20 + dx, 22 + dy), (21 + dx, 26 + dy), (21 + dx, 32 + dy), (20 + dx, 35 + dy), (21 + dx, 40 + dy),
                 (11 + dx, 40 + dy), (12 + dx, 35 + dy), (11 + dx, 30 + dy), (11 + dx, 25 + dy)])


def belt_line(s, d, dy=0):
    if d == 2:
        hline(s, 12, 20, 35 + dy, 'belt', 1); hline(s, 12, 20, 36 + dy, 'belt', 0)
    else:
        hline(s, 10, 22, 35 + dy, 'belt', 1); hline(s, 10, 22, 36 + dy, 'belt', 0)
        if d == 0:
            s.fill({(16, 35 + dy), (16, 36 + dy)}, '#c8a040')


def hand(s, x, y, thumb=1):
    """A 3x3 hand: lit top-left, shaded bottom, a thumb on the inner side, knuckles."""
    cel(s, rect(x, y, 3, 3), 'skin')
    flat(s, {(x, y + 2), (x + 1, y + 2), (x + 2, y + 2)}, 'skin', 1)
    flat(s, {(x + (2 if thumb > 0 else 0), y)}, 'skin', 3)


def arm_front(s, x0, y0, side, length=14):
    """A hanging arm seen from the front or back: shoulder cap, a sleeve that narrows to a cuff, an elbow crease, a hand."""
    sleeve = poly([(x0 - (1 if side > 0 else 0), y0), (x0 + 3 + (1 if side < 0 else 0), y0), (x0 + 3, y0 + length - 1), (x0, y0 + length - 1)])
    cel(s, sleeve | ellipse(x0 + 1.5, y0 + 1, 1.6, 1.3), 'shirt')
    flat(s, {(x0 + (2 if side > 0 else 0), y0 + 6), (x0 + 1, y0 + 6)}, 'shirt', 1)   # elbow crease
    hline(s, x0, x0 + 2, y0 + length - 1, 'shirt', 0)                                  # cuff
    hand(s, x0, y0 + length, side)


def legs_front(s, f):
    step = {1: 1, 3: -1}.get(f, 0)
    for x0, side in ((10, 1), (17, -1)):
        lift = 2 if step * side > 0 else 0
        cel(s, rect(x0, 39, 5, 18 - lift), 'pants')
        cel(s, rect(x0 - 1, 56 - lift, 7, 6) - {(x0 - 1, 56 - lift)}, 'shoe')
        hline(s, x0 - 1, x0 + 5, 61 - lift, 'shoe', 0)


def body(d, f):
    s = Canvas(32, 64)
    step = {1: 1, 3: -1}.get(f, 0)
    if d in (0, 3):
        legs_front(s, f)
        cel(s, torso_f(), 'shirt'); belt_line(s, d)  # torso, sloped shoulders
        for x0, side in ((5, 1), (24, -1)):
            sw = -step * side
            arm_front(s, x0, 23 + sw, side)
        if d == 0:
            flat(s, {(14, 22), (15, 23), (16, 23), (17, 22)}, 'skin', 2)  # open collar
            hline(s, 12, 19, 22, 'acc', 2); hline(s, 13, 18, 23, 'acc', 1)
            hline(s, 10, 22, 30, 'shirt', 1)  # a fold across the chest
        cel(s, rect(14, 19, 4, 4), 'skin')  # neck
        cel(s, HEAD_F, 'skin')
        if d == 0:
            for ex in (12, 18):
                s.set(ex, 13, WHITE); s.set(ex + 1, 13, EYE); s.set(ex + 1, 14, EYE); s.set(ex, 14, WHITE)
                hline(s, ex, ex + 1, 11, 'hair', 1)  # brows
            flat(s, {(15, 15), (15, 16), (16, 16)}, 'skin', 1)  # nose
            s.fill({(15, 18), (16, 18)}, MOUTH); flat(s, {(12, 16), (19, 16)}, 'skin', 1)
            flat(s, {(10, 13), (21, 13)}, 'skin', 1)  # ears
    else:  # side, facing right
        for side, x0 in ((-1, 13), (1, 15)):
            off = step * side * 2
            cel(s, rect(x0 + off, 39, 5, 17), 'pants')
            cel(s, rect(x0 + off, 55, 7, 7), 'shoe')
            hline(s, x0 + off, x0 + off + 6, 61, 'shoe', 0)
        cel(s, torso_s(), 'shirt'); belt_line(s, 2)
        hline(s, 12, 20, 30, 'shirt', 1)
        sw = step * 2
        cel(s, poly([(14 + sw // 2, 23), (17 + sw // 2, 23), (17 + sw, 37), (14 + sw, 37)]), 'shirt')
        cel(s, rect(14 + sw, 37, 3, 4), 'skin')
        cel(s, rect(14, 19, 4, 4), 'skin')
        hline(s, 15, 19, 22, 'acc', 2)
        cel(s, HEAD_S, 'skin')
        s.set(19, 13, EYE); s.set(19, 14, EYE); s.set(20, 13, WHITE)
        hline(s, 18, 20, 11, 'hair', 1)
        flat(s, {(22, 14), (22, 15), (21, 16)}, 'skin', 1)
        s.fill({(19, 18), (20, 18)}, MOUTH)
        flat(s, {(14, 13), (14, 14), (13, 14)}, 'skin', 1)  # ear
    return s


# ---- hair ------------------------------------------------------------------
def hair(style, d, layer):
    s = Canvas(32, 64)
    if style == 'bald':
        return s
    side = d == 2
    if layer == 'back':
        if style == 'long':
            cel(s, rect(9, 12, 14, 18) if not side else rect(10, 12, 8, 18), 'hair')
        if style == 'pony' and d in (2, 3):
            cel(s, rect(10, 14, 4, 14) if side else rect(14, 18, 4, 14), 'hair')
        return s
    if d == 3:  # the back of the head: rounded crown, tapering to the nape
        cap = {(x, y) for x in range(9, 23) for y in range(5, 19) if not (y < 7 and (x < 11 or x > 20)) and not (y > 16 and (x < 11 or x > 20))}
        cap |= {(x, 19) for x in range(12, 20)} | {(13, 20), (15, 20), (17, 20), (19, 20)}
    elif side:
        cap = {(x, y) for x in range(10, 22) for y in range(4, 11) if not (y < 6 and (x < 12 or x > 19))}
        cap |= rect(10, 11, 5, 7) | {(15, 11), (16, 11), (19, 11), (20, 11), (21, 10), (14, 18)}   # fringe over the brow, hair over the ear
        cap -= {(x, 10) for x in range(17, 20)}
    else:
        cap = {(x, y) for x in range(9, 23) for y in range(4, 10) if not (y < 6 and (x < 11 or x > 20)) and not (y < 5 and (x < 13 or x > 18))}
        cap |= rect(9, 10, 2, 6) | rect(21, 10, 2, 6)  # sideburns over the ears
        cap |= {(x, 10) for x in range(11, 21) if x % 3 != 2} | {(11, 11), (12, 11), (14, 11), (17, 11), (19, 11), (20, 11), (12, 12)}  # a ragged fringe
    if style == 'spiky':
        for k in range(5):
            x0 = 9 + k * 3
            cap |= poly([(x0, 6), (x0 + 1.5, 1 + (k % 2) * 2), (x0 + 3, 6)])
    if style == 'long' and d == 0:
        cap |= rect(8, 10, 3, 20) | rect(21, 10, 3, 20)
    cel(s, cap, 'hair')
    for x, y in ((11, 6), (14, 5), (17, 6), (20, 7), (12, 8), (16, 8), (19, 9)):  # strand highlights and partings
        if (x, y) in cap:
            s.px[x, y] = code('hair', 3 if (x + y) % 2 else 1)
    if style == 'bun':
        cel(s, rect(13, 1, 6, 5) if not side else rect(9, 3, 5, 5), 'hair')
    return s


# ---- gear and costume ------------------------------------------------------
def helm(d):
    s = Canvas(32, 64)
    dome = {(x, y) for x in range(8, 24) for y in range(4, 15) if not (y < 7 and (x < 10 or x > 21))}
    if d != 3:
        dome |= rect(8, 14, 3, 6) | rect(21, 14, 3, 6) if d == 0 else rect(9, 14, 5, 6)
    cel(s, dome, 'helm')
    hline(s, 8, 23, 14, 'helm', 0); hline(s, 8, 23, 13, 'helm', 3)
    if d == 0:
        flat(s, rect(15, 14, 2, 5), 'helm', 2)
    return s


def plume(d):
    s = Canvas(32, 64)
    cel(s, poly([(14, 5), (18, 5), (21, 0), (13, 0)]) if d != 2 else poly([(11, 6), (15, 5), (9, 0), (5, 2)]), 'plume')
    return s


def hat(d):
    s = Canvas(32, 64)
    cel(s, rect(5, 9, 22, 3), 'hat')
    cel(s, {(x, y) for x in range(10, 22) for y in range(2, 10) if not (y < 4 and (x < 11 or x > 20))}, 'hat')
    hline(s, 10, 21, 8, 'hat', 0)
    return s


def crown(d):
    s = Canvas(32, 64)
    m = rect(10, 5, 12, 3) | poly([(10, 5), (11, 1), (12, 5)]) | poly([(15, 5), (16, 0), (17, 5)]) | poly([(20, 5), (21, 1), (22, 5)])
    cel(s, m, 'crown')
    s.set(16, 6, '#e8342a'); s.set(12, 6, '#4ad8e8'); s.set(20, 6, '#4ad8e8')
    return s


def hood(d, layer):
    s = Canvas(32, 64)
    outer = {(x, y) for x in range(7, 25) for y in range(4, 24) if not (y < 7 and (x < 10 or x > 21))}
    if layer == 'back':
        cel(s, outer, 'hood')
    else:
        face = {(x, y) for x in range(10, 22) for y in range(9, 21)} if d == 0 else {(x, y) for x in range(15, 23) for y in range(9, 21)} if d == 2 else set()
        cel(s, outer - face, 'hood')
    return s


def beard(d):
    s = Canvas(32, 64)
    if d == 3:
        return s
    m = (rect(10, 15, 2, 4) | rect(20, 15, 2, 4) | rect(11, 18, 10, 4) | rect(13, 22, 6, 2)) if d == 0 else (rect(16, 15, 6, 6) | rect(17, 21, 4, 2))
    cel(s, m, 'beard')
    if d == 0:
        s.fill({(15, 18), (16, 18)}, MOUTH); flat(s, {(12, 16), (19, 16)}, 'skin', 1)
        hline(s, 13, 18, 17, 'beard', 1)
    return s


def apron(d):
    s = Canvas(32, 64)
    if d == 3:
        hline(s, 9, 22, 33, 'apron', 1)
        return s
    m = poly([(11, 26), (21, 26), (22, 50), (10, 50)]) if d == 0 else poly([(17, 26), (21, 26), (22, 50), (17, 50)])
    cel(s, m, 'apron')
    if d == 0:
        flat(s, line(11, 26, 9, 22) | line(21, 26, 23, 22), 'apron', 1)
    return s


def robe(d):
    s = Canvas(32, 64)
    m = poly([(8, 22), (24, 22), (26, 60), (6, 60)]) if d != 2 else poly([(11, 22), (21, 22), (23, 60), (9, 60)])
    cel(s, m, 'robe')
    hline(s, 9 if d != 2 else 11, 22 if d != 2 else 21, 33, 'robe', 0)
    return s


def belt(d):
    s = Canvas(32, 64)
    x0, x1 = (9, 22) if d != 2 else (11, 21)
    hline(s, x0, x1, 37, 'belt', 1); hline(s, x0, x1, 38, 'belt', 0)
    if d == 0:
        s.fill({(15, 37), (16, 37), (15, 38), (16, 38)}, '#e8c040')
    return s


def cape(d):
    s = Canvas(32, 64)
    if d == 3:
        cel(s, poly([(7, 22), (25, 22), (26, 56), (6, 56)]), 'cape')
    elif d == 2:
        cel(s, poly([(10, 22), (13, 22), (9, 54), (6, 52)]), 'cape')
    else:
        cel(s, rect(6, 24, 2, 26) | rect(24, 24, 2, 26), 'cape')
    return s


def ribs(d):
    s = Canvas(32, 64)
    bone = '#e8e4d8'
    s.fill(rect(15, 23, 2, 15), bone)
    if d != 3:
        x0, x1 = (10, 21) if d == 0 else (12, 20)
        for y in range(25, 37, 3):
            s.fill(rect(x0, y, x1 - x0 + 1, 1), bone); s.fill(rect(x0 + 1, y + 1, x1 - x0 - 1, 1), '#3a3640')
    return s


def ears(d):
    s = Canvas(32, 64)
    if d == 2:
        cel(s, poly([(14, 15), (9, 8), (13, 17)]), 'skin')
    elif d == 0:
        cel(s, poly([(10, 15), (5, 8), (10, 17)]), 'skin'); cel(s, poly([(21, 15), (26, 8), (21, 17)]), 'skin')
    return s


def ride():
    """Seated on a horse, facing right: torso upright, thigh forward along the saddle,
    shin hanging down the horse's flank. Feet end near row 52 (the horse's belly)."""
    s = Canvas(32, 64)
    cel(s, rect(13, 38, 9, 5), 'pants')            # thigh along the saddle
    cel(s, rect(18, 41, 4, 10), 'pants')           # shin down the side
    cel(s, rect(18, 50, 7, 4), 'shoe'); hline(s, 18, 24, 53, 'shoe', 0)
    cel(s, poly([(11, 22), (21, 22), (21, 40), (11, 40)]), 'shirt')
    hline(s, 11, 21, 32, 'shirt', 1)
    cel(s, poly([(15, 23), (18, 23), (22, 33), (19, 34)]), 'shirt')  # arm reaching for the reins
    cel(s, rect(20, 32, 3, 3), 'skin')
    cel(s, rect(14, 19, 4, 4), 'skin')
    hline(s, 15, 19, 22, 'acc', 2)
    cel(s, HEAD_S, 'skin')
    s.set(19, 13, EYE); s.set(19, 14, EYE); s.set(20, 13, WHITE)
    hline(s, 18, 20, 11, 'hair', 1)
    flat(s, {(22, 14), (22, 15), (21, 16)}, 'skin', 1)
    s.fill({(19, 18), (20, 18)}, MOUTH)
    flat(s, {(14, 13), (14, 14), (13, 14)}, 'skin', 1)
    return s


def mask(d):
    """A bandit's bandana over the nose and mouth, knotted at the back (hood channel)."""
    s = Canvas(32, 64)
    if d == 0:
        cel(s, rect(10, 15, 12, 5) | {(15, 20), (16, 20), (16, 21)}, 'hood')
        hline(s, 10, 21, 15, 'hood', 3)
    elif d == 2:
        cel(s, rect(15, 15, 8, 5), 'hood'); hline(s, 15, 22, 15, 'hood', 3)
        cel(s, {(12, 15), (11, 16), (12, 17), (11, 18), (10, 19)}, 'hood')  # the knot's tails
    else:
        cel(s, rect(11, 15, 10, 2) | {(15, 17), (16, 17), (15, 18), (16, 19)}, 'hood')
    return s


def vest(d):
    """A leather vest with a cross strap and a buckle (belt channel)."""
    s = Canvas(32, 64)
    if d == 0:
        cel(s, poly([(9, 23), (14, 23), (13, 38), (9, 38)]) | poly([(18, 23), (23, 23), (23, 38), (19, 38)]), 'belt')
        flat(s, line(10, 24, 21, 35) | line(11, 24, 22, 35), 'belt', 0)
        s.fill({(16, 30), (17, 30), (16, 31), (17, 31)}, '#c8a040')
    elif d == 2:
        cel(s, poly([(11, 23), (21, 23), (21, 38), (11, 38)]) - rect(14, 25, 4, 12), 'belt')
        flat(s, line(12, 24, 20, 35), 'belt', 0)
    else:
        cel(s, poly([(9, 23), (23, 23), (23, 38), (9, 38)]), 'belt')
        flat(s, line(10, 24, 21, 35) | line(11, 24, 22, 35), 'belt', 0)
    return s


def quiver(d):
    """A quiver of arrows across the back, fletching over the shoulder."""
    s = Canvas(32, 64)
    if d == 0:
        s.fill({(22, 18), (23, 17), (24, 18), (21, 19), (23, 19)}, '#e8dcc0')
        flat(s, {(22, 20), (22, 21)}, 'belt', 1)
    elif d == 2:
        cel(s, poly([(9, 19), (13, 18), (13, 34), (10, 35)]), 'belt')
        s.fill({(9, 16), (10, 15), (11, 16), (12, 15), (13, 16)}, '#e8dcc0')
    else:
        cel(s, poly([(17, 19), (22, 18), (22, 36), (18, 36)]), 'belt')
        s.fill({(17, 15), (18, 14), (19, 15), (20, 14), (21, 15), (18, 16), (20, 16)}, '#e8dcc0')
    return s


def _all():
    out = {}
    for d in (0, 2, 3):
        for f in range(4):
            out[f'hb_body_{d}_{f}'] = (lambda d=d, f=f: body(d, f))
        for st in ('short', 'long', 'pony', 'bun', 'spiky'):
            out[f'hb_hair_{st}_{d}_front'] = (lambda st=st, d=d: hair(st, d, 'front'))
            out[f'hb_hair_{st}_{d}_back'] = (lambda st=st, d=d: hair(st, d, 'back'))
        for n, fn in (('mask', mask), ('vest', vest), ('quiver', quiver), ('helm', helm), ('plume', plume), ('hat', hat), ('crown', crown), ('beard', beard), ('apron', apron), ('robe', robe), ('belt', belt), ('cape', cape), ('ribs', ribs), ('ears', ears)):
            out[f'hb_{n}_{d}'] = (lambda fn=fn, d=d: fn(d))
        out[f'hb_hood_{d}_back'] = (lambda d=d: hood(d, 'back'))
        if d == 2:
            out['hb_ride_2'] = ride
        out[f'hb_hood_{d}_front'] = (lambda d=d: hood(d, 'front'))
    return out


# ---- Phase 14: an 8-frame walk and action poses ----------------------------------
# hb_body_<d>_w<0..7>   walk cycle (legs and arms on a sine, 1px bob on the passing frames)
# hb_body_<d>_<pose>    idle1 (breath in), wind (tool or weapon raised), strike (brought down),
#                       thrust (lead arm straight out), draw (bow drawn), cast (rod held out),
#                       pour (can tipped), eat (hand to mouth), block (forearms up), hurt (recoil),
#                       tuck (curled up for the dodge roll; drawn alone, rotated in the game)
# The hand position of each pose is in POSE_HAND (art px), mirrored in the game for dir 1.
import math

POSES = ('idle1', 'wind', 'strike', 'thrust', 'draw', 'cast', 'pour', 'eat', 'block', 'hurt')
POSE_HAND = {  # (x, y) of the leading hand per dir, art px in the 32x64 frame
    'wind': {0: (25, 6), 2: (10, 6), 3: (7, 6)}, 'strike': {0: (17, 37), 2: (26, 37), 3: (16, 34)},
    'thrust': {0: (18, 31), 2: (29, 27), 3: (16, 28)}, 'draw': {0: (16, 28), 2: (29, 26), 3: (16, 26)},
    'cast': {0: (18, 27), 2: (26, 15), 3: (16, 24)}, 'pour': {0: (17, 34), 2: (24, 33), 3: (16, 33)},
    'eat': {0: (16, 19), 2: (21, 18), 3: (16, 22)}, 'block': {0: (16, 27), 2: (23, 24), 3: (16, 27)},
    'hurt': {0: (26, 30), 2: (9, 32), 3: (6, 30)}, 'idle1': {0: (26, 38), 2: (16, 39), 3: (6, 38)},
}


def head(s, d, dx=0, dy=0):
    """The head and neck of body(), shifted for leaning poses."""
    sh = lambda m: {(x + dx, y + dy) for x, y in m}
    cel(s, sh(rect(14, 19, 4, 4)), 'skin')
    if d in (0, 3):
        cel(s, sh(HEAD_F), 'skin')
        if d == 0:
            for ex in (12, 18):
                s.set(ex + dx, 13 + dy, WHITE); s.set(ex + 1 + dx, 13 + dy, EYE); s.set(ex + 1 + dx, 14 + dy, EYE); s.set(ex + dx, 14 + dy, WHITE)
                hline(s, ex + dx, ex + 1 + dx, 11 + dy, 'hair', 1)
            flat(s, sh({(15, 15), (15, 16), (16, 16)}), 'skin', 1)
            s.fill(sh({(15, 18), (16, 18)}), MOUTH); flat(s, sh({(12, 16), (19, 16)}), 'skin', 1)
            flat(s, sh({(10, 13), (21, 13)}), 'skin', 1)
    else:
        hline(s, 15 + dx, 19 + dx, 22 + dy, 'acc', 2)
        cel(s, sh(HEAD_S), 'skin')
        s.set(19 + dx, 13 + dy, EYE); s.set(19 + dx, 14 + dy, EYE); s.set(20 + dx, 13 + dy, WHITE)
        hline(s, 18 + dx, 20 + dx, 11 + dy, 'hair', 1)
        flat(s, sh({(22, 14), (22, 15), (21, 16)}), 'skin', 1)
        s.fill(sh({(19, 18), (20, 18)}), MOUTH)
        flat(s, sh({(14, 13), (14, 14), (13, 14)}), 'skin', 1)


def arm(s, pts, hand, d):
    cel(s, poly(pts), 'shirt')
    cel(s, rect(*hand), 'skin')


def seg(x0, y0, x1, y1, w):
    """A limb segment (a capsule) from (x0, y0) to (x1, y1), w px thick."""
    L = math.hypot(x1 - x0, y1 - y0) or 1
    nx, ny = -(y1 - y0) / L * w / 2, (x1 - x0) / L * w / 2
    m = poly([(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)])
    return m | ellipse(x1, y1, w / 2, w / 2) | ellipse(x0, y0, w / 2, w / 2)


def limb(hx, hy, a1, a2, l1, l2):
    """Joint positions for a two-segment limb hanging from (hx, hy): angles from straight down, + = forward (right)."""
    kx, ky = hx + math.sin(a1) * l1, hy + math.cos(a1) * l1
    return (kx, ky), (kx + math.sin(a2) * l2, ky + math.cos(a2) * l2)


def walk(d, f):
    """8-frame walk with jointed limbs: thighs swing on the gait sine, knees bend during the swing, the far
    leg and arm are a shade darker, arms swing against the legs with a bent elbow, and the body bobs."""
    s = Canvas(32, 64)
    ph = f / 8 * math.tau
    bob = -1 if abs(math.sin(ph)) < .5 else 0  # the body rises as the legs pass under it
    if d == 2:  # side view, facing right (the game mirrors it for left)
        hip = (16, 39 + bob)
        legs = []
        for k in (0, 1):  # 0 = far leg, 1 = near leg
            p = ph + k * math.pi
            a1 = .42 * math.sin(p)
            bend = .85 * max(0, math.cos(p))  # knee bends while the leg swings forward
            a2 = a1 - bend
            (kx, ky), (ax, ay) = limb(hip[0], hip[1], a1, a2, 9, 9)
            ay = min(ay, 57); legs.append((k, kx, ky, ax, ay, bend))
        arms = []
        for k in (0, 1):
            p = ph + k * math.pi + math.pi  # arms swing against the legs on the same side
            u = .55 * math.sin(p); fa = u + .35 + .35 * max(0, math.sin(p))
            (ex, ey), (wx, wy) = limb(15, 24 + bob, u, fa, 7, 7)
            arms.append((k, ex, ey, wx, wy))
        def draw_leg(k, kx, ky, ax, ay, bend):
            lvl = None if k else 1
            th, sh = seg(hip[0], hip[1], kx, ky, 5), seg(kx, ky, ax, ay, 4)
            if lvl is None: cel(s, th | sh, 'pants')
            else: flat(s, th | sh, 'pants', 1)
            foot = rect(round(ax) - 2, round(ay) + 1, 7, 4) if bend < .3 else poly([(ax - 2, ay), (ax + 4, ay + 1), (ax + 4, ay + 4), (ax - 2, ay + 4)])
            if lvl is None: cel(s, foot, 'shoe')
            else: flat(s, foot, 'shoe', 1)
            hline(s, round(ax) - 2, round(ax) + 4, round(ay) + 4, 'shoe', 0)
        def draw_arm(k, ex, ey, wx, wy):
            up, fo = seg(15, 24 + bob, ex, ey, 4), seg(ex, ey, wx, wy, 3)
            if k: cel(s, up | fo, 'shirt')
            else: flat(s, up | fo, 'shirt', 1)
            s.px[round(ex), round(ey)] = code('shirt', 0 if k else 0)        # the elbow
            cel(s, ellipse(wx, wy + 1, 1.7, 1.7), 'skin'); flat(s, {(round(wx), round(wy) + 2)}, 'skin', 1)
        for L in legs:
            if L[0] == 0: draw_leg(*L)
        for A in arms:
            if A[0] == 0: draw_arm(*A)
        cel(s, torso_s(0, bob), 'shirt'); belt_line(s, 2, bob); hline(s, 12, 20, 30 + bob, 'shirt', 1)
        for L in legs:
            if L[0] == 1: draw_leg(*L)
        head(s, d, 0, bob)
        for A in arms:
            if A[0] == 1: draw_arm(*A)
        return s
    # front (0) and back (3): the knee lifts and the shin folds back (foreshortened), arms swing with the elbow
    for x0, side in ((12, 1), (19, -1)):
        p = ph if side > 0 else ph + math.pi
        lift = max(0, math.cos(p))  # the swinging leg lifts
        knee_y = 48 - round(lift * 2) + bob
        foot_y = 57 - round(lift * 4)
        cel(s, seg(x0, 39 + bob, x0, knee_y, 5) | seg(x0, knee_y, x0 + (side if lift > .4 else 0), foot_y, 4), 'pants')
        hline(s, x0 - 2, x0 + 2, knee_y, 'pants', 1)  # the knee crease
        cel(s, rect(x0 - 3, foot_y, 7, 5) - {(x0 - 3, foot_y)}, 'shoe'); hline(s, x0 - 3, x0 + 3, foot_y + 4, 'shoe', 0)
    cel(s, torso_f(0, bob), 'shirt'); belt_line(s, d, bob)
    for x0, side in ((6, 1), (25, -1)):
        p = ph + (0 if side > 0 else math.pi) + math.pi
        fwd = math.sin(p)  # + forward (toward the viewer when facing down)
        ey = 30 + bob - round(abs(fwd) * 1)
        hx_ = x0 + round(side * max(0, fwd) * 2)  # a forward swing brings the hand in toward the body
        wy = 37 + bob - round(max(0, fwd) * 3)
        cel(s, seg(x0, 24 + bob, x0, ey, 3) | seg(x0, ey, hx_, wy, 3) | ellipse(x0, 24 + bob, 1.6, 1.3), 'shirt')
        flat(s, {(x0, ey), (x0 + side, ey)}, 'shirt', 1)                     # elbow crease
        hline(s, hx_ - 1, hx_ + 1, wy - 1, 'shirt', 0)                     # cuff
        hand(s, hx_ - 1, wy, side)
    if d == 0:
        flat(s, {(14, 22 + bob), (15, 23 + bob), (16, 23 + bob), (17, 22 + bob)}, 'skin', 2)
        hline(s, 12, 19, 22 + bob, 'acc', 2); hline(s, 13, 18, 23 + bob, 'acc', 1); hline(s, 10, 22, 30 + bob, 'shirt', 1)
    head(s, d, 0, bob)
    return s


def stance(s, d, wide=1):
    """Feet planted for an action."""
    if d in (0, 3):
        for x0 in (10 - wide, 17 + wide):
            cel(s, rect(x0, 39, 5, 18), 'pants'); cel(s, rect(x0 - 1, 56, 7, 6) - {(x0 - 1, 56)}, 'shoe'); hline(s, x0 - 1, x0 + 5, 61, 'shoe', 0)
    else:
        for x0 in (11, 17):
            cel(s, rect(x0, 39, 5, 17), 'pants'); cel(s, rect(x0, 55, 7, 7), 'shoe'); hline(s, x0, x0 + 6, 61, 'shoe', 0)


def torso(s, d, dx=0, dy=0):
    if d in (0, 3):
        cel(s, torso_f(dx, dy), 'shirt'); belt_line(s, d)
        if d == 0:
            hline(s, 12 + dx, 19 + dx, 22 + dy, 'acc', 2); hline(s, 10 + dx, 22 + dx, 30, 'shirt', 1)
    else:
        cel(s, torso_s(dx, dy), 'shirt'); belt_line(s, 2)


def pose(d, p):
    s = Canvas(32, 64)
    if p == 'tuck':  # a ball: back, knees and head tucked; rotated in 90° steps in the game
        cel(s, ellipse(16, 46, 10, 9), 'shirt')
        cel(s, ellipse(20, 50, 6, 5), 'pants')
        cel(s, rect(23, 50, 4, 4), 'shoe')
        cel(s, ellipse(12, 40, 5, 5), 'skin')
        cel(s, ellipse(11, 38, 5, 4), 'hair')
        return s
    side = d == 2
    lean = {'wind': -1, 'strike': 1, 'thrust': 1, 'hurt': -2, 'draw': 0}.get(p, 0) if side else 0
    up = -1 if p in ('idle1', 'wind') else 1 if p == 'strike' else 0
    stance(s, d, 2 if p in ('strike', 'thrust', 'draw') else 1)
    back_arms, front_arms = [], []
    if not side:
        L = {  # front/back view arms: (shoulder polygon, hand rect)
            'idle1': [([(5, 22), (8, 22), (8, 36), (5, 36)], (5, 36, 3, 4)), ([(24, 22), (27, 22), (27, 36), (24, 36)], (24, 36, 3, 4))],
            'wind': [([(5, 22), (8, 22), (9, 8), (6, 8)], (6, 4, 3, 4)), ([(24, 22), (27, 22), (26, 8), (23, 8)], (23, 4, 3, 4))],
            'strike': [([(6, 23), (9, 23), (15, 35), (13, 36)], (13, 35, 3, 3)), ([(23, 23), (26, 23), (19, 36), (17, 35)], (16, 35, 3, 3))],
            'thrust': [([(5, 23), (8, 23), (8, 36), (5, 36)], (5, 36, 3, 4)), ([(23, 23), (26, 23), (20, 31), (18, 29)], (16, 29, 4, 3))],
            'draw': [([(6, 23), (9, 23), (17, 28), (15, 29)], (15, 27, 3, 3)), ([(23, 23), (26, 23), (22, 26), (21, 24)], (19, 23, 3, 3))],
            'cast': [([(6, 23), (9, 23), (17, 27), (15, 28)], (15, 26, 3, 3)), ([(23, 23), (26, 23), (20, 28), (18, 27)], (17, 26, 3, 3))],
            'pour': [([(6, 23), (9, 23), (16, 33), (14, 34)], (14, 33, 3, 3)), ([(23, 23), (26, 23), (19, 34), (17, 33)], (17, 33, 3, 3))],
            'eat': [([(5, 23), (8, 23), (8, 36), (5, 36)], (5, 36, 3, 4)), ([(23, 23), (26, 23), (19, 22), (18, 20)], (15, 18, 3, 3))],
            'block': [([(6, 23), (9, 23), (12, 29), (10, 30)], (10, 26, 3, 3)), ([(23, 23), (26, 23), (22, 30), (20, 29)], (19, 26, 3, 3))],
            'hurt': [([(5, 23), (8, 23), (3, 34), (1, 33)], (1, 33, 3, 3)), ([(24, 23), (27, 23), (30, 34), (28, 35)], (28, 33, 3, 3))],
        }[p]
        if d == 3:  # from behind, arms reaching forward are hidden by the body
            for pts, hand in L:
                if p in ('wind', 'hurt', 'idle1'):
                    back_arms.append((pts, hand))
                else:
                    sx = pts[0][0]
                    back_arms.append(([(sx, 23), (sx + 3, 23), (sx + 3, 30), (sx, 30)], None))
        else:
            front_arms = L
        torso(s, d, 0, up)
        for pts, hand in back_arms:
            cel(s, poly(pts), 'shirt')
            if hand:
                cel(s, rect(*hand), 'skin')
        head(s, d, 0, up)
        for pts, hand in front_arms:
            arm(s, pts, hand, d)
        if d == 0:
            flat(s, {(14, 22 + up), (15, 23 + up), (16, 23 + up), (17, 22 + up)}, 'skin', 2)
        return s
    A = {  # side view, facing right: leading arm (shoulder at 14..17, 23)
        'idle1': ([(14, 22), (17, 22), (17, 36), (14, 36)], (14, 36, 3, 4)),
        'wind': ([(14, 23), (17, 23), (12, 8), (9, 9)], (8, 4, 4, 4)),
        'strike': ([(14, 23), (17, 23), (26, 35), (23, 37)], (24, 35, 4, 4)),
        'thrust': ([(14, 25), (14, 28), (27, 28), (27, 25)], (27, 25, 3, 4)),
        'draw': ([(14, 25), (14, 28), (27, 27), (27, 24)], (27, 24, 3, 4)),
        'cast': ([(14, 23), (17, 23), (25, 16), (23, 14)], (24, 13, 4, 4)),
        'pour': ([(14, 23), (17, 23), (23, 33), (20, 34)], (21, 32, 4, 3)),
        'eat': ([(14, 23), (17, 23), (20, 22), (18, 19)], (19, 17, 3, 3)),
        'block': ([(14, 23), (17, 23), (22, 26), (20, 28)], (21, 22, 3, 5)),
        'hurt': ([(14, 23), (17, 23), (11, 33), (9, 32)], (8, 31, 3, 3)),
    }[p]
    if p == 'draw':  # the string hand, pulled back to the chest
        cel(s, rect(11, 25, 6, 3), 'shirt'); cel(s, rect(10, 24, 3, 4), 'skin')
    torso(s, d, lean, up)
    head(s, d, lean, up)
    pts, hand = A
    arm(s, [(x + (lean if y < 30 else 0), y + up) for x, y in pts], (hand[0] + lean, hand[1] + up, hand[2], hand[3]), d)
    return s


def _anim():
    out = {}
    for d in (0, 2, 3):
        for f in range(8):
            out[f'hb_body_{d}_w{f}'] = (lambda d=d, f=f: walk(d, f))
        for p in POSES:
            out[f'hb_body_{d}_{p}'] = (lambda d=d, p=p: pose(d, p))
    out['hb_body_0_tuck'] = lambda: pose(0, 'tuck')
    return out


SPRITES = {**_all(), **_anim()}
