
function addPostUploadFile(selectedValue) {
  if (selectedValue == "POST") {
    $("#chaosReportUploadFileDiv").html(`
    <div class="row" style='margin-top: 1%;'>
      <div class="col-xs-2">
        <label for="formFile" class="form-label">Upload File</label>
        <input class="form-control" type="file" id="formFile">
      </div>
    </div>
    `);
  } else {
    $("#chaosReportUploadFileDiv").html("");
  }
}

function chaosReportHttpEndpointAdd() {
  $("#addSiteAreaChaosReport").html(`
  <div class="row">
    <div class="col col-xl-10">
      <label for="chaosReportCheckSiteURL">URL</label>
      <input type='text' class='input-lg' id='chaosReportCheckSiteURL' value='' style='margin-top: 1%; width: 80%'>
    </div>
  </div>
  <div class="row">
    <div class="col col-xl-10">
      <label for="chaosReportCheckSiteURLMethod" style='margin-top: 1%;'>method</label>
      <select id="chaosReportCheckSiteURLMethod" class="input-sm" aria-label="method" onChange="addPostUploadFile(this.options[this.selectedIndex].value)">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </select>
    </div>
  </div>
  <div class="row">
    <div class="col col-xl-10">
      <div id="chaosReportUploadFileDiv"></div>
    </div>
  </div>
  <div class="row">
    <div class="col col-xl-10">  
      <label for="chaosReportCheckSiteURLHeaders">HEADERS</label>
      <input type='text' class='input-sm' id='chaosReportCheckSiteURLHeaders' value='{"Content-Type": "application/json; charset=utf-8"}' style='margin-top: 1%; margin-bottom: 1%; width: 80%;'><br>
    </div>
  </div>
  `);
}

function isValidURL(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;
  }
  return true;
} 

function headerAreLikePythonRequestHeaders(headers) {
  var headersDict = {};
  var headersArray = headers.split(",");
  for (var i = 0; i < headersArray.length; i++) {
    var header = headersArray[i].split(":");
    headersDict[header[0]] = header[1];
  }
  return headersDict;
}

function checkIfSomeItemIsEmpty(dict, except) {
  for (var key in dict) {
    if (dict[key] == "" && key != except) {
      return true;
    }
  }
  return false;
}

function sendSavedChaosReport() {

  var presetBodyDict = {
    "chaosReportAuthor": $("#chaosReportAuthor").val(),
    "chaosReportProject": $("#chaosReportProject").val(),
    "chaosReportCheckSiteURL": $("#chaosReportCheckSiteURL").val(),
    "chaosReportCheckSiteURLMethod": $("#chaosReportCheckSiteURLMethod").val(),
    "chaosReportCheckSiteURLHeaders": $("#chaosReportCheckSiteURLHeaders").val(),
    "chaosReportCheckSiteURLPayload": chaos_report_post_data
  }

  if (!isValidURL(presetBodyDict["chaosReportCheckSiteURL"])) {
    alert("Invalid URL");
    return;
  }

  if (headerAreLikePythonRequestHeaders(presetBodyDict["chaosReportCheckSiteURLHeaders"]) == false) {
    alert("Invalid headers. Insert them like this: \"Content-Type\": \"application/json; charset=utf-8\";\"Authorization\"");
    return;
  }

  if (presetBodyDict["chaosReportCheckSiteURLMethod"] == "POST" && presetBodyDict["chaosReportCheckSiteURLPayload"] == undefined) {
    alert("Please upload a file for POST method");
    return;
  }

  if (checkIfSomeItemIsEmpty(presetBodyDict, "chaosReportCheckSiteURLPayload")) {
    alert("Please fill all fields");
    return;
  }

  var oReq = new XMLHttpRequest();
  oReq.open("POST", k8s_url + "/chaos/report/save", true);

  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log("[SAVE-CHAOS-REPORT-CONF] Configuration sent to Nginx")
    }
  };;

  oReq.setRequestHeader("Content-Type", "application/json");
  console.log("[SAVE-CHAOS-REPORT-CONF] Sending configuration to Nginx: " + JSON.stringify(presetBodyDict));
  oReq.send(JSON.stringify(presetBodyDict));
  closePrepareChaosReportModal();
}

function readContentOfUploadedFile() {
  console.log("[SAVE-CHAOS-REPORT-CONF] Reading content of uploaded file");
  var file = document.getElementById("formFile").files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    //console.log("[SAVE-CHAOS-REPORT-CONF] Content of uploaded file: " + e.target.result);
    chaos_report_post_data = e.target.result;
    sendSavedChaosReport()
  };
  reader.readAsText(file);
}

function saveChaosReport() {
  console.log("[SAVE-CHAOS-REPORT-CONF] Going to save Chaos Report program");
  if ($("#chaosReportCheckSiteURLMethod").val() == "POST") {
    console.log("[SAVE-CHAOS-REPORT-CONF] Check url is POST, reading content of uploaded file and sending saved Chaos Report");
    readContentOfUploadedFile();
  } else {
    console.log("[SAVE-CHAOS-REPORT-CONF] Check url is GET, sending saved Chaos Report");
    sendSavedChaosReport();
  }
}