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

import { ErrorHandler } from '../handler/ErrorHandler';
import { ErrorMapper } from './ErrorMapper';

/**
 * Generic implementation of @{link ErrorMapper}
 */
export class GenericErrorMapper<Input, Output> implements ErrorMapper<Input, Output> {
    protected errorHandlers : Array<ErrorHandler<Input, Output>>;

    constructor(options : {errorHandlers : Array<ErrorHandler<Input, Output>>}) {
        this.errorHandlers = options.errorHandlers;
    }

    public async getErrorHandler(handlerInput : Input, error : Error) : Promise<ErrorHandler<Input, Output>> {
        for (const errorHandler of this.errorHandlers) {
            if (await errorHandler.canHandle(handlerInput, error)) {
                return errorHandler;
            }
        }

        return null;
    }
}
