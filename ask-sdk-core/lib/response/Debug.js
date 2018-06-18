/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

'use strict';

var timeBetweenEachDebugStatement; //The number of seconds Alexa pauses between each debug statement
var textToBeRead; //Alexa's response is accumulated here with each debug statement the user places in their code

/**
* Begins a debugging session. Sets default time between each debug statement to 1 second.
* Resets any existing text for Alexa's response.
*/
function start() {
	//Maybe optionally allow console.log() to display, but then again user can do it already
	timeBetweenEachDebugStatement = 1.0;
	textToBeRead = "";
}

/**
* Begins a debugging session. Sets time between each debug statement to the parameter that is passed in.
* @param {number} customTimeDelay the length of the pause between each debug statement.
*/
function startWithCustomDelay(customTimeDelay) {
	//Check to make sure that a numerical value is passed in for the time delay
	if(typeof customTimeDelay !== 'number') {
		throw new Error("You have called the function startWithCustomDelay with a parameter " +
		"that is not a numerical value.");
	}
	
	//Otherwise, initialize the variables normally
	timeBetweenEachDebugStatement = customTimeDelay;
	textToBeRead = "";
}

/**
* General, universal speak function. Checks for the type of input and delegates the actual
* work to the appropriate helper function for that type (primitive or object).
* @param {*} whatever you want to speak, any valid Javascript type.
*/
function speak(param) {
	
	var paramType = typeof param; //Get the type of the parameter
	var paramIsPrimitive = ( paramType === 'number' || paramType === 'boolean'
								|| paramType === 'string' ); //want to speak a primitive
	var paramIsObject = ( paramType === 'object' ); //want to speak an object and its fields
	
	if(paramIsPrimitive)
		speakPrimitive(param);
	else if(paramIsObject)
		speakObject(param);
	else
		throw new Error("you have called the speak method. But the parameter is not " + 
		"a primitive like a string or an integer, nor is it an object. If you " +
		"are trying to read the state of your slots, please use the speakState method");
}

/**
* Speak helper function that handles numbers, strings, and booleans (primitives).
* Adds the value of the variable passed in along with a time delay (default or set by
* the user) to the list of statements that will eventually be read to the user.
* @param {(number|string|boolean)} a primitive value that you want to speak.
*/
function speakPrimitive(primitiveValue) {
	var textSnippet = String(primitiveValue); //Turn the primitive value into a string
	textToBeRead += textSnippet;
	textToBeRead += ". "; //Add punctuation
	textToBeRead += timeDelay();
	//Maybe add a new line after each one, so the text is easier to display
}

/**
* Speak helper function that handles objects. Recites the name of each field and corresponding 
* value along with a time delay (default or set by the user) to the list of statements that 
* will eventually be read to the user.
* @param {Object} object any object that you want to know about.
*/
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

/**
* When you pass in your handlerInput object, this method will use the slots field that is
* found in the handler input and read out the value of each slot. If the slot is empty
* you will hear "The slot {insert your slot name here} has not yet been filled."
* @param {Object} handlerInput the handlerInput object which is passed as a parameter to the
* handle function in your "index.js" file if you are using the Alexa SDK V2.
*/
function speakSlots(handlerInput) {
	
	/* Handling common errors */
	
	//Error: HandlerInput does not have responseBuilder, most likely because speakSlots
	//was called without a parameter or the wrong parameter. HandlerInput also doesn't exist in SDK v1.
	var handlerInputIsNotObject = (typeof handlerInput !== 'object');
	if(handlerInputIsNotObject || !handlerInput.hasOwnProperty('responseBuilder')) {
		throw new Error("You have called speakSlots but have not passed in a " +
		"handlerInput object as the parameter. Please verify that speakSlots is " +
		"being called properly. If you are using the V1 of Alexa SDK, the debug " +
		"feature may not work even with the V1 adapter.");
	}
	
	//Error: User request is missing an intent
	if(!handlerInput.requestEnvelope.request.hasOwnProperty('intent')) {
			throw new Error("speakSlots was called, but the handlerInput passed into " +
			"the function is missing an intent. If you are calling speakSlots " +
			"from the Launch Request or Start Session this method might not work");
	}
	
	/* Code will identify slots and read them out */
	const currentIntent = handlerInput.requestEnvelope.request.intent;
	speak("Now reading the slots for the intent " + currentIntent.name);
	
	//The currentIntent contains all of our slots, and now we will speak each slot
	for(var slot in handlerInput.requestEnvelope.request.intent.slots) {
		var slotName = slot;
		var slotValue = currentIntent.slots[slotName].value;
		var slotHasBeenFilled = slotValue;
		
		//If the slot has been filled, speak the slot name and its value
		if(slotHasBeenFilled)
			speak("The slot " + slotName + " contains the value " + slotValue);
		else
			speak("The slot " + slotName + " has not yet been filled");
	}
	
}

/**
* ForceSpeak is a feature which helps track down errors in code that crashes before
* completing. When the forceSpeak function is called, the program stops execution on
* that line and tells Alexa to speak whatever you pass in as a param. This means as long
* as your forceSpeak line is before the line of code which causes your crash, Alexa will
* have a response to speak. This response should be information to help you understand
* why your program crashes (a faulty variable value or a problematic function call). 
* ForceSpeak will erase all other text from debug statements in your code and only speak the
* one thing you pass in as a parameter, be careful!
* 
* @param {Object} handlerInput the handlerInput object which is passed as a parameter to every
* handle function in your "index.js" file if you are using the Alexa SDK V2.
* @param {*} whatever you want to speak, any valid Javascript type.
*/
function forceSpeak(handlerInput, param) {
	textToBeRead = "";
	speak(param);
	complete(handlerInput);
}

/**
* Helper function that inserts an SSML break tag that instructs Alexa to pause for a specified number of seconds.
* (https://forums.developer.amazon.com/questions/96060/how-to-have-alexa-pause-when-reading-back-your-fac.html) 
*/
function timeDelay() {
	//Adds a tag like the following <break time="3s"/> (see "SSML break tags")
	var breakTag = '<break time=\"' + String(timeBetweenEachDebugStatement) + 's\"/> ';
	return breakTag;
}

/** 
* Changes the time delay used between each debug statement.
* @param {number} desiredBreakTime the number of seconds that Alexa should pause between debug statements
*/
function setTimeDelay(desiredBreakTime) {
	//Check to make sure that a numerical value is passed in for the time delay
	if(typeof desiredBreakTime !== 'number') {
		throw new Error("You have called the function setTimeDelay with a parameter " +
		"that is not a numerical value.");
	}
	else
		timeBetweenEachDebugStatement = desiredBreakTime;
}

/**
* The complete method is called when you are done debugging and you want to hear all of
* the debug statements you have assembled. Pass in the handlerInput object so that the
* response generated here can be communicated to Alexa.
* @param {Object} handlerInput the handlerInput object which is passed as a parameter to the
* handle function in your "index.js" file if you are using the Alexa SDK V2.
*/
function complete(handlerInput) {

	console.log("This is what should be spoken: ");
	console.log(textToBeRead);
	
	//Error: HandlerInput does not have responseBuilder, most likely because complete
	//was called without a parameter or the wrong parameter. HandlerInput also doesn't exist in SDK v1.
	if(!handlerInput.hasOwnProperty('responseBuilder')) {
		throw new Error("You have called speakSlots but have not passed in a " +
		"handlerInput object as the parameter. Please verify that speakSlots is " +
		"being called properly. If you are using the V1 of Alexa SDK, the debug " +
		"feature may not work even with the V1 adapter.");
	}
	
	return handlerInput.responseBuilder.speak(textToBeRead).getResponse();
}


//Module exports (what functions are public to use)
module.exports.start = start;
module.exports.startWithCustomDelay = startWithCustomDelay;
module.exports.speak = speak;
module.exports.speakSlots = speakSlots;
module.exports.forceSpeak = forceSpeak;
module.exports.setTimeDelay = setTimeDelay;
module.exports.complete = complete;
