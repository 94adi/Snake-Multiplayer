const express = require("express");
const path = require("path");
const Database = require('./database/scoreDatabase');

const app = express();
const PORT = process.env.PORT || 8080;
const db = new Database();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.static("public/game"));

app.use(express.json());

app.get("/", (req, res) => {
    res.render("homepage", { title: "Multiplayer Snake" });
});

app.get("/game", (req, res) => {
    const playerName = req.query.name || "Player";
    res.render("game", { title: "Snake Game", playerName });
});

app.get('/api/scores', (req, res) =>{
    db.getTopScores((err, scores) =>{
        if(err){
            return res.status(500).json({error: 'Database error '});
        }
        res.json(scores);
    });
});

app.post('/api/scores', (req, res) =>{
    const {player, score} = req.body;

    if(!player || (typeof score !== 'number')){
        return res.status(400).json({error: 'Invalid data' });
    }

    db.addScore(player, score, (err) =>{
        if(err){
            return res.status(500).json({error: 'Database error'});
        }

        res.json({success: true});
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});