import { 
    DOM, gameStates, showPopup, nextLevel, updateTimer, startGame, endGame, resumeGame, restartGame, calculateFPS, addSound,
    levels
} from "./config.js";

// Create cells as div elements and append to the grid (parent)
for (let i = 0; i < gameStates.width * gameStates.width; i++) {
    const square = document.createElement("div");
    DOM.grid.appendChild(square);
}
export const squares = Array.from(document.querySelectorAll(".grid div"));

// Remove/add class invaders
export function manageInvaders(condition) {
    switch (condition) {
        case "add":
            gameStates.alienInvaders.forEach((invader) => { squares[invader].classList.add("invader"); });
            if (gameStates.level > 1) gameStates.shooterInvaders.forEach((shooter) => { squares[shooter].classList.add("shooter-invader"); });
            if (gameStates.level === 5 && gameStates.bossHealth > 0 && gameStates.bossPosition !== -1) squares[gameStates.bossPosition].classList.add("boss");
            break;
        case "remove":
            gameStates.alienInvaders.forEach((invader) => { squares[invader].classList.remove("invader"); });
            if (gameStates.level > 1) gameStates.shooterInvaders.forEach((shooter) => { squares[shooter].classList.remove("shooter-invader"); });
            if (gameStates.level === 5 && gameStates.bossPosition !== -1) squares[gameStates.bossPosition].classList.remove("boss");
            break;
    }
}

// Move the shooter
function moveShooter() {
    const currentTime = performance.now();
    if (currentTime - gameStates.lastMoveTime >= 100) {
        gameStates.lastMoveTime = currentTime;
        squares[gameStates.currentShooterIndex].classList.remove("shooter");
        if (gameStates.keys["ArrowLeft"] && gameStates.currentShooterIndex % gameStates.width !== 0) gameStates.currentShooterIndex -= 1;
        if (gameStates.keys["ArrowRight"] && gameStates.currentShooterIndex % gameStates.width < gameStates.width - 1) gameStates.currentShooterIndex += 1;
        squares[gameStates.currentShooterIndex].classList.add("shooter");
    }
    if (gameStates.keys["Space"]) shootLaser();
}

function shootLaser() {
    if (gameStates.isPaused || gameStates.gameOver) return;

    const currentTime = performance.now();
    if (currentTime - gameStates.lastShotTime < 350) return;
    gameStates.lastShotTime = currentTime;
    let currentLaserIndex = gameStates.currentShooterIndex;
    addSound("fire");

    function moveLaser() {
        if (squares[currentLaserIndex]) squares[currentLaserIndex].classList.remove("laser");
        currentLaserIndex -= gameStates.width;

        if (currentLaserIndex < 0) return;

        squares[currentLaserIndex].classList.add("laser");

        if (squares[currentLaserIndex].classList.contains("invader") || squares[currentLaserIndex].classList.contains("shooter-invader") || squares[currentLaserIndex].classList.contains("boss")) {
            addSound("hit");
            squares[currentLaserIndex].classList.remove("laser");
            if (squares[currentLaserIndex].classList.contains("boss")) {
                gameStates.bossHealth--;
                if (gameStates.bossHealth <= 0) {
                    squares[currentLaserIndex].classList.remove("boss");
                    gameStates.bossPosition = -1;
                    gameStates.result += 50 * gameStates.level;
                }
            } else {
                squares[currentLaserIndex].classList.remove("invader");
                squares[currentLaserIndex].classList.remove("shooter-invader");

                const invaderIndex = gameStates.alienInvaders.indexOf(currentLaserIndex);
                if (invaderIndex !== -1) gameStates.alienInvaders.splice(invaderIndex, 1);

                const shooterInvaderIndex = gameStates.shooterInvaders.indexOf(currentLaserIndex);
                if (shooterInvaderIndex !== -1) gameStates.shooterInvaders.splice(shooterInvaderIndex, 1);

                const alienRemoved = gameStates.alienInvaders.indexOf(currentLaserIndex);
                if (alienRemoved !== -1) gameStates.invadersRemoved.push(alienRemoved);
                gameStates.result += 10 * gameStates.level;
            }
            DOM.result.innerHTML = gameStates.result;
        } else {
            requestAnimationFrame(moveLaser);
        }
    }
    requestAnimationFrame(moveLaser);
}

// Invaders shoot back
function invadersShoot(timestamp) {
    if (!gameStates.lastInvaderShootTime) gameStates.lastInvaderShootTime = timestamp;
    const elapsed = timestamp - gameStates.lastInvaderShootTime;

    if (elapsed > 2000 && gameStates.shooterInvaders.length > 0) {
        let soundPlayed = false;
        gameStates.shooterInvaders.forEach((shooter) => {
            if (gameStates.shooterRemoved.includes(shooter)) return;
            let currentEnemyLaserIndex = shooter;
            // Play sound only for the first shooter to avoid audio spam
            if (!soundPlayed) {
                addSound("enemy-laser");
                soundPlayed = true;
            }
            function moveEnemyLaser() {
                if (gameStates.gameOver || gameStates.isPaused) return;
                if (squares[currentEnemyLaserIndex]) squares[currentEnemyLaserIndex].classList.remove("enemy-laser");
                currentEnemyLaserIndex += gameStates.width;
                if (currentEnemyLaserIndex >= squares.length) return;
                squares[currentEnemyLaserIndex].classList.add("enemy-laser");

                if (squares[currentEnemyLaserIndex].classList.contains("shooter")) {
                    squares[currentEnemyLaserIndex].classList.remove("enemy-laser");
                    
                    if (gameStates.lives > 0) {
                        addSound("hit");
                        gameStates.lives--;
                        DOM.livesDisplay.innerHTML = gameStates.lives;
                    }

                    if (gameStates.lives <= 0) {
                        gameStates.gameOver = true;
                        cancelAnimationFrame(gameStates.animationFrameId);
                        addSound("gameover");
                        showPopup("Game Over", `You lost! Final Score: ${gameStates.result}`);
                        endGame();
                        return;
                    }
                } else {
                    requestAnimationFrame(moveEnemyLaser);
                }
            }
            requestAnimationFrame(moveEnemyLaser);
        });
        gameStates.lastInvaderShootTime = timestamp;
    }
}

// Move the invaders
export function moveInvaders(timestamp) {
    if (gameStates.gameOver) return;
    if (!gameStates.lastInvaderMoveTime) gameStates.lastInvaderMoveTime = timestamp;
    const elapsed = timestamp - gameStates.lastInvaderMoveTime;
    calculateFPS();

    if (elapsed > gameStates.invaderMoveInterval) {
        const leftCorner = gameStates.alienInvaders.some((invader, i) => !gameStates.aliensRemoved.includes(i) && invader % gameStates.width === 0);
        const rightCorner = gameStates.alienInvaders.some((invader, i) => !gameStates.aliensRemoved.includes(i) && invader % gameStates.width === gameStates.width - 1);
        manageInvaders("remove");

        // Normal Invader Movement
        if (leftCorner && !gameStates.goingRight) {
            for (let i = 0; i < gameStates.alienInvaders.length; i++) gameStates.alienInvaders[i] += gameStates.width;
            gameStates.direction = 1;
            gameStates.goingRight = true;
        } else if (rightCorner && gameStates.goingRight) {
            for (let i = 0; i < gameStates.alienInvaders.length; i++) gameStates.alienInvaders[i] += gameStates.width;
            gameStates.direction = -1;
            gameStates.goingRight = false;
        } else {
            for (let i = 0; i < gameStates.alienInvaders.length; i++) gameStates.alienInvaders[i] += gameStates.direction;
        }

        // Shooter Invader Movement
        if (gameStates.shooterInvaders.length > 0) {
            const shooterLeftCorner = gameStates.shooterInvaders.some((invader) => invader % gameStates.width === 0);
            const shooterRightCorner = gameStates.shooterInvaders.some((invader) => invader % gameStates.width === gameStates.width - 1);
            if (shooterLeftCorner && !gameStates.shooterGoingRight) {
                gameStates.shooterDirection = 1;
                gameStates.shooterGoingRight = true;
            } else if (shooterRightCorner && gameStates.shooterGoingRight) {
                gameStates.shooterDirection = -1;
                gameStates.shooterGoingRight = false;
            }
            for (let i = 0; i < gameStates.shooterInvaders.length; i++) {
                gameStates.shooterInvaders[i] += gameStates.shooterDirection;
            }
        }

        // Boss Movement 
        if (gameStates.bossPosition !== -1) {
            const bossLeftCorner = gameStates.bossPosition % gameStates.width === 0;
            const bossRightCorner = gameStates.bossPosition % gameStates.width === gameStates.width - 1;
            if (bossLeftCorner && !gameStates.bossGoingRight) {
                gameStates.bossDirection = 1;
                gameStates.bossGoingRight = true;
            } else if (bossRightCorner && gameStates.bossGoingRight) {
                gameStates.bossDirection = -1;
                gameStates.bossGoingRight = false;
            }
            gameStates.bossPosition += gameStates.bossDirection;
        }

        manageInvaders("add");
        gameStates.lastInvaderMoveTime = timestamp;

        // Check if invaders reach the shooter or bottom
        const shooterRow = Math.floor(gameStates.currentShooterIndex / gameStates.width);
        for (let i = 0; i < gameStates.alienInvaders.length; i++) {
            const invaderRow = Math.floor(gameStates.alienInvaders[i] / gameStates.width);
            if (gameStates.alienInvaders[i] === gameStates.currentShooterIndex || invaderRow >= shooterRow) {
                gameStates.lives -= 1;
                DOM.livesDisplay.innerHTML = gameStates.lives;
                
                // Remove all invaders from the grid
                manageInvaders("remove");
                
                // Reset to static positions for current level
                gameStates.alienInvaders = [...levels[gameStates.level].staticpositions];
                if (levels[gameStates.level].shooterInvaders) {
                    gameStates.shooterInvaders = [...levels[gameStates.level].shooterInvaders];
                } else {
                    gameStates.shooterInvaders = [];
                }
                
                // Reset removed arrays
                gameStates.aliensRemoved = [];
                gameStates.shooterRemoved = [];
                
                // Reset boss position if level 5
                if (gameStates.level === 5) {
                    gameStates.bossPosition = levels[gameStates.level].bossPosition || -1;
                    gameStates.bossHealth = 3;
                }
                
                // Reset movement directions and states
                gameStates.direction = 1;
                gameStates.goingRight = true;
                gameStates.shooterDirection = 1;
                gameStates.shooterGoingRight = true;
                gameStates.bossDirection = 1;
                gameStates.bossGoingRight = true;
                
                // Reset timing to current timestamp
                gameStates.lastInvaderMoveTime = timestamp;
                gameStates.lastInvaderShootTime = timestamp;
                
                // Add invaders back to the grid
                manageInvaders("add");
                moveInvaders(timestamp);
                if (gameStates.lives <= 0) {
                    gameStates.gameOver = true;
                    cancelAnimationFrame(gameStates.animationFrameId);
                    addSound("gameover");
                    showPopup("Game Over", `You lost! Final Score: ${gameStates.result}`);
                    endGame();
                    return;
                }
                return;
            }
        }
        if (gameStates.alienInvaders.length === 0 && gameStates.shooterInvaders.length === 0 && gameStates.bossPosition === -1) {
            if (gameStates.level < gameStates.maxLevels) {
                nextLevel();
            } else {
                gameStates.gameOver = true;
                cancelAnimationFrame(gameStates.animationFrameId);
                clearTimeout(gameStates.timerId);
                addSound("victory");
                showPopup("CONGRATULATIONS!",`You've completed all ${gameStates.maxLevels} levels! Final Score: ${gameStates.result}`);
                return;
            }
        }
    }

    invadersShoot(timestamp);
    moveShooter();
    updateTimer();
    if (!gameStates.isPaused && !gameStates.gameOver) gameStates.animationFrameId = requestAnimationFrame(moveInvaders);
}

// Event listeners for popup buttons
DOM.resumeBtn.addEventListener("click", resumeGame);
DOM.restartBtn.addEventListener("click", restartGame);
DOM.backToMenuBtn.addEventListener("click", () => { window.location.href = "home.html"; });

// Global key listener for R key (restart)
document.addEventListener("keydown", (e) => { if (e.code === "KeyR") restartGame(); });

startGame();