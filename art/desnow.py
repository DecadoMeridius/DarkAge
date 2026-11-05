"""Takes the snow off a painting whose summer look was painted with snow (the storage shed, bld_cabin_4x3: the model won't
remove it in an edit). Snow above the eave line becomes roof copied from further down the same column, a whole shingle row at a
time; icicles and drifts below it take the colour of the nearest wall pixel beside them.

    python art/desnow.py <in.png> <out.png> [eave fraction]
"""
import sys
from PIL import Image

def snowy(p):
    r, g, b, a = p; return a > 40 and min(r, g, b) > 170 and max(r, g, b) - min(r, g, b) < 45

def desnow(im, eave=None):
    im = im.convert('RGBA'); W, H = im.size; px = im.load()
    if eave is None:   # the eave: the lowest row that is still mostly snow
        rows = [sum(snowy(px[x, y]) for x in range(W)) / W for y in range(H)]
        eave = max((y for y in range(H // 2) if rows[y] > .25), default=H // 4)
    else: eave = int(H * eave)
    per = max(4, H // 14)
    from PIL import ImageFilter
    m = Image.new('L', (W, H)); mp = m.load()
    for x in range(W):
        for y in range(H): mp[x, y] = 255 if snowy(px[x, y]) else 0
    m = m.filter(ImageFilter.MaxFilter(5)); mp = m.load()
    def lit(p): return p[3] > 40 and min(p[:3]) > 105
    S = {(x, y) for x in range(W) for y in range(H) if mp[x, y] and (snowy(px[x, y]) or lit(px[x, y]))}
    out = im.copy(); op = out.load()
    for x in range(W):
        for y in range(H):
            if (x, y) not in S: continue
            if y <= eave + 2:
                for k in range(1, 12):
                    yy = y + k * per
                    if yy < H and (x, yy) not in S and px[x, yy][3] > 200: op[x, y] = px[x, yy][:3] + (255,); break
            else:
                for d in range(1, 30):
                    hit = [px[xx, y] for xx in (x - d, x + d) if 0 <= xx < W and (xx, y) not in S and px[xx, y][3] > 200]
                    if hit: op[x, y] = hit[0][:3] + (255,); break
    return out

if __name__ == '__main__':
    e = float(sys.argv[3]) if len(sys.argv) > 3 else None
    desnow(Image.open(sys.argv[1]), e).save(sys.argv[2])
