"""The magenta key shared by the painting scripts (asked 2026-11-05: shadows were getting baked in).

The model paints a shadow under an object on the magenta card as darker or greyer magenta. Keying only bright magenta left
those shadows as a dark, half-transparent patch under every painting, doubling the game's own cast shadow. Shadows are grown
out from the keyed card into pixels whose red and blue stay about equal with green below them; maroon and purple parts of an
object (red or blue well ahead) are never touched, and nothing that doesn't touch the card is.

`alpha(im)` returns the alpha mask (L) for an RGB painting on the magenta card.
"""
from PIL import Image, ImageFilter

def alpha(im):
    # 1. the card: bright magenta, as the key always was
    im = im.convert('RGB'); W, H = im.size; px = im.load(); a = Image.new('L', (W, H)); ap = a.load()
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y]; m = min(r, b) - g
            ap[x, y] = 0 if m > 90 else 255 if m < 35 else int(255 * (90 - m) / 55)
    # 2. shadows: grown out from the card into darker or greyer magenta (red and blue about equal, green below them). Maroon
    #    (red well above blue) and purple (blue well above red) never qualify, and nothing apart from the card is touched.
    def shadowy(r, g, b):
        hi = max(r, b, 1); return .78 <= (r + 1) / (b + 1) <= 1.3 and g < hi * .55 and hi - g > 18
    stack = [(x, y) for y in range(H) for x in range(W) if ap[x, y] == 0]; seen = set(stack)
    while stack:
        x, y = stack.pop()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen:
                seen.add((nx, ny)); r, g, b = px[nx, ny]
                if ap[nx, ny] < 255 or shadowy(r, g, b): ap[nx, ny] = 0; stack.append((nx, ny))
    return a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7))
