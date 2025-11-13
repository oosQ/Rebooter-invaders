// Main game entry point - imports and orchestrates all modules
import { squares, result, livesDisplay, levelDisplay } from './constants.js';
import {
  shooterIndex,
  score,
  lives,
  currentLevel,
  setAnimationFrameId
} from './gameState.js';
import { initializeLevel } from './levels.js';
import { addInvaders, animateInvaders } from './invaders.js';
import { moveShooter, handleKeyDown, handleKeyUp } from './shooter.js';
import { initializeGameControls } from './game.js';
import { updateTimer } from './ui.js';

// Add the shooter to the grid
squares[shooterIndex].classList.add("shooter");

// Initialize display values
result.innerHTML = score;
livesDisplay.textContent = lives;
levelDisplay.textContent = currentLevel;

// Initialize the first level
initializeLevel(currentLevel);
addInvaders();

// Start game timer
updateTimer();

// Start animation loop
const initialAnimationFrameId = requestAnimationFrame(animateInvaders);
setAnimationFrameId(initialAnimationFrameId);

// Setup event listeners
document.addEventListener("keydown", moveShooter);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
initializeGameControls();
