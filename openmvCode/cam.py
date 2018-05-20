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
time.sleep(500)

scanner = ScannerRect(6, 9, 0, 0, 0)
img = None
# hand in eucr
#threshold = [67, 100, 0, 36, -2, 23]

# hand in room:
#threshold = [18, 62, 1, 64, -4, 38]

#toilet paper in dorm
threshold = [76, 100, -10, 22, -23, 30]

# all white
# threshold = [0, 100, -128, 127, -128, 127]

clock = time.clock()

def getFirstPoint(img, sh = 15, sw = 20, skip = 5):

    # remember if the first point has been found
    firstFound = False

    midX = round(img.width()/2)

    y = img.height() - 1
    for y in range(img.height()-1,img.height()-1-sh,-skip):
        for i in range(1,sw+1,skip):
            for x in [midX - i,midX + i]:
                s = img.get_pixel(x, y)
                if s[0] == 255:
                    if not firstFound:
                        firstFound = True
                        return (x,y)
    return (None,None)
    for x in range(midX - sw + 1, midX + sw):
        print(x,y)
        s = img.get_pixel(x, y)
        if s[0] == 255:
            if not firstFound:
                firstFound = True
                return (x,y)
        if x < midX:
            y -= 1
        else:
            y += 1

    return (None, None)
    for i in range(1,sw+1,skip):
        y = img.height() - 1
        while y > img.height() - 1 - sw + i:
            for x in [midX - i, midX + i]:
                s = img.get_pixel(x, y)
                if s[0] == 255:
                    if not firstFound:
                        # img.set_pixel(x,y,(254,0,0))
                        firstFound = True
                        return (x,y)
                    else:
                        pass
                        # img.set_pixel(x,y,(0, 255, 0))
                else:
                    pass
                    # img.set_pixel(x,y,(0, 0, 255))
            y -= skip
    # if control flow reaches here, no intial point found
    return (None,None)



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
        newW = int(0.5*w)
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
    # image.set_pixel(xav, yav, (0, 255, 0))
    return (count, total, count/total, xSum/count, ySum/count)

def sampleMulti(scanners,x,y,ang,image,step,scale):
    # scale the step
    step = math.ceil(step*scale)

    res = [None]*(len(scanners)+1)
    newScanners = [None]*len(scanners)
    for i in range(len(scanners)):
        newScanners[i] = ScannerRect(
            math.ceil(scanners[i].w * scale),
            math.ceil(scanners[i].h * scale),
            math.ceil(scanners[i].x * scale),
            math.ceil(scanners[i].y * scale),
            scanners[i].ang
        )
    count = 0
    total = 0
    xSum = 0
    ySum = 0
    for i in range(len(newScanners)):
        res[i] = sample(newScanners[i],x,y,ang,image,step)
        count += res[i][0]
        total += res[i][1]
        xSum += res[i][3]*res[i][0]
        ySum += res[i][4]*res[i][0]
    res[-1] = (count, total, count/total, xSum/count, ySum/count)
    return res

# linear function to make scan rects smaller in the distance
def scannerScale(y,h):
    return (1-2/9)/h*y+2/9

print('starting')

ang = 0

while True:
    # print("Looping")
    clock.tick()
    img = sensor.snapshot()
    img.binary([threshold])

    scanners = [
         ScannerRect(6,9,0, 0,0),
         ScannerRect(2,4,3,-5,0),
         ScannerRect(2,4,3, 5,0)
    ]

    # sample(ScannerRect(0,0,0,0,0),img.width()/2,img.height()/2,ang,img,1)
    # ang += 0.1
    # time.sleep(500)
    # continue

    endScanners = [
        ScannerRect(8,25,0,20,0),
        ScannerRect(8,25,0,-20,0)
    ]

    if False:
        x = img.width()/2
        y = img.height()
        sampleMulti(scanners,x,y,-math.pi/2,img,1,1)
        continue

    #scanner.scan(loopFcn, 20, 20, 0.7, img, 2)
    x, y = getFirstPoint(img, sw = math.floor(img.width()/2))
    # make sure there is an initial point
    if not x: continue

    path = []
    ended = False
    #x = img.width()/2
    #y = img.height()/2
    scale = scannerScale(y, img.height())
    scanRes = sampleMulti(scanners,x,y,-math.pi/2,img,2,scale)

    while scanRes[-1][1] >  255*3:
        path.append([x,y])
        x1 = int(scanRes[-1][3])
        y1 = int(scanRes[-1][4])
        ang = math.atan2(y1 - y, x1 - x)

        # test for end
        endScanRes = sampleMulti(endScanners,x,y,ang,img,2,scale)
        img.draw_line(x,y,x1,y1,(0,255,0))
        # print(endScanRes[-1][2])
        if endScanRes[-1][2] > 0.35:
            print('ended')
            img.draw_circle(x,y,5,(255,0,0))
            ended = True
            break

        x = x1
        y = y1
        scale = scannerScale(y, img.height())
        #print(scale)
        scanRes = sampleMulti(scanners,x,y,ang,img,2,scale)
        #path.append([x,y])

    #for p in path:
        #img.draw_circle(p[0],p[1],5,(0,255,0))
    print(path)
    print(ended)
    #print('Fill: {}'.format(scanInfo[0]/scanInfo[1]))
    #print('{}, {}'.format(int(scanInfo[3]), int(scanInfo[4])))
    #print()
    #sang = 0.0
    #while sang < 6.2:
        #scanner.scan(loopFcn, 50, 50, sang, img, 1)
        #sang += 0.5
    #print(clock.fps())

# sample data
# [[43, 71], [44, 66], [46, 62], [48, 58], [50, 54], [52, 49], [55, 45], [56, 41], [58, 38], [59, 35], [61, 32], [62, 28], [62, 25], [61, 23], [58, 22], [55, 22], [52, 21], [48, 20], [44, 20], [41, 19], [38, 18], [35, 17], [32, 16], [29, 14], [27, 13], [25, 13], [24, 13]]