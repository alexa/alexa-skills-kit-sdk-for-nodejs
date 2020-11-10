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

import { ClientConfigBuilder } from '../builder/ClientConfigBuilder';

export class ClientConfig {
    private readonly _accessToken: string;

    private readonly _skillId: string;

    private readonly _handlerName: string;

    private readonly _skillEntryFile: string;

    private readonly _region: string;

    constructor(clientConfigBuilder: ClientConfigBuilder) {
        this._skillEntryFile = clientConfigBuilder.skillEntryFile;
        this._handlerName = clientConfigBuilder.handlerName;
        this._accessToken = clientConfigBuilder.accessToken;
        this._skillId = clientConfigBuilder.skillId;
        this._region = clientConfigBuilder.region;
    }

    public get skillEntryFile(): string {
        return this._skillEntryFile;
    }

    public get skillId(): string {
        return this._skillId;
    }

    public get handlerName(): string {
        return this._handlerName;
    }

    public get accessToken(): string {
        return this._accessToken;
    }

    public get region(): string {
        return this._region;
    }
}
