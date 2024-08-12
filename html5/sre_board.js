var sre_canvas = document.getElementById("SreBoardCanvas");
var sre_ctx = sre_canvas.getContext("2d");
if (!sre_canvas) console.error("Canvas element not found");

var spaceshipHeight = 60;
var spaceshipWidth = 60;
var spaceshipX = (sre_canvas.width-spaceshipWidth)/2;
var spaceshipY = (sre_canvas.height-spaceshipHeight)/2;
var x = sre_canvas.width/2;
var y = sre_canvas.height-30;
// Button vars
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var spaceship_image_path = './images/spaceship-right.png';
var cube_start_x = 0;
var cube_start_y = 5;
var sre_spaceship_x = 5;
var sre_spaceship_y = 30;
var spaceship_first_position = true;
var down_direction_permitted = false;
var right_direction_permitted = true;
var left_direction_permitted = true;
var cube_link_counter = 0;

var clusterJsonStructure = {
    "name": "Cluster",  // Cluster name
    "namespaces": [
        {
            "name": "Namespace",
            "labels": [
                {
                    "name": "Label",
                    "value": "foobar"
                }
            ],
            "annotations": [
                {
                    "name": "Annotation",
                    "value": "foobar"
                }
            ],
            "pods": [
                {
                    "name": "Pod",
                    "status": "Running",
                    "cpu_usage": "10",
                    "memory_usage": "20",
                    "disk_usage": "30"
                }
            ]
        }
    ],
    "k8s_masters": [
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        },
        {
            "hostname": "k8s-master-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        }
    ],
    "k8s_workers": [
        {
            "hostname": "k8s-worker-1",
            "cpu_usage": "10",
            "memory_usage": "20",
            "disk_usage": "30"
        }
    ]
}

function SreKeyDownHandler(e) {
    e.preventDefault();
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
        spaceship_image_path = './images/spaceship-right.png';

    }
    else if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
        spaceship_image_path = './images/spaceship-left.png';
    }
    if (e.key == "Up" || e.key == "ArrowUp") {
        upPressed = true;
        spaceship_image_path = './images/spaceship-down.png';
    }
    else if ((e.key == "Down" || e.key == "ArrowDown")) {
        downPressed = true;
        spaceship_image_path = './images/spaceship-down.png';
    }
}

function SreKeyUpHandler(e) {
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

function sreDrawSpaceship() {
    var image = new Image(); // Image constructor
    image.src = spaceship_image_path
    sre_ctx.drawImage(image, sre_spaceship_x, sre_spaceship_y, 50, 50);
    sre_ctx.closePath();
}

function drawCube(x,y) {
    var image = new Image(); // Image constructor
    image.src = './images/sre_board_cube.png';
    sre_ctx.drawImage(image, x, y, 102, 102);
    sre_ctx.closePath();
}

function SpaceshipPermitDown(x, y) {
    if (x > 1030) {
        right_direction_permitted = false;
        left_direction_permitted = false;
        return true;
    }
    return false;
}

function SpaceshipPermitUp(y) {
    if ( y < 10 ) {
        return true;
    }
    return false;
}

function SpaceshipPermitLeft(y) {
    console.log("Y: " + String(y) + " " + String(cube_link_counter));
    let cube_link_y = 0;

    if (y < 92) {
        return true
    }

    for (let i = 1; i <= cube_link_counter; i++) {

        if (( i % 2 != 0 )) {
            console.log("foo1: " + String(i * 92));
            console.log("foo2: " + String((i * 92) + 92));

            if (y > ((i + 1) * 92) && y <= ((i + 1) * 92) + 92) {
                return true;
            }
        }
        
        cube_link_y = cube_link_y + 92;
    }
    
    return false;
}

function SpaceshipPermitRight(x) {
    if (x < 1036 ) {
        return true;
    }
    return false;
}

function is_last_cube_in_row(i) {
    if (i % 12 == 0 && i != 0) {
        return true;
    }
    return false;
}

function x_starting_point(change_direction) {
    let x;
    if (change_direction) {
        x = 0;
    } else {
        x = 1012;
    }
    return x;
}

function x_increment(change_direction) {
    let x;
    if (change_direction) {
        x = -92;
    } else {
        x = 92;
    }
    return x;

}

function y_change_row(y) {
    y = y + 92;
    return y;
}

function drawClusterCanvasfromClusterJsonStructure() {
    var x = cube_start_x;
    var y = cube_start_y;
    var change_direction = false;
    var link_cube = false;
    cube_link_counter = 0;

    for (var i = 0; i < clusterJsonStructure.k8s_masters.length; i++) {

        if (change_direction) {
            x = x_starting_point(change_direction);
            change_direction = false;
        }
    
        if (is_last_cube_in_row(i)) {
            console.log("last cube");
            y = y_change_row(y);
            drawCube(x, y);
            change_direction = true;
            link_cube = true;
        } else {
            x = x + x_increment(change_direction);
            drawCube(x, y);
        }

        // if (link_cube) {
        //     y = y_change_row(y);
        //     link_cube = false
        //     cube_link_counter = cube_link_counter + 1;
        //     change_direction = true;
        // }
 
    }
}

window.setInterval(function sreDraw() {
    sre_ctx.clearRect(0, 0, sre_canvas.width, sre_canvas.height);

    //drawClusterCanvasfromClusterJsonStructure()
    sreDrawSpaceship();
    drawCube(cube_start_x, cube_start_y);

    if (rightPressed && SpaceshipPermitRight(sre_spaceship_x)) {
        sre_spaceship_x += 3;
        if (sre_spaceship_x + spaceshipWidth >  sre_canvas.width) {
            sre_spaceship_x =  sre_canvas.width - spaceshipWidth;
        }
    }
    else if (leftPressed && SpaceshipPermitLeft(sre_spaceship_y)) {
        console.log(sre_spaceship_y);
        sre_spaceship_x -= 3;
        if (sre_spaceship_x < 0) {
            sre_spaceship_x = 0;
        }
    }

    if (upPressed && SpaceshipPermitUp(sre_spaceship_y)) {
        sre_spaceship_y -= 3;
        if (sre_spaceship_y < 0) {
            sre_spaceship_y = 0;
        }
    }

    else if (downPressed && SpaceshipPermitDown(sre_spaceship_x, sre_spaceship_y)) {
        sre_spaceship_y += 3;
        if (sre_spaceship_y + spaceshipHeight >  sre_canvas.height) {
            sre_spaceship_y =  sre_canvas.height - spaceshipHeight;
        }
    }

}, 0);

console.log("fooo");
document.addEventListener("keydown", SreKeyDownHandler, false);
document.addEventListener("keyup", SreKeyUpHandler, false);
//drawClusterCanvasfromClusterJsonStructure();