var debuggingIsOn;
var timeBetweenEachDebugStatement;

var textToBeRead;

modules.exports = this;
function Debug() {
	debuggingIsOn = true;
	timeBetweenEachDebugStatement = 1.0;
}

modules.exports = this;
function speak(var param) {
	if(debuggingIsOn = false)
		return;
	
	var paramType = typeof param; //Get the type of the parameter
	var paramIsPrimitive = ( paramType === 'number' || paramType === 'boolean'
								|| paramType === 'string' ); //want to speak a primitive
	var paramIsObject = ( paramType === 'object' ); //want to speak an object and its fields
	
	if(paramIsPrimitive)
		speakPrimitive(param);
	else if(paramIsObject)
		speakObject(param);
	else
		console.log("you have called the speak method. But the parameter is not" + 
		"a primitive like a string or an integer, nor is it an object. If you" +
		"are trying to read the state of your slots, use the speakState method");
}

modules.exports = this;
function speakPrimitive(var primitiveValue) {
	var textSnippet = String(primitiveValue); //Turn the primitive value into a string
	textToBeRead += textSnippet;
	textToBeRead += timeDelay();
	//Maybe add a new line after each one, so the text is easier to display
}

modules.exports = this;
function speakObject(var object) {
	if(object === 'null') {
		//Don't try and look at a null object's fields. When you see a 'null' object
		//just say the phrase "null" (treat it as a normal primitive string)
		speakPrimitive("null");
	}
	else {
		for(each field f) {
			var fieldAndValue = "The value of field " + f + " is " + String(f.val);
			textToBeRead += fieldAndValue;
		}
		textToBeRead += timeDelay();
	}
}