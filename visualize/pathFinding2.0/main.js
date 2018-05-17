var image = null;
var hm = null;

var points = [{x: 250, y: 499}];

function main() {
	fullscreenCanvas();

	mainRegion.background = '#FF0000';
	fillBackground();

	image = new DrawingRegion(0, 0, 500, 500);
	image.background = '#FFFFFF';
	image.fillBackground();

	image.draw();

	makeHeatMap();
}

function mouseMoved() {
	if (mouseIsPressed &&
		mouseX < 500 &&
		mouseY < 500) {
		
		image.fill('#000000');
		image.rect(mouseX, mouseY, 10, 10);
		image.draw();

		average(image, 200);
	}

	if (0 <= mouseX && mouseX < 500 &&
		500 <= mouseY && mouseY < 1000) {
		drawTrace(mouseX, mouseY - 500);
	}
}

function findFirst(image) {
	points = [{x: 250, y: 499}];

	var overlay = new DrawingRegion(0, 0, 500, 500);

	var overlayID = overlay.ctx.createImageData(500, 500);
	var ovData = overlayID.data;

	var data = image.data;
	var midX = 250;

	for (var r = 1; r < 50; r++) {
		// pr('r = ' + r);
		// search vertical
		var x = midX + r - 1;
		var y = 499;

		var stop = false;

		while (x !== midX - r + 1 || y !== 500) {
			// pr(x + ', ' + y);
			// handle data
			var i = 4*x + 2000*y;
			// pr(data[i]);

			ovData[i] = 0;
			ovData[i+1] = 255;
			ovData[i+2] = 0;
			ovData[i+3] = 255;

			if (data[i] === 0) {
				
				var sr = 10;
				var minX = Math.max(0, x - sr);
				var maxX = Math.min(500, x + sr);
				var minY = Math.max(0, y - sr);
				var maxY = Math.min(500, y + sr);

				var blackCount = 0;
				for (var x1 = minX; x1 < maxX; x1++) {
					for (var y1 = minY; y1 < maxY; y1++) {
						var i1 = 4*x1 + 2000*y1;
						if (data[i1] === 0) {
							blackCount++;
						}
						ovData[i1] = 255;
						ovData[i1+1] = 0;
						ovData[i1+2] = 0;
						ovData[i1+3] = 255;
					}
				}
				pr('black found at ' + x + ', ' + y + ' with ' + blackCount + ' nearby.');
				
				var iter = 0;
				while (!stop && (iter++) < 1000) {
					// loop around and find average x and y
					var x1 = minX;
					var y1 = minY;
					var ax = 0;
					var ay = 0;
					var count = 0;
					var dir = 0;
					while (dir !== 4) {
						var i1 = 4*x1 + 2000*y1;
						if (data[i1] === 0) {
							count ++;
							ax += x1;
							ay += y1;
							ovData[i1] = 0;
							ovData[i1+1] = 255;
							ovData[i1+2] = 255;
							ovData[i1+3] = 255;
						}

						if (dir === 0) {
							x1++;
							if (x1 === maxX) {
								x1--;
								dir = 1;
							}
						}
						if (dir === 1) {
							y1++;
							if (y1 === maxY) {
								y1--;
								dir = 2;
							}
						}
						if (dir === 2) {
							x1--;
							if (x1 <= minX) {
								x1 = minX
								dir = 3;
							}
						}
						if (dir === 3) {
							y1--;
							if (y1 <= minY) {
								dir = 4;
							}
						}
					}

					for (var x2 = minX; x2 < maxX; x2++) {
						for (var y2 = minY; y2 < maxY; y2++) {
							var i2 = 4*x2 + 2000*y2;
							data[i2] = 255;
							data[i2+1] = 255;
							data[i2+2] = 255;
							data[i2+3] = 255;
						}
					}

					if (count < 5) {
						stop = true;
						break;
					}

					// calculate average
					x1 = Math.round(ax/count);
					y1 = Math.round(ay/count);

					points.push({x: x1, y: y1});

					minX = Math.max(0, x1 - sr);
					maxX = Math.min(500, x1 + sr);
					minY = Math.max(0, y1 - sr);
					maxY = Math.min(500, y1 + sr);

					x1 = minX;
					y1 = minY;
				}
				


				stop = true;
				break;
			}

			if (stop) {
				break;
			}

			// move (x, y)
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
			} else {
				pr('invalid point: ' + x + ', ' + y);
				return;
			}
		}
		if (stop) {
			break;
		}
	}

	// draw the overlay
	overlay.ctx.putImageData(overlayID, 0, 0);
	overlay.stroke('#FF0000');
	// overlay.line(0, 400, 500, 500);
	overlay.draw();
}

function mousePressed() {
	if (mouseIsPressed &&
		mouseX < 500 &&
		mouseY < 500) {
		
		image.fill('#000000');
		image.rect(mouseX, mouseY, 10, 10);
		image.draw();

		average(image, 200);
	}
}

function smooth(x) {
	return x*x*x*x + 1;
}

// find the delta from point 0 to point 1
// with direction dir (radians)
function delta(p0, p1, dir) {
	var dx = p1.x - p0.x;
	var dy = p1.y - p0.y;

	var dAng = dTheta(ArcTan(dx, dy), dir);
	var dist = Math.sqrt(dx*dx+dy*dy);

	return 200*Math.abs(dAng*dAng*dAng) + dist;
	// return smooth(10*dAng)*smooth(0.015*dist);
}

function dTheta(t0, t1) {
	var dt = (t1 - t0) % (2*Math.PI);
	if (dt > Math.PI) {
		dt -= 2*Math.PI;
	} else if (dt < -Math.PI) {
		dt += 2*Math.PI;
	}

	return dt;
}

function drawTrace(x0, y0) {
	var cvs = new DrawingRegion(0, 500, 500, 500);

	var id = cvs.ctx.createImageData(500, 500);
	var data = id.data;

	var hData = hm.ctx.getImageData(0, 0, 500, 500).data;
	var test = hData[4*x0 + 2000*y0];

	for (var x = 0; x < 500; x++) {
		for (var y = 0; y < 500; y++) {
			var i = 4*x + 2000*y;
			if (Math.abs(hData[i] - test) < 1) {
				data[i] = 255;
				data[i+1] = 255;
				data[i+3] = 255;
			}
		}
	}

	cvs.ctx.putImageData(id, 0, 0);
	cvs.fill('#FFFFFF');
	cvs.text(delta({x: 250, y: 250}, {x: x0, y: y0}, 3*Math.PI/2), 10, 30);

	hm.draw();
	cvs.draw();
}

function makeHeatMap() {
	var cvs = new DrawingRegion(0, 500, 500, 500);
	hm = cvs;
	cvs.background = '#FFFFFF';
	cvs.fillBackground();
	var dir = 3*Math.PI/2;
	var x0 = 250;
	var y0 = 250;

	var maxD = null;
	for (var x = 0; x < 500; x++) {
		for (var y = 0; y < 500; y++) {
			var testD = delta(
				{x: x0, y: y0},
				{x: x, y: y},
				dir
			);

			if (maxD === null || testD > maxD) {
				maxD = testD;
			}
		}
	}

	// maxD = Math.log(maxD);
	maxD = Math.pow(maxD, 1);

	var imageData = cvs.ctx.getImageData(0, 0, 500, 500);
	var data = imageData.data;

	for (var x = 0; x < 500; x++) {
		for (var y = 0; y < 500; y++) {
			var i = 4*x + 500*4*y;
			var testD = delta(
				{x: x0, y: y0},
				{x: x, y: y},
				dir
			);

			// testD = 256 * Math.log(testD) / maxD;
			testD = 256 * Math.pow(testD, 1) / maxD;
			testD = Math.round(testD);
			testD = Math.max(0, testD);
			testD = Math.min(255, testD);

			data[i] = testD;
			data[i+1] = testD;
			data[i+2] = testD;
		}
	}

	cvs.ctx.putImageData(imageData, 0, 0);
	cvs.draw();
}

function average(image, limit) {
	var t0 = performance.now();

	var newRegion = new DrawingRegion(500, 0, 500, 500);
	newRegion.stroke('#000000');

	// get the old image data
	var imageData = image.ctx.getImageData(0, 0, 500, 500);

	findFirst(imageData);

	newRegion.background = '#FFFFFF';
	newRegion.fillBackground();

	for (var i = 0; i < points.length - 1; i++) {
		var p0 = points[i];
		var p1 = points[i+1];
		newRegion.line(p0.x, p0.y, p1.x, p1.y);
	}

	newRegion.draw();
}