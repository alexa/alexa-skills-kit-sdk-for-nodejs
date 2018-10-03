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

import { RequestInterceptor } from '../interceptor/RequestInterceptor';
import { ResponseInterceptor } from '../interceptor/ResponseInterceptor';
import { RequestHandler } from './RequestHandler';
import { RequestHandlerChain } from './RequestHandlerChain';

/**
 * Generic implementation of {@link RequestHandlerChain}.
 */
export class GenericRequestHandlerChain<Input, Output> implements RequestHandlerChain<Input, Output> {
    protected requestHandler : RequestHandler<Input, Output>;
    protected requestInterceptors : Array<RequestInterceptor<Input>>;
    protected responseInterceptors : Array<ResponseInterceptor<Input, Output>>;

    constructor(options : {
        requestHandler : RequestHandler<Input, Output>,
        requestInterceptors? : Array<RequestInterceptor<Input>>,
        responseInterceptors? : Array<ResponseInterceptor<Input, Output>>,
    }) {
        this.requestHandler = options.requestHandler;
        this.requestInterceptors = options.requestInterceptors;
        this.responseInterceptors = options.responseInterceptors;
    }

    public getRequestHandler() : RequestHandler<Input, Output> {
        return this.requestHandler;
    }

    public getRequestInterceptors() : Array<RequestInterceptor<Input>> {
        return this.requestInterceptors;
    }

    public getResponseInterceptors() : Array<ResponseInterceptor<Input, Output>> {
        return this.responseInterceptors;
    }
}
