// Menu Elements
const startGameBtn = document.getElementById("startGameBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const aboutBtn = document.getElementById("aboutBtn");

// Dialog Elements
const leaderboardDialog = document.getElementById("leaderboardDialog");
const aboutDialog = document.getElementById("aboutDialog");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const closeAboutBtn = document.getElementById("closeAboutBtn");

// Menu System Functions
function startGame() {
  // Navigate to the game page
  window.location.href = "index.html";
}

function showLeaderboard() {
  leaderboardDialog.style.display = "flex";

  // Get high scores from localStorage
  const highScores =
    JSON.parse(localStorage.getItem("spaceInvadersScores")) || [];
  const leaderboardList = document.getElementById("leaderboardList");

  if (highScores.length === 0) {
    leaderboardList.innerHTML = `
            <p class="no-scores">No high scores yet!</p>
            <p class="score-instruction">Play the game to set your first high score!</p>
        `;
  } else {
    leaderboardList.innerHTML = highScores
      .slice(0, 10) // Show top 10
      .map(
        (score, index) => `
                <div class="score-entry">
                    <span class="rank">${index + 1}.</span>
                    <span class="score-value">${score.score} pts</span>
                    <span class="score-level">Level ${score.level}</span>
                </div>
            `
      )
      .join("");
  }
}

function hideLeaderboard() {
  leaderboardDialog.style.display = "none";
}

function showAbout() {
  aboutDialog.style.display = "flex";
}

function hideAbout() {
  aboutDialog.style.display = "none";
}

// Menu Event Listeners
startGameBtn.addEventListener("click", startGame);
leaderboardBtn.addEventListener("click", showLeaderboard);
aboutBtn.addEventListener("click", showAbout);
closeLeaderboardBtn.addEventListener("click", hideLeaderboard);
closeAboutBtn.addEventListener("click", hideAbout);

// Close dialogs when clicking outside
leaderboardDialog.addEventListener("click", (e) => {
  if (e.target === leaderboardDialog) {
    hideLeaderboard();
  }
});

aboutDialog.addEventListener("click", (e) => {
  if (e.target === aboutDialog) {
    hideAbout();
  }
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideLeaderboard();
    hideAbout();
  }

  // Enter key to start game when no dialogs are open
  if (
    e.key === "Enter" &&
    leaderboardDialog.style.display !== "flex" &&
    aboutDialog.style.display !== "flex"
  ) {
    startGame();
  }
});

// Add some interactive particles effect
function createParticles() {
  const particleCount = 50;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;

    document.body.appendChild(particle);
    particles.push({
      element: particle,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    });
  }

  function animateParticles() {
    particles.forEach((particle) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around screen
      if (particle.x < 0) particle.x = window.innerWidth;
      if (particle.x > window.innerWidth) particle.x = 0;
      if (particle.y < 0) particle.y = window.innerHeight;
      if (particle.y > window.innerHeight) particle.y = 0;

      particle.element.style.left = particle.x + "px";
      particle.element.style.top = particle.y + "px";
      particle.element.style.opacity = particle.opacity;
    });

    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

// Initialize particles when page loads
window.addEventListener("load", () => {
  createParticles();

  // Add entrance animation delay to menu items
  const menuButtons = document.querySelectorAll(".menu-btn");
  menuButtons.forEach((btn, index) => {
    btn.style.animationDelay = `${0.5 + index * 0.2}s`;
    btn.style.opacity = "0";
    btn.style.animation = "fadeInUp 0.8s ease-out forwards";
  });
});

console.log("🚀 Space Invaders Home Page Loaded!");
console.log("Press ENTER to start game quickly or use the menu buttons.");
