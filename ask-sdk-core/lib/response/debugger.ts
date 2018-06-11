var debuggingIsOn;
var timeBetweenEachDebugStatement;

var textToBeRead;

//var responseBuilder = require('./ResponseBuilder.ts');
//import { ResponseBuilder } from "./ResponseBuilder.ts";
//let responseBuilder = new ResponseBuilder();

function Debug() {
	debuggingIsOn = true;
	timeBetweenEachDebugStatement = 1.0;
	textToBeRead = "";
}

function speak(param) {
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

function speakPrimitive(primitiveValue) {
	var textSnippet = String(primitiveValue); //Turn the primitive value into a string
	textToBeRead += textSnippet;
	textToBeRead += timeDelay();
	//Maybe add a new line after each one, so the text is easier to display
}

function speakObject(object) {
	if(object === 'null') {
		//Don't try and look at a null object's fields. When you see a 'null' object
		//just say the phrase "null" (treat it as a normal primitive string)
		speakPrimitive("null");
	}
	else {
		for(var fieldName in object) {
			var val = object[fieldName]; //Get the value of that field
			var fieldAndValue = "The value of field " + fieldName + " is " + String(val) + ". ";
			textToBeRead += fieldAndValue;
			//Can add a small break in between each field too
		}
		textToBeRead += timeDelay();
	}
}

function timeDelay() {
	//Adds a tag like the following <break time="3s"/> (see "SSML break tags")
	var breakTag = '<break time=\"' + String(timeBetweenEachDebugStatement) + 's\"/>';
	return breakTag;
}

function complete() {
	console.log("This is what should be spoken: ");
	console.log(textToBeRead);
	
	//return responseBuilder.speak(textToBeRead).getResponse();
}


//Module exports (what functions are public to use)
//module.exports.Debug = Debug;
//module.exports.speak = speak;
//module.exports.complete = complete;

export { debugger };

