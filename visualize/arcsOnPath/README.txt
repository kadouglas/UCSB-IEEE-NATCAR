This folder is for displaying the smoothing function.

To run, open index.html using your favorite web browser.

To change the smoothing power, change smoothN in main.js.

The smoothing function is nextPoints().

Smoothing function
	Imagine 4 points (a, b, c, d) that make a path with some initial direction.
	We can make an circle from a to c with a circle startig with the initial direction.
	For a nice path, point b would be at the mid-arc between a and c, so move b towards the midpoint.
	We can then make an arc from b to d with initial direction from the mid-arc between a and c.
	Ideally, c would be at the mid-arc between b and d so move c halfway to the mid-arc point.

	Repeat until line seems smooth enough.