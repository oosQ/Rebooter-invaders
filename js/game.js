import { squares, result, livesDisplay, timerDisplay, levelDisplay, backToMenuBtn, restartBtn, resumeBtn } from './constants.js';
import {
  gameOver,
  gamePaused,
  score,
  lives,
  timeLeft,
  isGoingRight,
  direction,
  shooterGoingRight,
  shooterDirection,
  shooterIndex,
  canShoot,
  frameCount,
  fps,
  currentLevel,
  invadersRemoved,
  alienInvaders,
  shooterInvaders,
  enemyLasers,
  bossPosition,
  bossHealth,
  bossDirection,
  animationFrameId,
  timerId,
  setGameOver,
  setGamePaused,
  setScore,
  setLives,
  setTimeLeft,
  setIsGoingRight,
  setDirection,
  setShooterGoingRight,
  setShooterDirection,
  setShooterIndex,
  setCanShoot,
  setFrameCount,
  setFps,
  setCurrentLevel,
  setBossPosition,
  setBossHealth,
  setBossDirection,
  setAnimationFrameId,
  setTimerId
} from './gameState.js';
import { initializeLevel } from './levels.js';
import { addInvaders, animateInvaders } from './invaders.js';
import { stopEnemyShooting, startEnemyShooting } from './enemy.js';
import { showPopup, hidePopup, updateTimer } from './ui.js';

// Pause and Restart Functions
export function pauseGame() {
  if (gameOver) return;
  setGamePaused(!gamePaused);
  if (gamePaused) {
    resumeBtn.style.display = "flex";
    stopEnemyShooting();
    showPopup("GAME PAUSED", "Take a breather, warrior!");
  } else {
    hidePopup();
    if (currentLevel >= 2) {
      startEnemyShooting();
    }
  }
  if (!gamePaused && !gameOver) {
    const newAnimationFrameId = requestAnimationFrame(animateInvaders);
    setAnimationFrameId(newAnimationFrameId);
  }
}

export function restartGame() {
  // Reset All game values
  setGameOver(false);
  setGamePaused(false);
  setScore(0);
  setLives(3);
  setTimeLeft(60);
  setIsGoingRight(true);
  setDirection(1);
  setShooterGoingRight(true);
  setShooterDirection(1);
  setShooterIndex(202);
  setCanShoot(true);
  setFrameCount(0);
  setFps(0);
  setCurrentLevel(1);

  invadersRemoved.length = 0;
  alienInvaders.length = 0;
  shooterInvaders.length = 0;
  enemyLasers.length = 0;

  // Reset boss variables
  setBossPosition(-1);
  setBossHealth(3);
  setBossDirection(1);

  // Stop enemy shooting
  stopEnemyShooting();

  // Clear all visual elements
  for (let i = 0; i < squares.length; i++) {
    squares[i].classList.remove(
      "invader",
      "shooter-invader",
      "shooter",
      "laser",
      "boss",
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

  const newAnimationFrameId = requestAnimationFrame(animateInvaders);
  setAnimationFrameId(newAnimationFrameId);
  updateTimer();
}

export function handleKeyPress(e) {
  console.log("Key pressed:", e.key);
  if ((e.key.toLowerCase() === "p" || e.key === "Escape") && !gameOver) {
    e.preventDefault();
    pauseGame();
  }
  if (e.key.toLowerCase() === "r") {
    e.preventDefault();
    restartGame();
    hidePopup();
  }
}

// Add event listeners for game controls
export function initializeGameControls() {
  addEventListener("click", function (e) {
    if (e.target === backToMenuBtn) {
      window.location.href = "home.html";
    }
  });
  
  addEventListener("click", function (e) {
    if (e.target === restartBtn) {
      restartGame();
      hidePopup();
    }
  });
  
  resumeBtn.addEventListener("click", function () {
    hidePopup();
    pauseGame();
  });

  document.addEventListener("keydown", handleKeyPress);
}
