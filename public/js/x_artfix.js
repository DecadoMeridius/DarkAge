/* ================= Painted-style art fixes from art playtest 4 (asked 2026-11-05) =================
   - Soft creature outlines: painted creature frames are cut to the pixel frame's outline, so every creature kept a
     stair-stepped pixel silhouette. In painted styles each enemy and animal frame gets its alpha edge softened once
     (`featherOf`: the alpha blurred by about one art pixel and sharpened back to a clean anti-aliased contour, filled-in
     corners taking the colour around them), cached per canvas. */
const FEATHER = new WeakMap();
function featherOf(c) {
  if (!c || !c.width || (typeof SETTINGS !== 'undefined' && SETTINGS.artStyle === 'pixel')) return c;
  let o = FEATHER.get(c); if (o && !o.__lost) return o;
  // canvas px per art px: a sprite is 2 art px per world unit
  const k = c.ww ? c.width / (c.ww * 2) : (c.hi || 1), r = Math.max(1, k * .85), W = c.width, H = c.height;
  const bl = mkCPU(W, H, x => { x.filter = `blur(${r}px)`; x.drawImage(c, 0, 0); x.filter = 'none'; });
  const src = mkCPU(W, H, x => x.drawImage(c, 0, 0));
  const B = bl.getContext('2d').getImageData(0, 0, W, H), A = src.getContext('2d').getImageData(0, 0, W, H), b = B.data, a = A.data;
  for (let i = 0; i < a.length; i += 4) {
    // a rounded contour: the blurred alpha, sharpened back to a clean anti-aliased edge
    const t = b[i + 3] / 255, na = Math.max(0, Math.min(1, (t - .38) / .24));
    if (a[i + 3] < 8 && na > 0 && b[i + 3]) { const u = 255 / b[i + 3]; a[i] = Math.min(255, b[i] * u); a[i + 1] = Math.min(255, b[i + 1] * u); a[i + 2] = Math.min(255, b[i + 2] * u); }   // a filled-in corner takes the colour around it
    a[i + 3] = Math.round(255 * na * (a[i + 3] > 8 ? 1 : .9));
  }
  src.getContext('2d').putImageData(A, 0, 0);
  o = mk(W, H, x => x.drawImage(src, 0, 0));
  for (const p of ['ww', 'wh', 'hi', 'off', 'ax', 'ay', 'meta', 'cast']) if (c[p] !== undefined) o[p] = c[p];
  o.src = c; FEATHER.set(c, o); return o;
}
enemySpr = (f => function () { return featherOf(f.apply(this, arguments)); })(enemySpr);
animalSpr = (f => function () { return featherOf(f.apply(this, arguments)); })(animalSpr);
/* - Broken or mismatched creature paintings (art playtest 4): a broken frame shows a good frame of the same creature.
     Frame 0 of the shardling, elemental and glacier heart has sticks or smears on it; the Stone Tyrant's and the Forge King's
     wind-up frames kept a card slab; the queens and the Ember Wyrm walk as a simple shape but strike as a detailed painting,
     and the harpy and the captains likewise, so they use their detailed painting throughout (the motion is procedural). */
if (typeof STYLE_ALIAS !== 'undefined') {
  const A = (a, from, to) => { for (const f of from) STYLE_ALIAS['en_' + a + f] = 'en_' + a + to; };
  A('shardling', ['.0'], '.2'); A('elemental', ['.0'], '.2'); A('glacierheart', ['.0', '.3', '_atk.0'], '.2');
  A('tyrant', ['.0', '.3', '_atk.0', '_atk.1'], '.2'); A('forgeking', ['_atk.0', '_atk.1'], '.2');
  for (const a of ['queen', 'dragon', 'harpy']) A(a, ['.0', '.1', '.2', '.3', '_atk.0'], '_atk.1');
  A('captain', ['.0', '_atk.1'], '.2'); A('golem', ['_atk.1'], '_atk.0');
}

/* - Painted creatures and animals (art/creature_paint.py, art/animal_paint.py; asked 2026-11-05): one free painting per
     enemy key, animal coat and pet, facing right. Each frame is built from it in the creature's own sprite box (scaled to fit,
     so nothing is cut off, bottom-aligned): walk frames bob, tilt and squash a little on the step (flyers bob more), the
     wind-up leans back and the strike lunges forward; the game's own recoil, flash and lunge still play on top. Until a
     painting has loaded (or for a creature without one) the atlas frames are used, with softened outlines. */
const PAINTED = { cr: null, an: null, img: {} };
fetch('art/creatures/creatures.json').then(r => r.ok ? r.json() : []).then(a => { PAINTED.cr = new Set(a); }).catch(() => { PAINTED.cr = new Set(); });
fetch('art/animals/animals.json').then(r => r.ok ? r.json() : []).then(a => { PAINTED.an = new Set(a); }).catch(() => { PAINTED.an = new Set(); });
function paintedImg(dir, id) {
  const set = dir === 'creatures' ? PAINTED.cr : PAINTED.an; if (!set || !set.has(id)) return null;
  const key = dir + '/' + id; let i = PAINTED.img[key]; if (!i) { i = PAINTED.img[key] = new Image(); i.src = 'art/' + key + '.png'; }
  return i.complete && i.naturalWidth ? i : null;
}
const PFRAME = {}, PBOX = {};
function alphaBox(c) {
  const W = c.width, H = c.height, d = mkCPU(W, H, x => x.drawImage(c, 0, 0)).getContext('2d').getImageData(0, 0, W, H).data;
  let y0 = H, y1 = -1; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 40) { if (y < y0) y0 = y; y1 = y; break; }
  return { h: y1 >= y0 ? y1 - y0 + 1 : H };
}
function paintedFrame(img, base, f, fly, key) {
  const ck = key + '|' + f; const hit = PFRAME[ck]; if (hit && !hit.__lost) return hit;
  const W = base.width, H = base.height, bb = PBOX[key] || (PBOX[key] = alphaBox(base));   // the creature's drawn size, measured once
  const s = Math.min(W * .98 / img.width, Math.max(bb.h, H * .5) * 1.04 / img.height), w = img.width * s, h = img.height * s;
  let dx = 0, dy = 0, rot = 0, sx = 1, sy = 1;
  if (f === 'a0') { rot = -.09; sx = .95; sy = 1.04; dx = -W * .04; }   // wind-up: leaning back
  else if (f === 'a1') { rot = .11; sx = 1.07; sy = .96; dx = W * .06; }   // strike: lunging in
  else if (f === 'sit') { sy = .86; sx = 1.05; }
  else { const ph = (+f || 0) / 4 * Math.PI * 2; dy = -Math.abs(Math.sin(ph)) * H * (fly ? .07 : .03); rot = Math.sin(ph) * (fly ? .05 : .03); sx = 1 + .02 * Math.cos(ph * 2); sy = 1 - .02 * Math.cos(ph * 2); }
  const c = mk(W, H, x => { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.translate(W / 2 + dx, H * .99 + dy); x.rotate(rot); x.scale(sx, sy); x.drawImage(img, -w / 2, -h, w, h); });
  for (const p of ['ww', 'wh', 'hi', 'off', 'ax', 'ay', 'meta', 'cast']) if (base[p] !== undefined) c[p] = base[p];
  if (!c.hi) c.hi = Math.max(1, Math.round(W / ((base.ww || W / 2) * 2)));
  return PFRAME[ck] = c;
}
enemySpr = (f => function (k, fr) {
  const base = f.apply(this, arguments);   // the feathered atlas frame: the box, and the fallback
  if (!base || !base.width || SETTINGS.artStyle === 'pixel') return base;
  const img = paintedImg('creatures', k); if (!img) return base;
  const E = EN[k] || {}; return paintedFrame(img, base, fr, E.ai === 'fly' || E.ai === 'swoop', 'cr|' + k + '|' + SETTINGS.artStyle);
})(enemySpr);
animalSpr = (f => function (sp, coat, fr) {
  const base = f.apply(this, arguments);
  if (!base || !base.width || SETTINGS.artStyle === 'pixel') return base;
  const img = paintedImg('animals', sp + '_' + coat) || paintedImg('animals', sp + '_' + Object.keys(COATS[sp] || {})[0]); if (!img) return base;
  return paintedFrame(img, base, fr, false, 'an|' + sp + '|' + coat + '|' + SETTINGS.artStyle);
})(animalSpr);
// pets are drawn from pet_<kind>_<frame> (0-1 walk, 2 sit)
PIX.get = (f => function (n) {
  const r = f.apply(this, arguments), m = /^pet_(dog|cat)_(\d)$/.exec(n || '');
  if (!m || !r || !r.width || SETTINGS.artStyle === 'pixel') return r;
  const img = paintedImg('animals', 'pet_' + m[1]); if (!img) return r;
  return paintedFrame(img, r, m[2] === '2' ? 'sit' : +m[2] * 2, false, 'pet|' + m[1] + '|' + SETTINGS.artStyle);
})(PIX.get);

/* - Repainted single sprites (art/object_paint.py): lamp posts, rugs, the sailboat, sprinklers, the barn, coop and stable
     upgrade levels, the storage shed. In painted styles PIX.get returns the painting fitted into the sprite's own box
     (bottom-aligned, aspect kept), so positions, doors and collisions stay as they were. */
let OBJ_LIST = null; const OBJ_IMG = {}, OBJ_FR = {}, OBJ_ALIAS = { lantern: 'lantern_off' };
fetch('art/objects/objects.json').then(r => r.ok ? r.json() : []).then(a => { OBJ_LIST = new Set(a); if (typeof PIX !== 'undefined') PIX.cache = {}; for (const k in OBJ_FR) delete OBJ_FR[k]; }).catch(() => { OBJ_LIST = new Set(); });
// paintings made as edits of an atlas building (upgrade levels, winter looks) line up with that frame: same size and position
let OBJ_ALIGN = {}; fetch('art/objects/aligned.json').then(r => r.ok ? r.json() : {}).then(a => { OBJ_ALIGN = a || {}; if (typeof PIX !== 'undefined') PIX.cache = {}; for (const k in OBJ_FR) delete OBJ_FR[k]; }).catch(() => { });
/* buildings keep the sprite they were given (b.spr): one asked for before its painting had loaded kept the old atlas painting
   until the next change of season (asked 2026-11-05: winter showed the old snowy paintings). When a building painting
   arrives, every building using that name gets it again. */
let BLD_RELOAD = null;
function bldReload(n) {
  if (typeof MAPS === 'undefined') return;
  for (const id in MAPS) { const m = MAPS[id]; if (m && m.bld) for (const b of m.bld) if (b.sprName === n) b.sprName = null; }
  clearTimeout(BLD_RELOAD); BLD_RELOAD = setTimeout(() => { try { if (typeof refreshBuildings === 'function' && typeof S !== 'undefined' && S) refreshBuildings(); } catch (e) { console.error(e); } }, 150);
}
PIX.get = (f => function (n) {
  const r = f.apply(this, arguments);
  if (OBJ_ALIAS[n] && OBJ_LIST && OBJ_LIST.has(OBJ_ALIAS[n])) n = OBJ_ALIAS[n];   // the lit lamp post is the same painting (its flame is drawn at night)
  if (!r || !r.width || !OBJ_LIST || !OBJ_LIST.has(n) || SETTINGS.artStyle === 'pixel') return r;
  let img = OBJ_IMG[n]; if (!img) { img = OBJ_IMG[n] = new Image(); img.onload = () => { if (PIX.cache) delete PIX.cache[n]; if (typeof CHUNK !== 'undefined') try { for (const k in CHUNK) delete CHUNK[k]; } catch (e) { } if (/^bld_/.test(n)) bldReload(n); }; img.src = 'art/objects/' + n + '.png'; }
  if (!img.complete || !img.naturalWidth) return r;
  const ck = n + '|' + SETTINGS.artStyle; const hit = OBJ_FR[ck]; if (hit && !hit.__lost) return hit;
  if (OBJ_ALIGN[n]) {
    const src = OBJ_ALIGN[n] === n ? r : f.call(this, OBJ_ALIGN[n]); if (!src || !src.width) return r;
    const c = mk(src.width, src.height, x => { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, src.width, src.height); });
    for (const p of ['ww', 'wh', 'hi', 'off', 'k', 'ax', 'ay', 'meta', 'cast', 'chim']) if (src[p] !== undefined) c[p] = src[p];
    return OBJ_FR[ck] = c;
  }
  // the sprite's own box (a painted frame can be larger: room for its old painting to spill past the box)
  const K = r.hi || 4, W = r.ww ? Math.round(r.ww * 2 * K) : r.width, H = r.wh ? Math.round(r.wh * 2 * K) : r.height;
  const flat = /^dec_/.test(n), s = Math.min(W / img.width, H / img.height) * (flat ? 1 : .98), w = img.width * s, h = img.height * s;
  const c = mk(W, H, x => { x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(img, (W - w) / 2, flat ? (H - h) / 2 : H - h, w, h); });
  for (const p of ['ww', 'wh', 'ax', 'ay', 'meta', 'cast']) if (r[p] !== undefined) c[p] = r[p];   // not 'off': the painting fills the box
  c.hi = K; return OBJ_FR[ck] = c;
})(PIX.get);

/* - Projectiles, skill shots and hazards in painted styles (art playtest 4: skill arrows were dark pixel diamonds, enemy shots
     square boxes, hazards flat untextured shapes). Drawn smooth with soft glows, trails and moving texture; the pixel style
     keeps its stepped versions. No canvas blur filters (they froze quake rings): gradients only. */
const PSTY = () => SETTINGS.artStyle !== 'pixel';
function softOrb(x, y, r, c0, c1, glow) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.4); gr.addColorStop(0, glow); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 2.4, 0, 6.283); g.fill();
  const b = g.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); b.addColorStop(0, c1); b.addColorStop(1, c0); g.fillStyle = b; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
}
function softArrow(x, y, a, tint, big) {
  g.save(); g.translate(x, y); g.rotate(a); const L = big ? 11 : 9;
  if (tint) { const t = g.createLinearGradient(-L - 14, 0, -L, 0); t.addColorStop(0, 'rgba(0,0,0,0)'); t.addColorStop(1, tint); g.strokeStyle = t; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-L - 14, 0); g.lineTo(-L + 2, 0); g.stroke(); }
  g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L - 3, 0); g.stroke();
  g.strokeStyle = '#a8784a'; g.lineWidth = .5; g.beginPath(); g.moveTo(-L, -.3); g.lineTo(L - 3, -.3); g.stroke();
  g.fillStyle = '#d8dee6'; g.beginPath(); g.moveTo(L + 1, 0); g.lineTo(L - 4, -2.2); g.lineTo(L - 3, 0); g.lineTo(L - 4, 2.2); g.closePath(); g.fill(); g.strokeStyle = '#5a6068'; g.lineWidth = .4; g.stroke();
  g.fillStyle = tint || '#e8e0d0'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-L, 0); g.lineTo(-L - 3, s * 2.4); g.lineTo(-L + 2, s * 2); g.lineTo(-L + 3, 0); g.closePath(); g.fill(); }
  g.restore();
}
if (typeof drawSkp === 'function') drawSkp = (f => function (p) {
  if (!PSTY()) return f.apply(this, arguments);
  const a = Math.atan2(p.vy, p.vx), cols = p.cols || (p.kind === 'fireball' ? SKILL_FX.fireball : p.kind === 'bolt' ? SKILL_FX.orbs : p.kind === 'pierce' ? SKILL_FX.piercing : SKILL_FX.multishot);
  if (p.kind === 'fireball') {
    for (let j = 6; j >= 1; j--) { g.globalAlpha = .5 - j * .07; softOrb(p.x - Math.cos(a) * j * 3, p.y - Math.sin(a) * j * 3, 3.2 - j * .35, cols[0], cols[2], 'rgba(255,120,40,.25)'); }
    g.globalAlpha = 1; softOrb(p.x, p.y, 4 + Math.sin(gameT * 30) * .5, '#ff6a1a', '#fff2b0', 'rgba(255,120,40,.45)');
    if (Math.random() < .5) PARTS.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 20, vy: -14, t: .3, c: Math.random() < .5 ? cols[0] : cols[2] }); return;
  }
  if (p.kind === 'bolt') {
    for (let j = 5; j >= 1; j--) { g.globalAlpha = .45 - j * .07; softOrb(p.x - Math.cos(a) * j * 3, p.y - Math.sin(a) * j * 3, 2.4 - j * .3, cols[0], cols[1] || '#ffffff', 'rgba(170,120,255,.2)'); }
    g.globalAlpha = 1; softOrb(p.x, p.y, 3.4, cols[0], cols[1] || '#ffffff', 'rgba(170,120,255,.45)'); return;
  }
  softArrow(p.x, p.y, a, cols[0], p.kind === 'pierce');
})(drawSkp);
drawEnt = (f => function (e) {
  if (!e || e.type !== 'proj' || !PSTY()) return f.apply(this, arguments);
  const a = Math.atan2(e.vy || 0, e.vx || 1);
  const tr = (c0, c1, glow, r) => { for (let j = 4; j >= 1; j--) { g.globalAlpha = .4 - j * .08; softOrb(e.x - Math.cos(a) * j * 3, e.y - Math.sin(a) * j * 3, r * (1 - j * .15), c0, c1, glow); } g.globalAlpha = 1; softOrb(e.x, e.y, r, c0, c1, glow); };
  if (e.k === 'fire') tr('#ff7a1a', '#fff2b0', 'rgba(255,110,30,.4)', 3.6);
  else if (e.k === 'ice') tr('#7ac8f0', '#ffffff', 'rgba(120,200,255,.4)', 3.2);
  else if (e.k === 'void') tr('#9a4ae0', '#ffe0ff', 'rgba(150,70,230,.45)', 3.6);
  else if (e.k === 'arrow') softArrow(e.x, e.y, a, null, false);
  else {
    const gr = g.createRadialGradient(e.x - 1, e.y - 1.5, .5, e.x, e.y, 3.4); gr.addColorStop(0, '#c8beb0'); gr.addColorStop(.6, '#8a8276'); gr.addColorStop(1, '#4a443e');
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(e.x, e.y + 4, 3, 1.2, 0, 0, 6.283); g.fill(); g.fillStyle = gr; g.beginPath(); g.ellipse(e.x, e.y, 3.4, 3, (gameT * 8) % 6.283, 0, 6.283); g.fill();
  }
})(drawEnt);
drawHazards = (f => function () {
  if (!PSTY() || typeof HAZ === 'undefined') return f.apply(this, arguments);
  for (const h of HAZ) {
    const live = h.t >= h.T, k = Math.min(1, h.t / h.T), col = h.elem === 'fire' ? [255, 110, 40] : h.elem === 'ice' ? [130, 210, 255] : [230, 70, 50];
    const rgba = a => 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + a + ')';
    const hot = h.elem === 'fire' ? 'rgba(255,230,140,' : h.elem === 'ice' ? 'rgba(240,252,255,' : 'rgba(255,200,170,';
    g.save();
    const softEll = (x, y, rx, ry, a0, a1) => { g.save(); g.translate(x, y); g.scale(1, ry / rx); const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, rgba(a0)); gr.addColorStop(.75, rgba(a1)); gr.addColorStop(1, rgba(0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, 6.283); g.fill(); g.restore(); };
    const rim = (x, y, rx, ry, a) => { g.strokeStyle = rgba(a); g.lineWidth = 1.5; g.setLineDash([4, 3]); g.lineDashOffset = -gameT * 20; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.283); g.stroke(); g.setLineDash([]); };
    if (h.k === 'circle' || h.k === 'pool') {
      if (live) {
        softEll(h.x, h.y, h.r, h.r * .7, .85, .55);
        for (let i = 0; i < 6; i++) { const t = gameT * 3 + i * 1.7, rr = h.r * (.25 + .5 * ((i * 37) % 10) / 10); g.fillStyle = hot + (.25 + .2 * Math.sin(t)) + ')'; g.beginPath(); g.ellipse(h.x + Math.cos(i * 2.1 + gameT) * rr, h.y + Math.sin(i * 2.1 + gameT) * rr * .7, 3 + Math.sin(t) * 1.5, 2, 0, 0, 6.283); g.fill(); }
      } else { softEll(h.x, h.y, h.r, h.r * .7, .12, .08); softEll(h.x, h.y, h.r * k, h.r * .7 * k, .4, .3); rim(h.x, h.y, h.r, h.r * .7, .9); }
      if (h.rock && !live) { const y = h.y - 90 * (1 - k), gr = g.createRadialGradient(h.x - 1, y - 2, .5, h.x, y, 5); gr.addColorStop(0, '#c8beb0'); gr.addColorStop(1, '#5a544c'); g.fillStyle = gr; g.beginPath(); g.ellipse(h.x, y, 5, 4.2, 0, 0, 6.283); g.fill(); }
    } else if (h.k === 'ring') {
      if (!live) { softEll(h.x, h.y, h.r1, h.r1 * .7, .1, .06); softEll(h.x, h.y, 22 * k + 3, 16 * k + 2, .5, .35); rim(h.x, h.y, h.r1, h.r1 * .7, .6); }
      else {
        const r = h.r0 + (h.r1 - h.r0) * Math.min(1, (h.t - h.T) / h.life);
        g.save(); g.translate(h.x, h.y); g.scale(1, .7); const gr = g.createRadialGradient(0, 0, Math.max(0, r - 8), 0, 0, r + 8);
        gr.addColorStop(0, rgba(0)); gr.addColorStop(.5, rgba(.75)); gr.addColorStop(.62, hot + '.9)'); gr.addColorStop(1, rgba(0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r + 8, 0, 6.283); g.fill(); g.restore();
      }
    } else if (h.k === 'lane') {
      const fill = live ? h.len : h.len * k; g.save(); g.translate(h.x, h.y); g.rotate(h.a);
      const gr = g.createLinearGradient(0, -h.w / 2, 0, h.w / 2); gr.addColorStop(0, rgba(0)); gr.addColorStop(.3, rgba(live ? .75 : .3)); gr.addColorStop(.7, rgba(live ? .75 : .3)); gr.addColorStop(1, rgba(0));
      g.fillStyle = gr; g.fillRect(0, -h.w / 2, h.len, h.w);
      if (!live) { g.fillStyle = rgba(.35); g.fillRect(0, -h.w / 4, fill, h.w / 2); g.strokeStyle = rgba(.8); g.setLineDash([4, 3]); g.strokeRect(0, -h.w / 2, h.len, h.w); g.setLineDash([]); }
      else for (let s = 8; s < h.len; s += 12) { g.fillStyle = hot + (.5 + .4 * Math.sin(gameT * 6 + s)) + ')'; g.beginPath(); g.moveTo(s, -h.w * .35); g.lineTo(s + 3, 0); g.lineTo(s, h.w * .35); g.lineTo(s - 3, 0); g.fill(); }
      g.restore();
    } else if (h.k === 'wave') {
      const x = live ? h.x + h.dir * 340 * Math.min(1, (h.t - h.T) / h.life) : h.x, y0 = h.y - h.h / 2, y1 = h.y + h.h / 2, gA = h.gap - h.gw / 2, gB = h.gap + h.gw / 2;
      const band = (ya, yb) => { if (yb <= ya) return; const gr = g.createLinearGradient(x - 12, 0, x + 12, 0); gr.addColorStop(0, 'rgba(40,110,170,0)'); gr.addColorStop(.45, live ? 'rgba(60,140,200,.8)' : 'rgba(60,140,200,.3)'); gr.addColorStop(.6, live ? 'rgba(220,245,255,.9)' : 'rgba(220,245,255,.35)'); gr.addColorStop(1, 'rgba(40,110,170,0)'); g.fillStyle = gr; g.fillRect(x - 12, ya, 24, yb - ya); };
      band(y0, gA); band(gB, y1);
      if (!live) { g.strokeStyle = 'rgba(255,255,255,.7)'; g.setLineDash([3, 3]); g.strokeRect(x - 4, gA, 8, h.gw); g.setLineDash([]); }
    }
    g.restore();
  }
})(drawHazards);
