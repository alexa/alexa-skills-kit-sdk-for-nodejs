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

import { IControlInput } from './IControlInput';
import { IControlResultBuilder } from './IControlResultBuilder';

/**
 * Defines a Control object that manages state and dialog behavior.
 *
 * This is the minimal definition required by the Runtime (ControlHandler)
 * See `Control` for the actual class used by Control implementations.
 */
export interface IControl {
    id: string;

    /**
     * Determines if the Control or one of its children can consume the request.
     */
    canHandle(input: IControlInput): boolean | Promise<boolean>;

    /**
     * Handles the request.
     */
    handle(input: IControlInput, resultBuilder: IControlResultBuilder): void | Promise<void>;

    /**
     * Determines if the Control can take the initiative.
     */
    canTakeInitiative(input: IControlInput): boolean | Promise<boolean>;

    /**
     * Takes the initiative by adding an InitiativeAct to the result.
     */
    takeInitiative(input: IControlInput, resultBuilder: IControlResultBuilder): void | Promise<void>;

    /**
     * Gets the Control's state as an object that is serializable.
     *
     * Framework behavior:
     * - The object will be serialized via a call to `JSON.stringify(obj)`
     */
    getSerializableState(): any;

    /**
     * Sets the state from a serialized state object
     */
    setSerializableState(serializedState: any): void;
}