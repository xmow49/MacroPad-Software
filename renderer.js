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

function clearSoftwaresLists() {
  var selectEncoder1 = document.getElementById("selectEncoder1");
  var selectEncoder2 = document.getElementById("selectEncoder2");
  var selectEncoder3 = document.getElementById("selectEncoder3");
  var listlength = selectEncoder1.length;
  console.log(listlength);
  for (var i = 0; i < listlength; i++) {
    selectEncoder1.remove(0);
    selectEncoder2.remove(0);
    selectEncoder3.remove(0);
  }

  var selectEncoder1 = document.getElementById("selectEncoder1");
  var option1 = document.createElement("option");
  option1.text = "--Choisissez un logiciel--";
  selectEncoder1.add(option1);

  var selectEncoder2 = document.getElementById("selectEncoder2");
  var option2 = document.createElement("option");
  option2.text = "--Choisissez un logiciel--";
  selectEncoder2.add(option2);

  var selectEncoder3 = document.getElementById("selectEncoder3");
  var option3 = document.createElement("option");
  option3.text = "--Choisissez un logiciel--";
  selectEncoder3.add(option3);
}

function addSoftwareToList(software) {

  var selectEncoder1 = document.getElementById("selectEncoder1");
  var option1 = document.createElement("option");
  option1.text = software;
  selectEncoder1.add(option1);

  var selectEncoder2 = document.getElementById("selectEncoder2");
  var option2 = document.createElement("option");
  option2.text = software;
  selectEncoder2.add(option2);

  var selectEncoder3 = document.getElementById("selectEncoder3");
  var option3 = document.createElement("option");
  option3.text = software;
  selectEncoder3.add(option3);
}

function updateSoftwaresList() {
  clearSoftwaresLists();
  exec("volume_control\\VolumeMixerControl getSoftwaresNames", (error, data, getter) => {
    softwares = data.split(' ');
    softwares.forEach(a => addSoftwareToList(a));
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




function encoder1Selected() {
  var selectedItem = document.getElementById("selectEncoder1").value;
  if (selectedItem == "Custom") {
    document.getElementById("customEncoder1").hidden = false;
  } else {
    document.getElementById("customEncoder1").hidden = true;
  }

}


function btn1() {

  popupS.modal({
    content: '<div class="dropper-form aligned"><div class="dropper-form-group"><label for="f2-email">Email</label><input type="email" name="" id="f2-email"></div><div class="dropper-form-group"><label for="f2-password">Password</label></div><div class="dropper-form-controls"><label><input type="checkbox" name=""><span class="dropper-checkbox checkbox-sub-blue"></span>Remember Me </label><button type="submit" class="dropper-button primary button-purple">Submit</button></div></div>'
  });
}

