_ttt.view = (function (S, R) {
	var $newGameBtn = document.getElementById('ttt-new-game');

	return {
		/**
		 * Generate HTML canvas grid based on board size
		 * Inject grid into wrapper #ttt-game-wrapper
		 */
		generateGameHtml: function () {
			//append html
			var htmlToAppend = '',
				column = 1,
				row = 1,
				$gameWrapper = document.getElementById(R.elId.gameWrapper),
				canvasStyle,
				boardSize = R.game.boardSize,
				canvasWidth = $gameWrapper.offsetWidth / boardSize,
				fieldsNumber = Math.pow(boardSize, 2);

			//Get the width of hidden element
			R.conf.canvasWidth = canvasWidth;

			/*generate board HTML with corresponding coordinates based on board size*/	
			canvasStyle = S.format('width="{0}" height="{1}" style="width:{2}%"', canvasWidth, canvasWidth, 100/boardSize);	
			htmlToAppend += S.format('<canvas {0} data-row="{1}" data-column="{2}" data-diagonal="{3}"></canvas>', canvasStyle, row-1, column-1, (row-1)+':'+(column-1));
			for (var i = 1; i < fieldsNumber; i++ ) {
				row = (i % boardSize !== 0) ? row : row+1;
				column = (column % boardSize !== 0) ? column+1 : 1;

				htmlToAppend += S.format('<canvas {0} data-row="{1}" data-column="{2}" data-diagonal="{3}"></canvas>', canvasStyle, row-1, column-1, (row-1)+':'+(column-1));
			}

			htmlToAppend += '<div style="clear:both"></div>';

			$gameWrapper.innerHTML = htmlToAppend;

		},

		/**
		 * Higlight win on the board 
		 */
		higlightWin: function (line) {
			S.each(line, function(line) {
				queryAtribute = S.format('[data-diagonal="{0}"]', line);
				S.elem(queryAtribute).className = R.elClass.canvasWin;
			});
		},

		/**
		 * Higlight lose on the board
		 */
		higlightLose: function (line) {
			S.each(line, function(line) {
				queryAtribute = S.format('[data-diagonal="{0}"]', line);
				S.elem(queryAtribute).className = R.elClass.canvasLose;
			});
		},

		/**
		 * User is waiting for the opponent
		 */
		waitOpponentHandler: function () {
			this.displayStatus(R.strings.WAIT_FOR_PLAYER, R.elClass.wiat);
			this.generateGameHtml();
			//hide new game btn
			if ($newGameBtn) { $newGameBtn.style.display = 'none'; }
		},

		/**
		 * Opponent has join the game, game is started
		 */
		startGameHandler: function (generateHtml) {

			if(generateHtml) {
				this.generateGameHtml();
			}

			if (R.game.player === R.val.playerX) {
				this.displayStatus(R.strings.YOUR_TURN, R.elClass.yourMove);
			} else {
				this.displayStatus(R.strings.OPPONENT_TURN, R.elClass.opponentMove);
			}

			//hide new game btn
			if ($newGameBtn) { $newGameBtn.style.display = 'block'; }
		},

		/**
		 * Show elements with the class ttt-in-game
		 * Hide elements with class ttt-out-of-game
		 */
		showGame: function () {
			var inGame = '.' + R.elClass.inGame,
				outOfGame = '.' + R.elClass.outOfGame;

			S.S(outOfGame).each(function() {
				this.style.display = 'none';
			});
			S.S(inGame).each(function() {
				this.style.display = 'block';
			});
		},

		/**
		 * Hide elements with the class ttt-in-game
		 * Show elements with class ttt-out-of-game
		 */
		hideGame: function () {
			var inGame = '.' + R.elClass.inGame,
				outOfGame = '.' + R.elClass.outOfGame;

			S.S(outOfGame).each(function() {
				this.style.display = 'block';
			});
			S.S(inGame).each(function() {
				this.style.display = 'none';
			});
		},

		/**
		 * Clear the board, remove all drawings from canvas
		 */
		clearBoard: function () {
			var selector = '#' + R.elId.gameWrapper + ' > canvas',
				time = R.conf.boardClearTimeout,
				waitingTime = 0;

			S.S(selector).each(function () {
				var self = this;
				//kind of board clear animation
				waitingTime += time;
				setTimeout(function() {
					_ttt.canvas.clearCanvas(self);
					self.className = '';
				}, waitingTime);
			});
		},

		/**
		 * Display text status to the user
		 * @param {string} txt - text to display to the user
		 * @param {string} statusType - class that will be added to html element
		 */
		displayStatus: function (txt, statusType, append) {
			var $statusText = document.getElementById(_ttt.resources.elId.statusTxt);
			if($statusText) {
				if(append) {
					$statusText.innerHTML += S.format('<p class="{0}"> {1} </p>', statusType, txt);
				}
				else {
					$statusText.innerHTML = S.format('<p class="{0}"> {1} </p>', statusType, txt);
				}
			}
		},

		/**
		 * Update open game list
		 */
		updateOpenGames: function (openGames) {
			var $openGames = document.getElementById(R.elId.openGamesWrapper);
				gameList = '';

			if ($openGames) {
				S.log('Open games:', openGames);

				S.each(openGames, function (game) {
					gameList += S.format('<p class="ttt-open-game" data-game-id="{0}"> {1} <span class="ttt-game-size">s:{2} w:{3}</span></p>', game.id, game.id, game.boardSize, game.winStreak);
				});

				if(gameList) {
					$openGames.innerHTML = S.format('<p class="ttt-open-games-header">{0}</p>', R.strings.OPEN_GAMES_HEADER);
					$openGames.innerHTML += gameList;
				} else {
					$openGames.innerHTML = S.format('<p class="ttt-no-games">{0}</p>', R.strings.NO_OPEN_GAMES);
				}
			}
		},

		newGame: function () {

			//this.clearBoard();
			//we are generating html again, in a case if there where game resizing, so that game gets correct perspective on new game event
			//canvas is not re-sizable on resize it just zoom in or zoom out image inside
			this.generateGameHtml();

			if(R.gameConf.gameMode === R.val.singleGame) {
				R.game.player = R.val.playerX;
				view.displayStatus(S.format(R.strings.NEXT_MOVE, R.game.player) , R.elClass.nextMove);
			} else {
				ttt.switchPlayer();
				if (player === R.val.playerX) {
					view.displayStatus(R.strings.YOUR_MOVE, R.elClass.yourMove);
				} else {
					view.displayStatus(R.strings.OPPONENT_TURN, R.elClass.opponentMove);
				}
			}
		},

		/**
		 * Disable socket related inputs
		 * This method is called when there is error connecting to socket
		 */
		disableSocket: function () {
			var $gameIdInp = document.getElementById('ttt-game-id'),
				$openGamesWrapper = document.getElementById('ttt-open-games-wrapper');

			if($gameIdInp) {
				$gameIdInp.setAttribute('disabled', 'disabled');
			}
			if($openGamesWrapper) {
				$openGamesWrapper.innerHTML = R.strings.SOCKET_CONNECTION_ERROR;
			}

			S.S('input[name="gameMode"]').each(function(){
				if(this.value === R.val.vsPlayer) {
					this.setAttribute('disabled', 'disabled');
				}
			});
		},

		/**
		 * Start event listeners that will listen for user interaction
		 * btn clicks and game fields click
		 */
		startEventListeners: function () {
			
			//New game btn listener
			$restartGameBtn = document.getElementById(R.elId.newGameBtn);
			if($restartGameBtn) {
				$restartGameBtn.addEventListener('click', function () {
					S.log("Restart game btn listener");
					if(R.gameConf.gameMode === R.val.singleGame) {
						ttt.restartGame();
					} else {
						ttt.requestNewGame();
					}
				}, false);
			}

			//exit game btn listener
			$exitGameBtn = document.getElementById(R.elId.exitGameBtn);
			if($exitGameBtn) {
				$exitGameBtn.addEventListener('click', function () {
					S.log("Exit game btn listener");
					ttt.exitGame();
				}, false);
			}

			//Delegation listener for the game field click
			document.getElementById(R.elId.gameWrapper).addEventListener('click',function(e) {
				// e.target is the clicked element!
				// If it was a canvas
				S.log('click on:', e.target);
				if(e.target && e.target.nodeName == 'CANVAS') {
					S.log("Game field click listener");
					ttt.move(e.target);
				}
			});

			//Delegation listener for the new game click from the game list
			//Delegation listener for the game field click
			$openGamesWrapper = document.getElementById(R.elId.openGamesWrapper);
			if($openGamesWrapper) {
				$openGamesWrapper.addEventListener('click',function(e) {
					if(e.target && e.target.nodeName == 'P' && e.target.className === 'ttt-open-game') {
						//join the game
						var gameId = e.target.getAttribute('data-game-id');
						ttt.newGame({
							gameMode: R.val.vsPlayer,
							gameAction: R.val.joinGame,
							gameId: gameId
						});
					}
				});
			}

			//Prevent start event listener to be called more than once, we don't want to create multiply listeners for same button
			_ttt.view.startEventListeners = function () {};
		},

	};

}(_ttt.S, _ttt.resources));