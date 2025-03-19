pins.setAudioPinEnabled(false)
led.enable(false)
wuKong.setServoSpeed(wuKong.ServoList.S0, 0)
notLegos.oledinit()
pins.i2cWriteNumber(
32,
-1,
NumberFormat.Int8LE,
false
)
if (pins.i2cReadNumber(32, NumberFormat.Int8LE, false) == -2) {
    wuKong.setMotorSpeed(wuKong.MotorList.M1, 35)
    while (pins.i2cReadNumber(32, NumberFormat.Int8LE, false) == -2) {
        basic.pause(10)
    }
    basic.pause(230)
    wuKong.setMotorSpeed(wuKong.MotorList.M1, 0)
}
loops.everyInterval(1000, function () {
    notLegos.printLine(Math.round(Connected.readColor()), 1)
})
loops.everyInterval(500, function () {
    notLegos.printLine(notLegos.sonardistance(notLegos.DistanceUnit.Distance_Unit_mm, DigitalPin.P1), 0)
})
loops.everyInterval(100, function () {
    notLegos.printLine(pins.i2cReadNumber(32, NumberFormat.Int8LE, false), 2)
})
loops.everyInterval(100, function () {
    notLegos.changeThree()
})
