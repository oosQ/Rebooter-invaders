// Game Logic and State Management Module
import { width, cellCount, levels, maxLevels } from "./config.js";

// DOM Elements Object
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

// Game State Object
export const gameState = {
  squares: [],
  invadersRemoved: [],
  shooterIndex: 202,
  timerId: null,
  animationFrameId: null,
  score: 0,
  canShoot: true,
  timeLeft: 60,
  lastFpsUpdateTime: 0,
  lives: 3,
  frameCount: 0,
  fps: 0,
  gameOver: false,
  gamePaused: false,
  currentLevel: 1,
  alienInvaders: [],
  shooterInvaders: [],
  enemyLasers: [],
  bossPosition: -1,
  bossHealth: 3,
  bossDirection: 1,
  direction: 1,
  isGoingRight: true,
  shooterDirection: 1,
  shooterGoingRight: true,
  invaderMoveInterval: 600,
  lastInvaderMove: 0,
  enemyShootTimer: null,
  keys: {},
  spaceKeyPressed: false,
};

// Initialize Grid
for (let index = 0; index < cellCount; index++) {
  const square = document.createElement("div");
  square.id = index;
  DOM.grid.appendChild(square);
}
gameState.squares = Array.from(document.querySelectorAll(".grid div"));
console.log("Square has been created: ");
gameState.squares[gameState.shooterIndex].classList.add("shooter");

// UI Functions
export function showPopup(title, message) {
  DOM.popupTitle.textContent = title;
  DOM.popupMessage.textContent = message;
  DOM.gamePopup.classList.add("show");
}

export function hidePopup() {
  DOM.gamePopup.classList.remove("show");
}

// Level Management
export function initializeLevel(level) {
  console.log(`Initializing level ${level}`);
  const currentLvl = levels[level];
  gameState.alienInvaders.length = 0;
  gameState.shooterInvaders.length = 0;
  gameState.enemyLasers.length = 0;

  gameState.alienInvaders.push(...currentLvl.invaders);

  if (currentLvl.shooterInvaders)
    gameState.shooterInvaders.push(...currentLvl.shooterInvaders);

  if (currentLvl.bossPosition !== undefined) {
    gameState.bossPosition = currentLvl.bossPosition;
    gameState.bossHealth = 3;
    gameState.bossDirection = 1;
  } else {
    gameState.bossPosition = -1;
  }

  gameState.invaderMoveInterval = currentLvl.speed;

  if (DOM.levelDisplay) DOM.levelDisplay.textContent = level;

  if (level > 1) {
    gameState.timeLeft += currentLvl.timeBonus;
    if (DOM.timerDisplay) DOM.timerDisplay.textContent = gameState.timeLeft;
  }

  if (level >= 2) {
    stopEnemyShooting();
    startEnemyShooting();
  }
}

export function addInvaders() {
  for (let i = 0; i < gameState.alienInvaders.length; i++) {
    if (
      !gameState.invadersRemoved.includes(i) &&
      gameState.alienInvaders[i] >= 0 &&
      gameState.alienInvaders[i] < gameState.squares.length
    ) {
      gameState.squares[gameState.alienInvaders[i]].classList.add("invader");
    }
  }

  for (let i = 0; i < gameState.shooterInvaders.length; i++) {
    if (
      gameState.shooterInvaders[i] >= 0 &&
      gameState.shooterInvaders[i] < gameState.squares.length
    ) {
      gameState.squares[gameState.shooterInvaders[i]].classList.add(
        "shooter-invader"
      );
    }
  }

  if (
    gameState.bossPosition >= 0 &&
    gameState.bossPosition < gameState.squares.length
  ) {
    gameState.squares[gameState.bossPosition].classList.add("boss");
  }
}

export function removeInvaders() {
  for (let i = 0; i < gameState.alienInvaders.length; i++) {
    if (
      gameState.alienInvaders[i] >= 0 &&
      gameState.alienInvaders[i] < gameState.squares.length
    ) {
      gameState.squares[gameState.alienInvaders[i]].classList.remove("invader");
    }
  }

  for (let i = 0; i < gameState.shooterInvaders.length; i++) {
    if (
      gameState.shooterInvaders[i] >= 0 &&
      gameState.shooterInvaders[i] < gameState.squares.length
    ) {
      gameState.squares[gameState.shooterInvaders[i]].classList.remove(
        "shooter-invader"
      );
    }
  }

  if (
    gameState.bossPosition >= 0 &&
    gameState.bossPosition < gameState.squares.length
  ) {
    gameState.squares[gameState.bossPosition].classList.remove("boss");
  }
}

export function nextLevel() {
  gameState.currentLevel++;
  let levelUpAudio = new Audio("./utils/sounds/level-up.mp3");
  levelUpAudio.volume = 0.5;
  levelUpAudio.play();
  stopEnemyShooting();
  removeInvaders();
  initializeLevel(gameState.currentLevel);
  addInvaders();
}

// Movement Functions
export function moveInvaders() {
  if (gameState.gameOver || gameState.gamePaused) return;

  removeInvaders();

  if (gameState.alienInvaders.length > 0) {
    const atLeftEdge = gameState.alienInvaders.some(
      (invader) => invader % width === 0
    );
    const atRightEdge = gameState.alienInvaders.some(
      (invader) => invader % width === width - 1
    );

    if (atRightEdge && gameState.isGoingRight) {
      for (let i = 0; i < gameState.alienInvaders.length; i++) {
        gameState.alienInvaders[i] += width + 1;
      }
      gameState.direction = -1;
      gameState.isGoingRight = false;
    }
    if (atLeftEdge && !gameState.isGoingRight) {
      for (let i = 0; i < gameState.alienInvaders.length; i++) {
        gameState.alienInvaders[i] += width - 1;
      }
      gameState.direction = 1;
      gameState.isGoingRight = true;
    }
    for (let i = 0; i < gameState.alienInvaders.length; i++) {
      gameState.alienInvaders[i] += gameState.direction;
    }
  }

  if (gameState.shooterInvaders.length > 0) {
    const shooterAtLeftEdge = gameState.shooterInvaders.some(
      (shooter) => shooter % width === 0
    );
    const shooterAtRightEdge = gameState.shooterInvaders.some(
      (shooter) => shooter % width === width - 1
    );
    if (shooterAtRightEdge && gameState.shooterGoingRight) {
      gameState.shooterDirection = -1;
      gameState.shooterGoingRight = false;
    }
    if (shooterAtLeftEdge && !gameState.shooterGoingRight) {
      gameState.shooterDirection = 1;
      gameState.shooterGoingRight = true;
    }
    for (let i = 0; i < gameState.shooterInvaders.length; i++) {
      gameState.shooterInvaders[i] += gameState.shooterDirection;
    }
  }

  if (gameState.bossPosition >= 0) {
    const bossAtLeftEdge = gameState.bossPosition % width === 0;
    const bossAtRightEdge = gameState.bossPosition % width === width - 1;
    if (bossAtRightEdge && gameState.bossDirection === 1) {
      gameState.bossDirection = -1;
    } else if (bossAtLeftEdge && gameState.bossDirection === -1) {
      gameState.bossDirection = 1;
    }
    gameState.bossPosition += gameState.bossDirection;
  }

  const shooterRow = Math.floor(gameState.shooterIndex / width);
  let enemyInShooterRow = false;

  for (let i = 0; i < gameState.alienInvaders.length; i++) {
    if (Math.floor(gameState.alienInvaders[i] / width) >= shooterRow) {
      enemyInShooterRow = true;
      break;
    }
  }

  if (enemyInShooterRow) {
    gameState.gameOver = true;
    cancelAnimationFrame(gameState.animationFrameId);
    clearTimeout(gameState.timerId);
    stopEnemyShooting();

    // Add dramatic flash effect
    DOM.grid.style.filter = "brightness(2) saturate(2)";
    setTimeout(() => {
      DOM.grid.style.filter = "brightness(0.3) hue-rotate(320deg)";
    }, 100);
    setTimeout(() => {
      DOM.grid.style.filter = "";
    }, 300);

    let gameOverAudio = new Audio("./utils/sounds/game-over.mp3");
    gameOverAudio.volume = 0.5;
    gameOverAudio.play();
    DOM.resumeBtn.style.display = "none";

    // Show popup after brief delay for effect
    setTimeout(() => {
      showPopup(
        "GAME OVER!",
        `The invaders have reached you! Final Score: ${gameState.score}`
      );
    }, 400);
    return;
  }

  if (
    gameState.alienInvaders.length === 0 &&
    gameState.shooterInvaders.length === 0 &&
    gameState.bossPosition === -1
  ) {
    if (gameState.currentLevel < maxLevels) {
      nextLevel();
    } else {
      gameState.gameOver = true;
      cancelAnimationFrame(gameState.animationFrameId);
      clearTimeout(gameState.timerId);
      let congratsAudio = new Audio("./utils/sounds/congrat.mp3");
      let winAudio = new Audio("./utils/sounds/winning.mp3");
      congratsAudio.play();
      setTimeout(() => {
        winAudio.play();
      }, 2000);
      DOM.resumeBtn.style.display = "none";
      showPopup(
        "CONGRATULATIONS!",
        `You've completed all ${maxLevels} levels! Final Score: ${gameState.score}`
      );
    }
    return;
  }
  addInvaders();
}

export function calculateFPS() {
  gameState.frameCount++;
  const currentTime = performance.now();
  const elapsed = currentTime - gameState.lastFpsUpdateTime;

  if (elapsed >= 1000) {
    gameState.fps = Math.round((gameState.frameCount * 1000) / elapsed);
    DOM.fpsDisplay.innerHTML = `${gameState.fps}`;
    gameState.frameCount = 0;
    gameState.lastFpsUpdateTime = currentTime;
  }
}

// Enemy Shooting
export function enemyShoot() {
  if (
    gameState.gameOver ||
    gameState.gamePaused ||
    gameState.shooterInvaders.length === 0
  )
    return;

  gameState.shooterInvaders.forEach((shooterPosition) => {
    if (!gameState.shooterInvaders.includes(shooterPosition)) return;
    let enemyLaserIndex = shooterPosition;
    let audio = new Audio("./utils/sounds/fire.mp3");
    audio.play();
    function moveEnemyLaser() {
      if (enemyLaserIndex >= 0 && enemyLaserIndex < gameState.squares.length)
        gameState.squares[enemyLaserIndex].classList.remove("enemy-laser");
      enemyLaserIndex += width;

      if (enemyLaserIndex >= gameState.squares.length) {
        clearInterval(enemyLaserId);
        return;
      }

      gameState.squares[enemyLaserIndex].classList.add("enemy-laser");

      if (gameState.squares[enemyLaserIndex].classList.contains("shooter")) {
        let hurtAudio = new Audio("./utils/sounds/hurt.mp3");
        hurtAudio.play();
        gameState.squares[enemyLaserIndex].classList.remove("enemy-laser");
        clearInterval(enemyLaserId);

        gameState.lives--;
        if (gameState.lives < 0) gameState.lives = 0;
        DOM.livesDisplay.textContent = gameState.lives;

        setTimeout(() => {
          let shooter = document.getElementById(gameState.shooterIndex);
          shooter.style.filter = "drop-shadow(0 0 10px rgba(255, 71, 87, 0.6))";
          setTimeout(() => {
            shooter.style.filter = "";
          }, 400);
        }, 400);

        if (gameState.lives <= 0) {
          gameState.gameOver = true;
          cancelAnimationFrame(gameState.animationFrameId);
          clearTimeout(gameState.timerId);
          let gameOverAudio = new Audio("./utils/sounds/game-over.mp3");
          let failAudio = new Audio("./utils/sounds/fail-sound.mp3");
          if (gameState.currentLevel == 5) {
            let bossLaughingAudio = new Audio(
              "./utils/sounds/Boss-Laughing.mp3"
            );
            bossLaughingAudio.play();
            setTimeout(() => {
              gameOverAudio.play();
            }, 2000);
          } else {
            failAudio.play();
            setTimeout(() => {
              gameOverAudio.play();
            }, 3000);
          }
          DOM.resumeBtn.style.display = "none";
          showPopup(
            "GAME OVER!",
            `You've been shot down! Your Final Score: ${gameState.score}`
          );
          return;
        }
      }
    }
    const enemyLaserId = setInterval(moveEnemyLaser, 60);
  });
}

export function startEnemyShooting() {
  gameState.enemyShootTimer = setTimeout(() => {
    enemyShoot();
    startEnemyShooting();
  }, 3000);
}

export function stopEnemyShooting() {
  if (gameState.enemyShootTimer) clearTimeout(gameState.enemyShootTimer);
  for (let i = 0; i < gameState.squares.length; i++)
    gameState.squares[i].classList.remove("laser");
}

export function updateTimer() {
  DOM.timerDisplay.textContent = gameState.timeLeft;
  if (gameState.timeLeft > 0 && !gameState.gamePaused && !gameState.gameOver) {
    gameState.timeLeft--;
    gameState.timerId = setTimeout(updateTimer, 1000);
  } else if (gameState.timeLeft <= 0) {
    gameState.gameOver = true;
    cancelAnimationFrame(gameState.animationFrameId);
    clearTimeout(gameState.timerId);
    let timeUpAudio = new Audio("./utils/sounds/times-up.mp3");
    timeUpAudio.volume = 0.5;
    timeUpAudio.play();

    DOM.resumeBtn.style.display = "none";
    showPopup("TIME'S UP!", `Game Over! Final Score: ${gameState.score}`);
  } else if (!gameState.gameOver) {
    gameState.timerId = setTimeout(updateTimer, 100);
  }
}
