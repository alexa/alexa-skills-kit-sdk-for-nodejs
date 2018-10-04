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
import {
    createAskSdkError,
    createAskSdkUserAgent,
} from '../../lib/util/AskSdkUtils';

describe('AskSdkUtils', () => {
    it('should be able to create custom error', () => {
        const error = createAskSdkError(
            'Custom name',
            'Custom message',
        );

        expect(error.name).equal('AskSdk.Custom name Error');
        expect(error.message).equal('Custom message');
    });

    it('should be able to create user agent string', () => {
        const userAgent = createAskSdkUserAgent('2.0.0',undefined);

        expect(userAgent).equal(`ask-node/2.0.0 Node/${process.version}`);
    });

    it('should be able to create user agent string with custom user agent', () => {
        const userAgent = createAskSdkUserAgent('2.0.0', 'custom user agent');
        const packageInfo = require('../../package.json');

        expect(userAgent).equal(`ask-node/2.0.0 Node/${process.version} custom user agent`);
    });
});
