'use strict';
/**
 * @typedef { hostname : string, port : string, path : string, protocol : string, headers : string, method : string } ApiClientOptions
 * @typedef { statusCode : string, statusText : string, body : Object, headers : Object } ApiClientResponse
 */

const http = require('http');
const https = require('https');
const url = require('url');

const HTTPS_PROTOCOL = 'https:';

class ApiClient {

    /**
     * Make a POST API call to the specified uri with headers and optional body
     * @param {string} uri http(s?) endpoint to call
     * @param {Object} headers Key value pair of headers
     * @param {string} body post body to send
     * @returns {Promise<ApiClientResponse>}
     * @memberof ApiClient
     */
    post(uri, headers, body) {
        const options = this.__buildOptions(uri, headers, 'POST');
        return this.__dispatch(options, body);
    }

    /**
     * Make a PUT API call to the specified uri with headers and optional body
     * @param {string} uri http(s?) endpoint to call
     * @param {Object} headers Key value pair of headers
     * @param {string} body post body to send
     * @returns {Promise<ApiClientResponse>}
     * @memberof ApiClient
     */
    put(uri, headers, body) {
        const options = this.__buildOptions(uri, headers, 'PUT');
        return this.__dispatch(options, body);
    }

    /**
     * Make a GET API call to the specified uri with headers
     * @param {string} uri http(s?) endpoint to call
     * @param {Object} headers key value pair of headers
     * @returns {Promise<ApiClientResponse>}
     * @memberof ApiClient
     */
    get(uri, headers) {
        const options = this.__buildOptions(uri, headers, 'GET');
        return this.__dispatch(options);
    }

    /**
     * Make a DELETE API call to the specified uri with headers
     * @param {string} uri http(s?) endpoint to call
     * @param {Object} headers key value pair of headers
     * @returns {Promise<ApiClientResponse>}
     */
    delete(uri, headers) {
        const options = this.__buildOptions(uri, headers, 'DELETE');
        return this.__dispatch(options);
    }

    /**
     * @param {string} uri
     * @param {Object} headers
     * @param {string} method
     * @returns {ApiClientOptions}
     * @memberof ApiClient
     */
    __buildOptions(uri, headers, method) {
        const urlObj = url.parse(uri);
        return {
            hostname : urlObj.hostname,
            port : urlObj.port,
            path : urlObj.path,
            protocol : urlObj.protocol,
            headers : headers,
            method : method
        };
    }

    /**
     * Makes an API call given the specified api client options
     * @private
     * @param {ApiClientOptions} options
     * @param {string} body
     * @returns {Promise<ApiClientResponse>}
     * @memberof ApiClient
     */
    __dispatch(options, body) {
        return new Promise((resolve, reject) => {
            const protocol = options.protocol === HTTPS_PROTOCOL ? https : http;
            const clientRequest = protocol.request(options, (response) => {
                const chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                response.on('end', () => {
                    const responseStr = chunks.join('');
                    const responseObj = {
                        statusCode : response.statusCode,
                        statusText : response.statusText,
                        body : responseStr,
                        headers : response.headers
                    };

                    resolve(responseObj);
                });
            });

            clientRequest.on('error', (err) => {
                reject(err);
            });

            if(body) {
                clientRequest.write(body);
            }

            clientRequest.end();
        });
    }
}

module.exports.ApiClient = ApiClient;
