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

/**
 * Payload for ValueSetAct
 */
export interface ValueSetPayload<T> {
    /**
     * The control value.
     */
    value: T;
}

/**
 * Payload for ValueChangedAct
 */
export interface ValueChangedPayload<T> {

    value: T;

    /**
     * The previous control value.
     */
    previousValue: T;
}

/**
 *
 */
export interface InvalidValuePayload<T> {
    value: T;
    reasonCode?: string;
    renderedReason?: string;
}

export interface ProblematicInputValuePayload<T> {
    value: T;
    reasonCode: string;
    renderedReason?: string;
}

export interface RequestValuePayload {
    renderedTarget?: string;
}

export interface RequestChangedValuePayload {
    currentValue: string;
    renderedTarget?: string;
}

export interface RequestValueByListPayload {
    choicesFromActivePage: string[];
    allChoices: string[]
    renderedTarget?: string;
    renderedChoices?: string;
}

export interface RequestChangedValueByListPayload {
    currentValue: string;
    choicesFromActivePage: string[];
    allChoices: string[]
    renderedTarget?: string;
    renderedChoices?: string;
}

export interface LiteralContentPayload {
    promptFragment: string;
    repromptFragment?: string;
}
