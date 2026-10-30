/* Townsfolk outfits: the villagers and the story cast wear clothes that say who they are
   (layers from art/sprites/human.py: apron, vest, robe, hat, hood, cape, belt). */
(function () {
  const dress = (P, o) => P && Object.assign(P, o);
  const N = NPCS;
  dress(N.mara && N.mara.P, { belt: '#6a4a2a' });                                   // shopkeeper: apron and belt
  dress(N.brann && N.brann.P, { apron: '#4a2e1a', belt: '#2a1a10', vest: 1 });      // smith: heavy leather apron over a vest
  dress(N.pip && N.pip.P, { vest: 1, belt: '#5a2418' });                            // tavern keeper: vest and apron
  dress(N.odile && N.odile.P, { vest: 1, belt: '#7a4a2a', hat: '#3a2a22' });        // stable master: riding vest and hat
  dress(N.hale && N.hale.P, { apron: '#a8743f', belt: '#4a2e1a' });                 // carpenter: tool apron
  dress(N.elias && N.elias.P, { robe: '#3a4a6a', belt: '#8a6a3a' });               // curator: a scholar's robe
  dress(N.corwin && N.corwin.P, { vest: 1, belt: '#6a5a3a' });                      // fisher: oilskin vest under his hat
  if (typeof SCAST === 'object') {
    const C = SCAST;
    dress(C.ashcombe && C.ashcombe.P, { vest: 1, belt: '#c8a040' });                // the lord: a gold-trimmed waistcoat and cape
    dress(C.sigrun && C.sigrun.P, { robe: '#e8f0fa', belt: '#6a8ab0' });            // the elder: white robes
    dress(C.quill && C.quill.P, { vest: 1, belt: '#c8a040', cape: '#1a2a3a' });     // harbourmaster: brass-buttoned coat
    dress(C.wren && C.wren.P, { hood: '#c8601a' });                                 // the pilgrim: hooded robe
    dress(C.aldren && C.aldren.P, { helmS: 'silver', plume: '#9ac8ff', armS: 'silver', armor: '#8aa0b8', trim: '#9ac8ff' });  // the knight's ghost
    dress(C.rowan && C.rowan.P, { vest: 1, belt: '#5a3a22' });                      // the son on the road
  }
})();
