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


import { IControl } from "./IControl";

/**
 * Defines a Control that has child controls.
 *
 * This is the minimal definition required by the Runtime (ControlHandler)
 * See `ContainerControl` for the actual class used by Control implementations.
 */
export interface IContainerControl extends IControl {
    children: IControl[];
}

/**
 * Type-guard function for the @see IContainerControl interface.
 *
 * @param control - Control to test
 * @returns true if the argument implements the @see ContainerControl interface.
 */
export function isContainerControl(control: IControl): control is IContainerControl {
    return (control as any).children instanceof Array;
}