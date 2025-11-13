// Game Variables
export const invadersRemoved = [];
export let shooterIndex = 202;
export let timerId, animationFrameId;
export let score = 0;
export let canShoot = true;
export let timeLeft = 60, lastFpsUpdateTime = 0;
export let lives = 3;
export let frameCount = 0, fps = 0;
export let gameOver = false;
export let gamePaused = false;
export let currentLevel = 1;

// Key object for preventing spam shooting
export const keys = {};
export let spaceKeyPressed = false;

// Alien invaders array
export let alienInvaders = [];
export let shooterInvaders = [];
export let enemyLasers = [];

// Boss variables
export let bossPosition = -1;
export let bossHealth = 3;
export let bossDirection = 1;

// Movement variables
export let direction = 1;
export let isGoingRight = true;
export let shooterDirection = 1;
export let shooterGoingRight = true;

// Setters for state variables
export function setShooterIndex(value) {
  shooterIndex = value;
}

export function setTimerId(value) {
  timerId = value;
}

export function setAnimationFrameId(value) {
  animationFrameId = value;
}

export function setScore(value) {
  score = value;
}

export function setCanShoot(value) {
  canShoot = value;
}

export function setTimeLeft(value) {
  timeLeft = value;
}

export function setLastFpsUpdateTime(value) {
  lastFpsUpdateTime = value;
}

export function setLives(value) {
  lives = value;
}

export function setFrameCount(value) {
  frameCount = value;
}

export function setFps(value) {
  fps = value;
}

export function setGameOver(value) {
  gameOver = value;
}

export function setGamePaused(value) {
  gamePaused = value;
}

export function setCurrentLevel(value) {
  currentLevel = value;
}

export function setBossPosition(value) {
  bossPosition = value;
}

export function setBossHealth(value) {
  bossHealth = value;
}

export function setBossDirection(value) {
  bossDirection = value;
}

export function setDirection(value) {
  direction = value;
}

export function setIsGoingRight(value) {
  isGoingRight = value;
}

export function setShooterDirection(value) {
  shooterDirection = value;
}

export function setShooterGoingRight(value) {
  shooterGoingRight = value;
}
