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

// Game Variables
const width = 15;
const cellCount = width * width;
const invadersRemoved = [];
let shooterIndex = 202;
let timerId, animationFrameId;
let score = 0;
let canShoot = true;
let timeLeft = 60,
  lastFpsUpdateTime = 0;
let lives = 3;
let frameCount = 0,
  fps = 0;
let gameOver = false;
let gamePaused = false;
let isGoingRight = true;
let direction = 1;

// Add cells to the grid through a loop
for (let index = 0; index < cellCount; index++) {
  const square = document.createElement("div");
  square.id = index;
  grid.appendChild(square);
}

// Create an array of all the squares in the grid
const squares = Array.from(document.querySelectorAll(".grid div"));
console.log("Square has been created: " + squares);

// Basic alien invaders
const alienInvaders = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
  15, 16, 17,18, 19, 20, 21, 22, 23, 24, 25,
  32, 33,
  34, 35, 36, 37, 38, 39, 40,
];
// Add the shooter to the grid
squares[shooterIndex].classList.add("shooter");

function addInvaders() {
  for (let i = 0; i < alienInvaders.length; i++) {
    if (
      !invadersRemoved.includes(i) &&
      alienInvaders[i] >= 0 &&
      alienInvaders[i] < squares.length
    )
      squares[alienInvaders[i]].classList.add("invader");
  }
}

function removeInvaders() {
  for (let i = 0; i < alienInvaders.length; i++) {
    if (alienInvaders[i] >= 0 && alienInvaders[i] < squares.length)
      squares[alienInvaders[i]].classList.remove("invader");
  }
}

addInvaders();

function moveInvaders() {
  if (gameOver || gamePaused) return;
  const atLeftEdge = alienInvaders.some((i) => i % width === 0);
  const atRightEdge = alienInvaders.some((i) => i % width === width - 1);

  removeInvaders();

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

  // Check for collision with shooter
  if (
    squares[shooterIndex].classList.contains("invader") ||
    alienInvaders.some((index) => index >= squares.length - width)
  ) {
    gameOver = true;
    cancelAnimationFrame(animationFrameId);
    clearTimeout(timerId);
    result.innerHTML = "Game Over";
    showPopup("💀 GAME OVER", "Press R to restart");
    return;
  }

  // Check for win condition
  if (alienInvaders.length === 0) {
    gameOver = true;
    result.innerHTML = "You Win";
    cancelAnimationFrame(animationFrameId);
    showPopup("🎉 YOU WIN!", "Congratulations! Press R to play again");
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
const invaderMoveInterval = 500;

function animateInvaders(timestamp) {
  if (gamePaused || gameOver) return;

  if (!lastInvaderMove) {
    lastInvaderMove = timestamp;
  }
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
    setTimeout(() => (canShoot = true), 500);

    let laserId;
    let currentLaserIndex = shooterIndex;

    function moveLaser() {
      squares[currentLaserIndex].classList.remove("laser");
      currentLaserIndex -= width;

      if (currentLaserIndex < width) {
        clearInterval(laserId);
        setTimeout(
          () => squares[currentLaserIndex].classList.remove("laser"),
          100
        );
        return;
      }

      squares[currentLaserIndex].classList.add("laser");

      // Check for hit with invader
      if (squares[currentLaserIndex].classList.contains("invader")) {
        squares[currentLaserIndex].classList.remove("laser");
        squares[currentLaserIndex].classList.remove("invader");

        // Remove invader from array
        alienInvaders.splice(alienInvaders.indexOf(currentLaserIndex), 1);

        squares[currentLaserIndex].classList.add("boom");
        setTimeout(
          () => squares[currentLaserIndex].classList.remove("boom"),
          250
        );
        clearInterval(laserId);

        const alienRemoved = alienInvaders.indexOf(currentLaserIndex);
        invadersRemoved.push(alienRemoved);
        score++;
        result.innerHTML = score;
        console.log(invadersRemoved);
      }
    }
    laserId = setInterval(moveLaser, 100);
  }
}
document.addEventListener("keydown", shoot);

// Pop-up utility functions
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
  gamePaused
    ? showPopup("⏸️ GAME PAUSED", "Press P or ESC to resume")
    : hidePopup();
  if (!gamePaused && !gameOver)
    animationFrameId = requestAnimationFrame(animateInvaders);
}

function restartGame() {
  // Reset All game values
  gameOver = false;
  gamePaused = false;
  score = 0;
  lives = 3;
  timeLeft = 60;
  isGoingRight = true;
  direction = 1;
  shooterIndex = 202;
  canShoot = true;
  frameCount = 0;
  fps = 0;

  invadersRemoved.length = 0;
  alienInvaders.length = 0;

  alienInvaders.push(0,1,2,3,4,5,6,7,8,9,16,17,18,19,20,21,22,23,32,33,34,35,36,37,38,39,40);

  for (let i = 0; i < squares.length; i++) {
    squares[i].classList.remove("invader", "shooter", "laser", "boom");
  }

  // Reset displays
  result.innerHTML = score;
  livesDisplay.textContent = lives;
  timerDisplay.textContent = timeLeft;

  // Add shooter and invaders back
  squares[shooterIndex].classList.add("shooter");
  addInvaders();

  // Cancel existing timers and animations
  cancelAnimationFrame(animationFrameId);
  clearTimeout(timerId);

  // Restart game loops
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
      cancelAnimationFrame(animationFrameId);
      clearInterval(timerId);
      alert("Game Over!");
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
    showPopup("⏰ TIME'S UP!", "Game Over! Press R to restart");
  } else if (!gameOver) {
    timerId = setTimeout(updateTimer, 100);
  }
}
updateTimer();
