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

import { WebSocketClientConfig } from '../config/WebSocketClientConfig';

export class WebSocketClientConfigBuilder {
    private _webSocketServerUri: string;

    private _headers: {};

    public withSkillId(skillId: string): WebSocketClientConfigBuilder {
        this._webSocketServerUri = `wss://bob-dispatch-prod-na.amazon.com/v1/skills/${skillId}/stages/development/connectCustomDebugEndpoint`;

        return this;
    }

    public withAccessToken(accessToken: string): WebSocketClientConfigBuilder {
        this._headers = { authorization: accessToken };

        return this;
    }

    public get webSocketServerUri(): string {
        return this._webSocketServerUri;
    }

    public get headers(): {} {
        return this._headers;
    }

    public build(): WebSocketClientConfig {
        return new WebSocketClientConfig(this);
    }
}
