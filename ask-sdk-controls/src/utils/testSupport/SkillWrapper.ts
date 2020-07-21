/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { ErrorHandler, HandlerInput, RequestHandler, Skill, SkillBuilders } from "ask-sdk-core";
import { Logger } from '../../logging/Logger';

const log = new Logger('AskSdkControls:SkillWrapper');

/**
 * Wraps a single RequestHandler as a Skill for testing.
 *
 * The resulting Skill has a single requestHandler (the one provided) and a
 * default error handler that logs any internal error that may occur.
 *
 * @param requestHandler - Request handler
 */
export function wrapRequestHandlerAsSkill(requestHandler: RequestHandler): Skill {
    const errorHandler: ErrorHandler = {
        canHandle() {
            return true;
        },
        handle(handlerInput: HandlerInput, error: Error) {
            log.error(`~~~~ Error handled: ${error.stack}`);
            const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }
    };

    /*
     * The SkillBuilder acts as the entry point for your skill, routing all request and response
     * payloads to the handlers above. Make sure any new handlers or interceptors you've
     * defined are included below. The order matters - they're processed top to bottom.
     */

    const _handler =
        SkillBuilders.custom()
            .addRequestHandlers(requestHandler)
            .addErrorHandlers(errorHandler);
    const skill = _handler.create();
    return skill;
}
