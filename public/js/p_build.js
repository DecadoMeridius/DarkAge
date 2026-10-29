/* ================= Phase 4: construction =================
   NOTHING PRE-BUILT: a new farm starts with a tent (sleep and save) and a campfire.
   Buildings are S.structures entries ({ k, x, y, stage, delivered, work }) rebuilt onto
   the farm map whenever it is generated, so they persist. Saves from before this keep
   their farmhouse, coop, barn and stable as finished structures.
   BLUEPRINTS (BP) are bought from Hale the carpenter (Blueprints tab). Choosing Place
   enters placement mode on the farm: a ghost of the building follows the cursor, green
   where it fits and red where it doesn't; left click places, right click or Esc cancels.
   SCAFFOLDS: a placed blueprint is a build site. Interact with it to deliver materials
   from your backpack; once everything is in, interact again to start hammering. Work
   runs on the game tick and the site rises through foundation, frame, walls and roof.
   Construction is a new life skill trained by hammering.
   The farmhouse upgrades from the tent: build the Cottage blueprint anywhere on the farm. */

SKN.construction = 'Construction'; if (!SK.includes('construction')) SK.push('construction'); if (!LIFE.includes('construction')) LIFE.push('construction');
for (const k in BUILD) BUILD[k].lv[-1] = [0, {}, 0]; // capFor() reads lv[level - 1]; an unbuilt building (level 0) holds nothing

const BP = {
  cottage: { n: 'Cottage', kind: 'house', act: 'house', w: 7, h: 5, gold: 1000, cost: { wood: 150, stone: 80 }, work: 60, lot: [6, 4], desc: 'Your farmhouse, placed wherever you like. Once it is finished the tent is packed away; it has a bed, kitchen and storage.' },
  coop: { n: 'Coop', kind: 'coop', act: 'coop', w: 6, h: 5, gold: 1500, cost: { wood: 100, stone: 50 }, work: 40, build: 'coop', desc: 'Houses chickens, ducks and rabbits.' },
  barn: { n: 'Barn', kind: 'barn', act: 'barn', w: 7, h: 6, gold: 3000, cost: { wood: 200, stone: 100 }, work: 60, build: 'barn', desc: 'Houses cows, goats, sheep and pigs.' },
  stable: { n: 'Stable', kind: 'stable', act: 'stable', w: 6, h: 5, gold: 4000, cost: { wood: 150, hardwood: 20 }, work: 50, build: 'stable', desc: 'Houses horses.' },
  shed: { n: 'Storage Shed', kind: 'cabin', act: 'bank', w: 4, h: 3, gold: 800, cost: { wood: 80, stone: 40 }, work: 30, desc: 'A storage chest for your bank, right on the farm.' },
  well: { n: 'Well', obj: 'fwell', w: 2, h: 2, gold: 500, cost: { stone: 60 }, work: 15, desc: 'Refill your watering can without walking to the pond.' },
};
OBJ.fwell = { solid: 1, tall: 1, w: 2, h: 1 };
const STAGES = ['Foundation', 'Frame', 'Walls', 'Roof'];

/* ---- new games: empty farm, tent + campfire; old saves keep their buildings ---- */
const _newStateB = newState;
newState = function (seed) { const o = _newStateB(seed); o.freshFarm = true; o.build = Object.assign(o.build, { coop: 0, barn: 0, stable: 0 }); o.structures = []; o.blue = {}; return o; };
const _genFarmB = genFarm;
genFarm = function () {
  const m = _genFarmB();
  if (!S.structures) { // a save from before construction: its buildings become finished structures
    S.structures = m.bld.filter(b => ['house', 'coop', 'barn', 'stable'].includes(b.kind)).map(b => ({ k: b.kind === 'house' ? 'cottage' : b.kind, x: b.x, y: b.y, stage: 4 }));
    S.blue = S.blue || {};
  }
  // clear the generated buildings (keep the greenhouse ruin), then rebuild from S.structures
  for (const b of m.bld.filter(b => b.kind !== 'greenhouse')) for (let j = b.y; j < b.y + b.h; j++) for (let i = b.x; i < b.x + b.w; i++) m.solidB[j * m.w + i] = 0;
  m.bld = m.bld.filter(b => b.kind === 'greenhouse');
  const hasHouse = S.structures.some(s => s.k === 'cottage' && s.stage >= 4);
  if (!hasHouse) { // tent and campfire in front of the house lot
    const t = addB(m, 8, 6, 2, 2, 'tent', 'tent'); t.spr = PIX.get('tent') || SPR.tent; m.bHouse = t;
    if (!getO(m, 11, 8)) setO(m, 11, 8, { k: 'campfire', fixed: 1 });
  }
  for (const s of S.structures) placeStructure(m, s);
  return m;
};
function placeStructure(m, s) {
  const B = BP[s.k]; if (!B) return;
  if (B.obj && s.stage >= 4) { putObj(m, s.x, s.y + B.h - 1, { k: B.obj, fixed: 1 }); return; }
  if (s.k === 'cottage' && s.stage >= 4) { const t = m.bld.find(b => b.kind === 'tent'); if (t) removeB(m, t); }
  const b = addB(m, s.x, s.y, B.w, B.h, s.stage >= 4 ? B.kind || 'cottage' : 'site', s.stage >= 4 ? B.act : 'site');
  b.struct = s; b.spr = s.stage >= 4 ? buildingSpr(B.w, B.h, B.kind) : siteSprite(s);
  if (s.k === 'cottage' && s.stage >= 4) m.bHouse = b;
}
function removeB(m, b) { for (let j = b.y; j < b.y + b.h; j++) for (let i = b.x; i < b.x + b.w; i++) m.solidB[j * m.w + i] = 0; m.bld = m.bld.filter(x => x !== b); }

/* ---- scaffold art: the finished building revealed in stages, wrapped in timber ---- */
const SITEC = {};
function siteSprite(s) {
  const B = BP[s.k], key = s.k + s.stage; if (SITEC[key]) return SITEC[key];
  const W = B.w * 32, H = B.h * 32, fin = B.obj ? (PIX.get('well') || SPR.well) : buildingSpr(B.w, B.h, B.kind);
  const c = mk(W, H, x => {
    const P = (X, Y, w, h, col) => { x.fillStyle = col; x.fillRect(X, Y, w, h); };
    P(2, H - 10, W - 4, 8, '#7a7468'); P(2, H - 10, W - 4, 2, '#a8a294'); // foundation slab
    for (let i = 6; i < W - 6; i += 10) P(i, H - 8, 1, 6, '#5a5650');
    if (s.stage >= 2) { // walls: bottom of the real building, clipped
      const wy = Math.round(H * .5); x.drawImage(fin, 0, wy, fin.width, fin.height - wy, 0, wy, W, H - wy);
    }
    if (s.stage >= 3) x.drawImage(fin, 0, 0, fin.width, fin.height, 0, 0, W, H); // roof on: the finished look, scaffold still up
    if (s.stage >= 1 && s.stage < 4) { // timber frame and scaffold poles
      const posts = [4, W / 2 - 2, W - 8]; for (const px of posts) { P(px, H * .3, 4, H * .7 - 8, '#8a5a34'); P(px, H * .3, 1, H * .7 - 8, '#b07a48'); }
      for (const py of [H * .3, H * .55, H - 14]) { P(4, py, W - 8, 3, '#7a4e2c'); P(4, py, W - 8, 1, '#a8743f'); }
      for (let i = 0; i < 3; i++) { x.strokeStyle = '#6a4426'; x.lineWidth = 2; x.beginPath(); x.moveTo(6 + i * (W / 3), H - 12); x.lineTo(6 + (i + 1) * (W / 3) - 8, H * .32); x.stroke(); }
    }
    if (s.stage === 0) { // material piles
      for (let i = 0; i < 4; i++) { P(8 + i * 12, H - 20, 10, 6, '#9a6a3e'); P(8 + i * 12, H - 20, 10, 1, '#c89058'); }
      for (let i = 0; i < 3; i++) { P(W - 40 + i * 10, H - 18, 8, 5, '#8e887e'); P(W - 40 + i * 10, H - 18, 8, 1, '#b8b2a6'); }
    }
  });
  c.ww = B.w * 16; c.wh = B.h * 16; pixOutline(c, '#2a1c18');
  return SITEC[key] = c;
}

/* ---- blueprints at Hale's ---- */
const _renderBuildB = renderBuild;
renderBuild = function (b) {
  greet(b, 'hale');
  b.append(el('h3', null, 'Blueprints'), el('p', { class: 'note' }, 'Buy a blueprint, then place it on your farm. Deliver the materials to the site and hammer it up. Construction level ' + lifeL('construction') + '.'));
  const L = el('div', { class: 'list' });
  for (const k in BP) {
    const B = BP[k], owned = S.blue[k], building = S.structures.some(s => s.k === k && s.stage < 4);
    const built = S.structures.filter(s => s.k === k && s.stage >= 4).length, single = k === 'cottage' || B.build;
    const row = el('div', { class: 'rrow' }, el('div', { class: 'qck' }, built || '–'), el('div', { class: 'rtxt' }, el('b', null, B.n + (built ? (single ? ' (built)' : ' ×' + built) : '')), el('small', null, B.desc + ' Materials: ' + Object.entries(B.cost).map(([i, n]) => n + ' ' + IT[i].n.toLowerCase()).join(', ') + '.')));
    if (single && (built || building)) row.append(el('small', { class: 'note' }, building ? 'Under construction' : ''));
    else if (!owned) row.append(el('button', { class: 'btn' + (S.gold >= B.gold ? '' : ' off'), on: () => { if (S.gold < B.gold) { toast('Not enough gold.', 'bad'); return; } S.gold -= B.gold; S.blue[k] = 1; SFX.coin(); toast(B.n + ' blueprint bought.', 'lvl'); refresh(); } }, 'Buy ' + B.gold + 'g'));
    else row.append(el('button', { class: 'btn', on: () => startPlacing(k) }, 'Place'));
    L.append(row);
  }
  b.append(L, el('h3', null, 'Upgrades'));
  // the old list builds level 1 instantly for free: only offer upgrades for buildings that exist
  const hidden = {}; for (const k in BUILD) if (Object.values(BP).some(B => B.build === k) && !(S.build[k] > 0)) { hidden[k] = BUILD[k]; delete BUILD[k]; }
  const tmp = el('div'); try { _renderBuildB(tmp); } finally { Object.assign(BUILD, hidden); }
  tmp.querySelectorAll('.greet').forEach(n => n.remove()); b.append(...tmp.childNodes);
};

/* ---- placement mode ---- */
let PLACING = null;
function startPlacing(k) {
  if (MODAL) { MODAL.lock = false; closeModal(); }
  PLACING = k;
  if (cur.id !== 'farm') toast('Go to your farm to place the ' + BP[k].n.toLowerCase() + '. Esc cancels.');
  else toast('Place the ' + BP[k].n.toLowerCase() + ': left click to place, right click to cancel.');
}
function placeAt() { const B = BP[PLACING], [mx, my] = mouseTile(); return [mx - Math.floor(B.w / 2), my - B.h + 1]; } // anywhere on the farm, the cottage too
function placeOk(m, x, y, B, ignoreTent) {
  if (x < 1 || y < 1 || x + B.w >= m.w - 1 || y + B.h >= m.h - 2) return false;
  for (let j = y; j < y + B.h + 1; j++) for (let i = x; i < x + B.w; i++) {
    const idx = j * m.w + i, t = m.t[idx];
    if (TER[t].solid || TER[t].water || m.soil[idx]) return false;
    if (m.solidB[idx] && !(ignoreTent && m.bld.some(b => b.kind === 'tent' && i >= b.x && i < b.x + b.w && j >= b.y && j < b.y + b.h))) return false;
    const o = m.o[idx]; if (o && !(j === y + B.h && !OBJ[o.k]?.solid) && !(o.k === 'campfire' && ignoreTent)) return false;
  }
  return true;
}
function placeNow() {
  const m = cur, B = BP[PLACING], [x, y] = placeAt();
  if (!placeOk(m, x, y, B)) { toast("It doesn't fit there.", 'bad'); SFX.bad(); return; }
  const s = { k: PLACING, x, y, stage: 0, delivered: {}, work: 0 };
  S.structures.push(s); if (!B.obj) placeStructure(m, s); else { const b = addB(m, x, y, B.w, B.h, 'site', 'site'); b.struct = s; b.spr = siteSprite(s); }
  if (PLACING !== 'cottage' && B.build === undefined) delete S.blue[PLACING]; // repeatable blueprints (shed, well) are used up
  toast(B.n + ' site placed. Bring the materials.', 'lvl'); SFX.ok(); PLACING = null; CHUNK.clear();
}

/* ---- the site: deliver, then hammer on ticks ---- */
let HAMMER = null;
function siteAt(b) { return b.struct; }
function openSite(b) {
  const s = b.struct, B = BP[s.k];
  openModal(B.n + ' — build site', [{ id: 's', label: 'Site', render: body => {
    const need = Object.entries(B.cost), missing = need.filter(([i, n]) => (s.delivered[i] || 0) < n);
    body.append(el('p', { class: 'note' }, missing.length ? 'Deliver the materials from your backpack.' : 'Everything is here. Start hammering: the ' + B.n.toLowerCase() + ' rises in stages. Moving stops the work.'));
    const L = el('div', { class: 'list' });
    for (const [i, n] of need) { const got = s.delivered[i] || 0; L.append(el('div', { class: 'rrow' + (got >= n ? ' done' : '') }, icon(i, 32), el('div', { class: 'rtxt' }, el('b', null, IT[i].n), el('small', null, got + ' / ' + n + ' delivered · you carry ' + cnt(i))))); }
    body.append(L);
    if (missing.length) body.append(el('button', { class: 'btn big', on: () => { let any = 0; for (const [i, n] of missing) { const give_ = Math.min(cnt(i), n - (s.delivered[i] || 0)); if (give_ > 0 && take(i, give_)) { s.delivered[i] = (s.delivered[i] || 0) + give_; any += give_; } } toast(any ? 'Delivered ' + any + ' materials.' : 'You have nothing it needs.', any ? '' : 'bad'); refresh(); } }, 'Deliver'));
    else body.append(el('div', { class: 'acts' }, el('b', null, 'Stage: ' + STAGES[Math.min(3, s.stage)] + ' · ' + Math.floor(s.work / B.work * 100) + '%'), el('span', { style: 'flex:1' }), el('button', { class: 'btn big', on: () => { closeModal(); HAMMER = { b, at: [S.p.x, S.p.y] }; toast('Hammering…'); } }, 'Hammer')));
  } }]);
}
function hammerTick() {
  if (!HAMMER) return; const b = HAMMER.b, s = b.struct, B = BP[s.k];
  if (Math.hypot(S.p.x - HAMMER.at[0], S.p.y - HAMMER.at[1]) > 3 || cur.id !== 'farm') { HAMMER = null; toast('You stop building.'); return; }
  pl.anim = .25; pl.tool = 'pick'; snd(220 + Math.random() * 60, .05, 'square', .03); noiseBurst(.04, .03, 700);
  for (let i = 0; i < 3; i++) PARTS.push({ x: (b.x + Math.random() * b.w) * 16, y: (b.y + b.h - .5) * 16, vx: (Math.random() - .5) * 50, vy: -Math.random() * 60, t: .4, c: '#c89058' });
  s.work += 1 + lifeL('construction') * .02; addXP('construction', 1.5);
  const stage = Math.min(4, Math.floor(s.work / B.work * 4));
  if (stage !== s.stage) {
    s.stage = stage;
    if (stage >= 4) { finishSite(b); return; }
    b.spr = siteSprite(s); toast(B.n + ': ' + STAGES[stage].toLowerCase() + ' done.', 'lvl'); SFX.ok();
  }
}
function finishSite(b) {
  const m = cur, s = b.struct, B = BP[s.k]; HAMMER = null;
  removeB(m, b); placeStructure(m, s);
  if (B.build) S.build[B.build] = Math.max(1, S.build[B.build] || 0);
  CHUNK.clear(); SFX.lvl(); SHAKE = .2; toast(B.n + ' is finished!', 'lvl');
}

/* the tent offers the home menu (sleep, save) without an interior; the room code
   sends 'house' indoors unless you're already in the house room, so pretend we are */
function openTent() { const id = cur.id; cur.id = 'in_house'; try { _doorActionB('house'); } finally { cur.id = id; } }

/* ---- hooks: doors, interaction, input, rendering, ticks ---- */
const _doorActionB = doorAction;
doorAction = function (act, who) {
  if (act === 'site') { const [tx, ty] = faceTile(); const b = cur.bld.find(b => b.act === 'site' && tx >= b.x && tx < b.x + b.w && ty >= b.y - 1 && ty < b.y + b.h + 1) || cur.bld.find(b => b.act === 'site'); if (b) openSite(b); return; }
  if (act === 'tent') return openTent();
  if (act === 'bank') return openBank();
  if (act === 'house' && cur.id === 'farm' && !S.structures.some(s => s.k === 'cottage' && s.stage >= 4)) return; // no cottage yet
  return _doorActionB(act, who);
};
const _findInteractB = findInteract;
findInteract = function () {
  const r = _findInteractB(); if (r || !cur) return r;
  const [tx, ty] = faceTile();
  for (const b of cur.bld) if ((b.act === 'site' || b.kind === 'tent') && tx >= b.x && tx < b.x + b.w && ty >= b.y && ty <= b.y + b.h) return b.act === 'site' ? { label: 'Build', fn: () => openSite(b) } : { label: 'Rest', fn: openTent };
  return null;
};
const _objInteractB = objInteract;
objInteract = function (m, x, y, o) { if (o.k === 'fwell') return { label: 'Refill', fn: () => { S.water = canCap(); SFX.splash(); toast('Watering can refilled.'); } }; return _objInteractB(m, x, y, o); };
const _buildObjectsB = buildObjects;
buildObjects = function () { _buildObjectsB(); SPR.fwell = PIX.get('well') || SPR.well; };

const _primaryUseB = primaryUse;
primaryUse = function () { if (PLACING && cur.id === 'farm' && !PAUSED) { placeNow(); return; } _primaryUseB(); };
const _interactB = interact;
interact = function () { if (PLACING) { PLACING = null; toast('Placement cancelled.'); return; } _interactB(); };
addEventListener('keydown', e => { if (e.key === 'Escape' && PLACING) { PLACING = null; e.stopImmediatePropagation(); toast('Placement cancelled.'); } }, true);

const _pcCursorDrawB = pcCursorDraw;
pcCursorDraw = function (m) {
  if (PLACING && m.id === 'farm' && !PAUSED) {
    const B = BP[PLACING], [x, y] = placeAt(), ok = placeOk(m, x, y, B), spr = B.obj ? (PIX.get('well') || SPR.well) : buildingSpr(B.w, B.h, B.kind);
    g.globalAlpha = .55; D(spr, x * 16, y * 16, B.w * 16, B.h * 16); g.globalAlpha = .28;
    g.fillStyle = ok ? '#5ad85a' : '#e8402a'; g.fillRect(x * 16, y * 16, B.w * 16, B.h * 16); g.globalAlpha = 1;
    return;
  }
  _pcCursorDrawB(m);
};
EVT.on('tick', () => { if (!S || PAUSED) return; hammerTick(); });
const _hudTickB = hudTick;
hudTick = function (dt) {
  _hudTickB(dt); if (!S || TITLE || !$('#pL')) return;
  if (PLACING) $('#pL').innerHTML = '<kbd>LMB</kbd>place ' + BP[PLACING].n + ' &nbsp; <kbd>RMB</kbd>cancel';
  else if (HAMMER) { const s = HAMMER.b.struct, B = BP[s.k]; $('#pL').innerHTML = '<kbd>' + Math.floor(s.work / B.work * 100) + '%</kbd>Building ' + B.n + ' (move to stop)'; }
};

/* ---- paths: stone and gravel path items paint the ground ---- */
I('stone_path', 'Stone Path', 'path', 2, 'stone', '#a89e8c', null, { tile: 'p' }); I('gravel_path', 'Gravel Path', 'path', 1, 'stone', '#c8a878', null, { tile: 'd' });
RC.push(['stone_path', 10, { stone: 5 }, 'bench'], ['gravel_path', 10, { stone: 2, fiber: 1 }, 'bench']);
const _useItemB = useItem;
useItem = function (id) {
  const it = IT[id];
  if (it && it.t === 'path' && has(id)) {
    const m = cur, [tx, ty] = faceTile(), i = ty * m.w + tx;
    if (!m.farm) { toast('Lay paths on your farm.'); return; }
    if (!inb(m, tx, ty) || m.soil[i] || m.solidB[i] || TER[m.t[i]].water || TER[m.t[i]].solid || m.t[i] === it.tile) return;
    setT(m, tx, ty, it.tile); take(id); (S.paths = S.paths || []).push([tx, ty, it.tile]); CHUNK.clear(); SFX.till(); return;
  }
  return _useItemB(id);
};
const _genFarmP = genFarm;
genFarm = function () { const m = _genFarmP(); for (const [x, y, t] of S.paths || []) setT(m, x, y, t); return m; };
