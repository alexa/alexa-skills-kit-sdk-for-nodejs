'use strict';
/**
 * @typedef { value : string, status: string, version: long} ListItemObject
 * @typedef { name : string, status : string, version: long} ListObject
 */

const ApiClient = require('./apiClient').ApiClient;
const ServiceError = require('./serviceError').ServiceError;

const LIST_MANAGEMENT_PATH = '/v2/householdlists/';

class ListManagementService {

    /**
     * Create an instance of ListManagementService
     * @param apiClient
     */
    constructor(apiClient) {
        this.apiClient = apiClient || new ApiClient();
        this.apiEndpoint = 'https://api.amazonalexa.com';
    }

    /**
     * Set apiEndpoint address, default is 'https://api.amazonalexa.com'
     * @param apiEndpoint
     * @returns void
     * @memberOf ListManagementService
     */
    setApiEndpoint(apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    /**
     * Get currently set apiEndpoint address
     * @returns {string}
     * @memberOf ListManagementService
     */
    getApiEndpoint() {
        return this.apiEndpoint;
    }

    /**
     * Retrieve the metadata for all customer lists, including the customer's default lists
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    getListsMetadata(token){
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH;
        const headers = this.__buildHeaders(token);

        return this.apiClient.get(uri, headers)
            .then(this.__validateApiResponse);
    }

    /**
     * Create a custom list. The new list name must be different than any existing list name
     * @param {ListObject} listObject
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    createList(listObject, token) {
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH;
        const headers = this.__buildHeaders(token, listObject);

        return this.apiClient.post(uri, headers, JSON.stringify(listObject))
            .then(this.__validateApiResponse);
    }

    /**
     * Retrieve list metadata including the items in the list with requested status
     * @param {string} listId unique Id associated with the list
     * @param {string} itemStatus itemsStatus can be either 'active' or 'completed'
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    getList(listId, itemStatus, token) {
        const uri = this.apiEndpoint +  LIST_MANAGEMENT_PATH + listId + '/' + itemStatus;
        const headers = this.__buildHeaders(token);

        return this.apiClient.get(uri, headers)
            .then(this.__validateApiResponse);
    }

    /**
     * Update a custom list. Only the list name or state can be updated
     * @param {string} listId unique Id associated with the list
     * @param {ListObject} listObject
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    updateList(listId, listObject, token) {
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH + listId;
        const headers = this.__buildHeaders(token, listObject);

        return this.apiClient.put(uri, headers, JSON.stringify(listObject))
            .then(this.__validateApiResponse);
    }

    /**
     * Delete a custom list
     * @param {string} listId unique Id associated with the list
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    deleteList(listId, token) {
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH + listId;
        const headers = this.__buildHeaders(token);

        return this.apiClient.delete(uri, headers)
            .then(this.__validateApiResponse);
    }

    /**
     * Create an item in an active list or in a default list
     * @param {string} listId unique Id associated with the list
     * @param {ListItemObject} listItemObject
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    createListItem(listId, listItemObject, token) {
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH + listId + '/items';
        const headers = this.__buildHeaders(token, listItemObject);

        return this.apiClient.post(uri, headers, JSON.stringify(listItemObject))
            .then(this.__validateApiResponse);
    }

    /**
     * Retrieve single item within any list by listId and itemId
     * @param {string} listId unique Id associated with the list
     * @param {string} itemId unique Id associated with the item
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    getListItem(listId, itemId, token) {
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH + listId + '/items/' + itemId;
        const headers = this.__buildHeaders(token);

        return this.apiClient.get(uri, headers)
            .then(this.__validateApiResponse);
    }

    /**
     * Update an item value or item status
     * @param {string} listId unique Id associated with the list
     * @param {string} itemId unique Id associated with the item
     * @param {ListItemObject} listItemObject
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    updateListItem(listId, itemId, listItemObject, token) {
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH + listId + '/items/' + itemId;
        const headers = this.__buildHeaders(token, listItemObject);

        return this.apiClient.put(uri, headers, JSON.stringify(listItemObject))
            .then(this.__validateApiResponse);
    }

    /**
     * Delete an item in the specified list
     * @param {string} listId unique Id associated with the list
     * @param {string} itemId unique Id associated with the item
     * @param {string} token bearer token for list management permission
     * @returns {Promise<Object>}
     * @memberOf ListManagementService
     */
    deleteListItem(listId, itemId, token) {
        const uri = this.apiEndpoint + LIST_MANAGEMENT_PATH + listId + '/items/' + itemId;
        const headers = this.__buildHeaders(token);

        return this.apiClient.delete(uri, headers)
            .then(this.__validateApiResponse);
    }

    /**
     * Helper function to make the header given token and body
     * @param {string} token
     * @param {Object} body (optional)
     * @returns {Object} headers
     * @private
     * @memberOf ListManagementService
     */
    __buildHeaders(token, body) {
        let headers = {
            'Authorization' : `Bearer ${token}`
        };
        if (body) {
            headers['Content-type'] = 'application/json';
            headers['Content-length'] = Buffer.byteLength(JSON.stringify(body), 'utf8');
        }
        return headers;
    }

    /**
     * Performs validation logic on api responses and throws an error if a problem is found
     *
     * @param {ApiClientResponse} apiClientResponse response returned from the API call
     * @returns {Object | string}
     * @private
     * @memberOf ListManagementService
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

module.exports = ListManagementService;