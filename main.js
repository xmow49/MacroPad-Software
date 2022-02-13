// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, remote, Menu, nativeImage, Tray, dialog } = require('electron')
const path = require('path')
const shell = require('electron').shell;
const { exec } = require("child_process");
const Store = require('electron-store');
const autoStart = require('auto-launch');
const fs = require('fs');

let tray = null //background tray icon
let mainWindow; //main window 
let loadingScreen;

app.allowRendererProcessReuse = false //for Serial port


const schema = {
    "profiles": {
        "type": "object",
        "properties": {
            "0": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string"
                    },
                    "color": {
                        "type": "array",
                        "items": {
                            "anyOf": [{
                                "type": "integer"
                            }]
                        }
                    },
                    "encoders": {
                        "type": "object",
                        "properties": {
                            "0": {
                                "type": "object",
                                "properties": {
                                    "action": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "1": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "2": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            }
                        }
                    },
                    "keys": {
                        "type": "object",
                        "properties": {
                            "0": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "1": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "2": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "3": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "4": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            },
                            "5": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "integer"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};


function createTray() {
    const icon = path.join(__dirname, 'src/imgs/icon.png') // required.
    let trayicon = nativeImage.createFromPath(icon)
    trayicon = trayicon.resize({ width: 16 })
    tray = new Tray(trayicon)

    const contextMenu = Menu.buildFromTemplate([{
            label: 'MacoPad Software',
            icon: trayicon,
            enabled: false // icon greyed out
        },
        { type: 'separator' },

        {
            label: 'Profil',
            submenu: [
                { label: 'Profil 1', type: 'checkbox', checked: true },
                { label: 'Profil 2', type: 'checkbox' },
                { label: 'Profil 3', type: 'checkbox' },
                { label: 'Profil 4', type: 'checkbox' },
                { label: 'Profil 5', type: 'checkbox' },
                { label: 'Profil 6', type: 'checkbox' },
            ]
        },
        { type: 'separator' },
        {
            label: 'Show App',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.quit() // actually quit the app.
            }
        },
    ]);
    tray.setTitle('MacroPad Software');
    tray.setToolTip('MacroPad Software');
    tray.setContextMenu(contextMenu)
    tray.on('click', function(event) {
        mainWindow.show();
    });
}

// const config = new Store({ schema });
const config = new Store();



function readBounds(i) {
    const bounds = [];
    bounds[0] = config.get('windows.main.width');
    bounds[1] = config.get('windows.main.height');
    bounds[2] = config.get('windows.main.x');
    bounds[3] = config.get('windows.main.y');
    bounds[4] = config.get('windows.main.maximized');
    return bounds[i];
}


function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minHeight: 720,
        minWidth: 1280,
        icon: path.join(__dirname, 'src/imgs/icon.png'),

        x: readBounds(2),
        y: readBounds(3),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: true,
            contextIsolation: false,
            nodeIntegration: true,

        },
        show: false
    });

    mainWindow.loadFile('./src/windows/main/main.html');

    mainWindow.webContents.on('did-finish-load', () => {
        /// then close the loading screen window and show the main window
        if (loadingScreen) {
            loadingScreen.close();
        }
        mainWindow.webContents.openDevTools();
        if (readBounds(4)) { // if maximized from the last session
            mainWindow.maximize(); // maximize the window
        }
        mainWindow.show();
    });


    ipcMain.on("close", () => {
        console.log("Saving values...");
        config.set("windows.main.width", mainWindow.getBounds().width);
        config.set("windows.main.height", mainWindow.getBounds().height);
        config.set("windows.main.x", mainWindow.getBounds().x);
        config.set("windows.main.y", mainWindow.getBounds().y);
        config.set("windows.main.maximized", mainWindow.isMaximized());
        console.log("OK");
        mainWindow.hide();
    });

    ipcMain.on('maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    });

    ipcMain.on('minimize', () => {
        mainWindow.minimize();
    });


    ipcMain.on('open-link', function(event, link) {
        shell.openExternal(link);
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

    ipcMain.on('getCurrentMedia', function(event, software) {
        var path = app.getAppPath();
        exec("\"" + path + "\\volume_control\\VolumeMixerControl.exe\" getCurrentMedia ", (error, data, getter) => {
            //console.log(error);
            console.log(data);
            //console.log(getter);
            event.returnValue = data;
        });
    });

    ipcMain.on('set-music-software', function(event, software, value) {
        var path = app.getAppPath();
        exec("\"" + path + "\\volume_control\\VolumeMixerControl.exe\" changeVolume " + software + " " + value, (error, data, getter) => {
            //console.log(error);
            console.log(data);
            //console.log(getter);
            event.returnValue = data;
        });
    });

    ipcMain.on('get-softwares-names', function(event) {
        var path = app.getAppPath();
        exec("\"" + path + "\\volume_control\\VolumeMixerControl.exe\" getSoftwaresNames", (error, data, getter) => {
            //console.log(error);
            console.log(data);
            //console.log(getter);
            event.returnValue = data;
        });
    });

    ipcMain.on('export-settings', function(event) {
        var dest = dialog.showSaveDialogSync({
            title: "Export settings",
            defaultPath: "./MacroPad-Config.json",
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }]
        });
        fs.copyFile(path.join(app.getPath('userData'), "config.json"), dest, (err) => {
            if (err) throw err;
            console.log('Config exported!');
        });
    });

    ipcMain.on('import-settings', function(event) {
        var src = dialog.showOpenDialogSync({
            title: "Import settings",
            defaultPath: "./MacroPad-Config.json",
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }]
        });
        fs.copyFile(src[0], path.join(app.getPath('userData'), "config.json"), (err) => {
            if (err) throw err;
            console.log('Config imported!');
        });
    });

    if (!tray) { // if tray hasn't been created already.
        createTray()
    }
}


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
        // loadingScreen.webContents.openDevTools();
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

    let autoLaunch = new autoStart({
        name: 'MacroPad',
        path: app.getPath('exe'),
    });
    autoLaunch.isEnabled().then((isEnabled) => {
        if (!isEnabled) autoLaunch.enable();
    });

})


// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    // if (process.platform !== 'darwin') app.dock.hide(); //app.quit()

});