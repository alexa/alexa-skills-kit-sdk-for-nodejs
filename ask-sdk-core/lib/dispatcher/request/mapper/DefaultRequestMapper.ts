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

import { DefaultRequestHandlerChain } from '../handler/DefaultRequestHandlerChain';
import { HandlerInput } from '../handler/HandlerInput';
import { RequestHandlerChain } from '../handler/RequestHandlerChain';
import { RequestMapper } from './RequestMapper';

/**
 * Default implementation for {@link RequestMapper}.
 */
export class DefaultRequestMapper implements RequestMapper {
    protected requestHandlerChains : DefaultRequestHandlerChain[];

    constructor(options : {
        requestHandlerChains : DefaultRequestHandlerChain[],
    }) {
        this.requestHandlerChains = options.requestHandlerChains;
    }

    /**
     * Loops through the RequestHandlerChain array to find the first handler that can dispatch the given input and returns the request handler chain.
     * @param {HandlerInput} handlerInput
     * @returns {Promise<RequestHandlerChain>}
     */
    public async getRequestHandlerChain(handlerInput : HandlerInput) : Promise<RequestHandlerChain> {
        for (const requestHandlerChain of this.requestHandlerChains) {
            const requestHandler = requestHandlerChain.getRequestHandler();
            if (await requestHandler.canHandle(handlerInput)) {
                return requestHandlerChain;
            }
        }

        return null;
    }
}
