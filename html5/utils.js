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
  alert("This is a demo mode, some features are disabled");
}

function is_demo_mode() {
  if (demo_mode == "true") {
    return true;
  }
  return false;
}

