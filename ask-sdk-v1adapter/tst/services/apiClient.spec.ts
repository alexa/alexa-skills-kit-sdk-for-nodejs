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

import { expect } from 'chai';
import * as nock from 'nock';
import { V1ApiClient } from '../../lib/services/v1ApiClient';

const url = 'http://dummy';

describe('APIClient', () => {
    it('should form POST request with passed headers, body and uri', () => {
        const apiClient = new V1ApiClient();
        const body = 'body';

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .post('/', body)
            .reply(200, 'SUCCESS');

        return apiClient.post(url, [{key: 'authorization', value: 'AUTH'}], body)
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should form GET request with passed headers and uri', () => {
        const apiClient = new V1ApiClient();

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .get('/')
            .reply(200, 'SUCCESS');

        return apiClient.get(url, [{key: 'authorization', value: 'AUTH'}])
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should form DELETE request with passed headers and uri', () => {
        const apiClient = new V1ApiClient();

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .delete('/')
            .reply(200, 'SUCCESS');

        return apiClient.delete(url, [{key: 'authorization', value: 'AUTH'}])
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should form PUT request with passed headers, body and uri', () => {
        const apiClient = new V1ApiClient();
        const body = 'body';

        const apiFake = nock(url)
            .matchHeader('authorization', 'AUTH')
            .put('/', body)
            .reply(200, 'SUCCESS');

        return apiClient.put(url, [{key: 'authorization', value: 'AUTH'}], body)
            .then(() => {
                expect(apiFake.isDone());
            });
    });

    it('should reject the call if an error is thrown by api', () => {
        const apiClient = new V1ApiClient();
        const body = 'body';

        nock(url).post('/', body)
            .replyWithError('ERROR');

        return apiClient.post(url, [{key: 'authorization', value: 'AUTH'}], body)
            .then(() =>  {
                expect.fail(null, null, 'Resolved promise when it should rejected it');
            })
            .catch((err) => {
                expect(err.message).to.equal('ERROR');
            });
    });
});
