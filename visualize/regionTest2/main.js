var gw, gh;
var gs = 10;

var pointR = 6;
var selectedPoint = null;
var points = [
	{"x":318,"y":356,"color":"#FF0000",label: 'start',draggable: true},
	{"x":437,"y":159,"color":"#00FF00",label: 'end',draggable: true}
];
var pts;

function setCorners() {
	var w = 200;
	var h = 350;

	var p0 = points[0];
	var p1 = points[1];

	var dx1 = p1.x - p0.x;
	var dy1 = p1.y - p0.y;
	var l = Math.sqrt(dx1*dx1 + dy1*dy1);

	var dx2 = dx1 / l;
	var dy2 = dy1 / l;

	var wx = -dy2*w/2;
	var wy = dx2*w/2;

	var lx = dx2*h;
	var ly = dy2*h;

	points[2] = {
		x: p0.x + wx,
		y: p0.y + wy,
		color: '#0000FF',
		label: 'A',
		draggable: false
	};
	points[3] = {
		x: p0.x - wx,
		y: p0.y - wy,
		color: '#0000FF',
		label: 'B',
		draggable: false
	};
	points[4] = {
		x: p0.x - wx + lx,
		y: p0.y - wy + ly,
		color: '#0000FF',
		label: 'C',
		draggable: false
	};
	points[5] = {
		x: p0.x + wx + lx,
		y: p0.y + wy + ly,
		color: '#0000FF',
		label: 'D',
		draggable: false
	};
}

function main() {
	fullscreenCanvas();

	setCorners();
	draw();
}

function mousePressed() {
	selectedPoint = getPointIndex(mouseX, mouseY);
}

function mouseMoved() {
	if (mouseIsPressed && selectedPoint !== null) {
		var p = points[selectedPoint];

		if (p.draggable) {
			p.x += mouseX - pmouseX;
			p.y += mouseY - pmouseY
			setCorners();
			draw();
		}
	}
}

function pixelRect(x, y) {
	stroke('#000000');
	rectLine(x*gs,y*gs,gs,gs);
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

	setCorners();
	alignPoints2();

	drawPoints();

	// drawBorders2();
	loopRect(
		pixelRect,
		points[0].x/gs,
		points[0].y/gs,
		points[1].x/gs,
		points[1].y/gs,
		20,
		40,
		20,
		Math.floor(width/gs) - 22,
		20,
		Math.floor(height/gs) - 22
	);
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
	var lines = [
		[0, 1],
		[2, 3],
		[3, 4],
		[4, 5],
		[5, 2]
	];
	for (var l of lines) {
		var p0 = points[l[0]];
		var p1 = points[l[1]];

		// line(p0.x, p0.y, p1.x, p1.y);
	}

	// draw text
	fill('#000000');
	textSize(20);
	for (var p of points) {
		text(p.label, p.x, p.y - 20);
	}
}

// set slope of line object
// because screw classes
function setSlope(l) {
	var dx = l.x1 - l.x0;
	var dy = l.y1 - l.y0;
	if (dy === 0) {
		l.m = undefined;
	} else {
		l.m = dx/dy;
	}
}

function getLine(p0, p1) {
	var l = {
		x0: p0.x,
		y0: p0.y,
		x1: p1.x,
		y1: p1.y
	};

	var dx = l.x1 - l.x0;
	var dy = l.y1 - l.y0;
	if (dy !== 0) {
		l.m = dx/dy;
	}
	return l;
}

function loopRect(fcn, x0, y0, x1, y1, w, h, minX, maxX, minY, maxY) {
	var dx1 = x1 - x0;
	var dy1 = y1 - y0;
	var l = Math.sqrt(dx1*dx1 + dy1*dy1);

	var dx2 = dx1 / l;
	var dy2 = dy1 / l;

	var wx = -dy2 * w / 2;
	var wy = dx2 * w / 2;

	var lx = dx2 * h;
	var ly = dy2 * h;

	// ordered counterclockwise
	var pts = [
		{
			x: x0 + wx,
			y: y0 + wy
		},
		{
			x: x0 - wx,
			y: y0 - wy
		},
		{
			x: x0 - wx + lx,
			y: y0 - wy + ly
		},
		{
			x: x0 + wx + lx,
			y: y0 + wy + ly
		}
	];

	// round the points
	for (var p of pts) {
		p.x = Math.round(p.x);
		p.y = Math.round(p.y);
	}

	// Find the index of point with the lowest y
	// Don't care if there is a tie
	var minI = 0;
	for (var i = 1; i < 4; i++) {
		if (pts[i].y < pts[minI].y) {
			minI = i;
		}
	}

	// cycle the points to be ordered with lowest y first
	var newPts = [];
	newPts[0] = pts[(minI + 0)%4];
	newPts[1] = pts[(minI + 1)%4];
	newPts[2] = pts[(minI + 2)%4];
	newPts[3] = pts[(minI + 3)%4];
	pts = newPts;

	// get an array of y values
	var ys = [];
	for (var p of pts) {
		ys.push(p.y);
	}
	ys.sort(function(a, b) {return a - b;});
	pr(ys);

	// calculate lines
	var lu = getLine(pts[0], pts[3]);
	var ll = getLine(pts[3], pts[2]);
	var ru = getLine(pts[0], pts[1]);
	var rl = getLine(pts[1], pts[2]);

	// get min and max y values
	// var ymin = Math.max(ys[0], minY);
	// var ymax = Math.min(ys[3], maxY);
	var ymin = Math.min(maxY, Math.max(minY, ys[0]));
	var ymax = Math.min(maxY, Math.max(minY, ys[3]));

	// mode refers to the potion of the rectangle to use
	// 0: upper
	// 1: middle
	// 2: lower
	var mode = 0;

	// loop over y values
	for (var y = ymin; y <= ymax; y++) {
		while (y >= ys[mode+1]) {
			mode++;
		}

		// left and right x for current y
		var lx, rx;
		if (mode === 0) {
			lx = Math.floor(lu.x0 + lu.m * (y - lu.y0));
			rx = Math.ceil(ru.x0 + ru.m * (y - ru.y0));
		} else if (mode === 1) {
			if (pts[1].y > pts[3].y) {
				lx = Math.floor(ll.x0 + ll.m * (y - ll.y0));
				rx = Math.ceil(ru.x0 + ru.m * (y - ru.y0));
			} else {
				lx = Math.floor(lu.x0 + lu.m * (y - lu.y0));
				rx = Math.ceil(rl.x0 + rl.m * (y - rl.y0));
			}
		} else if (mode === 2) {
			lx = Math.round(ll.x0 + ll.m * (y - ll.y0));
			rx = Math.round(rl.x0 + rl.m * (y - rl.y0));
		}

		// round the x values
		lx = Math.max(lx, minX);
		rx = Math.min(rx, maxX);
		// lx = Math.min(maxX, Math.max(minX, lx));
		// rx = Math.min(maxX, Math.max(minX, rx));

		// execute the function over the points
		for (var x = lx; x <= rx; x++) {
			fcn(x, y);
		}
	}
}

function drawBorders2() {
	// get an array of y values 
	var ys = [];
	for (var p of pts) {
		ys.push(p.y);
	}
	ys.sort(function(a, b) {return a - b;});

	var lu = getLine(pts[0], pts[3]);
	var ll = getLine(pts[3], pts[2]);
	var ru = getLine(pts[0], pts[1]);
	var rl = getLine(pts[1], pts[2]);

	var ymin = Math.max(1, ys[0]);
	var ymax = Math.min(Math.ceil(height/gs)-2, ys[3]);

	var mode = 0;
	for (var y = ymin; y <= ymax; y++) {
		while (y >= ys[mode+1]) {
			mode++;
		}

		var lx, rx;
		if (mode === 0) {
			lx = Math.floor(lu.x0 + lu.m * (y - lu.y0));
			rx = Math.ceil(ru.x0 + ru.m * (y - ru.y0));
		} else if (mode === 1) {
			if (pts[1].y > pts[3].y) {
				lx = Math.floor(ll.x0 + ll.m * (y - ll.y0));
				rx = Math.ceil(ru.x0 + ru.m * (y - ru.y0));
			} else {
				lx = Math.floor(lu.x0 + lu.m * (y - lu.y0));
				rx = Math.ceil(rl.x0 + rl.m * (y - rl.y0));
			}
		} else if (mode === 2) {
			lx = Math.round(ll.x0 + ll.m * (y - ll.y0));
			rx = Math.round(rl.x0 + rl.m * (y - rl.y0));
		}

		lx = Math.max(lx, 1);
		rx = Math.min(rx, Math.ceil(width/gs)-2);

		for (var x = lx; x <= rx; x++) {
			stroke('#000000');
			rectLine(x*gs,y*gs,gs,gs);
		}
	}

	return;
}

function drawBorders() {
	var a,b,c,d;
	for (var i = 2; i < points.length; i++) {
		var p = points[i];
		var label = p.label;
		p = {
			x: Math.floor(p.x/gs),
			y: Math.floor(p.y/gs),
			index: i
		};
		if (label === 'A') {
			a = p;
		} else if (label === 'B') {
			b = p;
		} else if (label === 'C') {
			c = p;
		} else if (label === 'D') {
			d = p;
		}
	}

	var left = b;
	var right = c;
	if (c.x < b.x) {
		left = c;
		right = b;
	}
	// pr([left,right]);
	// left upper line between A and left
	var lu = getLine(a, left);
	var ll = getLine(left, d);
	var ru = getLine(a, right);
	var rl = getLine(right, d);

	// x = x0 + dx/dy (y-y0)

	// first loop from a to b
	var x = a.x;

	for (var y = a.y; y < b.y; y++) {
		stroke('#000000');
		// arc((x + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
		var lx = Math.round(lu.x0 + lu.m * (y - lu.y0));
		var rx = Math.round(ru.x0 + ru.m * (y - ru.y0));
		stroke('#FF0000');
		arc((lx + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
		stroke('#00FF00');
		arc((rx + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
	}

	// second loop from b to c
	x = b.x;


	for (var y = b.y; y < c.y; y++) {
		// arc((x + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);

		var lx, rx;
		if (b.x < c.x) {
			lx = Math.round(ll.x0 + ll.m * (y - ll.y0));
			rx = Math.round(ru.x0 + ru.m * (y - ru.y0));
		} else {
			lx = Math.round(lu.x0 + lu.m * (y - lu.y0));
			rx = Math.round(rl.x0 + rl.m * (y - rl.y0));
		}

		stroke('#FF0000');
		arc((lx + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
		stroke('#00FF00');
		arc((rx + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
	}

	x = c.x;
	// third loop from c to d
	for (var y = c.y; y <= d.y; y++) {
		// arc((x + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
		var lx = Math.round(ll.x0 + ll.m * (y - ll.y0));
		var rx = Math.round(rl.x0 + rl.m * (y - rl.y0));
		stroke('#FF0000');
		arc((lx + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
		stroke('#00FF00');
		arc((rx + 0.5)*gs, (y + 0.5)*gs, 7, 0, 2*Math.PI);
	}
}

function alignPoints2() {
	pts = [];
	for (var i = 2; i < points.length; i++) {
		var p = points[i];
		pts.push({
			x: Math.floor(p.x/gs),
			y: Math.floor(p.y/gs),
			index: i
		});
	}

	// find index of point with lowest y
	// if there is a tie, don't care
	var minI = 0;
	for (var i = 1; i < pts.length; i++) {
		if (pts[i].y < pts[minI].y) {
			minI = i;
		}
	}

	// now, relabel the existing points
	points[2 + minI].label = 'A';
	points[2 + (minI + 1)%4].label = 'B';
	points[2 + (minI + 2)%4].label = 'C';
	points[2 + (minI + 3)%4].label = 'D';

	var newPts = [];
	newPts[0] = pts[(minI + 0)%4];
	newPts[1] = pts[(minI + 1)%4];
	newPts[2] = pts[(minI + 2)%4];
	newPts[3] = pts[(minI + 3)%4];
	pts = newPts;
}

function alignPoints() {
	// find points with min y
	var pts = [];
	for (var i = 2; i < points.length; i++) {
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
	var d = pts[3];

	// First, order points by lowest y value
	if (ptLT(c, d)) {
		var temp = c;
		c = d;
		d = temp;
	}

	if (ptLT(b, c)) {
		var temp = b;
		b = c;
		c = temp;
	}

	if (ptLT(a, b)) {
		var temp = a;
		a = b;
		b = temp;
	}

	// order the remaining points to find the least
	if (ptGT(c, b)) {
		var temp = b;
		b = c;
		c = temp;
	}

	if (ptGT(d, c)) {
		var temp = c;
		c = d;
		d = temp;
	}

	// order b and c (the middle)
	if (c.y < b.y) {
		var temp = b;
		b = c;
		c = temp;
	}
	
	points[a.index].label = 'A';
	points[b.index].label = 'B';
	points[c.index].label = 'C';
	points[d.index].label = 'D';
}

function ptLT(a, b) {
	return b.y < a.y || (a.y === b.y && b.x < a.x);
}

function ptGT(a, b) {
	return b.y > a.y || (b.y === a.y && b.x > a.x);
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