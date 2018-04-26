/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

'use strict';

import {Response} from 'ask-sdk-model';
import {expect} from 'chai';
import {AttributesManagerFactory} from '../../../../lib/attributes/AttributesManagerFactory';
import {AudioPlayerRequestHandler} from '../../../../lib/dispatcher/request/handler/AudioPlayerRequestHandler';
import {HandlerInput} from '../../../../lib/dispatcher/request/handler/HandlerInput';
import {ResponseFactory} from '../../../../lib/response/ResponseFactory';
import {JsonProvider} from '../../../mocks/JsonProvider';

describe('AudioPlayerRequestHandler', () => {

    class TestHandler extends AudioPlayerRequestHandler {

        public handlePlaybackFailed(handlerInput : HandlerInput) : Promise<Response> | Response {
            return handlerInput.responseBuilder.speak('Failed').getResponse();
        }

        public handlePlaybackFinished(handlerInput : HandlerInput) : Promise<Response> | Response {
            return handlerInput.responseBuilder.speak('Finished').getResponse();
        }

        public handlePlaybackNearlyFinished(handlerInput : HandlerInput) : Promise<Response> | Response {
            return handlerInput.responseBuilder.speak('NearlyFinished').getResponse();
        }

        public handlePlaybackStarted(handlerInput : HandlerInput) : Promise<Response> | Response {
            return handlerInput.responseBuilder.speak('Started').getResponse();
        }

        public handlePlaybackStopped(handlerInput : HandlerInput) : Promise<Response> | Response {
            return handlerInput.responseBuilder.speak('Stopped').getResponse();
        }

    }

    const handler = new TestHandler();

    it('should handle AudioPlayer PlaybackFailed correctly', async () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'AudioPlayer.PlaybackFailed',
            requestId: null,
            timestamp: null,
            locale: null,
        };

        const expectedResponse = {
            outputSpeech: {
                ssml: '<speak>Failed</speak>',
                type: 'SSML',
            },
        };

        expect(handler.canHandle(input)).equal(true);
        expect(await handler.handle(input)).to.deep.equal(expectedResponse);
    });

    it('should handle AudioPlayer PlaybackFinished correctly', async () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'AudioPlayer.PlaybackFinished',
            requestId: null,
            timestamp: null,
            locale: null,
        };

        const expectedResponse = {
            outputSpeech: {
                ssml: '<speak>Finished</speak>',
                type: 'SSML',
            },
        };

        expect(handler.canHandle(input)).equal(true);
        expect(await handler.handle(input)).to.deep.equal(expectedResponse);
    });

    it('should handle AudioPlayer PlaybackNearlyFinished correctly', async () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'AudioPlayer.PlaybackNearlyFinished',
            requestId: null,
            timestamp: null,
            locale: null,
        };

        const expectedResponse = {
            outputSpeech: {
                ssml: '<speak>NearlyFinished</speak>',
                type: 'SSML',
            },
        };

        expect(handler.canHandle(input)).equal(true);
        expect(await handler.handle(input)).to.deep.equal(expectedResponse);
    });

    it('should handle AudioPlayer PlaybackStarted correctly', async () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'AudioPlayer.PlaybackStarted',
            requestId: null,
            timestamp: null,
            locale: null,
        };

        const expectedResponse = {
            outputSpeech: {
                ssml: '<speak>Started</speak>',
                type: 'SSML',
            },
        };

        expect(handler.canHandle(input)).equal(true);
        expect(await handler.handle(input)).to.deep.equal(expectedResponse);
    });

    it('should handle AudioPlayer PlaybackStopped correctly', async () => {
        const input : HandlerInput = {
            requestEnvelope: JsonProvider.requestEnvelope(),
            attributesManager: AttributesManagerFactory.init({
                requestEnvelope: JsonProvider.requestEnvelope(),
            }),
            responseBuilder: ResponseFactory.init(),
        };
        input.requestEnvelope.request = {
            type: 'AudioPlayer.PlaybackStopped',
            requestId: null,
            timestamp: null,
            locale: null,
        };

        const expectedResponse = {
            outputSpeech: {
                ssml: '<speak>Stopped</speak>',
                type: 'SSML',
            },
        };

        expect(handler.canHandle(input)).equal(true);
        expect(await handler.handle(input)).to.deep.equal(expectedResponse);
    });

});
