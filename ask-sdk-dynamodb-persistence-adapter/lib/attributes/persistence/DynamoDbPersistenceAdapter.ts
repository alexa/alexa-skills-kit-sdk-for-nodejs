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
    createAskSdkError,
    PersistenceAdapter,
} from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';
import { DynamoDB } from 'aws-sdk';
import {
    PartitionKeyGenerator,
    PartitionKeyGenerators,
} from './PartitionKeyGenerators';

/**
 * Implementation of {@link PersistenceAdapter} using AWS DynamoDB.
 */
export class DynamoDbPersistenceAdapter implements PersistenceAdapter {
    protected tableName : string;
    protected partitionKeyName : string;
    protected attributesName : string;
    protected createTable : boolean;
    protected dynamoDBClient : DynamoDB;
    protected partitionKeyGenerator : PartitionKeyGenerator;
    protected dynamoDBDocumentClient : DynamoDB.DocumentClient;

    constructor(config : {
        tableName : string,
        partitionKeyName? : string,
        attributesName? : string,
        createTable? : boolean,
        dynamoDBClient? : DynamoDB,
        partitionKeyGenerator? : PartitionKeyGenerator;
    }) {
        this.tableName = config.tableName;
        this.partitionKeyName = config.partitionKeyName ? config.partitionKeyName : 'id';
        this.attributesName = config.attributesName ? config.attributesName : 'attributes';
        this.createTable = config.createTable === true;
        this.dynamoDBClient = config.dynamoDBClient ? config.dynamoDBClient : new DynamoDB({apiVersion : 'latest'});
        this.partitionKeyGenerator = config.partitionKeyGenerator ? config.partitionKeyGenerator : PartitionKeyGenerators.userId;
        this.dynamoDBDocumentClient = new DynamoDB.DocumentClient({
            convertEmptyValues : true,
            service : this.dynamoDBClient,
        });
        // Create table when createTable is set to true and table does not exist
        if (this.createTable) {
            const createTableParams : DynamoDB.CreateTableInput = {
                AttributeDefinitions: [{
                    AttributeName: this.partitionKeyName,
                    AttributeType: 'S',
                }],
                KeySchema: [{
                    AttributeName: this.partitionKeyName,
                    KeyType: 'HASH',
                }],
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5,
                },
                TableName : this.tableName,
            };

            this.dynamoDBClient.createTable(createTableParams, (createTableErr) => {
                if (createTableErr && createTableErr.code !== 'ResourceInUseException') {
                    throw createAskSdkError(
                        this.constructor.name,
                        `Could not create table (${this.tableName}): ${createTableErr.message}`,
                    );
                }
            });
        }
    }

    /**
     * Retrieves persistence attributes from AWS DynamoDB.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
     * @returns {Promise<Object.<string, any>>}
     */
    public async getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}> {
        const attributesId = this.partitionKeyGenerator(requestEnvelope);

        const getParams : DynamoDB.DocumentClient.GetItemInput = {
            Key : {
                [this.partitionKeyName] : attributesId,
            },
            TableName : this.tableName,
            ConsistentRead : true,
        };

        let data : DynamoDB.DocumentClient.GetItemOutput;
        try {
            data = await this.dynamoDBDocumentClient.get(getParams).promise();
        } catch (err) {
            throw createAskSdkError(
                this.constructor.name,
                `Could not read item (${attributesId}) from table (${getParams.TableName}): ${err.message}`,
            );
        }

        if (!Object.keys(data).length) {
            return {};
        } else {
            return data.Item[this.attributesName];
        }
    }

    /**
     * Saves persistence attributes to AWS DynamoDB.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate partition key.
     * @param {Object.<string, any>} attributes Attributes to be saved to DynamoDB.
     * @return {Promise<void>}
     */
    public async saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void> {
        const attributesId = this.partitionKeyGenerator(requestEnvelope);

        const putParams : DynamoDB.DocumentClient.PutItemInput = {
            Item: {
                [this.partitionKeyName] : attributesId,
                [this.attributesName] : attributes,
            },
            TableName : this.tableName,
        };

        try {
            await this.dynamoDBDocumentClient.put(putParams).promise();
        } catch (err) {
            throw createAskSdkError(
                this.constructor.name,
                `Could not save item (${attributesId}) to table (${putParams.TableName}): ${err.message}`,
            );
        }
    }
}
