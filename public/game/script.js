const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let marginSize = 150;

let canvasWidth = window.innerWidth - marginSize;
let canvasHeight = window.innerHeight - marginSize;
const minSize = 300;

let snakeSize = 20;
let snake = [{ x: 100, y: 100 }];
let direction = "ArrowRight";
let food = { x: 200, y: 200 };

const directions = {
    "ArrowUp": { x: 0, y: -snakeSize },
    "ArrowDown": { x: 0, y: snakeSize },
    "ArrowLeft": { x: -snakeSize, y: 0 },
    "ArrowRight": { x: snakeSize, y: 0 }
};


document.addEventListener("keydown", function(e){
    if(directions[e.key] && e.key !== direction){
        direction = e.key;
    }
});

function updateCanvasSize() {
    canvasWidth = Math.max(window.innerWidth - marginSize, minSize);
    canvasHeight = Math.max(window.innerHeight - marginSize, minSize);

    snakeSize = Math.floor(Math.min(canvasWidth, canvasHeight) / snakeSize);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

function checkWallCollision(){
    const head = snake[0]; 
    let isColliding = (head.x < 0 || head.x > canvasWidth || head.y > canvasHeight || head.y < 0);

    if(isColliding){
        return true;
    }
    return false;
}

function checkSelfCollision(){
    const head = snake[0];

    for(let i = 1; i < snake.length; i++)
    {
        if(snake[i].x == head.x && snake[i].y == head.y)
        {
            return true;
        }
    }
    return false;
}

function gameOver(){
    alert("Game over :(");
    clearInterval(gameLoopInterval);
}

function drawSnake() {
    ctx.fillStyle = "green";
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, snakeSize, snakeSize);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, snakeSize, snakeSize);
}

function drawCanvasBorder() {
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 15;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
}

function drawBackground() {
    ctx.fillStyle = "#FAFAD2";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function moveSnake() {
    const head = { x: snake[0].x + directions[direction].x, y: snake[0].y + directions[direction].y };
    snake.unshift(head);

    checkFoodCollision();

    if(checkSelfCollision() || checkWallCollision())
    {
        gameOver();
        return;
    }

    snake.pop();
}

function generateFood() {
    const cols = Math.floor(canvas.width / snakeSize); // Total columns
    const rows = Math.floor(canvas.height / snakeSize); // Total rows

    const x = Math.floor(Math.random() * cols) * snakeSize;
    const y = Math.floor(Math.random() * rows) * snakeSize;

    console.log("Food new coords: x = " + x + " : y = " + y);
    return { x, y };
}

function checkFoodCollision(){
    const head = snake[0];
    const tolerance = snakeSize / 2;

    console.log("snake head: x = " + head.x + " y = " + head.y);

    let foodCollisionCondition = (
        head.x < food.x + tolerance &&
        head.x + snakeSize > food.x - tolerance &&
        head.y < food.y + tolerance &&
        head.y + snakeSize > food.y - tolerance);

    if(foodCollisionCondition){
        console.log("food colided");
        growSnake();
        food = generateFood();
    }
}

function growSnake(){
    const tail = snake[snake.length - 1];
    let newBlock = { x: tail.x, y: tail.y };

    if (direction === "ArrowUp") {
        newBlock.y = tail.y + snakeSize; // Add below the tail
    } else if (direction === "ArrowDown") {
        newBlock.y = tail.y - snakeSize; // Add above the tail
    } else if (direction === "ArrowLeft") {
        newBlock.x = tail.x + snakeSize; // Add to the right of the tail
    } else if (direction === "ArrowRight") {
        newBlock.x = tail.x - snakeSize; // Add to the left of the tail
    }

    snake.push(newBlock); // Add new block to the snake
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawCanvasBorder();
    moveSnake();
    drawSnake();
    drawFood(); 
}

window.addEventListener("resize", updateCanvasSize);

updateCanvasSize();

const gameLoopInterval = setInterval(gameLoop, 100);