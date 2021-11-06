var profileEditorEnabled = false;

function editProfilePopup() {

    if (profileEditorEnabled) {
        profileEditorEnabled = false;
        document.getElementById("normal-view").className = "";
        document.getElementById("profil-list").className = "";
        document.getElementsByClassName("profile-editor")[0].className = "popup profile-editor disable";
        document.getElementsByClassName("profile-editor")[1].className = "popup profile-editor disable";

        document.getElementById("edit").className = "";
        document.getElementById("macropad").className = "connectPopup";
    } else {
        profileEditorEnabled = true;
        document.getElementById("normal-view").className = "disable";
        document.getElementById("profil-list").className = "disable";
        document.getElementsByClassName("profile-editor")[0].className = "popup profile-editor";
        document.getElementsByClassName("profile-editor")[1].className = "popup profile-editor";
        document.getElementById("edit").className = "active-button";
        document.getElementById("macropad").className = "editor";
    }



}


function editEncoderBtn(encoderId) {
    //clear edit mode for all encoder buttons
    for (var i = 0; i <= 2; i++) {
        var button = document.getElementById("encoder" + i).className;
        if (!(button.indexOf("disable") > -1)) {
            document.getElementById("encoder" + i).className += " disable";
            console.log("encoder" + i);
        }
    }
    //show new encoder in edition mode
    var encoderBtn = document.getElementById("encoder" + encoderId).className;
    encoderBtn = encoderBtn.replace("disable", "");
    document.getElementById("encoder" + encoderId).className = encoderBtn;


    //if previous encoder was selected, save old values

    //load new values

    //display the gui
    document.getElementById("edit-encoder").className = "";

}