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
    RequestEnvelope,
    Response,
    ResponseEnvelope,
    services,
} from 'ask-sdk-model';
import {
    createAskSdkError,
    createAskSdkUserAgent,
    GenericRequestDispatcher,
    RequestDispatcher,
    Skill,
} from 'ask-sdk-runtime';
import { AttributesManagerFactory } from '../attributes/AttributesManagerFactory';
import { PersistenceAdapter } from '../attributes/persistence/PersistenceAdapter';
import { HandlerInput } from '../dispatcher/request/handler/HandlerInput';
import { ResponseFactory } from '../response/ResponseFactory';
import { CustomSkillConfiguration } from './CustomSkillConfiguration';
import ServiceClientFactory = services.ServiceClientFactory;
import ApiClient = services.ApiClient;

/**
 * Top level container for request dispatcher.
 */
export class CustomSkill implements Skill<RequestEnvelope, ResponseEnvelope> {
    protected requestDispatcher : RequestDispatcher<HandlerInput, Response>;
    protected persistenceAdapter : PersistenceAdapter;
    protected apiClient : ApiClient;
    protected customUserAgent : string;
    protected skillId : string;

    constructor(skillConfiguration : CustomSkillConfiguration) {
        this.persistenceAdapter = skillConfiguration.persistenceAdapter;
        this.apiClient = skillConfiguration.apiClient;
        this.customUserAgent = skillConfiguration.customUserAgent;
        this.skillId = skillConfiguration.skillId;

        this.requestDispatcher = new GenericRequestDispatcher<HandlerInput, Response>({
            requestMappers : skillConfiguration.requestMappers,
            handlerAdapters : skillConfiguration.handlerAdapters,
            errorMapper : skillConfiguration.errorMapper,
            requestInterceptors : skillConfiguration.requestInterceptors,
            responseInterceptors : skillConfiguration.responseInterceptors,
        });
    }

    /**
     * Invokes the dispatcher to handler the request envelope and construct the handler input.
     * @param requestEnvelope
     * @param context
     */
    public async invoke(requestEnvelope : RequestEnvelope, context? : any) : Promise<ResponseEnvelope> {
        if (this.skillId != null && requestEnvelope.context.System.application.applicationId !== this.skillId) {
            throw createAskSdkError(
                this.constructor.name,
                'CustomSkill ID verification failed!',
            );
        }

        const input : HandlerInput = {
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

        const response = await this.requestDispatcher.dispatch(input);

        const packageInfo = require('../../package.json');

        return {
            version : '1.0',
            response,
            userAgent : createAskSdkUserAgent(packageInfo.version, this.customUserAgent),
            sessionAttributes : requestEnvelope.session ? input.attributesManager.getSessionAttributes() : undefined,
        };
    }

    /**
     * Determines if the skill can support the specific request type.
     * @param input
     * @param context
     */
    public supports(input : any, context? : any) : boolean {
        return !!input.request;
    }
}
