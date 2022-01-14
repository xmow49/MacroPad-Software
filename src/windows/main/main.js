//const { ipcMain, app, BrowserWindow, remote } = require("electron");
const { ipcRenderer } = require('electron');
const IPC = ipcRenderer;

//------------------ Windows Buttons -------------------
function closeBtn() {
    window.close();
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

function updatePopupChanglogBtn() {
    IPC.send("open-link", "https://github.com/xmow49/MacroPad-Software/releases")
    updatePopupBackgroud()
}

function updatePopupSkipBtn() {
    updatePopup.style.display = "none";
    document.getElementById("select-macropad").style.display = "block";
    updatePopupBackgroud()


}

function updatePopupUpdateBtn() {
    document.getElementById("select-macropad").style.display = "block";
    updatePopupBackgroud()
}

//------------------ /Update Popup -------------------



//------------------ Select Macroad Popup -------------------
var selectPopup = document.getElementById("select-macropad");

function selectMacropad(id) {
    selectPopup.style.display = "none";
    document.getElementById("connect-macropad").style.display = "block";
    updatePopupBackgroud()
}

//------------------ /Select Macroad Popup -------------------




var popups = [...document.getElementsByClassName("popup")];

function updatePopupBackgroud() {

    console.log(popups);
    var popupBackground = false
    popups.forEach(i => {
        if (i.style.display === "block") {
            popupBackground = true;
        }
        console.log(popupBackground);
    });

    console.log(popupBackground);
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



function onChangeProfile(value) {
    if (value == null) { // if value is null, get the value
        var radio = document.getElementsByName("profile-selector"); // get all input elements

        for (var i = 0; i < radio.length; i++) {
            if (radio[i].checked) {
                value = radio[i].value;
            }
        }
    }


    //-----------update the gui with the new profile-----------
    for (var i = 0; i < 6; i++) { //for all profiles 
        if (i == value) { //if the new value is the current value
            document.getElementById("profile-" + i).classList.add('checked'); //select the action type
            //document.getElementById(className + i)[0].classList.remove("disable"); //enable the div
        } else {
            document.getElementById("profile-" + i).classList.remove('checked'); //unselect the action type
            //document.getElementById(className + i)[0].classList.add("disable"); //disable the div

        }
    }

    var profileName = readFromConfig("profiles." + value + ".name"); //get the name of the profile
    if (profileName == null) {
        value++;
        profileName = "Profil " + value;
        saveToConfig("profiles." + value + ".name", profileName);

    }
    document.getElementById("macropad-text").innerHTML = profileName; //update the name of the profile
    //-------------------------------------------------------   


}
setTimeout(function() {
    onChangeProfile(0); //set the default value
}, 10);