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
import { SessionBehavior } from '../../runtime/SessionBehavior';
import { ISystemAct } from '../../systemActs/SystemAct';

/**
 * Defines a builder used to prepare a ControlResult.
 *
 * This is the minimal definition required by the Runtime (ControlHandler) See
 * `ControlResultBuilder` for the actual class used by Control implementations.
 */
export interface IControlResultBuilder {
    acts: ISystemAct[];
    sessionBehavior: SessionBehavior;
    hasInitiativeAct(): boolean;
    build(): IControlResult;
}
