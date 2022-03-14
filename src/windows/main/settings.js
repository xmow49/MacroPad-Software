function settingItemClicked(item) {
    console.log(item.id);
    if (item.classList.contains("switch-item")) { //if item is a switch
        item.querySelectorAll("input")[0].checked = !item.querySelectorAll("input")[0].checked; //toggle switch
        saveToConfig("settings." + item.id, item.querySelectorAll("input")[0].checked);

        if (item.id == "dark-mode") {
            if (item.querySelectorAll("input")[0].checked) {
                document.body.classList.add("dark-mode");
                document.body.classList.remove("light-mode");
            } else {
                document.body.classList.remove("dark-mode");
                document.body.classList.add("light-mode");
            }
        }

    } else if (item.id == "export-import-config") {
        toggleSettings();
        document.getElementById("export-import-settings").style.display = "block";
    } else if (item.id == "do-update") {
        toggleSettings();
        document.getElementById("do-update-settings").style.display = "block";
        setTimeout(function() {
            update.displayOnSettings();
        }, 1000);

    } else if (item.id == "language") {

    } else if (item.className == "settings-title") { //if item is a title --> back to settings
        closeAllSettingsPopups();
        toggleSettings();
    } else if (item.id == "hard-reset") {
        toggleSettings();
        document.getElementById("hard-reset-settings").style.display = "block";
    } else if (item.id == "about") {
        toggleSettings();
        document.getElementById("about-settings").style.display = "block";
    } else if (item.id = "background-start") {
        IPC.send("toggle-background-start");
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

        var language = readFromConfig("settings.language");
        if (language == null) language = "fr"; //default language
        document.getElementById("select-language").value = language

        var darkMode = readFromConfig("settings.dark-mode");
        if (darkMode == null) darkMode = false; //default dark mode
        document.getElementById("dark-mode").querySelectorAll("input")[0].checked = darkMode;

        var backgroundStart = readFromConfig("settings.background-start");
        if (backgroundStart == null) backgroundStart = false; //default background start
        document.getElementById("background-start").querySelectorAll("input")[0].checked = backgroundStart;

        var autoUpdate = readFromConfig("settings.auto-update");
        if (autoUpdate == null) autoUpdate = false; //default auto update
        document.getElementById("auto-update").checked = autoUpdate;
    }
    updatePopupBackground();
}

function closeAllSettingsPopups() {
    document.getElementById("export-import-settings").style.display = "none";
    document.getElementById("do-update-settings").style.display = "none";
    document.getElementById("hard-reset-settings").style.display = "none";
    document.getElementById("about-settings").style.display = "none";
    updatePopupBackground();
}

function autoUpdate(checkbox) {
    saveToConfig("settings.auto-update", checkbox.checked);
}