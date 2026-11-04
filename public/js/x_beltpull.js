/* ================= Belts that pull, and the Storage Shed on the belt line (asked 2026-11-04) =================
   - Every belt (chute, conveyor, sorter, splitter, cobalt belt, rune belt) can pull: with o.pull on and a list
     of item ids (o.pl), it takes those, one at a time and in turn (o.pi), from the tile behind it: a crate or
     ledger, a station's or machine's output, or a finished Storage Shed (the bank). Unticked, a belt works as before.
   - Crates and stations don't push onto a belt that pulls (pushOut / pushMach skip it), so the belt decides.
   - A belt pointing into a Storage Shed puts what it carries into the bank.
   - Both run in an autoTick wrapper, so the night's catch-up (endDay's 300 autoTicks) does them too.
   - Interacting with a belt opens its window (rotate, the sorter's filter, pulling and an item picker); a jammed
     belt still offers to take the stuck item first (x_fix6.js). R or Shift+E rotates the aimed belt at once.
   - While you hold a belt, small arrows ring each shed: green pointing in (a belt here pointing at the shed
     unloads into the bank), blue pointing out (a belt here pointing away can pull from it); lit where a belt is. */

const sheds = m => (m && m.bld || []).filter(b => b.struct && b.struct.k === 'shed' && b.struct.stage >= 4);
const shedAt = (m, x, y) => sheds(m).find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) || null;
const beltRuns = (m, o, x, y) => (BELT_FREE.has(o.k) || powered(m, x, y)) && (o.k !== 'chute' || TICK.n % 2 === 0);
const pulls = o => isBelt(o) && o.pull && o.pl && o.pl.length;

// what a belt can pull from behind it: { name, bag } (bag: the item counts), or a done artisan machine
function pullSource(m, o, x, y) {
  const d = DIRV[o.d || 0], bx = x - d[0], by = y - d[1];
  if (!inb(m, bx, by)) return null;
  if (shedAt(m, bx, by)) return { name: 'Storage Shed (your bank)', bag: S.bank, shed: 1 };
  const [, , src] = mainOf(m, bx, by); if (!src || isBelt(src)) return null;
  if (STORE.has(src.k)) return { name: IT[src.k] ? IT[src.k].n : 'Crate', bag: src.inv = src.inv || {} };
  if (isMach(src)) return { name: (IT[src.k] || {}).n || 'Machine', mach: src };
  if (isAuto(src) && (STATIONS[src.k] || src.out)) return { name: (IT[src.k] || {}).n || 'Station', bag: src.out = (src.out && typeof src.out === 'object') ? src.out : {}, st: src };
  return null;
}
function pullOne(m, o, x, y) {
  if (o.item || !pulls(o) || !beltRuns(m, o, x, y)) return;
  const s = pullSource(m, o, x, y); if (!s) return;
  const n = o.pl.length;
  for (let j = 0; j < n; j++) {
    const at = ((o.pi || 0) + j) % n, id = o.pl[at];
    if (s.mach) {
      const M = s.mach; if (!M.out || M.left > 0 || typeof M.out !== 'string' || parseK(M.out)[0] !== id) continue;
      o.item = M.out; M.out = null; M.item = null; M.left = 0;
    } else {
      const k = Object.keys(s.bag).find(k => s.bag[k] > 0 && parseK(k)[0] === id); if (!k) continue;
      o.item = k; s.bag[k]--; if (s.bag[k] <= 0) delete s.bag[k];
    }
    o.pi = (at + 1) % n; o.jam = 0; return;
  }
}
// a belt pointing into a shed empties into the bank
function unloadShed(m, o, x, y) {
  if (!o.item || !beltRuns(m, o, x, y)) return;
  const d = DIRV[o.d || 0]; if (!shedAt(m, x + d[0], y + d[1])) return;
  S.bank[o.item] = (S.bank[o.item] || 0) + 1; o.item = null; o.jam = 0;
}
/* ---- the Merger (asked 2026-11-04): a belt that takes from its back and both sides strictly in turn (o.mi) and
   sends everything on the way it faces. Plain belts already merge, but on a full line the input first on the map always
   won. During s_auto's own belt pass an empty merger holds a placeholder (MERGE_HOLD) so no input can push in, and
   BELT_SPEED.merger -1 keeps the pass from moving it (0 would read as 1 there); mergeStep then moves it on and takes the next input in turn.
   Sides can be switched off in its window (o.moff: top, left, right, bottom). ---- */
I('merger', 'Merger', 'place', 60, 'obj', null, null, { place: 'merger', desc: 'A belt that takes from its back and both sides in turn and sends it all one way' });
OBJ.merger = { solid: 0, place: 1, tall: 0, auto: 1 }; FLAT.add('merger'); DIRPLACE.add('merger'); BELTS.add('merger'); BELT_SPEED.merger = -1; AUTOTIER.merger = 2;
RC.push(['merger', 2, { conveyor: 2, gear: 1, copper_bar: 1 }, 'bench']);
const MERGE_HOLD = '__merge';
const SIDE_N = (dx, dy) => dy < 0 ? 'top' : dy > 0 ? 'bottom' : dx < 0 ? 'left' : 'right';
// a belt's way out this tick, as s_auto.js moves it (a sorter turns non-filter items right; a splitter alternates)
const beltOut = b => b.k === 'sorter' && b.filter && b.item !== b.filter ? RIGHT[b.d] : b.k === 'splitter' && splitCustom(b) ? splitDir(b) : b.k === 'splitter' && b.next ? RIGHT[b.d] : b.d;
// the merger's inputs in turn order: back, then the two sides; [x, y, side name]
function mergeInputs(o, x, y) {
  const d = DIRV[o.d || 0], side = [d[1], -d[0]];
  return [[x - d[0], y - d[1]], [x + side[0], y + side[1]], [x - side[0], y - side[1]]].map(([a, b]) => [a, b, SIDE_N(a - x, b - y)]);
}
function mergeStep(m, o, x, y) {
  if (!beltRuns(m, o, x, y)) return;
  if (o.item) {   // on the way it faces: a belt, a machine or crate, or the shed
    const d = DIRV[o.d || 0], nx = x + d[0], ny = y + d[1]; if (!inb(m, nx, ny)) return;
    const n = getO(m, nx, ny);
    if (isBelt(n)) { if (!n.item) { n.item = o.item; o.item = null; o.jam = 0; n.slideFrom = o.d; n.slideT = TICK.n; } }
    else if (shedAt(m, nx, ny)) { S.bank[o.item] = (S.bank[o.item] || 0) + 1; o.item = null; o.jam = 0; }
    else { const [, , t] = mainOf(m, nx, ny); if (t && (isAuto(t) || isMach(t)) && accept(t, o.item)) { o.item = null; o.jam = 0; } else if (t) o.jam = (o.jam || 0) + 1; }
  }
  if (o.item) return;
  const ins = mergeInputs(o, x, y), off = o.moff || {};
  for (let j = 0; j < 3; j++) {
    const at = ((o.mi || 0) + j) % 3, [bx, by, nm] = ins[at]; if (off[nm] || !inb(m, bx, by)) continue;
    const b = getO(m, bx, by); if (!isBelt(b) || !b.item || b.item === MERGE_HOLD || !beltRuns(m, b, bx, by)) continue;
    const bd = beltOut(b); if (bx + DIRV[bd][0] !== x || by + DIRV[bd][1] !== y) continue;   // it must be sending this way
    takeFromBelt(o, b, bd); o.mi = (at + 1) % 3; return;
  }
}
/* ---- splitter settings (asked 2026-11-04): o.so = weights { s, l, r } for straight, left and right (left and right as
   the belt faces), taken in a smooth repeating order (splitSeq, pointer o.sp); o.route = { item id: 's' | 'l' | 'r' }
   sends chosen items their own way (they wait for it); o.swait waits for a blocked output instead of skipping it.
   A splitter with any of this is moved by splitStep, not s_auto's pass (renamed 'splitter~' for that pass, so it neither
   moves nor takes there); one without keeps the old straight / right alternation. ---- */
const LEFT = [2, 0, 3, 1], SPLIT_OUT = { s: d => d, l: d => LEFT[d], r: d => RIGHT[d] }, SPLIT_N = { s: 'Straight', l: 'Left', r: 'Right' };
const splitCustom = o => !!(o.so || (o.route && Object.keys(o.route).length) || o.swait);
function splitSeq(o) {
  const w = o.so || { s: 1, r: 1 }, ks = ['s', 'l', 'r'].filter(k => w[k] > 0), tot = ks.reduce((a, k) => a + w[k], 0), cr = {}, seq = [];
  ks.forEach(k => cr[k] = 0);
  for (let i = 0; i < tot; i++) { ks.forEach(k => cr[k] += w[k]); let b = ks[0]; for (const k of ks) if (cr[k] > cr[b]) b = k; cr[b] -= tot; seq.push(b); }
  return seq.length ? seq : ['s'];
}
// where the splitter's item goes next: a routed item its own way, else the next output in the ratio
function splitDir(o) {
  const rt = o.item && o.route && o.route[parseK(o.item)[0]]; if (rt) return SPLIT_OUT[rt](o.d || 0);
  const seq = splitSeq(o); return SPLIT_OUT[seq[(o.sp || 0) % seq.length]](o.d || 0);
}
// hand a belt's item on to whatever is in direction D: a belt, the shed, or a machine or crate that takes it
function sendTo(m, o, x, y, D) {
  const nx = x + DIRV[D][0], ny = y + DIRV[D][1]; if (!inb(m, nx, ny)) return false;
  const n = getO(m, nx, ny);
  if (isBelt(n)) { if (n.item) return false; n.item = o.item; o.item = null; o.jam = 0; n.slideFrom = D; n.slideT = TICK.n; return true; }
  if (shedAt(m, nx, ny)) { S.bank[o.item] = (S.bank[o.item] || 0) + 1; o.item = null; o.jam = 0; return true; }
  const [, , t] = mainOf(m, nx, ny); if (t && (isAuto(t) || isMach(t)) && accept(t, o.item)) { o.item = null; o.jam = 0; return true; }
  return false;
}
// o takes belt b's item (b sending in direction bd); splitters move on to their next output
function takeFromBelt(o, b, bd) {
  const routed = b.k === 'splitter' && b.route && b.route[parseK(b.item)[0]];
  o.item = b.item; b.item = null; b.jam = 0; o.slideFrom = bd; o.slideT = TICK.n;
  if (b.k === 'splitter') { if (splitCustom(b)) { if (!routed) b.sp = ((b.sp || 0) + 1) % splitSeq(b).length; } else b.next = 1 - (b.next || 0); }
}
function splitStep(m, o, x, y) {
  if (!beltRuns(m, o, x, y)) return;
  if (o.item) {
    const rt = o.route && o.route[parseK(o.item)[0]], d = o.d || 0;
    if (rt) { if (!sendTo(m, o, x, y, SPLIT_OUT[rt](d))) o.jam = (o.jam || 0) + 1; }
    else {
      const seq = splitSeq(o), n = seq.length, tries = o.swait ? 1 : n;
      for (let j = 0; j < tries; j++) { const at = ((o.sp || 0) + j) % n; if (sendTo(m, o, x, y, SPLIT_OUT[seq[at]](d))) { o.sp = (at + 1) % n; break; } }
      if (o.item) o.jam = (o.jam || 0) + 1;
    }
  }
  if (o.item) return;
  for (let j = 0; j < 4; j++) {   // take from a belt sending into it, any side, in turn
    const at = ((o.ii || 0) + j) % 4, bx = x - DIRV[at][0], by = y - DIRV[at][1]; if (!inb(m, bx, by)) continue;
    const b = getO(m, bx, by); if (!isBelt(b) || b === o || !b.item || b.item === MERGE_HOLD || !beltRuns(m, b, bx, by)) continue;
    const bd = beltOut(b); if (bx + DIRV[bd][0] !== x || by + DIRV[bd][1] !== y) continue;
    takeFromBelt(o, b, bd); o.ii = (at + 1) % 4; return;
  }
}
// the merger is drawn with the other belts in x_beltart.js

autoTick = (f => function (m) {
  if (!m || !m.o || !S) return f.apply(this, arguments);
  const held = [], splits = [];
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue;
    if (o.k === 'merger' && !o.item) { o.item = MERGE_HOLD; held.push(o); }
    else if (o.k === 'splitter' && splitCustom(o)) { o.k = 'splitter~'; splits.push(i); } }
  let r; try { r = f.apply(this, arguments); } finally { for (const o of held) if (o.item === MERGE_HOLD) o.item = null; for (const i of splits) m.o[i].k = 'splitter'; }
  for (const i of splits) splitStep(m, m.o[i], i % m.w, i / m.w | 0);
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && o.k === 'merger') mergeStep(m, o, i % m.w, i / m.w | 0); }
  const hasShed = sheds(m).length;
  for (let i = 0; i < m.o.length; i++) {
    const o = m.o[i]; if (!isBelt(o)) continue; const x = i % m.w, y = i / m.w | 0;
    if (hasShed && o.item && o.k !== 'merger' && !(o.k === 'splitter' && splitCustom(o))) unloadShed(m, o, x, y);
    if (o.pull) pullOne(m, o, x, y);
  }
  return r;
})(autoTick);
// crates and stations leave belts that pull alone (the same as s_auto.js's, with that one check)
pushOut = function (m, o, x, y) {
  for (let d = 0; d < 4; d++) {
    const bx = x + DIRV[d][0], by = y + DIRV[d][1]; if (!inb(m, bx, by)) continue; const b = getO(m, bx, by);
    if (!isBelt(b) || b.d !== d || b.item || b.pull) continue;
    const src = STORE.has(o.k) ? o.inv : o.out, keys = Object.keys(src || {}).filter(k => src[k] > 0); if (!keys.length) return;
    const k = keys[(o.rr = ((o.rr || 0) + 1) % keys.length)];
    b.item = k; src[k]--; if (!src[k]) delete src[k];
  }
};
pushMach = function (m, o, x, y) {
  for (let d = 0; d < 4; d++) { const b = getO(m, x + DIRV[d][0], y + DIRV[d][1]); if (isBelt(b) && b.d === d && !b.item && !b.pull) { b.item = o.out; o.out = null; o.item = null; o.left = 0; return; } }
};

/* ---- the belt window ---- */
const BELT_ARROW = ['↓', '←', '→', '↑'], BELT_DIRN = ['down', 'left', 'right', 'up'];
const beltRotate = o => { o.d = [1, 3, 0, 2][o.d || 0]; SFX.pop(); };
function openBeltWin(o, m, x, y) {
  openModal(IT[o.k] ? IT[o.k].n : 'Belt', [{ id: 'b', label: 'Belt', render: b => {
    MODAL.opts.belt = 1;
    const src = pullSource(m, o, x, y);
    b.append(el('p', { class: 'note' }, 'Carries things ' + BELT_DIRN[o.d || 0] + ' ' + BELT_ARROW[o.d || 0] + '. ' + (BELT_FREE.has(o.k) ? 'Needs no power.' : powered(m, x, y) ? 'Powered.' : 'Not powered: build a windmill, waterwheel or treadwheel nearby.') + ' R (or Shift+E) rotates a belt without opening this.'));
    const top = el('div', { class: 'acts wrap' }, el('button', { class: 'btn', on: () => { beltRotate(o); refresh(); } }, 'Rotate ↻'));
    if (o.item) { const [id, q] = parseK(o.item); top.append(el('span', { class: 'bwcar' }, 'Carrying ', icon(id, 20, q), ' ' + IT[id].n), el('button', { class: 'btn ghost', on: () => { give(id, 1, q); o.item = null; o.jam = 0; refresh(); } }, 'Take it')); }
    b.append(top);
    // the merger's sides
    if (o.k === 'merger') {
      const off = o.moff = o.moff || {}, row = el('div', { class: 'chips' }, el('span', null, 'Takes in turn from:'));
      for (const [bx, by, nm] of mergeInputs(o, x, y)) { const b = getO(m, bx, by), feeding = isBelt(b) && (bx + DIRV[b.d][0] === x && by + DIRV[b.d][1] === y);
        row.append(el('button', { class: 'chip' + (off[nm] ? '' : ' on'), title: off[nm] ? 'Off: click to take from here' : 'On: click to stop taking from here', on: () => { if (off[nm]) delete off[nm]; else off[nm] = 1; refresh(); } }, nm[0].toUpperCase() + nm.slice(1) + (feeding ? ' (belt)' : ''))); }
      b.append(row);
    }
    // the splitter's outputs, ratio and item routes
    const splitter = o.k === 'splitter';
    if (splitter) {
      const d = o.d || 0, w = o.so || { s: 1, l: 0, r: 1 };
      const setSo = nw => { if ((nw.s || 0) + (nw.l || 0) + (nw.r || 0) < 1) return; o.so = nw; o.sp = 0; refresh(); };
      const setW = (k, v) => { const nw = Object.assign({ s: 0, l: 0, r: 0 }, w); nw[k] = Math.max(0, Math.min(9, v)); setSo(nw); };
      b.append(el('h3', null, 'Outputs'));
      const box = el('div', { class: 'bwsplit' });
      for (const k of ['s', 'l', 'r']) box.append(el('div', { class: 'bwrow' }, el('b', null, SPLIT_N[k] + ' ' + BELT_ARROW[SPLIT_OUT[k](d)]),
        el('button', { class: 'btn ghost', on: () => setW(k, (w[k] || 0) - 1) }, '−'), el('span', { class: 'bwn' }, String(w[k] || 0)), el('button', { class: 'btn ghost', on: () => setW(k, (w[k] || 0) + 1) }, '+')));
      b.append(box);
      const tot = (w.s || 0) + (w.l || 0) + (w.r || 0);
      b.append(el('p', { class: 'note' }, 'Out of every ' + tot + ': ' + ['s', 'l', 'r'].filter(k => w[k] > 0).map(k => w[k] + ' ' + SPLIT_N[k].toLowerCase()).join(', ') + (o.so ? '.' : ' (the plain splitter).') + ' Left and right are as the belt faces.'));
      const wb = el('input', { type: 'checkbox' }); wb.checked = !!o.swait; wb.onchange = () => { o.swait = wb.checked ? 1 : 0; refresh(); };
      b.append(el('div', { class: 'chips' }, el('span', null, 'Presets:'),
        el('button', { class: 'chip' + (!o.so ? ' on' : ''), on: () => { o.so = null; o.sp = 0; refresh(); } }, 'Straight / right'),
        el('button', { class: 'chip', on: () => setSo({ s: 0, l: 1, r: 1 }) }, 'Left / right'),
        el('button', { class: 'chip', on: () => setSo({ s: 1, l: 1, r: 1 }) }, 'Three ways')),
        el('label', { class: 'bwpull' }, wb, ' Wait when the next output is blocked (keeps the ratio exact; otherwise it skips to the next)'));
      const routes = o.route = o.route || {}, rl = el('div', { class: 'bwroutes' });
      for (const id of Object.keys(routes)) {
        if (!IT[id]) { delete routes[id]; continue; }
        rl.append(el('div', { class: 'bwrow' }, icon(id, 20), el('b', null, IT[id].n),
          ...['s', 'l', 'r'].map(k => el('button', { class: 'chip' + (routes[id] === k ? ' on' : ''), on: () => { routes[id] = k; refresh(); } }, SPLIT_N[k] + ' ' + BELT_ARROW[SPLIT_OUT[k](d)])),
          el('button', { class: 'btn ghost', title: 'Remove', on: () => { delete routes[id]; refresh(); } }, '✕')));
      }
      b.append(el('h3', null, 'Send items a set way'), rl.children.length ? rl : el('p', { class: 'note' }, 'None yet: click an item below to give it its own way. Everything else follows the outputs above.'));
    }
    // the sorter's filter
    const sorter = o.k === 'sorter', mode = sorter ? (MODAL.opts.bm === 'filter' ? 'filter' : 'pull') : splitter ? (MODAL.opts.bm === 'pull' && o.pull ? 'pull' : 'route') : 'pull';
    if (sorter) b.append(el('div', { class: 'acts wrap' }, el('b', null, 'Filter: '), o.filter && IT[o.filter] ? el('span', { class: 'bwcar' }, icon(o.filter, 20), ' ' + IT[o.filter].n + ' goes straight, the rest turns right') : el('span', null, 'none (everything goes straight)'),
      o.filter ? el('button', { class: 'btn ghost', on: () => { o.filter = null; refresh(); } }, 'Clear') : null));
    // pulling
    const cb = el('input', { type: 'checkbox' }); cb.checked = !!o.pull; cb.onchange = () => { o.pull = cb.checked ? 1 : 0; o.pl = o.pl || []; refresh(); };
    b.append(el('label', { class: 'bwpull' }, cb, ' Pull from what’s behind it'), el('p', { class: 'note' }, src ? 'Behind it: ' + src.name + '.' : 'Nothing behind it to pull from (a crate, a ledger, a station or machine, or a Storage Shed).'));
    if (o.pull) {
      const chosen = el('div', { class: 'chips' }, el('span', null, 'Pulls:'));
      (o.pl || []).forEach((id, j) => { if (IT[id]) chosen.append(el('button', { class: 'chip on', title: 'Click to remove', on: () => { o.pl.splice(j, 1); o.pi = 0; refresh(); } }, icon(id, 18), ' ' + IT[id].n + ' ✕')); });
      if (!(o.pl || []).length) chosen.append(el('span', { class: 'note' }, ' nothing yet: pick items below. It takes them one at a time, in turn.'));
      b.append(chosen);
    }
    if (o.pull || sorter || splitter) {
      if (splitter && o.pull) b.append(el('div', { class: 'chips' }, el('span', null, 'Clicking an item:'),
        el('button', { class: 'chip' + (mode === 'route' ? ' on' : ''), on: () => { MODAL.opts.bm = 'route'; refresh(); } }, 'Gives it a set way'),
        el('button', { class: 'chip' + (mode === 'pull' ? ' on' : ''), on: () => { MODAL.opts.bm = 'pull'; refresh(); } }, 'Adds it to what it pulls')));
      if (sorter) b.append(el('div', { class: 'chips' }, el('span', null, 'Clicking an item sets:'),
        el('button', { class: 'chip' + (mode === 'pull' ? ' on' : ''), on: () => { MODAL.opts.bm = 'pull'; refresh(); } }, 'What it pulls'),
        el('button', { class: 'chip' + (mode === 'filter' ? ' on' : ''), on: () => { MODAL.opts.bm = 'filter'; refresh(); } }, 'The filter')));
      const q = (MODAL.opts.bq || '').toLowerCase(), find = el('input', { class: 'f-input', placeholder: 'Find an item…', value: MODAL.opts.bq || '' });
      find.oninput = () => { MODAL.opts.bq = find.value; refresh(); setTimeout(() => { const f = document.querySelector('#mbody input[placeholder="Find an item…"]'); if (f) { f.focus(); f.setSelectionRange(f.value.length, f.value.length); } }, 0); };
      b.append(el('div', { class: 'acts wrap' }, find));
      const pick = id => { if (mode === 'filter') o.filter = id; else if (mode === 'route') { o.route = o.route || {}; if (!o.route[id]) o.route[id] = 's'; } else { o.pull = 1; o.pl = o.pl || []; if (!o.pl.includes(id)) o.pl.push(id); } SFX.pop(); refresh(); };
      const seen = new Set(), group = (title, ids) => {
        ids = ids.filter(id => IT[id] && !seen.has(id) && (!q || IT[id].n.toLowerCase().includes(q))); ids.forEach(id => seen.add(id)); if (!ids.length) return;
        const g = el('div', { class: 'grid' });
        for (const id of ids.slice(0, 160)) g.append(el('button', { class: 'cell f-slot' + ((o.pl || []).includes(id) || o.filter === id || (o.route && o.route[id]) ? ' on' : ''), title: IT[id].n, on: () => pick(id) }, icon(id, 32)));
        b.append(el('h3', null, title + (ids.length > 160 ? ' (first 160: search for more)' : '')), g);
      };
      const ids = bag => Object.keys(bag || {}).filter(k => bag[k] > 0).map(k => parseK(k)[0]);
      if (src && src.mach) group('Behind it', src.mach.out && typeof src.mach.out === 'string' ? [parseK(src.mach.out)[0]] : []);
      else if (src) group('Behind it', [...ids(src.bag), ...(src.st ? recipesOf(src.st).map(r => r.out[0]) : [])]);
      group('Your backpack', ids(S.inv));
    }
  } }]);
}
objInteract = (f => function (m, x, y, o) {
  if (isBelt(o) && !(o.item && (o.jam || 0) >= 4)) return { label: 'Set up', fn: () => openBeltWin(o, m, x, y) };
  return f.apply(this, arguments);   // a jammed belt: take the stuck item first (x_fix6.js)
})(objInteract);
// R or Shift+E on a belt rotates it at once: the belt under the mouse within reach, else the one you face or stand on
function beltAimed() {
  const m = cur; if (!m || !m.o) return null;
  const tries = [];
  if (MOUSE.in) { const [mx, my] = mouseTile(); if (Math.hypot((mx + .5) * 16 - S.p.x, (my + .5) * 16 - S.p.y) < 40) tries.push([mx, my]); }
  tries.push(faceTile(), [Math.floor(S.p.x / 16), Math.floor((S.p.y - 2) / 16)]);
  for (const [x, y] of tries) { if (!inb(m, x, y)) continue; const o = getO(m, x, y); if (isBelt(o)) return o; }
  return null;
}
addEventListener('keydown', e => {
  if (!S || TITLE || MODAL || PAUSED || e.repeat || (e.target && /input|textarea/i.test(e.target.tagName))) return;
  const k = (e.key || '').toLowerCase(); if (!((k === 'r' && !e.shiftKey && !e.ctrlKey) || (k === 'e' && e.shiftKey))) return;
  if (S.mounted) return;   // R gets off the horse
  const o = beltAimed(); if (!o) return;
  e.preventDefault(); e.stopImmediatePropagation(); beltRotate(o);
}, true);

/* ---- arrows round the shed while you hold a belt ---- */
const ARROW_DOWN = ['..###..', '..###..', '..###..', '#######', '.#####.', '..###..', '...#...'];
const ARROW_PTS = (() => { const on = new Set(), pts = [], edge = []; for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) if (ARROW_DOWN[j][i] === '#') { on.add(i + ',' + j); pts.push([i, j]); }
  for (let j = -1; j < 8; j++) for (let i = -1; i < 8; i++) if (!on.has(i + ',' + j) && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => on.has((i + a) + ',' + (j + b)))) edge.push([i, j]);
  return { pts, edge }; })();
// one world px per arrow pixel, a 1px dark outline; turned from the downward mask
function pxArrow(cx, cy, d, col, lit) {
  const at = (i, j) => d === 0 ? [i, j] : d === 3 ? [i, 6 - j] : d === 2 ? [j, i] : [6 - j, i];
  g.globalAlpha = lit ? 1 : .7;
  g.fillStyle = '#10140e'; for (const [i, j] of ARROW_PTS.edge) { const [ax, ay] = at(i, j); g.fillRect(cx - 3.5 + ax, cy - 3.5 + ay, 1, 1); }
  g.fillStyle = col; for (const [i, j] of ARROW_PTS.pts) { const [ax, ay] = at(i, j); g.fillRect(cx - 3.5 + ax, cy - 3.5 + ay, 1, 1); }
  if (lit) { g.fillStyle = '#ffffff'; for (const [i, j] of ARROW_PTS.pts) if (i === 3 && j < 5) { const [ax, ay] = at(i, j); g.fillRect(cx - 3.5 + ax, cy - 3.5 + ay, 1, 1); } }
  g.globalAlpha = 1;
}
const holdingBelt = () => { const id = S && selKind(); return !!(id && IT[id] && IT[id].t === 'place' && BELTS.has(IT[id].place)); };
pcCursorDraw = (f => function (m) {
  const r = f.apply(this, arguments);
  if (!m || !m.farm || !S || TITLE || !holdingBelt()) return r;
  for (const b of sheds(m)) {
    const sides = [];
    for (let x = b.x; x < b.x + b.w; x++) { sides.push([x, b.y - 1, 0]); sides.push([x, b.y + b.h, 3]); }   // [tile, the way in]
    for (let y = b.y; y < b.y + b.h; y++) { sides.push([b.x - 1, y, 2]); sides.push([b.x + b.w, y, 1]); }
    for (const [x, y, din] of sides) {
      if (!inb(m, x, y) || m.solidB[y * m.w + x]) continue;
      const o = getO(m, x, y), dout = [3, 2, 1, 0][din], v = DIRV[din], cx = x * 16 + 8, cy = y * 16 + 8;
      pxArrow(cx + v[0] * 4, cy + v[1] * 4, din, isBelt(o) && o.d === din ? '#7dff8e' : '#36c24c', isBelt(o) && o.d === din);
      pxArrow(cx - v[0] * 4, cy - v[1] * 4, dout, isBelt(o) && o.d === dout ? '#8cc8ff' : '#3a8ef0', isBelt(o) && o.d === dout);
    }
  }
  return r;
})(pcCursorDraw);

/* ---- the guide ---- */
HELP.belt = ['Belts', [
  'A belt carries one item at a time the way it faces; chutes and rune belts need no power, the others a windmill, waterwheel or treadwheel nearby.',
  'Pull from what’s behind it: tick it and pick items. The belt takes only those, one at a time in turn, from the crate, ledger, station output or Storage Shed behind it. Crates and stations don’t push onto a belt that pulls.',
  'A belt pointing into your Storage Shed puts what it carries into the bank. Hold a belt to see arrows round the shed: green in, blue out.',
  'R (or Shift+E) rotates the belt you aim at. A sorter sends its filter item straight and turns the rest right.',
  'A Splitter can be set: how many go straight, left and right (Out of every N), and chosen items sent a set way (they wait for it). Anything without a set way follows the ratio.',
  'A Merger takes from its back and both sides strictly in turn, so a full line shares evenly (a plain belt lets one input win). Switch sides off in its window.']];
helpKey = (f => function () { const r = f.apply(this, arguments); if (MODAL && MODAL.opts && MODAL.opts.belt) return r && r.startsWith('b:') ? r : 'belt'; return r; })(helpKey);
if (HELP.bank) HELP.bank[1].push('A Storage Shed on your farm joins the belt line: belts pointing into it fill the bank, belts pointing away that pull take from it.');

document.head.append(el('style', null, `
.bwpull { display: flex; align-items: center; gap: 6px; font-weight: 700; margin: 8px 0 0; cursor: pointer; }
.bwpull input { width: 18px; height: 18px; }
.bwcar { display: inline-flex; align-items: center; gap: 4px; }
.bwsplit, .bwroutes { display: flex; flex-direction: column; gap: 4px; margin: 4px 0; }
.bwrow { display: flex; align-items: center; gap: 6px; } .bwsplit .bwrow b { min-width: 96px; } .bwroutes .bwrow b { min-width: 120px; }
.bwn { min-width: 18px; text-align: center; font-weight: 700; }
`));
