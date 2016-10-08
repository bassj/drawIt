const fs		 = require('fs'),
	  http	     = require('http'),
	  express    = require('express'),
	  socketio   = require('socket.io'),
	  bodyParser = require('body-parser'),
	  crypto     = require('crypto'),
	  session    = require('express-session'),
	  GameServer = require('./gameServer.js');


const version = "0.2.02"

const app = express();

const server = http.Server(app);

const io = socketio(server);


function hash(string) {
	var sha = crypto.createHash('md5');
	sha.update(string);
	return sha.digest('hex');
}


const gameServers = {};

const sessionMiddleware = session({
	secret: fs.readFileSync('secret').toString(), //CHANGE THE CONTENTS OF THIS FILE IF YOU'RE DEPLOYING TO THE PUBLIC
	resave: true,
	saveUninitialized: true, 
});

app.set('view engine', 'ejs');

app.use('/lib', express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(sessionMiddleware);

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.get('/jscolor', (req, res) => {
	res.sendFile(__dirname + '/lib/jscolor/jscolor.min.js');
});

app.get('/jquery', (req, res) => {
	res.sendFile(__dirname + '/lib/jquery/dist/jquery.min.js');
});

app.get('/bootstrapjs', (req, res) => {
	res.sendFile(__dirname + '/lib/bootstrap/dist/js/bootstrap.min.js');
});

app.get('/bootstrapcss', (req, res) => {
	res.sendFile(__dirname + '/lib/bootstrap/dist/css/bootstrap.min.css');
});

app.get('/', (req, res) => {
	if (!req.session.name) {
		res.render('menu', {version: version, name: true});
	} else {
		res.render('menu', {version: version, name: false});
	}
});

app.get('/game', (req, res) => {

	if (!req.query.id || !req.session.name) {
		res.redirect('/');
		return;
	}

	if (req.query.pass) {
		res.render('game', {version: version, serverId: req.query.id, serverPass: req.query.pass});
	} else {
		res.render('game', {version: version, serverId: req.query.id});
	}

	
});

app.get('/games', (req, res) => {
	const games = [];

	for (let key in gameServers) {
		if (gameServers.hasOwnProperty(key)) {
			const game = {};
			game.name = gameServers[key].name;
			game.password = (gameServers[key].password != null);
			game.maxPlayers = gameServers[key].maxPlayers;
			game.players = gameServers[key].players.length;
			game.id = key;
			games.push(game);
		}
	}

	res.send(games);
});

app.post('/creategame', (req, res) => {	
	var id = hash(req.body.gameName);

	if (!gameServers[id]) {
		gameServers[id] = new GameServer(io, req.body.gameName, req.body.gamePassword, req.body.gamePlayers, id);
		res.redirect(`/game?id=${id}&pass=${req.body.gamePassword}`);
	} else {
		res.send("Failed to create game server, a server with that name already exists.");
	}
	

});

app.post('/setname', (req, res) => {
	req.session.name = req.body.name;
	req.session.save(function (err) {
		res.redirect("/");
	});
	
});

server.listen(3000);