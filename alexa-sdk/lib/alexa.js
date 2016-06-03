'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var attributesHelper = require('./DynamoAttributesHelper');
var responseHandlers = require('./response');
var _StateString = 'STATESTRING';

function AlexaRequestEmitter() {
    EventEmitter.call(this);
}

util.inherits(AlexaRequestEmitter, EventEmitter);

function alexaRequestHandler(event, context, callback) {
    if(!event.session['attributes']) {
        event.session['attributes'] = {};
    }

    var handler = new AlexaRequestEmitter();
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
        writable: true
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

    Object.defineProperty(handler, 'persistSessionAttributes', {
        value: false,
        writable: true
    });

    Object.defineProperty(handler, 'saveBeforeResponse', {
        value: false,
        writable: true
    });

    Object.defineProperty(handler, 'registerHandlers', {
        value: RegisterHandlers,
        writable: false
    });

    Object.defineProperty(handler, 'execute', {
        value: function() {
            HandleLambdaEvent.apply(handler);
        },
        writable: false
    });

    handler.registerHandlers(responseHandlers);

    return handler;
}

function HandleLambdaEvent() {
    var event = this._event;
    var context = this._context;
    var handlerAppId = this._appId;
    var requestAppId = event.session.application.applicationId;

    if(!handlerAppId){
        console.log('Warning: Application ID is not set');
    }

    try {
        // Validate that this request originated from authorized source.
        if (handlerAppId && (requestAppId !== handlerAppId)) {
            console.log(`The applicationIds don\'t match: ${requestAppId} and ${handlerAppId}`);
            return context.fail('Invalid ApplicationId: ' + handlerAppId);
        }

        var eventString = '';

        if (event.session['new']) {
            eventString = 'NewSession';
        } else if(event.request.type === 'IntentRequest') {
            eventString = event.request.intent.name;
        } else if (event.request.type === 'SessionEndedRequest'){
            eventString = 'SessionEndedRequest';
        }

        eventString += this.state || '';

        if(this.persistSessionAttributes && event.session['new']) {
            attributesHelper.get.call(this, this.event.session.user.userId, function(err, data) {
                if(err) {
                    return context.fail('Error fetching user state: ' + err);
                }

                event.session.attributes = data;
                EmitEvent.call(this, eventString);
            });
        } else {
            EmitEvent.call(this, eventString);
        }
    } catch (e) {
        console.log(`Unexpected exception '${e}':\n${e.stack}`);
        context.fail(e);
    }
}

function EmitEvent(eventString) {
    if(this.listenerCount(eventString) < 1){
        this.emit('Unhandled' + this.state || '');
    } else {
        this.emit(eventString);
    }
}

function RegisterHandlers() {
    for(var arg = 0; arg < arguments.length; arg++) {
        var handlerObject = arguments[arg];

        if(!isObject(handlerObject)) {
            throw `Argument #${arg} was not an Object`;
        }

        var eventNames = Object.keys(handlerObject);

        for(var i = 0; i < eventNames.length; i++) {
            if(typeof(handlerObject[eventNames[i]]) !== 'function') {
                throw `Event handler for '${eventNames[i]}' was not a function`;
            }

            var eventName = eventNames[i];

            if(handlerObject[_StateString]) {
                eventName += handlerObject[_StateString];
            }

            var handlerContext = {
                on: this.on.bind(this),
                emit: this.emit.bind(this),
                handler: this,
                event: this._event,
                attributes: this._event.session.attributes,
                context: this._context,
                name: eventName,
                isOverridden:  IsOverridden.bind(this, eventName)
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

process.on('uncaughtException', function(err) {
    console.log(`Uncaught exception: ${err}\n${err.stack}`);
    throw err;
});

module.exports.LambdaHandler = alexaRequestHandler;
module.exports.CreateStateHandler = createStateHandler;
module.exports.StateString = _StateString;