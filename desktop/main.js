const { app, BrowserWindow, protocol, net, shell, Menu } = require('electron');
const path = require('path'), { pathToFileURL } = require('url');

/* app:// — இணையதளத்தைப் போலவே IndexedDB, WebCodecs, பாதுகாப்பான சூழல் இயங்க */
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
app.commandLine.appendSwitch('enable-features', 'WebCodecs');
if (!app.requestSingleInstanceLock()) app.quit();

let win;
function create() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 420, minHeight: 600, backgroundColor: '#7A0C14', title: 'NEWS STUDIO',
    icon: path.join(__dirname, 'app', 'icon-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true, autoplayPolicy: 'no-user-gesture-required' }
  });
  win.setMenuBarVisibility(false);
  win.loadURL('app://local/index.html');
  /* வெளி இணைப்புகள் உலாவியில் திறக்க */
  const isApp = (u) => u.startsWith('app://local/');
  win.webContents.setWindowOpenHandler(({ url }) => { if (isApp(url)) return { action: 'allow' }; shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!isApp(url)) { e.preventDefault(); shell.openExternal(url); } });
}
app.whenReady().then(() => {
  const root = path.join(__dirname, 'app');
  protocol.handle('app', (req) => {
    let p = decodeURIComponent(new URL(req.url).pathname); if (p === '/' || !p) p = '/index.html';
    const f = path.normalize(path.join(root, p));
    if (!f.startsWith(root)) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(f).toString());
  });
  Menu.setApplicationMenu(null);
  create();
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) create(); });
});
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
