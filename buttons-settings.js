function key1() {
  document.addEventListener('keydown', (e) => {
    document.getElementById("key-combination").innerHTML = "";
    if (e.key == "Control" || e.key == "Alt" || e.key == "AltGraph" || e.key == "Shift") { }
    else {
      var txt = "";
      if (e.ctrlKey)
        txt = "CTRL + "
      if (e.altKey)
        txt += "ALT + "
      if (e.shiftKey)
        txt += "SHIFT + "

      txt += e.key.toUpperCase();
      document.getElementById("key-combination").innerHTML = txt;
    }
  });

  popupS.window({
    mode: 'confirm',
    labelOk: 'Enregistrer',
    labelCancel: 'Annuler',
    title: '',
    content: `<div class="dropper-form aligned">
                <div>
                  <input type="radio" id="key" name="key-media" value="keys" onclick="onChangeKeyType(this)" checked>
                  <label for="key">Combinaison de Touches</label>
                  <input type="radio" id="media" name="key-media" value="media" onclick="onChangeKeyType(this)">
                  <label for="key">Controle des médias</label>
                </div>

                <div id="key-div">
                  <h3>Selection des touches:</h3>
                  <h4 id="key-combination"></h4>
                </div>
                <div id="media-div" hidden = true>
                  <h3>Selection d'une action:</h3>
                  <p>bonsoir</p>
              </div>
              </div>`,
    onSubmit: function (val) {
      var txt = document.getElementById('key-combination').textContent;
      if (txt == "") {
        popupS.alert({
          content: "Merci d'entrer une combinaison de touches."
        });
      } else {

      }
    },
    onClose: function () {
    }
  });

}

function selectMedia() {
  console.log("media")
}

function selectKey() {
  console.log("key")
}

function onChangeKeyType(keymedia) {
  var currentValue = keymedia.value;
  console.log(keymedia.value);
  if (currentValue == "keys") {
    document.getElementById("key-div").hidden = false;
    document.getElementById("media-div").hidden = true;
  } else if (currentValue == "media") {
    document.getElementById("key-div").hidden = true;
    document.getElementById("media-div").hidden = false;
  }
}