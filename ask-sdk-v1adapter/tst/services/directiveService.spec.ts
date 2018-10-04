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
import { VoicePlayerSpeakDirective } from '../../lib/directives/voicePlayerSpeakDirective';
import { ApiClient } from '../../lib/services/apiClient';
import { DirectiveService } from '../../lib/services/directiveService';

const testEndpoint = 'http://dummy';
const testToken = 'token';
const directive : VoicePlayerSpeakDirective = new VoicePlayerSpeakDirective('mock id', 'mock speech content');
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

describe('DirectiveService', () => {
    it('should call /v1/directives API', () => {
        const apiStub : ApiClient = {
            post : (
                uri : string,
                headers : Array<{key : string, value : string}>,
                body : string,
            ) => Promise.resolve(mockAPIResult),
        };
        const spy = sinon.spy(apiStub, 'post');

        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect(spy.callCount).to.equal(1);
            });
    });

    it('should not reject promise on error', () => {
        const apiStub : ApiClient = {
            post : (
                uri : string,
                headers : Array<{key : string, value : string}>,
                body : string,
            ) => Promise.reject(new Error('error')),
        };

        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect.fail('should have thrown exception');
            })
            .catch((err) => {
                expect(err.message).to.equal('error');
            });
    });

    it('should reject the promise with the error message if the API client returns a non 2xx status', () => {
        const apiStub : ApiClient = {
            post : (
                uri : string,
                headers : Array<{key : string, value : string}>,
                body : string,
            ) => Promise.resolve(mockAPIFailedResult),
        };

        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect.fail('should have rejected the promise');
            })
            .catch((err) => {
                expect(err.statusCode).to.equal(400);
                expect(err.message).to.equal(JSON.stringify('Error'));
            });
    });

    it('should not expose any implementation details on the returning promise', () => {
        const apiStub : ApiClient = {
            post : (
                uri : string,
                headers : Array<{key : string, value : string}>,
                body : string,
            ) => Promise.resolve(mockAPIResult),
        };
        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then((result) => {
                expect(result).to.equal(undefined);
            });
    });
});
