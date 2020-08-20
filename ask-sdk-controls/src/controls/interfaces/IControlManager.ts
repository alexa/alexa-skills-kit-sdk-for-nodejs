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

import { IControlResult } from './IControlResult';
import { IControl } from './IControl';
import { IControlInput } from './IControlInput';
import { ControlResponseBuilder } from '../../responseGeneration/ControlResponseBuilder';

/**
 * Manages a skill built with Controls.
 *
 * This is the minimal definition required by the Runtime (ControlHandler)
 * See `ControlManager` for the actual class used by implementations.
 */
export interface IControlManager {
    /**
     * Creates the tree of controls to handle state management and dialog
     * decisions for the skill.
     *
     * Usage:
     * - A single control is legal and will suffice for small skills. For larger
     *   skills a tree of controls structured using @see ContainerControl will
     *   help manage skill complexity.
     *
     * - In advanced scenarios with dynamic control tree shapes, this method is
     *   expected to produce a tree that is identical to the tree at the end of
     *   the previous turn.  The serializable control state can be inspected as
     *   necessary.
     *
     * @param serializableState - Map of control state objects keyed by
     *                          `controlId` This is provided for advanced cases
     *                          in which the tree has a dynamic shape based on
     *                          the application state.
     * @returns A Control that is either a single @see Control or a @see
     * ContainerControl that is the root of a tree.
     */
    createControlTree(serializableState: { [key: string]: any }): IControl;

    /**
     * Builds the response.
     *
     * @param result - The result to be rendered
     * @param input - Input
     * @param responseBuilder - Response builder
     */
    render(result: IControlResult, input: IControlInput, responseBuilder: ControlResponseBuilder): void | Promise<void>;

    /**
     * Custom handling of a internal error before the skill exits and closes the
     * user session.
     */
    handleInternalError?(input: IControlInput, error: any, responseBuilder: ControlResponseBuilder): void;
}
