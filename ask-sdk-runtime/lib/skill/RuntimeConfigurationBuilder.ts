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

import { ErrorHandler } from '../dispatcher/error/handler/ErrorHandler';
import { GenericErrorMapper } from '../dispatcher/error/mapper/GenericErrorMapper';
import { GenericHandlerAdapter } from '../dispatcher/request/handler/GenericHandlerAdapter';
import { GenericRequestHandlerChain } from '../dispatcher/request/handler/GenericRequestHandlerChain';
import { RequestHandler } from '../dispatcher/request/handler/RequestHandler';
import { RequestInterceptor } from '../dispatcher/request/interceptor/RequestInterceptor';
import { ResponseInterceptor } from '../dispatcher/request/interceptor/ResponseInterceptor';
import { GenericRequestMapper } from '../dispatcher/request/mapper/GenericRequestMapper';
import { createAskSdkError } from '../util/AskSdkUtils';
import { RuntimeConfiguration } from './RuntimeConfiguration';

export class RuntimeConfigurationBuilder<Input, Output> {
    protected readonly requestHandlerChains : Array<GenericRequestHandlerChain<Input, Output>> = [];
    protected readonly requestInterceptors : Array<RequestInterceptor<Input>> = [];
    protected readonly responseInterceptors : Array<ResponseInterceptor<Input, Output>> = [];
    protected readonly errorHandlers : Array<ErrorHandler<Input, Output>> = [];

    public addRequestHandler(
        matcher : (input : Input) => Promise<boolean> | boolean,
        executor : (input : Input) => Promise<Output> | Output,
    ) : this {
        if (typeof matcher !== 'function' || typeof executor !== 'function') {
            throw createAskSdkError(
                this.constructor.name,
                `Incompatible matcher type: ${typeof matcher}`);
        }

        this.requestHandlerChains.push(new GenericRequestHandlerChain<Input, Output>({
            requestHandler : {
                canHandle : matcher,
                handle : executor,
            },
        }));

        return this;
    }

    public addRequestHandlers(...requestHandlers : Array<RequestHandler<Input, Output>>) : this {
        for ( const requestHandler of requestHandlers ) {
            this.requestHandlerChains.push(new GenericRequestHandlerChain<Input, Output>({
                requestHandler,
            }));
        }

        return this;
    }

    public addRequestInterceptors(...executors : Array<RequestInterceptor<Input> | ((input : Input) => Promise<void> | void)>) : this {
        for ( const executor of executors ) {
            switch (typeof executor) {
                case 'object' : {
                    this.requestInterceptors.push(executor as RequestInterceptor<Input>);
                    break;
                }
                case 'function' : {
                    this.requestInterceptors.push({
                        process : executor as ((input : Input) => Promise<void | void>),
                    });
                    break;
                }
                default : {
                    throw createAskSdkError(
                        this.constructor.name,
                        `Incompatible executor type: ${typeof executor}`);
                }
            }
        }

        return this;
    }

    public addResponseInterceptors(...executors : Array<ResponseInterceptor<Input, Output> | ((input : Input, response? : Output) => Promise<void> | void)>) : this {
        for ( const executor of executors ) {
            switch (typeof executor) {
                case 'object' : {
                    this.responseInterceptors.push(executor as ResponseInterceptor<Input, Output>);
                    break;
                }
                case 'function' : {
                    this.responseInterceptors.push({
                        process : executor as ((input : Input, response? : Output) => Promise<void> | void),
                    });
                    break;
                }
                default : {
                    throw createAskSdkError(
                        'SkillBuilderError',
                        `Incompatible executor type: ${typeof executor}`);
                }
            }
        }

        return this;
    }

    public addErrorHandler(
        matcher : (input : Input, error : Error) => Promise<boolean> | boolean,
        executor : (input : Input, error : Error) => Promise<Output> | Output,
    ) : this {

        this.errorHandlers.push({
            canHandle : matcher,
            handle : executor,
        });

        return this;
    }

    public addErrorHandlers(...errorHandlers : Array<ErrorHandler<Input, Output>>) : this {
        this.errorHandlers.push(...errorHandlers);

        return this;
    }

    public getRuntimeConfiguration() : RuntimeConfiguration<Input, Output> {
        const requestMapper = new GenericRequestMapper<Input, Output>({
            requestHandlerChains : this.requestHandlerChains,
        });

        const errorMapper = this.errorHandlers.length
                            ? new GenericErrorMapper<Input, Output>({
                errorHandlers : this.errorHandlers,
            })
                            : undefined;

        return {
            requestMappers : [requestMapper],
            handlerAdapters : [new GenericHandlerAdapter<Input, Output>()],
            errorMapper,
            requestInterceptors : this.requestInterceptors,
            responseInterceptors : this.responseInterceptors,
        };
    }
}
