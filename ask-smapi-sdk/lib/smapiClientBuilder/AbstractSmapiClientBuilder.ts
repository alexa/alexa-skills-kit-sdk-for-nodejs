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

import { runtime, services } from 'ask-smapi-model';
import AuthenticationConfiguration = runtime.AuthenticationConfiguration;
import { AccessTokenConfig, RefreshTokenConfig } from './authMethods/AuthMethods';

/**
 * Abstract Builder class which should be implemented.
 * @export
 * @class SmapiClientBuilder
 */
export class SmapiClientBuilder {

    protected customUserAgent: string;
    protected accessTokenConfig: AccessTokenConfig;
    protected refreshTokenConfig: RefreshTokenConfig;

    public withCustomUserAgent(userAgent: string): SmapiClientBuilder {
        this.customUserAgent = userAgent;

        return this;
    }

    public withAccessTokenConfig(accessTokenConfig: AccessTokenConfig): SmapiClientBuilder {
        this.accessTokenConfig = accessTokenConfig;

        return this;
    }

    public withRefreshTokenConfig(refreshTokenConfig: RefreshTokenConfig): SmapiClientBuilder {
        this.refreshTokenConfig = refreshTokenConfig;

        return this;
    }

    public client(): services.skillManagement.SkillManagementServiceClient {
        throw new Error('client function is not implemented');
    }

    protected getAuthenticationConfiguration(): AuthenticationConfiguration {
        const authenticationConfiguration: AuthenticationConfiguration = {
            clientId: this.refreshTokenConfig ? this.refreshTokenConfig.clientId : this.accessTokenConfig.clientId,
            clientSecret: this.refreshTokenConfig ? this.refreshTokenConfig.clientSecret : this.accessTokenConfig.clientSecret,
            accessToken: this.accessTokenConfig ? this.accessTokenConfig.accessToken : undefined,
            refreshToken: this.refreshTokenConfig ? this.refreshTokenConfig.refreshToken : undefined
        };

        return authenticationConfiguration;
    }
}
