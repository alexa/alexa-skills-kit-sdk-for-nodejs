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

import { services } from 'ask-sdk-model';

export interface ApiClient {
    post? : (uri : string, headers : Array<{key : string, value : string}>, body : string) => Promise<services.ApiClientResponse>;
    get? : (uri : string, headers : Array<{key : string, value : string}>) => Promise<services.ApiClientResponse>;
    put? : (uri : string, headers : Array<{key : string, value : string}>, body : string) => Promise<services.ApiClientResponse>;
    delete? : (uri : string, headers : Array<{key : string, value : string}>) => Promise<services.ApiClientResponse>;
}
