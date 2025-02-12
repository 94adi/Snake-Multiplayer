import { fetchScores } from "../scores_library/scoresLibrary.js";

document.getElementById("startGameForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const playerName = document.getElementById("playerName").value.trim();
    
    if (playerName) {
        window.location.href = `/game?name=${encodeURIComponent(playerName)}`;
    } else {
        alert("Please enter your name!");
    }
});

async function displayLeaderboard() {
    try {
        const scores = await fetchScores();
        const leaderboard = document.getElementById("leaderboard");

        leaderboard.innerHTML = "";

        scores.forEach((entry, index) => {
            const li = document.createElement("li");
            li.innerHTML = `#${index + 1} <strong>${entry.player}</strong>: ${entry.score} pts`;
            leaderboard.appendChild(li);
        });
    } catch (error) {
        console.error("Failed to load leaderboard:", error);
    }
}

window.addEventListener("load", displayLeaderboard);
