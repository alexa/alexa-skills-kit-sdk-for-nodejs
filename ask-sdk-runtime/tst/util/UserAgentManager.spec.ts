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
import { UserAgentManager } from '../../lib/util/UserAgentManager';

describe('UserAgentManager', () => {
    it('should be initialized with an empty string', () => {
        expect(UserAgentManager.getUserAgent()).equal('');
    });

    it('should handle a single component', () => {
        UserAgentManager.registerComponent('foo');
        expect(UserAgentManager.getUserAgent()).equal('foo');
    });

    it('should handle multiple components', () => {
        UserAgentManager.registerComponent('foo');
        UserAgentManager.registerComponent('bar');
        expect(UserAgentManager.getUserAgent()).equal('foo bar');
    });

    it('should clear components', () => {
        UserAgentManager.registerComponent('foo');
        UserAgentManager.registerComponent('bar');
        UserAgentManager['components'].clear();
        UserAgentManager['userAgent'] = '';
        expect(UserAgentManager.getUserAgent()).equal('');
    });
});
