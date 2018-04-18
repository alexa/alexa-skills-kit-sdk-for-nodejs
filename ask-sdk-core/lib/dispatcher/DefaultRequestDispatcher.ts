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
import { RequestMapper } from './request/mapper/RequestMapper';
import { RequestDispatcher } from './RequestDispatcher';

/**
 * Default implementation of {@link RequestDispatcher}.
 */
export class DefaultRequestDispatcher implements RequestDispatcher {
    protected requestMappers : RequestMapper[];
    protected errorMapper : ErrorMapper;
    protected handlerAdapters : HandlerAdapter[];

    constructor(options : {
        requestMappers : RequestMapper[],
        handlerAdapters : HandlerAdapter[],
        errorMapper? : ErrorMapper,
    }) {
        this.requestMappers = options.requestMappers;
        this.handlerAdapters = options.handlerAdapters;
        this.errorMapper = options.errorMapper;
    }

    /**
     * Main entry point for dispatching logic.
     * Dispatches handlerInput to requestHandlers and error, if any, to _errorHandlers
     * @param {HandlerInput} handlerInput
     * @returns {Promise<ResponseEnvelope>}
     */
    public async dispatch(handlerInput : HandlerInput) : Promise<Response> {
        let response : Response;
        try {
            response = await this.dispatchRequest(handlerInput);
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
                'RequestHandlerChain not found!');
        }

        const handler = handlerChain.getRequestHandler();
        const requestInterceptors = handlerChain.getRequestInterceptors();
        const responseInterceptors = handlerChain.getResponseInterceptors();

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
                'HandlerAdapter not found!');
        }

        // Pre-processing logic. Going in order
        if (requestInterceptors) {
            for (const requestInterceptor of requestInterceptors) {
                await requestInterceptor.process(handlerInput);
            }
        }

        const response = await adapter.execute(handlerInput, handler);

        // Post-processing logic. Going in order
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
