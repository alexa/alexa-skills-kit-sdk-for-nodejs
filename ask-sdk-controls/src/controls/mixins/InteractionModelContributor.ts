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

import { ControlInteractionModelGenerator } from '../../interactionModelGeneration/ControlInteractionModelGenerator';
import { ModelData } from '../../interactionModelGeneration/ModelTypes';

/**
 * Optional interface for Controls that wish to customize Interaction Model.
 */
export interface InteractionModelContributor {

    /**
     * A list of Slot Value IDs for the "Target" slot type.
     *
     * Framework behavior:
     * - The Interaction Model generator will check that the slot value IDs
     *   exist in the Target Type and add them if missing. The added
     *   slot value definition will not have any synonyms defined - these must
     *   be added manually.
     */
    getTargetIds(): string[];

    /**
     * Updates the interaction model.
     *
     * Usage:
     * - Controls should add any content to the interaction model that they rely
     *   on.  In particular, intents, slot types and slot values.
     * - The imData parameter contains localized information for all known slot
     *   types and intents. The `updateInteractionModel()` method should use
     *   this to obtain the raw data that is added to the generator.
     *
     * @param generator - Interaction Model generator
     * @param imData - Localized data for all known intents and slots.
     *
     */
    updateInteractionModel(generator: ControlInteractionModelGenerator, imData: ModelData): void;
}

/**
 * Type-guard for the InteractionModelContributor interface.
 *
 * @param arg - Object to test
 * @returns `true` if the argument implements the InteractionModelContributor
 * interface.
 */
export function implementsInteractionModelContributor(arg: any): arg is InteractionModelContributor {
    return typeof arg.getTargetIds === 'function' && typeof arg.updateInteractionModel === 'function';
}