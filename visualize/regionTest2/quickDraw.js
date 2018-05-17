// Quickdraw
// a small addon to make HTML canvas drawing easier

function ArcTan(x, y) {
	return Math.atan2(y, x);
};

var tabN = 0;
var tabChar = "   "

function pr(text) {
	if (tabN === 0) {
		console.log(text);
		return;
	}
	text = ""+text;
	var tabText = "";
	for (var i = 0; i < tabN; i++) {
		tabText += tabChar;
	}
	console.log(tabText + text.replace(/\n/g, "\n" + tabText));
}

function pi() {
	tabN++;
}

function pd() {
	if (tabN > 0) {
		tabN--;
	}
}

function assert(a) {
	if (!a) {
		throw Error('Assert Failed');
	}
}

Set.prototype.union = function(b) {
	var res = new Set(this);
	for (var elem of b) {
		res.add(elem);
	}
	return res;
};

Set.prototype.combine = function(setB) {
	for (var elem of setB) {
		this.add(elem);
	}
};

function randInt(a, b) {
	return a + Math.floor((b-a+1)*random());
}

var rnd = Math.round;

// checks if b is inside a
function contains(a0, a1, b0, b1) {
	a0 = rnd(a0);
	a1 = rnd(a1);
	b0 = rnd(b0);
	b1 = rnd(b1);

	return (b0 >= a0) && (b0 + b1 <= a0 + a1);
}

var canvas,
	mainRegion,
	ctx,
	width,
	height,
	main,
	resize,
	mousePressed,
	mouseReleased,
	mouseMoved;
var mouseIsPressed = false,
	mouseX = 0,
	mouseY = 0,
	pmouseX = 0,
	pmouseY = 0;

function createCanvas(w, h) {
	mainRegion = new DrawingRegion(0, 0, w, h);
	
	canvas = mainRegion.canvas;
	ctx = mainRegion.ctx;
	width = w;
	height = h;

	// canvas = document.createElement('canvas');
	// canvas.width = w;
	// canvas.height = h;

	// ctx = canvas.getContext('2d');

	// width = w;
	// height = h;

	document.body.appendChild(canvas);
}

function fullscreenCanvas() {
	createCanvas(window.innerWidth, window.innerHeight);
	document.body.style.overflow = 'hidden';
}

function fillBackground() {
	mainRegion.fillBackground();
}

function rect(x, y, w, h) {
	mainRegion.rect(x, y, w, h);
}

function rectLine(x, y, w, h) {
	mainRegion.rectLine(x, y, w, h);
}

function fill(color) {
	mainRegion.fill(color);
}

function stroke(color) {
	mainRegion.stroke(color);
}

function lineWidth(w) {
	mainRegion.lineWidth(w);
}

function textSize(s) {
	mainRegion.textSize(s);
}
function font(f) {
	mainRegion.font(f);
}
function text(txt, x, y) {
	mainRegion.text(txt, x, y);
}

function line(x0, y0, x1, y1) {
	mainRegion.line(x0, y0, x1, y1);
}

function arc(x, y, r, ang0, ang1) {
	mainRegion.arc(x, y, r, ang0, ang1);
}

function tWidth(txt) {
	return mainRegion.tWidth(txt);
}

window.onload = function(evt) {
	document.body.style.padding = 0;
	document.body.style.margin = 0;

	if (main) {
		main();
	} else {
		throw Error('No main function defined');
	}
};

window.onresize = function() {
	mainRegion.resize(window.innerWidth, window.innerHeight);
	width = mainRegion.w;
	height = mainRegion.h;

	if (resize) {
		resize();
	}
};

window.onmousedown = function() {
	mouseIsPressed = true;

	if (mousePressed) {
		mousePressed();
	}
}

window.onmouseup = function() {
	mouseIsPressed = false;

	if (mouseReleased) {
		mouseReleased();
	}
}

window.onmousemove = function(evt) {
	pmouseX = mouseX;
	pmouseY = mouseY;
	mouseX = evt.clientX;
	mouseY = evt.clientY;
	if (mouseMoved) {
		mouseMoved();
	}
}

class DrawingRegion {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.px = x;
		this.py = y;
		this.pw = w;
		this.ph = h;

		this.background = '#FFFFFF';
		this.fontSize = 10;
		this.fontFamily = 'Courier New';
		

		this.canvas = document.createElement('canvas');
		this.canvas.width = w;
		this.canvas.height = h;
		this.ctx = this.canvas.getContext('2d');

		this.setFont();
	}
	resize(w, h) {
		this.w = w;
		this.h = h;
		this.canvas.width = w;
		this.canvas.height = h;
	}
	tWidth(txt) {
		return this.ctx.measureText(txt).width;
	}
	setTextSizes() {
		var text = document.createElement('span');
		text.style.fontFamily = this.fontFamily;
		text.style.fontSize = this.fontSize + 'px';
		text.innerHTML = 'AMjgq|';

		var block = document.createElement('div');
		block.style.display = 'inline-block';
		block.style.width = '1px';
		block.style.height = '0px';

		var container = document.createElement('div');
		container.appendChild(text);
		container.appendChild(block);

		container.style.height = '0px';
		container.style.overflow = 'hidden';
		document.body.appendChild(container);

		block.style.verticalAlign = 'baseline';
		var blockOffset = calculateOffset(block);
		var textOffset = calculateOffset(text);
		this.textAscent = blockOffset[1] - textOffset[1];

		block.style.verticalAlign = 'bottom';
		blockOffset = calculateOffset(block);
		textOffset = calculateOffset(text);
		var height = blockOffset[1] - textOffset[1];
		this.textDescent = height - this.textAscent;

		document.body.removeChild(container);
	}
	clear() {
		fill(this.background);
		rect(this.px, this.py, this.pw, this.ph);
	}
	fill(color) {
		this.ctx.fillStyle = color;
	}
	stroke(color) {
		this.ctx.strokeStyle = color;
	}
	lineWidth(w) {
		this.ctx.lineWidth = w;
	}
	setFont() {
		this.ctx.font = '' + this.fontSize + 'px ' + this.fontFamily;
		this.setTextSizes();
	}
	textSize(s) {
		this.fontSize = s;
		this.setFont();
	}
	font(f) {
		this.fontFamily = f;
		this.setFont();
	}
	rect(x, y, w, h) {
		x = rnd(x);
		y = rnd(y);
		w = rnd(w);
		h = rnd(h);

		this.ctx.fillRect(x, y, w, h);
	}
	rectLine(x, y, w, h) {
		x = rnd(x);
		y = rnd(y);
		w = rnd(w);
		h = rnd(h);

		this.ctx.beginPath();
		this.ctx.moveTo(x, y);
		this.ctx.lineTo(x+w, y);
		this.ctx.lineTo(x+w, y+h);
		this.ctx.lineTo(x, y+h);
		this.ctx.lineTo(x, y);
		this.ctx.stroke();
	}
	line(x0, y0, x1, y1) {
		x0 = rnd(x0);
		y0 = rnd(y0);
		x1 = rnd(x1);
		y1 = rnd(y1);

		this.ctx.beginPath();
		this.ctx.moveTo(x0, y0);
		this.ctx.lineTo(x1, y1);
		this.ctx.stroke();
	}
	arc(x, y, r, ang0, ang1) {
		x = rnd(x);
		y = rnd(y);
		r = rnd(r);

		this.ctx.beginPath();
		this.ctx.arc(x, y, r, ang0, ang1, false);
		this.ctx.stroke();
	}
	text(txt, x, y) {
		this.ctx.fillText(txt, rnd(x), rnd(y));
	}
	fillBackground() {
		// this.ctx.fillStyle = '#FF0000';
		this.ctx.fillStyle = this.background;
		this.ctx.fillRect(0, 0, this.w, this.h);
	}
	draw() {
		ctx.drawImage(this.canvas, rnd(this.x), rnd(this.y));
	}
	redraw() {
		if (
			!contains(this.x, this.w, this.px, this.pw) ||
			!contains(this.y, this.h, this.py, this.ph)
		) {
			this.clear();
		}
		this.draw();

		this.px = this.x;
		this.py = this.y;
		this.pw = this.w;
		this.ph = this.h;
	}
}
function calculateOffset(object) {
	var currentLeft = 0,
		currentTop = 0;
	if (object.offsetParent) {
		do {
			currentLeft += object.offsetLeft;
			currentTop += object.offsetTop;
		} while (object = object.offsetParent);
	} else {
		currentLeft += object.offsetLeft;
		currentTop += object.offsetTop;
	}
	return [currentLeft, currentTop];
}
DrawingRegion.FS = function() {
	return new DrawingRegion(0, 0, window.innerWidth, window.innerHeight);
}