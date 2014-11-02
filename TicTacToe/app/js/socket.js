/**
 * Handle All socket communication with opponent player
 * @param  {Module} S helper selector
 * @param  {Object} R ttt resources object
 */
_ttt.socket = (function (S, R) {
	var socket, //holds socket object
		socketId; //id of the current socket connection

	/**
	 * Start game after socket reconnect
	 */
	function startGame () {
		var isPublic = R.gameConf.gameType === R.val.publicGame ? true : false;

		R.game = {
			id:socketId, //Need to allow creating of multi games
			isOpen: true, //By default game is open until someone joins game
			isPublic: isPublic,
			boardSize: R.gameConf.boardSize,
			winStreak: R.gameConf.winStreak
		};
		
		socket.emit('start-game', R.game);

		ttt.waitForOpponent(socketId);
	}
	
	/**
	 * Socket listeners
	 */
	function socketHandler () {

		/**
		 * when user is connected to socket set the socketId module variable
		 * and made request to get the list of all opened games
		 */
		socket.on('connect', function () {
			socketId = this.socket.sessionid;
			S.log('Connected to socket, socket id: ' + socketId);

			//request open games 
			socket.emit('open-games-request');
		});

		/**
		 * Auto reconnect the user after disconnect
		 */
		socket.on('disconnect', function () {
			this.socket.connect();
		});

		/**
		 * Reconnect listener (there is difference between reconnect and connect event)
		 * Reconnect event is used for starting new game. 
		 * every time user start new game we need new socket id as it's the id of the game. Each started new game should be unique
		 */
		socket.on('reconnect', function () { 
			socketId = this.socket.sessionid;
			startGame();
			S.log('socket reconnected');

			//request open games
			socket.emit('open-games-request');
		});
		
		/**
		 * Start game response is received, start the game
		 */
		socket.on('start-game', function (response) {
			ttt.startGameResponseReceived(response);
		});

		/**
		 * The move from opponent is received
		 */
		socket.on('opponent-move', function (opponentMove) {
			S.log('Opponent move:' + opponentMove);
			ttt.move(null, opponentMove);
		});

		/**
		 * New game request is received from opponent, prompt user with the confirm dialog
		 * send user respond to the opponent.
		 * In case response is true start new game
		 */
		socket.on('new-game-request', function () {
			if (confirm(R.strings.NEW_GAME_REQUEST)) {
				socket.emit('new-game-response', true, R.game.opponentId);
				ttt.restartGame();
			} else {
				socket.emit('new-game-response', false, R.game.opponentId);
			}
		});

		/**
		 * Response to the new game request is received
		 * If response is positive start the new game
		 * else prompt the user that response is negativ
		 */
		socket.on('new-game-response', function (response) {
			//new game accepted
			if(response) {
				ttt.restartGame();
			} else {
				alert(R.strings.REQUEST_REJECTED);
			}
		});

		/**
		 * New list of currently opened games is received from socket
		 */
		socket.on('open-games-list', function (openGames) {
			ttt.updateOpenGames(openGames);
		});

		/**
		 * Socket disconnect event is received
		 * Check if this is our opponent if it is stop the game and prompt the user 
		 */
		socket.on('socket-disconnect', function (socketId) {
			S.log('socket disconnect with id:' + socketId);
			if(socketId === R.game.opponentId) {
				ttt.onOpponentDisconnect();
			}
		});

		//prevent this function to be called more than once
		socketHandler = function () {};
	}

	return {
		
		/**
		 * Connect to socket.io
		 */
		init: function () {
			if(socket) return false;

			try {
				socket = io.connect(R.socketUrl);
				socketHandler();
			} catch (err) {
				S.log(err);
				_ttt.view.disableSocket();
			}
			
		},

		/**
		 * Disconnect socket when you navigate back from game
		 * We don't want to receive messages form our opponent any more
		 */
		disconnect: function () {
			if(socket) {
				socket.disconnect();
				socketId = null;
				S.log('socket is disconnected');
			}
		},

		/**
		 * Start game will be called from reconnect listener
		 */
		startMultiplayerGame: function () {
			if(socket && !socketId) {
				socket.socket.reconnect();
			} else {
				startGame();
			}
		},

		/**
		 * Send request to join game 
		 * start-game listener is responsible for handling response from server (socket)
		 */
		joinMultiplayerGame: function(gameId) {
			if(socket) {
				socket.emit('join-game', gameId);
			}
		},

		/**
		 * Send request for new game to the opponent
		 */
		requestNewGame: function () {
			if (socket && R.game.opponentId) {
				S.log('new-game request opponent: ' + R.game.opponentId);
				socket.emit('new-game-request', R.game.opponentId);
				view.displayStatus(R.strings.WAIT_FOR_REPLY, R.game.player, 'ttt-wait');
			}
		},

		/**
		 * Request the array of all open public games currently available
		 */
		requestOpeneGames: function () {
			socket.emit('open-games-request');
		},

		/**
		 * Emit user move to the opponent
		 */
		move: function(move) {
			socket.emit('move', move);
		},
	};
	
}(_ttt.S, _ttt.resources));