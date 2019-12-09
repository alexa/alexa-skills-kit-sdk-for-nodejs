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

import { SmapiClientBuilder } from './SmapiClientBuilder';

const DEFAULT_API_ENDPOINT = 'https://api.amazonalexa.com';

/**
 * StandardSmapiClientBuilder class use default ApiClient and default ApiEndpoint
 */
export class StandardSmapiClientBuilder extends SmapiClientBuilder {
    protected clientId : string;
    protected clientSecret : string;
    protected refreshToken : string;
    /**
     * The StandardSmapiClientBuilder use constant API endpoint
     *
     * @string clientId
     * @string clientSecret
     * @string refreshToken
     * @string apiEndpoint
     */
    constructor(clientId : string, clientSecret : string, refreshToken : string) {
        super();
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
    }

    /**
     * Funtion used to generate SkillManagementService instance.
     */
    public client() : services.skillManagement.SkillManagementServiceClient {
        if (!this.apiEndpoint) {
            this.apiEndpoint = DEFAULT_API_ENDPOINT;
        }
        const apiConfiguration : ApiConfiguration = {
            apiClient: new DefaultApiClient(),
            apiEndpoint: this.apiEndpoint,
            authorizationValue: null,
        };
        const authenticationConfiguration : AuthenticationConfiguration = {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            refreshToken: this.refreshToken,
        };

        return new services.skillManagement.SkillManagementServiceClient(apiConfiguration, authenticationConfiguration);
    }
}

/**
 * CustomSmapiClientBuilder give user ability to configure Apiclient and ApiEndpoint
 */
export class CustomSmapiClientBuilder extends StandardSmapiClientBuilder {
    protected apiClient : ApiClient;
    /**
     * The StandardSmapiClientBuilder use constant API endpoint
     *
     * @string clientId
     * @string clientSecret
     * @string refreshToken
     * @ApiClient apiClient
     * @string apiEndpoint
     */
    constructor(clientId : string,
                clientSecret : string,
                refreshToken : string,
                apiClient : ApiClient = new DefaultApiClient()) {
        super(clientId, clientSecret, refreshToken);
        this.apiClient = apiClient;
    }

    /**
     * Funtion used to generate SkillManagementService instance.
     */
    public client() : services.skillManagement.SkillManagementServiceClient {
        if (!this.apiEndpoint) {
            this.apiEndpoint = DEFAULT_API_ENDPOINT;
        }
        const apiConfiguration : ApiConfiguration = {
            apiClient: this.apiClient,
            apiEndpoint: this.apiEndpoint,
            authorizationValue: null,
        };
        const authenticationConfiguration : AuthenticationConfiguration = {
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            refreshToken: this.refreshToken,
        };

        return new services.skillManagement.SkillManagementServiceClient(apiConfiguration, authenticationConfiguration);
    }
}
