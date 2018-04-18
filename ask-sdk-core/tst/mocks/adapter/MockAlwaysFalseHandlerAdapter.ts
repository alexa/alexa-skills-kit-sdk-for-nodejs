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
import { HandlerAdapter } from '../../../lib/dispatcher/request/handler/HandlerAdapter';
import { HandlerInput } from '../../../lib/dispatcher/request/handler/HandlerInput';

export class MockAlwaysFalseHandlerAdapter implements HandlerAdapter {
    public supports(handler : {}) : boolean {
        return false;
    }

    public execute(handlerInput : HandlerInput, handler : {}) : Promise<Response> | Response {
        throw new Error(`${this.constructor.name} Error: this line should never be reached!`);
    }
}
