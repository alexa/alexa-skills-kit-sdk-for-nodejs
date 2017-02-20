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

            var userId = '';

            // Long-form audio enabled skills use event.context
            if (this.event.context) {
                userId = this.event.context.System.user.userId;
            } else if (this.event.session) {
                userId = this.event.session.user.userId;
            }

            if(this.saveBeforeResponse || forceSave || this.handler.response.response.shouldEndSession) {
                attributesHelper.set(this.handler.dynamoDBTableName, userId, this.attributes,
                    (err) => {
                        if(err) {
                            return this.emit(':saveStateError', err);
                        }

                        // To save the state when AudioPlayer Requests come without sending a response.
                        if (Object.keys(this.handler.response).length === 0 && this.handler.response.constructor === Object) {
                            this.handler.response =  true;
                        }

                        this.context.succeed(this.handler.response);
                    });
            } else {
                this.context.succeed(this.handler.response || true);
            }
        },
        ':saveStateError': function(err) {
            if(this.isOverridden()) {
                return;
            }
            console.log(`Error saving state: ${err}\n${err.stack}`);
            this.context.fail(err);
        },
        ':play': function (title, url) {
            if (this.isOverridden()) {
                return;
            }

            // If last time the audio ends on its own, reset the audio attributes and play from the top of the radio list.
            if (this.attributes[':playbackFinished']) {
                this.attributes[':index'] = 0;
                this.attributes[':offsetInMilliseconds'] = 0;
                this.attributes[':playbackIndexChanged'] = true;
                this.attributes[':playbackFinished'] = false;
            }

            // If the user does not dedicate a audio to play, play the first audio on the list.
            if (!title) {
                title = this.handler.audioData[this.attributes[':playOrder'][this.attributes[':index']]].title;
            }
            if (!url) {
                url = this.handler.audioData[this.attributes[':playOrder'][this.attributes[':index']]].url;
            }

            // Update the index of the audio.
            var flag = false;
            for(var i = 0; i < this.handler.audioData.length; i++){
                if (this.handler.audioData[i].url === url && this.handler.audioData[i].title === title) {
                    this.attributes[':index'] = this.attributes[':playOrder'].indexOf(i);
                    flag = true;
                    break;
                }
            }
            if(!flag) {
                console.log("The provided url and title are not in the audioData.");
                this.context.succeed({});
            }

            // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
            this.attributes[':enqueuedToken'] = null;
            var token = String(this.attributes[':playOrder'][this.attributes[':index']]);
            var offsetInMilliseconds = this.attributes[':offsetInMilliseconds'];

            // If change to another audio, create a new card
            if (canThrowCard.call(this)) {
                var cardTitle = 'Playing ' + title;
                var cardContent = 'Playing ' + title;
                this.response.cardRenderer(cardTitle, cardContent, null);
            }
            this.response.audioPlayerPlay('REPLACE_ALL', url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');
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

function canThrowCard() {
    /*
     * Determine if a card can be included with a response. PlaybackController and AudioPlayer Request (remote control events)
     * cannot display a card. Use the IntentRequest request type if a card is needed.
     */
    if ((this.event.request.type === 'IntentRequest' || this.event.request.type === 'LaunchRequest')
        && this.attributes[':playbackIndexChanged']) {
        this.attributes[':playbackIndexChanged'] = false;
        return true;
    } else {
        return false;
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

// TODO: check for ssml content in card
function getSSMLResponse(message) {
    return {
        type: 'SSML',
        speech: `<speak> ${message} </speak>`
    };
}
