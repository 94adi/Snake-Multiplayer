const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const snakeSize = 20;
let snake = [{ x: 100, y: 100 }];
let direction = "ArrowRight"; // Initial direction
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

function moveSnake() {
    const head = { x: snake[0].x + directions[direction].x, y: snake[0].y + directions[direction].y };
    snake.unshift(head); // Add new head to the front
    snake.pop(); // Remove the last segment (tail)
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    moveSnake();
    drawSnake();
    drawFood(); 
}

setInterval(gameLoop, 100);