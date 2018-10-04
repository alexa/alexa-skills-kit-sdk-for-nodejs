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
import { CustomSkillRequestHandler } from '../../../lib/dispatcher/request/handler/CustomSkillRequestHandler';
import { HandlerInput } from '../../../lib/dispatcher/request/handler/HandlerInput';

export class MockAlwaysTrueRequestHandler implements CustomSkillRequestHandler {
    public canHandle(input : HandlerInput) : boolean {
        return true;
    }

    public async handle(input : HandlerInput) : Promise<Response> {
        // tslint:disable
        try {
            const sessionAttributes = input.attributesManager.getSessionAttributes();
            sessionAttributes.key = 'value';
            input.attributesManager.setSessionAttributes(sessionAttributes);
        } catch (err) {}

        try {
            const persistentAttributes = await input.attributesManager.getPersistentAttributes();
            persistentAttributes.key = 'value';
            input.attributesManager.setPersistentAttributes(persistentAttributes);
        } catch (err) {}

        try {
            await input.attributesManager.savePersistentAttributes();
        } catch (err) {}

        return input.responseBuilder
            .speak(`Request received at ${this.constructor.name}.`)
            .getResponse();
    }
}
