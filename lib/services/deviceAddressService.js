'use strict';

const ApiClient = require('./apiClient').ApiClient;
const ServiceError = require('./serviceError').ServiceError;

const DEVICE_ADDRESS_PATH_PREFIX = '/v1/devices/';
const DEVICE_ADDRESS_PATH_POSTFIX = '/settings/address';
const COUNTRY_AND_POSTAL_PATH_POSTFIX = '/countryAndPostalCode';

class DeviceAddressService {

    /**
     * Create an instance of DeviceAddressService
     * @param {ApiClient} [apiClient=new ApiClient()] ApiClient
     * @memberOf DeviceAddressService
     */
    constructor(apiClient) {
        this.apiClient = apiClient || new ApiClient();
    }

    /**
     * Get full address information from Alexa Device Address API
     * @param {string} deviceId deviceId from Alexa request
     * @param {string} apiEndpoint API apiEndpoint from Alexa request
     * @param {string} token bearer token for device address permission
     * @returns {Promise<Object>}
     * @memberOf DeviceAddressService
     */
    getFullAddress(deviceId, apiEndpoint, token) {
        const uri = apiEndpoint + DEVICE_ADDRESS_PATH_PREFIX + deviceId + DEVICE_ADDRESS_PATH_POSTFIX;
        const headers = {'Authorization': `Bearer ${token}`};

        return this.apiClient.get(uri, headers)
            .then(this.__validateApiResponse);
    }

    /**
     * Get country and postal information from Alexa Device Address API
     * @param {string} deviceId deviceId from Alexa request
     * @param {string} apiEndpoint API apiEndpoint from Alexa request
     * @param {string} token bearer token for device address permission
     * @returns {Promise<Object>}
     * @memberOf DeviceAddressService
     */
    getCountryAndPostalCode(deviceId, apiEndpoint, token) {
        const uri = apiEndpoint + DEVICE_ADDRESS_PATH_PREFIX + deviceId + DEVICE_ADDRESS_PATH_POSTFIX + COUNTRY_AND_POSTAL_PATH_POSTFIX;
        const headers = {'Authorization': `Bearer ${token}`};

        return this.apiClient.get(uri, headers)
            .then(this.__validateApiResponse);
    }

    /**
     * Performs validation logic on api responses and throws an error if a problem is found
     *
     * @param {ApiClientResponse} apiClientResponse response returned from the API call
     * @returns {Object | string}
     * @private
     * @memberOf DeviceAddressService
     */
    __validateApiResponse(apiClientResponse) {
        let isResponseCodeValid = apiClientResponse.statusCode >= 200 && apiClientResponse.statusCode < 300;
        let responseBody;
        try {
            responseBody = apiClientResponse.body && JSON.parse(apiClientResponse.body);
        } catch(err) {
            responseBody = apiClientResponse.body;
        }

        if (isResponseCodeValid) {
            return responseBody;
        }

        throw new ServiceError(apiClientResponse.statusCode, JSON.stringify(responseBody));
    }
}

module.exports = DeviceAddressService;