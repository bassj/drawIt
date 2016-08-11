var http	   = require('http'),
	express    = require('express'),
	socketio   = require('socket.io');
	GameServer = require('./gameServer.js');



const version = "0.1.33"

var app = express();

var server = http.Server(app);

var io = socketio(server);

app.set('view engine', 'ejs');

app.use('/lib', express.static(__dirname + '/static'));

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
	res.render('index', {version: version});
});

var gameServer = new GameServer(io.of('/testGame'));

server.listen(3000);