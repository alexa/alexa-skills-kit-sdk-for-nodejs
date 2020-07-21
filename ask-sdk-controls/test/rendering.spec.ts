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
import i18next from 'i18next';
import { suite, test } from "mocha";
import sinon from 'sinon';
import { ControlHandler, ControlResponseBuilder, InvalidValueAct, RequestValueAct, SkillInvoker, SystemAct, UnusableInputValueAct, ContainerControl, DateControl, DateControlValidations, SingleValueControlIntent, AmazonBuiltInSlotType } from '../src';
import { Control } from '../src/controls/Control';
import { ControlInput } from '../src/controls/ControlInput';
import { ControlManager } from '../src/controls/ControlManager';
import { ControlResult, ControlResultBuilder } from '../src/controls/ControlResult';
import { GeneralControlIntent } from '../src/intents/GeneralControlIntent';
import { TestInput, testTurn } from '../src/utils/testSupport/TestingUtils';


class RenderingDemoControl extends Control {
    canHandle(input: ControlInput): boolean {
        return true;
    }

    handle(input: ControlInput, resultBuilder: ControlResultBuilder): void {

        // Adds three system acts to the result for demonstration purposes.

        /* The UnusableInputValueAct act includes some surface information (renderedReason) so that the act can use default render logic
         * This breaks the separation of Controller & View, but can be handy for simple cases. The simplest acts, e.g. ValueSetAct,
         * don't require any data for their defaults.
         *
         * Production code will likely not use this approach.
         */
        resultBuilder.addAct(new UnusableInputValueAct(this, {reasonCode:'exampleReasonCode', value: '<dummy>', renderedReason: 'That input is unusable for reasons'}));

        /*
         * The next two are 'pure' acts that will be translated during the render-phase.
         * The InvalidValueAct is rendered by this Control in renderAct().  This is the most common approach.
         * The RequestValueAct is rendered by the ControlManager in render(). This is used when full control is necessary, such as to render two acts as a cohesive pair.
         */

        resultBuilder.addAct(new InvalidValueAct(this, {reasonCode:'exampleReasonCode', value: '<dummy>'}));
        resultBuilder.addAct(new RequestValueAct(this, {}));

    }

    canTakeInitiative(input: ControlInput): boolean {
        return false;
    }

    takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): void {
    }

    renderAct(act: SystemAct, input: ControlInput, responseBuilder: ControlResponseBuilder): void {
        if (act instanceof InvalidValueAct){
            responseBuilder.addPromptFragment('The current value is invalid.'); // <<---- 'rendering by Control'. this is the most common approach
        }
        else {
            super.renderAct(act, input, responseBuilder); // <<---- super.renderAct delegates to act.render(). this is 'self-render'. see UnusableInputValueAct.render()
        }
    }
}

class RenderingDemoControlManager extends ControlManager {

    createControlTree(state?: any, input?: ControlInput): Control {
        return new RenderingDemoControl('root');
    }

    render(result: ControlResult, input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void | Promise<void> {

        for (const act of result.acts) {
            if (act instanceof RequestValueAct){
                controlResponseBuilder.addPromptFragment('How many ducks?'); // <<---- 'render by ControlManager'.. this offers maximum power.
            }
            else {
                act.control.renderAct(act, input, controlResponseBuilder); // <<---- the general case is to 'render by Control'
            }
        }
    }
}


/**
 * Demonstrate standard ControlState object but with different Controls to handle them
 * the choice of control to use is by controlState.type and by registering the control types
 * with the UserInterface so that it can function as a control factory.
 */
suite("== Result rendering (renderingResult.spec.ts) ==", () => {
    test("Demonstrate SystemAct self-render & rendering overrides.", async () => {
        const requestHandler = new ControlHandler(new RenderingDemoControlManager());
        const invoker = new SkillInvoker(requestHandler);
        await testTurn(
            invoker,
            'U: ', TestInput.of(GeneralControlIntent.of({})),
            'A: Sorry, That input is unusable for reasons. The current value is invalid. How many ducks?'
        );
    });
});

suite("== i18n overrides scenarios ==", () => {

    class MyControlManager extends ControlManager {
        createControlTree(state: any): Control {
            const topControl = new ContainerControl({ id: "root" });
            topControl.addChild(new DateControl(
                {
                    id: 'DateControl',
                    validation: [DateControlValidations.PAST_DATE_ONLY]
                }
            ));

            return topControl;
        }
    }
    beforeEach(() => {
        // set now to 2019-01-03
        sinon.useFakeTimers(new Date('2019-01-03T21:55:38.151Z'));
    });

    afterEach(() => {
        sinon.restore();
    });
    test("user-defined renderedReason getting translated and used with default InvalidValue prompt", async () => {

        const i18nOverride = {
            en: {
                translation: {
                    DATE_CONTROL_DEFAULT_PROMPT_VALIDATION_FAIL_PAST_DATE_ONLY: 'PAST DATE ONLY PLEASE'
                }
            }
        };

        const requestHandler = new ControlHandler(new MyControlManager({ i18nResources: i18nOverride }));
        const invoker = new SkillInvoker(requestHandler);
        await testTurn(
            invoker,
            'U: 2020', TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.DATE, {'AMAZON.DATE': '2020' })),
            'A: Sorry but that\'s not a valid date because PAST DATE ONLY PLEASE. What date?'
        );
    });
});