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

import { implementsControlStateDiagramming } from '../controls/mixins/ControlStateDiagramming';
import { IControl } from '../controls/interfaces/IControl';
import { isContainerControl } from '../controls/interfaces/IContainerControl';

/**
 * Creates a text diagram of the Control tree
 *
 * Notes:
 *  1. The controls in the handling chain are highlighted with `= H =`
 *  2. The controls in the initiative chain are highlighted with `= I =`
 *  3. Controls that are in both chains are highlighted with `= B =`
 * @param control - Control
 * @param turnNumber - Turn number
 * @param indent - Indent
 */
export function generateControlTreeTextDiagram(control: IControl, turnNumber: number, indent?: number): string {
    indent = indent ?? 0;
    let text = control.id;
    let stateStr = control.constructor.name;
    if (implementsControlStateDiagramming(control)) {
        stateStr = control.stringifyStateForDiagram();
    }
    text += ` (${stateStr})`;

    const coloredText = text;
    let str = `${coloredText}\n`;

    if (isContainerControl(control)) {
        for (const child of control.children) {
            const childHandledThisTurn = (child.id === (control as any).state?.lastHandlingControl?.controlId && (control as any).state?.lastHandlingControl?.turnNumber === turnNumber);
            const childTookInitiativeThisTurn = (child.id === (control as any).state?.lastInitiativeChild?.controlId && (control as any).state?.lastInitiativeChild?.turnNumber === turnNumber);
            // const text = `|${(childHandledThisTurn || childTookInitiativeThisTurn) ? "== " : "-- "}`;

            const text = `|${ childHandledThisTurn && childTookInitiativeThisTurn
                ? '= B = '
                : childHandledThisTurn
                    ? '= H = '
                    : childTookInitiativeThisTurn
                        ? '= I = '
                        : '----- '}`;

            str += "| ".repeat(indent) + text + generateControlTreeTextDiagram(child, turnNumber, indent + 1);
        }
    }

    return str;
}