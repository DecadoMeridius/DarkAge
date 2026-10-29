/* ================= Gameplay ================= */
const pl = { cd: 0, atk: 0, inv: 0, anim: 0, swing: 0, moving: false, kbx: 0, kby: 0, roll: 0, rollCd: 0, rdx: 0, rdy: 0, tool: null, regenT: 0, burn: 0, chill: 0 };
let fishing = null, PAUSED = true, FX = [], PARTS = [], SHAKE = 0, gameT = 0, PS = null, TITLE = true;
const DIRV = [[0, 1], [-1, 0], [1, 0], [0, -1]];
const hasPerk = k => !!(S && S.perks[k]);
/* ---- inventory (quality-aware) ---- */
const keyOf = (id, q) => q ? id + '#' + q : id;
const parseK = k => { const i = k.indexOf('#'); return i < 0 ? [k, 0] : [k.slice(0, i), +k.slice(i + 1)]; };
function cnt(id) { let n = S.inv[id] || 0; for (let q = 1; q <= 3; q++) n += S.inv[id + '#' + q] || 0; return n; }
const has = (id, n = 1) => cnt(id) >= n;
function give(id, n = 1, q = 0, quiet) {
  if (id === '$') { n = Math.round(n * (1 + (PS ? PS.gold : 0))); S.gold += n; if (!quiet) floatText(S.p.x, S.p.y - 26, '+' + n + 'g', '#ffd040'); SFX.coin(); return; }
  if (id === 'gem') { id = wpick([['amethyst', 4], ['topaz', 4], ['aquamarine', 2], ['emerald', 1.5], ['ruby', 1.5], ['diamond', .5 + (S.sk.mining.l > 6 ? .5 : 0)]]); if (hasPerk('geologist')) n *= 2; }
  if (!IT[id]) return;
  if (id === 'ember_shard') { S.shardsTotal += n; toast('An ember shard! (' + S.shardsTotal + ' found)', 'lvl'); SFX.secret(); }
  if (!QUAL_T.has(IT[id].t)) q = 0;
  const k = keyOf(id, q); S.inv[k] = (S.inv[k] || 0) + n;
  if (!quiet) floatText(S.p.x, S.p.y - 26, '+' + n + ' ' + IT[id].n, q ? ['', '#dfe8f0', '#ffd040', '#ff8a3a'][q] : '#fff6d8');
  if (IT[id].t === 'fish') { S.stats.caught[id] = (S.stats.caught[id] || 0) + n; }
}
function takeK(k, n = 1) { if ((S.inv[k] || 0) < n) return false; S.inv[k] -= n; if (S.inv[k] <= 0) delete S.inv[k]; return true; }
function take(id, n = 1) { if (!has(id, n)) return false; for (let q = 0; q <= 3 && n > 0; q++) { const k = keyOf(id, q), c = S.inv[k] || 0, t = Math.min(c, n); if (t) { takeK(k, t); n -= t; } } return true; }
function catCount(cat) { let n = 0; for (const k in S.inv) { const [id] = parseK(k); if (CATF[cat](id)) n += S.inv[k]; } return n; }
function catTake(cat, n) { const ks = Object.keys(S.inv).filter(k => CATF[cat](parseK(k)[0])).sort((a, b) => IT[parseK(a)[0]].p - IT[parseK(b)[0]].p); for (const k of ks) { while (n > 0 && takeK(k, 1)) n--; } }
const needHave = k => k[0] === '$' ? catCount(k) : cnt(k);
/* ---- skills ---- */
function addXP(k, n) {
  const s = S.sk[k]; if (s.l >= 10) return; s.xp += n;
  while (s.l < 10 && s.xp >= xpNeed(s.l)) { s.xp -= xpNeed(s.l); s.l++; toast(SKN[k] + ' reached level ' + s.l + '!', 'lvl'); SFX.lvl(); if (s.l === 5 || s.l === 10) S.pendingPerk.push([k, s.l === 5 ? 0 : 1]); recalc(); }
}
function recalc() {
  if (!S) return; const b = { atk: 0, def: 0, crit: .05, spd: 0, aspd: 0, maxhp: 0, maxst: 0, luck: 0, regen: 0, magnet: 0, fireres: 0, slow: 0, burn: 0, holy: 0, gold: 0, dmg: 0, fish: 0, mine: 0 };
  const add = o => { for (const k in o) b[k] = (b[k] || 0) + o[k]; };
  const W = IT[S.eq.weapon] || IT.wood_sword, mm = hasPerk('master') ? 1.1 : 1;
  b.atk += W.atk * mm; if (W.wt === 'dagger') b.crit += .15;
  for (const s of ['helm', 'body', 'boots', 'shield']) if (S.eq[s]) { b.def += IT[S.eq[s]].def * mm; }
  for (const s of ['ring1', 'ring2']) if (S.eq[s]) add(IT[S.eq[s]].bonus);
  const tiers = ['helm', 'body', 'boots'].map(s => S.eq[s] && IT[S.eq[s]].tier); if (tiers[0] && tiers.every(t => t === tiers[0]) && SETB[tiers[0]]) { add(SETB[tiers[0]][1]); b.set = tiers[0]; }
  for (const bf of S.buffs) add(Object.fromEntries(Object.entries(bf).filter(([k]) => !['id', 't', 'dur'].includes(k))));
  b.atk += (S.sk.combat.l - 1) + S.bonus.atk; if (hasPerk('fighter')) { b.dmg += .1; b.maxhp += 15; } if (hasPerk('brute')) b.dmg += .15; if (hasPerk('scout')) b.crit += .15;
  if (S.bonus.fireres) b.fireres = 1;
  b.maxhp += 100 + (S.sk.combat.l - 1) * 8 + S.bonus.maxhp + S.bonus.eatHp; b.maxst += 120 + SK.reduce((a, k) => a + S.sk[k].l - 1, 0) * 3 + S.bonus.maxst;
  b.wt = W.wt || 'sword'; b.cd = (W.cd || .32) * (1 - b.aspd); b.elem = W.tier === 'frost' ? 'ice' : (W.tier === 'obsidian' || W.tier === 'dragon') ? 'fire' : null;
  PS = b;
}
const maxHP = () => PS ? PS.maxhp : 100, maxST = () => PS ? PS.maxst : 120;
function useStamina(n) { if (hasPerk('arborist') && pl.tool === 'axe') return; S.p.st = Math.max(0, S.p.st - n); if (S.p.st <= 0) toast('You\'re exhausted. Eat something or rest.', 'bad'); }
/* ---- collision ---- */
function solidAt(m, x, y) {
  const tx = Math.floor(x / 16), ty = Math.floor(y / 16);
  if (!inb(m, tx, ty)) return true; const i = ty * m.w + tx, t = m.t[i];
  if (TER[t].solid) return true; if (m.solidB[i]) return true; const o = m.o[i]; return !!(o && OBJ[o.k] && OBJ[o.k].solid);
}
function boxFree(m, x, y, hw = 5) { return !solidAt(m, x - hw, y - 4) && !solidAt(m, x + hw, y - 4) && !solidAt(m, x - hw, y + 1) && !solidAt(m, x + hw, y + 1); }
function moveEnt(m, e, dx, dy, hw) { if (boxFree(m, e.x + dx, e.y, hw)) e.x += dx; else dx = 0; if (boxFree(m, e.x, e.y + dy, hw)) e.y += dy; else dy = 0; return dx !== 0 || dy !== 0; }
/* ---- map change ---- */
let backPos = null;
function goMap(id, x, y, dir) {
  const from = cur && cur.id;
  if (id === 'mine') { cur = genMine(S.mineFloor); S.p.x = cur.start.x; S.p.y = cur.start.y; }
  else if (id.startsWith('cave_')) { cur = genCave(id, id.slice(5)); S.p.x = cur.start.x; S.p.y = cur.start.y; }
  else if (id === 'greenhouse') { cur = MAPS.greenhouse; S.p.x = cur.start.x; S.p.y = cur.start.y; }
  else { cur = MAPS[id]; S.p.x = x; S.p.y = y; if (cur.wild) cur.ents = cur.ents.filter(e => e.type !== 'enemy' || EN[e.k].boss); }
  if (dir !== undefined) S.p.dir = dir; S.p.map = id;
  if (!cur.outdoor && S.mounted) { S.mounted = false; toast('Your horse waits outside.'); }
  if (id === 'farm') placeAnimals();
  fishing = null; showFishUI(false); WEATHER.length = 0; SFX.door(); showBanner(cur.name);
}
function placeAnimals() { const P = MAPS.farm.pasture; for (const a of S.animals) { a.x = P.x0 + 8 + Math.random() * (P.x1 - P.x0 - 16); a.y = P.y0 + 12 + Math.random() * (P.y1 - P.y0 - 16); a.vx = a.vy = 0; a.t = Math.random() * 3; a.dir = Math.random() < .5 ? 1 : -1; } }
function faceTile() { const d = DIRV[S.p.dir]; return [Math.floor((S.p.x + d[0] * 12) / 16), Math.floor((S.p.y - 4 + d[1] * 12) / 16)]; }
function facePt() { const d = DIRV[S.p.dir]; return [S.p.x + d[0] * 12, S.p.y - 6 + d[1] * 12]; }
function areaTiles(tx, ty, lvl) {
  const d = DIRV[S.p.dir], out = [[tx, ty]];
  if (lvl >= 3) out.push([tx + d[0], ty + d[1]], [tx + d[0] * 2, ty + d[1] * 2]);
  if (lvl >= 4) { const a = d[1], b = d[0]; for (let i = 0; i < 3; i++) out.push([tx + d[0] * i + a, ty + d[1] * i + b], [tx + d[0] * i - a, ty + d[1] * i - b]); }
  if (lvl >= 5) { for (let i = 3; i < 5; i++) out.push([tx + d[0] * i, ty + d[1] * i]); }
  return out;
}
const selKind = () => S.hot[S.sel];
const isTool = k => ['hoe', 'can', 'axe', 'pick', 'rod', 'scythe', 'multi', 'weapon'].includes(k);
/* ---- interactions ---- */
function findInteract() {
  const m = cur, [tx, ty] = faceTile(), [fx, fy] = facePt();
  for (const n of m.npcs || []) if (dist(n.x, n.y - 10, fx, fy) < 16) return { label: 'Talk', fn: () => talkNPC(n.id) };
  if (m.id === 'farm') for (const a of S.animals) { if (S.mounted && a.id === S.rideId) continue; if (dist(a.x, a.y - 8, fx, fy) < 16) return { label: a.pet ? 'Info' : 'Pet', fn: () => petAnimal(a) }; }
  for (const b of m.bld) if (b.door.x === tx && b.door.y === ty && b.act) return { label: DOORL[b.act] || 'Enter', fn: () => doorAction(b.act) };
  const checks = [[tx, ty], [Math.floor(S.p.x / 16), Math.floor((S.p.y - 2) / 16)]];
  for (const [x0, y0] of checks) {
    const [x, y, o] = mainOf(m, x0, y0); if (!o) continue;
    const r = objInteract(m, x, y, o); if (r) return r;
  }
  const s = m.soil[ty * m.w + tx];
  if (s && s.crop) { const C = CROPS[s.crop.k]; if (s.crop.dead) return { label: 'Clear', fn: () => { s.crop = null; } }; if (s.crop.age >= C.d) return needsScythe(C) ? { label: 'Use scythe', fn: () => toast('Cut ' + C.n.toLowerCase() + ' with your scythe (left click with it selected).') } : { label: 'Harvest', fn: () => harvest(m, tx, ty) }; }
  const t = getT(m, tx, ty), k = selKind();
  if (TER[t].water && k === 'can') return { label: 'Refill', fn: useTool };
  if ((TER[t].water || TER[t].lava) && k === 'rod') return { label: 'Cast', fn: useTool };
  return null;
}
const DOORL = { house: 'Home', coop: 'Coop', barn: 'Barn', stable: 'Stable', greenhouse: 'Enter', store: 'Shop', smith: 'Smithy', tavern: 'Tavern', stablemaster: 'Stables', mine: 'Enter', cottage: 'Knock', carpenter: 'Carpenter', museum: 'Museum', fisher: 'Corwin', cabin: 'Knock' };
function objInteract(m, x, y, o) {
  const k = o.k;
  if (k === 'bin') return { label: 'Ship', fn: openBin };
  if (k === 'ladder') return { label: 'Descend', fn: () => { S.mineFloor = m.mine + 1; goMap('mine'); } };
  if (k === 'upladder') return { label: 'Climb', fn: () => { if (m.cave) { const c = MAPS.wilds.poi.find(p => p.type === 'cave' && p.bio === o.back); goMap('wilds', (c.x + 1) * 16, (c.y + 1.8) * 16, 0); } else { const d = MAPS.wilds.mineDoor; goMap('wilds', (d.x + .5) * 16, (d.y + 1.7) * 16, 0); } } };
  if (k === 'board') return { label: 'Requests', fn: openBoard };
  if (k === 'fg') return { label: 'Gather', fn: () => { let q = forageQ(); give(o.item, 1 + (hasPerk('gatherer') && Math.random() < .12 ? 1 : 0), q); addXP('foraging', 7); setO(m, x, y, null); SFX.pick(); } };
  if (k === 'bush' && o.ripe) return { label: 'Pick', fn: () => { give('blackberry', ri(2, 3) + Math.floor(S.sk.foraging.l / 4), forageQ()); addXP('foraging', 5); o.ripe = 0; SFX.pick(); } };
  if (k === 'beehive' && o.ready) return { label: 'Collect', fn: () => { give('honey', 1 + (S.sk.husbandry.l >= 6 ? 1 : 0), animalQ(50, 50)); o.ready = 0; o.cd = 3; addXP('husbandry', 8); SFX.pick(); } };
  if (k === 'campfire') return { label: 'Cook', fn: () => openMenu('craft', 'kitchen') };
  if (k === 'forge') return { label: 'Smith', fn: () => openMenu('craft', 'forge') };
  if (OBJ[k] && OBJ[k].mach) return machineInteract(o);
  if (k === 'ftree' && o.fruit > 0) return { label: 'Harvest', fn: () => { const q = typeof fruitQ === 'function' ? fruitQ(o.age) : 0; give(o.tree, o.fruit, q); addXP('foraging', 6 * o.fruit); o.fruit = 0; SFX.pick(); } };
  if (k === 'chest') return { label: 'Open', fn: () => openChest(m, x, y, o) };
  if (k === 'page') return { label: 'Read', fn: () => { S.pages[o.id] = 1; setO(m, x, y, null); SFX.secret(); showPage(o.id); } };
  if (k === 'shard') return { label: 'Take', fn: () => { if (!S.flags[o.id]) { S.flags[o.id] = 1; give('ember_shard', 1); } setO(m, x, y, null); } };
  if (k === 'shrine') return { label: 'Pray', fn: () => openShrine(o.bio) };
  if (k === 'altar') return { label: 'Altar', fn: openAltar };
  if (k === 'well') return { label: 'Wish', fn: wishWell };
  if (k === 'sign' || k === 'statue') return { label: 'Read', fn: () => toast(o.text || 'Weathered letters you can\'t quite read.') };
  if (k === 'grave') return { label: 'Read', fn: () => toast('HERE LIES PIP THE ELDER. HE MADE GOOD ALE.') };
  if (k === 'cave') return { label: 'Enter', fn: () => { S.poiSeen = S.poiSeen || {}; goMap(o.id); } };
  if (k === 'cart') return { label: 'Trade', fn: openMerchant };
  if (k === 'fairy') return { label: 'Look', fn: () => fairyRing(m, x, y, o) };
  if (k === 'tent') return { label: 'Look', fn: () => toast('Bedrolls, a broken lute and the smell of stew. Bandits live here.') };
  if (k === 'wreck') return { label: 'Look', fn: () => toast('The hull reads "MARIGOLD". Something rattles in the hold.') };
  return null;
}
function act() {
  if (PAUSED) return;
  if (fishing) { fishAct(); return; }
  const it = findInteract(); if (it) { it.fn(); return; }
  useTool();
}
function useTool() {
  if (pl.cd > 0) return;
  const m = cur, [tx, ty] = faceTile(), k = selKind(); pl.cd = .28; pl.anim = .25; pl.tool = k;
  if (k === 'weapon') { attack(); return; }
  if (!isTool(k)) { useItem(k); return; }
  if (S.p.st <= 0 && k !== 'rod') { toast('Too tired to work. Eat or sleep.', 'bad'); SFX.bad(); return; }
  const lvl = S.tools[k] || 1, cost = b => Math.max(.5, b - (S.sk[{ hoe: 'farming', can: 'farming', axe: 'woodcutting', pick: 'mining', rod: 'fishing', scythe: 'farming' }[k]].l - 1) * .15);
  const [ax, ay, o] = mainOf(m, tx, ty), t = getT(m, tx, ty);
  if (k === 'scythe') { if (scytheSwing(m, tx, ty, lvl)) useStamina(cost(1)); return; }
  if (o && (o.k === 'weed' || o.k === 'tgrass')) { cutGrass(m, ax, ay, o); return; }
  if (k === 'hoe') {
    if (o && o.k === 'dig') { digSpot(m, ax, ay); useStamina(cost(2)); return; }
    if (o && o.k === 'buried') { digBuried(m, ax, ay, o); return; }
    if (S.tmap && m.id === 'wilds' && Math.abs(S.tmap.x - tx) <= 1 && Math.abs(S.tmap.y - ty) <= 1) { digTreasure(); return; }
    if (!m.farm) { if (['g', 'd', 's', 'sn', 'a'].includes(t) && !o) { dust(tx, ty, '#7a4e2d'); SFX.till(); if (Math.random() < .03 + PS.luck * .01) { give(pickR(['clay', 'stone', 'coal', 'wild_leek']), 1); } } return; }
    let did = false; for (const [x, y] of areaTiles(tx, ty, lvl)) { const i = y * m.w + x, T = getT(m, x, y); if (inb(m, x, y) && (T === 'g' || T === 'd') && !getO(m, x, y) && !m.solidB[i] && !m.soil[i]) { m.soil[i] = { wet: S.weather === 'rain' && m.outdoor, crop: null }; did = true; dust(x, y, '#7a4e2d'); } }
    if (did) { SFX.till(); useStamina(cost(2)); addXP('farming', 1); }
  } else if (k === 'can') {
    if (TER[t].water) { S.water = canCap(); SFX.splash(); toast('Watering can refilled.'); return; }
    if (S.water <= 0) { toast('Your can is empty. Refill at any water.', 'bad'); SFX.bad(); return; }
    let did = false; for (const [x, y] of areaTiles(tx, ty, lvl)) { const s = m.soil[y * m.w + x]; if (s && S.water > 0) { if (!s.wet) { s.wet = true; did = true; S.water--; } sparkle(x, y, '#9fd3e6'); } }
    if (did) { SFX.water(); useStamina(cost(2)); addXP('farming', 1); }
  } else if (k === 'axe' || k === 'pick') {
    if (o && OBJ[o.k]) {
      const D = OBJ[o.k];
      if (D.place && !o.fixed) { if (k === 'pick' || o.k === 'fence') { if (D.mach && o.out) { toast('Collect what\'s inside first.'); return; } delObj(m, ax, ay); give(o.k, 1, 0, true); SFX.pick(); } return; }
      if (o.k === 'ftree' && k === 'axe') { if (!o.chop) { o.chop = 1; toast('Chop again to cut down this fruit tree.'); return; } delObj(m, ax, ay); give('wood', 8); return; }
      if (D.tool === k) { if (D.tlvl && lvl < D.tlvl) { toast('You need a better ' + (k === 'axe' ? 'axe' : 'pickaxe') + ' (' + TIER_TOOL[D.tlvl] + ').', 'bad'); SFX.bad(); o.shake = .2; return; } hitObj(m, ax, ay, o, power(lvl)); useStamina(cost(3)); return; }
      if (D.tool) { toast('Use the ' + (D.tool === 'axe' ? 'axe' : 'pickaxe') + ' on that.'); return; }
    }
    if (k === 'pick' && m.soil[ty * m.w + tx] && !m.soil[ty * m.w + tx].crop) { delete m.soil[ty * m.w + tx]; SFX.till(); return; }
    SFX.swing();
  } else if (k === 'rod') {
    const d = DIRV[S.p.dir], t2 = getT(m, tx + d[0], ty + d[1]);
    if (TER[t].water || TER[t].lava || TER[t2].water || TER[t2].lava) startFishing(TER[t].lava || TER[t2].lava); else toast('Face water to cast your line.');
  }
}
const TIER_TOOL = ['', 'Basic', 'Copper', 'Iron', 'Gold', 'Mythril'];
const power = l => 1 + (l - 1) * .9;
const canCap = () => 20 + (S.tools.can - 1) * 15;
function forageQ() { if (hasPerk('botanist')) return Math.random() < .2 ? 3 : 2; const r = Math.random(), f = S.sk.foraging.l; return r < f * .015 ? 2 : r < .1 + f * .04 ? 1 : 0; }
function animalQ(qlt, aff) { const sc = qlt * .5 + aff * .3 + S.sk.husbandry.l * 3 + Math.random() * 30; return sc > 88 ? 3 : sc > 68 ? 2 : sc > 48 ? 1 : 0; }
function cutGrass(m, x, y, o) {
  if (o.k === 'weed') { hitObj(m, x, y, o, 9); return; }
  setO(m, x, y, null); for (let i = 0; i < 5; i++) PARTS.push({ x: (x + .5) * 16, y: (y + .6) * 16, vx: (Math.random() - .5) * 50, vy: -Math.random() * 50, t: .4, c: GRASS[Math.min(2, S.season)][0] });
  if (Math.random() < .3) dropItem(m, (x + .5) * 16, (y + .5) * 16, 'hay', 1); else if (Math.random() < .35) dropItem(m, (x + .5) * 16, (y + .5) * 16, 'fiber', 1); // the scythe always gives both
  if (Math.random() < .015) dropItem(m, (x + .5) * 16, (y + .5) * 16, pickR(['herb', 'wild_leek', 'turnip_seed', 'wheat_seed']), 1);
  noiseBurst(.05, .03, 2500);
}
function hitObj(m, tx, ty, o, pow) {
  const D = OBJ[o.k]; o.hp = (o.hp === undefined ? D.hp : o.hp) - pow; o.shake = .25;
  const col = D.tool === 'axe' ? '#9a6a3a' : D.tool === 'pick' ? '#8e8a84' : '#6fae4f';
  for (let i = 0; i < 6; i++) PARTS.push({ x: (tx + .5) * 16, y: (ty + .5) * 16, vx: (Math.random() - .5) * 70, vy: -Math.random() * 70, t: .5, c: col });
  D.tool === 'pick' ? SFX.pick() : SFX.chop();
  if (o.hp > 0) return;
  const sk = D.xp && D.xp[0], extra = (sk === 'woodcutting' && hasPerk('forester') ? .25 : 0);
  for (const [id, a, b] of D.drop || []) { let n = ri(a, b); if (id === 'wood' && extra) n = Math.round(n * 1.25); if (D.ore && hasPerk('miner') && id !== 'stone') n++; if (n > 0) for (let i = 0; i < n; i++) dropItem(m, (tx + .5 + (D.w ? .5 : 0)) * 16, (ty + .3) * 16, id, 1); }
  if (D.tree && (hasPerk('lumberjack') || o.kind === 'oak') && Math.random() < (hasPerk('lumberjack') ? .25 : .08)) dropItem(m, (tx + .5) * 16, (ty + .5) * 16, 'hardwood', 1);
  if (D.tree && Math.random() < (hasPerk('tapper') ? .35 : .05)) dropItem(m, (tx + .5) * 16, (ty + .5) * 16, 'sap', 1);
  if (D.tree && Math.random() < .03) dropItem(m, (tx + .5) * 16, (ty + .5) * 16, pickR(['apple_sapling', 'cherry_sapling', 'hazelnut', 'herb']), 1);
  if (D.xp) addXP(D.xp[0], D.xp[1]);
  if (D.reveal) { toast('The way opens. A hidden passage!', 'lvl'); SFX.secret(); }
  if (o.k === 'meteor') { S.meteor = null; }
  if (D.becomes) setO(m, tx, ty, { k: D.becomes, regrow: 5, was: o.k, kind: o.kind, snow: o.snow }); else delObj(m, tx, ty);
  if (m.mine && Math.random() < .015) spawnEnemy(m, wpick(MINE_EN[m.theme]), (tx + .5) * 16, (ty + .8) * 16, m.mine);
  if (m.mine && D.ore && Math.random() < (hasPerk('prospector') ? .025 : .008) && !m.ladderSpawned && !MINE_BOSS[m.mine]) { m.ladderSpawned = 1; setO(m, tx, ty, { k: 'ladder' }); toast('A hidden ladder!'); }
}
function dropItem(m, x, y, id, n) { m.ents.push({ type: 'drop', id, n, x: x + (Math.random() - .5) * 10, y: y + (Math.random() - .5) * 8, z: 0, vz: 60 + Math.random() * 50, t: 0 }); }
function harvest(m, tx, ty) {
  const s = m.soil[ty * m.w + tx], C = CROPS[s.crop.k], f = S.sk.farming.l;
  const fg = s.fert === 'rich_compost' ? .35 : s.fert === 'compost' ? .15 : 0, ag = hasPerk('agronomist') ? .2 : 0;
  const r = Math.random(); let q = r < (s.fert === 'rich_compost' && f >= 8 ? .06 : 0) ? 3 : r < .02 + f * .02 + fg * .6 + ag ? 2 : r < .12 + f * .035 + fg + ag ? 1 : 0;
  let n = C.y > 1 ? ri(1, C.y) : 1; if (Math.random() < f * .04 + (hasPerk('abundance') ? .25 : 0)) n++;
  give(s.crop.k, n, q); S.stats.harvest += n; addXP('farming', Math.max(3, Math.round(C.p / 10))); SFX.pick();
  if (C.re) s.crop.age = C.d - C.re; else { s.crop = null; s.fert = null; }
  sparkle(tx, ty, '#f5e08a');
}
function useItem(id) {
  if (!id || !has(id)) { if (id) { S.hot[S.sel] = null; } openMenu('bag'); return; }
  const it = IT[id], m = cur, [tx, ty] = faceTile(), i = ty * m.w + tx;
  if (it.t === 'seed') {
    const s = m.soil[i]; if (!s) { toast('Till the soil first.'); return; } if (s.crop) return;
    const C = CROPS[it.crop]; if (!m.noSeason && !C.s.includes(S.season)) { toast(C.n + ' only grows in ' + C.s.map(q => SEASONS[q]).join(', ') + '. Try the greenhouse.', 'bad'); return; }
    s.crop = { k: it.crop, age: 0 }; take(id); addXP('farming', 1); SFX.till(); return;
  }
  if (it.t === 'fert') { const s = m.soil[i]; if (!s) { toast('Use fertilizer on tilled soil.'); return; } if (s.fert) { toast('This soil is already fertilized.'); return; } s.fert = id; take(id); sparkle(tx, ty, '#c8e08a'); SFX.pop(); return; }
  if (it.t === 'sapling') { if (!m.farm) { toast('Plant saplings on your farm.'); return; } if (!areaFree(m, tx, ty, 1, 1) || m.soil[i]) { toast('Needs a clear patch of ground.'); return; } setO(m, tx, ty, { k: 'ftree', tree: it.tree, age: 0, fruit: 0 }); take(id); SFX.till(); toast('Planted. It will bear fruit in about two weeks.'); return; }
  if (it.t === 'place') {
    if (!m.farm) { toast('Place that on your farm.'); return; }
    const D = OBJ[it.place]; if (!areaFree(m, tx, ty, D.w || 1, D.h || 1) || (m.soil[i] && m.soil[i].crop)) { toast('Something is in the way.'); return; }
    delete m.soil[i]; putObj(m, tx, ty, { k: it.place, cd: 3 }); take(id); SFX.till(); return;
  }
  if (id === 'staircase') { if (!m.mine) { toast('Use this in the mines.'); return; } take(id); S.mineFloor = m.mine + 1; goMap('mine'); return; }
  if (id === 'warp_totem') { take(id); goMap('farm', 9.5 * 16, 10.5 * 16, 0); return; }
  if (id === 'treasure_map') { readMap(); return; }
  if (it.eat) { eat(id); return; }
  if (it.slot) { equip(id); return; }
  if (m.id === 'farm' || m.id === 'greenhouse') { const [ax, ay, o] = mainOf(m, tx, ty); if (o && OBJ[o.k] && OBJ[o.k].mach) { machineInteract(o).fn(); return; } }
  toast('You can\'t use that here.');
}
function eat(id) {
  const it = IT[id]; if (!take(id)) return;
  const mult = it.t === 'food' ? 1 + (S.sk.cooking.l - 1) * .04 + (hasPerk('chef') ? .3 : 0) : 1;
  const hp = Math.round(it.eat[0] * mult), st = Math.round(it.eat[1] * mult);
  S.p.hp = Math.min(maxHP(), S.p.hp + hp); S.p.st = Math.min(maxST(), S.p.st + st);
  if (it.buff) { const dur = it.buff.dur * (hasPerk('feast') ? 2 : 1); S.buffs = S.buffs.filter(b => b.id !== id); S.buffs.push(Object.assign({}, it.buff, { id, t: dur })); toast(it.n + ' gives you a boost for ' + Math.round(dur / 60) + ' minutes.'); recalc(); }
  if (hasPerk('ironstomach') && it.t === 'food' && S.bonus.eatHp < 40) { S.bonus.eatHp += 2; recalc(); }
  floatText(S.p.x, S.p.y - 26, '+' + hp, '#7be07b'); SFX.ok();
}
function equip(id) {
  const it = IT[id]; let slot = it.slot; if (slot === 'ring') slot = !S.eq.ring1 ? 'ring1' : !S.eq.ring2 ? 'ring2' : 'ring1';
  const old = S.eq[slot]; if (!take(id)) return; if (old) give(old, 1, 0, true); S.eq[slot] = id;
  if (slot === 'weapon') { S.hot[5] = 'weapon'; } HC_P = null; recalc(); toast('Equipped ' + it.n + '.'); SFX.ok();
}
function unequip(slot) { if (slot === 'weapon') return; const o = S.eq[slot]; if (!o) return; give(o, 1, 0, true); S.eq[slot] = null; HC_P = null; recalc(); }
/* ---- combat ---- */
function attack() {
  if (pl.atk > 0 || pl.roll > 0) return;
  const W = IT[S.eq.weapon], wt = PS.wt, T = WTYPE[wt]; pl.atk = PS.cd; pl.swing = (typeof SWING_T !== 'undefined' && SWING_T[wt]) || Math.min(.22, PS.cd * .7); pl.swingT = pl.swing;
  if (wt === 'bow') {
    const ammo = has('fire_arrow') ? 'fire_arrow' : has('arrow') ? 'arrow' : null;
    if (!ammo) { toast('Out of arrows. Craft some at a workbench.', 'bad'); return; }
    take(ammo); SFX.bow(); const d = DIRV[S.p.dir];
    cur.ents.push({ type: 'proj', mine: 1, x: S.p.x + d[0] * 8, y: S.p.y - 10 + d[1] * 6, vx: d[0] * 260, vy: d[1] * 260, dmg: PS.atk * (1 + PS.dmg) * (ammo === 'fire_arrow' ? 1.3 : 1), life: .9, k: ammo === 'fire_arrow' ? 'fire' : 'arrow', burn: ammo === 'fire_arrow' });
    return;
  }
  SFX.swing();
  const d = DIRV[S.p.dir], cx = S.p.x, cy = S.p.y - 8, face = Math.atan2(d[1], d[0]);
  let hitAny = false;
  for (const e of cur.ents) if (e.type === 'enemy' && e.hp > 0) {
    const E = EN[e.k], ex = e.x, ey = e.y - E.r, dd = dist(ex, ey, cx, cy), a = Math.atan2(ey - cy, ex - cx), da = Math.abs(((a - face + 9.42) % 6.283) - 3.14);
    const reach = T.reach + E.r + (wt === 'spear' ? 4 : 0);
    if (dd < reach && (dd < E.r + 6 || da < T.arc)) { damageEnemy(e, PS.atk * (1 + PS.dmg), wt); hitAny = true; }
  }
  // grass & weeds in arc
  const [tx, ty] = faceTile(); for (const [x, y] of [[tx, ty], [tx + d[1], ty + d[0]], [tx - d[1], ty - d[0]]]) { const o = getO(cur, x, y); if (o && (o.k === 'tgrass' || o.k === 'weed')) cutGrass(cur, x, y, o); }
  if (hitAny) { SFX.hit(); SHAKE = wt === 'hammer' ? .15 : .07; }
}
function damageEnemy(e, base, wt) {
  const E = EN[e.k]; let dmg = base * (.88 + Math.random() * .24); if (E.undead) dmg *= 1 + (PS.holy || 0);
  const crit = Math.random() < PS.crit; if (crit) dmg *= wt === 'dagger' ? 2.4 : 2;
  dmg = Math.max(1, Math.round(dmg - E.def * .5)); e.hp -= dmg; e.flash = .12;
  const a = Math.atan2(e.y - S.p.y, e.x - S.p.x), kb = E.boss ? 20 : wt === 'hammer' ? 260 : 150; e.vx = Math.cos(a) * kb; e.vy = Math.sin(a) * kb; e.kb = E.boss ? .05 : .15;
  if (wt === 'hammer' && !E.boss) e.stun = .5;
  if (PS.slow || PS.elem === 'ice') e.st.slow = 2; if (PS.burn || PS.elem === 'fire') e.st.burn = 3;
  floatText(e.x, e.y - E.r * 2 - 6, (crit ? '★' : '') + dmg, crit ? '#ffd040' : '#ffffff');
  if (e.hp <= 0) killEnemy(cur, e);
}
function killEnemy(m, e) {
  if (e.dead) return; const E = EN[e.k]; e.dead = true; addXP('combat', E.xp); S.stats.kills++;
  const first = E.boss && !S.bosses[e.k];
  for (const [id, ch, a, b] of E.drops) { if (id === 'ember_shard' && !first) continue; if (Math.random() < ch * (1 + PS.luck * .1)) { const n = ri(a, b); if (id === '$') dropItem(m, e.x, e.y - 4, '$', Math.round(n * (1 + e.lvl * .05))); else for (let i = 0; i < n; i++) dropItem(m, e.x, e.y - 4, id, 1); } }
  for (let i = 0; i < 14; i++) PARTS.push({ x: e.x, y: e.y - 8, vx: (Math.random() - .5) * 140, vy: (Math.random() - .5) * 140, t: .6, c: E.col || '#d8d4c8' });
  if (E.boss) {
    SFX.boom(); SHAKE = .6; S.bosses[e.k] = (S.bosses[e.k] || 0) + 1; S.bossDay = S.bossDay || {}; S.bossDay[e.k] = dayIndex();
    toast(E.n + ' is defeated!', 'lvl');
    if (m.mine) { const tx = Math.floor(e.x / 16), ty = Math.floor((e.y - 4) / 16); setT(m, tx, ty, 'c'); setO(m, tx, ty, { k: 'ladder' }); }
  }
}
function hurtPlayer(dmg, sx, sy, elem) {
  if (pl.inv > 0 || pl.roll > 0) return;
  if (S.eq.shield && Math.random() < IT[S.eq.shield].block) { dmg *= .3; floatText(S.p.x, S.p.y - 30, 'Block', '#c8d0d8'); snd(800, .05, 'square', .04); }
  const d = Math.max(1, Math.round(dmg - PS.def)); S.p.hp -= d; pl.inv = .9; SFX.hurt(); SHAKE = .15;
  if (elem === 'fire' && !PS.fireres) pl.burn = 3; if (elem === 'ice') pl.chill = 2.5;
  floatText(S.p.x, S.p.y - 26, '-' + d, '#ff6a5a');
  const a = Math.atan2(S.p.y - sy, S.p.x - sx); pl.kbx = Math.cos(a) * 170; pl.kby = Math.sin(a) * 170;
  if (navigator.vibrate) try { navigator.vibrate(35); } catch (e) { }
  if (S.p.hp <= 0) { S.p.hp = 0; faint('You were knocked out…'); }
}
function faint(msg) { const lost = Math.min(2500, Math.round(S.gold * .1)); S.gold -= lost; toast(msg + (lost ? ' You lost ' + lost + 'g.' : ''), 'bad'); endDay(true); }
function dodge() {
  if (PAUSED || pl.rollCd > 0 || pl.roll > 0 || fishing || S.mounted) return;
  let [ix, iy] = keyVec(); if (Math.hypot(ix, iy) < .2) { const d = DIRV[S.p.dir]; ix = d[0]; iy = d[1]; } const n = Math.hypot(ix, iy); pl.rdx = ix / n; pl.rdy = iy / n;
  pl.roll = .28; pl.rollCd = hasPerk('acrobat') ? .45 : .9; useStamina(1.5); noiseBurst(.12, .04, 900);
}
/* ---- enemies ---- */
function updateEnemies(m, dt) {
  const p = S.p;
  for (const e of m.ents) {
    if (e.type !== 'enemy' || e.dead) continue;
    const E = EN[e.k]; e.t += dt; if (e.flash > 0) e.flash -= dt;
    if (e.st.burn > 0) { e.st.burn -= dt; e.burnT = (e.burnT || 0) + dt; if (e.burnT > .5) { e.burnT = 0; const bd = Math.max(1, Math.round(e.mhp * .015 + 2)); e.hp -= bd; floatText(e.x, e.y - E.r * 2, bd, '#ff8a3a'); if (Math.random() < .5) PARTS.push({ x: e.x, y: e.y - 8, vx: 0, vy: -30, t: .4, c: '#ff8a3a' }); if (e.hp <= 0) { killEnemy(m, e); continue; } } }
    if (e.st.slow > 0) e.st.slow -= dt;
    const dx = p.x - e.x, dy = (p.y - 4) - (e.y - 4), d = Math.hypot(dx, dy) || 1, spd = E.spd * (e.st.slow > 0 ? .5 : 1);
    if (e.kb > 0) { e.kb -= dt; moveEnt(m, e, e.vx * dt, e.vy * dt, 4); continue; }
    if (e.stun > 0) { e.stun -= dt; continue; }
    let mx = 0, my = 0; const aggro = d < (E.boss ? 260 : 130);
    const wander = () => { e.ai.t -= dt; if (e.ai.t <= 0) { e.ai.t = 2 + Math.random() * 2; const a = Math.random() * 6.28; e.wx = Math.cos(a) * 14; e.wy = Math.sin(a) * 14; if (Math.random() < .4) e.wx = e.wy = 0; } mx = e.wx || 0; my = e.wy || 0; };
    switch (E.ai) {
      case 'hop': e.ai.t -= dt; if (e.ai.t <= 0) { e.ai.t = .9 + Math.random() * .6; e.hopT = .35; if (aggro) { e.hx2 = dx / d; e.hy2 = dy / d; } else { const a = Math.random() * 6.28; e.hx2 = Math.cos(a) * .5; e.hy2 = Math.sin(a) * .5; } } if (e.hopT > 0) { e.hopT -= dt; mx = e.hx2 * spd * 2.2; my = e.hy2 * spd * 2.2; } break;
      case 'fly': if (aggro) { mx = dx / d * spd + Math.sin(e.t * 6) * 30; my = dy / d * spd + Math.cos(e.t * 5) * 30; } else { mx = Math.sin(e.t) * 20; my = Math.cos(e.t * 1.3) * 20; } break;
      case 'chase': if (aggro) { mx = dx / d * spd; my = dy / d * spd; } else wander(); break;
      case 'ghost': if (aggro) { mx = dx / d * spd; my = dy / d * spd; } else wander(); e.x += mx * dt; e.y += my * dt; mx = my = 0; break;
      case 'ambush': if (!e.awake) { if (d < 40) { e.awake = 1; e.flash = .3; } break; } mx = dx / d * spd; my = dy / d * spd; break;
      case 'charge': { const A = e.ai; if (!aggro) { wander(); break; } A.c = (A.c || 0) + dt; if (A.c < 1.4) { mx = dx / d * spd * .4; my = dy / d * spd * .4; } else if (A.c < 1.9) { e.tele2 = 1; A.cx = dx / d; A.cy = dy / d; } else if (A.c < 2.5) { e.tele2 = 0; mx = A.cx * spd * 4; my = A.cy * spd * 4; } else A.c = 0; break; }
      case 'swoop': { const A = e.ai; A.a = (A.a || Math.random() * 6) + dt * 1.6; if (aggro) { A.c = (A.c || 0) + dt; if (A.c > 3) { mx = dx / d * spd * 2.6; my = dy / d * spd * 2.6; if (A.c > 3.7) A.c = 0; } else { const tx = p.x + Math.cos(A.a) * 50, ty = p.y + Math.sin(A.a) * 40; mx = clamp(tx - e.x, -1, 1) * spd; my = clamp(ty - e.y, -1, 1) * spd; } } else { mx = Math.cos(A.a) * 20; my = Math.sin(A.a) * 20; } e.x += mx * dt; e.y += my * dt; mx = my = 0; break; }
      case 'ranged': { if (!aggro) { wander(); break; } const want = 70; if (d < want - 10) { mx = -dx / d * spd; my = -dy / d * spd; } else if (d > want + 20) { mx = dx / d * spd; my = dy / d * spd; } else { mx = -dy / d * spd * .5; my = dx / d * spd * .5; } e.ai.s = (e.ai.s || 1 + Math.random()) - dt; if (e.ai.s <= 0) { e.ai.s = 1.8 + Math.random(); const a = Math.atan2(dy, dx); proj(m, e.x, e.y - 10, a, E.shot === 'arrow' ? 150 : 110, e.atk, E.shot || 'rock'); if (E.shot === 'fire') SFX.fire(); } break; }
      case 'boss': bossAI(m, e, dt, dx, dy, d); break;
    }
    if (mx || my) { e.dir = mx < 0 ? -1 : 1; if (E.ai === 'fly') { e.x += mx * dt; e.y += my * dt; if (solidAt(m, e.x, e.y)) { e.x -= mx * dt; e.y -= my * dt; } } else moveEnt(m, e, mx * dt, my * dt, E.boss ? 8 : 4); }
    if (e.arena) { const ax = e.arena.x * 16, ay = e.arena.y * 16, ad = dist(e.x, e.y, ax, ay); if (ad > 150) { e.x += (ax - e.x) * dt; e.y += (ay - e.y) * dt; } }
    if (d < E.r + 7 && !e.dead && (E.ai !== 'ambush' || e.awake)) hurtPlayer(e.atk, e.x, e.y, E.elem);
  }
  for (const b of m.ents) if (b.type === 'proj' && !b.dead) {
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || (b.k !== 'fire' && b.k !== 'void' && solidAt(m, b.x, b.y + 4))) { b.dead = true; continue; }
    if (b.mine) { for (const e of m.ents) if (e.type === 'enemy' && !e.dead && dist(e.x, e.y - EN[e.k].r, b.x, b.y) < EN[e.k].r + 4) { damageEnemy(e, b.dmg, 'bow'); if (b.burn) e.st.burn = 3; b.dead = true; break; } }
    else if (dist(b.x, b.y, p.x, p.y - 10) < 9) { hurtPlayer(b.dmg, b.x, b.y, b.k === 'fire' ? 'fire' : b.k === 'ice' ? 'ice' : null); b.dead = true; }
  }
}
function proj(m, x, y, a, sp, dmg, k) { m.ents.push({ type: 'proj', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg, life: 3, k }); }
function bossAI(m, e, dt, dx, dy, d) {
  const E = EN[e.k], A = e.ai, rage = e.hp < e.mhp / 2, pk = E.elem === 'fire' ? 'fire' : E.elem === 'ice' ? 'ice' : E.undead ? 'void' : 'rock';
  A.t += dt * (rage ? 1.35 : 1);
  if (!A.move || A.t > A.dur) { A.move = E.moves[A.i = ((A.i || 0) + 1) % E.moves.length]; A.t = 0; A.dur = { walk: 2.2, slam: 1.6, ring: 1.2, volley: 1.4, charge: 2, circle: 3, blink: 1.2 }[A.move.split(':')[0]] || 1.5; A.did = 0; }
  const mv = A.move.split(':'), sp = E.spd * (rage ? 1.3 : 1);
  if (mv[0] === 'walk' || mv[0] === 'volley' || mv[0] === 'ring') moveEnt(m, e, dx / d * sp * dt * (mv[0] === 'walk' ? 1 : .4), dy / d * sp * dt * (mv[0] === 'walk' ? 1 : .4), 8);
  if (mv[0] === 'slam') { if (A.t < .9) { e.tele = A.t / .9; if (!A.sx) { A.sx = S.p.x; A.sy = S.p.y; } } else if (!A.did) { A.did = 1; e.tele = 0; SFX.boom(); SHAKE = .35; if (dist(S.p.x, S.p.y, A.sx, A.sy) < 36) hurtPlayer(e.atk * 1.4, A.sx, A.sy - 1, E.elem); for (let i = 0; i < 16; i++) PARTS.push({ x: A.sx, y: A.sy, vx: (Math.random() - .5) * 160, vy: -Math.random() * 110, t: .6, c: E.col || '#8a857e' }); A.sx = 0; } }
  if (mv[0] === 'ring' && !A.did && A.t > .4) { A.did = 1; const n = rage ? 18 : 12; for (let i = 0; i < n; i++) proj(m, e.x, e.y - E.r, i / n * 6.283 + e.t, 85, e.atk * .7, pk); SFX.fire(); }
  if (mv[0] === 'volley' && A.t > .3) { A.vc = (A.vc || 0) + dt; if (A.vc > (rage ? .22 : .35)) { A.vc = 0; const a = Math.atan2(dy, dx); proj(m, e.x, e.y - E.r, a + (Math.random() - .5) * .3, 130, e.atk * .75, pk); SFX.fire(); } }
  if (mv[0] === 'charge') { if (A.t < .7) { e.tele2 = 1; A.cx = dx / d; A.cy = dy / d; } else if (A.t < 1.4) { e.tele2 = 0; moveEnt(m, e, A.cx * sp * 4 * dt, A.cy * sp * 4 * dt, 8); } }
  if (mv[0] === 'circle') { const ang = Math.atan2(-dy, -dx) + dt * 1.2, tx = S.p.x + Math.cos(ang) * 80, ty = S.p.y + Math.sin(ang) * 70; moveEnt(m, e, clamp(tx - e.x, -1, 1) * 70 * dt, clamp(ty - e.y, -1, 1) * 70 * dt, 8); A.vc = (A.vc || 0) + dt; if (A.vc > .8) { A.vc = 0; proj(m, e.x, e.y - E.r, Math.atan2(dy, dx), 120, e.atk * .7, pk); } }
  if (mv[0] === 'blink' && !A.did && A.t > .6) { A.did = 1; const a = Math.random() * 6.28; const nx = S.p.x + Math.cos(a) * 70, ny = S.p.y + Math.sin(a) * 60; if (boxFree(m, nx, ny, 8)) { e.x = nx; e.y = ny; } for (let i = 0; i < 12; i++) PARTS.push({ x: e.x, y: e.y - 10, vx: (Math.random() - .5) * 90, vy: (Math.random() - .5) * 90, t: .5, c: '#9a6aff' }); }
  if (mv[0] === 'summon' && !A.did) { A.did = 1; const n = m.ents.filter(x => x.type === 'enemy' && !EN[x.k].boss).length; if (n < 6) for (let i = 0; i < 2 + (rage ? 1 : 0); i++) { const a = Math.random() * 6.28; spawnEnemy(m, mv[1], e.x + Math.cos(a) * 30, e.y + Math.sin(a) * 30, e.lvl); } }
}
/* open-world spawning */
let spawnAcc = 0;
function wildSpawns(m, dt) {
  spawnAcc += dt; if (spawnAcc < 1) return; spawnAcc = 0;
  const p = S.p, ptx = p.x / 16, pty = p.y / 16, night = S.time >= 1200 || S.time < 360;
  m.ents = m.ents.filter(e => e.type !== 'enemy' || EN[e.k].boss || dist(e.x, e.y, p.x, p.y) < 36 * 16);
  for (const a of m.arenas) {
    const bk = a.boss, avail = !S.bosses[bk] || dayIndex() - ((S.bossDay || {})[bk] || 0) >= 7;
    if (!avail || m.ents.some(e => e.k === bk)) continue;
    if (dist(ptx, pty, a.x, a.y) < 13) { const e = spawnEnemy(m, bk, a.x * 16, (a.y - 2) * 16, BIOME_EN[a.bio].lvl); e.arena = a; toast(EN[bk].n + ' appears!', 'bad'); SFX.boom(); }
  }
  const near = m.ents.filter(e => e.type === 'enemy').length, bio = BIOMES[m.bio[Math.floor(pty) * m.w + Math.floor(ptx)]];
  const target = (night ? 9 : 6) + (bio === 'frost' || bio === 'ash' ? 2 : 0) - (bio === 'meadow' ? 2 : 0);
  if (near >= target || pty > m.h - 10) return;
  for (let tries = 0; tries < 8; tries++) {
    const a = Math.random() * 6.28, r = 13 + Math.random() * 8, x = Math.floor(ptx + Math.cos(a) * r), y = Math.floor(pty + Math.sin(a) * r);
    if (!inb(m, x, y) || y > m.h - 12 || solidAt(m, (x + .5) * 16, (y + .5) * 16) || TER[getT(m, x, y)].water || getT(m, x, y) === 'd') continue;
    const b = BIOMES[m.bio[y * m.w + x]], T = BIOME_EN[b]; if (m.arenas.some(ar => dist(ar.x, ar.y, x, y) < 9)) continue;
    spawnEnemy(m, wpick(night ? T.night : T.day), (x + .5) * 16, (y + .8) * 16, T.lvl + Math.floor(S.year - 1) * 3); break;
  }
}
/* drops */
function updateDrops(m, dt) {
  const mag = 42 + (PS.magnet ? 40 : 0);
  for (const d of m.ents) {
    if (d.type !== 'drop') continue; d.t += dt;
    if (d.vz || d.z > 0) { d.z += d.vz * dt; d.vz -= 260 * dt; if (d.z <= 0) { d.z = 0; d.vz = Math.abs(d.vz) > 30 ? -d.vz * .4 : 0; } }
    const dd = dist(d.x, d.y, S.p.x, S.p.y - 4);
    if (d.t > .4 && dd < mag) { d.x += (S.p.x - d.x) * dt * 9; d.y += (S.p.y - 4 - d.y) * dt * 9; }
    if (d.t > .4 && dd < 8) { GIVE_NO_DROP = true; const left = give(d.id, d.n, d.q || 0) || 0; GIVE_NO_DROP = false; if (left > 0 && d.id !== '$') { d.n = left; d.t = -1.5; } else { d.dead = true; if (d.id !== '$') SFX.pop(); } } // a full backpack leaves the rest on the ground
  }
}
/* ---- animals & genetics ---- */
function updateAnimals(dt) {
  const P = MAPS.farm.pasture;
  for (const a of S.animals) {
    if (S.mounted && a.id === S.rideId) continue;
    a.t -= dt; if (a.t <= 0) { a.t = 1.5 + Math.random() * 3; if (Math.random() < .55) { const ang = Math.random() * 6.28, sp = a.sp === 'horse' ? 24 : 12; a.vx = Math.cos(ang) * sp; a.vy = Math.sin(ang) * sp; } else a.vx = a.vy = 0; }
    a.x = clamp(a.x + a.vx * dt, P.x0 + 8, P.x1 - 8); a.y = clamp(a.y + a.vy * dt, P.y0 + 12, P.y1 - 2);
    if (a.vx) a.dir = a.vx < 0 ? -1 : 1; a.walk = (a.walk || 0) + (a.vx || a.vy ? dt : 0);
  }
}
function petAnimal(a) {
  if (!a.pet) { a.pet = true; a.aff = Math.min(100, a.aff + (a.traits.includes('gentle') ? 8 : 4) * (1 + a.g.tem / 200)); addXP('husbandry', 5); SFX.ok(); for (let i = 0; i < 3; i++) FX.push({ x: a.x + (i - 1) * 6, y: a.y - 22, txt: '♥', c: '#ff7a9a', t: 1.2, big: 1 }); toast(a.name + ' leans into your hand.'); }
  else openMenu('animals', null, a.id);
}
const horseRating = h => Math.round((h.g.spd + h.g.sta + h.g.str + h.g.agi) / 4);
const animalScore = a => a.sp === 'horse' ? horseRating(a) : Math.round((a.g.yld + a.g.qlt + a.g.fer + a.g.vig) / 4);
function randGenes(sp, base, spread) { const g2 = {}; for (const k of ANIMAL[sp].genes) g2[k] = clamp(Math.round(base + (Math.random() - .5) * spread * 2), 5, 100); return g2; }
function randCoat(sp) { const ks = Object.keys(COATS[sp]).filter(k => !['ember', 'gold', 'golden', 'royal', 'silver', 'pinto', 'white'].includes(k) || (sp !== 'horse' && k === 'white')); return pickR(ks); }
function newAnimal(sp, genes, coat, age, traits) {
  const used = S.animals.map(o => o.name), free = NAMES[sp].filter(n => !used.includes(n));
  const a = { id: S.nid++, sp, name: free.length ? pickR(free) : pickR(NAMES[sp]) + ' ' + ['II', 'III', 'IV', 'V', 'VI'][ri(0, 4)], sex: Math.random() < .5 ? 'F' : 'M', age: age || 0, aff: 20, g: genes, coat, traits: traits || [], preg: 0, pet: false, cd: 0, bday: dayIndex() };
  S.animals.push(a); return a;
}
const capFor = sp => BUILD[ANIMAL[sp].house].lv[S.build[ANIMAL[sp].house] - 1][2];
const countIn = house => S.animals.filter(a => ANIMAL[a.sp].house === house).length;
function tryBreed(a, b) {
  const fem = a.sex === 'F' ? a : b, male = a.sex === 'F' ? b : a, A = ANIMAL[a.sp], fer = (a.g.fer + b.g.fer) / 2;
  fem.bred = dayIndex(); male.bred = dayIndex();
  if (Math.random() > .45 + fer / 160 + (a.aff + b.aff) / 600) { toast('They didn\'t take to each other today. Try again tomorrow.'); SFX.bad(); return; }
  fem.preg = Math.max(1, A.preg - Math.floor(fer / 45) - (hasPerk('breeder') ? 1 : 0)); fem.mate = { g: male.g, coat: male.coat, traits: male.traits };
  toast(fem.name + ' is expecting! Due in ' + fem.preg + ' day' + (fem.preg > 1 ? 's' : '') + '.'); SFX.ok(); addXP('husbandry', 20);
}
function birth(mom) {
  const A = ANIMAL[mom.sp], H = S.sk.husbandry.l, mate = mom.mate, fer = (mom.g.fer + mate.g.fer) / 2;
  let litter = ri(A.litter[0], A.litter[1]) + (fer > 75 && Math.random() < .4 ? 1 : 0) + (mom.traits.includes('prolific') || mate.traits.includes('prolific') ? 1 : 0) + ((mom.traits.includes('twin') || mate.traits.includes('twin')) && Math.random() < .5 ? 1 : 0);
  litter = Math.min(litter, capFor(mom.sp) - countIn(A.house)); const born = [];
  for (let i = 0; i < Math.max(1, litter); i++) {
    if (countIn(A.house) >= capFor(mom.sp)) break;
    const g2 = {}; for (const k of A.genes) { const avg = (mom.g[k] + mate.g[k]) / 2; let v = avg + gauss() * 8 + H * .5 + (mom.g[k] > 80 && mate.g[k] > 80 ? 2 : 0) + (mom.sp === 'horse' && hasPerk('whisperer') ? 3 : 0); if (Math.random() < .05) v += (Math.random() < .6 ? 1 : -1) * 15; g2[k] = clamp(Math.round(v), 1, 100); }
    const traits = []; const pool = mom.sp === 'horse' ? TRAIT_SP.horse : TRAIT_SP.other;
    for (const t of pool) { const inM = mom.traits.includes(t), inF = mate.traits.includes(t); if ((inM && inF && Math.random() < .85) || ((inM || inF) && !(inM && inF) && Math.random() < .5)) traits.push(t); }
    if (Math.random() < .03 + (hasPerk('breeder') ? .05 : 0) + H * .004) { const t = pickR(pool.filter(t => !traits.includes(t))); if (t) traits.push(t); }
    const r = Math.random(); let coat = r < .45 ? mom.coat : r < .9 ? mate.coat : randCoat(mom.sp);
    if (traits.includes('radiant')) coat = mom.sp === 'horse' ? 'ember' : mom.sp === 'chicken' ? 'gold' : mom.sp === 'sheep' ? 'golden' : mom.sp === 'duck' ? 'royal' : mom.sp === 'rabbit' ? 'silver' : coat;
    if (mom.sp === 'horse' && Math.random() < .04) coat = pickR(['white', 'pinto']);
    const baby = newAnimal(mom.sp, g2, coat, 0, traits); born.push(baby);
    if (traits.length) S.stats.traitBred++;
    if (mom.sp === 'horse') S.stats.bestBred = Math.max(S.stats.bestBred, horseRating(baby));
  }
  mom.preg = 0; mom.mate = null; addXP('husbandry', 25 * born.length);
  return born.map(b => b.name + (b.traits.length ? ' (' + b.traits.map(t => TRAITS[t][0]).join(', ') + ')' : '')).join(', ');
}
function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) * 1.4; }
function rideHorse() { return S.animals.find(a => a.id === S.rideId && a.age >= ANIMAL.horse.adult); }
function toggleRide() {
  if (S.mounted) { S.mounted = false; SFX.ok(); if (cur.id === 'farm') placeAnimals(); return; }
  if (!cur.outdoor) { toast('Horses can\'t come in here.'); return; }
  const h = rideHorse(); if (!h) { toast(S.animals.some(a => a.sp === 'horse') ? 'Pick a grown horse to ride in the Animals menu.' : 'Buy a horse from Odile in the village to ride.'); return; }
  S.mounted = true; snd(500, .1, 'triangle', .05, 300); toast('You whistle. ' + h.name + ' comes galloping.');
}
/* ---- machines ---- */
function machineInteract(o) {
  const M = MACH[o.k];
  if (o.out && o.left <= 0) return { label: 'Collect', fn: () => { give(o.out, 1); addXP(o.k === 'smoker' ? 'fishing' : o.k === 'keg' || o.k === 'jar' ? 'farming' : 'husbandry', 10); o.out = null; o.item = null; SFX.pop(); } };
  if (o.out) return { label: 'Check', fn: () => toast(M.n + ': ' + IT[o.out].n + ' ready in ' + fmtDur(o.left) + '.') };
  return { label: 'Load', fn: () => {
    const id = selKind(); const r = id && !isTool(id) ? artisanFor(o.k, id) : null;
    if (!r) { const any = Object.keys(S.inv).map(k => parseK(k)[0]).find(i => artisanFor(o.k, i)); if (any) { const r2 = artisanFor(o.k, any); take(any); o.item = any; o.out = r2[0]; o.left = r2[1]; toast('Loaded ' + IT[any].n + '. ' + IT[r2[0]].n + ' in ' + fmtDur(r2[1]) + '.'); SFX.pop(); return; } toast(M.n + ' takes: ' + M.desc + '.'); return; }
    take(id); o.item = id; o.out = r[0]; o.left = r[1]; toast('Loaded ' + IT[id].n + '. ' + IT[r[0]].n + ' in ' + fmtDur(r[1]) + '.'); SFX.pop();
  } };
}
const fmtDur = m => m >= 1440 ? Math.ceil(m / 1440) + ' day' + (m >= 2880 ? 's' : '') : m >= 60 ? Math.ceil(m / 60) + ' hours' : Math.ceil(m) + ' minutes';
function tickMachines(mins) { for (const id of ['farm', 'greenhouse', ...(typeof ownedPlots === 'function' ? ownedPlots() : [])]) for (const o of MAPS[id].o) if (o && o.out && o.left > 0) o.left -= mins; }
/* ---- fishing ---- */
function fishLocs() {
  const m = cur, [tx, ty] = faceTile(); if (m.mine || m.cave) return [m.fishLoc || 'mine'];
  if (m.id === 'farm') return ['pond'];
  if (m.id === 'wilds') { const b = BIOMES[m.bio[ty * m.w + tx] || 0], t = getT(m, tx, ty); if (TER[t].lava) return ['lava']; return { meadow: ['pond', 'lake'], forest: ['river', 'lake'], highlands: ['river', 'lake'], coast: ['ocean'], frost: ['ice'], ash: ['lava'] }[b]; }
  return ['pond'];
}
function startFishing(lava) {
  if (lava && S.tools.rod < 3) { toast('Your line would burn. You need an Iron rod or better.', 'bad'); return; }
  if (S.p.st < 1) { toast('Too tired to fish.'); return; }
  useStamina(Math.max(.5, 2 - S.sk.fishing.l * .15)); fishing = { phase: 'wait', t: 1.2 + Math.random() * 3, locs: fishLocs() }; SFX.splash();
}
function chooseFish(locs) {
  const day = S.time >= 360 && S.time < 1140;
  const pool = FISH.filter(f => f[4].some(l => locs.includes(l)) && f[5].includes(S.season) && (f[6] === 'any' || (f[6] === 'day' && day) || (f[6] === 'night' && !day) || (f[6] === 'rain' && S.weather === 'rain')));
  if (!pool.length) return locs.includes('ocean') ? 'sardine' : 'carp';
  return wpick(pool.map(f => [f[0], f[8] * (f[10] ? (hasPerk('legend') ? 4 : 1) * (S.sk.fishing.l >= 6 ? 1 : .2) : 1) * (f[7] > 2 ? 1 + S.sk.fishing.l * .08 : 1)]));
}
function fishAct() {
  if (fishing.phase === 'wait') { fishing = null; toast('You reel in early. Nothing.'); return; }
  if (fishing.phase === 'bite') { const id = chooseFish(fishing.locs); fishing = { phase: 'reel', id, diff: IT[id].fish.diff, mot: IT[id].fish.mot, pos: .5, v: 0, tgt: .5, zone: .5, zv: 0, prog: .3, t: 0, treasure: Math.random() < .05 + (hasPerk('diver') ? .15 : 0) + PS.luck * .02, tp: .2 + Math.random() * .6, tprog: 0 }; showFishUI(true); }
}
function updateFishing(dt) {
  const f = fishing; if (!f) return;
  if (f.phase === 'wait') { f.t -= dt; if (f.t <= 0) { f.phase = 'bite'; f.t = .9; SFX.bite(); if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) { } } return; }
  if (f.phase === 'bite') { f.t -= dt; if (f.t <= 0) { fishing = null; toast('It got away…'); } return; }
  f.t += dt;
  const zs = Math.min(.5, (.2 + S.sk.fishing.l * .015 + (S.tools.rod - 1) * .03) * (hasPerk('patient') ? 1.25 : 1) * (S.bonus.fishzone ? 1.2 : 1) * (S.buffs.some(b => b.fish) ? 1.15 : 1));
  const D = f.diff;
  if (f.mot === 'dart') { if (Math.random() < dt * (1 + D * .6)) f.tgt = clamp(Math.random(), .05, .95); }
  else if (f.mot === 'sinker') { if (Math.random() < dt * (.7 + D * .4)) f.tgt = clamp(Math.random() * .6, .05, .95); }
  else if (f.mot === 'floater') { if (Math.random() < dt * (.7 + D * .4)) f.tgt = clamp(.4 + Math.random() * .6, .05, .95); }
  else f.tgt = .5 + Math.sin(f.t * (.8 + D * .35)) * .42;
  f.v += (f.tgt - f.pos) * dt * (2 + D * 1.6); f.v *= .9; f.pos = clamp(f.pos + f.v * dt * 3, 0, 1);
  f.zv += (INPUT.act ? 2.7 : -2.3) * dt; f.zv *= .9; f.zone = clamp(f.zone + f.zv * dt * 2, zs / 2, 1 - zs / 2); if (f.zone <= zs / 2 || f.zone >= 1 - zs / 2) f.zv *= -.3;
  const inZ = Math.abs(f.pos - f.zone) < zs / 2; f.prog = clamp(f.prog + (inZ ? .3 : -.2 - D * .025) * dt, 0, 1); f.zs = zs; f.inZ = inZ;
  if (f.treasure && f.tprog < 1) { if (Math.abs(f.tp - f.zone) < zs / 2) f.tprog = Math.min(1, f.tprog + dt * .5); }
  if (f.prog >= 1) {
    const q = typeof fishQ === 'function' ? fishQ() : 0; // Phase 9: one quality curve (t_balance.js)
    give(f.id, 1, q); S.stats.fish++; addXP('fishing', 8 + D * 9); toast('You caught a ' + IT[f.id].n + '!' + (IT[f.id].fish.legend ? ' A legend!' : ''), 'lvl'); SFX.lvl();
    if (f.tprog >= 1) { toast('Treasure chest!', 'lvl'); lootTable(2 + Math.floor(S.sk.fishing.l / 3), 1).forEach(([id, n]) => give(id, n)); }
    fishing = null; showFishUI(false);
  } else if (f.prog <= 0) { toast('It slipped away.', 'bad'); fishing = null; showFishUI(false); }
}
/* ---- loot, secrets & world ---- */
function lootTable(tier, small) {
  const out = []; const g2 = Math.round((40 + tier * 90) * (.6 + Math.random() * .8)); out.push(['$', g2]);
  const T = [[['wood', 10], ['stone', 10], ['copper_ore', 6], ['turnip_seed', 6], ['bread', 2], ['arrow', 20]], [['iron_ore', 6], ['silver_ore', 5], ['coal', 6], ['topaz', 1], ['amethyst', 1], ['compost', 4], ['strawberry_seed', 5]],
  [['gold_ore', 6], ['steel_bar', 2], ['aquamarine', 1], ['emerald', 1], ['growth_tonic', 3], ['treasure_map', 1], ['fire_arrow', 15]], [['mythril_ore', 5], ['frost_ore', 4], ['gold_bar', 2], ['ruby', 1], ['golden_oats', 1], ['ring_topaz', 1], ['rich_compost', 3]],
  [['obsidian', 5], ['adamant_ore', 4], ['diamond', 1], ['mythril_bar', 2], ['ring_diamond', 1], ['dragon_scale', 1]], [['starmetal', 3], ['adamant_bar', 2], ['diamond', 2], ['prismatic', 1], ['ring_prism', 1], ['emberfruit_seed', 2]]];
  const t = T[clamp(tier - 1, 0, 5)]; const picks = small ? 1 : ri(2, 3); for (let i = 0; i < picks; i++) { const [id, n] = pickR(t); out.push([id, Math.max(1, Math.round(n * (.6 + Math.random() * .8)))]); }
  if (Math.random() < (hasPerk('treasure') ? .4 : .15) && tier > 1) { const [id, n] = pickR(T[clamp(tier, 0, 5)]); out.push([id, Math.max(1, Math.round(n * .6))]); }
  if (!small && S.stats.randShards < 6 && Math.random() < .08 + tier * .02) { S.stats.randShards++; out.push(['ember_shard', 1]); }
  return out;
}
function openChest(m, x, y, o) {
  if (o.opened || (o.id && S.flags['c_' + o.id])) { toast('Empty.'); return; }
  o.opened = 1; if (o.id) S.flags['c_' + o.id] = 1; SFX.secret();
  const loot = lootTable(o.tier || 2); if (o.id === 'grove') loot.push(['emberfruit_seed', 3], ['ancient_coin', 1]); if (o.id === 'camp') loot.push(['steel_bar', 3]);
  loot.forEach(([id, n]) => { if (id === '$') give('$', n); else for (let i = 0; i < Math.min(n, 30); i++) dropItem(m, (x + .5) * 16, (y + .5) * 16, id, n > 30 ? Math.ceil(n / 30) : 1); });
  toast('You open the chest.', 'lvl');
}
function digSpot(m, x, y) {
  setO(m, x, y, null); SFX.till(); dust(x, y, '#7a4e2d');
  const bio = m.bio ? BIOMES[m.bio[y * m.w + x]] : 'meadow', tr = hasPerk('treasure');
  const arts = ARTIFACTS.filter(a => a[3] === bio || a[3] === 'any').map(a => a[0]);
  const r = Math.random();
  const id = r < (tr ? .4 : .28) && arts.length ? pickR(arts) : r < .5 ? 'clay' : r < .62 ? pickR(Object.keys(CROPS).filter(k => !CROPS[k].secret)) + '_seed' : r < .74 ? pickR(['coal', 'copper_ore', 'iron_ore', 'bone']) : r < .78 ? 'treasure_map' : r < .8 && S.stats.randShards < 6 ? (S.stats.randShards++, 'ember_shard') : 'stone';
  dropItem(m, (x + .5) * 16, (y + .5) * 16, id, id === 'clay' ? ri(1, 3) : 1); addXP('foraging', 10);
}
function digBuried(m, x, y, o) { setO(m, x, y, null); if (S.flags['b_' + o.id]) return; S.flags['b_' + o.id] = 1; toast('Your hoe strikes wood. A buried chest!', 'lvl'); SFX.secret(); lootTable(4).forEach(([id, n]) => give(id, n)); give('ember_shard', 1); give('knights_seal', 1); }
function readMap() {
  const m = MAPS.wilds; for (let k = 0; k < 500; k++) { const x = ri(5, m.w - 6), y = ri(5, m.h - 15); if (!solidAt(m, (x + .5) * 16, (y + .5) * 16) && !TER[getT(m, x, y)].water && !getO(m, x, y)) { take('treasure_map'); S.tmap = { x, y }; toast('The map marks an X in ' + BIONAME[BIOMES[m.bio[y * m.w + x]]] + '. Check your Map tab, then dig there.', 'lvl'); return; } }
}
function digTreasure() { toast('X marks the spot!', 'lvl'); SFX.secret(); lootTable(ri(3, 5)).forEach(([id, n]) => give(id, n)); S.tmap = null; addXP('foraging', 40); }
function fairyRing(m, x, y, o) {
  if (S.time < 1200 && S.time >= 360) { toast('A perfect ring of mushrooms. It feels like it\'s waiting for nightfall.'); return; }
  if (o.day === dayIndex()) { toast('The lights have faded for tonight.'); return; }
  o.day = dayIndex(); give('moon_mushroom', 2); if (!S.flags.sh_fairy) { S.flags.sh_fairy = 1; give('ember_shard', 1); } SFX.secret(); toast('Tiny lights dance around you and leave gifts behind.', 'lvl');
}
function wishWell() { if (S.flags.well === dayIndex()) { toast('You\'ve made your wish today.'); return; } if (S.gold < 100) { toast('Wishes cost 100g.'); return; } S.gold -= 100; S.flags.well = dayIndex(); SFX.coin(); const r = Math.random(); if (r < .5) { S.buffs.push({ id: 'wish', t: 600, luck: 1 }); toast('The water shimmers. You feel lucky.'); } else if (r < .8) { give('$', ri(50, 300)); toast('Coins glint at the bottom. Someone else\'s wish came true.'); } else { give(pickR(['golden_oats', 'treasure_map', 'topaz', 'growth_tonic']), 1); toast('Something bobs to the surface!'); } recalc(); }
function checkPOIs() {
  const m = cur; if (m.id !== 'wilds') return; S.poiSeen = S.poiSeen || {}; const tx = S.p.x / 16, ty = S.p.y / 16;
  const cx = Math.floor(tx / 4), cy = Math.floor(ty / 4); for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { const X = cx + i, Y = cy + j; if (X >= 0 && Y >= 0 && X < 50 && Y < 38) EXPL[Y * 50 + X] = 1; }
  m.poi.forEach((p, i) => { if (!S.poiSeen[i] && dist(tx, ty, p.x, p.y) < 7) { S.poiSeen[i] = 1; const nm = { mine: 'The Old Mine', arena: EN[p.boss] && EN[p.boss].n + '\'s territory', shrine: SHRINES[p.bio] && SHRINES[p.bio].n, cave: 'A hidden cave', grove: 'The Secret Grove', ruins: 'Ancient Ruins', hut: 'Corwin\'s Hut', wreck: 'The Wreck of the Marigold', cabin: 'Abandoned Cabin', fairy: 'A Fairy Ring', merchant: 'Merchant\'s Clearing', cross: 'The Crossroads' }[p.type]; if (nm) { toast('Discovered: ' + nm, 'lvl'); if (p.hidden) SFX.secret(); addXP('foraging', 15); } } });
  const b = BIOMES[m.bio[Math.floor(ty) * m.w + Math.floor(tx)]]; if (b !== m.lastBio) { m.lastBio = b; showBanner(BIONAME[b]); }
}
/* ---- friendship ---- */
function fr(id) { return S.friends[id] || (S.friends[id] = { pts: 0, g: 0, t: 0, rew: {} }); }
const hearts = id => Math.min(10, Math.floor(fr(id).pts / 250));
function addFriend(id, n) { const f = fr(id), before = hearts(id); f.pts = clamp(f.pts + n, 0, 2600); const h = hearts(id); if (h > before) { toast(NPCS[id].n + ' ♥ ' + h, 'lvl'); for (const [lv, item, q] of NPCS[id].gifts) if (h >= lv && !f.rew[lv]) { f.rew[lv] = 1; give(item, q, 0, true); toast(NPCS[id].n + ' gives you ' + (q > 1 ? q + ' ' : '') + IT[item].n + '.', 'lvl'); } } }
function giftTo(id, item) {
  const f = fr(id); if (f.g === dayIndex()) { toast(NPCS[id].n + ' already got a gift from you today.'); return false; }
  const N = NPCS[id], [base, q] = parseK(item); if (!takeK(item, 1)) return false; f.g = dayIndex();
  let pts = 20, msg = 'Thank you, that\'s kind.'; if (N.love.includes(base)) { pts = 80; msg = 'Oh! This is my absolute favourite!'; } else if (N.like.includes(base)) { pts = 45; msg = 'I really like this. Thank you!'; } else if (N.hate.includes(base)) { pts = -30; msg = '…Why would you give me this?'; }
  pts = Math.round(pts * (1 + q * .1)); addFriend(id, pts); toast(N.n + ': "' + msg + '"', pts > 40 ? 'lvl' : pts < 0 ? 'bad' : ''); return true;
}
/* ---- time & days ---- */
let machAcc = 0;
function updateTime(dt) {
  const mins = dt / .6; S.time += mins; machAcc += mins; if (machAcc > 10) { tickMachines(machAcc); machAcc = 0; }
  let ch = false; for (const b of S.buffs) b.t -= dt; const n = S.buffs.length; S.buffs = S.buffs.filter(b => b.t > 0); if (S.buffs.length !== n) recalc();
  if (PS.regen) { pl.regenT += dt; if (pl.regenT > 3) { pl.regenT = 0; S.p.hp = Math.min(maxHP(), S.p.hp + 1 + PS.regen); } }
  if (pl.burn > 0) { pl.burn -= dt; pl.burnT = (pl.burnT || 0) + dt; if (pl.burnT > .6) { pl.burnT = 0; S.p.hp -= 2; floatText(S.p.x, S.p.y - 26, '-2', '#ff8a3a'); if (S.p.hp <= 0) faint('You burned up…'); } }
  if (pl.chill > 0) pl.chill -= dt;
  if (S.time >= 1560) faint('You collapsed from exhaustion.');
}
function endDay(fainted) {
  const report = [];
  let earn = 0; for (const k in S.bin) { const [id, q] = parseK(k); earn += Math.round(sellPrice(id) * QMULT[q]) * S.bin[k]; S.stats.shipped[id] = (S.stats.shipped[id] || 0) + S.bin[k]; } if (earn) { S.gold += earn; report.push(['coin', 'Shipping paid ' + earn.toLocaleString() + 'g']); } S.bin = {};
  for (const id of ['farm', 'greenhouse', ...(typeof ownedPlots === 'function' ? ownedPlots() : [])]) { const m = MAPS[id]; for (const k in m.soil) { const s = m.soil[k]; if (s.crop && !s.crop.dead && s.wet) s.crop.age += (1 + (s.fert === 'growth_tonic' ? .34 : 0)) * (m.soilQ || 1); s.wet = false; } } // owned plots grow crops too, scaled by soil quality
  tickMachines(600);
  S.day++; let newSeason = false; if (S.day > 28) { S.day = 1; S.season = (S.season + 1) % 4; if (S.season === 0) S.year++; newSeason = true; }
  if (newSeason) { let died = 0; for (const k in MAPS.farm.soil) { const s = MAPS.farm.soil[k]; if (s.crop && !CROPS[s.crop.k].s.includes(S.season) && !s.crop.dead) { s.crop.dead = true; died++; } } if (died) report.push(['bad', died + ' out-of-season crops withered.']); report.push(['star', SEASONS[S.season] + ' has arrived!']); }
  S.weather = S.season === 3 ? (Math.random() < .3 ? 'snow' : 'sun') : (Math.random() < .22 ? 'rain' : 'sun');
  if (S.weather === 'rain') for (const k in MAPS.farm.soil) MAPS.farm.soil[k].wet = true;
  for (const id of ['farm', 'village', 'wilds']) {
    const m = MAPS[id];
    for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue;
      if (o.k === 'stump' && o.regrow !== undefined && id !== 'farm') { o.regrow--; if (o.regrow <= 0) m.o[i] = { k: o.was || 'tree', kind: o.kind, snow: o.snow }; }
      if (o.k === 'beehive' && S.season < 3 && !o.ready) { o.cd = (o.cd || 3) - 1; if (o.cd <= 0) o.ready = 1; }
      if (o.k === 'ftree') { o.age++; if (o.age >= 14 && FTREES[o.tree][1].includes(S.season)) o.fruit = Math.min(3, (o.fruit || 0) + 1); if (!FTREES[o.tree][1].includes(S.season)) o.fruit = 0; }
      if (o.k === 'dig' || o.k === 'cart') m.o[i] = null;
      if (o.hp !== undefined && o.k !== 'stump') delete o.hp; delete o.chop;
    }
  }
  for (const id of ['farm', 'greenhouse']) { const m = MAPS[id]; for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (!o) continue; const r = { sprinkler: 1, qsprinkler: 2, isprinkler: 3 }[o.k]; if (r) { const x = i % m.w, y = (i / m.w) | 0; for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) { const s = m.soil[(y + j) * m.w + x + k]; if (s) s.wet = true; } } } }
  const farm = MAPS.farm; for (let n = 0; n < 5; n++) { const x = ri(3, 34), y = ri(22, 40), i = y * farm.w + x; if (!farm.o[i] && !farm.soil[i] && getT(farm, x, y) === 'g') farm.o[i] = { k: Math.random() < .6 ? 'weed' : 'tgrass' }; }
  for (let n = 0; n < 12; n++) { const P = farm.pasture, x = ri(P.x0 / 16, P.x1 / 16 - 1), y = ri(P.y0 / 16, P.y1 / 16 - 1); if (!getO(farm, x, y)) setO(farm, x, y, { k: 'tgrass' }); }
  // animals
  const prod = {}; let hungry = 0; const births = [];
  for (const a of S.animals.slice()) {
    const A = ANIMAL[a.sp]; a.age += 1 + (a.age < A.adult && Math.random() < a.g.vig / 250 ? 1 : 0);
    let fed = true; if (S.season === 3 && !a.traits.includes('hardy')) { if (S.silo > 0) S.silo--; else fed = take('hay', 1); } if (!fed) hungry++;
    a.aff = clamp(a.aff + (fed ? 1 : -8) + (a.pet ? 2 * (a.traits.includes('gentle') ? 2 : 1) : -2), 0, 100); a.pet = false; a.raced = false; a.oats = false;
    if (a.sp !== 'horse' && a.age >= A.adult && fed && !(a.sp === 'pig' && S.season === 3)) {
      a.cd = (a.cd || 0) - 1; if (a.cd <= 0) { a.cd = A.every;
        let n = 1 + (Math.random() < (a.g.yld - 35) / 90 ? 1 : 0) + (a.traits.includes('giant') ? 1 : 0) + (hasPerk('rancher') && Math.random() < .2 ? 1 : 0); if (a.sp === 'pig') n += Math.floor(a.g.yld / 45);
        for (let i = 0; i < n; i++) { const q = animalQ(a.g.qlt, a.aff); let id = A.prod; if (a.traits.includes('golden') && A.golden && Math.random() < .12) id = A.golden; const k = keyOf(id, q); prod[k] = (prod[k] || 0) + 1; give(id, 1, q, true); }
        if (A.extra && Math.random() < A.extra[1] * (a.traits.includes('lucky') ? 3 : 1) * (1 + a.aff / 200)) { prod[A.extra[0]] = (prod[A.extra[0]] || 0) + 1; give(A.extra[0], 1, 0, true); }
        addXP('husbandry', 4 * n);
      }
    }
    if (a.preg > 0) { a.preg--; if (a.preg <= 0) births.push(birth(a)); }
  }
  const pk = Object.keys(prod); if (pk.length) report.push(['animal', 'Your animals produced ' + pk.map(k => { const [id, q] = parseK(k); return prod[k] + '× ' + (q ? QNAME[q] + ' ' : '') + IT[id].n; }).join(', ') + '.']);
  if (hungry) report.push(['bad', hungry + ' animal' + (hungry > 1 ? 's' : '') + ' went hungry. Keep hay stocked in winter.']);
  births.forEach(b => b && report.push(['heart', 'Born overnight: ' + b + '!']));
  // world refresh
  if (S.day % 7 === 1 || !S.horseShop.length) rollHorseShop(); rollBoard(); dailyWorld(report);
  S.time = 360; recalc(); S.p.hp = fainted ? Math.round(maxHP() / 2) : maxHP(); S.p.st = fainted ? Math.round(maxST() / 2) : maxST(); S.mounted = false; S.buffs = []; recalc();
  goMap('farm', 9.5 * 16, 10.5 * 16, 0); saveGame(); showDayReport(report);
}
function dailyWorld(report) {
  const m = MAPS.wilds; R = Math.random;
  for (let i = 0; i < m.o.length; i++) { const o = m.o[i]; if (o && (o.k === 'fg' || o.k === 'dig')) m.o[i] = null; }
  let nf = 0, nd = 0;
  for (let k = 0; k < 4000 && (nf < 60 || nd < 14); k++) {
    const x = ri(3, m.w - 4), y = ri(3, m.h - 6), i = y * m.w + x, t = m.t[i]; if (m.o[i] || TER[t].solid || TER[t].water || t === 'b' || m.solidB[i]) continue;
    const b = BIOMES[m.bio[i]];
    if (nf < 60) { const L = FORAGE[b]; const pool = L[Math.min(L.length - 1, S.season)]; m.o[i] = { k: 'fg', item: pickR(pool) }; nf++; }
    else if (t !== 'd') { m.o[i] = { k: 'dig' }; nd++; }
  }
  for (let k = 0; k < 200; k++) { const x = ri(3, 34), y = ri(22, 40), i = y * MAPS.farm.w + x; if (!MAPS.farm.o[i] && !MAPS.farm.soil[i] && getT(MAPS.farm, x, y) === 'g') { MAPS.farm.o[i] = { k: 'dig' }; break; } }
  for (const o of m.o) if (o && o.k === 'bush') o.ripe = (S.season === 2 || (S.season === 1 && Math.random() < .3)) && Math.random() < .5 ? 1 : 0;
  // ore respawn
  let ores = 0; for (let k = 0; k < 3000 && ores < 30; k++) { const x = ri(3, m.w - 4), y = ri(3, m.h - 6), i = y * m.w + x, t = m.t[i]; if (m.o[i] || TER[t].solid || TER[t].water || t === 'd' || t === 'b' || m.solidB[i]) continue; const b = BIOMES[m.bio[i]]; const pool = { highlands: [['rock', 4], ['ore_copper', 2], ['ore_iron', 2], ['ore_silver', 1.5], ['ore_gold', .6], ['ore_coal', 1]], frost: [['ore_frost', 2], ['crystalnode', 1], ['ore_silver', 1]], ash: [['ore_obsidian', 2], ['ore_adamant', .6], ['ore_gold', 1]] }[b]; if (!pool) continue; m.o[i] = { k: wpick(pool), v: b === 'frost' ? 'S' : null }; ores++; }
  // merchant
  const wd = (dayIndex() - 1) % 7; if ((wd === 4 || wd === 6) && m.merchant) { const [x, y] = m.merchant; putObj(m, x - 1, y, { k: 'cart' }); report.push(['coin', 'The wandering merchant has set up in Amber Meadow today.']); }
  // meteor
  if (!S.meteor && Math.random() < .07) { for (let k = 0; k < 400; k++) { const x = ri(6, m.w - 8), y = ri(6, m.h - 20), b = BIOMES[m.bio[y * m.w + x]]; if ((b === 'ash' || b === 'highlands' || b === 'frost') && areaFree(m, x, y, 2, 2)) { putObj(m, x, y, { k: 'meteor' }); S.meteor = { x, y }; report.push(['star', 'A meteor streaked across the sky last night and landed in ' + BIONAME[b] + '. It\'s marked on your map.']); break; } } }
}
function rollHorseShop() { S.horseShop = [[38, 14, 1500], [50, 14, 4000], [62, 12, 9000]].map(([b, s, p]) => { const g2 = randGenes('horse', b, s); const tr = Math.random() < .12 ? [pickR(TRAIT_SP.horse)] : []; return { g: g2, coat: randCoat('horse'), traits: tr, price: p + (Math.round((g2.spd + g2.sta + g2.str + g2.agi) / 4) - b) * 140 + tr.length * 2500, sex: Math.random() < .5 ? 'F' : 'M' }; }); }
function rollBoard() {
  const pool = [['wood', 30, 60], ['stone', 40, 70], ['copper_ore', 10, 25], ['iron_ore', 8, 20], ['coal', 5, 10], ['egg', 4, 8], ['carp', 2, 4], ['red_cap', 3, 6], ['slime_goo', 10, 20], ['hide', 2, 4], ['hay', 15, 30], ['milk', 2, 4], ['bat_wing', 3, 6], ['clam', 3, 6], ['wool', 1, 3], ['silver_ore', 5, 10], ['cheese', 1, 3]];
  const s = Object.keys(CROPS).filter(k => CROPS[k].s.includes(S.season) && !CROPS[k].secret).map(k => [k, 3, 8]); const [id, a, b] = pickR(pool.concat(s)), n = ri(a, b);
  S.board = { id, n, rew: Math.round(IT[id].p * n * 1.8 + 60), done: false };
}
function checkQuests() { QUESTS.forEach((q, i) => { if (!S.qdone[i] && q[2]()) { S.qdone[i] = 1; S.gold += q[3]; toast('Quest complete: ' + q[0] + ' (+' + q[3].toLocaleString() + 'g)', 'lvl'); SFX.lvl(); } }); }
function floatText(x, y, txt, c) { FX.push({ x, y, txt, c, t: 1.1 }); }
function dust(tx, ty, c) { for (let i = 0; i < 5; i++) PARTS.push({ x: (tx + .5) * 16, y: (ty + .7) * 16, vx: (Math.random() - .5) * 40, vy: -Math.random() * 30, t: .35, c }); }
function sparkle(tx, ty, c) { for (let i = 0; i < 4; i++) PARTS.push({ x: (tx + Math.random()) * 16, y: (ty + Math.random()) * 16, vx: 0, vy: -20, t: .5, c }); }
