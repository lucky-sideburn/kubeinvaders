function setChaosReportURL(select) {
  var selectedValue = select.options[select.selectedIndex].value;
  document.getElementById("chaosReportCheckSiteURL").value = selectedValue;
}

function addElementToSelect(selectId, elementValue) {
  var select = document.getElementById(selectId);
  var option = document.createElement("option");
  option.text = elementValue;
  option.value = elementValue;
  select.add(option);
}

function parseIngressListJSON(ingressList) {
  var hostOfIngress = convertStringToArrayWithSeparator(ingressList, ",")

  if (hostOfIngress.length > 0) {
    document.getElementById("chaosReportCheckSiteURL").value = hostOfIngress[0];
  }

  for (i in hostOfIngress) {
    if (hostOfIngress[i] != "No Ingress found") {
      addElementToSelect("ingressHostList", hostOfIngress[i]);
    }
  }
}

function resizeCharts() {
  if (myHTTPStatusCodeChart != null && myHTTPStatusCodeChart != undefined) {
    myHTTPStatusCodeChart.resize();
  }
  if (myMainChaosMetrics != null && myMainChaosMetrics != undefined) {
    myMainChaosMetrics.resize();
  }
  if (myHTTPElapsedChart != null && myHTTPElapsedChart != undefined) {
    myHTTPElapsedChart.resize();
  }
}

function getIngressLists() {
  var oReq = new XMLHttpRequest();
  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      parseIngressListJSON(JSON.parse(this.responseText));
    }
  };;
  oReq.open("GET", k8s_url + "/kube/ingress/get?namespace=" + namespace, true);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send();
}

function diffBetweenTwoDates(date1, date2) {
  var diff = (date2.getTime() - date1.getTime()) / 1000;
  return diff;
}

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
    <div class="col col-xl-10" style="margin-top: 2%;">
        <label for="ingressHostList">Ingress Host List</label>
        <select id="ingressHostList" class="form-select" aria-label="Ingress Host List" onclick="setModalState(true)">
        </select>
    </div>
</div>

<div class="row" style="margin-top: 2%;">
    <div class="col col-xl-10">
        <label for="chaosReportCheckSiteURL">URL</label>
        <input type="text" class="form-control input-lg" id="chaosReportCheckSiteURL" value="" style="margin-top: 1%; width: 80%;">
    </div>
</div>

<div class="row" style="margin-top: 2%;">
    <div class="col col-xl-10">
        <label for="chaosReportCheckSiteURLMethod" style="margin-top: 1%;">Method</label>
        <select id="chaosReportCheckSiteURLMethod" class="form-select input-sm" aria-label="Method" onchange="addPostUploadFile(this.value)">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
        </select>
    </div>
</div>

<div class="row" style="margin-top: 2%;">
    <div class="col col-xl-10">
        <div id="chaosReportUploadFileDiv"></div>
    </div>
</div>

<div class="row" style="margin-top: 2%;">
    <div class="col col-xl-10">  
        <label for="chaosReportCheckSiteURLHeaders">Headers</label>
        <input type="text" class="form-control input-sm" id="chaosReportCheckSiteURLHeaders" value='{"Content-Type": "application/json; charset=utf-8"}' style="margin-top: 1%; margin-bottom: 1%; width: 80%;" onclick="setModalState(true)">
    </div>
</div>
  `);

  if (is_demo_mode()) {
    document.getElementById("chaosReportCheckSiteURL").readOnly = true;
  }
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

function chaosReportKeepAlive(chaosReportprojectName) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", k8s_url + "/chaos/report/keepalive?project=" + chaosReportprojectName, true);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send();
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

  if (chaos_report_start_date == "") {
    chaos_report_start_date = new Date();
  }

  //startGameMode()
  chaos_report_switch = true;
  document.getElementById("httpStatsCanvasDiv").style.display = "block";
  document.getElementById("chartDiv").style.display = "block";

  drawCanvasHTTPStatusCodeStats();

  chaosReportprojectName = presetBodyDict["chaosReportProject"];
  $("#chaosReportAuthorDiv").html(presetBodyDict["chaosReportAuthor"]);
  $("#chaosReportProjectDiv").html(presetBodyDict["chaosReportProject"]);
  $("#chaosReportDateDiv").html(chaos_report_start_date.toLocaleString());
  $("#chaosReportSessionTimeDiv").html(diffBetweenTwoDates(chaos_report_start_date, new Date()) + " seconds");
  $("#chaosReportCheckSiteURLDiv").html(presetBodyDict["chaosReportCheckSiteURL"]);


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
  oReq.open("POST", k8s_url + "/chaos/report/save?project=" + $("#chaosReportProject").val(), true);

  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      // console.log("[SAVE-CHAOS-REPORT-CONF] Configuration sent to Nginx")
    }
  };;

  oReq.setRequestHeader("Content-Type", "application/json");
  // console.log("[SAVE-CHAOS-REPORT-CONF] Sending configuration to Nginx: " + JSON.stringify(presetBodyDict));
  oReq.send(JSON.stringify(presetBodyDict));
  closePrepareChaosReportModal();
  resizeCharts();
  document.getElementById("myCanvas").scrollIntoView(true);
  document.getElementById("flagChaosReport").checked = true;
  $('#alert_placeholder').replaceWith(alert_div + 'RETURN TO TOP, PRESS START TO BEGIN AUTOMATIC SESSION </div>');
}

function readContentOfUploadedFile() {
  // console.log("[SAVE-CHAOS-REPORT-CONF] Reading content of uploaded file");
  var file = document.getElementById("formFile").files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    // console.log("[SAVE-CHAOS-REPORT-CONF] Content of uploaded file: " + e.target.result);
    chaos_report_post_data = e.target.result;
    sendSavedChaosReport()
  };
  reader.readAsText(file);
}

function saveChaosReport() {
  // console.log("[SAVE-CHAOS-REPORT-CONF] Going to save Chaos Report program");
  if ($("#chaosReportCheckSiteURLMethod").val() == "POST") {
    // console.log("[SAVE-CHAOS-REPORT-CONF] Check url is POST, reading content of uploaded file and sending saved Chaos Report");
    readContentOfUploadedFile();
  } else {
    // console.log("[SAVE-CHAOS-REPORT-CONF] Check url is GET, sending saved Chaos Report");
    sendSavedChaosReport();
  }
}

function updateElapsedTimeArray(projectName) {
  $("#chaosReportSessionTimeDiv").html(diffBetweenTwoDates(chaos_report_start_date, new Date()) + " seconds");
  // console.log("[SAVE-CHAOS-REPORT-CONF] Diff Between Dates: " + toString(diffBetweenTwoDates(chaos_report_start_date, new Date())));
  // console.log("[SAVE-CHAOS-REPORT-CONF] Updating elapsed time array for project: " + projectName);

  var oReq = new XMLHttpRequest();
  var redis_key = projectName + "_check_url_elapsed_time";
  // console.log("[SAVE-CHAOS-REPORT-CONF] Redis key: " + redis_key);

  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      // console.log("[SAVE-CHAOS-REPORT-CONF] Elapsed time array received from Redis: " + parseFloat(this.responseText));
      chaos_report_http_elapsed_time_array.push(parseFloat(this.responseText));
      while (chaos_report_http_elapsed_time_array.length > 40) {
        chaos_report_http_elapsed_time_array.shift();
      }
    }
  };;

  oReq.open("GET", k8s_url + "/chaos/redis/get?key=" + redis_key, true);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send();
  updateStatusCodePieChart(projectName);
}

function updateStatusCodePieChart(projectName) {
  // console.log("[SAVE-CHAOS-REPORT-CONF] Updating Status Code Pie Chart for project: " + projectName);

  var oReq = new XMLHttpRequest();
  var redis_key = projectName + "_check_url_status_code";
  // console.log("[SAVE-CHAOS-REPORT-CONF] Redis key: " + redis_key);

  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      var status_code = this.responseText.trim();
      // console.log("[SAVE-CHAOS-REPORT-CONF] Status Code Pie Chart received from Redis: |" + status_code + "|");

      chart_status_code_dict[status_code] = chart_status_code_dict[status_code] + 1

      myHTTPStatusCodeChart.setOption({
        series: [
          {
            type: 'pie',
            data: [
              {
                value: chart_status_code_dict["200"],
                name: '200',
                itemStyle: { color: 'green' },
              },
              {
                value: chart_status_code_dict["500"],
                name: '500',
                itemStyle: { color: 'red' },
              },
              {
                value: chart_status_code_dict["502"],
                name: '502',
                itemStyle: { color: 'red' },
              },
              {
                value: chart_status_code_dict["503"],
                name: '503',
                itemStyle: { color: 'red' },
              },
              {
                value: chart_status_code_dict["504"],
                name: '504',
                itemStyle: { color: 'red' },
              },
              {
                value: chart_status_code_dict["400"],
                name: '400',
                itemStyle: { color: 'yellow' },
              },
              {
                value: chart_status_code_dict["401"],
                name: '401',
                itemStyle: { color: 'yellow' },
              },
              {
                value: chart_status_code_dict["403"],
                name: '403',
                itemStyle: { color: 'yellow' },
              },
              {
                value: chart_status_code_dict["404"],
                name: '404',
                itemStyle: { color: 'yellow' },
              },
              {
                value: chart_status_code_dict["405"],
                name: '405',
                itemStyle: { color: 'yellow' },
              },
              {
                value: chart_status_code_dict["Connection Error"],
                name: 'Connection Error',
                itemStyle: { color: 'black' },
              },
              {
                value: chart_status_code_dict["Other"],
                name: 'Other',
                itemStyle: { color: 'grey' },
              },
            ],
            radius: ['40%', '70%']
          }
        ]
      });
    }
  };;

  oReq.open("GET", k8s_url + "/chaos/redis/get?key=" + redis_key, true);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send();
}

function updateChaosReportStartTime(projectName) {
  // console.log("[SAVE-CHAOS-REPORT-CONF] Updating Start Time for project: " + projectName);

  var oReq = new XMLHttpRequest();
  var redis_key = projectName + "_check_url_start_time";
  // console.log("[SAVE-CHAOS-REPORT-CONF] Redis key: " + redis_key);

  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      $("#chaosReportDateDiv").html(this.responseText);
    }
  };;

  oReq.open("GET", k8s_url + "/chaos/redis/get?key=" + redis_key, true);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send();
}

function updateMainMetricsChart() {
  // console.log("[SAVE-CHAOS-REPORT-CONF] Updating chart");
  // console.log("[SAVE-CHAOS-REPORT-CONF] chart_current_chaos_job_pod: " + chart_current_chaos_job_pod);
  // console.log("[SAVE-CHAOS-REPORT-CONF] chart_pods_not_running_on: " + chart_pods_not_running_on);
  // console.log("[SAVE-CHAOS-REPORT-CONF] chart_fewer_replicas_seconds: " + chart_fewer_replicas_seconds);
  // console.log("[SAVE-CHAOS-REPORT-CONF] chart_latest_fewer_replicas_seconds: " + chart_latest_fewer_replicas_seconds);

  myMainChaosMetrics.setOption({
    series: [
      {
        type: 'pie',
        data: [
          {
            value: Number(chart_current_chaos_job_pod),
            name: 'Current Chaos Pods'
          },
          {
            value: Number(chart_pods_not_running_on),
            name: 'Not Running Pods'
          },
          {
            value: Number(chart_fewer_replicas_seconds),
            name: 'Current Replicas State Delay'
          },
          {
            value: Number(chart_latest_fewer_replicas_seconds),
            name: 'Latest Replicas State Delay'
          }
        ],
        roseType: 'area'
      }
    ]
  });
}

function drawCanvasHTTPStatusCodeStats() {
  // // console.log("[SAVE-CHAOS-REPORT-CONF] Updating chart");

  myHTTPElapsedChart.setOption({
    xAxis: {},
    yAxis: {
      data: chaos_report_http_elapsed_time_array,
    },
    series: [
      {
        data: chaos_report_http_elapsed_time_array,
        type: 'line',
        smooth: true
      }
    ]
  });
}

var myHTTPElapsedChart = echarts.init(document.getElementById('httpElapsedChart'));

option = {
  backgroundColor: 'black',
  legend: {
    // Try 'horizontal'
    orient: 'vertical',
    right: 10,
    top: 'center'
  },
  xAxis: {
    data: chaos_report_http_elapsed_time_array,
  },
  yAxis: {},
  series: [
    {
      data: chaos_report_http_elapsed_time_array,
      type: 'line',
      smooth: true,
      itemStyle: {
        color: 'white'
      }
    }
  ]
};
myHTTPElapsedChart.setOption(option);

var myMainChaosMetrics = echarts.init(document.getElementById('mainChaosMetrics'));

option = {
  series: [
    {
      type: 'pie',
      data: [
        {
          value: 0,
          name: 'Current Chaos Pods'
        },
        {
          value: 0,
          name: 'Not Running Pods'
        },
        {
          value: 0,
          name: 'Current Replicas State Delay'
        },
        {
          value: 0,
          name: 'Latest Replicas State Delay'
        }
      ],
      roseType: 'area'
    }
  ]
};

myMainChaosMetrics.setOption(option);

var myHTTPStatusCodeChart = echarts.init(document.getElementById('httpStatusCodeChart'));
console.log(myHTTPStatusCodeChart);

option = {
  series: [
    {
      type: 'pie',
      labelLine: {
          normal: {
              show: true,
              color: 'yellow'
          }
      },
      data: [
        {
          value: chart_status_code_dict["200"],
          name: '200',
          itemStyle: { color: 'green' },
        },
        {
          value: chart_status_code_dict["500"],
          name: '500',
          itemStyle: { color: 'red' },
        },
        {
          value: chart_status_code_dict["502"],
          name: '502',
          itemStyle: { color: 'red' },
        },
        {
          value: chart_status_code_dict["503"],
          name: '503',
          itemStyle: { color: 'red' },
        },
        {
          value: chart_status_code_dict["504"],
          name: '504',
          itemStyle: { color: 'red' },
        },
        {
          value: chart_status_code_dict["400"],
          name: '400',
          itemStyle: { color: 'yellow' },
        },
        {
          value: chart_status_code_dict["401"],
          name: '401',
          itemStyle: { color: 'yellow' },
        },
        {
          value: chart_status_code_dict["403"],
          name: '403',
          itemStyle: { color: 'yellow' },
        },
        {
          value: chart_status_code_dict["404"],
          name: '404',
          itemStyle: { color: 'yellow' },
        },
        {
          value: chart_status_code_dict["Connection Error"],
          name: 'Connection Error',
          itemStyle: { color: 'black' },
        },
        {
          value: chart_status_code_dict["Other"],
          name: 'Other',
          itemStyle: { color: 'grey' },
        },
      ],
      roseType: 'area'
    }
  ]
};

myHTTPStatusCodeChart.setOption(option);

$(window).on('resize', function () {
  resizeCharts();
});