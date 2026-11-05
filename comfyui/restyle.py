"""Restyle game screenshots with Qwen Image Edit 2511 through a running ComfyUI (127.0.0.1:8188).

    python restyle.py [style ...]        all styles when none are named
    scenes: docs/artstyles/src/*.png  ->  docs/artstyles/<style>/<scene>.png
"""
import json, os, sys, time, uuid, urllib.request, urllib.parse
from pathlib import Path

HOST = os.environ.get('COMFY_HOST', 'http://127.0.0.1:8188')   # set COMFY_HOST to use another server
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'artstyles' / 'src'

KEEP = ('Completely change the art style of everything, including every person, the ground and every object: '
        'nothing may stay pixel art. Keep the same top-down camera, composition and layout: every building, tree, path, '
        'fence, person and object stays in the same place and size. Do not add anything: no new animals, people, trees '
        'or scenery. Black empty areas stay plain black. Keep any text label as it is.')
STYLES = {
    'watercolor': 'Repaint this top-down game scene as a soft hand-painted watercolour storybook illustration, '
                  'like a Studio Ghibli background: loose washes, paper texture, gentle ink lines, warm light.',
    'cartoon':    'Redraw this top-down game scene as a smooth high-resolution vector cartoon, like a modern mobile game or a '
                  'Saturday-morning cartoon: thick clean black outlines, flat cel-shaded colours, chunky rounded shapes, people with big heads.',
    'painterly':  'Repaint this top-down game scene as a rich hand-painted fantasy RPG: visible oil brush strokes, '
                  'detailed textures, deep shadows and warm golden highlights.',
    'inkwash':    'Redraw this top-down game scene as a black-ink pen drawing on cream paper, like an illustrated fairy-tale book: '
                  'fine hand-drawn ink lines and cross-hatching on everything, with only light sepia and muted watercolour tints.',
    'anime':      'Redraw this top-down game scene as a detailed anime game background: crisp line art, '
                  'smooth soft gradients, lush vivid foliage, clean glossy shading.',
}
NEG = 'pixel art, pixelated, 8-bit, 16-bit, sprites, blurry, jpeg artifacts, watermark, extra animals, extra objects, changed layout'


def api(path, data=None, headers=None):
    req = urllib.request.Request(HOST + path, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=600) as r:
        return r.read()


def upload(p):
    b = uuid.uuid4().hex
    body = (f'--{b}\r\nContent-Disposition: form-data; name="image"; filename="eh_{p.name}"\r\n'
            'Content-Type: image/png\r\n\r\n').encode() + p.read_bytes() + \
           f'\r\n--{b}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n--{b}--\r\n'.encode()
    return json.loads(api('/upload/image', body, {'Content-Type': f'multipart/form-data; boundary={b}'}))['name']


def graph(img, prompt, seed, mp=1.0, denoise=1.0, steps=4, img2=None):
    g = {
        '1': {'class_type': 'UNETLoader', 'inputs': {'unet_name': 'qwen_image_edit_2511_fp8mixed.safetensors', 'weight_dtype': 'default'}},
        '2': {'class_type': 'LoraLoaderModelOnly', 'inputs': {'model': ['1', 0], 'lora_name': 'Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors', 'strength_model': 1.0}},
        '3': {'class_type': 'ModelSamplingAuraFlow', 'inputs': {'model': ['2', 0], 'shift': 3.1}},
        '4': {'class_type': 'CFGNorm', 'inputs': {'model': ['3', 0], 'strength': 1.0}},
        '5': {'class_type': 'CLIPLoader', 'inputs': {'clip_name': 'qwen_2.5_vl_7b_fp8_scaled.safetensors', 'type': 'qwen_image'}},
        '6': {'class_type': 'VAELoader', 'inputs': {'vae_name': 'qwen_image_vae.safetensors'}},
        '7': {'class_type': 'LoadImage', 'inputs': {'image': img}},
        '8': {'class_type': 'ImageScaleToTotalPixels', 'inputs': {'image': ['7', 0], 'upscale_method': 'lanczos', 'megapixels': mp, 'resolution_steps': 8}},
        '9': {'class_type': 'TextEncodeQwenImageEditPlus', 'inputs': {'clip': ['5', 0], 'vae': ['6', 0], 'image1': ['8', 0], 'prompt': prompt}},
        '10': {'class_type': 'TextEncodeQwenImageEditPlus', 'inputs': {'clip': ['5', 0], 'vae': ['6', 0], 'image1': ['8', 0], 'prompt': NEG}},
        '11': {'class_type': 'FluxKontextMultiReferenceLatentMethod', 'inputs': {'conditioning': ['9', 0], 'reference_latents_method': 'index_timestep_zero'}},
        '12': {'class_type': 'FluxKontextMultiReferenceLatentMethod', 'inputs': {'conditioning': ['10', 0], 'reference_latents_method': 'index_timestep_zero'}},
        '13': {'class_type': 'VAEEncode', 'inputs': {'pixels': ['8', 0], 'vae': ['6', 0]}},
        '14': {'class_type': 'KSampler', 'inputs': {'model': ['4', 0], 'positive': ['11', 0], 'negative': ['12', 0], 'latent_image': ['13', 0],
                                                    'seed': seed, 'steps': steps, 'cfg': 1.0, 'sampler_name': 'euler', 'scheduler': 'simple', 'denoise': denoise}},
        '15': {'class_type': 'VAEDecode', 'inputs': {'samples': ['14', 0], 'vae': ['6', 0]}},
        '16': {'class_type': 'SaveImage', 'inputs': {'images': ['15', 0], 'filename_prefix': 'emberhollow'}},
    }
    if img2:   # a second reference (the output keeps image 1's size and layout)
        g['17'] = {'class_type': 'LoadImage', 'inputs': {'image': img2}}
        g['18'] = {'class_type': 'ImageScaleToTotalPixels', 'inputs': {'image': ['17', 0], 'upscale_method': 'lanczos', 'megapixels': mp, 'resolution_steps': 8}}
        for k in ('9', '10'): g[k]['inputs']['image2'] = ['18', 0]
    return g


def run(img, prompt, out, seed=7, mp=1.0, denoise=1.0, steps=4, img2=None):
    """denoise below 1 starts from the input image itself (img2img), so the drawing keeps its shapes; ComfyUI runs the
    last `steps` of int(steps / denoise), so more steps give finer strengths (4 steps: 1 or .8 and below)"""
    pid = json.loads(api('/prompt', json.dumps({'prompt': graph(img, prompt, seed, mp, denoise, steps, img2)}).encode(), {'Content-Type': 'application/json'}))['prompt_id']
    t = time.time()
    while True:
        h = json.loads(api('/history/' + pid)).get(pid)
        if h and h.get('status', {}).get('completed'):
            break
        if h and h.get('status', {}).get('status_str') == 'error':
            raise RuntimeError(json.dumps(h['status'])[:2000])
        time.sleep(1)
    f = h['outputs']['16']['images'][0]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(api('/view?' + urllib.parse.urlencode({'filename': f['filename'], 'subfolder': f['subfolder'], 'type': f['type']})))
    print(f'{out.relative_to(ROOT)}  {time.time() - t:.1f}s', flush=True)


if __name__ == '__main__':
    names = sys.argv[1:] or list(STYLES)
    scenes = sorted(SRC.glob('*.png'))
    uploaded = {p.stem: upload(p) for p in scenes}
    for s in names:
        for p in scenes:
            run(uploaded[p.stem], STYLES[s] + ' ' + KEEP, ROOT / 'docs' / 'artstyles' / s / p.name)
