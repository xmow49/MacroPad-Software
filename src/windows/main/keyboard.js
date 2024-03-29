/*
All this code are from HID-master\src\KeyboardLayouts\ImprovedKeylayouts.h
                        https://github.com/NicoHood/HID
All value are converted to decimal and increment by 100 to differentiate it from normal ascii
*/
function keycodeToKeyboard(key) { // This function transform keycodes from javascript to a keyboard code for the arduino
    var toArduinoCode = {
        8: 42, //backspace
        9: 43, //tab
        12: 156, //clear
        13: 40, //KEY_ENTER or KEY_RETURN
        16: 225, //KEY_LEFT_SHIFT
        17: 224, //KEY_LEFT_CTRL
        18: 226, //KEY_LEFT_ALT
        19: 72, //KEY_PAUSE
        20: 57, //KEY_CAPS_LOCK 
        27: 41, //KEY_ESC
        32: 44, //KEY_SPACE
        33: 75, //KEY_PAGE_UP
        34: 78, //KEY_PAGE_DOWN
        35: 77, //KEY_END
        36: 74, //KEY_HOME
        37: 80, //KEY_LEFT_ARROW
        38: 82, //KEY_UP_ARROW
        39: 79, //KEY_RIGHT_ARROW
        40: 81, //KEY_DOWN_ARROW
        41: 119, //SELECT
        42: 70, //PRINT
        43: 116, //EXECUTE
        44: 70, //KEY_PRINT
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
        58: 55, //KEY_COLON(203) // KEY_PERIOD(55) in french keyboard
        59: 54, //KEY_SEMICOLON (51) //KEY_COMMA (54) in french keyboard
        65: 20, //KEY_A(4) //KEY_Q(20) in french keyboard
        66: 5, //KEY_B
        67: 6, //KEY_C
        68: 7, //KEY_D
        69: 8, //KEY_E
        70: 9, //KEY_F
        71: 10, //KEY_G
        72: 11, //KEY_H
        73: 12, //KEY_I
        74: 13, //KEY_J
        75: 14, //KEY_K
        76: 15, //KEY_L
        77: 51, //KEY_M(16) //KEY_SEMICOLON(51) in french keyboard
        78: 17, //KEY_N
        79: 18, //KEY_O
        80: 19, //KEY_P
        81: 4, //KEY_Q(20) //KEY_A(4) in french keyboard
        82: 21, //KEY_R
        83: 22, //KEY_S
        84: 23, //KEY_T
        85: 24, //KEY_U
        86: 25, //KEY_V
        87: 29, //KEY_W(26) //KEY_Z(29) in french keyboard
        88: 27, //KEY_X
        89: 28, //KEY_Y
        90: 26, //KEY_Z(29) //KEY_W(26) in french keyboard
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
        190: 16, //KEY_COMMA(54) //KEY_M(16) in french keyboard
        191: 55, //KEY_PERIOD
        192: 52, //KEY_QUOTE (ù)
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
        return toArduinoCode[key];
    } else {
        return key;
    }
}

var keycodesToStr = [
    "", // [0]
    "", // [1]
    "", // [2]
    "CANCEL", // [3]
    "", // [4]
    "", // [5]
    "HELP", // [6]
    "", // [7]
    "BACK_SPACE", // [8]
    "TAB", // [9]
    "", // [10]
    "", // [11]
    "CLEAR", // [12]
    "ENTER", // [13]
    "ENTER_SPECIAL", // [14]
    "", // [15]
    "SHIFT", // [16]
    "CONTROL", // [17]
    "ALT", // [18]
    "PAUSE", // [19]
    "CAPS_LOCK", // [20]
    "KANA", // [21]
    "EISU", // [22]
    "JUNJA", // [23]
    "FINAL", // [24]
    "HANJA", // [25]
    "", // [26]
    "ESCAPE", // [27]
    "CONVERT", // [28]
    "NONCONVERT", // [29]
    "ACCEPT", // [30]
    "MODECHANGE", // [31]
    "SPACE", // [32]
    "PAGE_UP", // [33]
    "PAGE_DOWN", // [34]
    "END", // [35]
    "HOME", // [36]
    "LEFT", // [37]
    "UP", // [38]
    "RIGHT", // [39]
    "DOWN", // [40]
    "SELECT", // [41]
    "PRINT", // [42]
    "EXECUTE", // [43]
    "PRINTSCREEN", // [44]
    "INSERT", // [45]
    "DELETE", // [46]
    "", // [47]
    "0", // [48]
    "1", // [49]
    "2", // [50]
    "3", // [51]
    "4", // [52]
    "5", // [53]
    "6", // [54]
    "7", // [55]
    "8", // [56]
    "9", // [57]
    "COLON", // [58]
    "SEMICOLON", // [59]
    "LESS_THAN", // [60]
    "EQUALS", // [61]
    "GREATER_THAN", // [62]
    "QUESTION_MARK", // [63]
    "AT", // [64]
    "A", // [65]
    "B", // [66]
    "C", // [67]
    "D", // [68]
    "E", // [69]
    "F", // [70]
    "G", // [71]
    "H", // [72]
    "I", // [73]
    "J", // [74]
    "K", // [75]
    "L", // [76]
    "M", // [77]
    "N", // [78]
    "O", // [79]
    "P", // [80]
    "Q", // [81]
    "R", // [82]
    "S", // [83]
    "T", // [84]
    "U", // [85]
    "V", // [86]
    "W", // [87]
    "X", // [88]
    "Y", // [89]
    "Z", // [90]
    "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
    "", // [92]
    "CONTEXT_MENU", // [93]
    "", // [94]
    "SLEEP", // [95]
    "NUMPAD0", // [96]
    "NUMPAD1", // [97]
    "NUMPAD2", // [98]
    "NUMPAD3", // [99]
    "NUMPAD4", // [100]
    "NUMPAD5", // [101]
    "NUMPAD6", // [102]
    "NUMPAD7", // [103]
    "NUMPAD8", // [104]
    "NUMPAD9", // [105]
    "MULTIPLY", // [106]
    "ADD", // [107]
    "SEPARATOR", // [108]
    "SUBTRACT", // [109]
    "DECIMAL", // [110]
    "DIVIDE", // [111]
    "F1", // [112]
    "F2", // [113]
    "F3", // [114]
    "F4", // [115]
    "F5", // [116]
    "F6", // [117]
    "F7", // [118]
    "F8", // [119]
    "F9", // [120]
    "F10", // [121]
    "F11", // [122]
    "F12", // [123]
    "F13", // [124]
    "F14", // [125]
    "F15", // [126]
    "F16", // [127]
    "F17", // [128]
    "F18", // [129]
    "F19", // [130]
    "F20", // [131]
    "F21", // [132]
    "F22", // [133]
    "F23", // [134]
    "F24", // [135]
    "", // [136]
    "", // [137]
    "", // [138]
    "", // [139]
    "", // [140]
    "", // [141]
    "", // [142]
    "", // [143]
    "NUM_LOCK", // [144]
    "SCROLL_LOCK", // [145]
    "WIN_OEM_FJ_JISHO", // [146]
    "WIN_OEM_FJ_MASSHOU", // [147]
    "WIN_OEM_FJ_TOUROKU", // [148]
    "WIN_OEM_FJ_LOYA", // [149]
    "WIN_OEM_FJ_ROYA", // [150]
    "", // [151]
    "", // [152]
    "", // [153]
    "", // [154]
    "", // [155]
    "", // [156]
    "", // [157]
    "", // [158]
    "", // [159]
    "CIRCUMFLEX", // [160]
    "EXCLAMATION", // [161]
    "DOUBLE_QUOTE", // [162]
    "HASH", // [163]
    "DOLLAR", // [164]
    "PERCENT", // [165]
    "AMPERSAND", // [166]
    "UNDERSCORE", // [167]
    "OPEN_PAREN", // [168]
    "CLOSE_PAREN", // [169]
    "ASTERISK", // [170]
    "PLUS", // [171]
    "PIPE", // [172]
    "HYPHEN_MINUS", // [173]
    "OPEN_CURLY_BRACKET", // [174]
    "CLOSE_CURLY_BRACKET", // [175]
    "TILDE", // [176]
    "", // [177]
    "", // [178]
    "", // [179]
    "", // [180]
    "VOLUME_MUTE", // [181]
    "VOLUME_DOWN", // [182]
    "VOLUME_UP", // [183]
    "", // [184]
    "", // [185]
    "SEMICOLON", // [186]
    "EQUALS", // [187]
    "COMMA", // [188]
    "MINUS", // [189]
    "PERIOD", // [190]
    "SLASH", // [191]
    "BACK_QUOTE", // [192]
    "", // [193]
    "", // [194]
    "", // [195]
    "", // [196]
    "", // [197]
    "", // [198]
    "", // [199]
    "", // [200]
    "", // [201]
    "", // [202]
    "", // [203]
    "", // [204]
    "", // [205]
    "", // [206]
    "", // [207]
    "", // [208]
    "", // [209]
    "", // [210]
    "", // [211]
    "", // [212]
    "", // [213]
    "", // [214]
    "", // [215]
    "", // [216]
    "", // [217]
    "", // [218]
    "OPEN_BRACKET", // [219]
    "BACK_SLASH", // [220]
    "CLOSE_BRACKET", // [221]
    "QUOTE", // [222]
    "", // [223]
    "META", // [224]
    "ALTGR", // [225]
    "", // [226]
    "WIN_ICO_HELP", // [227]
    "WIN_ICO_00", // [228]
    "", // [229]
    "WIN_ICO_CLEAR", // [230]
    "", // [231]
    "", // [232]
    "WIN_OEM_RESET", // [233]
    "WIN_OEM_JUMP", // [234]
    "WIN_OEM_PA1", // [235]
    "WIN_OEM_PA2", // [236]
    "WIN_OEM_PA3", // [237]
    "WIN_OEM_WSCTRL", // [238]
    "WIN_OEM_CUSEL", // [239]
    "WIN_OEM_ATTN", // [240]
    "WIN_OEM_FINISH", // [241]
    "WIN_OEM_COPY", // [242]
    "WIN_OEM_AUTO", // [243]
    "WIN_OEM_ENLW", // [244]
    "WIN_OEM_BACKTAB", // [245]
    "ATTN", // [246]
    "CRSEL", // [247]
    "EXSEL", // [248]
    "EREOF", // [249]
    "PLAY", // [250]
    "ZOOM", // [251]
    "", // [252]
    "PA1", // [253]
    "WIN_OEM_CLEAR", // [254]
    "" // [255]
];