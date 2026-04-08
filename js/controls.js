import { DOM, gameStates, showPopup } from "./config.js";
import {squares,manageInvaders,initializeLevel,moveInvaders,initializeGrid,} from "./main.js";
import {hideStoryPopup,addSound,showStoryPopup,storyContent,hideStoryModeSelection,showStoryModeSelection,} from "./story.js";
import { scoreBoardSetup, requestGameToken } from "./scoreboard.js";
import { showLeaderboard } from "./home.js";

// [ Key handlers (keydown and keyup) ]
export function keyDownHandler(e) {
  // [ Disable all keys during mode selection or story popup ]
  if (gameStates.modeSelectionActive || gameStates.storyPopupActive) return;

  if (e.code === "Escape") {
    if (gameStates.isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  } else if (e.code === "KeyR") {
    restartGame();
  } else if (e.code === "Space") {
    gameStates.keys[e.code] = true;
    e.preventDefault();
  } else if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
    gameStates.keys[e.code] = true;
  }
}

export function keyUpHandler(e) {
  if (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "Space")
    gameStates.keys[e.code] = false;
}

// [ Game management (start) ]
export function startGame() {
  if (gameStates.gameStarted || gameStates.gameOver) return;
  // Initialize grid if not already done
  if (squares.length === 0) {
    initializeGrid();
  }
  gameStates.gameStarted = true;
  initializeLevel(gameStates.level);
  manageInvaders("add");
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
  gameStates.animationFrameId = requestAnimationFrame(moveInvaders);
}

// [ Game management (end) ]
export function endGame() {
  if (gameStates.gameOver) return;
  gameStates.gameStarted = false;
  gameStates.gameOver = true;
  document.removeEventListener("keydown", keyDownHandler);
  document.removeEventListener("keyup", keyUpHandler);
  cancelAnimationFrame(gameStates.animationFrameId);
}

// [ Game management (pause) ]
export function pauseGame() {
  if (!gameStates.gameStarted || gameStates.gameOver) return;

  if (!gameStates.isPaused) {
    gameStates.pausedTime = performance.now();
    gameStates.isPaused = true;

    if (gameStates.animationFrameId) {
      cancelAnimationFrame(gameStates.animationFrameId);
      gameStates.animationFrameId = null;
    }
    showPopup("show","Game Paused","Press ESC or click Resume to continue",true);
  }
}

// [ Game management (resume) ]
export function resumeGame() {
  if (!gameStates.gameStarted || gameStates.gameOver) return;

  if (gameStates.isPaused) {
    if (gameStates.pausedTime) {
      const pauseDuration = performance.now() - gameStates.pausedTime;
      if (gameStates.gameStartTime) gameStates.gameStartTime += pauseDuration;
    }
    gameStates.isPaused = false;
    gameStates.pausedTime = null;
    showPopup("hide");

    // [ Restart the animation loop ]
    if (!gameStates.animationFrameId) gameStates.animationFrameId = requestAnimationFrame(moveInvaders);
  }
}

// [ Game management (restart) ]
export function restartGame() {
  gameStates.keys = {};
  gameStates.isPaused = false;
  gameStates.pausedTime = null;

  if (gameStates.animationFrameId) {
    cancelAnimationFrame(gameStates.animationFrameId);
    gameStates.animationFrameId = null;
  }

  gameStates.gameStarted = false;
  gameStates.gameOver = false;
  gameStates.isGameRestarted = true;

  squares.forEach((square) => {
    square.classList.remove("invader","shooter","laser","boom","enemy-laser","shooter-invader","boss");
  });

  gameStates.result = 0;
  gameStates.lives = 3;
  gameStates.level = 1;
  gameStates.direction = 1;
  gameStates.goingRight = true;
  gameStates.aliensRemoved = [];
  gameStates.shooterRemoved = [];
  gameStates.alienInvaders = [];
  gameStates.shooterInvaders = [];
  gameStates.currentShooterIndex = 202;
  gameStates.lastInvaderMoveTime = 0;
  gameStates.lastInvaderShootTime = 0;
  gameStates.invaderInterval = 500;
  gameStates.gameStartTime = null;
  gameStates.gameTime = 60;
  gameStates.remainingTime = 60;
  gameStates.bossHealth = 3;
  gameStates.bossPosition = -1;
  gameStates.bossDirection = 1;
  gameStates.storyStage = 0; // Reset story stage

  // Update display elements
  if (DOM.result) DOM.result.innerHTML = gameStates.result;
  if (DOM.livesDisplay) DOM.livesDisplay.innerHTML = gameStates.lives;
  if (DOM.timerDisplay) DOM.timerDisplay.innerHTML = gameStates.remainingTime;
  if (DOM.levelDisplay) DOM.levelDisplay.textContent = gameStates.level;

  showPopup("hide");
  hideStoryPopup();

  if (gameStates.storyMode) {
    addSound("intro");
    setTimeout(() => {
      showStoryPopup(storyContent.introduction, () => {
        gameStates.storyStage = 1;
        startGame();
      });
    }, 100);
  } else {
    startGame();
  }
}

export function resetWhenRichedBottom() {
  gameStates.lives -= 1;
  DOM.livesDisplay.innerHTML = gameStates.lives;

  manageInvaders("remove");

  gameStates.alienInvaders = [...levels[gameStates.level].staticpositions];
  if (levels[gameStates.level].shooterInvaders) {
    gameStates.shooterInvaders = [...levels[gameStates.level].shooterInvaders];
  } else {
    gameStates.shooterInvaders = [];
  }

  gameStates.aliensRemoved = [];
  gameStates.shooterRemoved = [];

  if (gameStates.level === 5) {
    gameStates.bossPosition = levels[gameStates.level].bossPosition || -1;
    gameStates.bossHealth = 3;
  }

  gameStates.direction = 1;
  gameStates.goingRight = true;
  gameStates.shooterDirection = 1;
  gameStates.shooterGoingRight = true;
  gameStates.bossDirection = 1;
  gameStates.bossGoingRight = true;
  gameStates.lastInvaderMoveTime = timestamp;
  gameStates.lastInvaderShootTime = timestamp;

  manageInvaders("add");
  moveInvaders(timestamp);
  if (gameStates.lives <= 0) {
    gameStates.gameOver = true;
    cancelAnimationFrame(gameStates.animationFrameId);
    if (gameStates.storyMode) {
      addSound("mission-failed");
      showStoryPopup(storyContent.defeatConclusion);
      DOM.storyContinueBtn.onclick = async () => {
        hideStoryPopup();
        let name = prompt("Enter your name for the leaderboard:");
        const timeTaken = gameStates.gameTime - gameStates.remainingTime;
        const token = await requestGameToken(gameStates.result, timeTaken);
        scoreBoardSetup(name, gameStates.result, timeTaken, token);
      };
    } else {
      addSound("gameover");
      (async () => {
        let name = prompt("Enter your name for the leaderboard:");
        const timeTaken = gameStates.gameTime - gameStates.remainingTime;
        const token = await requestGameToken(gameStates.result, timeTaken);
        scoreBoardSetup(name, gameStates.result, timeTaken, token);
      })();
    }
    endGame();
    return;
  }
  return;
}

// [ Event listeners ]
export function eventListeners(page) {
  switch (page) {
    // [ Home Page ]
    case "index":
      DOM.startGameBtn.addEventListener("click", () => { window.location.href = "game.html";});
      DOM.leaderboardBtn.addEventListener("click", () => { showLeaderboard();});
      DOM.aboutBtn.addEventListener("click", () => { DOM.aboutDialog.style.display = "flex";});
      DOM.closeAboutBtn.addEventListener("click", () => { DOM.aboutDialog.style.display = "none";});
      DOM.closeLeaderboardBtn.addEventListener("click", () => { DOM.leaderboardDialog.style.display = "none";});

      DOM.leaderboardDialog.addEventListener("click", function (e) {
        if (e.target === DOM.leaderboardDialog) DOM.leaderboardDialog.style.display = "none";
      });
      DOM.aboutDialog.addEventListener("click", function (e) {
        if (e.target === DOM.aboutDialog) DOM.aboutDialog.style.display = "none";
      });
      break;

    // [ Game Page ]
    case "game":
      DOM.storyModeBtn.addEventListener("click", () => {
        gameStates.storyMode = true;
        gameStates.modeSelectionActive = false;
        hideStoryModeSelection();
        addSound("intro");
        showStoryPopup(storyContent.introduction, () => {
          gameStates.storyStage = 1;
          startGame();
        });
      });

      DOM.classicModeBtn.addEventListener("click", () => {
        gameStates.storyMode = false;
        gameStates.modeSelectionActive = false;
        hideStoryModeSelection();
        startGame();
      });

      window.addEventListener("DOMContentLoaded", () => { showStoryModeSelection(); });
      DOM.resumeBtn.addEventListener("click", resumeGame);
      DOM.restartBtn.addEventListener("click", restartGame);
      DOM.backToMenuBtn.addEventListener("click", () => {window.location.href = "index.html";});

      document.addEventListener("keydown", (e) => {
        if (e.code === "KeyR" && !gameStates.modeSelectionActive) restartGame();
      });

      document.getElementById("scoreboardRestartBtn").addEventListener("click", () => {
          const modal = document.getElementById("scoreboardModal");
          modal.classList.remove("show");
          setTimeout(() => {
            modal.style.display = "none";
            restartGame();
          }, 300);
        });

      document.getElementById("scoreboardMenuBtn").addEventListener("click", () => {window.location.href = "index.html";});
  }
}
