int readData(char* buff) {
    int messLen;

    Wire.requestFrom(0x12, 2);
    if (Wire.available() == 2) {
        messLen = Wire.read() | (Wire.read() << 8);
        // Serial.println(messLen);
        delay(1);

        Wire.requestFrom(0x12, messLen);

        int incoming = Wire.available();

        if (incoming == messLen) {
            for (int i = 0; i < incoming; i++) {
                *(buff + i) = Wire.read();
            }
            return messLen;
        } else {
            // dump
            while(Wire.available()) Wire.read();
        }
    } else {
        // dump
        while(Wire.available()) Wire.read();
    }
    return 0;
}