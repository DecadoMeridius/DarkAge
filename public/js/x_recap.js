/* Story recap (asked 2026-11-03): every story in the journal (Quests, J) can be clicked to reread it up to where you
   are: each chapter you've reached, with what was said (the steps' dialogue lines, speaker named) and what you did
   (the step's hint, ticked). Finished stories show the whole tale; stories not begun can't be opened. */
function storyRecap(sid) {
  const Sd = STORIES[sid], T = storyState(), q = T && T.q[sid]; if (!Sd || !q) return;
  const lastC = q.done ? Sd.ch.length - 1 : q.c;
  const body = el('div', { class: 'recap' });
  body.append(el('p', { class: 'note' }, Sd.blurb || ''));
  for (let c = 0; c <= lastC; c++) {
    const ch = Sd.ch[c]; if (!ch) continue;
    body.append(el('h3', null, 'Chapter ' + (c + 1) + ': ' + ch.n));
    const upto = q.done || c < q.c ? ch.steps.length : q.i;
    for (let i = 0; i < upto; i++) {
      const st = ch.steps[i]; let lines = st.lines; try { if (typeof lines === 'function') lines = lines(); } catch (e) { lines = null; }
      let hint = st.hint; try { if (typeof hint === 'function') hint = hint(st.t === 'kill' ? st.n : undefined); } catch (e) { hint = ''; }   // a finished kill step shows its full count
      if (hint) body.append(el('p', { class: 'recap-did' }, '✓ ' + String(hint).replace(/\s*\(\d+ of \d+[^)]*\)\.?$/, '')));   // what you did (without "2 of 3 found")
      for (const ln of Array.isArray(lines) ? lines : []) {
        const [sp, text] = ln, W = sp === 'narr' ? null : (typeof who === 'function' ? who(sp) : null);
        body.append(W ? el('p', null, el('b', null, W.n + ': '), '“' + text + '”') : el('p', null, el('i', null, text)));
      }
    }
    if (!q.done && c === q.c) { const cur_ = ch.steps[q.i]; let h = cur_ && cur_.hint; try { if (typeof h === 'function') h = h(cur_.t === 'kill' ? (q.kills || 0) : undefined); } catch (e) {} if (h) body.append(el('p', { class: 'recap-now' }, 'Now: ' + h)); }
  }
  if (q.done) body.append(el('p', { class: 'recap-now' }, 'The story is complete.'));
  openModal(Sd.n, [{ id: 'recap', label: 'The story so far', render: b => b.append(body) }]);
}
// the journal rows open it: the story's row is clickable and gets a Read button
renderQuests = (f => function (b) {
  f.apply(this, arguments);
  const T = storyState(); if (!T) return;
  for (const row of b.querySelectorAll('.rrow')) {
    const name = row.querySelector('.rtxt b'); if (!name) continue;
    const sid = Object.keys(STORIES).find(k => name.textContent === STORIES[k].n || name.textContent.startsWith(STORIES[k].n + ':'));
    if (!sid || !T.q[sid]) continue;
    row.style.cursor = 'pointer'; row.title = 'Click to reread the story so far';
    row.addEventListener('click', e => { if (e.target.closest('button')) return; storyRecap(sid); });
    const btn = el('button', { class: 'btn ghost', on: e => { e.stopPropagation(); storyRecap(sid); } }, 'Read');
    const acts = row.querySelector('button'); if (acts) acts.before(btn); else row.append(btn);
  }
})(renderQuests);
document.head.append(el('style', null, '.recap h3 { margin: 12px 0 4px; } .recap p { margin: 3px 0; line-height: 1.45; } .recap-did { color: #5a7a3a; font-weight: 600; } .recap-now { color: #a0522d; font-weight: 700; margin-top: 8px !important; }'));
