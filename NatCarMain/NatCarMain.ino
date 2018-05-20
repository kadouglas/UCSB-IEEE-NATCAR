#include <Servo.h>
//#include <MouseSensor.h>
#define motorPWM 2
#define servoPin 38
#define killPin 24
#define wheelbaseLength = 10.19
Servo servo1;

//Global Variables
//Servo
int servoMin = 160;
int servoMax = 215;

//Real World Coordinates
double forwardV = 0;
double currentTurnRadius = 0; //Positive to the right, negative to the left

//Motor
int speedPWM = 0;


void setMotorSpeed(int spd);
void setCurvature(int curvature);

void setup() {
pinMode(motorPWM, OUTPUT);
servo1.attach(servoPin);
}

void loop() {
  while( killPin ){
    setMotorSpeed(0);
    delay(100);
  }
  setCurvature(0);
  setMotorSpeed(10);
  delay(100);
  setMotorSpeed(0);
  delay(10000);

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

void setCurvature(double curvature)
{
  angle = atan(10.19*curvature)
  if(angle < servoMin){
    angle = servoMin;
  }
  else if(angle > servoMax){
    angle = servoMax;
  }
  servo1.write(angle);
  servoPos = angle;
}




