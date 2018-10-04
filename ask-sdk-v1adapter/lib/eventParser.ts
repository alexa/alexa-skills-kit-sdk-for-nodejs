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
    IntentRequest,
    RequestEnvelope,
} from 'ask-sdk-model';

export const EventParser = (event : RequestEnvelope) : string => {
        const requestType = event.request.type;
        if (requestType === 'IntentRequest') {
            return (<IntentRequest> event.request).intent.name;
        } else if (requestType.startsWith('Display.') ||
                  requestType.startsWith('AudioPlayer.') ||
                  requestType.startsWith('PlaybackController.')) {
            return requestType.split('.')[1];
        } else {
            return requestType;
        }
    };
