#include <math.h>

struct CircleInfo {
    float cx; // center x
    float cy; // center y
    float mx; // middle x
    float my; // middle y
    float md; // direction at middle of arc
    float r; // radius
    float a0; // start angle
    float a1; // end angle
    float df; // final direction
};

struct fPoint {
    float x,y;
};

CircleInfo getCircleInfo(fPoint p0, fPoint p1, float dir) {
    float dx = p1.x - p0.x;
    float dy = p1.y - p0.y;

    // rotate the points with dir along +x axis
    // float ang = atan2(dy, dx);
    float dir_cos = cos(-dir);
    float dir_sin = sin(-dir);

    // find rotated x' and y'
    float xp = dir_cos*dx - dir_sin*dy;
    float yp = dir_sin*dx + dir_cos*dy;

    // center x' and y'
    float cxp = 0;
    float cyp = (xp*xp + yp*yp)/(2*yp);
    float r = cyp;

    // end direction
    float endDir = dir + M_PI/2 + atan2((yp*yp - xp*xp)/(2*yp), xp);
    if (r < 0) {
        endDir += M_PI;
    }

    // rotate and shift center x' and y' back
    dir_sin = -dir_sin;
    float cx = p0.x + dir_cos*cxp - dir_sin*cyp;
    float cy = p0.y + dir_sin*cxp + dir_cos*cyp;

    // get start angles
    dx = p0.x - cx;
    dy = p0.y - cy;
    float a0 = atan2(dy, dx);

    // get end angle
    dx = p1.x - cx;
    dy = p1.y - cy;
    float a1 = atan2(dy, dx);

    // if r < 0, swap start and end
    if (r < 0) {
        float temp = a0;
        a0 = a1;
        a1 = temp;
    }

    // shift a1 up so it is larger than a0
    while (a0 > a1) {
        a1 += 2*M_PI;
    }

    // shift a1 down just above a0
    while (a1 > a0 + 2*M_PI) {
        a1 -= 2*M_PI;
    }

    // angle of middle of arc
    float ma = (a0 + a1)/2;
    if (r < 0) {
        ma += M_PI;
    }

    // direction at middle of arc
    float md = ma + PI/2;

    // get coords of middle of arc
    float mx = cx + r * cos(ma);
    float my = cy + r * sin(ma);

    CircleInfo res = {
        cx,
        cy,
        mx,
        my,
        md,
        r,
        a0,
        a1,
        endDir
    };
    return res;
}

// smooth points
// the magic function
void nextPoints(fPoint* pts, int n_pts, float dir) {
    // dir is the initial direction
    for (int i = 0; i < n_pts - 2; i++) {
        // reference points for the arc
        fPoint* p0 = &pts[i  ];
        fPoint* p1 = &pts[i+2];

        // point between p0 and p1 to shift
        fPoint* p3 = &pts[i+1];

        // get circle info
        CircleInfo ci = getCircleInfo(*p0, *p1, dir);

        // get the new next coord for p3
        p3->x = (ci.mx + p3->x)/2;
        p3->y = (ci.my + p3->y)/2;

        // use direction at center for next line
        dir = ci.md;
    }
}

void smoothPoints(fPoint* pts, int n_pts, float dir, int n) {
    for (int i = 0; i < n; i++) {
        nextPoints(pts, n_pts, dir);
    }
}

float getFirstRadius(fPoint* pts, int n_pts, float dir) {
    if (n_pts < 3) return 0.0;

    CircleInfo ci = getCircleInfo(pts[0], pts[1], dir);

    return ci.r;
}

float fdist(fPoint p0, fPoint p1) {
    float dx = p1.x - p0.x;
    float dy = p1.y - p0.y;
    return sqrt(dx*dx + dy*dy);
}

void prunePoints(fPoint* pts, int& n_pts, float minDist) {
    bool remove[PATH_LEN];
    for (int i = 0; i < n_pts; i++) {remove[i] = false;}

    int lastPt = 0;
    for (int i = 1; i < n_pts-1; i++) {
        if (fdist(pts[lastPt], pts[i]) < minDist) {
            remove[i] = true;
        } else {
            lastPt = i;
        }
    }

    // do the removal
    lastPt = 0;
    for (int i = 0; i < n_pts; i++) {
        if (!remove[i]) {
            pts[lastPt] = pts[i];
            lastPt++;
        }
    }
    n_pts = lastPt;
}