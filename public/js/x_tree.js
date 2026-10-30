/* ================= Passive tree: the whole tree fits, plus a Life branch =================
   The tree tab is redrawn to fit its window (it used to cut off the bottom row). Below the
   start node grows a fourth branch, LIFE, for everyday play: energy, cheaper tool use, life-skill
   XP, bigger harvests, better prices and walking speed. Life nodes cost LIFE POINTS, which come
   from life-skill levels (one per 8 levels gained across all life skills), separate from the
   combat points. Taken life nodes are S.tree.life. Respec at the altar resets both. */

const LTREE = [
  ['l1', 0, 1, '+10 energy', { maxst: 10 }, 's'], ['l2', 0, 2, '+4% life-skill XP', { lxp: .04 }, 's'],
  ['l3', -1, 3, '+15 energy', { maxst: 15 }, 's'], ['l4', 1, 3, 'Tools use 5% less energy', { toolSave: .05 }, 's'],
  ['l5', 0, 4, 'Hardy', { maxst: 25, toolSave: .1 }, 'n', '+25 energy, tools use 10% less energy'],
  ['l6', -1, 5, '+4% life-skill XP', { lxp: .04 }, 's'], ['l7', 1, 5, '+4% move speed', { spd: .04 }, 's'],
  ['l8', 0, 6, 'Green Thumb', { harvestX: .12 }, 'n', '12% chance of an extra crop when you harvest'],
  ['l9', -2, 6, 'Haggler', { sell: .06 }, 'n', 'Everything sells for 6% more'], ['l10', 2, 6, 'Swift Feet', { spd: .06, maxst: 10 }, 'n', '+6% move speed, +10 energy'],
  ['l11', -1, 7, '+4% life-skill XP', { lxp: .04 }, 's'], ['l12', 1, 7, 'Tools use 5% less energy', { toolSave: .05 }, 's'],
  ['l13', 0, 8, 'Second Nature', { lxp: .2, maxhpPct: -.1 }, 'k', '+20% life-skill XP, but -10% max health'],
];
const LTREE_LINKS = [['root', 'l1'], ['l1', 'l2'], ['l2', 'l3'], ['l2', 'l4'], ['l3', 'l5'], ['l4', 'l5'], ['l5', 'l6'], ['l5', 'l7'], ['l6', 'l8'], ['l7', 'l8'], ['l6', 'l9'], ['l7', 'l10'], ['l8', 'l11'], ['l8', 'l12'], ['l11', 'l13'], ['l12', 'l13']];
const LNODE = Object.fromEntries(LTREE.map(n => [n[0], n]));
const ensureLifeTree = () => { if (S && S.tree && !S.tree.life) S.tree.life = []; };
const lifePointsEarned = () => Math.floor(LIFE.reduce((a, k) => a + Math.max(0, lifeL(k) - 1), 0) / 8);
const lifePoints = () => { ensureLifeTree(); return lifePointsEarned() - S.tree.life.length; };
const lifeStats = () => { ensureLifeTree(); const b = {}; for (const id of S.tree.life) for (const [k, v] of Object.entries(LNODE[id][4])) b[k] = (b[k] || 0) + v; return b; };
const lifeLinked = id => LTREE_LINKS.some(([a, b]) => (a === id && (b === 'root' || S.tree.life.includes(b))) || (b === id && (a === 'root' || S.tree.life.includes(a))));

/* effects */
const _recalcT = recalc;
recalc = function () { _recalcT(); if (!S || !PS || !S.tree) return; const L = lifeStats(); PS.life = L; PS.maxst += L.maxst || 0; PS.spd += L.spd || 0; if (L.maxhpPct) PS.maxhp = Math.round(PS.maxhp * (1 + L.maxhpPct)); };
const _useStaminaT = useStamina;
useStamina = function (n) { const k = PS && PS.life && PS.life.toolSave || 0; return _useStaminaT(n * (1 - Math.min(.5, k))); };
const _addXPT = addXP;
addXP = function (k, n) { const b = PS && PS.life && PS.life.lxp || 0; return _addXPT(k, n > 0 && LIFE.includes(k) ? n * (1 + b) : n); };
const _sellPriceT = sellPrice;
sellPrice = function (id) { const p = _sellPriceT(id), b = PS && PS.life && PS.life.sell || 0; return p && b ? Math.round(p * (1 + b)) : p; };
const _harvestT = harvest;
harvest = function (m, tx, ty) {
  const s = m.soil[ty * m.w + tx], k = s && s.crop && s.crop.k, C = k && CROPS[k];
  _harvestT(m, tx, ty);
  const b = PS && PS.life && PS.life.harvestX || 0; if (C && !C.as && b && Math.random() < b) { give(k, 1); floatText((tx + .5) * 16, ty * 16 - 6, '+1', '#9ad84a'); }
};

/* drawing */
renderTree = function (b) {
  ensureCombat(); ensureLifeTree();
  const pts = treePoints(), lp = lifePoints(), spent = S.tree.taken.length - 1 + S.tree.life.length;
  b.append(el('div', { class: 'acts wrap' }, el('b', null, pts + ' combat point' + (pts === 1 ? '' : 's')), el('b', { style: 'color:#3a8a6a' }, lp + ' life point' + (lp === 1 ? '' : 's')),
    el('small', { class: 'note' }, 'Combat points: one per combat level above 3. Life points: one per 8 life-skill levels. Click a node next to one you have.'), el('span', { style: 'flex:1' }),
    el('button', { class: 'btn ghost' + (nearAltar() ? '' : ' off'), on: () => { const cost = spent * 250; if (!nearAltar()) { toast('Respec at the village altar.', 'bad'); return; } if (S.gold < cost) { toast('Respec costs ' + cost + 'g.', 'bad'); return; } S.gold -= cost; S.tree.taken = ['root']; S.tree.life = []; S.abil = ['cleave', 'lunge', 'guard']; recalc(); refresh(); } }, 'Respec (' + spent * 250 + 'g, at the altar)')));
  const all = PTREE.concat(LTREE), links = PTREE_LINKS.concat(LTREE_LINKS), node = id => PNODE[id] || LNODE[id];
  const xs = all.map(n => n[1]), ys = all.map(n => n[2]), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const W = 1200, H = 760, pad = 46, sc = Math.min((W - pad * 2) / (maxX - minX), (H - pad * 2) / (maxY - minY)), ox = W / 2 - (minX + maxX) / 2 * sc, oy = H / 2 - (minY + maxY) / 2 * sc;
  const c = el('canvas', { width: W, height: H, class: 'treecv' }), x = c.getContext('2d');
  const P = n => [ox + n[1] * sc, oy + n[2] * sc], isL = n => n[0][0] === 'l', has = n => isL(n) ? S.tree.life.includes(n[0]) : S.tree.taken.includes(n[0]);
  const col = n => n[0][0] === 'm' ? '#d8543a' : n[0][0] === 'p' ? '#5aa040' : n[0][0] === 'a' ? '#4a7ad8' : n[0][0] === 'l' ? '#3ab89a' : '#e8c040';
  const can = n => !has(n) && (isL(n) ? lifeLinked(n[0]) && lp > 0 : linked(n[0]) && pts > 0);
  x.fillStyle = '#1e1814'; x.fillRect(0, 0, W, H);
  // drawn in 3 px blocks: stepped links, pixel discs and diamonds (no smooth vector shapes)
  const Q = 3, sn = v => Math.floor(v / Q) * Q, blk = (px, py, n = 1) => x.fillRect(sn(px) - Math.floor(n / 2) * Q, sn(py) - Math.floor(n / 2) * Q, Q * n, Q * n);
  const shape = (px, py, r, dia) => { for (let yy = -r; yy <= r; yy += Q) { const w = dia ? r - Math.abs(yy) : Math.sqrt(Math.max(0, r * r - yy * yy)); x.fillRect(sn(px - w), sn(py + yy), Math.max(Q, sn(px + w) - sn(px - w) + Q), Q); } };
  for (const [a, bb] of links) {
    const A = node(a), B = node(bb), on = (a === 'root' || has(A)) && has(B), [x0, y0] = P(A), [x1, y1] = P(B), n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / Q);
    x.fillStyle = on ? '#e8c07a' : '#4a3a2e'; for (let i = 0; i <= n; i++) blk(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, on ? 2 : 1);
  }
  for (const n of all) {
    const [px, py] = P(n), r = n[5] === 'k' ? 15 : n[5] === 'n' || n[5] === 'a' ? 12 : n[5] === 'r' ? 14 : 9, on = n[0] === 'root' || has(n), ok = can(n), dia = n[5] === 'k' || n[5] === 'a';
    x.fillStyle = on ? '#fff0c0' : ok ? '#e8c07a' : '#5a4a3a'; shape(px, py, r + (n[5] === 'k' ? 6 : 3), dia);
    x.fillStyle = on ? col(n) : ok ? '#6a5a48' : '#3a2e26'; shape(px, py, r, dia);
    if (on) { x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(sn(px - r / 2), sn(py - r / 2), Q * 2, Q); }
  }
  x.font = '600 15px Fredoka'; x.fillStyle = '#e8d8b8'; x.textAlign = 'center';
  x.fillText('MIGHT', ox + (minX + 1) * sc, oy - .6 * sc); x.fillText('PRECISION', ox + (maxX - 1) * sc, oy - .6 * sc); x.fillText('ARCANA', ox, oy + minY * sc - 22); x.fillStyle = '#7ad8b8'; x.fillText('LIFE', ox + 2.2 * sc, oy + maxY * sc + 4);
  const at = ev => { const rr = c.getBoundingClientRect(), mx = (ev.clientX - rr.left) * W / rr.width, my = (ev.clientY - rr.top) * H / rr.height; return all.find(n => Math.hypot(P(n)[0] - mx, P(n)[1] - my) < 16); };
  c.onmousemove = ev => { const n = at(ev); if (!n) return hideTip(); let t = $('#tip'); if (!t) { t = el('div', { id: 'tip' }); document.body.append(t); } t.innerHTML = ''; t.append(el('b', null, n[3]), el('div', null, n[6] || ({ s: isL(n) ? 'Small life passive' : 'Small passive', n: 'Notable', k: 'Keystone', a: 'Ability', r: 'Your starting point' })[n[5]])); t.hidden = false; t.style.left = (ev.clientX + 14) + 'px'; t.style.top = (ev.clientY + 14) + 'px'; };
  c.onmouseleave = hideTip;
  c.onclick = ev => {
    const n = at(ev); if (!n || n[0] === 'root' || has(n)) return;
    if (isL(n)) { if (!lifeLinked(n[0])) { toast('Take a connected node first.', 'bad'); return; } if (lifePoints() <= 0) { toast('No life points left. Level up your life skills.', 'bad'); return; } S.tree.life.push(n[0]); }
    else { if (!linked(n[0])) { toast('Take a connected node first.', 'bad'); return; } if (treePoints() <= 0) { toast('No combat points left. Gain combat levels.', 'bad'); return; } S.tree.taken.push(n[0]); }
    SFX.ok(); recalc(); refresh();
  };
  b.append(c);
  const pool = typeof abilPoolX === 'function' ? abilPoolX() : abilPool(), row = el('div', { class: 'acts wrap' }, el('b', null, 'Ability slots: '));
  ['Z', 'X', 'C'].forEach((key, i) => { const s = el('select'); for (const id of pool) { const o = el('option', { value: id }, ABIL[id].n); if (S.abil[i] === id) o.selected = true; s.append(o); } s.onchange = () => { S.abil[i] = s.value; hudKey = ''; }; row.append(el('span', null, key + ' '), s); });
  b.append(row);
};
