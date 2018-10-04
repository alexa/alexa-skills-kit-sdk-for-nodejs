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

import { V1Handler } from '../v1Handler';

export const SkillEventHandlers : V1Handler = {
    'AlexaSkillEvent.SkillAccountLinked'() : void {
        // do something
    },
    'AlexaSkillEvent.SkillDisabled'() : void {
        // do something
    },
    'AlexaSkillEvent.SkillEnabled'() : void {
        // do something
    },
    'AlexaSkillEvent.SkillPermissionAccepted'() : void {
        // do something
    },
    'AlexaSkillEvent.SkillPermissionChanged'() : void {
        // do something
    },
};
