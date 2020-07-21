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
import { LiteralContentAct, SingleValueControlIntent, unpackSingleValueControlIntent, ValueControl, ValueControlProps, ValueControlState, ValueSetAct } from '../src';
import { Strings as $ } from "../src/constants/Strings";
import { ContainerControl, ContainerControlState } from '../src/controls/ContainerControl';
import { Control } from '../src/controls/Control';
import { ControlInput } from '../src/controls/ControlInput';
import { ControlManager } from '../src/controls/ControlManager';
import { ControlResultBuilder } from '../src/controls/ControlResult';
import { GeneralControlIntent, unpackGeneralControlIntent } from '../src/intents/GeneralControlIntent';
import { ControlHandler } from '../src/runtime/ControlHandler';
import { moveArrayItem } from '../src/utils/ArrayUtils';
import { SkillInvoker } from '../src/utils/testSupport/SkillInvoker';
import { wrapRequestHandlerAsSkill } from '../src/utils/testSupport/SkillWrapper';
import { TestInput, waitForDebugger } from '../src/utils/testSupport/TestingUtils';


waitForDebugger();

/**
 * An example of a container than manages a variable number of child controls.
 */
suite("== dynamic controls ==", () => {
    test("e2e", async () => {
        let response;

        const requestHandler = new ControlHandler(new VariableControlsManager());
        const skill = new SkillInvoker(wrapRequestHandlerAsSkill(requestHandler));

        // Note: this test demonstrates SkillInvoker.invoke() directly to observe all the surface form details of the response.

        response = await skill.invoke(TestInput.of(GeneralControlIntent.of({ action: $.Action.Set }))); // TODO: Update tests to better demonstrate dynamic trees support.
        expect(response.prompt).equals("I have 1 child control. What value for number 1?");

        response = await skill.invoke(TestInput.of(GeneralControlIntent.of({ action: "addAnother" })));
        expect(response.prompt).equals("I have 2 child controls. What value for number 1?");

        response = await skill.invoke(TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'CUSTOM.name': 'bob' })));
        expect(response.prompt).equals("OK. I have 2 child controls. What value for number 2?");

        response = await skill.invoke(TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'CUSTOM.name': 'frank' })));
        expect(response.prompt).equals("OK. I have 2 child controls.");
        expect(response.reprompt).equals("OK. I have 2 child controls.");
    });
});

export class MyMultiControlState extends ContainerControlState {
    count: number;
}

export class MyMultiControl extends ContainerControl {

    state: MyMultiControlState;

    constructor(props: { id: string }, initialState?: MyMultiControlState) {
        super(props);
        this.state = initialState ?? new MyMultiControlState();
    }

    async canHandle(input: ControlInput): Promise<boolean> {
        const request = input.request;
        if (request.type !== 'IntentRequest') {
            return false;
        }
        const intent = request.intent;

        const unpacked = (intent.name === 'GeneralControlIntent')
            ? unpackGeneralControlIntent(intent)
            : unpackSingleValueControlIntent(intent);

        if (unpacked.action === 'addAnother') {
            return true;
        }

        return this.canHandleByChild(input);
    }

    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        const request = input.request;
        if (request.type !== 'IntentRequest') {
            throw new Error();
        }
        const intent = request.intent;
        const unpacked = (intent.name === 'GeneralControlIntent')
            ? unpackGeneralControlIntent(intent)
            : unpackSingleValueControlIntent(intent);

        /*
         * Special behavior #1: Always include the content act to state how many controls we currently have.
         * Special behavior #2: If the action is addAnother, then handle it directly
         * Default behavior: do the usual containerControl handling. and merge with Special behavior #1.
         */

        if (unpacked.action === 'addAnother') {
            this.state.count = this.state.count + 1;
            resultBuilder.addAct(this.createContentAct(this.state.count));
            this.children.push(MyMultiControl.makeValueControl(this.state.count));
            return;
        }

        resultBuilder.addAct(this.createContentAct(this.state.count));
        await this.handleByChild(input, resultBuilder);

        /*
         * [1] Because handleByChild can produce multiple acts, after the merge we may end up with a strange ordering
         * .. so we detect it and fix it.
         *     [ contentAct, valueSetAct, <initiativeAct> ]
         *        ^-- reorder these --^
         */
        if (resultBuilder.acts[0] instanceof LiteralContentAct && resultBuilder.acts[1] instanceof ValueSetAct) {
            moveArrayItem(resultBuilder.acts, 1, 0);
        }

        return;
    }

    createContentAct(count: number): LiteralContentAct {
        return new LiteralContentAct(this, {promptFragment: `I have ${count} child control${count === 1 ? '' : 's'}.`});
    }

    public static makeValueControl(index: number): Control {
        return new MyValueControl({
            id: `value${index.toString()}`,
            slotType: 'CUSTOM.name',
            prompts: {
                requestValue: act => `What value for number ${(act.control as MyValueControl).index}?`,
                valueSet: 'OK.'
            },
            reprompts: {
                requestValue: act => `What value for number ${(act.control as MyValueControl).index}?`,
                valueSet: 'OK.'
            },
            interactionModel: { targets: ['name'] },
            index
        });
    }
}

export class VariableControlsManager extends ControlManager {

    public createControlTree(state: any): Control {

        const controlCount = state.multiValueContainer !== undefined ? state.multiValueContainer.count !== undefined ? state.multiValueContainer.count : 1 : 1;
        const topControl = new MyMultiControl(
            { id: 'multiValueContainer' },
            { count: 1 }
        );

        for (let i = 1; i <= controlCount; i++) {
            topControl.addChild(MyMultiControl.makeValueControl(i));
        }

        return topControl;
    }

}



interface MyValueControlProps extends ValueControlProps {
    index: number;
}

class MyValueControlState extends ValueControlState {
    count: number;
}

class MyValueControl extends ValueControl {
    index: number;

    state: MyValueControlState;

    constructor(props: MyValueControlProps) {
        super(props);
        this.index = props.index;
    }
}