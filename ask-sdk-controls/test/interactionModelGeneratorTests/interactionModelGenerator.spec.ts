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

import { v1 } from 'ask-smapi-model';
import { expect } from "chai";
import * as _ from 'lodash';
import { suite, test } from 'mocha';
import { join } from 'path';
import sinon from 'sinon';
import { InteractionModelGenerator } from '../../src';
import { jsonProvider } from './interactionModelForTest';

import Intent = v1.skill.interactionModel.Intent;
import SlotType = v1.skill.interactionModel.SlotType;
import DialogIntent = v1.skill.interactionModel.DialogIntents;
import DelegationStrategyType = v1.skill.interactionModel.DelegationStrategyType;
import InteractionModelData = v1.skill.interactionModel.InteractionModelData;
import Prompt = v1.skill.interactionModel.Prompt;

const TEST_INTENT: Intent = {
    name: "CustomIntent",
    slots: [
        {
            name: "PhoneNumber",
            type: "AMAZON.PhoneNumber"
        }
    ],
    samples: [
        "{PhoneNumber}",
        "give me your {PhoneNumber}"
    ]
};
const TEST_SLOT_TYPE_VALUE = {
    id: 'TEST_ID',
    name: {
        value: 'TEST_VALUE',
        synonyms: [
            'TEST_SYNONYMS'
        ]
    }

};

const TEST_SLOT_TYPE: SlotType = {
    name: 'TEST',
    values: [
        TEST_SLOT_TYPE_VALUE,
    ]
};


const TEST_DIALOG_INTENT: DialogIntent = {
    name: 'TEST_DIALOG_INTENT_NAME',
    slots: [
        {
            name: 'TEST_SLOT_NAME',
            type: 'TEST_SLOT_TYPE'
        }
    ]
};

const TEST_DELEGATION_STRATEGY: DelegationStrategyType = 'ALWAYS';
const TEST_INVOCATION_NAME: string = 'TEST_INVOCATION_NAME';

const TEST_PROMPT: Prompt = {
    id: 'TEST_ID',
    variations: [{ type: 'SSML', value: 'TEST_VALUE' }]
};


suite('InteractionModel Generator tests', () => {
    const mockFilePath = join(__dirname, '..', 'mock', 'inputInteractionModel.json');

    afterEach(() => {
        sinon.restore();
    });
    suite('add Intents tests', () => {
        test('addIntent should successfully add single intent to IM', () => {
            const interactionModel = new InteractionModelGenerator()
                .addIntents(TEST_INTENT)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [
                            TEST_INTENT
                        ],
                        types: []
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addIntent should not add duplicate intent', () => {
            const interactionModel = new InteractionModelGenerator()
                .addIntents(TEST_INTENT, TEST_INTENT)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [
                            TEST_INTENT
                        ],
                        types: []
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addIntents should throw error when an intent is defined more than once', () => {
            const testIntentWithSameName = _.cloneDeep(TEST_INTENT);
            testIntentWithSameName.samples = [];
            try {
                const interactionModel = new InteractionModelGenerator()
                    .addIntents(TEST_INTENT, testIntentWithSameName)
                    .withInvocationName('test')
                    .build();
            } catch (e) {
                expect(e.message).equal(`Intent ${testIntentWithSameName.name} is defined more than once and the definitions are not identical.`);

                return;
            }

            expect.fail('should throw error');
        });
    });

    suite('add slotTypes tests', () => {

        test('addSlotTypes should successfully add single slotType to IM', () => {
            const interactionModel = new InteractionModelGenerator()
                .addOrMergeSlotTypes(TEST_SLOT_TYPE)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: [TEST_SLOT_TYPE]
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addSlotTypes should not add duplicate slotType to IM', () => {
            const interactionModel = new InteractionModelGenerator()
                .addOrMergeSlotTypes(TEST_SLOT_TYPE, TEST_SLOT_TYPE)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: [TEST_SLOT_TYPE]
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addSlotTypes should throw error when two slotTypeValue has same id but different name.value', () => {
            const modifiedTestSlotType = _.cloneDeep(TEST_SLOT_TYPE);
            modifiedTestSlotType.values![0].name!.value = '';
            try {
                const interactionModel = new InteractionModelGenerator()
                    .addOrMergeSlotTypes(TEST_SLOT_TYPE, modifiedTestSlotType)
                    .withInvocationName(TEST_INVOCATION_NAME)
                    .build();
            } catch (e) {
                expect(e.message).equal(`Cannot merge slot type ${TEST_SLOT_TYPE.name}, as the value ${JSON.stringify(modifiedTestSlotType.values![0])} and ${JSON.stringify(TEST_SLOT_TYPE.values![0])} has the same id but different name.value.`);

                return;
            }

            expect.fail('should throw error');
        });

        test('addSlotTypes should throw error when two slotTypeValue has same name.value but different id', () => {
            const modifiedTestSlotType = _.cloneDeep(TEST_SLOT_TYPE);
            modifiedTestSlotType.values![0].id = '';
            try {
                const interactionModel = new InteractionModelGenerator()
                    .addOrMergeSlotTypes(TEST_SLOT_TYPE, modifiedTestSlotType)
                    .withInvocationName(TEST_INVOCATION_NAME)
                    .build();
            } catch (e) {
                expect(e.message).equal(`Cannot merge slot type ${TEST_SLOT_TYPE.name}, as the value ${JSON.stringify(modifiedTestSlotType.values![0])} and ${JSON.stringify(TEST_SLOT_TYPE.values![0])} has the same name.value but different id.`);

                return;
            }

            expect.fail('should throw error');
        });

        test('addSlotTypes should be able to merge synonyms', () => {
            const newSlotType = _.cloneDeep(TEST_SLOT_TYPE);
            newSlotType.values![0].name!.synonyms = ['new synonym'];
            const interactionModel = new InteractionModelGenerator()
                .addOrMergeSlotTypes(TEST_SLOT_TYPE, newSlotType)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: [{
                            name: 'TEST',
                            values: [
                                {
                                    id: 'TEST_ID',
                                    name: {
                                        value: 'TEST_VALUE',
                                        synonyms: [
                                            'TEST_SYNONYMS',
                                            'new synonym'
                                        ]
                                    }

                                },
                            ]
                        }]
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addValuesToSlotType should throw error when the slotName is not exist', () => {
            try {
                const interactionModel = new InteractionModelGenerator()
                    .addValuesToSlotType('Name', TEST_SLOT_TYPE_VALUE)
                    .withInvocationName(TEST_INVOCATION_NAME)
                    .build();
            } catch (e) {
                expect(e.message).equal(`SlotType Name is not defined.`);

                return;
            }

            expect.fail('should throw error');
        });

        test('addValuesToSlotType should successfully add value to exist slotType', () => {
            const extraSlotValue = {
                id: 'EXTRA_ID',
                name: {
                    value: 'EXTRA_VALUE',
                    synonyms: [
                        'EXTRA_SYNONYMS'
                    ]
                }
            };
            const interactionModel = new InteractionModelGenerator()
                .addOrMergeSlotTypes(TEST_SLOT_TYPE)
                .addValuesToSlotType(TEST_SLOT_TYPE.name!, extraSlotValue)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();
            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: [{
                            name: 'TEST',
                            values: [
                                TEST_SLOT_TYPE_VALUE,
                                extraSlotValue
                            ]
                        }]
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });
    });

    suite('add dialogIntents tests', () => {
        test('addDialogIntents should successfully add single intent to IM', () => {
            const interactionModel = new InteractionModelGenerator()
                .addDialogIntents(TEST_DIALOG_INTENT)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: []
                    },
                    dialog: {
                        intents: [TEST_DIALOG_INTENT]
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addDialogIntents should not add duplicate dialogIntent', () => {
            const interactionModel = new InteractionModelGenerator()
                .addDialogIntents(TEST_DIALOG_INTENT, TEST_DIALOG_INTENT)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: []
                    },
                    dialog: {
                        intents: [TEST_DIALOG_INTENT]
                    },
                    prompts: []
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addDialogIntents should throw error when an dialogIntent is defined more than once', () => {
            const testIntentWithSameName = _.cloneDeep(TEST_DIALOG_INTENT);
            testIntentWithSameName.slots = [];
            try {
                const interactionModel = new InteractionModelGenerator()
                    .addDialogIntents(TEST_DIALOG_INTENT, testIntentWithSameName)
                    .withInvocationName('test')
                    .build();
            } catch (e) {
                expect(e.message).equal(`DialogIntent ${testIntentWithSameName.name} is defined more than once and the definitions are not identical.`);

                return;
            }

            expect.fail('should throw error');
        });
    });

    suite('add prompts tests', () => {
        test('addPrompts should successfully add single prompt to IM', () => {
            const interactionModel = new InteractionModelGenerator()
                .addPrompts(TEST_PROMPT)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: []
                    },
                    prompts: [TEST_PROMPT]
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addPrompts should not add duplicate prompt', () => {
            const interactionModel = new InteractionModelGenerator()
                .addPrompts(TEST_PROMPT, TEST_PROMPT)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();

            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        invocationName: TEST_INVOCATION_NAME,
                        intents: [],
                        types: []
                    },
                    prompts: [TEST_PROMPT]
                },
            };

            expect(interactionModel).deep.equal(expectedInteractionModel);
        });

        test('addPrompts should throw error when an prompt is defined more than once', () => {
            const testPromptWithSameId = _.cloneDeep(TEST_PROMPT);
            testPromptWithSameId.variations = [];
            try {
                const interactionModel = new InteractionModelGenerator()
                    .addPrompts(TEST_PROMPT, testPromptWithSameId)
                    .withInvocationName('test')
                    .build();
            } catch (e) {
                expect(e.message).equal(`Prompt with id ${TEST_PROMPT.id} is defined more than once and the definitions are not identical.`);

                return;
            }

            expect.fail('should throw error');
        });
    });

    suite('High level function tests', () => {
        test('should be able to throw error when input file not exist', () => {
            const invalidFilePath = join(__dirname, 'invalidFile.json');
            try {
                const interactionModel = new InteractionModelGenerator().loadFromFile(invalidFilePath).build();
            } catch (e) {
                expect(e.message).equal('Input path is not valid.');

                return;
            }

            expect.fail('should throw error');
        });

        test('should be able to generate InteractionModel by reading exist models', () => {

            const interactionModel = new InteractionModelGenerator().loadFromFile(mockFilePath).build();
            expect(interactionModel).deep.equal(jsonProvider.loadMockInputFile());
        });

        test('should be able to add custom Intent, SlotTypes, DialogIntents, DelegationStrategy, InvocationName by using function chain', () => {

            const interactionModel: InteractionModelData = new InteractionModelGenerator()
                .addIntents(TEST_INTENT)
                .addOrMergeSlotTypes(TEST_SLOT_TYPE)
                .addDialogIntents(TEST_DIALOG_INTENT)
                .addDelegationStrategy(TEST_DELEGATION_STRATEGY)
                .withInvocationName(TEST_INVOCATION_NAME)
                .build();
            const expectedInteractionModel: InteractionModelData = {
                interactionModel: {
                    languageModel: {
                        intents: [
                            TEST_INTENT
                        ],
                        types: [TEST_SLOT_TYPE],
                        invocationName: TEST_INVOCATION_NAME
                    },
                    dialog: {
                        delegationStrategy: TEST_DELEGATION_STRATEGY,
                        intents: [TEST_DIALOG_INTENT]
                    },
                    prompts: []
                }
            };
            expect(interactionModel).deep.equal(expectedInteractionModel);
        });
    });


});
