#include <Servo.h>
#include <math.h>
//#include <MouseSensor.h>
#define motorPWM 2
#define servoPin 38
#define killPin 24
#define wheelbaseLength = 10.19
Servo servo1;

//Global Variables
//Servo
int servoPos = 180;
int servoCenter = 180;
int servoMin = 160;
int servoMax = 215;

//Real World Coordinates
double forwardV = 0;
double currentTurnRadius = 0; //Positive to the right, negative to the left

//Motor
int speedPWM = 0;


void setMotorSpeed(int spd);
void setCurvature(float curvature);

void setup() {
pinMode(motorPWM, OUTPUT);
servo1.attach(servoPin);
}

void loop() {
  while( !killPin ){
    setMotorSpeed(0);
    delay(100);
  }
  setCurvature(double(0));
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
  double angle = atan(10.19*curvature)*180/M_PI+servoCenter;
  angle = constrain(angle, servoMin, servoMax);
  servo1.write(angle);
  servoPos = angle;
}




