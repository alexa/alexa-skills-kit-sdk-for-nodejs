"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function AlexaRequestEmitter() {
    EventEmitter.call(this);
}

util.inherits(AlexaRequestEmitter, EventEmitter);

function alexaRequestHandler(appId, event, context) {
    var handler = new AlexaRequestEmitter();
    handler.setMaxListeners(Infinity);
    handler._appId = appId;
    handler._event = event;
    handler._context = context;

    handler.prototype.registerHandlers = RegisterHandlers;

    handler.on(':lambdaEvent', HandleLambdaEvent);

    return handler;
}

function HandleLambdaEvent() {
    var event = this._event;
    var context = this._context;
    var handlerAppId = this._appId;
    var requestAppId = event.session['application']['applicationId'];

    try {
        console.log('session applicationId: ' + event.session['application']['applicationId']);

        // Validate that this request originated from authorized source.
        if (handlerAppId && (requestAppId !== handlerAppId)) {
            console.log('The applicationIds don\'t match: ' + requestAppId + ' and ' + handlerAppId);
            return context.fail('Invalid ApplicationId: ' + requestAppId);
        }

        if (event.session['new']) {
            this.emit(':NewSession');
        } else {
            this.emit(':' + event.request.type);
        }
    } catch (e) {
        console.log(util.format('Unexpected exception \'%s\':\n%s', e, e.stack));
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
            var handlerFunction = {
                name: eventNames[i]
            };

            var func = handlerObject[eventNames[i]];

            if(typeof(func) !== 'function') {
                throw `Event handler for "${eventNames[i]}" was not a function`;
            }

            this.on(eventNames[i], func.bind(handlerFunction));
        }
    }
}

function isObject(obj) {
    return (!!obj) && (obj.constructor === Object);
}

module.exports = alexaRequestHandler;