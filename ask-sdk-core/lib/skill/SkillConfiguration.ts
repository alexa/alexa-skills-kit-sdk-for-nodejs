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

import { services } from 'ask-sdk-model';
import { PersistenceAdapter } from '../attributes/persistence/PersistenceAdapter';
import { ErrorMapper } from '../dispatcher/error/ErrorMapper';
import { HandlerAdapter } from '../dispatcher/request/handler/HandlerAdapter';
import { RequestInterceptor } from '../dispatcher/request/interceptor/RequestInterceptor';
import { ResponseInterceptor } from '../dispatcher/request/interceptor/ResponseInterceptor';
import { RequestMapper } from '../dispatcher/request/mapper/RequestMapper';

/**
 * An interfaces that represents the standard components needed to build {@link Skill}.
 */
export interface SkillConfiguration {
    requestMappers : RequestMapper[];
    handlerAdapters : HandlerAdapter[];
    errorMapper? : ErrorMapper;
    requestInterceptors? : RequestInterceptor[];
    responseInterceptors? : ResponseInterceptor[];
    persistenceAdapter? : PersistenceAdapter;
    apiClient? : services.ApiClient;
    customUserAgent? : string;
    skillId? : string;
}
