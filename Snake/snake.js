(function () {

	var size,
		ticker,
		cssStyle,
		score,
		speed,
		//direction,
		snake = [],
		directionQueue = [],
		gameWrapper, //html wrapper
		game = [];

	//Game values game []
	//values : 0 -empty field
	//         1 -snake
	//         2 - food
	//         3 - obstacle

	var _ = self.Snake = function (_size, _speed) {
		size = _size || 40;
		speed = _speed || 50;
		var cssSize = 100 / size + '%';
		cssStyle = "width:" + cssSize + "; height:" + cssSize;
		gameWrapper = document.getElementById("snakeWrapper");
		console.log(gameWrapper);
	};

	//Keyboard navigation
	document.onkeydown = function (e) {
		e = e || window.event;
		switch (e.which || e.keyCode) {
			case 37: // left
				if (directionQueue[directionQueue.length - 1] != "right") directionQueue.push("left");
				//direction = direction != "right" ? "left" : direction; //snake can't go backward
				onKeybordEvent(e);
				break;

			case 38: // up
				if (directionQueue[directionQueue.length - 1] != "down") directionQueue.push("up");
				//direction = direction != "down" ? "up" : direction;
				onKeybordEvent(e);
				break;

			case 39: // right
				if (directionQueue[directionQueue.length - 1] != "left") directionQueue.push("right");
				//direction = direction != "left" ? "right" : direction;
				onKeybordEvent(e);
				break;

			case 40: // down
				if (directionQueue[directionQueue.length - 1] != "up") directionQueue.push("down");
				//direction = direction != "up" ? "down" : direction;
				onKeybordEvent(e);
				break;

			default:
				return; // exit this handler for other keys
		}
	}

	function onKeybordEvent(e) {
		if (e.preventDefault) e.preventDefault();
		//if (ticker) clearTimeout(ticker);
		//play();
	}

	_.prototype = {
		newGame: function () {

			//direction = "right";
			directionQueue.push("right");
			snake = [];
			game = [];
			score = 0;

			//Get two dimensional array filled with 0
			for (var i = 0; i < size; i++) {
				game[i] = getFilledArray(0, size);
			}


			//create 3 node snake
			var startIndex = Math.floor(size / 2);

			game[startIndex][startIndex] = 1;
			snake.push({ y: startIndex, x: startIndex });

			game[startIndex][startIndex - 1] = 1;
			snake.push({ y: startIndex, x: startIndex - 1 });

			game[startIndex][startIndex - 2] = 1;
			snake.push({ y: startIndex, x: startIndex - 2 });

			obstacleFactory();

			//start playing the game
			play();

		},

	}

	function play() {

		var start = new Date().getTime();

		//snake[0] is the head of the snake
		var oldX = snake[0].x;
		var oldY = snake[0].y;

		var direction = directionQueue.length > 1 ? directionQueue.shift() : directionQueue[0];

		//Move the head 
		switch (direction) {
			case "left":
				snake[0].x -= 1;
				break;
			case "right":
				snake[0].x += 1;
				break;
			case "up":
				snake[0].y -= 1;
				break;
			case "down":
				snake[0].y += 1;
				break;

		}

		if (isCollision(snake[0].x, snake[0].y)) {
			console.log("bad luck");
			return;
		}

		//when snake size is only 1 we need to delete last position and add new
		if (snake.length === 1) {
			game[oldY][oldX] = 0; //delete old position 
			game[snake[0].y][snake[0].x] = 1; //set new position
		}
		else {

			//Update snake position, start at 1 because head is already updated
			for (var i = 1, l = snake.length; i < l; i++) {

				//set child node to be the same as parent
				var tempX = snake[i].x;
				var tempY = snake[i].y;

				//set child node to be equal to parent node
				snake[i].x = oldX;
				snake[i].y = oldY;

				oldX = tempX;
				oldY = tempY;

			}
			
			//remove the tail in cease that the snake didn't eat the food
			if (game[snake[0].y][snake[0].x] !== 2) {
				game[oldY][oldX] = 0;
			}
			//grow snake
			else {
				snake.push({ y: oldY, x: oldX });
				score++; //score is displayed in the screen
			}

			//move the head
			game[snake[0].y][snake[0].x] = 1;
		}

		foodFactory();

		var end = new Date().getTime();
		var time = end - start;
		//console.log('Execution time: ' + time);

		//draw the board in the UI
		drawBoard();

		ticker = setTimeout(function () {
			play();
		}, speed);


		//Game has ended
		//alert("BuHU");

	}

	//This functions indicates the end of game
	function isCollision(x, y) {
		//border collision
		if (x < 0 || x >= size || y >= size || y < 0) 
			return true;

		//Collision with itself, or with obstacle
		if (game[y][x] === 1 || game[y][x] === 3)
			return true;

		//there is no collision
		return false;
	}

	//this function generates new food and remove the food with expired time 
	function foodFactory() {

		//generate food randomly with 1/10 chance
		if (Math.floor((Math.random() * 25) + 1) === 3) {

			//randomly position it on the field
			var randomX = Math.floor((Math.random() * size) );
			var randomY = Math.floor((Math.random() * size) );

			//if selected field is empty create food here
			if (game[randomY][randomX] === 0) {
				game[randomY][randomX] = 2;
			}
		}
	}

	//Create obstacles on the map, 
	function obstacleFactory() {
		var minObstacles = 3,
			maxObstacles = 10,
			numberOfObstacles,
			x,
			y,
			xModifier,
			yModifier,
			obstacleSize;

		numberOfObstacles = Math.floor((Math.random() * maxObstacles) + minObstacles);

		for (var i = 0; i < numberOfObstacles; i++) {
			obstacleSize = Math.floor((Math.random() * 6) + 1);

			x = Math.floor((Math.random() * size));
			y = Math.floor((Math.random() * size));

			for (var j = 0; j < obstacleSize; j++) {
				xModifier = Math.floor((Math.random() * 2));
				yModifier = Math.floor((Math.random() * 2));

				switch (xModifier) {
					case 0:
						x++;
						break;
					case 1:
						x--;
						break;
				}

				switch (yModifier) {
					case 0:
						y++;
						break;
					case 1:
						y--;
						break;
				}

				if (x >= 0 && x < size && y < size && y >= 0) {
					game[y][x] = 3; //obstacle
				}
			}
		}
	}

	//Draw HTML
	function drawBoard() {
		var snakeHtml = "";
		var cssClass;

		for (var y = 0; y < size; y++) {
			for (var x = 0; x < size; x++) {
				switch (game[y][x]) {
					case 0: //empty-field
						cssClass = "field";
						break;
					case 1:
						cssClass = "snake";
						break;
					case 2:
						cssClass = "food";
						break;
					case 3:
						cssClass = "obstacle";
						break;
				}

				snakeHtml += '<div class="' + cssClass + '" style="' + cssStyle + '"></div>';
			}

		}

		//insert score
		snakeHtml += '<div id="score">score: ' + score + '</div>';

		gameWrapper.innerHTML = snakeHtml;

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

var snake = new Snake();
snake.newGame();
