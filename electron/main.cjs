const { app, BrowserWindow } = require('electron');
const path = require('path');
function create() {
  const win = new BrowserWindow({ width: 1600, height: 900, backgroundColor: '#1d2a1c', autoHideMenuBar: true, webPreferences: { contextIsolation: true } });
  if (process.env.VITE_DEV) win.loadURL('http://localhost:5173');
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}
app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
