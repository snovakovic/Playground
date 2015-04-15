var snakesAndLadders = (function($) {
	var players = [];
		currentPlayer = 0;
		moveIsInProgress = false,
		gameIsOn = false;
 
    
    //throw dice event listener
    $("#throw-dices").click( function() {
		throwDices();
	});

	var	throwDices = function() {
		if(!gameIsOn || moveIsInProgress)
			return;

		var rand1 = Math.floor((Math.random() * 6) + 1);
		var rand2 = Math.floor((Math.random() * 6) + 1);
		var playerPlayed = currentPlayer;
		var currentPlayerPosition = players[playerPlayed].position;
		var positionUpdated = false;
		$("#dice1").html(rand1);
		$("#dice2").html(rand2);

		players[playerPlayed].position = players[playerPlayed].position + rand1 + rand2;
		if(players[playerPlayed].position > 100) {
			players[playerPlayed].position = 100;
		}

		movePlayer(players[playerPlayed], currentPlayerPosition, function () {
			//chack if position is ladder or snake
			for (var i = 0; i < snakeAndLaddersConfig.snakes.length; i++) {
		        if(snakeAndLaddersConfig.snakes[i].from == players[playerPlayed].position) {
		        	players[playerPlayed].position = snakeAndLaddersConfig.snakes[i].to;
		        	positionUpdated = true;
		        	break;
		        }
		    }

		    if(!positionUpdated) {
		    	for (var i = 0; i < snakeAndLaddersConfig.ladders.length; i++) {
			        if(snakeAndLaddersConfig.ladders[i].from == players[playerPlayed].position) {
			        	players[playerPlayed].position = snakeAndLaddersConfig.ladders[i].to;
			        	positionUpdated = true;
			        	break;
			        }
		   		}
		    }

		    //on ladder or snake move player instantly
		    if(positionUpdated) {
				movePlayer(players[playerPlayed], players[playerPlayed].position -1);
		    }


			if( players[playerPlayed].position == 100 ) {
				onWin(players[playerPlayed]);
			}

			//if it's double 6 don't change player in any other case change pl
			if (rand1 != 6 || rand2 != 6) {
				if(currentPlayer === 0)
					currentPlayer = 1;
				else
					currentPlayer = 0;
			}
			
		});


	}

	//move is done one filed by the time with timeout to create anymation effect
	var movePlayer = function(player, currentPosition, onMoveFinish) {
		moveIsInProgress = true;
		var newPosition = currentPosition + 1;

		//nothing to update
		if(newPosition > player.position ) {
			moveIsInProgress = false;
			if(onMoveFinish)
				onMoveFinish();
		}
		else {
			var $player = $('#player' + player.id);
			var $boardField = $("[data-field-number='"+ newPosition +"']");

			//first move there is no player on the board
			if( !$player.length ) {
				$boardField.append("<i class='player' id='player"+player.id+"'></i>")
			} else {
				$player.appendTo($boardField);
			}

			setTimeout( function () {
				movePlayer(player, newPosition, onMoveFinish);
			}, snakeAndLaddersConfig.moveSpeed);
		}



	}

	var onWin = function(player) {
		gameIsOn = false;
		$("#game-info").html(player.name + " has win the game!");
	}

	
	return {
		startGame: function() {
			players =	[{
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

			var htmlBoardOverlay = '';
			for (var i = 100; i > 0; i--) {
				htmlBoardOverlay += "<div class='board-field' data-field-number='" + i + "'></div>"
			};
	
			$("#board").html(htmlBoardOverlay);
		},
	}



})(jQuery);

//game configuration
var snakeAndLaddersConfig = {
	moveSpeed: 200,
	//snake configuration on the board
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