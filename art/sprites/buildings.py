"""Building exteriors (Phase 10), one per (kind, w, h) the game places.

A sprite exactly fills its footprint: w*32 x h*32 art px (w x h tiles). The door sits
on the bottom row at tile floor(w/2), matching addB(). Doors are ~46 px tall so they
fit a character (~55 px with hair).

Every building is put together from real roof forms seen in 3/4 view:
  side   ridge runs left-right: dark back slope above the ridge, lit front slope, bargeboards
         on the gable ends and a fascia along the eave that casts a shadow on the wall
  hip    like side, but the ends slope too (lit left hip, shaded right hip)
  front  ridge points at the viewer: the roof runs back from a gable wall facing us
  gambrel  a front roof with a knee (barns)
plus cross gables, dormers, porches, cupolas and chimneys that sit on the roof surface.
Light from the top-left. meta['chim'] gives the chimney top in art px for smoke.
Coop, barn and stable also come in upgrade levels (bld_<kind>_<w>x<h>_l<n>).
"""
import bisect
from px import Canvas, rect, ellipse, poly, line, vnoise, rng, hx, ramp as mkramp


def R(base, n=6, shift=14):
    return mkramp(base, n, shift)[0]


def mul(c, k):
    c = hx(c)
    return tuple(max(0, min(255, int(v * k))) for v in c[:3]) + (255,)


def mix(a, b, t):
    a, b = hx(a), hx(b)
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,)


STY = {
    'house': dict(roof='side', rmat='shingle', rcol='#a8462e', wmat='plaster', wcol='#efdcb4', trim='#5a3a22', timber=1, cross=1, porch=1,
                  chim=('stone', -44), shut='#4a6a8a', boxes=1, lantern=1, rf=.5),
    'cottage': dict(roof='side', rmat='thatch', rcol='#b89a58', wmat='plaster', wcol='#f0e2c4', trim='#6a4226', timber=1, chim=('brick', 22),
                    shut='#5a7a3a', boxes=1, ivy=1, rf=.52),
    'coop': dict(roof='front', rmat='shingle', rcol='#9a6a3a', wmat='batten', wcol='#d8b47a', trim='#6a4226', hen=1, rf=.56),
    'barn': dict(roof='gambrel', rmat='shingle', rcol='#5e3430', wmat='batten', wcol='#b8402e', trim='#f2e8d8', door='double', loft=1, rf=.58),
    'stable': dict(roof='side', rmat='slate', rcol='#4e5e74', wmat='boards', wcol='#8a5e3a', trim='#e8dcc4', door='dutch', stalls=1, rf=.5),
    'greenhouse': dict(roof='front', rmat='glass', rcol='#bfe8f4', wmat='glass', wcol='#cdeef8', trim='#e8ece4', rf=.5),
    'store': dict(roof='hip', rmat='shingle', rcol='#3e7a52', wmat='plaster', wcol='#f2e2b8', trim='#6a4226', timber=1, door='shop', shopwin=1,
                  awning='#c8342a', icon='seed', crates=1, rf=.5),
    'smith': dict(roof='side', rmat='slate', rcol='#55555f', wmat='stone', wcol='#a8a296', trim='#3a2a1a', door='double', chim=('forge', 10),
                  icon='anvil', barrels=1, coal=1, rf=.48),
    'tavern': dict(roof='side', rmat='shingle', rcol='#8a4a32', wmat='plaster', wcol='#f2d8a4', trim='#5a3a22', timber=1, lower='stone',
                   dormers=2, chim=('stone', -40), icon='mug', barrels=1, lantern=1, boxes=1, rf=.42),
    'stablemaster': dict(roof='hip', rmat='slate', rcol='#6a5a7e', wmat='batten', wcol='#9a6a40', trim='#efe0c0', icon='horse', hay=1, shut='#6a3a2a', rf=.5),
    'carpenter': dict(roof='front', rmat='shingle', rcol='#b8743a', wmat='logs', wcol='#a8743f', trim='#5a3a22', icon='saw', lumber=1, ivy=1, rf=.56),
    'museum': dict(roof='hip', rmat='slate', rcol='#5e6e8e', wmat='ashlar', wcol='#e2dccc', trim='#8a8478', portico=1, arched=1, icon='urn', rf=.46),
    'hut': dict(roof='side', rmat='thatch', rcol='#a89a5a', wmat='boards', wcol='#9a8466', trim='#4a3020', icon='fish', nets=1, barrels=1, rf=.44),
    'cabin': dict(roof='side', rmat='slate', rcol='#6a6070', wmat='logs', wcol='#8a6a48', trim='#3a2618', chim=('stone', 12), snow=1, wood=1, rf=.46),
    'manor': dict(roof='hip', rmat='slate', rcol='#3e4a6a', wmat='ashlar', wcol='#d8d0c0', trim='#5a4a3a', cross=1, icon='crest', chim=('stone', 30), chim2=1,
                  shut='#2e4a3a', boxes=1, tall=1, lantern=1, rf=.48),
}

REGION_STY = {  # town buildings of the four regions (Phase 11b)
    'hm_hall': dict(roof='side', rmat='turf', rcol='#5a8a3a', wmat='stone', wcol='#8a8a86', trim='#4a3020', cross=1, chim=('stone', -40), banners='#2a4a8a', icon='mug', lantern=1, rf=.46),
    'hm_forge': dict(roof='side', rmat='slate', rcol='#4a4e5a', wmat='stone', wcol='#7a7a78', trim='#3a2a1a', door='double', chim=('forge', 10), icon='anvil', coal=1, barrels=1, rf=.48),
    'hm_house': dict(roof='side', rmat='turf', rcol='#4f7e36', wmat='stone', wcol='#9a948a', trim='#4a3020', chim=('stone', -22), shut='#6a3a2a', boxes=1, rf=.5),
    'fm_lodge': dict(roof='side', rmat='shingle', rcol='#5a4a40', wmat='logs', wcol='#7a5a3a', trim='#3a2618', snow=1, icicles=1, chim=('stone', -34), banners='#4a7ab0', icon='mug', lantern=1, rf=.48),
    'fm_forge': dict(roof='side', rmat='slate', rcol='#5a6070', wmat='stone', wcol='#a8b0b8', trim='#2a2a34', door='double', snow=1, icicles=1, chim=('forge', 8), icon='anvil', rf=.5),
    'fm_house': dict(roof='side', rmat='shingle', rcol='#5a4a40', wmat='logs', wcol='#8a6a48', trim='#3a2618', snow=1, icicles=1, chim=('stone', 10), wood=1, rf=.46),
    'ew_hall': dict(roof='flat', rmat='flat', rcol='#8a6a4a', wmat='ashlar', wcol='#4a4040', trim='#2a1a14', fcol='#2a2420', banners='#c8401a', icon='mug', lantern=1, barrels=1, rf=.4),
    'ew_forge': dict(roof='flat', rmat='flat', rcol='#7a5a42', wmat='stone', wcol='#4a4040', trim='#2a1a14', fcol='#2a2420', door='double', chim=('forge', 12), icon='anvil', coal=1, rf=.42),
    'sr_inn': dict(roof='side', rmat='tile', rcol='#2a8a9a', wmat='plaster', wcol='#f4f0e8', trim='#2a4a6a', shut='#2a8a9a', boxes=1, cross=1, icon='mug', lantern=1, barrels=1, rf=.44),
    'sr_house': dict(roof='side', rmat='thatch', rcol='#b8a868', wmat='boards', wcol='#9a8466', trim='#4a3020', stilts=1, nets=1, rf=.42),
    'sr_forge': dict(roof='side', rmat='slate', rcol='#3a5a6a', wmat='stone', wcol='#b8b0a0', trim='#2a3a4a', door='double', chim=('forge', 10), icon='anvil', rf=.48),
}
STY.update(REGION_STY)
SIZES = [('house', 7, 5), ('coop', 6, 5), ('barn', 7, 6), ('stable', 6, 5), ('greenhouse', 6, 5), ('store', 6, 5), ('smith', 6, 5),
         ('tavern', 7, 6), ('stablemaster', 6, 5), ('carpenter', 6, 5), ('museum', 8, 6), ('cottage', 5, 5), ('mine', 5, 4),
         ('hut', 4, 3), ('cabin', 4, 3), ('manor', 7, 5),
         ('hm_hall', 7, 6), ('hm_forge', 6, 5), ('hm_house', 5, 4), ('fm_lodge', 6, 5), ('fm_forge', 5, 4), ('fm_house', 4, 3),
         ('ew_hall', 6, 5), ('ew_forge', 6, 5), ('sr_inn', 7, 6), ('sr_house', 4, 4), ('sr_forge', 5, 4)]
LEVELS = {'coop': 4, 'barn': 4, 'stable': 3}


# ---- materials -------------------------------------------------------------
WINTER = False  # set while drawing the winter version of a building


def roof_px(mat, pal, a, b, k, seed):
    """One roof pixel. a: distance down the slope (courses), b: along the course, k: plane light."""
    if WINTER and mat != 'glass':  # snow lies on the slope; the courses show as faint lines
        snow = ['#b8c8dc', '#d0dcea', '#e4ecf4', '#f4f8fc', '#ffffff']
        c = snow[max(0, min(4, 3 + k))]
        if a % 6 == 5 and vnoise(b * .3, a, seed) > .55:
            c = snow[max(0, 1 + k)]
        return c
    I = lambda i: pal[max(0, min(len(pal) - 1, i + k))]
    if mat == 'thatch':
        band, ra = a // 7, a % 7
        f = vnoise(b * .9, band * 3.1 + a * .15, seed)
        c = I(3) if f > .62 else I(2) if f > .3 else I(1)
        if (b + band * 2) % 3 == 0 and ra < 6:
            c = I(1) if f < .6 else I(2)
        if ra == 6:
            c = I(0)
        elif ra == 5:
            c = I(1)
        elif ra == 0 and (b + band) % 2:
            c = I(4)
        return c
    if mat == 'turf':  # sod roof: grass with tufts and a few flowers
        f = vnoise(b * .35, a * .35, seed)
        c = I(3) if f > .62 else I(2) if f > .3 else I(1)
        if (b * 7 + a * 13) % 23 == 0:
            c = I(4)
        if (b * 5 + a * 11) % 97 == 0:
            c = hx('#f4e86a')
        return c
    if mat == 'glass':
        c = hx('#bfe8f4') if (b // 10 + a // 8) % 2 else hx('#a8d8ec')
        if b % 10 == 0 or a % 8 == 0:
            c = hx('#e8ece4')
        elif (a - b) % 23 < 3:
            c = hx('#f2fcff')
        return mul(c, 1 + .06 * k)
    if mat == 'tile':
        c = [I(1), I(2), I(3), I(4), I(3), I(2)][b % 6]
        return I(0) if a % 7 == 6 else c
    th, tw = (5, 9) if mat == 'slate' else (6, 8)
    row, ra = a // th, a % th
    bb = b + (row % 2) * (tw // 2)
    col, rb = bb // tw, bb % tw
    tone = vnoise(col * 1.9, row * 1.7, seed)
    c = I(2 + (1 if tone > .7 else 0) - (1 if tone < .15 else 0))
    if ra == th - 1:
        c = I(0)
    elif ra == 0:
        c = I(4) if mat == 'slate' else I(3)
    elif rb == 0:
        c = I(1)
    return c


def paint_wall(s, mask, mat, col, seed):
    if not mask:
        return
    pal = R(col, 5, 10)
    rr = rng(seed)
    xs = [x for x, _ in mask]; ys = [y for _, y in mask]
    x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    if mat in ('stone', 'ashlar'):
        reg = mat == 'ashlar'
        rows, y = [], y0
        while y < y1:
            hh = 7 if reg else rr.choice([5, 6, 6, 7])
            cuts, x = [], x0 - ((len(rows) % 2) * 8 if reg else rr.randrange(0, 9))
            while x < x1:
                cuts.append(x); x += 16 if reg else rr.randrange(7, 15)
            rows.append((y, hh, cuts)); y += hh
        starts = [r_[0] for r_ in rows]
        for x, y in mask:
            ry, hh, cuts = rows[bisect.bisect_right(starts, y) - 1]
            cx = cuts[max(0, bisect.bisect_right(cuts, x) - 1)]
            t = vnoise(cx * .37, ry * .51, seed)
            if y == ry + hh - 1 or x == cx:
                c = pal[0] if not reg else pal[1]
            elif y == ry or x == cx + 1:
                c = pal[4] if reg else pal[3]
            elif y == ry + hh - 2:
                c = pal[1] if not reg else pal[2]
            else:
                c = pal[3] if t > .66 else pal[1] if t < .2 and not reg else pal[2]
            s.set(x, y, c)
    elif mat == 'logs':
        prof = [3, 4, 3, 2, 2, 1, 0]
        for x, y in mask:
            ry = (y - y0) % 7
            c = pal[prof[ry]]
            if ry == 6:
                c = mix(pal[0], '#d8c8a4', .45)  # chinking
            elif vnoise(x * .25, (y - y0) // 7 * 5.0, seed) > .82 and ry in (2, 3):
                c = pal[1]
            s.set(x, y, c)
        for y in range(y0, y1 - 4, 7):  # round log ends at the corners
            for ex in (x0 + 1, x1 - 6):
                s.fill(ellipse(ex + 2, y + 3, 3, 3), pal[3]); s.fill(ellipse(ex + 2, y + 3, 1.5, 1.5), mix(pal[2], '#e8c890', .5))
                s.set(ex + 2, y + 3, pal[1])
    elif mat in ('boards', 'batten'):
        bw = 6 if mat == 'boards' else 8
        for x, y in mask:
            i, rx = (x - x0) // bw, (x - x0) % bw
            t = vnoise(i * 1.3, 0, seed)
            c = pal[2] if t > .35 else pal[1] if mat == 'boards' else pal[2]
            if vnoise(x * .4, y * .08, seed + 3) > .78:
                c = pal[1]
            if mat == 'boards':
                if rx == 0:
                    c = pal[0]
                elif rx == 1:
                    c = pal[3]
            else:
                if rx == 0:
                    c = pal[3]
                elif rx == 1:
                    c = pal[1]
                elif rx == bw - 1:
                    c = mix(pal[1], pal[2], .5)
            s.set(x, y, c)
    elif mat == 'glass':
        for x, y in mask:
            c = hx('#cdeef8') if (x + y) % 37 > 4 else hx('#f2fcff')
            if (x - x0) % 14 == 0 or (y - y0) % 12 == 0:
                c = hx('#e8ece4')
            s.set(x, y, c)
        for _ in range(12):  # plants inside the glass
            px_, py_ = rr.randrange(x0 + 4, x1 - 4), rr.randrange(y0 + (y1 - y0) // 2, y1 - 3)
            s.fill(ellipse(px_, py_, 3, 2.5), '#4f8e3a'); s.set(px_ - 1, py_ - 1, '#8cc256'); s.set(px_ + 1, py_ - 2, '#d8506a')
    elif mat == 'brick':
        for x, y in mask:
            row = (y - y0) // 4
            bx = (x - x0 + (row % 2) * 4) % 8
            c = hx('#c8beac') if (y - y0) % 4 == 3 or bx == 0 else pal[2 + (1 if vnoise((x - x0 + (row % 2) * 4) // 8, row, seed) > .7 else 0)]
            s.set(x, y, c)
    else:  # plaster, mottled with a few exposed stones
        for x, y in mask:
            n = vnoise(x * .15, y * .15, seed) + (rr.random() - .5) * .08
            s.set(x, y, pal[4] if n > .86 else pal[3] if n > .55 else pal[2])
        for _ in range(len(mask) // 1500):
            sx, sy = rr.randrange(x0 + 4, max(x0 + 5, x1 - 8)), rr.randrange(y0 + 4, max(y0 + 5, y1 - 4))
            if (sx, sy) in mask:
                s.fill(rect(sx, sy, 5, 3), '#b8b0a0'); s.fill(rect(sx, sy, 5, 1), '#d8d2c4'); s.fill(rect(sx + 4, sy, 1, 3), '#9a9284')


def wall_edges(s, x0, y0, x1, y1, col):
    """Left corner catches the light, right corner turns into shadow."""
    pal = R(col, 5, 10)
    for y in range(y0, y1):
        if s.get(x0, y)[3]:
            s.set(x0, y, pal[4])
        for k, a in ((1, .55), (2, .7), (3, .85)):
            c = s.get(x1 - k, y)
            if c[3]:
                s.set(x1 - k, y, mul(c, a))


def eave_shadow(s, x0, x1, y, depth=4):
    for yy in range(y, y + depth):
        for x in range(x0, x1):
            c = s.get(x, yy)
            if c[3] and (yy < y + depth - 1 or (x + yy) % 2 == 0):
                s.set(x, yy, mul(c, .66 if yy < y + 2 else .8))


def foundation(s, x0, x1, y0, H, col='#8a8478'):
    pal = R(col, 4, 8)
    for y in range(y0, H):
        row = (y - y0) // 3
        for x in range(x0, x1):
            bx = (x + row * 4) % 9
            c = pal[0] if (y - y0) % 3 == 2 or bx == 0 else pal[2] if vnoise((x + row * 4) // 9, row, 11) > .4 else pal[1]
            s.set(x, y, c)
    s.fill(rect(x0, y0, x1 - x0, 1), pal[3])


def grime(s, x0, x1, y):
    for yy in range(y - 4, y):
        for x in range(x0, x1):
            c = s.get(x, yy)
            if c[3] and (x * 7 + yy * 3) % (5 - (yy - y + 4)) == 0:
                s.set(x, yy, mul(c, .86))


# ---- roofs -----------------------------------------------------------------
def roof_side(s, st, W, ry, ey, hip, seed):
    """Side gable (hip=0) or hip roof. ry: ridge row, ey: bottom of the fascia."""
    pal = R(st['rcol'], 6, 14); mat = st['rmat']; tr = R(st['trim'], 4, 8)
    thatch = mat == 'thatch'
    top = 1
    fy = ey - (5 if thatch else 3)  # fascia / thatch lip start
    for y in range(top, fy):
        if hip:
            xmin = 1 + (hip - 1) * (1 - (y - top) / max(1, ey - top))
            xf = 1 + (hip - 1) * (1 - (y - ry) / max(1, ey - ry)) if y >= ry else hip
        else:
            xmin, xf = (2 if y < ry else 1), 1
        for x in range(1, W - 1):
            if x < xmin or x >= W - xmin:
                continue
            if y < ry and (not hip or (xf <= x < W - xf)):
                k, a, b = -2, ry - y, x
            elif hip and x < xf:
                k, a, b = 1, y - top + (xf - x) // 2, x + y
            elif hip and x >= W - xf:
                k, a, b = -1, y - top + (x - (W - xf)) // 2, x - y
            else:
                k, a, b = 0, y - ry, x
            s.set(x, y, roof_px(mat, pal, a, b, k, seed))
    # ridge cap
    if hip:
        s.fill(rect(hip, ry - 1, W - 2 * hip, 1), pal[5]); s.fill(rect(hip, ry, W - 2 * hip, 1), pal[1])
        for y in range(top, ey):  # hip ridges
            xl = round(1 + (hip - 1) * (1 - (y - ry) / max(1, ey - ry))) if y >= ry else None
            if xl is not None:
                s.set(xl, y, pal[4]); s.set(W - 1 - xl, y, pal[0])
    else:
        s.fill(rect(2, ry - 1, W - 4, 1), pal[5 if not thatch else 4]); s.fill(rect(2, ry, W - 4, 1), pal[1])
        if thatch:  # a thatch ridge is a thick bound roll
            s.fill(rect(2, ry - 3, W - 4, 2), pal[3])
            for x in range(4, W - 4, 6):
                s.fill(rect(x, ry - 3, 1, 4), pal[0])
    # eave
    if thatch:
        for x in range(1, W - 1):
            dip = 1 if vnoise(x * .5, 3, seed) > .55 else 0
            for y in range(fy, ey + dip):
                c = pal[2] if (x * 3 + y) % 4 else pal[1]
                if y == fy:
                    c = pal[3]
                if y >= ey - 1:
                    c = pal[0]
                s.set(x, y, c)
        for y in range(top, ey + 1):  # trim the outer columns into a soft curve
            for k in range(3):
                if y - top < 3 - k or ey - y < 3 - k:
                    s.set(1 + k, y, (0, 0, 0, 0)); s.set(W - 2 - k, y, (0, 0, 0, 0))
    else:
        if not hip:
            for y in range(top, fy):  # bargeboards on the gable ends
                s.fill(rect(1, y, 3, 1), tr[2]); s.set(1, y, tr[3]); s.set(3, y, tr[0])
                s.fill(rect(W - 4, y, 3, 1), tr[1]); s.set(W - 2, y, tr[0])
        s.fill(rect(1, fy, W - 2, 1), tr[3]); s.fill(rect(1, fy + 1, W - 2, 1), tr[2]); s.fill(rect(1, fy + 2, W - 2, 1), tr[0])
    return fy


def roof_front(s, st, W, prof, D, ax, knee=None, seed=1):
    """Ridge points at the viewer: the roof runs back D px from the gable edge prof(x)."""
    pal = R(st['rcol'], 6, 14); mat = st['rmat']; tr = R(st['trim'], 4, 8)
    for x in range(1, W - 1):
        py = prof(x)
        d = abs(x - ax)
        k = (1 if x < ax else -1)
        if knee is not None:
            k = (1 if d < knee else 0) if x < ax else (0 if d < knee else -2)
        for y in range(max(0, py - D), py - 3):
            s.set(x, y, roof_px(mat, pal, y - (py - D), x, k, seed))  # courses run parallel to the rake
        for i, c in enumerate((tr[3] if x < ax else tr[2], tr[2] if x < ax else tr[1], tr[0])):  # bargeboard
            s.set(x, py - 3 + i, c)
    for y in range(0, prof(ax) - 3):  # ridge cap
        s.set(ax - 1, y, pal[5]); s.set(ax, y, pal[3]); s.set(ax + 1, y, pal[0])


def cross_gable(s, st, gx, gw, apex, base, seed, wmat=None):
    """A gable facing us on a side roof: two raked roof bands and a gable wall between."""
    pal = R(st['rcol'], 6, 14); mat = st['rmat']; tr = R(st['trim'], 4, 8)
    t = 9 if mat != 'thatch' else 11
    edge = lambda x: apex + (base - apex) * abs(x - gx) / gw
    wall = set()
    for x in range(gx - gw, gx + gw + 1):
        e = edge(x)
        for y in range(int(e), base + 2):
            if y < e + t:
                k = 1 if x < gx else -1
                s.set(x, y, roof_px(mat, pal, int(y - e), x, k, seed))
            elif abs(x - gx) < gw - 4:
                wall.add((x, y))
        s.set(x, int(e), tr[3] if x < gx else tr[1]); s.set(x, int(e) + 1, tr[2] if x < gx else tr[0])
        if int(e + t) < base:
            s.set(x, int(e + t), mul(pal[0], .8))
    paint_wall(s, wall, wmat or st['wmat'], st['wcol'], seed + 5)
    for (x, y) in wall:  # rake shadow on the gable wall
        if y - edge(x) < t + 3:
            s.set(x, y, mul(s.get(x, y), .72))
    s.fill(rect(gx - 1, apex - 3, 3, 3), tr[2]); s.set(gx, apex - 4, tr[3])  # finial
    return wall


def chimney(s, x, top, base, mat='stone'):
    w = 16 if mat == 'forge' else 10
    m = 'brick' if mat == 'brick' else 'stone'
    body = rect(x, top, w, base - top)
    paint_wall(s, body, m, '#9a5040' if m == 'brick' else '#9a9488', x * 3 + top)
    for y in range(top, base):
        s.set(x, y, mul(s.get(x, y), 1.15)); s.set(x + w - 1, y, mul(s.get(x + w - 1, y), .7)); s.set(x + w - 2, y, mul(s.get(x + w - 2, y), .85))
    cap = R('#8a8478', 4, 8)
    s.fill(rect(x - 1, top - 3, w + 2, 3), cap[2]); s.fill(rect(x - 1, top - 3, w + 2, 1), cap[3]); s.fill(rect(x + 1, top - 2, w - 2, 1), '#241c18')
    if mat == 'forge':
        s.fill(rect(x + 2, top - 2, w - 4, 1), '#ff9a3a')
    s.fill(rect(x - 1, base - 1, w + 2, 2), '#5a5a62'); s.fill(rect(x - 1, base - 1, w + 2, 1), '#8a8a94')  # flashing
    for y in range(top + 3, base - 1):  # shadow cast down the roof to the right
        for dx in (0, 1, 2):
            if dx < 2 or y % 2 == 0:
                c = s.get(x + w + 1 + dx, y)
                if c[3]:
                    s.set(x + w + 1 + dx, y, mul(c, .72))
    return (x + w // 2, top - 3)


def dormer(s, st, cx, base, seed):
    pal = R(st['rcol'], 6, 14); tr = R(st['trim'], 4, 8)
    paint_wall(s, rect(cx - 8, base - 15, 16, 15), 'plaster', st['wcol'], seed)
    window(s, cx, base - 13, 10, 11, st['trim'])
    for x in range(cx - 11, cx + 12):
        e = base - 24 + abs(x - cx) * 10 // 11
        for y in range(e, e + 5):
            s.set(x, y, roof_px(st['rmat'], pal, y - e, x, 1 if x < cx else -1, seed))
        s.set(x, e, tr[3] if x < cx else tr[1])
        s.set(x, e + 5, mul(pal[0], .8))
    for y in range(base - 13, base):
        c = s.get(cx + 9, y)
        if c[3]:
            s.set(cx + 9, y, mul(c, .7))


def cupola(s, st, cx, ry, vane):
    tr = R(st['trim'], 4, 8); pal = R(st['rcol'], 6, 14)
    s.fill(rect(cx - 9, ry - 16, 18, 18), tr[2]); s.fill(rect(cx - 9, ry - 16, 1, 18), tr[3]); s.fill(rect(cx + 8, ry - 16, 2, 18), tr[0])
    for y in range(ry - 13, ry, 2):
        s.fill(rect(cx - 6, y, 12, 1), mul(tr[0], .6))
    for x in range(cx - 12, cx + 13):
        e = ry - 27 + abs(x - cx) * 10 // 12
        for y in range(e, ry - 15):
            s.set(x, y, pal[4] if x < cx else pal[1])
        s.set(x, ry - 15, pal[0])
    ry -= 6
    if vane:
        s.fill(rect(cx, ry - 30, 1, 10), '#3a3a40')
        s.fill(rect(cx - 5, ry - 27, 11, 1), '#3a3a40')  # arrow
        s.fill({(cx + 5, ry - 28), (cx + 5, ry - 26), (cx - 5, ry - 28), (cx - 6, ry - 27)}, '#3a3a40')
        s.fill(rect(cx - 2, ry - 34, 4, 3) | {(cx + 2, ry - 35), (cx - 3, ry - 32)}, '#2a2a30')  # rooster
        s.set(cx + 2, ry - 36, '#c83a2a')


# ---- openings --------------------------------------------------------------
WINLOG = []  # glass rects of the building being drawn (art px), saved as meta['win']


def window(s, cx, y, w, h, trim, shutters=None, box=False, r=None, arch=False, lintel=None):
    tr = R(trim, 4, 8)
    x0 = cx - w // 2
    WINLOG.append([x0 + 1, y + 1, w - 2, h - 2])
    if lintel:
        s.fill(rect(x0 - 2, y - 3, w + 4, 2), lintel); s.fill(rect(x0 - 2, y - 3, w + 4, 1), mul(lintel, 1.15))
    frame = {(x, yy) for x in range(x0 - 1, x0 + w + 1) for yy in range(y - 1, y + h + 1)
             if not arch or yy > y + w // 2 or ((x + .5 - cx) / (w / 2 + 1)) ** 2 + ((yy - (y + w // 2)) / (w / 2 + 1)) ** 2 <= 1}
    s.fill(frame, tr[0])
    inner = {(x, yy) for x, yy in frame if x0 + 1 <= x < x0 + w - 1 and y + 1 <= yy < y + h - 1 and
             (not arch or yy > y + w // 2 or ((x + .5 - cx) / (w / 2 - 1)) ** 2 + ((yy - (y + w // 2)) / (w / 2 - 1)) ** 2 <= 1)}
    s.fill({p for p in frame if p not in inner and p[0] >= x0 and p[0] < x0 + w and p[1] >= y}, tr[2])
    for x, yy in inner:
        t = (yy - y) / h
        c = mix('#b8e0f4', '#2e4e7a', t * 1.1)
        if 2 < (x - x0) + (yy - y) < 6:
            c = mix(c, '#ffffff', .55)
        if x > cx and yy > y + h * .55:
            c = mix(c, '#1e2e48', .3)
        s.set(x, yy, c)
    s.fill({(cx, yy) for yy in range(y + 1, y + h - 1)} & inner, tr[1])
    for my in ([y + h // 2] if h < 18 else [y + h // 3, y + 2 * h // 3]):
        s.fill({(x, my) for x in range(x0, x0 + w)} & inner, tr[1])
    s.fill(rect(x0 - 2, y + h, w + 4, 2), tr[1]); s.fill(rect(x0 - 2, y + h, w + 4, 1), tr[3])  # sill
    if shutters:
        sp = R(shutters, 4, 8)
        for sx in (x0 - 7, x0 + w + 1):
            s.fill(rect(sx, y - 1, 6, h + 2), sp[1])
            for k in range(sx, sx + 6, 3):
                s.fill(rect(k, y - 1, 1, h + 2), sp[0])
            s.fill(rect(sx, y + 2, 6, 1), sp[3]); s.fill(rect(sx, y + h - 3, 6, 1), sp[3])
            s.fill(rect(sx, y - 1, 1, h + 2), sp[2])
    if box:
        r = r or rng(cx + y)
        s.fill(rect(x0 - 2, y + h + 2, w + 4, 4), '#7a4e2c'); s.fill(rect(x0 - 2, y + h + 2, w + 4, 1), '#a8743f')
        for k in range(0, w + 3, 2):
            col = r.choice(['#ff7aa0', '#ffd84a', '#ffffff', '#a8c0ff', '#ff8a5a', '#e84a5a'])
            s.set(x0 - 1 + k, y + h + 1, '#4f8e3a'); s.set(x0 - 1 + k, y + h, col)
            if k % 4 == 0:
                s.set(x0 + k, y + h + 1, '#2f6e2a'); s.set(x0 + k, y + h - 1, col)


def shop_window(s, x0, y, w, h, trim):
    tr = R(trim, 4, 8)
    WINLOG.append([x0 + 1, y + 1, w - 2, h - 2])
    s.fill(rect(x0 - 2, y - 2, w + 4, h + 4), tr[0]); s.fill(rect(x0 - 1, y - 1, w + 2, h + 2), tr[2])
    for x in range(x0 + 1, x0 + w - 1):
        for yy in range(y + 1, y + h - 1):
            c = mix('#a8d4ec', '#34507a', (yy - y) / h)
            if 3 < (x - x0) - (yy - y) // 2 < 7:
                c = mix(c, '#ffffff', .5)
            s.set(x, yy, c)
    r = rng(x0)
    for k in range(x0 + 3, x0 + w - 6, 7):  # goods on display
        s.fill(rect(k, y + h - 7, 5, 5), r.choice(['#d8342a', '#ef8a2c', '#f2cf3a', '#7a3a9a', '#e8e0d0']))
        s.fill(rect(k, y + h - 7, 5, 1), '#ffffff')
    s.fill(rect(x0 - 1, y + h - 2, w + 2, 2), tr[1])
    for k in range(x0 + w // 3, x0 + w, w // 3):
        s.fill(rect(k, y, 1, h), tr[1])
    s.fill(rect(x0 - 3, y + h + 2, w + 6, 2), tr[1]); s.fill(rect(x0 - 3, y + h + 2, w + 6, 1), tr[3])


WOOD = ['#3e2614', '#5e3c20', '#7e522e', '#9e6c3c', '#b8844c']


def door(s, cx, H, kind, trim, h=46, w=22):
    tr = R(trim, 4, 8)
    bottom = H - 2
    if kind == 'double':
        w, h = 44, min(h + 6, 56)
    x0, y0 = cx - w // 2, bottom - h
    arch = kind == 'plank'
    shape = {(x, y) for x in range(x0, x0 + w) for y in range(y0, bottom)
             if not arch or y > y0 + 6 or ((x + .5 - cx) / (w / 2)) ** 2 + ((y - (y0 + 7)) / 7) ** 2 <= 1}
    s.fill({(x + dx, y + dy) for x, y in shape for dx, dy in ((-2, 0), (2, 0), (0, -2), (-1, 0), (1, 0), (0, -1))}, tr[0])
    s.fill({(x + dx, y + dy) for x, y in shape for dx, dy in ((-1, 0), (0, -1))} - shape, tr[2])
    if kind == 'double':
        for x, y in shape:
            s.set(x, y, WOOD[1] if (x - x0) % 5 == 0 else WOOD[2] if (x - x0) % 5 != 1 else WOOD[3])
        for half in (0, 1):
            hx0 = x0 + half * w // 2
            hw = w // 2
            brace = line(hx0 + 2, y0 + 2, hx0 + hw - 3, bottom - 3) | line(hx0 + hw - 3, y0 + 2, hx0 + 2, bottom - 3)
            brace |= {(x + 1, y) for x, y in brace}
            s.fill(brace | rect(hx0, y0, hw, 2) | rect(hx0, bottom - 2, hw, 2) | rect(hx0, y0, 2, h) | rect(hx0 + hw - 2, y0, 2, h), tr[2])
            s.fill(rect(hx0, y0, hw, 1), tr[3])
        s.fill(rect(cx - 1, y0, 2, h), WOOD[0])
        s.fill(rect(cx - 4, y0 + h // 2, 2, 3) | rect(cx + 2, y0 + h // 2, 2, 3), '#2a2a30')
        return y0
    for x, y in shape:
        s.set(x, y, WOOD[1] if (x - x0) % 5 == 0 else WOOD[2] if (x - x0) % 5 != 1 else WOOD[3])
    if kind == 'shop':
        for x in range(x0 + 3, x0 + w - 3):
            for y in range(y0 + 4, y0 + 20):
                s.set(x, y, mix('#a8d4ec', '#34507a', (y - y0 - 4) / 16))
        s.fill(rect(cx, y0 + 4, 1, 16) | rect(x0 + 3, y0 + 12, w - 6, 1), WOOD[1])
    if kind == 'dutch':
        s.fill(rect(x0, y0 + h // 2 - 1, w, 3), WOOD[0]); s.fill(rect(x0, y0 + h // 2 + 1, w, 1), WOOD[4])
        s.fill(line(x0 + 2, bottom - 3, x0 + w - 3, y0 + h // 2 + 3), WOOD[4])
    else:
        s.fill(rect(x0, y0 + 10, w, 2) | rect(x0, bottom - 12, w, 2), WOOD[0])  # ledges
        s.fill(rect(x0, y0 + 10, w, 1) | rect(x0, bottom - 12, w, 1), WOOD[4])
    s.fill(rect(x0 + w - 5, y0 + h // 2, 2, 3), '#e8c050'); s.set(x0 + w - 5, y0 + h // 2 + 2, '#8a6a20')
    return y0


def step(s, cx, H, w):
    pal = R('#9a948a', 4, 6)
    s.fill(rect(cx - w // 2 - 4, H - 3, w + 8, 3), pal[1]); s.fill(rect(cx - w // 2 - 4, H - 3, w + 8, 1), pal[3])


def porch(s, st, cx, y, w, H):
    pal = R(st['rcol'], 6, 14); tr = R(st['trim'], 4, 8)
    x0 = cx - w // 2
    for xx in (x0 + 2, x0 + w - 5):  # posts
        s.fill(rect(xx, y + 8, 3, H - 2 - y - 8), tr[1]); s.fill(rect(xx, y + 8, 1, H - 2 - y - 8), tr[3])
    for yy in range(y, y + 7):
        for xx in range(x0 - 2, x0 + w + 2):
            s.set(xx, yy, roof_px(st['rmat'], pal, yy - y, xx, 0, 9))
    s.fill(rect(x0 - 2, y + 7, w + 4, 2), tr[2]); s.fill(rect(x0 - 2, y + 9, w + 4, 1), tr[0])
    eave_shadow(s, x0, x0 + w, y + 10, 3)


def awning(s, col, y, x0, x1):
    pal = R(col, 4, 8)
    for x in range(x0, x1):
        stripe = ((x - x0) // 6) % 2
        for yy in range(y, y + 8):
            base = pal[2] if stripe else hx('#f6ecd8')
            s.set(x, yy, mul(base, .88) if yy > y + 5 else base)
        if (x - x0) % 6 in (1, 2, 3, 4):
            s.set(x, y + 8, pal[1] if stripe else hx('#d8ccb4'))
    s.fill(rect(x0, y, x1 - x0, 1), pal[3])
    eave_shadow(s, x0, x1, y + 9, 3)


SIGN_PAL = {'k': '#241812', 'g': '#3a3a42', 'G': '#6a6a78', 's': '#9a9aa8', 'S': '#d0d4dc', 'b': '#6a4426', 'B': '#3a2416', 'c': '#a8743f', 'y': '#e8b830',
            'Y': '#a87a18', 'r': '#c8342a', 'w': '#f6f0e0', 'f': '#f0e2c0', 'a': '#d07a3a', 'A': '#8a4418', 'o': '#4a7ab0', 'O': '#2a4a7a', 'e': '#4a9a3a', 'E': '#2a6a26'}
SIGN_ICONS = {  # 12x9 hand-pixelled trade symbols painted on the board
    'seed': ["....kk......", "...kbck.....", "..kbccck..k.", ".kbcccbck.kyk", ".kbccccbkkyYk", ".kbcccccb.kk.", ".kbbcccbb....", "..kbbbbb.....", "...kkkkk....."],
    'anvil': ["............", "kkkkkkkkkk..", "kSssssssGGk.", ".kkkGGGGkk..", "....kGGk....", "....kGGk....", "...kGGGGk...", "..kkkkkkkk..", "............"],
    'mug': ["..wwwwww....", ".wwwwwwww...", ".kyyyyyyk...", ".kyYyyyykkk.", ".kyYyyyyk.k.", ".kyYyyyyk.k.", ".kyYyyyykkk.", ".kyyyyyyk...", ".kkkkkkkk..."],
    'horse': ["..kkkkkkk...", ".kGsssssGk..", "kGsk...ksGk.", "kSk.....kSk.", "kSk.....kSk.", "kSk.....kSk.", "kGk.....kGk.", "kkk.....kkk.", "............"],
    'saw': ["...........k", "kkkkkkkkkkbk", "kSSSSSSSSkbk", "ksksksksskck", ".k.k.k.k.kbk", "..........kk", "............", "............", "............"],
    'urn': ["....kkkk....", "...kaaaak...", "....kAAk....", "..kaaaaaak..", ".kaawwwaaak.", ".kaAAAAAaak.", "..kaaaaaak..", "...kaaaak...", "...kkkkkk..."],
    'fish': ["............", "..kkkkk..k..", ".kooooook.kk", "koOwkoooookOk", "kooooooooOk.", ".kOOOOOOk.kk", "..kkkkk..k..", "............", "............"],
    'crest': [".kkkkkkkkk..", ".kOOyOOOOk..", ".kOyyyOOOk..", ".kOOyOOOOk..", ".kOOOOrrOk..", "..kOOrrOk...", "...kOOOk....", "....kOk.....", ".....k......"],
}


def sign(s, x, y, icon):
    """A painted trade sign hanging on two chains from a curled iron bracket fixed to the wall at (x, y)."""
    P = SIGN_PAL
    for k in range(20):                                          # the bracket arm with a curl at the wall end
        s.set(x + k, y, P['g']); s.set(x + k, y + 1, P['k'] if k % 5 else P['G'])
    for (dx, dy) in ((0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 2)):
        s.set(x + dx, y + dy, P['g'])
    s.set(x + 1, y + 2, P['g']); s.set(x + 2, y + 3, P['k'])     # brace
    for cx_ in (x + 4, x + 16):                                  # chains
        for k in range(3):
            s.set(cx_, y + 2 + k, P['G'] if k % 2 else P['s'])
    bx, by, W, H = x + 1, y + 5, 20, 15
    for yy in range(by, by + H):                                 # the board: dark frame, painted panel, wood grain
        for xx in range(bx, bx + W):
            edge = yy in (by, by + H - 1) or xx in (bx, bx + W - 1)
            inner = yy in (by + 1, by + H - 2) or xx in (bx + 1, bx + W - 2)
            s.set(xx, yy, P['B'] if edge else P['b'] if inner else P['f'])
    for xx in range(bx + 2, bx + W - 2):
        s.set(xx, by + 2, '#fff8ea')                             # lit top of the panel
        s.set(xx, by + H - 3, '#d8c8a0')
    s.set(bx + 1, by + 1, P['c']); s.set(bx + W - 2, by + H - 2, P['B'])
    g = SIGN_ICONS.get(icon)
    if g:
        ox, oy = bx + 4, by + 3
        for r_, row in enumerate(g):
            for c_, ch in enumerate(row[:13]):
                if ch in P:
                    s.set(ox + c_, oy + r_, P[ch])


# ---- small props by the walls -------------------------------------------------
def barrel(s, x, bottom):
    s.shade(rect(x, bottom - 12, 9, 12), None, 'cyl', colors=['#4a2e1a', '#6e4626', '#8e5e34', '#ae7a46'])
    s.fill(rect(x, bottom - 10, 9, 1) | rect(x, bottom - 3, 9, 1), '#3a3a40')
    s.fill(ellipse(x + 4, bottom - 12, 4.5, 1.5), '#5e3c20')


def crate(s, x, bottom, w=10, h=9):
    s.fill(rect(x, bottom - h, w, h), '#8a5a34'); s.fill(rect(x, bottom - h, w, 1), '#b8844c'); s.fill(rect(x + w - 1, bottom - h, 1, h), '#5e3c20')
    s.fill(line(x + 1, bottom - h + 1, x + w - 2, bottom - 2), '#6e4626')


def lantern(s, x, y):
    s.fill(rect(x, y - 4, 4, 1), '#2a2a30'); s.fill(rect(x + 1, y - 3, 1, 2), '#2a2a30')
    s.fill(rect(x - 1, y - 1, 5, 7), '#2a2a30'); s.fill(rect(x, y, 3, 5), '#ffd060'); s.set(x + 1, y + 1, '#fff6c0')


def woodpile(s, x, bottom, w=22):
    for row in range(3):
        for k in range(x + row * 2, x + w - row * 2, 5):
            cy = bottom - 3 - row * 5
            s.fill(ellipse(k + 2, cy, 2.5, 2.5), '#7e522e'); s.fill(ellipse(k + 2, cy, 1.2, 1.2), '#d8b07a'); s.set(k + 2, cy, '#a8743f')


def haybale(s, x, bottom):
    s.shade(rect(x, bottom - 10, 14, 10), None, 'form', colors=['#8a6a2a', '#b89440', '#d8b85a', '#f0d878'])
    s.fill(rect(x + 4, bottom - 10, 1, 10) | rect(x + 9, bottom - 10, 1, 10), '#8a6a2a')


def ivy(s, x0, y0, y1, r):
    x = x0 + 2
    for y in range(y1, y0, -1):
        x = max(x0, min(x0 + 10, x + r.choice((-1, 0, 0, 1))))
        s.set(x, y, '#2f5e2a')
        if r.random() < .5:
            lx = x + r.choice((-2, -1, 1, 2))
            s.fill({(lx, y), (lx + 1, y), (lx, y - 1)}, '#4f8e3a'); s.set(lx, y - 1, '#7cb854')


def nets(s, x, y, w, h):
    for i in range(w):
        for j in range(h):
            if (i + j) % 4 == 0 or (i - j) % 4 == 0:
                if j < h - abs(i - w // 2) // 3:
                    s.set(x + i, y + j, '#5a5040')
    for k in range(3):
        s.fill(ellipse(x + 3 + k * 6, y + h - 2, 1.5, 1.5), '#d86a3a')


# ---- composition ---------------------------------------------------------------
def window_row(s, st, W, y, wh, avoid, r, ww=16, step_=32):
    out = []
    for i in range(W // step_):
        cx = i * step_ + step_ // 2
        m = 24 if st.get('shut') else 16
        if any(abs(cx - a) < d + (7 if st.get('shut') else 0) for a, d in avoid) or cx < m or cx > W - m:
            continue
        if st.get('arched'):
            window(s, cx, y, ww - 2, wh + 4, st['trim'], arch=True, lintel='#c8c2b2')
        else:
            window(s, cx, y, ww, wh, st['trim'], st.get('shut'), st.get('boxes'), r, lintel=None)
        out.append(cx)
    return out


def building(kind, w, h, lvl=1, winter=False):
    global WINTER
    WINTER = winter
    try:
        return _building(kind, w, h, lvl)
    finally:
        WINTER = False


def _building(kind, w, h, lvl=1):
    W, H = w * 32, h * 32
    st = dict(STY[kind])
    if kind in LEVELS:
        st.update(level_style(kind, lvl))
    s = Canvas(W, H)
    WINLOG.clear()
    seed = w * 13 + h * 7 + len(kind) * 31
    r = rng(seed + lvl)
    ov = 4
    fnd = 7 if st.get('stonefnd', True) else 4
    stilt = 16 if st.get('stilts') else 0
    Hb = H - stilt  # stilt houses stand on posts above the sand
    gy = Hb - fnd  # top of the foundation
    dcx = (w // 2) * 32 + 16
    meta = {}
    form = st['roof']
    if form in ('side', 'hip', 'flat'):
        ey = round(H * st['rf'])
        ry = max(7, round(ey * (.26 if form == 'side' else .3)))
        wall_top = ey - 3
        paint_wall(s, rect(ov, wall_top, W - 2 * ov, gy - wall_top), st['wmat'], st['wcol'], seed)
        if st.get('lower'):
            split = gy - 50
            paint_wall(s, rect(ov, split, W - 2 * ov, gy - split), st['lower'], '#a8a296', seed + 1)
            tr = R(st['trim'], 4, 8)
            s.fill(rect(ov, split - 3, W - 2 * ov, 3), tr[1]); s.fill(rect(ov, split - 3, W - 2 * ov, 1), tr[3])
            eave_shadow(s, ov, W - ov, split, 2)
        if st.get('timber'):
            timber(s, st, ov, wall_top, W - ov, (gy - 50 - 3) if st.get('lower') else gy, dcx)
        foundation(s, ov - 1, W - ov + 1, gy, Hb, st.get('fcol', '#8a8478'))
        wall_edges(s, ov, wall_top, W - ov, gy, st['wcol'])
        grime(s, ov, W - ov, gy)
        hip = round((ey - 1) * .55) if form == 'hip' else 0
        fy = roof_flat(s, st, W, ey, seed) if form == 'flat' else roof_side(s, st, W, ry, ey, hip, seed)
        if st.get('snow'):
            snowcap(s, W, ry, fy)
        if st.get('icicles'):
            for x in range(3, W - 3, 4):
                L = 2 + (x * 7) % 5
                for k in range(L):
                    s.set(x, ey + k, '#e8f6ff' if k < L - 1 else '#9ad0f0'); 
                s.set(x + 1, ey, '#bfe6f5')
        eave_shadow(s, ov, W - ov, ey)
        if st.get('cross'):
            gw = 30 if W >= 200 else 24
            cross_gable(s, st, dcx, gw, ry + 4, ey + 2, seed, 'boards' if kind == 'house' else None)
            gwin = (ry + 4 + ey) // 2 + 2
            window(s, dcx, gwin, 10, 11, st['trim'], arch=kind == 'manor')
        if st.get('dormers'):
            for k in range(st['dormers']):
                dormer(s, st, W * (k + 1) // (st['dormers'] + 1) + (8 if k == 0 else -8), ey - 8, seed)
        if st.get('cupola'):
            cupola(s, st, W // 2 - (24 if kind == 'stable' else 0), ry, st.get('vane'))
        body_top = ey
    else:
        knee = None
        ey = round(H * st['rf'])
        D = round(H * (.3 if form == 'gambrel' else .26))
        ax = W // 2
        if form == 'gambrel':
            kx, kd = round(W * .2), .62
            knee = ax - kx

            def prof(x):
                d = abs(x - ax)
                if d <= knee:
                    return round(D + (ey - D) * (1 - kd) * d / knee)
                return round(D + (ey - D) * (1 - kd) + (ey - D) * kd * (d - knee) / max(1, ax - knee))
        else:
            def prof(x):
                return round(D + (ey - D) * abs(x - ax) / ax)
        wall = {(x, y) for x in range(ov, W - ov) for y in range(prof(x), gy)}
        paint_wall(s, wall, st['wmat'], st['wcol'], seed)
        if st['wmat'] == 'glass':  # low brick knee wall under the glass
            paint_wall(s, rect(ov, gy - 14, W - 2 * ov, 14), 'brick', '#9a5040', seed)
        if st.get('trimpaint'):
            tr = R(st['trim'], 4, 8)
            for x in range(ov, W - ov):
                for y in range(prof(x), prof(x) + 3):
                    s.set(x, y, tr[2])
            s.fill(rect(ov, ey, 3, gy - ey) | rect(W - ov - 3, ey, 3, gy - ey), tr[2])
        foundation(s, ov - 1, W - ov + 1, gy, Hb)
        wall_edges(s, ov, D, W - ov, gy, st['wcol'])
        grime(s, ov, W - ov, gy)
        roof_front(s, st, W, prof, D, ax, knee, seed)
        for x in range(ov, W - ov):  # shadow under the bargeboard
            for y in range(prof(x), prof(x) + 3):
                c = s.get(x, y)
                if c[3] and (y < prof(x) + 2 or (x + y) % 2):
                    s.set(x, y, mul(c, .7))
        if st.get('loft'):  # hayloft door with a hoist beam
            ly = prof(ax) + 8
            s.fill(rect(ax - 1, ly - 9, 3, 7), R(st['trim'], 4, 8)[1]); s.fill(rect(ax, ly - 2, 1, 3), '#3a3a40')
            tr = R(st['trim'], 4, 8)
            s.fill(rect(ax - 11, ly, 22, 20), tr[2]); s.fill(rect(ax - 9, ly + 2, 18, 16), WOOD[1])
            for k in range(ax - 9, ax + 9, 4):
                s.fill(rect(k, ly + 2, 1, 16), WOOD[0])
            s.fill(line(ax - 9, ly + 2, ax + 8, ly + 17) | line(ax + 8, ly + 2, ax - 9, ly + 17), tr[2])
        elif st['wmat'] != 'glass':
            gwy = (prof(ax) + ey) // 2 - 4
            if kind == 'coop':
                s.fill(ellipse(ax, gwy + 6, 6, 6), R(st['trim'], 4, 8)[0]); s.fill(ellipse(ax, gwy + 6, 4, 4), '#2a1e16')  # round vent
                for k in (-2, 0, 2):
                    s.fill(rect(ax - 4, gwy + 6 + k, 9, 1), R(st['trim'], 4, 8)[2])
            else:
                window(s, ax, gwy, 12, 13, st['trim'])
        if st.get('cupola'):
            cupola(s, st, ax, D - 2, st.get('vane'))
        body_top = ey
    # door, windows, extras
    dk = st.get('door', 'plank')
    dh = min(46, gy - body_top - 6)
    if st.get('portico'):
        portico(s, st, dcx, body_top, H)
    dtop = door(s, dcx, Hb, dk, st['trim'], dh)
    if stilt:
        stilts(s, st, W, ov, Hb, H, dcx)
    else:
        step(s, dcx, H, 44 if dk == 'double' else 22)
    avoid = [(dcx, 34 if dk == 'double' else 24)]
    if st.get('portico'):
        avoid = [(dcx, 40)]
    wy = body_top + (10 if body_top < gy - 70 else 6)
    if st.get('shopwin'):
        shop_window(s, ov + 8, gy - 34, dcx - 14 - ov - 16, 26, st['trim'])
        shop_window(s, dcx + 18, gy - 34, W - ov - 8 - dcx - 18, 26, st['trim'])
    elif st['wmat'] != 'glass' and not st.get('nowin'):
        if form in ('front', 'gambrel'):
            wy = gy - 40
        if st.get('stalls'):
            for i in range(w):
                cx = i * 32 + 16
                if abs(cx - dcx) > 20:
                    door(s, cx, H, 'dutch', st['trim'], dh - 8, 18)
        elif kind == 'tavern':
            window_row(s, st, W, body_top + 8, 14, [], r)
            window_row(s, st, W, gy - 38, 18, avoid, r)
        else:
            tall = 24 if st.get('tall') else 18
            window_row(s, st, W, wy, min(tall, dtop - wy - 4) if dtop - wy - 4 > 10 else tall, avoid, r)
    if st.get('awning'):
        awning(s, st['awning'], gy - 46, ov + 4, W - ov - 4)
    if st.get('porch'):
        porch(s, st, dcx, dtop - 12, 40, H)
    if st.get('hen'):  # hen door and ramp
        hx0 = W - ov - 30
        s.fill(rect(hx0, gy - 12, 10, 10), WOOD[0]); s.fill(rect(hx0 + 1, gy - 11, 8, 9), '#1e140e')
        s.fill(line(hx0 - 4, H - 1, hx0 + 9, gy - 2) | line(hx0 - 3, H - 1, hx0 + 10, gy - 2), WOOD[3])
        for k in range(3):
            s.set(hx0 - 1 + k * 4, H - 2 - k * 3, WOOD[0])
    if st.get('chim'):
        mat, off = st['chim']
        cx = off if off >= 0 else W + off
        top = 4 if form in ('side', 'hip') else 2
        meta['chim'] = chimney(s, cx, top - (0 if mat != 'forge' else 0), (ry if form in ('side', 'hip') else 20) + (22 if mat == 'forge' else 10), mat)
        if st.get('chim2'):
            chimney(s, W - cx - 9, top, ry + 10, mat)
    if st.get('lantern'):
        lantern(s, dcx + 16, dtop + 6)
    if st.get('icon'):
        sign(s, dcx - 36 if kind != 'tavern' else dcx + 16, max(body_top + 2, dtop - 2), st['icon'])
    if st.get('barrels'):
        barrel(s, W - ov - 13, H - 1); barrel(s, W - ov - 23, H - 1)
    if st.get('crates'):
        crate(s, dcx + 16, H - 1); crate(s, dcx + 27, H - 1, 9, 7)
    if st.get('coal'):
        s.shade(ellipse(ov + 14, H - 4, 9, 4), None, 'sphere', colors=['#14141a', '#24242c', '#3a3a44', '#5a5a64'])
    if st.get('hay'):
        haybale(s, ov + 4, H - 1); haybale(s, ov + 6, H - 11)
    if st.get('lumber'):
        woodpile(s, ov + 2, H - 1, 26)
    if st.get('wood'):
        woodpile(s, W - ov - 24, H - 1, 22)
    if st.get('nets'):
        nets(s, ov + 6, body_top + 6, 18, 14)
    if st.get('ivy'):
        ivy(s, ov, body_top, gy, r)
    if st.get('banners'):
        for bx_ in (ov + 10, W - ov - 18):
            pal = R(st['banners'], 4, 8)
            s.fill(rect(bx_ - 1, body_top + 4, 10, 2), '#3a2a1a')
            s.fill(poly([(bx_, body_top + 6), (bx_ + 8, body_top + 6), (bx_ + 8, body_top + 32), (bx_ + 4, body_top + 28), (bx_, body_top + 32)]), pal[2])
            s.fill(rect(bx_, body_top + 6, 1, 26), pal[3]); s.fill(rect(bx_ + 7, body_top + 6, 1, 24), pal[1])
            s.fill(ellipse(bx_ + 4, body_top + 15, 2, 2), '#e8c050')
    s.outline()
    meta['win'] = [list(w_) for w_ in WINLOG]
    s.meta = meta
    return s


def timber(s, st, x0, y0, x1, y1, dcx):
    """Exposed oak frame: corner posts, a rail at window height, braces in the end bays."""
    tr = R(st['trim'], 4, 8)
    rail = y0 + (y1 - y0) // 2 + 6
    for x in (x0, x1 - 4):
        s.fill(rect(x, y0, 4, y1 - y0), tr[1]); s.fill(rect(x, y0, 1, y1 - y0), tr[3])
    s.fill(rect(x0, y0, x1 - x0, 3), tr[1])
    s.fill(rect(x0, rail, x1 - x0, 3), tr[1]); s.fill(rect(x0, rail, x1 - x0, 1), tr[3])
    for bx0, bx1 in ((x0 + 4, x0 + 16), (x1 - 4, x1 - 16)):
        for t in range(2):
            s.fill(line(bx0, rail - 1 - t, bx1, y0 + 4 - t) if bx0 < bx1 else line(bx0, rail - 1 - t, bx1, y0 + 4 - t), tr[1])


def portico(s, st, cx, top, H):
    """Columns and a pediment in front of the door (museum)."""
    tr = R('#d8d2c4', 4, 8)
    x0, x1 = cx - 34, cx + 34
    ped = top + 4
    for x in range(x0, x1):
        e = ped + abs(x - cx) * 12 // 34
        for y in range(e, ped + 14):
            s.set(x, y, tr[2] if y > e + 1 else tr[3])
    s.fill(rect(x0 - 2, ped + 14, x1 - x0 + 4, 3), tr[1]); s.fill(rect(x0 - 2, ped + 14, x1 - x0 + 4, 1), tr[3])
    s.fill(ellipse(cx, ped + 9, 3, 3), '#c8703a')
    for x in (x0 + 2, x0 + 14, x1 - 21, x1 - 9):
        s.shade(rect(x, ped + 17, 7, H - 4 - ped - 17), None, 'cyl', colors=['#a8a294', '#d8d2c4', '#f4f0e6', '#ffffff'])
        s.fill(rect(x - 1, ped + 17, 9, 2), tr[2]); s.fill(rect(x - 1, H - 6, 9, 2), tr[1])
    eave_shadow(s, x0, x1, ped + 17, 3)


def snowcap(s, W, ry, fy):
    for x in range(4, W - 4):
        depth = 3 + round(vnoise(x * .15, 1, 5) * 7)
        for y in range(1, ry + depth):
            c = s.get(x, y)
            if c[3]:
                s.set(x, y, '#c8d8e8' if y >= ry + depth - 1 else '#e4ecf6' if y < 3 or y > ry + depth - 3 else '#f6fafe')
        d2 = 2 + round(vnoise(x * .3, 2, 5) * 3)
        for y in range(fy - d2, fy):
            c = s.get(x, y)
            if c[3]:
                s.set(x, y, '#e8f0f8' if y > fy - d2 else '#c8d8e8')


def roof_flat(s, st, W, ey, seed):
    """Flat roof seen from above: packed clay with a parapet lip and a couple of vents."""
    pal = R(st['rcol'], 6, 14); wl = R(st['wcol'], 5, 10)
    for y in range(1, ey - 6):
        for x in range(2, W - 2):
            n = vnoise(x * .12, y * .12, seed)
            c = pal[3] if n > .78 else pal[1] if n < .14 else pal[2]
            if x % 12 == 0 or y % 10 == 0:  # laid clay slabs
                c = pal[1]
            s.set(x, y, c)
    s.fill(rect(1, 1, W - 2, 3), wl[3]); s.fill(rect(1, 1, 3, ey - 6), wl[3]); s.fill(rect(W - 4, 1, 3, ey - 6), wl[1])
    for x in range(1, W - 1):  # parapet with crenels along the front edge
        top = ey - 6 - (3 if (x // 8) % 2 == 0 else 0)
        for y in range(top, ey):
            s.set(x, y, wl[3] if y == top else wl[1] if y >= ey - 2 else wl[2])
    for vx in (W // 4, 3 * W // 4):
        s.shade(rect(vx - 4, 8, 8, 6), None, 'form', colors=R('#6a5a4a', 4, 8))
        s.fill(rect(vx - 3, 8, 6, 1), '#2a2018')
    return ey - 3


def stilts(s, st, W, ov, Hb, H, dcx):
    """Posts under the floor and a short stair down from the door."""
    wood = R('#6a4a2e', 4, 8)
    s.fill(rect(ov - 2, Hb - 3, W - 2 * ov + 4, 3), wood[2]); s.fill(rect(ov - 2, Hb - 3, W - 2 * ov + 4, 1), wood[3])
    for x in range(ov, W - ov, 18):
        s.shade(rect(x, Hb, 5, H - Hb), None, 'cyl', colors=wood)
    for k in range(4):
        y = Hb + k * 4
        s.fill(rect(dcx - 10 - k, y, 20 + 2 * k, 3), wood[2]); s.fill(rect(dcx - 10 - k, y, 20 + 2 * k, 1), wood[3])


def tent(kind, w, h):
    """A hide tent on poles (Emberwaste)."""
    W, H = w * 32, h * 32
    s = Canvas(W, H)
    hide = R('#9a6a4a', 5, 10)
    ax, top = W // 2, 6
    for x in range(4, W - 4):
        y0 = top + round(abs(x - ax) * (H - 18 - top) / (ax - 4))
        for y in range(y0, H - 3):
            c = hide[3] if x < ax else hide[1]
            if (x - ax) % 12 == 0:
                c = hide[0]
            if y - y0 < 2:
                c = hide[4] if x < ax else hide[2]
            s.set(x, y, c)
    for x in range(ax - 14, ax + 14):  # stitched patches
        if x % 3 == 0:
            s.set(x, H // 2 + 6, hide[0])
    door_ = poly([(ax - 12, H - 3), (ax, H // 2 - 2), (ax + 12, H - 3)])
    s.fill(door_, '#2a1a12')
    s.fill(line(ax, H // 2 - 2, ax - 12, H - 3) | line(ax, H // 2 - 2, ax + 12, H - 3), hide[4])
    for px_ in (ax - 2, ax + 1):
        s.fill(line(px_, top - 6, px_ + (px_ - ax) * 3, top + 4), '#5a3a22')
    s.fill(rect(ax + 18, top + 10, 1, 14), '#3a2a1a'); s.fill(poly([(ax + 19, top + 10), (ax + 30, top + 13), (ax + 19, top + 16)]), '#c8401a')
    s.outline()
    s.meta = {}
    return s


def level_style(kind, lvl):
    """Farm buildings look better as they're upgraded: painted trim, more windows, stone
    footing, a cupola and finally a weathervane and flower boxes."""
    o = {}
    if lvl >= 2:
        o['shut'] = '#4a6a8a' if kind == 'coop' else None
        o['trimpaint'] = 1
    if lvl == 1:
        o['stonefnd'] = False
        if kind != 'stable':
            o['nowin'] = 1
    if lvl >= 3:
        o['cupola'] = 1
    if lvl >= 4 or (kind == 'stable' and lvl >= 3):
        o['vane'] = 1; o['boxes'] = 1; o['lantern'] = 1
    if kind == 'barn' and lvl >= 2:
        o['hay'] = 1
    return o


MOUTH = {  # dungeon entrances: mound colours, frame, and what glows inside
    None: dict(hill=['#4a4036', '#6a5e4e', '#8c7e68', '#b0a28a', '#c8bca4'], grass='#5a9a40', inner=('#140c08', '#2a1e16'), frame='wood'),
    'hm': dict(hill=['#3e3e44', '#5a5a62', '#7a7a82', '#9a9aa2', '#b8b8c0'], grass='#5a8a3a', inner=('#0e0c0a', '#221a14'), frame='stone', glow='#ffb04a'),
    'fm': dict(hill=['#6a8ab0', '#9ab8d8', '#c8e0f0', '#e8f4fc', '#ffffff'], grass=None, inner=('#0e1a2a', '#1e3048'), frame='ice', glow='#7ae8ff'),
    'ew': dict(hill=['#1e1a1c', '#2e282a', '#443a3a', '#5e5050', '#7a6a66'], grass=None, inner=('#2a0a04', '#5a1a08'), frame='basalt', glow='#ff6a1a'),
    'sr': dict(hill=['#6a5a4a', '#8a7a62', '#b0a07e', '#cfc09a', '#e8dcb8'], grass='#3a8a7a', inner=('#0a1a22', '#12303a'), frame='drift', glow='#7affe8'),
}


def mine(w, h, style=None):
    M = MOUTH[style]
    W, H = w * 32, h * 32
    s = Canvas(W, H)
    r = rng(5 + len(style or ''))
    hill = {(x, y) for x in range(W) for y in range(H) if ((x + .5 - W / 2) / (W * .52)) ** 2 + ((y + .5 - H) / (H * .98)) ** 2 <= 1 + (vnoise(x * .2, y * .2, 3) - .5) * .12}
    s.shade(hill, None, 'form', colors=M['hill'])
    for _ in range(9):  # boulders on the mound
        bx, by = r.randrange(10, W - 10), r.randrange(16, H - 30)
        s.shade(ellipse(bx, by, r.uniform(4, 7), r.uniform(3, 5)) & hill, None, 'sphere', colors=M['hill'][1:])
    for _ in range(14):  # tufts of grass on top
        gx, gy = r.randrange(8, W - 8), r.randrange(8, 30)
        if (gx, gy) in hill and M['grass']:
            s.fill({(gx, gy), (gx - 1, gy + 1), (gx + 1, gy + 1)}, M['grass']); s.set(gx, gy - 1, '#8cc256')
    cx = W // 2
    mouth = {(x, y) for x in range(cx - 18, cx + 18) for y in range(H - 50, H) if y > H - 36 or ((x + .5 - cx) / 18) ** 2 + ((y - (H - 36)) / 14) ** 2 <= 1}
    for x, y in mouth:
        s.set(x, y, M['inner'][0] if y > H - 40 else M['inner'][1])
    wood = {'wood': ['#4a2e1a', '#7a4e2c', '#a8743f', '#c8925a'], 'stone': ['#3a3a40', '#5a5a64', '#8a8a94', '#b0b0ba'], 'ice': ['#5a8ab8', '#9ad0f0', '#d8f2ff', '#ffffff'],
            'basalt': ['#141012', '#2a2226', '#3e3438', '#5a4c50'], 'drift': ['#6a6a6a', '#9a948a', '#c0b8aa', '#e0d8c8']}[M['frame']]
    if M.get('glow'):  # light deep inside the mouth
        for x, y in mouth:
            if y > H - 30 and ((x - cx) / 12) ** 2 + ((y - (H - 10)) / 14) ** 2 < 1 and (x + y) % 2 == 0:
                s.blend(x, y, M['glow'], .35)
    if M['frame'] == 'ice':
        for x in range(cx - 26, cx + 26, 4):
            for k in range(3 + (x * 5) % 6):
                s.set(x, H - 52 + 6 + k, '#e8f6ff')
    if M['frame'] == 'stone':  # carved runes on the lintel
        for k in range(-20, 20, 6):
            s.fill({(cx + k, H - 50), (cx + k + 1, H - 49), (cx + k + 2, H - 50)}, '#ffb04a')
    for px_ in (cx - 22, cx + 18):
        s.shade(rect(px_, H - 46, 5, 46), None, 'cyl', colors=wood)
    s.shade(rect(cx - 26, H - 52, 52, 6), None, 'cyl_side', colors=wood)
    s.fill(rect(cx + 24, H - 36, 5, 7), '#3a2a1a'); s.fill(rect(cx + 25, H - 35, 3, 5), M.get('glow') or '#ffd060')  # lantern
    for k in range(3):  # rails
        s.fill(rect(cx - 10, H - 8 + k * 3, 20, 1), '#6a6a74')
    s.fill(rect(cx - 7, H - 9, 2, 9) | rect(cx + 5, H - 9, 2, 9), '#5a4a3a')
    s.outline()
    s.meta = {}
    return s


def stall(awn='#c8342a', goods=None):
    W, H = 96, 64
    s = Canvas(W, H)
    r = rng(8)
    for x in (6, W - 10):
        s.shade(rect(x, 14, 4, 46), None, 'cyl', colors=['#3a2218', '#5a3622', '#7a4c2c', '#9a6638'])
    s.shade(rect(2, 36, W - 4, 22), None, 'form', colors=['#5a3a22', '#8a5a34', '#b07c4c', '#c8985e'])
    for x in range(4, W - 4, 8):
        s.fill(rect(x, 36, 1, 22), '#5a3a22')
    s.fill(rect(2, 36, W - 4, 2), '#e0b47a')
    for x in range(0, W):  # striped awning with a scalloped hem
        stripe = (x // 12) % 2
        for y in range(4, 18):
            s.set(x, y, awn if stripe else '#f6ecd8')
        if x % 12 in (4, 5, 6, 7):
            s.set(x, 18, mix(awn, '#000000', .2) if stripe else '#d8ccb4'); s.set(x, 19, mix(awn, '#000000', .2) if stripe else '#d8ccb4')
    s.fill(rect(0, 3, W, 1), '#f8ead0')
    for i in range(7):  # produce crates on the counter
        x = 8 + i * 12
        s.fill(rect(x, 30, 10, 6), '#7a5030')
        col = r.choice(goods or ['#d8342a', '#ef8a2c', '#7fc85a', '#f2cf3a', '#7a3a9a'])
        for k in range(4):
            s.fill(rect(x + 1 + (k % 2) * 4, 27 + (k // 2) * 2, 3, 3), col)
    s.outline()
    s.meta = {}
    return s


def silo():
    """A round board silo on a stone footing with a copper dome (3x4 tiles)."""
    W, H = 96, 128
    s = Canvas(W, H)
    cx, r0, top = W // 2, 26, 38
    wall = rect(cx - r0, top, 2 * r0, H - top - 14)
    s.shade(wall, None, 'cyl', colors=['#4a1a16', '#6a261e', '#8a3428', '#a8482e', '#c4603e'])
    for y in range(top + 6, H - 14, 8):  # board courses
        for x in range(cx - r0, cx + r0):
            s.blend(x, y, '#2a0e0a', .35)
    for y in (top + 18, top + 52):  # iron hoops
        s.shade(rect(cx - r0, y, 2 * r0, 3), None, 'cyl', colors=['#2a2a30', '#44444c', '#6a6a74', '#9090a0'])
    s.shade(rect(cx - r0 - 3, H - 16, 2 * r0 + 6, 14), None, 'form', colors=['#4a4640', '#6a645a', '#8e887e', '#b0aa9e'])
    for x in range(cx - r0 - 1, cx + r0 + 3, 9):
        s.fill(rect(x, H - 15, 1, 12), '#4a4640')
    s.fill(rect(cx - r0 - 3, H - 9, 2 * r0 + 6, 1), '#5a5650')
    dome = {(x, y) for x, y in ellipse(cx, top, r0 + 3, 26) if y <= top}
    s.shade(dome, None, 'sphere', colors=['#26443c', '#356456', '#4e8672', '#72a892', '#a2ccb8'])
    for k in range(-r0, r0 + 1, 8):  # standing seams
        s.fill(line(cx + k // 3, top - 25, cx + k, top), '#2e5248')
    s.shade(rect(cx - r0 - 4, top - 1, 2 * r0 + 8, 4), None, 'cyl_side', colors=['#1e342e', '#2e5248', '#4e8672', '#72a892'])
    s.shade(rect(cx - 4, top - 31, 8, 6), None, 'cyl', colors=['#26443c', '#4e8672', '#72a892', '#a2ccb8'])  # vent cap
    s.fill(rect(cx - 6, top + 26, 12, 10), '#2a160e'); s.fill(rect(cx - 6, top + 26, 12, 1), '#c4603e')  # hay hatch
    s.fill(rect(cx - 2, top + 26, 1, 10), '#5a3622')
    s.fill(rect(cx - 9, H - 46, 18, 32), '#3a2214')  # door
    for x in range(cx - 9, cx + 9, 6):
        s.fill(rect(x, H - 46, 1, 32), '#24140c')
    s.fill(rect(cx - 9, H - 46, 18, 2), '#7a4c2c'); s.fill(line(cx - 8, H - 44, cx + 8, H - 16), '#5a3622')
    for k in range(5):  # straw poking out under the hatch
        s.set(cx - 4 + k * 2, top + 37, '#e0c060')
    s.outline()
    s.meta = {}
    return s


def winterize(c):
    """Snow on whatever faces the sky: the top 3-7 px of every column's silhouette."""
    W, H = c.w, c.h
    px_ = c.img.load()
    for x in range(W):
        top = next((y for y in range(H) if px_[x, y][3] > 0), None)
        if top is None:
            continue
        depth = 3 + int(vnoise(x * .18, 2, 9) * 5)
        for k in range(depth):
            y = top + k
            if y >= H or px_[x, y][3] == 0:
                break
            px_[x, y] = (255, 255, 255, 255) if k == 0 else (238, 243, 248, 255) if k < depth - 1 else (200, 214, 230, 255)
        for y in range(top + depth, H - 1):  # snow also sits on ledges: any pixel with open sky right above it
            if px_[x, y][3] and px_[x, y - 1][3] == 0 and px_[x, y + 1][3] and y < H - 6:
                px_[x, y] = (238, 243, 248, 255)
    return c


SPRITES = {f'bld_{k}_{w}x{h}': (lambda k=k, w=w, h=h: mine(w, h) if k == 'mine' else building(k, w, h)) for k, w, h in SIZES}
SPRITES['bld_stall_3x2'] = stall
for st_, (awn, goods) in {'hm': ('#2a4a8a', ['#f2d878', '#8a8a94', '#c8b080', '#5a8a3a']), 'fm': ('#4a7ab0', ['#e8f0fa', '#9ad0f0', '#8a6a48', '#c8d8e8']),
                          'ew': ('#8a1a0a', ['#ff6a1a', '#3a2a4a', '#ffd040', '#c8401a']), 'sr': ('#2a8a9a', ['#e8d8c8', '#ff7a7a', '#4ad8e8', '#9ab8a8'])}.items():
    SPRITES[f'bld_{st_}_stall_3x2'] = (lambda a=awn, g=goods: stall(a, g))
    SPRITES[f'bld_dg_{st_}_5x4'] = (lambda st_=st_: mine(5, 4, st_))
SPRITES['bld_ew_tent_4x3'] = lambda: tent('ew_tent', 4, 3)
SPRITES['bld_silo_3x4'] = silo
for k, w, h in SIZES:
    for lv in range(2, LEVELS.get(k, 1) + 1):
        SPRITES[f'bld_{k}_{w}x{h}_l{lv}'] = (lambda k=k, w=w, h=h, lv=lv: building(k, w, h, lv))


def ruined(c, seed=17):
    """The greenhouse before it's repaired: panes smashed or missing, cracks, vines up the frame.
    Each pane (glass bounded by the frame bars) is broken as a whole."""
    r = rng(seed)
    px_ = c.img.load()
    W, H = c.w, c.h
    glass = lambda q: q[3] and q[2] > 190 and q[1] > 190 and q[2] >= q[0] - 12 and not (q[0] > 225 and q[1] > 230 and q[2] < 232)
    seen = set()
    for y0 in range(H):
        for x0 in range(W):
            if (x0, y0) in seen or not glass(px_[x0, y0]):
                continue
            pane, stack = [], [(x0, y0)]; seen.add((x0, y0))
            while stack:
                x, y = stack.pop(); pane.append((x, y))
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and glass(px_[nx, ny]):
                        seen.add((nx, ny)); stack.append((nx, ny))
            if len(pane) < 6:
                continue
            xs = [p_[0] for p_ in pane]; ys = [p_[1] for p_ in pane]; mx, my, Mx, My = min(xs), min(ys), max(xs), max(ys)
            big = len(pane) > 300  # the roof's panes run together: break those by pane-sized cells instead
            fates = {}
            for x, y in pane:
                key = (x // 10, y // 8) if big else 0
                if key not in fates:
                    fates[key] = r.random()
                v = fates[key]
                if big:
                    mx, my, Mx, My = x - x % 10, y - y % 8, x - x % 10 + 9, y - y % 8 + 7
                if v < .28:  # gone: the dark, overgrown inside, a shard left in one corner
                    if (x - mx) + (y - my) > 2:
                        px_[x, y] = (34, 52, 40, 255) if (x * 3 + y) % 7 else (58, 86, 56, 255)
                elif v < .5:  # cracked corner to corner
                    t = (x - mx) / max(1, Mx - mx)
                    if abs((y - my) - t * (My - my)) < .6:
                        px_[x, y] = (110, 130, 140, 255)
                elif v < .62:  # grimy
                    q = px_[x, y]; px_[x, y] = (q[0] * 80 // 100, q[1] * 85 // 100, q[2] * 82 // 100, 255)
    for _ in range(7):  # vines climbing from the ground
        x = r.randrange(6, W - 6)
        for y in range(H - 4, H - r.randrange(18, 46), -1):
            x = max(2, min(W - 3, x + r.choice((-1, 0, 0, 1))))
            if px_[x, y][3]:
                px_[x, y] = (47, 94, 42, 255)
            if r.random() < .45:
                lx = x + r.choice((-2, -1, 1, 2))
                if 0 <= lx < W and px_[lx, y][3]:
                    px_[lx, y] = (79, 142, 58, 255)
                    if y > 0 and px_[lx, y - 1][3]:
                        px_[lx, y - 1] = (124, 184, 84, 255)
    for x in range(4, W - 4, 3):  # weeds at the foot
        h = r.randrange(2, 6)
        for k in range(h):
            if px_[x, H - 3 - k][3]:
                px_[x, H - 3 - k] = (79, 142, 58, 255) if k < h - 1 else (124, 184, 84, 255)
    return c


SPRITES['bld_greenhouse_6x5_ruin'] = lambda: ruined(building('greenhouse', 6, 5))

for _n in list(SPRITES):
    if not _n.startswith('bld_'):
        continue
    _p = _n[4:].split('_')
    _lv = int(_p[-1][1:]) if _p[-1].startswith('l') and _p[-1][1:].isdigit() else 1
    _wh = [x for x in _p if 'x' in x and x.replace('x', '').isdigit()]
    _kind = '_'.join(_p[:_p.index(_wh[0])]) if _wh else None
    if _kind in STY and _wh and not _n.endswith('_ruin'):
        _w, _h = map(int, _wh[0].split('x'))
        SPRITES[_n + '_w'] = (lambda k=_kind, w=_w, h=_h, lv=_lv: winterize(building(k, w, h, lv, True)))
    else:
        SPRITES[_n + '_w'] = (lambda fn=SPRITES[_n]: winterize(fn()))
