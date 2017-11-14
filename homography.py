# Untitled - By: Caio - Wed Oct 5 2016

import sensor, time, image
from pyb import UART

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QQVGA)
sensor.set_vflip(True)
sensor.set_hmirror(True)
sensor.set_gainceiling(8)
sensor.set_gain_ctrl(False)
sensor.set_whitebal(False) # turn this off.
sensor.skip_frames(10)
clock = time.clock() # Tracks FPS.
LINE_THRESHOLD = [(75, 90  , -10, 40, 40, 70)] #tracks white line
#GRAY_THRESHOLD = [(230, 255)] #tracks white line
# homographic matrix values
# probably should put this in an array at some point
a = .250768
b = 0.13445
c = -13.445
d = 0.00917
e = -0.351188
f = 43.9152
g = 0.0018624
h = 0.0149138

#uart = UART(3, 115200)
def go():
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
		#merged_blobs = img.find_markers(blobs)
		for num, blob in enumerate(blobs):
			img.draw_cross(blob[5], blob[6], color=(230,0,0))
			oldX = blob[5]
			oldY = blob[6]
			newX = int((a*oldX + b*oldY + c)/(g*oldX + h*oldY + 1))
			newY = int((d*oldX + e*oldY + f)/(g*oldX + h*oldY + 1))
			img.draw_cross(60+(4*newX), 80-(2*newY), color=(0,230,0))
			#print (newX, newY)
		print(clock.fps())
		#print("frame")


if __name__ == '__main__':
	go()
