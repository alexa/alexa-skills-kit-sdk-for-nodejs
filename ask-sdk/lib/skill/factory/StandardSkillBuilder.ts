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

import { BaseSkillBuilder } from 'ask-sdk-core';
import { PartitionKeyGenerator } from 'ask-sdk-dynamodb-persistence-adapter';
import { DynamoDB } from 'aws-sdk';

/**
 * An interface containing help functions to build a {@link CustomSkill} with dynamoDB configuration options.
 */
export interface StandardSkillBuilder extends BaseSkillBuilder {
    withTableName(tableName : string) : this;
    withAutoCreateTable(autoCreateTable : boolean) : this;
    withPartitionKeyGenerator(partitionKeyGenerator : PartitionKeyGenerator) : this;
    withDynamoDbClient(customDynamoDBClient : DynamoDB) : this;
}
