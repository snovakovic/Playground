(function () {

	var size,
		 gameIsOn,
		 ticker,
		 cssStyle,
		 speed,
		 gameWrapper, //html wrapper
		 startGameCallback,
		 newGameCallback,
		 game = [];

	var _ = self.GameOfLife = function (_newGameCallback, _startGameCallback) {
		size = 40;
		speed = 500;
		var cssSize = 100 / size + '%';
		cssStyle = "width:" + cssSize + "; height:" + cssSize;
		gameWrapper = document.getElementById("gofWrapper");
		console.log(gameWrapper);

		startGameCallback = _startGameCallback || {};
		newGameCallback = _newGameCallback || {};
	};


	_.prototype = {
		newGame: function () {
			gameIsOn = false;
			newGameCallback();
			//Get two dimensional array filled with 0
			for (var i = 0; i < size; i++) {
				game[i] = getFilledArray(0, size);
			}

			drawBoard();

			//creeate blinker
			//game[5][5] = 1;
			//game[5][6] = 1;
			//game[5][7] = 1;

			//block
			//game[10][10] = 1;
			//game[10][11] = 1;
			//game[11][10] = 1;
			//game[11][11] = 1;

			//toad
			//game[20][20] = 1;
			//game[20][21] = 1;
			//game[20][22] = 1;
			//game[21][19] = 1;
			//game[21][20] = 1;
			//game[21][21] = 1;

			//Beacon
			//game[29][30] = 1;
			//game[29][29] = 1;
			//game[30][30] = 1;
			//game[30][29] = 1;
			//game[31][31] = 1;
			//game[31][32] = 1;
			//game[32][31] = 1;
			//game[32][32] = 1;

		},

		start: function () {
			gameIsOn = true;
			startGameCallback();
			play();
		},

		onClick: function(x, y) {
			game[y][x] = game[y][x] === 0 ? 1 : 0;
			drawBoard();
		}


	}

	/* RULES:
		Any live cell with fewer than two live neighbours dies, as if caused by under-population.
		Any live cell with two or three live neighbours lives on to the next generation.
		Any live cell with more than three live neighbours dies, as if by overcrowding.
		Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
	*/
	function play() {

		if (!gameIsOn)
			return;

		var kill = [], //index of cells to kill
			raise = []; //index where new cell will be born

		//draw the board in the UI
		drawBoard();

		//Get who lives who dies
		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				var numberOfNeighbours = getNumberOfNeighbours(y, x);

				//Any live cell with fewer than two live neighbours dies, as if caused by under-population.
				if (game[y][x] === 1 && numberOfNeighbours < 2) {
					kill.push({ y: y, x: x });
				}

				//Any live cell with more than three live neighbours dies, as if by overcrowding
				if (game[y][x] === 1 && numberOfNeighbours > 3) {
					kill.push({ y: y, x: x });
				}

				//Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
				if (game[y][x] === 0 && numberOfNeighbours === 3) {
					raise.push({ y: y, x: x });
				}
			}
		}

		//Execute god wills
		kill.forEach(function(val) {
			game[val.y][val.x] = 0;
		});

		raise.forEach(function (val) {
			game[val.y][val.x] = 1;
		});

		ticker = setTimeout(function () {
			play();
		}, speed);

	}

	function getNumberOfNeighbours(y, x) {
		var neighbours = 0;
		if ( y - 1 >= 0 ) {
			if (game[y - 1][x] === 1) neighbours++;
			if ( x + 1 < size && game[y - 1][x + 1] === 1) neighbours++;
			if ( x - 1 >= 0 && game[y - 1][x - 1] === 1) neighbours++;
		}

		if (y + 1 < size) {
			if (game[y + 1][x] === 1) neighbours++;
			if (x + 1 < size && game[y + 1][x + 1] === 1) neighbours++;
			if (x - 1 >= 0 && game[y + 1][x - 1] === 1) neighbours++;
		}

		if (x + 1 < size && game[y][x + 1] === 1) neighbours++;
		if (x - 1 >= 0 && game[y][x - 1] === 1) neighbours++;

		return neighbours;
	}

	//Draw HTML
	function drawBoard() {
		var gofHtml = "";
		var cssClass;

		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				cssClass = game[y][x] === 1 ? "alive" : "";

				gofHtml += '<div class="' + cssClass + '" style="' + cssStyle + '" onClick="gof.onClick('+x+','+y+')"></div>';
			}

		}

		gameWrapper.innerHTML = gofHtml;

	};


	//Helpers fast way of filling the array with the any default value
	function getFilledArray(val, len) {
		var rv = new Array(len);
		while (--len >= 0) {
			rv[len] = val;
		}
		return rv;
	}

})();
