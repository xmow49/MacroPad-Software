// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, remote } = require('electron')
const path = require('path')
const shell = require('electron').shell;

const Store = require('electron-store');




const schema = {
    profiles: {
        type: 'object',
        properties: {
            encoders: {
                type: 'object',
                properties: {
                    action: { type: 'number', default: -1 },
                    value: { type: 'number', default: -1 },

                }
            }
        }
    }
};
const config = new Store({ schema });

app.allowRendererProcessReuse = false //Serial port

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,


        minHeight: 720,
        minWidth: 1280,

        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: true,
            contextIsolation: false,
            nodeIntegration: true,

        },
        show: false
    })

    mainWindow.loadFile('./src/windows/main/main.html')




    mainWindow.webContents.on('did-finish-load', () => {
        /// then close the loading screen window and show the main window
        if (loadingScreen) {
            loadingScreen.close();
        }
        mainWindow.webContents.openDevTools();
        mainWindow.show();
    });



    ipcMain.on('maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
        console.log(mainWindow.isMaximized);
    });

    ipcMain.on('minimize', () => {
        mainWindow.minimize();
    });


    ipcMain.on('open-link', function(event, link) {
        shell.openExternal(link);
        console.log(event);
    });

    ipcMain.on('save-config', function(event, key, data) {
        console.log("Saving: " + key + " : " + data);
        config.set(key, data);
    });

    ipcMain.on('get-config', function(event, key) {
        var value = config.get(key);
        console.log("Getting " + key + " : " + value);
        event.returnValue = value;
    });
}



let loadingScreen;
const createLoadingScreen = () => {
    /// create a browser window
    loadingScreen = new BrowserWindow(
        Object.assign({
            /// define width and height for the window
            width: 200,
            height: 400,
            /// remove the window frame, so it will become a frameless window
            frame: false,
            /// and set the transparency, to remove any window background color
            transparent: true
        })
    );
    loadingScreen.setResizable(false);
    loadingScreen.loadURL(
        'file://' + __dirname + './src/windows/loading/loading.html'
    );
    loadingScreen.on('closed', () => (loadingScreen = null));
    loadingScreen.webContents.on('did-finish-load', () => {
        loadingScreen.show();
    });
};


app.whenReady().then(() => {

    createLoadingScreen();


    setTimeout(() => {
        createWindow();
    }, 1000);

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})


// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})