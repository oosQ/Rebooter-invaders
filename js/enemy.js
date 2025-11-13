import { width, squares, livesDisplay, resumeBtn } from './constants.js';
import {
  gameOver,
  gamePaused,
  shooterInvaders,
  shooterIndex,
  lives,
  score,
  currentLevel,
  timerId,
  animationFrameId,
  setLives,
  setGameOver,
  setTimerId,
  setAnimationFrameId
} from './gameState.js';
import { showPopup } from './ui.js';

export function enemyShoot() {
  if (gameOver || gamePaused || shooterInvaders.length === 0) return;

  // Going through each shooter invader to shoot
  shooterInvaders.forEach((shooterPosition) => {
    if (!shooterInvaders.includes(shooterPosition)) return;
    let enemyLaserIndex = shooterPosition;
    let audio = new Audio('./utils/sounds/fire.mp3');
    audio.play();
    function moveEnemyLaser() {
      if (enemyLaserIndex >= 0 && enemyLaserIndex < squares.length)
      squares[enemyLaserIndex].classList.remove("enemy-laser");
      enemyLaserIndex += width;

      // Check if laser reached bottom
      if (enemyLaserIndex >= squares.length) {
        clearInterval(enemyLaserId);
        return;
      }

      squares[enemyLaserIndex].classList.add("enemy-laser");

      // Check if laser hits the player
      if (squares[enemyLaserIndex].classList.contains("shooter")) {
        let hurtAudio = new Audio('./utils/sounds/hurt.mp3');
        hurtAudio.play();
        squares[enemyLaserIndex].classList.remove("enemy-laser");
        clearInterval(enemyLaserId);

        setLives(lives - 1);
        if (lives < 0) setLives(0);
        livesDisplay.textContent = lives;

        // Show hit effect on shooter
        setTimeout(() => {
          let shooter = document.getElementById(shooterIndex);
          shooter.style.filter = "drop-shadow(0 0 10px rgba(255, 71, 87, 0.6))";
          setTimeout(() => {shooter.style.filter = "";}, 400);
        }, 400);

        if (lives <= 0) {
          setGameOver(true);
          cancelAnimationFrame(animationFrameId);
          clearTimeout(timerId);
          let gameOverAudio = new Audio('./utils/sounds/game-over.mp3');
          let failAudio = new Audio('./utils/sounds/fail-sound.mp3');
          if (currentLevel == 5) {
            let bossLaughingAudio = new Audio('./utils/sounds/Boss-Laughing.mp3');
            bossLaughingAudio.play();
            setTimeout(() => { gameOverAudio.play(); }, 2000);
          } else {
            failAudio.play();
            setTimeout(() => { gameOverAudio.play(); }, 3000);
          }
          resumeBtn.style.display = "none";
          showPopup("GAME OVER!",`You've been shot down! Your Final Score: ${score}`);
          return;
        }
      }
    }
    const enemyLaserId = setInterval(moveEnemyLaser, 60);
  });
}

let enemyShootTimer;

export function startEnemyShooting() {
  enemyShootTimer = setTimeout(() => {
    enemyShoot();
    startEnemyShooting();
  }, 3000);
}

export function stopEnemyShooting() {
  if (enemyShootTimer) clearTimeout(enemyShootTimer);
  for (let i = 0; i < squares.length; i++) squares[i].classList.remove("laser");
}
