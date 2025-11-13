// Get DOM Elements from the document
export const grid = document.querySelector(".grid");
export const result = document.querySelector(".result");

// Scoreboard Details
export const timerDisplay = document.querySelector(".timer");
export const livesDisplay = document.querySelector(".lives");
export const fpsDisplay = document.querySelector(".fps-display");
export const levelDisplay = document.querySelector(".level");

// Pop-up Elements
export const gamePopup = document.getElementById("gamePopup");
export const popupTitle = document.getElementById("popupTitle");
export const popupMessage = document.getElementById("popupMessage");
export const backToMenuBtn = document.getElementById("backToMenuBtn");
export const restartBtn = document.getElementById("restartBtn");
export const resumeBtn = document.getElementById("resumeBtn");

// Game Constants
export const width = 15;
export const cellCount = width * width;
export const maxLevels = 5;

// Create grid squares
for (let index = 0; index < cellCount; index++) {
  const square = document.createElement("div");
  square.id = index;
  grid.appendChild(square);
}

// Create an array of all the squares in the grid
export const squares = Array.from(document.querySelectorAll(".grid div"));
console.log("Square has been created: ");
