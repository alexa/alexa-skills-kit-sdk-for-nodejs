/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License').
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the 'license' file accompanying this file. This file is distributed
 * on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { expect } from 'chai';
import { suite, test } from 'mocha';
import { NumberControl, NumberControlState } from '../../src/commonControls/NumberControl';
import { Strings as $ } from "../../src/constants/Strings";
import { Control } from '../../src/controls/Control';
import { ControlManager } from '../../src/controls/ControlManager';
import { AmazonBuiltInSlotType } from '../../src/intents/AmazonBuiltInSlotType';
import { GeneralControlIntent } from '../../src/intents/GeneralControlIntent';
import { SingleValueControlIntent } from '../../src/intents/SingleValueControlIntent';
import { ControlHandler } from '../../src/runtime/ControlHandler';
import { testE2E, TestInput, waitForDebugger } from '../../src/utils/testSupport/TestingUtils';
import { IntentBuilder } from '../../src/utils/IntentUtils';
import { AmazonIntent } from '../../src/intents/AmazonBuiltInIntent';

waitForDebugger();

suite('NumberControl e2e tests', () => {
    suite('NumberControl e2e tests - NumberControl without validation nor expectation', () => {
        const TEST_CONTROL_ID = 'NumberSelectorWithoutValidationExpectation';

        class NumberControlManager extends ControlManager {
            createControlTree(state: any): Control {
                return new NumberControl({
                    id: TEST_CONTROL_ID,
                    confirmationRequired: true
                });
            }
        }

        test('number valid but without expectation, needs explicit affirming', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: ', TestInput.of(GeneralControlIntent.of({})),
                'A: What number?',
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(16);
        });
    });

    suite('NumberControl e2e tests - NumberControl with expectation function and validation functions', () => {
        const TEST_CONTROL_ID = 'NumberSelectorWithoutValidationExpectation';

        class NumberControlManager extends ControlManager {
            createControlTree(state: any): Control {
                return new NumberControl({
                    id: TEST_CONTROL_ID,
                    prompts: {},
                    validation: [
                        state => (state.value! > 0) || { renderedReason: 'the value must be positive'},
                        state => (state.value! % 2 === 0) || { renderedReason: 'the value must be even'}
                    ],
                    confirmationRequired: (state, input) => state.value !== undefined && (state.value < 10 || state.value > 20)
                });
            }
        }

        test('first number not valid but expected, second number valid and expected', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: ', TestInput.of(GeneralControlIntent.of({})),
                'A: What number?',
                'U: Fifteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '15' })),
                'A: Sorry but that\'s not a valid choice because the value must be even. What number?',
                'U: Sixteen.', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '16' })),
                'A: Ok. Value set to 16.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(16);
        });
    });

    suite('NumberControl e2e tests - NumberControl with custom validation and expectation', () => {
        const TEST_CONTROL_ID = 'NumberSelectorWithValidationExpectation';

        class NumberControlManager extends ControlManager {
            createControlTree(state: any): Control {
                return new NumberControl({
                    id: TEST_CONTROL_ID,
                    prompts: {
                        requestValue: () => ['How many?']
                    },
                    validation: state => (state.value! >= 0 && state.value! <= 50) || { renderedReason: 'the value must be between zero and fifty inclusive'},
                    confirmationRequired: (state, input) => state.value !== undefined && ![1, 2, 3, 4, 5, 6].includes(state.value),
                });
            }
        }

        test('input number valid and expected, do not need confirmation', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Six', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '6' })),
                'A: Ok. Value set to 6.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(6);
        });

        test('number valid but not expected, needs explicit affirming', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: ', TestInput.of(GeneralControlIntent.of({})),
                'A: How many?',
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(16);
        });

        test('overfilling the affirmation', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: Yes, change it to 16', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "feedback": $.Feedback.Affirm, "action": $.Action.Change, 'AMAZON.NUMBER': '16' })),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(16);
        });

        test('affirmation with a different value, confirm user with the latest number', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: Yes, change it to 6', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "feedback": $.Feedback.Affirm, "action": $.Action.Change, 'AMAZON.NUMBER': '6' })),
                'A: Sorry the previous value is 16, but you confirmed to a different number. Was that 6?',
                'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(6);
        });

        test('disaffirm with the same value, confirm user with the number', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: No, change it to 16', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "feedback": $.Feedback.Disaffirm, "action": $.Action.Change, 'AMAZON.NUMBER': '16' })),
                'A: Sorry you disagreed but with the same number. How many?',
                'U: Six.', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '6' })),
                'A: Ok. Value set to 6.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(6);
        });

        test('only provide a same value during confirmation, confirm user with the existing number', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: 16', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '16' })),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(16);
        });

        test('only provide a different value during confirmation, confirm user with the new number', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: Change it to 6', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Change, 'AMAZON.NUMBER': '6' })),
                'A: Ok. Value set to 6.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(6);
        });

        test('first number strictly disaffirmed, propose user with ambiguous pair based on the first number', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Fifteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '15' })),
                'A: Was that 15?',
                'U: No, fifteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "feedback": $.Feedback.Disaffirm, 'AMAZON.NUMBER': '15' })),
                'A: Sorry you disagreed but with the same number. Did you perhaps mean 50?',
                'U: Yes', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(50);
        });

        test('first number strictly disaffirmed, but ambiguous pair invalid, request value from user', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: No.', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
                'A: My mistake. How many?',
                'U: Set to five', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '5' })),
                'A: Ok. Value set to 5.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(5);
        });

        test('first number disaffirmed, second number invalid, third number expected', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: ', TestInput.of(GeneralControlIntent.of({})),
                'A: How many?',
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: No, sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "feedback": $.Feedback.Disaffirm, 'AMAZON.NUMBER': '16' })),
                'A: Sorry you disagreed but with the same number. How many?',
                'U: One thousand', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '1000' })),
                'A: Sorry but that\'s not a valid choice because the value must be between zero and fifty inclusive. How many?',
                'U: Change to 26', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Change, 'AMAZON.NUMBER': '26' })),
                'A: Was that 26?',
                'U: Yes', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(26);
        });

        test('first number disaffirmed, ambiguous pair hit but still disaffirmed, third number expected', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: ', TestInput.of(GeneralControlIntent.of({})),
                'A: How many?',
                'U: Forty', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '40' })),
                'A: Was that 40?',
                'U: No', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
                'A: My mistake. Did you perhaps mean 14?',
                'U: No', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
                'A: My mistake. How many?',
                'U: Three', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '3' })),
                'A: Ok. Value set to 3.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(3);
        });

        test('first number disaffirmed, unusable repeated number happens, third number expected', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: ', TestInput.of(GeneralControlIntent.of({})),
                'A: How many?',
                'U: Sixteen', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '16' })),
                'A: Was that 16?',
                'U: No', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
                'A: My mistake. How many?',
                'U: Change the number', TestInput.of(GeneralControlIntent.of({ action: $.Action.Change, target: $.Target.Number })),
                'A: How many?',
                'U: I want sixteen of them', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: I\'m really sorry but I heard 16 again. How many?',
                'U: Never mind I want 20', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '20' })),
                'A: Was that 20?',
                'U: No', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
                'A: My mistake. How many?',
                'U: I want sixteen of them', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Set, 'AMAZON.NUMBER': '16' })),
                'A: I\'m really sorry but I heard 16 again. How many?',
                'U: Never mind I want 20', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '20' })),
                'A: I\'m really sorry but I heard 20 again. How many?',
                'U: Change to Five', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { "action": $.Action.Change, 'AMAZON.NUMBER': '5' })),
                'A: Ok. Value set to 5.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(5);
        });

        test('handling special number like negative and zero', async () => {
            const requestHandler = new ControlHandler(new NumberControlManager());
            await testE2E(requestHandler, [
                'U: Minus ten.', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '-10' })),
                'A: Sorry but that\'s not a valid choice because the value must be between zero and fifty inclusive. How many?',
                'U: Zero', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '0' })),
                'A: Was that 0?',
                'U: Yes', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
            expect((requestHandler.getSerializableControlStates()[TEST_CONTROL_ID] as NumberControlState).value).eq(0);
        });
    });
});
