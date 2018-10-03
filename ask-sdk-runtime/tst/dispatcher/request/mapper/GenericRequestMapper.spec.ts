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
import { GenericRequestHandlerChain } from '../../../../lib/dispatcher/request/handler/GenericRequestHandlerChain';
import { GenericRequestMapper } from '../../../../lib/dispatcher/request/mapper/GenericRequestMapper';
import { MockAlwaysFalseRequestHandler } from '../../../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../../../mocks/request/MockAlwaysTrueRequestHandler';

describe('GenericRequestMapper', () => {
    const mockAlwaysTrueRequestHandlerChain = new GenericRequestHandlerChain<string, string>({
        requestHandler : new MockAlwaysTrueRequestHandler(),
    });
    const mockAlwaysFalseRequestHandlerChain = new GenericRequestHandlerChain<string, string>({
        requestHandler : new MockAlwaysFalseRequestHandler(),
    });

    it('should be able to get the request handler that can handle the input', async() => {
        const mapper = new GenericRequestMapper<string, string>({
            requestHandlerChains : [
                mockAlwaysFalseRequestHandlerChain,
                mockAlwaysTrueRequestHandlerChain,
            ],
        });

        const handlerChain = await mapper.getRequestHandlerChain(null);

        expect(handlerChain.getRequestHandler()).instanceof(MockAlwaysTrueRequestHandler);
    });

    it('should return null if no request handler can handle the input', async() => {
        const mapper = new GenericRequestMapper<string, string>({
            requestHandlerChains : [
                mockAlwaysFalseRequestHandlerChain,
            ],
        });

        const handlerChain = await mapper.getRequestHandlerChain(null);

        expect(handlerChain).equal(null);
    });

});
