"""Pets (a dog and a cat) and small resource nodes (clay mounds, salt crusts).

Pets are 32x32 art px (one tile), side view facing right (the game mirrors them for left):
pet_<kind>_<frame> with frames 0-1 walking, 2 sitting. Nodes are 32x32 like the small rocks.
Light from the top-left, selective outlines.
"""
from px import Canvas, rect, ellipse, poly, line

DOG = ['#3a2414', '#6a4224', '#9a6434', '#c08a4a', '#e0b070']
CAT = ['#5a2a10', '#9a4a1a', '#d0702a', '#ec9a48', '#f8c27a']


def _shadow(s, cx, cy, rx, ry):
    for x, y in ellipse(cx, cy, rx, ry):
        if not s.get(x, y)[3] and (x + y) % 2 == 0 or ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 < .5:
            if not s.get(x, y)[3]:
                s.px[x, y] = (24, 30, 14, 90)


def dog(frame):
    s = Canvas(32, 32)
    C = DOG
    _shadow(s, 16, 29, 10, 2)
    if frame == 2:  # sitting: haunches down, front legs straight, head up
        s.shade(ellipse(13, 22, 7, 6), None, 'form', colors=C[1:])
        s.shade(rect(18, 18, 3, 10), None, 'cyl', colors=C[:4]); s.shade(rect(14, 24, 3, 4), None, 'cyl', colors=C[:4])
        s.shade(ellipse(21, 13, 5, 4), None, 'form', colors=C[1:]); s.shade(ellipse(25, 15, 3, 2), None, 'form', colors=C[2:])
        s.fill(poly([(17, 10), (19, 8), (20, 14)]), C[0]); s.set(23, 12, '#1a1010'); s.set(28, 14, '#1a1010')
        s.fill(line(6, 22, 3, 17) | line(6, 21, 4, 16), C[2])  # tail up
    else:
        lift = 1 if frame else 0
        s.shade(ellipse(15, 20, 9, 5), None, 'form', colors=C[1:])  # body
        for x, up in ((8, lift), (11, 1 - lift), (19, 1 - lift), (22, lift)):  # legs
            s.shade(rect(x, 23 - up, 2, 6), None, 'cyl', colors=C[:4])
        s.shade(ellipse(24, 14, 5, 4), None, 'form', colors=C[1:])  # head
        s.shade(ellipse(28, 16, 3, 2), None, 'form', colors=C[2:])  # muzzle
        s.fill(poly([(20, 11), (22, 9), (23, 16)]), C[0])  # floppy ear
        s.set(26, 13, '#1a1010'); s.set(30, 16, '#1a1010')
        s.fill(line(6, 19, 2, 15 + lift) | line(6, 18, 3, 14 + lift), C[2])  # tail
        s.fill(rect(17, 17, 6, 1), '#c83a2a')  # collar
    s.outline()
    return s


def cat(frame):
    s = Canvas(32, 32)
    C = CAT
    _shadow(s, 16, 29, 9, 2)
    if frame == 2:
        s.shade(ellipse(15, 22, 6, 6), None, 'form', colors=C[1:])
        s.shade(ellipse(18, 13, 5, 4), None, 'form', colors=C[1:])
        for ex in (14, 21):
            s.fill(poly([(ex, 11), (ex + 2, 6), (ex + 3, 11)]), C[2])
        s.set(16, 13, '#1e3a1a'); s.set(20, 13, '#1e3a1a'); s.set(18, 15, '#e86a7a')
        s.fill(line(9, 27, 5, 25) | line(5, 25, 4, 20), C[2])  # tail curled round
        for x in range(11, 20, 3):
            s.set(x, 18, C[0])  # stripes
    else:
        lift = 1 if frame else 0
        s.shade(ellipse(14, 21, 8, 4), None, 'form', colors=C[1:])
        for x, up in ((8, lift), (10, 1 - lift), (18, 1 - lift), (20, lift)):
            s.shade(rect(x, 23 - up, 2, 6), None, 'cyl', colors=C[:4])
        s.shade(ellipse(23, 16, 4, 4), None, 'form', colors=C[1:])
        for ex in (20, 25):
            s.fill(poly([(ex, 14), (ex + 1, 9), (ex + 3, 13)]), C[2])
        s.set(25, 15, '#1e3a1a'); s.set(26, 17, '#e86a7a')
        s.fill(line(6, 20, 3, 12 + lift) | line(5, 20, 2, 12 + lift), C[2])  # tail up
        for x in range(9, 19, 3):
            s.set(x, 18, C[0])
    s.outline()
    return s


def mound(cols, specks, seed):
    s = Canvas(32, 32)
    _shadow(s, 16, 27, 10, 2)
    s.shade({p for p in ellipse(16, 26, 11, 7) if p[1] <= 27}, None, 'form', colors=cols)
    for i, (x, y) in enumerate(((11, 23), (18, 21), (21, 25), (14, 26), (16, 23))):
        s.set(x + seed % 2, y, specks[i % len(specks)])
    s.outline()
    return s


SPRITES = {f'pet_{k}_{f}': (lambda k=k, f=f: (dog if k == 'dog' else cat)(f)) for k in ('dog', 'cat') for f in range(3)}
SPRITES['clay_mound'] = lambda: mound(['#5a2e1c', '#8a4a2c', '#b06a48', '#cc8a64', '#e0a882'], ['#e8c0a0', '#6a3a24'], 1)
SPRITES['salt_crust'] = lambda: mound(['#8a8a90', '#b8b8c0', '#dcdce4', '#f0f0f6', '#ffffff'], ['#ffffff', '#a8b0c0'], 2)
