var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 7;
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;
var spaceshipHeight = 60;
var spaceshipWidth = 60;
var spaceshipX = (canvas.width-spaceshipWidth)/2;
var spaceshipY = (canvas.height-spaceshipHeight)/2;
var clu_endpoint = "endpoint_placeholder";
var clu_insicure = "insecure_endpoint_placeholder";
var k8s_url = "";

if (clu_insicure == "true") {
    k8s_url = "http://" + clu_endpoint;
}
else {
    k8s_url = "https://" + clu_endpoint;
}

var namespaces = [];
var namespaces_index = 0;
var namespace = namespaces[namespaces_index];
var endpoint = "";
var modal_opened = false;
var autoPilot = false;
var autoPilotDirection = 0;
var spaceshipxOld = 0;
var randomFactor = 10;
// pods list from kubernetes
var pods = [];
var game_mode_switch = false;
var programming_mode_switch = false; 
var now = "";
var game_buttons = document.getElementById("game-buttons");
var game_screen = document.getElementById("game-screen");
var chaos_program_screen = document.getElementById("chaos-program-screen");
var programming_mode_buttons = document.getElementById("programming-mode-buttons");
var log_tail_switch = false;
var log_tail_div = document.getElementById("logTailDiv");
var log_tail_screen = document.getElementById("logTailScreen");
var random_code = (Math.random() + 1).toString(36).substring(7);

// nodes list from kubernetes
var nodes = [];

var mergeNodesAndPods = [];

// Hash of aliens related to pods or nodes
var aliens = [];
var aliensWidth = 40;
var aliensHeight = 40;

// Button vars
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

// The is true the rocket can move
var shot = false;

// Keep track of rocket launch
var rocketLaunched = false;

// Rocket position
var rocketX = -400;
var rocketY = -400;
var rocketSpeed = 7;

var collisionDetected = false;

// Aliens Vars. Keep track of Y positions where there is an alien.
var aliensY = [];
var aliensIncrementY = 50;

var shuffle = true;
var help = false;
var chaos_nodes = true;
var chaos_pods = true;
var log_tail_alert = '<div id="alert_placeholder3" style="margin-top: 2%; margin-bottom: 1%; background-color: #161616; color: #ffffff" class="alert" role="alert">';
var log_tail_alert_no_pixel = '<div id="alert_placeholder3" style="margin-top: 2%; margin-bottom: 1%; background-color: #161616; color: #ffffff; font-family: Courier, monospace;" class="alert" role="alert">';

var alert_div = '<div id="alert_placeholder" style="margin-top: 2%; margin-bottom: 1%; background-color: #161616; color: #ffffff" class="alert" role="alert">';
var alert_div_webtail = '<div id="alert_placeholder3" style="margin-top: 2%; background-color: #161616; color: #ffffff" class="alert" role="alert">';

var kubelinter = '';
var showPodName = true
var latestPodNameY = '';
var namespacesJumpFlag = false;
var namespacesJumpStaus = 'Disabled';

var latest_preset_name = "";
var latest_preset_lang = "";
var codename = getCodeName();
const codename_regex = /chaos-codename:\ [a-zA-Z_]*/g;
const chaos_job_regex = /chaos_jobs_status.*/g;
var codename_configured = false;
var chaos_jobs_status = new Map();

var current_color_mode = "light";

function rand_id() {
    return getRandomInt(9999);
}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function getCodeName() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            codename = this.responseText.trim();
            if (codename == "") {
                $('#alert_placeholder').replaceWith(alert_div + 'Error getting codename from backend. </div>');
                codename = "error_fix_getcodename_from_backend";
            }
        }
    };;
    oReq.open("GET", k8s_url + "/codename");
    oReq.send();
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
    btn.addEventListener("click", function(){ loadPreset(name, lang); });
    document.getElementById("loadButtonGroup").appendChild(btn); 
    document.getElementById("loadButtonGroup").scrollLeft = document.getElementById("loadButtonGroup").scrollWidth;
}

function deleteChaosProgramButton(name) {
    let capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    document.getElementById("loadButtonGroup").removeChild(document.getElementById("load" + capitalizedName)); 
}

function getSavedPresets() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if ((this.responseText.trim() != "nil") && (this.responseText.trim() != "")) {
                console.log("[GET-PRESETS] Response from backend: <" + this.responseText.trim() + ">");
                var savedPresets = this.responseText.split(",");
                for (i = 0; i < savedPresets.length; i++) {
                    var currentPresetName = savedPresets[i].split("_")[1];
                    currentPresetName = currentPresetName.charAt(0).toUpperCase() + currentPresetName.slice(1);
                    //console.log("[GET-PRESETS] computing preset: " + currentPresetName);
                    var buttonId = "load" + currentPresetName.trim();
                    // console.log("[GET-PRESETS] Change border color of buttonId: " + buttonId);
                    // console.log(document.getElementById(buttonId));
                    if (document.getElementById(buttonId) == null){
                        console.log("[GET-PRESETS] Appending button to loadButtonGroup. id: " + buttonId + " presetname: " + currentPresetName.trim());
                        latest_preset_lang = "k-inv";
                        createChaosProgramButton(currentPresetName.trim(), latest_preset_lang);                      
                    } else {
                        // document.getElementById(buttonId).classList.remove('btn-light');
                        // document.getElementById(buttonId).classList.add('btn-light-saved');
                    }
                }
            } else {
                console.log("[GET-PRESETS] There is no saved presets in Redis");
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/loadpreset/savedpresets");
    oReq.send();
}

function loadSavedPreset(tool, lang, defaultpreset) {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (this.responseText.trim() != "nil") {
                $("#currentLoadTest").val(this.responseText.trim());
            } else {
                $("#currentLoadTest").val(defaultpreset);
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/loadpreset?name=" + tool + "&lang=" + lang);
    oReq.send()
    var now = new Date().toLocaleString().replace(',','')
    $('#alert_placeholder_programming_mode').replaceWith(alert_div + '[' + now + '] Open preset for ' + tool + '</div>');
    //$('#alert_placeholder').replaceWith(alert_div + '[' + now + '] Open preset for ' + tool + '</div>');
}

function resetPreset(kind) {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            let capitalizedPreset = latest_preset_name.charAt(0).toUpperCase() + latest_preset_name.slice(1);
            let buttonId = "load" + capitalizedPreset;
            // document.getElementById(buttonId).classList.remove('btn-light-saved');
            // document.getElementById(buttonId).classList.add('btn-light');
            closeSetLoadTestModal();
            getSavedPresets();
            if (kind == 'k-inv') {
                console.log("[DELETE-K-INV-PROGRAM] " + latest_preset_name + " deleted");
                deleteChaosProgramButton(latest_preset_name);
            }
            else {
                console.log("[RESET-PRESETS] " + latest_preset_name + " restored with default preset");
            }
            var now = new Date().toLocaleString().replace(',','')
            $('#alert_placeholder_programming_mode').replaceWith(alert_div + '[' + now + '] ' + latest_preset_name + ' preset has been restored with default code</div>');
            //$('#alert_placeholder').replaceWith(alert_div + '[' + now + '] ' + latest_preset_name + ' preset has been restored with default code</div>');
        }
    };;
    if (kind == 'k-inv') {
        console.log("[RESET-PRESETS] Deleting " + latest_preset_name + " lang " + latest_preset_lang);
    }
    oReq.open("POST", k8s_url + "/chaos/loadpreset/reset?name="+ latest_preset_name.toLowerCase() + "&lang="+ latest_preset_lang);
    oReq.send({});
}

function savePreset(action) {
    console.log("[SAVE-PRESET-CHAOSPROGRAM] Saving item...");
    var presetName = "";
    presetBody = $("#currentLoadTest").val();
    console.log("[SAVE-PRESET-CHAOSPROGRAM] Saving " + presetBody);

    if (action == "save-chaos-program") {
        presetLang = "k-inv";
        presetName = codename + "-" + rand_id();
        latest_preset_lang = "k-inv";
        console.log("[SAVE-PRESET-CHAOSPROGRAM] lang: " + presetLang + " name:" + presetName);
        presetBody =  $('#chaosProgramTextArea').val();
        document.getElementById("resetToDefaultButton").style.display = "none";
        document.getElementById("deleteChaosProgramButton").style.display = "block";
    }
    else if (latest_preset_lang == "k-inv") {
        presetLang = "k-inv";
        presetName = codename;
        latest_preset_lang = "k-inv";
        console.log("[SAVE-PRESET-CHAOSPROGRAM] lang: " + presetLang + " name:" + codename);
        presetBody = $('#currentLoadTest').val();
        document.getElementById("resetToDefaultButton").style.display = "none";
        document.getElementById("deleteChaosProgramButton").style.display = "block";
    }
    else {
        presetLang = latest_preset_lang;
        presetName = latest_preset_name;    
        document.getElementById("resetToDefaultButton").style.display = "block";
        document.getElementById("deleteChaosProgramButton").style.display = "none";
    }

    //console.log("Saving preset. name:" + presetName + ", lang:" + presetName + ", body: " + presetBody);
    var oReq = new XMLHttpRequest();

    oReq.open("POST", k8s_url + "/chaos/loadpreset/save?name=" + presetName + "&lang=" + presetLang, true);

    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200 && (action == "apply" || action == "save-chaos-program")) {
            if (latest_preset_lang == "k-inv") {
                console.log("[SAVE-PRESET-CHAOSPROGRAM] Payload: " + $('#currentLoadTest').val());
                if ($('#currentLoadTest').val() != "") {
                    presetBody = $('#currentLoadTest').val();
                } 
                   
                //$('#chaosProgramTextArea').val(presetBody);
                
                document.getElementById("chaosProgramTextArea").value = presetBody;
            } 
            else {
                presetBody = $('#chaosProgramTextArea').val(`chaos-codename: ${codename}
jobs:
  ${presetName}-job:
    additional-labels:
        chaos-controller: kubeinvaders
        chaos-lang: ${presetLang}
        chaos-type: loadtest
        chaos-codename: ${codename}
    image: docker.io/luckysideburn/chaos-exec:v1.0.4
    command: bash
    args:
    - start.sh
    - ${presetLang}
    - code=${btoa(presetBody).trim()}

experiments:
- name: ${presetName}-exp
  job: ${presetName}-job
  loop: 5`);
            }
        }
    };;

    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.send(presetBody);
    closeSetLoadTestModal();
    
    if (action != "save-chaos-program") {
        let presetNameCapitalized = presetName.charAt(0).toUpperCase() + presetName.slice(1);
        var buttonId = "load" + presetNameCapitalized.trim();
        // document.getElementById(buttonId).classList.remove('btn-light');
        // document.getElementById(buttonId).classList.add('btn-light-saved');
    }
    else {
        console.log("[SAVE-PRESET-CHAOSPROGRAM] Creating new button for lang: " + presetLang + " name:" + presetName);
        createChaosProgramButton(presetName, 'k-inv'); 
    }

    getSavedPresets();

    if (action == "apply" && programming_mode_switch == false){
        startProgrammingMode();
    }
}

function drawChaosProgramFlow() {
    var chaosProgram = "";
    chaosProgram = $('#chaosProgramTextArea').val();

    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/chaos/programs/json-flow", true);

    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (isJsonString(this.responseText)){
                var flow = JSON.parse(this.responseText);
                var flow_html = "";
                let i = 0;
                var times = "";
                $('#chaosProgramFlow').html("");

                while (i < flow["experiments"].length) {
                    if (flow["experiments"][i]["loop"] == 1){
                        times = "once";
                    }
                    else if (flow["experiments"][i]["loop"] == 2) {
                        times = "twice"
                    }
                    else {
                        times = flow["experiments"][i]["loop"] + " times"
                    }
                    console.log(flow_html);
                    if (current_color_mode == "light") {
                        flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #000000; border-width: 1.5px;">Do ' + flow["experiments"][i]["name"] + ' ' + times + '</div></div>';
                    }
                    else {
                        flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #ffffff; color: #1ed931; background-color: #0a0a0a; border-width: 1.5px;">Do ' + flow["experiments"][i]["name"] + ' ' + times + '</div></div>';
                    }
                    search_job = codename + ":" + flow["experiments"][i]["name"]

                    flow_html = flow_html + '<img src="images/down-arrow.png" width="30" height="30" style="margin-bottom: 2%;">';

                    //console.log("Search " + search_job);
                    for (let [key, value] of chaos_jobs_status) {
                        if (key.search(search_job) != -1 ) {
                            if (current_color_mode == "light") {
                                flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #000000; border-width: 1.5px;">[' + key.split(":")[2] + '] Status: ' + value + '</div></div>';
                            } else {
                                flow_html = flow_html + '<div class="row"><div class="alert alert-light alert-kinv" id="' +  random_code + Math.floor(Math.random() * 9999) +'" role="alert" style="border-color: #ffffff; color: #1ed931; background-color: #0a0a0a; border-width: 1.5px;">[' + key.split(":")[2] + '] Status: ' + value + '</div></div>';
                            }
                        }
                    }
                    i++;
                }
                $('#chaosProgramFlow').html(flow_html);
            }
            else {
                $('#chaosProgramFlow').html(this.responseText);  
            }
        }
    };;

    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.send(chaosProgram);
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}

function getMetrics() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        var lines = this.responseText.split('\n');
        for (var i = 0;i < lines.length;i++){
            metric = lines[i].split(' ');
            if (metric[0] == "chaos_node_jobs_total") {
                chaos_jobs_total
                $('#chaos_jobs_total').text(metric[1]);
            }
            else if (metric[0] == "deleted_pods_total") {
                $('#deleted_pods_total').text(metric[1]);            
            }
            else if (metric[0] == "fewer_replicas_seconds") {
                $('#fewer_replicas_seconds').text(metric[1]);            
            }
            else if (metric[0] == "latest_fewer_replicas_seconds") {
                $('#latest_fewer_replicas_seconds').text(metric[1]);            
            }
            else if (metric[0] == "pods_not_running_on_selected_ns") {
                $('#pods_not_running_on').text(metric[1]);            
            }
            else if (metric[0] == "pods_match_regex:" + random_code) {
                $('#pods_match_regex').text(metric[1]);            
            }
            else if (metric[0].match(chaos_job_regex)) {
                metrics_split = metric[0].split(":");
                chaos_jobs_status.set(metrics_split[1] + ":" + metrics_split[2] + ":" +  metrics_split[3], metric[1]);
            }
            else if (metric[0] == "current_chaos_job_pod") {
                $('#current_chaos_job_pod').text(metric[1]);
            }
        }
    };;
    oReq.open("GET", k8s_url + "/metrics");
    oReq.send();
}

function getChaosJobsLogs() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (log_tail_switch) {
                if (this.responseText.trim() == "null") {
                    document.getElementById("logTailDiv").innerHTML = "Logs has been cleaned...";
                } else {
                    document.getElementById("logTailDiv").innerHTML = "";
                    document.getElementById("logTailDiv").innerHTML = this.responseText;
                }
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/logs?logid=" + random_code);
    oReq.send();
    keepAliveJobsLogs();
}

function keepAliveJobsLogs() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (!this.responseText.toLowerCase().match(/.*null.*/)) {
                $('#alert_placeholder3').replaceWith(log_tail_alert_no_pixel + this.responseText.replace("nil", "") + '</div>');
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/logs/keepalive?logid=" + random_code);
    oReq.send();
}

function runKubeLinter() {
    $('#kubeLinterModal').modal('show');
    modal_opened = true;
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        kubelinter = this.responseText;
        result_parsed = JSON.stringify(JSON.parse(kubelinter), null, 4);
        $('#currentKubeLinterResult').text(result_parsed);
    };;
    oReq.open("GET", k8s_url + "/kube/kube-linter?namespace=" + namespace);
    oReq.send();
}

function getNamespaces() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        namespaces = this.responseText;
        namespaces = namespaces.split(",");
        namespace = namespaces[namespaces_index];
    };;
    oReq.open("GET", k8s_url + "/kube/namespaces");
    oReq.send();
}

function getEndpoint() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        endpoint = this.responseText;
    };;
    oReq.open("GET", k8s_url + "/kube/endpoint");
    oReq.send();
}

function getCurrentChaosContainer() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        job_parsed = JSON.stringify(JSON.parse(this.responseText), null, 4);
        $('#currentChaosContainerYaml').text(job_parsed);
        $('#currentChaosContainerJsonTextArea').val(job_parsed);
    };;
    oReq.open("GET", k8s_url + "/kube/chaos/containers?action=container_definition");
    oReq.send();
}

function enableLogTail() {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/kube/chaos/containers?action=enable_log_tail&id=" + random_code, true);
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            $('#alert_placeholder3').replaceWith(log_tail_alert + 'Logs tail started </div>');
        }
    };;
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.send("{}");
    setLogRegex();
}

function disableLogTail() {
    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/kube/chaos/containers?action=disable_log_tail&id=" + random_code, true);
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            $('#alert_placeholder3').replaceWith(log_tail_alert + 'Logs tail stopped </div>');
        }
    };;
    oReq.setRequestHeader("Content-Type", "application/json");
    // TODO: send payload for auth...
    oReq.send("foobar");
}

function setLogRegex() {
    log_tail_div.style.display = "block";
    $('#alert_placeholder3').replaceWith(log_tail_alert + 'Setting regex for filtering log source (by pod name)</div>');
    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/kube/chaos/containers?action=set_log_regex&id=" + random_code, true);
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            $('#alert_placeholder3').replaceWith(log_tail_alert + 'New regex has been configured</div>');
        }
    };;
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.send($('#logTailRegex').val());
}

function setChaosContainer() {
    if (!IsJsonString($('#currentChaosContainerJsonTextArea').val())) {
        $('#alert_placeholder2').text('JSON syntax not valid.');
    }
    else {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", k8s_url + "/kube/chaos/containers?action=set", true);

        oReq.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                $('#alert_placeholder2').text('New container definition has been saved.');
            }
        };;
        oReq.setRequestHeader("Content-Type", "application/json");
        oReq.send($('#currentChaosContainerJsonTextArea').val());
    }
}

function runChaosProgram() {
    chaosProgram = $('#chaosProgramTextArea').val();
    chaosProgramWithCodename = chaosProgram.replace(codename_regex, "chaos-codename: " + codename);
    $('#chaosProgramTextArea').val(chaosProgramWithCodename);
    codename_configured = true;

    var now = new Date().toLocaleString().replace(',','')
    $('#alert_placeholder_programming_mode').replaceWith(alert_div + 'Chaos Program launched at ' + now + ' </div>');

    var oReq = new XMLHttpRequest();
    oReq.open("POST", k8s_url + "/kube/chaos/programming_mode?id=" + random_code, true);
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            now = new Date().toLocaleString().replace(',','')
            $('#alert_placeholder_programming_mode').replaceWith(alert_div + 'Chaos Program completed at ' + now + ' </div>');
        }
    };;
    oReq.setRequestHeader("Content-Type", "application/json");
    oReq.send($('#chaosProgramTextArea').val());
}

function startChaosNode(node_name) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Launched chaos job against ' + node_name + '</div>');
    };;
    $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Start chaos job against ' + node_name + '</div>');
    oReq.open("GET", k8s_url + "/kube/chaos/nodes?nodename=" + node_name + "&namespace=" + namespace);
    oReq.send();
}

function deletePods(pod_name) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Kill ' + pod_name + '</div>');
    };;
    oReq.open("GET", k8s_url + "/kube/pods?action=delete&pod_name=" + pod_name + "&namespace=" + namespace);
    oReq.send();
}

function getPods() {
    if (chaos_pods) {
        var oReq = new XMLHttpRequest();
        oReq.onload = function () {
            json_parsed = JSON.parse(this.responseText);
            if (nodes && nodes.length > 0) {
                pods = json_parsed["items"].concat(nodes);
            } else {
                pods = json_parsed["items"];
            }
        };;
        oReq.open("GET", k8s_url + "/kube/pods?action=list&namespace=" + namespace);
        oReq.send();
    }
    else {
        if (nodes && nodes.length > 0) {
            pods = nodes;
        } else {
            pods = [];
        }    
    }
}

function getNodes() {
    if (chaos_nodes) {
        var oReq = new XMLHttpRequest();
        oReq.onload = function () {
            json_parsed = JSON.parse(this.responseText);
            nodes = json_parsed["items"];
        };;
        oReq.open("GET", k8s_url + "/kube/nodes");
        oReq.send();
    }
    else {
        nodes = []
    }
}

window.setInterval(function getKubeItems() {
    if (game_mode_switch) {
        getNodes();
        getPods();
    }
}, 1000)

function keyDownHandler(e) {
    if (!modal_opened && game_mode_switch) {
        e.preventDefault();
        if(e.key == "Right" || e.key == "ArrowRight") {
            rightPressed = true;
        }
        else if(e.key == "Left" || e.key == "ArrowLeft") {
            leftPressed = true;
        }
        if(e.key == "Up" || e.key == "ArrowUp") {
            upPressed = true;
        }
        else if(e.key == "Down" || e.key == "ArrowDown") {
            downPressed = true;
        }
        else if(e.keyCode == 83) {
            if (shuffle) {
                shuffle = false;
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Disable shuffle</div>');
            }
            else {
                shuffle = true
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Enable shuffle</div>');
            }
        }
        else if(e.keyCode == 32) {
            shot = true
        }
        else if(e.keyCode == 78) {
            switchNamespace();
        }
        else if(e.keyCode == 72) {
            if (help) {
                help = false;
            }
            else {
                help = true
            }
        }
        else if(e.keyCode == 67) {
            if (chaos_nodes) {
                chaos_nodes = false;
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Hide nodes</div>');

            }
            else {
                chaos_nodes = true
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Show nodes</div>');
            }
        }
        else if(e.keyCode == 80) {
            if (chaos_pods) {
                chaos_pods = false;
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Hide pods</div>');
            }
            else {
                chaos_pods = true
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Show pods</div>');
            }
        }
    }
}

function switchNamespace() {
    if (namespaces_index < namespaces.length-1) {
        namespaces_index +=1 ;
    }
    else {
        namespaces_index = 0;
    }
    namespace = namespaces[namespaces_index];
    $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Change target namespace to ' + namespace + '</div>');
    aliens = [];
    pods = [];
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
    else if(e.key == "Up" || e.key == "ArrowUp") {
        upPressed = false;
    }
    else if(e.key == "Down" || e.key == "ArrowDown") {
        downPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function drawAlien(alienX, alienY, name) {
    var image = new Image(); // Image constructor
    if (contains(nodes, name)) {
        image.src = './images/k8s_node.png';
        ctx.drawImage(image, alienX, alienY, 30, 40);
    }
    else {
        image.src = './images/sprite_invader.png';
        ctx.font = '8px pixel';
        ctx.drawImage(image, alienX, alienY, 40, 40);
        if (showPodName) {
            ctx.fillText(name.substring(0, 19) + '..', alienX, alienY + 40);
        }
    }
    ctx.closePath();
}

function checkRocketAlienCollision() {
    if (contains(aliensY, rocketY)) {
        var i;
        for (i=aliens.length - 1; i >= 0; i--) {
            if (aliens[i]["active"] && (rocketY - aliens[i]["y"] < 5)) {
                var rangeX = []
                rangeX.push(aliens[i]["x"]);

                for (k=aliens[i]["x"]; k<aliens[i]["x"]+aliensWidth; k++) {
                    rangeX.push(k);
                }
                
                if(contains(rangeX, rocketX)) {
                    collisionDetected = true;
                    aliens[i]["active"] = false;
                    if (contains(nodes, aliens[i]["name"])) {
                        startChaosNode(aliens[i]["name"]);
                        aliens[i]["name"] = "killed_pod";
                    }
                    else {
                        deletePods(aliens[i]["name"]);
                        aliens[i]["name"] = "killed_pod";
                    }
                    return true;
                }
            }
        } 
    }
    return false;
}

function shuffleAliens() {
    pods = pods.sort(() => Math.random() - 0.5)
}

function drawRocket() {
    var image = new Image(); // Image constructor
    image.src = './images/kuberocket.png';
    ctx.drawImage(image, rocketX, rocketY, 20, 20);
    ctx.closePath();

    if (checkRocketAlienCollision()) {
        rocketY = -100;
        rocketX = -100;
        collisionDetected = false;
        return
    }

    if(shot && rocketLaunched) {
        if (rocketY < 0) {
            shot = false;
            rocketLaunched = false;
        }
        else {
            rocketY = rocketY -= rocketSpeed;
        }
    }
    else {
        rocketX = spaceshipX + (spaceshipWidth / 2);
        rocketY = spaceshipY;
        rocketLaunched = true
    }
}

function drawSpaceship() {
    var image = new Image(); // Image constructor
    image.src = './images/spaceship.png';
    ctx.drawImage(image, spaceshipX, spaceshipY, 60, 60);
    ctx.closePath();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
window.setInterval(function draw() {
    if (namespacesJumpFlag){
        randNamespaceJump(1, 10, 8);
    }
}, 1000)

window.setInterval(function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpaceship();
    
    if (shot && !collisionDetected) {
        drawRocket();
    }

    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy > canvas.height-ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }
    
    if (autoPilot){
        spaceshipY = 340;
        
        if (getRandomInt(100) < randomFactor) {
            shot = true;
        }
        
        if (autoPilotDirection == 0) {
            autoPilotDirection = getRandomInt(canvas.width-spaceshipWidth);
            spaceshipxOld = spaceshipX;
        } 
        else if ((spaceshipX == autoPilotDirection)) {
            autoPilotDirection = getRandomInt(canvas.width-spaceshipWidth);
            spaceshipxOld = spaceshipX;
        }
        else if ((autoPilotDirection < spaceshipxOld) && (spaceshipX < autoPilotDirection)) {
            autoPilotDirection = getRandomInt(canvas.width-spaceshipWidth);
            spaceshipxOld = spaceshipX;
        }
        else if ((autoPilotDirection > spaceshipxOld) && (spaceshipX > autoPilotDirection)) {
            autoPilotDirection = getRandomInt(canvas.width-spaceshipWidth);
            spaceshipxOld = spaceshipX;
        }
        else {
            if (autoPilotDirection > spaceshipX) {
                spaceshipX += 5;
            }
            else {
                spaceshipX -= 5;
            }
        }
    }

    if(rightPressed) {
        spaceshipX += 3;
        if (spaceshipX + spaceshipWidth > canvas.width) {
            spaceshipX = canvas.width - spaceshipWidth;
        }
    }
    else if(leftPressed) {
        spaceshipX -= 3;
        if (spaceshipX < 0) {
            spaceshipX = 0;
        }
    }

    if(upPressed) {
        spaceshipY -= 3;
        if (spaceshipY < 0) {
            spaceshipY = 0;
        }
    }

    else if (downPressed) {
        spaceshipY += 3;
        if (spaceshipY + spaceshipHeight > canvas.height) {
            spaceshipY = canvas.height - spaceshipHeight;
        }
    }
    
    for (i=0; i<aliens.length; i++) {
        if (aliens[i]["active"]) {
            drawAlien(aliens[i]["x"], aliens[i]["y"], aliens[i]["name"]);
        }
    }
    ctx.fillStyle = 'white';
    ctx.font = '16px pixel';

    ctx.fillText('Cluster: ' + endpoint, 10, 390);
    ctx.fillText('Current Namespace: ' + namespace, 10, 410);
    ctx.fillText('Alien Shuffle: ' + shuffle, 10, 430);
    ctx.fillText('Auto Namespaces Switch: ' + namespacesJumpStaus, 10, 450);

    ctx.fillText('press \'h\' for help!', 10, 470);

    if (help) {
        ctx.fillText('h => Activate or deactivate help', 10, 280);
        ctx.fillText('s => Activate or deactivate shuffle for aliens', 10, 300);
        ctx.fillText('n => Change namespace', 10, 320);
        ctx.fillText('p => Activate or deactivate chaos engineering against pods', 10, 340);
        ctx.fillText('c => Activate or deactivate chaos engineering against nodes', 10, 360);
    }
}, 10)

function buttonShuffleHelper() {
    if (shuffle) {
        shuffle = false;
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Shuffle Disable</div>');
        $("#buttonShuffle").text("Enable Shuffle");
    }
    else {
        shuffle = true
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Shuffle Enabled</div>');
        $("#buttonShuffle").text("Disable Shuffle");
    }
}

function namespacesJumpControl() {
    if (namespacesJumpFlag) {
        namespacesJumpFlag = false;
        $("#namespacesJumpButton").text("Enable Auto NS Switch");
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Disabled automatic switch of namespace</div>');
        namespacesJumpStaus = 'Disabled'
    } else {
        namespacesJumpFlag = true;
        $("#namespacesJumpButton").text("Disable Auto NS Switch");
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Enabled automatic switch of namespace </div>');
        namespacesJumpStaus = 'Enabled'
    }
}

function showPodNameControl() {
    if (showPodName) {
        showPodName = false;
        $("#buttonOnlyPodName").text("Show Pods Name");
    }
    else {
        showPodName = true
        $("#buttonOnlyPodName").text("Hide Pods Name");
    }
}

function podExists(podName) {
    for (i=0; i<aliens.length; i++) {
        if (aliens[i]["name"] == podName) {
            return true;
        }
    }
    return false;
}

function findReplace() {
    for (i=0; i<aliens.length; i++) {
        if (!aliens[i]["active"]) {
            return i;
        }
    }
    return -1;
}

function randNamespaceJump(min, max, jumpRandomFactor) {
    if ((Math.random() * (max - min) + min) > jumpRandomFactor) {
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Switch Namespace</div>');
        switchNamespace();
    }
}

window.setInterval(function setAliens() {

    if (shuffle) {
        pods = pods.sort(() => Math.random() - 0.5)
    }

    aliens = [];
    if (pods.length > 0) {
        for (k=10; k>0; k--) {
            if (!contains(aliensY, k)) {
                aliensY.push(k);
            }
        }
        var x = 10;
        var y = 10;
        var yInc = false;

        for (i=0; i<pods.length; i++) {
            if(!podExists(pods[i])) {
                var replaceWith = findReplace();
                if (replaceWith != -1) {
                    aliens[replaceWith] = {"name": pods[i], "x": aliens[replaceWith]["x"], "y": aliens[replaceWith]["y"], "active": true}
                    cnt =+ 1;
                }
                else {
                    if (!yInc) {
                        y += 20;
                        yInc = true;
                    }
                    else {
                        y -= 20;
                        yInc = false;
                    }
                    aliens.push({"name": pods[i], "x": x, "y": y, "active": true});
                    cnt =+ 1;
                }
                if (aliens.length % 12 == 0) {
                    x = 10;
                    y += aliensIncrementY;
                    for (k=y+10; k>=y; k--) {
                        if (!contains(aliensY, k)) {
                            aliensY.push(k);
                        }
                    }
                }
                else {
                    x += 60;
                }
            }
        }
    }
}, 1000)

window.setInterval(function backgroundTasks() {

    if (!codename_configured) {
        chaosProgram = $('#chaosProgramTextArea').val();
        chaosProgramWithCodename = chaosProgram.replace(codename_regex, "chaos-codename: " + codename);
        $('#chaosProgramTextArea').val(chaosProgramWithCodename);
        codename_configured = true;
    }

    if (game_mode_switch || programming_mode_switch || log_tail_switch) {
        getMetrics()
    }
    
    if (log_tail_switch) {
	    getChaosJobsLogs()
    }
    
    if (programming_mode_switch) {
        drawChaosProgramFlow();
    }

}, 2000)

getEndpoint();
getNamespaces();
getSavedPresets();
// document.getElementById("gameContainer").style.display = "none";
// document.getElementById("metricsPresetsRow").style.display = "none"

document.getElementById("gameContainer").style.visibility = "hidden";
document.getElementById("metricsPresetsRow").style.visibility = "hidden";
document.getElementById("gameContainer").style.opacity = 0;
document.getElementById("metricsPresetsRow").style.opacity = 0;

document.getElementById("gameContainer").style.visibility = "visible";
document.getElementById("metricsPresetsRow").style.visibility = "visible";
document.getElementById("gameContainer").style.opacity = 1;
document.getElementById("metricsPresetsRow").style.opacity = 1;
