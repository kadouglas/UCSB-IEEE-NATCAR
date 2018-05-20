#define PATH_LEN 100
// 
#include <Wire.h>
#include "sendReceive.h"
#include "smoothing.h"
#include "path.h"
#include "homography.h"
#define BAUD_RATE 19200

void setup() {
    Serial.begin(BAUD_RATE);
    Wire.begin();
    delay(1000); // Give the OpenMV Cam time to bootup.
    Serial.println("Starting");
}

void loop() {
    char buff[32];

    resetPath();

    bool hasReadPath = false;
    int read = readData(buff);
    // Serial.print("Read ");Serial.println(read);
    readPath(buff, read);

    while (read > 0 && read%2 == 0) {
        hasReadPath = true;
        read = readData(buff);
        // Serial.print("Read again ");Serial.println(read);
        readPath(buff, read);
    }

    if (hasReadPath) {
        printPath();

        setFPath();
        convertPoints(fpath, pathLen);

        printFPath();

        prunePoints(fpath, pathLen, 2);

        printFPath();

        smoothPoints(fpath, pathLen, M_PI/2, 10);
        printFPath();

        Serial.println(getFirstRadius(fpath, pathLen, M_PI/2));
    }

    // take a break
    delay(1);
    return;
}
