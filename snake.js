var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var blockWidth = 25;
var blockHeight = 25;

context.canvas.width  = Math.floor((window.innerWidth)/blockWidth)*blockWidth;
context.canvas.height = Math.floor((window.innerHeight-100)/blockHeight)*blockHeight;

var height = canvas.height;
var width = canvas.width;

var columns = Math.round(width/blockWidth);
var rows = Math.round(height/blockHeight);

var xIndex = columns-1;
var yIndex = rows-1;

var baseColor = '#000';
var direction = 1;
var initialSpeed = 350;
var maxSpeed = 125;
var speed = initialSpeed;
var runtime = 0;
var count = 0;
var score = 0;
var scoreMultiplier = 30;
var updater;
var temp;

var posX = Math.round((width/blockWidth)/2)-1;
var posY = Math.round((height/blockHeight)/2)-1;

var snake = [ [posX, posY] ];
var snakeLength = snake.length;

var fruitX;
var fruitY;
var fruitColor = generateRandomColor();
var fruits = new Array();

start();

function start(){
    updateSpeedHtml();
    drawGrid();

    //context.fillRect( (Math.round((width/blockWidth)/2)*blockWidth)-blockWidth, (Math.round((height/blockHeight)/2)*blockHeight)-blockHeight, blockWidth, blockHeight);
    context.fillRect( snake[0][0]*blockWidth, snake[0][1]*blockHeight, blockWidth, blockHeight);
    makeFruit();
    makeFruit();
    makeFruit();
    makeFruit();

    updater = setInterval(function(){ update() }, speed);
}

function drawLine(startX, startY, endX, endY){
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.stroke();
}

function drawVerticalLines(){
    for (var j = 0; j < (height/blockWidth); j++) {
        drawLine(0, j*blockHeight, width, j*blockWidth);
    }
}

function drawHorizontalLines(){
    for (var i = 0; i < (width/blockWidth); i++) {
        drawLine(i*blockWidth, 0, i*blockHeight, height);
    }
}

function drawBorder(){
    context.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawGrid(){
    clearCanvas();

    context.fillStyle = baseColor;

    drawBorder();

    //DRAW ONLY THE BORDER
    //drawHorizontalLines();
    //drawVerticalLines();
}

function update(){
    runtime += 1000;
    count += 1;

    if (speed > maxSpeed) {
        speed = initialSpeed - (score*scoreMultiplier)
        if (count < 250) {
            speed -= roundToTwo(count/initialSpeed*10);
        }
    } else {
        if (score >= 40 && score < 80 && (count % 10) == 0) {
            speed -= 1;
        } else if (score >= 80 && score <= 110) {
            speed = maxSpeed/2;
        }

        if (speed > maxSpeed/4) {
            if (score >= 110 && (count % 10) == 0) {
                speed -= .5;
            } else if (score > 150) {
                speed = maxSpeed/2;
            }
        }

        if (fruits.length < 5) {
            makeFruit();
        }

        if (maxSpeed < 100 && score > 40) {
            makeFruit();
            makeFruit();
            makeFruit();

            if (score > 80) {
                makeFruit();
                makeFruit();
                makeFruit();
            }
        }
    }

    updateScoreHtml();
    updateSpeedHtml();

    drawGrid();
    drawSnake();
    drawFruits();

    clearUpdater();
    startUpdater();
}

function updateScoreHtml(){
    document.getElementById('score').innerHTML = score;
}

function updateSpeedHtml(){
    document.getElementById('speed').innerHTML = speed;
}

function drawSnake(){

    if ( (snake[0][0] < 0 || snake[0][1] < 0) || ( snake[0][0] > (width/blockWidth-1) || snake[0][1] > (height/blockHeight-1) ) ) {
        kill();
    }

    for (var i = 0; i < fruits.length; i++) {
        if (snake[0][0] == fruits[i][0] && snake[0][1] == fruits[i][1]) {
            score += 1;
            switch (direction) {
                case 1:
                    snake[snakeLength] = [snake[snakeLength-1][0], snake[snakeLength-1][1]+1];
                    break;
                case 2:
                    snake[snakeLength] = [snake[snakeLength-1][0]-1, snake[snakeLength-1][1]];
                    break;
                case 3:
                    snake[snakeLength] = [snake[snakeLength-1][0], snake[snakeLength-1][1]-1];
                    break;
                case 4:
                    snake[snakeLength] = [snake[snakeLength-1][0]+1, snake[snakeLength-1][1]];
                    break;

            }
            snakeLength = snake.length;

            deleteFruit(i);
            if (fruits.length < 3) {
                makeFruit();
            }
        }
    }

    //Can not go opposite way of tail
    if (direction == 1) {
        //Up
        if (snakeLength > 1) {
            snake.pop();
            temp = snake[0];
            snake.unshift([temp[0],temp[1]-1]);
        } else {
            snake[0][1] = snake[0][1]-1;
        }

    } else if (direction == 2) {
        //Right
        if (snakeLength > 1) {
            snake.pop();
            temp = snake[0];
            snake.unshift([temp[0]+1,temp[1]]);
        } else {
            snake[0][0] = snake[0][0]+1;
        }

    } else if (direction == 3) {
        //Down
        if (snakeLength > 1) {
            snake.pop();
            temp = snake[0];
            snake.unshift([temp[0],temp[1]+1]);
        } else {
            snake[0][1] = snake[0][1]+1;
        }
    } else if (direction == 4) {
        //Left
        if (snakeLength > 1) {
            snake.pop();
            temp = snake[0];
            snake.unshift([temp[0]-1,temp[1]]);
        } else {
            snake[0][0] = snake[0][0]-1;
        }
    }

    snakeLength = snake.length;

    for (var i = 1; i < snakeLength; i++) {
        if (snake[i][0] == snake[0][0] && snake[i][1] == snake[0][1]) {
            //kill switch
            kill();
        }
    }


    for (i = 0; i < snakeLength; i++) {
        context.fillStyle = baseColor;
        if (i != 0) {
            context.fillStyle = baseColor;
        }
        context.fillRect( snake[i][0]*blockWidth, snake[i][1]*blockWidth, blockWidth, blockHeight);
    }
}

function clearCanvas(){
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#FFF';
    context.rect(0, 0, width, height);
    context.fillStyle = baseColor;
}

function clearUpdater(){
    updater = clearInterval(updater);
}

function startUpdater(){
    updater = setInterval(function(){ update() }, speed);
}

function kill(){
    clearCanvas();
    clearUpdater();

    context.font="30px Helvetica";
    context.fillText('Gameover!', width/2, height/2 );
    context.font="15px Helvetica";
    context.fillText('Score: '+score, width/2, height/2+30 );
    setTimeout(function(){ window.location.reload() }, 2500);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deleteFruit(el){
    fruits.splice(el, 1);
}

function makeFruit(){
    fruitX = getRandomIntInclusive(3, xIndex-3);
    fruitY = getRandomIntInclusive(3, yIndex-3);

    for (var i = 0; i < snakeLength; i++) {
        if (fruitX == snake[i][0] && fruitY == snake[i][1]) {
            console.log('Hit another fruit');
            makeFruit();
            console.log('Still running');
        }
    }

    /*if (fruits.length > 1) {
        for (var i = 0; i < fruits.length; i++) {
            if (fruitX == fruits[i][0] && fruitY == fruits[i][1]) {
                console.log('Hit snake');
                makeFruit();
                console.log('Still running');
            } else {
                create = true;
            }
        }
    }*/

    fruitColor = generateRandomColor();

    fruits.push([fruitX, fruitY, fruitColor]);
}

function drawFruits(){
    for (var i = 0; i < fruits.length; i++) {
        context.fillStyle = fruits[i][2];
        context.fillRect( fruits[i][0]*blockWidth, fruits[i][1]*blockHeight, blockWidth, blockHeight);
    }

    context.fillStyle = baseColor;
}

function generateRandomColor(ranges) {
    if (!ranges) {
        ranges = [
            [150,256],
            [0, 190],
            [0, 30]
        ];
    }
    var g = function() {
        //select random range and remove
        var range = ranges.splice(Math.floor(Math.random()*ranges.length), 1)[0];
        //pick a random number from within the range
        return Math.floor(Math.random() * (range[1] - range[0])) + range[0];
    }
    return "rgb(" + g() + "," + g() + "," + g() +")";
}

document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 37:
            if (direction != 2) {
                direction = 4;
                //update();
            }
            break;
        case 38:
            if (direction != 3) {
                direction = 1;
                //update();
            }
            break;
        case 39:
            if (direction != 4) {
                direction = 2;
                //update();
            }
            break;
        case 40:
            if (direction != 1) {
                direction = 3;
                //update();
            }
            break;
        case 80:
            if (updater !== undefined) {
                clearUpdater();
            }
            break;
        case 82:
            if (updater === undefined) {
                startUpdater();
            }
            break;
    }
};

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}
