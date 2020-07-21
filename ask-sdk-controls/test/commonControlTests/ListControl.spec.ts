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
import { ControlHandler } from '../../src/runtime/ControlHandler';
import { testE2E, TestInput, waitForDebugger } from '../../src/utils/testSupport/TestingUtils';
import { ListControl } from '../../src/commonControls/listControl/ListControl';
import { IntentBuilder } from '../../src/utils/IntentUtils';
import { AmazonIntent } from '../../src/intents/AmazonBuiltInIntent';

waitForDebugger();

suite('ListControl e2e tests', () => {
    class ListControlManager extends ControlManager {
        createControlTree(state: any): Control {
            return new ListControl({
                id: 'apple',
                validation: (state, input) => ['iPhone', 'iPad', 'MacBook'].includes(state.value!) ? true : { renderedReason: 'Apple Suite category validation failed' },
                listItemIDs: ['iPhone', 'iPad', 'MacBook'],
                slotType: 'AppleSuite',
                confirmationRequired: true,
                prompts: {
                    valueSet: '',
                }
            });
        }
    }

    test('product value valid, needs explicit affirming', async () => {
        const requestHandler = new ControlHandler(new ListControlManager());
        await testE2E(requestHandler, [
            'U: iPhone', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'iPhone' })),
            'A: Was that iPhone?',
            'U: Yeah.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.'
        ]);
    });

    test('product value after disaffirmation, requires request value act', async () => {
        const requestHandler = new ControlHandler(new ListControlManager());
        await testE2E(requestHandler, [
            'U: iPhone', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'iPhone' })),
            'A: Was that iPhone?',
            'U: No.', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
            'A: My mistake. What is your selection? Some suggestions are iPhone, iPad or MacBook.'
        ]);
    });

    test('product value set and changing it requires confirmation and value changed act', async () => {
        const requestHandler = new ControlHandler(new ListControlManager());
        await testE2E(requestHandler, [
            'U: iPhone', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'iPhone' })),
            'A: Was that iPhone?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.',
            'U: Change to iPad.', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'iPad', action: $.Action.Change})),
            'A: OK, I changed it to iPad. Was that iPad?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.'
        ]);
    });

    test('product value set and changing it to invalid requires confirmation and checks for validations', async () => {
        const requestHandler = new ControlHandler(new ListControlManager());
        await testE2E(requestHandler, [
            'U: iPhone', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'iPhone' })),
            'A: Was that iPhone?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.',
            'U: Change to Airpods.', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'Airpods', action: $.Action.Change})),
            'A: Sorry, Airpods is not a valid choice because Apple Suite category validation failed. What should I change it to? Some suggestions are iPhone, iPad or MacBook.',
            'U: iPad', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'iPad' })),
            'A: OK, I changed it to iPad. Was that iPad?',
            'U: No.', TestInput.of(IntentBuilder.of(AmazonIntent.NoIntent)),
            'A: My mistake. What is your selection? Some suggestions are iPhone, iPad or MacBook.',
            'U: iPad', TestInput.of(SingleValueControlIntent.of('AppleSuite', { AppleSuite: 'iPad' })),
            'A: OK, I changed it to iPad. Was that iPad?',
            'U: Yes.', TestInput.of(IntentBuilder.of(AmazonIntent.YesIntent)),
            'A: Great.'
        ]);
    });
});
