/* ================= The Empty Throne, chapters 4-12, and the siege of Briarholt =================
   (plan in docs/IDEAS_KINGDOMS.md; chapters 1-3 and the castle are in x_kingdom.js, the towns in x_realm.js)
   The story runs through the new towns: Captain Vey and his patrols in Kingsbridge, a hunters' camp in
   the woods near Ashford, a ship at Saltmere, proof for the mayor, Greyhelm's iron, the siege of
   Briarholt, the knight's oath and the drake of the Emberwaste, whose egg Isolde keeps.
   New step forms: kill with enemy '*assist' (monsters felled while a patrol is fighting them) or
   '*bio:<biome>' (anything in that biome of the Wilds); pay (gold, x_kingdom.js).
   SIEGE: when the siege step is waiting and you walk into Briarholt's grounds, Morcant's hunters come
   through the gate in four waves; Vey's knights hold the courtyard beside you. Ballistae you place
   shoot whatever comes in range; barricades block the way. If you're knocked out, the hunters pull
   back and come again the next time you return. */

/* ---- items ---- */
[['morcant_orders', 'Morcant\'s Orders', 'map', '#d8c8a8'], ['regent_letter', 'The Regent\'s Letter', 'map', '#8e5ac0'], ['greyhelm_horn', 'Greyhelm War Horn', 'artifact', '#c8a060'], ['drake_egg', 'Drake Egg', 'artifact', '#c84a2a']]
  .forEach(([id, n, sh, c]) => I(id, n, 'special', 0, sh, c, null, { quest: 1 }));
I('dragon_whistle', 'Dragon Whistle', 'special', 0, 'artifact', '#e8b830', null, { quest: 1, desc: 'Blow it outdoors and your drake comes to carry you. Blow it again, or press R, to land' });
IT.drake_egg.desc = 'Warm to the touch, and heavier than it looks. Something inside it moves';
I('ring_stag', 'Ring of the Ember Stag', 'ring', 5000, 'ring', '#e8b830', '#6a3a9a', { slot: 'ring', bonus: { atk: 8, def: 8, luck: 1 }, desc: '+8 attack, +8 defence, +1 luck. Worn by the knights of the Ember Stag' });
[['ballista', 'Ballista', 900], ['barricade', 'Barricade', 60]].forEach(([id, n, p]) => I(id, n, 'place', p, 'obj', null, null, { place: id, desc: id === 'ballista' ? 'Shoots heavy bolts at monsters in range. Place it on land you own' : 'Sharpened stakes that block the way. Place it on land you own' }));
OBJ.ballista = { solid: 1, place: 1, tall: 1 }; OBJ.barricade = { solid: 1, place: 1 };
RC.push(['ballista', 1, { wood: 30, iron_bar: 4, fiber: 10 }, 'bench', ['construction', 10]], ['barricade', 2, { wood: 12, stone: 6 }, 'bench', ['construction', 2]]);
objSprite = (f => function (o, season) { if (o.k === 'ballista' || o.k === 'barricade') return PIX.get(o.k); return f(o, season); })(objSprite);
Object.assign(SCAST, {
  harrow: { n: 'Captain Harrow', P: HP(0, { skin: '#c8906a', hair: '#2a1a10', hs: 'short', shirt: '#3a4a5a', pants: '#2a2a34', hat: '#1a2a3a', beard: '#2a1a10', cape: '#5a1a2a' }) },
  morcant: { n: 'Duke Morcant', P: HP(0, { skin: '#e0b48e', hair: '#5a3a22', hs: 'short', shirt: '#5a1a2a', pants: '#2a2a32', helm: '#c8ccd8', helmS: 'gold', armS: 'steel', armor: '#8a8a96', trim: '#c8342a', cape: '#5a1a2a', beard: '#5a3a22' }) },
});

/* ---- counting kills for '*assist' and '*bio:' steps ---- */
killEnemy = (f => function (m, e) {
  const was = e.dead; f(m, e);
  if (was || !e.dead || !S || !S.story) return;
  const b = m && m.bio ? BIOMES[m.bio[Math.floor(e.y / 16) * m.w + Math.floor(e.x / 16)]] : null;
  for (const sid in STORIES) { const st = stepOf(sid); if (!st || st.t !== 'kill' || !st.enemy || st.enemy[0] !== '*') continue;
    const q = S.story.q[sid];
    if (st.enemy === '*assist' && e.allyHit && gameT - e.allyHit < 12) q.kills = (q.kills || 0) + 1;
    if (st.enemy.startsWith('*bio:') && m.id === 'wilds' && b === st.enemy.slice(5)) q.kills = (q.kills || 0) + 1; }
})(killEnemy);

/* ---- chapters 4-12 ---- */
const TH = STORIES.throne;
TH.ch.splice(3, TH.ch.length - 3,
  { n: 'Riders on the Road', steps: [
    { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Isolde wants to see you in the throne room.', lines: L('isolde', 'Nell from Kingsbridge brought bread this morning, and news. Riders in Morcant\'s red have been asking for "a girl with copper hair".', 'We can\'t hold Briarholt with two people and a harp. We need friends with swords.', 'Captain Vey commands the watch in Kingsbridge. She was loyal to the old king. Ask her for help.') },
    { t: 'talk', who: 'vey', hint: 'Find Captain Vey at the barracks in Kingsbridge.', lines: L('vey', 'Briarholt? The old summer castle? Who lives there now... no. Don\'t tell me. Better I don\'t know.', 'I won\'t send knights on a farmer\'s word. Ride with my patrols first. Help them clear the roads.', 'Six kills alongside my knights. Then we\'ll talk.') },
    { t: 'kill', enemy: '*assist', n: 6, hint: n => 'Fight beside a knight patrol on the roads of the Wilds (' + (n || 0) + '/6 monsters felled together).' },
    { t: 'talk', who: 'vey', hint: 'Report back to Captain Vey in Kingsbridge.', lines: L('vey', 'My knights say you fight like someone with something to protect. Good.', 'Here\'s what I know. Morcant\'s hunters are camped in the woods west of here, near Ashford. Twenty blades, maybe more.', 'Find their camp. Find out who\'s paying them. Then we\'ll see about knights for Briarholt.') },
  ], reward: { gold: 2500, flag: 'veyAlly' } },
  { n: 'The Hunters\' Camp', steps: [
    { t: 'use', at: 'site:wilds:forest', obj: 'huntcamp', hint: 'Find the hunters\' camp in the woods of the western Wilds.', give: { morcant_orders: 1 }, lines: L('narr', 'A cold fire, red tents and the stag of Morcant painted on a shield. The hunters left in a hurry.', 'Under a stone by the fire: orders sealed in red wax. "Take the girl alive. Burn the castle if you must. Payment on delivery, by the regent\'s own purse."') },
    { t: 'kill', enemy: 'bandit', n: 8, hint: n => 'Morcant hired bandits to watch the woods. Defeat 8 of them (' + (n || 0) + '/8).' },
    { t: 'talk', who: 'rudd', hint: 'Ask Rudd at the Felled Oak in Ashford what he\'s seen.', lines: L('rudd', 'Red riders? Came through two nights ago, drank my cellar dry and didn\'t pay.', 'Talked about a ship at Saltmere. Said the regent\'s money comes in by sea, so nobody in Kingsbridge sees it.') },
  ], reward: { gold: 2000 } },
  { n: 'Ships at Saltmere', steps: [
    { t: 'talk', who: 'finn', hint: 'Ask Finn the fishmonger in Saltmere about the ship.', lines: L('finn', 'The black ship? Anchored past the reef three days now. No fishing, no trading. Just soldiers on deck.', 'Their captain drinks at the Gull every night. Mags will know more. Mags always knows more.') },
    { t: 'talk', who: 'mags', hint: 'Ask Mags at the Salty Gull about the ship\'s captain.', lines: L('mags', 'Captain Harrow. Pays in new silver, the kind with the regent\'s mark still sharp on it.', 'He walks the pier every evening. Go and talk to him. Bring your sword.') },
    { t: 'meet', who: 'harrow', at: 'town:saltmere:0', hint: 'Confront Captain Harrow on the Saltmere pier.', lines: L('harrow', 'You\'re the farmer. I was told you\'d be shorter.', 'I carry letters, not swords. Here, this one I was meant to burn: the regent\'s own hand, paying Morcant for the princess.', 'Take it. When Morcant finds out, I\'d rather be at sea.'), give: { regent_letter: 1 } },
  ], reward: { gold: 3000 } },
  { n: 'Proof for the Mayor', steps: [
    { t: 'bring', who: 'osric', items: { morcant_orders: 1, regent_letter: 1 }, hint: 'Bring Morcant\'s orders and the regent\'s letter to Mayor Osric in Kingsbridge.', wait: 'Proof. I need proof, not stories.',
      lines: L('osric', 'This is the regent\'s seal. On orders to burn a castle and seize a princess. Gods.', 'Kingsbridge can\'t stand against the regent alone. But Greyhelm doesn\'t answer to the regent at all.', 'Ride to Chief Halvard. If Greyhelm sends iron, Vey will send knights.') },
    { t: 'talk', who: 'halvard', hint: 'Ask Chief Halvard in Greyhelm for help.', lines: L('halvard', 'Morcant and the regent. Two snakes in one boot.', 'Greyhelm will help. But raiders sit on our north road and my wardens are stretched thin.', 'Clear the highlands around us and I\'ll give you Greyhelm\'s war horn. Blow it at Briarholt and we\'ll come.') },
    { t: 'kill', enemy: '*bio:highlands', n: 12, hint: n => 'Clear 12 monsters from the highlands of the Wilds (' + (n || 0) + '/12).' },
    { t: 'talk', who: 'halvard', hint: 'Return to Chief Halvard in Greyhelm.', give: { greyhelm_horn: 1 }, lines: L('halvard', 'The road\'s open. The miners are singing again. Terrible voices, all of them.', 'Here. Greyhelm\'s horn. It hasn\'t been blown since the old king\'s coronation.') },
    { t: 'talk', who: 'vey', hint: 'Tell Captain Vey that Greyhelm will stand with Briarholt.', lines: L('vey', 'Greyhelm\'s horn? Halvard must like you. He doesn\'t like anyone.', 'Then it\'s settled. Four of my best knights ride to Briarholt tonight.', 'Build ballistae on the courtyard and barricades at the gate. Morcant will come soon. He doesn\'t wait.') },
  ], reward: { gold: 4000, flag: 'knightsAtBriar' } },
  { n: 'The Siege of Briarholt', steps: [
    { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Warn Isolde that Morcant is coming.', lines: L('isolde', 'Vey\'s knights are in the courtyard. Four of them, all very tall and very polite.', 'Hale says ballistae can be built at any workbench: wood, iron and rope. Barricades too.', 'When you\'re ready, walk out into the courtyard. Morcant\'s scouts are already in the trees. They\'ll come the moment they see you.') },
    { t: 'cond', id: 'siege', test: () => !!S.story.flags.siegeWon, hint: 'Defend Briarholt: go out into the castle grounds and hold the courtyard against four waves. Ballistae and barricades help.' },
    { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Find Isolde after the battle.', lines: L('isolde', 'They ran. Morcant\'s red cloaks, running across your turnips.', 'You held Briarholt. Margit would have rung every bell in the valley.', 'But Morcant got away, and the regent still sits in the capital. We need the council to hear the truth.') },
  ], reward: { gold: 6000 } },
  { n: 'The Council at Kingsbridge', steps: [
    { t: 'talk', who: 'osric', hint: 'Mayor Osric has called the town council. Go to the Town Hall in Kingsbridge.', lines: L('osric', 'The council has read the letter. Half of them are furious. The other half are packing.', 'The regent is finished in the valley. But they\'re asking who should rule now. Some of them are asking about you.', 'Margit\'s blood, they say. The old king\'s granddaughter\'s child. Is it true?'),
      choices: [['Tell them who you are.', { flag: 'bloodline', v: 1, line: ['osric', 'Then Kingsbridge stands with Margit\'s heir. Briarholt has a royal house again.'] }],
        ['Say nothing.', { flag: 'bloodline', v: 0, line: ['osric', 'Wise, perhaps. Thrones are heavy. Kingsbridge stands with you either way.'] }]] },
    { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Tell Isolde what happened at the council.', lines: L('isolde', 'So the valley is free of the regent. For now.', 'Vey says there\'s an oath for people like you. The old knights of the Ember Stag. Aldren was one.', 'Go to her. You\'ve earned it twice over.') },
  ], reward: { gold: 3000 } },
  { n: 'The Oath of the Ember Stag', steps: [
    { t: 'talk', who: 'vey', hint: 'Speak to Captain Vey about the knight\'s oath.', lines: L('vey', 'The Ember Stag. I swore it myself, under a leaking roof, to a knight with one eye.', 'Three things. Defeat the Bandit Warlord who holds the Wilds\' camp. Keep a vigil in Briarholt\'s chapel at night. Then kneel.') },
    { t: 'kill', enemy: 'warlord', n: 1, hint: 'Defeat the Bandit Warlord at his camp in the highlands of the Wilds.' },
    { t: 'use', at: 'castle:chapel', obj: 'vigil', night: 1, hint: 'Keep a night vigil at the altar of Briarholt\'s chapel (after dark).', lines: L('narr', 'You kneel before the ember. The candles burn down. Somewhere above, Isolde plays the harp badly and on purpose.', 'At dawn a cold voice you know says: "Rise." Aldren\'s ghost stands by the altar, smiling.') },
    { t: 'talk', who: 'vey', hint: 'Return to Captain Vey to swear the oath.', lines: L('vey', 'Kneel. Swear to guard the weak, keep the roads and never hit a horse.', 'Rise, knight of the Ember Stag.', 'The ring is old. It belonged to Aldren. Isolde sent it.') },
  ], reward: { gold: 5000, items: { ring_stag: 1 }, flag: 'knight' } },
  { n: 'The Drake\'s Egg', steps: [
    { t: 'talk', who: 'halvard', hint: 'Chief Halvard has sent word from Greyhelm.', lines: L('halvard', 'A drake has been taking our goats. A big one, from the ash lands. Cinder-red.', 'They say the drakes keep their eggs in the Emberwaste. Kill the mother and the egg\'s yours, if you\'re mad enough to want it.') },
    { t: 'kill', enemy: 'cinderdrake', n: 1, hint: 'Defeat the Cinder Drake in the Emberwaste.' },
    { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Bring the drake\'s egg to Briarholt.', give: { drake_egg: 1 }, lines: L('narr', 'In the drake\'s nest, among bones and scorched gold, lies a single egg, warm as a hearthstone.'),
      after: L('isolde', 'Is that... an egg? A drake egg?', 'The library has a book on these. They hatch near fire, and they remember the first face they see.', 'We\'ll keep it by the kitchen hearth. In a few weeks, Briarholt will have a dragon.') },
  ], reward: { gold: 8000, flag: 'eggHome' } },
  { n: 'Wings over Briarholt', steps: [
    { t: 'cond', test: () => !!(S.dragon && S.dragon.stage >= 2), hint: () => S.dragon ? (S.dragon.stage >= 1 ? 'Your drakeling is growing. In ' + Math.max(1, S.dragon.grown - dayIndex()) + ' days it can carry a rider.' : 'The egg rests by the kitchen hearth. It will hatch in ' + Math.max(1, S.dragon.hatch - dayIndex()) + ' days.') : 'Keep the drake egg by the hearth at Briarholt.' },
    { t: 'meet', who: 'isolde', at: 'castle:throne', hint: 'Isolde wants to see your dragon.', lines: L('isolde', 'Look at it. Look at its stupid wonderful face.', 'It\'s strong enough to carry you now. Use the dragon whistle anywhere outdoors and it will come.', 'And when you\'re ready, the capital is waiting. Morcant is there. So is the empty throne.') },
  ], reward: { gold: 10000, flag: 'dragonRider' } },
  { n: 'To Be Continued: Kingsholt', steps: [
    { t: 'cond', test: () => false, hint: 'The road to the capital, Kingsholt, opens in a coming update. Morcant and the empty throne wait there.' },
  ] },
);
STORY_WHEN.throne = 'once The Hollow Crown is complete';
SOBJ.huntcamp = 'campfire'; SOBJ.vigil = 'furn_candles';
storyWhere = (f => function (role) { if (role === 'castle:chapel') return MAPS.castle_in ? { map: 'castle_in', x: 55, y: 7 } : null; return f(role); })(storyWhere);

/* ---- the drake: the egg hatches by the hearth, the drakeling grows, then you can fly ---- */
storyAdvance = (f => function (sid) {
  const r = f(sid);
  if (sid === 'throne' && S.story.flags.eggHome && !S.dragon) { S.dragon = { stage: 0, hatch: dayIndex() + 5, grown: dayIndex() + 14 }; take('drake_egg', cnt('drake_egg')); }
  if (sid === 'throne' && S.story.flags.dragonRider && !cnt('dragon_whistle') && !S.dragon.whistle) { S.dragon.whistle = 1; give('dragon_whistle', 1); toast('Isolde gives you a dragon whistle.', 'lvl'); }
  return r;
})(storyAdvance);
endDay = (f => function (fainted) {
  const r = f(fainted);
  if (S.dragon) { if (S.dragon.stage === 0 && dayIndex() >= S.dragon.hatch) { S.dragon.stage = 1; toast('The drake egg has hatched! A drakeling sleeps by Briarholt\'s hearth.', 'lvl'); } if (S.dragon.stage === 1 && dayIndex() >= S.dragon.grown) { S.dragon.stage = 2; toast('Your drake is grown, strong enough to carry a rider.', 'lvl'); } }
  return r;
})(endDay);

/* ---- the siege of Briarholt ---- */
let SIEGE = null;
const SIEGE_WAVES = [[['bandit', 5]], [['bandit', 4], ['archer', 3]], [['bandit', 5], ['archer', 3], ['highbandit', 1]], [['warlord', 1], ['bandit', 4], ['archer', 2]]];
const siegeStep = () => { const st = stepOf('throne'); return st && st.id === 'siege' ? st : null; };
function siegeStart() {
  const m = MAPS.castle;
  SIEGE = { m, wave: -1, t: 12, allies: [] };
  const posts = [[GATE - 3, WY1 - 5], [GATE + 4, WY1 - 5], [GATE - 3, WY1 - 9], [GATE + 4, WY1 - 9], [GATE - 6, WY1 - 7], [GATE + 7, WY1 - 7]];
  posts.forEach(([x, y], i) => { const kind = i === 0 ? 'knight_c' : pickR(['knight_a', 'knight_b']), A = ALLY_KINDS[kind]; SIEGE.allies.push({ id: kind, x: (x + .5) * 16, y: (y + .8) * 16, hp: A.hp * 1.3, mhp: A.hp * 1.3, atk: A.atk * 1.4, post: [(x + .5) * 16, (y + .8) * 16], cd: 0, dir: 3 }); });
  showBanner('The Siege of Briarholt'); toast('Horns in the trees! Morcant\'s hunters are coming through the gate. Get ready!', 'bad'); if (SFX.boom) SFX.boom();
}
function siegeSpawn() {
  const m = SIEGE.m, W = SIEGE_WAVES[SIEGE.wave];
  for (const [k, n] of W) for (let i = 0; i < n; i++) {
    if (!EN[k]) continue;
    const x = (GATE + .5 + (Math.random() - .5) * 2) * 16, y = (WY1 - 1.5 - Math.random() * 2) * 16; // they come through the gate
    const e = spawnEnemy(m, k, x, y, 8 + SIEGE.wave * 3); e.siege = 1; e.woke = 1; e.home = [(GATE + 1) * 16, (WY1 - 8) * 16]; e.hx = e.home[0]; e.hy = e.home[1];
  }
  showBanner('Wave ' + (SIEGE.wave + 1) + ' of ' + SIEGE_WAVES.length); toast(SIEGE.wave === SIEGE_WAVES.length - 1 ? 'Morcant\'s champion leads the last charge!' : 'Here they come!', 'bad');
}
function siegeFrame(dt) {
  if (!S || !S.story) return;
  if (!SIEGE && siegeStep() && cur === MAPS.castle && S.story.flags.knightsAtBriar && !S.story.flags.siegeWon) siegeStart();
  if (!SIEGE) return;
  const m = SIEGE.m; if (cur !== m) return;
  const foes = m.ents.filter(e => e.type === 'enemy' && !e.dead && e.siege);
  if (SIEGE.wave >= 0) for (const e of foes) if (e.y > (WY1 - 1) * 16 && dist(e.x, e.y, S.p.x, S.p.y) > 60) { e.hx = (GATE + 1) * 16; e.hy = (WY1 - 8) * 16; e.woke = 1; } // through the gate, then at you
  if (!foes.length) {
    SIEGE.t -= dt;
    if (SIEGE.t <= 0) {
      if (SIEGE.wave >= SIEGE_WAVES.length - 1) { S.story.flags.siegeWon = 1; showBanner('Briarholt holds!'); toast('The hunters break and run. Briarholt is safe!', 'lvl'); if (SFX.lvl) SFX.lvl(); SIEGE.done = 1; }
      else { SIEGE.wave++; SIEGE.t = 8; siegeSpawn(); }
    }
  }
  // the knights hold the courtyard beside you
  for (const al of SIEGE.allies) {
    if (al.down > 0) { al.down -= dt; if (al.down <= 0) { al.hp = al.mhp; al.x = al.post[0]; al.y = al.post[1]; } continue; }
    al.cd -= dt; if (al.swing > 0) al.swing -= dt;
    if (!al.tgt || al.tgt.dead) { const near = allyFoes(m, al.x, al.y, 170), mine = near.length ? near : allyFoes(m, S.p.x, S.p.y, 160); al.tgt = mine.sort((a, b) => dist(a.x, a.y, al.x, al.y) - dist(b.x, b.y, al.x, al.y))[0] || null; } // or come to your side
    if (al.tgt) { const e = al.tgt; if (dist(e.x, e.y, al.x, al.y) > 16) allyMove(m, al, e.x, e.y, 46, dt); else if (al.cd <= 0) { al.cd = 1.1; allyStrike(m, al, e); }
      for (const e2 of allyFoes(m, al.x, al.y, 18)) { e2.allyCd = (e2.allyCd || 0) - dt; if (e2.allyCd <= 0) { e2.allyCd = 1.4; al.hp -= Math.max(1, Math.round((e2.atk || 5) * .4)); } }
      if (al.hp <= 0) { al.down = 30; al.tgt = null; toast((ALLY_KINDS[al.id] || {}).n + ' is wounded and falls back.'); } }
    else { if (al.hp < al.mhp) al.hp = Math.min(al.mhp, al.hp + 8 * dt); if (allyMove(m, al, al.post[0], al.post[1], 40, dt)) al.dir = 3; }
  }
  m.npcs = (m.npcs || []).filter(n => !n.ally).concat(SIEGE.allies.filter(a => !(a.down > 0)).map(a => Object.assign(a._n || (a._n = { ally: 1 }), { id: a.id, x: a.x, y: a.y, hx: a.x, hy: a.y, dir: a.dir, walk: a.walk, t: 1e9, vx: 0 })));
  if (SIEGE.done) { SIEGE.endT = (SIEGE.endT || 6) - dt; if (SIEGE.endT <= 0) { m.npcs = m.npcs.filter(n => !n.ally); SIEGE = null; } }
}
EVT.on('map', id => { if (SIEGE && id !== 'castle') { if (!SIEGE.done) toast('The hunters pull back into the trees. They\'ll come again when you return.'); SIEGE.m.ents = SIEGE.m.ents.filter(e => !e.siege); SIEGE.m.npcs = (SIEGE.m.npcs || []).filter(n => !n.ally); SIEGE = null; } });
faint = (f => function () { if (SIEGE && !SIEGE.done) { SIEGE.m.ents = SIEGE.m.ents.filter(e => !e.siege); SIEGE.m.npcs = (SIEGE.m.npcs || []).filter(n => !n.ally); SIEGE = null; toast('You fell, and the knights carried you out. The hunters will come again when you return.', 'bad'); } return f.apply(this, arguments); })(faint);

/* ---- ballistae: a heavy bolt at the nearest monster in range, on any land you own ---- */
const BOLTS = [];
function ballistaFrame(dt) {
  const m = cur; if (!m || !m.farm || !m.ents.some(e => e.type === 'enemy' && !e.dead)) { BOLTS.length = 0; return; }
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!o || o.k !== 'ballista') continue;
    o.cd = (o.cd || 0) - dt; if (o.cd > 0) continue;
    const x = (i % m.w + .5) * 16, y = ((i / m.w | 0) + .3) * 16, e = m.ents.filter(e => e.type === 'enemy' && !e.dead && dist(e.x, e.y, x, y) < 150).sort((a, b) => dist(a.x, a.y, x, y) - dist(b.x, b.y, x, y))[0];
    if (!e) continue; o.cd = 1.6; BOLTS.push({ x, y: y - 8, e, t: 0, T: Math.max(.12, dist(x, y, e.x, e.y) / 360), sx: x, sy: y - 8 }); if (SFX.bow) SFX.bow();
  }
  for (let i = BOLTS.length - 1; i >= 0; i--) {
    const b = BOLTS[i]; b.t += dt; const k = Math.min(1, b.t / b.T); b.x = b.sx + (b.e.x - b.sx) * k; b.y = b.sy + (b.e.y - 8 - b.sy) * k;
    if (k >= 1) { BOLTS.splice(i, 1); const e = b.e; if (e.dead) continue; const E = EN[e.k] || {}, dmg = Math.max(1, Math.round(40 * (.85 + Math.random() * .3) - (E.def || 0) * .4)); e.hp -= dmg; e.flash = .12; e.allyHit = gameT; floatText(e.x, e.y - 20, dmg, '#ffd890');
      if (e.hp <= 0) killEnemy(m, e); }
  }
}
pcCursorDraw = (f => function (m) {
  f(m);
  for (const b of BOLTS) { const a = Math.atan2(b.e.y - 8 - b.sy, b.e.x - b.sx); g.save(); g.translate(Math.round(b.x), Math.round(b.y)); g.rotate(Math.round(a / (Math.PI / 8)) * (Math.PI / 8)); g.fillStyle = '#2a1c18'; g.fillRect(-8, -1, 13, 2); g.fillStyle = '#9a6638'; g.fillRect(-7, -.5, 11, 1); g.fillStyle = '#c8ced8'; g.fillRect(4, -1.5, 3, 3); g.restore(); }
})(pcCursorDraw);
update = (f => function (dt) { f(dt); if (S && !TITLE) { siegeFrame(dt); ballistaFrame(dt); } })(update);

/* ---- story steps that bring their own trouble: Morcant's hired blades gather round the hunters' camp ---- */
EVT.on('tick', n => {
  if (n % 5 || !S || !S.story || !cur || cur.id !== 'wilds') return;
  const st = stepOf('throne'); if (!st || st.t !== 'kill' || st.enemy !== 'bandit') return;
  const w = storyWhere('site:wilds:forest'); if (!w || dist(S.p.x / 16, S.p.y / 16, w.x, w.y) > 28) return;
  const near = cur.ents.filter(e => e.k === 'bandit' && !e.dead && dist(e.x / 16, e.y / 16, w.x, w.y) < 20).length, left = st.n - (S.story.q.throne.kills || 0);
  for (let i = near; i < Math.min(4, left); i++) { const a = Math.random() * 6.28, x = (w.x + Math.cos(a) * 7) * 16, y = (w.y + Math.sin(a) * 6) * 16; if (!solidAt(cur, x, y)) spawnEnemy(cur, 'bandit', x, y, 10); }
});
SOBJ.huntcamp = 'tent';

/* ---- flying on your drake ---- */
function dragonFly(on) {
  if (on) {
    if (!S.dragon || S.dragon.stage < 2) { toast('Your drake is too young to carry you.'); return; }
    if (!cur.outdoor) { toast('Your drake can\'t fit in here. Go outside.'); return; }
    if (S.mounted) S.mounted = false;
    S.flying = true; if (SFX.boom) SFX.boom(); toast('A shadow passes over you, and your drake lands at your side. Up you go!', 'lvl');
  } else {
    const m = cur, tx = Math.floor(S.p.x / 16), ty = Math.floor((S.p.y - 2) / 16);
    if (solidAt(m, S.p.x, S.p.y - 2) || TER[getT(m, tx, ty)].water) { toast('Find open ground to land on.'); return; }
    S.flying = false; toast('Your drake sets you down and wheels away into the sky.');
  }
}
useItem = (f => function (id) { if (id === 'dragon_whistle') { dragonFly(!S.flying); return; } return f.apply(this, arguments); })(useItem);
toggleRide = (f => function () { if (S.flying) { dragonFly(false); return; } return f.apply(this, arguments); })(toggleRide);
// in the air nothing on the ground stops you, and you go three times as fast
moveEnt = (f => function (m, e, dx, dy, hw) {
  if (e === S.p && S.flying) { e.x = clamp(e.x + dx * 2.6, 6, m.w * 16 - 6); e.y = clamp(e.y + dy * 2.6, 10, m.h * 16 - 2); return true; }
  return f(m, e, dx, dy, hw);
})(moveEnt);
hurtPlayer = (f => function () { if (S && S.flying) return; return f.apply(this, arguments); })(hurtPlayer);
primaryUse = (f => function () { if (S && S.flying) { if (!(gameT - (window.__flyTip || 0) < 3)) { window.__flyTip = gameT; toast('Land first (R or the whistle).'); } return; } return f.apply(this, arguments); })(primaryUse);
EVT.on('map', () => { if (S && S.flying && cur && !cur.outdoor) S.flying = false; });
drawPlayer = (f => function () { if (S && S.flying) { shadow(S.p.x, S.p.y, 22); return; } return f(); })(drawPlayer);
pcCursorDraw = (f => function (m) {
  f(m);
  if (!S || !S.flying) return;
  const p = S.p, fr = pl.moving ? Math.floor(gameT * 8) % 4 : Math.floor(gameT * 4) % 4, frame = [0, 1, 2, 1][fr], bob = Math.round(Math.sin(gameT * 3) * 2), spr = PIX.get('drake_mount.' + frame);
  const right = p.dir === 2 || (p.dir !== 1 && p.lastH !== 1), y = p.y - 26 + bob;
  if (spr) { g.save(); g.translate(Math.round(p.x), Math.round(y)); if (!right) g.scale(-1, 1); D(spr, -spr.ww / 2, -spr.wh + 8, spr.ww, spr.wh); g.restore(); }
  const ps = humanSpr(HC_P || 'pl', playerPal(), 2, 'ride'); g.save(); g.translate(Math.round(p.x), Math.round(y)); if (!right) g.scale(-1, 1); D(ps, -8, -37, 16, 32); g.restore(); // seated in the saddle
  if (Math.random() < .2) PARTS.push({ x: p.x + (right ? -28 : 28), y: y - 10, vx: (right ? -20 : 20), vy: 6, t: .4, c: Math.random() < .5 ? '#f2a040' : '#e06a4a' });
})(pcCursorDraw);
/* the drakeling naps by the kitchen hearth until it's grown */
OBJ.drakeling = { solid: 1, fixed: 1 };
objSprite = (f => function (o, season) { if (o.k === 'drakeling') return PIX.get('drakeling'); return f(o, season); })(objSprite);
objInteract = (f => function (m, x, y, o) { if (o.k === 'drakeling') return { label: 'Pet', fn: () => { toast(pickR(['The drakeling chirps and nibbles your sleeve.', 'It breathes a tiny puff of smoke and looks very pleased with itself.', 'It\'s warm, and growing fast.'])); if (SFX.pop) SFX.pop(); } }; return f(m, x, y, o); })(objInteract);
function placeDrakeling() { const m = MAPS.castle_in; if (!m) return; for (let i = 0; i < m.o.length; i++) if (m.o[i] && m.o[i].k === 'drakeling') m.o[i] = null; if (S.dragon && S.dragon.stage === 1 && !getO(m, 9, 21)) setO(m, 9, 21, { k: 'drakeling', fixed: 1 }); }
initMaps = (f => function () { f(); placeDrakeling(); })(initMaps);
endDay = (f => function (fainted) { const r = f(fainted); placeDrakeling(); return r; })(endDay);
