const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(express.static("public/game"));

app.get("/", (req, res) => {
    res.render("homepage", { title: "Multiplayer Snake" });
});

app.get("/game", (req, res) => {
    const playerName = req.query.name || "Player";
    res.render("game", { title: "Snake Game", playerName });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});