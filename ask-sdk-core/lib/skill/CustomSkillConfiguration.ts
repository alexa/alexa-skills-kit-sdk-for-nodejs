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
    Response,
    services,
} from 'ask-sdk-model';
import { RuntimeConfiguration } from 'ask-sdk-runtime';
import { PersistenceAdapter } from '../attributes/persistence/PersistenceAdapter';
import { HandlerInput} from '../dispatcher/request/handler/HandlerInput';

/**
 * An interfaces that represents the standard components needed to build {@link CustomSkill}.
 */
export interface CustomSkillConfiguration extends RuntimeConfiguration<HandlerInput, Response> {
    persistenceAdapter? : PersistenceAdapter;
    apiClient? : services.ApiClient;
    customUserAgent? : string;
    skillId? : string;
}
