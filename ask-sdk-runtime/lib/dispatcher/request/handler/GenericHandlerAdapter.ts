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

import { HandlerAdapter } from './HandlerAdapter';
import { RequestHandler } from './RequestHandler';

/**
 * Generic implementation of {@link HandlerAdapter that supports the {@link RequestHandler}}}
 */
export class GenericHandlerAdapter<Input, Output> implements HandlerAdapter<Input, Output> {
    public supports(handler : any) : boolean {
        return typeof handler.canHandle === 'function'
               && typeof handler.handle === 'function';
    }

    public async execute(input : Input, handler : any) : Promise<Output> {
        return (handler as RequestHandler<Input, Output>).handle(input);
    }
}
