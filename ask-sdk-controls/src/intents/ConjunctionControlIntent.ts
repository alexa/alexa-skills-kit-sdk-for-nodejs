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

import { getSlotResolutions, IntentBuilder } from '../utils/IntentUtils';
import { SharedSlotType } from '../interactionModelGeneration/ModelTypes';
import { BaseControlIntent } from './BaseControlIntent';

/**
 * Slot values conveyed by a ConjunctionControlIntent
 */
export interface ConjunctionControlIntentSlots {
    feedback?: string,
    action?: string,
    target?: string,
    'action.a'?: string,
    'target.a'?: string,
    'action.b'?: string,
    'target.b'?: string,
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
export function unpackConjunctionControlIntent(intent: Intent): ConjunctionControlIntentSlots {
    if (!intent.name.startsWith('ConjunctionControlIntent')) {
        throw new Error(`Not a compatible intent : ${intent.name}`);
    }

    let feedback: string | undefined;
    let action: string | undefined;
    let target: string | undefined;
    let actionA: string | undefined;
    let targetA: string | undefined;
    let actionB: string | undefined;
    let targetB: string | undefined;

    for (const [name, slot] of Object.entries(intent.slots!)) {
        const slotObject = getSlotResolutions(slot);
        const slotValue = slotObject ? slotObject.slotValue : undefined;
        switch (name) {
            case 'feedback': feedback = slotValue; break;
            case 'action': action = slotValue; break;
            case 'target': target = slotValue; break;
            case 'action.a': actionA = slotValue; break;
            case 'target.a': targetA = slotValue; break;
            case 'action.b': actionB = slotValue; break;
            case 'target.b': targetB = slotValue; break;

            case 'head': break;
            case 'tail': break;
            case 'preposition': break;
            case 'conjunction': break;
            default: throw new Error('not handled');
        }
    }

    return {
        feedback,
        action,
        target,
        'action.a': actionA,
        'target.a': targetA,
        'action.b': actionB,
        'target.b': targetB,
    };
}

// TODO: refactor: move these to be members of the ConjunctionControlIntentSlots type

export function hasOneOrMoreTargets(input: ConjunctionControlIntentSlots | null): boolean {
    if (!input) {
        return false;
    }
    if (input.target !== undefined || input['target.a'] !== undefined || input['target.b'] !== undefined) {
        return true;
    }
    return false;
}


export function hasOneOrMoreActions(input: ConjunctionControlIntentSlots | null): boolean {
    if (!input) {
        return false;
    }
    if (input['action.a'] !== undefined || input['action.b'] !== undefined || input.action !== undefined) {
        return true;
    }
    return false;
}

export function areConjunctionIntentSlotsValid(input: ConjunctionControlIntentSlots | null): boolean {
    if (!input) {
        return false;
    }
    // priorityRule, when action / target , no actionA, actionB, no targetA, targetB
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

    // pairRule, if .a exist, then .b must exist. Vice versa
    if ((input['action.a'] !== undefined && input['action.b'] === undefined) || (input['action.b'] !== undefined && input['action.a'] === undefined)) {
        return false;
    }
    if ((input['target.a'] !== undefined && input['target.b'] === undefined) || (input['target.b'] !== undefined && input['target.a'] === undefined)) {
        return false;
    }

    // when only one target, don't allow two action
    if (input.target !== undefined && input["action.a"] !== undefined && input["action.b"] !== undefined) {
        return false;
    }

    // only target is not allowed
    if (input.action === undefined && input["action.a"] === undefined) {
        return false;
    }

    return true;
}

export interface ActionAndTask {
    action: string,
    target: string,
}

export function generateActionTaskPairs(input: ConjunctionControlIntentSlots): ActionAndTask[] {
    const inputs: ActionAndTask[] = [];
    const inputA: ActionAndTask = {
        action: '',
        target: '',
    };

    const inputB: ActionAndTask = {
        action: '',
        target: '',
    };

    if (hasOneOrMoreActions(input)) {
        // 1. Action exist
        if (input.action !== undefined) {
            inputA.action = input.action;
            inputB.action = input.action;
        } else { // two action
            inputA.action = input['action.a']!;
            inputB.action = input['action.b']!;
        }
        if (hasOneOrMoreTargets(input)) {
            // 1.1 Target exist
            if (input.target !== undefined) {
                inputA.target = input.target;
                inputB.target = input.target;
            } else {
                inputA.target = input['target.a']!;
                inputB.target = input['target.b']!;
            }
        }

    }
    // remove duplicate
    if (inputA.action === inputB.action && inputA.target === inputB.target) {
        inputs.push(inputA);
    } else {
        inputs.push(inputA);
        inputs.push(inputB);
    }

    return inputs;
}

/**
 * Intent that conveys feedback, up to two actions, and up two targets.
 *
 * This intent is a generalization of GeneralControlIntent that can convey more
 * information. It is used to convey the intent of utterances such as
 * "Change both the start and end date"
 */
export class ConjunctionControlIntent extends BaseControlIntent {

    /**
     * Create Intent from specification of the slots
     */
    static of(slots: ConjunctionControlIntentSlots): Intent {
        return IntentBuilder.of(this.prototype.constructor.name, slots);
    }

    // tsDoc: see BaseControlIntent
    generateIntent(): v1.skill.interactionModel.Intent {
        return {
            name: this.name,
            slots: this.generateSlots(),
            samples: []
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
                name: 'conjunction',
                type: SharedSlotType.CONJUNCTION
            },
            {
                name: 'target.a',
                type: SharedSlotType.TARGET
            },
            {
                name: 'target.b',
                type: SharedSlotType.TARGET
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