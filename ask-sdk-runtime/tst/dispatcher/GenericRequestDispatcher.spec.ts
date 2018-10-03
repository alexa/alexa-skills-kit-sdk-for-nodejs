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

import { expect } from 'chai';
import * as sinon from 'sinon';
import { GenericErrorMapper } from '../../lib/dispatcher/error/mapper/GenericErrorMapper';
import { GenericRequestDispatcher } from '../../lib/dispatcher/GenericRequestDispatcher';
import { GenericHandlerAdapter } from '../../lib/dispatcher/request/handler/GenericHandlerAdapter';
import { GenericRequestHandlerChain } from '../../lib/dispatcher/request/handler/GenericRequestHandlerChain';
import { RequestHandler } from '../../lib/dispatcher/request/handler/RequestHandler';
import { GenericRequestMapper } from '../../lib/dispatcher/request/mapper/GenericRequestMapper';
import { MockAlwaysFalseErrorHandler } from '../mocks/error/MockAlwaysFalseErrorHandler';
import { MockAlwaysTrueErrorHandler } from '../mocks/error/MockAlwaysTrueErrorHandler';
import { MockAlwaysFalseRequestHandler } from '../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../mocks/request/MockAlwaysTrueRequestHandler';

describe('GenericRequestDispatcher', () => {
    const mockAlwaysTrueRequestHandlerChain = new GenericRequestHandlerChain<string, string>({
        requestHandler : new MockAlwaysTrueRequestHandler(),
    });
    const mockAlwaysFalseRequestHandlerChain = new GenericRequestHandlerChain<string, string>({
        requestHandler : new MockAlwaysFalseRequestHandler(),
    });

    it('should be able to send input to correct request handler', async() => {
        const dispatcher = new GenericRequestDispatcher<string, string>({
            requestMappers : [
                new GenericRequestMapper<string, string>({
                    requestHandlerChains : [
                        mockAlwaysTrueRequestHandlerChain,
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            handlerAdapters : [new GenericHandlerAdapter<string, string>()],
        });

        const response = await dispatcher.dispatch('Test Request');

        expect(response).eq('Input(Test Request) received at MockAlwaysTrueRequestHandler');
    });

    it('should be able to send input to interceptors and handler in correct order', async() => {
        function interceptor(input : string) : Promise<void> {
            return;
        }

        function matcher(input : string) : boolean {
            return true;
        }

        function executor(input : string) : string {
            return '';
        }

        const firstGlobalRequestInterceptor = sinon.spy(interceptor);
        const secondGlobalRequestInterceptor = sinon.spy(interceptor);
        const firstLocalRequestInterceptor = sinon.spy(interceptor);
        const secondLocalRequestInterceptor = sinon.spy(interceptor);
        const firstLocalResponseInterceptor = sinon.spy(interceptor);
        const secondLocalResponseInterceptor = sinon.spy(interceptor);
        const firstGlobalResponseInterceptor = sinon.spy(interceptor);
        const secondGlobalResponseInterceptor = sinon.spy(interceptor);
        const handlerMatcher = sinon.spy(matcher);
        const handlerExecutor = sinon.spy(executor);

        const dispatcher = new GenericRequestDispatcher<string, string>({
            requestMappers : [
                new GenericRequestMapper<string, string>({
                    requestHandlerChains : [
                        new GenericRequestHandlerChain<string, string>({
                            requestHandler : {
                                canHandle : handlerMatcher,
                                handle : handlerExecutor,
                            },
                            requestInterceptors : [
                                {
                                    process : firstLocalRequestInterceptor,
                                },
                                {
                                    process : secondLocalRequestInterceptor,
                                },
                            ],
                            responseInterceptors : [
                                {
                                    process : firstLocalResponseInterceptor,
                                },
                                {
                                    process : secondLocalResponseInterceptor,
                                },
                            ],
                        }),
                    ],
                }),
            ],
            handlerAdapters : [new GenericHandlerAdapter<string, string>()],
            requestInterceptors : [
                {
                    process : firstGlobalRequestInterceptor,
                },
                {
                    process : secondGlobalRequestInterceptor,
                },
            ],
            responseInterceptors : [
                {
                    process : firstGlobalResponseInterceptor,
                },
                {
                    process : secondGlobalResponseInterceptor,
                },
            ],
        });

        await dispatcher.dispatch('Test Request');

        sinon.assert.callOrder(
            firstGlobalRequestInterceptor,
            secondGlobalRequestInterceptor,
            handlerMatcher,
            firstLocalRequestInterceptor,
            secondLocalRequestInterceptor,
            handlerExecutor,
            firstLocalResponseInterceptor,
            secondLocalResponseInterceptor,
            firstGlobalResponseInterceptor,
            secondGlobalResponseInterceptor,
        );
    });

    it('should be able to send input and error to correct error handler', async () => {
        const dispatcher = new GenericRequestDispatcher<string, string>({
            requestMappers : [
                new GenericRequestMapper<string, string>({
                    requestHandlerChains : [
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            errorMapper : new GenericErrorMapper<string, string>({
                errorHandlers : [
                    new MockAlwaysFalseErrorHandler(),
                    new MockAlwaysTrueErrorHandler(),
                ],
            }),
            handlerAdapters : [ new GenericHandlerAdapter<string, string>()],
        });

        const response = await dispatcher.dispatch('Test Request');

        expect(response).eq('AskSdk.GenericRequestDispatcher Error received at MockAlwaysTrueErrorHandler');
    });

    it('should throw an error if no request handler chain is found to handle the input', async() => {
        const dispatcher = new GenericRequestDispatcher<string, string>({
            requestMappers : [
                new GenericRequestMapper<string, string>({
                    requestHandlerChains : [
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            handlerAdapters : [new GenericHandlerAdapter<string, string>()],
        });

        try {
            await dispatcher.dispatch('Test Request');
        } catch (err) {
            expect(err.name).equal('AskSdk.GenericRequestDispatcher Error');
            expect(err.message).equal('Unable to find a suitable request handler.');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should thrown an error if no handler adapter is found to support the handler', async () => {
        const dispatcher = new GenericRequestDispatcher<string, string>({
            requestMappers : [
                new GenericRequestMapper<string, string>({
                    requestHandlerChains : [
                        mockAlwaysTrueRequestHandlerChain,
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            handlerAdapters : [{
                supports(input : string) : boolean {
                    return false;
                },
                execute(input : string, handler : RequestHandler<string, string>) : string {
                    return '';
                },
            }],
        });

        try {
            await dispatcher.dispatch('Test Request');
        } catch (err) {
            expect(err.name).equal('AskSdk.GenericRequestDispatcher Error');
            expect(err.message).equal('Unable to find a suitable handler adapter.');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should re-throw the error if no error handler is found to handle the error', async() => {
        const dispatcher = new GenericRequestDispatcher<string, string>({
            requestMappers : [
                new GenericRequestMapper<string, string>({
                    requestHandlerChains : [
                        mockAlwaysFalseRequestHandlerChain,
                    ],
                }),
            ],
            errorMapper : new GenericErrorMapper<string, string>({
                errorHandlers : [
                    new MockAlwaysFalseErrorHandler(),
                ],
            }),
            handlerAdapters : [new GenericHandlerAdapter<string, string>()],
        });

        try {
            await dispatcher.dispatch('Test Request');
        } catch (err) {
            expect(err.name).equal('AskSdk.GenericRequestDispatcher Error');
            expect(err.message).equal('Unable to find a suitable request handler.');

            return;
        }

        throw new Error('should have thrown an error!');
    });
});
