// holds positional informatin for a rectangle to scan pixels
// w: width
// h: height
// x: x offset of the middle of the lower edge of the rect
// y: y offset from the middle of the lower edge of the rect
// ang: angle of rotation

// order of transformations:
// 1. x, y
// 2. rotate
class ScannerRect {
    constructor(w, h, x, y, ang) {
        this.w = w;
        this.h = h;
        this.x = x;
        this.y = y;
        this.ang = ang;
    }
    scan(fcn, x, y, ang, image) {
        var totalAng = ang + this.ang;

        var minX = 0;
        var minY = 0;
        var maxX = image.w - 1;
        var maxY = image.h - 1;

        // calculate reference x and y
        var cosa = Math.cos(totalAng);
        var sina = Math.sin(totalAng);
        var x0 = this.x * cosa - this.y * sina;
        var y0 = this.x * sina + this.y * cosa;

        // translate
        x0 += x;
        y0 += y;

        var wx = -cosa * w / 2;
        var wy = sina * w / 2;

        var lx = cosa * h;
        var ly = sina * h;

        // ordered counterclockwise
        var pts = [
            {
                x: x0 + wx,
                y: y0 + wy
            },
            {
                x: x0 - wx,
                y: y0 - wy
            },
            {
                x: x0 - wx + lx,
                y: y0 - wy + ly
            },
            {
                x: x0 + wx + lx,
                y: y0 + wy + ly
            }
        ];

        // round the points
        for (var p of pts) {
            p.x = Math.round(p.x);
            p.y = Math.round(p.y);
        }

        // Find the index of point with the lowest y
        // Don't care if there is a tie
        var minI = 0;
        for (var i = 1; i < 4; i++) {
            if (pts[i].y < pts[minI].y) {
                minI = i;
            }
        }

        // cycle the points to be ordered with lowest y first
        var newPts = [];
        newPts[0] = pts[(minI + 0)%4];
        newPts[1] = pts[(minI + 1)%4];
        newPts[2] = pts[(minI + 2)%4];
        newPts[3] = pts[(minI + 3)%4];
        pts = newPts;

        // get an array of y values
        var ys = [];
        for (var p of pts) {
            ys.push(p.y);
        }
        ys.sort(function(a, b) {return a - b;});

        // calculate lines
        var lu = getLine(pts[0], pts[3]);
        var ll = getLine(pts[3], pts[2]);
        var ru = getLine(pts[0], pts[1]);
        var rl = getLine(pts[1], pts[2]);

        // get min and max y values
        // var ymin = Math.max(ys[0], minY);
        // var ymax = Math.min(ys[3], maxY);
        var ymin = Math.min(maxY, Math.max(minY, ys[0]));
        var ymax = Math.min(maxY, Math.max(minY, ys[3]));

        // mode refers to the potion of the rectangle to use
        // 0: upper
        // 1: middle
        // 2: lower
        var mode = 0;

        // loop over y values
        for (var y = ymin; y <= ymax; y++) {
            while (y >= ys[mode+1]) {
                mode++;
            }

            // left and right x for current y
            var lx, rx;
            if (mode === 0) {
                lx = Math.floor(lu.x0 + lu.m * (y - lu.y0));
                rx = Math.ceil(ru.x0 + ru.m * (y - ru.y0));
            } else if (mode === 1) {
                if (pts[1].y > pts[3].y) {
                    lx = Math.floor(ll.x0 + ll.m * (y - ll.y0));
                    rx = Math.ceil(ru.x0 + ru.m * (y - ru.y0));
                } else {
                    lx = Math.floor(lu.x0 + lu.m * (y - lu.y0));
                    rx = Math.ceil(rl.x0 + rl.m * (y - rl.y0));
                }
            } else if (mode === 2) {
                lx = Math.round(ll.x0 + ll.m * (y - ll.y0));
                rx = Math.round(rl.x0 + rl.m * (y - rl.y0));
            }

            // round the x values
            lx = Math.max(lx, minX);
            rx = Math.min(rx, maxX);
            // lx = Math.min(maxX, Math.max(minX, lx));
            // rx = Math.min(maxX, Math.max(minX, rx));

            // execute the function over the points
            for (var x = lx; x <= rx; x++) {
                fcn(x, y);
            }
        }
    }
}

class Scanner {
    constructor() {

    }
}