import math


class ScannerRect:
    def __init__(self, w, h, x, y, ang):
        self.w = w
        self.h = h
        self.x = x
        self.y = y
        self.ang = ang
    def scan(self, fcn, x, y, ang, image, step):
        totalAng = ang + self.ang
        minX = 0
        minY = 0
        maxX = image.width() - 1
        maxY = image.height() - 1
        cosa = math.cos(totalAng)
        sina = math.sin(totalAng)
        x0 = self.x * cosa - self.y * sina
        y0 = self.x * sina + self.y * cosa
        x0 += x
        y0 += y
        wx = -sina * self.w / 2
        wy = cosa * self.w / 2
        lx = cosa * self.h
        ly = sina * self.h
        pts = [
            (round(x0 + wx), round(y0 + wy)),
            (round(x0 - wx), round(y0 - wy)),
            (round(x0 - wx + lx), round(y0 - wy + ly)),
            (round(x0 + wx + lx), round(y0 + wy + ly))
        ]
        ys = [0]*4;
        minI = 0
        for i in range(len(pts)):
            ys[i] = pts[i][1]
            if pts[i][1] < pts[minI][1]:
                minI = i
        newPts = [
            pts[(minI + 0)%4],
            pts[(minI + 1)%4],
            pts[(minI + 2)%4],
            pts[(minI + 3)%4]
        ];
        pts = newPts
        for p in pts:
            print(p[0],p[1])
        ys.sort()
        ymin = max(minY, ys[0])
        ymax = min(maxY, ys[3])
        li = 0
        lm = getM(pts[li],pts[li+1])
        ri = 0
        rm = getM(pts[ri],pts[ri-1])
        for y in range(ymin, ymax+1, step):
            # find the right line
            while y > pts[ri+1][1] or rm == None:
                ri += 1
                rm = getM(pts[ri],pts[ri+1])

            # find the left line
            while y > pts[li-1][1] or lm == None:
                li += 1
                lm = getM(pts[ri],pts[ri-1])

            lx = math.floor(pts[li][0] + lm * (y - pts[li][1]))
            rx = math. ceil(pts[ri][0] + rm * (y - pts[ri][1]))
            # do the loop
            for x in range(lx, rx + 1, step):
                fcn(x, y)

s = ScannerRect(10,20,0,0,0)
print(s)