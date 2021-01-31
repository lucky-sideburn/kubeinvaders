var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var ballRadius = 7;
var x = canvas.width/2;
var y = canvas.height-30;
var dx = 2;
var dy = -2;
var spaceshipHeight = 60;
var paddleWidth = 60;
var spaceshipX = (canvas.width-paddleWidth)/2;
var spaceshipY = (canvas.height-spaceshipHeight)/2;

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

// Rocket Vars
var shot = false;
var rocketLaunched = false;
var rocketX = 0;
var rocketY = 0;

function drawSpaceship() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
        console.log("Go right");
    }
    else if(e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
        console.log("Go left");
    }
    if(e.key == "Up" || e.key == "ArrowUp") {
        upPressed = true;
        console.log("Go up");
        console.log("Spaceship Y:" + spaceshipY);
    }
    else if(e.key == "Down" || e.key == "ArrowDown") {
        downPressed = true;
        console.log("Go down");
        console.log("Spaceship Y: " + spaceshipY);
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

function drawAlien() {
    var image = new Image(); // Image constructor
    image.src = './spaceship.png';
    ctx.drawImage(image, spaceshipX, spaceshipY, 60, 60);
    ctx.closePath();
}

function drawRocket() {
    ctx.beginPath();
    ctx.arc(rocketX, rocketY, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
    console.log(rocketY);
    if(shot && rocketLaunched) {
        if (rocketY < 0){
            console.log("Rocket arrived to the end of canvas");
            shot = false;
            rocketLaunched = false;
        }
        else {
            rocketY = rocketY -= 7;
        }
    }
    else {
        rocketX = spaceshipX + (paddleWidth / 2);
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

function drawBullet() {
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
        spaceshipX += 4;
        if (spaceshipX + paddleWidth > canvas.width){
            spaceshipX = canvas.width - paddleWidth;
        }
    }
    else if(leftPressed) {
        spaceshipX -= 4;
        if (spaceshipX < 0){
            spaceshipX = 0;
        }
    }

    if(upPressed) {
        spaceshipY -= 4;
        if (spaceshipY < 0){
            spaceshipY = 0;
        }
    }

    else if(downPressed) {
        spaceshipY += 4;
        if (spaceshipY + spaceshipHeight > canvas.height){
            spaceshipY = canvas.height - spaceshipHeight;
        }
    }
    
    //x += dx;
    //y += dy;
}

setInterval(draw, 10);