// Get DOM Elements from the document
const grid = document.querySelector(".grid");
const result = document.querySelector(".result");

// Scoreboard Details
const timerDisplay = document.querySelector('.timer');
const livesDisplay = document.querySelector('.lives');
const fpsDisplay = document.querySelector(".fps-display");

// Game Variables
const width = 15;
const cellCount = width * width;
const invadersRemoved = [];
let currentShooterIndex = 202;
let invaderId, timerId, animationFrameId;
let isGoingRight = true;
let direction = 1;
let score = 0;
let canShoot = true;
let timeLeft = 60 , lastFpsUpdateTime = 0; 
let lives = 3;
let frameCount = 0, fps = 0;
let gameOver = false;
let bigbosslife = 10;

// Add cells to the grid through a loop
for (let index = 0; index < cellCount; index++) {
    const square = document.createElement("div");
    square.id = index;
    grid.appendChild(square);    
}

// Create an array of all the squares in the grid
const squares = Array.from(document.querySelectorAll(".grid div"));
 
console.log(squares);

const alienInvaders = [
  0,1,2,3,4,5,6,7,8,9,
  16,17,18,19,20,21,22,23,
  32,33,34,35,36,37
];

const advancedInvaders = [62,72];

const bigBoss = [
    21,22,23,24,25,
    36,37,38,39,40,
    51,52,53,54,55
]

function addInvaders() {
  for (let i = 0; i < alienInvaders.length; i++) {
    if (!invadersRemoved.includes(i) && alienInvaders[i] >= 0 && alienInvaders[i] < squares.length) {
      squares[alienInvaders[i]].classList.add("invader");
    }
    }

  for (let i = 0; i < advancedInvaders.length; i++) {
    if (!invadersRemoved.includes(i) && advancedInvaders[i] >= 0 && advancedInvaders[i] < squares.length) {
      squares[advancedInvaders[i]].classList.add("advancedInvader");
    }
  }

  if (alienInvaders.length === 0 && bigbosslife > 0 && advancedInvaders.length === 0) {
      for (let i = 0; i < bigBoss.length; i++) {
        if (bigBoss[i] >= 0 && bigBoss[i] < squares.length) {
          squares[bigBoss[i]].classList.add("bigBoss");
        }
      }
  }

}
addInvaders();