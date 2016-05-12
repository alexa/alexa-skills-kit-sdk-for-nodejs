'use strict';

module.exports = (function () {
    return {
        ':tell': function (speechOutput) {
            console.log(`${this.name} overridden: ${this.isOverridden()}`);
            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: speechOutput,
                shouldEndSession: true
            });
            this.emit(':ResponseReady');
        },
        ':ask': function (speechOutput, repromptSpeech) {
            console.log(`${this.name} overridden: ${this.isOverridden()}`);
            this.handler.response = buildSpeechletResponse({
                sessionAttributes: this.attributes,
                output: speechOutput,
                reprompt: repromptSpeech,
                shouldEndSession: false
            });
            this.emit(':ResponseReady');
        },
        ':ResponseReady': function () {
            console.log(`${this.name} overridden: ${this.isOverridden()}`);
            if(this.event.debug) {
                console.log('Response:\n' + JSON.stringify(this.handler.response, null, 4));
            }

            if(this.handler.response.shouldEndSession) {
                this.emit(':SessionEndedRequest');
            } else {
                this.context.succeed(this.handler.response);
            }
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