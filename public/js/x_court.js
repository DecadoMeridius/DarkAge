/* ================= The court of Briarholt =================
   Once Briarholt is yours the castle fills up, and more people come as The Empty Throne goes on:
   - from the day the way opens: Aldous the steward and Wenna the gardener, who stayed on;
   - owned (flags.castleOwned): the Briarholt guard at the gate and the keep door and one walking the
     grounds, a maid, a stable hand; inside, the cook, a scribe, the chaplain,
     throne-room guards and maids.
   - knightsAtBriar: Vey's knights drill at the dummies and their captain walks the yard.
   - after the council (flags.bloodline set): lords and ladies in the gardens, a bard at the fountain,
     courtiers in the great hall, a lady's maid upstairs.
   Each one walks between a few spots of their own (findPath), pauses, looks about, and has lines.
   Guards stand at posts; drilling knights swing at their dummy. Everyone keeps indoors during the
   siege. Runtime only: nothing here is saved. NPCS entries are hidden from the Friends tab. */

const CP = o => Object.assign({ shoe: '#3a2a1a' }, o);
const LIVERY = { helm: '#8a92a4', helmS: 'iron', armS: 'iron', armor: '#8a92a4', trim: '#e8b830', plume: '#6a3a9a', cape: '#4a2470', shirt: '#6a3a9a', pants: '#2a2a32' };
const KNIGHT = { helm: '#a8b0c0', helmS: 'steel', armS: 'steel', armor: '#a8b0c0', trim: '#e8b830', shirt: '#6a3a9a', pants: '#2a2a32', cape: '#4a2470' };
const COURT = [
  // ---- the household, once the castle is yours ----
  { id: 'bh_g1', n: 'Briarholt Guard', role: 'Guard', when: 'own', map: 'castle', post: [35, 42], dir: 0, arms: 1, P: CP(Object.assign({ skin: '#e0b48e', hair: '#3a2a1a', hs: 'short' }, LIVERY)) },
  { id: 'bh_g2', n: 'Briarholt Guard', role: 'Guard', when: 'own', map: 'castle', post: [38, 42], dir: 0, arms: 1, P: CP(Object.assign({ skin: '#c8906a', hair: '#1a1210', hs: 'short', beard: '#1a1210' }, LIVERY)) },
  { id: 'bh_g3', n: 'Briarholt Guard', role: 'Guard', when: 'own', map: 'castle', post: [34, 19], dir: 0, arms: 1, P: CP(Object.assign({ skin: '#f0c8a0', hair: '#8a5a2a', hs: 'short' }, LIVERY)) },
  { id: 'bh_g4', n: 'Briarholt Guard', role: 'Guard', when: 'own', map: 'castle', post: [39, 19], dir: 0, arms: 1, P: CP(Object.assign({ skin: '#d8a070', hair: '#5a3a22', hs: 'short', beard: '#5a3a22' }, LIVERY)) },
  { id: 'bh_g5', n: 'Briarholt Guard', role: 'Guard', when: 'own', map: 'castle', loop: 1, arms: 1, spots: [[20, 33], [30, 33], [43, 33], [53, 33], [53, 20], [44, 20], [29, 20], [20, 20]], P: CP(Object.assign({ skin: '#e8c0a0', hair: '#c8642a', hs: 'short' }, LIVERY)) },
  { id: 'bh_steward', n: 'Aldous', role: 'Steward of Briarholt', when: 'open', map: 'castle', spots: [[37, 20], [33, 22], [40, 22], [36, 29]], P: CP({ skin: '#e8c0a0', hair: '#c8c8c0', hs: 'short', shirt: '#2a2a3a', pants: '#2a2a30', robe: '#3a2a4a', beard: '#c8c8c0' }),
    met: ['So. You have met her. Then you know why the keep receives no visitors.', 'Lord Ashcombe holds the deed. If someone bought it, Her Highness would have a roof no regent could take from her. Just an observation.', 'The kitchen fire has been lit every night this month. I have not asked by whom. I may have left out bread.'],
    pre: ['Briarholt has had no lord in twenty years. I keep the keys and the silence. Mostly the silence.', 'You are welcome on the grounds. The keep is... not receiving visitors. For reasons I may not say.', 'Lord Ashcombe holds the deed now, I believe. A pity. The place deserves someone who would live in it.'],
    lines: ['The household is yours to command, my liege. Mostly it commands itself, but it likes to be asked.', 'Eleven rooms aired, four chimneys swept, one ghost politely asked to leave. A good week.', 'The glasshouses grow anything in any season. Princess Margit kept oranges in winter, just to annoy the court.', 'If the coffers run low, the treasury vault is in the cellars. I trust you know the way. I trust you, generally.'] },
  { id: 'bh_garden', n: 'Wenna', role: 'Royal gardener', when: 'open', map: 'castle', spots: [[18, 20], [22, 20], [25, 20], [49, 20], [53, 20], [56, 20], [21, 32], [52, 32]], P: CP({ skin: '#c8906a', hair: '#5a3a22', hs: 'bun', shirt: '#5a7a3a', pants: '#4a3a2a', apron: '#8a6a4a', hat: '#c8a860' }),
    pre: ['Twenty years I\'ve kept these beds with nobody to see them. Habit, I suppose. Or hope.', 'Someone has been picking the oranges in the glasshouse. Not me. I pretend not to notice.'],
    lines: ['Box hedges want clipping twice a summer. Roses want talking to. I do both.', 'The orange trees in the glasshouse are older than I am. Older than my grandmother, too.', 'Mind the tulips. The knights trample them every drill.', 'Plant anything in those glasshouses and it grows, winter or no. Royal soil, they call it. Good manure, I call it.'] },
  { id: 'bh_maid', n: 'Pell', role: 'Maid', when: 'own', map: 'castle', spots: [[29, 24], [33, 29], [45, 30], [28, 31], [40, 33], [27, 22]], P: CP({ skin: '#f0c8a0', hair: '#2a1a10', hs: 'bun', shirt: '#4a4a5a', pants: '#2a2a30', apron: '#f0ece0' }),
    lines: ['Water from the well, linen from the line, and the knights track mud on everything.', 'Princess Isolde thanked me for the tea. In person. I nearly dropped the tray.', 'They say the old queen walked the gardens every evening. Some nights I still hear the gravel crunch.'] },
  { id: 'bh_stable', n: 'Cobb', role: 'Stable hand', when: 'own', map: 'castle', spots: [[50, 37], [54, 37], [53, 39], [48, 39]], P: CP({ skin: '#d8a070', hair: '#8a5a2a', hs: 'spiky', shirt: '#7a5a3a', pants: '#3a3a40', vest: 1 }),
    lines: ['Hay, oats, and more hay. Horses are mostly hay with legs.', 'The captain\'s grey bites. The captain says it doesn\'t. The captain is wrong.', 'If you ever get a dragon, I am not mucking that out. I\'m just saying it now.'] },
  // ---- Vey's knights, once they ride in ----
  { id: 'bh_k1', n: 'Knight of Briarholt', role: 'Knight', when: 'knights', map: 'castle', post: [19, 35], dir: 1, drill: 1, arms: 1, P: CP(Object.assign({ skin: '#e8c0a0', hair: '#5a3a22', hs: 'short', plume: '#6a3a9a' }, KNIGHT)) },
  { id: 'bh_k2', n: 'Knight of Briarholt', role: 'Knight', when: 'knights', map: 'castle', post: [22, 35], dir: 1, drill: 1, arms: 1, P: CP(Object.assign({ skin: '#c88a60', hair: '#1a1210', hs: 'short', plume: '#e8e0d0' }, KNIGHT)) },
  { id: 'bh_k3', n: 'Knight of Briarholt', role: 'Knight', when: 'knights', map: 'castle', post: [25, 35], dir: 1, drill: 1, arms: 1, P: CP(Object.assign({ skin: '#f0d0b0', hair: '#c8642a', hs: 'pony', plume: '#6a3a9a' }, KNIGHT)) },
  { id: 'bh_kc', n: 'Ser Bram', role: 'Knight-Captain', when: 'knights', map: 'castle', arms: 1, spots: [[21, 38], [26, 37], [22, 41], [29, 36], [17, 41]], P: CP(Object.assign({ skin: '#e0b48e', hair: '#a8a8a8', hs: 'short', beard: '#a8a8a8', plume: '#d8342a', helm: '#d8b860', helmS: 'gold' }, KNIGHT, { cape: '#6a1a2a' })),
    lines: ['Again! Shield up, step in, strike. A dummy has never once lost a fight, lads.', 'Vey sent me her best twelve. Well, her best nine and three who eat a lot.', 'The walls are sound and the gate is oak and iron. Let them come.', 'You took the oath, or you will. Either way I\'d follow you through that gate.'] },
  { id: 'bh_k4', n: 'Knight of Briarholt', role: 'Knight', when: 'knights', map: 'castle', arms: 1, spots: [[47, 41], [50, 41], [54, 40], [44, 37]], P: CP(Object.assign({ skin: '#c8906a', hair: '#3a2a1a', hs: 'short', plume: '#e8b830' }, KNIGHT)) },
  // ---- the court, after the council ----
  { id: 'bh_lord', n: 'Lord Edric', role: 'Lord of the Kingsbridge council', when: 'court', map: 'castle', spots: [[27, 26], [33, 23], [44, 26], [45, 30], [29, 29]], P: CP({ skin: '#e8c0a0', hair: '#6a4a2a', hs: 'short', shirt: '#2a4a8a', pants: '#2a2a30', cape: '#8a1a2a', robe: '#2a4a8a', beard: '#6a4a2a', hat: '#2a2a3a' }),
    lines: ['The council sends its compliments. And its tax collectors, eventually.', 'A royal house at Briarholt again. The regent must be chewing his own beard.', 'Your fountain is very fine. Mine at home is bigger. I mention it only for accuracy.'] },
  { id: 'bh_lady', n: 'Lady Rosamund', role: 'Lady of the court', when: 'court', map: 'castle', spots: [[28, 26], [34, 23], [45, 25], [46, 29], [30, 29]], P: CP({ skin: '#f0d0b0', hair: '#e8d090', hs: 'long', shirt: '#a83a5a', pants: '#a83a5a', robe: '#a83a5a', cape: '#e8dcc0', crown: 1 }),
    lines: ['The roses here were Queen Margit\'s pride. Someone has been loving them again. I can tell.', 'Do you dance? The princess dances beautifully. She says she learned it hiding from tutors.', 'The court of Kingsbridge is full of gossip. Briarholt is full of air. I prefer the air.'] },
  { id: 'bh_celandine', n: 'Lady Celandine', role: 'Young noble', when: 'court', map: 'castle', spots: [[22, 32], [45, 24], [27, 28], [50, 32], [24, 22]], P: CP({ skin: '#c8906a', hair: '#1a1210', hs: 'pony', shirt: '#3a8a6a', pants: '#3a8a6a', robe: '#3a8a6a', cape: '#e8b830' }),
    lines: ['Mother says I am to make friends with the princess. I already did. We climbed the west tower.', 'Is it true you grew up on a farm? With goats? Real goats?', 'The knights let me hold a sword once. Ser Bram took it back very quickly.'] },
  { id: 'bh_fenwick', n: 'Lord Fenwick', role: 'Old courtier', when: 'court', map: 'castle', spots: [[32, 25], [32, 28], [41, 25], [41, 28]], P: CP({ skin: '#e8c0a0', hair: '#e8e8e0', hs: 'bald', shirt: '#5a3a1a', pants: '#2a2a30', robe: '#5a3a1a', cape: '#2a4a3a', beard: '#e8e8e0' }),
    lines: ['I served King Aldric, and his father. I have sat on every bench in this castle. This one is the least terrible.', 'In my day the fountain ran with wine at midsummer. Ah, well.', 'Margit was the cleverest of them all. You have her look about the eyes.'] },
  { id: 'bh_bard', n: 'Tobin', role: 'Bard', when: 'court', map: 'castle', post: [34, 29], dir: 0, P: CP({ skin: '#f0c8a0', hair: '#c8642a', hs: 'long', shirt: '#d8a030', pants: '#6a3a9a', cape: '#2a6a4a', hat: '#6a3a9a' }),
    lines: ['♪ The princess hid where the briars grow, and the farmer found her, row by row... ♪ It needs work.', 'I\'m writing a ballad about the siege. You come out of it very well. The bandits less so.', 'Requests? I know eleven songs, and nine of them are about sheep.'] },
  // ---- inside the keep ----
  { id: 'bh_cook', n: 'Hilde', role: 'Cook', when: 'own', map: 'castle_in', spots: [[4, 22], [8, 22], [11, 28], [4, 29], [10, 22]], P: CP({ skin: '#d8a070', hair: '#a83a1a', hs: 'bun', shirt: '#8a3a2a', pants: '#3a2a22', apron: '#f0ece0' }),
    lines: ['Out of my kitchen unless you\'re hungry. Are you hungry? Sit.', 'The great hearth roasts a whole boar. I\'ve done two at once, for the knights.', 'The princess takes her bread warm and her honey thick. A girl after my own heart.'] },
  { id: 'bh_scribe', n: 'Master Orrin', role: 'Scribe', when: 'own', map: 'castle_in', spots: [[6, 6], [8, 10], [4, 10], [12, 7]], P: CP({ skin: '#e8c0a0', hair: '#8a8a8a', hs: 'short', shirt: '#2a3a5a', pants: '#2a2a30', robe: '#2a3a5a', beard: '#8a8a8a' }),
    lines: ['Four hundred years of Briarholt in these shelves. Half of it is grain accounts.', 'Margit\'s letters are in the third case. Her handwriting was terrible and her spelling worse.', 'Please do not lick your finger to turn the pages. The knights do. It is unbearable.'] },
  { id: 'bh_priest', n: 'Father Cuthbert', role: 'Chaplain', when: 'own', map: 'castle_in', spots: [[53, 7], [57, 7], [55, 11]], P: CP({ skin: '#e0b48e', hair: '#d8d0c0', hs: 'bald', shirt: '#c8601a', pants: '#8a3a1a', robe: '#e8dcc0', beard: '#d8d0c0' }),
    lines: ['The Ember burned in this chapel for four hundred years. Then it went out. Now it burns again.', 'Knights keep their vigil here before the oath. All night, kneeling. Bring a cushion.', 'Pray if you wish. The flame listens. It rarely answers, but it listens.'] },
  { id: 'bh_tg1', n: 'Throne Guard', role: 'Guard', when: 'own', map: 'castle_in', post: [28, 9], dir: 0, arms: 1, P: CP(Object.assign({ skin: '#e8c0a0', hair: '#5a3a22', hs: 'short' }, KNIGHT, { plume: '#e8b830' })) },
  { id: 'bh_tg2', n: 'Throne Guard', role: 'Guard', when: 'own', map: 'castle_in', post: [35, 9], dir: 0, arms: 1, P: CP(Object.assign({ skin: '#c8906a', hair: '#1a1210', hs: 'short' }, KNIGHT, { plume: '#e8b830' })) },
  { id: 'bh_tg3', n: 'Door Warden', role: 'Guard', when: 'own', map: 'castle_in', post: [29, 42], dir: 3, arms: 1, P: CP(Object.assign({ skin: '#f0c8a0', hair: '#3a2a1a', hs: 'short' }, LIVERY)) },
  { id: 'bh_hmaid', n: 'Tansy', role: 'Maid', when: 'own', map: 'castle_in', spots: [[31, 21], [32, 27], [31, 32], [24, 40], [39, 40]], P: CP({ skin: '#e8b890', hair: '#c8642a', hs: 'pony', shirt: '#4a4a5a', pants: '#2a2a30', apron: '#f0ece0' }),
    lines: ['Two hundred candles in the great hall. I light them all and then the knights blow half of them out singing.', 'The tapestries want beating. That\'s tomorrow. Tomorrow is always tapestries.'] },
  { id: 'bh_courtier', n: 'Sir Gareth', role: 'Courtier', when: 'court', map: 'castle_in', spots: [[31, 26], [32, 22], [30, 31], [33, 34]], P: CP({ skin: '#e8c0a0', hair: '#3a2a1a', hs: 'short', shirt: '#6a3a9a', pants: '#2a2a30', cape: '#e8b830', robe: '#4a2470' }),
    lines: ['The great hall hasn\'t seen a feast in twenty years. Shall we fix that?', 'Kingsbridge sends envoys weekly now. They all want the same thing: to be seen here.'] },
  { id: 'bh_courtier2', n: 'Lady Isaura', role: 'Courtier', when: 'court', map: 'castle_in', spots: [[32, 26], [31, 22], [33, 31], [30, 34]], P: CP({ skin: '#f0d0b0', hair: '#6a3a2a', hs: 'long', shirt: '#2a6a7a', pants: '#2a6a7a', robe: '#2a6a7a', crown: 1 }),
    lines: ['The portraits upstairs are all of very serious people. I suppose thrones make one serious.', 'Isolde asked me to teach her the court dances. She already knows them. She wanted company.'] },
  // ---- at the great hall's tables at noon and in the evening ----
  ...[[19, 25, 'Lord Edric', 'court', { skin: '#e8c0a0', hair: '#6a4a2a', hs: 'short', shirt: '#2a4a8a', pants: '#2a2a30', cape: '#8a1a2a', robe: '#2a4a8a', beard: '#6a4a2a' }],
      [23, 25, 'Lady Rosamund', 'court', { skin: '#f0d0b0', hair: '#e8d090', hs: 'long', shirt: '#a83a5a', pants: '#a83a5a', robe: '#a83a5a', crown: 1 }],
      [35, 25, 'Ser Bram', 'knights', Object.assign({ skin: '#e0b48e', hair: '#a8a8a8', hs: 'short', beard: '#a8a8a8' }, KNIGHT, { helm: null, helmS: null })],
      [39, 25, 'A knight', 'knights', Object.assign({ skin: '#c8906a', hair: '#1a1210', hs: 'short' }, KNIGHT, { helm: null, helmS: null })],
      [27, 31, 'Aldous', 'own', { skin: '#e8c0a0', hair: '#c8c8c0', hs: 'short', shirt: '#2a2a3a', pants: '#2a2a30', robe: '#3a2a4a', beard: '#c8c8c0' }],
      [43, 31, 'Tansy', 'own', { skin: '#e8b890', hair: '#c8642a', hs: 'pony', shirt: '#4a4a5a', pants: '#2a2a30', apron: '#f0ece0' }]]
    .map(([x, y, n, when, P], i) => ({ id: 'bh_din' + i, n, role: 'At table', when, meal: 1, map: 'castle_in', post: [x, y], dir: 3, P: CP(P),
      lines: ['Pass the salt, would you? Thank you.', 'The cook has outdone herself. Again.', 'A toast: to Briarholt, and to whoever is paying for the wine.', 'Sit, sit! There is room at the end.'] })),
  { id: 'bh_ladymaid', n: 'Bryony', role: 'Lady\'s maid', when: 'own', map: 'castle_up', spots: [[40, 10], [45, 10], [38, 12], [26, 24]], P: CP({ skin: '#f0c8a0', hair: '#e8d070', hs: 'bun', shirt: '#6a3a9a', pants: '#2a2a30', apron: '#f0ece0' }),
    lines: ['Her Highness is resting. Or reading. Or climbing out of the window again. One of those.', 'Fresh linens in every chamber, my lord. Even yours. Especially yours.'] },
];
for (const C of COURT) Object.defineProperty(NPCS, C.id, { value: { n: C.n, role: C.role, shop: 'k_court', P: C.P, love: [], like: [], hate: [], lines: [[]], gifts: [] }, enumerable: false, writable: true, configurable: true });
const COURT_BY = Object.fromEntries(COURT.map(C => [C.id, C]));
const GUARD_LINES = ['All quiet on the walls, my liege.', 'The gate is barred at sundown. Knock twice if you\'re late.', 'Briarholt stands. Long may it.', 'The princess walked the walls at dawn. She waves to us. We are not supposed to wave back. We do.'];
const KNIGHT_LINES = ['Can\'t stop, my liege. Ser Bram counts every swing.', 'This dummy has defeated me twice. Not today.', 'For Briarholt!', 'Strike, recover, strike. My arms will fall off by supper.'];

function courtOn(C) {
  const F = (S && S.story && S.story.flags) || {};
  if (C.meal && !((S.time >= 720 && S.time < 810) || (S.time >= 1080 && S.time < 1200))) return false; // the court dines at noon and in the evening
  if (C.when === 'open') return !!(F.briarOpen || F.castleOwned);   // the old retainers kept the place for her
  if (!F.castleOwned) return false;
  if (typeof SIEGE !== 'undefined' && SIEGE && !SIEGE.done && C.map === 'castle') return false; // everyone keeps indoors
  if (C.when === 'knights') return !!F.knightsAtBriar;
  if (C.when === 'court') return F.bloodline !== undefined;
  return true;
}
const CSTATE = {};  // runtime: id -> { path, pi, wait, si }
function courtSync(snap) {
  const m = cur; if (!m || !/^castle(_in|_up)?$/.test(m.id)) return;
  const want = COURT.filter(C => C.map === m.id && courtOn(C));
  m.npcs = (m.npcs || []).filter(n => !n.court || want.some(C => C.id === n.id));
  for (const C of want) {
    if (m.npcs.some(n => n.id === C.id)) continue;
    const at = C.post || C.spots[Math.floor(Math.random() * C.spots.length)], x = (at[0] + .5) * 16, y = (at[1] + .8) * 16;
    m.npcs.push({ id: C.id, court: 1, x, y, hx: x, hy: y, dir: C.dir || 0, walk: false, t: 1e9, vx: 0 });
    CSTATE[C.id] = { wait: 1 + Math.random() * 5, si: C.spots ? C.spots.indexOf(at) : 0, swing: 0, cd: Math.random() * 1.5 };
  }
}
function courtFrame(dt) {
  const m = cur; if (!m || !m.npcs || !/^castle(_in|_up)?$/.test(m.id)) return;
  for (const n of m.npcs) {
    if (!n.court) continue; const C = COURT_BY[n.id], st = CSTATE[n.id] || (CSTATE[n.id] = { wait: 2, si: 0, swing: 0, cd: 0 });
    if (st.swing > 0) st.swing -= dt;
    if (n.waitT > 0) { n.waitT -= dt; n.walk = false; continue; }         // someone is talking to them
    if (!C.post && dist(n.x, n.y, S.p.x, S.p.y) < 28) { n.walk = false; const dx = S.p.x - n.x, dy = S.p.y - n.y; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0); continue; } // they pause for you (playtest: the steward walked off mid-talk)
    if (C.post) {
      if (C.drill) { st.cd -= dt; if (st.cd <= 0) { st.cd = 1.2 + Math.random() * .6; st.swing = .3; } }
      n.dir = C.dir || 0; n.walk = false; continue;
    }
    if (st.path) {
      const node = st.path[st.pi]; if (!node) { st.path = null; n.walk = false; st.wait = 3 + Math.random() * 6; if (Math.random() < .5) n.dir = Math.floor(Math.random() * 4); continue; }
      const wx = (node[0] + .5) * 16, wy = (node[1] + .8) * 16, dx = wx - n.x, dy = wy - n.y, d = Math.hypot(dx, dy);
      if (d < 2) { st.pi++; continue; }
      const sp = (C.arms ? 26 : 20) * dt; n.x += dx / d * Math.min(sp, d); n.y += dy / d * Math.min(sp, d); n.hx = n.x; n.hy = n.y; n.walk = true;
      n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : (dy < 0 ? 3 : 0);
      continue;
    }
    st.wait -= dt; if (st.wait > 0) continue;
    st.si = C.loop ? (st.si + 1) % C.spots.length : Math.floor(Math.random() * C.spots.length);
    const [tx, ty] = C.spots[st.si], p = findPath(m, Math.floor(n.x / 16), Math.floor((n.y - 2) / 16), tx, ty, 4000);
    if (p) { st.path = p; st.pi = 1; } else st.wait = 2;
  }
}
EVT.on('map', () => courtSync(true));
EVT.on('tick', k => { if (k % 3 === 0 && S && !TITLE) courtSync(false); });
update = (f => function (dt) { f(dt); if (S && !TITLE) courtFrame(dt); })(update);

/* guards and knights carry a sword; drilling knights swing at their dummy */
pcCursorDraw = (f => function (m) {
  f(m);
  if (!m || !m.npcs || TITLE || !/^castle(_in|_up)?$/.test(m.id)) return;
  const ic = typeof itemIcon === 'function' ? itemIcon('steel_sword') : null; if (!ic || typeof heldIcon !== 'function') return;
  for (const n of m.npcs) {
    if (!n.court || !COURT_BY[n.id].arms || dist(n.x, n.y, S.p.x, S.p.y) > 420) continue;
    const st = CSTATE[n.id] || {}, side = n.dir === 1 ? -1 : 1, sw = st.swing > 0 ? (1 - st.swing / .3) : 0, ang = -1.2 + sw * 2.4;
    if (n.dir === 3 && !sw) continue; // sheathed behind them when seen from the back
    heldIcon(ic, n.x + side * 6, n.y - 14, side < 0 ? Math.PI - ang : ang, 12);
  }
})(pcCursorDraw);

/* talking to them */
doorAction = (f => function (act, who) {
  if (act !== 'k_court') return f(act, who);
  if (typeof storyTalk === 'function' && storyTalk(who)) return;
  const C = COURT_BY[who]; if (!C) return;
  const T = S.story, metI = T.q.throne && (T.q.throne.c >= 2 || T.q.throne.done);
  const pool = (!T.flags.castleOwned && C.met && metI ? C.met : C.pre && !T.flags.castleOwned ? C.pre : C.lines) || (C.drill ? KNIGHT_LINES : GUARD_LINES), st = CSTATE[who] || (CSTATE[who] = {});
  st.li = ((st.li === undefined ? Math.floor(Math.random() * pool.length) : st.li) + 1) % pool.length;
  storyDialog([[who, pool[st.li]]], { title: C.role + ' · Briarholt' });
})(doorAction);

/* ---- story objects stand out (playtest: the kitchen's story stove looked like the two ordinary stoves
   beside it). A waiting story object glints gold and steams, and E reaches it from any tile next to it. */
findInteract = (f => function () {
  const r = f(); if (r) return r;
  const m = cur, px = Math.floor(S.p.x / 16), py = Math.floor((S.p.y - 2) / 16);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const o = getO(m, px + dx, py + dy);
    if (o && (o.k === 'storyobj' || o.k === 'storynpc')) { const it = objInteract(m, px + dx, py + dy, o); if (it) return it; }
  }
  return null;
})(findInteract);
pcCursorDraw = (f => function (m) {
  f(m);
  if (!m || TITLE) return;
  const x0 = Math.max(0, Math.floor(S.p.x / 16) - 14), x1 = Math.min(m.w, x0 + 29), y0 = Math.max(0, Math.floor(S.p.y / 16) - 10), y1 = Math.min(m.h, y0 + 21);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const o = m.o[y * m.w + x]; if (!o || o.k !== 'storyobj') continue;
    const k = Math.floor(gameT * 5 + x * 3) % 8, cx = x * 16 + 8, top = (y + 1) * 16 - 26;
    g.fillStyle = '#ffe080'; g.globalAlpha = .9;
    for (let i = 0; i < 3; i++) { const a = (k + i * 2.7) * .785, r = 9 + (i % 2) * 3; g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(top + 10 + Math.sin(a) * r * .7), 1, 1); }
    if (o.v === 'hearth') { g.fillStyle = '#f0ece0'; for (let i = 0; i < 3; i++) { const t = (gameT * .8 + i / 3) % 1; g.globalAlpha = .6 * (1 - t); g.fillRect(Math.round(cx - 2 + Math.sin(t * 6 + i) * 2), Math.round(top - t * 12), 2, 2); } }
    g.globalAlpha = 1;
  }
})(pcCursorDraw);

/* a story waiting on a shopkeeper speaks even when the shop is shut (playtest: Lord Ashcombe's manor
   closes at five, and "Ask Lord Ashcombe" just said "Closed") */
doorAction = (f => function (act, who) {
  if (!who && S && typeof HOURS !== 'undefined' && HOURS[act] && typeof openAt === 'function' && !openAt(act, S.time)) {
    const k = (typeof ACTNPC !== 'undefined' && ACTNPC[act]) || (typeof keeperOf === 'function' && keeperOf(act));
    if (k && typeof storyTalk === 'function' && storyTalk(k)) return;
    // a town shop's door stays shut out of hours, like the village's (playtest: night doors opened onto empty rooms)
    if (typeof TOWN_ACTS !== 'undefined' && TOWN_ACTS[act] && !(cur && cur.id === 'in_' + act)) { const H = HOURS[act]; toast('Closed. Open ' + fmtHM(H[0]) + ' to ' + fmtHM(H[1] % 1440) + '.'); return; }
  }
  return f(act, who);
})(doorAction);
/* wide doors (the keep's double doors) open from the tiles either side of the door tile too */
findInteract = (f => function () {
  const r = f(); if (r) return r;
  const m = cur, [tx, ty] = faceTile();
  for (const b of m.bld || []) if (b.act && b.w >= 8 && b.door.y === ty && Math.abs(b.door.x - tx) <= 1) return { label: DOORL[b.act] || 'Enter', fn: () => doorAction(b.act) };
  return null;
})(findInteract);

/* the farm:home spot (the herald, Sir Aldren) is a tile with room around it, never against the campfire or tent */
storyWhere = (f => function (role) {
  if (role !== 'farm:home' || !S || !S.story) return f(role);
  const P = S.story.places || (S.story.places = {}), c = P[role]; if (c && c[3] === 'roomy') return { map: c[0], x: c[1], y: c[2] };
  const m = MAPS.farm, h = m && m.bHouse, x0 = h ? h.door.x + 2 : 10, y0 = h ? h.door.y + 2 : 11;
  const ok = (x, y) => { for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const X = x + i, Y = y + j; if (!inb(m, X, Y) || getO(m, X, Y) || m.solidB[Y * m.w + X] || m.soil[Y * m.w + X] || TER[getT(m, X, Y)].solid || TER[getT(m, X, Y)].water) return false; } return true; };
  for (let r = 0; r <= 9; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (Math.max(Math.abs(i), Math.abs(j)) === r && ok(x0 + i, y0 + j)) { P[role] = ['farm', x0 + i, y0 + j, 'roomy']; return { map: 'farm', x: x0 + i, y: y0 + j }; }
  return f(role);
})(storyWhere);
/* a shopkeeper standing behind a counter is reached across it (playtest: click-to-talk walked round behind
   the counter, and in the museum got stuck there) */
clickTarget = (f => function () {
  const r = f(), m = cur; if (!m || !(m.id || '').startsWith('in_') || typeof counterNear !== 'function') return r;
  const o = getO(m, r[0], r[1]); if (!o || o.k !== 'keeper') return r;
  return counterNear(m, r[0], r[1]) || r;
})(clickTarget);
/* nothing stands where you come in: furniture on the two tiles inside a room's door is cleared
   (playtest: entering a town inn put you inside the centre table) */
genInterior = (f => function (k) {
  const m = f(k); if (!m || !m.start) return m;
  const sx = Math.floor(m.start.x / 16), sy = Math.floor(m.start.y / 16);
  for (let y = sy - 2; y <= sy; y++) for (let x = sx - 2; x <= sx + 1; x++) { const [mx, my, o] = mainOf(m, x, y); if (o && o.k !== 'keeper' && /^furn_/.test(o.k) && !o.act) delObj(m, mx, my); } // the main piece, so a long table goes too
  return m;
})(genInterior);
/* a new game's food is on the hotbar (slot 0), not only in the bag (playtest: a newcomer pressed 9 to eat mid-fight and got the potato seeds) */
newState = (f => function (seed) { const o = f(seed); if (o.hot && o.hot[9] == null && o.inv && o.inv.trail_bread) o.hot[9] = 'trail_bread'; return o; })(newState);
/* getting-started steps are checked in the background, so one done while the Quests tab is shut still ticks
   (playtest: crops watered on day one had dried by the time the list was opened) */
EVT.on('tick', n => { if (n % 5 || !S || TITLE || typeof START_STEPS === 'undefined') return; for (const s of START_STEPS) { try { s[1](); } catch (e) {} } });

/* walls are solid where they're drawn: a wall piece stands 56 art px tall, so its body also covers the tile north of
   it, and a tower's the two rows above it (playtest: you could walk "on the battlements" or vanish inside a wall) */
function wallBodies(m) {
  const block = (x, y) => { if (!inb(m, x, y)) return; const o = getO(m, x, y); if (o && /^(cgate|gpart)$/.test(o.k)) return; m.solidB[y * m.w + x] = 1; };
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue; const x = i % m.w, y = (i / m.w) | 0;
    if (o.k === 'cwall' && (o.fm & 10)) { const n = getO(m, x, y - 1); if (!n || n.k === 'cwall' || /^(tgrass|flower|weed|stone|twig)$/.test(n.k)) block(x, y - 1); } // only runs going east-west stand up off their tile; a north-south run would close a side gate (round 5)
    else if (o.k === 'ctower') for (let j = 2; j <= 3; j++) { block(x, y - j); block(x + 1, y - j); } }
}
genCastle = (f => function () { const m = f(); wallBodies(m); return m; })(genCastle);
genWilds = (f => function () { const m = f(); wallBodies(m); return m; })(genWilds);
/* the story you're advancing is tracked if nothing else is (playtest: no arrow on the way to Briarholt) */
storyAdvance = (f => function (sid) { const r = f(sid); const T = S && S.story; if (T && !T.track && T.q[sid] && !T.q[sid].done) T.track = sid; return r; })(storyAdvance);
/* day-one balance (playtest): the crow, a swooping flyer that's hard to hit, hit too hard for a newcomer; the wooden
   spear cost 4 wood against the wooden sword's 16, so nobody would make the sword */
if (EN.crow) EN.crow.atk = 4;
for (const r of RC) if ((r[0] === 'wood_sword' || r[0] === 'wood_spear') && r[2].wood) r[2].wood = 10;
/* walking into a doorway: holding a direction toward a room's exit (or a building's door) while a little off to one
   side slides you onto it (playtest: S only left Mara's when you were lined up exactly) */
update = (f => function (dt) {
  f(dt);
  if (!S || TITLE || PAUSED || !cur || typeof keyVec !== 'function') return;
  const [vx, vy] = keyVec(); if (!vy || Math.abs(vx) > .3) return;
  for (const w of cur.warps || []) {
    const wy = (w.y + .5) * 16, x0 = w.x * 16 + 6, x1 = (w.x + w.w) * 16 - 6;
    if (Math.abs(S.p.y - wy) > 30 || Math.sign(wy - S.p.y) !== Math.sign(vy) || (S.p.x >= x0 && S.p.x <= x1)) continue;
    const tx = S.p.x < x0 ? x0 : x1; if (Math.abs(tx - S.p.x) > 22) continue;
    const nx = S.p.x + Math.sign(tx - S.p.x) * Math.min(Math.abs(tx - S.p.x), 50 * dt); if (!solidAt(cur, nx, S.p.y - 2)) S.p.x = nx;
  }
})(update);
/* weeds are drawn as small flat tufts, so as solid blockers they felt like invisible walls (playtest, twice):
   you walk through them now; the scythe and hoe still clear them */
if (OBJ.weed) OBJ.weed.solid = 0;

/* a far click with food in hand walks there; eating is a click near you, or the selected slot again (playtest: walking ate 4 breads) */
primaryUse = (f => function () {
  if (S && !PAUSED && !TITLE && cur) { const k = selKind(); if (k && IT[k] && IT[k].eat && typeof mouseWorld === 'function') { const [wx, wy] = mouseWorld(); if (Math.hypot(wx - S.p.x, wy - S.p.y + 10) > 40) { const [tx, ty] = clickTarget(); walkTo(tx, ty, null); return; } } }
  return f();
})(primaryUse);

/* Briarholt has a waystone by the road in, and once it's yours the royal bedchamber is home: a day that ends
   in the castle (sleep or collapse) wakes you there (playtest: owning the castle still carried you to the tent) */
if (typeof WAYN !== 'undefined') WAYN.castle = 'Briarholt Castle';
refreshCastle = (f => function () { f(); if (MAPS.castle && typeof putWaystone === 'function' && castleOpen()) putWaystone(MAPS.castle, 'castle', [10, 4]); })(refreshCastle);
endDay = (f => function (fainted) {
  const was = cur && cur.id, r = f(fainted);
  if (castleOwned() && /^castle(_in|_up|_down)?$/.test(was || '') && MAPS.castle_up) { goMap('castle_up', 9.5 * 16, 10.5 * 16, 0); toast('You wake in the royal bedchamber.'); }
  return r;
})(endDay);
if (EN.slime) EN.slime.atk = 3; if (EN.blueslime) EN.blueslime.atk = 6; // two meadow slimes took 71 of 100 HP from a newcomer (round 4)
/* arriving on a map never leaves you inside something solid (playtest: the farm→Wilds exit dropped a newcomer on a bush) */
EVT.on('map', () => {
  if (!S || TITLE || !cur || typeof solidAt !== 'function' || typeof openTileNear !== 'function') return;
  if (solidAt(cur, S.p.x, S.p.y - 2)) { const t = openTileNear(cur, Math.floor(S.p.x / 16), Math.floor((S.p.y - 2) / 16)); if (t) { S.p.x = (t[0] + .5) * 16; S.p.y = (t[1] + .8) * 16; } }
});
/* waystones attune when you walk up to one, from any side (playtest: only one exact facing worked) */
EVT.on('tick', () => {
  if (!S || TITLE || !cur || !cur.o) return; const px = Math.floor(S.p.x / 16), py = Math.floor((S.p.y - 2) / 16);
  for (let dy = -1; dy <= 2; dy++) for (let dx = -1; dx <= 1; dx++) { const o = getO(cur, px + dx, py + dy); if (o && o.k === 'waystone' && !(S.ways || {})[o.id]) { S.ways = S.ways || {}; S.ways[o.id] = 1; if (SFX.secret) SFX.secret(); toast('The rune wakes under your hand: ' + wayName(o.id) + '.', 'lvl'); } }
});
/* never stuck inside something solid: a moment inside one and you're set on the nearest open tile (the Kingdom test
   put you in the workbench, tree pockets held a newcomer) */
let STUCK_T = 0;
EVT.on('tick', () => {
  if (!S || TITLE || !cur || S.p.boat || S.flying || S.mounted || typeof solidAt !== 'function') { STUCK_T = 0; return; }
  if (solidAt(cur, S.p.x, S.p.y - 2)) { if (++STUCK_T >= 2) { STUCK_T = 0; const t = openTileNear(cur, Math.floor(S.p.x / 16), Math.floor((S.p.y - 2) / 16)); if (t) { S.p.x = (t[0] + .5) * 16; S.p.y = (t[1] + .8) * 16; } } } else STUCK_T = 0;
});
/* the keep's furniture does something, and its maps name the rooms (round 4) */
objInteract = (f => function (m, x, y, o) {
  if (o && o.act === 'k_wardrobe') return { label: 'Change clothes', fn: () => { if (typeof openCreator === 'function') openCreator(null); } };
  if (o && o.act === 'k_map') return { label: 'Study the map', fn: () => { toast('Valdmark, painted on oak: every road, town and river, with Briarholt marked in purple.'); openMenu('map'); } };
  return f(m, x, y, o);
})(objInteract);
localMapCanvas = (f => function (m) {
  const c = f(m), P = m && KEEP_PLANS[m.id]; if (!P) return c;
  const x = c.getContext('2d'), k = Math.max(6, Math.min(14, Math.floor(900 / m.w)));
  x.font = '700 12px Fredoka, sans-serif'; x.textAlign = 'center'; x.lineWidth = 3; x.strokeStyle = '#2a1c18'; x.fillStyle = '#fff2c8';
  for (const [n, x0, y0, x1, y1] of P.rooms) { const X = (x0 + x1 + 1) / 2 * k, Y = (y0 + y1 + 1) / 2 * k; x.strokeText(n, X, Y); x.fillText(n, X, Y); }
  return c;
})(localMapCanvas);
/* the glasshouse doors say they're locked until the castle is yours; every royal chest opens your storage (round 4) */
for (const id of ['cgh_W', 'cgh_E']) Object.defineProperty(DOORL, id, { get: () => castleOwned() ? 'Enter' : 'Locked', configurable: true });
objInteract = (f => function (m, x, y, o) {
  if (o && o.k === 'furn_chest' && !o.act && /^castle/.test(m.id) && typeof openBank === 'function') return { label: 'Open', fn: () => castleOwned() ? openBank() : toast('Locked. The steward keeps the keys.') };
  return f(m, x, y, o);
})(objInteract);
/* the way to a room or a keep floor is the building's door, not the map's edge (round 5: on the castle grounds the
   arrow to Isolde led to the farm exit) */
exitToward = (f => function (m, map) {
  const act = /^castle_(in|up|down)$/.test(map) ? 'castle' : /^cgh_/.test(map) ? map : /^in_/.test(map) ? map.slice(3) : null;
  const b = act && (m.bld || []).find(b => b.act === act); if (b) return { x: b.door.x + .5, y: b.door.y + 1.2 };
  if (/^castle_(up|down)$/.test(map) && m.id === 'castle_in') { const P = KEEP_PLANS.castle_in, k = map === 'castle_up' ? 'k_up' : 'k_down'; for (const [kk, x, y, a] of P.f) if (a === k) return { x: x + 1, y: y + 1.2 }; }
  if (m.id === 'castle_up' || m.id === 'castle_down') { if (map !== m.id) { const P = KEEP_PLANS[m.id]; for (const [kk, x, y, a] of P.f) if (a === 'k_down' || a === 'k_up') return { x: x + 1, y: y + 1.2 }; } }
  return f(m, map);
})(exitToward);
/* a warning before the 2 am collapse (round 5: it came "with no warning") */
EVT.on('tick', () => {
  if (!S || TITLE || typeof S.time !== 'number') return; S.flags = S.flags || {};
  const d = typeof dayIndex === 'function' ? dayIndex() : S.day;
  if (S.time >= 1500 && S.time < 1505 && S.flags.lateWarn !== d + 'a') { S.flags.lateWarn = d + 'a'; toast('It\'s 1 am. Find a bed before 2, or you\'ll collapse where you stand.', 'bad'); }
  if (S.time >= 1545 && S.time < 1550 && S.flags.lateWarn !== d + 'b') { S.flags.lateWarn = d + 'b'; toast('Quarter to two. You can barely keep your eyes open.', 'bad'); }
});
/* the glasshouses inside: potted plants along the back, topiaries at the corners of the beds (round 5: "a bare grass
   rectangle"). Placed on entry where the floor is empty, so older saves get them too */
EVT.on('map', id => {
  if (!/^cgh_/.test(id) || !cur || cur.id !== id) return; const m = cur;
  for (let x = 2; x <= 15; x += 2) if (!getO(m, x, 2)) setO(m, x, 2, { k: 'furn_plant', fixed: 1 });
  for (const [x, y] of [[1, 3], [16, 3], [1, 10], [16, 10]]) if (!getO(m, x, y)) setO(m, x, y, { k: 'furn_topiary', fixed: 1 });
});
/* the war table shows the realm (round 5: it opened the keep's own floor plan) */
objInteract = (f => function (m, x, y, o) {
  if (o && o.act === 'k_map' && typeof worldMapCanvas === 'function') return { label: 'Study the map', fn: () => openModal('The Map of Valdmark', [{ id: 'm', label: 'Valdmark', render: b => { b.append(el('p', { class: 'note' }, 'Every road, town and river of the realm, painted on oak. Briarholt is marked in purple.')); const c = worldMapCanvas(); c.style.width = '100%'; c.style.imageRendering = 'pixelated'; b.append(c); } }]) };
  return f(m, x, y, o);
})(objInteract);
/* keys you're still holding come back when a window closes or the game unpauses (round 6: pausing cleared every key,
   so a held WASD did nothing until pressed again) */
const HELD = new Set();
addEventListener('keydown', e => HELD.add(e.key.toLowerCase()), true);
addEventListener('keyup', e => HELD.delete(e.key.toLowerCase()), true);
addEventListener('blur', () => HELD.clear());
const MOVE_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift'];
const restoreHeld = () => { if (typeof INPUT !== 'undefined' && INPUT.keys) for (const k of MOVE_KEYS) if (HELD.has(k)) INPUT.keys[k] = true; };
if (typeof setPause === 'function') setPause = (f => function (on) { const r = f(on); if (!on) restoreHeld(); return r; })(setPause);
closeModal = (f => function () { const r = f.apply(this, arguments); setTimeout(restoreHeld, 0); return r; })(closeModal);
