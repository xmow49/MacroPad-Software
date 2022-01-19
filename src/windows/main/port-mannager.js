const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
var usbDetect = require('usb-detection');
const { ipcMain } = require('electron');
usbDetect.startMonitoring();

usbDetect.on('add', function(device) {
    if (device.vendorId == "9025" && device.productId == "32822") {
        setTimeout(function() {
            scanSerialsPorts();
        }, 1000);

    }
});


function scanPorts() { //List all serial port and store into availablePorts
    var availablePorts = [];
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

var pingResponse = false;
var macropadConnectionStatus = false;
var macropadInterval;



async function responsesFromPort(data) {
    var stringFromSerial = data.toString();
    stringFromSerial = stringFromSerial.replace(/\r\n/g, "");

    if (stringFromSerial == "OK" || stringFromSerial == "POK") {
        ack = true;
    }


    if (stringFromSerial.charAt(0) == "A") { //if the firt char is A, its a profile number
        var profileNumber = stringFromSerial.charAt(1); //get the profile number
        profileNumber = parseInt(profileNumber); //convert to int
        onChangeProfile(profileNumber); //call the function to change the profile in the main window
    }

    if (stringFromSerial == "P" || stringFromSerial == "POK") { //its a Macropad
        // Here, the macropad is connected and a pong is received
        pingResponse = true;
        if (macropadConnectionStatus == false) { //If the macropad is not connected
            macropadConnectionStatus = true;
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
                    var result = await sendWithACK("P");
                } catch (result) {
                    macropadConnectionStatus = false;
                    clearInterval(macropadInterval);
                    updateOverviewConnectionStatus(false);
                    console.log(result);
                }
            }, 10000);

            await sendWithACK("A"); //get the current profile from the macropad

            updateScreenText(); //start the screen text update



        }

        clearInterval(checkInterval); //stop all check
        document.getElementById("port-" + currentTestingPort).checked = true;
        scanInProgress = false;
        var progressBar = document.getElementById("port-scan-progress");
        progressBar.max = 100;
        progressBar.value = 100;
        progressBar.className = "end"
        updateOverviewConnectionStatus(true);




    }

    if (macropadConnectionStatus) {
        // for (var i = 0; i < stringFromSerial.length; i++) {
        //     console.log(stringFromSerial.charCodeAt(i));
        // }


        //good mesg
        if (stringFromSerial.includes("K")) {
            var msg = stringFromSerial.replace("K", ""); //keep only the key code
            var keyCode = parseInt(msg);
            msg = "key" + keyCode;
            try { //try to find the button with key id
                var button = document.getElementById(msg);
                button.style.transform = "scale(.9)"; //animate the button
                setTimeout(function() { //wait 0.3s and stop the animation
                    button.style.transform = "scale(1)";
                }, 300);
            } catch (e) {}
        }
        console.log("From MacroPad: " + stringFromSerial);
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
            serialPortConnection.on('data', function(data) { //Add listener for recevied message from serial
                responsesFromPort(data); //and send it to this function to check the ping 
            })
            setTimeout(async function() { //wait 0.5s and send a ping to the macropad
                console.log("SENDING PING");
                await sendWithACK("P");
            }, 1000);
        }
        baudRate: 9600;
    });

}

var scanInProgress = false;
var currentTestingPort;
var checkInterval;
var testToDoCount;
var ack = false //acknowledgement from the macropad

function scanSerialsPorts() {
    if (scanInProgress == false && macropadConnectionStatus == false) {
        console.log("scanSerialsPorts");
        scanInProgress = true; //Scan in progress
        document.getElementById("scan-port-log").innerHTML = "Scan en cours ..."
        var availablePorts = scanPorts(); //Get all ports
        setTimeout(function() {
            updateGUIPortList(availablePorts) //update the list after 100ms
            testToDoCount = availablePorts.length - 1;
        }, 100);



        //Start autocheck
        currentTestingPort = -1; //start to the first port

        checkInterval = window.setInterval(function() {
            currentTestingPort++;
            if (currentTestingPort > testToDoCount) {
                clearInterval(checkInterval);
            } else {
                document.getElementById("scan-port-log").innerHTML = "Test de " + availablePorts[currentTestingPort] + " ...";
                var progressBar = document.getElementById("port-scan-progress");
                progressBar.max = testToDoCount + 1;
                progressBar.value = currentTestingPort + 1;
                progressBar.className = "progress"
                console.log("Trying: " + availablePorts[currentTestingPort] + ":" + currentTestingPort + "/" + testToDoCount);
                connectToPort(availablePorts[currentTestingPort]);
            }
        }, 2000);
        document.getElementById("scan-port-log").innerHTML = ""
        scanInProgress = false;
    }
}


function connectPopup() {
    document.getElementById("connect-macropad").style.display = "block";
    updatePopupBackgroud()
}

function connectPopupCancel() {
    document.getElementById("connect-macropad").style.display = "none";
    updatePopupBackgroud()
}

function connectPopupSave() {
    document.getElementById("connect-macropad").style.display = "none";
    updatePopupBackgroud()
}

async function sendConfig() {
    if (macropadConnectionStatus) { //if connected
        console.log("---------------------------SENDING CONFIG---------------------------");
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
                        if (keyType == null) keyType = 0;
                        if (keyValues == null) keyValues = [0, 0, 0];
                        // console.log("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]);
                        await sendWithACK("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]); //send the key to the macropad

                    }
                }

                if (profileDisplay != null) { //if profile display is not empty
                    var displayType = readFromConfig("profiles." + profileNumber + ".display.type"); //get the display type
                    if (displayType == null) displayType = 1;
                    await sendWithACK("D " + profileNumber + " " + displayType); //send the display to the macropad
                    //console.log("D " + profileNumber + " " + displayType + " " + displayValues);

                    await sendWithACK("S"); //send to the eeprom
                } else {}
            }
            console.log("---------------------------OK---------------------------");
        }

    }
}

function setCurrentProfile(profileNumber) { // send the profile number to the macropad to set it as current profile
    if (macropadConnectionStatus) { //if connected
        sendWithACK("A " + profileNumber); //wait for the acknowledgement from the macropad
    }
}

function sendWithACK(text) { //send a command to the macropad and wait for the acknowledgement
    return new Promise(function(resolve, reject) { //return a promise
        var ackTimeout;
        var ntry = 0;

        function send() {
            ack = false; //acknowledgement not received
            // console.log("Sending: " + text);
            serialPortConnection.write(text); //send the command to the macropad
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
            }
            if (ntry > 3) {
                window.clearTimeout(ackTimeout); //stop the timeout
                clearInterval(checkInterval); //stop the check
                reject(1); //reject the promise
            }
        }, 100);
    });
}

var musicName = "none";
async function setTextMusic(software) { //set the music name

    var name = IPC.sendSync('get-music-software', "spotify"); //get the music name
    name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (name.includes(musicName)) {

    } else {
        musicName = name;
        // document.getElementById("macropad-display").innerHTML = "" + data;
        name.replace(/[\n\r]/g, '');
        document.getElementById("macropad-text").innerHTML = name;
        await sendWithACK("T " + name); //send the music name to the macropad
    }
}

var screenTextInterval;

function updateScreenText() {
    window.clearInterval(screenTextInterval);
    var displayType = readFromConfig("profiles." + currentProfile + ".display.type"); //get the display type
    if (displayType == 0 || displayType == 2 || displayType == 3) { //need text on the macropad screen
        var displayValues = readFromConfig("profiles." + currentProfile + ".display.value"); //get the display values
        if (displayValues != null) {
            screenTextInterval = setInterval(function() {
                    if (currentProfile == 0) {
                        setTextMusic("spotify"); //-----------------------------------------------------------------------------TODO
                    }
                },
                10000);
        }

    }
}