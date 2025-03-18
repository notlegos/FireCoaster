function radioSay (text5: string, val: number) {
    radio.sendValue("" + btToken + text5, val)
    notLegos.printLine("said: " + text5 + "=" + val, 7)
}
function setRadio (key: string, channel: number) {
    btToken = "" + key.substr(0, 2) + "$"
    radio.setGroup(channel)
}
let btToken = ""
pins.setAudioPinEnabled(false)
led.enable(false)
setRadio("KC", 171)
