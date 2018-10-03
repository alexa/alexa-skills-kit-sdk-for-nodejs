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
import { RuntimeConfigurationBuilder } from '../../lib/skill/RuntimeConfigurationBuilder';
import { MockAlwaysFalseErrorHandler } from '../mocks/error/MockAlwaysFalseErrorHandler';
import { MockAlwaysTrueErrorHandler } from '../mocks/error/MockAlwaysTrueErrorHandler';
import { MockAlwaysFalseRequestHandler } from '../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../mocks/request/MockAlwaysTrueRequestHandler';

describe('RuntimeConfigurationBuilder', () => {
    it('should be able to add single request handler using matcher and executor', async() => {
        const runtimeConfiguration = new RuntimeConfigurationBuilder<string, string>()
            .addRequestHandler(
                (input : string) => {
                    return input === 'Test Request';
                },
                (input : string) => {
                    return 'Event received';
                },
            )
            .getRuntimeConfiguration();

        const requestMapper = runtimeConfiguration.requestMappers[0];
        const requestHandlerChain = await requestMapper.getRequestHandlerChain('Test Request');
        const requestHandler = requestHandlerChain.getRequestHandler();

        expect(requestHandler.handle()).eq('Event received');
    });

    it('should throw an error if request handler matcher is invalid', () => {
        try {
            new RuntimeConfigurationBuilder<string, string>()
                .addRequestHandler(
                    true as any,
                    false as any,
                )
                .getRuntimeConfiguration();
        } catch (error) {
            expect(error.message).eq('Incompatible matcher type: boolean');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to add multiple request handlers', async() => {
        const runtimeConfiguration = new RuntimeConfigurationBuilder<string, string>()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .getRuntimeConfiguration();

        const requestMapper = runtimeConfiguration.requestMappers[0];
        const requestHandlerChain = await requestMapper.getRequestHandlerChain('Test Request');
        const requestHandler = requestHandlerChain.getRequestHandler();

        expect(requestHandler.handle('Test request')).eq('Input(Test request) received at MockAlwaysTrueRequestHandler');
    });

    it('should be able to add multiple global request interceptors with either object or function', async() => {
        const runtimeConfiguration = new RuntimeConfigurationBuilder<string, string>()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .addRequestInterceptors(
                {
                    process(input : string) : void {
                        expect(input).eq('Test Request?');
                    },
                },
                (input : string) : void => {
                    expect(input).eq('Test Request');
                },
            )
            .getRuntimeConfiguration();

        const requestMapper = runtimeConfiguration.requestMappers[0];
        const requestHandlerChain = await requestMapper.getRequestHandlerChain('Test Request');
        const requestHandler = requestHandlerChain.getRequestHandler();

        expect(requestHandler.handle('Test request')).eq('Input(Test request) received at MockAlwaysTrueRequestHandler');
        expect(runtimeConfiguration.requestInterceptors.length).eq(2);
    });

    it('should thrown an error if request interceptor is invalid', () => {
        try {
            new RuntimeConfigurationBuilder<string, string>()
                .addRequestHandlers(
                    new MockAlwaysTrueRequestHandler(),
                )
                .addRequestInterceptors(
                    true as any,
                )
                .getRuntimeConfiguration();
        } catch (error) {
            expect(error.message).eq('Incompatible executor type: boolean');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to add multiple global response interceptors with either object or function', async() => {
        const runtimeConfiguration = new RuntimeConfigurationBuilder<string, string>()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .addResponseInterceptors(
                {
                    process(input : string, output : string) : void {
                        expect(input).eq('Test Request?');
                    },
                },
                (input : string, output : string) : void => {
                    expect(input).eq('Test Request');
                },
            )
            .getRuntimeConfiguration();

        const requestMapper = runtimeConfiguration.requestMappers[0];
        const requestHandlerChain = await requestMapper.getRequestHandlerChain('Test Request');
        const requestHandler = requestHandlerChain.getRequestHandler();

        expect(requestHandler.handle('Test request')).eq('Input(Test request) received at MockAlwaysTrueRequestHandler');
        expect(runtimeConfiguration.responseInterceptors.length).eq(2);
    });

    it('should thrown an error if response interceptor is invalid', () => {
        try {
            new RuntimeConfigurationBuilder<string, string>()
                .addRequestHandlers(
                    new MockAlwaysTrueRequestHandler(),
                )
                .addResponseInterceptors(
                    true as any,
                )
                .getRuntimeConfiguration();
        } catch (error) {
            expect(error.message).eq('Incompatible executor type: boolean');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to add single error handler using matcher and executor', async() => {
        const runtimeConfiguration = new RuntimeConfigurationBuilder<string, string>()
            .addErrorHandler(
                (input : string, error : Error) => {
                    return input === 'Test Request' && error.message === 'Test Error';
                },
                (input : string, error : Error) => {
                    return 'Error received';
                },
            )
            .getRuntimeConfiguration();

        const errorHandler = await runtimeConfiguration.errorMapper.getErrorHandler('Test Request', new Error('Test Error'));

        expect(errorHandler.handle(null, null)).eq('Error received');
    });

    it('should be able to add multiple error handlers', async() => {
        const runtimeConfiguration = new RuntimeConfigurationBuilder<string, string>()
            .addErrorHandlers(
                new MockAlwaysTrueErrorHandler(),
                new MockAlwaysFalseErrorHandler(),
            )
            .getRuntimeConfiguration();

        const errorHandler = await runtimeConfiguration.errorMapper.getErrorHandler('Test Request', new Error('Test Error'));

        expect(errorHandler.handle('Test Request', new Error('Test Error'))).eq('Error received at MockAlwaysTrueErrorHandler');
    });
});
