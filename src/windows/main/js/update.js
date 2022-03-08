// IPC.on('update-available', function(event, updateAvailable, updateInfo) {
//     console.log("update-available");
//     console.log(updateAvailable);
//     console.log(updateInfo);
// });



class update {


    static check() {
        IPC.sendSync("check-update")
        return true;
    }

    static available() {
        return IPC.sendSync("update-available");
    }

    static info() {
        return IPC.sendSync("update-info");
    }

    static currentVersion() {
        return IPC.sendSync("software-version");
    }


    static releaseVersion() {
        if (update.check() && update.available()) {
            return update.info().version;
        } else {
            return update.currentVersion();
        }
    }




    static displayOnSettings() {
        document.getElementById("current-software-version").innerHTML = update.currentVersion();
        document.getElementById("release-software-version").innerHTML = update.releaseVersion();
        if (update.available()) {
            document.getElementById("update-available-settings").style.display = "block";
        } else {
            document.getElementById("update-available-settings").style.display = "none";
        }
    }


}