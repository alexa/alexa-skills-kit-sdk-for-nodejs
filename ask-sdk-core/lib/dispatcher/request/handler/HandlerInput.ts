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

import {
    RequestEnvelope,
    services,
} from 'ask-sdk-model';
import { AttributesManager } from '../../../attributes/AttributesManager';
import { ResponseBuilder } from '../../../response/ResponseBuilder';
import ServiceClientFactory = services.ServiceClientFactory;

/**
 * An interface that represents components passed into {@link CustomSkillRequestHandler} and {@link CustomSkillErrorHandler}.
 */
export interface HandlerInput {
    requestEnvelope : RequestEnvelope;
    context? : any;
    attributesManager : AttributesManager;
    responseBuilder : ResponseBuilder;
    serviceClientFactory? : ServiceClientFactory;
}
