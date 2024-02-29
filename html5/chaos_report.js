function diffBetweenTwoDates(date1, date2) {
  console.log("[SAVE-CHAOS-REPORT-CONF] Diff between two dates: " + date1 + " and " + date2);
  var diff = (date2.getTime() - date1.getTime()) / 1000;
  console.log("[SAVE-CHAOS-REPORT-CONF] Diff between two dates: " + diff + " seconds")
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
  startGameMode()
  chaos_report_switch = true;
  document.getElementById("httpStatsCanvasDiv").style.display = "block";
  drawCanvasHTTPStatusCodeStats()
  var presetBodyDict = {
    "chaosReportAuthor": $("#chaosReportAuthor").val(),
    "chaosReportProject": $("#chaosReportProject").val(),
    "chaosReportCheckSiteURL": $("#chaosReportCheckSiteURL").val(),
    "chaosReportCheckSiteURLMethod": $("#chaosReportCheckSiteURLMethod").val(),
    "chaosReportCheckSiteURLHeaders": $("#chaosReportCheckSiteURLHeaders").val(),
    "chaosReportCheckSiteURLPayload": chaos_report_post_data
  }

  if (chaos_report_start_date == "") {
    chaos_report_start_date = new Date();
  }

  chaosReportprojectName = presetBodyDict["chaosReportProject"];
  $("#chaosReportAuthorDiv").html(presetBodyDict["chaosReportAuthor"]);
  $("#chaosReportProjectDiv").html(presetBodyDict["chaosReportProject"]);
  $("#chaosReportDateDiv").html(chaos_report_start_date.toLocaleString());
  $("#chaosReportSessionTimeDiv").html(diffBetweenTwoDates(chaos_report_start_date, new Date()) + " seconds");
  $("#chaosReportCheckSiteURLDiv").html(presetBodyDict["chaosReportCheckSiteURL"]);

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
  oReq.open("POST", k8s_url + "/chaos/report/save?project=" + $("#chaosReportProject").val(), true);

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

function updateElapsedTimeArray(projectName) {

  $("#chaosReportSessionTimeDiv").html(diffBetweenTwoDates(chaos_report_start_date, new Date()) + " seconds");
  console.log("[SAVE-CHAOS-REPORT-CONF] Diff Between Dates: " + toString(diffBetweenTwoDates(chaos_report_start_date, new Date())));
  console.log("[SAVE-CHAOS-REPORT-CONF] Updating elapsed time array for project: " + projectName);
  
  var oReq = new XMLHttpRequest();
  var redis_key = projectName + "_check_url_elapsed_time";
  console.log("[SAVE-CHAOS-REPORT-CONF] Redis key: " + redis_key);
  
  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log("[SAVE-CHAOS-REPORT-CONF] Elapsed time array received from Redis: " + parseFloat(this.responseText));
      chaos_report_http_elapsed_time_array.push(parseFloat(this.responseText));
      while (chaos_report_http_elapsed_time_array.length > 40) {
        chaos_report_http_elapsed_time_array.shift();
      }
    } 
  };;

  oReq.open("GET", k8s_url + "/chaos/redis/get?key=" + redis_key, true);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send();
}

function updateChaosReportStartTime(projectName) {
  console.log("[SAVE-CHAOS-REPORT-CONF] Updating Start Time for project: " + projectName);
  
  var oReq = new XMLHttpRequest();
  var redis_key = projectName + "_check_url_start_time";
  console.log("[SAVE-CHAOS-REPORT-CONF] Redis key: " + redis_key);
  
  oReq.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      $("#chaosReportDateDiv").html(this.responseText);
    } 
  };;

  oReq.open("GET", k8s_url + "/chaos/redis/get?key=" + redis_key, true);
  oReq.setRequestHeader("Content-Type", "application/json");
  oReq.send();
}


function drawCanvasHTTPStatusCodeStats() {
  console.log("[SAVE-CHAOS-REPORT-CONF] Updating chart");
  
  myChart.setOption({
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

  // console.log("[SAVE-CHAOS-REPORT-CONF] Updating metrics");
  // console.log("[SAVE-CHAOS-REPORT-CONF] Deleted Pods: " + chart_deleted_pods_total);
  // console.log("[SAVE-CHAOS-REPORT-CONF] Chaos Jobs: " + chart_chaos_jobs_total);
  // console.log("[SAVE-CHAOS-REPORT-CONF] Current Chaos Pods: " + chart_current_chaos_job_pod);
  // console.log("[SAVE-CHAOS-REPORT-CONF] Not Running Pods: " + chart_pods_not_running_on);
  // console.log("[SAVE-CHAOS-REPORT-CONF] Current Replicas State Delay: " + chart_fewer_replicas_seconds);
  // console.log("[SAVE-CHAOS-REPORT-CONF] Latest Replicas State Delay: " + chart_latest_fewer_replicas_seconds);

  myMainChaosMetrics.setOption({
    series: [
      {
        type: 'pie',
        data: [
          {
            value: Number(chart_deleted_pods_total),
            name: 'Deleted Pods'
          },
          {
            value: Number(chart_chaos_jobs_total),
            name: 'Chaos Jobs'
          },
          {
            value: Number(chart_current_chaos_job_pod),
            name: 'Current Chaos Pods'
          },
          {
            value: Number(chart_pods_not_running_on),
            name: 'Not Running Pods'
          },
          {
            value:  Number(chart_fewer_replicas_seconds),
            name: 'Current Replicas State Delay'
          },
          {
            value:  Number(chart_latest_fewer_replicas_seconds),
            name: 'Latest Replicas State Delay'
          }
        ],
        roseType: 'area'
      }
    ]
  });

//   while (chaos_report_http_elapsed_time_array.length > 40) {
//     chaos_report_http_elapsed_time_array.shift();
//   }

//   var elapsedTimeArray = chaos_report_http_elapsed_time_array;
//   var canvas = document.getElementById('httpStatsCanvas');
//   var context = canvas.getContext('2d');
//   context.clearRect(0, 0, canvas.width, canvas.height);

//   // Imposta la dimensione dei rettangoli e il numero di colonne e righe
//   var rectSize = 20;
//   var rows = canvas.height / rectSize;
//   var columns = canvas.width / rectSize;

//   // Disegna la griglia di rettangoli
//   for (var i = 0; i < rows; i++) {
//       for (var j = 0; j < columns; j++) {
//           // Calcola le coordinate del rettangolo
//           var x = j * rectSize;
//           var y = i * rectSize;

//           context.strokeStyle = 'black';
//           context.fillStyle = 'white';
        
//           // Disegna il rettangolo
//           context.fillRect(x, y, rectSize, rectSize);

//           // Aggiungi bordi per una migliore visualizzazione
//           //context.strokeRect(x, y, rectSize, rectSize);
//       }
//   }

//   for (var i = 0; i < elapsedTimeArray.length; i++) {
//     var x = i * rectSize;
//     var y = 80;

//     var width = rectSize;
//     var height = rectSize;

//     if (elapsedTimeArray[i] > 3) {
//       context.strokeStyle = 'black';
//       context.fillStyle = 'red';
//     } else if (elapsedTimeArray[i] > 2) {
//       context.strokeStyle = 'black';
//       context.fillStyle = 'orange';
//     } else {
//       context.strokeStyle = 'black';
//       context.fillStyle = "green";
//     }

//     if (i == elapsedTimeArray.length - 1) {
//       var text = String(elapsedTimeArray[i]);
//       context.fillStyle = 'black';
//       context.font = '20px Courier New';
//       context.fillText(text, x + width / 2 - context.measureText(text).width / 2, y - (height / 2));
//     }
  
//     context.fillRect(x, y, width, height);
  
//     //context.strokeRect(x, y, 20, 20);
//   }
}

var myChart = echarts.init(document.getElementById('main'));

option = {
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
        color: 'red'
      }
    }
  ]
};
myChart.setOption(option);


var myMainChaosMetrics = echarts.init(document.getElementById('mainChaosMetrics'));

option = {
  series: [
    {
      type: 'pie',
      data: [
        {
          value: 0,
          name: 'Deleted Pods'
        },
        {
          value: 0,
          name: 'Chaos Jobs'
        },
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