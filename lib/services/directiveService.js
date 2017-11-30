'use strict';

const ApiClient = require('./apiClient').ApiClient;
const ServiceError = require('./serviceError').ServiceError;

const DIRECTIVES_API_PATH = '/v1/directives';

class DirectiveService {

    /**
     * Creates an instance of DirectiveService.
     * @param {ApiClient} [apiClient=new ApiClient()] ApiClient
     * @memberof DirectiveService
     */
    constructor(apiClient) {
        this.apiClient = apiClient || new ApiClient();
    }

    /**
     * Send the specified directiveObj to Alexa directive service
     *
     * @param {Object} directive directive to send to service
     * @param {string} apiEndpoint API endpoint from Alexa request
     * @param {string} token bearer token for directive service
     * @returns {Promise<void>}
     * @memberof DirectiveService
     */
    enqueue(directive, apiEndpoint, token) {
        const url = apiEndpoint + DIRECTIVES_API_PATH;
        return this.__dispatch(directive, url, token);
    }

    /**
     * Call the directives api with the specified bearer token and directive object
     *
     * @param {string} token bearer token for directive service
     * @param {Object} directive directive to send to service
     * @returns {Promise<ApiClientResponse>}
     * @private
     * @memberof DirectiveService
     */
    __dispatch(directive, url, token) {
        const body = JSON.stringify(directive);
        const headers = {
            Authorization : `Bearer ${token}`,
            'Content-Type' : 'application/json'
        };

        return this.apiClient.post(url, headers, body)
            .then(this.__validateApiResponse);
    }

    /**
     * Performs validation logic on api responses and throws an error if a problem is found
     *
     * @param {ApiClientResponse} apiClientResponse response originated from the Api call
     * @returns {void}
     * @private
     * @memberOf DirectiveService
     */
    __validateApiResponse(apiClientResponse) {
        let isResponseCodeValid = apiClientResponse.statusCode >= 200 && apiClientResponse.statusCode < 300;
        if (isResponseCodeValid) {
            return;
        }

        throw new ServiceError(apiClientResponse.statusCode, JSON.stringify(apiClientResponse.body));
    }
}

module.exports = DirectiveService;