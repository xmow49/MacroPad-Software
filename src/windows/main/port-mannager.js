const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
var usbDetect = require('usb-detection');
const { ipcMain } = require('electron');
usbDetect.startMonitoring();

var scanInProgress = false;
var currentTestingPort;
var checkInterval;
var testToDoCount;
var ack = false //acknowledgement from the macropad
scanSerialsPorts();

var pingResponse = false;
var macropadConnectionStatus = false;
var macropadInterval;


usbDetect.on('add', function(device) {
    if (device.vendorId == "9025" && device.productId == "32822") {
        if (firmwareUpdateRunning == false) {
            setTimeout(function() {
                scanSerialsPorts();
            }, 1000);
        }

    }
});

var availablePorts = [];

function scanPorts() { //List all serial port and store into availablePorts
    SerialPort.list().then(function(ports) {
        var i = 0;
        ports.forEach(function(port) {
            for (const [key, value] of Object.entries(port)) {
                if (key == "path") {
                    availablePorts[i] = value;
                }
            }
            i++;
        })
    })
    return availablePorts;
}

function updateGUIPortList(availablePorts) {
    var portList = document.getElementById("port-list"); //Get the list div
    portList.innerHTML = ""; //clear it

    availablePorts.forEach((port, i) => { //foretch port
        var label = document.createElement('label'); //create label
        var input = document.createElement('input'); //create input
        var span = document.createElement('span'); //create span
        //Set values:
        span.innerHTML = port;
        input.type = "radio";
        input.name = "port-list";
        input.value = port;
        input.id = "port-" + i;


        //add element to the page:
        label.appendChild(input);
        label.appendChild(span);
        portList.appendChild(label);
    });
}


var encoderAnimationRunning = false;

async function responsesFromPort(data) {
    // console.log("From MacroPad: " + data);

    // console.log("Good message");

    var stringFromSerial = data.toString();
    // stringFromSerial = stringFromSerial.replace(/\r\n/g, "");

    console.log("From MacroPad: " + stringFromSerial);

    if (stringFromSerial == "OK") {
        ack = true;
    }

    if (stringFromSerial == "P") { //its a Macropad
        // Here, the macropad is connected and a pong is received
        pingResponse = true;
        ack = true;
        if (macropadConnectionStatus == false) { //If the macropad is not connected
            macropadConnectionStatus = true;
            document.getElementById("connect-button").innerHTML = "Se déconnecter";
            usbDetect.on('remove', function(device) {
                if (device.vendorId == "9025" && device.productId == "32822") {
                    macropadConnectionStatus = false;
                    musicName = "none";
                    clearInterval(macropadInterval);
                    clearInterval(screenTextInterval);
                    updateOverviewConnectionStatus(false);
                    console.log("Macropad disconnected");
                }
            });
            macropadInterval = setInterval(async function() {
                try {
                    if (!configIsSending) { var result = await sendWithACK("P"); }
                } catch (result) {
                    macropadConnectionStatus = false;
                    clearInterval(macropadInterval);
                    updateOverviewConnectionStatus(false);
                    console.log(result);
                }
            }, 10000);

            await sendWithACK("A"); //get the current profile from the macropad

            updateScreenText(); //start the screen text update
            saveToConfig("settings.last-port", availablePorts[currentTestingPort]); //save the last port used

        }

        clearInterval(checkInterval); //stop all check
        //document.getElementById("port-" + currentTestingPort).checked = true;
        scanInProgress = false;
        document.getElementById("scan-loading").style.display = "none"; //hide the loading animation
        var progressBar = document.getElementById("port-scan-progress");
        progressBar.max = 100;
        progressBar.value = 100;
        progressBar.className = "end"
        updateOverviewConnectionStatus(true);
    }

    if (stringFromSerial.charAt(0) == "A") { //if the firt char is A, its a profile number
        ack = true;
        var profileNumber = stringFromSerial.charAt(1); //get the profile number
        console.log("Profile number: " + profileNumber);
        profileNumber = parseInt(profileNumber); //convert to int
        onChangeProfile(profileNumber); //call the function to change the profile in the main window
    }


    if (macropadConnectionStatus) {
        // for (var i = 0; i < stringFromSerial.length; i++) {
        //     console.log(stringFromSerial.charCodeAt(i));
        // }

        if (stringFromSerial.charAt(0) == "K") { //a key is pressed
            var msg = stringFromSerial.replace("K", ""); //keep only the key code
            var keyCode = parseInt(msg);
            msg = "key" + keyCode;
            try { //try to find the button with key id
                var button = document.getElementById(msg);
                button.style.transform = "scale(.9)"; //animate the button
                setTimeout(function() { //wait 0.3s and stop the animation
                    button.style.transform = "scale(1)";
                    updateScreenText(); //update the screen text: potentially music changed

                }, 300);
            } catch (e) {}
        }

        if (stringFromSerial.charAt(0) == "E") { //a encoder is turned
            var encoderId = stringFromSerial.charAt(1); //get the encoder id
            var encoderDirection = stringFromSerial.charAt(2); //get the encoder direction
            var encoderType = macropadConfig.profiles[currentProfile].encoders[encoderId].type; //get the encoder type

            var encoderValue = macropadConfig.profiles[currentProfile].encoders[encoderId].values; //get the encoder values

            if (!(encoderValue == "" || encoderValue == null || encoderType == null || encoderType == "")) { //if the encoder has a value
                if (encoderType == 1) { //music software encoder
                    if (encoderDirection == "U") { //if the encoder is turned right --> volume up
                        IPC.sendSync('set-music-software', encoderValue, 5); //send the volume up command to the music software (5% step)
                    } else if (encoderDirection == "D") { //if the encoder is turned left --> volume down
                        IPC.sendSync('set-music-software', encoderValue, -5); //send the volume down command to the music software (5% step)
                    }
                }
            }

            try { //try to find the button with key id
                var button = document.getElementById("encoder" + encoderId);
                var icon = document.getElementById("encoderIcon" + encoderId);
                var iconClass = icon.className;

                if (encoderAnimationRunning == false) {
                    encoderAnimationRunning = true;

                    if (encoderDirection == "U")
                        icon.className = "mdi mdi-rotate-right";
                    if (encoderDirection == "D")
                        icon.className = "mdi mdi-rotate-left";

                    button.style.transform = "scale(.9)"; //animate the button


                    setTimeout(function() { //wait 0.3s and stop the animation
                        button.style.transform = "scale(1)";
                        // updateOverviewIconInKeys();
                        if (icon.classList.contains("mdi-rotate-right"))
                            icon.classList.remove("mdi-rotate-right");
                        if (icon.classList.contains("mdi-rotate-left"))
                            icon.classList.remove("mdi-rotate-left");
                        icon.className = iconClass;
                        encoderAnimationRunning = false;
                    }, 500);
                }


            } catch (e) {}



        }

        if (stringFromSerial.charAt(0) == "V") { //macropad version
            var msg = stringFromSerial.replace("V", ""); //keep only the version
            //1.0.0-atmega32u4
            var infos = msg.split("-"); //split the version in 2 parts
            currentFirmwareVersion.version = infos[0];
            currentFirmwareVersion.cpu = infos[1];
        }
    }



}


function updateOverviewConnectionStatus(status) {
    if (status) {
        document.getElementById("scan-port-log").innerHTML = "Connecté au MacroPad."
        document.getElementById("connect-status").className = "online"; //Change the status to online in the overview menu
        var text = document.getElementById("connect-status-button").innerHTML;
        text = text.replace("Déconnecté", "Connecté");
        document.getElementById("connect-status-button").innerHTML = text;
    } else {
        document.getElementById("connect-status").className = "offline"; //Change the status to offline in the overview menu
        var text = document.getElementById("connect-status-button").innerHTML;
        text = text.replace("Connecté", "Déconnecté");
        document.getElementById("connect-status-button").innerHTML = text;
    }
}

function connectToPort(port) {

    serialPortConnection = SerialPort(port, function(err) { //test to connect
        if (err) { //if no work
            console.log("ERROR TO CONNECT");

        } else { //if connected
            console.log("Connected!");
            // serialPortConnection.on('data', function(data) { //Add listener for recevied message from serial
            //     responsesFromPort(data); //and send it to this function to check the ping 
            // })
            const parser = serialPortConnection.pipe(new Readline({ delimiter: '\r\n' }));
            parser.on('data', function(data) {
                responsesFromPort(data);
            });
            setTimeout(async function() { //wait 0.5s and send a ping to the macropad
                console.log("SENDING PING");
                await sendWithACK("P");
            }, 1000);
        }
        baudRate: 9600;
    });

}



function scanSerialsPorts() {
    if (scanInProgress == false && macropadConnectionStatus == false) { //if the scan is not in progress and the macropad is not connected
        console.log("scanSerialsPorts");
        document.getElementById("scan-loading").style.display = "block"; //show the loading animation
        scanInProgress = true; //Scan in progress
        document.getElementById("connect-button").innerHTML = "Scan en cours ..."
        availablePorts = scanPorts(); //Get all ports
        setTimeout(function() {
            updateGUIPortList(availablePorts) //update the list after 100ms
            testToDoCount = availablePorts.length - 1;
        }, 100);

        //Start autocheck
        currentTestingPort = -1; //start to the first port


        checkInterval = window.setInterval(function() {
            // ------------ TEST with previous port ------------
            var lastUsedPort = readFromConfig("settings.last-port"); //get the last used port
            if (lastUsedPort == null || lastUsedPort == "" || lastUsedPort == undefined) {
                lastUsedPort = "";
            }
            if (lastUsedPort.includes("COM") && currentTestingPort == -1) { //if the last used port is a serial port
                availablePorts[currentTestingPort] = lastUsedPort; //get the port number
            } else {
                currentTestingPort++;
            }
            //-----------------------------------------------
            if (currentTestingPort > testToDoCount) {
                clearInterval(checkInterval);
                document.getElementById("scan-loading").style.display = "none"; //hide the loading animation
            } else {
                document.getElementById("scan-port-log").innerHTML = "Test de " + availablePorts[currentTestingPort] + " ...";
                var progressBar = document.getElementById("port-scan-progress");
                progressBar.max = testToDoCount + 1;
                progressBar.value = currentTestingPort + 1;
                progressBar.className = "progress"
                console.log("Trying: " + availablePorts[currentTestingPort] + ":" + currentTestingPort + "/" + testToDoCount);
                connectToPort(availablePorts[currentTestingPort]);
            }

            document.getElementById("scan-port-log").innerHTML = ""
            scanInProgress = false;

        }, 3000);

    } else if (macropadConnectionStatus == true && scanInProgress == false) {
        serialPortConnection.close();
        macropadConnectionStatus = false;
        document.getElementById("connect-button").innerHTML = "Rechercher un MacroPad";
        updateOverviewConnectionStatus(false);
    }
}



function connectPopup() {
    document.getElementById("connect-macropad").style.display = "block";
    updatePopupBackground();
    if (macropadConnectionStatus == false && scanInProgress == false) {
        scanSerialsPorts();
    }

}

function connectPopupCancel() {
    document.getElementById("connect-macropad").style.display = "none";
    updatePopupBackground()
}

function connectPopupSave() {
    document.getElementById("connect-macropad").style.display = "none";
    updatePopupBackground()
}

var configIsSending = false;

function setSendIcon(icon) {
    //0 = send
    //1 = loading
    //2 = ok
    //3 = error
    try {
        document.getElementById("send-button").classList.remove("visible");
        document.getElementById("send-loading").classList.remove("visible");
        document.getElementById("send-ok").classList.remove("visible");
        document.getElementById("send-error").classList.remove("visible");
    } catch (e) {}


    switch (icon) {
        case 0:
            document.getElementById("send-button").classList.add("visible");
            document.getElementById("send").style.background = "";

            break;
        case 1:
            document.getElementById("send-loading").classList.add("visible");
            document.getElementById("send").style.background = "var(--color-header-hover)";
            break;
        case 2:
            document.getElementById("send-ok").classList.add("visible");
            window.setTimeout(function() {
                setSendIcon(0); //show send
            }, 2000);
            break;
        case 3:
            document.getElementById("send-error").classList.add("visible");
            window.setTimeout(function() {
                setSendIcon(0); //show send
            }, 2000);
            break;

    }
}


async function sendConfig() {
    if (macropadConnectionStatus && !configIsSending) { //if connected
        configIsSending = true;
        setSendIcon(1); //show loading
        musicName = "none"; //reset the music name
        console.log("---------------------------SENDING CONFIG---------------------------");
        try {


            for (var profileNumber = 0; profileNumber < 6; profileNumber++) { //for each profile
                if (readFromConfig("profiles." + profileNumber) != null) { //if profile is not empty
                    var profileName = readFromConfig("profiles." + profileNumber + ".name"); //get the profile name
                    var profileColor = readFromConfig("profiles." + profileNumber + ".color"); //get the profile color
                    var profileEncoders = readFromConfig("profiles." + profileNumber + ".encoders"); //get the profile encoders
                    var profileKeys = readFromConfig("profiles." + profileNumber + ".keys"); //get the profile keys 
                    var profileDisplay = readFromConfig("profiles." + profileNumber + ".display"); //get the profile display



                    //---------------------------------SEND PROFILE NAME---------------------------------
                    if (profileName != null) { //if profile name is not empty
                        // console.log("B " + profileNumber + " " + profileName);
                        await sendWithACK("B " + profileNumber + " " + profileName); //send the name to the macropad

                    }

                    //---------------------------------SEND PROFILE COLOR---------------------------------
                    if (profileColor != null) { //if profile color is not empty
                        var colorString = "";
                        for (var i = 0; i < profileColor.length; i++) {
                            if (profileColor[i] == null) profileColor[i] = 0;
                            colorString += profileColor[i] + " ";
                        }
                        // console.log("C " + profileNumber + " " + colorString);
                        await sendWithACK("C " + profileNumber + " " + colorString); //send the color to the macropad
                    }

                    //---------------------------------SEND ENCODERS---------------------------------
                    if (profileEncoders != null) { //if profile encoders is not empty
                        for (var nEncoder = 0; nEncoder < 3; nEncoder++) { //for each encoder
                            var encoderType = readFromConfig("profiles." + profileNumber + ".encoders." + nEncoder + ".type"); //get the encoder type
                            var encoderValues = readFromConfig("profiles." + profileNumber + ".encoders." + nEncoder + ".values"); //get the encoder values
                            if (encoderType == null) encoderType = 0;
                            if (encoderType == 1) {
                                //software
                            } else {
                                if (encoderValues != null) {
                                    for (var nValue = 0; nValue < 3; nValue++) { //for each value
                                        if (encoderValues[nValue] == null) encoderValues[nValue] = ""; //if value is empty, set it to empty string
                                    }
                                }

                                // console.log("E " + profileNumber + " " + nEncoder + " " + encoderType + " " + encoderValues[0] + " " + encoderValues[1] + " " + encoderValues[2]);
                                await sendWithACK("E " + profileNumber + " " + nEncoder + " " + encoderType + " " + encoderValues[0] + " " + encoderValues[1] + " " + encoderValues[2]); //wait for the acknowledgement from the macropad
                            }
                        }
                    }


                    //---------------------------------SEND KEYS---------------------------------
                    if (profileKeys != null) { //if profile keys is not empty
                        for (var nKey = 0; nKey < 6; nKey++) { //for each key
                            var keyType = readFromConfig("profiles." + profileNumber + ".keys." + nKey + ".type"); //get the key type
                            var keyValues = readFromConfig("profiles." + profileNumber + ".keys." + nKey + ".values"); //get the key values
                            if (keyType == 0) { // key combination
                                for (var nValue = 0; nValue < 3; nValue++) {
                                    keyValues[nValue] = keycodeToKeyboard(keyValues[nValue]);
                                }
                            }

                            if (keyType == null) keyType = 0;
                            if (keyValues == null) keyValues = [0, 0, 0];
                            // console.log("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]);
                            await sendWithACK("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]); //send the key to the macropad

                        }
                    }
                    //---------------------------------SEND Display---------------------------------
                    if (profileDisplay != null) { //if profile display is not empty
                        var displayType = readFromConfig("profiles." + profileNumber + ".display.type"); //get the display type
                        if (displayType == null) displayType = 1;
                        await sendWithACK("D " + profileNumber + " " + displayType); //send the display to the macropad
                    } else {}
                    await sendWithACK("S"); //send to the eeprom
                }
                console.log("Profile " + profileNumber + " sent");
            }
        } catch (e) {
            configIsSending = false;
            setSendIcon(3); //show error
            window.setTimeout(function() {
                setSendIcon(0); //show send
            }, 2000);
        }
        configIsSending = false;
        checkBeforeDisplay();
        setSendIcon(2); //show ok

    } else if (macropadConnectionStatus == false) {
        setSendIcon(3); //show error
    }

}

function setCurrentProfile(profileNumber) { // send the profile number to the macropad to set it as current profile
    if (macropadConnectionStatus && !configIsSending) { //if connected and not sending config
        sendWithACK("A " + profileNumber); //wait for the acknowledgement from the macropad
    }
}

function sendWithACK(text) { //send a command to the macropad and wait for the acknowledgement
    return new Promise(function(resolve, reject) { //return a promise
        var ackTimeout;
        var ntry = 0;

        function send() {
            configIsSending = true;
            ack = false; //acknowledgement not received
            // console.log("Sending: " + text);
            serialPortConnection.write(text); //send the command to the macropad
            console.log("Sending: " + text);
            createTimeout();
            ntry++

        }

        function createTimeout() {
            ackTimeout = window.setTimeout(function() {
                console.log("ACK TIMEOUT: new try");
                send();
            }, 3000);
        }

        send();

        var checkInterval = window.setInterval(function() { //check every 100ms
            if (ack) { //if the acknowledgement is received
                // console.log("ACK received");
                window.clearTimeout(ackTimeout); //stop the timeout
                clearInterval(checkInterval); //stop the check
                resolve(0); //resolve the promise
                configIsSending = false;
            }
            if (ntry > 3) {
                window.clearTimeout(ackTimeout); //stop the timeout
                clearInterval(checkInterval); //stop the check
                reject(1); //reject the promise
            }
        }, 50);
    });
}



var musicName = "none";
async function setTextMusic() { //set the music name

    var name = IPC.sendSync('getCurrentMedia'); //get the music name
    // name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (name.includes(musicName)) {} else {
        musicName = name;
        // document.getElementById("macropad-display").innerHTML = "" + data;
        name.replace(/[\n\r]/g, '');
        name = name.normalize("NFD").replace(/\p{Diacritic}/gu, ""); //convert to ascii
        currentTextOnScreen = name;
        await sendWithACK("T " + name); //send the music name to the macropad
    }
}

async function setTimeDisplay() {
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    var hourString = hour.toString();
    var minuteString = minute.toString();
    var secondString = second.toString();
    if (hour < 10) hourString = "0" + hourString;
    if (minute < 10) minuteString = "0" + minuteString;
    if (second < 10) secondString = "0" + secondString;
    currentTextOnScreen = hourString + ":" + minuteString;
    await sendWithACK("T " + hourString + ":" + minuteString);
}

async function setCustomDisplay() {
    var text = macropadConfig.profiles[currentProfile].display.value;
    currentTextOnScreen = text;
    await sendWithACK("T " + text);
}

var screenTextInterval;
var scrollTextInterval;
var currentScrollPosition = 0;

function textWidth(text, fontProp) {
    var tag = document.createElement('div')
    tag.style.position = 'absolute'
    tag.style.left = '-99in'
    tag.style.whiteSpace = 'nowrap'
    tag.style.font = fontProp
    tag.innerHTML = text

    document.body.appendChild(tag)
    var result = tag.clientWidth
    document.body.removeChild(tag)
    return result;
}

function scrollText() {
    document.getElementById("macropad-text").style.right = `${currentScrollPosition}px`;
    currentScrollPosition++;
    if (textWidth(currentTextOnScreen, '18px Poppins') < currentScrollPosition) {
        currentScrollPosition = -176;
    }
}

//445 --> 300

var currentTextOnScreen = "";

function checkBeforeDisplay() {
    if (!configIsSending) {
        var oldScreenText = currentTextOnScreen;
        var displayType = macropadConfig.profiles[currentProfile].display.type; //get the display type
        console.log("Display type: " + displayType);
        if (displayType == null) return;
        if (displayType == 0) {
            setTextMusic();
        } else if (displayType == 1) {
            currentTextOnScreen = macropadConfig.profiles[currentProfile].name;

        } else if (displayType == 2) {
            //send the hour to the macropad
            setTimeDisplay();
        } else if (displayType == 3) {
            setCustomDisplay();
        }

        if (oldScreenText != currentTextOnScreen) {
            //--------- update the display in the software ----------
            document.getElementById("macropad-text").innerHTML = currentTextOnScreen;
            if (currentTextOnScreen.length >= 15) {
                document.getElementById("macropad-text").classList.add("scroll");
                clearInterval(scrollTextInterval);
                scrollTextInterval = window.setInterval(scrollText, 20);
            } else {
                document.getElementById("macropad-text").classList.remove("scroll");
            }
        }
    }

}

function updateScreenText() {
    console.log("updateScreenText");
    musicName = "none";

    window.clearInterval(screenTextInterval);
    macropadConfig.profiles[currentProfile].display.type
    var displayType = macropadConfig.profiles[currentProfile].display.type; //get the display type

    //if (displayType == 0 || displayType == 2 || displayType == 3) { //need text on the macropad screen
    var displayValues = macropadConfig.profiles[currentProfile].display.values; //get the display values
    if (displayValues != null) {
        window.setTimeout(function() {
            checkBeforeDisplay();
        }, 100);
        screenTextInterval = setInterval(checkBeforeDisplay, 10000);
    }
    //}
}

async function hardReset() {
    if (macropadConnectionStatus) {
        return await sendWithACK("Z"); //send the reset command to the macropad
    }
    macropadConfig.profiles = null;
    storeConfig();
    window.location.reload();

}

var firmwareUpdateRunning = false;

class sendToMacopad {

    static async profileName(profileID, profileName) {
        if (macropadConnectionStatus) {
            setSendIcon(1);
            try {
                await sendWithACK("B " + profileID + " " + profileName); //send the name to the macropad
            } catch (e) {
                setSendIcon(3);
            }
            setSendIcon(2);
            return 1;
        } else {
            return 0;
        }

    }

    static async profileColor(profileID, color) {
        if (macropadConnectionStatus) {
            setSendIcon(1);
            var colorString = "";
            for (var i = 0; i < color.length; i++) {
                if (color[i] == null) color[i] = 0;
                colorString += color[i] + " ";
            }
            // console.log("C " + profileNumber + " " + colorString);
            try {
                await sendWithACK("C " + profileID + " " + colorString); //send the color to the macropad
            } catch (e) {
                setSendIcon(3);
            }
            setSendIcon(2);
            return 1;
        } else {
            return 0;
        }
    }


    static async display(profileID, displayType, displayValues) {
        if (macropadConnectionStatus) {
            setSendIcon(1);
            if (displayType == null) displayType = 1;
            try {
                await sendWithACK("D " + profileID + " " + displayType); //send the display to the macropad
            } catch (e) {
                setSendIcon(3);
            }
            setSendIcon(2);
        }
    }

    static async key(profileID, keyNumber, keyType, keyValues) {
        if (macropadConnectionStatus) {
            setSendIcon(1);
            var tempValues = [...keyValues];
            if (keyType == 0) { // key combination
                for (var nValue = 0; nValue < 3; nValue++) {
                    tempValues[nValue] = keycodeToKeyboard(tempValues[nValue]);
                }
            }
            if (keyType == null) keyType = 0;
            if (keyValues == null) keyValues = [0, 0, 0];
            // console.log("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]);
            try {
                await sendWithACK("K " + profileID + " " + keyNumber + " " + keyType + " " + tempValues[0] + " " + tempValues[1] + " " + tempValues[2]); //send the key to the macropad
            } catch (e) {
                setSendIcon(3);
            }
            setSendIcon(2);
        }
    }

    static async encoder(profileID, nEncoder, encoderType, encoderValues) {
        if (macropadConnectionStatus) {
            setSendIcon(1);
            var tempValues = [...encoderValues];
            if (encoderType == null) encoderType = -1;
            if (encoderType == 1) {
                //software volume
                tempValues = [0, 0, 0];
            } else {
                console.log(tempValues);
                if (encoderType == 2) { // key combination
                    for (var nValue = 0; nValue < 3; nValue++) {
                        tempValues[nValue] = keycodeToKeyboard(tempValues[nValue]);
                    }
                }
                console.log(tempValues);
            }
            if (encoderType == null) keyType = 0;
            if (encoderValues == null) tempValues = [0, 0, 0];
            // console.log("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]);
            try {
                await sendWithACK("E " + profileID + " " + nEncoder + " " + encoderType + " " + tempValues[0] + " " + tempValues[1] + " " + tempValues[2]); //wait for the acknowledgement from the macropad
            } catch (e) {
                setSendIcon(3);
            }
            setSendIcon(2);
        }
    }

    static async firmware() {
        //--------- disconnect the macropad ----------
        if (macropadConnectionStatus) {
            await sendWithACK("T Updating ...");
            serialPortConnection.close();
            macropadConnectionStatus = false;
            document.getElementById("connect-button").innerHTML = "Rechercher un MacroPad";
            updateOverviewConnectionStatus(false);
            musicName = "none";
            clearInterval(macropadInterval);
            clearInterval(screenTextInterval);
            console.log("Macropad disconnected");
        }
        //--------- disconnect the macropad ----------
        if (firmwareUpdateRunning) return;
        firmwareUpdateRunning = true;
        window.setTimeout(async function() {
            var port = readFromConfig("settings.last-port");
            if (port != null && port != "" && port != "undefined" && port.includes("COM")) { //if the port is a serial port
                console.log(firmwareUpdateRunning);
                var output = await IPC.sendSync("send-firmware", port); //send the port to the main process
                firmwareUpdateRunning = false;
                console.log(output);
                firmware.updated();
            }
        }, 3000);


    }

    static async version() {
        if (macropadConnectionStatus) {
            serialPortConnection.write("V"); //send the version to the macropad
        }
    }

}