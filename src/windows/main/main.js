//const { ipcMain, app, BrowserWindow, remote } = require("electron");
const { ipcRenderer } = require('electron');
const IPC = ipcRenderer;

//------------------ Windows Buttons -------------------
function closeBtn() {
    IPC.send("close");
}

function minimizeWindowBtn() {
    IPC.send("maximize");
}

function minimizeBtn() {
    IPC.send("minimize");
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

function closeAllPopups() {
    var allPopups = document.getElementsByClassName("popup");
    for (var i = 0; i < allPopups.length; i++) {
        if (!allPopups[i].classList.contains("disable")) {
            document.getElementsByClassName("popup")[i].style.display = "none";
        }
    }
    updatePopupBackground();
}


function updatePopupChanglogBtn() {
    IPC.send("open-link", "https://github.com/xmow49/MacroPad-Software/releases")
    updatePopupBackground()
}

function updatePopupSkipBtn() {
    updatePopup.style.display = "none";
    document.getElementById("select-macropad").style.display = "block";
    updatePopupBackground()


}

function updatePopupUpdateBtn() {
    document.getElementById("select-macropad").style.display = "block";
    updatePopupBackground()
}

//------------------ /Update Popup -------------------



//------------------ Select Macroad Popup -------------------
var selectPopup = document.getElementById("select-macropad");

function selectMacropad(id) {
    selectPopup.style.display = "none";
    document.getElementById("connect-macropad").style.display = "block";
    updatePopupBackground()
}

//------------------ /Select Macroad Popup -------------------

var popups;

window.addEventListener('load', function() {
    popups = [...document.getElementsByClassName("popup")];
})





function updatePopupBackground() {
    var popupBackground = false
    popups.forEach(i => {
        if (i.style.display === "block") {
            popupBackground = true;
        }
    });

    if (popupBackground) {
        document.getElementById("popup-backgroud").className = "enable";
    } else {
        document.getElementById("popup-backgroud").className = "disable";
    }
}


function saveToConfig(key, data) {
    IPC.send("save-config", key, data);
}

function readFromConfig(key) {
    return IPC.sendSync("get-config", key);
}

function openLink(link) {
    IPC.send("open-link", "https://" + link);
}