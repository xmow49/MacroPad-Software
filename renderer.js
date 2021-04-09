const electron = require("electron");
const serialport = require('serialport')
const tableify = require('tableify')
const loudness = require('loudness')
const { exec } = require("child_process");
var popupS = require('popups');
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline');
const { Console } = require("console");

function getStrKey(oEvent) {
  var txt = "";
  console.log(oEvent.which);

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
  if (oEvent.key == "Control" || oEvent.key == "Alt" || oEvent.key == "AltGraph" || oEvent.key == "Shift") { }
  else {
    if (oEvent.ctrlKey)
      txt = "CTRL + "
    if (oEvent.altKey)
      txt = "ALT + "
    if (oEvent.shiftKey)
      txt = "SHIFT + "

    if (oEvent.key.length == 1) {
      txt += oEvent.key.toUpperCase();
    }
    else {
      txt += oEvent.key;
    }

  }
  return txt;
}

function changeVolume(software, value) {
  exec("volume_control\\VolumeMixerControl changeVolume " + software + " " + value, (error, data, getter) => {
    /*if (error) {
      console.log("error", error.message);
      return;
    }
    if (getter) {
      console.log("data", data);
      return;
    }*/
    //console.log("data",data);
  });
}

function setMusicName(software) {
  var name;
  exec("volume_control\\VolumeMixerControl getMusicSoftware " + software, (error, data, getter) => {
    /*if (error) {
      console.log("error", error.message);
      return;
    }
    if (getter) {
      console.log("data", data);
      return;
    }*/
    document.getElementById("current-music").innerHTML = "Musique: " + data;
  });
}

setMusicName("spotify");
var refreshMusic = window.setInterval(function () {
  setMusicName("spotify");
}, 10000);



var testedPorts = 0;
var listPorts = [];
var connected = false;

function listPort() {
  SerialPort.list().then(function (ports) {
    var i = 0;
    ports.forEach(function (port) {
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
  console.log("Reply: " + data);
  if (data.includes("pong")) {
    //Its MacroPad
    console.log("FOUND");
    clearInterval(autoCheck);
    connected = true;
    document.getElementById("debug-port").textContent = "";

    const parser = new Readline();
    port.pipe(parser);
    port.on('data', function (data) {
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

    setTimeout(function () {
      testedPorts = 0;
      listPorts = [];
      connected = false;
      listPort();
      setTimeout(function () {
        autoConnect();
      }, 1000);
      startAutoConnect();
    }, 60000);

  } else {
    document.getElementById("debug-port").textContent = "Timeout! Essai de " + listPorts[testedPorts];

    console.log(listPorts[testedPorts]);
    port = SerialPort(listPorts[testedPorts], function (err) {
      if (err) {
        console.log("ERROR TO CONNECT");
        testedPorts++;
      } else {
        console.log("Connection ok");
        testedPorts++;
        port.on('data', function (data) {
          responsesFromPort(data);
        })

        setTimeout(function () {
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
  autoCheck = window.setInterval(function () {
    //console.log("TIMEOUT: trying: " + listPorts[testedPorts]);
    autoConnect();
  }, 5000);
}

listPort();
setTimeout(function () {
  autoConnect();
}, 1000);
startAutoConnect();




function connect() {
  var selectedPort = document.getElementById("selectPort").value;
  if (selectedPort.length >= 3) { // if com selected
    port = SerialPort(selectedPort, function (err) {
      if (err) {
        return document.getElementById('state').innerHTML = "Erreur: " + err.message;
      } else {
        return document.getElementById('state').innerHTML = "Connecté";
      }
      baudRate: 9600;
    });
    const parser = new Readline();
    port.pipe(parser);
    port.on('data', function (data) {
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
  console.log(stringData);
  var software = document.getElementById("selectEncoder1").value;
  if (stringData.includes("Encoder1:UP")) {
    changeVolume(software, 5)
  } else if (stringData.includes("Encoder1:DOWN")) {
    changeVolume(software, -5)
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