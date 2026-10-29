/* ================= Start-up: load the pixel-art atlas, then boot ================= */
PIX.load().then(boot, err => { console.error('Atlas failed to load, using painted art', err); boot(); });
