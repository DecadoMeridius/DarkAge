/* Test speed-up for automated playtests only: on the test address (http://[::1]:5173) a ?speed=N in the URL
   runs the game's update N times per frame (2-8), so the clock, crops, enemies and machines all go N times faster.
   Never active on localhost, in the desktop build, or without the parameter. */
(function () {
  const m = /[?&]speed=(\d+)/.exec(location.search);
  if (!m || location.host !== '[::1]:5173') return;
  const n = Math.max(1, Math.min(8, +m[1]));
  if (n === 1) return;
  update = (f => function (dt) { for (let i = 0; i < n; i++) f(dt); })(update);
  window.TEST_SPEED = n;
  addEventListener('load', () => { const b = document.createElement('div'); b.textContent = 'TEST SPEED x' + n; Object.assign(b.style, { position: 'fixed', left: '6px', bottom: '6px', zIndex: 70, font: '600 11px sans-serif', color: '#fff', background: '#7a1a1a', padding: '2px 6px' }); document.body.append(b); });
})();
