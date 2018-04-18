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

'use strict';

import { ui } from 'ask-sdk-model';
import { expect } from 'chai';
import { AttributesManagerFactory } from '../../lib/attributes/AttributesManagerFactory';
import { DefaultRequestDispatcher } from '../../lib/dispatcher/DefaultRequestDispatcher';
import { DefaultErrorMapper } from '../../lib/dispatcher/error/DefaultErrorMapper';
import { DefaultHandlerAdapter } from '../../lib/dispatcher/request/handler/DefaultHandlerAdapter';
import { DefaultRequestHandlerChain } from '../../lib/dispatcher/request/handler/DefaultRequestHandlerChain';
import { HandlerInput } from '../../lib/dispatcher/request/handler/HandlerInput';
import { DefaultRequestMapper } from '../../lib/dispatcher/request/mapper/DefaultRequestMapper';
import { ResponseFactory } from '../../lib/response/ResponseFactory';
import { MockAlwaysFalseHandlerAdapter } from '../mocks/adapter/MockAlwaysFalseHandlerAdapter';
import { MockAlwaysFalseErrorHandler } from '../mocks/error/MockAlwaysFalseErrorHandler';
import { MockAlwaysTrueErrorHandler } from '../mocks/error/MockAlwaysTrueErrorHandler';
import { MockPersistentAttributesRequestInterceptor } from '../mocks/interceptor/MockPersistentAttributesRequestInterceptor';
import { MockPersistentAttributesResponseInterceptor } from '../mocks/interceptor/MockPersistentAttributesResponseInterceptor';
import { MockSessionAttributesRequestInterceptor } from '../mocks/interceptor/MockSessionAttributesRequestInterceptor';
import { MockSessionAttributesResponseInterceptor } from '../mocks/interceptor/MockSessionAttributesResponseInterceptor';
import { JsonProvider } from '../mocks/JsonProvider';
import { MockPersistenceAdapter } from '../mocks/persistence/MockPersistenceAdapter';
import { MockAlwaysFalseRequestHandler } from '../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../mocks/request/MockAlwaysTrueRequestHandler';
import SsmlOutputSpeech = ui.SsmlOutputSpeech;

describe('DefaultRequestDispatcher', () => {
    let mockAlwaysTrueRequestHandlerChain : DefaultRequestHandlerChain;
    let mockAlwaysFalseRequestHandlerChain : DefaultRequestHandlerChain;

    before(() => {
        mockAlwaysTrueRequestHandlerChain = new DefaultRequestHandlerChain({
            requestHandler : new MockAlwaysTrueRequestHandler(),
        });
        mockAlwaysFalseRequestHandlerChain = new DefaultRequestHandlerChain({
            requestHandler : new MockAlwaysFalseRequestHandler(),
        });
    });

    it('should be able to send HandlerInput to correct RequestHandler', async() => {
        const dispatcher = new DefaultRequestDispatcher({
            requestMappers : [
                new DefaultRequestMapper({
                    requestHandlerChains : [
                        mockAlwaysTrueRequestHandlerChain,
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            handlerAdapters : [new DefaultHandlerAdapter()],
        });

        const handlerInput : HandlerInput = {
            requestEnvelope : JsonProvider.requestEnvelope(),
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : JsonProvider.requestEnvelope(),
            }),
            responseBuilder : ResponseFactory.init(),
        };

        const response = await dispatcher.dispatch(handlerInput);

        expect((<SsmlOutputSpeech> response.outputSpeech).ssml)
            .equal('<speak>Request received at MockAlwaysTrueRequestHandler.</speak>');
    });

    it('should be able to send HandlerInput to all RequestInterceptor before sending to RequestHandler', async() => {
        const dispatcher = new DefaultRequestDispatcher({
            requestMappers : [
                new DefaultRequestMapper({
                    requestHandlerChains : [
                        new DefaultRequestHandlerChain({
                            requestHandler : new MockAlwaysTrueRequestHandler(),
                            requestInterceptors : [
                                new MockSessionAttributesRequestInterceptor(),
                                new MockPersistentAttributesRequestInterceptor(),
                            ],
                        }),
                    ],
                }),
            ],
            handlerAdapters : [new DefaultHandlerAdapter()],
        });

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        requestEnvelope.session.attributes = {};

        const mockPersistenceAdapter = new MockPersistenceAdapter();

        const handlerInput : HandlerInput = {
            requestEnvelope,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope,
                persistenceAdapter : mockPersistenceAdapter,
            }),
            responseBuilder : ResponseFactory.init(),
        };

        const response = await dispatcher.dispatch(handlerInput);

        expect(handlerInput.attributesManager.getSessionAttributes()).deep.equal({
            MockSessionAttributesRequestInterceptor : true,
            key : 'value',
        });
        expect(await mockPersistenceAdapter.getAttributes(requestEnvelope))
            .deep
            .equal({
                MockPersistentAttributesRequestInterceptor : true,
                key : 'value',
                key_1 : 'v1',
                key_2 : 'v2',
                state : 'mockState',
            });
        expect((<ui.SsmlOutputSpeech> response.outputSpeech).ssml)
            .equal('<speak>Request received at MockAlwaysTrueRequestHandler.</speak>');
    });

    it('should be able to send HandlerInput and response to all ResponseInterceptor after RequestHandler returns', async() => {
        const dispatcher = new DefaultRequestDispatcher({
            requestMappers : [
                new DefaultRequestMapper({
                    requestHandlerChains : [
                        new DefaultRequestHandlerChain({
                            requestHandler : new MockAlwaysTrueRequestHandler(),
                            responseInterceptors : [
                                new MockSessionAttributesResponseInterceptor(),
                                new MockPersistentAttributesResponseInterceptor(),
                            ],
                        }),
                    ],
                }),
            ],
            handlerAdapters : [new DefaultHandlerAdapter()],
        });

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.user.userId = 'userId';
        requestEnvelope.session.attributes = {};

        const mockPersistenceAdapter = new MockPersistenceAdapter();

        const handlerInput : HandlerInput = {
            requestEnvelope,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope,
                persistenceAdapter : mockPersistenceAdapter,
            }),
            responseBuilder : ResponseFactory.init(),
        };

        const response = await dispatcher.dispatch(handlerInput);

        expect(handlerInput.attributesManager.getSessionAttributes()).deep.equal({
            MockSessionAttributesResponseInterceptor : true,
            key : 'value',
        });
        expect(await mockPersistenceAdapter.getAttributes(requestEnvelope))
            .deep
            .equal({
                MockPersistentAttributesResponseInterceptor : true,
                key : 'value',
                key_1 : 'v1',
                key_2 : 'v2',
                state : 'mockState',
            });
        expect((<ui.SsmlOutputSpeech> response.outputSpeech).ssml)
            .equal('<speak>Request received at MockAlwaysTrueRequestHandler.</speak>');
    });

    it('should be able to send HandlerInput and error to correct ErrorHandler', async() => {
        const dispatcher = new DefaultRequestDispatcher({
            requestMappers : [
                new DefaultRequestMapper({
                    requestHandlerChains : [
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            errorMapper : new DefaultErrorMapper({
                errorHandlers : [
                    new MockAlwaysTrueErrorHandler(),
                    new MockAlwaysFalseErrorHandler(),
                ],
            }),
            handlerAdapters : [new DefaultHandlerAdapter()],
        });

        const handlerInput : HandlerInput = {
            requestEnvelope : JsonProvider.requestEnvelope(),
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : JsonProvider.requestEnvelope(),
            }),
            responseBuilder : ResponseFactory.init(),
        };

        const response = await dispatcher.dispatch(handlerInput);

        expect((<ui.SsmlOutputSpeech> response.outputSpeech).ssml)
            .equal('<speak>AskSdk.DefaultRequestDispatcher Error received at MockAlwaysTrueErrorHandler.</speak>');
    });

    it('should throw an error if no RequestHandlerChain is found to handle the input', async() => {
        const dispatcher = new DefaultRequestDispatcher({
            requestMappers : [
                new DefaultRequestMapper({
                    requestHandlerChains : [
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            handlerAdapters : [new DefaultHandlerAdapter()],
        });

        const handlerInput : HandlerInput = {
            requestEnvelope : JsonProvider.requestEnvelope(),
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : JsonProvider.requestEnvelope(),
            }),
            responseBuilder : ResponseFactory.init(),
        };

        try {
            await dispatcher.dispatch(handlerInput);
        } catch (err) {
            expect(err.name).equal('AskSdk.DefaultRequestDispatcher Error');
            expect(err.message).equal('RequestHandlerChain not found!');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should throw an error if no supported HandlerAdapter is found', async() => {
        const dispatcher = new DefaultRequestDispatcher({
            requestMappers : [
                new DefaultRequestMapper({
                    requestHandlerChains : [
                        mockAlwaysTrueRequestHandlerChain,
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            handlerAdapters : [new MockAlwaysFalseHandlerAdapter()],
        });

        const handlerInput : HandlerInput = {
            requestEnvelope : JsonProvider.requestEnvelope(),
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : JsonProvider.requestEnvelope(),
            }),
            responseBuilder : ResponseFactory.init(),
        };

        try {
            await dispatcher.dispatch(handlerInput);
        } catch (err) {
            expect(err.name).equal('AskSdk.DefaultRequestDispatcher Error');
            expect(err.message).equal('HandlerAdapter not found!');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should re-throw the error if no ErrorHandler is found to handle the error', async() => {
        const dispatcher = new DefaultRequestDispatcher({
            requestMappers : [
                new DefaultRequestMapper({
                    requestHandlerChains : [
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            errorMapper : new DefaultErrorMapper({
                errorHandlers : [
                    new MockAlwaysFalseErrorHandler(),
                ],
            }),
            handlerAdapters : [new DefaultHandlerAdapter()],
        });

        const handlerInput : HandlerInput = {
            requestEnvelope : JsonProvider.requestEnvelope(),
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope : JsonProvider.requestEnvelope(),
            }),
            responseBuilder : ResponseFactory.init(),
        };

        try {
            await dispatcher.dispatch(handlerInput);
        } catch (err) {
            expect(err.name).equal('AskSdk.DefaultRequestDispatcher Error');
            expect(err.message).equal('RequestHandlerChain not found!');

            return;
        }

        throw new Error('should have thrown an error!');
    });
});
