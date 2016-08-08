const wordList = [
	"nigger",
	"football",
	"basketball",
	"hampster",
	"deer",
	"star",
	"gun",
	"landon",
	"casey",
	"konrad",
	"mail",
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

		this.io.on('connection', ((socket) => {
			this.players[socket.id] = {socket: socket};
			

			socket.on('setname', (data) => {
				this.players[socket.id].name = data.name;

				if (this.currentPlayers == 0) {
					this.io.emit('reset');
					socket.emit('setdrawing', {word: this.currentWord});
					socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
					this.currentDrawer = socket.id;
				}

				this.currentPlayers++;
			});

			socket.on('chat', ((data) => {
				var message = data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				this.io.emit('chat', {sender: this.players[socket.id].name, message: message});

				if (data.message.startsWith('/guess')) {
					if (this.currentDrawer == socket.id) {
						socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
					} else {
							var guess = data.message.substr(data.message.indexOf(' '));
							console.log(this.players[socket.id].name + " guessed " + guess);
							if (guess) {
								if (guess.toLowerCase() == this.currentWord) {
								this.io.emit('chat', {sender: 'SERVER', message: this.players[socket.id].name + " has guessed correctly."});
								this.io.emit('reset');
								this.currentWord = randomWordNot(this.currentWord);
								socket.emit('setdrawing', {word: this.currentWord});
								socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
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
				console.log(this.players[socket.id].name + " has left.");
				this.players[socket.id] = undefined;
				this.currentPlayers--;

				if (socket.id == this.currentDrawer && this.currentPlayers != 0) {
					this.io.emit('reset');
					this.currentWord = randomWordNot(this.currentWord);
					this.players[0].socket.emit('setdrawing', {word: this.currentWord});
					this.players[0].socket.emit('chat', {sender: "WHISPER", message: "The word is: " + this.currentWord});
					this.currentDrawer = this.players[0].socket.id;
				} else if (this.currentPlayers == 0) {
					this.currentDrawer = null;
				}

				
				
			}).bind(this));
			
		}).bind(this));
	}
}

module.exports = GameServer;