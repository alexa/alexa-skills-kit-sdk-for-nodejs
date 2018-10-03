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

import { RequestHandler } from '../../../lib/dispatcher/request/handler/RequestHandler';

export class MockAlwaysFalseRequestHandler implements RequestHandler<string, string> {
    public canHandle(input : string) : boolean {
        return false;
    }

    public handle(input : string) : string {
        throw new Error('This line should never be reached!');
    }
}
