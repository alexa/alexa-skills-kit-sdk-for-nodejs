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
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ApiClient } from '../../lib/services/apiClient';
import { ListManagementService } from '../../lib/services/listManagementService';

const mockToken = 'token';
const mockListId = 'listId';
const mockListItemId = 'listItemId';
const mockListItemStatus = 'active';
const mockAPIResult : services.ApiClientResponse = {
    headers : [],
    statusCode: 200,
    body: '',
};
const mockAPIFailedResult : services.ApiClientResponse = {
    headers : [],
    statusCode: 400,
    body: 'Error',
};
describe('ListManagementService', () => {
    it('should call corresponding apiClient method', () => {
        const mockListObject = {};
        const mockListItemObject = {};
        const apiStub : ApiClient = {
            post : (
                uri : string,
                headers : Array<{key : string, value : string}>,
                body : string,
            ) => Promise.resolve(mockAPIResult),
            put : (
                uri : string,
                headers : Array<{key : string, value : string}>,
                body : string,
            ) => Promise.resolve(mockAPIResult),
            get : (
                uri : string,
                headers : Array<{key : string, value : string}>,
            ) => Promise.resolve(mockAPIResult),
            delete : (
                uri : string,
                headers : Array<{key : string, value : string}>,
            ) => Promise.resolve(mockAPIResult),
        };
        const spyPost = sinon.spy(apiStub, 'post');
        const spyPut = sinon.spy(apiStub, 'put');
        const spyGet = sinon.spy(apiStub, 'get');
        const spyDelete = sinon.spy(apiStub, 'delete');

        const lms = new ListManagementService(apiStub);

        return lms.getListsMetadata(mockToken)
            .then(() => {
                return lms.createList(mockListObject, mockToken);
            })
            .then(() => {
                return lms.getList(mockListId, mockListItemStatus, mockToken);
            })
            .then(() => {
                return lms.updateList(mockListId, mockListObject, mockToken);
            })
            .then(() => {
                return lms.deleteList(mockListId, mockToken);
            })
            .then(() => {
                return lms.createListItem(mockListId, mockListItemObject, mockToken);
            })
            .then(() => {
                return lms.getListItem(mockListId, mockListItemId, mockToken);
            })
            .then(() => {
                return lms.updateListItem(mockListId, mockListItemId, mockListItemObject, mockToken);
            })
            .then(() => {
                return lms.deleteListItem(mockListId, mockListItemId, mockToken);
            })
            .then(() => {
                expect(spyPost.callCount).to.equal(2);
                expect(spyPut.callCount).to.equal(2);
                expect(spyGet.callCount).to.equal(3);
                expect(spyDelete.callCount).to.equal(2);
            });
    });

    it('should preperly set API Endpoint address with given value', () => {
        const defaultApiEndpoint = 'https://api.amazonalexa.com';
        const updatedApiEndpoint = 'https://dummy.com';

        const lms = new ListManagementService();
        expect(lms.getApiEndpoint()).to.equal(defaultApiEndpoint);
        lms.setApiEndpoint(updatedApiEndpoint);
        expect(lms.getApiEndpoint()).to.equal(updatedApiEndpoint);
    });

    it('should properly construct uri and headers with given non empty query parameters', () => {
        const apiStub : ApiClient = {
            get : (
                uri : string,
                headers : Array<{key : string, value : string}>,
            ) => Promise.resolve(mockAPIResult),
        };
        const spyGet = sinon.spy(apiStub, 'get');

        const expectedUri = 'https://api.amazonalexa.com/v2/householdlists/';
        const expectedHeaders = [{key : 'Authorization', value: `Bearer ${mockToken}`}];

        const lms = new ListManagementService(apiStub);

        return lms.getListsMetadata(mockToken)
            .then(() => {
                expect(spyGet.getCall(0).args[0]).to.equal(expectedUri);
                expect(spyGet.getCall(0).args[1]).to.deep.equal(expectedHeaders);
            });
    });

    it('should reject promise on http request error', () => {
        const apiStub : ApiClient = {
            get : (
                uri : string,
                headers : Array<{key : string, value : string}>,
            ) => Promise.reject(new Error('Error')),
        };

        const expectedErrMsg = 'Error';

        const lms = new ListManagementService(apiStub);

        return lms.getListsMetadata(mockToken)
            .then(() => {
                expect.fail('should have thrown error');
            })
            .catch((error) => {
                expect(error.message).to.equal(expectedErrMsg);
            });
    });

    it('should reject promise with error message if the device API returns a non 2xx status', () => {
        const apiStub : ApiClient = {
            get : (
                uri : string,
                headers : Array<{key : string, value : string}>,
            ) => Promise.resolve(mockAPIFailedResult),
        };

        const expectedErrMsg = JSON.stringify('Error');

        const lms = new ListManagementService(apiStub);

        return lms.getListsMetadata(mockToken)
            .then(() => {
                expect.fail('should have thrown error');
            })
            .catch((error) => {
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal(expectedErrMsg);
            });
    });
});
