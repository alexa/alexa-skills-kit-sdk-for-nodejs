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

import { DefaultApiClient } from 'ask-sdk';
import { services } from 'ask-sdk-model';
import { ApiClient } from './apiClient';

export class V1ApiClient implements ApiClient {

    protected defaultApiClient : DefaultApiClient;

    constructor() {
        this.defaultApiClient = new DefaultApiClient();
    }

    public post(uri : string, headers : Array<{key : string, value : string}>, body : string) : Promise<services.ApiClientResponse> {
       const options = this.buildOptions(uri, headers, 'POST');

       return this.dispatch(options, body);
    }

    public put(uri : string, headers : Array<{key : string, value : string}>, body : string) : Promise<services.ApiClientResponse> {
        const options = this.buildOptions(uri, headers, 'PUT');

        return this.dispatch(options, body);
    }

    public get(uri : string, headers : Array<{key : string, value : string}>) : Promise<services.ApiClientResponse> {
        const options = this.buildOptions(uri, headers, 'GET');

        return this.dispatch(options);
    }

    public delete(uri : string, headers : Array<{key : string, value : string}>) : Promise<services.ApiClientResponse> {
        const options = this.buildOptions(uri, headers, 'DELETE');

        return this.dispatch(options);
    }

    private buildOptions(uri : string, requestHeaders : Array<{key : string, value : string}>,
                         requestMethod : string) : services.ApiClientRequest {
        const request  = {
            headers : requestHeaders,
            method : requestMethod,
            url : uri,
        };

        return <services.ApiClientRequest> request;
    }

    private dispatch(options : services.ApiClientRequest, body? : string) : Promise<services.ApiClientResponse> {
        options.body = body;

        return this.defaultApiClient.invoke(options);
    }
}
