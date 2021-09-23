/*
All this code are from HID-master\src\KeyboardLayouts\ImprovedKeylayouts.h
                        https://github.com/NicoHood/HID
All value are converted to decimal and increment by 100 to differentiate it from normal ascii
*/
function keycodeToKeyboard(key) { // This function transform keycodes from javascript to a keyboard code for the arduino
    var toArduinoCode = {
        13: 40, //KEY_ENTER or KEY_RETURN
        16: 225, //KEY_LEFT_SHIFT
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
        44: 70, //KEY_PRINT-------------------------
        45: 73, //KEY_INSERT
        46: 76, //KEY_DELETE
        48: 39, //KEY_0
        49: 30, //KEY_1
        50: 31, //KEY_2
        51: 32, //KEY_3
        52: 33, //KEY_4
        53: 34, //KEY_5
        54: 35, //KEY_6
        55: 36, //KEY_7
        56: 37, //KEY_8
        57: 38, //KEY_9
        91: 227, //KEY_LEFT_WINDOWS
        93: 01, //KEY_MENU
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
        145: 71, //KEY_SCROLL_LOCK
        186: 48, //KEY_RIGHT_BRACE ($)
        187: 46, //KEY_EQUAL
        188: 16, //KEY_M (,?)
        190: 54, //KEY_COMMA
        191: 55, //KEY_PERIOD
        192: 52, //KEY_QUOTE
        219: 45, //KEY_MINUS (")" °)
        220: 49, //KEY_BACKSLASH
        221: 47, //KEY_LEFT_BRACE (^)
        222: 53, //KEY_TILDE (²)
        223: 56, //KEY_SLASH (!)
        226: 100, //KEY_NON_US (<>)
        1016: 225, //KEY_LEFT_SHIFT
        2016: 229, //KEY_RIGHT_SHIFT
        1017: 224, //KEY_LEFT_CTRL
        2017: 228, //KEY_RIGHT_CTRL
        1018: 226, //KEY_LEFT_ALT
        2018: 230 //KEY_RIGHT_ALT


    }
    if (toArduinoCode[key]) {
        return toArduinoCode[key] + 100;
    } else {
        return key;
    }
}