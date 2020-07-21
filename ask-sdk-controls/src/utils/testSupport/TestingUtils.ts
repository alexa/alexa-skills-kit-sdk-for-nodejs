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


import { AttributesManager, AttributesManagerFactory, RequestHandler, ResponseBuilder, ResponseFactory, Skill } from 'ask-sdk-core';
import { Intent, IntentRequest, interfaces, LaunchRequest, Request, RequestEnvelope } from "ask-sdk-model";
import { expect } from "chai";
import _, { invoke } from "lodash";
import { ControlInput } from '../../controls/ControlInput';
import { IControl } from '../../controls/interfaces/IControl';
import { IControlInput } from '../../controls/interfaces/IControlInput';
import { IControlResult } from '../../controls/interfaces/IControlResult';
import { Logger } from '../../logging/Logger';
import { ControlHandler } from '../../runtime/ControlHandler';
import { IntentBuilder } from '../IntentUtils';
import { SkillInvoker, TestResponseObject } from './SkillInvoker';
import { wrapRequestHandlerAsSkill } from './SkillWrapper';
import UserEvent = interfaces.alexa.presentation.apl.UserEvent;
import { Control } from '../../controls/Control';
import { ControlResultBuilder } from '../../controls/ControlResult';

const log = new Logger('AskSdkControls:TestingUtils');

/**
 * Utility to sleep a short duration to give the debugger some time to get
 * ready. (otherwise a test will often run without hitting breakpoints)
 *
 * This is not necessary for vscode version 1.41.1 and above.
 */
let waitHasBeenDone = false;
export function waitForDebugger() {
    if (!waitHasBeenDone) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
        waitHasBeenDone = true;
    }
}

/**
 * Find the control with the specified id in the control tree
 * @param rootControl - Root control
 * @param id - Control id to search for
 */
export function findControlById(rootControl: IControl, id: string): any {
    return find(rootControl, 'id', id);
}

/**
 * Find the control with the specified property name and value in the control tree
 * @param rootControl - Root control
 * @param property - Property name
 * @param value - Property value
 */
export function findControlByProperty(rootControl: IControl, property: string, value: any): any {
    return find(rootControl, property, value);
}

/**
 * find the first sub-object in an object that has key = value.
 * e.g. to locating something by id:  find(myobj, "key", "theKey")
 * `{a:[{b:{key: "theKey", "value": "1"}}]}` returns `{key: "theKey", "value": "1"}`
 * @param object - Object
 * @param key - Key
 * @param value - Value
 */
function find(object: any, key: string, value: any): any {
    if (typeof (object) !== "object") {
        return undefined;
    }
    if (object === null) {
        return undefined;
    }
    const theValue = object[key];
    if (theValue !== undefined && _.isEqual(theValue, value)) {
        return object;
    }

    // eslint-disable-next-line no-prototype-builtins
    const kidKeys = Object.keys(object).filter(key => object.hasOwnProperty(key));
    for (const kidKey of kidKeys) {
        const childObj = object[kidKey];
        if (typeof (childObj) === "object") {
            const result = find(childObj, key, value);
            if (result !== undefined) {
                return result;
            }
        }
    }
    return undefined;
}

/**
 * Invokes the core handling method of ControlHandler
 *
 * Purpose:
 * - for unit-testing the handling functionality (without rendering).
 *
 * @param rootControl - Root control
 * @param input - Input
 */
export async function simpleInvoke(rootControl: Control, input: ControlInput): Promise<IControlResult> {
    const resultBuilder = new ControlResultBuilder();
    await ControlHandler.handleCore(rootControl, input, resultBuilder);
    return resultBuilder.build();
}

/**
 * Tests a multi-turn script, verifying that the correct prompts are produced on
 * each turn.
 *
 * For finer-grained control, for assertions and breakpoints, use a sequence
 * of calls to `testTurn`.
 *
 * Each user turn comprises three entries:
 * 1. The user utterance. This is not a functional parameter is for
 *    documentation / readability.
 * 2. The input object for the turn. This should be synchronized with the user-utterance.
 * 3. The expected response for the turn: prompt, set of allowed prompts or
 *    TestResponse object.
 *
 * The user utterance and expected prompt can start with 'U: ' and 'A: ' to aid readability.
 * @param turns - Array of 3 entries per logical turn.  [utterance, Intent]
 */
export async function testE2E(handler: ControlHandler, turns: Array<string | string[] | IControlInput | TestResponseObject>): Promise<void> {
    const invoker = new SkillInvoker(wrapRequestHandlerAsSkill(handler));
    for (let counter = 0; counter < turns.length; counter += 3) {
        const userUtterance = turns[counter];
        const input = turns[counter + 1] as IControlInput;
        const expectedResponse = turns[counter + 2] as string | string[] | TestResponseObject;

        if (typeof userUtterance !== 'string') {
            throw new Error('user utterance not found');
        }
        if (typeof input !== 'object') {
            throw new Error('nlu object not found');
        }
        if (userUtterance.toLowerCase().startsWith('a:')) {
            throw new Error(`user utterance starts with A: -->${ userUtterance}`);
        }
        await testTurn(invoker, userUtterance, input, expectedResponse);
    }
}

/**
 * Test a single turn through the complete runtime flow
 *
 * @param invoker - SkillInvoker
 * @param utterance - Utterance. This is only for documentation / readability.
 * @param input - Input object
 * @param expectedResponse - The expected response: prompt, set of allowed
 *    prompts or TestResponse object.
 */
export async function testTurn(invoker: SkillInvoker, utterance: string, input: IControlInput, expectedResponse: string | string[] | TestResponseObject): Promise<TestResponseObject> {
    const testResponse = await invoker.invoke(input);
    if (Array.isArray(expectedResponse)) {
        expect(_.includes(expectedResponse, testResponse.prompt)).equals(true);
    } else {
        const expectedPrompt: string = typeof expectedResponse === 'string' ? expectedResponse : expectedResponse.prompt;
        if (!expectedPrompt.toLowerCase().startsWith('a:')) {
            throw new Error(`test configuration error: Alexa prompt should start with A: -->${ expectedResponse}`);
        }

        if (testResponse.prompt !== expectedPrompt &&
            testResponse.prompt !== expectedPrompt.substr(2).trimLeft()) {
            expect(testResponse.prompt).equals(expectedPrompt);
        }

        if ((expectedResponse as TestResponseObject).directive) {
            if (!_.isEqual(testResponse.directive, (expectedResponse as any).directive)) {
                expect(testResponse.directive).deep.equals((expectedResponse as TestResponseObject).directive);
            }
        }
    }
    return testResponse;
}

/**
 * Utility to create Input objects for use in tests.
 */
export class TestInput {
    static turnNumber = 1;

    /**
     * Reset the turn counter.
     */
    public static reset() {
        this.turnNumber = 1;
    }

    /**
     * Creates a ControlInput for a given Intent-name or complete Intent object.
     */
    public static of(nameOrIntent: Intent): ControlInput {
        const input = TestInput.intent(nameOrIntent);
        this.turnNumber++;
        return input;
    }

    /**
     * Creates a ControlInput for a given Intent-name and slots, or complete Intent object.
     */
    public static intent(nameOrIntent: string | Intent, slotValues?: { [k: string]: any }): ControlInput {
        const request = wrapIntentAsIntentRequest(nameOrIntent, slotValues);

        return dummyControlInput(request);
    }

    // public static intentWithMultiValueSlots(nameOrIntent: string | Intent, slotValues?: { [k: string]: any }): ControlInput {
    //     const request = wrapIntentAsIntentRequest(nameOrIntent, slotValues);

    //     return dummyControlInput(request);
    // }

    /**
     * Creates a ControlInput representing a LaunchRequest.
     */
    public static launchRequest(): ControlInput {

        const launchRequest: LaunchRequest = {
            type: 'LaunchRequest',
            requestId: 'amzn1.echo-api.request.69ba9cb0-bdac-476c-9e35-b7c4382ef039',
            timestamp: '2019-09-04T00:08:32Z',
            locale: 'en-US',
        };

        return dummyControlInput(launchRequest);
    }

    /**
     * Creates a ControlInput for an APL User Event.
     */
    public static userEvent(userEvent: UserEvent): ControlInput{

        return dummyControlInput(userEvent);
    }
}


// TODO: API: unify with SkillInvoker
/**
 * Utility to run tests on a Skill or RequestHandler.
 */
export class SkillTester {
    invoker: SkillInvoker;

    constructor(skillOrRequestHandler: Skill | RequestHandler){
        this.invoker = new SkillInvoker(skillOrRequestHandler);
    }

    async testTurn(utterance: string, input: ControlInput, expectedPrompt: string): Promise<TestResponseObject> {
        return testTurn(this.invoker, utterance, input, expectedPrompt);
    }
}

function makeRequestId(){
    // example from live skill:'amzn1.echo-api.request.69ba9cb0-bdac-476c-9e35-b7c4382ef039'
    const id = `amzn1.echo-api.request.${ Math.round(Math.random() * 1000000000).toString()}`;
    return id;
}



function wrapIntentAsIntentRequest(nameOrIntent: string | Intent, slotValues?: { [k: string]: any }): IntentRequest {
    const intent = typeof nameOrIntent === 'string' ? IntentBuilder.of(nameOrIntent, slotValues) : nameOrIntent;

    const intentRequest: IntentRequest = {
        type: 'IntentRequest',
        requestId: makeRequestId(),
        timestamp: '2019-09-04T00:08:32Z',
        locale: 'en-US',
        dialogState: 'STARTED',
        intent
    };

    return intentRequest;
}

function dummyRequestEnvelope(request?: Request): RequestEnvelope {
    if (request === undefined) {
        request = {
            type: 'IntentRequest',
            requestId: makeRequestId(),
            timestamp: '',
            dialogState: 'IN_PROGRESS',
            intent: {
                name: '',
                confirmationStatus: 'NONE'
            }
        };
    }

    return {
        version: '',
        session: {
            new: true,
            application: {
                applicationId: '',
            },
            sessionId: '',
            user: {
                userId: ''
            },
        },
        context: {
            System: {
                application: {
                    applicationId: ''
                },
                user: {
                    userId: '',
                },
                apiEndpoint: '',
                device: {
                    deviceId: '',
                    supportedInterfaces: {
                        'Display': {
                            templateVersion: "1.0",
                            markupVersion: "1.0"
                        },
                        "Alexa.Presentation.APL": {
                            runtime: {
                                maxVersion: "1.3"
                            }
                        }
                    }
                }
            },
        },
        request
    };
}

function dummyControlInput(request?: Request): ControlInput {

    const handlerInput = {
        requestEnvelope: dummyRequestEnvelope(request),
        context: {},
        attributesManager: dummyAttributesManager,
        responseBuilder: dummyResponseBuilder,
        serviceClientFactory: undefined
    };

    return {
        handlerInput,
        request: handlerInput.requestEnvelope.request,
        turnNumber: TestInput.turnNumber,
        controls: {}
    };
}
const dummyAttributesManager: AttributesManager = AttributesManagerFactory.init({ requestEnvelope: dummyRequestEnvelope() });
const dummyResponseBuilder: ResponseBuilder = ResponseFactory.init();
