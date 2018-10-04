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

export class ListManagementService {
    protected apiClient : ApiClient;
    protected listManagementPath : string;
    protected apiEndpoint : string;

    constructor(apiClient? : ApiClient) {
        this.apiClient = apiClient || new V1ApiClient();
        this.listManagementPath = '/v2/householdlists/';
        this.apiEndpoint = 'https://api.amazonalexa.com';
    }

    public setApiEndpoint(apiEndpoint : string) : void {
        this.apiEndpoint = apiEndpoint;
    }

    public getApiEndpoint() : string {
        return this.apiEndpoint;
    }

    public async getListsMetadata(token : string) : Promise<services.listManagement.AlexaListMetadata> {
        const uri = this.apiEndpoint + this.listManagementPath;
        const headers = this.buildHeaders(token);

        const response = await this.apiClient.get(uri, headers);

        return <services.listManagement.AlexaListMetadata> this.validateApiResponse(response);
    }

    public async createList(listObject : object, token : string) : Promise<services.listManagement.AlexaListMetadata> {
        const uri = this.apiEndpoint + this.listManagementPath;
        const headers = this.buildHeaders(token, listObject);

        const response = await this.apiClient.post(uri, headers, JSON.stringify(listObject));

        return <services.listManagement.AlexaListMetadata> this.validateApiResponse(response);
    }

    public async getList(listId : string, itemStatus : string, token : string) : Promise<services.listManagement.AlexaList> {
        const uri = this.apiEndpoint + this.listManagementPath + listId + '/' + itemStatus;
        const headers = this.buildHeaders(token);

        const response = await this.apiClient.get(uri, headers);

        return <services.listManagement.AlexaList> this.validateApiResponse(response);
    }

    public async updateList(listId : string, listOjbect : object, token : string) : Promise<services.listManagement.AlexaListMetadata> {
        const uri = this.apiEndpoint + this.listManagementPath + listId;
        const headers = this.buildHeaders(token, listOjbect);

        const response = await this.apiClient.put(uri, headers, JSON.stringify(listOjbect));

        return <services.listManagement.AlexaListMetadata> this.validateApiResponse(response);
    }

    public async deleteList(listId : string, token : string) : Promise<void> {
        const uri = this.apiEndpoint + this.listManagementPath + listId;
        const headers = this.buildHeaders(token);

        const response = await this.apiClient.delete(uri, headers);

        const isResponseCodeValid = response.statusCode >= 200 && response.statusCode < 300;
        if (isResponseCodeValid) {
            return;
        }

        throw new ServiceError(response.statusCode, JSON.stringify(response.body));
    }

    public async createListItem(listId : string, listItemObject : object, token : string) : Promise<services.listManagement.AlexaListItem> {
        const uri = this.apiEndpoint + this.listManagementPath + listId + '/items';
        const headers = this.buildHeaders(token, listItemObject);

        const response = await this.apiClient.post(uri, headers, JSON.stringify(listItemObject));

        return <services.listManagement.AlexaListItem> this.validateApiResponse(response);
    }

    public async getListItem(listId : string, itemId : string, token : string) : Promise<services.listManagement.AlexaListItem> {
        const uri = this.apiEndpoint + this.listManagementPath + listId + '/items/' + itemId;
        const headers = this.buildHeaders(token);

        const response = await this.apiClient.get(uri, headers);

        return <services.listManagement.AlexaListItem> this.validateApiResponse(response);
    }

    public async updateListItem(listId : string, itemId : string, listItemObject : object, token : string)
    : Promise<services.listManagement.AlexaListItem> {
        const uri = this.apiEndpoint + this.listManagementPath + listId + '/items/' + itemId;
        const headers = this.buildHeaders(token, listItemObject);

        const response = await this.apiClient.put(uri, headers, JSON.stringify(listItemObject));

        return <services.listManagement.AlexaListItem> this.validateApiResponse(response);
    }

    public async deleteListItem(listId : string, itemId : string, token : string) : Promise<void> {
        const uri = this.apiEndpoint + this.listManagementPath + listId + '/items/' + itemId;
        const headers = this.buildHeaders(token);

        const response = await this.apiClient.delete(uri, headers);

        const isResponseCodeValid = response.statusCode >= 200 && response.statusCode < 300;
        if (isResponseCodeValid) {
            return;
        }

        throw new ServiceError(response.statusCode, JSON.stringify(response.body));
    }
    private buildHeaders(token : string, body? : object) : Array<{key : string, value : string}> {
        const headers = [];
        headers.push({key : 'Authorization', value : `Bearer ${token}`});
        if (body) {
            headers.push({key : 'Content-type', value : 'application/json'});
            headers.push({key : 'Content-length', value : Buffer.byteLength(JSON.stringify(body), 'utf8').toString()});
        }

        return headers;
    }

    private validateApiResponse(apiClientResponse : services.ApiClientResponse) : object {
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
