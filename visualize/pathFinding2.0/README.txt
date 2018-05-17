This is a javascript program to visualize line detection algorithms.

To run:
	simply open index.html using your favorite web browser.

To make a path:
	Click and drag on the white square in the top left. A path will appear in the square to the right.

What is the square on the bottom?
	If your screen is tall enough, you will see a square with gradient coloring. If you use your mouse, you will see a yellow band.

	This is a visualizer for the function that chooses the next point in the path. It favors points that are close with a small angle difference. The yellow band shows all points with equal deltas.

	See the delta() function in main.js for more details.


How the Path Finding works
1. Get points from pixel data
	Go through the image pixel by pixel until a black pixel is found
		Average all surrounding black pixels in a square into a single result pixel
	This returns a list of (x, y) points

2. Select points to make a path
	This uses a cost function to choose points that are close and in a similar direction as the previous points.
	Starting at (250, 0) bottom center, find the point with the lowest cost.
		if the cost is greater than a threshold, the line is finished

TODO
	better performance at intersections
	handling paths that do no start at the bottom center
		if the car is off the line