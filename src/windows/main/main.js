//const { ipcMain, app, BrowserWindow, remote } = require("electron");
const { ipcRenderer } = require('electron')

//------------------ Windows Buttons -------------------
function closeBtn() {
    window.close();
}

function minimizeWindowBtn() {
    ipcRenderer.send("maximize");
}

function minimizeBtn() {
    ipcRenderer.send("minimize");
}
//------------------ /Windows Buttons -------------------



//------------------ Update Popup -------------------
function updateAvailable() {
    return false;
}

var updatePopup = document.getElementById("update-available");

if (updateAvailable()) {
    updatePopup.style.display = "block";
}

function updatePopupChanglogBtn() {
    ipcRenderer.send("openLink", "https://github.com/xmow49/MacroPad-Software/releases")
}

function updatePopupSkipBtn() {
    updatePopup.style.display = "none";
    document.getElementById("select-macropad").style.display = "block";
}

function updatePopupUpdateBtn() {
    document.getElementById("select-macropad").style.display = "block";
}

//------------------ /Update Popup -------------------



//------------------ Select Macroad Popup -------------------
var selectPopup = document.getElementById("select-macropad");

function selectMacropad(id) {
    selectPopup.style.display = "none";
    document.getElementById("connect-macropad").style.display = "block";
}

//------------------ /Select Macroad Popup -------------------

//------------------ Connnect Macroad Popup -------------------
var connectPopup = document.getElementById("connect-macropad");

function connectPopup() {
    connectPopup.style.display = "block";
}

//------------------ /Connnect Macroad Popup -------------------