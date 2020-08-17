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

import { createAskSdkError, Skill } from 'ask-sdk-core';
import { ResponseEnvelope } from 'ask-sdk-model';
import { IncomingHttpHeaders } from 'http';
import { Verifier } from '../verifier';

/**
 * Verify request and dispatch
 *
 * This method first validate request with all provided verifiers
 * Then, invoke the skill to handle request envelope to get response
 * @param {IncomingHttpHeaders} httpRequestHeader Http request header
 * @param {string} httpRequestBody Http request body in string format
 * @param {Skill} skill ask-sdk-core custom skill instance
 * @param {Verifier[]} verifiers Array of user customized Verifier instances
 */
export async function asyncVerifyRequestAndDispatch(httpRequestHeader: IncomingHttpHeaders, httpRequestBody: string, skill: Skill, verifiers: Verifier[]): Promise<ResponseEnvelope> {
    try {
        await Promise.all(verifiers.map(async (verifier) => {
            await verifier.verify(httpRequestBody, httpRequestHeader);
        }));
    } catch (err) {
        throw createAskSdkError('Request verification failed', err.message);
    }

    let responseEnvelope;
    try {
        responseEnvelope = await skill.invoke(JSON.parse(httpRequestBody));
    } catch (err) {
        throw createAskSdkError('Skill dispatch failed', err.message);
    }

    return responseEnvelope;
}
