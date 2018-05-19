# Untitled - By: Brandon - Sat May 19 2018

import sensor, image, time

MARKER_COLOR = (0, 100, 45, 80, 3, 127)
H = [0.08173215, -0.0002718484, -10.88698, -0.006786823, -0.05773451, 26.08641, -0.0005937629, 0.01044543]

def convertToPlane(x,y):
    X = (H[0]*x+H[1]*y+H[2])/(H[6]*x+H[7]*y+1)
    Y = (H[3]*x+H[4]*y+H[5])/(H[6]*x+H[7]*y+1)
    return([X,Y])

sensor.reset()
sensor.set_pixformat(sensor.RGB565)
sensor.set_framesize(sensor.QVGA)
sensor.skip_frames(time = 2000)

clock = time.clock()

while(True):
    clock.tick()
    img = sensor.snapshot()
    blobs = img.find_blobs([MARKER_COLOR],pixels_threshold = 5)
    for blob in blobs:
        img.draw_rectangle(blob.rect())
        print(convertToPlane(blob.cx(),blob.cy()))
    print(clock.fps())
