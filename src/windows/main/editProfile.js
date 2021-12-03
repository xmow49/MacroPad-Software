const { contextBridge } = require("electron");
const { cp } = require("original-fs");

var profileEditorEnabled = false;


function disableMacropadButtons(state) { //disable all encoders/keys buttons when edit mode is disabled
    // for all encoder buttons
    var encoders = [...document.getElementsByClassName("encoder")];
    encoders.forEach(i => {
        i.disabled = state;
    });

    //for all key buttons
    var keys = [...document.getElementsByClassName("key")];
    keys.forEach(i => {
        i.disabled = state;
    });

}

disableMacropadButtons(true);

function editProfilePopup() { //when edit profile button is clicked
    //updateEditGUI();
    if (profileEditorEnabled) {
        //disable the profile editor
        profileEditorEnabled = false;
        document.getElementById("normal-view").className = "";
        document.getElementById("profil-list").className = "";
        document.getElementsByClassName("profile-editor")[0].className = "popup profile-editor disable";
        document.getElementsByClassName("profile-editor")[1].className = "popup profile-editor disable";

        document.getElementById("edit").className = "";
        document.getElementById("macropad").className = "connectPopup";

        //disable edit mode for all encoders/keys buttons
        disableMacropadButtons(true);


    } else {
        //enable the profile editor
        profileEditorEnabled = true;
        document.getElementById("normal-view").className = "disable";
        document.getElementById("profil-list").className = "disable";
        document.getElementsByClassName("profile-editor")[0].className = "popup profile-editor";
        document.getElementsByClassName("profile-editor")[1].className = "popup profile-editor";
        document.getElementById("edit").className = "active-button";
        document.getElementById("macropad").className = "editor";

        //enable edit mode for all encoders/keys buttons
        disableMacropadButtons(false);
    }



}

const editButtonIcon = "mdi mdi-pencil";

function clearEditButton() { //remove edit icon (pen) from all encoders and keys buttons
    //clear edit mode for all encoder buttons
    for (var i = 0; i <= 2; i++) {
        document.getElementById("encoderIcon" + i).className = "mdi";
    }

    //clear edit mode for all key buttons
    for (var i = 0; i <= 5; i++) {
        document.getElementById("keyIcon" + i).className = "mdi";
    }

    document.getElementById("edit-encoder").className = "disable";
    document.getElementById("edit-key").className = "disable";

}

var currentEncoderEdit = -1;
var currentKeyEdit = -1;

function saveActionType() {


}

function getActionValue(type) {
    if (type == "encoder" || type == "key") {
        var actionType = document.getElementsByName(type + "-action-type"); // get all input elements
    } else {
        return -1;
    }
    var currentProfile = document.getElementById("profile-editor-selector").value;

    for (var i = 0; i < actionType.length; i++) {
        if (actionType[i].checked) {
            return actionType[i].value;
        }
    }
    return -1;
}

function editEncoderBtn(newEncoderId) { //when a edit encoder button is clicked
    currentKeyEdit = -1; //disable edit on key
    var currentProfile = document.getElementById("profile-editor-selector").value;
    var actionType = document.getElementsByName("encoder-action-type"); // get all input elements
    if (currentEncoderEdit == -1) { //if no previous encoder is in edition mode set the new encoder in edition mode

    } else {
        //save old values in the config

        var value;
        for (var i = 0; i < actionType.length; i++) {
            if (actionType[i].checked) {
                value = actionType[i].value;
            }
        }

        if (value == null) {
            value = -1;
        }
        saveToConfig("profiles." + currentProfile + ".encoders." + currentEncoderEdit + ".action", parseInt(value));
    }

    currentEncoderEdit = newEncoderId; //store the new encoder id

    var value = readFromConfig("profiles." + currentProfile + ".encoders." + newEncoderId + ".action");
    if (value == null) value = -1;
    //load new action values
    for (var i = 0; i < actionType.length; i++) {
        if (actionType[i].value == value) {
            actionType[i].checked = true;
        } else {
            actionType[i].checked = false;
        }
    }

    clearEditButton();
    document.getElementById("encoderIcon" + newEncoderId).className = editButtonIcon; //dispplay the edit icon (pen) on the new encoder
    //display the gui
    updateEditGUI("encoder", newEncoderId);

}

function editKeyBtn(newKeyId) { //when a edit key button is clicked
    currentEncoderEdit = -1; //disable edit on encoder
    var currentProfile = document.getElementById("profile-editor-selector").value;
    var actionType = document.getElementsByName("key-action-type"); // get all input elements
    if (currentKeyEdit == -1) { //if no previous key is in edition mode set the new key in edition mode

    } else {
        //save old values in the config

        var value;
        for (var i = 0; i < actionType.length; i++) {
            if (actionType[i].checked) {
                value = actionType[i].value;
            }
        }

        if (value == null) {
            value = -1;
        }
        saveToConfig("profiles." + currentProfile + ".keys." + currentKeyEdit + ".action", parseInt(value));
    }
    currentKeyEdit = newKeyId; //store the new encoder id

    //Read value from config
    var value = readFromConfig("profiles." + currentProfile + ".keys." + newKeyId + ".action");
    if (value == null) value = -1;
    //load new action values
    for (var i = 0; i < actionType.length; i++) {
        if (actionType[i].value == value) {
            actionType[i].checked = true;
        } else {
            actionType[i].checked = false;
        }
    }

    clearEditButton();
    document.getElementById("keyIcon" + newKeyId).className = editButtonIcon;
    //display the gui
    updateEditGUI("key", newKeyId);


}


function updateEditGUI(type, id) { //update the gui when an encoder or key changes action, value ....
    if (type == "encoder") {
        document.getElementById("edit-encoder").className = ""; //enable the edit encoder menu
        document.getElementById("edit-key").className = "disable"; //disable the edit key menu

        var value = getActionValue("encoder");

        if (value == "-1") {
            document.getElementById("encoder-master-volume").className = "disable";
            document.getElementById("encoder-software-volume").className = "disable";
            document.getElementById("encoder-custom").className = "disable";
        } else if (value == "0") {
            document.getElementById("encoder-master-volume").className = "";
            document.getElementById("encoder-software-volume").className = "disable";
            document.getElementById("encoder-custom").className = "disable";
        } else if (value == "1") {
            console.log(value);
            document.getElementById("encoder-master-volume").className = "disable";
            document.getElementById("encoder-software-volume").className = "";
            document.getElementById("encoder-custom").className = "disable";
            displayAllSoundSoftwaresInSelector();
        } else if (value == "2") {
            document.getElementById("encoder-master-volume").className = "disable";
            document.getElementById("encoder-software-volume").className = "disable";
            document.getElementById("encoder-custom").className = "";
        } else {
            document.getElementById("encoder-master-volume").className = "disable";
            document.getElementById("encoder-software-volume").className = "disable";
            document.getElementById("encoder-custom").className = "disable";
        }
        document.getElementById("current-edition").innerHTML = "Encoder " + (id + 1);
    } else if (type == "key") {
        document.getElementById("edit-key").className = ""; //enable the edit key menu
        document.getElementById("edit-encoder").className = "disable"; //disable the edit encoder menu
        document.getElementById("current-edition").innerHTML = "Key " + (id + 1);
    }


}

function displayAllSoundSoftwaresInSelector() {
    var strSoftwareList = IPC.sendSync("get-softwares-names");
    //remove all \n and \r from the string
    strSoftwareList = strSoftwareList.replace(/\r?\n|\r/g, "");
    var softwareList = strSoftwareList.split(" ");

    var softwareSelector = document.getElementById("software-volume-selector");
    //clear the software selector
    softwareSelector.innerHTML = "";
    //add options to the software selector
    for (var i = 0; i < softwareList.length; i++) {
        var option = document.createElement("option");
        option.text = softwareList[i];
        softwareSelector.add(option);
    }

    console.log(softwareList);
}