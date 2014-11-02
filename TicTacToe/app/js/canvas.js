_ttt.canvas = (function (S, R) {

	var $gameWrapper = document.getElementById('ttt-game-wrapper'),
		lastGameWidth = $gameWrapper.offsetWidth,
		timeout;

	/**
	 * Repaint canvas after resize of game wrapper finishes
	 * Canvas is not re-sizable on resize canvas zoom out or zoom in images 
	 */
	window.onresize = function(e) {
		//Wait for resize event to finish
		clearTimeout(timeout);
		timeout = setTimeout(repaintCanvas, 300);
	};

	/**
	 * After the game resize we need to recreate the board
	 * Canvas clears after changing the size of it
	 */
	function repaintCanvas () {
		var currentWidth = $gameWrapper.offsetWidth,
			playedMoves,
			field,
			canvas;

		if(currentWidth !== lastGameWidth) {
			lastGameWidth = currentWidth;

			ttt.generateGameHtml();

			playedMoves = ttt.getPlayedMoves();
			
			if (playedMoves) {
				S.each(playedMoves, function (move) {
					field = move.row + ':' + move.column;
					canvas = S.elem('[data-diagonal="' + field + '"]');
					_ttt.canvas.instantDraw(canvas, move.player);
				});
				S.log(playedMoves);
			}

		}
	}

	function animateLine (ctx, cordinates, callback) {
		var amount = 0;
		var repeater = setInterval( function () {
		amount += 0.05; // change to alter duration
			if (amount > 1) {
				amount = 1;
				clearInterval(repeater);
				if (callback && typeof(callback) === "function") {
					//indicate the end of animation
					callback(true);
				}
			}
			ctx.clearRect(0, 0, cordinates.width, cordinates.height);
			ctx.moveTo(cordinates.startX, cordinates.startY);
			ctx.lineTo(cordinates.startX + (cordinates.endX - cordinates.startX) * amount, cordinates.startY + (cordinates.endY - cordinates.startY) * amount);
			ctx.stroke();
		}, R.conf.animationSpeed);
	}

	function setContextConfiguration (ctx) {
		ctx.lineWidth = R.conf.lineWidth;
		ctx.strokeStyle = R.conf.strokeStyle;
		ctx.shadowOffsetX = R.conf.shadowOffsetX;
		ctx.shadowOffsetY = R.conf.shadowOffsetY;
		ctx.shadowBlur = R.conf.shadowBlur;
		ctx.shadowColor = R.conf.shadowColor;

		return ctx;
	}

	return {

		/**
		 * Draw player sign on the clicked canvas
		 * @param  {html element} canvas clicked canvas
		 * @param  {string} player player symbol (X or O)
		 */
		draw: function (canvas, player) {
			if (player === R.val.playerX) {
				this.drawX(canvas);
			}
			else {
				this.drawO(canvas);
			}
		},

		/**
		 * Same as draw but call functions that dont have animations
		 */
		instantDraw: function (canvas, player) {
			if (player === R.val.playerX) {
				this.drawX(canvas, true);
			}
			else {
				this.drawO(canvas, true);
			}
		},


		drawX: function (canvas, noAnimation) {
			var offset = R.conf.offset,
				width = R.conf.canvasWidth,
				height = R.conf.canvasWidth, //width and height are the same 
				ctx;

			ctx = canvas.getContext('2d');
			ctx = setContextConfiguration(ctx);

			ctx.beginPath();

			var firstLineCor = { 
				startX: offset,
				startY: offset,
				endX: width - offset,
				endY: height - offset,
				width: width,
				height: height
			};

			var secondLineCor = { 
				startX: width - offset,
				startY: offset,
				endX: offset,
				endY: height - offset,
				width: width,
				height: height
			};

			if (noAnimation === true) {
				ctx.moveTo(firstLineCor.startX, firstLineCor.startY);
				ctx.lineTo(firstLineCor.endX, firstLineCor.endY);
				ctx.moveTo(secondLineCor.startX, secondLineCor.startY);
				ctx.lineTo(secondLineCor.endX, secondLineCor.endY);

				ctx.stroke();
			} else {
				//animate first line
				animateLine(ctx, firstLineCor, function() {
					//run this after first line finish with animation
					animateLine(ctx, secondLineCor);
				});
			}

		},
		

		/**
		 * Draw O in the canvas
		 */
		drawO: function (canvas, noAnimation) {
			var ctx,
				repeater,
				width = R.conf.canvasWidth,
				height = R.conf.canvasWidth,
				x = width / 2,
				y = height / 2,
				radius = (height / 2) - R.conf.offset,
				endPercent = 100,
				curPerc = 0,
				current = 0,
				circ = Math.PI * 2,
				quart = Math.PI / 2;

			ctx = canvas.getContext('2d');
			ctx = setContextConfiguration(ctx);

			if (noAnimation) {
				ctx.clearRect(0, 0, width, height);
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, circ);
				ctx.stroke();
			} else {

				repeater = setInterval (function () {
					if (curPerc > endPercent) {
						curPerc = 1;
						clearInterval(repeater);
					}
					
					ctx.clearRect(0, 0, width, height);
					ctx.beginPath();
					ctx.arc(x, y, radius, -(quart), ((circ) * current) - quart, false);
					ctx.stroke();
					curPerc += 3; // change to alter duration, bigger the number faster the animation 
					current = curPerc / 100;
				}, R.conf.animationSpeed);
			}
		},

		clearCanvas: function (canvas) {
			var ctx = canvas.getContext('2d'),
				width = R.conf.canvasWidth,
				height = R.conf.canvasWidth;

			ctx.clearRect(0, 0, width, height);
		}
	};

}(_ttt.S, _ttt.resources));