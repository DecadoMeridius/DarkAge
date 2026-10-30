import sys, os
sys.path.insert(0, os.getcwd())
from PIL import Image
import importlib, colorsys
H = importlib.import_module('sprites.human'); A = importlib.import_module('sprites.armor')
def hx(c): c = c.lstrip('#'); return tuple(int(c[i:i+2], 16) for i in (0, 2, 4))
def sh(c, k):
    r, g, b = [v / 255 for v in hx(c)]; h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = max(0, min(1, l + k * .14)); r, g, b = colorsys.hls_to_rgb(h, l, s); return (int(r*255), int(g*255), int(b*255))
def ramp(c): return [sh(c, -1.7), sh(c, -.7), hx(c), sh(c, 1)]
TC = {'leather': ('#8a5a32', '#5a3a22'), 'copper': ('#e8853e', '#c8a040'), 'iron': ('#c8d0d8', '#6a6a72'), 'steel': ('#8fa3b8', '#3a4a8a'), 'silver': ('#eef4fa', '#f8fbff'), 'gold': ('#ffd040', '#d8342a'), 'mythril': ('#4fe0c8', '#c8fff0'), 'frost': ('#8fd8ff', '#f0faff'), 'obsidian': ('#6a4aa8', '#e8dcc0'), 'adamant': ('#ff5a8a', '#c8c8d0'), 'dragon': ('#e0562a', '#3a1a10'), 'star': ('#fff6a8', '#ffe070'), 'cobalt': ('#3a7aff', '#d8c8a8'), 'tide': ('#2ae8c8', '#1a6a98'), 'rime': ('#c8f4ff', '#ffffff'), 'cinder': ('#ff5a1a', '#ffb040')}
chans = list(H.CH)
def comp(layers, rm):
    im = Image.new('RGBA', (32, 64))
    for l in layers: im.alpha_composite(l.img)
    px = im.load()
    for y in range(64):
        for x in range(32):
            r, g, b, a = px[x, y]
            if a and r == 255 and g < len(chans) and b < 4:
                px[x, y] = rm[chans[g]][b] + (255,)
    return im
sheet = Image.new('RGBA', (16 * 3 * 34, 66), (70, 90, 60, 255))
for i, tk in enumerate(A.HELM):
    c, acc = TC[tk]
    rm = {n: ramp('#888888') for n in chans}
    rm.update(skin=ramp('#f6d0ac'), hair=ramp('#7a4426'), shirt=ramp(c), pants=ramp('#4a4050'), shoe=ramp(c), acc=ramp('#e8742a'), helm=ramp(c), plume=ramp(acc), armor=ramp(c), trim=ramp(acc), belt=ramp('#6a4428'))
    for j, d in enumerate((0, 2, 3)):
        im = comp([H.body(d, 0), A.armor(tk, d), A.helm(tk, d)], rm)
        sheet.alpha_composite(im, ((i * 3 + j) * 34 + 1, 1))
sheet = sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST)
sheet.crop((0, 0, sheet.width // 2, sheet.height)).save('out/armor_a.png'); sheet.crop((sheet.width // 2, 0, sheet.width, sheet.height)).save('out/armor_b.png'); print('ok')
