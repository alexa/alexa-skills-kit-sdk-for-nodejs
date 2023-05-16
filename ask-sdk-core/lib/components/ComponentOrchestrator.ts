/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Response } from "ask-sdk-model";
import { HandlerInput } from "../dispatcher/request/handler/HandlerInput";
import { IMComponentInterface } from "./IMComponentInterface";
import { GenericComponentOrchestrator } from 'ask-sdk-runtime';
import { CustomSkillRequestHandler } from "../dispatcher/request/handler/CustomSkillRequestHandler";
import { getIntentName } from "../util/RequestEnvelopeUtils";

const sessionKey = "componentOrchestrator";

export class ComponentOrchestrator<Input = HandlerInput, Output = Response> implements GenericComponentOrchestrator<Input, Output> {

    // Component Registry Schema -
    // {
    //     componentName: {
    //         insatnceId: ComponentObject
    //     }
    // }
    private _componentRegistry: Record<string, Record<string, IMComponentInterface>>;
    private _focusState: any[];

    private constructor(componentRegistry: Record<string, Record<string, IMComponentInterface>>, focus: any) {
        this._componentRegistry = componentRegistry;
        this._focusState = focus;
    }

    public static getInstance(handlerInput: HandlerInput): ComponentOrchestrator {
        const session = handlerInput.attributesManager.getSessionAttributes();
        const componentOrchestrator = session[sessionKey];
        // check if the ComponentOrchestrator is inialized using custom skill builder
        if (componentOrchestrator) {
            return new ComponentOrchestrator(componentOrchestrator["registry"], componentOrchestrator["focus"]);
        }
        else {
            throw new Error("Component Orchestrator is not being used in the custom skill");
        }

    }

    public static initialize() {
        return new ComponentOrchestrator({}, []);
    }

    registerComponent(component: IMComponentInterface, instanceId: string) {
        const componentName = component.getName();
        const registeredComponent = this._componentRegistry[componentName];
        if (!registeredComponent) {
            this._componentRegistry[componentName] = {};
        }
        else if (registeredComponent[instanceId]) {
            throw new Error(`${componentName} already registered with instanceId: ${instanceId}`);
        }

        this._componentRegistry[componentName] = {
            ...this._componentRegistry[componentName],
            instanceId: component
        };
    }

    egress(componentName: string, input: HandlerInput) {
        if (this._focusState[0].name !== componentName) {
            throw new Error(`No component named ${componentName} is currently in focus`);
        }
        // remove the component from top of the array
        this._focusState.shift();
        this.saveState(input);
    }

    launch(componentName: string, instanceId: string, input: HandlerInput, launchOptions?: any) {
        if (!this._componentRegistry[componentName] || !this._componentRegistry[componentName][instanceId]) {
            throw new Error(`No component registered with component name: ${componentName} and instance id: ${instanceId}`);
        }

        // insert the component at the start of the array
        this._focusState.unshift({
            instanceId,
            name: componentName
        });
        this.saveState(input);
        this._componentRegistry[componentName][instanceId].launch(launchOptions);
    }

    serialize(): any {
        const config = {
            focus: this._focusState,
            registry: this._componentRegistry
        };
        return config;
    }

    saveState(input: HandlerInput) {
        const sessionAttributes = input.attributesManager.getSessionAttributes();
        sessionAttributes[sessionKey] = this.serialize();
        input.attributesManager.setSessionAttributes(sessionAttributes);
    }

    supports(input: Input) {
        // Check if a component in focus can handle the request
        if (this._focusState.length > 0) {
            const componetInFocusMetadata = this._focusState[0];
            const componetInFocus = this._componentRegistry[componetInFocusMetadata.name][componetInFocusMetadata.instanceId];
            if (this.componentCanHandle(componetInFocus, input as HandlerInput)) {
                return true;
            }
        }

        // check if any other component has the current intet as the ingress intent.
        Object.keys(this._componentRegistry).forEach(component => {
            const key = Object.keys(this._componentRegistry[component])[0];
            const componentObject = this._componentRegistry[component][key];
            const intentName = getIntentName((input as HandlerInput).requestEnvelope);

            // check for exact match of intent name
            if (componentObject.getIngressIntentNames().has(intentName)) {
                return true;
            }

            // check if the intent name follows a particular pattern provided by the component
            componentObject.getIngressIntentPatterns().forEach(pattern => {
                const regex = RegExp(pattern);
                if (regex.test(intentName)) {
                    return true;
                }
            });
        });
        return false;
    }

    async execute(input: Input): Promise<Output> {
        const handlerInput = input as HandlerInput;
        if (this._focusState.length > 0) {
            const componetInFocusMetadata = this._focusState[0];
            const componetInFocus = this._componentRegistry[componetInFocusMetadata.name][componetInFocusMetadata.instanceId];
            const handler = this.componentCanHandle(componetInFocus, handlerInput);
            if (handler) {
                return await handler.handle(handlerInput) as Output;
            }
        }
        else {
            throw new Error("No component in focus to handle the response");
        }
    }

    private componentCanHandle(component: IMComponentInterface, input: HandlerInput): CustomSkillRequestHandler | undefined {
        component.registerHandlers().forEach(handler => {
            if (handler.canHandle(input)) {
                return handler;
            }
        });
        return undefined;
    }
}