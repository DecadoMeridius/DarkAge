/* ================= Phase 13: relationships and generations =================
   ROMANCE  Pip, Odile, Hale, Brann and Mara can be courted. Heart scenes play at 4, 7
            and 10 hearts. At 8 hearts, ask them out with a bouquet (300g, from their
            shop window); while dating, spend time together once a day. At 10 hearts,
            propose with an Ember Pendant (anvil: 3 gold bars, a ruby, a diamond); you
            need a cottage. The wedding is three days later.
   SPOUSE   Lives on the farm mornings and evenings, works their shop in between, and
            does one chore each morning (waters crops, pets animals, weeds, or cooks).
   CHILDREN After a week of marriage you can talk about children; a baby arrives two
            weeks later (up to three). Baby, child (brings forage), teen (learns the skill
            you teach), adult (does chores, can inherit).
   AGING    One in-game year is five years of life (AGE_RATE). Past 45 health and energy
            slowly fall; past 30 you learn a little faster.
   DEATH    Only with an heir (a spouse or a child): old age from 75, or a 10% chance
            that being knocked out in the wild is fatal. Without an heir you can't die.
            You go on as your spouse or an adult child, keeping the farm, money and
            buildings; the heir brings their own skills and the family bonus (+5% XP per
            generation). The Family tab (F) shows the family, the tree and the crest. */

const AGE_RATE = 5 / 112; // years of life per in-game day
const ROMANCE = {
  pip: { age: 27, scenes: { 4: ['I keep a list of everyone\'s favourite drink. You\'re the only one who keeps changing yours.', 'That\'s a compliment, by the way. Mostly.'], 7: ['Closing up late again. Walk me home? The lane\'s dark and I\'m... not scared. Just tired.', 'Thanks. You\'re easy to talk to. Easier than the regulars.'], 10: ['I saved the first lantern from last Lantern Night. Here. Light it at your place sometime.', 'I think about you more than about the tavern lately. That\'s new.'] },
    dates: ['You share a pie on the tavern\'s back step and watch the stars come out.', 'Pip teaches you a card game and cheats shamelessly. You win anyway.'] },
  odile: { age: 31, scenes: { 4: ['That grey mare wouldn\'t let anyone near her. She lets you. Horses know things.', 'Come by at dawn sometime. That\'s when they\'re most honest.'], 7: ['My father bred racehorses. He never once asked how I was. Just how fast.', 'You ask. I noticed that.'], 10: ['I named the new foal after you. Don\'t laugh.', 'Ride out with me tomorrow? Just us. No races.'] },
    dates: ['You ride out along the river at sunset, the horses nose to nose.', 'Odile shows you a foal taking its first steps. She cries a little and pretends she didn\'t.'] },
  hale: { age: 34, scenes: { 4: ['Every beam on your farm, I can tell you which tree it came from. That one\'s a soft spot.', 'Your grandmother paid me in pie for my first job. Best pay I ever got.'], 7: ['I carved this for you. It\'s a little fox. It\'s not very good.', 'It is, actually. I just didn\'t want to say so.'], 10: ['I measured your doorframe the other day. Professional habit. Also, I wondered what it\'d be like to come home through it.', '...That came out more honest than I planned.'] },
    dates: ['Hale shows you how to plane a board. Your shavings curl better than his. He\'s delighted.', 'You build a birdhouse together. It\'s lopsided. You hang it anyway.'] },
  brann: { age: 38, scenes: { 4: ['You hold a hammer like you mean it. Most people hold it like an apology.', 'Come by the forge when it\'s quiet. I\'ll show you how to fold steel.'], 7: ['My grandfather waited his whole life for someone to bring back Aldren\'s heart. You did it in a season.', 'Makes a man wonder what else you\'ll do.'], 10: ['I made this ring years ago. Never knew who it was for. I think I do now.', 'Don\'t answer. Just keep it.'] },
    dates: ['You work the bellows while Brann forges. Sparks fly. So do jokes, badly.', 'Brann takes you to the hill above the mine, where the whole valley glows at dusk.'] },
  mara: { age: 33, scenes: { 4: ['I set aside the best seeds for you. Don\'t tell the others.', 'Your grandmother did the same for me, when I first opened.'], 7: ['Sometimes I close the shop early and just walk the fields. Yours are the prettiest.', 'Is that strange to say? It feels strange to say.'], 10: ['I want a garden that\'s ours, not a shop that\'s mine.', 'There. I\'ve said it. Now you say something.'] },
    dates: ['You picnic in the meadow. Mara names every flower. You remember none of them.', 'You help Mara take inventory. It takes twice as long and nobody minds.'] },
};
I('ember_pendant', 'Ember Pendant', 'special', 0, 'ring', '#ff8a3a', '#ffd040', { desc: 'Give it to someone you love at 10 hearts.' });
RC.push(['ember_pendant', 1, { gold_bar: 3, ruby: 1, diamond: 1 }, 'anvil', ['smithing', 4]]);
MENU_KEYS.f = 'family'; TAB_KEY.family = 'F';

/* ---- state ---- */
function fam() {
  if (!S.fam) S.fam = { me: { name: (S.look && S.look.name) || 'You', age0: 25, d0: dayIndex(), gen: 1 }, rel: {}, spouse: null, kids: [], tree: [], seen: {}, bonus: 0, crest: null };
  const F = S.fam; if (!F.crest) { const r = rng(S.seed * 7 + 3); F.crest = { c1: pickR(['#7a1a2a', '#1a3a6a', '#1a5a3a', '#5a3a1a', '#3a2a5a']), c2: pickR(['#e8c050', '#e8e0d0', '#c8c8d0']), sym: ['stag', 'oak', 'flame', 'wheat', 'anvil'][Math.floor(r() * 5)] }; }
  return F;
}
const ageOf = p => p.age0 + (dayIndex() - p.d0) * AGE_RATE;
const meName = () => (S.look && S.look.name) || fam().me.name; // the creator may name you after the family record exists
const myAge = () => ageOf(fam().me);
const stageOf = k => { const a = ageOf(k); return a < 4 ? 0 : a < 13 ? 1 : a < 18 ? 2 : 3; };
const STAGE_N = ['Baby', 'Child', 'Teen', 'Adult'];
const spouseOf = () => fam().spouse;
const hasHome = () => (S.structures || []).some(s => s.k === 'cottage' && s.stage >= 4) || (MAPS.farm && MAPS.farm.bld.some(b => b.kind === 'house'));
const heirs = () => { const F = fam(), out = []; if (F.spouse) out.push({ kind: 'spouse', id: F.spouse }); F.kids.forEach((k, i) => { if (stageOf(k) === 3) out.push({ kind: 'kid', i }); }); return out; };
const canDie = () => !!fam().spouse || fam().kids.length > 0;
function lookToP(L) { return HP(0, { skin: L.skin, hair: L.hair, hs: L.hs, eye: L.eye, shirt: L.shirt, pants: L.pants, shoe: L.shoe }); }
function npcLook(id) { const P = NPCS[id].P; return { name: NPCS[id].n, skin: P.skin, hair: P.hair, hs: P.hs || 'short', eye: P.eye || '#2b1d18', shirt: P.shirt, pants: P.pants, shoe: P.shoe || '#3a2a1a', acc: '#c8642a' }; }
function say(id, lines, done) { storyDialog(lines.map(t => [id, t]), { title: NPCS[id] ? NPCS[id].n : 'Family', done }); }

/* ---- romance through the shop greeting ---- */
const _greetF = greet;
greet = function (b, id) {
  _greetF(b, id);
  const R = ROMANCE[id]; if (!R) return; const F = fam(), h = hearts(id), st = F.rel[id], row = el('div', { class: 'acts wrap' });
  for (const lv of [4, 7, 10]) if (h >= lv && !F.seen[id + lv]) { F.seen[id + lv] = 1; setTimeout(() => say(id, R.scenes[lv]), 50); break; }
  const busy = F.spouse && F.spouse !== id;
  if (!st && h >= 8 && !busy) row.append(el('button', { class: 'btn', on: () => { if (S.gold < 300) { toast('A good bouquet costs 300g.'); return; } S.gold -= 300; F.rel[id] = 'dating'; addFriend(id, 60); SFX.lvl(); closeModal(); say(id, ['Flowers? For me?', 'Yes. Yes, I\'d like that. I\'d like that a lot.'], () => toast('You are now dating ' + NPCS[id].n + '.', 'lvl')); } }, 'Ask ' + NPCS[id].n + ' out (bouquet, 300g)'));
  if (st === 'dating' || st === 'married') row.append(el('button', { class: 'btn ghost' + (F.date === dayIndex() ? ' off' : ''), on: () => { if (F.date === dayIndex()) { toast('You\'ve spent time together today.'); return; } F.date = dayIndex(); addFriend(id, 40); S.buffs.push({ id: 'love', t: 600, spd: .1 }); closeModal(); storyDialog([['narr', pickR(R.dates)]], { title: 'Together', done: () => toast('You feel light on your feet.', 'lvl') }); } }, 'Spend time together'));
  if (st === 'dating' && h >= 10) row.append(el('button', { class: 'btn' + (has('ember_pendant') ? '' : ' off'), on: () => propose(id) }, has('ember_pendant') ? 'Propose' : 'Propose (needs an Ember Pendant)'));
  if (st === 'married') row.append(el('button', { class: 'btn ghost', on: () => { closeModal(); talkFuture(id); } }, 'Talk about the future'));
  if (row.childNodes.length) b.append(row);
};
function propose(id) {
  const F = fam();
  if (!has('ember_pendant')) { toast('You need an Ember Pendant (anvil: 3 gold bars, a ruby, a diamond).'); return; }
  if (!hasHome()) { closeModal(); say(id, ['Oh... I want to. I really do.', 'But a tent is no place for two. Build the cottage first, and ask me again.']); return; }
  take('ember_pendant', 1); F.rel[id] = 'engaged'; F.wed = dayIndex() + 3; closeModal(); SFX.lvl();
  say(id, ['Is that... it\'s warm. It\'s glowing.', 'Yes. Of course yes. Three days. Give me three days to tell everyone.'], () => toast('The wedding is in three days.', 'lvl'));
}
function talkFuture(id) {
  const F = fam(), wedFor = dayIndex() - (F.wedDay || 0);
  if (F.expect) { say(id, ['Soon. The cradle\'s ready. Hale made it, of course.']); return; }
  if (F.kids.length >= 3) { say(id, ['Three is plenty. Look at them. We did well.']); return; }
  if (wedFor < 7) { say(id, ['We\'ve barely unpacked. Let\'s enjoy this for a little while first.']); return; }
  storyDialog([[id, 'I\'ve been thinking... about a family. Our family. Children, running around the fields.']], { title: 'The future', choices: [
    ['Let\'s have a child', () => { F.expect = dayIndex() + 14; say(id, ['Really? Then... let\'s.', 'Two weeks, the midwife says. Two weeks!'], () => toast('A baby is on the way.', 'lvl')); }],
    ['Not yet', () => say(id, ['That\'s all right. There\'s time.'])]] });
}

/* ---- the morning: wedding, births, chores, growing up, aging ---- */
const _endDayF = endDay;
endDay = function (f) {
  _endDayF(f); if (!S || !S.fam) return; const F = fam(), notes = [];
  for (const id in F.rel) if (F.rel[id] === 'engaged' && dayIndex() >= F.wed) { F.rel[id] = 'married'; F.spouse = id; F.wedDay = dayIndex(); F.spouseAge0 = ROMANCE[id].age; F.spouseD0 = dayIndex(); F.wedQueued = id; }
  if (F.expect && dayIndex() >= F.expect) { F.expect = null; F.birthQueued = 1; }
  if (F.spouse && F.spouse !== F.wedQueued) notes.push(spouseChore());
  F.kids.forEach(k => { const s = stageOf(k);
    if (s === 1 && Math.random() < .35) { const it = pickR(FORAGE.meadow[S.season]); give(it, 1, 0, true); notes.push(k.name + ' found ' + IT[it].n.toLowerCase() + ' and left it by the door.'); }
    if (s === 2 && k.skill) { const mine = (S.sk[k.skill] || {}).tx || 0; k.xp = k.xp || {}; k.xp[k.skill] = Math.min(mine, (k.xp[k.skill] || 0) + Math.max(20, mine * .02)); }
    if (s === 3 && Math.random() < .5) notes.push(k.name + ': ' + spouseChore(true)); });
  F.notes = notes.filter(Boolean);
  if (S.day === 1 && myAge() >= 75 && Math.random() < (myAge() - 74) * .08) { if (canDie() && heirs().length) F.deathQueued = 'old'; else if (!F.warnedOld) { F.warnedOld = 1; F.notes.push('You feel your years this morning. With no one to carry on, you can\'t rest yet.'); } }
};
function spouseChore(kid) {
  const m = MAPS.farm, who_ = kid ? '' : NPCS[fam().spouse].n + ' ', r = Math.random();
  if (r < .35) { let n = 0; for (const k in m.soil) { const s = m.soil[k]; if (s && s.crop && !s.wet && n < 30) { s.wet = true; n++; } } if (n) return who_ + (kid ? 'watered ' : 'watered ') + n + ' crops.'; }
  if (r < .6 && S.animals.length) { for (const a of S.animals) { a.aff = Math.min(100, (a.aff || 0) + 4); a.pet = dayIndex(); } return who_ + 'saw to the animals.'; }
  if (r < .8) { let n = 0; for (let i = 0; i < m.o.length && n < 15; i++) { const o = m.o[i]; if (o && (o.k === 'weed' || o.k === 'twig' || o.k === 'stone')) { m.o[i] = null; n++; } } if (n) return who_ + 'cleared ' + n + ' weeds and stones.'; }
  const dish = pickR(['omelette', 'pancakes', 'veggie_stew', 'berry_tart', 'fish_stew']); give(dish, 1, 0, true); return who_ + 'made you ' + IT[dish].n.toLowerCase() + '.';
}
EVT.on('tick', n => {
  if (!S || TITLE || MODAL || (typeof DIALOG !== 'undefined' && DIALOG) || !S.fam || n % 2) return; const F = S.fam;
  if (F.deathQueued) { const why = F.deathQueued; F.deathQueued = null; return die(why); }
  if (F.wedQueued) { const id = F.wedQueued; F.wedQueued = null; storyDialog([['narr', 'The whole village gathers in the plaza. Lanterns, flowers, and Pip crying into a tankard.'], [id, 'I don\'t have a speech. I just have you. That\'s enough.'], ['narr', 'You are married. ' + NPCS[id].n + ' moves into the farmhouse today.']], { title: 'The wedding', done: () => { SFX.lvl(); placeFamily(); } }); return; }
  if (F.birthQueued) { F.birthQueued = null; return nameBaby(); }
  if (F.notes && F.notes.length) { for (const t of F.notes) toast(t); F.notes = []; }
});
function nameBaby() {
  const F = fam(), sp = F.spouse ? npcLook(F.spouse) : null, me = Object.assign({}, DEFAULT_LOOK, S.look);
  const pick = (a, b) => (b && Math.random() < .5 ? b : a);
  const look = { skin: pick(me.skin, sp && sp.skin), hair: pick(me.hair, sp && sp.hair), hs: pickR(LOOK_OPTS.hs.filter(h => h !== 'bald')), eye: pick(me.eye, sp && sp.eye), shirt: pickR(LOOK_OPTS.shirt), pants: pickR(LOOK_OPTS.pants), shoe: pickR(LOOK_OPTS.shoe), acc: pickR(LOOK_OPTS.acc) };
  const suggestions = ['Alder', 'Briar', 'Linden', 'Sorrel', 'Rowan', 'Ember', 'Wren', 'Hazel', 'Tamsin', 'Corin', 'Juniper', 'Marlow'];
  openModal('A new arrival', [{ id: 'n', label: 'Name', render: b => {
    b.append(el('p', { class: 'note' }, 'Your baby has arrived, healthy and loud. What will you call them?'));
    const inp = el('input', { type: 'text', value: pickR(suggestions), maxlength: 16 }); inp.style.cssText = 'font:inherit;padding:6px 10px;width:220px';
    b.append(el('div', { class: 'acts' }, inp, el('button', { class: 'btn', on: () => { const name = (inp.value || '').trim().slice(0, 16) || pickR(suggestions); look.name = name; F.kids.push({ name, age0: 0, d0: dayIndex(), look, skill: null, xp: {} }); closeModal(); toast('Welcome to the family, ' + name + '.', 'lvl'); SFX.lvl(); placeFamily(); } }, 'Name them')));
  } }]);
}

/* ---- the family on the farm: the spouse at home mornings and evenings, the kids by day ---- */
const atHome = () => S.time < 540 || S.time >= 1080;
function famId(k, i) { return 'kid' + i + 's' + stageOf(k); }
function ensureKidNpc(k, i) {
  const id = famId(k, i); if (Object.getOwnPropertyDescriptor(NPCS, id)) return id;
  Object.defineProperty(NPCS, id, { value: { n: k.name, role: STAGE_N[stageOf(k)], P: lookToP(k.look), lines: [[]], love: [], like: [], hate: [], gifts: [] }, enumerable: false, configurable: true }); // hidden from the Friends list
  return id;
}
function placeFamily() {
  const m = MAPS.farm; if (!m || !S.fam) return; const F = S.fam, h = m.bHouse, hx = h ? h.door.x : 10, hy = h ? h.door.y + 2 : 10;
  m.npcs = (m.npcs || []).filter(n => !n.fam);
  const add = (id, dx) => m.npcs.push({ id, fam: 1, x: (hx + dx + .5) * 16, y: (hy + 1) * 16, hx: (hx + dx + .5) * 16, hy: (hy + 1) * 16 });
  if (F.spouse && atHome()) add(F.spouse, 2);
  F.kids.forEach((k, i) => { if (stageOf(k) > 0 && S.time >= 420 && S.time < 1260) add(ensureKidNpc(k, i), -2 - i * 2); });
}
EVT.on('tick', n => { if (S && S.fam && n % 20 === 0) placeFamily(); });
const _schedPlaceF = typeof schedPlace === 'function' ? schedPlace : null;
if (_schedPlaceF) schedPlace = function (id) { return S && S.fam && S.fam.spouse === id && atHome() ? 'home' : _schedPlaceF(id); };
const _humanSprF = humanSpr;
humanSpr = function (key, P, dir, f) { // children are drawn smaller than grown-ups
  const c = _humanSprF(key, P, dir, f), m = /^npckid\d+s([12])$/.exec(key); if (!m || !c) return c;
  const k = m[1] === '1' ? .7 : .85, out = mk(c.width, c.height, x => { x.imageSmoothingEnabled = false; const w = Math.round(c.width * k), hh = Math.round(c.height * k); x.drawImage(c, Math.round((c.width - w) / 2), c.height - hh, w, hh); });
  out.ww = c.ww; out.wh = c.wh; return out;
};
const _talkNPCF = talkNPC;
talkNPC = function (id) {
  const F = S.fam, km = /^kid(\d+)s\d$/.exec(id);
  if (km) return talkKid(+km[1]);
  if (F && F.spouse === id && cur && cur.id === 'farm') return openModal(NPCS[id].n, [{ id: 'h', label: 'Home', render: b => { greet(b, id); b.append(el('p', { class: 'note' }, pickR(['Morning. The kettle\'s on.', 'Long day? Sit. Tell me everything.', 'The children were good today. Mostly.', 'I love this place. I love that it\'s ours.']))); } }]);
  return _talkNPCF(id);
};
function talkKid(i) {
  const k = fam().kids[i], s = stageOf(k);
  const lines = [['Can I come to the mines? Please? I\'ll be quiet.', 'I found a frog. I named it after you.', 'Tell me about the knight again!'], ['I\'m practising. Don\'t watch.', 'When I\'m grown I\'m going to the Highmarch.', 'Can I have my own field?'], ['I could run this place, you know. One day.', 'I sorted the tools. Don\'t touch them.']][Math.min(2, s - 1)];
  openModal(k.name, [{ id: 'k', label: k.name, render: b => {
    b.append(el('p', { class: 'note' }, k.name + ', ' + Math.floor(ageOf(k)) + ' (' + STAGE_N[s].toLowerCase() + '): "' + pickR(lines) + '"'));
    if (s === 2) { b.append(el('h3', null, 'Teach a skill'), el('p', { class: 'note' }, 'Teens learn a little every day from whichever of your skills you teach them. Their skills are theirs if they ever take over the farm.'));
      const row = el('div', { class: 'acts wrap' }); for (const sk of SK.filter(x => S.sk[x])) row.append(el('button', { class: 'btn' + (k.skill === sk ? '' : ' ghost'), on: () => { k.skill = sk; refresh(); } }, SKN[sk] + (k.xp && k.xp[sk] ? ' ' + lvlFor(k.xp[sk]) : ''))); b.append(row); }
  } }]);
}

/* ---- aging changes the body ---- */
const _recalcF = recalc;
recalc = function () {
  _recalcF(); if (!S || !S.fam || !PS) return; const a = myAge();
  if (a > 45) { const k = Math.max(.55, 1 - (a - 45) * .009); PS.maxhp = Math.round(PS.maxhp * k); PS.maxst = Math.round(PS.maxst * k); }
};
const _addXPF = addXP;
addXP = function (k, n) { const F = S && S.fam; const m = F ? 1 + F.bonus + Math.min(.15, Math.max(0, (myAge() - 30) * .005)) : 1; _addXPF(k, n > 0 ? n * m : n); };

/* ---- death and the next generation ---- */
const _faintF = faint;
faint = function (msg) {
  const safe = cur && (cur.id === 'farm' || cur.id === 'village' || cur.id.startsWith('in_'));
  if (S && S.fam && canDie() && heirs().length && !safe && Math.random() < .1) return die('danger');
  return _faintF(msg);
};
function die(why) {
  const F = fam(), age = Math.floor(myAge()), H = heirs(); if (!H.length) return;
  S.p.hp = Math.max(1, S.p.hp); PAUSED = true;
  const name = meName();
  F.tree.push({ name, gen: F.me.gen, born: Math.round(F.me.age0 ? -F.me.age0 : 0), age, spouse: F.spouse ? NPCS[F.spouse].n : null, kids: F.kids.map(k => k.name), why });
  openModal('Farewell', [{ id: 'd', label: 'Farewell', render: b => {
    b.append(el('p', { class: 'note' }, why === 'old' ? name + ' died peacefully at ' + age + ', in the chair by the window, with the fields turning gold outside.' : name + ' fell in the wilds at ' + age + '. They carried ' + name + ' home on a cart, and the whole village came.'));
    b.append(el('p', { class: 'note' }, 'The farm, its money and its buildings pass on. Who will carry on?'));
    const L = el('div', { class: 'list' });
    for (const h of H) { const n = h.kind === 'spouse' ? NPCS[h.id].n : F.kids[h.i].name, sub = h.kind === 'spouse' ? 'Your spouse. Brings their own trade and keeps the family together.' : 'Your child, ' + Math.floor(ageOf(F.kids[h.i])) + '. Knows what you taught them.';
      L.append(el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, n), el('small', null, sub)), el('button', { class: 'btn', on: () => { MODAL.lock = false; closeModal(); succeed(h); } }, 'Carry on as ' + n))); }
    b.append(L);
  } }]);
  MODAL.lock = true;
}
function succeed(h) {
  const F = fam(), oldTx = {}; for (const k of SK) if (S.sk[k]) oldTx[k] = S.sk[k].tx || 0;
  let look, age, name;
  if (h.kind === 'spouse') { look = npcLook(h.id); name = look.name; age = (F.spouseAge0 || 30) + (dayIndex() - (F.spouseD0 || dayIndex())) * AGE_RATE; F.rel[h.id] = 'family'; F.spouse = null; }
  else { const k = F.kids.splice(h.i, 1)[0]; look = Object.assign({}, k.look); name = k.name; age = ageOf(k);
    for (const sk of SK) if (S.sk[sk]) { const own = (k.xp && k.xp[sk]) || 0; S.sk[sk].tx = Math.max(own, oldTx[sk] * .2); }
    if (F.spouse) { F.rel[F.spouse] = 'family'; F.elder = F.spouse; F.spouse = null; } }
  if (h.kind === 'spouse') for (const sk of SK) if (S.sk[sk]) S.sk[sk].tx = oldTx[sk] * .35;
  for (const sk of SK) if (S.sk[sk]) { S.sk[sk].L = lvlFor(S.sk[sk].tx); S.sk[sk].l = Math.min(10, 1 + Math.floor(S.sk[sk].L / 10)); }
  if (S.csk) for (const c in S.csk) S.csk[c].xp = Math.max(c === 'constitution' ? XPT[10] : 0, S.csk[c].xp * .25);
  S.look = Object.assign({}, DEFAULT_LOOK, look, { name }); F.me = { name, age0: age, d0: dayIndex(), gen: F.me.gen + 1 }; F.bonus = Math.min(.5, F.bonus + .05); F.warnedOld = 0;
  HC_P = null; // redraw the player as the heir
  recalc(); S.p.hp = maxHP(); S.p.st = maxST(); hudKey = '';
  endDay(false); // the heir wakes at home the next morning
  setTimeout(() => toast(name + ' carries on the ' + F.crest.sym + ' of the family. Generation ' + F.me.gen + ': +' + Math.round(F.bonus * 100) + '% XP.', 'lvl'), 400);
}

/* ---- the Family tab ---- */
function crestCanvas() {
  const C = fam().crest, c = mk(32, 36, x => {
    x.fillStyle = '#2a1c18'; x.fillRect(3, 1, 26, 22); x.fillRect(5, 23, 22, 6); x.fillRect(9, 29, 14, 4); x.fillRect(13, 33, 6, 2);
    x.fillStyle = C.c1; x.fillRect(4, 2, 24, 20); x.fillRect(6, 22, 20, 6); x.fillRect(10, 28, 12, 4); x.fillRect(14, 32, 4, 1);
    x.fillStyle = C.c2; const P = (a, b, w, h) => x.fillRect(a, b, w, h);
    if (C.sym === 'stag') { P(15, 10, 2, 12); P(12, 13, 8, 4); P(10, 6, 2, 6); P(20, 6, 2, 6); P(8, 6, 2, 2); P(22, 6, 2, 2); }
    else if (C.sym === 'oak') { P(15, 16, 2, 10); P(10, 6, 12, 10); P(8, 9, 16, 5); }
    else if (C.sym === 'flame') { P(14, 6, 4, 20); P(11, 12, 10, 12); P(12, 9, 3, 4); P(17, 8, 3, 5); }
    else if (C.sym === 'wheat') { P(15, 6, 2, 20); for (let k = 0; k < 4; k++) { P(12, 8 + k * 4, 3, 2); P(17, 8 + k * 4, 3, 2); } }
    else { P(9, 10, 14, 4); P(13, 14, 6, 6); P(10, 20, 12, 3); }
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(4, 2, 24, 2);
  });
  c.style.cssText = 'width:96px;height:108px;image-rendering:pixelated'; return c;
}
function portrait(P, key) { const spr = humanSpr(key, P, 0, 0), c = el('canvas', { width: spr.width, height: spr.height, class: 'portrait' }); c.getContext('2d').drawImage(spr, 0, 0); return c; }
function renderFamily(b) {
  const F = fam(), L = el('div', { class: 'list' });
  b.append(el('div', { class: 'greet f-panel' }, crestCanvas(), el('div', { class: 'rtxt' }, el('b', null, 'House of ' + (F.tree.length ? F.tree[0].name : meName()).split(' ')[0] + ', generation ' + F.me.gen), el('p', null, 'Family bonus: +' + Math.round(F.bonus * 100) + '% XP. ' + (canDie() ? 'You have family, so the wilds can claim you now.' : 'With no spouse or children, nothing can end your story yet.')))));
  L.append(el('div', { class: 'rrow' }, portrait(playerPal(), 'fam_me' + F.me.gen), el('div', { class: 'rtxt' }, el('b', null, meName() + ' (you)'), el('small', null, 'Age ' + Math.floor(myAge()) + (myAge() > 45 ? '. Your body is slowing a little.' : '.') + (myAge() > 30 ? ' Learning ' + Math.round(Math.min(15, (myAge() - 30) * .5)) + '% faster from experience.' : '')))));
  if (F.spouse) L.append(el('div', { class: 'rrow' }, portrait(NPCS[F.spouse].P, 'npc' + F.spouse), el('div', { class: 'rtxt' }, el('b', null, NPCS[F.spouse].n + ' (spouse)'), el('small', null, 'Age ' + Math.floor((F.spouseAge0 || 30) + (dayIndex() - (F.spouseD0 || dayIndex())) * AGE_RATE) + '. Home mornings and evenings; does a chore every morning.'))));
  for (const id in F.rel) if (F.rel[id] === 'dating' || F.rel[id] === 'engaged') L.append(el('div', { class: 'rrow' }, portrait(NPCS[id].P, 'npc' + id), el('div', { class: 'rtxt' }, el('b', null, NPCS[id].n), el('small', null, F.rel[id] === 'engaged' ? 'Engaged. The wedding is in ' + Math.max(0, F.wed - dayIndex()) + ' days.' : 'Dating. ' + hearts(id) + ' hearts' + (hearts(id) >= 10 ? '. Ready for a pendant.' : '.')))));
  if (F.expect) L.append(el('div', { class: 'rrow' }, el('div', { class: 'qck' }, '♥'), el('div', { class: 'rtxt' }, el('b', null, 'A baby on the way'), el('small', null, 'Due in ' + Math.max(0, F.expect - dayIndex()) + ' days.'))));
  F.kids.forEach((k, i) => L.append(el('div', { class: 'rrow' }, portrait(lookToP(k.look), 'famkid' + i + stageOf(k)), el('div', { class: 'rtxt' }, el('b', null, k.name), el('small', null, STAGE_N[stageOf(k)] + ', ' + Math.floor(ageOf(k)) + '. ' + [ 'Asleep in the cradle most of the day.', 'Runs around the farm and brings you things.', k.skill ? 'Learning ' + SKN[k.skill] + ' (level ' + lvlFor((k.xp || {})[k.skill] || 0) + ').' : 'Talk to them on the farm to choose a skill to teach.', 'Grown. Helps with chores and could take over the farm.'][stageOf(k)])))));
  if (F.elder) L.append(el('div', { class: 'rrow' }, portrait(NPCS[F.elder].P, 'npc' + F.elder), el('div', { class: 'rtxt' }, el('b', null, NPCS[F.elder].n + ' (parent)'), el('small', null, 'Back at their old trade in the village.'))));
  const cands = Object.keys(ROMANCE).filter(id => !F.rel[id]);
  if (!F.spouse && cands.length) L.append(el('div', { class: 'rrow done' }, el('div', { class: 'qck' }, '♡'), el('div', { class: 'rtxt' }, el('b', null, 'Romance'), el('small', null, 'Could be courted: ' + cands.map(id => NPCS[id].n + ' (' + hearts(id) + '♥)').join(', ') + '. At 8 hearts, ask them out from their shop.'))));
  b.append(el('h3', null, 'Family'), L);
  if (F.tree.length) { const T = el('div', { class: 'list' }); F.tree.forEach(t => T.append(el('div', { class: 'rrow done' }, el('div', { class: 'qck' }, 'G' + t.gen), el('div', { class: 'rtxt' }, el('b', null, t.name), el('small', null, 'Died at ' + t.age + (t.why === 'old' ? ' of old age' : ' in the wilds') + '. ' + (t.spouse ? 'Married ' + t.spouse + '. ' : '') + (t.kids.length ? 'Children: ' + t.kids.join(', ') + '.' : '')))))); b.append(el('h3', null, 'Family tree'), T); }
}
const _initMapsF = initMaps;
initMaps = function () { _initMapsF(); fam(); placeFamily(); };
