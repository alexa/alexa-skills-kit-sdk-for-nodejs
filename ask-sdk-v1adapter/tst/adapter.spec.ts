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

import { ResponseEnvelope } from 'ask-sdk-model';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Adapter } from '../lib/adapter';
import { LaunchRequest, PlaybackControllerRequest } from './mock/mockSampleRequest';
import { mockV2Requesthandler } from './mock/mockV2RequestHandler';

const mockContext = {
    succeed : (responseEnvelope : ResponseEnvelope) => {
        // do something
    },
    fail : (error : Error) => {
        // do something
    },
};
/* tslint:disable */
describe('Adapter', () => {
    it('should pass lambda inputs /to adapter by handler function', () => {
        const adapter = new Adapter(LaunchRequest, mockContext);

        expect(adapter._event).to.deep.equal(LaunchRequest);
        expect(adapter._context).to.deep.equal(mockContext);
    });

    it('should add missing session object', () => {
        const adapter = new Adapter(PlaybackControllerRequest, mockContext);

        expect(adapter._event.session).to.deep.equal({
            application: undefined,
            attributes: {},
            new: undefined,
            sessionId: undefined,
            user: undefined,
        })
    });

    it('should be able to add V2 style request handlers', () => {
        const adapter = new Adapter(LaunchRequest, mockContext);

        adapter.registerV2Handlers(mockV2Requesthandler);

        expect(adapter['v2RequestHandlers'].length).equal(1);
        expect(mockV2Requesthandler.canHandle()).to.equal(true);
    });

    it('should fail if the appId does not match the requestAppId', () => {
        const mockHandler = {
            LaunchRequest: function() {
                // do something
            },
        };
        const adapter = new Adapter(LaunchRequest, mockContext);
        adapter.appId = 'mock application';

        adapter.registerHandlers(mockHandler);
        const spy = sinon.spy(adapter._context, 'fail');
        adapter.execute();

        sinon.assert.calledOnce(spy);
    });

    it('should init i18n client if there exists resources', () => {
        const mockHandler = {
            LaunchRequest: function() {
                // do something
            },
        };
        const adapter = new Adapter(LaunchRequest, mockContext);
        adapter.resources = {
            en : {
                translation  : {
                    test : 'mock test in en',
                }
            },
            de : {
                translation  : {
                    test : 'mock test in de',
                }
            }
        };
        const handlerContext = {
            handler: this,
        };

        adapter.registerHandlers(mockHandler);
        adapter.execute();

        expect(adapter.i18n.t('test')).to.equal('mock test in en');
    });
});
