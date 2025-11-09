const startGameBtn = document.getElementById("startGameBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardDialog = document.getElementById("leaderboardDialog");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const aboutBtn = document.getElementById("aboutBtn");
const closeAboutBtn = document.getElementById("closeAboutBtn");
const aboutDialog = document.getElementById("aboutDialog");

startGameBtn.addEventListener("click", startGame);
leaderboardBtn.addEventListener("click", showLeaderboard);
aboutBtn.addEventListener("click", showAbout);
closeAboutBtn.addEventListener("click", closeAbout);
closeLeaderboardBtn.addEventListener("click", closeLeaderboard);


leaderboardDialog.addEventListener("click", function (e) {
  if (e.target === leaderboardDialog) closeLeaderboard();
});

aboutDialog.addEventListener("click", function (e) {
  if (e.target === aboutDialog) closeAbout();
});

function closeLeaderboard() {
  leaderboardDialog.style.display = "none";
}

function closeAbout() {
  aboutDialog.style.display = "none";
}

function startGame() {
    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = 0;
    setTimeout(() => {window.location.href = "index.html";}, 500);
}

function showLeaderboard() {
  leaderboardDialog.style.display = "flex";
}

function showAbout() {
  aboutDialog.style.display = "flex";
}
