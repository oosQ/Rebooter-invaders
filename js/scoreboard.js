
export function scoreBoardSetup(name, score, timeTaken) {
    // [ Sanitize & Validate name ]
    if (name == null || name.trim() === "") name = "Anonymous";
    if (name.length > 20) name = name.substring(0, 20);
    if (!/^[a-zA-Z0-9 _-]+$/.test(name)) name = "Anonymous";

    // [ Convert seconds to MM:SS format ]
    const totalSeconds = parseInt(timeTaken);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    fetch("/scoreboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score, timeTaken: formattedTime }),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Score submitted successfully", data);
            showScoreboard(data, name);
        })
        .catch((error) => {
            console.error("Error submitting score:", error);
        });
}

// Scoreboard pagination part
let currentPage = 1;
const scoresPerPage = 5;

export function showScoreboard(responseData, playerName) {
    const modal = document.getElementById("scoreboardModal");
    const pageInfo = document.getElementById("pageInfo");

    const { scores,totalScores } = responseData;

    const totalPages = Math.ceil(totalScores / scoresPerPage);
    currentPage = 1;

    displayPage(scores, playerName);
    pageInfo.textContent = `Page ${currentPage}/${totalPages}`;

    // Setup pagination buttons
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(scores, playerName);
            pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
            updatePaginationButtons(currentPage, totalPages);
        }
    };

    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(scores, playerName);
            pageInfo.textContent = `Page ${currentPage}/${totalPages}`;
            updatePaginationButtons(currentPage, totalPages);
        }
    };

    updatePaginationButtons(currentPage, totalPages);

    modal.style.display = "flex";
    setTimeout(() => {modal.classList.add("show");}, 10);
}

export function displayPage(scores, playerName) {
    const scoreboardBody = document.getElementById("scoreboardBody");
    scoreboardBody.innerHTML = "";

    const startIndex = (currentPage - 1) * scoresPerPage;
    const endIndex = startIndex + scoresPerPage;
    const pageScores = scores.slice(startIndex, endIndex);

    pageScores.forEach((score, index) => {
        const row = document.createElement("tr");
        const globalRank = startIndex + index + 1;

        // Highlight player's score
        if (score.name === playerName && score.rank === globalRank) {
            row.classList.add("highlight");
        }

        const rankClass = globalRank === 1 ? "rank-1" : globalRank === 2 ? "rank-2" : globalRank === 3 ? "rank-3" : "";

        row.innerHTML = `
            <td class="rank-cell ${rankClass}">${getOrdinal(globalRank)}</td>
            <td>${score.name}</td>
            <td>${score.score}</td>
            <td>${score.timeTaken}</td>`;
        scoreboardBody.appendChild(row);
    });
}

export function updatePaginationButtons(current, total) {
    document.getElementById("prevPageBtn").disabled = current === 1;
    document.getElementById("nextPageBtn").disabled = current === total;
}

export function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}