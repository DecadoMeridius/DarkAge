import sys, importlib
sys.path.insert(0, '.')
from PIL import Image
hd = importlib.import_module('sprites.handdrawn'); fo = importlib.import_module('sprites.foes')
ramp = [[(58, 54, 52), (98, 92, 88), (138, 132, 126), (186, 180, 172)], [(46, 42, 40), (76, 70, 66), (112, 104, 98), (150, 142, 134)]]
def col(c):
    im = c.img.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and r == 255 and g < 2 and b < 4: px[x, y] = ramp[g][b] + (255,)
    return im
ims = [col(fo.wolf(0)), col(fo.wolf(1)), col(hd.SAMPLE['wolf'](0)), col(hd.SAMPLE['wolf'](1))]
sh = Image.new('RGBA', (4 * 58, 44), (74, 104, 60, 255))
for i, im in enumerate(ims): sh.alpha_composite(im, (i * 58 + 2, 2))
sh.resize((sh.width * 4, sh.height * 4), Image.NEAREST).save('out/wolf_compare.png')
