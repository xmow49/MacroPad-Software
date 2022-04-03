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


function versionCompare(v1, v2, options) {
    var lexicographical = options && options.lexicographical,
        zeroExtend = options && options.zeroExtend,
        v1parts = v1.split('.'),
        v2parts = v2.split('.');

    function isValidPart(x) {
        return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
    }

    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }

    if (zeroExtend) {
        while (v1parts.length < v2parts.length) v1parts.push("0");
        while (v2parts.length < v1parts.length) v2parts.push("0");
    }

    if (!lexicographical) {
        v1parts = v1parts.map(Number);
        v2parts = v2parts.map(Number);
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        } else if (v1parts[i] > v2parts[i]) {
            return 1;
        } else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}


const { Octokit } = require("@octokit/rest");
const octokit = new Octokit();

var currentFirmwareVersion = "";

class firmware {
    static async releaseVersion() {
        var repo = await octokit.request('GET /repos/xmow49/MacroPad-Arduino/releases', {
            owner: 'xmow49',
            repo: 'MacroPad-Arduino'
        });
        console.log(repo.data[0].tag_name);
        return repo.data[0].tag_name;
    }

    static async currentVersion() {
        var promise = new Promise(function(resolve, reject) {
            sendToMacopad.version();
            window.setTimeout(function() {
                resolve(currentFirmwareVersion);
                console.log(currentFirmwareVersion);
            }, 1000);
        });
        return promise;
    }

    static async available() {
        var promise = new Promise(async function(resolve, reject) {
            var releaseVersion = await firmware.releaseVersion();
            var currentVersion = await firmware.currentVersion();
            var updateAvailable = versionCompare(releaseVersion, currentVersion) > 0;
            if (updateAvailable) {
                console.log("update available");
            }
            resolve(updateAvailable);
        });
        return promise;
    }

    static clearError() {
        document.getElementById("firmware-error-text").innerHTML = "";
        document.getElementById("retry-firmware").style.display = "none";
    }

    static GUICheck() {
        firmware.clearError();

        document.getElementById("check-firmware-button").getElementsByTagName("h4")[0].innerHTML = "Verification ...";
        setTimeout(function() {
            firmware.displayOnSettings();
        }, 1000);
    }
    static async displayOnSettings() {
        var releaseVersion = await firmware.releaseVersion();
        var currentVersion = await firmware.currentVersion();
        var updateAvailable = versionCompare(releaseVersion, currentVersion) > 0;
        document.getElementById("current-firmware-version").innerHTML = currentVersion;
        document.getElementById("release-firmware-version").innerHTML = releaseVersion;

        if (document.getElementById("firmware-downloaded").style.display == "flex" ||
            document.getElementById("download-firmware-info").style.display == "flex")
        //update downloaded or downloading
        {


        } else if (updateAvailable) {
            document.getElementById("firmware-available-settings").style.display = "flex";
            document.getElementById("check-firmware-button").style.display = "none";

        } else {
            document.getElementById("firmware-available-settings").style.display = "none";
            document.getElementById("check-firmware-button").style.display = "flex";
            document.getElementById("check-firmware-button").getElementsByTagName("h4")[0].innerHTML = "Aucune mise à jour disponible";

        }
    }

    static async download() {
        var repo = await octokit.request('GET /repos/xmow49/MacroPad-Arduino/releases', {
            owner: 'xmow49',
            repo: 'MacroPad-Arduino'
        });
        repo.data[0].assets.forEach(function(asset) {
            if (asset.name.includes(".elf")) { //if it's an elf file
                var url = asset.browser_download_url;
                var fileName = asset.name;
                var file = new File([], fileName, { type: "application/octet-stream" });
                console.log(url);
                console.log(fileName);
                console.log(file);

            }
        });

        console.log(repo.data[0].assets[0].browser_download_url);
        return repo.data[0].tag_name;
    }
}