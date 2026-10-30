"""Weapons, shields and tools in full colour, one design per tier (gi_<item key>).

Every metal tier has its own look instead of one shape recoloured: a wooden practice
sword, a bronze leaf blade, an iron arming sword, a steel longsword with a fuller, a
silver rapier, a gilded broadsword, a curved elven mythril blade, a jagged ice blade,
a serrated obsidian blade, an adamant greatsword, a dragon blade with spines, a star
blade, a cobalt falchion, a tide cutlass, a rime crystal blade and a burning cinder
blade; daggers, spears, hammers, bows, staffs and shields follow the same themes.
Tools get one look per upgrade level (gi_tool_<kind>_<level>).

Weapons lie on the icon diagonal, handle bottom-left, tip top-right. Parts are drawn
in (u, v) space: u runs along the weapon, v across it (negative v faces the light).
itemIcon (h_pixel.js) uses these icons when the atlas has them, so the hotbar, the
backpack and the weapon in the character's hand all change together.
"""
import math
from px import Canvas, ellipse, poly, rect, line

R2 = math.sqrt(2)
P0 = (4.5, 27.5)

# metal ramps, dark -> light
MET = {
    'wood': ['#3e2614', '#6e4426', '#a0703c', '#c8965c'],
    'copper': ['#5a2410', '#9a4a1c', '#e0803a', '#ffc08a'],
    'iron': ['#33363f', '#636a78', '#a2aab6', '#e0e6ee'],
    'steel': ['#24303e', '#4c5c72', '#8ea2b8', '#d4e0ec'],
    'silver': ['#566070', '#96a4b6', '#d6e0ec', '#ffffff'],
    'gold': ['#6a3e0c', '#b67e1a', '#f6c83a', '#fff0a0'],
    'mythril': ['#0e4e46', '#22907e', '#4cdcc2', '#c4fff0'],
    'frost': ['#24507e', '#4688c0', '#8cd4fc', '#eef9ff'],
    'obsidian': ['#0e0818', '#281a40', '#5a3e94', '#a88ade'],
    'adamant': ['#4c0c22', '#9a2448', '#f2547e', '#ffc4d2'],
    'dragon': ['#3c1008', '#86260e', '#d8522a', '#ffae6a'],
    'star': ['#7a6c30', '#bcae5a', '#f6eea0', '#ffffff'],
    'cobalt': ['#0a2260', '#1a44aa', '#3a78f6', '#a8c8ff'],
    'tide': ['#083e3e', '#128474', '#26dcbc', '#b0fff0'],
    'rime': ['#4e7c9a', '#86b6d2', '#c6f0ff', '#ffffff'],
    'cinder': ['#2e0a04', '#7a2208', '#ee5418', '#ffbc78'],
}
BRASS = ['#5a3a10', '#9a6a20', '#d8a840', '#f6e08a']
GRIP = {'leather': ['#2a160c', '#4a2a18', '#6e4428', '#8e5e3a'], 'cloth': ['#1e1e3a', '#34345e', '#50508a', '#7474b0'],
        'red': ['#3a0a0a', '#6a1616', '#a02a24', '#c84a3e'], 'wood': MET['wood'], 'bone': ['#6a5e4a', '#a8987a', '#d8ccae', '#f6eedc'],
        'dark': ['#0a0a10', '#1e1a26', '#342e40', '#4e4660'], 'teal': ['#08302e', '#145a54', '#228a7e', '#3ab4a4']}
# per tier: guard/trim ramp, grip, gem colour
TRIM = {'wood': (MET['wood'], 'leather', None), 'copper': (BRASS, 'leather', None), 'iron': (MET['iron'], 'leather', None),
        'steel': (MET['steel'], 'cloth', None), 'silver': (MET['silver'], 'cloth', '#4ab0ff'), 'gold': (MET['gold'], 'red', '#e8243a'),
        'mythril': (MET['silver'], 'teal', '#7affc0'), 'frost': (MET['frost'], 'cloth', '#ffffff'), 'obsidian': (MET['adamant'][:2] + MET['obsidian'][2:], 'dark', '#ff4aff'),
        'adamant': (MET['iron'], 'red', '#ff8ab0'), 'dragon': (MET['gold'], 'red', '#ffcc30'), 'star': (MET['gold'], 'cloth', '#9ae8ff'),
        'cobalt': (MET['silver'], 'leather', '#7aa8ff'), 'tide': (BRASS, 'teal', '#7afff0'), 'rime': (MET['rime'], 'cloth', '#c0f8ff'),
        'cinder': (MET['obsidian'][:2] + ['#4a3a3a', '#6a5a5a'], 'dark', '#ffdc60')}
TIERS = ['wood', 'copper', 'iron', 'steel', 'silver', 'gold', 'mythril', 'frost', 'obsidian', 'adamant', 'dragon', 'star', 'cobalt', 'tide', 'rime', 'cinder']


def uv(x, y):
    dx, dy = x + .5 - P0[0], y + .5 - P0[1]
    return (dx - dy) / R2, (dx + dy) / R2


def xy(u, v):
    return (P0[0] + (u + v) / R2, P0[1] + (v - u) / R2)


def draw(s, parts):
    """parts: (kind, ramp, f) with f(u) -> (lo, hi) or None. Later parts cover earlier ones."""
    for y in range(32):
        for x in range(32):
            u, v = uv(x, y)
            for kind, rp, f in reversed(parts):
                b = f(u)
                if not b or not (b[0] <= v <= b[1]):
                    continue
                lo, hi = b; mid = (lo + hi) / 2
                if kind == 'grip':
                    lvl = 1 + (int(u * 1.4) % 2) if hi - lo > .8 else 1
                elif kind == 'blade':
                    lvl = 3 if v - lo < .9 else 0 if hi - v < .9 else 2 if v < mid else 1
                else:
                    lvl = 3 if v - lo < .8 else 1 if v > mid else 2
                s.set(x, y, rp[lvl])
                break


def span(u0, u1, w):
    """A part from u0 to u1; w is a half-width, or a function of t in 0..1 returning (lo, hi) or a half-width."""
    def f(u):
        if not (u0 <= u <= u1):
            return None
        r = w((u - u0) / max(.01, u1 - u0)) if callable(w) else w
        return r if isinstance(r, tuple) else (-r, r)
    return f


def gem(s, u, v, col, big=False):
    x, y = xy(u, v); x, y = int(x), int(y)
    s.set(x, y, col)
    if big:
        s.set(x + 1, y, col); s.set(x, y + 1, col); s.set(x + 1, y + 1, '#2a1a20')
    s.set(x, y - 1 if not big else y, '#ffffff')


def fin(s):
    s.outline()
    return s


# ---------- swords and daggers ----------
SWORD = {  # blade length, base half-width, profile, guard, pommel
    'wood': (21, 1.9, 'round', 'cross', 'knob'), 'copper': (19, 1.6, 'leaf', 'bar', 'knob'),
    'iron': (22, 1.5, 'straight', 'cross', 'disk'), 'steel': (24, 1.5, 'fuller', 'cross', 'ring'),
    'silver': (24, 1.0, 'rapier', 'swept', 'knob'), 'gold': (22, 2.1, 'broad', 'wing', 'gem'),
    'mythril': (23, 1.5, 'curve', 'leaf', 'gem'), 'frost': (23, 1.8, 'jag', 'spike', 'gem'),
    'obsidian': (23, 1.8, 'serrate', 'spike', 'spike'), 'adamant': (25, 2.4, 'great', 'block', 'disk'),
    'dragon': (24, 1.8, 'spine', 'wing', 'gem'), 'star': (23, 1.7, 'star', 'cross', 'gem'),
    'cobalt': (22, 2.0, 'falchion', 'cross', 'disk'), 'tide': (22, 1.6, 'cutlass', 'basket', 'knob'),
    'rime': (23, 1.7, 'crystal', 'spike', 'gem'), 'cinder': (23, 1.9, 'flame', 'block', 'spike'),
}


def blade_fn(prof, w):
    if prof == 'round':
        return lambda t: w * (1 if t < .85 else math.sqrt(max(0, 1 - ((t - .85) / .15) ** 2)) + .2)
    if prof == 'leaf':
        return lambda t: w * (.8 + .6 * math.sin(t * math.pi * .9)) * (1 if t < .8 else (1 - t) / .2)
    if prof in ('straight', 'fuller', 'star', 'great'):
        return lambda t: w * (1 if t < .78 else max(.05, (1 - t) / .22))
    if prof == 'rapier':
        return lambda t: w * (1 - t * .7)
    if prof == 'broad':
        return lambda t: w * (1 + .15 * t) * (1 if t < .82 else max(.05, (1 - t) / .18))
    if prof == 'curve':  # a gentle elven curve: the centre line bends away from the light
        return lambda t: (-w * (1 - t) + 1.6 * t * t - .2, w * (1 - t * .5) + 1.6 * t * t) if t < .92 else (1.2, 1.2 + (1 - t) * 6)
    if prof == 'jag':
        return lambda t: (-(w + (.9 if int(t * 9) % 2 else 0)) * (1 - t * .6), w * (1 - t * .8) + (.6 if int(t * 7) % 2 else 0))
    if prof == 'serrate':
        return lambda t: (-w * (1 - t * .55), w * (1 - t * .7) + (1.0 if int(t * 12) % 2 and t < .85 else 0))
    if prof == 'spine':
        return lambda t: (-w * (1 - t * .6) - (1.4 if int(t * 6) % 2 and t < .8 else 0), w * (1 - t * .9))
    if prof == 'falchion':
        return lambda t: (-w * .8, w * (1 + .6 * t) if t < .85 else w * 1.6 * (1 - t) / .15)
    if prof == 'cutlass':
        return lambda t: (-w * (1 - t * .8) + 1.8 * t * t, w * (1 + .2 * t) + 1.8 * t * t if t < .9 else 1.8 * t * t + .4)
    if prof == 'crystal':
        return lambda t: (-w * (1 - t) * (1.3 if .3 < t < .5 else 1), w * (1 - t) * (1.3 if .55 < t < .75 else 1))
    if prof == 'flame':
        return lambda t: (-w * (1 - t * .6) - .7 * math.sin(t * 14), w * (1 - t * .7) + .7 * math.sin(t * 14 + 1.5))
    return lambda t: w


def guard_fn(kind, hw):
    if kind == 'bar':
        return span(0, 1.3, hw * .7)
    if kind == 'cross':
        return span(0, 1.4, hw)
    if kind == 'swept':
        return lambda u: (-hw, hw * .3) if 0 <= u <= 1.2 else (-1.2, -0.3) if -3 <= u < 0 else None
    if kind == 'wing':
        return lambda u: (-hw - u * .8, hw + u * .8) if 0 <= u <= 1.6 else None
    if kind == 'spike':
        return lambda u: (-hw - 1.4 * (1 - u), hw + 1.4 * (1 - u)) if 0 <= u <= 1 else None
    if kind == 'leaf':
        return lambda u: (-hw * math.sin(u / 2.4 * math.pi), hw * math.sin(u / 2.4 * math.pi)) if 0 <= u <= 2.4 else None
    if kind == 'block':
        return span(0, 2.2, hw * .85)
    if kind == 'basket':
        return lambda u: (-hw, hw) if -2.5 <= u <= 1.2 and (u > 0 or True) else None
    return span(0, 1.2, hw)


def sword_icon(tk, dagger=False):
    L, w, prof, gd, pm = SWORD[tk]
    trim, gk, gemc = TRIM[tk]
    m, grip = MET[tk], GRIP[gk]
    if tk == 'wood':
        m, trim = MET['wood'], GRIP['leather']
    g0 = 6.2 if not dagger else 5
    w *= 1.45
    if dagger:
        L, w = round(L * .55), w * .85
    s = Canvas(32, 32)
    parts = [('metal', trim, span(.2, 2.0, 1.8 if pm != 'spike' else 1.2)), ('grip', grip, span(1.8, g0, 1.1))]
    if gd == 'basket':
        parts.append(('metal', trim, lambda u: (-3.2, -2.0) if 1.5 <= u <= g0 + 1 else None))
    parts.append(('metal', trim, (lambda f: (lambda u: f(u - g0)))(guard_fn(gd, 4.6 if not dagger else 3.3))))
    b0 = g0 + (2.2 if gd == 'block' else 1.4)
    parts.append(('blade', m, span(b0, min(33, b0 + L), blade_fn(prof, w))))
    if pm == 'spike':
        parts.append(('metal', trim, span(-.6, .6, .5)))
    draw(s, parts)
    if prof == 'fuller' or prof == 'great':
        for u in [b0 + k * .7 for k in range(int(L * .6 / .7))]:
            x, y = xy(u, 0); s.set(int(x), int(y), m[1])
    if prof == 'star':
        gem(s, b0 + 2, 0, gemc, True)
    if prof == 'flame':
        for k in range(5):
            x, y = xy(b0 + 3 + k * 3.5, -w - 1.2 + (k % 2)); s.set(int(x), int(y), '#ffdc60')
    if prof == 'jag' or prof == 'crystal':
        for k in range(3):
            x, y = xy(b0 + 4 + k * 5, -.4); s.set(int(x), int(y), '#ffffff')
    if gemc and pm == 'gem':
        gem(s, 1.2, 0, gemc)
    if gemc and gd in ('wing', 'cross', 'leaf', 'spike', 'block') and tk not in ('iron', 'steel', 'cobalt'):
        gem(s, g0 + .8, 0, gemc)
    if tk == 'cinder':
        for k in range(0, int(L), 3):
            x, y = xy(b0 + k, .3); s.set(int(x), int(y), '#ffb040')
    return fin(s)


def aldren_icon():  # Aldren's Blade: a pale knightly sword with a blue gem and a crowned guard
    s = Canvas(32, 32)
    m, trim = ['#3a4458', '#8090a8', '#dfe8f4', '#ffffff'], MET['gold']
    draw(s, [('metal', trim, span(.4, 2.0, 1.4)), ('grip', GRIP['cloth'], span(1.8, 6.2, .9)),
             ('metal', trim, lambda u: (-4 - (u - 6.2) * .6, 4 + (u - 6.2) * .6) if 6.2 <= u <= 7.8 else None),
             ('blade', m, span(7.6, 32, blade_fn('fuller', 1.7)))])
    for u in range(9, 26):
        x, y = xy(u, 0); s.set(int(x), int(y), '#7ab8ff')
    gem(s, 7, 0, '#4a90ff', True); gem(s, 1.2, 0, '#4a90ff')
    return fin(s)


# ---------- spears ----------
SPEAR = {'wood': 'fire', 'copper': 'leaf', 'iron': 'leaf', 'steel': 'winged', 'silver': 'long', 'gold': 'glaive', 'mythril': 'leafx',
         'frost': 'icicle', 'obsidian': 'barbed', 'adamant': 'halberd', 'dragon': 'fang', 'star': 'starhead', 'cobalt': 'winged',
         'tide': 'trident', 'rime': 'icicle', 'cinder': 'flame'}


def spear_icon(tk):
    st = SPEAR[tk]; m = MET[tk] if tk != 'wood' else MET['wood']; trim, gk, gemc = TRIM[tk]
    shaft = MET['wood'] if tk in ('wood', 'copper', 'iron', 'steel', 'cobalt') else GRIP['dark'] if tk in ('obsidian', 'cinder') else trim
    s = Canvas(32, 32)
    parts = [('grip', shaft, span(0, 25, .8)), ('grip', GRIP[gk], span(9, 13, 1.0))]
    if st == 'fire':  # a fire-hardened point
        parts.append(('blade', MET['wood'], span(24, 33, lambda t: 1.1 * (1 - t) + .1)))
    elif st in ('leaf', 'leafx'):
        parts.append(('blade', m, span(24, 33.5, lambda t: 2.2 * math.sin(min(1, t * 1.15) * math.pi) + .1)))
    elif st == 'winged':
        parts += [('metal', trim, span(23, 24.5, 3)), ('blade', m, span(24, 34, lambda t: 1.6 * (1 - t) + .2))]
    elif st == 'long':
        parts.append(('blade', m, span(23, 34, lambda t: 1.2 * (1 - t) + .15)))
    elif st == 'glaive':
        parts.append(('blade', m, span(22, 33, lambda t: (-1.0, 1.2 + 3.2 * math.sin(t * math.pi * .8)))))
    elif st == 'icicle':
        parts.append(('blade', m, span(22, 34, lambda t: ((-1.6 - (.8 if int(t * 6) % 2 else 0)) * (1 - t), (1.6 + (.8 if int(t * 5) % 2 else 0)) * (1 - t)))))
    elif st == 'barbed':
        parts.append(('blade', m, span(23, 34, lambda t: 2.2 * (1 - t) + (1.2 if int(t * 5) % 2 else 0) * (1 - t))))
    elif st == 'halberd':
        parts += [('blade', m, span(22, 27, lambda t: (-4.5 + t * 2, 1))), ('blade', m, span(24, 34, lambda t: 1.1 * (1 - t) + .2))]
    elif st == 'fang':
        parts.append(('blade', MET['dragon'], span(22, 34, lambda t: (-2.0 * (1 - t), 2.0 * (1 - t) + 1.5 * t * (1 - t) * 4))))
    elif st == 'starhead':
        parts.append(('blade', m, span(24, 34, lambda t: 1.4 * (1 - t) + .2)))
    elif st == 'trident':
        parts += [('metal', trim, span(23, 24.5, 3.6)), ('blade', m, span(24, 33, .7)),
                  ('blade', m, lambda u: (-3.6, -2.4) if 24 <= u <= 31 else None), ('blade', m, lambda u: (2.4, 3.6) if 24 <= u <= 31 else None)]
    elif st == 'flame':
        parts.append(('blade', m, span(22, 34, lambda t: (-1.8 * (1 - t) - .8 * math.sin(t * 12), 1.8 * (1 - t) + .8 * math.sin(t * 12 + 1.4)))))
    draw(s, parts)
    if st == 'leafx':
        for u in range(25, 32):
            x, y = xy(u, 0); s.set(int(x), int(y), m[1])
    if st == 'starhead' or (gemc and st in ('winged', 'glaive', 'halberd', 'fang', 'trident')):
        gem(s, 24, 0, gemc or '#ffffff', st == 'starhead')
    if tk == 'cinder':
        for u in (26, 29, 32):
            x, y = xy(u, -1.4); s.set(int(x), int(y), '#ffdc60')
    if st == 'fire':
        x, y = xy(31, 0); s.set(int(x), int(y), '#2a1a10')
    return fin(s)


# ---------- hammers ----------
HAMMER = {'copper': 'maul', 'iron': 'warhammer', 'steel': 'flanged', 'silver': 'round', 'gold': 'ornate', 'mythril': 'leafmace',
          'frost': 'iceblock', 'obsidian': 'spiked', 'adamant': 'great', 'dragon': 'dragonmaul', 'star': 'morning', 'cobalt': 'warhammer',
          'tide': 'anchor', 'rime': 'crystal', 'cinder': 'brazier'}


def hammer_icon(tk):
    st = HAMMER[tk]; m = MET[tk]; trim, gk, gemc = TRIM[tk]
    s = Canvas(32, 32)
    shaft = MET['wood'] if tk in ('copper', 'iron', 'cobalt', 'steel') else trim
    parts = [('grip', shaft, span(0, 25, .85)), ('grip', GRIP[gk], span(1, 7, 1.0))]
    if st in ('maul', 'warhammer', 'great', 'ornate', 'anchor', 'dragonmaul'):
        hw = {'maul': 5, 'warhammer': 4.4, 'great': 6.5, 'ornate': 5.2, 'anchor': 6, 'dragonmaul': 6}[st]
        uw = {'maul': 4.5, 'warhammer': 3.6, 'great': 5.6, 'ornate': 4.6, 'anchor': 2.4, 'dragonmaul': 5}[st]
        if st == 'warhammer':  # a hammer face on one side, a spike on the other
            parts += [('metal', m, span(22, 22 + uw, (-hw, 1))), ('blade', m, lambda u: (1, 1 + 4.5 * (1 - abs(u - 23.8) / 1.8)) if 22 <= u <= 25.6 else None)]
        elif st == 'anchor':
            parts += [('metal', m, span(20, 30, 1.0)), ('blade', m, lambda u: (-hw + (u - 20) * .8, hw - (u - 20) * .8) if 20 <= u <= 22.5 else None), ('metal', trim, span(29, 31, 2))]
        else:
            parts.append(('metal', m, span(21.5, 21.5 + uw, hw)))
            if st == 'ornate':
                parts.append(('metal', trim, span(23, 24.4, hw + .6)))
            if st == 'dragonmaul':
                parts.append(('blade', m, lambda u: (-hw - 2.4 * (1 - (u - 22) / 3), -hw) if 22 <= u <= 25 else None))
    elif st in ('flanged', 'round', 'leafmace', 'spiked', 'morning', 'crystal', 'iceblock', 'brazier'):
        r = {'flanged': 3.6, 'round': 3.4, 'leafmace': 3.8, 'spiked': 3.6, 'morning': 3.4, 'crystal': 3.8, 'iceblock': 4.2, 'brazier': 3.8}[st]
        parts.append(('metal', m, lambda u, r=r: (-math.sqrt(max(0, r * r - (u - 26) ** 2)), math.sqrt(max(0, r * r - (u - 26) ** 2))) if abs(u - 26) <= r else None))
    draw(s, parts)
    cx, cy = xy(26, 0)
    if st == 'flanged':
        for a in range(0, 360, 60):
            s.fill(line(int(cx), int(cy), int(cx + math.cos(math.radians(a)) * 5), int(cy + math.sin(math.radians(a)) * 5)), m[1])
    if st in ('spiked', 'morning'):
        for a in range(0, 360, 45):
            x, y = cx + math.cos(math.radians(a)) * 5.4, cy + math.sin(math.radians(a)) * 5.4
            s.set(int(x), int(y), m[3] if st == 'morning' else m[2])
    if st == 'leafmace':
        for a in range(20, 360, 72):
            s.fill(line(int(cx), int(cy), int(cx + math.cos(math.radians(a)) * 5), int(cy + math.sin(math.radians(a)) * 5)), MET['mythril'][3])
    if st == 'crystal':
        for k in range(4):
            s.set(int(cx) - 2 + k, int(cy) - 5 + (k % 2), '#ffffff')
    if st == 'brazier':
        for k in range(5):
            s.set(int(cx) - 2 + k, int(cy) - 1 - (k % 2), '#ffdc60'); s.set(int(cx) - 1 + k % 3, int(cy) + 1, '#ff8a2a')
    if gemc and st in ('ornate', 'great', 'morning', 'dragonmaul', 'crystal', 'round'):
        gem(s, 26, 0, gemc, st in ('ornate', 'morning'))
    return fin(s)


# ---------- bows ----------
BOW = {'wood': ('self', 'wood'), 'copper': ('self', 'tipped'), 'iron': ('recurve', 'tipped'), 'steel': ('recurve', 'wrapped'),
       'silver': ('long', 'tipped'), 'gold': ('recurve', 'ornate'), 'mythril': ('elven', 'leaf'), 'frost': ('recurve', 'ice'),
       'obsidian': ('horn', 'spike'), 'adamant': ('compound', 'ornate'), 'dragon': ('horn', 'bone'), 'star': ('elven', 'star'),
       'cobalt': ('recurve', 'wrapped'), 'tide': ('recurve', 'shell'), 'rime': ('long', 'ice'), 'cinder': ('horn', 'flame')}


def bow_icon(tk):
    shape, deco = BOW[tk]; trim, gk, gemc = TRIM[tk]
    limb = MET['wood'] if tk in ('wood', 'copper', 'iron', 'steel', 'cobalt', 'silver') else MET[tk]
    s = Canvas(32, 32)
    pts = []
    for k in range(61):  # the limb's centre line, string side on the left
        t = k / 60; y = 3 + t * 26; c = (t - .5) * 2
        if shape == 'self':
            x = 17 + 7 * (1 - c * c)
        elif shape == 'long':
            x = 18 + 6 * (1 - c * c)
        elif shape in ('recurve', 'elven'):
            x = 17 + 7.5 * (1 - c * c) - (4 * (abs(c) - .78) / .22 if abs(c) > .78 else 0) * (1.3 if shape == 'elven' else 1)
        elif shape == 'horn':
            x = 17 + 8 * math.cos(c * 1.4) * (1 - abs(c) * .2) - (3 if abs(c) > .85 else 0)
        else:  # compound: straight-ish limbs with wheels at the tips
            x = 18 + 6 * (1 - abs(c))
        th = 1.6 * (1 - abs(c) * .55) + (.6 if abs(c) < .14 else 0)
        pts.append((x, y, th, c))
    for x, y, th, c in pts:
        for dx in range(-2, 3):
            if abs(dx) <= th:
                lvl = 3 if dx < -th + 1 else 1 if dx > 0 else 2
                s.set(int(x + dx), int(y), limb[lvl])
    top, bot = pts[0], pts[-1]
    s.fill(line(int(top[0]), int(top[1]), int(bot[0]), int(bot[1])), '#efe6d2')
    mid = pts[30]
    s.fill(rect(int(mid[0]) - 1, int(mid[1]) - 2, 3, 5), GRIP[gk][2]); s.fill(rect(int(mid[0]) - 1, int(mid[1]) - 2, 1, 5), GRIP[gk][3])
    for p in (pts[2], pts[-3]):
        x, y = int(p[0]), int(p[1])
        if deco == 'tipped':
            s.fill(rect(x - 1, y - 1, 2, 2), trim[2])
        elif deco == 'ornate':
            s.fill(rect(x - 1, y - 1, 3, 2), MET['gold'][2]); s.set(x, y, gemc or '#e8243a')
        elif deco == 'leaf':
            s.fill(poly([(x, y - 2), (x + 3, y), (x, y + 2)]), MET['mythril'][3])
        elif deco == 'ice':
            s.fill(line(x, y, x + 3, y - 2 if p is pts[2] else y + 2), '#eef9ff')
        elif deco in ('spike', 'bone'):
            s.fill(line(x, y, x + 3, y - 3 if p is pts[2] else y + 3), '#e8dcc0' if deco == 'bone' else MET['obsidian'][3])
        elif deco == 'star':
            s.set(x + 1, y, '#ffffff'); s.set(x, y - 1, MET['star'][2]); s.set(x, y + 1, MET['star'][2])
        elif deco == 'shell':
            s.fill(ellipse(x + 1, y, 1, 1), '#f0d8c0')
        elif deco == 'flame':
            s.fill(line(x, y, x + 2, y - 2 if p is pts[2] else y + 2), '#ffb040'); s.set(x + 1, y, '#ffdc60')
        elif deco == 'wrapped':
            s.fill(rect(x - 1, y, 3, 1), GRIP['cloth'][2])
    if shape == 'compound':
        for p in (pts[0], pts[-1]):
            s.fill(ellipse(int(p[0]), int(p[1]), 1, 1), MET['iron'][2])
    if gemc and deco in ('ornate', 'star', 'leaf'):
        s.set(int(mid[0]) + 2, int(mid[1]), gemc)
    return fin(s)


# ---------- staffs ----------
STAFF = {'wood': 'knot', 'copper': 'claw', 'iron': 'ring', 'steel': 'claw', 'silver': 'crescent', 'gold': 'sun', 'mythril': 'leafy',
         'frost': 'shard', 'obsidian': 'skull', 'adamant': 'cage', 'dragon': 'dragon', 'star': 'star', 'cobalt': 'ring',
         'tide': 'shell', 'rime': 'shard', 'cinder': 'flame'}
ORB = {'wood': '#7ac84a', 'copper': '#ff9a4a', 'iron': '#9ad0ff', 'steel': '#6ab0ff', 'silver': '#e8f0ff', 'gold': '#ff4a3a',
       'mythril': '#7affc0', 'frost': '#c8f4ff', 'obsidian': '#d84aff', 'adamant': '#ff6a9a', 'dragon': '#ffb030', 'star': '#fff6a8',
       'cobalt': '#4a8aff', 'tide': '#3affe0', 'rime': '#e8ffff', 'cinder': '#ff6a1a'}


def staff_icon(tk):
    st = STAFF[tk]; trim, gk, _ = TRIM[tk]; m = MET[tk]
    shaft = MET['wood'] if tk in ('wood', 'copper', 'mythril', 'iron') else GRIP['dark'] if tk in ('obsidian', 'cinder') else trim
    s = Canvas(32, 32)
    draw(s, [('grip', shaft, span(-1, 26, .8)), ('grip', GRIP[gk], span(8, 12, 1.0)), ('metal', trim, span(-1.2, .4, 1.2))])
    cx, cy = xy(28.5, 0); cx, cy = int(cx), int(cy); orb = ORB[tk]
    ramp = [orb, orb, orb, '#ffffff']

    def orbit(r=2):
        s.shade(ellipse(cx, cy, r, r), None, 'sphere', colors=['#1a1420', orb, orb, '#ffffff'] if False else [m[0], orb, orb, '#ffffff'])
        s.set(cx - 1, cy - 1, '#ffffff')
    if st == 'knot':
        s.fill(ellipse(cx, cy, 3, 3), MET['wood'][2]); s.fill(ellipse(cx + 1, cy + 1, 2, 2), MET['wood'][1]); s.fill(rect(cx + 2, cy - 4, 2, 2), '#4a8a3a'); s.set(cx - 1, cy - 1, orb)
    elif st == 'claw':
        for a in (-60, 30, 120):
            s.fill(line(cx, cy + 3, cx + int(math.cos(math.radians(a)) * 4), cy + int(math.sin(math.radians(a)) * 4) - 1), m[2])
        orbit(2)
    elif st == 'ring':
        s.fill(ellipse(cx, cy, 4, 4) - ellipse(cx, cy, 2, 2), m[2]); s.fill(ellipse(cx, cy, 4, 4) - ellipse(cx, cy, 3, 3) - ellipse(cx - 1, cy - 1, 3, 3), m[0]); s.set(cx, cy, orb)
    elif st == 'crescent':
        s.fill(ellipse(cx, cy, 4, 4) - ellipse(cx + 2, cy - 2, 4, 4), m[2]); s.set(cx + 1, cy - 1, orb); s.set(cx + 2, cy - 2, '#ffffff')
    elif st == 'sun':
        for a in range(0, 360, 45):
            s.fill(line(cx, cy, cx + int(math.cos(math.radians(a)) * 5), cy + int(math.sin(math.radians(a)) * 5)), m[2])
        orbit(2)
    elif st == 'leafy':
        for a in (-80, -20, 200):
            x2, y2 = cx + math.cos(math.radians(a)) * 4, cy + math.sin(math.radians(a)) * 4
            s.fill(poly([(cx, cy), (int(x2) - 1, int(y2)), (int(x2), int(y2) - 1)]) | line(cx, cy, int(x2), int(y2)), MET['mythril'][2])
        orbit(1)
    elif st == 'shard':
        s.shade(poly([(cx, cy - 6), (cx + 3, cy), (cx, cy + 4), (cx - 3, cy)]), None, 'form', colors=[m[0], m[1], m[2], m[3]]); s.set(cx - 1, cy - 2, '#ffffff')
    elif st == 'skull':
        s.fill(ellipse(cx, cy, 3, 3) | rect(cx - 2, cy + 2, 5, 2), '#e8dcc0'); s.set(cx - 1, cy, orb); s.set(cx + 1, cy, orb); s.fill(rect(cx - 1, cy + 3, 3, 1), '#6a5e4a')
    elif st == 'cage':
        orbit(2); s.fill((ellipse(cx, cy, 4, 4) - ellipse(cx, cy, 3, 3)) & {(x, y) for x in range(32) for y in range(32) if (x + y) % 2 == 0}, m[2])
    elif st == 'dragon':
        s.fill(poly([(cx - 3, cy + 3), (cx + 4, cy - 3), (cx + 2, cy + 2)]), m[2]); s.fill(line(cx, cy - 1, cx - 2, cy - 5), '#e8dcc0'); s.set(cx + 1, cy - 1, orb)
    elif st == 'star':
        s.fill(poly([(cx, cy - 5), (cx + 1, cy - 1), (cx + 5, cy), (cx + 1, cy + 1), (cx, cy + 5), (cx - 1, cy + 1), (cx - 5, cy), (cx - 1, cy - 1)]), MET['star'][2]); s.set(cx, cy, '#ffffff')
    elif st == 'shell':
        s.fill(ellipse(cx, cy, 4, 3), '#f0d8c0'); [s.fill(line(cx, cy + 3, cx - 3 + k * 2, cy - 2), '#c8a890') for k in range(4)]; s.set(cx, cy, orb)
    elif st == 'flame':
        s.fill(poly([(cx - 3, cy + 3), (cx - 2, cy - 2), (cx, cy), (cx + 1, cy - 6), (cx + 3, cy - 1), (cx + 3, cy + 3)]), '#ff6a1a'); s.fill(poly([(cx - 1, cy + 3), (cx, cy - 1), (cx + 2, cy + 3)]), '#ffdc60')
    return fin(s)


# ---------- shields ----------
SHIELD = {'leather': 'round', 'copper': 'round', 'iron': 'heater', 'steel': 'kite', 'silver': 'heater', 'gold': 'ornate', 'mythril': 'leaf',
          'frost': 'spiky', 'obsidian': 'spiky', 'adamant': 'tower', 'dragon': 'dragon', 'star': 'sun', 'cobalt': 'heater', 'tide': 'shell',
          'rime': 'kite', 'cinder': 'tower'}
EMBLEM = {'iron': 'cross', 'steel': 'bar', 'silver': 'chevron', 'gold': 'lion', 'cobalt': 'peak', 'rime': 'flake', 'cinder': 'ember', 'adamant': 'bar'}


def shield_icon(tk):
    st = SHIELD[tk]; m = MET.get(tk, MET['wood']); trim, _, gemc = TRIM.get(tk, (BRASS, 0, None))
    s = Canvas(32, 32)
    if tk == 'leather':
        m, trim = MET['wood'], ['#2a160c', '#4a2a18', '#6e4428', '#8e5e3a']
    shapes = {
        'round': ellipse(16, 16, 12, 12), 'heater': poly([(5, 4), (27, 4), (27, 15), (16, 29), (5, 15)]),
        'kite': poly([(16, 2), (26, 7), (24, 18), (16, 30), (8, 18), (6, 7)]), 'ornate': poly([(4, 5), (10, 3), (16, 5), (22, 3), (28, 5), (27, 16), (16, 30), (5, 16)]),
        'leaf': poly([(16, 2), (25, 9), (25, 19), (16, 30), (7, 19), (7, 9)]), 'spiky': poly([(4, 3), (16, 6), (28, 3), (26, 16), (16, 29), (6, 16)]),
        'tower': rect(6, 3, 20, 26) - {(6, 3), (25, 3)}, 'dragon': poly([(5, 5), (16, 2), (27, 5), (27, 17), (16, 30), (5, 17)]),
        'sun': ellipse(16, 16, 12, 12), 'shell': poly([(16, 3), (27, 12), (25, 24), (16, 29), (7, 24), (5, 12)]),
    }
    body = shapes[st]
    inner = {(x, y) for (x, y) in body if all((x + dx, y + dy) in body for dx in (-2, 2) for dy in (-2, 2))}
    s.shade(body, None, 'form', colors=trim)
    face = m if tk != 'leather' else ['#3a2414', '#6a4426', '#9a6a3a', '#b88a52']
    s.shade(inner, None, 'form', colors=face)
    if tk == 'leather':
        for y in range(6, 28, 4):
            s.fill({(x, y) for x in range(5, 28) if (x, y) in inner}, '#4a2e1a')
    if tk == 'copper' or st == 'round':
        s.shade(ellipse(16, 16, 3, 3), None, 'sphere', colors=BRASS)
    em = EMBLEM.get(tk); c = gemc or trim[3]
    if em == 'cross':
        s.fill(rect(15, 7, 2, 18) | rect(9, 12, 14, 2), MET['iron'][0])
    elif em == 'bar':
        s.fill(rect(15, 5, 3, 22), trim[2]); s.fill(rect(15, 5, 1, 22), trim[3])
    elif em == 'chevron':
        s.fill(line(8, 10, 16, 18) | line(24, 10, 16, 18) | line(8, 11, 16, 19) | line(24, 11, 16, 19), '#4a7ac8')
    elif em == 'lion':
        s.fill(ellipse(16, 14, 4, 4), '#e8243a'); s.fill(rect(14, 17, 5, 5), '#e8243a'); s.set(15, 13, '#2a1010'); s.set(17, 13, '#2a1010')
    elif em == 'peak':
        s.fill(poly([(9, 21), (16, 9), (23, 21)]), '#eef4ff'); s.fill(poly([(12, 21), (16, 14), (20, 21)]), MET['cobalt'][1])
    elif em == 'flake':
        for a in range(0, 180, 60):
            s.fill(line(16 - int(math.cos(math.radians(a)) * 7), 15 - int(math.sin(math.radians(a)) * 7), 16 + int(math.cos(math.radians(a)) * 7), 15 + int(math.sin(math.radians(a)) * 7)), '#ffffff')
    elif em == 'ember':
        s.fill(poly([(12, 22), (13, 13), (16, 16), (17, 8), (20, 15), (21, 22)]), '#ff6a1a'); s.fill(poly([(14, 22), (16, 16), (19, 22)]), '#ffdc60')
    if st == 'leaf':
        s.fill(line(16, 5, 16, 27), MET['mythril'][0]); [s.fill(line(16, 9 + k * 5, 10 + k, 6 + k * 5) | line(16, 9 + k * 5, 22 - k, 6 + k * 5), MET['mythril'][1]) for k in range(4)]
    if st == 'spiky':
        for x, y in ((4, 3), (28, 3), (16, 6)):
            s.fill(line(x, y, x + (-2 if x < 16 else 2 if x > 16 else 0), y - 3), trim[3])
        s.set(16, 15, gemc or '#ffffff'); s.fill(ellipse(16, 15, 2, 2) - {(16, 15)}, trim[1])
    if st == 'dragon':
        s.fill(poly([(10, 10), (16, 7), (22, 10), (20, 20), (16, 24), (12, 20)]), MET['dragon'][2]); s.set(14, 13, '#ffcc30'); s.set(18, 13, '#ffcc30')
        s.fill(line(10, 10, 7, 5) | line(22, 10, 25, 5), '#e8dcc0')
    if st == 'sun':
        for a in range(0, 360, 30):
            s.fill(line(16, 16, 16 + int(math.cos(math.radians(a)) * 9), 16 + int(math.sin(math.radians(a)) * 9)), MET['gold'][2])
        s.shade(ellipse(16, 16, 4, 4), None, 'sphere', colors=['#c8a040', '#fff6a8', '#fff6a8', '#ffffff'])
    if st == 'shell':
        for k in range(-3, 4):
            s.fill(line(16, 27, 16 + k * 3, 6), face[1])
    if st == 'ornate':
        s.set(16, 7, '#e8243a'); s.fill(rect(15, 6, 3, 3) - {(16, 7)}, MET['gold'][3])
    if st == 'tower' and tk == 'adamant':
        for y in (8, 22):
            for x in (9, 23):
                s.set(x, y, trim[3])
    return fin(s)


# ---------- tools, one look per upgrade level ----------
TOOLT = {1: 'iron', 2: 'copper', 3: 'steel', 4: 'gold', 5: 'mythril'}


def tool_icon(kind, lvl):
    tk = TOOLT[lvl]; m = MET[tk]
    if lvl == 1:
        m = ['#3e3a36', '#6a6560', '#9a948c', '#c8c2b8']  # plain worn iron
    trim = MET['gold'] if lvl >= 4 else BRASS if lvl >= 2 else MET['wood']
    haft = MET['wood'] if lvl < 4 else ['#2a1a10', '#5a3a20', '#8a5a30', '#b07a48'] if lvl == 4 else ['#14302a', '#24524a', '#3a8070', '#5ab09c']
    s = Canvas(32, 32)
    if kind == 'can':
        body = rect(6, 12, 15, 15)
        s.shade(body, None, 'form', colors=m)
        s.fill(line(21, 16, 28, 9) | line(21, 17, 28, 10), m[1]); s.fill(rect(27, 7, 3 + (lvl >= 3), 3), m[2])
        s.fill(line(8, 12, 13, 6) | line(13, 6, 18, 12), trim[1])
        for y in range(14, 26, 4 if lvl < 3 else 3):
            s.fill({(x, y) for x in range(7, 20)}, m[1])
        if lvl >= 4:
            s.fill(rect(6, 12, 15, 2), trim[2]); s.set(13, 19, '#e8243a' if lvl == 4 else '#7affc0')
        return fin(s)
    if kind == 'rod':
        s.fill(line(4, 29, 27, 4), haft[2]); s.fill(line(5, 29, 28, 4), haft[1])
        for k in range(1, 4 + lvl):
            s.set(4 + k * 23 // (4 + lvl), 29 - k * 25 // (4 + lvl), trim[2])
        s.fill(line(27, 4, 27, 20), '#e8e8e8'); s.fill(ellipse(27, 21, 2, 2), ['#e8342a', '#e8342a', '#ff8a2a', '#ffd040', '#4fe0c8', '#d84aff'][lvl])
        s.shade(ellipse(9, 24, 3, 3), None, 'sphere', colors=m)
        return fin(s)
    parts = [('grip', haft, span(-1, 24 if kind != 'scythe' else 27, .85)), ('grip', GRIP['leather'] if lvl < 4 else GRIP['red'] if lvl == 4 else GRIP['teal'], span(0, 5, 1.0))]
    if kind == 'axe':
        parts.append(('metal', trim, span(19, 24, 1.4)))
    elif kind == 'pick':
        parts.append(('metal', trim, span(20, 24, 1.5)))
    elif kind == 'hoe':
        parts += [('blade', m, lambda u: (-6 - lvl * .3, -.5) if 21.5 <= u <= 24.5 else None), ('metal', trim, span(21, 25, 1.0))]
    elif kind == 'scythe':
        parts += [('blade', m, lambda u: (-2 - (u - 21) * .2, 3 + (u - 21) * 1.5 - (u - 21) ** 2 * .1) if 21 <= u <= 27 else None),
                  ('grip', haft, span(12, 13.5, 2.6))]
    draw(s, parts)
    if kind == 'pick':  # a curved two-pointed head across the haft, points drooping toward the hand
        L = 9 + lvl * .6
        top = [xy(22.6 - (v / L) ** 2 * 4.5 + 1.2 * (1 - abs(v) / L), v) for v in [L * (k / 10 - 1) for k in range(21)]]
        bot = [xy(22.6 - (v / L) ** 2 * 4.5 - .9 * (1 - abs(v) / L), v) for v in [L * (1 - k / 10) for k in range(21)]]
        s.shade(poly([(round(x), round(y)) for x, y in top + bot]), None, 'form', colors=m)
        x, y = xy(22.6, 0); s.fill(rect(int(x) - 1, int(y) - 1, 3, 3), trim[2])
    if kind == 'axe':  # a bearded blade with a curved edge (and a back spike from steel up)
        w = 6 + lvl * .6
        pts = [xy(19.5, 1), xy(17.5 - lvl * .3, -w), xy(20.5, -w - 1.2), xy(23.5, -w - .4), xy(25.5 + lvl * .2, -w + 1), xy(24.5, 1)]
        s.shade(poly([(round(x), round(y)) for x, y in pts]), None, 'form', colors=m)
        edge = [xy(17.8 - lvl * .3 + k * (7.6 + lvl * .5) / 8, -w - 1 + math.sin(k / 8 * math.pi) * -.6) for k in range(9)]
        for x, y in edge:
            s.set(round(x), round(y), m[3])
        if lvl >= 3:
            s.shade(poly([(round(x), round(y)) for x, y in (xy(20.5, 1), xy(22, 4.5), xy(23.5, 1))]), None, 'form', colors=m)
        x, y = xy(21.5, 0); s.fill(rect(int(x) - 1, int(y) - 1, 2, 2), trim[2])
    if kind == 'scythe':  # the long blade sweeps down from the top of the snath
        s.shade(poly([(23, 4), (14, 2), (6, 4), (1, 10), (8, 7), (15, 6), (23, 7)]), None, 'form', colors=m); s.fill(line(22, 4, 13, 3) | line(13, 3, 5, 6), m[3])
    if lvl == 5:
        x, y = xy(10, 0); s.set(int(x), int(y), '#7affc0')
    return fin(s)


def _all():
    out = {}
    names = {'wood': 'wood', 'copper': 'copper', 'iron': 'iron', 'steel': 'steel', 'silver': 'silver', 'gold': 'gold', 'mythril': 'mythril', 'frost': 'frost',
             'obsidian': 'obsidian', 'adamant': 'adamant', 'dragon': 'dragon', 'star': 'star', 'cobalt': 'cobalt', 'tide': 'tide', 'rime': 'rime', 'cinder': 'cinder'}
    for tk in TIERS:
        out[f'gi_{tk}_sword'] = (lambda tk=tk: sword_icon(tk))
        out[f'gi_{tk}_spear'] = (lambda tk=tk: spear_icon(tk))
        out[f'gi_{tk}_bow'] = (lambda tk=tk: bow_icon(tk))
        out[f'gi_{tk}_staff'] = (lambda tk=tk: staff_icon(tk))
        if tk != 'wood':
            out[f'gi_{tk}_dagger'] = (lambda tk=tk: sword_icon(tk, True))
            out[f'gi_{tk}_hammer'] = (lambda tk=tk: hammer_icon(tk))
            out[f'gi_{tk}_shield'] = (lambda tk=tk: shield_icon(tk))
    out['gi_leather_shield'] = lambda: shield_icon('leather')
    out['gi_aldren_blade'] = aldren_icon
    for kind in ('axe', 'pick', 'hoe', 'scythe', 'can', 'rod'):
        for lvl in range(1, 6):
            out[f'gi_tool_{kind}_{lvl}'] = (lambda kind=kind, lvl=lvl: tool_icon(kind, lvl))
    return out


SPRITES = _all()
