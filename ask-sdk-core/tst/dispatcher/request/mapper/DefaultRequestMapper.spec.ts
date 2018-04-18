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
import { DefaultRequestHandlerChain } from '../../../../lib/dispatcher/request/handler/DefaultRequestHandlerChain';
import { DefaultRequestMapper } from '../../../../lib/dispatcher/request/mapper/DefaultRequestMapper';
import { MockAlwaysFalseRequestHandler } from '../../../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../../../mocks/request/MockAlwaysTrueRequestHandler';

describe('DefaultRequestMapper', () => {
    let mockAlwaysTrueRequestHandlerChain : DefaultRequestHandlerChain;
    let mockAlwaysFalseRequestHandlerChain : DefaultRequestHandlerChain;

    before(() => {
        mockAlwaysTrueRequestHandlerChain = new DefaultRequestHandlerChain({
            requestHandler : new MockAlwaysTrueRequestHandler(),
        });
        mockAlwaysFalseRequestHandlerChain = new DefaultRequestHandlerChain({
            requestHandler : new MockAlwaysFalseRequestHandler(),
        });
    });

    it('should be able to get the RequestHandler that can handle the HandlerInput', async() => {
        const mapper = new DefaultRequestMapper({
            requestHandlerChains : [
                mockAlwaysTrueRequestHandlerChain,
                mockAlwaysFalseRequestHandlerChain,
            ],
        });

        const handlerChain =  await mapper.getRequestHandlerChain(null);

        expect(handlerChain.getRequestHandler()).instanceof(MockAlwaysTrueRequestHandler);
    });

    it('should return null if no RequestHandler can handle the HandlerInput', async() => {
        const mapper = new DefaultRequestMapper({
            requestHandlerChains : [
                mockAlwaysFalseRequestHandlerChain,
            ],
        });

        const handlerChain =  await mapper.getRequestHandlerChain(null);

        expect(handlerChain).equal(null);
    });
});
