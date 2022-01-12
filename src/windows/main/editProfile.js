const { contextBridge } = require("electron");
const { cp } = require("original-fs");

var profileEditorEnabled = false;

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
        clearEditButton();
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

var currentEdit = -1;

function getActionValue(type) { //get the value of the radio
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
    currentEdit = -1;
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

function onEditButton(type, newId) { //when a edit encoder or key button is clicked
    //type: encoder or key
    var configKey = type + "s";
    currentKeyEdit = -1; //disable edit on key
    var currentProfile = document.getElementById("profile-editor-selector").value;
    var actionType = document.getElementsByName(type + "-action-type"); // get all input elements

    //---------------------------------------------Save old values in the config -------------------------------------------------


    if (currentEdit == -1) { //if no previous encoder is in edition mode set the new encoder in edition mode

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
        saveToConfig("profiles." + currentProfile + "." + configKey + "." + currentEdit + ".type", parseInt(currentActionType));

        //------------save value ------------
        if (type == "encoder") {
            if (currentActionType == 2) { //key combination
                var valuesToSave = [];
                for (var i = 0; i < 3; i++) {
                    var strValues = document.getElementById(type + "-edit-key-" + i + "-values").innerHTML; //get the values of the key combination
                    var values = strValues.split(","); //tranform in array
                    valuesToSave.push(parseInt(values[0]));
                }
                console.log(valuesToSave);
                saveToConfig("profiles." + currentProfile + "." + configKey + "." + currentEdit + ".values", valuesToSave); //save the values
            } else if (currentActionType == 1) { //software vomlume
                var valuesToSave = [];
                valuesToSave[0] = document.getElementById("software-volume-selector").value;
                saveToConfig("profiles." + currentProfile + "." + configKey + "." + currentEdit + ".values", valuesToSave); //save the value
            } else {
                saveToConfig("profiles." + currentProfile + "." + configKey + "." + currentEdit + ".values", [-1, -1, -1]); //save the value
            }
        } else if (type == "key") {
            if (currentActionType == 0) { //key combination
                var strValues = document.getElementById(type + "-edit-combination-values").innerHTML; //get the values of the key combination
                console.log(strValues);
                var valuesToSave = strValues.split(","); //tranform in array
                //keep only 3 values
                if (valuesToSave.length > 3) {
                    valuesToSave.splice(3, valuesToSave.length - 3);
                }
                // transduce the values in int
                for (var i = 0; i < valuesToSave.length; i++) {
                    valuesToSave[i] = parseInt(valuesToSave[i]);
                }
                saveToConfig("profiles." + currentProfile + "." + configKey + "." + currentEdit + ".values", valuesToSave); //save the values
            } else {
                saveToConfig("profiles." + currentProfile + "." + configKey + "." + currentEdit + ".values", [-1, -1, -1]); //save the value
            }
        }
    }
    //---------------------------------------------End of save old values in the config -------------------------------------------------




    //---------------------------------------------Load values from the config -------------------------------------------------
    currentEdit = newId; //store the new encoder id

    var newActionType = readFromConfig("profiles." + currentProfile + "." + configKey + "." + newId + ".type");
    if (newActionType == null) newActionType = -1;
    //load new action values
    for (var i = 0; i < actionType.length; i++) {
        if (actionType[i].value == newActionType) {
            actionType[i].checked = true;
        } else {
            actionType[i].checked = false;
        }
    }

    if (type == "encoder") {
        if (newActionType == 2) { //if key combination
            var newValues = [];
            for (var i = 0; i < 3; i++) {
                newValues[i] = readFromConfig("profiles." + currentProfile + "." + configKey + "." + newId + ".values." + i);
                if (newValues[i] == null) newValues[i] = -1;
                console.log(newValues);
                document.getElementById(type + "-edit-key-" + i).innerHTML = keycodesToStr[newValues[i]];
                document.getElementById(type + "-edit-key-" + i + "-values").innerHTML = newValues[i];
            }
        }
        if (newActionType == 1) { //if software volume
            var newValue = readFromConfig("profiles." + currentProfile + "." + configKey + "." + newId + ".values");
            displayAllSoundSoftwaresInSelector(); //display all sound softwares in selector
            if (newValue == null || newValue[0] == null || newValue[0] == "") {} else {
                document.getElementById("software-volume-selector").value = newValue[0]; //select the value from the config
            }

        }
    } else if (type == "key") {
        if (newActionType == 0) { //if key combination
            var newValues = readFromConfig("profiles." + currentProfile + "." + configKey + "." + newId + ".values");
            if (newValues == null) newValues = -1;
            document.getElementById(type + "-edit-combination-values").innerHTML = newValues;
        }
    }





    clearEditButton();
    document.getElementById(type + "Icon" + newId).className = editButtonIcon; //dispplay the edit icon (pen) on the new encoder
    //display the gui
    updateEditGUI(type, newId);
    //---------------------------------------------End of load values from the config -------------------------------------------------

}

function updateActionSelectorGUI(Newvalue, type) { //update the action selector gui
    //type: 0 --> encoder
    //type: 1 --> key
    var className;
    if (type == 0) {
        className = "encoder";
    } else {
        className = "key";
    }
    for (var i = -1; i <= 2; i++) { //for all action types
        if (i == Newvalue) { //if the new value is the current value
            document.getElementsByClassName("action-selector" + i)[type].classList.add('checked'); //select the action type
            document.getElementsByClassName(className + i)[0].classList.remove("disable"); //enable the div
        } else {
            document.getElementsByClassName("action-selector" + i)[type].classList.remove('checked'); //unselect the action type
            document.getElementsByClassName(className + i)[0].classList.add("disable"); //disable the div

        }
    }

}

function updateEditGUI(type, id) { //update the gui when an encoder or key changes action, value ....
    if (type == "encoder") {
        document.getElementById("edit-encoder").className = ""; //enable the edit encoder menu
        document.getElementById("edit-key").className = "disable"; //disable the edit key menu

        var value = getActionValue("encoder");
        updateActionSelectorGUI(parseInt(value), 0); //select on the gui
        if (value == "-1") {
            document.getElementById('help-text').innerHTML = "L'encoder est désactivé, il ne fera rien.";

        } else if (value == "0") {
            document.getElementById('help-text').innerHTML = "L'encoder va controler le volume principal du systeme. Lors d'un appuis, le son se mute.";

        } else if (value == "1") {
            document.getElementById('help-text').innerHTML = "L'encoder va controler le volume du logiciel choisi ci-dessous. Lors d'un appuis, le son se mute.";

        } else if (value == "2") {
            document.getElementById('help-text').innerHTML = "Choisisez manuellement les actions de l'encoder";

        } else {


        }
        if (id != -1) { //update the encoder id on the gui
            document.getElementById("current-edition").innerHTML = "Encoder " + (id + 1);
        }

    } else if (type == "key") {
        document.getElementById("edit-key").className = ""; //enable the edit key menu
        document.getElementById("edit-encoder").className = "disable"; //disable the edit encoder menu
        document.getElementById("current-edition").innerHTML = "Key " + (id + 1);

        var value = getActionValue("key"); //get the value of the radio
        updateActionSelectorGUI(parseInt(value), 1); //select on the gui

        if (value == "-1") {




        } else if (value == "0") {
            var keys = document.getElementById("key-edit-combination-values").innerHTML;
            keys = keys.split(",");
            var GUIKey = keycodesToStr[keys[0]];
            for (var i = 1; i < 3; i++) {
                var value = keycodesToStr[keys[i]];
                if (value != null) {
                    GUIKey += " + " + value;
                }
            }
            document.getElementById("key-edit-combination").innerHTML = GUIKey;

        } else if (type == "empty") {

            document.getElementById("edit-encoder").className = "disable"; //disable the edit encoder menu
            document.getElementById("edit-key").className = "disable"; //disable the edit key menu
            clearEditButton();
        }

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


var captureType = [-1, -1]; //0 --> type of key (encoder or key), 1 --> action number
var captureKey = [-1, -1, -1]; //store the captured key
var captureCount = 0; //count the number of key pressed 
var maxCaptureCount = 0; //max number of key pressed

function startKeyCombinationCapture(type, action, maxCount) {
    document.addEventListener("keydown", keyCombinationCapture);
    captureType = [type, action];
    captureKey = [-1, -1, -1];
    maxCaptureCount = maxCount;
    captureCount = 0;
}

function stopKeyCombinationCapture() {
    document.removeEventListener('keydown', keyCombinationCapture);
}

function keyCombinationCapture(oEvent) {
    if (captureCount < maxCaptureCount) { //if the number of key pressed is less than the max number of key pressed
        var charCode = (typeof oEvent.which == "number") ? oEvent.which : oEvent.keyCode; //get the key pressed in char code
        //if the key is not in the array
        if (captureKey.indexOf(charCode) == -1) {
            captureKey[captureCount] = charCode; //add the key to the array
            captureCount++; //increment the number of key pressed
        } else {
            return;
        }
        console.log(captureKey);


        if (captureType[0] == "encoder") {
            var label = "encoder-edit-key-" + captureType[1]; //get the label
            document.getElementById(label).innerHTML = keycodesToStr[charCode]; //display the key


            //create stored value
            var strKey = "";
            for (var i = 0; i < maxCaptureCount; i++) {
                strKey += captureKey[i] + ",";
            }
            document.getElementById(label + "-values").innerHTML = strKey; //store value on html
        }
        if (captureType[0] == "key") {
            var label = "key-edit-combination"; //get the label
            //create stored value
            var strKey = "";
            for (var i = 0; i < maxCaptureCount; i++) {
                strKey += captureKey[i] + ",";
            }

            var GUIKey = keycodesToStr[captureKey[0]];
            for (var i = 1; i < captureCount; i++) {
                GUIKey += " + " + keycodesToStr[captureKey[i]];
                console.log(captureKey[i]);
            }

            document.getElementById(label).innerHTML = GUIKey; //display the key
            document.getElementById(label + "-values").innerHTML = strKey; //store value on html
        }
    } else {
        stopKeyCombinationCapture();
    }



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