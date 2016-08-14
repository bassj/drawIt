$(document).ready(() => {
	$("#hasPassword").click(() => {
		$("#gamePassword").attr("disabled", !document.getElementById("hasPassword").checked);
	});


	$.get('/games', function (data) {
		var numRows = Math.floor(data.length / 4);

		var rows = [];

		for (var x = 0; x <= numRows; x++) {
			var row = document.createElement('div');
			row.setAttribute("class", "row");
			rows.push(row);
		}

		for (var i in data) {
			var game = data[i];

			var container = document.createElement('div');

			container.setAttribute("class", (i%5 == 0)? "col-md-2 col-md-offset-2":"col-md-2");

			var gameicon = document.createElement('div');
			var gamename = document.createElement('span');
			var gameplayers = document.createElement('span');
			var gamewords = document.createElement('span');
			var gametype = document.createElement('span');
			var gamepass = document.createElement('span');
			var joinbutton = document.createElement('button');

			gameicon.setAttribute("class", "gameicon");

			gamename.setAttribute("class", "gamename");
			gameplayers.setAttribute("class", "gameplayers");
			gamewords.setAttribute("class", "gameprop");
			gametype.setAttribute("class", "gameprop");
			gamepass.setAttribute("class", "gameprop");
			joinbutton.setAttribute("class", "btn btn-link joinbutton");

			gamename.innerText = game.name;
			gameplayers.innerText = "("+ game.players +"/"+ game.maxPlayers +")";
			gamewords.innerText = "Words: default";
			gametype.innerText = "GameType: Round-Robin";
			gamepass.innerText = "Password: " + ((game.password)? "Yes":"No");
			joinbutton.innerText = "Join Me!";

			gameicon.appendChild(gamename);
			gameicon.appendChild(gameplayers);
			gameicon.appendChild(gamewords);
			gameicon.appendChild(gametype);
			gameicon.appendChild(gamepass);
			gameicon.appendChild(joinbutton);

			container.appendChild(gameicon);

			rows[Math.floor(i / 4)].appendChild(container);
		}


		for (var row in rows) {
			document.getElementById("container").appendChild(rows[row] );
		}
	});

	if (requireName) {
		$("#setName").modal({keyboard: false, backdrop: 'static'});
	}


});