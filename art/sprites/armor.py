"""Helmets and body armour drawn on the character, one design per tier.

hb_helm_<tier>_<d>  a helmet that covers the whole head (hair is hidden under it): shell
                    in the 'helm' channel (the helmet's metal), crests, wings, horns, fur
                    and flames in the 'plume' channel (the tier's accent colour). Dark eye
                    slits and glowing eyes are real colours.
hb_arm_<tier>_<d>   a cuirass over the torso with the tier's pauldrons: plates in the
                    'armor' channel, straps, trim and fur in 'trim'.
d: 0 front, 2 right (mirrored for left), 3 back; 32x64 frames like human.py.
The game picks them in humanSpr (h_pixel.js) from the worn items (playerPal in x_gear.js).
"""
from px import Canvas, rect, ellipse, poly, line
from sprites.human import cel, flat, hline, code

SLIT = '#140c12'
HELM = {  # shell, face, extras
    'leather': ('round', 'open', ['coif']),
    'copper': ('round', 'nasal', ['brow', 'rivets']),
    'iron': ('tall', 'slit', ['cross', 'breaths']),
    'steel': ('point', 'visor', ['brow', 'feather']),
    'silver': ('round', 'cheek', ['wings', 'brow']),
    'gold': ('round', 'T', ['crest', 'brow']),
    'mythril': ('point', 'narrow', ['leaves']),
    'frost': ('round', 'cheek', ['icespikes']),
    'obsidian': ('tall', 'glow', ['horns']),
    'adamant': ('tall', 'T', ['spikes', 'rivets']),
    'dragon': ('round', 'teeth', ['dragon']),
    'star': ('point', 'T', ['halo']),
    'cobalt': ('round', 'spectacle', ['fur', 'smallhorns']),
    'tide': ('round', 'cheek', ['fins']),
    'rime': ('tall', 'slit', ['icicles']),
    'cinder': ('tall', 'glow', ['flames']),
}
GLOW = {'obsidian': '#e060ff', 'cinder': '#ffb040'}


def shell(kind, d):
    if d == 2:
        xs = range(9, 24)
        m = {(x, y) for x in xs for y in range(4, 22)}
        m -= {(x, y) for x, y in m if y < 7 and (x < 11 or x > 21)}
        m -= {(x, y) for x, y in m if y < 5 and (x < 13 or x > 19)}
        if kind == 'tall':
            m |= {(x, y) for x in range(10, 23) for y in range(3, 7)}
        if kind == 'point':
            m |= {(x, y) for x in range(9, 24) for y in range(1, 6) if abs(x - 14.5) <= (y - .5) * 1.7}
        return m
    m = {(x, y) for x in range(9, 23) for y in range(4, 22)}
    m -= {(x, y) for x, y in m if y < 7 and (x < 11 or x > 20)}
    m -= {(x, y) for x, y in m if y < 5 and (x < 13 or x > 18)}
    if kind == 'tall':
        m |= {(x, y) for x in range(10, 22) for y in range(3, 7)}
    if kind == 'point':
        m |= {(x, y) for x in range(9, 23) for y in range(1, 6) if abs(x - 15.5) <= (y - .5) * 1.7}
    return m


def helm(tk, d):
    kind, face, extras = HELM[tk]
    s = Canvas(32, 64)
    m = shell(kind, d)
    cel(s, m, 'helm')
    if d != 3:
        hline(s, 9, 22 if d == 0 else 23, 21, 'helm', 0)
    side = d == 2
    # the face
    if d == 0:
        holes = {'open': rect(11, 10, 10, 10), 'nasal': rect(11, 10, 10, 10), 'cheek': rect(12, 10, 8, 10), 'narrow': rect(12, 11, 8, 9),
                 'teeth': rect(11, 11, 10, 8), 'spectacle': rect(11, 10, 10, 10)}.get(face)
        if holes:
            for p in holes:
                s.px[p[0], p[1]] = (0, 0, 0, 0)
        if face == 'nasal':
            flat(s, rect(15, 10, 2, 6), 'helm', 3); flat(s, rect(16, 10, 1, 6), 'helm', 1)
        if face == 'cheek':
            flat(s, rect(12, 16, 1, 4) | rect(19, 16, 1, 4), 'helm', 1)
        if face == 'spectacle':
            flat(s, (ellipse(13, 13, 2, 2) - ellipse(13, 13, 1, 1)) | (ellipse(18, 13, 2, 2) - ellipse(18, 13, 1, 1)) | rect(15, 10, 2, 7), 'helm', 3)
        if face == 'teeth':
            for x in range(11, 21, 2):
                s.set(x, 11, '#f0e6d0'); s.set(x, 18, '#f0e6d0')
        if face in ('slit', 'glow'):
            s.fill(rect(11, 12, 10, 2), SLIT); hline(s, 11, 20, 11, 'helm', 3)
            if face == 'glow':
                s.set(13, 12, GLOW[tk]); s.set(18, 12, GLOW[tk])
        if face == 'T':
            s.fill(rect(11, 12, 10, 2) | rect(15, 14, 2, 6), SLIT); hline(s, 11, 20, 11, 'helm', 3)
        if face == 'visor':  # a pointed snout visor with breaths
            flat(s, rect(11, 10, 10, 11), 'helm', 2); flat(s, rect(15, 10, 2, 11), 'helm', 3); flat(s, rect(17, 10, 1, 11), 'helm', 1)
            s.fill(rect(11, 12, 4, 1) | rect(18, 12, 3, 1), SLIT)
            for y in (16, 18):
                s.set(13, y, SLIT); s.set(19, y, SLIT)
    if side:
        hole = {'open': rect(17, 10, 7, 10), 'nasal': rect(17, 10, 7, 10), 'cheek': rect(18, 10, 6, 9), 'narrow': rect(18, 11, 6, 8),
                'teeth': rect(18, 11, 6, 8), 'spectacle': rect(17, 10, 7, 10)}.get(face)
        if hole:
            for p in hole:
                s.px[p[0], p[1]] = (0, 0, 0, 0)
        if face == 'nasal':
            flat(s, rect(22, 10, 1, 6), 'helm', 3)
        if face == 'spectacle':
            flat(s, ellipse(20, 13, 2, 2) - ellipse(20, 13, 1, 1), 'helm', 3)
        if face == 'teeth':
            for x in range(18, 24, 2):
                s.set(x, 11, '#f0e6d0'); s.set(x, 18, '#f0e6d0')
        if face in ('slit', 'glow', 'T'):
            s.fill(rect(18, 12, 6, 2), SLIT); hline(s, 18, 23, 11, 'helm', 3)
            if face == 'glow':
                s.set(21, 12, GLOW[tk])
            if face == 'T':
                s.fill(rect(22, 14, 2, 5), SLIT)
        if face == 'visor':
            cel(s, poly([(19, 10), (23, 10), (27, 15), (23, 20), (19, 20)]), 'helm'); s.fill(rect(20, 12, 4, 1), SLIT)
            s.set(23, 16, SLIT); s.set(23, 18, SLIT)
    # extras
    for ex in extras:
        if ex == 'coif':  # stitched leather with a neck flap
            for y in range(5, 10, 2):
                flat(s, {(15 if not side else 14, y)}, 'plume', 1)
            cel(s, rect(9, 19, 14, 4) if not side else rect(9, 19, 9, 4), 'helm')
        if ex == 'brow':
            hline(s, 9 if not side else 9, 22 if not side else 23, 8 if face != 'visor' else 9, 'plume', 2); hline(s, 9, 22 if not side else 23, 9 if face != 'visor' else 10, 'plume', 1)
        if ex == 'rivets':
            for x in ((10, 13, 18, 21) if not side else (10, 13, 16)):
                s.set(x, 7, code('helm', 3))
        if ex == 'cross':
            if d != 2:
                flat(s, rect(15, 3, 2, 9 if d == 0 else 18), 'plume', 2)
            hline(s, 9, 22 if not side else 23, 10, 'plume', 1)
        if ex == 'breaths' and d == 0:
            for x in (12, 14, 17, 19):
                s.set(x, 17, SLIT); s.set(x, 19, SLIT)
        if ex == 'feather':  # a short plume from a socket at the back
            cel(s, poly([(10, 3), (13, 4), (8, -1), (5, 0)]) if side else poly([(14, 3), (17, 3), (18, -1), (15, -2)]), 'plume')
        if ex == 'wings':
            if side:
                cel(s, poly([(12, 8), (4, 1), (5, 4), (3, 6), (6, 9), (11, 12)]), 'plume')
            else:
                cel(s, poly([(9, 9), (3, 2), (2, 7), (4, 10), (9, 13)]), 'plume'); cel(s, poly([(22, 9), (28, 2), (29, 7), (27, 10), (22, 13)]), 'plume')
        if ex == 'crest':  # a horsehair crest front to back
            if side:
                cel(s, poly([(7, 8), (8, 3), (13, 0), (20, 1), (22, 4), (18, 3), (13, 3), (10, 6)]), 'plume')
            else:
                cel(s, rect(14, 0, 4, 5), 'plume'); flat(s, rect(15, 0, 1, 5), 'plume', 3)
        if ex == 'leaves':  # elven fins sweeping back from the temples
            if side:
                cel(s, poly([(13, 7), (5, 2), (4, 4), (10, 9)]), 'plume'); cel(s, poly([(12, 11), (4, 9), (5, 11), (11, 13)]), 'plume')
            else:
                cel(s, poly([(9, 10), (5, 4), (4, 7), (8, 13)]), 'plume'); cel(s, poly([(22, 10), (26, 4), (27, 7), (23, 13)]), 'plume')
                flat(s, line(15, 2, 15, 9), 'plume', 3)
        if ex in ('icespikes', 'spikes', 'icicles'):
            h = {'icespikes': 4, 'spikes': 3, 'icicles': 6}[ex]
            xs = (10, 13, 16, 19, 21) if not side else (10, 13, 16, 19)
            for i, x in enumerate(xs):
                hh = h + (2 if (i == 2 and not side) or (ex == 'icicles' and i % 2) else 0)
                top = 4 if kind != 'tall' else 3
                cel(s, poly([(x - 1, top + 1), (x + 1, top + 1), (x, top - hh)]), 'plume')
        if ex == 'horns':
            if side:
                cel(s, poly([(12, 6), (15, 6), (17, 1), (21, -1), (18, 2), (16, 7)]), 'plume')
            else:
                cel(s, poly([(10, 7), (10, 10), (6, 7), (3, 1), (5, 2), (7, 6)]), 'plume'); cel(s, poly([(21, 7), (21, 10), (25, 7), (28, 1), (26, 2), (24, 6)]), 'plume')
        if ex == 'smallhorns' and not side:
            cel(s, poly([(10, 6), (8, 2), (11, 4)]), 'plume'); cel(s, poly([(21, 6), (23, 2), (20, 4)]), 'plume')
        if ex == 'dragon':  # swept-back horns and a row of spines
            if side:
                cel(s, poly([(13, 6), (6, 0), (4, 1), (11, 8)]), 'plume'); cel(s, poly([(12, 10), (5, 7), (5, 9), (11, 12)]), 'plume')
                for x in (15, 18):
                    flat(s, poly([(x, 4), (x + 2, 4), (x - 1, 0)]), 'plume', 2)
            else:
                cel(s, poly([(10, 6), (6, 2), (4, -1), (5, 3), (9, 9)]), 'plume'); cel(s, poly([(21, 6), (25, 2), (27, -1), (26, 3), (22, 9)]), 'plume')
                flat(s, poly([(15, 4), (17, 4), (16, 0)]), 'plume', 2)
        if ex == 'halo':
            for x, y in ((15, -1), (11, 1), (20, 1), (8, 4), (23, 4)) if not side else ((10, 0), (15, -1), (20, 1), (6, 4)):
                flat(s, rect(x, y + 1, 2, 2), 'plume', 3); s.set(x, y, code('plume', 2))
            if d == 0:
                s.set(15, 8, '#9ae8ff'); s.set(16, 8, '#9ae8ff')
        if ex == 'fur':
            for x in range(8, 24 if not side else 24):
                hh = 2 + (x * 7 % 3 == 0)
                flat(s, {(x, y) for y in range(20, 20 + hh)}, 'plume', 2 if x % 2 else 1)
        if ex == 'fins':
            if side:
                cel(s, poly([(11, 3), (8, -1), (19, 1), (20, 4)]), 'plume'); cel(s, poly([(11, 12), (6, 10), (7, 15), (11, 15)]), 'plume')
            else:
                cel(s, rect(15, -1, 2, 5), 'plume'); cel(s, poly([(9, 11), (5, 8), (5, 14), (9, 15)]), 'plume'); cel(s, poly([(22, 11), (26, 8), (26, 14), (22, 15)]), 'plume')
        if ex == 'flames':
            pts = [(10, 3), (12, -2), (14, 2), (16, -4), (18, 2), (20, -2), (21, 3)] if not side else [(9, 4), (10, -1), (13, 2), (15, -3), (18, 1), (21, -1), (22, 4)]
            cel(s, poly(pts + [(pts[-1][0], 5), (pts[0][0], 5)]), 'plume')
            for x, y in pts[1::2]:
                s.set(x, y + 2, '#ffe080')
    return s


ARM = {  # chest pattern, pauldrons
    'leather': ('straps', None), 'copper': ('scale', 'small'), 'iron': ('mail', 'small'), 'steel': ('plate', 'round'),
    'silver': ('filigree', 'round'), 'gold': ('ornate', 'layered'), 'mythril': ('filigree', 'leaf'), 'frost': ('plate', 'spiked'),
    'obsidian': ('runes', 'spiked'), 'adamant': ('plate', 'huge'), 'dragon': ('scale', 'spiked'), 'star': ('star', 'round'),
    'cobalt': ('plate', 'fur'), 'tide': ('scale', 'shell'), 'rime': ('plate', 'crystal'), 'cinder': ('runes', 'huge'),
}
RUNE = {'obsidian': '#e060ff', 'cinder': '#ffa030'}


def pauldron(s, kind, cx, d, side=False):
    if kind is None:
        return
    flip = -1 if cx < 16 and not side else 1
    if kind == 'small':
        cel(s, ellipse(cx, 23, 3, 2), 'armor')
    elif kind == 'round':
        cel(s, ellipse(cx, 23, 4, 3) - {(x, y) for x in range(32) for y in range(26, 30)}, 'armor'); hline(s, cx - 3, cx + 3, 25, 'trim', 2)
    elif kind == 'layered':
        for k in range(3):
            cel(s, ellipse(cx, 22 + k * 2, 4 - k * .5, 2), 'armor')
            hline(s, cx - 3 + k, cx + 3 - k, 23 + k * 2, 'trim', 2)
    elif kind == 'leaf':
        cel(s, poly([(cx - 4, 25), (cx + 4, 25), (cx + 3 * flip, 18), (cx - 1 * flip, 21)]), 'armor'); flat(s, line(cx, 25, cx + 2 * flip, 20), 'trim', 3)
    elif kind == 'spiked':
        cel(s, ellipse(cx, 23, 4, 3) - {(x, y) for x in range(32) for y in range(26, 30)}, 'armor')
        for k in (-2, 1):
            cel(s, poly([(cx + k, 21), (cx + k + 2, 21), (cx + k + 1 + flip, 16)]), 'trim')
    elif kind == 'huge':
        cel(s, ellipse(cx, 23, 5, 4) - {(x, y) for x in range(32) for y in range(27, 30)}, 'armor')
        hline(s, cx - 4, cx + 4, 24, 'armor', 0); hline(s, cx - 4, cx + 4, 26, 'trim', 2)
        cel(s, poly([(cx - 1, 20), (cx + 1, 20), (cx + 2 * flip, 16)]), 'trim')
    elif kind == 'fur':
        for x in range(cx - 5, cx + 6):
            hh = 4 + (x * 5 % 3)
            flat(s, {(x, y) for y in range(20, 20 + hh)}, 'trim', 2 if x % 2 else 1)
    elif kind == 'shell':
        cel(s, ellipse(cx, 23, 4, 3), 'trim')
        for k in (-2, 0, 2):
            flat(s, line(cx, 26, cx + k, 21), 'trim', 1)
    elif kind == 'crystal':
        cel(s, poly([(cx - 3, 26), (cx + 3, 26), (cx + 2, 19), (cx, 17), (cx - 2, 20)]), 'trim'); flat(s, line(cx, 18, cx, 25), 'trim', 3)


def chest(s, pat, tk, d):
    side = d == 2
    body = poly([(9, 22), (23, 22), (22, 38), (10, 38)]) if not side else poly([(11, 22), (21, 22), (22, 30), (21, 38), (11, 38)]) - rect(14, 24, 4, 13)
    cel(s, body, 'armor')
    x0, x1 = (10, 22) if not side else (11, 21)
    if pat == 'straps' and d == 0:
        cel(s, body, 'armor')
        flat(s, line(10, 23, 21, 36) | line(11, 23, 22, 36), 'trim', 1)
        for x, y in ((12, 27), (19, 27), (12, 32), (19, 32)):
            s.set(x, y, code('trim', 3))
    if pat == 'scale':
        for y in range(24, 37, 2):
            for x in range(x0 + (y // 2) % 2, x1, 2):
                if (x, y) in body:
                    s.set(x, y, code('armor', 1)); s.set(x, y - 1, code('armor', 3)) if (x, y - 1) in body else None
    if pat == 'mail':
        for (x, y) in body:
            if (x + y) % 2 == 0:
                s.set(x, y, code('armor', 1))
        if d != 2:
            cel(s, rect(13, 24, 6, 14), 'trim'); hline(s, 13, 18, 30, 'trim', 3)
    if pat in ('plate', 'filigree', 'ornate', 'star', 'runes') and d == 0:
        flat(s, rect(15, 23, 2, 13), 'armor', 3); flat(s, rect(17, 23, 1, 13), 'armor', 1)
        hline(s, 10, 21, 30, 'armor', 0); hline(s, 10, 21, 31, 'armor', 3)
    if pat == 'filigree' and d == 0:
        flat(s, line(11, 24, 14, 27) | line(20, 24, 17, 27) | line(11, 34, 14, 31) | line(20, 34, 17, 31), 'trim', 3)
    if pat == 'ornate' and d == 0:
        flat(s, rect(10, 22, 12, 2), 'trim', 2); s.fill(rect(15, 26, 2, 2), '#e8243a'); s.set(15, 26, '#ff8a8a')
    if pat == 'star' and d == 0:
        for x, y in ((15, 25), (16, 25), (14, 26), (17, 26), (15, 27), (16, 27), (15, 24), (16, 28)):
            s.set(x, y, code('trim', 3))
    if pat == 'runes':
        for y in (25, 28, 33):
            for x in range(x0 + 1, x1 - 1, 3):
                if (x, y) in body and d != 3:
                    s.set(x, y, RUNE[tk])
    if d != 2:
        hline(s, 10, 21, 37, 'trim', 1); hline(s, 10, 21, 36, 'trim', 2)
    else:
        hline(s, 11, 21, 37, 'trim', 1)


def armor(tk, d):
    pat, pd = ARM[tk]
    s = Canvas(32, 64)
    chest(s, pat, tk, d)
    if d == 2:
        pauldron(s, pd, 16, d, True)
    else:
        pauldron(s, pd, 7, d); pauldron(s, pd, 25, d)
    if d == 0:
        cel(s, rect(13, 20, 6, 3), 'armor'); hline(s, 13, 18, 22, 'armor', 0)  # gorget
    return s


def _all():
    out = {}
    for tk in HELM:
        for d in (0, 2, 3):
            out[f'hb_helm_{tk}_{d}'] = (lambda tk=tk, d=d: helm(tk, d))
            out[f'hb_arm_{tk}_{d}'] = (lambda tk=tk, d=d: armor(tk, d))
    return out


SPRITES = _all()
