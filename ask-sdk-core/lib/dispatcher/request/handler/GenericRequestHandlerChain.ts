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
import { RequestHandlerChain } from './RequestHandlerChain';

/**
 * Generic implementation of {@link RequestHandlerChain}.
 */
export class GenericRequestHandlerChain implements RequestHandlerChain {
    protected requestHandler : any;
    protected requestInterceptors : RequestInterceptor[];
    protected responseInterceptors : ResponseInterceptor[];

    constructor(options : {
        requestHandler : any,
        requestInterceptors? : RequestInterceptor[],
        responseInterceptors? : ResponseInterceptor[],
    }) {
        this.requestHandler = options.requestHandler;
        this.requestInterceptors = options.requestInterceptors;
        this.responseInterceptors = options.responseInterceptors;
    }

    /**
     * Provides request handler.
     * @returns {any}
     */
    public getRequestHandler() : any {
        return this.requestHandler;
    }

    /**
     * Provides request interceptor array.
     * @returns {RequestInterceptor[]}
     */
    public getRequestInterceptors() : RequestInterceptor[] {
        return this.requestInterceptors;
    }

    /**
     * Provides response interceptor array.
     * @returns {ResponseInterceptor[]}
     */
    public getResponseInterceptors() : ResponseInterceptor[] {
        return this.responseInterceptors;
    }
}
