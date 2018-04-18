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
import { GenericRequestHandlerChain } from '../../../../lib/dispatcher/request/handler/GenericRequestHandlerChain';
import { MockPersistentAttributesRequestInterceptor } from '../../../mocks/interceptor/MockPersistentAttributesRequestInterceptor';
import { MockPersistentAttributesResponseInterceptor } from '../../../mocks/interceptor/MockPersistentAttributesResponseInterceptor';
import { MockSessionAttributesRequestInterceptor } from '../../../mocks/interceptor/MockSessionAttributesRequestInterceptor';
import { MockSessionAttributesResponseInterceptor } from '../../../mocks/interceptor/MockSessionAttributesResponseInterceptor';

describe('GenericRequestHandlerChain', () => {
    let handlerChain : GenericRequestHandlerChain;
    before(() => {
        handlerChain = new GenericRequestHandlerChain({
            requestHandler : {},
            requestInterceptors : [
                new MockSessionAttributesRequestInterceptor(),
                new MockPersistentAttributesRequestInterceptor(),
            ],
            responseInterceptors : [
                new MockSessionAttributesResponseInterceptor(),
                new MockPersistentAttributesResponseInterceptor(),
            ],
        });
    });

    it('should be able to get RequestHandler', () => {
        expect(typeof handlerChain.getRequestHandler()).equal('object');
    });

    it('should be able to get RequestInterceptor array', () => {
        expect(handlerChain.getRequestInterceptors().length).equal(2);
        expect(handlerChain.getRequestInterceptors()[0]).instanceOf(MockSessionAttributesRequestInterceptor);
        expect(handlerChain.getRequestInterceptors()[1]).instanceOf(MockPersistentAttributesRequestInterceptor);
    });

    it('should be able to get ResponseInterceptor array', () => {
        expect(handlerChain.getResponseInterceptors().length).equal(2);
        expect(handlerChain.getResponseInterceptors()[0]).instanceOf(MockSessionAttributesResponseInterceptor);
        expect(handlerChain.getResponseInterceptors()[1]).instanceOf(MockPersistentAttributesResponseInterceptor);
    });
});
