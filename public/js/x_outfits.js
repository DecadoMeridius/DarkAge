/* Outfits for the human enemies (layers in art/sprites/human.py, composed in h_pixel.js humanSpr):
   bandits wear a bandana mask and a leather vest, archers add a quiver, goblins a ragged vest;
   armoured foes wear the tier helmets and cuirasses (x_gear.js styles). */
(function () {
  const dress = (k, o) => { if (EN[k] && EN[k].P) Object.assign(EN[k].P, o); };
  dress('bandit', { mask: 1, vest: 1, belt: '#5a3a22' });
  dress('archer', { mask: 1, vest: 1, quiver: 1, belt: '#6a4428' });
  dress('goblin', { vest: 1, belt: '#5a4a2a' });
  dress('highbandit', { helmS: 'cobalt', plume: '#d8c8a8', armS: 'cobalt', armor: '#5a6a7a', trim: '#d8c8a8', vest: 0 });
  dress('warlord', { helmS: 'gold', helm: '#a8a8b0', plume: '#d8342a', armS: 'steel', armor: '#7a7a86', trim: '#8a2a2a', cape: '#8a1a1a' });
  dress('voidknight', { helmS: 'obsidian', plume: '#e8dcc0', armS: 'obsidian', armor: '#3a2a5a', trim: '#e8dcc0' });
  dress('hollowking', { helmS: 'obsidian', plume: '#5a1a3a', armS: 'obsidian', armor: '#2a1a40', trim: '#5a1a3a' });
})();
