var gameCanvas, gameContext;

$(document).ready(function () {
	gameCanvas  = document.getElementById('gameCanvas');
	gameContext = gameCanvas.getContext('2d');

	var drawCanvas = document.createElement('canvas');
	drawCanvas.setAttribute('width', gameCanvas.width);
	drawCanvas.setAttribute('height', gameCanvas.height);
	var drawContext = drawCanvas.getContext('2d');

	var mouseX, mouseY;
	var lastX, lastY;

	var isDrawing = false;
	var mouseDown = false;

	var cursor = {color: '#000000', size: 10};

	var updateInterval;

	var gameServer = io.connect("/testGame");
	
	var drawFunc = function () {
		if (isDrawing) {
			cursor.color = $("#drawColor")[0].style['background-color'];
			cursor.size = $("#cursorSize").val();
			if (mouseDown) {
				drawContext.strokeStyle = cursor.color;
				drawContext.lineWidth = cursor.size;
				drawContext.beginPath();
				drawContext.moveTo(lastX, lastY);
				drawContext.lineTo(mouseX, mouseY);
				drawContext.stroke();
				lastX = mouseX;
				lastY = mouseY;
			}
			gameContext.drawImage(drawCanvas, 0, 0);
			
			window.requestAnimationFrame(drawFunc);
		}
	}

	gameServer.on('players', (players) => {
		$("#playerList").empty();

		for (var i in players) {
			var player = players[i];

			var playerElement = document.createElement('li');
			console.log(player);
			if (player.drawing) {
				playerElement.class = "list-group-item active";
			} else {
				playerElement.class = "list-group-item";
			}

			var playerScore = document.createElement('strong');
			playerScore.style = "float:right;";
			playerScore.innerText = "Score: " + player.score;

			playerElement.innerText = player.name;
			playerElement.appendChild(playerScore);

			$("#playerList")[0].appendChild(playerElement);
			
		}
	});

	gameServer.on('connect', () => {
		var name;

		do {
			name = prompt("Please enter a name");
		} while (!name);

		gameServer.emit('setname', {name:name});
	});

	gameServer.on('reset', () => {
		isDrawing = false;
		mouseDown = false;
		drawContext.fillStyle = "white"
		drawContext.fillRect(0, 0, 800, 600);
		gameContext.clearRect(0, 0, 800, 600);
		$("#guess").prop("disabled", false);
		if (updateInterval) {
			clearInterval(updateInterval);
			updateInterval = null;
		}
	});

	gameServer.on('alert', (data) => {
		alert(data.text);
	});

	gameServer.on('setdrawing', (data) => {
		isDrawing = true;
		$("#guess").prop("disabled", true);
		updateInterval = setInterval(() => {
			gameServer.emit('imageUpdate', {imgString: drawCanvas.toDataURL()});
		}, 250);

		window.requestAnimationFrame(drawFunc);
	});

	gameServer.on('chat', (data) => {
		var span = document.createElement('span');
		var name = document.createElement('strong');
		name.innerText = data.sender + ":";
		name.style = "display: inline;"
		var message = document.createElement('p');

		message.style = "display: inline;"
		message.innerText = data.message;

		var newline = document.createElement('br');

		span.appendChild(name);
		span.appendChild(message);
		span.appendChild(newline);


		var chatbox = document.getElementById('chatbox');
		chatbox.appendChild(span);

		chatbox.scrollTop = chatbox.scrollHeight;
	});

	gameServer.on('imageUpdate', (data) => {
		if (!isDrawing) {

			var img = new Image();
			img.src = data.imgString;

			gameContext.clearRect(0, 0, 800, 600);
			gameContext.drawImage(img, 0, 0);
		}
	});

	$("#chatText").keydown(function (e) {
		if (e.which == 13) {
			gameServer.emit('chat', {message: $(this).val()});
			$(this).val('');
		}
	});

	$("#submitButton").click(function () {
		gameServer.emit('chat', {message: $("#chatText").val()});
			$("#chatText").val('');
	});

	$("#clear").mousedown(() => {
		drawContext.fillStyle = "white"
		drawContext.fillRect(0, 0, 800, 600);
	});

	$("#guess").click(() => {
		var guess = prompt('What is your guess for the word?');
		if (guess) {
			gameServer.emit('guessWord', {word: guess}, (correct) => {
				if (!correct) {
					alert("That's not correct, sorry landon.");
				}
			});
		}
	});


	/*Client side canvas updates*/

	$("#gameCanvas")
	.mousedown((e) => {
		if (e.which == 1 && isDrawing) {
			mouseDown = true;
			lastX = e.offsetX;
			lastY = e.offsetY;
		}
	})
	.mouseup((e) => {
		if (e.which == 1) {
			mouseDown = false;
		}
	})
	.mousemove((e) => {
		mouseX = e.offsetX;
		mouseY = e.offsetY;
		
	});

	$(document).mouseup((e) => {
		if (e.which == 1) {
			mouseDown = false;
		}
	})
	

});