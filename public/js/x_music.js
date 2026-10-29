/* ================= Music (Phase 15 polish) =================
   Every place and mood has its own short piece, composed from a seed when first heard:
   a key and scale, a tempo, a four-chord progression, a bass line, a soft chord pad on each
   bar, a melody built from a two-bar motif (A A' B A over eight bars, varied every cycle),
   and light percussion where it fits. Pieces:
     spring summer autumn winter (the farm), village, wild, alpine (Highmarch), sea (Saltreach),
     frost (Frostmere), ash (Emberwaste), night, home (indoors), mine, battle (a boss nearby or
     in a fight). Switching place waits for the end of the bar so it never cuts mid-phrase.
   All notes go through snd(); the settings module routes them to the music volume. */

const SONGS = {
  spring: { root: 262, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 96, prog: [0, 3, 4, 0], drums: 1, lead: 'triangle' },
  summer: { root: 294, scale: [0, 2, 4, 7, 9], bpm: 104, prog: [0, 5, 3, 4], drums: 1, lead: 'triangle' },
  autumn: { root: 220, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 88, prog: [0, 3, 6, 4], drums: 0, lead: 'triangle' },
  winter: { root: 247, scale: [0, 2, 4, 7, 9], bpm: 76, prog: [0, 5, 3, 4], drums: 0, lead: 'sine', bells: 1 },
  village: { root: 262, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 110, prog: [0, 4, 5, 3], drums: 1, lead: 'square' },
  wild: { root: 220, scale: [0, 2, 3, 5, 7, 9, 10], bpm: 100, prog: [0, 6, 3, 4], drums: 1, lead: 'triangle' },
  alpine: { root: 196, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 92, prog: [0, 3, 0, 4], drums: 0, lead: 'triangle', bells: 1 },
  sea: { root: 233, scale: [0, 2, 4, 7, 9], bpm: 84, prog: [0, 5, 1, 4], drums: 0, lead: 'sine' },
  frost: { root: 294, scale: [0, 2, 3, 7, 8], bpm: 70, prog: [0, 3, 5, 4], drums: 0, lead: 'sine', bells: 1 },
  ash: { root: 139, scale: [0, 1, 4, 5, 7, 8, 10], bpm: 96, prog: [0, 1, 0, 6], drums: 2, lead: 'sawtooth' },
  night: { root: 196, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 66, prog: [0, 5, 3, 6], drums: 0, lead: 'sine' },
  home: { root: 247, scale: [0, 2, 4, 5, 7, 9, 11], bpm: 80, prog: [0, 3, 1, 4], drums: 0, lead: 'triangle' },
  mine: { root: 147, scale: [0, 1, 3, 5, 7, 8, 10], bpm: 72, prog: [0, 0, 1, 0], drums: 3, lead: 'triangle' },
  battle: { root: 165, scale: [0, 2, 3, 5, 7, 8, 10], bpm: 140, prog: [0, 5, 6, 4], drums: 2, lead: 'square' },
};
const MUS = { name: null, next: null, step: 0, t: 0, song: null };
function compose(name) {
  const D = SONGS[name], r = rng(strSeed ? strSeed(name) * 7 + 11 : name.length * 97), N = D.scale.length;
  const motif = () => { const m = []; let deg = Math.floor(r() * 3) + 2; for (let i = 0; i < 16; i++) { if (r() < (D.bpm > 100 ? .35 : .45)) { m.push(null); continue; } deg = Math.max(0, Math.min(N + 4, deg + Math.floor(r() * 5) - 2)); m.push(deg); } return m; };
  const A = motif(), B = motif(), A2 = A.map((d, i) => (i > 10 && d !== null ? d + (r() < .5 ? 1 : -1) : d));
  return Object.assign({}, D, { mel: [A, A2, B, A] });
}
function degFreq(D, deg, oct = 0) { const N = D.scale.length, o = Math.floor(deg / N), d = ((deg % N) + N) % N; return D.root * Math.pow(2, o + oct + D.scale[d] / 12); }
function moodNow(fallback) {
  if (!S || !cur) return fallback;
  const fight = (typeof TARGET !== 'undefined' && TARGET && !TARGET.dead) || (cur.ents || []).some(e => e.type === 'enemy' && EN[e.k] && EN[e.k].boss && !e.dead && dist(e.x, e.y, S.p.x, S.p.y) < 200);
  if (fight) return 'battle';
  if (cur.dark) return 'mine';
  if (cur.indoor || (cur.id || '').startsWith('in_')) return 'home';
  const t = S.time; if (t >= 1230 || t < 300) return 'night';
  const rg = { highmarch: 'alpine', saltreach: 'sea', frostmere: 'frost', emberwaste: 'ash' }[cur.region || cur.id]; if (rg) return rg;
  if (cur.id === 'village') return S.season === 3 ? 'winter' : 'village';
  if (cur.id === 'wilds') { const b = cur.bio ? BIOMES[cur.bio[Math.floor(S.p.y / 16) * cur.w + Math.floor(S.p.x / 16)]] : null; return b === 'frost' ? 'frost' : b === 'ash' ? 'ash' : 'wild'; }
  return ['spring', 'summer', 'autumn', 'winter'][S.season] || 'spring';
}
musicTick = function (dt, mode) {
  if (!MUSIC_ON || !SOUND_ON || !AC) return;
  const want = moodNow(mode);
  if (want !== MUS.name) { if (!MUS.name || MUS.step % 16 === 0 || want === 'battle') { MUS.name = want; MUS.song = compose(want); MUS.step = 0; MUS.t = 0; } }
  const D = MUS.song; if (!D) return;
  const stepLen = 60 / D.bpm / 2; // eighth notes
  MUS.t -= dt; if (MUS.t > 0) return; MUS.t += stepLen; if (MUS.t < -stepLen) MUS.t = stepLen;
  const s = MUS.step++, bar = (s >> 3) % 8, beat = s % 8, chord = D.prog[(s >> 3) % 4];
  if (beat === 0) for (const k of [0, 2, 4]) snd(degFreq(D, chord + k, -1), stepLen * 7.5, 'sine', .009); // pad
  if (beat % 4 === 0) snd(degFreq(D, chord, -2), stepLen * 3.5, D.drums === 3 ? 'sine' : 'triangle', .03); // bass
  if (beat === 6 && D.bpm > 90) snd(degFreq(D, chord + 4, -2), stepLen * 1.5, 'triangle', .02);
  const phrase = D.mel[(bar >> 1) % 4], n = phrase[(bar % 2) * 8 + beat];
  if (n !== null && n !== undefined) { snd(degFreq(D, chord + n), stepLen * (D.bpm > 110 ? 1.4 : 1.9), D.lead, D.lead === 'square' || D.lead === 'sawtooth' ? .009 : .016); if (D.bells && beat === 2 && bar % 2 === 0) snd(degFreq(D, chord + n), stepLen * 3, 'sine', .004); }
  if (D.drums === 1) { if (beat % 2 === 1) noiseBurst(.03, .008, 6000); if (beat === 0 || beat === 4) snd(70, .1, 'sine', .03, -30); }
  if (D.drums === 2) { if (beat % 2 === 0) snd(60, .12, 'sine', .04, -30); if (beat === 2 || beat === 6) noiseBurst(.08, .02, 1800); noiseBurst(.02, .006, 7000); }
  if (D.drums === 3 && beat === 0 && (s >> 3) % 2 === 0) snd(degFreq(D, chord, -3), .3, 'sine', .02); // a low thud every other bar (no high pings)
};

/* softer gathering and harvest sound: the old one was a bright square-wave ping every gather tick */
SFX.pick = () => { snd(330, .05, 'triangle', .03, -80); noiseBurst(.05, .035, 1800); };
