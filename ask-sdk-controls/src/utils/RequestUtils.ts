/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { Request } from "ask-sdk-model";
import { SimplifiedIntent } from "./IntentUtils";

/**
 * Utility to stringify a Request object.
 * @param request - Request
 */
export function requestToString(request: Request) {

    switch (request.type) {
        case 'IntentRequest': return SimplifiedIntent.fromIntent(request.intent).toString();
        case 'Alexa.Presentation.APL.UserEvent': return `APL.UserEvent: ${JSON.stringify(request.arguments)}`;
        default: return request.type;
    }
}