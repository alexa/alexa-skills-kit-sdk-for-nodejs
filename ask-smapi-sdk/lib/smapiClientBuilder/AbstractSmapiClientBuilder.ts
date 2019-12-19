/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { services } from 'ask-smapi-model';
import { RefreshTokenConfig } from './authMethods/AuthMethods';

/**
 * Abstract Builder class which should be implemented.
 * @export
 * @class SmapiClientBuilder
 */
export class SmapiClientBuilder {

    protected customUserAgent : string;
    protected refreshTokenConfig : RefreshTokenConfig;

    public withCustomUserAgent(userAgent : string) : SmapiClientBuilder {
        this.customUserAgent = userAgent;

        return this;
    }

    public withRefreshTokenConfig(refreshTokenConfig : RefreshTokenConfig) : SmapiClientBuilder {
        this.refreshTokenConfig = refreshTokenConfig;

        return this;
    }

    public client() : services.skillManagement.SkillManagementServiceClient {
        throw new Error('client funtion is not implemented');
    }
}
