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

import { IControl } from '../controls/interfaces/IControl';
import { isContainerControl } from '../controls/interfaces/IContainerControl';

/**
 * Visits all controls in a control tree and calls `fn(control)` for each.
 * @param control - Control
 * @param fn - Function to run on each control
 */
export function visitControls(control: IControl, fn: (control: IControl) => void) {
    fn.call(undefined, control);

    if (isContainerControl(control)) {
        for (const child of control.children) {
            visitControls(child, fn);
        }
    }
}
