
function addPostUploadFile(selectedValue) {
  if (selectedValue == "POST") {
    $("#chaosReportUploadFileDiv").html(`
    <div class="row">
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
    <div class="col-xs-2">
      <label for="chaosReportCheckSite">URL</label>
      <input type='text' class='input-sm' id='chaosReportCheckSite' value='' style='margin-top: 1%;'>
    </div>
  </div>
  <div class="row">
    <div class="col-xs-2">
      <label for="chaosReportCheckSiteMethod" style='margin-top: 1%;'>method</label>
      <select id="chaosReportCheckSiteMethod" class="input-sm" aria-label="method" onChange="addPostUploadFile(this.options[this.selectedIndex].value)">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
      </select>
    </div>
  </div>
  <div class="row">
    <div class="col-xs-2">
      <div id="chaosReportUploadFileDiv"></div>
    </div>
  </div>
  <div class="row">
    <div class="col-xs-2">  
      <label for="chaosReportCheckSite">HEADERS</label>
      <input type='text' class='input-sm' id='chaosReportCheckSite' value='' style='margin-top: 1%; margin-bottom: 1%;'><br>
    </div>
  </div>
  `);
}