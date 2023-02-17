
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

import { RequestEnvelope, Response, dialog, IntentRequest, Slot } from 'ask-sdk-model';
import { getIntentName, getRequestType } from '../../../util/RequestEnvelopeUtils';
import { CustomSkillRequestHandler } from './CustomSkillRequestHandler';
import { HandlerInput } from './HandlerInput';
import { getDelegateTarget, getDelegateTargetName, getDelegateTargetSlots, getDelegateTargetType, getDelegationMap, getSkillToConversationMapper, getSlotsForComponent, storeIntentSlotsInSession } from '../../../util/DialogInterOperationUtils';
import { DelegationData, DelegateTarget, SkillToConversationsMapper } from '../../../delegation/DelegationData';
import DelegateRequestDirective = dialog.DelegateRequestDirective;
import DelegationPeriod = dialog.DelegationPeriod;

export class DelegateToConversationsHandler implements CustomSkillRequestHandler {
    private skillToConversationsMapper: SkillToConversationsMapper;

    static readonly defaultMapPath: string = "/var/task/mappings/skillToConversations.json";

    constructor(mapPath: string = DelegateToConversationsHandler.defaultMapPath) {
        this.skillToConversationsMapper = getSkillToConversationMapper(mapPath);
    }

    private isDelegateToConversationsRequest(input : HandlerInput) : boolean {
        const requestEnvelope:RequestEnvelope = input.requestEnvelope;
        if (!this.skillToConversationsMapper ||
            !getDelegationMap(this.skillToConversationsMapper)) {
            return false;
        }
        return getDelegationMap(this.skillToConversationsMapper).has(getIntentName(requestEnvelope));
    }

    public canHandle(input : HandlerInput) : boolean {
        return getRequestType(input.requestEnvelope) === 'IntentRequest'
        && this.isDelegateToConversationsRequest(input);
    }

    public async handle(input : HandlerInput) : Promise<Response> {

        const intentName: string = getIntentName(input.requestEnvelope);
        const delegationInfo: DelegationData = getDelegationMap(this.skillToConversationsMapper).get(intentName);
        const delegateTarget:DelegateTarget = getDelegateTarget(delegationInfo);

        const delegationPeriod:DelegationPeriod = {
            until: 'EXPLICIT_RETURN'
        };

        if (getDelegateTargetType(delegateTarget) === 'Conversations') {
            const delegateRequestDirective:DelegateRequestDirective = {
                type: 'Dialog.DelegateRequest',
                target: "AMAZON.Conversations",
                period: delegationPeriod
            };
            return input.responseBuilder
                .addDirective(delegateRequestDirective)
                .getResponse();
        }

        storeIntentSlotsInSession(input, intentName);

        const delegateTargetSlots = getDelegateTargetSlots(delegateTarget);
        const intentSlots = (input.requestEnvelope.request as IntentRequest).intent.slots;
        const filledSlots: {[key : string] : Slot} = getSlotsForComponent(intentSlots, delegateTargetSlots);

        const dialogInput:dialog.Input = {
            name: getDelegateTargetName(delegateTarget),
            slots: filledSlots
        };
        
        const updatedRequest:dialog.UpdatedRequest = {
            type: 'Dialog.InputRequest',
            input: dialogInput
        };

        const delegateRequestDirective:DelegateRequestDirective = {
            type: 'Dialog.DelegateRequest',
            target: "AMAZON.Conversations",
            period: delegationPeriod,
            updatedRequest
        };

        return input.responseBuilder
            .addDirective(delegateRequestDirective)
            .getResponse();
    }
}
