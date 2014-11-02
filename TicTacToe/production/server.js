var port = 99,
    express = require('express'),
    app = express(),
    server = require('http').createServer(app), 
    io = require('socket.io').listen(server);


/**********
Server configuration
***********/

//Serve static files like css and js and images
app.use(express.static(__dirname, '/'));

//router with only one route
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

//listen at the port 99
server.listen(port);

console.info('Server started and listening at the port ' + port);


/**********
socket communication
***********/

//holds list of available games, should probably be moved to db
var games = [];

/*Socket is connected*/
io.sockets.on('connection', function (socket) {

    socket.on('start-game', function (game) {
        /*console.log('game created:' + game.id);
        console.log(game);*/

        //Push the new created game to the list of games
        games.push(game);

        //Emit list of available games to all listening sockets
        emitOpenGames(io.sockets);
    });

    /**
     * User request to join the game
     * Check if exist, and if game exist send start game directives 
     * to user who started this game and to the user who requested to join the game
     * @param  {[String]} gameId Id of the game he wants to join
     */
    socket.on('join-game', function (gameId) {
        var gameIsAvialable = false;
        
        console.log('join-game');
        //loop through each game
        for(var i = 0, l = games.length; i < l ; i++) {
            if(games[i] && games[i].id == gameId) {
                console.log('game founded');
                if(games[i].isOpen) {
                    games[i].isOpen = false;
                    console.log('game is available');

                    //random number 1 or 2
                    var rand = Math.floor(Math.random() * 2) + 1,
                        firstPlayer = (rand === 1) ? 'X' : 'O',
                        secondPLayer = (firstPlayer === 'X') ? 'O' : 'X',
                        game;

                    game = {
                        success: true,
                        gameId: gameId,
                        boardSize: games[i].boardSize,
                        winStreak: games[i].winStreak,
                        player: secondPLayer,
                        opponentId: gameId,
                    };

                    //player joining the game
                    socket.emit('start-game', game);

                    //player that started the game
                    game.player = firstPlayer;
                    game.opponentId = socket.id;
                    io.sockets.socket(gameId).emit('start-game', game);

                    emitOpenGames(io.sockets);

                } else {
                    socket.emit('start-game', {
                        success: false,
                        message: 'Game is closed!'
                    });
                }  
                gameIsAvialable = true;
                break; 
            }
        }

        if(!gameIsAvialable) {
            socket.emit('start-game', {
                success: false,
                message: 'Can\'t connect to the game'
            });
        }
    });
    
    /**
     * Forward player move to the opponent player
     * @param  {[Object]} move player move
     */
    socket.on('move', function (move) {
        //console.log(move);
        io.sockets.socket(move.opponentId).emit('opponent-move', move);
    });

    /**
     * Forward new game request to the opponent player
     * @param  {[string]} opponentId Id of opponent socket
     */
    socket.on('new-game-request', function(opponentId) {
        io.sockets.socket(opponentId).emit('new-game-request');
    });

    /**
     * Forward new game response from the opponent to the player who requested new game
     * @param  {[Boolean]} condition  true - opponent have accepted new game request
     * @param  {[type]} opponentId Id of opponent socket
     */
    socket.on('new-game-response', function(condition, opponentId) {
        io.sockets.socket(opponentId).emit('new-game-response', condition);
    });

    /**
     * User has request array of all currently opened games
     * emit all opened games to the socket which made this request
     */
    socket.on('open-games-request', function(opponentId) {
        emitOpenGames(socket);
    });

    /**
     * Handler for socket disconnect
     * emit to all sockets id of disconnected socket (they can then check if it's their opponent and handle that)
     * In case that this user has start the game remove game form games array
     */
    socket.on('disconnect', function () {
        var socketId = socket.id;

        io.sockets.emit('socket-disconnect', socketId);
        console.log('socket disconnected' + socketId); 
        
        /**
         * Remove game with id of disconnected socket
         * this game exist only if player who started the game has disconnected
         */
        for(var i = 0, l = games.length; i < l ; i++) {
            if(games[i] && games[i].id == socketId) {
                games.splice(i, 1);
            }
        }

        emitOpenGames(io.sockets);
    });

    /**
     * Emit list of all opened games that are public
     * @param  {[Object]} sockets to which we will emit the list
     */
    function emitOpenGames (sockets) {
        //clean all games that are not active
        games = games.filter( function (game) {
            return io.sockets.sockets[game.id];
        });

        //emit list of all opened games that are public
        sockets.emit('open-games-list', games.filter( function (game) { return game.isOpen && game.isPublic; } ));
    }

    /**
     * Handle all uncaughtException in the code
     */
    process.on('uncaughtException', function (err) {
      console.log(err.stack);
    });

});