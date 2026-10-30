/* ================= Render (storybook) ================= */
let camX = 0, camY = 0, HC_P = null, UIDN = 0, lastMap = null, chunkBudget = 16;
const lightC = document.createElement('canvas'), lg = lightC.getContext('2d');
const WEATHER = [], AMB = [], SMOKE = [];
const CHUNK = new Map();
function getChunk(m, cx, cy) {
  if (!m.uid) m.uid = ++UIDN;
  const key = m.uid + '|' + (m.cv || 0) + '|' + cx + ',' + cy + '|' + (m.indoor || m.dark ? 0 : S.season);
  const e = CHUNK.get(key); if (e) { e.t = gameT; return e.c; }
  if (chunkBudget <= 0) return null; chunkBudget--;
  const c = paintChunk(m, cx, cy); CHUNK.set(key, { c, t: gameT });
  if (CHUNK.size > 56) { let ok = null, ot = 1e9; for (const [k2, v] of CHUNK) if (v.t < ot) { ot = v.t; ok = k2; } CHUNK.delete(ok); }
  return c;
}
function playerPal() {
  const b = S.eq.body ? IT[S.eq.body] : null, h = S.eq.helm ? IT[S.eq.helm] : null, bt = S.eq.boots ? IT[S.eq.boots] : null;
  return { skin: '#f6d0ac', hair: '#7a4426', hs: 'short', shirt: b ? b.c : '#4a7cc0', pants: b ? sh(b.c, -1.2) : '#5a4e70', shoe: bt ? bt.c : '#6a4428', acc: '#e8742a', helm: h ? h.c : null, plume: h && h.ti > 8 ? '#e8342a' : null, cape: b && b.ti >= 9 ? '#9a2a2a' : null };
}
function objSprite(o, season) {
  const k = o.k;
  if (k === 'tree') return treeImg(o.kind || 'oak', o.snow ? 3 : season, false, (o._v === undefined ? 0 : o._v));
  if (k === 'ancient') return treeImg('oak', season === 3 ? 3 : 1, false, 1);
  if (k === 'ftree') return o.age >= 14 ? treeImg(o.tree, season, o.fruit > 0) : SPR.sapling[Math.min(2, Math.floor(o.age / 5))];
  if (k === 'weed') return SPR.weed[season];
  if (k === 'tgrass') return SPR.tgrass[season][1];
  if (k === 'bush') return SPR.bush[season][o.ripe ? 1 : 0];
  if (k === 'campfire') return SPR.campfire[Math.floor(gameT * 6) % 3];
  if (k === 'beehive') return SPR.beehive[o.ready ? 1 : 0];
  if (k === 'chest') return SPR.chest[o.opened || (o.id && S && S.flags['c_' + o.id]) ? 1 : 0];
  if (k === 'fg') return itemIcon(o.item);
  if (k === 'flower') return SPR.flower[o.v || 0];
  if (k === 'dig') return SPR.dig[Math.floor(gameT * 3) % 2];
  if (k === 'fairy') return SPR.fairy[Math.floor(gameT * 2) % 2];
  if (k === 'rock') return o.v === 'S' ? SPR.rockS : o.v === 'A' ? SPR.rockA : o.cave ? SPR.rockC : SPR.rock;
  return SPR[k];
}
const FLAT = new Set(['dig', 'page', 'shard', 'fg', 'flower', 'fern', 'cattail', 'shell', 'mushroom', 'buried', 'ladder', 'upladder', 'fairy']);
function D(img, x, y, w, h) { g.drawImage(img, x, y, w || img.ww, h || img.wh); }
function shadow(x, y, r, a = .22) { g.fillStyle = 'rgba(30,20,10,' + a + ')'; const ry = Math.max(1, r * .4); for (let j = -ry; j <= ry; j += .5) { const w = Math.round(r * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry))) * 2) / 2; if (w > 0) g.fillRect(Math.round((x - w) * 2) / 2, Math.round((y + j) * 2) / 2, w * 2, .5); } } // hard-edged pixel shadow
function render(dt) {
  const m = cur; if (!m) return;
  if (m !== lastMap) { lastMap = m; chunkBudget = 24; } else chunkBudget = Math.max(chunkBudget, 2);
  const W = cv.width, H = cv.height, Z = pixZoom(H), vw = W / Z, vh = H / Z, sea = S.season;
  let tx = S.p.x - vw / 2, ty = S.p.y - 12 - vh / 2;
  tx = m.w * 16 < vw ? (m.w * 16 - vw) / 2 : clamp(tx, 0, m.w * 16 - vw); ty = m.h * 16 < vh ? (m.h * 16 - vh) / 2 : clamp(ty, 0, m.h * 16 - vh);
  camX += (tx - camX) * Math.min(1, dt * 8); camY += (ty - camY) * Math.min(1, dt * 8); if (Math.abs(camX - tx) > 160 || Math.abs(camY - ty) > 160) { camX = tx; camY = ty; }
  let sx = 0, sy = 0; if (SHAKE > 0) { sx = (Math.random() - .5) * 3; sy = (Math.random() - .5) * 3; }
  const cxp = Math.round((camX + sx) * Z / 2) * 2 / Z, cyp = Math.round((camY + sy) * Z / 2) * 2 / Z; // snap to the art-pixel grid
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = m.dark ? '#140e0a' : m.indoor ? '#0c080a' : '#2a3a22'; g.fillRect(0, 0, W, H);
  g.setTransform(Z, 0, 0, Z, -cxp * Z, -cyp * Z); g.imageSmoothingEnabled = false;
  const x0 = Math.max(0, Math.floor(cxp / 16) - 1), y0 = Math.max(0, Math.floor(cyp / 16) - 1), x1 = Math.min(m.w, Math.ceil((cxp + vw) / 16) + 1), y1 = Math.min(m.h, Math.ceil((cyp + vh) / 16) + 3);
  // ---- painted terrain chunks ----
  const P = CH * 16;
  for (let cy = Math.floor(y0 / CH); cy <= Math.floor((y1 - 1) / CH); cy++) for (let cx = Math.floor(x0 / CH); cx <= Math.floor((x1 - 1) / CH); cx++) {
    const c = getChunk(m, cx, cy);
    if (c) { const X0 = Math.round((cx * P - cxp) * Z), X1 = Math.round(((cx + 1) * P - cxp) * Z), Y0 = Math.round((cy * P - cyp) * Z), Y1 = Math.round(((cy + 1) * P - cyp) * Z); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(c, c.m, c.m, c.span, c.span, X0, Y0, X1 - X0, Y1 - Y0); g.setTransform(Z, 0, 0, Z, -cxp * Z, -cyp * Z); }
    else for (let y = cy * CH; y < Math.min(m.h, cy * CH + CH); y++) for (let x = cx * CH; x < Math.min(m.w, cx * CH + CH); x++) { g.fillStyle = groundStyle(paintKey(m, x, y), m.dark || m.indoor ? 0 : sea, m.theme).base; g.fillRect(x * 16, y * 16, 16.1, 16.1); }
  }
  // ---- animated water & soil ----
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = y * m.w + x, t = m.t[i];
    if (t === 'w' && hsh(x, y, 7) < .5) { const ph = (gameT * .35 + hsh(x, y, 2)) % 1, X = x * 16 + 2 + hsh(x, y, 4) * 10, Y = y * 16 + 3 + hsh(x, y, 5) * 10; g.globalAlpha = Math.sin(ph * Math.PI) * .55; g.strokeStyle = '#e6f6ff'; g.lineWidth = .6; g.beginPath(); g.moveTo(X - 2 - ph * 3, Y); g.quadraticCurveTo(X, Y - .9, X + 2 + ph * 3, Y); g.stroke(); g.globalAlpha = 1; }
    if (t === 'l' && hsh(x, y, 3) < .35) { const ph = (gameT * .5 + hsh(x, y, 1)) % 1; g.globalAlpha = Math.sin(ph * Math.PI) * .8; g.fillStyle = '#fff2a0'; g.beginPath(); g.arc(x * 16 + 4 + hsh(x, y, 8) * 8, y * 16 + 4 + hsh(x, y, 9) * 8, .8 + ph * 1.6, 0, 6.283); g.fill(); g.globalAlpha = 1; }
    const s0 = m.soil[i];
    if (s0) { const X = x * 16, Y = y * 16, ts = PIX.get(s0.wet ? 'soil_wet' : 'soil_dry'); if (ts) D(ts, X, Y); if (s0.fert) { g.fillStyle = s0.fert === 'growth_tonic' ? '#7ac0ff' : s0.fert === 'rich_compost' ? '#ffd040' : '#c8e08a'; [[3, 13], [12, 3], [11, 12]].forEach(([a, b]) => g.fillRect(X + a, Y + b, 1, 1)); } }
  }
  // ---- sortables ----
  const L = [];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = y * m.w + x, s = m.soil[i];
    if (s && s.crop) { const C = CROPS[s.crop.k], st = s.crop.age >= C.d ? 3 : Math.min(2, Math.floor(s.crop.age / C.d * 3)); L.push({ y: (y + 1) * 16 - 2, f: () => { const spr = cropSpr(s.crop.k, st, s.crop.dead), sw = Math.sin(gameT * 1.6 + x * .9) * .05; g.save(); g.translate(x * 16 + 8, (y + 1) * 16 - 1); g.transform(1, 0, sw, 1, 0, 0); D(spr, -8, -spr.wh + 1); g.restore(); if (st === 3 && !s.crop.dead && Math.floor(gameT * 2 + x) % 5 === 0) { g.fillStyle = '#fffbe0'; g.beginPath(); g.arc(x * 16 + 12, y * 16 - 1, .7, 0, 6.283); g.fill(); } } }); }
    const o = m.o[i]; if (!o || o.k === 'part') continue;
    if (FLAT.has(o.k)) {
      if (o.k === 'buried') { if (hasPerk('tracker') && dist(S.p.x, S.p.y, x * 16, y * 16) < 120 && Math.floor(gameT * 3) % 2) { g.fillStyle = '#ffd040'; g.beginPath(); g.arc(x * 16 + 8, y * 16 + 8, 1.2, 0, 6.283); g.fill(); } continue; }
      const spr = objSprite(o, sea); if (!spr) continue;
      if (o.k === 'fg' || o.k === 'page' || o.k === 'shard') { const b = Math.sin(gameT * 3 + x) * 1.2; shadow(x * 16 + 8, y * 16 + 14, 5); D(spr, x * 16 + 2, y * 16 + 1 + b, 12, 12); if (o.k !== 'fg' && Math.floor(gameT * 4 + x) % 3 === 0) { g.fillStyle = o.k === 'shard' ? '#ffe08a' : '#fff'; g.beginPath(); g.arc(x * 16 + 3 + (gameT * 7 % 10), y * 16 + 2, .7, 0, 6.283); g.fill(); } }
      else D(spr, x * 16 + (16 - spr.ww) / 2, (y + 1) * 16 - spr.wh);
      continue;
    }
    const spr = objSprite(o, sea); if (!spr) continue; const DD = OBJ[o.k] || {}, w = (DD.w || 1) * 16;
    if (o.k === 'tree' && o._v === undefined) o._v = hsh(x, y, 11) < .5 ? 0 : 1;
    L.push({ y: (y + 1) * 16 - (o.k === 'tgrass' ? 6 : 1), f: () => {
      let ox = 0; if (o.shake > 0) { o.shake -= dt; ox = Math.sin(gameT * 60) * 1.2; }
      const dx = x * 16 + (w - spr.ww) / 2 + ox, isTree = DD.tree || o.k === 'ftree' || o.k === 'ancient', dy = (y + 1) * 16 - spr.wh + (isTree ? 3 : 0);
      if (isTree || o.k === 'tgrass' || o.k === 'bush') {
        const amp = o.k === 'tgrass' ? .14 : isTree ? .03 : .04, sw = Math.sin(gameT * (o.k === 'tgrass' ? 2.2 : 1.1) + x * .7 + y * .3) * amp;
        const behind = isTree && S.p.x > dx + 4 && S.p.x < dx + spr.ww - 4 && S.p.y < (y + 1) * 16 - 3 && S.p.y > dy + 8;
        if (behind) g.globalAlpha = .25;
        g.save(); g.translate(x * 16 + w / 2, (y + 1) * 16); g.transform(1, 0, sw, 1, 0, 0); D(spr, dx - x * 16 - w / 2, dy - (y + 1) * 16); g.restore(); g.globalAlpha = 1;
      } else D(spr, dx, dy);
      if (DD.mach && o.out && o.left <= 0) { const b = Math.sin(gameT * 4) * 1.5; g.fillStyle = 'rgba(255,250,235,.92)'; g.beginPath(); g.arc(x * 16 + 8, dy - 6 + b, 7, 0, 6.283); g.fill(); g.strokeStyle = INK; g.lineWidth = .5; g.stroke(); D(itemIcon(o.out), x * 16 + 2.5, dy - 11.5 + b, 11, 11); }
      if (o.k === 'ancient' && Math.floor(gameT * 2 + x) % 6 === 0) { g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(x * 16 + 6, dy + 22, .8, 0, 6.283); g.fill(); }
    } });
  }
  for (const b of m.bld) if (b.x * 16 < cxp + vw && (b.x + b.w) * 16 > cxp && b.y * 16 < cyp + vh + 32 && (b.y + b.h) * 16 > cyp) {
    L.push({ y: (b.y + b.h) * 16 - 1, f: () => { D(b.spr, b.x * 16, b.y * 16); /* an unrepaired greenhouse uses its ruined sprite (v_seasons.js bldName) */ } });
    if (b.spr.chim && Math.random() < dt * 2.2) SMOKE.push({ x: b.x * 16 + b.spr.chim[0], y: b.y * 16 + b.spr.chim[1], t: 0, s: Math.random() });
  }
  if (m.id === 'farm') for (const a of S.animals) { if (S.mounted && a.id === S.rideId) continue; L.push({ y: a.y, f: () => drawAnimal(a) }); }
  for (const n of m.npcs || []) L.push({ y: n.y, f: () => { shadow(n.x, n.y, 6); const N = NPCS[n.id]; D(humanSpr('npc' + n.id, N.P, n.dir || 0, n.walk ? 'w' + Math.floor(gameT * 10) % 8 : 0), n.x - 8, n.y - 31, 16, 32); } });
  for (const e of m.ents) L.push({ y: e.y, f: () => drawEnt(e) });
  if (!TITLE) L.push({ y: S.p.y, f: drawPlayer });
  L.sort((a, b) => a.y - b.y); for (const q of L) q.f();
  // smoke
  for (const s of SMOKE) { s.t += dt; s.y -= dt * 7; s.x += dt * (2 + s.s * 3) + Math.sin(s.t * 2 + s.s * 9) * .1; const r = 1.5 + s.t * 2.2, a = Math.max(0, .35 - s.t * .1); g.fillStyle = 'rgba(235,230,225,' + a + ')'; pixDisc(s.x, s.y, r); }
  for (let i = SMOKE.length - 1; i >= 0; i--) if (SMOKE[i].t > 3.5) SMOKE.splice(i, 1);
  for (const e of m.ents) if (e.type === 'enemy' && e.tele) { g.strokeStyle = 'rgba(255,90,60,' + (.4 + e.tele * .5) + ')'; g.lineWidth = 1.2; g.setLineDash([3, 2]); g.beginPath(); g.arc(e.ai.sx, e.ai.sy, 36 * e.tele, 0, 6.283); g.stroke(); g.setLineDash([]); g.fillStyle = 'rgba(255,60,40,' + e.tele * .18 + ')'; g.fill(); }
  if (m.id === 'wilds' && S.tmap && hasPerk('tracker') && dist(S.p.x / 16, S.p.y / 16, S.tmap.x, S.tmap.y) < 14) { g.strokeStyle = '#d8342a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(S.tmap.x * 16 + 3, S.tmap.y * 16 + 3); g.lineTo(S.tmap.x * 16 + 13, S.tmap.y * 16 + 13); g.moveTo(S.tmap.x * 16 + 13, S.tmap.y * 16 + 3); g.lineTo(S.tmap.x * 16 + 3, S.tmap.y * 16 + 13); g.stroke(); }
  for (const p of PARTS) { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 170 * dt; g.fillStyle = p.c; g.fillRect(Math.round(p.x * 2) / 2 - .5, Math.round(p.y * 2) / 2 - .5, 1, 1); }
  PARTS = PARTS.filter(p => p.t > 0);
  g.textAlign = 'center'; g.lineJoin = 'round';
  for (const f of FX) { f.t -= dt; f.y -= dt * 16; g.globalAlpha = Math.min(1, f.t * 2); g.font = '600 ' + (f.big ? '11' : '8') + 'px Fredoka, sans-serif'; g.strokeStyle = 'rgba(59,42,32,.9)'; g.lineWidth = 2.2; g.strokeText(f.txt, f.x, f.y); g.fillStyle = f.c; g.fillText(f.txt, f.x, f.y); }
  g.globalAlpha = 1; FX = FX.filter(f => f.t > 0);
  if (fishing && fishing.phase === 'bite') { g.font = '700 16px Fredoka, sans-serif'; g.strokeStyle = INK; g.lineWidth = 3; g.strokeText('!', S.p.x, S.p.y - 38); g.fillStyle = '#ffd040'; g.fillText('!', S.p.x, S.p.y - 38); } // rod, line and bobber are drawn with the player (y_anim.js)
  pcCursorDraw(m);
  ambient(m, dt, cxp, cyp, vw, vh);
  // ---- time of day and weather: one flat colour grade over the whole screen (no light map) ----
  g.setTransform(1, 0, 0, 1, 0, 0); pixGrade(m, W, H); if (typeof nightLights === 'function') nightLights(m, Z, cxp, cyp, W, H); // windows and flames stay bright after dark
  if (m.outdoor && (S.weather === 'rain' || S.weather === 'snow') && !(m.bio && BIOMES[m.bio[Math.floor(S.p.y / 16) * m.w + Math.floor(S.p.x / 16)]] === 'ash')) {
    while (WEATHER.length < 130 * (typeof PARTICLE_K !== 'undefined' ? PARTICLE_K : 1)) WEATHER.push({ x: Math.random() * W, y: Math.random() * H, s: .6 + Math.random() * .6 });
    g.strokeStyle = S.weather === 'rain' ? 'rgba(190,215,240,.5)' : 'rgba(255,255,255,.9)'; g.fillStyle = '#fff'; g.lineWidth = DPR;
    for (const p of WEATHER) { if (S.weather === 'rain') { p.y += 620 * p.s * dt * DPR; p.x -= 90 * dt * DPR; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - 3 * DPR, p.y + 12 * DPR); g.stroke(); } else { p.y += 40 * p.s * dt * DPR; p.x += Math.sin(gameT + p.s * 9) * 20 * dt * DPR; g.beginPath(); g.arc(p.x, p.y, 1.4 * DPR * p.s, 0, 6.283); g.fill(); } if (p.y > H) { p.y = -10; p.x = Math.random() * W * 1.2; } }
    
  }
  if (pl.inv > .6) { g.fillStyle = 'rgba(200,30,20,' + ((pl.inv - .6) * .45) + ')'; g.fillRect(0, 0, W, H); }
  if (pl.chill > 0) { g.fillStyle = 'rgba(140,200,255,.12)'; g.fillRect(0, 0, W, H); }
  const boss = m.ents.find(e => e.type === 'enemy' && EN[e.k].boss && dist(e.x, e.y, S.p.x, S.p.y) < 340);
  const bb = $('#bossbar'); if (bb) { if (boss) { bb.hidden = false; $('#bossname').textContent = EN[boss.k].n; $('#bosshp').style.width = Math.max(0, boss.hp / boss.mhp * 100) + '%'; } else bb.hidden = true; }
}
function drawAnimal(a) {
  const A = ANIMAL[a.sp], baby = a.age < A.adult, spr = animalSpr(a.sp, a.coat, Math.floor((a.walk || 0) * 6) % 2), sc = (baby ? .62 : 1) * (a.traits.includes('giant') ? 1.15 : 1), w = spr.ww * sc, h = spr.wh * sc;
  shadow(a.x, a.y, w * .4);
  g.save(); g.translate(a.x, a.y); if (a.dir < 0) g.scale(-1, 1); const bob = a.vx || a.vy ? Math.abs(Math.sin((a.walk || 0) * 12)) * .5 : 0; D(spr, -w / 2, -h - bob, w, h); g.restore();
  if (a.traits.includes('radiant') && Math.floor(gameT * 3 + a.id) % 4 === 0) { g.fillStyle = '#fff6a8'; g.beginPath(); g.arc(a.x + (Math.random() - .5) * w, a.y - Math.random() * h, .8, 0, 6.283); g.fill(); }
  if (!a.pet) { const b = Math.sin(gameT * 3 + a.id) * 1; g.font = '700 9px Fredoka, sans-serif'; g.textAlign = 'center'; g.strokeStyle = INK; g.lineWidth = 2; g.strokeText('♥', a.x, a.y - h - 2 + b); g.fillStyle = '#ff8ab0'; g.fillText('♥', a.x, a.y - h - 2 + b); }
  if (a.preg) { g.fillStyle = '#ffd040'; g.beginPath(); g.arc(a.x, a.y - h - 9, 1.2, 0, 6.283); g.fill(); }
}
function drawEnt(e) {
  if (e.type === 'drop') { shadow(e.x, e.y + 1, 5); const ic = itemIcon(e.id === '$' ? 'gold_ore' : e.id); D(ic, e.x - 6, e.y - 12 - e.z + (e.z ? 0 : Math.sin(e.t * 4)), 12, 12); return; }
  if (e.type === 'proj') {
    const glow = (r, c0, c1) => { const gr = g.createRadialGradient(e.x, e.y, 0, e.x, e.y, r); gr.addColorStop(0, c0); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.arc(e.x, e.y, r, 0, 6.283); g.fill(); };
    if (e.k === 'fire') { glow(6, 'rgba(255,200,90,.9)', 'rgba(255,90,20,0)'); g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(e.x, e.y, 1.8, 0, 6.283); g.fill(); }
    else if (e.k === 'ice') { glow(5, 'rgba(220,245,255,.9)', 'rgba(120,200,255,0)'); g.fillStyle = '#fff'; g.beginPath(); g.arc(e.x, e.y, 1.5, 0, 6.283); g.fill(); }
    else if (e.k === 'void') { glow(5.5, 'rgba(220,120,255,.9)', 'rgba(90,40,160,0)'); g.fillStyle = '#ffd8ff'; g.beginPath(); g.arc(e.x, e.y, 1.4, 0, 6.283); g.fill(); }
    else if (e.k === 'arrow') { const a = Math.atan2(e.vy, e.vx); g.save(); g.translate(e.x, e.y); g.rotate(a); g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-6, 0); g.lineTo(4, 0); g.stroke(); g.strokeStyle = '#c8945a'; g.lineWidth = .7; g.stroke(); g.fillStyle = '#d8dee4'; g.beginPath(); g.moveTo(6, 0); g.lineTo(3, -1.6); g.lineTo(3, 1.6); g.fill(); g.restore(); }
    else { g.fillStyle = '#9a948a'; g.strokeStyle = INK; g.lineWidth = .5; g.beginPath(); g.arc(e.x, e.y, 2.2, 0, 6.283); g.fill(); g.stroke(); }
    return;
  }
  const E2 = EN[e.k], spr = enemySpr(e.k, Math.floor(e.t * (E2.ai === 'fly' || E2.ai === 'swoop' ? 8 : 4)) % 2);
  if (E2.ai === 'ambush' && !e.awake) { D(SPR.rock, e.x - 8, e.y - 14); return; }
  const air = E2.ai === 'fly' || E2.ai === 'swoop' ? 10 + Math.sin(e.t * 5) * 2 : E2.ai === 'ghost' ? 4 + Math.sin(e.t * 2) * 2 : (e.hopT > 0 ? Math.sin(e.hopT / .35 * Math.PI) * 6 : 0);
  shadow(e.x, e.y, Math.max(5, spr.ww * .32));
  const AN = typeof enemyAnim === 'function' ? enemyAnim(e, E2) : { x: 0, y: 0, sx: 1, sy: 1 }; g.save(); g.translate(e.x + AN.x, e.y - air + AN.y); if (e.dir < 0 && E2.art !== 'human' && E2.art !== 'slime') g.scale(-1, 1); g.scale(AN.sx, AN.sy);
  const squash = E2.art === 'slime' && e.hopT > 0 ? 1 + Math.sin(e.hopT / .35 * Math.PI) * .12 : 1; g.scale(1 / squash, squash);
  if (e.flash > 0) g.filter = 'brightness(2.6)'; else if (e.st.burn > 0) g.filter = 'sepia(.8) saturate(2.5) hue-rotate(-20deg)'; else if (e.st.slow > 0) g.filter = 'hue-rotate(160deg) saturate(.7) brightness(1.15)';
  if (e.tele2) g.translate((Math.random() - .5) * 2, 0);
  D(spr, -spr.ww / 2, -spr.wh); g.filter = 'none'; g.restore();
  if (!E2.boss && e.hp < e.mhp) { const bw = 16, bx = e.x - 8, by = e.y - spr.wh - 5 - air; g.fillStyle = 'rgba(59,42,32,.85)'; g.beginPath(); g.roundRect ? g.roundRect(bx - .8, by - .8, bw + 1.6, 3.6, 1.8) : g.rect(bx, by, bw, 2); g.fill(); g.fillStyle = '#e84a3a'; g.beginPath(); g.roundRect ? g.roundRect(bx, by, Math.max(.5, bw * e.hp / e.mhp), 2, 1) : g.rect(bx, by, bw * e.hp / e.mhp, 2); g.fill(); }
}
function drawPlayer() {
  const p = S.p, P = playerPal(); if (!HC_P) HC_P = 'pl' + Math.random().toString(36).slice(2, 7);
  const f = pl.moving ? Math.floor(gameT * (S.mounted ? 10 : 8)) % 4 : 0;
  if (pl.inv > 0 && Math.floor(gameT * 20) % 2) return;
  if (S.mounted) {
    const h = rideHorse(); if (!h) { S.mounted = false; return; }
    const spr = animalSpr('horse', h.coat, pl.moving ? Math.floor(gameT * 10) % 2 : 0), right = p.dir === 2 || (p.dir !== 1 && p.lastH !== 1);
    shadow(p.x, p.y, 14); g.save(); g.translate(p.x, p.y); if (!right) g.scale(-1, 1); D(spr, -spr.ww / 2, -spr.wh + 1); g.restore();
    const ps = humanSpr(HC_P, P, 2, 'ride'); g.save(); g.translate(p.x, p.y); if (!right) g.scale(-1, 1); D(ps, -10, -41, 16, 32); g.restore(); return; // seated in the saddle
  }
  shadow(p.x, p.y, 6.5);
  const spr = humanSpr(HC_P, P, p.dir, f);
  if (pl.roll > 0) { g.save(); g.translate(p.x, p.y); g.scale(1.06, .8); D(spr, -8, -31, 16, 32); g.restore(); if (Math.random() < .5) PARTS.push({ x: p.x, y: p.y, vx: (Math.random() - .5) * 20, vy: -10, t: .3, c: '#d8c4a0' }); return; }
  const back = p.dir === 3;
  const drawWeap = () => {
    if (pl.swing > 0) {
      const wt = PS.wt, prog = 1 - pl.swing / pl.swingT, d = DIRV[p.dir], base = Math.atan2(d[1], d[0]), ic = itemIcon(S.eq.weapon);
      g.save(); g.translate(p.x, p.y - 14);
      if (wt === 'spear' || wt === 'dagger') { const ext = Math.sin(prog * Math.PI) * (wt === 'spear' ? 14 : 8); g.rotate(base + Math.PI / 4); D(ic, -2 + ext * .7, -14 - ext * .7, 16, 16); }
      else if (wt === 'bow') { g.rotate(base + Math.PI / 4 - .2); D(ic, 0, -16, 16, 16); }
      else { const a = base - 1.3 + prog * 2.6; g.rotate(a + Math.PI / 4); D(ic, -2, -18, wt === 'hammer' ? 18 : 16, wt === 'hammer' ? 18 : 16); }
      g.restore();
      if (wt !== 'bow' && wt !== 'spear') { g.strokeStyle = 'rgba(255,255,245,' + Math.min(.75, pl.swing * 4) + ')'; g.fillStyle = g.strokeStyle; for (let q = 0; q <= 18; q++) { const an = base - 1.3 + prog * 2.6 * q / 18; g.fillRect(Math.round((p.x + Math.cos(an) * 16) * 2) / 2 - .5, Math.round((p.y - 14 + Math.sin(an) * 16) * 2) / 2 - .5, 1.5, 1.5); } }
    } else if (pl.anim > 0 && pl.tool && isTool(pl.tool) && pl.tool !== 'weapon') {
      const d = DIRV[p.dir], k = pl.anim / .25, ic = itemIcon('tool:' + pl.tool + ':' + (S.tools[pl.tool] || 1));
      g.save(); g.translate(p.x + d[0] * 9, p.y - 16 + d[1] * 4); g.rotate((d[0] || 1) * (k - .5) * 1.6 * (p.dir === 1 ? -1 : 1)); D(ic, -6, -12, 12, 12); g.restore();
    }
  };
  if (back) drawWeap(); D(spr, p.x - 8, p.y - 31, 16, 32); if (!back) drawWeap();
  if (pl.burn > 0 && Math.random() < .3) PARTS.push({ x: p.x + (Math.random() - .5) * 8, y: p.y - 10 - Math.random() * 14, vx: 0, vy: -24, t: .4, c: '#ff8a3a' });
}
function ambient(m, dt, cxp, cyp, vw, vh) {
  let kind = null; if (m.outdoor) { const b = m.bio ? BIOMES[m.bio[Math.floor(S.p.y / 16) * m.w + Math.floor(S.p.x / 16)]] : null; if (b === 'frost') kind = 'snow'; else if (b === 'ash') kind = 'ember'; else if (S.season === 2 && (b === 'forest' || m.id === 'farm' || b === 'meadow')) kind = 'leaf'; else if (S.season === 1 && (S.time > 1140 || S.time < 300)) kind = 'firefly'; else if (S.season === 1 && b !== 'coast') kind = 'butterfly'; else if (S.season === 3 && b !== 'ash' && S.weather !== 'snow') kind = 'snowmote'; else if (S.season === 0 && b !== 'coast') kind = 'petal'; }
  if (m.dark) kind = 'dust';
  if (!kind) { AMB.length = 0; return; }
  const N = Math.round((kind === 'snow' ? 70 : kind === 'firefly' ? 18 : 26) * (typeof PARTICLE_K !== 'undefined' ? PARTICLE_K : 1));
  while (AMB.length < N) AMB.push({ x: cxp + Math.random() * vw, y: cyp + Math.random() * vh, s: Math.random(), k: kind });
  for (const p of AMB) {
    if (p.k !== kind) { p.k = kind; }
    if (kind === 'snow') { p.y += (12 + p.s * 14) * dt; p.x += Math.sin(gameT + p.s * 9) * 8 * dt; g.fillStyle = '#ffffff'; g.fillRect(p.x, p.y, p.s > .6 ? 2 : 1, p.s > .6 ? 2 : 1); }
    else if (kind === 'ember') { p.y -= (8 + p.s * 10) * dt; p.x += Math.sin(gameT * 2 + p.s * 9) * 6 * dt; g.fillStyle = p.s > .5 ? '#ff8a3a' : '#ffd36a'; g.fillRect(p.x, p.y, 1, 1); }
    else if (kind === 'leaf') { p.y += (10 + p.s * 8) * dt; p.x += Math.sin(gameT * 1.5 + p.s * 9) * 14 * dt; g.fillStyle = p.s > .5 ? '#d9822b' : '#c8452f'; g.fillRect(p.x, p.y, 2, 1); }
    else if (kind === 'butterfly') { p.x += Math.sin(gameT * 1.3 + p.s * 20) * 14 * dt; p.y += Math.cos(gameT * 1.1 + p.s * 17) * 9 * dt; const w = Math.floor(gameT * 10 + p.s * 9) % 2; g.fillStyle = ['#ffe060', '#ffffff', '#ff9ac0', '#a8c8ff'][Math.floor(p.s * 6.6) % 4]; g.fillRect(p.x - (w ? 1 : .5), p.y, w ? 2 : 1, 1); g.fillRect(p.x + .5, p.y, w ? 1.5 : .5, 1); }
    else if (kind === 'snowmote') { p.y += (4 + p.s * 5) * dt; p.x += Math.sin(gameT * .7 + p.s * 9) * 5 * dt; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(p.x, p.y, .5, .5); }
    else if (kind === 'petal') { p.y += (6 + p.s * 6) * dt; p.x += (6 + Math.sin(gameT + p.s * 9) * 8) * dt; g.fillStyle = '#ffc8d8'; g.fillRect(p.x, p.y, 1, 1); }
    else if (kind === 'firefly') { p.x += Math.sin(gameT * .8 + p.s * 20) * 10 * dt; p.y += Math.cos(gameT * .7 + p.s * 15) * 8 * dt; if (Math.sin(gameT * 3 + p.s * 30) > 0) { g.fillStyle = '#e8ff8a'; g.fillRect(p.x, p.y, 1, 1); g.fillStyle = 'rgba(232,255,138,.3)'; g.fillRect(p.x - 1, p.y - 1, 3, 3); } }
    else if (kind === 'dust') { p.y += Math.sin(gameT + p.s * 9) * 2 * dt; p.x += 2 * dt; g.fillStyle = 'rgba(255,240,200,.25)'; g.fillRect(p.x, p.y, 1, 1); }
    if (p.y > cyp + vh + 4 || p.y < cyp - 6 || p.x > cxp + vw + 6 || p.x < cxp - 6) { p.x = cxp + Math.random() * vw; p.y = kind === 'ember' ? cyp + vh : kind === 'snow' || kind === 'leaf' || kind === 'petal' || kind === 'snowmote' ? cyp - 2 : cyp + Math.random() * vh; }
  }
}
function nightAlpha() { const t = S.time; if (t < 1080) return 0; if (t < 1260) return (t - 1080) / 180 * .48; return Math.min(.6, .48 + (t - 1260) / 300 * .17); }
function duskWarm() { const t = S.time; if (t < 1000 || t > 1230) return 0; return Math.sin((t - 1000) / 230 * Math.PI) * .13; }
let MAPBASE = null;
function worldMapCanvas() {
  const m = MAPS.wilds;
  if (!MAPBASE) MAPBASE = mk(m.w, m.h, x => { const d = x.createImageData(m.w, m.h); for (let i = 0; i < m.w * m.h; i++) { const t = m.t[i], b = BIOMES[m.bio[i]]; let c = BIOCOL[b]; if (t === 'w') c = b === 'coast' ? '#2f74b8' : '#3d8fd0'; else if (t === 'l') c = '#e0561c'; else if (t === 'r') c = '#6e6252'; else if (t === 'd' || t === 'b') c = '#c49a64'; else if (t === 's') c = '#ecd59a'; else if (t === 'i') c = '#bfe3f2'; else if (t === 'st') c = '#a39b8c'; const o = m.o[i]; if (o && (o.k === 'tree' || o.k === 'ancient')) c = sh(c, -1.2); const [r, g2, bb] = h2r(c); d.data.set([r, g2, bb, 255], i * 4); } for (const b of m.bld) for (let j = 0; j < b.h; j++) for (let k = 0; k < b.w; k++) d.data.set([90, 60, 40, 255], ((b.y + j) * m.w + b.x + k) * 4); x.putImageData(d, 0, 0); });
  return mk(m.w * 3, m.h * 3, x => {
    x.imageSmoothingEnabled = false; x.drawImage(MAPBASE, 0, 0, m.w * 3, m.h * 3);
    for (let j = 0; j < 38; j++) for (let i = 0; i < 50; i++) if (!EXPL[j * 50 + i]) { x.fillStyle = '#d8c090'; x.fillRect(i * 12, j * 12, 12, 12); x.fillStyle = '#ccb27e'; x.fillRect(i * 12 + ((i + j) % 3) * 3, j * 12 + 4, 2, 2); }
    const S2 = S.poiSeen || {}, ic = { mine: '⛏', arena: '☠', shrine: '✦', cave: '◘', grove: '♣', ruins: '♜', hut: '⌂', wreck: '⚓', cabin: '⌂', fairy: '✿', merchant: '$', cross: '✚' };
    x.font = '14px Fredoka, sans-serif'; x.textAlign = 'center';
    m.poi.forEach((p, i) => { if (!S2[i]) return; const done = p.type === 'arena' ? S.bosses[p.boss] : p.type === 'shrine' ? S.shrines[p.bio] : 0; x.fillStyle = OUT; x.fillText(ic[p.type] || '•', p.x * 3 + 1, p.y * 3 + 6); x.fillStyle = done ? '#7ac04a' : p.type === 'arena' ? '#ff5a3a' : '#fff6d0'; x.fillText(ic[p.type] || '•', p.x * 3, p.y * 3 + 5); });
    if (S.tmap) { x.strokeStyle = '#d8342a'; x.lineWidth = 3; const X = S.tmap.x * 3, Y = S.tmap.y * 3; x.beginPath(); x.moveTo(X - 6, Y - 6); x.lineTo(X + 6, Y + 6); x.moveTo(X + 6, Y - 6); x.lineTo(X - 6, Y + 6); x.stroke(); }
    if (S.meteor) { x.fillStyle = '#fff6a8'; x.fillText('★', S.meteor.x * 3, S.meteor.y * 3 + 5); }
    if (hasPerk('tracker')) for (const [sx, sy] of m.secrets || []) if (EXPL[Math.floor(sy / 4) * 50 + Math.floor(sx / 4)]) { x.fillStyle = '#ffd040'; x.fillRect(sx * 3 - 1, sy * 3 - 1, 3, 3); }
    if (cur.id === 'wilds') { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(S.p.x / 16 * 3, S.p.y / 16 * 3, 5, 0, 6.283); x.fill(); x.fillStyle = '#e8342a'; x.beginPath(); x.arc(S.p.x / 16 * 3, S.p.y / 16 * 3, 3, 0, 6.283); x.fill(); }
    x.fillStyle = OUT; x.font = '18px Fredoka, sans-serif'; x.fillText('Farm', 60 * 3, (m.h - 2) * 3); x.fillText('Village', 100 * 3, (m.h - 2) * 3);
  });
}
