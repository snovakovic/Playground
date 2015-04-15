var snakesAndLadders = (function () {
	var players = [],
		currentPlayer = 0,
		moveIsInProgress = false,
		gameIsOn = false;


	//throw dice event listener
	document.getElementById("throw-dices").addEventListener('click', function () {
		//if game is not active or if current move is in progress ignore throw dice click
		if (gameIsOn && !moveIsInProgress) {
			throwDices();
		}
	});

	//new game event listener
	document.getElementById("new-game").addEventListener('click', function() {
		snakesAndLadders.startGame();
	});

	//Main application logic happens after user click throw dice
	var throwDices = function () {

		//disable throw dices button until move is finished
		document.getElementById("throw-dices").disabled = true;

		//calculate two random numbers between 1-6 representing two dices
		var rand1 = Math.floor((Math.random() * 6) + 1);
		var rand2 = Math.floor((Math.random() * 6) + 1);

		//get the current player position on the board before updating position
		//this is needed because move will be animated field by field. so we need to know form whic field are we starting, 
		//and player position will be updated to new position, before move happens
		var currentPlayerPosition = players[currentPlayer].position;

		//represent dice thrown in UI
		updateDiceUi(players[currentPlayer], rand1, rand2);

		//calculate user position after dice thrown, if it's grater then 100 set it to 100
		// we can easily add support to bounce logic in here 
		players[currentPlayer].position = players[currentPlayer].position + rand1 + rand2;
		if (players[currentPlayer].position > 100) {
			players[currentPlayer].position = 100;
		}

		//Move the player to the new position
		movePlayer(players[currentPlayer], currentPlayerPosition, function () {
			//This is callback function which is called after move is done. 
			//It's because we are moving field by filed with timeout in order for user to see animation on screen

			//After move that has been updated on UI check if it lends on ladders or snake
			//If it does update to location that snake or ladders are pointing
			//this move will be done instantly without animation
			var positionUpdated = false;

			//Check if current position is snake head
			for (var i = 0; i < snakeAndLaddersConfig.snakes.length; i++) {
				if (snakeAndLaddersConfig.snakes[i].from == players[currentPlayer].position) {
					players[currentPlayer].position = snakeAndLaddersConfig.snakes[i].to;
					positionUpdated = true;
					break;
				}
			}

			//in case if it is not snake head check if it is bottom of ladders
			if (!positionUpdated) {
				for (var i = 0; i < snakeAndLaddersConfig.ladders.length; i++) {
					if (snakeAndLaddersConfig.ladders[i].from == players[currentPlayer].position) {
						players[currentPlayer].position = snakeAndLaddersConfig.ladders[i].to;
						positionUpdated = true;
						break;
					}
				}
			}

			//on ladder or snake move player instantly
			// we are passing new position -1 to the move function as current position
			// this will cause that move happens instantly on the board an not animated as a normal move
			if (positionUpdated) {
				movePlayer(players[currentPlayer], players[currentPlayer].position - 1);
			}

			//check if player has win the game
			if (players[currentPlayer].position == 100) {
				onWin(players[currentPlayer]);
			}

			//change player after move is finished
			currentPlayer = currentPlayer === 0 ? 1 : 0;

			//enable throw dices button
			document.getElementById("throw-dices").disabled = false;

			showCurrentPlayerTurn();


		});


	}

	//Update UI after dice throw to represent to user what has been thrown
	var updateDiceUi = function(player, dice1, dice2) {
		//show nice representation of thrown dices
		//this will be done by appending class to element each class has unique styling to look like a dice
		//e.g if 6 is thrown we will append class six to dice element
		document.getElementById("dice1").className = "dice " + getDiceClassFromNumber(dice1);
		document.getElementById("dice2").className = "dice " + getDiceClassFromNumber(dice2);

		//show text summarizing what have been thrown
		//document.getElementById("game-info").innerHTML = "<b>" + player.name + "</b> has thrown " + (dice1 + dice2);
	}

	//update UI to represent who is on the move
	var showCurrentPlayerTurn = function() {
		document.getElementById("current-player").innerHTML = players[currentPlayer].name + " turn.";
	}

	//based on random number get the class that represent the look of the dice
	var getDiceClassFromNumber = function (val) {
		switch (val) {
			case 1:
				return "one";
			case 2:
				return "two";
			case 3:
				return "three";
			case 4:
				return "four";
			case 5:
				return "five";
			case 6:
				return "six";
			default:
				return "";
		}
	}

	//move is done one filed by the time with timeout to create animation effect
	var movePlayer = function (player, currentPosition, onMoveFinish) {
		//indicate that current move is in progress which will disable any further dice throw until current move is done 
		moveIsInProgress = true;

		// we are moving player one filed by the time form current position to the position he has thrown. 
		var newPosition = currentPosition + 1; 

		//Player have arrived to his position, exit form recursion
		if (newPosition > player.position) {
			moveIsInProgress = false;

			//call on move finish callback so that any waiting code can continue with execution
			if (onMoveFinish)
				onMoveFinish();
		}
		else {
			//update player position on board
			var playerElem = document.getElementById( "player" + player.id );
			var boardFieldElem = document.getElementById("field" + newPosition);

			//special case on first move when there is no player on the board, 
			// add player to board
			if (!playerElem) {
				boardFieldElem.innerHTML += "<i class='player' id='player" + player.id + "'></i>";
			} else {
				//move player form one filed on board to another
				var playerHtml = playerElem.outerHTML;

				//remove player form current field
				playerElem.parentNode.removeChild(playerElem);

				//append player to new field
				boardFieldElem.innerHTML += playerHtml;
			}

			//wait some time specified in configuration to create animation effect and call itself to process next move
			//by increasing waiting time piece moving will appear slower on UI
			setTimeout(function () {
				movePlayer(player, newPosition, onMoveFinish);
			}, snakeAndLaddersConfig.moveSpeed);
		}


	}

	var onWin = function (player) {
		gameIsOn = false;
		document.getElementById("game-info").innerHTML = "<h3>" + player.name + " wins!!!!</h3>";
		document.getElementById("throw-dices").disabled = true;
	}


	return {
		startGame: function () {
			//set initial players value on game start. Players positions are set to 0
			players = [{
				id: 0,
				name: 'First player',
				position: 0
			},
			{
				id: 1,
				name: 'Second player',
				position: 0
			}];

			currentPlayer = 0;
			gameIsOn = true;

			//generate board overlay in where all action will happen
			//each field will be indicated with the id = field{number-of-field} eg id='field33'

			var htmlBoardOverlay = '';
			for (var i = 100; i > 0; i--) {
				htmlBoardOverlay += "<div class='board-field' id='field" + i + "'></div>";
			};

			document.getElementById("board").innerHTML = htmlBoardOverlay;

			//enable throw dices button
			document.getElementById("throw-dices").disabled = false;

			showCurrentPlayerTurn();
		},
	}



})();

//game configuration
var snakeAndLaddersConfig = {
	moveSpeed: 200,

	//snake configuration on the board
	// this reflect snakes on the board ( need to be same as on image in order to work correctly)
	// we can support different images by changing just this configuration
	snakes: [
		{
			from: 99,
			to: 69
		},
		{
			from: 91,
			to: 61
		},
		{
			from: 87,
			to: 57
		},
		{
			from: 65,
			to: 52
		},
		{
			from: 47,
			to: 19
		},
		{
			from: 34,
			to: 1
		},
		{
			from: 25,
			to: 5
		},
	],

	//ladders configuration on the board
	//this reflects ladders on the board (on board image)
	ladders: [
		{
			from: 3,
			to: 51
		},
		{
			from: 6,
			to: 27
		},
		{
			from: 20,
			to: 70
		},
		{
			from: 36,
			to: 55
		},
		{
			from: 68,
			to: 98
		},
		{
			from: 63,
			to: 95
		},
	],
}