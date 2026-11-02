# decode style templates the way x_artstyle.js will, for a quick look: python preview_tmpl.py <key> <names...>
import sys, numpy as np
import sys as _s; _s.argv_ = _s.argv[1:]; sys.argv = ['style_build.py', 'painterly']
src = open('style_build.py', encoding='utf-8').read().split("if __name__ == '__main__':")[0]
g = {'__file__': 'style_build.py', '__name__': 'x'}; exec(src, g)
from PIL import Image
key, names = sys.argv_[0], sys.argv_[1:]

got = g['templates'](key, names)
def ramp(h):
    b = np.array([int(h[i:i+2], 16) for i in (1, 3, 5)], float); return [b * .45, b * .7, b, np.minimum(255, b * 1.3)]
R = [ramp('#5a8a3a'), ramp('#6a4a3a')] + [ramp('#888888')] * 30
tiles = []
for n in names:
    a = np.asarray(got[n][0]).astype(float); o = a.copy()
    m = a[..., 2] == 254
    ch = a[..., 0].astype(int); lv = (a[..., 1] - 20) / 200 * 3
    for c in np.unique(ch[m]):
        mm = m & (ch == c); L = np.clip(lv[mm], -1, 3.4); r = R[c]
        i0 = np.clip(np.floor(L), 0, 2).astype(int); t = (L - i0)[:, None]
        col = np.array(r)[i0] * (1 - t) + np.array(r)[i0 + 1] * t
        col = np.where((L < 0)[:, None], np.array(r)[0] * (1 + L[:, None] * .45), col)
        o[mm, :3] = np.clip(col, 0, 255)
    im = Image.fromarray(o.astype(np.uint8)); bg = Image.new('RGBA', im.size, (90, 120, 70, 255)); bg.alpha_composite(im); tiles.append(bg.resize((im.width * 2, im.height * 2)))
W = sum(t.width for t in tiles); sh = Image.new('RGB', (W, max(t.height for t in tiles))); x = 0
for t in tiles: sh.paste(t, (x, 0)); x += t.width
sh.save(r'C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/tmpl.png')
