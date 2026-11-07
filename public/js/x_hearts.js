/* Heart scenes for the village (asked 2026-11-07: friendship went up but nothing happened along the way). Each main
   villager has a short scene at 2, 5 and 8 hearts, played the next time they greet you (the shop greeting, the street
   window, festivals): a small gift at 2, a choice at 5 (each answer is friendship, one a little more), a keepsake at 8.
   They sit between the romance scenes (4, 7, 10 in x_family.js), and wait a greeting if a romance scene plays first.
   Seen scenes are S.fam.seen['h<id><lv>']. */
const HEART_SCENES = {
  mara: {
    2: { lines: [['mara', 'Oh, it\'s you. I was counting seed packets. Again.'], ['mara', 'My mother kept this shop forty years. Some days I still hear her correcting my sums.'], ['mara', 'Here, the packets that didn\'t sell. Don\'t tell anyone I\'m soft.']], give: [['turnip_seed', 10], ['potato_seed', 5]] },
    5: { lines: [['narr', 'After closing, Mara sits on the shop step with a ledger on her knees.'], ['mara', 'Lord Ashcombe raised the rent again. I\'ll manage. I always manage.'], ['mara', 'Do you ever wonder if the valley needs a shop, or just somebody who stays?']],
      choices: [['The valley needs you', [['mara', '...Thank you. I needed someone to say it out loud.']], 70], ['Sell to the towns as well', [['mara', 'Kingsbridge? You sound like my mother. She\'d have liked you.']], 50]] },
    8: { lines: [['mara', 'I found Mother\'s recipe book behind the flour sacks. Her honey cake.'], ['mara', 'The first ones are yours. You\'ve become... family, I suppose. Don\'t make me say it twice.']], give: [['honey_cake', 3]], learn: ['honey_cake'] } },
  brann: {
    2: { lines: [['narr', 'Brann is hammering a horseshoe that doesn\'t need any more hammering.'], ['brann', 'When something won\'t come right, you hit it till it does. Works on iron. Not on much else.'], ['brann', 'Take these. Spare bars. Every farmer needs something to mend with.']], give: [['copper_bar', 4]] },
    5: { lines: [['brann', 'My father\'s anvil cracked the year the Warden came down. I kept the pieces.'], ['brann', 'Fool thing to keep. Can\'t forge on it.']],
      choices: [['Keep it. It was his', [['brann', '...Aye. Aye, it was.']], 70], ['Forge it into something new', [['brann', 'Hm. Maybe the old man would\'ve liked that better. Stubborn as iron, him.']], 50]] },
    8: { lines: [['brann', 'Made you something. Don\'t make a thing of it.'], ['narr', 'Three bars of good steel, each stamped with your initials.']], give: [['steel_bar', 3]] } },
  pip: {
    2: { lines: [['pip', 'First drinks are on the house for anyone who lasts a month here. You lasted. Barely.']], give: [['ale', 2]] },
    5: { lines: [['narr', 'Late, the tavern empty. Pip stacks chairs and hums off-key.'], ['pip', 'My brother ran off to sea when I was twelve. Left me the bar and a debt.'], ['pip', 'Some nights I think he\'ll walk in and order a pale ale like nothing happened.']],
      choices: [['Have you looked for him?', [['pip', 'Saltmere\'s harbourmaster says a man with his name sailed for the isles. Nine years ago.']], 60], ['You did fine on your own', [['pip', 'I did, didn\'t I? Don\'t tell him that if he ever comes back.']], 60]] },
    8: { lines: [['pip', 'I\'ve put a dish on the board and named it after you. Don\'t argue, it\'s already chalked.'], ['pip', 'And you get the first three. Eat them hot.']], give: [['fish_stew', 3]] } },
  odile: {
    2: { lines: [['odile', 'You held the reins wrong last week. Thumbs up, like this. There.'], ['odile', 'Take some oats for your animals. Happy animals, happy farmer.']], give: [['hay', 20]] },
    5: { lines: [['narr', 'A foal is coming in Odile\'s stable, and she waves you in to hold the lamp.'], ['odile', 'Steady... steady... there. Look at her legs, already trying.']],
      choices: [['Name her Dawn', [['odile', 'Dawn. Yes. She\'ll be fast, that one.']], 60], ['You name her', [['odile', 'Then she\'s Lamp, after the one who held it. Ha!']], 60]] },
    8: { lines: [['odile', 'My father bred the finest line in the lowlands. That grey mare is the last of it.'], ['odile', 'Her golden oats go to whoever she trusts. She trusts you. So do I.']], give: [['golden_oats', 5], ['apple', 10]] } },
  hale: {
    2: { lines: [['hale', 'You drive nails like a sculptor. Slowly, and with feeling.'], ['hale', 'Here, offcuts. Too good to burn.']], give: [['hardwood', 6]] },
    5: { lines: [['narr', 'Hale is sketching on the back of a plank: a bridge across the river.'], ['hale', 'The old bridge washed out the year I was born. Everyone says it can\'t be done again.']],
      choices: [['It can, with you', [['hale', 'Hah. Then I\'ll need a lot of hardwood and a friend with a strong back.']], 70], ['Maybe a ferry?', [['hale', 'Corwin would charge us a copper a trip for the rest of our lives.']], 50]] },
    8: { lines: [['hale', 'I\'ve drawn you a rocking chair. For your porch, when you\'re old and grey.'], ['hale', 'Take the lumber off my hands as well. My yard\'s full.']], give: [['hardwood', 15], ['wood', 40]] } },
  elias: {
    2: { lines: [['elias', 'You have a careful eye. Most people walk past a broken pot. You picked it up.'], ['elias', 'Take this. The ruins on it are real, I promise you.']], give: [['treasure_map', 1]] },
    5: { lines: [['narr', 'Elias has fallen asleep at his desk under a heap of rubbings from the ruins.'], ['elias', 'Mm? Forgive me. I was dreaming of the old kingdom again.'], ['elias', 'Do you think history wants to be found, or left to rest?']],
      choices: [['Found', [['elias', 'So do I. Otherwise what is a museum but a graveyard with labels?']], 60], ['Left to rest, sometimes', [['elias', '...Wise. I have dug up things I wished I hadn\'t.']], 60]] },
    8: { lines: [['elias', 'I catalogued your donations. You\'ve given more than the whole valley in thirty years.'], ['elias', 'Two more maps from the archive. Bring me what you find, if it\'s old.']], give: [['treasure_map', 2]] } },
  corwin: {
    2: { lines: [['corwin', 'You cast too hard. The river isn\'t your enemy, friend. It\'s your landlord.'], ['corwin', 'Here, smoked this morning. Fisher\'s breakfast.']], give: [['smoked_salmon', 2]] },
    5: { lines: [['narr', 'Fog on the coast. Corwin stands at the end of his dock, not fishing.'], ['corwin', 'My wife used to stand here waiting for me to come in. Now I stand here, and nobody\'s out there.']],
      choices: [['I\'ll wait with you', [['corwin', '...Aye. A while, then.']], 70], ['Tell me about her', [['corwin', 'She could gut a mackerel faster than I could catch one. Best woman on the coast.']], 60]] },
    8: { lines: [['corwin', 'My grandfather swore he caught the Tidemother once. All he had to show for it was this pearl.'], ['corwin', 'It\'s yours. You\'ve the patience he never had.']], give: [['pearl', 1], ['smoked_salmon', 3]] } },
};
function heartScene(id) {
  const H = HEART_SCENES[id]; if (!H || typeof hearts !== 'function' || !S.fam) return false;
  const F = S.fam, h = hearts(id); F.seen = F.seen || {};
  const lv = [2, 5, 8].find(l => h >= l && !F.seen['h' + id + l]); if (!lv) return false;
  F.seen['h' + id + lv] = 1; const sc = H[lv], title = NPCS[id].n + ' · ' + lv + ' hearts';
  const reward = () => {
    const got = (sc.give || []).filter(([k]) => IT[k]); for (const [k, q] of got) give(k, q, 0, true);
    for (const k of sc.learn || []) { S.known = S.known || {}; S.known[k] = 1; }
    if (got.length) toast(NPCS[id].n + ' gives you ' + got.map(([k, q]) => (q > 1 ? q + ' ' : '') + IT[k].n).join(' and ') + '.', 'lvl');
  };
  if (sc.choices) storyDialog(sc.lines, { title, choices: sc.choices.map(([label, after, pts]) => [label, () => { addFriend(id, pts); storyDialog(after, { title, done: reward }); }]) });
  else storyDialog(sc.lines, { title, done: reward });
  return true;
}
greet = (f => function (b, id) {
  const r = f.apply(this, arguments);
  // after any romance scene the greeting started (that one opens at 50 ms): a heart scene waits for the next greeting
  setTimeout(() => { try { if (!DIALOG && S) heartScene(id); } catch (e) { console.error(e); } }, 90);
  return r;
})(greet);
