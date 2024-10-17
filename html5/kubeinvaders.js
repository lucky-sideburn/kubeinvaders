// DOM elements caching
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const gameContainer = document.getElementById("gameContainer");
const metricsPresetsRow = document.getElementById("metricsPresetsRow");
const gameButtons = document.getElementById("game-buttons");
const gameScreen = document.getElementById("game-screen");
const logTailDiv = document.getElementById("logTailDiv");

// Constants for Game Configuration
const ballRadius = 7;
const spaceshipHeight = 60;
const spaceshipWidth = 60;
const rocketSpeed = 7;
const maxAliensPerRow = 20;
const aliensIncrementY = 50;

// Game State Variables
let gameState = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  dx: 2,
  dy: -2,
  spaceshipX: (canvas.width - spaceshipWidth) / 2,
  spaceshipY: (canvas.height - spaceshipHeight) / 2,
  rocketX: -400,
  rocketY: -400,
  rocketLaunched: false,
  shot: false,
  rightPressed: false,
  leftPressed: false,
  upPressed: false,
  downPressed: false,
  autoPilot: false,
  autoPilotDirection: 0,
  spaceshipxOld: 0,
  aliens: [],
  needsRedraw: true,
  randomFactor: 10,
  shuffle: true,
  help: false,
  chaos_nodes: false,
  chaos_pods: true,
  log_tail_switch: false,
  random_code: (Math.random() + 1).toString(36).substring(7),
  collisionDetected: false,
  aliensY: [],
  pods: [],
  nodes: []
};

// Helper Functions
const makeXMLHttpRequest = (method, url, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      callback(this.responseText);
    }
  };
  xhr.open(method, url);
  xhr.send();
};

// Function for setting system settings
function setSystemSettings() {
  document.getElementById('sys_cluster_endpoint').value = k8s_url;
  document.getElementById('sys_insecure_endpoint_flag').value = clu_insecure;
  document.getElementById('sys_openresty_env_vars').value = selected_env_vars;
  checkHTTP(k8s_url, 'sys_k8s_proxied_api_http_status_code');
}

// Check HTTP status
function checkHTTP(url, elementId) {
  makeXMLHttpRequest("GET", url, function (status) {
    document.getElementById(elementId).value = status;
  });
}

// Redraw logic optimization
function drawSpaceship() {
  if (!gameState.needsRedraw) return;
  const image = new Image();
  image.src = './images/spaceship.png';
  ctx.drawImage(image, gameState.spaceshipX, gameState.spaceshipY, spaceshipWidth, spaceshipHeight);
}

function drawAlien(alienX, alienY, name, status) {
  const image = new Image();
  image.src = `./images/sprite_invader_${status}.png`;
  ctx.font = '8px pixel';
  ctx.drawImage(image, alienX, alienY, 40, 40);
  ctx.fillText(name.substring(0, 19) + '..', alienX, alienY + 40);
  ctx.closePath();
}

function checkRocketAlienCollision() {
  if (contains(gameState.aliensY, gameState.rocketY)) {
    for (let i = gameState.aliens.length - 1; i >= 0; i--) {
      if (gameState.aliens[i].active && (gameState.rocketY - gameState.aliens[i].y < 5)) {
        let rangeX = [];
        for (let k = gameState.aliens[i].x; k < gameState.aliens[i].x + 40; k++) {
          rangeX.push(k);
        }
        if (contains(rangeX, gameState.rocketX)) {
          gameState.collisionDetected = true;
          gameState.aliens[i].status = "killed";

          for (let j = 0; j < gameState.pods.length; j++) {
            if (gameState.pods[j].name === gameState.aliens[i].name) {
              gameState.pods[j].status = "killed";
            }
          }

          if (gameState.nodes.some((node) => node.name === gameState.aliens[i].name)) {
            gameState.aliens[i].active = false;
            startChaosNode(gameState.aliens[i].name);
          } else {
            deletePods(gameState.aliens[i].name);
          }
          return true;
        }
      }
    }
  }
  return false;
}

// Alien shuffle
function shuffleAliens() {
  gameState.pods = gameState.pods.sort(() => Math.random() - 0.5);
}

// Only redraw when necessary
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState.needsRedraw) {
    gameState.aliens.forEach(alien => {
      if (alien.active) {
        drawAlien(alien.x, alien.y, alien.name, alien.status);
      }
    });
    drawSpaceship();
    gameState.needsRedraw = false;
  }

  if (gameState.shot && !gameState.collisionDetected) {
    drawRocket();
  }
}

// Drawing rocket
function drawRocket() {
  const image = new Image();
  image.src = './images/kuberocket.png';
  ctx.drawImage(image, gameState.rocketX, gameState.rocketY, 20, 20);
  ctx.closePath();

  if (checkRocketAlienCollision()) {
    gameState.rocketY = -100;
    gameState.rocketX = -100;
    gameState.collisionDetected = false;
    return;
  }

  if (gameState.shot && gameState.rocketLaunched) {
    if (gameState.rocketY < 0) {
      gameState.shot = false;
      gameState.rocketLaunched = false;
    } else {
      gameState.rocketY -= rocketSpeed;
    }
  } else {
    gameState.rocketX = gameState.spaceshipX + (spaceshipWidth / 3);
    gameState.rocketY = gameState.spaceshipY;
    gameState.rocketLaunched = true;
  }
}

// Handle key presses
document.addEventListener("keydown", (e) => {
  if (!modal_opened && gameState.game_mode_switch) {
    e.preventDefault();
    if (e.key === "Right" || e.key === "ArrowRight") {
      gameState.rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      gameState.leftPressed = true;
    } else if (e.key === "Up" || e.key === "ArrowUp") {
      gameState.upPressed = true;
    } else if (e.key === "Down" || e.key === "ArrowDown") {
      gameState.downPressed = true;
    } else if (e.keyCode === 83) {
      gameState.shuffle = !gameState.shuffle;
    } else if (e.keyCode === 32) {
      gameState.shot = true;
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") {
    gameState.rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    gameState.leftPressed = false;
  } else if (e.key === "Up" || e.key === "ArrowUp") {
    gameState.upPressed = false;
  } else if (e.key === "Down" || e.key === "ArrowDown") {
    gameState.downPressed = false;
  }
});

// Background tasks and game loop

setInterval(function updateAliens() {
  if (gameState.shuffle) {
    shuffleAliens();
  }

  if (gameState.pods.length > 0) {
    gameState.aliens = [];
    let x = 10;
    let y = 10;

    for (let i = 0; i < gameState.pods.length; i++) {
      gameState.aliens.push({ name: gameState.pods[i].name, status: gameState.pods[i].status, x, y, active: true });

      if (gameState.aliens.length % maxAliensPerRow === 0) {
        x = 10;
        y += aliensIncrementY;
      } else {
        x += 60;
      }
    }
    gameState.needsRedraw = true;
  }
}, 1000);

// Main game loop
setInterval(function gameLoop() {
  draw();

  if (gameState.rightPressed && gameState.spaceshipX + spaceshipWidth < canvas.width) {
    gameState.spaceshipX += 3;
  } else if (gameState.leftPressed && gameState.spaceshipX > 0) {
    gameState.spaceshipX -= 3;
  }

  if (gameState.upPressed && gameState.spaceshipY > 0) {
    gameState.spaceshipY -= 3;
  } else if (gameState.downPressed && gameState.spaceshipY + spaceshipHeight < canvas.height) {
    gameState.spaceshipY += 3;
  }
}, 10);

function startChaosNode(node_name) {
  makeXMLHttpRequest("GET", `${k8s_url}/kube/chaos/nodes?nodename=${node_name}&namespace=${namespace}`, function () {
    console.log(`Started chaos job against ${node_name}`);
  });
}

function deletePods(pod_name) {
  makeXMLHttpRequest("GET", `${k8s_url}/kube/pods?action=delete&pod_name=${pod_name}&namespace=${namespace}`, function () {
    console.log(`Deleted pod: ${pod_name}`);
  });
}

function getPods() {
  if (gameState.chaos_pods) {
    makeXMLHttpRequest("GET", `${k8s_url}/kube/pods?action=list&namespace=${namespace}`, function (responseText) {
      const new_pods = JSON.parse(responseText).items;
      gameState.pods = gameState.nodes.length > 0 ? new_pods.concat(gameState.nodes) : new_pods;
    });
  } else {
    gameState.pods = gameState.nodes.length > 0 ? gameState.nodes : [];
  }
}

function getNodes() {
  if (gameState.chaos_nodes) {
    makeXMLHttpRequest("GET", `${k8s_url}/kube/nodes`, function (responseText) {
      gameState.nodes = JSON.parse(responseText).items;
    });
  } else {
    gameState.nodes = [];
  }
}

setInterval(function getKubeItems() {
  if (gameState.game_mode_switch) {
    getNodes();
    getPods();
  }
}, 500);
