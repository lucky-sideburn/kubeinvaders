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

var pods = [];
var nodes = []
var aliens = [];
var aliensWidth = 40;
var aliensHeight = 40;

// Button vars
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

// Rocket Vars
var shot = false;
var rocketLaunched = false;
var rocketX = 0;
var rocketY = 0;
var collisionDetected = false
// Aliens Vars
var aliensY = []

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

function drawRocket() {
    ctx.beginPath();
    ctx.arc(rocketX, rocketY, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
    console.log("Rocket X: " + rocketX + " Rocket Y: " + rocketY);
    var pointer = 0
    var pointer_limit = 0

    if (aliensY.includes(rocketY)){
        console.log("Y for rocket is the same of an alien");
        var i;
        for (i =  aliens.length - 1; i >= 0; i--) {
            if (aliens[i]["active"] && (rocketY - aliens[i]["y"] < 5)) {
                var rangeX = []
                console.log(aliens[i]);
                console.log(aliens[i]["x"]);

                rangeX.push(aliens[i]["x"]);

                for (k = aliens[i]["x"]; k < aliens[i]["x"]+aliensWidth; k++) {
                    rangeX.push(k);
                }

                console.log(rangeX);
                if(rangeX.includes(rocketX)) {
                    console.log("collision detected");
                    collisionDetected = true;
                    aliens[i]["active"] = false;
                    aliens[i]["name"] = "killed_pod";
                    break;
                }
            }
        } 
    }
    
    if (collisionDetected) {
        rocketY = 0;
        rocketX = 0;
        collisionDetected = false;
    }

    if(shot && rocketLaunched) {
        if (rocketY < 0){
            console.log("Rocket arrived to the end of canvas");
            shot = false;
            rocketLaunched = false;
        }
        else {
            rocketY = rocketY -= 5;
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
    
    if (shot) {
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
    
    for (let i=0; i<aliens.length; i++) {
        if (aliens[i]["active"]) {
            drawAlien(aliens[i]["x"], aliens[i]["y"]);
        }
    }
}

function podExists(podName) {
    console.log("Check if pod exists");
    for (let i=0; i<aliens.length; i++) {
        if (aliens[i]["name"] == podName) {
            return true;
        }
    }
    console.log("The pod " + podName + " is not in aliens array");

    return false;
}

function findReplace() {
    console.log("Check if there an inactive alien to replace");
    for (let i=0; i<aliens.length; i++) {
        if (!aliens[i]["active"]) {
            return i;
        }
    }
    return -1;
}

function setAliens() {
    if (pods.length > 0) {
        aliensY = [];
        for (k=10; k>0; k--) {
            aliensY.push(k);
        }
        var x = 10;
        var y = 10;
        for (let i=0; i<pods.length; i++) {
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
                    x = 10;
                    y += 50;
                    for (k=y+10; k>=y; k--) {
                        aliensY.push(k);
                    }
                }
                else {
                    x += 60;
                }
            }          
        }
        console.log(aliensY);
    }
}

setInterval(draw, 10);
setInterval(getKubeItems, 1000);
setInterval(setAliens, 1000);
