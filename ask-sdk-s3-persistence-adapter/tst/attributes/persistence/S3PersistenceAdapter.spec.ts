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

import * as AWS from 'aws-sdk';
import * as AWS_MOCK from 'aws-sdk-mock';
import { expect } from 'chai';
import { ObjectKeyGenerators } from '../../../lib/attributes/persistence/ObjectKeyGenerators';
import { S3PersistenceAdapter } from '../../../lib/attributes/persistence/S3PersistenceAdapter';
import { JsonProvider } from '../../mocks/JsonProvider';

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

    const pathPrefixObjectKey = 'folder/userId';
    const pathPrefixObjectAttributes = {
        pathPrefixKey : 'pathPrefixValue',
    };

    const bucketInvalidError = new Error('The specified bucket is not valid.');
    Object.defineProperty(bucketInvalidError, 'code', {
        value : 'InvalidBucketName',
        writable : false,
    });

    const noSuchKeyError = new Error('The specified key does not exist.');
    Object.defineProperty(noSuchKeyError, 'code', {
        value : 'NoSuchKey',
        writable : false,
    });

    const requestEnvelope = JsonProvider.requestEnvelope();
    requestEnvelope.context.System.device.deviceId = 'deviceId';
    requestEnvelope.context.System.user.userId = 'userId';

    before((done) => {
        AWS_MOCK.setSDKInstance(AWS);
        AWS_MOCK.mock('S3', 'getObject', (params, callback) => {
            if (params.Bucket !== bucketName) {
                callback(bucketInvalidError, null);
            } else {
                if (params.Key === defaultObjectKey) {
                    callback(null, {Body : Buffer.from(JSON.stringify(defaultAttributes))});
                } else if (params.Key === customObjectKey) {
                    callback(null, {Body : Buffer.from(JSON.stringify(customAttributes))});
                } else if (params.Key === pathPrefixObjectKey) {
                    callback(null, {Body : Buffer.from(JSON.stringify(pathPrefixObjectAttributes))})
                } else if (params.Key === nonJsonObjectKey) {
                    callback(null, {Body : Buffer.from(nonJsonObjectAttributes)});
                } else if (params.Key === emptyBodyKey) {
                    callback(null, {});
                } else {
                    callback(noSuchKeyError, null);
                }
            }
        });
        AWS_MOCK.mock('S3', 'putObject', (params, callback) => {
            if (params.Bucket !== bucketName) {
                callback(bucketInvalidError, null);
            } else {
                callback(null, {});
            }
        });
        done();
    });

    after((done) => {
        AWS_MOCK.restore('S3');
        done();
    });

    it('should be able to get an item from bucket', async() => {
        const defaultPersistenceAdapter = new S3PersistenceAdapter({
            bucketName,
        });
        const customPersistenceAdapter = new S3PersistenceAdapter({
            bucketName,
            s3Client : new AWS.S3(),
            objectKeyGenerator : ObjectKeyGenerators.deviceId,
        });
        const pathPrefixPersistenceAdapter = new S3PersistenceAdapter({
            bucketName,
            pathPrefix : 'folder',
        })

        const defaultResult = await defaultPersistenceAdapter.getAttributes(requestEnvelope);
        expect(defaultResult.defaultKey).eq('defaultValue');

        const customResult = await customPersistenceAdapter.getAttributes(requestEnvelope);
        expect(customResult.customKey).eq('customValue');

        const pathPrefixResult = await pathPrefixPersistenceAdapter.getAttributes(requestEnvelope);
        expect(pathPrefixResult.pathPrefixKey).eq('pathPrefixValue');
    });

    it('should be able to put an item to bucket', async() => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName,
        });

        await persistenceAdapter.saveAttributes(requestEnvelope, {});
    });

    it('should return an empty object when getting item that does not exist in bucket', async() => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName,
        });

        const mockRequestEnvelope = JsonProvider.requestEnvelope();
        mockRequestEnvelope.context.System.user.userId = 'NonExistentKey';

        const result = await persistenceAdapter.getAttributes(mockRequestEnvelope);
        expect(result).deep.equal({});
    });

    it('should return an emtpy object when getting item that has empty value', async() => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName,
        });

        const mockRequestEnvelope = JsonProvider.requestEnvelope();
        mockRequestEnvelope.context.System.user.userId = 'emptyBodyKey';

        const result = await persistenceAdapter.getAttributes(mockRequestEnvelope);
        expect(result).deep.equal({});
    });

    it('should throw an error when reading and the bucket does not exist', async() => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName : 'NonExistentBucket',
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

    it('should throw an error when saving and the bucket does not exist', async() => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName : 'NonExistentBucket',
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

    it('should throw an error when getting invalid json object', async() => {
        const persistenceAdapter = new S3PersistenceAdapter({
            bucketName,
        });

        const mockRequestEnvelope = JsonProvider.requestEnvelope();
        mockRequestEnvelope.context.System.user.userId = 'nonJsonObjectKey';

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
