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
import { SkillBuilders } from '../../lib/skill/SkillBuilders';

describe('SkillBuilders', () => {
    it('should be able to return CustomSkillBuilder', () => {
        const skillBuilder = SkillBuilders.custom();

        expect('withPersistenceAdapter' in skillBuilder).equal(true);
        expect('withApiClient' in skillBuilder).equal(true);
        expect('withTableName' in skillBuilder).equal(false);
        expect('withPartitionKeyGenerator' in skillBuilder).equal(false);
        expect('withDynamoDbClient' in skillBuilder).equal(false);
    });

    it('should be able to return StandardSkillBuilder', () => {
        const skillBuilder = SkillBuilders.standard();

        expect('withPersistenceAdapter' in skillBuilder).equal(false);
        expect('withApiClient' in skillBuilder).equal(false);
        expect('withTableName' in skillBuilder).equal(true);
        expect('withPartitionKeyGenerator' in skillBuilder).equal(true);
        expect('withDynamoDbClient' in skillBuilder).equal(true);
    });
});
