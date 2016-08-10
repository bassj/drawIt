const fs = require('fs');

var wordList = JSON.parse(fs.readFileSync(__dirname + '/words.json'));

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

		this.players = [];
		this.currentWord = randomWord();
		this.currentArtist = 0;

		this.playersInterval = setInterval((() => {
			this.broadcastPlayers();
		}).bind(this), 1000);

		this.io.on('connection', ((socket) => {
			var player = {socket: socket, drawing: false, score: 0, id: socket.id};

			socket.on('setname', (data) => {
				player.name = data.name;

				this.broadcast(data.name + " has joined.");
				if (this.players.length == 0) {
					this.reset();
					this.setDrawing(player);
				}

				this.players.push(player);
			});

			socket.on('chat', ((data) => {
				var message = data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

				if (data.message.startsWith('/guess')) {
					if (player.drawing) {
						this.whisper(socket.id, "The word is: " + this.currentWord);
					} else {
						var guess = data.message.substr(data.message.indexOf(' ')).trim();
						
						if (guess) {
							this.playerGuessed(guess, id);
						}
					}
				} else {
					this.io.emit('chat', {sender: player.name, message: message});
				}

			}).bind(this));

			socket.on('imageUpdate', ((data) => {
				if (player.drawing) {
					this.io.emit('imageUpdate', data);
				}
			}).bind(this));

			socket.on('disconnect', (() => {
				this.broadcast(player.name + " has left.");

				this.players.splice(this.players.indexOf(player), 1);

				if (player.drawing && this.players.length != 0) {
					this.reset();
					this.currentWord = randomWordNot(this.currentWord);
					this.advanceArtist();
				} else if (this.players.length = 0) {
					this.currentArtist = 0;
				}

				
				
			}).bind(this));
			
		}).bind(this));
	}

	reset() {
		this.io.emit('reset');
		this.currentWord = randomWordNot(this.currentWord);
		for (var i in this.players) {
			this.players[i].drawing = false;
		}
	}

	setDrawing(player) {
		for (var p in this.players) {
			this.players[p].drawing = false;
		}
		player.drawing = true;
		player.socket.emit('setdrawing');
		this.broadcast(player.name + " is now drawing.");
		this.whisper(player, "The word is " + this.currentWord);
		this.broadcastPlayers();
	}

	broadcast(message) {
		this.io.emit('chat', {sender: "SERVER", message: message})
	}

	whisper(player, message) {
		player.socket.emit('chat', {sender: "WHISPER", message: message});
	}

	advanceArtist() {
		this.currentWord = randomWordNot(this.currentWord);
		this.currentArtist = (this.currentArtist + 1) % this.players.length;
		this.setDrawing(this.players[this.currentArtist]);
	}

	broadcastPlayers() {
		var players = [];

		for (var p in this.players) {
			var player = {};
			player.name = this.players[p].name;
			player.score = this.players[p].score;
			player.drawing = this.players[p].drawing;

			players.push(player);
		}

		this.io.emit('players', players);
	}

	playerGuessed(word, player) {
		if (word.toLowerCase() == this.currentWord) {
			var value = 3 - this.correctGuesses;
			this.broadcast(player.name + " has guessed correctly. " + "(" + value + " points)");
			player.points += value;
			this.correctGuesses++;
			this.broadcastPlayers();
			if (this.correctGuesses == 3) {
				this.broadcast("The word was " + this.currentWord);
				this.reset();
				this.advanceArtist();
			}

		}
	}
}

module.exports = GameServer;