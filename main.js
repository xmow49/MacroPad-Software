const electron = require('electron')
require('@electron/remote/main').initialize()
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        //width: 1280,
        width: 1537,
        height: 720,
        minWidth: 1280,
        minHeight: 720,

        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'js/preload.js'),
            enableRemoteModule: true
        },
        icon: 'assets/img/icon.ico'
    })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.

    mainWindow.webContents.openDevTools()
    mainWindow.setMenu(null);


    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

app.allowRendererProcessReuse = false

app.on('ready', createWindow)


app.on('window-all-closed', function() {
    app.quit()
})

app.on('activate', function() {
    if (mainWindow === null) {
        createWindow()
    }
})