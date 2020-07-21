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

import { Intent, Slot } from "ask-sdk-model";

/**
 * Utility to construct intent objects for testing.
 */
export class IntentBuilder {

    // TODO: bug/limitation: also include EntityResolution information.
    /**
     * Create an Intent object from a name and a set of slot values.
     *
     * - Multi-value slots can be provided as an array of values.
     * @param name - Intent name
     * @param slotValues - Slot value map
     */
    static of(name: string, slotValues?: { [k: string]: any }): Intent {
        const intent: Intent = {
            name,
            confirmationStatus: 'NONE',
            slots: {}
        };

        for (const prop of Object.entries(slotValues ?? {})) {
            const name = prop[0];
            const value = prop[1];

            if (Array.isArray(value)){
                if (value.length === 0){
                    throw new Error('Slot of empty-array is not supported');
                }

                // Multi-value slot
                intent.slots![name] = {
                    name,
                    slotValue: {
                        type: 'List',
                        values: value.map(
                            item=>({
                                type: 'Simple',
                                value: item
                            })
                        )

                    },
                    confirmationStatus: 'NONE'
                } as Slot;

            }
            else {
                // Single-value slot
                intent.slots![name] = {
                    name,
                    value: value !== undefined ? value : '',
                    confirmationStatus: 'NONE'
                };
            }

        }

        return intent;
    }
}

/**
 * Represents a single slot value and whether it was an ER_MATCH.
 */
export interface SlotResolutionValue {
    slotValue: string,
    isEntityResolutionMatch: boolean
}

// TODO: API: retire this class once SimplifiedMVSIntent is covering all cases successfully.

/**
 * Simplified representation of the data contained in a full Intent object.
 */
export class SimplifiedIntent {
    public readonly name: string;
    public readonly slotResolutions: { [k: string]: SlotResolutionValue | undefined };
    constructor(name: string, slotResolutions: { [k: string]: SlotResolutionValue | undefined }) {
        this.name = name;
        this.slotResolutions = slotResolutions;
    }

    /**
     * Factory method to create a SimplifiedIntent from an Intent.
     * @param intent - Intent name
     */
    public static fromIntent(intent: Intent): SimplifiedIntent {
        const slotResolutions: { [k: string]: SlotResolutionValue | undefined } = {};

        if (intent.slots) {
            for (const [name, slot] of Object.entries(intent.slots)) {
                const slotObject = getSlotResolutions(slot);
                if (Array.isArray(slotObject)){
                    throw new Error("Slot is multi-valued.  Use SimplifiedMVSIntent");
                }
                else {
                    slotResolutions[name] = slotObject !== undefined ? slotObject : undefined;
                }

            }
        }
        return new SimplifiedIntent(intent.name, slotResolutions);
    }

    // tsDoc - see Object
    public toString(): string {
        return JSON.stringify(this);
    }
}

// TODO:retire this func once SimplifiedMVSIntent is covering all cases successfully.
/**
 * If there is an ER-Success, this returns the canonical value id of the first match resolution along with
 * isEntityResolutionMatch: boolean to indicate the status of ER_SUCCESS_MATCH
 * Otherwise this returns the object of literal slot value and isEntityResolutionMatch set to false.
 *
 * @param slot - Slot
 */
export function getSlotResolutions(slot: Slot | undefined): SlotResolutionValue | undefined {
    if (slot === undefined || slot.value === undefined || slot.value.length === 0) {
        return undefined;
    }
    // regular single-value handling
    if (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) {
        for (const resolutionsPerAuthority of slot.resolutions.resolutionsPerAuthority) {
            if (resolutionsPerAuthority.status.code === 'ER_SUCCESS_MATCH') {
                return { slotValue: resolutionsPerAuthority.values[0]!.value.id, isEntityResolutionMatch: true };
            }
        }
    }
    return { slotValue: slot.value!, isEntityResolutionMatch: false };
}



// ---- MVS support ----

/**
 * Simplified representation of the data contained in a full Intent object.
 *
 * - supports Multi-value-slots
 */
export class SimplifiedMVSIntent {
    public readonly name: string;
    public readonly slotResolutions: { [k: string]: SlotResolutionValue | SlotResolutionValue[] | undefined };
    constructor(name: string, slotResolutions: { [k: string]: SlotResolutionValue | SlotResolutionValue[] | undefined }) {
        this.name = name;
        this.slotResolutions = slotResolutions;
    }

    /**
     * Factory method to create a SimplifiedMVSIntent from an Intent.
     * @param intent - Intent
     */
    public static fromIntent(intent: Intent): SimplifiedMVSIntent {
        const slotResolutions: { [k: string]: SlotResolutionValue | SlotResolutionValue[] | undefined } = {};

        if (intent.slots) {
            for (const [name, slot] of Object.entries(intent.slots)) {
                const slotObject = getMVSSlotResolutions(slot);
                slotResolutions[name] = slotObject !== undefined ? slotObject : undefined;
            }
        }
        return new SimplifiedMVSIntent(intent.name, slotResolutions);
    }

    // tsDoc - see Object
    public toString(): string {
        return JSON.stringify(this);
    }
}


/**
 * If there is an ER-Success, this returns the canonical value id of the first match resolution along with
 * isEntityResolutionMatch: boolean to indicate the status of ER_SUCCESS_MATCH
 * Otherwise this returns the object of literal slot value and isEntityResolutionMatch set to false.
 *
 * @param slot - Slot
 */
export function getMVSSlotResolutions(slot: Slot | undefined): SlotResolutionValue | SlotResolutionValue[] | undefined {
    if (slot === undefined) {
        return undefined;
    }

    {
        // handling for MVS which isn't in ask-sdk yet.
        const slotValue: any = (slot as any).slotValue;
        // eslint-disable-next-line no-empty
        if (slotValue !== undefined && slotValue.type === 'List' && slotValue.values.length > 0){
            const slotValuesAsSlots = slotValue.values as Slot[];
            const values = slotValuesAsSlots.map(slot => {
                if (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) {
                    for (const resolutionsPerAuthority of slot.resolutions.resolutionsPerAuthority) {
                        if (resolutionsPerAuthority.status.code === 'ER_SUCCESS_MATCH') {
                            return { slotValue: resolutionsPerAuthority.values[0]!.value.id, isEntityResolutionMatch: true };
                        }
                        else {
                            return { slotValue: slot.value ?? "", isEntityResolutionMatch: false };
                        }
                    }
                    return { slotValue: slot.value ?? "", isEntityResolutionMatch: false };
                }
                else {
                    return { slotValue: slot.value ?? "", isEntityResolutionMatch: false };
                }});

            return values;
        }
    }

    if (slot.value === undefined || slot.value.length === 0) {
        return undefined;
    }

    // regular single-value handling
    if (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) {
        for (const resolutionsPerAuthority of slot.resolutions.resolutionsPerAuthority) {
            if (resolutionsPerAuthority.status.code === 'ER_SUCCESS_MATCH') {
                return { slotValue: resolutionsPerAuthority.values[0]!.value.id, isEntityResolutionMatch: true };
            }
        }
    }
    return { slotValue: slot.value!, isEntityResolutionMatch: false };
}

