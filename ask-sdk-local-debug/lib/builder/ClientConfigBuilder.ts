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

import { ClientConfig } from '../config/ClientConfig';

export class ClientConfigBuilder {
    private _skillEntryFile: string;

    private _handlerName: string;

    private _accessToken: string;

    private _skillId: string;

    private _region: string;

    public withSkillEntryFile(skillEntryFile: string): ClientConfigBuilder {
        this._skillEntryFile = skillEntryFile;

        return this;
    }

    public withHandlerName(handlerName: string): ClientConfigBuilder {
        this._handlerName = handlerName;

        return this;
    }

    public withAccessToken(accessToken: string): ClientConfigBuilder {
        this._accessToken = accessToken;

        return this;
    }

    public withSkillId(skillId: string): ClientConfigBuilder {
        this._skillId = skillId;

        return this;
    }

    withRegion(region: string): ClientConfigBuilder {
        this._region = region;

        return this;
    }

    public get skillEntryFile(): string {
        return this._skillEntryFile;
    }

    public get handlerName(): string {
        return this._handlerName;
    }

    public get accessToken(): string {
        return this._accessToken;
    }

    public get skillId(): string {
        return this._skillId;
    }

    public get region(): string {
        return this._region;
    }

    public build(): ClientConfig {
        return new ClientConfig(this);
    }
}
