const electron = require("electron");
const serialport = require('serialport')
const tableify = require('tableify')
const loudness = require('loudness')
const { exec } = require("child_process");
var popupS = require('popups');

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


function refresh_port() {
  const serialPort = require('serialport');
  serialPort.list().then(function (ports) {

    var options = '';
    ports.forEach(function (port) {

      var listPorts = Object.values(port);
      options += '<option value="' + listPorts[0] + '" />';
      //console.log(listPorts[0])
    })
    document.getElementById('portsDatalist').innerHTML = options
  })
}

function refresh_Button() {
  document.getElementById('inputPort').value = "";
  refresh_port();

}
refresh_port();

var intervalId = window.setInterval(function () {
  refresh_port();
}, 10000);

function connect() {
  var selectedPort = document.getElementById("inputPort").value;
  if (selectedPort.length >= 3) {
    const SerialPort = require('serialport')
    const Readline = require('@serialport/parser-readline')

    const port = new SerialPort(selectedPort, function (err) {
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

      //document.getElementById('serial').innerHTML += data;
      serialMessageRecevied(data);
    })
  } else {
    //no selected
  }

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



