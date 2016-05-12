'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
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
    handler._event = event;
    handler._context = context;

    handler.setMaxListeners(Infinity);
    handler.setAppId = SetAppId;
    handler.registerHandlers = RegisterHandlers;
    handler.registerHandlers(responseHandlers);

    handler.execute = function() {
        HandleLambdaEvent.apply(handler);
    };

    return handler;
}

function HandleLambdaEvent() {
    var event = this._event;
    var context = this._context;
    var handlerAppId = this._appId;
    var requestAppId = event.session['application']['applicationId'];

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

        if(event.request.type === 'IntentRequest') {
            eventString = event.request.intent.name;
        }

        var state = this._event.session.attributes[_StateString];

        if(state) {
            eventString += state;
        }

        if (event.session['new']) {
            return this.emit(':NewSession');
        }

        if(this.listenerCount(eventString) < 1){
          this.emit('Unhandled' + state);
        } else {
            this.emit(eventString);
        }

    } catch (e) {
        console.log(`Unexpected exception '${e}':\n${e.stack}`);
        context.fail(e);
    }
}

function RegisterHandlers() {
    for(var arg = 0; arg < arguments.length; arg++) {
        var handlerObject = arguments[arg];

        if(!isObject(handlerObject)){
            throw `Argument #${arg} was not an Object`;
        }

        var eventNames = Object.keys(handlerObject);

        for(var i = 0; i < eventNames.length; i++) {
            if(typeof(handlerObject[eventNames[i]]) !== 'function') {
                throw `Event handler for '${eventNames[i]}' was not a function`;
            }

            var eventName = eventNames[i];

            if(handlerObject[_StateString]){
                eventName += handlerObject[_StateString];
            }

            var handlerContext = {
                on: this.on.bind(this),
                emit: this.emit.bind(this),
                handler: this,
                event: this._event,
                attributes: this._event.session.attributes,
                context: this._context,
                getSSMLResponse: getSSMLResponse,
                name: eventName,
                isOverridden:  IsOverridden.bind(this, eventName)
            };

            this.on(eventName, handlerObject[eventNames[i]].bind(handlerContext));
        }
    }
}

function SetAppId(appId){
    this._appId = appId;
}

function isObject(obj) {
    return (!!obj) && (obj.constructor === Object);
}

function IsOverridden(name) {
    return this.listenerCount(name) > 1;
}

function getSSMLResponse(message) {
    return {
        type: 'SSML',
        speech: `<speak> ${message} </speak>`
    };
}

function createStateHandler(state, obj){
    if(!obj) {
        obj = {};
    }

    Object.defineProperty(obj, _StateString, {
        value: state ? state : ''
    });

    return obj;
}

module.exports.LambdaHandler = alexaRequestHandler;
module.exports.CreateStateHandler = createStateHandler;
module.exports.StateString = _StateString;
