// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, remote } = require('electron')
const path = require('path')
const shell = require('electron').shell;
const { exec } = require("child_process");
const Store = require('electron-store');



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



const config = new Store({ schema });

app.allowRendererProcessReuse = false //Serial port

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
    const mainWindow = new BrowserWindow({
        width: readBounds(0),
        height: readBounds(1),
        minHeight: 720,
        minWidth: 1280,

        x: readBounds(2),
        y: readBounds(3),
        isMaximized: readBounds(4),
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
        mainWindow.show();
    });

    mainWindow.on("close", () => {
        console.log("Saving values...");
        config.set("windows.main.width", mainWindow.getBounds().width);
        config.set("windows.main.height", mainWindow.getBounds().height);
        config.set("windows.main.x", mainWindow.getBounds().x);
        config.set("windows.main.y", mainWindow.getBounds().y);
        config.set("windows.main.maximized", mainWindow.isMaximized());
        console.log("OK");
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

    ipcMain.on('get-music-software', function(event, software) {
        var path = app.getAppPath();
        exec("\"" + path + "\\volume_control\\VolumeMixerControl.exe\" getMusicSoftware " + software, (error, data, getter) => {
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
});