var listKey = [];
var pressed = {};

Array.prototype.remove = function() {
    var what, a = arguments,
        L = a.length,
        ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

var keyCount = 0;
var strListKey = "";

function printKeyList(oEvent) {
    if (strListKey == "")
        strListKey += getStrKey(oEvent);
    else
        strListKey += " + " + getStrKey(oEvent);

    document.getElementById("key-combination").innerHTML = strListKey; //Display List
    pressed[oEvent.which] = true; //Add key to pressed State
}


function keyDown(oEvent) {

    //---------------Unfocus all button to avoid space and enter action-------------
    document.getElementById("clear-keys").blur();
    document.getElementById("key").blur();
    document.getElementById("popupS-button-ok").blur();
    document.getElementById("popupS-button-cancel").blur();
    //-----------------------------------------------------------------------------

    if (oEvent.which == 18 && oEvent.location == 2) //If the last key is CTRL and the new key is ALTGR, remove CTRL from the list
    {
        clearKeys();
        listKey.push(getAsciiKey(oEvent) + 2000);
        printKeyList(oEvent)
        keyCount++;
    }
    //
    else if (keyCount < 3) {
        //If key isnt in the list (often the first key press), +1000 and +2000 are left and right keys like CTRL or shift
        if (!listKey.includes(getAsciiKey(oEvent)) && !listKey.includes(getAsciiKey(oEvent) + 1000) && !listKey.includes(getAsciiKey(oEvent) + 2000)) {
            var valueToSave;
            if (oEvent.which == 91) { //Windows Key
                valueToSave = getAsciiKey(oEvent);
            } else if (oEvent.location == 1) { //Key left (CTRL, ALT, SHIFT)
                valueToSave = getAsciiKey(oEvent) + 1000; //add 1000 to know its left
            } else if (oEvent.location == 2) { //Key right (CTRL, ALT, SHIFT)
                valueToSave = getAsciiKey(oEvent) + 2000; //add 1000 to know its right
            } else {
                valueToSave = getAsciiKey(oEvent);
            }
            listKey.push(valueToSave); //Add the key to the list
            keyCount++; //add keycout (max 3 keys)
            printKeyList(oEvent); //display in the windows
        }

    }

    console.log(pressed);
}

function keyUp(oEvent) {

    // if (keyCount < 3) {
    //     if (!listKey.includes(getAsciiKey(oEvent))) { //If key isnt in the list (often the first key press)
    //         listKey.push(getAsciiKey(oEvent)); //Add the key to the list
    //         keyCount++;
    //     }
    // }
    //Display List
    pressed[oEvent.which] = false; //Add key to release State

}

function clearKeys() {
    pressed = {};
    listKey = [];
    strListKey = [];
    keyCount = 0;
    document.getElementById("key-combination").innerHTML = "Appuyer sur une touche";
}


function setKey(Nkey) {
    document.addEventListener("keydown", keyDown); //Add a listener for keydown
    document.addEventListener("keyup", keyUp); //Add a listener for keyup
    popupS.window({
        mode: 'confirm',
        labelOk: 'Enregistrer',
        labelCancel: 'Annuler',
        title: 'Selection de l\'action  de la touche n°' + (Nkey + 1),
        content: `<div class="dropper-form aligned">
                <div>
                  <input type="radio" id="key" name="key-system" value="keys" onclick="onChangeKeyType(this)" checked>
                  <label for="key">Combinaison de Touches</label>
                  <input type="radio" id="system" name="key-system" value="system" onclick="onChangeKeyType(this)">
                  <label for="system">Controle du Système</label>
                </div>

                <div id="key-div">
                  <h3>Selection des touches:</h3>
                  <h4 class="key-combination" id="key-combination">Appuyer sur une touche</h4>
                  <button id="clear-keys" onClick="clearKeys()">Effacer</button>
                </div>


                <div id="system-div" hidden = true>
                <form id="form-system">
                  <h3>Contrôle des Médias</h3>
                  <input type="radio" id="play-pause" name="system" value="205" onclick="onChangeKeyType(this)">
                  <label for="play-pause">Play/Pause</label>
                  <br>
                  <input type="radio" id="vol-up" name="system" value="233" onclick="onChangeKeyType(this)">
                  <label for="vol-up">Volume +</label>
                  <br>
                  <input type="radio" id="vol-down" name="system" value="234" onclick="onChangeKeyType(this)">
                  <label for="vol-down">Volume -</label>
                  <br>
                  <input type="radio" id="mute" name="system" value="226" onclick="onChangeKeyType(this)">
                  <label for="mute">Mute</label>
                  <br>
                  <input type="radio" id="next" name="system" value="181" onclick="onChangeKeyType(this)">
                  <label for="next">Musique Suivante</label>
                  <br>
                  <input type="radio" id="previous" name="system" value="182" onclick="onChangeKeyType(this)">
                  <label for="previous">Musique Précédente</label>
                  <br>
                  <input type="radio" id="stop" name="system" value="183" onclick="onChangeKeyType(this)">
                  <label for="stop">Musique Stop</label>
                  <br>
                  <input type="radio" id="forward" name="system" value="179" onclick="onChangeKeyType(this)">
                  <label for="forward">Avance Rapide</label>
                  <br>
                  <input type="radio" id="rewind" name="system" value="180" onclick="onChangeKeyType(this)">
                  <label for="rewind">Retour Arrière</label>
                  <br>

                  <h3>Application Système</h3>
                  <input type="radio" id="mail" name="system" value="394" onclick="onChangeKeyType(this)">
                  <label for="mail">Email</label>
                  <br>
                  <input type="radio" id="calculator" name="system" value="402" onclick="onChangeKeyType(this)">
                  <label for="calculator">Calculatrice</label>
                  <br>
                  <input type="radio" id="explorer" name="system" value="404" onclick="onChangeKeyType(this)">
                  <label for="explorer">Explorateur de Fichiers</label>
                  <br>
                  <h3>Controle du Navigateur WEB:</h3>
                  <input type="radio" id="browser" name="system" value="547" onclick="onChangeKeyType(this)">
                  <label for="browser">Ouvrir le navigateur par défaut</label>
                  <br>
                  <input type="radio" id="browser-refresh" name="system" value="551" onclick="onChangeKeyType(this)">
                  <label for="browser-refresh">Actualiser</label>
                  <br>
                  <input type="radio" id="browser-back" name="system" value="248" onclick="onChangeKeyType(this)">
                  <label for="browser-back">Page Précédente</label>
                  <br>                  
                  <input type="radio" id="browser-next" name="system" value="549" onclick="onChangeKeyType(this)">
                  <label for="browser-next">Page Suivante</label>
                  <br>
                  <input type="radio" id="browser-bookmarks" name="system" value="554" onclick="onChangeKeyType(this)">
                  <label for="browser-bookmarks">Ouvrir les Favoris</label>
                  <br>
                  </form>
                  <br>
                </div>
              </div>`,
        onSubmit: function(val) {
            //--------------------------------------KEYS COMBINATION--------------------------------------------
            if (document.getElementById('key').checked) { //If keys selected
                var txt = document.getElementById("key-combination").textContent; //Get text value
                //----------If no value: Error Message-------------
                if (txt == "Appuyer sur une touche") {
                    popupS.alert({
                        title: 'Erreur',
                        content: `
                      <h3>Merci d'entrer une combinaison de touches.</h3>
                      <br>
                      `,
                        onSubmit: function(val) {
                            setKey(Nkey);
                        }
                    });
                }
                //-------------If Keys OK (one or multiple key are selected) ----------------------
                else {
                    settings.set('profile1.key' + Nkey + '.value', txt); //Save to config
                    setTimeout(function() { settings.set('profile1.key' + Nkey + '.action', "keys-combination"); }, 100); //Save to config

                    setToMacropad("set-key", Nkey, "1", keycodeToKeyboard(listKey[0]), keycodeToKeyboard(listKey[1]), keycodeToKeyboard(listKey[2])); //Send to macropad set-key command with the keyID, Mode 1(key combination), and values 
                }
            }

            //--------------------------------------SYSTEM ACTION--------------------------------------------
            else {
                var radio = document.getElementsByName('system'); //get the radio list
                var value;
                for (var i = 0; i < radio.length; i++) { //find the selected value
                    if (radio[i].checked) {
                        value = radio[i].value;
                    }
                }

                if (value == null) { //If no found: error message
                    popupS.alert({
                        title: 'Erreur',
                        content: `
                      <h3>Merci de choisir une action.</h3>
                      <br>
                      `,
                        onSubmit: function(val) {
                            setKey(Nkey);
                        }
                    });

                } else { //If action has been selected:
                    //-----------------SEND TO SERIAL-------------------------
                    setToMacropad("set-key", Nkey, "0", value); //Send to macropad set-key command with the keyID, Mode 1(key combination), and values 

                    // var msgToSend = "set key " + Nkey + " action " + value;
                    // console.log(msgToSend);
                    // port.write(msgToSend);

                    //-----------------Save To config-------------------------
                    settings.set('profile1.key' + Nkey + '.value', value);
                    setTimeout(function() {
                        settings.set('profile1.key' + Nkey + '.action', "system-action");
                    }, 100);

                    document.removeEventListener("keydown", keyDown); //Remove event listener
                }
            }
        },
        onClose: function() {
            document.removeEventListener("keydown", keyDown); //Remove event listener
        }
    });

    clearKeys(); //Clear previous key list
}

function selectSystem() {
    //console.log("System Action");
    //-------Display System Action Menu------------------
    document.getElementById("key-div").hidden = true;
    document.getElementById("system-div").hidden = false;
    //---------------------------------------------------
}

function selectKeys() {
    //console.log("Keys");
    //-------Display Keys Action Menu------------------
    document.getElementById("key-div").hidden = false;
    document.getElementById("system-div").hidden = true;
    //---------------------------------------------------
    clearKeys(); //Clear the older values
}

function onChangeKeyType(keymedia) {
    var selected = keymedia.value; //radio seleced value
    if (selected == "keys") {
        selectKeys(); //Keys menu
    } else if (selected == "system") {
        selectSystem(); //System action menu
    }
}