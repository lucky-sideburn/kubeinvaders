/* Modals Switches */
function setModalState(state) {
  modal_opened = state;
}

function showCurrentChaosContainer() {
  getCurrentChaosContainer();
  $('#currentChaosContainerModal').modal('show');
  setModalState(true);
}

function closeCurrentChaosJobModal() {
  $('#currentChaosContainerModal').modal('hide');
  setModalState(false);
}

function showSetCurrentChaosContainer() {
  $('#alert_placeholder2').text('');
  getCurrentChaosContainer();
  $('#setChaosContainerModal').modal('show');
  setModalState(true);
}

function closeSetChaosContainerModal() {
  $('#setChaosContainerModal').modal('hide');
  setModalState(false);
}

function closeSpecialKeysModal() {
  $('#showSpecialKeysModal').modal('hide');
  setModalState(false);
}

function closeKubeLinterModal() {
  $('#kubeLinterModal').modal('hide');
  setModalState(false);
}

function closeSetLoadTestModal() {
  $('#setLoadTestModal').modal('hide');
  setModalState(false);
}

function showPrepareChaosReportModal(checkbox) {
  if(checkbox.checked){
    $('#prepareChaosReportModal').modal('show');
    $("#chaosReportHeader").text("Configuration of Chaos Report for namespace: " + namespace);
    setCodeNameToTextInput("chaosReportAuthor");
    setCodeNameToTextInput("chaosReportProject");
    setModalState(true);
    chaosReportHttpEndpointAdd();
    getIngressLists();
    //$("#httpStatsCanvasDiv").style.display = "block";
  } else {
    closePrepareChaosReportModal();
  }
}

function closePrepareChaosReportModal() {
  $('#prepareChaosReportModal').modal('hide');
  document.getElementById("flagChaosReport").checked = false;
  setModalState(false);
}

function closePrepareChaosReportModalAndUncheck() {
  $('#prepareChaosReportModal').modal('hide');
  document.getElementById("flagChaosReport").checked = false;
  setModalState(false);
}