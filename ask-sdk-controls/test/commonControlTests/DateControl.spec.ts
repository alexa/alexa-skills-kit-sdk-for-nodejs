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
import { suite, test } from "mocha";
import sinon from 'sinon';
import { DateControl, DateControlValidations } from '../../src/commonControls/DateControl';
import { Strings as $ } from "../../src/constants/Strings";
import { Control } from '../../src/controls/Control';
import { ControlManager } from '../../src/controls/ControlManager';
import { ControlResultBuilder } from '../../src/controls/ControlResult';
import { GeneralControlIntent } from '../../src/intents/GeneralControlIntent';
import { ControlResponseBuilder } from '../../src/responseGeneration/ControlResponseBuilder';
import { ControlHandler } from '../../src/runtime/ControlHandler';
import { testE2E, TestInput, waitForDebugger } from '../../src/utils/testSupport/TestingUtils';
import { OrdinalControlIntent } from '../../src/intents/OrdinalControlIntent';
import { ContentAct, ControlInput, SingleValueControlIntent, AmazonBuiltInSlotType, ValueSetAct, InvalidValueAct, RequestValueAct, RequestChangedValueAct, IntentBuilder, AmazonIntent, ValueChangedAct } from '../../src';

function dateControlUnderTest(): DateControl {
    return new DateControl({
        id: 'dateControl',
        validation: [DateControlValidations.FUTURE_DATE_ONLY],
        required: true,
        interactionModel: {
            targets: ['food', $.Target.Date],
            actions: {
                set: [$.Action.Set, 'deliver'],
                change: [$.Action.Change]
            },
        }
    });
}

function dateControlUnderTest2(): DateControl {
    return new DateControl({
        id: 'dateControl2',
        validation: [DateControlValidations.PAST_DATE_ONLY],
        required: true,
        interactionModel: {
            targets: [$.Target.Date],
            actions: {
                set: [$.Action.Set],
                change: [$.Action.Change]
            },
        }
    });
}

export class DateManager extends ControlManager {
    createControlTree(): Control {
        return dateControlUnderTest();
    }
}

export class DateManager2 extends ControlManager {
    createControlTree(): Control {
        return dateControlUnderTest2();
    }
}

export class DateManagerWithConfirmation extends ControlManager {
    createControlTree(): Control {
        return new DateControl({
            id: 'dateControlConfirm',
            required: true,
            confirmationRequired: true,
            validation: DateControlValidations.PAST_DATE_ONLY,
            interactionModel: {
                targets: [$.Target.Date],
                actions: {
                    set: [$.Action.Set],
                    change: [$.Action.Change]
                },
            },
            prompts: {
                valueSet: '',
                valueChanged: ''
            }
        });
    }
}

export class TestAct extends ContentAct {
    test?: string;
    constructor(control: Control, test: string) {
        super(control);
        this.test = test;
    }
    render(input: ControlInput, responseBuilder: ControlResponseBuilder): void {
        throw new Error('Not implemented.');
    }
}

waitForDebugger();

suite('DateControl tests', () => {
    beforeEach(() => {
        // set now to 2019-01-03
        sinon.useFakeTimers(new Date('2019-01-03T21:55:38.151Z'));
    });

    afterEach(() => {
        sinon.restore();
    });

    suite('DateControl scenarios', () => {
        const emptyInput = TestInput.of(GeneralControlIntent.of({}));

        test('set value with valid date should be processed.', async () => {
            const control = dateControlUnderTest();
            const input = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {'AMAZON.DATE': '2020' }));
            const canHandleResult = control.canHandle(input);
            expect(canHandleResult).true;
            const result = new ControlResultBuilder(undefined!);
            await control.handle(input, result);

            expect(result.acts).length(1);
            expect(result.acts[0]).instanceOf(ValueSetAct);
            expect((result.acts[0] as ValueSetAct<any>).payload.value).eq('2020');
        });

        test('set value with invalid choice should be rejected.', async () => {
            const control = dateControlUnderTest();
            const input = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { 'action': $.Action.Set, 'target': 'food', 'AMAZON.DATE': '2019-01-01' }));
            const canHandleResult = control.canHandle(input);
            expect(canHandleResult).true;
            const result = new ControlResultBuilder(undefined!);
            await control.handle(input, result);

            expect(result.acts).length(2);
            expect(result.acts[0]).instanceOf(InvalidValueAct);
            expect(result.acts[1]).instanceOf(RequestValueAct);
        });

        test('change date intent should be handled.', async () => {
            const control = dateControlUnderTest();
            const input = TestInput.of(GeneralControlIntent.of({ action: $.Action.Change, target: $.Target.Date }));
            const canHandleResult = control.canHandle(input);
            expect(canHandleResult).true;
            const result = new ControlResultBuilder(undefined!);
            await control.handle(input, result);

            expect(result.acts).length(1);
            expect(result.acts[0]).instanceOf(RequestChangedValueAct);
        });
        test('test controller clear state function.', async () => {
            const control = dateControlUnderTest();
            const input = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {'AMAZON.DATE': '2019-01-01' }));
            const canHandleResult = control.canHandle(input);
            expect(canHandleResult).true;

            const result = new ControlResultBuilder(undefined!);
            await control.handle(input, result);
            expect(result.acts).length(2);
            expect(result.acts[0]).instanceOf(InvalidValueAct);
            expect(result.acts[1]).instanceOf(RequestValueAct);

            control.clear();
            expect(control.state.value).equal(undefined);
        });

        test('test controller renderResultItem throws error for unhandled acts.', async () => {
            const control = dateControlUnderTest();
            const input = TestInput.of(GeneralControlIntent.of({ action: $.Action.Change, target: $.Target.Date }));
            const result = new ControlResponseBuilder(undefined!);
            try {
                control.renderAct(new TestAct(control, 'test'), input, result);
            }
            catch (err) {
                expect(err.message).equal('No NLG for TestAct:{"takesInitiative":false,"test":"test","controlId":"dateControl"}');
            }
        });

        test('test controller handle call with invalid canHandle boolean throws error.', async () => {
            const control = dateControlUnderTest();
            const input = TestInput.of(OrdinalControlIntent.of({}));
            const result = new ControlResultBuilder(undefined!);
            try {
                await control.handle(input, result);
            }
            catch (err) {
                expect(err.message).equal(`${OrdinalControlIntent.name} can not be handled by ${control.constructor.name}.`);
            }
        });

        test('test controller takeInitiative call with invalid canTakeInitiative throws error', async () => {
            const control = dateControlUnderTest();
            const input = emptyInput;
            const result = new ControlResultBuilder(undefined!);
            try {
                await control.takeInitiative(input, result);
            }
            catch (err) {
                expect(err.message).equal('DateControl: takeInitiative called but this.initiativeFunc is not set. canTakeInitiative() should be called first to set this.initiativeFunc.');
            }
        });

        test('test controller askElicitationQuestion throws error for invalid action.', async () => {
            const control = dateControlUnderTest();
            const input = emptyInput;
            const result = new ControlResultBuilder(undefined!);
            try {
                await control.askElicitationQuestion(input, result, 'delete');
            }
            catch (err) {
                expect(err.message).equal('Unhandled. Unknown elicitationAction: delete');
            }
        });
    });

    suite('DateControl e2e tests', () => {
        test('Respond to Alexa\'s question with valid date', async () => {
            const requestHandler = new ControlHandler(new DateManager());
            await testE2E(requestHandler, [
                'U: set', TestInput.of(GeneralControlIntent.of({ action: $.Action.Set })),
                'A: What date?',
                'U: 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2020' })),
                'A: OK.',
            ]);
        });

        test('Respond to Alexa\'s question with invalid date', async () => {
            const requestHandler = new ControlHandler(new DateManager());
            await testE2E(requestHandler, [
                'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2018' })),
                'A: Sorry but that\'s not a valid date because the date cannot be less than today. What date?',
                'U: 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2020-01-01' })),
                'A: OK.'
            ]);
        });

        test('Respond to Alexa\'s question with invalid past date', async () => {
            const requestHandler = new ControlHandler(new DateManager2());
            await testE2E(requestHandler, [
                'U: 2021', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2021' })),
                'A: Sorry but that\'s not a valid date because the date cannot be greater than today. What date?',
                'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2018' })),
                'A: OK.',
            ]);
        });

        test('Change date with value after setting', async () => {
            const requestHandler = new ControlHandler(new DateManager());
            await testE2E(requestHandler, [
                'U: 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2020' })),
                'A: OK.',
                'U: change date to 2021', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { 'action': $.Action.Change, 'target': $.Target.Date, "AMAZON.DATE": '2021' })),
                'A: Changed from 2020 to 2021.',
            ]);
        });

        test('Change date to invalid value after setting', async () => {
            const requestHandler = new ControlHandler(new DateManager());
            await testE2E(requestHandler, [
                'U: 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2020' })),
                'A: OK.',
                'U: change date to 2016', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { 'action': $.Action.Change, 'target': $.Target.Date, "AMAZON.DATE": '2016' })),
                'A: Sorry but that\'s not a valid date because the date cannot be less than today. What should I change it to?',
                'U: 2021', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { 'action': $.Action.Change, "AMAZON.DATE": '2021' })),
                'A: Changed from 2016 to 2021.',
            ]);
        });

        test('Change date after setting', async () => {
            const requestHandler = new ControlHandler(new DateManager());
            await testE2E(requestHandler, [
                'U: 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2020' })),
                'A: OK.',
                'U: change', TestInput.of(GeneralControlIntent.of({ action: $.Action.Change })),
                'A: What should I change it to?',
                'U: change to 2021', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { 'action': $.Action.Change, "AMAZON.DATE": '2021' })),
                'A: Changed from 2020 to 2021.',
            ]);
        });

        test('Change date after setting and later set it to a different value', async () => {
            const requestHandler = new ControlHandler(new DateManager());
            await testE2E(requestHandler, [
                'U: 1993', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '1993' })),
                'A: Sorry but that\'s not a valid date because the date cannot be less than today. What date?',
                'U: 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2020' })),
                'A: OK.',
                'U: change', TestInput.of(GeneralControlIntent.of({ action: $.Action.Change })),
                'A: What should I change it to?',
                'U: change to 2021', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "action": $.Action.Change, "AMAZON.DATE": '2021' })),
                'A: Changed from 2020 to 2021.',
                'U: actually set it to', TestInput.of(GeneralControlIntent.of({action: $.Action.Set})),
                'A: What date?',
                'U: 2025', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2025' })),
                'A: OK.'
            ]);
        });

        test('Change date to invalid value after setting', async () => {
            const requestHandler = new ControlHandler(new DateManager());
            await testE2E(requestHandler, [
                'U: change', TestInput.of(GeneralControlIntent.of({ action: $.Action.Change })),
                'A: What should I change it to?',
                'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2018' })),
                'A: Sorry but that\'s not a valid date because the date cannot be less than today. What should I change it to?',
                'U: 2021', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2021' })),
                'A: Changed from 2018 to 2021.'
            ]);
        });

        test('date valid, needs explicit affirming', async () => {
            const requestHandler = new ControlHandler(new DateManagerWithConfirmation());
            await testE2E(requestHandler, [
                'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2018' })),
                'A: Was that 2018?',
                'U: Yeah.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
        });

        test('date value after disaffirmation, requires request value act', async () => {
            const requestHandler = new ControlHandler(new DateManagerWithConfirmation());
            await testE2E(requestHandler, [
                'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2018' })),
                'A: Was that 2018?',
                'U: No.', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
                'A: My mistake. What date?'
            ]);
        });

        test('date value set and changing it requires value changed act', async () => {
            const requestHandler = new ControlHandler(new DateManagerWithConfirmation());
            await testE2E(requestHandler, [
                'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2018' })),
                'A: Was that 2018?',
                'U: Yes.', TestInput.of(GeneralControlIntent.of({ feedback: $.Feedback.Affirm })),
                'A: Great.',
                'U: Change to 08-12-1993.', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '08-12-1993', "action": $.Action.Change })),
                'A: Was that 08-12-1993?',
                'U: Yes.', TestInput.of(GeneralControlIntent.of({ feedback: $.Feedback.Affirm })),
                'A: Great.'
            ]);
        });

        test('date value set and changing it to invalid requires confirmation and checks for validations', async () => {
            const requestHandler = new ControlHandler(new DateManagerWithConfirmation());
            await testE2E(requestHandler, [
                'U: 2018', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2018' })),
                'A: Was that 2018?',
                'U: Yes.', TestInput.of(GeneralControlIntent.of({ feedback: $.Feedback.Affirm })),
                'A: Great.',
                'U: Change to 2021.', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2021', "action": $.Action.Change })),
                'A: Sorry but that\'s not a valid date because the date cannot be greater than today. What should I change it to?',
                'U: 2000.', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2000'})),
                'A: Was that 2000?',
                'U: No.', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
                'A: My mistake. What date?',
                'U: 2016.', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, { "AMAZON.DATE": '2016'})),
                'A: Was that 2016?',
                'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
                'A: Great.'
            ]);
        });
    });
});
