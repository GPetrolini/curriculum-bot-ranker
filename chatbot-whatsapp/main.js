if (typeof globalThis.File === 'undefined') {
  const { Blob } = require('buffer');
  globalThis.File = class File extends Blob {
    constructor(bits = [], name = '', options = {}) {
      super(bits, options);
      this.name = name;
      this.lastModified = options.lastModified ?? Date.now();
      this.webkitRelativePath = options.webkitRelativePath || '';
    }
  };
}

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const botService = require('./bot-service');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 820,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function sendBotEvent(event) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('bot-event', event);
  }
}

async function startBot() {
  try {
    const userDataPath = app.getPath('userData');
    await botService.startBot(sendBotEvent, userDataPath);
  } catch (err) {
    sendBotEvent({ type: 'error', payload: err?.message || String(err) });
  }
}

app.whenReady().then(() => {
  createWindow();
  startBot();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('getPdfList', async () => {
  return botService.getPdfList();
});

ipcMain.handle('dispatchSelectedPdfs', async (event, payload) => {
  return botService.dispatchSelectedPdfs(payload.files || [], payload.apiUrl || '');
});

ipcMain.handle('scanRecentChats', async (event, chatCount) => {
  try {
    return await botService.scanRecentChats(chatCount, sendBotEvent);
  } catch (err) {
    return {
      success: false,
      message: err?.message || String(err),
    };
  }
});

ipcMain.handle('openPdfFolder', async () => {
  await shell.openPath(botService.getDownloadsFolder());
  return true;
});

ipcMain.handle('uploadToDatabase', async (event, fileNames) => {
  try {
    return await botService.uploadToDatabase(fileNames);
  } catch (err) {
    return {
      success: false,
      message: err?.message || String(err),
    };
  }
});
