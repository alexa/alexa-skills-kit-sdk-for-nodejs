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

/**
 * function creating an AskSdk error.
 * @param {string} errorScope
 * @param {string} errorMessage
 * @returns {Error}
 */
export function createAskSdkError(errorScope : string, errorMessage : string) : Error {
    const error = new Error(errorMessage);
    error.name = `AskSdk.${errorScope} Error`;

    return error;
}

/**
 * function creating an AskSdk user agent.
 * @param packageVersion
 * @param customUserAgent
 */
export function createAskSdkUserAgent(packageVersion : string, customUserAgent : string) : string {
    const customUserAgentString = customUserAgent ? (' ' + customUserAgent) : '';

    return `ask-node/${packageVersion} Node/${process.version}` + customUserAgentString;
}
