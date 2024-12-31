/*
 * Copyright 2024 KubeInvaders Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

/* Main Functions for KubeInvaders Game */

function checkHTTP(url, elementId) {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            $("#" + elementId).val(this.status);
        }
    };;
    oReq.open("GET", url);
    oReq.send();
}

function exportSettings() {
    // Crea un oggetto con i dati delle impostazioni
    const settings = {
        sys_cluster_endpoint: document.getElementById('sys_cluster_endpoint').value,
        sys_insecure_endpoint_flag: document.getElementById('sys_insecure_endpoint_flag').value,
        sys_k8s_proxied_api_http_status_code: document.getElementById('sys_k8s_proxied_api_http_status_code').value,
        sys_openresty_env_vars:  document.getElementById('sys_openresty_env_vars').value
    };
  
    // Converti l'oggetto in una stringa JSON
    const jsonSettings = JSON.stringify(settings, null, 2);
  
    // Crea un blob e un URL per il download
    const blob = new Blob([jsonSettings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    // Crea un link temporaneo per il download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    document.body.appendChild(a);
    a.click();
  
    // Pulisci
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
  
function setSystemSettings() {
    var sys_element = document.getElementById('sys_cluster_endpoint');
    sys_element.value = k8s_url;

    sys_element = document.getElementById('sys_insecure_endpoint_flag');
    sys_element.value = clu_insecure;

    sys_element = document.getElementById('sys_openresty_env_vars');
    sys_element.value = selected_env_vars;
    
    checkHTTP(k8s_url, 'sys_k8s_proxied_api_http_status_code')
}

function currentChaosContainerJsonTextAreaVal() {
    return editor_chaos_container_definition.getValue();
}

function setCodeNameToTextInput(elementId) {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            codename = this.responseText.trim();
            $("#" + elementId).val(codename);
            $("#" + elementId).text(codename);
            if (codename == "") {
                $('#alert_placeholder').replaceWith(alert_div + 'Error getting codename from backend. </div>');
                codename = "error_fix_getcodename_from_backend";
            }
        }
    };;
    oReq.open("GET", k8s_url + "/codename");
    oReq.send();
}

function getMetrics() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        var lines = this.responseText.split('\n');
        for (var i = 0;i < lines.length;i++){
            metric = lines[i].split(' ');

            if (metric[0] == "chaos_node_jobs_total") {
                $('#chaos_jobs_total').text(metric[1]);
                chart_chaos_jobs_total = Number(metric[1]);
            }
            else if (metric[0] == "deleted_pods_total") {
                chart_deleted_pods_total = Number(metric[1]);
                $('#deleted_pods_total').text(metric[1]);            
            }
            else if (metric[0] == "fewer_replicas_seconds") {
                chart_fewer_replicas_seconds = Number(metric[1]);
                $('#fewer_replicas_seconds').text(metric[1]);            
            }
            else if (metric[0] == "latest_fewer_replicas_seconds") {
                chart_latest_fewer_replicas_seconds = Number(metric[1]);
                $('#latest_fewer_replicas_seconds').text(metric[1]);            
            }
            else if (metric[0] == "pods_not_running_on_selected_ns") {
                chart_pods_not_running_on = Number(metric[1]);
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
                chart_current_chaos_job_pod = Number(metric[1]);
                $('#current_chaos_job_pod').text(metric[1]);
            }
        }
    };;
    oReq.open("GET", k8s_url + "/metrics");
    oReq.send();
}

function getChaosJobsPodsPhase() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        var lines = this.responseText.split('\n');
        for (var i = 0;i < lines.length;i++){
            metric = lines[i].split(' ');

            if (metric[0].match(chaos_job_regex)) {
                metrics_split = metric[0].split(":");
                chaos_jobs_status.set(metrics_split[1] + ":" + metrics_split[2] + ":" +  metrics_split[3], metric[1]);
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos_jobs_pod_phase");
    oReq.send();
}

function scroll_backwards() {
    if (chaos_logs_pos > 0){
        chaos_logs_pos = chaos_logs_pos -1;
        $('#current_log_pos').text(chaos_logs_pos);
        getChaosJobsLogs();
    } 
}

function getTotalLogsPos() {
    var oReq = new XMLHttpRequest();
    oReq.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            if (log_tail_switch) {
                if (this.responseText.trim() == "null") {
                    $('#total_logs_pos').text("0");
                } else {
                    $('#total_logs_pos').text(this.responseText);
                }
            }
        }
    };;
    oReq.open("GET", k8s_url + "/chaos/logs/count?logid=" + random_code);
    oReq.send();
}

function scroll_forward() {
    chaos_logs_pos = chaos_logs_pos + 1;
    $('#current_log_pos').text(chaos_logs_pos);
    getChaosJobsLogs();
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
    oReq.open("GET", k8s_url + "/chaos/logs?logid=" + random_code + "&pos=" + chaos_logs_pos);
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
    oReq.open("GET", k8s_url + "/chaos/logs/keepalive?logid=" + random_code + "&pos=" + chaos_logs_pos);
    oReq.send();
}

function runKubeLinter() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        kubelinter = this.responseText;
        $('#alert_placeholder').replaceWith(alert_div + "KubeLinter executed correctly on namespace " + namespace +  ". Changing Regex and activating logs tail.</div>");
        enableLogTail();
        setLogRegex();

        $('#logTailRegex').val('{"since": "60", "pod":".*", "namespace":"' + namespace + '", "labels":".*", "annotations":".*", "containers":".*"}');
        
        if (!log_tail_switch) {
            setLogConsole(); 
        }
    };;

    $('#currentKubeLinterResult').text('KubeLinter launched. Set this regex and start log tail: {"since": "60", "pod":".*", "namespace":"' + namespace + '", "labels":".*", "annotations":".*", "containers":".*"}');

    oReq.open("GET", k8s_url + "/kube/kube-linter?logid=" + random_code +"&namespace=" + namespace);
    oReq.send();
}

function getNamespaces() {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        namespaces = this.responseText;
        namespaces = namespaces.split(",");
        namespace = namespaces[namespaces_index];
        console.log("[CURRENT-NAMESPACE] " + namespace);
        $('#currentGameNamespace').text(namespace);
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
        editor_chaos_container_definition.setValue(job_parsed);
        editor_chaos_container_definition.refresh();  
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
    if (!IsJsonString(currentChaosContainerJsonTextAreaVal())) {
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
        oReq.send(currentChaosContainerJsonTextAreaVal());
    }
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

function rebootVirtualMachine(vm_name) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Reboot virtual machine ' + vm_name + '</div>');
    };;
    $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Preparing virtual machine ' + vm_name + '</div>');
    oReq.open("GET", k8s_url + "/kube/vm_reboot?vm_name=" + vm_name + "&namespace=" + namespace);
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

function addNodeAndVMstoPods() {
    if (chaos_vms && virtualMachines && virtualMachines.length > 0) {
        pods = pods.concat(virtualMachines);
    }
    
    if (nodes && nodes.length > 0) {
        pods = pods.concat(nodes);
    }
    return pods;
}

function getPods() {
    if (chaos_pods) {
        var oReq = new XMLHttpRequest();
        oReq.onload = function () {
            let new_pods = JSON.parse(this.responseText)["items"];
            
            // Pod might just be killed in game, but not terminated in k8s yet.
            for (i=0; i<new_pods.length; i++) {
                if (aliens.some((alien) => alien.name == new_pods[i].name && alien.status == "killed")) {
                    new_pods[i].status = "killed";
                }
            }
            pods = new_pods;
            addNodeAndVMstoPods();
        };;
        oReq.open("GET", k8s_url + "/kube/pods?action=list&namespace=" + namespace);
        oReq.send();
    }
    else {
        pods = [];
        addNodeAndVMstoPods();
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

function getVMs() {
    if (chaos_vms) {
        var oReq = new XMLHttpRequest();
        oReq.onload = function () {
            const jsonData = JSON.parse(this.responseText);
            virtualMachines = [];
            Array.from(jsonData.items).forEach(vm => {
                const name = vm.metadata.name; // Nome della VM
                const status = vm.status.printableStatus.toLowerCase(); // Stato della VM
                virtualMachines.push({ name: name, status: status });
            });
        };;
        oReq.open("GET", k8s_url + "/kube/vm?namespace=" + namespace);
        oReq.send();
    }
    else {
        virtualMachines = [];
    }
}

window.setInterval(function getKubeItems() {
    if (game_mode_switch) {
        getNodes();
        getPods();
        getVMs();
    }
}, 500)

function keyDownHandler(e) {
    if (!modal_opened && game_mode_switch) {
        e.preventDefault();
        if (e.key == "Right" || e.key == "ArrowRight") {
            rightPressed = true;
        }
        else if (e.key == "Left" || e.key == "ArrowLeft") {
            leftPressed = true;
        }
        if (e.key == "Up" || e.key == "ArrowUp") {
            upPressed = true;
        }
        else if (e.key == "Down" || e.key == "ArrowDown") {
            downPressed = true;
        }
        else if (e.keyCode == 83) {
            if (shuffle) {
                shuffle = false;
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Disable shuffle</div>');
            }
            else {
                shuffle = true
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Enable shuffle</div>');
            }
        }
        else if (e.keyCode == 32) {
            shot = true
        }
        else if (e.keyCode == 78) {
            switchNamespace();
        }
        else if (e.keyCode == 72) {
            if (help) {
                help = false;
            }
            else {
                help = true
            }
        }
        else if (e.keyCode == 67) {

            if (is_demo_mode()) {
                demo_mode_alert();
                return;
            }

            if (chaos_nodes) {
                chaos_nodes = false;
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Hide nodes</div>');

            }
            else {
                chaos_nodes = true
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Show nodes</div>');
            }
        }

        else if (e.keyCode == 86) {

            if (is_demo_mode()) {
                demo_mode_alert();
                return;
            }

            if (chaos_vms) {
                chaos_vms = false;
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Hide Virtual Machines</div>');

            }
            else {
                chaos_vms = true
                $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Show Virtual Machines</div>');
            }
        }

        else if (e.keyCode == 80) {
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

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
    else if (e.key == "Up" || e.key == "ArrowUp") {
        upPressed = false;
    }
    else if (e.key == "Down" || e.key == "ArrowDown") {
        downPressed = false;
    }
}

function drawAlien(alienX, alienY, name, status) {
    var image = new Image(); // Image constructor
    if (nodes.some((node) => node.name == name)) {
        image.src = './images/k8s_node.png';
        ctx.font = '10px pixel';
        ctx.drawImage(image, alienX, alienY, 30, 40);
        ctx.fillText(name.substring(0, 10) + '..', alienX, alienY + 50);
    }
    else if (virtualMachines.some((vm) => vm.name == name)) {
        image.src = `./images/sprite_invader_vm_${status}.png`;
        ctx.font = '10px pixel';
        ctx.drawImage(image, alienX, alienY, 40, 40);
        ctx.fillText(name.substring(0, 10) + '..', alienX, alienY + 50);
    }
    else {
        image.src = `./images/sprite_invader_${status}.png`;
        ctx.font = '8px pixel';
        ctx.drawImage(image, alienX, alienY, 40, 40);
        if (showPodName) {
            ctx.fillText(name.substring(0, 10) + '..', alienX, alienY + 45);
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
                
                if (contains(rangeX, rocketX)) {
                    collisionDetected = true;
                    aliens[i]["status"] = "killed";
                    // Aliens might be updated before new pods are fetched
                    for (j=0; j<pods.length; j++) {
                        if (pods[j].name == aliens[i].name) {
                            pods[j].status = "killed";
                        }
                    }
                    if (nodes.some((node) => node.name == aliens[i]["name"])) {
                        aliens[i]["active"] = false;
                        startChaosNode(aliens[i]["name"]);
                    }
                    else if (virtualMachines.some((vm) => vm.name == aliens[i]["name"])) {
                        aliens[i]["active"] = false;
                        rebootVirtualMachine(aliens[i]["name"]);
                    }
                    else {
                        deletePods(aliens[i]["name"]);
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

    if (shot && rocketLaunched) {
        if (rocketY < 0) {
            shot = false;
            rocketLaunched = false;
        }
        else {
            rocketY = rocketY -= rocketSpeed;
        }
    }
    else {
        rocketX = spaceshipX + (spaceshipWidth / 3);
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

window.setInterval(function draw() {
    if (namespacesJumpFlag){
        randNamespaceJump(1, 10, 8);
    }
}, 1000)

window.setInterval(function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i=0; i<aliens.length; i++) {
        if (aliens[i]["active"]) {
            drawAlien(aliens[i]["x"], aliens[i]["y"], aliens[i]["name"], aliens[i]["status"]);
        }
    }
    drawSpaceship();
    
    if (shot && !collisionDetected) {
        drawRocket();
    }

    if (x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy > canvas.height-ballRadius || y + dy < ballRadius) {
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

    if (rightPressed) {
        spaceshipX += 3;
        if (spaceshipX + spaceshipWidth > canvas.width) {
            spaceshipX = canvas.width - spaceshipWidth;
        }
    }
    else if (leftPressed) {
        spaceshipX -= 3;
        if (spaceshipX < 0) {
            spaceshipX = 0;
        }
    }

    if (upPressed) {
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

    ctx.fillStyle = 'white';
    ctx.font = '16px pixel';

    ctx.fillText('Cluster: ' + endpoint, 10, startYforHelp);
    ctx.fillText('Current Namespace: ' + namespace, 10, startYforHelp + 20);
    ctx.fillText('Alien Shuffle: ' + shuffle, 10, startYforHelp + 40);
    ctx.fillText('Auto Namespaces Switch: ' + namespacesJumpStatus, 10, startYforHelp + 60);

    ctx.fillText('press \'h\' for help!', 10, startYforHelp + 80);

    if (help) {
        ctx.fillText('h => Enable or disable help', 10, 280);
        ctx.fillText('s => Enable or disable shuffle for aliens', 10, 300);
        ctx.fillText('n => Change the namespace', 10, 320);
        ctx.fillText('p => Display pods switch', 10, 340);
        ctx.fillText('c => Display nodes switch', 10, 360);
        ctx.fillText('v => Display virtual machines (KubeVirt) switch', 10, 380);
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
        namespacesJumpStatus = 'Disabled'
    } else {
        namespacesJumpFlag = true;
        $("#namespacesJumpButton").text("Disable Auto NS Switch");
        $('#alert_placeholder').replaceWith(alert_div + 'Latest action: Enabled automatic switch of namespace </div>');
        namespacesJumpStatus = 'Enabled'
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
            if (!podExists(pods[i].name)) {
                var replaceWith = findReplace();
                if (replaceWith != -1) {
                    aliens[replaceWith] = {"name": pods[i].name, "status": pods[i].status, "x": aliens[replaceWith]["x"], "y": aliens[replaceWith]["y"], "active": true}
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
                    aliens.push({"name": pods[i].name, "status": pods[i].status, "x": x, "y": y, "active": true});
                    cnt =+ 1;
                }
                if (aliens.length % maxAliensPerRow == 0) {
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
    // console.log("Nodes:", nodes);
    // console.log("Virtual Machines:", virtualMachines);
    // console.log("chaos_vms flag:", chaos_vms);
    // console.log("Pods:", pods);

    if (!codename_configured) {
        chaosProgram = $('#chaosProgramTextArea').val();
        chaosProgramWithCodename = chaosProgram.replace(codename_regex, "chaos-codename: " + codename);
        $('#chaosProgramTextArea').val(chaosProgramWithCodename);
        $('#chaosProgramTextArea').text(chaosProgramWithCodename);
        chaosProgram = chaosProgramWithCodename;
        codename_configured = true;
    }

    if (game_mode_switch || programming_mode_switch || log_tail_switch) {
        getMetrics();
        getChaosJobsPodsPhase();
        updateMainMetricsChart();
    }

    if (log_tail_switch) {
	    getChaosJobsLogs();
        getTotalLogsPos();
    }
    
    if (programming_mode_switch && chaos_program_valid) {
        drawChaosProgramFlow();
    }
    
    if (chaos_report_switch) {
        updateElapsedTimeArray(chaosReportprojectName);
        updateChaosReportStartTime(chaosReportprojectName);
        drawCanvasHTTPStatusCodeStats();
        chaosReportKeepAlive(chaosReportprojectName);
    }

}, 2000)

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setSystemSettings();
getEndpoint();
getNamespaces();
getSavedPresets();

document.getElementById("gameContainer").style.visibility = "hidden";
document.getElementById("metricsPresetsRow").style.visibility = "hidden";
document.getElementById("gameContainer").style.opacity = 0;
document.getElementById("metricsPresetsRow").style.opacity = 0;
document.getElementById("gameContainer").style.visibility = "visible";
document.getElementById("metricsPresetsRow").style.visibility = "visible";
document.getElementById("gameContainer").style.opacity = 1;
document.getElementById("metricsPresetsRow").style.opacity = 1;

// TO DO: Apply also when modals are opened
$('.modal').on('hidden.bs.modal', function () {
 setModalState(false);
});