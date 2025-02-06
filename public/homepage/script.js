document.getElementById("startGame").addEventListener("click", function() {
    const playerName = document.getElementById("playerName").value.trim();
    
    if (playerName) {
        window.location.href = `/game?name=${encodeURIComponent(playerName)}`;
    } else {
        alert("Please enter your name!");
    }
});