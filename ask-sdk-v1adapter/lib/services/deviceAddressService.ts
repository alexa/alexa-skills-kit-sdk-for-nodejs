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
import { ApiClient } from './apiClient';
import { ServiceError } from './serviceError';
import { V1ApiClient } from './v1ApiClient';

export class DeviceAddressService {
    protected apiClient : ApiClient;
    protected deviceAddressPathPrefix : string;
    protected deviceAddressPathPostfix : string;
    protected countryAndPostalPathPostfix : string;

    constructor(apiClient? : ApiClient) {
        this.apiClient = apiClient || new V1ApiClient();
        this.deviceAddressPathPrefix = '/v1/devices/';
        this.deviceAddressPathPostfix = '/settings/address';
        this.countryAndPostalPathPostfix = '/countryAndPostalCode';
    }

    public async getFullAddress(deviceId : string, apiEndpoint : string, token : string) : Promise<services.deviceAddress.Address> {
        const uri = apiEndpoint + this.deviceAddressPathPrefix + deviceId + this.deviceAddressPathPostfix;
        const headers = [ {key : 'Authorization', value : `Bearer ${token}`} ];

        const response =  await this.apiClient.get(uri, headers);

        return this.validateApiResponse(response);
    }

    public async getCountryAndPostalCode(deviceId : string, apiEndpoint : string, token : string) : Promise<services.deviceAddress.ShortAddress> {
        const uri = apiEndpoint + this.deviceAddressPathPrefix + deviceId + this.deviceAddressPathPostfix + this.countryAndPostalPathPostfix;
        const headers = [{ key: 'Authorization', value: `Bearer ${token}`}];

        const response = await this.apiClient.get(uri, headers);

        return this.validateApiResponse(response);
    }

    private validateApiResponse(apiClientResponse : services.ApiClientResponse) : services.deviceAddress.Address {
        const isResponseCodeValid = apiClientResponse.statusCode >= 200 && apiClientResponse.statusCode < 300;
        let responseBody;
        try {
            responseBody = apiClientResponse.body && JSON.parse(apiClientResponse.body);
        } catch (err) {
            responseBody = apiClientResponse.body;
        }

        if (isResponseCodeValid) {
            return responseBody;
        }

        throw new ServiceError(apiClientResponse.statusCode, JSON.stringify(responseBody));
    }
}
