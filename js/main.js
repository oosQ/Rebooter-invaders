// Get DOM Elements from the document
const grid = document.querySelector(".grid");
const result = document.querySelector(".result");

// Scoreboard Details
const timerDisplay = document.querySelector(".timer");
const livesDisplay = document.querySelector(".lives");
const fpsDisplay = document.querySelector(".fps-display");
const levelDisplay = document.querySelector(".level");

// Pop-up Elements
const gamePopup = document.getElementById("gamePopup");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const backToMenuBtn = document.getElementById("backToMenuBtn");

// Game Variables
const width = 15;
const cellCount = width * width;
const invadersRemoved = [];
let shooterIndex = 202;
let timerId, animationFrameId;
let score = 0;
let canShoot = true;
let timeLeft = 60,lastFpsUpdateTime = 0;
let lives = 3;
let frameCount = 0,fps = 0;
let gameOver = false;
let gamePaused = false;
let currentLevel = 1;
const maxLevels = 5;

// Key object for preventing spam shooting
const keys = {};
let spaceKeyPressed = false;

// Add cells to the grid through a loop
for (let index = 0; index < cellCount; index++) {
  const square = document.createElement("div");
  square.id = index;
  grid.appendChild(square);
}

// Create an array of all the squares in the grid
const squares = Array.from(document.querySelectorAll(".grid div"));
console.log("Square has been created: ");

const levels = {
  1: {
    invaders: [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
      31, 32, 33, 34, 35, 36, 37, 38, 39,
    ],
    speed: 600,
    timeBonus: 60,
  },
  2: {
    invaders: [
      30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49, 50, 51, 52,
      53, 54,
    ],
    shooterInvaders: [1, 3, 5, 7],
    speed: 600,
    timeBonus: 50,
  },
  3: {
    invaders: [
      45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 60, 61, 62, 63, 64, 65, 66, 67,
      68, 69, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
    ],
    shooterInvaders: [1, 3, 5, 7, 16, 18, 20, 22],
    speed: 650,
    timeBonus: 40,
  },
  4: {
    invaders: [
      60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 75, 76, 77, 78, 79, 80, 81, 82,
      83, 84, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 105, 106, 107, 108, 109,
      110, 111, 112, 113, 114,
    ],
    shooterInvaders: [1, 3, 5, 7, 9, 16, 18, 20, 22, 24],
    speed: 600,
    timeBonus: 30,
  },
  5: {
    invaders: [
      75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 90, 91, 92, 93, 94, 95, 96, 97,
      98, 99, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 120, 121, 122,
      123, 124, 125, 126, 127,
    ],
    shooterInvaders: [1, 3, 5, 7, 11, 13, 16, 18, 20, 22, 24, 26, 28],
    bossPosition: 9,
    speed: 500,
    timeBonus: 20,
  },
};

// Alien invaders array
let alienInvaders = [];
let shooterInvaders = [];
let enemyLasers = [];

// Boss variables
let bossPosition = -1;
let bossHealth = 3;
let bossDirection = 1;

// Add the shooter to the grid
squares[shooterIndex].classList.add("shooter");

// Function to initialize a level
function initializeLevel(level) {
  console.log(`Initializing level ${level}`);
  const currentLvl = levels[level];
  alienInvaders.length = 0;
  shooterInvaders.length = 0;
  enemyLasers.length = 0;

  alienInvaders.push(...currentLvl.invaders);

  if (currentLvl.shooterInvaders) shooterInvaders.push(...currentLvl.shooterInvaders);

  if (currentLvl.bossPosition !== undefined) {
    bossPosition = currentLvl.bossPosition;
    bossHealth = 3;
    bossDirection = 1;
  } else {
    bossPosition = -1;
  }

  invaderMoveInterval = currentLvl.speed;

  if (levelDisplay) levelDisplay.textContent = level;

  // Add time bonus for completing previous level
  if (level > 1) {
    timeLeft += currentLvl.timeBonus;
    if (timerDisplay) timerDisplay.textContent = timeLeft;
  }

  if (level >= 2) {
    stopEnemyShooting();
    startEnemyShooting();
  }
}

function nextLevel() {
  currentLevel++;
  stopEnemyShooting();
  removeInvaders();
  initializeLevel(currentLevel);
  addInvaders();
  showPopup(`LEVEL ${currentLevel - 1} Has Been Destroyed!`);
  setTimeout(hidePopup, 2000);
}

function addInvaders() {
  // Add regular invaders
  for (let i = 0; i < alienInvaders.length; i++) {
    if (!invadersRemoved.includes(i) && alienInvaders[i] >= 0 && alienInvaders[i] < squares.length) {
      squares[alienInvaders[i]].classList.add("invader");
    }
  }

  // Add shooter invaders
  for (let i = 0; i < shooterInvaders.length; i++) {
    if (shooterInvaders[i] >= 0 && shooterInvaders[i] < squares.length) {
      squares[shooterInvaders[i]].classList.add("shooter-invader");
    }
  }

  // Adding Boss (level 5)
  if (bossPosition >= 0 && bossPosition < squares.length) {
    squares[bossPosition].classList.add("boss");
  }
}

function removeInvaders() {
  for (let i = 0; i < alienInvaders.length; i++) {
    if (alienInvaders[i] >= 0 && alienInvaders[i] < squares.length) {
      squares[alienInvaders[i]].classList.remove("invader");
    }
  }

  for (let i = 0; i < shooterInvaders.length; i++) {
    if (shooterInvaders[i] >= 0 && shooterInvaders[i] < squares.length) {
      squares[shooterInvaders[i]].classList.remove("shooter-invader");
    }
  }

  if (bossPosition >= 0 && bossPosition < squares.length) {
    squares[bossPosition].classList.remove("boss");
  }
}

let direction = 1;
let isGoingRight = true;
let shooterDirection = 1;
let shooterGoingRight = true;

function moveInvaders() {
  if (gameOver || gamePaused) return;

  removeInvaders();

  if (alienInvaders.length > 0) {
    const atLeftEdge = alienInvaders[0] % width === 0;
    const atRightEdge = alienInvaders[alienInvaders.length - 1] % width === width - 1;

    // Invaders movement
    if (atRightEdge && isGoingRight) {
      for (let i = 0; i < alienInvaders.length; i++) {
        alienInvaders[i] += width + 1;
      }
      direction = -1;
      isGoingRight = false;
    }
    if (atLeftEdge && !isGoingRight) {
      for (let i = 0; i < alienInvaders.length; i++) {
        alienInvaders[i] += width - 1;
      }
      direction = 1;
      isGoingRight = true;
    }
    for (let i = 0; i < alienInvaders.length; i++) {
      alienInvaders[i] += direction;
    }
  }

  // Shooter invaders movement
  if (shooterInvaders.length > 0) {
    const shooterAtLeftEdge = shooterInvaders[0] % width === 0;
    const shooterAtRightEdge = shooterInvaders[shooterInvaders.length - 1] % width === width - 1;
    if (shooterAtRightEdge && shooterGoingRight) {
      shooterDirection = -1;
      shooterGoingRight = false;
    }
    if (shooterAtLeftEdge && !shooterGoingRight) {
      shooterDirection = 1;
      shooterGoingRight = true;
    }
    for (let i = 0; i < shooterInvaders.length; i++) {
      shooterInvaders[i] += shooterDirection;
    }
  }

  // Boss movement
  if (bossPosition >= 0) {
    const bossAtLeftEdge = bossPosition % width === 0;
    const bossAtRightEdge = bossPosition % width === width - 1;
    if (bossAtRightEdge && bossDirection === 1) {
      bossDirection = -1;
    } else if (bossAtLeftEdge && bossDirection === -1) {
      bossDirection = 1;
    }
    bossPosition += bossDirection;
  }

  // Check when invaders reach shooter row
  const shooterRow = Math.floor(shooterIndex / width);
  let enemyInShooterRow = false;

  for (let i = 0; i < alienInvaders.length; i++) {
    if (Math.floor(alienInvaders[i] / width) >= shooterRow) {
      enemyInShooterRow = true;
      break;
    }
  }

  if (enemyInShooterRow) {
    gameOver = true;
    cancelAnimationFrame(animationFrameId);
    clearTimeout(timerId);
    showPopup("GAME OVER!",`You Failed to prove yourself! Final Score: ${score}`);
    return;
  }

  // Check for level completion
  if (alienInvaders.length === 0 && shooterInvaders.length === 0 && bossPosition === -1) {
    if (currentLevel < maxLevels) {
      nextLevel();
    } else {
      gameOver = true;
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timerId);
      showPopup("CONGRATULATIONS!",`You've completed all ${maxLevels} levels! Final Score: ${score}`);
    }
    return;
  }
  addInvaders();
}

function moveShooter(e) {
  if (gamePaused || gameOver) return;
  squares[shooterIndex].classList.remove("shooter");
  switch (e.key) {
    case "ArrowLeft":
      if (shooterIndex % width !== 0) shooterIndex -= 1;
      break;
    case "ArrowRight":
      if (shooterIndex % width < width - 1) shooterIndex += 1;
      break;
  }
  squares[shooterIndex].classList.add("shooter");
}

document.addEventListener("keydown", moveShooter);

let lastInvaderMove = 0;

function animateInvaders(timestamp) {
  if (gamePaused || gameOver) return;

  if (!lastInvaderMove) lastInvaderMove = timestamp;

  if (timestamp - lastInvaderMove >= invaderMoveInterval) {
    moveInvaders();
    lastInvaderMove = timestamp;
  }
  calculateFPS();
  animationFrameId = requestAnimationFrame(animateInvaders);
}
animationFrameId = requestAnimationFrame(animateInvaders);

function shoot(e) {
  if (e.key === " " && canShoot && !gamePaused && !gameOver) {
    canShoot = false;
    setTimeout(() => (canShoot = true), 300);

    let laserId;
    let currentLaserIndex = shooterIndex;

    function moveLaser() {
      squares[currentLaserIndex].classList.remove("laser");
      currentLaserIndex -= width;

      if (currentLaserIndex < 0) {
        clearInterval(laserId);
        return;
      }

      squares[currentLaserIndex].classList.add("laser");

      // Check for hit with invader (regular, shooter, or boss)
      if (
        squares[currentLaserIndex].classList.contains("invader") ||
        squares[currentLaserIndex].classList.contains("shooter-invader") ||
        squares[currentLaserIndex].classList.contains("boss")
      ) {
        squares[currentLaserIndex].classList.remove("laser");
        clearInterval(laserId);

        // Boss hit logic
        if (squares[currentLaserIndex].classList.contains("boss")) {
          bossHealth--;
          if (bossHealth <= 0) {
            squares[currentLaserIndex].classList.remove("boss");
            bossPosition = -1;
            score += 100 * currentLevel;
          }
        } else {
          squares[currentLaserIndex].classList.remove("invader");
          squares[currentLaserIndex].classList.remove("shooter-invader");

          // Remove invader from arrays
          const invaderIndex = alienInvaders.indexOf(currentLaserIndex);
          if (invaderIndex !== -1) alienInvaders.splice(invaderIndex, 1);

          const shooterInvaderIndex = shooterInvaders.indexOf(currentLaserIndex);
          if (shooterInvaderIndex !== -1)
            shooterInvaders.splice(shooterInvaderIndex, 1);

          squares[currentLaserIndex].classList.add("boom");
          setTimeout(() => squares[currentLaserIndex].classList.remove("boom"), 150);

          const alienRemoved = alienInvaders.indexOf(currentLaserIndex);
          invadersRemoved.push(alienRemoved);

          const levelMultiplier = currentLevel;
          score += 10 * levelMultiplier;
        }

        result.innerHTML = score;
      }
    }
    laserId = setInterval(moveLaser, 50);
  }
}

// Key event handlers to prevent spam shooting
function handleKeyDown(e) {
  if (e.key === " " && !keys[e.key]) {
    keys[e.key] = true;
    shoot(e);
  }
}
function handleKeyUp(e) {
  if (e.key === " ") keys[e.key] = false;
}
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);


function enemyShoot() {
  if (gameOver || gamePaused || shooterInvaders.length === 0) return;

  // Going through each shooter invader to shoot
  shooterInvaders.forEach((shooterPosition) => {
    if (!shooterInvaders.includes(shooterPosition)) return;
    let enemyLaserIndex = shooterPosition;

    function moveEnemyLaser() {
      if (enemyLaserIndex >= 0 && enemyLaserIndex < squares.length)
        squares[enemyLaserIndex].classList.remove("laser");
      enemyLaserIndex += width;

      // Check if laser reached bottom
      if (enemyLaserIndex >= squares.length) {
        clearInterval(enemyLaserId);
        return;
      }

      squares[enemyLaserIndex].classList.add("laser");

      // Check if laser hits the player
      if (squares[enemyLaserIndex].classList.contains("shooter")) {
        squares[enemyLaserIndex].classList.remove("laser");
        clearInterval(enemyLaserId);

        lives--;
        if (lives < 0) lives = 0;
        livesDisplay.textContent = lives;

        // Show hit effect on shooter
        setTimeout(() => {
          let shooter = document.getElementById(shooterIndex);
          shooter.style.filter = "drop-shadow(0 0 10px rgba(255, 71, 87, 0.6))";
          setTimeout(() => {shooter.style.filter = "";}, 400);
        }, 400);

        if (lives <= 0) {
          gameOver = true;
          cancelAnimationFrame(animationFrameId);
          clearTimeout(timerId);
          showPopup("GAME OVER!",`You've been shot down! Your Final Score: ${score}`);
          return;
        }
      }
    }
    const enemyLaserId = setInterval(moveEnemyLaser, 60);
  });
}

let enemyShootTimer;
function startEnemyShooting() {
  enemyShootTimer = setTimeout(() => {
    enemyShoot();
    startEnemyShooting();
  }, 3000);
}

function stopEnemyShooting() {
  if (enemyShootTimer) clearTimeout(enemyShootTimer);
  for (let i = 0; i < squares.length; i++) squares[i].classList.remove("laser");
}

function showPopup(title, message) {
  popupTitle.textContent = title;
  popupMessage.textContent = message;
  gamePopup.classList.add("show");
}

function hidePopup() {
  gamePopup.classList.remove("show");
}

// Pause and Restart Functions
function pauseGame() {
  gamePaused = !gamePaused;
  if (gamePaused) {
    showPopup("GAME PAUSED", "Press P or ESC to resume");
    stopEnemyShooting();
  } else {
    hidePopup();
    if (currentLevel >= 2) {
      startEnemyShooting();
    }
  }
  if (!gamePaused && !gameOver)
    animationFrameId = requestAnimationFrame(animateInvaders);
}

addEventListener("click", function (e) {
  if (e.target === backToMenuBtn) {
    this.window.location.href = "home.html";
  }
});

function restartGame() {
  // Reset All game values
  gameOver = false;
  gamePaused = false;
  score = 0;
  lives = 3;
  timeLeft = 60;
  isGoingRight = true;
  direction = 1;
  shooterGoingRight = true;
  shooterDirection = 1;
  shooterIndex = 202;
  canShoot = true;
  frameCount = 0;
  fps = 0;
  currentLevel = 1;

  invadersRemoved.length = 0;
  alienInvaders.length = 0;
  shooterInvaders.length = 0;
  enemyLasers.length = 0;

  // Reset boss variables
  bossPosition = -1;
  bossHealth = 3;
  bossDirection = 1;

  // Stop enemy shooting
  stopEnemyShooting();

  // Clear all visual elements
  for (let i = 0; i < squares.length; i++) {
    squares[i].classList.remove(
      "invader",
      "shooter-invader",
      "shooter",
      "laser",
      "boom"
    );
  }

  initializeLevel(currentLevel);

  result.innerHTML = score;
  livesDisplay.textContent = lives;
  timerDisplay.textContent = timeLeft;
  levelDisplay.textContent = currentLevel;

  squares[shooterIndex].classList.add("shooter");
  addInvaders();

  cancelAnimationFrame(animationFrameId);
  clearTimeout(timerId);

  animationFrameId = requestAnimationFrame(animateInvaders);
  updateTimer();
}

function handleKeyPress(e) {
  console.log("Key pressed:", e.key);
  if (e.key.toLowerCase() === "p" || e.key === "Escape") {
    e.preventDefault();
    pauseGame();
  }
  if (e.key.toLowerCase() === "r") {
    e.preventDefault();
    restartGame();
    hidePopup();
  }
}

// Add event listener for keyboard controls
document.addEventListener("keydown", handleKeyPress);

function loseLife() {
  if (lives > 0) {
    lives--;
    livesDisplay.textContent = lives;
    if (lives === 0) {
      gameOver = true;
      cancelAnimationFrame(animationFrameId);
      clearInterval(timerId);
      showPopup("GAME OVER!",`Final Score: ${score}`);
    }
  }
}

function calculateFPS() {
  frameCount++;
  const currentTime = Date.now();
  if (currentTime - lastFpsUpdateTime >= 1000) {
    fps = frameCount;
    fpsDisplay.innerHTML = `${fps}`;
    frameCount = 0;
    lastFpsUpdateTime = currentTime;
  }
}

function updateTimer() {
  timerDisplay.textContent = timeLeft;
  if (timeLeft > 0 && !gamePaused && !gameOver) {
    timeLeft--;
    timerId = setTimeout(updateTimer, 1000);
  } else if (timeLeft <= 0) {
    gameOver = true;
    cancelAnimationFrame(animationFrameId);

    showPopup("TIME'S UP!",`Game Over! Final Score: ${score}`);
  } else if (!gameOver) {
    timerId = setTimeout(updateTimer, 100);
  }
}

result.innerHTML = score;
livesDisplay.textContent = lives;
levelDisplay.textContent = currentLevel;

initializeLevel(currentLevel);
addInvaders();

updateTimer();
