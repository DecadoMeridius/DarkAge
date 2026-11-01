/* Developer mode (asked 2026-11-01): a checkbox on the title screen, off by default. The test scenarios
   (Test sandbox, Combat test, Kingdom test) show on the title screen only while it's on.
   Remembered for the whole game in localStorage `emberhollow_dev` (not per save). */
{
  const DEV_BTNS = ['tsand', 'tcombat', 'tkingdom'];
  const devOn = () => { try { return localStorage.getItem('emberhollow_dev') === '1'; } catch (e) { return false; } };
  const applyDev = () => { for (const id of DEV_BTNS) { const b = document.getElementById(id); if (b) b.style.display = devOn() ? '' : 'none'; } };
  const title = document.getElementById('title');
  if (title && !document.getElementById('devmode')) {
    const box = el('input', { type: 'checkbox', id: 'devmode' }); box.checked = devOn();
    box.addEventListener('change', () => { try { localStorage.setItem('emberhollow_dev', box.checked ? '1' : '0'); } catch (e) {} applyDev(); });
    const row = el('label', { class: 'devmode', for: 'devmode' }, box, ' Developer mode');
    row.style.cssText = 'display:flex;align-items:center;gap:6px;width:fit-content;margin:10px auto 0;padding:4px 12px;background:rgba(42,28,24,.78);color:#f4e8d0;box-shadow:0 0 0 2px #6a4a30;border-radius:3px;font:600 13px Fredoka, sans-serif;cursor:pointer;user-select:none';
    const acts = title.querySelector('.acts'); (acts && acts.parentNode ? acts.parentNode : title).insertBefore(row, acts ? acts.nextSibling : null);
  }
  applyDev();
}
