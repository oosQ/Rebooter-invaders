import { DOM, gameStates, levels, updateTimer, calculateFPS, } from "./config.js";
import { addSound, hideStoryPopup, showStoryPopup, storyContent, } from "./story.js";
import { endGame,resetWhenRichedBottom} from "./controls.js";
import { scoreBoardSetup, requestGameToken } from "./scoreboard.js";

// Declare squares variable
export let squares = [];

// Initialize grid squares
export function initializeGrid() {
  // Create cells as div elements and append to the grid (parent)
  for (let i = 0; i < gameStates.width * gameStates.width; i++) {
    const square = document.createElement("div");
    DOM.grid.appendChild(square);
  }
  squares = Array.from(document.querySelectorAll(".grid div"));
}

// [ Level management ]
export function nextLevel() {
    gameStates.level++;
    addSound("nextlevel");
    manageInvaders("remove");
    gameStates.direction = 1;
    gameStates.goingRight = true;
    initializeLevel(gameStates.level);
    manageInvaders("add");
}

export function initializeLevel(level) {
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
    if (DOM.timerDisplay)
      DOM.timerDisplay.textContent = gameStates.remainingTime;
  }
}

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
  if (currentTime - gameStates.lastShotTime < 50) return;
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

      // Boss hit
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
      developmentStage();
    } else {
      requestAnimationFrame(moveLaser);
    }
  }
  requestAnimationFrame(moveLaser);
}

function developmentStage() {
  if (!gameStates.storyMode || gameStates.storyStage !== 1) return;

  if (gameStates.result >= storyContent.development.triggerScore) {
    gameStates.storyStage = 2;
    addSound("development");
    showStoryPopup(storyContent.development);
  }
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

          // [ Check for game over ]
          if (gameStates.lives <= 0) {
            gameStates.gameOver = true;
            cancelAnimationFrame(gameStates.animationFrameId);
            // [ Check for story mode ]
            if (gameStates.storyMode) {
              addSound("mission-failed");
              if (gameStates.level === 5) setTimeout(() => addSound("boss-laughing"), 2000);
              showStoryPopup(storyContent.defeatConclusion);
              DOM.storyContinueBtn.onclick = async () => {
                hideStoryPopup();
                let name = prompt("Enter your name for the leaderboard:");
                const timeTaken = gameStates.gameTime - gameStates.remainingTime;
                const token = await requestGameToken(gameStates.result, timeTaken);
                scoreBoardSetup(name, gameStates.result, timeTaken, token);
              };
            } else {
              addSound("gameover");
              if (gameStates.level === 5) setTimeout(() => addSound("boss-laughing"), 2000);
              (async () => {
                let name = prompt("Enter your name for the leaderboard:");
                const timeTaken = gameStates.gameTime - gameStates.remainingTime;
                const token = await requestGameToken(gameStates.result, timeTaken);
                scoreBoardSetup(name, gameStates.result, timeTaken, token);
              })();
            }
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
  if (gameStates.gameOver || gameStates.isPaused) return;
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

    // [ Check if invaders reach the shooter or bottom ]
    const shooterRow = Math.floor(gameStates.currentShooterIndex / gameStates.width);
    for (let i = 0; i < gameStates.alienInvaders.length; i++) {
      const invaderRow = Math.floor(gameStates.alienInvaders[i] / gameStates.width);
      if (gameStates.alienInvaders[i] === gameStates.currentShooterIndex || invaderRow >= shooterRow) resetWhenRichedBottom();
    }

    // [ Check for level completion ]
    if (gameStates.alienInvaders.length === 0 && gameStates.shooterInvaders.length === 0 && gameStates.bossPosition === -1) {
      if (gameStates.level < gameStates.maxLevels) {
        addSound("next-level");
        nextLevel();
      } else {
        // [ Win condition ]
        gameStates.gameOver = true;
        cancelAnimationFrame(gameStates.animationFrameId);
        clearTimeout(gameStates.timerId);
        if (gameStates.storyMode) {
          addSound("mission-complete");
          showStoryPopup(storyContent.victoryConclusion);
          DOM.storyContinueBtn.onclick = async () => {
            hideStoryPopup();
            addSound("victory");
            let name = prompt("Enter your name for the leaderboard:");
            const timeTaken = gameStates.gameTime - gameStates.remainingTime;
            const token = await requestGameToken(gameStates.result, timeTaken);
            scoreBoardSetup(name, gameStates.result, timeTaken, token);
          };
        } else {
          addSound("victory");
          (async () => {
            let name = prompt("Enter your name for the leaderboard:");
            const timeTaken = gameStates.gameTime - gameStates.remainingTime;
            const token = await requestGameToken(gameStates.result, timeTaken);
            scoreBoardSetup(name, gameStates.result, timeTaken, token);
          })();
        }
        return;
      }
    }

  }

  invadersShoot(timestamp);
  moveShooter();
  updateTimer();
  if (!gameStates.isPaused && !gameStates.gameOver) gameStates.animationFrameId = requestAnimationFrame(moveInvaders);
}