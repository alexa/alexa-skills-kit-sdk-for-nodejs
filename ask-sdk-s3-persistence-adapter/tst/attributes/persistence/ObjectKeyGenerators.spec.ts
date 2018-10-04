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
import { ObjectKeyGenerators } from '../../../lib/attributes/persistence/ObjectKeyGenerators';
import { JsonProvider } from '../../mocks/JsonProvider';

describe('ObjectKeyGenerators', () => {
    it('should be able to generate the persistenceId from requestEnvelope using user id', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.device.deviceId = 'deviceId';
        requestEnvelope.context.System.user.userId = 'userId';

        expect(ObjectKeyGenerators.userId(requestEnvelope)).equal('userId');
    });

    it('should throw a new error if user id does not exist', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();

        try {
            ObjectKeyGenerators.userId(requestEnvelope);
        } catch (err) {
            expect(err.name).equal('AskSdk.PartitionKeyGenerators Error');
            expect(err.message).equal('Cannot retrieve user id from request envelope!');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to generate the persistenceId from requestEnvelope using device id', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.device.deviceId = 'deviceId';
        requestEnvelope.context.System.user.userId = 'userId';

        expect(ObjectKeyGenerators.deviceId(requestEnvelope)).equal('deviceId');
    });

    it('should throw a new error if device id does not exist', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();

        try {
            ObjectKeyGenerators.deviceId(requestEnvelope);
        } catch (err) {
            expect(err.name).equal('AskSdk.PartitionKeyGenerators Error');
            expect(err.message).equal('Cannot retrieve device id from request envelope!');

            return;
        }

        throw new Error('should have thrown an error!');
    });
});
