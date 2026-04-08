import {
    storyContent,
    showStoryPopup,
    hideStoryPopup,
    addSound,
} from "./story.js";
import { requestGameToken, scoreBoardSetup } from "./scoreboard.js";

export const DOM = {
    // [ Game Elements ]
    grid: document.querySelector(".grid"),
    result: document.querySelector(".result"),
    timerDisplay: document.querySelector(".timer"),
    livesDisplay: document.querySelector(".lives"),
    fpsDisplay: document.querySelector(".fps-display"),
    levelDisplay: document.querySelector(".level"),
    gamePopup: document.getElementById("gamePopup"),
    popupTitle: document.getElementById("popupTitle"),
    popupMessage: document.getElementById("popupMessage"),
    backToMenuBtn: document.getElementById("backToMenuBtn"),
    restartBtn: document.getElementById("restartBtn"),
    resumeBtn: document.getElementById("resumeBtn"),

    // [ Story Mode Elements ]
    storyModePopup: document.getElementById("storyModePopup"),
    storyModeBtn: document.getElementById("storyModeBtn"),
    classicModeBtn: document.getElementById("classicModeBtn"),
    storyPopup: document.getElementById("storyPopup"),
    storyTitle: document.getElementById("storyTitle"),
    storyMessage: document.getElementById("storyMessage"),
    storyContinueBtn: document.getElementById("storyContinueBtn"),

    // [ Home Page Elements ]
    startGameBtn: document.getElementById("startGameBtn"),
    leaderboardBtn: document.getElementById("leaderboardBtn"),
    leaderboardDialog: document.getElementById("leaderboardDialog"),
    closeLeaderboardBtn: document.getElementById("closeLeaderboardBtn"),
    aboutBtn: document.getElementById("aboutBtn"),
    closeAboutBtn: document.getElementById("closeAboutBtn"),
    aboutDialog: document.getElementById("aboutDialog"),
};

export const gameStates = {
    width: 15,
    gameTime: 60,
    maxLevels: 5,
    frameCount: 0,
    fps: 0,
    pausedTime: null,
    currentShooterIndex: 202,
    alienInvaders: [],
    shooterInvaders: [],
    aliensRemoved: [],
    shooterRemoved: [],
    result: 0,
    direction: 1,
    goingRight: true,
    lives: 3,
    gameStarted: false,
    isPaused: false,
    animationFrameId: null,
    invaderInterval: 500,
    level: 1,
    lastInvaderMoveTime: 0,
    lastFpsUpdateTime: 0,
    lastMoveTime: 0,
    lastShotTime: 0,
    lastInvaderShootTime: 0,
    gameStartTime: null,
    remainingTime: 60,
    keys: {},
    gameOver: false,
    bossHealth: 3,
    bossPosition: -1,
    bossDirection: 1,
    isGameRestarted: false,
    shooterDirection: 1,
    shooterGoingRight: true,
    bossGoingRight: true,
    invaderMoveInterval: 600,
    storyMode: false,
    storyStage: 0,
    modeSelectionActive: true,
    storyPopupActive: false,
    isScoreSubmitted: false,
    name: "",
};

export const levels = {
    1: {
        invaders: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39,
        ],
        staticpositions: [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
            31, 32, 33, 34, 35, 36, 37, 38, 39,
        ],
        movementSpeed: 450,
        timeBonus: 10,
    },
    2: {
        invaders: [
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49, 50, 51, 52,
            53, 54,
        ],
        staticpositions: [
            30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49, 50, 51, 52,
            53, 54,
        ],
        shooterInvaders: [1, 3, 5, 7],
        movementSpeed: 520,
        timeBonus: 20,
    },
    3: {
        invaders: [
            45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 60, 61, 62, 63, 64, 65, 66, 67,
            68, 69, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
        ],
        staticpositions: [
            45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 60, 61, 62, 63, 64, 65, 66, 67,
            68, 69, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
        ],
        shooterInvaders: [1, 3, 5, 7, 16, 18, 20, 22],
        movementSpeed: 510,
        timeBonus: 21,
    },
    4: {
        invaders: [
            60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 75, 76, 77, 78, 79, 80, 81, 82,
            83, 84, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 105, 106, 107, 108, 109,
            110, 111, 112, 113, 114,
        ],
        staticpositions: [
            60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 75, 76, 77, 78, 79, 80, 81, 82,
            83, 84, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 105, 106, 107, 108, 109,
            110, 111, 112, 113, 114,
        ],
        shooterInvaders: [1, 3, 5, 7, 9, 16, 18, 20, 22, 24],
        movementSpeed: 505,
        timeBonus: 23,
    },
    5: {
        invaders: [
            75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 90, 91, 92, 93, 94, 95, 96, 97,
            98, 99, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 120, 121, 122,
            123, 124, 125, 126, 127, 128, 129,
        ],
        staticpositions: [
            75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 90, 91, 92, 93, 94, 95, 96, 97,
            98, 99, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 120, 121, 122,
            123, 124, 125, 126, 127, 128, 129,
        ],
        shooterInvaders: [1, 3, 5, 7, 11, 13, 16, 18, 20, 22, 24, 26, 28],
        bossPosition: 9,
        movementSpeed: 600,
        timeBonus: 20,
    },
};

// [ Popup management ]
export function showPopup(condition, title, message, showResume = false) {
    DOM.popupTitle.textContent = title;
    DOM.popupMessage.textContent = message;
    DOM.resumeBtn.style.display = showResume ? "block" : "none";
    if (condition == "show") {
        DOM.gamePopup.classList.add("show");
    } else {
        DOM.gamePopup.classList.remove("show");
    }
}

// [ Timer function ]
export function updateTimer() {
    if (gameStates.isPaused || gameStates.gameOver) return;
    const currentTime = performance.now();
    if (!gameStates.gameStartTime) gameStates.gameStartTime = currentTime;

    const elapsedTime = Math.floor((currentTime - gameStates.gameStartTime) / 1000);
    gameStates.remainingTime = gameStates.gameTime - elapsedTime;
    DOM.timerDisplay.innerHTML = gameStates.remainingTime;

    if (gameStates.remainingTime <= 0) {
        DOM.timerDisplay.innerHTML = "Time's Up!";
        gameStates.gameOver = true;
        cancelAnimationFrame(gameStates.animationFrameId);

        // [ Handle game over based on mode ]
        if (gameStates.storyMode) {
            addSound("mission-failed");
            if (gameStates.level === 5) addSound("boss-laughing");
            showStoryPopup(storyContent.defeatConclusion);
            DOM.storyContinueBtn.onclick = async () => {
                hideStoryPopup();
                let name = prompt("Enter your name for the leaderboard:");
                const timeTaken = gameStates.gameTime - gameStates.remainingTime;
                const token = await requestGameToken(gameStates.result, timeTaken);
                scoreBoardSetup(name, gameStates.result, timeTaken, token);
            };
        } else {
            addSound("timeup");
            if (gameStates.level === 5) addSound("boss-laughing");
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
}

// [ FPS calculation ]
export function calculateFPS() {
    if (gameStates.isPaused || !gameStates.gameStarted || gameStates.gameOver) return;
    gameStates.frameCount++;
    const currentTime = performance.now();
    if (currentTime - gameStates.lastFpsUpdateTime >= 1000) {
        gameStates.fps = gameStates.frameCount;
        DOM.fpsDisplay.innerHTML = gameStates.fps;
        gameStates.frameCount = 0;
        gameStates.lastFpsUpdateTime = currentTime;
    }
}
