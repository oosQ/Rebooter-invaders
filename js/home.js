import { DOM } from "./config.js";

export function showLeaderboard() {
  DOM.leaderboardDialog.style.display = "flex";

  // [ Fetch scoreboard ]
  fetch("/scoreboard")
    .then((response) => response.json())
    .then((data) => {
      const leaderboardList = document.getElementById("leaderboardList");

      // [ Sort data descending ]
      data.sort((a, b) => b.score - a.score);
      leaderboardList.innerHTML =
        data.length === 0 ? "<p>No scores recorded yet!</p>" : "";

      // [ Show Data ]
      data.forEach((entry, index) => {
        const entryDiv = document.createElement("div");
        entryDiv.className = "leaderboard-entry";
        entryDiv.innerHTML = `<span class="rank">${index + 1}</span> <span class="name">${entry.name}</span> - <span class="score">${entry.score}</span> pts - <span class="time">${entry.timeTaken}</span>`;
        leaderboardList.appendChild(entryDiv);
      });

      // [ Handle case with no entries ]
    }).catch((error) => {
      console.error("Error fetching scoreboard:", error);
      const leaderboardList = document.getElementById("leaderboardList");
      leaderboardList.innerHTML ="<p>Error loading scores. Please try again.</p>";
    });
}
