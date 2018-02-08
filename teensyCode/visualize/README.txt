This is a javascript program to visualize line detection algorithms.

To run:
	simply open index.html using your favorite web browser.

To make a path:
	Click and drag on the white square in the top left. A path will appear in the square to the right.

What is the square on the bottom?
	If your screen is tall enough, you will see a square with gradient coloring. If you use your mouse, you will see a yellow band.

	This is a visualizer for the function that chooses the next point in the path. It favors points that are close with a small angle difference. The yellow band shows all points with equal deltas.

	See the delta() function in main.js for more details.