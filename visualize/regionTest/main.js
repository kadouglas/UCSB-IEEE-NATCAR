var gw, gh;
var gs = 100;

var pointR = 6;
var selectedPoint = null;
var points = [
	{"x":318,"y":356,"color":"#FF0000",label: '0'},
	{"x":437,"y":159,"color":"#00FF00",label: '1'},
	{"x":141,"y":135,"color":"#0000FF",label: '2'}
];

function main() {
	fullscreenCanvas();

	draw();
}

function mousePressed() {
	selectedPoint = getPointIndex(mouseX, mouseY);
}

function mouseMoved() {
	if (mouseIsPressed && selectedPoint !== null) {
		var p = points[selectedPoint];

		p.x += mouseX - pmouseX;
		p.y += mouseY - pmouseY

		draw();
	}
}

function draw() {
	mainRegion.background = '#FFFFFF';
	fillBackground();

	gw = Math.ceil(width/gs);
	gh = Math.ceil(height/gs);

	// draw the grid
		stroke('#000000');
		lineWidth(1);
		for (var x = 1; x < gw; x++) {
			line(gs*x, 0, gs*x, height);
		}

		for (var y = 1; y < gh; y++) {
			line(0, gs*y, width, gs*y);
		}

	alignPoints();

	drawPoints();
}

function resize() {
	draw();
}

function drawPoints() {
	for (var p of points) {
		stroke(p.color);
		lineWidth(3);
		arc(p.x, p.y, pointR, 0, 2*Math.PI);
		rectLine(
			gs*Math.floor(p.x/gs),
			gs*Math.floor(p.y/gs),
			gs,
			gs
		);
	}

	// draw lines
	stroke('#000000');
	for (var i = 0; i < points.length; i++) {
		var p0 = points[i];
		var p1 = points[(i+1)%points.length];

		line(p0.x, p0.y, p1.x, p1.y);
	}

	// draw text
	fill('#000000');
	textSize(20);
	for (var p of points) {
		text(p.label, p.x, p.y - 20);
	}
}

function alignPoints() {
	// find points with min y
	var pts = [];
	for (var i = 0; i < points.length; i++) {
		var p = points[i];
		pts.push({
			x: Math.floor(p.x/gs),
			y: Math.floor(p.y/gs),
			index: i
		});
	}

	// set a, the 1. top, 2. left point
	var a = pts[0];
	var b = pts[1];
	var c = pts[2];

	if (b.y < a.y || (b.y === a.y && b.x < a.x)) {
		var temp = a;
		a = b;
		b = temp;
	}

	if (c.y < a.y || (c.y === a.y && c.x < a.x)) {
		var temp = a;
		a = c;
		c = temp;
	}

	// set b, the point on the bottom right
	if (b.y > c.y || (b.y === b.y && b.x > c.x)) {
		var temp = b;
		b = c;
		c = temp;
	}

	points[a.index].label = 'A';
	points[b.index].label = 'B';
	points[c.index].label = 'C';
}

function getPointIndex(x, y) {
	for (var i = 0; i < points.length; i++) {
		var p = points[i];
		var dx = x - p.x;
		var dy = y - p.y;
		var dist = Math.sqrt(dx*dx + dy*dy);
		if (dist < pointR) {
			return i;
		}
	}
	return null;
}