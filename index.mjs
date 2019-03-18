import http from 'http';
import express from 'express';
import bodyparser from 'body-parser';
import next from 'next';
import config from './config.json';



const app = express();
const server = http.Server(app);

const dev = process.env.NODE_ENV !== 'production';

const nextApp = next({dev});

const gameList = [
];

for (let x = 0; x < 10; x++) {
    gameList.push({
        name: "Test Game",
        players: 2,
        maxPlayers: 5,
        password: true
    });
}

app.use(bodyparser.json());

nextApp.prepare().then(() => {
    app.get('/gamelist', (req, res) => {
        res.json(gameList);
    });

    app.post('/creategame', (req, res) => {

        console.log(req.body);

        res.json({test: "test"});
    });

    app.get('*', (req, res) => {
        return nextApp.getRequestHandler()(req, res);
    });

    app.listen(config.port, (err) => {
        if (err) throw err;
        console.log("Listening on port 3000");
    });
});