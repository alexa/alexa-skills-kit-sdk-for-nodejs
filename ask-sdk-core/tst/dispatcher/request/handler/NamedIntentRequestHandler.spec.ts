/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

'use strict';

import {Response} from 'ask-sdk-model';
import {expect} from 'chai';
import {AttributesManagerFactory} from '../../../../lib/attributes/AttributesManagerFactory';
import {HandlerInput} from '../../../../lib/dispatcher/request/handler/HandlerInput';
import {NamedIntentRequestHandler} from '../../../../lib/dispatcher/request/handler/NamedIntentRequestHandler';
import {ResponseFactory} from '../../../../lib/response/ResponseFactory';
import {JsonProvider} from '../../../mocks/JsonProvider';

describe('NamedIntentRequestHandler', () => {

    class LaunchRequestHandler extends NamedIntentRequestHandler {
        constructor() {
            super('LaunchRequest');
        }

        public handle(handlerInput : HandlerInput) : Promise<Response> | Response {
            return null;
        }
    }

    class SomeIntentRequestHandler extends NamedIntentRequestHandler {
        constructor() {
            super('SomeIntent', 'FoobarIntent');
        }

        public handle(handlerInput : HandlerInput) : Promise<Response> | Response {
            return null;
        }
    }

    it('should return correct canHandle value for launchHandler on LaunchRequest', () => {
        const launchHandler = new LaunchRequestHandler();
        const handlerInput : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };

        expect(launchHandler.canHandle(handlerInput)).equal(true);
    });

    const intentHandler = new SomeIntentRequestHandler();

    it('should return correct canHandle value for intentHandler on LaunchRequest', () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        expect(intentHandler.canHandle(input)).equal(false);
    });

    it('should return correct canHandle value for intentHandler on SomeIntent', () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'IntentRequest',
            requestId: null,
            timestamp: null,
            locale: null,
            dialogState: null,
            intent: JsonProvider.intent(),
        };
        input.requestEnvelope.request.intent.name = 'SomeIntent';
        expect(intentHandler.canHandle(input)).equal(true);
    });

    it('should return correct canHandle value for intentHandler on FoobarIntent', () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'IntentRequest',
            requestId: null,
            timestamp: null,
            locale: null,
            dialogState: null,
            intent: JsonProvider.intent(),
        };
        input.requestEnvelope.request.intent.name = 'FoobarIntent';
        expect(intentHandler.canHandle(input)).equal(true);
    });

    it('should return correct canHandle value for intentHandler on OtherIntent', () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'IntentRequest',
            requestId: null,
            timestamp: null,
            locale: null,
            dialogState: null,
            intent: JsonProvider.intent(),
        };
        input.requestEnvelope.request.intent.name = 'OtherIntent';
        expect(intentHandler.canHandle(input)).equal(false);
    });

});
