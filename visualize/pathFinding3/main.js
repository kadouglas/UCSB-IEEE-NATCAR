var image;

function main() {
	fullscreenCanvas();

	mainRegion.background = '#FF0000';
	fillBackground();

	image = new DrawingRegion(0, 0, 500, 500);
	image.background = '#FFFFFF';
	image.fillBackground();

	image.draw();
}

function mouseMoved() {
	if (mouseIsPressed &&
		mouseX < 500 &&
		mouseY < 500) {
		
		image.fill('#000000');
		image.rect(mouseX, mouseY, 10, 10);
		image.draw();

		var res = getFirstPoint(image.getImageData());
		if (res === undefined) {
			pr('no point found');
		} else {
			pr('First black at ' + res.x + ', ' + res.y);
		}
	}
}

function getFirstPoint(imData) {
	// constants
	const maxR = 50;
	const minBlackCount = 10;
	const yShift = 4*imData.width;

	var midX = Math.round(imData.width/2);

	var data = imData.data;

	for (var r = 1; r < maxR; r++) {
		// initial coords
		var x = midX + r - 1;
		var y = imData.height - 1;

		var stop = false;

		while (x !== midX - r + 1 || y !== 500) {
			var i = 4*x + yShift*y;

			if (data[i] === 0) {
				return {x: x, y: y};
			}

			// shift x and y
			// up
			if (x === midX + r - 1 && y !== 500 - r) {
				y--;
			}
			// left
			else if (y === 500-r && x !== midX - r + 1) {
				x--;
			}
			// down
			else if (y !== 500 && x === midX - r + 1) {
				y++;
			}
		}
	}

	// if control flow reaches here, no black points found within radius
	return undefined;
}

// starting from a coord and direction, scan pixels in image
// and get coords and direction of next rect
function getNextScanInfo(x0, y0, dx, dy) {
	
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