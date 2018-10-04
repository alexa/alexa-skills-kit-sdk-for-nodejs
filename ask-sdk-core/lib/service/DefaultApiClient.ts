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
import { createAskSdkError } from 'ask-sdk-runtime';
import { RequestOptions as HttpRequestOptions } from 'http';
import { RequestOptions as HttpsRequestOptions } from 'https';
import * as url from 'url';
import ApiClientResponse = services.ApiClientResponse;
import ApiClientRequest = services.ApiClientRequest;
import ApiClient = services.ApiClient;

/**
 * Default implementation of {@link services.ApiClient} which uses the native HTTP/HTTPS library of Node.JS.
 */
export class DefaultApiClient implements ApiClient {
    /**
     * Dispatches a request to an API endpoint described in the request.
     * An ApiClient is expected to resolve the Promise in the case an API returns a non-200 HTTP
     * status code. The responsibility of translating a particular response code to an error lies with the
     * caller to invoke.
     * @param {services.ApiClientRequest} request request to dispatch to the ApiClient
     * @returns {Promise<services.ApiClientResponse>} response from the ApiClient
     */
    public invoke(request : ApiClientRequest) : Promise<ApiClientResponse> {
        const urlObj = url.parse(request.url);

        const clientRequestOptions : HttpRequestOptions | HttpsRequestOptions = {
            // tslint:disable:object-literal-sort-keys
            hostname : urlObj.hostname,
            path : urlObj.path,
            port : urlObj.port,
            protocol : urlObj.protocol,
            auth : urlObj.auth,
            headers : arrayToObjectHeader(request.headers),
            method : request.method,
        };

        const client = clientRequestOptions.protocol === 'https:' ? require('https') : require('http');

        return new Promise<services.ApiClientResponse>((resolve, reject) => {
            const clientRequest = client.request(clientRequestOptions, (response) => {
                const chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                response.on('end', () => {
                    const responseStr = chunks.join('');
                    const responseObj : services.ApiClientResponse = {
                        statusCode : response.statusCode,
                        body : responseStr,
                        headers : objectToArrayHeader(response.headers),
                    };

                    resolve(responseObj);
                });
            });

            clientRequest.on('error', (err) => {
                reject(createAskSdkError(this.constructor.name, err.message));
            });

            if (request.body) {
                clientRequest.write(request.body);
            }

            clientRequest.end();
        });
    }
}

/**
 * Converts the header array in {@link services.ApiClientRequest} to compatible JSON object.
 * @private
 * @param {{key : string, value : string}[]} header header array from ApiClientRequest}
 * @returns {Object.<string, string[]>} header object to pass into HTTP client
 */
function arrayToObjectHeader(header : Array<{key : string, value : string}>) : {[key : string] : string[]} {
    const reducer = (obj : {[key : string] : string[]}, item : {key : string, value : string})
        : {[key : string] : string | string[]} => {
        if (obj[item.key]) {
            obj[item.key].push(item.value);
        } else {
            obj[item.key] = [item.value];
        }

        return obj;
    };

    return header.reduce(reducer, {});
}

/**
 * Converts JSON header object to header array required for {services.ApiClientResponse}
 * @private
 * @param {Object.<string, (string|string[])>} header JSON header object returned by HTTP client
 * @returns {{key : string, value : string}[]}
 */
function objectToArrayHeader(header : {[key : string] : string | string[]}) : Array<{key : string, value : string}> {
    const arrayHeader = <Array<{key : string, value : string}>> [];

    Object.keys(header).forEach((key : string) => {
        const headerArray = Array.isArray(header[key]) ? header[key] : [header[key]];
        for (const value of <string[]> headerArray) {
            arrayHeader.push({
                key,
                value,
            });
        }
    });

    return arrayHeader;
}
