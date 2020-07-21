/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License').
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the 'license' file accompanying this file. This file is distributed
 * on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { Skill, RequestHandler } from 'ask-sdk-core';
import { ui, Directive, Response, ResponseEnvelope } from 'ask-sdk-model';
import { wrapRequestHandlerAsSkill } from './SkillWrapper';
import { IControlInput } from '../../controls/interfaces/IControlInput';

type TSessionAttributes = { [key: string]: any } | undefined;

/**
 * Utility to invoke a Skill or RequestHandler for testing.
 *
 * This wrapper mimics the lifecycle of an ASK Skill using AWS Lambda
 * that is repeatedly invoked as a 'stateless' function which receives actual state
 * in the session attributes of the Request object.
 *
 */
export class SkillInvoker {

    private sessionAttributes: TSessionAttributes;
    private skill: Skill;

    constructor(skillOrRequestHandler: Skill | RequestHandler) {
        this.skill = (((skillOrRequestHandler as any).handle !== undefined) ? wrapRequestHandlerAsSkill(skillOrRequestHandler as RequestHandler) : skillOrRequestHandler as Skill);
    }

    /**
     * Invoke the skill with a control-input object.
     * The control input is first converted to a RequestEnvelope(IntentRequest)
     *
     * @param input - Input
     * @returns [prompt ssml inner-text, reprompt ssml inner-text]
     */
    public async invoke(input: IControlInput): Promise<TestResponseObject> {
        const envelope = input.handlerInput.requestEnvelope;
        envelope.session!.attributes = this.sessionAttributes; // populate saved state

        // ********** INVOKE SKILL ****************
        const responseEnvelope = await this.skill.invoke(envelope, undefined);

        this.sessionAttributes = responseEnvelope.sessionAttributes; // save updated state

        const promptSSML = (responseEnvelope.response.outputSpeech as ui.SsmlOutputSpeech).ssml;
        const prompt = promptSSML.replace('<speak>', '').replace('</speak>', '');

        const repromptSSML = ((responseEnvelope.response.reprompt as ui.Reprompt).outputSpeech as ui.SsmlOutputSpeech).ssml;
        const reprompt = repromptSSML.replace('<speak>', '').replace('</speak>', '');

        const directive: Directive[] | undefined = responseEnvelope.response.directives;
        // const cardContent = (responseEnv.response.card as ui.SimpleCard).content;
        return {
            responseEnvelope,
            response: responseEnvelope.response,
            prompt,
            reprompt,
            directive
        };
    }
}


export interface TestResponseObject {
    responseEnvelope: ResponseEnvelope,
    response: Response,
    prompt: string,
    reprompt?: string,
    directive?: Directive[]
}
