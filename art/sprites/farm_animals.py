"""Farm animals and the horse, redrawn with real anatomy (used by creatures.py's an_* sprites).

Side view facing right, two walk frames, palette-swap templates: ch 0 = coat, ch 1 = the
coat's second colour. Bodies are a barrel with a chest and a rump, legs are jointed
(thigh, knee, cannon, hoof) and swing in diagonal pairs, the far legs are a shade darker.
Canvas sizes match the old templates, so in-game sizes don't change.
"""
from px import Canvas, rect, ellipse, poly, line, rng
from sprites.creatures import C, fin, eye, HOOF, BEAK, PINK, EYE


def leg(s, hip, foot, wt, wb, pal, knee=1, hoof=HOOF[0], hh=2):
    """A jointed leg from the hip/shoulder to the foot: wide at the top, a knee bend, a hoof."""
    (hx, hy), (fx, fy) = hip, foot
    kx, ky = (hx + fx) / 2 + knee, hy + (fy - hy) * .55
    pts = [(hx - wt / 2, hy), (hx + wt / 2, hy), (kx + wb / 2 + .5, ky), (fx + wb / 2, fy - hh), (fx - wb / 2, fy - hh), (kx - wb / 2 - .5, ky)]
    s.shade(poly([(round(x), round(y)) for x, y in pts]), None, 'form', colors=pal)
    if hoof:
        s.fill(rect(round(fx - wb / 2), fy - hh, max(2, round(wb)), hh), hoof)


def swing(f, i):
    """Walk offset for leg i: diagonal pairs move together."""
    return 2 if (i in (0, 3)) == bool(f) else -2


def bird_feet(s, x, y, f, col):
    for k, dx in enumerate((0, 5)):
        o = (1 if (k + f) % 2 else -1) * f
        s.fill(line(x + dx, y, x + dx + o, y + 5), col)
        s.fill({(x + dx + o - 1, y + 5), (x + dx + o + 1, y + 5), (x + dx + o + 2, y + 5)}, col)


def blob(*circles):
    out = set()
    for c in circles:
        out |= ellipse(*c)
    return out


def quadruped(W, H, f, body, neck, head, legs4, wt, wb, pal=None, hoof=HOOF[0]):
    """Far legs first (darker), then the body, the near legs, the neck and the head."""
    s = Canvas(W, H)
    P = pal or C(0)
    for i in (1, 3):
        (hx, hy), fx, knee = legs4[i]
        leg(s, (hx, hy), (fx + swing(f, i), H - 1), wt, wb, [P[0], P[0], P[1], P[2]], knee, hoof)
    s.shade(body, None, 'form', colors=C(0))
    for i in (0, 2):
        (hx, hy), fx, knee = legs4[i]
        leg(s, (hx, hy), (fx + swing(f, i), H - 1), wt, wb, P, knee, hoof)
    if neck:
        s.shade(neck, None, 'form', colors=C(0))
    s.shade(head, None, 'form', colors=C(0))
    return s


def chicken(f):
    s = Canvas(36, 36)
    bird_feet(s, 15, 28, f, BEAK[1])
    s.shade(poly([(4, 10), (9, 6), (12, 14), (10, 22), (5, 20)]), None, 'form', colors=C(1))  # tail fan
    s.fill(line(7, 8, 9, 18) | line(5, 12, 8, 20), C(1)[0])
    s.shade(poly([(9, 18), (14, 14), (24, 14), (29, 18), (27, 27), (19, 31), (12, 28)]), None, 'form', colors=C(0))  # body
    s.shade(poly([(22, 16), (24, 7), (29, 5), (32, 8), (31, 15), (28, 19)]), None, 'form', colors=C(0))  # neck and head
    s.shade(poly([(13, 19), (21, 18), (24, 22), (19, 26), (13, 24)]), None, 'form', colors=C(1))  # folded wing
    s.fill(line(15, 23, 21, 22), C(1)[0])
    s.fill(poly([(31, 9), (35, 10), (31, 12)]), BEAK[2]); s.set(32, 9, BEAK[3])
    s.fill({(26, 4), (27, 2), (28, 3), (29, 1), (30, 3), (30, 5), (26, 5), (27, 5), (28, 4)}, '#d8342a')  # comb
    s.fill({(31, 13), (31, 14), (30, 14)}, '#d8342a')  # wattle
    eye(s, 29, 8)
    return fin(s)


def duck(f):
    s = Canvas(38, 36)
    bird_feet(s, 15, 28, f, BEAK[1])
    s.shade(poly([(3, 16), (8, 18), (26, 18), (31, 22), (27, 29), (12, 30), (6, 26)]), None, 'form', colors=C(0))  # boat-shaped body, tail up
    s.shade(poly([(9, 20), (22, 19), (24, 24), (12, 26)]), None, 'form', colors=C(0)[1:] + [C(0)[3]])  # wing
    s.fill(line(11, 24, 22, 22), C(0)[0])
    s.shade(poly([(24, 20), (25, 12), (27, 6), (32, 5), (34, 9), (31, 12), (29, 19)]), None, 'form', colors=C(1))  # neck and head
    s.fill(rect(26, 17, 4, 2), '#f0ece0')  # neck ring
    s.fill(poly([(33, 8), (38, 9), (38, 11), (33, 11)]), BEAK[2]); s.fill(line(34, 10, 38, 10), BEAK[0])
    eye(s, 30, 7)
    return fin(s)


def rabbit(f):
    s = Canvas(38, 32)
    h = -f
    s.shade(poly([(5, 22 + h), (8, 14 + h), (16, 11 + h), (24, 13 + h), (27, 20 + h), (22, 27), (9, 27)]), None, 'form', colors=C(0))  # crouched body
    s.shade(ellipse(10, 23 + h, 6, 5), None, 'form', colors=C(0))  # big hind leg
    s.fill(poly([(6, 27), (16, 27), (17, 29), (5, 29)]), C(0)[1])  # hind foot
    s.fill(rect(22, 25, 3, 4), C(0)[1])  # fore paw
    s.shade(ellipse(3, 17 + h, 3, 3), None, 'sphere', colors=['#c8c0b8', '#f0ece6', '#ffffff'])  # tail puff
    s.shade(poly([(22, 14 + h), (27, 10 + h), (33, 12 + h), (35, 17 + h), (31, 21 + h), (25, 20 + h)]), None, 'form', colors=C(0))  # head
    for x, lean in ((24, -2), (28, 0)):
        s.shade(poly([(x, 12 + h), (x + 3, 12 + h), (x + 2 + lean, 0 + h), (x + lean, 1 + h)]), None, 'form', colors=C(0))
        s.fill(line(x + 1, 10 + h, x + 1 + lean // 2, 3 + h), PINK[2])
    s.set(35, 16 + h, PINK[1]); s.fill(line(32, 18 + h, 36, 17 + h), C(1)[3])
    eye(s, 30, 14 + h)
    return fin(s)


def goat(f):
    body = blob((25, 23, 15, 8), (13, 22, 7, 8), (36, 23, 7, 8))
    legs4 = [((14, 26), 13, -1), ((18, 26), 17, -1), ((34, 26), 34, 1), ((37, 26), 38, 1)]
    s = quadruped(54, 44, f, body, poly([(36, 18), (40, 8), (46, 9), (43, 22)]), poly([(40, 7), (45, 4), (50, 8), (53, 14), (50, 17), (45, 14)]), legs4, 4, 2.5)
    s.shade(ellipse(23, 22, 8, 5), None, 'form', colors=C(1))  # patch
    s.fill(poly([(4, 15), (8, 13), (8, 18)]), C(0)[2])  # short tail
    s.fill(line(43, 5, 39, 0) | line(44, 5, 40, 0) | line(39, 0, 36, 2), '#8a7a6a')  # swept horns
    s.fill(poly([(48, 15), (51, 16), (49, 21)]), C(0)[1])  # beard
    s.fill(poly([(41, 9), (36, 11), (40, 12)]), C(0)[1])  # ear
    s.set(53, 13, EYE); eye(s, 47, 9)
    return fin(s)


def sheep(f):
    r = rng(4)
    legs4 = [((15, 28), 14, -1), ((19, 28), 19, -1), ((32, 28), 32, 1), ((35, 28), 36, 1)]
    body = blob((24, 22, 17, 11), (12, 21, 7, 9), (36, 21, 7, 9))
    s = quadruped(54, 44, f, body, None, poly([(39, 13), (44, 11), (50, 15), (52, 20), (48, 23), (42, 20)]), legs4, 3.5, 2.5, pal=C(1))
    for k in range(26):  # wool: curls over the whole fleece
        x, y = r.randrange(8, 42), r.randrange(11, 32)
        if (x, y) in body:
            s.shade(ellipse(x, y, 2.5, 2), None, 'sphere', colors=C(0)); s.set(x + 1, y + 1, C(0)[1])
    s.shade(poly([(42, 14), (46, 13), (50, 16), (52, 20), (48, 23), (43, 20)]), None, 'form', colors=C(1))  # face
    s.fill(poly([(42, 15), (37, 18), (42, 19)]), C(1)[1])  # ear
    s.shade(ellipse(42, 12, 5, 3), None, 'sphere', colors=C(0))  # topknot
    eye(s, 46, 16)
    return fin(s)


def cow(f):
    legs4 = [((15, 30), 14, -1), ((20, 30), 20, -1), ((41, 30), 41, 1), ((45, 30), 46, 1)]
    body = blob((30, 25, 20, 11), (14, 24, 8, 11), (44, 26, 7, 10))
    s = quadruped(62, 48, f, body, poly([(44, 18), (50, 16), (53, 28), (46, 32)]), poly([(48, 14), (54, 12), (59, 17), (61, 25), (56, 28), (51, 24)]), legs4, 5, 3.5)
    s.shade(ellipse(22, 21, 8, 6), None, 'form', colors=C(1)); s.shade(ellipse(36, 28, 6, 4), None, 'form', colors=C(1))  # patches
    s.shade(ellipse(57, 25, 4, 3), None, 'sphere', colors=PINK)  # muzzle
    s.fill({(57, 25), (59, 25)}, '#5a2a2a')
    s.fill(line(51, 13, 48, 8) | line(48, 8, 50, 6) | line(55, 12, 57, 8) | line(57, 8, 59, 7), '#e8dcc0')  # horns
    s.fill(poly([(50, 14), (44, 15), (49, 18)]), C(0)[1])  # ear
    s.shade(ellipse(26, 37, 4, 2), None, 'sphere', colors=PINK)  # udder
    s.fill(line(8, 18, 5, 33) | line(9, 18, 6, 33), C(0)[1]); s.fill(rect(4, 33, 3, 4), C(1)[1])  # tail and tuft
    eye(s, 54, 18)
    return fin(s)


def pig(f):
    legs4 = [((16, 30), 15, 0), ((20, 30), 20, 0), ((33, 30), 33, 0), ((36, 30), 37, 0)]
    body = blob((25, 23, 17, 11), (12, 23, 7, 9))
    s = quadruped(54, 40, f, body, None, poly([(36, 15), (43, 14), (49, 19), (50, 26), (44, 29), (38, 27)]), legs4, 4, 3.5, hoof=HOOF[1])
    s.shade(ellipse(49, 22, 3, 4), None, 'sphere', colors=C(1)); s.fill({(49, 21), (49, 23)}, '#5a2a2a')  # snout
    s.shade(ellipse(22, 18, 7, 4), None, 'form', colors=C(1))
    s.shade(poly([(38, 15), (43, 9), (44, 17)]), None, 'form', colors=C(0)[:3])  # floppy ear
    s.fill({(8, 19), (6, 18), (5, 19), (6, 21), (7, 20)}, C(0)[1])  # curly tail
    eye(s, 44, 18)
    return fin(s)


def horse(f):
    legs4 = [((17, 38), 15, -2), ((22, 38), 21, -2), ((47, 38), 47, 1), ((52, 38), 53, 1)]
    body = blob((33, 32, 20, 10), (17, 31, 9, 10), (48, 32, 8, 9))
    neck = poly([(44, 26), (50, 9), (58, 8), (57, 18), (55, 32)])
    head = poly([(52, 9), (56, 5), (61, 6), (67, 14), (69, 19), (65, 22), (59, 18), (55, 15)])
    s = Canvas(70, 60)
    s.shade(poly([(10, 26), (13, 24), (12, 36), (8, 50), (4, 52), (5, 42)]), None, 'form', colors=C(1))  # flowing tail
    s.fill(line(11, 28, 6, 48), C(1)[0])
    s.paste(quadruped(70, 60, f, body, neck, head, legs4, 6, 3.5), 0, 0)
    s.fill(poly([(48, 6), (53, 3), (57, 6), (52, 22), (47, 28), (45, 26)]), C(1)[1]); s.fill(line(52, 5, 46, 26), C(1)[2])  # mane
    s.fill(poly([(56, 5), (57, 0), (59, 5)]), C(0)[1])  # ear
    s.fill(line(62, 18, 66, 21), C(0)[1]); s.set(67, 19, EYE)  # mouth line and nostril
    eye(s, 60, 10)
    return fin(s)
