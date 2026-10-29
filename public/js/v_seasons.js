/* ================= Seasons and the time of day =================
   GROUND: dirt, cobbles, rock and sand have spring (sprouts, petals), autumn (leaf litter) and
   winter (snow) textures besides summer (ground.py); grass already had all four. In winter,
   ponds and rivers freeze over (only the painting: you can still ice-fish), the sea doesn't.
   BUILDINGS swap to snow-roofed versions in winter (bld_..._w). The Emberwaste never gets snow.
   LIGHT: one flat grade, as before, but the day follows the season: summer days run from about
   5:30 to 20:30, winter days from 7:00 to 18:00, with pre-dawn, dawn, morning, noon, golden hour,
   sunset and dusk keyframes, and a seasonal tint (fresh spring, warm summer, amber autumn,
   cold winter). After the grade, windows glow and lanterns and campfires burn at night.
   PARTICLES: spring petals, summer butterflies by day and fireflies by night, autumn leaves,
   winter snow motes (plus the weather's own rain and snow). */

const NOSNOW = id => id === 'emberwaste' || (id || '').startsWith('dg_emberwaste');
let PAINT_MAP = null;
const _paintChunkS = paintChunk;
paintChunk = function (m, cx, cy) { PAINT_MAP = m; try { return _paintChunkS(m, cx, cy); } finally { PAINT_MAP = null; } };
const _groundKeyS = groundKey;
groundKey = function (k, s, theme) {
  if ((k === 'd' || k === 'p' || k === 'st' || k === 's') && s !== 1 && !(PAINT_MAP && (PAINT_MAP.indoor || PAINT_MAP.dark || NOSNOW(PAINT_MAP.id))) && PIX.has(`ground_${k}_${s}`)) return `ground_${k}_${s}`;
  return _groundKeyS(k, s, theme);
};
const OCEAN = new Set(['coast', 'isles', 'reef']);
const _paintKeyS = paintKey;
paintKey = function (m, x, y) {
  const k = _paintKeyS(m, x, y);
  if (k === 'w' && S && S.season === 3 && m.outdoor && !m.indoor && !NOSNOW(m.id)) {
    const X = clamp(x, 0, m.w - 1), Y = clamp(y, 0, m.h - 1);
    if (!(m.bio && OCEAN.has(BIOMES[m.bio[Y * m.w + X]]))) return 'i'; // still water freezes; the sea keeps moving
  }
  return k;
};

/* ---- buildings: winter roofs, and where their windows are ---- */
function bldName(b) {
  if (b.kind === 'site' || b.kind === 'tent') return null;
  let n = b.kind === 'stall' ? 'bld_stall_3x2' : `bld_${b.kind}_${b.w}x${b.h}`;
  const lv = ['coop', 'barn', 'stable'].includes(b.kind) && S.build ? S.build[b.kind] || 1 : 1;
  if (lv > 1 && PIX.map[n + '_l' + lv]) n += '_l' + lv;
  if (b.kind === 'greenhouse' && !(S.build && S.build.greenhouse) && PIX.map[n + '_ruin']) n += '_ruin'; // broken panes until Hale repairs it
  return PIX.map[n] ? n : null;
}
function refreshBuildings() {
  for (const id in MAPS) { const m = MAPS[id]; if (!m || !m.bld) continue;
    for (const b of m.bld) { const n = bldName(b); if (!n) continue; b.winName = n;
      const wn = n + '_w', want = S.season === 3 && m.outdoor !== false && !NOSNOW(m.id) && PIX.map[wn] ? wn : n;
      if (b.sprName === want) continue;
      const c = PIX.get(want); if (!c) continue; const f = PIX.map[n]; c.chim = f.meta && f.meta.chim ? [f.meta.chim[0] / 2, f.meta.chim[1] / 2] : null;
      b.spr = c; b.sprName = want; } }
}
const _initMapsS = initMaps;
initMaps = function () { _initMapsS(); refreshBuildings(); };
const _endDayS = endDay;
endDay = function (f) { const s0 = S.season; _endDayS(f); if (S.season !== s0) refreshBuildings(); };
EVT.on('map', () => { if (S) refreshBuildings(); }); // structures finished or upgraded since

/* ---- the day follows the season ---- */
const SUN = [[360, 1170], [330, 1230], [390, 1140], [420, 1080]]; // sunrise, sunset (minutes) per season
const TINT = ['#f8fff2', '#fffaf0', '#fff0dc', '#eef4ff'];
gradeColor = function (t) {
  const [rise, set] = SUN[S ? S.season : 0];
  const K = [[0, '#5a68a8'], [rise - 70, '#5a68a8'], [rise - 30, '#8a7ab8'], [rise, '#f0b0a0'], [rise + 40, '#ffe0c4'], [rise + 120, '#fff6ea'], [720, '#ffffff'],
    [set - 160, '#fffaf2'], [set - 60, '#ffd8a0'], [set, '#f0a078'], [set + 40, '#a882a8'], [set + 100, '#5a68a8'], [1440, '#5a68a8']];
  let c = [255, 255, 255];
  for (let i = 1; i < K.length; i++) if (t <= K[i][0]) { const [t0, c0] = K[i - 1], [t1, c1] = K[i], k = (t - t0) / (t1 - t0 || 1), a = h2r(c0), b = h2r(c1); c = [0, 1, 2].map(j => a[j] + (b[j] - a[j]) * k); break; }
  const tn = h2r(TINT[S ? S.season : 0]);
  return c.map((v, j) => v * tn[j] / 255);
};
const darkness = () => { const c = gradeColor(((S.time % 1440) + 1440) % 1440), L = (c[0] + c[1] + c[2]) / 765; return clamp((.9 - L) / .42, 0, 1); };

/* ---- after the grade: lit windows, lanterns and fires (crisp, flat colours, no gradients) ---- */
const FLAMES = { lantern: 'lantern', campfire: 'campfire.0', forge: 'forge', shrine: 'shrine' }; // sprites whose atlas meta marks where the flame is
function flameAt(o, x, y) { // world position of an object's flame, from its sprite's meta.light (objects stand bottom-centred on their tile)
  const n = FLAMES[o.k] || (o.on && /^(smelter|stonefurnace|blastfurnace|emberforge)$/.test(o.k) ? o.k + '.1' : null); if (!n) return null;
  const c = PIX.get(n), f = PIX.map[n], L = f && f.meta && f.meta.light; if (!c || !L) return o.on ? [x * 16 + 8, (y + 1) * 16 - 8] : null;
  return [x * 16 + 8 - c.ww / 2 + L[0] / 2, (y + 1) * 16 - c.wh + L[1] / 2];
}
function nightLights(m, Z, cxp, cyp, W, H) {
  if (m.dark || m.indoor) return; const nf = darkness(); if (nf <= .05) return;
  const R = (x, y, w, h, col, a) => { const X = Math.round((x - cxp) * Z), Y = Math.round((y - cyp) * Z), X2 = Math.round((x + w - cxp) * Z), Y2 = Math.round((y + h - cyp) * Z); if (X2 < 0 || Y2 < 0 || X > W || Y > H) return; g.globalAlpha = a; g.fillStyle = col; g.fillRect(X, Y, X2 - X, Y2 - Y); };
  for (const b of m.bld || []) {
    const f = b.winName && PIX.map[b.winName], win = f && f.meta && f.meta.win; if (!win) continue;
    if ((b.x + b.w) * 16 < cxp || b.x * 16 > cxp + W / Z || (b.y + b.h) * 16 < cyp || b.y * 16 > cyp + H / Z) continue;
    const lit = hsh(b.x, b.y, dayIndex()) < .85 || b.act === 'tavern' || b.act === 'r_inn'; if (!lit) continue; // a few households are already asleep
    for (const [wx, wy, ww, wh] of win) { const x = b.x * 16 + wx / 2, y = b.y * 16 + wy / 2; R(x, y, ww / 2, wh / 2, '#ffc864', .8 * nf); R(x, y, ww / 4, wh / 4, '#fff0b8', .7 * nf); }
  }
  const x0 = Math.floor(cxp / 16) - 1, y0 = Math.floor(cyp / 16) - 1, x1 = x0 + Math.ceil(W / Z / 16) + 3, y1 = y0 + Math.ceil(H / Z / 16) + 4;
  for (let y = Math.max(0, y0); y < Math.min(m.h, y1); y++) for (let x = Math.max(0, x0); x < Math.min(m.w, x1); x++) {
    const o = m.o[y * m.w + x]; if (!o) continue; const fl = flameAt(o, x, y); if (!fl) continue;
    const [cx, cy] = fl, fk = Math.floor(gameT * 6 + x) % 2;
    R(cx - 3, cy - 3, 6, 6, '#ffb040', .22 * nf); R(cx - 2, cy - 2, 4, 4, '#ffc864', .5 * nf); R(cx - 1, cy - 1.5 + fk * .5, 2, 2, '#fff4c0', .95 * nf);
  }
  g.globalAlpha = 1;
}
