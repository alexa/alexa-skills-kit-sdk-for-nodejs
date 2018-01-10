'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const attributesHelper = require('./DynamoAttributesHelper');
const responseHandlers = require('./response');
const _StateString = 'STATE';
const ResponseBuilder = require('./responseBuilder').ResponseBuilder;
const skillEventHandlers = require('./defaultHandlers/skillEventHandlers').skillEventHandlers;
const EventParser = require('./eventParser').EventParser;

function AlexaRequestEmitter() {
    EventEmitter.call(this);
}

util.inherits(AlexaRequestEmitter, EventEmitter);

function alexaRequestHandler(event, context, callback) {
    if (!event.session) {
        event.session = { 'attributes': {} };
    } else if (!event.session.attributes) {
        event.session.attributes = {};
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

    Object.defineProperty(handler, 'dynamoDBClient', {
        value: null,
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
        value: function() {
            RegisterHandlers.apply(handler, arguments);
        },
        writable: false
    });

    Object.defineProperty(handler, 'execute', {
        value: function() {
            HandleLambdaEvent.call(handler);
        },
        writable: false
    });

    handler.registerHandlers(responseHandlers);
    handler.registerHandlers(skillEventHandlers);

    return handler;
}

function HandleLambdaEvent() {
    this.locale = this._event.request.locale;
    if(this.resources) {
        this.i18n.use(sprintf).init({
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            returnObjects: true,
            lng: this.locale,
            resources: this.resources
        }, (err) => {
            if(err) {
                throw new Error('Error initializing i18next: ' + err);
            }
            ValidateRequest.call(this);
        });
    } else {
        ValidateRequest.call(this);
    }
}

function ValidateRequest() {
    const event = this._event;
    const context = this._context;
    const callback = this._callback;
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


    if(!handlerAppId){
        console.log('Warning: Application ID is not set');
    }

    try {
        // Validate that this request originated from authorized source.
        if (handlerAppId && (requestAppId !== handlerAppId)) {
            console.log(`The applicationIds don\'t match: ${requestAppId} and ${handlerAppId}`);
            const error = new Error('Invalid ApplicationId: ' + handlerAppId);
            if(typeof callback === 'undefined') {
                return context.fail(error);
            } else {
                return callback(error);
            }
        }

        if(this.dynamoDBTableName && (!event.session.sessionId || event.session['new']) ) {
            attributesHelper(this.dynamoDBClient).get(this.dynamoDBTableName, userId, (err, data) => {
                if(err) {
                    const error = new Error('Error fetching user state: ' + err);
                    if(typeof callback === 'undefined') {
                        return context.fail(error);
                    } else {
                        return  callback(error);
                    }
                }

                Object.assign(this._event.session.attributes, data);

                EmitEvent.call(this);
            });
        } else {
            EmitEvent.call(this);
        }
    } catch (e) {
        console.log(`Unexpected exception '${e}':\n${e.stack}`);
        if(typeof callback === 'undefined') {
            return context.fail(e);
        } else {
            return  callback(e);
        }
    }
}

function EmitEvent() {
    this.state = this._event.session.attributes[_StateString] || '';

    let eventString = '';

    if (this._event.session['new'] && this.listenerCount('NewSession' + this.state) === 1) {
        eventString = 'NewSession';
    } else {
        eventString = EventParser.parseEventName(this._event);
    }
    const handlerFuncName = eventString;

    eventString += this.state;

    if(this.listenerCount(eventString) < 1) {
        eventString = 'Unhandled' + this.state;
    }

    if(this.listenerCount(eventString) < 1){
        throw new Error(`In state: ${this.state}. No handler function was defined for event ${handlerFuncName} ` +
            `and no 'Unhandled' function was defined.`);
    }

    this.emit(eventString);
}

function RegisterHandlers() {
    for(let arg = 0; arg < arguments.length; arg++) {
        const handlerObject = arguments[arg];

        if(!isObject(handlerObject)) {
            throw new Error(`Argument #${arg} was not an Object`);
        }

        const eventNames = Object.keys(handlerObject);

        for(let i = 0; i < eventNames.length; i++) {
            if(typeof(handlerObject[eventNames[i]]) !== 'function') {
                throw new Error(`Event handler for '${eventNames[i]}' was not a function`);
            }

            let eventName = eventNames[i];

            if(handlerObject[_StateString]) {
                eventName += handlerObject[_StateString];
            }

            const localize = function() {
                return this.i18n.t.apply(this.i18n, arguments);
            };

            const handlerContext = {
                on: this.on.bind(this),
                emit: this.emit.bind(this),
                emitWithState: EmitWithState.bind(this),
                handler: this,
                i18n: this.i18n,
                locale: this.locale,
                t : localize,
                event: this._event,
                attributes: this._event.session.attributes,
                context: this._context,
                callback : this._callback,
                name: eventName,
                isOverridden:  IsOverridden.bind(this, eventName),
                response: new ResponseBuilder(this)
            };

            this.on(eventName, handlerObject[eventNames[i]].bind(handlerContext));
        }
    }
}

function isObject(obj) {
    return (!!obj) && (obj.constructor === Object);
}

function IsOverridden(name) {
    return this.listenerCount(name) > 1;
}

function createStateHandler(state, obj){
    if(!obj) {
        obj = {};
    }

    Object.defineProperty(obj, _StateString, {
        value: state || ''
    });

    return obj;
}

function EmitWithState() {
    if(arguments.length === 0) {
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

process.on('uncaughtException', function(err) {
    console.log(`Uncaught exception: ${err}\n${err.stack}`);
    throw err;
});

module.exports.LambdaHandler = alexaRequestHandler;
module.exports.CreateStateHandler = createStateHandler;
module.exports.StateString = _StateString;
