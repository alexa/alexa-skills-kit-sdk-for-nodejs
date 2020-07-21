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

import _ from "lodash";
import { Control } from '../controls/Control';
import { ControlInput } from '../controls/ControlInput';
import { ControlResponseBuilder } from '../responseGeneration/ControlResponseBuilder';

/**
 * Describes a piece of information to be communicated to the user.
 *
 * This is the minimal definition required by the Runtime (ControlHandler)
 * See `SystemAct` for the actual class used by Control implementations.
 */
export interface ISystemAct {
    takesInitiative: boolean;
}

/**
 * Base type for system dialog acts.
 *
 * Each `SystemAct` represents a precise 'piece of information' that is to be communicated to the user.  Each
 * `SystemAct` is to be associated with a Control that can be used to render it.
 *
 * There are two more specific base classes that should be used as the base for user-defined SystemActs:
 *  * `ContentAct`: the base class for System Acts that just communicate some information.
 *  * `InitiativeAct`: the base class for System Acts that ask a question or otherwise encourage the user to continue the conversation.
 *
 * Usage:
 *  * Add `SystemActs` to the result in `Control.canHandle` and `Control.takeInitiative` to represent what the system wants to communicate.
 *  * Convert the `SystemActs` into surface forms (prompts, APL, etc) during the render phase.
 *  * Always extend `ContentAct` or `InitiativeAct` rather than this base type.
 *  * Introduce new System Acts whenever the available acts are not suitable or precise enough.
 */
export abstract class SystemAct implements ISystemAct {
    control: Control;
    takesInitiative: boolean;

    /**
     * Creates an instance of SystemAct.
     *
     * Each system act represent a specific 'atom of dialog' the system wishes to communicate to the user.
     *
     * Usage:
     *  - New acts should generally extend `InitiativeAct` or `ContentAct` rather than this class, to improve readability.
     */
    constructor(control: Control, props: {takesInitiative: boolean}) {
        this.control = control;
        this.takesInitiative = props.takesInitiative;
    }

    /**
     * Produces a string representation of the SystemAct.
     *
     * The associated `Control.id` is included but the complete details of the associate `Control` are omitted for brevity.
     */
    toString() {
        return `${this.constructor.name}:${JSON.stringify(this.cloneWithControlIdNotDetails())}`;
    }

    /**
     * For use in toString.
     * Creates a clone that replaces the control object with controlId.
     */
    private cloneWithControlIdNotDetails(): any {
        const cleanAct = _.cloneDeep(this) as any;
        cleanAct.controlId = this.control?.id ?? '';
        delete cleanAct.control;
        return cleanAct;
    }

    /**
     * Render the dialog act.
     *
     * This is the one-size-fits-all direct rendering of a dialog act.  This is often appropriate
     * for custom acts that are not used by a shared control.
     *
     * Framework behavior:
     *  * Shared controls cannot rely on a one-size-fits-all rendering and so they provide
     *    their own appropriate defaults and props that allow the developer to override the defaults.
     *
     * @param input - Input
     * @param responseBuilder - Response builder
     */
    abstract render(input: ControlInput, responseBuilder: ControlResponseBuilder): void;
}
