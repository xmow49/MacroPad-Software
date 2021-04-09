

function keyPress(oEvent) {
  document.getElementById("key-combination").innerHTML = getStrKey(oEvent);
}

function key(Nkey) {
  document.addEventListener("keydown", keyPress);
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
                  <input type="radio" id="vol-down" name="system" value="MediaVolumeDOWN" onclick="onChangeKeyType(this)">
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

                  <h3>Application Système</h3>
                  <input type="radio" id="mail" name="system" value="ConsumerEmailReader" onclick="onChangeKeyType(this)">
                  <label for="mail">Email</label>
                  <br>
                  <input type="radio" id="calculator" name="system" value="ConsumerCalculator" onclick="onChangeKeyType(this)">
                  <label for="calculator">Calculatrice</label>
                  <br>
                  <input type="radio" id="explorer" name="system" value="ConsumerExplorer" onclick="onChangeKeyType(this)">
                  <label for="explorer">Explorateur de Fichiers</label>
                  <br>
                  <h3>Controle du Navigateur WEB:</h3>
                  <input type="radio" id="browser" name="system" value="ConsumerBrowserHome" onclick="onChangeKeyType(this)">
                  <label for="browser">Ouvrir le navigateur par défaut</label>
                  <br>
                  <input type="radio" id="browser-refresh" name="system" value="ConsumerBrowserRefresh" onclick="onChangeKeyType(this)">
                  <label for="browser-refresh">Actualiser</label>
                  <br>
                  <input type="radio" id="browser-back" name="system" value="ConsumerBrowserBack" onclick="onChangeKeyType(this)">
                  <label for="browser-back">Page Précédente</label>
                  <br>                  
                  <input type="radio" id="browser-next" name="system" value="ConsumerBrowserForward" onclick="onChangeKeyType(this)">
                  <label for="browser-next">Page Suivante</label>
                  <br>
                  <input type="radio" id="browser-bookmarks" name="system" value="ConsumerBrowserBookmarks" onclick="onChangeKeyType(this)">
                  <label for="browser-bookmarks">Ouvrir les Favoris</label>
                  <br>
                  </form>
                  <br>
                </div>
              </div>`,
    onSubmit: function (val) {
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
          var key = document.getElementById('key-combination').textContent;
          settings.set('profile1.key' + Nkey + '.value', key);
          setTimeout(function () {
            settings.set('profile1.key' + Nkey + '.action', "keys-combination");
          }, 100);
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
        var msgToSend = "set key " + Nkey + " action " + value;

        settings.set('profile1.key' + Nkey + '.value', value);
        setTimeout(function () {
          settings.set('profile1.key' + Nkey + '.action', "system-action");
        }, 100);

        console.log(msgToSend);
        port.write(msgToSend);

        document.removeEventListener("keydown", keyPress);
      }

    },
    onClose: function () {
      document.removeEventListener("keydown", keyPress);
    }
  });

}

function selectSystem() {
  console.log("system")
}

function selectKey() {
  console.log("key")
}

function onChangeKeyType(keymedia) {
  var currentValue = keymedia.value;
  console.log(keymedia.value);

  if (currentValue == "keys") {
    document.getElementById("key-div").hidden = false;
    document.getElementById("system-div").hidden = true;

  } else if (currentValue == "system") {
    document.getElementById("key-div").hidden = true;
    document.getElementById("system-div").hidden = false;
  }
  else if (currentValue == "software-vol") {

  }

}


