// IPC.on('update-available', function(event, updateAvailable, updateInfo) {
//     console.log("update-available");
//     console.log(updateAvailable);
//     console.log(updateInfo);
// });

IPC.on('download-progress', function(event, download) {
    downloadUpdateInfo.downloadedInProgress = true;
    downloadUpdateInfo.downloaded = false;

    console.log("download-progress");
    console.log(download);
    // downloadUpdateInfo = download;
    // console.log(download.bytesPerSecond / 1024 / 1024 + " MB/s");
    // console.log(download.percent + "%");
    // console.log(download.delta / 1024 / 2024 + "/" + download.total / 1024 / 1024 + " MB");


    document.getElementById("download-progress-info").style.display = "flex";
    document.getElementById("update-available-settings").style.display = "none";
    document.getElementById("update-downloaded").style.display = "none";
    document.getElementById("download-speed").innerHTML = (download.bytesPerSecond / 1024 / 1024).toFixed(2) + " MB/s";
    document.getElementById("download-size").innerHTML = (download.transferred / 1024 / 1024).toFixed(2) + "/" + (download.total / 1024 / 1024).toFixed(2) + " MB";
    document.getElementById("download-progress").value = download.percent;
    document.getElementById("download-percent-text").innerHTML = download.percent.toFixed(1) + "%";
});

IPC.on('update-downloaded', function(event, info) {
    downloadUpdateInfo.downloadedInProgress = false;
    downloadUpdateInfo.downloaded = true;
    console.log("update-downloaded");
    console.log(info);

    document.getElementById("download-progress-info").style.display = "none";
    document.getElementById("update-downloaded").style.display = "flex";
    document.getElementById("update-available-settings").style.display = "none";
});


IPC.on('update-error', function(event, error) {
    console.log("update-error");
    console.log(error);
    document.getElementById("update-error-text").innerHTML = error;
    document.getElementById("retry-update").style.display = "flex";
});


var downloadUpdateInfo = {
    downloadedInProgress: false,
    downloaded: false,
    bytesPerSecond: 0,
};

class update {


    static check() {
        update.clearError();
        var result = IPC.sendSync("check-update");
        console.log(result);
        return result;
    }

    static GUICheck() {
        update.clearError();

        document.getElementById("check-update-button").getElementsByTagName("h4")[0].innerHTML = "Verification ...";
        setTimeout(function() {
            update.displayOnSettings();
        }, 1000);
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

    static download() {
        IPC.send("start-download");
        document.getElementById("download-progress-info").style.display = "flex";
        document.getElementById("update-available-settings").style.display = "none";
        document.getElementById("update-downloaded").style.display = "none";
    }

    static doUpdate() {
        IPC.send('close-all-app');
    }




    static displayOnSettings() {
        document.getElementById("current-software-version").innerHTML = update.currentVersion();
        document.getElementById("release-software-version").innerHTML = update.releaseVersion();

        if (document.getElementById("update-downloaded").style.display == "flex" ||
            document.getElementById("download-progress-info").style.display == "flex")
        //update downloaded or downloading
        {


        } else if (update.available()) {
            document.getElementById("update-available-settings").style.display = "flex";
            document.getElementById("check-update-button").style.display = "none";

        } else {
            document.getElementById("update-available-settings").style.display = "none";
            document.getElementById("check-update-button").style.display = "flex";
            document.getElementById("check-update-button").getElementsByTagName("h4")[0].innerHTML = "Aucune mise à jour disponible";

        }
    }

    static clearError() {
        document.getElementById("update-error-text").innerHTML = "";
        document.getElementById("retry-update").style.display = "none";
    }

    static retry() {
        update.check();
        update.download();
    }

}