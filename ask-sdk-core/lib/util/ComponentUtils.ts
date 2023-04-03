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

import {
    Slot, dialog, Response, interfaces, Intent
} from 'ask-sdk-model';
import { createAskSdkError } from 'ask-sdk-runtime';

import { CustomSkillRequestHandler as RequestHandler } from '../dispatcher/request/handler/CustomSkillRequestHandler';
import { HandlerInput } from '../dispatcher/request/handler/HandlerInput';
import { getRequestType } from './RequestEnvelopeUtils';

export function launchComponent(options?: {
    utteranceSetName?: string,
    slots?: {[key : string] : Slot },
    isUserUtteranceInput?: boolean
}) : dialog.DelegateRequestDirective {
    const directiveType: ('Dialog.DelegateRequest') = "Dialog.DelegateRequest";
    const delegationTarget: string = "AMAZON.Conversations";
    const updatedRequestType: ("Dialog.InputRequest" | "IntentRequest") = "Dialog.InputRequest";
    const delegationPeriod:dialog.DelegationPeriod = {
        until: 'EXPLICIT_RETURN'
    };

    if (!options || options.isUserUtteranceInput || !options.utteranceSetName) {
        const delegateRequestDirective:dialog.DelegateRequestDirective = {
            type: directiveType,
            target: delegationTarget,
            period: delegationPeriod
        };
        return delegateRequestDirective;
    }

    const dialogInput:dialog.Input = {
        name: options.utteranceSetName,
        slots: options.slots || {}
    };

    const updatedRequest:dialog.UpdatedRequest = {
        type: updatedRequestType,
        input: dialogInput
    };

    const delegateRequestDirective:dialog.DelegateRequestDirective = {
        type: directiveType,
        target: delegationTarget,
        period: delegationPeriod,
        updatedRequest
    };

    return delegateRequestDirective;
}

export function egressFromComponent(actionName: string, egressInput: {
    intentName?:string,
    handle?: ((input: HandlerInput) => Response | Promise<Response>)
}): RequestHandler {

    if (!egressInput.intentName && !egressInput.handle) {
        throw createAskSdkError("ComponentUtils",
            "No intentName or handle callback provided for egressing from skill component");
    }

    const directiveType: ('Dialog.DelegateRequest') = "Dialog.DelegateRequest";
    const delegationTarget: string = "skill";
    const updatedRequestType: ("Dialog.InputRequest" | "IntentRequest") = "IntentRequest";
    const delegationPeriod:dialog.DelegationPeriod = {
        until: 'EXPLICIT_RETURN'
    };

    const skillRequestType = 'Dialog.API.Invoked';

    const delegateToIntentHandler: RequestHandler = {
        canHandle(input: HandlerInput): boolean | Promise<boolean> {
            return getRequestType(input.requestEnvelope) === skillRequestType
            && (input.requestEnvelope.request as interfaces.conversations.APIInvocationRequest).apiRequest.name === actionName;
        },
        handle(input: HandlerInput): Response | Promise<Response> {
            if (egressInput.handle) {
                return egressInput.handle(input);
            }
            const intent:Intent = {
                name: egressInput.intentName,
                confirmationStatus: 'NONE'
            };
            const updatedRequest:dialog.UpdatedRequest = {
                type: updatedRequestType,
                intent
            };
            const delegateRequestDirective:dialog.DelegateRequestDirective = {
                type: directiveType,
                target: delegationTarget,
                period: delegationPeriod,
                updatedRequest
            };

            return input.responseBuilder.addDirective(delegateRequestDirective).getResponse();
        }
    };

    return delegateToIntentHandler;
}