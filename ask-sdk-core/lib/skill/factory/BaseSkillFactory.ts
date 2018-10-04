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
    IntentRequest,
    RequestEnvelope,
    Response,
} from 'ask-sdk-model';
import { RuntimeConfigurationBuilder } from 'ask-sdk-runtime';
import { CustomSkillErrorHandler } from '../../dispatcher/error/handler/CustomSkillErrorHandler';
import { CustomSkillRequestHandler } from '../../dispatcher/request/handler/CustomSkillRequestHandler';
import { HandlerInput } from '../../dispatcher/request/handler/HandlerInput';
import { CustomSkillRequestInterceptor } from '../../dispatcher/request/interceptor/CustomSkillRequestInterceptor';
import { CustomSkillResponseInterceptor } from '../../dispatcher/request/interceptor/CustomSkillResponseInterceptor';
import { CustomSkill } from '../CustomSkill';
import { CustomSkillConfiguration } from '../CustomSkillConfiguration';
import { BaseSkillBuilder } from './BaseSkillBuilder';

/**
 * Type definition of LambdaHandler which contains inputs received in lambda function.
 *  https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html.
 */
export type LambdaHandler = (
    requestEnvelope : RequestEnvelope,
    context : any,
    callback : (err : Error, result? : any) => void) => void;

export class BaseSkillFactory {
    public static init() : BaseSkillBuilder {
        const runtimeConfigurationBuilder = new RuntimeConfigurationBuilder<HandlerInput, Response>();
        let thisCustomUserAgent : string;
        let thisSkillId : string;

        return {
            addRequestHandler(
                matcher : ((input : HandlerInput) => Promise<boolean> | boolean) | string,
                executor : (input : HandlerInput) => Promise<Response> | Response,
                ) : BaseSkillBuilder {

                const canHandle = typeof matcher === 'string'
                    ? ({ requestEnvelope } : HandlerInput) => {
                        return matcher === (requestEnvelope.request.type === 'IntentRequest'
                                            ? (requestEnvelope.request as IntentRequest).intent.name
                                            : requestEnvelope.request.type);
                    }
                    : matcher;

                runtimeConfigurationBuilder.addRequestHandler(canHandle, executor);

                return this;
            },
            addRequestHandlers(...requestHandlers : CustomSkillRequestHandler[]) : BaseSkillBuilder {
                runtimeConfigurationBuilder.addRequestHandlers(...requestHandlers);

                return this;
            },
            addRequestInterceptors(...executors : Array<CustomSkillRequestInterceptor | ((input : HandlerInput) => Promise<void> | void)>) : BaseSkillBuilder {
                runtimeConfigurationBuilder.addRequestInterceptors(...executors);

                return this;
            },
            addResponseInterceptors(...executors : Array<CustomSkillResponseInterceptor | ((input : HandlerInput, response? : Response) => Promise<void> | void)>) : BaseSkillBuilder {
                runtimeConfigurationBuilder.addResponseInterceptors(...executors);

                return this;
            },
            addErrorHandler(
                matcher : (input : HandlerInput, error : Error) => Promise<boolean> | boolean,
                executor : (input : HandlerInput, error : Error) => Promise<Response> | Response,
                ) : BaseSkillBuilder {

                runtimeConfigurationBuilder.addErrorHandler(matcher, executor);

                return this;
            },
            addErrorHandlers(...errorHandlers : CustomSkillErrorHandler[]) : BaseSkillBuilder {
                runtimeConfigurationBuilder.addErrorHandlers(...errorHandlers);

                return this;
            },
            withCustomUserAgent(customUserAgent : string) : BaseSkillBuilder {
                thisCustomUserAgent = customUserAgent;

                return this;
            },
            withSkillId(skillId : string) : BaseSkillBuilder {
                thisSkillId = skillId;

                return this;
            },
            getSkillConfiguration() : CustomSkillConfiguration {
                const runtimeConfiguration = runtimeConfigurationBuilder.getRuntimeConfiguration();

                return {
                    ...runtimeConfiguration,
                    customUserAgent : thisCustomUserAgent,
                    skillId : thisSkillId,
                };
            },
            create() : CustomSkill {
                return new CustomSkill(this.getSkillConfiguration());
            },
            lambda() : LambdaHandler {
                const skill = new CustomSkill(this.getSkillConfiguration());

                return (event : RequestEnvelope, context : any, callback : (err : Error, result? : any) => void) => {
                    skill.invoke(event, context)
                        .then((response) => {
                            callback(null, response);
                        })
                        .catch((err) => {
                            callback(err, null);
                        });
                };
            },
        };
    }

    private constructor() {}
}
