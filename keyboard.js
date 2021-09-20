function keycodeToKeyboard(key) { // This function transform keycodes from javascript to a keyboard code for the arduino
    var toArduinoCode = {
        17: 224, //KEY_LEFT_CTRL
        18: 226, //KEY_LEFT_ALT
        19: 72, //KEY_PAUSE
        20: 57, //KEY_CAPS_LOCK
        27: 41, //KEY_ESC
        33: 75, //KEY_PAGE_UP
        34: 78, //KEY_PAGE_DOWN
        35: 77, //KEY_END
        36: 74, //KEY_HOME
        37: 80, //KEY_LEFT_ARROW
        38: 82, //KEY_UP_ARROW
        39: 79, //KEY_RIGHT_ARROW
        40: 81, //KEY_DOWN_ARROW
    }
    if (toArduinoCode[key]) {
        return toArduinoCode[key];
    } else {
        return key;
    }
}