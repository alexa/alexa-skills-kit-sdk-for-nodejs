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
import { DeviceAddressService } from '../../lib/services/deviceAddressService';

const mockDeviceId = 'deviceId';
const mockApiEndpoint = 'http://api.amazonalexa.com';
const mockToken = 'token';
const mockAPIResult : services.ApiClientResponse = {
    headers : [],
    statusCode: 200,
    body: '',
};
const mockAPIFailedResult = {
    headers : [],
    statusCode: 400,
    body: 'Error',
};

describe('DeviceAddressService', () => {
    it('should call corresponding apiClient method', () => {
        const apiStub : ApiClient = {
            get : (
                uri : string,
                headers : Array<{key : string, value : string}>,
            ) => Promise.resolve(mockAPIResult),
        };

        const spyGet = sinon.spy(apiStub, 'get');
        const das = new DeviceAddressService(apiStub);

        return das.getFullAddress(mockDeviceId, mockApiEndpoint, mockToken)
            .then(() => {
                return das.getCountryAndPostalCode(mockDeviceId, mockApiEndpoint, mockToken);
            })
            .then(() => {
                expect(spyGet.callCount).to.equal(2);
            });
    });

    it('should properly construct uri and headers with given null parameters', () => {
        const apiStub : ApiClient = {
            get : (
                uri : string,
                headers : Array<{key : string, value : string}>,
            ) => Promise.resolve(mockAPIResult),
        };
        const spyGet = sinon.spy(apiStub, 'get');

        const expectedUri = 'http://api.amazonalexa.com/v1/devices/deviceId/settings/address';
        const expectedHeaders = [{key: 'Authorization', value : `Bearer ${mockToken}`}];

        const das = new DeviceAddressService(apiStub);

        return das.getFullAddress(mockDeviceId, mockApiEndpoint, mockToken)
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

        const das = new DeviceAddressService(apiStub);

        return das.getFullAddress(mockDeviceId, mockApiEndpoint, mockToken)
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

        const das = new DeviceAddressService(apiStub);

        return das.getFullAddress(mockDeviceId, mockApiEndpoint, mockToken)
            .then(() => {
                expect.fail('should have thrown error');
            })
            .catch((error) => {
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal(expectedErrMsg);
            });
    });
});
