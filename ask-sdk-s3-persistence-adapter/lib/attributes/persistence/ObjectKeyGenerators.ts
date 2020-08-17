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

import { createAskSdkError } from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';

/**
 * Type definition of function used by {@link S3PersistenceAdapter} to extract attributes id from {@link RequestEnvelope}.
 */
export type ObjectKeyGenerator = (requestEnvelope: RequestEnvelope) => string;

/**
 * Object containing implementations of {@link ObjectKeyGenerator}.
 */
export const ObjectKeyGenerators = {
    /**
     * Gets attributes id using user id.
     * @param {RequestEnvelope} requestEnvelope
     * @returns {string}
     */
    userId(requestEnvelope: RequestEnvelope): string {
        if (!(requestEnvelope
              && requestEnvelope.context
              && requestEnvelope.context.System
              && requestEnvelope.context.System.user
              && requestEnvelope.context.System.user.userId)) {
            throw createAskSdkError(
                'PartitionKeyGenerators',
                'Cannot retrieve user id from request envelope!',
            );
        }

        return requestEnvelope.context.System.user.userId;
    },

    /**
     * Gets attributes id using device id.
     * @param {RequestEnvelope} requestEnvelope
     * @returns {string}
     */
    deviceId(requestEnvelope: RequestEnvelope): string {
        if (!(requestEnvelope
              && requestEnvelope.context
              && requestEnvelope.context.System
              && requestEnvelope.context.System.device
              && requestEnvelope.context.System.device.deviceId)) {
            throw createAskSdkError(
                'PartitionKeyGenerators',
                'Cannot retrieve device id from request envelope!',
            );
        }

        return requestEnvelope.context.System.device.deviceId;
    },
};
