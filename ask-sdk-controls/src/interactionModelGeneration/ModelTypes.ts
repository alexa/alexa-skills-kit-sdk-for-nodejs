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
import SlotType = v1.skill.interactionModel.SlotType;

/**
 * Names of the built-in slot types used by ControlIntents
 */
export enum SharedSlotType {
    FEEDBACK = 'feedback',
    HEAD = 'head',
    TAIL = 'tail',
    ACTION = 'action',
    TARGET = 'target',
    CONJUNCTION = 'conjunction',
    PREPOSITION = 'preposition'
}

/**
 * Localized information Names of the built-in slot types used by ControlIntents
 */
export interface ModelData {
    slotTypes: SlotType[],
    intentValues: IntentUtterances[] // TODO: naming: review name
}

export interface SlotValue {
    synonyms: string[],
    id: string
}

export interface IntentUtterances {
    name: string,
    samples: string[]
}

export type ModelDataMap = { [locale: string]: ModelData };