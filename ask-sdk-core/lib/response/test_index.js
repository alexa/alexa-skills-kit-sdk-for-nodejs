var debug = require('./Debug');

debug.start();
debug.speak(true);
debug.speak(3);
debug.speak("Hello");

var car = {type:"Fiat", model:"500", color:"white"};
debug.speak(car);
debug.complete();