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
    IntentRequest,
    ListSlotValue,
    RequestEnvelope,
    SimpleSlotValue,
    Slot
} from 'ask-sdk-model';
import { expect } from 'chai';
import {
    getAccountLinkingAccessToken,
    getApiAccessToken,
    getDeviceId,
    getDialogState,
    getIntentName,
    getLocale,
    getRequest,
    getRequestType,
    getSimpleSlotValues,
    getSlot,
    getSlotValue,
    getSlotValueV2,
    getSupportedInterfaces,
    getUserId,
    isNewSession
} from '../../lib/util/RequestEnvelopeUtils';
import { JsonProvider } from '../mocks/JsonProvider';

describe('RequestEnvelopeUtils', () => {
    const requestEnvelope : RequestEnvelope = JsonProvider.requestEnvelope();
    requestEnvelope.request.locale = 'en-US';
    requestEnvelope.context.System.user.accessToken = 'mockAccessToken';
    requestEnvelope.context.System.apiAccessToken = 'mockApiAccessToken';
    requestEnvelope.context.System.device.deviceId = 'mockDeviceId';
    requestEnvelope.context.System.device.supportedInterfaces = {
        Display : {
            templateVersion : '1.0',
            markupVersion : '1.0',
        },
    };
    requestEnvelope.context.System.user.userId = 'mockUserId';

    const intentRequestEnvelope : RequestEnvelope = JsonProvider.requestEnvelope();
    intentRequestEnvelope.request.type = 'IntentRequest';
    (intentRequestEnvelope.request as IntentRequest).intent = JsonProvider.intent();
    (intentRequestEnvelope.request as IntentRequest).intent.name = 'MockIntent';
    (intentRequestEnvelope.request as IntentRequest).dialogState = 'STARTED';
    const intentSlot : Slot = JsonProvider.slot();
    intentSlot.value = 'mockSlotValue';
    intentSlot.name = 'mockSlot';
    (intentRequestEnvelope.request as IntentRequest).intent.slots = {
        mockSlot : intentSlot,
    };

    const intentRequestEnvelopeWithNoSlots : RequestEnvelope = JsonProvider.requestEnvelope();
    intentRequestEnvelopeWithNoSlots.request.type = 'IntentRequest';
    (intentRequestEnvelopeWithNoSlots.request as IntentRequest).intent = JsonProvider.intent();

    const outOfSessionRequest : RequestEnvelope = JsonProvider.requestEnvelope();
    delete outOfSessionRequest.session;

    const requestEnvelopeWithNoDevice : RequestEnvelope = JsonProvider.requestEnvelope();
    delete requestEnvelopeWithNoDevice.context.System.device;

    const nestedSimpleSlotValue : SimpleSlotValue = {
        type: 'Simple',
        value: 'nested simple slot',
    };
    const nestedListSlotValue : ListSlotValue = { type: 'List', values: [nestedSimpleSlotValue] };
    const simpleSlot : Slot = JsonProvider.slot();
    simpleSlot.value = 'mockSlotValue';
    simpleSlot.name = 'mockSlot';
    simpleSlot.slotValue = {
        type: 'Simple',
        value: 'test',
    };

    const listSlot : Slot = JsonProvider.slot();
    listSlot.value = 'mockSlotValue';
    listSlot.name = 'mockSlot';
    listSlot.slotValue = {
        type: 'List',
        values: [simpleSlot.slotValue, nestedListSlotValue],
    };

    it('should be able to get locale', () => {
        expect(getLocale(requestEnvelope)).eq('en-US');
    });

    it('should be able to get request type', () => {
        expect(getRequestType(requestEnvelope)).eq('LaunchRequest');
    });

    it('should be able to get intent name', () => {
        expect(getIntentName(intentRequestEnvelope)).eq('MockIntent');
    });

    it('should throw an error if trying to get intent name of non-intent request', () => {
        expect(() => {
            getIntentName(requestEnvelope);
        }).to.throw(`Expecting request type of IntentRequest but got LaunchRequest.`);
    });

    it('should return the intent request object', () => {
        const request = getRequest<IntentRequest>(intentRequestEnvelope);
        expect(request).deep.eq({
            type: 'IntentRequest',
            requestId: null,
            timestamp: null,
            locale: null,
            intent: {
                confirmationStatus: null,
                name: 'MockIntent',
                slots: {
                    mockSlot: {
                        confirmationStatus: null,
                        name: 'mockSlot',
                        value: 'mockSlotValue',
                        resolutions: null,
                    },
                },
            },
            dialogState: 'STARTED',
        });
    });

    it('should be able to get account linking access token', () => {
        expect(getAccountLinkingAccessToken(requestEnvelope)).eq('mockAccessToken');
    });

    it('should be able to get api access token', () => {
        expect(getApiAccessToken(requestEnvelope)).eq('mockApiAccessToken');
    });

    it('should be able to get device id', () => {
        expect(getDeviceId(requestEnvelope)).eq('mockDeviceId');
    });

    it('should return null if there is no device info', () => {
        expect(getDeviceId(requestEnvelopeWithNoDevice)).eq(null);
    });

    it('should be able to get user id', () => {
        expect(getUserId(requestEnvelope)).eq('mockUserId');
    });

    it('should return null if there is no user info', () => {
        const requestEnvelopeWithNoUser = { ...requestEnvelope };
        delete requestEnvelopeWithNoUser.context.System.user;
        expect(getUserId(requestEnvelopeWithNoUser)).eq(null);
    });

    it('should be able to get dialog state', () => {
        expect(getDialogState(intentRequestEnvelope)).eq('STARTED');
    });

    it('should throw an error if trying to get dialog state of non-intent request', () => {
        expect(() => {
            getDialogState(requestEnvelope);
        }).to.throw(`Expecting request type of IntentRequest but got LaunchRequest.`);
    });

    it('should be able to get slot', () => {
        expect(getSlot(intentRequestEnvelope, 'mockSlot')).deep.eq({
            name : 'mockSlot',
            value : 'mockSlotValue',
            resolutions : null,
            confirmationStatus : null,
        });
    });

    it('should return null if no slot with slot name can be found', () => {
        expect(getSlot(intentRequestEnvelope, 'non-existentSlot')).eq(undefined);
    });

    it('should return null if no slots are found', () => {
        expect(getSlot(intentRequestEnvelopeWithNoSlots, 'mockSlot')).eq(null);
    });

    it('should throw an error if trying to get slot of non-intent request', () => {
        expect(() => {
            getSlot(requestEnvelope, 'mockSlot');
        }).to.throw(`Expecting request type of IntentRequest but got LaunchRequest.`);
    });

    it('should be able to get slot value', () => {
        expect(getSlotValue(intentRequestEnvelope, 'mockSlot')).eq('mockSlotValue');
    });

    it('getSimpleSlotValues should be able to get single SimpleSlotValues', () => {

        const slotValues = getSimpleSlotValues(simpleSlot.slotValue);
        expect(slotValues).deep.eq([simpleSlot.slotValue]);
    });

    it('getSimpleSlotValues should return empty array when slotValue.values is null', () => {

        const emptyListSlotValue : ListSlotValue = { type: 'List', values: null };
        const slotValues = getSimpleSlotValues(emptyListSlotValue);
        expect(slotValues).deep.eq([]);
    });

    it('getSimpleSlotValues should return empty array when slotValue.type is invalid', () => {

        const emptyListSlotValue = { type: 'Invalid', values: [simpleSlot.slotValue] };
        const slotValues = getSimpleSlotValues(emptyListSlotValue as ListSlotValue);
        expect(slotValues).deep.eq([]);
    });

    it('getSimpleSlotValues should be able to get all nested SimpleSlotValues', () => {
        const requestWithSimpleSlotValue = { ...intentRequestEnvelope };
        (requestWithSimpleSlotValue.request as IntentRequest).intent.slots = {
            mockSlot: listSlot,
        };
        const slotValues = getSimpleSlotValues(listSlot.slotValue);
        expect(slotValues).deep.eq([simpleSlot.slotValue, nestedSimpleSlotValue]);
    });

    it('getSlotValueV2 should return null when slotName is not match', () => {
        const requestWithSimpleSlotValue = { ...intentRequestEnvelope };
        (requestWithSimpleSlotValue.request as IntentRequest).intent.slots = {
            mockSlot: listSlot,
        };
        const slotValue = getSlotValueV2(intentRequestEnvelope, 'invalidSlotName');
        expect(slotValue).deep.eq(null);
    });

    it('getSlotValueV2 should be able to get SlotValue object', () => {
        const requestWithSimpleSlotValue = { ...intentRequestEnvelope };
        (requestWithSimpleSlotValue.request as IntentRequest).intent.slots = {
            mockSlot: listSlot,
        };
        const slotValue = getSlotValueV2(intentRequestEnvelope, 'mockSlot');
        expect(slotValue).deep.eq(listSlot.slotValue);
    });

    it('should throw an error if trying to get slot value of non existent slot', () => {
        expect(getSlotValue(intentRequestEnvelope, 'non-existentSlot')).eq(null);
    });

    it('should throw an error if trying to get slot value of non-intent request', () => {
        expect(() => {
            getSlotValue(requestEnvelope, 'mockSlot');
        }).to.throw(`Expecting request type of IntentRequest but got LaunchRequest.`);
    });

    it('should be able to get supported interfaces', () => {
        expect(getSupportedInterfaces(requestEnvelope)).deep.eq({
            Display : {
                templateVersion : '1.0',
                markupVersion : '1.0',
            },
        });
    });

    it('should get empty supported interfaces if device not in request', () => {
        expect(getSupportedInterfaces(requestEnvelopeWithNoDevice)).deep.eq({});
    });

    it('should be able to get session new value', () => {
        expect(isNewSession(requestEnvelope)).eq(true);
    });

    it('should throw an error when trying to get session new value of out of session request', () => {
        expect(() => {
            isNewSession(outOfSessionRequest);
        }).to.throw(`The provided request doesn't contain a session.`);
    });
});
