
import sensor, image, time, sys
MARKER_COLOR = (0, 100, 20, 82, 3, 127)
# IEEE_NIGHT_MARKER_COLOR = (0, 100, 18, 127, -5, 127)
REAL_POINTS = [-4,-4,4,4,10,18,18,10]

print("Starting")

def ToReducedRowEchelonForm(M):
    #print("Got to reducing matrix")
    if not M: return
    lead = 0
    rowCount = len(M)
    columnCount = len(M[0])
    for r in range(rowCount):
        if lead >= columnCount:
            return
        i = r
        while M[i][lead] == 0:
            i += 1
            if i == rowCount:
                i = r
                lead += 1
                if columnCount == lead:
                    return
        M[i],M[r] = M[r],M[i]
        lv = M[r][lead]
        M[r] = [ mrx / float(lv) for mrx in M[r]]
        for i in range(rowCount):
            if i != r:
                lv = M[i][lead]
                M[i] = [ iv - lv*rv for rv,iv in zip(M[r],M[i])]
        lead += 1
    print("Reduced matrix")

def solveHomography(a):
    print("Got to solving Homography")
    x1,x2,x3,x4,y1,y2,y3,y4,X1,X2,X3,X4,Y1,Y2,Y3,Y4 = a
    Ab = [[x1, y1, 1, 0, 0, 0, -x1*X1, -y1*X1,X1],
        [x2, y2, 1, 0, 0, 0, -x2*X2, -y2*X2,X2],
        [x3, y3, 1, 0, 0, 0, -x3*X3, -y3*X3,X3],
        [x4, y4, 1, 0, 0, 0, -x4*X4, -y4*X4,X4],
        [0, 0, 0, x1, y1, 1, -x1*Y1, -y1*Y1,Y1],
        [0, 0, 0, x2, y2, 1, -x2*Y2, -y2*Y2,Y2],
        [0, 0, 0, x3, y3, 1, -x3*Y3, -y3*Y3,Y3],
        [0, 0, 0, x4, y4, 1, -x4*Y4, -y4*Y4,Y4]]

    ToReducedRowEchelonForm(Ab)
    #time.sleep(100)
    print("Matrix reduced")
    #time.sleep(1000)
    s = [x[8] for x in Ab]
    print(s)
    #uio.open("calibrated_values.txt","w").write(str(s))

#solveHomography(-1,1,-1,1,-1,-1,1,1,-1,1,-1,1,-1,-1,1,1)


def findCalibPoints():
    sensor.reset()
    sensor.set_pixformat(sensor.RGB565)
    sensor.set_framesize(sensor.QVGA)
    #sensor.set_auto_gain(False) # must be turned off for color tracking
    #sensor.set_auto_whitebal(False) # must be turned off for color tracking
    sensor.skip_frames(time = 1500)
    time.sleep(2000)
    img = sensor.snapshot()
    blobs = img.find_blobs([MARKER_COLOR],pixels_threshold = 5)
    while len(blobs) != 4:
        img = sensor.snapshot()
        blobs = img.find_blobs([MARKER_COLOR],pixels_threshold = 5)

    print("Found 4 points")
    blobs.sort(key = lambda x: x.cx())
    print("Points sorted")
    # blobs are now sorted so that 0: ll, 1: ul, 2: ur, 3: lr
    return([blobs[0].cx(),blobs[1].cx(),blobs[2].cx(),blobs[3].cx(),blobs[0].cy(),blobs[1].cy(),blobs[2].cy(),blobs[3].cy()])



imageArray = findCalibPoints()
solveHomography(imageArray + REAL_POINTS)


print("Done")
