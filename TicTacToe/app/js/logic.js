_ttt.logic = (function (S, R) {
	var player = R.val.playerX, //Player X always start first
        winStreak, //number of hits in a row necessary to win the game
        movesPlayed = [],
        gameEnd = false,
        winStatus = {}, //rowWin, row, columnWin, column, diagonalWin, diagonal, player 
        gameScores = {
            playerX: 0,
            playerO: 0,
            draw: 0,
        };

    /**
     * This is not classic ttt game
     * player can win by 3 in a row in a game with 8 fields
     * or any other defined combination of boardSize and winStreak
     * and also it can be classic ttt game if user chose to play board size 3 with the winStreak 3
     */
    function checkForWin (currentMove, player) {
        var playerMoves, //test only moves that current player has played
            possibleMoves, //Possible moves that we will test (all player moves on selected played column, row and diagonal)
            currentRow = currentMove.row,
            currentColumn = currentMove.column,
            winLine;

        //Get only moves played by the current player
        playerMoves = movesPlayed.filter( function (elem) {
            return elem.player == player;
        });

        //there is not enough moves played by player to win the game
        if(playerMoves.length < winStreak) {
            return false;
        }

        //Get the current played row and check if there is winning combination in that row
        possibleMoves = playerMoves.filter( function (elem, i, arr) {
            return elem.row == currentRow;
        });

        if (possibleMoves.length >= winStreak) {   
            winLine = checkMoves(possibleMoves, true);
            if (winLine) {
                winStatus.player = player;
                winStatus.line = winLine;
                return true;
            }
        }

        //Get the current played column and check if there is winning combination in that row
        possibleMoves = playerMoves.filter( function (elem, i, arr) {
            return elem.column == currentColumn;
        });

        if(possibleMoves.length >= winStreak) {
            winLine = checkMoves(possibleMoves, false);
            if(winLine) {
                winStatus.player = player;
                winStatus.line = winLine;
                return true;
            }
        }

        //Get the current played EVEN DIAGONAL and check if there is winning combination in that row
        possibleMoves = playerMoves.filter( function (elem, i, arr) {
            return currentRow - elem.row === currentColumn - elem.column;
        });

        if(possibleMoves.length >= winStreak) {
            winLine = checkMoves(possibleMoves, false);
            if (winLine) {
                winStatus.player = player;
                winStatus.line = winLine;
                return true;
            }
        }

        //Get the current played ODD DIAGONAL and check if there is winning combination in that row
        possibleMoves = playerMoves.filter( function (elem, i, arr) {
            return currentRow - elem.row === (currentColumn - elem.column) * -1;
        });

        if(possibleMoves.length >= winStreak) {
            winLine = checkMoves(possibleMoves, false);
            if (winLine) {
                winStatus.player = player;
                winStatus.line = winLine;
                return true;
            }
        }

        return false;
    }

    /**
     * Check if selected line have wining strike
     * Count number of integers going one after another (1,2,3), 
     * if the count is equal to the winingStrik return current numbers
     * @return {[Array]} winingStrike array
     * @return {[Boolean]} false - this line doesn't have winingStrike
     */
    function checkMoves (moves, checkColumn) {
        var vinWalues = [],
            counter = 1; //counter for numbers that go one after the other and incremented by one

        if (checkColumn === true) {
            moves.sort(function (a, b) { return a.column - b.column; });
        } else {
            moves.sort(function (a, b) { return a.row - b.row; });
        }

        for (var i = 0, l = moves.length; i < l; i++) {
            if( i === 0) {
                vinWalues.push(moves[i].row + ':' + moves[i].column);
            } else if (!checkColumn && moves[i-1].row + 1 === moves[i].row) {
                vinWalues.push(moves[i].row + ':' + moves[i].column);
                counter++;
            } else if (checkColumn && moves[i-1].column + 1 === moves[i].column) {
                vinWalues.push(moves[i].row + ':' + moves[i].column);
                counter++;
            } else if (counter >= winStreak) {
                return vinWalues;
            } else { //the wining streak is off start counting again
                counter = 1;
                l -= i;
                vinWalues = [];
            }
        }

        if(counter >= winStreak) {
            return vinWalues;
        }
        
        return false;
    }

    /**
     * Switch current player
     */
    function switchPlayer () {
        player = (player === R.val.playerX) ? R.val.playerO : R.val.playerX;
    }
    
    return {

        move: function (clientPlayer, row, column) {
            var isPlayed,
                field = {
                    row: parseInt(row, 10),
                    column: parseInt(column, 10),
                    player: player
                };

            //Check is it valid player
            if (clientPlayer !== player) {
                S.log('Invalid Player!');
                return R.statusCode.INVALID_PLAYER;
            }

            //Check if game is active
            if (gameEnd) {
                S.log('Game has ended!');
                return R.statusCode.GAME_END;
            }

            S.log('your move row: ' + row + ' column: ' + column);

            //Check if move have already been played
            isPlayed = movesPlayed.some(function(played, index, arr) {
                //returns true in case there is existing field in the array
                return played.row === field.row && played.column === field.column;
            });

            //move has already been played
            if (isPlayed) {
                S.log('Invalid move!');
                return R.statusCode.INVALID_MOVE;
            } 

            //Valid move, push the move to the played moves array
            movesPlayed.push(field);
            S.log(movesPlayed);

            //Check if this is the wining move 
            if (checkForWin(field, player)) {
                S.log('Win!');
                gameEnd = true;

                if (player === R.val.playerX) gameScores.playerX ++;
                else gameScores.playerO ++;

                return R.statusCode.WIN;
            } 

            //Check if this is the last move in the game (Draw)
            else if (movesPlayed.length === Math.pow(R.game.boardSize, 2)) {
                S.log('Draw!');
                gameEnd = true;
                gameScores.draw ++;
                return R.statusCode.DRAW;
            }

            //next player move
            switchPlayer();
            return R.statusCode.VALID_MOVE;
        },

        newGame: function () {
            //Set the winning streak
            R.game.winStreak = parseInt(R.game.winStreak, 10);
            R.game.boardSize = parseInt(R.game.boardSize, 10);

            winStreak = (R.game.winStreak <= R.game.boardSize) ? R.game.winStreak : R.game.boardSize;
            movesPlayed = [];
            winStatus = {};
            gameEnd = false;
            player = R.val.playerX;
        },

        getWinStatus: function () {
            return winStatus;
        },

        getNextPlayer: function () {
            return player;
        },

        getScores: function () {
            return gameScores;
        },

        getPlayedMoves: function () {
            if (movesPlayed.length > 0) { return movesPlayed; } 
            else { return false; }
        }

    };
}(_ttt.S, _ttt.resources));