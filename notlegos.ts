// NotLegos Blocks
//% block="Not LEGOs" color=#0031AF weight=1000 icon="\uf3a5"
//% groups='["MP3","Sensors"]'
namespace notLegos {


/// BEGIN RADIO ///

    //% blockId=NL_Radio_SayLights
    //% subcategory="Radio" Group="Radio"
    //% block="say lights %light show %effect"
    export function sayLights(light: vfxRegion, effect: vfxEffect) {
        radioSay("L" + light, effect)
        basic.pause(20)
    }

    //% blockId=NL_Radio_SayMotor
    //% subcategory="Radio" Group="Radio"
    //% block="say motor %motor set %setting"
    export function sayMotor(motor: motors, setting: motorState) {
        radioSay("M" + motor, setting)
        basic.pause(20)
    }

    export enum side {left=0, right=1}
    //% blockId=NL_Radio_SayIndicate
    //% subcategory="Radio" Group="Radio"
    //% block="say indicate %theSide color to %theColor"
    export function sayIndicate(theSide: side, theColor: hues) {
        radioSay("I" + theSide, theColor)
        basic.pause(20)
    }
    //% blockId=NL_Radio_SayFire
    //% subcategory="Radio" Group="Radio"
    //% block="set parade mode to fire %fireOn"
    export function sayFireMode(fireOn: boolean) {
        if(fireOn){
            radioSay("P",1)
        }else{
            radioSay("P",0)
        }
        basic.pause(20)
    }


/// END RADIO ///

/// BEGIN NEOPIXEL ///
    export enum hues { red = 0, orange = 15, yellow = 40, lime = 85, green = 110, cyan = 170, blue = 240, purple = 260, pink = 310 }
    export enum vfxEffect { parade = 0, indicateL = 1, indicateR = 2, idle = 3, glow = 4, mine = 5, off = 6, active = 7, green=8, yellow=9, orange=10, red=11}
    let NeoWheel: Strip = null; let vfx_light_count = 0
    let kongPin = DigitalPin.P16; let wheelPin = DigitalPin.P12; let sockPin = DigitalPin.P8; let scorePin = DigitalPin.P13; let brickPin = DigitalPin.P15; let stripPin = DigitalPin.P14;
    let vfx_mine_tog: number[] = []; let vfx_mine_hue: number[] = []; let vfx_mine_sat: number[] = []; let vfx_mine_lum: number[] = []; let vfx_fire_colors: number[] = []
    let vfx_indicate_tog: number[] = []; let vfx_indicate_hue: number[] = []; let vfx_indicate_sat: number[] = []; let vfx_indicate_lum: number[] = [];
    let vfx_idle_tog: number[] = []; let vfx_idle_hue: number[] = []; let vfx_idle_sat: number[] = []; let vfx_idle_lum: number[] = []
    let vfx_off_hue: number[] = []; let vfx_off_sat: number[] = []; let vfx_off_lum: number[] = []
    let vfx_parade_tog: number[] = []; let vfx_parade_hue: number[] = []; let vfx_parade_sat: number[] = []; let vfx_parade_lum: number[] = []; let vfx_parade_colors: number[] = [];
    let vfx_last_tog: number[] = []; let vfx_last_hue: number[] = []; let vfx_last_sat: number[] = []; let vfx_last_lum: number[] = []
    let vfx_master_tog: number[] = []; let vfx_master_hue: number[] = []; let vfx_master_sat: number[] = []; let vfx_master_lum: number[] = []; let vfx_master_effect: number[] = [];
    let vfx_master_r: number[] = []; let vfx_master_g: number[] = []; let vfx_master_b: number[] = [];
    let paletteKong = [0, 0, 0, 0]; let paletteWheel = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let paletteSock = [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3,2,3]; let paletteScore = [2, 3, 2, 3, 2, 3, 2, 3]
    let paletteBricks = [2, 3, 2, 3, 2, 3, 2, 3]; let paletteStrip = [6, 7, 8, 9, 10, 11, 6, 7, 8, 9, 10, 11, 6, 7, 8, 9, 10, 11, 6, 7]

    //% shim=sendBufferAsm
    function sendBuffer(buf: Buffer, pin: DigitalPin) { }

    export class Strip {
        buf: Buffer;
        _length: number; // number of LEDs

        setPixelHSLPrecise(pixeloffset: number, h: number, s: number, l: number): void {
            if (pixeloffset < 0 || pixeloffset >= this._length)
                return;
            pixeloffset = (pixeloffset) * 3
            h = Math.clamp(0,1,h/360); s = Math.clamp(0,1,s/100); l = Math.clamp(0,1,l/100)
            let r, g, b;
            if (s === 0) {
                r = g = b = l; // achromatic
            } else {
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                let t = h + 1/3
                if (t < 0) { t += 1; }
                else if (t > 1) {t -= 1; }
                if (t < 1/6) {r = p + (q - p) * 6 * t;}
                else if (t < 1/2) {r = q;}
                else if (t < 2/3) { r = p + (q - p) * (2/3 - t) * 6; }
                else { r = p; }
                t = h
                if (t < 0) { t += 1; }
                else if (t > 1) { t -= 1; }
                if (t < 1 / 6) { g = p + (q - p) * 6 * t; }
                else if (t < 1 / 2) { g = q; }
                else if (t < 2 / 3) { g = p + (q - p) * (2/3 - t) * 6; }
                else { g = p; }
                t = h - 1/3
                if (t < 0) { t += 1; }
                else if (t > 1) { t -= 1; }
                if (t < 1 / 6) { b = p + (q - p) * 6 * t; }
                else if (t < 1/2) { b = q; }
                else if (t < 2/3) { b = p + (q - p) * (2/3 - t) * 6; }
                else { b = p; }
            }
            vfx_master_g[pixeloffset/3] = Math.round(g * 255);
            vfx_master_r[pixeloffset/3] = Math.round(r * 255);
            vfx_master_b[pixeloffset/3] = Math.round(b * 255);
        }

        show() { 
            for (let i = 0; i < 4; i++) {this.buf[i * 3 + 0] = vfx_master_g[paletteKong[i]]; this.buf[i * 3 + 1] = vfx_master_r[paletteKong[i]]; this.buf[i * 3 + 2] = vfx_master_b[paletteKong[i]]}
            sendBuffer(this.buf.slice(0, 4 * 3), kongPin);
            for (let i = 0; i < 20; i++) {this.buf[i * 3 + 0] = vfx_master_g[paletteWheel[i]]; this.buf[i * 3 + 1] = vfx_master_r[paletteWheel[i]]; this.buf[i * 3 + 2] = vfx_master_b[paletteWheel[i]]}
            sendBuffer(this.buf.slice(0, 20*3), wheelPin);
            for (let i = 0; i < 18; i++) {this.buf[i * 3 + 0] = vfx_master_g[paletteSock[i]]; this.buf[i * 3 + 1] = vfx_master_r[paletteSock[i]]; this.buf[i * 3 + 2] = vfx_master_b[paletteSock[i]]}
            sendBuffer(this.buf.slice(0, 18 * 3), sockPin);
            for (let i = 0; i < 8; i++) {this.buf[i * 3 + 0] = vfx_master_g[paletteScore[i]]; this.buf[i * 3 + 1] = vfx_master_r[paletteScore[i]]; this.buf[i * 3 + 2] = vfx_master_b[paletteScore[i]]}
            sendBuffer(this.buf.slice(0, 8 * 3), scorePin);
            for (let i = 0; i < 8; i++) {this.buf[i * 3 + 0] = vfx_master_g[paletteBricks[i]]; this.buf[i * 3 + 1] = vfx_master_r[paletteBricks[i]]; this.buf[i * 3 + 2] = vfx_master_b[paletteBricks[i]]}
            sendBuffer(this.buf.slice(0, 8 * 3), brickPin);
            for (let i = 0; i < 20; i++) {this.buf[i * 3 + 0] = vfx_master_g[paletteStrip[i]]; this.buf[i * 3 + 1] = vfx_master_r[paletteStrip[i]]; this.buf[i * 3 + 2] = vfx_master_b[paletteStrip[i]]}
            sendBuffer(this.buf.slice(0, 20 * 3), stripPin);
        }  //Send all the changes to the strip.

        length() { return this._length; }   //Gets the number of pixels declared on the strip

        shift(offset: number = 1): void { this.buf.shift(-offset * 3, this._length * 3) }   //Shift LEDs forward and clear with zeros.

        rotate(offset: number = 1): void { this.buf.rotate(-offset * 3, this._length * 3) } //Rotate LEDs forward
    }

    function create(numleds: number): Strip {
        let strip = new Strip();
        strip.buf = pins.createBuffer(numleds * 3);
        strip._length = numleds;
        return strip;
    }

    //% blockId=NL_PIXEL_Virtual
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="initiate castle lights"
    //% weight=100
    export function castleLights(): void {
        NeoWheel = create(20)
        vfx_light_count = 16
        vfx_parade_colors = [hues.red, hues.orange, hues.yellow, hues.cyan, hues.blue, hues.purple]
        vfx_fire_colors = [hues.red, hues.red, hues.red, hues.red, hues.orange, hues.orange, hues.orange, hues.orange, hues.orange, hues.yellow]
        for (let index = 0; index < 9; index++) {
            vfx_parade_tog.push(randint(0, 1))
            vfx_parade_hue.push(vfx_parade_colors[randint(0, vfx_parade_colors.length - 1)])
            vfx_parade_sat.push(100)
            vfx_parade_lum.push(randint(10, 65))
        }
        for (let index = 0; index < 1; index++) {
            vfx_mine_tog.push(0)
            vfx_mine_hue.push(hues.red)
            vfx_mine_sat.push(100)
            vfx_mine_lum.push(50)
            vfx_off_hue.push(0)
            vfx_off_sat.push(0)
            vfx_off_lum.push(0)
        }
        for (let index = 0; index < 2; index++) {
            vfx_indicate_tog.push(0)
            vfx_indicate_lum.push(50)
            vfx_indicate_hue.push(50)
            vfx_indicate_sat.push(100)
            vfx_idle_sat.push(100)
            vfx_idle_lum.push(50)
            vfx_idle_tog.push(0)
            vfx_idle_hue.push(270)
            if (index % 2 == 0) {
                vfx_idle_hue[index] = -20;
                vfx_idle_tog[index] = 1;
                vfx_indicate_tog[index] = 1;
                vfx_indicate_hue[index] = 210;
            }
            
        }
        for (let index = 0; index < vfx_light_count; index++) {
            vfx_master_tog.push(0)
            vfx_master_hue.push(0)
            vfx_master_sat.push(100)
            vfx_master_lum.push(50)
            vfx_master_effect.push(vfxEffect.off)    //leave this be!
        }
        NeoWheel.setPixelHSLPrecise(15, 0, 0, 0)
        NeoWheel.setPixelHSLPrecise(16, 0, 0, 100)
        NeoWheel.setPixelHSLPrecise(17, hues.green, 100, 50)
        NeoWheel.setPixelHSLPrecise(18, hues.yellow, 100, 50)
        NeoWheel.setPixelHSLPrecise(19, hues.orange, 100, 50)
        NeoWheel.setPixelHSLPrecise(0, hues.red, 100, 50)
    }

    //% blockId=NL_PIXEL_ResetVFX
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Reset VFX %effect"
    //% weight=100
    export function vfxReset(effect:vfxEffect):void{
        if (effect == vfxEffect.idle){
            for (let index = 0; index < 2; index++) {
                vfx_idle_tog[index]=1
                if (index % 2 == 0) { vfx_idle_tog[index] = 0; }
                vfx_idle_hue[index]=360
                if (index % 2 == 0) { vfx_idle_hue[index] = 2; }
                vfx_idle_sat[index]=100
                vfx_idle_lum[index]=50
            }
        } else if (effect == vfxEffect.mine) {
            for (let index = 0; index < 1; index++) {
                vfx_mine_tog[index] = 0
                vfx_mine_hue[index] = hues.red
                vfx_mine_sat[index] = 100
                vfx_mine_lum[index] = 50
            }
        } else if (effect == vfxEffect.glow) {
            vfx_parade_lum[0]=10
            vfx_parade_tog[0]=0
        } else if (effect == vfxEffect.indicateR) {
            for (let index = 0; index < 2; index++) {
                vfx_indicate_tog[index] = 0
                vfx_indicate_sat[index] = 100
                vfx_indicate_lum[index] = 50
            }
        }
        
    }

    //% blockId=NL_PIXEL_IndicateLColorShim
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Set numbered indicate left hue %theColor"
    //% weight=100
    export function setIndicateLShim(theColor: number) {
        setIndicateL(theColor)
    }
    //% blockId=NL_PIXEL_IndicateRColorShim
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Set numbered indicate right hue %theColor"
    //% weight=100
    export function setIndicateRShim(theColor: number) {
        setIndicateR(theColor)
    }

    //% blockId=NL_PIXEL_IndicateLColor
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="indicate left to %theColor"
    export function setIndicateL(theColor:hues): void{
        vfx_indicate_hue[0]=theColor
    }

    //% blockId=NL_PIXEL_IndicateRColor
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="indicate right to %theColor"
    export function setIndicateR(theColor: hues): void {
        vfx_indicate_hue[1] = theColor
    }


    //% blockId=NL_PIXEL_CastleSayTick
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Advance Castle Say lights"
    //% weight=100
    export function castleSayTick(): void {
        paradeTick()
        indicateTick()
        idleTick()
        mineTick()
        castleLightWrite()
    }

    let paradeLumLow = 10; let paradeLumHigh = 65; let paradeLumRise = 12; let paradeLumFall = 4; let paradeFire = false
    //% blockId=NL_PIXEL_ParadeMode
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="parade mode fire %fireOn"
    //% weight=100
    export function paradeMode(fireOn:boolean){
        if(fireOn){ paradeFire = true; paradeLumLow = 30; paradeLumHigh = 80; paradeLumRise = 15; paradeLumFall = 5 } 
        else{ paradeFire = false; paradeLumLow = 10; paradeLumHigh = 65; paradeLumRise = 12; paradeLumFall = 4}
    }

    function paradeTick(): void{
        for (let index=0; index < 9; index++){
            let thisLum = vfx_parade_lum[index]; let thisHue = vfx_parade_hue[index]; let thisTog = vfx_parade_tog[index]; let nextHue = thisHue
            if (thisTog == 0){
                if (thisLum < paradeLumHigh){vfx_parade_lum[index] = thisLum + paradeLumRise} 
                else if (thisLum >= paradeLumHigh){vfx_parade_tog[index] = 1}
            } else if (thisTog == 1){
                if (thisLum > paradeLumLow){vfx_parade_lum[index] = thisLum - paradeLumFall} 
                else if (thisLum <= paradeLumLow){
                    vfx_parade_tog[index] = 0
                    while (nextHue == thisHue){
                        if(paradeFire){nextHue = vfx_fire_colors[randint(0, vfx_fire_colors.length - 1)]} 
                        else{nextHue = vfx_parade_colors[randint(0, vfx_parade_colors.length - 1)]}
                    }
                    vfx_parade_hue[index] = nextHue
                    vfx_parade_lum[index] = thisLum - randint(0, paradeLumLow)
                }
            }
        }
    }

    function mineTick(): void {
        for (let index = 0; index < 1; index++) {
            let thisLum = vfx_mine_lum[index]; let thisTog = vfx_mine_tog[index]
            if (thisTog == 0) {
                if (thisLum < 200) {vfx_mine_lum[index] = thisLum + 30} 
                else if (thisLum >= 200) { vfx_mine_tog[index] = 1}
            } else if (thisTog == 1) {
                if (thisLum > 0) {vfx_mine_lum[index] = thisLum - 30} 
                else if (thisLum <= 0) { vfx_mine_tog[index] = 0 }
            }
        }
    }

    function idleTick(): void {
        for (let index = 0; index < 2; index++) {
            let thisLum = vfx_idle_lum[index]; let thisHue = vfx_idle_hue[index]; let thisTog = vfx_idle_tog[index]; let nextHue = thisHue
            if (thisTog == 0) {
                if (thisHue < 270) {vfx_idle_hue[index] = thisHue + 1} 
                else if (thisHue >= 270) {vfx_idle_tog[index] = 1}
            } else if (thisTog == 1) {
                if (thisHue > -20) {vfx_idle_hue[index] = thisHue - 1} 
                else if (thisHue <= -20) {vfx_idle_tog[index] = 0}
            }
        }
    }

    function indicateTick(): void {
        for (let index = 0; index < 2; index++) {
            let thisLum = vfx_indicate_lum[index]; let thisHue = vfx_indicate_hue[index]; let thisTog = vfx_indicate_tog[index]; let nextHue = thisHue
            if (thisTog == 0) {
                if (thisLum < 80) {vfx_indicate_lum[index] = thisLum + 12}
                else if (thisLum >= 80) {vfx_indicate_tog[index] = 1}
            } else if (thisTog == 1) {
                if (thisLum > 25) {vfx_indicate_lum[index] = thisLum - 4} 
                else if (thisLum <= 25) {vfx_indicate_tog[index] = 0}
            }
        }
    }

    function castleLightWrite(): void{
        //vfx_master_hue[0] = 0; vfx_master_sat[0] = 0; vfx_master_lum[0] = 0
        vfx_master_hue[1] = vfx_mine_hue[0]; vfx_master_sat[1] = vfx_mine_sat[0]; vfx_master_lum[1] = Math.max(0, Math.min(50, vfx_mine_lum[0]))
        vfx_master_hue[2] = vfx_idle_hue[0]; vfx_master_sat[2] = vfx_idle_sat[0]; vfx_master_lum[2] = Math.max(0, Math.min(50, vfx_idle_lum[0]))
        vfx_master_hue[3] = vfx_idle_hue[1]; vfx_master_sat[3] = vfx_idle_sat[1]; vfx_master_lum[3] = Math.max(0, Math.min(50, vfx_idle_lum[1]))
        vfx_master_hue[4] = vfx_indicate_hue[0]; vfx_master_sat[4] = vfx_indicate_sat[0]; vfx_master_lum[4] = Math.max(0, Math.min(50, vfx_indicate_lum[0]))
        vfx_master_hue[5] = vfx_indicate_hue[1]; vfx_master_sat[5] = vfx_indicate_sat[1]; vfx_master_lum[5] = Math.max(0, Math.min(50, vfx_indicate_lum[1]))
        vfx_master_hue[6] = vfx_parade_hue[0]; vfx_master_sat[6] = vfx_parade_sat[0]; vfx_master_lum[6] = Math.max(0, Math.min(50, vfx_parade_lum[0]))
        vfx_master_hue[7] = vfx_parade_hue[1]; vfx_master_sat[7] = vfx_parade_sat[1]; vfx_master_lum[7] = Math.max(0, Math.min(50, vfx_parade_lum[1]))
        vfx_master_hue[8] = vfx_parade_hue[2]; vfx_master_sat[8] = vfx_parade_sat[2]; vfx_master_lum[8] = Math.max(0, Math.min(50, vfx_parade_lum[2]))
        vfx_master_hue[9] = vfx_parade_hue[3]; vfx_master_sat[9] = vfx_parade_sat[3]; vfx_master_lum[9] = Math.max(0, Math.min(50, vfx_parade_lum[3]))
        vfx_master_hue[10] = vfx_parade_hue[4]; vfx_master_sat[10] = vfx_parade_sat[4]; vfx_master_lum[10] = Math.max(0, Math.min(50, vfx_parade_lum[4]))
        vfx_master_hue[11] = vfx_parade_hue[5]; vfx_master_sat[11] = vfx_parade_sat[5]; vfx_master_lum[11] = Math.max(0, Math.min(50, vfx_parade_lum[5]))
        vfx_master_hue[12] = vfx_parade_hue[6]; vfx_master_sat[12] = vfx_parade_sat[6]; vfx_master_lum[12] = Math.max(0, Math.min(50, vfx_parade_lum[6]))
        vfx_master_hue[13] = vfx_parade_hue[7]; vfx_master_sat[13] = vfx_parade_sat[7]; vfx_master_lum[13] = Math.max(0, Math.min(50, vfx_parade_lum[7]))
        vfx_master_hue[14] = vfx_parade_hue[8]; vfx_master_sat[14] = vfx_parade_sat[8]; vfx_master_lum[14] = Math.max(0, Math.min(50, vfx_parade_lum[8]))
        //vfx_master_hue[15] = vfx_off_hue[0]; vfx_master_sat[15] = vfx_off_sat[0]; vfx_master_lum[15] = 0
        //vfx_master_hue[16] = vfx_active_hue[0]; vfx_master_sat[16] = vfx_active_sat[0]; vfx_master_lum[16] = Math.min(100, vfx_active_lum[0])
        for (let index = 1; index < 15; index++) { NeoWheel.setPixelHSLPrecise(index, vfx_master_hue[index], vfx_master_sat[index], vfx_master_lum[index]) }
        NeoWheel.show()
    }

    let pixelIdle = 2; let pixelParade = 6
    function getPixel(effect:vfxEffect): number{
        if (effect == vfxEffect.mine) {return 1} 
            else if (effect == vfxEffect.idle){
            if (pixelIdle == 2){
                pixelIdle = 3
                return 2
            } else {
                pixelIdle = 2
                return 3
            }
        } else if (effect == vfxEffect.indicateL){return 4} 
        else if (effect == vfxEffect.indicateR){return 5} 
        else if (effect == vfxEffect.parade) {
            if (pixelParade < 14){
                pixelParade += 1
                return pixelParade - 1
            } else {
                pixelParade = 6
                return 14
            }
        } else if (effect == vfxEffect.off) {return 15} 
        else if (effect == vfxEffect.active){return 16}
        else if (effect == vfxEffect.green) { return 17 }
        else if (effect == vfxEffect.yellow) { return 18 }
        else if (effect == vfxEffect.orange) { return 19 }
        else if (effect == vfxEffect.red) { return 0 }
        return pixelParade; //glow
    }

    //% blockId=NL_PIXEL_SetEffectShim
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Set numbered %region VFX to %effect"
    //% weight=100
    export function setEffectShim(region: number, effect: number) {
        setEffect(region, effect)
    }

    //% blockId=NL_PIXEL_SetEffect
    //% subcategory="Neopixel" Group="Neopixel"
    //% block="Set %region VFX to %effect"
    //% weight=100
    export function setEffect(region:vfxRegion, effect:vfxEffect){
        if (region == vfxRegion.Score1){paletteScore[4] = getPixel(effect)}
        else if (region == vfxRegion.Score2) {paletteScore[5] = getPixel(effect)} 
        else if (region == vfxRegion.Score3) {paletteScore[6] = getPixel(effect)} 
        else if (region == vfxRegion.Score4) {paletteScore[7] = getPixel(effect)} 
        else if (region == vfxRegion.Score5) {paletteScore[0] = getPixel(effect)} 
        else if (region == vfxRegion.Score6) {paletteScore[1] = getPixel(effect)} 
        else if (region == vfxRegion.Score7) {paletteScore[2] = getPixel(effect)} 
        else if (region == vfxRegion.Score8) {paletteScore[3] = getPixel(effect)} 
        else if (region == vfxRegion.ScoreAll) {for (let i=0;i<8;i++){paletteScore[i]=getPixel(effect)}} 
        else if (region == vfxRegion.Swing) {for (let i = 0; i < 10; i++) {paletteSock[i] = getPixel(effect)}} 
        else if (region == vfxRegion.Sock) {for (let i = 10; i < 18; i++) {paletteSock[i] = getPixel(effect)}} 
        else if (region == vfxRegion.SockAll) {for (let i = 0; i < 18; i++) {paletteSock[i] = getPixel(effect)}}
        else if (region == vfxRegion.WheelInner) {for (let i = 10; i < 18; i++) {paletteWheel[i] = getPixel(effect)}} 
        else if (region == vfxRegion.WheelOuter) {for (let i = 0; i < 10; i++) {paletteWheel[i] = getPixel(effect)}} 
        else if (region == vfxRegion.WheelAll) {for (let i = 0; i < 20; i++) {paletteWheel[i] = getPixel(effect)}} 
        else if (region == vfxRegion.CastleAll) {
            for (let i = 0; i < 8; i++) {paletteScore[i] = getPixel(effect)}
            for (let i = 0; i < 20; i++) {paletteStrip[i] = getPixel(effect)}
            for (let i = 0; i < 8; i++) {paletteBricks[i] = getPixel(effect)}
            for (let i = 0; i < 4; i++) {paletteKong[i] = getPixel(effect)}
            for (let i = 0; i < 18; i++) {paletteSock[i] = getPixel(effect)} 
            for (let i = 0; i < 20; i++) {paletteWheel[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotA) {
            for (let i = 8; i <= 11; i++) {paletteStrip[i] = getPixel(effect)}
            if (effect==vfxEffect.indicateL){setIndicateL(hues.green)}
            else if (effect==vfxEffect.indicateR){setIndicateR(hues.green)}
        } else if (region == vfxRegion.SpotB) {
            if (effect == vfxEffect.indicateL) { setIndicateL(hues.yellow) }
            for (let i = 6; i <= 7; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotC) {
            if (effect == vfxEffect.indicateR) { setIndicateR(hues.blue) }
            for (let i = 12; i <= 13; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotD) {
            if (effect == vfxEffect.indicateL) { setIndicateL(hues.orange) }
            for (let i = 4; i <= 5; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotE) {
            if (effect == vfxEffect.indicateR) { setIndicateR(hues.lime) }
            for (let i = 14; i <= 15; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotF) {
            if (effect == vfxEffect.indicateL) { setIndicateL(hues.purple) }
            for (let i = 2; i <= 3; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotG) {
            if (effect == vfxEffect.indicateR) { setIndicateR(hues.pink) }
            for (let i = 16; i <= 17; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotH) {
            if (effect == vfxEffect.indicateL) { setIndicateL(hues.cyan) }
            for (let i = 0; i <= 1; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotI) {
            if (effect == vfxEffect.indicateR) { setIndicateR(hues.cyan) }
            for (let i = 18; i <= 19; i++) {paletteStrip[i] = getPixel(effect)}
        } else if (region == vfxRegion.SpotAll) {for (let i = 0; i < 20; i++) {paletteStrip[i] = getPixel(effect)}} 
        else if (region == vfxRegion.BrickWheel) {
            paletteBricks[0] = getPixel(effect)
            paletteBricks[7] = getPixel(effect)
        } else if (region == vfxRegion.BrickBomb) {paletteBricks[5] = getPixel(effect)} 
        else if (region == vfxRegion.BrickShell) {paletteBricks[6] = getPixel(effect)} 
        else if (region == vfxRegion.BrickGhost) {paletteBricks[4] = getPixel(effect)} 
        else if (region == vfxRegion.BrickDragon) {
            if (effect == vfxEffect.indicateL) { setIndicateL(hues.yellow) }
            paletteBricks[2] = getPixel(effect)
            paletteBricks[3] = getPixel(effect)
        } else if (region == vfxRegion.BrickCannon) {paletteBricks[1] = getPixel(effect)} 
        else if (region == vfxRegion.BrickAll) {for (let i = 0; i < 8; i++) {paletteBricks[i] = getPixel(effect)}} 
        else if (region == vfxRegion.KongFront) {for (let i = 0; i < 2; i++) {paletteKong[i] = getPixel(effect)}} 
        else if (region == vfxRegion.KongBack) {for (let i = 2; i < 4; i++) {paletteKong[i] = getPixel(effect)}} 
        else if (region == vfxRegion.KongAll) {for (let i = 0; i < 4; i++) {paletteKong[i] = getPixel(effect)}}
        else if (region == vfxRegion.Station2) {
            if (effect == vfxEffect.indicateR) { setIndicateR(hues.cyan) }
            for (let i = 12; i <= 13; i++) { paletteStrip[i] = getPixel(effect) }
            for (let i = 14; i <= 15; i++) { paletteStrip[i] = getPixel(effect) }
        }
        else if (region == vfxRegion.KyleL) {
            if (effect == vfxEffect.indicateL) { setIndicateL(hues.cyan) }
            for (let i = 0; i <= 5; i++) { paletteStrip[i] = getPixel(effect) }  //D,F,H
        }
        else if (region == vfxRegion.KyleR) {
            if (effect == vfxEffect.indicateR) { setIndicateR(hues.cyan) }
            for (let i = 14; i <= 19; i++) { paletteStrip[i] = getPixel(effect) }  //E,G,I
        }
    }

    export enum vfxRegion{
        Score1=1, Score2=2, Score3=3, Score4=4, Score5, Score6, Score7=7, Score8=8, ScoreAll=9,
        Swing=10, Sock=11, SockAll=12,
        WheelInner=13, WheelOuter=14, WheelAll=15,
        KongFront=16, KongBack=17, KongAll=18,
        BrickWheel=19, BrickBomb=20, BrickShell=21, BrickGhost=22, BrickDragon=23, BrickCannon=24, BrickAll=25,
        SpotA=26, SpotB=27, SpotC=28, SpotD=29, SpotE=30, SpotF=31, SpotG=32, SpotH=33, SpotI=34, SpotAll=35,
        KyleL=36,KyleR=37,Station2=38,
        CastleAll=0
    }

/// END NEOPIXEL ///


/// BEGIN SONAR ///

    let sonarPinT = DigitalPin.P0
    let sonarPinE = DigitalPin.P0

    //% blockId=NL_SENSOR_SonarFirstRead
    //% subcategory="Sensors" Group="Sensors"
    //% block="first distance from sonar at %pin1|%pin2"
    //% weight=101
    export function SonarFirstRead(pin1: DigitalPin, pin2: DigitalPin): number {
        sonarPinT = pin1
        sonarPinE = pin2
        pins.setPull(sonarPinT, PinPullMode.PullNone)
        return SonarNextRead()
    }

    //% blockId=NL_SENSOR_SonarNextRead
    //% subcategory="Sensors" Group="Sensors"
    //% block="next sonar distance"
    //% weight=100
    export function SonarNextRead(): number {
        pins.digitalWritePin(sonarPinT, 0)
        control.waitMicros(2)
        pins.digitalWritePin(sonarPinT, 1)
        control.waitMicros(10)
        pins.digitalWritePin(sonarPinT, 0)
        return Math.floor(pins.pulseIn(sonarPinE, PulseValue.High, 25000) * 34 / 2000)
    }

/// END SONAR ///


/// BEGIN MP3 ///

    export enum playType { Play = 0x0D, Stop = 0x16, PlayNext = 0x01, PlayPrevious = 0x02, Pause = 0x0E }
    let Start_Byte = 0x7E
    let Version_Byte = 0xFF
    let Command_Length = 0x06
    let End_Byte = 0xEF
    let Acknowledge = 0x00
    let CMD = 0x00
    let para1 = 0x00
    let para2 = 0x00
    let highByte = 0x00
    let lowByte = 0x00
    let dataArr: number[] = [Start_Byte, Version_Byte, Command_Length, CMD, Acknowledge, para1, para2, highByte, lowByte, End_Byte]
    let mp3musicPin: SerialPin
    let mp3music = false
    let mp3player = false
    let mp3sfxPin: SerialPin
    let mp3sfx = false
    let mp3musicVol = 0
    let mp3playerPin: SerialPin
    let mp3playerVol = 0
    let mp3sfxVol = 0
    let isPot = false
    let potPin = AnalogPin.P0
    let masterVolume = 25

    //% blockId=NL_SENSOR_TrimpotSet
    //% subcategory="Sensors" Group="Sensors"
    //% block="set volume control pot at %aPin"
    export function potSet(aPin: AnalogPin): void {
        potPin = aPin
        isPot = true
        masterVolume = potRead()
    }

    function potRead() {
        if (isPot) { return Math.round(pins.map(pins.analogReadPin(potPin), 0, 1023, 0, 30)) }
        else { return 5 }
    }

    function mp3_checkSum(): void {
        let total = 0;
        for (let i = 1; i < 7; i++) { total += dataArr[i] }
        total = 65536 - total
        lowByte = total & 0xFF;
        highByte = total >> 8;
        dataArr[7] = highByte
        dataArr[8] = lowByte
    }

    function mp3_sendData(): void {
        let myBuff = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) { myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i]) }
        serial.writeBuffer(myBuff)
        basic.pause(20) // Was 100; problematic at 10
    }

    function mp3_sendDataFast(): void {
        let myBuff = pins.createBuffer(10);
        for (let i = 0; i < 10; i++) { myBuff.setNumber(NumberFormat.UInt8BE, i, dataArr[i]) }
        serial.writeBuffer(myBuff)
    }

    //% blockId=NL_MP3_InitiateAs
    //% subcategory="MP3" group="MP3"
    //% block="Ready MP3bit for %type at %sPin"
    //% dPin.fieldEditor="gridpicker"
    export function mp3setPorts(mp3bit: mp3type, sPin: SerialPin): void {
        if (mp3bit == mp3type.music) {
            mp3musicPin = sPin
            mp3music = true
            mp3musicVol = 100
            setVolume(mp3type.music, mp3musicVol)
        } else if (mp3bit == mp3type.player) {
            mp3playerPin = sPin
            mp3player = true
            mp3playerVol = 100
            setVolume(mp3type.player, mp3playerVol)
        } else if (mp3bit == mp3type.sfxvoice) {
            mp3sfxPin = sPin
            mp3sfx = true
            mp3sfxVol = 100
            setVolume(mp3type.sfxvoice, mp3sfxVol)
        }   
    }

    //% blockId="nl_playfilefolder" 
    //% block="Play folder %folderNum file %fileNum on %sPin"
    //% subcategory=MP3 group="MP3"
    export function sendMP3fileFolder(folderNum: string, fileNum: string, sPin: SerialPin): void {
        serial.redirect(sPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        dataArr[5] = parseInt(folderNum)
        dataArr[6] = parseInt(fileNum)
        mp3_checkSum()
        mp3_sendDataFast()
    }

    //% blockId="NL_MP3_SendNumbers" 
    //% block="Send numbers for folder %folderNum file %fileNum on %sPin"
    //% subcategory=MP3 group="MP3"
    export function sendMP3numbers(folderNum: number, fileNum: number, sPin: SerialPin): void {
        serial.redirect(sPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        dataArr[3] = 15
        dataArr[5] = folderNum
        dataArr[6] = fileNum
        mp3_checkSum()
        mp3_sendDataFast()
    }

    //% blockId=NL_MP3_UpdateVolume
    //% subcategory="MP3" group="MP3"
    //% block="Update volume for all"
    export function updateVolumeGlobal(): void {
        let nowVol = potRead()
        if (masterVolume != nowVol){
            masterVolume = nowVol
            setVolume(mp3type.music, mp3musicVol)
            setVolume(mp3type.player, mp3playerVol)
            setVolume(mp3type.sfxvoice, mp3sfxVol)
        }
    }

    //% blockId=NL_MP3_SetVolume
    //% subcategory="MP3" group="MP3"
    //% block="Set %mp3bit volume to %vol"
    export function setVolume(mp3bit:mp3type, vol:number): void {
        if (mp3bit == mp3type.music) {
            serial.redirect(mp3musicPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            mp3musicVol = vol
        } else if (mp3bit == mp3type.player) {
            serial.redirect(mp3playerPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            mp3playerVol = vol
        } else if (mp3bit == mp3type.sfxvoice) {
            serial.redirect(mp3sfxPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            mp3sfxVol = vol
        }
        dataArr[3] = 6
        dataArr[5] = 0
        dataArr[6] = Math.round(vol / 100 * masterVolume)
        mp3_checkSum()
        mp3_sendData()
    }

    //% blockId=NL_MP3_GetVolumes
    //% subcategory="MP3" group="MP3"
    //% block="Get current volumes"
    export function getVolumes() {
        return "m" + mp3musicVol + " p" + mp3playerVol + " s" + mp3sfxVol + " g" + masterVolume
    }

    //% blockId="NL_MP3_StopPlayback" 
    //% block="Stop playback on %mp3bit"
    //% subcategory=MP3 group="MP3"
    export function stopPlayback(mp3bit:mp3type): void {
        if (mp3bit == mp3type.music) {
            serial.redirect(mp3musicPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        } else if (mp3bit == mp3type.player){
            serial.redirect(mp3playerPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        } else if (mp3bit == mp3type.sfxvoice) {
            serial.redirect(mp3sfxPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
        }
        CMD = 0x16
        para1 = 0x00
        para2 = 0x00
        dataArr[3] = CMD
        dataArr[5] = para1
        dataArr[6] = para2
        mp3_checkSum()
        mp3_sendData()
    }

/// END MP3 ///

/// BEGIN SOUND BANK ///
    export enum mp3type { music, player, sfxvoice }
    export enum musicGenre { intro, tutorial, awaiting, level, won, lost }
    export enum playerSaying { ready, yay, intro, nay, ouch, success, failure, won, lost, hurry }
    export enum sfxType { correct, incorrect, ghost, fire, explosion, cannon, splash, spark, slash, woof }
    export enum voiceSaying { name, begin, retry, next, complete, gameover, welcome, intro, howto1, howto2, howto3, howto4, howto5, howto6, howto7, howto8, howto9 }
    export enum magicianSaysSide { left, right }
    export enum magicianDifficulty { easy, medium, hard }
    export enum spotName { A, B, C, D, E, F, G, H, I }
    export enum playerChar { mario, luigi, peach, daisy, toad, wario }

    let sb_music_tutorial = feedBank("1.1.46|1.2.51|1.3.51|1.4.59|1.5.60|1.6.60|1.7.60|1.8.60|1.9.60|1.10.60|1.11.60|1.12.60|1.13.60|1.14.60|1.15.60|1.16.60|1.17.60|1.18.60|1.19.60|1.20.60|1.21.60")
    let sb_music_awaiting = feedBank("2.1.64|2.2.120|2.3.120|2.4.120|2.5.120|2.6.114|2.7.120|2.8.103|2.9.120|2.10.120|2.11.120|2.12.120|2.13.119|2.14.120|2.15.120|2.16.103|2.17.119|2.18.120|2.19.86|2.20.120")
    let sb_music_level = feedBank("3.1.120|3.2.120|3.3.120|3.4.120|3.5.120|3.6.120|3.7.120|3.8.120|3.9.120|3.10.92|3.11.120|3.12.120|3.13.111|3.14.116|3.15.98|3.16.120|3.17.120|3.18.82|3.19.120|3.20.120|3.21.120|3.22.120|3.23.120|3.24.120|3.25.120|3.26.120|3.27.91|3.28.120|3.29.120|3.30.41|3.31.120|3.32.120|3.33.120|3.34.94|3.35.120|3.36.120|3.37.120|3.38.120|3.39.120|3.40.120|3.41.78|3.42.120|3.43.120|3.44.120|3.45.120|3.46.120|3.47.120|3.48.120|3.49.120|3.50.120|3.51.120|3.52.113|3.53.120|3.54.120|3.55.42|3.56.120|3.57.120|3.58.120|3.59.114|3.60.120|3.61.120|3.62.118|3.63.120|3.64.120|3.65.120|3.66.120|3.67.120|3.68.59|3.69.120|3.70.120|3.71.118|3.72.120|3.73.120|3.74.70|3.75.120|3.76.120|3.77.120|3.78.120|3.79.120|3.80.120|3.81.120|3.82.120|3.83.80|3.84.120|3.85.120|3.86.120|3.87.120|3.88.107|3.89.120|3.90.120|3.91.120|3.92.120|3.93.36|3.94.120|3.95.120|3.96.120|3.97.120|3.98.120|3.99.120|3.100.63|3.101.120|3.102.120|3.103.112|3.104.105|3.105.120|3.106.110|3.107.120|3.108.120|3.109.120|3.110.120|3.111.120|3.112.120|3.113.120|3.114.120|3.115.120|3.116.119|3.117.120|3.118.120|3.119.120|3.120.120|3.121.120|3.122.120|3.123.120|3.124.120|3.125.120|3.126.104|3.127.120|3.128.87|3.129.120|3.130.118|3.131.120|3.132.120|3.133.50|3.134.109|3.135.120|3.136.120|3.137.120|3.138.91|3.139.120|3.140.120|3.141.120|3.142.120|3.143.120|3.144.120|3.145.104|3.146.112|3.147.120")
    let sb_music_won = feedBank("4.1.30|4.2.22|4.3.30|4.4.17|4.5.29|4.6.30|4.7.30|4.8.30|4.9.30|4.10.30|4.11.20|4.12.28|4.13.30|4.14.15|4.15.30|4.16.17|4.17.17|4.18.15|4.19.30|4.20.30|4.21.30|4.22.17|4.23.30|4.24.30|4.25.30")
    let sb_music_lost = feedBank("5.1.30|5.2.30|5.3.30|5.4.30|5.5.30|5.6.30|5.7.30|5.8.30|5.9.30|5.10.30|5.11.30")
    let sb_music_intro = feedBank("9.1.3|9.2.4|9.3.8|9.4.5|9.5.4|9.6.12|9.7.3|9.8.7|9.9.6|9.10.7|9.11.9|9.12.9|9.13.11|9.14.3|9.15.10|9.16.3|9.17.6|9.18.5|9.19.6|9.20.5|9.21.7|9.22.5|9.23.3|9.24.7|9.25.6|9.26.6|9.27.11|9.28.5|9.29.5|9.30.4|9.31.6|9.32.4|9.33.4|9.34.10|9.35.8|9.36.8|9.37.3|9.38.7|9.39.4|9.40.6|9.41.3|9.42.7|9.43.7|9.44.3|9.45.6|9.46.1|9.47.2|9.48.2|9.49.8|9.50.16|9.51.9|9.52.10|9.53.13|9.54.14|9.55.14|9.56.16|9.57.7|9.58.4|9.59.9|9.60.8|9.61.9|9.62.9|9.63.12|9.64.4|9.65.6|9.66.9|9.67.5|9.68.6|9.69.5|9.70.10|9.71.8|9.72.8|9.73.5|9.74.3")
    let sb_sfx_correct = feedBank("6.1.5|6.2.8|6.3.6|6.4.7|6.5.6|6.6.14|6.7.7|6.8.8|6.9.12|6.10.7|6.11.9|6.12.7|6.13.10|6.14.8|6.15.8|6.16.4|6.17.7|6.18.4|6.19.2|6.20.10|6.21.7|6.22.7|6.23.6|6.24.4|6.25.7|6.26.12|6.27.4|6.28.6|6.29.6|6.30.6|6.31.4|6.32.5|6.33.3|6.34.6|6.35.6|6.36.6|6.37.6|6.38.4|6.39.8|6.40.6|6.41.3|6.42.3|6.43.7|6.44.8|6.45.6|6.46.2|6.47.5|6.48.7|6.49.8|6.50.7|6.51.6|6.52.7|6.53.6|6.54.8|6.55.5|6.56.5|6.57.7|6.58.6|6.59.8|6.60.5|6.61.6|6.62.8|6.63.3|6.64.3|6.65.6|6.66.3|6.67.6|6.68.2|6.69.3|6.70.3|6.71.2|6.72.3|6.73.6|6.74.7|6.75.5|6.76.3|6.77.5|6.78.3|6.79.2|6.80.3|6.81.3|6.82.1|6.83.1|6.84.1|6.85.1|6.86.1|6.87.1|6.88.3|6.89.1|6.90.1|6.91.4|6.92.4")
    let sb_sfx_incorrect = feedBank("7.1.6|7.2.5|7.3.3|7.4.5|7.5.7|7.6.6|7.7.4|7.8.1|7.9.3|7.10.4|7.11.3|7.12.3|7.13.6|7.14.3|7.15.1|7.16.1|7.17.1|7.18.1|7.19.5|7.20.4|7.21.3|7.22.7")
    let sb_sfx_beep = feedBank("8.1.1|8.2.2|8.3.1")
    let sb_sfx_smash = feedBank("8.4.1|8.5.1|8.6.1|8.7.3")
    let sb_sfx_falling = feedBank("8.8.6")
    let sb_sfx_boom = feedBank("8.9.1|8.10.2|8.11.3|8.12.2")
    let sb_sfx_cannon = feedBank("8.13.2|8.14.1|8.15.1|8.16.2|8.17.2")
    let sb_sfx_fire = feedBank("8.18.2|8.19.2|8.20.5|8.21.2")
    let sb_sfx_ghost = feedBank("8.22.5|8.23.4|8.24.5|8.25.5")
    let sb_sfx_hit = feedBank("8.26.1|8.27.1|8.28.1|8.29.1|8.30.1")
    let sb_sfx_slash = feedBank("8.31.1|8.32.1|8.33.1|8.34.1|8.35.1|8.36.1|8.37.1|8.38.1|8.39.1|8.40.1|8.41.1|8.42.2")
    let sb_sfx_zap = feedBank("8.43.1|8.44.1|8.45.2|8.46.1|8.47.2|8.48.1")
    let sb_sfx_splash = feedBank("8.49.2|8.50.2|8.51.1|8.52.1|8.53.2|8.54.1|8.55.2|8.56.1|8.57.2")
    let sb_sfx_voice = feedBank("10.1.4|10.2.11|10.3.10|10.4.9|10.5.8|10.6.18|10.7.14|10.8.10|10.9.6|10.10.2|10.11.3|10.12.2")
    let sb_magician_left_easy = feedBank("20.1.7|20.2.5|20.3.7|20.4.6|20.5.8")
    let sb_magician_left_medium = feedBank("21.1.11|21.2.6|21.3.8|21.4.8|21.5.8")
    let sb_magician_left_hard = feedBank("22.1.8|22.2.9|22.3.8")
    let sb_magician_right_easy = feedBank("23.1.5|23.2.6|23.3.8")
    let sb_magician_right_medium = feedBank("24.1.7|24.2.8")
    let sb_magician_right_hard = feedBank("25.1.7|25.2.8")
    let sb_mario_name = feedBank("12.1.2|12.2.1|12.4.2|12.5.3")
    let sb_mario_intro = feedBank("12.3.4|12.6.2|12.7.212.112.1|12.113.1|")
    let sb_mario_ready = feedBank("12.8.1|12.9.2|12.10.2|12.11.1|12.12.1|12.13.2|12.14.2|12.15.2|12.16.2|12.17.2|12.18.1")
    let sb_mario_yay = feedBank("12.19.1|12.20.1|12.21.1|12.22.1|12.23.1|12.24.1|12.25.1|12.26.1|12.27.1|12.28.1|12.29.1|12.30.1|12.31.1|12.32.1|12.33.1|12.34.1|12.35.1|12.36.1|12.37.1|12.38.1|12.39.1|12.40.1|12.41.1|12.42.1|12.43.1|12.44.1|12.45.1|12.46.1|12.47.1|12.48.1|12.49.1|12.50.1|12.51.2|12.52.2|12.53.2|12.54.2|12.55.2|12.56.2|12.57.2|12.58.2|12.59.2|12.60.2|12.61.2|12.62.2")
    let sb_mario_success = feedBank("12.63.1|12.64.2|12.65.2|12.66.2|12.67.2|12.68.3|12.69.3|12.70.3|12.71.3|12.72.3")
    let sb_mario_won = feedBank("12.73.2|12.74.2|12.75.3|12.76.3|12.77.3")
    let sb_mario_ouch = feedBank("12.78.1|12.79.1|12.80.1|12.81.1|12.82.1|12.83.1|12.84.1|12.85.1|12.86.1|12.87.1|12.88.1|12.89.1|12.90.1|12.91.1|12.92.1|12.93.1|12.94.1|12.95.1")
    let sb_mario_nay = feedBank("12.96.1|12.97.1|12.98.1|12.99.1|12.100.1|12.101.1|12.102.2|12.103.1|12.104.1|12.105.1|12.106.1|12.107.1|12.108.1|12.109.1|12.110.2|12.111.2")
    let sb_mario_failure = feedBank("12.114.2|12.115.2|12.116.2|12.117.1")
    let sb_mario_lost = feedBank("12.118.3|12.119.3|12.120.4|12.121.1")
    let sb_mario_hurry = feedBank("12.122.44")
    let sb_woof = feedBank("26.1.1|26.2.1|26.3.1|26.4.1|26.5.1|26.6.1|26.7.1|26.8.1")
    
    let playlist_tutorial = makePlaylist(sb_music_tutorial)
    let playlist_awaiting = makePlaylist(sb_music_awaiting)
    let playlist_level = makePlaylist(sb_music_level)
    let playlist_won = makePlaylist(sb_music_won)
    let playlist_lost = makePlaylist(sb_music_lost)
    let playlist_correct = makePlaylist(sb_sfx_correct)
    let playlist_incorrect = makePlaylist(sb_sfx_incorrect)
    let playlist_intro = makePlaylist(sb_music_intro)
    let playlist_boom = makePlaylist(sb_sfx_boom)
    let playlist_smash = makePlaylist(sb_sfx_smash)
    let playlist_falling = makePlaylist(sb_sfx_falling)
    let playlist_cannon = makePlaylist(sb_sfx_cannon)
    let playlist_fire = makePlaylist(sb_sfx_fire)
    let playlist_ghost = makePlaylist(sb_sfx_ghost)
    let playlist_hit = makePlaylist(sb_sfx_hit)
    let playlist_slash = makePlaylist(sb_sfx_slash)
    let playlist_zap = makePlaylist(sb_sfx_zap)
    let playlist_splash = makePlaylist(sb_sfx_splash)
    let playlist_magician_left_easy = makePlaylist(sb_magician_left_easy)
    let playlist_magician_left_medium = makePlaylist(sb_magician_left_medium)
    let playlist_magician_left_hard = makePlaylist(sb_magician_left_hard)
    let playlist_magician_right_easy = makePlaylist(sb_magician_right_easy)
    let playlist_magician_right_medium = makePlaylist(sb_magician_right_medium)
    let playlist_magician_right_hard = makePlaylist(sb_magician_right_hard)
    let playlist_mario_name = makePlaylist(sb_mario_name)
    let playlist_mario_intro = makePlaylist(sb_mario_intro)
    let playlist_mario_ready = makePlaylist(sb_mario_ready)
    let playlist_mario_yay = makePlaylist(sb_mario_yay)
    let playlist_mario_success = makePlaylist(sb_mario_success)
    let playlist_mario_won = makePlaylist(sb_mario_won)
    let playlist_mario_ouch = makePlaylist(sb_mario_ouch)
    let playlist_mario_nay = makePlaylist(sb_mario_nay)
    let playlist_mario_failure = makePlaylist(sb_mario_failure)
    let playlist_mario_lost = makePlaylist(sb_mario_lost)
    let playlist_mario_hurry = makePlaylist(sb_mario_hurry)
    let playlist_woof = makePlaylist(sb_woof)
    let playtimeMusic = 0
    let playtimePlayer = 0
    let playtimeSfxVoice = 0

    function takeRotate(PlaylistIn: number[]) {
        let returnTrack = PlaylistIn.shift()
        PlaylistIn.push(returnTrack)
        return returnTrack
    }
    function feedBank(BankString: string) {
        let returnBank: number[][] = []
        let BankSplit = BankString.split("|")
        for (let soundString of BankSplit) {
            returnBank.push([parseFloat(soundString.split(".")[0]), parseFloat(soundString.split(".")[1]), parseFloat(soundString.split(".")[2])])
        }
        return returnBank
    }
    function makePlaylist(SoundBank: any[]) {
        let returnList: number[] = []
        let orderedList: number[] = []
        for (let soundNo = 0; soundNo <= SoundBank.length - 1; soundNo++) {
            orderedList.push(soundNo)
        }
        while (orderedList.length > 0) {
            let randTrack = randint(0, orderedList.length - 1)
            returnList.push(orderedList.removeAt(randTrack))
        }
        return returnList
    }
    function bankPlay(mp3bit:mp3type, SoundBank: number[][], trackIndex: number) {
        let theSong = SoundBank[trackIndex]
        if (mp3bit == mp3type.music) {
            serial.redirect(mp3musicPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            playtimeMusic = theSong[2]
        } else if (mp3bit == mp3type.player) {
            serial.redirect(mp3playerPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            playtimePlayer = theSong[2]
        } else if (mp3bit == mp3type.sfxvoice) {
            serial.redirect(mp3sfxPin, SerialPin.USB_RX, BaudRate.BaudRate9600)
            playtimeSfxVoice = theSong[2]
        }
        dataArr[3] = 15
        dataArr[5] = theSong[0]
        dataArr[6] = theSong[1]
        mp3_checkSum()
        mp3_sendDataFast()
    }


    //% blockId=NL_MP3_PlaytimeMusic
    //% subcategory="MP3" group="MP3"
    //% block="duration of music"
    export function mp3durationMusic(): number{
        return playtimeMusic
    }

    //% blockId=NL_MP3_PlaytimePlayer
    //% subcategory="MP3" group="MP3"
    //% block="duration of player sound"
    export function mp3durationPlayer(): number {
        return playtimePlayer
    }

    //% blockId=NL_MP3_PlaytimeSFX
    //% subcategory="MP3" group="MP3"
    //% block="duration of sfx/voice"
    export function mp3durationSfxVoice(): number {
        return playtimeSfxVoice
    }



    //% blockId=NL_MP3_MusicPlay
    //% subcategory="MP3" group="MP3"
    //% block="Play %genre music"
    export function mp3musicPlay(genre: musicGenre): void {
        if (genre == musicGenre.tutorial){
            bankPlay(mp3type.music, sb_music_tutorial, takeRotate(playlist_tutorial))
        } else if (genre == musicGenre.awaiting) {
            bankPlay(mp3type.music, sb_music_awaiting, takeRotate(playlist_awaiting))
        } else if (genre == musicGenre.intro){
            bankPlay(mp3type.music, sb_music_intro, takeRotate(playlist_intro))
        } else if (genre == musicGenre.level) {
            bankPlay(mp3type.music, sb_music_level, takeRotate(playlist_level))
        } else if (genre == musicGenre.won) {
            bankPlay(mp3type.music, sb_music_won, takeRotate(playlist_won))
        } else if (genre == musicGenre.lost) {
            bankPlay(mp3type.music, sb_music_lost, takeRotate(playlist_lost))
        }
    }

    //% blockId=NL_MP3_PlayerSay
    //% subcategory="MP3" group="MP3"
    //% block="Say %saying as player"
    export function mp3sayPlay(saying: playerSaying): void {
        if(saying == playerSaying.ready){
            bankPlay(mp3type.player, sb_mario_ready, takeRotate(playlist_mario_ready))
        }else if (saying == playerSaying.yay){
            bankPlay(mp3type.player, sb_mario_yay, takeRotate(playlist_mario_yay))
        } else if (saying == playerSaying.intro) {
            bankPlay(mp3type.player, sb_mario_intro, takeRotate(playlist_mario_intro))
        } else if (saying == playerSaying.nay) {
            bankPlay(mp3type.player, sb_mario_nay, takeRotate(playlist_mario_nay))
        } else if (saying == playerSaying.ouch) {
            bankPlay(mp3type.player, sb_mario_ouch, takeRotate(playlist_mario_ouch))
        } else if (saying == playerSaying.success) {
            bankPlay(mp3type.player, sb_mario_success, takeRotate(playlist_mario_success))
        } else if (saying == playerSaying.failure) {
            bankPlay(mp3type.player, sb_mario_failure, takeRotate(playlist_mario_failure))
        } else if (saying == playerSaying.won) {
            bankPlay(mp3type.player, sb_mario_won, takeRotate(playlist_mario_won))
        } else if (saying == playerSaying.lost) {
            bankPlay(mp3type.player, sb_mario_lost, takeRotate(playlist_mario_lost))
        } else if (saying == playerSaying.hurry) {
            bankPlay(mp3type.player, sb_mario_hurry, takeRotate(playlist_mario_hurry))
        }
    }

    //% blockId=NL_MP3_VoicePlay
    //% subcategory="MP3" group="MP3"
    //% block="Say %voice as voice"
    export function mp3voicePlay(voice: voiceSaying): void {
        if (voice == voiceSaying.name) {

        } else if (voice == voiceSaying.begin) {

        } else if (voice == voiceSaying.retry) {

        } else if (voice == voiceSaying.next) {

        } else if (voice == voiceSaying.complete) {

        } else if (voice == voiceSaying.gameover) {

        } else if (voice == voiceSaying.welcome) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 0)
        } else if (voice == voiceSaying.intro) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 1)
        } else if (voice == voiceSaying.howto1) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 2)
        } else if (voice == voiceSaying.howto2) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 3)
        } else if (voice == voiceSaying.howto3) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 4)
        } else if (voice == voiceSaying.howto4) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 5)
        } else if (voice == voiceSaying.howto5) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 6)
        } else if (voice == voiceSaying.howto6) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 7)
        } else if (voice == voiceSaying.howto7) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 8)
        } else if (voice == voiceSaying.howto8) {
            bankPlay(mp3type.sfxvoice, sb_sfx_voice, 9)
        } else if (voice == voiceSaying.howto9) {

        }
    }

    let magicianBank:number[][]
    let magicianQuestion = 0
    //% blockId=NL_MP3_MagicianSay
    //% subcategory="MP3" group="MP3"
    //% block="Magician says on the %side difficulty %difficulty"
    export function mp3magician(side: magicianSaysSide, difficulty: magicianDifficulty): void {
        if (side == magicianSaysSide.left) {
            if (difficulty == magicianDifficulty.easy) {
                magicianBank = sb_magician_left_easy
                magicianQuestion = takeRotate(playlist_magician_left_easy)
            } else if (difficulty = magicianDifficulty.medium) {
                magicianBank = sb_magician_left_medium
                magicianQuestion = takeRotate(playlist_magician_left_medium)
            } else if (difficulty = magicianDifficulty.hard) {
                magicianBank = sb_magician_left_hard
                magicianQuestion = takeRotate(playlist_magician_left_hard)
            }
        } else if (side = magicianSaysSide.right) {
            if (difficulty == magicianDifficulty.easy) {
                magicianBank = sb_magician_right_easy
                magicianQuestion = takeRotate(playlist_magician_right_easy)
            } else if (difficulty = magicianDifficulty.medium) {
                magicianBank = sb_magician_right_medium
                magicianQuestion = takeRotate(playlist_magician_right_medium)
            } else if (difficulty = magicianDifficulty.hard) {
                magicianBank = sb_magician_right_hard
                magicianQuestion = takeRotate(playlist_magician_right_hard)
            }
        } 
        bankPlay(mp3type.sfxvoice, magicianBank, magicianQuestion)
    }

    //% blockId=NL_MP3_MagicianRepeat
    //% subcategory="MP3" group="MP3"
    //% block="Magician repeat last question"
    export function mp3magicianAgain(): void{
        bankPlay(mp3type.sfxvoice, magicianBank, magicianQuestion)
    }


    //% blockId=NL_MP3_SfxPlay
    //% subcategory="MP3" group="MP3"
    //% block="Play %sfx sound effect"
    export function mp3sfxPlay(sfx: sfxType): void {
        if(sfx == sfxType.correct){
            bankPlay(mp3type.sfxvoice, sb_sfx_correct, takeRotate(playlist_correct))
        }else if (sfx == sfxType.incorrect){
            bankPlay(mp3type.sfxvoice, sb_sfx_incorrect, takeRotate(playlist_incorrect))
        }else if (sfx == sfxType.ghost){
            bankPlay(mp3type.sfxvoice, sb_sfx_ghost, takeRotate(playlist_ghost))
        }else if (sfx == sfxType.fire){
            bankPlay(mp3type.sfxvoice, sb_sfx_fire, takeRotate(playlist_fire))
        }else if (sfx == sfxType.explosion){
            bankPlay(mp3type.sfxvoice, sb_sfx_boom, takeRotate(playlist_boom))
        } else if (sfx == sfxType.cannon) {
            bankPlay(mp3type.sfxvoice, sb_sfx_cannon, takeRotate(playlist_cannon))
        }else if (sfx == sfxType.splash){
            bankPlay(mp3type.sfxvoice, sb_sfx_splash, takeRotate(playlist_splash))
        } else if (sfx == sfxType.spark) {
            bankPlay(mp3type.sfxvoice, sb_sfx_zap, takeRotate(playlist_zap))
        } else if (sfx == sfxType.slash) {
            bankPlay(mp3type.sfxvoice, sb_sfx_slash, takeRotate(playlist_slash))
        }
        else if (sfx == sfxType.woof) {
            bankPlay(mp3type.sfxvoice, sb_woof, takeRotate(playlist_woof))
        }
    }
/// END SOUND BANK ///

/// BEGIN MOTOR & RELAY ///
    const kong_address = 0x10
    export enum MotorList { M1=1, M2=2 }
    export enum motors{ redrack=16, shark=4, ghost=5, cannon=8, oarrack=7, shell=6, door=3, dragon=9, wheel=1, swing=2, sock=0 }
    export enum motorState { min=1, max=3, mid=2, off=0 }
    export enum fogLevels { none = 0, light = 1, medium = 2, heavy = 3 }
    export enum sockState { dancing = 1, still = 0 }
    let motor_wheel_max = 15; let motor_wheel_min = 0;let motor_wheel_mid = 12
    let servo_redrack_max = 150; let servo_redrack_min = 100
    let servo_cannon_min = 135; let servo_cannon_max = 65
    let servo_shark_min = 20; let servo_shark_max = 85
    let servo_oarrack_min = 60; let servo_oarrack_max = 110
    let servo_ghost_min = 110; let servo_ghost_max = 40
    let servo_shell_min = 170; let servo_shell_max = 100
    let servo_door_min = 50; let servo_door_max = 140; let servo_door_mid = 100
    let motor_swing_min = 0; let motor_swing_mid = 50; let motor_swing_max = 100
    let servo_dragon_min = 90; let servo_dragon_max = 79

    export function servoSet(servo: motors, angle: number): void {
        let buf = pins.createBuffer(4);
        buf[0] = servo;
        buf[1] = angle;
        buf[2] = 0;
        buf[3] = 0;
        pins.i2cWriteBuffer(kong_address, buf);
    }

    export function motorSpeed(motor: MotorList, speed: number): void {
        let buf = pins.createBuffer(4);
        buf[0] = motor
        buf[1] = 1;
        if (speed < 0) {
            buf[1] = 2;
            speed = speed * -1
        }
        buf[2] = speed;
        buf[3] = 0;
        pins.i2cWriteBuffer(kong_address, buf);
    }

    //% blockId=NL_MOTOR_SetShim
    //% block="Set numbered %motor to %state"
    //% subcategory="Motor" group="Motor"
    export function motorSetShim(motor:number,state:number):void{
        motorSet(motor,state)
    }

    //% blockId=NL_MOTOR_Set 
    //% block="Set %motor to %state"
    //% subcategory="Motor" group="Motor"
    export function motorSet(motor:motors, state:motorState):void{
        // if (motor == motors.sock){
        //     if (state == motorState.off){
        //         setSock(sockState.still)
        //     } else if (state == motorState.max){
        //         setSock(sockState.dancing)
        //     }
        // }
        if (motor == motors.redrack){
            if (state == motorState.min){ servoSet(motor, servo_redrack_min) } 
            else if (state == motorState.max){ servoSet(motor, servo_redrack_max) }
        } if (motor == motors.shark) {
            if (state == motorState.min) { servoSet(motor, servo_shark_min) }
            else if (state == motorState.max) { servoSet(motor, servo_shark_max) }
        } if (motor == motors.ghost) {
            if (state == motorState.min) { servoSet(motor, servo_ghost_min) }
            else if (state == motorState.max) { servoSet(motor, servo_ghost_max) }
        } if (motor == motors.cannon) {
            if (state == motorState.min) { servoSet(motor, servo_cannon_min) }
            else if (state == motorState.max) { servoSet(motor, servo_cannon_max) }
        } if (motor == motors.oarrack) {
            if (state == motorState.min) { servoSet(motor, servo_oarrack_min) }
            else if (state == motorState.max) { servoSet(motor, servo_oarrack_max) }
        } if (motor == motors.shell) {
            if (state == motorState.min) { servoSet(motor, servo_shell_min) }
            else if (state == motorState.max) { servoSet(motor, servo_shell_max) }
        } if (motor == motors.door) {
            if (state == motorState.min) { servoSet(motor, servo_door_min) }
            else if (state == motorState.max) { servoSet(motor, servo_door_max) }
            else if (state == motorState.mid) { servoSet(motor, servo_door_mid) }
        } if (motor == motors.dragon) {
            if (state == motorState.min) { servoSet(motor, servo_dragon_min) }
            else if (state == motorState.max) { servoSet(motor, servo_dragon_max) }
        } if (motor == motors.wheel) {
            if (state == motorState.min) { motorSpeed(MotorList.M1, motor_wheel_min) }
            else if (state == motorState.max) { motorSpeed(MotorList.M1, motor_wheel_max) }
            else if (state == motorState.mid) { motorSpeed(MotorList.M1, motor_wheel_mid) }
            else if (state == motorState.off) { motorSpeed(MotorList.M1, 0) }
        } if (motor == motors.swing) {
            if (state == motorState.min) { motorSpeed(MotorList.M2, motor_swing_min) }
            else if (state == motorState.mid) { motorSpeed(MotorList.M2, motor_swing_mid) }
            else if (state == motorState.max) { motorSpeed(MotorList.M2, motor_swing_max) }
            else if (state == motorState.off) { motorSpeed(MotorList.M2, 0) }
        }
    }

    //% blockId=NL_RELAY_FogSet 
    //% block="set fog level to %level"
    //% subcategory="Motor" group="Motor"
    export function setFog(fog:fogLevels):void{
        if (fog == fogLevels.none){
            pins.digitalWritePin(DigitalPin.P2, 1)
            pins.digitalWritePin(DigitalPin.P8, 1)
            pins.digitalWritePin(DigitalPin.P13, 1)
        } else if (fog == fogLevels.light){
            pins.digitalWritePin(DigitalPin.P2, 1)
            pins.digitalWritePin(DigitalPin.P8, 1)
            pins.digitalWritePin(DigitalPin.P13, 0)
        } else if (fog == fogLevels.medium) {
            pins.digitalWritePin(DigitalPin.P2, 0)
            pins.digitalWritePin(DigitalPin.P8, 1)
            pins.digitalWritePin(DigitalPin.P13, 0)
        } else if (fog == fogLevels.heavy) {
            pins.digitalWritePin(DigitalPin.P2, 0)
            pins.digitalWritePin(DigitalPin.P8, 0)
            pins.digitalWritePin(DigitalPin.P13, 0)
        }
    }

    //% blockId=NL_RELAY_SockSet
    //% block="set dancing sock to %sockState"
    //% subcategory="Motor" group="Motor"
    export function setSock(state: sockState): void {
        if(state==sockState.dancing){ pins.digitalWritePin(DigitalPin.P12, 0) }
        else{ pins.digitalWritePin(DigitalPin.P12, 1) }
    }

/// END MOTOR & RELAY ///

/// BEGIN OLED

    let d1 = [0, 0, 0, 20, 36, 35, 54, 0, 28, 65, 8, 8, 160, 8, 96, 32, 62, 0, 98, 34, 24, 39, 60, 1, 54, 6, 0, 0, 8, 20, 65, 2, 50, 126, 127, 62, 127, 127, 127, 62, 127, 65, 32, 127, 127, 127, 127, 62, 127, 62, 127, 38, 1, 63, 31, 63, 99, 3, 97, 127, 2, 65, 4, 128, 1, 32, 127, 56, 56, 56, 8, 24, 127, 0, 128, 127, 65, 124, 124, 56, 252, 24, 0, 72, 4, 60, 28, 60, 68, 28, 68, 8, 0, 65, 2]
    let d2 = [0, 95, 7, 127, 42, 19, 73, 5, 34, 34, 42, 8, 96, 8, 96, 16, 81, 66, 81, 65, 20, 69, 74, 113, 73, 73, 54, 172, 20, 20, 34, 1, 73, 9, 73, 65, 65, 73, 9, 65, 8, 127, 64, 8, 64, 2, 4, 65, 9, 65, 9, 73, 1, 64, 32, 64, 20, 4, 81, 65, 4, 65, 2, 128, 2, 84, 72, 68, 68, 84, 126, 164, 8, 125, 132, 16, 127, 4, 8, 68, 36, 36, 124, 84, 127, 64, 32, 64, 40, 160, 100, 54, 127, 54, 1]
    let d3 = [0, 0, 0, 20, 127, 8, 85, 3, 65, 28, 28, 62, 0, 8, 0, 8, 73, 127, 73, 73, 18, 69, 73, 9, 73, 73, 54, 108, 34, 20, 20, 81, 121, 9, 73, 65, 65, 73, 9, 65, 8, 65, 65, 20, 64, 12, 8, 65, 9, 81, 25, 73, 127, 64, 64, 56, 8, 120, 73, 65, 8, 127, 1, 128, 4, 84, 68, 68, 68, 84, 9, 164, 4, 0, 125, 40, 64, 24, 4, 68, 36, 36, 8, 84, 68, 64, 64, 48, 16, 160, 84, 65, 0, 8, 1]
    let d4 = [0, 0, 7, 127, 42, 100, 34, 0, 0, 0, 42, 8, 0, 8, 0, 4, 69, 64, 73, 73, 127, 69, 73, 5, 73, 41, 0, 0, 65, 20, 8, 9, 65, 9, 73, 65, 34, 73, 9, 81, 8, 0, 63, 34, 64, 2, 16, 65, 9, 33, 41, 73, 1, 64, 32, 64, 20, 4, 69, 0, 16, 0, 2, 128, 0, 84, 68, 40, 72, 84, 2, 164, 4, 0, 0, 68, 0, 4, 124, 56, 24, 252, 4, 36, 0, 124, 32, 64, 40, 124, 76, 0, 0, 0, 2]
    let d5 = [0, 0, 0, 20, 18, 98, 80, 0, 0, 0, 8, 8, 0, 8, 0, 2, 62, 0, 70, 54, 16, 57, 48, 3, 54, 30, 0, 0, 0, 20, 0, 6, 62, 126, 54, 34, 28, 65, 1, 114, 127, 0, 1, 65, 64, 127, 127, 62, 6, 94, 70, 50, 1, 63, 31, 63, 99, 3, 67, 0, 32, 0, 4, 128, 0, 120, 56, 0, 127, 24, 0, 124, 120, 0, 0, 0, 0, 120, 0, 0, 0, 0, 0, 0, 0, 0, 28, 60, 68, 0, 68, 0, 0, 0, 1]

    let display = [" . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split(".")]
    let desired = [" . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split("."), " . . . . . . . . . . . . . . . ".split(".")]

    //% blockId=NL_OLED_Update3
    //% block="oled update from buffer"
    //% subcategory="Display" group="Display"
    export function changeThree(): void{
        let updated: string[][] = []
        let count = 0
        for (let row=0; row<8; row++){
            for(let col=0; col<16; col++){
                let refChar = desired[row][col]
                if (refChar != display[row][col]){
                    writeChar(refChar,row,col)
                    display[row][col] = refChar
                    count++
                    if (count >= 3){
                        return;
                    }
                }
            }
        }
    }

    //% blockId=NL_OLED_PrintLine
    //% block="print %text to oled buffer line %line"
    //% subcategory="Display" group="Display"
    export function printLine(text:any, line:number): void{
        let thisText = text + ""
        for (let i = 0; i < 16; i++){
            if (i < thisText.length){
                desired[line][i]=thisText.charAt(i)
            } else{
                desired[line][i]=" "
            }
        }
    }

    function oledcmd(c: number) {
        pins.i2cWriteNumber(0x3c, c, NumberFormat.UInt16BE);
    }

    function setText(row: number, column: number) {
        oledcmd(0xB0 + row);            //set page address
        oledcmd(0x00 + (8 * column & 0x0F));  //set column lower address
        oledcmd(0x10 + ((8 * column >> 4) & 0x0F));   //set column higher address
    }

    //% blockId=NL_OLED_Init 
    //% block="initiate the oled screen"
    //% subcategory="Display" group="Display"
    export function oledinit(): void {
        oledcmd(0xAE);  // Set display OFF
        oledcmd(0xD5);  // Set Display Clock Divide Ratio / OSC Frequency 0xD4
        oledcmd(0x80);  // Display Clock Divide Ratio / OSC Frequency 
        oledcmd(0xA8);  // Set Multiplex Ratio
        oledcmd(0x3F);  // Multiplex Ratio for 128x64 (64-1)
        oledcmd(0xD3);  // Set Display Offset
        oledcmd(0x00);  // Display Offset
        oledcmd(0x40);  // Set Display Start Line
        oledcmd(0x8D);  // Set Charge Pump
        oledcmd(0x14);  // Charge Pump (0x10 External, 0x14 Internal DC/DC)
        oledcmd(0xA1);  // Set Segment Re-Map
        oledcmd(0xC8);  // Set Com Output Scan Direction
        oledcmd(0xDA);  // Set COM Hardware Configuration
        oledcmd(0x12);  // COM Hardware Configuration
        oledcmd(0x81);  // Set Contrast
        oledcmd(0xCF);  // Contrast
        oledcmd(0xD9);  // Set Pre-Charge Period
        oledcmd(0xF1);  // Set Pre-Charge Period (0x22 External, 0xF1 Internal)
        oledcmd(0xDB);  // Set VCOMH Deselect Level
        oledcmd(0x40);  // VCOMH Deselect Level
        oledcmd(0xA4);  // Set all pixels OFF
        oledcmd(0xA6);  // Set display not inverted
        oledcmd(0xAF);  // Set display On
        for (let j = 0; j < 8; j++) {
            setText(j, 0);
            {
                for (let i = 0; i < 16; i++)  //clear all columns
                {
                    writeChar(" ",j,i)
                }
            }
        }
    }

    function writeChar(char: string, row: number, column: number) {
        setText(row, column)
        let i = char.charCodeAt(0) - 32
        pins.i2cWriteNumber(0x3c, 0x4000, NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d1[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d2[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d3[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d4[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000 + d5[i], NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000, NumberFormat.UInt16BE)
        pins.i2cWriteNumber(0x3c, 0x4000, NumberFormat.UInt16BE)
    }

/// END OLED


/// BEGIN DIGITS

    let _SEGMENTS = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F, 0x77, 0x7C, 0x39, 0x5E, 0x79, 0x71];

    //% blockId=nl_digits_create block="4-Digit cPin %cPin dPin %dPin"
    //% subcategory="Display" group="Display"
    export function tm1637Create(cPin: DigitalPin, dPin: DigitalPin): TM1637LEDs {
        let display = new TM1637LEDs();
        display.clk = cPin
        display.dio = dPin
        display.brightness = 7;
        display.init();
        return display;
    }
    export class TM1637LEDs {
        buf: Buffer;
        clk: DigitalPin;
        dio: DigitalPin;
        _ON: number;
        brightness: number;
        init(): void {
            pins.digitalWritePin(this.clk, 0);
            pins.digitalWritePin(this.dio, 0);
            this._ON = 8;
            this.buf = pins.createBuffer(4);
            this.clear();
        }
        _start() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 0);
        }
        _stop() {
            pins.digitalWritePin(this.dio, 0);
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.dio, 1);
        }
        _write_data_cmd() {
            this._start();
            this._write_byte(0x40);
            this._stop();
        }
        _write_dsp_ctrl() {
            this._start();
            this._write_byte(0x80 | this._ON | this.brightness);
            this._stop();
        }
        _write_byte(b: number) {
            for (let i = 0; i < 8; i++) {
                pins.digitalWritePin(this.dio, (b >> i) & 1);
                pins.digitalWritePin(this.clk, 1);
                pins.digitalWritePin(this.clk, 0);
            }
            pins.digitalWritePin(this.clk, 1);
            pins.digitalWritePin(this.clk, 0);
        }
        _intensity(val: number = 7) {
            this._ON = 8;
            this.brightness = val - 1;
            this._write_data_cmd();
            this._write_dsp_ctrl();
        }
        _dat(bit: number, dat: number) {
            this._write_data_cmd();
            this._start();
            this._write_byte(0xC0 | (bit % 4))
            this._write_byte(dat);
            this._stop();
            this._write_dsp_ctrl();
        }
        
        //% blockId=nl_digits_digit block="%display|show single number|%num|at digit|%bit"
        //% subcategory="Display" group="Display"
        //% bit.defl=1 bit.min=0 bit.max=9
        showbit(num: number = 5, bit: number = 0) {
            //bit = Math.map(bit, 4, 1, 0, 3)
            this.buf[bit % 4] = _SEGMENTS[num % 16]
            this._dat(bit, _SEGMENTS[num % 16])
        }

        //% blockId=nl_digits_minus block="%display|show minus"
        //% subcategory="Display" group="Display"
        showminus() {
            //bit = Math.map(bit, 4, 1, 0, 3)
            this._dat(0, 0x40) // '-'
        }

        //% blockId=nl_digits_timer block="%display centered time|%num"
        //% subcategory="Display" group="Display"
        showtime(num: number) {
            num=Math.clamp(0,99,num)
            this.clear()
            this.showbit(Math.idiv(num,10)%10,1)
            this.showbit(Math.idiv(num,1) % 10, 2)
        }

        //% blockId=nl_digits_prettynumber block="%display|show pretty number|%num"
        //% subcategory="Display" group="Display"
        showPrettyNumber(num: number) {
            this.clear()
            if (num < 0) {
                num = Math.clamp(0,999,-num)
                if (num >= 100) {
                    this.showbit(Math.idiv(num, 100) % 10, 1)
                    this.showbit(Math.idiv(num, 10) % 10, 2)
                    this.showbit(num % 10, 3)
                } else if (num >= 10) {
                    this.showbit(Math.idiv(num, 10) % 10, 1)
                    this.showbit(num % 10, 2)
                } else{
                    this.showbit(num % 10, 1)
                }
                this._dat(0, 0x40) // '-'
            }
            else {
                if (num >= 1000) {
                    this.showbit(Math.idiv(num, 1000) % 10, 0)
                    this.showbit(Math.idiv(num, 100) % 10, 1)
                    this.showbit(Math.idiv(num, 10) % 10, 2)
                    this.showbit(num % 10, 3)
                }else if (num >= 100) {
                    this.showbit(Math.idiv(num, 100) % 10, 1)
                    this.showbit(Math.idiv(num, 10) % 10, 2)
                    this.showbit(num % 10, 3)
                } else if (num >= 10) {
                    this.showbit(Math.idiv(num, 10) % 10, 2)
                    this.showbit(num % 10, 3)
                } else {
                    this.showbit(num % 10, 3)
                }
            }
        }

        //% blockId=nl_digits_number block="%display|show number|%num"
        //% subcategory="Display" group="Display"
        showNumber(num: number) {
            if (num < 0) {
                num = -num
                this.showbit(Math.idiv(num, 1000) % 10)
                this.showbit(num % 10, 1)
                this.showbit(Math.idiv(num, 10) % 10, 2)
                this.showbit(Math.idiv(num, 100) % 10, 3)
                this._dat(0, 0x40) // '-'
                // this._dat(0, 0) // blank
            }
            else {
                this.showbit(Math.idiv(num, 1000) % 10)
                this.showbit(num % 10, 1)
                this.showbit(Math.idiv(num, 10) % 10, 2)
                this.showbit(Math.idiv(num, 100) % 10, 3)
            }
        }
        //% blockId="nl_digits_clear" block="clear display %display"
        //% subcategory="Display" group="Display"
        clear() {
            for (let i = 0; i < 4; i++) {
                this._dat(i, 0)
                this.buf[i] = 0
            }
        }
    }

/// END DIGITS

}


