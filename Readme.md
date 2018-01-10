# Alexa Skills Kit SDK for Node.js
<!-- TOC -->

- [Alexa Skills Kit SDK for Node.js](#alexa-skills-kit-sdk-for-nodejs)
    - [Overview](#overview)
    - [Setup Guide](#setup-guide)
    - [Getting Started: Writing a Hello World Skill](#getting-started-writing-a-hello-world-skill)
        - [Basic Project Structure](#basic-project-structure)
        - [Set Entry Point](#set-entry-point)
        - [Implement Handler Functions](#implement-handler-functions)
    - [Response vs ResponseBuilder](#response-vs-responsebuilder)
        - [Tips](#tips)
    - [Standard Request and Response](#standard-request-and-response)
    - [Interfaces](#interfaces)
        - [AudioPlayer Interface](#audioplayer-interface)
        - [Dialog Interface](#dialog-interface)
            - [Delegate Directive](#delegate-directive)
            - [Elicit Slot Directive](#elicit-slot-directive)
            - [Confirm Slot Directive](#confirm-slot-directive)
            - [Confirm Intent Directive](#confirm-intent-directive)
        - [Display Interface](#display-interface)
        - [Playback Controller Interface](#playback-controller-interface)
        - [VideoApp Interface](#videoapp-interface)
        - [Skill and List Events](#skill-and-list-events)
    - [Services](#services)
        - [Device Address Service](#device-address-service)
        - [List Management Service](#list-management-service)
        - [Directive Service](#directive-service)
    - [Extend Features](#extend-features)
        - [Skill State Management](#skill-state-management)
        - [Persisting Skill Attributes through DynamoDB](#persisting-skill-attributes-through-dynamodb)
        - [Adding Multi-Language Support for Skill](#adding-multi-language-support-for-skill)
        - [Device ID Support](#device-id-support)
        - [Speechcons (Interjections)](#speechcons-interjections)
    - [Setting up your development environment](#setting-up-your-development-environment)

<!-- /TOC -->

## Overview

Alexa SDK team is proud to present the new **Alexa Node.js SDK** -- the open-source Alexa Skill Development Kit built by developers for developers.

Creating an Alexa skill using the Alexa Skill Kit, Node.js and AWS Lambda has become one of the most popular ways we see skills created today. The event-driven, non-blocking I/O model of Node.js is well-suited for an Alexa skill and Node.js is one of the largest ecosystems of open source libraries in the world. Plus, AWS Lambda is free for the first one million calls per month, which is sufficient for most Alexa skill developers. Also, when using AWS Lambda you don't need to manage any SSL certificates since the Alexa Skills Kit is a trusted trigger.

Setting up an Alexa skill using AWS Lambda, Node.js and the Alexa Skills Kit has been a simple process. However, the actual amount of code you have to write has not. Alexa SDK team has now built an Alexa Skills Kit SDK specifically for Node.js that will help you avoid common hang-ups and focus on your skill's logic instead of boilerplate code. 

With the new alexa-sdk, our goal is to help you build skills faster while allowing you to avoid unneeded complexity. Today, we are launching the SDK with the following capabilities:

- Hosted as an NPM package allowing simple deployment to any Node.js environment
- Ability to build Alexa responses using built-in events
- Helper events for new sessions and unhandled events that can act as a 'catch-all' events
- Helper functions to build state-machine based Intent handling
- This makes it possible to define different event handlers based on the current state of the skill
- Simple configuration to enable attribute persistence with DynamoDB
- All speech output is automatically wrapped as SSML
- Lambda event and context objects are fully available via `this.event` and `this.context`
- Ability to override built-in functions giving you more flexibility on how you manage state or build responses. For example, saving state attributes to AWS S3.


## Setup Guide
The alexa-sdk is immediately available on [Github](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) and can be deployed as a node package using the following command from your Node.js environment:
```
npm install --save alexa-sdk
```
## Getting Started: Writing a Hello World Skill
### Basic Project Structure
Your HelloWorld skill needs to have:
- entry point to your skill where you'll import all packages needed for the skill, receive the events, set appId, set dynamoDB table, register handlers and so on; 
- handler functions which handle each request.

### Set Entry Point
To do this within your own project simply create a file named index.js and add the following to it:
```javascript
const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.
    alexa.execute();
};
```
This will import alexa-sdk and set up an Alexa object for us to work with. 

### Implement Handler Functions
Next, we need to handle the events and intents for our skill. Alexa-sdk makes it simple to have a function fire an intent. You can implement the handers functions in index.js file just created or you can also write in separate files and import them later. For example, to create a handler for 'HelloWorldIntent', we can do it in two ways:
```javascript
const handlers = {
    'HelloWorldIntent' : function() {
        //emit response directly
        this.emit(':tell', 'Hello World!');
    }
};
```
Or
```javascript
const handlers = {
    'HelloWorldIntent' : function() {
        //build response first using responseBuilder and then emit
        this.response.speak('Hello World!');
        this.emit(':responseReady');
    }
};
```

Alexa-sdk follows a tell/ask response methodology for generating the outputSpeech response objects corresponding to speak/listen in responseBuilder.
```javascript
this.emit(':tell', 'Hello World!'); 
this.emit(':ask', 'What would you like to do?', 'Please say that again?');
```
which is equivalent to:
```javascript
this.response.speak('Hello World!');
this.emit(':responseReady');

this.response.speak('What would you like to do?')
            .listen('Please say that again?');
this.emit(':responseReady');
```
The difference between :ask/listen and :tell/speak is that after a :tell/speak action, the session is ended without waiting for the user to provide more input. We will compare the two ways using response or using responseBuilder to create the response object in next section.

The handlers can forward request to each other, making it possible to chain handlers together for better user flow. Here is an example where our LaunchRequest and IntentRequest(of HelloWorldIntent) both return the same 'Hello World' message.
```javascript
const handlers = {
    'LaunchRequest': function () {
    	this.emit('HelloWorldIntent');
	},

	'HelloWorldIntent': function () {
    	this.emit(':tell', 'Hello World!');
	}
};
```

Once we have set up event handlers we need to register them using the registerHandlers function of the alexa object we just created. So in the index.js file we created, add the following:

```javascript
const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
```
You can also register multiple handler objects at once:
```javascript
alexa.registerHandlers(handlers, handlers2, handlers3, ...);
```
Once you finish the above steps, your skill should work properly on the device.


## Response vs ResponseBuilder

Currently, there are two ways to generate the [response objects](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#Response%20Format)  in Node.js SDK. The first way is using the syntax follows the format this.emit(`:${action}`, 'responseContent').  
Here are full list examples for common skill responses below:

|Response Syntax | Description |
|----------------|-----------|
| this.emit(':tell',speechOutput);|Tell with [speechOutput](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object)| 
|this.emit(':ask', speechOutput, repromptSpeech);|Ask with [speechOutput](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object) and [repromptSpeech](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#reprompt-object)|
|this.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);| Tell with [speechOutput](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object) and [standard card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object)|
|this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, imageObj);| Ask with [speechOutput](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object), [repromptSpeech](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#reprompt-object) and [standard card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object)|
|this.emit(':tellWithLinkAccountCard', speechOutput);|  Tell with [linkAccount card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object), for more information, click [here](https://developer.amazon.com/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html)|
|this.emit(':askWithLinkAccountCard', speechOutput);| Ask with [linkAccount card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object), for more information, click [here](https://developer.amazon.com/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html)|
|this.emit(':tellWithPermissionCard', speechOutput, permissionArray);| Tell with [permission card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#session-object), for more information, click [here](https://developer.amazon.com/docs/custom-skills/configure-permissions-for-customer-information-in-your-skill.html)|
|this.emit(':askWithPermissionCard', speechOutput, repromptSpeech, permissionArray)| Ask with [permission card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#session-object), for more information, click [here](https://developer.amazon.com/docs/custom-skills/configure-permissions-for-customer-information-in-your-skill.html)|
|this.emit(':delegate', updatedIntent);|Response with [delegate directive](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#delegate) in [dialog model](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)|
|this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech, updatedIntent);|Response with [elicitSlot directive](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#elicitslot) in [dialog model](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)|
|this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);| Response with [card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object) and [elicitSlot directive](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#elicitslot) in [dialog model](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)|
|this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech, updatedIntent);|Response with [confirmSlot directive](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#confirmslot) in [dialog model](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)|
|this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);| Response with [card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object) and [confirmSlot directive](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#confirmslot) in [dialog model](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)|
|this.emit(':confirmIntent', speechOutput, repromptSpeech, updatedIntent);|Response with [confirmIntent directive](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#confirmintent) in [dialog model](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)|
|this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);| Reponse with [card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object) and [confirmIntent directive](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#confirmintent) in [dialog model](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)|
|this.emit(':responseReady');|Called after the response is built but before it is returned to the Alexa service. Calls : saveState. Can be overridden.|
|this.emit(':saveState', false);|Handles saving the contents of this.attributes and the current handler state to DynamoDB and then sends the previously built response to the Alexa service. Override if you wish to use a different persistence provider. The second attribute is optional and can be set to 'true' to force saving.|
|this.emit(':saveStateError'); |Called if there is an error while saving state. Override to handle any errors yourself.|


If you want to manually create your own responses, you can use `this.response` to help. `this.response` contains a series of functions, that you can use to set the different properties of the response. This allows you to take advantage of the Alexa Skills Kit's built-in audio and video player support. Once you've set up your response, you can just call `this.emit(':responseReady')` to send your response to Alexa. The functions within `this.response` are also chainable, so you can use as many as you want in a row. 
Here is full list example of creating response using responseBuilder.

|Response Syntax | Description |
|----------------|-----------|
|this.response.speak(speechOutput);| Set the first speech output to [speechOutput](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object)|
|this.response.listen(repromptSpeech);| Set the reprompt speech output to [repromptSpeech](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#reprompt-object), shouldEndSession to false. Unless this function is called, this.response will set shouldEndSession to true.|
|this.response.cardRenderer(cardTitle, cardContent, cardImage);| Add a [standard card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object) with cardTitle, cardContent and cardImage in response|
|this.response.linkAccountCard();| Add a [linkAccount card](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#card-object) in response, for more information, click [here](https://developer.amazon.com/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html)|
|this.response.askForPermissionsConsentCard(permissions);| Add  a card to ask for [perimission](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#session-object) in response, for more information, click [here](https://developer.amazon.com/docs/custom-skills/configure-permissions-for-customer-information-in-your-skill.html)|
|this.response.audioPlayer(directiveType, behavior, url, token, expectedPreviousToken, offsetInMilliseconds);(Deprecated) | Add an [AudioPlayer directive](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html) with provided parameters in response.|
|this.response.audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds);| Add an [AudioPlayer directive](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html) using the provided parameters, and set    [`AudioPlayer.Play`](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#play) as the directive type.|
|this.response.audioPlayerStop();| Add an [AudioPlayer.Stop directive](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#stop)|
|this.response.audioPlayerClearQueue(clearBehavior);|Add an [AudioPlayer.ClearQueue directive](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html#clearqueue) and set the clear behaviour of the directive.|
|this.response.renderTemplate(template);| Add a [Display.RenderTemplate directive](https://developer.amazon.com/docs/custom-skills/display-interface-reference.html) in response|
|this.response.hint(hintText, hintType);| Add a [Hint directive](https://developer.amazon.com/docs/custom-skills/display-interface-reference.html#hint-directive) in response|
|this.response.playVideo(videoSource, metadata);|Add a [VideoApp.Play directive](https://developer.amazon.com/docs/custom-skills/videoapp-interface-reference.html#videoapp-directives) in response|
|this.response.shouldEndSession(bool);| Set shouldEndSession manually|

When you have finished set up your response, simply call `this.emit(':responseReady')` to send your response off.
Below are two examples that build response with several response objects:
```
//Example 1
this.response.speak(speechOutput)
            .listen(repromptSpeech);
this.emit(':responseReady');
//Example 2
this.response.speak(speechOutput)
            .cardRenderer(cardTitle, cardContent, cardImage)
            .renderTemplate(template)
            .hint(hintText, hintType);
this.emit(':responseReady');
```
Since responseBuilder is more flexible to build rich response objects, we prefer using this method to build the response.

### Tips
- When any of the response events are emitted `:ask`, `:tell`, `:askWithCard`, etc. The lambda context.succeed() method is called if the developer doesn't pass in `callback` function, which immediately stops processing of any further background tasks. Any asynchronous jobs that are still incomplete will not be completed and any lines of code below the response emit statement will not be executed. This is not the case for non responding events like `:saveState`.
- To "transfer" a request from one state handler to another which is called intent forwarding, `this.handler.state` needs to be set to the name of the target state. If the target state is "", then `this.emit("TargetHandlerName")` should be called. For any other states, `this.emitWithState("TargetHandlerName")` must be called instead.
- The contents of the prompt and reprompt values get wrapped in SSML tags. This means that any special XML characters within the value need to be escape coded. For example, this.emit(":ask", "I like M&M's") will cause a failure because the `&` character needs to be encoded as `&amp;`. Other characters that need to be encoded include: `<` -> `&lt;`, and `>` -> `&gt;`.

## Standard Request and Response
Alexa communicates with the skill service via a request-response mechanism using HTTP over SSL/TLS. When a user interacts with an Alexa skill, your service receives a POST request containing a JSON body. The request body contains the parameters necessary for the service to perform its logic and generate a JSON-formatted response. Since Node.js can handle JSON natively, Alexa Node.js SDK doesn't need to do JSON serialization and deserialization. Developers are only responsible for providing a proper response object in order for Alexa to respond to a customer request. The documentation on the JSON structure of the request body can be found [here](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-format).

A SpeechletResponse may contain the following attributes:
- OutputSpeech
- Reprompt
- Card
- List of Directives
- shouldEndSession

As an example, a simple response containing both speech and a card can  be constructed as follows:

```javascript
const speechOutput = 'Hello world!';
const repromptSpeech = 'Hello again!';
const cardTitle = 'Hello World Card';
const cardContent = 'This text will be displayed in the companion app card.';
const imageObj = {
	smallImageUrl: 'https://imgs.xkcd.com/comics/standards.png',
	largeImageUrl: 'https://imgs.xkcd.com/comics/standards.png'
};
this.response.speak(speechOutput)
            .listen(repromptSpeech)
            .cardRenderer(cardTitle, cardContent, imageObj);
this.emit(':responseReady');
```


## Interfaces 

### AudioPlayer Interface
Developers can include the following directives in their skill responses (respectively)
- `PlayDirective`
- `StopDirective`
- `ClearQueueDirective`

Here is an example of using `PlayDirective` to stream audio:
```javascript
const handlers = {
    'LaunchRequest' : function() {
        const speechOutput = 'Hello world!';
        const behavior = 'REPLACE_ALL';
        const url = 'https://url/to/audiosource';
        const token = 'myMusic';
        const expectedPreviousToken = 'expectedPreviousStream';
        const offsetInMilliseconds = 10000;
        this.response.speak(speechOutput)
                    .audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds);
        this.emit(':responseReady');
    }
};
```
In the above example, Alexa will speak the `speechOutput` first and then try to play audio. 

When building skills that leverage the [AudioPlayer](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html) interfaces, the `playback` requests will be send to notify the skill about changes to the `playback` state.You can implement handler functions for their respective events.
```javascript
const handlers = {
    'AudioPlayer.PlaybackStarted' : function() {
    	console.log('Alexa begins playing the audio stream');
    },
    'AudioPlayer.PlaybackFinished' : function() {
    	console.log('The stream comes to an end');
    },
    'AudioPlayer.PlaybackStopped' : function() {
    	console.log('Alexa stops playing the audio stream');
    },
    'AudioPlayer.PlaybackNearlyFinished' : function() {
    	console.log('The currently playing stream is nearly complate and the device is ready to receive a new stream');
    },
    'AudioPlayer.PlaybackFailed' : function() {
    	console.log('Alexa encounters an error when attempting to play a stream');
    }
};
```

Additional documentation about `AudioPlayer` interface can be found [here](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html).

Note: for specifications regarding the `imgObj` please see [here](https://developer.amazon.com/docs/custom-skills/include-a-card-in-your-skills-response.html#creating-a-home-card-to-display-text-and-an-image)
### Dialog Interface
The `Dialog` interface provides directives for managing a multi-turn conversation between your skill and the user. You can use the directives to ask the user for the information you need to fulfill their request. See the [Dialog Interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/dialog-interface-reference) and [Skill Editor](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/ask-define-the-vui-with-gui) documentation for more information on how to use dialog directives.

You can use `this.event.request.dialogState` to access current `dialogState`.

#### Delegate Directive
Sends Alexa a command to handle the next turn in the dialog with the user. You can use this directive if the skill has a dialog model and the current status of the dialog (`dialogState`) is either `STARTED` or `IN_PROGRESS`. You cannot emit this directive if the `dialogState` is `COMPLETED`.

You can use `this.emit(':delegate')` to send delegate directive response.
```javascript
const handlers = {
    'BookFlightIntent': function () {
        if (this.event.request.dialogState === 'STARTED') {
            let updatedIntent = this.event.request.intent;
            // Pre-fill slots: update the intent object with slot values for which
            // you have defaults, then emit :delegate with this updated intent.
            updatedIntent.slots.SlotName.value = 'DefaultValue';
            this.emit(':delegate', updatedIntent);
        } else if (this.event.request.dialogState !== 'COMPLETED'){
            this.emit(':delegate');
        } else {
            // All the slots are filled (And confirmed if you choose to confirm slot/intent)
            handlePlanMyTripIntent();
        }
    }
};
```

#### Elicit Slot Directive
Sends Alexa a command to ask the user for the value of a specific slot. Specify the name of the slot to elicit in the `slotToElicit`. Provide a prompt to ask the user for the slot value in `speechOutput`.

You can use `this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech, updatedIntent)` or `this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)` to send elicit slot directive response.

When using `this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`, `updatedIntent` and `imageObj` are optional parameters. You can set them to `null` or not pass them.
```javascript
const handlers = {
    'BookFlightIntent': function () {
        const intentObj = this.event.request.intent;
        if (!intentObj.slots.Source.value) {
            const slotToElicit = 'Source';
            const speechOutput = 'Where would you like to fly from?';
            const repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        } else if (!intentObj.slots.Destination.value) {
            const slotToElicit = 'Destination';
            const speechOutput = 'Where would you like to fly to?';
            const repromptSpeech = speechOutput;
            const cardContent = 'What is the destination?';
            const cardTitle = 'Destination';
            const updatedIntent = intentObj;
            // An intent object representing the intent sent to your skill.
            // You can use this property set or change slot values and confirmation status if necessary.
            const imageObj = {
                smallImageUrl: 'https://imgs.xkcd.com/comics/standards.png',
                largeImageUrl: 'https://imgs.xkcd.com/comics/standards.png'
            };
            this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);
        } else {
            handlePlanMyTripIntentAllSlotsAreFilled();
        }
    }
};
```

#### Confirm Slot Directive
Sends Alexa a command to confirm the value of a specific slot before continuing with the dialog. Specify the name of the slot to confirm in the `slotToConfirm`. Provide a prompt to ask the user for confirmation in `speechOutput`.

You can use `this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech, updatedIntent)` or `this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)` to send confirm slot directive response.

When using `this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`, `updatedIntent` and `imageObj` are optional parameters. You can set them to `null` or not pass them.
```javascript
const handlers = {
    'BookFlightIntent': function () {
        const intentObj = this.event.request.intent;
        if (intentObj.slots.Source.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Source.confirmationStatus !== 'DENIED') {
                // Slot value is not confirmed
                const slotToConfirm = 'Source';
                const speechOutput = 'You want to fly from ' + intentObj.slots.Source.value + ', is that correct?';
                const repromptSpeech = speechOutput;
                this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
            } else {
                // Users denies the confirmation of slot value
                const slotToElicit = 'Source';
                const speechOutput = 'Okay, Where would you like to fly from?';
                this.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
            }
        } else if (intentObj.slots.Destination.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Destination.confirmationStatus !== 'DENIED') {
                const slotToConfirm = 'Destination';
                const speechOutput = 'You would like to fly to ' + intentObj.slots.Destination.value + ', is that correct?';
                const repromptSpeech = speechOutput;
                const cardContent = speechOutput;
                const cardTitle = 'Confirm Destination';
                this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent);
            } else {
                const slotToElicit = 'Destination';
                const speechOutput = 'Okay, Where would you like to fly to?';
                const repromptSpeech = speechOutput;
                this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
            }
        } else {
            handlePlanMyTripIntentAllSlotsAreConfirmed();
        }
    }
};
```

#### Confirm Intent Directive
Sends Alexa a command to confirm the all the information the user has provided for the intent before the skill takes action. Provide a prompt to ask the user for confirmation in `speechOutput`. Be sure to repeat back all the values the user needs to confirm in the prompt.

You can use `this.emit(':confirmIntent', speechOutput, repromptSpeech, updatedIntent)` or `this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)` to send confirm intent directive response.

When using `this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`, `updatedIntent` and `imageObj` are optional parameters. You can set them to `null` or not pass them.
```javascript
const handlers = {
    'BookFlightIntent': function () {
        const intentObj = this.event.request.intent;
        if (intentObj.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.confirmationStatus !== 'DENIED') {
                // Intent is not confirmed
                const speechOutput = 'You would like to book flight from ' + intentObj.slots.Source.value + ' to ' +
                intentObj.slots.Destination.value + ', is that correct?';
                const cardTitle = 'Booking Summary';
                const repromptSpeech = speechOutput;
                const cardContent = speechOutput;
                this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent);
            } else {
                // Users denies the confirmation of intent. May be value of the slots are not correct.
                handleIntentConfimationDenial();
            }
        } else {
            handlePlanMyTripIntentAllSlotsAndIntentAreConfirmed();
        }
    }
};
```
Additional documentation about `Dialog` interface can be found [here](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html).

### Display Interface
Alexa provides several `Display templates` to support a wide range of presentations. Currently, there are two categories of `Display templates`:
- `BodyTemplate` displays text and images which cannot be made selectable. Currently has four options
+ `BodyTemplate1`
+ `BodyTemplate2`
+ `BodyTemplate3`
+ `BodyTemplate6`
+ `BodyTemplate7`
- `ListTemplate` displays a scrollable list of items, each with associated text and optional images. These images can be made selectable. Currently has two options:
+ `ListTemplate1`
+ `ListTemplate2`

Developers must include `Display.RenderTemplate` directive in their skill responses.
Template Builders are now included in alexa-sdk in the templateBuilders namespace. These provide a set of helper methods to build the JSON template for the `Display.RenderTemplate` directive. In the example below we use the `BodyTemplate1Builder` to build the `Body template`.

```javascript
const Alexa = require('alexa-sdk');
// utility methods for creating Image and TextField objects
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

// ...
'LaunchRequest' : function() {
	const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

	const template = builder.setTitle('My BodyTemplate1')
							.setBackgroundImage(makeImage('http://url/to/my/img.png'))
							.setTextContent(makePlainText('Text content'))
							.build();

	this.response.speak('Rendering a body template!')
				.renderTemplate(template);
	this.emit(':responseReady');
}
```

We've added helper utility methods to build Image and TextField objects. They are located in the `Alexa.utils` namespace.

```javascript
const ImageUtils = require('alexa-sdk').utils.ImageUtils;

// Outputs an image with a single source
ImageUtils.makeImage(url, widthPixels, heightPixels, size, description);
/**
Outputs {
    contentDescription : '<description>'
    sources : [
        {
            url : '<url>',
            widthPixels : '<widthPixels>',
            heightPixels : '<heightPixels>',
            size : '<size>'
        }
    ]
}
*/

ImageUtils.makeImages(imgArr, description);
/**
Outputs {
    contentDescription : '<description>'
    sources : <imgArr> // array of {url, size, widthPixels, heightPixels}
}
*/


const TextUtils = require('alexa-sdk').utils.TextUtils;

TextUtils.makePlainText('my plain text field');
/**
Outputs {
    text : 'my plain text field',
    type : 'PlainText'
}
*/

TextUtils.makeRichText('my rich text field');
/**
Outputs {
    text : 'my rich text field',
    type : 'RichText'
}
*/

```
In the next example, we will use ListTemplate1Builder and ListItemBuilder to build ListTemplate1.
```javascript
const Alexa = require('alexa-sdk');
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;
// ...
'LaunchRequest' : function() {
    const itemImage = makeImage('https://url/to/imageResource', imageWidth, imageHeight);
    const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder();
    const listTemplateBuilder = new Alexa.templateBuilders.ListTemplate1Builder();
    listItemBuilder.addItem(itemImage, 'listItemToken1', makePlainText('List Item 1'));
    listItemBuilder.addItem(itemImage, 'listItemToken2', makePlainText('List Item 2'));
    listItemBuilder.addItem(itemImage, 'listItemToken3', makePlainText('List Item 3'));
    listItemBuilder.addItem(itemImage, 'listItemToken4', makePlainText('List Item 4'));
    const listItems = listItemBuilder.build();
    const listTemplate = listTemplateBuilder.setToken('listToken')
    										.setTitle('listTemplate1')
    										.setListItems(listItems)
    										.build();
    this.response.speak('Rendering a list template!')
    			.renderTemplate(listTemplate);
    this.emit(':responseReady');
}
```

Sending a `Display.RenderTemplate` directive to a headless device (like an echo) will result in an invalid directive error being thrown. To check whether a device supports a particular directive, you can check the device's supportedInterfaces property.

```javascript
const handler = {
    'LaunchRequest' : function() {

    this.response.speak('Hello there');

    // Display.RenderTemplate directives can be added to the response
    if (this.event.context.System.device.supportedInterfaces.Display) {
        //... build mytemplate using TemplateBuilder
        this.response.renderTemplate(myTemplate);
    }

    this.emit(':responseReady');
    }
};
```

Similarly for video, you check if VideoApp is a supported interface of the device

```javascript
const handler = {
    'PlayVideoIntent' : function() {

    // VideoApp.Play directives can be added to the response
    if (this.event.context.System.device.supportedInterfaces.VideoApp) {
        this.response.playVideo('http://path/to/my/video.mp4');
    } else {
        this.response.speak("The video cannot be played on your device. " +
        "To watch this video, try launching the skill from your echo show device.");
    }

        this.emit(':responseReady');
    }
};
```
Additional documentation on `Display` interface can be found [here](https://developer.amazon.com/docs/custom-skills/display-interface-reference.html).

### Playback Controller Interface
The `PlaybackController` interface enables skills to handles requests sent when a customer interacts with player controls such as buttons on a device or a remote control. Those requests are different from normal voice requests such as "Alexa, next song" which are standard intent requests. In order to enable skill to handle `PlaybackController` requests, developers must implement `PlaybackController` interface in Alexa Node.js SDK.
```javascript
const handlers = {
    'PlaybackController.NextCommandIssued' : function() {
        //Your skill can respond to NextCommandIssued with any AudioPlayer directive.
    },
    'PlaybackController.PauseCommandIssued' : function() {
        //Your skill can respond to PauseCommandIssued with any AudioPlayer directive.
    },
    'PlaybackController.PlayCommandIssued' : function() {
        //Your skill can respond to PlayCommandIssued with any AudioPlayer directive.
    },
    'PlaybackController.PreviousCommandIssued' : function() {
        //Your skill can respond to PreviousCommandIssued with any AudioPlayer directive.
    },
    'System.ExceptionEncountered' : function() {
        //Your skill cannot return a response to System.ExceptionEncountered.
    }
};
```
Additional documentation about `PlaybackController` interface can be found [here](https://developer.amazon.com/docs/custom-skills/playback-controller-interface-reference.html).


### VideoApp Interface
To stream native video files on Echo Show, developers must send `VideoApp.Launch` directive. Alexa Node.js SDK provides a function in responseBuilder, to help build the JSON response object.
Here is an example to stream video:
```javascript
//...
'LaunchRequest' : function() {
    const videoSource = 'https://url/to/videosource';
    const metadata = {
    	'title': 'Title for Sample Video',
    	'subtitle': 'Secondary Title for Sample Video'
    };
    this.response.playVideo(videoSource metadata);
    this.emit(':responseReady');
}
```
Additional documentation on `VideoApp` interface can be found [here](https://developer.amazon.com/docs/custom-skills/videoapp-interface-reference.html).

### Skill and List Events
Skill developers have the capability to integrate with Alexa skill events directly. If the skill is subscribed to these events, the skill is notified when an event occurs.

In order to use events in your skill service, you must set up access to the Alexa Skill Management API (SMAPI) as described in [Add Events to Your Skill With SMAPI](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/add-events-to-your-skill-with-smapi).

Skill and List Events come out of session. Once your skill has been set up to receive these events. You can specify behaviour by adding the event names to your default event handler.

```javascript
const handlers = {
    'AlexaSkillEvent.SkillEnabled' : function() {
        const userId = this.event.context.System.user.userId;
        console.log(`skill was enabled for user: ${userId}`);
    },
    'AlexaHouseholdListEvent.ItemsCreated' : function() {
        const listId = this.event.request.body.listId;
        const listItemIds = this.event.request.body.listItemIds;
        console.log(`The items: ${JSON.stringify(listItemIds)} were added to list ${listId}`);
    },
    'AlexaHouseholdListEvent.ListCreated' : function() {
        const listId = this.event.request.body.listId;
        console.log(`The new list: ${JSON.stringify(listId)} was created`);
    }
    //...
};

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
```

We've created a [sample skill and walk-through](https://github.com/Alexa/alexa-cookbook/tree/master/context/skill-events) to guide you through the process of subscribing to skill events.s

## Services

### Device Address Service

Alexa NodeJS SDK provides a ```DeviceAddressService``` helper class that utilizes Device Address API to retrieve customer device address information. Currently the following methods are provided:

```javascript
getFullAddress(deviceId, apiEndpoint, token)
getCountryAndPostalCode(deviceId, apiEndpoint, token)
```
``apiEndpoint`` and ``token`` can be retrieved from the request at ``this.event.context.System.apiEndpoint`` and ``this.event.context.System.user.permissions.consentToken``

``deviceId`` can also be retrieved from request at ``this.event.context.System.device.deviceId``

```javascript
const Alexa = require('alexa-sdk');

'DeviceAddressIntent': function () {
    if (this.event.context.System.user.permissions) {
        const token = this.event.context.System.user.permissions.consentToken;
        const apiEndpoint = this.event.context.System.apiEndpoint;
        const deviceId = this.event.context.System.device.deviceId;

        const das = new Alexa.services.DeviceAddressService();
        das.getFullAddress(deviceId, apiEndpoint, token)
        .then((data) => {
            this.response.speak('<address information>');
            console.log('Address get: ' + JSON.stringify(data));
            this.emit(':responseReady');
        })
        .catch((error) => {
            this.response.speak('I\'m sorry. Something went wrong.');
            this.emit(':responseReady');
            console.log(error.message);
        });
    } else {
        this.response.speak('Please grant skill permissions to access your device address.');
        this.emit(':responseReady');
    }
}
```


### List Management Service

Alexa customers have access to two default lists: Alexa to-do and Alexa shopping. In addition, Alexa customer can create and manage custom lists in a skill that supports that.

Alexa NodeJS SDK provides a ```ListManagementService``` helper class to help developer create skills that manage default and custom Alexa lists more easily. Currently the following methods are provided:

````javascript
getListsMetadata(token)
createList(listObject, token)
getList(listId, itemStatus, token)
updateList(listId, listObject, token)
deleteList(listId, token)
createListItem(listId, listItemObject, token)
getListItem(listId, itemId, token)
updateListItem(listId, itemId, listItemObject, token)
deleteListItem(listId, itemId, token)
````

``token`` can be retrieved from the request at ``this.event.context.System.user.permissions.consentToken``

``listId`` can be retrieved from a ``GetListsMetadata`` call.
``itemId`` can be retrieved from a ``GetList`` call

````javascript
const Alexa = require('alexa-sdk');

function getListsMetadata(token) {
    const lms = new Alexa.services.ListManagementService();
    lms.getListsMetadata(token)
    .then((data) => {
        console.log('List retrieved: ' + JSON.stringify(data));
        this.context.succeed();
    })
    .catch((error) => {
        console.log(error.message);
    });
};
````

### Directive Service

`enqueue(directive, endpoint, token)`

Returns a directive to an Alexa device asynchronously during skill execution. It currently accepts speak directives only, with both SSML (inclusive of MP3 audio) and plain text output formats being supported. Directives can only be returned to the originating device when the skill is active. `apiEndpoint` and `token` parameters can be retrieved from the request at `this.event.context.System.apiEndpoint` and `this.event.context.System.apiAccessToken` respectively.
- The response speech should be limited to 600 characters.
- Any audio snippets referenced in SSML should be limited to 30 seconds.
- There is no limit on the number of directives that a skill can send through the directive service. If necessary, skills can send multiple requests for each execution.
- The directive service does not contain any deduplication processing, so we do not recommend any form of retry processing as it may result in users receiving the same directive multiple times.

```javascript
const Alexa = require('alexa-sdk');

const handlers = {
    'SearchIntent' : function() {
        const requestId = this.event.request.requestId;
        const token = this.event.context.System.apiAccessToken;
        const endpoint = this.event.context.System.apiEndpoint;
        const ds = new Alexa.services.DirectiveService();

        const directive = new Alexa.directives.VoicePlayerSpeakDirective(requestId, "Please wait...");
        const progressiveResponse = ds.enqueue(directive, endpoint, token)
        .catch((err) => {
            // catch API errors so skill processing an continue
        });
        const serviceCall = callMyService();

        Promise.all([progressiveResponse, serviceCall])
        .then(() => {
            this.response.speak('I found the following results');
            this.emit(':responseReady');
        });
    }
};

```

## Extend Features

### Skill State Management

Alexa-sdk use state manager to route the incoming intents to the correct function handler. State is stored as a string in the session attributes indicating the current state of the skill. You can emulate the built-in intent routing by appending the state string to the intent name when defining your intent handlers, but alexa-sdk helps do that for you.

Let's take a sample skill [highlowgame](https://github.com/alexa/skill-sample-nodejs-highlowgame/blob/master/lambda/custom/index.js) as an example to explain how state management works in SDK. In this skill, the customer will guess a number and the Alexa will tell if the number is higher or lower. It will also tell how many times the customer has played. It has two states 'start' and 'guess':
```javascript
const states = {
	GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
	STARTMODE: '_STARTMODE' // Prompt the user to start or restart the game.
};
```
The NewSession handler in newSessionHandlers will short-cut any incoming intent or launch requests and route them to this handler.
```javascript
const newSessionHandlers = {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) { // Check if it's the first time the skill has been invoked
            this.attributes['endedSessionCount'] = 0;
            this.attributes['gamesPlayed'] = 0;
        }
        this.handler.state = states.STARTMODE;
        this.response.speak('Welcome to High Low guessing game. You have played '
                        + this.attributes['gamesPlayed'].toString() + ' times. Would you like to play?')
                    .listen('Say yes to start the game or no to quit.');
        this.emit(':responseReady');
    }
};
```
Notice that when a new session is created we simply set the state of our skill into `STARTMODE` using `this.handler.state`. The skills state will automatically be persisted in your skill's session attributes, and will be optionally persisted across sessions if you set a DynamoDB table.

It is also important to point out that `NewSession` is a great catch-all behavior and a good entry point but it is not required. `NewSession` will only be invoked if a handler with that name is defined. Each state you define can have its own `NewSession` handler which will be invoked if you are using the built-in persistence. In the above example we could define different `NewSession` behavior for both `states.STARTMODE` and `states.GUESSMODE` giving us added flexibility.

In order to define intents that will respond to the different states of our skill, we need to use the `Alexa.CreateStateHandler` function. Any intent handlers defined here will only work when the skill is in a specific state, giving us even greater flexibility!

For example, if we are in the `GUESSMODE` state we defined above we want to handle a user responding to a question. This can be done using StateHandlers like this:
```javascript
const guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {

'NewSession': function () {
    this.handler.state = '';
    this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
},

'NumberGuessIntent': function() {
    const guessNum = parseInt(this.event.request.intent.slots.number.value);
    const targetNum = this.attributes['guessNumber'];

    console.log('user guessed: ' + guessNum);

    if(guessNum > targetNum){
        this.emit('TooHigh', guessNum);
    } else if( guessNum < targetNum){
        this.emit('TooLow', guessNum);
    } else if (guessNum === targetNum){
        // With a callback, use the arrow function to preserve the correct 'this' context
        this.emit('JustRight', () => {
            this.response.speak(guessNum.toString() + 'is correct! Would you like to play a new game?')
                        .listen('Say yes to start a new game, or no to end the game.');
            this.emit(':responseReady');
        });
    } else {
        this.emit('NotANum');
    }
},

'AMAZON.HelpIntent': function() {
    this.response.speak('I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
    ' if it is higher or lower.')
                .listen('Try saying a number.');
    this.emit(':responseReady');
},

'SessionEndedRequest': function () {
    console.log('session ended!');
    this.attributes['endedSessionCount'] += 1;
    this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
},

'Unhandled': function() {
    this.response.speak('Sorry, I didn\'t get that. Try saying a number.')
                .listen('Try saying a number.');
    this.emit(':responseReady');
}
});
```
On the flip side, if I am in `STARTMODE` I can define my `StateHandlers` to be the following:

```javascript
const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {

    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },

    'AMAZON.HelpIntent': function() {
        const message = 'I will think of a number between zero and one hundred, try to guess and I will tell you if it' +
        ' is higher or lower. Do you want to start the game?';
        this.response.speak(message)
                    .listen(message);
        this.emit(':responseReady');
    },

    'AMAZON.YesIntent': function() {
        this.attributes['guessNumber'] = Math.floor(Math.random() * 100);
        this.handler.state = states.GUESSMODE;
        this.response.speak('Great! ' + 'Try saying a number to start the game.')
                    .listen('Try saying a number.');
        this.emit(':responseReady');
    },

    'AMAZON.NoIntent': function() {
        this.response.speak('Ok, see you next time!');
        this.emit(':responseReady');
    },

    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':saveState', true);
    },

    'Unhandled': function() {
        const message = 'Say yes to continue, or no to end the game.';
        this.response.speak(message)
                    .listen(message);
        this.emit(':responseReady');
    }
});
```
Take a look at how `AMAZON.YesIntent` and `AMAZON.NoIntent` are not defined in the `guessModeHandlers` object, since it doesn't make sense for a 'yes' or 'no' response in this state. Those intents will be caught by the `Unhandled` handler.

Also, notice the different behavior for `NewSession` and `Unhandled` across both states? In this game, we 'reset' the state by calling a `NewSession` handler defined in the `newSessionHandlers` object. You can also skip defining it and alexa-sdk will call the intent handler for the current state. Just remember to register your State Handlers before you call `alexa.execute()` or they will not be found.

Your attributes will be automatically saved when you end the session, but if the user ends the session you have to emit the `:saveState` event (`this.emit(':saveState', true)`) to force a save. You should do this in your `SessionEndedRequest` handler which is called when the user ends the session by saying 'quit' or timing out. Take a look at the example above.

If you want to explicitly reset the state, the following code should work:
```javascript
this.handler.state = '' // delete this.handler.state might cause reference errors
delete this.attributes['STATE'];
```

### Persisting Skill Attributes through DynamoDB

Many of you would like to persist your session attribute values into storage for further use. Alexa-sdk integrates directly with [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) (a NoSQL database service) to enable you to do this with a single line of code.

Simply set the name of the DynamoDB table on your alexa object before you call alexa.execute.
```javascript
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = appId;
    alexa.dynamoDBTableName = 'YourTableName'; // That's it!
    alexa.registerHandlers(State1Handlers, State2Handlers);
    alexa.execute();
};
```

Then later on to set a value you simply need to call into the attributes property of the alexa object. No more separate `put` and `get` functions!
```javascript
this.attributes['yourAttribute'] = 'value';
```

You can [create the table manually](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SampleData.CreateTables.html) beforehand or simply give your Lambda function DynamoDB [create table permissions](http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_CreateTable.html) and it will happen automatically. Just remember it can take a minute or so for the table to be created on the first invocation. If you create the table manually, the Primary Key must be a string value called "userId".

Note: If you host your skill on lambda and choose to persist skill attributes through DynamoDB, please make sure the excution role of lambda function includes access to DynamoDB. 

### Adding Multi-Language Support for Skill
Let's take the Hello World example here. Define all user-facing language strings in the following format.
```javascript
const languageStrings = {
    'en-GB': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hello World!'
        }
    },
    'en-US': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hello World!'
        }
    },
    'de-DE': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hallo Welt!'
        }
    }
};
```

To enable string internationalization features in Alexa-sdk, set resources to the object we created above.
```javascript
exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
```

Once you are done defining and enabling language strings, you can access these strings using the this.t() function. Strings will be rendered in the language that matches the locale of the incoming request.
```javascript
const handlers = {
    'LaunchRequest': function () {
        this.emit('SayHello');
    },
    'HelloWorldIntent': function () {
        this.emit('SayHello');
    },
    'SayHello': function () {
        this.response.speak(this.t('SAY_HELLO_MESSAGE'));
        this.emit(':responseReady');
    }
};
```
For more infomation about developing and deploying skills in multiple languages, please go [here](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-skills-in-multiple-languages).

### Device ID Support
When a customer enables your Alexa skill, your skill can obtain the customer’s permission to use address data associated with the customer’s Alexa device. You can then use this address data to provide key functionality for the skill, or to enhance the customer experience.

The `deviceId` is now exposed through the context object in each request and can be accessed in any intent handler through `this.event.context.System.device.deviceId`. See the [Address API sample skill](https://github.com/alexa/skill-sample-node-device-address-api) to see how we leveraged the deviceId and the Address API to use a user's device address in a skill.

### Speechcons (Interjections)

[Speechcons](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/speechcon-reference) are special words and phrases that Alexa pronounces more expressively. In order to use them you can just include the SSML markup in the text to emit.

* `this.emit(':tell', 'Sometimes when I look at the Alexa skills you have all taught me, I just have to say, <say-as interpret-as="interjection">Bazinga.</say-as> ');`
* `this.emit(':tell', '<say-as interpret-as="interjection">Oh boy</say-as><break time="1s"/> this is just an example.');`

_Speechcons are supported for English (US), English (UK), English (India), and German._

## Setting up your development environment

- Requirements
- Gulp & mocha  ```npm install -g gulp mocha```
- Run npm install to pull down stuff
- run gulp to run tests/linter

For more information about getting started with the Alexa Skills Kit, check out the following additional assets:

[Alexa Dev Chat Podcast](http://bit.ly/alexadevchat)

[Alexa Training with Big Nerd Ranch](https://developer.amazon.com/public/community/blog/tag/Big+Nerd+Ranch)

[Alexa Skills Kit (ASK)](https://developer.amazon.com/ask)

[Alexa Developer Forums](https://forums.developer.amazon.com/forums/category.jspa?categoryID=48)

[Training for the Alexa Skills Kit](https://developer.amazon.com/alexa-skills-kit/alexa-skills-developer-training)

-Dave ( [@TheDaveDev](http://twitter.com/thedavedev))
