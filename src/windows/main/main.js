//const { ipcMain, app, BrowserWindow, remote } = require("electron");
const { remote } = require('electron')
const { ipcRenderer } = require('electron')

function closeBtn() {
    window.close();
}


function minimizeWindowBtn() {
    ipcRenderer.send("maximize");
}

function minimizeBtn() {
    ipcRenderer.send("minimize");
}