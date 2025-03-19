/**
* Functions to WuKong multifunctional expansion board by ELECFREAKS Co.,Ltd.
*/
//% color=#ff7f24  icon="\uf0c2" block="wuKong" blockId="wuKong"
namespace wuKong {
    const board_address = 0x10
    /**
    * LightMode
    */
    export enum LightMode {
        //% block="BREATH"
        BREATH,
        //% block="OFF"
        OFF
    }
    /**
    * MotorList
    */
    export enum MotorList {
        //% block="M1_Front"
        M1,
        //% block="M2_Back"
        M2
    }
    /**
    * ServoList
    */
    export enum ServoList {
        //% block="S0_Mantis_Legs" enumval=0
        S0,
        //% block="S1_Mantis_Turn" enumval=1
        S1,
        //% block="S2_Dragon_Spark" enumval=2
        S2,
        //% block="S3_Fuel_Tank" enumval=3
        S3,
        //% block="S4_Dragon_Slide" enumval=4
        S4,
        //% block="S5_Shark" enumval=5
        S5,
        //% block="S6_Parrot" enumval=6
        S6,
        //% block="S7_Frog" enumval=7
        S7
    }
    /**
    * ServoTypeList
    */
    export enum ServoTypeList {
        //% block="180°" 
        _180,
        //% block="270°"
        _270,
        //% block="360°" 
        _360
    }

    /**
     * TODO: Set the on-board LED display mode. 
     * @param mode breath or off 
     */
    //% weight=90
    //% blockId="setLightMode" block="Set light mode to %mode"
    export function setLightMode(mode: LightMode): void {
        let buff = pins.createBuffer(4);
        switch (mode) {
            case LightMode.BREATH:
                buff[0] = 0x11;
                buff[1] = 0x00;
                buff[2] = 0;
                buff[3] = 0;
                pins.i2cWriteBuffer(board_address, buff);
                buff[0] = 0x12;
                buff[1] = 150;
                basic.pause(100);
                pins.i2cWriteBuffer(board_address, buff);
                break;
            case LightMode.OFF:
                buff[0] = 0x12;
                buff[1] = 0;
                buff[2] = 0;
                buff[3] = 0;
                pins.i2cWriteBuffer(board_address, buff);
                buff[0] = 0x11;
                buff[1] = 160;
                basic.pause(100);
                pins.i2cWriteBuffer(board_address, buff);
                break;
            default:
                break;
        }
    }



    /**
    * TODO: Set the brightness of on-board LED lamp.
    * @param light brightness
    */
    //% weight=89
    //% blockId=lightIntensity block="Set light intensity to %light"
    //% light.min=0 light.max=100
    export function lightIntensity(light: number): void {
        let buff = pins.createBuffer(4);
        buff[0] = 0x12;
        buff[1] = light;
        buff[2] = 0;
        buff[3] = 0;
        pins.i2cWriteBuffer(board_address, buff);
        basic.pause(100);
        buff[0] = 0x11;
        buff[1] = 160;
        pins.i2cWriteBuffer(board_address, buff);
    }


    /**
     * TODO: Set the speed of M1 or M2 motor. 
     * @param motor M1 or M2 motor 
     * @param speed motor speed
     */
    //% weight=88
    //% blockId=setMotorSpeed block="Set motor %motor speed to %speed"
    //% speed.min=-100 speed.max=100
    export function setMotorSpeed(motor: MotorList, speed: number): void {
        let buf = pins.createBuffer(4);
        switch (motor) {
            case MotorList.M1:
                buf[0] = 0x01;
                buf[1] = 0x01;
                if (speed < 0) {
                    buf[1] = 0x02;
                    speed = speed * -1
                }
                buf[2] = speed;
                buf[3] = 0;
                pins.i2cWriteBuffer(board_address, buf);
                break;
            case MotorList.M2:
                buf[0] = 0x02;
                buf[1] = 0x01;
                if (speed < 0) {
                    buf[1] = 0x02;
                    speed = speed * -1
                }
                buf[2] = speed;
                buf[3] = 0;
                pins.i2cWriteBuffer(board_address, buf);
                break;
            default:
                break;
        }
    }

    /*
     * TODO: Stop one of the motors. 
     * @param motor A motor in the MotorList
     */
    //% weight=86
    //% blockId=stopMotor block="Stop motor %motor"
    export function stopMotor(motor: MotorList): void {
        setMotorSpeed(motor, 0)
    }
    /*
     * TODO: Stop all motors, including M1 and M2.
     */
    //% weight=85
    //% blockId=stopAllMotor  block="Stop all motor"
    export function stopAllMotor(): void {
        setMotorSpeed(MotorList.M1, 0)
        setMotorSpeed(MotorList.M2, 0)
    }

    /*
     * TODO: Setting the angle of a servo motor. 
     * @param servo A servo in the ServoList 
     * @param angel Angle of servo motor 
     */
    //% weight=84
    //% blockId=setServoAngle block="Set %servoType servo %servo angle to %angle"
    //% angle.min=0 angle.max=360
    export function setServoAngle(servoType: ServoTypeList, servo: ServoList, angle: number): void {
        let buf = pins.createBuffer(4);
        if (servo == 0) {
            buf[0] = 0x03;
        }
        if (servo == 1) {
            buf[0] = 0x04;
        }
        if (servo == 2) {
            buf[0] = 0x05;
        }
        if (servo == 3) {
            buf[0] = 0x06;
        }
        if (servo == 4) {
            buf[0] = 0x07;
        }
        if (servo == 5) {
            buf[0] = 0x08;
        }
        if (servo == 6) {
            buf[0] = 0x09;
        }
        if (servo == 7) {
            buf[0] = 0x10;
        }

        switch (servoType) {
            case ServoTypeList._180:
                angle = Math.map(angle, 0, 180, 0, 180)
                break
            case ServoTypeList._270:
                angle = Math.map(angle, 0, 270, 0, 180)
                break
            case ServoTypeList._360:
                angle = Math.map(angle, 0, 360, 0, 180)
                break
        }

        buf[1] = angle;
        buf[2] = 0;
        buf[3] = 0;
        pins.i2cWriteBuffer(board_address, buf);
    }

    /*
     * TODO: Setting the speed of a servo motor. 
     * @param servo A servo in the ServoList 
     * @param angel Angle of servo motor 
     */
    //% weight=71
    //% blockId=setServoSpeed block="Set continuous rotation servo %servo speed to %speed\\%"
    //% speed.min=-100 speed.max=100
    export function setServoSpeed(servo: ServoList, speed: number): void {
        speed = Math.map(speed, -100, 100, 0, 180)
        setServoAngle(ServoTypeList._180, servo, speed)
    }
}

