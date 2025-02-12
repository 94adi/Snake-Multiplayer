export async function fetchScores(){
    const response = await fetch('/api/scores');
    const scores = await response.json();
    return scores.sort((a, b) => b.score - a.score);
}

export async function submitScore(player, score){
    await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({player, score}),
    });
}