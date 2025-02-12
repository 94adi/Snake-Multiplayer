const sqlite3 = require('sqlite3').verbose();

class Database{
    constructor(dbFile = 'scores.db'){
        this.db = new sqlite3.Database(dbFile, (err) => {
            if(err){
                console.log("Database connection error:", err);
            }
        });
        this.initialize();
    }

    initialize(){
        this.db.run(`
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player TEXT NOT NULL,
                score INTEGER NOT NULL
            )
        `);
    }

    addScore(player, score, callback){
        this.db.run("INSERT INTO scores (player, score) VALUES (?, ?)", [player, score], 
            (err) =>{
                if(err){
                    return callback(err);
                }

                this.db.run(`                
                    DELETE FROM scores 
                    WHERE id NOT IN (SELECT id FROM scores ORDER BY score DESC LIMIT 10)`, callback );
        });
    }

    getTopScores(callback){
        this.db.all("SELECT player, score FROM scores ORDER BY score DESC LIMIT 10", callback);
    }

    close(){
        this.db.close();
    }
}

module.exports = Database;