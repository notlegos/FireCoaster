let turnAmount = 0
let turnDelay = 0
let turnLocation = 0
let hasLaunched = false
let isTBD = false
let isCandleFlame = false
let isAtColor = false
let isAtShark = false
let isAtDragon = false
let isDragonFlame = false
let isAtFrog = false
let isAtMantis = false
let thisExpanderRead = 0
let started = false
let positioned = false
pins.setAudioPinEnabled(false)
led.enable(false)
notLegos.oledinit()
pins.i2cWriteNumber(
32,
-1,
NumberFormat.Int8LE,
false
)
wuKong.setMotorSpeed(wuKong.MotorList.M1, 0)
wuKong.setMotorSpeed(wuKong.MotorList.M2, 0)
wuKong.setServoSpeed(wuKong.ServoList.S7, 0)
wuKong.setServoSpeed(wuKong.ServoList.S0, 0)
wuKong.setServoSpeed(wuKong.ServoList.S5, 0)
wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S4, 300)
wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S3, 0)
notLegos.paradeMode(false)
notLegos.castleLights()
notLegos.setEffect(notLegos.vfxRegion.BrickAll, notLegos.vfxEffect.parade)
started = true
loops.everyInterval(1000, function () {
    notLegos.printLine(Math.round(Connected.readColor()), 1)
})
loops.everyInterval(10, function () {
    thisExpanderRead = pins.i2cReadNumber(32, NumberFormat.Int8LE, false)
    if (thisExpanderRead > 0) {
        isAtMantis = true
        thisExpanderRead = thisExpanderRead - 128
    } else {
        isAtMantis = false
    }
    if (thisExpanderRead <= -65) {
        isAtFrog = true
        thisExpanderRead = thisExpanderRead + 64
    } else {
        isAtFrog = false
    }
    if (thisExpanderRead <= -33) {
        isDragonFlame = true
        thisExpanderRead = thisExpanderRead + 32
    } else {
        isDragonFlame = false
    }
    if (thisExpanderRead <= -17) {
        isAtDragon = true
        thisExpanderRead = thisExpanderRead + 16
    } else {
        isAtDragon = false
    }
    if (thisExpanderRead <= -9) {
        isAtShark = true
        thisExpanderRead = thisExpanderRead + 8
    } else {
        isAtShark = false
    }
    if (thisExpanderRead <= -5) {
        isAtColor = true
        thisExpanderRead = thisExpanderRead + 4
    } else {
        isAtColor = false
    }
    if (thisExpanderRead <= -3) {
        isCandleFlame = true
        thisExpanderRead = thisExpanderRead + 2
    } else {
        isCandleFlame = false
    }
    if (thisExpanderRead <= -2) {
        isTBD = true
        thisExpanderRead = thisExpanderRead + 1
    } else {
        isTBD = false
    }
})
loops.everyInterval(10, function () {
    for (let index = 0; index < 0; index++) {
        if (isAtColor) {
            wuKong.setMotorSpeed(wuKong.MotorList.M1, 35)
            wuKong.setServoSpeed(wuKong.ServoList.S7, 0)
        }
        if (isAtDragon) {
            if (!(hasLaunched)) {
                wuKong.setMotorSpeed(wuKong.MotorList.M1, 0)
            }
        }
        if (isAtMantis) {
            wuKong.setServoSpeed(wuKong.ServoList.S0, 80)
        }
        if (isAtShark) {
            wuKong.setMotorSpeed(wuKong.MotorList.M2, 0)
            wuKong.setServoSpeed(wuKong.ServoList.S0, 0)
            wuKong.setServoSpeed(wuKong.ServoList.S5, 80)
        }
        if (isAtFrog) {
            wuKong.setServoSpeed(wuKong.ServoList.S5, 0)
            wuKong.setServoSpeed(wuKong.ServoList.S7, 80)
            hasLaunched = false
        }
    }
    for (let index = 0; index < 0; index++) {
        wuKong.setServoSpeed(wuKong.ServoList.S7, 80)
        wuKong.setServoSpeed(wuKong.ServoList.S0, 80)
        wuKong.setServoSpeed(wuKong.ServoList.S5, 80)
        turnLocation = 0
        turnDelay = 15
        turnAmount = 1
        wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S1, turnLocation)
        basic.pause(2000)
        for (let index = 0; index < 360; index++) {
            wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S1, turnLocation)
            wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S6, turnLocation / 4)
            turnLocation = turnLocation + turnAmount
            basic.pause(turnDelay)
        }
        for (let index = 0; index < 360; index++) {
            wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S1, turnLocation)
            wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S6, turnLocation / 4)
            turnLocation = turnLocation - turnAmount
            basic.pause(turnDelay)
        }
        wuKong.setServoSpeed(wuKong.ServoList.S7, 0)
        wuKong.setServoSpeed(wuKong.ServoList.S0, 0)
        wuKong.setServoSpeed(wuKong.ServoList.S5, 0)
    }
})
loops.everyInterval(500, function () {
    notLegos.printLine(notLegos.sonardistance(notLegos.DistanceUnit.Distance_Unit_mm, DigitalPin.P1), 0)
})
loops.everyInterval(500, function () {
    if (started && !(positioned)) {
        wuKong.setMotorSpeed(wuKong.MotorList.M1, -30)
        while (!(isAtColor)) {
            basic.pause(10)
        }
        wuKong.setMotorSpeed(wuKong.MotorList.M1, 0)
        basic.pause(10)
        wuKong.setMotorSpeed(wuKong.MotorList.M1, 30)
        while (!(isAtDragon)) {
            basic.pause(10)
        }
        basic.pause(10)
        wuKong.setMotorSpeed(wuKong.MotorList.M1, 0)
        positioned = true
    }
})
loops.everyInterval(500, function () {
    for (let index = 0; index < 0; index++) {
        if (isCandleFlame) {
            basic.pause(2000)
            hasLaunched = true
            wuKong.setMotorSpeed(wuKong.MotorList.M1, 100)
            basic.pause(1000)
            wuKong.setMotorSpeed(wuKong.MotorList.M2, 100)
            basic.pause(500)
            wuKong.setMotorSpeed(wuKong.MotorList.M1, 0)
        }
    }
})
loops.everyInterval(500, function () {
    if (positioned) {
        while (isTBD) {
            basic.pause(10)
        }
        wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S3, 340)
        basic.pause(1000)
        wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S2, 210)
        basic.pause(1000)
        wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S2, 0)
        basic.pause(500)
        wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S4, 50)
        basic.pause(500)
        wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S3, 0)
    }
})
loops.everyInterval(30, function () {
    notLegos.castleSayTick()
})
loops.everyInterval(100, function () {
    notLegos.changeThree()
})
loops.everyInterval(100, function () {
    notLegos.printLine(pins.i2cReadNumber(32, NumberFormat.Int8LE, false), 2)
})
