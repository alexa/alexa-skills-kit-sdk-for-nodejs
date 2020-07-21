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

import { expect } from 'chai';
import { suite, test, Test } from 'mocha';
import sinon from 'sinon';
import * as ArrayUtil from '../../src/utils/ArrayUtils';
import {
    AmazonBuiltInSlotType, Control,
    ControlHandler, ControlManager, DateControlValidations,
    DateRangeControl, DateRangeControlIntent,
    DateRangeControlValidations, GeneralControlIntent, SingleValueControlIntent,
    testE2E, TestInput, AmazonIntent
} from '../../src';
import { Strings as $ } from "../../src/constants/Strings";
import { ConjunctionControlIntent } from '../../src/intents/ConjunctionControlIntent';

function dateRangeControlUnderTest(confirmationRequired: boolean = false): DateRangeControl {
    return new DateRangeControl(
        {
            id: 'DateRangeControl',
            interactionModel: {
                targets: {
                    self: ['photos', $.Target.Date]
                },
                actions: {
                    set: ['show', $.Action.Set],
                    change: [$.Action.Change]
                },
            },
            validation: {
                rangeValid: [DateRangeControlValidations.START_BEFORE_END],
                startDateValid: [DateControlValidations.PAST_DATE_ONLY],
                endDateValid: [DateControlValidations.PAST_DATE_ONLY]
            },
            required: true,
            confirmationRequired,
        },
    );
}
class StrictDateRangeControlManager extends ControlManager {
    createControlTree(state: any): Control {
        return dateRangeControlUnderTest();
    }
}

class ConfirmationDateRangeControlManager extends ControlManager {
    createControlTree(state: any): Control {
        return dateRangeControlUnderTest(true);
    }
}

const askForStartPrompts = ['start date please ?', 'Please give me the start date.'];
const valueSetPrompts = ['Ok.', 'Roger.'];
const askForEndPrompts = ['End date please ?', 'Please give me the end date.'];
const askForBothPrompts = ['What is the start date and end date you want ?', 'Please give me the start date and the end date.'];
class VariableResponseTwoDatesControlManager extends ControlManager {
    createControlTree(state: any): Control {
        return new DateRangeControl(
            {
                id: 'DateRangeControl',
                interactionModel: {
                    targets: {
                        self: ['photos', $.Target.Date]
                    },
                    actions: {
                        set: ['show', $.Action.Set],
                        change: [$.Action.Change]
                    },
                },
                validation: {
                    rangeValid: [DateRangeControlValidations.START_BEFORE_END]
                },
                prompts: {
                    startDate: {
                        requestValue: askForStartPrompts,
                        valueSet: valueSetPrompts
                    },
                    endDate: {
                        requestValue: askForEndPrompts,
                        valueSet: valueSetPrompts
                    },
                    requestValue: askForBothPrompts
                }
            },
        );
    }
}

suite('DateRangeControl', () => {

    beforeEach(() => {
        // set now to 2019-01-03
        sinon.useFakeTimers(new Date('2019-01-03T21:55:38.151Z'));
    });

    afterEach(() => {
        sinon.restore();
    });

    suite('E2E tests', () => {
        suite('Only DateRangeControlIntent & DateControlIntent', () => {
            test('both start date and end date provided', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2017',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                    ]
                );
            });

            test('both start date and end date provided but in simple words', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                    ]
                );
            });

            test('should ask for end date when only start date is set', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2017',
                        })),
                        'A: Got it. The start date is 2017. What is the end date you want?',
                        'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2018',
                        })),
                        'A: Got it. The end date is 2018.',
                    ]
                );
            });

            test('should ask for start date when end start date is set', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set end date to 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.EndDate,
                            'AMAZON.DATE': '2017',
                        })),
                        'A: Got it. The end date is 2017. What is the start date you want?',
                        'U: 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Got it. The start date is 2016.',
                    ]
                );
            });

            test('raw value input should use focus to determine target', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2017',
                        })),
                        'A: Got it. The start date is 2017. What is the end date you want?',
                        'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2018',
                        })),
                        'A: Got it. The end date is 2018.',
                        'U: actually 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Change,
                            'AMAZON.DATE': '2017',
                        })),
                        'A: Got it. The end date is changed to 2017.',
                    ]
                );
            });

            test('should mention both change if two value changed together', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2017',
                        })),
                        'A: Got it. The start date is 2017. What is the end date you want?',
                        'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2018',
                        })),
                        'A: Got it. The end date is 2018.',
                        'U: actually 2015 to 2016', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2015',
                            'AMAZON.DATE.b': '2016',
                        })),
                        'A: Got it. The start date is changed to 2015-01-01 and the end date is changed to 2016-12-31.',
                    ]
                );
            });

            test('only raw value input should be regarded as range if no previous context', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { 'AMAZON.DATE': '2018' })),
                        'A: Got it. The start date is 2018-01-01 and the end date is 2018-12-31.',
                    ]
                );
            });

            test('When there is lastInitiative child and focus is actually on parent, raw value should be consumed by parent', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2017',
                        })),
                        'A: Got it. The start date is 2017. What is the end date you want?',
                        'U: Actually change date from 2015-01-01 to 2016-12-31', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Change,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2015',
                            'AMAZON.DATE.b': '2016'
                        })),
                        'A: Got it. The start date is 2015-01-01 and the end date is 2016-12-31.',
                        'U: change date to 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Change,
                            'target': $.Target.Date,
                            'AMAZON.DATE': '2017',
                        })),
                        'A: Got it. The start date is changed to 2017-01-01 and the end date is changed to 2017-12-31.',
                    ]
                );
            });

            test('when target ambiguous, and two value provided, should transfer date to startDate and endDate', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                    ]
                );
            });

            test('when focus is both, one value will be considered as both', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2016'
                        })),
                        'A: Got it. The start date is changed to 2016-01-01 and the end date is changed to 2016-12-31.',

                    ]
                );
            });

            test('when focus is both, ambiguous target will be considered as both', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: set date to 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE': '2016'
                        })),
                        'A: Got it. The start date is changed to 2016-01-01 and the end date is changed to 2016-12-31.',

                    ]
                );
            });

        });

        suite('Integrate with two builtin validation rules', () => {
            test('should ask for valid end date when end date fails validations', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2017 to 2020', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2020',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2020-12-31. Sorry but that\'s not a valid end date because the date cannot be greater than today. What should I change the end date to?',
                        'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2018',
                        })),
                        'A: Got it. The end date is changed to 2018.'

                    ]
                );
            });

            test('should ask for valid start date when start date fails validations', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2020',

                        })),
                        'A: Sorry but that\'s not a valid start date because the date cannot be greater than today. What is the start date you want?',
                        'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2018',
                        })),
                        'A: Got it. The start date is 2018. What is the end date you want?',
                        'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2018',
                        })),
                        'A: Got it. The end date is 2018.',
                    ]
                );
            });

            test('should ask for both start date and end date when both value changed and start date is past end date', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2017 to 2016', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2016',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2016-12-31. Sorry, invalid range because start date can not be greater than end date. What is the start date and end date you want?',
                    ]
                );
            });

            test('should ask for valid end date when start date is past end date, and only end date is changed', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2016 to 2017', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2016',
                            'AMAZON.DATE.b': '2017',
                        })),
                        'A: Got it. The start date is 2016-01-01 and the end date is 2017-12-31.',
                        'U: change end date to 2015', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Change,
                            'target': $.Target.EndDate,
                            'AMAZON.DATE': '2015'
                        })),
                        'A: Got it. The end date is changed to 2015. Sorry, invalid range because start date can not be greater than end date. What is the end date you want?',
                    ]
                );
            });
        });

        suite('Integrate with SimpleControlIntent & ConjunctionControlIntent', () => {
            test('change with ambiguous target will ask for both start and end when focus is both, and treat one value input as a range', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: Change date', TestInput.of(GeneralControlIntent.of({
                            action: $.Action.Change,
                            target: $.Target.Date
                        })),
                        'A: What is the start date and end date you want?',
                        'U: 2015 to 2016', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2015',
                            'AMAZON.DATE.b': '2016',
                        })),
                        'A: Got it. The start date is changed to 2015-01-01 and the end date is changed to 2016-12-31.',

                    ]
                );
            });

            test('change with ambiguous target will only change start when focus is start', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: Change start date to 2015', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Change,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2015'
                        })),
                        'A: Got it. The start date is changed to 2015.',
                        'U: change date to 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Change,
                            'target': $.Target.Date,
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Got it. The start date is changed to 2016.',
                    ]
                );
            });

            test('change start date and end date', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and set end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'action.b': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: Change start date and end date', TestInput.of(ConjunctionControlIntent.of({
                            'action': $.Action.Change,
                            'target.a': $.Target.StartDate,
                            'target.b': $.Target.EndDate
                        })),
                        'A: What is the start date and end date you want?',
                        'U: 2015 to 2016', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2015',
                            'AMAZON.DATE.b': '2016'
                        })),
                        'A: Got it. The start date is changed to 2015-01-01 and the end date is changed to 2016-12-31.',
                    ]
                );
            });

            test('change with specific target', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: Change start date', TestInput.of(GeneralControlIntent.of({
                            action: $.Action.Change,
                            target: $.Target.StartDate,
                        })),
                        'A: What should I change the start date to?',
                        'U: 2015', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2015',
                        })),
                        'A: Got it. The start date is changed to 2015.',
                    ]
                );
            });

            test('when focus is both, action "change" will be considered to change both start and end date', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: change', TestInput.of(GeneralControlIntent.of({
                            action: $.Action.Change,
                        })),
                        'A: What is the start date and end date you want?',
                        'U: 2015 to 2016', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2015',
                            'AMAZON.DATE.b': '2016'
                        })),
                        'A: Got it. The start date is changed to 2015-01-01 and the end date is changed to 2016-12-31.',
                    ]
                );
            });

            test('when focus is start date, action "change" will be considered to change start date', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set date from 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action': $.Action.Set,
                            'target': $.Target.Date,
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: change start date to 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Change,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Got it. The start date is changed to 2016.',
                        'U: change', TestInput.of(GeneralControlIntent.of({
                            action: $.Action.Change,
                        })),
                        'A: What should I change the start date to?',
                        'U: 2015', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2015',
                        })),
                        'A: Got it. The start date is changed to 2015.',
                    ]
                );
            });

        });

        suite('Integrate with customized action & target', () => {
            test('DateRangeControl should understand customized target photos and action show', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: show photos from 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action': 'show',
                            'target': 'photos',
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                    ]
                );
            });

            test('GeneralControlIntent & ConjunctionControlIntent should understand customized target photos', async () => {
                const handler = new ControlHandler(new StrictDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: show photos from 2017 to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action': 'show',
                            'target': 'photos',
                            'AMAZON.DATE.a': '2017',
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: change photos', TestInput.of(GeneralControlIntent.of({
                            action: $.Action.Change,
                            target: 'photos',
                        })),
                        'A: What is the start date and end date you want?',
                        'U: 2015 to 2016', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2015',
                            'AMAZON.DATE.b': '2016'
                        })),
                        'A: Got it. The start date is changed to 2015-01-01 and the end date is changed to 2016-12-31.',
                    ]
                );
            });
        });

        suite('Confirmation required scenarios', () => {
            test('should be able to confirm both start and end and accept affirmation', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2017',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Was that 2017-01-01 to 2018-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                    ]
                );
            });

            test('should be able to confirm both start and end and accept disaffirmation', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2017',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Was that 2017-01-01 to 2018-12-31?',
                        'U: No', TestInput.intent(AmazonIntent.NoIntent),
                        'A: My mistake. What is the start date and end date you want?',
                    ]
                );
            });

            test('should be able to confirm date range and accept affirmation', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Was that 2016-01-01 to 2016-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is 2016-01-01 and the end date is 2016-12-31.',
                    ]
                );
            });

            test('Should first do confirmation then do validation, and the second input also need to be confirmed', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2018 and end date to 2017', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2018',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2017',
                        })),
                        'A: Was that 2018-01-01 to 2017-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Sorry, invalid range because start date can not be greater than end date. What is the start date and end date you want?',
                        'U: 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Was that 2016-01-01 to 2016-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is changed to 2016-01-01 and the end date is changed to 2016-12-31.',
                    ]
                );
            });

            test('should work well with change both', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2017',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Was that 2017-01-01 to 2018-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: Change date', TestInput.of(GeneralControlIntent.of({
                            action: $.Action.Change,
                            target: $.Target.Date
                        })),
                        'A: What is the start date and end date you want?',
                        'U: 2015 to 2016', TestInput.of(DateRangeControlIntent.of({
                            'AMAZON.DATE.a': '2015',
                            'AMAZON.DATE.b': '2016',
                        })),
                        'A: Was that 2015-01-01 to 2016-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is changed to 2015-01-01 and the end date is changed to 2016-12-31.',
                    ]
                );
            });

            test('should work well with change range', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2017',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Was that 2017-01-01 to 2018-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: change date to 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Change,
                            'target': $.Target.Date,
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Was that 2016-01-01 to 2016-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is changed to 2016-01-01 and the end date is changed to 2016-12-31.',
                    ]
                );
            });

            test('should work well with setting child value', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2017',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Was that 2017-01-01 to 2018-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: set start date to 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Got it. The start date is 2016. Was that 2016?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great.',
                    ]
                );
            });

            test('should work well with children\'s validation rule', async () => {
                const handler = new ControlHandler(new ConfirmationDateRangeControlManager());
                await testE2E(
                    handler,
                    [
                        'U: set start date to 2017 and end date to 2018', TestInput.of(DateRangeControlIntent.of({
                            'action.a': $.Action.Set,
                            'target.a': $.Target.StartDate,
                            'AMAZON.DATE.a': '2017',
                            'action.b': $.Action.Set,
                            'target.b': $.Target.EndDate,
                            'AMAZON.DATE.b': '2018',
                        })),
                        'A: Was that 2017-01-01 to 2018-12-31?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great. Got it. The start date is 2017-01-01 and the end date is 2018-12-31.',
                        'U: set start date to 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2020',
                        })),
                        'A: Sorry but that\'s not a valid start date because the date cannot be greater than today. What is the start date you want?',
                        'U: set start date to 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                            'action': $.Action.Set,
                            'target': $.Target.StartDate,
                            'AMAZON.DATE': '2016',
                        })),
                        'A: Got it. The start date is 2016. Was that 2016?',
                        'U: Yes', TestInput.intent(AmazonIntent.YesIntent),
                        'A: Great.',
                    ]
                );
            });
        });
    });

    suite('Variable response tests', () => {
        beforeEach(() => {
            // Force to return the last one in the array
            sinon.stub(ArrayUtil, 'randomlyPick').callsFake((input) => input[input.length - 1]);
        });
        afterEach(() => {
            sinon.restore();
        });
        test('should ask for end date when only start date is set, ', async () => {
            const handler = new ControlHandler(new VariableResponseTwoDatesControlManager());
            await testE2E(
                handler,
                [
                    'U: set start date to 2017', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                        'action': $.Action.Set,
                        'target': $.Target.StartDate,
                        'AMAZON.DATE': '2017',
                    })),
                    'A: Roger. Please give me the end date.',
                    'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {
                        'AMAZON.DATE': '2018',
                    })),
                    'A: Roger.'
                ]
            );
        });
    });

    suite('DateRangeControl scenarios', () => {
        test('unknown single target should be rejected', async () => {
            const control = dateRangeControlUnderTest();
            const input = TestInput.of(DateRangeControlIntent.of({ 'action': $.Action.Set, 'target': 'food', 'AMAZON.DATE.a': '2016', 'AMAZON.DATE.b': '2017'}));
            const canHandleResult = await control.canHandle(input);
            expect(canHandleResult).false;
        });

        test('two targets with either one unknown should be rejected', async () => {
            const control = dateRangeControlUnderTest();
            const input = TestInput.of(DateRangeControlIntent.of({ 'action': $.Action.Set, 'target.a': $.Target.StartDate, 'target.b': 'food', 'AMAZON.DATE.a': '2016', 'AMAZON.DATE.b': '2017'}));
            const canHandleResult = await control.canHandle(input);
            expect(canHandleResult).false;
        });

    });
});
