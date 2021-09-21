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
        44: 70, //KEY_PRINT
        45: 73, //KEY_INSERT
        46: 76, //KEY_DELETE
        91: 227, //KEY_LEFT_WINDOWS
        93: 101, //KEY_MENU
        96: 98, //KEYPAD_0
        97: 89, //KEYPAD_1
        98: 90, //KEYPAD_2
        99: 91, //KEYPAD_3
        100: 92, //KEYPAD_4
        101: 93, //KEYPAD_5
        102: 94, //KEYPAD_6
        103: 95, //KEYPAD_7
        104: 96, //KEYPAD_8
        105: 97, //KEYPAD_9
        106: 85, //KEYPAD_MULTIPLY
        107: 87, //KEYPAD_ADD
        109: 86, //KEYPAD_SUBTRACT
        110: 99, //KEYPAD_DOT
        111: 84, //KEYPAD_DIVIDE 
        112: 58, //KEY_F1
        113: 59, //KEY_F2
        114: 60, //KEY_F3
        115: 61, //KEY_F4
        116: 62, //KEY_F5
        117: 63, //KEY_F6
        118: 64, //KEY_F7
        119: 65, //KEY_F8
        120: 66, //KEY_F9
        121: 67, //KEY_F10
        122: 68, //KEY_F11
        123: 69, //KEY_F12
        144: 83, //KEY_NUM_LOCK
        145: 81, //KEY_SCROLL_LOCK
        186: 0, //$
        187: 46, //KEY_EQUAL
        190: 51, //KEY_SEMICOLON
        191: 55, //KEY_PERIOD
        192: 52, //KEY_QUOTE
        219: 0, //---
        220: 0, //---
        221: 0, //---
        222: 0, //---
        223: 207, //KEYPAD_EXCLAMATION_POINT
        226: 0, //---
    }
    if (toArduinoCode[key]) {
        return toArduinoCode[key];
    } else {
        return key;
    }
}