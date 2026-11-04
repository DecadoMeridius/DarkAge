/* ================= Windows don't pause the game (asked 2026-11-04) =================
   Every window used to stop the world. Now the clock, machines, crops, enemies and villagers keep going while a window
   is open, and only these still pause: the Options tab (the main menu), the Pause key (GPAUSE), story dialogues and
   conversations (DIALOG, a shopkeeper's street chat), locked windows (the Farewell, skill picks), the morning report,
   the character creator and the fishing minigames. With any window open you stay where you are: movement keys are
   ignored and a click-walk stops, so you can't wander off with a shop open. */
function windowPauses() {
  if (TITLE || (typeof GPAUSE !== 'undefined' && GPAUSE)) return true;
  if (typeof DIALOG !== 'undefined' && DIALOG) return true;
  if (typeof FG !== 'undefined' && FG) return true;
  if (!MODAL) return null;   // no window: leave PAUSED to whoever set it (the creator, a knockout)
  if (MODAL.lock || MODAL.cur === 'opts' || MODAL.cur === 't') return true;   // the main menu, locked windows, a street chat
  if (MODAL.tabs && MODAL.tabs[0] && MODAL.tabs[0].label === 'Morning') return true;   // the morning report
  return false;
}
function applyPause() { const p = windowPauses(); if (p !== null) PAUSED = p; }
openModal = (f => function () {
  const r = f.apply(this, arguments);
  INPUT.keys = {}; if (typeof stopWalk === 'function') try { stopWalk(); } catch (e) { }
  applyPause(); return r;
})(openModal);
drawModal = (f => function () { const r = f.apply(this, arguments); applyPause(); return r; })(drawModal);   // switching to Options pauses
// a dialogue closing over a window, or a minigame ending, leaves PAUSED as they found it: put it right
setInterval(() => { if (S && MODAL) applyPause(); }, 100);
// no walking with a window open (typing in a search box is fine)
const NOPAUSE_MOVE = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
addEventListener('keydown', e => {
  if (!MODAL || TITLE || (e.target && /input|textarea|select/i.test(e.target.tagName))) return;
  if (NOPAUSE_MOVE.has((e.key || '').toLowerCase())) { e.stopImmediatePropagation(); INPUT.keys = {}; }
}, true);
