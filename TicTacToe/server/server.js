var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')

app.listen(99);

var games = [];

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
});
}

io.sockets.on('connection', function (socket) {

    socket.on('msg', function (msg) {
        //Received ony by the socket that send this will receive this
        socket.emit('msg', "you>"+msg);

        socket.broadcast.emit('msg', "ano>"+msg);
        console.log("msg sended");
    });

  socket.on('start-game', function () {
    var game = {
            id:socket.id, //Need to allow creating of multy games
            isOpen: true, //By defoult game is open until someone joins game
        }

        console.log("game created");
        console.log(game);
        games.push(game);

        socket.emit('game-started', socket.id);
    });

    socket.on('join-game', function (gameId) {
        var isGame = false;
        for(var i = 0, l = games.length; i < l ; i++) {
            if(games[i].id == gameId) {
                console.log("game founded");
                if(games[i].isOpen) {
                    games[i].isOpen = false;
                    console.log("game is available");
                    socket.emit('game-joined', gameId);
                    io.sockets.socket(gameId).emit('opointment-id', socket.id);
                } else {
                    socket.emit('game-is-closed');
                }  
                isGame = true;
                break; 
            }
        }

        if(!isGame) {
            socket.emit('game-dont-exist');
        }
    });
});