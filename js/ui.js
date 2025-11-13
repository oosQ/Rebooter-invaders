import { gamePopup, popupTitle, popupMessage, timerDisplay, fpsDisplay, livesDisplay, resumeBtn } from './constants.js';
import {
  frameCount,
  fps,
  lastFpsUpdateTime,
  timeLeft,
  gamePaused,
  gameOver,
  score,
  timerId,
  animationFrameId,
  lives,
  setFrameCount,
  setFps,
  setLastFpsUpdateTime,
  setTimeLeft,
  setGameOver,
  setTimerId,
  setAnimationFrameId,
  setLives
} from './gameState.js';

export function showPopup(title, message) {
  popupTitle.textContent = title;
  popupMessage.textContent = message;
  gamePopup.classList.add("show");
}

export function hidePopup() {
  gamePopup.classList.remove("show");
}

export function loseLife() {
  if (lives > 0) {
    setLives(lives - 1);
    livesDisplay.textContent = lives;
    if (lives === 0) {
      setGameOver(true);
      cancelAnimationFrame(animationFrameId);
      clearInterval(timerId);
      let gameOverAudio = new Audio('./utils/sounds/game-over.mp3');
      gameOverAudio.volume = 0.5;
      gameOverAudio.play();
      resumeBtn.style.display = "none";
      showPopup("GAME OVER!",`Final Score: ${score}`);
    }
  }
}

export function calculateFPS() {
  setFrameCount(frameCount + 1);
  const currentTime = Date.now();
  if (currentTime - lastFpsUpdateTime >= 1000) {
    setFps(frameCount);
    fpsDisplay.innerHTML = `${fps}`;
    setFrameCount(0);
    setLastFpsUpdateTime(currentTime);
  }
}

export function updateTimer() {
  timerDisplay.textContent = timeLeft;
  if (timeLeft > 0 && !gamePaused && !gameOver) {
    setTimeLeft(timeLeft - 1);
    const newTimerId = setTimeout(updateTimer, 1000);
    setTimerId(newTimerId);
  } else if (timeLeft <= 0) {
    setGameOver(true);
    cancelAnimationFrame(animationFrameId);
    clearTimeout(timerId);
    let timeUpAudio = new Audio('./utils/sounds/times-up.mp3');
    timeUpAudio.volume = 0.5;
    timeUpAudio.play();

    resumeBtn.style.display = "none";
    showPopup("TIME'S UP!",`Game Over! Final Score: ${score}`);
  } else if (!gameOver) {
    const newTimerId = setTimeout(updateTimer, 100);
    setTimerId(newTimerId);
  }
}
