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
import { HandlerAdapter } from './HandlerAdapter';
import { HandlerInput } from './HandlerInput';
import { RequestHandler } from './RequestHandler';

/**
 * Default implementation of {@link HandlerAdapter} that supports the default {@link RequestHandler}.
 */
export class DefaultHandlerAdapter implements HandlerAdapter {

    /**
     * Decides if the type of canHandle in request handler is a function or not.
     * @param {any} handler
     * @returns {boolean}
     */
    public supports(handler : any) : boolean {
        return typeof handler.canHandle === 'function' && typeof handler.handle === 'function';
    }

    /**
     * Executes the handle function of request handler and returns a promise of response.
     * @param {HandlerInput} handlerInput
     * @param {any} handler
     * @returns {Promise<Response>}
     */
    public async execute(handlerInput : HandlerInput, handler : any) : Promise<Response> {
        return (<RequestHandler> handler).handle(handlerInput);
    }
}
