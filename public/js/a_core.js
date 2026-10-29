'use strict';
/* ================= Emberhollow v2 — core ================= */
const TS = 16;
const $ = s => document.querySelector(s);
const cv = $('#cv'), g = cv.getContext('2d');
let DPR = 1, VW = 0, VH = 0, ZOOM = 4;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2.5); VW = innerWidth; VH = innerHeight;
  cv.width = Math.floor(VW * DPR); cv.height = Math.floor(VH * DPR);
  ZOOM = Math.max(2, Math.round(cv.height / (TS * 11.5)));
  g.imageSmoothingEnabled = false;
}
addEventListener('resize', resize);
function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let R = Math.random;
const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pickR = a => a[Math.floor(R() * a.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
function hsh(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s | 0) * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function wpick(list, r) { const tot = list.reduce((s, e) => s + e[1], 0); let x = (r === undefined ? R() : r) * tot; for (const e of list) { x -= e[1]; if (x <= 0) return e[0]; } return list[list.length - 1][0]; }

/* ---- value noise ---- */
let NSEED = 1;
function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hsh(xi, yi, s), b = hsh(xi + 1, yi, s), c = hsh(xi, yi + 1, s), d = hsh(xi + 1, yi + 1, s); return lerp(lerp(a, b, u), lerp(c, d, u), v); }
function fbm(x, y, s, oct = 4) { let t = 0, amp = 1, f = 1, n = 0; for (let i = 0; i < oct; i++) { t += vnoise(x * f, y * f, s + i * 101) * amp; n += amp; amp *= .5; f *= 2; } return t / n; }

/* ---- color ---- */
function h2r(h) { const n = parseInt(h.slice(1, 7), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function r2h(r, g2, b) { return '#' + ((1 << 24) | (clamp(Math.round(r), 0, 255) << 16) | (clamp(Math.round(g2), 0, 255) << 8) | clamp(Math.round(b), 0, 255)).toString(16).slice(1); }
function rgb2hsl(r, g2, b) { r /= 255; g2 /= 255; b /= 255; const mx = Math.max(r, g2, b), mn = Math.min(r, g2, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g2 - b) / d + (g2 < b ? 6 : 0) : mx === g2 ? (b - r) / d + 2 : (r - g2) / d + 4; h /= 6; } return [h * 360, s, l]; }
function hsl2hex(h, s, l) { h = ((h % 360) + 360) % 360 / 360; s = clamp(s, 0, 1); l = clamp(l, 0, 1); const f = (n) => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); }; return r2h(f(0) * 255, f(8) * 255, f(4) * 255); }
/* hue-shifted shading: k<0 darker & cooler, k>0 lighter & warmer */
const SHC = {};
function sh(hex, k) {
  if (!k) return hex; const key = hex + k; if (SHC[key]) return SHC[key];
  const [h, s, l] = rgb2hsl(...h2r(hex));
  const toward = (a, target, amt) => { let d = ((target - a + 540) % 360) - 180; return a + d * amt; };
  let out;
  if (k < 0) out = hsl2hex(toward(h, 250, Math.min(.5, -k * .09)), s * (1 + -k * .04), l * (1 + k * .17));
  else out = hsl2hex(toward(h, 55, Math.min(.5, k * .07)), s * (1 - k * .05), l + (1 - l) * k * .2);
  return SHC[key] = out;
}
const rgba = (hex, a) => { const [r, g2, b] = h2r(hex); return `rgba(${r},${g2},${b},${a})`; };

/* ---- canvas helpers ---- */
function mk(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; if (f) f(x, c); return c; }
function px(x, X, Y, W, H, c) { x.fillStyle = c; x.fillRect(X, Y, W, H); }
function ell(x, cx, cy, rx, ry, c) { x.fillStyle = c; for (let j = -ry; j <= ry; j++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry || 1)))); x.fillRect(cx - w, cy + j, w * 2 + 1, 1); } }
/* shaded blob: base with lighter top-left, darker bottom-right */
function sblob(x, cx, cy, rx, ry, c, rough) {
  ell(x, cx, cy, rx, ry, sh(c, -1.5)); ell(x, cx - Math.ceil(rx * .12), cy - Math.ceil(ry * .15), Math.max(1, rx - 1), Math.max(1, ry - 1), c);
  ell(x, cx - Math.ceil(rx * .35), cy - Math.ceil(ry * .4), Math.max(1, Math.floor(rx * .45)), Math.max(1, Math.floor(ry * .38)), sh(c, 1.3));
  if (rough) { const r = rng(cx * 31 + cy * 7 + rx); for (let i = 0; i < rx * ry / 3; i++) { const a = r() * 6.28, d = r(); px(x, Math.round(cx + Math.cos(a) * rx * d), Math.round(cy + Math.sin(a) * ry * d), 1, 1, r() < .5 ? sh(c, -1) : sh(c, .8)); } }
}
function flipC(c) { return mk(c.width, c.height, x => { x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0); }); }
function scaleC(c, s) { return mk(Math.round(c.width * s), Math.round(c.height * s), x => { x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, c.width * s, c.height * s); }); }
/* 1px outline around opaque pixels (Stardew-style dark brown) */
function outline(c, col = '#2b1810', inner) {
  const x = c.getContext('2d'), W = c.width, H = c.height, d = x.getImageData(0, 0, W, H), a = d.data, src = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) src[i] = a[i * 4 + 3] > 100 ? 1 : 0;
  const [r, g2, b] = h2r(col);
  for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) {
    const i = y * W + X; if (src[i]) continue;
    if ((X > 0 && src[i - 1]) || (X < W - 1 && src[i + 1]) || (y > 0 && src[i - W]) || (y < H - 1 && src[i + W])) { a[i * 4] = r; a[i * 4 + 1] = g2; a[i * 4 + 2] = b; a[i * 4 + 3] = 255; }
  }
  x.putImageData(d, 0, 0); return c;
}
function tint(c, col, amt) { return mk(c.width, c.height, x => { x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-atop'; x.globalAlpha = amt; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); }); }

/* ---- audio ---- */
let AC = null, SOUND_ON = true, MUSIC_ON = true;
function snd(f, d = .08, type = 'square', v = .05, slide = 0, delay = 0) {
  if (!SOUND_ON || !AC) return;
  try {
    const t0 = AC.currentTime + delay, o = AC.createOscillator(), gn = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t0 + d);
    gn.gain.setValueAtTime(v, t0); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(gn); gn.connect(AC.destination); o.start(t0); o.stop(t0 + d + .02);
  } catch (e) { }
}
function noiseBurst(d = .1, v = .05, hp = 800) { if (!SOUND_ON || !AC) return; try { const b = AC.createBuffer(1, AC.sampleRate * d, AC.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length); const s = AC.createBufferSource(), f = AC.createBiquadFilter(), gn = AC.createGain(); f.type = 'highpass'; f.frequency.value = hp; gn.gain.value = v; s.buffer = b; s.connect(f); f.connect(gn); gn.connect(AC.destination); s.start(); } catch (e) { } }
const SFX = {
  hit: () => { snd(180, .08, 'square', .05, -90); noiseBurst(.06, .05, 1500); }, chop: () => { noiseBurst(.07, .08, 400); snd(120, .06, 'triangle', .07, -40); },
  pick: () => { snd(900, .04, 'square', .025, 400); noiseBurst(.05, .05, 2500); }, coin: () => { snd(988, .06, 'square', .03); snd(1318, .1, 'square', .03, 0, .06); },
  lvl: () => [523, 659, 784, 1046].forEach((f, i) => snd(f, .16, 'triangle', .06, 0, i * .09)), hurt: () => { snd(110, .18, 'sawtooth', .05, -50); noiseBurst(.1, .06, 300); },
  splash: () => noiseBurst(.25, .07, 600), swing: () => noiseBurst(.06, .03, 3000), till: () => noiseBurst(.08, .06, 200), water: () => noiseBurst(.18, .04, 1800),
  ok: () => { snd(660, .06, 'triangle', .05); snd(990, .08, 'triangle', .05, 0, .05); }, bad: () => snd(150, .12, 'square', .04), pop: () => snd(520, .05, 'sine', .06, 260),
  bite: () => { snd(1000, .05, 'square', .05); snd(1200, .05, 'square', .05, 0, .07); }, boom: () => { snd(60, .4, 'sawtooth', .08, -30); noiseBurst(.4, .1, 80); },
  fire: () => { snd(240, .2, 'sawtooth', .04, -160); noiseBurst(.15, .04, 900); }, step: () => noiseBurst(.025, .012, 1200), secret: () => [392, 494, 587, 784, 988].forEach((f, i) => snd(f, .22, 'sine', .05, 0, i * .11)),
  door: () => { snd(200, .1, 'triangle', .05, -60); noiseBurst(.1, .03, 500); }, bow: () => snd(700, .12, 'triangle', .04, -500),
};
let musicT = 0, musicStep = 0;
const SCALES = { day: [0, 2, 4, 7, 9, 12, 14, 16], night: [0, 3, 5, 7, 10, 12, 15], mine: [0, 1, 5, 7, 8, 12, 13], wild: [0, 2, 3, 7, 9, 12, 14], frost: [0, 2, 5, 7, 9, 12], ash: [0, 1, 4, 5, 7, 8, 11] };
function musicTick(dt, mode) {
  if (!MUSIC_ON || !SOUND_ON || !AC) return;
  musicT -= dt; if (musicT > 0) return;
  musicT = mode === 'mine' || mode === 'ash' ? .44 : .32; musicStep++;
  const sc = SCALES[mode] || SCALES.day, root = { mine: 147, night: 196, frost: 294, ash: 139, wild: 220 }[mode] || 262;
  const bar = musicStep >> 4, r = rng(musicStep * 7 + bar * 131 + mode.length * 9);
  if (r() < .7) { const n = sc[Math.floor(r() * sc.length)]; snd(root * Math.pow(2, n / 12), .3, 'triangle', .017); }
  if (musicStep % 4 === 0) snd(root / 2 * Math.pow(2, sc[(bar % 4) * 2 % sc.length] / 12), .6, 'sine', .022);
  if (musicStep % 8 === 6 && r() < .5) snd(root * 2 * Math.pow(2, sc[Math.floor(r() * sc.length)] / 12), .12, 'sine', .01);
}
