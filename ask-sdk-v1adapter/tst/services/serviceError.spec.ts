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
import { ServiceError } from '../../lib/services/serviceError';

function throwServiceError() : void {
    throw new ServiceError(202, 'Error Message');
}

describe('ServiceError', () => {
    it('should create a ServiceError with statusCode and message', () => {
        try {
            throwServiceError();
        } catch (error) {
            expect(error.statusCode).to.equal(202);
            expect(error.message).to.equal('Error Message');
            expect(error).to.be.an.instanceOf(Error);
            expect(require('util').isError(error)).to.equal(true);
            expect(error.stack.split('\n')[0]).to.deep.equal('ServiceError: Error Message');
            expect(error.stack.split('\n')[1].indexOf('throwServiceError')).to.deep.equal(7);
        }
    });
});
