/* Function for managing game console */
function zoomIn() {
  if (document.getElementById("myCanvas").width != 1200) {
    document.getElementById("gameContainer").style.width = "100%"
    document.getElementById("gameContainer").style.height = "100%";
    document.getElementById("myCanvas").width = 1200;
    document.getElementById("myCanvas").height = 800;
    // document.getElementById("zoomInGameScreenInput").disabled = true;
    // document.getElementById("zoomOutGameScreenInput").disabled = false;
    document.getElementById("loadButtonGroup").style.width = "1200px";
    maxAliensPerRow = 20;
    myMainChaosMetrics.resize();
    startYforHelp = 690;
  }
}

function zoomOut() {
  if (document.getElementById("myCanvas").width > 720) {
    document.getElementById("myCanvas").width = 720;
    document.getElementById("myCanvas").height = 480;
    document.getElementById("gameContainer").style.width = "50%"
    document.getElementById("gameContainer").style.height = "50%"
    // document.getElementById("zoomInGameScreenInput").disabled = false;
    // document.getElementById("zoomOutGameScreenInput").disabled = true;
    document.getElementById("loadButtonGroup").style.width = "900px";
    maxAliensPerRow = 12;
    myMainChaosMetrics.resize();
    startYforHelp = 400;
  }
}

function controlAutoPilot() {
  if (autoPilot) {
    autoPilot = false;
    $("#controlAutoPilotButton").text("Start");
    chaos_report_switch = false;
  } else {
    autoPilot = true;
    $("#controlAutoPilotButton").text("Stop");
  }
}

function changeRandomFactor() {
  randomFactor = $("#randomFactorInput").val();
  $("#currentRandomFactor").text(randomFactor);
}

function showSpecialKeys() {
  $('#showSpecialKeysModal').modal('show');
  modal_opened = true;
}

function switchColorMode() {
  let bodyElement = document.getElementById("kinvBody");
  let buttonsLightElement = document.getElementsByClassName("btn-light");
  let textkinv = document.getElementsByClassName("text-kinv");
  let alertkinv = document.getElementsByClassName("alert-kinv");

  if (current_color_mode == "light") {
    bodyElement.style.backgroundColor = "#0a0a0a";
    current_color_mode = "dark";

    for (var i = 0; i < buttonsLightElement.length; i++) {
      console.log("[COLOR-MODE-BUTTONS] Change color of " + buttonsLightElement[i].id);
      document.getElementById(buttonsLightElement[i].id).style.backgroundColor = "#1ed931";
    }

    for (var i = 0; i < textkinv.length; i++) {
      console.log("[COLOR-MODE-TEXT-KINV] Change color of " + textkinv[i].id);
      document.getElementById(textkinv[i].id).style.color = "#1ed931";
    }

    for (var i = 0; i < alertkinv.length; i++) {
      console.log("[COLOR-MODE-ALERT-KINV] Change color of " + alertkinv[i].id);
      document.getElementById(alertkinv[i].id).style.color = "#1ed931";
      document.getElementById(alertkinv[i].id).style.backgroundColor = "#0a0a0a";
      document.getElementById(alertkinv[i].id).style.borderColor = "#ffffff";
    }

    document.getElementById("logTailRegex").style.backgroundColor = "#0a0a0a";
    document.getElementById("logTailRegex").style.color = "#ffffff";
    document.getElementById("switchColorModeLink").innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg"  style="color: #ffffff;" width="16" height="16" fill="currentColor" class="bi bi-sun-fill" viewBox="0 0 16 16">
      <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
    </svg>
    `;
    return;
  }

  if (current_color_mode == "dark") {
    bodyElement.style.backgroundColor = "#ffffff";
    current_color_mode = "light";

    for (var i = 0; i < buttonsLightElement.length; i++) {
      console.log("[COLOR-MODE-BUTTONS] Change color of " + buttonsLightElement[i].id);
      document.getElementById(buttonsLightElement[i].id).style.backgroundColor = "";
    }

    for (var i = 0; i < textkinv.length; i++) {
      console.log("[COLOR-MODE-TEXT-KINV] Change color of " + textkinv[i].id);
      document.getElementById(textkinv[i].id).style.color = "";
    }

    for (var i = 0; i < alertkinv.length; i++) {
      console.log("[COLOR-MODE-ALERT-KINV] Change color of " + alertkinv[i].id);
      document.getElementById(alertkinv[i].id).style.color = "";
      document.getElementById(alertkinv[i].id).style.backgroundColor = "";
      document.getElementById(alertkinv[i].id).style.borderColor = "";
    }

    document.getElementById("logTailRegex").style.backgroundColor = "";
    document.getElementById("logTailRegex").style.color = "";
    document.getElementById("switchColorModeLink").innerHTML = `

    <svg xmlns="http://www.w3.org/2000/svg" style="color: #ffffff;" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16">
      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
    </svg>
    `;
  }
}

function switchNamespace() {
  if (namespaces_index < namespaces.length - 1) {
    namespaces_index += 1;
  }
  else {
    namespaces_index = 0;
  }
  namespace = namespaces[namespaces_index];
  $('#currentGameNamespace').text(namespace);
  $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Change target namespace to ' + namespace + '</div>');
  aliens = [];
  pods = [];
}

function createChaosProgramButton(name, lang) {
  let btn = document.createElement("button");
  let capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  console.log("[CREATE-CHAOS-PROGRAM] Creating button for " + name);
  btn.innerHTML = capitalizedName;
  btn.type = "button";
  btn.name = "load" + capitalizedName;
  btn.id = "load" + capitalizedName;
  if (document.getElementById("load" + capitalizedName)) {
    return;
  }
  btn.style = "padding: 0% 2%;"
  btn.classList = "btn btn-light btn-sm";
  btn.addEventListener("click", function () { loadPreset(name, lang); });
  document.getElementById("loadButtonGroup").appendChild(btn);
  document.getElementById("loadButtonGroup").scrollLeft = document.getElementById("loadButtonGroup").scrollWidth;
}

function deleteChaosProgramButton(name) {
  let capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  document.getElementById("loadButtonGroup").removeChild(document.getElementById("load" + capitalizedName));
}

function setLogConsole() {
  if (log_tail_switch) {
    $("#logConsoleButton").text("Start Logs Tail");
    $('#alert_placeholder3').replaceWith(alert_div_webtail + 'Stopping log tail...</div>');
    log_tail_switch = false;
    disableLogTail();
  } else {
    $('#alert_placeholder3').replaceWith(alert_div_webtail + 'Starting log tail...</div>');
    $("#logConsoleButton").text("Stop Logs Tail");
    log_tail_switch = true;
    log_tail_div.style.display = "block";
    log_tail_screen.style.display = "block"
    setLogRegex();
    enableLogTail();
    getChaosJobsLogs();
  }
}