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


import { ControlResponseBuilder } from '../responseGeneration/ControlResponseBuilder';
import { SystemAct } from '../systemActs/SystemAct';
import { randomlyPick } from '../utils/ArrayUtils';
import { StringOrList } from '../utils/BasicTypes';
import { ControlInput } from './ControlInput';
import { ControlResultBuilder } from './ControlResult';
import { IControl } from './interfaces/IControl';

/**
 * Base type for the props of a Control.
 */
export interface ControlProps {
    id: string;

    /* TODO: refactor. hoist up more common prop shapes. e.g
     * InteractionModelProps, PromptProps. if only to centralize the tsDocs.
     */
}

/**
 * Base type for the state of a Control.
 */
export interface ControlState {
    /**
     * The value managed by a control.
     *
     * Usage:
     * - The value is not necessarily valid, confirmed or otherwise ready for
     *   use. Consumers can call `control.isReady()` to determine if the value
     *   is ready for use.
     */
    value?: any;
}

/**
 * Abstract base class for Controls.
 */
export abstract class Control implements IControl {
    readonly id: string;
    state: ControlState;

    constructor(id: string) {
        this.id = id;
    }

    /**
     * Determines if the Control or one of its children can consume a request.
     *
     * Returning `true` does not guarantee that the Control will be selected.
     *
     * Usage:
     * * The handling of a request can and should be contextual. That is, a
     *   control should only return `canHandle = true` if the request makes
     *   sense for the current state of the control.
     *
     * * A @see ContainerControl should return true if one or more of its
     *   children returns `canHandle = true`. Thus the root of a Control tree
     *   should return `canHandle = true` unless the request cannot be
     *   meaningfully consumed by any Control in the tree.
     *
     * * The implementation should be deterministic and effectively memoryless.
     *   i.e. no state changes should be made that would be exposed by
     *   `getSerializableState()`.
     *
     * @param input - Input object. `input.request` contains the request to be
     * handled.
     * @returns `true` if the Control or one of its children can consume the
     * entire request, `false` otherwise.
     */
    abstract canHandle(input: ControlInput): boolean | Promise<boolean>;


    /**
     * Handles the request.
     *
     * Handling a request involves orchestrating state changes to the Control
     * (and its children) and adding response items to the
     * `ControlResultBuilder`.
     *
     * @param input - `input.request` contains the request to be handled.
     * @param resultBuilder - Collect `SystemActs` that represent the system
     * output.
     */
    abstract handle(input: ControlInput, resultBuilder: ControlResultBuilder): void | Promise<void>;

    /**
     * Determines if the Control can take the initiative.
     *
     * Usage:
     * - Taking initiative can and should be contextual, i.e. A control should
     *   only return `canTakeInitiative = true` if the control, in its current
     *   state, has something important to ask of the user.
     *
     * - A @see ContainerControl should return true if one or more of its
     *   children returns `canTakeInitiative = true`. Thus the root of a Control
     *   tree should return `canTakeInitiative = true` unless there is no
     *   control in the entire tree that can take the initiative.
     *
     * - The implementation should be deterministic and effectively memoryless.
     *   i.e. no state changes should be made that would be exposed by
     *   `getSerializableState()`.
     *
     * Framework behavior:
     * - The initiative phase runs if the handling phase did not produce a
     *   responseItem that has `.takesInitiative = true`.
     *
     * @param input - Input object.
     * @returns `true` if the Control or one of its children can take the
     * initiative, `false` otherwise.
     */
    abstract canTakeInitiative(input: ControlInput): boolean | Promise<boolean>;

    /**
     * Takes initiative by adding an InitiativeAct to the result.
     *
     * Framework behavior:
     * * The initiative phase runs if the handling phase did not produce a responseItem that has `.takesInitiative = true`.
     *
     * @param input - Input object.
     * @param resultBuilder - ResultBuilder. Collect `SystemActs` that represent the system output.
     */
    abstract takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): void | Promise<void>;

    /**
     * Determines if the value is ready for use by other parts of the skill.
     *
     * @param input - Input object.
     * @returns `true` if the Control or one of its children can take the initiative, false otherwise.
     */
    async isReady(input: ControlInput): Promise<boolean> {
        return !(await this.canTakeInitiative(input));
    }

    /**
     * Gets the Control's state as an object that is serializable.
     *
     * Only durable state should be included and the object should be serializable with a
     * straightforward application of `JSON.stringify(object)`.
     *
     * Default:
     *  `{return this.state;}`
     *
     * Usage:
     *  * The default is sufficient for Controls that use the `.state` variable and only store simple data.
     *    * Non-simple data includes functions, and objects with functions, as these will not survive the round trip.
     *    * Other non-simple data include types with non-enumerable properties.
     *  * It is safe to pass the actual state object as the framework guarantees to not mutate it.
     *  * Functions that operate on the Control's state should be defined as members of the Control
     *
     * Framework behavior:
     *  * The framework serializes the data use a simple application of `JSON.stringify`.
     *  * On the subsequent turn the control tree is re-established and the state objects
     *    are re-attached to each Control via `control.setSerializableState(serializedState)`.
     *
     * @returns Serializable object defining the state of the Control
     */
    public getSerializableState(): any {
        return this.state;
    }

    /**
     * Sets the state from a serialized state object.
     *
     * Default:
     * `{this.state = serializedState;}`
     *
     * Usage:
     *  * It is safe to use serializedState without copying as the framework guarantees to not mutate it.
     *
     * Framework behavior:
     *  * After the control tree is re-established, the state objects
     *    are re-attached to each Control via `control.setSerializableState(serializedState)`.
     *
     * @param serializedState - Serializable object defining the state of the Control
     */
    public setSerializableState(serializedState: any): void {
        this.state = serializedState;
    }

    /**
     * Add response content for a system act produced by this control.
     *
     * This is intended to be used with the default ControlManager.render() which implements a
     * simple concatenation strategy to form a complete response from multiple result items.
     *
     * @param act - System act
     * @param input - Input
     * @param responseBuilder - Response builder
     */
    renderAct(act: SystemAct, input: ControlInput, responseBuilder: ControlResponseBuilder): void {
        // The default is to let the act render itself
        return act.render(input, responseBuilder);
    }

    // TODO: remove and/or create a new class... class UnhandledActError extends Error.
    throwUnhandledActError(act: SystemAct): never {
        throw new Error(`No NLG for ${act}`);
    }


    /**
     * Evaluate a prompt prop.
     *
     * @param act - act
     * @param propValue - Constant or function producing String or List-of-Strings
     * @param input - Input object
     */
    evaluatePromptProp(act: SystemAct, propValue: StringOrList | ((act: any, input: ControlInput) => string | string[]), input: ControlInput): string {
        const stringOrList = (typeof propValue === 'function') ? propValue.call(this, act, input) : propValue;
        if (typeof stringOrList === 'string') {
            return stringOrList;
        }
        return randomlyPick<string>(stringOrList);
    }

    /**
     * Evaluate a boolean prop.
     *
     * @param propValue - Constant or function producing boolean
     * @param input - The input object
     */
    evaluateBooleanProp(propValue: boolean | ((input: ControlInput) => boolean), input: ControlInput): boolean {
        return (typeof propValue === 'function') ? propValue.call(this, input) : propValue;
    }
}
