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

/**
 * An interface providing a mapping of handler input and error to {@link ErrorHandler}.
 */
export interface ErrorMapper {
    getErrorHandler(handlerInput : HandlerInput, error : Error) : Promise<ErrorHandler> | ErrorHandler;
}
