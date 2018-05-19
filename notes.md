# Communication 

## Startup
cam starts up as slave
teensy starts as master
    waits for start message from cam

```c
void loop() {
    if (cam.has_incoming_bytes()) {
        // read cam path data

        // use path data to update PID parameters

        // send read signal back to cam
    }

    update_PID_motor();
    update_PID_steering();
}
```

## The motor function

```c
void update_PID_motor() {
    // known: path and current velocity

    // find bottleneck speed

    // find distance to bottleneck speed

    // assuming a constant max acceleration...
    // and constant max decceleration...

    // only deccelerate when needed
}
```

## The Steering Function

```c
void update_PID_steering() {
    // do I need to care if the servo turns instantaneously?
    // do I need to take into account the time delay between taking the picture and processing the data?
}
```

# Simple:
1. The arduino requests from the OpenMV
    * angle to turn to
    * whether it should stop
2. The arduino just moves forward at a constant voltage