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

    //---------------------------------------------Save old values in the config -------------------------------------------------


    if (currentEncoderEdit == -1) { //if no previous encoder is in edition mode set the new encoder in edition mode

    } else {
        //save old values in the config

        //------------save action type ------------
        var currentActionType;
        for (var i = 0; i < actionType.length; i++) { //check all radio and save the checked one
            if (actionType[i].checked) {
                currentActionType = actionType[i].value;
            }
        }

        if (currentActionType == null) { //if no radio is checked
            currentActionType = -1;
        }
        saveToConfig("profiles." + currentProfile + ".encoders." + currentEncoderEdit + ".action", parseInt(currentActionType));

        //------------save value ------------
        if (currentActionType == 2) { //key combination
            for (var i = 1; i <= 3; i++) {
                var strValues = document.getElementById("encoder-edit-key-" + i + "-values").innerHTML; //get the values of the key combination
                var values = strValues.split(","); //tranform in array
                saveToConfig("profiles." + currentProfile + ".encoders." + currentEncoderEdit + ".values." + i, parseInt(values[0])); //save the values
            }
        }



    }

    //---------------------------------------------End of save old values in the config -------------------------------------------------

    //---------------------------------------------Load values from the config -------------------------------------------------
    currentEncoderEdit = newEncoderId; //store the new encoder id

    var newActionType = readFromConfig("profiles." + currentProfile + ".encoders." + newEncoderId + ".action");
    if (newActionType == null) newActionType = -1;
    //load new action values
    for (var i = 0; i < actionType.length; i++) {
        if (actionType[i].value == newActionType) {
            actionType[i].checked = true;
        } else {
            actionType[i].checked = false;
        }
    }

    if (newActionType == 2) { //if key combination
        var newValues = [];
        for (var i = 1; i <= 3; i++) {
            newValues[i] = readFromConfig("profiles." + currentProfile + ".encoders." + newEncoderId + ".values." + i);
            if (newValues[i] == null) newValues[i] = -1;
            console.log(newValues);
            document.getElementById("encoder-edit-key-" + i).innerHTML = newValues[i];
        }
        //document.getElementById("encoder-edit-key-" + i + "-values").innerHTML = newValues.join(",");
    }



    clearEditButton();
    document.getElementById("encoderIcon" + newEncoderId).className = editButtonIcon; //dispplay the edit icon (pen) on the new encoder
    //display the gui
    updateEditGUI("encoder", newEncoderId);
    //---------------------------------------------End of load values from the config -------------------------------------------------

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

            document.getElementById('action-selector-1').classList.add('checked');
            document.getElementById('action-selector0').classList.remove('checked');
            document.getElementById('action-selector1').classList.remove('checked');
            document.getElementById('action-selector2').classList.remove('checked');



        } else if (value == "0") {
            document.getElementById("encoder-master-volume").className = "";
            document.getElementById("encoder-software-volume").className = "disable";
            document.getElementById("encoder-custom").className = "disable";
            document.getElementById('help-text').innerHTML = "L'encoder va controler le volume principal du systeme. Lors d'un appuis, le son se mute.";

            document.getElementById('action-selector-1').classList.remove('checked');
            document.getElementById('action-selector0').classList.add('checked');
            document.getElementById('action-selector1').classList.remove('checked');
            document.getElementById('action-selector2').classList.remove('checked');

        } else if (value == "1") {
            console.log(value);
            document.getElementById("encoder-master-volume").className = "disable";
            document.getElementById("encoder-software-volume").className = "";
            document.getElementById("encoder-custom").className = "disable";
            document.getElementById('help-text').innerHTML = "L'encoder va controler le volume du logiciel choisi ci-dessous. Lors d'un appuis, le son se mute.";
            displayAllSoundSoftwaresInSelector();


            document.getElementById('action-selector-1').classList.remove('checked');
            document.getElementById('action-selector0').classList.remove('checked');
            document.getElementById('action-selector1').classList.add('checked');
            document.getElementById('action-selector2').classList.remove('checked');

        } else if (value == "2") {
            document.getElementById("encoder-master-volume").className = "disable";
            document.getElementById("encoder-software-volume").className = "disable";
            document.getElementById("encoder-custom").className = "";
            document.getElementById('help-text').innerHTML = "Choisisez manuellement les actions de l'encoder";

            document.getElementById('action-selector-1').classList.remove('checked');
            document.getElementById('action-selector0').classList.remove('checked');
            document.getElementById('action-selector1').classList.remove('checked');
            document.getElementById('action-selector2').classList.add('checked');

        } else {
            document.getElementById("encoder-master-volume").className = "disable";
            document.getElementById("encoder-software-volume").className = "disable";
            document.getElementById("encoder-custom").className = "disable";

        }
        if (id != -1) { //update the encoder id on the gui
            document.getElementById("current-edition").innerHTML = "Encoder " + (id + 1);
        }

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


function getStrKey(oEvent) { //Convert Key text to Text to display it
    var txt = "";

    var toStrkey = {
        "Control": "CTRL",
        "AltGraph": "ALT GR",
        "Alt": "ALT",
        "Shift": "SHIFT",
    }
    var keyLocationToStr = {
        "1": "LEFT",
        "2": "RIGHT",
    }



    if (oEvent.location == 2 && oEvent.which == 18) //if AltGR
    {
        txt = toStrkey[oEvent.key];
    }
    //
    else if (oEvent.key === ' ') // if space
    {

        txt = "Space";
    }
    //
    else if (oEvent.which == 91) // if windows
    {
        txt = "Windows";
    }
    //
    else if (oEvent.location != 0) { //If key is as 2 location (left or right) (ctrl; shift..) AND isnt ALT key because Alt and ALT GR are not the same key
        txt = toStrkey[oEvent.key] + " " + keyLocationToStr[oEvent.location];
    }
    //
    else if (oEvent.key.length == 1) {
        txt = oEvent.key.toUpperCase();
    } else {
        txt = oEvent.key;
    }


    return txt;
}

var captureType = [-1, -1];
var captureKey = [-1, -1, -1];
var captureCount = 0;
var maxCaptureCount = 0;

function startKeyCombinationCapture(type, action, maxCount) {
    document.addEventListener("keydown", keyCombinationCapture);
    captureType = [type, action];
    maxCaptureCount = maxCount;
    captureCount = 0;
}

function stopKeyCombinationCapture() {
    document.removeEventListener('keydown', keyCombinationCapture);
}

function keyCombinationCapture(oEvent) {
    if (captureCount < maxCaptureCount) {
        if (captureType[0] == "encoder") {
            console.log("keyCombinationCapture");
            var charCode = (typeof oEvent.which == "number") ? oEvent.which : oEvent.keyCode
            var label = "encoder-edit-key-" + captureType[1];
            document.getElementById(label).innerHTML = getStrKey(oEvent);
            captureKey[captureCount] = charCode;
            var strKey = "";
            for (var i = 0; i < maxCaptureCount; i++) {
                strKey += captureKey[i] + ",";
            }
            document.getElementById(label + "-values").innerHTML = strKey;
        }
    } else {
        stopKeyCombinationCapture();
    }


    captureCount++;
}