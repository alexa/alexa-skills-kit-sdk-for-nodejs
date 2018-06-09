var debug = require('./Debug');

debug.Debug();
debug.speak(true);
debug.speak(3);
debug.speak("Hello");

var car = {type:"Fiat", model:"500", color:"white"};
debug.speak(car);
debug.complete();