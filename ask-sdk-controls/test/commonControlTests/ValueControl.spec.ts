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

import { suite, test } from 'mocha';
import { Strings as $ } from "../../src/constants/Strings";
import { Control } from '../../src/controls/Control';
import { ControlManager } from '../../src/controls/ControlManager';
import { SingleValueControlIntent } from '../../src/intents/SingleValueControlIntent';
import { AmazonIntent } from '../../src/intents/AmazonBuiltInIntent';
import { ControlHandler } from '../../src/runtime/ControlHandler';
import { testE2E, TestInput, waitForDebugger } from '../../src/utils/testSupport/TestingUtils';
import { ValueControl } from '../../src/commonControls/ValueControl';
import { IntentBuilder } from '../../src/utils/IntentUtils';

waitForDebugger();

suite('ValueControl e2e tests', () => {
    class ValueControlManager extends ControlManager {
        createControlTree(state: any): Control {
            return new ValueControl({
                id: 'userName',
                slotType: 'LOGIN.name',
                confirmationRequired: true,
                validation: (state, input) => ['Alexa', 'Amazon', 'Redfox'].includes(state.value!) ? true : { renderedReason: 'Login name validation failed' },
                prompts: {
                    requestValue: 'What is your login name?',
                    valueSet: ''
                },
            });
        }
    }

    test('userName value valid, needs explicit affirming', async () => {
        const requestHandler = new ControlHandler(new ValueControlManager());
        await testE2E(requestHandler, [
            'U: Amazon', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Amazon' })),
            'A: Was that Amazon?',
            'U: Yeah.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.'
        ]);
    });

    test('userName value after disaffirmation, requires request value act', async () => {
        const requestHandler = new ControlHandler(new ValueControlManager());
        await testE2E(requestHandler, [
            'U: Amazon', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Amazon' })),
            'A: Was that Amazon?',
            'U: No.', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
            'A: My mistake. What is your login name?'
        ]);
    });

    test('userName value set and changing it requires confirmation and value changed act', async () => {
        const requestHandler = new ControlHandler(new ValueControlManager());
        await testE2E(requestHandler, [
            'U: Alexa', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Alexa' })),
            'A: Was that Alexa?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.',
            'U: Change to Redfox.', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Redfox', "action": $.Action.Change})),
            'A: OK, I changed it to Redfox. Was that Redfox?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.',
        ]);
    });

    test('userName value set and changing it to invalid requires confirmation and checks for validations', async () => {
        const requestHandler = new ControlHandler(new ValueControlManager());
        await testE2E(requestHandler, [
            'U: Alexa', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Alexa' })),
            'A: Was that Alexa?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.',
            'U: Change to Apple.', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Apple', "action": $.Action.Change})),
            'A: Sorry, Apple is not a valid choice because Login name validation failed. What should I change it to?',
            'U: Amazon', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Amazon' })),
            'A: OK, I changed it to Amazon. Was that Amazon?',
            'U: No.', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
            'A: My mistake. What is your login name?',
            'U: Amazon', TestInput.of(SingleValueControlIntent.of('LOGIN.name', { 'LOGIN.name': 'Amazon' })),
            'A: OK, I changed it to Amazon. Was that Amazon?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.'
        ]);
    });
});