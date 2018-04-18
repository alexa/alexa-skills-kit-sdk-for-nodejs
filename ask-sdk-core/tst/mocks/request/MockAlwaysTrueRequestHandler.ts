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
import { HandlerInput } from '../../../lib/dispatcher/request/handler/HandlerInput';
import { RequestHandler } from '../../../lib/dispatcher/request/handler/RequestHandler';
import { ResponseFactory } from '../../../lib/response/ResponseFactory';

export class MockAlwaysTrueRequestHandler implements RequestHandler {
    public canHandle(handlerInput : HandlerInput) : boolean {
        return true;
    }

    public async handle(handlerInput : HandlerInput) : Promise<Response> {
        // tslint:disable
        try {
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            sessionAttributes.key = 'value';
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        } catch (err) {}

        try {
            const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
            persistentAttributes.key = 'value';
            handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);
        } catch (err) {}

        try {
            await handlerInput.attributesManager.savePersistentAttributes();
        } catch (err) {}

        return handlerInput.responseBuilder
            .speak(`Request received at ${this.constructor.name}.`)
            .getResponse();
    }
}
