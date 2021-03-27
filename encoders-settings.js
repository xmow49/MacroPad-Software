function encoder(Nencoder){
  document.addEventListener('keydown', e => keyPress(e));
  popupS.window({
    mode: 'confirm',
    labelOk: 'Enregistrer',
    labelCancel: 'Annuler',
    title: 'Selection de l\'action',
    content: `<div class="dropper-form aligned">
                <div>
                  <input type="radio" id="key" name="key-system" value="keys" onclick="onChangeKeyType(this)" checked>
                  <label for="key">Combinaison de Touches</label>
                  <input type="radio" id="system" name="key-system" value="system" onclick="onChangeKeyType(this)">
                  <label for="system">Controle du Système</label>
                </div>

                <div id="key-div">
                  <h3>Selection des touches:</h3>
                  <h4 id="key-combination">Appuyer sur une touche</h4>
                </div>


                <div id="system-div" hidden = true>
                <form id="form-system">
                  <h3>Contrôle des Médias</h3>
                  <input type="radio" id="play-pause" name="system" value="MediaPlayPause" onclick="onChangeKeyType(this)">
                  <label for="play-pause">Play/Pause</label>
                  <br>
                  <input type="radio" id="vol-up" name="system" value="MediaVolumeUP" onclick="onChangeKeyType(this)">
                  <label for="vol-up">Volume +</label>
                  <br>
                  <input type="radio" id="" name="system" value="MediaVolumeDOWN" onclick="onChangeKeyType(this)">
                  <label for="vol-down">Volume -</label>
                  <br>
                  <input type="radio" id="mute" name="system" value="MediaVolumeMute" onclick="onChangeKeyType(this)">
                  <label for="mute">Mute</label>
                  <br>
                  <input type="radio" id="next" name="system" value="MediaNext" onclick="onChangeKeyType(this)">
                  <label for="next">Musique Suivante</label>
                  <br>
                  <input type="radio" id="previous" name="system" value="MediaPrevious" onclick="onChangeKeyType(this)">
                  <label for="previous">Musique Précédente</label>
                  <br>
                  <input type="radio" id="stop" name="system" value="MediaStop" onclick="onChangeKeyType(this)">
                  <label for="stop">Musique Stop</label>
                  <br>
                  <input type="radio" id="forward" name="system" value="MediaFastForward" onclick="onChangeKeyType(this)">
                  <label for="forward">Avance Rapide</label>
                  <br>
                  <input type="radio" id="rewind" name="system" value="MediaRewind" onclick="onChangeKeyType(this)">
                  <label for="rewind">Retour Arrière</label>
                  <br>
                  <br>
                </div>
              </div>`,
    onSubmit: function (val) {
      //---------KEY
      if (document.getElementById('key').checked) {
        var txt = document.getElementsByName("system").values;
        console.log(txt);
        //-------------No Value----------------------
        if (txt == "Appuyer sur une touche") {
          popupS.alert({
            title: 'Erreur',
            content: `
                      <h3>Merci d'entrer une combinaison de touches.</h3>
                      <br>
                      `
          });
        }
        //-------------Key OK----------------------
        else {

        }
      }
      //-----------------System------------------
      else {
        var radio = document.getElementsByName('system');
        var value;
        for (var i = 0; i < radio.length; i++) {
          if (radio[i].checked) {
            value = radio[i].value;
          }
        }
        console.log(value);
        msgToSend = "set key " + Nkey + " " + value;
        console.log(msgToSend);
        sendToSerial(msgToSend);
        popupState = 0;
      }

    },
    onClose: function () {
      popupState = 0;
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