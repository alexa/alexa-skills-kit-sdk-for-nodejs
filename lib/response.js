'use strict';
var attributesHelper = require('./DynamoAttributesHelper');

module.exports = (function () {
    return {
        ':tell': function (speechOutput) {
            if(this.isOverridden()) {
                return;
            }

            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: getSSMLResponse(speechOutput),
                shouldEndSession: true
            });
            this.emit(':responseReady');
        },
        ':ask': function (speechOutput, repromptSpeech) {
            if(this.isOverridden()) {
                return;
            }
            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: getSSMLResponse(speechOutput),
                reprompt: getSSMLResponse(repromptSpeech),
                shouldEndSession: false
            });
            this.emit(':responseReady');
        },
        ':askWithCard': function(speechOutput, repromptSpeech, cardTitle, cardContent, imageObj) {
            if(this.isOverridden()) {
                return;
            }

            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: getSSMLResponse(speechOutput),
                reprompt: getSSMLResponse(repromptSpeech),
                cardTitle: cardTitle,
                cardContent: cardContent,
                cardImage: imageObj,
                shouldEndSession: false
            });
            this.emit(':responseReady');
        },
        ':tellWithCard': function(speechOutput, cardTitle, cardContent, imageObj) {
            if(this.isOverridden()) {
                return;
            }

            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: getSSMLResponse(speechOutput),
                cardTitle: cardTitle,
                cardContent: cardContent,
                cardImage: imageObj,
                shouldEndSession: true
            });
            this.emit(':responseReady');
        },
        ':tellWithLinkAccountCard': function(speechOutput) {
            if(this.isOverridden()) {
                return;
            }

            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: getSSMLResponse(speechOutput),
                cardType: 'LinkAccount',
                shouldEndSession: true
            });
            this.emit(':responseReady');
        },
        ':askWithLinkAccountCard': function(speechOutput, repromptSpeech) {
            if(this.isOverridden()) {
                return;
            }

            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: getSSMLResponse(speechOutput),
                reprompt: getSSMLResponse(repromptSpeech),
                cardType: 'LinkAccount',
                shouldEndSession: false
            });
            this.emit(':responseReady');
        },
        ':responseReady': function () {
            if (this.isOverridden()) {
                return;
            }

            if(this.handler.state) {
                this.handler.response.sessionAttributes['STATE'] = this.handler.state;
            }

            if (this.handler.dynamoDBTableName) {
                return this.emit(':saveState');
            }

            this.context.succeed(this.handler.response);
        },
        ':saveState': function(forceSave) {
            if (this.isOverridden()) {
                return;
            }

            if(forceSave && this.handler.state){
                this.attributes['STATE'] = this.handler.state;
            }

            if(this.saveBeforeResponse || forceSave || this.handler.response.response.shouldEndSession) {
                attributesHelper.set(this.handler.dynamoDBTableName, this.event.session.user.userId, this.attributes,
                    (err) => {
                        if(err) {
                            return this.emit(':saveStateError', err);
                        }
                        this.context.succeed(this.handler.response);
                });
            } else {
                this.context.succeed(this.handler.response);
            }
        },
        ':saveStateError': function(err) {
            if(this.isOverridden()) {
                return;
            }
            console.log(`Error saving state: ${err}\n${err.stack}`);
            this.context.fail(err);
        }
    };
})();

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    var alexaResponse = {
        outputSpeech: createSpeechObject(options.output),
        shouldEndSession: options.shouldEndSession
    };

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if(options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if(options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    } else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    }

    var returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

/**
 * TODO: check for ssml content in card
 *
 * This function creates a response object that Alexa will say to the user.
 * This response has two properties:
 * type - which can be SSML or PlainText
 * speech - Which is a string that could be an SSML message or plain text.
 *
 * The message passed in can be one of the followings:
 *
 * - string, number or boolean which will be converted to the following response:
 *  { type: 'SSML', speech: '<speak>{message value}</speak>' }
 *
 * - when an object is passed in that has type and speech properties, it'll just be returned.
 *
 * @param message The message to convert into a object that has type + speech properties.
 * @returns {{type: string, speech: string}}
 */
function getSSMLResponse(message) {
    if (message === null || message === undefined) {
        throw new Error('The message must not be null or undefined');
    }

    var messageType = typeof(message);
    if (messageType === "function") {
        throw new Error('The message must not be a function');
    }

    if (messageType === "object") {
        if (message.type && message.speech) {
            if (isValidSpeechType(message.type)) {
                return {
                    type: normalizeSpeechType(message.type),
                    speech: message.speech
                };
            }
        } else {
            throw new Error('The message must be an object with properties "type" and "speech".');
        }
    }
    
    if (isAcceptableTypes(messageType)) {
        return {
            type: 'SSML',
            speech: `<speak>${message}</speak>`
        };
    }
    throw new Error("The message must not be of type: " + messageType + ". Valid types are string, number, boolean and object (with type/speech properties)."); // This addresses Symbols in ES6.
}

/**
 * Checks to see if the speech type is valid. Either SSML or PlainText.
 * @param speechType The speech type to check.
 * @returns {boolean} true if the speech type is valid, false otherwise.
 */
function isValidSpeechType(speechType){
    var acceptableSpeechTypes = ["plaintext", "ssml"];
    return acceptableSpeechTypes.indexOf(speechType.toLowerCase()) != -1;
}

/**
 * Normalizes the case sensitivity of the speech type. e.g., ssml -> SSML, plaintext -> PlainText
 * This makes using the Alexa Skill easier by allowing uses to not worry about case sensitivity.
 * @param speechType The type of speech to be converted to the proper case.
 * @returns {string} speech type in the proper case.
 */
function normalizeSpeechType(speechType){
    var type = "SSML";
    if (speechType.toLowerCase() == "plaintext") {
        type = "PlainText";
    }
    return type;
}

/**
 * Checks to see if the message type is valid. Either string or number or boolean.
 * @param messageType The message type to check.
 * @returns {boolean} true if the message type is valid, false otherwise.
 */
function isAcceptableTypes(messageType) {
    var acceptableTypes = ["string", "number", "boolean"];
    return acceptableTypes.indexOf(messageType) != -1;
}