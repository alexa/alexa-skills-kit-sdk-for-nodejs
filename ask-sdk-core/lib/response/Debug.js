var timeBetweenEachDebugStatement;

var textToBeRead;

function start() {
	//Maybe optionally allow console.log() to display, but then again user can do it already
	timeBetweenEachDebugStatement = 1.0;
	textToBeRead = "";
}

function startWithCustomDelay(timeDelay) {
	//Check to make sure that a double value is passed in
	timeBetweenEachDebugStatement = timeDelay;
	textToBeRead = "";
}

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
		console.log("you have called the speak method. But the parameter is not" + 
		"a primitive like a string or an integer, nor is it an object. If you" +
		"are trying to read the state of your slots, use the speakState method");
}

function speakPrimitive(primitiveValue) {
	var textSnippet = String(primitiveValue); //Turn the primitive value into a string
	textToBeRead += textSnippet;
	textToBeRead += ". "; //Add punctuation
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

//Check if speakSlots is being called from an IntentHandler that doesn't have any slots to fill
function speakSlots(handlerInput) {
	//First we need to identify the intent which is contained in handlerInput
	//Check if there is an intent, otherwise say "No intent has been specified.
	//Perhaps you are trying to launch your skill, speak slots is not available
	//when you are starting a new session."
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
	
	//Format: Reading the slots of intent $(intent)
	// 2 of the 3 slots have been filled (optional, addition feature for later)
	// "The slot X has " and either "cat/dog/dragon" or "not yet been filled" if status !== confirmed
}

function forceSpeak(handlerInput, param) {
	textToBeRead = "";
	speak(param);
	complete(handlerInput);
}

function timeDelay() {
	//Adds a tag like the following <break time="3s"/> (see "SSML break tags")
	var breakTag = '<break time=\"' + String(timeBetweenEachDebugStatement) + 's\"/> ';
	return breakTag;
}

function setTimeDelay(desiredBreakTime) {
	//Check to make sure that a double value is passed in
	timeBetweenEachDebugStatement = desiredBreakTime;
}

function complete(handlerInput) {
	console.log("This is what should be spoken: ");
	console.log(textToBeRead);
	
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
