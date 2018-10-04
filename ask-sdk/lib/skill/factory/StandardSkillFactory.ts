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

import {
    BaseSkillFactory,
    DefaultApiClient,
    SkillConfiguration,
} from 'ask-sdk-core';
import {
    DynamoDbPersistenceAdapter,
    PartitionKeyGenerator,
} from 'ask-sdk-dynamodb-persistence-adapter';
import { DynamoDB } from 'aws-sdk';
import { StandardSkillBuilder } from './StandardSkillBuilder';

/**
 * Provider for {@link StandardSkillBuilder}.
 */
export class StandardSkillFactory {
    public static init() : StandardSkillBuilder {
        let thisTableName : string;
        let thisAutoCreateTable : boolean;
        let thisPartitionKeyGenerator : PartitionKeyGenerator;
        let thisDynamoDbClient : DynamoDB;

        const baseSkillBuilder = BaseSkillFactory.init();

        return {
            ...<StandardSkillBuilder> baseSkillBuilder,
            getSkillConfiguration() : SkillConfiguration {
                const skillConfiguration = baseSkillBuilder.getSkillConfiguration();

                return {
                    ...skillConfiguration,
                    persistenceAdapter : thisTableName
                        ? new DynamoDbPersistenceAdapter({
                            tableName : thisTableName,
                            createTable : thisAutoCreateTable,
                            partitionKeyGenerator : thisPartitionKeyGenerator,
                            dynamoDBClient : thisDynamoDbClient,
                        })
                        : undefined,
                    apiClient : new DefaultApiClient(),
                };
            },
            withTableName(tableName : string) : StandardSkillBuilder {
                thisTableName = tableName;

                return this;
            },
            withAutoCreateTable(autoCreateTable : boolean) : StandardSkillBuilder {
                thisAutoCreateTable = autoCreateTable;

                return this;
            },
            withPartitionKeyGenerator(partitionKeyGenerator : PartitionKeyGenerator) : StandardSkillBuilder {
                thisPartitionKeyGenerator = partitionKeyGenerator;

                return this;
            },
            withDynamoDbClient(dynamoDbClient : DynamoDB) : StandardSkillBuilder {
                thisDynamoDbClient = dynamoDbClient;

                return this;
            },

        };
    }
}
