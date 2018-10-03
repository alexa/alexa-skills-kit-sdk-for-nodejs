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

import { RequestEnvelope } from 'ask-sdk-model';

/**
 * An interface for storing and retrieving persistent attributes from persistence tier given request envelope.
 */
export interface PersistenceAdapter {
    getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>;
    saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>;
}
