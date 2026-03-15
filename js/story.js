import { DOM , gameStates } from "./config.js";
import { moveInvaders } from "./main.js";

// Story content for story mode
export const storyContent = {
    introduction: {
        title: "The Challenge Begins",
        message:
            "Welcome to Reboot01, elite coding institute! Your squad of talented students has been thriving... until now. There's a rival academy that has challenged Rebooter . As defenders , you must protect your reputation and prove your skills. Ready to defend the legacy?",
        buttonText: "Start Mission",
    },
    development: {
        title: "KEEP GOING!",
        message:
            "Impressive! Your skills are shining through. The competition is heating up stay focused and keep pushing forward!",
        buttonText: "Continue Fighting",
        triggerScore: 1150,
    },
    victoryConclusion: {
        title: "Mission Complete , Rebooter winsss!",
        message:
            "Outstanding performance! You've successfully defended Reboot01's honor and proved that our students are truly exceptional. Reboot01 stands victorious!",
        buttonText: "Celebrate",
    },
    defeatConclusion: {
        title: "Not the End",
        message:
            "The battle didn't go as planned, but Reboot01 students never give up! Train harder and come back stronger!",
        buttonText: "Try Again",
    },
};

// Show story popup with custom content
export function showStoryPopup(storyData, callback) {
    if (gameStates.animationFrameId) {
        cancelAnimationFrame(gameStates.animationFrameId);
        gameStates.animationFrameId = null;
    }
    gameStates.isPaused = true;
    gameStates.pausedTime = performance.now();
    gameStates.storyPopupActive = true;

    // Reset FPS counter to prevent doubling
    gameStates.frameCount = 0;
    gameStates.lastFpsUpdateTime = 0;

    DOM.storyTitle.textContent = storyData.title;
    DOM.storyMessage.textContent = storyData.message;
    DOM.storyContinueBtn.textContent = storyData.buttonText;
    DOM.storyPopup.classList.add("show");

    // Store callback for the continue button
    DOM.storyContinueBtn.onclick = () => {
        hideStoryPopup();
        if (callback) callback();
    };
}

// Hide story popup
export function hideStoryPopup() {
    DOM.storyPopup.classList.remove("show");
    gameStates.storyPopupActive = false;

    // Resume game after story popup closes (only if game was already started)
    if (gameStates.isPaused && !gameStates.gameOver && gameStates.gameStarted) {
        if (gameStates.pausedTime) {
            const pauseDuration = performance.now() - gameStates.pausedTime;
            if (gameStates.gameStartTime) {
                gameStates.gameStartTime += pauseDuration;
            }
        }
        gameStates.isPaused = false;
        gameStates.pausedTime = null;

        if (!gameStates.animationFrameId) {
            gameStates.animationFrameId = requestAnimationFrame(moveInvaders);
        }
    } else if (!gameStates.gameStarted) {
        // If game hasn't started yet (intro story), just unpause
        gameStates.isPaused = false;
        gameStates.pausedTime = null;
    }
}

export function addSound(src) {
    switch (src) {
        case "fire":
            let fireSound = new Audio("../utils/sounds/fire.mp3");
            fireSound.play();
            break;
        case "hit":
            let explosionSound = new Audio("../utils/sounds/punch.mp3");
            explosionSound.play();
            break;
        case "gameover":
            let failSound = new Audio("../utils/sounds/fail-sound.mp3");
            failSound.play();
            let gameOverSound = new Audio("../utils/sounds/game-over.mp3");
            gameOverSound.play();
            setTimeout(() => gameOverSound.play(), 2000);
            break;
        case "victory":
            let victorySound = new Audio("../utils/sounds/congrat.mp3");
            victorySound.play();
            break;
        case "nextlevel":
            let nextLevelSound = new Audio("../utils/sounds/level-up.mp3");
            nextLevelSound.play();
            break;
        case "timeup":
            let timeUpSound = new Audio("../utils/sounds/times-up.mp3");
            timeUpSound.play();
            break;
        case "hurt":
            let hurtSound = new Audio("../utils/sounds/hurt.mp3");
            hurtSound.play();
            break;
        case "enemy-laser":
            let enemyLaserSound = new Audio("../utils/sounds/shooter-fire.mp3");
            enemyLaserSound.play();
            break;
        case "mission-failed":
            let missionFailedSound = new Audio("../utils/sounds/mission-failed.mp3");
            missionFailedSound.play();
            break;
        case "mission-complete":
            let missionCompleteSound = new Audio("../utils/sounds/mission-complete.mp3");
            missionCompleteSound.play();
            break;
        case "intro":
            let introSound = new Audio("../utils/sounds/intro.mp3");
            introSound.play();
            break;
        case "development":
            let developmentSound = new Audio("../utils/sounds/development.mp3");
            developmentSound.play();
            break;
        case "boss-laughing":
            let bossLaughingSound = new Audio("../utils/sounds/Boss-Laughing.mp3");
            bossLaughingSound.play();
            break;
    }
}

// Show story mode selection popup on page load
export function showStoryModeSelection() {
    DOM.storyModePopup.classList.add("show");
}

// Hide story mode selection popup
export function hideStoryModeSelection() {
    DOM.storyModePopup.classList.remove("show");
}