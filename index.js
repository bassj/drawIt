var http	   = require('http'),
	express    = require('express'),
	socketio   = require('socket.io');
	GameServer = require('./gameServer.js');



const version = "0.1.30"

var app = express();

var server = http.Server(app);

var io = socketio(server);

app.set('view engine', 'ejs');

app.use('/lib', express.static(__dirname + '/lib'));

app.get('/', (req, res) => {
	res.render('index', {version: version});
});

var gameServer = new GameServer(io.of('/testGame'));

server.listen(3000);