const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
  onBotEvent: (callback) => {
    ipcRenderer.on('bot-event', (event, data) => callback(data));
  },
  getPdfList: () => ipcRenderer.invoke('getPdfList'),
  dispatchSelectedPdfs: (payload) => ipcRenderer.invoke('dispatchSelectedPdfs', payload),
  scanRecentChats: (chatCount) => ipcRenderer.invoke('scanRecentChats', chatCount),
  openPdfFolder: () => ipcRenderer.invoke('openPdfFolder'),
  uploadToDatabase: (fileNames) => ipcRenderer.invoke('uploadToDatabase', fileNames),
});
