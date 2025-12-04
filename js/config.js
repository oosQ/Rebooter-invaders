import { squares, manageInvaders, moveInvaders } from "./main.js";

export const DOM = {
    grid: document.querySelector(".grid"),
    result: document.querySelector(".result"),
    timerDisplay: document.querySelector(".timer"),
    livesDisplay: document.querySelector(".lives"),
    fpsDisplay: document.querySelector(".fps-display"),
    levelDisplay: document.querySelector(".level"),
    gamePopup: document.getElementById("gamePopup"),
    popupTitle: document.getElementById("popupTitle"),
    popupMessage: document.getElementById("popupMessage"),
    backToMenuBtn: document.getElementById("backToMenuBtn"),
    restartBtn: document.getElementById("restartBtn"),
    resumeBtn: document.getElementById("resumeBtn"),
};

export const gameStates = {
    width: 15,
    gameTime: 60,
    maxLevels: 5,
    frameCount: 0,
    fps: 0,
    pausedTime: null,
    currentShooterIndex: 202,
    alienInvaders: [],
    shooterInvaders: [],
    aliensRemoved: [],
    shooterRemoved: [],
    result: 0,
    direction: 1,
    goingRight: true,
    lives: 3,
    gameStarted: false,
    isPaused: false,
    animationFrameId: null,
    invaderInterval: 500,
    level: 1,
    lastInvaderMoveTime: 0,
    lastFpsUpdateTime: 0,
    lastMoveTime: 0,
    lastShotTime: 0,
    lastInvaderShootTime: 0,
    gameStartTime: null,
    remainingTime: 60,
    keys: {},
    gameOver: false,
    bossHealth: 3,
    bossPosition: -1,
    bossDirection: 1,
    isGameRestarted: false,
    shooterDirection: 1,
    shooterGoingRight: true,
    bossGoingRight: true,
    invaderMoveInterval: 600,
};

export const levels = {
    1: {
        invaders: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39,
        ],
        staticpositions:  [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39,
        ],
        movementSpeed: 550,
        timeBonus: 10,
    },
    2: {
        invaders: [
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49, 50, 51, 52,
            53, 54,
        ],
        staticpositions:  [
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49, 50, 51, 52,
            53, 54,
        ],
        shooterInvaders: [1, 3, 5, 7],
        movementSpeed: 520,
        timeBonus: 20,
    },
    3: {
        invaders: [
            45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 60, 61, 62, 63, 64, 65, 66, 67,
            68, 69, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
        ],
        staticpositions:  [
            45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 60, 61, 62, 63, 64, 65, 66, 67,
            68, 69, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
        ],
        shooterInvaders: [1, 3, 5, 7, 16, 18, 20, 22],
        movementSpeed: 510,
        timeBonus: 21,
    },
    4: {
        invaders: [
            60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 75, 76, 77, 78, 79, 80, 81, 82,
            83, 84, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 105, 106, 107, 108, 109,
            110, 111, 112, 113, 114,
        ],
        staticpositions:  [
            60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 75, 76, 77, 78, 79, 80, 81, 82,
            83, 84, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 105, 106, 107, 108, 109,
            110, 111, 112, 113, 114,
        ],
        shooterInvaders: [1, 3, 5, 7, 9, 16, 18, 20, 22, 24],
        movementSpeed: 505,
        timeBonus: 23,
    },
    5: {
        invaders: [
            75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
            90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
            105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
            120, 121, 122, 123, 124, 125, 126, 127, 128, 129,
        ],
        staticpositions:  [
            75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
            90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
            105, 106, 107, 108, 109, 110, 111, 112, 113, 114,
            120, 121, 122, 123, 124, 125, 126, 127, 128, 129,
        ],
        shooterInvaders: [1, 3, 5, 7, 11, 13, 16, 18, 20, 22, 24, 26, 28],
        bossPosition: 9,
        movementSpeed: 600,
        timeBonus: 20,
    },
};

export function showPopup(title, message, showResume = false) {
    DOM.popupTitle.textContent = title;
    DOM.popupMessage.textContent = message;
    DOM.resumeBtn.style.display = showResume ? "block" : "none";
    DOM.gamePopup.classList.add("show");
}

export function hidePopup() {
    DOM.gamePopup.classList.remove("show");
}

function initializeLevel(level) {
    const currentLvl = levels[level];
    gameStates.alienInvaders = [];
    gameStates.shooterInvaders = [];
    gameStates.aliensRemoved = [];
    gameStates.shooterRemoved = [];
    gameStates.alienInvaders.push(...currentLvl.invaders);
    if (currentLvl.shooterInvaders) gameStates.shooterInvaders.push(...currentLvl.shooterInvaders);
    if (currentLvl.bossPosition !== undefined) {
        gameStates.bossPosition = currentLvl.bossPosition;
    } else {
        gameStates.bossPosition = -1;
    }

    gameStates.invaderMoveInterval = currentLvl.movementSpeed;

    if (DOM.levelDisplay) DOM.levelDisplay.textContent = level;

    if (level > 1) {
        gameStates.gameTime += currentLvl.timeBonus;
        if (DOM.timerDisplay) DOM.timerDisplay.textContent = gameStates.remainingTime;
    }
}

export function nextLevel() {
    gameStates.level++;
    addSound("nextlevel");
    manageInvaders("remove");
    gameStates.direction = 1;
    gameStates.goingRight = true;
    initializeLevel(gameStates.level);
    manageInvaders("add");
}

export function updateTimer() {
    if (gameStates.isPaused || gameStates.gameOver) return;
    const currentTime = performance.now();
    if (!gameStates.gameStartTime) gameStates.gameStartTime = currentTime;

    const elapsedTime = Math.floor((currentTime - gameStates.gameStartTime) / 1000);
    gameStates.remainingTime = gameStates.gameTime - elapsedTime;
    DOM.timerDisplay.innerHTML = gameStates.remainingTime;

    if (gameStates.remainingTime <= 0) {
        DOM.timerDisplay.innerHTML = "Time's Up!";
        gameStates.gameOver = true;
        cancelAnimationFrame(gameStates.animationFrameId);
        addSound("timeup");
        showPopup("Game Over", `Time's up! Final Score: ${gameStates.result}`);
        endGame();
        return;
    }
}

// Start the game
export function startGame() {
    if (gameStates.gameStarted || gameStates.gameOver) return;
    gameStates.gameStarted = true;
    initializeLevel(gameStates.level);
    manageInvaders("add");
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    gameStates.animationFrameId = requestAnimationFrame(moveInvaders);
}

// End the game
export function endGame() {
    if (gameStates.gameOver) return;
    gameStates.gameStarted = false;
    gameStates.gameOver = true;
    document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);
    cancelAnimationFrame(gameStates.animationFrameId);
}

// Pause the game
export function pauseGame() {
    if (!gameStates.gameStarted || gameStates.gameOver) return;
    
    if (!gameStates.isPaused) {
        gameStates.pausedTime = performance.now();
        gameStates.isPaused = true;
        
        // Cancel the current animation frame
        if (gameStates.animationFrameId) {
            cancelAnimationFrame(gameStates.animationFrameId);
            gameStates.animationFrameId = null;
        }
        
        showPopup("Game Paused", "Press ESC or click Resume to continue", true);
    }
}

// Resume the game
export function resumeGame() {
    if (!gameStates.gameStarted || gameStates.gameOver) return;
    
    if (gameStates.isPaused) {
        if (gameStates.pausedTime) {
            const pauseDuration = performance.now() - gameStates.pausedTime;
            if (gameStates.gameStartTime) {
                gameStates.gameStartTime += pauseDuration;
            }
        }
        gameStates.isPaused = false;
        gameStates.pausedTime = null;
        hidePopup();
        
        // Restart the animation loop
        if (!gameStates.animationFrameId) {
            gameStates.animationFrameId = requestAnimationFrame(moveInvaders);
        }
    }
}

// Restart the game by resetting all variables and the grid
export function restartGame() {
    // Reset all game states
    gameStates.keys = {};
    gameStates.isPaused = false;
    gameStates.pausedTime = null;
    
    // Cancel any running animation frames
    if (gameStates.animationFrameId) {
        cancelAnimationFrame(gameStates.animationFrameId);
        gameStates.animationFrameId = null;
    }
    
    gameStates.gameStarted = false;
    gameStates.gameOver = false;
    gameStates.isGameRestarted = true;
    
    // Clear the grid
    squares.forEach((square) => { 
        square.classList.remove("invader", "shooter", "laser", "boom", "enemy-laser", "shooter-invader", "boss"); 
    });
    
    // Reset game variables
    gameStates.result = 0;
    gameStates.lives = 3;
    gameStates.level = 1;
    gameStates.direction = 1;
    gameStates.goingRight = true;
    gameStates.aliensRemoved = [];
    gameStates.shooterRemoved = [];
    gameStates.alienInvaders = [];
    gameStates.shooterInvaders = [];
    gameStates.currentShooterIndex = 202;
    gameStates.lastInvaderMoveTime = 0;
    gameStates.lastInvaderShootTime = 0;
    gameStates.invaderInterval = 500;
    gameStates.gameStartTime = null;
    gameStates.gameTime = 60;
    gameStates.remainingTime = 60;
    gameStates.bossHealth = 3;
    gameStates.bossPosition = -1;
    gameStates.bossDirection = 1;
    
    // Update display elements
    if (DOM.result) DOM.result.innerHTML = gameStates.result;
    if (DOM.livesDisplay) DOM.livesDisplay.innerHTML = gameStates.lives;
    if (DOM.timerDisplay) DOM.timerDisplay.innerHTML = gameStates.remainingTime;
    if (DOM.levelDisplay) DOM.levelDisplay.textContent = gameStates.level;
    
    hidePopup();
    
    // Start the game after a short delay to ensure everything is reset
    setTimeout(() => {startGame()}, 100);
}

// Handle key presses
export function keyDownHandler(e) {
    if (e.code === "Escape") {
        if (gameStates.isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    } else if (e.code === "KeyR") {
        restartGame();
    } else if (e.code === "Space") {
        gameStates.keys[e.code] = true;
        e.preventDefault();
    } else if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        gameStates.keys[e.code] = true;
    }
}
export function keyUpHandler(e) {
    if (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "Space") gameStates.keys[e.code] = false;
}

export function calculateFPS() {
    gameStates.frameCount++;
    const currentTime = performance.now();
    if (currentTime - gameStates.lastFpsUpdateTime >= 1000) {
        gameStates.fps = gameStates.frameCount;
        DOM.fpsDisplay.innerHTML = gameStates.fps;
        gameStates.frameCount = 0;
        gameStates.lastFpsUpdateTime = currentTime;
    }
}

export function addSound(src) {
    switch (src) {
        case "fire":
            let fireSound = new Audio("../utils/sounds/fire.mp3");
            fireSound.volume = 0.5;
            fireSound.play();
            break;
        case "hit":
            let explosionSound = new Audio("../utils/sounds/punch.mp3");
            explosionSound.volume = 0.5;
            explosionSound.play();
            break;
        case "gameover":
            let failSound = new Audio("../utils/sounds/fail-sound.mp3");
            failSound.volume = 0.5;
            failSound.play();
            let gameOverSound = new Audio("../utils/sounds/game-over.mp3");
            gameOverSound.volume = 0.5;
            setTimeout(() => gameOverSound.play(), 2000);
            break;
        case "victory":
            let victorySound = new Audio("../utils/sounds/congrat.mp3");
            victorySound.volume = 0.5;
            victorySound.play();
            break;
        case "nextlevel":
            let nextLevelSound = new Audio("../utils/sounds/level-up.mp3");
            nextLevelSound.volume = 0.5;
            nextLevelSound.play();
            break;
        case "timeup":
            let timeUpSound = new Audio("../utils/sounds/times-up.mp3");
            timeUpSound.volume = 0.5;
            timeUpSound.play();
            break;
        case "hurt":
            let hurtSound = new Audio("../utils/sounds/hurt.mp3");
            hurtSound.volume = 0.5;
            hurtSound.play();
            break;
        case "enemy-laser":
            let enemyLaserSound = new Audio("../utils/sounds/shooter-fire.mp3");
            enemyLaserSound.volume = 0.5;
            enemyLaserSound.play();
            break;
    }
}