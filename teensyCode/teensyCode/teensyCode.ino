#include <Wire.h>

#define BAUD_RATE 9600
#define PATH_LEN 100

struct pathSeg {
    double length;
    double radius;
};

pathSeg _path[PATH_LEN];
// stores whether 
bool _on_path = false;

// number of path segments in path
int _path_seg_n = 0;

// index of current path segment
int _path_seg_i = 0;

// position of car in current path segment
double _path_seg_pos = 0;

void update_path();

void setup() {
    Serial.begin(BAUD_RATE);
    delay(100);
    Serial.println("Starting");

    // intiialize i2c
    Wire.begin();

    // let everything boot up
    delay(1000);
}

void loop() {
    // update path from openmv
    update_path();
}

// move car on path a specified distance
void move_on_path(double dist) {
    while (_on_path && _path[_path_seg_i].length <= dist) {
        dist -= _path[_path_seg_i].length;
        ++_path_seg_i;

        if (_path_seg_i >= _path_seg_n) {
            _on_path = false;
        }
    }

    // set current distance in current segment
    _path_seg_pos = dist;
}

void update_path() {

}