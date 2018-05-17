# Grayscale Binary Filter Example
#
# This script shows off the binary image filter. This script was originally a
# test script... but, it can be useful for showing how to use binary.

import pyb, sensor, image, math, time
from ScannerRect import ScannerRect

sensor.reset()
sensor.set_framesize(sensor.QQCIF)
sensor.set_pixformat(sensor.RGB565)
sensor.skip_frames(time=500)

scanner = ScannerRect(5, 7, 0, 0, 0)
img = None
# hand in eucr
#threshold = [67, 100, 0, 36, -2, 23]

# hand in room:
#threshold = [18, 62, 1, 64, -4, 38]

#toilet paper in dorm
threshold = [76, 100, -10, 22, -23, 30]

clock = time.clock()

def loopFcn(x, y):
    #img.set_pixel(x, y, (255, 0, 0))
    pix = img.get_pixel(x, y)
    if pix[2] != 0:
        pix = (pix[0], 0, 0)
        img.set_pixel(x, y, pix)

def sample(scanner, x, y, ang, image, step):
    count = 0
    total = 0
    xSum = 0
    ySum = 0
    def sampler(x, y):
        w = image.get_pixel(x,y)[0]
        newW = int(0.8*w)
        image.set_pixel(x, y, (newW, newW, newW))
        count += w
        total += 255
        xSum += x * w
        ySum += y * w
    scanner.scan(sampler, x, y, ang, image, step)
    if count == 0:
        count = 1
    if total == 0:
        total = 1
    xav = int(xSum/count)
    yav = int(ySum/count)
    image.set_pixel(xav, yav, (0, 255, 0))
    return (count, total, count/total, xSum/count, ySum/count)

print('starting')

while True:
    clock.tick()
    img = sensor.snapshot()
    img.binary([threshold])
    #scanner.scan(loopFcn, 20, 20, 0.7, img, 2)
    x = img.width()/2
    y = img.height()
    scanInfo = sample(scanner, x, y, -math.pi/2, img, 1)
    while scanInfo[0]/scanInfo[1] >  0.3:
        x1 = int(scanInfo[3])
        y1 = int(scanInfo[4])
        ang = math.atan2(y1 - y, x1 - x)
        x = x1
        y = y1
        scanInfo = sample(scanner, x, y, ang, img, 1)
    #print('Fill: {}'.format(scanInfo[0]/scanInfo[1]))
    #print('{}, {}'.format(int(scanInfo[3]), int(scanInfo[4])))
    #print()
    #sang = 0.0
    #while sang < 6.2:
        #scanner.scan(loopFcn, 50, 50, sang, img, 1)
        #sang += 0.5
    #print(clock.fps())
