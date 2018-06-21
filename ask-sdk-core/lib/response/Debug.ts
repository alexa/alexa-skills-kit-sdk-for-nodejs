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

export class Debug {
    private timeBetweenEachDebugStatement : number;
    private textToBeRead : string;
    
    /**
     * Speak helper function that handles numbers, strings, and booleans (primitives).
     * Adds the value of the variable passed in along with a time delay (default or set by
     * the user) to the list of statements that will eventually be read to the user.
     * @param {(number|string|boolean)} A primitive value that you want to speak.
     */
    private speakPrimitive(primitiveValue : number | string | boolean) {
        const textSnippet = String(primitiveValue); //Turn the primitive value into a string
        this.textToBeRead += textSnippet;
        this.textToBeRead += '. '; //Add punctuation
        this.textToBeRead += this.timeDelay();
    }

    /**
     * Speak helper function that handles objects. Recites the name of each field and corresponding 
     * value along with a time delay (default or set by the user) to the list of statements that 
     * will eventually be read to the user.
     * @param {Object} object Any object that you want to know about.
     */
    private speakObject(object : object) {
        for(const fieldName in object) {
            let val = object[fieldName]; //Get the value of that field
            let fieldAndValue = 'The value of field ' + fieldName + ' is ' + String(val) + '. ';
            this.textToBeRead += fieldAndValue;
        }
        this.textToBeRead += this.timeDelay();
    }
    
    /**
     * Helper function that inserts an SSML break tag that instructs Alexa to pause for a specified number of seconds.
     * (https://forums.developer.amazon.com/questions/96060/how-to-have-alexa-pause-when-reading-back-your-fac.html) 
     */
    private timeDelay() {
        // Adds a tag like the following <break time='3s'/> (see 'SSML break tags')
        const breakTag = '<break time=\'' + String(this.timeBetweenEachDebugStatement) + 's\'/> ';
        return breakTag;
    }

    /**
     * Begins a debugging session. Sets default time between each debug statement to 1 second.
     * Resets any existing text for Alexa's response.
	 */
    public start() {
        this.timeBetweenEachDebugStatement = 1.0;
        this.textToBeRead = '';
     }

    /**
     * Begins a debugging session. Sets time between each debug statement to the parameter that is passed in.
     * @param {number} customTimeDelay The length of the pause between each debug statement.
     */
    public startWithCustomDelay(customTimeDelay : number) {
        // Throw an error if something other than a number is passed in for the time delay
        if(typeof customTimeDelay !== 'number') {
            throw new Error('You have called the function startWithCustomDelay with a parameter ' +
            'that is not a numerical value.');
        }

        //Otherwise, initialize the variables normally
        this.timeBetweenEachDebugStatement = customTimeDelay;
        this.textToBeRead = '';
    }

    /**
     * General, universal speak function. Checks for the type of input and delegates the actual
     * work to the appropriate helper function for that type (primitive or object).
     * @param {*} Whatever you want to speak, any valid Javascript type.
     */
    public speak(param : any) {
        const paramType = typeof param; //Get the type of the parameter
        const paramIsPrimitive = ( paramType === 'number'
         || paramType === 'boolean' || paramType === 'string' ); //want to speak a primitive
        const paramIsObject = ( paramType === 'object' ); //want to speak an object and its fields

        if(paramIsPrimitive)
            this.speakPrimitive(param);
        else if(paramIsObject)
            this.speakObject(param);
        else
    		throw new Error('you have called the speak method. But the parameter is not ' + 
            'a primitive like a string or an integer, nor is it an object. If you ' +
            'are trying to read the state of your slots, please use the speakState method');
    }

    /**
     * When you pass in your handlerInput object, this method will use the slots field that is
     * found in the handler input and read out the value of each slot. If the slot is empty
     * you will hear 'The slot {insert your slot name here} has not yet been filled.'
     * @param {Object} handlerInput The handlerInput object which is passed as a parameter to the
     * handle function in your 'index.js' file if you are using the Alexa SDK V2.
     */
    public speakSlots(handlerInput : any) {

        /* Handling common errors */

        // Error: HandlerInput does not have responseBuilder, most likely because speakSlots
        // was called without a parameter or the wrong parameter. HandlerInput also doesn't exist in SDK v1.
        const handlerInputIsNotObject = (typeof handlerInput !== 'object');
        if(handlerInputIsNotObject || !handlerInput.hasOwnProperty('responseBuilder')) {
            throw new Error('You have called speakSlots but have not passed in a ' +
            'handlerInput object as the parameter. Please verify that speakSlots is ' +
            'being called properly. If you are using the V1 of Alexa SDK, the debug ' +
            'feature may not work even with the V1 adapter.');
        }

        // Error: User request is missing an intent
        if(!handlerInput.requestEnvelope.request.hasOwnProperty('intent')) {
            throw new Error('speakSlots was called, but the handlerInput passed into ' +
                'the function is missing an intent. If you are calling speakSlots ' +
                'from the Launch Request or Start Session this method might not work');
        }

        /* Code will identify slots and read them out */
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        this.speak('Now reading the slots for the intent ' + currentIntent.name);

        // The currentIntent contains all of our slots, and now we will speak each slot
        for(const slot in handlerInput.requestEnvelope.request.intent.slots) {
            let slotName = slot;
            let slotValue = currentIntent.slots[slotName].value;
            let slotHasBeenFilled = slotValue;

            // If the slot has been filled, speak the slot name and its value
            if(slotHasBeenFilled)
                this.speak('The slot ' + slotName + ' contains the value ' + slotValue);
            else
                this.speak('The slot ' + slotName + ' has not yet been filled');
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
     * @param {Object} handlerInput The handlerInput object which is passed as a parameter to every
     * handle function in your 'index.js' file if you are using the Alexa SDK V2.
     * @param {*} Whatever you want to speak, any valid Javascript type.
     */
    public forceSpeak(handlerInput : any, param : any) {
        this.textToBeRead = '';
        this.speak(param);
        this.complete(handlerInput);
    }

    /** 
     * Changes the time delay used between each debug statement.
     * @param {number} desiredBreakTime The number of seconds that Alexa should pause between debug statements
     */
    public setTimeDelay(desiredBreakTime : number) {
        this.timeBetweenEachDebugStatement = desiredBreakTime;
    }

    /**
     * The complete method is called when you are done debugging and you want to hear all of
     * the debug statements you have assembled. Pass in the handlerInput object so that the
     * response generated here can be communicated to Alexa.
     * @param {Object} handlerInput The handlerInput object which is passed as a parameter to the
     * handle function in your 'index.js' file if you are using the Alexa SDK V2.
     */
    public complete(handlerInput : any) {
        // Error: Complete was called without a parameter or the wrong parameter.
        if(!handlerInput.hasOwnProperty('responseBuilder')) {
            throw new Error('You have called complete but have not passed in a ' +
            'handlerInput object as the parameter. Please verify that complete is ' +
            'being called properly. If you are using the V1 of Alexa SDK, the debug ' +
            'feature may not work even with the V1 adapter.');
        }

        return handlerInput.responseBuilder.speak(this.textToBeRead).getResponse();
    }
    
}