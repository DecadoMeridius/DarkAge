/* Generations that go on (asked 2026-10-31: "each child you play as gets 10% faster XP; can the child remarry and
   have a child of their own, with possible spouses refreshed within your age range?").
   - XP: +10% per generation (x_family.js succeed; no cap: +200% by generation 21).
   - Suitors: grown-up young folk of the valley, made for each generation (S.fam.suitors). Each has a look, a
     personality (heart scenes at 4/7/10, dates, favourite gifts, a trade) and an age that ages with the days.
     They walk the village by day, show in Friends, and use the existing romance flow (greet, Ask out, Propose).
   - Always about 4 within 8 years of your age once you're grown; those who drift out of range (or marry
     elsewhere) move away at the change of season. The original five are courtable while within 15 years of you.
   - When an heir takes over, their brothers and sisters move out (F.siblings), so the heir's own children start
     fresh. The wedding records the spouse's real age at the time. */

const SUITOR_KIND = {
  bookish: { role: 'Scribe', love: ['ancient_seed', 'pearl', 'amethyst'], like: ['honey', 'tea_leaves', 'blueberry'], hate: ['slime_goo', 'bone'],
    scenes: { 4: ['I\'ve been copying the old harvest ledgers. Your family\'s name is in half of them.', 'You must come from very stubborn people. I mean that kindly.'], 7: ['I wrote a poem. It\'s about turnips. No, don\'t laugh. Fine, laugh.', '...It was about you, a little.'], 10: ['I want a life with fewer books in it and more of you. That\'s the whole poem.', 'Don\'t make me say it twice.'] },
    dates: ['You read aloud to each other in the meadow until the light goes.', 'You find a forgotten book in the museum attic together. It\'s terrible. You love it.'] },
  bold: { role: 'Hunter', love: ['fang', 'red_meat', 'ruby'], like: ['hide', 'leather', 'hunters_brew'], hate: ['tulip', 'slime_goo'],
    scenes: { 4: ['Saw you take on a wolf pack by the old road. Not bad. Not good either, but not bad.', 'I\'ll show you how to read tracks sometime.'], 7: ['I\'ve never been afraid of anything in the Wilds. I was afraid you wouldn\'t come back last week.', 'Forget I said that.'], 10: ['Run the Wilds with me. All of it. For the rest of our lives.', 'That\'s as soft as I get. Take it.'] },
    dates: ['You track a stag through the forest at dawn and let it go.', 'You race to the top of the highland ridge. You lose. You\'re told about it for weeks.'] },
  gentle: { role: 'Herbalist', love: ['chanterelle', 'morel', 'rose'], like: ['honey', 'blueberry', 'mint'], hate: ['coal', 'bone'],
    scenes: { 4: ['This one\'s feverfew. Good for headaches. You look like you get a lot of those.', 'Here. For later.'], 7: ['I plant something every time someone is kind to me. My garden is mostly you now.', 'Is that too much? It\'s probably too much.'], 10: ['Let\'s grow old in a garden. Yours, mine, I don\'t mind.', 'Just as long as it\'s ours.'] },
    dates: ['You gather wild herbs along the riverbank and name the ones nobody else knows.', 'You plant a little tree together at the edge of the farm.'] },
  merry: { role: 'Fiddler', love: ['wine_grape', 'cake', 'mead'], like: ['ale', 'pancakes', 'cheese'], hate: ['stone', 'fiber'],
    scenes: { 4: ['I wrote a jig about your farm. It\'s mostly about the chickens.', 'The tavern loves it. The chickens have no opinion.'], 7: ['Dance with me. No one\'s watching. Well, Pip\'s watching. Pip is always watching.', 'There. Was that so terrible?'], 10: ['I\'ve played at a hundred weddings. I\'d like to stop playing at one and be in it.', 'Yours. Ours. You know what I mean.'] },
    dates: ['You dance at the tavern until Pip throws you both out.', 'You sing badly together on the walk home, and the whole village hears.'] },
  crafty: { role: 'Potter', love: ['clay', 'gold_bar', 'emerald'], like: ['stone', 'wood', 'copper_bar'], hate: ['slime_goo', 'tulip'],
    scenes: { 4: ['Clay from the river by your farm is the best in the valley. Did you know that?', 'I didn\'t either, until I walked out there to see you. To see the river. The river.'], 7: ['I made you a cup. It\'s lopsided on purpose. It\'s art.', 'It\'s not on purpose.'], 10: ['I\'ve made a thousand pots and never wanted to keep one. I want to keep you.', 'That came out better in my head.'] },
    dates: ['You throw pots together. Yours collapses. You keep it anyway.', 'You fire a kiln through the night and watch the sparks until dawn.'] },
};
const SUITOR_N = { f: ['Elin', 'Rosa', 'Maren', 'Ivy', 'Talia', 'Wren', 'Clara', 'Nell', 'Sabine', 'Lotte', 'Freya', 'Isla', 'Mira', 'Juno'], m: ['Aric', 'Tobias', 'Jory', 'Bram', 'Felix', 'Corin', 'Leif', 'Owen', 'Silas', 'Rowan', 'Edric', 'Milo', 'Teo', 'Hugo'] };
const candAge = id => { const s = (S.fam && S.fam.suitors || []).find(s => s.id === id); return s ? ageOf(s) : ROMANCE[id] ? ROMANCE[id].age + Math.max(0, dayIndex()) * AGE_RATE : 99; };

function regSuitor(s) {
  const K = SUITOR_KIND[s.kind], L = CROWD_LOOK(s.id), P = Object.assign(L.P, s.P || {});
  NPCS[s.id] = { n: s.name, role: K.role, shop: 'k_suitor', P, love: K.love.filter(k => IT[k]), like: K.like.filter(k => IT[k]), hate: K.hate.filter(k => IT[k]), lines: [['Lovely day in the valley.', 'Mind how you go in the Wilds.'], ['You\'re good company, you know that?'], ['There you are. I was hoping you\'d come by.']], gifts: [] };
  ROMANCE[s.id] = { age: ageOf(s), scenes: K.scenes, dates: K.dates, suitor: 1 };
  if (typeof CROWD !== 'undefined' && !CROWD_BY[s.id]) { const C = { id: s.id, n: s.name, role: K.role, map: 'village', walk: 1, from: 540, to: 1080, lines: [] }; CROWD.push(C); CROWD_BY[s.id] = C; }
}
function unregSuitor(s) {
  delete NPCS[s.id]; delete ROMANCE[s.id];
  if (typeof CROWD !== 'undefined') { const i = CROWD.findIndex(c => c.id === s.id); if (i >= 0) CROWD.splice(i, 1); delete CROWD_BY[s.id]; }
  if (MAPS.village && MAPS.village.npcs) MAPS.village.npcs = MAPS.village.npcs.filter(n => n.id !== s.id);
}
function ensureSuitors(announce) {
  if (!S || !S.fam) return; const F = fam(), me = myAge(); F.suitors = F.suitors || []; if (me < 18) return;
  const taken = id => F.spouse === id || F.rel[id] === 'family' || F.elder === id;
  // those who no longer fit move away (unless you're courting them or married to them)
  const gone = F.suitors.filter(s => !taken(s.id) && F.rel[s.id] !== 'dating' && F.rel[s.id] !== 'engaged' && Math.abs(ageOf(s) - me) > 8);
  for (const s of gone) { unregSuitor(s); F.suitors.splice(F.suitors.indexOf(s), 1); }
  const fits = F.suitors.filter(s => !taken(s.id) && Math.abs(ageOf(s) - me) <= 8).length;
  const kinds = Object.keys(SUITOR_KIND); let made = 0;
  for (let i = fits; i < 4; i++) {
    const n = (F.suitorN = (F.suitorN || 0) + 1), id = 'su_' + n, L = CROWD_LOOK(id), name = pickR(L.fem ? SUITOR_N.f : SUITOR_N.m);
    const s = { id, name, kind: kinds[(n * 3 + F.me.gen) % kinds.length], age0: Math.max(18, Math.round(me + (Math.random() * 12 - 6))), d0: dayIndex(), gen: F.me.gen };
    F.suitors.push(s); regSuitor(s); made++;
  }
  if (made && announce) toast(made === 1 ? 'Someone new has settled in the village.' : made + ' new faces have settled in the village: young folk your age.', 'lvl');
}
// the original candidates only while they're within 15 years of you; suitors within 8
greet = (f => function (b, id) {
  const R = ROMANCE[id];
  if (R && S.fam && !S.fam.rel[id] && S.fam.spouse !== id && Math.abs(candAge(id) - myAge()) > (R.suitor ? 8 : 15)) { const keep = ROMANCE[id]; delete ROMANCE[id]; try { return f.apply(this, arguments); } finally { ROMANCE[id] = keep; } }
  return f.apply(this, arguments);
})(greet);
// a wedding records the spouse's real age; then the next morning's chores
endDay = (f => function (fainted) {
  const before = S.fam && S.fam.spouse; const r = f.apply(this, arguments);
  if (S.fam && S.fam.spouse && S.fam.spouse !== before) S.fam.spouseAge0 = candAge(S.fam.spouse);
  if (S.fam && S.day === 1) ensureSuitors(true);   // a new season: new faces, and those out of range move on
  return r;
})(endDay);
// succession: siblings move out, and the new generation meets people its own age
succeed = (f => function (h) {
  const F = fam(); const r = f.apply(this, arguments);
  // the brothers and sisters you didn't choose go their own ways: grown ones set out for distant lands,
  // younger ones go to live with the surviving parent
  if (F.kids.length) { const PLACES = ['the Saltreach isles', 'the far Highmarch', 'the courts of Kingsholt', 'the cinder roads of the Emberwaste', 'the frozen Frostmere', 'lands past the sea'];
    F.parted = F.kids.map(k => ({ name: k.name, grown: stageOf(k) === 3, to: pickR(PLACES) }));
    F.siblings = (F.siblings || []).concat(F.kids.map(k => ({ name: k.name, look: k.look, gen: F.me.gen, grown: stageOf(k) === 3 }))); F.kids = []; }
  F.expect = null; F.date = null; for (const id in F.rel) if (F.rel[id] === 'dating' || F.rel[id] === 'engaged') delete F.rel[id];
  setTimeout(() => ensureSuitors(true), 1200);
  return r;
})(succeed);
// on load: put this generation's suitors back
startGame = (f => function (isNew) { const r = f.apply(this, arguments); if (S && S.fam) { for (const s of S.fam.suitors || []) regSuitor(s); ensureSuitors(false); } return r; })(startGame);
// the Family tab lists siblings who moved out
renderFamily = (f => function (b) { f(b); const Sb = S.fam && S.fam.siblings; if (Sb && Sb.length) b.append(el('h3', null, 'Brothers and sisters'), el('p', { class: 'note' }, Sb.map(s => s.name + (s.grown ? ' (travelling in distant lands)' : ' (with family in the village)')).join(', ') + '.')); })(renderFamily);
// the generation bonus counts for combat XP too (life skills already get it through addXP in x_family.js):
// generation 2 earns +10% on everything, generation 3 +20%, and so on
cxp = (f => function (k, n) { const b = S && S.fam ? S.fam.bonus || 0 : 0; return f(k, n > 0 ? n * (1 + b) : n); })(cxp);

// talking to a suitor: the greeting (gifts, hearts, Ask out, Propose) and a chat that counts once a day
const SUITOR_CHAT = {
  bookish: ['The library cart came through from Kingsbridge. I bought three books and no bread.', 'Did you know the valley used to be a lake? I read it twice to be sure.'],
  bold: ['Bandits on the north road again. I counted five. They counted me too.', 'The wolves are thin this season. Something is pushing them south.'],
  gentle: ['The yarrow is out by the river. Come and see before the goats find it.', 'You look tired. Sit a moment. The day will wait.'],
  merry: ["New tune tonight at the Drake. You'll hate it. Come anyway.", "Pip says I'm banned from the tables. Again. Only on Tuesdays."],
  crafty: ['I fired a whole kiln and only half of it cracked. A good day!', 'Your hands are rough. Good. Means you make things.'],
};
doorAction = (f => function (act, who) {
  if (act !== 'k_suitor') return f(act, who);
  const s = (S.fam && S.fam.suitors || []).find(s => s.id === who); if (!s) return;
  openModal(NPCS[who].n, [{ id: 't', label: 'Talk', render: b => {
    greet(b, who);
    b.append(el('p', { class: 'note' }, NPCS[who].role + ', ' + Math.floor(ageOf(s)) + '. "' + pickR(SUITOR_CHAT[s.kind]) + '"'));
    const F = fam(); F.chat = F.chat || {};
    b.append(el('div', { class: 'acts' }, el('button', { class: 'btn ghost' + (F.chat[who] === dayIndex() ? ' off' : ''), on: () => { if (F.chat[who] === dayIndex()) { toast("You've already had a good talk today."); return; } F.chat[who] = dayIndex(); addFriend(who, 20); toast('A good talk with ' + NPCS[who].n + ' (+20 friendship).'); drawModal(); } }, 'Chat')));
  } }]);
})(doorAction);

/* Succession ceremony (asked 2026-10-31: "the child gets coronated when the player dies, and gets the deeds to
   the titles of the guilds etc"). After the heir wakes, the inheritance is read out: the farm, owned land, Briarholt,
   every guild rank and title. With Briarholt the heir is invested by its steward; with the royal bloodline
   (the council choice in The Empty Throne) they are crowned. The heir chooses how they're styled (Lord or Lady,
   King or Queen) and wears that title; every title the family earned passes down (S.titles). */
succeed = (f => function (h) {
  const was = meName(); const r = f.apply(this, arguments);
  S.fam.invest = { from: was, gen: S.fam.me.gen }; return r;
})(succeed);
function investiture() {
  const I = S.fam.invest; if (!I) return; S.fam.invest = null;
  const F = S.story && S.story.flags || {}, castle = !!F.castleOwned, royal = castle && F.bloodline === 1, name = meName();
  const land = Object.keys(S.land || {}).filter(k => S.land[k]).map(k => (typeof PLOTS !== 'undefined' && PLOTS[k] ? PLOTS[k].n || k : k));
  const guilds = Object.entries(S.guilds || {}).map(([act, g]) => GUILDS[act] ? GUILDS[act].name + ' (' + GUILDS[act].ranks[g.r].title + ')' : null).filter(Boolean);
  const deeds = ['Hollowmere Farm'].concat(land.map(l => 'the ' + l + ' plot')).concat(castle ? ['Briarholt Castle and its lands'] : []);
  const lines = [['narr', 'The bells ring for ' + I.from + '. Three days later, the family gathers to read the will.'],
    ...((S.fam.parted || []).length ? [['narr', S.fam.parted.map(p => p.grown ? p.name + ' packs a bag and sets out for ' + p.to + '.' : p.name + ' goes to live with ' + (S.fam.elder && NPCS[S.fam.elder] ? NPCS[S.fam.elder].n : 'family') + ' in the village.').join(' ')]] : []),
    ['narr', 'To ' + name + ' pass the deeds to ' + deeds.join(', ') + '.' + (guilds.length ? ' The guild halls send their seals: ' + guilds.join(', ') + ', held in the family\'s name.' : '')]];
  const crown = (style) => {
    const t = style + ' of Briarholt'; S.titles = S.titles || []; if (!S.titles.includes(t)) S.titles.push(t); S.title = t; S.fam.style = style;
    storyDialog(royal ? [['narr', 'In the throne room, beneath Margit\'s banner, Isolde lifts the circlet herself.'], ['isolde', 'By the blood of Margit, and by the will of Kingsbridge: long live ' + name + ', ' + t + '.'], ['narr', 'The court kneels. Outside, the knights strike their shields.']]
      : [['bh_steward', 'Briarholt has a ' + style.toLowerCase() + ' again. The household is yours to command, ' + name + '.'], ['narr', 'Aldous presents the keys of the keep on a velvet cushion, and the banners are hung anew.']], { title: royal ? 'The Coronation' : 'The Investiture' });
  };
  S.fam.parted = null;
  if (castle) storyDialog(lines.concat([[royal ? 'isolde' : 'bh_steward', royal ? 'The crown passes with the castle. How shall the heralds proclaim you?' : 'Briarholt passes to you. How shall the household style you?']]),
    { title: 'The Will', choices: royal ? [['King', () => crown('King')], ['Queen', () => crown('Queen')]] : [['Lord', () => crown('Lord')], ['Lady', () => crown('Lady')]] });
  else storyDialog(lines.concat([['narr', 'Every title the family has earned is yours to wear now.']]), { title: 'The Will' });
}
EVT.on('tick', () => { if (S && S.fam && S.fam.invest && !MODAL && !DIALOG && !TITLE) investiture(); });
