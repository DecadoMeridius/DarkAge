/* ================= Phase 12: storylines =================
   Five questlines run side by side, each in chapters with its own cast and rewards:
     The Hollow Crown       the main story: Sir Aldren, the mine, and the crown's three pieces
     The Ashcombe Signet    the landowner's lost ring and estranged son
     The Lost Lanterns      the village's three great lanterns and Lantern Night
     The Salt Smugglers     lights at the wreck, Port Saltreach and the Drowned Captain
     The Ember Pilgrims     the shrines, the ember shards and the pilgrims' brazier
   Steps are written against ROLES, not coordinates ('wilds:ruins', 'highmarch:town',
   'site:emberwaste:cinder'), resolved per world (storyWhere). A step that needs a place
   that isn't there makes one: a free spot in that biome, remembered in S.story.places.
   Story characters and objects are placed fresh after every load and every step.
   Story progress opens the regions (S.regions), alongside the old boss gates.

   Step types: talk/bring (a villager), meet (a story character placed at a role),
   use (a story object placed at a role), go (reach a role), have (carry items),
   cond (any test), boss (a boss beaten), kill (enemies slain while the step is active). */

/* ---- quest items and rewards ---- */
[['squire_locket', 'Tomas\'s Locket', 'artifact', '#c8a040'], ['ashcombe_signet', 'Ashcombe Signet', 'ring', '#ffd040'], ['ashcombe_letter', 'Sealed Letter', 'map', '#ecd8a8'],
 ['old_lantern', 'Old Brass Lantern', 'jar', '#c8a040'], ['smuggler_ledger', 'Smuggler\'s Ledger', 'map', '#5a3a22']]
  .forEach(([id, n, shp, c]) => I(id, n, 'special', 0, shp, c, null, { quest: 1 }));
I('aldren_blade', 'Aldren\'s Blade', 'weapon', 30000, 'sword', '#e8e0ff', '#2a2a40', { slot: 'weapon', atk: 72, wt: 'sword', tier: 'star', ti: 12, cd: WTYPE.sword.cd, desc: 'The knight\'s own sword. It hums near the mine.' });
[['ring_ashcombe', 'Stag Signet', { luck: 1, gold: .15 }, '+1 luck, +15% gold from monsters', '#ffd040'], ['ring_smuggler', 'Smuggler\'s Spyglass', { luck: 2, magnet: 1 }, '+2 luck, larger pickup radius', '#2a8a9a'],
 ['ring_pilgrim', 'Pilgrim\'s Flame', { atk: 5, def: 5, regen: 1 }, '+5 attack, +5 defence, slow regeneration', '#ff8a3a']]
  .forEach(([id, n, b, d, c]) => I(id, n, 'ring', 3000, 'ring', c, '#ffd040', { slot: 'ring', bonus: b, desc: d }));

/* ---- the cast: villagers come from NPCS, these are the new faces ---- */
const SCAST = {
  ashcombe: { n: 'Lord Ashcombe', P: HP(0, { skin: '#e8c0a0', hair: '#a8a8a8', hs: 'short', shirt: '#2a3a5a', pants: '#2a2a2a', beard: '#a8a8a8', cape: '#5a1a2a' }) },
  marta: { n: 'Old Marta', P: HP(0, { skin: '#e0b090', hair: '#d8d8d0', hs: 'bun', shirt: '#4a6a8a', pants: '#3a3a40', apron: '#8a6a4a' }) },
  sigrun: { n: 'Elder Sigrun', P: HP(0, { skin: '#f0d8c8', hair: '#f4f0e8', hs: 'long', shirt: '#6a8ab0', pants: '#3a4a5a', cape: '#e8f0fa' }) },
  aldren: { n: 'Sir Aldren', P: HP(0, { skin: '#bfe0f0', hair: '#d8eaf4', shirt: '#5a6a80', pants: '#3a4a5a', helm: '#8a9ab0', cape: '#2a3a6a', glow: '#9ad8ff', beard: '#d8eaf4' }) },
  rowan: { n: 'Rowan Ashcombe', P: HP(0, { skin: '#e8c0a0', hair: '#5a3a22', hs: 'short', shirt: '#6a3a2a', pants: '#3a3a40', cape: '#5a1a2a' }) },
  quill: { n: 'Harbourmaster Quill', P: HP(0, { skin: '#c8906a', hair: '#2a1a10', hs: 'pony', shirt: '#2a5a8a', pants: '#e8e0d0', hat: '#1a2a3a' }) },
  wren: { n: 'Sister Wren', P: HP(0, { skin: '#f0c8a0', hair: '#8a3a1a', hs: 'long', shirt: '#c8601a', pants: '#8a3a1a', robe: 1 }) },
};
const who = id => SCAST[id] ? SCAST[id] : NPCS[id] ? { n: NPCS[id].n, P: NPCS[id].P } : null;
const ACTNPC = { store: 'mara', smith: 'brann', tavern: 'pip', stablemaster: 'odile', carpenter: 'hale', museum: 'elias', fisher: 'corwin', landowner: 'ashcombe' };
const NPCACT = Object.fromEntries(Object.entries(ACTNPC).map(([a, n]) => [n, a]));

/* ---- the stories ---- */
const L = (s, ...t) => t.map(x => [s, x]);
const STORIES = {
  hollow: { n: 'The Hollow Crown', blurb: 'What happened to Sir Aldren, and what still sleeps beneath the mine.', start: () => S.day >= 2 || S.season > 0 || S.year > 1, how: 'Elias at the museum wants a word.',
    ch: [
      { n: 'Grandmother\'s Pages', steps: [
        { t: 'talk', who: 'elias', hint: 'Talk to Elias at the museum.', lines: L('elias', 'Ah, the new farmer. Your grandmother and I argued for forty years about a knight called Aldren.', 'She kept a journal, then tore it to pieces before she died. The pages blew all over the Wilds.', 'Find three of them? I\'d like to know what she was hiding.') },
        { t: 'cond', test: () => Object.keys(S.pages).length >= 3, hint: () => 'Find 3 lost journal pages in the Wilds (' + Object.keys(S.pages).length + ' found).', at: 'wilds:ruins' },
        { t: 'talk', who: 'elias', hint: 'Bring what you\'ve read back to Elias.', lines: L('elias', 'Sir Aldren went down the old mine and never came back. So that part was true.', 'And his squire buried something by the ruins in the Wilds. Your grandmother watched from a hedge, the little spy.', 'Go and look. Gently. It\'s a grave, after all.') },
      ], reward: { gold: 800 } },
      { n: 'The Squire\'s Grave', steps: [
        { t: 'use', at: 'wilds:ruins', obj: 'cairn', hint: 'Search for the squire\'s grave near the ruins in the Wilds.', give: { squire_locket: 1 },
          lines: L('narr', 'A cairn of mossy stones. A name is scratched into the top one: TOMAS, SQUIRE.', 'Tucked between the stones is a rusted locket. Inside, a folded note: "He went to face the Warden. If he does not come back, give his key to the smith."') },
        { t: 'boss', boss: 'warden', hint: 'Defeat the Stone Warden on mine floor 10.' },
        { t: 'bring', who: 'brann', items: { squire_locket: 1, warden_heart: 1 }, hint: 'Bring Tomas\'s locket and a Warden Heart to Brann.', wait: 'Tomas\'s locket? My grandfather knew him. Bring me the Warden\'s heart as well and I\'ll show you something.',
          lines: L('brann', 'This heart still hums. Feel that? Aldren\'s key was forged to answer it.', 'My grandfather kept the key in a box under the anvil, waiting for whoever came back with this.', 'It opens the old pass north of the mine. The Highmarch. Nobody\'s been up there in fifty years. Mind the raiders.') },
      ], reward: { gold: 1500, region: 'highmarch' } },
      { n: 'The Sunken Forge', steps: [
        { t: 'meet', who: 'marta', at: 'highmarch:town', hint: 'Find someone in Highmarch Hold who remembers Aldren.', lines: L('marta', 'A lowlander carrying Aldren\'s key. Well, well.', 'He came through here on his way to the Sunken Forge. Said the crown he hunted was made down there.', 'Something still tends those fires. Go down and put them out for good.') },
        { t: 'boss', boss: 'forgeking', hint: 'Defeat the Forge King at the bottom of the Sunken Forge.', at: 'highmarch:dungeon' },
        { t: 'meet', who: 'marta', at: 'highmarch:town', hint: 'Tell Old Marta the forge is cold.', lines: L('marta', 'Cold at last. I felt the mountain sigh.', 'Aldren believed the crown\'s wearer sleeps beneath your mine, and that the wyrm guards the way.', 'Silence the wyrm, then ask your curator about the seal. He reads old script better than I do.') },
      ], reward: { gold: 3000, items: { cobalt_bar: 5 } } },
      { n: 'The Wyrm\'s Sleep', steps: [
        { t: 'boss', boss: 'wyrm', hint: 'Defeat the Ember Wyrm on mine floor 20.' },
        { t: 'talk', who: 'elias', hint: 'Tell Elias about the wyrm.', lines: L('elias', 'You faced the wyrm and lived? Then the words on the seal make sense now.', '"The crown\'s cold half sleeps with the Queen of Rime." The Frostmere, past Frostpeak.', 'There\'s a village up there, Rimehold. Ask for the elder. And wear something warm.') },
      ], reward: { gold: 5000, region: 'frostmere' } },
      { n: 'Rime and Ruin', steps: [
        { t: 'meet', who: 'sigrun', at: 'frostmere:town', hint: 'Find the elder of Rimehold.', lines: L('sigrun', 'Aldren\'s kin? You have his stubborn jaw.', 'The Rime Queen took the crown\'s cold half when he fell, and she has worn it ever since.', 'While she wears it, winter never leaves us. End her reign.') },
        { t: 'boss', boss: 'rimequeen', hint: 'Defeat the Rime Queen in the Frostmere.', at: 'frostmere:arena' },
        { t: 'meet', who: 'sigrun', at: 'frostmere:town', hint: 'Return to Elder Sigrun.', lines: L('sigrun', 'The ice cracked last night. Children ran out to hear it.', 'Aldren\'s trail ends in the Emberwaste. But the Pale Lich guards the way down your mine. Beat it first, or the crown\'s last bearer will wake knowing you\'re coming.') },
        { t: 'boss', boss: 'lich', hint: 'Defeat the Pale Lich on mine floor 30.' },
      ], reward: { gold: 7000, region: 'emberwaste' } },
      { n: 'The Hollow King', steps: [
        { t: 'meet', who: 'aldren', at: 'site:emberwaste:cinder', hint: 'Search the Cinder Fields of the Emberwaste for Aldren\'s last camp.', lines: L('aldren', '...You carry my key. And my sister\'s eyes. Her grandchild, then.', 'I came here to burn the crown\'s last piece and failed. The Drake took it to its lair.', 'Kill the Drake. Then go down your mine, to the very bottom, and end the one who wears the hollow crown.') },
        { t: 'boss', boss: 'cinderdrake', hint: 'Defeat the Cinder Drake in the Emberwaste.', at: 'emberwaste:arena' },
        { t: 'boss', boss: 'hollowking', hint: 'Defeat the Hollow King on mine floor 40.' },
        { t: 'meet', who: 'aldren', at: 'farm:home', hint: 'Someone is waiting at your farm.', lines: L('aldren', 'It is done. The hill is quiet. I can hear the bees again.', 'Take my blade. I have no more use for it.', 'Tend your farm. And tell them in the village that Aldren came home.') },
      ], reward: { gold: 25000, items: { aldren_blade: 1 } } },
    ] },
  ashcombe: { n: 'The Ashcombe Signet', blurb: 'The landowner\'s lost ring, and the son who left.', start: () => S.day >= 5 || S.season > 0 || S.year > 1, how: 'Lord Ashcombe has asked to see you at the manor.',
    ch: [
      { n: 'A Debt of Land', steps: [
        { t: 'talk', who: 'ashcombe', hint: 'Visit Lord Ashcombe at his manor in the village.', lines: L('ashcombe', 'So you are the one farming old Margit\'s land. Good. It was going to seed.', 'My family\'s signet was lost when our hunting lodge burned. It stood in the Wilds\' meadows, before the trees took it back.', 'Find the ruin and bring me that ring. I pay my debts.') },
        { t: 'use', at: 'site:wilds:meadow', obj: 'lodge', hint: 'Find the burned hunting lodge in the Wilds\' meadows.', give: { ashcombe_signet: 1 }, lines: L('narr', 'Charred beams and a fallen chimney, half swallowed by brambles.', 'Under the hearthstone lies a heavy gold ring with a stag on it.') },
        { t: 'bring', who: 'ashcombe', items: { ashcombe_signet: 1 }, hint: 'Return the signet to Lord Ashcombe.', lines: L('ashcombe', 'The stag of Ashcombe. My father wore this every day of his life.', 'Any land you buy from me is a tenth cheaper from now on. A debt is a debt.') },
      ], reward: { gold: 1000, flag: 'ashDiscount' } },
      { n: 'The Black Sheep', steps: [
        { t: 'talk', who: 'ashcombe', hint: 'Lord Ashcombe wants another word.', give: { ashcombe_letter: 1 }, lines: L('ashcombe', 'My son Rowan left for the Highmarch three winters ago. We... disagreed about the estate.', 'Take him this letter. I won\'t ask you to read it. Please don\'t.') },
        { t: 'cond', test: () => regionOpen('highmarch'), hint: 'Find a way into the Highmarch (the Hollow Crown leads there).' },
        { t: 'meet', who: 'rowan', at: 'highmarch:town', items: { ashcombe_letter: 1 }, hint: 'Give the letter to Rowan Ashcombe in Highmarch Hold.', lines: L('rowan', 'A letter from father? He\'s never written me a single line.', '...He says he was wrong. He\'s never said that either.', 'I\'d go home. But raiders hold the road down. Clear ten of them and I\'ll walk it with you.') },
        { t: 'kill', enemy: 'highbandit', n: 10, hint: n => 'Defeat Highmarch Raiders (' + n + '/10).' },
        { t: 'meet', who: 'rowan', at: 'village:plaza', hint: 'Rowan made it home. Find him in the village.', lines: L('rowan', 'Home. It\'s smaller than I remember. Or I\'m bigger.', 'Father wants to give you something. He\'s waiting at the manor. Go on.') },
        { t: 'talk', who: 'ashcombe', hint: 'Lord Ashcombe is waiting at the manor.', lines: L('ashcombe', 'My son is home. I don\'t have the words for that, so take this instead.', 'Wear it. Let people see that the Ashcombes owe you.') },
      ], reward: { gold: 4000, items: { ring_ashcombe: 1 } } },
    ] },
  lanterns: { n: 'The Lost Lanterns', blurb: 'Three great lanterns once guided the village home.', start: () => S.day >= 3 || S.season > 0 || S.year > 1, how: 'Pip at the tavern has a story to tell.',
    ch: [
      { n: 'Three Dark Lanterns', steps: [
        { t: 'talk', who: 'pip', hint: 'Talk to Pip at the tavern.', lines: L('pip', 'Ever wonder why we release lanterns every summer?', 'The village used to keep three great lanterns burning all year: at the old ruins, deep in the forest, and on Corwin\'s dock. They guided people home from the Wilds.', 'They went dark when the wyrm stirred. Nobody\'s been brave enough to fetch them. Are you?') },
        { t: 'use', at: 'wilds:ruins', obj: 'oldlantern', give: { old_lantern: 1 }, hint: 'Find the old lantern at the ruins in the Wilds.', lines: L('narr', 'A brass lantern on a toppled post, green with age. The glass is cracked, but whole.') },
        { t: 'use', at: 'site:wilds:forest', obj: 'oldlantern', give: { old_lantern: 1 }, hint: 'Find the old lantern deep in the Whisperwood.', lines: L('narr', 'Wrapped in ivy, high on an oak stump: the second lantern. A bird has nested in it.') },
        { t: 'use', at: 'wilds:hut', obj: 'oldlantern', give: { old_lantern: 1 }, hint: 'Find the old lantern by Corwin\'s hut on the coast.', lines: L('narr', 'Half buried in the sand by the dock, the third lantern. Salt has eaten its handle.') },
        { t: 'bring', who: 'pip', items: { old_lantern: 3 }, hint: 'Bring the three lanterns to Pip.', lines: L('pip', 'All three! Dented, but they\'re ours.', 'Hale could mend them. He fixes everything else in this village.') },
      ], reward: { gold: 600 } },
      { n: 'Mending the Light', steps: [
        { t: 'bring', who: 'hale', items: { old_lantern: 3, copper_bar: 3, sap: 2 }, hint: 'Bring Hale the lanterns, 3 copper bars and 2 amber sap.', wait: 'Old brass. Good brass. I\'ll need three copper bars and a bit of amber sap to seal the glass.',
          lines: L('hale', 'Give me an evening with these.', '...There. They\'ll burn another hundred years. Mara\'s been asking about them, you know.') },
        { t: 'talk', who: 'mara', hint: 'Show Mara the mended lanterns.', lines: L('mara', 'Oh... I haven\'t seen these lit since I was a girl.', 'Light them on Lantern Night, in the plaza. The whole village will come. I\'ll make sure of it.') },
      ], reward: { gold: 800 } },
      { n: 'Lights Home', steps: [
        { t: 'cond', test: () => S.season === 1 && S.day === 11 && S.time >= 1140 && cur && cur.id === 'village', hint: 'On Lantern Night (Summer 11), come to the village after 19:00.', at: 'village:plaza' },
        { t: 'talk', who: 'pip', hint: 'Find Pip in the crowd.', lines: L('pip', 'Look at them. Everyone came. Even Lord Ashcombe, and he hates crowds.', 'This is from all of us. Hang them on your farm, so you can always find your way home.') },
      ], reward: { gold: 1500, items: { lantern: 5 }, friends: 50 } },
    ] },
  smugglers: { n: 'The Salt Smugglers', blurb: 'Lights at the wreck, and the ships that run to the Saltreach.', start: () => S.day >= 4 || S.season > 0 || S.year > 1, how: 'Corwin, the old fisher on the coast, has noticed something.',
    ch: [
      { n: 'Lights on the Water', steps: [
        { t: 'talk', who: 'corwin', hint: 'Talk to Corwin at his hut on the coast.', lines: L('corwin', 'There\'ve been lights out by the old wreck after dark. Not fishers. Fishers sleep.', 'Have a look tonight, would you? I\'m too old for creeping about.') },
        { t: 'use', at: 'wilds:wreck', obj: 'ledger', night: 1, give: { smuggler_ledger: 1 }, hint: 'Search the wreck on the coast after dark (20:00 or later).', lines: L('narr', 'Fresh bootprints in the wet sand, and a waxed bundle tucked into the hull.', 'A ledger: cargo, dates, and one name again and again. "The Captain."') },
        { t: 'bring', who: 'corwin', items: { smuggler_ledger: 1 }, hint: 'Show Corwin the ledger.', lines: L('corwin', 'Pearls, kraken ink, moonfish... all out of the Saltreach.', 'That\'s where they run, then. My boat\'s tied at the dock. I\'ll row you out myself.') },
      ], reward: { gold: 1200, region: 'saltreach' } },
      { n: 'Port Saltreach', steps: [
        { t: 'meet', who: 'quill', at: 'saltreach:town', hint: 'Find the harbourmaster in Port Saltreach.', lines: L('quill', 'Harbourmaster Quill. Corwin sent word ahead.', 'The smugglers keep a cache somewhere on the isles. Find it and we\'ll learn who\'s buying.') },
        { t: 'use', at: 'site:saltreach:isles', obj: 'cache', hint: 'Find the smugglers\' cache on the isles.', lines: L('narr', 'Crates of pearls, kraken ink and unmarked ore, with the Captain\'s sign burned into every lid.') },
        { t: 'meet', who: 'quill', at: 'saltreach:town', hint: 'Tell Quill what you found.', lines: L('quill', 'You found it! Well then. Do we hand it to the port... or did it fall into the sea?'),
          choices: [['Hand it over', { flag: 'smug', v: 'law', gold: 6000, line: ['quill', 'Honest. Rare round here. The port won\'t forget it.'] }], ['Keep the cargo', { flag: 'smug', v: 'rogue', items: { pearl: 3, aquamarine: 4 }, line: ['quill', 'I didn\'t see anything. Neither did you.'] }]] },
      ], reward: { gold: 500 } },
      { n: 'The Captain', steps: [
        { t: 'kill', enemy: 'drowned', n: 6, hint: n => 'Defeat the Drowned on the isles (' + n + '/6).' },
        { t: 'boss', boss: 'drownedcaptain', hint: 'Defeat the Drowned Captain.', at: 'saltreach:arena' },
        { t: 'meet', who: 'quill', at: 'saltreach:town', hint: 'Return to Harbourmaster Quill.', lines: L('quill', 'The Captain\'s gone. The port can breathe again.', 'He kept this on his belt. I think you\'ve earned it more than the sea has.') },
      ], reward: { gold: 5000, items: { ring_smuggler: 1 } } },
    ] },
  pilgrims: { n: 'The Ember Pilgrims', blurb: 'The shrines, the ember shards, and the road through the ash.', start: () => S.day >= 6 || S.shardsTotal >= 1 || S.season > 0 || S.year > 1, how: 'A pilgrim waits at the forest shrine in the Wilds.',
    ch: [
      { n: 'The Sister at the Shrine', steps: [
        { t: 'meet', who: 'wren', at: 'wilds:shrine:forest', hint: 'Meet the pilgrim at the forest shrine in the Wilds.', lines: L('wren', 'Peace, traveller. I am Wren, of the Ember Pilgrims.', 'We tend the four shrines. This one has gone cold. It wants old hardwood and a lucky charm.', 'Wake it, and I\'ll tell you what the ember shards are for.') },
        { t: 'cond', test: () => !!S.shrines.forest, hint: 'Restore the Shrine of Leaves (30 hardwood and a rabbit\'s foot).', at: 'wilds:shrine:forest' },
        { t: 'meet', who: 'wren', at: 'wilds:shrine:forest', hint: 'Speak with Sister Wren.', lines: L('wren', 'Warm again. Thank you.', 'The ember shards are pieces of the seal that bound the wyrm. Gather ten, and the old altar in the village will remember you.') },
      ], reward: { gold: 1000 } },
      { n: 'Ten Embers', steps: [
        { t: 'cond', test: () => S.shardsTotal >= 10, hint: () => 'Find 10 ember shards (' + S.shardsTotal + '/10).' },
        { t: 'meet', who: 'wren', at: 'village:altar', hint: 'Meet Wren at the village altar.', lines: L('wren', 'Ten. The altar is listening now.', 'Wake the other shrines: tide, frost and flame. When all four burn, the pilgrims\' road opens through the ash.') },
      ], reward: { gold: 2000 } },
      { n: 'Four Winds', steps: [
        { t: 'cond', test: () => Object.keys(S.shrines).length >= 4, hint: () => 'Restore all four shrines (' + Object.keys(S.shrines).length + '/4).' },
        { t: 'meet', who: 'wren', at: 'village:altar', hint: 'Tell Wren the shrines are lit.', lines: L('wren', 'All four. I never thought I\'d live to see it.', 'The pilgrims\' road runs north through the ash. Our camp keeps a brazier there. Come when you carry thirty shards.') },
      ], reward: { gold: 4000, region: 'emberwaste' } },
      { n: 'The Eternal Flame', steps: [
        { t: 'cond', test: () => S.shardsTotal >= 30, hint: () => 'Gather all 30 ember shards (' + S.shardsTotal + '/30).' },
        { t: 'use', at: 'site:emberwaste:badlands', obj: 'brazier', hint: 'Bring the shards to the pilgrims\' brazier in the Emberwaste badlands.', lines: L('narr', 'You hold the thirty shards over the brazier. The flame turns white and roars.'), after: L('wren', 'The seal is whole again. Whatever waits below, the valley is safe.', 'Take the pilgrims\' flame. It will keep you warm on any road.') },
      ], reward: { gold: 8000, items: { ring_pilgrim: 1 } } },
    ] },
};

/* ---- state ---- */
function storyState() {
  S.story = S.story || {}; const T = S.story;
  T.q = T.q || {}; T.flags = T.flags || {}; T.places = T.places || {};
  let fresh = false;
  for (const sid in STORIES) if (!T.q[sid] && STORIES[sid].start()) { T.q[sid] = { c: 0, i: 0, kills: 0 }; fresh = true; if (cur) toast('New story: ' + STORIES[sid].n + '. ' + STORIES[sid].how, 'lvl'); }
  if (fresh && MAPS.wilds) storyPlace();
  return T;
}
const stepOf = sid => { const q = S.story && S.story.q[sid]; if (!q || q.done) return null; const C = STORIES[sid].ch[q.c]; return C && C.steps[q.i]; };
const hintOf = (sid, st) => { const h = st.hint; return typeof h === 'function' ? h(st.t === 'kill' ? (S.story.q[sid].kills || 0) : undefined) : h; };

function storyGive(g) {
  if (!g) return; for (const k in g) { if (k === '$') S.gold += g[k]; else give(k, g[k]); }
}
function storyAdvance(sid) {
  const T = storyState(), q = T.q[sid], Sd = STORIES[sid], C = Sd.ch[q.c];
  q.i++; q.kills = 0; q.bossBase = null;
  if (q.i >= C.steps.length) {
    const R = C.reward || {};
    if (R.gold) S.gold += R.gold; storyGive(R.items); if (R.flag) T.flags[R.flag] = 1;
    if (R.friends) for (const id in NPCS) addFriend(id, R.friends);
    if (R.region) { S.regions = S.regions || {}; S.regions[R.region] = 1; toast('The way to ' + REGIONS[R.region].n + ' is open.', 'lvl'); }
    toast('Chapter complete: ' + C.n + (R.gold ? ' (+' + R.gold.toLocaleString() + 'g)' : ''), 'lvl'); SFX.lvl();
    q.c++; q.i = 0;
    if (q.c >= Sd.ch.length) { q.done = 1; toast(Sd.n + ': story complete!', 'lvl'); }
    else toast('New chapter: ' + Sd.ch[q.c].n);
  }
  storyPlace();
}

/* ---- dialogue: a box along the bottom of the screen, portrait, name, line by line,
   optional choices at the end. The game pauses while it's open; Space, Enter or E continue. ---- */
let DIALOG = null;
function storyDialog(lines, opts = {}) {
  if (DIALOG) DIALOG.close(true);
  let i = 0;
  const box = el('div', { class: 'f-panel storybox' }), wasPaused = PAUSED;
  Object.assign(box.style, { position: 'fixed', left: '50%', bottom: '86px', transform: 'translateX(-50%)', width: 'min(760px, 92vw)', display: 'flex', gap: '16px', alignItems: 'center', padding: '14px 18px', zIndex: 40 });
  document.body.append(box); PAUSED = true; INPUT.x = INPUT.y = 0;
  const close = quiet => { box.remove(); removeEventListener('keydown', key, true); DIALOG = null; PAUSED = wasPaused && !!MODAL; if (!quiet && opts.done) opts.done(); };
  const next = () => { if (i < lines.length - 1) { i++; draw(); } else if (!opts.choices) close(); };
  const key = e => { if (['Space', 'Enter', 'KeyE', 'NumpadEnter'].includes(e.code) || [' ', 'Enter', 'e', 'E'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); next(); } else if (e.code === 'Escape' && !opts.choices) { e.preventDefault(); e.stopPropagation(); i = lines.length - 1; close(); } };
  addEventListener('keydown', key, true);
  const draw = () => {
    box.innerHTML = '';
    const [sp, text] = lines[i], W = sp === 'narr' ? null : who(sp);
    if (W) { const spr = humanSpr('st' + sp, W.P, 0, 0), c = el('canvas', { width: spr.width, height: spr.height }); c.getContext('2d').drawImage(spr, 0, 0); Object.assign(c.style, { width: spr.width * 2 + 'px', height: spr.height * 2 + 'px', imageRendering: 'pixelated', flex: 'none' }); box.append(c); }
    const txt = el('div', { class: 'rtxt' }, el('small', null, opts.title || ''), el('b', null, W ? W.n : ''), el('p', null, W ? '“' + text + '”' : el('i', null, text)));
    txt.style.flex = '1';
    const acts = el('div', { class: 'acts col' });
    if (i < lines.length - 1) acts.append(el('button', { class: 'btn', on: next }, 'Continue'));
    else if (opts.choices) opts.choices.forEach(([label, fn]) => acts.append(el('button', { class: 'btn', on: () => { close(true); fn(); } }, label)));
    else acts.append(el('button', { class: 'btn', on: () => close() }, opts.last || 'Close'));
    box.append(txt, acts);
  };
  draw();
  DIALOG = { close };
}
function runStep(sid, st, extraFirst) {
  const lines = (extraFirst || []).concat(st.lines || []), finish = () => { storyGive(st.give); if (st.after) storyDialog(st.after, { title: STORIES[sid].n, done: () => storyAdvance(sid) }); else storyAdvance(sid); };
  if (st.choices) return storyDialog(lines, { title: STORIES[sid].n, choices: st.choices.map(([label, c]) => [label, () => { S.story.flags[c.flag] = c.v; if (c.gold) S.gold += c.gold; storyGive(c.items); storyDialog([c.line], { title: STORIES[sid].n, done: () => storyAdvance(sid) }); }]) });
  if (lines.length) storyDialog(lines, { title: STORIES[sid].n, done: finish }); else finish();
}
const hasAll = items => Object.entries(items || {}).every(([k, n]) => cnt(k) >= n);
const takeAll = items => { for (const k in items || {}) take(k, items[k]); };

/* talking to someone: if a story is waiting on them, the story goes first */
function storyTalk(npc) {
  storyState();
  for (const sid in STORIES) {
    const st = stepOf(sid); if (!st || st.who !== npc || !['talk', 'bring', 'meet'].includes(st.t)) continue;
    if (st.items && !hasAll(st.items)) { const miss = Object.entries(st.items).filter(([k, n]) => cnt(k) < n).map(([k, n]) => (n - cnt(k)) + ' ' + IT[k].n).join(', '); storyDialog([[npc, (st.wait ? st.wait + ' ' : '') + '(Still needed: ' + miss + '.)']], { title: STORIES[sid].n }); return true; }
    takeAll(st.items); runStep(sid, st); return true;
  }
  return false;
}
const _doorActionW = doorAction;
doorAction = function (act, who_) {
  const npc = who_ || (!ROOMS[act] || (cur && cur.id === 'in_' + act) ? ACTNPC[act] : null);
  if (npc && storyTalk(npc)) return;
  return _doorActionW(act, who_);
};

/* ---- roles -> places ---- */
function freeNear(m, x, y, r0 = 1, r1 = 8) {
  for (let r = r0; r <= r1; r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue; const X = x + i, Y = y + j;
    if (!inb(m, X, Y) || !inb(m, X, Y + 1) || getO(m, X, Y) || getO(m, X, Y + 1) || m.solidB[Y * m.w + X] || m.solidB[(Y + 1) * m.w + X]) continue;
    const t = TER[getT(m, X, Y)]; if (t.solid || t.water || t.lava || m.warps.some(w => X >= w.x - 1 && X <= w.x + w.w && Math.abs(Y - w.y) < 3)) continue;
    return [X, Y];
  }
  return null;
}
function storyWhere(role) { // -> { map, x, y } in tiles, or null if that place isn't reachable yet
  const T = S.story, p = role.split(':');
  if (T.places[role]) { const [map, x, y] = T.places[role]; return MAPS[map] ? { map, x, y } : null; }
  let map, x, y;
  if (p[0] === 'wilds') { const m = MAPS.wilds, poi = m.poi.find(o => o.type === p[1] && (!p[2] || o.bio === p[2])); if (!poi) return null; map = 'wilds'; [x, y] = freeNear(m, poi.x, poi.y + 2, 2, 8) || [poi.x, poi.y + 3]; }
  else if (REGIONS[p[0]]) { const m = MAPS[p[0]]; if (!m) return null; map = p[0]; const base = p[1] === 'town' ? [m.safe[0] + 3, m.safe[1] + 1] : p[1] === 'dungeon' ? [m.dgDoor.x, m.dgDoor.y + 2] : [m.arenas[0].x, m.arenas[0].y + 8]; [x, y] = freeNear(m, base[0], base[1], 0, 8) || base; }
  else if (p[0] === 'site') { // a place that didn't exist: pick a quiet spot in that biome and remember it
    const m = MAPS[p[1]]; if (!m || !m.bio) return null; const R2 = rng((S.seed * 17 + strSeed(role)) | 0), want = BIOMES.indexOf(p[2]);
    for (let k = 0; k < 4000 && x === undefined; k++) { const X = 10 + Math.floor(R2() * (m.w - 20)), Y = 10 + Math.floor(R2() * (m.h - 30)); if (m.bio[Y * m.w + X] !== want) continue; if (m.safe && dist(X, Y, m.safe[0], m.safe[1]) < 20) continue; const f = freeNear(m, X, Y, 0, 3); if (f) [x, y] = f; }
    if (x === undefined) return null; map = p[1];
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const o = getO(m, x + i, y + j); if (o && !o.story && (i || j)) delObj(m, x + i, y + j); } // a small clearing around it
  }
  else if (p[0] === 'village') { const m = MAPS.village; let a = null; for (let i = 0; i < m.o.length && !a; i++) if (m.o[i] && m.o[i].k === 'altar') a = [i % m.w, (i / m.w) | 0]; a = a || [25, 18]; map = 'village'; [x, y] = freeNear(m, a[0] + (p[1] === 'plaza' ? -3 : 1), a[1] + 2, 0, 8) || a; }
  else if (p[0] === 'farm') { const m = MAPS.farm, h = m.bHouse; map = 'farm'; [x, y] = freeNear(m, h ? h.door.x + 2 : 10, h ? h.door.y + 2 : 10, 0, 8) || [12, 12]; }
  else return null;
  T.places[role] = [map, x, y];
  return { map, x, y };
}
function npcWhere(id) {
  if (id === 'ashcombe') { const b = MAPS.village.bld.find(b => b.act === 'landowner'); return b ? { map: 'village', x: b.door.x, y: b.door.y + 1 } : null; }
  const act = NPCACT[id]; if (act) { const f = findBuilding(act); if (f) return { map: f[0], x: f[1].door.x, y: f[1].door.y + 1 }; }
  return null;
}
function stepWhere(sid, st) { return st.at ? storyWhere(st.at) : st.who ? npcWhere(st.who) : null; }

/* story characters and objects: removed everywhere, then put back where the current steps need them */
OBJ.storynpc = { solid: 1, tall: 1 }; OBJ.storyobj = { solid: 1 };
function storyPlace() {
  if (!S || !S.story) return;
  for (const id in MAPS) { const m = MAPS[id]; if (!m || !m.o) continue; for (let i = 0; i < m.o.length; i++) if (m.o[i] && m.o[i].story) m.o[i] = null; }
  for (const sid in STORIES) {
    const st = stepOf(sid); if (!st || !(st.t === 'meet' || st.t === 'use')) continue;
    const w = storyWhere(st.at); if (!w) continue; const m = MAPS[w.map];
    if (getO(m, w.x, w.y)) delObj(m, w.x, w.y);
    m.o[w.y * m.w + w.x] = st.t === 'meet' ? { k: 'storynpc', c: st.who, sid, story: 1 } : { k: 'storyobj', v: st.obj, sid, story: 1 };
  }
}
const SOBJ = { cairn: 'grave', oldlantern: 'lantern', ledger: 'chest', cache: 'chest', lodge: 'ruinwall', brazier: 'campfire' };
const SCACHE = {};
const _objSpriteW = objSprite;
objSprite = function (o, season) {
  if (o.k === 'storynpc') { const W = who(o.c); return W ? (SCACHE[o.c] || (SCACHE[o.c] = humanSpr('st' + o.c, W.P, 0, 0))) : null; }
  if (o.k === 'storyobj') { const s = SPR[SOBJ[o.v]]; return Array.isArray(s) ? s[o.v === 'brazier' ? Math.floor(gameT * 6) % s.length : 0] : s; }
  return _objSpriteW(o, season);
};
const _objInteractW = objInteract;
objInteract = function (m, x, y, o) {
  if (o.k === 'storynpc') return { label: 'Talk', fn: () => { const st = stepOf(o.sid); if (!st || st.who !== o.c) return; if (st.items && !hasAll(st.items)) { storyDialog([[o.c, 'You don\'t have what I need yet. (' + Object.entries(st.items).map(([k, n]) => n + ' ' + IT[k].n).join(', ') + ')']], { title: STORIES[o.sid].n }); return; } takeAll(st.items); runStep(o.sid, st); } };
  if (o.k === 'storyobj') return { label: 'Search', fn: () => { const st = stepOf(o.sid); if (!st) return; if (st.night && !(S.time >= 1200 || S.time < 300)) { toast('Nothing here by daylight. Corwin said the lights come after dark.'); return; } runStep(o.sid, st); } };
  const npc = o.k === 'keeper' ? o.npc : o.act ? ACTNPC[o.act] : null;
  if (npc && storyTalk(npc)) return { label: 'Talk', fn: () => storyTalk(npc) };
  return _objInteractW(m, x, y, o);
};

/* ---- passive steps, checked on the game tick ---- */
const _killEnemyW = killEnemy;
killEnemy = function (m, e) {
  const was = e.dead; _killEnemyW(m, e);
  if (!was && S && S.story) for (const sid in STORIES) { const st = stepOf(sid); if (st && st.t === 'kill' && st.enemy === e.k) { S.story.q[sid].kills = (S.story.q[sid].kills || 0) + 1; } }
};
function storyTick() {
  if (!S || TITLE || MODAL || DIALOG) return;
  const T = storyState();
  for (const sid in STORIES) {
    const st = stepOf(sid); if (!st) continue; const q = T.q[sid];
    let ok = false;
    if (st.t === 'cond') ok = st.test();
    else if (st.t === 'have') ok = hasAll(st.items);
    else if (st.t === 'boss') ok = (S.bosses[st.boss] || 0) > 0;
    else if (st.t === 'kill') ok = (q.kills || 0) >= st.n;
    else if (st.t === 'go') { const w = storyWhere(st.at); ok = w && cur.id === w.map && dist(S.p.x / 16, S.p.y / 16, w.x, w.y) < (st.r || 3); }
    if (ok) { runStep(sid, st); return; } // one at a time, so dialogues never stack
  }
}
EVT.on('tick', n => { if (n % 3 === 0) storyTick(); });
const _initMapsW = initMaps;
initMaps = function () { _initMapsW(); storyState(); storyPlace(); };

/* the landowner keeps his promise */
const _plotInfoW = plotInfo;
plotInfo = function (k) { const P = _plotInfoW(k); return S && S.story && S.story.flags.ashDiscount && P ? Object.assign({}, P, { price: Math.round(P.price * .9) }) : P; };

/* ---- journal: the Quests tab leads with the stories ---- */
const _renderQuestsW = renderQuests;
renderQuests = function (b) {
  const T = storyState(), list = el('div', { class: 'list' });
  for (const sid in STORIES) {
    const Sd = STORIES[sid], q = T.q[sid];
    if (!q) { list.append(el('div', { class: 'rrow done' }, el('div', { class: 'qck' }, '?'), el('div', { class: 'rtxt' }, el('b', null, Sd.n), el('small', null, 'Not begun yet.')))); continue; }
    if (q.done) { list.append(el('div', { class: 'rrow done' }, el('div', { class: 'qck' }, '✓'), el('div', { class: 'rtxt' }, el('b', null, Sd.n), el('small', null, 'Complete. ' + Sd.blurb)))); continue; }
    const st = stepOf(sid), w = st && stepWhere(sid, st), here = w && cur && w.map === cur.id;
    const where = w ? (here ? ' (marked on your map)' : ' (in ' + (MAPS[w.map].name || w.map) + ')') : '';
    list.append(el('div', { class: 'rrow' + (T.track === sid ? ' hl' : '') }, el('div', { class: 'qck' }, (q.c + 1) + '/' + Sd.ch.length),
      el('div', { class: 'rtxt' }, el('b', null, Sd.n + ': ' + Sd.ch[q.c].n), el('small', null, hintOf(sid, st) + where)),
      el('button', { class: 'btn ghost', on: () => { T.track = T.track === sid ? null : sid; refresh(); } }, T.track === sid ? 'Tracking' : 'Track')));
  }
  b.append(el('h3', null, 'Stories'), list, el('h3', null, 'Milestones'));
  _renderQuestsW(b);
};

/* ---- tracking: a marker over the target and an arrow at your feet ---- */
function trackTarget() { const T = S && S.story; if (!T || !T.track) return null; const st = stepOf(T.track); return st && stepWhere(T.track, st); }
const _pcCursorDrawW = pcCursorDraw;
pcCursorDraw = function (m) {
  _pcCursorDrawW(m);
  const w = trackTarget(); if (!w || w.map !== m.id) return;
  const tx = (w.x + .5) * 16, ty = w.y * 16 - 22 + Math.round(Math.sin(gameT * 4) * 2);
  g.fillStyle = '#2a1c18'; g.fillRect(tx - 3, ty - 6, 7, 9); g.fillStyle = '#ffd040'; g.fillRect(tx - 2, ty - 5, 5, 7); g.fillStyle = '#2a1c18'; g.fillRect(tx, ty - 4, 1, 3); g.fillRect(tx, ty, 1, 1);
  const dx = tx - S.p.x, dy = ty - S.p.y, d = Math.hypot(dx, dy);
  if (d > 90) { const a = Math.atan2(dy, dx), ax = Math.round(S.p.x + Math.cos(a) * 22), ay = Math.round(S.p.y - 10 + Math.sin(a) * 16); g.fillStyle = '#ffd040'; for (let k = 0; k < 4; k++) g.fillRect(Math.round(ax - Math.cos(a) * k * 1.5) - (3 - k) / 2, Math.round(ay - Math.sin(a) * k * 1.5) - (3 - k) / 2, 4 - k, 4 - k); }
};
const _worldMapCanvasW = worldMapCanvas;
worldMapCanvas = function () { const c = _worldMapCanvasW(), w = trackTarget(); if (w && w.map === 'wilds') { const x = c.getContext('2d'); x.font = '18px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#2a1c18'; x.fillText('!', w.x * 3 + 1, w.y * 3 + 7); x.fillStyle = '#ffd040'; x.fillText('!', w.x * 3, w.y * 3 + 6); } return c; };
const _regionMapCanvasW = regionMapCanvas;
regionMapCanvas = function (m) { const c = _regionMapCanvasW(m), w = trackTarget(); if (w && w.map === m.id) { const x = c.getContext('2d'); x.font = '18px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#2a1c18'; x.fillText('!', w.x * 3 + 1, w.y * 3 + 7); x.fillStyle = '#ffd040'; x.fillText('!', w.x * 3, w.y * 3 + 6); } return c; };
