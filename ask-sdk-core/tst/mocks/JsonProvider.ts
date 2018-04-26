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

'use strict';

import {
    Intent,
    RequestEnvelope,
    Slot,
} from 'ask-sdk-model';

export const JsonProvider = {
    requestEnvelope() : RequestEnvelope {
        return {
            context : {
                AudioPlayer : null,
                Display : null,
                System : {
                    apiAccessToken : null,
                    apiEndpoint : null,
                    application : {
                        applicationId : null,
                    },
                    device : {
                        deviceId : null,
                        supportedInterfaces : null,
                    },
                    user : {
                        userId : null,
                    },
                },
            },
            request: {
                type: 'LaunchRequest',
                requestId: null,
                timestamp : null,
                locale: null,

            },
            session: {
                application: {
                    applicationId: null,
                },
                attributes: null,
                new: true,
                sessionId: null,
                user: {
                    accessToken: null,
                    permissions: {
                        consentToken: null,
                    },
                    userId: null,
                },
            },
            version: '1.0',
        };
    },
    intent() : Intent {
        return {
            confirmationStatus : null,
            name : null,
            slots : null,
        };
    },
    slot() : Slot {
        return {
            confirmationStatus : null,
            name : null,
            value : null,
            resolutions: null,
        };
    },
};
