/**
 * alexa.js
 */
'use strict';

//Init modules
const EventEmitter = require('events').EventEmitter,
    util = require('util'),
    i18n = require('i18next'),
    sprintf = require('i18next-sprintf-postprocessor'),
    attributesHelper = require('./DynamoAttributesHelper'),
    responseHandlers = require('./response'),
    _StateString = 'STATE';


/**
 * @constructor
 * @extends EventEmitter
 */
function AlexaRequestEmitter() {
    EventEmitter.call(this);
    this.listeners()
}

util.inherits(AlexaRequestEmitter, EventEmitter);

/**
 * @param event
 * @param context
 * @param callback
 * @return {AlexaRequestEmitter}
 */
function alexaRequestHandler(event, context, callback) {
    if (!event.session) {
        event.session = {
            'attributes': {}
        };
    } else if (!event.session['attributes']) {
        event.session['attributes'] = {};
    }

    const handler = new AlexaRequestEmitter();
    handler.setMaxListeners(Infinity);

    Object.defineProperty(handler, '_event', {
        value: event,
        writable: false
    });

    Object.defineProperty(handler, '_context', {
        value: context,
        writable: false
    });

    Object.defineProperty(handler, '_callback', {
        value: callback,
        writable: false
    });

    Object.defineProperty(handler, 'state', {
        value: null,
        writable: true,
        configurable: true
    });

    Object.defineProperty(handler, 'appId', {
        value: null,
        writable: true
    });

    Object.defineProperty(handler, 'response', {
        value: {},
        writable: true
    });

    Object.defineProperty(handler, 'dynamoDBTableName', {
        value: null,
        writable: true
    });

    Object.defineProperty(handler, 'saveBeforeResponse', {
        value: false,
        writable: true
    });

    Object.defineProperty(handler, 'i18n', {
        value: i18n,
        writable: true
    });

    Object.defineProperty(handler, 'locale', {
        value: undefined,
        writable: true
    });

    Object.defineProperty(handler, 'resources', {
        value: undefined,
        writable: true
    });

    Object.defineProperty(handler, 'registerHandlers', {
        value: function () {
            RegisterHandlers.apply(handler, arguments);
        },
        writable: false
    });

    Object.defineProperty(handler, 'execute', {
        value: function () {
            HandleLambdaEvent.call(handler);
        },
        writable: false
    });

    handler.registerHandlers(responseHandlers);

    return handler;
}

/**
 * @constructor
 */
function HandleLambdaEvent() {
    this.locale = this._event.request.locale;
    if (this.resources) {
        this.i18n.use(sprintf).init({
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            returnObjects: true,
            lng: this.locale,
            resources: this.resources
        }, (err) => {
            if (err) {
                throw new Error('Error initializing i18next: ' + err);
            }
            ValidateRequest.call(this);
        });
    } else {
        ValidateRequest.call(this);
    }
}

/**
 * @constructor
 */
function ValidateRequest() {
    const event = this._event;
    const context = this._context;
    const handlerAppId = this.appId;

    let requestAppId = '';
    let userId = '';

    // Long-form audio enabled skills use event.context
    if (event.context) {
        requestAppId = event.context.System.application.applicationId;
        userId = event.context.System.user.userId;
    } else if (event.session) {
        requestAppId = event.session.application.applicationId;
        userId = event.session.user.userId;
    }


    if (!handlerAppId) {
        console.log('Warning: Application ID is not set');
    }

    try {
        // Validate that this request originated from authorized source.
        if (handlerAppId && (requestAppId !== handlerAppId)) {
            console.log(`The applicationIds don\'t match: ${requestAppId} and ${handlerAppId}`);
            return context.fail('Invalid ApplicationId: ' + handlerAppId);
        }

        if (this.dynamoDBTableName && (!event.session.sessionId || event.session['new'])) {
            attributesHelper.get(this.dynamoDBTableName, userId, (err, data) => {
                if (err) {
                    return context.fail('Error fetching user state: ' + err);
                }

                Object.assign(this._event.session.attributes, data);

                EmitEvent.call(this);
            });
        } else {
            EmitEvent.call(this);
        }
    } catch (e) {
        console.log(`Unexpected exception '${e}':\n${e.stack}`);
        context.fail(e);
    }
}

/**
 * @constructor
 */
function EmitEvent() {
    this.state = this._event.session.attributes[_StateString] || '';

    let eventString = '';

    if (this._event.session['new'] && this.listenerCount('NewSession' + this.state) === 1) {
        eventString = 'NewSession';
    } else if (this._event.request.type === 'LaunchRequest') {
        eventString = 'LaunchRequest';
    } else if (this._event.request.type === 'IntentRequest') {
        eventString = this._event.request.intent.name;
    } else if (this._event.request.type === 'SessionEndedRequest') {
        eventString = 'SessionEndedRequest';
    } else if (this._event.request.type.substring(0, 11) === 'AudioPlayer') {
        eventString = this._event.request.type.substring(12);
    } else if (this._event.request.type.substring(0, 18) === 'PlaybackController') {
        eventString = this._event.request.type.substring(19);
    }

    eventString += this.state;

    if (this.listenerCount(eventString) < 1) {
        eventString = 'Unhandled' + this.state;
    }

    if (this.listenerCount(eventString) < 1) {
        throw new Error(`No 'Unhandled' function defined for event: ${eventString}`);
    }

    this.emit(eventString);
}


/**
 * @constructor
 */
function RegisterHandlers() {
    for (let arg = 0; arg < arguments.length; arg++) {
        const handlerObject = arguments[arg];

        if (!isObject(handlerObject)) {
            throw new Error(`Argument #${arg} was not an Object`);
        }

        const eventNames = Object.keys(handlerObject);

        for (let i = 0; i < eventNames.length; i++) {
            if (typeof(handlerObject[eventNames[i]]) !== 'function') {
                throw new Error(`Event handler for '${eventNames[i]}' was not a function`);
            }

            let eventName = eventNames[i];

            if (handlerObject[_StateString]) {
                eventName += handlerObject[_StateString];
            }

            const handlerContext = {
                on: this.on.bind(this),
                emit: this.emit.bind(this),
                emitWithState: EmitWithState.bind(this),
                state: this.state,
                handler: this,
                i18n: this.i18n,
                locale: this.locale,
                t: () => {
                    return this.i18n.t.apply(this.i18n, arguments);
                },
                event: this._event,
                attributes: this._event.session.attributes,
                context: this._context,
                name: eventName,
                isOverridden: IsOverridden.bind(this, eventName),
                response: ResponseBuilder(this)
            };

            this.on(eventName, handlerObject[eventNames[i]].bind(handlerContext));
        }
    }
}


/**
 * @param obj
 * @return {boolean}
 */
function isObject(obj) {
    return (!!obj) && (obj.constructor === Object);
}


/**
 * @param name
 * @return {boolean}
 * @constructor
 */
function IsOverridden(name) {
    return this.listenerCount(name) > 1;
}

/**
 * @param self
 * @return {{speak, listen, cardRenderer, linkAccountCard, audioPlayer, audioPlayerPlay, audioPlayerStop, audioPlayerClearQueue}}
 * @constructor
 */
function ResponseBuilder(self) {
    const responseObject = self.response;
    responseObject.version = '1.0';
    responseObject.response = {
        shouldEndSession: true
    };
    responseObject.sessionAttributes = self._event.session.attributes;

    return (function () {
        return {
            'speak': function (speechOutput) {
                responseObject.response.outputSpeech = createSSMLSpeechObject(speechOutput);
                return this;
            },
            'listen': function (repromptSpeech) {
                responseObject.response.reprompt = {
                    outputSpeech: createSSMLSpeechObject(repromptSpeech)
                };
                responseObject.response.shouldEndSession = false;
                return this;
            },
            'cardRenderer': function (cardTitle, cardContent, cardImage) {
                const card = {
                    type: 'Simple',
                    title: cardTitle,
                    content: cardContent
                };

                if (cardImage && (cardImage.smallImageUrl || cardImage.largeImageUrl)) {
                    card.type = 'Standard';
                    card['image'] = {};

                    delete card.content;
                    card.text = cardContent;

                    if (cardImage.smallImageUrl) {
                        card.image['smallImageUrl'] = cardImage.smallImageUrl;
                    }

                    if (cardImage.largeImageUrl) {
                        card.image['largeImageUrl'] = cardImage.largeImageUrl;
                    }
                }

                responseObject.response.card = card;
                return this;
            },
            'linkAccountCard': function () {
                responseObject.response.card = {
                    type: 'LinkAccount'
                };
                return this;
            },
            'audioPlayer': function (directiveType, behavior, url, token, expectedPreviousToken, offsetInMilliseconds) {
                let audioPlayerDirective;
                if (directiveType === 'play') {
                    audioPlayerDirective = {
                        "type": "AudioPlayer.Play",
                        "playBehavior": behavior,
                        "audioItem": {
                            "stream": {
                                "url": url,
                                "token": token,
                                "expectedPreviousToken": expectedPreviousToken,
                                "offsetInMilliseconds": offsetInMilliseconds
                            }
                        }
                    };
                } else if (directiveType === 'stop') {
                    audioPlayerDirective = {
                        "type": "AudioPlayer.Stop"
                    };
                } else {
                    audioPlayerDirective = {
                        "type": "AudioPlayer.Stop",
                        "clearBehavior": behavior
                    };
                }

                responseObject.response.directives = [audioPlayerDirective];
                return this;
            },
            'audioPlayerPlay': function (behavior, url, token, expectedPreviousToken, offsetInMilliseconds) {
                const audioPlayerDirective = {
                    "type": "AudioPlayer.Play",
                    "playBehavior": behavior,
                    "audioItem": {
                        "stream": {
                            "url": url,
                            "token": token,
                            "expectedPreviousToken": expectedPreviousToken,
                            "offsetInMilliseconds": offsetInMilliseconds
                        }
                    }
                };

                responseObject.response.directives = [audioPlayerDirective];
                return this;
            },
            'audioPlayerStop': function () {
                const audioPlayerDirective = {
                    "type": "AudioPlayer.Stop"
                };

                responseObject.response.directives = [audioPlayerDirective];
                return this;
            },
            'audioPlayerClearQueue': function (clearBehavior) {
                const audioPlayerDirective = {
                    "type": "AudioPlayer.ClearQueue",
                    "clearBehavior": clearBehavior
                };

                responseObject.response.directives = [audioPlayerDirective];
                return this;
            }
        }
    })();
}

/**
 * @param message
 * @return {{type: string, ssml: string}}
 */
function createSSMLSpeechObject(message) {
    return {
        type: 'SSML',
        ssml: `<speak>${message}</speak>`
    };
}


/**
 * @param state
 * @param obj
 * @return {*}
 */
function createStateHandler(state, obj) {
    if (!obj) {
        obj = {};
    }

    Object.defineProperty(obj, _StateString, {
        value: state || ''
    });

    return obj;
}


/**
 * @constructor
 * @extends EventEmitter
 */
function EmitWithState() {

    if (arguments.length === 0) {
        throw new Error('EmitWithState called without arguments');
    }

    arguments[0] = arguments[0] + this.state;

    if (this.listenerCount(arguments[0]) < 1) {
        arguments[0] = 'Unhandled' + this.state;
    }

    if (this.listenerCount(arguments[0]) < 1) {
        throw new Error(`No 'Unhandled' function defined for event: ${arguments[0]}`);
    }

    this.emit.apply(this, arguments);
}

//add event listener for process exception
process.on('uncaughtException', function (err) {
    console.log(`Uncaught exception: ${err}\n${err.stack}`);
    throw err;
});

//finalize module
module.exports.LambdaHandler = alexaRequestHandler;
module.exports.CreateStateHandler = createStateHandler;
module.exports.StateString = _StateString;