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

function responsesFromPort(data) {
    if (data.includes("pong")) { //its a Macropad
        pingResponse = true;
        console.log("FOUND");
        clearInterval(checkInterval); //stop all check
        document.getElementById("port-" + currentTestingPort).checked = true;
        scanInProgress = false;
        var progressBar = document.getElementById("port-scan-progress");
        progressBar.max = 100;
        progressBar.value = 100;
        progressBar.className = "end"
        document.getElementById("scan-port-log").innerHTML = "Connecté au MacroPad."
    }
}

function connectToPort(port) {

    currentTest = SerialPort(port, function(err) { //test to connect
        if (err) { //if no work
            console.log("ERROR TO CONNECT");
        } else { //if connected
            console.log("Connected!");
            currentTest.on('data', function(data) { //Add listener for recevied message from serial
                responsesFromPort(data); //and send it to this function to check the ping 
            })
            setTimeout(function() { //wait 0.5s and send a ping to the macropad
                currentTest.write("ping");
            }, 500);
        }
        baudRate: 9600;
    });

}

var scanInProgress = false;
var currentTestingPort;
var checkInterval;
var testToDoCount;

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




function connectPopupCancel() {

    document.getElementById("connect-macropad").style.display = "none";
}

function connectPopupSave() {
    document.getElementById("connect-macropad").style.display = "none";
}