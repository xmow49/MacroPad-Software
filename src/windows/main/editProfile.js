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

function editProfilePopup() { //when edit profile button is clicked
    updateEncoderGUI();
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

function editEncoderBtn(newEncoderId) { //when a edit encoder button is clicked
    if (currentEncoderEdit == -1) {
        currentEncoderEdit = newEncoderId;
    }

    //clear edit mode for all encoder buttons
    clearEditButton();
    //show new encoder in edition mode
    document.getElementById("encoderIcon" + newEncoderId).className = editButtonIcon;
    //save old values in the config
    var currentProfile = document.getElementById("profile-editor-selector").value;
    saveToConfig("profiles." + currentProfile + ".encoders." + currentEncoderEdit + ".action", document.getElementById("select-encoder-action-type").value);

    currentEncoderEdit = newEncoderId; //store the new encoder id

    //load new action values
    document.getElementById("select-encoder-action-type").value = readFromConfig("profiles." + currentProfile + ".encoders." + newEncoderId + ".action");

    //display the gui
    updateEncoderGUI();
    document.getElementById("edit-encoder").className = "";

}

function editKeyBtn(newKeyId) {
    if (currentKeyEdit == -1) {
        currentKeyEdit = newKeyId;
    }

    //clear edit mode for all encoder buttons
    clearEditButton();
    //show new encoder in edition mode
    document.getElementById("keyIcon" + newKeyId).className = editButtonIcon;
    //save old values in the config
    var currentProfile = document.getElementById("profile-editor-selector").value;
    saveToConfig("profiles." + currentProfile + ".keys." + currentEncoderEdit + ".action", document.getElementById("select-key-action-type").value);

    currentKeyEdit = newKeyId; //store the new encoder id

    //load new action values
    document.getElementById("select-key-action-type").value = readFromConfig("profiles." + currentProfile + ".keys." + newKeyId + ".action");

    //display the gui
    updateEncoderGUI();
    document.getElementById("edit-key").className = "";

}


function updateEncoderGUI() {
    var value = document.getElementById("select-encoder-action-type").value;

    if (value == "0") {
        document.getElementById("encoder-master-volume").className = "";
        document.getElementById("encoder-software-volume").className = "disable";
        document.getElementById("encoder-custom").className = "disable";
    } else if (value == "1") {
        console.log(value);
        document.getElementById("encoder-master-volume").className = "disable";
        document.getElementById("encoder-software-volume").className = "";
        document.getElementById("encoder-custom").className = "disable";
    } else if (value == "2") {
        document.getElementById("encoder-master-volume").className = "disable";
        document.getElementById("encoder-software-volume").className = "disable";
        document.getElementById("encoder-custom").className = "";
    } else {
        document.getElementById("encoder-master-volume").className = "disable";
        document.getElementById("encoder-software-volume").className = "disable";
        document.getElementById("encoder-custom").className = "disable";
    }


}