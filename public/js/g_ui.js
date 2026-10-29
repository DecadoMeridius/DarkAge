/* ================= UI ================= */
function el(tag, a, ...kids) { const e = document.createElement(tag); if (a) for (const k in a) { if (k === 'class') e.className = a[k]; else if (k === 'on') e.onclick = a[k]; else if (k === 'style') e.style.cssText = a[k]; else if (k === 'html') e.innerHTML = a[k]; else e.setAttribute(k, a[k]); } for (const c of kids) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); return e; }
const icon = (id, s = 28, q) => el('img', { src: iconURL(id, q), class: 'ic', style: `width:${s}px;height:${s}px` });
function sellPrice(id) {
  const it = IT[id]; if (!it) return 0; let p = it.p;
  if (['seed', 'weapon', 'armor', 'place', 'feed', 'sapling', 'ring', 'fert', 'ammo'].includes(it.t)) return Math.floor(p / 2);
  if (it.t === 'special') return 0;
  if (it.t === 'crop' && hasPerk('tiller')) p *= 1.1; if (it.t === 'artisan' && hasPerk('artisan')) p *= 1.15; if (it.t === 'animal' && hasPerk('shepherd')) p *= 1.1; // Phase 9: perks are modest
  if (it.t === 'fish' && hasPerk('angler')) p *= 1.1; if (it.t === 'bar' && hasPerk('blacksmith')) p *= 1.2; if (it.t === 'food' && hasPerk('gourmet')) p *= 1.2;
  return Math.round(p);
}
const valK = k => { const [id, q] = parseK(k); return Math.round(sellPrice(id) * QMULT[q]); };
const fmtTime = t => { t = Math.floor(t) % 1440; let h = Math.floor(t / 60), m = Math.floor(t % 60 / 10) * 10, ap = h >= 12 && h < 24 ? 'pm' : 'am'; h = h % 12 || 12; return h + ':' + String(m).padStart(2, '0') + ' ' + ap; };
function toast(msg, kind) { const t = el('div', { class: 'toast ' + (kind || '') }, msg); const box = $('#toasts'); box.append(t); while (box.children.length > 4) box.firstChild.remove(); setTimeout(() => { t.style.opacity = 0; setTimeout(() => t.remove(), 400); }, 3000); }
let bannerT = 0; function showBanner(txt) { const b = $('#banner'); b.textContent = txt; b.classList.add('on'); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove('on'), 1800); }
/* ---- modal ---- */
let MODAL = null;
function openModal(title, tabs, start, opts) { PAUSED = true; INPUT.x = INPUT.y = 0; MODAL = { title, tabs, cur: start || tabs[0].id, opts: opts || {} }; $('#modal').hidden = false; drawModal(); $('#mbody').scrollTop = 0; }
function drawModal() {
  if (!MODAL) return; $('#mtitle').textContent = MODAL.title; const tb = $('#mtabs'); tb.innerHTML = '';
  if (MODAL.tabs.length > 1) MODAL.tabs.forEach(t => tb.append(el('button', { class: 'tab' + (t.id === MODAL.cur ? ' on' : ''), on: () => { if (MODAL.lock) return; MODAL.cur = t.id; MODAL.opts.sel = null; drawModal(); $('#mbody').scrollTop = 0; } }, t.label)));
  tb.style.display = MODAL.tabs.length > 1 ? 'flex' : 'none';
  const b = $('#mbody'); b.innerHTML = ''; MODAL.tabs.find(t => t.id === MODAL.cur).render(b); $('#mgold').textContent = S.gold.toLocaleString() + 'g';
}
function refresh() { const b = $('#mbody'), st = b.scrollTop; drawModal(); b.scrollTop = st; }
function closeModal() { if (MODAL && MODAL.lock) return; $('#modal').hidden = true; const cb = MODAL && MODAL.opts.onClose; MODAL = null; PAUSED = false; if (cb) cb(); }
window.__back = () => { if (!$('#title').hidden) return; if (MODAL) closeModal(); else if (fishing) { fishing = null; showFishUI(false); } else openMenu('bag'); };
/* ---- main menu ---- */
function openMenu(tab, station, focus) {
  openModal('Satchel', [{ id: 'bag', label: 'Items', render: renderBag }, { id: 'craft', label: 'Crafting', render: renderCraft }, { id: 'skills', label: 'Skills', render: renderSkills }, { id: 'animals', label: 'Animals', render: renderAnimals },
  { id: 'friends', label: 'Friends', render: renderFriends }, { id: 'family', label: 'Family', render: b => renderFamily(b) }, { id: 'coll', label: 'Collections', render: renderColl }, { id: 'map', label: 'Map', render: renderMap }, { id: 'quests', label: 'Quests', render: renderQuests }, { id: 'opts', label: 'Options', render: renderOpts }], tab, { st: station || 'all', focus });
}
const TORD = ['weapon', 'armor', 'ring', 'food', 'seed', 'sapling', 'fert', 'crop', 'fruit', 'fish', 'animal', 'artisan', 'forage', 'feed', 'place', 'bar', 'ore', 'gem', 'mat', 'loot', 'artifact', 'ammo', 'special'];
const sortedInv = () => Object.keys(S.inv).filter(k => S.inv[k] > 0 && IT[parseK(k)[0]]).sort((a, b) => { const A = IT[parseK(a)[0]], B = IT[parseK(b)[0]]; return TORD.indexOf(A.t) - TORD.indexOf(B.t) || A.n.localeCompare(B.n) || parseK(a)[1] - parseK(b)[1]; });
function itemDesc(id) {
  const it = IT[id]; let d = [];
  if (sellPrice(id)) d.push('Sells for ' + sellPrice(id) + 'g.');
  if (it.eat) d.push('Restores ' + it.eat[0] + ' health and ' + it.eat[1] + ' energy.');
  if (it.buff) d.push('Buff: ' + Object.entries(it.buff).filter(([k]) => k !== 'dur').map(([k, v]) => ({ atk: '+' + v + ' attack', def: '+' + v + ' defense', spd: '+' + Math.round(v * 100) + '% speed', luck: '+' + v + ' luck', regen: 'regeneration', mine: 'better mining', fish: 'easier fishing', crit: '+' + Math.round(v * 100) + '% crit', maxhp: '+' + v + ' max health', fireres: 'fire immunity' }[k])).join(', ') + '.');
  if (it.wt) d.push(WTYPE[it.wt].n + '. Attack ' + it.atk + ', ' + (it.cd < .25 ? 'very fast' : it.cd < .35 ? 'fast' : it.cd < .45 ? 'steady' : 'slow') + (it.wt === 'spear' ? ', long reach' : it.wt === 'hammer' ? ', heavy knockback and stun' : it.wt === 'dagger' ? ', huge crits' : it.wt === 'bow' ? ', fires arrows' : '') + (it.tier === 'frost' ? ', chills enemies' : it.tier === 'obsidian' || it.tier === 'dragon' ? ', burns enemies' : '') + '.');
  if (it.def) d.push('Defense ' + it.def + (it.block ? ', ' + Math.round(it.block * 100) + '% block chance' : '') + '.');
  if (it.tier && SETB[it.tier] && it.slot !== 'weapon' && it.slot !== 'shield') d.push('Full ' + TIERS.find(t => t[0] === it.tier)[1] + ' set: ' + SETB[it.tier][0] + '.');
  if (it.desc) d.push(it.desc + '.');
  if (it.crop) { const C = CROPS[it.crop]; d.push('Grows in ' + C.d + ' days during ' + C.s.map(q => SEASONS[q]).join(', ') + (C.re ? '. Regrows every ' + C.re + ' days.' : '.') + (C.y > 1 ? ' Up to ' + C.y + ' per harvest.' : '')); }
  if (it.tree) d.push('Bears fruit in ' + FTREES[it.tree][1].map(q => SEASONS[q]).join(', ') + ' once grown (14 days).');
  if (it.fish) d.push((it.fish.legend ? 'Legendary. ' : '') + 'Found in ' + it.fish.loc.join(', ') + ', ' + it.fish.s.map(q => SEASONS[q]).join('/') + (it.fish.time !== 'any' ? ', ' + (it.fish.time === 'rain' ? 'when raining' : 'at ' + it.fish.time) : '') + '.');
  if (it.t === 'fert') d.push({ compost: 'Better crop quality.', growth_tonic: 'Crops grow about 25% faster.', rich_compost: 'Much better quality, a chance of Ember quality.' }[id]);
  if (it.t === 'artifact') d.push('Donate it to the museum.'); if (id === 'treasure_map') d.push('Read it to reveal a dig site in the Wilds.'); if (id === 'golden_oats') d.push('Feed to a horse from the Animals tab: +1 to 3 to a random stat.');
  if (id === 'ember_shard') d.push('Bring shards to the altar in the village square.'); if (id === 'staircase') d.push('Use in the mines to drop a floor.'); if (id === 'warp_totem') d.push('Instantly return to your farm.');
  return d.join(' ');
}
function renderBag(b) {
  const wrap = el('div', { class: 'bagwrap' }), eq = el('div', { class: 'eqcol' });
  [['weapon', 'Weapon'], ['helm', 'Head'], ['body', 'Body'], ['boots', 'Feet'], ['shield', 'Shield'], ['ring1', 'Ring'], ['ring2', 'Ring']].forEach(([s, n]) => { const id = S.eq[s]; eq.append(el('button', { class: 'eq f-slot', title: n, on: () => { if (id && s !== 'weapon') { unequip(s); refresh(); } } }, id ? icon(id, 30) : el('span', { class: 'empty' }, n))); });
  const st = el('div', { class: 'eqstat' }, el('div', null, '⚔ ', el('b', null, Math.round(PS.atk * (1 + PS.dmg)))), el('div', null, '🛡 ', el('b', null, Math.round(PS.def))), el('div', null, '✦ ', el('b', null, Math.round(PS.crit * 100) + '%')), el('div', null, '♥ ', el('b', null, Math.round(S.p.hp) + '/' + maxHP())), PS.set ? el('div', { class: 'setb' }, SETB[PS.set][0]) : null);
  eq.append(st); wrap.append(eq);
  const right = el('div', { class: 'bagright' }), ks = sortedInv(), sel = MODAL.opts.sel;
  if (sel && S.inv[sel]) {
    const [id, q] = parseK(sel), it = IT[id], acts = el('div', { class: 'acts wrap' });
    if (MODAL.opts.giftTo) acts.append(el('button', { class: 'btn', on: () => { const who = MODAL.opts.giftTo; if (giftTo(who, sel)) { closeModal(); } } }, 'Give to ' + NPCS[MODAL.opts.giftTo].n));
    else {
      if (it.eat) acts.append(el('button', { class: 'btn', on: () => { eat(id); refresh(); } }, 'Eat'));
      if (it.slot) acts.append(el('button', { class: 'btn', on: () => { equip(id); MODAL.opts.sel = null; refresh(); } }, 'Equip'));
      if (id === 'treasure_map') acts.append(el('button', { class: 'btn', on: () => { readMap(); refresh(); } }, 'Read'));
      if (id === 'warp_totem') acts.append(el('button', { class: 'btn', on: () => { closeModal(); useItem(id); } }, 'Use'));
      if (!it.slot) { const hb = el('div', { class: 'hbset' }, el('small', null, 'Hotbar ')); [6, 7, 8, 9].forEach(i => hb.append(el('button', { class: 'chip' + (S.hot[i] === id ? ' on' : ''), on: () => { S.hot = S.hot.map(h => h === id ? null : h); S.hot[i] = id; S.sel = i; hudKey = ''; refresh(); } }, String(i === 9 ? 0 : i + 1)))); acts.append(hb); }
    }
    right.append(el('div', { class: 'detail f-panel' }, icon(id, 40, q), el('div', { class: 'dtxt' }, el('b', null, (q ? QNAME[q] + ' ' : '') + it.n + ' ×' + S.inv[sel]), el('div', null, itemDesc(id) + (q ? ' Quality ×' + QMULT[q] + '.' : ''))), acts));
  } else right.append(el('p', { class: 'note' }, MODAL.opts.giftTo ? 'Pick a gift for ' + NPCS[MODAL.opts.giftTo].n + '.' : ks.length ? 'Tap an item for details. Assign seeds, food and placeables to hotbar slots 7 to 0.' : 'Your bag is empty. Chop, mine, fish and forage to fill it.'));
  const grid = el('div', { class: 'grid' });
  ks.forEach(k => { const [id, q] = parseK(k); grid.append(el('button', { class: 'cell f-slot' + (k === sel ? ' on' : ''), on: () => { MODAL.opts.sel = k; refresh(); } }, icon(id, 32, q), el('b', null, S.inv[k] > 999 ? '999+' : S.inv[k]))); });
  right.append(grid); wrap.append(right); b.append(wrap);
}
function stationNear(st) {
  if (st === 'bench') return true; const m = cur, near = (x, y, r) => dist(S.p.x, S.p.y, (x + .5) * 16, (y + .5) * 16) < r * 16;
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue; if ((st === 'forge' && o.k === 'forge') || (st === 'kitchen' && o.k === 'campfire')) if (near(i % m.w, (i / m.w) | 0, 2.8)) return true; }
  for (const b of m.bld) if (near(b.door.x, b.door.y, 2.8) && ((st === 'forge' && b.act === 'smith') || (st === 'kitchen' && (b.act === 'house' || b.act === 'tavern')))) return true;
  return !!(MODAL && MODAL.opts.station === st);
}
function canCraft(r, n = 1) { if (r[4] && S.sk[r[4][0]].l < r[4][1]) return 'Needs ' + SKN[r[4][0]] + ' ' + r[4][1]; if (!stationNear(r[3])) return 'Needs a ' + STATION_N[r[3]].toLowerCase(); for (const k in r[2]) if (needHave(k) < r[2][k] * n) return 'Missing materials'; return ''; }
function doCraft(r, n = 1) {
  for (let i = 0; i < n; i++) {
    if (canCraft(r)) return; for (const k in r[2]) { let c = r[2][k]; if (r[3] === 'forge' && IT[k] && IT[k].t === 'bar' && hasPerk('efficient') && Math.random() < .2) c = Math.max(0, c - 1); if (k[0] === '$') catTake(k, c); else take(k, c); }
    let out = r[1]; if (IT[r[0]].t === 'bar' && hasPerk('alloyist') && Math.random() < .25) out++;
    give(r[0], out, 0, true); S.stats.crafted++; if (IT[r[0]].t === 'weapon' || IT[r[0]].t === 'armor') S.stats.forged[r[0]] = 1;
    if (r[3] === 'forge') addXP('smithing', 6 + Math.round(IT[r[0]].p / 40)); else if (r[3] === 'kitchen') addXP('cooking', 6 + Math.round(IT[r[0]].p / 40)); else addXP('foraging', 2);
  }
  toast('Crafted ' + IT[r[0]].n + (r[1] * n > 1 ? ' ×' + r[1] * n : '') + '.'); SFX.ok();
}
function renderCraft(b) {
  const st = MODAL.opts.st || 'all', bar = el('div', { class: 'chips' });
  [['all', 'All'], ['bench', 'Workbench'], ['forge', 'Forge'], ['kitchen', 'Kitchen']].forEach(([k, n]) => bar.append(el('button', { class: 'chip' + (st === k ? ' on' : ''), on: () => { MODAL.opts.st = k; refresh(); } }, n + (k === 'forge' || k === 'kitchen' ? (stationNear(k) ? ' ✓' : '') : ''))));
  const ready = el('button', { class: 'chip' + (MODAL.opts.ready ? ' on' : ''), on: () => { MODAL.opts.ready = !MODAL.opts.ready; refresh(); } }, 'Can make'); bar.append(ready); b.append(bar);
  if ((st === 'forge' || st === 'kitchen') && !stationNear(st)) b.append(el('p', { class: 'note' }, st === 'forge' ? 'Smith at the village smithy or a forge you built.' : 'Cook at home, at the tavern or beside a campfire.'));
  const list = el('div', { class: 'list' });
  RC.filter(r => (st === 'all' || r[3] === st) && (!MODAL.opts.ready || !canCraft(r))).forEach(r => {
    const why = canCraft(r), needs = el('div', { class: 'needs' });
    for (const k in r[2]) { const have = needHave(k), n = r[2][k]; needs.append(el('span', { class: 'need' + (have >= n ? '' : ' no') }, icon(k[0] === '$' ? CATI[k] : k, 18), (k[0] === '$' ? CATN[k] : IT[k].n) + ' ' + have + '/' + n)); }
    const acts = el('div', { class: 'acts' }, el('button', { class: 'btn' + (why ? ' off' : ''), on: () => { doCraft(r); refresh(); } }, 'Make'));
    if (!canCraft(r, 5) && (IT[r[0]].t === 'bar' || IT[r[0]].t === 'ammo' || IT[r[0]].t === 'fert' || r[3] === 'kitchen')) acts.append(el('button', { class: 'btn ghost', on: () => { doCraft(r, 5); refresh(); } }, '×5'));
    list.append(el('div', { class: 'rrow' + (why ? ' dim' : '') }, icon(r[0], 32), el('div', { class: 'rtxt' }, el('b', null, IT[r[0]].n + (r[1] > 1 ? ' ×' + r[1] : '')), needs, why && why !== 'Missing materials' ? el('small', { class: 'why' }, why) : el('small', null, itemDesc(r[0]).split('. ').slice(1, 2).join(''))), acts));
  });
  b.append(list);
}
function renderSkills(b) {
  const list = el('div', { class: 'list' });
  SK.forEach(k => { const s = S.sk[k], need = xpNeed(s.l), perks = PERKS[k].flat().filter(p => S.perks[p[0]]);
    list.append(el('div', { class: 'srow' }, el('div', { class: 'slv' }, s.l), el('div', { class: 'rtxt' }, el('b', null, SKN[k]), el('div', { class: 'sbar' }, el('i', { style: 'width:' + (s.l >= 10 ? 100 : s.xp / need * 100) + '%' })), el('small', null, s.l >= 10 ? 'Mastered.' : (need - Math.floor(s.xp)) + ' xp to level ' + (s.l + 1) + '. Perk choices at levels 5 and 10.'), perks.length ? el('div', { class: 'perks' }, ...perks.map(p => el('span', { class: 'perk' }, p[1] + ': ' + p[2]))) : null))); });
  b.append(list);
}
function geneBar(n, v) { return el('div', { class: 'hs' }, el('span', null, n), el('div', { class: 'sbar' }, el('i', { style: 'width:' + v + '%' })), el('b', { class: 'gr g' + grade(v) }, grade(v))); }
function animalCard(a, acts) {
  const A = ANIMAL[a.sp], adult = a.age >= A.adult, spr = animalSpr(a.sp, a.coat, 0), pic = el('canvas', { width: spr.width, height: spr.height, class: 'apic' }); pic.getContext('2d').drawImage(spr, 0, 0);
  const info = el('div', { class: 'rtxt' }, el('b', null, a.name + ' ' + (a.sex === 'F' ? '♀' : '♂') + (a.sp === 'horse' ? '  ·  Rating ' + horseRating(a) : '  ·  Score ' + animalScore(a))), el('small', null, A.n + ', ' + a.coat + (adult ? '' : ', young (grown in ' + (A.adult - a.age) + ' days)') + (a.preg ? ', expecting in ' + a.preg + ' days' : '') + '.'), el('span', { class: 'hearts' }, '♥'.repeat(Math.round(a.aff / 20)) + '♡'.repeat(5 - Math.round(a.aff / 20))));
  const gs = el('div', { class: 'hstats' }); A.genes.forEach(k => gs.append(geneBar(GENES[k], a.g[k]))); info.append(gs);
  if (a.traits.length) info.append(el('div', { class: 'perks' }, ...a.traits.map(t => el('span', { class: 'perk trait' }, TRAITS[t][0] + ': ' + TRAITS[t][1]))));
  return el('div', { class: 'rrow' + (MODAL.opts.focus === a.id ? ' hl' : '') }, pic, info, acts);
}
function renderAnimals(b) {
  b.append(el('p', { class: 'note' }, `Coop ${countIn('coop')}/${capFor('chicken')}, barn ${countIn('barn')}/${capFor('cow')}, stable ${countIn('stable')}/${capFor('horse')}. Pet animals daily. In winter they eat hay from the silo (${S.silo}) or your bag (${cnt('hay')}). Genes are graded S to D; offspring average their parents plus luck.`));
  const breedA = MODAL.opts.breedA ? S.animals.find(a => a.id === MODAL.opts.breedA) : null;
  if (breedA) b.append(el('div', { class: 'detail f-panel' }, el('div', { class: 'dtxt' }, el('b', null, 'Choose a mate for ' + breedA.name), el('div', null, 'Mates must be grown, of the opposite sex, have two hearts of affection and not have bred today. Higher fertility means better odds and bigger litters.')), el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => { MODAL.opts.breedA = null; refresh(); } }, 'Cancel'))));
  if (!S.animals.length) b.append(el('p', { class: 'note' }, 'No animals yet. Odile sells chickens, ducks, rabbits, goats, sheep, cows, pigs and horses in the village.'));
  const list = el('div', { class: 'list' }), today = dayIndex();
  const fil = MODAL.opts.sp || 'all', chips = el('div', { class: 'chips' }); ['all', ...Object.keys(ANIMAL)].forEach(sp => { if (sp !== 'all' && !S.animals.some(a => a.sp === sp)) return; chips.append(el('button', { class: 'chip' + (fil === sp ? ' on' : ''), on: () => { MODAL.opts.sp = sp; refresh(); } }, sp === 'all' ? 'All' : ANIMAL[sp].n)); }); if (S.animals.length) b.append(chips);
  const ok = x => x.age >= ANIMAL[x.sp].adult && x.aff >= 40 && !x.preg && x.bred !== today;
  S.animals.filter(a => fil === 'all' || a.sp === fil).sort((x, y) => x.sp.localeCompare(y.sp) || animalScore(y) - animalScore(x)).forEach(a => {
    const acts = el('div', { class: 'acts col' }), adult = a.age >= ANIMAL[a.sp].adult;
    if (breedA) { if (a.sp === breedA.sp && a.sex !== breedA.sex && ok(a)) acts.append(el('button', { class: 'btn', on: () => { tryBreed(breedA, a); MODAL.opts.breedA = null; refresh(); } }, 'Pair')); }
    else {
      if (a.sp === 'horse' && adult) acts.append(el('button', { class: 'btn' + (S.rideId === a.id ? ' on' : ''), on: () => { S.rideId = a.id; S.mounted = false; refresh(); } }, S.rideId === a.id ? 'Riding' : 'Ride'));
      if (a.sp === 'horse' && has('golden_oats') && !a.oats) acts.append(el('button', { class: 'btn ghost', on: () => { take('golden_oats'); a.oats = 1; const k = pickR(['spd', 'sta', 'str', 'agi']), n = ri(1, 3); a.g[k] = Math.min(100, a.g[k] + n); toast(a.name + ' gains +' + n + ' ' + GENES[k] + '.'); SFX.ok(); refresh(); } }, 'Oats'));
      const canB = ok(a) && S.animals.some(o => o.sp === a.sp && o.sex !== a.sex && ok(o)) && countIn(ANIMAL[a.sp].house) < capFor(a.sp);
      acts.append(el('button', { class: 'btn ghost' + (canB ? '' : ' off'), on: () => { if (!canB) { toast(!adult ? 'Too young.' : a.preg ? 'Already expecting.' : countIn(ANIMAL[a.sp].house) >= capFor(a.sp) ? 'No room. Upgrade the building at Hale\'s.' : 'Needs two hearts, a willing mate, and rest since last time.'); return; } MODAL.opts.breedA = a.id; refresh(); } }, 'Breed'));
      const val = animalValue(a); acts.append(el('button', { class: 'btn ghost', on: () => { if (MODAL.opts.sell !== a.id) { MODAL.opts.sell = a.id; refresh(); return; } S.animals = S.animals.filter(o => o !== a); if (S.rideId === a.id) { S.rideId = null; S.mounted = false; } S.gold += val; SFX.coin(); MODAL.opts.sell = null; refresh(); } }, MODAL.opts.sell === a.id ? 'Sell ' + val + 'g?' : 'Sell'));
    }
    list.append(animalCard(a, acts));
  });
  b.append(list);
}
function animalValue(a) { const s = animalScore(a); return a.sp === 'horse' ? Math.round(400 + s * s * 1.4 + a.traits.length * 2000) : Math.round(ANIMAL[a.sp].price * .5 * (1 + s / 100) + a.traits.length * 600); }
function renderFriends(b) {
  const list = el('div', { class: 'list' });
  for (const id in NPCS) { const N = NPCS[id], f = fr(id), h = hearts(id), spr = humanSpr('npc' + id, N.P, 0, 0), c = el('canvas', { width: spr.width, height: spr.height, class: 'portrait' }); c.getContext('2d').drawImage(spr, 0, 0);
    list.append(el('div', { class: 'rrow' }, c, el('div', { class: 'rtxt' }, el('b', null, N.n + ', ' + N.role), el('span', { class: 'hearts big' }, '♥'.repeat(h) + '♡'.repeat(10 - h)), el('small', null, (f.g === dayIndex() ? 'Gift given today. ' : 'Can receive a gift today. ') + (h >= 3 ? 'Loves ' + N.love.map(k => IT[k] ? IT[k].n : k).join(', ') + '.' : 'Reach 3 hearts to learn what they love.')), el('small', null, 'Heart gifts at 3, 6 and 9: ' + N.gifts.map(([lv, it, q]) => (f.rew[lv] ? '✓ ' : '') + (q > 1 ? q + ' ' : '') + IT[it].n).join(', ') + '.')))); }
  b.append(el('p', { class: 'note' }, 'Talk to villagers every day and give gifts by tapping "Give a gift" in their shop. Loved gifts are worth four times a neutral one.'), list);
}
function renderColl(b) {
  const tab = MODAL.opts.ct || 'museum', chips = el('div', { class: 'chips' }); [['museum', 'Museum'], ['fish', 'Fish'], ['crops', 'Shipped'], ['pages', 'Lost pages'], ['secrets', 'Secrets']].forEach(([k, n]) => chips.append(el('button', { class: 'chip' + (tab === k ? ' on' : ''), on: () => { MODAL.opts.ct = k; refresh(); } }, n))); b.append(chips);
  const grid = el('div', { class: 'grid big' }), cell = (id, got, sub) => el('div', { class: 'cell f-slot' + (got ? '' : ' locked'), title: IT[id].n }, icon(id, 32), sub ? el('b', null, sub) : null);
  if (tab === 'museum') { b.append(el('p', { class: 'note' }, Object.keys(S.museum).length + ' of ' + (ARTIFACTS.length + MINERALS.length) + ' donated. Bring artifacts and minerals to Elias.')); ARTIFACTS.forEach(a => grid.append(cell(a[0], S.museum[a[0]]))); MINERALS.forEach(k => grid.append(cell(k, S.museum[k]))); }
  if (tab === 'fish') { b.append(el('p', { class: 'note' }, Object.keys(S.stats.caught).length + ' of ' + FISH.length + ' species caught.')); FISH.forEach(f => grid.append(cell(f[0], S.stats.caught[f[0]], S.stats.caught[f[0]] || ''))); }
  if (tab === 'crops') { const ids = Object.keys(CROPS).concat(Object.keys(FTREES)); b.append(el('p', { class: 'note' }, ids.filter(k => S.stats.shipped[k]).length + ' of ' + ids.length + ' crops and fruits shipped.')); ids.forEach(k => grid.append(cell(k, S.stats.shipped[k], S.stats.shipped[k] || ''))); }
  if (tab === 'pages') { b.append(el('p', { class: 'note' }, Object.keys(S.pages).length + ' of ' + PAGES.length + ' lost pages found. They hide across the Wilds, in caves and by old ruins.')); const L = el('div', { class: 'list' }); PAGES.forEach((t, i) => L.append(el('div', { class: 'rrow page' + (S.pages[i] ? '' : ' dim') }, el('div', { class: 'qck' }, i + 1), el('div', { class: 'rtxt' }, S.pages[i] ? el('i', null, t) : el('small', null, 'Not found yet.'))))); b.append(L); return; }
  if (tab === 'secrets') { const L = el('div', { class: 'list' }); const row = (n, d, done) => L.append(el('div', { class: 'rrow' + (done ? ' done' : '') }, el('div', { class: 'qck' }, done ? '✓' : '?'), el('div', { class: 'rtxt' }, el('b', null, n), el('small', null, d))));
    row('Ember shards', S.shardsTotal + ' of 30 found, ' + S.shardsGiven + ' offered at the altar.', S.shardsTotal >= 30); for (const k in SHRINES) row(SHRINES[k].n, S.shrines[k] ? 'Restored. ' + SHRINES[k].desc + '.' : 'Somewhere in ' + BIONAME[k] + '.', S.shrines[k]);
    row('Hidden caves', ['forest', 'highlands', 'frost', 'ash'].filter(k => S.flags['c_cave_' + k]).length + ' of 4 cave treasures claimed.', ['forest', 'highlands', 'frost', 'ash'].every(k => S.flags['c_cave_' + k]));
    row('The Secret Grove', S.flags.c_grove ? 'Found.' : 'Grandmother hid something in Whisperwood.', S.flags.c_grove); row('The squire\'s chest', S.flags.b_ruins ? 'Dug up.' : 'Buried near the ruins, they say.', S.flags.b_ruins); row('The fairy ring', S.flags.sh_fairy ? 'Visited by moonlight.' : 'Only comes alive at night.', S.flags.sh_fairy);
    for (const k in WBOSS) row(EN[WBOSS[k]].n, S.bosses[WBOSS[k]] ? 'Defeated ' + S.bosses[WBOSS[k]] + '×. Returns weekly.' : 'Rules ' + BIONAME[k] + '.', S.bosses[WBOSS[k]]);
    for (const n in MINE_BOSS) row(EN[MINE_BOSS[n]].n, S.bosses[MINE_BOSS[n]] ? 'Defeated.' : 'Waits on mine floor ' + n + '.', S.bosses[MINE_BOSS[n]]);
    b.append(L); return; }
  b.append(grid);
}
function renderMap(b) {
  const c = worldMapCanvas(); c.className = 'wmap'; const box = el('div', { class: 'mapbox' }, c);
  b.append(el('p', { class: 'note' }, 'Explored ' + explorePct() + '% of the Wilds. ☠ boss  ✦ shrine  ⛏ mine  ◘ cave  ⌂ hut  ⚓ wreck  ♜ ruins  ✿ fairy ring  ★ meteor  ✕ treasure'), box);
  setTimeout(() => { if (cur.id === 'wilds') { box.scrollLeft = S.p.x / 16 * 3 * (c.clientWidth / c.width) - box.clientWidth / 2; box.scrollTop = S.p.y / 16 * 3 * (c.clientHeight / c.height) - box.clientHeight / 2; } else { box.scrollLeft = (80 * 3) - box.clientWidth / 2; box.scrollTop = box.scrollHeight; } }, 0);
}
function renderQuests(b) {
  const list = el('div', { class: 'list' });
  if (S.board) list.append(el('div', { class: 'rrow' }, icon(S.board.id, 32), el('div', { class: 'rtxt' }, el('b', null, 'Village request'), el('small', null, S.board.done ? 'Done for today.' : `Bring ${S.board.n} ${IT[S.board.id].n} to a request board for ${S.board.rew}g. You have ${cnt(S.board.id)}.`))));
  const next = QUESTS.findIndex((q, i) => !S.qdone[i]);
  QUESTS.forEach((q, i) => list.append(el('div', { class: 'rrow' + (S.qdone[i] ? ' done' : i === next ? ' hl' : '') }, el('div', { class: 'qck' }, S.qdone[i] ? '✓' : (i + 1)), el('div', { class: 'rtxt' }, el('b', null, q[0]), el('small', null, q[1] + '. Reward ' + q[3].toLocaleString() + 'g.')))));
  b.append(list);
}
function renderOpts(b) {
  b.append(el('div', { class: 'acts wrap' },
    el('button', { class: 'btn', on: () => { if (!PERSIST.includes(cur.id)) { toast('Return to the surface to save.'); return; } toast(saveGame() ? 'Game saved.' : 'Could not save.'); } }, 'Save game'),
    el('button', { class: 'btn ghost', on: () => { S.music = MUSIC_ON = !MUSIC_ON; refresh(); } }, 'Music: ' + (MUSIC_ON ? 'on' : 'off')),
    el('button', { class: 'btn ghost', on: () => { S.sound = SOUND_ON = !SOUND_ON; refresh(); } }, 'Sound: ' + (SOUND_ON ? 'on' : 'off'))));
  b.append(el('div', { class: 'help', html: '<h3>How to play</h3><p><b>Move</b> by dragging on the left half of the screen. The <b>big button</b> uses your selected tool, or talks, harvests, opens and reads whatever is in front of you. <b>⚔</b> attacks with your weapon. <b>↻</b> is a dodge roll with a moment of invulnerability. <b>🐎</b> calls your horse.</p><p>Your world seed is <b>' + S.seed + '</b>. The Wilds north of the farm and village are generated from it: six biomes, wandering monsters by day and worse by night, ore to mine, bosses that return weekly, and secrets hidden behind boulders, brambles and ancient oaks.</p><p>Sleep at home to save. Stay out past 2 am and you collapse. Crops need daily water unless it rains. The greenhouse ignores seasons once Hale repairs it.</p><p>Animals carry genes graded S to D, and rare heritable traits. Pair your best, keep their hearts high, and the bloodline improves.</p>' }));
  b.append(el('button', { class: 'btn danger', style: 'margin-top:14px', on: () => { if ((MODAL.opts.del || 0) < 2) { MODAL.opts.del = (MODAL.opts.del || 0) + 1; toast(MODAL.opts.del === 1 ? 'Tap again to delete your save.' : 'Last chance. Tap once more.', 'bad'); return; } localStorage.removeItem(SAVE_KEY); location.reload(); } }, 'Delete save'));
}
/* ---- shops ---- */
function buyRow(id, price, label, cb, sub) {
  const row = el('div', { class: 'rrow' }, icon(id, 32), el('div', { class: 'rtxt' }, el('b', null, label || IT[id].n), el('small', null, price.toLocaleString() + 'g. ' + (sub || itemDesc(id).split('. ').filter(s => !s.startsWith('Sells')).slice(0, 2).join('. '))))), acts = el('div', { class: 'acts' });
  [1, 5].forEach(n => { if (n === 5 && (cb || IT[id].slot || IT[id].t === 'place')) return; acts.append(el('button', { class: 'btn' + (S.gold < price * n ? ' off' : ''), on: () => { if (S.gold < price * n) { toast('Not enough gold.', 'bad'); SFX.bad(); return; } S.gold -= price * n; if (cb) cb(n); else give(id, n, 0, true); SFX.coin(); refresh(); } }, '×' + n)); });
  row.append(acts); return row;
}
function sellList(b, mode, filter) {
  const ks = sortedInv().filter(k => valK(k) > 0 && (!filter || filter(parseK(k)[0])));
  if (mode === 'bin') { let tot = 0; for (const k in S.bin) tot += valK(k) * S.bin[k]; b.append(el('p', { class: 'note' }, 'Items in the bin sell overnight. Tonight so far: ' + tot.toLocaleString() + 'g.')); }
  if (!ks.length) b.append(el('p', { class: 'note' }, 'Nothing to sell here.'));
  const list = el('div', { class: 'list' });
  ks.forEach(k => { const [id, q] = parseK(k); const sell = n => { n = Math.min(n, S.inv[k]); takeK(k, n); if (mode === 'bin') S.bin[k] = (S.bin[k] || 0) + n; else { S.gold += Math.round(valK(k) * (mode === 'fisher' ? 1.1 : 1)) * n; S.stats.shipped[id] = (S.stats.shipped[id] || 0) + n; } SFX.coin(); refresh(); };
    list.append(el('div', { class: 'rrow' }, icon(id, 32, q), el('div', { class: 'rtxt' }, el('b', null, (q ? QNAME[q] + ' ' : '') + IT[id].n + ' ×' + S.inv[k]), el('small', null, Math.round(valK(k) * (mode === 'fisher' ? 1.1 : 1)) + 'g each')), el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => sell(1) }, mode === 'bin' ? 'Ship 1' : 'Sell 1'), el('button', { class: 'btn', on: () => sell(9999) }, 'All')))); });
  b.append(list);
}
function greet(b, id) {
  const N = NPCS[id], f = fr(id), h = hearts(id), spr = humanSpr('npc' + id, N.P, 0, 0), c = el('canvas', { width: spr.width, height: spr.height, class: 'portrait' }); c.getContext('2d').drawImage(spr, 0, 0);
  if (f.t !== dayIndex()) { f.t = dayIndex(); addFriend(id, 10); }
  const line = pickR(N.lines[h >= 7 ? 2 : h >= 3 ? 1 : 0]);
  b.append(el('div', { class: 'greet f-panel' }, c, el('div', { class: 'rtxt' }, el('b', null, N.n + '  ', el('span', { class: 'hearts' }, '♥'.repeat(h) + '♡'.repeat(Math.max(0, 10 - h)))), el('p', null, '"' + line + '"')), el('button', { class: 'btn ghost' + (f.g === dayIndex() ? ' off' : ''), on: () => { if (f.g === dayIndex()) { toast('One gift a day is plenty.'); return; } openMenu('bag'); MODAL.title = 'Gift for ' + N.n; MODAL.opts.giftTo = id; drawModal(); } }, 'Give a gift')));
}
function talkNPC(id) { doorAction(NPCS[id].shop, id); }
const TOOLN = { hoe: 'Hoe', can: 'Watering Can', axe: 'Axe', pick: 'Pickaxe', scythe: 'Scythe', rod: 'Fishing Rod' };
const UPC = [null, null, ['copper_bar', 5, 500], ['iron_bar', 5, 1500], ['gold_bar', 5, 4000], ['mythril_bar', 5, 10000]];
function doorAction(act, who) {
  const G = (id) => (b) => { if (who || id) greet(b, who || id); };
  if (act === 'house') return openModal('Home', [{ id: 'h', label: 'Home', render: b => { b.append(el('p', { class: 'note' }, 'Grandmother\'s cottage. Warm, a little crooked, and smelling of thyme.')); b.append(el('div', { class: 'acts wrap' }, el('button', { class: 'btn', on: () => { closeModal(); endDay(false); } }, 'Sleep until morning'), el('button', { class: 'btn ghost', on: () => { openMenu('craft', 'kitchen'); MODAL.opts.station = 'kitchen'; MODAL.opts.st = 'kitchen'; drawModal(); } }, 'Cook'), el('button', { class: 'btn ghost', on: () => toast(saveGame() ? 'Game saved.' : 'Could not save.') }, 'Save'))); } }]);
  if (act === 'coop' || act === 'barn' || act === 'stable') return openMenu('animals');
  if (act === 'greenhouse') { if (!S.build.greenhouse) { toast('The glass is cracked and the beds are dry. Hale the carpenter could repair it.'); return; } goMap('greenhouse'); return; }
  if (act === 'cottage' || act === 'cabin') { toast(act === 'cabin' ? 'The door is frozen shut. A shape is scratched into it: a flame inside a crown.' : 'No one answers. Someone is out tending sheep, perhaps.'); return; }
  if (act === 'mine') return openModal('Mine elevator', [{ id: 'e', label: 'Elevator', render: b => { b.append(el('p', { class: 'note' }, 'The cage creaks. Floors 1–9 are earth, 10–19 ice, 20–29 magma and 30–39 void. Bosses wait on every tenth floor.')); const fl = [1]; for (let f = 5; f <= S.stats.deepest; f += 5) fl.push(f); const g2 = el('div', { class: 'acts wrap' }); fl.forEach(f => g2.append(el('button', { class: 'btn' + (MINE_BOSS[f] ? ' danger' : ''), on: () => { S.mineFloor = f; closeModal(); goMap('mine'); } }, 'Floor ' + f))); b.append(g2); } }]);
  if (act === 'store') return openModal('Mara\'s General Store', [{ id: 'buy', label: 'Buy', render: b => { G('mara')(b); const L = el('div', { class: 'list' }); Object.keys(CROPS).filter(k => CROPS[k].s.includes(S.season) && !CROPS[k].secret).forEach(k => L.append(buyRow(k + '_seed', IT[k + '_seed'].p))); L.append(el('h3', null, 'Fruit trees & supplies')); Object.keys(FTREES).forEach(k => L.append(buyRow(k + '_sapling', IT[k + '_sapling'].p))); [['compost', 60], ['growth_tonic', 120], ['hay', 25], ['fence', 12], ['campfire', 120], ['bread', 120]].forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L); } }, { id: 'sell', label: 'Sell', render: b => sellList(b) }]);
  if (act === 'tavern') return openModal('The Drowsy Drake', [{ id: 'eat', label: 'Meals', render: b => { G('pip')(b); b.append(el('p', { class: 'note' }, 'Rumor: ' + pickR(RUMORS))); const L = el('div', { class: 'list' }); [['bread', 150], ['grilled_fish', 220], ['mushroom_skewer', 260], ['hunters_brew', 300], ['veggie_stew', 520], ['miners_pie', 700], ['ale', 300]].forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L); } }, { id: 'cook', label: 'Cook', render: b => { MODAL.opts.st = 'kitchen'; MODAL.opts.station = 'kitchen'; renderCraft(b); } }, { id: 'sell', label: 'Sell', render: b => sellList(b, null, id => ['artisan', 'food'].includes(IT[id].t)) }]);
  if (act === 'smith') return openModal('Brann\'s Smithy', [{ id: 'forge', label: 'Forge', render: b => { G('brann')(b); MODAL.opts.st = 'forge'; MODAL.opts.station = 'forge'; renderCraft(b); } }, { id: 'up', label: 'Tool upgrades', render: renderUpgrades }, { id: 'buy', label: 'Buy', render: b => { const L = el('div', { class: 'list' }); [['coal', 40], ['copper_ore', 30], ['arrow', 4]].forEach(([id, p]) => L.append(buyRow(id, p))); if (S.stats.deepest >= 5) L.append(buyRow('iron_ore', 75)); if (S.stats.deepest >= 10) { L.append(buyRow('silver_ore', 120)); L.append(buyRow('gold_ore', 180)); } if (S.stats.deepest >= 20) L.append(buyRow('mythril_ore', 400)); [['copper_sword', 900], ['copper_spear', 900], ['leather_body', 500], ['leather_shield', 400]].forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L); } }, { id: 'sell', label: 'Sell', render: b => sellList(b, null, id => ['ore', 'bar', 'gem', 'weapon', 'armor', 'ring', 'loot'].includes(IT[id].t)) }]);
  if (act === 'stablemaster') return openModal('Odile\'s Stables', [{ id: 'buy', label: 'Animals', render: renderAnimalShop }, { id: 'horses', label: 'Horses', render: renderHorseShop }, { id: 'race', label: 'Races', render: renderRace }, { id: 'feed', label: 'Supplies', render: b => { const L = el('div', { class: 'list' }); L.append(buyRow('hay', 25)); L.append(buyRow('golden_oats', 1500)); b.append(L); } }], null, { talk: who });
  if (act === 'carpenter') return openModal('Hale\'s Workshop', [{ id: 'b', label: 'Buildings', render: renderBuild }, { id: 'buy', label: 'Materials', render: b => { const L = el('div', { class: 'list' }); [['wood', 10], ['stone', 10], ['hardwood', 60], ['clay', 40], ['fiber', 8]].forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L); } }]);
  if (act === 'museum') return openModal('Emberhollow Museum', [{ id: 'd', label: 'Donate', render: renderMuseum }]);
  if (act === 'fisher') return openModal('Corwin\'s Hut', [{ id: 's', label: 'Sell fish', render: b => { G('corwin')(b); b.append(el('p', { class: 'note' }, 'Corwin pays 10% over the odds for anything with fins.')); sellList(b, 'fisher', id => IT[id].t === 'fish'); } }, { id: 'buy', label: 'Tackle', render: b => { const L = el('div', { class: 'list' }); [['treasure_map', 800], ['sushi', 500], ['smoker', 1500], ['clam', 120]].forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L); } }]);
}
function renderUpgrades(b) {
  b.append(el('p', { class: 'note' }, 'Better axes and pickaxes work faster, give more logs and ore (an extra one 10% of the time per upgrade) and break tougher rocks and stumps. Better scythes cut a wider swath: copper 3 wide, iron 3×2, gold 5×2, mythril 5×3. Iron hoes and cans cover a line of three, gold a 3×3, mythril even more. Better rods widen the catch zone; iron rods can fish lava.'));
  const L = el('div', { class: 'list' });
  for (const t in TOOLN) { const l = S.tools[t], nx = l + 1, c = UPC[nx]; const disc = hasPerk('tinker') ? .5 : 1;
    const row = el('div', { class: 'rrow' }, icon('tool:' + t + ':' + l, 32), el('div', { class: 'rtxt' }, el('b', null, TIER_TOOL[l] + ' ' + TOOLN[t]), el('small', null, c ? 'Upgrade to ' + TIER_TOOL[nx] + ': ' + Math.round(c[2] * disc) + 'g and ' + Math.ceil(c[1] * disc) + ' ' + IT[c[0]].n + 's (you have ' + cnt(c[0]) + ').' : 'Fully upgraded.')));
    if (c) { const ok = S.gold >= c[2] * disc && has(c[0], Math.ceil(c[1] * disc)); row.append(el('button', { class: 'btn' + (ok ? '' : ' off'), on: () => { if (!ok) { toast('You need more gold or bars.', 'bad'); return; } S.gold -= Math.round(c[2] * disc); take(c[0], Math.ceil(c[1] * disc)); S.tools[t] = nx; if (t === 'can') S.water = canCap(); addXP('smithing', 25); SFX.lvl(); toast('Brann hands you a ' + TIER_TOOL[nx] + ' ' + TOOLN[t] + '.'); hudKey = ''; refresh(); } }, 'Upgrade')); }
    L.append(row); }
  b.append(L);
}
function renderAnimalShop(b) {
  if (MODAL.opts.talk) greet(b, 'odile');
  b.append(el('p', { class: 'note' }, 'Store-bought stock has average genes and no traits. Breed them to do better.'));
  const L = el('div', { class: 'list' });
  Object.keys(ANIMAL).filter(sp => sp !== 'horse').forEach(sp => {
    const A = ANIMAL[sp], spr = animalSpr(sp, Object.keys(COATS[sp])[0], 0), c = el('canvas', { width: spr.width, height: spr.height, class: 'apic' }); c.getContext('2d').drawImage(spr, 0, 0); const full = countIn(A.house) >= capFor(sp);
    L.append(el('div', { class: 'rrow' }, c, el('div', { class: 'rtxt' }, el('b', null, A.n), el('small', null, A.price.toLocaleString() + 'g. Lives in the ' + A.house + '. Grown in ' + A.adult + ' days, then gives ' + IT[A.prod].n.toLowerCase() + (A.every > 1 ? ' every ' + A.every + ' days' : ' daily') + (A.extra ? ', sometimes ' + IT[A.extra[0]].n.toLowerCase() : '') + '. Litters of ' + A.litter.join('–') + '.')), el('button', { class: 'btn' + (S.gold >= A.price && !full ? '' : ' off'), on: () => { if (full) { toast('Your ' + A.house + ' is full. Hale can expand it.'); return; } if (S.gold < A.price) { toast('Not enough gold.', 'bad'); return; } S.gold -= A.price; const a = newAnimal(sp, randGenes(sp, 40, 15), randCoat(sp), A.adult); S.stats.bought++; placeAnimals(); SFX.coin(); toast(a.name + ' the ' + A.n.toLowerCase() + ' is waiting in your pasture.'); refresh(); } }, 'Buy')));
  });
  b.append(L);
}
function renderHorseShop(b) {
  const H = el('div', { class: 'list' }), full = countIn('stable') >= capFor('horse');
  S.horseShop.forEach((h, i) => { if (!h) return; const a = { id: -1, sp: 'horse', name: h.coat[0].toUpperCase() + h.coat.slice(1) + ' ' + (h.sex === 'F' ? 'mare' : 'stallion'), sex: h.sex, age: 8, aff: 30, g: h.g, coat: h.coat, traits: h.traits, preg: 0 };
    H.append(animalCard(a, el('div', { class: 'acts col' }, el('small', null, h.price.toLocaleString() + 'g'), el('button', { class: 'btn' + (S.gold >= h.price && !full ? '' : ' off'), on: () => { if (full) { toast('Your stable is full.'); return; } if (S.gold < h.price) { toast('Not enough gold.', 'bad'); return; } S.gold -= h.price; const n = newAnimal('horse', h.g, h.coat, 8, h.traits); n.sex = h.sex; n.aff = 30; S.stats.bought++; if (!S.rideId) S.rideId = n.id; S.horseShop[i] = null; placeAnimals(); SFX.coin(); toast(n.name + ' is yours. Tap 🐎 to ride.'); refresh(); } }, 'Buy')))); });
  b.append(el('p', { class: 'note' }, 'New horses arrive every Monday. Rarely, one carries a trait.'), H);
}
function renderBuild(b) {
  greet(b, 'hale'); const L = el('div', { class: 'list' });
  for (const k in BUILD) { const B = BUILD[k], lv = S.build[k] || 0, nx = B.lv[lv]; const cap = lv ? B.lv[lv - 1][2] : 0;
    const row = el('div', { class: 'rrow' }, el('div', { class: 'qck' }, lv || '–'), el('div', { class: 'rtxt' }, el('b', null, B.n + (lv ? ' (level ' + lv + ')' : ' (not built)')), el('small', null, (k === 'silo' ? (lv ? 'Stores up to 240 hay from cut grass. Holding ' + S.silo + '.' : 'Cut grass becomes hay you can feed in winter.') : k === 'greenhouse' ? (lv ? 'Repaired. Crops grow in any season.' : 'Repair your grandmother\'s greenhouse.') : 'Holds ' + cap + ' ' + B.what + '.') + (nx ? ' Next: ' + nx[0].toLocaleString() + 'g, ' + Object.entries(nx[1]).map(([i, n]) => n + ' ' + IT[i].n).join(', ') + (k !== 'silo' && k !== 'greenhouse' ? ' → holds ' + nx[2] + '.' : '.') : ' Fully built.'))));
    if (nx) { const ok = S.gold >= nx[0] && Object.entries(nx[1]).every(([i, n]) => has(i, n)); row.append(el('button', { class: 'btn' + (ok ? '' : ' off'), on: () => { if (!ok) { toast('Not enough gold or materials.', 'bad'); return; } S.gold -= nx[0]; for (const [i, n] of Object.entries(nx[1])) take(i, n); S.build[k] = lv + 1; SFX.lvl(); toast(B.n + (lv ? ' upgraded!' : ' built!'), 'lvl'); refresh(); } }, lv ? 'Upgrade' : 'Build')); }
    L.append(row); }
  b.append(L);
}
function renderMuseum(b) {
  greet(b, 'elias'); const n = Object.keys(S.museum).length;
  b.append(el('p', { class: 'note' }, n + ' of ' + (ARTIFACTS.length + MINERALS.length) + ' donated. Every 3 donations, Elias pays a finder\'s fee.'));
  const can = Object.keys(S.inv).map(k => parseK(k)[0]).filter((id, i, a) => a.indexOf(id) === i && !S.museum[id] && (IT[id].t === 'artifact' || MINERALS.includes(id)));
  if (!can.length) b.append(el('p', { class: 'note' }, 'Nothing new to donate. Dig at wiggling spots in the Wilds and mine for gems.'));
  const L = el('div', { class: 'list' }); can.forEach(id => L.append(el('div', { class: 'rrow' }, icon(id, 32), el('div', { class: 'rtxt' }, el('b', null, IT[id].n), el('small', null, 'Not yet in the collection.')), el('button', { class: 'btn', on: () => { take(id); S.museum[id] = 1; SFX.secret(); const c = Object.keys(S.museum).length; if (c % 3 === 0) { const rew = Math.round(250 * c); S.gold += rew; toast('Elias pays you ' + rew + 'g for your contributions!', 'lvl'); if (c === 12) give('treasure_map', 3); if (c === 21) give('prismatic', 1); } refresh(); } }, 'Donate'))));
  b.append(L);
}
function renderRace(b) {
  if (MODAL.race) return drawRace(b);
  const horses = S.animals.filter(a => a.sp === 'horse' && a.age >= ANIMAL.horse.adult);
  b.append(el('p', { class: 'note' }, 'Four race types weigh stats differently. Win a cup to unlock the next tier in that race. Each horse races once a day.'));
  if (!horses.length) { b.append(el('p', { class: 'note' }, 'You need a grown horse to enter.')); return; }
  const sel = horses.find(h => h.id === MODAL.opts.horse) || horses.find(h => h.id === S.rideId) || horses[0];
  const ch = el('div', { class: 'chips' }); horses.forEach(h => ch.append(el('button', { class: 'chip' + (h === sel ? ' on' : '') + (h.raced ? ' dim' : ''), on: () => { MODAL.opts.horse = h.id; refresh(); } }, h.name + ' (' + horseRating(h) + ')'))); b.append(ch);
  const L = el('div', { class: 'list' });
  RACES.forEach(([rk, rn, wts]) => { const won = S.cupWins[rk] || 0; const row = el('div', { class: 'rrow' }, el('div', { class: 'rtxt' }, el('b', null, rn), el('small', null, Object.entries(wts).sort((a, c) => c[1] - a[1]).slice(0, 2).map(([k, v]) => GENES[k] + ' ' + Math.round(v * 100) + '%').join(', ') + '. Your score: ' + Math.round(raceScore(sel, rk, .5)))));
    const cups = el('div', { class: 'acts wrap' }); CUPS.forEach(([cn, fee, prize, lvl], i) => { const locked = won < i; cups.append(el('button', { class: 'btn' + (locked || sel.raced || S.gold < fee ? ' off' : '') + (won > i ? ' on' : ''), on: () => { if (locked) { toast('Win the ' + CUPS[i - 1][0] + ' ' + rn + ' first.'); return; } if (sel.raced) { toast(sel.name + ' has raced today.'); return; } if (S.gold < fee) { toast('Not enough gold.', 'bad'); return; } S.gold -= fee; startRace(sel, rk, i); } }, cn + ' ' + (won > i ? '✓' : prize.toLocaleString() + 'g'))); });
    row.append(cups); L.append(row); });
  b.append(L);
}
function raceScore(h, rk, ph) { const w = RACES.find(r => r[0] === rk)[2], gg = h.g; let s = (gg.spd + (h.traits && h.traits.includes('swift') ? 8 : 0)) * w.spd + gg.sta * w.sta + gg.str * w.str + gg.agi * w.agi; if (ph > .6 && !(h.traits && h.traits.includes('tireless'))) s *= .75 + gg.sta / 400; if (h.mine && hasPerk('whisperer')) s *= 1.06; return s; }
function startRace(h, rk, tier) {
  const lvl = CUPS[tier][3], names = ['Blackthorn', 'Saltmarsh', 'Duchess', 'Rook', 'Gilded Fox', 'Hearthfire', 'Old Peg', 'Vesper', 'Kestrel', 'Bellwether'];
  const run = [{ name: h.name, g: h.g, traits: h.traits, coat: h.coat, me: 1, mine: 1, d: 0 }]; for (let i = 0; i < 3; i++) run.push({ name: names.splice(ri(0, names.length - 1), 1)[0], g: randGenes('horse', lvl, 10), traits: [], coat: randCoat('horse'), d: 0 });
  h.raced = true; MODAL.race = { run, rk, tier, h, t: 0, done: false, order: [] }; MODAL.lock = true; refresh();
}
function drawRace(b) {
  const R0 = MODAL.race; b.append(el('h3', null, CUPS[R0.tier][0] + ' ' + RACES.find(r => r[0] === R0.rk)[1]));
  const track = el('div', { class: 'track' }); R0.run.forEach((r, i) => { const spr = animalSpr('horse', r.coat, 0), c = el('canvas', { width: spr.width, height: spr.height, class: 'runner', id: 'run' + i }); c.getContext('2d').drawImage(spr, 0, 0); track.append(el('div', { class: 'lane' + (r.me ? ' me' : '') }, el('span', { class: 'lname' }, r.name), c)); });
  b.append(track, el('div', { id: 'raceres', class: 'note' }, 'And they\'re off!')); if (R0.done) showRaceResult();
}
function raceTick(dt) {
  const R0 = MODAL && MODAL.race; if (!R0 || R0.done) return; R0.t += dt;
  R0.run.forEach((r, i) => { if (r.fin) return; const wob = (Math.random() - .5) * (1.3 - r.g.agi / 100) * 2; r.d += (raceScore(r, R0.rk, r.d / 100) / 100 * 32 + wob * 3 + Math.random() * 2) * dt; if (r.d >= 100) { r.d = 100; r.fin = 1; R0.order.push(r); } const c = $('#run' + i); if (c) { c.style.left = (r.d * .86) + '%'; c.style.transform = 'translateY(' + (Math.floor(R0.t * 10 + i) % 2) + 'px)'; } });
  if (R0.order.some(r => r.me)) { R0.done = true; MODAL.lock = false; const place = R0.order.findIndex(r => r.me), prize = CUPS[R0.tier][2]; R0.place = place; if (place === 0) { S.gold += prize; S.cupWins[R0.rk] = Math.max(S.cupWins[R0.rk] || 0, R0.tier + 1); S.stats.cupMax = Math.max(S.stats.cupMax, R0.tier + 1); R0.h.aff = Math.min(100, R0.h.aff + 6); SFX.lvl(); addXP('husbandry', 30 + R0.tier * 25); } else if (place === 1) { S.gold += Math.round(prize * .3); SFX.coin(); } showRaceResult(); }
}
function showRaceResult() { const R0 = MODAL.race, r = $('#raceres'); if (!r) return; const prize = CUPS[R0.tier][2]; r.innerHTML = ''; r.append(el('b', null, R0.h.name + ' finished ' + ['first', 'second', 'third', 'fourth'][R0.place] + '. '), R0.place === 0 ? 'You win ' + prize.toLocaleString() + 'g!' : R0.place === 1 ? 'Runner-up purse: ' + Math.round(prize * .3) + 'g.' : 'Better luck next time.', el('br'), el('button', { class: 'btn', style: 'margin-top:8px', on: () => { MODAL.race = null; refresh(); } }, 'Back to races')); }
function openBin() { openModal('Shipping bin', [{ id: 'b', label: 'Ship', render: b => sellList(b, 'bin') }]); }
function openBoard() {
  openModal('Request board', [{ id: 'r', label: 'Today', render: b => { const q = S.board; if (!q) return;
    b.append(el('div', { class: 'rrow' }, icon(q.id, 40), el('div', { class: 'rtxt' }, el('b', null, q.done ? 'Request complete' : 'Wanted: ' + q.n + ' ' + IT[q.id].n), el('small', null, q.done ? 'Check back tomorrow.' : 'Reward ' + q.rew + 'g. You have ' + cnt(q.id) + '.')), q.done ? null : el('button', { class: 'btn' + (has(q.id, q.n) ? '' : ' off'), on: () => { if (!take(q.id, q.n)) { toast('Not enough yet.'); return; } S.gold += q.rew; q.done = true; SFX.lvl(); for (const id in NPCS) addFriend(id, 15); refresh(); } }, 'Deliver')));
    b.append(el('p', { class: 'note' }, 'Rumor: ' + pickR(RUMORS))); } }]);
}
function openShrine(bio) {
  const D = SHRINES[bio];
  openModal(D.n, [{ id: 's', label: 'Shrine', render: b => {
    if (S.shrines[bio]) { b.append(el('p', { class: 'story' }, 'The shrine glows softly. Its blessing is already yours: ' + D.desc + '.')); return; }
    b.append(el('p', { class: 'story' }, 'An old stone basin, worn smooth by hands. Carved around its rim, a request:'));
    const L = el('div', { class: 'list' }); let ok = true; for (const [k, n] of Object.entries(D.need)) { const h = cnt(k); if (h < n) ok = false; L.append(el('div', { class: 'rrow' + (h >= n ? '' : ' dim') }, icon(k, 32), el('div', { class: 'rtxt' }, el('b', null, n + ' × ' + IT[k].n), el('small', null, 'You have ' + h + '.')))); } b.append(L);
    b.append(el('p', { class: 'note' }, 'Blessing: ' + D.desc + '.'), el('button', { class: 'btn big' + (ok ? '' : ' off'), on: () => { if (!ok) { toast('You don\'t have everything yet.'); return; } for (const [k, n] of Object.entries(D.need)) take(k, n); S.shrines[bio] = 1; if (D.reward === 'maxhp') S.bonus.maxhp += 25; if (D.reward === 'stamina') S.bonus.maxst += 40; if (D.reward === 'fishzone') S.bonus.fishzone = 1; if (D.reward === 'fireres') { S.bonus.fireres = 1; S.bonus.atk += 5; } recalc(); SFX.secret(); toast(D.n + ' is restored!', 'lvl'); refresh(); } }, 'Make the offering'));
  } }]);
}
function openAltar() {
  openModal('The Ember Altar', [{ id: 'a', label: 'Altar', render: b => {
    b.append(el('p', { class: 'story' }, 'A blackened altar in the village square. When you come close, the coals inside stir.'));
    const held = cnt('ember_shard'); b.append(el('p', { class: 'note' }, 'Shards offered: ' + S.shardsGiven + ' of 30. You carry ' + held + '.'));
    if (held) b.append(el('button', { class: 'btn big', on: () => { const n = cnt('ember_shard'); take('ember_shard', n); S.shardsGiven += n; SFX.secret(); for (const [need, id, q, nm] of SHARD_REWARDS) if (S.shardsGiven >= need && !S.shardRew[need]) { S.shardRew[need] = 1; give(id, q, 0, true); toast('The altar flares and leaves behind: ' + nm + '!', 'lvl'); } refresh(); } }, 'Offer ' + held + ' shard' + (held > 1 ? 's' : '')));
    const L = el('div', { class: 'list' }); SHARD_REWARDS.forEach(([need, id, q, nm]) => L.append(el('div', { class: 'rrow' + (S.shardRew[need] ? ' done' : '') }, el('div', { class: 'qck' }, need), icon(id, 28), el('div', { class: 'rtxt' }, el('b', null, nm), el('small', null, S.shardRew[need] ? 'Received.' : 'At ' + need + ' shards.'))))); b.append(L);
  } }]);
}
function openMerchant() {
  const wk = Math.floor(dayIndex() / 7), r = rng(S.seed + wk * 77); const pool = [['emberfruit_seed', 2500], ['moonblossom_seed', 3000], ['golden_oats', 900], ['treasure_map', 600], ['rabbit_foot', 1500], ['ring_lucky', 6000], ['ring_topaz', 2500], ['prismatic', 12000], ['warp_totem', 800], ['nautilus', 1200], ['starmetal', 2000], ['dragon_scale', 3500], ['staircase', 500], ['rich_compost', 300], ['pomegranate_sapling', 2000], ['ancient_coin', 1200]];
  const stock = []; while (stock.length < 6) { const it = pool[Math.floor(r() * pool.length)]; if (!stock.includes(it)) stock.push(it); }
  openModal('Wandering Merchant', [{ id: 'm', label: 'Wares', render: b => { b.append(el('div', { class: 'greet f-panel' }, el('div', { class: 'rtxt' }, el('b', null, 'Zephyr'), el('p', null, '"Rare goods from far roads. Prices are what they are, friend. Stock changes every week."')))); const L = el('div', { class: 'list' }); stock.forEach(([id, p]) => L.append(buyRow(id, p))); b.append(L); } }]);
}
function showPage(id) { openModal('A lost page', [{ id: 'p', label: 'Page', render: b => { b.append(el('div', { class: 'lore f-panel' }, el('small', null, 'Page ' + (id + 1) + ' of 12'), el('p', null, PAGES[id]))); b.append(el('button', { class: 'btn big', on: closeModal }, 'Close')); } }]); }
function showPerk() {
  const [sk, tier] = S.pendingPerk[0]; const opts = PERKS[sk][tier];
  openModal(SKN[sk] + ' level ' + (tier ? 10 : 5), [{ id: 'p', label: 'Choose', render: b => { b.append(el('p', { class: 'note' }, 'Choose a specialty. This choice is permanent.')); const row = el('div', { class: 'perkpick' }); opts.forEach(([id, n, d]) => row.append(el('button', { class: 'perkcard f-panel', on: () => { S.perks[id] = 1; S.pendingPerk.shift(); recalc(); SFX.lvl(); MODAL.lock = false; closeModal(); toast('New perk: ' + n + '.', 'lvl'); } }, el('b', null, n), el('p', null, d)))); b.append(row); } }]); MODAL.lock = true;
}
function showDayReport(lines) {
  openModal(WEEK[(dayIndex() - 1) % 7] + '. ' + S.day + ' ' + SEASONS[S.season] + ', Year ' + S.year, [{ id: 'd', label: 'Morning', render: b => {
    b.append(el('p', { class: 'dayw' }, { sun: 'Clear skies today.', rain: 'Rain today. Your farm crops are watered.', snow: 'Snow is falling.' }[S.weather]));
    const L = el('div', { class: 'list' }); (lines.length ? lines : [['star', 'A quiet night.']]).forEach(([k, t]) => L.append(el('div', { class: 'rrow' }, el('div', { class: 'qck' }, { coin: '$', bad: '!', star: '★', animal: '♣', heart: '♥' }[k] || '•'), el('div', { class: 'rtxt' }, t)))); b.append(L);
    b.append(el('button', { class: 'btn big', on: closeModal }, 'Start the day'));
  } }]);
}
function showFishUI(on) { $('#fish').hidden = !on; }
/* ---- HUD ---- */
let hudKey = '', hudAcc = 0;
function buildHUD() {
  const hb = $('#hotbar'); hb.innerHTML = '';
  S.hot.forEach((_, i) => { const s = el('button', { class: 'slot f-slot', id: 'hs' + i }); s.addEventListener('pointerdown', e => { e.preventDefault(); if (PAUSED) return; if (S.sel === i && !isTool(S.hot[i])) openMenu('bag'); S.sel = i; hudKey = ''; hudTick(1); }); hb.append(s); });
  hudKey = '';
}
function hudTick(dt) {
  hudAcc += dt; if (hudAcc < .12) return; hudAcc = 0; if (!S) return;
  $('#hday').textContent = WEEK[(dayIndex() - 1) % 7] + '. ' + S.day; $('#hseason').textContent = SEASONS[S.season]; $('#hweather').textContent = { sun: S.time >= 1140 ? '☾' : '☀', rain: '☂', snow: '❄' }[S.weather];
  $('#htime').textContent = fmtTime(S.time); const gs = S.gold.toLocaleString(); $('#gold').textContent = gs; $('#gold').style.fontSize = gs.length > 9 ? '13px' : gs.length > 7 ? '15px' : '';
  $('#hpb i').style.height = clamp(S.p.hp / maxHP() * 100, 0, 100) + '%'; $('#stb i').style.height = clamp(S.p.st / maxST() * 100, 0, 100) + '%';
  const key = S.sel + JSON.stringify(S.hot) + S.hot.map(h => h && !isTool(h) ? cnt(h) : '').join() + JSON.stringify(S.tools) + S.eq.weapon + S.water;
  if (key !== hudKey) { hudKey = key; S.hot.forEach((k, i) => { const s = $('#hs' + i); if (!s) return; s.className = 'slot f-slot' + (S.sel === i ? ' on' : ''); s.innerHTML = ''; let id = k === 'weapon' ? S.eq.weapon : isTool(k) ? 'tool:' + k + ':' + S.tools[k] : k; if (id && (isTool(k) || cnt(k))) s.append(el('img', { src: iconURL(id) })); s.append(el('em', null, i === 9 ? '0' : String(i + 1))); if (k && !isTool(k) && cnt(k)) s.append(el('b', null, cnt(k))); if (k === 'can') s.append(el('i', { class: 'wl', style: 'height:' + (S.water / canCap() * 100) + '%' })); }); }
  let lab = 'Use'; if (!PAUSED && cur) { if (fishing) lab = fishing.phase === 'reel' ? 'Reel' : fishing.phase === 'bite' ? 'Hook!' : 'Wait'; else { const it = findInteract(); const k = selKind(); lab = it ? it.label : { hoe: 'Till', can: 'Water', axe: 'Chop', pick: 'Mine', rod: 'Cast', weapon: 'Attack' }[k] || (k && IT[k] ? (IT[k].t === 'seed' ? 'Plant' : IT[k].t === 'place' ? 'Place' : IT[k].t === 'fert' ? 'Fertilize' : IT[k].t === 'sapling' ? 'Plant' : IT[k].eat ? 'Eat' : 'Use') : 'Bag'); } }
  $('#bActL').textContent = lab;
  $('#bRide').style.opacity = S.animals.some(a => a.sp === 'horse') ? 1 : .4; $('#bRide').classList.toggle('on', !!S.mounted); $('#bRoll').style.opacity = pl.rollCd > 0 ? .5 : 1;
  if (fishing && fishing.phase === 'reel') { const f = fishing; $('#fzone').style.height = (f.zs * 100) + '%'; $('#fzone').style.bottom = ((f.zone - f.zs / 2) * 100) + '%'; $('#ffish').style.bottom = (f.pos * 90) + '%'; $('#fprog i').style.height = (f.prog * 100) + '%'; $('#fzone').classList.toggle('in', !!f.inZ); const tc = $('#ftreasure'); tc.hidden = !f.treasure || f.tprog >= 1; tc.style.bottom = (f.tp * 90) + '%'; tc.style.opacity = .5 + f.tprog * .5; }
  $('#buffs').innerHTML = ''; S.buffs.forEach(bf => $('#buffs').append(el('span', { class: 'buff' }, (bf.atk ? '⚔' : bf.def ? '🛡' : bf.spd ? '➶' : bf.luck ? '☘' : bf.fish ? '🐟' : bf.mine ? '⛏' : '✦') + Math.ceil(bf.t / 60) + 'm')));
  if (pl.burn > 0) $('#buffs').append(el('span', { class: 'buff bad' }, '🔥')); if (pl.chill > 0) $('#buffs').append(el('span', { class: 'buff bad' }, '❄'));
}
/* ---- input ---- */
const INPUT = { x: 0, y: 0, act: false, atk: false, keys: {} };
let padId = null, padOX = 0, padOY = 0;
function setupInput() {
  const pz = $('#padzone'), pad = $('#pad'), knob = $('#knob');
  pz.addEventListener('pointerdown', e => { if (padId !== null) return; padId = e.pointerId; padOX = e.clientX; padOY = e.clientY; pad.style.display = 'block'; pad.style.left = (padOX - 60) + 'px'; pad.style.top = (padOY - 60) + 'px'; knob.style.transform = ''; try { pz.setPointerCapture(e.pointerId); } catch (_) { } unlockAudio(); });
  pz.addEventListener('pointermove', e => { if (e.pointerId !== padId) return; let dx = e.clientX - padOX, dy = e.clientY - padOY; const d = Math.hypot(dx, dy), mx = 48; if (d > mx) { dx = dx / d * mx; dy = dy / d * mx; } knob.style.transform = `translate(${dx}px,${dy}px)`; INPUT.x = d > 6 ? dx / mx : 0; INPUT.y = d > 6 ? dy / mx : 0; });
  const end = e => { if (e.pointerId !== padId) return; padId = null; INPUT.x = INPUT.y = 0; pad.style.display = 'none'; };
  pz.addEventListener('pointerup', end); pz.addEventListener('pointercancel', end);
  const hold = (id, down, up) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); unlockAudio(); b.classList.add('press'); down(); }); const u = () => { b.classList.remove('press'); if (up) up(); }; b.addEventListener('pointerup', u); b.addEventListener('pointercancel', u); b.addEventListener('pointerleave', u); };
  hold('#bAct', () => { INPUT.act = true; act(); }, () => INPUT.act = false);
  hold('#bAtk', () => { INPUT.atk = true; if (!PAUSED && !fishing) attack(); }, () => INPUT.atk = false);
  hold('#bRoll', dodge); hold('#bRide', () => { if (!PAUSED) toggleRide(); });
  hold('#bMenu', () => { if (!PAUSED) openMenu('bag'); }); hold('#bMap', () => { if (!PAUSED) openMenu('map'); });
  $('#mclose').onclick = closeModal;
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase(); INPUT.keys[k] = true; unlockAudio();
    if ((k === ' ' || k === 'j') && !e.repeat) { INPUT.act = true; act(); }
    if (k === 'k') INPUT.atk = true; if (k === 'l' || k === 'shift') dodge(); if (k === 'r' && !PAUSED) toggleRide();
    if ((k === 'e' || k === 'escape') && !e.repeat) { if (MODAL) closeModal(); else if (!PAUSED) openMenu('bag'); } if (k === 'm' && !PAUSED) openMenu('map');
    if (/^[0-9]$/.test(k) && !PAUSED) { S.sel = k === '0' ? 9 : +k - 1; hudKey = ''; }
  });
  addEventListener('keyup', e => { const k = e.key.toLowerCase(); INPUT.keys[k] = false; if (k === ' ' || k === 'j') INPUT.act = false; if (k === 'k') INPUT.atk = false; });
}
function unlockAudio() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { } }
function keyVec() { const K = INPUT.keys; let x = (K.d || K.arrowright ? 1 : 0) - (K.a || K.arrowleft ? 1 : 0), y = (K.s || K.arrowdown ? 1 : 0) - (K.w || K.arrowup ? 1 : 0); const d = Math.hypot(x, y); return d ? [x / d, y / d] : [INPUT.x, INPUT.y]; }
/* ---- loop ---- */
let last = 0, qAcc = 0, pAcc = 0, stepAcc = 0;
function update(dt) {
  pl.cd -= dt; pl.atk -= dt; pl.inv -= dt; pl.anim -= dt; pl.swing -= dt; pl.rollCd -= dt; SHAKE -= dt;
  if (INPUT.atk && pl.atk <= 0 && !fishing) attack();
  updateTime(dt); if (PAUSED) return;
  const p = S.p; let [ix, iy] = keyVec();
  if (fishing && (Math.abs(ix) > .3 || Math.abs(iy) > .3) && fishing.phase !== 'reel') fishing = null;
  if (fishing) ix = iy = 0;
  const h = S.mounted ? rideHorse() : null;
  let spd = h ? 72 * (1 + h.g.spd / 100 * 1.5) : 72 * (1 + (S.eq.boots ? 0 : 0) + (PS.spd || 0));
  if (!h && S.p.st <= 0) spd *= .6; if (pl.chill > 0) spd *= .65;
  if (pl.roll > 0) { pl.roll -= dt; moveEnt(cur, p, pl.rdx * 230 * dt, pl.rdy * 230 * dt, 5); }
  const mag = Math.hypot(ix, iy); pl.moving = mag > .1 && pl.roll <= 0;
  if (pl.kbx || pl.kby) { moveEnt(cur, p, pl.kbx * dt, pl.kby * dt, 5); pl.kbx *= .85; pl.kby *= .85; if (Math.abs(pl.kbx) + Math.abs(pl.kby) < 5) pl.kbx = pl.kby = 0; }
  if (pl.moving) {
    if (pl.swing <= 0) { if (Math.abs(ix) > Math.abs(iy)) p.dir = ix < 0 ? 1 : 2; else p.dir = iy < 0 ? 3 : 0; } if (p.dir === 1 || p.dir === 2) p.lastH = p.dir;
    const s = spd * Math.min(1, mag) * dt; moveEnt(cur, p, ix * s, iy * s, h ? 6 : 5);
    stepAcc += dt; if (stepAcc > (h ? .16 : .3)) { stepAcc = 0; SFX.step(); }
    if (h && Math.random() < dt * 2) h.aff = Math.min(100, h.aff + .2);
  }
  const tx = Math.floor(p.x / 16), ty = Math.floor((p.y - 2) / 16);
  for (const w of cur.warps) if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) { if (w.lock && !regionOpen(w.lock)) { regionLocked(w); break; } const m2 = S.mounted; goMap(w.to, w.tx, w.ty, w.dir); S.mounted = m2 && cur.outdoor; break; }
  if (cur.wild) wildSpawns(cur, dt);
  updateEnemies(cur, dt); updateDrops(cur, dt); cur.ents = cur.ents.filter(e => !e.dead);
  if (cur.id === 'farm') updateAnimals(dt);
  for (const n of cur.npcs || []) { n.t = (n.t || 0) - dt; if (n.t <= 0) { n.t = 2 + Math.random() * 3; n.vx = Math.random() < .5 ? 0 : (Math.random() < .5 ? -12 : 12); } if (dist(n.x, n.y, p.x, p.y) < 30) { n.vx = 0; n.dir = Math.abs(p.x - n.x) > Math.abs(p.y - n.y) ? (p.x < n.x ? 1 : 2) : (p.y < n.y ? 3 : 0); } else if (n.vx) n.dir = n.vx < 0 ? 1 : 2; else n.dir = 0; n.x = clamp(n.x + (n.vx || 0) * dt, n.hx - 24, n.hx + 24); n.walk = !!n.vx; }
  updateFishing(dt);
  pAcc += dt; if (pAcc > .5) { pAcc = 0; checkPOIs(); if (cur.mine) S.stats.deepest = Math.max(S.stats.deepest, cur.mine); recalc(); }
  qAcc += dt; if (qAcc > 1) { qAcc = 0; checkQuests(); if (S.pendingPerk.length && !MODAL) showPerk(); }
}
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; gameT += dt;
  try {
    if (S && cur) {
      if (TITLE) { S.p.x = 100 * 16 + Math.sin(gameT * .08) * 260; S.p.y = 125 * 16 + Math.cos(gameT * .06) * 80; }
      else { if (!PAUSED) update(dt); raceTick(dt); const b = cur.bio ? BIOMES[cur.bio[Math.floor(S.p.y / 16) * cur.w + Math.floor(S.p.x / 16)]] : null; musicTick(dt, cur.dark ? 'mine' : b === 'frost' ? 'frost' : b === 'ash' ? 'ash' : S.time >= 1140 ? 'night' : cur.id === 'wilds' ? 'wild' : 'day'); }
      render(dt); if (!TITLE) hudTick(dt);
    }
  } catch (err) { console.error(err); if (!window.__errShown) { window.__errShown = 1; toast('Error: ' + err.message, 'bad'); } }
  requestAnimationFrame(loop);
}
function startGame(isNew) {
  TITLE = false; $('#title').hidden = true; $('#hudwrap').hidden = false; MAPBASE = null;
  if (isNew) {
    S = newState(); initMaps(); recalc(); rollBoard(); rollHorseShop(); dailyWorld([]); goMap('farm', S.p.x, S.p.y, 0); saveGame();
    openModal('Hollowmere Farm', [{ id: 'i', label: 'Arrival', render: b => { b.append(el('div', { class: 'lore f-panel', html: '<p>Your grandmother left you Hollowmere Farm: a crooked cottage, a field gone to weeds, empty barns, and a wooden sword above the hearth.</p><p>North of the farm lie the Wilds. Meadows, old forest, the grey highlands, a cold coast, the peaks and the ashen wastes beyond. Somewhere under the highlands is the Old Mine, and at the bottom of it, they say, something that wears a hollow crown.</p><p>Clear the field. Raise animals and finer horses. Make friends. Explore, dig, and go down. Your world seed is ' + S.seed + '.</p>' })); b.append(el('button', { class: 'btn big', on: closeModal }, 'Begin')); } }]);
  } else {
    initMaps(); recalc(); let mp = S.p.map; if (!PERSIST.includes(mp) || mp === 'greenhouse') { mp = 'farm'; S.p.x = 9.5 * 16; S.p.y = 10.5 * 16; }
    cur = MAPS[mp]; goMap(mp, S.p.x, S.p.y, S.p.dir); PAUSED = false; if (!S.horseShop.length) rollHorseShop(); if (!S.board) rollBoard();
  }
  MUSIC_ON = S.music !== false; SOUND_ON = S.sound !== false; buildHUD(); unlockAudio();
}
function boot() {
  resize(); buildTerrain(); buildObjects(); buildUI(); setupInput();
  BSTY.coop = { roof: '#8a5a2e', wall: '#e8c890', trim: '#5a3a22', barn: 1 };
  const saved = loadGame();
  S = newState(12345); initMaps(); recalc(); cur = MAPS.wilds; S.time = 620; TITLE = true;
  $('#tcont').hidden = !saved; $('#tcont').onclick = () => { S = saved; startGame(false); };
  $('#tnew').onclick = () => { if (saved && !$('#tnew').dataset.sure) { $('#tnew').dataset.sure = 1; $('#tnew').textContent = 'Overwrite your save?'; return; } startGame(true); };
  requestAnimationFrame(loop);
}
// boot() is started by z_main.js once the pixel-art atlas has loaded
