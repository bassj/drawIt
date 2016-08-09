const wordList = [
	"nigger",
	"football",
	"basketball",
	"asshole",
	"deer",
	"star",
	"gun",
	"landon",
	"casey",
	"konrad",
	"mail",
	"people",
	"history",
	"world",
	"computer",
	"food",
	"police",
	"bird",
	"power",
	"television",
	"cunt",
	"dick",
	"duck",
	"faggot",
	"csgo",
	"joe",
	"atlas",
	"youtube",
	"skyscraper",
	"fan",
	"google",
	"website",
	"penis",
	"semen",
	"boat",
	"waffle",
	"bizon",
	"autoshotty",
	"kfc",
	"slimchickens",
	"lucas",
	"hail",
	"nazi",
	"suprise",
	"bait",
	"harambe",
	"house",
	"tree",
	"family",
	"lynch",
	"micropenis",
	"soccer",
	"glock",
	"mad",
	"rage",
	"truck",
	"bucket",
	"tractor",
	"mipper10",
	"dust2",
	"mirage",
	"dinner",
	"dessert",
	"desert",
	"bus",
	"anomaly",
	"gambling",
	"soup",
	"office",
	"cigarrette",
	"newspaper",
	"magazine",
	"phone",
	"lake",
	"customer",
	"blood",
	"city",
	"photo",
	"depression",
	"imgaination",
	"attitude",
]

function randomWord() {
	return wordList[Math.floor(Math.random() * wordList.length)];
}

function randomWordNot(word) {
	var selectedWord;

	do {
		selectedWord = wordList[Math.round(Math.random() * wordList.length)];
	} while (selectedWord == word);
	
	return selectedWord;
}

class GameServer {
	constructor(io) {
		this.io = io;

		this.players = {};
		this.currentDrawer = null;
		this.currentWord = randomWord();
		this.currentPlayers = 0;

		this.playersInterval = setInterval((() => {
			this.io.emit('players', this.players);
		}).bind(this), 1000);

		this.io.on('connection', ((socket) => {
			this.players[socket.id] = {score: 0, drawing: false};
			

			socket.on('setname', (data) => {
				this.players[socket.id].name = data.name;

				this.io.emit('chat', {sender:"SERVER", message: data.name + " has joined."});

				if (this.currentPlayers == 0) {
					this.reset();
					socket.emit('setdrawing', {word: this.currentWord});
					socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
					this.currentDrawer = socket.id;
					this.players[socket.id].drawing = true;
				}

				this.currentPlayers++;
			});

			socket.on('chat', ((data) => {
				var message = data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				this.io.emit('chat', {sender: this.players[socket.id].name, message: message});

				if (data.message.toLowerCase() == this.currentWord) {
					this.io.emit('chat', {sender: 'SERVER', message: this.players[socket.id].name + " has guessed correctly."});
					this.reset();
					this.currentWord = randomWordNot(this.currentWord);
					this.players[socket.id].score++;
					socket.emit('setdrawing', {word: this.currentWord});
					socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
					this.players[socket.id].drawing = true;
					this.currentDrawer = socket.id;
				}

				if (data.message.startsWith('/guess')) {
					if (this.currentDrawer == socket.id) {
						socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
					} else {
							var guess = data.message.substr(data.message.indexOf(' ')).trim();
							console.log(this.players[socket.id].name + " guessed " + guess);
							if (guess) {
								if (guess.toLowerCase() == this.currentWord) {
									this.io.emit('chat', {sender: 'SERVER', message: this.players[socket.id].name + " has guessed correctly."});
									this.players[socket.id].score++;
									this.reset();
									this.io.emit('players', this.players);
									this.currentWord = randomWordNot(this.currentWord);
									socket.emit('setdrawing', {word: this.currentWord});
									socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
									this.players[socket.id].drawing = true;
									this.currentDrawer = socket.id;
							} else {
								this.io.emit('chat', {sender: "SERVER", message: "That is incorrect."});
							}
						}
						
					}
					
					
				}

			}).bind(this));

			socket.on('imageUpdate', ((data) => {
				if (socket.id == this.currentDrawer) {
					this.io.emit('imageUpdate', data);
				}
			}).bind(this));

			socket.on('disconnect', (() => {
				this.io.emit('chat', {sender: "SERVER", message: this.players[socket.id].name + " has left."});
				this.players[socket.id] = undefined;
				this.currentPlayers--;

				if (socket.id == this.currentDrawer && this.currentPlayers != 0) {
					this.reset();
					this.currentWord = randomWordNot(this.currentWord);
					//this.players[0].socket.emit('setdrawing', {word: this.currentWord});
					//this.players[0].socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
					//this.currentDrawer = this.players[0].socket.id;
				} else if (this.currentPlayers == 0) {
					this.currentDrawer = null;
				}

				
				
			}).bind(this));
			
		}).bind(this));
	}

	reset() {
		for (var i in this.players) {
			console.log(i);
			this.players[i].drawing = false;
			this.currentDrawer = null;
			this.io.emit('reset');
		}
	}
}

module.exports = GameServer;