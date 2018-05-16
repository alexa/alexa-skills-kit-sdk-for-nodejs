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

import { Response } from 'ask-sdk-model';
import { createAskSdkError } from '../util/AskSdkUtils';
import { ErrorHandler } from './error/ErrorHandler';
import { ErrorMapper } from './error/ErrorMapper';
import { HandlerAdapter } from './request/handler/HandlerAdapter';
import { HandlerInput } from './request/handler/HandlerInput';
import { RequestHandlerChain } from './request/handler/RequestHandlerChain';
import { RequestInterceptor } from './request/interceptor/RequestInterceptor';
import { ResponseInterceptor } from './request/interceptor/ResponseInterceptor';
import { RequestMapper } from './request/mapper/RequestMapper';
import { RequestDispatcher } from './RequestDispatcher';

/**
 * Default implementation of {@link RequestDispatcher}.
 */
export class DefaultRequestDispatcher implements RequestDispatcher {
    protected requestMappers : RequestMapper[];
    protected errorMapper : ErrorMapper;
    protected handlerAdapters : HandlerAdapter[];
    protected requestInterceptors : RequestInterceptor[];
    protected responseInterceptors : ResponseInterceptor[];

    constructor(options : {
        requestMappers : RequestMapper[],
        handlerAdapters : HandlerAdapter[],
        errorMapper? : ErrorMapper,
        requestInterceptors? : RequestInterceptor[],
        responseInterceptors? : ResponseInterceptor[],
    }) {
        this.requestMappers = options.requestMappers;
        this.handlerAdapters = options.handlerAdapters;
        this.errorMapper = options.errorMapper;
        this.requestInterceptors = options.requestInterceptors;
        this.responseInterceptors = options.responseInterceptors;
    }

    /**
     * Main entry point for dispatching logic.
     * Dispatches handlerInput to requestHandlers and error, if any, to _errorHandlers
     * @param {HandlerInput} handlerInput
     * @returns {Promise<Response>}
     */
    public async dispatch(handlerInput : HandlerInput) : Promise<Response> {
        let response : Response;
        try {
            // Execute global request interceptors
            if (this.requestInterceptors) {
                for (const requestInterceptor of this.requestInterceptors) {
                    await requestInterceptor.process(handlerInput);
                }
            }

            // Dispatch request to handler chain
            response = await this.dispatchRequest(handlerInput);

            // Execute global response interceptors
            if (this.responseInterceptors) {
                for (const responseInterceptor of this.responseInterceptors) {
                    await responseInterceptor.process(handlerInput, response);
                }
            }
        } catch (err) {
            response = await this.dispatchError(handlerInput, err);
        }

        return response;
    }

    /**
     * Main logic for request dispatching. Binds the forwarding function to the handlerInput
     * @param {HandlerInput} handlerInput
     * @returns {Promise<Response>}
     */
    protected async dispatchRequest(handlerInput : HandlerInput) : Promise<Response> {
        // Get the request handler chain that can handle the request
        let handlerChain : RequestHandlerChain;
        for (const requestMapper of this.requestMappers) {
            handlerChain = await requestMapper.getRequestHandlerChain(handlerInput);
            if (handlerChain) {
                break;
            }
        }
        if (!handlerChain) {
            throw createAskSdkError(
                this.constructor.name,
                `Could not find handler that can handle the request: ${JSON.stringify(handlerInput.requestEnvelope.request, null, 2)}`);
        }

        // Extract the handler and interceptors from the handler chain
        const handler = handlerChain.getRequestHandler();
        const requestInterceptors = handlerChain.getRequestInterceptors();
        const responseInterceptors = handlerChain.getResponseInterceptors();

        // Get the handler adapter that supports the request handler
        let adapter : HandlerAdapter;
        for (const handlerAdapter of this.handlerAdapters) {
            if (handlerAdapter.supports(handler)) {
                adapter = handlerAdapter;
                break;
            }
        }
        if (!adapter) {
            throw createAskSdkError(
                this.constructor.name,
                `Could not find the handler adapter that supports the request handler.`);
        }

        // Execute request interceptors that are local to the handler chain
        if (requestInterceptors) {
            for (const requestInterceptor of requestInterceptors) {
                await requestInterceptor.process(handlerInput);
            }
        }

        // Invoke the request handler
        const response = await adapter.execute(handlerInput, handler);

        // Execute response interceptors that are local to the handler chain
        if (responseInterceptors) {
            for (const responseInterceptor of responseInterceptors) {
                await responseInterceptor.process(handlerInput, response);
            }
        }

        return response;
    }

    /**
     * Main logic for error dispatching.
     * @param {HandlerInput} handlerInput
     * @param {Error} error
     * @returns {Promise<Response>}
     */
    protected async dispatchError(handlerInput : HandlerInput,
                                  error : Error) : Promise<Response> {
        if (this.errorMapper) {
            const handler : ErrorHandler = await this.errorMapper.getErrorHandler(handlerInput, error);
            if (handler) {
                return handler.handle(handlerInput, error);
            }
        }

        throw error;
    }
}
