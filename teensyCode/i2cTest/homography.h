// float H[] = {0.08173215, -0.0002718484, -10.88698, -0.006786823, -0.05773451, 26.08641, -0.0005937629, 0.01044543};
float H[] = {0.3098269, 0.002447784, -12.69399, 0.01366836, -0.1584875, 26.36368, -0.0004863515, 0.03604061};

void convertToPlane(fPoint& p) {
    float x = p.x;
    float y = p.y;

    p.x = (H[0]*x+H[1]*y+H[2])/(H[6]*x+H[7]*y+1);
    p.y = (H[3]*x+H[4]*y+H[5])/(H[6]*x+H[7]*y+1);
}

void convertPoints(fPoint* pts, int n_pts) {
    for (int i = 0; i < n_pts; i++) {
        convertToPlane(pts[i]);
    }
}