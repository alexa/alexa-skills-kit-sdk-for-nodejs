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
import { S3 } from 'aws-sdk';
import * as path from 'path';
import {
    ObjectKeyGenerator,
    ObjectKeyGenerators,
} from './ObjectKeyGenerators';

/**
 * Implementation of {@link PersistenceAdapter} using AWS S3
 */
export class S3PersistenceAdapter implements PersistenceAdapter {
    protected bucketName : string;
    protected s3Client : S3;
    protected objectKeyGenerator : ObjectKeyGenerator;
    protected pathPrefix : string;

    constructor(config : {
        bucketName : string,
        s3Client? : S3,
        objectKeyGenerator? : ObjectKeyGenerator,
        pathPrefix? : string,
    }) {
        this.bucketName = config.bucketName;
        this.s3Client = config.s3Client ? config.s3Client : new S3({apiVersion : 'latest'});
        this.objectKeyGenerator = config.objectKeyGenerator ? config.objectKeyGenerator : ObjectKeyGenerators.userId;
        this.pathPrefix = config.pathPrefix ? config.pathPrefix : '';
    }

    /**
     * Retrieves persistence attributes from AWS S3.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate object key.
     * @returns {Promise<Object.<string, any>>}
     */
    public async getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : string}> {
        const objectId = path.join(this.pathPrefix, this.objectKeyGenerator(requestEnvelope));

        const getParams : S3.GetObjectRequest = {
            Bucket : this.bucketName,
            Key : objectId,
        };

        let data : S3.GetObjectOutput;

        try {
            data = await this.s3Client.getObject(getParams).promise();
        } catch (err) {
            if (err.code === 'NoSuchKey') {
                return {};
            }

            throw createAskSdkError(
                this.constructor.name,
                `Could not read item (${objectId}) from bucket (${getParams.Bucket}): ${err.message}`,
            );
        }

        const bodyString = data.Body ? data.Body.toString() : '';

        let bodyObj;

        try {
            bodyObj = bodyString ? JSON.parse(bodyString) : {};
        } catch (err) {
            throw new SyntaxError(`Failed trying to parse the data body: ${data.Body.toString()}`);
        }

        return bodyObj;
    }

    /**
     * Saves persistence attributes to AWS S3.
     * @param {RequestEnvelope} requestEnvelope Request envelope used to generate object key.
     * @param {Object.<string, any>} attributes Attributes to be saved to DynamoDB.
     * @return {Promise<void>}
     */
    public async saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : string}) : Promise<void> {
        const objectId = path.join(this.pathPrefix, this.objectKeyGenerator(requestEnvelope));

        const putParams : S3.PutObjectRequest = {
            Bucket : this.bucketName,
            Key : objectId,
            Body : JSON.stringify(attributes),
        };

        try {
            await this.s3Client.putObject(putParams).promise();
        } catch (err) {
            throw createAskSdkError(
                this.constructor.name,
                `Could not save item (${objectId}) to bucket (${putParams.Bucket}): ${err.message}`,
            );
        }
    }
}
