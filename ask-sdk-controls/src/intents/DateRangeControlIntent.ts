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
import { AmazonBuiltInSlotType } from './AmazonBuiltInSlotType';
import { BaseControlIntent } from './BaseControlIntent';

/**
 * Slot values conveyed by a DateRangeControlIntent
 */
export interface DateRangeControlIntentSlots {
    feedback?: string,
    action?: string,
    target?: string,
    'AMAZON.DATE'?: string,
    'action.a'?: string,
    'target.a'?: string,
    'AMAZON.DATE.a'?: string,
    'action.b'?: string,
    'target.b'?: string,
    'AMAZON.DATE.b'?: string
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
export function unpackDateRangeControlIntent(intent: Intent): DateRangeControlIntentSlots {
    if (!intent.name.startsWith('DateRangeControlIntent')) {
        throw new Error(`Not an DateRangeControlIntent: ${intent.name}`);
    }

    let feedback: string | undefined;
    let action: string | undefined;
    let target: string | undefined;
    let amazonDate: string | undefined;
    let actionA: string | undefined;
    let targetA: string | undefined;
    let amazonDateA: string | undefined;
    let actionB: string | undefined;
    let targetB: string | undefined;
    let amazonDateB: string | undefined;
    for (const [name, slot] of Object.entries(intent.slots!)) {
        const slotObject = getSlotResolutions(slot);
        const slotValue = slotObject ? slotObject.slotValue : undefined;

        switch (name) {
            case 'feedback': feedback = slotValue; break;
            case 'action': action = slotValue; break;
            case 'target': target = slotValue; break;
            case 'AMAZON.DATE': {
                amazonDate = slotValue;
                break;
            }
            case 'action.a': actionA = slotValue; break;
            case 'target.a': targetA = slotValue; break;
            case 'AMAZON.DATE.a': {
                amazonDateA = slotValue;
                break;
            }
            case 'action.b': actionB = slotValue; break;
            case 'target.b': targetB = slotValue; break;
            case 'AMAZON.DATE.b': {
                amazonDateB = slotValue;
                break;
            }
            case 'head': break;
            case 'tail': break;
            case 'conjunction': break;
            case 'preposition.a': break;
            case 'preposition.b': break;
            default: break;
        }
    }

    return {
        feedback,
        action,
        target,
        'AMAZON.DATE': amazonDate,
        'action.a': actionA,
        'target.a': targetA,
        'AMAZON.DATE.a': amazonDateA,
        'action.b': actionB,
        'target.b': targetB,
        'AMAZON.DATE.b': amazonDateB
    };
}

export function hasOneOrMoreTargets(input: DateRangeControlIntentSlots | null): boolean {
    if (!input) {
        return false;
    }
    if (input.target !== undefined || (input['target.a'] !== undefined && input['target.b'] !== undefined)) {
        return true;
    }
    return false;
}

export function hasOneOrMoreActions(input: DateRangeControlIntentSlots | null): boolean {
    if (!input) {
        return false;
    }
    if (input['action.a'] !== undefined || input['action.b'] !== undefined || input.action !== undefined) {
        return true;
    }
    return false;
}

export function hasOneOrMoreValues(input: DateRangeControlIntentSlots | null): boolean {
    if (!input) {
        return false;
    }
    if (input['AMAZON.DATE.a'] !== undefined || input['AMAZON.DATE.b'] !== undefined || input['AMAZON.DATE'] !== undefined) {
        return true;
    }
    return false;
}

export function validateControlInput(input: DateRangeControlIntentSlots | null): boolean {
    if (!input) {
        return false;
    }
    // priorityRule, when action / target / Amazon.Date exist, no actionA, actionB, no targetA, targetB, no Amazon.Date.a, Amazon.Date.b
    if (input.action !== undefined) {
        if (input["action.a"] !== undefined || input["action.b"] !== undefined) {
            return false;
        }
    }
    if (input.target !== undefined) {
        if (input['target.a'] !== undefined || input['target.b'] !== undefined) {
            return false;
        }
    }

    if (input['AMAZON.DATE'] !== undefined) {
        if (input['AMAZON.DATE.a'] !== undefined || input['AMAZON.DATE.b'] !== undefined) {
            return false;
        }
        if (!(input['target.a'] !== undefined && input['target.b'] !== undefined)) {
            return false;
        }
    }

    // pairRule, if .a exist, then .b must exist. Vice versa
    if ((input['action.a'] !== undefined && input['action.b'] === undefined) || (input['action.b'] !== undefined && input['action.a'] === undefined)) {
        return false;
    }
    if ((input['target.a'] !== undefined && input['target.b'] === undefined) || (input['target.b'] !== undefined && input['target.a'] === undefined)) {
        return false;
    }
    if ((input['AMAZON.DATE.a'] !== undefined && input['AMAZON.DATE.b'] === undefined) || (input['AMAZON.DATE.b'] !== undefined && input['AMAZON.DATE.a'] === undefined)) {
        return false;
    }

    // For DateRangeControlIntent, value must exist
    if (input['AMAZON.DATE'] === undefined && input['AMAZON.DATE.a'] === undefined) {
        return false;
    }
    return true;
}

/**
 * Intent that conveys feedback, action, target and two AMAZON.DATE values.
 */
export class DateRangeControlIntent extends BaseControlIntent {

    /**
     * Create Intent from specification of the slots
     */
    static of(slots: DateRangeControlIntentSlots): Intent {
        return IntentBuilder.of(this.prototype.constructor.name, slots);
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
                name: 'preposition.a',
                type: SharedSlotType.PREPOSITION
            },
            {
                name: 'preposition.b',
                type: SharedSlotType.PREPOSITION
            },
            {
                name: 'conjunction',
                type: SharedSlotType.CONJUNCTION
            },
            {
                name: 'target.a',
                type: SharedSlotType.TARGET
            },
            {
                name: 'AMAZON.DATE.a',
                type: AmazonBuiltInSlotType.DATE
            },
            {
                name: 'target.b',
                type: SharedSlotType.TARGET
            },
            {
                name: 'AMAZON.DATE.b',
                type: AmazonBuiltInSlotType.DATE
            },
            {
                name: 'head',
                type: SharedSlotType.HEAD
            },
            {
                name: 'tail',
                type: SharedSlotType.TAIL
            }
        ];

        return slots;
    }
}
