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
import _ from "lodash";
import { suite, test } from "mocha";
import { Strings as $ } from "../src/constants/Strings";
import { Control } from '../src/controls/Control';
import { ControlInput } from '../src/controls/ControlInput';
import { ControlManager } from '../src/controls/ControlManager';
import { ControlResultBuilder } from '../src/controls/ControlResult';
import { throwIf } from '../src/utils/ErrorUtils';
import { simpleInvoke, TestInput } from '../src/utils/testSupport/TestingUtils';
import { GameStrings as $$ } from "./game_strings";
import { SingleValueControlIntent } from '../src/intents/SingleValueControlIntent';
import { GeneralControlIntent } from '../src/intents/GeneralControlIntent';
import { RequestValueAct } from '../src/systemActs/InitiativeActs';
import { SystemAct } from '../src/systemActs/SystemAct';
import { ContainerControl } from '../src/controls/ContainerControl';
import { ValueControl } from '../src/commonControls/ValueControl';
import { NumberControl } from '../src/commonControls/NumberControl';


/**
 * Demonstrate standard ControlState object but with different Controls to handle them
 * the choice of control to use is by controlState.type and by registering the control types
 * with the UserInterface so that it can function as a control factory.
 */
suite("== Custom policy scenarios (custom_policy.ts) ==", () => {
    test("container with custom canHandle that always returns false.", async () => {
        const rootControl = new CustomManager('never').createControlTree();
        const input = TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.Name, 'CUSTOM.name': "Mike" }));
        const result = await simpleInvoke(rootControl, input);
        expect(result.acts).length(0);
    });

    test("Default canHandle returns first listed control (playerName)", async () => {
        const rootControl = new CustomManager('normal').createControlTree();
        const input = TestInput.of(GeneralControlIntent.of({ action: $.Action.Set })); // TODO:handle SingleValueControlIntent with just slotTypes
        const result = await simpleInvoke(rootControl, input);
        expect(result.acts[0]).instanceOf(RequestValueAct);
        expect((result.acts[0] as SystemAct).control.id).equals($$.ID.PlayerName);
    });

    test("Custom policy for container.canHandle returns different initiative control (playerAge rather than playerName)", async () => {
        const rootControl = new CustomManager('reverse').createControlTree();
        const input = TestInput.of(GeneralControlIntent.of({ action: $.Action.Set })); // TODO:handle SingleValueControlIntent with just slotTypes
        const result = await simpleInvoke(rootControl, input);
        expect(result.acts[0]).instanceOf(RequestValueAct);
        expect((result.acts[0] as SystemAct).control.id).equals($$.ID.PlayerAge);   // <====== RESULT: Requesting Age rather than Name.
    });
});

class CustomManager extends ControlManager {
    type: string;

    constructor(type: string) {
        super();
        this.type = type;
    }

    createControlTree(state?: any, input?: ControlInput): Control {
        let topControl: ContainerControl;
        switch (this.type) {
            case 'normal': topControl = new ContainerControl({ id: $$.ID.PlayerContainer }); break;
            case 'never': topControl = new NeverHandlesControl({ id: $$.ID.PlayerContainer }); break;
            case 'reverse': topControl = new ReverseOrderControl({ id: $$.ID.PlayerContainer }); break;
            default: throw new Error();
        }

        topControl.addChild(new ValueControl(
            {
                id: $$.ID.PlayerName,
                slotType: 'CUSTOM.name',
                prompts: { requestValue: "none" },
                interactionModel: { targets: [$$.Target.Name] }
            }
        ));

        topControl.addChild(new NumberControl(
            {
                id: $$.ID.PlayerAge,
                prompts: { requestValue: "none" },
                interactionModel: { targets: [$$.Target.Age] }
            }
        ));

        return topControl;
    }
}

/**
 * A ContainerControl that will never handle an input.
 */

class NeverHandlesControl extends ContainerControl {
    async canHandle(input: ControlInput): Promise<boolean> {
        return false;
    }
}

/**
 * A ContainerControl that iterates its children backwards when looking for a child to handle an input.
 */
class ReverseOrderControl extends ContainerControl {

    async canHandle(input: ControlInput): Promise<boolean> {
        return this.canHandleByChild(input);
    }

    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        return this.handleByChild(input, resultBuilder);
    }

    async canTakeInitiative(input: ControlInput): Promise<boolean> {
        return this.canTakeInitiativeByChild(input);
    }

    async takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        return this.takeInitiativeByChild(input, resultBuilder);
    }

    async decideHandlingChild(candidates: Control[], input: ControlInput): Promise<Control | undefined> {
        throwIf(candidates.length === 0, "options is empty");
        return _.last(candidates)!; // <====== CUSTOM: return last rather than first
    }

    async decideInitiativeChild(candidates: Control[], input: ControlInput): Promise<Control | undefined> {
        throwIf(candidates.length === 0, "options is empty");
        return _.last(candidates)!; // <====== CUSTOM: return last rather than first
    }
}