const { contextBridge } = require("electron");
const { cp } = require("original-fs");

var profileEditorEnabled = false;
var defaultProfileIcon = "mdi-account-circle";

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    var array = [];
    for (var i = 1; i < 4; i++) {
        array.push(parseInt(result[i], 16));
    }
    return array;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


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
updateProfileOverviewIcon();

function updateProfileOverviewIcon() {
    for (var i = 0; i < 6; i++) {
        var icon = readFromConfig("profiles." + i + ".icon");
        if (icon == null) { //if profile icon is not set
            icon = "mdi-numeric-" + (parseInt(i) + 1) + "-box"; //set default icon
        }
        document.getElementById("profil-list").getElementsByTagName("button")[i].className = "mdi " + icon;
    }
}

function editProfilePopup() { //when edit profile button is clicked
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
        updateProfileOverviewIcon();



    } else {
        //enable the profile editor
        updateProfileGui();
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



function updateProfileColor() {
    var color = document.getElementById("color-picker").value;
    var rgb = hexToRgb(color);
    //save to config
    var currentProfile = document.getElementById("profile-editor-selector").value;
    saveToConfig("profiles." + currentProfile + ".color", rgb);

}

//------------------------- Profile Name ---------------------------------

function saveProfileName() {
    var currentProfile = document.getElementById("profile-editor-selector").value;
    var profileName = document.getElementById("profile-name").value;
    if (profileName.length == 0) {
        profileName = "Profil " + (parseInt(currentProfile) + 1);
    }
    saveToConfig("profiles." + currentProfile + ".name", profileName);
    updateProfileGui();
}



function changeProfile() {
    currentEncoderEdit = -1;
    currentKeyEdit = -1;
    clearEditButton();
    updateProfileGui();
}

function updateProfileGui() {
    var input = document.getElementById("profile-name"); //profile name input
    var currentProfile = document.getElementById("profile-editor-selector").value; //current profile
    var profileName = readFromConfig("profiles." + currentProfile + ".name"); //profile name from config

    // --------------------- Profile Name ------------------------------
    if (profileName == null) { //if profile name is not set
        profileName = "Profil " + (parseInt(currentProfile) + 1); //set default name
    }
    input.value = profileName //display profile name

    // --------------------- Profile List ------------------------------
    for (var i = 0; i < 6; i++) { //for all profiles
        var profileName = readFromConfig("profiles." + i + ".name"); //get profile name from config
        if (profileName == null) { //if profile name is not set
            profileName = "Profil " + (parseInt(i) + 1); //set default name
        }
        document.getElementById('profile-editor-selector').getElementsByTagName('option')[i].innerHTML = profileName; //display profile name in list
    }

    // --------------------- Profile Color ------------------------------
    var color = readFromConfig("profiles." + currentProfile + ".color"); //get profile color from config
    var colorHEX;
    if (color == null) { //if profile color is not set
        colorHEX = "#000000"; //set default color (black)
    } else {
        colorHEX = rgbToHex(color[0], color[1], color[2]); //convert to hex color
    }
    document.getElementById("color-picker").value = colorHEX; //display color in color picker

    // --------------------- Profile Icon ------------------------------

    var icon = readFromConfig("profiles." + currentProfile + ".icon"); //get profile icon from config
    if (icon == null) { //if profile icon is not set
        icon = "mdi-numeric-" + (parseInt(currentProfile) + 1) + "-box"; //set default icon
    }

    document.getElementById("profile-icon-preview").className = "mdi"; //remove all icons from preview
    document.getElementById("profile-icon-preview").classList.add(icon); //display icon in profile icon
    // remove mdi- from icon name
    icon = icon.replace("mdi-", "");
    document.getElementById("profile-icon-name").value = icon; //display icon name in profile icon name input

}


//-------------------------  ---------------------------------

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
        saveToConfig("profiles." + currentProfile + ".encoders." + currentEncoderEdit + ".type", parseInt(currentActionType));

        //------------save value ------------
        if (currentActionType == 2) { //key combination
            var valuesToSave = [];
            for (var i = 0; i < 3; i++) {
                var strValues = document.getElementById("encoder-edit-key-" + i + "-values").innerHTML; //get the values of the key combination
                var values = strValues.split(","); //tranform in array
                valuesToSave.push(parseInt(values[0]));
            }
            console.log(valuesToSave);
            saveToConfig("profiles." + currentProfile + ".encoders." + currentEncoderEdit + ".values", valuesToSave); //save the values
        }



    }

    //---------------------------------------------End of save old values in the config -------------------------------------------------

    //---------------------------------------------Load values from the config -------------------------------------------------
    currentEncoderEdit = newEncoderId; //store the new encoder id

    var newActionType = readFromConfig("profiles." + currentProfile + ".encoders." + newEncoderId + ".type");
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
        for (var i = 0; i < 3; i++) {
            newValues[i] = readFromConfig("profiles." + currentProfile + ".encoders." + newEncoderId + ".values." + i);
            if (newValues[i] == null) newValues[i] = -1;
            console.log(newValues);
            document.getElementById("encoder-edit-key-" + i).innerHTML = keycodesToStr[newValues[i]];
            document.getElementById("encoder-edit-key-" + i + "-values").innerHTML = newValues[i];
        }

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
        saveToConfig("profiles." + currentProfile + ".keys." + currentKeyEdit + ".type", parseInt(value));
    }
    currentKeyEdit = newKeyId; //store the new encoder id

    //Read value from config
    var value = readFromConfig("profiles." + currentProfile + ".keys." + newKeyId + ".type");
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

            document.getElementById('help-text').innerHTML = "L'encoder est désactivé, il ne fera rien.";



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
    } else if (type == "empty") {

        document.getElementById("edit-encoder").className = "disable"; //disable the edit encoder menu
        document.getElementById("edit-key").className = "disable"; //disable the edit key menu
        clearEditButton();
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
            document.getElementById(label).innerHTML = keycodesToStr[charCode];
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

function updateProfileIconPreview(saveInConfig) {
    var icon = document.getElementById("profile-icon-name"); //text input field for the icon name
    var span = document.getElementById("profile-icon-preview"); //span to display the icon
    span.className = "mdi"; //reset the class
    span.classList.add("mdi-" + icon.value); //add the icon class

    //save to the config file
    //get the current profile
    if (saveInConfig) {
        var currentProfile = document.getElementById("profile-editor-selector").value;
        saveToConfig("profiles." + currentProfile + ".icon", "mdi-" + icon.value);
    }
}

function displayTypeSelected() {
    var currentProfile = document.getElementById("profile-editor-selector").value;
    var radios = document.getElementsByName('display-text-selector');
    var type = -1;
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            type = radios[i].value;
            break;
        }
    }
    var value = "";
    if (type == 3) {
        value = document.getElementById("display-text-custom").value;
    }

    saveToConfig("profiles." + currentProfile + ".display.type", type);
    saveToConfig("profiles." + currentProfile + ".display.value", value);

}