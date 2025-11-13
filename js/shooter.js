import { width, squares, result } from './constants.js';
import {
  shooterIndex,
  canShoot,
  gamePaused,
  gameOver,
  keys,
  invadersRemoved,
  alienInvaders,
  shooterInvaders,
  bossPosition,
  bossHealth,
  score,
  currentLevel,
  setShooterIndex,
  setCanShoot,
  setBossHealth,
  setBossPosition,
  setScore
} from './gameState.js';

export function moveShooter(e) {
  if (gamePaused || gameOver) return;
  squares[shooterIndex].classList.remove("shooter");
  switch (e.key) {
    case "ArrowLeft":
      if (shooterIndex % width !== 0) setShooterIndex(shooterIndex - 1);
      break;
    case "ArrowRight":
      if (shooterIndex % width < width - 1) setShooterIndex(shooterIndex + 1);
      break;
  }
  squares[shooterIndex].classList.add("shooter");
}

export function shoot(e) {
  if (e.key === " " && canShoot && !gamePaused && !gameOver) {
    setCanShoot(false);
    setTimeout(() => setCanShoot(true), 300);

    let laserId;
    let currentLaserIndex = shooterIndex;
    let audio = new Audio('./utils/sounds/shooter-fire.mp3');
    audio.volume = 0.2;
    audio.play();
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
        let punchAudio = new Audio('./utils/sounds/punch.mp3');
        punchAudio.volume = 0.2;
        punchAudio.play();
        squares[currentLaserIndex].classList.remove("laser");
        clearInterval(laserId);

        // Boss hit logic
        if (squares[currentLaserIndex].classList.contains("boss")) {
          setBossHealth(bossHealth - 1);
          squares[currentLaserIndex].classList.add("boom");
          setTimeout(() => squares[currentLaserIndex].classList.remove("boom"), 150);
          if (bossHealth <= 0) {
            squares[currentLaserIndex].classList.remove("boss");
            setBossPosition(-1);
            setScore(score + 100 * currentLevel);
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
          setScore(score + 10 * levelMultiplier);
        }

        result.innerHTML = score;
      }
    }
    laserId = setInterval(moveLaser, 50);
  }
}

// Key event handlers to prevent spam shooting
export function handleKeyDown(e) {
  if (e.key === " " && !keys[e.key]) {
    keys[e.key] = true;
    shoot(e);
  }
}

export function handleKeyUp(e) {
  if (e.key === " ") keys[e.key] = false;
}
