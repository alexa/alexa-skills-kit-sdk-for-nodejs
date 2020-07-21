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

// Convert complicated utterance into one or two simple tasks
// E.G. Set date from A to B -> [Set startDate to A, Set endDate to B]
// This function also translate action & target to actionCateGory & targetCategory
// Thus no need to translate action & target in reset of the code

import _ from "lodash";
import { DateRangeControlIntentSlots, hasOneOrMoreActions, hasOneOrMoreTargets, hasOneOrMoreValues } from '../../intents/DateRangeControlIntent';
import { DeepRequired } from '../../utils/DeepRequired';
import { alexaDateFormatToDate } from './DateHelper';
import { DateRangeControlInteractionModelProps, DateRangeControlProps, DateRangeControlTargetProps, TargetCategory } from './DateRangeControl';

export interface DateRangeControlIntentInput {
    action: string | undefined,
    target: TargetCategory | undefined,
    value: string
}

// Break down complicated utterance into two simple utterances
// E.G. Set start date to 2017 and end date to 2018 --> ['set start date to 2017', 'set end date to 2018']
export function generateDatesInputGroups(props: DeepRequired<DateRangeControlProps>, input: DateRangeControlIntentSlots): DateRangeControlIntentInput[] {
    // translate all custom target slotTypes to targetCategory
    handleCustomSlots(props.interactionModel, input);

    const inputs: DateRangeControlIntentInput[] = [];
    const inputA: DateRangeControlIntentInput = {
        action: undefined,
        target: undefined,
        value: ''
    };

    const inputB: DateRangeControlIntentInput = {
        action: undefined,
        target: undefined,
        value: ''
    };
    // Action exist
    if (hasOneOrMoreActions(input)) {
        if (input.action !== undefined) {
            inputA.action = input.action;
            inputB.action = input.action;
        } else {
            inputA.action = input['action.a']!;
            inputB.action = input['action.b']!;
        }
    }

    // Target exist
    if (hasOneOrMoreTargets(input)) {
        if (input.target !== undefined) {
            inputA.target = input.target as TargetCategory;
            inputB.target = input.target as TargetCategory;
        } else {
            inputA.target = input['target.a']! as TargetCategory;
            inputB.target = input['target.b']! as TargetCategory;
        }

    }
    // value exist
    if (hasOneOrMoreValues(input)) {

        if (input['AMAZON.DATE'] !== undefined) {
            inputA.value = input['AMAZON.DATE'];
            inputB.value = input['AMAZON.DATE'];
        } else {
            inputA.value = input['AMAZON.DATE.a']!;
            inputB.value = input['AMAZON.DATE.b']!;
        }
    }

    // deduplicate
    // E.G. 'set date to 2019' will be converted to [{'set', 'date', '2019'}, {'set', 'date', '2019'}]
    // need to delete the duplicate one in this scenario
    if (inputA.action === inputB.action && inputA.target === inputB.target && inputA.value === inputB.value) {
        inputs.push(inputA);
    } else {
        inputs.push(inputA);
        inputs.push(inputB);
    }

    resolveAmbiguityTargets(inputs);

    return inputs;
}

// translate custom target to TargetCategory
export function handleCustomSlots(nlu: Required<DateRangeControlInteractionModelProps>, input: DateRangeControlIntentSlots): void {

    // map target to right targetCategory
    input.target = findTargetCategory(nlu.targets, input.target) ?? undefined;
    input['target.a'] = findTargetCategory(nlu.targets, input['target.a']) ?? undefined;
    input['target.b'] = findTargetCategory(nlu.targets, input['target.b']) ?? undefined;
}

// Translate slotValue id into target category
export function findTargetCategory(targets: DateRangeControlTargetProps, input: string | undefined): TargetCategory | undefined {
    // E.G. 'date' is an ambiguity target, which may refer to start date or end date
    if (_.includes(targets.startDate, input) && _.includes(targets.endDate, input)) {
        return TargetCategory.Either;
    }
    if (_.includes(targets.startDate, input)) {
        return TargetCategory.StartDate;
    }
    if (_.includes(targets.endDate, input)) {
        return TargetCategory.EndDate;
    }
    return undefined;
}

// Only TargetCategory.StartDate and TargetCategory.EndDate is regarded as clear target
function isNotClearTarget(input: TargetCategory | undefined): boolean {
    if (input === undefined) {
        return true;
    }
    if (input === TargetCategory.Either || input === TargetCategory.Both || input === TargetCategory.Neither) {
        return true;
    }
    return false;
}

// if two values provided without clear target
// generate clear targets, the earlier date will be considered as start date
// E.G. 2020 back to 2017 --> startDate: 2017, endDate: 2020
function resolveAmbiguityTargets(inputs: DateRangeControlIntentInput[]): void {

    if (inputs[0] !== undefined && inputs[1] !== undefined && isNotClearTarget(inputs[0].target) && isNotClearTarget(inputs[1].target)) {
        const date1: Date = alexaDateFormatToDate(inputs[0].value);
        const date2: Date = alexaDateFormatToDate(inputs[0].value);
        if (date1 > date2) {
            inputs[0].target = TargetCategory.EndDate;
            inputs[1].target = TargetCategory.StartDate;
        } else {
            inputs[0].target = TargetCategory.StartDate;
            inputs[1].target = TargetCategory.EndDate;
        }
    }
}