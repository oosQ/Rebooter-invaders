import { width, squares, maxLevels, resumeBtn } from './constants.js';
import {
  alienInvaders,
  shooterInvaders,
  bossPosition,
  bossHealth,
  bossDirection,
  gameOver,
  gamePaused,
  shooterIndex,
  direction,
  isGoingRight,
  shooterDirection,
  shooterGoingRight,
  currentLevel,
  timerId,
  animationFrameId,
  score,
  setBossPosition,
  setBossDirection,
  setDirection,
  setIsGoingRight,
  setShooterDirection,
  setShooterGoingRight,
  setGameOver,
  setAnimationFrameId,
  setTimerId
} from './gameState.js';
import { invaderMoveInterval } from './levels.js';
import { showPopup } from './ui.js';
import { nextLevel } from './levels.js';

export function addInvaders() {
  // Add regular invaders
  for (let i = 0; i < alienInvaders.length; i++) {
    if (alienInvaders[i] >= 0 && alienInvaders[i] < squares.length) {
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

export function removeInvaders() {
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

export function moveInvaders() {
  if (gameOver || gamePaused) return;

  removeInvaders();

  if (alienInvaders.length > 0) {
   const atLeftEdge = alienInvaders.some(invader => invader % width === 0);
    const atRightEdge = alienInvaders.some(invader => invader % width === width - 1);


    // Invaders movement
    if (atRightEdge && isGoingRight) {
      for (let i = 0; i < alienInvaders.length; i++) {
        alienInvaders[i] += width + 1;
      }
      setDirection(-1);
      setIsGoingRight(false);
    }
    if (atLeftEdge && !isGoingRight) {
      for (let i = 0; i < alienInvaders.length; i++) {
        alienInvaders[i] += width - 1;
      }
      setDirection(1);
      setIsGoingRight(true);
    }
    for (let i = 0; i < alienInvaders.length; i++) {
      alienInvaders[i] += direction;
    }
  }

  // Shooter invaders movement
  if (shooterInvaders.length > 0) {
    const shooterAtLeftEdge = shooterInvaders.some(shooter=>shooter % width === 0);
    const shooterAtRightEdge = shooterInvaders.some(shooter=>shooter % width === width - 1);
    if (shooterAtRightEdge && shooterGoingRight) {
      setShooterDirection(-1);
      setShooterGoingRight(false);
    }
    if (shooterAtLeftEdge && !shooterGoingRight) {
      setShooterDirection(1);
      setShooterGoingRight(true);
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
      setBossDirection(-1);
    } else if (bossAtLeftEdge && bossDirection === -1 ) {
      setBossDirection(1);
    }
    setBossPosition(bossPosition + bossDirection);
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
    setGameOver(true);
    cancelAnimationFrame(animationFrameId);
    clearTimeout(timerId);
    let gameOverAudio = new Audio('./utils/sounds/game-over.mp3');
    gameOverAudio.volume = 0.5;
    gameOverAudio.play();
    resumeBtn.style.display = "none";
    showPopup("GAME OVER!",`You Failed to prove yourself! Final Score: ${score}`);
    return;
  }

  // Check for level completion
  if (alienInvaders.length === 0 && shooterInvaders.length === 0 && bossPosition === -1) {
    if (currentLevel < maxLevels) {
      nextLevel();
    } else {
      setGameOver(true);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timerId);
      let congratsAudio = new Audio('./utils/sounds/congrat.mp3');
      let winAudio = new Audio('./utils/sounds/winning.mp3');
      congratsAudio.play();
      setTimeout(() => { winAudio.play(); }, 2000);
      resumeBtn.style.display = "none";
      showPopup("CONGRATULATIONS!",`You've completed all ${maxLevels} levels! Final Score: ${score}`);
    }
    return;
  }
  addInvaders();
}

export let lastInvaderMove = 0;

export function setLastInvaderMove(value) {
  lastInvaderMove = value;
}

export function animateInvaders(timestamp) {
  if (gamePaused || gameOver) return;

  if (!lastInvaderMove) lastInvaderMove = timestamp;

  if (timestamp - lastInvaderMove >= invaderMoveInterval) {
    moveInvaders();
    lastInvaderMove = timestamp;
  }
  
  // Import calculateFPS dynamically to avoid circular dependency
  import('./ui.js').then(({ calculateFPS }) => {
    calculateFPS();
  });
  
  const newAnimationFrameId = requestAnimationFrame(animateInvaders);
  setAnimationFrameId(newAnimationFrameId);
}
