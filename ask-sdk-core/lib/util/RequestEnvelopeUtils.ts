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
    DialogState,
    IntentRequest,
    Request,
    RequestEnvelope,
    Session,
    SimpleSlotValue,
    Slot,
    SlotValue,
    SupportedInterfaces,
    interfaces
} from 'ask-sdk-model';
import { createAskSdkError } from 'ask-sdk-runtime';
import APIRequest = interfaces.conversations.APIRequest;
/**
 * Retrieves the locale from the request.
 *
 * The method returns the locale value present in the request. More information about the locale can be found
 * here: https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-locale
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {string}
 */
export function getLocale(requestEnvelope : RequestEnvelope) : string {
    return requestEnvelope.request.locale;
}

/**
 * Retrieves the type of the request.
 *
 * The method retrieves the request type of the input request. More information about the different request
 * types are mentioned here:
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-body-parameters
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {string}
 */
export function getRequestType(requestEnvelope : RequestEnvelope) : string {
    return requestEnvelope.request.type;
}

/**
 * Retrieves the name of the intent from the request.
 *
 * The method retrieves the intent name from the input request, only if the input request is an {@link IntentRequest}.
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {string}
 */
export function getIntentName(requestEnvelope : RequestEnvelope) : string {
    if (getRequestType(requestEnvelope) === 'IntentRequest') {
        return (requestEnvelope.request as IntentRequest).intent.name;
    }

    throw createAskSdkError(
        'RequestEnvelopeUtils',
        `Expecting request type of IntentRequest but got ${getRequestType(requestEnvelope)}.`);
}

/**
 * Get request object.
 *
 * We can set a specific type to the response by using the generics
 * @param {RequestEnvelope} requestEnvelope
 * @return {Request}
 * @example
 * ```
 * const intentRequest = getRequest<IntentRequest>(requestEnvelope)
 * console.log(intentRequest.intent.name)
 * ```
 */
export function getRequest <T extends Request>(requestEnvelope : RequestEnvelope) : T {
    return requestEnvelope.request as T;
}

/**
 * Retrieves the account linking access token from the request.
 *
 * The method retrieves the user's accessToken from the input request. Once a user successfully enables a skill
 * and links their Alexa account to the skill, the input request will have the user's access token. A null value
 * is returned if there is no access token in the input request. More information on this can be found here:
 * https://developer.amazon.com/docs/account-linking/add-account-linking-logic-custom-skill.html
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {string}
 */
export function getAccountLinkingAccessToken(requestEnvelope : RequestEnvelope) : string {
    return requestEnvelope.context.System.user.accessToken;
}

/**
 * Retrieves the API access token from the request.
 *
 * The method retrieves the apiAccessToken from the input request, which has the encapsulated information of
 * permissions granted by the user. This token can be used to call Alexa-specific APIs. More information
 * about this can be found here:
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#system-object
 *
 * The SDK automatically injects this value into service client instances retrieved from the {@link services.ServiceClientFactory}
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {string}
 */
export function getApiAccessToken(requestEnvelope : RequestEnvelope) : string {
    return requestEnvelope.context.System.apiAccessToken;
}

/**
 * Retrieves the device ID from the request.
 *
 * The method retrieves the deviceId property from the input request. This value uniquely identifies the device
 * and is generally used as input for some Alexa-specific API calls. More information about this can be found here:
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#system-object
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {string}
 */
export function getDeviceId(requestEnvelope : RequestEnvelope) : string {
    return requestEnvelope.context.System.device ? requestEnvelope.context.System.device.deviceId : null;
}
/**
 * Retrieves the user ID from the request.
 *
 * The method retrieves the userId property from the input request. This value uniquely identifies the user
 * and is generally used as input for some Alexa-specific API calls. More information about this can be found here:
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#system-object
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {string}
 */
export function getUserId(requestEnvelope : RequestEnvelope) : string {
    return requestEnvelope.context.System.user ? requestEnvelope.context.System.user.userId : null;
}

/**
 * Retrieves the dialog state from the request.
 *
 * The method retrieves the `dialogState` from the intent request, if the skill's interaction model includes a
 * dialog model. This can be used to determine the current status of user conversation and return the appropriate
 * dialog directives if the conversation is not yet complete. More information on dialog management can be found here:
 * https://developer.amazon.com/docs/custom-skills/define-the-dialog-to-collect-and-confirm-required-information.html
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {DialogState}
 */
export function getDialogState(requestEnvelope : RequestEnvelope) : DialogState {
    if (getRequestType(requestEnvelope) === 'IntentRequest') {
        return (requestEnvelope.request as IntentRequest).dialogState;
    }

    throw createAskSdkError(
        'RequestEnvelopeUtils',
        `Expecting request type of IntentRequest but got ${getRequestType(requestEnvelope)}.`);
}

/**
 * Returns the {@link Slot} for the given slot name from the request.
 *
 * This method attempts to retrieve the requested {@link Slot} from the incoming request. If the slot does not
 * exist in the request, a null value will be returned.
 *
 * @param {RequestEnvelope} requestEnvelope
 * @param {string} slotName
 * @return {Slot}
 */
export function getSlot(requestEnvelope : RequestEnvelope, slotName : string) : Slot {
    if (getRequestType(requestEnvelope) === 'IntentRequest') {
        const slots : {[key : string] : Slot} = (requestEnvelope.request as IntentRequest).intent.slots;
        if (slots != null) {
            return slots[slotName];
        }

        return null;
    }

    throw createAskSdkError(
        'RequestEnvelopeUtils',
        `Expecting request type of IntentRequest but got ${getRequestType(requestEnvelope)}.`);

}

/**
 * Returns the value from the given {@link Slot} in the request.
 *
 * This method attempts to retrieve the requested {@link Slot}'s value from the incoming request. If the slot does not
 * exist in the request, a null will be returned.
 *
 * @param {RequestEnvelope} requestEnvelope
 * @param {string} slotName
 * @return {string}
 */
export function getSlotValue(requestEnvelope : RequestEnvelope, slotName : string) : string {
    if (getRequestType(requestEnvelope) === 'IntentRequest') {
        const slot = getSlot(requestEnvelope, slotName);
        if (slot) {
            return slot.value;
        }

        return null;
    }

    throw createAskSdkError(
        'RequestEnvelopeUtils',
        `Expecting request type of IntentRequest but got ${getRequestType(requestEnvelope)}.`);
}

/**
 * Returns the SlotValue from the given {@link Slot} in the request.
 *
 * SlotValue will exist for slots using multiple slot value feature. And this method attempts to retrieve the requested {@link Slot}'s SlotValue from the incoming request.
 * If the slot or slot.slotValue does not exist in the request, null will be returned.
 *
 * @param {RequestEnvelope} requestEnvelope
 * @param {string} slotName
 * @return {SlotValue}
 */
export function getSlotValueV2(requestEnvelope : RequestEnvelope, slotName : string) : SlotValue {
    const slot = getSlot(requestEnvelope, slotName);
    if (slot && slot.slotValue) {
        return slot.slotValue;
    }

    return null;
}

/**
 * Returns all the SimpleSlotValues from the given {@link SlotValue}.
 * @param {SlotValue} slotValue
 * @return {SimpleSlotValue[]}
 */
export function getSimpleSlotValues(slotValue : SlotValue) : SimpleSlotValue[] {

    // If the given slotValue type is SimpleSlotValue, directly return slotValue in an array
    if (slotValue.type === 'Simple') {
        return [slotValue as SimpleSlotValue];
    }

    // If the given slotValue type is ListSlotValue
    // Loop all the SlotValues and retrieve simpleSlotValues recursively
    if (slotValue.type === 'List' && slotValue.values) {
        return slotValue.values.reduce(
            (simpleSlotValues, value) => simpleSlotValues.concat(getSimpleSlotValues(value)),
            [],
        );
    }

    return [];
}

/**
 * Retrieves the {@link SupportedInterfaces} from the request.
 *
 * This method returns an object listing each interface that the device supports. For example, if
 * supportedInterfaces includes AudioPlayer, then you know that the device supports streaming audio using the
 * AudioPlayer interface.
 *
 * @param {RequestEnvelope} requestEnvelope
 * @return {SupportedInterfaces}
 */
export function getSupportedInterfaces(requestEnvelope : RequestEnvelope) : SupportedInterfaces {
    return requestEnvelope.context.System.device?.supportedInterfaces ?? {};
}

/**
 * Returns whether the request is a new session.
 *
 * The method retrieves the new value from the input request's session, which indicates if it's a new session or
 * not. More information can be found here :
 * https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#session-object
 *
 * @param requestEnvelope
 */
export function isNewSession(requestEnvelope : RequestEnvelope) : boolean {
    const session : Session = requestEnvelope.session;
    if (session) {
        return session.new;
    }

    throw createAskSdkError(
        'RequestEnvelopeUtils',
        `The provided request doesn't contain a session.`);
}

/**
 * Extracts slots from Dialog Api Request
 *
 *
 * @param {APIRequest} apiRequest
 */
export function generateSlotsFromApiRequest(apiRequest:APIRequest) : {
    [key: string]: Slot;
} {
    if (!apiRequest.slots) {
        return {};
    }
    const intentSlots: {[key : string] : Slot} = {};
    Object.keys(apiRequest.slots).forEach((slotKey:string) => {
        const slotValue: SlotValue = apiRequest.slots[slotKey];
        const intentSlot: Slot = {
            name: slotKey,
            confirmationStatus: 'NONE',
            ...((slotValue as SimpleSlotValue).value ? { value : (slotValue as SimpleSlotValue).value } : {}),
            ...((slotValue as SimpleSlotValue).resolutions ? { resolutions : (slotValue as SimpleSlotValue).resolutions } : {})
        };
        intentSlots[slotKey] = intentSlot;
    });
    return intentSlots;
}