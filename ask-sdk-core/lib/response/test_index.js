var debug = require('./Debug');

debug.DebugWithCustomDelay(0.5);
debug.speak(true);
debug.speak(3);
debug.speak("Hello");

var car = {type:"Fiat", model:"500", color:"white"};
debug.speak(car);
debug.complete();