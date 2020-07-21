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
import { SkillInvokerConfig } from '../config/SkillInvokerConfig';

export class SkillInvokerConfigBuilder {
    private _skillHandler: LambdaHandler;

    public withHandler(handlerName: LambdaHandler): SkillInvokerConfigBuilder {
        this._skillHandler = handlerName;

        return this;
    }

    public get handler(): LambdaHandler {
        return this._skillHandler;
    }

    public build(): SkillInvokerConfig {
        return new SkillInvokerConfig(this);
    }
}
