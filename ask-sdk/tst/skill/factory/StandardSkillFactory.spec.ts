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

import { DefaultApiClient } from 'ask-sdk-core';
import {
    DynamoDbPersistenceAdapter,
    PartitionKeyGenerators,
} from 'ask-sdk-dynamodb-persistence-adapter';
import { DynamoDB } from 'aws-sdk';
import { expect } from 'chai';
import { StandardSkillFactory } from '../../../lib/skill/factory/StandardSkillFactory';

describe('StandardSkillFactory', () => {
    it('should be able to add DefaultApiClient', () => {
        const skillConfig = StandardSkillFactory.init().getSkillConfiguration();

        expect(skillConfig.apiClient).instanceOf(DefaultApiClient);
    });

    it('should be able to add DynamoDbPersistenceAdapter with table name', () => {
        const skillConfig = StandardSkillFactory.init()
            .withTableName('testTable')
            .getSkillConfiguration();

        expect(skillConfig.persistenceAdapter).instanceOf(DynamoDbPersistenceAdapter);
    });

    it('should be able to add DynamoDbPersistenceAdapter with customization', () => {
        const skillConfig = StandardSkillFactory.init()
            .withTableName('testTable')
            .withAutoCreateTable(false)
            .withDynamoDbClient(new DynamoDB({apiVersion : 'latest'}))
            .withPartitionKeyGenerator(PartitionKeyGenerators.userId)
            .getSkillConfiguration();

        expect(skillConfig.persistenceAdapter).instanceOf(DynamoDbPersistenceAdapter);
    });
});
