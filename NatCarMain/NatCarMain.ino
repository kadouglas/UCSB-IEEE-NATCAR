#include <Servo.h>
#include <MouseSensor.h>
#define motorPWM 2
#define servoPin 38
Servo servo1;

//Global Variables
//Servo
int servoPos = 180;
int servoMin = 160;
int servoMax = 215;

//Real World Coordinates
double forwardV = 0;
double currentTurnRadius = 0; //Positive to the right, negative to the left

//Motor
int speedPWM = 0;


void setMotorSpeed(int spd);
void setServoDirection(int angle);

void setup() {
pinMode(motorPWM, OUTPUT);
servo1.attach(servoPin);
}

void loop() {

}


//Helper Functions
void setMotorSpeed(int spd){
  if(spd > 255){
    spd = 255;
  }
  else if (spd < 0){
    spd = 0;
  }
  analogWrite(motorPWM,spd);
  speedPWM = spd;
}

void setServoDirection(int angle)
{
  if(angle < servoMin){
    angle = servoMin;
  }
  else if(angle > servoMax){
    angle = servoMax;
  }
  servo1.write(angle);
  servoPos = angle;
}




