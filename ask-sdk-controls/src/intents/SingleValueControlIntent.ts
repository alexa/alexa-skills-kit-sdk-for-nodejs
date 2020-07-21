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

import { Intent } from "ask-sdk-model";
import { v1 } from 'ask-smapi-model';
import { SharedSlotType } from '../interactionModelGeneration/ModelTypes';
import { getSlotResolutions, IntentBuilder } from '../utils/IntentUtils';
import { BaseControlIntent } from './BaseControlIntent';


/**
 * Slot values conveyed by a SingleValueControlIntent
 */
export interface SingleValueControlIntentSlots {
    feedback?: string;
    action?: string;
    target?: string;
    [key: string]: string | undefined;
}

export interface SingleValuePayload {
    feedback?: string;
    action?: string;
    target?: string;
    valueStr: string;
    valueType?: string;
    erMatch?: boolean;
}

/**
 * Unpacks the complete intent object into a simpler representation.
 *
 * Note re "empty slots":
 * - Slots in the intent with no value appear in the intent object as "".
 *   However, these are unpacked as **`undefined`** to be more explicit and ease
 *   the implementation of predicates.
 * @param intent - Intent
 */
export function unpackSingleValueControlIntent(intent: Intent): SingleValuePayload {
    if (!intent.name.endsWith('ControlIntent')) {
        throw new Error(`Not a ControlIntent: ${intent.name}`);
    }

    let action: string | undefined;
    let feedback: string | undefined;
    let target: string | undefined;
    let valueStr: string | undefined;
    let valueType: string | undefined;
    let erMatch: boolean | undefined;

    for (const [name, slot] of Object.entries(intent.slots!)) {
        const slotObject = getSlotResolutions(slot);
        const slotValue = slotObject !== undefined ? slotObject.slotValue : undefined;

        switch (name) {
            case 'action': action = slotValue; break;
            case 'feedback': feedback = slotValue; break;
            case 'target': target = slotValue; break;
            case 'head': break;
            case 'tail': break;
            case 'preposition': break;
            default:
                // did we already capture a value?
                if (valueType !== undefined) {
                    throw new Error('a SingleValueControlIntent should only have one value slot');
                }
                // treat it as a slot whose name is an NLU slot type.
                valueStr = slotValue;
                valueType = name;
                erMatch = slotObject !== undefined ? slotObject.isEntityResolutionMatch : undefined;
        }
    }

    if (valueStr === undefined){
        throw new Error(`SingleValueControlIntent did not have value slot filled.  This should have mapped to GeneralControlIntent. intent: ${JSON.stringify(intent)}`);
    }

    return {
        feedback,
        action,
        target,
        valueStr,
        valueType,
        erMatch
    };
}

/**
 * Intent that conveys feedback, action, target and an AMAZON.Ordinal value
 *
 * The value slot will be named according to the Slot type.
 * - For example `{'AMAZON.NUMBER': '2'}` or  `{ 'AMAZON.Ordinal': 'first' }`
 *
 * Every sample utterance for a SingleValueControlIntent includes the value
 * slot.  Utterances that do not include a value slot are handled by
 * `GeneralControlIntent`.
 *
 * Limitations
 *  - `AMAZON.SearchQuery` cannot be used due to restrictions in NLU. Custom
 *    intents should be defined instead.
 */
export class SingleValueControlIntent extends BaseControlIntent {
    valueSlotType: string;

    constructor(valueSlotType: string) {
        super();

        if (valueSlotType === 'AMAZON.SearchQuery'){
            throw new Error('AMAZON.SearchQuery cannot be used with SingleValueControlIntent due to the special rules regarding its use. '
             + 'Specifically, utterances that include SearchQuery must have a carrier phrase and not be comprised entirely of slot references.');
        }

        this.valueSlotType = valueSlotType;
        this.name = SingleValueControlIntent.intentName(valueSlotType);
    }

    /**
     * Generates the intent name of a specialized `SingleValueControlIntent`.
     *
     * Example:
     * - The intent name for a `SingleValueControlIntent` that conveys an
     *   `AMAZON.NUMBER` is `AMAZON_NUMBER_ValueControlIntent`.
     *
     * @param slotTypeId - Specific slot type id.
     */
    static intentName(slotTypeId: string){
        return `${slotTypeId}_ValueControlIntent`.replace('.', '_');
    }

    /**
     * Create Intent from specification of the slots
     *
     * Usage:
     *  * the value should be provided as a property with name = <SlotType>
     *
     * Examples:
     * - AMAZON.NUMBER:
     * ```
     * {
     *    name: AMAZON_NUMBER_ValueControlIntent
     *    slots: { target: 'count', 'AMAZON.NUMBER': '2' }
     *    confirmationStatus: 'NONE'
     * }
     * ```
     * - AMAZON.Ordinal:
     * ```
     * {
     *    name: AMAZON_ORDINAL_ValueControlIntent
     *    slots: { action: 'set', 'AMAZON.Ordinal': 'first'}
     *    confirmationStatus: 'NONE'
     * }
     * ```
     */
    static of(slotType: string, slots: SingleValueControlIntentSlots): Intent {
        return IntentBuilder.of(
            SingleValueControlIntent.intentName(slotType), slots
        );
    }

    // tsDoc: see BaseControlIntent
    generateIntent(): v1.skill.interactionModel.Intent {
        return {
            name: this.name,
            slots: this.generateSlots(),
            samples: [],
        };
    }


    private generateSlots(): v1.skill.interactionModel.SlotDefinition[] {
        const slots: v1.skill.interactionModel.SlotDefinition[] = [
            {
                name: 'feedback',
                type: SharedSlotType.FEEDBACK
            },
            {
                name: 'action',
                type: SharedSlotType.ACTION
            },
            {
                name: 'target',
                type: SharedSlotType.TARGET
            },
            {
                name: 'preposition',
                type: SharedSlotType.PREPOSITION
            },
            {
                name: 'head',
                type: SharedSlotType.HEAD
            },
            {
                name: 'tail',
                type: SharedSlotType.TAIL
            },
            {
                name: `${this.valueSlotType}`,
                type: `${this.valueSlotType}`
            }
        ];

        return slots;
    }
}
