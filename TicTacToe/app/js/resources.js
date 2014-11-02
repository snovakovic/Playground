_ttt.resources = {
	socketUrl: 'http://localhost',
	//Values that will be used for compeering
	val: {
		playerX: 'X',
		playerO: 'O',
		startGame: 'start',
		joinGame: 'join',
		vsPlayer: 'vs-player',
		singleGame: 'single',
		publicGame: 'public'
	},
	//Holds current game settings
	game: {
		gameId: null,
		player: null,
		opponentId: null, //socketId
		boardSize: null, //size of the board for this game
		winStreak: null
	},
	//Canvas related configuration
	conf: {
		lineWidth: 4, 
		offset: 10, // distance from the corners of canvas
		strokeStyle: "#ad2323", //#hexadecimal color
		shadowOffsetX: 0,
		shadowOffsetY: 0,
		shadowBlur: 10,
		shadowColor: '#656565',
		animationSpeed: 10, //Speed of animation
		boardClearTimeout: 5, //delay in ms for clearing next board field
		canvasWidth: null, //Will be set after we generate HTML
	},
	gameConf: {
		boardSize: 3, //number of fields
		winStreak: 3,
		gameMode: 'single', //single or vs-player
		gameAction: 'start', // start or join in case of vs-player game mode
		gameType: 'public',
	},
	statusCode: {
		INVALID_MOVE: 0,
		INVALID_PLAYER: 1,
		VALID_MOVE: 2,
		WIN: 3,
		DRAW: 4,
		GAME_END: 5
	},
	strings: {
		GAME_WIN: 'Player {0} won the game!',
		GAME_DRAW: 'The game is draw.',
		YOU_LOST: 'You lost the game :(',
		YOU_WIN: 'You win the game :)',
		NEXT_MOVE: 'Player {0} is next.',
		WAIT_FOR_PLAYER: 'Wait for your opponent to join!',
		GAME_ID: 'Game Id:',
		YOUR_TURN: 'Your turn, play',
		OPPONENT_TURN: 'Opponent turn, please wait.',
		WAIT_FOR_REPLY: 'Wait for opponent reply',
		NEW_GAME_REQUEST: 'Your opponent request a new game.',
		REQUEST_REJECTED: 'Opponent has rejected your request',
		OPPONENT_DISCONECTED: 'Opponent has disconnected from game!',
		OPEN_GAMES_HEADER: 'Click on game to join',
		NO_OPEN_GAMES: 'There is no public games',
		NEW_GAME_ERROR: 'Game configuration is not correct',
		SOCKET_CONNECTION_ERROR: '<p class="text-danger"> Problem connecting to socket! </p>'
	},
	elId: {
		gameWrapper: 'ttt-game-wrapper',
		openGamesWrapper: 'ttt-open-games-wrapper',
		exitGameBtn: 'ttt-exit-game',
		statusTxt: 'ttt-status-text',
		newGameBtn: 'ttt-new-game'
	},
	elClass: {
		canvasWin: 'ttt-win',
		canvasLose: 'ttt-lose',
		win: 'ttt-win alert alert-success',
		draw: 'ttt-draw',
		lose: 'ttt-lose alert alert-danger',
		nextMove: 'ttt-next-move alert alert-info',
		opponentMove: 'ttt-opponent-move alert alert-warning',
		yourMove: 'ttt-your-move alert alert-info',
		disconnected: 'ttt-disconnected-opponent',
		wiat: 'ttt-wait-for-player alert alert-danger',
		gameId: 'ttt-game-id alert alert-info',
		outOfGame: 'ttt-out-of-game',
		inGame: 'ttt-in-game'
	},
	//user can register it's own functions to be called for handling some events
	callbackFunc: {
		win: null,
		lose: null,
		draw: null,
	}
};