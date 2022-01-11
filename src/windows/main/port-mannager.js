const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');



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

function responsesFromPort(data) {
    var stringFromSerial = data.toString();
    if (data.includes("P")) { //its a Macropad
        // Here, the macropad is connected and a pong is received
        pingResponse = true;
        macropadConnectionStatus = true;
        console.log("FOUND");
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
        //key annimation when macropad key is pressed
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
        } else if (stringFromSerial.includes("1")) {
            ack = true;
        }




        //for each caracter in the string, display it in the console
        // for (var i = 0; i < stringFromSerial.length; i++) {
        //     var char = stringFromSerial.charAt(i);
        //     //display the char and ascii code in the console
        //     console.log(char + " : " + stringFromSerial.charCodeAt(i));
        // }

        stringFromSerial = stringFromSerial.replace(/[\n\r]+/g, '');

        if (stringFromSerial == "1") {
            ack = true;
        }



        console.log("From MacroPad: " + stringFromSerial);
    }
}


function updateOverviewConnectionStatus(status) {
    if (status) {
        document.getElementById("scan-port-log").innerHTML = "Connecté au MacroPad."
        document.getElementById("connect-status").className = "online"; //Change the status to online in the overview menu
        var text = document.getElementById("connect-status-button").innerHTML;
        text.replace("Déconnecté", "Connecté");
        document.getElementById("connect-status-button").innerHTML = text;
    } else {
        document.getElementById("connect-status").className = "offline"; //Change the status to offline in the overview menu
        var text = document.getElementById("connect-status-button").innerHTML;
        text.replace("Connecté", "Déconnecté");
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
            setTimeout(function() { //wait 0.5s and send a ping to the macropad
                serialPortConnection.write("P");
            }, 500);
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
    if (scanInProgress) {
        //if already scan, do nothing
    } else {
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
    console.log(SerialPort.list());

    if (macropadConnectionStatus) { //if connected
        for (var profileNumber = 0; profileNumber < 6; profileNumber++) { //for each profile

            if (readFromConfig("profiles." + profileNumber) != null) { //if profile is not empty
                var profileName = readFromConfig("profiles." + profileNumber + ".name"); //get the profile name
                var profileColor = readFromConfig("profiles." + profileNumber + ".color"); //get the profile color
                var profileEncoders = readFromConfig("profiles." + profileNumber + ".encoders"); //get the profile encoders
                var profileKeys = readFromConfig("profiles." + profileNumber + ".keys"); //get the profile keys 

                if (profileName != null) { //if profile name is not empty
                    console.log("B " + profileNumber + " \"" + profileName);
                    serialPortConnection.write("B " + profileNumber + " \"" + profileName); //send the name to the macropad
                    await waitACK();
                }

                if (profileColor != null) { //if profile color is not empty
                    var colorString = "";
                    for (var i = 0; i < profileColor.length; i++) {
                        colorString += profileColor[i] + " ";
                    }
                    console.log("C " + profileNumber + " " + colorString);
                    serialPortConnection.write("C " + profileNumber + " " + colorString); //send the color to the macropad
                    await waitACK();
                }

                if (profileEncoders != null) { //if profile encoders is not empty
                    for (var nEncoder = 0; nEncoder < 6; nEncoder++) { //for each encoder
                        var encoderType = readFromConfig("profiles." + profileNumber + ".encoders." + nEncoder + ".type"); //get the encoder type
                        var encoderValues = readFromConfig("profiles." + profileNumber + ".encoders." + nEncoder + ".values"); //get the encoder values
                        if (encoderType == null) encoderType = 0;
                        if (encoderValues == null) encoderValues = [0, 0, 0];
                        console.log("E " + profileNumber + " " + nEncoder + " " + encoderType + " " + encoderValues[0] + " " + encoderValues[1] + " " + encoderValues[2]);
                        serialPortConnection.write("E " + profileNumber + " " + nEncoder + " " + encoderType + " " + encoderValues[0] + " " + encoderValues[1] + " " + encoderValues[2]); //send the encoder to the macropad
                        await waitACK(); //wait for the acknowledgement from the macropad
                    }
                }

                if (profileKeys != null) { //if profile keys is not empty
                    for (var nKey = 0; nKey < 6; nKey++) { //for each key
                        var keyType = readFromConfig("profiles." + profileNumber + ".keys." + nKey + ".type"); //get the key type
                        var keyValues = readFromConfig("profiles." + profileNumber + ".keys." + nKey + ".values"); //get the key values
                        if (keyType == null) keyType = 0;
                        if (keyValues == null) keyValues = [0, 0, 0];
                        console.log("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]);
                        serialPortConnection.write("K " + profileNumber + " " + nKey + " " + keyType + " " + keyValues[0] + " " + keyValues[1] + " " + keyValues[2]); //send the key to the macropad
                        await waitACK(); //wait for the acknowledgement from the macropad
                    }
                }

            } else {}
        }
    }

}


function waitACK() { //wait for the acknowledgement from the macropad
    return new Promise(function(resolve, reject) { //return a promise
        ack = false; //acknowledgement not received
        var checkInterval = window.setInterval(function() { //check every 100ms
            if (ack) { //if the acknowledgement is received
                clearInterval(checkInterval); //stop the check
                resolve(); //resolve the promise
            }
        }, 100);
    });
}