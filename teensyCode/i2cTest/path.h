struct point {
    int x,y;
};

point path[PATH_LEN];
fPoint fpath[PATH_LEN];
int pathLen = 0;

bool pathEnded = false;

void resetPath() {
    pathLen = 0;
}

void readPath(char* buff, int n) {
    // n is the number of bytes, not points
    int numPts = n/4;
    for (int i = 0; i < numPts; i++) {
        if (pathLen == PATH_LEN) {
            break;
        }
        path[pathLen] = {
            buff[4*i+0] | (buff[4*i+1] << 8),
            buff[4*i+2] | (buff[4*i+3] << 8)
        };
        ++pathLen;
    }

    // if n is odd, record the last bit as ended
    if (n%2 == 1) {
        pathEnded = buff[n-1];
    }
}

void setFPath() {
    for (int i = 0; i < pathLen; i++) {
        fpath[i] = {
            (float) path[i].x,
            (float) path[i].y
        };
    }
}

void printPath() {
    Serial.print("Path: ");
    for (int i = 0; i < pathLen; i++) {
        if (i != 0) Serial.print(", ");
        Serial.print("[");
        Serial.print(path[i].x);
        Serial.print(", ");
        Serial.print(path[i].y);
        Serial.print("]");
    }
    Serial.println();
    Serial.print("Ended? ");
    Serial.println(pathEnded);
}

void printFPath() {
    Serial.print("F-Path: ");
    for (int i = 0; i < pathLen; i++) {
        if (i != 0) Serial.print(", ");
        Serial.print("[");
        Serial.print(fpath[i].x);
        Serial.print(", ");
        Serial.print(fpath[i].y);
        Serial.print("]");
    }
    Serial.println();
}