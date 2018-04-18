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

import { HandlerInput } from '../request/handler/HandlerInput';
import { ErrorHandler } from './ErrorHandler';
import { ErrorMapper } from './ErrorMapper';

/**
 * Default implementation of {@link ErrorMapper}.
 */
export class DefaultErrorMapper implements ErrorMapper {
    protected errorHandlers : ErrorHandler[];

    constructor(options : {errorHandlers : ErrorHandler[]}) {
        this.errorHandlers = options.errorHandlers;
    }

    /**
     * Loops through the error handler array in order and finds the first handler that can handle the given input and error.
     * @param {HandlerInput} handlerInput
     * @param {Error} error
     * @returns {Promise<ErrorHandler>} Returns null if no capable error handler is found.
     */
    public async getErrorHandler(handlerInput : HandlerInput, error : Error) : Promise<ErrorHandler> {
        for (const errorHandler of this.errorHandlers) {
            if (await errorHandler.canHandle(handlerInput, error)) {
                return errorHandler;
            }
        }

        return null;
    }
}
