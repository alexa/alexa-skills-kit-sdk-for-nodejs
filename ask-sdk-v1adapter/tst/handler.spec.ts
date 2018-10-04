/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { AttributesManagerFactory, HandlerInput, ResponseFactory } from 'ask-sdk';
import { ResponseEnvelope, ui } from 'ask-sdk-model';
import { expect } from 'chai';
import { Adapter } from '../lib/adapter';
import { Handler } from '../lib/handler';
import { ResponseBuilder } from '../lib/responseBuilderShim';
import { MockPersistenceAdapter } from './mock/mockPersistenceAdapter';
import {
    DisplayElementSelectedRequest,
    LaunchRequest,
    RecipeIntentRequest,
} from './mock/mockSampleRequest';

const mockContext = {
    succeed : (responseEnvelope : ResponseEnvelope) => {
        // do something
    },
    fail : (error : Error) => {
        // do something
    },
};
/* tslint:disable */
describe('Handler', () => {
    it('should return true if the listenerCount of adapter is more than 1', () => {
        const handlerInput : HandlerInput = {
            requestEnvelope : LaunchRequest,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : LaunchRequest,
                persistenceAdapter : new MockPersistenceAdapter(),
            }),
            responseBuilder : ResponseFactory.init(),
        };
        const adapter = new Adapter(LaunchRequest, mockContext);
        adapter.listenerCount = (name : string) : number => {
            return 1;
        };
        const testHandler = new Handler(adapter);

        expect(testHandler.canHandle(handlerInput)).to.equal(true);
    });

    it('should return false if the listenerCount of adapter is less than 1', () => {
        const handlerInput : HandlerInput = {
            requestEnvelope : DisplayElementSelectedRequest,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : DisplayElementSelectedRequest,
                persistenceAdapter : new MockPersistenceAdapter(),
            }),
            responseBuilder : ResponseFactory.init(),
        };
        const adapter = new Adapter(LaunchRequest, mockContext);
        adapter.listenerCount = (name : string) : number => {
            return 0;
        };
        const testHandler = new Handler(adapter);

        expect(testHandler.canHandle(handlerInput)).to.equal(false);
    });

    it('should emit the handler function by target handler name', () => {
        const mockV1Handler = {
            'LaunchRequest' : function() {
                this.response.speak('in launch request');
                this.emit(':responseReady');
            },
            ':responseReady' : function() {
                this.handler.promiseResolve(this.handler.response.response);
            },
        };

        const handlerInput : HandlerInput = {
            requestEnvelope : LaunchRequest,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : LaunchRequest,
                persistenceAdapter : new MockPersistenceAdapter(),
            }),
            responseBuilder : ResponseFactory.init(),
        };
        const adapter = new Adapter(LaunchRequest, mockContext);
        adapter.state = '';
        const handlerContext = {
            on: adapter.on.bind(adapter),
            emit: adapter.emit.bind(adapter),
            handler: adapter,
            event: adapter._event,
            context: adapter._context,
            callback : adapter._callback,
            response: new ResponseBuilder(adapter),
            handlerInput,
        };
        adapter.on('LaunchRequest', mockV1Handler['LaunchRequest'].bind(handlerContext));
        adapter.on(':responseReady', mockV1Handler[':responseReady'].bind(handlerContext));
        const testHandler = new Handler(adapter);

        const canHandle = testHandler.canHandle(handlerInput);

        testHandler.handle(handlerInput).then((response) => {
            expect(response.outputSpeech.type).to.equal('SSML');
            expect((<ui.SsmlOutputSpeech> response.outputSpeech).ssml).to.equal('<speak>in launch request</speak>');
        });
    });

    it('should emit the Unhandled function if target handler name does not exist ', () => {
        const mockV1Handler = {
            'Unhandled' : function() {
                this.response.speak('in Unhandled function');
                this.emit(':responseReady');
            },
            ':responseReady' : function() {
                this.handler.promiseResolve(this.handler.response.response);
            },
        };

        const handlerInput : HandlerInput = {
            requestEnvelope : LaunchRequest,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : LaunchRequest,
                persistenceAdapter : new MockPersistenceAdapter(),
            }),
            responseBuilder : ResponseFactory.init(),
        };
        const adapter = new Adapter(LaunchRequest, mockContext);
        adapter.state = '';
        const handlerContext = {
            on: adapter.on.bind(adapter),
            emit: adapter.emit.bind(adapter),
            handler: adapter,
            event: adapter._event,
            context: adapter._context,
            callback : adapter._callback,
            response: new ResponseBuilder(adapter),
            handlerInput,
        };
        adapter.on('Unhandled', mockV1Handler['Unhandled'].bind(handlerContext));
        adapter.on(':responseReady', mockV1Handler[':responseReady'].bind(handlerContext));
        const testHandler = new Handler(adapter);

        const canHandle = testHandler.canHandle(handlerInput);
        testHandler.handle(handlerInput).then((response) => {
            expect(response.outputSpeech.type).to.equal('SSML');
            expect((<ui.SsmlOutputSpeech> response.outputSpeech).ssml).to.equal('<speak>in Unhandled function</speak>');
        });
    });

    it('should forward to the right handler function return a response', () => {
        const mockV1Handler = {
            RecipeIntent : function () {
                this.emit('HelpIntent');
            },
            HelpIntent : function() {
                this.response.speak('in help intent');
                this.emit(':responseReady');
            },
            ':responseReady' : function() {
                this.handler.promiseResolve(this.handler.response.response);
            },
        };

        const handlerInput : HandlerInput = {
            requestEnvelope : RecipeIntentRequest,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : RecipeIntentRequest,
                persistenceAdapter : new MockPersistenceAdapter(),
            }),
            responseBuilder : ResponseFactory.init(),
        };
        const adapter = new Adapter(RecipeIntentRequest, mockContext);
        adapter.state = '';
        const handlerContext = {
            on: adapter.on.bind(adapter),
            emit: adapter.emit.bind(adapter),
            handler: adapter,
            event: adapter._event,
            context: adapter._context,
            callback : adapter._callback,
            response: new ResponseBuilder(adapter),
            handlerInput,
        };
        adapter.on('RecipeIntent', mockV1Handler['RecipeIntent'].bind(handlerContext));
        adapter.on('HelpIntent', mockV1Handler['HelpIntent'].bind(handlerContext));
        adapter.on(':responseReady', mockV1Handler[':responseReady'].bind(handlerContext));
        const testHandler = new Handler(adapter);

        const canHandle = testHandler.canHandle(handlerInput);
        testHandler.handle(handlerInput).then((response) => {
            expect(response.outputSpeech.type).to.equal('SSML');
            expect((<ui.SsmlOutputSpeech> response.outputSpeech).ssml).to.equal('<speak>in help intent</speak>');
        });
    });

    it('should set session attributes if it is in session request', () => {
        const mockV1Handler = {
            LaunchRequest : function () {
                this.handler.state = 'mock state';
                this.attributes.mockAttribute = 'mock attribute';
                this.emit(':responseReady');
            },
            ':responseReady' : function () {
                if (this.handler.state) {
                    this.attributes.state = this.handler.state;
                }
                if (this.event.session) {
                    this.handlerInput.attributesManager.setSessionAttributes(this.attributes);
                }
                this.handler.promiseResolve(this.handler.response.response);
            }
        };
        const handlerInput : HandlerInput = {
            requestEnvelope : LaunchRequest,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : LaunchRequest,
                persistenceAdapter : new MockPersistenceAdapter(),
            }),
            responseBuilder : ResponseFactory.init(),
        };
        const adapter = new Adapter(LaunchRequest, mockContext);
        adapter.state = '';
        const handlerContext = {
            attributes : {},
            on: adapter.on.bind(adapter),
            emit: adapter.emit.bind(adapter),
            handler: adapter,
            event: adapter._event,
            context: adapter._context,
            callback : adapter._callback,
            response: new ResponseBuilder(adapter),
            handlerInput,
        };
        adapter.on('LaunchRequest', mockV1Handler['LaunchRequest'].bind(handlerContext));
        adapter.on(':responseReady', mockV1Handler[':responseReady'].bind(handlerContext));
        const testHandler = new Handler(adapter);

        const canHandle = testHandler.canHandle(handlerInput);
        testHandler.handle(handlerInput).then((response) => {
            expect(handlerInput.attributesManager.getSessionAttributes()).to.deep.equal({state : 'mock state', mockAttribute: 'mock attribute'});
        });
    });

});
