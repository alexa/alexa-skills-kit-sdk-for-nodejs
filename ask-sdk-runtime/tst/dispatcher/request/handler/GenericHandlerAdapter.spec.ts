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
import { GenericHandlerAdapter } from '../../../../lib/dispatcher/request/handler/GenericHandlerAdapter';
import { MockAlwaysFalseRequestHandler } from '../../../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../../../mocks/request/MockAlwaysTrueRequestHandler';

describe('GenericHandlerAdapter', () => {
    const handlerAdapter = new GenericHandlerAdapter();

    it('should be able to check for supported handler object', () => {
        expect(handlerAdapter.supports(new MockAlwaysTrueRequestHandler())).eq(true);
        expect(handlerAdapter.supports(new MockAlwaysFalseRequestHandler())).eq(true);
        expect(handlerAdapter.supports({canHandle : true, handle : true})).equal(false);
    });

    it('should be able to invoke the execute function on supported handler object', async() => {
        const response = await handlerAdapter.execute('test', new MockAlwaysTrueRequestHandler());

        expect(response).eq('Input(test) received at MockAlwaysTrueRequestHandler');
    });
});
