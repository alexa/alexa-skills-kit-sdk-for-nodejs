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

import { suite, test } from 'mocha';
import * as _ from 'lodash';
import { v1 } from 'ask-smapi-model';
import { expect } from "chai";
import sinon from 'sinon';
import { ContainerControl, ControlManager, ModelData, Control } from '../../src';
import { SingleValueControlIntent } from '../../src/intents/SingleValueControlIntent';
import { GeneralControlIntent } from '../../src/intents/GeneralControlIntent';
import { ControlInteractionModelGenerator } from '../../src/interactionModelGeneration/ControlInteractionModelGenerator';
import { jsonProvider } from './interactionModelForTest';
import { InteractionModelContributor } from '../../src/controls/mixins/InteractionModelContributor';
import { SharedSlotType } from '../../src/interactionModelGeneration/ModelTypes';
import { Logger } from '../../src/logging/Logger';

import InteractionModelData = v1.skill.interactionModel.InteractionModelData;
import { Resource } from 'i18next';


class SingleValueTestControl extends Control implements InteractionModelContributor {
    // dummy canHandle, handle, canTakeInitiative and takeInitiative cause
    // the ControlInteractionModelGenerator only cares about updateInteractionModel and getTargetIds
    canHandle(): boolean {
        return true;
    }
    handle(): void {}
    canTakeInitiative(): boolean {
        return true;
    }
    takeInitiative(): void {}

    updateInteractionModel(generator: ControlInteractionModelGenerator, imData: ModelData) {
        generator.addControlIntent(new SingleValueControlIntent('TEST'), imData);
    }

    getTargetIds(): string[] {

        return ['test'];
    }
}
class SimpleTestControl extends Control implements InteractionModelContributor {
    canHandle(): boolean {
        return true;
    }
    handle(): void {}
    canTakeInitiative(): boolean {
        return true;
    }
    takeInitiative(): void {}
    updateInteractionModel(generator: ControlInteractionModelGenerator, imData: ModelData) {
        generator.addControlIntent(new GeneralControlIntent(), imData);
    }

    getTargetIds(): string[] {

        return ['test'];
    }
}
class TestControlManager extends ControlManager {
    createControlTree() {
        const rootControl = new ContainerControl({
            id: 'testRootControl',
        });
        rootControl
            .addChild(new SingleValueTestControl('singleValueTestControl'))
            .addChild(new SimpleTestControl('simpleTestControl'));

        return rootControl;
    }
}


const TEST_INVOCATION_NAME: string = 'TEST_INVOCATION_NAME';

suite('ControlInteractionModel Generator tests', () => {

    afterEach(() => {
        sinon.restore();
    });
    suite('buildCoreModelForControls tests', () => {
        test('buildCoreModelForControls should successfully build IM for controls tree', () => {
            sinon.stub(Logger.prototype, 'warn');
            const interactionModel = new ControlInteractionModelGenerator()
                .buildCoreModelForControls(new TestControlManager())
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = jsonProvider.loadFromMockControls();

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('When locale is not supported, it should use default i18n resources ', () => {
            const interactionModel = new ControlInteractionModelGenerator()
                .buildCoreModelForControls(new TestControlManager({ locale: 'fr-FR' }))
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = jsonProvider.loadFromMockControls();

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('i18nOverride should work as expected', () => {
            sinon.stub(Logger.prototype, 'warn');
            const targetInFR = {
                name: SharedSlotType.TARGET,
                values: [
                    {
                        id: 'it',
                        name: {
                            value: 'la',
                            synonyms: [
                                'it',
                                "il",
                                "le"
                            ]
                        }
                    },
                ]
            };
            const i18nOverride = {
                fr: {
                    translation: {
                        SHARED_SLOT_TYPES_TARGET: targetInFR
                    }
                }
            };
            const interactionModel = new ControlInteractionModelGenerator()
                .buildCoreModelForControls(new TestControlManager({ locale: 'fr-FR', i18nResources: i18nOverride }))
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = jsonProvider.loadFromMockControls();
            expectedInteractionModel.interactionModel?.languageModel?.types?.map(slotType => {
                if (slotType.name === SharedSlotType.TARGET) {
                    slotType.values = targetInFR.values;
                }
                return slotType;
            });

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('When provided override is is not complete, should use the default resource', () => {
            const emptyResourceInEN: Resource = {
                en: {
                    translation: {}
                }
            };
            const interactionModel = new ControlInteractionModelGenerator()
                .buildCoreModelForControls(new TestControlManager({ i18nResources: emptyResourceInEN }))
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();
            const expectedInteractionModel: InteractionModelData = jsonProvider.loadFromMockControls();

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('3P controls without dependency on ControlIntent should be allowed to update IM', () => {
            class TESTControl extends Control implements InteractionModelContributor {
                canHandle(): boolean {
                    return true;
                }
                handle(): void {}
                canTakeInitiative(): boolean {
                    return true;
                }
                takeInitiative(): void {}
                updateInteractionModel(generator: ControlInteractionModelGenerator) {
                    generator.addIntents({
                        name: 'testIntent',
                        samples: ['hello world']
                    });
                }
                getTargetIds() {
                    return [];
                }
            }
            class SimpleControlManager extends ControlManager {
                createControlTree() {
                    return new TESTControl('test');
                }
            }
            const interactionModel = new ControlInteractionModelGenerator()
                .buildCoreModelForControls(new SimpleControlManager())
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            expect(interactionModel).deep.equal({
                interactionModel: {
                    languageModel: {
                        intents: [
                            {
                                name: 'testIntent',
                                samples: ['hello world']
                            }
                        ],
                        invocationName: TEST_INVOCATION_NAME,
                        types: [],
                    },
                    prompts: []
                },

            });
        });
    });

    suite('build tests', () => {
        test('build should throw warning message if targetSlotIds are missing', () => {
            const spy = sinon.stub(Logger.prototype, 'warn');
            const interactionModel = new ControlInteractionModelGenerator()
                .buildCoreModelForControls(new TestControlManager())
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            expect(spy.calledOnceWith('target slot with id test is not present in InteractionModel.')).eq(true);
        });
    });
});
