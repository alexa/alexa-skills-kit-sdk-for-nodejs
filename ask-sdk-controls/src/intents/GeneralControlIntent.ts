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
 * Slot values conveyed by a GeneralControlIntent
 */
export interface GeneralControlIntentSlots {
    feedback?: string,
    action?: string,
    target?: string,
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
export function unpackGeneralControlIntent(intent: Intent): GeneralControlIntentSlots {
    if (!intent.name.startsWith('GeneralControlIntent')) {
        throw new Error(`Not a compatible intent : ${intent.name}`);
    }

    let feedback: string | undefined;
    let action: string | undefined;
    let target: string | undefined;

    for (const [name, slot] of Object.entries(intent.slots!)) {
        const slotObject = getSlotResolutions(slot);
        const slotValue = slotObject ? slotObject.slotValue : undefined;

        switch (name) {
            case 'feedback': feedback = slotValue; break;
            case 'action': action = slotValue; break;
            case 'target': target = slotValue; break;
            case 'head': break;
            case 'tail': break;

            default: throw new Error('not handled');
        }
    }

    return {
        feedback,
        action,
        target,
    };
}

/**
 * Intent that conveys feedback, action, and target but no value.
 *
 * This general-purpose intent conveys the intent for utterances such as:
 * - "The time"
 * - "Change the date"
 * - "Yes, that one"
 * - "No, change the event date"
 */
export class GeneralControlIntent extends BaseControlIntent {

    /**
     * Create Intent from specification of the slots
     */
    static of(slots: GeneralControlIntentSlots): Intent {
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
                type: SharedSlotType.FEEDBACK,
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