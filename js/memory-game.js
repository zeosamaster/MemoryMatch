(function () {
	'use strict';

	var defaults = {
			imageCount: 9,
			boardX: 6,
			boardY: 3
		},
		correctGuesses = 0,
		flippedBadge = false,
		timerInterval = 0,
		timer = 0,
		shareMessage = 'Memory JavaScript FTW em: ',
		shareUrl = 'https://twitter.com/intent/tweet/?text=' + shareMessage,
		canClick = true,
		performClick;

	function callJsonP(src, callbackName, callBackFunction) {
		window[callbackName] = callBackFunction;
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = src + '?callback=' + encodeURIComponent(callbackName);
		document.getElementsByTagName('head')[0].appendChild(script);
	}

	function getImages(json) {
		var i,
			index,
			images = [],
			image;

		for (i = 0; i < defaults.imageCount; i++) {
			index = parseInt(Math.random() * json.length, 10);
			image = json.splice(index, 1);
			images.push(image);
		}

		return images;
	}

	function setNewBoard(x, y, images) {
		var i, j, temp, newRow, newFakeBadge, newBadge,
			auxImages = images.slice();

		for (i = 0; i < auxImages.length; i++) {
			j = Math.floor(Math.random() * (i + 1));
			temp = auxImages[i];
			auxImages[i] = auxImages[j];
			auxImages[j] = temp;
		}
		images = images.concat(auxImages);

		for (i = 0; i < x; i++) {
			newRow = document.createElement('div');
			newRow.className = 'badge-container';
			document.getElementById('gameContainer').appendChild(newRow);

			for (j = 0; j < y; j++) {
				newFakeBadge = document.createElement('div');
				newFakeBadge.className = 'fake-badge';
				newFakeBadge.onclick = performClick;

				newBadge = document.createElement('img');
				newBadge.className = 'badge';
				newBadge.src = images[i * y + j][0].img;
				newBadge.title = newBadge.alt = images[i * y + j][0].title;
				newBadge.style.display = 'none';

				newRow.appendChild(newFakeBadge);
				newRow.appendChild(newBadge);
			}
		}
	}

	function newGame() {
		callJsonP('https://services.sapo.pt/Codebits/listbadges', 'callback', function (json) {
			var images, board;

			document.getElementById('gameContainer').innerHTML = '';
			document.getElementById('timer').innerHTML = '';
			document.getElementById('timerContainer').style.visibility = 'hidden';

			images = getImages(json);
			board = setNewBoard(defaults.boardX, defaults.boardY, images);

			document.getElementById('share').style.visibility = 'hidden';
			document.getElementById('newGame').style.display = 'none';
			document.getElementById('startGame').style.display = 'block';

			timer = 0;
			correctGuesses = 0;
			canClick = false;
			flippedBadge = false;
		});
	}

	function startGame() {
		timerInterval = setInterval(function () {
			timer++;
			document.getElementById('timer').innerHTML = timer;
		}, 1000);

		canClick = true;
		document.getElementById('startGame').style.display = 'none';
		document.getElementById('timerContainer').style.visibility = 'visible';
	}

	function endGame() {
		clearInterval(timerInterval);
		document.getElementById('shareLink').href = shareUrl + timer;
		document.getElementById('share').style.visibility = 'visible';

		document.getElementById('newGame').style.display = 'block';
	}

	function clickBadge(e) {
		e.target.style.display = 'none';
		e.target.nextSibling.style.display = 'block';

		if (flippedBadge) {
			if (e.target.nextSibling.src === flippedBadge.src) {
				if (++correctGuesses === defaults.imageCount) {
					endGame();
				} else {
					canClick = true;
					flippedBadge = false;
				}
			} else {
				setTimeout(function () {
					flippedBadge.previousSibling.style.display = 'block';
					flippedBadge.style.display = 'none';
					e.target.style.display = 'block';
					e.target.nextSibling.style.display = 'none';
					flippedBadge = false;
					canClick = true;
				}, 1000);
			}
		} else {
			flippedBadge = e.target.nextSibling;
			canClick = true;
		}
	}

	performClick = function (e) {
		if (canClick) {
			canClick = false;
			clickBadge(e);
		}
	}

	document.getElementById('newGame').onclick = newGame;
	document.getElementById('startGame').onclick = startGame;
}());