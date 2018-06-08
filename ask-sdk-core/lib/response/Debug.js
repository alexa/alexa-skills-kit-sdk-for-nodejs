var debuggingIsOn;
var timeBetweenEachDebugStatement;

var toBeRead;

modules.exports = this;
function Debug() {
	debuggingIsOn = true;
	timeBetweenEachDebugStatement = 1.0;
}

modules.exports = this;
function speak(var param) {
	if(debuggingIsOn = false)
		return;
		
	if(param is primitive)
		speakPrimitive(param);
	else if(param is object)
		speakObject(param);
	else
		console.log("you have called the speak method. But the parameter is not" + 
		"a primitive like a string or an integer, nor is it an object. If you" +
		"are trying to read the state of your slots, use the speakState method");
}