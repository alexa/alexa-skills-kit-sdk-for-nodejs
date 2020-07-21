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
import { Control, SystemAct, TestInput, testTurn, waitForDebugger } from '../src';
import { ControlProps, ControlState } from '../src/controls/Control';
import { ControlInput } from '../src/controls/ControlInput';
import { ControlManager } from '../src/controls/ControlManager';
import { ControlResultBuilder } from '../src/controls/ControlResult';
import { GeneralControlIntent } from '../src/intents/GeneralControlIntent';
import { ControlResponseBuilder } from '../src/responseGeneration/ControlResponseBuilder';
import { ControlHandler } from '../src/runtime/ControlHandler';
import { SkillInvoker } from '../src/utils/testSupport/SkillInvoker';

waitForDebugger();


/*
 * Tests a control that has state (Set<string>) that doesn't automatically serialize with JSON.stringify.
 *
 * The test shows the control changing state and being serialized and deserialized.
 * To accomplish this, the state object implements toJSON() and assign()
 *   - the name and signature for toJSON() is defined by JSON.stringify and called automatically by JSON.stringify
 *   - the name and signature for fromJSON() is defined by the Control framework and used as an alternative to Object.assign() when present.

 */
suite("== Custom Serde ==", () => {

    test('explicit confirmation and disaffirm', async () => {
        // Note: this test demonstrates using testTurn to run a multi-turn scenario with assertions between turns.
        const requestHandler = new ControlHandler(new CustomSerdeControlManager());
        const invoker = new SkillInvoker(requestHandler);
        await testTurn(
            invoker,
            'U: ', TestInput.of(GeneralControlIntent.of({})),
            'A:');


        expect((requestHandler.getSerializableControlStates().customControl as string[])[0]).exist.and.equals('x');

        await testTurn(
            invoker,
            'U: ', TestInput.of(GeneralControlIntent.of({})),
            'A:');

        expect((requestHandler.getSerializableControlStates().customControl as string[])[0]).exist.and.equals('y');
    });
});

class CustomSerdeControlManager extends ControlManager {

    createControlTree(state: any): Control {
        return new CustomSerdeControl(
            {
                id: 'customControl'
            }
        );
    }
}

class CustomSerdeControlState implements ControlState {
    value: Set<string>;

    constructor(value: Set<string>) {
        this.value = value;
    }
}

class CustomSerdeControl extends Control {

    state: CustomSerdeControlState;

    constructor(props: ControlProps, state?: CustomSerdeControlState) {
        super(props.id);
        this.state = state ?? new CustomSerdeControlState(new Set<string>());
    }


    canHandle(input: ControlInput): boolean {
        return true;
    }

    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        if (this.state.value.size === 0) {
            this.state.value.add('x');
        }
        else if (this.state.value.size === 1 && this.state.value.has('x')) {
            this.state.value.delete('x');
            this.state.value.add('y');
        }

        return;
    }

    canTakeInitiative(input: ControlInput): boolean {
        return false;
    }
    async takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getSerializableState(): string[] {
        // render the set as a simple list.
        return [... this.state.value.keys()];
    }

    setSerializableState(obj: string[]) {
        if (obj !== undefined) {
            // refreshes the set from the serialized array
            this.state.value = new Set();
            for (const x of obj) {
                this.state.value.add(x);
            }
        }
    }

    renderAct(act: SystemAct, input: ControlInput, builder: ControlResponseBuilder): void {
        throw new Error("Method not implemented.");
    }
}
