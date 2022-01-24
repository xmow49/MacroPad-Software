function settingItemClicked(item) {
    console.log(item.id);
    if (item.classList.contains("switch-item")) { //if item is a switch
        item.querySelectorAll("input")[0].checked = !item.querySelectorAll("input")[0].checked; //toggle switch
        saveToConfig("settings." + item.id, item.querySelectorAll("input")[0].checked);
    } else if (item.id == "export-import-config") {
        toggleSettings();
        document.getElementById("export-import-settings").style.display = "block";
    } else if (item.id == "language") {

    } else if (item.className == "settings-title") { //if item is a title --> back to settings
        closeAllSettingsPopups();
        toggleSettings();
    }
    updatePopupBackground();
}

function saveLanguage(item) {
    saveToConfig("settings.language", item.value);
}

function exportSettings() {
    IPC.send("export-settings");
}

function importSettings() {
    IPC.send("import-settings");
}

function toggleSettings() {
    if (document.getElementById("settings").style.display === "block") {
        document.getElementById("settings").style.display = "none";
    } else {
        document.getElementById("settings").style.display = "block";
    }
    updatePopupBackground();
}

function closeAllSettingsPopups() {
    document.getElementById("export-import-settings").style.display = "none";
    document.getElementById("export-import-settings").style.display = "none";

}