/* The welcome: an in-world tutorial for a new game (asked for 2026-10-31: "a welcome where the lord shows up
   and explains a bit, then the tutorial needs to feel immersive as well").
   - After the character creator, Lord Ashcombe walks up the farm road to your tent instead of the arrival
     letter. He knew your grandmother, and he offers to show you round (or leaves a veteran to it).
   - The tutorial is a story, `STORIES.welcome` ("A New Start"), so it has the dialogue box, the tracker
     and a journal entry. Each task is a `cond` step: when you finish it, Ashcombe calls out the next one.
   - He stands by the tent while you work (talk to him for the current task) and walks home once he's
     sent you to the village. A note on the tent the next morning ends it.
   - Runtime only: his walker is a hidden NPCS entry (`tut_ashcombe`) in MAPS.farm.npcs; the state is
     S.flags.tutorial / tutWalk and the story's own S.story.q.welcome. Older saves never see it. */

Object.defineProperty(NPCS, 'tut_ashcombe', { value: { n: 'Lord Ashcombe', role: 'Landowner', shop: 'k_tut', P: SCAST.ashcombe.P, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
const AL = (...t) => t.map(x => ['ashcombe', x]);
const soilDone = k => START_STEPS[k][1]();

STORIES.welcome = {
  n: 'A New Start', blurb: 'Lord Ashcombe shows you round your grandmother\'s farm.', how: 'Lord Ashcombe is showing you round.',
  start: () => !!(S.flags && S.flags.tutorial),
  ch: [
    { n: 'Hollowmere', steps: [
      { t: 'cond', test: () => cnt('hay') > 0, hint: 'Clear some weeds by the tent with the scythe (6).',
        lines: AL("That's the way. Weeds give fibre and hay, and you'll want both. Nothing on a farm is wasted.",
          "Now the soil. Take the hoe (1) and break a few tiles of ground. Somewhere flat and sunny, near water if you can.") },
      { t: 'cond', test: () => soilDone(1), hint: 'Till a few tiles of soil with the hoe (1).',
        lines: AL("Good dark earth under all that grass. Your grandmother swore by this meadow.",
          "You've turnip and potato seeds on your belt (8 and 9). Plant them in the tilled ground.") },
      { t: 'cond', test: () => soilDone(2), hint: 'Plant seeds (8, 9) on the tilled soil.',
        lines: AL("Seeds want water every day, or they sit and sulk. Take the can (2) to them.",
          "When the can runs dry, fill it at the pond. Walk to the water's edge and use it there.") },
      { t: 'cond', test: () => soilDone(3), hint: 'Water your crops with the watering can (2).',
        lines: AL("Watered crops grow a day each morning. Dry ones don't.",
          "You'll need timber before long. Take the axe (3) to a tree, or to the twigs and stumps lying about.") },
      { t: 'cond', test: () => (S.sk.woodcutting.tx || 0) > 0, hint: 'Chop a tree, a stump or some twigs with the axe (3).',
        lines: AL("Good swing. Stone next: there are rocks all over this meadow. The pickaxe (4) will split them.") },
      { t: 'cond', test: () => (S.sk.mining.tx || 0) > 0, hint: 'Break a rock with the pickaxe (4).',
        lines: AL("Wood and stone. Every building you'll ever raise starts with those two.",
          "That old workbench by the tent was your grandmother's. Make yourself something on it. A few fence posts, say. Walk up to it and press E.") },
      { t: 'cond', test: () => (S.stats.crafted || 0) > (S.flags.tutCraft0 || 0), hint: 'Make something at the workbench by your tent (walk up, press E).',
        lines: AL("Ha. She'd be pleased. She built half this valley's fences with her own hands, and quarrelled over the other half.",
          "That's my morning spent. Walk with me to the village. The road east, past the signpost. Mara keeps the store there; she'll sell you more seeds.",
          "And mind the time. Be in your tent by two in the morning, or you'll wake up somewhere you'd rather not.") },
      { t: 'go', at: 'village:plaza', r: 8, hint: 'Follow the road east to Emberhollow village.',
        lines: [['narr', 'Emberhollow: a fountain, a few shopfronts, smoke from the tavern chimney, and people who all turn to look at the new farmer.'],
          ['ashcombe', "Here we part. The manor's on the hill, if you ever want more land. Good luck, farmer. You'll need less of it than you think."]] },
      { t: 'talk', who: 'mara', hint: 'Say hello to Mara at the general store.',
        lines: [['mara', "You're the new one at Hollowmere! Lord Ashcombe sent word you'd be by."], ['mara', "Seeds, tools, a bit of everything. I'm open nine till five. Come back when you've coin and I'll find you something that grows."]] },
      { t: 'cond', test: () => S.day > 1 || S.season > 0 || S.year > 1, hint: 'Sleep in your tent (before 2 am) to start a new day.',
        lines: [['narr', 'A note is pinned to the tent flap, in a neat old hand:'],
          ['narr', '"Your crops will want water every day, and your purse wants a shipping bin: put what you grow in the bin by the tent and it sells overnight. The Wilds lie north; don\'t go far without bread. Come to the manor when you\'re ready for more land. A."']] },
    ], reward: { gold: 250, items: { trail_bread: 3 } } },
  ],
};

// the walk-in: Ashcombe comes up the road from the village to wherever you are
const TUT = { n: null, path: null, pi: 0, re: 0 };
function tutSpawn() {
  const m = MAPS.farm; if (!m) return; m.npcs = (m.npcs || []).filter(n => n.id !== 'tut_ashcombe');
  const sx = Math.min(m.w - 3, 32), sy = 16, x = (sx + .5) * 16, y = (sy + .8) * 16;
  TUT.n = { id: 'tut_ashcombe', tut: 1, x, y, hx: x, hy: y, dir: 1, walk: false, t: 1e9, vx: 0 }; TUT.path = null; TUT.re = 0;
  m.npcs.push(TUT.n);
}
function tutIntro() {
  S.flags.tutWalk = 1; tutSpawn(); PAUSED = false;
  toast('Footsteps on the road: an old gentleman in a dark red cape is walking up from the village.');
}
function tutWelcome() {
  S.flags.tutWalk = 2;
  storyDialog(AL("So you're the grandchild. You have her chin. Let's hope you have her stubbornness too.",
      "Ashcombe. I own most of the land between here and the river, and I sold your grandmother this meadow forty years ago. Cheapest sale I ever made, and the best.",
      "It's gone to weeds since she passed. A tent, a campfire and her old workbench, and that's your inheritance. But the soil is good. She always said so.",
      "I can spare you a morning. Shall I show you the lie of the land?"),
    { title: 'Hollowmere Farm', choices: [
      ['Show me around', () => { S.flags.tutorial = 1; S.flags.tutCraft0 = S.stats.crafted || 0; storyState(); S.story.track = 'welcome';
        storyDialog(AL("Splendid. First, these weeds. There's a scythe on your belt (6). Give them a swing, close to the tent."), { title: 'Hollowmere Farm' }); }],
      ['I know my way around a farm', () => { S.flags.tutSkip = 1;
        storyDialog(AL("Ha! Her blood after all. Seeds at Mara's in the village, east along the road. Sleep in your tent before two. The manor's on the hill when you want more land."), { title: 'Hollowmere Farm', done: () => { S.flags.tutWalk = 3; } }); }],
    ] });
}
function tutFrame(dt) {
  const n = TUT.n, m = MAPS.farm; if (!n || !m || cur !== m || !m.npcs.includes(n)) return;
  if (n.waitT > 0) { n.waitT -= dt; n.walk = false; return; }
  const W = S.flags.tutWalk;
  if (W === 1) { // walking up to you
    const d = dist(n.x, n.y, S.p.x, S.p.y);
    if (d < 30) { n.walk = false; const dx = S.p.x - n.x; n.dir = dx < 0 ? 1 : 2; if (!DIALOG && !MODAL) tutWelcome(); return; }
    TUT.re -= dt;
    if (!TUT.path || TUT.re <= 0) { TUT.re = 1; TUT.path = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), Math.floor(S.p.x / 16), Math.floor((S.p.y - 2) / 16), 4000); TUT.pi = 1; }
  } else if (W === 3) { // going home along the road
    if (!TUT.path) { TUT.path = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), m.w - 2, 16, 6000); TUT.pi = 1; }
    if (!TUT.path || n.x > (m.w - 3) * 16) { m.npcs = m.npcs.filter(q => q !== n); TUT.n = null; return; }
  } else { n.walk = false; const dx = S.p.x - n.x, dy = S.p.y - n.y; if (Math.hypot(dx, dy) < 80) n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); return; }
  const node = TUT.path && TUT.path[TUT.pi]; if (!node) { n.walk = false; return; }
  const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
  if (d < 2) { TUT.pi++; return; }
  const sp = 34 * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.hx = n.x; n.hy = n.y; n.walk = true;
  n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
}
update = (f => function (dt) { f(dt); if (S && !TITLE) tutFrame(dt); })(update);
// he heads home once he's sent you to the village (or straight away for a veteran), and he's gone by the next day
EVT.on('tick', () => {
  if (!S || TITLE || !S.flags) return;
  const q = S.story && S.story.q && S.story.q.welcome;
  if (S.flags.tutWalk === 2 && q && (q.done || q.i >= 7)) { S.flags.tutWalk = 3; if (TUT.n) TUT.path = null; }
  if ((S.day > 1 || S.season > 0 || S.year > 1) && S.flags.tutWalk) { S.flags.tutWalk = 0; if (MAPS.farm && MAPS.farm.npcs) MAPS.farm.npcs = MAPS.farm.npcs.filter(n => n.id !== 'tut_ashcombe'); TUT.n = null; }
});
// back on the farm after a reload or a trip: put him back where he was standing
EVT.on('map', id => { if (id === 'farm' && S && S.flags && (S.flags.tutWalk === 1 || S.flags.tutWalk === 2) && !TUT.n) { tutSpawn(); if (S.flags.tutWalk === 2) { TUT.n.x = S.p.x + 24; TUT.n.y = S.p.y; } } });
// talking to him: the task in hand
doorAction = (f => function (act, who) {
  if (act !== 'k_tut') return f(act, who);
  if (S.flags.tutWalk === 1) return tutWelcome();
  const st = stepOf('welcome'), h = st ? hintOf('welcome', st) : null;
  storyDialog(AL(h ? pickR(["Well, don't stand there admiring me. ", "Next? ", "Where were we. Ah: "]) + h : "Get on with it, farmer. The day won't wait."), { title: 'Hollowmere Farm' });
})(doorAction);
// a new game: the creator, then Ashcombe walks up the road instead of the arrival letter
startGame = (f => function (isNew) { const r = f.apply(this, arguments); if (isNew && S && S.flags) S.flags.tutIntro = 1; return r; })(startGame);
openModal = (f => function (title) {
  if (title === 'Hollowmere Farm' && S && S.flags && S.flags.tutIntro && !TITLE && typeof SANDBOX !== 'undefined' && !SANDBOX) { S.flags.tutIntro = 0; setTimeout(tutIntro, 400); return; }
  return f.apply(this, arguments);
})(openModal);
