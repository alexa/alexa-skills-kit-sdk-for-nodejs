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
import { DefaultApiClient } from '../../../lib/service/DefaultApiClient';
import { CustomSkillFactory } from '../../../lib/skill/factory/CustomSkillFactory';
import { MockPersistenceAdapter } from '../../mocks/persistence/MockPersistenceAdapter';

describe('CustomSkillFactory', () => {
    it('should be able to add persistence adapter', () => {
        const config = CustomSkillFactory.init()
            .withPersistenceAdapter(new MockPersistenceAdapter())
            .getSkillConfiguration();

        expect(config.persistenceAdapter).instanceOf(MockPersistenceAdapter);
    });

    it('should be able to add api client', () => {
        const config = CustomSkillFactory.init()
            .withApiClient(new DefaultApiClient())
            .getSkillConfiguration();

        expect(config.apiClient).instanceOf(DefaultApiClient);
    });
});
