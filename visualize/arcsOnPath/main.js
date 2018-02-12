const smoothN = 1;

var PI = Math.PI;
// var points = [{"x":199,"y":358},{"x":199,"y":281},{"x":264,"y":249},{"x":325,"y":286},{"x":323,"y":326},{"x":293,"y":375},{"x":240,"y":391},{"x":142,"y":395},{"x":113,"y":329},{"x":110,"y":255},{"x":77,"y":202},{"x":35,"y":237},{"x":29,"y":286}];

// a point is an object with x and y properies
var points = [];

// run at begining
function main() {
	// initialize the canvas
	fullscreenCanvas();

	// RED
	mainRegion.background = '#FF0000';
	fillBackground();

	// draw the first square
	drawImage();

	// draw the result square
	drawImage2();
}

function mouseMoved() {
	drawImage();
}

function mousePressed() {
	// add points to path
	if (mouseIsPressed &&
		mouseX < 500 &&
		mouseY < 500) {
		
		points.push({
			x: mouseX,
			y: mouseY
		});
	}
	drawImage();
	drawImage2();
}

// get properties of a circle passing through p0 and p1
// with initial direction of dir (radians)
function getCircleInfo(p0, p1, dir) {
	var dx = p1.x - p0.x;
	var dy = p1.y - p0.y;

	// rotate the points with dir along +x axis
	var ang = ArcTan(dx, dy);
	var cos = Math.cos(-dir);
	var sin = Math.sin(-dir);

	// find rotated x' and y'
	var xp = cos*dx - sin*dy;
	var yp = sin*dx + cos*dy;

	// center x' and y'
	var cxp = 0;
	var cyp = (xp*xp + yp*yp)/(2*yp);
	var r = cyp;

	// end direction
	var endDir = dir + PI/2 + ArcTan(xp, (yp*yp - xp*xp)/(2*yp));
	if (r < 0) {
		endDir += PI;
	}

	// rotate and shift center x' and y' back
	sin = -sin;
	var cx = p0.x + cos*cxp - sin*cyp;
	var cy = p0.y + sin*cxp + cos*cyp;

	// get start angles
	dx = p0.x - cx;
	dy = p0.y - cy;
	var a0 = ArcTan(dx, dy);

	// get end angle
	dx = p1.x - cx;
	dy = p1.y - cy;
	var a1 = ArcTan(dx, dy);

	// if r < 0, swap start and end
	if (r < 0) {
		var temp = a0;
		a0 = a1;
		a1 = temp;
	}

	// shift a1 up so it is larger than a0
	while (a0 > a1) {
		a1 += 2*PI;
	}

	// shift a1 down just above a0
	while (a1 > a0 + 2*PI) {
		a1 -= 2*PI;
	}

	// angle of middle of arc
	var ma = (a0 + a1)/2;
	if (r < 0) {
		ma += PI;
	}

	// direction at middle of arc
	var md = ma + PI/2;

	// get coords of middle of arc
	var mx = cx + r * Math.cos(ma);
	var my = cy + r * Math.sin(ma);

	// return an object with all the circle properties
	return {
		cx: cx,
		cy: cy,
		mx: mx,
		my: my,
		md: md,
		r: r,
		a0: a0,
		a1: a1,
		df: endDir
	};
}

// smooth the points beginning in direction dir
function nextPoints(pts, dir) {
	// copy pts
	var newPts = [];
	for (var p of pts) {
		newPts.push({x: p.x, y: p.y});
	}

	// do the computations
	var dirs = [];
	for (var i = 0; i < pts.length-2; i++) {
		// the first point gets the argument dir
		if (i === 0) {
			dirs.push(dir);
		}

		// current dir
		var d = dirs[i];

		// reference points for the arc
		var p0 = pts[i];
		var p1 = pts[i+2];

		// point in between p0 and p1 to shift
		var p3 = newPts[i+1];

		// get circle information
		var ci = getCircleInfo(p0, p1, d);

		// get the new next coord
		// midpoint between <ci.mx, ci.my> and p3
		p3.x = (ci.mx + p3.x)/2;
		p3.y = (ci.my + p3.y)/2;

		// use direction at center for next line
		dirs.push(ci.md);
	}

	return newPts;
}

// draw the resulting image
function drawImage2() {
	// create a new image
	var image = new DrawingRegion(500, 0, 500, 500);
	image.background = '#FFFFFF';
	image.fillBackground();

	// smooth the points starting in direction 3pi/2
	// 100 times
	var dir = 3*PI/2;
	var pts = smoothPoints(points, dir, smoothN);

	// draw the points
	image.stroke('#000000');
	for (var p of pts) {
		image.arc(p.x, p.y, 5, 0, 2*PI);
	}

	// draw the arcs connecting the points
	for (var i = 0; i < pts.length-1; i++) {
		var p0 = pts[i];
		var p1 = pts[i+1];

		// get info
		var ci = getCircleInfo(p0, p1, dir);
		dir = ci.df;

		// different colors for different directions
		if (ci.r > 0) {
			image.stroke('#000000');
		} else {
			image.stroke('#00FF00');
		}

		// draw the circle
		image.arc(ci.cx, ci.cy, Math.abs(ci.r), ci.a0, ci.a1);
	}

	image.draw();
}

// apply the smoothing function n times
function smoothPoints(pts, dir, n) {
	for (var i = 0; i < n; i++) {
		pts = nextPoints(pts, dir);
	}
	return pts;
}

function drawImage() {
	// create a new image to draw the points
	var image = new DrawingRegion(0, 0, 500, 500);
	image.background = '#FFFFFF';
	image.fillBackground();

	if (points.length === 0) {
		image.draw();
		return;
	}

	// var dir = 0.1;
	var dir = ArcTan(
		mouseX - points[0].x,
		mouseY - points[0].y
	);

	// draw the points
	image.fill('#000000');
	for (var p of points) {
		image.arc(p.x, p.y, 5, 0, 2*PI);
		// image.rect(p.x-5, p.y-5, 10, 10);
	}

	// draw the lines
	for (var i = 0; i < points.length-1; i++) {
		var p0 = points[i];
		var p1 = points[i+1];
		image.line(p0.x, p0.y, p1.x, p1.y);
	}

	// draw the arcs
	for (var i = 0; i < points.length-1; i++) {
		var p0 = points[i];
		var p1 = points[i+1];

		// get info
		var ci = getCircleInfo(p0, p1, dir);
		dir = ci.df;

		if (ci.r > 0) {
			image.stroke('#000000');
		} else {
			image.stroke('#00FF00');
		}

		// image.arc(ci.cx, ci.cy, Math.abs(ci.r), ci.a0, ci.a1);
		// // image.arc(ci.cx, ci.cy, 5, 0, 2*PI);
		// image.arc(ci.mx, ci.my, 5, 0, 2*PI);

		// image.stroke('#FF0000');
		// image.line(ci.mx, ci.my, ci.mx + 20*Math.cos(ci.md), ci.my + 20*Math.sin(ci.md))
	}

	// draw the directions at each point
	if (points.length > 0) {
		var p0 = points[points.length-1];
		image.stroke('#42d9f4');
		// image.line(p0.x, p0.y, p0.x + 50*Math.cos(dir), p0.y + 50*Math.sin(dir));
	}

	image.draw();
}