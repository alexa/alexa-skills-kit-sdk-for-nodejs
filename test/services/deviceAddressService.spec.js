'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const DeviceAddressService = require('../../lib/services/deviceAddressService');

const mockDeviceId = 'deviceId';
const mockApiEndpoint = 'http://api.amazonalexa.com';
const mockToken = 'token';
const mockAPIResult = { statusCode: 200, body: '' };
const mockAPIFailFailureResult = { statusCode: 400, body: 'Error'};

describe('DeviceAddressService', () => {
    it('should call corresponding apiClient method', () => {
        //Set up
        const apiStub = {
            get : () => Promise.resolve(mockAPIResult),
        };
        const spyGet = sinon.spy(apiStub, 'get');

        //Test
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
        //Set up
        const apiStub = {
            get : () => Promise.resolve(mockAPIResult)
        };
        const spyGet = sinon.spy(apiStub, 'get');

        //Expect
        const expectedUri = 'http://api.amazonalexa.com/v1/devices/deviceId/settings/address';
        const expectedHeaders = {'Authorization' : `Bearer ${mockToken}`};

        //Test
        const das = new DeviceAddressService(apiStub);
        return das.getFullAddress(mockDeviceId, mockApiEndpoint, mockToken)
            .then(() => {
                expect(spyGet.getCall(0).args[0]).to.equal(expectedUri);
                expect(spyGet.getCall(0).args[1]).to.deep.equal(expectedHeaders);
            });

    });

    it('should reject promise on http request error', () => {
        //Set up
        const apiStub = {
            get : () => Promise.reject(new Error('Error'))
        };

        //Expect
        const expectedErrMsg = 'Error';

        //Test
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
        //Set up
        const apiStub = {

            get : () => Promise.resolve(mockAPIFailFailureResult)

        };

        //Expect
        const expectedErrMsg = JSON.stringify('Error');

        //Test
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