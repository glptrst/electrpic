"use strict";
const https = require('https');
const { app, BrowserWindow, ipcMain, webContents } = require('electron');

let win; // browser window.

ipcMain.handle('perform-action', (event, ...args) => {
  https.get(args[0], (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];
    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed.\n' +
			`Status Code: ${statusCode}`);
    }
    let rawData = '';
    res.on('data', (chunk) => {
      rawData += chunk;
    });
    res.on('end', () => {
      let regex = /"og:image.+content=".+"/.exec(rawData);
      regex = /http.+\"/.exec(regex);
      let picUrl = regex[0].substring(0, regex[0].length-1);
      win.webContents.downloadURL(picUrl);
    });
  });

});

function createWindow () {
  win = new BrowserWindow({
    width: 650,
    height: 250,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.  Some APIs
// can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's
// common for applications and their menu bar to stay active until the
// user quits explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
