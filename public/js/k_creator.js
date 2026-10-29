/* ================= Character creator =================
   Shown when a new game starts (before the arrival letter) and from Options.
   The chosen look is saved as S.look; playerPal() reads it, and worn armour still
   recolours the shirt, boots and helm on top. Older saves without S.look use DEFAULT_LOOK. */

const DEFAULT_LOOK = { name: 'Wren', skin: '#e8b48a', hair: '#6a3a22', hs: 'short', eye: '#2b1d18', shirt: '#4a7cc0', pants: '#4a4258', shoe: '#5a3a22', acc: '#c8642a' };
const LOOK_OPTS = {
  skin: ['#f6d6b8', '#e8b48a', '#d09a6a', '#b07850', '#8a5a3a', '#5e3a26'],
  hs: ['short', 'long', 'pony', 'bun', 'spiky', 'bald'],
  hair: ['#1e1612', '#3a2418', '#6a3a22', '#9a5a2a', '#c87a3a', '#e0c070', '#a8a8a8', '#8a2a1e'],
  eye: ['#2b1d18', '#3a5a8a', '#3a7a4a', '#7a5a2a', '#6a6a7a'],
  shirt: ['#4a7cc0', '#a33e2e', '#4f8a5a', '#c8a040', '#6a4a8a', '#e8dcc0', '#3a3a44', '#c87a3a'],
  pants: ['#4a4258', '#3a4a6a', '#5a4a3a', '#2e2e34', '#6a5a3a', '#4a5a3a'],
  shoe: ['#5a3a22', '#2a1a10', '#6a5a4a', '#3a2a3a'],
  acc: ['#c8642a', '#d8342a', '#e8c040', '#4a8ac0', '#5a9a40', '#e8e0d0'],
};
const LOOK_LABEL = { skin: 'Skin', hs: 'Hair style', hair: 'Hair colour', eye: 'Eyes', shirt: 'Shirt', pants: 'Trousers', shoe: 'Boots', acc: 'Scarf' };

const _playerPal = playerPal;
playerPal = function () {
  const P = _playerPal(), L = Object.assign({}, DEFAULT_LOOK, S.look || {});
  const b = S.eq.body ? IT[S.eq.body] : null, bt = S.eq.boots ? IT[S.eq.boots] : null;
  return Object.assign(P, { skin: L.skin, hair: L.hair, hs: L.hs, eye: L.eye, acc: L.acc, shirt: b ? P.shirt : L.shirt, pants: b ? P.pants : L.pants, shoe: bt ? P.shoe : L.shoe });
};

function openCreator(onDone) {
  S.look = Object.assign({}, DEFAULT_LOOK, S.look || {});
  let dir = 0;
  const draw = (cvs) => {
    const P = playerPal(), spr = humanSpr('cc' + Math.random(), P, dir, 0), x = cvs.getContext('2d');
    x.imageSmoothingEnabled = false; x.clearRect(0, 0, cvs.width, cvs.height);
    x.fillStyle = '#8ab05a'; x.fillRect(0, cvs.height - 40, cvs.width, 40);
    x.drawImage(spr, (cvs.width - 32 * 5) / 2, cvs.height - 64 * 5 - 14, 32 * 5, 64 * 5);
  };
  openModal('Who are you?', [{ id: 'c', label: 'Appearance', render: b => {
    const wrap = el('div', { class: 'creator' }), cvs = el('canvas', { width: 220, height: 360, class: 'ccprev' });
    const left = el('div', { class: 'ccleft' }, cvs,
      el('div', { class: 'acts' }, el('button', { class: 'btn ghost', on: () => { dir = [2, 3, 1, 0][[0, 2, 3, 1].indexOf(dir)]; draw(cvs); } }, '⟲ Turn'),
        el('button', { class: 'btn ghost', on: () => { for (const k in LOOK_OPTS) S.look[k] = pickR(LOOK_OPTS[k]); refresh(); } }, '🎲 Random')));
    const right = el('div', { class: 'ccright' });
    const name = el('input', { class: 'ccname', value: S.look.name, maxlength: 16 }); name.addEventListener('input', () => S.look.name = name.value.trim() || 'Wren');
    right.append(el('div', { class: 'ccrow' }, el('span', null, 'Name'), name));
    for (const k in LOOK_OPTS) {
      const row = el('div', { class: 'ccopts' });
      LOOK_OPTS[k].forEach(v => {
        const on = S.look[k] === v, btn = k === 'hs' ? el('button', { class: 'chip' + (on ? ' on' : ''), on: () => { S.look[k] = v; refresh(); } }, v)
          : el('button', { class: 'sw' + (on ? ' on' : ''), style: 'background:' + v, title: v, on: () => { S.look[k] = v; refresh(); } });
        row.append(btn);
      });
      right.append(el('div', { class: 'ccrow' }, el('span', null, LOOK_LABEL[k]), row));
    }
    right.append(el('button', { class: 'btn big', on: () => { MODAL.lock = false; HC_P = null; closeModal(); if (onDone) onDone(); } }, onDone ? 'Begin' : 'Done'));
    wrap.append(left, right); b.append(wrap);
    draw(cvs);
  } }]);
  MODAL.lock = !!onDone; // a new game must pick a look before starting
}

/* new games open the creator before the arrival letter */
const _startGame = startGame;
startGame = function (isNew) {
  if (!isNew) return _startGame(false);
  _startGame(true);
  const letter = MODAL; MODAL = null; $('#modal').hidden = true; PAUSED = true;
  openCreator(() => { saveGame(); if (letter) openModal(letter.title, letter.tabs, letter.cur, letter.opts); });
};
/* Options tab gets a "Change appearance" button */
const _renderOpts = renderOpts;
renderOpts = function (b) {
  _renderOpts(b);
  b.prepend(el('div', { class: 'acts' }, el('button', { class: 'btn', on: () => { closeModal(); openCreator(null); } }, 'Change appearance')));
};
