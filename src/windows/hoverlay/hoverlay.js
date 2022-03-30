const { ipcRenderer } = require('electron');
const IPC = ipcRenderer;

IPC.on('volume-hoverlay', function(event, softwareName, value) {
    document.getElementById("software-name").innerHTML = softwareName;
    document.getElementById("volume-value").value = parseInt(value);
    console.log(softwareName);
    console.log(value);
});