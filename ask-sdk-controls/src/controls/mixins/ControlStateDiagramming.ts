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

import { IControl } from '../interfaces/IControl';

/**
 * Optional interface for Controls that wish to add detail to diagnostic output.
 */
export interface ControlStateDiagramming {

    /**
     * Generates a human-readable representation of the state.
     *
     * @param this - Control
     * @returns Human-readable state
     */
    stringifyStateForDiagram(this: IControl): string;
}

/**
 * Type-guard for the ControlStateDiagramming interface.
 *
 * @param arg - Object to test
 * @returns `true` if the argument implements the `ControlStateDiagramming`
 * interface.
 */
export function implementsControlStateDiagramming(arg: any): arg is ControlStateDiagramming {
    return typeof arg.stringifyStateForDiagram === 'function';
}
