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

import { services } from 'ask-sdk-model';
import { VoicePlayerSpeakDirective } from '../directives/voicePlayerSpeakDirective';
import { ApiClient } from './apiClient';
import { ServiceError } from './serviceError';
import { V1ApiClient } from './v1ApiClient';

export class DirectiveService {
    protected apiClient : ApiClient;
    protected directivesApiPath : string;

    constructor(apiClient? : ApiClient) {
        this.apiClient = apiClient || new V1ApiClient();
        this.directivesApiPath = '/v1/directives';
    }

    public enqueue(directive : VoicePlayerSpeakDirective, apiEndpoint : string, token : string) : Promise<void> {
        const uri = apiEndpoint + this.directivesApiPath;

        return this.dispatch(directive, uri, token);
    }

    private async dispatch(directive : VoicePlayerSpeakDirective, url : string, token : string) : Promise<void> {
        const body = JSON.stringify(directive);
        const headers = [{key : 'Authorization', value : `Bearer ${token}`},
                         {key : 'Content-Type', value : 'application/json'}];

        const response = await this.apiClient.post(url, headers, body);

        return this.validateApiResponse(response);
    }

    private validateApiResponse(apiClientResponse : services.ApiClientResponse) : void {
        const isResponseCodeValid = apiClientResponse.statusCode >= 200 && apiClientResponse.statusCode < 300;
        if (isResponseCodeValid) {
            return;
        }

        throw new ServiceError(apiClientResponse.statusCode, JSON.stringify(apiClientResponse.body));
    }
}
