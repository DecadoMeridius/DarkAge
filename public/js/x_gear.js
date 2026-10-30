/* Gear art (art/sprites/gear.py, armor.py): every tier has its own weapons, shields, tools,
   helmets and armour.
   - Icons: an item with a full-colour icon gi_<id> (weapons, shields) or a tool level with
     gi_tool_<kind>_<level> uses it, so the hotbar, the bag and the item in your hand change together.
     Helmets and breastplates take their icon from the helmet / cuirass drawn on the character.
   - On the character: a worn metal helmet draws hb_helm_<tier>_<d> (covers the whole head), worn
     body armour draws hb_arm_<tier>_<d>; GEAR_ACC is each tier's accent (crests, horns, trim, fur). */
const GEAR_ACC = {
  leather: '#5a3a22', copper: '#c8a040', iron: '#6a6a72', steel: '#3a4a8a', silver: '#9ac8ff', gold: '#d8342a', mythril: '#c8fff0', frost: '#f0faff',
  obsidian: '#e8dcc0', adamant: '#c8c8d0', dragon: '#e8d0a0', star: '#ffe070', cobalt: '#d8c8a8', tide: '#1a6a98', rime: '#ffffff', cinder: '#ffb040',
};
const armTier = id => { const m = /^([a-z]+)_(helm|body|boots|shield)$/.exec(id || ''); return m && GEAR_ACC[m[1]] ? m[1] : null; };

const GICACHE = {};
const _itemIconG = itemIcon;
itemIcon = function (id) {
  if (!id) return _itemIconG(id);
  const ti = IT[id]; if (ti && ti.t === 'tool' && ti.tool && ti.tool !== 'weapon' && S && S.tools) return itemIcon('tool:' + ti.tool + ':' + (S.tools[ti.tool] || 1)); // a tool kept in the bag
  if (GICACHE[id] !== undefined) return GICACHE[id] || _itemIconG(id);
  let c = null;
  if (id.startsWith('tool:')) { const [, t, l] = id.split(':'); if (PIX.has('gi_tool_' + t + '_' + l)) c = PIX.get('gi_tool_' + t + '_' + l); }
  else if (PIX.has('gi_' + id)) c = PIX.get('gi_' + id);
  else {
    const it = IT[id], tk = armTier(id);
    if (it && tk && (it.sh === 'helm' || it.sh === 'plate')) {
      const name = it.sh === 'helm' ? 'hb_helm_' + tk + '_0' : 'hb_arm_' + tk + '_0', t = PIX.get(name);
      if (t) {
        const ramps = HCH.map(n => pixRamp(n === 'plume' || n === 'trim' ? GEAR_ACC[tk] : it.c));
        const full = mk(t.width, t.height, x => x.drawImage(t, 0, 0)); pixSwap(full, ramps); pixOutline(full, null);
        const [sy, h] = it.sh === 'helm' ? [-1, 26] : [16, 26]; // the head, or the chest and shoulders
        c = mk(32, 32, x => x.drawImage(full, 0, Math.max(0, sy), 32, h, 0, 3 + Math.max(0, -sy), 32, h)); c.ww = c.wh = 16;
      }
    }
  }
  GICACHE[id] = c || null;
  return c || _itemIconG(id);
};

const _playerPalG = playerPal;
playerPal = function () {
  const P = _playerPalG();
  const h = S.eq.helm, b = S.eq.body, ht = armTier(h), bt = armTier(b);
  if (ht && IT[h].sh === 'helm') { P.helmS = ht; P.plume = GEAR_ACC[ht]; }
  if (bt && IT[b].sh === 'plate') { P.armS = bt; P.armor = IT[b].c; P.trim = GEAR_ACC[bt]; P.cape = null; }
  return P;
};
// held tools and weapons are drawn a little larger so their heads read
const _playerActionG = playerAction;
playerAction = function () { const A = _playerActionG(); if (A && A.item && (A.size || 15) >= 12) A.size = (A.size || 15) + 3; return A; };
