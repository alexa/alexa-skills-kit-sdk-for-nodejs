/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License').
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the 'license' file accompanying this file. This file is distributed
 * on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { LambdaHandler } from 'ask-sdk-core';
import { SkillInvokerConfigBuilder } from '../builder/SkillInvokerConfigBuilder';

export class SkillInvokerConfig {
    public readonly _handler: LambdaHandler;

    constructor(skillInvokerConfigBuilder: SkillInvokerConfigBuilder) {
        this._handler = skillInvokerConfigBuilder.handler;
    }

    public get handler(): LambdaHandler {
        return this._handler;
    }
}
