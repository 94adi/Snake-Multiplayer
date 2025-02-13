import { submitScore } from "../scores_library/scoresLibrary.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const marginSize = 150;
let canvasWidth = window.innerWidth - marginSize;
let canvasHeight = window.innerHeight - marginSize;
const minSize = 300;
let snakeSize = 20;
let snake = [{ x: 100, y: 100 }];
let direction = "ArrowRight";
let food = { x: 200, y: 200 };
let score = 0;
let isGameRunning = true;

const scoreDisplay = document.getElementById("score");
const eatSound = new Audio("music/eat.mp3");
const gameOverSound = new Audio("music/game_over.mp3");
const stepOneSound = new Audio("music/step1.mp3");
const stepTwoSound = new Audio("music/step2.mp3");

const directions = {
    "ArrowUp": { x: 0, y: -snakeSize },
    "ArrowDown": { x: 0, y: snakeSize },
    "ArrowLeft": { x: -snakeSize, y: 0 },
    "ArrowRight": { x: snakeSize, y: 0 }
};


document.addEventListener("keydown", function(e){
    let newDirection;

    if(directions[e.key] && e.key !== direction){
        newDirection = e.key;
    }

    if (!isOppositeDirection(newDirection) && !wouldCollideWithSelf(newDirection)) {
        direction = newDirection;
    }

    if (e.code === "Space" && !isGameRunning) {
        this.location.reload();
    }
});

canvas.addEventListener("mousedown", handleInput);
canvas.addEventListener("touchstart", handleInput);

function handleInput(e)
{
    let gameRectangle = canvas.getBoundingClientRect();
    let clickX, clickY;
    const head = snake[0];
    let newDirection;

    if (e.type === "touchstart") 
    {
        clickX = e.touches[0].clientX - gameRectangle.left;
        clickY = e.touches[0].clientY - gameRectangle.top;
    } 
    else 
    {
        clickX = e.clientX - gameRectangle.left;
        clickY = e.clientY - gameRectangle.top;
    }

    let dx = clickX - head.x;
    let dy = clickY - head.y;

    if (Math.abs(dx) > Math.abs(dy)) 
    {
        newDirection = dx > 0 ? "ArrowRight" : "ArrowLeft";
    } 
    else 
    {
        newDirection = dy > 0 ? "ArrowDown" : "ArrowUp";
    }

    if(!isOppositeDirection(newDirection) && !wouldCollideWithSelf(newDirection))
    {
        direction = newDirection;
    }

    e.preventDefault();
}

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
    clearInterval(gameLoopInterval);
    clearInterval(gameSoundTrackInterval);
    isGameRunning = false;
    const playerName = getPlayerNameFromURL() || "Unknown Player";
    //fire and forget
    submitScore(playerName, score);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const boxWidth = 400;
    const boxHeight = 250;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = (canvas.height - boxHeight) / 2;

    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    ctx.fillStyle = "#ffeb3b";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "35px Arial";
    ctx.fillText("Press Space to Retry", canvas.width / 2, canvas.height / 2 + 30);
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
        playSound(gameOverSound);
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

    return { x, y };
}

function checkFoodCollision(){
    const head = snake[0];
    const tolerance = snakeSize / 2;

    let foodCollisionCondition = (
        head.x < food.x + tolerance &&
        head.x + snakeSize > food.x - tolerance &&
        head.y < food.y + tolerance &&
        head.y + snakeSize > food.y - tolerance);

    if(foodCollisionCondition){
        updateScore();
        growSnake();
        playSound(eatSound);
        food = generateFood();
    }
}

function updateScore(){
    score++; 
    scoreDisplay.textContent = `Score: ${score}`;
}

function growSnake(){
    const tail = snake[snake.length - 1];
    let newBlock = { x: tail.x, y: tail.y };

    if (direction === "ArrowUp") {
        newBlock.y = tail.y + snakeSize;
    } else if (direction === "ArrowDown") {
        newBlock.y = tail.y - snakeSize;
    } else if (direction === "ArrowLeft") {
        newBlock.x = tail.x + snakeSize;
    } else if (direction === "ArrowRight") {
        newBlock.x = tail.x - snakeSize;
    }

    snake.push(newBlock);
}

function playSound(sound){
    sound.currentTime = 0;
    sound.play();
}

function playGameOverSound(){
    gameOverSound.currentTime = 0;
    gameOverSound.play();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawCanvasBorder();
    moveSnake();
    drawSnake();
    drawFood(); 
}

function gameSoundtrack(){
    playSound(stepOneSound);
}

function getPlayerNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

function isOppositeDirection(newDir) {
    return (direction === "ArrowUp" && newDir === "ArrowDown") ||
           (direction === "ArrowDown" && newDir === "ArrowUp") ||
           (direction === "ArrowLeft" && newDir === "ArrowRight") ||
           (direction === "ArrowRight" && newDir === "ArrowLeft");
}

function wouldCollideWithSelf(newDir) {
    let nextX = snake[0].x;
    let nextY = snake[0].y;

    if (newDir === "ArrowUp") nextY -= snakeSize;
    if (newDir === "ArrowDown") nextY += snakeSize;
    if (newDir === "ArrowLeft") nextX -= snakeSize;
    if (newDir === "ArrowRight") nextX += snakeSize;

    return snake.some(segment => segment.x === nextX && segment.y === nextY);
}

window.addEventListener("resize", updateCanvasSize);

updateCanvasSize();

const gameLoopInterval = setInterval(gameLoop, 100);

const gameSoundTrackInterval = setInterval(gameSoundtrack, 1200);