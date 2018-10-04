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

import { Response } from 'ask-sdk-model';
import { CustomSkillErrorHandler } from '../../../lib/dispatcher/error/handler/CustomSkillErrorHandler';
import { HandlerInput } from '../../../lib/dispatcher/request/handler/HandlerInput';
import { ResponseFactory } from '../../../lib/response/ResponseFactory';

export class MockAlwaysTrueErrorHandler implements CustomSkillErrorHandler {
    public canHandle(input : HandlerInput, error : Error) : boolean {
        return true;
    }

    public handle(input : HandlerInput, error : Error) : Response {
        return input.responseBuilder
            .speak(`${error.name} received at ${this.constructor.name}.`)
            .getResponse();
    }
}
