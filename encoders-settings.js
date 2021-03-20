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