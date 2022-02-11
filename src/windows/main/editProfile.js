const { contextBridge } = require("electron");
const { cp } = require("original-fs");



var encodersTemplate = {
    type: -1,
    values: [-1, -1, -1]
}

var keysTemplate = {
    type: -1,
    values: [-1, -1, -1]
}

var profilesTemplete = {
    name: "",
    icon: "",
    color: [0, 0, 0],
    encoders: [],
    keys: [],
    display: {
        type: 1,
        values: "",
    }

}
var macropadConfig = {
    profiles: [],
}

for (var i = 0; i < 6; i++) {
    macropadConfig.profiles.push(profilesTemplete); //add 6 profiles to the config
    macropadConfig.profiles[i].keys.push(keysTemplate); //add 6 keys to the config
    if (i % 2 == 0) {
        macropadConfig.profiles[i].encoders.push(encodersTemplate); //add 3 encoders to the config
    }
}


function createConfigFile() {
    console.log("create config file");
    saveToConfig("profiles", macropadConfig.profiles);
}

function initSoftware() {
    getConfig();
    onChangeProfile(0); //set the default value
    updateProfileGui();
    disableMacropadButtons(true);
    updateProfileOverviewIcon();
}

window.addEventListener('load', () => { // when the window loads
    initSoftware();
});





function getConfig() { //get the config from the file to the variable macropadConfig
    const merge = require('deepmerge')
    var fromConfig = readFromConfig("profiles");
    // console.log(merge(macropadConfig.profiles, fromConfig));
    if (fromConfig != null)
        macropadConfig.profiles = fromConfig;
    else {
        createConfigFile();
        window.location.reload();
    }


}


function storeConfig() {
    saveToConfig("profiles", macropadConfig.profiles);
}




function getIconFromKey(value) { // This function transform system action values from arduino to radio id
    var toIcon = {
        205: "mdi-play-pause",
        233: "mdi-volume-plus",
        234: "mdi-volume-minus",
        226: "mdi-volume-off",
        181: "mdi-skip-forward",
        182: "mdi-skip-backward",
        183: "mdi-stop",
        179: "mdi-fast-forward",
        180: "mdi-rewind",
        394: "mdi-email",
        402: "mdi-calculator",
        404: "mdi-folder",
        547: "mdi-web",
        551: "mdi-refresh",
        248: "mdi-arrow-left",
        549: "mdi-arrow-right",
        554: "mdi-bookmark",
    }
    if (value == -1) {
        return "";
    } else {
        return toIcon[value];
    }
}


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






function updateProfileOverviewIcon() {
    for (var i = 0; i < 6; i++) {
        var icon = macropadConfig.profiles[i].icon;

        if (icon == "") { //if profile icon is not set
            icon = "mdi-numeric-" + (parseInt(i) + 1) + "-box"; //set default icon
            console.log("mdi-numeric-" + (parseInt(i) + 1) + "-box");
            macropadConfig.profiles[i].icon = icon;
        }

        document.getElementById("profile-" + i).querySelector("span").className = "mdi " + icon;
    }
}

function editProfilePopup() { //when edit profile button is clicked

    if (profileEditorEnabled) {
        //disable the profile editor
        profileEditorEnabled = false;

        document.getElementsByClassName("profile-editor")[0].className = "profile-editor disable"; //disable left editor menu
        document.getElementsByClassName("profile-editor")[1].className = "profile-editor disable"; //disable right editor menu

        document.getElementById("edit").className = ""; //edit button --> remove active-button class
        document.getElementById("macropad").className = "connectPopup"; //remove macropad button hover action

        disableMacropadButtons(true);
        updateProfileOverviewIcon();

        storeConfig(); //save the config in the file
    } else {
        //enable the profile editor
        updateProfileGui();
        profileEditorEnabled = true;
        //document.getElementById("normal-view").className = "disable";
        //document.getElementById("profil-list").className = "disable";
        document.getElementsByClassName("profile-editor")[0].className = "profile-editor";
        document.getElementsByClassName("profile-editor")[1].className = "profile-editor";
        document.getElementById("edit").className = "active-button";
        document.getElementById("macropad").className = "editor";

        //enable edit mode for all encoders/keys buttons
        disableMacropadButtons(false);
    }
}

const editButtonIcon = "mdi-pencil";

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
var currentType = "none";


function getActionValue(type) { //get the value of the radio
    if (type == "encoder" || type == "key") {
        var actionType = document.getElementsByName(type + "-action-type"); // get all input elements
    } else {
        return -1;
    }

    for (var i = 0; i < actionType.length; i++) {
        if (actionType[i].checked) {
            return actionType[i].value;
        }
    }
    return -1;
}



//------------------------- Profile Name ---------------------------------

function saveProfileName() {
    var profileName = document.getElementById("profile-name").value;
    if (profileName.length == 0) {
        profileName = "Profil " + (parseInt(currentProfile) + 1);
    }
    macropadConfig.profiles[currentProfile].name = profileName;
    updateProfileGui();
}


function changeProfile() {
    currentEdit = -1;
    currentType = "none";
    currentKeyEdit = -1;
    clearEditButton();
    updateProfileGui();
}

function updateProfileGui() {
    var input = document.getElementById("profile-name"); //profile name input
    var profileName = macropadConfig.profiles[currentProfile].name;

    // --------------------- Profile Name ------------------------------
    if (profileName == "") { //if profile name is not set
        profileName = "Profil " + (parseInt(currentProfile) + 1); //set default name
        macropadConfig.profiles[currentProfile].name = profileName; //set default name in config
    }
    input.value = profileName //display profile name

    // --------------------- Profile Color ------------------------------
    var color = macropadConfig.profiles[currentProfile].color; //get profile color from config
    var colorHEX;
    if (color == null) { //if profile color is not set
        colorHEX = "#000000"; //set default color (black)
    } else {
        colorHEX = rgbToHex(color[0], color[1], color[2]); //convert to hex color
    }

    pickr.setColor(colorHEX); //set color in color picker
    // --------------------- Profile Icon ------------------------------

    var icon = macropadConfig.profiles[currentProfile].icon //get profile icon from config
    if (icon == "") { //if profile icon is not set
        icon = "mdi-numeric-" + (parseInt(currentProfile) + 1) + "-box"; //set default icon
        macropadConfig.profiles[currentProfile].icon = icon; //set default icon in config
    }

    document.getElementById("profile-icon-preview").className = "mdi"; //remove all icons from preview
    document.getElementById("profile-icon-preview").classList.add(icon); //display icon in profile icon
    document.getElementById("profile-icon-name").value = icon; //display icon name in profile icon name input

    // --------------------- Profile display type ------------------------------
    var displayType = macropadConfig.profiles[currentProfile].display.type; //get profile display type from config
    if (isNaN(displayType)) { //if profile display type is not set
        displayType = 1; //set default display type
        macropadConfig.profiles[currentProfile].display.type = displayType; //set default display type in config
    }
    var displayValue = macropadConfig.profiles[currentProfile].display.value; //get profile display value from config
    if (displayValue == "") {
        displayValue = "MacroPad"; //set default display value
        macropadConfig.profiles[currentProfile].display.value = displayValue;
    }

    //for all type in the radio, check corresponding to display type
    var displayTypeRadio = document.getElementsByName("display-text-selector");
    for (var i = 0; i < displayTypeRadio.length; i++) {
        if (displayTypeRadio[i].value == displayType) {
            displayTypeRadio[i].checked = true;
        } else {
            displayTypeRadio[i].checked = false;
        }
    }
    document.getElementById("display-text-custom").value = displayValue; //display display text in profile display type input


    for (var i = 0; i < macropadConfig.profiles[currentProfile].keys.length; i++) {
        document.getElementById("keyIcon" + i).className = "mdi " + getIconFromKey(macropadConfig.profiles[currentProfile].keys[i].values[0]);
    }


}


//-------------------------  ---------------------------------

function onEditButton(type, newId) { //when a edit encoder or key button is clicked
    //type: encoder or key
    var configKey = type + "s";
    currentKeyEdit = -1; //disable edit on key
    var actionType = document.getElementsByName(type + "-action-type"); // get all input elements

    //---------------------------------------------Save old values in the config -------------------------------------------------


    if (currentEdit == -1) { //if no previous encoder is in edition mode set the new encoder in edition mode

    } else {
        if (document.getElementById(currentType + "Icon" + currentEdit).classList.contains(editButtonIcon))
            document.getElementById(currentType + "Icon" + currentEdit).classList.remove(editButtonIcon); //remove edit button icon from the key
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

        //------------save value ------------
        if (currentType == "encoder") {
            macropadConfig.profiles[currentProfile].encoders[currentEdit].type = parseInt(currentActionType);

            if (currentActionType == 2) { //key combination
                var valuesToSave = [];
                for (var i = 0; i < 3; i++) {
                    var strValues = document.getElementById(type + "-edit-key-" + i + "-values").innerHTML; //get the values of the key combination
                    var values = strValues.split(","); //tranform in array
                    valuesToSave.push(parseInt(values[0]));
                }
                // console.log(valuesToSave);

                macropadConfig.profiles[currentProfile].encoders[currentEdit].values = valuesToSave;

            } else if (currentActionType == 1) { //software vomlume
                var valuesToSave = [];
                valuesToSave[0] = document.getElementById("software-volume-selector").value;

                macropadConfig.profiles[currentProfile].encoders[currentEdit].values = valuesToSave;

            } else {
                macropadConfig.profiles[currentProfile].encoders[currentEdit].values = [-1, -1, -1];
            }






        } else if (currentType == "key") {
            macropadConfig.profiles[currentProfile].keys[currentEdit].type = parseInt(currentActionType);
            if (currentActionType == 0) { //key combination
                var strValues = document.getElementById(type + "-edit-combination-values").innerHTML; //get the values of the key combination
                // console.log(strValues);
                var valuesToSave = strValues.split(","); //tranform in array
                //keep only 3 values
                if (valuesToSave.length > 3) {
                    valuesToSave.splice(3, valuesToSave.length - 3);
                }
                // transduce the values in int
                for (var i = 0; i < valuesToSave.length; i++) {
                    valuesToSave[i] = parseInt(valuesToSave[i]);
                }

                macropadConfig.profiles[currentProfile].keys[currentEdit].values = valuesToSave;

            } else if (currentActionType == 1) { //type: 1 system action
                var valuesToSave = [parseInt(lastSelectedSystemActionValue), -1, -1];

                var radio = document.getElementsByName("select-system-action");
                var radioValue;
                for (var i = 0; i < radio.length; i++) {

                    if (radio[i].checked) {
                        radioValue = radio[i].value;
                    }
                }
                document.getElementById("keyIcon" + currentEdit).className = "mdi " + getIconFromKey(radioValue);


                macropadConfig.profiles[currentProfile].keys[currentEdit].values = valuesToSave;

            } else {
                macropadConfig.profiles[currentProfile].keys[currentEdit].values = [-1, -1, -1];
            }
        }
    }
    //---------------------------------------------End of save old values in the config -------------------------------------------------


    //---------------------------------------------Load values from the config -------------------------------------------------
    currentEdit = newId; //store the new encoder id
    currentType = type; //store the new encoder type

    if (type == "encoder") var newActionType = macropadConfig.profiles[currentProfile].encoders[newId].type;
    if (type == "key") var newActionType = macropadConfig.profiles[currentProfile].keys[newId].type;


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
                newValues[i] = macropadConfig.profiles[currentProfile].encoders[newId].values[i];
                if (newValues[i] == null) newValues[i] = -1;
                console.log(newValues);
                document.getElementById(type + "-edit-key-" + i).innerHTML = keycodesToStr[newValues[i]];
                document.getElementById(type + "-edit-key-" + i + "-values").innerHTML = newValues[i];
            }
        }
        if (newActionType == 1) { //if software volume
            var newValue = macropadConfig.profiles[currentProfile].encoders[newId].values;
            displayAllSoundSoftwaresInSelector(); //display all sound softwares in selector
            if (newValue == null || newValue[0] == null || newValue[0] == "") {} else {
                document.getElementById("software-volume-selector").value = newValue[0]; //select the value from the config
            }

        }
    } else if (type == "key") {
        if (newActionType == 0) { //if key combination
            var newValues = macropadConfig.profiles[currentProfile].keys[newId].values;
            if (newValues == null) newValues = -1;
            document.getElementById(type + "-edit-combination-values").innerHTML = newValues;
        } else if (newActionType == 1) { //if system action
            var newValue = macropadConfig.profiles[currentProfile].keys[newId].values;
            if (newValue == null || newValue[0] == null || newValue[0] == "") {} else {
                lastSelectedSystemActionValue = newValue[0];
                document.getElementsByName("select-system-action")[systemActionValuesToRadioId(newValue[0])].checked = true; //select the value from the config
            }
        }
    }

    //clearEditButton();
    document.getElementById(type + "Icon" + newId).className = "mdi " + editButtonIcon; //dispplay the edit icon (pen) on the new encoder
    console.log(type + "Icon" + newId);
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

        macropadConfig.profiles[currentProfile].encoders[currentEdit].type = parseInt(value); //update the config

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
                var temp = keycodesToStr[keys[i]];
                if (temp != null) {
                    GUIKey += " + " + temp;
                }
            }
            document.getElementById("key-edit-combination").innerHTML = GUIKey;

        } else if (type == "empty") {

            document.getElementById("edit-encoder").className = "disable"; //disable the edit encoder menu
            document.getElementById("edit-key").className = "disable"; //disable the edit key menu
            clearEditButton();
        }
        macropadConfig.profiles[currentProfile].keys[currentEdit].type = parseInt(value); //update the config
    }


}

function displayAllSoundSoftwaresInSelector() {
    var strSoftwareList = IPC.sendSync("get-softwares-names");
    //remove all \n and \r from the string
    strSoftwareList = strSoftwareList.replace(/\r/g, "");
    var softwareAndIDList = strSoftwareList.split("\n");

    var softwareList = [];
    var idList = [];
    var classedSoftware = [];
    for (var i = 0; i < softwareAndIDList.length - 1; i++) {
        //split the string: "id:name"
        var temp = softwareAndIDList[i].split(":");
        softwareList.push(temp[1]);
        idList.push(temp[0]);
        classedSoftware[temp[0]] = temp[1];
    }
    var softwareSelector = document.getElementById("software-volume-selector");
    //clear the software selector
    softwareSelector.innerHTML = "";
    //add options to the software selector
    for (var i = 0; i < softwareList.length; i++) {
        var option = document.createElement("option");
        option.text = softwareList[i];
        softwareSelector.add(option);
    }
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
    span.classList.add(icon.value); //add the icon class

    //save to the config file
    //get the current profile
    if (saveInConfig) {
        macropadConfig.profiles[currentProfile].icon = icon.value;
    }
    updateProfileOverviewIcon(); //update the icon in the profile overview
}

function displayTypeSelected() {
    var radios = document.getElementsByName('display-text-selector');
    var type = -1;
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            type = radios[i].value;
            break;
        }
    }
    var value = document.getElementById("display-text-custom").value;

    macropadConfig.profiles[currentProfile].display.type = parseInt(type);
    macropadConfig.profiles[currentProfile].display.value = value;
}

var lastSelectedSystemActionValue = -1;

function onChangeSystemAction(radio) {
    var selected = radio.value; //get the selected value
    lastSelectedSystemActionValue = selected;
}

function systemActionValuesToRadioId(value) { // This function transform system action values from arduino to radio id
    var toRadioId = {
        205: 0,
        233: 1,
        234: 2,
        226: 3,
        181: 4,
        182: 5,
        183: 6,
        179: 7,
        180: 8,
        394: 9,
        402: 10,
        404: 11,
        547: 12,
        551: 13,
        248: 14,
        549: 15,
        554: 16,

    }
    if (value == -1) {
        return 0;
    } else {
        return toRadioId[value];
    }


}



var currentProfile = 0;

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
    currentProfile = value; //update the current profile    

    //----------------update profile name in the screen----------------
    var profileName = macropadConfig.profiles[value].name; //get the name of the profile

    if (profileName == "") {
        profileName = "Profil " + (parseInt(value) + 1);
        macropadConfig.profiles[currentProfile].name = profileName;

    }
    document.getElementById("macropad-text").innerHTML = profileName; //update the name of the profile
    //-------------------------------------------------------   

    if (profileEditorEnabled) {
        currentEdit = -1;
        currentType = "none";
        currentKeyEdit = -1;
        clearEditButton();
        updateProfileGui();
    }

    setCurrentProfile(currentProfile); //send to macropad the new selected profile
}


const pickr = Pickr.create({
    el: '.color-picker',
    theme: 'nano', // or 'monolith', or 'nano'
    container: '.profile-color-picker',

    appClass: 'color-picker-cutom',
    // useAsButton: true,
    //showAlways: true,
    swatches: [
        'rgb(244, 67, 54)',
        'rgb(233, 30, 99)',
        'rgb(156, 39, 176)',
        'rgb(103, 58, 183)',
        'rgb(63, 81, 181)',
        'rgb(33, 150, 243)',
        'rgb(3, 169, 244)',
        'rgb(0, 188, 212)',
        'rgb(0, 150, 136)',
        'rgb(76, 175, 80)',
        'rgb(139, 195, 74)',
        'rgb(205, 220, 57)',
        'rgb(255, 235, 59)',
        'rgb(255, 193, 7)'
    ],

    components: {

        // Main components
        preview: true,
        // opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
            // hex: true,
            // rgba: true,
            // hsla: true,
            // hsva: true,
            // cmyk: true,
            input: true,
            // clear: true,
            // save: true
        }
    }

});

pickr.on('change', (source, instance) => {
    pickr.setColor(source.toHEXA().toString());
});

pickr.on('init', (source, instance) => {
    updateProfileGui();
});

pickr.on('changestop', (source, instance) => {
    var rgb = hexToRgb(instance._color.toHEXA());
    pickr.setColor(instance._color.toHEXA().toString());
    macropadConfig.profiles[currentProfile].color = rgb;
});

pickr.on('swatchselect', (source, instance) => {
    var rgb = hexToRgb(instance._color.toHEXA());
    pickr.setColor(instance._color.toHEXA().toString());
    macropadConfig.profiles[currentProfile].color = rgb;
});