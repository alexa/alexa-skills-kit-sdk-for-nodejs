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

import { GenericRequestHandlerChain } from '../handler/GenericRequestHandlerChain';
import { RequestMapper } from './RequestMapper';

/**
 * Generic implementation for {@link RequestMapper}.
 */
export class GenericRequestMapper<Input, Output> implements RequestMapper<Input, Output> {
    protected requestHandlerChains : Array<GenericRequestHandlerChain<Input, Output>>;

    constructor(options : {
        requestHandlerChains : Array<GenericRequestHandlerChain<Input, Output>>,
    }) {
        this.requestHandlerChains = options.requestHandlerChains;
    }

    public async getRequestHandlerChain(input : Input) : Promise<GenericRequestHandlerChain<Input, Output>> {
        for (const requestHandlerChain of this.requestHandlerChains) {
            const requestHandler = requestHandlerChain.getRequestHandler();
            if (await requestHandler.canHandle(input)) {
                return requestHandlerChain;
            }
        }

        return null;
    }
}
