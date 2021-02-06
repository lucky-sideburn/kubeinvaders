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
var namespace = "kubeinvadersdemo";

// pods list from kubernetes
var pods = [];

// nodes list from kubernetes
var nodes = [];

var mergeNodesAndPods = [];

// Hash of aliens related to pods or nodes
var aliens = [];
/*
Alien item active
aliens = [{
    "x": 0,
    "y": 0,
    "active": true,
    "name": "name of the pods or node"
}]
Alien item of a dead pod
aliens = [{
    "x": 0,
    "y": 0,
    "active": true,
    "name": "killed_pod"
}]
*/

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

function getPods(){
    foo = pods;
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        json_parsed = JSON.parse(this.responseText)
        pods = json_parsed["items"];
    };;
    oReq.open("GET", "http://localhost:8080/kube/pods?namespace=" + namespace);
    oReq.send();
}

function getNodes(){
    var oReq = new XMLHttpRequest();
    oReq.onload = function () {
        json_parsed = JSON.parse(this.responseText)
        nodes = json_parsed["items"];
    };;
    oReq.open("GET", "http://localhost:8080/kube/nodes");
    oReq.send();
}

function getKubeItems() { 
    getPods()
}

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
        console.log("Go right");
        console.log("Spaceship Y:" + spaceshipY);
        console.log("Spaceship X: " + spaceshipX);
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
        console.log("Go left");
        console.log("Spaceship Y:" + spaceshipY);
        console.log("Spaceship X: " + spaceshipX);
    }
    if(e.key == "Up" || e.key == "ArrowUp") {
        upPressed = true;
        console.log("Go up");
        console.log("Spaceship Y:" + spaceshipY);
        console.log("Spaceship X: " + spaceshipX);
    }
    else if(e.key == "Down" || e.key == "ArrowDown") {
        downPressed = true;
        console.log("Go down");
        console.log("Spaceship Y: " + spaceshipY);
        console.log("Spaceship X: " + spaceshipX);
    }
    else if(e.keyCode == 32) {
        console.log("Shot");
        shot = true
    }
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

function drawAlien(alienX, alienY) {
    var image = new Image(); // Image constructor
    image.src = './sprite_invader.png';
    ctx.drawImage(image, alienX, alienY, 40, 40);
    ctx.closePath();
}

function checkRocketAlienCollision(){
    if (aliensY.includes(rocketY)){
        console.log("The y of rocket is the same of an alien. rocketY=" + rocketY + " List of aliensY:" + aliensY);
        var i;
        for (i=aliens.length - 1; i >= 0; i--) {
            if (aliens[i]["active"] && (rocketY - aliens[i]["y"] < 5)) {
                var rangeX = []
                //console.log(aliens[i]);
                //console.log(aliens[i]["x"]);
                rangeX.push(aliens[i]["x"]);

                for (k=aliens[i]["x"]; k<aliens[i]["x"]+aliensWidth; k++) {
                    rangeX.push(k);
                }

                console.log("rangeX is:" + rangeX);
                
                if(rangeX.includes(rocketX)) {
                    console.log("collision detected");
                    collisionDetected = true;
                    aliens[i]["active"] = false;
                    aliens[i]["name"] = "killed_pod";
                    return true;
                }
            }
        } 
    }
    return false;
}

function drawRocket() {
    var image = new Image(); // Image constructor
    image.src = './kuberocket.png';
    ctx.drawImage(image, rocketX, rocketY, 20, 20);

    ctx.closePath();
    //console.log("Rocket X: " + rocketX + " Rocket Y: " + rocketY);

    if (checkRocketAlienCollision()) {
        rocketY = -100;
        rocketX = -100;
        collisionDetected = false;
        return
    }

    if(shot && rocketLaunched) {
        if (rocketY < 0){
            console.log("Rocket arrived to the end of canvas");
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
    image.src = './spaceship.png';
    ctx.drawImage(image, spaceshipX, spaceshipY, 60, 60);
    ctx.closePath();
}

function draw() {
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
        if (spaceshipY < 0){
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
            drawAlien(aliens[i]["x"], aliens[i]["y"]);
        }
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

function setAliens() {
    if (pods.length > 0) {
        for (k=10; k>0; k--) {
            if (!aliensY.includes(k)) {
                aliensY.push(k);
            }
        }
        var x = 10;
        var y = 10;
        for (i=0; i<pods.length; i++) {
            if(!podExists(pods[i])) {
                var replaceWith = findReplace();
                if (replaceWith != -1) {
                    aliens[replaceWith] = {"name": pods[i], "x": aliens[replaceWith]["x"], "y": aliens[replaceWith]["y"], "active": true}
                    cnt =+ 1;
                }
                else {
                    aliens.push({"name": pods[i], "x": x, "y": y, "active": true});
                    cnt =+ 1;
                }
                if (aliens.length == 12) {
                    console.log("we need another line of aliens for Y="+aliensIncrementY);
                    x = 10;
                    y += aliensIncrementY;
                    for (k=y+10; k>=y; k--) {
                        if (!aliensY.includes(k)) {
                            aliensY.push(k);
                        }
                    }
                    console.log("aliensY contains new Y for detecting eventual collisions. aliensY="+aliensY);
                }
                else {
                    x += 60;
                }
            }
        }
    }
}

setInterval(draw, 10);
setInterval(getKubeItems, 1000);
setInterval(setAliens, 1000);
