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

    } else if (currentValue == "encoder-anticlockwise") {
        document.getElementById("key-div-encoder").hidden = true;

    }

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
        onSubmit: function(val) {
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
                keyEncoderPopup(Nencoder, 0);
            else if (value == "software-vol")
                softwareVolumePopup(Nencoder);
            else if (value == "midi")
                midiPopup(Nencoder);
        },
        onClose: function() {
            document.body.removeEventListener('keydown', encoderKeyPress);
        }
    });


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
        onSubmit: function(val) {
            var radio = document.getElementsByName('system-action');
            var value;
            for (var i = 0; i < radio.length; i++) {
                if (radio[i].checked) {
                    value = radio[i].value;
                }
            }

            switch (value) {
                case 'SystemVolumeControl':
                    value = 0;
                    break;
                case 'MediaControl':
                    value = 1;
                    break;
                default:
                    break;
            }

            setToMacropad("set-encoder", Nencoder, "0", value); //Send to macropad set-encoder command with the encoderID, Mode 0(System Action), and value

            settings.set('profile1.encoder' + Nencoder + '.value', value);
            setTimeout(function() {
                settings.set('profile1.encoder' + Nencoder + '.action', "system-vol");
            }, 100);

        },
        onClose: function() {
            encoder(Nencoder)
        }

    });
}

function encoderKeyPress(oEvent) {
    //---------------Unfocus all button to avoid space and enter action-------------
    document.getElementById("popupS-button-ok").blur();
    document.getElementById("popupS-button-cancel").blur();
    document.getElementById("popupS-overlay").blur();

    //-----------------------------------------------------------------------------
    document.getElementById("encoder-key-combination").innerHTML = getStrKey(oEvent);
    var charCode = (typeof oEvent.which == "number") ? oEvent.which : oEvent.keyCode
    document.getElementById("encoder-key-combination-ascii").innerHTML = charCode;
}

var encodersKeyValues = []; //tmp array to store key combination value before send it
function keyEncoderPopup(Nencoder, actionNumber) {
    document.addEventListener("keydown", encoderKeyPress);
    var title;
    switch (actionNumber) {
        case 0:
            title = "Sens Horaire";
            break;
        case 1:
            title = "Sens Anti-Horaire";
            break;
        case 2:
            title = "Click";
            break;
    }
    //style="display: none;"
    popupS.window({
        mode: 'confirm',
        labelOk: 'Enregistrer',
        labelCancel: 'Précédent',
        title: 'Selection de l\'action',
        content: `<div class="dropper-form aligned">
                <div id="key-div">
                  <h3>Selection des touches: ` + title + `</h3>
                  <h4 id="encoder-key-combination">Appuyer sur une touche</h4>
                  <p  id="encoder-key-combination-ascii">Appuyer sur une touche</p>
                </div>
              </div>`,
        onSubmit: function(val) {
            var txt = document.getElementById("encoder-key-combination-ascii").innerHTML;
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
                    onClose: function() {
                        keyEncoderPopup(Nencoder, actionNumber);
                    },
                    onSubmit: function(val) {
                        keyEncoderPopup(Nencoder, actionNumber);
                    }
                });
            }
            //-------------Key OK----------------------
            else {

                encodersKeyValues[actionNumber] = (typeof oEvent.which == "number") ? oEvent.which : oEvent.keyCode;
                actionNumber++;
                if (actionNumber < 3) {
                    keyEncoderPopup(Nencoder, actionNumber);
                } else { //send to macropad

                    setToMacropad("set-encoder", Nencoder, "1", encodersKeyValues[0], encodersKeyValues[1], encodersKeyValues[2]); //Send to macropad set-encoder command with the encoderID, Mode 1(Key Combination), and values
                }

            }
        },
        onClose: function() {
            encoder(Nencoder);
            document.removeEventListener("keydown", encoderKeyPress);
        }
    });
}

function midiPopup(Nencoder) {}

function softwareVolumePopup(Nencoder) {
    popupS.window({
        mode: 'confirm',
        labelOk: 'Enregistrer',
        labelCancel: 'Précédent',
        title: 'Selection de l\'action  de l\'encoder n°' + (Nencoder + 1),
        content: `<div class="dropper-form aligned">
                <div class="encoder-item">
                  <h2>Choisissez le logiciel</h2>
                  <select id="selectEncoder">
                      <option value="">--Choisissez un logiciel--</option>
                  </select>
                </div>
              </div>`,
        onSubmit: function(val) {
            var select = document.getElementById('selectEncoder').value;
            settings.set('profile1.encoder' + Nencoder + '.value', select);
            setTimeout(function() {
                settings.set('profile1.encoder' + Nencoder + '.action', "software-vol");
            }, 100);
        },
        onClose: function() {
            encoder(Nencoder)
        }
    });

    setTimeout(function() {
        updateSoftwaresList();
    }, 100);

}



function clearSoftwaresLists() {
    var selectEncoder = document.getElementById("selectEncoder");
    var listlength = selectEncoder.length;
    console.log(listlength);
    for (var i = 0; i < listlength; i++) {
        selectEncoder.remove(0);
    }

    var selectEncoder = document.getElementById("selectEncoder");
    var option = document.createElement("option");
    option.text = "--Choisissez un logiciel--";
    selectEncoder.add(option);
}

function addSoftwareToList(software) {

    var selectEncoder = document.getElementById("selectEncoder");
    var option = document.createElement("option");
    option.text = software;
    selectEncoder.add(option);
}

function updateSoftwaresList() {
    clearSoftwaresLists();
    exec("volume_control\\VolumeMixerControl getSoftwaresNames", (error, data, getter) => {
        var softwares = data.split(' ');
        softwares.forEach(a => addSoftwareToList(a));
    });
}