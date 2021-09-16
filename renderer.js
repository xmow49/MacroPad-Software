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


function getStrKey(oEvent) { //Convert Key text to Text to display it
    var txt = "";
    if (oEvent.key == "Control") { //Change Control text
        txt = "CTRL";
    }
    if (oEvent.key == "AltGraph") { //Change AltGraph text
        txt = "ALT GR";
    }
    if (oEvent.key == "Alt") { //Change Alt text
        txt = "ALT";
    }
    if (oEvent.key == "Shift") { //Change Shift text
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

function changeVolume(software, value) { //Change volume of an software 
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
    if (testedPorts >= listPorts.length) { //if all port are tested and no work.
        console.log("Cant connect to MacroPad!");
        clearInterval(autoCheck);
        document.getElementById("debug-port").textContent = "Erreur, Impossible de se connecter au MacroPad!"; //error message

        //reset all value and retry in 60s
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

    } else { // testing ports
        document.getElementById("debug-port").textContent = "Timeout! Essai de " + listPorts[testedPorts]; //trying Text
        port = SerialPort(listPorts[testedPorts], function(err) { //test to connect
            if (err) { //if no work
                console.log("ERROR TO CONNECT");
            } else { //if connected
                console.log("Connection ok");
                port.on('data', function(data) { //Add listener for recevied message from serial
                    responsesFromPort(data); //and send it to this function to check the ping 
                })
                setTimeout(function() { //wait 1s and send a ping to the macropad
                    //console.log("sendPing");
                    port.write("ping");
                }, 1000);
            }
            baudRate: 9600;
        });
        testedPorts++; //to check the next port
    }
}

var autoCheck;

function startAutoConnect() {
    autoCheck = window.setInterval(function() {
        console.log("TIMEOUT: trying: " + listPorts[testedPorts]);
        autoConnect();
    }, 5000);
}



setTimeout(function() { //When Start, Auto connect to macropad
    autoConnect();
}, 1000);

startAutoConnect();



function serialMessageRecevied(data) { //When serial mesage recevied
    var stringData = data.toString(); //convert it to string
    stringData.trim(); // remove \n and blank
    console.log(stringData); //Debug


    //Get Config
    var value = settings.getSync("profile1.encoder0.value");
    var action = settings.getSync("profile1.encoder0.action");

    if (action == "software-vol") { //if software volume, when encoder, change volume
        if (stringData.includes("Encoder1:UP")) {
            changeVolume(value, 5)
        } else if (stringData.includes("Encoder1:DOWN")) {
            changeVolume(value, -5)
        }
    } else {

    }

}


// const value = settings.getSync();
// console.log(value);