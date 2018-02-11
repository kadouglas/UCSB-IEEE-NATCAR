var image = null;
var hm = null;

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

	var points = [{x: 250, y: 499}];

	var searchR = 20;

	var newRegion = new DrawingRegion(500, 0, 500, 500);
	newRegion.stroke('#000000');

	// get the old image data
	var imageData = image.ctx.getImageData(0, 0, 500, 500);

	// make the new image
	newImage = newRegion.ctx.createImageData(500, 500);

	// array of pixels: [r0, g0, b0, a0,  r1, g1, b1, a1, ...]
	var data = imageData.data;
	var newData = newImage.data;

	// initialize to white
	for (var x = 0; x < 500; x++) {
		for (var y = 0; y < 500; y++) {
			var i = 4*x + 500*4*y;
			newData[i] = 255;
			newData[i+1] = 255;
			newData[i+2] = 255;
			newData[i+3] = 255;
		}
	}

	t0 = performance.now();

	for (var x = 0; x < 500; x++) {
		for (var y = 0; y < 500; y++) {
			var i = 4*x + 500*4*y;

			// if square is black
			if (data[i] === 0) {
				var sx = 0;
				var sy = 0;
				var count = 0;

				// loop in square
				var minX = Math.max(0, x - searchR);
				var maxX = Math.min(500, x + searchR);
				var minY = Math.max(0, y - searchR);
				var maxY = Math.min(500, y + searchR);
				for (var x1 = minX; x1 < maxX; x1++) {
					for (var y1 = minY; y1 < maxY; y1++) {
						var i1 = 4*x1 + 500*4*y1;

						// // mark searched area
						// if (data[i1] === 255) {
						// 	newData[i1+1] = 0;
						// }

						// check if other square is black
						if (data[i1] === 0) {
							sx += x1;
							sy += y1;
							count++;
							// set to white once searched
							data[i1] = 255;
						}
					}
				}
				sx = Math.round(sx/count);
				sy = Math.round(sy/count);
				var i2 = 4*sx + 500*4*sy;

				newData[i2] = 0;
				newData[i2+1] = 0;
				newData[i2+2] = 0;

				points.push({x: sx, y: sy});
			}
		}
	}

	var dt = Math.round(1000*(performance.now() - t0))/1000;
	pr('Time: ' + dt + ' ms');

	newRegion.ctx.putImageData(newImage, 0, 0);

	// pr(points);

	// find adjacent points
	var dir = 3*Math.PI/2;
	var p = points[0];
	var chosen = [];
	var chosenCount = 1;
	for (var i in points) {
		chosen.push(false);
	}
	chosen[0] = true;
	while (chosenCount < points.length) {
		var minD = null;
		var minI = null;
		for (var i in points) {
			if (!chosen[i]) {
				var p1 = points[i];
				var testD = delta(p, p1, dir);
				if (minD === null || testD < minD) {
					minD = testD;
					minI = i;
				}
			}
		}

		if (minD > limit) {
			break;
		}

		var p1 = points[minI];
		chosen[minI] = true;
		chosenCount++;
		dir = ArcTan(p1.x - p.x, p1.y - p.y);
		newRegion.line(p.x, p.y, p1.x, p1.y);
		p = p1;
	}

	var dt = Math.round(1000*(performance.now() - t0))/1000;
	pr('Time: ' + dt + ' ms');

	newRegion.draw();

	var dt = Math.round(1000*(performance.now() - t0))/1000;
	pr('Time: ' + dt + ' ms');
}