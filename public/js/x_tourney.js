/* ================= Saltmere fishing tournament (asked 2026-11-05) =================
   Once a season, on day 20 (TOURNEY_DAY), Finn's Fish in Saltmere holds a fishing tournament. Sign up at Finn's (Tournament
   tab, 50g) from the day before until 16:00 on the day. From 8:00 to 16:00 every fish you catch (rod or harpoon, anywhere)
   is weighed (fishKg: by the fish's worth and quality, with luck) and your heaviest counts. From 16:00 Finn names the
   winners against four rival anglers (their best weights from the day's seed, TOURNEY_RIVALS); prizes wait at Finn's until
   you collect them: 1st 2,500g, the Angler's Cup and the title Champion Angler, 2nd 1,000g, 3rd 400g.
   State: S.tourney = { day, in, best: { id, kg }, n, paid }. The morning report says when one is coming. */
const TOURNEY_DAY = 20, TOURNEY_T = [480, 960];
const TOURNEY_RIVALS = ['Old Brine Marlow', 'Tess Harrow', 'Gil the Net', 'Captain Ysolde'];
const TOURNEY_PRIZE = [2500, 1000, 400];
I('anglers_cup', 'Angler’s Cup', 'loot', 1800, 'crown', '#f0c040', '#a07020', { desc: 'Won at the Saltmere fishing tournament' });
const tourneyToday = () => S && S.day === TOURNEY_DAY;
const tourneyOn = () => tourneyToday() && S.time >= TOURNEY_T[0] && S.time < TOURNEY_T[1];
const tourneyState = () => { const T = S.tourney; return T && T.day === dayIndex() ? T : null; };
// how heavy a fish is: by its worth, with the luck of the day and its quality
const fishKg = (id, q) => { const p = (IT[id] && IT[id].p) || 30; return Math.round((.25 + Math.sqrt(p) * .2) * (.6 + Math.random() * .9) * (1 + (q || 0) * .08) * 100) / 100; };
function tourneyRivals() {
  const d = dayIndex(), par = 3.6 + (S.year - 1) * .4;
  return TOURNEY_RIVALS.map((n, i) => ({ n, kg: Math.round(par * [.72, .88, 1.02, 1.2][i] * (.85 + hsh(d, i, 913) * .35) * 100) / 100 }));
}
function tourneyBoard() {
  const T = tourneyState(), rows = tourneyRivals().map(r => ({ n: r.n, kg: r.kg }));
  if (T && T.best) rows.push({ n: 'You', kg: T.best.kg, you: 1 });
  return rows.sort((a, b) => b.kg - a.kg);
}
// a caught fish is weighed while the tournament runs
give = (f => function (id, n, q) {
  const r = f.apply(this, arguments);
  try {
    const T = S && tourneyState();
    if (T && T.in && tourneyOn() && IT[id] && IT[id].t === 'fish' && ((typeof fishing !== 'undefined' && fishing) || (typeof FG !== 'undefined' && FG))) {
      const kg = fishKg(id, q); T.n = (T.n || 0) + 1;
      const best = !T.best || kg > T.best.kg; if (best) T.best = { id, kg };
      toast('Weighed: ' + IT[id].n + ', ' + kg.toFixed(2) + ' kg' + (best ? ' (your best!)' : ''), best ? 'lvl' : '');
    }
  } catch (e) { console.error(e); }
  return r;
})(give);
function renderTourney(b) {
  const T = tourneyState(), D = S.day, here = TOURNEY_DAY;
  b.append(el('p', { class: 'note' }, 'Once a season, on day ' + here + ', Saltmere holds a fishing tournament. Sign up here (50g) the day before or on the day until 4 pm. From 8 am to 4 pm every fish you catch, anywhere, is weighed; your heaviest counts. Winners are named at 4 pm: 1st ' + TOURNEY_PRIZE[0] + 'g and the Angler’s Cup, 2nd ' + TOURNEY_PRIZE[1] + 'g, 3rd ' + TOURNEY_PRIZE[2] + 'g.'));
  // a prize waiting from an earlier tournament
  const P = S.tourney && S.tourney.prize;
  if (P) { b.append(el('div', { class: 'acts' }, el('span', null, 'Your prize: ' + P.g + 'g' + (P.cup ? ' and the Angler’s Cup' : '') + ' (' + P.place + ').'),
    el('button', { class: 'btn', on: () => { S.gold += P.g; if (P.cup) { give('anglers_cup', 1, 0, true); S.titles = S.titles || []; if (!S.titles.includes('Champion Angler')) S.titles.push('Champion Angler'); } S.tourney.prize = null; SFX.lvl(); toast('Prize collected!', 'lvl'); refresh(); } }, 'Collect'))); }
  if (D === here - 1 || (D === here && S.time < TOURNEY_T[1])) {
    const signed = S.tourney && S.tourney.in && S.tourney.day === dayIndex() + (D === here - 1 ? 1 : 0);
    if (signed) b.append(el('p', null, 'You’re signed up.' + (T && T.best ? ' Your best: ' + IT[T.best.id].n + ', ' + T.best.kg.toFixed(2) + ' kg (' + T.n + ' fish weighed).' : D === here ? ' No fish weighed yet.' : ' Fishing starts tomorrow at 8 am.')));
    else b.append(el('div', { class: 'acts' }, el('button', { class: 'btn' + (S.gold >= 50 ? '' : ' off'), on: () => {
      if (S.gold < 50) { toast('The entry is 50g.', 'bad'); return; } S.gold -= 50; S.tourney = Object.assign(S.tourney || {}, { day: dayIndex() + (D === here - 1 ? 1 : 0), in: 1, best: null, n: 0, paid: 0 }); SFX.ok(); toast('Signed up for the tournament.'); refresh(); } }, 'Sign up (50g)')));
  }
  if (D === here) {
    const rows = tourneyBoard(), list = el('div', { class: 'list' });
    rows.forEach((r, i) => list.append(el('div', { class: 'rrow' + (r.you ? ' on' : '') }, el('div', { class: 'rtxt' }, el('b', null, (i + 1) + '. ' + r.n), el('small', null, r.kg.toFixed(2) + ' kg')))));
    b.append(el('h3', null, S.time >= TOURNEY_T[1] ? 'Results' : 'Weights so far (the others weigh in at 4 pm)'), list);
  } else if (D !== here - 1) b.append(el('p', { class: 'note' }, 'The next tournament is on ' + SEASONS[S.day < here ? S.season : (S.season + 1) % 4] + ' ' + here + '.'));
}
// at 4 pm the winners are named and the prize waits at Finn's
EVT.on('tick', () => {
  const T = S && tourneyState(); if (!T || !T.in || T.paid || S.time < TOURNEY_T[1]) return;
  T.paid = 1; const rows = tourneyBoard(), i = rows.findIndex(r => r.you);
  if (i < 0) { toast('The tournament is over. You didn’t weigh a fish.'); return; }
  if (i < 3) { S.tourney.prize = { g: TOURNEY_PRIZE[i], cup: i === 0, place: ['first', 'second', 'third'][i] }; toast('Tournament: you came ' + ['first', 'second', 'third'][i] + ' with ' + T.best.kg.toFixed(2) + ' kg! Collect your prize at Finn’s Fish.', 'lvl'); SFX.lvl(); }
  else toast('Tournament: you came ' + (i + 1) + 'th with ' + T.best.kg.toFixed(2) + ' kg.');
});
townMenu = (f => function (act, who) {
  const r = f.apply(this, arguments);
  if (act === 'sm_fish' && MODAL && MODAL.tabs && !MODAL.tabs.some(t => t.id === 'tour')) { MODAL.tabs.push({ id: 'tour', label: 'Tournament', render: renderTourney }); drawModal(); }
  return r;
})(townMenu);
showDayReport = (f => function (lines) {
  try { const d = TOURNEY_DAY - S.day; if (d >= 0 && d <= 2) lines = (lines || []).concat([['fish', d ? 'The Saltmere fishing tournament is in ' + d + ' day' + (d > 1 ? 's' : '') + ' (sign up at Finn’s Fish).' : 'Today is the Saltmere fishing tournament: 8 am to 4 pm.']]); } catch (e) { console.error(e); }
  return f.call(this, lines);
})(showDayReport);
if (typeof HELP !== 'undefined') {
  HELP.tourney = ['Fishing tournament', ['Once a season, on day 20, at Finn’s Fish in Saltmere. Sign up for 50g the day before or on the day.', 'From 8 am to 4 pm every fish you catch with a rod or harpoon, anywhere, is weighed. Heavier kinds and better quality weigh more, with some luck; your heaviest counts.', 'At 4 pm the four rival anglers weigh in. 1st wins 2,500g, the Angler’s Cup and the title Champion Angler; 2nd 1,000g; 3rd 400g. Collect the prize at Finn’s.']];
  helpKey = (f => function () { if (MODAL && MODAL.cur === 'tour') return 'tourney'; return f.apply(this, arguments); })(helpKey);
}
