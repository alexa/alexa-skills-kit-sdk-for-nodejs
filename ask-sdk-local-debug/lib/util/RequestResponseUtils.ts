/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License').
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the 'license' file accompanying this file. This file is distributed
 * on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import axios from 'axios';

import { dynamicEndpoints } from 'ask-sdk-model';
import { RemoteInvokerConfig } from '../config/RemoteInvokerConfig';
import { SkillInvokerConfig } from '../config/SkillInvokerConfig';
import { DynamicEndpointsRequest } from '../request/DynamicEndpointsRequest';

export function getDynamicEndpointsRequest(skillRequest: string): DynamicEndpointsRequest {
    return { DynamicEndpointsRequest, ...JSON.parse(skillRequest) };
}

const ERROR_CODE = '500';

const SKILL_RESPONSE_SUCCESS_MESSAGE_TYPE = 'SkillResponseSuccessMessage';

const SKILL_RESPONSE_FAILURE_MESSAGE_TYPE = 'SkillResponseFailureMessage';

export function getSkillResponse(dynamicEndpointsRequest: DynamicEndpointsRequest,
                                 skillInvokerConfig: SkillInvokerConfig,
                                 callback: (responseString: string) => void): void {
    skillInvokerConfig.handler(JSON.parse(dynamicEndpointsRequest.requestPayload),
                               null, (_invokeErr: Error, response: any) => {
        let responseString: string;
        if (_invokeErr == null) {
            const successResponse: dynamicEndpoints.SuccessResponse = {
                type: SKILL_RESPONSE_SUCCESS_MESSAGE_TYPE,
                originalRequestId: dynamicEndpointsRequest.requestId,
                version: dynamicEndpointsRequest.version,
                responsePayload: JSON.stringify(response),
            };
            responseString = JSON.stringify(successResponse, null, 2);
        } else {
            const failureResponse: dynamicEndpoints.FailureResponse = {
                type: SKILL_RESPONSE_FAILURE_MESSAGE_TYPE,
                version: dynamicEndpointsRequest.version,
                originalRequestId: dynamicEndpointsRequest.requestId,
                errorCode: ERROR_CODE,
                errorMessage: _invokeErr.message,
            };
            responseString = JSON.stringify(failureResponse, null, 2);
        }
        console.log('Skill response', '\n', responseString);
        console.log('----------------------');
        callback(responseString);
    });
}

export function getRemoteSkillResponse(dynamicEndpointsRequest: DynamicEndpointsRequest,
                                       remoteInvokerConfig: RemoteInvokerConfig,
                                       callback: (responseString: string) => void): void {
    const postData = dynamicEndpointsRequest.requestPayload;

    axios
        .post(remoteInvokerConfig.url, JSON.parse(postData))
        .then((res) => {
        const successResponse: dynamicEndpoints.SuccessResponse = {
            type: SKILL_RESPONSE_SUCCESS_MESSAGE_TYPE,
            originalRequestId: dynamicEndpointsRequest.requestId,
            version: dynamicEndpointsRequest.version,
            responsePayload: JSON.stringify(res.data),
        };

        const responseString = JSON.stringify(successResponse, null, 2);
        console.log('Skill response', '\n', responseString);
        console.log('----------------------');
        callback(responseString);
        })
        .catch((e) => {
        const failureResponse: dynamicEndpoints.FailureResponse = {
            type: SKILL_RESPONSE_FAILURE_MESSAGE_TYPE,
            version: dynamicEndpointsRequest.version,
            originalRequestId: dynamicEndpointsRequest.requestId,
            errorCode: ERROR_CODE,
            errorMessage: e.message,
        };

        const responseString = JSON.stringify(failureResponse, null, 2);
        console.log('Skill response', '\n', responseString);
        console.log('----------------------');
        callback(responseString);
        });
}
