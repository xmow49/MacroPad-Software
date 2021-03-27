const electron = require("electron");
const serialport = require('serialport')
const tableify = require('tableify')
const loudness = require('loudness')
const { exec } = require("child_process");
var popupS = require('popups');
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

function getStrKey(oEvent) {
  var txt = "";
  console.log(oEvent.key);
  if (oEvent.key == "Control" || oEvent.key == "Alt" || oEvent.key == "AltGraph" || oEvent.key == "Shift") {}
  if (oEvent.key == "Control") {
    txt = "CTRL";
  }
  if (oEvent.key == "AltGraph") {
    txt = "ALT GR";
  }
  
  else {
    if (oEvent.ctrlKey)
      txt = "CTRL + "
    if (oEvent.altKey)
      txt = "ALT + "
    if (oEvent.shiftKey)
      txt = "SHIFT + "

    txt += oEvent.key.toUpperCase();
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

function getSoftwaresNames() {
  exec("volume_control\\VolumeMixerControl getSoftwaresNames", (error, data, getter) => {
    softwares = data.split(' ');
    return softwares;
  });
}

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
  } else {
    //no selected
  }

}

port = new SerialPort("com");


const parser = new Readline();
port.pipe(parser);
port.on('data', function (data) {
  serialMessageRecevied(data);
})


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

function updatePortList() {
  clearPortLists();
  const serialPort = require('serialport');
  serialPort.list().then(function (ports) {
    ports.forEach(function (port) {
      var listPorts = Object.values(port);
      addPortToList(listPorts[0])
      //console.log(listPorts[0])
    })
  })
}
updatePortList();

function refresh_Button() {
  updatePortList();
}

/*var intervalId = window.setInterval(function () {
  updatePortList();
}, 10000);*/

