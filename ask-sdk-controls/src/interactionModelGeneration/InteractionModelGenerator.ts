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
import fs from 'fs';
import _ from 'lodash';
import { join } from 'path';
import { Logger } from '../logging/Logger';

import InteractionModelData = v1.skill.interactionModel.InteractionModelData;
import InteractionModelSchema = v1.skill.interactionModel.InteractionModelSchema;
import SlotType = v1.skill.interactionModel.SlotType;
import TypeValue = v1.skill.interactionModel.TypeValue;
import Intent = v1.skill.interactionModel.Intent;
import DialogIntent = v1.skill.interactionModel.DialogIntents;
import Dialog = v1.skill.interactionModel.Dialog;
import DelegationStrategyType = v1.skill.interactionModel.DelegationStrategyType;
import Prompt = v1.skill.interactionModel.Prompt;

const log = new Logger('AskSdkControls:InteractionModelGenerator');

/**
 * Interaction model generator
 *
 * - For skills that use Controls Framework, use `ControlInteractionModelGenerator`
 */
export class InteractionModelGenerator {

    protected intents: Intent[] = [];
    protected slotTypes: SlotType[] = [];
    protected dialogIntents: DialogIntent[] = [];
    protected delegationStrategy: DelegationStrategyType;
    protected prompts: Prompt[] = [];
    protected invocationName: string;


    /**
     * Add intent to interaction model
     *
     * @param intent - Intent
     */
    addIntent(intent: Intent): InteractionModelGenerator {
        // First Check whether the new intent has the same name as any existing intents
        // If intent has the same name already exist in the array,
        // then check whether these two intents are deeply equal to each other
        // skip adding new intent if they are exactly same, otherwise throw error
        const matchingIntent: Intent | undefined = this.intents.find(existIntent => existIntent.name === intent.name);
        if (matchingIntent === undefined) {
            this.intents.push(intent);
            return this;
        }
        if (_.isEqual(matchingIntent, intent)) {
            return this;
        }
        throw new Error(`Intent ${intent.name} is defined more than once and the definitions are not identical.`);
    }

    /**
     * Add one or more intents
     */
    addIntents(...intents: Intent[]): this {
        for (const intent of intents) {
            this.addIntent(intent);
        }

        return this;
    }

    /**
     * Add or merge slot type
     *
     * If the slot and/or slot-values already exist, the new data is added.
     */
    addOrMergeSlotType(slotType: SlotType): this {

        const matchingSlotType = this.slotTypes.find(s => s.name === slotType.name);
        if (matchingSlotType === undefined) {
            // slot not yet present so just push it
            this.slotTypes.push(slotType);
            return this;
        }
        // slot present so add the values
        for (const value of slotType.values ?? []) {
            mergeSlotTypeValues(matchingSlotType.values, value, matchingSlotType.name!);
        }
        return this;
    }

    /**
     * Add or merge slot types
     *
     * If the slot and/or slot-values already exist, the new data is added.
     */
    addOrMergeSlotTypes(...slotTypes: SlotType[]): this {
        for (const slotType of slotTypes) {
            this.addOrMergeSlotType(slotType);
        }

        return this;
    }

    /**
     * Add a new slot value to an existing slot type
     *
     * If the slot-value already exists, the new data is added.
     */
    addValuesToSlotType(slotName: string, ...values: TypeValue[]): this {
        const slotType = this.slotTypes.find(s => s.name === slotName);
        if (!slotType) {
            throw new Error(`SlotType ${slotName} is not defined.`);
        }
        for (const value of values) {
            mergeSlotTypeValues(slotType.values, value, slotType.name!);
        }

        return this;
    }

    /**
     * Add a DialogIntent to the dialog model.
     */
    addDialogIntent(dialogIntent: DialogIntent): this {
        const matchingIntent: Intent | undefined = this.dialogIntents.find(existIntent => existIntent.name === dialogIntent.name);
        if (matchingIntent === undefined) {
            this.dialogIntents.push(dialogIntent);
            return this;
        }
        if (_.isEqual(matchingIntent, dialogIntent)) {
            return this;
        }
        throw new Error(`DialogIntent ${dialogIntent.name} is defined more than once and the definitions are not identical.`);
    }

    /**
     * Add DialogIntents to the dialog model.
     */
    addDialogIntents(...dialogIntents: DialogIntent[]): this {
        for (const dialogIntent of dialogIntents) {
            this.addDialogIntent(dialogIntent);
        }

        return this;
    }

    /**
     * Add DelegationStrategy to the dialog model.
     */
    addDelegationStrategy(delegationStrategy: DelegationStrategyType): this {
        this.delegationStrategy = delegationStrategy;

        return this;
    }

    /**
     * Add a Prompt to the dialog model.
     */
    addPrompt(prompt: Prompt): this {
        const matchingPrompt = this.prompts.find(existPrompt => existPrompt.id === prompt.id);
        if (matchingPrompt === undefined) {
            this.prompts.push(prompt);
            return this;
        }
        if (_.isEqual(matchingPrompt, prompt)) {
            return this;
        }
        throw new Error(`Prompt with id ${prompt.id} is defined more than once and the definitions are not identical.`);
    }

    /**
     * Add Prompts to the dialog model.
     */
    addPrompts(...prompts: Prompt[]): this {
        for (const prompt of prompts) {
            this.addPrompt(prompt);
        }

        return this;
    }

    /**
     * Set the invocation name.
     */
    withInvocationName(name: string): this {
        if (this.invocationName) {
            log.warn(`Skill invocation name ${this.invocationName} has been overwritten to ${name}.`);
        }
        this.invocationName = name;

        return this;
    }


    /**
     * Load an interaction model file (JSON format).
     *
     * Usage:
     * - This method does not perform merging for all components. Call this
     *   method before any other methods.
     */
    loadFromFile(inputPath: string): this {
        if (!inputPath || !fs.existsSync(inputPath)) {
            throw new Error('Input path is not valid.');
        }

        // fetch all info from json
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const interactionModel: InteractionModelSchema = require(inputPath).interactionModel;
        const intents: Intent[] = interactionModel.languageModel!.intents ? interactionModel.languageModel!.intents : [];
        const slotTypes: SlotType[] = interactionModel.languageModel!.types ? interactionModel.languageModel!.types : [];
        const invocationName: string = interactionModel.languageModel!.invocationName!;
        const prompts: Prompt[] = interactionModel.prompts ? interactionModel.prompts : [];
        const dialog: Dialog = interactionModel.dialog ? interactionModel.dialog : {};

        const dialogIntents: DialogIntent[] = dialog.intents ? dialog.intents : [];
        const delegationStrategy: DelegationStrategyType | undefined = dialog.delegationStrategy;

        this.addIntents(...intents);
        this.addOrMergeSlotTypes(...slotTypes);
        this.addDialogIntents(...dialogIntents);
        if (delegationStrategy !== undefined) {
            this.addDelegationStrategy(delegationStrategy);
        }
        this.addPrompts(...prompts);
        this.withInvocationName(invocationName);

        return this;
    }

    /**
     * Build the interaction model.
     *
     * @returns An `InteractionModelData` object.
     */
    build(): InteractionModelData {
        if (!this.invocationName) {
            console.warn('Invocation name is not defined');
        }
        const interactionModel: InteractionModelSchema = {
            languageModel: {},
            prompts: []
        };

        interactionModel.languageModel!.types = this.slotTypes;
        interactionModel.languageModel!.intents = this.intents;
        if (this.dialogIntents.length > 0 || this.delegationStrategy) {
            interactionModel.dialog = {};
        }
        if (this.dialogIntents.length > 0) {
            interactionModel.dialog!.intents = this.dialogIntents;
        }
        if (this.delegationStrategy) {
            interactionModel.dialog!.delegationStrategy = this.delegationStrategy;
        }
        interactionModel.prompts = this.prompts;
        interactionModel.languageModel!.invocationName = this.invocationName;

        return {
            interactionModel,
        };
    }

    /**
     * Build the interaction model and write to disk.
     *
     * @param filename - Filename
     */
    buildAndWrite(filename: string) {
        const interactionModelJson: string = JSON.stringify(this.build(), null, 2);
        const path: string = join(process.cwd(), filename);
        fs.writeFileSync(path, interactionModelJson);
    }

}

function mergeSlotTypeValues(slotTypeValues: TypeValue[] | undefined, newSlotValue: TypeValue, slotName: string): void {
    if (!slotTypeValues) {
        slotTypeValues = [newSlotValue];
        return;
    }
    const matchingValue = slotTypeValues.find(v => v.name?.value === newSlotValue.name?.value || v.id === newSlotValue.id);
    if (!matchingValue) {
        // value not yet present so just push it
        slotTypeValues.push(newSlotValue);
    }
    else {
        // value present, so add synonyms
        if (matchingValue.name?.value !== newSlotValue.name?.value) {
            throw new Error(`Cannot merge slot type ${slotName}, as the value ${JSON.stringify(newSlotValue)} and ${JSON.stringify(matchingValue)} has the same id but different name.value.`);
        }
        if (matchingValue.id !== newSlotValue.id) {
            throw new Error(`Cannot merge slot type ${slotName}, as the value ${JSON.stringify(newSlotValue)} and ${JSON.stringify(matchingValue)} has the same name.value but different id.`);
        }

        for (const synonym of newSlotValue.name?.synonyms ?? []) {
            const matchingSynonym = matchingValue.name?.synonyms?.find(s => s === synonym);
            if (matchingSynonym === undefined) {
                // synonym not yet preset so just push it
                matchingValue.name?.synonyms?.push(synonym);
            }
        }
    }
}
