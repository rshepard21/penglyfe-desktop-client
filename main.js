const {app, BrowserWindow, dialog, Menu, MenuItem, shell, globalShortcut} = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const DiscordRPC = require('discord-rpc');
const fs = require('fs');

// Tab support

//const {app, BrowserWindow} = require('electron');
const path = require('path');
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

let pluginName;
switch (process.platform) {
  case 'win32':
    pluginName = 'flash/pepflashplayer64_32_0_0_303.dll';
    break;
  case 'darwin':
    pluginName = 'flash/PepperFlashPlayer.plugin';
    break;
  case 'linux':
    app.commandLine.appendSwitch('no-sandbox')
    pluginName = 'flash/libpepflashplayer.so';
    break;
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
autoUpdater.checkForUpdatesAndNotify();
let mainWindow;
let fsmenu;

function makeControlMenu() {
  controlMenu = new Menu();
  controlMenu.append(new MenuItem({
    label: 'Mute',
    click: () => {
      let ambool = (mainWindow.webContents.audioMuted ? false : true);
      mainWindow.webContents.audioMuted = ambool;
    }
  }));
  return controlMenu;
}

function makeMenu() {
  fsmenu = new Menu();
  fsmenu.append(new MenuItem({
    label: 'About',
    click: () => { 
      dialog.showMessageBox({
        type: "info",
        buttons: ["Ok"],
        title: "About Frosty Desktop",
        message: "Frosty Desktop Client\nCopyright © 2020 daniel11420 / the Frosty Team\nWe hold no copyright for any of the ingame files\nfrosty.gg\ndiscord.me/penguin\nLicense:\n" + fs.readFileSync('resources/app/LICENSE')
      });
    }
  }));
  fsmenu.append(new MenuItem({
    label: 'Fullscreen (Toggle)',
    accelerator: 'CmdOrCtrl+F',
    click: () => { 
      let fsbool = (mainWindow.isFullScreen() ? false : true);
      mainWindow.setFullScreen(fsbool);
    }
  }));
  fsmenu.append(new MenuItem({
    label: 'Mute Audio (Toggle)',
    click: () => { 
      let ambool = (mainWindow.webContents.audioMuted ? false : true);
      mainWindow.webContents.audioMuted = ambool;
    }
  }));
  fsmenu.append(new MenuItem({
    label: 'Controls',
    type: 'submenu',
    submenu: makeControlMenu()
  }));
  fsmenu.append(new MenuItem({
    label: 'Log Out',
    click: () => { 
      mainWindow.reload();
    }
  }));
}

function clearCache() {
  if (mainWindow !== null) {mainWindow.webContents.session.clearCache();}
}

function handleRedirect(event, url) {
  if (!url.includes("penglyfe.com")) {
    event.preventDefault();
    shell.openExternal(url);
  }
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1513,
    height: 823,
    title: 'Penglyfe is loading...',
    icon: __dirname + '/build/purplepeng.png',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      plugins: true,
      nodeIntegration: true,
      webviewTag: true
    }
  });

  mainWindow.setMenu(null);
  clearCache();
  mainWindow.loadURL('http://play.penglyfe.com');

  mainWindow.webContents.on('will-navigate', handleRedirect);
  mainWindow.webContents.on('new-window', handleRedirect);

  // RICH PRESENCE START
  const clientId = '878163246299885568'; DiscordRPC.register(clientId); const rpc = new DiscordRPC.Client({ transport: 'ipc' }); const startTimestamp = new Date();
  rpc.on('ready', () => {
    rpc.setActivity({
      details: 'Playing Penglyfe', 
      state: 'Desktop Client',
      startTimestamp,
      largeImageKey: 'purplepeng'//,
      //largeImageText: "LARGE IMAGE TEXT",
      //smallImageKey: "favicon_512",
      //smallImageText: "SMALL IMAGE TEXT"
    });
  });
  rpc.login({ clientId }).catch(console.error);

  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  if (process.platform === 'darwin') {
    globalShortcut.register('Command+Q', () => {
        app.quit();
    })
  }
}

app.on('ready', function () {
  createWindow();
  makeMenu();
  Menu.setApplicationMenu(fsmenu);
});

app.on('browser-window-focus', function () {
  // Ability to use command+q mac.
  if (process.platform == 'darwin') {
    globalShortcut.register('Command+Q', () => {
      app.quit();
    });
  }
});

app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
  if (process.platform == 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {createWindow();}
});

setInterval(clearCache, 1000*60*5);
