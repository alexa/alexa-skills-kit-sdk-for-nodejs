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

import { RequestInterceptor } from '../interceptor/RequestInterceptor';
import { ResponseInterceptor } from '../interceptor/ResponseInterceptor';
import { GenericRequestHandlerChain } from './GenericRequestHandlerChain';
import { RequestHandler } from './RequestHandler';
import { RequestHandlerChain } from './RequestHandlerChain';

/**
 * Default implementation of {@link RequestHandlerChain}.
 */
export class DefaultRequestHandlerChain extends GenericRequestHandlerChain {
    constructor(options : {
        requestHandler : RequestHandler,
        requestInterceptors? : RequestInterceptor[],
        responseInterceptors? : ResponseInterceptor[],
    }) {
        super(options);
    }

    /**
     * Provides request handler.
     * @returns {RequestHandler}
     */
    public getRequestHandler() : RequestHandler {
        return <RequestHandler> this.requestHandler;
    }
}
