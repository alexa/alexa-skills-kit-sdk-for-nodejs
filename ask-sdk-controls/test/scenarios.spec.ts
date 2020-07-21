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

import { expect } from "chai";
import { suite, test } from "mocha";
import { AmazonBuiltInSlotType } from '../src';
import { NumberControl } from '../src/commonControls/NumberControl';
import { ValueControl } from '../src/commonControls/ValueControl';
import { Strings as $ } from "../src/constants/Strings";
import { ContainerControl } from '../src/controls/ContainerControl';
import { Control } from '../src/controls/Control';
import { ControlInput } from '../src/controls/ControlInput';
import { ControlManager } from '../src/controls/ControlManager';
import { ControlResultBuilder } from '../src/controls/ControlResult';
import { GeneralControlIntent } from '../src/intents/GeneralControlIntent';
import { SingleValueControlIntent } from '../src/intents/SingleValueControlIntent';
import { SessionBehavior } from '../src/runtime/SessionBehavior';
import { ValueChangedAct, ValueSetAct } from '../src/systemActs/ContentActs';
import { RequestChangedValueAct, RequestValueAct } from '../src/systemActs/InitiativeActs';
import { SystemAct } from '../src/systemActs/SystemAct';
import { findControlById, simpleInvoke, TestInput, waitForDebugger } from "../src/utils/testSupport/TestingUtils";
import { GameStrings as $$ } from "./game_strings";

waitForDebugger();


suite("== Single value selector scenarios ==", () => {

    class SingleSelectorManager extends ControlManager {
        createControlTree(state: any): Control {
            const topControl = new ContainerControl({ id: "root" });
            topControl.addChild(new ValueControl(
                {
                    id: $$.ID.PlayerName,
                    slotType: 'CUSTOM.name',
                    prompts: { requestValue: "none" },
                    interactionModel: { targets: [$$.Target.Name] }
                }
            ));

            return topControl;
        }
    }
    test("simple set-value input should be processed.", async () => {

        // Note: this test demonstrates calling handle() on a single control (yielding a ControlResult)

        const rootControl = new SingleSelectorManager().createControlTree({});
        const input = TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.Name, 'CUSTOM.name': "Mike" }));
        const result = new ControlResultBuilder(undefined!);
        await rootControl.canHandle(input);
        await rootControl.handle(input, result);
        const playerNameState = findControlById(rootControl, $$.ID.PlayerName);
        expect(playerNameState.state.value).eq("Mike");
        expect(result.acts).length(1);
        expect(result.acts[0]).instanceOf(ValueSetAct);
    });

    test("valueType mismatch should cause processing to throw", async () => {
        const rootControl = new SingleSelectorManager().createControlTree({});
        const input = TestInput.of(SingleValueControlIntent.of('AMAZON.Number', { 'action': $.Action.Set, 'target': $$.Target.Name, 'AMAZON.Number': 'Mike' }));
        expect(async () => { await rootControl.handle(input, new ControlResultBuilder(undefined!)); }).throws;
    });


    test("session ending due to lack of initiative", async () => {
        const rootControl = new SingleSelectorManager().createControlTree({});
        const input = TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.Name, 'CUSTOM.name': "Mike" }));
        const result = await simpleInvoke(rootControl, input);
        expect(result.acts[0]).instanceOf(ValueSetAct);
        expect(result.sessionBehavior).equals(SessionBehavior.OPEN);
    });
});


suite("== Two controls that collect numbers. One is ValueControl{AMAZON.NUMBER} and other is NumberControl ==", () => {

    const PLAYER_COUNT = 'playerCount'; // used for both controlID and target.
    const PLAYER_AGE = 'playerAge'; // used for both controlID and target.

    class TwoSelectorManager extends ControlManager {

        createControlTree(state?: any, input?: ControlInput): Control {
            const rootControl = new ContainerControl({ id: 'root' });

            rootControl
                .addChild(
                    new ValueControl(
                        {
                            id: PLAYER_COUNT,
                            slotType: 'AMAZON.NUMBER',
                            prompts: { requestValue: "none" },
                            interactionModel: { targets: [PLAYER_COUNT] }
                        }))
                .addChild(
                    new NumberControl(
                        {
                            id: PLAYER_AGE,
                            prompts: { requestValue: "none" },
                            interactionModel: { targets: [PLAYER_AGE] }
                        }));

            return rootControl;
        }
    }

    test("U: set count, A: move focus and ask question", async () => {

        // Note: this test demonstrates calling simpleInvoke() which includes the initiative phase (yielding a composite ControlResult)

        const rootControl = new TwoSelectorManager().createControlTree({});
        const input = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'action': $.Action.Set, 'target': PLAYER_COUNT, 'AMAZON.NUMBER' : "3" }));
        const result = await simpleInvoke(rootControl, input);
        const playerCountState = findControlById(rootControl, PLAYER_COUNT);
        expect(playerCountState.state.value).eq("3");
        expect(result.acts[0]).instanceOf(ValueSetAct);
        expect(result.acts[1]).instanceOf(RequestValueAct);
    });

    test("U: set count, A:move focus and ask question, U: change count to specific value", async () => {
        const rootControl = new TwoSelectorManager().createControlTree({});

        // -- turn 1
        const input1 = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'action': $.Action.Set, 'target': PLAYER_COUNT, 'AMAZON.NUMBER': "3" }));
        const result1 = await simpleInvoke(rootControl, input1);

        expect(result1.acts).length(2);
        expect((result1.acts[1] as SystemAct).control.id).eq(PLAYER_AGE); // <-- ask for age

        // -- turn 2
        const request2 = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'action': $.Action.Change, 'target': PLAYER_COUNT, 'AMAZON.NUMBER': "4" }));
        const result2 = await simpleInvoke(rootControl, request2);

        const playerCountState = findControlById(rootControl, PLAYER_COUNT);
        expect(playerCountState.state.value).eq("4"); // <--- changed successfully
        expect(result2.acts[0]).instanceOf(ValueChangedAct); // <--- appropriate feedback act
        expect(result2.acts[1]).instanceOf(RequestValueAct); // <-- ask for age again.
        expect((result2.acts[1] as SystemAct).control.id).eq(PLAYER_AGE); // <-- ask for age again.
    });


    test("U: set count, A:move focus and ask question, U: change count, A: request value, U: give value (multi-step set)", async () => {
        const rootControl = new TwoSelectorManager().createControlTree();

        // -- turn 1
        const input1 = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'action': $.Action.Set, 'target': PLAYER_COUNT, 'AMAZON.NUMBER': "3" }));
        const result1 = await simpleInvoke(rootControl, input1);
        expect(result1.acts).length(2);
        expect(result1.acts[1]).instanceof(RequestValueAct);

        // -- turn 2
        const input2 = TestInput.of(GeneralControlIntent.of({ action: $.Action.Change, target: PLAYER_COUNT }));
        const result2 = await simpleInvoke(rootControl, input2);
        expect(result2.acts[0]).instanceOf(RequestChangedValueAct);
        expect((result2.acts[0] as SystemAct).control.id).eq(PLAYER_COUNT);

        // -- turn 3
        const input3 = TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'AMAZON.NUMBER': '4' }));
        const result3 = await simpleInvoke(rootControl, input3);

        expect(result3.acts[0]).instanceOf(ValueChangedAct);
        expect((result3.acts[0] as SystemAct).control.id).eq(PLAYER_COUNT);
        expect(result3.acts[1]).instanceOf(RequestValueAct);
        expect((result3.acts[1] as SystemAct).control.id === PLAYER_AGE);
    });
});
