# Untitled - By: Caio - Wed Oct 5 2016

import sensor, time, image
from pyb import UART

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QQVGA    )
sensor.set_vflip(True)
sensor.set_hmirror(True)
sensor.set_gainceiling(8)
sensor.set_gain_ctrl(False)
sensor.set_whitebal(False) # turn this off.
sensor.skip_frames(10)
clock = time.clock() # Tracks FPS.
LINE_THRESHOLD = [(30, 60 , -5, 20, -10, 5)] #tracks white line
#GRAY_THRESHOLD = [(230, 255)] #tracks white line
# homographic matrix values
# probably should put this in an array at some point
a = .837491820
b = .0646236008
c = -73.0893694
d = -.0173227539
e = -1.22237241
f = 118.641051
g = 0.000921610422
h = 0.0561229486

uart = UART(3, 115200)

while(True):
	clock.tick() # Track elapsed milliseconds between snapshots().
	img = sensor.snapshot()
	#img.find_edges(image.EDGE_CANNY, threshold=(50, 80))
	blobs = []
	for k in range(0, 30, 6):
		blobs = blobs + img.find_blobs(LINE_THRESHOLD, roi=(0, k, 320, 6))
		#img.draw_rectangle((0, k, 320, 6))
	for k in range(30, 120, 24):
		blobs = blobs + img.find_blobs(LINE_THRESHOLD, roi=(0, k, 320, 24))
		#img.draw_rectangle((0, k, 320, 6))
	merged_blobs = img.find_markers(blobs)
	print("blobs")


	for num, blob in enumerate(merged_blobs):
		img.draw_cross(blob[5], blob[6], color=(230,0,0))
		oldX = blob[5]
		oldY = blob[6]
		newX = int((a*oldX + b*oldY + c)/(g*oldX + h*oldY + 1))
		newY = int((d*oldX + e*oldY + f)/(g*oldX + h*oldY + 1))
		#uart.write(str(newX, newY))
		print (oldX, oldY)

	#blobs = img.find_blobs(LINE_THRESHOLD)
	#keypoints = img.find_keypoints(normalized=True)
	#print(keypoints)
	#if keypoints:
	#	img.draw_keypoints(keypoints)
	#print (len(blobs))
	#for blob in blobs:
	#	img.draw_rectangle(blob[0:4])

	#img.find_edges(image.EDGE_CANNY, threshold=(50, 80))  # Find edges
	#lines = img.find_lines(threshold=30) # Find lines.
	#for l in lines: img.draw_line(l, color=(127)) # Draw lines

	#print(clock.fps()) # Note: Your OpenMV Cam runs about half as fast while
	# connected to your computer. The FPS should increase once disconnected.
