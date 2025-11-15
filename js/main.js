// Main Game Controller Module
import { width } from "./config.js";
import {
    DOM,
    gameState,
    showPopup,
    hidePopup,
    initializeLevel,
    addInvaders,
    removeInvaders,
    moveInvaders,
    calculateFPS,
    startEnemyShooting,
    stopEnemyShooting,
    updateTimer,
} from "./logic.js";

// Player Movement
function moveShooter(e) {
    if (gameState.gamePaused || gameState.gameOver) return;
    gameState.squares[gameState.shooterIndex].classList.remove("shooter");
    switch (e.key) {
        case "ArrowLeft":
            if (gameState.shooterIndex % width !== 0) gameState.shooterIndex -= 1;
            break;
        case "ArrowRight":
            if (gameState.shooterIndex % width < width - 1) gameState.shooterIndex += 1;
            break;
    }
    gameState.squares[gameState.shooterIndex].classList.add("shooter");
}

// Animation Loop
function animateInvaders(timestamp) {
    if (gameState.gamePaused || gameState.gameOver) return;

    if (!gameState.lastInvaderMove) gameState.lastInvaderMove = timestamp;

    if (timestamp - gameState.lastInvaderMove >= gameState.invaderMoveInterval) {
        moveInvaders();
        gameState.lastInvaderMove = timestamp;
    }
    calculateFPS();
    gameState.animationFrameId = requestAnimationFrame(animateInvaders);
}

// Shooting
function shoot(e) {
    if (e.key === " " && gameState.canShoot && !gameState.gamePaused && !gameState.gameOver) {
        gameState.canShoot = false;
        setTimeout(() => (gameState.canShoot = true), 300);

        let laserId;
        let currentLaserIndex = gameState.shooterIndex;
        let audio = new Audio("./utils/sounds/shooter-fire.mp3");
        audio.volume = 0.2;
        audio.play();

        function moveLaser() {
            gameState.squares[currentLaserIndex].classList.remove("laser");
            currentLaserIndex -= width;

            if (currentLaserIndex < 0) {
                clearInterval(laserId);
                return;
            }

            gameState.squares[currentLaserIndex].classList.add("laser");

            if (gameState.squares[currentLaserIndex].classList.contains("invader") || 
                gameState.squares[currentLaserIndex].classList.contains("shooter-invader") ||
                gameState.squares[currentLaserIndex].classList.contains("boss")
            ) {
                let punchAudio = new Audio("./utils/sounds/punch.mp3");
                punchAudio.volume = 0.2;
                punchAudio.play();
                gameState.squares[currentLaserIndex].classList.remove("laser");
                clearInterval(laserId);

                if (gameState.squares[currentLaserIndex].classList.contains("boss")) {
                    gameState.bossHealth--;
                    gameState.squares[currentLaserIndex].classList.add("boom");
                    setTimeout(() => gameState.squares[currentLaserIndex].classList.remove("boom"), 150);

                    if (gameState.bossHealth <= 0) {
                        gameState.squares[currentLaserIndex].classList.remove("boss");
                        gameState.bossPosition = -1;
                        gameState.score += 100 * gameState.currentLevel;
                    }
                } else {
                    gameState.squares[currentLaserIndex].classList.remove("invader");
                    gameState.squares[currentLaserIndex].classList.remove("shooter-invader");

                    const invaderIndex = gameState.alienInvaders.indexOf(currentLaserIndex);
                    if (invaderIndex !== -1) gameState.alienInvaders.splice(invaderIndex, 1);

                    const shooterInvaderIndex = gameState.shooterInvaders.indexOf(currentLaserIndex);
                    if (shooterInvaderIndex !== -1) gameState.shooterInvaders.splice(shooterInvaderIndex, 1);

                    gameState.squares[currentLaserIndex].classList.add("boom");
                    setTimeout(() => gameState.squares[currentLaserIndex].classList.remove("boom"),150);

                    const alienRemoved = gameState.alienInvaders.indexOf(currentLaserIndex);
                    gameState.invadersRemoved.push(alienRemoved);

                    const levelMultiplier = gameState.currentLevel;
                    gameState.score += 10 * levelMultiplier;
                }

                DOM.result.innerHTML = gameState.score;
            }
        }
        laserId = setInterval(moveLaser, 50);
    }
}

// Keyboard Controls
function handleKeyDown(e) {
    if (e.key === " " && !gameState.keys[e.key]) {
        gameState.keys[e.key] = true;
        shoot(e);
    }
}

function handleKeyUp(e) {
    if (e.key === " ") gameState.keys[e.key] = false;
}

function handleKeyPress(e) {
    if ((e.key.toLowerCase() === "p" || e.key === "Escape") &&!gameState.gameOver) {
        e.preventDefault();
        pauseGame();
    }
    if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        restartGame();
        hidePopup();
    }
}

// Game Control Functions
function pauseGame() {
    if (gameState.gameOver) return;
    gameState.gamePaused = !gameState.gamePaused;
    if (gameState.gamePaused) {
        DOM.resumeBtn.style.display = "flex";
        stopEnemyShooting();
        showPopup("GAME PAUSED", "Take a breather, warrior!");
    } else {
        hidePopup();
        if (gameState.currentLevel >= 2) {
            startEnemyShooting();
        }
    }
    if (!gameState.gamePaused && !gameState.gameOver)
        gameState.animationFrameId = requestAnimationFrame(animateInvaders);
}

function restartGame() {
    // Reset All game values
    gameState.gameOver = false;
    gameState.gamePaused = false;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.timeLeft = 60;
    gameState.isGoingRight = true;
    gameState.direction = 1;
    gameState.shooterGoingRight = true;
    gameState.shooterDirection = 1;
    gameState.shooterIndex = 202;
    gameState.canShoot = true;
    gameState.frameCount = 0;
    gameState.fps = 0;
    gameState.currentLevel = 1;

    gameState.invadersRemoved.length = 0;
    gameState.alienInvaders.length = 0;
    gameState.shooterInvaders.length = 0;
    gameState.enemyLasers.length = 0;

    gameState.bossPosition = -1;
    gameState.bossHealth = 3;
    gameState.bossDirection = 1;

    stopEnemyShooting();

    for (let i = 0; i < gameState.squares.length; i++) {
        gameState.squares[i].classList.remove(
            "invader",
            "shooter-invader",
            "shooter",
            "laser",
            "boss",
            "boom"
        );
    }

    initializeLevel(gameState.currentLevel);

    DOM.result.innerHTML = gameState.score;
    DOM.livesDisplay.textContent = gameState.lives;
    DOM.timerDisplay.textContent = gameState.timeLeft;
    DOM.levelDisplay.textContent = gameState.currentLevel;

    gameState.squares[gameState.shooterIndex].classList.add("shooter");
    addInvaders();

    cancelAnimationFrame(gameState.animationFrameId);
    clearTimeout(gameState.timerId);

    gameState.animationFrameId = requestAnimationFrame(animateInvaders);
    updateTimer();
}

// Event Listeners
document.addEventListener("keydown", moveShooter);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
document.addEventListener("keydown", handleKeyPress);

addEventListener("click", function (e) {
    if (e.target === DOM.backToMenuBtn) {
        window.location.href = "home.html";
    }
});

addEventListener("click", function (e) {
    if (e.target === DOM.restartBtn) {
        restartGame();
        hidePopup();
    }
});

DOM.resumeBtn.addEventListener("click", function () {
    hidePopup();
    pauseGame();
});

// Initialize Game
DOM.result.innerHTML = gameState.score;
DOM.livesDisplay.textContent = gameState.lives;
DOM.levelDisplay.textContent = gameState.currentLevel;

initializeLevel(gameState.currentLevel);
addInvaders();

gameState.animationFrameId = requestAnimationFrame(animateInvaders);
updateTimer();
