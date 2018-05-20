void setup() {
  // put your setup code here, to run once:
  pinMode(24,INPUT);
  Serial.begin(9800);
}

void loop() {
  // put your main code here, to run repeatedly:
  Serial.println(digitalRead(24));
  delay(1000);
}
