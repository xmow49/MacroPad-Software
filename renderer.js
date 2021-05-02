const os = require('os');
const settings = require('electron-settings');
const { app } = require('@electron/remote');

const serialport = require('serialport');
const tableify = require('tableify');
const loudness = require('loudness');
const { exec } = require("child_process");
var popupS = require('popups');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const { Console } = require("console");



settings.configure({
    fileName: 'config.json',
    prettify: true
});

/*settings.set('profile1', {
  name: 'Le profile de TOTO',
  color: [0, 179, 230],
  encoder0:{
    action: 0,
    value: "spotify"
  },
  encoder1:{
    action: 0,
    value: "spotify"
  },
  encoder2:{
    action: 0,
    value: "spotify"
  },
  key0:{
    action: 0,
    value: "1"
  },
  key1:{
    action: 0,
    value: "2"
  },
  key2:{
    action: 0,
    value: "3"
  },
  key3:{
    action: 0,
    value: "4"
  },
  key4:{
    action: 0,
    value: "5"
  },
  key5:{
    action: 0,
    value: "6"
  }

});*/


function getStrKey(oEvent) {
    var txt = "";
    if (oEvent.key == "Control") {
        txt = "CTRL";
    }
    if (oEvent.key == "AltGraph") {
        txt = "ALT GR";
    }
    if (oEvent.key == "Alt") {
        txt = "ALT";
    }
    if (oEvent.key == "Shift") {
        txt = "SHIFT";
    }
    if (oEvent.key == "Control" || oEvent.key == "Alt" || oEvent.key == "AltGraph" || oEvent.key == "Shift") {} else {
        if (oEvent.ctrlKey)
            txt = "CTRL + "
        if (oEvent.altKey)
            txt = "ALT + "
        if (oEvent.shiftKey)
            txt = "SHIFT + "

        if (oEvent.key.length == 1) {
            txt += oEvent.key.toUpperCase();
        } else {
            txt += oEvent.key;
        }

    }
    return txt;
}

function getAsciiKey(oEvent) {
    return oEvent.which;
}

function changeVolume(software, value) {
    exec("volume_control\\VolumeMixerControl changeVolume " + software + " " + value, (error, data, getter) => {});
}

var musicName = "no";

function setMusicName(software) {
    var name;
    exec("volume_control\\VolumeMixerControl getMusicSoftware " + software, (error, data, getter) => {
        if (data.includes(musicName)) {

        } else {
            musicName = data;
            document.getElementById("current-music").innerHTML = "Musique: " + data;
            data.replace(/[\n\r]/g, '');
            port.write('set-text "' + data);
        }
    });
}



var refreshMusic = window.setInterval(function() {
    setMusicName("spotify");
}, 10000);


var testedPorts = 0;
var listPorts = [];
var connected = false;

function listPort() {
    SerialPort.list().then(function(ports) {
        var i = 0;
        ports.forEach(function(port) {
            for (const [key, value] of Object.entries(port)) {
                if (key == "path") {
                    console.log(value);
                    listPorts[i] = value;
                }
            }
            i++;
        })
    })
}

function responsesFromPort(data) {
    //console.log("Reply: " + data); //Debug
    if (data.includes("pong")) {
        //Its MacroPad
        console.log("FOUND");
        clearInterval(autoCheck);
        connected = true;
        document.getElementById("debug-port").textContent = "";

        const parser = new Readline();
        port.pipe(parser);
        port.on('data', function(data) {
            serialMessageRecevied(data);
        })

        document.getElementById("connection-status").textContent = "MacroPad Connecté"
    }
}

function autoConnect() {
    if (testedPorts >= listPorts.length) {
        console.log("Cant connect to MacroPad!");
        clearInterval(autoCheck);
        document.getElementById("debug-port").textContent = "Erreur, Impossible de se connecter au MacroPad!";

        setTimeout(function() {
            testedPorts = 0;
            listPorts = [];
            connected = false;
            listPort();
            setTimeout(function() {
                autoConnect();
            }, 1000);
            startAutoConnect();
        }, 60000);

    } else {
        document.getElementById("debug-port").textContent = "Timeout! Essai de " + listPorts[testedPorts];

        console.log(listPorts[testedPorts]);
        port = SerialPort(listPorts[testedPorts], function(err) {
            if (err) {
                console.log("ERROR TO CONNECT");
                testedPorts++;
            } else {
                console.log("Connection ok");
                testedPorts++;
                port.on('data', function(data) {
                    responsesFromPort(data);
                })

                setTimeout(function() {
                    console.log("sendPing");
                    port.write("ping");
                }, 1000);
            }
            baudRate: 9600;
        });
    }
}

var autoCheck;

function startAutoConnect() {
    autoCheck = window.setInterval(function() {
        //console.log("TIMEOUT: trying: " + listPorts[testedPorts]);
        autoConnect();
    }, 5000);
}

listPort();
setTimeout(function() {
    autoConnect();
}, 1000);
startAutoConnect();




function connect() {
    var selectedPort = document.getElementById("selectPort").value;
    if (selectedPort.length >= 3) { // if com selected
        port = SerialPort(selectedPort, function(err) {
            if (err) {
                return document.getElementById('state').innerHTML = "Erreur: " + err.message;
            } else {
                return document.getElementById('state').innerHTML = "Connecté";
            }
            baudRate: 9600;
        });
        const parser = new Readline();
        port.pipe(parser);
        port.on('data', function(data) {
            serialMessageRecevied(data);
        })
        port.write("ping");
    } else {
        //no selected
    }

}


function tests() {
    document.addEventListener('keydown', e => keyPress(e));
}

function serialMessageRecevied(data) {
    var stringData = data.toString();
    stringData.trim();
    //console.log(stringData);

    var value = settings.getSync("profile1.encoder0.value");
    var action = settings.getSync("profile1.encoder0.action");

    if (action == "software-vol") {
        if (stringData.includes("Encoder1:UP")) {
            changeVolume(value, 5)
        } else if (stringData.includes("Encoder1:DOWN")) {
            changeVolume(value, -5)
        }
    } else {

    }

}

function clearPortLists() {
    var selectPort = document.getElementById("selectPort");
    var listlength = selectPort.length;
    console.log(listlength);
    for (var i = 0; i < listlength; i++) {
        selectPort.remove(0);
    }
}

function addPortToList(port) {
    var selectPort = document.getElementById("selectPort");
    var option = document.createElement("option");
    option.text = port;
    selectPort.add(option);
}


async function listSerialPorts() {
    await serialport.list().then((ports, err) => {
        if (err) {
            document.getElementById('error').textContent = err.message
            return
        } else {
            document.getElementById('error').textContent = ''
        }
        console.log('ports', ports);

        if (ports.length === 0) {
            document.getElementById('error').textContent = 'No ports discovered'
        }

        tableHTML = tableify(ports)
        document.getElementById('ports').innerHTML = tableHTML
    })
}


const value = settings.getSync();

console.log(value);