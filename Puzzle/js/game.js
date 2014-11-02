/**************************************
 * Game Implementation
**************************************/

var game = (function () {
	var puzzleContainer = document.getElementById("puzzleContainer"),
		puzzleFields,
		gameSize,
		fieldSize, //siez of the filed in % in case of the size 3 it is 33,333%
		fieldsPerRow,
		selectedIndex,
		victoryCallback,
		isVictory = false,
		isGameOn = false; //game need to be started using game.start();

	var drawBoard = function () {
		//insert fields into HTML
		var fieldsHtml = "";
		puzzleFields.forEach(function (val, i) {
			var divClass = val === gameSize ? "puzzle-field active" : "puzzle-field"; //set active to the last in arr
			var css = s.format("width:{0}; height:{0}", fieldSize);

			fieldsHtml += s.format('<div class="{0}" id="field_{1}" data-index="{1}" onClick="game.click({1})" style="{3}">{2}</div>', divClass, i, val, css);

		});
		puzzleContainer.innerHTML = fieldsHtml;
	};

	var swapFields = function (indexToSwap) {
		console.log("swapFields");
		if (!isGameOn) return;
		if (indexToSwap >= 0 && indexToSwap < gameSize) {
			console.log("swap index ", selectedIndex, "with index ", indexToSwap);

			var temp = puzzleFields[selectedIndex];
			puzzleFields[selectedIndex] = puzzleFields[indexToSwap];
			puzzleFields[indexToSwap] = temp;

			drawBoard();

			checkVictory();

			selectedIndex = indexToSwap;

		}

	}

	var checkVictory = function() {
		isVictory = true;
		for (var i = 0, l = puzzleFields.length; i < l; i++) {
			if (puzzleFields[i] !== i + 1) {
				isVictory = false;
				break;
			}
		}

		if (isVictory) {
			isGameOn = false;
			victoryCallback();
		}
	}

	var defaultVictoryCallback = function() {
		alert("Victory");
	}

	//set victory callback to default one can be changed
	victoryCallback = defaultVictoryCallback; 


	//Keyboard navigation
	document.onkeydown = function (e) {
		if (!isGameOn) return;
		e = e || window.event;
		switch (e.which || e.keyCode) {

			case 37: // left
				swapFields(selectedIndex - 1);
				if (e.preventDefault) e.preventDefault();
				break;

			case 38: // up
				swapFields(selectedIndex - fieldsPerRow);
				if (e.preventDefault) e.preventDefault();
				break;

			case 39: // right
				swapFields(selectedIndex + 1);
				if (e.preventDefault) e.preventDefault();
				break;

			case 40: // down
				swapFields(selectedIndex + fieldsPerRow);
				if (e.preventDefault) e.preventDefault();
				break;

			default:
				return; // exit this handler for other keys
		}
	}

	return {
		//Set custom victory callback, if you don't like built in one
		victory: function(callback) {
			victoryCallback = callback;
		},

		start: function(size) {
			size = size || 4; //set default value to 4

			if (size < 3 || size > 6)
				throw new Error("game start >> size must be between 3 and 6");

			fieldSize = 100 / size + "%";

			var puzzleArr = [];
			s.iterate(size * size, function(i) {
				puzzleArr.push(i + 1);
			});

			puzzleFields = s.shuffle(puzzleArr);
			gameSize = puzzleFields.length,
			selectedIndex = puzzleFields.indexOf(size * size); // index of biggest value in array
			console.log(selectedIndex);
			drawBoard();
			fieldsPerRow = Math.sqrt(gameSize);
			isGameOn = true;
			//$("#field_" + selectedIndex).addClass("active");
		},

		click: function(clickedIndex) {
			console.log(clickedIndex);
		}
	}
}());






