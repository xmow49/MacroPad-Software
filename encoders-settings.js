var clockwiseOption = 0;
var clockwiseValue = 0;

var anticlockwiseOption = 0;
var anticlockwiseValue = 0;

var clickOption = 0;
var clickValue = 0;



function onChangeEncoderAction(radio) {
  var currentValue = radio.value;
  console.log(radio.value);

  var action = document.getElementsByName('keys-vol-software-midi');
  var value;
  for (var i = 0; i < action.length; i++) {
    if (action[i].checked) {
      value = action[i].value;
    }
  }
  clockwiseOption = value;


  if (currentValue == "encoder-clockwise") {
    document.getElementById("key-div-encoder").hidden = false;

  } else if (currentValue == "encoder-click") {
    document.getElementById("key-div-encoder").hidden = true;

  }
  else if (currentValue == "encoder-anticlockwise") {
    document.getElementById("key-div-encoder").hidden = true;

  }

}

function systemActionPopup(Nencoder) {
  popupS.window({
    mode: 'confirm',
    labelOk: 'Enregistrer',
    labelCancel: 'Précédent',
    title: 'Selection de l\'action  de l\'encoder n°' + (Nencoder + 1),
    content: `<div class="dropper-form aligned">

                <div id="system-control">
                  <h4>Choisissez une action</h4>
                  <p>Les actions ci-dessous peuvent fonctionner sans le logiciel.</p>
                  <input type="radio" id="volume-control" name="system-action" value="SystemVolumeControl" onclick="onChangeKeyType(this)" checked>
                  <label for="volume-control">Contrôle du volume Système</label>
                  <br>
                  <input type="radio" id="media-control" name="system-action" value="MediaControl" onclick="onChangeKeyType(this)">
                  <label for="media-control">Avence/Retour Rapide</label>
                  <br>
                </div>
                <br>
              </div>`,
    onSubmit: function (val) {
      var radio = document.getElementsByName('system-action');
      var value;
      for (var i = 0; i < radio.length; i++) {
        if (radio[i].checked) {
          value = radio[i].value;
        }
      }
      var msgToSend = "set encoder " + Nencoder + " " + value;
      port.write(msgToSend);
    },
    onClose: function () {
      encoder(Nencoder)
    }

  });
}
function encoderKeyPress(oEvent) {
  document.getElementById("encoder-key-combination").innerHTML = getStrKey(oEvent);
}


function keyEncoderPopup(Nencoder) {
  document.addEventListener("keydown", encoderKeyPress);
  popupS.window({
    mode: 'confirm',
    labelOk: 'Enregistrer',
    labelCancel: 'Précédent',
    title: 'Selection de l\'action',
    content: `<div class="dropper-form aligned">
                <div id="key-div">
                  <h3>Selection des touches:</h3>
                  <h4 id="encoder-key-combination">Appuyer sur une touche</h4>
                </div>
              </div>`,
    onSubmit: function (val) {
      var txt = document.getElementById("encoder-key-combination").innerHTML;
      console.log(txt);
      //-------------No Value----------------------
      if (txt == "Appuyer sur une touche") {
        popupS.alert({
          title: 'Erreur',
          labelOk: 'Retour',
          content: `
                      <h4>Merci d'appuyer sur une ou plusieurs touches.</h4>
                      <br>
                      `,
          onClose: function () {
            keyEncoderPopup(Nencoder);
          },
          onSubmit: function (val) {
            keyEncoderPopup(Nencoder);
          }
        });
      }
      //-------------Key OK----------------------
      else {
        var msgToSend = "set encoder " + Nencoder + " " + value;
        port.write(msgToSend);
      }
    },
    onClose: function () {
      document.removeEventListener("keydown", encoderKeyPress);
    }
  });
}

function softwareVolumePopup(Nencoder) {

}

function midiPopup(Nencoder) {

}

function encoder(Nencoder) {
  popupS.window({
    mode: 'confirm',
    labelOk: 'Suivant',
    labelCancel: 'Annuler',
    title: 'Selection de l\'action  de l\'encoder n°' + (Nencoder + 1),
    content: `<div class="dropper-form aligned">

                <div>
                  <input type="radio" id="system-vol" name="keys-vol-software-midi" value="system-vol" onclick="onChangeKeyType(this)"checked>
                  <label for="system-vol">Action sur le Système</label>
                  <br>
                  <input type="radio" id="keys" name="keys-vol-software-midi" value="encoder-keys" onclick="onChangeKeyType(this)">
                  <label for="keys">Combinaison de Touches</label>
                  <br>
                  <input type="radio" id="software-vol" name="keys-vol-software-midi" value="software-vol" onclick="onChangeKeyType(this)">
                  <label for="software-vol">Volume d'un logiciel</label>
                  <br>
                  <input type="radio" id="midi" name="keys-vol-software-midi" value="midi" onclick="onChangeKeyType(this)">
                  <label for="midi">Midi</label>
                  <br>
                </div>
                <br>
              </div>`,
    onSubmit: function (val) {
      var slect = document.getElementsByName('keys-vol-software-midi');
      var value;
      for (var i = 0; i < slect.length; i++) {
        if (slect[i].checked) {
          value = slect[i].value;
        }
      }
      console.log(value);
      if (value == "system-vol")
        systemActionPopup(Nencoder);
      else if (value == "encoder-keys")
        keyEncoderPopup(Nencoder);
      else if (value == "software-vols")
        softwareVolumePopup(Nencoder);
      else if (value == "midi")
        midiPopup(Nencoder);
    },
    onClose: function () {
      document.body.removeEventListener('keydown', encoderKeyPress);
    }
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
    var softwares = data.split(' ');
    softwares.forEach(a => addSoftwareToList(a));
  });
}

updateSoftwaresList();