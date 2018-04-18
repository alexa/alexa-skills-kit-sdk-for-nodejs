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

'use strict';

import { expect } from 'chai';
import * as sinon from 'sinon';
import { VoicePlayerSpeakDirective } from '../../lib/directives/voicePlayerSpeakDirective';
import { DirectiveService } from '../../lib/services/directiveService';

const testEndpoint = 'http://dummy';
const testToken = 'token';
const directive : VoicePlayerSpeakDirective = new VoicePlayerSpeakDirective('mock id', 'mock speech content');

describe('DirectiveService', () => {
    it('should call /v1/directives API', () => {
        const fakeApiResult = { statusCode: 200, body: '' };
        const apiStub = { post : () => Promise.resolve(fakeApiResult) };
        const spy = sinon.spy(apiStub, 'post');

        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect(spy.callCount).to.equal(1);
            });
    });

    it('should not reject promise on error', () => {
        const errMsg = 'error';
        const apiStub = { post : () => Promise.reject(new Error(errMsg)) };

        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect.fail('should have thrown exception');
            })
            .catch((err) => {
                expect(err.message).to.equal(errMsg);
            });
    });

    it('should reject the promise with the error message if the API client returns a non 2xx status', () => {
        const expectedMessage = 'Invalid Directive';
        const fakeApiResult = { statusCode: 400, body: `${expectedMessage}` };
        const apiStub = { post: () =>  Promise.resolve(fakeApiResult) };

        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then(() => {
                expect.fail('should have rejected the promise');
            })
            .catch((err) => {
                expect(err.statusCode).to.equal(400);
                expect(err.message).to.equal(JSON.stringify(expectedMessage));
            });
    });

    it('should not expose any implementation details on the returning promise', () => {
        const fakeApiResult = { statusCode: 200, body: '' };
        const apiStub = { post : () => Promise.resolve(fakeApiResult) };

        const ds = new DirectiveService(apiStub);

        return ds.enqueue(directive, testEndpoint, testToken)
            .then((result) => {
                expect(result).to.equal(undefined);
            });
    });
});
