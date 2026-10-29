const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// The game is served from app://game/ rather than file://, so fetch() can load the sprite atlas
// and saves (localStorage) live under one fixed origin that survives updates.
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }]);
const DIST = path.join(__dirname, '..', 'dist');

function create() {
  const win = new BrowserWindow({ width: 1600, height: 900, backgroundColor: '#1d2a1c', autoHideMenuBar: true, title: 'Emberhollow', webPreferences: { contextIsolation: true } });
  if (process.env.VITE_DEV) win.loadURL('http://localhost:5173');
  else win.loadURL('app://game/index.html');
}
app.whenReady().then(() => {
  protocol.handle('app', req => {
    const rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.normalize(path.join(DIST, rel));
    if (!file.startsWith(DIST)) return new Response('Not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  create();
});
app.on('window-all-closed', () => app.quit());
