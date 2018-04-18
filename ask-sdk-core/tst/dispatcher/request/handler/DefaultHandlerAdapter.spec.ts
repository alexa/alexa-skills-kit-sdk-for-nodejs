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

import { Response } from 'ask-sdk-model';
import { expect } from 'chai';
import { DefaultHandlerAdapter } from '../../../../lib/dispatcher/request/handler/DefaultHandlerAdapter';
import { HandlerInput } from '../../../../lib/dispatcher/request/handler/HandlerInput';
import { MockAlwaysFalseRequestHandler } from '../../../mocks/request/MockAlwaysFalseRequestHandler';

describe('DefaultHandlerAdapter', () => {
    const handlerAdapter = new DefaultHandlerAdapter();

    it('should be able to check for supported handler object', () => {
        expect(handlerAdapter.supports(new MockAlwaysFalseRequestHandler())).equal(true);
        expect(handlerAdapter.supports(new MockAlwaysFalseRequestHandler())).equal(true);
        expect(handlerAdapter.supports({canHandle : true, handle : true})).equal(false);
    });

    it('should be able to invoke the execute function on supported handler object', async() => {
        const mockHandler = {
            canHandle : () : boolean => {
                return true;
            },
            handle : (handlerInput : HandlerInput) : Response => {
                return {shouldEndSession : true};
            },
        };

        const response = await handlerAdapter.execute(null, mockHandler);

        expect(response).deep.equal({shouldEndSession : true});
    });
});
