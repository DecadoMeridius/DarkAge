/* Guilds (asked for 2026-10-31: "guilds in the towns where you progress through ranks and get specific items
   only achievable through those guilds; a miners' guild that gives access to a mine, a hunters' guild with a
   certain bow, new titles").
   - Four guild halls, each a converted townhouse with a guildmaster behind the counter (TOWN_NPCS):
       Miners' Guild (Greyhelm), Hunters' Lodge (Ashford), Anglers' Guild (Saltmere), Growers' Guild (Kingsbridge).
   - Join for a fee, then climb five ranks. Each rank asks for a few tasks: bring goods, reach a skill level,
     a count (fish caught, crops harvested, mine depth), beasts slain since joining, a boss beaten. Report
     to the guildmaster to be promoted: a new title, a reward, and the guild store opens further.
   - Things only the guilds have: the Guild Seam (Greyhelm's members-only mine, rich ore, rebuilt daily),
     the Huntsman's Bow and the Ashford Greatbow, guild rings, free tool upgrades, rare seeds.
   - Titles: every rank earned is a title; choose one to wear (S.title) and guild folk greet you by it.
   - State: S.guilds[act] = { r: rank, kills: {enemy: n} }; S.title. Nothing else in the save changes. */

const GP = o => Object.assign({ shoe: '#3a2a1a' }, o);
const GUILDS = {
  gh_guild: { town: 'greyhelm', name: 'Miners\' Guild', fee: 150, house: ['hm_house', 31, 19], floor: 'fl', wall: 'stone',
    master: { id: 'dorrik', n: 'Dorrik Stonehand', role: 'Guildmaster of Miners', P: GP({ skin: '#d8a070', hair: '#8a8a8a', hs: 'bald', beard: '#8a8a8a', shirt: '#5a4a3a', pants: '#3a3a40', apron: '#6a4a2a', hat: '#c8a040' }),
      love: ['mythril_ore', 'gold_bar', 'diamond'], like: ['coal', 'iron_bar', 'miners_pie'], hate: ['flower', 'tulip'],
      lines: [['Rock doesn\'t care who you are. That\'s what I like about it.', 'Keep your lamp lit and your pick sharp.'], ['The Seam\'s been in the guild for three hundred years. We don\'t show it to just anyone.'], ['You dig like a Greyhelmer now. High praise. Highest there is.']] },
    blurb: 'Hewers, delvers and masters of the deep rock. Members dig the Guild Seam, Greyhelm\'s own mine, where the ore runs thick.',
    props: [['coal', 1, 3], ['coal', 2, 3], ['anvil', 8, 3], ['crate', 10, 3], ['weapons', 10, 6], ['barrel', 1, 6], ['lamp', 6, 3], ['minecart', 1, 7]],
    ranks: [
      { title: 'Initiate' },
      { title: 'Hewer', tasks: [{ t: 'bring', items: { copper_ore: 20, coal: 10 } }, { t: 'skill', k: 'mining', L: 10 }],
        reward: { gold: 300, unlock: 'The Guild Seam: the mine mouth in Greyhelm\'s north-east corner is open to you.' } },
      { title: 'Delver', tasks: [{ t: 'stat', f: () => S.stats.deepest || 0, n: 10, label: 'Reach floor 10 of the Deep' }, { t: 'bring', items: { iron_ore: 25, iron_bar: 5 } }, { t: 'skill', k: 'mining', L: 25 }],
        reward: { items: { ring_delver: 1 }, text: 'The Delver\'s Band (+4 defence, +1 luck)' } },
      { title: 'Master Miner', tasks: [{ t: 'boss', b: 'warden', label: 'Beat the Stone Warden' }, { t: 'bring', items: { gold_ore: 15, silver_bar: 5 } }, { t: 'skill', k: 'mining', L: 45 }],
        reward: { tool: 'pick', text: 'Your pickaxe, reforged one tier up by the guild smiths' } },
      { title: 'Guildmaster of Stone', tasks: [{ t: 'bring', items: { mythril_ore: 15, diamond: 1 } }, { t: 'skill', k: 'mining', L: 65 }],
        reward: { items: { ring_greyhelm: 1 }, gold: 3000, text: 'The Greyhelm Crest (+15% gold, pulls loot to you)' } },
    ],
    store: [['staircase', 300, 1], ['coal', 12, 1], ['ring_delver', 2500, 3], ['mythril_ore', 220, 3], ['diamond', 1500, 4]] },

  af_guild: { town: 'ashford', name: 'Hunters\' Lodge', fee: 120, house: ['af_hut', 27, 16], floor: 'f', wall: 'plank',
    master: { id: 'brakka', n: 'Brakka', role: 'Huntmaster of Ashford', P: GP({ skin: '#c8906a', hair: '#3a2a1a', hs: 'pony', shirt: '#5a6a3a', pants: '#4a3a2a', vest: '#7a5a3a', cape: '#3a4a2a' }),
      love: ['fang', 'hide', 'hunters_brew'], like: ['red_meat', 'leather', 'blackberry'], hate: ['slime_goo', 'tulip'],
      lines: [['Quiet feet, patient hands. The forest gives to those who wait.', 'Wolves are getting bold this year.'], ['The Lodge keeps its own bows. You don\'t buy them. You earn them.'], ['You track like one of us now. The deer hate you. That\'s a compliment.']] },
    blurb: 'Trackers and bowmen who keep the forest roads safe. The Lodge makes its own bows, for its own members only.',
    props: [['weapons', 1, 3], ['weapons', 3, 3], ['hay', 9, 3], ['barrel', 10, 3], ['logpile', 9, 6], ['lamp', 6, 3]],
    ranks: [
      { title: 'Initiate' },
      { title: 'Tracker', tasks: [{ t: 'kills', en: ['wolf', 'icewolf', 'direwolf', 'rimewolf'], n: 8, label: 'Slay 8 wolves' }, { t: 'bring', items: { hide: 6 } }],
        reward: { items: { hunt_bow: 1, arrow: 60 }, text: 'The Huntsman\'s Bow, made by the Lodge for its own' } },
      { title: 'Stalker', tasks: [{ t: 'kills', en: ['boar'], n: 10, label: 'Slay 10 wild boars' }, { t: 'bring', items: { fang: 8, leather: 4 } }, { t: 'cskill', k: 'ranged', L: 20 }],
        reward: { items: { ring_tracker: 1 }, text: 'The Tracker\'s Charm (+10% critical hits)' } },
      { title: 'Huntsman', tasks: [{ t: 'kills', en: ['cavebear', 'direwolf', 'hellhound', 'bandit', 'highbandit'], n: 15, label: 'Slay 15 cave bears, dire wolves, hellhounds or bandits' }, { t: 'cskill', k: 'ranged', L: 35 }],
        reward: { items: { ashford_greatbow: 1, fire_arrow: 40 }, text: 'The Ashford Greatbow, the Lodge\'s finest' } },
      { title: 'Huntmaster', tasks: [{ t: 'boss', b: 'warlord', label: 'Beat the Bandit Warlord' }, { t: 'cskill', k: 'ranged', L: 50 }],
        reward: { gold: 3000, items: { ring_antler: 1 }, text: 'The Antler Ring (+6 attack, +8% speed)' } },
    ],
    store: [['arrow', 4, 1], ['fire_arrow', 20, 2], ['leather', 60, 1], ['hunt_bow', 2200, 2], ['ashford_greatbow', 9000, 4]] },

  sm_guild: { town: 'saltmere', name: 'Anglers\' Guild', fee: 100, house: ['sr_house', 19, 15], floor: 'f', wall: 'plank',
    master: { id: 'nessa', n: 'Old Nessa', role: 'Mistress of Anglers', P: GP({ skin: '#e8c0a0', hair: '#d8d8d0', hs: 'bun', shirt: '#2a5a7a', pants: '#3a3a40', hat: '#2a4a6a', apron: '#a89878' }),
      love: ['sturgeon', 'pearl', 'tuna'], like: ['sardine', 'clam', 'fish_stew'], hate: ['slime_goo', 'coal'],
      lines: [['A good angler talks less than the fish.', 'The tide tells you everything, if you\'ll listen.'], ['Sixty years on these docks. The sea still surprises me.'], ['You\'ve the hands for it now. Steady. Like your line.']] },
    blurb: 'Rod, net and harpoon. The Anglers keep the old charms of the coast and share them only with their own.',
    props: [['nets', 1, 3], ['nets', 9, 3], ['barrel', 3, 3], ['tub', 10, 6], ['crate', 1, 6], ['lamp', 6, 3], ['rowboat', 8, 7]],
    ranks: [
      { title: 'Initiate' },
      { title: 'Netter', tasks: [{ t: 'stat', f: () => S.stats.fish || 0, n: 15, label: 'Catch 15 fish' }, { t: 'bring', items: { clam: 5 } }],
        reward: { items: { ring_angler: 1 }, text: 'The Angler\'s Charm (+2 luck)' } },
      { title: 'Angler', tasks: [{ t: 'stat', f: () => S.stats.fish || 0, n: 50, label: 'Catch 50 fish' }, { t: 'skill', k: 'fishing', L: 20 }],
        reward: { tool: 'rod', text: 'Your rod, rebuilt by the guild: a wider catch zone' } },
      { title: 'Sea Captain', tasks: [{ t: 'stat', f: () => S.stats.fish || 0, n: 120, label: 'Catch 120 fish' }, { t: 'skill', k: 'fishing', L: 40 }, { t: 'boss', b: 'snapper', label: 'Beat Old Snapper' }],
        reward: { items: { ring_pearlhook: 1 }, gold: 1500, text: 'The Pearl Hook (+10% gold, pulls loot to you)' } },
      { title: 'Master of the Tides', tasks: [{ t: 'stat', f: () => S.stats.fish || 0, n: 300, label: 'Catch 300 fish' }, { t: 'skill', k: 'fishing', L: 60 }],
        reward: { gold: 4000, text: 'Gold, and the coast\'s respect' } },
    ],
    store: [['crab_trap', 150, 1], ['harpoon', 1200, 2], ['ring_angler', 1800, 2], ['pearl', 900, 3]] },

  kb_guild: { town: 'kingsbridge', name: 'Growers\' Guild', fee: 200, house: ['kb_house_c', 45, 6], floor: 'f', wall: 'plaster',
    master: { id: 'florian', n: 'Florian Vale', role: 'Master of Growers', P: GP({ skin: '#f0d0b0', hair: '#c8642a', hs: 'short', shirt: '#4a7a3a', pants: '#e8dcc0', vest: '#8a6a3a', hat: '#5a7a3a' }),
      love: ['starbloom', 'melon', 'truffle'], like: ['wheat', 'honey', 'jam_cherry'], hate: ['slime_goo', 'bone'],
      lines: [['Good soil, good water, patience. The rest is weather.', 'Every great city is fed by somebody\'s field.'], ['The Guild keeps seed lines older than the crown.'], ['Your harvests are talked about at the market now. Well done.']] },
    blurb: 'The farmers who feed the capital. Members get the Guild\'s old seed lines, its tonics, and its tools.',
    props: [['plant', 1, 3], ['plant', 10, 3], ['sack', 3, 3], ['sack', 8, 3], ['hay', 1, 6], ['barrel', 10, 6], ['lamp', 6, 3]],
    ranks: [
      { title: 'Initiate' },
      { title: 'Planter', tasks: [{ t: 'stat', f: () => S.stats.harvest || 0, n: 40, label: 'Harvest 40 crops' }, { t: 'bring', items: { wheat: 10 } }],
        reward: { items: { rich_compost: 15, growth_tonic: 5 }, text: 'Rich compost and growth tonic from the Guild stores' } },
      { title: 'Cultivator', tasks: [{ t: 'stat', f: () => S.stats.harvest || 0, n: 200, label: 'Harvest 200 crops' }, { t: 'skill', k: 'farming', L: 25 }],
        reward: { tool: 'can', text: 'Your watering can, widened by the Guild tinkers' } },
      { title: 'Harvest Master', tasks: [{ t: 'stat', f: () => S.stats.harvest || 0, n: 600, label: 'Harvest 600 crops' }, { t: 'skill', k: 'farming', L: 45 }, { t: 'bring', items: { honey: 5 } }],
        reward: { items: { ring_grower: 1, starbloom_seed: 10 }, text: 'The Grower\'s Ring (+2 luck, +regen) and starbloom seeds' } },
      { title: 'Lord of the Harvest', tasks: [{ t: 'stat', f: () => S.stats.harvest || 0, n: 1500, label: 'Harvest 1,500 crops' }, { t: 'skill', k: 'farming', L: 65 }],
        reward: { tool: 'hoe', gold: 5000, text: 'Your hoe, reforged, and the Guild\'s purse' } },
    ],
    store: [['rich_compost', 90, 1], ['growth_tonic', 140, 1], ['starbloom_seed', 400, 3], ['ring_grower', 3000, 3]] },
};

// guild-only items
I('ring_delver', 'Delver\'s Band', 'ring', 800, 'ring', '#8a92a4', '#ffd040', { slot: 'ring', bonus: { def: 4, luck: 1 }, desc: 'Miners\' Guild: +4 defence, +1 luck' });
I('ring_greyhelm', 'Greyhelm Crest', 'ring', 2500, 'ring', '#c8a040', '#5a5a60', { slot: 'ring', bonus: { gold: .15, magnet: 1 }, desc: 'Miners\' Guild: +15% gold, pulls loot to you' });
I('ring_tracker', 'Tracker\'s Charm', 'ring', 900, 'ring', '#5a8a3a', '#ffd040', { slot: 'ring', bonus: { crit: .1 }, desc: 'Hunters\' Lodge: +10% critical hits' });
I('ring_antler', 'Antler Ring', 'ring', 2500, 'ring', '#c8a878', '#7a5a3a', { slot: 'ring', bonus: { atk: 6, spd: .08 }, desc: 'Hunters\' Lodge: +6 attack, +8% speed' });
I('ring_angler', 'Angler\'s Charm', 'ring', 700, 'ring', '#3a7ab8', '#ffd040', { slot: 'ring', bonus: { luck: 2 }, desc: 'Anglers\' Guild: +2 luck' });
I('ring_pearlhook', 'Pearl Hook', 'ring', 2200, 'ring', '#f2ead8', '#3a7ab8', { slot: 'ring', bonus: { gold: .1, magnet: 1 }, desc: 'Anglers\' Guild: +10% gold, pulls loot to you' });
I('ring_grower', 'Grower\'s Ring', 'ring', 1800, 'ring', '#5aa83a', '#ffd040', { slot: 'ring', bonus: { luck: 2, regen: 1 }, desc: 'Growers\' Guild: +2 luck, slow healing' });
if (IT.steel_bow) I('hunt_bow', 'Huntsman\'s Bow', 'weapon', 900, 'bow', '#6a4a2a', '#e8dcc0', { slot: 'weapon', atk: 20, wt: 'bow', tier: 'steel', ti: IT.steel_bow.ti, cd: .46, desc: 'Hunters\' Lodge: made for its own members' });
if (IT.mythril_bow) I('ashford_greatbow', 'Ashford Greatbow', 'weapon', 3000, 'bow', '#4a3420', '#c8a040', { slot: 'weapon', atk: 34, wt: 'bow', tier: 'mythril', ti: IT.mythril_bow.ti, cd: .5, desc: 'Hunters\' Lodge: the Lodge\'s finest, for Huntsmen only' });

// halls, guildmasters, rooms, hours
for (const act in GUILDS) {
  const G = GUILDS[act], T = TOWNS[G.town];
  const b = T && T.b.find(b => b[0] === G.house[0] && b[1] === G.house[1] && b[2] === G.house[2]);
  if (b) { b[5] = act; b[6] = G.name; }
  const M = G.master;
  TOWN_NPCS[M.id] = { town: G.town, n: M.n, role: M.role, shop: act, P: M.P, love: M.love, like: M.like, hate: M.hate, lines: M.lines, gifts: [] };
  NPCS[M.id] = { n: M.n, role: M.role, shop: act, P: M.P, love: M.love.filter(k => IT[k]), like: M.like.filter(k => IT[k]), hate: M.hate.filter(k => IT[k]), lines: M.lines, gifts: [], town: G.town };
  TOWN_ACTS[act] = { town: G.town, kind: G.house[0], name: G.name };
  for (const [k] of G.props) if (!FURN[k]) FURN[k] = {};
  ROOMS[act] = { name: G.name, wall: G.wall, dark: .3, w: 12, h: 9, floor: G.floor, keeper: [M.id, 5, 4],
    f: [['counter', 4, 5, act, 'Guild'], ...G.props], d: [['dec_banner_' + (G.town === 'kingsbridge' ? 'royal' : 'red'), 3, 1, 4, 2], ['dec_banner_' + (G.town === 'kingsbridge' ? 'royal' : 'red'), 8, 1, 4, 2], ['dec_rug_green', 4, 6, 0, 8]] };
  HOURS[act] = [480, 1200]; SCHED[M.id] = [[480, 'shop'], [1200, 'home']];
  DOORL[act] = 'Enter'; BLD_N[act] = G.name;
}
// the Seam's door: the mine mouth in Greyhelm
{ const b = TOWNS.greyhelm.b.find(b => b[0] === 'mine'); if (b) { b[5] = 'gh_seam'; b[6] = 'The Guild Seam'; } DOORL.gh_seam = 'Enter'; BLD_N.gh_seam = 'The Guild Seam'; }

const gState = act => { S.guilds = S.guilds || {}; return S.guilds[act]; };
const gRank = act => { const g = gState(act); return g ? g.r : -1; };
const sklv = k => S.sk[k] ? (S.sk[k].L || 1) : 1;
function taskInfo(act, t) {
  const g = gState(act) || { kills: {} };
  if (t.t === 'bring') return { label: 'Bring ' + Object.entries(t.items).map(([k, n]) => n + ' ' + (IT[k] ? IT[k].n : k) + ' (have ' + cnt(k) + ')').join(', '), ok: Object.entries(t.items).every(([k, n]) => cnt(k) >= n) };
  if (t.t === 'skill') return { label: (SKN[t.k] || t.k) + ' level ' + t.L + ' (yours ' + sklv(t.k) + ')', ok: sklv(t.k) >= t.L };
  if (t.t === 'cskill') { const L = typeof clv === 'function' ? clv(t.k) : 1; return { label: (CSKN[t.k] || t.k) + ' level ' + t.L + ' (yours ' + L + ')', ok: L >= t.L }; }
  if (t.t === 'stat') { const v = t.f(); return { label: t.label + ' (' + Math.min(v, t.n) + '/' + t.n + ')', ok: v >= t.n }; }
  if (t.t === 'boss') return { label: t.label, ok: (S.bosses && S.bosses[t.b] || 0) > 0 };
  if (t.t === 'kills') { const v = t.en.reduce((a, k) => a + ((g.kills || {})[k] || 0), 0); return { label: t.label + ' since joining (' + Math.min(v, t.n) + '/' + t.n + ')', ok: v >= t.n }; }
  return { label: '?', ok: false };
}
function titleName() { return S.title ? S.title + ' ' + (S.look && S.look.name || '') : (S.look && S.look.name || 'friend'); }
function promote(act) {
  const G = GUILDS[act], g = gState(act), R = G.ranks[g.r + 1]; if (!R) return;
  const tasks = R.tasks.map(t => taskInfo(act, t)); if (!tasks.every(x => x.ok)) { toast('Not yet: ' + tasks.filter(x => !x.ok).map(x => x.label).join('; ')); return; }
  for (const t of R.tasks) if (t.t === 'bring') for (const k in t.items) take(k, t.items[k]);
  g.r++; S.titles = S.titles || []; if (!S.titles.includes(R.title)) S.titles.push(R.title); S.title = R.title;
  const W = R.reward || {}; if (W.gold) S.gold += W.gold; for (const k in W.items || {}) if (IT[k]) give(k, W.items[k]);
  if (W.tool && S.tools[W.tool] !== undefined) S.tools[W.tool] = Math.min(5, (S.tools[W.tool] || 1) + 1);
  if (typeof recalc === 'function') recalc(); SFX.lvl();
  closeModal();
  storyDialog([[G.master.id, 'By the Guild\'s charter, I name you ' + R.title + '. Wear it well.'], [G.master.id, W.unlock || ('Yours, as promised: ' + (W.text || 'the Guild\'s thanks') + '.')]], { title: G.name, done: () => townMenu(act, G.master.id) });
}
function openGuild(act, who) {
  const G = GUILDS[act], k = who || G.master.id;
  openModal(G.name, [
    { id: 'g', label: 'Guild', render: b => {
      if (NPCS[k]) greet(b, k);
      const g = gState(act);
      if (!g) {
        b.append(el('p', null, G.blurb), el('p', { class: 'note' }, 'Joining costs ' + G.fee + 'g. Members climb five ranks, each with its own title and rewards you can\'t get anywhere else.'));
        b.append(el('div', { class: 'acts' }, el('button', { class: 'btn big', on: () => { if (S.gold < G.fee) { toast('The fee is ' + G.fee + 'g.'); return; } S.gold -= G.fee; S.guilds = S.guilds || {}; S.guilds[act] = { r: 0, kills: {} }; S.titles = S.titles || []; if (!S.titles.includes('Initiate')) S.titles.push('Initiate'); SFX.ok(); closeModal(); storyDialog([[G.master.id, 'Welcome to the ' + G.name + ', Initiate. Here\'s what we ask of you before you rise.']], { title: G.name, done: () => openGuild(act, k) }); } }, 'Join the guild (' + G.fee + 'g)')));
        return;
      }
      const R = G.ranks[g.r], N = G.ranks[g.r + 1];
      b.append(el('p', null, el('b', null, 'Your rank: ' + R.title), ' (' + (g.r + 1) + ' of ' + G.ranks.length + ')'));
      if (!N) { b.append(el('p', { class: 'note' }, 'You hold the guild\'s highest rank. There is nothing left to ask of you, only to be asked.')); return; }
      b.append(el('h3', null, 'For the rank of ' + N.title));
      const L = el('div', { class: 'list' }); let all = true;
      for (const t of N.tasks) { const x = taskInfo(act, t); all = all && x.ok; L.append(el('div', { class: 'rrow' + (x.ok ? ' done' : '') }, el('div', { class: 'qck' }, x.ok ? '✓' : '·'), el('div', { class: 'rtxt' }, x.label))); }
      b.append(L, el('p', { class: 'note' }, 'Reward: ' + (N.reward.text || (N.reward.gold ? N.reward.gold + 'g' : '')) + (N.reward.unlock ? ' ' + N.reward.unlock : '')));
      b.append(el('div', { class: 'acts' }, el('button', { class: 'btn big' + (all ? '' : ' ghost'), on: () => promote(act) }, all ? 'Report and be promoted' : 'Not ready yet')));
    } },
    { id: 'r', label: 'Ranks', render: b => {
      const L = el('div', { class: 'list' }), r = gRank(act);
      G.ranks.forEach((R, i) => L.append(el('div', { class: 'rrow' + (i <= r ? ' done' : '') }, el('div', { class: 'qck' }, i <= r ? '✓' : i + 1), el('div', { class: 'rtxt' }, el('b', null, R.title), i ? ' · ' + (R.reward.text || '') + (R.reward.unlock ? ' ' + R.reward.unlock : '') + (R.reward.gold && !R.reward.text ? R.reward.gold + 'g' : '') : ' · on joining'))));
      b.append(L);
    } },
    { id: 's', label: 'Guild store', render: b => {
      const r = gRank(act), L = el('div', { class: 'list' });
      if (r < 0) { b.append(el('p', { class: 'note' }, 'The store is for members.')); return; }
      for (const [id, p, need] of G.store) { if (!IT[id]) continue; if (r >= need) L.append(buyRow(id, p)); else L.append(el('div', { class: 'rrow' }, el('div', { class: 'qck' }, '🔒'), el('div', { class: 'rtxt' }, IT[id].n + ' · ' + G.ranks[need].title + ' rank'))); }
      b.append(L);
    } },
    { id: 't', label: 'Titles', render: b => {
      const T = S.titles || []; if (!T.length) { b.append(el('p', { class: 'note' }, 'Ranks you earn in any guild become titles you can wear.')); return; }
      b.append(el('p', { class: 'note' }, 'Wearing: ' + (S.title || 'no title') + '. Guild folk greet you by it.'));
      b.append(el('div', { class: 'acts wrap' }, ...T.map(t => el('button', { class: 'btn' + (S.title === t ? '' : ' ghost'), on: () => { S.title = t; drawModal(); } }, t)), el('button', { class: 'btn ghost', on: () => { S.title = null; drawModal(); } }, 'No title')));
    } },
  ]);
}
townMenu = (f => function (act, who) { if (GUILDS[act]) return openGuild(act, who); return f.apply(this, arguments); })(townMenu);
// guild folk greet you by your title
greet = (f => function (b, id) { const r = f.apply(this, arguments); const G = Object.values(GUILDS).find(G => G.master.id === id); if (G && S.title) b.prepend(el('p', { class: 'note' }, '"Ah, ' + titleName() + '."')); return r; })(greet);
// beasts slain count for the guilds you've joined
killEnemy = (f => function (m, e) { const was = e && e.dead, r = f.apply(this, arguments); if (e && !was && S.guilds) for (const act in S.guilds) { const g = S.guilds[act]; g.kills = g.kills || {}; g.kills[e.k] = (g.kills[e.k] || 0) + 1; } return r; })(killEnemy);

/* the Guild Seam: Greyhelm's members-only mine, rich ore, rebuilt each day (richer at higher ranks) */
function genSeam() {
  const W = 30, H = 22, m = newMap('gseam', W, H, 'x'), r = gRank('gh_guild'), fresh = S.flags.seamDay !== dayIndex();
  m.dark = true; m.outdoor = false; m.theme = 'earth'; m.name = 'The Guild Seam';
  caveCore(m, W, H, 4441 + dayIndex() * 17, false);
  const floors = []; for (let i = 0; i < W * H; i++) if (m.t[i] === 'c') floors.push(i);
  const st = floors[Math.floor(R() * floors.length)], sx = st % W, sy = (st / W) | 0; setT(m, sx, sy + 1, 'c');
  setO(m, sx, sy, { k: 'furn_ropeup', fixed: 1, act: 'k_seamup', label: 'Climb up' }); m.start = { x: (sx + .5) * 16, y: (sy + 1.6) * 16 };
  const w = r >= 3 ? [['ore_iron', 3], ['ore_silver', 3], ['ore_gold', 4], ['ore_mythril', 3], ['ore_gem', 1.2], ['ore_coal', 2]] : r >= 2 ? [['ore_iron', 4], ['ore_silver', 4], ['ore_gold', 3], ['ore_coal', 3], ['ore_gem', .6]] : [['ore_copper', 4], ['ore_iron', 5], ['ore_silver', 2], ['ore_coal', 4]];
  const dens = fresh ? .3 : .06;
  for (const i of floors) { if (m.o[i] || Math.abs(i % W - sx) + Math.abs(((i / W) | 0) - sy) < 3) continue; if (R() < dens) m.o[i] = { k: wpick(w, R()), cave: 1 }; }
  S.flags.seamDay = dayIndex();
  return m;
}
doorAction = (f => function (act, who) {
  if (act !== 'gh_seam') return f(act, who);
  if (gRank('gh_guild') < 1) { toast(gRank('gh_guild') < 0 ? 'A guild warden blocks the way: "The Seam is for members of the Miners\' Guild. The guild hall is across the street."' : 'A guild warden blocks the way: "Hewers and above, Initiate. Dorrik will tell you what it takes."'); return; }
  const m = MAPS.gseam = genSeam(); goMap('gseam', m.start.x, m.start.y, 0); showBanner(m.name);
  if (S.flags.seamDay === dayIndex() && m.o.filter(o => o && o.cave).length < 20) toast('The guild crews worked this seam this morning. Fresh veins open tomorrow.');
})(doorAction);
objInteract = (f => function (m, x, y, o) {
  if (o && o.act === 'k_seamup') return { label: 'Climb up', fn: () => { const W = MAPS.wilds, b = W.bld.find(b => b.act === 'gh_seam'); if (b) goMap('wilds', (b.door.x + .5) * 16, (b.door.y + 1.8) * 16, 0); } };
  return f(m, x, y, o);
})(objInteract);
MAP_N.gseam = 'The Guild Seam';

// the journal lists your guilds, ranks and what the next rank asks
renderQuests = (f => function (b) {
  f(b);
  if (!S.guilds || !Object.keys(S.guilds).length) return;
  b.append(el('h3', null, 'Guilds' + (S.title ? ' · wearing the title ' + S.title : '')));
  const L = el('div', { class: 'list' });
  for (const act in S.guilds) { const G = GUILDS[act], g = S.guilds[act], N = G.ranks[g.r + 1];
    L.append(el('div', { class: 'rrow' }, el('div', { class: 'qck' }, '⚒'), el('div', { class: 'rtxt' }, el('b', null, G.name + ' · ' + G.ranks[g.r].title), ' (' + TOWNS[G.town].n + ')', el('br'), N ? 'Next, ' + N.title + ': ' + N.tasks.map(t => { const x = taskInfo(act, t); return (x.ok ? '✓ ' : '') + x.label; }).join('; ') : 'Highest rank reached'))); }
  b.append(L);
})(renderQuests);
