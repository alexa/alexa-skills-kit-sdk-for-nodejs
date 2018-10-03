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
import { GenericErrorMapper } from '../../../../lib/dispatcher/error/mapper/GenericErrorMapper';
import { MockAlwaysFalseErrorHandler } from '../../../mocks/error/MockAlwaysFalseErrorHandler';
import { MockAlwaysTrueErrorHandler } from '../../../mocks/error/MockAlwaysTrueErrorHandler';

describe('GenericErrorMapper', () => {
    it('should be able to get the error handler that can handle the error', async() => {
        const mapper = new GenericErrorMapper<string, string>({
            errorHandlers : [
                new MockAlwaysTrueErrorHandler(),
                new MockAlwaysFalseErrorHandler(),
            ],
        });

        const handler = await mapper.getErrorHandler(null, new Error('Test error'));

        expect(handler).instanceof(MockAlwaysTrueErrorHandler);
    });

    it('should return null if no error handle can handle the error', async() => {
        const mapper = new GenericErrorMapper<string, string>({
            errorHandlers : [
                new MockAlwaysFalseErrorHandler(),
            ],
        });

        const handler = await mapper.getErrorHandler(null, new Error('Test error'));

        expect(handler).equal(null);
    });
});
