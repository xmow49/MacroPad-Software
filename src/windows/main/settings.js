function settingItemClicked(item) {
    console.log(item.id);
    if (item.classList.contains("switch-item")) { //if item is a switch
        item.querySelectorAll("input")[0].checked = !item.querySelectorAll("input")[0].checked; //toggle switch
    }

    if (item.id == "export-import-config") {
        toggleSettings();
        document.getElementById("dark-mode-settings").style.display = "block";
    }
}