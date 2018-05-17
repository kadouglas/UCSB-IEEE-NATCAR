#include<Wire.h>

int slaveAddress = 0x42;

void setup() {
    // start serial connection
    Serial.begin(9600);

    // join the bus as master
    Wire.begin();

    //let everything initialize
    delay(100);

    // infinite echo
    printAllIncoming();

    // test transmission
    Wire.beginTransmission(slaveAddress);
        Wire.write(8);
    Wire.endTransmission();
}

void printAllIncoming() {
    int incomingBytes = Wire.available();

    while (true) {
        while (incomingBytes == 0) {
            incomingBytes = Wire.available();
        }k
        for (int i = 0; i < incomingBytes; i++) {
            Serial.println(Wire.read());
        }
    }

}

void loop() {
    // put your main code here, to run repeatedly:

}
