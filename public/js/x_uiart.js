/* ================= Painted UI (asked 2026-11-05: dark oak wood and beautiful edges) =================
   While a painted style is on (body.styled, x_artstyle.js), windows and panels wear a carved dark-oak frame with brass
   corners over aged parchment, buttons are oak planks, inventory slots are recessed wooden hollows and the menu dock's tiles
   are oak plaques: pieces painted by art/ui_paint.py and finished by art/ui_finish.py (public/art/ui/ui_*.png), used as
   CSS border-images and backgrounds so they stretch to any size. The pixel style keeps the old frames (pc.css). */
document.head.append(el('style', null, `
body.styled { --pframe: url(art/ui/ui_frame.png); --pparch: url(art/ui/ui_parch.png); }
body.styled #modal .panel, body.styled #mgame, body.styled #fishgame, body.styled #helppop, body.styled .pincard, body.styled #pauseov .f-panel {
  border: 22px solid transparent !important; border-image: var(--pframe) 64 stretch !important;
  background: var(--pparch) center / 100% 100% !important; background-clip: padding-box !important;
  box-shadow: 0 12px 34px rgba(10, 5, 2, .55) !important; border-radius: 0 !important; }
body.styled #modal .panel { padding: 4px 10px 10px !important; }
body.styled #helppop, body.styled .pincard { border-width: 14px !important; }
body.styled .f-panel:not(.panel):not(#mgame):not(#fishgame):not(#helppop):not(.pincard), body.styled .toast, body.styled .greet, body.styled .detail {
  border: 10px solid transparent !important; border-image: var(--pframe) 64 stretch !important;
  background: var(--pparch) center / 100% 100% !important; background-clip: padding-box !important; box-shadow: 0 6px 16px rgba(10, 5, 2, .4) !important; border-radius: 0 !important; }
body.styled #hotbar { border-width: 12px !important; }
body.styled .rrow, body.styled .eqstat, body.styled .perkcard, body.styled .lore, body.styled .paper {
  background: rgba(255, 246, 222, .45) !important; box-shadow: inset 0 0 0 1px rgba(90, 56, 28, .35), 0 1px 0 rgba(255, 255, 255, .35) !important; border-radius: 4px !important; }
body.styled .btn, body.styled #modal .btn, body.styled #modal .rrow .acts .btn, body.styled #modal .acts .btn {
  border: 7px solid transparent !important; border-image: url(art/ui/ui_button.png) 24 stretch !important;
  background: #3e2414 !important; background-clip: padding-box !important; box-shadow: none !important; border-radius: 0 !important;
  color: #f6e4c0 !important; text-shadow: 0 1px 0 rgba(0, 0, 0, .6); }
body.styled .btn:hover, body.styled #modal .btn:hover { filter: brightness(1.15); }
body.styled .btn.ghost, body.styled #modal .btn.ghost { filter: brightness(1.12) saturate(.9); }
body.styled .btn.off, body.styled #modal .btn.off { filter: grayscale(.6) brightness(.8); }
body.styled .btn.on, body.styled .chip.on { box-shadow: 0 0 0 2px #e8c07a !important; }
body.styled .f-slot, body.styled .slot, body.styled .cell, body.styled .eq {
  background: radial-gradient(ellipse at 50% 46%, rgba(255, 238, 205, .62), rgba(236, 204, 150, .38) 52%, rgba(200, 160, 100, .1) 74%, rgba(0, 0, 0, 0) 86%), url(art/ui/ui_slot.png) center / 100% 100% !important; box-shadow: none !important; border-radius: 6px !important; }   
/* a warm light wash over the slot's middle (asked 2026-11-05: icons were hard to see on the dark oak); the carved rim stays dark */
body.styled .eq .empty, body.styled .slot .empty, body.styled .f-slot .empty { color: #ecd6a8 !important; text-shadow: 0 1px 0 rgba(0,0,0,.6); }
body.styled .f-slot.on, body.styled .slot.on { box-shadow: 0 0 0 2px #ffd25a, 0 0 10px rgba(255, 200, 90, .6) !important; }
body.styled #topr .dk, body.styled .f-dark {
  background: url(art/ui/ui_tile.png) center / 100% 100% !important; box-shadow: 0 3px 6px rgba(0, 0, 0, .4) !important; border-radius: 8px !important; color: #f6e4c0 !important; }
body.styled #topr .dk .dkn, body.styled #topr .dk kbd { color: #f6e4c0 !important; text-shadow: 0 1px 1px rgba(0,0,0,.8); }
body.styled #topr .dk kbd { background: rgba(0,0,0,.35) !important; border-color: rgba(232,192,122,.4) !important; }
body.styled #topr .dk.on { box-shadow: 0 0 0 2px #ffd25a, 0 0 12px rgba(255, 200, 90, .55) !important; }
body.styled .tab { background: #4a2c18 !important; color: #f0dcb4 !important; border-radius: 6px 6px 0 0 !important; box-shadow: inset 0 0 0 1px rgba(232, 192, 122, .35) !important; }
body.styled .tab.on { background: #6a4022 !important; color: #fff2d0 !important; box-shadow: inset 0 0 0 1px #e8c07a, 0 -2px 0 #e8c07a !important; }
body.styled #modal .ph h2, body.styled #mtitle { color: #3a2010 !important; text-shadow: 0 1px 0 rgba(255, 240, 200, .6); }
body.styled .vbar { border-radius: 4px !important; box-shadow: inset 0 0 0 2px #2a1408, 0 0 0 1px #c8925a !important; }
`));
// preload, so the first window doesn't flash the old frame
for (const n of ['frame', 'parch', 'button', 'slot', 'tile']) { const i = new Image(); i.src = 'art/ui/ui_' + n + '.png'; }

/* scrollbars in the same dark oak (asked 2026-11-05): a sunken dark-wood track and an oak-plank thumb with a brass rim and a
   lit top edge, in painted styles only. Chromium ignores these ::-webkit- rules on any element that sets the standard
   scrollbar-width or scrollbar-color, so neither is set here. */
document.head.append(el('style', null, `
body.styled ::-webkit-scrollbar { width: 14px; height: 14px; }
body.styled ::-webkit-scrollbar-track { background: linear-gradient(90deg, #1e120a, #2e1d10 45%, #24170c); border-radius: 7px;
  box-shadow: inset 0 0 0 1px #120a05, inset 2px 0 4px rgba(0,0,0,.6); }
body.styled ::-webkit-scrollbar-track:horizontal { background: linear-gradient(180deg, #1e120a, #2e1d10 45%, #24170c); }
body.styled ::-webkit-scrollbar-thumb { border-radius: 7px; border: 2px solid #b8893a;
  background: linear-gradient(90deg, #4a2c16, #7a4c26 35%, #8e5a2e 50%, #6a3f1e 70%, #3e2412);
  box-shadow: inset 0 1px 0 rgba(255,220,150,.35), inset 0 -1px 0 rgba(0,0,0,.4); }
body.styled ::-webkit-scrollbar-thumb:horizontal { background: linear-gradient(180deg, #4a2c16, #7a4c26 35%, #8e5a2e 50%, #6a3f1e 70%, #3e2412); }
body.styled ::-webkit-scrollbar-thumb:hover { border-color: #e0b45a; filter: brightness(1.15);
  background: linear-gradient(90deg, #5a361a, #8e5a2e 35%, #a46a36 50%, #7a4a22, #4a2c16); }
body.styled ::-webkit-scrollbar-thumb:active { border-color: #f0c870; }
body.styled ::-webkit-scrollbar-corner { background: #1e120a; }
body.styled ::-webkit-scrollbar-button { display: none; }
body.styled #mtabs::-webkit-scrollbar { height: 8px; }
`));
