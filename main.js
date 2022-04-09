// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, remote, Menu, nativeImage, Tray, dialog, screen } = require('electron')
const path = require('path')
const shell = require('electron').shell;
const { exec } = require("child_process");
const Store = require('electron-store');
const autoStart = require('auto-launch');
const fs = require('fs');
const console = require('console');
const { autoUpdater } = require("electron-updater");
const { info } = require('console');
var request = require('request');
const resourcePath = app.getAppPath().replace("app.asar", "");
const volumeControlPath = path.join("\"" + resourcePath, "volume_control", "VolumeMixerControl.exe\"");
const sendFirmwarePath = path.join(resourcePath, "firmware_updater", "win32");



//app.geta

let tray = null //background tray icon
let mainWindow; //main window 
let hoverlayWindow; //main window 
let loadingScreen;
var backgroundMode = false;

var hoverlayShow = false;


app.allowRendererProcessReuse = false //for Serial port

const macropadSoftareCurrentVersion = app.getVersion();

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

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (backgroundMode) mainWindow.show();
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
}

function devMode() {
    return process.argv[2] == '--dev';
}

function downloadFile(file_url, targetPath) {
    // Save variable to know progress
    var received_bytes = 0;
    var total_bytes = 0;

    var req = request({
        method: 'GET',
        uri: file_url
    });

    var out = fs.createWriteStream(targetPath);
    req.pipe(out);

    req.on('response', function(data) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length']);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;
        var progressObj = {
            total: total_bytes,
            transferred: received_bytes,
            percent: ((received_bytes / total_bytes) * 100).toFixed(2)
        }
        mainWindow.webContents.send('firmware-progress', progressObj);
        showProgress(received_bytes, total_bytes);
    });

    req.on('end', function() {
        //alert("File succesfully downloaded");
        mainWindow.webContents.send('firmware-downloaded');

    });
}

function showProgress(received, total) {
    var percentage = (received * 100) / total;
    console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
}

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
                backgroundMode = false;
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
        // if (readBounds(4)) { // if maximized from the last session
        //     mainWindow.maximize(); // maximize the window
        // }
        mainWindow.show();
        backgroundMode = false;
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

function createHoverlay() {
    var mainScreen = screen.getPrimaryDisplay();
    var dimensions = mainScreen.size;
    var x = dimensions.width / 2 - 75;
    var y = dimensions.height - 300;
    hoverlayWindow = new BrowserWindow({
        width: 800,
        height: 800,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        movable: false,
        show: false,
        x: x,
        y: y,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    hoverlayWindow.setIgnoreMouseEvents(true);
    hoverlayWindow.setAlwaysOnTop(true, 'normal');
    hoverlayWindow.loadFile('./src/windows/hoverlay/hoverlay.html');
    // hoverlayWindow.openDevTools();
    // hoverlayWindow.setBackgroundColor('#000000');
};


function createWindow() {
    // Create the browser window.

    if (devMode()) {
        var maxHeight = 1080;
        var maxWidth = 1920;
    } else {
        var maxHeight = 720;
        var maxWidth = 1280;
    }
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minHeight: 720,
        minWidth: 1280,

        maxHeight: maxHeight,
        maxWidth: maxWidth,

        icon: path.join(__dirname, 'src/imgs/icon.png'),
        fullscreenable: false,
        maximizable: false,


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

        if (devMode()) {
            mainWindow.webContents.openDevTools();
            console.log(app.commandLine.hasSwitch('hidden'));
        }


        if (!app.commandLine.hasSwitch('hidden')) { // if the app is not hidden
            // if (readBounds(4)) { // if maximized from the last session
            //     mainWindow.maximize(); // maximize the window
            // }
            mainWindow.show();
            backgroundMode = false;
        }

    });


    ipcMain.on("close", () => {
        if (devMode()) {
            console.log("Saving values...");
            config.set("windows.main.width", mainWindow.getBounds().width);
            config.set("windows.main.height", mainWindow.getBounds().height);
            config.set("windows.main.x", mainWindow.getBounds().x);
            config.set("windows.main.y", mainWindow.getBounds().y);
            config.set("windows.main.maximized", mainWindow.isMaximized());
            console.log("OK");
        }
        mainWindow.hide();
        backgroundMode = true;
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
        if (devMode())
            console.log("Saving: " + key + " : " + data);
        config.set(key, data);
    });

    ipcMain.on('get-config', function(event, key) {
        var value = config.get(key);
        if (devMode())
            console.log("Getting " + key + " : " + value);
        event.returnValue = value;
    });

    ipcMain.on('getCurrentMedia', function(event, software) {
        exec(volumeControlPath + " getCurrentMedia", (error, data, getter) => {
            // console.log(error);
            // if (devMode())
            //     console.log("data: ", data);
            //console.log(getter);
            event.returnValue = data;
        });
    });
    var hoverlayTimout;
    ipcMain.on('set-music-software', function(event, software, value) {
        exec(volumeControlPath + " changeVolume " + software + " " + value, (error, data, getter) => {
            //console.log(error);
            // if (devMode())
            //     console.log(data);
            // console.log(getter);
            // console.log(error);

            hoverlayWindow.webContents.send('volume-hoverlay', software, data);


            function hideHoverlay() {
                hoverlayWindow.hide();
                hoverlayShow = false;
                //console.log("Hiding hoverlay");
            }
            if (hoverlayShow) {
                clearTimeout(hoverlayTimout);
                hoverlayTimout = setTimeout(hideHoverlay, 2000);
            } else {
                hoverlayShow = true;
                hoverlayWindow.show();
                //console.log("show hoverlay");

                clearTimeout(hoverlayTimout);
                hoverlayTimout = setTimeout(hideHoverlay, 2000);
            }
            event.returnValue = data;
        });


    });

    ipcMain.on('get-softwares-names', function(event) {
        exec(volumeControlPath + " getSoftwaresNames", (error, data, getter) => {
            //console.log(error);
            if (devMode())
                console.log(data);
            //console.log(getter);
            event.returnValue = data;
        });
    });

    ipcMain.on('send-firmware', function(event, port) {
        console.log(sendFirmwarePath);
        exec("leonardoUploader.exe " + port + " firmware.elf", {
            cwd: sendFirmwarePath
        }, (error, data, getter) => {
            console.log(error);
            if (devMode())
                console.log(data);
            console.log(getter);
            event.returnValue = data;
        });
    });


    ipcMain.on('export-settings', function(event) {
        //ask for the path
        var dest = dialog.showSaveDialogSync({
            title: "Export settings",
            defaultPath: "./MacroPad-Config.json",
            filters: [{
                name: 'JSON',
                extensions: ['json']
            }]
        });

        if (dest != undefined) { // if the user didn't cancel the dialog
            fs.copyFile(path.join(app.getPath('userData'), "config.json"), dest, (err) => {
                if (devMode()) {
                    if (err) console.log('Config Error!');
                    console.log('Config exported!');
                }

            });
        } else {
            //cancel
            // console.log("No destination selected");
        }

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

        if (src != undefined) {
            fs.copyFile(src[0], path.join(app.getPath('userData'), "config.json"), (err) => {
                if (err) throw err;
                if (devMode())
                    console.log('Config imported!');
            });
        } else {
            //cancel
            // console.log("No destination selected");
        }
    });


    ipcMain.on('toggle-background-start', function(event) {
        updateAutoStart();
    });


    ipcMain.on('software-version', function(event) {
        event.returnValue = macropadSoftareCurrentVersion;
    });

    ipcMain.on('update-available', function(event) {
        event.returnValue = updateAvailable;
    });

    ipcMain.on('update-info', function(event) {
        event.returnValue = updateInfo;
    });

    ipcMain.on('check-update', async function(event) {
        var value;
        await autoUpdater.checkForUpdates().catch(err => {
            value = err;
            // console.log("----e----");
            // console.log(value);
            // console.log("--------");
        });
        if (value == undefined) {
            event.returnValue = true; // no error
        } else {
            event.returnValue = false; //error
        }
    });

    ipcMain.on('close-all-app', function(event) {
        app.quit();
    });

    ipcMain.on('start-download', function(event) {
        autoUpdater.downloadUpdate();
        event.returnValue = true;
    });

    ipcMain.on('start-download-firmware', function(event, url) {
        console.log("Downloading firmware");
        downloadFile(url, path.join(sendFirmwarePath, "firmware.elf"));
        event.returnValue = true;
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
            transparent: true,
            show: false
        })
    );


    loadingScreen.loadFile('./src/windows/loading/loading.html');
    loadingScreen.on('closed', () => (loadingScreen = null));
    loadingScreen.webContents.on('did-finish-load', () => {
        // loadingScreen.webContents.openDevTools();
        if (!app.commandLine.hasSwitch('hidden')) { // if the app is not hidden
            loadingScreen.setResizable(false);
            loadingScreen.show();
        }

    });
};


var autoLaunch = new autoStart({
    name: 'MacroPad',
    path: app.getPath('exe'),
    isHidden: true
});



var updateAvailable = false;
var updateInfo = null;


app.whenReady().then(() => {
    createLoadingScreen();
    if (devMode()) {
        console.log("---------------------");
        console.log(" MacroPad Software");
        console.log("        V" + macropadSoftareCurrentVersion);
        console.log("---------------------");
    }

    createHoverlay();

    setTimeout(() => {
        createWindow();
        if (devMode()) {
            console.log("App ready!");
            const log = require("electron-log")
            log.transports.file.level = "debug"
            autoUpdater.logger = log
        }
        autoUpdater.checkForUpdates();

        autoUpdater.on('error', (error) => {
            mainWindow.webContents.send('update-error', error);
            // dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString())
        })

        autoUpdater.on('update-available', (info) => {
            updateAvailable = true;
            updateInfo = info;
            mainWindow.webContents.send('update-available', updateAvailable, updateInfo);

            if (devMode())
                console.log(info);

            // dialog.showMessageBox({
            //     type: 'info',
            //     title: 'Found Updates',
            //     message: 'Found updates, do you want update now?\n' + info.releaseName + '\n' + info.releaseNotes +
            //         '\n' + info.releaseDate + '\n' + info.releaseDownload + '\n' + info.releaseNotes + '\n' +
            //         info.version,
            //     buttons: ['Sure', 'No']
            // }).then((buttonIndex) => {
            //     if (buttonIndex === 0) {
            //         autoUpdater.downloadUpdate()
            //     } else {

            //     }
            // })

        })

        autoUpdater.on('update-not-available', () => {
            // dialog.showMessageBox({
            //     title: 'No Updates',
            //     message: 'Current version is up-to-date.'
            // })
        })


        autoUpdater.on('download-progress', (progressObj) => {
            // let log_message = "Download speed: " + progressObj.bytesPerSecond;
            // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
            // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
            mainWindow.webContents.send('download-progress', progressObj);
        })


        autoUpdater.on('update-downloaded', (info) => {
            // dialog.showMessageBox({
            //     title: 'Install Updates',
            //     message: 'Updates downloaded, application will be quit for update...'
            // }).then(() => {
            //     setImmediate(() => autoUpdater.quitAndInstall())
            // })
            mainWindow.webContents.send('update-downloaded', info);
        })

        var autoUpdate = config.get('settings.auto-update');
        if (autoUpdate == null) autoUpdate = false; //default auto update
        autoUpdater.autoDownload = autoUpdate;

    }, 1000);

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    updateAutoStart();

})

// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
    // if (process.platform !== 'darwin') app.dock.hide(); //app.quit()

});

function updateAutoStart() {
    //Computer\HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
    var configAutoStart = config.get("settings.background-start");
    if (configAutoStart == null) configAutoStart = false;
    if (configAutoStart) {
        autoLaunch.enable();
        autoLaunch.isEnabled().then((isEnabled) => {
            if (!isEnabled) autoLaunch.enable();
        });
    } else {
        autoLaunch.disable();
        autoLaunch.isEnabled().then((isEnabled) => {
            if (isEnabled) autoLaunch.disable();
        });
    }

}