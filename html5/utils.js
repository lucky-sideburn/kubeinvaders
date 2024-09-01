document.addEventListener("DOMContentLoaded", function() {
  setTimeout(function() {
      document.getElementById("splash-screen").style.display = "none";
      document.getElementById("main-game-div").style.display = "block";
  }, 2000);
});

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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function rand_id() {
  return getRandomInt(9999);
}

function formattedToday() {
  const today = new Date();
  return today
}

function convertStringToArrayWithSeparator(str, separator) {
  return String(str).split(separator);
}

function demo_mode_alert() {
  alert("This is a demo mode installed into the k8s cluster of platformengineering.it, some features are disabled.");
}

function is_demo_mode() {
  return demo_mode;
}

function sanitizeStringToURLFriendly(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}


function kubePingModalSwitch() {
  var oReq = new XMLHttpRequest();
  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        console.log("[K-INV STARTUP] kubeping status is: |" + this.responseText.trim() + "|");
        if (this.responseText.trim() == "Key not found" || is_demo_mode()) {
          setModalState(true)
          showKubePingModal()
        }
      }
  };;

  oReq.open("GET", k8s_url + "/chaos/redis/get?key=kubeping", true);
  oReq.send();
}

function setKubePingStatusPing(value) {
  var oReq = new XMLHttpRequest();

  if (value == 1) {
    oReq.open("POST", k8s_url + "/chaos/redis/set?key=kubeping&msg=" + sanitizeStringToURLFriendly(document.getElementById("kubePingJsonTextArea").value), true);  
  } 
  else {
    oReq.open("POST", k8s_url + "/chaos/redis/set?key=kubeping", true);  
  }

  oReq.onreadystatechange = function () {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        kubeping_sent = true;
      }
  };;
  oReq.setRequestHeader("Content-Type", "application/text");
  oReq.send(String(value));
  closeKubePingModal();
}