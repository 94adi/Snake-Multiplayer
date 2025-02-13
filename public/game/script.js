import { submitScore } from "../scores_library/scoresLibrary.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const MARGIN_SIZE = 150;
const MIN_SIZE = 300;

const SNAKE_SIZE = 20;

const dir = Object.freeze({
    Up: "ArrowUp",
    Down: "ArrowDown",
    Left: "ArrowLeft",
    Right: "ArrowRight"
});

const directions = Object.freeze({
    [dir.Up]: { x: 0, y: -SNAKE_SIZE },
    [dir.Down]: { x: 0, y: SNAKE_SIZE },
    [dir.Left]: { x: -SNAKE_SIZE, y: 0 },
    [dir.Right]: { x: SNAKE_SIZE, y: 0 }
});

const sounds = {
    eat: new Audio("music/eat.mp3"),
    gameOver: new Audio("music/game_over.mp3"),
    stepOne: new Audio("music/step1.mp3"),
    stepTwo: new Audio("music/step2.mp3"),
};

const scoreDisplay = document.getElementById("score");
const defaultDirection = dir.Right;

let direction = defaultDirection;


let canvasWidth = window.innerWidth - MARGIN_SIZE;
let canvasHeight = window.innerHeight - MARGIN_SIZE;

let snake = [{ x: 100, y: 100 }];

let food = { x: 200, y: 200 };
let score = 0;
let isGameRunning = true;


document.addEventListener("keydown", handleKeyPress);
canvas.addEventListener("mousedown", handleUIInput);
canvas.addEventListener("touchstart", handleUIInput);

function handleUIInput(e)
{
    let gameRectangle = canvas.getBoundingClientRect();
    let clickX, clickY;
    const head = snake[0];
    let newDirection;

    if (!isGameRunning) {
        location.reload();
        return;
    }

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
        newDirection = dx > 0 ? dir.Right : dir.Left;
    } 
    else 
    {
        newDirection = dy > 0 ? dir.Down : dir.Up;
    }

    if(!isSelfCollision(newDirection))
    {
        direction = newDirection;
    }

    e.preventDefault();
}

function handleKeyPress(e) {
    if (e.code === "Space" && !isGameRunning) {
        location.reload();
        return;
    }

    let isNewDir = (directions[e.key] && e.key !== direction);

    if(isNewDir && !isSelfCollision(e.key)){
        direction = e.key;
    }
}

function updateCanvasSize() {
    canvasWidth = Math.max(window.innerWidth - MARGIN_SIZE, MIN_SIZE);
    canvasHeight = Math.max(window.innerHeight - MARGIN_SIZE, MIN_SIZE);

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
    ctx.fillText("Press SPACE or TAP", canvas.width / 2, canvas.height / 2 + 30);
}

function drawSnake() {
    ctx.fillStyle = "green";
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, SNAKE_SIZE, SNAKE_SIZE);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, SNAKE_SIZE, SNAKE_SIZE);
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

    if(checkWallCollision())
    {
        playSound(sounds.gameOver);
        gameOver();
        return;
    }

    snake.pop();
}

function generateFood() {
    const cols = Math.floor(canvas.width / SNAKE_SIZE); // Total columns
    const rows = Math.floor(canvas.height / SNAKE_SIZE); // Total rows

    const x = Math.floor(Math.random() * cols) * SNAKE_SIZE;
    const y = Math.floor(Math.random() * rows) * SNAKE_SIZE;

    return { x, y };
}

function checkFoodCollision(){
    const head = snake[0];
    const tolerance = SNAKE_SIZE / 2;

    let foodCollisionCondition = (
        head.x < food.x + tolerance &&
        head.x + SNAKE_SIZE > food.x - tolerance &&
        head.y < food.y + tolerance &&
        head.y + SNAKE_SIZE > food.y - tolerance);

    if(foodCollisionCondition){
        updateScore();
        growSnake();
        playSound(sounds.eat);
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

    if (direction === dir.Up) {
        newBlock.y = tail.y + SNAKE_SIZE;
    } else if (direction === dir.Down) {
        newBlock.y = tail.y - SNAKE_SIZE;
    } else if (direction === dir.Left) {
        newBlock.x = tail.x + SNAKE_SIZE;
    } else if (direction === dir.Right) {
        newBlock.x = tail.x - SNAKE_SIZE;
    }

    snake.push(newBlock);
}

function playSound(sound){
    sound.currentTime = 0;
    sound.play();
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
    playSound(sounds.stepOne);
}

function getPlayerNameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('name');
}

function isOppositeDirection(newDir) {
    return (direction === dir.Up && newDir === dir.Down) ||
           (direction === dir.Down && newDir === dir.Up) ||
           (direction === dir.Left && newDir === dir.Right) ||
           (direction === dir.Right && newDir === dir.Left);
}

function wouldCollideWithSelf(newDir) {
    let nextX = snake[0].x;
    let nextY = snake[0].y;

    if (newDir === dir.Up) nextY -= SNAKE_SIZE;
    if (newDir === dir.Down) nextY += SNAKE_SIZE;
    if (newDir === dir.Left) nextX -= SNAKE_SIZE;
    if (newDir === dir.Right) nextX += SNAKE_SIZE;

    return snake.some(segment => segment.x === nextX && segment.y === nextY);
}

function isSelfCollision(key){
    let result = (isOppositeDirection(key) && wouldCollideWithSelf(key));
    return result;
}

window.addEventListener("resize", updateCanvasSize);

updateCanvasSize();

const gameLoopInterval = setInterval(gameLoop, 100);

const gameSoundTrackInterval = setInterval(gameSoundtrack, 1200);