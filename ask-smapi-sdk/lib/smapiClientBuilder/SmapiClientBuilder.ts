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
import ApiConfiguration = runtime.ApiConfiguration;
import ApiClient = runtime.ApiClient;
import AuthenticationConfiguration = runtime.AuthenticationConfiguration;
import DefaultApiClient = runtime.DefaultApiClient;

import { SmapiClientBuilder } from './AbstractSmapiClientBuilder';

const DEFAULT_API_ENDPOINT = 'https://api.amazonalexa.com';

/**
 * StandardSmapiClientBuilder class use default ApiClient and default ApiEndpoint
 */
export class StandardSmapiClientBuilder extends SmapiClientBuilder {

    /**
     * Funtion used to generate SkillManagementService instance.
     */
    public client() : services.skillManagement.SkillManagementServiceClient {

        if (this.refreshTokenConfig) {
            const apiConfiguration : ApiConfiguration = {
                apiClient: new DefaultApiClient(),
                apiEndpoint: DEFAULT_API_ENDPOINT,
                authorizationValue: null,
            };
            const authenticationConfiguration : AuthenticationConfiguration = {
                clientId: this.refreshTokenConfig.clientId,
                clientSecret: this.refreshTokenConfig.clientSecret,
                refreshToken: this.refreshTokenConfig.refreshToken,
            };

            return new services.skillManagement.SkillManagementServiceClient(apiConfiguration, authenticationConfiguration, this.customUserAgent);
        }

        throw new Error('Please provide refreshToken Config to build smapi client');
    }
}

/**
 * CustomSmapiClientBuilder give user ability to configure Apiclient and ApiEndpoint
 */
export class CustomSmapiClientBuilder extends StandardSmapiClientBuilder {
    private apiClient : ApiClient;
    private apiEndpoint : string;
    private authEndpoint? : string;

    public withApiEndpoint(apiEndpoint : string) : CustomSmapiClientBuilder {
        this.apiEndpoint = apiEndpoint;

        return this;
    }

    public withAuthEndpoint(authEndpoint : string) : CustomSmapiClientBuilder {
        this.authEndpoint = authEndpoint;

        return this;
    }

    public withApiClient(apiClient : ApiClient) : CustomSmapiClientBuilder {
        this.apiClient = apiClient;

        return this;
    }

    /**
     * Funtion used to generate SkillManagementService instance.
     */
    public client() : services.skillManagement.SkillManagementServiceClient {
        if (!this.apiEndpoint) {
            this.apiEndpoint = DEFAULT_API_ENDPOINT;
        }
        if (!this.apiClient) {
            this.apiClient = new DefaultApiClient();
        }

        if (this.refreshTokenConfig) {
            const apiConfiguration : ApiConfiguration = {
                apiClient: this.apiClient,
                apiEndpoint: this.apiEndpoint,
                authorizationValue: null,
            };
            const authenticationConfiguration : AuthenticationConfiguration = {
                clientId: this.refreshTokenConfig.clientId,
                clientSecret: this.refreshTokenConfig.clientSecret,
                refreshToken: this.refreshTokenConfig.refreshToken,
                authEndpoint: this.authEndpoint,
            };

            return new services.skillManagement.SkillManagementServiceClient(apiConfiguration, authenticationConfiguration, this.customUserAgent);
        }

        throw new Error('Please provide refreshToken Config to build smapi client');
    }
}
