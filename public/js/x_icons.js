/* ================= Painted item icons (asked 2026-11-05) =================
   art/icon_paint.py paints an icon for every item by name and packs them into public/art/icons/icons.png + icons.json
   ({cell, at: {id: [x, y]}}). In painted styles itemIcon returns that painting (a 96 px cell, `hi` so it's drawn smooth) for
   any item that has one; forged gear, fine dishes and strains use their base item's painting (strains keep their own
   recoloured icon). The pixel style and items without a painting keep the old icons. When the atlas loads, the icon caches
   are dropped so windows and the hotbar pick it up. */
const PICON = { at: null, cell: 96, img: null, cache: {} };
fetch('art/icons/icons.json').then(r => r.ok ? r.json() : null).then(j => {
  if (!j) return; PICON.at = j.at; PICON.cell = j.cell || 96;
  const im = new Image(); im.onload = () => { PICON.img = im; PICON.cache = {}; if (typeof ICACHE !== 'undefined') for (const k in ICACHE) delete ICACHE[k]; if (typeof hudKey !== 'undefined') hudKey = ''; if (MODAL) try { refresh(); } catch (e) { } };
  im.src = 'art/icons/icons.png';
}).catch(() => { });
const piconId = id => { if (!id || !IT[id]) return id; const it = IT[id]; if (it.strain !== undefined) return null; return it.base && IT[it.base] ? it.base : id; };
itemIcon = (f => function (id) {
  if (!PICON.img || !id || typeof id !== 'string' || id.startsWith('tool:') || SETTINGS.artStyle === 'pixel') return f.apply(this, arguments);
  const b = piconId(id); const at = b && PICON.at[b]; if (!at) return f.apply(this, arguments);
  let c = PICON.cache[b]; if (c && !c.__lost) return c;
  const C = PICON.cell; c = mk(C, C, x => x.drawImage(PICON.img, at[0], at[1], C, C, 0, 0, C, C));
  c.ww = c.wh = 16; c.hi = C / 32; return PICON.cache[b] = c;
})(itemIcon);

/* strains (asked 2026-11-05): their produce is the crop's painting recoloured toward the strain's colour (the 'color' blend
   keeps the painting's light and shade), their seeds the crop's painted seed packet with a light wash of that colour and a
   round tag in it with a star, so bred seeds stand apart from shop seeds. Without a painting they keep x_breed.js's icons. */
const PSTRAIN = new Map();
itemIcon = (f => function (id) {
  const it = id && IT[id];
  if (!PICON.img || !it || it.strain === undefined || SETTINGS.artStyle === 'pixel') return f.apply(this, arguments);
  const seed = it.t === 'strainseed', base = seed ? it.crop + '_seed' : String(id).split('~')[0], at = PICON.at[base];
  if (!at) return f.apply(this, arguments);
  const key = id + '|' + it.c, hit = PSTRAIN.get(key); if (hit && !hit.__lost) return hit;
  const C = PICON.cell, col = it.c || '#a0a060';
  const c = mk(C, C, x => {
    x.drawImage(PICON.img, at[0], at[1], C, C, 0, 0, C, C);
    x.globalCompositeOperation = 'color'; x.globalAlpha = seed ? .35 : .8; x.fillStyle = col; x.fillRect(0, 0, C, C);
    x.globalCompositeOperation = 'destination-in'; x.globalAlpha = 1; x.drawImage(PICON.img, at[0], at[1], C, C, 0, 0, C, C);
    x.globalCompositeOperation = 'source-over';
    if (!seed) {   // leaves and stems stay green: put back the painting's green pixels (once per strain, so the read-back is fine)
      const o = (typeof mkCPU === 'function' ? mkCPU : mk)(C, C, y => y.drawImage(PICON.img, at[0], at[1], C, C, 0, 0, C, C));
      const od = o.getContext('2d').getImageData(0, 0, C, C).data, im = x.getImageData(0, 0, C, C), d = im.data;
      for (let i = 0; i < d.length; i += 4) { const r = od[i], g = od[i + 1], b2 = od[i + 2]; if (g > r * 1.08 && g > b2 * 1.05 && od[i + 3] > 0) { d[i] = r; d[i + 1] = g; d[i + 2] = b2; } }
      x.putImageData(im, 0, 0);
    }
    if (seed) {
      const r = C * .17, cx = C * .76, cy = C * .76;
      x.fillStyle = 'rgba(30,18,8,.55)'; x.beginPath(); x.arc(cx + 1.5, cy + 2, r, 0, 6.283); x.fill();
      const g = x.createRadialGradient(cx - r * .35, cy - r * .35, r * .1, cx, cy, r); g.addColorStop(0, '#fff8e0'); g.addColorStop(.25, col); g.addColorStop(1, col);
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill(); x.lineWidth = 2.5; x.strokeStyle = '#3a2410'; x.stroke();
      x.fillStyle = '#fff4c8'; x.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .25 : r * .6; x[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      x.closePath(); x.fill();
    }
  });
  c.ww = c.wh = 16; c.hi = C / 32; PSTRAIN.set(key, c); return c;
})(itemIcon);

/* fish (asked 2026-11-05: some fish icons looked like pixel icons): the icon painter worked from the small pixel fish, one
   flat shape for every species, so most came out stiff. Fish with a minigame painting (public/art/fish, FISH_LIST in
   x_fishgame.js) use that side view instead, laid across the slot at a slant. Loaded on first use; until then (and in the
   pixel style) the old icon shows. */
const PFISH = { img: {}, cache: {} };
itemIcon = (f => function (id) {
  if (SETTINGS.artStyle === 'pixel' || typeof FISH_LIST === 'undefined' || !FISH_LIST || typeof id !== 'string') return f.apply(this, arguments);
  const smoked = id.startsWith('smoked_'), fid = smoked ? id.slice(7) : id;   // smoked fish: the same painting, smoked golden brown
  if (!FISH_LIST.has(fid)) return f.apply(this, arguments);
  let im = PFISH.img[fid];
  if (!im) { im = PFISH.img[fid] = new Image(); im.onload = () => { for (const k of [fid, 'smoked_' + fid]) { delete PFISH.cache[k]; if (typeof ICACHE !== 'undefined') delete ICACHE[k]; } if (typeof hudKey !== 'undefined') hudKey = ''; }; im.src = 'art/fish/' + fid + '.png'; }
  if (!im.complete || !im.naturalWidth) return f.apply(this, arguments);
  let c = PFISH.cache[id]; if (c && !c.__lost) return c;
  const C = (typeof PICON !== 'undefined' && PICON.cell) || 96, a = -.42, L = C * 1.08, k = Math.min(L / im.width, C * .62 / im.height), w = im.width * k, h = im.height * k;
  c = mk(C, C, x => { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.translate(C / 2, C / 2 + 2); x.rotate(a); x.drawImage(im, -w / 2, -h / 2, w, h);
    if (smoked) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'multiply'; x.fillStyle = '#c08048'; x.fillRect(0, 0, C, C); x.globalCompositeOperation = 'destination-in'; x.translate(C / 2, C / 2 + 2); x.rotate(a); x.drawImage(im, -w / 2, -h / 2, w, h); x.globalCompositeOperation = 'source-over'; } });
  c.ww = c.wh = 16; c.hi = C / 32; return PFISH.cache[id] = c;
})(itemIcon);
