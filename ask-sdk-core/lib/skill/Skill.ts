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
    ResponseEnvelope,
    services,
} from 'ask-sdk-model';
import { AttributesManagerFactory } from '../attributes/AttributesManagerFactory';
import { PersistenceAdapter } from '../attributes/persistence/PersistenceAdapter';
import { DefaultRequestDispatcher } from '../dispatcher/DefaultRequestDispatcher';
import { HandlerInput } from '../dispatcher/request/handler/HandlerInput';
import { RequestDispatcher } from '../dispatcher/RequestDispatcher';
import { ResponseFactory } from '../response/ResponseFactory';
import {
    createAskSdkError,
    createAskSdkUserAgent,
} from '../util/AskSdkUtils';
import { SkillConfiguration } from './SkillConfiguration';
import ServiceClientFactory = services.ServiceClientFactory;
import ApiClient = services.ApiClient;

/**
 * Top level container for request dispatcher.
 */
export class Skill {
    protected requestDispatcher : RequestDispatcher;
    protected persistenceAdapter : PersistenceAdapter;
    protected apiClient : ApiClient;
    protected customUserAgent : string;
    protected skillId : string;

    constructor(skillConfiguration : SkillConfiguration) {
        this.persistenceAdapter = skillConfiguration.persistenceAdapter;
        this.apiClient = skillConfiguration.apiClient;
        this.customUserAgent = skillConfiguration.customUserAgent;
        this.skillId = skillConfiguration.skillId;

        this.requestDispatcher = new DefaultRequestDispatcher({
            requestMappers : skillConfiguration.requestMappers,
            handlerAdapters : skillConfiguration.handlerAdapters,
            errorMapper : skillConfiguration.errorMapper,
            requestInterceptors : skillConfiguration.requestInterceptors,
            responseInterceptors : skillConfiguration.responseInterceptors,
        });
    }

    /**
     * Invokes the dispatcher to handler the request envelope and construct the handler input.
     * @param {RequestEnvelope} requestEnvelope
     * @param context
     * @returns {Promise<ResponseEnvelope>}
     */
    public async invoke(requestEnvelope : RequestEnvelope, context? : any) : Promise<ResponseEnvelope> {
        if (this.skillId != null && requestEnvelope.context.System.application.applicationId !== this.skillId) {
            throw createAskSdkError(
                this.constructor.name,
                'Skill ID verification failed!',
            );
        }

        const handlerInput : HandlerInput = {
            requestEnvelope,
            context,
            attributesManager : AttributesManagerFactory.init({
                requestEnvelope,
                persistenceAdapter : this.persistenceAdapter,
            }),
            responseBuilder : ResponseFactory.init(),
            serviceClientFactory : this.apiClient
                ? new ServiceClientFactory({
                    apiClient : this.apiClient,
                    apiEndpoint : requestEnvelope.context.System.apiEndpoint,
                    authorizationValue : requestEnvelope.context.System.apiAccessToken,
                })
                : undefined,
        };

        const response = await this.requestDispatcher.dispatch(handlerInput);

        return {
            version : '1.0',
            response,
            userAgent : createAskSdkUserAgent(this.customUserAgent),
            sessionAttributes : requestEnvelope.session ? handlerInput.attributesManager.getSessionAttributes() : undefined,
        };
    }
}
