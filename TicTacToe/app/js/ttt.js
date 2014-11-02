//allow user to enter ttt.something instead _ttt.client.something 
//(_ttt.client is only module that should communicate with client directly) 
var ttt = _ttt.ttt = (function (S, R, socket, view, logic) {
	var isSocket = false;


	/**
	 * Handle the game win situation
	 */
	function winHandler (isMyMove) {
		var winStatus,
			queryAtribute = '';

		winStatus = logic.getWinStatus();
		S.log(winStatus);

		//Display correct status based on game type and who won the game
		if (R.gameConf.gameMode === R.val.singleGame) {
			view.displayStatus(S.format(R.strings.GAME_WIN, winStatus.player), R.elClass.win);
			//Call user define win function
			if (typeof R.callbackFunc.win === 'function') {
				R.callbackFunc.win(winStatus.player);
			}	
		} else {
			if (isMyMove) {
				view.displayStatus(R.strings.YOU_WIN, R.elClass.win);
				//Call user define win function
				if(typeof R.callbackFunc.win === 'function') {
					R.callbackFunc.win(winStatus.player);
				}	
			} else {
				view.displayStatus(R.strings.YOU_LOST, R.elClass.lose);
				//Call user define win function
				if(typeof R.callbackFunc.lose === 'function') {
					R.callbackFunc.lose(winStatus.player);
				}	
			}
		}

		//in case there is win or lose we will highlight the win line
		if (winStatus.line) {
			S.log(winStatus.line);
			if(isMyMove) view.higlightWin(winStatus.line);
			else view.higlightLose(winStatus.line);
		}
	}

	/**
	 * Handle the game draw situation
	 */
	function drawHandler () {
		view.displayStatus(R.strings.GAME_DRAW, R.elClass.draw);

		//Call user define win function
		if(typeof R.callbackFunc.draw === 'function') {
			R.callbackFunc.draw();
		}
	}

	function startOnePcGame () {
		R.game = {
			player: R.val.playerX,
			boardSize: R.gameConf.boardSize,
			winStreak: R.gameConf.winStreak,
		};
		view.displayStatus(S.format(R.strings.NEXT_MOVE, R.game.player) , R.elClass.nextMove);
		isSocket = false;
		view.generateGameHtml();
	}

	return {
		
		/**
		 * Initialize the game and start to listen for the click events
		 * @param  {[Object]} userConf
		 */
		init: function (userConf) {

			//Change default configuration based on user configuration
			R.conf = S.merge(R.conf, userConf);
			
			S.log('Configuration:', R.conf);

			//initialize the socket connection
			socket.init();

			view.startEventListeners();
		},


		/**
		 * Start the new game
		 */
		newGame: function (userGameConf) {
			//change default configuration based on user configuration
			R.gameConf = S.merge(R.gameConf, userGameConf);
			
			S.log('Game configuration:', R.gameConf);

			//hide lobby view and display game view
			view.showGame();

			//One PC game
			if (R.gameConf.gameMode === R.val.singleGame) {
				startOnePcGame();
			}
			//Start multiplayer game 
			else if (R.gameConf.gameMode === R.val.vsPlayer && R.gameConf.gameAction === R.val.startGame) {
				socket.startMultiplayerGame();
				isSocket = true;
			} 
			//Join multiplayer game
			else if (R.gameConf.gameMode === R.val.vsPlayer && R.gameConf.gameAction === R.val.joinGame) {
				socket.joinMultiplayerGame(R.gameConf.gameId);
				isSocket = true;
			} else {
				alert(R.strings.NEW_GAME_ERROR);
				return false;
			}

			//Start new game in logic side
			logic.newGame();

			return true;
		},

		/**
		 * Start game response received from socket
		 */
		startGameResponseReceived: function (response) {
			var generateHtml = R.gameId ? false : true;
			if(response.success) {
				S.log('Server response:', response);
				R.game = response;
				view.startGameHandler(generateHtml); 
				logic.newGame();
			} else {
				alert(response.message);
				view.hideGame();
			}
		},

		/**
		 * Move played on the board, or move received from the opponent through socket
		 * @param  {canvas element} elem canvas element that user have played
		 */
		move: function (elem, move) {
			var row,
				column,
				player,
				moveStatus,
				myMove = false;

			//Move played by the user
			if (elem) {
				row = elem.getAttribute('data-row');
				column = elem.getAttribute('data-column');
				player = R.game.player;

				myMove = {
					opponentId: R.game.opponentId,
					row: row,
					column: column,
					player: player, 
				};
			} 
			
			//Opponent move
			else if (move) {
				row = move.row;
				column = move.column;
				player = move.player;
				elem = S.elem(S.format('[data-diagonal="{0}:{1}"]', row, column));
			}

			//process the move (server side logic)
			moveStatus = logic.move(player, row, column);

			//valid move draw it
			if(moveStatus === R.statusCode.VALID_MOVE) {
				_ttt.canvas.draw(elem, player);

				//if single player switch player
				if(R.gameConf.gameMode === R.val.singleGame) {
					view.displayStatus(S.format(R.strings.NEXT_MOVE, logic.getNextPlayer()) , R.elClass.nextMove);
					this.switchPlayer();
				}
				//push move to opponent player
				else if (myMove) {
					socket.move(myMove);
					view.displayStatus(S.format(R.strings.OPPONENT_TURN) , R.elClass.opponentMove);
				} else {
					view.displayStatus(S.format(R.strings.YOUR_TURN) , R.elClass.yourMove);
				}

			}
			//win move, draw the move and highlight it 
			else if (moveStatus === R.statusCode.WIN){
				_ttt.canvas.draw(elem, player);
				winHandler(myMove);
				if(myMove && isSocket) {
					socket.move(myMove);
				}
			} 
			//draw game or game end code
			else if (moveStatus === R.statusCode.DRAW) {
				_ttt.canvas.draw(elem, player);
				drawHandler();
				if (myMove && isSocket) {
					socket.move(myMove);	
				}
			}
		},

		/**
		 * Start new game
		 */
		restartGame: function () {
			logic.newGame();
			view.newGame();
		},

		/**
		 * User has leave the game
		 */
		exitGame: function () {
			if(R.gameConf.gameMode === R.val.vsPlayer) {
				socket.disconnect();
			} 
			view.hideGame();
			R.game = {};
		},

		/**
		 * Handler for opponent disconnect 
		 */
		onOpponentDisconnect: function () {
			alert(R.strings.OPPONENT_DISCONECTED);
			view.displayStatus(R.strings.OPPONENT_DISCONECTED, R.elClass.disconected);
			ttt.stopGame();
		},

		/**
		 * New game list is received from server
		 */
		updateOpenGames: function (openGames) {
			view.updateOpenGames(openGames);
		},

		/**
		 * This function is called after user starts new game
		 */
		waitForOpponent: function (socketId) {
			view.waitOpponentHandler();
			view.displayStatus(R.strings.GAME_ID + ' ' + socketId, R.elClass.gameId, true); //true is to append this to existing data in wrapper	
		},

		/**
		 * Get the scores form the previously played games
		 */
		getScores: function () {
			return logic.getScores();
		},

		/**
		 * Get all played moves from current game
		 */
		getPlayedMoves: function () {
			return logic.getPlayedMoves();
		},

		/**
		 * Enable or disable log messages
		 * @param  {[Boolean]} condition -  true or false condition
		 */
		enableLogMsg: function (condition) {
			S.logStatus = (condition === true) ? true : false;
		},

		registerCallbacks: function (userFunc) {
			//change default configuration based on user configuration
			R.callbackFunc = userFunc || {};
		},

		/**
		 * Disable user to play - in case opponent has disconnected
		 */
		stopGame: function () {
			R.game = {};
		},

		generateGameHtml: function () {
			view.generateGameHtml();
		},

		/**
		 * Request opponent new game
		 */
		requestNewGame: function () {
			socket.requestNewGame();
		},

		/**
		 * Change player 
		 */
		switchPlayer: function () {
			R.game.player = (R.game.player === R.val.playerX) ? R.val.playerO : R.val.playerX;
		}

	};

}(_ttt.S, _ttt.resources, _ttt.socket, _ttt.view, _ttt.logic));
