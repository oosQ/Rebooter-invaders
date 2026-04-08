import { DOM } from "./config.js";
import { getOrdinal } from "./scoreboard.js";

// Pagination variables
let currentPage = 1;
const scoresPerPage = 5;
let allScores = [];

export function showLeaderboard() {
  DOM.leaderboardDialog.style.display = "flex";

  // [ Fetch scoreboard ]
  fetch("/scoreboard")
    .then((response) => response.json())
    .then((data) => {
      // [ Sort data descending ]
      data.sort((a, b) => b.score - a.score);
      allScores = data;
      currentPage = 1;
      
      const totalPages = Math.ceil(allScores.length / scoresPerPage);
      displayHomePage();
      updateHomePageInfo(totalPages);
      setupHomePagination(totalPages);
    }).catch((error) => {
      console.error("Error fetching scoreboard:", error);
      const leaderboardBody = document.getElementById("leaderboardBody");
      leaderboardBody.innerHTML = "<tr><td colspan='4' style='text-align: center;'>Error loading scores. Please try again.</td></tr>";
    });
}

function displayHomePage() {
  const leaderboardBody = document.getElementById("leaderboardBody");
  leaderboardBody.innerHTML = "";

  if (allScores.length === 0) {
    leaderboardBody.innerHTML = "<tr><td colspan='4' style='text-align: center;'>No scores recorded yet!</td></tr>";
    return;
  }

  const startIndex = (currentPage - 1) * scoresPerPage;
  const endIndex = startIndex + scoresPerPage;
  const pageScores = allScores.slice(startIndex, endIndex);

  pageScores.forEach((score, index) => {
    const row = document.createElement("tr");
    const globalRank = startIndex + index + 1;

    const rankClass = globalRank === 1 ? "rank-1" : globalRank === 2 ? "rank-2" : globalRank === 3 ? "rank-3" : "";

    row.innerHTML = `
      <td class="rank-cell ${rankClass}">${getOrdinal(globalRank)}</td>
      <td>${score.name}</td>
      <td>${score.score}</td>
      <td>${score.timeTaken}</td>`;
    leaderboardBody.appendChild(row);
  });
}

function updateHomePageInfo(totalPages) {
  const pageInfo = document.getElementById("homePageInfo");
  pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
  
  document.getElementById("homePrevPageBtn").disabled = currentPage === 1;
  document.getElementById("homeNextPageBtn").disabled = currentPage === totalPages || totalPages === 0;
}

function setupHomePagination(totalPages) {
  const prevBtn = document.getElementById("homePrevPageBtn");
  const nextBtn = document.getElementById("homeNextPageBtn");

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      displayHomePage();
      updateHomePageInfo(totalPages);
    }
  };

  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayHomePage();
      updateHomePageInfo(totalPages);
    }
  };
}
