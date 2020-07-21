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

import { IntentRequest } from 'ask-sdk-model';
import { expect } from "chai";
import { suite, test } from "mocha";
import {
    AmazonBuiltInSlotType, ContainerControl, ContainerControlProps, Control, ControlResultBuilder, InvalidValueAct, ListControl,
    NumberControl, RequestChangedValueAct, RequestValueAct, SingleValueControlIntent, SystemAct, ValueControl, ValueSetAct
} from '../src';
import { Strings as $ } from "../src/constants/Strings";
import { ControlInput } from '../src/controls/ControlInput';
import { ControlManager } from '../src/controls/ControlManager';
import { GeneralControlIntent } from '../src/intents/GeneralControlIntent';
import { OrdinalControlIntent } from '../src/intents/OrdinalControlIntent';
import { ControlHandler } from '../src/runtime/ControlHandler';
import { SessionBehavior } from '../src/runtime/SessionBehavior';
import { RequestValueByListAct } from "../src/systemActs/InitiativeActs";
import { InputUtil } from "../src/utils/InputUtil";
import { IntentBuilder, SimplifiedIntent } from '../src/utils/IntentUtils';
import { SkillInvoker } from '../src/utils/testSupport/SkillInvoker';
import { wrapRequestHandlerAsSkill } from '../src/utils/testSupport/SkillWrapper';
import { findControlById, simpleInvoke, TestInput, waitForDebugger } from '../src/utils/testSupport/TestingUtils';
import { GameStrings as $$ } from "./game_strings";


waitForDebugger();

suite("== game_e2e.ts ==", () => {
    suite("== demo game UI, directly hitting coreProcess() ==", () => {
        test("direct set a few values across player and pet containers", async () => {
            const rootControl = new GameManager().createControlTree();

            const result1 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.Name, 'CUSTOM.name': "Mike" })));
            const result2 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'action': $.Action.Set, 'target': $$.Target.Age, 'AMAZON.NUMBER': "20" })));
            const result3 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of('PlayerClass', { action: $.Action.Set, target: $$.Target.CharClass, PlayerClass: 'elf' })));
            expect(result3.acts).length(2);
            expect(result3.acts[0]).instanceOf(ValueSetAct);
            expect(result3.acts[1]).instanceOf(RequestValueByListAct);
            expect((result3.acts[1] as SystemAct).control.id).equals($$.ID.PetSpecies);

            const result4 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of('PetSpecies', { action: $.Action.Set, target: $$.Target.Species, PetSpecies: 'cat' })));
            const result5 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.PetName, 'CUSTOM.name': "Coco" })));
            expect(result5.acts).length(1);
            expect(result5.acts[0]).instanceOf(ValueSetAct);
            expect(result5.sessionBehavior).equals(SessionBehavior.OPEN);
            expect(findControlById(rootControl, $$.ID.PetName).state.value).eq("Coco");
        });

        test("request class value (by list)", async () => {
            const rootControl = new GameManager().createControlTree();

            const result1 = await simpleInvoke(rootControl, TestInput.of(GeneralControlIntent.of({ action: $.Action.Set, target: $$.Target.CharClass })));
            expect(result1.acts).length(1);
            expect(result1.acts[0]).instanceOf(RequestValueByListAct);

            const result2 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of('PlayerClass', { action: $.Action.Set, target: $$.Target.CharClass, PlayerClass: $$.Value.Elf })));
            expect(result2.acts).length(2);
            expect(result2.acts[0]).instanceOf(ValueSetAct);
            expect(result2.acts[1]).instanceOf(RequestValueAct);
            expect((result2.acts[1] as SystemAct).control.id).equal($$.ID.PlayerName);
        });

        test("custom intent setting multiple values via MultiValueContainerControl", async () => {
            const rootControl = new GameManager().createControlTree();

            const input = TestInput.of(IntentBuilder.of(
                "MySetPlayerIntent",
                {
                    name: "Mike",
                    class: "human",
                    age: "20"
                }
            ));

            const result = await simpleInvoke(rootControl, input);
            expect(result.acts).length(1);
            expect(result.acts[0]).instanceOf(RequestValueByListAct);
            expect((result.acts[0] as SystemAct).control.id).equals($$.ID.PetSpecies);
            expect(result.sessionBehavior).equals(SessionBehavior.OPEN);
        });

        test("Set and Change a player name, check act generations due to validation fails", async () => {
            const rootControl = new GameManager().createControlTree();
            const result1 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.Name, 'CUSTOM.name': "Mike" })));
            const result2 = await simpleInvoke(rootControl, TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Change, 'target': $$.Target.Name, 'CUSTOM.name': "Alexa" })));
            expect(result2.acts).length(2);
            expect(result2.acts[0]).instanceOf(InvalidValueAct);
            expect(result2.acts[1]).instanceOf(RequestChangedValueAct);
        });

        test("User selection of player class by choices number", async () => {
            const rootControl = new GameManager().createControlTree();
            const result1 = await simpleInvoke(rootControl, TestInput.of(GeneralControlIntent.of({ action: $.Action.Set, target: $$.Target.CharClass })));
            expect(result1.acts).length(1);
            expect(result1.acts[0]).instanceOf(RequestValueByListAct);
            const result2 = await simpleInvoke(rootControl, TestInput.of(OrdinalControlIntent.of({ "action": $.Action.Select, "target": $$.Target.CharClass, 'AMAZON.Ordinal': '3' })));
            expect((result2.acts[0] as SystemAct).control.id).equal($$.ID.PlayerClass);
            expect(findControlById(rootControl, $$.ID.PlayerClass).state.value).eq($$.Value.Human);
        });
    });

    suite("== demo game UI, e2e with SPI, serde  ==", () => {
        test("e2e", async () => {
            const requestHandler = new ControlHandler(new GameManager());
            const skill = new SkillInvoker(wrapRequestHandlerAsSkill(requestHandler));
            let response;
            response = await skill.invoke(TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.Name, 'CUSTOM.name': "Alexa" })));
            expect(response.prompt).equals("Sorry, Alexa is not a valid choice because playerName Validation Failed. What is your avatar's name?");

            response = await skill.invoke(TestInput.of(SingleValueControlIntent.of('CUSTOM.name', { 'action': $.Action.Set, 'target': $$.Target.Name, 'CUSTOM.name': "Mike" })));
            expect(response.prompt).equals("OK, Mike. How old is your avatar?");

            response = await skill.invoke(TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, {'AMAZON.NUMBER': "25" })));
            expect(response.prompt).equals("Hey, that's my age! Will you be an elf, a dwarf or a human?"); // control specific NLG for feedback

            response = await skill.invoke(TestInput.of(SingleValueControlIntent.of(AmazonBuiltInSlotType.NUMBER, { 'action': $.Action.Change, 'target': $$.Target.Age, 'AMAZON.NUMBER': "24" })));
            expect(response.prompt).equals("Cool. Will you be an elf, a dwarf or a human?"); // control specific NLG for feedback

            response = await skill.invoke(TestInput.of(SingleValueControlIntent.of('PlayerClass', { PlayerClass: "Hobbit" })));
            expect(response.prompt).equals("Sorry, Hobbit is not a valid choice because playerClass validation Failed. Will you be an elf, a dwarf or a human?");

            response = await skill.invoke(TestInput.of(SingleValueControlIntent.of('PlayerClass', { PlayerClass: 'elf' })));
            expect(response.prompt).equals("Got it. Will your pet be a cat or dog?");

            response = await skill.invoke(TestInput.of(SingleValueControlIntent.of('PetSpecies', { PetSpecies: 'cat' })));
            expect(response.prompt).equals("OK, cat. What shall we name your cat?"); // contextual NLG.  lambda picking up value of "pet species"
        });
    });
});

export class GameManager extends ControlManager {

    public createControlTree(state?: any, input?: ControlInput): Control {

        const topControl = new ContainerControl({ id: $$.ID.GameContainer });

        // --- Player
        const playerContainer = new PlayerContainer({ id: $$.ID.PlayerContainer });
        topControl.addChild(playerContainer);


        // --- Pet
        const petContainer = new ContainerControl({ id: $$.ID.PetContainer });
        topControl.addChild(petContainer);

        petContainer.addChild(new ListControl(
            {
                id: $$.ID.PetSpecies,
                listItemIDs: this.getPetSpecies(),
                slotType: 'PetSpecies',
                validation: [(state, input) => this.getPetSpecies().includes(state.value!) ? true : { renderedReason: 'petSpecies validation failed'}],
                prompts: {
                    requestValue: "Will your pet be a cat or dog?"
                },
                interactionModel: { targets: [$$.Target.Species] }
            }
        )).addChild(new ValueControl(
            {
                id: $$.ID.PetName,
                slotType: 'CUSTOM.name',
                prompts: {
                    requestValue: (act, input) => `What shall we name your ${(input.controls[$$.ID.PetSpecies] as ListControl).state.value ?? 'pet'}?`
                },
                interactionModel: { targets: [$$.Target.Name, $$.Target.PetName] }
            }
        ));
        return topControl;
    }

    getPetSpecies(): string[] {
        return [$$.Value.Cat, $$.Target.Species, $$.Value.Dog, $$.Target.Species];
    }


}

class PlayerContainer extends ContainerControl {

    playerNameControl = new ValueControl(
        {
            id: $$.ID.PlayerName,
            slotType: 'CUSTOM.name',
            validation: [(state, input) => ['Mike', 'Dave'].includes(state.value!) ? true : { renderedReason: 'playerName Validation Failed' }],
            prompts: {
                requestValue: "What is your avatar's name?",
            },
            interactionModel: { targets: [$$.Target.Name, $$.Target.AvatarName] }
        }
    );

    playerAgeControl = new NumberControl(
        {
            id: $$.ID.PlayerAge,
            prompts: {
                requestValue: "How old is your avatar?",
                valueSet: act => act.payload.value === 25 ? "Hey, that's my age!" : 'Cool.',
                // valueChanged: 'Cool.'
            },
            interactionModel: { targets: [$$.Target.Age] }
        }
    );

    playerClassControl = new ListControl(
        {
            id: $$.ID.PlayerClass,
            listItemIDs: this.getPlayerClass(),
            slotType: 'PlayerClass',
            validation: [(state, input) => this.getPlayerClass().includes(state.value!) ? true : { renderedReason: 'playerClass validation Failed' }],
            prompts: {
                requestValue: "Will you be an elf, a dwarf or a human?",
                valueSet: 'Got it.'
            },
            interactionModel: { targets: [$$.Target.CharClass] }
        }
    );

    constructor(props: ContainerControlProps) {
        super(props);
        this.addChild(this.playerNameControl)
            .addChild(this.playerAgeControl)
            .addChild(this.playerClassControl);
    }

    getPlayerClass(): string[] {
        return [$$.Value.Elf, $$.Value.Dwarf, $$.Value.Human];
    }

    async canHandle(input: ControlInput): Promise<boolean> {
        return InputUtil.isIntent(input, 'MySetPlayerIntent')
            || this.canHandleByChild(input);
    }

    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        if (InputUtil.isIntent(input, 'MySetPlayerIntent')) {
            const intent = SimplifiedIntent.fromIntent((input.request as IntentRequest).intent);
            if (intent.slotResolutions.name !== undefined) {
                const nameSlotResolution = intent.slotResolutions.name;
                this.playerNameControl.setValue(nameSlotResolution.slotValue, nameSlotResolution.isEntityResolutionMatch);
            }
            if (intent.slotResolutions.age !== undefined) {
                const ageSlotResolution = intent.slotResolutions.age;
                this.playerAgeControl.setValue(Number.parseInt(ageSlotResolution.slotValue, 10));
            }
            if (intent.slotResolutions.class !== undefined) {
                const classSlotResolution = intent.slotResolutions.class;
                this.playerClassControl.setValue(classSlotResolution.slotValue, classSlotResolution.isEntityResolutionMatch);
            }
            return;
        }
        return this.handleByChild(input, resultBuilder);
    }
}