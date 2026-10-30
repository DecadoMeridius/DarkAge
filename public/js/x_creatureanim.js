/* Creature animation frames (art/sprites/handdrawn.py).
   Walk cycles: an_<species>.0..n and en_<art>.0..n, as many frames as the atlas has (old templates
   have 2, hand-drawn ones 4). Attacks: en_<art>_atk.0 is the wind-up (shown while e.wind runs) and
   en_<art>_atk.1 the strike (while e.lunge runs). Frame 0 is the standing pose. */
const NFR = {};
function animFrames(name) { if (NFR[name] !== undefined) return NFR[name]; let n = 0; while (PIX.has(name + '.' + n)) n++; return NFR[name] = Math.max(1, n); }

animalSpr = (_f => function (sp, coat, f) {
  const n = animFrames('an_' + sp); f = (f || 0) % n;
  const k = sp + coat + 'f' + f; if (ACACHE[k]) return ACACHE[k];
  const Cc = COATS[sp][coat] || Object.values(COATS[sp])[0];
  const c = pixTemplate(`an_${sp}.${f}`, [pixRamp(Cc[0]), pixRamp(Cc[1])]);
  return ACACHE[k] = c || _f(sp, coat, f);
})(animalSpr);

enemySpr = (_f => function (k, f) {
  const E2 = EN[k]; if (!E2 || E2.art === 'human') return _f(k, typeof f === 'string' ? 0 : f % 2);
  const key = k + '|' + f; if (ECACHE[key]) return ECACHE[key];
  const sc = E2.scale || 1, base = 'en_' + E2.art;
  let name = typeof f === 'string' ? base + '_atk.' + f[1] : base + '.' + (f % animFrames(base));
  if (!PIX.has(name)) name = base + '.0';
  let c = pixTemplate(name, [pixRamp(E2.col || '#888888'), pixRamp(sh(E2.col || '#888888', -1.4))], E2.eye ? [[0x2b, 0x1d, 0x18], h2r(E2.eye)] : null);
  if (!c) return _f(k, 0);
  if (sc !== 1) { const s2 = mk(Math.round(c.width * sc), Math.round(c.height * sc), x => x.drawImage(c, 0, 0, Math.round(c.width * sc), Math.round(c.height * sc))); s2.ww = c.ww * sc; s2.wh = c.wh * sc; c = s2; }
  return ECACHE[key] = c;
})(enemySpr);

// which frame an enemy shows now: wind-up, strike, or its walk cycle
function enemyFrame(e) {
  const E2 = EN[e.k], fly = E2.ai === 'fly' || E2.ai === 'swoop';
  if (E2.art !== 'human' && PIX.has('en_' + E2.art + '_atk.0')) { if (e.wind > 0 || e.tele2) return 'a0'; if (e.lunge > 0) return 'a1'; }
  const n = E2.art === 'human' ? 2 : animFrames('en_' + E2.art);
  return Math.floor(e.t * (fly ? 10 : n > 2 ? 7 : 4)) % n;
}
