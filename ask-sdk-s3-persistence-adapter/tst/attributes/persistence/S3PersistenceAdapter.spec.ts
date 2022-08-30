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
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';
import {
    AwsClientStub,
    mockClient
} from 'aws-sdk-client-mock';
import { expect } from 'chai';
import path = require ('path');
import { ObjectKeyGenerators } from '../../../lib/attributes/persistence/ObjectKeyGenerators';
import { S3PersistenceAdapter } from '../../../lib/attributes/persistence/S3PersistenceAdapter';
import { JsonProvider } from '../../mocks/JsonProvider';
import { Readable } from 'stream';

describe('S3PersistenceAdapter', () => {
    const bucketName = 'mockBucket';
    const defaultObjectKey = 'userId';
    const defaultAttributes = {
        defaultKey : 'defaultValue',
    };
    const customObjectKey = 'deviceId';
    const customAttributes = {
        customKey : 'customValue',
    };
    const emptyBodyKey = 'emptyBodyKey';
    const nonJsonObjectKey = 'nonJsonObjectKey';
    const nonJsonObjectAttributes = 'This is a non json string';
    const pathPrefixObjectKey = path.join('folder', 'userId');
    const pathPrefixObjectAttributes = {
        pathPrefixKey : 'pathPrefixValue',
    };
    const NoSuchBucketName = 'NonExistentBucket';
    const bucketInvalidError = new Error('The specified bucket is not valid.');
    Object.defineProperty(bucketInvalidError, 'code', {
        value : 'InvalidBucketName',
        writable : false,
    });
    const NoSuchS3ObjectKey = 'noSuchKey';
    const noSuchKeyError = new Error('The specified key does not exist.');
    Object.defineProperty(noSuchKeyError, 'code', {
        value : 'NoSuchKey',
        writable : false,
    });
    const requestEnvelope = JsonProvider.requestEnvelope();
    requestEnvelope.context.System.device.deviceId = 'deviceId';
    requestEnvelope.context.System.user.userId = 'userId';

    let persistenceAdapter: S3PersistenceAdapter;
    let mockS3: AwsClientStub<S3Client>;
    let s3Client: S3Client;

    before((done) => {
        mockS3 = mockClient(S3Client)
            .onAnyCommand({
                Bucket: NoSuchBucketName
            }).rejects(bucketInvalidError)

            // GetObject
            .on(GetObjectCommand, {
                Bucket: bucketName,
                Key: defaultObjectKey
            }).resolves({
                Body: Buffer.from(JSON.stringify(defaultAttributes)) as unknown as Readable
            })
            .on(GetObjectCommand, {
                Key: customObjectKey
            }).resolves({
                Body: Buffer.from(JSON.stringify(customAttributes)) as unknown as Readable
            })
            .on(GetObjectCommand, {
                Key: pathPrefixObjectKey
            }).resolves({
                Body: Buffer.from(JSON.stringify(pathPrefixObjectAttributes)) as unknown as Readable
            })
            .on(GetObjectCommand, {
                Key: nonJsonObjectKey
            }).resolves({
                Body: Buffer.from(nonJsonObjectAttributes) as unknown as Readable
            })
            .on(GetObjectCommand, {
                Key: emptyBodyKey
            }).resolves({})
            .on(GetObjectCommand, {
                Key: NoSuchS3ObjectKey
            }).rejects(noSuchKeyError)

            // PutObject
            .on(PutObjectCommand, {
                Bucket: bucketName
            }).resolves({})

            // DeleteObject
            .on(DeleteObjectCommand, {
                Bucket: bucketName
            }).resolves({});
        s3Client = new S3Client({});
        persistenceAdapter = new S3PersistenceAdapter({
            bucketName
        });
        done();
    });

    after((done) => {
        mockS3.restore();
        done();
    });

    it('should be able to get an item from bucket', async () => {
        const customPersistenceAdapter = new S3PersistenceAdapter({
            bucketName,
            s3Client,
            objectKeyGenerator : ObjectKeyGenerators.deviceId,
        });
        const pathPrefixPersistenceAdapter = new S3PersistenceAdapter({
            bucketName,
            pathPrefix : 'folder',
        });

        const defaultResult = await persistenceAdapter.getAttributes(requestEnvelope);
        expect(defaultResult.defaultKey).eq('defaultValue');

        const customResult = await customPersistenceAdapter.getAttributes(requestEnvelope);
        expect(customResult.customKey).eq('customValue');

        const pathPrefixResult = await pathPrefixPersistenceAdapter.getAttributes(requestEnvelope);
        expect(pathPrefixResult.pathPrefixKey).eq('pathPrefixValue');
    });

    it('should be able to put an item to bucket', async () => {
        await persistenceAdapter.saveAttributes(requestEnvelope, {});
    });

    it('should be able to delete an item from bucket', async () => {
        await persistenceAdapter.deleteAttributes(requestEnvelope);
    });

    it('should return an empty object when getting item that does not exist in bucket', async () => {
        const mockRequestEnvelope = JsonProvider.requestEnvelope();
        mockRequestEnvelope.context.System.user.userId = NoSuchS3ObjectKey;

        const result = await persistenceAdapter.getAttributes(mockRequestEnvelope);
        expect(result).deep.equal({});
    });

    it('should return an empty object when getting item that has empty value', async () => {
        const mockRequestEnvelope = JsonProvider.requestEnvelope();
        mockRequestEnvelope.context.System.user.userId = 'emptyBodyKey';

        const result = await persistenceAdapter.getAttributes(mockRequestEnvelope);
        expect(result).deep.equal({});
    });

    it('should throw an error when reading and the bucket does not exist', async () => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName : NoSuchBucketName,
            s3Client
        });

        try {
            await persistenceAdapter.getAttributes(requestEnvelope);
        } catch (err) {
            expect(err.name).equal('AskSdk.S3PersistenceAdapter Error');
            expect(err.message).equal('Could not read item (userId) from bucket (NonExistentBucket): ' +
                                      'The specified bucket is not valid.');

            return;
        }
        throw new Error('should have thrown an error!');
    });

    it('should throw an error when saving and the bucket does not exist', async () => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName : NoSuchBucketName,
        });

        try {
            await persistenceAdapter.saveAttributes(requestEnvelope, {});
        } catch (err) {
            expect(err.name).equal('AskSdk.S3PersistenceAdapter Error');
            expect(err.message).equal('Could not save item (userId) to bucket (NonExistentBucket): ' +
                                      'The specified bucket is not valid.');

            return;
        }
        throw new Error('should have thrown an error!');
    });

    it('should throw an error when deleting and the bucket does not exist', async () => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName : NoSuchBucketName,
        });

        try {
            await persistenceAdapter.deleteAttributes(requestEnvelope);
        } catch (err) {
            expect(err.name).equal('AskSdk.S3PersistenceAdapter Error');
            expect(err.message).equal('Could not delete item (userId) from bucket (NonExistentBucket): ' +
                                      'The specified bucket is not valid.');

            return;
        }
        throw new Error('should have thrown an error!');
    });

    it('should throw an error when getting invalid json object', async () => {
        const mockRequestEnvelope = JsonProvider.requestEnvelope();
        mockRequestEnvelope.context.System.user.userId = nonJsonObjectKey;

        try {
            await persistenceAdapter.getAttributes(mockRequestEnvelope);
        } catch (err) {
            expect(err.name).equal('SyntaxError');
            expect(err.message).equal('Failed trying to parse the data body: This is a non json string');

            return;
        }
        throw new Error('should have thrown an error!');
    });
});
