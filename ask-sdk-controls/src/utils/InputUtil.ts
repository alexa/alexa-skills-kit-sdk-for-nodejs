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

import { Intent, IntentRequest, interfaces } from 'ask-sdk-model';
import { Strings as $ } from "../constants/Strings";
import { ControlInput } from '../controls/ControlInput';
import { AmazonIntent } from '../intents/AmazonBuiltInIntent';
import { GeneralControlIntent, unpackGeneralControlIntent } from '../intents/GeneralControlIntent';
import { SingleValueControlIntent, unpackSingleValueControlIntent } from '../intents/SingleValueControlIntent';

/**
 * Utilities to assist with input handling.
 */
export namespace InputUtil {

    /**
     * Test and assert if an object looks like an Intent.
     * (user-defined type guard)
     */
    export function isIntentShape(x: any): x is Intent {
        return (x.name !== undefined && x.confirmationStatus);
    }


    /**
     * Test if the input is a LaunchRequest.
     * @param input - Input
     */
    export function isLaunchRequest(input: ControlInput): boolean {
        return input.request.type === 'LaunchRequest';
    }

    /**
     * Test if the input is a SessionEndedRequest.
     * @param input - Input
     */
    export function isSessionEndedRequest(input: ControlInput): boolean {
        return input.request.type === 'SessionEndedRequest';
    }

    /**
     * Test if the input is an IntentRequest.
     * @param input - Input
     */
    export function isIntent(input: ControlInput, intentName: string): boolean {
        return input.request.type === 'IntentRequest' && input.request.intent.name === intentName;
    }

    /**
     * Test if the input is a SingleValueControlIntent for the provided slotType.
     * @param input - Input
     */
    export function isSingleValueControlIntent(input: ControlInput, slotType: string): boolean {
        return input.request.type === 'IntentRequest' && input.request.intent.name === SingleValueControlIntent.intentName(slotType);
    }

    /**
     * Test if the input is an AMAZON.FallbackIntent.
     * @param input - Input
     */
    export function isFallbackIntent(input: ControlInput): boolean {
        return input.request.type === 'IntentRequest' && input.request.intent.name === 'AMAZON.FallbackIntent';
    }

    /**
     * Test if the input is an Alexa.Presentation.APL.UserEvent and has arguments.
     * @param input - Input
     */
    export function isAPLUserEventWithArgs(input: ControlInput): boolean {
        return input.request.type === 'Alexa.Presentation.APL.UserEvent' && input.request.arguments !== undefined && input.request.arguments.length > 0;
    }

    /**
     * Test if the input is an Alexa.Presentation.APL.UserEvent with a first
     * argument equal to the provided control ID.
     * @param input - Input
     */
    export function isAPLUserEventWithMatchingControlId(input: ControlInput, controlId: string): boolean {
        return isAPLUserEventWithArgs(input) && ((input.request as interfaces.alexa.presentation.apl.UserEvent).arguments![0] === controlId);
    }

    /**
     * Test if the feedback is 'builtin_affirm'
     * @param feedback - Feedback slot value ID
     */
    // TODO: naming: improve name
    export function feedbackIsTrue(feedback: string | undefined): boolean {
        return (feedback === $.Feedback.Affirm);
    }

    /**
     * Test if the feedback is 'builtin_disaffirm'
     * @param feedback - Feedback slot value ID
     */
    // TODO: naming: improve name
    export function feedbackIsFalse(feedback: string | undefined): boolean {
        return (feedback === $.Feedback.Disaffirm);
    }


    /**
     * Test if the feedback is undefined
     * @param feedback - Feedback slot value ID
     */
    export function feedbackIsUndefined(feedback: string | undefined): boolean {
        return (feedback === undefined);
    }

    /**
     * Test if the feedback matches one of the provided identifiers, or is undefined.
     * @param feedback - Feedback slot value
     * @param feedbackIds - Feedback slot value IDs to match against
     */
    export function feedbackIsMatchOrUndefined(feedback: string | undefined, feedbackIds: string[]): boolean {
        return slotIsUndefinedOrMatch(feedback, feedbackIds);
    }

    /**
     * Test if the slot value matches one of the provided identifiers, or is undefined.
     * @param slotValue - Slot value ID
     * @param expectedValues - Slot value IDs to match against
     */
    export function slotIsUndefinedOrMatch(slotValue: string | undefined, expectedValues: string[]): boolean {
        return slotValue === undefined || expectedValues.includes(slotValue);
    }

    /**
     * Test if the action matches one of the provided identifiers, or is undefined.
     * @param action - Action slot value ID
     * @param expectedValues - Action slot value IDs to match against
     */
    export function actionIsSetOrUndefined(action: string | undefined, expectedValues: string[]): boolean {
        return slotIsUndefinedOrMatch(action, expectedValues);
    }

    /**
     * Test if the action is defined and matches one of the provided identifiers.
     * @param action - Action slot value ID
     * @param expectedValues - Action slot value IDs to match against
     */
    export function actionIsMatch(action: string | undefined, expectedValues: string[]): boolean {
        return action !== undefined && expectedValues.includes(action);
    }

    /**
     * Test if the action is undefined.
     * @param action - Action slot value ID
     */
    export function actionIsUndefined(action: string | undefined): boolean {
        return action === undefined;
    }

    /**
     * Test if the target is defined and matches one of the provided identifiers.
     * @param target - Target slot value ID
     * @param targetIds - Target slot value IDs to match against
     */
    export function targetIsMatch(target: string | undefined, targetIds: string[]): boolean {
        return target !== undefined && targetIds.includes(target);
    }

    /**
     * Test if the feedback is undefined.
     * @param target - Target slot value ID
     */
    export function targetIsUndefined(target: string | undefined): boolean {
        return target === undefined;
    }

    /**
     * Test if the target matches one of the provided identifiers, or is undefined.
     * @param target - Target slot value ID
     * @param targetIds - Target slot value IDs to match against
     */
    export function targetIsMatchOrUndefined(target: string | undefined, targetIds: string[]): boolean {
        return slotIsUndefinedOrMatch(target, targetIds);
    }

    /**
     * Test if the action matches one of the provided identifiers, or is undefined.
     * @param action - Action slot value ID
     * @param expectedValues - Action slot value IDs to match against
     */
    export function actionIsMatchOrUndefined(action: string | undefined, actionIds: string[]): boolean {
        return slotIsUndefinedOrMatch(action, actionIds);
    }

    /**
     * Test if the valueType is defined and matches the provided identifier.
     * @param valueType - ValueType slot value ID
     * @param expectedValueType - ValueType slot value ID to match against
     */
    export function valueTypeMatch(valueType: string | undefined, expectedValueType: string): boolean {
        return valueType !== undefined && valueType === expectedValueType;
    }

    /**
     * Test if the valueType is undefined.
     * @param valueType - ValueType slot value ID
     */
    export function valueTypeIsUndefined(valueType: string | undefined): boolean {
        return valueType === undefined;
    }

    /**
     * Test if the value is defined.
     *
     * A value of '?' is interpreted as being equal to undefined.  (A value of
     * '?' is produced by NLU when slot elicitation is used but the response
     * cannot be understood.)
     * @param value - Value
     */
    export function valueStrDefined(value: string | undefined): boolean {
        return value !== undefined && value !== '?';
    }

    /**
     * Test if the value is undefined.
     *
     * A value of '?' is interpreted as being equal to undefined.  (A value of
     * '?' is produced by NLU when slot elicitation is used but the response
     * cannot be understood.)
     * @param value - Value
     */
    export function valueStrIsUndefined(value: string | undefined): boolean {
        return value === undefined || value === '?';
    }

    /**
     * Test if the input is equivalent to simply saying "yes".
     *
     * @param input - Input
     *
     * @returns true if the input is:
     * - `AMAZON.YesIntent`, or,
     * - A `GeneralControlIntent` with `feedback = builtin_affirm` and no other
     *   filled.
     */
    export function isBareYes(input: ControlInput) {
        if (input.request.type !== 'IntentRequest') {
            return false;
        }
        else if (input.request.intent.name === AmazonIntent.YesIntent) {
            return true;
        }
        else if (input.request.intent.name === GeneralControlIntent.name) {
            const { feedback, action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
            if (feedback === $.Feedback.Affirm && action === undefined && target === undefined) {
                return true;
            }
        }
        return false;
    }

    /**
     * Test if the input is equivalent to simply saying "no".
     *
     * @param input - Input
     *
     * @returns true if the input is:
     * - `AMAZON.NoIntent`, or,
     * - A `GeneralControlIntent` with `feedback = builtin_disaffirm` and no other
     *   filled.
     */
    export function isBareNo(input: ControlInput) {
        if (input.request.type !== 'IntentRequest') {
            return false;
        }
        else if (input.request.intent.name === AmazonIntent.NoIntent) {
            return true;
        }
        else if (input.request.intent.name === GeneralControlIntent.name) {
            const { feedback, action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
            if (feedback === $.Feedback.Disaffirm && action === undefined && target === undefined) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extracts the value and erMatch from a SingleValueControlIntent
     * @param input - Input
     */
    export function getValueResolution(input: ControlInput): { valueStr: string, erMatch: boolean } {
        const { valueStr, erMatch } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
        return { valueStr: valueStr!, erMatch: erMatch! };
    }
}
