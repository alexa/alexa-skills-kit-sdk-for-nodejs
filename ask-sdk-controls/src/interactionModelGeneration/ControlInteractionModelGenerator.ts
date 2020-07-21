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
import { v1 } from 'ask-smapi-model';
import i18next from 'i18next';
import _ from 'lodash';
import { ControlManager } from '../controls/ControlManager';
import { BaseControlIntent } from '../intents/BaseControlIntent';
import { ConjunctionControlIntent } from '../intents/ConjunctionControlIntent';
import { DateRangeControlIntent } from '../intents/DateRangeControlIntent';
import { GeneralControlIntent } from '../intents/GeneralControlIntent';
import { OrdinalControlIntent } from '../intents/OrdinalControlIntent';
import { SingleValueControlIntent } from '../intents/SingleValueControlIntent';
import { Logger } from '../logging/Logger';
import { InteractionModelGenerator } from './InteractionModelGenerator';
import { IntentUtterances, ModelData, SharedSlotType } from './ModelTypes';

import Intent = v1.skill.interactionModel.Intent;
import DialogIntent = v1.skill.interactionModel.DialogIntents;
import Prompt = v1.skill.interactionModel.Prompt;
import InteractionModelData = v1.skill.interactionModel.InteractionModelData;
import SlotType = v1.skill.interactionModel.SlotType;

const log = new Logger('AskSdkControls:ControlInteractionModelGenerator');

const dummyPrompts: Prompt[] = [
    {
        id: "Slot.Validation.564246223579.1467418044248.678461230495",
        variations: [
            {
                type: "PlainText",
                value: "This prompt is included to ensure there is a dialog model present. It is not used by skills."
            }
        ]
    }
];

/**
 * Interaction model generator for skills that use the Controls Framework
 *
 * This class extends `InteractionModelGenerator` with Controls-specific functionality.
 */
export class ControlInteractionModelGenerator extends InteractionModelGenerator {
    public targetSlotIds: Set<string> = new Set();

    /**
     * Update the interaction model for a controlManager
     *
     * Behavior:
     * - Calls `controlManager.buildInteractionModel` to update the IM And add
     *   dummy dialogModel if SimpleControlIntent is used in control
     *
     * Usage: If the ControlManager is lacking data for the chosen locale, the
     * appropriate data should be add by user themselves User would need to
     * update the ModelDataMap instance and provide it to ControlManager's
     * constructor
     * @param controlManager - Control manager
     */
    buildCoreModelForControls(controlManager: ControlManager): ControlInteractionModelGenerator {

        controlManager.buildInteractionModel(this);
        ensureDialogModel(this, this.intents);
        return this;
    }

    // tsDoc - see InteractionModelGenerator
    build(): InteractionModelData {
        const interactionModelData: InteractionModelData = super.build();
        validateTargetSlots(interactionModelData, this.targetSlotIds);

        return interactionModelData;
    }

    /**
     * Add AMAZON.YesIntent and AMAZON.NoIntent to the interaction model.
     */
    addYesAndNoIntents(): ControlInteractionModelGenerator {
        this.addIntent({ name: 'AMAZON.YesIntent' });
        this.addIntent({ name: 'AMAZON.NoIntent' });
        return this;
    }

    /**
     * Adds the information from a ControlIntent to the interaction model.
     *
     * @param controlIntent - ControlIntent that extends `BaseControlIntent`
     * @param controlIMData - Localization data for built-ins.
     */
    addControlIntent(controlIntent: BaseControlIntent, controlIMData: ModelData): this {
        // used to record all present basic slotTypes
        const presentSlotTypesSet = new Set<string>();

        const controlIntentUtterances = generateCompleteIntent(controlIntent, controlIMData);
        this.addIntents(controlIntentUtterances);

        controlIntentUtterances.slots?.map((slot) => {
            presentSlotTypesSet.add(slot.name!);
        });

        // Loop all SharedSlotTypes
        // if it present in the set, add slotTypes to IM
        for (const slotTypeName of Object.values(SharedSlotType)) {
            // The slotType get from ControlIntent is just a skeleton without values
            // The complete definition should be found in controlIMData
            if (presentSlotTypesSet.has(slotTypeName)) {
                const slotTypes = controlIMData.slotTypes.find((slotType) => slotType.name === slotTypeName);
                if (!slotTypes) {
                    throw new Error(`SlotType ${slotTypeName} doesn't have values registered in the ModelData.`);
                }
                this.addOrMergeSlotTypes(slotTypes);
            }
        }
        return this;
    }
}

// Convert Intent to DialogIntent
function buildDialogIntent(intent: Intent): DialogIntent {
    const dialogIntent = _.cloneDeep(intent);
    delete dialogIntent.samples;
    (dialogIntent as DialogIntent).delegationStrategy = 'SKILL_RESPONSE';

    return dialogIntent;
}

/**
 * Generate complete intent with intent samples attached
 * @param controlIntent - ControlIntent
 * @param controlIMData - Localization data
 */
function generateCompleteIntent(controlIntent: BaseControlIntent, controlIMData: ModelData): Intent {

    // Special logic for SingleValueControlIntent
    if (controlIntent.name.includes('ValueControlIntent')) {
        return handleValueControlIntent(controlIntent as SingleValueControlIntent, controlIMData);
    }

    const intent: Intent = controlIntent.generateIntent();
    const samples: string[] | undefined = controlIMData.intentValues.find((intentValue) => intentValue.name === controlIntent.name)?.samples;

    if (samples === undefined) {
        throw new Error(`${controlIntent.name} doesn't have samples registered in the ModelData.`);
    }

    intent.samples = samples;

    return intent;
}

// special handling for ValueControlIntent
function handleValueControlIntent(controlIntent: SingleValueControlIntent, controlIMData: ModelData): Intent {
    const intent: Intent = controlIntent.generateIntent();
    const samples: string[] | undefined = controlIMData.intentValues.find((intentValue) => intentValue.name === SingleValueControlIntent.name)?.samples;
    if (samples === undefined) {
        throw new Error('Can not find SingleValueControlIntent samples in ModelData');
    }
    const slotType: string = controlIntent.valueSlotType;
    const replacement: string = `{${slotType}}`;
    intent.samples = intent.samples || [];
    samples.map((sample) => {
        intent.samples!.push(sample.replace('[[valueSlotType]]', replacement));
    });
    return intent;
}

// This method adds a dummy dialogModel so that Dialog directives such as Dialog.ElicitSlotDirective can be used.
// 1. Add dummy validation rule to SimpleControlIntent' target slot
// 2. Add dummy prompt
function ensureDialogModel(generator: ControlInteractionModelGenerator, intents: Intent[]): void {

    // Since one dummy validation is enough to meet slotElicitation requirement
    // And all the builtin controls integrate with the SimpleControlIntent
    // Thus add this dummy validation to the first target type slotType
    const simpleControlIntent = intents.find((intent) => intent.name === GeneralControlIntent.name);
    if (!simpleControlIntent) {
        return;
    }
    const dialogSimpleControlIntent = buildDialogIntent(simpleControlIntent);
    generator.addDialogIntents(dialogSimpleControlIntent);

    const targetSlot = dialogSimpleControlIntent.slots?.find((slot) => slot.type === 'target');
    if (targetSlot === undefined) {
        throw new Error('target slot is not present in SimpleControlIntent');
    }
    addDummyValidationRule(targetSlot);
    generator.addPrompts(...dummyPrompts);
}

/**
 *  Add dummy dialog validation rule to the input slot.
 * @param targetSlot - Target slot
 */
function addDummyValidationRule(targetSlot: v1.skill.interactionModel.DialogSlotItems): void {
    targetSlot.elicitationRequired = false;
    targetSlot.confirmationRequired = false;
    // The particular dummy model comprises a single slot-validation that will always pass.
    targetSlot.validations = [{
        type: "isNotInSet",
        prompt: "Slot.Validation.564246223579.1467418044248.678461230495",
        values: [
            "This prompt is included to ensure there is a dialog model present. It is not used by skills."
        ]
    }];
}

/**
 * Validate the target slotIds in Controls are present in InteractionModel.
 * @param interactionModel - Interaction model
 * @param targetSlotIDs - Target slot IDs
 */
function validateTargetSlots(interactionModel: InteractionModelData, targetSlotIds: Set<string>): void {
    const presentSlotTypes: SlotType[] | undefined = interactionModel.interactionModel?.languageModel?.types;
    for (const targetSlotId of targetSlotIds) {
        if (presentSlotTypes === undefined) {
            log.warn(`target slot with id ${targetSlotId} is not present in InteractionModel.`);
            continue;
        }

        const match = presentSlotTypes.find((slotType) => slotType.values?.find((value) => value.id === targetSlotId));

        if (match === undefined) {
            log.warn(`target slot with id ${targetSlotId} is not present in InteractionModel.`);
        }
    }
}

/**
 * Generate the modelData Object by reading the i18n instance.
 *
 * This is the consolidated localization information for the built-ins.  This
 * data is not included in the generated interaction model unless the components
 * are actually used. I.e. this is a map of data from which to extract bits
 * and pieces as needed.
 */
export function generateModelData(): ModelData {
    const slotTypes: SlotType[] = [];
    slotTypes.push(i18next.t('SHARED_SLOT_TYPES_FEEDBACK', { returnObjects: true }));
    slotTypes.push(i18next.t('SHARED_SLOT_TYPES_HEAD', { returnObjects: true }));
    slotTypes.push(i18next.t('SHARED_SLOT_TYPES_TAIL', { returnObjects: true }));
    slotTypes.push(i18next.t('SHARED_SLOT_TYPES_CONJUNCTION', { returnObjects: true }));
    slotTypes.push(i18next.t('SHARED_SLOT_TYPES_PREPOSITION', { returnObjects: true }));
    slotTypes.push(i18next.t('SHARED_SLOT_TYPES_ACTION', { returnObjects: true }));
    slotTypes.push(i18next.t('SHARED_SLOT_TYPES_TARGET', { returnObjects: true }));

    const intentValues: IntentUtterances[] = [];
    intentValues.push({
        name: ConjunctionControlIntent.name,
        samples: i18next.t('CONJUNCTION_CONTROL_INTENT_SAMPLES', { returnObjects: true })
    });
    intentValues.push({
        name: DateRangeControlIntent.name,
        samples: i18next.t('DATE_RANGE_CONTROL_INTENT_SAMPLES', { returnObjects: true })
    });
    intentValues.push({
        name: GeneralControlIntent.name,
        samples: i18next.t('GENERAL_CONTROL_INTENT_SAMPLES', { returnObjects: true })
    });
    intentValues.push({
        name: OrdinalControlIntent.name,
        samples: i18next.t('ORDINAL_CONTROL_INTENT_SAMPLES', { returnObjects: true })
    });
    intentValues.push({
        name: SingleValueControlIntent.name,
        samples: i18next.t('SINGLE_VALUE_CONTROL_INTENT_SAMPLES', { returnObjects: true })
    });

    return {
        slotTypes,
        intentValues
    };
}

